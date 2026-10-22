/* THE OPEN DATES THROUGH THE STORE'S REAL WRITERS (M1 of the Leave War overhaul — D1177, 21 Oct 26: "the stages go:
   members bid only on the open dates the admin sets in the 'Open for bidding' window; nothing is open until he opens
   it"). The rules the red team found on the plan, each pinned through the doors a person's tap reaches:
     B2  — empty means closed: a new period takes no member bid;
     B3  — every write asks the period HOLDING the date, never the one on screen;
     D1211 — a member never bids on a day before today; an admin may;
     D1225 — a member may still delete his own pending bid on a day since closed — never add or change one there;
     B8  — the open day is part of the war's PERMISSION: a member's command that adds a bid on a closed day is refused at
           the commit, not only by the store's own check;
   and what the store keeps: the old saved shape still loads (D401's reading — the build plan, batch 1), the open dates
   and the last-closed note survive a reload, one gesture is one Undo step (B12; D352 narrowed), and the page lands on
   the first open date from today, in whichever period holds it. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { initStore as raptorInitStore } from '../state/store'
import { setSession, setMe } from '../state/auth'
import { ownershipViolation, setLwDayOpenProbe } from '../state/perms'
import { commit, type CommitEnvelope } from '../command'
import { focusDateOf, landingOf, makeWar, memberToday, setMemberTodayForTests, type WarRec } from './engine'
import {
  canBidOn, cellProblem, clearRecordById, closeDates, createWar, getState, initStore, isDayOpen, lwEditLists, lwHistInit,
  lwStore, openDates, ownPendingOnClosedDay, recordsAt, selectWar, setBidState, setCell, setCellRange, setPeople, setRole,
  setViewer,
} from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { installAbsenceDoor, wireLeaveWarSync } from './sync'
import { globalRedo, globalUndo } from '../undo'
import { _resetTimeline, _timelineEntries } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'

const Y26 = 'y2026', Y27 = 'y2027'
const warOf = (id: string) => getState().wars.find(w => w.period.id === id)!
const requests = (pid: string, date: string) => recordsAt(pid, date).filter(r => r.kind === 'request')
const asMember = (pid = 'ramp') => { setRole('member'); setViewer(pid) }
const asAdmin = () => { setRole('admin'); setViewer(null) }

describe('B2 — empty means closed: a new period takes no member bid', () => {
  beforeEach(() => { initStore(memoryBackend()) })

  it('a period just created has nothing open; a member is refused with the closed sentence, an admin\'s bid lands', () => {
    asAdmin()
    expect(createWar('2028', '2028-01-01', '2028-12-31')).toBe('created')
    const p = getState().wars.find(w => w.period.name === '2028')!.period
    expect(p.open).toEqual([])
    expect(p.lastClosed).toBeNull()
    asMember('ramp')
    expect(isDayOpen('2028-03-10')).toBe(false)
    expect(canBidOn('ramp', '2028-03-10')).toBe(false)
    expect(cellProblem('ramp', '2028-03-10', 'LL')).toBe('Bidding is closed on that day.')
    expect(setCell('ramp', '2028-03-10', 'LL')).toBe(false)
    expect(requests('ramp', '2028-03-10')).toHaveLength(0)
    asAdmin()
    expect(setCell('ramp', '2028-03-10', 'LL')).toBe(true)
    expect(requests('ramp', '2028-03-10').map(r => (r as any).code)).toEqual(['LL'])
  })
})

describe('B3 — a write asks the period holding the date, never the one on screen', () => {
  beforeEach(() => { initStore(memoryBackend()) })

  it('2026 wholly open on screen, 2027 nothing open: a member\'s bid on a 2027 date is refused', () => {
    asAdmin()
    expect(openDates('2026-01-01', '2026-12-31')).toBe('set')
    expect(getState().currentId).toBe(Y26)
    expect(warOf(Y26).period.open).toEqual([{ from: '2026-01-01', to: '2026-12-31' }])
    expect(warOf(Y27).period.open).toEqual([])
    asMember('ramp')
    expect(cellProblem('ramp', '2027-01-15', 'LL')).toBe('Bidding is closed on that day.')
    expect(setCell('ramp', '2027-01-15', 'LL')).toBe(false)
    expect(requests('ramp', '2027-01-15')).toHaveLength(0)
    /* a range over the year's end writes the open days of 2026 and none of 2027's — the red team's 30 Dec – 5 Jan case */
    expect(setCellRange('ramp', '2026-12-30', '2027-01-02', 'LL')).toEqual({ written: 2, skipped: 2 })
    expect(requests('ramp', '2026-12-31')).toHaveLength(1)
    expect(requests('ramp', '2027-01-01')).toHaveLength(0)
  })

  it('and the other way round: 2027 open, 2026 closed, 2026 on screen — the 2027 bid goes through', () => {
    asAdmin()
    closeDates('2026-01-01', '2026-12-31')
    selectWar(Y27)
    openDates('2027-01-01', '2027-01-31')
    selectWar(Y26)
    expect(getState().currentId).toBe(Y26)
    asMember('ramp')
    expect(setCell('ramp', '2026-02-10', 'LL')).toBe(false)
    expect(setCell('ramp', '2027-01-15', 'LL')).toBe(true)
    expect(requests('ramp', '2027-01-15')).toHaveLength(1)
    expect(warOf(Y27).recs.ramp?.['2027-01-15']?.length).toBe(1)
  })
})

describe('D1211 — a member never bids on a day before today; an admin may', () => {
  beforeEach(() => { initStore(memoryBackend()) })
  /* the suite pins today to 2000-01-01 before every test (test-setup.ts); this one sets it, then lets it go */
  afterEach(() => { setMemberTodayForTests(null) })

  it('today 15 Feb, inside the open Jan – Mar: a member is refused the 14th, allowed the 15th and 16th; an admin all three', () => {
    setMemberTodayForTests('2026-02-15')
    expect(memberToday()).toBe('2026-02-15')
    asMember('ramp')
    expect(cellProblem('ramp', '2026-02-14', 'LL')).toBe('You can’t bid on a day before today.')
    expect(setCell('ramp', '2026-02-14', 'LL')).toBe(false)
    expect(setCell('ramp', '2026-02-15', 'LL')).toBe(true)
    expect(setCell('ramp', '2026-02-16', 'LL')).toBe(true)
    expect(requests('ramp', '2026-02-14')).toHaveLength(0)
    asAdmin()
    for (const d of ['2026-02-14', '2026-02-15', '2026-02-16']) expect(setCell('tata', d, 'LL'), d).toBe(true)
  })
})

describe('D1225 — his own pending bid on a day since closed may be deleted, never added or changed', () => {
  beforeEach(() => { initStore(memoryBackend()) })

  function setUp() {
    asMember('ramp')
    for (const d of ['2026-02-10', '2026-02-11', '2026-02-12', '2026-02-14']) expect(setCell('ramp', d, 'LL'), d).toBe(true)
    asMember('tata')
    expect(setCell('tata', '2026-02-10', 'LL')).toBe(true)
    asAdmin()
    setBidState('ramp', '2026-02-12', 'refused')
    expect(closeDates('2026-02-01', '2026-02-28')).toBe('set')
    asMember('ramp')
  }

  it('Delete by its id (the closed note\'s Delete) and by the cell\'s empty write both take it', () => {
    setUp()
    expect(isDayOpen('2026-02-10')).toBe(false)
    const own = ownPendingOnClosedDay('ramp', '2026-02-10')
    expect(own).toHaveLength(1)
    expect(clearRecordById('ramp', '2026-02-10', own[0]!.id)).toBe(true)
    expect(requests('ramp', '2026-02-10')).toHaveLength(0)
    expect(ownPendingOnClosedDay('ramp', '2026-02-11')).toHaveLength(1)
    expect(setCell('ramp', '2026-02-11', '')).toBe(true)
    expect(requests('ramp', '2026-02-11')).toHaveLength(0)
  })

  it('he cannot add a bid there, nor change the one he has', () => {
    setUp()
    expect(setCell('ramp', '2026-02-13', 'LL')).toBe(false)
    expect(requests('ramp', '2026-02-13')).toHaveLength(0)
    expect(setCell('ramp', '2026-02-14', 'OL')).toBe(false)
    expect(requests('ramp', '2026-02-14').map(r => (r as any).code)).toEqual(['LL'])
  })

  it('his refused bid there is history and stays; another man\'s pending bid is not his to take', () => {
    setUp()
    const refused = requests('ramp', '2026-02-12')
    expect(refused.map(r => (r as any).state)).toEqual(['refused'])
    expect(ownPendingOnClosedDay('ramp', '2026-02-12')).toHaveLength(0)
    expect(setCell('ramp', '2026-02-12', '')).toBe(false)
    expect(clearRecordById('ramp', '2026-02-12', refused[0]!.id)).toBe(false)
    expect(requests('ramp', '2026-02-12')).toHaveLength(1)
    const his = requests('tata', '2026-02-10')
    expect(ownPendingOnClosedDay('tata', '2026-02-10')).toHaveLength(0)    // ramp is looking: not his row
    expect(clearRecordById('tata', '2026-02-10', his[0]!.id)).toBe(false)
    expect(requests('tata', '2026-02-10')).toHaveLength(1)
  })
})

/* B8 — over both wired stores, as the app runs: Raptor's session is the actor the commit sees, and the absence door
   installs the open-day probe the permission asks (sync.ts installAbsenceDoor → perms.ts setLwDayOpenProbe). */
describe('B8 — a member\'s bid on a closed day is refused at the commit, not only by the store', () => {
  const ISNAP = JSON.stringify(INPUTS)
  let pid = ''
  beforeEach(() => {
    INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
    raptorInitStore(); initStore(memoryBackend()); setPeople(projectPeople()); wireLeaveWarSync(); lwHistInit()
    pid = 'bane'                                             // Ranger, the seeded member account
    expect(getState().people.some(p => p.id === pid)).toBe(true)
    setSession({ user: 'us', role: 'main' }); setMe(pid)
    setRole('member'); setViewer(pid)
  })
  afterEach(() => { setSession(null); setMe(null as any) })

  const bid = (id: string, code = 'LL'): WarRec => ({ id, kind: 'request', code, state: 'pending' } as WarRec)
  const env = (date: string, before: WarRec[], after: WarRec[]): CommitEnvelope => ({
    seq: 0, at: '', type: 'lw.edit', origin: 'user', scope: { module: 'lw', warId: Y26 } as any,
    actor: { id: 'us', role: 'member', personId: pid, session: {} },
    changes: [{ op: 'put', collection: 'lw.cell', id: `${Y26}:${pid}:${date}`, before, after }],
  })

  it('the permission itself: adding or changing on a closed day is refused; taking his own pending bid is not', () => {
    expect(isDayOpen('2026-06-10')).toBe(false)
    expect(isDayOpen('2026-02-10')).toBe(true)
    expect(ownershipViolation(env('2026-06-10', [], [bid('n1')]))).toMatch(/not open for bidding/)
    expect(ownershipViolation(env('2026-06-10', [bid('n1')], [bid('n1', 'OL')]))).toMatch(/not open for bidding/)
    expect(ownershipViolation(env('2026-06-10', [bid('n1')], []))).toBeNull()                 // D1225
    expect(ownershipViolation(env('2026-06-10', [{ ...bid('n1'), state: 'refused' } as WarRec], []))).toMatch(/not open for bidding/)
    expect(ownershipViolation(env('2026-02-10', [], [bid('n1')]))).toBeNull()                 // an open day
  })

  it('a member command that writes a bid onto a closed day around the store\'s check is rolled back whole', () => {
    /* the absence door's own writer (lwEditLists) skips the bid door's day check — what a bug in a new door would do;
       the commit's permission check is what still stands in the way */
    const run = (date: string) => commit({
      type: 'lw.edit', scope: { module: 'lw', warId: Y26 } as any,
      apply: (t: any) => { t.enlist(lwStore); lwEditLists([{ personId: pid, date, drop: [], add: [bid(`b8-${date}`)] }]) },
    })
    const closed = run('2026-06-10')
    expect((closed as any).ok).toBe(false)
    expect(requests(pid, '2026-06-10')).toHaveLength(0)
    const open = run('2026-02-10')
    expect((open as any).ok).not.toBe(false)
    expect(requests(pid, '2026-02-10').map(r => r.id)).toEqual(['b8-2026-02-10'])
    /* and it IS the open-day check that refused: with the probe taken away, the same closed-day write goes through */
    setLwDayOpenProbe(null)
    try {
      expect((run('2026-06-11') as any).ok).not.toBe(false)
      expect(requests(pid, '2026-06-11')).toHaveLength(1)
    } finally { installAbsenceDoor() }
  })
})

describe('an old saved war still loads (the build plan, batch 1 — D401\'s reading)', () => {
  /* a war row as the stages wrote it: no `open`, a stage and a bidding window */
  function oldRow(id: string, extra: Record<string, unknown>) {
    const { open: _o, lastClosed: _l, ...period } = makeWar(id, id.toUpperCase(), '2026-01-01', '2026-12-31').period as any
    const backend = memoryBackend()
    backend.write(`war:${id}`, JSON.stringify({ ...period, ...extra }))
    initStore(backend)
    return getState().wars.find(w => w.period.id === id)!.period
  }

  it('an open war with its window reads as one open stretch', () => {
    const p = oldRow('old', { stage: 'open', bidFrom: '2026-01-01', bidTo: '2026-03-31' })
    expect(p.open).toEqual([{ from: '2026-01-01', to: '2026-03-31' }])
    expect(p.lastClosed).toBeNull()
    expect('stage' in p).toBe(false)
    asMember('ramp')
    expect(setCell('ramp', '2026-02-10', 'LL')).toBe(true)
    expect(setCell('ramp', '2026-04-10', 'LL')).toBe(false)
  })

  it('an open war with no window reads as the whole period open', () => {
    expect(oldRow('old', { stage: 'open', bidFrom: null, bidTo: null }).open).toEqual([{ from: '2026-01-01', to: '2026-12-31' }])
  })

  it.each(['closed', 'published', 'draft'])('a %s war reads as nothing open — its old window with it', stage => {
    const p = oldRow('old', { stage, bidFrom: '2026-01-01', bidTo: '2026-03-31' })
    expect(p.open).toEqual([])
    asMember('ramp')
    expect(setCell('ramp', '2026-02-10', 'LL')).toBe(false)
  })
})

describe('the open dates and the last-closed note survive a reload', () => {
  it('two stretches, part of one closed: both the stretches and who closed what come back', () => {
    const backend = memoryBackend()
    initStore(backend)
    setRole('admin'); setViewer('ramp')                      // the closing names who did it
    expect(openDates('2026-06-01', '2026-06-30')).toBe('set')
    expect(getState().period.open).toEqual([{ from: '2026-01-01', to: '2026-03-31' }, { from: '2026-06-01', to: '2026-06-30' }])
    expect(closeDates('2026-02-01', '2026-02-28')).toBe('set')
    const open = getState().period.open.map(s => ({ ...s }))
    const note = getState().period.lastClosed
    expect(open).toEqual([
      { from: '2026-01-01', to: '2026-01-31' }, { from: '2026-03-01', to: '2026-03-31' }, { from: '2026-06-01', to: '2026-06-30' },
    ])
    expect(note).toMatchObject({ from: '2026-02-01', to: '2026-02-28', by: 'ramp' })
    expect(typeof note!.at).toBe('string')
    initStore(backend)
    expect(getState().period.open).toEqual(open)
    expect(getState().period.lastClosed).toEqual(note)
  })
})

/* M1's walk, B-F1: a member deleted his own pending bid on a day since closed (D1225) and his Undo was refused ("That
   couldn't be completed just now") — the commit's open-day check (B8) read the Undo as adding a bid to a closed day. A
   restore that only adds back his own pending bids is let through; a restore that brings anything else is not. */
describe('B-F1 — his Undo of deleting his own pending bid on a closed day puts it back', () => {
  const ISNAP = JSON.stringify(INPUTS)
  const pid = 'bane'                                         // Ranger, the seeded member account
  beforeEach(() => {
    INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
    setSession({ user: 'us', role: 'main' }); setMe(pid)
    raptorInitStore(); initStore(memoryBackend()); setPeople(projectPeople()); wireLeaveWarSync()
    _resetTimeline(); lwHistInit(); installGlobalUndo()
    setRole('member'); setViewer(pid)
  })
  afterEach(() => { _resetTimeline(); setSession(null); setMe(null as any) })

  it('bid while open, the day closed by the admin, his Delete, then his Undo: the bid is back; Redo takes it again', () => {
    expect(setCell(pid, '2026-02-10', 'LL')).toBe(true)
    setSession({ user: 'ad', role: 'admin' }); setRole('admin'); setViewer(null)
    expect(closeDates('2026-02-01', '2026-02-28')).toBe('set')
    setSession({ user: 'us', role: 'main' }); setMe(pid); setRole('member'); setViewer(pid)
    expect(isDayOpen('2026-02-10')).toBe(false)
    const own = ownPendingOnClosedDay(pid, '2026-02-10')
    expect(own).toHaveLength(1)
    expect(clearRecordById(pid, '2026-02-10', own[0]!.id)).toBe(true)
    expect(requests(pid, '2026-02-10')).toHaveLength(0)
    const u = globalUndo()
    expect(u.ok, JSON.stringify(u)).toBe(true)
    expect(requests(pid, '2026-02-10').map(r => [r.code, r.state])).toEqual([['LL', 'pending']])
    expect(globalRedo().ok).toBe(true)
    expect(requests(pid, '2026-02-10')).toHaveLength(0)
  })
})

describe('one gesture, one Undo step (B12; D352 narrowed by D1177)', () => {
  const ISNAP = JSON.stringify(INPUTS)
  const DSNAP = JSON.stringify(DAYS)
  beforeEach(() => {
    INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
    DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
    SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
    SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
    stashClear()
    setSession({ user: 'ad', role: 'admin' })
    raptorInitStore(); initStore(memoryBackend()); setPeople(projectPeople()); wireLeaveWarSync()
    _resetTimeline(); lwHistInit(); installGlobalUndo()
    setRole('admin')
  })
  afterEach(() => { _resetTimeline(); setSession(null) })

  it('opening three months is one step: one Undo closes all three again, Redo opens all three', () => {
    const was = getState().period.open.map(s => ({ ...s }))
    const n = _timelineEntries().length
    expect(openDates('2026-07-01', '2026-09-30')).toBe('set')
    expect(_timelineEntries().length).toBe(n + 1)
    expect(getState().period.open).toEqual([...was, { from: '2026-07-01', to: '2026-09-30' }])
    expect(globalUndo().ok).toBe(true)
    expect(getState().period.open).toEqual(was)
    for (const d of ['2026-07-01', '2026-08-15', '2026-09-30']) expect(isDayOpen(d), d).toBe(false)
    expect(globalRedo().ok).toBe(true)
    for (const d of ['2026-07-01', '2026-08-15', '2026-09-30']) expect(isDayOpen(d), d).toBe(true)
  })
})

describe('where the page lands — the first open date from today, in whichever period holds it', () => {
  beforeEach(() => { setMemberTodayForTests('2026-02-10') })
  afterEach(() => { setMemberTodayForTests(null) })

  /* a store whose 2026 has nothing open and whose 2027 opens February, written through the writers, then booted */
  function onlyFeb27(): ReturnType<typeof memoryBackend> {
    const backend = memoryBackend()
    initStore(backend)
    setRole('admin')
    closeDates('2026-01-01', '2026-12-31')
    selectWar(Y27)
    openDates('2027-02-01', '2027-02-28')
    selectWar(Y26)                                           // the last war looked at is NOT where the boot opens
    return backend
  }

  it('the boot picks 2027 and the grid lands on 1 Feb 2027', () => {
    initStore(onlyFeb27())
    expect(getState().currentId).toBe(Y27)
    expect(landingOf(getState().wars.map(w => w.period), memberToday())).toEqual({ periodId: Y27, date: '2027-02-01' })
    /* the page's first show lands where this says (LeaveWarPage.tsx — focusDay(focusDateOf(period, memberToday()))) */
    expect(focusDateOf(getState().period, memberToday())).toBe('2027-02-01')
  })

  it('switching to 2027 from the picker lands on 1 Feb 2027 too; 2026, nothing open, lands on today', () => {
    initStore(onlyFeb27())
    selectWar(Y26)
    expect(getState().focusDate).toBe('2026-02-10')
    selectWar(Y27)
    expect(getState().focusDate).toBe('2027-02-01')
  })

  it('with nothing open anywhere the boot opens on the period holding today', () => {
    const backend = onlyFeb27()
    selectWar(Y27); closeDates('2027-01-01', '2027-12-31')
    initStore(backend)
    expect(getState().currentId).toBe(Y26)
    expect(focusDateOf(getState().period, memberToday())).toBe('2026-02-10')
  })
})
