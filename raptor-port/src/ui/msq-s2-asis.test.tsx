// @vitest-environment jsdom
/* ADMIN → USERS ACROSS SQUADRONS — STEP U0, FILE 1: THE PINS (the plan,
   docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md §21.2 and its block "Step 0 — this part read against his
   answers"; §19.10's "Pinned before the changed half"; the "Stays", "Unchanged, each a pin" and "Pins:" clauses of §19.1,
   §19.2, §19.3, §19.4 and §19.12 — V3, V37 and the pins inside V5, V7, V8, V11, V20; the brief
   docs/superpowers/briefs/2026-11-26-msq-s2-u0-brief.md).
   Before section 2 changes Admin → Users and who may give Plan, today's behaviour that must STAY is held here. Every test
   is a pin: seen passing on the code as it stood (chat 199's U0), named "pin:" in its title. A pin that later fails is a
   finding about the change, never a test to bend.
   The world: three squadrons (withThird — his D2630; R9), Wed 15 Jul 26, 09:00. Hunter — 142's admin, Plan of 149, View
   of 150; Saber — master admin, home 142; Ranger — 142's member, View of 149 and of 150; Kestrel — 149's admin; Osprey —
   149's member; Mako — 150's own admin. Admin → Users is drawn on its own (as ui/msq-users-row.test.tsx draws it),
   redrawn on the store's version as the Admin page does around it; a squadron is picked through the app's own door. */
import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { withThird, third, signInAs, PID, ACCT, moveMan, on } from '../test-support/msq-world'
import { UsersPanel } from './UsersPanel'
import { useVersion } from './useStore'
import { saveAccess, accountById, accountOfPid, accountsLoad, levelIn, setMaster, addPersonAndAccount } from '../state/accounts'
import { unitsLoad, todayIso, addUnit, setGrant, removeGrant, homeOn } from '../state/units'
import { readableUnits, menuSquadrons } from '../state/perms'
import { pickSquadron } from '../state/pick'
import { UNIT } from '../engine/unitview'
import { PEOPLE, nameToId } from '../engine/people'
import { rosterOf } from '../engine/roster'
import { NOTICES, noticesFor, noticeWords } from '../state/notices'
import { lineSqnMark } from '../state/belltap'
import { archivePerson } from '../leavewar/sync'
import { globalUndo, globalRedo } from '../undo/timeline'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

withThird()
afterEach(() => cleanup())

const reload = () => { unitsLoad(); accountsLoad() }
const level = (acct: string, unit: string) => { reload(); return levelIn(acct, unit, todayIso()) }
const P = (pid: string): any => (PEOPLE as any)[pid]

/* the page redraws on the store's version, as AdminPage does around it */
function Live() { useVersion(); return <UsersPanel shown /> }
function panel() {
  const page = render(<Live />)
  const $ = (sel: string) => page.container.querySelector(sel) as HTMLElement | null
  const $$ = (sel: string) => [...page.container.querySelectorAll<HTMLElement>(sel)]
  const rowOf = (pid: string) => $(`[data-testid="acc-groups"] .acc-row[data-person="${pid}"]`)
  const open = async (pid: string) => { await act(async () => { fireEvent.click(rowOf(pid)!.querySelector('.acc-tap')!) }) }
  const find = async (q: string) => { await act(async () => { fireEvent.change($('#accFind')!, { target: { value: q } }) }) }
  /* each squadron line of the opened row: its number, its buttons (* pressed, (off) greyed) or its words, its note */
  const lines = () => $$('[data-testid="acc-sq"] .acc-sq-n').map(n => {
    const u = n.dataset.unit!
    const next = n.nextElementSibling as HTMLElement
    const btns = [...next.querySelectorAll<HTMLButtonElement>('button')]
    const what = btns.length
      ? btns.map(b => `${b.textContent}${b.getAttribute('aria-pressed') === 'true' ? '*' : ''}${b.disabled ? '(off)' : ''}`).join(' ')
      : next.textContent
    const note = $(`[data-note-unit="${u}"]`)?.textContent ?? null
    return { n: n.textContent, what, note }
  })
  const pickLine = async (unit: string, v: string) => {
    const n = $(`[data-testid="acc-sq"] .acc-sq-n[data-unit="${unit}"]`)!
    await act(async () => { fireEvent.click((n.nextElementSibling as HTMLElement).querySelector(`[data-line="${v}"]`)!) })
  }
  const press = async (sel: string) => { await act(async () => { fireEvent.click($(sel)!) }) }
  /* the roster rows shown, in order, across every group (the Archived fold is apart) */
  const rows = () => $$('[data-testid="acc-groups"] .acc-row').map(r => r.dataset.person!)
  return { $, $$, rowOf, open, find, lines, pickLine, press, rows }
}
const pick = async (u: string) => { await act(async () => { await pickSquadron(u) }) }
/* is this element there and pressable */
const live = (el: HTMLElement | null) => !!el && !(el as HTMLButtonElement | HTMLInputElement).disabled
/* the 142 member with a sign-in every group uses (the world's Ranger — View of 149 and of 150) */
const ranger = () => PID.ranger

describe('1. a man\'s whole row on his own squadron\'s page (V3; §19.1 "Stays")', () => {
  const wholeRow = async (who: 'hunter' | 'saber') => {
    signInAs(who)
    expect(UNIT, 'his own squadron, 142, in view').toBe('u142')
    const p = panel()
    expect(p.rowOf(ranger()), 'Ranger is on 142\'s list').not.toBeNull()
    expect(p.$(`[data-testid="sqn-${ranger()}"]`), 'no grey squadron number on his own squadron\'s page').toBeNull()
    await p.open(ranger())
    /* every part, and each one live */
    expect(live(p.$('#accEdName')), 'the sign-in box').toBe(true)
    expect((p.$('#accEdName') as HTMLInputElement).value).toBe(accountById(ACCT.ranger)!.name)
    expect(live(p.$('#accEdRole')), 'the Role box').toBe(true)
    for (const id of ['#accEdSave', '#accEdCancel', '#accEdOnOff', '#accEdArchive', '#accEdDel'])
      expect(live(p.$(id)), id).toBe(true)
    expect(p.$('#accEdSave')!.textContent).toBe('Save')
    expect(p.$('#accEdCancel')!.textContent).toBe('Cancel')
    expect(p.$('#accEdOnOff')!.textContent).toBe('Suspend')
    expect(p.$('#accEdArchive')!.textContent).toBe('Archive')
    expect(p.$('#accEdDel')!.textContent).toBe('Delete')
    return p
  }
  it('pin: Hunter (142\'s admin) on 142\'s page — Ranger\'s opened row has the sign-in box, Role, his squadron lines, Save, Cancel, Suspend, Archive, Delete', async () => {
    const p = await wholeRow('hunter')
    /* his lines: home, then each other squadron — 149's Hunter's to change (Plan of 149), 150's not (View only) */
    expect(p.lines()).toEqual([
      { n: '142', what: 'Home squadron', note: null },
      { n: '149', what: 'None View* Plan(off)', note: 'Plan is for admins only.' },
      { n: '150', what: 'None(off) View*(off) Plan(off)', note: 'Only an admin of 150 can give access to 150.' },
    ])
  })
  it('pin: Saber (master admin) on 142\'s page — the same whole row, every other squadron\'s line his to change', async () => {
    const p = await wholeRow('saber')
    expect(p.lines()).toEqual([
      { n: '142', what: 'Home squadron', note: null },
      { n: '149', what: 'None View* Plan(off)', note: 'Plan is for admins only.' },
      { n: '150', what: 'None View* Plan(off)', note: 'Plan is for admins only.' },
    ])
  })
  it('pin: Kestrel (149\'s admin, no right in 142) is not offered 142 at all', () => {
    signInAs('kestrel')
    expect(readableUnits(), 'the squadrons he may pick').toEqual(['u149'])
    expect(menuSquadrons().map(m => m.id)).toEqual(['u149'])
  })
})

describe('2. View given and ended by an admin of the squadron (D2336, D2306)', () => {
  it('pin: Kestrel, 149\'s own admin, ends Ranger\'s View of 149 and gives it again from his row — each one Undo step', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.find('ranger')
    await p.open(ranger())
    await p.pickLine('u149', 'none')
    await p.press('#accEdSave')
    expect(level(ACCT.ranger, 'u149'), 'View of 149 ended').toBeNull()
    await p.open(ranger())
    await p.pickLine('u149', 'view')
    await p.press('#accEdSave')
    expect(level(ACCT.ranger, 'u149'), 'View of 149 given').toBe('view')
    act(() => { globalUndo() })
    expect(level(ACCT.ranger, 'u149'), 'one Undo takes the give back').toBeNull()
    act(() => { globalUndo() })
    expect(level(ACCT.ranger, 'u149'), 'the next takes the end back').toBe('view')
  })
  it('pin: Hunter, a Plan holder of 149, does the same from Ranger\'s row on his own 142 page — each one Undo step', async () => {
    signInAs('hunter')
    const p = panel()
    await p.open(ranger())
    await p.pickLine('u149', 'none')
    await p.press('#accEdSave')
    expect(level(ACCT.ranger, 'u149')).toBeNull()
    await p.open(ranger())
    await p.pickLine('u149', 'view')
    await p.press('#accEdSave')
    expect(level(ACCT.ranger, 'u149')).toBe('view')
    act(() => { globalUndo() })
    expect(level(ACCT.ranger, 'u149')).toBeNull()
    act(() => { globalUndo() })
    expect(level(ACCT.ranger, 'u149')).toBe('view')
  })
  it('pin: one who may not — Mako, 150\'s admin, nothing in 149: the 149 line greyed "Only an admin of 149 can give access to 149.", and the door says the same', async () => {
    signInAs('mako')
    const p = panel()
    await p.find('ranger')
    await p.open(ranger())
    const l149 = p.lines().find(l => l.n === '149')
    expect(l149).toEqual({ n: '149', what: 'None(off) View*(off) Plan(off)', note: 'Only an admin of 149 can give access to 149.' })
    expect(saveAccess(ACCT.ranger, { grants: { u149: 'none' } })).toBe('Only an admin of 149 can give access to 149.')
    expect(level(ACCT.ranger, 'u149'), 'nothing changed').toBe('view')
  })
  it('pin: a member\'s Plan button greyed "Plan is for admins only." — for Kestrel and for Saber; the door refuses it in the same words', async () => {
    signInAs('kestrel')
    let p = panel()
    await p.find('ranger')
    await p.open(ranger())
    expect(p.lines().find(l => l.n === '149')).toEqual({ n: '149', what: 'None View* Plan(off)', note: 'Plan is for admins only.' })
    cleanup()
    signInAs('saber')
    p = panel()
    await p.open(ranger())
    expect(p.lines().find(l => l.n === '149')!.what).toBe('None View* Plan(off)')
    expect(p.lines().find(l => l.n === '149')!.note).toBe('Plan is for admins only.')
    expect(saveAccess(ACCT.ranger, { grants: { u149: 'plan' } })).toBe('Plan is for admins only.')
  })
})

describe('3. the last-admin refusals, word for word (D2246, D2247)', () => {
  it('pin: a Plan holder never counts as 149\'s last admin while 149 has one of its own — Hunter making Kestrel a member is refused', () => {
    signInAs('hunter')
    expect(saveAccess(ACCT.kestrel, { role: 'main' })).toBe('Kestrel is 149\'s last admin. Make another admin of 149 first.')
    expect(level(ACCT.kestrel, 'u149')).toBe('admin')
  })
  it('pin: with no admin of its own a Plan holder counts — "+ New squadron" 151, Hunter its first admin: Saber making Hunter a member is refused', () => {
    signInAs('saber')
    const made = addUnit('151', 'p1', ACCT.hunter)
    expect(made, 'setup: 151 made, Hunter its first admin').toMatchObject({ ok: true })
    reload()
    expect(saveAccess(ACCT.hunter, { role: 'main' })).toBe('Hunter is 151\'s last admin. Make another admin of 151 first.')
    expect(accountById(ACCT.hunter)!.role).toBe('admin')
  })
  it('pin: said to one who cannot make an admin of that squadron — "…Only a master admin or an admin of 151 can make another." (D2246)', () => {
    /* setup: 149 gets a second own admin (so 149's own lock does not answer first), and 151 is made with Kestrel its first
       and only admin (his Plan of 151); Hunter, an admin of 149 by Plan and nothing in 151, makes Kestrel a member */
    signInAs('kestrel')
    expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'setup: Osprey an admin of 149').toBeNull()
    signInAs('saber')
    expect(addUnit('151', 'p1', ACCT.kestrel), 'setup: 151 made, Kestrel its first admin').toMatchObject({ ok: true })
    reload()
    signInAs('hunter')
    expect(saveAccess(ACCT.kestrel, { role: 'main' })).toBe('Kestrel is 151\'s last admin. Only a master admin or an admin of 151 can make another.')
    expect(accountById(ACCT.kestrel)!.role).toBe('admin')
  })
})

describe('4. his own account\'s bell lines, word for word (D2319, D2251)', () => {
  beforeEach(() => { NOTICES.length = 0 })
  /* the own-account lines on one man's bell, as he sees them: "<what> · <who>" */
  const bell = (pid: string) => noticesFor(pid).filter(n => (n.what || []).some((x: any) => x.k === 'acct'))
    .map(n => { const w = noticeWords(n); return `${w.what}${w.who ? ` · ${w.who}` : ''}` })
  it('pin: Saber ends Hunter\'s Plan of 149, then gives it again: "Plan of 149 ended · Saber", "Given Plan of 149: full access to 149 · Saber" — to Hunter alone, no squadron mark', () => {
    signInAs('saber')
    expect(removeGrant(ACCT.hunter, 'u149').ok).toBe(true)
    on(15, 10)
    expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok).toBe(true)
    expect(bell(PID.hunter).sort()).toEqual(['Given Plan of 149: full access to 149 · Saber', 'Plan of 149 ended · Saber'].sort())
    const lines = NOTICES.filter(n => (n.what || []).some((x: any) => x.k === 'acct'))
    expect(lines.map(n => n.to), 'to the man himself, and nobody else').toEqual([PID.hunter, PID.hunter])
    for (const n of lines) expect(lineSqnMark(n, PID.hunter), 'his own account\'s line wears no squadron mark').toBeNull()
  })
})

describe('5. the page as it must stay (V37; §19.3 and §19.12 "Stays"; D322, D2400)', () => {
  it('pin: the list is A to Z by callsign and is never reordered by a change (a role saved)', async () => {
    signInAs('saber')
    const p = panel()
    const before = p.rows()
    const css = before.map(pid => String(P(pid).cs).toLowerCase())
    expect(css, 'A to Z').toEqual([...css].sort((a, b) => a.localeCompare(b)))
    await p.open(ranger())
    await act(async () => { fireEvent.change(p.$('#accEdRole')!, { target: { value: 'admin' } }) })
    await p.press('#accEdSave')
    expect(accountById(ACCT.ranger)!.role, 'the change saved').toBe('admin')
    expect(p.rows(), 'the same rows in the same order').toEqual(before)
  })
  it('pin: the Waiting list — "Waiting for access", and "Nobody is waiting for access." with nobody waiting', () => {
    signInAs('saber')
    const p = panel()
    expect(p.$$('h4.adm-sub').map(h => h.textContent)).toContain('Waiting for access')
    expect(p.$('#admNoWaiting')?.textContent).toBe('Nobody is waiting for access.')
  })
  it('pin: the Archived fold with its own note for a man archived on the page\'s own squadron, today\'s words', async () => {
    signInAs('saber')
    const r = archivePerson(ranger())
    expect(r.bad, 'setup: Ranger archived').toBeNull()
    const p = panel()
    expect(p.rowOf(ranger()), 'off the live list').toBeNull()
    expect(p.$('#accArchToggle')!.textContent).toBe('▸ Archived · 1')
    await p.press('#accArchToggle')
    expect(p.$('#accArchToggle')!.textContent).toBe('▾ Archived · 1')
    expect(p.$(`#accArchList [data-person="${ranger()}"]`), 'his archived row').not.toBeNull()
    expect(p.$(`[data-testid="arch-line-${ranger()}"]`)!.textContent).toBe('Archived 15 Jul 26 by Saber')
  })
  it('pin: Filter\'s Seat tick hides rows (Pilots: no WSO left on the list)', async () => {
    signInAs('saber')
    const p = panel()
    const all = p.rows()
    await p.press('#accFilter')
    await p.press('#accFilterPanel [data-ftick="seat:Pilots"]')
    const shown = p.rows()
    expect(shown.length, 'some rows hidden').toBeLessThan(all.length)
    expect(shown.length, 'some rows kept').toBeGreaterThan(0)
    for (const pid of shown) expect(P(pid).seat, P(pid).cs).toBe('FCP')
    expect(shown, 'the kept rows in the list\'s own order').toEqual(all.filter(pid => shown.includes(pid)))
  })
  it('pin: "Plans 149" in the filter on 149\'s page finds its Plan holder, Hunter (D2400)', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.press('#accFilter')
    const chips = p.$$('#accFilterPanel [data-fgroup="role"] .fchip').map(c => c.textContent)
    expect(chips).toContain('Plans 149')
    await p.press('#accFilterPanel [data-ftick="role:plans"]')
    expect(p.rows()).toEqual([PID.hunter])
  })
  it('pin: the signed-in admin\'s own row does not open', async () => {
    signInAs('hunter')
    const p = panel()
    const tap = p.rowOf(PID.hunter)!.querySelector<HTMLButtonElement>('.acc-tap')!
    expect(tap.disabled).toBe(true)
    expect(tap.title).toBe('Your own account — another admin can change it')
    await act(async () => { fireEvent.click(tap) })
    expect(p.$('.acc-edit'), 'no editor opened').toBeNull()
  })
})

describe('6. Plan\'s standing rules (D2306, D2250, D2203, D2308, D2191)', () => {
  it('pin: Plan only on an admin\'s account — Saber giving Ranger (a member) Plan of 149: "Plan is for admins only."', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.ranger, { grants: { u149: 'plan' } })).toBe('Plan is for admins only.')
    expect(level(ACCT.ranger, 'u149')).toBe('view')
  })
  it('pin: his own squadron\'s admin makes him a member and his Plan ends with it; Undo gives the role back; the Redo drops the Plan again (D2250)', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { role: 'main' }), 'Saber, an admin of 142, makes Hunter a member').toBeNull()
    expect(accountById(ACCT.hunter)!.role).toBe('main')
    expect(level(ACCT.hunter, 'u149'), 'his Plan of 149 ended in the same command').toBeNull()
    const u = globalUndo()
    expect(u.ok, `the Undo went through${u.ok ? '' : ` — ${u.reason}`}`).toBe(true)
    expect(level(ACCT.hunter, 'u142'), 'an admin of 142 again').toBe('admin')
    const planAfterUndo = level(ACCT.hunter, 'u149')
    /* (Saber may give Plan of 149, so his Undo puts the Plan back too — §19.2's pin "both where he may: Saber") */
    expect(planAfterUndo, 'Saber\'s Undo gives back the Plan as well').toBe('admin')
    const r = globalRedo()
    expect(r.ok, `the Redo went through${r.ok ? '' : ` — ${r.reason}`}`).toBe(true)
    expect(accountById(ACCT.hunter)!.role).toBe('main')
    expect(level(ACCT.hunter, 'u149'), 'the Redo drops the Plan again').toBeNull()
  })
  it('pin: a move ends Plan (D2203) — Hunter moved to 150: from the move day no Plan of 149', () => {
    signInAs('saber')
    expect(moveMan(PID.hunter, third.u150), 'Saber moves Hunter to 150').toMatchObject({ ok: true })
    expect(level(ACCT.hunter, 'u149'), 'today, before the move day, he still holds it').toBe('admin')
    on(16); reload()
    expect(homeOn(PID.hunter, todayIso())).toBe(third.u150)
    expect(level(ACCT.hunter, 'u149'), 'the move day: Plan of 149 ended').toBeNull()
  })
  it('pin: "+ New squadron" gives its first admin Plan of it (D2308)', () => {
    signInAs('saber')
    const made = addUnit('151', 'p1', ACCT.kestrel)
    expect(made).toMatchObject({ ok: true })
    expect(level(ACCT.kestrel, String(made.id)), 'Kestrel an admin of 151 by its first Plan').toBe('admin')
  })
  it('pin: only a master admin makes squadrons and master admins — Hunter refused both', () => {
    signInAs('hunter')
    const made = addUnit('151', 'p1', ACCT.hunter)
    expect(made.ok, 'Hunter cannot make a squadron').toBe(false)
    expect(made.message).toBe('This change could not be saved.')
    expect(setMaster(ACCT.ranger, true)).toEqual({ ok: false, message: 'Only a master admin can do that' })
    expect(saveAccess(ACCT.ranger, { role: 'admin', master: true })).toBe('Only a master admin can do that')
    expect(accountById(ACCT.ranger)!.master).toBeUndefined()
  })
})

describe('7. a callsign\'s standing rules (D286, D288)', () => {
  it('pin: an archived man\'s callsign may go to a new person (D286)', () => {
    signInAs('saber')
    const cs = String(P(ranger()).cs)
    expect(archivePerson(ranger()).bad, 'setup: Ranger archived').toBeNull()
    expect(addPersonAndAccount('', { cs, ini: 'RG', seat: 'FCP', cat: 'B' }, 'main'), `a new ${cs} added`).toBeNull()
    const fresh = nameToId(cs)
    expect(fresh, 'the new man holds the callsign').toBeTruthy()
    expect(fresh).not.toBe(ranger())
    expect(rosterOf('u142', todayIso())).toContain(fresh)
  })
  it('pin: two live men never share one (D288) — adding a second "Ranger": today\'s words', () => {
    signInAs('saber')
    const cs = String(P(ranger()).cs)
    const n = rosterOf('u142', todayIso()).length
    expect(addPersonAndAccount('', { cs, ini: 'RG', seat: 'FCP', cat: 'B' }, 'main')).toBe(`${cs} is already taken — callsigns must be unique`)
    expect(rosterOf('u142', todayIso()).length, 'nobody added').toBe(n)
    expect(accountOfPid(ranger())).toBeTruthy()
  })
})
