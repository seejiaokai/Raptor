/* [ABSENCE-SMALL-SEEN] 1 (28 Sep 26) — EVERY CLASH LINE NAMES WHERE IT CAN BE UNDONE. The Leave War's clash strip said
   "— resolve on the sheet" on every line, but when the leave in the way was filed on the Inputs page the day's sheet has
   no control for it (it says "Change it on the Inputs page"), and once a war is published its approved leave cannot be
   sent back from the sheet either (21 Sep 26: published leave is finished paperwork). Found by the absence-record
   re-test (W6 N2). One test per holder of the day — a bid, leave the war approved, the same once the war is published,
   leave filed on the Inputs page — each on the strip the admin reads, not only in the list behind it.

   [LW-CLASH-NOTE-PHONE] (owner D805, D823, D827 — "A+", approved as drawn 13 Oct 26; the words D837, 14 Oct 26):
   the words are the writing guide's — the name, the day, what clashes as a sentence, then the instruction as the
   clash's own link — and A TAP GOES WHERE THE INSTRUCTION SAYS. On a phone the note is a slim line of its own under the
   two lines of buttons that opens its list in place; a tablet and a desktop keep the strip (D679). Both are driven
   here; what only a real phone's screen can show — the columns in line, the width, the grid's place — is the walk's
   and e2e's.

   Same harness as oilsync.test.ts: both real stores, headless, the seed Saturday (plasma stands SDO 0800–1800). */
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS, holds } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED, signOf, setDayApproved } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { initStore as raptorInitStore } from '../state/store'
import { CURPAGE, setPage } from '../state/view'
import { INPEDIT, setInpEdit } from '../ui/pops'
import { projectPeople } from './state/raptorRoster'
import { advanceStage, focusDay, getState, initStore as lwInitStore, reopenStage, setBidState, setCell, setPeople, setRole, takeFocusOpen } from './state/store'
import { memoryBackend } from './state/storage'
import { getClashes, installAbsenceDoor, runOilPass, syncAbsences } from './sync'
import { LeaveWarPage } from './LeaveWarPage'
import { StageBar } from './ui/Chrome'
import { PHONE_QUERY } from './ui/phone'

const ISNAP = JSON.stringify(INPUTS)
const DSNAP = JSON.stringify(DAYS)
const SAT = '2026-07-18'
const origMM = window.matchMedia
/* jsdom has no matchMedia, so every test is a desktop's unless it says otherwise (ui/phone.ts) */
const asPhone = () => {
  ;(window as any).matchMedia = (q: string) => ({ matches: q === PHONE_QUERY, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false } })
}

beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  DAYS.length = 0
  JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  stashClear()
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
  installAbsenceDoor()
  setRole('admin')
  setInpEdit(null); setPage('leavewar')
  takeFocusOpen('')                                    // nothing left over from the test before
})
afterEach(() => { cleanup(); (window as any).matchMedia = origMM })

const publishSat = () => {
  const g = signOf(5)
  g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
  setDayApproved(5, true)
  runOilPass()
}
/* the one clash on plasma's Saturday, and the line the admin reads for it */
const theClash = () => {
  const mine = getClashes().filter(c => c.person === 'plasma' && c.date === SAT)
  expect(mine, 'one clash on the Saturday').toHaveLength(1)
  return mine[0]!
}
const cs = (id: string) => getState().people.find(p => p.id === id)!.callsign
const flat = (el: Element | null | undefined) => (el?.textContent || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim()
/** the desktop strip's line for plasma's Saturday, whole */
const stripLine = () => {
  const { container, unmount } = render(<StageBar />)
  const row = [...container.querySelectorAll('[data-testid="sync-clashes"] .row')].map(flat).find(t => t.startsWith(`${cs('plasma')} · Sat 18 Jul · `))
  unmount()
  expect(row, 'the strip carries the Saturday').toBeTruthy()
  return row!
}
const stageTo = (want: string) => {
  for (let i = 0; i < 4 && getState().period.stage !== want; i++) {
    const order = ['draft', 'open', 'closed', 'published']
    if (order.indexOf(getState().period.stage) < order.indexOf(want)) advanceStage(); else reopenStage()
  }
  expect(getState().period.stage).toBe(want)
}
/* the four holders of the day, each set up the way the app does it */
const aBid = () => { setCell('plasma', SAT, 'LL'); publishSat() }
const warLeave = () => { stageTo('closed'); setCell('plasma', SAT, 'LL'); setBidState('plasma', SAT, 'approved'); publishSat() }
const warLeavePublished = () => { stageTo('closed'); setCell('plasma', SAT, 'LL'); setBidState('plasma', SAT, 'approved'); stageTo('published'); publishSat() }
const inputsLeave = () => {
  INPUTS.push({ iid: 'cwo-ll-1', person: 'plasma', type: 'LL', date: 'Jul 18', yr: 2026, allday: true, remarks: '', mod: 'now' })
  syncAbsences()
  publishSat()
}

describe('every clash line names where it can be undone — the words of record (D827, D837)', () => {
  it('a bid in the way: "Decide the bid"', () => {
    aBid()                                              // an undecided bid; July is outside the seed bid window, admin writes it
    const c = theClash()
    expect(c.kind).toBe('duty')
    expect(c.wayOut).toBe('bid')
    expect(stripLine()).toBe(`${cs('plasma')} · Sat 18 Jul · Weekend/PH work earns ${c.inputCode}, but the day holds LL. Decide the bid ›`)
  })

  it('leave the war approved: "Send the leave back or delete it"', () => {
    warLeave()                                          // the absence door writes the Input, carrying the war's mark
    expect(INPUTS.some((r: any) => holds(r, 'plasma') && r.lw), 'the approval wrote war-approved leave').toBe(true)
    expect(theClash().wayOut).toBe('war')
    expect(stripLine()).toMatch(/, but the day holds LL\. Send the leave back or delete it ›$/)
  })

  it('the same leave once the war is published: the sheet offers neither, so the line says it is published and to step the war back', () => {
    warLeavePublished()
    expect(theClash().wayOut).toBe('war-published')
    expect(stripLine()).toMatch(/, but the day holds published LL\. Step the war back to Bidding Closed ›$/)
  })

  it('leave filed on the Inputs page: change it there — the sheet has no control for it', () => {
    inputsLeave()
    expect(theClash().wayOut).toBe('inputs')
    const line = stripLine()
    expect(line).toMatch(/, but the day holds LL\. Change the leave on Inputs ›$/)
    expect(line, 'never the old words that sent him to an empty sheet').not.toMatch(/resolve on the sheet/)
  })

  it('no dash joins the sentence to its instruction, and the old wording is gone', () => {
    aBid()
    const line = stripLine()
    expect(line).not.toMatch(/—/)
    expect(line).not.toMatch(/on the sheet|18 Jul 26|weekend\/PH work earns [^,]+ but/)
  })
})

describe('a tap on a clash goes where its instruction says (D827)', () => {
  it('"Decide the bid": the grid is asked for that day AND to open it for that person — once', () => {
    aBid()
    const { getByTestId } = render(<StageBar />)
    const before = getState().focusSeq
    fireEvent.click(getByTestId('clash-go-0'))
    expect(getState().focusDate).toBe(SAT)
    expect(getState().focusSeq).toBe(before + 1)
    expect(takeFocusOpen(SAT), 'the person the day is opened for').toBe('plasma')
    expect(takeFocusOpen(SAT), 'taken once: a later draw of the grid opens nothing').toBeNull()
    expect(CURPAGE, 'he stays on the Leave War').toBe('leavewar')
  })

  /* (The first cut of this test could not fail — the fresh read of 14 Oct 26, R4: its one assertion stood inside an `if`
     that the under-manned list had to satisfy, and it asked about the under-manned day while the ask left over was for
     the clash's Saturday, which answers "nobody" whether or not the ask was dropped. It asks for the SAME day now.) */
  it('an ordinary jump afterwards drops an "open" nobody took up', () => {
    aBid()
    const { getByTestId } = render(<StageBar />)
    fireEvent.click(getByTestId('clash-go-0'))            // the ask: open the Saturday for plasma (no grid here to take it)
    act(() => { focusDay(SAT) })                           // the plain ask the under-manned list makes — for that same day
    expect(takeFocusOpen(SAT), 'a plain jump to the very day must not open it for him').toBeNull()
  })

  it('leave the war approved, and the same once published: the day is opened for him too', () => {
    warLeave()
    const { getByTestId, unmount } = render(<StageBar />)
    fireEvent.click(getByTestId('clash-go-0'))
    expect(takeFocusOpen(SAT)).toBe('plasma')
    unmount()
  })

  it('"Change the leave on Inputs": the leave’s own window, on the Inputs page', () => {
    inputsLeave()
    expect(theClash().iid, 'the clash knows which input is in the way').toBe('cwo-ll-1')
    const { getByTestId } = render(<StageBar />)
    const seq = getState().focusSeq
    fireEvent.click(getByTestId('clash-go-0'))
    expect(CURPAGE).toBe('inputs')
    expect(INPEDIT && INPEDIT.iid, 'the window is opened on that very input').toBe('cwo-ll-1')
    expect(getState().focusSeq, 'and the grid is not sent anywhere').toBe(seq)
  })

  it('the input gone by the time he taps: the day is opened instead — the tap never does nothing', () => {
    inputsLeave()
    const { getByTestId } = render(<StageBar />)
    const ix = INPUTS.findIndex((r: any) => r.iid === 'cwo-ll-1')
    INPUTS.splice(ix, 1)                                 // removed behind the strip, before any pass has redrawn it
    fireEvent.click(getByTestId('clash-go-0'))
    expect(CURPAGE).toBe('leavewar')
    expect(INPEDIT).toBeNull()
    expect(takeFocusOpen(SAT)).toBe('plasma')
  })

  it('every clash carries the period that holds its date', () => {
    aBid()
    expect(theClash().war).toBe(getState().period.id)
  })

  /* THE WHOLE ROUTE, on the page itself: the strip and the grid share nothing but the store, so this is the one test
     that proves the grid takes the ask up — "Decide the bid" lands on the sheet that decides it (D827). */
  /* A clash day holds two records — the OIL the work earned and the bid — so the sheet a tap on his cell opens is the
     day's list, each record on its own line with its own buttons: the bid's Ack · Approve · Refuse are there. */
  const decidingSheet = () => {
    const sheet = document.querySelector('[data-testid="daylist-sheet"]')
    return { sheet, approve: sheet?.querySelector('[data-testid^="dl-approve-"]') ?? null }
  }
  /* ONE draw of the whole page for both claims: the page with its year of days is the dearest thing these tests draw
     (it ran past the suite's 20 seconds under the full run's load when drawn three times), so it has a minute. The
     PHONE's row makes the very same call (the test above pins what it asks of the store), and the whole route on a
     real phone is e2e/leavewar.spec.ts. */
  it('on the page: "Decide the bid" opens the sheet where that bid is decided, for that person and that day — and a sheet he then closes is not opened again by a later draw', () => {
    aBid()
    const { getByTestId, rerender } = render(<LeaveWarPage active={true} />)
    expect(decidingSheet().sheet, 'no sheet is open before the tap').toBeNull()
    fireEvent.click(getByTestId('clash-go-0'))
    const { sheet, approve } = decidingSheet()
    expect(flat(sheet), 'his day, by name and date').toMatch(new RegExp(`^${cs('plasma')}Sat 18 Jul`))
    expect(approve, 'the bid’s own Approve is on it').toBeTruthy()
    fireEvent.click(getByTestId('daylist-close'))
    expect(decidingSheet().sheet).toBeNull()
    rerender(<LeaveWarPage active={false} />)
    rerender(<LeaveWarPage active={true} />)
    expect(decidingSheet().sheet, 'leaving the tab and coming back opens nothing').toBeNull()
  }, 60_000)
})

describe('on a phone the note is a line of its own that opens its list (D805, D823, D827)', () => {
  it('it is NOT inside the second line of buttons, and the desktop strip is not drawn', () => {
    asPhone(); aBid()
    const { container, getByTestId } = render(<StageBar />)
    const note = getByTestId('sync-clashes')
    expect(note.className).toBe('clashnote')
    expect(container.querySelector('.filters')!.contains(note), 'after the two lines, never in the second').toBe(false)
    expect(container.querySelector('.filters')!.nextElementSibling).toBe(note)
    expect(container.querySelector('.syncclash')).toBeNull()
  })

  it('ONE clash starts open: the line says how many and offers Hide; the row is who · the day · what to do, then what clashes', () => {
    asPhone(); aBid()
    const c = theClash()
    const { getByTestId } = render(<StageBar />)
    const line = getByTestId('clash-line')
    expect(flat(line)).toBe('⚠ 1 clash with the schedule Hide')
    expect(line.getAttribute('aria-expanded')).toBe('true')
    const row = getByTestId('clash-row-0')
    expect(row.tagName).toBe('BUTTON')
    expect([...row.children].map(k => [k.className, flat(k)])).toEqual([
      ['clash-who', cs('plasma')],
      ['clash-day', 'Sat 18 Jul'],
      ['clash-do', 'Decide the bid ›'],
      ['clash-what', `Weekend/PH work earns ${c.inputCode}, but the day holds LL`],
    ])
  })

  it('SEVERAL start closed; Show opens them, Hide closes them, and each is a button of its own', () => {
    asPhone()
    setCell('plasma', SAT, 'LL')
    setCell('bane', SAT, 'OL')                          // bane signs Saturday's sheet — and works it: see publishSat
    DAYS[5].ground.push({ prog: 'Range brief', str: '09:00', end: '12:00', who: 'bane', rmks: '' } as any)
    publishSat()
    const n = getClashes().length
    expect(n, 'two men working the Saturday, both holding a bid on it').toBeGreaterThan(1)
    const { getByTestId, queryByTestId } = render(<StageBar />)
    const line = getByTestId('clash-line')
    expect(flat(line)).toBe(`⚠ ${n} clashes with the schedule Show`)
    expect(line.getAttribute('aria-expanded')).toBe('false')
    expect(queryByTestId('clash-list')).toBeNull()
    fireEvent.click(line)
    expect(line.getAttribute('aria-expanded')).toBe('true')
    expect(getByTestId('clash-list').querySelectorAll('button.clashrow')).toHaveLength(n)
    expect(line.getAttribute('aria-controls')).toBe(getByTestId('clash-list').id)
    fireEvent.click(line)
    expect(queryByTestId('clash-list')).toBeNull()
  })

  it('his Hide is kept: a lone clash he closed stays closed when the list is drawn again', () => {
    asPhone(); aBid()
    const { getByTestId, queryByTestId, rerender } = render(<StageBar />)
    fireEvent.click(getByTestId('clash-line'))           // one clash started open; he hides it
    expect(queryByTestId('clash-list')).toBeNull()
    rerender(<StageBar />)
    expect(queryByTestId('clash-list'), 'not sprung open again').toBeNull()
    expect(flat(getByTestId('clash-line'))).toBe('⚠ 1 clash with the schedule Show')
  })

  /* HIS SHOW / HIDE IS ABOUT THE NOTE IN FRONT OF HIM (the fresh read of 14 Oct 26, R3). The Leave War page stays drawn for
     the whole sign-in, and the choice was never forgotten: after one Hide, a lone clash raised an hour later started
     closed — against "one starts open, more start closed" (D827). When the last clash goes the note goes, and the next
     one starts by the rule again. */
  it('his Hide is forgotten once the last clash has gone: the next lone clash starts open again', () => {
    asPhone(); aBid()
    const { getByTestId, queryByTestId } = render(<StageBar />)
    fireEvent.click(getByTestId('clash-line'))           // he hides the one clash
    expect(queryByTestId('clash-list')).toBeNull()
    act(() => { setCell('plasma', SAT, ''); runOilPass() })            // the bid is taken off: nothing clashes, the note goes
    expect(getClashes(), 'the fixture: no clash is left').toHaveLength(0)
    expect(queryByTestId('sync-clashes'), 'no note while nothing clashes').toBeNull()
    act(() => { setCell('plasma', SAT, 'LL'); runOilPass() })          // …and a clash comes again
    expect(getClashes(), 'the fixture: one clash again').toHaveLength(1)
    expect(flat(getByTestId('clash-line'))).toBe('⚠ 1 clash with the schedule Hide')
    expect(getByTestId('clash-list').querySelectorAll('button.clashrow')).toHaveLength(1)
  })

  it('the names’ column is sized by the whole roster — every callsign, unseen and never read out', () => {
    asPhone(); aBid()
    const { getByTestId } = render(<StageBar />)
    const sizer = getByTestId('clash-list').querySelector('.clashsizer')!
    expect(sizer.getAttribute('aria-hidden')).toBe('true')
    expect([...sizer.children].map(k => k.textContent)).toEqual(getState().people.map(p => p.callsign))
    expect(getByTestId('clash-list').lastElementChild, 'after the rows, so the first row is still the first').toBe(sizer)
  })

  it('a tap on a row goes where the instruction says: the day for that person, or the leave’s own window on Inputs', () => {
    asPhone(); aBid()
    const a = render(<StageBar />)
    fireEvent.click(a.getByTestId('clash-row-0'))
    expect(getState().focusDate).toBe(SAT)
    expect(takeFocusOpen(SAT)).toBe('plasma')
    a.unmount()
  })

  it('…and for leave filed on the Inputs page, that leave’s own window', () => {
    asPhone(); inputsLeave()
    const { getByTestId } = render(<StageBar />)
    expect(flat(getByTestId('clash-row-0').querySelector('.clash-do'))).toBe('Change the leave on Inputs ›')
    fireEvent.click(getByTestId('clash-row-0'))
    expect(CURPAGE).toBe('inputs')
    expect(INPEDIT && INPEDIT.iid).toBe('cwo-ll-1')
  })

  it('the published case keeps its fact: "holds published LL", and the war is what steps back', () => {
    asPhone(); warLeavePublished()
    const { getByTestId } = render(<StageBar />)
    const row = getByTestId('clash-row-0')
    expect(flat(row.querySelector('.clash-what'))).toMatch(/, but the day holds published LL$/)
    expect(flat(row.querySelector('.clash-do'))).toBe('Step the war back to Bidding Closed ›')
  })

  /* The schedule's stylesheet is ONE global sheet, and it already owns short names — `.day` is a day of the week,
     `.go` a wave. The note's first cut called its Show / Hide `go`: the wave's margin and border reached it and the
     line stood 46 tall instead of 30 (the check's first walk, 14 Oct 26). So every part wears a name of the note's own. */
  it('every part of the note wears a name of its own — none the schedule’s stylesheet could reach', () => {
    asPhone(); aBid()
    const { getByTestId } = render(<StageBar />)
    const names = [getByTestId('sync-clashes'), ...getByTestId('sync-clashes').querySelectorAll('*')].flatMap(el => [...el.classList])
    expect(names.length).toBeGreaterThan(6)
    expect(names.filter(n => !n.startsWith('clash')), 'a bare name').toEqual([])
  })

  it('a member sees no note at all, on a phone as on a desktop', () => {
    aBid()
    setRole('member')
    expect(render(<StageBar />).queryByTestId('sync-clashes')).toBeNull()
    cleanup()
    asPhone()
    expect(render(<StageBar />).queryByTestId('sync-clashes')).toBeNull()
  })
})
