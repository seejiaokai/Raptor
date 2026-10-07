// The counter form (owner, 19 Aug 26): a guided builder for the manning
// rows — name, who to count (crew / CAT / qualification chips, "everyone
// except" included), people or teams-of-slots, the amber/red floors, and a
// two-tap delete. Reached from + Counter in the Rearrange tools and from the
// explainer sheet's Edit counter… button.

import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getState, initStore, setRole, saveManningRule, deleteManningRule } from '../state/store'
import { MAX_MANNING_RULES } from '../engine'
import { memoryBackend } from '../state/storage'
import { elevenCounters } from '../testkit'
import { CounterForm } from './CounterForm'
import { Matrix } from './Matrix'

beforeEach(() => {
  initStore(memoryBackend())
  elevenCounters()   // the app starts with NO counters (D669); these tests are about counters, so they make the old eleven — testkit
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
    /* the "SC duty still counts" chip is gone — it changed no number (N17) */
    expect(screen.queryByTestId('cform-presence')).toBeNull()
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
  it('+ Counter sits inside ⚙ Settings and opens the blank form', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('settings-open'))
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

/* ("Reset counters" was tested here — arm, then the built-in set back — until D669, 8 Oct 26: the Manning block comes
   with no count rows of its own, so there is nothing to put back and the button left ⚙ Settings. That it is gone, and
   that a deleted counter comes back with Undo instead: nocounters.test.tsx.) */

// [STORE-READER-SWEEP] ([DB-READINESS] group A, phase 7): the store keeps at most MAX_MANNING_RULES counters — the
// most its reader accepts back — and the form says so, with the way out, instead of an Add button that does nothing.
describe('the list is full', () => {
  const fill = () => {
    setRole('admin')
    let n = getState().requirements.default.rules.length
    for (let i = 0; n < MAX_MANNING_RULES; i++, n++)
      saveManningRule({ id: `extra-${i}`, label: `EXTRA ${i}`, count: { kind: 'people', filter: {} }, threshold: { amber: 1, red: 0 } })
    expect(getState().requirements.default.rules.length).toBe(MAX_MANNING_RULES)
  }

  it('a NEW counter: the form says the list is full and Add is disabled', () => {
    fill()
    render(<CounterForm ruleId={null} onClose={() => {}} />)
    fireEvent.change(screen.getByTestId('cform-name'), { target: { value: 'ONE MORE' } })
    expect(screen.getByTestId('cform-full').textContent).toBe(`${MAX_MANNING_RULES} counters is the most the app keeps. Delete one to add another.`)
    expect((screen.getByTestId('cform-save') as HTMLButtonElement).disabled).toBe(true)
  })

  it('editing a counter already in the list still saves, and wears no such line', () => {
    fill()
    const onClose = vi.fn()
    render(<CounterForm ruleId="extra-0" onClose={onClose} />)
    expect(screen.queryByTestId('cform-full')).toBeNull()
    fireEvent.change(screen.getByTestId('cform-name'), { target: { value: 'RENAMED' } })
    fireEvent.click(screen.getByTestId('cform-save'))
    expect(onClose).toHaveBeenCalled()
    expect(getState().requirements.default.rules.find(r => r.id === 'extra-0')!.label).toBe('RENAMED')
  })

  it('one short of full: no line, and Add works', () => {
    fill()
    deleteManningRule('extra-0')
    const onClose = vi.fn()
    render(<CounterForm ruleId={null} onClose={onClose} />)
    expect(screen.queryByTestId('cform-full')).toBeNull()
    fireEvent.change(screen.getByTestId('cform-name'), { target: { value: 'LAST ONE' } })
    fireEvent.click(screen.getByTestId('cform-save'))
    expect(onClose).toHaveBeenCalled()
    expect(getState().requirements.default.rules.length).toBe(MAX_MANNING_RULES)
  })
})
