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

/* [DB-READINESS] group A, phase 5b (D462): the lists kept one row per thing — a save writes ONLY the rows it changed, as
   ONE command, in ONE saved group with its batch (the batch names the design's tables) */
describe('a list kept one row per thing, saved', () => {
  it('a student added is ONE saved group: his enrolment row (and his empty marks and dates) and one batch — no other student\'s row', async () => {
    const before = wb.keys('tracker').filter(k => k.includes(':enr:'))
    const envs: any[] = []
    const off = onCommit(e => envs.push(e))
    const p = (core as any).addStudent(); for (let i = 0; i < 50 && !(core as any).dlg; i++) await settle()
    ;(core as any).dlgClose('ROWS ONE'); await p; await (core as any).whenLoaded(); await settle()
    off()
    /* his row is a Tracker record in the command's own change (`trk.roster`), so the one Undo and the stream see it */
    const sid = (core as any).byName('ROWS ONE').id
    expect(envs.flatMap(e => e.changes).some((c: any) => c.collection === 'trk.roster' && String(c.id).endsWith(':enr:' + sid)), 'the command names his enrolment row').toBe(true)
    const g = groups.find(x => x.some(c => c.collection === 'tracker' && c.id.includes(':enr:')))!
    expect(g, 'the add is saved').toBeTruthy()
    const enr = trackerRows(g).filter(c => c.id.includes(':enr:'))
    const id = (core as any).byName('ROWS ONE').id
    /* his row — and this file's two students pushed into the list in memory without a save (beforeAll) are stored with
       it, as anything on the list not yet stored is; no student ALREADY stored has his row rewritten */
    const mine = enr.find(c => c.id.endsWith(':enr:' + id))
    expect(mine, 'his row').toBeTruthy()
    expect(enr.filter(c => before.includes(c.id)), 'no stored student\'s row is rewritten').toEqual([])
    expect(before.every(k => wb.has('tracker', k)), 'every other student\'s row still stored').toBe(true)
    const b = oneBatch(g)
    expect(b.items.find((i: any) => i.key === 'tracker/' + mine!.id).table).toBe('Enrolment')
  })

  it('a course renamed is ONE saved group: its one course row (Course) and one batch', async () => {
    groups = []
    const c = (core as any).course, old = (core as any).courseName(c)
    const p = (core as any).renCourse(); for (let i = 0; i < 50 && !(core as any).dlg; i++) await settle()
    ;(core as any).dlgClose('ROWS RENAMED'); await p; await settle()
    expect(groups).toHaveLength(1)
    expect(trackerRows(groups[0]!).map(x => x.id)).toEqual(['v3:master:course:' + c])
    expect(oneBatch(groups[0]!).items.find((i: any) => i.key === 'tracker/v3:master:course:' + c).table).toBe('Course')
    const q = (core as any).renCourse(); for (let i = 0; i < 50 && !(core as any).dlg; i++) await settle()
    ;(core as any).dlgClose(old); await q; await settle()
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

/* THE GROUP-WIDE WALK (30 Sep 26) — three Tracker actions that were saved as TWO groups, and one that saved rows with no
   batch at all. Each is now ONE saved group (or, for an Import, every group it writes carries its batch). */
describe('one Tracker action, one saved group (the group-wide walk, W5 findings 1 and 2)', () => {
  const chartGroups = (id: string) => groups.filter(g => trackerRows(g).some(c => c.id === 'v3:master:chart:' + id))
  /* run an action, saying yes to every question it asks on the way (a leftover unsaved chart edit, the delete's own) */
  const yes = async (p: Promise<any>) => {
    let done = false; p.then(() => { done = true }, () => { done = true })
    for (let i = 0; i < 400 && !done; i++) { if ((core as any).dlg) (core as any).dlgClose(true); await settle() }
    await p
  }

  it('a built-in chart deleted, then restored: each is ONE saved group with ONE batch', async () => {
    await yes((core as any).switchSyllabus('sb2024')); await (core as any).whenLoaded(); await settle()
    groups = []
    await yes((core as any).delSyl()); await (core as any).whenLoaded(); await settle()
    const del = chartGroups('sb2024')
    expect(del, 'the delete: one saved group (hidden AND marked deleted together)').toHaveLength(1)
    oneBatch(del[0]!)
    groups = []
    await (core as any).restoreHiddenSyl('sb2024'); await settle()
    const back = chartGroups('sb2024')
    expect(back, 'the restore: one saved group (back AND no longer marked deleted together)').toHaveLength(1)
    oneBatch(back[0]!)
  })

  it('✓ Save changes that takes a marked ball off the chart: its marks and the chart are ONE saved group', async () => {
    await yes((core as any).switchSyllabus('sb2026')); await (core as any).whenLoaded(); await settle()
    const ev = (core as any).SYL.find((e: any) => e && e.id && e.type !== 'flight' && !String(e.id).startsWith('__'))
    ;(core as any).setActive(Z)
    ;(core as any).openPop(ev.id, { clientX: 1, clientY: 1 })
    await (core as any).popGrade('dco'); await settle()
    /* the ball taken off the chart being edited (what the editor's delete tool leaves), then saved */
    const i = (core as any).SYL.indexOf(ev); (core as any).SYL.splice(i, 1); delete (core as any).byid[ev.id]
    groups = []
    await yes((core as any).persistSyl())
    await settle()
    const saved = chartGroups('sb2026')
    expect(saved, 'the chart saved').toHaveLength(1)
    expect(trackerRows(saved[0]!).some(c => /:m:sTZRST$/.test(c.id)), 'its marks went in the SAME group').toBe(true)
    oneBatch(saved[0]!)
  })

  it('an Import bringing a course this browser never had: every group it saves carries its batch', async () => {
    const out = JSON.parse(JSON.stringify(await (core as any).collectStudents()))
    const first = out.courses[0], cid = typeof first === 'string' ? first : first.id
    const NEW = 'cimpxnew1'
    out.courses = [{ id: NEW, name: 'IMPX NEW' }]
    out.byCourse = { [NEW]: out.byCourse[cid] }
    groups = []
    await (core as any).applyStudents(out, null, 3)
    await (core as any).whenLoaded(); await settle()
    const ids = groups.flatMap(g => trackerRows(g).map(c => c.id))
    expect(ids, "the new course's one-time conversions ran").toContain(`v3:${NEW}:rostermig`)
    for (const g of groups) oneBatch(g)
  })
})

