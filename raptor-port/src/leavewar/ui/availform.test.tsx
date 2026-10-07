// @vitest-environment jsdom
/* THE COUNTER FORM'S MODE FOR THE TWO AVAILABLE ROWS (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.3; owner D640 — "can [this row] be customised like
   for e.g not including ocu? And rename it with free text").

   Available P and Available W are ordinary count rows an admin renames and re-defines "with the form the war already
   has". They are reached by a tap on the row's own NAME — as every count row's name opens its sheet — and the form
   then shows what holds for these two and nothing that does not: NO amber / red boxes (their red comes from the
   Required row above them), NO "Sets / teams" choice (they count people), NO Delete (the SANS calendar reads them),
   a live sample summed the same SANS-less way the row itself is, and one line saying "SANS people are never counted
   here". The store's own three refusals (delete, a teams count, thresholds held at 0) are dayfacts.test.ts; this is
   the screen, which must not offer what the store would refuse. The Required rows keep their names (D668): they open
   nothing. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { storeBackend } from '../../engine/hooks'
import { initStore as raptorInitStore } from '../../state/store'
import { setSession } from '../../state/auth'
import { availHave, effectiveCat, ruleHave } from '../engine'
import { availRules, getState, initStore as lwInitStore, saveManningRule, setPeople, setQualCatalog, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { projectPeople } from '../state/raptorRoster'
import { dayFacts } from '../sync'
import { Matrix } from './Matrix'

const mem = new Map<string, string>()
beforeEach(() => {
  mem.clear()
  storeBackend.impl = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { if (v === 'null') mem.delete(k); else mem.set(k, v) }, keys: () => [...mem.keys()] } as any
  raptorInitStore()
  setSession({ user: 'admin-test', role: 'admin' })
  lwInitStore(memoryBackend())
  setRole('admin')
  setPeople(projectPeople())
  /* the qualification chips as Raptor's Quals page gives them — SANS among them */
  setQualCatalog([{ k: 'san', label: 'SANS' }, { k: 'sxo', label: 'SXO' }, { k: 'scDay', label: 'SC DAY' }])
})
afterEach(() => { cleanup(); setSession(null); storeBackend.impl = null })

const TUE = '2026-01-06'
const nameOf = (row: string) => screen.getByTestId(`fly-row-${row}`).querySelector('.who')!
const openForm = (row: 'avail-p' | 'avail-w') => { fireEvent.click(screen.getByTestId(`fly-name-${row}`)); return screen.getByTestId('counter-form') }
const q = (id: string) => screen.queryByTestId(id)

describe('the way in: a tap on an Available row’s name', () => {
  it('an admin’s tap opens the counter form for that row, loaded with it', () => {
    render(<Matrix />)
    const form = openForm('avail-p')
    expect(form.textContent).toContain('Available P')
    expect((screen.getByTestId('cform-name') as HTMLInputElement).value).toBe('Available P')
    expect(screen.getByTestId('cf-seat-pilot').getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByTestId('cform-close'))
    openForm('avail-w')
    expect((screen.getByTestId('cform-name') as HTMLInputElement).value).toBe('Available W')
    expect(screen.getByTestId('cf-seat-wso').getAttribute('aria-pressed')).toBe('true')
  })
  it('the name is a real button for an admin, saying what a press does', () => {
    render(<Matrix />)
    const b = screen.getByTestId('fly-name-avail-p')
    expect(b.tagName).toBe('BUTTON')
    expect(b.getAttribute('title')).toBe('Rename Available P, or change who it counts')
    /* and it keeps both forms of the name: the long one, and a phone's short one */
    expect(b.querySelector('.frl-long')!.textContent).toBe('Available P')
    expect(b.querySelector('.frl-short')!.textContent).toBe('Avail P')
  })
  it('a member’s name is plain text: nothing to press, nothing opens', () => {
    setRole('member')
    render(<Matrix />)
    expect(q('fly-name-avail-p')).toBeNull()
    fireEvent.click(nameOf('avail-p'))
    expect(q('counter-form')).toBeNull()
    expect(nameOf('avail-p').textContent).toContain('Available P')
  })
  it('the Required rows keep their names (D668): an admin’s press on one opens nothing', () => {
    render(<Matrix />)
    for (const row of ['req-p', 'req-w']) {
      expect(q(`fly-name-${row}`)).toBeNull()
      expect(nameOf(row).querySelector('button')).toBeNull()
      fireEvent.click(nameOf(row))
      expect(q('counter-form')).toBeNull()
    }
  })
})

describe('the form shows what holds for these two rows, and nothing the store would refuse', () => {
  it('no amber / red boxes, no "Sets / teams" choice, no Delete — and one line says SANS people are never counted here', () => {
    render(<Matrix />)
    openForm('avail-p')
    for (const gone of ['cform-amber', 'cform-red', 'cform-mode-team', 'cform-mode-people', 'cform-delete', 'cform-slot-add'])
      expect(q(gone), gone).toBeNull()
    expect(screen.getByTestId('cform-avail-note').textContent).toBe('SANS people are never counted here. The SANS calendar reads this row, so it cannot be deleted.')
    /* "SANS" is not offered as a qualification to hold or lack — a SANS man is never counted, so it could decide nothing */
    expect(q('cf-qual-san')).toBeNull(); expect(q('cf-noqual-san')).toBeNull()
    expect(q('cf-qual-sxo')).toBeTruthy()
    /* what it does offer: the name, and who it counts */
    for (const kept of ['cform-name', 'cf-seat-any', 'cf-seat-pilot', 'cf-seat-wso', 'cf-catmode', 'cf-cat-OCU', 'cform-save', 'cform-cancel'])
      expect(q(kept), kept).toBeTruthy()
    expect(screen.getByTestId('cform-save').textContent).toBe('Save')
  })
  it('renamed and told to leave out OCU: the row’s name, its figure and what the calendars read all follow', () => {
    render(<Matrix />)
    const before = dayFacts(TUE).availP!
    const ocu = getState().people.filter(p => p.seat === 'pilot' && !p.pers && !p.san && effectiveCat(p) === 'OCU').length
    expect(ocu).toBeGreaterThan(0)                                    // the demo roster has OCU pilots to leave out
    openForm('avail-p')
    fireEvent.change(screen.getByTestId('cform-name'), { target: { value: 'Avail P (no OCU)' } })
    fireEvent.click(screen.getByTestId('cf-catmode'))                  // "is" → "is not"
    fireEvent.click(screen.getByTestId('cf-cat-OCU'))
    fireEvent.click(screen.getByTestId('cform-save'))
    expect(q('counter-form')).toBeNull()
    expect(availRules().p).toMatchObject({ id: 'availp', label: 'Avail P (no OCU)', threshold: { amber: 0, red: 0 } })
    expect(availRules().p.count).toEqual({ kind: 'people', filter: { seats: ['pilot'], notCats: ['OCU'] } })
    expect(nameOf('avail-p').textContent).toBe('Avail P (no OCU)')     // a name of his own shows as typed, at every width
    expect(dayFacts(TUE).availP).toBe(before - ocu)
    expect(screen.getByTestId(`avail-p-${TUE}`).textContent).toBe(String(Math.round((before - ocu) * 10) / 10))
    /* it is still not a row of the Manning list */
    expect(q('count-availp')).toBeNull()
  })
  it('opened again it shows what was saved, and the other row is untouched', () => {
    saveManningRule({ id: 'availp', label: 'Pilots here', count: { kind: 'people', filter: { seats: ['pilot'], notCats: ['OCU'] } }, threshold: { amber: 0, red: 0 } })
    render(<Matrix />)
    openForm('avail-p')
    expect((screen.getByTestId('cform-name') as HTMLInputElement).value).toBe('Pilots here')
    expect(screen.getByTestId('cf-catmode').textContent).toBe('is not')
    expect(screen.getByTestId('cf-cat-OCU').getAttribute('aria-pressed')).toBe('true')
    expect(availRules().w.label).toBe('Available W')
  })
  it('the live sample is summed the row’s own way — a SANS man is never in it', () => {
    /* make one pilot SANS: the row must not count him, and neither may the form's "that counts N" */
    const people = getState().people
    const pilot = people.find(p => p.seat === 'pilot' && !p.pers && !p.san)!
    setPeople(people.map(p => (p.id === pilot.id ? { ...p, san: true } : p)))
    const s = getState()
    const day = s.period.days[0]!.date
    const rule = availRules().p
    const withSans = ruleHave(rule.count, s.people, s.grid, s.states, day, s.views)
    const without = availHave(rule, s.people, s.grid, s.states, day, s.views)
    expect(withSans).toBe(without + 1)                                 // the two sums really differ here
    render(<Matrix />)
    openForm('avail-p')
    expect(screen.getByTestId('cform-preview').textContent).toBe(`On this war's first day that counts ${Math.round(without * 10) / 10}.`)
  })
  it('an empty name cannot be saved; Cancel changes nothing', () => {
    render(<Matrix />)
    openForm('avail-w')
    fireEvent.change(screen.getByTestId('cform-name'), { target: { value: '  ' } })
    expect((screen.getByTestId('cform-save') as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(screen.getByTestId('cform-name'), { target: { value: 'Something else' } })
    fireEvent.click(screen.getByTestId('cform-cancel'))
    expect(availRules().w.label).toBe('Available W')
    expect(getState().requirements.default.rules).toEqual([])           // nothing was stored
  })
})

describe('an ordinary counter’s form is what it was', () => {
  it('still has the amber / red boxes, the "Sets / teams" choice and Delete — and no line about SANS', () => {
    saveManningRule({ id: 'pilots', label: 'PILOTS', count: { kind: 'people', filter: { seats: ['pilot'] } }, threshold: { amber: 3, red: 2 } })
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('manning-info-pilots'))
    fireEvent.click(screen.getByTestId('counter-edit-open'))
    for (const kept of ['cform-amber', 'cform-red', 'cform-mode-team', 'cform-mode-people', 'cform-delete'])
      expect(q(kept), kept).toBeTruthy()
    expect(q('cform-avail-note')).toBeNull()
    expect(q('cf-qual-san')).toBeTruthy()                               // an ordinary counter may count SANS holders
    expect(screen.getByTestId('cform-save').textContent).toBe('Save counter')
  })
  it('and a NEW counter can never be saved over one of the two rows: its id is its own', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('settings-open')); fireEvent.click(screen.getByTestId('counter-add'))
    fireEvent.change(screen.getByTestId('cform-name'), { target: { value: 'availp' } })
    fireEvent.click(screen.getByTestId('cform-save'))
    const made = getState().requirements.default.rules
    expect(made).toHaveLength(1)
    expect(made[0]!.id).not.toBe('availp')
    expect(availRules().p.label).toBe('Available P')
  })
})
