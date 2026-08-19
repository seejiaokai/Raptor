// The manning explainer sheet (owner, 19 Aug 26): a tap on a count row's
// name says what the row counts and where its colours turn on, and an admin
// edits the amber/red lines from the same sheet.

import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { DayVerdict, RuleResult } from '../engine'
import { getState, initStore, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { CountRows } from './CountRows'
import { ManningSheet } from './ManningSheet'
import { Matrix } from './Matrix'

beforeEach(() => {
  initStore(memoryBackend())
})

const zeroCounts = { byCategory: { IP: 0, OPSP: 0, IWSO: 0, OPSW: 0 }, sxo: 0, sets: 0, duty: 0, flp: 0, wmp: 0, scd: 0, scn: 0 }
const rule = (ruleId: string, label: string): RuleResult =>
  ({ ruleId, label, have: 1, amber: 0, red: 0, verdict: 'ok' })
const day = (date: string, results: RuleResult[]): DayVerdict =>
  ({ date, verdict: 'ok', results, counts: zeroCounts })

describe('the count row names open the explainer', () => {
  it('every row name is a button that reports its rule id', () => {
    const onInfo = vi.fn()
    const verdicts = { d1: day('d1', [rule('sets', 'Crew sets'), rule('scd', 'SC D')]) }
    render(<table><CountRows verdicts={verdicts} dates={['d1']} order={[]} hidden={[]}
      arranging={false} admin={false} onInfo={onInfo} /></table>)
    fireEvent.click(screen.getByTestId('manning-info-sets'))
    expect(onInfo).toHaveBeenCalledWith('sets')
    fireEvent.click(screen.getByTestId('manning-info-scd'))
    expect(onInfo).toHaveBeenCalledWith('scd')
  })

  it('a tap in the real matrix opens the sheet with the definition', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('manning-info-sets'))
    expect(screen.getByTestId('manning-sheet')).toBeTruthy()
    expect(screen.getByTestId('manning-desc').textContent).toContain('one pilot plus one WSO')
  })
})

describe('the explainer sheet', () => {
  it('spells out the definition and the colour lines for a member, with no edit fields', () => {
    render(<ManningSheet ruleId="scd" onClose={() => {}} />)
    const desc = screen.getByTestId('manning-desc').textContent!
    expect(desc).toContain('2 SC Day qualified pilots')
    expect(desc).toContain('1 SXO')
    expect(desc).toContain('ground crew never counted')
    // amber 1 / red 1 — straight to red below one team, said as such
    expect(screen.getByTestId('manning-when').textContent).toContain("Red when the day's number drops below 1")
    expect(screen.queryByTestId('thresh-amber')).toBeNull()
    expect(screen.queryByTestId('thresh-save')).toBeNull()
  })

  it('says a 0/0 row never judges the day', () => {
    render(<ManningSheet ruleId="flp" onClose={() => {}} />)
    expect(screen.getByTestId('manning-when').textContent).toContain('Never amber or red')
  })

  it('an admin edits the lines; Save writes them and the sentence follows', () => {
    setRole('admin')
    render(<ManningSheet ruleId="sets" onClose={() => {}} />)
    const amber = screen.getByTestId('thresh-amber') as HTMLInputElement
    const red = screen.getByTestId('thresh-red') as HTMLInputElement
    expect(amber.value).toBe('5')
    expect(red.value).toBe('4.5')
    fireEvent.change(amber, { target: { value: '6' } })
    fireEvent.change(red, { target: { value: '5' } })
    fireEvent.click(screen.getByTestId('thresh-save'))
    expect(getState().requirements.default.sets).toEqual({ amber: 6, red: 5 })
    expect(screen.getByTestId('manning-when').textContent).toContain('drops below 6')
    // The default is named once the row is customised, and Reset restores it.
    expect(screen.getByTestId('manning-when').textContent).toContain('Default: amber 5')
    fireEvent.click(screen.getByTestId('thresh-reset'))
    expect(getState().requirements.default.sets).toEqual({ amber: 5, red: 4.5 })
    expect(screen.queryByTestId('thresh-reset')).toBeNull()
  })

  it('Save stays disabled on an emptied field', () => {
    setRole('admin')
    render(<ManningSheet ruleId="ip" onClose={() => {}} />)
    fireEvent.change(screen.getByTestId('thresh-amber'), { target: { value: '' } })
    expect((screen.getByTestId('thresh-save') as HTMLButtonElement).disabled).toBe(true)
  })
})
