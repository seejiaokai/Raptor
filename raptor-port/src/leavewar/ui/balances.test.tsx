/* THE BALANCES TAB AND PAGE, THE GRADES WINDOW AND THE LOCK (the overhaul's M5a, job 3 — D1482–D1488, D1486, D1242, D1255,
   D1254; the build spec §2.2, §2.3; the scenario designer's ★17 and ★20). Saber (`stiff`) is the admin, Ranger (`bane`) a
   member. */
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../../engine/hooks'
import { PEOPLE, indexCallsigns } from '../../engine/people'
import { INPUTS } from '../../engine/inputs'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../../state/store'
import { accountsLoad, signIn, sessionFor } from '../../state/accounts'
import { installGlobalUndo } from '../../state/undo-wire'
import { globalUndo, globalRedo } from '../../undo'
import { _resetTimeline } from '../../undo/timeline'
import { NOTICES } from '../../state/notices'
import { noticeSeenLoad } from '../../state/noticeseen'
import {
  balancesLocked, getState, gradeOf, gradeDaysNow, gradeHolders, initStore as lwInitStore, leaveFiguresOf, liveGrades,
  lwHistInit, setBalanceLock, setPeople, setPersonGrade,
} from '../state/store'
import { memoryBackend } from '../state/storage'
import { setMemberTodayForTests } from '../engine'
import { projectPeople } from '../state/raptorRoster'
import { wireLeaveWarSync } from '../sync'
import { BalancesPage, figWords } from './BalancesPage'
import { deleteAsk } from './GradesSheet'
import { Topbar } from './Chrome'
import { lwPage, setApprMode, setBalancesUp, takeLwAsk } from './lwnav'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const ISNAP = JSON.stringify(INPUTS)
const toast = HOOKS.toast
const today = (day = 15) => `2026-07-${String(day).padStart(2, '0')}`
const T = (h: number, day = 15) => { vi.setSystemTime(new Date(2026, 6, day, h, 0, 0)); setMemberTodayForTests(today(day)) }
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const saber = () => signInAs('ad', 'a')
const ranger = () => signInAs('us', 'us')
const lve = (pid: string) => leaveFiguresOf(pid).kinds.LVE
const box = (id: string) => screen.getByTestId(id) as HTMLInputElement
/* type into a box the way a person does: a change, then leaving it (or Enter) */
const typeIn = (id: string, v: string) => { const b = box(id); fireEvent.focus(b); fireEvent.change(b, { target: { value: v } }); return b }

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

describe('the tab row (D1254, D1483)', () => {
  const tabs = () => [...document.querySelectorAll('[role="tab"]')].map(t => t.querySelector('.intab-t')!.textContent)
  it('an admin: Grid · Approvals · Balances · OIL, ⚙ at the right end', () => {
    const { container } = render(<Topbar />)
    expect(tabs()).toEqual(['Grid', 'Approvals', 'Balances', 'OIL'])
    const row = container.querySelector('.topbar')!
    expect(row.lastElementChild!.getAttribute('data-testid')).toBe('settings-open')
  })
  it('a member: Grid · Balances · OIL — Balances stays for him (D1242)', () => {
    ranger()
    render(<Topbar />)
    expect(tabs()).toEqual(['Grid', 'Balances', 'OIL'])
    expect(screen.queryByTestId('settings-open')).toBeNull()
  })
  it('Balances takes the grid card\'s place and reads as chosen; Approvals and Grid take it down again', () => {
    render(<Topbar />)
    fireEvent.click(screen.getByTestId('lw-tab-balances'))
    expect(lwPage()).toBe('balances')
    expect(screen.getByTestId('lw-tab-balances').getAttribute('aria-selected')).toBe('true')
    expect(screen.getByTestId('lw-tab-grid').getAttribute('aria-selected')).toBe('false')
    fireEvent.click(screen.getByTestId('lw-tab-approvals'))
    expect(lwPage()).toBe('approvals')
    expect(screen.getByTestId('lw-tab-balances').getAttribute('aria-selected')).toBe('false')
    fireEvent.click(screen.getByTestId('lw-tab-balances'))
    fireEvent.click(screen.getByTestId('lw-tab-grid'))
    expect(lwPage()).toBe('grid')
  })
  it('a member keeps Balances: the guard that takes Approvals off him leaves it up', () => {
    ranger()
    render(<Topbar />)
    fireEvent.click(screen.getByTestId('lw-tab-balances'))
    expect(lwPage()).toBe('balances')
  })
  it('the Balances tab wears round 19\'s bars, which a narrow iPhone drops (the stylesheet — not measurable in jsdom)', () => {
    render(<Topbar />)
    expect(screen.getByTestId('lw-tab-balances').querySelector('svg.btnglyph')).toBeTruthy()
  })
})

describe('the page for an admin (D1482)', () => {
  it('lists the grid\'s people with every box; figures from the one engine, halves .5', () => {
    render(<BalancesPage />)
    const L = lve('bane')
    expect(box('bal-LVE-bane').value).toBe(figWords(L.app))
    expect(box('bal-cf-bane').value).toBe(figWords(L.cf))
    expect(screen.getByTestId('bal-war-bane').textContent).toBe(figWords(L.war))
    expect(box('bal-LVE-stiff')).toBeTruthy()
    for (const k of ['CCL', 'FCL', 'PL', 'EL', 'CL']) expect(box(`bal-${k}-bane`)).toBeTruthy()
    expect(screen.getByTestId('bal-grades')).toBeTruthy()
    expect(screen.getByTestId('bal-lock').getAttribute('aria-checked')).toBe('false')
  })
  it('a typed App bal saves on leaving the box, never on each key; War bal follows', () => {
    render(<BalancesPage />)
    const b = typeIn('bal-LVE-bane', '20')
    expect(lve('bane').app).not.toBe(20)
    fireEvent.blur(b)
    expect(lve('bane').app).toBe(20)
    expect(screen.getByTestId('bal-war-bane').textContent).toBe(figWords(lve('bane').war))
  })
  it('Enter saves; Escape puts the old figure back and saves nothing', () => {
    render(<BalancesPage />)
    const was = lve('bane').app
    const b = typeIn('bal-CCL-bane', '4')
    fireEvent.keyDown(b, { key: 'Enter' })
    expect(leaveFiguresOf('bane').kinds.CCL.app).toBe(4)
    typeIn('bal-LVE-bane', '33')
    fireEvent.keyDown(box('bal-LVE-bane'), { key: 'Escape' })
    expect(box('bal-LVE-bane').value).toBe(figWords(was))
    fireEvent.blur(box('bal-LVE-bane'))
    expect(lve('bane').app).toBe(was)
  })
  it('a correction of only "incl. carried fwd" writes the whole row afresh, App bal as it shows (narrow read 2)', () => {
    render(<BalancesPage />)
    fireEvent.blur(typeIn('bal-LVE-bane', '17'))
    fireEvent.blur(typeIn('bal-cf-bane', '3'))
    expect(lve('bane')).toMatchObject({ app: 17, cf: 3 })
    /* WAS refused "Carried forward is from 0 to 17", the 3 kept. The spec §1.1 CLAMPS it to 0 … the figure (walker D's
       FAIL 7, 29 Oct 26): 30 beside an App bal of 17 saves 17, no refusal, and the box shows it */
    fireEvent.blur(typeIn('bal-cf-bane', '30'))
    expect(screen.queryByTestId('bal-cf-bane-err')).toBeNull()
    expect(lve('bane')).toMatchObject({ app: 17, cf: 17 })
    expect(box('bal-cf-bane').value).toBe('17')
  })
  it('below zero is typed with either minus; a half saves; anything else is refused in the store\'s words (★20, reading 10)', () => {
    render(<BalancesPage />)
    fireEvent.blur(typeIn('bal-LVE-bane', '-2'))
    expect(lve('bane').app).toBe(-2)
    expect(box('bal-LVE-bane').value).toBe('−2')
    fireEvent.blur(typeIn('bal-LVE-bane', '−3'))
    expect(lve('bane').app).toBe(-3)
    fireEvent.blur(typeIn('bal-LVE-bane', '2.5'))
    expect(lve('bane').app).toBe(2.5)
    fireEvent.blur(typeIn('bal-LVE-bane', '17.3'))
    expect(screen.getByTestId('bal-LVE-bane-err').textContent).toBe('Type a whole number or a half, like 17 or 17.5')
    fireEvent.blur(typeIn('bal-LVE-bane', 'ten'))
    expect(screen.getByTestId('bal-LVE-bane-err').textContent).toBe('Type a whole number or a half, like 17 or 17.5')
    expect(lve('bane').app).toBe(2.5)
    expect(box('bal-LVE-bane').getAttribute('inputmode')).toBe('text')
  })
  it('one Undo takes a typed figure back, Redo brings it again', () => {
    render(<BalancesPage />)
    const was = lve('bane').app
    fireEvent.blur(typeIn('bal-LVE-bane', '21'))
    act(() => { globalUndo() })
    expect(lve('bane').app).toBe(was)
    expect(box('bal-LVE-bane').value).toBe(figWords(was))
    act(() => { globalRedo() })
    expect(lve('bane').app).toBe(21)
  })
})

describe('a figure typed in one man\'s box saves to that man (★17)', () => {
  it('leaving by a tap on another name: his figure saved, the other man\'s window asked for', () => {
    render(<BalancesPage />)
    const b = typeIn('bal-LVE-bane', '16')
    fireEvent.blur(b)
    fireEvent.click(screen.getByTestId('bal-name-stiff'))
    expect(lve('bane').app).toBe(16)
    expect(lve('stiff').app).not.toBe(16)
    expect(takeLwAsk()).toEqual({ kind: 'person', id: 'stiff' })
  })
  it('leaving by Days taken, with no blur the browser would raise: the box taken off the screen still saves his', () => {
    render(<BalancesPage />)
    typeIn('bal-LVE-bane', '14')
    fireEvent.click(screen.getByTestId('bal-view-taken'))
    expect(lve('bane').app).toBe(14)
    expect(screen.queryByTestId('bal-LVE-bane')).toBeNull()
  })
  it('leaving by Lock and by Grades…: his figure saved first', () => {
    render(<BalancesPage />)
    fireEvent.blur(typeIn('bal-LVE-bane', '13'))
    fireEvent.click(screen.getByTestId('bal-lock'))
    expect(lve('bane').app).toBe(13)
    fireEvent.blur(typeIn('bal-CCL-bane', '2'))
    fireEvent.click(screen.getByTestId('bal-grades'))
    expect(leaveFiguresOf('bane').kinds.CCL.app).toBe(2)
  })
})

describe('the page for a member (D1242, D1487)', () => {
  it('unlocked: his own row in boxes, everyone else\'s read only; no Grades, no lock; his grade as words', () => {
    act(() => { setPersonGrade('bane', 'sp') })
    ranger()
    render(<BalancesPage />)
    expect(box('bal-LVE-bane')).toBeTruthy()
    expect(screen.queryByTestId('bal-LVE-stiff')).toBeNull()
    expect(within(screen.getByTestId('bal-row-stiff')).queryAllByRole('textbox')).toHaveLength(0)
    expect(screen.queryByTestId('bal-grades')).toBeNull()
    expect(screen.queryByTestId('bal-lock')).toBeNull()
    expect(screen.queryByTestId('bal-grade-bane')).toBeNull()
    expect(screen.getByTestId('bal-row-bane').textContent).toContain('Senior pilot+36')
    fireEvent.blur(typeIn('bal-LVE-bane', '19'))
    expect(lve('bane').app).toBe(19)
  })
  it('locked: everything read only, "Locked by admin" with the padlock', () => {
    act(() => { setBalanceLock(true) })
    ranger()
    render(<BalancesPage />)
    expect(screen.queryByTestId('bal-LVE-bane')).toBeNull()
    expect(screen.getByTestId('bal-locked').textContent).toBe('Locked by admin')
    expect(screen.getByTestId('bal-locked').querySelector('svg')).toBeTruthy()
  })
  it('the lock landing while his box holds a figure: not saved, and he is told why (B6)', () => {
    const said: string[] = []
    HOOKS.toast = (m: string) => { said.push(m) }
    ranger()
    render(<BalancesPage />)
    const was = lve('bane').app
    typeIn('bal-LVE-bane', '30')
    act(() => { saber(); setBalanceLock(true); ranger() })
    expect(lve('bane').app).toBe(was)
    expect(said.join(' ')).toContain('not saved: Locked by admin')
  })
})

describe('Days taken (D1484, reading 20)', () => {
  it('heads with the View period\'s own name, a column a kind, a dash for none', () => {
    render(<BalancesPage />)
    fireEvent.click(screen.getByTestId('bal-view-taken'))
    expect(screen.getByTestId('bal-taken-head').textContent).toBe(`DAYS TAKEN IN ${getState().period.name}`)
    for (const k of ['LL', 'OL', 'OIL', 'CCL', 'FCL', 'PL', 'EL', 'CL', 'MED', 'CSE', 'OD']) expect(screen.getByTestId(`bal-taken-${k}-bane`)).toBeTruthy()
    expect(screen.getByTestId('bal-taken-CL-bane').textContent).toBe('–')
    /* the bar stays the same in both views (D1484) */
    expect(screen.getByTestId('bal-grades')).toBeTruthy()
  })
})

describe('OIL is read only; a name opens his window (D1255, reading 23)', () => {
  it('"0 ›" leaves the page for his OIL tracker; a name asks for his person window', () => {
    setBalancesUp(true)
    render(<BalancesPage />)
    fireEvent.click(screen.getByTestId('bal-oil-bane'))
    expect(lwPage()).toBe('grid')
    expect(takeLwAsk()).toEqual({ kind: 'oil', id: 'bane' })
    expect(screen.queryByTestId('bal-OIL-bane')).toBeNull()
  })
})

describe('a row\'s grade box and its list (D1486, D1233, D1249)', () => {
  it('lists the grades with their "+ days" and "No grade"; a pick sets it; "No grade" shows in amber in his row', () => {
    render(<BalancesPage />)
    fireEvent.click(screen.getByTestId('bal-grade-bane'))
    const list = screen.getByTestId('bal-grade-list')
    expect(within(list).getAllByRole('menuitemradio').map(b => b.textContent)).toEqual(
      [...liveGrades().map(g => `${g.name}+${gradeDaysNow(g)}`), 'No grade–'])
    fireEvent.click(screen.getByTestId('bal-grade-opt-jw'))
    expect(gradeOf('bane')!.id).toBe('jw')
    expect(screen.queryByTestId('bal-grade-list')).toBeNull()
    expect(screen.getByTestId('bal-grade-bane').textContent).toBe('Junior WSO+18')
    fireEvent.click(screen.getByTestId('bal-grade-bane'))
    fireEvent.click(screen.getByTestId('bal-grade-opt-none'))
    expect(gradeOf('bane')).toBeNull()
    expect(screen.getByTestId('bal-grade-bane').classList.contains('none')).toBe(true)
    expect(screen.getByTestId('bal-grade-bane').textContent).toContain('No grade')
  })
  it('Escape closes the list and the keyboard goes back to the box', () => {
    render(<BalancesPage />)
    const b = screen.getByTestId('bal-grade-bane')
    fireEvent.click(b)
    fireEvent.keyDown(screen.getByTestId('bal-grade-list'), { key: 'Escape' })
    expect(screen.queryByTestId('bal-grade-list')).toBeNull()
    expect(document.activeElement).toBe(b)
  })
})

describe('the Grades window (D1486, D1234, D890)', () => {
  const open = () => { render(<BalancesPage />); fireEvent.click(screen.getByTestId('bal-grades')); return screen.getByTestId('grades-sheet') }
  it('lists each grade: its name in a box, how many hold it, its "+36" box, a ✕; "+ Grade" at the foot', () => {
    act(() => { setPersonGrade('bane', 'sp'); setPersonGrade('stiff', 'sp') })
    open()
    expect((screen.getByTestId('grade-name-sp') as HTMLInputElement).value).toBe('Senior pilot')
    expect(screen.getByTestId('grade-holds-sp').textContent).toBe('2 people')
    expect((screen.getByTestId('grade-days-sp') as HTMLInputElement).value).toBe('+36')
    expect(screen.getByTestId('grade-del-sp')).toBeTruthy()
    expect(screen.getByTestId('grade-add').textContent).toBe('+ Grade')
  })
  it('a rename saves; two grades cannot share a name, said at the box', () => {
    open()
    const n = screen.getByTestId('grade-name-opsa') as HTMLInputElement
    fireEvent.change(n, { target: { value: 'Ops B' } })
    fireEvent.keyDown(n, { key: 'Enter' })
    expect(liveGrades().find(g => g.id === 'opsa')!.name).toBe('Ops B')
    fireEvent.change(n, { target: { value: 'senior pilot' } })
    fireEvent.keyDown(n, { key: 'Enter' })
    expect(screen.getByTestId('grade-name-opsa-err').textContent).toBe('Another grade has that name')
    expect(liveGrades().find(g => g.id === 'opsa')!.name).toBe('Ops B')
  })
  it('its "+ days" box sets the days the next 1 Jan adds (D1490)', () => {
    open()
    const d = screen.getByTestId('grade-days-jp') as HTMLInputElement
    fireEvent.focus(d)
    fireEvent.change(d, { target: { value: '30' } })
    fireEvent.keyDown(d, { key: 'Enter' })
    expect(gradeDaysNow(liveGrades().find(g => g.id === 'jp')!)).toBe(30)
  })
  it('"+ Grade" adds one once it has a name', () => {
    open()
    fireEvent.click(screen.getByTestId('grade-add'))
    fireEvent.change(screen.getByTestId('grade-draft-name'), { target: { value: 'Ops B' } })
    fireEvent.change(screen.getByTestId('grade-draft-days'), { target: { value: '12' } })
    fireEvent.keyDown(screen.getByTestId('grade-draft-name'), { key: 'Enter' })
    const g = liveGrades().find(x => x.name === 'Ops B')!
    expect(g).toBeTruthy()
    expect(gradeDaysNow(g)).toBe(12)
    expect(screen.queryByTestId('grade-draft')).toBeNull()
  })
  it('deleting a grade people hold asks first, naming how many; they become "No grade"; Undo brings it back', () => {
    act(() => { setPersonGrade('bane', 'jw'); setPersonGrade('stiff', 'jw'); setPersonGrade('stiff', 'jw') })
    open()
    fireEvent.click(screen.getByTestId('grade-del-jw'))
    expect(screen.getByTestId('grade-ask').textContent).toContain(deleteAsk(gradeHolders('jw'), 'Junior WSO'))
    expect(deleteAsk(3, 'Junior WSO')).toBe('3 people hold Junior WSO: they become No grade')
    expect(liveGrades().some(g => g.id === 'jw')).toBe(true)
    fireEvent.click(screen.getByTestId('grade-del-sure'))
    expect(liveGrades().some(g => g.id === 'jw')).toBe(false)
    expect(gradeOf('bane')).toBeNull()
    act(() => { globalUndo() })
    expect(liveGrades().some(g => g.id === 'jw')).toBe(true)
    expect(gradeOf('bane')!.id).toBe('jw')
  })
  it('a grade nobody holds goes at once', () => {
    open()
    expect(gradeHolders('opsa')).toBe(0)
    fireEvent.click(screen.getByTestId('grade-del-opsa'))
    expect(screen.queryByTestId('grade-ask')).toBeNull()
    expect(liveGrades().some(g => g.id === 'opsa')).toBe(false)
  })
  it('the grip\'s arrow keys move a grade one place, the keyboard staying on it', () => {
    open()
    const before = liveGrades().map(g => g.id)
    fireEvent.keyDown(screen.getByTestId(`grade-grip-${before[0]}`), { key: 'ArrowDown' })
    expect(liveGrades().map(g => g.id)).toEqual([before[1], before[0], ...before.slice(2)])
    expect(document.activeElement).toBe(screen.getByTestId(`grade-grip-${before[0]}`))
  })
  it('Escape in a box puts its old value back first; the next Escape closes the window, the keyboard back on "Grades…"', () => {
    open()
    const n = screen.getByTestId('grade-name-sp') as HTMLInputElement
    n.focus()
    fireEvent.change(n, { target: { value: 'Senior' } })
    fireEvent.keyDown(n, { key: 'Escape' })
    expect(n.value).toBe('Senior pilot')
    expect(screen.getByTestId('grades-sheet')).toBeTruthy()
    fireEvent.keyDown(n, { key: 'Escape' })
    expect(screen.queryByTestId('grades-sheet')).toBeNull()
    expect(document.activeElement).toBe(screen.getByTestId('bal-grades'))
  })
})

describe('the lock (D1220, D1247, D1488)', () => {
  it('an admin\'s switch: on, he keeps his boxes; off again', () => {
    render(<BalancesPage />)
    const sw = screen.getByTestId('bal-lock')
    fireEvent.click(sw)
    expect(balancesLocked()).toBe(true)
    expect(sw.getAttribute('aria-checked')).toBe('true')
    expect(sw.textContent).toBe('Lock for members')
    expect(box('bal-LVE-bane')).toBeTruthy()
    fireEvent.click(sw)
    expect(balancesLocked()).toBe(false)
  })
})

/* THE PAGE IN THE GRID CARD'S PLACE (LeaveWarPage.tsx Body, as Approvals' — M4): the grid stays mounted and hidden, flagged
   off screen so it fills nothing in the background; leaving the Leave War ends it, the grid kept off screen. */
describe('the page takes the grid card\'s place', () => {
  it('the grid hidden but mounted, off screen; back to the grid on Grid; leaving the Leave War ends it', async () => {
    const { LeaveWarPage } = await import('../LeaveWarPage')
    const { isLwOnScreen } = await import('../state/screen')
    const { container, rerender } = render(<LeaveWarPage active={true} />)
    expect(screen.queryByTestId('balances-page')).toBeNull()
    act(() => setBalancesUp(true))
    expect(screen.getByTestId('balances-page')).toBeTruthy()
    const host = container.querySelector<HTMLElement>('.lw-gridhost')!
    expect(host.hidden).toBe(true)
    expect(host.querySelector('.mx')).toBeTruthy()
    expect(isLwOnScreen()).toBe(false)
    act(() => setBalancesUp(false))
    expect(screen.queryByTestId('balances-page')).toBeNull()
    expect(host.hidden).toBe(false)
    expect(isLwOnScreen()).toBe(true)
    act(() => setBalancesUp(true))
    const calls: number[][] = []
    const was = window.scrollTo
    window.scrollTo = ((x: number, y: number) => { calls.push([x, y]) }) as any
    try {
      act(() => rerender(<LeaveWarPage active={false} />))
      expect(lwPage()).toBe('grid')
      expect(isLwOnScreen()).toBe(false)
      expect(calls).toEqual([])
    } finally { window.scrollTo = was }
  })
})

/* THE M5a WALK'S FAULTS (29 Oct 26 — the host's triage, `docs/handpass/parts/lw-m5a/walk-triage.md` "To fix, red-first").
   jsdom has no layout, so where a fault is one of measure the test stands in the browser's measures (a rect, a width) and
   pins what the page does with them; the browser tests (e2e/leavewar.spec.ts "M5a walk") prove the same on the built app. */
const R = (left: number, top: number, right: number, bottom: number) =>
  ({ left, top, right, bottom, width: right - left, height: bottom - top, x: left, y: top, toJSON: () => ({}) }) as DOMRect
const asPhone = () => {
  const was = window.matchMedia
  window.matchMedia = ((q: string) => ({ matches: /max-width:\s*(700|620|430)px/.test(q), media: q, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false })) as any
  return () => { window.matchMedia = was }
}
describe('the M5a walk\'s faults', () => {
  it('A-F1: an emptied box + Enter, or left, says "Type a figure" and keeps the old figure; Escape still puts it back silently', () => {
    render(<BalancesPage />)
    const was = lve('bane').app
    fireEvent.keyDown(typeIn('bal-LVE-bane', ''), { key: 'Enter' })
    expect(screen.getByTestId('bal-LVE-bane-err').textContent).toBe('Type a figure')
    expect(box('bal-LVE-bane').value).toBe(figWords(was))
    expect(lve('bane').app).toBe(was)
    fireEvent.blur(typeIn('bal-CCL-bane', '  '))
    expect(screen.getByTestId('bal-CCL-bane-err').textContent).toBe('Type a figure')
    fireEvent.keyDown(typeIn('bal-PL-bane', ''), { key: 'Escape' })
    fireEvent.blur(box('bal-PL-bane'))
    expect(screen.queryByTestId('bal-PL-bane-err')).toBeNull()
  })

  it('A-F3: a figure longer than its box has room for is drawn smaller to fit whole; one that fits keeps the box\'s letters', () => {
    /* the browser's measure stood in: 8px a letter plus 18 of padding, in a box 34 wide inside its padding */
    const sw = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollWidth')
    const cw = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth')
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, get(this: HTMLElement) { return this instanceof HTMLInputElement ? Math.max(52, this.value.length * 8 + 18) : 0 } })
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get(this: HTMLElement) { return this instanceof HTMLInputElement ? 52 : 0 } })
    try {
      render(<BalancesPage />)
      fireEvent.blur(typeIn('bal-LVE-bane', '-12.5'))
      expect(box('bal-LVE-bane').value).toBe('−12.5')
      const fs = parseFloat(box('bal-LVE-bane').style.fontSize)
      expect(fs).toBeGreaterThan(0)
      expect(fs).toBeLessThan(13.5)
      fireEvent.blur(typeIn('bal-LVE-bane', '15'))
      expect(box('bal-LVE-bane').style.fontSize).toBe('')
    } finally {
      if (sw) Object.defineProperty(HTMLElement.prototype, 'scrollWidth', sw)
      if (cw) Object.defineProperty(HTMLElement.prototype, 'clientWidth', cw)
    }
  })

  it('A-F4: the second heading line pins where the first one ends, so no strip of rows shows between them', () => {
    const oh = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get(this: HTMLElement) { return this.matches?.('tr.h1') ? 22 : 0 } })
    try {
      const { container } = render(<BalancesPage />)
      const h2 = [...container.querySelectorAll<HTMLElement>('tr.h2 th')]
      expect(h2.length).toBeGreaterThan(0)
      for (const th of h2) expect(th.style.top).toBe('22px')
      fireEvent.click(screen.getByTestId('bal-view-taken'))
      for (const th of container.querySelectorAll<HTMLElement>('tr.h2 th')) expect(th.style.top).toBe('22px')
    } finally { if (oh) Object.defineProperty(HTMLElement.prototype, 'offsetHeight', oh) }
  })

  it('A-F2: the desktop OIL figure is a plain table cell (the phone\'s flex box on the cell set its figures left of the heading)', () => {
    render(<BalancesPage />)
    const td = screen.getByTestId('bal-oil-bane').closest('td')!
    expect(td.className.split(/\s+/)).not.toContain('bp-oilc')
  })

  it('B-F2: a refusal\'s words are moved inside the sliding area when they would run off its left or right edge', () => {
    const back = asPhone()
    const spy = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      if (this.classList.contains('bp-err')) return R(-49, 300, 191, 340)
      if (this.classList.contains('bp-hs')) return R(0, 200, 402, 874)
      return R(0, 0, 0, 0)
    })
    try {
      render(<BalancesPage />)
      fireEvent.keyDown(typeIn('bal-LVE-bane', '17.3'), { key: 'Enter' })
      const err = screen.getByTestId('bal-LVE-bane-err')
      expect(err.textContent).toBe('Type a whole number or a half, like 17 or 17.5')
      expect(err.style.transform).toBe('translateX(53px)')
    } finally { spy.mockRestore(); back() }
  })

  it('B-F5: the page fills the screen under the tab row, measured from the page\'s top — a window scrolled when it opens does not make it taller', () => {
    const sy = Object.getOwnPropertyDescriptor(window, 'scrollY')
    Object.defineProperty(window, 'scrollY', { configurable: true, get: () => 120 })
    const spy = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      return this.matches('[data-testid="balances-page"]') ? R(0, 80, 1024, 80 + 2000) : R(0, 0, 0, 0)
    })
    try {
      render(<BalancesPage />)
      expect(screen.getByTestId('balances-page').style.height).toBe(`${window.innerHeight - 200}px`)
    } finally {
      spy.mockRestore()
      if (sy) Object.defineProperty(window, 'scrollY', sy); else delete (window as any).scrollY
    }
  })

  it('B-F4: a tapped box is brought into sight with its pending figure, clear of the names', async () => {
    const back = asPhone()
    let left = 0
    const spy = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      if (this.classList.contains('bp-hs')) return R(0, 200, 402, 874)
      if (this.classList.contains('bp-who')) return R(0, 400, 132, 450)
      if (this.classList.contains('bp-oc') && this.querySelector('[data-testid="bal-PL-bane"]')) return R(330 - left, 400, 420 - left, 450)
      return R(0, 0, 0, 0)
    })
    try {
      render(<BalancesPage />)
      const hs = screen.getByTestId('bal-scroll')
      Object.defineProperty(hs, 'scrollLeft', { configurable: true, get: () => left, set: (v: number) => { left = v } })
      act(() => { box('bal-PL-bane').focus() })
      await act(async () => { await new Promise(r => setTimeout(r, 40)) })
      expect(left).toBe(22)                     // its right edge, the pending figure's, 4 inside the screen's
    } finally { spy.mockRestore(); back() }
  })
})
