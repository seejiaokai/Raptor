// @vitest-environment jsdom
/* [DB-READINESS] group A, phase 4.1 (plan §3 phase 4.1; §8 P4.1-TRACKER-RESTORE — Astra R3-05) — THE TRACKER'S SAVES
   TRAVEL WITH THE ACTION THAT MADE THEM.

   Two holes, both found by the roll-call of every writer that reaches storage after boot outside a command:
   - an ordinary Tracker save ran its command on the Tracker's in-memory mirror, and only AFTER that command had
     finished wrote storage — a saved group of its own, with no change-log batch, and a refused command's value still
     stored. Now the Tracker writes its rows from each command's own changes (its subscriber, through its own storage
     door), inside the command's saved group;
   - the Tracker's own Undo / Redo wrote raw, one save per record, each awaited — several groups, none named by a batch.
     Now each is ONE restore command (`tracker.undo`, `tracker.redo`, origin `restore`): its records written inside it,
     saved as one group with one batch — a chart edit, one student's marks, a copy to several students, a redo, and a
     pace that had never been set, taken away again. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import * as core from './app/core.js'
import { useStorageImpl } from './storage.js'
import { Whiteboard, type Change } from '../storage/whiteboard'
import { trackerTarget } from '../storage/adapters'
import { wireRows } from '../state/persist'
import { onCommit } from '../command'

const Z = 'sTZRST', Y = 'sTYRST'
let board: HTMLDivElement
let wb: Whiteboard
let groups: Change[][] = []

beforeAll(async () => {
  wb = new Whiteboard()
  wireRows(wb)
  useStorageImpl(trackerTarget(wb))
  board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board)
  await core.init()
  for (const [id, name] of [[Z, 'RST Z'], [Y, 'RST Y']]) if (!(core as any).byName(name)) ((core as any).roster as any).push({ id, name })
  /* a student the Tracker holds marks for (its Undo passes over a step whose student has none — liveEntry) */
  for (const id of [Z, Y]) if (!(core as any).marks[id]) (core as any).marks[id] = {}
  wb.subscribe(g => groups.push(g))
})
afterAll(() => { board.remove(); useStorageImpl(null) })
beforeEach(() => { groups = [] })

const trackerRows = (g: Change[]) => g.filter(c => c.collection === 'tracker')
function oneBatch(g: Change[]) {
  const bs = g.filter(c => c.collection === 'changes' && c.value !== null)
  expect(bs, 'one change-log batch in the group').toHaveLength(1)
  const b = JSON.parse(bs[0]!.value!)
  const rest = g.filter(c => c.collection !== 'changes').map(c => `${c.collection}/${c.id}`).sort()
  expect(b.items.map((i: any) => i.key).sort(), 'its items are the rest of the group').toEqual(rest)
  return b
}
const settle = () => new Promise(r => setTimeout(r, 0))

describe('an ordinary Tracker save', () => {
  it('a failure recorded is ONE saved group: its marks row and one batch — nothing after', async () => {
    ;(core as any).setActive(Z)
    ;(core as any).openPop('ST-01', { clientX: 1, clientY: 1 })
    await (core as any).popFail(1)
    await settle()
    expect(groups).toHaveLength(1)
    expect(trackerRows(groups[0]!).some(c => /:m:sTZRST$/.test(c.id))).toBe(true)
    oneBatch(groups[0]!)
  })

  it('a pace typed is ONE saved group with its row and its batch', async () => {
    await (core as any).setEpw(Z, '3')
    await settle()
    expect(groups).toHaveLength(1)
    expect(trackerRows(groups[0]!).map(c => c.id).some(id => /:pace:sTZRST$/.test(id))).toBe(true)
    oneBatch(groups[0]!)
  })
})

describe("the Tracker's own Undo / Redo — one restore command each", () => {
  it('one student: the pace taken back — and, never set before, its row REMOVED — in one group with one batch', async () => {
    await (core as any).setEpw(Y, '5')
    await settle()
    const paceKey = trackerRows(groups[0]!).find(c => /:pace:sTYRST$/.test(c.id))!.id
    groups = []
    const envs: any[] = []
    const off = onCommit(e => envs.push(e))
    await (core as any).doUndo()
    await settle()
    off()
    expect(groups).toHaveLength(1)
    const g = groups[0]!
    expect(g.find(c => c.collection === 'tracker' && c.id === paceKey)?.value, 'the pace row removed').toBeNull()
    const b = oneBatch(g)
    expect(b.type).toBe('tracker.undo')
    expect(envs.map(e => [e.type, e.origin])).toEqual([['tracker.undo', 'restore']])
    expect(wb.has('tracker', paceKey)).toBe(false)
  })

  it('redo puts it back — one group, one batch, `tracker.redo`', async () => {
    await (core as any).doRedo()
    await settle()
    expect(groups).toHaveLength(1)
    expect(oneBatch(groups[0]!).type).toBe('tracker.redo')
    expect(trackerRows(groups[0]!).some(c => /:pace:sTYRST$/.test(c.id) && c.value !== null)).toBe(true)
  })

  it('a chart edit (the ball font) taken back: its layout row, one group, one batch', async () => {
    const before = (core as any).currentFont()
    ;(core as any).setFont(before === 10 ? 11 : 10)
    await settle()
    groups = []
    await (core as any).doUndo()
    await settle()
    expect(groups).toHaveLength(1)
    expect(trackerRows(groups[0]!).some(c => c.id.includes(':lay:'))).toBe(true)
    expect(oneBatch(groups[0]!).type).toBe('tracker.undo')
    expect((core as any).currentFont()).toBe(before)
  })

  it('a copy to several students taken back: every student, ONE group, one batch', async () => {
    /* Z gets a lull period (one step of its own), then it is copied to Y (ONE step for every student ticked) */
    ;(core as any).openLullPicker(Z)
    await (core as any).lullDayClick('2026-07-01')
    await (core as any).lullDayClick('2026-07-03')
    ;(core as any).openLullCopy(Z)
    ;(core as any).toggleLullCopy(Y, true)
    await (core as any).applyLullCopy()
    await settle()
    expect((core as any).lulls[Y]).toEqual([{ start: '2026-07-01', end: '2026-07-03' }])
    groups = []
    await (core as any).doUndo()
    await settle()
    expect(groups).toHaveLength(1)
    expect(trackerRows(groups[0]!).some(c => /:lulls:sTYRST$/.test(c.id))).toBe(true)
    expect(oneBatch(groups[0]!).type).toBe('tracker.undo')
    expect((core as any).lulls[Y] || []).toEqual([])
  })
})
