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

   SESSION-ONLY, DELIBERATELY (owner, 23 Aug 26 — "It's ok that u don't
   remember once I exit the session. Just like the rest. Just that when I go
   between sun and mon it can't be that it disappears"): everything else a
   scheduler types — INPUTS, the Leave War (its 17 Aug 26 lockstep decision)
   — already forgets on exit, and a schedule that reloaded remembered while
   the inputs that fed it did not would be the exact mixed-memory confusion
   that lockstep exists to prevent. So no localStorage: a reload returns
   every week to the plan, the same as the rest of the app. When true
   persistence arrives it is the future shared-server step through
   HOOKS.storeBackend (HANDOFF.md), for all of this state at once — do not
   re-add a browser-local envelope for just this piece. */
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
export function stashClear(){ for(const k in WEEKSTASH)delete WEEKSTASH[k]; for(const k in GEN)delete GEN[k]; }
export function stashGet(v:any){ return WEEKSTASH[String(v)]||null; }
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
