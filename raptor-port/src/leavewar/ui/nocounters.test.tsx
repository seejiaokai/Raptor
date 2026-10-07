// @vitest-environment jsdom
/* THE MANNING BLOCK COMES WITH NO COUNT ROWS OF ITS OWN, AND A ROW'S EYE IS A DELETE CROSS (owner, D669, 8 Oct 26 —
   "should there be a default counter? I think there shouldn't be and the user can create what they want. Instead of
   hide (eye) we should replace it with a delete cross." `OUTSTANDING.md` `[LW-DEMO-COUNTERS-TRIM]`).

   The seven readings told to him, each pinned here:
     1. no default for the demo squadron either — the block opens with only the four Required / Available rows;
     2. with the eye gone nothing can be hidden, so the Archive bar and "bring back" go with it;
     3. the cross asks nothing first, BECAUSE the app's Undo brings the counter back;
     4. "Reset counters" has nothing to go back to and leaves ⚙ Settings;
     5. a day reads "under-manned" only by counters that exist — with none, no day does;
     6. the two Available rows are untouched: not deletable, no cross, no grip;
     7. nothing stored is converted (D56) — a squadron's saved counters load as they were.
   A test that needs counters MAKES them (testkit `elevenCounters`, the real "+ Counter" writer). */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { storeBackend } from '../../engine/hooks'
import { initStore as raptorInitStore } from '../../state/store'
import { setSession } from '../../state/auth'
import { installGlobalUndo } from '../../state/undo-wire'
import { _resetTimeline } from '../../undo/timeline'
import { globalRedo, globalUndo, undoState } from '../../undo'
import { evaluateDay, seedRequirements, type ManningRule } from '../engine'
import {
  availRules, deleteManningRule, getState, initStore as lwInitStore, manningRowIds, orderedManningIds, saveManningRule,
  setCell, setPeople, setRole,
} from '../state/store'
import * as store from '../state/store'
import { memoryBackend } from '../state/storage'
import { projectPeople } from '../state/raptorRoster'
import { dayFacts } from '../sync'
import { elevenCounters } from '../testkit'
import { ELEVEN_COUNTERS } from '../testing/eleven'
import { StageBar } from './Chrome'
import { Matrix } from './Matrix'

const mem = new Map<string, string>()
beforeEach(() => {
  mem.clear()
  storeBackend.impl = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { if (v === 'null') mem.delete(k); else mem.set(k, v) }, keys: () => [...mem.keys()] } as any
  raptorInitStore()
  setSession({ user: 'admin-test', role: 'admin' })
  _resetTimeline(); installGlobalUndo()
  lwInitStore(memoryBackend())
  setRole('admin')
  setPeople(projectPeople())
})
afterEach(() => { cleanup(); setSession(null); storeBackend.impl = null; _resetTimeline() })

const FLY = ['fly-row-req-p', 'fly-row-req-w', 'fly-row-avail-p', 'fly-row-avail-w']
const rowsOfBlock = () => [...(screen.getByTestId('fly-row-req-p').parentElement!.querySelectorAll(':scope > tr'))].map(tr => tr.getAttribute('data-testid') ?? '')
const PILOTS: ManningRule = { id: 'pilots', label: 'PILOTS', count: { kind: 'people', filter: { seats: ['pilot'] } }, threshold: { amber: 99, red: 98 } }
const TUE = '2026-01-06'

describe('the app starts with no counters (reading 1)', () => {
  it('the built-in set is empty, the store holds none, and none is in the row order', () => {
    expect(seedRequirements().default.rules).toEqual([])
    expect(getState().requirements.default.rules).toEqual([])
    expect(manningRowIds()).toEqual([]); expect(orderedManningIds()).toEqual([])
  })
  it('the Manning block opens with the four Required / Available rows and nothing else — for an admin and for a member', () => {
    render(<Matrix />)
    expect(rowsOfBlock()).toEqual(FLY)
    expect(document.querySelector('[data-testid^="count-"]')).toBeNull()
    cleanup()
    setRole('member')
    render(<Matrix />)
    expect(rowsOfBlock()).toEqual(FLY)
  })
  it('the Manning button still folds the four rows away and brings them back', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counts-toggle'))
    expect(screen.queryByTestId('fly-row-req-p')).toBeNull()
    fireEvent.click(screen.getByTestId('counts-toggle'))
    expect(rowsOfBlock()).toEqual(FLY)
  })
  it('in Rearrange, with no counters, the block shows no grip, no cross and no Archive bar', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('roster-arrange'))
    expect(rowsOfBlock()).toEqual(FLY)
    expect(document.querySelector('[data-testid^="manning-"]')).toBeNull()
  })
  it('the two Available rows still count (reading 6): they never were rows of the list', () => {
    expect(availRules().p.count).toEqual({ kind: 'people', filter: { seats: ['pilot'] } })
    expect(dayFacts(TUE).availP).toBeGreaterThan(0); expect(dayFacts(TUE).availW).toBeGreaterThan(0)
    render(<Matrix />)
    expect(Number(screen.getByTestId(`avail-p-${TUE}`).textContent)).toBe(dayFacts(TUE).availP)
  })
})

describe('"under-manned" judges only counters that exist (reading 5)', () => {
  const verdictOf = (iso: string) => { const s = getState(); return evaluateDay(s.people, s.grid, s.states, s.requirements, iso, s.views) }
  it('with none, no day is under-manned and the tally reads 0 days', () => {
    for (const d of getState().period.days.slice(0, 40)) {
      const v = verdictOf(d.date)
      expect(v.results).toEqual([]); expect(v.verdict, d.date).toBe('ok')
    }
    render(<StageBar />)
    expect(screen.getByTestId('undermanned').textContent).toContain('0 days')
    expect((screen.getByTestId('undermanned') as HTMLButtonElement).disabled).toBe(true)
  })
  it('a counter someone makes is judged from then on — and stops being judged the moment it is deleted', () => {
    expect(saveManningRule(PILOTS)).toBe(true)                        // red below 98 pilots: every day is red
    expect(verdictOf(TUE).verdict).toBe('red')
    render(<StageBar />)
    expect(screen.getByTestId('undermanned').textContent).not.toContain('0 days')
    act(() => { expect(deleteManningRule('pilots')).toBe(true) })
    expect(verdictOf(TUE).verdict).toBe('ok')
    expect(screen.getByTestId('undermanned').textContent).toContain('0 days')
  })
})

describe('in Rearrange a count row carries a delete cross where the eye was (readings 2, 3, 6)', () => {
  beforeEach(() => { saveManningRule(PILOTS); saveManningRule({ ...PILOTS, id: 'wsos', label: 'WSOS', count: { kind: 'people', filter: { seats: ['wso'] } }, threshold: { amber: 0, red: 0 } }) })
  const arrange = () => { render(<Matrix />); fireEvent.click(screen.getByTestId('roster-arrange')) }

  it('each of the squadron’s own rows has a grip and a cross; there is no eye anywhere', () => {
    arrange()
    for (const id of ['pilots', 'wsos']) {
      expect(screen.getByTestId(`manning-drag-${id}`)).toBeTruthy()
      const x = screen.getByTestId(`manning-delete-${id}`)
      expect(x.getAttribute('aria-label')).toBe(`Delete the ${id === 'pilots' ? 'PILOTS' : 'WSOS'} counter`)
      expect(x.textContent).toBe('✕')
    }
    expect(document.querySelector('[data-testid^="manning-hide-"], [data-testid^="manning-restore-"]')).toBeNull()
  })
  it('the four Required / Available rows carry no cross and no grip (reading 6)', () => {
    arrange()
    for (const id of FLY) expect(screen.getByTestId(id).querySelector('button, [data-testid^="manning-"]')).toBeNull()
  })
  it('outside Rearrange, and for a member, there is no cross', () => {
    render(<Matrix />)
    expect(document.querySelector('[data-testid^="manning-delete-"]')).toBeNull()
    cleanup()
    setRole('member')
    render(<Matrix />)
    expect(screen.getByTestId('count-pilots')).toBeTruthy()
    expect(screen.queryByTestId('roster-arrange')).toBeNull()
    expect(document.querySelector('[data-testid^="manning-delete-"]')).toBeNull()
  })
  it('the cross deletes its counter at once — it asks nothing — and the rest keep their place', () => {
    arrange()
    fireEvent.click(screen.getByTestId('manning-delete-pilots'))
    expect(screen.queryByTestId('count-pilots')).toBeNull()
    expect(getState().requirements.default.rules.map(r => r.id)).toEqual(['wsos'])
    expect(rowsOfBlock()).toEqual(['count-wsos', ...FLY])
    expect(screen.getByTestId('manning-delete-wsos')).toBeTruthy()
  })
  it('…because Undo brings it back: the counter, what it counts, its thresholds and its place — and Redo takes it away again (reading 3)', () => {
    arrange()
    fireEvent.click(screen.getByTestId('manning-delete-pilots'))
    expect(undoState().canUndo).toBe(true)
    act(() => { expect(globalUndo().ok).toBe(true) })
    expect(getState().requirements.default.rules.map(r => r.id)).toEqual(['pilots', 'wsos'])
    expect(getState().requirements.default.rules[0]).toMatchObject({ label: 'PILOTS', threshold: { amber: 99, red: 98 }, count: { kind: 'people', filter: { seats: ['pilot'] } } })
    expect(rowsOfBlock()).toEqual(['count-pilots', 'count-wsos', ...FLY])
    act(() => { expect(globalRedo().ok).toBe(true) })
    expect(screen.queryByTestId('count-pilots')).toBeNull()
  })
  it('there is no Archive bar, ever (reading 2) — and a row an older store had hidden is simply drawn (reading 7: nothing converted)', () => {
    arrange()
    expect(screen.queryByTestId('manning-archive')).toBeNull()
    cleanup()
    /* an older store: the row hidden with the eye that no longer exists */
    const backend = memoryBackend()
    lwInitStore(backend); setRole('admin'); setPeople(projectPeople()); saveManningRule(PILOTS)
    backend.write('manninghidden', JSON.stringify(['pilots']))
    lwInitStore(backend); setRole('admin'); setPeople(projectPeople())
    render(<Matrix />)
    expect(screen.getByTestId('count-pilots')).toBeTruthy()
    fireEvent.click(screen.getByTestId('roster-arrange'))
    expect(screen.queryByTestId('manning-archive')).toBeNull()
    expect(screen.getByTestId('manning-delete-pilots')).toBeTruthy()
  })
})

describe('⚙ Settings (reading 4)', () => {
  it('still makes a counter with "+ Counter", and no longer offers "Reset counters"', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('settings-open'))
    expect(screen.getByTestId('counter-add')).toBeTruthy()
    expect(screen.queryByTestId('counter-reset-all')).toBeNull()
    expect(screen.getByTestId('settings-sheet').textContent).not.toMatch(/Reset counters/i)
    fireEvent.click(screen.getByTestId('counter-add'))
    expect(screen.getByTestId('counter-form')).toBeTruthy()
  })
  it('the store has no "put the built-in counters back" any more — there are none to put back', () => {
    expect((store as Record<string, unknown>).resetManningRules).toBeUndefined()
  })
})

describe('nothing stored is converted (reading 7), and what the tests stand on is makeable', () => {
  it('a squadron’s saved counters load exactly as they were saved', () => {
    const backend = memoryBackend()
    lwInitStore(backend); setRole('admin'); setPeople(projectPeople())
    elevenCounters()
    const was = JSON.stringify(getState().requirements.default.rules)
    lwInitStore(backend)                                              // a reload on the same storage
    expect(JSON.stringify(getState().requirements.default.rules)).toBe(was)
    expect(manningRowIds()).toEqual(ELEVEN_COUNTERS.map(r => r.id))
  })
  it('every one of the old eleven goes through the real "+ Counter" writer — the SC team rows too — and counts something', () => {
    elevenCounters()
    const s = getState()
    const v = evaluateDay(s.people, s.grid, s.states, s.requirements, TUE, s.views)
    expect(v.results.map(r => r.ruleId)).toEqual(ELEVEN_COUNTERS.map(r => r.id))
    for (const r of v.results) expect(Number.isFinite(r.have), r.ruleId).toBe(true)
    expect(v.results.find(r => r.ruleId === 'scd')!.have).toBeGreaterThan(0)
  })
  it('the counter FORM can express each of them: seats, the CAT ladder with "is not", the SXO and SC qualifications, a four-slot team', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('settings-open')); fireEvent.click(screen.getByTestId('counter-add'))
    for (const t of ['cf-seat-pilot', 'cf-seat-wso', 'cf-catmode', 'cf-qual-sxo', 'cf-qual-scDay', 'cf-qual-scNight']) expect(screen.getByTestId(t), t).toBeTruthy()
    for (const c of ['FI', 'IR', 'IP', 'IW', 'A', 'B']) expect(screen.getByTestId(`cf-cat-${c}`), c).toBeTruthy()
    fireEvent.click(screen.getByTestId('cform-mode-team'))
    fireEvent.click(screen.getByTestId('cform-slot-add')); fireEvent.click(screen.getByTestId('cform-slot-add'))
    expect(screen.getByTestId('cform-slot-3')).toBeTruthy()            // 2 pilots + 2 WSOs + 1 SXO + 1 more: four slots
    expect(screen.getByTestId('s2-qual-sxo')).toBeTruthy(); expect(screen.getByTestId('s0-qual-scDay')).toBeTruthy()
    expect((screen.getByTestId('s0-count') as HTMLInputElement).max).toBe('9')
  })
  it('a deleted counter stays deleted over a reload, and leave on the war still moves the ones that remain', () => {
    const backend = memoryBackend()
    lwInitStore(backend); setRole('admin'); setPeople(projectPeople())
    saveManningRule(PILOTS)
    const pilot = getState().people.find(p => p.seat === 'pilot' && !p.pers && !p.san)!
    const have = () => { const s = getState(); return evaluateDay(s.people, s.grid, s.states, s.requirements, TUE, s.views).results[0]!.have }
    const before = have()
    setCell(pilot.id, TUE, 'LL')
    expect(have()).toBe(before - 1)
    deleteManningRule('pilots')
    lwInitStore(backend)
    expect(getState().requirements.default.rules).toEqual([])
  })
})
