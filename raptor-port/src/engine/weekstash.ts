/* WEEK STASH — per-week SESSION MEMORY across navigation (owner-reported bug:
   a duty added on the Sunday of an unauthored week vanished after scrolling
   to the next week and back). loadWeek used to discard the whole live model
   on every switch and rebuild it from weekBundle's PURE seed — correct for a
   week nobody has touched, silent data loss for one a scheduler actually
   edited. This module is the dumb store half: it remembers, per week-start
   key, the last snapshot state/store.ts handed it on the way OUT of a week,
   and hands a fresh deep copy back on the way IN. It holds no opinion about
   WHAT belongs in a snapshot — that shape is state code's call (WARNOFF lives
   in state/view.ts, and the engine may not import state/), so this file only
   ever sees the JSON string state/history.ts (schedFields) and state/store.ts
   (loadWeek) build.

   PERSISTED THROUGH THE WHITEBOARD (8 Sep 26, the storage seam — owner:
   "everything persists"). This module is still the in-session memory and
   holds no opinion about storage; state/persist.ts reads every stashed
   week out of here on each history step and writes it to the whiteboard
   (`weeks/<dd-mm-yyyy>`), and at boot stashes every stored week back in
   BEFORE initStore, which restores the current one through applyWeekModel.
   The 23 Aug 26 session-only decision is superseded; the lockstep worry it
   answered (a schedule that remembered while its inputs forgot) cannot
   recur because inputs, people, the plan layer and every week now persist
   together or not at all. */
import { weekBundle } from './weeks-data'
import { CURWEEK } from './waves'
import { dayIso } from './verid'
import { inputCoversDate } from './inputs'
import { overlayDeletedWeek, deletedSig } from './overlay'

const WEEKSTASH:Record<string,string>={};

/* v is a dd/mm/yyyy week-start key (the same one CURWEEK carries); json is a
   whole snapshot string state code built (see state/store.ts's
   weekStashSnap / state/history.ts's schedFields — the two must not drift). */
export function stashPut(v:any,json:any){ WEEKSTASH[String(v)]=json; GEN[String(v)]=(GEN[String(v)]||0)+1; }
/* HOW MANY TIMES v's stash has been (re)written this session — a cheap
   change signal for renderers that CACHE something derived from a stashed
   week (ui/peek.ts keys its next-week preview on this). Per-key, so an
   edit to the LOADED week never invalidates a preview derived from a
   different week. */
const GEN:Record<string,number>={};
export function stashGenOf(v:any){ return GEN[String(v)]||0; }
export function stashHas(v:any){ return Object.prototype.hasOwnProperty.call(WEEKSTASH,String(v)); }
/* WIPE ALL SESSION MEMORY — a real reload does this by discarding the module,
   which tests can't; call it to return the stash to first-boot (no week
   remembered). Not wired to any product path: the app only ever grows this
   store during a session, exactly as the header comment describes. */
export function stashClear(){ for(const k in WEEKSTASH)delete WEEKSTASH[k]; for(const k in GEN)delete GEN[k]; for(const k in PRESERVED)delete PRESERVED[k]; }
/* DROP ONE WEEK's memory — the Admin clear-old-data sweep (owner, 25 Aug 26).
   The gen is BUMPED, never reset: ui/peek.ts caches previews keyed by
   (week, gen), so resetting to 0 and then stashing again could re-serve a
   stale preview under a collided key. A bump reads as "this week changed",
   which is exactly what a drop is. */
export function stashKeys(){ return Object.keys(WEEKSTASH); }
export function stashDrop(v:any){ const k=String(v);
  if(!Object.prototype.hasOwnProperty.call(WEEKSTASH,k))return false;
  delete WEEKSTASH[k];
  /* also drop any preserved (byte-frozen) blob for this week (P2-QREV/Fable-12):
     the Admin "clear old data" sweep calls stashDrop, and leaving PRESERVED set
     let state/persist.ts rewrite the frozen blob back on the next history step,
     so a cleared damaged/legacy week came straight back. */
  delete PRESERVED[k];
  GEN[k]=(GEN[k]||0)+1; return true; }
/* PRESENCE by explicit key, NOT by truthiness (Q2R-08): the old `||null` collapsed
   a present-but-EMPTY blob ('' — a truncated/foreign whiteboard read) to null, so
   protectedDates()/applyWeekModel/the OIL pass all read it as a genuinely ABSENT
   week and seeded over it, instead of quarantining a damaged record. An empty
   string is now returned as-is (present); only a truly missing key is null. */
export function stashGet(v:any){ return stashHas(v)?WEEKSTASH[String(v)]:null; }
/* PRESERVED (byte-frozen) BOOKS — a week loaded from a PRE-Phase-2 (unsupported)
   snapshot is READ-ONLY and its engine cannot safely re-key it, so it must round-
   trip byte-for-byte: state/store.ts skips every id migration/normalization for
   it and registers its ORIGINAL blob here, and state/persist.ts writes THAT blob
   back verbatim instead of a re-serialization that would overwrite the recovery
   evidence (P2-IMPL-02). Keyed by the dd/mm/yyyy week key, like the stash. */
const PRESERVED:Record<string,string>={};
export function setPreservedBlob(v:any,json:any){ PRESERVED[String(v)]=String(json); }
export function preservedBlob(v:any){ return Object.prototype.hasOwnProperty.call(PRESERVED,String(v))?PRESERVED[String(v)]:null; }
export function isPreservedWeek(v:any){ return Object.prototype.hasOwnProperty.call(PRESERVED,String(v)); }
export function clearPreservedBlob(v:any){ delete PRESERVED[String(v)]; }
/* [CMDL-FINISH] §6 — snapshot/restore BOTH maps for the enlisted weekstashStore
   (an off-week clear that drops a stash must roll back atomically with its input
   batch). restore bumps GEN for every affected key so ui/peek.ts's (week,gen)
   preview cache cannot re-serve a stale preview after a rollback. */
export function snapshotStash():{w:Record<string,string>;p:Record<string,string>}{
  return { w:{...WEEKSTASH}, p:{...PRESERVED} };
}
export function restoreStash(snap:{w:Record<string,string>;p:Record<string,string>}):void{
  const touched=new Set<string>([...Object.keys(WEEKSTASH),...Object.keys(snap.w||{})]);
  for(const k in WEEKSTASH)delete WEEKSTASH[k];
  Object.assign(WEEKSTASH,snap.w||{});
  for(const k in PRESERVED)delete PRESERVED[k];
  Object.assign(PRESERVED,snap.p||{});
  for(const k of touched)GEN[k]=(GEN[k]||0)+1;
}
/* the stashed weeks as [key, blob] pairs — the record source for weekstashStore. */
export function stashEntries():Array<[string,string]>{ return Object.entries(WEEKSTASH); }
/* [GLOBAL-UNDO] §13 phase 1 — the undo/restore write() seam for the weekstash. A
   weekstash record is a whole-week blob STRING keyed by week, so an off-week edit
   captured on the stream (finding I) round-trips: op 'put' sets the blob, 'delete'
   drops it, and GEN bumps so ui/peek.ts's (week,gen) preview cache cannot re-serve a
   stale preview. Strings are immutable, so no clone-on-write is needed here. */
export function writeStashRecords(entries:Array<{id:string;value?:any;op?:string}>):void{
  for(const e of entries){
    if(e.op==='delete')delete WEEKSTASH[e.id];
    else WEEKSTASH[e.id]=e.value as string;
    GEN[e.id]=(GEN[e.id]||0)+1;
  }
}
/* A FRESH deep copy, in weekBundle's {days,dates} shape, for engine readers
   (weekctx.ts's bundle()) — NEVER cached, unlike the pure seed bundle it
   stands in for: stash content changes as the user keeps editing the week it
   belongs to, so every call must re-parse. `dates` is not carried in the
   stash JSON at all — it is a pure function of v alone (weeks-data.ts's own
   weekLabels), so re-deriving it here costs nothing and the stash has
   somewhere better to spend its bytes than a value it could not disagree
   with anyway. Returns null when nothing is stashed for v — callers branch
   on that themselves (weekctx.ts's bundle, state/store.ts's loadWeek). */
/* THE PUBLISH STATE of a stashed week, in the SCHED shape the parameterized
   publish readers (dayCurVerIn/daySnapIn/dayDeltaIn) take (published-schedule
   flagging, §5.3/§14.2). The blob rides these under schedFields' short keys
   (state/history.ts): ok=dayOK, cv=cur, a=als, o=orig, dr=drafts, am=amV — the same
   mapping the Leave War OIL wire (leavewar/sync.ts:stashOilWeek) uses to read a
   non-loaded week's issued snapshots. null when nothing usable is stashed. Never
   throws — read inside validate(), which runs on every keystroke. */
export function stashSched(v:any){
  const s=stashGet(v); if(!s)return null;
  try{
    const p=JSON.parse(s);
    if(!Array.isArray(p.d))return null;
    return {dayOK:p.ok||{},cur:p.cv||{},als:p.a||[],orig:p.o||{},drafts:p.dr||{},amV:p.am};
  }catch(_e){ return null; }
}
/* stashEditDays / stashEditWeek — the two writers that edited a SAVED week in place (the hand-over's OIL clear,
   [OIL-XWEEK-DENY]; the delete's strip, [POST-OUT-OUTCOMES]) — were removed by the FULL check of [DB-READINESS]
   phase 6 (30 Sep 26): phase 6 (a) and (d) took their last callers away (a hand-over and a delete write no week; the
   effect is worked out on read — engine/overlay.ts), and in the database a week is written only by its day's holder
   (D450), so a writer of weeks nobody holds must not be there to be called again. */
/* can this stashed week be edited — 'ok'; 'preserved' (byte-frozen, P2-IMPL-02); 'unreadable' (no days, or not JSON) */
export function stashWeekState(v:any):'ok'|'preserved'|'unreadable'{
  if(isPreservedWeek(v))return 'preserved';
  const s=stashGet(v); if(!s)return 'unreadable';
  try{ const p=JSON.parse(s); return p&&typeof p==='object'&&Array.isArray(p.d)?'ok':'unreadable'; }catch(_e){ return 'unreadable'; }
}
export function stashDays(v:any){
  const s=stashGet(v); if(!s)return null;
  /* a blob that fails to parse (truncated write, foreign data) degrades to
     "as if never edited" — callers fall back to the pure seed. Never throw:
     this is read inside validate(), which runs on every keystroke. */
  try{
    const parsed=JSON.parse(s);
    /* a blob that parses but carries NO days array is UNREADABLE, not empty
       (P2-REV2-01): return null so the caller falls back to the pure seed, the
       same as an unparseable blob — never a {days:undefined} shape that crashes
       bundle()'s cross-week readers (nextMondayWorked/prevSunday). */
    if(!Array.isArray(parsed.d))return null;
    const days=parsed.d, dates=weekBundle(v).dates;
    /* RE-LABEL every day for the year convention NOW in force (24 Aug 26).
       The stash was written while ITS week was loaded, so its labels leave
       that week's own year implicit — read later under a different loaded
       year (weekctx's cross-week seeds at a New Year boundary), a bare
       'Dec 28' would resolve to the wrong year. dt is index-determined, and
       `dates` was just re-derived under the current convention. */
    (days||[]).forEach((d:any,i:number)=>{ if(d&&dates[i]!=null)d.dt=dates[i]; });
    /* A MAN DELETED, WORKED OUT ON READ ([DB-READINESS] group A, phase 6 (d) — engine/overlay.ts): these are the week's
       WORKING days, as every reader of a saved week sees them (the cross-week checks, the peek, the row finder); a delete
       never rewrites the stored copy. On the parsed copy — the stash itself is untouched. */
    /* …never over a read-only (byte-preserved) week: opening it shows it as it is saved (state/store.ts applyWeekModel),
       so every other read of it must agree — Fable's final read of phase 6, F1 (a belt: the delete refuses while such a
       week holds him on a day to come — person-delete.ts stashPreflight) */
    if(!isPreservedWeek(v))overlayDeletedWeek(String(v),days);
    return {days,dates};
  }catch(_e){ return null; }
}

/* ONE REQUEST, ONE ROW — ACROSS WEEKS ([REQ-ORPHAN-ROW], 28 Sep 26; D175's rule, which acceptInput has always kept for
   the LOADED week only). A request can cover days in two weeks (Sun 19 – Mon 20 Jul); landed on Sunday, its row sits in
   week 1, and once week 2 was loaded its card offered Accept on Monday and made a SECOND row (Fable's G3, D175's
   scenario round). The readers of "is this request's row somewhere else?" — acceptInput's guard, the delete/edit refusal
   (inputedit.tsx landedOnUnloadedWeek), the card (html.ts accCtl), a load's leave-out (publish.ts rowsLeftOut) — ask it
   HERE, one body. READ-ONLY: it never writes a stash, and it never changes a request's filing (`acc` stays week-local —
   Astra 02: a filing read from another week would move a published day's pending count by navigation alone).
   The LOADED week's own entry is skipped: it is the stale copy written on the way out, never read back over DAYS (the
   same rule oilev.ts stashStanding keeps). A week never visited has no entry, so it holds no row. A stash that cannot
   be read FAILS CLOSED for a caller that would otherwise make a second row: 'unreadable' (Fable F7). */
type SrcRows=Map<string,{row:any,di:number}>
const SRC_MEMO=new Map<string,SrcRows|null>()
/* every ground row carrying a request (`src`) in stashed week v, by that request's id — the FIRST row per id, as it
   stands in the week's saved days. null = the week is stashed but cannot be read; an empty map = nothing there (or no
   entry). Memoised on the stored blob itself, so a rewritten week is a new key and can never serve a stale answer. */
export function stashGroundBySrc(v:any):SrcRows|null{
  const blob=stashGet(v);
  if(blob==null)return new Map();
  /* …and on who is deleted from when: the rows are read through stashDays, which works a delete out on read (phase 6 (d)) */
  const key=String(blob)+'\u0000'+deletedSig();
  if(SRC_MEMO.has(key))return SRC_MEMO.get(key)!;
  const parsed:any=stashDays(v);
  let rows:SrcRows|null=null;
  if(parsed&&Array.isArray(parsed.days)){
    rows=new Map();
    parsed.days.forEach((d:any,di:number)=>{ for(const r of ((d||{}).ground||[])){ const s=r&&String(r.src||''); if(s&&!rows!.has(s))rows!.set(s,{row:r,di}); } });
  }
  if(SRC_MEMO.size>32)SRC_MEMO.clear();
  SRC_MEMO.set(key,rows);
  return rows;
}
/* the request's row on a week OTHER than the loaded one: where it stands, or 'unreadable' when a stashed week it COVERS
   could not be read and none was found readable, or null when it stands nowhere else. `inp` (the request) narrows the
   unknown to the weeks it could have a row in — a row stands only on a day its request covers (its card is drawn there)
   — so one unreadable saved week never blocks every other request in the app. Without it, any unreadable week counts. */
export function rowElsewhere(id:any,inp?:any):{week:string,di:number,iso:string,row:any}|'unreadable'|null{
  const want=String(id||''); if(!want)return null;
  let unread=false;
  for(const k of stashKeys()){
    if(k===CURWEEK)continue;
    const m=stashGroundBySrc(k);
    if(m===null){ if(!inp||(weekBundle(k).dates||[]).some((dt:any)=>inputCoversDate(inp,dt)))unread=true; continue; }
    const hit=m.get(want);
    if(hit)return {week:k,di:hit.di,iso:dayIso(k,hit.di),row:hit.row};
  }
  return unread?'unreadable':null;
}
/* "Sun 19 Jul" — a day named the way the day's list and the cards name it (UTC arithmetic, like dayIso) */
const WD=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], MO=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export function isoDayWords(iso:string):string{
  const [y,m,d]=String(iso||'').split('-').map(n=>parseInt(n,10));
  if(!y||!m||!d)return String(iso||'');
  const dt=new Date(Date.UTC(y,m-1,d));
  return `${WD[dt.getUTCDay()]} ${d} ${MO[m-1]}`;
}
