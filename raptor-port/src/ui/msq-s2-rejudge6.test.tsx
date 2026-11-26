// @vitest-environment jsdom
/* ADMIN → USERS ACROSS SQUADRONS — STEP U1'S SIXTH ROUND: WHAT THE FIFTH READ FOUND (the brief
   docs/superpowers/briefs/2026-11-27-msq-s2-u1fix6-brief.md; the earlier rounds' tests are msq-s2-rejudge.test.tsx to
   msq-s2-rejudge5.test.tsx).
   Four blind readers read the fifth round (Astra, two fresh Opus readers, an Opus security reader). None found a way to
   see what must not be seen, or for one person alone to make a row write what the rule forbids. Five smaller findings,
   each kept here as a lasting test seen failing on the fifth round's code before the app changed (a test named "pin:"
   held already and must go on holding):
   §35 A SHORT ROW'S PICK IS NEVER DROPPED WITHOUT A WORD WHEN HIS SIGN-IN GOES OR CHANGES AND THE PAGE REDRAWS — three
       readers, blind (the fresh Opus 1's and 2's finding 1, Astra's 1); one person can do it with his own Undo;
   §36 A PICK MADE EQUAL TO HIS LINE BY ANOTHER ADMIN IS LET GO — it later turned into a change with no press, and its
       Save undid that admin's latest act (the fresh Opus 1's finding 2);
   §37 THE REAL BELL LANDING REACHES USERS ON ITS FIRST DRAW — through the Admin page, the landing came one draw late, and
       a row changed unseen said the note about his own tap (Astra's finding 2);
   §38 MIDNIGHT ALONE NEVER CLOSES AN ARCHIVED ROW WHOSE POST-IN DATE HE PICKED (the fresh Opus 2's finding 2);
   §39 "GIVE ACCESS", CHANGED, IS THROWN AWAY WHEN ITS REQUEST LEAVES THE PAGE'S LIST — at a squadron pick it was held
       but not counted, and came back open with the change (the fresh Opus 2's finding 3).
   The world: three squadrons (withThird — his D2630), Wed 15 Jul 26, 09:00. Hunter — 142's admin, Plan of 149, View of
   150; Saber — master admin, home 142; Ranger — 142's member, View of 149 and of 150; Kestrel — 149's admin; Osprey —
   149's member; Mako — 150's own admin. */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { StrictMode } from 'react'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { withThird, signInAs, PID, ACCT, SIGN, moveMan, on } from '../test-support/msq-world'
import { UsersPanel } from './UsersPanel'
import { App } from './App'
import { useVersion } from './useStore'
import { openAdminUsers } from './adminopen'
import {
  accountById, accountOfPid, accountsLoad, updateAccount, saveAccess, addAccount, requestAccess, signIn, sessionFor,
  levelAcct,
} from '../state/accounts'
import { SESSION, ME, setSession, setMe } from '../state/auth'
import { unitsLoad, todayIso, homeOn, grantOfOn } from '../state/units'
import { pickSquadron } from '../state/pick'
import { pageUnit } from '../state/perms'
import { PEOPLE } from '../engine/people'
import { rosterOf } from '../engine/roster'
import { HOOKS } from '../engine/hooks'
import { notify } from '../state/store'
import { CURPAGE, setPage } from '../state/view'
import { globalUndo, globalRedo } from '../undo/timeline'
import { archivePerson } from '../leavewar/sync'
import { workOn } from './guard'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

/* A SPY ON THE ACCOUNT DOORS A ROW WRITES THROUGH (as msq-s2-rejudge5.test.tsx): every call of saveAccess, updateAccount
   and addAccount is recorded, under its name, and passed to the real door. */
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
/* the passing note of his D2730 Q13, word for word (its apostrophe the app's curly one) */
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
   signed-in person's own session put back after it */
function asOther<T>(who: keyof typeof SIGN, fn: () => T): T {
  const s0 = SESSION, me0 = ME
  const s1 = sessionFor(signIn(SIGN[who][0], SIGN[who][1]) as any)
  setSession(s1); setMe(s1.pid)
  try { return fn() } finally { setSession(s0); setMe(me0) }
}

/* ---- the list drawn alone (it redraws on the store's version, as the Admin page does around it) ---- */
function Live() { useVersion(); return <UsersPanel shown /> }
function panel(o: { strict?: boolean } = {}) {
  const page = render(o.strict ? <StrictMode><Live /></StrictMode> : <Live />)
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
  const pressed = (unit: string) => {
    const n = $(`[data-testid="acc-sq"] .acc-sq-n[data-unit="${unit}"]`)
    return (n?.nextElementSibling as HTMLElement | null)?.querySelector('[aria-pressed="true"]')?.getAttribute('data-line') ?? null
  }
  const pickLine = async (unit: string, v: string) => {
    const n = $(`[data-testid="acc-sq"] .acc-sq-n[data-unit="${unit}"]`)!
    await act(async () => { fireEvent.click((n.nextElementSibling as HTMLElement).querySelector(`[data-line="${v}"]`)!) })
  }
  /* the post-in date box of an archived man's row: a day picked in its calendar; the date it holds */
  const pickDate = async (iso: string) => {
    await press('#accArPostIn')
    const day = document.querySelector<HTMLElement>(`.dcal-layer [data-iso="${iso}"]`)
    expect(day, `the calendar's day ${iso}`).not.toBeNull()
    await act(async () => { fireEvent.click(day!) })
  }
  const postIn = () => $('#accArPostIn')?.getAttribute('data-value') ?? null
  const box = () => ($('#accArCs') as HTMLInputElement | null)?.value ?? null
  const unsaved = () => $('.acc-edit')?.getAttribute('data-unsaved') ?? null
  const noEditor = () => $('.acc-edit') === null
  return { $, rowOf, archRowOf, press, type, open, openArch, find, pressed, pickLine, pickDate, postIn, box, unsaved, noEditor }
}
type Panel = ReturnType<typeof panel>
const pick = async (u: string) => { await act(async () => { await pickSquadron(u) }) }
const redraw = async () => { await act(async () => { notify() }) }
const closedWithNote = (p: Panel, pid: string) => {
  expect(p.noEditor(), 'the row closed').toBe(true)
  expect(anyRowNote(), 'the note, once').toBe(1)
  expect(HOOKS.toast).toHaveBeenLastCalledWith(noteFor(csOf(pid)), 'warn')
}

/* ---- §35 A SHORT ROW'S PICK IS NEVER DROPPED WITHOUT A WORD WHEN HIS SIGN-IN GOES OR CHANGES ----
   Kestrel, on 149's page, opens Ranger's short row (another squadron's man there) and picks None; then his sign-in is put
   on another man, or taken by an Undo, and the page redraws. The fifth round followed the sign-in live on a draw — the
   row fell back to "No sign-in…" with Cancel alone, or to a new sign-in's line untouched — and the pick was gone without
   a word, caught only at a Save that the redraw had taken away. Now the row closes, with the note where it was on the
   page, silently where he had put it away. A short row with NO pick still follows his sign-in live. */
describe('§35 — a short row with a pick made, his sign-in gone or changed, and the page redraws', () => {
  const kestrelPicksNoneForRanger = async (o: { strict?: boolean } = {}) => {
    signInAs('kestrel')
    const p = panel(o)
    await p.find('Ranger')
    await p.open(PID.ranger)
    expect(p.pressed('u149'), 'premise: Ranger holds View of 149').toBe('view')
    await p.pickLine('u149', 'none')
    expect(p.unsaved(), 'premise: his pick, not yet saved').toBe('true')
    expect(workOn('userrow'), 'premise: counted by the leave-guard').toBe(true)
    return p
  }
  const signInToAnother = () => {
    const other = noSignIn('u142')
    /* (a master admin: the sign-in holds rights in 149 and 150, so only he may put it on another man) */
    expect(asOther('saber', () => updateAccount(ACCT.ranger, { pid: other })), 'setup: Saber puts Ranger\'s sign-in on another 142 man').toBeNull()
    reload()
    expect(accountOfPid(PID.ranger), 'premise: Ranger has no sign-in now').toBeUndefined()
  }
  it.each([false, true])('his sign-in put on another man, the page redraws: the row closes with the note, once; nothing is sent; nothing left counted (strict mode: %s)', async strict => {
    const p = await kestrelPicksNoneForRanger({ strict })
    vi.mocked(HOOKS.toast).mockClear(); spy.calls.length = 0
    signInToAnother()
    const was = JSON.stringify(accountById(ACCT.ranger))
    spy.calls.length = 0
    await redraw()
    closedWithNote(p, PID.ranger)
    expect(spy.calls, 'nothing sent').toEqual([])
    expect(JSON.stringify(accountById(ACCT.ranger)), 'the sign-in, now the other man\'s, untouched').toBe(was)
    expect(workOn('userrow'), 'nothing left counted').toBe(false)
    await redraw()
    expect(anyRowNote(), 'a later draw does not say it again').toBe(1)
  })
  it('his sign-in put on another man, then a NEW one given him with View of 149, the page redrawn each time: the row closed with the note on the first draw, once; it never comes back open, and the pick is never carried onto the new sign-in', async () => {
    const p = await kestrelPicksNoneForRanger()
    vi.mocked(HOOKS.toast).mockClear()
    signInToAnother()
    await redraw()
    closedWithNote(p, PID.ranger)
    expect(asOther('saber', () => addAccount('ranger.new@mail', PID.ranger, 'main')), 'setup: a new sign-in for him').toBeNull()
    reload()
    const fresh = accountOfPid(PID.ranger)!
    expect(asOther('saber', () => saveAccess(fresh.id, { grants: { u149: 'view' } })), 'setup: and View of 149 on it').toBeNull()
    reload()
    spy.calls.length = 0
    await redraw()
    expect(p.noEditor(), 'still closed').toBe(true)
    expect(anyRowNote(), 'the note was said once, on the draw that closed it').toBe(1)
    expect(workOn('userrow'), 'not counted').toBe(false)
    expect(level(fresh.id, 'u149'), 'his new sign-in keeps what Saber gave it').toBe('view')
    expect(spy.calls, 'nothing sent').toEqual([])
  })
  it('one person: Saber gives a 142 man a sign-in, then on 149\'s page opens his short row and picks View; his own Undo takes the sign-in — the row closes with the note, once; his Redo brings no row back open and no pick with it', async () => {
    signInAs('saber')
    const x = noSignIn('u142')
    expect(addAccount('xman.new@mail', x, 'main'), 'setup: Saber gives him a sign-in (on 142\'s page)').toBeNull()
    reload()
    await pick('u149')
    const p = panel()
    await p.find(csOf(x))
    await p.open(x)
    expect(p.$('.acc-edit')?.getAttribute('data-short'), 'premise: his short row').toBe('1')
    expect(p.pressed('u149'), 'premise: he holds nothing of 149').toBe('none')
    await p.pickLine('u149', 'view')
    expect(p.unsaved(), 'premise: his pick').toBe('true')
    vi.mocked(HOOKS.toast).mockClear(); spy.calls.length = 0
    await act(async () => { expect(globalUndo().ok, 'his own Undo of the sign-in').toBe(true); reload(); notify() })
    expect(accountOfPid(x), 'premise: no sign-in now').toBeUndefined()
    closedWithNote(p, x)
    expect(workOn('userrow'), 'not counted').toBe(false)
    await act(async () => { expect(globalRedo().ok, 'his own Redo').toBe(true); reload(); notify() })
    expect(accountOfPid(x), 'premise: the sign-in is back').toBeTruthy()
    expect(p.noEditor(), 'no row back open with no press').toBe(true)
    expect(anyRowNote(), 'the note not said again').toBe(1)
    expect(workOn('userrow'), 'nothing counted').toBe(false)
    expect(spy.calls.filter(c => c[0] === 'saveAccess'), 'nothing sent by a row').toEqual([])
    const acct = accountOfPid(x)!
    expect(level(acct.id, 'u149'), 'he still holds nothing of 149').toBeNull()
  })
  it('a row he had put away himself (his own search no longer finding Ranger) whose sign-in then goes: closed with no note — it was not on the page; brought back, it is closed', async () => {
    const p = await kestrelPicksNoneForRanger()
    await p.find('zzzz')
    expect(p.rowOf(PID.ranger), 'premise: off the list by his own search').toBeNull()
    expect(workOn('userrow'), 'premise: still counted while put away').toBe(true)
    vi.mocked(HOOKS.toast).mockClear()
    signInToAnother()
    spy.calls.length = 0
    await redraw()
    expect(anyRowNote(), 'no note: the row was not on the page').toBe(0)
    expect(workOn('userrow'), 'nothing left counted').toBe(false)
    await p.find('Ranger')
    expect(p.rowOf(PID.ranger), 'premise: back on the list').not.toBeNull()
    expect(p.noEditor(), 'brought back closed').toBe(true)
    expect(anyRowNote(), 'and still no note').toBe(0)
    expect(spy.calls, 'nothing sent').toEqual([])
  })
  it('pin: NO pick made, and his sign-in is put on another man under the open short row: the row follows — the "No sign-in" words and Cancel alone, no note', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.find('Ranger')
    await p.open(PID.ranger)
    vi.mocked(HOOKS.toast).mockClear()
    signInToAnother()
    await redraw()
    expect(p.$('#accEdNoSignIn')?.textContent).toBe('No sign-in. Ask 142\'s admin to give him one first.')
    expect(p.$('#accEdSave'), 'no Save').toBeNull()
    expect(anyRowNote(), 'no note').toBe(0)
  })
  it('pin: the pick, and he is made a master admin under it — the row closes with the note, once, as the fifth round built', async () => {
    const p = await kestrelPicksNoneForRanger()
    expect(asOther('saber', () => saveAccess(ACCT.ranger, { role: 'admin', master: true })), 'setup: Saber makes Ranger a master admin').toBeNull()
    reload()
    vi.mocked(HOOKS.toast).mockClear(); spy.calls.length = 0
    await redraw()
    closedWithNote(p, PID.ranger)
    expect(spy.calls).toEqual([])
  })
})

/* ---- §36 A PICK MADE EQUAL TO HIS LINE BY ANOTHER ADMIN IS LET GO ----
   Kestrel picks None for Ranger (who holds View of 149); Saber, too, takes Ranger's View — the row reads untouched. The
   fifth round kept the pick all the same, so when Saber gave the View back the row turned, with no press, into Kestrel's
   change back to None, and its Save took the View away again — undoing Saber's latest act. The third round let a pick go
   when put back BY HAND for exactly this reason; now it is let go by any route, on the draw that finds it equal. */
describe('§36 — a pick made equal to the line he holds by another admin\'s change is let go', () => {
  it.each([false, true])('Saber takes the View Kestrel picked away, then gives it back: the row stays untouched with no press, not counted, and its Save sends nothing (strict mode: %s)', async strict => {
    signInAs('kestrel')
    const p = panel({ strict })
    await p.find('Ranger')
    await p.open(PID.ranger)
    await p.pickLine('u149', 'none')
    expect(p.unsaved(), 'premise: Kestrel picked None').toBe('true')
    expect(asOther('saber', () => saveAccess(ACCT.ranger, { grants: { u149: 'none' } })), 'setup: Saber takes Ranger\'s View of 149').toBeNull()
    reload(); await redraw()
    expect(p.unsaved(), 'reads untouched in between').toBeNull()
    expect(workOn('userrow'), 'not counted in between').toBe(false)
    expect(asOther('saber', () => saveAccess(ACCT.ranger, { grants: { u149: 'view' } })), 'setup: Saber gives it back').toBeNull()
    reload(); vi.mocked(HOOKS.toast).mockClear(); await redraw()
    expect(p.$('.acc-edit[data-short="1"]'), 'the row is still open').not.toBeNull()
    expect(p.unsaved(), 'with no press, the row does not turn into a change').toBeNull()
    expect(p.pressed('u149'), 'it shows the line he holds').toBe('view')
    expect(workOn('userrow'), 'not counted').toBe(false)
    expect(anyRowNote(), 'no note: nothing of Kestrel\'s was lost').toBe(0)
    spy.calls.length = 0
    await p.press('#accEdSave')
    expect(spy.calls, 'nothing sent').toEqual([])
    expect(level(ACCT.ranger, 'u149'), 'Saber\'s latest act stands').toBe('view')
  })
  it('once let go, the row is the untouched row it reads as — a press of None is a pick again, marked and counted, and its Save sends 149\'s line alone', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.find('Ranger')
    await p.open(PID.ranger)
    await p.pickLine('u149', 'none')
    expect(asOther('saber', () => saveAccess(ACCT.ranger, { grants: { u149: 'none' } }))).toBeNull(); reload(); await redraw()
    expect(asOther('saber', () => saveAccess(ACCT.ranger, { grants: { u149: 'view' } }))).toBeNull(); reload(); await redraw()
    expect(p.unsaved(), 'premise: untouched').toBeNull()
    await p.pickLine('u149', 'none')
    expect(p.unsaved(), 'a new pick').toBe('true')
    expect(workOn('userrow'), 'counted').toBe(true)
    spy.calls.length = 0
    await p.press('#accEdSave')
    expect(spy.calls, 'one call: 149\'s line alone').toEqual([['saveAccess', ACCT.ranger, { grants: { u149: 'none' } }]])
    expect(level(ACCT.ranger, 'u149')).toBeNull()
  })
})

/* ---- §37 THE REAL BELL LANDING REACHES USERS ON ITS FIRST DRAW ----
   Osprey's whole row is open on 149's page with a sign-in name typed; his move to 142 lands with nothing redrawn (the
   clock); Kestrel taps a bell line that lands on another 149 man. Through the real Admin page the landing was taken in an
   effect, so Users' first draw still had the old landing, judged Osprey's changed row and queued the note about his own
   tap; the landing that should have closed it silently arrived a draw later. Now the Admin page takes it while drawing.
   Tested through the app's own door, openAdminUsers, with the whole app mounted — never a landing handed in by hand. */
describe('§37 — the real bell landing, through the Admin page', () => {
  const settle = async () => { await act(async () => { await Promise.resolve(); await Promise.resolve() }) }
  const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
  const ospreyOpenThenMovesUnseen = async (strict: boolean) => {
    signInAs('saber')
    expect(moveMan(PID.osprey, 'u142'), 'setup: Osprey\'s move to 142, set for tomorrow').toMatchObject({ ok: true })
    signInAs('kestrel')
    vi.spyOn(HOOKS, 'isPhone').mockReturnValue(false)
    appPage = render(strict ? <StrictMode><App /></StrictMode> : <App />)
    await settle()
    await act(async () => { setPage('admin'); notify() })
    await settle()
    expect(CURPAGE, 'premise: the Admin page').toBe('admin')
    await act(async () => { fireEvent.change($('#accFind')!, { target: { value: csOf(PID.osprey) } }) })
    await act(async () => { fireEvent.click($(`[data-testid="acc-groups"] .acc-row[data-person="${PID.osprey}"] .acc-tap`)!) })
    await act(async () => { fireEvent.change($('#accEdName')!, { target: { value: 'unsaved.osprey@mail' } }) })
    vi.mocked(HOOKS.toast).mockClear(); spy.calls.length = 0
    on(16); reload()
    expect(homeOn(PID.osprey, todayIso()), 'premise: his move has landed, nothing redrawn').toBe('u142')
    expect(($('#accEdName') as HTMLInputElement).value, 'premise: the row still stands, his typing in it').toBe('unsaved.osprey@mail')
  }
  it.each([false, true])('a landing for another man closes the row Osprey\'s move changed unseen — silently, then and on later draws; the other man ringed; nothing saved (strict mode: %s)', async strict => {
    await ospreyOpenThenMovesUnseen(strict)
    const savedName = accountById(ACCT.osprey)!.name
    const other = rosterOf('u149', todayIso()).find(id => { const x = P(id); return x && !x.special && !x.archived && !x.deleted && id !== PID.osprey && !accountOfPid(id) })
    expect(other, 'setup: another 149 man to land on').toBeTruthy()
    await act(async () => { openAdminUsers({ person: other! }) })
    await settle()
    expect($('#page-admin .acc-edit'), 'the row closed').toBeNull()
    expect($(`#page-admin .acc-row[data-person="${other}"]`)?.classList.contains('acc-ring'), 'the man landed on wears the ring').toBe(true)
    expect(accountById(ACCT.osprey)!.name, 'nothing typed was saved').toBe(savedName)
    expect(anyRowNote(), 'his own bell tap: no note').toBe(0)
    await act(async () => { notify() })
    await settle()
    expect(anyRowNote(), 'and no note a draw later').toBe(0)
    expect(spy.calls, 'nothing sent').toEqual([])
  })
  it('pin: a landing for the very man whose row is open is judged as before — his move had landed unseen, so the row closes with the note, once', async () => {
    await ospreyOpenThenMovesUnseen(false)
    await act(async () => { openAdminUsers({ person: PID.osprey }) })
    await settle()
    expect($('#page-admin .acc-edit'), 'the row closed').toBeNull()
    expect(notesFor(csOf(PID.osprey)), 'the note, once').toBe(1)
    await act(async () => { notify() })
    await settle()
    expect(anyRowNote(), 'not again').toBe(1)
  })
  it('pin: a landing for the very man whose row is open, nothing changed under it — the row stays open with his typing, no note', async () => {
    signInAs('kestrel')
    vi.spyOn(HOOKS, 'isPhone').mockReturnValue(false)
    appPage = render(<App />)
    await settle()
    await act(async () => { setPage('admin'); notify() })
    await settle()
    await act(async () => { fireEvent.change($('#accFind')!, { target: { value: csOf(PID.osprey) } }) })
    await act(async () => { fireEvent.click($(`[data-testid="acc-groups"] .acc-row[data-person="${PID.osprey}"] .acc-tap`)!) })
    await act(async () => { fireEvent.change($('#accEdName')!, { target: { value: 'unsaved.osprey@mail' } }) })
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => { openAdminUsers({ person: PID.osprey }) })
    await settle()
    expect(($('#accEdName') as HTMLInputElement | null)?.value, 'still open, his typing kept').toBe('unsaved.osprey@mail')
    expect($(`#page-admin .acc-row[data-person="${PID.osprey}"]`)?.classList.contains('acc-ring'), 'ringed').toBe(true)
    expect(anyRowNote(), 'no note').toBe(0)
  })
})

/* ---- §38 MIDNIGHT ALONE NEVER CLOSES AN ARCHIVED ROW WHOSE POST-IN DATE HE PICKED ----
   Kestrel archives Osprey, opens his archived row, types a callsign and picks 20 Jul. The copy holds the date the box
   opens on — today — so at midnight the row counted as changed though the box showed his own date before and after:
   closed with the note on the page, and with no word at all in the shut fold, his callsign and date thrown away. Now the
   copy's date is compared only while he has left the box untouched. */
describe('§38 — an archived row whose post-in date he picked, across midnight', () => {
  const kestrelPicksADate = async () => {
    signInAs('kestrel')
    expect(archivePerson(PID.osprey).bad, 'setup: Kestrel archives Osprey').toBeFalsy()
    reload()
    const p = panel()
    await p.openArch(PID.osprey)
    await p.type('#accArCs', 'Typedname')
    await p.pickDate('2026-07-20')
    expect({ box: p.box(), date: p.postIn() }, 'premise: a callsign typed and his own post-in date picked').toEqual({ box: 'Typedname', date: '2026-07-20' })
    vi.mocked(HOOKS.toast).mockClear()
    return p
  }
  it('on the page: midnight passes — the row stays open with his callsign and his date, counted, no note', async () => {
    const p = await kestrelPicksADate()
    on(16); reload()
    expect(todayIso(), 'premise: the next day').toBe('2026-07-16')
    await redraw()
    expect({ open: !!p.$('#accArCs'), box: p.box(), date: p.postIn(), notes: anyRowNote(), counted: workOn('archrow') })
      .toEqual({ open: true, box: 'Typedname', date: '2026-07-20', notes: 0, counted: true })
  })
  it('put away in the shut fold: midnight passes, the fold opened again — the row is still open with his work, no note', async () => {
    const p = await kestrelPicksADate()
    await p.press('#accArchToggle')
    expect(p.$('#accArchList'), 'premise: the fold is shut').toBeNull()
    on(16); reload()
    await redraw()
    await p.press('#accArchToggle')
    expect({ open: !!p.$('#accArCs'), box: p.box(), date: p.postIn(), notes: anyRowNote(), counted: workOn('archrow') })
      .toEqual({ open: true, box: 'Typedname', date: '2026-07-20', notes: 0, counted: true })
  })
  it('after midnight, his Restore goes through on the date and callsign he chose: the row\'s own press asks again with what he typed, and does not refuse', async () => {
    const p = await kestrelPicksADate()
    on(16); reload()
    await redraw()
    await p.press('#accArRestore')
    expect(anyRowNote(), 'no row-changed note').toBe(0)
    expect(P(PID.osprey).archived, 'restored').toBeFalsy()
    expect(csOf(PID.osprey), 'as the callsign he typed').toBe('Typedname')
    expect(p.noEditor(), 'the row closed by its own press').toBe(true)
  })
  it('pin: his date picked, then picked back to the day the box opened on: untouched again — midnight closes the row with the note, as an untouched box does', async () => {
    const p = await kestrelPicksADate()
    await p.pickDate('2026-07-15')
    expect(p.postIn(), 'premise: back on the date the box opened on').toBe('2026-07-15')
    on(16); reload()
    await redraw()
    closedWithNote(p, PID.osprey)
  })
  it('pin: the date left untouched — midnight closes the row with the note, once (msq-s2-rejudge4.test.tsx §19)', async () => {
    signInAs('kestrel')
    expect(archivePerson(PID.osprey).bad).toBeFalsy()
    reload()
    const p = panel()
    await p.openArch(PID.osprey)
    await p.type('#accArCs', 'Typedname')
    vi.mocked(HOOKS.toast).mockClear()
    on(16); reload()
    await redraw()
    closedWithNote(p, PID.osprey)
  })
})

/* ---- §39 "GIVE ACCESS", CHANGED, IS THROWN AWAY WHEN ITS REQUEST LEAVES THE PAGE'S LIST ----
   A stranger asks to join 149; Hunter, on 149's page by his Plan, opens Give access and sets its Role to Admin, then picks
   142. The form and its change were held out of sight and no longer counted; a pick of 149 brought the form back open
   with the change. Now it is thrown away while drawing, as an open row is at a pick today. */
describe('§39 — Give access, changed, across a squadron pick', () => {
  it('picked away to 142: the form is gone and not counted; back on 149 the request waits with its Give access button, the form closed, nothing counted', async () => {
    signInAs('newface@mail')
    expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' }, 'u149'), 'setup: a stranger asks to join 149').toBeNull()
    signInAs('hunter')
    await pick('u149')
    expect(pageUnit('own'), 'premise: 149\'s page by his Plan').toBe('u149')
    const p = panel()
    await p.press('[data-approve]')
    await act(async () => { fireEvent.change(p.$('#apvRole')!, { target: { value: 'admin' } }) })
    expect(workOn('giveaccess'), 'premise: counted').toBe(true)
    await pick('u142')
    expect(pageUnit('own')).toBe('u142')
    expect(p.$('[data-approving]'), 'on 142: no form').toBeNull()
    expect(workOn('giveaccess'), 'on 142: not counted').toBe(false)
    await pick('u149')
    expect(p.$('[data-approving]'), 'back on 149: the form is not brought back open').toBeNull()
    expect(p.$('[data-approve]'), 'the request still waits, its Give access button there').not.toBeNull()
    expect(workOn('giveaccess'), 'nothing counted').toBe(false)
    await p.press('[data-approve]')
    expect((p.$('#apvRole') as HTMLSelectElement | null)?.value, 'opened again: fresh, Member').toBe('main')
  })
  it('pin: while its request still waits on the page, the changed form counts (msq-s2-rejudge5.test.tsx §34)', async () => {
    signInAs('newface@mail')
    expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' }, 'u149')).toBeNull()
    signInAs('kestrel')
    const p = panel()
    await p.press('[data-approve]')
    expect(workOn('giveaccess'), 'unchanged: not counted').toBe(false)
    await act(async () => { fireEvent.change(p.$('#apvRole')!, { target: { value: 'admin' } }) })
    expect(workOn('giveaccess'), 'changed: counted').toBe(true)
    await redraw()
    expect(p.$('[data-approving]'), 'still open across a draw').not.toBeNull()
    expect(workOn('giveaccess'), 'still counted').toBe(true)
  })
})
