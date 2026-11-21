// @vitest-environment jsdom
/* THE LATE CUT-OFF AND ITS WINDOWS BY SQUADRON (the reshape plan §3.2 A-ii; the host's ruling of 21 Nov 26 for phase 2:
   a settings window edits the squadron of the page it was opened from — the Logic page's door the pick, a calendar's
   gear its own squadron; another squadron's cut-off is one write of THAT squadron's whole `rules` record, VCONF and the
   checks left to the loaded squadron). New forms (§9.4). */
import { afterEach, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useMsqWorld as useWorld, signInAs } from '../test-support/msq-world'
import { setGrant } from '../state/units'
import { notify } from '../state/store'
import { UNIT } from '../engine/unitview'
import { VCONF } from '../engine/rules'
import { unitSetting } from '../engine/hooks'
import { getCut, saveCut, openWinFor, winUnit, forgetWin } from '../state/cutoff'
import { INPSET, SANSSET, setInpSet, setSansSet } from './pops'
import { _resetFloatWins } from './winorder'
import { InputsSettings } from './InputsSettings'
import { SansSettings } from './SansSettings'

useWorld()
afterEach(() => { cleanup(); _resetFloatWins(); setInpSet(false); setSansSet(false); forgetWin('inputs'); forgetWin('sans'); forgetWin('days') })

const t = (id: string) => screen.getByTestId(id)
/* 149 runs its SANS cut-off at 10 days (Kestrel, on 149's own Logic), then Hunter — 142's admin, given admin rights
   in 149 — signs in to 142 */
function setup() {
  signInAs('ad', 'a')
  expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
  signInAs('ad9', 'a9')
  expect(UNIT).toBe('u149')
  expect(saveCut('sans', { mode: 0, lead: 10, wd: 0, weeks: 1 }).ok).toBe(true)
  signInAs('ad2', 'a2')
  expect(UNIT).toBe('u142')
}

describe('the cut-off by squadron', () => {
  it("149's cut-off is read and written by name: its other values kept, 142's VCONF untouched", () => {
    setup()
    expect(getCut('sans', 'u149').lead, "149's").toBe(10)
    expect(getCut('sans').lead, "142's").toBe(14)
    const c = saveCut('inputs', { mode: 0, lead: 21, wd: 0, weeks: 1 }, 'u149')
    expect(c).toEqual({ ok: true, changed: true })
    expect(getCut('inputs', 'u149').lead).toBe(21)
    const rec: any = unitSetting('u149', 'rules', null)
    expect(rec.v.inputLead).toBe(21)
    expect(rec.v.sansLead, "149's SANS cut-off kept").toBe(10)
    expect(VCONF.inputLead, "142's in memory untouched").toBe(14)
    expect(unitSetting('u142', 'rules', null), "142's record untouched").toBeNull()
    /* back to the standard: the override leaves the record, as rulesSave stores only what differs */
    expect(saveCut('inputs', { mode: 0, lead: 14, wd: 0, weeks: 1 }, 'u149').changed).toBe(true)
    expect((unitSetting('u149', 'rules', null) as any).v.inputLead).toBeUndefined()
    expect(saveCut('inputs', { mode: 0, lead: 14, wd: 0, weeks: 1 }, 'u149')).toEqual({ ok: true, changed: false })
  })

  it('a window with no squadron named edits the pick; one named by its door edits that one, and forgets it once closed', () => {
    expect(winUnit('sans')).toBe(UNIT)
    openWinFor('sans', 'u149')
    expect(winUnit('sans')).toBe('u149')
    forgetWin('sans')
    expect(winUnit('sans')).toBe(UNIT)
  })
})

describe('the settings windows by squadron', () => {
  it("the SANS calendar's window opened for 149 shows and saves 149's cut-off; opened again with no squadron named, the pick's", () => {
    setup()
    render(<SansSettings />)
    act(() => { openWinFor('sans', 'u149'); setSansSet(true); notify() })
    expect((t('sset-lead') as HTMLInputElement).value, "149's").toBe('10')
    fireEvent.change(t('sset-lead'), { target: { value: '12' } })
    fireEvent.click(t('sset-save'))
    expect(SANSSET, 'saved and closed').toBe(false)
    expect(getCut('sans', 'u149').lead).toBe(12)
    expect(getCut('sans').lead, "142's untouched").toBe(14)
    act(() => { setSansSet(true); notify() })                    // the Logic page's door: no squadron named
    expect(t('sset-mode-wd').getAttribute('aria-pressed'), "the pick's — 142's standard, a weekday weeks before").toBe('true')
  })

  it("the Inputs calendar's window opened for 149 saves 149's inputs cut-off, the pick's left", () => {
    setup()
    render(<InputsSettings />)
    act(() => { openWinFor('inputs', 'u149'); setInpSet(true); notify() })
    fireEvent.change(t('iset-lead'), { target: { value: '20' } })
    fireEvent.click(t('iset-save'))
    expect(INPSET).toBe(false)
    expect(getCut('inputs', 'u149').lead).toBe(20)
    expect(getCut('inputs').lead).toBe(14)
  })
})
