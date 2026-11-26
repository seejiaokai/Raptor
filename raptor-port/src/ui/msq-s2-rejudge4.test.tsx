// @vitest-environment jsdom
/* ADMIN → USERS ACROSS SQUADRONS — STEP U1'S FOURTH ROUND: ONE GUARD IN PLACE OF MORE CASES (the brief
   docs/superpowers/briefs/2026-11-26-msq-s2-u1fix4-brief.md; the earlier rounds' tests are msq-s2-rejudge.test.tsx,
   msq-s2-rejudge2.test.tsx and msq-s2-rejudge3.test.tsx).
   Three fix rounds, three reads by four blind readers. Every read found the main rule sound and every read found another
   stale-row case: an opened row worked from what it read when it opened, and only some of that was checked against now.
   THE ONE GUARD: an opened row keeps a COPY of everything it shows and could write over, taken at the press that opened
   it — whether he has a sign-in and which account it is, its sign-in name, his role with the master admin mark, whether it
   is switched on, each other squadron's line, his callsign; on an archived man's row also what its two boxes open on —
   and WHO IS LOOKING: whether the signed-in person's account still makes him an admin of the squadron the row opened on.
   The store is judged against the copy on every draw of the page, on every draw of the row's own editor and at the head
   of every action the row can take. Anything changed → nothing is written, the row closes, the existing note, once.
   What the admin has typed or picked is HIS, not the copy: the page holds it with the open row, so a regrouping of the
   list never drops it. The short row keeps what the second round built — it follows the line he holds today and holds
   only the admin's pick.
   Each reader's proof of the third read is kept here as a lasting test, seen failing on the third round's code
   (ae465d73d) before the app changed, except where named "pin:" (what held already and must go on holding).
   The world: three squadrons (withThird — his D2630), Wed 15 Jul 26, 09:00. Hunter — 142's admin, Plan of 149, View of
   150; Saber — master admin, home 142; Ranger — 142's member, View of 149 and of 150; Kestrel — 149's admin; Osprey —
   149's member; Mako — 150's own admin. */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { StrictMode } from 'react'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { withThird, third, signInAs, PID, ACCT, SIGN, moveMan, on, pastMidnight } from '../test-support/msq-world'
import { UsersPanel } from './UsersPanel'
import { App } from './App'
import { useVersion } from './useStore'
import {
  accountById, accountOfPid, accountsLoad, updateAccount, saveAccess, addAccount, signIn, sessionFor, levelAcct, isAdminAccount,
  levelIn,
} from '../state/accounts'
import { SESSION, ME, setSession, setMe } from '../state/auth'
import { unitsLoad, todayIso, homeOn, grantOfOn } from '../state/units'
import { pickSquadron } from '../state/pick'
import { pageUnit, isAdmin } from '../state/perms'
import { PEOPLE } from '../engine/people'
import { rosterOf } from '../engine/roster'
import { HOOKS } from '../engine/hooks'
import { UNIT } from '../engine/unitview'
import { notify } from '../state/store'
import { CURPAGE, setPage } from '../state/view'
import { globalUndo, globalRedo } from '../undo/timeline'
import { archivePerson } from '../leavewar/sync'
import { updatePersonField } from '../state/quals-write'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

/* A SPY ON ONE DOOR, as in msq-s2-rejudge2.test.tsx: every call of state/accounts.ts saveAccess is recorded and passed to
   the real door; every other name is read from the real module each time it is used, never a copy taken once. */
const spy = vi.hoisted(() => ({
  calls: [] as unknown[][],
  on(real: Record<string, unknown>, name: string, into: unknown[][]): Record<string, unknown> {
    const door = (...a: unknown[]) => { into.push(a); return (real[name] as (...x: unknown[]) => unknown)(...a) }
    const live: Record<string, unknown> = {}
    for (const k of Object.keys(real)) Object.defineProperty(live, k, { enumerable: true, get: () => (k === name ? door : real[k]) })
    return live
  },
}))
vi.mock('../state/accounts', async importOriginal => spy.on(await importOriginal<Record<string, unknown>>(), 'saveAccess', spy.calls))

withThird()
let appPage: ReturnType<typeof render> | null = null
afterEach(() => {
  if (appPage) { appPage.unmount(); appPage = null }
  cleanup()
})

const reload = () => { unitsLoad(); accountsLoad() }
const P = (pid: string): any => (PEOPLE as any)[pid]
const csOf = (pid: string) => String(P(pid).cs)
/* the passing note of his D2730 Q13, word for word */
const noteFor = (cs: string) => `${cs}’s row changed while it was open, so nothing was saved. Open it again.`
const notesFor = (cs: string) => vi.mocked(HOOKS.toast).mock.calls.filter(c => c[0] === noteFor(cs)).length
const anyRowNote = () => vi.mocked(HOOKS.toast).mock.calls.filter(c => String(c[0]).includes('row changed')).length
/* a man on a squadron's roster with no sign-in */
const noSignIn = (unit: string, not: string[] = []): string => {
  const pid = rosterOf(unit, todayIso()).find(id => { const x = P(id); return x && !x.special && !x.archived && !x.deleted && !accountOfPid(id) && !not.includes(id) })
  if (!pid) throw new Error(`the world has no ${unit} man without a sign-in`)
  return pid
}
const level = (acct: string, unit: string) => grantOfOn(levelAcct(accountById(acct)!), unit, todayIso())?.level ?? null
/* another admin's change, landing under the signed-in person: the write made through the real door as `who`, the
   signed-in person's own session put back after it (msq-s2-rejudge2.test.tsx) */
function asOther<T>(who: keyof typeof SIGN, fn: () => T): T {
  const s0 = SESSION, me0 = ME
  const s1 = sessionFor(signIn(SIGN[who][0], SIGN[who][1]) as any)
  setSession(s1); setMe(s1.pid)
  try { return fn() } finally { setSession(s0); setMe(me0) }
}
/* everything stored about a man that a row's button could write over: his account (by its id, and whichever is on him
   now), and whether he is archived or deleted, and his callsign */
const stored = (pid: string, acct?: string | null): string => JSON.stringify({
  byId: acct ? accountById(acct) ?? null : null, onHim: accountOfPid(pid) ?? null,
  arch: !!P(pid).archived, del: !!P(pid).deleted, cs: P(pid).cs,
})

/* ---- the list drawn alone (it redraws on the store's version, as the Admin page does around it) ---- */
type RingIn = { seq: number; pid: string; on: boolean }
function Live(p: { ring?: RingIn }) { useVersion(); return <UsersPanel shown ring={p.ring} /> }
function panel(o: { strict?: boolean; ring?: RingIn } = {}) {
  const tree = (ring?: RingIn) => (o.strict ? <StrictMode><Live ring={ring} /></StrictMode> : <Live ring={ring} />)
  const page = render(tree(o.ring))
  const $ = (sel: string) => page.container.querySelector(sel) as HTMLElement | null
  const $$ = (sel: string) => [...page.container.querySelectorAll<HTMLElement>(sel)]
  const rowOf = (pid: string) => $(`[data-testid="acc-groups"] .acc-row[data-person="${pid}"]`)
  const archRowOf = (pid: string) => $(`#accArchList .acc-row[data-person="${pid}"]`)
  const press = async (sel: string) => { await act(async () => { fireEvent.click($(sel)!) }) }
  const type = async (sel: string, v: string) => { await act(async () => { fireEvent.change($(sel)!, { target: { value: v } }) }) }
  const open = async (pid: string) => { await act(async () => { fireEvent.click(rowOf(pid)!.querySelector('.acc-tap')!) }) }
  const openArch = async (pid: string) => {
    if (!$('#accArchList')) await press('#accArchToggle')
    await act(async () => { fireEvent.click(archRowOf(pid)!.querySelector('.acc-tap')!) })
  }
  const find = async (q: string) => { await type('#accFind', q) }
  const tick = async (t: string) => {
    if (!$('#accFilterPanel')) await press('#accFilter')
    await press(`[data-ftick="${t}"]`)
  }
  const pressed = (unit: string) => {
    const n = $(`[data-testid="acc-sq"] .acc-sq-n[data-unit="${unit}"]`)
    return (n?.nextElementSibling as HTMLElement | null)?.querySelector('[aria-pressed="true"]')?.getAttribute('data-line') ?? null
  }
  const pickLine = async (unit: string, v: string) => {
    const n = $(`[data-testid="acc-sq"] .acc-sq-n[data-unit="${unit}"]`)!
    await act(async () => { fireEvent.click((n.nextElementSibling as HTMLElement).querySelector(`[data-line="${v}"]`)!) })
  }
  const groupOf = (pid: string) => rowOf(pid)?.closest('.acc-list')?.getAttribute('data-unit') ?? null
  /* a bell line's landing handed down by the Admin page */
  const land = async (ring: RingIn) => { await act(async () => { page.rerender(tree(ring)) }) }
  /* no editor of any kind is drawn anywhere on the page */
  const noEditor = () => $('.acc-edit') === null
  return { $, $$, rowOf, archRowOf, press, type, open, openArch, find, tick, pressed, pickLine, groupOf, land, noEditor, html: () => page.container.innerHTML }
}
type Panel = ReturnType<typeof panel>
const pick = async (u: string) => { await act(async () => { await pickSquadron(u) }) }
const redraw = async () => { await act(async () => { notify() }) }
/* a table of cases, each under its own name in plain words (`%s` — written whole, never cut short) */
const named = <T extends { name: string }>(rows: T[]): [string, T][] => rows.map(r => [r.name, r])
const closedWithNote = (p: Panel, pid: string) => {
  expect(p.noEditor(), 'the row closed').toBe(true)
  expect(anyRowNote(), 'the note, once').toBe(1)
  expect(HOOKS.toast).toHaveBeenLastCalledWith(noteFor(csOf(pid)), 'warn')
}

/* ---- the whole app ---- */
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const settle = async () => { await act(async () => { await Promise.resolve(); await Promise.resolve() }) }
async function appOn(who: 'hunter' | 'saber' | 'kestrel', o: { picked?: string; strict?: boolean } = {}) {
  signInAs(who)
  appPage = render(o.strict ? <StrictMode><App /></StrictMode> : <App />)
  await settle()
  if (o.picked) await pick(o.picked)
  await act(async () => { setPage('admin'); notify() })
  await settle()
  expect(CURPAGE, 'premise: the app is on the Admin page').toBe('admin')
}
const appFind = async (pid: string) => {
  await act(async () => { fireEvent.change($('#accFind')!, { target: { value: csOf(pid) } }) })
  const row = $(`[data-testid="acc-groups"] .acc-row[data-person="${pid}"]`)
  expect(row, 'premise: he is on the list').not.toBeNull()
  await act(async () => { fireEvent.click(row!.querySelector('.acc-tap')!) })
}
/* `who` signed in, the app on Admin → Users (after his pick of `picked`, where given), `pid`'s whole row open and a rename
   typed in it — nothing saved */
async function appOnUsers(who: 'hunter' | 'saber' | 'kestrel', pid: string, o: { picked?: string; strict?: boolean } = {}) {
  await appOn(who, o)
  await appFind(pid)
  expect($('#accEdName'), 'premise: his whole row is open').not.toBeNull()
  await act(async () => { fireEvent.change($('#accEdName')!, { target: { value: 'typed@mail' } }) })
  expect(($('#accEdName') as HTMLInputElement).value, 'premise: a rename is typed in it').toBe('typed@mail')
  vi.mocked(HOOKS.toast).mockClear()
}
const lowerHuntersPlan = async () => {
  expect(asOther('saber', () => saveAccess(ACCT.hunter, { grants: { u149: 'view' } })), 'setup: Saber lowers Hunter\'s Plan of 149 to View').toBeNull()
  reload()
  await act(async () => { notify() })
  await settle()
}

/* ---- §16 THE COPY, FIELD BY FIELD — ANOTHER ADMIN'S CHANGE UNDER AN OPEN WHOLE ROW ----
   Hunter (142's admin) has a 142 man's whole row open on 142's own page. Saber, the master admin, changes ONE thing of
   that man through its real door. Each thing is a field of the copy. With a redraw the row closes with the note, once;
   with nothing redrawn every button of the row, pressed, writes nothing — it closes the row with the note instead. */
type Field = {
  name: string
  /* the man whose row is open (Ranger unless named) */
  who?: () => string
  /* done by Saber before the row opens */
  before?: () => unknown
  /* the one change, by Saber, under the open row; true when the door took it */
  change: (pid: string) => boolean
  /* his row has no sign-in when it opens: its buttons are Give sign-in, Archive and Delete */
  give?: true
}
const FIELDS: Field[] = [
  { name: 'his sign-in name', change: () => updateAccount(ACCT.ranger, { name: 'renamed@mail' }) === null },
  { name: 'his role (a member made an admin)', change: () => saveAccess(ACCT.ranger, { role: 'admin' }) === null },
  { name: 'the master admin mark', before: () => saveAccess(ACCT.ranger, { role: 'admin' }), change: () => saveAccess(ACCT.ranger, { master: true }) === null },
  { name: 'his sign-in switched off (suspended)', change: () => updateAccount(ACCT.ranger, { on: false }) === null },
  { name: 'a squadron\'s line (his View of 149 ended)', change: () => saveAccess(ACCT.ranger, { grants: { u149: 'none' } }) === null },
  { name: 'his callsign', change: () => !updatePersonField(PID.ranger, { callsign: 'Rangerx' }) },
  { name: 'a sign-in given to a man who had none', who: () => noSignIn('u142'), give: true, change: pid => addAccount('given.admin@mail', pid, 'admin') === null },
  { name: 'his sign-in put on another man', change: () => updateAccount(ACCT.ranger, { pid: noSignIn('u142') }) === null },
]
/* Hunter on 142's page, the man's whole row open, something typed in it */
async function hunterOpens(f: Field): Promise<{ p: Panel; pid: string; acct: string | null }> {
  if (f.before) { signInAs('saber'); expect(f.before(), `setup for ${f.name}`).toBeNull(); reload() }
  signInAs('hunter')
  const pid = f.who ? f.who() : PID.ranger
  const acct = accountOfPid(pid)?.id ?? null
  const p = panel()
  await p.find(csOf(pid))
  await p.open(pid)
  expect(p.$(f.give ? '#accGiveName' : '#accEdName'), 'premise: his whole row is open').not.toBeNull()
  await p.type(f.give ? '#accGiveName' : '#accEdName', 'typed@mail')
  vi.mocked(HOOKS.toast).mockClear()
  spy.calls.length = 0
  return { p, pid, acct }
}
const saberChanges = (f: Field, pid: string) => {
  expect(asOther('saber', () => f.change(pid)), `setup: Saber changes ${f.name}`).toBe(true)
  reload()
  vi.mocked(HOOKS.toast).mockClear()
  spy.calls.length = 0
}

describe('§16 — the copy, field by field: another admin changes one thing of the man under his open whole row, and the page redraws', () => {
  it.each(named(FIELDS))('%s: the row closes with the note, once — nothing typed is saved', async (_, f) => {
    const { p, pid, acct } = await hunterOpens(f)
    saberChanges(f, pid)
    const was = stored(pid, acct)
    await redraw()
    closedWithNote(p, pid)
    await redraw()
    expect(anyRowNote(), 'and not again on a later draw').toBe(1)
    expect(stored(pid, acct), 'nothing of his was written by the row').toBe(was)
    expect(spy.calls, 'nothing sent').toEqual([])
  })
  it('the fresh Opus\'s finding 1 — Kestrel\'s open "Give sign-in" row; Saber gives the man an Admin sign-in: the row does not turn into "Save" under his hand — it closes with the note, and the man is neither demoted nor renamed', async () => {
    signInAs('kestrel')
    const pid = noSignIn('u149')
    const p = panel()
    await p.find(csOf(pid))
    await p.open(pid)
    expect(p.$('#accGive'), 'premise: his whole row opens to Give sign-in').not.toBeNull()
    await p.type('#accGiveName', 'kestrel.typed@mail')
    vi.mocked(HOOKS.toast).mockClear()
    expect(asOther('saber', () => addAccount('given.admin@mail', pid, 'admin')), 'setup: Saber gives him an admin sign-in').toBeNull()
    reload()
    await redraw()
    expect(isAdminAccount(accountOfPid(pid)), 'premise: he is an admin now').toBe(true)
    expect(p.$('#accEdSave'), 'no Save was put under his hand').toBeNull()
    closedWithNote(p, pid)
    const after = accountOfPid(pid)!
    expect(isAdminAccount(after), 'not demoted').toBe(true)
    expect(after.name, 'not renamed').toBe('given.admin@mail')
  })
  it('opened again after such a change, the row shows what he holds now — the new sign-in name, ready to change', async () => {
    const f = FIELDS[0]!
    const { p, pid } = await hunterOpens(f)
    saberChanges(f, pid)
    await redraw()
    await p.open(pid)
    expect((p.$('#accEdName') as HTMLInputElement).value).toBe('renamed@mail')
  })
})

/* each button of the open row, by its place on the row */
type Btn = { name: string; sel: string; twice?: true }
const BTNS: Btn[] = [
  { name: 'Save', sel: '#accEdSave' }, { name: 'Suspend', sel: '#accEdOnOff' }, { name: 'Archive', sel: '#accEdArchive' },
  { name: 'Delete, both taps', sel: '#accEdDel', twice: true },
]
const GIVE_BTNS: Btn[] = [
  { name: 'Give sign-in', sel: '#accGive' }, { name: 'Archive', sel: '#accEdArchive' }, { name: 'Delete, both taps', sel: '#accEdDel', twice: true },
]
const CASES = FIELDS.flatMap(f => (f.give ? GIVE_BTNS : BTNS).map(b => ({ f, b, name: `${f.name} — ${b.name}` })))

describe('§17 — the copy, field by field: the change lands with NOTHING redrawn, and each button of the still-standing row is pressed', () => {
  it.each(named(CASES))('%s: nothing is written; the note; the row closes', async (_, { f, b }) => {
    const { p, pid, acct } = await hunterOpens(f)
    saberChanges(f, pid)
    const was = stored(pid, acct)
    expect(p.$(b.sel), 'premise: nothing redrew — the row still stands, its button live').not.toBeNull()
    expect((p.$(b.sel) as HTMLButtonElement).disabled, 'premise: the button is not greyed').toBe(false)
    await p.press(b.sel)
    if (b.twice && p.$(b.sel)) await p.press(b.sel)
    expect(stored(pid, acct), 'nothing of his was written').toBe(was)
    expect(spy.calls, 'nothing sent').toEqual([])
    closedWithNote(p, pid)
  })
})

/* ---- §18 THE SAME FIELDS THROUGH THE SIGNED-IN ADMIN'S OWN UNDO AND REDO ----
   Saber, on 142's own page, changes one thing of a 142 man through its door, opens his row and types; his own Undo takes
   the change back under the open row, and his Redo puts it back under the row opened again. (A sign-in given, and one
   put on another man, are steps of his Undo too.) */
const UNDO_FIELDS = FIELDS
describe('§18 — the copy, field by field: the signed-in admin\'s own Undo, then Redo, under his open whole row', () => {
  it.each(named(UNDO_FIELDS))('%s: Undo closes the row with the note, once; opened again, Redo closes it with the note, once', async (_, f) => {
    signInAs('saber')
    if (f.before) { expect(f.before(), `setup for ${f.name}`).toBeNull(); reload() }
    const pid = f.who ? f.who() : PID.ranger
    expect(f.change(pid), `setup: Saber himself changes ${f.name}`).toBe(true)
    reload()
    const p = panel()
    /* (his callsign, where the change renamed him) */
    await p.find(csOf(pid))
    await p.open(pid)
    expect(p.$('.acc-edit'), 'premise: his row is open').not.toBeNull()
    const box = p.$('#accEdName') ? '#accEdName' : '#accGiveName'
    await p.type(box, 'typed@mail')
    vi.mocked(HOOKS.toast).mockClear()
    spy.calls.length = 0
    await act(async () => { expect(globalUndo().ok, 'his own Undo went through').toBe(true); reload(); notify() })
    /* (the search follows a man whose callsign the Undo put back) */
    if (!p.rowOf(pid)) await p.find(csOf(pid))
    closedWithNote(p, pid)
    expect(spy.calls, 'nothing sent by the row').toEqual([])
    await p.open(pid)
    expect(p.$('.acc-edit'), 'premise: opened again').not.toBeNull()
    const box2 = p.$('#accEdName') ? '#accEdName' : '#accGiveName'
    await p.type(box2, 'typed.again@mail')
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => { expect(globalRedo().ok, 'his own Redo went through').toBe(true); reload(); notify() })
    if (!p.rowOf(pid)) await p.find(csOf(pid))
    closedWithNote(p, pid)
    expect(spy.calls, 'nothing sent by the row').toEqual([])
  })
})

/* ---- §19 THE ARCHIVED MAN'S ROW — ITS FIELDS ----
   Kestrel has archived Osprey and has his archived row open on 149's page, a new callsign typed in its box. The copy
   holds what the whole row's holds, and what its two boxes open on: his callsign (or the next free one where a man on the
   roster holds it), and the post-in date. */
type ArchField = { name: string; change: () => boolean; midnight?: true }
const ARCH_FIELDS: ArchField[] = [
  { name: 'his sign-in name', change: () => updateAccount(ACCT.osprey, { name: 'renamed@mail' }) === null },
  { name: 'his callsign', change: () => !updatePersonField(PID.osprey, { callsign: 'Ospreyx' }) },
  { name: 'a man on the roster now holds his callsign (the callsign box would open on the next free one)', change: () => !updatePersonField(noSignIn('u149'), { callsign: 'Osprey' }) },
  { name: 'the date rolls past midnight (the post-in box would open on the new day)', change: () => { on(16); return true }, midnight: true },
]
const ARCH_BTNS: Btn[] = [
  { name: 'Restore as', sel: '#accArRestore' }, { name: 'Save name', sel: '#accArSave' }, { name: 'Delete, both taps', sel: '#accArDel', twice: true },
]
async function kestrelOpensArchived(): Promise<Panel> {
  signInAs('kestrel')
  const r = archivePerson(PID.osprey)
  expect(r.bad, 'setup: Kestrel archives Osprey').toBeFalsy()
  reload()
  const p = panel()
  await p.openArch(PID.osprey)
  expect(p.$('#accArCs'), 'premise: his archived row is open').not.toBeNull()
  await p.type('#accArCs', 'Typedname')
  vi.mocked(HOOKS.toast).mockClear()
  spy.calls.length = 0
  return p
}
const underArchived = (f: ArchField) => {
  expect(f.midnight ? f.change() : asOther('saber', f.change), `setup: ${f.name}`).toBe(true)
  reload()
  vi.mocked(HOOKS.toast).mockClear()
}
const ARCH_CASES = ARCH_FIELDS.flatMap(f => ARCH_BTNS.map(b => ({ f, b, name: `${f.name} — ${b.name}` })))

describe('§19 — the archived man\'s row: its copy, field by field', () => {
  it.each(named(ARCH_FIELDS))('%s, and the page redraws: the row closes with the note, once', async (_, f) => {
    const p = await kestrelOpensArchived()
    underArchived(f)
    const was = stored(PID.osprey, ACCT.osprey)
    await redraw()
    closedWithNote(p, PID.osprey)
    await redraw()
    expect(anyRowNote(), 'and not again').toBe(1)
    expect(stored(PID.osprey, ACCT.osprey), 'nothing of his was written by the row').toBe(was)
  })
  it.each(named(ARCH_CASES))('%s, with NOTHING redrawn: nothing is written; the note; the row closes', async (_, { f, b }) => {
    const p = await kestrelOpensArchived()
    underArchived(f)
    const was = stored(PID.osprey, ACCT.osprey)
    expect(p.$(b.sel), 'premise: nothing redrew — the row still stands').not.toBeNull()
    await p.press(b.sel)
    if (b.twice && p.$(b.sel)) await p.press(b.sel)
    expect(stored(PID.osprey, ACCT.osprey), 'nothing of his was written').toBe(was)
    closedWithNote(p, PID.osprey)
  })
  it('his callsign through the signed-in admin\'s own Undo and Redo (a rename made on Quals\' door before he was archived is no step here — the rename is made on his archived row, then taken back from the top bar)', async () => {
    signInAs('kestrel')
    expect(archivePerson(PID.osprey).bad).toBeFalsy()
    reload()
    expect(updatePersonField(PID.osprey, { callsign: 'Ospreyx' }), 'setup: Kestrel renames the archived man').toBeFalsy()
    reload()
    const p = panel()
    await p.openArch(PID.osprey)
    await p.type('#accArCs', 'Typedname')
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => { expect(globalUndo().ok, 'his own Undo went through').toBe(true); reload(); notify() })
    expect(csOf(PID.osprey), 'premise: the rename is undone').toBe('Osprey')
    closedWithNote(p, PID.osprey)
    await p.openArch(PID.osprey)
    await p.type('#accArCs', 'Typedname')
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => { expect(globalRedo().ok, 'his own Redo went through').toBe(true); reload(); notify() })
    closedWithNote(p, PID.osprey)
  })
  it('a row\'s own action never trips it: Save name leaves the row open with a fresh copy — no note on that draw or a later one, and Restore then goes through under the new name', async () => {
    const p = await kestrelOpensArchived()
    await p.press('#accArSave')
    expect(csOf(PID.osprey), 'renamed').toBe('Typedname')
    expect(p.$('#accArCs'), 'the row stays open').not.toBeNull()
    await redraw()
    expect(p.$('#accArCs'), 'still open after a later draw').not.toBeNull()
    expect(anyRowNote(), 'his own write: no note').toBe(0)
    await p.press('#accArRestore')
    expect(!!P(PID.osprey).archived, 'restored').toBe(false)
    expect(anyRowNote(), 'no note').toBe(0)
    expect(p.noEditor(), 'and no row left open').toBe(true)
  })
})

/* ---- §20 A FIELD LEFT OUT OF THE COPY IS CAUGHT ----
   Tests of how the editors are written, and one of what they do.
   (a) BY THE NAMES AN EDITOR USES: the whole row's editor and the archived row's editor read the man ONLY through the
       copy handed to them. Every name the file imports or declares that either editor uses must be on the short list
       below — the doors it writes through, the checks it asks at a press, the parts it draws with. A reader of the store
       CALLED BY NAME inside an editor (his account, his person, a posting, anything) turns this red until the value comes
       through the copy instead.
   (a2) BY WHAT AN EDITOR IS HANDED (the fifth round — the security reader's, Astra's and the fresh Fable's judgement of
       (a): it would not fail if a value of the man were handed to an editor as a NEW PROP by his row, which reads his
       account itself): each editor's props are pinned — the names its signature declares, the names its row hands it,
       and the names its code reads from them. A new prop fails until listed here with its reason.
   (a3) BY THE PARTS AN EDITOR TRUSTS WITH HIS ID (the fifth round — the same judgement: nor would (a) fail if a part on
       the list began reading the man): the same name check on rowLocks, SquadronLines and lineState, each with its own
       short list.
   (b) BY WHAT IS DRAWN: every stored field of the man's account and of his person record is changed in turn, in memory,
       under his open row. Either the row closes — the copy held it — or nothing the row draws changed: the still-open row
       and a row opened afresh both read character for character as before. A field the editor shows that the copy does
       not hold fails here by name.
   WHAT THIS STILL DOES NOT PROVE — said so no one leans on it for more:
   - the parts it does not walk into: the other parts on the editors' lists (RoleBox, RolesFold, PostInField, the doors
     and the checks) are trusted to read nothing of the man beyond what they are handed; a part called by one of the
     three walked parts is not walked either (SqLine draws what it is handed);
   - a name check sees a reader called by name, never a value reached another way (a module's own state, a closure);
   - (b) varies the fields his account and his person record CARRY in the test's world — not a field Ranger's or
     Osprey's records do not hold (the master admin mark, how his sign-in was switched off, where his admin role was
     given), and not a value used only in a write or a comparison at a press, which draws nothing;
   - nothing held in another record: his squadron rows and his postings. What an editor shows of those — his home
     squadron's line, which squadron's admin may change the rest of his row — hangs on his home that day, which is one
     of the four judged facts the row holds from the press (rowChanged), tested in the earlier rounds' files. */
const SRC = readFileSync(join(__dirname, 'UsersPanel.tsx'), 'utf8')
const SRC_PARTS = readFileSync(join(__dirname, 'UserAccess.tsx'), 'utf8')
const SRC_MODEL = readFileSync(join(__dirname, 'useraccess-model.ts'), 'utf8')
/* code with its comments and quoted words taken out (words inside `${…}` kept — they are code) */
const bare = (code: string): string => code
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/`(?:[^`\\]|\\.)*`/g, t => (t.match(/\$\{[^}]*\}/g) ?? []).join(' '))
  .replace(/'(?:[^'\\\n]|\\.)*'/g, ' ').replace(/"(?:[^"\\\n]|\\.)*"/g, ' ')
/* the names code uses — never a field read after a dot (`s.cs` is the copy's field, not the file's `cs()`) */
const namesIn = (code: string): string[] => bare(code).match(/(?<![.\w$])[A-Za-z_$][\w$]*/g) ?? []
/* where a top-level function of a file starts (its own or one it hands out) */
function startOf(fn: string, src: string): number {
  const own = src.indexOf(`\nfunction ${fn}(`), out = src.indexOf(`\nexport function ${fn}(`)
  if (own < 0 && out < 0) throw new Error(`the file has no function ${fn}`)
  return own >= 0 ? own : out
}
/* the code of a top-level function of a file */
function bodyOf(fn: string, src: string = SRC): string {
  const at = startOf(fn, src)
  return src.slice(at, src.indexOf('\n}\n', at))
}
/* every name a file brings in or declares at its top level */
function fileNames(src: string = SRC): Set<string> {
  const out = new Set<string>()
  for (const m of src.matchAll(/^import\s+(?:type\s+)?\{([^}]*)\}\s+from/gm)) {
    for (const part of m[1]!.split(',')) { const n = part.trim().replace(/^type\s+/, '').split(/\s+as\s+/).pop()!.trim(); if (n) out.add(n) }
  }
  for (const m of src.matchAll(/^(?:export\s+)?(?:const|function|type|interface)\s+([A-Za-z_$][\w$]*)/gm)) out.add(m[1]!)
  return out
}
const usedOf = (fn: string, src: string = SRC): string[] => {
  const names = fileNames(src)
  return [...new Set(namesIn(bodyOf(fn, src)))].filter(n => names.has(n) && n !== fn).sort()
}
/* THE PROPS OF A PART, THREE WAYS. `declared` — the names its signature lists (`function X(p: { … }) {`); `read` — the
   names its code reads from them (`p.name`, and `const { a, b } = p`); `handed` — the names every place that draws it
   hands it (`<X name={…} />`, each brace's inside left out, so a `=` inside a value is never taken for a prop). */
function propsOf(fn: string, src: string = SRC): { declared: string[]; read: string[]; handed: string[] } {
  const at = startOf(fn, src)
  const sigEnd = src.indexOf(') {', at)
  const sig = bare(src.slice(src.indexOf('(p: {', at) + 5, sigEnd))
  const declared = [...sig.matchAll(/(?:^|[;\n])\s*([A-Za-z_$][\w$]*)\??\s*:/g)].map(m => m[1]!)
  const body = bare(src.slice(sigEnd, src.indexOf('\n}\n', at)))
  const read = new Set([...body.matchAll(/(?<![.\w$])p\.([A-Za-z_$][\w$]*)/g)].map(m => m[1]!))
  for (const m of body.matchAll(/\{([^{}]*)\}\s*=\s*p\b(?!\.)/g)) for (const part of m[1]!.split(',')) { const n = part.split(':')[0]!.trim(); if (n) read.add(n) }
  const handed = new Set<string>()
  const code = bare(src)
  for (let i = code.indexOf(`<${fn} `); i >= 0; i = code.indexOf(`<${fn} `, i + 1)) {
    let depth = 0, flat = ''
    for (let j = i + fn.length + 1; j < code.length; j++) {
      const ch = code[j]!
      if (ch === '{') depth++
      else if (ch === '}') depth--
      else if (depth === 0) { if (ch === '>') break; flat += ch }
    }
    for (const m of flat.matchAll(/([A-Za-z_$][\w$-]*)\s*=/g)) handed.add(m[1]!)
  }
  return { declared: declared.sort(), read: [...read].sort(), handed: [...handed].sort() }
}
/* WHAT AN EDITOR MAY USE BESIDE THE COPY. Types; React's state; the judging (useJudgedOnDraw, askAgain); the doors it
   writes through and the checks it asks at a press; the parts it draws with; fixed words and limits; and, in the whole
   row, what of the row is the SIGNED-IN admin's to change (rowLocks, actorIsMaster — his rights, read afresh on every
   draw and judged again by the doors; never a fact of the man). In the archived row, `Typed` — what the admin has typed
   in its two boxes, the page's since the fifth round, as the whole row's typing is: his, never a reading of the man.
   (The rows' reports to the leave-guard — useGuardWork, with typedDiffers — left both lists in the fifth round: the page
   works them out now, from what it holds, and an editor reports nothing.) */
const WHOLE_MAY_USE = [
  'OpenedOn', 'Shown', 'Typed', 'useState', 'useJudgedOnDraw', 'askAgain', 'rowLocks', 'actorIsMaster', 'accessWant',
  'saveAccess', 'updateAccount', 'addAccount', 'archivePerson', 'deletePerson', 'markBack', 'done', 'notify',
  'RoleBox', 'SquadronLines', 'RolesFold', 'MAX_SIGNIN', 'DELETE_GOES',
].sort()
const ARCH_MAY_USE = [
  'OpenedOn', 'Shown', 'Typed', 'useState', 'useJudgedOnDraw', 'askAgain',
  'restoreArchivedAs', 'restoreArchivedPerson', 'restoreProblem', 'callsignProblem', 'updatePersonField', 'deletePerson',
  'done', 'notify', 'HOOKS', 'PostInField', 'CALLSIGN_LABEL', 'DELETE_GOES',
].sort()
/* WHAT EACH EDITOR IS HANDED — exactly: whose row (`pid`, an id — never a reading of him), the judgement held from the
   press (`on`), the copy (`s`), what the admin has typed (`typed`, with `onTyped`), and what it tells the page: close
   (`onClose`), judge again (`onStale`), and — the archived row's Save name — "this write was the row's own" (`onWrote`).
   A new prop is listed here with its reason, or its value goes through the copy. */
const WHOLE_PROPS = ['pid', 'on', 's', 'typed', 'onTyped', 'onClose', 'onStale'].sort()
const ARCH_PROPS = ['pid', 'on', 's', 'typed', 'onTyped', 'onClose', 'onStale', 'onWrote'].sort()
/* WHAT THE THREE PARTS HANDED HIS ID OR HIS LINES MAY USE.
   rowLocks — whose admin may change the rest of his row: his home that day (one of the four judged facts) and the
   SIGNED-IN admin's own rights, read afresh.
   SquadronLines — the lines as drawn: the squadrons and their order, his home that day (it marks his "Home squadron"
   line), each line's state (lineState), its own row part and words.
   lineState — a line's state from what it is handed and the SIGNED-IN admin's own rights. */
const LOCKS_MAY_USE = ['homeOn', 'todayIso', 'adminOfUnit', 'actorIsMaster'].sort()
const LINES_MAY_USE = ['AccessLine', 'RolePick', 'units', 'homeOn', 'todayIso', 'inSquadronOrder', 'numOf', 'lineState', 'SqLine', 'WORD'].sort()
const LINESTATE_MAY_USE = ['AccessLine', 'RolePick', 'numOf', 'adminOfUnit', 'actorIsMaster'].sort()

describe('§20 — a field left out of the copy is caught', () => {
  it('(a) the whole row\'s editor reads the man only through the copy: it uses no name of the file beyond its doors, its checks and its parts', () => {
    expect(usedOf('PersonEditor'), 'a new reader in the whole row\'s editor: hand its value through the copy (shownOf), or — a door, a check, a part — list it here with its reason').toEqual(WHOLE_MAY_USE)
  })
  it('(a) the archived row\'s editor likewise', () => {
    expect(usedOf('ArchivedEditor'), 'a new reader in the archived row\'s editor: hand its value through the copy (shownOf), or list it here with its reason').toEqual(ARCH_MAY_USE)
  })
  it('(a2) the whole row\'s editor is handed exactly today\'s props — declared, handed by his row, and read: a value of the man cannot come in as a new prop', () => {
    const why = 'a new prop of the whole row\'s editor: hand its value through the copy (shownOf), or list it here with its reason'
    const props = propsOf('PersonEditor')
    expect(props.declared, why).toEqual(WHOLE_PROPS)
    expect(props.handed, why).toEqual(WHOLE_PROPS)
    expect(props.read.filter(n => !WHOLE_PROPS.includes(n)), 'it reads a prop it does not declare').toEqual([])
  })
  it('(a2) the archived row\'s editor likewise', () => {
    const why = 'a new prop of the archived row\'s editor: hand its value through the copy (shownOf), or list it here with its reason'
    const props = propsOf('ArchivedEditor')
    expect(props.declared, why).toEqual(ARCH_PROPS)
    expect(props.handed, why).toEqual(ARCH_PROPS)
    expect(props.read.filter(n => !ARCH_PROPS.includes(n)), 'it reads a prop it does not declare').toEqual([])
  })
  it('(a3) the parts handed his id or his lines read nothing else of the man: rowLocks, SquadronLines and lineState each use only the names on their own list', () => {
    const why = 'a new reader in a part an editor trusts: hand its value in from the copy, or list it here with its reason'
    expect(usedOf('rowLocks'), why).toEqual(LOCKS_MAY_USE)
    expect(usedOf('SquadronLines', SRC_PARTS), why).toEqual(LINES_MAY_USE)
    expect(usedOf('lineState', SRC_MODEL), why).toEqual(LINESTATE_MAY_USE)
  })
  it('(a2, a3) red-proven on the file with one line planted (the fresh Fable\'s two roads): his account handed to the editor as a prop and read as `p.a.name` is seen by the props; a reader of his account planted inside rowLocks is seen by its list', () => {
    /* the very shape the editor had before the fourth round — `a={a}` */
    const prop = SRC
      .replace('<PersonEditor pid={p.pid} on={openOn}', () => '<PersonEditor pid={p.pid} a={a} on={openOn}')
      .replace('    const renamed = name !== s.name\n', () => '    const renamed = name !== p.a.name\n')
    expect(prop.includes('a={a} on={openOn}') && prop.includes('name !== p.a.name'), 'premise: both lines were planted').toBe(true)
    expect(usedOf('PersonEditor', prop), 'premise: the name check alone does not see it').toEqual(WHOLE_MAY_USE)
    expect(propsOf('PersonEditor', prop).handed, 'handed by his row').toContain('a')
    expect(propsOf('PersonEditor', prop).read, 'and read in the editor').toContain('a')
    const part = SRC.replace('  const rest = !home || adminOfUnit(home)\n', () => '  const rest = (!home || adminOfUnit(home)) && accountOfPid(pid)?.on !== false\n')
    expect(part, 'premise: the line was planted').not.toBe(SRC)
    expect(usedOf('PersonEditor', part), 'premise: the editor\'s own list does not see it').toEqual(WHOLE_MAY_USE)
    expect(usedOf('rowLocks', part), 'the part\'s own list does').toContain('accountOfPid')
    /* and a `=` inside a handed value is never taken for a prop */
    expect(propsOf('X', '\nfunction X(p: {\n  a: string; b?: (v: string) => void\n}) {\n  const { a } = p\n  return p.b\n}\nconst y = <X a={q === 1 ? r : s} b={v => { t = v }} />\n')).toEqual({ declared: ['a', 'b'], read: ['a', 'b'], handed: ['a', 'b'] })
  })
  it('(a) red-proven: the counter sees a reader of the store called in code, and not one named in a comment or a quoted word', () => {
    const names = new Set(['accountOfPid', 'cs'])
    const seen = (code: string) => namesIn(code).filter(n => names.has(n))
    expect(seen('const a = accountOfPid(p.pid)')).toEqual(['accountOfPid'])
    expect(seen('/* accountOfPid(pid) */ const x = 1')).toEqual([])
    expect(seen('t(\'accountOfPid\')')).toEqual([])
    expect(seen('toast(`${cs(p.pid)} deleted`)')).toEqual(['cs'])
    expect(seen('const callsign = s.cs'), 'a field of the copy is not the file\'s reader of that name').toEqual([])
    /* and the two editors as they stood before this round would have failed: each read his account and his callsign itself */
    expect(seen('const callsign = cs(p.pid); const [name, setName] = useState(a ? a.name : \'\'); const b = accountOfPid(p.pid)')).toEqual(['cs', 'accountOfPid'])
  })

  /* one stored value changed in memory: a role becomes the other role, any other word gets a letter, a yes becomes a
     no, a number goes up by one */
  const changed = (v: unknown): unknown => (v === 'main' ? 'admin' : v === 'admin' ? 'main'
    : typeof v === 'string' ? `${v}x` : typeof v === 'boolean' ? !v : typeof v === 'number' ? v + 1 : undefined)
  /* every stored field of `rec` in turn, under the row `openRow` opens; `ed` the open editor's markup, or null where none */
  async function everyFieldOf(what: string, rec: Record<string, unknown>, openRow: () => Promise<void>, close: () => Promise<void>, ed: () => string | null): Promise<string[]> {
    const closedBy: string[] = []
    for (const k of Object.keys(rec)) {
      const v = rec[k]
      const next = changed(v)
      if (next === undefined) continue
      await openRow()
      const h0 = ed()
      expect(h0, `premise (${what}.${k}): the row is open`).not.toBeNull()
      rec[k] = next
      await redraw()
      const h1 = ed()
      if (h1 === null) closedBy.push(k)
      else {
        expect(h1, `${what}.${k} changed and the row stayed open: what it draws must not have changed`).toBe(h0)
        await close()
        await openRow()
        expect(ed(), `${what}.${k} changed and the row stayed open: a row opened afresh must read the same — else the editor shows a field the copy does not hold`).toBe(h0)
      }
      rec[k] = v
      await redraw()
      if (ed() !== null) await close()
    }
    return closedBy
  }
  it('(b) the whole row: each stored field of his account and of his person, changed in turn — the row closes, or nothing it draws changed', async () => {
    signInAs('hunter')
    const p = panel()
    await p.find('Ranger')
    const ed = () => p.rowOf(PID.ranger)?.querySelector('.acc-edit')?.outerHTML ?? null
    const openRow = async () => { if (!p.rowOf(PID.ranger)) await p.find('Ranger'); await p.open(PID.ranger) }
    const close = async () => { await p.press('#accEdCancel') }
    const byAcct = await everyFieldOf('account', accountById(ACCT.ranger) as any, openRow, close, ed)
    expect(byAcct, 'the fields of his account the copy holds').toEqual(expect.arrayContaining(['id', 'name', 'role', 'pid', 'on']))
    const byPerson = await everyFieldOf('person', P(PID.ranger), openRow, close, ed)
    expect(byPerson, 'the copy holds his callsign').toEqual(expect.arrayContaining(['cs']))
  })
  it('(b) the archived row: each stored field of his account and of his person, changed in turn — the row closes, or nothing it draws changed', async () => {
    signInAs('kestrel')
    expect(archivePerson(PID.osprey).bad).toBeFalsy()
    reload()
    const p = panel()
    await p.press('#accArchToggle')
    const ed = () => p.archRowOf(PID.osprey)?.querySelector('.acc-edit')?.outerHTML ?? null
    const openRow = async () => { if (!p.$('#accArchList')) await p.press('#accArchToggle'); await p.openArch(PID.osprey) }
    const close = async () => { await p.press('#accArCancel') }
    const byAcct = await everyFieldOf('account', accountById(ACCT.osprey) as any, openRow, close, ed)
    expect(byAcct, 'the fields of his account the copy holds').toEqual(expect.arrayContaining(['id', 'name', 'pid']))
    const byPerson = await everyFieldOf('person', P(PID.osprey), openRow, close, ed)
    expect(byPerson, 'the copy holds his callsign, and that he is archived').toEqual(expect.arrayContaining(['cs', 'archived']))
  })
})

/* ---- §21 WHAT THE ADMIN PICKED OR TYPED IS HELD BY THE PAGE WITH THE OPEN ROW (Astra's finding 1 of the third read) ----
   Each group of the list draws under its own parent, so a man who moves between groups has his editor made anew; the
   short row's pick and the whole row's typing lived inside the editor and went with it, without a word. The page now
   holds them with the open row: null at a fresh opening, cleared at close. */
describe('§21 — a regrouping of the list never drops what the admin picked or typed', () => {
  it.each([false, true])('Astra 1: Saber on 149\'s page, Squadron ticks 149 and 150, Hunter\'s short row open with View picked; his own Undo takes Hunter\'s Plan of 149 away — Hunter is listed under 150 now, the row still open, View still picked and marked, and Save sends it (every draw twice: %s)', async strict => {
    signInAs('saber')
    await pick('u149')
    /* Hunter plans both; giving 149 again is the latest command, so Undo removes only that */
    expect(saveAccess(ACCT.hunter, { grants: { [third.u150]: 'plan' } })).toBeNull(); reload()
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'none' } })).toBeNull(); reload()
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull(); reload()
    const p = panel({ strict })
    await p.tick('sqn:u149')
    await p.tick(`sqn:${third.u150}`)
    await p.press('#accFilter')
    expect(p.groupOf(PID.hunter), 'premise: listed under 149').toBe('u149')
    await p.open(PID.hunter)
    expect(p.$('.acc-edit')?.getAttribute('data-short'), 'premise: his short row').toBe('1')
    expect(p.pressed('u149')).toBe('plan')
    await p.pickLine('u149', 'view')
    expect(p.$('.acc-edit')?.getAttribute('data-unsaved'), 'premise: marked as not saved').toBe('true')
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => { expect(globalUndo().ok).toBe(true); reload(); notify() })
    expect(pageUnit('own')).toBe('u149')
    expect(levelIn(ACCT.hunter, 'u149', todayIso()), 'premise: his Plan of 149 is gone').toBeNull()
    expect(p.groupOf(PID.hunter), 'still listed, now under 150').toBe(third.u150)
    expect(p.rowOf(PID.hunter)?.querySelector('.acc-edit'), 'the row is still open').not.toBeNull()
    expect(p.pressed('u149'), 'his View pick is still there').toBe('view')
    expect(p.$('.acc-edit')?.getAttribute('data-unsaved'), 'and still marked').toBe('true')
    expect(anyRowNote(), 'no note').toBe(0)
    spy.calls.length = 0
    await p.press('#accEdSave')
    reload()
    expect(spy.calls, 'one call, 149\'s line alone').toEqual([[ACCT.hunter, { grants: { u149: 'view' } }]])
    expect(levelIn(ACCT.hunter, 'u149', todayIso()), 'Save applies the choice made before the Undo').toBe('view')
  })
  /* a whole row can change group too: a man of the page's squadron listed under another squadron's heading for his Plan of
     it (a master admin's Squadron tick), whose own squadron is then ticked as well */
  const kestrelUnder150 = async () => {
    signInAs('saber')
    await pick('u149')
    expect(saveAccess(ACCT.kestrel, { grants: { [third.u150]: 'plan' } }), 'setup: Kestrel is given Plan of 150').toBeNull(); reload()
    const p = panel()
    await p.tick(`sqn:${third.u150}`)
    expect(p.groupOf(PID.kestrel), 'premise: 149\'s Kestrel is listed under 150, for his Plan of it').toBe(third.u150)
    await p.open(PID.kestrel)
    expect(p.$('#accEdName'), 'premise: on 149\'s page his row is whole').not.toBeNull()
    await p.type('#accEdName', 'typed@mail')
    vi.mocked(HOOKS.toast).mockClear()
    spy.calls.length = 0
    return p
  }
  it('the whole row, regrouped by the admin\'s own tick: Kestrel moves under 149\'s heading — the row is still open and what was typed is still in its box; no note', async () => {
    const p = await kestrelUnder150()
    await p.tick('sqn:u149')
    expect(p.groupOf(PID.kestrel), 'premise: now under his own squadron\'s heading').toBe('u149')
    expect(p.rowOf(PID.kestrel)?.querySelector('.acc-edit'), 'the row is still open').not.toBeNull()
    expect((p.$('#accEdName') as HTMLInputElement | null)?.value, 'his typing is still there').toBe('typed@mail')
    expect(anyRowNote(), 'no note').toBe(0)
  })
  it('the whole row, regrouped by no act of his (his own Undo of the Plan, a search keeping the man listed): a line of his changed under the row — it closes with the note, once; never left open with the typing gone', async () => {
    const p = await kestrelUnder150()
    await p.find('Kestrel')
    expect(p.groupOf(PID.kestrel), 'premise: still under 150').toBe(third.u150)
    expect((p.$('#accEdName') as HTMLInputElement | null)?.value, 'premise: still open, his typing there').toBe('typed@mail')
    await act(async () => { expect(globalUndo().ok).toBe(true); reload(); notify() })
    expect(p.groupOf(PID.kestrel), 'premise: found by the search, under his own squadron now').toBe('u149')
    closedWithNote(p, PID.kestrel)
    expect(accountById(ACCT.kestrel)!.name, 'nothing typed was saved').not.toBe('typed@mail')
  })
  /* (re-pointed by U1's sixth round — the fresh Opus 1's and 2's finding 1, Astra's finding 1: the row once fell back to
     the "No sign-in" words when his sign-in went, the pick dropped without a word, and then showed the new sign-in's line
     untouched; it now closes with the note on the draw his sign-in goes — msq-s2-rejudge6.test.tsx §35. What this test
     held stays held: no pick is ever carried onto the new sign-in, and nothing is sent.) */
  it('a pick is his for the sign-in it was made on: Kestrel picks None for Ranger; the master admin puts Ranger\'s sign-in on another man — the row closes with the note, once; he is given a new one: nothing of the pick is carried onto it, and nothing is sent', async () => {
    signInAs('kestrel')
    const other = noSignIn('u142')
    const p = panel()
    await p.find('Ranger')
    await p.open(PID.ranger)
    await p.pickLine('u149', 'none')
    expect(p.$('.acc-edit')?.getAttribute('data-unsaved'), 'premise: marked').toBe('true')
    vi.mocked(HOOKS.toast).mockClear()
    spy.calls.length = 0
    expect(asOther('saber', () => updateAccount(ACCT.ranger, { pid: other }))).toBeNull(); reload(); await redraw()
    closedWithNote(p, PID.ranger)
    expect(asOther('saber', () => addAccount('ranger.new@mail', PID.ranger, 'main'))).toBeNull(); reload()
    const fresh = accountOfPid(PID.ranger)!
    expect(asOther('saber', () => saveAccess(fresh.id, { grants: { u149: 'view' } }))).toBeNull(); reload(); await redraw()
    expect(p.noEditor(), 'the row stays closed').toBe(true)
    expect(anyRowNote(), 'and the note is not said again').toBe(1)
    await p.open(PID.ranger)
    expect(p.pressed('u149'), 'opened again: the line his new sign-in holds').toBe('view')
    expect(p.$('.acc-edit')?.hasAttribute('data-unsaved'), 'no pick is carried from the old sign-in').toBe(false)
    spy.calls.length = 0
    await p.press('#accEdSave')
    expect(spy.calls, 'nothing sent').toEqual([])
    expect(level(fresh.id, 'u149')).toBe('view')
  })
  it('pin: a row hidden by his own search and brought back keeps what he typed in it (the page holds it), nothing changed meanwhile — no note', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.find('Osprey')
    await p.open(PID.osprey)
    await p.type('#accEdName', 'typed@mail')
    await p.find('zzzz')
    expect(p.rowOf(PID.osprey), 'premise: off the list').toBeNull()
    await p.find('Osprey')
    expect((p.$('#accEdName') as HTMLInputElement | null)?.value).toBe('typed@mail')
    expect(anyRowNote()).toBe(0)
  })
})

/* ---- §22 A BELL LINE'S LANDING CLOSES AN OPEN ROW (the fresh Opus's finding 2 of the third read) ----
   A landing clears the search and moves the Archived fold while drawing. The third round took that for the admin's own
   putting-away, so an open row found by the search was held out of sight, its pick lost without a word, and came back
   open with no press. A bell tap is his own act, as his pick is: a landing for another man closes the open row in that
   draw, with no note, before the search and the fold change. */
describe('§22 — a bell line\'s landing for another man closes the open row, with no note', () => {
  it('the fresh Opus 2: Kestrel opens Ranger (142\'s, found by the search) and picks a line; a bell line for Osprey lands — the search is cleared, and Ranger\'s row is closed: found again it is closed, nothing said, nothing sent', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.find('Ranger')
    await p.open(PID.ranger)
    await p.pickLine('u149', 'none')
    expect(p.$('.acc-edit[data-unsaved="true"]'), 'premise: a pick not yet saved').not.toBeNull()
    vi.mocked(HOOKS.toast).mockClear()
    spy.calls.length = 0
    await p.land({ seq: 1, pid: PID.osprey, on: true })
    expect((p.$('#accFind') as HTMLInputElement).value, 'premise: the landing cleared the search').toBe('')
    expect(p.rowOf(PID.ranger), 'premise: Ranger is off the list without the search').toBeNull()
    expect(p.rowOf(PID.osprey)!.classList.contains('acc-ring'), 'premise: the landing ringed Osprey').toBe(true)
    await p.find('Ranger')
    expect(p.rowOf(PID.ranger), 'found again').not.toBeNull()
    expect(p.noEditor(), 'closed — never back open with no press').toBe(true)
    expect(anyRowNote(), 'his own bell tap: no note').toBe(0)
    expect(spy.calls).toEqual([])
    expect(level(ACCT.ranger, 'u149'), 'his View of 149 untouched').toBe('view')
  })
  it('the archived fold: Kestrel has an archived man\'s row open, a callsign typed; a bell line for a man on the roster lands and shuts the fold — the row is closed: with the fold opened again it is closed, nothing said', async () => {
    signInAs('kestrel')
    expect(archivePerson(PID.osprey).bad).toBeFalsy()
    reload()
    const p = panel()
    await p.openArch(PID.osprey)
    await p.type('#accArCs', 'Typedname')
    vi.mocked(HOOKS.toast).mockClear()
    const other = noSignIn('u149')
    await p.land({ seq: 1, pid: other, on: true })
    expect(p.$('#accArchList'), 'premise: the landing shut the Archived fold').toBeNull()
    await p.press('#accArchToggle')
    expect(p.archRowOf(PID.osprey), 'premise: the fold open again, his row there').not.toBeNull()
    expect(p.noEditor(), 'closed — never back open with no press').toBe(true)
    expect(anyRowNote(), 'no note').toBe(0)
    expect(csOf(PID.osprey), 'nothing renamed').toBe('Osprey')
  })
  it('every draw run twice (React\'s strict mode): the first case closes the row and says nothing', async () => {
    signInAs('kestrel')
    const p = panel({ strict: true })
    await p.find('Ranger')
    await p.open(PID.ranger)
    await p.pickLine('u149', 'none')
    vi.mocked(HOOKS.toast).mockClear()
    await p.land({ seq: 1, pid: PID.osprey, on: true })
    await p.find('Ranger')
    expect(p.noEditor()).toBe(true)
    expect(anyRowNote()).toBe(0)
  })
  it('pin: a landing for the very man whose row is open leaves it open, what was typed still in it — no note', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.find('Osprey')
    await p.open(PID.osprey)
    await p.type('#accEdName', 'typed@mail')
    vi.mocked(HOOKS.toast).mockClear()
    await p.land({ seq: 1, pid: PID.osprey, on: true })
    expect((p.$('#accEdName') as HTMLInputElement | null)?.value, 'still open, his typing there').toBe('typed@mail')
    expect(anyRowNote()).toBe(0)
  })
})

/* ---- §23 A ROW PUT AWAY BY LEAVING ADMIN → USERS (Astra's finding 2 of the third read) ----
   The Admin page keeps the Users list mounted while another of its cards is shown, or, on a phone, while its list of
   cards is. The page was told whether Users is on his screen (`shown`) and did not use it when it recorded whether the
   row was drawn — so a row he had put away by leaving Users still said the note when it later changed. */
describe('§23 — the whole app, every draw twice: a row put away by leaving Admin → Users closes without a word when it later changes', () => {
  it.each(['another Admin card pressed (Data)', '"Back to categories" on a phone'] as const)('%s, then Osprey\'s move lands at midnight: no note — and back on Users his row is closed, nothing saved', async way => {
    signInAs('saber')
    expect(moveMan(PID.osprey, 'u142'), 'setup: Osprey moves to 142 from tomorrow').toMatchObject({ ok: true })
    signInAs('kestrel')
    const phone = way.startsWith('"Back')
    vi.spyOn(HOOKS, 'isPhone').mockReturnValue(phone)
    const savedName = accountById(ACCT.osprey)!.name
    appPage = render(<StrictMode><App /></StrictMode>)
    await settle()
    const card = async (label: string) => {
      const b = [...document.querySelectorAll<HTMLElement>('.adm-cat')].find(x => x.querySelector('.adm-cat-l')?.textContent === label)
      expect(b, `the Admin card ${label}`).toBeDefined()
      await act(async () => { fireEvent.click(b!) })
    }
    await act(async () => { setPage('admin'); notify() })
    await card('Users')
    expect(CURPAGE).toBe('admin')
    await appFind(PID.osprey)
    expect($('#accEdName'), 'premise: his whole row is open').not.toBeNull()
    await act(async () => { fireEvent.change($('#accEdName')!, { target: { value: 'unsaved.osprey@mail' } }) })
    vi.mocked(HOOKS.toast).mockClear()
    if (!phone) {
      await card('Data')
      expect($('#admUsers')!.classList.contains('on'), 'premise: Users is put away').toBe(false)
    } else {
      await act(async () => { fireEvent.click($('[aria-label="Back to categories"]')!) })
      expect($('.adm-shell')!.classList.contains('drilled'), 'premise: back on the list of cards').toBe(false)
    }
    expect(anyRowNote(), 'his own leaving is silent').toBe(0)
    await act(async () => { pastMidnight() })
    await settle()
    expect(homeOn(PID.osprey, todayIso()), 'premise: the move day — he is 142\'s').toBe('u142')
    expect(CURPAGE).toBe('admin')
    expect(anyRowNote(), 'a row he had put away: it closes without a word').toBe(0)
    await card('Users')
    expect($('#admUsers .acc-edit'), 'back on Users, no row is open').toBeNull()
    expect(accountById(ACCT.osprey)!.name, 'nothing typed was saved').toBe(savedName)
  })
  it('pin: the same with Users left on his screen — the row closes and the note is said, once', async () => {
    signInAs('saber')
    expect(moveMan(PID.osprey, 'u142')).toMatchObject({ ok: true })
    await appOnUsers('kestrel', PID.osprey, { strict: true })
    await act(async () => { pastMidnight() })
    await settle()
    expect($('.acc-edit')).toBeNull()
    expect(notesFor(csOf(PID.osprey)), 'on the page when it changed: the note, once').toBe(1)
  })
})

/* ---- §24 WHO IS LOOKING (the security reader's finding 1 and the fresh Fable's finding 1 of the third read — one case,
   found blind by both) ----
   The copy holds who is looking: whether the signed-in person's account still makes him an admin of the squadron the row
   opened on. His own move into the squadron he works by a Plan changed none of the row's facts — the page was still
   149's, the man still 149's own — yet it made him a member there, the Admin page went, and his row and typing went with
   it without a word. */
describe('§24 — the whole app: the signed-in admin\'s own standing goes under his open row', () => {
  it.each([false, true])('the security read 1, the Fable read 1: Hunter works 149 by his Plan, Osprey\'s row open, a rename typed; Hunter\'s OWN move to 149 lands at midnight — he joins as a member and the Admin page goes: the note, once; nothing saved (every draw twice: %s)', async strict => {
    signInAs('saber')
    expect(moveMan(PID.hunter, 'u149'), 'setup: Hunter moves to 149 from tomorrow').toMatchObject({ ok: true })
    await appOnUsers('hunter', PID.osprey, { picked: 'u149', strict })
    expect(pageUnit('own'), 'premise: his own pages are 149\'s (his Plan)').toBe('u149')
    await act(async () => { pastMidnight() })
    await settle()
    expect(homeOn(PID.hunter, todayIso()), 'premise: the move day — he is 149\'s').toBe('u149')
    expect(pageUnit('own'), 'premise: the page\'s squadron is still 149 (now his home)').toBe('u149')
    expect(isAdmin(), 'premise: he is a member of the squadron he joined (K3)').toBe(false)
    expect(CURPAGE, 'premise: the app took the Admin page away').not.toBe('admin')
    expect($('.acc-edit'), 'premise: his open row is gone').toBeNull()
    expect(accountById(ACCT.osprey)!.name, 'nothing typed was saved').not.toBe('typed@mail')
    expect(notesFor(csOf(PID.osprey)), 'his own move at midnight closed the row: the note, once').toBe(1)
    await act(async () => { notify() })
    await settle()
    expect(anyRowNote(), 'and not again').toBe(1)
  })
  it('every write asks the same: his own move to 149 landed with NOTHING redrawn; Save pressed on the still-standing row writes nothing, says the note and closes the row', async () => {
    signInAs('saber')
    expect(moveMan(PID.hunter, 'u149')).toMatchObject({ ok: true })
    signInAs('hunter')
    await pick('u149')
    const p = panel()
    await p.find('Osprey')
    await p.open(PID.osprey)
    await p.type('#accEdName', 'typed@mail')
    vi.mocked(HOOKS.toast).mockClear()
    spy.calls.length = 0
    on(16); reload()
    expect(isAdminAccount(accountById(ACCT.hunter)), 'premise: his account no longer gives an admin\'s role today (K3)').toBe(false)
    expect(isAdmin(), 'premise: nothing redrew — his session still reads admin').toBe(true)
    expect(p.$('#accEdName'), 'premise: the row still stands').not.toBeNull()
    await p.press('#accEdSave')
    expect(spy.calls, 'nothing sent').toEqual([])
    expect(accountById(ACCT.osprey)!.name).not.toBe('typed@mail')
    closedWithNote(p, PID.osprey)
  })
  /* the security read's proof 2A — four pins: with nothing redrawn after his own move landed, no button of the row writes */
  const ownMoveUnseen = async () => {
    signInAs('saber')
    expect(moveMan(PID.hunter, 'u149'), 'setup: Hunter moves to 149 from tomorrow').toMatchObject({ ok: true })
    signInAs('hunter')
    await pick('u149')
    const p = panel()
    await p.find('Osprey')
    await p.open(PID.osprey)
    await p.type('#accEdName', 'typed@mail')
    on(16); reload()
    expect(p.$('#accEdName'), 'premise: the row still stands').not.toBeNull()
    return p
  }
  it('pin: his own move landed with nothing redrawn — Save (a rename): nothing of it is written', async () => {
    const p = await ownMoveUnseen()
    await p.press('#accEdSave')
    expect(accountById(ACCT.osprey)!.name).not.toBe('typed@mail')
  })
  it('pin: …Suspend: his sign-in stays on', async () => {
    const p = await ownMoveUnseen()
    await p.press('#accEdOnOff')
    expect(accountById(ACCT.osprey)!.on).toBe(true)
  })
  it('pin: …Archive: he stays on the roster', async () => {
    const p = await ownMoveUnseen()
    await p.press('#accEdArchive')
    expect(!!P(PID.osprey).archived).toBe(false)
  })
  it('pin: …Delete, two taps: he is not deleted', async () => {
    const p = await ownMoveUnseen()
    await p.press('#accEdDel')
    if (p.$('#accEdDel')) await p.press('#accEdDel')
    expect(!!P(PID.osprey).deleted).toBe(false)
  })
  it('pin (the readers\' control): the same, his move being to 150 — the page\'s squadron changes, the row closes on a draw and the note is said once', async () => {
    signInAs('saber')
    expect(moveMan(PID.hunter, third.u150)).toMatchObject({ ok: true })
    await appOnUsers('hunter', PID.osprey, { picked: 'u149' })
    await act(async () => { pastMidnight() })
    await settle()
    expect(homeOn(PID.hunter, todayIso())).toBe(third.u150)
    expect($('.acc-edit')).toBeNull()
    expect(accountById(ACCT.osprey)!.name).not.toBe('typed@mail')
    expect(notesFor(csOf(PID.osprey)), 'the note, once').toBe(1)
  })
  it('pin (the Fable read\'s bound): a master admin\'s own move to the squadron he has picked lands at midnight — he stays an admin, the page stays, the row stays open with his typing; no note', async () => {
    signInAs('saber')
    expect(saveAccess(ACCT.kestrel, { master: true }), 'setup: a second master admin (nobody moves himself)').toBeNull()
    reload()
    signInAs('kestrel')
    expect(moveMan(PID.saber, 'u149'), 'setup: the other master admin moves Saber to 149 from tomorrow').toMatchObject({ ok: true })
    await appOnUsers('saber', PID.osprey, { picked: 'u149' })
    await act(async () => { pastMidnight() })
    await settle()
    expect(homeOn(PID.saber, todayIso())).toBe('u149')
    expect(isAdmin()).toBe(true)
    expect(CURPAGE).toBe('admin')
    expect(pageUnit('own')).toBe('u149')
    expect(UNIT).toBe('u149')
    expect(($('#accEdName') as HTMLInputElement | null)?.value, 'the row is still open with his typing').toBe('typed@mail')
    expect(anyRowNote()).toBe(0)
  })
})

/* ---- §25 HIS OWN VIEW-ONLY PICK AFTER THE ROW CHANGED UNSEEN (the security reader's finding 2 and the fresh Fable's
   finding 2 of the third read — one case, found blind by both) ----
   As the Admin page goes, "did his own pick take it" was asked the draw rule's way — the page's squadron is no longer the
   row's — which is false for a pick of a squadron he only views from his own squadron's page. So a row that had changed
   unseen said the note for his own pick. */
describe('§25 — the whole app: a row changed unseen, then his own pick of a squadron he only views takes the Admin page away — no note', () => {
  const hunterOn142WithRangerOpen = async () => {
    await appOnUsers('hunter', PID.ranger)
    expect(pageUnit('own'), 'premise: 142\'s own page').toBe('u142')
  }
  const rangersMoveLandsUnseen = () => {
    on(16); reload()
    expect(homeOn(PID.ranger, todayIso()), 'premise: the move day — he is 149\'s').toBe('u149')
    expect($('#accEdName'), 'premise: nothing redrew — the row still stands').not.toBeNull()
  }
  it('the security read 2, the Fable read 2: Ranger\'s move landed with nothing redrawn; Hunter picks 150 (View only) from 142\'s own Admin → Users — the Admin page goes with his pick: his own leaving, no note', async () => {
    signInAs('saber')
    expect(moveMan(PID.ranger, 'u149'), 'setup: Ranger moves to 149 from tomorrow').toMatchObject({ ok: true })
    await hunterOn142WithRangerOpen()
    rangersMoveLandsUnseen()
    await pick(third.u150)
    await settle()
    expect(UNIT, 'premise: 150 in view').toBe(third.u150)
    expect(pageUnit('own'), 'premise: his own pages stay 142\'s').toBe('u142')
    expect(CURPAGE, 'premise: the app landed him on 150\'s View-only Sched').toBe('viewsched')
    expect($('#admUsers'), 'premise: the Admin page is not drawn').toBeNull()
    expect(accountById(ACCT.ranger)!.name, 'nothing typed was saved').not.toBe('typed@mail')
    expect(anyRowNote(), 'his own pick: no note').toBe(0)
  })
  it('pin (the readers\' control): the same, another tab pressed instead of a pick — silent', async () => {
    signInAs('saber')
    expect(moveMan(PID.ranger, 'u149')).toMatchObject({ ok: true })
    await hunterOn142WithRangerOpen()
    rangersMoveLandsUnseen()
    await act(async () => { fireEvent.click($('a[data-page="viewsched"]')!) })
    await settle()
    expect($('#admUsers')).toBeNull()
    expect(anyRowNote(), 'his own leaving: no note').toBe(0)
  })
  it('pin (the readers\' control): the same pick with no move waiting — silent', async () => {
    await hunterOn142WithRangerOpen()
    await pick(third.u150)
    await settle()
    expect(CURPAGE).toBe('viewsched')
    expect($('#admUsers')).toBeNull()
    expect(anyRowNote(), 'his own pick: no note').toBe(0)
  })
})

/* ---- §26 WHAT THE FRESH FABLE'S THIRD READ PRESSED ON AND FOUND SOUND (its proof 0), kept so it stays so ----
   (Its two bounding cases of the standing rule are §24's two pins.) */
describe('§26 — pins: a row\'s own write that takes the man off the list raises no note', () => {
  it.each([false, true])('pin: Saber on 149\'s page opens Hunter (listed only for his Plan, no search), picks None and saves: "Saved", the row closes, Hunter leaves the list — and no "row changed" note; found again he is closed (every draw twice: %s)', async strict => {
    signInAs('saber')
    await pick('u149')
    const p = panel({ strict })
    expect(p.rowOf(PID.hunter), 'premise: Hunter is on 149\'s list as a Plan holder').not.toBeNull()
    await p.open(PID.hunter)
    await p.pickLine('u149', 'none')
    vi.mocked(HOOKS.toast).mockClear()
    await p.press('#accEdSave')
    expect(level(ACCT.hunter, 'u149'), 'saved: he holds nothing of 149').toBeNull()
    expect(HOOKS.toast).toHaveBeenCalledWith('Saved')
    expect(p.rowOf(PID.hunter), 'he left the list').toBeNull()
    expect(p.noEditor()).toBe(true)
    await redraw()
    expect(anyRowNote(), 'his own write: no note').toBe(0)
    await p.find('Hunter')
    expect(p.rowOf(PID.hunter), 'found again').not.toBeNull()
    expect(p.noEditor(), 'closed').toBe(true)
  })
})
describe('§26 — pins: the note as the page goes — a short row, strict mode, two causes at once', () => {
  it('pin: whole app, every draw twice — Hunter on 149 by his Plan has Ranger\'s SHORT row open with a pick not saved; his Plan is lowered: the page goes, nothing sent, the note once', async () => {
    await appOn('hunter', { picked: 'u149', strict: true })
    await appFind(PID.ranger)
    expect($('.acc-edit[data-short="1"]'), 'premise: Ranger\'s short row').not.toBeNull()
    const n = $(`[data-testid="acc-sq"] .acc-sq-n[data-unit="u149"]`)!
    await act(async () => { fireEvent.click((n.nextElementSibling as HTMLElement).querySelector('[data-line="none"]')!) })
    expect($('.acc-edit')!.getAttribute('data-unsaved'), 'premise: his pick is marked not saved').toBe('true')
    vi.mocked(HOOKS.toast).mockClear()
    await lowerHuntersPlan()
    expect(CURPAGE).toBe('viewsched')
    expect($('#admUsers')).toBeNull()
    expect(level(ACCT.ranger, 'u149'), 'his View of 149 untouched').toBe('view')
    expect(notesFor(csOf(PID.ranger)), 'once').toBe(1)
    await act(async () => { notify() }); await settle()
    expect(notesFor(csOf(PID.ranger)), 'and not again').toBe(1)
  })
  it('pin: whole app — Osprey\'s move landed unseen AND Hunter\'s Plan is lowered: two causes, the note once', async () => {
    signInAs('saber')
    expect(moveMan(PID.osprey, 'u142')).toMatchObject({ ok: true })
    await appOn('hunter', { picked: 'u149' })
    await appFind(PID.osprey)
    expect($('#accEdName'), 'premise: whole row').not.toBeNull()
    vi.mocked(HOOKS.toast).mockClear()
    on(16); reload()
    await lowerHuntersPlan()
    expect(CURPAGE).toBe('viewsched')
    expect(notesFor(csOf(PID.osprey)), 'once').toBe(1)
  })
  it('pin: whole app, every draw twice — a tab pressed with the row open is silent; back on Admin → Users the row is closed and nothing is said', async () => {
    await appOn('hunter', { picked: 'u149', strict: true })
    await appFind(PID.osprey)
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => { fireEvent.click($('a[data-page="viewsched"]')!) })
    await settle()
    expect($('#admUsers')).toBeNull()
    await act(async () => { setPage('admin'); notify() })
    await settle()
    expect($('#admUsers')).not.toBeNull()
    expect($('.acc-edit'), 'closed').toBeNull()
    expect(anyRowNote()).toBe(0)
  })
})
describe('§26 — pins: a row that leaves the list, in the whole app, by the top bar\'s own Undo button', () => {
  it.each([false, true])('pin: Saber on 149 gives Mako Plan, opens his row from the list, presses the top bar\'s Undo: Mako leaves the list — the row closes, the note once, the Admin page stays on Users; found again he is closed (every draw twice: %s)', async strict => {
    await appOn('saber', { picked: 'u149', strict })
    await appFind(PID.mako)
    const line = () => ($(`[data-testid="acc-sq"] .acc-sq-n[data-unit="u149"]`)!.nextElementSibling as HTMLElement)
    await act(async () => { fireEvent.click(line().querySelector('[data-line="plan"]')!) })
    await act(async () => { fireEvent.click($('#accEdSave')!) })
    expect(level(ACCT.mako, 'u149'), 'setup: Mako plans 149').toBe('admin')
    await act(async () => { fireEvent.change($('#accFind')!, { target: { value: '' } }) })
    const row = $(`[data-testid="acc-groups"] .acc-row[data-person="${PID.mako}"]`)
    expect(row, 'premise: listed as a Plan holder, no search').not.toBeNull()
    await act(async () => { fireEvent.click(row!.querySelector('.acc-tap')!) })
    expect($('.acc-edit[data-short="1"]'), 'premise: his short row is open').not.toBeNull()
    vi.mocked(HOOKS.toast).mockClear()
    expect($('#undoBtn'), 'premise: the top bar\'s Undo is drawn on the Admin page').not.toBeNull()
    await act(async () => { fireEvent.click($('#undoBtn')!) })
    await settle()
    expect(level(ACCT.mako, 'u149'), 'the Undo went through').toBeNull()
    expect(CURPAGE).toBe('admin')
    expect($('#accFind'), 'Users is still the panel drawn').not.toBeNull()
    expect($(`[data-testid="acc-groups"] .acc-row[data-person="${PID.mako}"]`), 'he left the list').toBeNull()
    expect($('.acc-edit'), 'no editor').toBeNull()
    expect(notesFor('Mako'), 'the note, once').toBe(1)
    await act(async () => { notify() }); await settle()
    expect(notesFor('Mako'), 'and not again').toBe(1)
    await act(async () => { fireEvent.change($('#accFind')!, { target: { value: 'Mako' } }) })
    expect($(`[data-testid="acc-groups"] .acc-row[data-person="${PID.mako}"]`), 'found again').not.toBeNull()
    expect($('.acc-edit'), 'closed — never back open with no press').toBeNull()
  })
})
describe('§26 — pins: a pick put back by hand is let go, against the line as it stands at the press', () => {
  it('pin: Kestrel picks View for Mako; Saber gives Mako View; Kestrel presses View (the line he holds now) — let go; Saber takes the View away: the row shows None, unmarked, Save sends nothing', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.find('Mako')
    await p.open(PID.mako)
    await p.pickLine('u149', 'view')
    expect(asOther('saber', () => saveAccess(ACCT.mako, { grants: { u149: 'view' } }))).toBeNull()
    reload(); await redraw()
    expect(p.$('.acc-edit')!.hasAttribute('data-unsaved'), 'his pick is what the man holds: not marked').toBe(false)
    await p.pickLine('u149', 'view')
    expect(asOther('saber', () => saveAccess(ACCT.mako, { grants: { u149: 'none' } }))).toBeNull()
    reload(); await redraw()
    expect(p.pressed('u149'), 'the row follows: None').toBe('none')
    expect(p.$('.acc-edit')!.hasAttribute('data-unsaved')).toBe(false)
    spy.calls.length = 0
    await p.press('#accEdSave')
    expect(spy.calls, 'nothing sent').toEqual([])
    expect(level(ACCT.mako, 'u149')).toBeNull()
  })
})
describe('§26 — pin: his own move to a third squadron from a squadron he works by his Plan', () => {
  it('pin: Hunter on 149\'s page by his Plan, his own move to 150 lands at midnight: the page\'s squadron changes, so the draw says the note once', async () => {
    signInAs('saber')
    expect(moveMan(PID.hunter, third.u150)).toMatchObject({ ok: true })
    await appOnUsers('hunter', PID.osprey, { picked: 'u149' })
    await act(async () => { pastMidnight() })
    await settle()
    expect(homeOn(PID.hunter, todayIso())).toBe(third.u150)
    expect($('.acc-edit')).toBeNull()
    expect(notesFor(csOf(PID.osprey)), 'once').toBe(1)
  })
})
