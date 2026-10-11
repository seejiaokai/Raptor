// @vitest-environment jsdom
/* "SEVERAL PEOPLE" TAKES ALL AVAIL / ALL ([ALL-AVAIL-AS-MEMBER] step 3, 12 Oct 26; the plan
   docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.5 "The picker"). His rulings:
   D750 — "'Several people' takes ALL AVAIL / ALL, so the puck is one of the input's own people";
   D753 — "it is offered only where the input is a single day; and an input takes ALL or ALL AVAIL, never both" — and
           its reading (2): on a longer input the picker does not let it be picked and says why;
   D712, D713 — the six kinds; D702 — members may choose it too; D656 — the picker; D726 — few words.

   UNTIL THIS STEP the two placeholders were offered in the ONE-PERSON list only, and "Several people" refused one with
   "ALL AVAIL is filed on its own" (ui/placeholderdoors.test.tsx pinned that). Now the two stand as pucks of their own
   above the groups: one of them may be picked beside the people; where the input is longer than a day, or not one of
   the six kinds, they are drawn greyed with the reason under them. Nothing is substituted for what he picked: a
   placeholder already picked when the dates or the kind change stays shown, with the sentence and one press back. */
import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { PeoplePick, pickProblem, PLACEHOLDER_HEADING } from './PeoplePick'
import { initStore, setSession } from '../state/store'
import { setMe } from '../state/auth'
import { PEOPLE } from '../engine/people'
import { placeholderProblem } from '../engine/inputs'
import { storeBackend } from '../engine/hooks'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement, root: Root
const seed = JSON.stringify(PEOPLE)
const $ = (sel: string) => host.querySelector(sel) as HTMLElement | null
const tid = (id: string) => $(`[data-testid="${id}"]`)
const click = async (el: Element | null) => { expect(el, 'click target').toBeTruthy(); await act(async () => { (el as HTMLElement).click() }) }
const ph = (id: string) => $(`[data-ph="${id}"]`) as HTMLButtonElement
const phGroup = () => $('[data-ppgroup="ph"]')

let got: { people: string[]; several: boolean }
/* the window hands the picker its draft's own answer to "may this input hold a placeholder?" — the one body, asked of
   the kind and the dates (ui/inputedit.tsx) */
const why = (type: string, endDate?: string) => (id: string) => placeholderProblem({ people: [{ p: id }], type, date: 'Jul 15', endDate, yr: 2026 })
function Harness({ people, several, type, endDate, sansOnly }: { people: string[]; several: boolean; type: string; endDate?: string; sansOnly?: boolean }) {
  const [st, setSt] = useState({ people, several })
  got = st
  return <PeoplePick people={st.people} several={st.several} type={type} sansOnly={sansOnly} phWhy={why(type, endDate)}
    onChange={(p, s) => setSt({ people: p, several: s })} />
}
const mount = async (p: { people: string[]; several?: boolean; type?: string; endDate?: string; sansOnly?: boolean }) =>
  act(async () => { root.render(<Harness people={p.people} several={p.several !== false} type={p.type || 'Meeting'} endDate={p.endDate} sansOnly={p.sansOnly} />) })

beforeEach(() => {
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, JSON.parse(seed))
  const mem = new Map<string, string>()
  storeBackend.impl = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), keys: () => [...mem.keys()] }
  initStore(); setSession({ user: 'stiff', role: 'admin' }); setMe('stiff')
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
})
afterEach(async () => { await act(async () => { root.unmount() }); host.remove() })

describe('"Several people" offers ALL AVAIL and ALL — one of them (D750, D753)', () => {
  it('the two stand as pucks of their own, above the groups, under the heading that says what both mean', async () => {
    await mount({ people: ['bane', 'pike'] })
    const g = phGroup()!
    expect(g, 'a group of their own').toBeTruthy()
    expect(g.querySelector('b')!.textContent).toBe(PLACEHOLDER_HEADING)
    expect([...g.querySelectorAll('[data-ph]')].map(b => b.getAttribute('data-ph'))).toEqual(['allavail', 'all'])
    expect(g.compareDocumentPosition($('[data-ppgroup="pilots"]')!) & Node.DOCUMENT_POSITION_FOLLOWING, 'before Pilots').toBeTruthy()
    expect(ph('allavail').getAttribute('aria-label')).toBe('ALL AVAIL')
    expect(ph('allavail').querySelector('.puck'), 'the schedule\'s own puck').toBeTruthy()
    expect(ph('allavail').disabled).toBe(false)
    expect(tid('pp-phwhy'), 'nothing to say while it may be picked').toBeNull()
    expect(tid('pp-why')).toBeNull()
  })
  it('a press picks ALL AVAIL beside the people; a second press lets it go', async () => {
    await mount({ people: ['bane', 'pike'] })
    await click(ph('allavail'))
    expect(got.people).toEqual(['bane', 'pike', 'allavail'])
    expect(ph('allavail').getAttribute('aria-pressed')).toBe('true')
    expect(tid('pp-why'), 'and nothing is wrong with that').toBeNull()
    await click(ph('allavail'))
    expect(got.people).toEqual(['bane', 'pike'])
  })
  it('never both: picking ALL lets ALL AVAIL go', async () => {
    await mount({ people: ['bane', 'allavail'] })
    await click(ph('all'))
    expect(got.people).toEqual(['bane', 'all'])
    expect(ph('allavail').getAttribute('aria-pressed')).toBe('false')
  })
  it('the count is of the people, and the placeholder is said beside it', async () => {
    await mount({ people: ['bane', 'pike', 'allavail'] })
    expect(tid('pp-count')!.textContent).toBe('2 picked + ALL AVAIL')
    await click($('[data-pp="bane"]')); await click($('[data-pp="pike"]'))
    expect(got.people, 'the people may all go: ALL AVAIL is still somebody to file it for').toEqual(['allavail'])
    expect(tid('pp-count')!.textContent).toBe('ALL AVAIL')
    await click(ph('allavail'))
    expect(got.people, 'but the last one picked is never let go by a press').toEqual(['allavail'])
  })
  it('a drag across the people does not sweep the placeholders up (D685 is about the people)', async () => {
    await mount({ people: ['bane'] })
    expect(ph('allavail').hasAttribute('data-pp')).toBe(false)
  })
  it('back to one person keeps the first one picked, as ever', async () => {
    await mount({ people: ['bane', 'allavail'] })
    await click(tid('pp-several'))
    expect(got).toEqual({ people: ['bane'], several: false })
  })
  it('ALL AVAIL chosen in the one-person list, then "Several people" switched on: it stays picked, and people are added beside it', async () => {
    await mount({ people: ['allavail'], several: false })
    await click(tid('pp-several'))
    expect(got).toEqual({ people: ['allavail'], several: true })
    expect(tid('pp-why'), 'no longer refused').toBeNull()
    await click($('[data-pp="bane"]'))
    expect(got.people).toEqual(['allavail', 'bane'])
  })
  it('the SANS calendar\'s picker offers none', async () => {
    await mount({ people: [Object.keys(PEOPLE).find(id => PEOPLE[id].san)!], sansOnly: true, type: 'SANS Availability' })
    expect(phGroup()).toBeNull()
  })
})

describe('where the input cannot take one, the two are greyed and the reason is under them (D753 reading 2)', () => {
  it('an input longer than a day', async () => {
    await mount({ people: ['bane', 'pike'], endDate: 'Jul 17' })
    expect(ph('allavail').disabled).toBe(true)
    expect(ph('all').disabled).toBe(true)
    expect(tid('pp-phwhy')!.textContent).toBe('ALL AVAIL is for one day')
    await click(ph('allavail'))
    expect(got.people, 'a press does nothing').toEqual(['bane', 'pike'])
  })
  it('a kind that is not one of the six', async () => {
    await mount({ people: ['bane', 'pike'], type: 'OD' })
    expect(ph('allavail').disabled).toBe(true)
    expect(tid('pp-phwhy')!.textContent).toBe('ALL AVAIL is for Training, Meeting, Appointment, Duty, Event and Other')
  })
  it('one already picked when the dates grew stays shown and lit — with the sentence, and one press that takes it out', async () => {
    await mount({ people: ['bane', 'pike', 'allavail'], endDate: 'Jul 17' })
    expect(ph('allavail').getAttribute('aria-pressed'), 'nothing is substituted for what he picked').toBe('true')
    expect(ph('allavail').disabled, 'and it can be let go by its own press').toBe(false)
    expect(tid('pp-why')!.textContent).toContain('ALL AVAIL is for one day')
    expect(tid('pp-phwhy'), 'said once, not twice').toBeNull()
    expect(tid('pp-fix')!.textContent).toBe('Take ALL AVAIL out')
    await click(tid('pp-fix'))
    expect(got).toEqual({ people: ['bane', 'pike'], several: true })
  })
})

describe('pickProblem — the sentence the window\'s Save refuses with', () => {
  it('a placeholder beside people is no problem where the input may hold one', () => {
    expect(pickProblem(['bane', 'allavail'], true, 'Meeting', why('Meeting'))).toBeNull()
    expect(pickProblem(['allavail'], true, 'Meeting', why('Meeting'))).toBeNull()
  })
  it('longer than a day, or another kind: the one body\'s sentence', () => {
    expect(pickProblem(['bane', 'allavail'], true, 'Meeting', why('Meeting', 'Jul 17'))!.why).toBe('ALL AVAIL is for one day')
    expect(pickProblem(['bane', 'all'], true, 'OD', why('OD'))!.why).toBe('ALL is for Training, Meeting, Appointment, Duty, Event and Other')
  })
  it('both of them — however it came about: "This input already has ALL AVAIL"', () => {
    expect(pickProblem(['bane', 'allavail', 'all'], true, 'Meeting', why('Meeting'))!.why).toBe('This input already has ALL AVAIL')
  })
})
