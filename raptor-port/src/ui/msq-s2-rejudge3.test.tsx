// @vitest-environment jsdom
/* ADMIN → USERS ACROSS SQUADRONS — STEP U1'S THIRD FIX ROUND: FOUR SMALL FAULTS IN THE SECOND ROUND'S NEW BEHAVIOUR (the
   brief docs/superpowers/briefs/2026-11-26-msq-s2-u1fix3-brief.md; the first round's tests are msq-s2-rejudge.test.tsx,
   the second's msq-s2-rejudge2.test.tsx, whose §9 also holds this round's "a pick put back by hand is let go").
   Four blind readers of the second round (chat 205 — Astra, a fresh Fable, a fresh Opus, the security reader) found the
   rule sound — no route lets one squadron's admin see or change what it forbids, every write asks again — and proved four
   small faults in what the second round added. Their proofs are kept here as lasting tests, each seen failing on the
   second round's code (7338bf1fc) before the app changed, except where named "pin:" (what held already and must go on
   holding) or "as built today".
   WHAT THIS ROUND ADDS TO THE RULE:
   - §12 THE NOTE WHEN THE APP ITSELF TAKES THE ADMIN PAGE AWAY. The list is drawn only while the app is on the Admin page
     (ui/Shell.tsx), so these tests draw the WHOLE APP — the second round's tests drew the list alone, which is how the
     fault got through. A right of his lowered so the app lands him on another page: the note, once. Every way HE leaves
     stays silent: another tab pressed, Logout, the member view, his own pick, a row already closed or put out of sight.
   - §13 NO NOTE ABOUT A ROW THAT IS NOT ON THE PAGE. A row he hid himself (his search, a tick, the shut Archived fold)
     still closes when it changes under him, and nothing is said about it.
   - §14 AN OPEN ROW THAT LEAVES THE LIST BY NO ACT OF HIS IS CLOSED WITH THE NOTE — never left held, never back open with
     no press. So the rule's "the open short row follows the line he holds and stays open" holds WHILE HE STAYS ON THE
     PAGE'S LIST: a Plan holder listed only for his Plan leaves it when the Plan goes.
   - §15 what the Fable read pressed on and found sound (its proof 0), kept so it stays so.
   SINCE THE FOURTH ROUND (the brief …-u1fix4-brief.md; its own tests are msq-s2-rejudge4.test.tsx): ONE test of this file
   was re-pointed, by name — §12's "as built today: Hunter is made a member by a master admin while Ranger's row is open …
   nothing is said" now reads "… and the note is said, once, as his standing goes", run as the app runs too (every draw
   twice), with a pin beside it for the same from a squadron he works by his Plan (typed work is never dropped without a
   word; the page holds who is looking). No other test here was changed.
   The world: three squadrons (withThird — his D2630), Wed 15 Jul 26, 09:00. Hunter — 142's admin, Plan of 149, View of
   150; Saber — master admin, home 142; Ranger — 142's member, View of 149 and of 150; Kestrel — 149's admin; Osprey —
   149's member; Mako — 150's own admin. */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { StrictMode } from 'react'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { withThird, third, signInAs, PID, ACCT, SIGN, moveMan, on, pastMidnight } from '../test-support/msq-world'
import { UsersPanel } from './UsersPanel'
import { App } from './App'
import { useVersion } from './useStore'
import {
  accountById, accountOfPid, accountsLoad, updateAccount, saveAccess, addAccount, signIn, sessionFor, levelAcct,
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
import { globalUndo } from '../undo/timeline'
import { archivePerson, restoreArchivedPerson } from '../leavewar/sync'
import { deletePerson } from '../state/person-delete'
import { setReloadSeam } from './logout'
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
let reloadWas: (() => void) | null = null
afterEach(() => {
  if (appPage) { appPage.unmount(); appPage = null }
  if (reloadWas) { setReloadSeam(reloadWas); reloadWas = null }
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

/* ---- the list drawn alone (it redraws on the store's version, as the Admin page does around it) ---- */
type RingIn = { seq: number; pid: string; on: boolean }
function Live(p: { ring?: RingIn }) { useVersion(); return <UsersPanel shown ring={p.ring} /> }
function panel(o: { strict?: boolean; ring?: RingIn } = {}) {
  const page = render(o.strict ? <StrictMode><Live ring={o.ring} /></StrictMode> : <Live ring={o.ring} />)
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
  const lineUnits = () => $$('[data-testid="acc-sq"] .acc-sq-n').map(n => n.dataset.unit)
  const pressed = (unit: string) => {
    const n = $(`[data-testid="acc-sq"] .acc-sq-n[data-unit="${unit}"]`)
    return (n?.nextElementSibling as HTMLElement | null)?.querySelector('[aria-pressed="true"]')?.getAttribute('data-line') ?? null
  }
  const pickLine = async (unit: string, v: string) => {
    const n = $(`[data-testid="acc-sq"] .acc-sq-n[data-unit="${unit}"]`)!
    await act(async () => { fireEvent.click((n.nextElementSibling as HTMLElement).querySelector(`[data-line="${v}"]`)!) })
  }
  /* no editor of any kind is drawn anywhere on the page */
  const noEditor = () => $('.acc-edit') === null
  return { $, $$, rowOf, archRowOf, press, type, open, openArch, find, tick, lineUnits, pressed, pickLine, noEditor, html: () => page.container.innerHTML }
}
const pick = async (u: string) => { await act(async () => { await pickSquadron(u) }) }
const redraw = async () => { await act(async () => { notify() }) }
const WHOLE = ['#accEdName', '#accEdRole', '#accEdOnOff', '#accEdArchive', '#accEdDel', '#accGive', '#accGiveName']

/* ---- the whole app ---- */
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const settle = async () => { await act(async () => { await Promise.resolve(); await Promise.resolve() }) }
const pressApp = async (sel: string, what: string) => {
  expect($(sel), `${what} is drawn`).not.toBeNull()
  await act(async () => { fireEvent.click($(sel)!) })
  await settle()
}
/* `who` signed in, the app on Admin → Users (after his pick of `picked`, where given), `pid`'s whole row open and a rename
   typed in it — nothing saved; `strict`: every draw run twice, as the app itself runs (main.tsx) */
async function appOnUsers(who: 'hunter' | 'saber' | 'kestrel', pid: string, o: { picked?: string; strict?: boolean } = {}) {
  signInAs(who)
  appPage = render(o.strict ? <StrictMode><App /></StrictMode> : <App />)
  await settle()
  if (o.picked) await pick(o.picked)
  await act(async () => { setPage('admin'); notify() })
  await settle()
  expect(CURPAGE, 'premise: the app is on the Admin page').toBe('admin')
  await act(async () => { fireEvent.change($('#accFind')!, { target: { value: csOf(pid) } }) })
  const row = $(`[data-testid="acc-groups"] .acc-row[data-person="${pid}"]`)
  expect(row, 'premise: he is on the list').not.toBeNull()
  await act(async () => { fireEvent.click(row!.querySelector('.acc-tap')!) })
  expect($('#accEdName'), 'premise: his whole row is open').not.toBeNull()
  await act(async () => { fireEvent.change($('#accEdName')!, { target: { value: 'typed@mail' } }) })
  expect(($('#accEdName') as HTMLInputElement).value, 'premise: a rename is typed in it').toBe('typed@mail')
  vi.mocked(HOOKS.toast).mockClear()
}
/* Hunter — 142's admin with Plan of 149 — has picked 149 and is on its Admin → Users, Osprey's whole row open */
const hunterOn149 = async (strict = false) => {
  await appOnUsers('hunter', PID.osprey, { picked: 'u149', strict })
  expect(pageUnit('own'), 'premise: his own pages are 149\'s (his Plan)').toBe('u149')
}
const lowerHuntersPlan = async () => {
  expect(asOther('saber', () => saveAccess(ACCT.hunter, { grants: { u149: 'view' } })), 'setup: Saber lowers Hunter\'s Plan of 149 to View').toBeNull()
  reload()
  await act(async () => { notify() })
  await settle()
}
/* where the app left him once his Plan of 149 became a View: 149 still in view, his own pages 142's again, the Admin page
   taken away for 149's View-only Sched — the open row and the typing gone with it, nothing saved */
const landedOffTheAdminPage = () => {
  expect(UNIT, 'premise: 149 stays the squadron in view (he may still view it)').toBe('u149')
  expect(pageUnit('own'), 'premise: his own pages are 142\'s again').toBe('u142')
  expect(CURPAGE, 'premise: the app landed him on 149\'s View-only Sched').toBe('viewsched')
  expect($('#admUsers'), 'premise: the Admin page is not drawn').toBeNull()
  expect($('.acc-edit'), 'premise: his open row is gone').toBeNull()
}
const nothingSaved = (acct: string) => expect(accountById(acct)!.name, 'nothing typed was saved').not.toBe('typed@mail')

/* ---- §12 THE NOTE WHEN THE APP ITSELF TAKES THE ADMIN PAGE AWAY (the brief's item 1 — the Opus read 1, the Fable read 1) ----
   Hunter has a row open on 149's Admin → Users with a rename typed. Another admin LOWERS his Plan of 149 to View: the same
   notify that moves his own pages back to 142 lands him on 149's View-only Sched (state/store.ts — a squadron he only views
   offers no Admin page, D2381), so the list is taken off the page before it is ever drawn again and its judging on a draw
   never runs. "Plan taken away" keeps the Admin page and already said the note; "lowered" said nothing. The page now
   judges once more as it goes. */
describe('§12 — the whole app: the Admin page taken away under an open row says the note; every way he leaves is silent', () => {
  it('a master admin LOWERS Hunter\'s Plan of 149 to View under his open row (the Opus read 1, the Fable read 1): the app lands him on 149\'s View-only Sched, his row and his typing go — and the note is said, once', async () => {
    await hunterOn149()
    await lowerHuntersPlan()
    landedOffTheAdminPage()
    nothingSaved(ACCT.osprey)
    expect(notesFor(csOf(PID.osprey)), 'closed with no pick of his: the note, once').toBe(1)
    await act(async () => { notify() })
    await settle()
    expect(notesFor(csOf(PID.osprey)), 'still once after a later draw').toBe(1)
  })
  it('the same with every draw run twice (React\'s strict mode, as the app runs): the note is said once', async () => {
    await hunterOn149(true)
    expect(anyRowNote(), 'premise: opening the page and the row under strict mode says nothing').toBe(0)
    await lowerHuntersPlan()
    landedOffTheAdminPage()
    expect(notesFor(csOf(PID.osprey)), 'once').toBe(1)
  })
  it('pin: a master admin TAKES Hunter\'s Plan of 149 away (the readers\' control): the app puts him back on 142, the Admin page stays, the row closes with the note — once, not again as the page later goes', async () => {
    await hunterOn149()
    expect(asOther('saber', () => saveAccess(ACCT.hunter, { grants: { u149: 'none' } })), 'setup: Saber takes the Plan away').toBeNull()
    reload()
    await act(async () => { notify() })
    await settle()
    expect(pageUnit('own'), 'his own pages are 142\'s again').toBe('u142')
    expect(CURPAGE, 'the app is still on the Admin page').toBe('admin')
    expect($('.acc-edit'), 'the row closed').toBeNull()
    nothingSaved(ACCT.osprey)
    expect(notesFor(csOf(PID.osprey)), 'closed with no pick of his: the note, once').toBe(1)
    await pressApp('a[data-page="viewsched"]', 'the View-only Sched tab')
    expect(notesFor(csOf(PID.osprey)), 'leaving the page afterwards says nothing more').toBe(1)
  })
  it('pin: Hunter\'s own move to 150 lands at midnight with Ranger\'s row open (the Fable read\'s soundness test, the Opus read\'s control): the note is said once before the app makes him a member of 150 and takes the Admin page away — not again as it goes', async () => {
    signInAs('saber')
    expect(moveMan(PID.hunter, third.u150), 'setup: Hunter moves to 150 from tomorrow').toMatchObject({ ok: true })
    await appOnUsers('hunter', PID.ranger)
    await act(async () => { pastMidnight() })
    await settle()
    expect(homeOn(PID.hunter, todayIso())).toBe(third.u150)
    expect($('.acc-edit'), 'no editor').toBeNull()
    expect(isAdmin(), 'he is a member of the squadron he joined (K3)').toBe(false)
    expect(CURPAGE).not.toBe('admin')
    expect(notesFor(csOf(PID.ranger)), 'the note, once').toBe(1)
  })

  /* EVERY WAY HE LEAVES STAYS SILENT (settled with the core's chat 204): his typing goes, as it always has when he leaves
     a page, and nothing is said — the note is for a row closed under him, never for his own leaving. */
  it('silent: he presses another tab (View-only Sched) with the row open and a rename typed: the Admin page goes, nothing saved, no note', async () => {
    await hunterOn149()
    await pressApp('a[data-page="viewsched"]', 'the View-only Sched tab')
    expect(CURPAGE).toBe('viewsched')
    expect($('#admUsers'), 'the Admin page is not drawn').toBeNull()
    nothingSaved(ACCT.osprey)
    expect(anyRowNote(), 'his own leaving: no note').toBe(0)
  })
  it('silent: he presses another tab after the row changed under him with nothing redrawn (Osprey\'s move landed unseen): still his own leaving — no note', async () => {
    signInAs('saber')
    expect(moveMan(PID.osprey, 'u142'), 'setup: Osprey moves to 142 from tomorrow').toMatchObject({ ok: true })
    await appOnUsers('kestrel', PID.osprey)
    on(16); reload()
    expect(homeOn(PID.osprey, todayIso()), 'premise: the move day — he is 142\'s').toBe('u142')
    expect($('#accEdName'), 'premise: nothing redrew — the row still stands').not.toBeNull()
    await pressApp('a[data-page="viewsched"]', 'the View-only Sched tab')
    expect($('#admUsers'), 'the Admin page is not drawn').toBeNull()
    nothingSaved(ACCT.osprey)
    expect(anyRowNote(), 'the Admin page is still his to open: he left it himself — no note').toBe(0)
  })
  it('silent: Logout with the row open and a rename typed, on a squadron he works by his Plan: signed out, nothing saved, no note', async () => {
    await hunterOn149()
    reloadWas = setReloadSeam(() => {})
    await pressApp('#logout', 'Logout')
    expect(SESSION, 'he is signed out').toBeNull()
    expect($('#admUsers'), 'the Admin page is not drawn').toBeNull()
    nothingSaved(ACCT.osprey)
    expect(anyRowNote(), 'his own leaving: no note').toBe(0)
  })
  it('silent: the switch to the member view (his name badge) with the row open on a squadron he works by his Plan: his own pages go home and the Admin page goes — no note', async () => {
    await hunterOn149()
    await pressApp('#roleBadge', 'his name badge')
    expect(isAdmin(), 'the member view is on').toBe(false)
    expect(pageUnit('own'), 'premise: in the member view his own pages are his home\'s').toBe('u142')
    expect($('.acc-edit'), 'no row').toBeNull()
    expect($('#accFind'), 'the list is not drawn').toBeNull()
    nothingSaved(ACCT.osprey)
    expect(anyRowNote(), 'his own leaving: no note').toBe(0)
  })
  it('silent: his own pick of a squadron he only views (150), from 149\'s Admin → Users with the row open: the Admin page goes with the pick — no note', async () => {
    await hunterOn149()
    await pick(third.u150)
    await settle()
    expect(UNIT, 'premise: 150 in view').toBe(third.u150)
    expect(pageUnit('own'), 'premise: his own pages are 142\'s — the row\'s squadron is no longer the page\'s').toBe('u142')
    expect(CURPAGE, 'the app landed him on 150\'s View-only Sched').toBe('viewsched')
    expect($('#admUsers'), 'the Admin page is not drawn').toBeNull()
    nothingSaved(ACCT.osprey)
    expect(anyRowNote(), 'his own pick: no note').toBe(0)
  })
  /* AS THE APP STANDS (the Fable read's soundness test; the brief: "for now, a pick closes an open row and drops what was
     typed in it"): the rule's "a pick of a squadron he may only view leaves the row open" holds for the list drawn alone
     (msq-s2-rejudge2 §10), but in the app that pick lands him on the squadron's View-only Sched and the Admin page is
     taken away with the row. */
  it('silent, as the app stands: Hunter\'s View-only pick of 150 from 142\'s own Admin → Users with Ranger\'s row open — the Admin page goes with the row; back on 142\'s Admin → Users the row is closed and nothing is said', async () => {
    await appOnUsers('hunter', PID.ranger)
    await pick(third.u150)
    await settle()
    expect(pageUnit('own'), 'his own pages stay 142\'s').toBe('u142')
    expect(CURPAGE, 'the app landed him on 150\'s View-only Sched').toBe('viewsched')
    expect($('#admUsers'), 'the Admin page is not drawn').toBeNull()
    await pick('u142')
    await act(async () => { setPage('admin'); notify() })
    await settle()
    expect($('#admUsers'), 'the Admin page again').not.toBeNull()
    expect($('.acc-edit'), 'no row open').toBeNull()
    expect(anyRowNote(), 'no note').toBe(0)
    nothingSaved(ACCT.ranger)
  })
  it('silent: his own pick where the Admin page stays (Saber picks 149 with Ranger\'s row open — the Fable read\'s soundness test): the row closes, no note; Ranger found again on 149\'s page is the short row', async () => {
    await appOnUsers('saber', PID.ranger)
    await pick('u149')
    await settle()
    expect(CURPAGE).toBe('admin')
    expect(pageUnit('own')).toBe('u149')
    expect($('.acc-edit'), 'closed').toBeNull()
    expect(anyRowNote(), 'no note').toBe(0)
    const row = $(`[data-testid="acc-groups"] .acc-row[data-person="${PID.ranger}"]`)
    expect(row, 'the search still finds him').not.toBeNull()
    expect(row!.querySelector('.acc-main b'), 'short: no sign-in name').toBeNull()
    nothingSaved(ACCT.ranger)
  })
  it('silent: a row already closed (Cancel pressed) when his Plan is lowered: the Admin page goes, and nothing is said about a row he closed himself', async () => {
    await hunterOn149()
    await pressApp('#accEdCancel', 'the row\'s Cancel')
    expect($('.acc-edit'), 'premise: the row is closed').toBeNull()
    await lowerHuntersPlan()
    landedOffTheAdminPage()
    expect(anyRowNote(), 'no row was open: no note').toBe(0)
  })
  it('silent: a row he put out of sight himself (his search changed) when his Plan is lowered: the Admin page goes, and nothing is said about a row that was not on the page', async () => {
    await hunterOn149()
    await act(async () => { fireEvent.change($('#accFind')!, { target: { value: 'no such callsign' } }) })
    expect($('.acc-edit'), 'premise: his search hides the open row').toBeNull()
    await lowerHuntersPlan()
    landedOffTheAdminPage()
    expect(anyRowNote(), 'the row was not on the page: no note').toBe(0)
  })
  it('silent: the man DELETED under the open row in the same moment his Plan is lowered: the Admin page goes, and no note — he cannot be opened again', async () => {
    await hunterOn149()
    expect(asOther('saber', () => deletePerson(PID.osprey)), 'setup: Saber deletes Osprey').toBeNull()
    await lowerHuntersPlan()
    landedOffTheAdminPage()
    expect(anyRowNote(), 'a deleted man: no note').toBe(0)
  })
  /* AS BUILT TODAY, THE OWNER'S TO RULE LATER (the brief; the Fable read's soundness test, the Opus read's "related, not
     claimed"): the signed-in admin is made a member by another admin while his row is open. The app makes his session a
     member's and takes the Admin page away; his open row and his typing go with it and nothing is said — none of the four
     things the page judges by has changed, and the rule's list of what owes the note does not name it. */
  /* RE-POINTED BY THE FOURTH ROUND (the brief …-u1fix4-brief.md, S1's second half; it read "as built today: … nothing is
     said" — the one case the third round left as built). Typed work is never dropped without a word: the page holds who
     is looking — whether his account still makes him an admin of the squadron the row opened on — so the draw before the
     app makes his session a member's closes the row with the note. Everything else the test held is kept. */
  it.each([false, true])('Hunter is made a member by a master admin while Ranger\'s row is open, a rename typed — the Admin page goes, nothing is saved, and the note is said, once, as his standing goes (every draw twice, as the app runs: %s)', async strict => {
    await appOnUsers('hunter', PID.ranger, { strict })
    expect(asOther('saber', () => saveAccess(ACCT.hunter, { role: 'main' })), 'setup: Saber makes Hunter a member').toBeNull()
    reload()
    await act(async () => { notify() })
    await settle()
    expect(isAdmin(), 'he is a member now').toBe(false)
    expect(CURPAGE).not.toBe('admin')
    expect($('.acc-edit')).toBeNull()
    nothingSaved(ACCT.ranger)
    expect(notesFor(csOf(PID.ranger)), 'the note, once').toBe(1)
    await act(async () => { notify() })
    await settle()
    expect(anyRowNote(), 'and not again').toBe(1)
  })
  it('pin (held before the fourth round too — his Plan ends with his role, so the page\'s squadron changes): the same from a squadron he works by his Plan, every draw run twice: the note is said once', async () => {
    await hunterOn149(true)
    expect(asOther('saber', () => saveAccess(ACCT.hunter, { role: 'main' })), 'setup: Saber makes Hunter a member').toBeNull()
    reload()
    await act(async () => { notify() })
    await settle()
    expect(isAdmin(), 'he is a member now').toBe(false)
    expect($('.acc-edit')).toBeNull()
    nothingSaved(ACCT.osprey)
    expect(anyRowNote(), 'the note, once').toBe(1)
    expect(notesFor(csOf(PID.osprey))).toBe(1)
  })
})

/* ---- §13 NO NOTE ABOUT A ROW THAT IS NOT ON THE PAGE (the brief's item 3 — the Fable read 2) ----
   The page keeps which row is open even while that row is not drawn: hidden by his own search (another squadron's man is
   on the list only while a search finds him), by a tick, or by the Archived fold he shut — older than this step, and left
   so. Its editor is already gone then. The second round judged the remembered row on every draw all the same, so a change
   to that man said "<Callsign>’s row changed while it was open…" about a row the admin put away himself, perhaps hours
   before. The row still closes; the note is raised only for a row that was on the page at the last draw. */
describe('§13 — a row the admin put out of sight himself still closes when it changes, and nothing is said about it', () => {
  const rangersMoveTo149 = () => {
    signInAs('saber')
    expect(moveMan(PID.ranger, 'u149'), 'setup: Ranger moves to 149 from tomorrow').toMatchObject({ ok: true })
  }
  it('Kestrel finds Ranger, opens his short row, then clears the search (Ranger leaves 149\'s list); Ranger\'s move lands at midnight (the Fable read 2): no note about a row that is not on the page — and on the list he joined his row is closed', async () => {
    rangersMoveTo149()
    signInAs('kestrel')
    const p = panel()
    await p.find(csOf(PID.ranger))
    await p.open(PID.ranger)
    expect(p.$('.acc-edit[data-short="1"]'), 'premise: his short row is open').not.toBeNull()
    await p.find('')
    expect(p.rowOf(PID.ranger), 'premise: with the search cleared he is not on 149\'s list at all').toBeNull()
    expect(p.noEditor(), 'premise: no editor is drawn anywhere').toBe(true)
    vi.mocked(HOOKS.toast).mockClear()
    on(16); reload()
    await redraw()
    expect(homeOn(PID.ranger, todayIso()), 'the move day: he is 149\'s own man').toBe('u149')
    expect(pageUnit('own')).toBe('u149')
    expect(anyRowNote(), 'no row of his was on the page: nothing to say').toBe(0)
    expect(p.rowOf(PID.ranger), 'he is on 149\'s list now, its own man').not.toBeNull()
    expect(p.noEditor(), 'and the row closed all the same — never drawn open with no press').toBe(true)
  })
  it('Kestrel opens an archived man\'s row, then shuts the Archived fold; another admin restores him (the Fable read 2): no note about a row inside a shut fold — and his roster row is not open', async () => {
    signInAs('kestrel')
    expect(archivePerson(PID.osprey).bad, 'setup: Osprey archived').toBeNull()
    reload()
    const p = panel()
    await p.openArch(PID.osprey)
    expect(p.$('#accArRestore'), 'premise: his archived row is open').not.toBeNull()
    await p.press('#accArchToggle')
    expect(p.$('#accArchList'), 'premise: the fold is shut — no archived row is drawn').toBeNull()
    vi.mocked(HOOKS.toast).mockClear()
    expect(asOther('saber', () => restoreArchivedPerson(PID.osprey, todayIso())), 'setup: Saber restores Osprey').toBe(true)
    reload()
    await redraw()
    expect(p.rowOf(PID.osprey), 'he is back on the roster list').not.toBeNull()
    expect(p.noEditor(), 'no editor is drawn').toBe(true)
    expect(anyRowNote(), 'no row of his was on the page: nothing to say').toBe(0)
  })
  it('Kestrel has Osprey\'s whole row open, then ticks the Filter\'s Role "Admin" (Osprey, a member, leaves the list); Osprey\'s move lands at midnight: no note about a row a tick had hidden — and with the tick off no whole row is drawn for him', async () => {
    signInAs('saber')
    expect(moveMan(PID.osprey, 'u142'), 'setup: Osprey moves to 142 from tomorrow').toMatchObject({ ok: true })
    signInAs('kestrel')
    const p = panel()
    await p.open(PID.osprey)
    expect(p.$('#accEdName'), 'premise: his whole row is open').not.toBeNull()
    await p.tick('role:admin')
    expect(p.rowOf(PID.osprey), 'premise: the tick hides him').toBeNull()
    vi.mocked(HOOKS.toast).mockClear()
    on(16); reload()
    await redraw()
    expect(anyRowNote(), 'no row of his was on the page: nothing to say').toBe(0)
    await p.press('#accFilterClear')
    await p.find(csOf(PID.osprey))
    expect(p.rowOf(PID.osprey), 'found again, 142\'s man now').not.toBeNull()
    expect(p.noEditor(), 'the row closed: nothing of him opens with no press').toBe(true)
  })
  it('pin (the reader\'s control): the first case with the search left as it was — the row is on the page, it closes, the note once', async () => {
    rangersMoveTo149()
    signInAs('kestrel')
    const p = panel()
    await p.find(csOf(PID.ranger))
    await p.open(PID.ranger)
    vi.mocked(HOOKS.toast).mockClear()
    on(16); reload()
    await redraw()
    expect(p.noEditor(), 'closed').toBe(true)
    expect(notesFor(csOf(PID.ranger)), 'the note, once').toBe(1)
  })
  it('pin: a row hidden by his search and brought back by it, nothing changed meanwhile, is still open — held as before this step, no note', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.find(csOf(PID.ranger))
    await p.open(PID.ranger)
    await p.find('')
    expect(p.noEditor(), 'premise: hidden with the search cleared').toBe(true)
    await redraw()
    await p.find(csOf(PID.ranger))
    expect(p.rowOf(PID.ranger)!.querySelector('.acc-edit[data-short="1"]'), 'held: his short row is open again').not.toBeNull()
    expect(anyRowNote(), 'no note').toBe(0)
  })
})

/* ---- §14 AN OPEN ROW THAT LEAVES THE LIST BY NO ACT OF HIS IS CLOSED WITH THE NOTE (the brief's item 4 — the Fable read 3) ----
   A man listed on a squadron's page only because he plans it (ui/userslist-model.ts `planners`) drops off the list when
   that Plan goes — another admin's change, or the signed-in admin's own Undo of giving it. The open row was simply not
   drawn any more while the page went on holding it: the admin's pick in it lost without a word, and a later search drew
   his row OPEN with no press. The orchestrator's call (the reader's fix B): where the open row was on the page at the last
   draw and is not now, and the page's own search, ticks and folds are what they were (so it was not the admin who put it
   away), the row closes with the note. Where the admin himself put it away, it is held and nothing is said (§13). */
describe('§14 — an open row that leaves the list with no act of the admin\'s closes with the note, and never comes back open', () => {
  it('Saber gives Mako Plan of 149, opens his row from the list, then presses Undo (the Fable read 3, re-pointed): Mako leaves the list — the row closes, the note once, and a later search shows his row closed', async () => {
    signInAs('saber')
    await pick('u149')
    expect(pageUnit('own')).toBe('u149')
    const p = panel()
    await p.find('Mako')
    await p.open(PID.mako)
    await p.pickLine('u149', 'plan')
    await p.press('#accEdSave')
    expect(level(ACCT.mako, 'u149'), 'setup: Mako plans 149').toBe('admin')
    await p.find('')
    expect(p.rowOf(PID.mako), 'premise: with no search he is on 149\'s list as a Plan holder').not.toBeNull()
    await p.open(PID.mako)
    expect(p.pressed('u149'), 'premise: his short row is open, Plan showing').toBe('plan')
    vi.mocked(HOOKS.toast).mockClear()
    const u = await act(async () => globalUndo())
    expect(u.ok, 'the Undo went through').toBe(true)
    expect(level(ACCT.mako, 'u149'), 'premise: his Plan is undone').toBeNull()
    expect(pageUnit('own'), 'premise: the page is still 149\'s').toBe('u149')
    expect(p.rowOf(PID.mako), 'he is no longer on 149\'s list').toBeNull()
    expect(p.noEditor(), 'no editor is drawn').toBe(true)
    expect(notesFor('Mako'), 'the note, once').toBe(1)
    await redraw()
    expect(notesFor('Mako'), 'still once after a later draw').toBe(1)
    await p.find('Mako')
    expect(p.rowOf(PID.mako), 'the search finds him').not.toBeNull()
    expect(p.noEditor(), 'his row is closed — never back open with no press').toBe(true)
    expect(notesFor('Mako'), 'and nothing more is said').toBe(1)
  })
  it('the same by another master admin, a pick of the signed-in admin\'s in the row (the Fable read 3, re-pointed): Hunter leaves 149\'s list — the row closes, the note once (his pick was not saved), and a later search shows his row closed', async () => {
    signInAs('saber')
    expect(saveAccess(ACCT.kestrel, { master: true }), 'setup: a second master admin').toBeNull()
    await pick('u149')
    const p = panel()
    expect(p.rowOf(PID.hunter), 'premise: Hunter is on 149\'s list as a Plan holder, no search').not.toBeNull()
    await p.open(PID.hunter)
    await p.pickLine('u149', 'view')
    expect(p.$('.acc-edit')!.getAttribute('data-unsaved'), 'premise: Saber\'s pick is marked not saved').toBe('true')
    vi.mocked(HOOKS.toast).mockClear()
    spy.calls.length = 0
    expect(asOther('kestrel', () => saveAccess(ACCT.hunter, { grants: { u149: 'none' } })), 'setup: the other master admin takes Hunter\'s Plan of 149 away').toBeNull()
    spy.calls.length = 0
    reload()
    await redraw()
    expect(level(ACCT.hunter, 'u149'), 'premise: he holds nothing of 149').toBeNull()
    expect(pageUnit('own'), 'premise: the page is still 149\'s').toBe('u149')
    expect(p.rowOf(PID.hunter), 'he is no longer on 149\'s list').toBeNull()
    expect(p.noEditor(), 'no editor is drawn').toBe(true)
    expect(notesFor(csOf(PID.hunter)), 'the note, once').toBe(1)
    await p.find(csOf(PID.hunter))
    expect(p.rowOf(PID.hunter), 'the search finds him').not.toBeNull()
    expect(p.noEditor(), 'his row is closed — never back open with no press').toBe(true)
    expect(notesFor(csOf(PID.hunter)), 'and nothing more is said').toBe(1)
    expect(spy.calls, 'nothing was sent for him').toEqual([])
    expect(level(ACCT.hunter, 'u149'), 'the pick that was never saved stays unsaved').toBeNull()
  })
  it('every draw run twice (React\'s strict mode): the first case says the note once', async () => {
    signInAs('saber')
    await pick('u149')
    expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } }), 'setup: Saber gives Mako Plan of 149').toBeNull()
    reload()
    const p = panel({ strict: true })
    expect(p.rowOf(PID.mako), 'premise: Mako is on 149\'s list as a Plan holder').not.toBeNull()
    await p.open(PID.mako)
    vi.mocked(HOOKS.toast).mockClear()
    const u = await act(async () => globalUndo())
    expect(u.ok, 'the Undo went through').toBe(true)
    expect(p.noEditor(), 'closed').toBe(true)
    expect(notesFor('Mako'), 'once').toBe(1)
    await redraw()
    expect(notesFor('Mako'), 'and not again').toBe(1)
  })
  it('the same rule for a whole row: Kestrel ticks the Filter\'s Role "Member" and opens Osprey\'s row, a rename typed; another admin makes Osprey an admin, so the tick no longer keeps him: the row closes with the note, once, nothing saved — and with the tick off his row is closed', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.tick('role:member')
    expect(p.rowOf(PID.osprey), 'premise: Osprey, a member, is kept by the tick').not.toBeNull()
    await p.open(PID.osprey)
    await p.type('#accEdName', 'typed@mail')
    vi.mocked(HOOKS.toast).mockClear()
    expect(asOther('saber', () => saveAccess(ACCT.osprey, { role: 'admin' })), 'setup: Saber makes Osprey an admin').toBeNull()
    reload()
    await redraw()
    expect(p.rowOf(PID.osprey), 'premise: the tick no longer keeps him').toBeNull()
    expect(notesFor(csOf(PID.osprey)), 'the note, once').toBe(1)
    await p.press('#accFilterClear')
    expect(p.rowOf(PID.osprey), 'on the list again').not.toBeNull()
    expect(p.noEditor(), 'his row is closed').toBe(true)
    nothingSaved(ACCT.osprey)
  })
  /* WHERE THE ADMIN HIMSELF PUT IT AWAY, TODAY'S BEHAVIOUR STAYS: held, no note. */
  it('pin: the admin\'s own tick puts the open row away (a master admin unticks the Squadron tick that listed Osprey): held, no note — and the tick put back shows it open as he left it', async () => {
    signInAs('saber')
    const p = panel()
    await p.tick('sqn:u149')
    await p.open(PID.osprey)
    expect(p.$('.acc-edit[data-short="1"]'), 'premise: Osprey\'s short row is open on 142\'s grouped list').not.toBeNull()
    vi.mocked(HOOKS.toast).mockClear()
    await p.tick('sqn:u149')
    expect(p.rowOf(PID.osprey), 'premise: with the tick off he is not listed').toBeNull()
    await redraw()
    expect(anyRowNote(), 'his own act: no note').toBe(0)
    await p.tick('sqn:u149')
    expect(p.rowOf(PID.osprey)!.querySelector('.acc-edit[data-short="1"]'), 'held, as before this step').not.toBeNull()
    expect(anyRowNote(), 'no note').toBe(0)
  })
  it('pin: a row\'s own write raises no note — Kestrel finds an archived man by his callsign, renames him with Save name so the search no longer matches: "Renamed", and no "row changed" note', async () => {
    signInAs('kestrel')
    expect(archivePerson(PID.osprey).bad, 'setup: Osprey archived').toBeNull()
    reload()
    const p = panel()
    await p.find(csOf(PID.osprey))
    expect(p.archRowOf(PID.osprey), 'premise: the search opens the Archived fold on him').not.toBeNull()
    await p.openArch(PID.osprey)
    await p.type('#accArCs', 'Zebra')
    vi.mocked(HOOKS.toast).mockClear()
    await p.press('#accArSave')
    expect(csOf(PID.osprey), 'renamed').toBe('Zebra')
    expect(HOOKS.toast).toHaveBeenCalledWith('Renamed Zebra')
    expect(p.archRowOf(PID.osprey), 'premise: the search no longer matches him').toBeNull()
    await redraw()
    expect(anyRowNote(), 'his own write: no note').toBe(0)
  })
})

/* ---- §15 WHAT THE FABLE READ PRESSED ON AND FOUND SOUND, kept so it stays so (its proof 0 of the second round's read;
   its four whole-app tests are in §12 above) ---- */
describe('§15 — pins: no press opens the whole row for another squadron\'s man', () => {
  it('pin: a closed row still DRAWN whole (his move landed, nothing redrew) and then pressed: it opens short — one line, the page\'s — never the whole editor', async () => {
    signInAs('saber')
    expect(moveMan(PID.osprey, 'u142')).toMatchObject({ ok: true })
    signInAs('kestrel')
    const p = panel()
    await p.find(csOf(PID.osprey))
    expect(p.$(`[data-testid="dot-signin-${PID.osprey}"]`), 'premise: today his row is whole (dots drawn)').not.toBeNull()
    on(16); reload()
    expect(p.$(`[data-testid="dot-signin-${PID.osprey}"]`), 'premise: nothing redrew — his closed row still reads whole').not.toBeNull()
    await p.open(PID.osprey)
    expect(WHOLE.filter(id => p.$(id)), 'none of the whole row').toEqual([])
    expect(p.$('.acc-edit[data-short="1"]'), 'the short row').not.toBeNull()
    expect(p.lineUnits(), 'one line, 149\'s').toEqual(['u149'])
    expect(p.$(`[data-testid="dot-signin-${PID.osprey}"]`), 'and his closed-row dots are gone with the draw').toBeNull()
    expect(anyRowNote(), 'no note: a press opened it as it stands').toBe(0)
  })
  it('pin: a bell line\'s landing ring on another squadron\'s man opens nothing', async () => {
    signInAs('kestrel')
    const p = panel({ ring: { seq: 1, pid: PID.ranger, on: true } })
    expect(p.noEditor(), 'no editor').toBe(true)
    await p.find(csOf(PID.ranger))
    expect(p.rowOf(PID.ranger)!.classList.contains('acc-ring'), 'ringed').toBe(true)
    expect(p.noEditor(), 'still no editor').toBe(true)
    expect(p.rowOf(PID.ranger)!.querySelector('.acc-main b'), 'and the ringed row is the short one — no sign-in name').toBeNull()
  })
  it('pin: one stale row left for another — Osprey\'s whole row open, his move lands unseen, Kestrel presses Ranger\'s row: Osprey\'s row goes with no note (his own act), Ranger\'s opens short', async () => {
    signInAs('saber')
    expect(moveMan(PID.osprey, 'u142')).toMatchObject({ ok: true })
    signInAs('kestrel')
    const p = panel()
    await p.find('r')   // both Osprey and Ranger carry an r
    expect(p.rowOf(PID.osprey), 'premise: Osprey listed').not.toBeNull()
    expect(p.rowOf(PID.ranger), 'premise: Ranger found').not.toBeNull()
    await p.open(PID.osprey)
    expect(p.$('#accEdName'), 'premise: Osprey whole').not.toBeNull()
    vi.mocked(HOOKS.toast).mockClear()
    on(16); reload()
    await p.open(PID.ranger)
    expect(WHOLE.filter(id => p.$(id)), 'no whole row anywhere').toEqual([])
    expect(p.$$('.acc-edit').length, 'one editor').toBe(1)
    expect(p.$('.acc-edit[data-short="1"]')?.closest('.acc-row')?.getAttribute('data-person'), 'Ranger\'s short row').toBe(PID.ranger)
    expect(anyRowNote(), 'no note').toBe(0)
  })
})

describe('§15 — pins: the short row sends one line, and the door still decides', () => {
  it('pin: a master admin\'s short row (Kestrel opens Saber\'s): "Full access", and Save sends nothing, says nothing, closes', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.find(csOf(PID.saber))
    await p.open(PID.saber)
    expect(p.$('.acc-edit[data-short="1"] .acc-sq-home')?.textContent).toBe('Full access')
    expect(p.$$('.acc-edit button').map(b => b.textContent)).toEqual(['Save', 'Cancel'])
    spy.calls.length = 0
    vi.mocked(HOOKS.toast).mockClear()
    await p.press('#accEdSave')
    expect(spy.calls, 'nothing sent').toEqual([])
    expect(HOOKS.toast, 'nothing said').not.toHaveBeenCalled()
    expect(p.noEditor(), 'closed').toBe(true)
  })
  it('pin: a pick the line no longer allows — Kestrel picks View for Mako; a master admin gives Mako Plan of 149; Kestrel\'s Save is refused by the door in its own words: Mako keeps Plan, the row stays open', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.find('Mako')
    await p.open(PID.mako)
    await p.pickLine('u149', 'view')
    expect(asOther('saber', () => saveAccess(ACCT.mako, { grants: { u149: 'plan' } })), 'setup: Saber gives Mako Plan of 149').toBeNull()
    reload()
    await redraw()
    expect(level(ACCT.mako, 'u149'), 'premise: he plans 149 now').toBe('admin')
    spy.calls.length = 0
    vi.mocked(HOOKS.toast).mockClear()
    await p.press('#accEdSave')
    expect(spy.calls, 'one call: 149\'s line alone').toEqual([[ACCT.mako, { grants: { u149: 'view' } }]])
    expect(level(ACCT.mako, 'u149'), 'the door refused: he still plans 149').toBe('admin')
    expect(vi.mocked(HOOKS.toast).mock.calls[0]?.[1], 'said as a refusal').toBe('warn')
    expect(p.$('.acc-edit[data-short="1"]'), 'the row stays open').not.toBeNull()
    expect(anyRowNote(), 'not the row-changed note').toBe(0)
  })
  it('pin: a sign-in given under an open "No sign-in" short row — the row follows: the one line with Save; View picked and saved is one call, 149\'s line alone, on his new account', async () => {
    signInAs('kestrel')
    const pid = noSignIn('u142')
    const p = panel()
    await p.find(csOf(pid))
    await p.open(pid)
    expect(p.$$('.acc-edit button').map(b => b.textContent), 'premise: Cancel alone').toEqual(['Cancel'])
    expect(asOther('hunter', () => addAccount('fresh.signin@mail', pid, 'main')), 'setup: 142\'s admin gives him a sign-in').toBeNull()
    reload()
    await redraw()
    expect(p.$('#accEdNoSignIn'), 'the words are gone').toBeNull()
    expect(p.lineUnits(), 'one line, 149\'s').toEqual(['u149'])
    expect(p.html().includes('fresh.signin'), 'his sign-in name nowhere on 149\'s page').toBe(false)
    await p.pickLine('u149', 'view')
    spy.calls.length = 0
    await p.press('#accEdSave')
    const acct = accountOfPid(pid)!
    expect(spy.calls).toEqual([[acct.id, { grants: { u149: 'view' } }]])
    expect(level(acct.id, 'u149')).toBe('view')
    expect(accountById(acct.id)!.name, 'his sign-in name untouched').toBe('fresh.signin@mail')
  })
  it('pin: his sign-in moved to another man under his open short row, a pick made — the row falls back to the words and Cancel alone: nothing can be sent for him or for the other man', async () => {
    signInAs('kestrel')
    const other = noSignIn('u142')
    const p = panel()
    await p.find(csOf(PID.ranger))
    await p.open(PID.ranger)
    await p.pickLine('u149', 'none')
    /* (a master admin: the sign-in holds rights in 149 and 150, so only he may put it on another man) */
    expect(asOther('saber', () => updateAccount(ACCT.ranger, { pid: other })), 'setup: the master admin puts Ranger\'s sign-in on another 142 man').toBeNull()
    reload()
    await redraw()
    expect(p.$('#accEdNoSignIn')?.textContent).toBe('No sign-in. Ask 142\'s admin to give him one first.')
    expect(p.$('#accEdSave'), 'no Save').toBeNull()
    expect(anyRowNote()).toBe(0)
  })
  it('pin: a master admin on 149\'s page gives Mako (150\'s admin) Plan of 149 from his short row: one call, 149\'s line alone', async () => {
    signInAs('saber')
    await pick('u149')
    const p = panel()
    await p.find('Mako')
    await p.open(PID.mako)
    expect(p.lineUnits()).toEqual(['u149'])
    await p.pickLine('u149', 'plan')
    spy.calls.length = 0
    await p.press('#accEdSave')
    expect(spy.calls).toEqual([[ACCT.mako, { grants: { u149: 'plan' } }]])
    expect(level(ACCT.mako, 'u149')).toBe('admin')
    expect(level(ACCT.mako, 'u142'), 'nothing of any other squadron').toBeNull()
  })
})

describe('§15 — pins: the note, once', () => {
  it('pin: strict mode (every draw twice) — the short row\'s Save pressed after his move landed unseen: nothing sent, the note once', async () => {
    signInAs('saber')
    expect(moveMan(PID.ranger, 'u149')).toMatchObject({ ok: true })
    signInAs('kestrel')
    const p = panel({ strict: true })
    await p.find(csOf(PID.ranger))
    await p.open(PID.ranger)
    await p.pickLine('u149', 'none')
    vi.mocked(HOOKS.toast).mockClear()
    on(16); reload()
    spy.calls.length = 0
    await p.press('#accEdSave')
    expect(spy.calls).toEqual([])
    expect(p.noEditor()).toBe(true)
    expect(notesFor(csOf(PID.ranger))).toBe(1)
    await redraw()
    expect(notesFor(csOf(PID.ranger)), 'and not again').toBe(1)
  })
  it('pin: a key in the search box (a draw of the page, not of the row) after his move landed unseen — the row was on the page until that key: it closes, the note once', async () => {
    signInAs('saber')
    expect(moveMan(PID.ranger, 'u149')).toMatchObject({ ok: true })
    signInAs('kestrel')
    const p = panel()
    await p.find(csOf(PID.ranger))
    await p.open(PID.ranger)
    vi.mocked(HOOKS.toast).mockClear()
    on(16); reload()
    await p.find(csOf(PID.ranger).slice(0, 3))
    expect(p.noEditor()).toBe(true)
    expect(notesFor(csOf(PID.ranger))).toBe(1)
  })
  it('pin: the signed-in master admin\'s mark taken off while 149 is picked and a row is open — the app puts him home, the row closes, the note once', async () => {
    signInAs('saber')
    expect(saveAccess(ACCT.kestrel, { master: true }), 'setup: a second master admin').toBeNull()
    await pick('u149')
    const p = panel()
    await p.find(csOf(PID.osprey))
    await p.open(PID.osprey)
    await p.type('#accEdName', 'typed@mail')
    vi.mocked(HOOKS.toast).mockClear()
    expect(asOther('kestrel', () => saveAccess(ACCT.saber, { master: false })), 'setup: Kestrel takes Saber\'s mark off').toBeNull()
    reload()
    await redraw()
    expect(pageUnit('own')).toBe('u142')
    expect(p.noEditor()).toBe(true)
    expect(notesFor(csOf(PID.osprey))).toBe(1)
  })
})
