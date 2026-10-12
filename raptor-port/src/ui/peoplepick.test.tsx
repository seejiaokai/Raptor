// @vitest-environment jsdom
/* THE PEOPLE PICKER (owner D656, D659, D655, D658 — 7 Oct 26; the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.13, "The picker").

   D656: "hybrid" — one person from an A-to-Z list by default, as today; a switch for several people then shows the
   pucks in groups — Pilots, WSOs and SANS — each A to Z, drawn compact. D659: a fourth heading, "Personnel", for ground
   crew, shown only where the roster holds ground crew. D655: a member files for others only duties and commitments;
   D658: never SANS availability. The plan: switching back to one person keeps the first one picked; NOTHING is ever
   substituted for what he picked — where a change of kind leaves people picked that he may not file that kind for, the
   picker keeps them shown, says why in one line, and one press offers the correction.

   SINCE STEP 3 OF THE ONE-RULE BUILD (12 Oct 26 — owner D750: "'Several people' takes ALL AVAIL / ALL, so the puck is one
   of the input's own people"; D753: one day, never both; the plan docs/superpowers/plans/2026-10-11-one-rule-plan.md
   §4.5 "The picker") the two placeholders stand in "Several people" too, as pucks of their own above the groups. The
   builder's cases for that are ui/phpick.test.tsx (the picker handed the window's own answer about the dates). ONE case
   of this file pinned the old rule — "the placeholder pucks are never offered" — and is re-expressed where it stood;
   the cases added at the foot are what phpick does not ask: the picker as THIS file mounts it (the kind alone, no
   dates), "All" on a heading and a drag with a placeholder picked, a member, and a reader. */
import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { PeoplePick, pickProblem } from './PeoplePick'
import { initStore, setSession } from '../state/store'
import { setMembersFile } from '../state/memberfile'
import { me } from '../state/perms'
import { setMe } from '../state/auth'
import { PEOPLE } from '../engine/people'
import { storeBackend } from '../engine/hooks'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement, root: Root
const seed = JSON.stringify(PEOPLE)
const $ = (sel: string) => host.querySelector(sel) as HTMLElement | null
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const tid = (id: string) => $(`[data-testid="${id}"]`)
const click = async (el: Element | null) => { expect(el, 'click target').toBeTruthy(); await act(async () => { (el as HTMLElement).click() }) }
const live = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special)
const cs = (id: string) => PEOPLE[id].cs as string
const az = (ids: string[]) => [...ids].sort((a, b) => cs(a).localeCompare(cs(b), undefined, { sensitivity: 'base' }))
const pilots = () => az(live().filter(id => !PEOPLE[id].san && !PEOPLE[id].pers && PEOPLE[id].seat !== 'RCP'))
const wsos = () => az(live().filter(id => !PEOPLE[id].san && !PEOPLE[id].pers && PEOPLE[id].seat === 'RCP'))
const sans = () => az(live().filter(id => PEOPLE[id].san))
const ground = () => az(live().filter(id => PEOPLE[id].pers && !PEOPLE[id].san))
const group = (k: string) => $(`[data-ppgroup="${k}"]`)
const pucksIn = (k: string) => [...(group(k)?.querySelectorAll('[data-pp]') || [])].map(b => b.getAttribute('data-pp')!)
const puckBtn = (id: string) => $(`[data-pp="${id}"]`)!

let got: { people: string[]; several: boolean }
/* `readOnly` and `phWhy` are passed only by the cases added for step 3 (at the foot): left out, the picker is mounted
   exactly as every older case of this file mounts it */
type Extra = { readOnly?: boolean; phWhy?: (id: string) => string }
function Harness({ people, several, type, sansOnly, readOnly, phWhy }: { people: string[]; several: boolean; type: string; sansOnly?: boolean } & Extra) {
  const [st, setSt] = useState({ people, several })
  got = st
  return <PeoplePick people={st.people} several={st.several} type={type} sansOnly={sansOnly} readOnly={readOnly} phWhy={phWhy}
    onChange={(p, s) => setSt({ people: p, several: s })} />
}
/* the member Ranger (`bane`); the admin is Saber (`stiff`) */
const asMember = () => { setSession({ user: 'bane', role: 'main' }); setMe('bane') }
const mount = async (p: { people: string[]; several?: boolean; type?: string; sansOnly?: boolean } & Extra) =>
  act(async () => { root.render(<Harness people={p.people} several={!!p.several} type={p.type || 'Meeting'} sansOnly={p.sansOnly} readOnly={p.readOnly} phWhy={p.phWhy} />) })
/* the two placeholder pucks of "Several people" — pucks of their own (`data-ph`), never a person's (`data-pp`) */
const phBtn = (id: string) => $(`[data-ph="${id}"]`) as HTMLButtonElement | null

beforeEach(() => {
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, JSON.parse(seed))
  const mem = new Map<string, string>()
  storeBackend.impl = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), keys: () => [...mem.keys()] }
  initStore(); setSession({ user: 'stiff', role: 'admin' }); setMe('stiff')
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
})
afterEach(async () => { await act(async () => { root.unmount() }); host.remove() })

describe('one person — the default, as today (D656)', () => {
  it('an admin sees the A-to-Z list of everyone, with no pucks until he asks for several', async () => {
    await mount({ people: [pilots()[0]] })
    const sel = $('#inpEditPerson') as HTMLSelectElement
    expect(sel, 'the list').toBeTruthy()
    /* since D700 (9 Oct 26) a duty or commitment also offers the two placeholders, in a group of their own above the
       names (placeholderdoors.test.tsx); the names are the A-to-Z list they always were */
    expect([...sel.options].map(o => o.value)).toEqual(['allavail', 'all', ...az(live())])
    expect([...sel.querySelectorAll(':scope > option')].map(o => (o as HTMLOptionElement).value), 'the names themselves').toEqual(az(live()))
    expect(sel.value).toBe(pilots()[0])
    expect($$('[data-pp]')).toHaveLength(0)
    expect(tid('pp-several')!.getAttribute('aria-checked')).toBe('false')
  })
  it('for a leave the list is the names alone — no placeholder is offered (D700: duties and commitments only)', async () => {
    await mount({ people: [pilots()[0]], type: 'LL' })
    expect([...($('#inpEditPerson') as HTMLSelectElement).options].map(o => o.value)).toEqual(az(live()))
  })
  it('the SANS calendar’s picker never offers a placeholder', async () => {
    await mount({ people: [sans()[0]], type: 'Meeting', sansOnly: true })
    expect([...($('#inpEditPerson') as HTMLSelectElement).options].some(o => PEOPLE[o.value].special)).toBe(false)
  })
  it('picking another man from the list files it for him', async () => {
    await mount({ people: [pilots()[0]] })
    const sel = $('#inpEditPerson') as HTMLSelectElement
    await act(async () => { sel.value = wsos()[1]; sel.dispatchEvent(new Event('change', { bubbles: true })) })
    expect(got).toEqual({ people: [wsos()[1]], several: false })
  })
  /* A RULING CHANGED HALF OF THIS CASE (owner D750, D753 — step 3 of the one-rule build). It was 'an archived man and the
     placeholder pucks are never offered'. The archived man: the rule survives. The placeholder pucks: "'Several people'
     takes ALL AVAIL / ALL" — they ARE offered now, for a kind that may carry one. What still holds, and is what the
     old assertion really guarded: neither is ever one of the PEOPLE's pucks (`data-pp`) — so no heading lists one, no
     "All" picks one and no drag sweeps one up. */
  it('an archived man is never offered; the placeholders are — as pucks of their own, never among the people\'s (D750, D753)', async () => {
    const gone = pilots()[2]
    PEOPLE[gone].archived = true
    await mount({ people: [pilots()[0]], several: true })
    expect(puckBtn(gone)).toBeNull()
    expect($$('[data-pp]').some(b => PEOPLE[b.getAttribute('data-pp')!].special), 'not among the people').toBe(false)
    expect($$('[data-ph]').map(b => b.getAttribute('data-ph')), 'offered, both, in a group of their own').toEqual(['allavail', 'all'])
    expect(group('ph')!.contains(phBtn('allavail'))).toBe(true)
    for (const k of ['pilots', 'wsos', 'sans', 'personnel']) expect(group(k)!.querySelector('[data-ph]'), k).toBeNull()
    expect(phBtn('allavail')!.disabled, 'a Meeting may carry one').toBe(false)
  })
})

describe('"Several people" — the pucks in groups (D656, D659)', () => {
  it('the switch shows Pilots, WSOs and SANS, each A to Z — a SANS man under SANS only', async () => {
    await mount({ people: [pilots()[0]] })
    await click(tid('pp-several'))
    expect(got.several).toBe(true)
    expect(tid('pp-several')!.getAttribute('aria-checked')).toBe('true')
    expect(pucksIn('pilots')).toEqual(pilots())
    expect(pucksIn('wsos')).toEqual(wsos())
    expect(pucksIn('sans')).toEqual(sans())
    expect(sans().length, 'the demo roster holds SANS people').toBeGreaterThan(0)
    for (const s of sans()) expect($$(`[data-pp="${s}"]`), 'once').toHaveLength(1)
    expect($('#inpEditPerson'), 'the one-person list has gone').toBeNull()
  })
  it('the man already picked stays picked — lit; the rest are dimmed', async () => {
    await mount({ people: [wsos()[0]] })
    await click(tid('pp-several'))
    expect(got.people).toEqual([wsos()[0]])
    expect(puckBtn(wsos()[0]).getAttribute('aria-pressed')).toBe('true')
    expect(puckBtn(pilots()[0]).getAttribute('aria-pressed')).toBe('false')
  })
  it('each person is the schedule’s own puck, and a button that says who it is', async () => {
    await mount({ people: [pilots()[0]], several: true })
    const b = puckBtn(sans()[0])
    expect(b.tagName).toBe('BUTTON')
    expect(b.getAttribute('aria-label')).toBe(cs(sans()[0]))
    expect(b.querySelector('.puck'), 'ui/html.ts puck()').toBeTruthy()
    expect(b.querySelector('.puck')!.hasAttribute('tabindex'), 'one stop for the keyboard: the button').toBe(false)
  })
  it('a press picks a man, a second press lets him go, and a line counts them', async () => {
    await mount({ people: [pilots()[0]], several: true })
    await click(puckBtn(wsos()[0])); await click(puckBtn(sans()[0]))
    expect(got.people).toEqual([pilots()[0], wsos()[0], sans()[0]])
    expect(tid('pp-count')!.textContent).toBe('3 picked')
    await click(puckBtn(wsos()[0]))
    expect(got.people).toEqual([pilots()[0], sans()[0]])
    expect(tid('pp-count')!.textContent).toBe('2 picked')
  })
  it('"All" on Pilots picks every pilot and leaves the others as they were; a second press clears that group', async () => {
    await mount({ people: [wsos()[0]], several: true })
    await click(tid('pp-all-pilots'))
    expect(new Set(got.people)).toEqual(new Set([wsos()[0], ...pilots()]))
    expect(tid('pp-all-pilots')!.getAttribute('aria-pressed')).toBe('true')
    await click(tid('pp-all-pilots'))
    expect(got.people).toEqual([wsos()[0]])
    await click(tid('pp-all-wsos'))
    expect(new Set(got.people)).toEqual(new Set(wsos()))
  })
  it('Personnel — ground crew — is a fourth heading with its own "All" (D659)', async () => {
    expect(ground().length, 'the demo roster holds ground crew').toBeGreaterThan(0)
    await mount({ people: [pilots()[0]], several: true })
    expect(group('personnel')!.textContent).toContain('Personnel')
    expect(pucksIn('personnel')).toEqual(ground())
    await click(tid('pp-all-personnel'))
    expect(got.people).toEqual([pilots()[0], ...ground()])
  })
  it('a roster with no ground crew has no such heading (D656: the three he named)', async () => {
    for (const id of ground()) delete (PEOPLE as any)[id]
    await mount({ people: [pilots()[0]], several: true })
    expect(group('personnel')).toBeNull()
    expect(group('pilots')).toBeTruthy(); expect(group('wsos')).toBeTruthy(); expect(group('sans')).toBeTruthy()
  })
  it('back to one person keeps the FIRST one picked (D656, reading 4)', async () => {
    await mount({ people: [wsos()[1], pilots()[0], sans()[0]], several: true })
    await click(tid('pp-several'))
    expect(got).toEqual({ people: [wsos()[1]], several: false })
    expect(($('#inpEditPerson') as HTMLSelectElement).value).toBe(wsos()[1])
  })
  it('the last man is not let go by a press: an input is for somebody', async () => {
    await mount({ people: [pilots()[0]], several: true })
    await click(puckBtn(pilots()[0]))
    expect(got.people).toEqual([pilots()[0]])
  })
})

describe('the SANS calendar’s "+ Commitment" — SANS people only (D658)', () => {
  it('an admin’s list and pucks hold the SANS people and nobody else', async () => {
    await mount({ people: [sans()[0]], type: 'SANS Availability', sansOnly: true })
    expect([...($('#inpEditPerson') as HTMLSelectElement).options].map(o => o.value)).toEqual(sans())
    await click(tid('pp-several'))
    expect($$('[data-pp]').map(b => b.getAttribute('data-pp'))).toEqual(sans())
    expect(group('pilots')).toBeNull(); expect(group('wsos')).toBeNull(); expect(group('personnel')).toBeNull()
  })
})

describe('where the switch shows, and what it says when it may not be used', () => {
  it('an admin gets no switch on a medical entry or an upchit — each needs its own document (D655, reading 4)', async () => {
    await mount({ people: [pilots()[0]], type: 'ATT C' })
    expect(tid('pp-several')).toBeNull()
    expect($('#inpEditPerson'), 'he still picks the one man').toBeTruthy()
  })
  it('a member, on a duty or commitment, gets the list and the switch — starting on himself', async () => {
    asMember()
    await mount({ people: [me()!], type: 'Meeting' })
    expect(($('#inpEditPerson') as HTMLSelectElement).value).toBe(me())
    expect(tid('pp-several')).toBeTruthy()
  })
  it('a member, on leave: his own callsign as a value — no list, no switch (D655)', async () => {
    asMember()
    await mount({ people: [me()!], type: 'LL' })
    expect($('#inpEditPerson')).toBeNull()
    expect($('#inpEditPersonFixed')!.textContent).toBe(cs(me()!))
    expect(tid('pp-several')).toBeNull()
  })
  it('a member with the setting switched off files for himself only', async () => {
    setMembersFile(false)
    asMember()
    await mount({ people: [me()!], type: 'Meeting' })
    expect($('#inpEditPerson')).toBeNull()
    expect(tid('pp-several')).toBeNull()
  })
  it('a member never files SANS availability for another man (D658)', async () => {
    asMember()
    await mount({ people: [me()!], type: 'SANS Availability', sansOnly: true })
    expect($('#inpEditPerson')).toBeNull()
    expect(tid('pp-several')).toBeNull()
  })
  it('a change of kind under several people keeps them shown, says why, and one press corrects it — a member', async () => {
    asMember()
    const other = pilots().find(p => p !== me())!
    await mount({ people: [me()!, other], several: true, type: 'LL' })
    expect(puckBtn(other).getAttribute('aria-pressed'), 'nothing is substituted').toBe('true')
    expect(tid('pp-why')!.textContent).toContain('You can file leave only for yourself')
    expect(pickProblem([me()!, other], true, 'LL')!.why).toBe('You can file leave only for yourself')
    expect(tid('pp-fix')!.textContent).toBe('File it for me only')
    await click(tid('pp-fix'))
    expect(got).toEqual({ people: [me()!], several: false })
    expect(tid('pp-why')).toBeNull()
  })
  it('ONE other man picked, then the kind turned to leave — a member: he stays shown, with the sentence and "File it for me only"', async () => {
    asMember()
    const other = pilots().find(p => p !== me())!
    await mount({ people: [other], type: 'LL' })
    expect($('#inpEditPersonFixed')!.textContent, 'nothing is substituted: it still says the man he picked').toBe(cs(other))
    expect(tid('pp-why')!.textContent).toContain('You can file leave only for yourself')
    await click(tid('pp-fix'))
    expect(got).toEqual({ people: [me()!], several: false })
  })
  it('the same for an admin who turns a group into a medical entry: "Keep <first> only"', async () => {
    const [a, b] = [pilots()[1], wsos()[0]]
    await mount({ people: [a, b], several: true, type: 'ATT C' })
    expect(tid('pp-why')!.textContent).toContain('one person at a time')
    expect(tid('pp-fix')!.textContent).toBe(`Keep ${cs(a)} only`)
    await click(tid('pp-fix'))
    expect(got).toEqual({ people: [a], several: false })
  })
  it('nothing to say while what is picked may be filed', async () => {
    await mount({ people: [pilots()[0], wsos()[0]], several: true, type: 'Meeting' })
    expect(tid('pp-why')).toBeNull()
    expect(pickProblem([pilots()[0], wsos()[0]], true, 'Meeting')).toBeNull()
  })
})


/* A DRAG PICKS EVERY PUCK IT PASSES (owner D685, 9 Oct 26 — from his iPhone, four pucks picked one tap at a time: "I should
   be able to drag to select multiple pucks"). The drag does what its FIRST puck does — begun on a man not picked it
   picks, begun on a picked man it lets go — and never lets the last man go. On a phone it starts SIDEWAYS: a finger
   moved up or down is the list being scrolled. jsdom has no layout, so "the puck under the point" is told to it here. */
describe('a drag across the pucks picks every one it passes (D685)', () => {
  const realFrom = document.elementFromPoint
  let row: string[] = []
  /* the pilots stand in one line, ten points each: the puck under a point is asked by its x */
  const lay = () => { row = pilots(); (document as any).elementFromPoint = (x: number, y: number) => (y > 40 ? host : puckBtn(row[Math.floor(x / 10)]) || host) }
  afterEach(() => { (document as any).elementFromPoint = realFrom })
  const at = (i: number) => i * 10 + 5
  const ptr = async (type: string, el: Element, x: number, y: number, pointerType = 'mouse') => act(async () => {
    const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 })
    Object.defineProperty(e, 'pointerType', { value: pointerType }); Object.defineProperty(e, 'pointerId', { value: 1 })
    el.dispatchEvent(e)
  })
  const drag = async (from: number, to: number, pointerType = 'mouse') => {
    const start = puckBtn(row[from])
    await ptr('pointerdown', start, at(from), 5, pointerType)
    const step = to >= from ? 1 : -1
    for (let i = from; i !== to + step; i += step) await ptr('pointermove', start, at(i) + (i === from ? 4 * step : 0), 5, pointerType)
    await ptr('pointerup', start, at(to), 5, pointerType)
    /* the click a browser sends after the release must not undo the first puck */
    await act(async () => { start.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })) })
  }
  it('a mouse dragged from one man to the fourth along: all four are picked, in the order passed', async () => {
    await mount({ people: [wsos()[0]], several: true }); lay()
    await drag(1, 4)
    expect(got.people).toEqual([wsos()[0], row[1], row[2], row[3], row[4]])
    expect(tid('pp-count')!.textContent).toBe('5 picked')
  })
  it('dragged back the other way it picks those too', async () => {
    await mount({ people: [wsos()[0]], several: true }); lay()
    await drag(4, 2)
    expect(got.people.slice(1).sort()).toEqual([row[2], row[3], row[4]].sort())
  })
  it('begun on a man already picked, the drag lets go of every one it passes — but never the last man', async () => {
    row = pilots()
    await mount({ people: [row[0], row[1], row[2]], several: true }); lay()
    await drag(0, 2)
    expect(got.people, 'an input is for somebody').toHaveLength(1)
  })
  it('a finger moved UP OR DOWN is the list being scrolled: nothing is picked', async () => {
    await mount({ people: [wsos()[0]], several: true }); lay()
    const start = puckBtn(row[1])
    await ptr('pointerdown', start, at(1), 5, 'touch')
    await ptr('pointermove', start, at(1) + 2, 30, 'touch')
    await ptr('pointermove', start, at(3), 30, 'touch')
    await ptr('pointerup', start, at(3), 30, 'touch')
    expect(got.people).toEqual([wsos()[0]])
  })
  it('a finger moved SIDEWAYS picks along the row', async () => {
    await mount({ people: [wsos()[0]], several: true }); lay()
    await drag(1, 3, 'touch')
    expect(got.people).toEqual([wsos()[0], row[1], row[2], row[3]])
  })
  it('a plain tap still picks one, and a tap straight after a drag is a tap', async () => {
    await mount({ people: [wsos()[0]], several: true }); lay()
    await drag(1, 2)
    await click(puckBtn(row[5]))
    expect(got.people).toEqual([wsos()[0], row[1], row[2], row[5]])
    await click(puckBtn(row[5]))
    expect(got.people).toEqual([wsos()[0], row[1], row[2]])
  })

  /* ADDED FOR STEP 3 (D750 — a placeholder is one of the picked; D685 is about the people's pucks). */
  it('with ALL AVAIL picked, a drag that lets go of every man it passes may let them ALL go: ALL AVAIL is still who it is for', async () => {
    row = pilots()
    await mount({ people: [row[0], row[1], 'allavail'], several: true }); lay()
    await drag(0, 1)
    expect(got.people, 'never an input for nobody — the placeholder holds it').toEqual(['allavail'])
    expect(tid('pp-count')!.textContent).toBe('ALL AVAIL')
  })
  it('a drag begun on a placeholder\'s puck picks nothing: it is not one of the pucks a drag runs across', async () => {
    await mount({ people: [wsos()[0]], several: true }); lay()
    const start = phBtn('allavail')!
    await ptr('pointerdown', start, at(1), 5)
    await ptr('pointermove', start, at(1) + 4, 5); await ptr('pointermove', start, at(3), 5)
    await ptr('pointerup', start, at(3), 5)
    expect(got.people).toEqual([wsos()[0]])
    /* …and its own press is still a press, straight after */
    await click(start)
    expect(got.people).toEqual([wsos()[0], 'allavail'])
  })
  it('a drag across the men leaves a picked placeholder as it was, and adds them after it', async () => {
    await mount({ people: ['allavail'], several: true }); lay()
    await drag(1, 3)
    expect(got.people).toEqual(['allavail', row[1], row[2], row[3]])
    expect(tid('pp-count')!.textContent).toBe('3 picked + ALL AVAIL')
  })
})

/* ADDED FOR STEP 3 OF THE ONE-RULE BUILD (12 Oct 26) — "SEVERAL PEOPLE" WITH A PLACEHOLDER, AS THIS FILE MOUNTS THE PICKER:
   the kind alone decides (no window is there to say the dates), a heading's "All", a member, and a reader. Owner D750,
   D753 ("an input takes ALL or ALL AVAIL, never both"), D702 ("members can choose too"), D655 reading 6 (one switch puts
   filing for others back to admins only), D712 / D713 (the six kinds). */
describe('"Several people" with ALL AVAIL / ALL — the kind, "All", a member, a reader (D750, D753, D702)', () => {
  const KINDS = 'ALL AVAIL is for Training, Meeting, Personal, Appointment, Duty, Event and Other'

  it('with no dates to go by, the KIND alone greys them: a leave for several shows both greyed with the reason; a Duty shows both live', async () => {
    await mount({ people: [pilots()[0], wsos()[0]], several: true, type: 'LL' })
    expect(phBtn('allavail')!.disabled).toBe(true)
    expect(phBtn('all')!.disabled).toBe(true)
    expect(tid('pp-phwhy')!.textContent).toBe(KINDS)
    await click(phBtn('allavail'))
    expect(got.people, 'a press on a greyed puck does nothing').toEqual([pilots()[0], wsos()[0]])
    await mount({ people: [pilots()[0], wsos()[0]], several: true, type: 'Duty' })
    expect(phBtn('allavail')!.disabled).toBe(false)
    expect(tid('pp-phwhy')).toBeNull()
  })

  it('"All" on a heading keeps a picked placeholder; clearing the heading that holds every man picked leaves the placeholder alone', async () => {
    await mount({ people: ['allavail'], several: true })
    await click(tid('pp-all-pilots'))
    expect(got.people).toEqual(['allavail', ...pilots()])
    expect(tid('pp-count')!.textContent).toBe(`${pilots().length} picked + ALL AVAIL`)
    expect(phBtn('allavail')!.getAttribute('aria-pressed')).toBe('true')
    await click(tid('pp-all-pilots'))
    expect(got.people, 'the pilots go; ALL AVAIL is still who it is for').toEqual(['allavail'])
    expect(tid('pp-count')!.textContent).toBe('ALL AVAIL')
  })

  it('"All" never picks a placeholder: every heading pressed, and neither of the two is in the pick', async () => {
    await mount({ people: [pilots()[0]], several: true })
    for (const k of ['pilots', 'wsos', 'personnel']) await click(tid('pp-all-' + k))
    expect(got.people.some(p => PEOPLE[p].special)).toBe(false)
    expect(tid('pp-count')!.textContent).toBe(`${got.people.length} picked`)
  })

  it('the other placeholder pressed takes the first one\'s place and keeps its people — never both (D753)', async () => {
    await mount({ people: [pilots()[0], 'all', wsos()[0]], several: true })
    await click(phBtn('allavail'))
    expect(got.people).toEqual([pilots()[0], wsos()[0], 'allavail'])
    expect(phBtn('all')!.getAttribute('aria-pressed')).toBe('false')
    expect(tid('pp-count')!.textContent).toBe('2 picked + ALL AVAIL')
  })

  it('both of them picked, however that came about: the line says "This input already has ALL AVAIL" and one press takes the second out', async () => {
    await mount({ people: [pilots()[0], 'allavail', 'all'], several: true })
    expect(tid('pp-why')!.textContent).toContain('This input already has ALL AVAIL')
    expect(tid('pp-fix')!.textContent).toBe('Take ALL out')
    await click(tid('pp-fix'))
    expect(got).toEqual({ people: [pilots()[0], 'allavail'], several: true })
    expect(tid('pp-why')).toBeNull()
  })

  it('back to one person from ALL AVAIL and people, ALL AVAIL picked first: the one-person list shows ALL AVAIL', async () => {
    await mount({ people: ['allavail', pilots()[0], wsos()[0]], several: true })
    await click(tid('pp-several'))
    expect(got).toEqual({ people: ['allavail'], several: false })
    expect(($('#inpEditPerson') as HTMLSelectElement).value).toBe('allavail')
  })

  it('a MEMBER, the members\' switch on: he is offered both, and picks one beside himself and another man (D702)', async () => {
    asMember()
    const other = pilots().find(p => p !== me())!
    await mount({ people: [me()!, other], several: true, type: 'Meeting' })
    expect(phBtn('allavail')!.disabled).toBe(false)
    await click(phBtn('allavail'))
    expect(got.people).toEqual([me()!, other, 'allavail'])
    expect(tid('pp-why'), 'nothing is wrong with that').toBeNull()
    expect(pickProblem([me()!, other, 'allavail'], true, 'Meeting')).toBeNull()
  })

  it('a MEMBER, the kind turned to leave under himself, another man and ALL AVAIL: the placeholder\'s own sentence is said first, with its press', async () => {
    asMember()
    const other = pilots().find(p => p !== me())!
    await mount({ people: [me()!, other, 'allavail'], several: true, type: 'LL' })
    expect(phBtn('allavail')!.getAttribute('aria-pressed'), 'nothing is substituted').toBe('true')
    expect(tid('pp-why')!.textContent).toContain(KINDS)
    expect(tid('pp-fix')!.textContent).toBe('Take ALL AVAIL out')
    await click(tid('pp-fix'))
    /* …and then the next thing wrong with what is left: leave is filed for himself only (D655) */
    expect(got.people).toEqual([me()!, other])
    expect(tid('pp-why')!.textContent).toContain('You can file leave only for yourself')
    expect(tid('pp-fix')!.textContent).toBe('File it for me only')
  })

  it('a MEMBER, the switch turned off under a pick of himself and ALL AVAIL: it stays shown, the line says filing for others is off, and one press files it for him only (D655 reading 6)', async () => {
    setMembersFile(false)                 // the switch is an admin's: turned off before the member signs in
    asMember()
    await mount({ people: [me()!, 'allavail'], several: true, type: 'Meeting' })
    expect(phBtn('allavail')!.getAttribute('aria-pressed')).toBe('true')
    expect(tid('pp-why')!.textContent).toContain('Filing for other people is switched off')
    expect(tid('pp-fix')!.textContent).toBe('File it for me only')
    await click(tid('pp-fix'))
    expect(got).toEqual({ people: [me()!], several: false })
  })
})

/* ---- A PRODUCT FAULT FOUND WRITING THE CASES ABOVE (12 Oct 26) — REPORTED, NOT PINNED ----------------------------------
   The case says what SHOULD happen and is RED on the build as it stands; it is not to be made green by changing it. */
describe('STEP 3 — a product fault, reported and left red: a READER is told what ALL AVAIL may be filed for', () => {
  /* `readOnly` — ui/PeoplePick.tsx: "the whole form is one its reader may not change: nothing can be picked, so nothing
     is said about what may be picked" (`[CARD-CHECK-SEEN]` 4, 10 Oct 26 — a member reading another man's medical entry
     was told "You can file a medical entry only for yourself"). The line under the two greyed placeholder pucks is a
     sentence about what may be picked, and it is drawn for a reader too: a member who opens another crew's three-day
     Training, or a course filed for several, reads "ALL AVAIL is for one day" / "ALL AVAIL is for Training, Meeting, …"
     in a window where he can pick nobody. */
  it('a read-only picker says nothing under the two placeholder pucks — for a kind that bars them, and for an input longer than a day', async () => {
    await mount({ people: [pilots()[0], wsos()[0]], several: true, type: 'CSE', readOnly: true })
    expect(tid('pp-why'), 'the control: the picker\'s own line is already silent for a reader').toBeNull()
    expect(tid('pp-phwhy'), 'a kind that bars them').toBeNull()
    await mount({ people: [pilots()[0], wsos()[0]], several: true, type: 'Training', readOnly: true, phWhy: () => 'ALL AVAIL is for one day' })
    expect(tid('pp-phwhy'), 'an input longer than a day').toBeNull()
  })
})
