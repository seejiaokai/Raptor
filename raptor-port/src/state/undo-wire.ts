/* [GLOBAL-UNDO] §13 phase 2 — the LIVE cutover wiring (design §8/§9, plan Rev 3
   step 7 / "2.3 remaining").

   This is the ONE place the global undo timeline is turned on in production: it
   installs the stream subscriber, registers the three real stores against the
   collections they own, declares the cut-over module set, and supplies the app
   hooks the engine calls during a restore (view-snap, bubble, locks, publish-day
   resolve, the per-entry publish adjustment). Until this runs, `cutover` is empty
   and globalUndo/globalRedo are no-ops — the engine records but drives nothing.

   Called once from main.tsx after both history baselines are taken (histInit /
   lwHistInit) and before the probe bridge. Kept OUT of main.tsx itself so the
   whole cutover — every hook and every registration — reads in one file, and so
   the button retarget (§9) imports the same helpers.

   Ordinary TS/React-layer style (new file). */
import {
  installUndo, registerUndoStore, setCutoverModules, setUndoHooks,
} from '../undo'
import type { RecordCtx, UndoEntry } from '../undo/types'
import { weekOf } from '../undo/derive'
import { schedStore, schedPostRestore } from './sched-commit'
import { weekstashStore, loadWeek } from './store'
import { HIST } from './history'
import { armDrop, prunePreviews, SBDAY } from './view'
import { boardTab } from '../ui/board'
import { toast } from '../ui/toast'
import { CURWEEK } from '../engine/waves'
import { parseVerId, dayIso } from '../engine/verid'
import { lwStore, LW_COLLS, selectWar, focusDay, bumpLwHistEpoch } from '../leavewar/state/store'

/* the 8 collections schedStore owns (the scheduler week + inputs + plan). NOT
   `weekstash` — that is the separate weekstashStore's one collection, registered
   below, so an off-week undo routes through its CURWEEK-guarded write() seam. */
const SCHED_COLLS = ['days', 'sched.book', 'sched.mutes', 'sched.orig', 'sched.als', 'sched.retired', 'inputs', 'plan']

/* ---- context helpers ------------------------------------------------------ */

/* is the week context W carried ONLY by weekstash records in this closure? An
   off-week edit's only record is the stash blob (`weekstash/<wk>`); a loaded-week
   edit also carries days / sched.* records for the same week. loadContext must NOT
   loadWeek a weekstash-only context (C7): loading it makes the week CURWEEK, and
   the weekstash write() seam then refuses (its blob would be lost by persistAll). */
function weekIsStashOnly(entry: UndoEntry, wk: string): boolean {
  let sawWeek = false
  for (const ch of entry.forward) {
    if (weekOf(ch.collection, ch.id) !== wk) continue
    sawWeek = true
    if (ch.collection !== 'weekstash') return false   // a real loaded-week record
  }
  return sawWeek
}

/* the day index a scheduler closure touched (days `<wk>#<di>` / sched.orig
   `<wk>:<di>`), for the view-snap. First match wins. */
function schedDayOf(entry: UndoEntry): number | null {
  for (const ch of entry.forward) {
    if (ch.collection === 'days') return Number(ch.id.split('#')[1])
    if (ch.collection === 'sched.orig') return Number(ch.id.slice(ch.id.indexOf(':') + 1))
  }
  return null
}

/* the date an LW closure touched (lw.cell / lw.bid id = `<warId>:<pid>:<date>`,
   the date is the LAST segment — a warId may itself contain ':'). */
function lwDateOf(entry: UndoEntry): string | null {
  for (const ch of entry.forward) {
    if (ch.collection === 'lw.cell' || ch.collection === 'lw.bid') {
      const p = ch.id.split(':')
      if (p.length >= 3) return p[p.length - 1]
    }
  }
  return null
}

/* ---- the hooks (UndoHooks) ------------------------------------------------- */
function loadContext(ctx: RecordCtx, entry: UndoEntry): void {
  if (ctx.kind === 'week') {
    if (weekIsStashOnly(entry, ctx.weekId)) return   // off-week apply via the stash — do NOT load (C7)
    if (ctx.weekId !== CURWEEK) loadWeek(ctx.weekId)
  } else if (ctx.kind === 'war') {
    selectWar(ctx.warId)
  }
  // 'course' / 'page' — not cut over in phase 2; nothing to load.
}

function snapView(entry: UndoEntry, _dir: 'undo' | 'redo'): void {
  if (entry.scope.module === 'lw') {
    const date = lwDateOf(entry)
    if (date) focusDay(date)
    return
  }
  // scheduler / inputs / plan: if the board is open, bring the changed day onto it
  // (view-only, best-effort — the shell's week view already shows the loaded week).
  const di = schedDayOf(entry)
  if (di != null && SBDAY != null && SBDAY !== di) boardTab(di)
}

/* §3.4 / Fable N9 — hold the scheduler HIST.lock for the restore's duration, so
   the deferred histPush the restore's write() raises no-ops (a legacy step would
   feed the barrier-blind E3 hazard). The LW half is redundant — lwStore.write
   already runs its persist under locked(). Returns the un-lock. */
function reinstallLocks(): () => void {
  const prev = HIST.lock
  HIST.lock = true
  return () => { HIST.lock = prev }
}

/* §6.3 — resolve an AL/publish boundary's issued verId to its day when the
   closure carries no days/sched.orig key. A publish always lands on the loaded
   week, so match the id's ISO date against CURWEEK's seven days (best-effort). */
function resolvePublishDay(id: string): { weekId: string; di: number } | null {
  const iso = parseVerId(id).iso
  for (let di = 0; di < 7; di++) if (dayIso(CURWEEK, di) === iso) return { weekId: CURWEEK, di }
  return null
}

/* §6.2/C5 + the restore epilogue (Fable N5). schedPostRestore clears the day's
   sign-offs on undo of a publish (GU5-005); the epilogue reproduces what the
   legacy histApply does after a restore but the write() seam does not:
   - armDrop(): a swapped-out model may leave the armed slot pointing at a row that
     no longer exists — put it down before anything repaints.
   - prunePreviews(): a day previewing a version the undo just un-published would
     otherwise render the live day while claiming to show history.
   - bumpLwHistEpoch(): signal the LW matrix to drop any in-flight drag/select.
   Runs INSIDE the restore reducer, so it precedes the deferred reflow — the same
   order histApply uses (armDrop/prunePreviews before reflow). */
function postRestore(entry: UndoEntry, dir: 'undo' | 'redo'): void {
  schedPostRestore(entry, dir)
  armDrop()
  prunePreviews()
  bumpLwHistEpoch()
}

/* ---- the cutover ---------------------------------------------------------- */
/* Idempotent by construction: installUndo guards its own stream subscription,
   registerUndoStore is a Map set, and setCutoverModules/setUndoHooks replace.
   So a second call (e.g. a test after _resetTimeline) re-establishes the same
   wiring harmlessly rather than being skipped by a stale one-shot flag. */
export function installGlobalUndo(): void {
  installUndo()
  registerUndoStore(schedStore, SCHED_COLLS)
  registerUndoStore(lwStore, LW_COLLS as unknown as string[])
  registerUndoStore(weekstashStore, ['weekstash'])
  setCutoverModules(['sched', 'lw', 'inputs', 'plan'])
  setUndoHooks({
    loadContext,
    snapView,
    showBubble: (text: string) => toast(text),
    reinstallLocks,
    resolvePublishDay,
    postRestore,
    // currentActor OMITTED — the timeline defaults to deriveActor().
  })
}
