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
import { getState, initStore as lwInitStore, lwHistInit, recordsAt, setCell, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync } from './sync'
import { ApprovalsPage, SlimBar, rangeWords } from './ui/ApprovalsPage'
import { DayListSheet } from './ui/DayList'
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
})

describe('the day’s list (a day with two entries) says who placed each (the scenario designer’s 18; D1315)', () => {
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
