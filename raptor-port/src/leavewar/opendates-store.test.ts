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
import { initStore as raptorInitStore, writeInputs } from '../state/store'
import { HOOKS } from '../engine/hooks'
import { setSession, setMe } from '../state/auth'
import { ownershipViolation, setLwDayOpenProbe } from '../state/perms'
import { commit, type CommitEnvelope } from '../command'
import { focusDateOf, landingOf, makeWar, memberToday, setMemberTodayForTests, type WarRec } from './engine'
import {
  canBidOn, cellProblem, clearRecordById, closeDates, createWar, getState, initStore, isDayOpen, lwEditLists, lwHistInit,
  lwStore, openDates, ownPendingOnClosedDay, recordsAt, deletableIn, clearCells, selectWar, setBidState, setCell, setCellRange, setPeople, setRole,
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

  /* the break tests' gap 5b: nothing asked `deletableIn`, so a drag-selected block of his pending bids on closed days
     could lose its Delete button unseen */
  it('a dragged block over his pending bids on closed days offers Delete for each; his refused bid is not counted', () => {
    setUp()
    const cells = ['2026-02-10', '2026-02-11', '2026-02-12'].map(date => ({ personId: 'ramp', date }))
    expect(deletableIn(cells)).toBe(2)                               // 10 and 11 pending; 12 refused
    expect(clearCells(cells).written).toBe(2)
    expect(requests('ramp', '2026-02-10')).toHaveLength(0)
    expect(requests('ramp', '2026-02-11')).toHaveLength(0)
    expect(requests('ramp', '2026-02-12').map(r => r.state)).toEqual(['refused'])
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

  /* the break tests' gap 17b, as D1263 (22 Oct 26) narrowed it: what puts a bid back on a closed day is ONLY his Undo of a
     step he made there while it was already closed, vouched for by the timeline (B-F1 and the D1263 block below). A command
     that merely calls itself a restore — nothing the timeline is applying — adds or changes nothing there: not his pending
     bid added back, not a change, not an approved or refused record. Taking his own pending bid away still passes. */
  it('a restore the timeline is not applying adds or changes nothing on a closed day; taking his pending bid still passes', () => {
    const restore = (before: WarRec[], after: WarRec[]): CommitEnvelope => ({ ...env('2026-06-10', before, after), origin: 'restore' } as CommitEnvelope)
    expect(ownershipViolation(restore([], [bid('n1')]))).toMatch(/not open for bidding/)
    expect(ownershipViolation(restore([bid('n1')], []))).toBeNull()
    expect(ownershipViolation(restore([bid('n1')], [bid('n1', 'OL')]))).toMatch(/not open for bidding/)
    expect(ownershipViolation(restore([], [{ ...bid('n1'), state: 'approved' } as unknown as WarRec]))).toMatch(/not open for bidding/)
    expect(ownershipViolation(restore([], [{ ...bid('n1'), state: 'refused' } as WarRec]))).toMatch(/not open for bidding/)
    expect(ownershipViolation(restore([bid('n1')], [{ ...bid('n1'), state: 'approved' } as unknown as WarRec]))).toMatch(/not open for bidding/)
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

/* D1263 (22 Oct 26, his "no" — [LW-REDO-ONTO-CLOSED]): a member's Undo or Redo never puts a bid of his back on a day closed
   for him since; the one exception is his Undo of a step he made on the day while it was ALREADY closed (B-F1, above). Both
   code readers of M1 (Fable F2, Opus scenario 6) found the commit letting any restore through that only added back pending
   bids. The admin's closing sits on the one shared timeline above the member's step, so in one browser that order cannot be
   reached through the "Open for bidding" window; a day that closes for him because it has PASSED (D1211 — the same rule,
   `canEditCell`) can, and is what these drive. */
describe('D1263 — a member\'s Undo or Redo never puts his bid back on a day closed since', () => {
  const ISNAP = JSON.stringify(INPUTS)
  const pid = 'bane'
  const day = '2026-02-10'
  beforeEach(() => {
    INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
    setSession({ user: 'us', role: 'main' }); setMe(pid)
    raptorInitStore(); initStore(memoryBackend()); setPeople(projectPeople()); wireLeaveWarSync()
    _resetTimeline(); lwHistInit(); installGlobalUndo()
    setRole('member'); setViewer(pid)
    setMemberTodayForTests('2026-02-01')
    expect(canBidOn(pid, day)).toBe(true)
  })
  afterEach(() => { _resetTimeline(); setSession(null); setMe(null as any); setMemberTodayForTests('2000-01-01') })
  const closeByTime = () => { setMemberTodayForTests('2026-02-15'); expect(canBidOn(pid, day)).toBe(false) }

  it('bid while open, the day closes, his Undo takes the bid off; his Redo is refused and the day stays empty', () => {
    expect(setCell(pid, day, 'LL')).toBe(true)
    closeByTime()
    expect(globalUndo().ok).toBe(true)                                     // D1225: taking his own pending bid
    expect(requests(pid, day)).toHaveLength(0)
    expect(globalRedo()).toMatchObject({ ok: false, reason: 'Bidding is closed on that day, so your bid can’t go back on it.' })
    expect(requests(pid, day)).toHaveLength(0)
  })

  it('bid and Undo while open, the day closes: his Redo is refused', () => {
    expect(setCell(pid, day, 'LL')).toBe(true)
    expect(globalUndo().ok).toBe(true)
    closeByTime()
    expect(globalRedo().ok).toBe(false)
    expect(requests(pid, day)).toHaveLength(0)
  })

  it('a delete made while the day was open is not undone onto it once closed', () => {
    expect(setCell(pid, day, 'LL')).toBe(true)
    const own = requests(pid, day)
    expect(clearRecordById(pid, day, own[0]!.id)).toBe(true)
    closeByTime()
    expect(globalUndo()).toMatchObject({ ok: false, reason: 'Bidding is closed on that day, so your bid can’t go back on it.' })
    expect(requests(pid, day)).toHaveLength(0)
  })

  it('a delete made on the day already closed (by time) is undone: the bid is back; Redo takes it again', () => {
    expect(setCell(pid, day, 'LL')).toBe(true)
    closeByTime()
    const own = ownPendingOnClosedDay(pid, day)
    expect(own).toHaveLength(1)
    expect(clearRecordById(pid, day, own[0]!.id)).toBe(true)
    expect(globalUndo().ok).toBe(true)
    expect(requests(pid, day).map(r => [r.code, r.state])).toEqual([['LL', 'pending']])
    expect(globalRedo().ok).toBe(true)
    expect(requests(pid, day)).toHaveLength(0)
  })

  /* M1's H1 fix let his Inputs-page half day cut his whole-day bid to its free half on a closed day (D1166); the Undo of
     that filing puts the cut back — the same kind of step: made on the closed day, its Undo restoring exactly what it took */
  it('his Inputs-page morning over his whole-day bid on a closed day: Undo takes the leave away and gives the bid its whole day back', () => {
    expect(setCell(pid, day, 'LL')).toBe(true)
    closeByTime()
    const row: any = { iid: 'd1263-h1', person: pid, type: 'OL', date: 'Feb 10', yr: 2026, half: 'am', s: 0, e: 720, remarks: '', mod: '2026-02-15' }
    expect(writeInputs(() => { INPUTS.unshift(row) })).toBe(true)
    expect(requests(pid, day).map(r => r.code)).toEqual(['LL*'])
    const u = globalUndo()
    expect(u.ok, JSON.stringify(u)).toBe(true)
    expect(INPUTS.some((r: any) => r.iid === 'd1263-h1')).toBe(false)
    expect(requests(pid, day).map(r => [r.code, r.state])).toEqual([['LL', 'pending']])
  })
})

/* M1's code read, H1 (both readers, each proving it alone): a member's Inputs-page half day — leave or a medical — over
   his own whole-day pending bid, on a day closed for him or a day before today, was refused whole: the clash rule cuts the
   bid to its free half inside his command, and the commit's open-day check read the cut as a change. D1166: the Inputs
   page is never stopped by the closed dates; D1211: he may correct a past input there. */
describe('H1 — his Inputs-page half day over his own whole-day pending bid lands on a closed or past day', () => {
  const ISNAP = JSON.stringify(INPUTS)
  const pid = 'bane'
  let said: string[] = []
  const toast = HOOKS.toast
  beforeEach(() => {
    INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
    setSession({ user: 'ad', role: 'admin' })
    raptorInitStore(); initStore(memoryBackend()); setPeople(projectPeople()); wireLeaveWarSync()
    _resetTimeline(); lwHistInit(); installGlobalUndo()
    said = []; HOOKS.toast = (m: any) => { said.push(String(m)) }
  })
  afterEach(() => { HOOKS.toast = toast; _resetTimeline(); setSession(null); setMe(null as any); setMemberTodayForTests('2000-01-01') })
  let n = 0
  const file = (type: string, extra: Record<string, any>): boolean => {
    const row: any = { iid: 'h1-' + (++n), person: pid, type, date: 'Feb 10', yr: 2026, remarks: '', mod: '2026-02-01', ...extra }
    return writeInputs(() => { INPUTS.unshift(row) })
  }
  const asMember = () => { setSession({ user: 'us', role: 'main' }); setMe(pid); setRole('member'); setViewer(pid) }
  const setUp = (mode: 'open' | 'closed' | 'past') => {
    asMember()
    expect(setCell(pid, '2026-02-10', 'LL')).toBe(true)
    if (mode === 'closed') {
      setSession({ user: 'ad', role: 'admin' }); setRole('admin'); setViewer(null)
      expect(closeDates('2026-02-01', '2026-02-28')).toBe('set')
      asMember()
    }
    if (mode === 'past') setMemberTodayForTests('2026-02-15')
  }
  const left = () => requests(pid, '2026-02-10').map(r => [r.code, r.state])
  for (const mode of ['open', 'closed', 'past'] as const) {
    it(`a morning of OL on a ${mode} day lands, and his bid keeps the afternoon`, () => {
      setUp(mode)
      expect(file('OL', { half: 'am', s: 0, e: 720 })).toBe(true)
      expect(INPUTS.filter((r: any) => r.person === pid && r.type === 'OL' && r.date === 'Feb 10')).toHaveLength(1)
      expect(left()).toEqual([['LL*', 'pending']])
    })
  }
  /* the break tests' gap 5d: his pending afternoon bid beside a morning filed on the Inputs page, the day since closed — his
     Delete (a dragged block's) takes the bid and leaves the filed leave */
  it('his pending afternoon bid beside Inputs-page leave on a closed day: Delete takes the bid, the leave stays', () => {
    asMember()
    expect(setCell(pid, '2026-02-10', 'LL*')).toBe(true)
    expect(file('OL', { half: 'am', s: 0, e: 720 })).toBe(true)
    setSession({ user: 'ad', role: 'admin' }); setRole('admin'); setViewer(null)
    expect(closeDates('2026-02-01', '2026-02-28')).toBe('set')
    asMember()
    expect(clearCells([{ personId: pid, date: '2026-02-10' }]).written).toBe(1)
    expect(requests(pid, '2026-02-10')).toHaveLength(0)
    expect(INPUTS.filter((r: any) => r.person === pid && r.type === 'OL' && r.date === 'Feb 10')).toHaveLength(1)
  })

  /* M1's code read (L1 / F6): his two pending halves on a closed day go with ONE Delete — one Undo brings both back */
  it('two pending halves on a closed day: the closed note’s Delete (the empty write) takes both as one Undo step', () => {
    asMember()
    expect(setCell(pid, '2026-02-10', '*LL')).toBe(true)
    expect(setCell(pid, '2026-02-10', 'OL*')).toBe(true)
    setSession({ user: 'ad', role: 'admin' }); setRole('admin'); setViewer(null)
    expect(closeDates('2026-02-01', '2026-02-28')).toBe('set')
    asMember()
    expect(requests(pid, '2026-02-10')).toHaveLength(2)
    expect(setCell(pid, '2026-02-10', '')).toBe(true)
    expect(requests(pid, '2026-02-10')).toHaveLength(0)
    expect(globalUndo().ok).toBe(true)
    expect(requests(pid, '2026-02-10')).toHaveLength(2)
  })

  it('a morning medical (ATT C 08:00–10:00) on a closed day lands too', () => {
    setUp('closed')
    expect(file('ATT C', { s: 480, e: 600 })).toBe(true)
    expect(INPUTS.filter((r: any) => r.person === pid && r.type === 'ATT C' && r.date === 'Feb 10')).toHaveLength(1)
    expect(left()).toHaveLength(1)
  })
  it('the permission itself: the cut passes; any other change to the bid on a closed day is still refused', () => {
    setUp('closed')
    const bid = requests(pid, '2026-02-10')[0]! as WarRec
    const env = (after: WarRec[]): CommitEnvelope => ({
      seq: 0, at: '', type: 'lw.edit', origin: 'user', scope: { module: 'lw', warId: Y26 } as any,
      actor: { id: 'us', role: 'member', personId: pid, session: {} },
      changes: [{ op: 'put', collection: 'lw.cell', id: `${Y26}:${pid}:2026-02-10`, before: [bid], after }],
    })
    expect(ownershipViolation(env([{ ...bid, code: 'LL*' } as WarRec]))).toBeNull()
    expect(ownershipViolation(env([{ ...bid, code: '*LL' } as WarRec]))).toBeNull()
    expect(ownershipViolation(env([{ ...bid, code: 'OL' } as WarRec]))).toMatch(/not open for bidding/)
    expect(ownershipViolation(env([{ ...bid, code: '*OL' } as WarRec]))).toMatch(/not open for bidding/)
    expect(ownershipViolation(env([{ ...bid, code: 'LL*', state: 'approved' } as unknown as WarRec]))).toMatch(/not open for bidding/)
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
