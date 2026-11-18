/* TEST WORLDS ONLY — never imported by the app (test-support/no-app-import.test.ts holds that).
   A test that resets the schedule's or the people's memory OUTSIDE every command (DAYS, INPUTS or PEOPLE emptied or
   refilled from a snapshot in a beforeEach) leaves the saved baselines the commands diff against pointing at the world
   before the reset: the next command's save then reports every record the reset dropped as deleted by that command —
   the 149 seed inputs among them — and the commit gate rightly refuses a 142 admin deleting another squadron's inputs
   (the second fix read, 18 Nov 26 — Opus 7, Fable's plan §3). The app never changes that memory outside a command, so
   the fault is the test world's: settleWorld() re-reads both baselines from memory, as the app's own boot does, so the
   test starts from a settled world. No flag reaches the gate; nothing in the app changes. */
import { resyncSchedBaseline } from '../state/sched-commit'
import { resyncPeopleBaseline } from '../state/people-settings-commit'

export function settleWorld(): void {
  resyncSchedBaseline()
  resyncPeopleBaseline()
}
