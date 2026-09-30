// @vitest-environment jsdom
/* [DB-READINESS] group A, phase 4.1 + 4.2 (plan §3 phase 4.1, 4.2; §8 P3-CELL-DIFF's items test; Fable F2-03) — THE
   ROLL-CALL OF EVERY SAVE AFTER BOOT, and A SECOND CLIENT READING THE CHANGE LOG.

   1. Every group that reaches storage after the boot carries EXACTLY ONE change-log batch whose items are the rest of
      the group, row for row — except the NAMED exempt writers, which carry none and touch only their own keys:
      - the Tracker's first mount (`core.init()` — its seed, its one-time migrations and their flags: its own world,
        once, before its command routing is on).
      Every other writer that used to reach storage outside a command is now inside one, each with its disposition:
      the change history's lines (written inside the command that made them — phase 4.3), an idle line (its own
      command), the Undo / Redo lines (inside the restore), a week switch (read-only; a saved week's re-landing is the
      `sched.load` command — phase 1.3), the Leave War's idle writes (carried by the turn's projection — phase 3), the
      Tracker's saves and its own Undo / Redo (phase 4.1). The battery drives each kind of writer on the real wiring.
   2. A Leave War MOVE is exactly one row in its batch's items (P3-CELL-DIFF's "exact ChangeBatch.items").
   3. THE STAND-IN READER (plan §3 phase 4.2): a second client, holding the store as it stood when it last read, reads
      the batches written since its mark, re-reads EACH named row ONCE, and ends with the first client's view — an
      input, a day, a war record and a history line — without reading anything else. */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { INPUTS, inpId } from '../engine/inputs'
import { storeBackend, store } from '../engine/hooks'
import { txtSet } from '../engine/slots'
import { markEdit } from '../engine/publish'
import { ELOG, logAction } from '../engine/editlog'
import { validate } from '../engine/validate'
import { initStore, histInit, weekStashSnap, weekDirty, writeInputs, resetSession, loadWeek } from './store'
import { hydrate, wirePersist, wireRows, leaveWarStarted } from './persist'
import { resyncSchedBaseline, schedWrite, SCHED_TYPES } from './sched-commit'
import { installGlobalUndo } from './undo-wire'
import { addPlanPuck } from './plan'
import { updatePersonField } from './quals-write'
import { signIn, sessionFor, addAccount, ACCOUNTS_LIST } from './accounts'
import { markSeen } from './changes'
import { globalUndo, globalRedo } from '../undo'
import { initStore as lwInitStore, lwHistInit, getState, setCell, recordsAt, moveCells, setRole } from '../leavewar/state/store'
import { installDemoWorld } from '../leavewar/state/demoworld'
import { wireLeaveWarSync } from '../leavewar/sync'
import { bootStorage } from '../storage/boot'
import { settingsAdapter, leavewarAdapter, trackerTarget } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { openBootGroup } from '../storage/schema'
import { tableOf } from '../storage/tables'
import { recordKey, splitKey, type Snapshot } from '../storage/backend'
import type { Change, Whiteboard } from '../storage/whiteboard'
import { useStorageImpl } from '../tracker/storage.js'
import * as trk from '../tracker/app/core.js'
import { PEOPLE } from '../engine/people'

let be: MemoryBackend
let wb: Whiteboard
let flushAll: () => Promise<void>
/* every group after the boot, and whether it was written while the Tracker's first mount ran */
const groups: Array<{ g: Change[]; trkInit: boolean }> = []
let inTrkInit = false

beforeAll(async () => {
  be = new MemoryBackend()
  const { wb: w, postman } = await bootStorage(be)
  wb = w
  const bootGroup = openBootGroup(wb)
  storeBackend.impl = settingsAdapter(wb)
  useStorageImpl(trackerTarget(wb))
  hydrate(wb)
  wireRows(wb)
  initStore()
  const had = leaveWarStarted(wb)
  lwInitStore(leavewarAdapter(wb), { started: had })
  installDemoWorld(had)
  validate()
  resyncSchedBaseline()
  wireLeaveWarSync()
  validate()
  histInit()
  lwHistInit()
  installGlobalUndo()
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
  bootGroup.seal()
  await postman.flush()
  flushAll = () => postman.flush()
  wb.subscribe(g => groups.push({ g: g.slice(), trkInit: inTrkInit }))
})
afterAll(() => { storeBackend.impl = null; useStorageImpl(null); resetSession(null) })

const itemsOf = (g: Change[]) => g.filter(c => c.collection !== 'changes')
  .map(c => ({ table: tableOf(c.collection, c.id), key: recordKey(c.collection, c.id), op: c.value === null ? 'delete' : 'put' }))
const byKey = (a: { key: string }, b: { key: string }) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0)

describe('the roll-call: every save after boot carries its batch', () => {
  it('drives every kind of writer; each group is ONE batch naming the rest — or a named exempt writer', async () => {
    const from = groups.length
    resetSession(sessionFor(signIn('ad', 'a') as any))
    /* the scheduler: a day's note, through the board's own door */
    schedWrite(SCHED_TYPES.text, () => { txtSet('dn:0.0', 'ROLL-CALL NOTE'); markEdit() })
    /* a request, the roster, the planning calendar */
    expect(writeInputs(() => { INPUTS.push({ person: 'dj', date: 'Jul 14', allday: true, type: 'LL', remarks: 'ROLL', mod: '2026-07-01' }) })).toBe(true)
    expect(updatePersonField('dj', { remarks: 'roll-call' } as any)).toBeNull()
    expect(addPlanPuck('2026-07-15', 'ROLL PUCK')).not.toBe(false)
    /* a setting, an account, each person's seen, the admins' bell */
    store.set('lookahead', 21)
    const pid = Object.keys(PEOPLE).find(id => !(PEOPLE as any)[id].special && !(PEOPLE as any)[id].archived && !ACCOUNTS_LIST.some(a => a.pid === id))!
    expect(addAccount('roll@mail', pid, 'main')).toBeNull()
    markSeen(ELOG.rows)
    /* a line with no command running (an idle toggle's line) */
    logAction(0, 'ROLL idle line')
    /* the Leave War: a bid, then a move */
    setRole('admin')
    const lwPid = getState().people[0].id
    const day = String(getState().period.bidFrom || getState().period.start)
    expect(setCell(lwPid, day, 'LL')).toBe(true)
    /* Undo and Redo (their history lines ride the restore) */
    expect(globalUndo().ok).toBe(true)
    expect(globalRedo().ok).toBe(true)
    /* a week switch there and back — read-only unless a saved week re-lands (then the `sched.load` command) */
    loadWeek('20/07/2026'); loadWeek('13/07/2026')
    /* sign out and in again */
    resetSession(null); resetSession(sessionFor(signIn('ad', 'a') as any))
    /* the Tracker: its first mount (exempt), then a save and its own Undo */
    const board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board)
    inTrkInit = true
    await trk.init()
    inTrkInit = false
    const Z = 'sROLLZ'
    if (!(trk as any).byName('ROLL Z')) ((trk as any).roster as any).push({ id: Z, name: 'ROLL Z' })
    if (!(trk as any).marks[Z]) (trk as any).marks[Z] = {}
    await (trk as any).setEpw(Z, '4')
    await (trk as any).doUndo()
    await new Promise(r => setTimeout(r, 0))
    board.remove()
    await flushAll()

    const after = groups.slice(from)
    expect(after.length).toBeGreaterThan(10)
    const bare: string[] = []
    for (const { g, trkInit } of after) {
      const bs = g.filter(c => c.collection === 'changes' && c.value !== null)
      if (!bs.length) {
        /* the named exempt writer: the Tracker's first mount — its own keys only */
        if (trkInit && g.every(c => c.collection === 'tracker')) continue
        bare.push(g.map(c => recordKey(c.collection, c.id)).join(', '))
        continue
      }
      expect(bs, 'exactly one batch in a group').toHaveLength(1)
      const b = JSON.parse(bs[0]!.value!)
      expect([...b.items].sort(byKey)).toEqual(itemsOf(g).sort(byKey))
    }
    expect(bare, 'groups saved after boot with no batch, outside the named exempt writers').toEqual([])
  })

  it('a Leave War MOVE is exactly one row in its batch (P3-CELL-DIFF): the record, put, at its new date', () => {
    setRole('admin')
    const lwPid = getState().people[1].id
    const day = String(getState().period.bidFrom || getState().period.start)
    expect(setCell(lwPid, day, 'LL')).toBe(true)
    const id = recordsAt(lwPid, day)[0]!.id
    const from = groups.length
    expect(moveCells([{ personId: lwPid, date: day }], 1)).toBe('moved')
    const g = groups.slice(from).map(x => x.g)
    expect(g).toHaveLength(1)
    const b = JSON.parse(g[0]!.find(c => c.collection === 'changes' && c.value !== null)!.value!)
    const bids = b.items.filter((i: any) => i.table === 'LeaveBid')
    expect(bids).toEqual([{ table: 'LeaveBid', key: `leavewar/rec:${getState().period.id}:${id}`, op: 'put' }])
    /* nothing else of the war — the rest is the move's history line */
    expect(b.items.filter((i: any) => i.table !== 'LeaveBid' && i.table !== 'EditLog')).toEqual([])
  })
})

/* ---- THE STAND-IN READER (phase 4.2) — a test-only second client ---- */
class StandInReader {
  view: Snapshot
  seen = new Set<string>()
  reads = 0
  constructor(private backend: MemoryBackend, start: Snapshot) {
    this.view = JSON.parse(JSON.stringify(start))
    for (const id of Object.keys(start.changes)) this.seen.add(id)
  }
  /* read the batches since the mark, then each row they name ONCE */
  async sync(): Promise<number> {
    const snap = await this.backend.loadAll()
    const fresh = Object.keys(snap.changes).filter(id => !this.seen.has(id))
    const named = new Set<string>()
    for (const id of fresh) { this.seen.add(id); for (const it of JSON.parse(snap.changes[id]!).items) named.add(it.key) }
    for (const key of named) {
      const [c, id] = splitKey(key)
      this.reads++
      const v = this.backend.peek(c, id)
      if (v == null) delete this.view[c][id]; else this.view[c][id] = v
    }
    return named.size
  }
}

describe('the stand-in reader (phase 4.2): a second client catches up from the change log alone', () => {
  it('an input, a day, a war record and a history line reach it — each named row read once', async () => {
    await flushAll()
    const reader = new StandInReader(be, await be.loadAll())
    resetSession(sessionFor(signIn('ad', 'a') as any))
    setRole('admin')
    expect(writeInputs(() => { INPUTS.push({ person: 'dj', date: 'Jul 16', allday: true, type: 'LL', remarks: 'READER', mod: '2026-07-01' }) })).toBe(true)
    schedWrite(SCHED_TYPES.text, () => { txtSet('dn:2.0', 'READER NOTE'); markEdit() })
    schedWrite(SCHED_TYPES.text, () => { txtSet('dn:2.0', 'READER NOTE 2'); markEdit() })
    const day = String(getState().period.bidFrom || getState().period.start)
    /* the first man with nothing on that day takes the bid */
    const lwPid = getState().people.map(p => p.id).find(id => !recordsAt(id, day).length && setCell(id, day, 'LL'))!
    expect(lwPid, 'a man took the bid').toBeTruthy()
    await flushAll()
    const named = await reader.sync()
    expect(reader.reads, 'each named row read once').toBe(named)
    /* its view of every row the first client wrote is the first client's */
    const iid = inpId(INPUTS.find((r: any) => r.remarks === 'READER'))
    expect(reader.view.inputs[iid]).toBe(wb.get('inputs', iid))
    const dayRow = Object.keys(reader.view.weeks).find(k => k.endsWith('#2') && k.startsWith('13-07-2026'))!
    expect(reader.view.weeks[dayRow]).toContain('READER NOTE 2')
    expect(reader.view.weeks[dayRow]).toBe(wb.get('weeks', dayRow))
    const rec = recordsAt(lwPid, day)[0]!
    expect(reader.view.leavewar[`rec:${getState().period.id}:${rec.id}`]).toBe(wb.get('leavewar', `rec:${getState().period.id}:${rec.id}`))
    const line = ELOG.rows[ELOG.rows.length - 1]!
    expect(reader.view.settings[`elog:${line.lineId}`]).toBe(wb.get('settings', `elog:${line.lineId}`))
    /* and the whole of what it holds is the first client's store, row for row */
    const now = wb.snapshot()
    for (const c of ['inputs', 'weeks', 'leavewar', 'people', 'plan'] as const) expect(reader.view[c]).toEqual(now[c])
  })
})
