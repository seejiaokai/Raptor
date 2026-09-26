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
/* EDIT A STASHED WEEK'S DAYS IN PLACE ([OIL-XWEEK-DENY], 22 Sep 26). A scheduler
   can hand a request to another man — and back — while a DIFFERENT week is on
   screen, because the Inputs page is global. Anything that must die with that
   assignment therefore has to reach days nobody is looking at, and until now
   nothing could: the write side walked the seven loaded days and the read side
   only HID the key while somebody else held the request.
   Raw days, exactly as stored: no `dt` re-labelling (that is stashDays's job for
   READERS and must never leak back into the blob). `edit` returns true if it
   changed anything, and only then is the week written back — so an untouched
   week's gen is not bumped and every preview keyed on it stays valid.
   A PRESERVED (byte-frozen) week is never rewritten: P2-IMPL-02 makes it
   read-only, and a decision inside one belongs to a book that is closed. */
export function stashEditDays(v:any,edit:(days:any[])=>boolean):boolean{
  if(isPreservedWeek(v))return false;
  const s=stashGet(v); if(!s)return false;
  try{
    const p=JSON.parse(s);
    if(!p||typeof p!=='object'||!Array.isArray(p.d))return false;
    if(!edit(p.d))return false;
    stashPut(v,JSON.stringify(p));
    return true;
  }catch(_e){ return false; }
}
/* EDIT A STASHED WEEK'S WHOLE BLOB — its days `d`, its sign boxes `sg` and their bindings `sb`, its parked plans `dr`
   ([POST-OUT-OUTCOMES], 27 Sep 26 — Fable F9, Astra A1: a delete must reach every copy of a day to come, and
   stashEditDays hands over the days alone). The same rules as stashEditDays: raw, exactly as stored; written back ONLY
   if `edit` changed something; a PRESERVED week never. Readability is asked FIRST by the caller (stashWeekState), so a
   week that cannot be read or is preserved refuses the whole change rather than being skipped. */
export function stashEditWeek(v:any,edit:(blob:any)=>boolean):boolean{
  if(isPreservedWeek(v))return false;
  const s=stashGet(v); if(!s)return false;
  try{
    const p=JSON.parse(s);
    if(!p||typeof p!=='object'||!Array.isArray(p.d))return false;
    if(!edit(p))return false;
    stashPut(v,JSON.stringify(p));
    return true;
  }catch(_e){ return false; }
}
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
    return {days,dates};
  }catch(_e){ return null; }
}
