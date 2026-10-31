/* THE APPROVALS PAGE ITSELF (the overhaul's M4, 8.1–8.5) — the scenario designer's faults that live in the page's own rows
   (docs/handpass/parts/lw-m4/scenarios.md), each red before its fix:
   ★1 Approve → Undo → Redo: the line lights again ("Approved", a second tap sends it back), never "Already approved";
   ★8 two lines that join while the list is drawn (a day placed between them): ONE line, no greyed "No longer there";
   16 the admin's own placement is no "new" — "New" counts what OTHERS placed since he last looked;
   17 the slim bar's count is the page's own (the period on view), as the header says it;
   14 "Pick dates…" closes on a press outside it and on Escape (a click-open popup closes on a click outside it, 4 Sep 26). */
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { INPUTS } from '../engine/inputs'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { installGlobalUndo } from '../state/undo-wire'
import { globalUndo, globalRedo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { NOTICES } from '../state/notices'
import { noticeSeenLoad } from '../state/noticeseen'
import { absenceDoor, getState, initStore as lwInitStore, lwHistInit, recordsAt, setAbsenceDoor, setBidState, setBidStates, setCell, setPeople, setPostOut } from './state/store'
import { setMemberTodayForTests } from './engine'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync } from './sync'
import { ApprovalsPage, SlimBar } from './ui/ApprovalsPage'
import { rangeWords } from './ui/approvaldates'
import { DayListSheet } from './ui/DayList'
import { Matrix } from './ui/Matrix'
import { SelectSheet } from './ui/SelectSheet'
import { setApprMode } from './ui/lwnav'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const ISNAP = JSON.stringify(INPUTS)
const toast = HOOKS.toast
const reqs = (p: string, d: string) => recordsAt(p, d).filter((r: any) => r.kind === 'request') as any[]

const T = (h: number, day = 15): number => { const d = new Date(2026, 6, day, h, 0, 0); vi.setSystemTime(d); return d.getTime() }
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const saber = () => signInAs('ad', 'a')
const ranger = () => signInAs('us', 'us')

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
  saber()
})
afterEach(() => { HOOKS.toast = toast; setApprMode('off'); _resetTimeline(); resetSession(null) })

const MON = '2026-02-09', TUE = '2026-02-10', WED = '2026-02-11'
const linesOf = (p: string) => screen.queryAllByTestId(`appr-line-${p}`)

describe('the Approvals page’s rows', () => {
  it('★1 Approve → Undo → Redo: lit again, and a second tap still sends it back', () => {
    ranger(); expect(setCell('bane', TUE, 'LL')).toBe(true); saber()
    T(9)
    render(<ApprovalsPage shown={true} />)
    const line = () => linesOf('bane')[0]!
    fireEvent.click(within(line()).getByTestId('appr-approve'))
    expect(within(line()).getByTestId('appr-approve').textContent).toBe('Approved')
    act(() => { expect(globalUndo().ok).toBe(true) })
    expect(within(line()).getByTestId('appr-approve').textContent, 'pending again after the Undo').toBe('Approve')
    act(() => { expect(globalRedo().ok).toBe(true) })
    expect(linesOf('bane')).toHaveLength(1)
    expect(within(line()).queryByTestId('appr-why'), 'no "Already approved"').toBeNull()
    expect(within(line()).getByTestId('appr-approve').textContent).toBe('Approved')
    fireEvent.click(within(line()).getByTestId('appr-approve'))
    expect(within(line()).getByTestId('appr-approve').textContent, 'the second tap sends it back').toBe('Approve')
  })

  /* his D1428 (27 Oct 26 — "why cant i just tap an initial approved to refused if i change my mind"): a decided line keeps
     its other button pressable, as drawn (r22-3) — one tap changes his mind, either way */
  it('D1428 one tap on Refuse turns an approval into a refusal, and one on Approve turns it back', () => {
    ranger(); expect(setCell('bane', TUE, 'LL')).toBe(true); saber()
    render(<ApprovalsPage shown={true} />)
    const line = () => linesOf('bane')[0]!
    fireEvent.click(within(line()).getByTestId('appr-approve'))
    expect(within(line()).getByTestId('appr-approve').textContent).toBe('Approved')
    expect((within(line()).getByTestId('appr-refuse') as HTMLButtonElement).disabled, 'Refuse still pressable').toBe(false)
    fireEvent.click(within(line()).getByTestId('appr-refuse'))
    expect(within(line()).getByTestId('appr-refuse').textContent).toBe('Refused')
    expect(within(line()).getByTestId('appr-approve').textContent).toBe('Approve')
    expect(reqs('bane', TUE).map(r => r.state)).toEqual(['refused'])
    fireEvent.click(within(line()).getByTestId('appr-approve'))
    expect(within(line()).getByTestId('appr-approve').textContent).toBe('Approved')
    expect(reqs('bane', TUE)).toEqual([])
  })
  /* his D1430 (27 Oct 26, "all as recommended"): back to the drawing — a decided line's kind box shows the decision as the
     grid draws it, and a thin line stands between New and the dates; D1435: a decide button holds its longer word's room */
  it('D1430 a decided line\'s box is the grid\'s approved or refused box; a thin line stands between New and DATES', () => {
    ranger(); expect(setCell('bane', TUE, 'LL')).toBe(true); saber()
    render(<ApprovalsPage shown={true} />)
    const line = () => linesOf('bane')[0]!
    const box = () => within(line()).getByTestId('appr-box').className
    expect(box()).toMatch(/\bs-w\b/)
    fireEvent.click(within(line()).getByTestId('appr-approve'))
    expect(box()).toMatch(/\bs-a\b/)
    fireEvent.click(within(line()).getByTestId('appr-refuse'))
    expect(box()).toMatch(/\bs-r\b/)
    const row = screen.getByRole('group', { name: 'Which requests to show' })
    const kids = [...row.children]
    const vs = row.querySelector('.appr-vs')
    expect(vs, 'the divider is drawn').not.toBeNull()
    expect(kids.indexOf(vs!), 'between New and DATES').toBe(kids.indexOf(screen.getByTestId('appr-new')) + 1)
    expect(within(line()).getByTestId('appr-approve').querySelector('[data-long="Approved"]'), 'Approve holds "Approved"\'s room').not.toBeNull()
    expect(within(line()).getByTestId('appr-refuse').querySelector('[data-long="Refused"]'), 'Refuse holds "Refused"\'s room').not.toBeNull()
  })
  /* THE FIXES' M3 (the re-walk, walker A's F1 and F2): after Approve then one tap on Refuse (D1428), an Undo left the line
     lit "Refused" while the leave stood approved again, and two Undos then a Redo greyed it "Already approved by Saber" with
     both buttons off. A line shows what the record shows after every Undo and Redo (D1421's light follows the decision). */
  describe('Undo and Redo after a one-tap change of mind (M3)', () => {
    const lit = (line: HTMLElement) => {
      const ok = within(line).getByTestId('appr-approve'), no = within(line).getByTestId('appr-refuse')
      return { approve: ok.textContent, refuse: no.textContent, why: within(line).queryByTestId('appr-why')?.textContent ?? null,
        off: (ok as HTMLButtonElement).disabled || (no as HTMLButtonElement).disabled }
    }
    const approvedThenRefused = () => {
      ranger(); expect(setCell('bane', TUE, 'LL')).toBe(true); saber()
      T(9)
      render(<ApprovalsPage shown={true} />)
      fireEvent.click(within(linesOf('bane')[0]!).getByTestId('appr-approve'))
      fireEvent.click(within(linesOf('bane')[0]!).getByTestId('appr-refuse'))
      expect(lit(linesOf('bane')[0]!)).toMatchObject({ approve: 'Approve', refuse: 'Refused' })
    }
    const APPROVED = { approve: 'Approved', refuse: 'Refuse', why: null, off: false }
    const REFUSED = { approve: 'Approve', refuse: 'Refused', why: null, off: false }
    const PENDING = { approve: 'Approve', refuse: 'Refuse', why: null, off: false }

    it('Undo of the switch: lit "Approved", as the record now is', () => {
      approvedThenRefused()
      act(() => { expect(globalUndo().ok).toBe(true) })
      expect(reqs('bane', TUE), 'the leave stands approved again').toEqual([])
      expect(linesOf('bane')).toHaveLength(1)
      expect(lit(linesOf('bane')[0]!)).toEqual(APPROVED)
    })

    it('Undo, Undo, then Redo and Redo: pending, then lit "Approved", then lit "Refused" — never "Already approved"', () => {
      approvedThenRefused()
      act(() => { expect(globalUndo().ok).toBe(true) })
      act(() => { expect(globalUndo().ok).toBe(true) })
      expect(lit(linesOf('bane')[0]!)).toEqual(PENDING)
      act(() => { expect(globalRedo().ok).toBe(true) })
      expect(linesOf('bane')).toHaveLength(1)
      expect(lit(linesOf('bane')[0]!)).toEqual(APPROVED)
      act(() => { expect(globalRedo().ok).toBe(true) })
      expect(lit(linesOf('bane')[0]!)).toEqual(REFUSED)
    })

    it('the twin: Refuse then one tap on Approve, Undo — lit "Refused" again; Redo — lit "Approved"', () => {
      ranger(); expect(setCell('bane', TUE, 'LL')).toBe(true); saber()
      T(9)
      render(<ApprovalsPage shown={true} />)
      fireEvent.click(within(linesOf('bane')[0]!).getByTestId('appr-refuse'))
      fireEvent.click(within(linesOf('bane')[0]!).getByTestId('appr-approve'))
      expect(lit(linesOf('bane')[0]!)).toEqual(APPROVED)
      act(() => { expect(globalUndo().ok).toBe(true) })
      expect(lit(linesOf('bane')[0]!)).toEqual(REFUSED)
      act(() => { expect(globalRedo().ok).toBe(true) })
      expect(lit(linesOf('bane')[0]!)).toEqual(APPROVED)
    })

    /* THE FIXES' ROUND 2, R2-3 (the fix read's 3): one remembered decision a LIGHT dropped the first approval at the third tap
       — each approval is a new leave of its own — so two Undos left the line greyed "Already approved by Saber" while the
       record held that first approval */
    it('R2-3 Approve, Refuse, Approve, then Undo, Undo: lit "Approved"; Redo, Redo: "Refused" then "Approved"', () => {
      ranger(); expect(setCell('bane', TUE, 'LL')).toBe(true); saber()
      T(9)
      render(<ApprovalsPage shown={true} />)
      fireEvent.click(within(linesOf('bane')[0]!).getByTestId('appr-approve'))
      fireEvent.click(within(linesOf('bane')[0]!).getByTestId('appr-refuse'))
      fireEvent.click(within(linesOf('bane')[0]!).getByTestId('appr-approve'))
      expect(lit(linesOf('bane')[0]!)).toEqual(APPROVED)
      act(() => { expect(globalUndo().ok).toBe(true) })
      expect(lit(linesOf('bane')[0]!)).toEqual(REFUSED)
      act(() => { expect(globalUndo().ok).toBe(true) })
      expect(linesOf('bane')).toHaveLength(1)
      expect(lit(linesOf('bane')[0]!), 'the first approval stands again').toEqual(APPROVED)
      act(() => { expect(globalRedo().ok).toBe(true) })
      expect(lit(linesOf('bane')[0]!)).toEqual(REFUSED)
      act(() => { expect(globalRedo().ok).toBe(true) })
      expect(lit(linesOf('bane')[0]!)).toEqual(APPROVED)
    })

    it('the second tap undone: lit "Approved" again, and its Redo pending again', () => {
      ranger(); expect(setCell('bane', TUE, 'LL')).toBe(true); saber()
      T(9)
      render(<ApprovalsPage shown={true} />)
      fireEvent.click(within(linesOf('bane')[0]!).getByTestId('appr-approve'))
      fireEvent.click(within(linesOf('bane')[0]!).getByTestId('appr-approve'))
      expect(lit(linesOf('bane')[0]!)).toEqual(PENDING)
      act(() => { expect(globalUndo().ok).toBe(true) })
      expect(lit(linesOf('bane')[0]!)).toEqual(APPROVED)
      act(() => { expect(globalRedo().ok).toBe(true) })
      expect(linesOf('bane')).toHaveLength(1)
      expect(lit(linesOf('bane')[0]!)).toEqual(PENDING)
    })
  })

  /* THE FIXES' M7 (the Opus read's 4): a lit line was never asked again whether it still stood — approved here, then put
     back to a bid on the grid, it stayed lit "Approved" beside a second, pending copy of the same request. */
  describe('a lit line changed elsewhere (M7)', () => {
    it('approved here, put back to a bid on the grid: ONE line, pending again, in its place', () => {
      ranger(); expect(setCell('bane', TUE, 'LL')).toBe(true); saber()
      T(9)
      render(<ApprovalsPage shown={true} />)
      fireEvent.click(within(linesOf('bane')[0]!).getByTestId('appr-approve'))
      act(() => { setBidState('bane', TUE, 'pending') })      // the grid's lit Approve pressed again (D1330)
      expect(reqs('bane', TUE).map(r => r.state)).toEqual(['pending'])
      expect(linesOf('bane'), 'the request is shown once').toHaveLength(1)
      const l = linesOf('bane')[0]!
      expect(within(l).getByTestId('appr-approve').textContent).toBe('Approve')
      expect(within(l).queryByTestId('appr-why')).toBeNull()
    })
    it('refused here, its bid then deleted on the grid: the light goes and the line says so', () => {
      ranger(); expect(setCell('bane', TUE, 'LL')).toBe(true); saber()
      T(9)
      render(<ApprovalsPage shown={true} />)
      fireEvent.click(within(linesOf('bane')[0]!).getByTestId('appr-refuse'))
      act(() => { expect(setCell('bane', TUE, '')).toBe(true) })
      const l = linesOf('bane')[0]!
      expect(within(l).getByTestId('appr-refuse').textContent, 'no longer lit').toBe('Refuse')
      expect(within(l).getByTestId('appr-why').textContent).toBe('No longer there')
    })
  })

  it('★8 two lines that join while drawn are ONE line — no greyed "No longer there"', () => {
    ranger(); expect(setCell('bane', MON, 'LL')).toBe(true); expect(setCell('bane', WED, 'LL')).toBe(true); saber()
    T(9)
    render(<ApprovalsPage shown={true} />)
    expect(linesOf('bane')).toHaveLength(2)
    act(() => { ranger(); expect(setCell('bane', TUE, 'LL')).toBe(true); saber() })
    expect(linesOf('bane')).toHaveLength(1)
    expect(screen.queryAllByTestId('appr-why')).toEqual([])
  })

  it('16 what he placed himself is no "new"; what the member placed since he last looked is', () => {
    T(9)
    render(<ApprovalsPage shown={true} />)          // he opens it: "last looked" is now
    T(10)
    act(() => { expect(setCell('bane', TUE, 'LL')).toBe(true) })            // he places a pending bid on Ranger's row
    act(() => { ranger(); expect(setCell('bane', WED, 'OL')).toBe(true); saber() })
    expect(screen.getByTestId('appr-new').textContent).toContain('New 1')
  })

  /* his D1430 (the header, as drawn r22-2: "15 pending · 3 new since you last looked, Wed 7 Jan 16:40"): the "since" words
     follow the count of new ones — with nothing new they would have said the pending ones came since he last looked */
  it('D1430 the header names when he last looked beside the new count, and only there', () => {
    T(9); render(<ApprovalsPage shown={true} />).unmount()                     // his first look, 09:00
    T(10); act(() => { ranger(); expect(setCell('bane', TUE, 'LL')).toBe(true); saber() })
    T(11); const second = render(<ApprovalsPage shown={true} />)
    expect(screen.getByTestId('appr-sub').textContent).toMatch(/^\d+ pending · 1 new since you last looked, Wed 15 Jul 09:00$/)
    second.unmount()
    T(12); render(<ApprovalsPage shown={true} />)                              // nothing new since 11:00
    expect(screen.getByTestId('appr-sub').textContent).toMatch(/^\d+ pending$/)
  })

  /* the walk's small finds (27 Oct 26): "New 0" kept its cyan dot — a dot that says something new with nothing new; and one
     picked day read "13 Jan – 13 Jan" */
  it('"New 0" wears no dot; one picked day reads as one day', () => {
    render(<ApprovalsPage shown={true} />)
    expect(screen.getByTestId('appr-new').textContent).toContain('New 0')
    expect(screen.getByTestId('appr-new').querySelector('.appr-dot')!.classList.contains('none')).toBe(true)
    expect(rangeWords('2026-01-13', '2026-01-13')).toBe('13 Jan')
    expect(rangeWords('2026-01-13', '2026-01-15')).toBe('13 Jan – 15 Jan')
  })
  it('17 the slim bar says the page’s count — the period on view', () => {
    ranger(); expect(setCell('bane', TUE, 'LL')).toBe(true); saber()
    render(<><ApprovalsPage shown={false} /><SlimBar /></>)
    const sub = screen.getByTestId('appr-sub').textContent!
    const n = sub.match(/(\d+) pending/)![1]
    expect(screen.getByTestId('appr-slim').textContent).toContain(`${n} pending`)
  })

  /* THE BREAK TESTS (28 Oct 26, list lw-m4 #7, #8 — the red team's A4, his D1431): Approve all approves exactly what the list
     showed when it was pressed — the first tap only arms it, and a request coming in while it is armed disarms it, so the
     second tap never approves a line he did not read */
  it('A4 Approve all: the first tap only arms it; a request coming in disarms it; armed again, the second tap approves', () => {
    ranger(); expect(setCell('bane', MON, 'LL')).toBe(true); saber()
    render(<ApprovalsPage shown={true} />)
    const all = () => screen.getByTestId('appr-approve-all')
    const n0 = +all().textContent!.match(/^Approve all (\d+)$/)![1]!
    fireEvent.click(all())
    expect(all().textContent, 'armed').toBe(`Approve ${n0} — tap again`)
    expect(reqs('bane', MON).map(r => r.state), 'the first tap decides nothing').toEqual(['pending'])
    act(() => { ranger(); expect(setCell('bane', WED, 'OL')).toBe(true); saber() })
    expect(all().textContent, 'a new request disarms it').toBe(`Approve all ${n0 + 1}`)
    fireEvent.click(all())
    expect(reqs('bane', MON).concat(reqs('bane', WED)).map(r => r.state), 'that tap only armed it again').toEqual(['pending', 'pending'])
    fireEvent.click(all())
    expect(reqs('bane', MON).concat(reqs('bane', WED)), 'both approved').toEqual([])
  })
  /* list lw-m4 #52 (D1421): a decided line stays lit where it is "until he leaves Approvals or changes the dates" — a change of
     the dates starts the rows afresh */
  it('D1421 a lit line stays where it is until the dates change; then it leaves the list', () => {
    ranger(); expect(setCell('bane', TUE, 'LL')).toBe(true); saber()
    render(<ApprovalsPage shown={true} />)
    fireEvent.click(within(linesOf('bane')[0]!).getByTestId('appr-approve'))
    expect(linesOf('bane'), 'lit, in its place').toHaveLength(1)
    fireEvent.click(screen.getByTestId('appr-m-2026-02'))
    expect(linesOf('bane'), 'another choice of dates: the decided line leaves').toHaveLength(0)
    fireEvent.click(screen.getByTestId('appr-all'))
    expect(linesOf('bane'), 'and does not come back').toHaveLength(0)
  })
  /* list lw-m4 #62 (D1178): a request that carries a document shows the paperclip on its line; one with none shows none */
  it('D1178 a request with a document wears the paperclip; one without wears none', () => {
    ranger(); expect(setCell('bane', MON, 'LL', { docIds: ['doc-a'] })).toBe(true); expect(setCell('bane', WED, 'OL')).toBe(true); saber()
    render(<ApprovalsPage shown={true} />)
    const [mon, wed] = linesOf('bane')
    expect(within(mon!).getByTestId('appr-clip').getAttribute('aria-label')).toBe('View the document')
    expect(within(wed!).queryByTestId('appr-clip')).toBeNull()
  })

  /* (with D1444, 28 Oct 26) React warned that the month chips had no key — each chip is keyed by its month now */
  it('the month chips are keyed: React gives no missing-key warning', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      render(<ApprovalsPage shown={true} />)
      expect(err.mock.calls.map(c => String(c[0])).filter(m => /unique "key"/.test(m))).toEqual([])
    } finally { err.mockRestore() }
  })

  it('14 "Pick dates…" closes on a press outside it and on Escape', () => {
    render(<ApprovalsPage shown={true} />)
    fireEvent.click(screen.getByTestId('appr-pick'))
    expect(screen.queryByTestId('appr-range')).not.toBeNull()
    fireEvent.pointerDown(document.body)
    expect(screen.queryByTestId('appr-range'), 'a press outside').toBeNull()
    fireEvent.click(screen.getByTestId('appr-pick'))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByTestId('appr-range'), 'Escape').toBeNull()
  })

  /* THE FIXES' ROUND 2, R2-1 (the fix read's 1): the click a press outside the open calendar makes was taken only within
     0.8 s of the PRESS — so a press held about a second on a line's Approve on a phone (an iPhone fires the click at the
     lift) closed the calendar, moved the list, and at the lift approved the line then under the finger. Taken from the
     press's own lift now. (The click is fired where the moved list put another line — what the phone does.) */
  it('R2-1 a press held a second outside the open calendar still decides no line at its lift', async () => {
    ranger(); expect(setCell('bane', MON, 'LL')).toBe(true); expect(setCell('bane', WED, 'OL')).toBe(true); saber()
    render(<ApprovalsPage shown={true} />)
    expect(linesOf('bane')).toHaveLength(2)
    fireEvent.click(screen.getByTestId('appr-pick'))
    const [first, second] = linesOf('bane')
    fireEvent.pointerDown(within(first!).getByTestId('appr-approve'))
    expect(screen.queryByTestId('appr-range'), 'the press closes the calendar').toBeNull()
    await act(async () => { await new Promise(r => setTimeout(r, 1000)) })
    fireEvent.pointerUp(within(first!).getByTestId('appr-approve'))
    fireEvent.click(within(second!).getByTestId('appr-approve'))
    expect(document.querySelectorAll('.appr-ok.lit, .appr-no.lit'), 'no line decided').toHaveLength(0)
    expect(reqs('bane', MON).concat(reqs('bane', WED)).map(r => r.state)).toEqual(['pending', 'pending'])
  })

  /* THE FIXES' ROUND 3, R3-1 (the round-2 read's 1): by touch, a tap on the EMPTY CARD beside or under the open calendar
     closed it, the list moved up, and the lift's click landed on a line's Approve — which the card contains and the card
     never moves — so round 2 let it act: M4 again. The press and the click are compared by the control each is on. */
  it('R3-1 a tap on the empty card beside the open calendar, its click landing on a line’s Approve, decides nothing', () => {
    ranger(); expect(setCell('bane', MON, 'LL')).toBe(true); saber()
    render(<ApprovalsPage shown={true} />)
    fireEvent.click(screen.getByTestId('appr-pick'))
    const card = document.querySelector('.appr-card')!
    fireEvent.pointerDown(card); fireEvent.pointerUp(card)
    fireEvent.click(within(linesOf('bane')[0]!).getByTestId('appr-approve'))
    expect(document.querySelectorAll('.appr-ok.lit, .appr-no.lit'), 'no line decided').toHaveLength(0)
    expect(reqs('bane', MON).map(r => r.state)).toEqual(['pending'])
  })
  /* R3-2: a press begun on a button's icon and lifted on the button's edge was swallowed (the bell, Undo) */
  it('R3-2 a press begun on an outside button’s icon and ending on the button does the button’s job, once', () => {
    let pressed = 0
    render(<><button type="button" data-testid="bellish" onClick={() => { pressed++ }}><span data-testid="bellicon">🔔</span></button><ApprovalsPage shown={true} /></>)
    fireEvent.click(screen.getByTestId('appr-pick'))
    fireEvent.pointerDown(screen.getByTestId('bellicon')); fireEvent.pointerUp(screen.getByTestId('bellish'))
    fireEvent.click(screen.getByTestId('bellish'))
    expect(screen.queryByTestId('appr-range'), 'the calendar closed').toBeNull()
    expect(pressed).toBe(1)
  })

  /* R2-2 (the fix read's 2): every first press outside the open calendar was swallowed, also where nothing moved — the top
     bar's Undo, the bell, the Grid tab needed a second press. Only a click that lands somewhere other than what was
     pressed, or on a thing that moved, is taken. */
  it('R2-2 a press outside the open calendar on something that did not move closes it AND does its job', () => {
    let pressed = 0
    render(<><button type="button" data-testid="elsewhere" onClick={() => { pressed++ }}>Undo</button><ApprovalsPage shown={true} /></>)
    fireEvent.click(screen.getByTestId('appr-pick'))
    const b = screen.getByTestId('elsewhere')
    fireEvent.pointerDown(b); fireEvent.pointerUp(b); fireEvent.click(b)
    expect(screen.queryByTestId('appr-range'), 'the calendar closed').toBeNull()
    expect(pressed, 'the press did its job').toBe(1)
  })
})

describe('the day’s list (a day with two entries) says who placed each (the scenario designer’s 18; D1315)', () => {
  /* THE FIXES' M5 (the re-walk's A-F3 = B-F2): the day's window refused Approve on a posted-out man's leave saying
     "Couldn’t approve — something else is on that time" — untrue; Approvals said the posting. One reason in every door. */
  it('M5 the day’s window gives Approvals’ posting-out reason', () => {
    ranger(); expect(setCell('bane', TUE, 'LL')).toBe(true); saber()
    setMemberTodayForTests('2026-01-20')
    try {
      expect(setPostOut('bane', MON, 'none')).toBe(true)
      const st = getState()
      const id = reqs('bane', TUE)[0]!.id
      render(<DayListSheet personId="bane" callsign="Ranger" date={TUE} view={st.views['bane']![TUE]!} role="admin" viewer="stiff" period={st.period} onClose={() => {}} />)
      fireEvent.click(screen.getByTestId(`dl-approve-${id}`))
      expect(screen.getByText('He posts out on 9 Feb: refuse or delete it')).toBeTruthy()
      expect(screen.queryByText(/something else is on that time/)).toBeNull()
      expect(reqs('bane', TUE)[0]!.state).toBe('pending')
    } finally { setMemberTodayForTests(null) }
  })

  /* THE FIXES' ROUND 2, R2-4: "Approve what I enter" — the admin's default in both bid windows — kept a day after a man's
     posting-out date pending with a guessed reason ("a locked week, or leave or a medical already there"); R2-5: the drag
     window's note put the rules' reason against every skipped day, an empty one too. */
  describe('the bid windows name the posting-out reason (R2-4, R2-5)', () => {
    const THU = '2026-02-12', FRI = '2026-02-13'
    const sel = (dates: string[]) => ({ people: ['bane'], from: dates[0]!, to: dates[dates.length - 1]!, cells: dates.map(date => ({ personId: 'bane', date })) }) as any
    const noop = () => {}
    beforeEach(() => { try { localStorage.clear() } catch { /* none */ } setMemberTodayForTests('2026-01-20') })
    afterEach(() => { setMemberTodayForTests(null) })
    /* (the grid draws his days from the posting-out date posted out, and a tap there opens the day's list, not the window with
       the leave buttons — so the one-day window meets the door's refusal by a range across the date; here the door is asked
       for that refusal on a day the window can open, to pin that the window prints whatever reason the door gives) */
    it('R2-4 the one-day window, "Approve what I enter" refused by the door: kept pending with the door’s reason', () => {
      const door = absenceDoor()!
      const why = 'He posts out on 11 Feb: refuse or delete it'
      setAbsenceDoor({ ...door, approve: items => ({ done: 0, skipped: items.length, why: items.map(() => why) }) })
      try {
        render(<Matrix />)
        fireEvent.click(screen.getByTestId(`cell-bane-${THU}`))
        expect(screen.getByTestId('bid-approve-tick').getAttribute('aria-checked')).toBe('true')
        fireEvent.click(screen.getByTestId('bid-LL'))
        fireEvent.click(screen.getByTestId('bid-LL'))          // his balance goes below zero: the same leave again goes ahead
        expect(reqs('bane', THU).map(r => r.state)).toEqual(['pending'])
        expect(screen.getByText(/kept pending — He posts out on 11 Feb: refuse or delete it/)).toBeTruthy()
        expect(screen.queryByText(/a locked week, or leave or a medical already there/)).toBeNull()
      } finally { setAbsenceDoor(door) }
    })
    it('R2-4 the drag window, "Approve what I enter" over his days after the date: kept pending with the door’s reason', () => {
      expect(setPostOut('bane', WED, 'none')).toBe(true)
      render(<SelectSheet sel={sel([THU, FRI])} people={() => 'Ranger'} role="admin" canDecide onDone={noop} onMove={noop} onClose={noop} />)
      expect(screen.getByTestId('sel-approve-tick').getAttribute('aria-checked')).toBe('true')
      fireEvent.click(screen.getByTestId('sel-LL'))
      expect(screen.getByTestId('sel-note').textContent).toContain('kept pending — He posts out on 11 Feb: refuse or delete it')
      expect(screen.getByTestId('sel-note').textContent).not.toContain('a locked week')
    })
    /* ROUND 3, R3-3: a Refuse the rules stopped was counted "not approved" — he asked for no approval */
    it('R3-3 a Refuse the rules stop is counted "not changed"', () => {
      ranger(); expect(setCell('bane', TUE, 'LL')).toBe(true); saber()
      expect(setBidStates([{ personId: 'bane', date: TUE }], 'approved').decided).toBe(1)
      const door = absenceDoor()!
      setAbsenceDoor({ ...door, decideApproved: items => ({ done: 0, skipped: items.length, why: items.map(() => 'Tue 10 Feb is on a locked week — not changed') }) })
      try {
        render(<SelectSheet sel={sel([TUE])} people={() => 'Ranger'} role="admin" canDecide onDone={noop} onMove={noop} onClose={noop} />)
        fireEvent.click(screen.getByTestId('sel-refuse'))
        expect(screen.getByTestId('sel-note').textContent).toBe('1 not changed: Tue 10 Feb is on a locked week — not changed.')
      } finally { setAbsenceDoor(door) }
    })
    /* ROUND 3, R3-4: several reasons ran together, and over several men "He" named nobody */
    it('R3-4 a two-man drag names each man before his reason, the reasons apart', () => {
      for (const p of ['bane', 'rocky']) expect(setCell(p, THU, 'LL')).toBe(true)
      expect(setPostOut('bane', WED, 'none')).toBe(true)
      expect(setPostOut('rocky', THU, 'none')).toBe(true)
      const two = { people: ['bane', 'rocky'], from: THU, to: FRI, cells: ['bane', 'rocky'].flatMap(p => [THU, FRI].map(date => ({ personId: p, date }))) } as any
      render(<SelectSheet sel={two} people={id => (id === 'bane' ? 'Ranger' : 'Rocky')} role="admin" canDecide onDone={noop} onMove={noop} onClose={noop} />)
      fireEvent.click(screen.getByTestId('sel-approve'))
      const note = screen.getByTestId('sel-note').textContent!
      expect(note).toContain('Ranger: He posts out on 11 Feb: refuse or delete it. Rocky: He posts out on 12 Feb: refuse or delete it.')
    })
    it('R2-5 the drag window counts the days the rules refused apart from a day with nothing to decide', () => {
      expect(setCell('bane', TUE, 'LL')).toBe(true); expect(setCell('bane', THU, 'LL')).toBe(true)
      expect(setPostOut('bane', WED, 'none')).toBe(true)
      render(<SelectSheet sel={sel([TUE, WED, THU, FRI].filter(d => d !== WED))} people={() => 'Ranger'} role="admin" canDecide onDone={noop} onMove={noop} onClose={noop} />)
      fireEvent.click(screen.getByTestId('sel-approve'))
      expect(screen.getByTestId('sel-note').textContent).toBe('1 decided. 1 not approved: He posts out on 11 Feb: refuse or delete it. 1 skipped (no bid, or Raptor-owned).')
    })
  })

  it('one "Placed" line under each entry', () => {
    ranger(); expect(setCell('bane', TUE, 'LL*')).toBe(true); saber()
    T(9); expect(setCell('bane', TUE, '*OL')).toBe(true)
    const st = getState()
    render(<DayListSheet personId="bane" callsign="Ranger" date={TUE} view={st.views['bane']![TUE]!} role="admin" viewer="stiff" period={st.period} onClose={() => {}} />)
    const placed = screen.getAllByTestId(/^dl-placed-/).map(x => x.textContent)
    expect(placed).toHaveLength(2)
    expect(placed.some(t => /Placed Ranger/.test(t!))).toBe(true)
    expect(placed.some(t => /Placed Saber/.test(t!))).toBe(true)
  })
})
