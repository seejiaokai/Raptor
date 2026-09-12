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
  delete WEEKSTASH[k]; GEN[k]=(GEN[k]||0)+1; return true; }
export function stashGet(v:any){ return WEEKSTASH[String(v)]||null; }
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
/* A FRESH deep copy, in weekBundle's {days,dates} shape, for engine readers
   (weekctx.ts's bundle()) — NEVER cached, unlike the pure seed bundle it
   stands in for: stash content changes as the user keeps editing the week it
   belongs to, so every call must re-parse. `dates` is not carried in the
   stash JSON at all — it is a pure function of v alone (weeks-data.ts's own
   weekLabels), so re-deriving it here costs nothing and the stash has
   somewhere better to spend its bytes than a value it could not disagree
   with anyway. Returns null when nothing is stashed for v — callers branch
   on that themselves (weekctx.ts's bundle, state/store.ts's loadWeek). */
export function stashDays(v:any){
  const s=stashGet(v); if(!s)return null;
  /* a blob that fails to parse (truncated write, foreign data) degrades to
     "as if never edited" — callers fall back to the pure seed. Never throw:
     this is read inside validate(), which runs on every keystroke. */
  try{
    const days=JSON.parse(s).d, dates=weekBundle(v).dates;
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
