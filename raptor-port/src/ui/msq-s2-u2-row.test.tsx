// @vitest-environment jsdom
/* ADMIN → USERS ACROSS SQUADRONS — STEP U2, PASS C: THE SCREEN (the brief docs/superpowers/briefs/2026-11-27-msq-s2-u2-brief.md
   §5 "Pass C", §6 and §8's "The row (V8, V9)", "The greyed "Admin", in four places" and "The guard").
   His rulings: D2626 — Plan of a squadron is given and ended by that squadron's own admins or a master admin, never by a
   Plan holder; D2730 Q8, D2806 — whoever may give Plan of a squadron is the only one who may make a man its admin, so to
   one who may not, "Admin" is greyed in the Role box with one grey line under it saying who can; D2817 — note 5 of "What
   each role allows"; D2821 — within one squadron nothing on Admin → Users is refused over typing not saved.
   The drawings: docs/mock/2026-11-25-msq-pick-guard-q3/drawn/q13-d-rec*, q13-p-rec* (the grey line in the Role column,
   under the box). The three other places the line is drawn (Give sign-in, "+ Add a person", Give access) were never
   drawn — the agent's reading of D2806, named in the U2 report.
   Written red first on the code before Pass C, each test seen failing there, except where named "pin:".
   The world: three squadrons (withThird — his D2630; R9), Wed 15 Jul 26, 09:00. Hunter — 142's admin, Plan of 149, View
   of 150; Saber — master admin, home 142; Ranger — 142's member, View of 149 and of 150; Kestrel — 149's admin; Osprey —
   149's member; Mako — 150's own admin. */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { withThird, third, signInAs, PID, ACCT, SIGN, type Who } from '../test-support/msq-world'
import { UsersPanel } from './UsersPanel'
import { useVersion } from './useStore'
import { changedWhileOpenWords } from './useraccess-model'
import { ROLES_NOTES } from './rolestable'
import {
  accountById, accountOfPid, accountsLoad, levelIn, requestAccess, saveAccess, sessionFor, signIn, updateAccount,
} from '../state/accounts'
import { unitsLoad, todayIso } from '../state/units'
import { pickSquadron } from '../state/pick'
import { PEOPLE } from '../engine/people'
import { rosterOf } from '../engine/roster'
import { HOOKS } from '../engine/hooks'
import { SESSION, ME, setSession, setMe } from '../state/auth'
import { notify } from '../state/store'
import { globalUndo } from '../undo/timeline'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

withThird()
afterEach(() => cleanup())

const PLAN = (n: string) => `Only ${n}'s own admins or a master admin can give or end Plan of ${n}.`
const MAKE = (n: string) => `Only ${n}'s own admins or a master admin can make an admin of ${n}.`
const reload = () => { unitsLoad(); accountsLoad() }
const level = (acct: string, unit: string) => { reload(); return levelIn(acct, unit, todayIso()) }
const P = (pid: string): any => (PEOPLE as any)[pid]
/* as another person, through the real door, the signed-in session put back — nothing redrawn (msq-s2-rejudge10's) */
function as<T>(who: Who, write: () => T): T {
  const ps = SESSION, pm = ME
  const s = sessionFor(signIn(SIGN[who][0], SIGN[who][1]))
  if (!s) throw new Error(`no ${who}`)
  setSession(s); setMe(s.pid)
  try { return write() } finally { setSession(ps); setMe(pm) }
}
/* a man of `unit` on the roster with no sign-in */
const noSignIn = (unit: string): string => {
  const pid = rosterOf(unit, todayIso()).find(id => { const p = P(id); return p && !p.special && !p.archived && !p.deleted && !accountOfPid(id) })
  if (!pid) throw new Error(`the world has no ${unit} man without a sign-in`)
  return pid
}
/* Saber makes Ranger an admin of 142 (his View of 149 and of 150 stay) */
const rangerAdmin = () => { expect(as('saber', () => updateAccount(ACCT.ranger, { role: 'admin' })), 'setup: Ranger made an admin').toBeNull(); reload() }

function Live() { useVersion(); return <UsersPanel shown /> }
function panel() {
  const page = render(<Live />)
  const $ = (sel: string) => page.container.querySelector(sel) as HTMLElement | null
  const $$ = (sel: string) => [...page.container.querySelectorAll<HTMLElement>(sel)]
  const rowOf = (pid: string) => $(`[data-testid="acc-groups"] .acc-row[data-person="${pid}"]`)
  const open = async (pid: string) => { await act(async () => { fireEvent.click(rowOf(pid)!.querySelector('.acc-tap')!) }) }
  const find = async (q: string) => { await act(async () => { fireEvent.change($('#accFind')!, { target: { value: q } }) }) }
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
  const set = async (sel: string, value: string) => { await act(async () => { fireEvent.change($(sel)!, { target: { value } }) }) }
  const press = async (sel: string) => { await act(async () => { fireEvent.click($(sel)!) }) }
  /* a Role box as a person meets it: its choices ((off) greyed), whether the whole box is greyed, and the grey line under
     it — read as the line the box names for a screen reader, and as the one line in the box's own field */
  const role = (id: string) => {
    const box = $(`#${id}`) as HTMLSelectElement | null
    if (!box) return null
    const field = box.closest('.mfield')!
    const said = box.getAttribute('aria-describedby')
    return {
      options: [...box.options].map(o => `${o.textContent}${o.disabled ? '(off)' : ''}`),
      boxOff: box.disabled,
      line: field.querySelector('.acc-role-note')?.textContent ?? null,
      described: said ? $(`#${said}`)?.textContent ?? null : null,
    }
  }
  return { $, $$, rowOf, open, find, lines, pickLine, set, press, role }
}
const pick = async (u: string) => { await act(async () => { await pickSquadron(u) }) }
const noteSaid = (cs: string): number => vi.mocked(HOOKS.toast).mock.calls.filter(c => c[0] === changedWhileOpenWords(cs)).length

describe('V8, V9 — the row: Plan for one who may give it, greyed for one who may not (D2626)', () => {
  it('Kestrel, 149\'s own admin, finds Ranger (a 142 admin) on 149\'s page: Plan live, no note; he gives it and it saves', async () => {
    rangerAdmin()
    signInAs('kestrel')
    const p = panel()
    await p.find('ranger')
    await p.open(PID.ranger)
    expect(p.lines()).toEqual([{ n: '149', what: 'None View* Plan', note: null }])
    await p.pickLine('u149', 'plan')
    await p.press('#accEdSave')
    expect(level(ACCT.ranger, 'u149')).toBe('admin')
  })
  it('Hunter (Plan of 149, not its own admin) opens Ranger (a 142 admin) on 142\'s page: 149\'s Plan greyed in the new sentence, View his to give', async () => {
    rangerAdmin()
    signInAs('hunter')
    const p = panel()
    await p.open(PID.ranger)
    expect(p.lines()[1]).toEqual({ n: '149', what: 'None View* Plan(off)', note: PLAN('149') })
  })
  it('Hunter on 149\'s page finds Mako (150\'s admin): the one 149 line, Plan greyed in the new sentence', async () => {
    signInAs('hunter')
    await pick('u149')
    const p = panel()
    await p.find('mako')
    await p.open(PID.mako)
    expect(p.lines()).toEqual([{ n: '149', what: 'None* View Plan(off)', note: PLAN('149') }])
  })
  it('one reason at a time — a Plan Ranger holds stays locked for Hunter with Member picked: never "Plan is for admins only." over it, never unlocked', async () => {
    rangerAdmin()
    expect(as('saber', () => saveAccess(ACCT.ranger, { grants: { u149: 'plan' } })), 'setup: Saber gives Ranger Plan of 149').toBeNull()
    signInAs('hunter')
    const p = panel()
    await p.open(PID.ranger)
    const held = { n: '149', what: 'None(off) View(off) Plan*(off)', note: PLAN('149') }
    expect(p.lines()[1]).toEqual(held)
    await p.set('#accEdRole', 'main')
    expect(p.lines()[1], 'Member picked: the held Plan still locked, its own reason').toEqual(held)
  })
  it('pin: a member\'s row reads "Plan is for admins only." — Hunter on 149\'s page opens Osprey: his 142 line', async () => {
    signInAs('hunter')
    await pick('u149')
    const p = panel()
    await p.open(PID.osprey)
    const l142 = p.lines().find(l => l.n === '142')
    expect(l142).toEqual({ n: '142', what: 'None* View Plan(off)', note: 'Plan is for admins only.' })
  })
  it('the old master-only Plan sentence is gone from the app: no source file under src/ says it', () => {
    /* (the sentence built in two halves, so this file never says it either — the brief's "No file may say …") */
    const OLD = 'Only a master admin ' + 'gives Plan'
    const root = join(__dirname, '..')
    const hits: string[] = []
    const walk = (dir: string) => {
      for (const f of readdirSync(dir)) {
        const full = join(dir, f)
        if (statSync(full).isDirectory()) { walk(full); continue }
        if (!/\.(ts|tsx|js|jsx|mjs|css)$/.test(f)) continue
        if (readFileSync(full, 'utf8').includes(OLD)) hits.push(full.slice(root.length + 1))
      }
    }
    walk(root)
    expect(hits).toEqual([])
  })
})

describe('the greyed "Admin", in four places (D2806 — q13-d-rec, q13-p-rec)', () => {
  it('Hunter on 149\'s page opens Osprey (149\'s member): "Admin" greyed, the one line under the box (#accEdRole)', async () => {
    signInAs('hunter')
    await pick('u149')
    const p = panel()
    await p.open(PID.osprey)
    expect(p.role('accEdRole')).toEqual({
      options: ['Member', 'Admin(off)', 'Master admin(off)'], boxOff: false, line: MAKE('149'), described: MAKE('149'),
    })
  })
  it('…a 149 man with no sign-in: the same in "Give sign-in" (#accGiveRole)', async () => {
    signInAs('hunter')
    await pick('u149')
    const p = panel()
    await p.open(noSignIn('u149'))
    expect(p.role('accGiveRole')).toEqual({
      options: ['Member', 'Admin(off)', 'Master admin(off)'], boxOff: false, line: MAKE('149'), described: MAKE('149'),
    })
  })
  it('…"+ Add a person" with a sign-in typed: the same (#accAddRole)', async () => {
    signInAs('hunter')
    await pick('u149')
    const p = panel()
    await p.press('#accAddOpen')
    await p.set('#accAddName', 'nova@mail')
    expect(p.role('accAddRole')).toEqual({ options: ['Member', 'Admin(off)'], boxOff: false, line: MAKE('149'), described: MAKE('149') })
  })
  it('…Give access, in both modes: the same (#apvRole)', async () => {
    signInAs('newface@mail')
    expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' }, 'u149'), 'setup: a request for 149').toBeNull()
    signInAs('hunter')
    await pick('u149')
    const p = panel()
    await p.press('[data-approve]')
    expect(p.$('#apvPostIn'), 'premise: New person mode').not.toBeNull()
    const greyed = { options: ['Member', 'Admin(off)'], boxOff: false, line: MAKE('149'), described: MAKE('149') }
    expect(p.role('apvRole'), 'New person').toEqual(greyed)
    await p.press('#apvModeRoster')
    expect(p.$('#apvPid'), 'premise: On the roster mode').not.toBeNull()
    expect(p.role('apvRole'), 'On the roster').toEqual(greyed)
  })
  it('pin: on an admin\'s row not greyed and no line — Hunter on 149\'s page opens Kestrel; Member picked, then Admin back before Save: allowed', async () => {
    signInAs('hunter')
    await pick('u149')
    const p = panel()
    await p.open(PID.kestrel)
    const live = { options: ['Member', 'Admin', 'Master admin(off)'], boxOff: false, line: null, described: null }
    expect(p.role('accEdRole')).toEqual(live)
    await p.set('#accEdRole', 'main')
    expect(p.role('accEdRole'), 'judged on the copy, never on what is picked: Admin still his to pick back').toEqual(live)
    await p.set('#accEdRole', 'admin')
    await p.press('#accEdSave')
    expect(accountById(ACCT.kestrel)?.role, 'nothing changed: Kestrel stays an admin').toBe('admin')
    expect(p.$('.acc-edit'), 'the row closed on its Save').toBeNull()
  })
  it('pin: a master admin\'s row — Hunter on 142\'s page opens Saber: the box greyed whole (as built), no line', async () => {
    signInAs('hunter')
    const p = panel()
    await p.open(PID.saber)
    expect(p.role('accEdRole')).toMatchObject({ boxOff: true, line: null })
  })
  it('pin: never greyed for Kestrel and Saber on 149, nor for Hunter on 142', async () => {
    const live = { options: ['Member', 'Admin', 'Master admin(off)'], boxOff: false, line: null, described: null }
    signInAs('kestrel')
    let p = panel()
    await p.open(PID.osprey)
    expect(p.role('accEdRole'), 'Kestrel on Osprey').toEqual(live)
    cleanup()
    signInAs('saber')
    await pick('u149')
    p = panel()
    await p.open(PID.osprey)
    expect(p.role('accEdRole'), 'Saber on Osprey').toEqual({ ...live, options: ['Member', 'Admin', 'Master admin'] })
    await p.press('#accAddOpen')
    await p.set('#accAddName', 'nova@mail')
    expect(p.role('accAddRole'), 'Saber\'s "+ Add a person" on 149').toEqual({ options: ['Member', 'Admin'], boxOff: false, line: null, described: null })
    cleanup()
    signInAs('hunter')
    p = panel()
    await p.open(PID.ranger)
    expect(p.role('accEdRole'), 'Hunter on Ranger, 142\'s').toEqual(live)
    await p.press('#accAddOpen')
    await p.set('#accAddName', 'nova@mail')
    expect(p.role('accAddRole'), 'Hunter\'s "+ Add a person" on 142').toEqual({ options: ['Member', 'Admin'], boxOff: false, line: null, described: null })
  })
  it('a typed sign-in survives a redraw beside the greyed "Admin", and a rename alone still saves', async () => {
    signInAs('hunter')
    await pick('u149')
    const p = panel()
    await p.open(PID.osprey)
    await p.set('#accEdName', 'osprey@mail')
    await act(async () => { notify() })
    expect((p.$('#accEdName') as HTMLInputElement).value, 'his typing kept').toBe('osprey@mail')
    expect(p.role('accEdRole')?.line).toBe(MAKE('149'))
    await p.press('#accEdSave')
    expect(accountById(ACCT.osprey)?.name, 'the rename saved').toBe('osprey@mail')
    expect(accountById(ACCT.osprey)?.role, 'and nothing else').toBe('main')
  })
})

describe('the guard — the one record of open work and the one judge need no change (§6)', () => {
  it('pin: a Plan given under Hunter\'s open row of that man, by another admin: the row closes with the note, nothing written', async () => {
    expect(as('kestrel', () => updateAccount(ACCT.osprey, { role: 'admin' })), 'setup: Kestrel makes Osprey an admin').toBeNull()
    reload()
    signInAs('hunter')
    await pick('u149')
    const p = panel()
    await p.open(PID.osprey)
    await p.set('#accEdName', 'osprey@mail')
    expect(as('mako', () => saveAccess(ACCT.osprey, { grants: { [third.u150]: 'plan' } })), 'Mako gives Osprey Plan of 150').toBeNull()
    reload()
    await act(async () => { notify() })
    expect(p.$('.acc-edit'), 'the row closed').toBeNull()
    expect(noteSaid(String(P(PID.osprey).cs)), 'his D2730 Q13 note, once').toBe(1)
    expect(accountById(ACCT.osprey)?.name, 'his typing written nowhere').not.toBe('osprey@mail')
  })
  it('…and a Plan his own Undo ends: the row closes with the note, nothing written', async () => {
    expect(as('kestrel', () => updateAccount(ACCT.osprey, { role: 'admin' })), 'setup: Kestrel makes Osprey an admin').toBeNull()
    reload()
    signInAs('hunter')
    expect(saveAccess(ACCT.osprey, { grants: { u142: 'plan' } }), 'Hunter, 142\'s own admin, gives Osprey Plan of 142').toBeNull()
    reload()
    await pick('u149')
    const p = panel()
    await p.open(PID.osprey)
    expect(p.lines().find(l => l.n === '142')?.what, 'premise: the row opened on Plan of 142').toBe('None View Plan*')
    await p.set('#accEdName', 'osprey@mail')
    await act(async () => { globalUndo() })
    expect(level(ACCT.osprey, 'u142'), 'the Undo took the Plan back').toBeNull()
    await act(async () => { notify() })
    expect(p.$('.acc-edit'), 'the row closed').toBeNull()
    expect(noteSaid(String(P(PID.osprey).cs))).toBe(1)
    expect(accountById(ACCT.osprey)?.name).not.toBe('osprey@mail')
  })
  it('…and a role changed under it: Kestrel makes Osprey an admin under Hunter\'s open row — it closes with the note', async () => {
    signInAs('hunter')
    await pick('u149')
    const p = panel()
    await p.open(PID.osprey)
    expect(p.role('accEdRole')?.line, 'premise: Admin greyed for Hunter').toBe(MAKE('149'))
    expect(as('kestrel', () => updateAccount(ACCT.osprey, { role: 'admin' }))).toBeNull()
    reload()
    await act(async () => { notify() })
    expect(p.$('.acc-edit')).toBeNull()
    expect(noteSaid(String(P(PID.osprey).cs))).toBe(1)
  })
  it('pin: …and the presser losing his standing: Saber ends Hunter\'s Plan of 149 under his open 149 row — it closes', async () => {
    signInAs('hunter')
    await pick('u149')
    const p = panel()
    await p.open(PID.osprey)
    expect(as('saber', () => saveAccess(ACCT.hunter, { grants: { u149: 'none' } }))).toBeNull()
    reload()
    await act(async () => { notify() })
    expect(p.$('.acc-edit')).toBeNull()
  })
  it('pin (D2821): another row opened within 149 while Osprey\'s holds typing is not refused — it opens, the typing dropped, no note', async () => {
    signInAs('hunter')
    await pick('u149')
    const p = panel()
    await p.open(PID.osprey)
    await p.set('#accEdName', 'osprey@mail')
    await p.open(PID.kestrel)
    expect((p.$('.acc-edit')?.closest('.acc-row') as HTMLElement | null)?.dataset.person, 'Kestrel\'s row is the one open').toBe(PID.kestrel)
    expect(noteSaid(String(P(PID.osprey).cs)), 'no note').toBe(0)
    expect(vi.mocked(HOOKS.toast).mock.calls.filter(c => c[1] === 'warn'), 'nothing refused').toEqual([])
  })
})

describe('"What each role allows", note 5 (D2817)', () => {
  it('note 5 names who gives Plan and makes admins, in his words', () => {
    expect(ROLES_NOTES[4]).toBe('Only a master admin makes squadrons or master admins. Only a squadron\'s own admins or a master admin can give Plan of it or make its admins.')
  })
})
