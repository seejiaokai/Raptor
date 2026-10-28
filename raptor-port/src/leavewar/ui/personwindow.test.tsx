/* THE PERSON WINDOW (the Leave War overhaul's M5a, jobs 1–2 — PersonWindow.tsx, personleave.ts; the build spec §2.1; D1480,
   D1148, D1203, D1209, D1220, D1231, D1481, D1253, D1292; readings 5, 6, 7, 15, 23; the scenario designer's ★17 and ★20).
   Run as the app runs: the real sign-in (Saber an admin, Ranger — `bane` — a member), the war wired to the app, the one
   Undo, the app's today moved with the clock. */
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../../engine/hooks'
import { PEOPLE, indexCallsigns } from '../../engine/people'
import { INPUTS } from '../../engine/inputs'
import { ELOG, elogClear } from '../../engine/editlog'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../../state/store'
import { accountsLoad, signIn, sessionFor } from '../../state/accounts'
import { installGlobalUndo } from '../../state/undo-wire'
import { _resetTimeline } from '../../undo/timeline'
import { NOTICES } from '../../state/notices'
import { noticeSeenLoad } from '../../state/noticeseen'
import { lwSeenAt } from '../../state/lwseen'
import {
  getState, initStore as lwInitStore, leaveFiguresOf, lwHistInit, openDates, setBalanceLock, setBidStates, setCell, setPeople, setRole,
} from '../state/store'
import { memoryBackend } from '../state/storage'
import { setMemberTodayForTests } from '../engine'
import { projectPeople } from '../state/raptorRoster'
import { warIdentityIfHidden, wireLeaveWarSync } from '../sync'
import { Matrix } from './Matrix'
import { Topbar } from './Chrome'
import { figWords } from './BalancesPage'
import { askLw, balancesUp, lwPage, setApprMode, setBalancesUp, takeLwAsk } from './lwnav'
import { datesWords, inYear, pastYears, personLeave, whenWords } from './personleave'
import { DocViewer } from '../../ui/DocViewer'
import { readFileSync } from 'node:fs'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const ISNAP = JSON.stringify(INPUTS)
const toast = HOOKS.toast
const today = (day = 15) => `2026-07-${String(day).padStart(2, '0')}`
const T = (h: number, day = 15) => { vi.setSystemTime(new Date(2026, 6, day, h, 0, 0)); setMemberTodayForTests(today(day)) }
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const saber = () => signInAs('ad', 'a')
const ranger = () => signInAs('us', 'us')
const win = () => screen.getByTestId('person-window')
const box = (id: string) => screen.getByTestId(id) as HTMLInputElement
const typeIn = (id: string, v: string) => { const b = box(id); fireEvent.focus(b); fireEvent.change(b, { target: { value: v } }); return b }
const RANGER = 'bane'
/* a day of his leave, a weekday ahead of the app's today (Wed 15 Jul 26) */
const D1 = '2026-08-03', D2 = '2026-08-04', D3 = '2026-08-10', D4 = '2026-08-17'

beforeAll(() => { vi.useFakeTimers({ toFake: ['Date'] }); PEOPLE0 = JSON.stringify(PEOPLE) })
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  T(8)
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v }, keys: () => Object.keys(mem) }
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  NOTICES.length = 0
  elogClear()
  lwInitStore(memoryBackend())
  raptorInitStore()
  accountsLoad()
  noticeSeenLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  HOOKS.toast = () => {}
  setApprMode('off'); setBalancesUp(false); takeLwAsk()
  saber()
})
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); resetSession(null); setMemberTodayForTests('2000-01-01'); setBalancesUp(false); setApprMode('off') })

const open = (pid: string) => fireEvent.click(screen.getByTestId(`person-${pid}`))
const close = () => fireEvent.click(screen.getByTestId('pw-close'))

describe('the tiles, from the one engine (D1241, D1251–D1253)', () => {
  it('LVE: App bal · Pending · War bal, carried fwd, taken; OIL "0 ›"; MED days; the five small tiles', () => {
    act(() => { setCell(RANGER, D1, 'LL') })                       // a pending day, so Pending reads
    render(<Matrix />)
    open(RANGER)
    const f = leaveFiguresOf(RANGER)
    expect(box('pw-LVE').value).toBe(figWords(f.kinds.LVE.app))
    expect(box('pw-LVE-cf').value).toBe(figWords(f.kinds.LVE.cf))
    expect(screen.getByTestId('pw-LVE-war').textContent).toBe(figWords(f.kinds.LVE.war))
    expect(f.kinds.LVE.pending).toBeGreaterThan(0)
    const pend = screen.getByTestId('pw-LVE-pend')
    expect(pend.textContent).toBe(`−${figWords(f.kinds.LVE.pending)}`)
    expect(pend.className).toContain('pd')                         // the pending figure amber, its word grey (D1251, D1252)
    expect(screen.getByTestId('pw-taken').textContent).toBe(`${figWords(f.lveTaken)} taken`)
    expect(screen.getByTestId('pw-med').textContent).toBe(figWords(f.medTaken))
    expect(screen.getByTestId('pw-oil').textContent).toMatch(/›$/)
    for (const k of ['CCL', 'FCL', 'PL', 'EL', 'CL'] as const) {
      expect(box(`pw-${k}`).value).toBe(figWords(f.kinds[k].app))
      // the little list only while something is pending (D1253)
      expect(!!screen.queryByTestId(`pw-${k}-pend`)).toBe(f.kinds[k].pending !== 0)
    }
  })

  it('a small tile shows "Pending −1 / War bal" only while its pending is not 0', () => {
    act(() => { setCell(RANGER, D1, 'CCL') })
    render(<Matrix />)
    open(RANGER)
    const k = leaveFiguresOf(RANGER).kinds.CCL
    expect(screen.getByTestId('pw-CCL-pend').textContent).toBe(`−${figWords(k.pending)}`)
    expect(screen.getByTestId('pw-CCL-war').textContent).toBe(figWords(k.war))
    expect(screen.queryByTestId('pw-FCL-pend')).toBeNull()
  })
})

describe('who gets a box (D1203, D1242, D1220 — B6)', () => {
  it('an admin: any row in boxes; locked, his boxes stay and the padlock reads "Locked for members"', () => {
    render(<Matrix />)
    open('stiff')
    expect(box('pw-LVE').tagName).toBe('INPUT')
    expect(screen.queryByTestId('pw-lock')).toBeNull()
    act(() => { setBalanceLock(true) })
    expect(box('pw-LVE').tagName).toBe('INPUT')
    expect(screen.getByTestId('pw-lock').textContent).toBe('Locked for members')
  })

  it('a member’s own: boxes unlocked; locked, none, and "Locked by admin"', () => {
    ranger()
    render(<Matrix />)
    open(RANGER)
    expect(box('pw-LVE').tagName).toBe('INPUT')
    expect(box('pw-CL').tagName).toBe('INPUT')
    close()
    act(() => { saber(); setBalanceLock(true); ranger() })
    open(RANGER)
    expect(screen.getByTestId('pw-LVE').tagName).toBe('SPAN')
    expect(win().querySelectorAll('input')).toHaveLength(0)
    expect(screen.getByTestId('pw-lock').textContent).toBe('Locked by admin')
  })

  it('another man’s window, for a member: read only, no dots, nothing written of his visit', () => {
    ranger()
    render(<Matrix />)
    open('stiff')
    expect(win().querySelectorAll('input')).toHaveLength(0)
    expect(win().querySelectorAll('.m5-dot')).toHaveLength(0)
    expect(lwSeenAt('stiff')).toBe(0)
  })

  it('a member’s save after the lock lands is refused at the box, in the store’s words', () => {
    ranger()
    render(<Matrix />)
    open(RANGER)
    const said: string[] = []
    HOOKS.toast = (m: string) => { said.push(m) }
    typeIn('pw-LVE', '20')
    // the lock lands while he types: his boxes go, and the figure he typed is refused as the box leaves (FigBox's own way —
    // the passing note says it, the box being gone; D850)
    act(() => { saber(); setBalanceLock(true); ranger() })
    expect(screen.getByTestId('pw-LVE').tagName).toBe('SPAN')
    expect(said.some(m => /not saved: Locked by admin$/.test(m))).toBe(true)
    expect(leaveFiguresOf(RANGER).kinds.LVE.app).not.toBe(20)
  })
})

describe('a box (the Balances page’s own — FigBox)', () => {
  it('saves on Enter; a save of the carried-forward box writes the whole row afresh (§1.1)', () => {
    render(<Matrix />)
    open(RANGER)
    fireEvent.keyDown(typeIn('pw-LVE', '20'), { key: 'Enter' })
    expect(leaveFiguresOf(RANGER).kinds.LVE.app).toBe(20)
    fireEvent.keyDown(typeIn('pw-LVE-cf', '3'), { key: 'Enter' })
    const t = getState().balances[RANGER]!.LVE!
    expect(t.amount).toBe(20)
    expect(t.cf).toBe(3)
  })

  it('★20: "-2", "−2" and "2.5" are taken, the keypad a text one with a minus', () => {
    render(<Matrix />)
    open(RANGER)
    expect(box('pw-LVE').inputMode).toBe('text')
    fireEvent.keyDown(typeIn('pw-CCL', '-2'), { key: 'Enter' })
    expect(leaveFiguresOf(RANGER).kinds.CCL.app).toBe(-2)
    fireEvent.keyDown(typeIn('pw-CCL', '−3'), { key: 'Enter' })
    expect(leaveFiguresOf(RANGER).kinds.CCL.app).toBe(-3)
    fireEvent.keyDown(typeIn('pw-CCL', '2.5'), { key: 'Enter' })
    expect(leaveFiguresOf(RANGER).kinds.CCL.app).toBe(2.5)
    fireEvent.keyDown(typeIn('pw-CCL', '2.25'), { key: 'Enter' })
    expect(screen.getByTestId('pw-CCL-err').textContent).toBe('Type a whole number or a half, like 17 or 17.5')
  })

  it('★17: a figure typed in his box and left by a tap on another name is saved to HIM; the next window is the other man’s', () => {
    render(<Matrix />)
    open(RANGER)
    const b = typeIn('pw-LVE', '16')
    fireEvent.blur(b)                         // the tap on another name takes the keyboard first
    open('stiff')
    expect(leaveFiguresOf(RANGER).kinds.LVE.app).toBe(16)
    expect(getState().balances.stiff?.LVE?.amount).not.toBe(16)
    expect(screen.getByTestId('pw-name').textContent).toBe(getState().people.find(p => p.id === 'stiff')!.callsign)
    expect(box('pw-LVE').value).toBe(figWords(leaveFiguresOf('stiff').kinds.LVE.app))
  })

  it('Escape in a box he typed in puts the figure back first; the next Escape closes the window', () => {
    render(<Matrix />)
    open(RANGER)
    const was = box('pw-LVE').value
    box('pw-LVE').focus()
    const b = typeIn('pw-LVE', '9')
    fireEvent.keyDown(b, { key: 'Escape' })
    expect(win()).toBeTruthy()
    expect(box('pw-LVE').value).toBe(was)
    fireEvent.keyDown(box('pw-LVE'), { key: 'Escape' })
    expect(screen.queryByTestId('person-window')).toBeNull()
    expect(leaveFiguresOf(RANGER).kinds.LVE.app).toBe(Number(was.replace('−', '-')))
  })
})

describe('his leave (reading 6, D1327, D1328, D1148)', () => {
  it('one line a leave: approved, pending, refused; a half day "Thu …, AM"; medical and a course not listed', () => {
    act(() => {
      setCell(RANGER, D1, 'LL'); setCell(RANGER, D2, 'LL')           // a run, pending
      setCell(RANGER, D3, '*CCL')                                    // a morning, pending
      setCell(RANGER, D4, 'OL')
      setBidStates([{ personId: RANGER, date: D4 }], 'refused')
    })
    INPUTS.push({ iid: 'pw-med', person: RANGER, type: 'ATT C', date: 'Aug 24', yr: 2026, allday: true, remarks: '' })
    INPUTS.push({ iid: 'pw-cse', person: RANGER, type: 'CSE', date: 'Aug 25', yr: 2026, allday: true, remarks: '' })
    raptorNotify()
    render(<Matrix />)
    open(RANGER)
    const run = screen.getByTestId(`pw-line-${D1}`)
    expect(run.textContent).toContain('Mon 3 – Tue 4 Aug')
    expect(run.textContent).toContain('Pending')
    expect(run.querySelector('.ll-box')!.className).toContain('s-w')
    expect(screen.getByTestId(`pw-line-${D3}`).textContent).toContain('Mon 10 Aug, AM')
    const ref = screen.getByTestId(`pw-line-${D4}`)
    expect(ref.textContent).toContain('Refused')
    expect(ref.querySelector('.ll-box')!.className).toContain('s-r')
    expect(screen.queryByTestId('pw-line-2026-08-24')).toBeNull()
    expect(screen.queryByTestId('pw-line-2026-08-25')).toBeNull()
    // no puck on his own list (D1480)
    expect(win().querySelector('.ll-puck')).toBeNull()
  })

  it('an approved leave is one line from its Input, its paperclip opens its document (D1292)', () => {
    INPUTS.push({ iid: 'pw-ll', person: RANGER, type: 'LL', date: 'Aug 3', endDate: 'Aug 5', yr: 2026, allday: true, remarks: '', docIds: ['d1'] })
    raptorNotify()
    render(<Matrix />)
    open(RANGER)
    const l = screen.getByTestId(`pw-line-${D1}`)
    expect(l.textContent).toContain('Mon 3 – Wed 5 Aug')
    expect(l.textContent).toContain('Approved')
    expect(l.querySelector('.ll-days')!.textContent).toBe('3')
    expect(screen.getByTestId(`pw-clip-${D1}`)).toBeTruthy()
  })

  it('the year picker: this year and ahead by default; a past year lists what touches it', () => {
    const lines = [{ from: '2025-03-02', to: '2025-03-03' }, { from: '2025-12-31', to: '2026-01-02' }, { from: '2026-08-03', to: '2026-08-03' }]
    expect(lines.filter(l => inYear(l, { year: 2026, ahead: true }))).toHaveLength(2)
    expect(lines.filter(l => inYear(l, { year: 2025, ahead: false }))).toHaveLength(2)
    expect(pastYears(lines, 2026)).toEqual([2025])
    act(() => { setCell(RANGER, D1, 'LL') })
    render(<Matrix />)
    open(RANGER)
    const pick = screen.getByTestId('pw-year') as HTMLSelectElement
    expect(pick.options[0]!.textContent).toBe('2026 and ahead')
  })

  it('the words: dates with their weekdays, and an age against the app’s today', () => {
    expect(datesWords('2026-01-19', '2026-01-21')).toBe('Mon 19 – Wed 21 Jan')
    expect(datesWords('2026-01-29', '2026-01-29', 'AM')).toBe('Thu 29 Jan, AM')
    expect(datesWords('2026-01-30', '2026-02-02')).toBe('Fri 30 Jan – Mon 2 Feb')
    expect(whenWords(new Date(2026, 6, 14, 8, 40).getTime(), '2026-07-15')).toBe('yesterday 08:40')
    expect(whenWords(new Date(2026, 6, 15, 9, 5).getTime(), '2026-07-15')).toBe('today 09:05')
    expect(whenWords(new Date(2026, 0, 26, 8, 40).getTime(), '2026-07-15')).toBe('26 Jan 08:40')
  })

  it('a tap on a line takes the grid there — from the Balances page too, which gives way to the grid', () => {
    act(() => { setCell(RANGER, D1, 'LL') })
    render(<Matrix />)
    act(() => { setBalancesUp(true) })
    open(RANGER)
    fireEvent.click(within(screen.getByTestId(`pw-line-${D1}`)).getByRole('button', { name: /Aug/ }))
    expect(balancesUp()).toBe(false)
    expect(lwPage()).toBe('grid')
    expect(getState().focusDate).toBe(D1)
  })
})

describe('new since his last visit (D1231, D1481; reading 7)', () => {
  /* Ranger opens his own window (the visit's moment written), the admin decides his leave an hour later, Ranger opens it
     again an hour after that */
  const story = () => {
    act(() => { setCell(RANGER, D1, 'LL'); setCell(RANGER, D3, 'OL'); setCell(RANGER, D4, 'CL') })
    ranger()
    const v = render(<Matrix />)
    open(RANGER); close()
    v.unmount()
    T(9)
    act(() => {
      saber()
      setBidStates([{ personId: RANGER, date: D1 }], 'approved')
      setBidStates([{ personId: RANGER, date: D3 }], 'refused')
      setCell(RANGER, D4, '')
    })
    T(10)
    ranger()
  }

  it('each change someone else made wears the dot and "who, when"; a deleted leave stays, struck through', () => {
    story()
    render(<Matrix />)
    open(RANGER)
    const appr = screen.getByTestId(`pw-line-${D1}`)
    expect(appr.querySelector('.m5-dot')).toBeTruthy()
    // placed by the admin and approved by him: "added and approved" (D1422's wording)
    expect(screen.getByTestId(`pw-line-${D1}-who`).textContent).toBe('added and approved by Saber · today 09:00')
    expect(screen.getByTestId(`pw-line-${D3}-who`).textContent).toBe('refused by Saber · today 09:00')
    const gone = screen.getByTestId(`pw-line-${D4}`)
    expect(gone.className).toContain('gone')
    expect(gone.textContent).toContain('Deleted')
    expect(screen.getByTestId(`pw-line-${D4}-who`).textContent).toBe('deleted by Saber · today 09:00')
  })

  it('the dots go when he closes his window, and a reload keeps the moment', () => {
    story()
    const v = render(<Matrix />)
    open(RANGER)
    expect(win().querySelectorAll('.m5-dot').length).toBeGreaterThan(0)
    close()
    v.unmount()
    // the moment is a saved row: the app's store read again from what it saved
    raptorInitStore()
    expect(lwSeenAt(RANGER)).toBeGreaterThan(0)
    T(11)
    render(<Matrix />)
    open(RANGER)
    expect(win().querySelectorAll('.m5-dot')).toHaveLength(0)
    expect(screen.queryByTestId(`pw-line-${D4}`)).toBeNull()
  })

  it('his own changes are never dotted', () => {
    act(() => { openDates('2026-08-01', '2026-08-31') })
    ranger()
    const v = render(<Matrix />)
    open(RANGER); close()
    v.unmount()
    T(9)
    act(() => { setCell(RANGER, D1, 'LL') })                         // his own bid
    T(10)
    render(<Matrix />)
    open(RANGER)
    expect(screen.getByTestId(`pw-line-${D1}`).querySelector('.m5-dot')).toBeNull()
  })

  it('an admin opening another man’s window writes nothing of that man’s visit, and sees no dots', () => {
    story()
    saber()
    render(<Matrix />)
    const was = lwSeenAt(RANGER)
    open(RANGER)
    expect(win().querySelectorAll('.m5-dot')).toHaveLength(0)
    expect(lwSeenAt(RANGER)).toBe(was)
  })

  it('the lines read the history’s machine marks, never its words', () => {
    story()
    const marks = ELOG.rows.filter(r => r.sub === RANGER && r.fld === 'deleted')
    expect(marks.length).toBeGreaterThan(0)
    for (const r of marks) r.lbl = 'words nobody reads'
    expect(personLeave(RANGER, 1).some(l => l.state === 'deleted')).toBe(true)
  })
})

describe('the ways in (§5)', () => {
  it('a name on the grid, and the LVE figure beside it (reading 15)', () => {
    render(<Matrix />)
    open(RANGER)
    expect(win()).toBeTruthy()
    close()
    fireEvent.click(screen.getByTestId(`bal-${RANGER}`))
    expect(win()).toBeTruthy()
    expect(screen.queryByTestId('figure-breakdown')).toBeNull()
  })

  it('My leave opens his own (A1)', () => {
    ranger()
    render(<><Topbar /><Matrix /></>)
    fireEvent.click(screen.getByTestId('my-leave'))
    expect(screen.getByTestId('pw-name').textContent).toBe(getState().people.find(p => p.id === RANGER)!.callsign)
  })

  it('a name on the Balances page (reading 23): the window stands in the Leave War’s page, never inside the hidden grid', () => {
    const pg = document.createElement('section')
    pg.id = 'page-leavewar'; pg.className = 'page on'
    const host = document.createElement('div'); host.hidden = true
    pg.appendChild(host); document.body.appendChild(pg)
    try {
      render(<Matrix />, { container: host })
      act(() => { setBalancesUp(true); askLw({ kind: 'person', id: RANGER }) })
      const w = screen.getByTestId('person-window')
      expect(pg.contains(w)).toBe(true)
      expect(w.closest('[hidden]')).toBeNull()
    } finally { pg.remove() }
  })

  it('a man with no row on the grid (B12): his window, his figures, no line a link', () => {
    const hidden = Object.keys(PEOPLE).find(id => !getState().people.some(p => p.id === id) && warIdentityIfHidden(id))
    expect(hidden, 'the demo holds a man the war shows no row for').toBeTruthy()
    render(<Matrix />)
    act(() => { askLw({ kind: 'person', id: hidden! }) })
    expect(win()).toBeTruthy()
    expect(box('pw-LVE').value).toBe(figWords(leaveFiguresOf(hidden!).kinds.LVE.app))
    expect(win().querySelectorAll('.ll-go')).toHaveLength(0)
  })

  it('"0 ›" opens HIS OIL tracker, on his row', () => {
    render(<Matrix />)
    open(RANGER)
    fireEvent.click(screen.getByTestId('pw-oil'))
    expect(screen.queryByTestId('person-window')).toBeNull()
    expect(screen.getByTestId('oil-sheet')).toBeTruthy()
    expect(screen.getByTestId(`oil-row-${RANGER}`).className).toContain('here')
  })

  it('the Balances page’s "0 ›" opens that man’s tracker too (the ask carries his id)', () => {
    render(<Matrix />)
    act(() => { askLw({ kind: 'oil', id: RANGER }) })
    expect(screen.getByTestId(`oil-row-${RANGER}`).className).toContain('here')
  })
})

describe('the keyboard (the design guide §3)', () => {
  it('opens with the keyboard on the window; Escape closes it and gives the keyboard back to the name', () => {
    render(<Matrix />)
    const name = screen.getByTestId(`person-${RANGER}`)
    name.focus()
    fireEvent.click(name)
    expect(document.activeElement).toBe(win())
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByTestId('person-window')).toBeNull()
    expect(document.activeElement).toBe(name)
  })

  it('an admin sees his own window as his: dots are his to see (D1231 — an admin’s own included)', () => {
    setRole('admin')
    const me = getState().viewer!
    render(<Matrix />)
    act(() => { askLw({ kind: 'person', id: me }) })
    expect(lwSeenAt(me)).toBeGreaterThan(0)
  })
})

/* THE M5a WALK'S FAULTS (29 Oct 26 — the host's triage, `docs/handpass/parts/lw-m5a/walk-triage.md`). */
describe('the M5a walk\'s faults', () => {
  it('A-F3 / C: a box keeps one width whatever its figure, so the figures beside it never move as it is typed in', () => {
    render(<Matrix />)
    open(RANGER)
    const w0 = box('pw-LVE').style.width
    fireEvent.blur(typeIn('pw-LVE', '16.5'))
    expect(box('pw-LVE').value).toBe('16.5')
    expect(box('pw-LVE').style.width).toBe(w0)
    typeIn('pw-CCL', '-12.5')
    const c0 = box('pw-CCL').style.width
    fireEvent.change(box('pw-CCL'), { target: { value: '3' } })
    expect(box('pw-CCL').style.width).toBe(c0)
    expect(box('pw-LVE-cf').style.width).toBe(box('pw-LVE-cf').style.width)
  })

  it('C-F2 / C-F3: Escape closes the document viewer first, the keyboard back on the paperclip; the next closes the window, the keyboard back on the name', () => {
    INPUTS.push({ iid: 'pw-ll', person: RANGER, type: 'LL', date: 'Aug 3', endDate: 'Aug 5', yr: 2026, allday: true, remarks: '', docIds: ['d1'] })
    raptorNotify()
    render(<><Matrix /><DocViewer /></>)
    const name = screen.getByTestId(`person-${RANGER}`)
    name.focus()
    fireEvent.click(name)
    const clip = screen.getByTestId(`pw-clip-${D1}`)
    clip.focus()
    act(() => { fireEvent.click(clip) })
    const viewer = document.getElementById('docViewPop')!
    expect(viewer.hidden).toBe(false)
    act(() => { fireEvent.keyDown(document.activeElement ?? document, { key: 'Escape' }) })
    expect(viewer.hidden).toBe(true)
    expect(screen.queryByTestId('person-window')).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByTestId(`pw-clip-${D1}`))
    act(() => { fireEvent.keyDown(document.activeElement ?? document, { key: 'Escape' }) })
    expect(screen.queryByTestId('person-window')).toBeNull()
    expect(document.activeElement).toBe(name)
  })

  it('the phone\'s window stands under the top bar: its place and its height are read from the bar\'s live height (the stylesheet — measured on the built app)', () => {
    const css = readFileSync('src/leavewar/ui/personwindow.css', 'utf8').replace(/\r\n/g, '\n').replace(/\/\*[\s\S]*?\*\//g, '')
    const phone = css.slice(css.indexOf('@media (max-width: 700px)'))
    const rule = phone.slice(0, phone.indexOf('}', phone.indexOf('[data-testid="person-window"]')))
    expect(rule).toMatch(/max-height:\s*calc\(100dvh - 2 \* \(var\(--topbar-h, 0px\) \+ 8px\)\)/)
  })

  /* (the LVE figure beside a name is a table cell, never a keyboard stop — the name beside it is the keyboard's way in — so
     a window it opens has no button to give the keyboard back to) */
  it('C-F3: closed by Escape or by ✕, the keyboard goes back to My leave and to the name that opened it', () => {
    ranger()
    render(<><Topbar /><Matrix /></>)
    const mine = screen.getByTestId('my-leave')
    mine.focus(); fireEvent.click(mine)
    expect(win()).toBeTruthy()
    act(() => { fireEvent.keyDown(document.activeElement ?? document, { key: 'Escape' }) })
    expect(screen.queryByTestId('person-window')).toBeNull()
    expect(document.activeElement).toBe(mine)
    const name = screen.getByTestId(`person-${RANGER}`)
    name.focus(); fireEvent.click(name)
    screen.getByTestId('pw-close').focus()
    close()
    expect(screen.queryByTestId('person-window')).toBeNull()
    expect(document.activeElement).toBe(name)
  })
})
