// @vitest-environment jsdom
/* ADMIN → DATA'S TWO CLEARING FORMS WITH TWO SQUADRONS (helper "left2" of the multi-squadron reshape build, 21 Nov 26 —
   the earlier helper "left"'s findings, his probe measured). The form (ui/AdminPage.tsx ClearControl) counts on its first
   tap and clears on its second; what it clears is the squadron in view's — its planning calendar ("Clear old clutter…",
   ui/inputedit.tsx clearHistoryData) or its change history ("Clear edit history…", clearEditHistory).
   Two faults, each red first on 92cad1c11 (the tip of claude/multi-sqn-b1-107 when helper "left2" began):
   (1) the armed count survived a change of squadron — Hunter armed "Tap again to clear 3 items" on 142, his own move to
       149 took effect at midnight, and the second tap cleared 149's 4 items. Now the form is keyed by the squadron: the
       change puts it back to its first state, and nothing is cleared;
   (2) a save the gate refused still answered its count, so the form said "Cleared 3 items". Now a refusal is answered,
       and the form says the generic "This change could not be saved." and clears nothing.
   The world: test-support/msq-world.ts. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { useMsqWorld, signInAs, acrossMove, pastMidnight, PID } from '../test-support/msq-world'
import { switchUnit, writeInputs, setEntryTrigger } from '../state/store'
import { setConflictChecker } from '../command'
import { HOOKS } from '../engine/hooks'
import { ELOG } from '../engine/editlog'
import { PLANPUCKS, DAYRMK, addPlanPuck } from '../state/plan'
import { storedCalendar, keptPlan } from '../state/plan-foreign'
import { UNIT, BOOT_UNIT } from '../engine/unitview'
import { clearHistoryData, clearEditHistory } from './inputedit'
import { ClearControl } from './AdminPage'
import { pickDate } from './datecal-testkit'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

useMsqWorld()
afterEach(() => { cleanup(); setConflictChecker(null); setEntryTrigger(true); if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT) })

const OLD = '2026-01-10'
/* a squadron's planning calendar, as words: the loaded one for the squadron in view, else its kept or stored one */
const cal = (u: string) => {
  const c: any = u === UNIT ? { pucks: PLANPUCKS, titles: DAYRMK } : (keptPlan(u) ?? storedCalendar(u))
  return JSON.stringify({ pucks: c.pucks.map((p: any) => p.date + ':' + (p.text ?? p.t ?? '')).sort(), titles: Object.keys(c.titles).sort() })
}
/* old clutter on each squadron's calendar, each written by its own admin */
const seed = () => {
  signInAs('kestrel'); expect(UNIT).toBe('u149')
  expect(writeInputs(() => { addPlanPuck(OLD, '149 old note'); DAYRMK['2026-01-11'] = '149 old title' })).toBe(true)
  signInAs('hunter'); expect(UNIT).toBe('u142')
  expect(writeInputs(() => { addPlanPuck(OLD, '142 old note'); DAYRMK['2026-01-11'] = '142 old title' })).toBe(true)
}
/* the two forms as the Data panel draws them (ui/AdminPage.tsx) */
const clutterForm = () => render(<ClearControl idp="admWipe" act="Clear old clutter…" zero="No old clutter in that period"
  unit={['item', 'items']} note="" run={clearHistoryData} />)
const historyForm = () => render(<ClearControl idp="admLog" act="Clear edit history…" zero="No edits on record in that period"
  unit={['entry', 'entries']} note="" run={clearEditHistory} />)
const btn = (id: string) => document.getElementById(id) as HTMLButtonElement
const tap = async (id: string) => { await act(async () => { fireEvent.click(btn(id)) }) }
const toasts = () => vi.mocked(HOOKS.toast).mock.calls.map(c => String(c[0]))

describe('"Clear old clutter…" — the armed count is the squadron’s it was counted for', () => {
  it('(control) Hunter, 142’s admin, clears 142’s old clutter only', async () => {
    seed()
    const c149 = cal('u149')
    clutterForm()
    pickDate(document.getElementById('admWipeDate')!, '2026-07-01')
    await tap('admWipe')
    const n = Number(/^Tap again to clear (\d+) items$/.exec(btn('admWipe').textContent ?? '')?.[1])
    expect(n, 'armed with 142’s count').toBeGreaterThan(1)
    await tap('admWipe')
    expect(toasts()).toContain(`Cleared ${n} items`)
    expect(cal('u142')).not.toContain('142 old')
    expect(cal('u149'), '149’s calendar untouched').toBe(c149)
  })
  it('his own move to 149 takes effect at midnight between the two taps: the form is back to its first state, and nothing is cleared', async () => {
    seed()
    signInAs('saber')
    acrossMove(PID.hunter, 'u142', 'u149')
    signInAs('hunter')
    clutterForm()
    pickDate(document.getElementById('admWipeDate')!, '2026-07-01')
    await tap('admWipe')
    expect(btn('admWipe').textContent, 'armed on 142').toMatch(/^Tap again to clear \d+ items$/)
    await act(async () => { pastMidnight() })
    expect(UNIT, 'his own squadron is in view').toBe('u149')
    const c142 = cal('u142'), c149 = cal('u149')
    expect(btn('admWipe').textContent, 'back to its first state').toBe('Clear old clutter…')
    await tap('admWipe')
    expect(toasts().filter(t => t.startsWith('Cleared')), 'nothing said cleared').toEqual([])
    expect([cal('u142'), cal('u149')], 'neither calendar cleared').toEqual([c142, c149])
  })
  it('a save the gate refuses: not "Cleared", the generic words, the calendar unchanged', async () => {
    seed()
    const c142 = cal('u142')
    clutterForm()
    pickDate(document.getElementById('admWipeDate')!, '2026-07-01')
    await tap('admWipe')
    setConflictChecker(() => 'refused for the test')
    await tap('admWipe')
    expect(toasts().filter(t => t.startsWith('Cleared'))).toEqual([])
    expect(toasts()).toContain('This change could not be saved.')
    expect(cal('u142')).toBe(c142)
    expect(clearHistoryData('before', '2026-07-01', ''), 'the funnel answers the refusal').toBeLessThan(0)
  })
})

describe('"Clear edit history…" beside it — the same two faults, the same fix', () => {
  it('(control) Hunter clears 142’s history lines', async () => {
    seed()
    expect(ELOG.rows.length, 'setup: 142’s history has lines').toBeGreaterThan(0)
    historyForm()
    pickDate(document.getElementById('admLogDate')!, '2026-07-16')
    await tap('admLog')
    expect(btn('admLog').textContent).toMatch(/^Tap again to clear \d+ entr/)
    await tap('admLog')
    expect(toasts().some(t => /^Cleared \d+ entr/.test(t))).toBe(true)
  })
  it('his own move at midnight between the two taps: back to its first state, 149’s history untouched', async () => {
    seed()
    signInAs('saber')
    acrossMove(PID.hunter, 'u142', 'u149')
    signInAs('hunter')
    historyForm()
    pickDate(document.getElementById('admLogDate')!, '2026-07-16')
    await tap('admLog')
    expect(btn('admLog').textContent).toMatch(/^Tap again to clear/)
    await act(async () => { pastMidnight() })
    expect(UNIT).toBe('u149')
    const rows = ELOG.rows.length
    expect(btn('admLog').textContent, 'back to its first state').toBe('Clear edit history…')
    await tap('admLog')
    expect(toasts().filter(t => t.startsWith('Cleared'))).toEqual([])
    expect(ELOG.rows.length, '149’s history as it was').toBe(rows)
  })
  it('a save the gate refuses: not "Cleared", the generic words, the history unchanged', async () => {
    seed()
    historyForm()
    pickDate(document.getElementById('admLogDate')!, '2026-07-16')
    await tap('admLog')
    const rows = ELOG.rows.map(r => r.lineId).join()
    setConflictChecker(() => 'refused for the test')
    await tap('admLog')
    expect(toasts().filter(t => t.startsWith('Cleared'))).toEqual([])
    expect(toasts()).toContain('This change could not be saved.')
    /* (the saved lines a refused command wrote are put back by the app's storage transaction, state/changebatch.ts —
       not installed in this world, so only the list in memory is read here) */
    expect(ELOG.rows.map(r => r.lineId).join(), 'the list in memory').toBe(rows)
  })
})
