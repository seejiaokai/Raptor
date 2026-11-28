// @vitest-environment jsdom
/* ADMIN → USERS ACROSS SQUADRONS — STEP U1'S SEVENTH ROUND: WHAT THE SIXTH READ FOUND (the brief
   docs/superpowers/briefs/2026-11-27-msq-s2-u1fix7-brief.md; the earlier rounds' tests are msq-s2-rejudge.test.tsx to
   msq-s2-rejudge6.test.tsx).
   Four blind readers read the sixth round (Astra, two fresh Opus readers, an Opus security reader). None found a way to
   see what must not be seen, or to make a row write what the rule forbids. Three smaller findings, each kept here as a
   lasting test seen failing on the sixth round's code before the app changed (a test named "pin:" held already and must
   go on holding):
   §40 THE ARCHIVED ROW'S POST-IN DATE: ONE RULE FOR "UNTOUCHED", KEPT ACROSS MIDNIGHT AND ACROSS SAVE NAME — midnight threw
       away a callsign typed beside an untouched date in the shut fold without a word (the fresh Opus 2's finding 2); Save
       name, once the day he had picked came round, made his picked date read as untouched (Astra's finding 1);
   §41 A BELL LANDING ON THE VERY MAN WHOSE ROW IS OPEN NEVER HIDES THAT ROW — he was on the list only by the search, and
       the landing cleared it (the fresh Opus 2's finding 1);
   §42 A CHANGED "GIVE ACCESS" IS NEVER THROWN AWAY WITHOUT A WORD by his own move at midnight or his own Undo / Redo (the
       fresh Opus 1's finding 1).
   The world: three squadrons (withThird — his D2630), Wed 15 Jul 26, 09:00. Hunter — 142's admin, Plan of 149, View of
   150; Saber — master admin, home 142; Ranger — 142's member, View of 149 and of 150; Kestrel — 149's admin; Osprey —
   149's member; Mako — 150's own admin. */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { StrictMode } from 'react'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { withThird, third, signInAs, PID, ACCT, moveMan, on, pastMidnight } from '../test-support/msq-world'
import { UsersPanel } from './UsersPanel'
import { App } from './App'
import { useVersion } from './useStore'
import { openAdminUsers } from './adminopen'
import { accountsLoad, saveAccess, requestAccess } from '../state/accounts'
import { unitsLoad, todayIso, homeOn } from '../state/units'
import { pickSquadron } from '../state/pick'
import { pageUnit } from '../state/perms'
import { PEOPLE } from '../engine/people'
import { HOOKS } from '../engine/hooks'
import { notify } from '../state/store'
import { CURPAGE, setPage } from '../state/view'
import { globalUndo, globalRedo } from '../undo/timeline'
import { archivePerson } from '../leavewar/sync'
import { workOn } from './guard'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

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

/* ---- the list drawn alone (it redraws on the store's version, as the Admin page does around it) ---- */
function Live() { useVersion(); return <UsersPanel shown /> }
function panel(o: { strict?: boolean } = {}) {
  const page = render(o.strict ? <StrictMode><Live /></StrictMode> : <Live />)
  const $ = (sel: string) => page.container.querySelector(sel) as HTMLElement | null
  const archRowOf = (pid: string) => $(`#accArchList .acc-row[data-person="${pid}"]`)
  const press = async (sel: string) => { await act(async () => { fireEvent.click($(sel)!) }) }
  const type = async (sel: string, v: string) => { await act(async () => { fireEvent.change($(sel)!, { target: { value: v } }) }) }
  const openArch = async (pid: string) => {
    if (!$('#accArchList')) await press('#accArchToggle')
    await act(async () => { fireEvent.click(archRowOf(pid)!.querySelector('.acc-tap')!) })
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
  const noEditor = () => $('.acc-edit') === null
  return { $, archRowOf, press, type, openArch, pickDate, postIn, box, noEditor }
}
const redraw = async () => { await act(async () => { notify() }) }

/* ---- the whole app ---- */
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const settle = async () => { await act(async () => { await Promise.resolve(); await Promise.resolve() }) }
async function appOnAdmin(who: 'kestrel') {
  signInAs(who)
  vi.spyOn(HOOKS, 'isPhone').mockReturnValue(false)
  appPage = render(<App />)
  await settle()
  await act(async () => { setPage('admin'); notify() })
  await settle()
  expect(CURPAGE, 'premise: the app is on the Admin page').toBe('admin')
}
/* a man found by the search, his row opened, a line picked for 149 */
async function findOpenPick(pid: string, line: 'none' | 'view') {
  await act(async () => { fireEvent.change($('#accFind')!, { target: { value: csOf(pid) } }) })
  await act(async () => { fireEvent.click($(`[data-testid="acc-groups"] .acc-row[data-person="${pid}"] .acc-tap`)!) })
  const n = $('[data-testid="acc-sq"] .acc-sq-n[data-unit="u149"]')!
  await act(async () => { fireEvent.click((n.nextElementSibling as HTMLElement).querySelector(`[data-line="${line}"]`)!) })
  expect($('.acc-edit')?.getAttribute('data-unsaved'), 'premise: his pick, not saved').toBe('true')
}

/* ---- §40 THE ARCHIVED ROW'S POST-IN DATE: ONE RULE FOR "UNTOUCHED" ----
   The copy's opening date stood both for "what he has not touched" and for "what the clock last said". Now, on a draw, an
   untouched box (it holds the copy's date) whose date is no longer today rolls forward — the copy's date and the box both
   become today — and the row is judged after it; a press with nothing redrawn stays strict. Save name takes a fresh copy
   of his person and account but keeps the copy's opening date, so a date he picked is never made to read untouched. */
describe('§40 — the archived row\'s post-in date across midnight and Save name', () => {
  const kestrelOpensOspreysArchivedRow = async () => {
    signInAs('kestrel')
    expect(archivePerson(PID.osprey).bad, 'setup: Kestrel archives Osprey').toBeFalsy()
    reload()
    const p = panel()
    await p.openArch(PID.osprey)
    expect(p.postIn(), 'premise: the box opens on today').toBe('2026-07-15')
    return p
  }
  it('a callsign typed, the date left alone, put away in the shut fold: midnight passes and the page draws — the fold opened again, his row is still open with his callsign, the box on the new day, counted, no note', async () => {
    const p = await kestrelOpensOspreysArchivedRow()
    await p.type('#accArCs', 'Typedname')
    expect(workOn('archrow'), 'premise: counted').toBe(true)
    await p.press('#accArchToggle')
    expect(p.$('#accArchList'), 'premise: the fold is shut').toBeNull()
    vi.mocked(HOOKS.toast).mockClear()
    on(16); reload()
    expect(todayIso(), 'premise: the next day').toBe('2026-07-16')
    await redraw()
    expect(workOn('archrow'), 'still counted while put away').toBe(true)
    await p.press('#accArchToggle')
    expect({ box: p.box(), date: p.postIn(), notes: anyRowNote(), counted: workOn('archrow') })
      .toEqual({ box: 'Typedname', date: '2026-07-16', notes: 0, counted: true })
  })
  it('pin: a press past midnight with NOTHING redrawn stays strict — Restore on the untouched box refuses: nothing written, the note, the row closes', async () => {
    const p = await kestrelOpensOspreysArchivedRow()
    vi.mocked(HOOKS.toast).mockClear()
    on(16); reload()
    expect(p.$('#accArRestore'), 'premise: nothing redrew — the row still stands').not.toBeNull()
    await p.press('#accArRestore')
    expect(P(PID.osprey).archived, 'not restored').toBe(true)
    expect(p.noEditor(), 'the row closed').toBe(true)
    expect(notesFor('Osprey'), 'the note, once').toBe(1)
  })
  it('once the page has drawn past midnight, Restore on the rolled box goes through, no note', async () => {
    const p = await kestrelOpensOspreysArchivedRow()
    vi.mocked(HOOKS.toast).mockClear()
    on(16); reload()
    await redraw()
    expect(p.postIn(), 'premise: rolled to the new day').toBe('2026-07-16')
    await p.press('#accArRestore')
    expect(anyRowNote(), 'no row-changed note').toBe(0)
    expect(P(PID.osprey).archived, 'restored').toBeFalsy()
    expect(p.noEditor(), 'the row closed by its own press').toBe(true)
  })
  /* Astra's case: on 15 Jul he picks 16 Jul and types a callsign; midnight keeps the row (the sixth round); on 16 Jul he
     presses Save name. */
  const saveNameOnTheDayHePicked = async () => {
    const p = await kestrelOpensOspreysArchivedRow()
    await p.pickDate('2026-07-16')
    await p.type('#accArCs', 'Savedname')
    on(16); reload()
    await redraw()
    expect(todayIso(), 'premise: the day he picked has come').toBe('2026-07-16')
    expect({ box: p.box(), date: p.postIn() }, 'premise: his work kept across midnight').toEqual({ box: 'Savedname', date: '2026-07-16' })
    await p.press('#accArSave')
    expect(csOf(PID.osprey), 'premise: the name saved').toBe('Savedname')
    expect(P(PID.osprey).archived, 'premise: still archived').toBe(true)
    expect({ box: p.box(), date: p.postIn() }, 'premise: the row stays open with his date').toEqual({ box: 'Savedname', date: '2026-07-16' })
    return p
  }
  it('Save name on the day he picked: the date Restore has not yet used still counts as unsaved', async () => {
    await saveNameOnTheDayHePicked()
    expect(workOn('archrow'), 'Save name did not apply or cancel the picked post-in date').toBe(true)
  })
  it('…and a later draft, put away in the shut fold, is kept across the next midnight: his callsign and his date, counted, no note — nothing more written', async () => {
    const p = await saveNameOnTheDayHePicked()
    await p.type('#accArCs', 'Laterdraft')
    await p.press('#accArchToggle')
    expect(p.$('#accArchList'), 'premise: the fold is shut').toBeNull()
    vi.mocked(HOOKS.toast).mockClear()
    on(17); reload()
    await redraw()
    await p.press('#accArchToggle')
    expect({ callsign: p.box(), postIn: p.postIn(), counted: workOn('archrow'), notes: anyRowNote() })
      .toEqual({ callsign: 'Laterdraft', postIn: '2026-07-16', counted: true, notes: 0 })
    expect(csOf(PID.osprey), 'only the name he saved').toBe('Savedname')
    expect(P(PID.osprey).archived, 'still archived').toBe(true)
  })
  it('pin: Save name with the date left untouched — the row stays open, nothing more to save counted, and the next draw raises no note', async () => {
    const p = await kestrelOpensOspreysArchivedRow()
    await p.type('#accArCs', 'Savedname')
    vi.mocked(HOOKS.toast).mockClear()
    await p.press('#accArSave')
    expect(csOf(PID.osprey), 'premise: the name saved').toBe('Savedname')
    await redraw()
    expect({ open: !!p.$('#accArCs'), date: p.postIn(), counted: workOn('archrow'), notes: anyRowNote() })
      .toEqual({ open: true, date: '2026-07-15', counted: false, notes: 0 })
  })
})

/* ---- §41 A BELL LANDING ON THE VERY MAN WHOSE ROW IS OPEN NEVER HIDES THAT ROW ----
   The landing cleared the search for every tap; a man on the page's list only by the search then left the page with his
   row still open and his pick held and counted, out of sight. Now, where the landing is for the open man and he would not
   be listed without the search, the search is kept; otherwise it is cleared as before. Through the whole app and the
   Admin page's own landing (openAdminUsers). */
describe('§41 — a bell landing on the very man whose row is open, found by the search', () => {
  it('Kestrel on 149 finds Ranger (142) by the search, opens his short row, picks None; a bell landing for Ranger: his row stays on the page, open, the search kept — nothing held out of sight, no note', async () => {
    await appOnAdmin('kestrel')
    await findOpenPick(PID.ranger, 'none')
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => { openAdminUsers({ person: PID.ranger }) })
    await settle()
    const rowOnPage = !!$(`#page-admin .acc-row[data-person="${PID.ranger}"]`)
    expect({
      rowOnPage, editorOnPage: !!$('#page-admin .acc-edit'), heldUnseen: !rowOnPage && workOn('userrow'), notes: anyRowNote(),
      search: ($('#accFind') as HTMLInputElement).value,
    }, 'the very man landed on: his open row in view').toEqual({ rowOnPage: true, editorOnPage: true, heldUnseen: false, notes: 0, search: 'Ranger' })
    expect($('#page-admin .acc-edit')?.getAttribute('data-unsaved'), 'his pick still there, not saved').toBe('true')
  })
  it('the realistic shape: Osprey (149) moved to 142 yesterday; Kestrel on 149 finds him by the search, opens his short row, picks View, taps the landing for Osprey — his row stays on the page, no note', async () => {
    signInAs('saber')
    expect(moveMan(PID.osprey, 'u142'), 'setup: Osprey\'s move to 142, for tomorrow').toMatchObject({ ok: true })
    on(16); reload()
    expect(homeOn(PID.osprey, todayIso()), 'premise: he is 142\'s now').toBe('u142')
    await appOnAdmin('kestrel')
    await findOpenPick(PID.osprey, 'view')
    expect($('.acc-edit')?.getAttribute('data-short'), 'premise: his short row').toBe('1')
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => { openAdminUsers({ person: PID.osprey }) })
    await settle()
    const rowOnPage = !!$(`#page-admin .acc-row[data-person="${PID.osprey}"]`)
    expect({ rowOnPage, heldUnseen: !rowOnPage && workOn('userrow'), notes: anyRowNote() }).toEqual({ rowOnPage: true, heldUnseen: false, notes: 0 })
  })
  it('pin: a landing on the open man who is on the list without the search clears the search as before — his row stays open, in view', async () => {
    await appOnAdmin('kestrel')
    await act(async () => { fireEvent.change($('#accFind')!, { target: { value: 'Osprey' } }) })
    await act(async () => { fireEvent.click($(`[data-testid="acc-groups"] .acc-row[data-person="${PID.osprey}"] .acc-tap`)!) })
    expect($('.acc-edit'), 'premise: his row is open').not.toBeNull()
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => { openAdminUsers({ person: PID.osprey }) })
    await settle()
    expect({
      search: ($('#accFind') as HTMLInputElement).value, rowOnPage: !!$(`#page-admin .acc-row[data-person="${PID.osprey}"]`),
      editorOnPage: !!$('#page-admin .acc-edit'), notes: anyRowNote(),
    }).toEqual({ search: '', rowOnPage: true, editorOnPage: true, notes: 0 })
  })
})

/* ---- §42 A CHANGED "GIVE ACCESS" IS NEVER THROWN AWAY WITHOUT A WORD ----
   The sixth round threw the form away, silently, whenever its request left the page's list. A pick can no longer throw
   away a changed form (the core's K4 refuses it — msq-s2-rejudge6.test.tsx §39), but his own move landing at midnight,
   or his own Undo / Redo of a refusal, still could. Now a changed form thrown away by anything but his own pick says the
   open row's existing note, once, with the callsign the request asked as; an unchanged form still goes silently. */
describe('§42 — Give access, changed, thrown away by his own midnight move or his own Redo', () => {
  /* Kestrel made a master admin moves Saber to 150 from tomorrow; a stranger asks to join 142; Saber opens Give access */
  const saberOpensGiveAccessBeforeHisMove = async () => {
    signInAs('saber')
    expect(saveAccess(ACCT.kestrel, { master: true }), 'setup: Kestrel made a master admin').toBeNull()
    signInAs('kestrel')
    expect(moveMan(PID.saber, third.u150), 'setup: Saber moves to 150 from tomorrow').toMatchObject({ ok: true })
    signInAs('newface@mail')
    expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' }, 'u142'), 'setup: a stranger asks to join 142').toBeNull()
    signInAs('saber')
    expect(pageUnit('own'), 'premise: 142\'s page').toBe('u142')
    const p = panel()
    await p.press('[data-approve]')
    return p
  }
  it('his own move lands at midnight with Role changed: the form is gone, not counted, and the note is said once, naming the request', async () => {
    const p = await saberOpensGiveAccessBeforeHisMove()
    await act(async () => { fireEvent.change(p.$('#apvRole')!, { target: { value: 'admin' } }) })
    expect(workOn('giveaccess'), 'premise: his change, counted').toBe(true)
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => { pastMidnight() })
    expect(homeOn(PID.saber, todayIso()), 'premise: the move day').toBe(third.u150)
    expect(pageUnit('own'), 'premise: the app took his page to 150 — he picked nothing').toBe(third.u150)
    expect({ form: !!p.$('[data-approving]'), counted: workOn('giveaccess'), note: notesFor('Newface'), any: anyRowNote() })
      .toEqual({ form: false, counted: false, note: 1, any: 1 })
    await act(async () => { await pickSquadron('u142') })
    expect(p.$('[data-approving]'), 'back on 142: the form is not brought back open').toBeNull()
    expect(anyRowNote(), 'and not said again').toBe(1)
  })
  it('pin: the same with nothing changed in the form — it goes without a word', async () => {
    const p = await saberOpensGiveAccessBeforeHisMove()
    expect(workOn('giveaccess'), 'premise: unchanged, not counted').toBe(false)
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => { pastMidnight() })
    expect(pageUnit('own'), 'premise: his page is 150\'s').toBe(third.u150)
    expect({ form: !!p.$('[data-approving]'), notes: anyRowNote() }).toEqual({ form: false, notes: 0 })
  })
  const kestrelRedoesARefusal = async (o: { strict?: boolean; change: boolean }) => {
    signInAs('newface@mail')
    expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' }, 'u149'), 'setup: a stranger asks to join 149').toBeNull()
    signInAs('kestrel')
    const p = panel({ strict: o.strict })
    await p.press('[data-decline]')
    expect(p.$('[data-approve]'), 'premise: refused, off the list').toBeNull()
    await act(async () => { expect(globalUndo().ok, 'his Undo of the refusal').toBe(true); notify() })
    expect(p.$('[data-approve]'), 'premise: back on the list').not.toBeNull()
    await p.press('[data-approve]')
    if (o.change) await act(async () => { fireEvent.change(p.$('#apvRole')!, { target: { value: 'admin' } }) })
    expect(workOn('giveaccess'), 'premise: counted only if changed').toBe(o.change)
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => { expect(globalRedo().ok, 'his Redo of the refusal').toBe(true); notify() })
    return p
  }
  it('his own Redo of a refusal takes the request off the list with Role changed: the form is gone, not counted, the note said once', async () => {
    const p = await kestrelRedoesARefusal({ change: true })
    expect({ form: !!p.$('[data-approving]'), counted: workOn('giveaccess'), note: notesFor('Newface'), any: anyRowNote() })
      .toEqual({ form: false, counted: false, note: 1, any: 1 })
    await act(async () => { expect(globalUndo().ok, 'and Undo once more').toBe(true); notify() })
    expect(p.$('[data-approve]'), 'the request back, its Give access button there').not.toBeNull()
    expect(p.$('[data-approving]'), 'the form not brought back open').toBeNull()
    expect(anyRowNote(), 'and not said again').toBe(1)
  })
  it('…the same in React\'s strict mode, every draw run twice: the note said once', async () => {
    const p = await kestrelRedoesARefusal({ strict: true, change: true })
    expect({ form: !!p.$('[data-approving]'), note: notesFor('Newface'), any: anyRowNote() }).toEqual({ form: false, note: 1, any: 1 })
  })
  it('pin: his own Redo with nothing changed in the form — it goes without a word', async () => {
    const p = await kestrelRedoesARefusal({ change: false })
    expect({ form: !!p.$('[data-approving]'), notes: anyRowNote() }).toEqual({ form: false, notes: 0 })
  })
})
