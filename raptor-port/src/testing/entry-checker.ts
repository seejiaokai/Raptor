/* THE ENTRY CHECKER — loaded into every test file of both suites (vite.config.ts setupFiles; the Leave War suite's own
   setup imports it), in the pattern of the marks guard beside it (the guard rail's plan,
   docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md §3.4; step K7). It is never part of the app: the seam it
   hooks into (state/guard.ts setEntryChecker) is a no-op there.

   Two checks, over every test the repo runs:
   1. NO SQUADRON OR VIEW CHANGE BY PRESS GOES THROUGH WITH SOMETHING OPEN THAT ITS DOOR DID NOT LEAVE OUT. Each refuse()
      that passes hands the checker its door and `skip` — the leave, good for the synchronous turn it was given in.
      state/store.ts enterSquadron (with `byPick`) and state/perms.ts switchRoleInForce ask the checker first: it asks the
      guard again (refusalAt), with the leave's `skip`, or with none where no door gave a leave, and where that refuses it
      throws, naming the open row and the door. So the OIL list's card and the held window's chip pass with exactly their
      own window left out, a second window still fails them, a raw entry with anything open fails, and a raw entry with
      nothing open passes as before. A press that waited is covered without more code: the Tracker's `again` re-runs the
      whole tap, and the landing asks the guard again with the door it kept — each ask is the leave for the entry after it.
   2. NOTHING OPENS BEHIND A REFUSAL. At each refuse() that refuses the checker notes which counted rows are open (every
      row of ui/guard.ts GUARD_ROWS but the 'no' ones); at the end of that turn (a microtask) a counted row that is open
      and was not fails the test by name.
   A failure throws where it can (check 1, inside the door's own call) and is always also kept and thrown again from
   afterEach, so a throw swallowed by an event handler (jsdom reports it and goes on) or by a promise nobody awaits still
   fails the test it happened in.

   ITS LIMIT, said and not tested for: it sees only an entry made with `byPick` true, and the role switch. A squadron
   change his press causes through state/store.ts maybeReenter (`byPick` false — the Undo of "+ New squadron" with that
   squadron in view, §4.1 row 21, is the one known) is invisible to it; the roll-call's R5 (a), §4.1's table and the walk
   hold that family.

   THE GUARD ANSWERS IN EVERY TEST: ui/guard.ts installs its answer into the seam as it loads, so it is imported here — in
   a beforeAll, after the test file's own imports, never at the top of this file: a module a setup file imports is loaded
   before the test file's vi.mock calls take hold, and ui/guard.ts reaches the store, the Leave War and the Tracker, which
   some files mock.

   A STATE NO PRESS REACHES ANY MORE, MADE ON PURPOSE — the allow-list (Build 2 empties it). Two ways in, the flag first:
   - BY FLAG: state/store.ts switchRoleViewRaw (the raw switch) and test-support/raw-entry.ts rawEnter (the raw entry)
     tell the checker themselves, through state/guard.ts rawOnPurpose, that the entries of the turn they run in are raw on
     purpose. A test that makes such a state through them needs no line here.
   - BY NAME: RAW_BY_NAME below — a test that makes it any other way (a raw switchRoleInForce, a page set raw so that the
     landing enters), by its file and full name, with the reason. */
import { afterEach, beforeAll, beforeEach, expect } from 'vitest'
import { setEntryChecker, refusalAt, type EntryChecker, type GuardOpts, type GuardRefusal } from '../state/guard'

/* by name: { file — the test file's path under src/, test — its full name as vitest gives it (describe > … > test),
   why }. Matched exactly. */
export const RAW_BY_NAME: readonly { file: string; test: string; why: string }[] = []

type Leave = { door: string; opts: GuardOpts }
export type CheckerDeps = {
  /** the guard's own ask (the seam's refusalAt in the installed checker) */
  ask: (door: string, to: string, opts: GuardOpts) => GuardRefusal | null
  /** the ids of the counted rows open now */
  openRows: () => string[]
  /** true where the test running made this state raw on purpose by name (the installed checker reads RAW_BY_NAME) */
  rawByName?: () => boolean
}
export type Checker = { hooks: EntryChecker; failures: string[]; reset: () => void }

/** a checker over the given guard and rows — the installed one below, and R6's (ui/msq-guard-rollcall.test.ts) */
export function makeEntryChecker(deps: CheckerDeps): Checker {
  const failures: string[] = []
  let leave: Leave | null = null
  let raw = false
  /* each lasts for the synchronous turn it was set in: cleared by a microtask, unless set again meanwhile */
  const forTurn = (clear: () => void) => { queueMicrotask(clear) }
  const fail = (msg: string): never => {
    failures.push(msg)
    throw new Error(msg)
  }
  const hooks: EntryChecker = {
    leave(door, _to, opts) {
      const mine: Leave = { door, opts }
      leave = mine
      forTurn(() => { if (leave === mine) leave = null })
    },
    refused(door, _to, _opts, r) {
      let before: string[]
      try { before = deps.openRows() } catch { return }
      forTurn(() => {
        let now: string[]
        try { now = deps.openRows() } catch { return }
        const opened = now.filter(id => !before.includes(id))
        if (opened.length) failures.push(`[entry-checker] opened behind a refusal: ${opened.join(', ')} — the press at the door '${door}' was refused for "${r.id}" (${r.reason}), and the same turn opened it`)
      })
    },
    entry(what, to) {
      if (raw || deps.rawByName?.()) return
      const skip = leave?.opts.skip ?? []
      const r = deps.ask(leave?.door ?? 'entry', to, { skip: [...skip] })
      if (!r) return
      const how = what === 'enter' ? `a squadron entered by press (${to})` : `the view switched (to ${to})`
      const door = leave ? `the door '${leave.door}' gave the leave${skip.length ? `, leaving out ${skip.join(', ')}` : ''}` : 'no door gave a leave in this turn'
      fail(`[entry-checker] ${how} with "${r.id}" open (${r.reason}) — ${door}`)
    },
    raw() {
      raw = true
      forTurn(() => { raw = false })
    },
  }
  return { hooks, failures, reset: () => { failures.length = 0; leave = null; raw = false } }
}

/* THE INSTALLED ONE */
type GuardModule = typeof import('../ui/guard')
let G: GuardModule | null = null
const countedOpen = (): string[] => (G ? G.GUARD_ROWS.filter(r => r.counts !== 'no' && r.open()).map(r => r.id) : [])
const srcPath = (p: string | undefined): string => (p ?? '').split('\\').join('/').replace(/^.*\/src\//, '')
const rawByName = (): boolean => {
  const s = expect.getState()
  const file = srcPath(s.testPath), test = s.currentTestName ?? ''
  return RAW_BY_NAME.some(e => e.file === file && e.test === test)
}
export const INSTALLED: Checker = makeEntryChecker({ ask: refusalAt, openRows: countedOpen, rawByName })
setEntryChecker(INSTALLED.hooks)

/* ONLY WHERE A DOOR CAN BE REACHED. Every door lives in, or imports, state/store.ts, so a test file that has not loaded it
   after its own imports presses none, and there the guard is not loaded: loading it pulls the store, the Leave War and the
   Tracker's bridge into a file of the engine's alone, whose own registries then change under it (found by K7's first full
   run: the edit log's and the view-reset registry's tests, whose files import no store, went red only for the modules the
   guard brought in), and it cost such a file seconds under a full parallel run. Which modules a file has loaded is read
   from vitest's own module registry (its worker state, vitest 4); where that cannot be read the guard is always loaded,
   so a change of vitest makes the checker stricter, never silent. */
const STORE = /\/src\/state\/store\.ts$/
function storeLoaded(): boolean {
  const map: Map<string, unknown> | undefined = (globalThis as any).__vitest_worker__?.evaluatedModules?.idToModuleMap
  if (!map || typeof map.keys !== 'function') return true
  for (const id of map.keys()) if (STORE.test(String(id).split('\\').join('/'))) return true
  return false
}
/* (a minute: a file that reaches the store but not the guard loads the guard's graph here, which under a full parallel run
   took longer than vitest's 10 s for a hook — headroom, not a target) */
beforeAll(async () => { if (storeLoaded()) G = await import('../ui/guard') }, 60_000)
beforeEach(() => { INSTALLED.reset() })
afterEach(async () => {
  /* the microtasks of the test's last turn run first, so a window opened behind its last refusal is seen */
  await Promise.resolve()
  if (!INSTALLED.failures.length) return
  const all = INSTALLED.failures.splice(0)
  throw new Error(all.join('\n'))
})
