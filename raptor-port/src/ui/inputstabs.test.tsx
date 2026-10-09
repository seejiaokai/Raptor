// @vitest-environment jsdom
/* THE INPUTS PAGE'S THREE TABS (the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.6;
   owner D620, D626, 7 Oct 26: "I like the 3 tabs across the top but make it less tall" — Inputs · SANS · Medical, each
   calendar opening on its calendar; "for inputs maybe still have the option to have list mode … In list mode remove
   sans avail and move that function to sans calendar solely").

   They replace the mode pair (Member Inputs / SANS Availability) and the view trio (Calendar / List / Medical) as
   buttons; the state behind them is the same two facts (state/view.ts INPMODE, INPVIEW). Under the Inputs tab ONE
   small switch, Calendar | List. SANS availability is filed on the SANS calendar and nowhere else, so no form the
   Inputs tab opens offers that kind. */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputsPage } from './InputsPage'
import { InputEditor } from './inputedit'
import { initStore, notify, setSession } from '../state/store'
import { INPMODE, INPVIEW, setCalMonth, setInpMode, setInpView, setPage } from '../state/view'
import { INPUTS } from '../engine/inputs'
import { storeBackend } from '../engine/hooks'
import { initStore as lwInitStore, setRole as lwSetRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { _resetFloatWins } from './FloatWindow'
import { INPEDIT, INPSET, setInpEdit, setInpSet } from './pops'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement, root: Root
const seed = JSON.stringify(INPUTS)
const $ = (sel: string) => host.querySelector(sel) as HTMLElement | null
const click = async (sel: string) => { const el = $(sel); expect(el, sel).toBeTruthy(); await act(async () => { el!.click() }) }
const shown = (sel: string) => { const el = $(sel); return !!el && !el.closest('[hidden]') }
const tabs = () => Array.from(host.querySelectorAll('[role="tablist"] [role="tab"]')) as HTMLElement[]
const selected = () => tabs().filter(t => t.getAttribute('aria-selected') === 'true').map(t => t.id)
const options = (sel: string) => Array.from(host.querySelectorAll(sel + ' option')).map(o => (o as HTMLOptionElement).value)

beforeEach(async () => {
  INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed))
  const mem = new Map<string, string>()
  storeBackend.impl = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), keys: () => [...mem.keys()] }
  initStore(); setSession({ user: 'a', role: 'admin' }); lwInitStore(memoryBackend()); lwSetRole('admin')
  setPage('inputs'); setInpMode('member'); setInpView('cal'); setCalMonth({ y: 2026, m: 10 })
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<><InputsPage /><InputEditor /></>) })
})
afterEach(async () => {
  await act(async () => { root.unmount(); setInpEdit(null) })
  host.remove(); _resetFloatWins(); setSession(null); storeBackend.impl = null
})

describe('three tabs across the top', () => {
  it('Inputs, SANS and Medical, in that order, one of them selected — Inputs first', () => {
    expect(tabs().map(t => t.id)).toEqual(['inMemberMode', 'inSansMode', 'inMedBtn'])
    expect(tabs().map(t => (t.querySelector('.intab-t') || t).textContent)).toEqual(['Inputs', 'SANS', 'Medical'])
    expect(selected()).toEqual(['inMemberMode'])
    expect($('#inpCal'), 'the Inputs tab opens on its calendar').toBeTruthy()
  })
  it('the SANS tab is the SANS calendar and the Medical tab the Medical view — one screen at a time', async () => {
    await click('#inSansMode')
    expect(selected()).toEqual(['inSansMode'])
    expect($('#sansCal')).toBeTruthy(); expect($('#inpCal')).toBeNull(); expect($('#medView')).toBeNull()
    await click('#inMedBtn')
    expect(selected()).toEqual(['inMedBtn'])
    expect($('#medView')).toBeTruthy(); expect($('#sansCal')).toBeNull(); expect($('#inpCal')).toBeNull()
    await click('#inMemberMode')
    expect(selected()).toEqual(['inMemberMode'])
    expect($('#inpCal')).toBeTruthy(); expect($('#medView')).toBeNull()
  })
  it('from Medical, the SANS tab goes to the SANS calendar and the Inputs tab to the Inputs tab — never back to where Medical was opened from', async () => {
    await click('#inSansMode'); await click('#inMedBtn'); await click('#inMemberMode')
    expect(INPMODE).toBe('member'); expect($('#inpCal')).toBeTruthy()
    await click('#inMedBtn'); await click('#inSansMode')
    expect(INPMODE).toBe('sans'); expect(INPVIEW).not.toBe('med'); expect($('#sansCal')).toBeTruthy()
  })
  it('Medical is a tab, so it has no close cross of its own', async () => {
    await click('#inMedBtn')
    expect($('#medClose')).toBeNull()
  })
  it('the arrow keys move along the tabs, and round the ends', async () => {
    const key = async (id: string, k: string) => act(async () => { $(id)!.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true })) })
    await key('#inMemberMode', 'ArrowRight'); expect(selected()).toEqual(['inSansMode'])
    await key('#inSansMode', 'ArrowRight'); expect(selected()).toEqual(['inMedBtn'])
    await key('#inMedBtn', 'ArrowRight'); expect(selected()).toEqual(['inMemberMode'])
    await key('#inMemberMode', 'ArrowLeft'); expect(selected()).toEqual(['inMedBtn'])
    expect(document.activeElement?.id, 'the keyboard goes with the tab it chose').toBe('inMedBtn')
  })
  it('only the selected tab is a tab stop', () => {
    expect(tabs().map(t => t.tabIndex)).toEqual([0, -1, -1])
  })
})

describe('under the Inputs tab, one small switch: Calendar | List', () => {
  it('shows on the Inputs tab only, and says which is up', async () => {
    expect(shown('#inCalBtn') && shown('#inListBtn')).toBe(true)
    expect($('#inCalBtn')!.getAttribute('aria-pressed')).toBe('true')
    await click('#inListBtn')
    expect($('#inListBtn')!.getAttribute('aria-pressed')).toBe('true')
    expect($('#inpCal')).toBeNull(); expect(shown('#inBody')).toBe(true)
    await click('#inSansMode')
    expect(shown('#inCalBtn') || shown('#inListBtn'), 'the SANS calendar has no list (D620)').toBe(false)
    await click('#inMedBtn')
    expect(shown('#inCalBtn') || shown('#inListBtn')).toBe(false)
  })
  it('the Inputs tab comes back on whichever of the two he left it on', async () => {
    await click('#inListBtn'); await click('#inMedBtn'); await click('#inMemberMode')
    expect(shown('#inBody'), 'left on the List, back on the List').toBe(true)
    await click('#inCalBtn'); await click('#inSansMode'); await click('#inMemberMode')
    expect($('#inpCal'), 'left on the calendar, back on the calendar').toBeTruthy()
  })
  it('the calendar carries no "List" button of its own, and no "Select dates" (D626)', () => {
    expect($('#icClose')).toBeNull()
    expect($('#icSelectDates')).toBeNull()
  })
  it('the filters are the Inputs tab’s: not drawn on SANS or Medical', async () => {
    expect(shown('#inFSearch')).toBe(true)
    await click('#inSansMode'); expect(shown('#inFSearch')).toBe(false)
    await click('#inMedBtn'); expect(shown('#inFSearch')).toBe(false); expect(shown('#inFiltersBtn')).toBe(false)
  })
})

describe('a calendar tab takes the screen, no more (D664)', () => {
  const on = () => document.body.classList.contains('in-cal')
  it('while a month is up the page drops its foot room; the List and Medical keep it; leaving the page puts it back', async () => {
    expect(on(), 'the Inputs month').toBe(true)
    await click('#inListBtn'); expect(on(), 'the List is an ordinary long page').toBe(false)
    await click('#inSansMode'); expect(on(), 'the SANS month').toBe(true)
    await click('#inMedBtn'); expect(on(), 'Medical').toBe(false)
    await click('#inMemberMode'); await click('#inCalBtn'); expect(on()).toBe(true)
    await act(async () => { root.render(<></>) })
    expect(on(), 'gone with the page').toBe(false)
  })
})

describe('the gear (D635, D639)', () => {
  it('an admin has it on the Inputs tab — the app’s own cog, never a drawing — and it opens the Inputs calendar’s settings', async () => {
    const gear = $('[data-testid="in-gear"]')!
    expect(gear.textContent).toBe('⚙'); expect(gear.querySelector('svg')).toBeNull()
    expect(gear.getAttribute('aria-label')).toBe('Inputs calendar settings')
    expect(INPSET).toBe(false)
    await click('[data-testid="in-gear"]')
    expect(INPSET).toBe(true)
    await act(async () => { setInpSet(false) })
  })
  it('it is on the List too, and not on the SANS or Medical tabs (the SANS calendar has its own)', async () => {
    await click('#inListBtn'); expect(shown('[data-testid="in-gear"]')).toBe(true)
    await click('#inSansMode'); expect(shown('[data-testid="in-gear"]')).toBe(false)
    await click('#inMedBtn'); expect(shown('[data-testid="in-gear"]')).toBe(false)
  })
  it('a member has no gear', async () => {
    await act(async () => { setSession({ user: 'b', role: 'member' }); notify() })
    expect($('[data-testid="in-gear"]')).toBeNull()
  })
})

describe('SANS availability is filed on the SANS calendar and nowhere else (D620)', () => {
  const SANS = 'SANS Availability'
  it('the List’s add form does not offer it, nor its filter', async () => {
    await click('#inListBtn')
    expect(options('#inType').length).toBeGreaterThan(5)
    expect(options('#inType')).not.toContain(SANS)
    expect(options('#inFType')).not.toContain(SANS)
    expect($('#inSans'), 'no Fly / OFT / AMT ticks on the List’s form').toBeNull()
  })
  /* the List's edit in place is gone (D718, 10 Oct 26): its row opens the input's window, which is asked instead */
  it('the window a List row opens does not offer it', async () => {
    await click('#inListBtn')
    const row = INPUTS.find((r: any) => r.type === 'Meeting' || r.type === 'Appointment' || r.type === 'Personal')!
    expect(row, 'the demo data has an ordinary commitment').toBeTruthy()
    /* every date, so the row is on the List whatever today's window is */
    await click('#inRangeBtn'); await click('#inRangeAll')
    await click(`#inBody [data-iid="${row.iid}"] [data-testid="in-open"]`)
    expect(INPEDIT && INPEDIT.iid, 'the row opened its window').toBe(row.iid)
    expect(options('#inpEditType').length).toBeGreaterThan(5)
    expect(options('#inpEditType')).not.toContain(SANS)
  })
  it('"+ Input" on the Inputs calendar does not offer it', async () => {
    await act(async () => { $('[data-icday="2026-10-23"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })) })
    await click('#icPopAdd')
    expect(INPEDIT && INPEDIT._new).toBe(true)
    expect(options('#inpEditType').length).toBeGreaterThan(5)
    expect(options('#inpEditType')).not.toContain(SANS)
  })
  it('an input already filed cannot be turned into SANS availability', async () => {
    const row = INPUTS.find((r: any) => r.type === 'Meeting' || r.type === 'Appointment' || r.type === 'Personal')!
    await act(async () => { setInpEdit(row); notify() })
    expect(options('#inpEditType').length).toBeGreaterThan(5)
    expect(options('#inpEditType')).not.toContain(SANS)
  })
  it('a SANS commitment’s own editor still shows what it is', async () => {
    const row: any = { iid: 'tabs-sans', person: Object.keys((await import('../engine/people')).PEOPLE)[0], type: SANS, date: 'Oct 9', yr: 2026, allday: true, sans: { f: true } }
    INPUTS.push(row)
    await act(async () => { setInpEdit(row); notify() })
    expect(options('#inpEditType')).toContain(SANS)
  })
})

/* THE SWITCH DOES NOT MOVE UNDER THE FINGER (owner D687, 9 Oct 26 — from his iPhone: "So weird that the calander/list
   button jumps to the left when I click on the list. Can it remain in the same position?"; his standing rule of 2 Sep 26:
   a control tapped repeatedly must not move). It jumped because the month's arrows and "Today" stood BEFORE it on the
   Calendar and are not there on the List. It is the first thing after the tabs on both. */
describe('the Calendar | List switch keeps its place (D687)', () => {
  const afterTabs = () => $('.inputs-tabs')!.nextElementSibling as HTMLElement
  it('on the Calendar it comes straight after the tabs — the month’s arrows and "Today" after it', () => {
    expect(afterTabs().className).toContain('inputs-views')
    expect($('.inputs-views')!.compareDocumentPosition($('.ic-nav')!) & Node.DOCUMENT_POSITION_FOLLOWING, 'the arrows follow the switch').toBeTruthy()
    expect($('.inputs-views')!.parentElement, 'on the one row').toBe($('.ic-nav')!.parentElement)
  })
  it('on the List it is in the same place: straight after the tabs', async () => {
    await click('#inListBtn')
    expect(afterTabs().className).toContain('inputs-views')
    await click('#inCalBtn')
    expect(afterTabs().className).toContain('inputs-views')
  })
})
