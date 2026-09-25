import { DAYS } from './data'
import { PEOPLE } from './people'
import { keyDay, uniqDays } from './keys'
import { isScheduler } from './people'
import { HOOKS } from './hooks'
import { logEdit } from './editlog'
import { ridKey, posKey, ridWriteKey, ensureRowIds, RID_BOOK_VERSION } from './rowids'
import { canonicalDiff, canonicalUnits, digest } from './canonical'
import type { DeltaEntry, PendUnit } from './canonical'
import { INPUTS, inpId, inputCoversDate } from './inputs'
import { CURWEEK } from './waves'
import { groundOrder } from './order'
import { dayIso, verId, parseVerId, verSeq, verSeqLabel, isValidVerId } from './verid'
import { isPreservedWeek } from './weekstash'
import { inputProtected } from './quarantine'   // functions only both ways, so the import loop is safe
import { oilEvidence, oilEvidenceKey, oilSignKey, oilKeyNoMem, oilDecisionsKey, oilKeyBeforeStand, oilUpgradeMovedMoney } from './oilev'

/* the reference calls straight into the UI here; the engine routes those four
   calls through injected hooks (no-ops until the app provides them) so the
   bodies below stay verbatim */
const toast=(...a:any[])=>HOOKS.toast(...a);
const reflow=()=>HOOKS.reflow();
const histPush=()=>HOOKS.histPush();
const renderStatus=()=>HOOKS.renderStatus();
/* =====================================================================
   PUBLISH DAY (approve) + PUBLISH AL (amendment level, whole-schedule tint)
   ===================================================================== */
/* SCHED.pending  — keys edited since the last publish (no seq yet)
   SCHED.changes  — key -> per-day SEQ it was published under (drives the colour)
   SCHED.als      — every published amendment, newest last. Phase 2 shape: each
                    record is SINGLE-DAY and identified by its immutable verId —
                    {id, di, iso, seq, snap:{d,c,fil}, diff, sign}. `seq` is the
                    per-day display number (1 = AL1 …); `id` = verId(iso, seq) is
                    the key; `diff` (the canonical dayDelta at issue) REPLACES the
                    old `keys` list. There is no week-wide `n` any more.
   SCHED.dayOK    — {di:1} the days that have been published (approved) INDIVIDUALLY.
                    Approval is per day, not per week: Monday can be published and
                    flown while Thursday is still being built. The week banner is a
                    summary of this object, never the source of truth. There is no
                    SCHED.approved / SCHED.dirty any more — both are derived.
   SCHED.cur      — {di: verId} which version each day is CURRENTLY showing (the
                    Original is verId(iso,0)). Stamped by alIssue; read through
                    dayCurVer(), which self-heals when the stamped version's
                    snapshot has gone (undo past the issue).                   */
/* `ridV` stamps the addressing-by-rid book format (engine/rowids.ts). A book
   restored from a persisted snapshot WITHOUT it is foundation-era and is migrated
   once at load (migrateLegacyIds); a fresh/modern book carries it, so it is never
   re-migrated. `amV` stamps the Phase-2 amendment-record format (§5, P2-05); a
   book WITHOUT it that still carries publication content is a PRE-Phase-2 book the
   new verId resolvers cannot re-key — see amFormatOf below. */
export const AMBOOK_VERSION=1;
export let SCHED:any={al:0, pending:{}, changes:{}, added:{}, als:[], dayOK:{}, sign:{}, signBind:{}, orig:{}, cur:{}, ridV:RID_BOOK_VERSION, amV:AMBOOK_VERSION, retired:{}, correcting:{}};
/* [GLOBAL-UNDO] §6.1 — `retired` is the APPEND-ONLY issuance log: every issued
   version, once retracted by an unpublish, is kept here as its own immutable
   snapshot, keyed `<verId>~<n>` (n = 1,2… per id, so a same-label reissue never
   collapses the prior one). Read only by the history panel — never by
   daySnapIn/dayVersions/nextSeq/issuedIdSet — so same-label reissue falls out of
   the existing resolvers. `correcting[di]` = a verId flag set by sched.unpublish
   that lets publishALDay/the button reissue the SAME label even on an EMPTY delta
   (a pure round-trip correction), cleared on reissue (§6.1 GU5-001). */
/* Reset ALL of SCHED in place. Every field is keyed by day INDEX (0..6), so
   loading a different week without this would let one week's approvals, pending
   edits, AL colouring and per-day drafts bleed onto the next week's identical
   indices. In-place (not reassign) to match histApply's style and keep any held
   reference valid. The ONE seam a future per-week publish store would hook into
   (state/store.ts:loadWeek calls it). */
export function resetSched(){
  SCHED.al=0; SCHED.pending={}; SCHED.changes={}; SCHED.added={};
  SCHED.als=[]; SCHED.dayOK={}; SCHED.sign={}; SCHED.signBind={}; SCHED.orig={};
  SCHED.cur={}; SCHED.drafts={}; SCHED.curDraft={};
  SCHED.retired={}; SCHED.correcting={};   // [GLOBAL-UNDO] §6.1 — per-week, index-keyed like the rest
  SCHED.ridV=RID_BOOK_VERSION;   // a fresh book is modern — never re-migrated
  SCHED.amV=AMBOOK_VERSION;      // and carries the Phase-2 amendment-record format
}
/* ---- Phase 2: legacy-format isolation — the ONE shared classifier (P2-05) ----
   A book PERSISTED by a PRE-Phase-2 build carries the old shape (cur:'orig'|n,
   als:[{n,keys,…}]) and NO amV stamp. The new verId resolvers already return
   null for it (so publication is naturally suppressed and the OIL wire falls back
   to the raw stashed days — credits stand, never deleted), and it round-trips
   byte-for-byte because SCHED holds it verbatim and persistAll re-serializes it
   as-is. This classifier makes that isolation EXPLICIT so no NEW edit is accepted
   onto data the engine cannot safely re-key: an unsupported week is READ-ONLY.
   Full migration to the new shape is Phase 5. */
/* every published record's identity BELONGS to the outer week key: its verId's
   ISO date must be that day in `weekKey`. A book self-consistent internally but
   filed under the WRONG week (P2-REREVIEW-04) fails this — its resolvers reject
   the foreign dates, so it must be quarantined + byte-preserved, not left
   editable and silently re-saved. Only a DEFINITE mismatch (a valid verId whose
   iso is wrong) fails; a malformed/absent id is left to the resolver. */
function recordsBelongToWeek(sc:any,weekKey:any):boolean{
  const orig=sc.orig||{};
  for(const di of Object.keys(orig)){const o=orig[di];
    if(o&&o.id&&isValidVerId(o.id)&&parseVerId(o.id).iso!==dayIso(weekKey,+di))return false;}
  for(const a of (sc.als||[])){
    if(a&&a.id&&isValidVerId(a.id)&&parseVerId(a.id).iso!==dayIso(weekKey,+a.di))return false;}
  return true;
}
export function amFormatOf(sc:any,weekKey?:any){
  if(!sc)return 'current';
  const has=(o:any)=>!!o&&Object.keys(o).length>0;
  const hasContent=(sc.als&&sc.als.length)||has(sc.orig)||has(sc.cur);
  if(sc.amV===AMBOOK_VERSION){
    /* a STAMPED current-format book is 'current' — UNLESS it carries publication
       content whose identity does not belong to the week it is filed under (a
       wrong-week book, P2-REREVIEW-04). weekKey is optional: an identity-only
       classification (no key threaded) keeps the old "stamped ⇒ current" reading. */
    if(weekKey!=null&&hasContent&&!recordsBelongToWeek(sc,weekKey))return 'unsupported';
    return 'current';
  }
  /* no stamp → unsupported ONLY if it actually carries publication content; an
     empty book has nothing to misread and is a fresh book (treated as current). */
  return hasContent?'unsupported':'current';
}
/* the LIVE loaded week is protected (read-only) when its book is unsupported —
   checked against CURWEEK so a wrong-week book is caught too (P2-REREVIEW-04) —
   OR when the week is byte-PRESERVED (P2-REV2-01): a DAMAGED saved week (a stash
   that would not parse, or parsed without a days array) loads the seed as a
   placeholder VIEW, so amFormatOf(SCHED) reads that seed as 'current' — but its
   original bytes are retained in the preserved registry and must never be
   overwritten or edited. isPreservedWeek is set for BOTH the unsupported and the
   unreadable case (state/store.ts applyWeekModel), so this one term makes the
   loaded damaged week read-only just like an unsupported one. */
export function protectedWeek(){return amFormatOf(SCHED,CURWEEK)==='unsupported'||isPreservedWeek(CURWEEK);}
/* Phase 2 (P2-IMPL-04): a PRE-Phase-2 book saved EMPTY (a parked draft with no
   publication content) classifies as 'current' and stays editable — but it has no
   amV stamp, so the instant it gains content (its first approve/AL) it would
   re-classify as 'unsupported' and go read-only. Stamp the format version at the
   publish path so a validated, currently-supported book stays supported once it
   holds content. A content-bearing legacy/unknown book is already 'unsupported'
   here, so the guard leaves it unstamped — the quarantine holds. */
function stampAmFormat(){if(amFormatOf(SCHED)==='current')SCHED.amV=AMBOOK_VERSION;}
export function dayApproved(di:any){return !!SCHED.dayOK[di];}
export function approvedDays(){return DAYS.map((_:any,i:any)=>i).filter(dayApproved);}
export function dowShort(di:any){return String((DAYS[di]||{}).dow||('day '+di)).slice(0,3);}
export function daysLabel(list:any){return list.length?list.map(dowShort).join(', '):'—';}
/* An AL is a document that went out — now a SINGLE day, so its "days" is just
   [di]. What was ISSUED is frozen on the record (the `diff` and the `snap`) and
   never recalculated; the live keys still drive the marks on screen. */
export function alDays(rec:any){ if(!rec)return []; return rec.di!=null?[+rec.di]:[]; }
/* the item count is frozen on the record at issue (§3 — never from a live key list a later
   delete could shrink). Since D109 (25 Sep 26) it is counted in the same unit "N pending" was
   (`units`, stored by alIssue — a man moved is one item, not two cells); a record issued before
   that falls back to its diff's length. */
export function alCount(rec:any){return !rec?0:rec.units!=null?+rec.units:rec.diff?rec.diff.length:0;}
/* the per-day sequence numbers this day has issued, ascending (1 = AL1 …). */
export function dayALs(di:any){di=+di;return SCHED.als.filter((a:any)=>+a.di===di).map((a:any)=>+a.seq).sort((a:any,b:any)=>a-b);}
/* per-kind counts off a frozen canonical diff — for the AL history and the
   pending summary (kinds: add | delete | change | move | input). */
export function diffCounts(diff:any){const d=diff||[];const by=(k:any)=>d.filter((e:any)=>e.kind===k).length;
  return {total:d.length,add:by('add'),del:by('delete'),chg:by('change'),mov:by('move'),inp:by('input'),oil:by('oil')};}
/* the verId a day is currently showing. The stamped cur[di] counts only while
   its snapshot still resolves; otherwise fall back to the NEWEST surviving issue
   for this day by per-day SEQ, then the Original, then null (never published).
   This derivation IS the orphan guard: a stale SCHED.cur entry after an undo
   past the issue is inert, no cleanup pass exists.
   PARAMETERIZED 29 Aug 26 (one body, two callers — the forward-trace precedent):
   the *In forms take any SCHED-shaped object {cur,als,orig,drafts}, which is how
   the Leave War OIL wire reads publish state out of a STASHED week's snapshot
   (state/store.ts weekStashSnap carries these under schedFields' short keys)
   without loading that week; the bare forms are the live-SCHED wrappers every
   existing caller keeps using. The optional `weekKey` is the trusted week
   identity threaded into the identity/week validation (§1) — CURWEEK on the
   live path, the stash's own key on the OIL stash path. */
export function dayCurVerIn(sc:any,di:any,weekKey?:any){di=+di;
  const v=((sc&&sc.cur)||{})[di];
  if(v!=null&&daySnapIn(sc,di,v,weekKey))return v;
  /* fall back to the NEWEST surviving issue for this day, by per-day SEQ (each
     record is single-day now, so `a.di===di` picks this day's versions). Every
     candidate is re-validated through daySnapIn, so the identity + week-key
     checks (§1, P2-R2-05/P2-R3-03) guard the fallback too. */
  /* iterate this day's issued records by DESCENDING seq and return the HIGHEST
     that VALIDATES through daySnapIn — a higher-seq record filed under the wrong
     week / an inconsistent identity is skipped in favour of a valid lower AL, not
     abandoned to the Original (P2-IMPL-12). */
  const cands=((sc&&sc.als)||[]).filter((a:any)=>a&&+a.di===di&&a.snap&&a.snap.d).sort((a:any,b:any)=>+b.seq-+a.seq);
  for(const a of cands){ if(daySnapIn(sc,di,a.id,weekKey))return a.id; }
  const o=((sc&&sc.orig)||{})[di];
  return (o&&o.id&&daySnapIn(sc,di,o.id,weekKey))?o.id:null;}
export function dayCurVer(di:any){return dayCurVerIn(SCHED,di,CURWEEK);}
export function dayPendCount(di:any){return Object.keys(SCHED.pending).filter((k:any)=>keyDay(k)===di).length;}
/* THE ONE COUNT a person reads as a day's unpublished changes (register AM23, [HUMAN-RETEST]
   the amendment system, 24 Sep 26). On a PUBLISHED day it is the canonical delta against the
   issued version — the same authority as publish eligibility — never the raw pending marks: a
   change with no cell (what the day earns, an input filing) raises no mark, and a filing round
   trip can leave an inert one behind, so a raw count read "nothing unpublished" beside a
   "Publish AL1" button, or an edit that is not there. On a never-published day the draft marks
   ARE the count. The day head, the ⓘ day panel and the plan-switch message all read this. */
export function dayShownPendCount(di:any){di=+di;return dayApproved(di)?dayPendingItems(di).length:dayPendCount(di);}
/* THE ONE COUNTING BODY (owner, D109, 25 Sep 26 — "A move counts as one"). The same comparison
   publication uses (the live day against the CURRENT issued version: the canonical diff, the
   input-filing axis, the OIL axis — dayDeltaIn below), counted in the unit a person counts in:
   a man or a placeholder taken off one place and put on another of the same day is ONE item,
   where the record holds two cells (canonical.ts canonicalUnits). EVERY count reads this — the
   day head's "N pending", the ⓘ panel, the plan-switch message, the sign-off line's "N changes
   to publish", the Amendments panel, the publish message, the stored AL's item count, the load's
   "Discard N edits" (content only) and the pending list itself, whose rows ARE these items — so
   no two of them can disagree. It is empty exactly when dayDelta is (canonicalUnits' invariant),
   so eligibility (dayHasChanges) and the count can never read "0 pending" beside a Publish button.
   What goes out — the stored diff — and the marks on screen are unchanged (D109). */
/* `inp`: a request's filing that belongs to this row's add / delete — the one act of taking a request off (or putting
   it on) the programme (owner, D114, 25 Sep 26: "6 yes"). The record keeps both entries; the person counts one. */
export type PendItem = PendUnit & { axis: 'content'|'filing'|'oil', inp?: DeltaEntry };
export function dayPendingItemsIn(sc:any,di:any,weekKey?:any):PendItem[]{di=+di;
  if(!((sc&&sc.dayOK)||{})[di])return [];
  const ver=dayCurVerIn(sc,di,weekKey), snap=ver!=null?daySnapIn(sc,di,ver,weekKey):null;
  if(!snap||!snap.d)return [];
  const items:PendItem[]=canonicalUnits(snap.d,DAYS[di],di).map((u:any)=>({...u,axis:'content'}));
  /* A REQUEST'S ROW AND ITS FILING ARE ONE ACT (owner, D114, 25 Sep 26). ✕ on an accepted request's row removes the
     row AND reads the request "taken off"; accepting one onto the day adds the row AND reads it "on the programme". The
     filing pairs with the ground row whose src is that request — removed from the issued day while the request leaves
     'g', or added to the live day while it arrives at 'g' — so the pair is ONE item. A filing with no such row here (a
     request filed under Unavailable, one whose row stands on another day) stays its own item. */
  const grow=(u:any,d:any)=>{const m=/^gr:\d+\.(\d+)\.prog$/.exec(String((u.entry&&u.entry.addr)||''));return m?((d&&d.ground)||[])[+m[1]]||null:null;};
  filingDelta(di,snap.fil).forEach((e:any)=>{
    const id=String(e.addr||'').split('.').slice(1).join('.');
    const pair=items.find((u:any)=>!u.inp&&u.axis==='content'&&(
      (u.kind==='delete'&&e.from==='g'&&e.to!=='g'&&(grow(u,snap.d)||{}).src===id)||
      (u.kind==='add'&&e.to==='g'&&e.from!=='g'&&(grow(u,DAYS[di])||{}).src===id)));
    if(pair){pair.inp=e;return;}
    items.push({kind:'input',addr:'',jump:[],keys:[],entry:e,axis:'filing'});});
  oilDelta(di,snap.d).forEach((e:any)=>items.push({kind:'oil',addr:'',jump:[],keys:[],entry:e,axis:'oil'}));
  return items;}
export function dayPendingItems(di:any):PendItem[]{di=+di;return passMemo('pi',di,()=>dayPendingItemsIn(SCHED,di,CURWEEK));}
/* the per-kind split of a day's items, the shape diffCounts gives a stored diff — for the
   Amendments panel's "N changes · N removals · N reorders · N input filings" */
export function itemCounts(items:any){const d=items||[];const by=(k:any)=>d.filter((e:any)=>e.kind===k).length;
  return {total:d.length,add:by('add'),del:by('delete'),chg:d.length-by('add')-by('delete')-by('move')-by('input')-by('oil'),mov:by('move'),inp:by('input'),oil:by('oil')};}
/* the marks "Discard marks" may clear: those on days never published (F-01 — a published day's
   divergence is published or put back, never silently dropped). The Amendments panel enables
   its button off this, so it is never offered when it could clear nothing (walk S2). */
export function discardableCount(){const orig=SCHED.orig||{};return Object.keys(SCHED.pending).filter((k:any)=>!orig[keyDay(k)]).length;}
export function pendDays(){return uniqDays(Object.keys(SCHED.pending));}
/* pending edits only become publishable amendments once their day is published —
   changes to a day that is still draft are just draft work, not an amendment */
export function publishableKeys(){return Object.keys(SCHED.pending).filter((k:any)=>dayApproved(keyDay(k)));}
export function setDayApproved(di:any,on:any){
  di=+di;
  /* READ-ONLY QUARANTINE (P2-REV2-03): an unsupported / wrong-week book is frozen.
     First-publishing a day stamps SCHED.orig/dayOK and the preserved-blob
     writeback would then discard them on reload — a silent lost publish. Refuse
     at the entry, before the signed/no-op checks below, so the quarantine is the
     first word. Unsupported ≠ unresolvable: this is checked by the WEEK key
     (protectedWeek → amFormatOf(SCHED,CURWEEK)), not by whether verIds resolve. */
  if(on&&protectedWeek())return toast(`${(DAYS[di]||{}).dow||'This day'} is locked — it was published by an older version and can’t be amended here`);
  /* Phase 2 (§9): a published day can NEVER be un-approved — the reopen "beak"
     lost its un-publish job. This path only ever FIRST-approves a draft day;
     changing a published day means editing its working draft and publishing the
     next AL. An `on=false` (or a repeat approve) is a no-op. */
  if(!on||SCHED.dayOK[di])return;
  /* MINT THE ROW IDS BEFORE ANYTHING READS THE DAY (Fable, 21 Sep 26). §9.3
     promises publication freezes exactly the value the signature was validated
     against, and every OIL decision is addressed by a row id — so a row that
     reached here without one would be compared and signed under one address and
     frozen under another. daySnap mints on its way past, which is AFTER
     daySigned and dayDelta have already read the day. Every production add path
     mints before this point, so no reachable case was found; the mint is
     idempotent and costs one walk, which is cheaper than relying on that. */
  ensureRowIds(DAYS);
  if(!daySigned(di))return toast(`${DAYS[di].dow} needs ${signMissing(di).join(', ')} before it can be published`);
  stampAmFormat();   // first publish of a validated empty pre-Phase-2 draft keeps it 'current' (P2-IMPL-04)
  /* the day goes out AS IT STANDS. Everything pending on it up to this moment
     is the draft build, not an amendment to something previously issued —
     leaving those marks meant the day's first AL re-issued the whole day and
     claimed to have "changed" every field the schedulers had ever typed. */
  Object.keys(SCHED.pending).forEach((k:any)=>{if(keyDay(k)===di)delete SCHED.pending[k];});
  Object.keys(SCHED.added||{}).forEach((k:any)=>{if(keyDay(k)===di)delete SCHED.added[k];});
  /* WHO SIGNED THE ORIGINAL IS KEPT, as an amendment's record keeps its four (owner, D95 + D102, 25 Sep 26 — the
     Signed line names who signed each published version, the Original included). It used to be cleared unkept by
     the signClear below, so nothing anywhere could say who approved a day's first issue. Read BEFORE the clear,
     in the same shape alIssue stores (sign:{[di]:{cur,sked,plan,appr}}, callsigns). */
  const origSign=signNames(di);
  SCHED.dayOK[di]=1; signClear(di);          // the signature is spent on the issue
  /* Original = the day as FIRST published, per-day sequence 0. Its immutable
     verId (dayIso#0) is what the resolvers name it by, and cur is stamped to it
     so the day now shows its Original. Frozen forever once issued. */
  SCHED.orig=SCHED.orig||{};
  const iso=dayIso(CURWEEK,di);
  SCHED.orig[di]={id:verId(iso,0),...daySnap(di),sign:{[di]:origSign}};
  SCHED.cur=SCHED.cur||{}; SCHED.cur[di]=verId(iso,0);
  if(SCHED.correcting)delete SCHED.correcting[di];   // [GLOBAL-UNDO] §6.1 — reissuing the Original closes any correction
  reflow(); histPush();
  toast(`${DAYS[di].dow} published — APPROVED`);
}
/* Phase 2 (§9) removed reissueReopened: a published version is FROZEN — it is
   never re-issued in place. A reopen no longer exists; changing a published day
   is always a NEW AL that supersedes the old, which stays immutable in history. */
/* ---- per-day version snapshots -------------------------------------------
   A snapshot is the frozen day plus ITS slice of the changes map, taken at the
   moment of issue — it reproduces the day "as issued, wearing its marks". An AL
   snapshot lives ON the AL record (rec.snap = {d,c,fil}) and the Original in
   SCHED.orig, so both ride the undo stack with the state they belong to.
   CORRECTED 17 Sep 26: the old line here said none of this persists past the
   session. It does. SCHED.orig and SCHED.als ride schedFields(), which
   weekStashSnap() serialises into the week's `weeks/<wk>` record, so on a built
   site the Originals and the whole AL list come back after a reload. Memory-only
   is the dev/test path (MemoryBackend). See CLAUDE.md, WHAT ACTUALLY PERSISTS. */
export function daySnap(di:any){di=+di;
  /* "one walk before every baseline and SNAPSHOT" (engine/rowids.ts) — stated
     as the contract, but only histPush/loadWeek actually ran it, so a row
     created and published inside one turn could be frozen with no identity. It
     matters now because the OIL evidence addresses every item by `rid`
     ([OIL-AUTO-REMOVE] §7.4): an id-less row would freeze a decision-less,
     sentinel-less item and quietly earn nobody anything. Idempotent, never
     printed, so parity is untouched. */
  ensureRowIds(DAYS);
  const c:any={}; Object.keys(SCHED.changes).forEach((k:any)=>{if(keyDay(k)===di)c[k]=SCHED.changes[k];});
  const d=JSON.parse(JSON.stringify(DAYS[di]));
  /* THE OIL EVIDENCE IS FROZEN HERE, and only here ([OIL-AUTO-REMOVE] §7.1/§9.3).
     It rides the day COPY, so the issued document carries its own answer to what
     earns — the credit pass reads snap.d and needs nothing live — while the
     working copy never stores one and cannot go stale. Every clone of a snapshot
     back onto the live day (engine/drafts.ts) strips it for the same reason.
     It is the candidate computed from the day AS IT STANDS AT THIS INSTANT,
     which is the one the signature was validated against: publishALDay checks
     the signatures and takes this snapshot in one synchronous step, and nothing
     between them writes DAYS or INPUTS (alIssue moves SCHED marks only). */
  d.oilev=oilEvidence(di);
  return {d,c,fil:dayFilingFingerprint(di)};}
/* ---- Phase 2: the FILING FINGERPRINT (P2-R3-01 / P2-R4-01) ------------------
   The publication delta has a fourth axis — input filings — that day content
   does NOT carry: filing an input changes INPUTS.acc, not DAYS. To detect a
   filing change against the issued version WITHOUT trusting the live `inp:`
   pending mark (which survives a file-then-unfile) and WITHOUT depending on live
   INPUTS after navigation (store.ts clears acc), each issued snapshot freezes a
   fingerprint: per input covering this day's date, its acc state. FOUR distinct
   states — 'u' filed-unavailable, 'g' accepted-ground, 'r' removed/dormant, and
   '' fresh/unfiled — because a fresh input still flags conflicts while a 'r' one
   is dormant, so absent→u→r is a real change even though DAYS is unchanged. This
   is NOT AM-04's freezing of full input VALUES/identities into content. */
export function dayFilingFingerprint(di:any):any{di=+di;
  const dt=(DAYS[di]||{}).dt, fil:any={};
  if(dt==null)return fil;
  (INPUTS||[]).forEach((inp:any)=>{ if(inputCoversDate(inp,dt))fil[inpId(inp)]=inp.acc||''; });
  return fil;}
/* a STABLE string of the day's filing state, so a signature can bind to the filing
   axis too (owner, 15 Sep 26 — Codex PSF-001). A filing-only change (an Other input
   filed under Unavailable, a leave accepted onto the date) is counted by dayDelta but
   leaves DAYS[di]'s digest untouched, so before this it could publish an AL on stale
   signatures and never cleared the sign-offs. Empty acc == absent, matching
   filingDelta's round-trip rule, so a no-op filing round trip does not invalidate. */
export function filingKey(di:any):string{const f=dayFilingFingerprint(di);
  return Object.keys(f).filter((k:any)=>f[k]).sort().map((k:any)=>`${k}=${f[k]}`).join(';');}
/* the filing axis: entries for any input whose frozen state differs from now.
   A same-actual-state round trip (r→u→r) is a no-op; absent→u→r is a delta. */
function filingDelta(di:any,issuedFil:any):DeltaEntry[]{
  const now=dayFilingFingerprint(di), was=issuedFil||{}, out:DeltaEntry[]=[];
  const ids=new Set([...Object.keys(now),...Object.keys(was)]);
  ids.forEach((id:any)=>{ const a=was[id]||'', b=now[id]||''; if(a!==b)out.push({addr:`inp:${di}.${id}`,kind:'input',from:a,to:b}); });
  return out;}
/* THE OIL EVIDENCE AXIS ([OIL-AUTO-REMOVE] §7.2 / §9.2). A mark on the day
   record is snapshot-able but NOT publishable on its own: canonicalContent is
   built from an EXPLICIT field enumeration (restore.ts dayKeys), and
   canonicalDiff ignores an address that newly appears or disappears unless
   rowKeyOf recognises its owning row — which it cannot, because the OIL block
   owns no row. Without this axis a scheduler could mark an item on a published
   day, get no amendment, and have no way to publish the mark at all, while the
   pass kept reading the older issued snapshot that does not carry it: marked
   forever, never in force.
   So the WHOLE block serialises to ONE always-present value under ONE synthetic
   per-day address. Always present, so it is always compared; deterministic, so
   an unchanged block is byte-identical. No key ever appears or disappears.
   An ABSENT issued block normalises to '' — the same as "nothing decided,
   everything earns" — so the FIRST change against an older snapshot is detected
   rather than read as no change. */
/* BOTH SIDES ARE KEYED WITH THEIR OWN DAY (Codex rank 4, 22 Sep 26). A block
   frozen before `stand` existed carries no standing, and the only honest place
   to recover it is the frozen SCHEDULE beside it — so the issued day goes in,
   not merely its block. Guessing it from `acc` made a cancelled row key
   `active` on the issued side and `cx` live, which offered an amendment on a
   day the money already agreed was unchanged. */
function oilDelta(di:any,issuedDay:any):DeltaEntry[]{
  const w=(issuedDay||{}).oilev;
  /* CAN THE TWO SIDES BE COMPARED ON MEMBERSHIP AT ALL ([OIL-SEATS-CAN-EARN]
     step 9b)? Only where the issued side actually recorded it. A block frozen
     before membership was kept on every day recorded NONE on a day that earns
     nothing — reading that absence as "the crowd changed" would offer an
     amendment nobody made, on every already-published weekday carrying a puck.
     That is the manufactured-amendment shape this branch has now met three
     times, and it is cheaper to refuse the comparison than to explain it.
     An older EARNING block did record membership, so it is still compared on
     it — that signal is real and predates this step. */
  const mem=!!(w&&(w.mem||w.earns));
  const now=oilEvidenceKey(oilEvidence(di),DAYS[+di],mem), was=oilEvidenceKey(w,issuedDay,mem);
  return now===was?[]:[{addr:`oil:${+di}`,kind:'oil',from:was,to:now}];}
/* ---- Phase 2: the ONE normalized publication delta (F-02) ------------------
   Eligibility, the panel counts and the stored diff ALL derive from this — never
   from the accumulated pending marks. Compares the live day against the CURRENT
   issued version (dayCurVerIn/daySnapOf). A never-published day has no issued
   baseline, so its delta is empty (publishing it is the first approve, not an AL).
   Parameterized on a SCHED-shaped object so the same body serves a stashed week
   (the Leave War OIL wire's read) as well as the live book. */
export function dayDeltaIn(sc:any,di:any,weekKey?:any):DeltaEntry[]{di=+di;
  if(!((sc&&sc.dayOK)||{})[di])return [];
  const ver=dayCurVerIn(sc,di,weekKey), snap=ver!=null?daySnapIn(sc,di,ver,weekKey):null;
  if(!snap||!snap.d)return [];
  return canonicalDiff(snap.d,DAYS[di],di).concat(filingDelta(di,snap.fil)).concat(oilDelta(di,snap.d));}
export function dayDelta(di:any):DeltaEntry[]{di=+di;return passMemo('dd',di,()=>dayDeltaIn(SCHED,di,CURWEEK));}
/* ONE REPAINT READS EACH DAY'S COMPARISON ONCE (Fable F9, 25 Sep 26 — measured: five published days signed through
   the app's selects cost one edit ~116 ms more at the phone's 4× slowdown, because D103's binding reads the whole
   pending comparison and a day's head, sign-off line and marker each asked for it several times). Inside
   publishReadPass — the day and board string builders, which write nothing — the canonical comparison, the counting
   items and the signature binding are worked out once per day and reused; keyed by the day OBJECT as well, so a
   preview's snapshot swap (withDaySnap replaces DAYS[di]) can never read the live day's answer, or the reverse.
   Outside a pass every call computes afresh, exactly as before. The same shape as oilev.ts oilReadPass. */
let PUB_PASS:Map<string,{d:any,v:any}>|null=null;
export function publishReadPass<T>(fn:()=>T):T{const outer=PUB_PASS; if(!outer)PUB_PASS=new Map();
  try{return fn();}finally{if(!outer)PUB_PASS=null;}}
function passMemo<T>(kind:string,di:number,calc:()=>T):T{
  if(!PUB_PASS)return calc();
  const k=kind+di, hit=PUB_PASS.get(k);
  if(hit&&hit.d===DAYS[di])return hit.v;
  const v=calc(); PUB_PASS.set(k,{d:DAYS[di],v}); return v;}
/* the publish trigger + every publication affordance (P2-02/P2-07): a published
   day has changes iff its normalized delta is non-empty. Derived SOLELY from
   dayDelta — the one authority for eligibility, the panel counts and the stored
   diff (F-02). The old digest fast-path is gone (P2-IMPL-07): the positional
   digest flips on a reorder whose EFFECTIVE display order is unchanged (a ground
   move a gman/time-sort compensates), which enabled a zero-change AL the panel
   then offered no way to publish. dayDelta already gates on dayApproved + a
   resolvable issued snapshot, so this reads straight through it. */
export function dayHasChanges(di:any):boolean{di=+di;return dayDelta(di).length>0;}
/* THE "NOT YET SIGNED" MARKER (published-schedule flagging, §6/§14.5). Shown to
   EVERYONE on a published day whose live working copy diverges from its signed
   version — i.e. an unpublished amendment exists. Derived from the canonical delta
   (dayHasChanges), NEVER from SCHED.pending marks (which survive a file-then-unfile
   round trip), and MUST be read on the LIVE day, before any withDaySnap swap (inside
   the swap the day diffs against itself and reads clean). A never-published day has
   no signed version to diverge from, so the marker is a published-day thing only. */
export function notYetSigned(di:any):boolean{di=+di;return dayApproved(di)&&dayHasChanges(di);}
/* the number of unpublished edits a "Load onto working copy" would DISCARD — the
   count the recovery confirm shows and the recovery handler acts on. ONE authority
   (P2-IMPL-09): the two button renderers (ui/html.ts week, ui/SchedBoard.tsx board)
   and the handler (ui/interactions.ts) all read this, so the confirmed number and
   the discarded number can never drift, and none of them re-derives it from a live
   pending count (which a canonical-only change leaves at 0, and which withDaySnap
   zeroes during a preview render). MUST be read on the LIVE day, before any
   withDaySnap swap. */
export function dayDiscardCount(di:any):number{di=+di;
  /* CONTENT ONLY — the count of working-draft edits that "Load onto working copy"
     actually DISCARDS. Recovery replaces DAYS (content) but NOT the global input
     filing state, so the filing axis must be EXCLUDED here or the confirm claims
     to discard a filing change it then leaves in place (P2-REREVIEW-08). Publish
     eligibility (dayHasChanges/dayDelta) still counts filing — that IS a real
     divergence — but it is retained across a recovery, not discarded. */
  if(!dayApproved(di))return 0;
  const ver=dayCurVer(di), snap=ver!=null?daySnapOf(di,ver):null;
  if(!snap||!snap.d)return 0;
  /* the DECISIONS half of the OIL block is day content — a recovery replaces it
     with the snapshot's, so it counts here. The DERIVED half (the input
     projection, the frozen sentinel membership) is not: recovery re-derives it
     from the live inputs and roster, exactly as the filing axis is retained. */
  const decDrop=oilDecisionsKey((DAYS[di]||{}).oild)!==oilDecisionsKey((snap.d||{}).oild)?1:0;
  /* counted in the ONE unit (D109): a man moved is one edit here too, as on the day head — and, since the load puts
     back what the version had filed (D98, drafts.ts loadVersionToWorkingCopy), each request filing it will put back
     is an edit it replaces too (the filing axis was excluded while the load left filings alone, P2-REREVIEW-08).
     Only those it CAN put back: one it must leave (it also covers another published day, or its row is landed
     elsewhere) is not replaced, so it is not counted. */
  return canonicalUnits(snap.d,DAYS[di],di).length+decDrop+filingRestorePlan(di,snap.fil,snap.d).put.length;}
/* WHAT A LOAD CAN PUT BACK OF A VERSION'S FILINGS (owner, D98, 25 Sep 26 — "if the change results in going back to the
   same as the published schedule … it shouldnt show as pending"). For every request covering this day: the state
   the version froze (`fil`, snapshot's filing fingerprint; absent = fresh), set only where it can be true without
   moving anything else — a request's filing is ONE value for every day it covers (INPUTS.acc), and loading one day
   must never change another (AM1; Fable F3, Astra 3):
     · "on the programme" ('g') only where its row is on a loaded day — the load has just put the version's rows back;
     · never away from 'g' while its row stands on a loaded day (a request accepted onto another day stays there);
     · never for a request that covers ANOTHER loaded day at all — its one filing value is that day's too.
   Returns what to set (`put`) and what must be left as filed (`left`, by input id) — the load says so. Pure; the
   load applies it (drafts.ts), and the discard count above counts it, so the confirm and the load agree. `dayAfter`
   is this day as the load will leave it (the version's content) — the discard count asks BEFORE the load, when the
   row it will put back is not on the live day yet; the load itself asks after, with the day already replaced. */
export function filingRestorePlan(di:any,fil:any,dayAfter?:any):{put:Array<{inp:any,want:string}>,left:string[]}{di=+di;
  const dt=(DAYS[di]||{}).dt, put:any[]=[], left:string[]=[];
  if(dt==null)return {put,left};
  (INPUTS||[]).forEach((inp:any)=>{
    if(!inputCoversDate(inp,dt))return;
    const id=inpId(inp), want=String(((fil||{})[id])||''), cur=String(inp.acc||'');
    if(cur===want)return;
    if(inputProtected(inp))return;   // a quarantined week's request is never touched — in the one plan both callers read (Fable's read, #2)
    const has=(d:any)=>((d&&d.ground)||[]).some((g:any)=>g&&g.src===id);
    const landed=DAYS.some((d0:any,j:number)=>has((j===di&&dayAfter)?dayAfter:d0));
    if(want==='g'?!landed:landed){left.push(id);return;}
    /* the version's OWN row for it stands on this very day: "on the programme" is then the fact, whatever other day the
       request also covers — leaving it "taken off" beside its standing row would be the dangling state P2-REV2-05
       forbids the other way round, and the next AL would freeze it (Fable's code read, #1). The other day reads it too;
       the load names that (LOADMOVED). */
    if(want==='g'&&has((dayAfter||DAYS[di]))){put.push({inp,want});return;}
    /* a request's filing is ONE value for every day it covers, so changing it changes every other loaded day it
       covers too — their pending count, their flags, a waiting change on their working copy (walker B3, 25 Sep 26:
       comparing only with the other day's ISSUED state let a load of Monday silently clear Tuesday's waiting change).
       One day's load never moves another day (AM1): such a request is left as filed, and the load says so. */
    if(DAYS.some((d:any,dj:number)=>dj!==di&&d&&inputCoversDate(inp,d.dt))){left.push(id);return;}
    put.push({inp,want});
  });
  return {put,left};}
/* THE ONE PLACE records are found by identity (§1, P2-R2-05/P2-R3-03). `ver` is
   a verId (`iso#seq`) — the Original is `iso#0`, an AL is `iso#seq`. It also
   still resolves a `d:<id>` DRAFT blob (unchanged). It MUST validate that the
   identity belongs to the requested day AND — when a `weekKey` is passed — to
   that week: the flat `als` list no longer implies day-membership, and a
   self-consistent book filed under the WRONG week key would otherwise be
   credited to the wrong dates. A legacy bare number / 'orig' is NOT resolved
   here — an old-format book is quarantined at load (§5), never reaching this
   resolver as authoritative. Returns null for a cross-day / cross-week /
   malformed / foreign id, never a wrong day's snapshot. */
export function daySnapIn(sc:any,di:any,ver:any,weekKey?:any){di=+di;
  /* 'd:<id>' — a pre-publish DRAFT blob (engine/drafts.ts; SCHED.drafts rides
     this object so it undoes with everything else). Resolved here so the whole
     preview machinery — withDaySnap, dayPreviewHTML, DPREV, prunePreviews —
     works on a draft with no second code path; the empty changes slice is the
     truth, a draft has no issued marks by definition. Resolving to null once
     the draft is deleted (or undone away) is what lets prunePreviews drop a
     stale draft preview exactly like a stale AL one. */
  if(typeof ver==='string'&&ver.slice(0,2)==='d:'){
    const t=((((sc&&sc.drafts)||{})[di])||[]).find((x:any)=>'d:'+x.id===ver);
    return t?{d:t.d,c:{}}:null;}
  /* a verId is the ONLY other accepted shape — a bare number/'orig'/foreign
     string resolves to null (quarantined-book back-compat is a load-time
     concern, §5, not this authoritative resolver). Validate the SYNTAX strictly
     (§1, P2-REREVIEW-11): parseVerId coerces, so `iso#` (→ seq 0), `iso#-1`,
     `iso#1.5` and a non-date left part would otherwise resolve — isValidVerId
     rejects them (real ISO date + nonnegative safe-integer sequence). */
  if(typeof ver!=='string'||!isValidVerId(ver))return null;
  const {iso,seq}=parseVerId(ver);
  /* week-key validation: the id's ISO date must BE this day in the passed week
     (live = CURWEEK, stash = the stash's own key). Skipped only when no key is
     threaded (identity-only, e.g. the live delta's internal read). */
  if(weekKey!=null&&iso!==dayIso(weekKey,di))return null;
  if(seq===0){
    const o=((sc&&sc.orig)||{})[di];
    return (o&&o.id===ver)?o:null;   // exact Original-id match — not "any id ending #0"
  }
  const r=((sc&&sc.als)||[]).find((a:any)=>a&&a.id===ver&&+a.di===di&&a.iso===iso&&+a.seq===seq);
  return (r&&r.snap&&r.snap.d)?r.snap:null;}
export function daySnapOf(di:any,ver:any){return daySnapIn(SCHED,di,ver,CURWEEK);}
export function dayVersions(di:any){di=+di;
  const v:any[]=['live'];
  const o=(SCHED.orig||{})[di]; if(o&&o.id)v.push(o.id);
  SCHED.als.filter((a:any)=>+a.di===di&&a.snap&&a.snap.d).slice().sort((a:any,b:any)=>+a.seq-+b.seq).forEach((a:any)=>v.push(a.id));
  return v;}
/* the label a verId reads as: 'Live' for the live working copy, else the
   sequence's per-day label ('Original', 'AL1' …). Draft ('d:<id>') vers are
   relabelled by drafts.ts:draftVerLabel BEFORE they reach here. */
export function verLabel(ver:any){return ver==='live'?'Live':verSeqLabel(verSeq(ver));}
/* AL1 cyan · AL2 amber · AL3 bright green · AL4 white · AL5 purple · AL6 pink ·
   AL7 orange. Every entry has to read as an ALn tag in dark ink (#08131b) on top
   of itself, so the ramp stays light and saturated — the old AL5 magenta (#C21E93)
   was too dark for its own tag. Orange moved 6→7 to make room for the pink; it
   stays off green so it can never be misread as AL3, and it is the last entry,
   which alColor() also hands to any AL past the palette.
   Must stay in step with the [data-alc="n"]{--alc:…} rules in the stylesheet. */
export const AL_COLORS:any[]=['','#3BC6E8','#E5C24A','#3DE86B','#FFFFFF','#B388FF','#FF7FC4','#E5872B'];
export function alColor(n:any){return AL_COLORS[n]||AL_COLORS[AL_COLORS.length-1];}
export function pendCount(){return Object.keys(SCHED.pending).length;}
/* alAttr runs per cell on every repaint — thousands of calls — so its
   "nothing is marked anywhere" short-circuit must not allocate. Object.keys().length
   builds a whole array each call; a for-in with an early return does not. The
   hasOwnProperty guard keeps it EXACTLY equivalent to the old Object.keys check —
   own keys only, ignoring any inherited enumerable property — so a polluted
   Object.prototype can never leak a phantom mark into the byte-compared HTML
   (Astra RID-REV2-02). */
function bookEmpty(){const H=Object.prototype.hasOwnProperty;for(const k in SCHED.changes)if(H.call(SCHED.changes,k))return false;for(const k in SCHED.pending)if(H.call(SCHED.pending,k))return false;return true;}
/* A deletion has no live cell left to carry its amendment mark. Reusing the
   deleted address would tint whatever row shifted into it, so removals use an
   inert synthetic key instead: del:DAY.SEQ.KIND. The day stays first after
   the prefix, which lets every existing day filter, snapshot and AL path
   treat it like an ordinary key; SEQ is derived from live/history keys, so it
   survives publish, unpublish, rollback and undo without extra counter state.
   KIND is controlled vocabulary for the AL panel, never user-entered text. */
export const DELETE_LABELS:any={line:'line',wave:'wave',note:'note',programme:'programme item',dutyblock:'duty block',duty:'duty row',sim:'sim row',ground:'ground item'};
export function isDeleteKey(key:any){return /^del:\d+\.\d+\.[a-z]+$/.test(String(key));}
export function deleteLabel(key:any){const k=String(key).split('.').pop()||'';return DELETE_LABELS[k]||'item';}
export function deleteCount(keys:any){return (keys||[]).filter(isDeleteKey).length;}
export function inputActionCount(keys:any){return (keys||[]).filter((k:any)=>/^inp:\d+\./.test(String(k))).length;}
function syntheticKey(prefix:any,di:any,kind:any){di=+di;
  const p=`${prefix}:${di}.`,keys=Object.keys(SCHED.pending||{}).concat(Object.keys(SCHED.changes||{}));
  (SCHED.als||[]).forEach((a:any)=>keys.push(...(a.keys||[])));
  let n=0;keys.forEach((k:any)=>{if(String(k).indexOf(p)!==0)return;const x=+String(k).slice(p.length).split('.')[0];if(isFinite(x)&&x>n)n=x;});
  return `${p}${n+1}.${kind}`;}
export function deletionKey(di:any,kind:any){kind=DELETE_LABELS[kind]?String(kind):'programme';return syntheticKey('del',di,kind);}
/* REORDERS ON A PUBLISHED DAY use an inert synthetic key too — mov:DAY.SEQ.KIND
   — for the same reason deletions do, plus one specific to reordering (owner,
   31 Aug 26 — a reported bug). Every mover in engine/reorder.ts used to record a
   move by marking the moved row's own head FIELD key (wl:di.to, dr:di.wi.to.role
   …) pending. That works while the swapped rows carry DIFFERENT values there, but
   reconcileIssuedMarks (engine/drafts.ts) then drops any pending field key whose
   live value equals the issued value — so reordering two rows that happen to read
   the SAME at that head (two unnamed waves, two same-role duty rows) had its only
   mark reconciled away: the day read "no changes" and the move reached no AL, even
   though the printed order really had changed. A structural mov: key sidesteps the
   value comparison entirely (reconcile skips it by name, like del:/inp:), so a move
   of an ISSUED row always counts. It is minted ONLY on a published day and ONLY for
   a row that was actually issued — a still-draft added row reordered then deleted
   before its AL is the same net no-op it always was (reorder.ts's `done` gates on
   SCHED.added, so no mov: is minted there). Rides every day filter, snapshot, AL
   and undo path as an ordinary key, exactly as del: does. */
export const MOVE_LABELS:any={wave:'wave',formation:'formation',aircraft:'aircraft',duty:'duty row',dutyblock:'duty block',sim:'sim row',ground:'ground item',programme:'programme item',note:'note'};
export function isMoveKey(key:any){return /^mov:\d+\.\d+\.[a-z]+$/.test(String(key));}
export function moveLabel(key:any){const k=String(key).split('.').pop()||'';return MOVE_LABELS[k]||'item';}
export function moveCount(keys:any){return (keys||[]).filter(isMoveKey).length;}
export function moveKey(di:any,kind:any){kind=MOVE_LABELS[kind]?String(kind):'item';return syntheticKey('mov',di,kind);}
export function markMove(di:any,kind:any){const key=moveKey(di,kind);markEdit(key);return key;}
/* the added-marker is stored rid-anchored (ridWriteKey self-heals a just-added
   row's missing id). Returns the STORED (rid) key, so a caller that indexes
   SCHED.added by the return value stays correct across any later splice. */
export function trackStructuralAdd(key:any){if(!key)return '';SCHED.added=SCHED.added||{};const rk=ridWriteKey(String(key),DAYS);SCHED.added[rk]=1;return rk;}
/* flashAdded gets the POSITIONAL key untranslated — paintFreshAdds matches it
   against the row's data-bfld DOM attribute, which the renderer builds from the
   loop index, never from a rid. */
export function markStructuralAdd(key:any){const rk=trackStructuralAdd(key);markEdit(key);HOOKS.flashAdded(key);return rk;}
export function structuralAddExists(key:any){
  /* the stored key is rid-anchored; resolve it to the CURRENT positional
     address first (null → the row is gone → it no longer exists). A NONROW
     note key and a legacy positional key pass through posKey unchanged. */
  const pk=posKey(key,DAYS); if(pk===null)return false;
  const s=String(pk),c=s.indexOf(':'),p=c<0?'':s.slice(0,c),a=(c<0?s:s.slice(c+1)).split('.'),di=+a[0],d=DAYS[di];
  if(!d)return false;
  if(p==='wl')return !!(d.waves||[])[+a[1]];
  if(p==='ff'){const w=(d.waves||[])[+a[1]];return !!(w&&(w.formations||[])[+a[2]]);}
  if(p==='fr'){const w=(d.waves||[])[+a[1]],f=w&&(w.formations||[])[+a[2]];return !!(f&&(f.aircraft||[])[+a[3]]);}
  if(p==='dn')return +a[1]<(d.notes||[]).length;
  if(p==='ap')return !!(d.allhands||[])[+a[1]];
  if(p==='dl')return !!(d.dutywaves||[])[+a[1]];
  if(p==='dr'){const b=(d.dutywaves||[])[+a[1]];return !!(b&&(b.rows||[])[+a[2]]);}
  if(p==='sr')return !!(((d.sims||{})[String(a[1])]||[])[+a[2]]);
  if(p==='g'||p==='gr')return !!(d.ground||[])[+a[1]];
  return false;
}
/* Whether the structure being removed was present in the day that is
   currently issued. Add -> delete before the next AL is a net no-op, not a
   removal. SCHED.added carries each draft addition's structural key through
   every reorder; issue clears it and unpublish restores it. The frozen issued
   snapshot remains the fallback for legacy/session data without that marker.
   Accepted Ground inputs also pass their stable source token. */
export function deletionWasIssued(di:any,kind:any,...at:any[]){di=+di;
  const added=SCHED.added||{};
  /* the identity keys below are BUILT positional from live indices; SCHED.added
     is now rid-anchored, so translate each built key before the lookup. `issued`
     is computed before the delete splice (board.ts / slots.ts), so the live rows
     still resolve. A note key (dn:) passes through ridKey unchanged. */
  const has=(...keys:any[])=>keys.some((k:any)=>!!added[ridKey(k,DAYS)]);
  if(kind==='line'&&has(`wl:${di}.${+at[0]}`,`ff:${di}.${+at[0]}.${+at[1]}.cs`,`fr:${di}.${+at[0]}.${+at[1]}.${+at[2]}`))return false;
  if(kind==='wave'&&has(`wl:${di}.${+at[0]}`))return false;
  if(kind==='note'&&has(`dn:${di}.${+at[0]}`))return false;
  if(kind==='programme'&&has(`ap:${di}.${+at[0]}.prog`))return false;
  if(kind==='dutyblock'&&has(`dl:${di}.${+at[0]}`))return false;
  if(kind==='duty'&&has(`dl:${di}.${+at[0]}`,`dr:${di}.${+at[0]}.${+at[1]}.role`))return false;
  if(kind==='sim'&&has(`sr:${di}.${String(at[0])}.${+at[1]}.label`))return false;
  if(kind==='ground'&&has(`gr:${di}.${+at[0]}.prog`,`g:${di}.${+at[0]}`))return false;
  if(!dayApproved(di))return true;
  const ver=dayCurVer(di),snap=ver!=null?daySnapOf(di,ver):null,d=snap&&snap.d;
  if(!d)return true;
  if(kind==='ground'&&at[1]!=null)return (d.ground||[]).some((r:any)=>r&&r.src===at[1]);
  /* The snapshot is indexed by the LIVE index, and a reorder makes the two
     diverge: add a draft row, Sort all, and the issued rows can sit at
     indices the shorter issued snapshot never had — so the lookup answered
     "never issued" about a row the squadron holds a printed copy of, and
     its removal reached no AL (audit, 12 Aug 26). The identity checks above
     have already said this row is NOT one of the outstanding draft adds, so
     when its index runs past the snapshot's tail while the live section is
     longer than the issued one, the surplus is exactly those draft adds and
     THIS row must be issued: say so. An in-range hit keeps the plain
     positional answer, which is also the whole story for legacy/session
     data that predates the identity markers. */
  const sectOf=(day:any):any[]=>{
    if(!day)return [];
    if(kind==='wave')return day.waves||[];
    if(kind==='line'){const w=(day.waves||[])[+at[0]],f=w&&(w.formations||[])[+at[1]];return (f&&f.aircraft)||[];}
    if(kind==='note')return day.notes||[];
    if(kind==='programme')return day.allhands||[];
    if(kind==='dutyblock')return day.dutywaves||[];
    if(kind==='duty'){const b=(day.dutywaves||[])[+at[0]];return (b&&b.rows)||[];}
    if(kind==='sim')return ((day.sims||{})[String(at[0])])||[];
    if(kind==='ground')return day.ground||[];
    return [];
  };
  const ix=kind==='line'?+at[2]:(kind==='duty'||kind==='sim')?+at[1]:+at[0];
  if(!isFinite(ix))return true;
  const was=sectOf(d);
  if(ix<was.length&&(kind==='note'||!!was[ix]))return true;
  return sectOf(DAYS[di]).length>was.length;
}
/* DELETE CLEANUP (addressing-by-rid finding 2). A deleted row's stored marks
   have no live cell left to carry them, and — because keys are rid-anchored and
   keys.ts's renumber is now inert on them — nothing renumbers them away either.
   So the real delete sites (board.ts, slots.ts:unacceptInput) capture the
   removed ROOT rid(s) BEFORE the splice and call this after: it drops every
   stored key whose ancestry PATH contains one of those rids. Ancestor-retaining
   keys mean a deleted PARENT rid alone sweeps its children (their keys carry the
   parent rid), so only the root rid(s) need capturing.
   Scoped to the LIVE book (pending/changes/added) ONLY — NEVER an issued AL's
   diff or snap.c (Astra RID-R5-03 ≡ Fable #1): a deleted row is routinely
   RESURRECTED by switching to a parked draft that still holds it, after which
   rebaseDayPending re-tints it from snap.c. Emptying the frozen AL record would
   strand a tint that outlives its issue. Left intact, a stale AL entry on a day
   whose row is gone is inert (structuralAddExists is posKey→null→false). */
export function dropRowMarks(rids:any){
  const set=new Set((rids||[]).filter(Boolean));
  if(!set.size)return;
  const hit=(k:any)=>String(k).split(/[.:]/).some((seg:any)=>set.has(seg));
  [SCHED.pending,SCHED.changes,SCHED.added].forEach((book:any)=>{
    if(!book)return; Object.keys(book).forEach((k:any)=>{if(hit(k))delete book[k];});
  });
}
export function markDeletion(di:any,kind:any,wasIssued:any=true){if(!wasIssued)return '';const key=deletionKey(di,kind);markEdit(key);return key;}
/* Filing a personal input under Unavailable changes the issued day but has no
   programme row to tint. The permanent input ID makes one stable inert address per
   input/day, so filing then unfiling before issue remains one changed detail
   rather than two contradictory amendment items. Dots are escaped as well as
   URI punctuation because keyDay relies on the first dot ending the day. */
export function markInputFiling(di:any,token:any){const id=encodeURIComponent(String(token)).replace(/\./g,'%2E'),key=`inp:${+di}.${id}`;markEdit(key);return key;}
/* record an edit.  `key` is the slot/field address that changed — that single
   item is what gets coloured when the amendment is published.
   `was`/`now` are the edit log's (editlog.ts), and optional for the same
   reason noteChange's are: this function is called three different ways and
   only one of them knows both values. A funnel write passes them; a
   structural mark after an add passes a key alone (there is no "before"); the
   bare epilogue in afterSchedMutate() passes nothing at all. Only the first
   reaches the log, which is what keeps a phantom row off every mutation. */
export function markEdit(key?:any,was?:any,now?:any){
  /* store the mark rid-anchored (self-healing translate); logEdit translates
     independently on the read side, so it takes the original key. A synthetic
     del:/mov:/inp: key is NONROW and passes through untranslated. */
  if(key){ const rk=ridWriteKey(key,DAYS); SCHED.pending[rk]=1; delete SCHED.changes[rk]; logEdit(key,was,now); }
  renderStatus();
  histPush();
}
/* the per-item amendment mark, emitted straight into the renderer's HTML.
   A pending edit on a PUBLISHED day is different from draft work: publishing a
   day clears its pending marks (the day goes out as it stands), so anything
   pending on it afterwards is exactly what the next AL will carry. Those keys
   also get data-aln — the per-day sequence they will go out as (nextSeq(di)) —
   so the edit surfaces can paint them in that AL's colour before it exists
   (owner request, Aug 26; the view page ignores the attribute). */
export function alAttr(key:any){
  if(!key)return '';
  /* HOT PAINT PATH. The stored book is rid-anchored, so the positional DOM key
     is translated (ridKey, O(depth)) before the lookup. Skip that walk entirely
     when nothing is marked anywhere — a GLOBAL empty check, not a per-day scan
     (Fable #9). On a pristine model (the parity/html gates) this returns '' with
     no walk, so the emitted HTML stays byte-identical. */
  if(bookEmpty())return '';
  key=ridKey(key,DAYS);
  const n=SCHED.changes[key];
  if(n)return ` data-alc="${n}" title="Changed at AL${n}"`;
  if(SCHED.pending[key]){
    /* an amendment mark only means something once the day is PUBLISHED — it says
       "this differs from the issued document". On a still-draft day nothing has
       been issued, so a pending edit is ordinary draft work, and an amendment-style
       mark on every edit reads as a change to a live schedule and misleads (owner,
       25 Aug 26). Published day → the edit previews the AL it will go out as
       (data-aln, painted in that AL's colour on the edit surfaces); draft day →
       NO mark. History still finds the cell by its own key + the edit log, not by
       this attribute, so the changes list and hover are unaffected. */
    if(dayApproved(keyDay(key))){const x=nextSeq(keyDay(key));return ` data-alp="1" data-aln="${x}" title="Edited — goes out as AL${x}"`;}
    return '';
  }
  return '';
}
/* which published days have changes to go out, and which of those are not
   signed right now — the ALPanel's per-day publish affordance reads these. */
export function pendingPublishDays(){return approvedDays().filter((di:any)=>dayHasChanges(di));}
export function alUnsignedDays(){return pendingPublishDays().filter((di:any)=>!daySigned(di));}
export function canPublishAL(){return pendingPublishDays().length>0&&alUnsignedDays().length===0;}
/* the shared issue step, now SINGLE-DAY (§1/§2/§4): freeze the day as the next
   per-day sequence, storing the immutable verId, the canonical `diff` (from
   dayDelta, the ONE authority) and the day's signatures; stamp cur=id. The old
   structural-add ownership tangle (carried/structAdds/adds) is gone (§2) — an
   issue simply CLEARS the day's SCHED.added entries (they are now frozen in the
   snapshot) and records nothing for a future unpublish (there is none). */
export function alIssue(di:any){di=+di;
  /* READ-ONLY QUARANTINE backstop (P2-REV2-03): the shared final step of every
     publish path — refuse to push a record onto an unsupported/wrong-week book,
     so any caller that reached here (present or future) cannot issue onto frozen
     data. Returns a zero-count result rather than throwing, matching its shape. */
  if(protectedWeek())return {seq:0,id:'',sign:{},count:0};
  stampAmFormat();   // defensive: an AL on a validated (supported) book keeps it 'current' (P2-IMPL-04)
  const seq=nextSeq(di), iso=dayIso(CURWEEK,di), id=verId(iso,seq);
  /* the canonical delta vs the CURRENT issued version, captured BEFORE the marks
     move to changes — this is the frozen record of what this AL changed. */
  const diff=dayDelta(di);
  /* …and its COUNT in the unit "N pending" read a moment ago (D109): the record keeps every
     cell, the person reads "1 item" for a man moved, as the day head said */
  const items=dayPendingItems(di), units=items.length;
  /* …and its per-kind split in the same unit, for the Amendments panel's line (D114: "1 item · 1 removal", never a
     separate "1 input filing" beside it); a record issued before falls back to its diff's split */
  const ukinds=itemCounts(items);
  const keys=Object.keys(SCHED.pending).filter((k:any)=>keyDay(k)===di);
  /* a still-outstanding draft add on this day becomes part of the frozen
     snapshot, so it wears this AL's colour and its live-only marker is cleared. */
  Object.keys(SCHED.added||{}).forEach((k:any)=>{if(keyDay(k)===di&&!keys.includes(k))keys.push(k);});
  /* [GLOBAL-UNDO] §6.5 — remember which of this day's `added` structural marks this
     AL consumed, so an unpublish can restore them: a row added-then-deleted inside
     the retracted AL must not mint a spurious `del:` mark when the AL comes off. */
  const added=Object.keys(SCHED.added||{}).filter((k:any)=>keyDay(k)===di);
  keys.forEach((k:any)=>{SCHED.changes[k]=seq; delete SCHED.pending[k];});
  Object.keys(SCHED.added||{}).forEach((k:any)=>{if(keyDay(k)===di)delete SCHED.added[k];});
  const sign=signNames(di);
  /* freeze the day AFTER its marks are on — this is the document */
  const snap=daySnap(di);
  SCHED.als.push({id,di,iso,seq,snap,diff,units,ukinds,sign:{[di]:sign},added});
  SCHED.cur=SCHED.cur||{}; SCHED.cur[di]=id;   // issuing makes it current
  signClear(di);
  reflow(); histPush();   // publishing is its own undo step, not a silent baseline shift
  return {seq,id,sign,count:units};
}
/* publish ONE day's changes as its next per-day AL (P2-08 — never publish-all).
   Gates on dayHasChanges (the canonical delta, F-02), NOT on a live pending
   count: a canonical-only change (order, an input filing, a cancelled-formation
   reason) is publishable even if it left no pending field mark. */
export function publishALDay(di:any){
  di=+di;
  /* READ-ONLY QUARANTINE (P2-REV2-03): refuse a new AL on an unsupported/wrong-week
     book FIRST — before the draft/changes/signature checks — so it cannot slip
     through on a book whose verIds merely happen to resolve. The preserved-blob
     writeback would otherwise discard the issue on reload (a silent lost AL). */
  if(protectedWeek())return toast(`${(DAYS[di]||{}).dow||'This day'} is locked — it was published by an older version and can’t be amended here`);
  if(!dayApproved(di))return toast(`${DAYS[di].dow} is still draft — publish the day before publishing its changes`);
  /* the same mint as the first publish above, for the same reason: every read
     in this turn — the delta, the signature binding, the frozen block — must
     see one set of row ids (Fable, 21 Sep 26). */
  ensureRowIds(DAYS);
  /* [GLOBAL-UNDO] §6.1 GU5-001 — a day being CORRECTED (unpublished, then edited)
     may reissue its SAME label even if the correction nets to no delta; an ordinary
     amendment still needs a real change. */
  const correcting=!!(SCHED.correcting&&SCHED.correcting[di]);
  if(!dayHasChanges(di)&&!correcting)return toast(`No changes to publish on ${DAYS[di].dow}`);
  const seq=nextSeq(di);
  if(!daySigned(di))return toast(`Sign off ${signMissing(di).join(', ')} before publishing AL${seq}`);
  const {sign,count}=alIssue(di);
  if(SCHED.correcting)delete SCHED.correcting[di];   // reissued — the correction is closed
  const who=sign||{};
  const held=pendingPublishDays().length;
  toast(`Published AL${seq} · ${count} item${count===1?'':'s'} on ${dowShort(di)} only`
    +(who.appr?` · approved by ${who.appr}`:'')
    +(held?` · ${held} day${held>1?'s':''} with changes still held`:''));
}
/* Restricted to NEVER-PUBLISHED days (Phase 2 lock, F-01). On a day that has
   an issued Original, discarding its pending marks would silently drop a
   live-vs-issued divergence — the only supported way to change a published day
   is to publish it as the next AL. So keep pending on any day that carries an
   Original, and clear only the draft-build marks on never-published days. */
export function discardPending(){
  const orig=SCHED.orig||{};
  /* say what actually happened (walk S2, 24 Sep 26): it used to toast "Pending marks cleared"
     even when every mark sat on a published day and nothing was touched. */
  let n=0, kept=0;
  Object.keys(SCHED.pending).forEach((k:any)=>{ if(!orig[keyDay(k)]){delete SCHED.pending[k]; n++;} else kept++; });
  if(!n)return toast('Nothing to clear — the changes are on published days: publish them as an amendment, or put them back');
  reflow(); histPush();
  toast(`Cleared ${n} draft mark${n===1?'':'s'}`+(kept?' · published days keep their changes until you publish them or put them back':''));
}
/* ---- [GLOBAL-UNDO] §6.5 — UNPUBLISH: retract a published day to a working copy
   ---------------------------------------------------------------------------
   The engine behind the Unpublish button (§6.4 "correct quietly"). A retracted
   version is kept forever as its own immutable snapshot in the append-only
   `retired` log (retireIssued), and the day drops back to an editable working
   copy so it can be corrected and re-issued under the SAME label. Undo of a
   just-published day runs this same retract (wired at the scheduler cutover). */
function nextRetiredN(id:any):number{let mx=0;const rt=SCHED.retired||{};
  for(const k of Object.keys(rt)){const c=String(k).lastIndexOf('~');
    if(c<0)continue; if(k.slice(0,c)!==String(id))continue;
    const n=+k.slice(c+1); if(Number.isSafeInteger(n)&&n>mx)mx=n;}
  return mx+1;}
/* the id of the version that becomes current once `seq` comes off day `di`: the
   highest remaining AL, else the Original. */
function priorVerId(di:any,seq:any):any{di=+di;
  let top=0; (SCHED.als||[]).forEach((a:any)=>{if(+a.di===di){const s=+a.seq; if(s!==+seq&&Number.isSafeInteger(s)&&s>top)top=s;}});
  if(top>0){const a=(SCHED.als||[]).find((x:any)=>+x.di===di&&+x.seq===top); return a&&a.id;}
  const o=(SCHED.orig||{})[di]; return o&&o.id;}
/* append the issued version `id` to the retired log as its own immutable snapshot
   (keyed `<id>~<n>`) and remove the live issued record. `logged` = whether the
   version was disseminated (the history panel prints only logged entries); at Step
   3 always false (no shared database). Returns the retired key. */
export function retireIssued(di:any,id:any,opts:any={}):string{di=+di;
  const seq=verSeq(id);
  const rec=seq===0?(SCHED.orig||{})[di]:(SCHED.als||[]).find((a:any)=>String(a&&a.id)===String(id));
  SCHED.retired=SCHED.retired||{};
  const key=`${id}~${nextRetiredN(id)}`;
  if(opts.append!==false){
    SCHED.retired[key]={id,n:+key.slice(key.lastIndexOf('~')+1),di,iso:parseVerId(id).iso,seq,
      snap:rec?(rec.snap||{d:rec.d,c:rec.c,fil:rec.fil}):null,
      diff:(rec&&rec.diff)||[],units:rec&&rec.units!=null?rec.units:undefined,ukinds:rec&&rec.ukinds?rec.ukinds:undefined,sign:(rec&&rec.sign)||{},   // units: the item count as it went out (D109; Astra 4)
      at:new Date().toISOString(),by:opts.by??null,
      restoreSeq:opts.restoreSeq,logged:!!opts.logged};
  }
  if(seq===0){ if(SCHED.orig)delete SCHED.orig[di]; }
  else { const ix=(SCHED.als||[]).findIndex((a:any)=>String(a&&a.id)===String(id)); if(ix>=0)SCHED.als.splice(ix,1); }
  if(opts.clearSigns)signClear(di);
  return key;}
/* retract the LATEST issued version of a published day. Book-only mutation; the
   command wrapper (state/sched-commit.ts) adds canEditSched + the DPREV gate and
   prunePreviews. Returns the retracted id, or null when the gate refuses. */
export function unpublishDay(di:any,opts:any={}):any{di=+di;
  if(protectedWeek())return null;
  if(!dayApproved(di))return null;
  const id=dayCurVer(di);
  if(id==null)return null;
  const seq=verSeq(id), top=Math.max(0,...dayALs(di));
  if(seq!==top)return null;                 // only the most recent version comes off
  const rec=seq===0?null:(SCHED.als||[]).find((a:any)=>String(a&&a.id)===String(id));
  const added:any[]=(rec&&rec.added)||[];
  retireIssued(di,id,{clearSigns:true,append:opts.append!==false,logged:!!opts.disclosed,by:opts.by});
  /* …and EVERY plan of the day re-signs (AM34, owner 18 Sep 26: unpublish "clears that day's
     sign-offs — re-sign on republish"). Each plan carries its own sign-offs (AM12) and a PARKED
     plan's were never spent, so they revived the moment the day was back at the version they
     were signed against, and could unlock a republish on signatures given before the withdrawn
     version existed ([HUMAN-RETEST] walk W2, Fable 5-11, 24 Sep 26). */
  signClearPlans(di);
  if(seq===0){
    // retract the Original → a plain draft (its build marks were consumed at issue)
    delete SCHED.dayOK[di];
    if(SCHED.cur)delete SCHED.cur[di];
  }else{
    // retract AL n → re-open its marks on the working copy as pending
    Object.keys(SCHED.changes).forEach((k:any)=>{
      if(keyDay(k)!==di||+SCHED.changes[k]!==seq)return;
      delete SCHED.changes[k];
      // a delete/move/input mark, or a field mark whose row still resolves, re-opens
      // as pending; a mark whose row no longer exists is dropped (it can't be edited).
      if(isDeleteKey(k)||isMoveKey(k)||String(k).startsWith('inp:')||posKey(k,DAYS)!==null)SCHED.pending[k]=1;
    });
    // restore this AL's structural additions so a row added-then-deleted inside the
    // retracted AL does not mint a spurious del: mark (§6.5).
    SCHED.added=SCHED.added||{}; added.forEach((k:any)=>{SCHED.added[k]=1;});
    SCHED.cur=SCHED.cur||{}; const prior=priorVerId(di,seq);
    if(prior)SCHED.cur[di]=prior; else delete SCHED.cur[di];
  }
  // §6.1 GU5-001 — mark the day as CORRECTING this label, so publishALDay / the
  // button may reissue the SAME label even if the correction nets to no delta.
  SCHED.correcting=SCHED.correcting||{}; SCHED.correcting[di]=id;
  return id;}
/* re-validate + repaint every visible surface */
export const SIGN_ROLES:any[]=[['cur','CUR CK',false],['sked','SKED CK',true],['plan','PLANNED BY',true],['appr','APPROVED BY',true]];
export function signOf(di:any){SCHED.sign=SCHED.sign||{}; return (SCHED.sign[+di]=SCHED.sign[+di]||{cur:'',sked:'',plan:'',appr:''});}
/* [ARCH-STACK] follow-up #1 (R2-01): a NON-MUTATING sign reader. signOf lazily
   INSERTS SCHED.sign[di] on first read, and the sign strip is read on every day
   paint (view week included) — a live write outside any command, so the command
   layer's next diff would emit a spurious sched.book sign record for a day nobody
   signed. The read sites (signRoleOk/signShown/signNames, hence daySigned/
   signMissing) use signAt instead; only the WRITE path (setSign) keeps signOf. A
   frozen shared empty is safe because every reader only READS g[role]. */
const EMPTY_SIGN:any=Object.freeze({cur:'',sked:'',plan:'',appr:''});
export function signAt(di:any){return ((SCHED.sign||{})[+di])||EMPTY_SIGN;}
/* AM-06 — signatures bound to CONTENT (brief §5/§9). Beside the signer name in
   SCHED.sign, each role that is signed through the sanctioned path (setSign)
   records, in SCHED.signBind[di][role], the exact content it signed: the
   canonical digest (§5.0), the schedule date, the current issued base id, and
   the candidate (plan/draft) revision. A signature is content-valid only while
   all four still match the live day. Validity is RECOMPUTED on every read here —
   nothing "clears" a signature on an edit (Rev-4 command-layer §2.1): so an edit
   silently invalidates it and an undo/revert back to the signed content makes it
   valid again (F-09), with no invalidation hook to keep in step with every
   mutation path. */
export function signBindOf(di:any){SCHED.signBind=SCHED.signBind||{}; return (SCHED.signBind[+di]=SCHED.signBind[+di]||{});}
/* the content fingerprint a signature is bound to, as it stands right now. */
export function currentBind(di:any){di=+di;return passMemo('cb',di,()=>currentBindNow(di));}
function currentBindNow(di:any){ const d=DAYS[di];
  /* the OIL evidence is part of what a signature promises ([OIL-AUTO-REMOVE]
     §9.3 point 2): the preview, the amendment comparison, the signature binding
     and publication all call the SAME body, so they cannot disagree about what
     is being signed. Without it an answer-only change would be publishable on a
     signature given before the answer moved. */
  /* THE SIGNATURE'S PROJECTION, NOT THE COMPARISON'S (D45, step 9b) — the OIL key
     below still leaves membership out, and everything else about the block still
     binds through it. BUT D45's signature half was REPLACED on 25 Sep 26 by D103
     ("any change on a published day wipes the sign-offs"): on a published day the
     `pd` axis binds the whole pending comparison, membership included, so a changed
     crowd now DOES take the four down there, and putting it back restores them. */
  /* …and the order the GROUND PROGRAMME is shown in (the amendment re-test's final read, Fable #1,
     24 Sep 26). The digest keys ground rows by their raw place in the array, but the amendment compares the
     order on screen — and a first drag freezes the shown order into the array before it moves, so a drag
     could leave the array exactly as it was: "1 reorder" pending, the four still green, and "Publish AL"
     issuing the reorder on signatures given for the old order (AM10, AM11). */
  /* recorded as the shown order of the array's positions: the digest already binds each position's
     content, so the pair fixes what is shown — and it does not move when row ids are minted before a publish */
  const gord=d?groundOrder(d.ground,d.gman).map((x:any)=>x.ri).join(','):'';
  return {dg:d?digest(d,di):'', iso:dayIso(CURWEEK,di), base:dayCurVer(di)||'', rev:(SCHED.curDraft||{})[di]||'', fil:filingKey(di), oil:oilSignKey(oilEvidence(di),d), gord, pd:pendingKey(di)};}
/* ANY PENDING CHANGE WIPES THE SIGN-OFFS (owner, D103, 25 Sep 26 — his own idea: "why dont we just wipe the
   sign offs for any changes to the schedule?"). ONE rule: something waiting means sign again. So a signature on
   a PUBLISHED day also binds to the whole pending comparison itself — every entry of dayDelta, the same body
   "N pending" and eligibility read — which reaches what the other axes deliberately leave out: a change in who
   is behind ALL / ALL AVAIL (the membership the OIL key above omits — REPLACES D45's signature half), an
   edited request's times, a Quals or posting change. Nothing "clears" it: validity is recomputed on every read,
   so putting the change back restores the four (AM11). On a day not yet published nothing is pending (no issued
   version to differ from) and the key is '' — its content axes above are the whole binding, as before. */
function pendingKey(di:any):string{
  return dayDelta(di).map((e:any)=>`${e.addr}${'␟'}${e.kind}${'␟'}${e.from??''}${'␟'}${e.to??''}`).sort().join('\n');}
/* set a role's signer through the ONE sanctioned write path (ui/Shell.tsx). A
   truthy signer binds that role to the current content; clearing a role drops its
   binding. Tests / a legacy demo book that write signOf(di)[role] directly leave
   no binding — see signMissing's back-compat rule. */
export function setSign(di:any,role:any,who:any){di=+di; signOf(di)[role]=who;
  const b=signBindOf(di); if(who)b[role]=currentBind(di); else delete b[role];}
/* a role's binding still matches the live content (or there is no binding — a
   pre-Phase-3 / demo signature, appointment-checked only, as before). */
function signBoundOk(di:any,role:any,cur?:any){const b=(SCHED.signBind||{})[+di]; const x=b&&b[role];
  if(!x)return true; const c=cur||currentBind(di);
  /* a binding written before the filing axis existed (x.fil undefined) must re-sign —
     it cannot prove the filing was approved. CORRECTED 17 Sep 26: the old
     "(dev-phase; sign state is session-scoped)" was wrong — sign and signBind ride
     schedFields into the persisted week record, so a pre-filing binding CAN come
     back from storage. Re-signing is therefore the real guard, not a dev-phase
     convenience. */
  /* the OIL axis normalises absent to '' rather than forcing a re-sign, unlike
     the filing axis above: a binding written before the evidence block existed
     carries no oil field, and on a day that earns nothing there is nothing it
     could have failed to promise. A day that DOES carry evidence still
     invalidates, because '' and a real block differ. */
  /* the ground order axis, like the filing axis: a binding written before it existed (no gord) cannot prove
     the order was approved, so it re-signs — on a day with ground rows; with none there is no order to prove */
  /* …and the pending comparison (D103): a binding written before it existed reads '' — which is exactly what a
     day with nothing waiting has, so it stands there and falls the moment anything is pending */
  return x.dg===c.dg&&x.iso===c.iso&&x.base===c.base&&x.rev===c.rev&&x.fil===c.fil&&(x.gord||'')===(c.gord||'')&&(x.pd||'')===(c.pd||'')&&oilBoundOk(di,x.oil,c.oil);}
/* A BINDING WRITTEN BEFORE `stand` EXISTED stores the OIL key in the old
   six-part form, which can never equal today's seven-part one — so every
   signature given before this build fell off a day whose content had not moved,
   while the amendment panel (repaired beside it) said that same day was
   unchanged. One day, two contradictory answers (Codex rank 4, 22 Sep 26).
   An old string is tested the only way it can be: today's content is written
   the way HE saw it written, and compared. That alone is NOT enough, and Codex
   is right to say so — job 2 changed what some days pay without changing
   anything the old form could show. So the day must also pay today what it paid
   then. Where it does not, the signature is refused and the day must be signed
   again, which is the honest answer: the money under it moved. */
function oilBoundOk(di:any,was:any,now:any){
  if((was||'')===(now||''))return true;
  if(!was)return false;
  /* A BINDING STORED BEFORE THE TWO PROJECTIONS SPLIT carries the membership
     tail inside it ([OIL-SEATS-CAN-EARN] step 9b). Left alone, every signature
     given before this build would fall off its day the moment anybody filed
     leave — which is precisely what D45 forbids, and the same shape as the
     `stand` break below. The stored string is therefore compared on everything
     EXCEPT that tail. */
  if(oilKeyNoMem(was)===(now||''))return true;
  const ev=oilEvidence(di);
  return oilKeyNoMem(oilKeyBeforeStand(ev))===oilKeyNoMem(was)&&!oilUpgradeMovedMoney(DAYS[+di],ev);}
/* a name only counts while it is still appointed — withdrawing someone's
   Scheduler qual after they signed used to leave the day looking signed — AND
   only while its content binding still holds (AM-06). currentBind is computed at
   most once per call, and only if some role carries a binding. */
/* a role's stored signer, but only while it still COUNTS: signed, still an
   appointed scheduler where the role requires it, and (AM-06) its content binding
   still holding. This is the ONE per-role predicate — signMissing lists the roles
   it rejects, signShown blanks the roles whose BINDING it rejects — so the "N to
   sign" text and the greened sign-off selects can never drift. `cur` is the
   caller's once-per-day currentBind; pass it to avoid recomputing the digest. */
export function signRoleOk(di:any,role:any,cur?:any){
  const g=signAt(di),who=g[role]; if(!who)return false;
  const rr=SIGN_ROLES.find((r:any)=>r[0]===role); if(rr&&rr[2]&&!isScheduler(who))return false;
  const b=(SCHED.signBind||{})[+di];
  if(b&&b[role]){const c=cur||currentBind(di); if(!signBoundOk(di,role,c))return false;}
  return true;}
/* currentBind digest is the only non-trivial cost, so compute it at most once per
   call and only if some role actually carries a binding (the old signMissing rule). */
function signCur(di:any){const b=(SCHED.signBind||{})[+di];
  return b&&SIGN_ROLES.some((r:any)=>b[r[0]])?currentBind(di):undefined;}
export function signMissing(di:any){const cur=signCur(di);
  return SIGN_ROLES.filter((r:any)=>!signRoleOk(di,r[0],cur)).map((r:any)=>r[1]);}
export function daySigned(di:any){return signMissing(di).length===0;}
/* the signer to DISPLAY per role. A signature the day's CONTENT has moved out from
   under (its binding no longer matches the live content) reads EMPTY, so a change
   wipes the green and the day must be re-signed before it can publish (owner, 15
   Sep 26 — "a change needs to be signed off … the sign offs will be removed and
   back to default cleared"). Reverting the content in place restores the binding
   and the name returns (AM-06 F-09). Scoped to BINDING breakage ONLY: an
   unappointed-but-signed name still shows (signPeople keeps it offered) — that
   path is unchanged, so this never silently blanks a name on an appointment change. */
export function signShown(di:any){const b=(SCHED.signBind||{})[+di]; const cur=signCur(di);
  const g=signAt(di),o:any={};
  SIGN_ROLES.forEach((r:any)=>{const k=r[0],who=g[k];
    o[k]=(who&&b&&b[k]&&!signBoundOk(di,k,cur))?'':who;});
  return o;}
export function signClear(di:any){SCHED.sign[+di]={cur:'',sked:'',plan:'',appr:''}; if(SCHED.signBind)SCHED.signBind[+di]={};}
/* the PARKED plans' sign-offs (each plan stows its own, AM12) — a pulled-back day re-signs every plan,
   by the Unpublish button and by Undo alike (AM34, AM32; walk W2 Fable 5-11 and walk W3, 24 Sep 26) */
export function signClearPlans(di:any){((SCHED.drafts||{})[+di]||[]).forEach((t:any)=>{ if(t){ t.sign={cur:'',sked:'',plan:'',appr:''}; t.signBind={}; } });}
/* WHO SIGNED A PUBLISHED VERSION (D95, D102): the four callsigns frozen on its record — an amendment's since Phase 2,
   the Original's since 25 Sep 26 — or null for a version with none recorded (a plan, a draft, a record older than
   the keeping). NEVER the live sign-off boxes: those sign the NEXT issue, and the view page must not show them (AM5). */
export function verSigners(di:any,ver:any):any{di=+di;
  if(typeof ver!=='string'||!isValidVerId(ver))return null;
  const rec=verSeq(ver)===0?((SCHED.orig||{})[di]&&(SCHED.orig||{})[di].id===ver?SCHED.orig[di]:null)
    :(SCHED.als||[]).find((a:any)=>a&&a.id===ver&&+a.di===di);
  const g=rec&&rec.sign&&rec.sign[di];
  return g&&SIGN_ROLES.some((r:any)=>g[r[0]])?g:null;}
export function signNames(di:any){const g=signAt(di),o:any={};SIGN_ROLES.forEach((r:any)=>{const p=PEOPLE[g[r[0]]];o[r[0]]=p?p.cs:'';});return o;}
export function signPeople(schedOnly:any,keep?:any){
  const ids=Object.keys(PEOPLE).filter((id:any)=>!PEOPLE[id].special&&!PEOPLE[id].archived
      &&(!schedOnly||isScheduler(id)));
  /* a name already signed stays offered even if the appointment was since
     withdrawn, so an existing signature never silently blanks itself */
  if(keep&&PEOPLE[keep]&&!ids.includes(keep))ids.push(keep);
  return ids.sort((a:any,b:any)=>PEOPLE[a].cs.localeCompare(PEOPLE[b].cs));
}
/* the next per-day sequence for a day: highest issued seq for THIS day + 1
   (Original is seq 0, so a day's first amendment is AL1). Per-day, so Monday's
   AL1 and Tuesday's AL1 are independent — the old week-wide nextAL is gone. */
export function nextSeq(di:any){di=+di;
  /* number ABOVE every existing sequence for THIS day, counting only a POSITIVE
     safe-integer seq (§1, P2-REREVIEW-11): a fractional / negative / NaN seq no
     longer skews the next number. Any real positive seq still raises the ceiling,
     so a fresh AL can never collide with an existing one. */
  let mx=0; (SCHED.als||[]).forEach((a:any)=>{
    if(!a||+a.di!==di)return;
    const s=+a.seq; if(Number.isSafeInteger(s)&&s>0&&s>mx)mx=s;});
  return mx+1;}
