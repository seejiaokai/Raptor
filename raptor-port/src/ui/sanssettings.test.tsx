// @vitest-environment jsdom
/* THE SANS CALENDAR'S SETTINGS — behind its gear (the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md
   §3.5, §3.9; owner D618: "allow the admin to click on a setting icon at the top of the calendar to set the yellow amber
   and red for the calendar to show globally"; D628 / D639: the late cut-off is a number of days OR a weekday of a number
   of weeks before, set behind each calendar's own gear; D635: the icon is the app's own gear, never a sun; D641: the
   window drags and does not block the page; D675: the door to the day-types window reads "Calendar…").

   A window on the shell, admins only. Nothing is saved until Save: Cancel, ✕ and Escape throw the draft away. Save
   writes only what changed — the three colours through their own command (state/flyplan.ts saveTones), the cut-off
   through the commit the Logic page uses (state/cutoff.ts) — each ONE Undo step. It replaced the first calendar's
   two-figure "Colour settings" dropdown, whose four tests went with it (ui/inputs-calendar-flow.test.tsx says so). */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { storeBackend } from '../engine/hooks'
import { VCONF, RULE_STD, rulesResetMem, rulesSave } from '../engine/rules'
import { cutRuleText } from '../engine/inputs'
import { initStore as raptorInitStore, notify } from '../state/store'
import { DEFAULT_ME, setMe, setSession } from '../state/auth'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { globalUndo } from '../undo'
import { commandStream } from '../command'
import { getTones } from '../state/flyplan'
import { CURPAGE, setCalMonth, setPage } from '../state/view'
import { initStore as lwInitStore, setRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { DAYSWIN, SANSSET, POPS_RESET, setDaysWin, setSansSet } from './pops'
import { _resetFloatWins } from './FloatWindow'
import { SansSettings } from './SansSettings'

const mem = new Map<string, string>()
beforeEach(() => {
  mem.clear()
  storeBackend.impl = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { if (v === 'null') mem.delete(k); else mem.set(k, v) }, keys: () => [...mem.keys()] } as any
  rulesResetMem()
  raptorInitStore()
  setSession({ user: 'admin-test', role: 'admin' })
  _resetTimeline(); installGlobalUndo()
  lwInitStore(memoryBackend()); setRole('admin')
  setCalMonth({ y: 2026, m: 10 })
})
afterEach(() => { cleanup(); _resetFloatWins(); setSansSet(false); setDaysWin(null); setSession(null); setMe(DEFAULT_ME); rulesResetMem(); storeBackend.impl = null; _resetTimeline(); setCalMonth(null) })

const t = (id: string) => screen.getByTestId(id)
const q = (id: string) => screen.queryByTestId(id)
const open = () => act(() => { setSansSet(true); notify() })
const type = (id: string, v: string) => fireEvent.change(t(id), { target: { value: v } })
const val = (id: string) => (t(id) as HTMLInputElement).value
const steps = () => commandStream().length

describe('the window', () => {
  it('is closed until asked for; it is a window that does not take the page away; ✕ closes it', () => {
    render(<SansSettings />)
    expect(q('win-sansset')).toBeNull()
    open()
    expect(t('win-sansset').getAttribute('aria-modal')).toBe('false')
    expect(t('win-sansset').getAttribute('aria-label')).toBe('SANS calendar settings')
    fireEvent.click(t('win-sansset-x'))
    expect(q('win-sansset')).toBeNull(); expect(SANSSET).toBe(false)
  })
  it('is an admin’s: a member who somehow has it asked for sees nothing, and it is not left asked for', () => {
    render(<SansSettings />)
    setSession({ user: 'us', role: 'member' })
    open()
    expect(q('win-sansset')).toBeNull(); expect(SANSSET).toBe(false)
  })
  it('a sign-out closes it (it is in the list of windows a new sitting starts without)', () => {
    expect(POPS_RESET.some(p => p.name === 'SANSSET')).toBe(true)
  })
  it('"Calendar…" opens the day-types window on the month the calendar is showing (D675)', () => {
    render(<SansSettings />); open()
    expect(t('sset-days').textContent).toBe('Calendar…')
    fireEvent.click(t('sset-days'))
    expect(DAYSWIN).toBe('2026-10-01')
  })
})

describe('the three day colours (D618)', () => {
  it('shows the figures as they are set, and Save writes them as ONE step that Undo takes back', () => {
    render(<SansSettings />); open()
    expect([val('sset-yellow'), val('sset-amber'), val('sset-red')]).toEqual(['1', '3', '5'])
    type('sset-yellow', '2'); type('sset-amber', '4'); type('sset-red', '9')
    expect(getTones()).toEqual({ yellowFrom: 1, amberFrom: 3, redFrom: 5 })      // nothing is saved while he types
    const before = steps()
    fireEvent.click(t('sset-save'))
    expect(getTones()).toEqual({ yellowFrom: 2, amberFrom: 4, redFrom: 9 })
    expect(steps()).toBe(before + 1)
    expect(q('win-sansset')).toBeNull()                                           // Save finishes the window
    act(() => { globalUndo() })
    expect(getTones()).toEqual({ yellowFrom: 1, amberFrom: 3, redFrom: 5 })
  })
  it('refuses figures that are not each above the last, says why, saves nothing and stays open', () => {
    render(<SansSettings />); open()
    type('sset-amber', '1')
    const before = steps()
    fireEvent.click(t('sset-save'))
    expect(t('sset-err').textContent).toMatch(/each above the last/)
    expect(getTones()).toEqual({ yellowFrom: 1, amberFrom: 3, redFrom: 5 }); expect(steps()).toBe(before)
    expect(q('win-sansset')).toBeTruthy()
    type('sset-amber', 'x'); fireEvent.click(t('sset-save'))
    expect(t('sset-err')).toBeTruthy(); expect(steps()).toBe(before)
  })
  it('Cancel, ✕ and Escape throw the draft away; opened again it shows what is saved', () => {
    render(<SansSettings />)
    for (const leave of [() => fireEvent.click(t('sset-cancel')), () => fireEvent.click(t('win-sansset-x')), () => fireEvent.keyDown(t('sset-red'), { key: 'Escape' })]) {
      open(); type('sset-red', '9'); leave()
      expect(q('win-sansset')).toBeNull(); expect(getTones().redFrom).toBe(5)
      open(); expect(val('sset-red')).toBe('5'); fireEvent.click(t('sset-cancel'))
    }
  })
  it('Save with nothing changed writes nothing', () => {
    render(<SansSettings />); open()
    const before = steps()
    fireEvent.click(t('sset-save'))
    expect(steps()).toBe(before); expect(q('win-sansset')).toBeNull()
  })
})

describe('the SANS late cut-off (D628, D639)', () => {
  it('opens on the rule as set — the Wednesday two weeks before — and shows a worked date for it', () => {
    render(<SansSettings />); open()
    expect(t('sset-mode-wd').getAttribute('aria-pressed')).toBe('true')
    expect(val('sset-wd')).toBe('2'); expect(val('sset-weeks')).toBe('2')
    expect(q('sset-lead')).toBeNull()
    /* a week's Monday less two weeks, plus two days: the Wednesday */
    expect(t('sset-example').textContent).toMatch(/^For the week of Mon \d+ \w{3}, commitments are due by the end of Wed \d+ \w{3}\.$/)
  })
  it('a weekday of a number of weeks before: saved as one step, and "How this works" will say it', () => {
    render(<SansSettings />); open()
    type('sset-wd', '4'); type('sset-weeks', '1')
    expect(t('sset-example').textContent).toMatch(/by the end of Fri /)
    expect(VCONF.sansCutWd).toBe(2)                                               // not yet
    const before = steps()
    fireEvent.click(t('sset-save'))
    expect([VCONF.sansCutMode, VCONF.sansCutWd, VCONF.sansCutWeeks]).toEqual([1, 4, 1])
    expect(cutRuleText('sans')).toBe('the Friday of the week before')
    expect(steps()).toBe(before + 1)
    act(() => { globalUndo() })
    expect([VCONF.sansCutMode, VCONF.sansCutWd, VCONF.sansCutWeeks]).toEqual([1, 2, 2])
  })
  it('a number of days before the week starts', () => {
    render(<SansSettings />); open()
    fireEvent.click(t('sset-mode-days'))
    expect(q('sset-wd')).toBeNull()
    type('sset-lead', '10')
    expect(t('sset-example').textContent).toMatch(/due by the end of \w{3} \d+ \w{3}\.$/)
    fireEvent.click(t('sset-save'))
    expect([VCONF.sansCutMode, VCONF.sansLead]).toEqual([0, 10])
    expect(cutRuleText('sans')).toBe('10 days before the week starts')
  })
  it('a figure out of range is refused in words and nothing is saved', () => {
    render(<SansSettings />); open()
    fireEvent.click(t('sset-mode-days')); type('sset-lead', '99')
    const before = steps()
    fireEvent.click(t('sset-save'))
    expect(t('sset-err').textContent).toMatch(/0 to 60/)
    expect(VCONF.sansCutMode).toBe(1); expect(steps()).toBe(before)
  })
  it('never touches the Inputs calendar’s own cut-off', () => {
    render(<SansSettings />); open()
    const inputs = [VCONF.inputLead, VCONF.inputCutMode, VCONF.inputCutWd, VCONF.inputCutWeeks]
    fireEvent.click(t('sset-mode-days')); type('sset-lead', '7'); fireEvent.click(t('sset-save'))
    expect([VCONF.inputLead, VCONF.inputCutMode, VCONF.inputCutWd, VCONF.inputCutWeeks]).toEqual(inputs)
    expect(RULE_STD.v.inputLead).toBe(inputs[0])
  })
  it('colours and cut-off changed together are both saved, each its own step', () => {
    render(<SansSettings />); open()
    type('sset-red', '7'); type('sset-weeks', '3')
    const before = steps()
    fireEvent.click(t('sset-save'))
    expect(getTones().redFrom).toBe(7); expect(VCONF.sansCutWeeks).toBe(3)
    expect(steps()).toBe(before + 2)
  })
})

/* WHERE UNDO LEAVES HIM (owner D672: Undo leaves the screen where it is when what it changes is already in view). A late
   cut-off is set behind a calendar's own gear AND listed on the Logic page (D639) — so the Inputs page shows it as the
   Logic page does. Any other rule is the Logic page's alone. */
describe('Undo of a cut-off', () => {
  const change = () => { open(); type('sset-weeks', '3'); fireEvent.click(t('sset-save')) }
  it('pressed on the Inputs page leaves him there; pressed anywhere else it lands on Logic, as every rule’s does', () => {
    render(<SansSettings />)
    setPage('inputs'); change()
    act(() => { globalUndo() })
    expect(VCONF.sansCutWeeks).toBe(2); expect(CURPAGE).toBe('inputs')
    setPage('inputs'); change(); setPage('quals')
    act(() => { globalUndo() })
    expect(VCONF.sansCutWeeks).toBe(2); expect(CURPAGE).toBe('logic')
  })
  it('a rule that is not a cut-off still lands on Logic from the Inputs page', () => {
    render(<SansSettings />)
    setPage('inputs')
    act(() => { VCONF.crewRest = VCONF.crewRest + 60; rulesSave() })
    act(() => { globalUndo() })
    expect(VCONF.crewRest).toBe(RULE_STD.v.crewRest); expect(CURPAGE).toBe('logic')
  })
})
