import { DAYS } from './data'
import { PEOPLE } from './people'
import { keyDay, uniqDays } from './keys'
import { isScheduler } from './people'
import { HOOKS } from './hooks'
import { logEdit } from './editlog'
import { ridKey, posKey, ridWriteKey, RID_BOOK_VERSION } from './rowids'
import { canonicalDiff } from './canonical'
import type { DeltaEntry } from './canonical'
import { INPUTS, inpId, inputCoversDate } from './inputs'
import { CURWEEK } from './waves'
import { dayIso, verId, parseVerId, verSeq, verSeqLabel, isValidVerId } from './verid'

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
export let SCHED:any={al:0, pending:{}, changes:{}, added:{}, als:[], dayOK:{}, sign:{}, orig:{}, cur:{}, ridV:RID_BOOK_VERSION, amV:AMBOOK_VERSION};
/* Reset ALL of SCHED in place. Every field is keyed by day INDEX (0..6), so
   loading a different week without this would let one week's approvals, pending
   edits, AL colouring and per-day drafts bleed onto the next week's identical
   indices. In-place (not reassign) to match histApply's style and keep any held
   reference valid. The ONE seam a future per-week publish store would hook into
   (state/store.ts:loadWeek calls it). */
export function resetSched(){
  SCHED.al=0; SCHED.pending={}; SCHED.changes={}; SCHED.added={};
  SCHED.als=[]; SCHED.dayOK={}; SCHED.sign={}; SCHED.orig={};
  SCHED.cur={}; SCHED.drafts={}; SCHED.curDraft={};
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
   checked against CURWEEK so a wrong-week book is caught too (P2-REREVIEW-04). */
export function protectedWeek(){return amFormatOf(SCHED,CURWEEK)==='unsupported';}
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
/* the item count is the length of the frozen canonical diff (§3 — counts derive
   from the diff, not from a live key list that a later delete could shrink). */
export function alCount(rec:any){return rec&&rec.diff?rec.diff.length:0;}
/* the per-day sequence numbers this day has issued, ascending (1 = AL1 …). */
export function dayALs(di:any){di=+di;return SCHED.als.filter((a:any)=>+a.di===di).map((a:any)=>+a.seq).sort((a:any,b:any)=>a-b);}
/* per-kind counts off a frozen canonical diff — for the AL history and the
   pending summary (kinds: add | delete | change | move | input). */
export function diffCounts(diff:any){const d=diff||[];const by=(k:any)=>d.filter((e:any)=>e.kind===k).length;
  return {total:d.length,add:by('add'),del:by('delete'),chg:by('change'),mov:by('move'),inp:by('input')};}
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
  if(!daySigned(di))return toast(`${DAYS[di].dow} needs ${signMissing(di).join(', ')} before it can be published`);
  stampAmFormat();   // first publish of a validated empty pre-Phase-2 draft keeps it 'current' (P2-IMPL-04)
  /* the day goes out AS IT STANDS. Everything pending on it up to this moment
     is the draft build, not an amendment to something previously issued —
     leaving those marks meant the day's first AL re-issued the whole day and
     claimed to have "changed" every field the schedulers had ever typed. */
  Object.keys(SCHED.pending).forEach((k:any)=>{if(keyDay(k)===di)delete SCHED.pending[k];});
  Object.keys(SCHED.added||{}).forEach((k:any)=>{if(keyDay(k)===di)delete SCHED.added[k];});
  SCHED.dayOK[di]=1; signClear(di);          // the signature is spent on the issue
  /* Original = the day as FIRST published, per-day sequence 0. Its immutable
     verId (dayIso#0) is what the resolvers name it by, and cur is stamped to it
     so the day now shows its Original. Frozen forever once issued. */
  SCHED.orig=SCHED.orig||{};
  const iso=dayIso(CURWEEK,di);
  SCHED.orig[di]={id:verId(iso,0),...daySnap(di)};
  SCHED.cur=SCHED.cur||{}; SCHED.cur[di]=verId(iso,0);
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
   Nothing here persists past the session — neither does the AL list itself. */
export function daySnap(di:any){di=+di;
  const c:any={}; Object.keys(SCHED.changes).forEach((k:any)=>{if(keyDay(k)===di)c[k]=SCHED.changes[k];});
  return {d:JSON.parse(JSON.stringify(DAYS[di])),c,fil:dayFilingFingerprint(di)};}
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
/* the filing axis: entries for any input whose frozen state differs from now.
   A same-actual-state round trip (r→u→r) is a no-op; absent→u→r is a delta. */
function filingDelta(di:any,issuedFil:any):DeltaEntry[]{
  const now=dayFilingFingerprint(di), was=issuedFil||{}, out:DeltaEntry[]=[];
  const ids=new Set([...Object.keys(now),...Object.keys(was)]);
  ids.forEach((id:any)=>{ const a=was[id]||'', b=now[id]||''; if(a!==b)out.push({addr:`inp:${di}.${id}`,kind:'input',from:a,to:b}); });
  return out;}
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
  return canonicalDiff(snap.d,DAYS[di],di).concat(filingDelta(di,snap.fil));}
export function dayDelta(di:any):DeltaEntry[]{return dayDeltaIn(SCHED,di,CURWEEK);}
/* the publish trigger + every publication affordance (P2-02/P2-07): a published
   day has changes iff its normalized delta is non-empty. Derived SOLELY from
   dayDelta — the one authority for eligibility, the panel counts and the stored
   diff (F-02). The old digest fast-path is gone (P2-IMPL-07): the positional
   digest flips on a reorder whose EFFECTIVE display order is unchanged (a ground
   move a gman/time-sort compensates), which enabled a zero-change AL the panel
   then offered no way to publish. dayDelta already gates on dayApproved + a
   resolvable issued snapshot, so this reads straight through it. */
export function dayHasChanges(di:any):boolean{di=+di;return dayDelta(di).length>0;}
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
  return canonicalDiff(snap.d,DAYS[di],di).length;}
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
  if(protectedWeek())return {seq:0,id:null,sign:{},count:0};
  stampAmFormat();   // defensive: an AL on a validated (supported) book keeps it 'current' (P2-IMPL-04)
  const seq=nextSeq(di), iso=dayIso(CURWEEK,di), id=verId(iso,seq);
  /* the canonical delta vs the CURRENT issued version, captured BEFORE the marks
     move to changes — this is the frozen record of what this AL changed. */
  const diff=dayDelta(di);
  const keys=Object.keys(SCHED.pending).filter((k:any)=>keyDay(k)===di);
  /* a still-outstanding draft add on this day becomes part of the frozen
     snapshot, so it wears this AL's colour and its live-only marker is cleared. */
  Object.keys(SCHED.added||{}).forEach((k:any)=>{if(keyDay(k)===di&&!keys.includes(k))keys.push(k);});
  keys.forEach((k:any)=>{SCHED.changes[k]=seq; delete SCHED.pending[k];});
  Object.keys(SCHED.added||{}).forEach((k:any)=>{if(keyDay(k)===di)delete SCHED.added[k];});
  const sign=signNames(di);
  /* freeze the day AFTER its marks are on — this is the document */
  const snap=daySnap(di);
  SCHED.als.push({id,di,iso,seq,snap,diff,sign:{[di]:sign}});
  SCHED.cur=SCHED.cur||{}; SCHED.cur[di]=id;   // issuing makes it current
  signClear(di);
  reflow(); histPush();   // publishing is its own undo step, not a silent baseline shift
  return {seq,id,sign,count:diff.length};
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
  if(!dayHasChanges(di))return toast(`No changes to publish on ${DAYS[di].dow}`);
  const seq=nextSeq(di);
  if(!daySigned(di))return toast(`Sign off ${signMissing(di).join(', ')} before publishing AL${seq}`);
  const {sign,count}=alIssue(di);
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
  Object.keys(SCHED.pending).forEach((k:any)=>{ if(!orig[keyDay(k)])delete SCHED.pending[k]; });
  reflow(); histPush(); toast('Pending marks cleared');
}
/* re-validate + repaint every visible surface */
export const SIGN_ROLES:any[]=[['cur','CUR CK',false],['sked','SKED CK',true],['plan','PLANNED BY',true],['appr','APPROVED BY',true]];
export function signOf(di:any){SCHED.sign=SCHED.sign||{}; return (SCHED.sign[+di]=SCHED.sign[+di]||{cur:'',sked:'',plan:'',appr:''});}
/* a name only counts while it is still appointed — withdrawing someone's
   Scheduler qual after they signed used to leave the day looking signed */
export function signMissing(di:any){const g=signOf(di);
  return SIGN_ROLES.filter((r:any)=>!g[r[0]]||(r[2]&&!isScheduler(g[r[0]]))).map((r:any)=>r[1]);}
export function daySigned(di:any){return signMissing(di).length===0;}
export function signClear(di:any){SCHED.sign[+di]={cur:'',sked:'',plan:'',appr:''};}
export function signNames(di:any){const g=signOf(di),o:any={};SIGN_ROLES.forEach((r:any)=>{const p=PEOPLE[g[r[0]]];o[r[0]]=p?p.cs:'';});return o;}
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
