// The counter form (owner, 19 Aug 26): a guided builder for the manning
// rows — name, who to count (crew / CAT / qualification chips, "everyone
// except" included), people or teams-of-slots, the amber/red floors, and a
// two-tap delete. Reached from + Counter in the Rearrange tools and from the
// explainer sheet's Edit counter… button.

import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getState, initStore, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { CounterForm } from './CounterForm'
import { Matrix } from './Matrix'

beforeEach(() => {
  initStore(memoryBackend())
})

describe('building a new counter', () => {
  it('save is disabled until it has a name, then writes a people rule with the picked filter', () => {
    setRole('admin')
    const onClose = vi.fn()
    render(<CounterForm ruleId={null} onClose={onClose} />)

    expect((screen.getByTestId('cform-save') as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(screen.getByTestId('cform-name'), { target: { value: 'SXO PILOTS' } })
    fireEvent.click(screen.getByTestId('cf-seat-pilot'))
    fireEvent.click(screen.getByTestId('cf-qual-sxo'))
    fireEvent.change(screen.getByTestId('cform-amber'), { target: { value: '2' } })
    fireEvent.change(screen.getByTestId('cform-red'), { target: { value: '1' } })
    fireEvent.click(screen.getByTestId('cform-save'))

    expect(onClose).toHaveBeenCalled()
    const rule = getState().requirements.default.rules.find(r => r.id === 'sxo-pilots')!
    expect(rule.label).toBe('SXO PILOTS')
    expect(rule.count).toEqual({ kind: 'people', filter: { seats: ['pilot'], quals: ['sxo'] } })
    expect(rule.threshold).toEqual({ amber: 2, red: 1 })
  })

  it('the CAT chips flip to "everyone except" through the is/is-not toggle', () => {
    setRole('admin')
    render(<CounterForm ruleId={null} onClose={() => {}} />)
    fireEvent.change(screen.getByTestId('cform-name'), { target: { value: 'NON-OCU' } })
    fireEvent.click(screen.getByTestId('cf-catmode'))
    fireEvent.click(screen.getByTestId('cf-cat-OCU'))
    fireEvent.click(screen.getByTestId('cform-save'))
    expect(getState().requirements.default.rules.find(r => r.id === 'non-ocu')!.count)
      .toEqual({ kind: 'people', filter: { notCats: ['OCU'] } })
  })

  it('team mode starts as the crew-set pair, grows slots to the cap, and saves the recipe', () => {
    setRole('admin')
    render(<CounterForm ruleId={null} onClose={() => {}} />)
    fireEvent.change(screen.getByTestId('cform-name'), { target: { value: 'DUTY PAIRS' } })
    fireEvent.click(screen.getByTestId('cform-mode-team'))
    // The starter shape: slot 0 pilots, slot 1 WSOs.
    expect(screen.getByTestId('s0-seat-pilot').getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByTestId('s1-seat-wso').getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByTestId('cform-slot-add'))
    fireEvent.click(screen.getByTestId('s2-qual-sxo'))
    fireEvent.change(screen.getByTestId('s0-count'), { target: { value: '2' } })
    fireEvent.click(screen.getByTestId('cform-show-people'))
    fireEvent.click(screen.getByTestId('cform-presence'))
    fireEvent.click(screen.getByTestId('cform-save'))
    const rule = getState().requirements.default.rules.find(r => r.id === 'duty-pairs')!
    expect(rule.count).toEqual({
      kind: 'team',
      slots: [
        { count: 2, filter: { seats: ['pilot'] } },
        { count: 1, filter: { seats: ['wso'] } },
        { count: 1, filter: { quals: ['sxo'] } },
      ],
      show: 'people',
      presence: true,
    })
  })

  it('shows a live sample of what the rule reads before it is saved', () => {
    setRole('admin')
    render(<CounterForm ruleId={null} onClose={() => {}} />)
    fireEvent.change(screen.getByTestId('cform-name'), { target: { value: 'EVERYONE' } })
    // The seeded war's first day: every aircrew present. The exact figure is
    // the seed roster's headcount — what matters is that a number shows and
    // moves with the picks.
    expect(screen.getByTestId('cform-preview').textContent).toMatch(/counts \d/)
  })
})

describe('editing and deleting', () => {
  it('opens loaded with the rule and saves a rework in place', () => {
    setRole('admin')
    const onClose = vi.fn()
    render(<CounterForm ruleId="ip" onClose={onClose} />)
    expect((screen.getByTestId('cform-name') as HTMLInputElement).value).toBe('IP')
    fireEvent.change(screen.getByTestId('cform-name'), { target: { value: 'INSTR PILOTS' } })
    fireEvent.click(screen.getByTestId('cform-save'))
    expect(onClose).toHaveBeenCalled()
    const rule = getState().requirements.default.rules.find(r => r.id === 'ip')!
    expect(rule.label).toBe('INSTR PILOTS')
    // The words rewrite themselves from the definition after a rework.
    expect(rule.desc).toBeUndefined()
  })

  it('delete arms first, then removes the counter', () => {
    setRole('admin')
    const onClose = vi.fn()
    render(<CounterForm ruleId="wmp" onClose={onClose} />)
    const del = screen.getByTestId('cform-delete')
    fireEvent.click(del)
    expect(del.textContent).toBe('Really delete?')
    expect(getState().requirements.default.rules.some(r => r.id === 'wmp')).toBe(true)
    fireEvent.click(del)
    expect(getState().requirements.default.rules.some(r => r.id === 'wmp')).toBe(false)
    expect(onClose).toHaveBeenCalled()
  })

  it('a new counter never steals an existing id — the slug gets a suffix', () => {
    setRole('admin')
    render(<CounterForm ruleId={null} onClose={() => {}} />)
    fireEvent.change(screen.getByTestId('cform-name'), { target: { value: 'IP' } })
    fireEvent.click(screen.getByTestId('cform-save'))
    const ids = getState().requirements.default.rules.map(r => r.id)
    expect(ids).toContain('ip')
    expect(ids).toContain('ip-2')
  })
})

describe('the ways in', () => {
  it('+ Counter sits in the admin Rearrange tools and opens the blank form', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('roster-arrange'))
    fireEvent.click(screen.getByTestId('counter-add'))
    expect(screen.getByTestId('counter-form')).toBeTruthy()
    expect((screen.getByTestId('cform-name') as HTMLInputElement).value).toBe('')
  })

  it('a member has no + Counter', () => {
    render(<Matrix />)
    expect(screen.queryByTestId('counter-add')).toBeNull()
  })

  it("the explainer sheet's Edit counter… swaps to the form loaded with that rule", () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('manning-info-sets'))
    fireEvent.click(screen.getByTestId('counter-edit-open'))
    expect(screen.queryByTestId('manning-sheet')).toBeNull()
    expect((screen.getByTestId('cform-name') as HTMLInputElement).value).toBe('Crew sets')
  })

  it('a deleted counter leaves the count rows at once', () => {
    setRole('admin')
    render(<Matrix />)
    expect(screen.getByTestId('count-flp')).toBeTruthy()
    fireEvent.click(screen.getByTestId('manning-info-flp'))
    fireEvent.click(screen.getByTestId('counter-edit-open'))
    const del = screen.getByTestId('cform-delete')
    fireEvent.click(del)
    fireEvent.click(del)
    expect(screen.queryByTestId('count-flp')).toBeNull()
  })
})

describe('Reset counters', () => {
  it('arms first, then puts the built-in set back — customs discarded', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('roster-arrange'))
    // Break the world first: delete a built-in, add a custom.
    fireEvent.click(screen.getByTestId('manning-info-wmp'))
    fireEvent.click(screen.getByTestId('counter-edit-open'))
    const del = screen.getByTestId('cform-delete')
    fireEvent.click(del)
    fireEvent.click(del)
    fireEvent.click(screen.getByTestId('counter-add'))
    fireEvent.change(screen.getByTestId('cform-name'), { target: { value: 'TEMP' } })
    fireEvent.click(screen.getByTestId('cform-save'))

    const reset = screen.getByTestId('counter-reset-all')
    fireEvent.click(reset)
    expect(reset.textContent).toBe('Really reset?')
    expect(getState().requirements.default.rules.some(r => r.id === 'wmp')).toBe(false)
    fireEvent.click(reset)
    const ids = getState().requirements.default.rules.map(r => r.id)
    expect(ids).toContain('wmp')
    expect(ids).not.toContain('temp')
  })
})
