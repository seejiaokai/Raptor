// @vitest-environment jsdom
/* ADMIN → USERS — THE FILTER, A MASTER ADMIN'S GROUPED LIST AND ADD A PERSON'S HOME SQUADRON (batch 1's second half §4
   items 1, 2, 7; his D2335, D2307 — one Filter button beside the search, tick groups, the lit count, "Showing 1 of 61 ·
   Clear"; D2306 — the Role tick "Plans 149"; D2270 — a master admin's squadrons grouped, each A to Z; D2321 — eight
   squadrons, a chip each; D322 — rows only hidden, never reordered; the drawings docs/mock/2026-11-22-msq-b1-screens/img/
   nfa–nfd, n1c0, f5c-p, b1-7).
   - One "Filter" button by the search opens a panel of tick chips: Seat (Pilots, WSOs, Personnel), CAT, Role (Member,
     Admin, "Plans <the page's squadron>", Master admin) and, for a master admin only, Squadron.
   - Ticks in one group: any of them; groups: all of them. The button lit with its count, "Showing N of M · Clear" over
     the list; Clear (and the panel's "Clear all") take every tick off.
   - A master admin ticking more than the page's squadron: each squadron's people under its own heading, A to Z, the
     other squadrons' people wearing their grey number.
   - Add a person's "Home squadron": the squadrons he is an admin of, the page's own first; one squadron, no box.
   Red first: before the change Admin → Users had no Filter button, no grouped list and no Home squadron box. */
import { describe, it, expect, afterEach } from 'vitest'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { useMsqWorld, signInAs, worlds, PID, ACCT } from '../test-support/msq-world'
import { UsersPanel } from './UsersPanel'
import { saveAccess, accountOfPid, isAdminAccount } from '../state/accounts'
import { addUnit, placeOfOn, homeOn, todayIso } from '../state/units'
import { usersListOf } from './userslist-model'
import { PEOPLE, nameToId } from '../engine/people'
import { getState } from '../leavewar/state/store'
import { readForeign } from '../leavewar/state/foreign'
import { effectiveToday } from '../state/person-delete'
import { pickSquadron } from '../state/pick'
import { notify } from '../state/store'
import { UNIT } from '../engine/unitview'
import { useVersion } from './useStore'

useMsqWorld()
afterEach(() => cleanup())

const P = (pid: string): any => (PEOPLE as any)[pid]
const count = (u: string) => usersListOf(u, todayIso(), '').count
/* the page redraws on the store's version, as AdminPage does around it */
function Live(p: { shown: boolean }) { useVersion(); return <UsersPanel shown={p.shown} /> }
function panel(shown = true) {
  const page = render(<Live shown={shown} />)
  const $ = (sel: string) => page.container.querySelector(sel) as HTMLElement | null
  const $$ = (sel: string) => [...page.container.querySelectorAll<HTMLElement>(sel)]
  const btn = () => $('#accFilter') as HTMLButtonElement
  const openPanel = async () => { if (!$('#accFilterPanel')) await act(async () => { fireEvent.click(btn()) }) }
  const tick = async (k: string) => { await openPanel(); await act(async () => { fireEvent.click($(`#accFilterPanel [data-ftick="${k}"]`)!) }) }
  const chips = (g: string) => $$(`#accFilterPanel [data-fgroup="${g}"] .fchip`).map(c => c.textContent)
  const groups = () => $$('#accFilterPanel [data-fgroup]').map(g => g.dataset.fgroup)
  /* the roster rows shown, in order, across every group (the Archived fold is apart) */
  const rows = () => $$('[data-testid="acc-groups"] .acc-row').map(r => r.dataset.person!)
  const heads = () => $$('[data-testid="acc-groups"] h4.adm-sub').map(h => h.textContent)
  const line = () => $('#accShowing')?.textContent ?? null
  return { $, $$, btn, openPanel, tick, chips, groups, rows, heads, line }
}

describe('the Filter button and its panel (D2335, D2307 — pictures nfa, nfb, nfd)', () => {
  it('Hunter, 142\'s admin: one "Filter" button beside the search, unlit, no line; the panel has Seat, CAT and Role — no Squadron', async () => {
    signInAs('hunter')
    const p = panel()
    expect(p.btn().textContent).toBe('Filter')
    expect(p.btn().className).not.toContain('primary')
    expect(p.btn().getAttribute('aria-expanded')).toBe('false')
    expect(p.btn().closest('.od-findrow')?.querySelector('#accFind'), 'beside the search').not.toBeNull()
    expect(p.line()).toBeNull()
    await p.openPanel()
    expect(p.btn().getAttribute('aria-expanded')).toBe('true')
    expect(p.groups()).toEqual(['seat', 'cat', 'role'])
    expect(p.chips('seat')).toEqual(['Pilots', 'WSOs', 'Personnel'])
    expect(p.chips('role')).toEqual(['Member', 'Admin', 'Plans 142', 'Master admin'])
    expect(p.chips('cat').length, 'the CATs held on the list').toBeGreaterThan(3)
    expect(p.chips('cat').slice(0, 2)).toEqual(['IP', 'IW'])
  })
  it('Pilots and Admin ticked: "Filter · 2" lit, "Showing 1 of 61 · Clear", only Hunter; a tick reads "✓ Pilots"', async () => {
    signInAs('hunter')
    const p = panel()
    await p.tick('seat:Pilots')
    await p.tick('role:admin')
    expect(p.btn().textContent).toBe('Filter · 2')
    /* his D2401: the app's own "on" look (.fchip.on, the Logic filter's), never the primary button's */
    expect(p.btn().classList.contains('on')).toBe(true)
    expect(p.btn().className).not.toContain('primary')
    expect(p.chips('seat')).toEqual(['✓ Pilots', 'WSOs', 'Personnel'])
    expect(p.$('#accFilterPanel [data-ftick="seat:Pilots"]')!.getAttribute('aria-pressed')).toBe('true')
    expect(p.rows()).toEqual([PID.hunter])
    expect(p.line()).toBe(`Showing 1 of ${count('u142')} · Clear`)
  })
  it('several ticks in one group mean any of them; groups combine; the list stays A to Z (D322)', async () => {
    signInAs('hunter')
    const p = panel()
    const all = p.rows()
    await p.tick('seat:Pilots')
    const pilots = p.rows()
    expect(pilots.every(pid => P(pid).seat === 'FCP' && !P(pid).pers)).toBe(true)
    await p.tick('seat:WSOs')
    const both = p.rows()
    expect(both.length).toBeGreaterThan(pilots.length)
    expect(both.every(pid => !P(pid).pers && P(pid).seat !== 'GND')).toBe(true)
    expect(both, 'only hidden, in the same order').toEqual(all.filter(pid => both.includes(pid)))
    await p.tick('cat:IP')
    expect(p.rows().every(pid => P(pid).q === 'IP')).toBe(true)
    expect(p.rows().length).toBeGreaterThan(0)
    expect(p.btn().textContent).toBe('Filter · 3')
  })
  it('Member finds the members with a sign-in; Master admin finds Saber', async () => {
    signInAs('hunter')
    const p = panel()
    await p.tick('role:member')
    expect(p.rows()).toContain(PID.ranger)
    expect(p.rows().every(pid => { const a = accountOfPid(pid); return !!a && !a.master && !isAdminAccount(a) }), 'a sign-in, not an admin\'s').toBe(true)
    await p.tick('role:member'); await p.tick('role:master')
    expect(p.rows()).toEqual([PID.saber])
  })
  it('the line\'s Clear and the panel\'s "Clear all" take every tick off', async () => {
    signInAs('hunter')
    const p = panel()
    const all = p.rows()
    await p.tick('seat:Pilots'); await p.tick('role:admin')
    await act(async () => { fireEvent.click(p.$('#accFilterClear')!) })
    expect(p.btn().textContent).toBe('Filter')
    expect(p.rows()).toEqual(all)
    await p.tick('seat:Personnel')
    await act(async () => { fireEvent.keyDown(document, { key: 'Escape' }) })
    expect(p.$('#accFilterPanel')).toBeNull()
    await act(async () => { fireEvent.click(p.$('#accShowingClear')!) })
    expect(p.line()).toBeNull()
    expect(p.rows()).toEqual(all)
  })
  it('Escape closes the panel, the keys back on the button; a press outside closes it, the ticks kept', async () => {
    signInAs('hunter')
    const p = panel()
    p.btn().focus()
    await p.tick('seat:WSOs')
    await act(async () => { fireEvent.keyDown(document.activeElement!, { key: 'Escape' }) })
    expect(p.$('#accFilterPanel')).toBeNull()
    expect(document.activeElement).toBe(p.btn())
    await p.openPanel()
    await act(async () => { fireEvent.pointerDown(document.body) })
    expect(p.$('#accFilterPanel')).toBeNull()
    expect(p.btn().textContent).toBe('Filter · 1')
  })
  it('"Plans 149" on 149\'s list finds its Plan holders (R-O4): Kestrel\'s list, Hunter holding Plan of 149', async () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
    signInAs('kestrel')
    const p = panel()
    await p.openPanel()
    expect(p.chips('role')).toEqual(['Member', 'Admin', 'Plans 149', 'Master admin'])
    await p.tick('role:plans')
    expect(p.rows()).toEqual([PID.hunter])
    expect(p.line(), 'of the rows the list shows unfiltered: 149\'s own and its Plan holder').toBe(`Showing 1 of ${count('u149') + 1} · Clear`)
  })
})

describe('a master admin\'s Squadron group and the grouped list (D2270, D2335 — pictures nfc, n1c0, f5c-p)', () => {
  it('Saber ticks 142 and 149: each squadron under its heading, A to Z, 149\'s people wearing "149"; "Filter · 1"', async () => {
    signInAs('saber')
    const p = panel()
    await p.openPanel()
    expect(p.groups()).toEqual(['seat', 'cat', 'role', 'sqn'])
    expect(p.chips('sqn')).toEqual(['142', '149'])
    await p.tick('sqn:u142'); await p.tick('sqn:u149')
    expect(p.btn().textContent, 'both of two squadrons is everyone — one filter (picture nfc)').toBe('Filter · 1')
    expect(p.heads()).toEqual([`142 · ${count('u142')}`, `149 · ${count('u149')}`])
    expect(p.$('.od-head h4.adm-sub')!.textContent).toBe(`People · ${count('u142') + count('u149')}`)
    expect(p.line()).toBe('Showing both squadrons, grouped · Clear')
    const g149 = p.$$('[data-testid="acc-groups"] .od-list[data-unit="u149"] .acc-row').map(r => r.dataset.person!)
    expect(g149).toContain(PID.kestrel)
    expect(g149.every(pid => homeOn(pid, todayIso()) === 'u149')).toBe(true)
    expect(g149.map(pid => P(pid).cs)).toEqual([...g149.map(pid => P(pid).cs)].sort((a, b) => a.localeCompare(b)))
    expect(p.$(`[data-testid="sqn-${PID.kestrel}"]`)?.textContent).toBe('149')
    const g142 = p.$$('#accList .acc-row').map(r => r.dataset.person!)
    expect(g142).toContain(PID.hunter)
    expect(p.$(`[data-testid="sqn-${PID.hunter}"]`), '142 is the page\'s own: no badge').toBeNull()
  })
  it('149 alone ticked from 142\'s page: 149\'s people only, under its heading; Seat still filters inside the group', async () => {
    signInAs('saber')
    const p = panel()
    await p.tick('sqn:u149')
    expect(p.heads()).toEqual([`149 · ${count('u149')}`])
    expect(p.rows().every(pid => homeOn(pid, todayIso()) === 'u149')).toBe(true)
    await p.tick('seat:Pilots')
    expect(p.rows().every(pid => P(pid).seat === 'FCP')).toBe(true)
    expect(p.btn().textContent).toBe('Filter · 2')
  })
  it('Hunter, holding Plan of 149, is not a master admin: no Squadron group', async () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
    signInAs('hunter')
    const p = panel()
    await p.openPanel()
    expect(p.groups()).toEqual(['seat', 'cat', 'role'])
  })
  it('eight squadrons: eight chips; 142 and 149 ticked is a filter of two (picture f5c-p)', async () => {
    signInAs('saber')
    const place = placeOfOn('u142', todayIso())!.id
    for (let n = 150; n <= 155; n++) expect(addUnit(String(n), place, ACCT.hunter), `${n} made`).toMatchObject({ ok: true })
    const p = panel()
    await p.openPanel()
    expect(p.chips('sqn')).toEqual(['142', '149', '150', '151', '152', '153', '154', '155'])
    await p.tick('sqn:u142'); await p.tick('sqn:u149')
    expect(p.btn().textContent).toBe('Filter · 2')
    expect(p.heads()).toEqual([`142 · ${count('u142')}`, `149 · ${count('u149')}`])
    expect(p.line()).toBe(`Showing ${p.rows().length} of ${p.rows().length} · Clear`)
  })
})

/* (j), his D2396: a pick means "show me this squadron", so it takes the Squadron ticks off and Admin → Users shows the
   squadron just picked; the Seat, CAT and Role ticks and the search stay, the count beside "People" as built. Red first:
   Saber on 142 with 142 ticked picked 149, and the list stayed 142's under a top bar reading 149. */
describe('a pick and the Squadron ticks (j)', () => {
  const pick = async (u: string) => { await act(async () => { await pickSquadron(u) }) }
  it('Saber ticks 142, picks 149: the tick is off and the list is 149\'s', async () => {
    signInAs('saber')
    const p = panel()
    await p.tick('sqn:u142')
    await pick('u149')
    expect(UNIT).toBe('u149')
    expect(p.btn().textContent, 'nothing left ticked').toBe('Filter')
    expect(p.line()).toBeNull()
    expect(p.heads(), 'one squadron again: no group heading').toEqual([])
    expect(p.rows()).toContain(PID.kestrel)
    expect(p.rows()).not.toContain(PID.hunter)
    expect(p.$('.od-head h4.adm-sub')!.textContent).toBe(`People · ${count('u149')}`)
    await p.openPanel()
    expect(p.chips('sqn'), 'no chip left ticked').toEqual(['142', '149'])
  })
  it('both squadrons ticked, then a pick: grouped no more', async () => {
    signInAs('saber')
    const p = panel()
    await p.tick('sqn:u142'); await p.tick('sqn:u149')
    await pick('u149')
    expect(p.heads()).toEqual([])
    expect(p.btn().textContent).toBe('Filter')
  })
  it('the Seat, CAT and Role ticks and the search survive a pick; only the Squadron tick goes', async () => {
    signInAs('saber')
    const p = panel()
    await p.openPanel()
    const firstCat = p.$('#accFilterPanel [data-fgroup="cat"] .fchip')!.dataset.ftick!
    await p.tick('seat:Pilots'); await p.tick(firstCat); await p.tick('role:member'); await p.tick('sqn:u142')
    await act(async () => { fireEvent.change(p.$('#accFind')!, { target: { value: 'a' } }) })
    expect(p.btn().textContent).toBe('Filter · 4')
    await pick('u149')
    expect(p.btn().textContent, 'Seat, CAT and Role stay').toBe('Filter · 3')
    const on = (k: string) => p.$(`#accFilterPanel [data-ftick="${k}"]`)!.getAttribute('aria-pressed')
    expect(on('seat:Pilots')).toBe('true'); expect(on(firstCat)).toBe('true'); expect(on('role:member')).toBe('true')
    expect(on('sqn:u142')).toBe('false')
    expect((p.$('#accFind') as HTMLInputElement).value, 'the search stays').toBe('a')
  })
  it('no pick, no change: a tick stays while the page is redrawn', async () => {
    signInAs('saber')
    const p = panel()
    await p.tick('sqn:u149')
    await act(async () => { notify() })
    expect(p.btn().textContent).toBe('Filter · 1')
    expect(p.heads()).toEqual([`149 · ${count('u149')}`])
  })
})

describe('Add a person\'s Home squadron (§4 item 7 — picture b1-7)', () => {
  it('Hunter, an admin of 142 alone: no Home squadron box', () => {
    signInAs('hunter')
    const p = panel()
    expect(p.$('#accAddHome')).toBeNull()
  })
  it('Saber: "Home squadron" first in the form, 142 then 149, the page\'s own picked', () => {
    signInAs('saber')
    const p = panel()
    const box = p.$('#accAddHome') as HTMLSelectElement
    expect(box).not.toBeNull()
    expect([...box.options].map(o => o.textContent)).toEqual(['142', '149'])
    expect(box.value).toBe('u142')
    const labels = p.$$('#accAddBlock .mfield label').map(l => l.textContent)
    expect(labels[0]).toBe('Home squadron')
  })
  it('Saber, on 142\'s page, adds WASP to 149 on screen: his home is 149, his post-in in 149\'s war only', async () => {
    signInAs('saber')
    const p = panel()
    await act(async () => { fireEvent.change(p.$('#accAddHome')!, { target: { value: 'u149' } }) })
    await act(async () => { fireEvent.change(p.$('#accAddCs')!, { target: { value: 'WASP' } }) })
    await act(async () => { fireEvent.change(p.$('#accAddSeat')!, { target: { value: 'FCP' } }) })
    await act(async () => { fireEvent.change(p.$('#accAddCat')!, { target: { value: 'B' } }) })
    await act(async () => { fireEvent.change(p.$('#accAddName')!, { target: { value: 'wasp@mail' } }) })
    await act(async () => { fireEvent.click(p.$('#accAdd')!) })
    const pid = nameToId('WASP')!
    expect(pid, 'WASP made').toBeTruthy()
    expect(homeOn(pid, todayIso())).toBe('u149')
    expect(getState().people.some(x => x.id === pid), 'not in 142\'s war loaded').toBe(false)
    const post: any = readForeign(worlds.u149!, pid).post
    expect(post?.from).toBe(effectiveToday())
    expect((p.$('#accAddHome') as HTMLSelectElement).value, 'the form starts again on the page\'s own').toBe('u142')
  })
  it('Hunter holding Plan of 149: 142 and 149 offered', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
    signInAs('hunter')
    const p = panel()
    expect([...(p.$('#accAddHome') as HTMLSelectElement).options].map(o => o.textContent)).toEqual(['142', '149'])
  })
})
