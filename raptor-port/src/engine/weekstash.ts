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

   PERSISTENCE, not just an in-session cache: a versioned localStorage
   envelope through the existing engine/hooks.ts `store` seam, so a page
   reload survives too (`sqn142_weeks`, `{v:SCHEMA_V, weeks:{...}}`). Loaded
   lazily on first touch (not at module scope — storeBackend.impl is wired by
   the app after this module has already loaded) and re-written on every
   stashPut. LAST-WRITE-WINS across tabs: this is a single-user, per-browser
   app with no merge machinery anywhere else, so a second tab simply
   overwrites the blob the way every other `store.set` in this app already
   does. Every read/write is wrapped — a missing, corrupt or version-mismatched
   blob is silently dropped and overwritten on the next put, never thrown; a
   `try/catch` around a private-browsing quota error keeps a stash failure
   from ever becoming a crash. BUMP SCHEMA_V the day a stashed entry's shape
   stops matching what loadWeek expects back (a new SCHED field, a renamed
   one) — an old blob under the old version is exactly a "corrupt" blob to a
   newer reader and is dropped the same way. */
import { store } from './hooks'
import { weekBundle } from './weeks-data'

const SCHEMA_V=1;
const WEEKSTASH:Record<string,string>={};
let loaded=false;
function loadPersisted(){
  if(loaded)return; loaded=true;
  try{
    const blob:any=store.get('weeks',null);
    if(blob&&blob.v===SCHEMA_V&&blob.weeks&&typeof blob.weeks==='object'){
      Object.keys(blob.weeks).forEach((k:any)=>{ if(typeof blob.weeks[k]==='string')WEEKSTASH[k]=blob.weeks[k]; });
    }
  }catch(_e){ /* corrupt/foreign blob — start clean, as if nothing was stashed */ }
}
function persist(){ try{ store.set('weeks',{v:SCHEMA_V,weeks:WEEKSTASH}); }catch(_e){} }

/* v is a dd/mm/yyyy week-start key (the same one CURWEEK carries); json is a
   whole snapshot string state code built (see state/store.ts's
   weekStashSnap / state/history.ts's schedFields — the two must not drift). */
export function stashPut(v:any,json:any){ loadPersisted(); WEEKSTASH[String(v)]=json; GEN[String(v)]=(GEN[String(v)]||0)+1; persist(); }
/* HOW MANY TIMES v's stash has been (re)written this session — a cheap
   change signal for renderers that CACHE something derived from a stashed
   week (ui/peek.ts keys its next-week preview on this): boot-time loads
   from localStorage do not bump it (nothing derived exists yet to be
   stale), only live stashPut writes do. Per-key, so an edit to the LOADED
   week never invalidates a preview derived from a different week. */
const GEN:Record<string,number>={};
export function stashGenOf(v:any){ return GEN[String(v)]||0; }
export function stashHas(v:any){ loadPersisted(); return Object.prototype.hasOwnProperty.call(WEEKSTASH,String(v)); }
export function stashGet(v:any){ loadPersisted(); return WEEKSTASH[String(v)]||null; }
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
  try{ return {days:JSON.parse(s).d, dates:weekBundle(v).dates}; }catch(_e){ return null; }
}
