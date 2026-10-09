// @vitest-environment jsdom
/* THE INPUTS CALENDAR'S SETTINGS — behind its gear (the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md
   §3.6 "The gear: Days · Late cut-off (Inputs' own)", §3.9, §3.13 "the switch").

   Owner, D639 (7 Oct 26): the late cut-off is "set behind each calendar's own settings gear — the SANS calendar and the
   Inputs calendar each have their own — and the Logic page lists both"; one setting, two ways in. D628: a number of
   days, or a weekday of a number of weeks before. D654 / D655: members may file duties and commitments for other
   people "for now" — one switch puts it back to admins only. D635: the icon is the app's own gear. D641: the window
   drags and does not block the page. D675: the door to the day-types window reads "Calendar…".

   A window on the shell, admins only. Nothing is saved until Save. Save writes only what changed — the cut-off through
   the commit the Logic page uses (state/cutoff.ts, the INPUTS set), the switch by its own command
   (state/memberfile.ts) — each ONE Undo step. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { storeBackend } from '../engine/hooks'
import { VCONF, rulesResetMem } from '../engine/rules'
import { initStore as raptorInitStore, notify } from '../state/store'
import { DEFAULT_ME, setMe, setSession } from '../state/auth'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { globalUndo } from '../undo'
import { commandStream } from '../command'
import { membersFileOn } from '../state/perms'
import { getCut } from '../state/cutoff'
import { setCalMonth } from '../state/view'
import { initStore as lwInitStore, setRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { DAYSWIN, INPSET, POPS_RESET, setDaysWin, setInpSet } from './pops'
import { _resetFloatWins } from './FloatWindow'
import { InputsSettings } from './InputsSettings'

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
afterEach(() => { cleanup(); _resetFloatWins(); setInpSet(false); setDaysWin(null); setSession(null); setMe(DEFAULT_ME); rulesResetMem(); storeBackend.impl = null; _resetTimeline(); setCalMonth(null) })

const t = (id: string) => screen.getByTestId(id)
const q = (id: string) => screen.queryByTestId(id)
const open = () => act(() => { setInpSet(true); notify() })
const type = (id: string, v: string) => fireEvent.change(t(id), { target: { value: v } })
const steps = () => commandStream().length
const sansSet = () => [VCONF.sansLead, VCONF.sansCutMode, VCONF.sansCutWd, VCONF.sansCutWeeks]

describe('the window', () => {
  it('is closed until asked for; it is a window that does not take the page away; ✕ closes it', () => {
    render(<InputsSettings />)
    expect(q('win-inputsset')).toBeNull()
    open()
    expect(t('win-inputsset').getAttribute('aria-modal')).toBe('false')
    expect(t('win-inputsset').getAttribute('aria-label')).toBe('Inputs calendar settings')
    fireEvent.click(t('win-inputsset-x'))
    expect(q('win-inputsset')).toBeNull(); expect(INPSET).toBe(false)
  })
  it('is an admin’s: a member who somehow has it asked for sees nothing, and it is not left asked for', () => {
    render(<InputsSettings />)
    setSession({ user: 'us', role: 'member' })
    open()
    expect(q('win-inputsset')).toBeNull(); expect(INPSET).toBe(false)
  })
  it('a sign-out closes it (it is in the list of windows a new sitting starts without)', () => {
    expect(POPS_RESET.some(p => p.name === 'INPSET')).toBe(true)
  })
  it('"Calendar…" opens the day-types window on the month the calendar is showing (D675)', () => {
    render(<InputsSettings />); open()
    expect(t('iset-days').textContent).toBe('Calendar…')
    fireEvent.click(t('iset-days'))
    expect(DAYSWIN).toBe('2026-10-01')
  })
})

describe('the late cut-off for inputs (D628, D639)', () => {
  it('starts as the squadron runs it today — 14 days before the week — and says what that means for a week ahead', () => {
    render(<InputsSettings />); open()
    expect(t('iset-mode-days').getAttribute('aria-pressed')).toBe('true')
    expect((t('iset-lead') as HTMLInputElement).value).toBe('14')
    expect(t('iset-example').textContent).toMatch(/^For the week of \w{3} \d{1,2} \w{3}, inputs are due by the end of \w{3} \d{1,2} \w{3}\.$/)
  })
  it('a weekday of a number of weeks before: the worked date follows the draft, and Save writes it as ONE step that Undo takes back', () => {
    render(<InputsSettings />); open()
    const was = t('iset-example').textContent
    fireEvent.click(t('iset-mode-wd'))
    fireEvent.change(t('iset-wd'), { target: { value: '2' } }); fireEvent.change(t('iset-weeks'), { target: { value: '3' } })
    expect(t('iset-example').textContent, 'the worked date moves before anything is saved').not.toBe(was)
    expect(getCut('inputs').mode, 'nothing is saved while he chooses').toBe(0)
    const before = steps(), sans = sansSet()
    fireEvent.click(t('iset-save'))
    expect(getCut('inputs')).toEqual({ mode: 1, lead: 14, wd: 2, weeks: 3 })
    expect(steps()).toBe(before + 1)
    expect(sansSet(), 'the SANS calendar’s own cut-off is not touched').toEqual(sans)
    expect(q('win-inputsset')).toBeNull()
    act(() => { globalUndo() })
    expect(getCut('inputs').mode).toBe(0)
  })
  it('a number of days: saved; a figure that is not a whole number in range is refused in words, nothing saved, the window stays', () => {
    render(<InputsSettings />); open()
    type('iset-lead', '21')
    fireEvent.click(t('iset-save'))
    expect(VCONF.inputLead).toBe(21)
    open()
    for (const bad of ['', 'x', '2.5', '999']) {
      type('iset-lead', bad)
      const before = steps()
      fireEvent.click(t('iset-save'))
      expect(t('iset-err').textContent, bad).toMatch(/whole number from 0 to 60/)
      expect(VCONF.inputLead).toBe(21); expect(steps()).toBe(before); expect(q('win-inputsset')).toBeTruthy()
    }
  })
  it('Cancel, the ✕ and Escape throw the draft away', () => {
    render(<InputsSettings />); open()
    type('iset-lead', '30'); fireEvent.click(t('iset-cancel'))
    expect(VCONF.inputLead).toBe(14); expect(q('win-inputsset')).toBeNull()
    open()
    expect((t('iset-lead') as HTMLInputElement).value, 'opened again, it shows what is set — not the abandoned draft').toBe('14')
  })
})

describe('members filing for other people (D654, D655)', () => {
  it('the switch starts ON; turned off and saved it is one step, and Undo turns it back on', () => {
    render(<InputsSettings />); open()
    const sw = t('iset-memberfile') as HTMLInputElement
    expect(sw.checked).toBe(true); expect(membersFileOn()).toBe(true)
    fireEvent.click(sw)
    expect(membersFileOn(), 'nothing is saved until Save').toBe(true)
    const before = steps()
    fireEvent.click(t('iset-save'))
    expect(membersFileOn()).toBe(false); expect(steps()).toBe(before + 1)
    act(() => { globalUndo() })
    expect(membersFileOn()).toBe(true)
  })
  it('it says in words what the switch allows and what it never does', () => {
    render(<InputsSettings />); open()
    expect(t('win-inputsset').textContent).toContain('Members may file duties and commitments for other people')
    expect(t('win-inputsset').textContent).toMatch(/never leave, medical or SANS availability/i)
  })
  it('both changed in one Save are two steps — one each, so each can be taken back alone', () => {
    render(<InputsSettings />); open()
    type('iset-lead', '10'); fireEvent.click(t('iset-memberfile'))
    const before = steps()
    fireEvent.click(t('iset-save'))
    expect(steps()).toBe(before + 2); expect(VCONF.inputLead).toBe(10); expect(membersFileOn()).toBe(false)
  })
  it('a bad cut-off saves NEITHER — the switch is not left half-saved', () => {
    render(<InputsSettings />); open()
    type('iset-lead', 'x'); fireEvent.click(t('iset-memberfile'))
    const before = steps()
    fireEvent.click(t('iset-save'))
    expect(membersFileOn()).toBe(true); expect(steps()).toBe(before); expect(q('iset-err')).toBeTruthy()
  })
  it('Save with nothing changed writes nothing and closes', () => {
    render(<InputsSettings />); open()
    const before = steps()
    fireEvent.click(t('iset-save'))
    expect(steps()).toBe(before); expect(q('win-inputsset')).toBeNull()
  })
})
