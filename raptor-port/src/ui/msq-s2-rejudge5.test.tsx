// @vitest-environment jsdom
/* ADMIN → USERS ACROSS SQUADRONS — STEP U1'S FIFTH ROUND: WHAT THE FOURTH READ FOUND (the brief
   docs/superpowers/briefs/2026-11-26-msq-s2-u1fix5-brief.md, with its addendum; the earlier rounds' tests are
   msq-s2-rejudge.test.tsx to msq-s2-rejudge4.test.tsx).
   Four blind readers read the fourth round's one guard (the copy an open row keeps, and who is looking). All four: no way
   for one squadron's admin to SEE what he must not, and one person alone cannot be made to write what the rule forbids.
   What they found, each kept here as a lasting test seen failing on the fourth round's code before the app changed
   (a test named "pin:" held already and must go on holding):
   §27 WHO IS LOOKING IS REQUIRED, NOT ONLY COMPARED — the signed-in admin suspended, archived or deleted under his open
       row, and a row pressed open after he was made a member, still wrote;
   §28 A DELETED MAN'S ROW NEVER WRITES — an archived man with no sign-in, deleted under his open archived row, was
       renamed by "Save name";
   §29 THE ARCHIVED ROW'S TWO BOXES ARE THE PAGE'S — shutting the Archived fold, a search or a Filter tick that hid the
       row dropped what was typed in it without a word;
   §30 THE ROW'S REPORT TO THE LEAVE-GUARD COMES FROM THE PAGE — the short row reported nothing, and a row he had hidden
       himself kept its typing but stopped counting;
   §31 A BELL LINE'S LANDING FOR ANOTHER MAN CLOSES A STALE ROW SILENTLY;
   §32 A SHORT ROW WHOSE PICK CAN NO LONGER BE SENT — the man made a master admin, or his sign-in gone — says so;
   §33 A SHORT ROW HE PUT AWAY WHOSE MAN THEN LEAVES THE LIST never comes back open with no press;
   §34 "GIVE ACCESS" STOPS REPORTING ONCE ITS FORM IS GONE.
   (What the read found of §20's own test is added beside it, in msq-s2-rejudge4.test.tsx.)
   The world: three squadrons (withThird — his D2630), Wed 15 Jul 26, 09:00. Hunter — 142's admin, Plan of 149, View of
   150; Saber — master admin, home 142; Ranger — 142's member, View of 149 and of 150; Kestrel — 149's admin; Osprey —
   149's member; Mako — 150's own admin. */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { StrictMode } from 'react'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { withThird, third, signInAs, PID, ACCT, SIGN, moveMan, on } from '../test-support/msq-world'
import { UsersPanel } from './UsersPanel'
import { App } from './App'
import { useVersion } from './useStore'
import {
  accountById, accountOfPid, accountsLoad, updateAccount, saveAccess, addAccount, requestAccess, signIn, sessionFor, sessionLapsed,
  levelAcct, isAdminAccount, levelIn,
} from '../state/accounts'
import { SESSION, ME, setSession, setMe } from '../state/auth'
import { unitsLoad, todayIso, homeOn, grantOfOn } from '../state/units'
import { pickSquadron } from '../state/pick'
import { pageUnit, isAdmin } from '../state/perms'
import { PEOPLE } from '../engine/people'
import { rosterOf } from '../engine/roster'
import { HOOKS } from '../engine/hooks'
import { notify } from '../state/store'
import { CURPAGE, setPage } from '../state/view'
import { globalUndo } from '../undo/timeline'
import { archivePerson } from '../leavewar/sync'
import { deletePerson } from '../state/person-delete'
import { updatePersonField } from '../state/quals-write'
import { workOn, whatIsOpen } from './guard'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

/* A SPY ON THE ACCOUNT DOORS A ROW WRITES THROUGH: every call of saveAccess, updateAccount and addAccount is recorded,
   under its name, and passed to the real door; every other name is read from the real module each time it is used. */
const spy = vi.hoisted(() => ({
  calls: [] as unknown[][],
  on(real: Record<string, unknown>, names: string[], into: unknown[][]): Record<string, unknown> {
    const door = (name: string) => (...a: unknown[]) => { into.push([name, ...a]); return (real[name] as (...x: unknown[]) => unknown)(...a) }
    const doors: Record<string, unknown> = Object.fromEntries(names.map(n => [n, door(n)]))
    const live: Record<string, unknown> = {}
    for (const k of Object.keys(real)) Object.defineProperty(live, k, { enumerable: true, get: () => (k in doors ? doors[k] : real[k]) })
    return live
  },
}))
vi.mock('../state/accounts', async importOriginal => spy.on(await importOriginal<Record<string, unknown>>(), ['saveAccess', 'updateAccount', 'addAccount'], spy.calls))

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
/* everything stored about a man that a row's button could write over */
const stored = (pid: string, acct?: string | null): string => JSON.stringify({
  byId: acct ? accountById(acct) ?? null : null, onHim: accountOfPid(pid) ?? null,
  arch: !!P(pid).archived, del: !!P(pid).deleted, cs: P(pid).cs,
})

/* ---- the list drawn alone (it redraws on the store's version, as the Admin page does around it) ---- */
type RingIn = { seq: number; pid: string; on: boolean }
function Live(p: { ring?: RingIn; away?: boolean }) { useVersion(); return <UsersPanel shown={!p.away} ring={p.ring} /> }
function panel(o: { strict?: boolean } = {}) {
  const tree = (x: { ring?: RingIn; away?: boolean } = {}) => (o.strict ? <StrictMode><Live {...x} /></StrictMode> : <Live {...x} />)
  const page = render(tree())
  const $ = (sel: string) => page.container.querySelector(sel) as HTMLElement | null
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
  /* a bell line's landing handed down by the Admin page */
  const land = async (ring: RingIn) => { await act(async () => { page.rerender(tree({ ring })) }) }
  /* Users put away (another Admin card pressed — the Admin page hands the list `shown: false`) and brought back */
  const away = async (yes: boolean) => { await act(async () => { page.rerender(tree({ away: yes })) }) }
  /* the post-in date box of an archived man's row: a day picked in its calendar; the date it holds */
  const pickDate = async (iso: string) => {
    await press('#accArPostIn')
    const day = document.querySelector<HTMLElement>(`.dcal-layer [data-iso="${iso}"]`)
    expect(day, `the calendar's day ${iso}`).not.toBeNull()
    await act(async () => { fireEvent.click(day!) })
  }
  const postIn = () => $('#accArPostIn')?.getAttribute('data-value') ?? null
  const box = () => ($('#accArCs') as HTMLInputElement | null)?.value ?? null
  /* no editor of any kind is drawn anywhere on the page */
  const noEditor = () => $('.acc-edit') === null
  return { $, rowOf, archRowOf, press, type, open, openArch, find, tick, pressed, pickLine, land, away, pickDate, postIn, box, noEditor }
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
async function appOn(who: 'hunter' | 'saber' | 'kestrel', o: { strict?: boolean } = {}) {
  signInAs(who)
  appPage = render(o.strict ? <StrictMode><App /></StrictMode> : <App />)
  await settle()
  await act(async () => { setPage('admin'); notify() })
  await settle()
  expect(CURPAGE, 'premise: the app is on the Admin page').toBe('admin')
}
const appFind = async (pid: string) => {
  await act(async () => { fireEvent.change($('#accFind')!, { target: { value: csOf(pid) } }) })
  expect($(`[data-testid="acc-groups"] .acc-row[data-person="${pid}"]`), 'premise: he is on the list').not.toBeNull()
}
const appPress = async (pid: string) => {
  await act(async () => { fireEvent.click($(`[data-testid="acc-groups"] .acc-row[data-person="${pid}"] .acc-tap`)!) })
  await settle()
}

/* ---- §27 WHO IS LOOKING IS REQUIRED, NOT ONLY COMPARED (the security reader's findings 1a and 1b; Astra's finding 1) ----
   The fourth round asked only the signed-in person's LEVEL in the row's squadron, answered "still that admin" when his
   account was gone, and only compared the answer with what it was at the press that opened the row. So (1a) Hunter
   suspended, archived or deleted by another admin under his open row, nothing redrawn: every button of the row still
   wrote; (1b) Hunter made a member, nothing redrawn, and THEN he pressed a row open on the page still standing: it opened
   with "not an admin" as its baseline, and Save and Suspend wrote. Now the row asks the app's own question — does his
   session still stand (state/accounts.ts sessionLapsed) — and requires his standing in the row's squadron, on every draw
   and before every action; and a press on a session that no longer stands opens nothing. */
type Way = { name: string; by: () => unknown }
/* what another admin (Saber, the master admin) does to HUNTER — the signed-in admin — under Hunter's open row */
const WAYS: Way[] = [
  { name: 'his sign-in is suspended', by: () => updateAccount(ACCT.hunter, { on: false }) },
  { name: 'he is archived', by: () => archivePerson(PID.hunter).bad },
  { name: 'he is deleted (his account goes with him)', by: () => deletePerson(PID.hunter) },
  { name: 'he is made a member (the fourth round closed this one — kept beside the others)', by: () => saveAccess(ACCT.hunter, { role: 'main' }) },
]
type Btn = { name: string; sel: string; twice?: true }
const BTNS: Btn[] = [
  { name: 'Save (a rename typed)', sel: '#accEdSave' }, { name: 'Suspend', sel: '#accEdOnOff' }, { name: 'Archive', sel: '#accEdArchive' },
  { name: 'Delete, both taps', sel: '#accEdDel', twice: true },
]
const saberDoes = (w: Way) => {
  expect(asOther('saber', w.by) ?? null, `setup: Saber — ${w.name}`).toBeNull()
  reload()
  vi.mocked(HOOKS.toast).mockClear()
  spy.calls.length = 0
}

describe('§27 — the signed-in admin\'s own sign-in goes under his open WHOLE row, nothing redrawn: no button of the row writes', () => {
  const CASES = WAYS.flatMap(w => BTNS.map(b => ({ w, b, name: `${w.name} — ${b.name}` })))
  it.each(named(CASES))('Hunter has Ranger\'s whole row open on 142\'s page, a rename typed; Saber: %s — nothing is written, no door is called, the row closes, the note once', async (_, { w, b }) => {
    signInAs('hunter')
    const p = panel()
    await p.find('Ranger')
    await p.open(PID.ranger)
    expect(p.$('#accEdName'), 'premise: his whole row is open').not.toBeNull()
    await p.type('#accEdName', 'typed@mail')
    saberDoes(w)
    expect(sessionLapsed(), 'premise: the app would end or lower this session at its next repaint').toBe(true)
    expect(isAdmin(), 'premise: nothing redrew — the session still reads admin').toBe(true)
    expect(pageUnit('own'), 'premise: the page is still 142\'s').toBe('u142')
    expect(p.$(b.sel), 'premise: the row still stands').not.toBeNull()
    const was = stored(PID.ranger, ACCT.ranger)
    await p.press(b.sel)
    if (b.twice && p.$(b.sel)) await p.press(b.sel)
    expect(spy.calls, 'the row called no account door').toEqual([])
    expect(stored(PID.ranger, ACCT.ranger), 'nothing of Ranger\'s was written by a man who is no longer that admin').toBe(was)
    closedWithNote(p, PID.ranger)
  })
})

describe('§27 — the same under his open SHORT row (Hunter on 149\'s page by his Plan, Ranger\'s line picked None)', () => {
  it.each(named(WAYS))('%s — Save: nothing is sent, Ranger keeps his View of 149, the row closes, the note once', async (_, w) => {
    signInAs('hunter')
    await pick('u149')
    expect(pageUnit('own'), 'premise: 149\'s page').toBe('u149')
    const p = panel()
    await p.find('Ranger')
    await p.open(PID.ranger)
    expect(p.$('[data-short="1"]'), 'premise: his short row is open').not.toBeNull()
    expect(level(ACCT.ranger, 'u149'), 'premise: Ranger holds View of 149').toBe('view')
    await p.pickLine('u149', 'none')
    saberDoes(w)
    expect(p.$('#accEdSave'), 'premise: the row still stands').not.toBeNull()
    await p.press('#accEdSave')
    expect(spy.calls, 'nothing sent').toEqual([])
    expect(level(ACCT.ranger, 'u149'), 'Ranger\'s View of 149 was not taken by a man who is no longer that admin').toBe('view')
    closedWithNote(p, PID.ranger)
  })
})

describe('§27 — and on a draw: the list redrawn before the app has ended or made his session again', () => {
  it.each(named(WAYS))('%s — the list alone redraws: the row closes with the note, once, nothing written', async (_, w) => {
    signInAs('hunter')
    const p = panel()
    await p.find('Ranger')
    await p.open(PID.ranger)
    await p.type('#accEdName', 'typed@mail')
    saberDoes(w)
    const was = stored(PID.ranger, ACCT.ranger)
    await redraw()
    closedWithNote(p, PID.ranger)
    await redraw()
    expect(anyRowNote(), 'and not again').toBe(1)
    expect(stored(PID.ranger, ACCT.ranger)).toBe(was)
  })
})

describe('§27 — a row is never OPENED on a session that no longer stands', () => {
  const NO_BTN = '#accEdSave, #accEdOnOff, #accEdArchive, #accEdDel, #accGive, #accArRestore, #accArSave, #accArDel'
  it('Saber makes Hunter a member; nothing redraws; Hunter presses Ranger\'s row on the page still standing: no row opens — no Save, Suspend, Archive or Delete to press — and nothing is said', async () => {
    signInAs('hunter')
    const p = panel()
    await p.find('Ranger')
    expect(asOther('saber', () => saveAccess(ACCT.hunter, { role: 'main' })), 'setup: Saber makes Hunter a member').toBeNull()
    reload()
    vi.mocked(HOOKS.toast).mockClear()
    expect(isAdminAccount(accountById(ACCT.hunter)), 'premise: the store says he is a member').toBe(false)
    expect(isAdmin(), 'premise: nothing redrew — the session still reads admin').toBe(true)
    const was = stored(PID.ranger, ACCT.ranger)
    await p.open(PID.ranger)
    expect(p.noEditor(), 'no row opened').toBe(true)
    expect(p.$(NO_BTN), 'no button of a row to press').toBeNull()
    expect(stored(PID.ranger, ACCT.ranger)).toBe(was)
    expect(anyRowNote(), 'nothing was open: nothing to say').toBe(0)
  })
  it('the short row: Hunter on 149\'s page by his Plan; Saber makes him a member (his Plan goes with it); nothing redraws; he presses Ranger\'s row: nothing opens, Ranger\'s lines stand', async () => {
    signInAs('hunter')
    await pick('u149')
    const p = panel()
    await p.find('Ranger')
    expect(asOther('saber', () => saveAccess(ACCT.hunter, { role: 'main' })), 'setup: Saber makes Hunter a member').toBeNull()
    reload()
    expect(isAdmin(), 'premise: nothing redrew — the session still reads admin').toBe(true)
    if (p.rowOf(PID.ranger)) await p.open(PID.ranger)
    expect(p.noEditor(), 'no row opened').toBe(true)
    expect(level(ACCT.ranger, 'u149'), 'Ranger\'s View of 149 stands').toBe('view')
    expect(level(ACCT.ranger, 'u142'), 'and nothing new of 142').toBeNull()
  })
  it.each(named([{ name: 'suspended', by: () => updateAccount(ACCT.hunter, { on: false }) }, { name: 'deleted', by: () => deletePerson(PID.hunter) }]))('Hunter is %s by Saber; nothing redraws; he presses Ranger\'s row: nothing opens', async (_, w) => {
    signInAs('hunter')
    const p = panel()
    await p.find('Ranger')
    expect(asOther('saber', w.by) ?? null, 'setup').toBeNull()
    reload()
    await p.open(PID.ranger)
    expect(p.noEditor(), 'no row opened').toBe(true)
  })
  it('his OWN move to 149 landed at midnight with nothing redrawn (he joined as a member, K3); he presses Osprey\'s row: nothing opens, nothing of Osprey\'s is written', async () => {
    signInAs('saber')
    expect(moveMan(PID.hunter, 'u149'), 'setup: Hunter moves to 149 from tomorrow').toMatchObject({ ok: true })
    signInAs('hunter')
    await pick('u149')
    const p = panel()
    await p.find('Osprey')
    on(16); reload()
    expect(homeOn(PID.hunter, todayIso()), 'premise: the move day').toBe('u149')
    expect(isAdminAccount(accountById(ACCT.hunter)), 'premise: a member of the squadron he joined (K3)').toBe(false)
    expect(isAdmin(), 'premise: nothing redrew — the session still reads admin').toBe(true)
    const was = stored(PID.osprey, ACCT.osprey)
    await p.open(PID.osprey)
    expect(p.noEditor(), 'no row opened').toBe(true)
    expect(p.$(NO_BTN)).toBeNull()
    expect(stored(PID.osprey, ACCT.osprey), 'nothing of Osprey\'s was written').toBe(was)
  })
  it('pin: an ARCHIVED man\'s row pressed after his own move landed unseen — Restore and Delete, where a row opens at all, write nothing', async () => {
    signInAs('kestrel')
    expect(archivePerson(PID.osprey).bad, 'setup: Kestrel archives Osprey').toBeFalsy()
    reload()
    signInAs('saber')
    expect(moveMan(PID.hunter, 'u149'), 'setup: Hunter moves to 149 from tomorrow').toMatchObject({ ok: true })
    signInAs('hunter')
    await pick('u149')
    const p = panel()
    await p.press('#accArchToggle')
    on(16); reload()
    const was = stored(PID.osprey, ACCT.osprey)
    await p.openArch(PID.osprey)
    for (const sel of ['#accArRestore', '#accArDel', '#accArDel']) if (p.$(sel)) await p.press(sel)
    expect(stored(PID.osprey, ACCT.osprey), 'nothing of Osprey\'s was written').toBe(was)
  })
})

describe('§27 — the whole app: the note is said once as his sign-in goes, and a press on a lapsed session makes the app repaint', () => {
  it.each([false, true])('Hunter has Ranger\'s row open, a rename typed; Saber suspends Hunter; the app repaints: the row closes with the note, once, nothing saved — and the app ends his session (every draw twice: %s)', async strict => {
    await appOn('hunter', { strict })
    await appFind(PID.ranger)
    await appPress(PID.ranger)
    expect($('#accEdName'), 'premise: his whole row is open').not.toBeNull()
    await act(async () => { fireEvent.change($('#accEdName')!, { target: { value: 'typed@mail' } }) })
    vi.mocked(HOOKS.toast).mockClear()
    expect(asOther('saber', () => updateAccount(ACCT.hunter, { on: false })), 'setup: Saber suspends Hunter').toBeNull()
    reload()
    await act(async () => { notify() })
    await settle()
    expect(SESSION.role, 'the app ended his session').toBe('off')
    expect($('.acc-edit'), 'no row is left open').toBeNull()
    expect(accountById(ACCT.ranger)!.name, 'nothing typed was saved').not.toBe('typed@mail')
    expect(notesFor('Ranger'), 'what he typed is never dropped without a word: the note, once').toBe(1)
    await act(async () => { notify() })
    await settle()
    expect(anyRowNote(), 'and not again').toBe(1)
  })
  it('Saber makes Hunter a member; nothing redraws; Hunter presses Ranger\'s row: no row opens, and the app makes his session a member\'s at once — the Admin page is no longer his', async () => {
    await appOn('hunter')
    await appFind(PID.ranger)
    vi.mocked(HOOKS.toast).mockClear()
    expect(asOther('saber', () => saveAccess(ACCT.hunter, { role: 'main' })), 'setup: Saber makes Hunter a member').toBeNull()
    reload()
    expect(isAdmin(), 'premise: nothing redrew — the session still reads admin').toBe(true)
    await appPress(PID.ranger)
    expect($('.acc-edit'), 'no row opened').toBeNull()
    expect(isAdmin(), 'the app made his session again: a member\'s').toBe(false)
    expect(SESSION.user, 'still signed in, as himself').toBe(ACCT.hunter)
    expect(anyRowNote(), 'nothing was open: nothing to say').toBe(0)
  })
})

describe('§27 — pins: the question closes nothing it must leave open', () => {
  const hunterTypesInRanger = async () => {
    signInAs('hunter')
    const p = panel()
    await p.find('Ranger'); await p.open(PID.ranger); await p.type('#accEdName', 'typed@mail')
    vi.mocked(HOOKS.toast).mockClear()
    return p
  }
  const stillOpen = (p: Panel) => {
    expect(sessionLapsed(), 'his session stands').toBe(false)
    expect((p.$('#accEdName') as HTMLInputElement | null)?.value, 'the row is still open with his typing').toBe('typed@mail')
    expect(anyRowNote(), 'no note').toBe(0)
  }
  it('pin: a plain open row, left across draws', async () => {
    const p = await hunterTypesInRanger()
    await redraw(); await redraw()
    stillOpen(p)
  })
  it('pin: his pick of a squadron he only views (150) — the page\'s own squadron as it was, the row open', async () => {
    const p = await hunterTypesInRanger()
    await pick(third.u150)
    expect(pageUnit('own')).toBe('u142')
    stillOpen(p)
  })
  it('pin: a right of his in ANOTHER squadron taken (his Plan of 149) while he works his own 142 — the row open', async () => {
    const p = await hunterTypesInRanger()
    expect(asOther('saber', () => saveAccess(ACCT.hunter, { grants: { u149: 'none' } })), 'setup: Saber takes his Plan of 149').toBeNull()
    reload(); await redraw()
    stillOpen(p)
  })
  it('pin: a master admin\'s own move to the squadron he has picked lands — he stays an admin, the row open', async () => {
    signInAs('saber')
    expect(saveAccess(ACCT.kestrel, { master: true }), 'setup: a second master admin').toBeNull()
    reload()
    signInAs('kestrel')
    expect(moveMan(PID.saber, 'u149'), 'setup: Saber moves to 149 from tomorrow').toMatchObject({ ok: true })
    signInAs('saber')
    await pick('u149')
    const p = panel()
    await p.find('Osprey'); await p.open(PID.osprey); await p.type('#accEdName', 'typed@mail')
    vi.mocked(HOOKS.toast).mockClear()
    on(16); reload()
    expect(homeOn(PID.saber, todayIso())).toBe('u149')
    await redraw()
    stillOpen(p)
  })
  it('pin: Hunter, working 149 by his Plan, is made a MASTER admin under his open row (his Plan is dropped with the mark — an admin of 149 still): the row open', async () => {
    signInAs('hunter')
    await pick('u149')
    const p = panel()
    await p.find('Osprey'); await p.open(PID.osprey); await p.type('#accEdName', 'typed@mail')
    vi.mocked(HOOKS.toast).mockClear()
    expect(asOther('saber', () => saveAccess(ACCT.hunter, { master: true })), 'setup: Saber makes Hunter a master admin').toBeNull()
    reload(); await redraw()
    expect(levelIn(ACCT.hunter, 'u149', todayIso()), 'premise: an admin of 149 still').toBe('admin')
    expect(pageUnit('own'), 'premise: the page is still 149\'s').toBe('u149')
    stillOpen(p)
  })
})

/* ---- §28 A DELETED MAN'S ROW NEVER WRITES (the security reader's finding 2) ----
   An archived man with NO sign-in, deleted by another admin under his open archived row: nothing the copy holds changes
   (no account to lose, his callsign as it was), so "Save name" renamed the deleted man and said "Renamed …". The row now
   counts a deleted man as changed: a press writes nothing and says the usual note (the brief's accepted corner); on a
   draw his row still closes with NO note — he cannot be opened again. */
describe('§28 — an archived man with no sign-in, deleted under his open archived row with nothing redrawn', () => {
  const ARCH_BTNS = [
    { name: 'Restore', typed: false, sel: '#accArRestore', twice: false },
    { name: 'Restore as (a new callsign typed before)', typed: true, sel: '#accArRestore', twice: false },
    { name: 'Save name (a new callsign typed before)', typed: true, sel: '#accArSave', twice: false },
    { name: 'Delete, both taps', typed: false, sel: '#accArDel', twice: true },
  ]
  const person = (pid: string) => JSON.stringify({ cs: P(pid).cs, arch: !!P(pid).archived, del: !!P(pid).deleted, acct: accountOfPid(pid) ?? null })
  const kestrelOpens = async (typed: boolean) => {
    signInAs('kestrel')
    const pid = noSignIn('u149')
    expect(archivePerson(pid).bad, 'setup: Kestrel archives him').toBeFalsy()
    reload()
    const p = panel()
    await p.openArch(pid)
    expect(p.$('#accArRestore'), 'premise: his archived row is open').not.toBeNull()
    if (typed) await p.type('#accArCs', 'Newname')
    return { p, pid }
  }
  /* (a delete redraws the page at its next breath: the press comes in the same step, before anything redraws) */
  const saberDeletes = (pid: string) => {
    expect(asOther('saber', () => deletePerson(pid)), 'setup: Saber deletes him').toBeNull()
    reload()
    vi.mocked(HOOKS.toast).mockClear()
    expect(P(pid).deleted, 'premise: deleted').toBeTruthy()
  }
  it.each(named(ARCH_BTNS))('%s: he stays deleted, not restored, not renamed — the row closes, the usual note once, and nothing else is said', async (_, b) => {
    const { p, pid } = await kestrelOpens(b.typed)
    saberDeletes(pid)
    const was = person(pid)
    expect(p.$(b.sel), 'premise: nothing redrew — the button still stands').not.toBeNull()
    await p.press(b.sel)
    if (b.twice && p.$(b.sel)) await p.press(b.sel)
    expect(person(pid), 'nothing of him was written').toBe(was)
    expect(p.noEditor(), 'the row closed').toBe(true)
    expect(vi.mocked(HOOKS.toast).mock.calls.map(c => c[0]), 'the one note, and no "Renamed" or "restored"').toEqual([noteFor(csOf(pid))])
  })
  it('pin: with a redraw his row closes with NO note (he cannot be opened again)', async () => {
    const { p, pid } = await kestrelOpens(true)
    saberDeletes(pid)
    await redraw()
    expect(p.noEditor(), 'the row closed').toBe(true)
    expect(p.archRowOf(pid), 'and he is off the list').toBeNull()
    expect(anyRowNote(), 'no note').toBe(0)
  })
  it('pin: Hunter had picked None for Ranger\'s 149 line in his whole row; his own Plan of 149 is taken with nothing redrawn; Save: the door refuses — Ranger keeps his View of 149', async () => {
    signInAs('hunter')
    const p = panel()
    await p.find('Ranger')
    await p.open(PID.ranger)
    await p.pickLine('u149', 'none')
    expect(asOther('saber', () => saveAccess(ACCT.hunter, { grants: { u149: 'none' } })), 'setup: Saber takes Hunter\'s Plan of 149').toBeNull()
    reload()
    await p.press('#accEdSave')
    expect(level(ACCT.ranger, 'u149'), 'Ranger\'s View of 149 stands').toBe('view')
  })
  it('pin: a stale page pressed never opens the whole editor for a man who is by then another squadron\'s (Hunter on 149\'s page by his Plan; the Plan taken with nothing redrawn; he presses Osprey\'s row, still drawn whole)', async () => {
    signInAs('hunter')
    await pick('u149')
    const p = panel()
    await p.find('Osprey')
    expect(p.rowOf(PID.osprey)!.querySelector('.od-c'), 'premise: drawn whole (dots)').not.toBeNull()
    expect(asOther('saber', () => saveAccess(ACCT.hunter, { grants: { u149: 'none' } })), 'setup: Saber takes Hunter\'s Plan of 149').toBeNull()
    reload()
    expect(pageUnit('own'), 'premise: his own pages are 142\'s again').toBe('u142')
    await p.open(PID.osprey)
    expect(p.$('#accEdName'), 'no sign-in box').toBeNull()
    expect(p.$('#accEdOnOff, #accEdArchive, #accEdDel'), 'no Suspend, Archive or Delete').toBeNull()
    const lines = [...(p.rowOf(PID.osprey)?.querySelectorAll('[data-testid="acc-sq"] .acc-sq-n') ?? [])].map(x => x.getAttribute('data-unit'))
    expect(lines.every(u => u === 'u142'), `only 142's line, if any: ${lines.join(',')}`).toBe(true)
  })
})

/* ---- §29 THE ARCHIVED ROW'S TWO BOXES ARE THE PAGE'S (the fresh Opus 1 = Astra 2 = the fresh Fable 1; the backlog's
   [USERS-ARCH-FOLD-DRAFT], older than this step) ----
   The callsign box and the post-in date lived in the archived row's editor, so shutting the Archived fold, a search or a
   Filter tick that hid the row made the editor anew: the row came back OPEN on his old callsign and today's date, and
   nothing told the admin. The page holds them now with the open row, as it holds the whole row's typing. */
describe('§29 — an archived man\'s row he puts away himself and brings back keeps what he typed in both boxes', () => {
  const kestrelTypesBoth = async (o: { found?: boolean } = {}) => {
    signInAs('kestrel')
    expect(archivePerson(PID.osprey).bad, 'setup: Kestrel archives Osprey').toBeFalsy()
    reload()
    const p = panel()
    if (o.found) await p.find('Osprey')
    await p.openArch(PID.osprey)
    await p.type('#accArCs', 'Typedname')
    await p.pickDate('2026-07-16')
    expect({ box: p.box(), date: p.postIn() }, 'premise: a new callsign typed and a post-in date picked').toEqual({ box: 'Typedname', date: '2026-07-16' })
    vi.mocked(HOOKS.toast).mockClear()
    return p
  }
  const bothKept = (p: Panel) => {
    expect(p.$('#accArCs'), 'the page still holds this row open').not.toBeNull()
    expect({ box: p.box(), date: p.postIn() }, 'what he typed and the date he picked are still there').toEqual({ box: 'Typedname', date: '2026-07-16' })
    expect(HOOKS.toast, 'and nothing is said').not.toHaveBeenCalled()
  }
  it('the Archived fold shut by his own tap and opened again', async () => {
    const p = await kestrelTypesBoth()
    await p.press('#accArchToggle')
    expect(p.$('#accArchList'), 'premise: the fold is shut').toBeNull()
    await p.press('#accArchToggle')
    bothKept(p)
  })
  it('his own search hides the row, then finds it again', async () => {
    const p = await kestrelTypesBoth({ found: true })
    await p.find('zzzz-nobody')
    expect(p.$('#accArCs'), 'premise: hidden by his search').toBeNull()
    await p.find('Osprey')
    bothKept(p)
  })
  it('the fold opened by his tap; a search that finds nobody, then cleared — the fold is shut again (as built: a changed search decides the fold until he taps it); he taps it open', async () => {
    const p = await kestrelTypesBoth()
    await p.find('no-such-person')
    expect(p.$('#accArCs'), 'premise: hidden by his search').toBeNull()
    await p.find('')
    if (!p.$('#accArchList')) await p.press('#accArchToggle')
    bothKept(p)
  })
  it('a Filter tick hides him (Role "Admin" — he is a member), then the ticks are cleared', async () => {
    const p = await kestrelTypesBoth()
    await p.tick('role:admin')
    expect(p.archRowOf(PID.osprey), 'premise: the tick hides him').toBeNull()
    expect(p.$('#accArCs')).toBeNull()
    await p.press('#accFilterClear')
    if (!p.$('#accArchList')) await p.press('#accArchToggle')
    bothKept(p)
  })
  it('after its own Save name the row keeps the post-in date he picked — and still does after the fold is shut and opened; nothing more is left to rename (the button reads Restore)', async () => {
    const p = await kestrelTypesBoth()
    await p.press('#accArSave')
    expect(csOf(PID.osprey), 'premise: renamed').toBe('Typedname')
    expect({ box: p.box(), date: p.postIn() }, 'the row stays open on what he typed and picked').toEqual({ box: 'Typedname', date: '2026-07-16' })
    await p.press('#accArchToggle'); await p.press('#accArchToggle')
    expect({ box: p.box(), date: p.postIn() }, 'and after the fold').toEqual({ box: 'Typedname', date: '2026-07-16' })
    expect(anyRowNote(), 'his own write: no note').toBe(0)
    expect(p.$('#accArRestore')!.textContent).toBe('Restore')
  })
  it('pin: closing the row throws it away — Cancel, then opened again: his own callsign and today', async () => {
    const p = await kestrelTypesBoth()
    await p.press('#accArCancel')
    await p.openArch(PID.osprey)
    expect({ box: p.box(), date: p.postIn() }).toEqual({ box: 'Osprey', date: '2026-07-15' })
  })
  it('pin: what he typed in one archived man\'s row never shows in the next man\'s', async () => {
    signInAs('kestrel')
    const other = noSignIn('u149')
    expect(archivePerson(PID.osprey).bad).toBeFalsy()
    expect(archivePerson(other).bad).toBeFalsy()
    reload()
    const p = panel()
    await p.openArch(PID.osprey)
    await p.type('#accArCs', 'Typedname')
    await p.pickDate('2026-07-16')
    await p.openArch(other)
    expect({ box: p.box(), date: p.postIn() }, 'the next man\'s row opens on his own callsign and today').toEqual({ box: csOf(other), date: '2026-07-15' })
  })
})

/* ---- §30 THE ROW'S REPORT TO THE LEAVE-GUARD COMES FROM THE PAGE (the fresh Opus 2 and 3; the fresh Fable 4 and 5; the
   security reader's note — agreed with the core's chat 204, whose guard it is) ----
   The 'userrow' report lived in the whole row's editor and the 'archrow' one in the archived row's; the short row
   reported nothing; and a row he hid by his own search kept its typing (the page holds it) yet stopped counting, because
   its editor was no longer drawn. Both reports are now worked out by the page from what it holds: the open row, its copy
   and what is typed. The short row counts by the very test that marks it "not saved". */
describe('§30 — the open row\'s report to the leave-guard', () => {
  it('the short row: Hunter on 142\'s page opens Osprey\'s short row and picks a line — marked not saved, and counted; the pick put back by hand: neither; picked again and Cancel: not counted', async () => {
    signInAs('hunter')
    expect(accountOfPid(PID.osprey)?.id, 'premise: Osprey has a sign-in').toBe(ACCT.osprey)
    const p = panel()
    await p.find('Osprey')
    await p.open(PID.osprey)
    expect(p.$('.acc-edit')?.getAttribute('data-short'), 'premise: his short row').toBe('1')
    expect(workOn('userrow'), 'opened, nothing picked').toBe(false)
    const before = p.pressed('u142')!
    await p.pickLine('u142', before === 'view' ? 'none' : 'view')
    expect(p.$('.acc-edit')?.getAttribute('data-unsaved'), 'premise: marked as not saved').toBe('true')
    expect(workOn('userrow'), 'the open row holds a change: the guard counts it').toBe(true)
    await p.pickLine('u142', before)
    expect(p.$('.acc-edit')?.hasAttribute('data-unsaved'), 'the pick put back: no mark').toBe(false)
    expect(workOn('userrow'), 'and no count — the mark and the count never disagree').toBe(false)
    await p.pickLine('u142', before === 'view' ? 'none' : 'view')
    expect(workOn('userrow')).toBe(true)
    await p.press('#accEdCancel')
    expect(workOn('userrow'), 'closed: nothing counted').toBe(false)
    expect(whatIsOpen(), 'and the guard names nothing open').toBeNull()
  })
  it('a whole row hidden by his own search is still held with his typing — and still counted; brought back and cancelled: not counted', async () => {
    signInAs('hunter')
    const p = panel()
    await p.find('Ranger')
    await p.open(PID.ranger)
    await p.type('#accEdName', 'typed@mail')
    expect(workOn('userrow'), 'premise: counted while in sight').toBe(true)
    await p.find('zzzz-nobody')
    expect(p.$('#accEdName'), 'premise: hidden by his own search').toBeNull()
    expect(workOn('userrow'), 'while held out of sight, the typed rename still counts').toBe(true)
    await p.find('Ranger')
    expect((p.$('#accEdName') as HTMLInputElement | null)?.value, 'the page held the rename all along').toBe('typed@mail')
    await p.press('#accEdCancel')
    expect(workOn('userrow')).toBe(false)
  })
  it('a short row hidden by his own search still counts its pick', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.find('Ranger')
    await p.open(PID.ranger)
    await p.pickLine('u149', 'none')
    await p.find('zzzz-nobody')
    expect(p.noEditor(), 'premise: hidden').toBe(true)
    expect(workOn('userrow'), 'still counted').toBe(true)
  })
  it('an archived row put away by the shut fold still counts — as the archived row, never as a man\'s roster row', async () => {
    signInAs('kestrel')
    expect(archivePerson(PID.osprey).bad).toBeFalsy()
    reload()
    const p = panel()
    await p.openArch(PID.osprey)
    expect(workOn('archrow'), 'opened, nothing typed').toBe(false)
    await p.type('#accArCs', 'Typedname')
    expect(workOn('archrow'), 'premise: counted while in sight').toBe(true)
    await p.press('#accArchToggle')
    expect(p.$('#accArCs'), 'premise: the fold is shut').toBeNull()
    expect(workOn('archrow'), 'still counted').toBe(true)
    expect(workOn('userrow')).toBe(false)
  })
  it('an archived row — Save name pressed with a space after the new callsign: nothing is left unsaved, so nothing is counted', async () => {
    signInAs('kestrel')
    expect(archivePerson(PID.osprey).bad).toBeFalsy()
    reload()
    const p = panel()
    await p.openArch(PID.osprey)
    await p.type('#accArCs', 'Typedname ')
    expect(workOn('archrow'), 'premise: counted while typed and not saved').toBe(true)
    await p.press('#accArSave')
    expect(csOf(PID.osprey), 'premise: renamed').toBe('Typedname')
    expect(p.$('#accArSave'), 'premise: nothing more to save — the Save name button is gone').toBeNull()
    expect(p.$('#accArRestore')!.textContent, 'premise: the button reads Restore, not "Restore as"').toBe('Restore')
    expect(workOn('archrow'), 'nothing in the row differs from what is saved').toBe(false)
  })
  it('an archived row: a space typed after his own callsign is no change — not counted (the box is read as every other reading of it does)', async () => {
    signInAs('kestrel')
    expect(archivePerson(PID.osprey).bad).toBeFalsy()
    reload()
    const p = panel()
    await p.openArch(PID.osprey)
    await p.type('#accArCs', 'Osprey ')
    expect(p.$('#accArRestore')!.textContent, 'premise: the row itself reads it as no rename').toBe('Restore')
    expect(workOn('archrow')).toBe(false)
  })
  it('the post-in date moved alone counts; after Save name a date he picked is still unsaved work', async () => {
    signInAs('kestrel')
    expect(archivePerson(PID.osprey).bad).toBeFalsy()
    reload()
    const p = panel()
    await p.openArch(PID.osprey)
    await p.pickDate('2026-07-16')
    expect(workOn('archrow'), 'the date alone').toBe(true)
    await p.type('#accArCs', 'Typedname')
    await p.press('#accArSave')
    expect(workOn('archrow'), 'the name is saved, the date he picked is not').toBe(true)
    await p.press('#accArchToggle')
    expect(workOn('archrow'), 'and still while the fold is shut').toBe(true)
  })
  it('pin: the whole row counts only while what is typed differs from how it opened; Cancel ends it', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.find('Osprey'); await p.open(PID.osprey)
    expect(workOn('userrow')).toBe(false)
    const was = accountById(ACCT.osprey)!.name
    await p.type('#accEdName', 'x@mail')
    expect(workOn('userrow')).toBe(true)
    await p.type('#accEdName', was)
    expect(workOn('userrow')).toBe(false)
    await p.type('#accEdName', 'x@mail')
    await p.press('#accEdCancel')
    expect(workOn('userrow')).toBe(false)
    expect(anyRowNote()).toBe(0)
  })
  it('pin: a row the page closes because it changed under him stops counting', async () => {
    signInAs('hunter')
    const p = panel()
    await p.find('Ranger'); await p.open(PID.ranger); await p.type('#accEdName', 'typed@mail')
    expect(workOn('userrow')).toBe(true)
    vi.mocked(HOOKS.toast).mockClear()
    expect(asOther('saber', () => updateAccount(ACCT.ranger, { name: 'renamed@mail' })), 'setup: Saber renames his sign-in').toBeNull()
    reload(); await redraw()
    closedWithNote(p, PID.ranger)
    expect(workOn('userrow')).toBe(false)
  })
  it('pin: a row put away by leaving Admin → Users (another Admin card) still counts, as the core\'s own test of it expects', async () => {
    signInAs('hunter')
    const p = panel()
    await p.find('Ranger'); await p.open(PID.ranger); await p.type('#accEdName', 'typed@mail')
    await p.away(true)
    expect(workOn('userrow')).toBe(true)
  })
  it('pin: Save name under strict mode (every draw twice) — the row stays open with a fresh copy, no note, and nothing is left counted; Restore then goes through', async () => {
    signInAs('kestrel')
    expect(archivePerson(PID.osprey).bad).toBeFalsy()
    reload()
    const p = panel({ strict: true })
    await p.openArch(PID.osprey)
    await p.type('#accArCs', 'Typedname')
    expect(workOn('archrow'), 'premise: typed work is reported').toBe(true)
    vi.mocked(HOOKS.toast).mockClear()
    await p.press('#accArSave')
    expect(csOf(PID.osprey)).toBe('Typedname')
    await redraw(); await redraw()
    expect(p.$('#accArCs'), 'still open after later draws').not.toBeNull()
    expect(anyRowNote(), 'no note').toBe(0)
    expect(workOn('archrow'), 'nothing is left unsaved').toBe(false)
    await p.press('#accArRestore')
    expect(!!P(PID.osprey).archived).toBe(false)
    expect(anyRowNote()).toBe(0)
    expect(p.noEditor()).toBe(true)
    expect(workOn('archrow')).toBe(false)
  })
})

/* ---- §31 A BELL LINE'S LANDING FOR ANOTHER MAN CLOSES A STALE ROW SILENTLY (Astra's finding 3 = the fresh Fable's 6) ----
   One person and the clock: Osprey's move lands with nothing redrawn while his whole row is open; the admin taps a bell
   line that lands on another man. The row closed — and the note was said, though the landing is his own act: the landing
   asked the page to close the row, and the same draw then judged the old row and found it changed. */
describe('§31 — a bell line\'s landing for another man, the open row having changed with nothing redrawn', () => {
  const ospreyMovesUnseen = async (strict: boolean) => {
    signInAs('saber')
    expect(moveMan(PID.osprey, 'u142'), 'setup: Osprey moves to 142 from tomorrow').toMatchObject({ ok: true })
    signInAs('kestrel')
    const p = panel({ strict })
    await p.find('Osprey'); await p.open(PID.osprey)
    await p.type('#accEdName', 'unsaved.osprey@mail')
    vi.mocked(HOOKS.toast).mockClear()
    on(16); reload()
    expect(homeOn(PID.osprey, todayIso()), 'premise: the move day').toBe('u142')
    expect(p.$('#accEdName'), 'premise: nothing redrew — the row still stands').not.toBeNull()
    return p
  }
  it.each([false, true])('Kestrel has Osprey\'s whole row open, a rename typed; Osprey\'s move lands at midnight unseen; a bell line for another 149 man is tapped — his own act closes the row: no note, nothing saved (every draw twice: %s)', async strict => {
    const savedName = accountById(ACCT.osprey)!.name
    const other = noSignIn('u149')
    const p = await ospreyMovesUnseen(strict)
    await p.land({ seq: 1, pid: other, on: true })
    expect(p.noEditor(), 'the row is closed').toBe(true)
    expect(accountById(ACCT.osprey)!.name).toBe(savedName)
    expect(anyRowNote(), 'his own bell tap closed it: no note').toBe(0)
    await redraw()
    expect(anyRowNote(), 'nor on a later draw').toBe(0)
    expect(p.noEditor()).toBe(true)
  })
  it('pin: a landing for the very man whose row is open is judged as before — his move had landed unseen, so the row closes with the note, once', async () => {
    const p = await ospreyMovesUnseen(false)
    await p.land({ seq: 1, pid: PID.osprey, on: true })
    closedWithNote(p, PID.osprey)
  })
})

/* ---- §32 A SHORT ROW WHOSE PICK CAN NO LONGER BE SENT (the security reader, by reading; the fresh Fable, by reading) ----
   A pick made in another squadron's man's short row; then another admin makes him a master admin (his lines go with the
   mark), or his sign-in is put on another man. Save closed the row and dropped the pick with no word. His row did change
   while it was open: the note is said — on the draw where a draw comes, at Save where none does (both). (Corrected by
   U1's sixth round: this header once said a sign-in gone on a DRAW was still followed live, the row falling back to the
   "No sign-in" words with no note — the pick dropped without a word, which three readers of the fifth round found. A
   pick whose sign-in is gone or another account's now closes the row with the note on the draw too: msq-s2-rejudge6
   .test.tsx §35, and msq-s2-rejudge3.test.tsx §15's pin re-pointed. Only a short row with NO pick follows his sign-in
   live.) */
describe('§32 — a short row with a pick made, and the man can no longer be sent it', () => {
  const kestrelPicksForRanger = async () => {
    signInAs('kestrel')
    const p = panel()
    await p.find('Ranger')
    await p.open(PID.ranger)
    expect(p.pressed('u149'), 'premise: Ranger holds View of 149').toBe('view')
    await p.pickLine('u149', 'none')
    expect(p.$('.acc-edit')?.getAttribute('data-unsaved'), 'premise: a pick not yet saved').toBe('true')
    return p
  }
  const madeMaster = () => {
    expect(asOther('saber', () => saveAccess(ACCT.ranger, { role: 'admin', master: true })), 'setup: Saber makes Ranger a master admin').toBeNull()
    reload()
    expect(accountById(ACCT.ranger)!.master, 'premise: the mark is on his account').toBe(true)
    vi.mocked(HOOKS.toast).mockClear(); spy.calls.length = 0
  }
  it('made a master admin under it, and the page redraws: the row closes with the note, once — the pick is not dropped without a word', async () => {
    const p = await kestrelPicksForRanger()
    madeMaster()
    await redraw()
    closedWithNote(p, PID.ranger)
    await redraw()
    expect(anyRowNote(), 'and not again').toBe(1)
    expect(spy.calls).toEqual([])
    expect(workOn('userrow'), 'and nothing is left counted').toBe(false)
  })
  it('made a master admin under it with NOTHING redrawn; Save: nothing is sent, the row closes, the note once', async () => {
    const p = await kestrelPicksForRanger()
    madeMaster()
    expect(p.$('#accEdSave'), 'premise: the row still stands').not.toBeNull()
    await p.press('#accEdSave')
    expect(spy.calls, 'nothing sent').toEqual([])
    closedWithNote(p, PID.ranger)
  })
  it('his sign-in put on another man under it with NOTHING redrawn; Save: nothing is sent for him or for the other man, the row closes, the note once', async () => {
    const p = await kestrelPicksForRanger()
    const other = noSignIn('u142')
    /* (a master admin: the sign-in holds rights in 149 and 150, so only he may put it on another man) */
    expect(asOther('saber', () => updateAccount(ACCT.ranger, { pid: other })), 'setup: the master admin puts Ranger\'s sign-in on another 142 man').toBeNull()
    reload()
    vi.mocked(HOOKS.toast).mockClear(); spy.calls.length = 0
    expect(accountOfPid(PID.ranger), 'premise: Ranger has no sign-in now').toBeUndefined()
    expect(p.$('#accEdSave'), 'premise: the row still stands').not.toBeNull()
    const was = JSON.stringify(accountById(ACCT.ranger))
    await p.press('#accEdSave')
    expect(spy.calls, 'nothing sent').toEqual([])
    expect(JSON.stringify(accountById(ACCT.ranger)), 'the sign-in, now the other man\'s, untouched').toBe(was)
    closedWithNote(p, PID.ranger)
  })
  it('his sign-in put on another man and a NEW one given him, nothing redrawn; Save: the pick was made on the old sign-in — nothing is sent, the row closes, the note once', async () => {
    const p = await kestrelPicksForRanger()
    const other = noSignIn('u142')
    expect(asOther('saber', () => updateAccount(ACCT.ranger, { pid: other })), 'setup: his sign-in goes to another man').toBeNull()
    reload()
    expect(asOther('saber', () => addAccount('ranger.new@mail', PID.ranger, 'main')), 'setup: and he is given a new one').toBeNull()
    reload()
    vi.mocked(HOOKS.toast).mockClear(); spy.calls.length = 0
    await p.press('#accEdSave')
    expect(spy.calls, 'nothing sent').toEqual([])
    closedWithNote(p, PID.ranger)
  })
  it('pin: NO pick made, and he is made a master admin under the open short row — nothing of the admin\'s is lost: the row follows ("Full access"), no note; Save closes it and sends nothing', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.find('Ranger')
    await p.open(PID.ranger)
    madeMaster()
    await redraw()
    expect(p.$('.acc-edit[data-short="1"] .acc-sq-home')?.textContent, 'the row follows the store').toBe('Full access')
    expect(anyRowNote()).toBe(0)
    await p.press('#accEdSave')
    expect(spy.calls).toEqual([])
    expect(HOOKS.toast, 'nothing said').not.toHaveBeenCalled()
    expect(p.noEditor()).toBe(true)
  })
})

/* ---- §33 A SHORT ROW HE PUT AWAY WHOSE MAN THEN LEAVES THE LIST (the fresh Fable's finding 2) ----
   The rule: an open row "is never left held to come back open with no press"; "brought back, it is closed". "Left the
   list by no act of his" was asked only of a row drawn at the last draw. A row he had put away himself — by his search,
   or by leaving Users for another Admin card — was never asked again whether its man was still on the list; a short row
   holds no copy, so nothing else closed it. Saber gave Mako Plan of 149, opened Mako's short row, picked View (to LOWER
   it), hid the row, pressed Undo: Mako was off 149's list. Found again by the search, the row was drawn open, View picked,
   "not saved" — and its Save GAVE View to a man who held nothing. The page now remembers his search, ticks and fold as
   they stood when the row was last on the page, and asks, while the row is out of sight, whether its man would still be
   on the list as it stood then; where not, the row closes — with no note, since it was not on the page. */
describe('§33 — a short row he put away himself, whose man then leaves the list by no press on it', () => {
  const saberOpensMako = async () => {
    signInAs('saber')
    await pick('u149')
    expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } }), 'setup: Saber gives Mako Plan of 149 (his latest step)').toBeNull(); reload()
    const p = panel()
    expect(p.rowOf(PID.mako), 'premise: Mako is on 149\'s list as a Plan holder, no search').not.toBeNull()
    await p.open(PID.mako)
    expect(p.$('.acc-edit')?.getAttribute('data-short'), 'premise: his short row').toBe('1')
    expect(p.pressed('u149'), 'premise: he holds Plan').toBe('plan')
    await p.pickLine('u149', 'view')
    expect(p.$('.acc-edit')?.getAttribute('data-unsaved'), 'premise: a pick to LOWER his Plan to View, not saved').toBe('true')
    vi.mocked(HOOKS.toast).mockClear()
    spy.calls.length = 0
    return p
  }
  const undoThePlan = async () => {
    await act(async () => { expect(globalUndo().ok, 'his own Undo of the Plan').toBe(true); reload(); notify() })
    expect(level(ACCT.mako, 'u149'), 'premise: Mako holds nothing of 149 now').toBeNull()
  }
  it('pin: on the page when his own Undo takes the Plan away — the row closes with the note, once', async () => {
    const p = await saberOpensMako()
    await undoThePlan()
    expect(p.rowOf(PID.mako), 'he left the list').toBeNull()
    expect(anyRowNote()).toBe(1)
    await p.find('Mako')
    expect(p.noEditor(), 'found again, closed').toBe(true)
  })
  it('hidden by his own search first; his own Undo takes the Plan away; the search cleared, then Mako found again — brought back, the row is closed, and nothing was said about a row that was not on the page', async () => {
    const p = await saberOpensMako()
    await p.find('zzzz')
    expect(p.rowOf(PID.mako), 'premise: put away by his own search').toBeNull()
    await undoThePlan()
    expect(workOn('userrow'), 'the row is let go: nothing of it is counted any more').toBe(false)
    await p.find('')
    expect(p.rowOf(PID.mako), 'premise: he is not on 149\'s list any more').toBeNull()
    await p.find('Mako')
    expect(p.rowOf(PID.mako), 'found again by the search').not.toBeNull()
    expect({ openAgain: !p.noEditor(), shows: p.pressed('u149'), marked: p.$('.acc-edit')?.getAttribute('data-unsaved') ?? null }, 'the row left the list while put away: brought back it is closed').toEqual({ openAgain: false, shows: null, marked: null })
    expect(anyRowNote(), 'no note').toBe(0)
  })
  it('the same, put away by leaving Admin → Users (another Admin card): back on Users and Mako found again, the row is closed', async () => {
    const p = await saberOpensMako()
    await p.away(true)
    await undoThePlan()
    await p.away(false)
    expect(p.rowOf(PID.mako), 'premise: he is not on 149\'s list any more').toBeNull()
    expect(anyRowNote(), 'nothing was said (a row he had put away)').toBe(0)
    await p.find('Mako')
    expect(p.rowOf(PID.mako), 'found again by the search').not.toBeNull()
    expect({ openAgain: !p.noEditor(), shows: p.pressed('u149') }, 'brought back it is closed').toEqual({ openAgain: false, shows: null })
  })
  it('…so no Save is left to press: nothing is sent by a row he never pressed open again, and Mako still holds nothing of 149', async () => {
    const p = await saberOpensMako()
    await p.find('zzzz')
    await undoThePlan()
    await p.find('Mako')
    if (p.$('#accEdSave')) await p.press('#accEdSave')
    reload()
    expect(spy.calls, 'nothing is sent').toEqual([])
    expect(level(ACCT.mako, 'u149'), 'Mako still holds nothing of 149').toBeNull()
  })
  it('pin: put away by his search and brought back with nothing changed meanwhile — still open, his pick still in it, no note', async () => {
    const p = await saberOpensMako()
    await p.find('zzzz')
    await redraw()
    await p.find('')
    expect(p.pressed('u149'), 'his pick is still there').toBe('view')
    expect(p.$('.acc-edit')?.getAttribute('data-unsaved')).toBe('true')
    expect(anyRowNote()).toBe(0)
  })
  it('pin: a man found only by the search — his row put away by changing the search, and brought back, is still open (he would still be on the list as it stood)', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.find('Ranger')
    await p.open(PID.ranger)
    await p.pickLine('u149', 'none')
    await p.find('Osprey')
    expect(p.rowOf(PID.ranger), 'premise: put away').toBeNull()
    await redraw()
    await p.find('Ranger')
    expect(p.pressed('u149')).toBe('none')
    expect(anyRowNote()).toBe(0)
  })
  it('pin: a WHOLE row put away whose man then leaves the list (Role "Member" ticked, Osprey\'s row open and typed in, hidden by the search; another admin makes Osprey an admin, so the tick no longer keeps him) — its copy closes it, without a word; brought back it is closed', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.tick('role:member')
    expect(p.rowOf(PID.osprey), 'premise: Osprey, a member, is kept by the tick').not.toBeNull()
    await p.open(PID.osprey)
    await p.type('#accEdName', 'typed@mail')
    await p.find('zzzz')
    expect(p.rowOf(PID.osprey), 'premise: put away by his own search').toBeNull()
    vi.mocked(HOOKS.toast).mockClear()
    expect(asOther('saber', () => saveAccess(ACCT.osprey, { role: 'admin' })), 'setup: Saber makes Osprey an admin').toBeNull()
    reload(); await redraw()
    expect(anyRowNote(), 'nothing said about a row that was not on the page').toBe(0)
    await p.find('')
    await p.press('#accFilterClear')
    expect(p.rowOf(PID.osprey), 'on the list again with the tick off').not.toBeNull()
    expect(p.noEditor(), 'closed').toBe(true)
    expect(accountById(ACCT.osprey)!.name).not.toBe('typed@mail')
  })
  it('pin: an ARCHIVED row put away whose man then leaves the Archived list (found by the search, opened and typed in, the fold shut; another admin renames him so the search no longer finds him) — its copy closes it, without a word; found again it is closed', async () => {
    signInAs('kestrel')
    expect(archivePerson(PID.osprey).bad).toBeFalsy()
    reload()
    const p = panel()
    await p.find('Osprey')
    await p.openArch(PID.osprey)
    await p.type('#accArCs', 'Typedname')
    await p.press('#accArchToggle')
    expect(p.$('#accArchList'), 'premise: the fold is shut').toBeNull()
    vi.mocked(HOOKS.toast).mockClear()
    expect(asOther('saber', () => updatePersonField(PID.osprey, { callsign: 'Zebra' })), 'setup: Saber renames the archived man').toBeFalsy()
    reload(); await redraw()
    expect(anyRowNote(), 'nothing said about a row inside a shut fold').toBe(0)
    await p.find('Zebra')
    if (!p.$('#accArchList')) await p.press('#accArchToggle')
    expect(p.archRowOf(PID.osprey), 'found again under his new name').not.toBeNull()
    expect(p.noEditor(), 'closed').toBe(true)
  })
  it('a row its OWN write took off the list is still held (it is not "a man who left the list") — Kestrel finds an archived man by his callsign, picks a post-in date and renames him with Save name, so the search no longer finds him; found again under his new name the row is open with the date he picked, and nothing was said', async () => {
    signInAs('kestrel')
    expect(archivePerson(PID.osprey).bad).toBeFalsy()
    reload()
    const p = panel()
    await p.find('Osprey')
    await p.openArch(PID.osprey)
    await p.type('#accArCs', 'Zebra')
    await p.pickDate('2026-07-16')
    vi.mocked(HOOKS.toast).mockClear()
    await p.press('#accArSave')
    expect(csOf(PID.osprey), 'premise: renamed').toBe('Zebra')
    expect(p.archRowOf(PID.osprey), 'premise: the search no longer finds him').toBeNull()
    await redraw(); await redraw()
    expect(workOn('archrow'), 'held: the date he picked still counts').toBe(true)
    await p.find('Zebra')
    if (!p.$('#accArchList')) await p.press('#accArchToggle')
    expect({ box: p.box(), date: p.postIn() }, 'the row is open as he left it').toEqual({ box: 'Zebra', date: '2026-07-16' })
    expect(anyRowNote(), 'his own write: no note').toBe(0)
  })
})

/* ---- §34 "GIVE ACCESS" STOPS REPORTING ONCE ITS FORM IS GONE (the fresh Fable's finding 3 — the core's line in this
   file; the orchestrator told the core's chat 204 that this step carries it) ----
   The form's report to the leave-guard was "a form is open and differs from how it opened"; the open form's state was
   never cleared when its request left the list — answered on the man's own row, or by another admin — so the report
   stayed on with nothing of Give access on the page. Only a form whose request is still waiting counts. */
describe('§34 — the "Give access" form\'s report to the leave-guard', () => {
  const strangerAsks = () => {
    signInAs('newface@mail')
    expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' }, 'u149'), 'setup: a stranger asks to join 149').toBeNull()
    signInAs('kestrel')
    expect(pageUnit('own')).toBe('u149')
  }
  it('opened and its Role changed; the admin then gives the sign-in on the man\'s own row instead (the form\'s own note says to) — the request is answered, its form is gone, and nothing is counted', async () => {
    strangerAsks()
    const p = panel()
    await p.press('[data-approve]')
    expect(p.$('[data-approving]'), 'premise: Give access is open').not.toBeNull()
    await p.type('#apvRole', 'admin')
    expect(workOn('giveaccess'), 'premise: counted once changed').toBe(true)
    const pid = noSignIn('u149')
    await p.open(pid)
    await p.type('#accGiveName', 'newface@mail')
    await p.press('#accGive')
    expect(accountOfPid(pid)?.name, 'premise: the sign-in is given').toBe('newface@mail')
    expect(p.$('[data-approving]'), 'premise: the request is answered — its form is gone').toBeNull()
    expect(p.$('#admNoWaiting'), 'premise: nobody is waiting').not.toBeNull()
    await redraw()
    expect(workOn('giveaccess'), 'nothing of Give access is on the page').toBe(false)
    expect(whatIsOpen()?.row.id ?? null, 'and the guard names nothing open').toBeNull()
  })
  it('the same where ANOTHER admin answers the request under the open form', async () => {
    strangerAsks()
    const p = panel()
    await p.press('[data-approve]')
    await p.type('#apvRole', 'admin')
    expect(workOn('giveaccess'), 'premise').toBe(true)
    const pid = noSignIn('u149')
    expect(asOther('saber', () => addAccount('newface@mail', pid, 'main')), 'setup: Saber gives the sign-in').toBeNull()
    reload(); await redraw()
    expect(p.$('[data-approving]'), 'premise: the form is gone').toBeNull()
    expect(workOn('giveaccess')).toBe(false)
  })
  it('pin: while its request still waits the changed form counts; put back as it opened, or cancelled, it does not', async () => {
    strangerAsks()
    const p = panel()
    await p.press('[data-approve]')
    expect(workOn('giveaccess'), 'opened, nothing changed').toBe(false)
    await p.type('#apvRole', 'admin')
    expect(workOn('giveaccess')).toBe(true)
    await redraw()
    expect(workOn('giveaccess'), 'still, across a draw').toBe(true)
    await p.type('#apvRole', 'main')
    expect(workOn('giveaccess')).toBe(false)
    await p.type('#apvRole', 'admin')
    await p.press('#apvCancel')
    expect(workOn('giveaccess')).toBe(false)
  })
})
