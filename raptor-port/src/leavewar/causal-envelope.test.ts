/* [CMDL-FINISH] P3 — the F1 causal both-side envelope (§2), tested over the FULL
   wired sync (wireLeaveWarSync), not manual reconciler calls. The make-or-break
   claim: an LW-originated leave approval, whose ripple mints a Raptor input, emits
   that input mint as a PROJECTION causally chained to the approval — not an orphan
   user edit landing at idle (the pre-P3 bug C1). Also: a multi-day leave mints ONE
   spanned input in ONE envelope (N1). Runs in the LW project (fixed TZ). */
import { beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { initStore as raptorInitStore } from '../state/store'
import { projectPeople } from './state/raptorRoster'
import {
  getState, initStore as lwInitStore, setCell, setCellRange, setBidState, setPeople, setRole, advanceStage,
  ingestFromRaptor, lwCanUndo,
} from './state/store'
import { memoryBackend } from './state/storage'
import { wireLeaveWarSync } from './sync'
import { schedStore } from '../state/sched-commit'
import { onCommit, commit, deferEffect, definePermission, anyone } from '../command'
import type { CommitEnvelope } from '../command'

const ISNAP = JSON.stringify(INPUTS)

beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
  wireLeaveWarSync()
})

/* approve a run of LL days the way the app does (bid → close → decide as admin),
   returning the envelopes emitted from the FINAL approving edit onward. */
function approveWatched(person: string, dates: string[]): CommitEnvelope[] {
  setRole('admin')
  for (const d of dates) setCell(person, d, 'LL')
  if (getState().period.stage === 'open') advanceStage()
  // watch only the decisive edit — the one whose ripple mints the input
  const seen: CommitEnvelope[] = []
  const unsub = onCommit(e => seen.push(e))
  for (const d of dates) setBidState(person, d, 'approved')
  unsub()
  return seen
}

describe('F1 — an LW approval mints its Raptor input as a chained projection', () => {
  it('the input mint is a projection whose causedBy points at a real LW edit (not an orphan)', () => {
    const pid = getState().people[0].id
    const seen = approveWatched(pid, ['2026-02-02', '2026-02-03', '2026-02-04'])
    // the leave landed as an lw-tagged Raptor input
    expect(INPUTS.some((r: any) => r.lw && r.person === pid)).toBe(true)
    // it reached the stream as a PROJECTION carrying an inputs change
    const mint = seen.find(e => e.origin === 'projection' && e.changes.some(c => c.collection === 'inputs'))
    expect(mint).toBeDefined()
    // …causally chained to a preceding edit in the same closure, never an orphan (C1)
    expect(mint!.causedBy).toBeDefined()
    const cause = seen.find(e => e.seq === mint!.causedBy)
    expect(cause).toBeDefined()
    // the mint is system-driven, not a stray user envelope (C10)
    expect(mint!.actor.role).toBe('system')
  })

  it('a Raptor-driven LW reconcile pushes NO Leave War undo step (lw.hist effect context — CMDLF-001)', () => {
    definePermission('test.raptor', anyone)
    const pid = getState().people[0].id
    // a Raptor command whose phase-8 effect lands an LW cell via the inbound sync
    // writer (under LW locked()). The queued lw.sync projection runs at drain,
    // AFTER the lock unwound — without the lw.hist context its recordHistory would
    // push a spurious LW undo step. With the fix it must not.
    commit({
      type: 'test.raptor', scope: { module: 'sched', weekId: 'X' } as any,
      apply: (txn) => {
        txn.enlist(schedStore)
        deferEffect(() => { ingestFromRaptor(pid, '2026-02-02', 'LL') })
      },
    })
    expect(lwCanUndo()).toBe(false)
  })

  it('a multi-cell LW edit (setCellRange) is ONE envelope listing every cell (N1)', () => {
    setRole('admin')
    const pid = getState().people[0].id
    const seen: CommitEnvelope[] = []
    const unsub = onCommit(e => seen.push(e))
    setCellRange(pid, '2026-03-09', '2026-03-11', 'LL')   // one action, three cells
    unsub()
    const cellEnvs = seen.filter(e => e.changes.some(c => c.collection === 'lw.cell'))
    expect(cellEnvs.length).toBe(1)   // ONE envelope, not one per cell
    expect(cellEnvs[0].changes.filter(c => c.collection === 'lw.cell').length).toBeGreaterThanOrEqual(3)
  })
})
