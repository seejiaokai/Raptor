// @vitest-environment jsdom
/* ADMIN → USERS ACROSS SQUADRONS — STEP U1'S EIGHTH ROUND: ONE RECORD OF OPEN WORK, ONE JUDGE (the plan
   docs/superpowers/plans/2026-11-27-msq-s2-open-work-judge.md, parts A and B; the earlier rounds' tests are
   msq-s2-rejudge.test.tsx to msq-s2-rejudge7.test.tsx).
   Every read since round 4 found one person losing typed work, or having it rewritten, because each kind of typed work
   kept its own record of what it was started on and each path GUESSED: "untouched" from equal values, "his own pick" from
   a flag left over from an earlier pick. The reshape holds one record of every piece of open work — what it was started
   on, a copy of the stored facts it shows (never a value made from the clock) and what he typed, each field with its own
   "he set this" mark — and judges every entry by one rule, on every draw, before every press and as the page goes.
   The readers' proofs (fixread7) are kept here as lasting tests, written before the app changed and each run on the code
   as it stood; a test named "pin:" holds what is built today and must go on holding.
   §43 THE DATE HE SET IS HIS — every pick in the real calendar marks it, even a pick of the day already shown, and the mark
       stays; a box he never set shows today live, and a press on a box showing a day gone by sends nothing;
   §44 GIVE ACCESS AS THE APP TAKES THE ADMIN PAGE AWAY — a changed form says the note once;
   §45 GIVE ACCESS PUT AWAY — no note for a form not on his screen;
   §46 THE LANDING BRINGS THE OPEN MAN INTO VIEW, AND CLOSES ONLY WHAT IT SHOULD;
   §47 NO WORK OUTLIVES A CHANGE OF THE SQUADRON IN VIEW;
   §48 PINS — his question C as built until he answers;
   §49 THE ONE JUDGE — two notes said together, Give access's copy (never what an unrelated reload rebuilds), the mode it
       opened on, a request already gone at the press, a lapsed session.
   The world: three squadrons (withThird — his D2630), Wed 15 Jul 26, 09:00. Hunter — 142's admin, Plan of 149, View of
   150; Saber — master admin, home 142; Ranger — 142's member, View of 149 and of 150; Kestrel — 149's admin; Osprey —
   149's member; Mako — 150's own admin. */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { StrictMode, useState } from 'react'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { withThird, third, signInAs, PID, ACCT, SIGN, moveMan, on, pastMidnight } from '../test-support/msq-world'
import { UsersPanel } from './UsersPanel'
import { App } from './App'
import { useVersion } from './useStore'
import { openAdminUsers } from './adminopen'
import { changedWhileOpenWords } from './useraccess-model'
import {
  accountByName, accountOfPid, accountsLoad, requestAccess, requestByName, saveAccess, sessionFor, signIn, updateAccount,
  declineRequest,
} from '../state/accounts'
import { SESSION, ME, setSession, setMe } from '../state/auth'
import { unitsLoad, todayIso, homeOn } from '../state/units'
import { pickSquadron } from '../state/pick'
import { pageUnit } from '../state/perms'
import { PEOPLE, nameToId } from '../engine/people'
import { rosterOf } from '../engine/roster'
import { HOOKS } from '../engine/hooks'
import { notify } from '../state/store'
import { CURPAGE, setPage } from '../state/view'
import { globalUndo } from '../undo/timeline'
import { archivePerson } from '../leavewar/sync'
import { toast as realToast, toastBatch } from './toast'
import { workOn } from './guard'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

/* A SPY ON THE DOORS THE OPEN WORK SENDS THROUGH (as msq-s2-rejudge6.test.tsx): every call of the two approval doors and
   the two restore doors is recorded, under its name, and passed to the real door */
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
vi.mock('../state/accounts', async importOriginal => spy.on(await importOriginal<Record<string, unknown>>(), ['approveRequest', 'approveRequestNew'], spy.calls))
vi.mock('../leavewar/sync', async importOriginal => spy.on(await importOriginal<Record<string, unknown>>(), ['restoreArchivedPerson', 'restoreArchivedAs'], spy.calls))
const sent = (door: string) => spy.calls.filter(c => c[0] === door)

withThird()
let appPage: ReturnType<typeof render> | null = null
afterEach(() => {
  if (appPage) { appPage.unmount(); appPage = null }
  cleanup()
  spy.calls.length = 0
})

const reload = () => { unitsLoad(); accountsLoad() }
const P = (pid: string): any => (PEOPLE as any)[pid]
const csOf = (pid: string) => String(P(pid).cs)
/* the passing note of his D2730 Q13 — the app's own words */
const notesFor = (cs: string) => vi.mocked(HOOKS.toast).mock.calls.filter(c => c[0] === changedWhileOpenWords(cs)).length
const anyRowNote = () => vi.mocked(HOOKS.toast).mock.calls.filter(c => String(c[0]).includes('row changed')).length
const said = () => vi.mocked(HOOKS.toast).mock.calls.map(c => String(c[0]))
/* another admin's change, landing under the signed-in person: the write made through the real door as `who`, the
   signed-in person's own session put back after it */
function asOther<T>(who: keyof typeof SIGN, fn: () => T): T {
  const s0 = SESSION, me0 = ME
  const s1 = sessionFor(signIn(SIGN[who][0], SIGN[who][1]) as any)
  setSession(s1); setMe(s1.pid)
  try { return fn() } finally { setSession(s0); setMe(me0) }
}
/* a man on a squadron's roster with no sign-in */
const noSignIn = (unit: string): string => {
  const pid = rosterOf(unit, todayIso()).find(id => { const x = P(id); return x && !x.special && !x.archived && !x.deleted && !accountOfPid(id) })
  if (!pid) throw new Error(`the world has no ${unit} man without a sign-in`)
  return pid
}
const ask = (name: string, cs: string, unit: string) => {
  signInAs(name)
  expect(requestAccess({ cs, ini: 'NF', seat: 'FCP', cat: 'C' }, unit), `setup: ${cs} asks to join ${unit}`).toBeNull()
}

/* ---- the list drawn alone (it redraws on the store's version, as the Admin page does around it); `shown` and a bell's
   landing handed down as the Admin page hands them ---- */
type Ring = { seq: number; pid: string; on: boolean } | null
let setShown: (v: boolean) => void = () => {}
let setRing: (r: Ring) => void = () => {}
function Live() {
  useVersion()
  const [s, set] = useState(true); setShown = set
  const [ring, putRing] = useState<Ring>(null); setRing = putRing
  return <UsersPanel shown={s} ring={ring} />
}
function panel(o: { strict?: boolean } = {}) {
  const page = render(o.strict ? <StrictMode><Live /></StrictMode> : <Live />)
  const $ = (sel: string) => page.container.querySelector(sel) as HTMLElement | null
  const $$ = (sel: string) => Array.from(page.container.querySelectorAll(sel)) as HTMLElement[]
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
  /* a day pressed in the real calendar of a date box (its own id) — never the value set by hand */
  const pickIn = async (box: string, iso: string) => {
    await press(box)
    const day = document.querySelector<HTMLElement>(`.dcal-layer [data-iso="${iso}"]`)
    expect(day, `the calendar's day ${iso}`).not.toBeNull()
    await act(async () => { fireEvent.click(day!) })
  }
  const pickDate = (iso: string) => pickIn('#accArPostIn', iso)
  const dateOf = (box: string) => $(box)?.getAttribute('data-value') ?? null
  const postIn = () => dateOf('#accArPostIn')
  const box = () => ($('#accArCs') as HTMLInputElement | null)?.value ?? null
  return { $, $$, rowOf, archRowOf, press, type, open, openArch, find, tick, pickIn, pickDate, dateOf, postIn, box }
}
const redraw = async () => { await act(async () => { notify() }) }
const pick = async (u: string) => { await act(async () => { await pickSquadron(u) }) }

/* ---- the whole app ---- */
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const settle = async () => { await act(async () => { await Promise.resolve(); await Promise.resolve() }) }
async function appOnAdmin(who: keyof typeof SIGN, o: { strict?: boolean; pick?: string } = {}) {
  signInAs(who)
  vi.spyOn(HOOKS, 'isPhone').mockReturnValue(false)
  appPage = render(o.strict ? <StrictMode><App /></StrictMode> : <App />)
  await settle()
  if (o.pick) await act(async () => { await pickSquadron(o.pick!) })
  await act(async () => { setPage('admin'); notify() })
  await settle()
  expect(CURPAGE, 'premise: the app is on the Admin page').toBe('admin')
}

/* ---- §43 THE DATE HE SET IS HIS ----
   The archived row's and Give access's Post in boxes: every selection in the real calendar marks the date as his — even
   the day already shown — and only Cancel, his own finishing press or a close clears the mark. A box he never set shows
   today live, and the day each press sends is the day its own draw showed; a press on a box that shows a day gone by,
   with nothing redrawn, sends nothing and says the note. */
describe('§43 — the date he set is his', () => {
  const kestrelOpensOspreysArchivedRow = async () => {
    signInAs('kestrel')
    expect(archivePerson(PID.osprey).bad, 'setup: Kestrel archives Osprey').toBeFalsy()
    reload()
    const p = panel()
    await p.openArch(PID.osprey)
    expect(p.postIn(), 'premise: the box opens on today').toBe('2026-07-15')
    return p
  }
  const restoredOn = () => sent('restoreArchivedPerson').map(c => c[2]).concat(sent('restoreArchivedAs').map(c => c[3]))
  it('Kestrel picks 17 Jul, midnight passes (a draw), on 16 Jul he picks 15 Jul: the box keeps 15 Jul after a draw, and Restore posts him in on 15 Jul (opus1-7 proof 1; security-7 proof 4)', async () => {
    const p = await kestrelOpensOspreysArchivedRow()
    await p.pickDate('2026-07-17')
    on(16); reload()
    await redraw()
    expect(p.postIn(), 'premise: his 17 Jul kept across midnight').toBe('2026-07-17')
    vi.mocked(HOOKS.toast).mockClear()
    await p.pickDate('2026-07-15')
    await redraw()
    expect({ postIn: p.postIn(), counted: workOn('archrow'), notes: anyRowNote() }).toEqual({ postIn: '2026-07-15', counted: true, notes: 0 })
    spy.calls.length = 0
    await p.press('#accArRestore')
    expect({ restoredOn: restoredOn(), archived: !!P(PID.osprey).archived }).toEqual({ restoredOn: ['2026-07-15'], archived: false })
  })
  it('pin: the control — the row opened afresh on 16 Jul, 15 Jul picked: the box keeps it and Restore posts him in on 15 Jul', async () => {
    signInAs('kestrel')
    expect(archivePerson(PID.osprey).bad).toBeFalsy()
    on(16); reload()
    const p = panel()
    await p.openArch(PID.osprey)
    await p.pickDate('2026-07-15')
    expect(p.postIn()).toBe('2026-07-15')
    spy.calls.length = 0
    await p.press('#accArRestore')
    expect(restoredOn()).toEqual(['2026-07-15'])
  })
  it('opened 15 Jul, he picks 16 Jul; next day he picks 15 Jul — the box keeps 15 Jul after a draw, counted (opus2-7 proof 1)', async () => {
    const p = await kestrelOpensOspreysArchivedRow()
    await p.pickDate('2026-07-16')
    on(16); reload()
    await redraw()
    expect(p.postIn(), 'premise: his pick kept across midnight').toBe('2026-07-16')
    await p.pickDate('2026-07-15')
    await redraw()
    expect({ open: !!p.$('#accArCs'), postIn: p.postIn(), counted: workOn('archrow') }).toEqual({ open: true, postIn: '2026-07-15', counted: true })
  })
  it('the calendar opened on 15 Jul, midnight passes with nothing redrawn, he presses 15 Jul — the day shown: it is his; the next draw keeps 15 Jul, counted, and Restore sends 15 Jul (Astra 1, sequence 1)', async () => {
    const p = await kestrelOpensOspreysArchivedRow()
    await p.press('#accArPostIn')
    on(16); reload()
    const day = document.querySelector<HTMLElement>('.dcal-layer [data-iso="2026-07-15"]')
    expect(day, 'premise: the calendar still up, nothing redrawn').not.toBeNull()
    await act(async () => { fireEvent.click(day!) })
    await redraw()
    expect({ postIn: p.postIn(), counted: workOn('archrow'), notes: anyRowNote() }).toEqual({ postIn: '2026-07-15', counted: true, notes: 0 })
    spy.calls.length = 0
    await p.press('#accArRestore')
    expect(restoredOn()).toEqual(['2026-07-15'])
  })
  it('he picks 17 Jul on the 15th; on the 17th he presses 17 Jul again: still his — across the next midnight the box keeps 17 Jul, counted, and Restore sends 17 Jul (Astra 1, sequence 2)', async () => {
    const p = await kestrelOpensOspreysArchivedRow()
    await p.pickDate('2026-07-17')
    on(17); reload()
    await redraw()
    await p.pickDate('2026-07-17')
    on(18); reload()
    await redraw()
    expect({ postIn: p.postIn(), counted: workOn('archrow'), notes: anyRowNote() }).toEqual({ postIn: '2026-07-17', counted: true, notes: 0 })
    spy.calls.length = 0
    await p.press('#accArRestore')
    expect(restoredOn()).toEqual(['2026-07-17'])
  })
  it('on 15 Jul he types a callsign, picks 18 Jul, then 15 Jul (today): still his — after midnight and a draw the box keeps 15 Jul, counted, and Restore sends 15 Jul (opus1 F2)', async () => {
    const p = await kestrelOpensOspreysArchivedRow()
    await p.type('#accArCs', 'Typedname')
    await p.pickDate('2026-07-18')
    await p.pickDate('2026-07-15')
    on(16); reload()
    await redraw()
    expect({ box: p.box(), postIn: p.postIn(), counted: workOn('archrow'), notes: anyRowNote() })
      .toEqual({ box: 'Typedname', postIn: '2026-07-15', counted: true, notes: 0 })
    spy.calls.length = 0
    await p.press('#accArRestore')
    expect(restoredOn()).toEqual(['2026-07-15'])
  })

  /* Give access → New person: a stranger with a callsign nobody holds asks to join 149; Kestrel opens the form */
  const kestrelOpensNewPerson = async () => {
    ask('newface@mail', 'Newface', 'u149')
    signInAs('kestrel')
    const p = panel()
    await p.press('[data-approve]')
    expect(p.$('#apvPostIn'), 'premise: the New person form, with its Post in box').not.toBeNull()
    expect(p.dateOf('#apvPostIn'), 'premise: it opens on today').toBe('2026-07-15')
    return p
  }
  const postedInOn = () => sent('approveRequestNew').map(c => c[4])
  it('Give access, New person: the Post in box he never touched reads the new day after a draw past midnight, and Add person and give access posts him in on it', async () => {
    const p = await kestrelOpensNewPerson()
    on(16); reload()
    await redraw()
    expect(p.dateOf('#apvPostIn'), 'the box he never touched shows today').toBe('2026-07-16')
    spy.calls.length = 0
    await p.press('#apvGo')
    expect(postedInOn(), 'sent the day the box showed').toEqual(['2026-07-16'])
  })
  it('Give access, New person: a press past midnight with nothing redrawn on that box sends nothing, the note once naming the request', async () => {
    const p = await kestrelOpensNewPerson()
    vi.mocked(HOOKS.toast).mockClear()
    spy.calls.length = 0
    on(16); reload()
    expect(p.dateOf('#apvPostIn'), 'premise: nothing redrawn — the box still shows yesterday').toBe('2026-07-15')
    await p.press('#apvGo')
    expect({ sent: sent('approveRequestNew').length, note: notesFor('Newface'), any: anyRowNote(), form: !!p.$('[data-approving]') })
      .toEqual({ sent: 0, note: 1, any: 1, form: false })
    expect(requestByName('newface@mail'), 'the request still waits').toBeTruthy()
  })
  it('Give access, New person: a Post in he picked — the day shown, pressed in the real calendar — counts, is kept across midnight and is sent as picked', async () => {
    const p = await kestrelOpensNewPerson()
    expect(workOn('giveaccess'), 'premise: unchanged, not counted').toBe(false)
    await p.pickIn('#apvPostIn', '2026-07-15')
    expect(workOn('giveaccess'), 'his pick counts').toBe(true)
    on(16); reload()
    await redraw()
    expect(p.dateOf('#apvPostIn'), 'kept across midnight').toBe('2026-07-15')
    spy.calls.length = 0
    await p.press('#apvGo')
    expect(postedInOn(), 'sent as picked').toEqual(['2026-07-15'])
  })
})

/* ---- §44 GIVE ACCESS AS THE APP TAKES THE ADMIN PAGE AWAY (Astra-7 proof 1) ----
   Hunter on 149 by his Plan, Give access open; Saber lowers his Plan of 149 to View: his own pages go home, the app lands
   him on 149's View-only Sched, and Users is taken off the page before it draws again. A changed form says the note
   once, as an open row does; an unchanged one goes without a word. The whole app, every draw run twice. */
describe('§44 — Give access as the app takes the Admin page away', () => {
  it.each([false, true])('changed: %s — the note once only for a changed form, naming the request, and not again on a later draw', async changed => {
    ask('newface@mail', 'Newface', 'u149')
    const requestId = requestByName('newface@mail')!.id
    await appOnAdmin('hunter', { strict: true, pick: 'u149' })
    expect(pageUnit('own'), 'premise: 149\'s page by his Plan').toBe('u149')
    await act(async () => { fireEvent.click($(`[data-approve="${requestId}"]`)!) })
    if (changed) {
      await act(async () => { fireEvent.change($('#apvCs')!, { target: { value: 'Draftname' } }) })
      await act(async () => { fireEvent.change($('#apvRole')!, { target: { value: 'admin' } }) })
    }
    expect(workOn('giveaccess'), 'premise: counted only if changed').toBe(changed)
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => {
      expect(asOther('saber', () => saveAccess(ACCT.hunter, { grants: { u149: 'view' } }))).toBeNull()
      reload(); notify()
    })
    await settle()
    expect({ page: CURPAGE, form: !!$('[data-approving]'), counted: workOn('giveaccess'), added: !!accountByName('newface@mail') })
      .toEqual({ page: 'viewsched', form: false, counted: false, added: false })
    const expected = changed ? [[changedWhileOpenWords('Newface'), 'warn']] : []
    const rowNotes = () => vi.mocked(HOOKS.toast).mock.calls.filter(c => String(c[0]).includes('row changed')).map(c => [c[0], c[1]])
    expect(rowNotes()).toEqual(expected)
    await act(async () => { notify() })
    await settle()
    expect(rowNotes(), 'not again').toEqual(expected)
  })
})

/* ---- §45 GIVE ACCESS PUT AWAY (opus1-7 proof 5) ----
   A changed Give access he had put out of sight — another Admin card shown — goes without a word when his own move at
   midnight throws it away, as an open row he had put away does. Its control (on screen: the note once) is
   msq-s2-rejudge7.test.tsx §42's. */
describe('§45 — Give access put away', () => {
  it('Saber leaves Users with Give access changed; his move lands at midnight: no note for what was not on his screen', async () => {
    signInAs('saber')
    expect(saveAccess(ACCT.kestrel, { master: true })).toBeNull()
    signInAs('kestrel')
    expect(moveMan(PID.saber, third.u150)).toMatchObject({ ok: true })
    ask('newface@mail', 'Newface', 'u142')
    signInAs('saber')
    const p = panel()
    await p.press('[data-approve]')
    await act(async () => { fireEvent.change(p.$('#apvRole')!, { target: { value: 'admin' } }) })
    await act(async () => { setShown(false) })
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => { pastMidnight() })
    expect(pageUnit('own'), 'premise: the app took his page to 150').toBe(third.u150)
    expect({ form: !!p.$('[data-approving]'), counted: workOn('giveaccess'), notes: anyRowNote() }).toEqual({ form: false, counted: false, notes: 0 })
  })
})

/* ---- §46 THE LANDING BRINGS THE OPEN MAN INTO VIEW, AND CLOSES ONLY WHAT IT SHOULD ----
   A bell landing on the man whose row is open: listed with the search empty → the search cleared; found by the search as
   it stands → kept; otherwise the search reads his callsign, so it finds him. A landing for another man closes the open
   row as his own act, silently, and leaves Give access as it is. A Filter tick is never touched. */
describe('§46 — the landing on the open man, and on another', () => {
  it.each([false, true])('the bell brings the same open foreign row back after his own search hid it — ringed, his pick there, counted, no note (strict mode: %s; Astra-7 proof 2)', async strict => {
    signInAs('saber')
    expect(moveMan(PID.osprey, 'u142')).toMatchObject({ ok: true })
    on(16); reload()
    expect(homeOn(PID.osprey, todayIso()), 'premise: Osprey is 142\'s now').toBe('u142')
    await appOnAdmin('kestrel', { strict })
    expect(pageUnit('own')).toBe('u149')
    await act(async () => { fireEvent.change($('#accFind')!, { target: { value: 'Osprey' } }) })
    const row = () => $(`#page-admin .acc-row[data-person="${PID.osprey}"]`)
    const editor = () => row()?.querySelector<HTMLElement>('.acc-edit[data-short="1"]') ?? null
    const picked = () => row()?.querySelector('[data-testid="acc-sq"] .acc-sq-n[data-unit="u149"]')?.nextElementSibling
      ?.querySelector('[aria-pressed="true"]')?.getAttribute('data-line') ?? null
    await act(async () => { fireEvent.click(row()!.querySelector('.acc-tap')!) })
    const n = row()!.querySelector('[data-testid="acc-sq"] .acc-sq-n[data-unit="u149"]')!
    await act(async () => { fireEvent.click(n.nextElementSibling!.querySelector<HTMLElement>('[data-line="view"]')!) })
    expect(picked(), 'premise: View picked').toBe('view')
    await act(async () => { fireEvent.change($('#accFind')!, { target: { value: '' } }) })
    expect(row(), 'premise: his own search put the row away').toBeNull()
    expect(workOn('userrow'), 'premise: still held and counted').toBe(true)
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => { openAdminUsers({ person: PID.osprey }) })
    await settle()
    expect({
      rowOnPage: !!row(), ringed: row()?.classList.contains('acc-ring') ?? false, editorOnPage: !!editor(), picked: picked(),
      unsaved: editor()?.getAttribute('data-unsaved') ?? null, counted: workOn('userrow'), notes: anyRowNote(),
    }).toEqual({ rowOnPage: true, ringed: true, editorOnPage: true, picked: 'view', unsaved: 'true', counted: true, notes: 0 })
  })
  it('Kestrel finds Ranger, picks None, then searches "Osprey" (Ranger put away); a bell landing for Ranger brings his row into view, open, no note (opus2-7 proof 2)', async () => {
    await appOnAdmin('kestrel')
    await act(async () => { fireEvent.change($('#accFind')!, { target: { value: csOf(PID.ranger) } }) })
    await act(async () => { fireEvent.click($(`[data-testid="acc-groups"] .acc-row[data-person="${PID.ranger}"] .acc-tap`)!) })
    const n = $('[data-testid="acc-sq"] .acc-sq-n[data-unit="u149"]')!
    await act(async () => { fireEvent.click((n.nextElementSibling as HTMLElement).querySelector('[data-line="none"]')!) })
    expect($('.acc-edit')?.getAttribute('data-unsaved'), 'premise: his pick, not saved').toBe('true')
    await act(async () => { fireEvent.change($('#accFind')!, { target: { value: 'Osprey' } }) })
    expect($(`#page-admin .acc-row[data-person="${PID.ranger}"]`), 'premise: Ranger put away by his own search').toBeNull()
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => { openAdminUsers({ person: PID.ranger }) })
    await settle()
    const rowOnPage = !!$(`#page-admin .acc-row[data-person="${PID.ranger}"]`)
    expect({ rowOnPage, editorOnPage: !!$('#page-admin .acc-edit'), heldUnseen: !rowOnPage && workOn('userrow'), notes: anyRowNote() })
      .toEqual({ rowOnPage: true, editorOnPage: true, heldUnseen: false, notes: 0 })
  })
  it.each([false, true])('Ranger\'s row changed and an unchanged Give access open while another Admin card shows; a bell line for Hunter lands on Users: Ranger\'s row is closed, not back open, no note, on that draw and the next; Give access still open as it was (strict mode: %s; opus1 F3)', async strict => {
    ask('newface@mail', 'Newface', 'u142')
    signInAs('saber')
    const p = panel({ strict })
    await p.press('[data-approve]')
    expect(workOn('giveaccess'), 'premise: Give access open, unchanged').toBe(false)
    await p.open(PID.ranger)
    await p.type('#accEdName', 'typed@mail')
    expect(workOn('userrow'), 'premise: Ranger\'s row changed').toBe(true)
    await act(async () => { setShown(false) })
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => { setShown(true); setRing({ seq: 1, pid: PID.hunter, on: true }) })
    const state = () => ({
      rangerOpen: !!p.$(`.acc-row[data-person="${PID.ranger}"] .acc-edit`), userrow: workOn('userrow'), notes: anyRowNote(),
      give: !!p.$('[data-approving]'), giveRole: (p.$('#apvRole') as HTMLSelectElement | null)?.value ?? null,
    })
    expect(state()).toEqual({ rangerOpen: false, userrow: false, notes: 0, give: true, giveRole: 'main' })
    await redraw()
    expect(state(), 'and on the next draw').toEqual({ rangerOpen: false, userrow: false, notes: 0, give: true, giveRole: 'main' })
  })
  it('pin: a Filter tick hides the open man; a landing on him: his row stays held out of sight and counted, no note', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.find(csOf(PID.osprey))
    await p.open(PID.osprey)
    await p.type('#accEdName', 'typed@mail')
    await p.find('')
    await p.tick('role:admin')
    expect(p.rowOf(PID.osprey), 'premise: the tick hides him').toBeNull()
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => { setRing({ seq: 1, pid: PID.osprey, on: true }) })
    expect({ row: !!p.rowOf(PID.osprey), counted: workOn('userrow'), notes: anyRowNote() }).toEqual({ row: false, counted: true, notes: 0 })
  })
})

/* ---- §47 NO WORK OUTLIVES A CHANGE OF THE SQUADRON IN VIEW ----
   Every open entry closes at any change of the squadron in view — silently where his own pick or bell tap made it. In
   the app such a pick (one he only views) takes the Admin page away already (msq-s2-rejudge3.test.tsx §12); only the list
   drawn alone sees it. opus2-7 proof 3's three main tests are not kept: their premise — the form surviving a pick of a
   squadron he only views — cannot arise any more. Its control is kept, through the whole app. */
describe('§47 — no work outlives a change of the squadron in view', () => {
  it('Hunter (View of 150) picks 150 with an unchanged Give access open on 142\'s page: the form is gone, nothing said, nothing counted', async () => {
    ask('newface@mail', 'Newface', 'u142')
    signInAs('hunter')
    const p = panel()
    await p.press('[data-approve]')
    vi.mocked(HOOKS.toast).mockClear()
    await pick(third.u150)
    expect({ own: pageUnit('own'), sched: pageUnit('schedule') }, 'premise: 150 in view, his own pages still 142\'s').toEqual({ own: 'u142', sched: third.u150 })
    expect({ form: !!p.$('[data-approving]'), counted: workOn('giveaccess'), said: said() }).toEqual({ form: false, counted: false, said: [] })
  })
  it('the same with Ranger\'s untouched row open: the row is gone, nothing said, nothing counted', async () => {
    signInAs('hunter')
    const p = panel()
    await p.open(PID.ranger)
    expect(p.$('.acc-edit'), 'premise: his row open').not.toBeNull()
    vi.mocked(HOOKS.toast).mockClear()
    await pick(third.u150)
    expect({ own: pageUnit('own'), sched: pageUnit('schedule') }).toEqual({ own: 'u142', sched: third.u150 })
    expect({ row: !!p.$('.acc-edit'), counted: workOn('userrow'), said: said() }).toEqual({ row: false, counted: false, said: [] })
  })
  it('the control, through the whole app: Give access opened and changed on 142, no pick; Ranger renamed to the asker on his row: the note once', async () => {
    ask('newface@mail', 'Newface', 'u142')
    await appOnAdmin('hunter')
    await act(async () => { fireEvent.click($('[data-approve]')!) })
    await act(async () => { fireEvent.change($('#apvRole')!, { target: { value: 'admin' } }) })
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => { fireEvent.click($(`[data-testid="acc-groups"] .acc-row[data-person="${PID.ranger}"] .acc-tap`)!) })
    await act(async () => { fireEvent.change($('#accEdName')!, { target: { value: 'newface@mail' } }) })
    await act(async () => { fireEvent.click($('#accEdSave')!) })
    await settle()
    expect({ req: !!$('[data-req]'), note: notesFor('Newface'), any: anyRowNote() }).toEqual({ req: false, note: 1, any: 1 })
  })
})

/* ---- §48 PINS — HIS QUESTION C (question 26), ANSWERED B: KEEP TODAY'S (his D2821, 27 Nov 26; opus1-7 proof 4) ----
   One press on another request's Give access, or another man's row, replaces what the slot holds without a word. Within
   one squadron nothing on Admin → Users is refused over unsaved typing: the second opens and the first one's typing is
   dropped with no note — his ruling, not a gap (a same-squadron bell line the same: rejudge4 §22). */
describe('§48 — pins: one press on another form or row replaces the open one, nothing said (his D2821)', () => {
  it('pin (his D2821): Give access pressed for another request replaces the open one, nothing said', async () => {
    ask('newface@mail', 'Newface', 'u149')
    ask('other@mail', 'Otherguy', 'u149')
    signInAs('kestrel')
    const p = panel()
    await act(async () => { fireEvent.click(p.$$('[data-approve]')[0]!) })
    await act(async () => { fireEvent.change(p.$('#apvRole')!, { target: { value: 'admin' } }) })
    expect(workOn('giveaccess'), 'premise: counted').toBe(true)
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => { fireEvent.click(p.$$('[data-approve]')[0]!) })
    expect({ secondOpen: !!p.$('[data-approving]'), roleNow: (p.$('#apvRole') as HTMLSelectElement).value, said: said().length })
      .toEqual({ secondOpen: true, roleNow: 'main', said: 0 })
  })
  it('pin (his D2821): a press on another man\'s row replaces the open row, nothing said', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.open(PID.osprey)
    const nameBox = (p.$('#accEdName') ?? p.$('#accGiveName')) as HTMLInputElement
    await act(async () => { fireEvent.change(nameBox, { target: { value: 'typed@mail' } }) })
    expect(workOn('userrow'), 'premise: counted').toBe(true)
    vi.mocked(HOOKS.toast).mockClear()
    const other = p.$$('[data-testid="acc-groups"] .acc-row')
      .find(r => r.getAttribute('data-person') !== PID.osprey && !(r.querySelector('.acc-tap') as HTMLButtonElement).disabled)!
    await act(async () => { fireEvent.click(other.querySelector('.acc-tap')!) })
    expect({ ospreyOpen: !!p.$(`.acc-row[data-person="${PID.osprey}"] .acc-edit`), counted: workOn('userrow'), said: said().length })
      .toEqual({ ospreyOpen: false, counted: false, said: 0 })
  })
})

/* ---- §49 THE ONE JUDGE ---- */
describe('§49 — two notes at once are said together', () => {
  it('Saber\'s own move lands at midnight with a changed row (Ranger) and a changed Give access (Newface) both on screen, strict mode: the note shown holds both sentences, once each; nothing counted after', async () => {
    signInAs('saber')
    expect(saveAccess(ACCT.kestrel, { master: true })).toBeNull()
    signInAs('kestrel')
    expect(moveMan(PID.saber, third.u150)).toMatchObject({ ok: true })
    ask('newface@mail', 'Newface', 'u142')
    signInAs('saber')
    const p = panel({ strict: true })
    await p.press('[data-approve]')
    await act(async () => { fireEvent.change(p.$('#apvRole')!, { target: { value: 'admin' } }) })
    await p.open(PID.ranger)
    await p.type('#accEdName', 'typed@mail')
    expect({ row: workOn('userrow'), give: workOn('giveaccess') }, 'premise: both counted').toEqual({ row: true, give: true })
    /* the real note display: the app's own toast and its one batch, as main.tsx installs them */
    const realBatch = HOOKS.toastBatch
    vi.mocked(HOOKS.toast).mockImplementation(((m: any, k: any, pt: any) => realToast(m, k, pt)) as any)
    HOOKS.toastBatch = toastBatch as any
    try {
      await act(async () => { pastMidnight() })
    } finally { HOOKS.toastBatch = realBatch }
    expect(pageUnit('own'), 'premise: the app took his page to 150').toBe(third.u150)
    const shown = String(document.getElementById('toastEl')?.textContent ?? '')
    const times = (s: string) => shown.split(s).length - 1
    expect({ ranger: times(changedWhileOpenWords('Ranger')), newface: times(changedWhileOpenWords('Newface')) }).toEqual({ ranger: 1, newface: 1 })
    expect({ row: workOn('userrow'), give: workOn('giveaccess') }).toEqual({ row: false, give: false })
  })
})

describe('§49 — Give access\'s copy: what an unrelated reload rebuilds never closes it', () => {
  it('Kestrel\'s changed Give access survives his own Undo of an unrelated save — the form stays, nothing said, still counted (the request seen by Hunter first, so the rebuilt record holds more than its form shows)', async () => {
    ask('newface@mail', 'Newface', 'u149')
    signInAs('hunter')
    await pick('u149')
    const seen = panel()
    expect(seen.$('[data-approve]'), 'premise: Hunter sees the request on 149\'s page').not.toBeNull()
    cleanup()
    signInAs('kestrel')
    const p = panel()
    await p.press('[data-approve]')
    await act(async () => { fireEvent.change(p.$('#apvRole')!, { target: { value: 'admin' } }) })
    await act(async () => { expect(updateAccount(ACCT.osprey, { name: 'osprey2@mail' }), 'an unrelated save').toBeNull(); notify() })
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => { expect(globalUndo().ok, 'his own Undo of it').toBe(true); notify() })
    expect({ form: !!p.$('[data-approving]'), role: (p.$('#apvRole') as HTMLSelectElement | null)?.value ?? null, counted: workOn('giveaccess'), notes: anyRowNote() })
      .toEqual({ form: true, role: 'admin', counted: true, notes: 0 })
  })
  it('Saber\'s own Undo of his change to Ranger\'s View of 149, Give access changed meanwhile: the form stays, nothing said', async () => {
    ask('newface@mail', 'Newface', 'u142')
    signInAs('saber')
    expect(saveAccess(ACCT.ranger, { grants: { u149: 'none' } }), 'Saber ends Ranger\'s View of 149').toBeNull()
    const p = panel()
    await p.press('[data-approve]')
    await act(async () => { fireEvent.change(p.$('#apvRole')!, { target: { value: 'admin' } }) })
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => { expect(globalUndo().ok, 'his own Undo').toBe(true); notify() })
    expect({ form: !!p.$('[data-approving]'), counted: workOn('giveaccess'), notes: anyRowNote() }).toEqual({ form: true, counted: true, notes: 0 })
  })
})

describe('§49 — Give access keeps the mode it opened on', () => {
  it('opened as New person (nobody matches), switched to On the roster; Newface then added by Add a person with no sign-in: the switch still counts, and a pick of another squadron is refused', async () => {
    ask('newface@mail', 'Newface', 'u142')
    signInAs('saber')
    const p = panel()
    await p.press('[data-approve]')
    expect(p.$('#apvModeNew')?.getAttribute('aria-pressed'), 'premise: it opened on New person').toBe('true')
    await p.press('#apvModeRoster')
    expect(workOn('giveaccess'), 'premise: the switch counts').toBe(true)
    await p.press('#accAddOpen')
    await p.type('#accAddCs', 'Newface')
    await p.type('#accAddSeat', 'FCP')
    await p.type('#accAddCat', 'C')
    await p.press('#accAdd')
    expect(nameToId('Newface'), 'premise: Newface added to the roster').toBeTruthy()
    expect(workOn('giveaccess'), 'the switch still counts').toBe(true)
    await pick('u149')
    expect({ own: pageUnit('own'), form: !!p.$('[data-approving]') }, 'the pick refused, the form open').toEqual({ own: 'u142', form: true })
  })
  it('opened On the roster (a roster match), switched to New person; that man archived on his own row: the switch still counts', async () => {
    const man = noSignIn('u142')
    ask('newface@mail', csOf(man), 'u142')
    signInAs('saber')
    const p = panel()
    await p.press('[data-approve]')
    expect(p.$('#apvModeRoster')?.getAttribute('aria-pressed'), 'premise: it opened On the roster').toBe('true')
    await p.press('#apvModeNew')
    expect(workOn('giveaccess'), 'premise: the switch counts').toBe(true)
    await p.open(man)
    await p.press('#accEdArchive')
    expect(P(man).archived, 'premise: archived on his own row').toBe(true)
    expect({ counted: workOn('giveaccess'), form: !!p.$('[data-approving]') }).toEqual({ counted: true, form: true })
  })
})

describe('§49 — Give access pressed on a request already gone, or on a lapsed session', () => {
  it('the request answered by another admin, nothing redrawn; Give access pressed: the door\'s "That request is gone", nothing written, no row note', async () => {
    ask('newface@mail', 'Newface', 'u149')
    const id = requestByName('newface@mail')!.id
    signInAs('kestrel')
    const p = panel()
    await p.press('[data-approve]')
    await act(async () => { fireEvent.change(p.$('#apvRole')!, { target: { value: 'admin' } }) })
    expect(asOther('hunter', () => declineRequest(id)), 'setup: Hunter refuses it').toBeNull()
    vi.mocked(HOOKS.toast).mockClear()
    await p.press('#apvGo')
    await redraw()
    expect({ said: said(), added: !!accountByName('newface@mail'), form: !!p.$('[data-approving]') })
      .toEqual({ said: ['That request is gone'], added: false, form: false })
  })
  /* Hunter (142's second admin — Saber stays its admin, so he may be suspended) is suspended by Saber under the open form,
     nothing redrawn */
  const suspendHunter = () => { expect(asOther('saber', () => updateAccount(ACCT.hunter, { on: false })), 'setup: Saber suspends Hunter').toBeNull() }
  it('Give access (On the roster) opened, the signed-in account then suspended with nothing redrawn; "Give access" pressed: nothing written, the note', async () => {
    const man = noSignIn('u142')
    ask('newface@mail', csOf(man), 'u142')
    signInAs('hunter')
    const p = panel()
    await p.press('[data-approve]')
    expect(p.$('#apvModeRoster')?.getAttribute('aria-pressed'), 'premise: On the roster').toBe('true')
    await p.type('#apvPid', man)
    suspendHunter()
    vi.mocked(HOOKS.toast).mockClear()
    spy.calls.length = 0
    await p.press('#apvGo')
    expect({ sent: sent('approveRequest').length, added: !!accountByName('newface@mail'), note: notesFor(csOf(man)) })
      .toEqual({ sent: 0, added: false, note: 1 })
  })
  it('the same for "Add person and give access" (New person): nothing written, the note', async () => {
    ask('newface@mail', 'Newface', 'u142')
    signInAs('hunter')
    const p = panel()
    await p.press('[data-approve]')
    expect(p.$('#apvModeNew')?.getAttribute('aria-pressed'), 'premise: New person').toBe('true')
    suspendHunter()
    vi.mocked(HOOKS.toast).mockClear()
    spy.calls.length = 0
    await p.press('#apvGo')
    expect({ sent: sent('approveRequestNew').length, added: !!accountByName('newface@mail'), note: notesFor('Newface') })
      .toEqual({ sent: 0, added: false, note: 1 })
  })
  it('the Give access button on a lapsed session opens nothing, and the app repaints', async () => {
    ask('newface@mail', 'Newface', 'u142')
    await appOnAdmin('hunter')
    suspendHunter()
    reload()
    vi.mocked(HOOKS.toast).mockClear()
    expect(SESSION?.role, 'premise: nothing redrew — the session still reads admin').not.toBe('off')
    await act(async () => { fireEvent.click($('[data-approve]')!) })
    await settle()
    expect({ form: !!$('[data-approving]'), role: SESSION?.role ?? null, said: said() }).toEqual({ form: false, role: 'off', said: [] })
  })
})
