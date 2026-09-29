// THE LEAVE WAR, ONE ROW PER RECORD ([DB-READINESS] group A, phase 3 — plan §2.5, §8 P3-CELL-DIFF).
//
// The war used to save itself as a handful of big records — every war with every bid (`wars`), every opening balance
// (`openings`), the whole ledger (`ledger`), every posting window (`postouts`) — rewritten whole by every edit, so two
// people bidding at once overwrote each other. Now each is the row of its table in the design: `war:<warId>`
// (LeaveWar), `rec:<warId>:<recId>` (LeaveBid — a bid, an earned credit or a notice, with its person, date and its
// place at that address, `ord`), `ledger:<id>`, `opening:<pid>:<counter>`, `profile:<pid>` (the posting window and
// the personnel label). Rows are written from the command that changed them, and a record's row is removed only when
// that command removed that record.
//
// "Another client" is stood in for by writing or removing a row in the shared store directly, as that client's
// committed change would, while this client's store still holds its older copy.
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import * as LW from './state/store'
import {
  initStore, getState, rawState, setCell, setRole, decideRequestById, recordsAt, clearRecordById, moveCells,
  setBalance, setPostOut, setPersLabel, grantTo, removeLedgerEntry, setShowSans, createWar, ingestDutyCredit,
  leavewarConverter, lwSyncTurn, lwHistInit, setPeople,
} from './state/store'
import { initStore as raptorInitStore } from '../state/store'
import { setSession } from '../state/auth'
import { globalRedo, globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { memoryBackend, type StorageBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { DEMO_MAP } from './state/demoworld'
import { seedPeople } from './engine'

type Op = ['put' | 'del', string, string | null]
function journalled(): { be: StorageBackend; log: Op[] } {
  const inner = memoryBackend()
  const log: Op[] = []
  return {
    log,
    be: {
      read: k => inner.read(k),
      write: (k, v) => { log.push(['put', k, v]); inner.write(k, v) },
      remove: k => { log.push(['del', k, null]); inner.remove(k) },
      keys: () => inner.keys(),
    },
  }
}
const OLD_BLOBS = ['wars', 'openings', 'ledger', 'postouts', 'perslabels', 'personedits']
const warId = () => getState().period.id
const recRow = (be: StorageBackend, recId: string, war = warId()) => be.read(`rec:${war}:${recId}`)
const idsAt = (pid: string, date: string) => recordsAt(pid, date).map(r => r.id)
const D = '2026-01-20'

let J: ReturnType<typeof journalled>
beforeEach(() => {
  J = journalled()
  initStore(J.be)
  J.log.length = 0
})

describe('a first boot stores the war as rows', () => {
  it('one row per war, per record, per ledger line and per opening — and no whole-war record', () => {
    const fresh = journalled()
    initStore(fresh.be)
    for (const k of OLD_BLOBS) expect(fresh.be.read(k), k).toBeNull()
    let recs = 0
    for (const w of rawState().wars) {
      expect(fresh.be.read(`war:${w.period.id}`)).not.toBeNull()
      for (const pid of Object.keys(w.recs)) for (const date of Object.keys(w.recs[pid]!)) for (const r of w.recs[pid]![date]!) {
        const row = JSON.parse(fresh.be.read(`rec:${w.period.id}:${r.id}`)!)
        expect(row).toMatchObject({ id: r.id, pid, date })
        expect(typeof row.ord).toBe('number')
        recs++
      }
    }
    expect(recs).toBeGreaterThan(0)
    expect(fresh.be.keys().filter(k => k.startsWith('rec:'))).toHaveLength(recs)
    expect(fresh.be.keys().filter(k => k.startsWith('ledger:'))).toHaveLength(rawState().ledger.length)
    const openings = Object.values(rawState().openings).reduce((n, o) => n + Object.keys(o).length, 0)
    expect(fresh.be.keys().filter(k => k.startsWith('opening:'))).toHaveLength(openings)
  })

  it('a reload reads the rows back: the same wars, records, ledger and openings', () => {
    /* the war's reader has always filled a day's missing event tags with an empty list — not a difference */
    const norm = (p: any) => ({ ...p, days: p.days.map((d: any) => { const { eventKinds, ...rest } = d; return eventKinds && eventKinds.length ? d : rest }) })
    const before = JSON.stringify({ w: rawState().wars.map(w => [norm(w.period), w.recs]), l: rawState().ledger, o: rawState().openings })
    initStore(J.be)
    expect(J.log, 'a started store is read, never rewritten, at boot').toEqual([])
    const sortedLedger = (l: any[]) => l.slice().sort((a, b) => (a.id < b.id ? -1 : 1))
    const after = rawState()
    expect(after.wars.map(w => [norm(w.period), w.recs])).toEqual(JSON.parse(before).w)
    expect(sortedLedger(after.ledger)).toEqual(sortedLedger(JSON.parse(before).l))
    expect(after.openings).toEqual(JSON.parse(before).o)
  })
})

describe('a bid is one row', () => {
  it('a new bid writes exactly its own row, carrying its person, date and place', () => {
    expect(setCell('ramp', D, 'LL')).toBe(true)
    const id = idsAt('ramp', D)[0]!
    expect(J.log.map(o => o[0] + ' ' + o[1])).toEqual([`put rec:${warId()}:${id}`])
    expect(JSON.parse(recRow(J.be, id)!)).toMatchObject({ id, kind: 'request', code: 'LL', state: 'pending', pid: 'ramp', date: D })
    expect(typeof JSON.parse(recRow(J.be, id)!).ord).toBe('number')
    for (const k of OLD_BLOBS) expect(J.be.read(k), k).toBeNull()
  })

  it('two records at one address: deleting one removes only its row; the other row is untouched, byte for byte', () => {
    setCell('ramp', D, '*LL'); setCell('ramp', D, 'LL*')
    const [am, pm] = idsAt('ramp', D)
    const pmBytes = recRow(J.be, pm!)
    J.log.length = 0
    expect(clearRecordById('ramp', D, am!)).toBe(true)
    expect(J.log).toEqual([['del', `rec:${warId()}:${am}`, null]])
    expect(recRow(J.be, pm!)).toBe(pmBytes)
  })

  it('deleting the last record at an address removes its row', () => {
    setCell('ramp', D, 'LL')
    const id = idsAt('ramp', D)[0]!
    J.log.length = 0
    setCell('ramp', D, '')
    expect(J.log).toEqual([['del', `rec:${warId()}:${id}`, null]])
  })

  it('a MOVE is exactly one row changed — the same row, its new date — and nothing removed', () => {
    setRole('admin')
    setCell('ramp', D, 'LL')
    const id = idsAt('ramp', D)[0]!
    J.log.length = 0
    expect(moveCells([{ personId: 'ramp', date: D }], 1)).toBe('moved')
    expect(J.log.map(o => o[0] + ' ' + o[1])).toEqual([`put rec:${warId()}:${id}`])
    expect(JSON.parse(recRow(J.be, id)!)).toMatchObject({ pid: 'ramp', date: '2026-01-21' })
  })

  it('a decision is one row changed', () => {
    setRole('admin')
    setCell('ramp', D, 'LL')
    const id = idsAt('ramp', D)[0]!
    J.log.length = 0
    expect(decideRequestById('ramp', D, id, 'acknowledged')).toBe(true)
    expect(J.log.map(o => o[0] + ' ' + o[1])).toEqual([`put rec:${warId()}:${id}`])
    expect(JSON.parse(recRow(J.be, id)!).state).toBe('acknowledged')
  })

  it('an idle reconcile that credits a worked day (the OIL pass) saves its row too', () => {
    const SAT = '2026-01-10'
    expect(ingestDutyCredit('ramp', SAT, 'FO', 'FLT')).toBe('written')
    const credit = recordsAt('ramp', SAT).find(r => r.kind === 'credit')!
    expect(JSON.parse(recRow(J.be, credit.id)!)).toMatchObject({ kind: 'credit', code: 'FO', pid: 'ramp', date: SAT })
    J.log.length = 0
    expect(ingestDutyCredit('ramp', SAT, 'FO', 'FLT'), 'the same credit again is recognised').toBe('confirmed')
    expect(J.log).toEqual([])
  })

  it('a reconcile turn that credits several days saves every credit row (one projection for the turn)', () => {
    const days = ['2026-01-10', '2026-01-11', '2026-01-17']
    lwSyncTurn(() => { for (const d of days) ingestDutyCredit('ramp', d, 'FO', 'FLT') })
    for (const d of days) {
      const credit = recordsAt('ramp', d).find(r => r.kind === 'credit')!
      expect(JSON.parse(recRow(J.be, credit.id)!), d).toMatchObject({ kind: 'credit', pid: 'ramp', date: d })
    }
    expect(J.log.filter(o => o[1].startsWith('rec:'))).toHaveLength(3)
  })
})

describe('the one undo puts the rows back', () => {
  beforeEach(() => {
    setSession({ user: 'ad', role: 'admin' })
    raptorInitStore()
    initStore(J.be)
    setPeople(projectPeople())
    setRole('admin')
    _resetTimeline(); lwHistInit(); installGlobalUndo()
    J.log.length = 0
  })
  afterEach(() => { _resetTimeline(); setSession(null) })
  const recOps = () => J.log.filter(o => o[1].startsWith('rec:')).map(o => `${o[0]} ${o[1]}`)

  it('an Undo of a move puts its row back on its day, a Redo moves it again — one row each way', () => {
    const pid = rawState().people.find(p => !p.pers)!.id
    setCell(pid, D, 'LL')
    const id = idsAt(pid, D)[0]!
    expect(moveCells([{ personId: pid, date: D }], 1)).toBe('moved')
    J.log.length = 0
    expect(globalUndo().ok).toBe(true)
    expect(recOps()).toEqual([`put rec:${warId()}:${id}`])
    expect(JSON.parse(recRow(J.be, id)!).date).toBe(D)
    J.log.length = 0
    expect(globalRedo().ok).toBe(true)
    expect(recOps()).toEqual([`put rec:${warId()}:${id}`])
    expect(JSON.parse(recRow(J.be, id)!).date).toBe('2026-01-21')
  })

  it('an Undo of a new bid removes its row; a Redo writes it again', () => {
    const pid = rawState().people.find(p => !p.pers)!.id
    setCell(pid, D, 'LL')
    const id = idsAt(pid, D)[0]!
    J.log.length = 0
    expect(globalUndo().ok).toBe(true)
    expect(recOps()).toEqual([`del rec:${warId()}:${id}`])
    expect(recRow(J.be, id)).toBeNull()
    expect(globalRedo().ok).toBe(true)
    expect(JSON.parse(recRow(J.be, id)!)).toMatchObject({ id, pid, date: D })
  })
})

describe('the records at one address keep their order', () => {
  it('a reload reads them in the order they were written', () => {
    setCell('ramp', D, 'LL*'); setCell('ramp', D, '*LL')
    const order = idsAt('ramp', D)
    initStore(J.be)
    expect(idsAt('ramp', D)).toEqual(order)
  })

  it('two rows given the same place by two people at once read the same way on every reload, and the boot rewrites neither', () => {
    const w = warId()
    J.be.write(`rec:${w}:rb`, JSON.stringify({ id: 'rb', kind: 'request', code: 'LL*', state: 'pending', pid: 'ramp', date: D, ord: 1024 }))
    J.be.write(`rec:${w}:ra`, JSON.stringify({ id: 'ra', kind: 'request', code: '*LL', state: 'pending', pid: 'ramp', date: D, ord: 1024 }))
    J.log.length = 0
    initStore(J.be)
    expect(idsAt('ramp', D)).toEqual(['ra', 'rb'])
    initStore(J.be)
    expect(idsAt('ramp', D)).toEqual(['ra', 'rb'])
    expect(J.log).toEqual([])
  })
})

describe('two people at once', () => {
  it('two clients bidding on different days of one war: both bids survive', () => {
    const w = warId()
    /* the other client's bid, committed while this one was open */
    J.be.write(`rec:${w}:rOther`, JSON.stringify({ id: 'rOther', kind: 'request', code: 'LL', state: 'pending', pid: 'ramp', date: D, ord: 1024 }))
    J.log.length = 0
    expect(setCell('ramp', '2026-01-22', 'LL')).toBe(true)
    expect(J.log).toHaveLength(1)
    initStore(J.be)
    expect(idsAt('ramp', D)).toEqual(['rOther'])
    expect(recordsAt('ramp', '2026-01-22')).toHaveLength(1)
  })

  it('an admin deciding one record while a member bids beside it on the same person and date: both survive', () => {
    setRole('admin')
    setCell('ramp', D, '*LL')
    const mine = idsAt('ramp', D)[0]!
    /* the member's afternoon bid, committed by his client after this one loaded */
    J.be.write(`rec:${warId()}:rMember`, JSON.stringify({ id: 'rMember', kind: 'request', code: 'LL*', state: 'pending', pid: 'ramp', date: D, ord: 99999 }))
    J.log.length = 0
    expect(decideRequestById('ramp', D, mine, 'acknowledged')).toBe(true)
    expect(J.log.map(o => o[1])).toEqual([`rec:${warId()}:${mine}`])
    initStore(J.be)
    expect(idsAt('ramp', D)).toEqual([mine, 'rMember'])
    expect(recordsAt('ramp', D).find(r => r.id === mine)).toMatchObject({ state: 'acknowledged' })
  })

  it('a stale client editing one record never brings back a record another client deleted', () => {
    setRole('admin')
    setCell('ramp', D, '*LL'); setCell('ramp', D, 'LL*')
    const [x, y] = idsAt('ramp', D)
    /* another client deletes X; this one still holds it */
    J.be.remove(`rec:${warId()}:${x}`)
    J.log.length = 0
    expect(decideRequestById('ramp', D, y!, 'acknowledged')).toBe(true)
    expect(J.log.map(o => o[1])).toEqual([`rec:${warId()}:${y}`])
    initStore(J.be)
    expect(idsAt('ramp', D)).toEqual([y])
  })
})

describe('the rest of the war, one row each', () => {
  it('an opening balance is one row per person and counter', () => {
    setRole('admin')
    expect(setBalance('ramp', 'annual', 12)).toBe(true)
    expect(J.log.map(o => o[0] + ' ' + o[1])).toEqual(['put opening:ramp:annual'])
    initStore(J.be)
    expect(LW.getState().openings.ramp!.annual).toBe(rawState().openings.ramp!.annual)
  })

  it('a ledger line is its own row; removing it removes only that row', () => {
    setRole('admin')
    expect(grantTo(['ramp'], 'annual', 2, '2026-01-05', 'top-up')).toBeNull()
    const e = rawState().ledger.find(x => x.personId === 'ramp' && x.reason === 'top-up')!
    expect(J.log.map(o => o[0] + ' ' + o[1])).toEqual([`put ledger:${e.id}`])
    J.log.length = 0
    expect(removeLedgerEntry(e.id)).toBe(true)
    expect(J.log).toEqual([['del', `ledger:${e.id}`, null]])
  })

  it("a person's posting window and his label share his profile row; the row goes when both do", () => {
    setRole('admin')
    expect(setPostOut('ramp', '2027-03-01', false)).toBe(true)
    expect(J.log.map(o => o[1])).toEqual(['profile:ramp'])
    expect(JSON.parse(J.be.read('profile:ramp')!).post.to).toBe('2027-02-28')
    setPersLabel('ramp', 'Stores')
    expect(JSON.parse(J.be.read('profile:ramp')!)).toMatchObject({ label: 'Stores', post: { to: '2027-02-28' } })
    setPostOut('ramp', null)
    expect(JSON.parse(J.be.read('profile:ramp')!)).toEqual({ label: 'Stores' })
    J.log.length = 0
    setPersLabel('ramp', '')
    expect(J.log).toEqual([['del', 'profile:ramp', null]])
    setPersLabel('ramp', 'Stores'); setPostOut('ramp', '2027-03-01', false)
    initStore(J.be)
    expect(rawState().persLabels.ramp).toBe('Stores')
    expect(rawState().postOuts.ramp!.to).toBe('2027-02-28')
  })

  it('a setting writes only its own key', () => {
    setRole('admin')
    expect(setShowSans(true)).toBe(true)
    expect(J.log).toEqual([['put', 'showsans', 'true']])
  })

  it('a new war is one row, placed after the wars already there — and keeps that place across a reload', () => {
    setRole('admin')
    const before = rawState().wars.map(w => w.period.id)
    expect(createWar('EARLY 25', '2025-01-01', '2025-03-31')).toBe('created')
    const made = rawState().wars.find(w => w.period.name === 'EARLY 25')!
    expect(J.log.map(o => o[1])).toEqual([`war:${made.period.id}`])
    initStore(J.be)
    expect(rawState().wars.map(w => w.period.id)).toEqual([...before, made.period.id])
  })

  it('no edit ever writes one of the old whole-list records', () => {
    setRole('admin')
    setCell('ramp', D, 'LL'); setBalance('ramp', 'annual', 3); grantTo(['ramp'], 'oil', 1, '2026-01-05', 'CNY')
    setPostOut('ramp', '2027-03-01', false); setPersLabel('ramp', 'x')
    for (const k of OLD_BLOBS) expect(J.be.read(k), k).toBeNull()
  })
})

describe('a started store is read as it stands', () => {
  it('a started store holding no openings, ledger or windows reloads with none of the demo back', () => {
    for (const k of J.be.keys()) if (/^(opening|ledger|profile):/.test(k)) J.be.remove(k)
    initStore(J.be)
    expect(rawState().openings).toEqual({})
    expect(rawState().ledger).toEqual([])
    expect(rawState().postOuts).toEqual({})
  })

  it('a record row that will not read is kept as it is — never loaded, never deleted', () => {
    const k = `rec:${warId()}:bad`
    J.be.write(k, '{not json')
    initStore(J.be)
    setCell('ramp', D, 'LL')
    expect(J.be.read(k)).toBe('{not json')
    expect(J.be.keys()).toContain(k)
  })

  it('a record that would break its address\'s rules (a second undecided bid on one half) is not loaded, and kept', () => {
    const w = warId()
    J.be.write(`rec:${w}:r1`, JSON.stringify({ id: 'r1', kind: 'request', code: 'LL', state: 'pending', pid: 'ramp', date: D, ord: 1 }))
    J.be.write(`rec:${w}:r2`, JSON.stringify({ id: 'r2', kind: 'request', code: 'OL', state: 'pending', pid: 'ramp', date: D, ord: 2 }))
    initStore(J.be)
    expect(idsAt('ramp', D)).toEqual(['r1'])
    expect(J.be.read(`rec:${w}:r2`)).not.toBeNull()
  })
})

describe('the Leave War has no Edit person (D460, D461)', () => {
  it('the war keeps no seat, band or SXO of its own — no writer, and a stored override is not read', () => {
    expect('setPerson' in LW).toBe(false)
    const was = rawState().people.find(p => p.id === 'ramp')!.sxo
    J.be.write('personedits', JSON.stringify({ ramp: { sxo: !was } }))
    initStore(J.be)
    expect(rawState().people.find(p => p.id === 'ramp')!.sxo).toBe(was)
    expect('personEdits' in rawState()).toBe(false)
  })

  it('the demo world lays no SXO of its own — every demo man already had the SXO Quals gives him, so nothing on screen moves', () => {
    const projected = new Map(projectPeople().map(p => [p.id, p]))
    let checked = 0
    for (const seed of seedPeople()) {
      const man = projected.get(DEMO_MAP[seed.id] ?? '')
      if (!man) continue
      expect(man.sxo, `${seed.id} → ${man.id}`).toBe(seed.sxo)
      checked++
    }
    expect(checked).toBeGreaterThan(10)
  })
})

describe('the one-time fold of an old store (storage/fold.ts)', () => {
  it('turns the whole-list records into rows, in their old order, and removes them; the Edit person overrides go', () => {
    const period = { id: 'war-x', name: 'X', start: '2026-01-01', end: '2026-01-31', stage: 'open', bidFrom: null, bidTo: null, days: [], bands: [] }
    const recs = { ramp: { [D]: [{ id: 'b', kind: 'request', code: '*LL', state: 'pending' }, { id: 'a', kind: 'request', code: 'LL*', state: 'pending' }] } }
    const snap: any = {
      leavewar: {
        wars: JSON.stringify([{ period, recs }]),
        openings: JSON.stringify({ ramp: { annual: 3, oil: 1 } }),
        ledger: JSON.stringify([{ id: 'g1', personId: 'ramp', counter: 'annual', amount: 2, date: '2026-01-02', reason: 'x', approvedBy: 'A' }]),
        postouts: JSON.stringify({ ramp: { id: 'ramp', callsign: 'RAMP', from: null, to: '2026-06-30' } }),
        perslabels: JSON.stringify({ ramp: 'Stores', tata: 'Clerk' }),
        personedits: JSON.stringify({ ramp: { sxo: true } }),
        figorder: '["a"]',
      },
    }
    const out = leavewarConverter.convert(snap)
    const get = (id: string) => out.find((e: { collection: string; id: string }) => e.collection === 'leavewar' && e.id === id)
    expect(JSON.parse(get('war:war-x')!.value!)).toMatchObject({ id: 'war-x', name: 'X' })
    const b = JSON.parse(get('rec:war-x:b')!.value!), a = JSON.parse(get('rec:war-x:a')!.value!)
    expect(b).toMatchObject({ pid: 'ramp', date: D }); expect(a).toMatchObject({ pid: 'ramp', date: D })
    expect(b.ord).toBeLessThan(a.ord)
    expect(get('opening:ramp:annual')!.value).toBe('3')
    expect(get('opening:ramp:oil')!.value).toBe('1')
    expect(JSON.parse(get('ledger:g1')!.value!)).toMatchObject({ id: 'g1', amount: 2 })
    expect(JSON.parse(get('profile:ramp')!.value!)).toEqual({ post: { id: 'ramp', callsign: 'RAMP', from: null, to: '2026-06-30' }, label: 'Stores' })
    expect(JSON.parse(get('profile:tata')!.value!)).toEqual({ label: 'Clerk' })
    for (const k of OLD_BLOBS) expect(get(k), k).toEqual({ collection: 'leavewar', id: k, value: null })
    expect(get('figorder'), 'a setting stays as it is').toBeUndefined()
  })
})
