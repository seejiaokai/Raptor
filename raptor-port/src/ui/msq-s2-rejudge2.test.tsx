// @vitest-environment jsdom
/* ADMIN → USERS ACROSS SQUADRONS — STEP U1'S SECOND FIX ROUND: THE RULE WIDENED AT ITS EDGES (the brief
   docs/superpowers/briefs/2026-11-26-msq-s2-u1fix2-brief.md; the first round's tests are msq-s2-rejudge.test.tsx).
   Four blind readers of the first fix (chat 205 — Astra, a fresh Fable, a fresh Opus, the security reader) found the main
   rule sound — no route opens another squadron's man's whole row, the short row's Save sends one line — and proved gaps at
   its edges. Their proofs are kept here as lasting tests, each seen failing on the first fix's code (eda4bd991) before
   the app changed, except where named "pin:" (what held already and must go on holding). Each reader's case is named once;
   two readers' proofs of one case are one test, or one test a world.
   THE RULE AS IT STANDS NOW: the page holds, for the open row, the whole judgement of the press that opened it — the
   page's squadron, short or whole, his home squadron that day, whether he was archived, and the squadron in view. On every
   draw of the page AND of the row's own editor the open row is judged again by all of it; where any part no longer holds
   the row closes and nothing typed is carried over. Every write of all three editors — the whole row's five, the short
   row's Save, the archived row's Restore, "Restore as", Save name and Delete (both taps) — asks again first. Closed by the
   signed-in person's own pick of another squadron: no note. Closed any other way: the passing note "<Callsign>’s row
   changed while it was open, so nothing was saved. Open it again.", once — but a man DELETED under his open row closes it
   with no note (he cannot be opened again). A row's own writes raise no note. The open short
   row shows the line he holds today and sends only a pick that differs from it.
   The world: three squadrons (withThird — his D2630), Wed 15 Jul 26, 09:00. Hunter — 142's admin, Plan of 149, View of
   150; Saber — master admin, home 142; Ranger — 142's member, View of 149 and of 150; Kestrel — 149's admin; Osprey —
   149's member; Mako — 150's own admin. */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { StrictMode } from 'react'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { withThird, third, signInAs, PID, ACCT, SIGN, moveMan, on, pastMidnight } from '../test-support/msq-world'
import { UsersPanel } from './UsersPanel'
import { useVersion } from './useStore'
import {
  accountById, accountOfPid, accountsLoad, updateAccount, saveAccess, signIn, sessionFor, levelAcct,
} from '../state/accounts'
import { SESSION, ME, setSession, setMe } from '../state/auth'
import { unitsLoad, todayIso, homeOn, grantOfOn } from '../state/units'
import { pickSquadron } from '../state/pick'
import { pageUnit } from '../state/perms'
import { PEOPLE } from '../engine/people'
import { rosterOf } from '../engine/roster'
import { HOOKS } from '../engine/hooks'
import { UNIT } from '../engine/unitview'
import { notify } from '../state/store'
import { globalUndo } from '../undo/timeline'
import { archivePerson, restoreArchivedPerson } from '../leavewar/sync'
import { deletePerson } from '../state/person-delete'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

/* A SPY ON TWO DOORS: every call of state/accounts.ts saveAccess and of state/person-delete.ts deletePerson is recorded,
   and passed to the real door. Every other name is read from the real module each time it is used — never a copy taken
   once: the accounts list is a value the module replaces whenever it loads, and a copy of it left the permission checks
   reading the seeded accounts (a master admin made inside a test was not one to them). */
const spy = vi.hoisted(() => ({
  calls: [] as unknown[][], deletes: [] as unknown[][],
  on(real: Record<string, unknown>, name: string, into: unknown[][]): Record<string, unknown> {
    const door = (...a: unknown[]) => { into.push(a); return (real[name] as (...x: unknown[]) => unknown)(...a) }
    const live: Record<string, unknown> = {}
    for (const k of Object.keys(real)) Object.defineProperty(live, k, { enumerable: true, get: () => (k === name ? door : real[k]) })
    return live
  },
}))
vi.mock('../state/accounts', async importOriginal => spy.on(await importOriginal<Record<string, unknown>>(), 'saveAccess', spy.calls))
vi.mock('../state/person-delete', async importOriginal => spy.on(await importOriginal<Record<string, unknown>>(), 'deletePerson', spy.deletes))

withThird()
afterEach(() => cleanup())

const reload = () => { unitsLoad(); accountsLoad() }
const P = (pid: string): any => (PEOPLE as any)[pid]
const csOf = (pid: string) => String(P(pid).cs)
/* the passing note of his D2730 Q13, word for word */
const noteFor = (cs: string) => `${cs}’s row changed while it was open, so nothing was saved. Open it again.`
const notesFor = (cs: string) => vi.mocked(HOOKS.toast).mock.calls.filter(c => c[0] === noteFor(cs)).length
const anyRowNote = () => vi.mocked(HOOKS.toast).mock.calls.filter(c => String(c[0]).includes('row changed')).length
/* a man on a squadron's roster with no sign-in */
const noSignIn = (unit: string): string => {
  const pid = rosterOf(unit, todayIso()).find(id => { const x = P(id); return x && !x.special && !x.archived && !x.deleted && !accountOfPid(id) })
  if (!pid) throw new Error(`the world has no ${unit} man without a sign-in`)
  return pid
}
/* the line he holds of a squadron today, as the row's buttons name it */
const level = (acct: string, unit: string) => grantOfOn(levelAcct(accountById(acct)!), unit, todayIso())?.level ?? null
const lineHeld = (acct: string, unit: string) => (level(acct, unit) === 'admin' ? 'plan' : level(acct, unit) === 'view' ? 'view' : 'none')
/* ANOTHER ADMIN'S CHANGE, LANDING UNDER THE SIGNED-IN PERSON (the Fable read's helper): the write made through the real
   door as `who`, the signed-in person's own session put back after it — never a sign-in, which enters his home squadron
   and resets the page (state/store.ts resetSession), so it would itself move the page */
function asOther<T>(who: keyof typeof SIGN, fn: () => T): T {
  const s0 = SESSION, me0 = ME
  const s1 = sessionFor(signIn(SIGN[who][0], SIGN[who][1]) as any)
  setSession(s1); setMe(s1.pid)
  try { return fn() } finally { setSession(s0); setMe(me0) }
}

/* the page redraws on the store's version, as AdminPage does around it; `strict` — every draw run twice, as the app runs */
function Live() { useVersion(); return <UsersPanel shown /> }
function panel(strict = false) {
  const page = render(strict ? <StrictMode><Live /></StrictMode> : <Live />)
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
  const lineUnits = () => $$('[data-testid="acc-sq"] .acc-sq-n').map(n => n.dataset.unit)
  /* the line's button drawn as picked (aria-pressed), or null where no line is drawn */
  const pressed = (unit: string) => {
    const n = $(`[data-testid="acc-sq"] .acc-sq-n[data-unit="${unit}"]`)
    return (n?.nextElementSibling as HTMLElement | null)?.querySelector('[aria-pressed="true"]')?.getAttribute('data-line') ?? null
  }
  const pickLine = async (unit: string, v: string) => {
    const n = $(`[data-testid="acc-sq"] .acc-sq-n[data-unit="${unit}"]`)!
    await act(async () => { fireEvent.click((n.nextElementSibling as HTMLElement).querySelector(`[data-line="${v}"]`)!) })
  }
  const sub = (pid: string) => rowOf(pid)?.querySelector('.acc-sub')?.textContent ?? ''
  /* no editor of any kind is drawn anywhere on the page */
  const noEditor = () => $('.acc-edit') === null
  return { $, $$, rowOf, archRowOf, press, type, open, openArch, find, lineUnits, pressed, pickLine, sub, noEditor, html: () => page.container.innerHTML }
}
type Panel = ReturnType<typeof panel>
const pick = async (u: string) => { await act(async () => { await pickSquadron(u) }) }
const redraw = async () => { await act(async () => { notify() }) }
const WHOLE = ['#accEdName', '#accEdRole', '#accEdOnOff', '#accEdArchive', '#accEdDel']
const ARCH = ['#accArCs', '#accArPostIn', '#accArRestore', '#accArDel']
const closedWithNote = (p: Panel, pid: string) => {
  expect(p.noEditor(), 'the row closed').toBe(true)
  expect(notesFor(csOf(pid)), 'the note, once').toBe(1)
  expect(HOOKS.toast).toHaveBeenLastCalledWith(noteFor(csOf(pid)), 'warn')
}

/* ---- §6 THE ARCHIVED MAN'S ROW GETS THE BELT (the brief's item 2 — Astra 1, the Fable read 1, the security read 1) ----
   An archived man can have a move waiting. His archived row is open on the squadron he is leaving; the date rolls past
   his move day and nothing redraws: the row still stands, every control live. Whoever is signed in is one the doors
   accept in both squadrons, so only the row's own asking again stops the write. Two worlds, the readers' own:
   - "149's page": Osprey (149's), moved to 142 from tomorrow, archived today; Saber on 149's page by a pick (the Fable read);
   - "142's page": a 142 man moved to 149 from tomorrow, archived today; Saber, or Hunter (142's admin with Plan of 149),
     on 142's own page — no pick, no Squadron tick (Astra, the security read). */
describe('§6 — the archived man\'s opened row asks again before each of its writes', () => {
  const acrossHisMove = async (o: { who: 'saber' | 'hunter'; pid: string; to: string; page?: string; prep?: (p: Panel) => Promise<void> }) => {
    signInAs(o.who)
    expect(moveMan(o.pid, o.to), 'setup: his move saved, from tomorrow').toMatchObject({ ok: true })
    if (o.page) await pick(o.page)
    expect(archivePerson(o.pid).bad, 'setup: archived today').toBeNull()
    reload()
    const here = pageUnit('own')
    expect(homeOn(o.pid, todayIso()), 'premise: today he is the page\'s own archived man').toBe(here)
    const p = panel()
    await p.openArch(o.pid)
    expect(p.$('#accArRestore'), 'premise: his archived row is open').not.toBeNull()
    if (o.prep) await o.prep(p)
    on(16); reload()
    expect(homeOn(o.pid, todayIso()), 'the move day: he is the other squadron\'s man').toBe(o.to)
    expect(pageUnit('own'), 'premise: the page is still the squadron he left').toBe(here)
    expect(p.$('#accArRestore'), 'premise: nothing redrew — his archived row still stands').not.toBeNull()
    spy.calls.length = 0; spy.deletes.length = 0
    return p
  }
  const on149 = (prep?: (p: Panel) => Promise<void>) => acrossHisMove({ who: 'saber', pid: PID.osprey, to: 'u142', page: 'u149', prep })

  it('Delete, armed before his move landed — Saber on 149\'s page, Osprey by then 142\'s (the Fable read): the second tap deletes nothing; the note; the row closes', async () => {
    const p = await on149(async q => { await q.press('#accArDel') })
    expect(p.$('#accArDelNote'), 'premise: Delete armed').not.toBeNull()
    await p.press('#accArDel')
    expect(spy.deletes, 'the delete door is never called').toEqual([])
    expect(!!P(PID.osprey).deleted, 'a 142 man is not deleted from 149\'s page').toBe(false)
    expect(accountById(ACCT.osprey), 'his account still there').toBeTruthy()
    closedWithNote(p, PID.osprey)
  })
  it('Delete, armed before his move landed — Saber on 142\'s own page, Ranger by then 149\'s, no pick and no Squadron tick (Astra 1, the security read): the delete door is never called; the note; the row closes', async () => {
    const p = await acrossHisMove({ who: 'saber', pid: PID.ranger, to: 'u149', prep: async q => { await q.press('#accArDel') } })
    expect(p.$('#accArDel')!.classList.contains('del-armed'), 'premise: Delete armed').toBe(true)
    await p.press('#accArDel')
    expect(spy.deletes, 'the stale row must not call the delete door').toEqual([])
    expect(!!P(PID.ranger).deleted, 'not deleted from another squadron\'s page').toBe(false)
    reload()
    expect(accountById(ACCT.ranger), 'his account still there').toBeTruthy()
    closedWithNote(p, PID.ranger)
  })
  it('Delete, not yet armed when his move landed: the first tap arms nothing; the note; the row closes', async () => {
    const p = await on149()
    await p.press('#accArDel')
    expect(p.$('#accArDelNote'), 'nothing armed').toBeNull()
    expect(spy.deletes).toEqual([])
    closedWithNote(p, PID.osprey)
  })
  it('Restore — Saber on 149\'s page, Osprey by then 142\'s (the Fable read): he is not restored; the note; the row closes', async () => {
    const p = await on149()
    await p.press('#accArRestore')
    expect(!!P(PID.osprey).archived, 'a 142 man is not restored from 149\'s page').toBe(true)
    closedWithNote(p, PID.osprey)
  })
  it('Restore — Hunter (142\'s admin, Plan of 149) on 142\'s page, Ranger by then 149\'s (the security read): still archived, his sign-in still suspended; the note; the row closes', async () => {
    const p = await acrossHisMove({ who: 'hunter', pid: PID.ranger, to: 'u149' })
    await p.press('#accArRestore')
    expect(!!P(PID.ranger).archived, 'still archived — nothing restored from another squadron\'s page').toBe(true)
    reload()
    expect(accountById(ACCT.ranger)!.on, 'his sign-in still suspended').toBe(false)
    closedWithNote(p, PID.ranger)
  })
  it('"Restore as", a new callsign typed before his move landed: he is neither restored nor renamed; the note; the row closes', async () => {
    const was = csOf(PID.osprey)
    const p = await on149(async q => { await q.type('#accArCs', 'Zzyx') })
    expect(p.$('#accArRestore')!.textContent, 'premise: the button reads "Restore as"').toBe('Restore as Zzyx')
    await p.press('#accArRestore')
    expect(!!P(PID.osprey).archived, 'not restored').toBe(true)
    expect(csOf(PID.osprey), 'not renamed').toBe(was)
    closedWithNote(p, PID.osprey)
  })
  it('Save name, a new callsign typed before his move landed — Saber on 149\'s page, Osprey (the Fable read): he is not renamed; the note; the row closes', async () => {
    const was = csOf(PID.osprey)
    const p = await on149(async q => { await q.type('#accArCs', 'Zzyx') })
    expect(p.$('#accArSave'), 'premise: Save name is drawn').not.toBeNull()
    await p.press('#accArSave')
    expect(csOf(PID.osprey), 'a 142 man is not renamed from 149\'s page').toBe(was)
    closedWithNote(p, PID.osprey)
  })
  it('Save name — Saber on 142\'s page, a 142 man with no sign-in by then 149\'s (the security read): his callsign unchanged; the note; the row closes', async () => {
    signInAs('saber')
    const pid = noSignIn('u142')
    const was = csOf(pid)
    const p = await acrossHisMove({ who: 'saber', pid, to: 'u149', prep: async q => { await q.type('#accArCs', 'Zulu9') } })
    expect(p.$('#accArSave'), 'premise: Save name is offered').not.toBeNull()
    await p.press('#accArSave')
    expect(csOf(pid), 'his callsign unchanged').toBe(was)
    closedWithNote(p, pid)
  })
  for (const w of [
    { name: '142\'s page, Ranger (the security read\'s pin)', o: { who: 'saber' as const, pid: PID.ranger, to: 'u149' } },
    { name: '149\'s page, Osprey (the Fable read\'s soundness test)', o: { who: 'saber' as const, pid: PID.osprey, to: 'u142', page: 'u149' } },
  ]) {
    it(`pin: with a redraw as his move lands, his archived row leaves the page he has left and the note shows once — ${w.name}`, async () => {
      const p = await acrossHisMove(w.o)
      await redraw()
      expect(p.$(`.acc-row[data-person="${w.o.pid}"]`), 'he is no longer on the page').toBeNull()
      expect(p.$('[data-restoring]'), 'no archived editor left').toBeNull()
      expect(notesFor(csOf(w.o.pid)), 'the note, once').toBe(1)
    })
  }
})

/* ---- §7 THE HELD JUDGEMENT KNOWS HIS HOME AND WHETHER HE IS ARCHIVED (the brief's item 1) ----
   The first fix judged an open row by two things: the page's squadron, and whether he is another squadron's man here. A
   change that left both as they were closed nothing: his move from one other squadron to another (the Fable read 3,
   Astra 4), and his being archived or restored under the open row (the Fable read 2, the security read's "one more
   face"), which carried the open row from his roster row to his archived row with no press. */
describe('§7 — his home changes, or he is archived or restored, under his open row: the row closes with the note', () => {
  /* Ranger (142's member, View of 149) moves to 150 from tomorrow; Kestrel on 149's page has his short row open */
  const rangerTo150 = async () => {
    signInAs('saber')
    expect(moveMan(PID.ranger, third.u150), 'setup: Ranger moves to 150 from tomorrow').toMatchObject({ ok: true })
    signInAs('kestrel')
    const p = panel()
    await p.find(csOf(PID.ranger))
    await p.open(PID.ranger)
    expect(p.pressed('u149'), 'premise: his row is open, View showing').toBe('view')
    return p
  }
  it('Kestrel has Ranger\'s short row open on 149\'s page, View showing; his move 142 → 150 lands and the page redraws (the Fable read 3): the row closes with the note, once; opened again it shows the line he holds today', async () => {
    const p = await rangerTo150()
    on(16); reload()
    await redraw()
    expect(homeOn(PID.ranger, todayIso()), 'the move day: he is 150\'s').toBe(third.u150)
    expect(pageUnit('own'), 'premise: the page is still 149\'s').toBe('u149')
    expect(p.$(`[data-testid="sqn-${PID.ranger}"]`)?.textContent, 'premise: his row wears 150 now').toBe('150')
    expect(level(ACCT.ranger, 'u149'), 'premise: his View of 149 ended with his move').toBeNull()
    expect(p.sub(PID.ranger), 'premise: the row\'s own second line no longer says he views 149').not.toContain('also views')
    const shown = p.$('.acc-edit[data-short="1"]') ? p.pressed('u149') : lineHeld(ACCT.ranger, 'u149')
    expect(shown, 'the open row shows the line he holds today (or it has closed)').toBe(lineHeld(ACCT.ranger, 'u149'))
    closedWithNote(p, PID.ranger)
    await redraw()
    expect(notesFor(csOf(PID.ranger)), 'still once after a later draw').toBe(1)
    await p.open(PID.ranger)
    expect(p.pressed('u149'), 'opened again: the line he holds today').toBe('none')
  })
  it('the same, then Save (the Fable read 3): no row is left showing View to be saved — nothing is sent, and Ranger holds nothing of 149', async () => {
    const p = await rangerTo150()
    on(16); reload()
    await redraw()
    spy.calls.length = 0
    const shownAtSave = p.$('#accEdSave') ? p.pressed('u149') : null
    if (p.$('#accEdSave')) await p.press('#accEdSave')
    const holds = lineHeld(ACCT.ranger, 'u149')
    expect({ shownAtSave, holds }, 'what the row showed as held when Save was pressed is what he holds after it (or the row had closed: null)')
      .toEqual(shownAtSave === null ? { shownAtSave: null, holds } : { shownAtSave: holds, holds })
    expect(shownAtSave, 'the row had closed').toBeNull()
    expect(spy.calls, 'nothing sent').toEqual([])
  })
  it('his move 142 → 150 lands with NO redraw, a change of line picked before it: the short row\'s Save sends nothing; the note; the row closes', async () => {
    const p = await rangerTo150()
    await p.pickLine('u149', 'none')
    on(16); reload()
    expect(p.$('#accEdSave'), 'premise: nothing redrew — the short row still stands').not.toBeNull()
    spy.calls.length = 0
    await p.press('#accEdSave')
    expect(spy.calls, 'nothing sent for a man whose home changed under the row').toEqual([])
    closedWithNote(p, PID.ranger)
  })
  it('a 142 man with no sign-in, his short row open on 149\'s page; his move to 150 lands and the page redraws (the Fable read 3): the words no longer send the admin to 142\'s admin — the row closes with the note; opened again they name 150', async () => {
    signInAs('saber')
    const pid = noSignIn('u142')
    expect(moveMan(pid, third.u150), 'setup: he moves to 150 from tomorrow').toMatchObject({ ok: true })
    signInAs('kestrel')
    const p = panel()
    await p.find(csOf(pid))
    await p.open(pid)
    expect(p.$('#accEdNoSignIn')?.textContent, 'premise: today the words name 142').toBe('No sign-in. Ask 142\'s admin to give him one first.')
    on(16); reload()
    await redraw()
    expect(homeOn(pid, todayIso()), 'the move day: he is 150\'s').toBe(third.u150)
    expect(p.$(`[data-testid="sqn-${pid}"]`)?.textContent, 'premise: his row wears 150 now').toBe('150')
    expect(p.$('#accEdNoSignIn')?.textContent ?? 'No sign-in. Ask 150\'s admin to give him one first.', 'the words name his squadron today (or the row has closed)')
      .toBe('No sign-in. Ask 150\'s admin to give him one first.')
    closedWithNote(p, pid)
    await p.open(pid)
    expect(p.$('#accEdNoSignIn')?.textContent, 'opened again: his squadron today').toBe('No sign-in. Ask 150\'s admin to give him one first.')
  })
  /* (Astra's proof 4 as written expected the row to stay open, no note, and the words to follow him to 150. The brief
     decides the other way — one rule: his home is no longer the one the row opened on, so the row closes with the note —
     and this test is that proof re-pointed. On the first fix's code it fails where the proof did: the row stays open, still
     naming 142.) */
  it('the same by the app\'s own midnight wake (Astra 4, re-pointed): the row closes, the note once; opened again it is the short row naming 150, Cancel alone', async () => {
    signInAs('saber')
    const pid = noSignIn('u142')
    expect(moveMan(pid, third.u150)).toMatchObject({ ok: true })
    signInAs('kestrel')
    const p = panel()
    await p.find(csOf(pid))
    await p.open(pid)
    expect(p.$('#accEdNoSignIn')?.textContent).toBe('No sign-in. Ask 142\'s admin to give him one first.')
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => { pastMidnight() })
    expect(pageUnit('own')).toBe('u149')
    expect(homeOn(pid, todayIso())).toBe(third.u150)
    expect(p.$(`[data-testid="sqn-${pid}"]`)?.textContent).toBe('150')
    closedWithNote(p, pid)
    await p.open(pid)
    expect(p.$('.acc-edit[data-short="1"]'), 'opened again: the short row').not.toBeNull()
    expect(p.$$('.acc-edit button').map(b => b.textContent), 'Cancel alone').toEqual(['Cancel'])
    expect(p.$('#accEdNoSignIn')?.textContent, 'the instruction names his home today, matching the grey number').toBe('No sign-in. Ask 150\'s admin to give him one first.')
  })

  /* (the security read pinned this "as built": the fold drew his whole archived row open with no press. The widened rule
     ends it, so the pin is re-pointed here, merged with the Fable read's proof 4 of the same case.) */
  it('Saber on 142\'s page, Squadron tick 149, Osprey\'s short row open; Kestrel archives Osprey (the Fable read 2; the security read\'s "one more face", re-pointed): the row closes with the note; in the Archived fold nobody pressed his row, so none of its editor is drawn', async () => {
    signInAs('saber')
    const p = panel()
    await p.press('#accFilter')
    await p.press('[data-ftick="sqn:u149"]')
    await p.open(PID.osprey)
    expect(p.$('.acc-edit[data-short="1"]'), 'premise: Osprey\'s short row is open on 142\'s page').not.toBeNull()
    expect(p.$('#accEdName'), 'premise: no sign-in box — the short row').toBeNull()
    expect(asOther('kestrel', () => archivePerson(PID.osprey).bad), 'setup: Kestrel (149\'s admin) archives Osprey').toBeNull()
    reload()
    await redraw()
    expect(!!P(PID.osprey).archived, 'premise: he is archived').toBe(true)
    expect(homeOn(PID.osprey, todayIso()), 'premise: he is 149\'s man').toBe('u149')
    expect(pageUnit('own'), 'premise: the page is 142\'s').toBe('u142')
    /* the Archived fold opened by the master admin, to look — no press on any row in it */
    if (!p.$('#accArchList')) await p.press('#accArchToggle')
    expect(p.archRowOf(PID.osprey), 'premise: his archived row is in the fold (finding B, as built)').not.toBeNull()
    expect(ARCH.filter(id => p.$(id)), 'nobody pressed his archived row: none of its editor is drawn').toEqual([])
    closedWithNote(p, PID.osprey)
  })
  it('Kestrel has Osprey\'s whole row open on 149\'s own page, a rename typed; another admin archives him: the row closes with the note, nothing typed is saved, and his archived row is not open', async () => {
    signInAs('kestrel')
    const was = accountById(ACCT.osprey)!.name
    const p = panel()
    await p.find(csOf(PID.osprey))
    await p.open(PID.osprey)
    await p.type('#accEdName', 'typed@mail')
    expect(asOther('saber', () => archivePerson(PID.osprey).bad), 'setup: Saber archives Osprey').toBeNull()
    reload()
    await redraw()
    expect(pageUnit('own'), 'premise: the page is still 149\'s').toBe('u149')
    expect(!!P(PID.osprey).archived, 'premise: he is archived').toBe(true)
    if (!p.$('#accArchList')) await p.press('#accArchToggle')
    expect(p.archRowOf(PID.osprey), 'premise: his archived row is in 149\'s fold').not.toBeNull()
    expect(ARCH.filter(id => p.$(id)), 'his archived row is not open — nobody pressed it').toEqual([])
    expect(accountById(ACCT.osprey)!.name, 'nothing typed was saved').toBe(was)
    closedWithNote(p, PID.osprey)
  })
  it('Kestrel has Osprey\'s archived row open on 149\'s own page; another admin restores him: the row closes with the note, and his roster row is not open — no whole row drawn with no press', async () => {
    signInAs('kestrel')
    expect(archivePerson(PID.osprey).bad, 'setup: Osprey archived').toBeNull()
    reload()
    const p = panel()
    await p.openArch(PID.osprey)
    expect(p.$('#accArRestore'), 'premise: his archived row is open').not.toBeNull()
    vi.mocked(HOOKS.toast).mockClear()
    expect(asOther('saber', () => restoreArchivedPerson(PID.osprey, todayIso())), 'setup: Saber restores Osprey').toBe(true)
    reload()
    await redraw()
    expect(pageUnit('own'), 'premise: the page is still 149\'s').toBe('u149')
    expect(!!P(PID.osprey).archived, 'premise: he is on the roster again').toBe(false)
    expect(p.rowOf(PID.osprey), 'premise: his roster row is on 149\'s page').not.toBeNull()
    expect(WHOLE.filter(id => p.$(id)), 'his whole row is not open — nobody pressed it').toEqual([])
    closedWithNote(p, PID.osprey)
  })

  /* DELETED UNDER IT — THE ROW CLOSES, AND NO NOTE (the coordinator's call on this round's report, chat 205): a delete also
     marks him archived (state/person-delete.ts), so the widened judgement closed his open row with the note — whose
     "Open it again." is untrue of a man who is gone, and new words are not ours to write. A man deleted under his open
     row (another admin's delete) closes it in silence, as before this round; archived or restored keeps the note. */
  const nothingOfHim = async (p: Panel, pid: string) => {
    expect(!!P(pid).deleted, 'premise: he is deleted').toBe(true)
    expect(pageUnit('own'), 'premise: the page is still 149\'s').toBe('u149')
    /* (the Archived fold opened where there is one, so "no row of his" is read with the fold open too) */
    if (!p.$('#accArchList') && p.$('#accArchToggle')) await p.press('#accArchToggle')
    expect(p.$(`.acc-row[data-person="${pid}"]`), 'no row of his anywhere on the page').toBeNull()
    expect(p.noEditor(), 'no editor drawn').toBe(true)
    expect(anyRowNote(), 'no "row changed" note — he cannot be opened again').toBe(0)
  }
  it('Kestrel has Osprey\'s whole row open on 149\'s page, a rename typed; another admin deletes him: the row closes, nothing of him is drawn, and no note', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.find(csOf(PID.osprey))
    await p.open(PID.osprey)
    await p.type('#accEdName', 'typed@mail')
    vi.mocked(HOOKS.toast).mockClear()
    expect(asOther('saber', () => deletePerson(PID.osprey)), 'setup: Saber deletes Osprey').toBeNull()
    reload()
    await redraw()
    await nothingOfHim(p, PID.osprey)
    await redraw()
    expect(anyRowNote(), 'nor at a later draw').toBe(0)
  })
  it('Kestrel has Ranger\'s short row open on 149\'s page; 142\'s admin deletes him: the row closes, nothing of him is drawn, and no note', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.find(csOf(PID.ranger))
    await p.open(PID.ranger)
    expect(p.$('.acc-edit[data-short="1"]'), 'premise: his short row is open').not.toBeNull()
    vi.mocked(HOOKS.toast).mockClear()
    expect(asOther('hunter', () => deletePerson(PID.ranger)), 'setup: Hunter deletes Ranger').toBeNull()
    reload()
    await redraw()
    await nothingOfHim(p, PID.ranger)
  })
  it('Kestrel has Osprey\'s archived row open on 149\'s page; another admin deletes him: nothing of him is drawn, no note — and the next row pressed opens', async () => {
    signInAs('kestrel')
    expect(archivePerson(PID.osprey).bad, 'setup: Osprey archived').toBeNull()
    reload()
    const p = panel()
    await p.openArch(PID.osprey)
    expect(p.$('#accArRestore'), 'premise: his archived row is open').not.toBeNull()
    vi.mocked(HOOKS.toast).mockClear()
    expect(asOther('saber', () => deletePerson(PID.osprey)), 'setup: Saber deletes Osprey').toBeNull()
    reload()
    await redraw()
    await nothingOfHim(p, PID.osprey)
    await p.find(csOf(PID.ranger))
    await p.open(PID.ranger)
    expect(p.$('.acc-edit[data-short="1"]'), 'another row opens as always').not.toBeNull()
    expect(anyRowNote()).toBe(0)
  })
  it('pin: the belt is unchanged — Osprey deleted by another admin with NOTHING redrawn, then Save pressed on his still-standing whole row: nothing sent, the row closes, and the belt\'s note', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.find(csOf(PID.osprey))
    await p.open(PID.osprey)
    await p.type('#accEdName', 'typed@mail')
    vi.mocked(HOOKS.toast).mockClear()
    expect(asOther('saber', () => deletePerson(PID.osprey))).toBeNull()
    reload()
    spy.calls.length = 0
    expect(p.$('#accEdSave'), 'premise: nothing redrew — his whole row still stands').not.toBeNull()
    await p.press('#accEdSave')
    expect(notesFor(csOf(PID.osprey)), 'a write pressed on a changed row: the note, once').toBe(1)
    expect(spy.calls, 'nothing sent').toEqual([])
    expect(p.noEditor(), 'the row closed').toBe(true)
  })

  /* KEPT EXACTLY: a row's own writes raise no note. With "archived" now part of the judgement, the row's own Archive and
     the archived row's own Restore change the very thing the page judges by — and close the row in the same press. */
  it('pin: Kestrel on 149 — Suspend, then Archive Osprey from his own row (the Fable read\'s soundness test): each goes through, no "row changed" note, and his archived row is not left open', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.find(csOf(PID.osprey))
    await p.open(PID.osprey)
    await p.press('#accEdOnOff')
    await redraw()
    await p.open(PID.osprey)
    await p.press('#accEdArchive')
    await redraw()
    expect(!!P(PID.osprey).archived, 'archived').toBe(true)
    expect(anyRowNote(), 'no note').toBe(0)
    if (!p.$('#accArchList')) await p.press('#accArchToggle')
    expect(ARCH.filter(id => p.$(id)), 'his archived row is closed').toEqual([])
    expect(anyRowNote(), 'still no note').toBe(0)
  })
  it('pin: the archived row\'s own Restore: he is restored, no "row changed" note, and his roster row is not left open', async () => {
    signInAs('kestrel')
    expect(archivePerson(PID.osprey).bad, 'setup: Osprey archived').toBeNull()
    reload()
    const p = panel()
    await p.openArch(PID.osprey)
    vi.mocked(HOOKS.toast).mockClear()
    await p.press('#accArRestore')
    await redraw()
    expect(!!P(PID.osprey).archived, 'restored').toBe(false)
    expect(p.rowOf(PID.osprey), 'on the roster list again').not.toBeNull()
    expect(p.noEditor(), 'nothing left open').toBe(true)
    expect(anyRowNote(), 'no note').toBe(0)
  })
  it('pin: Kestrel on 149 — Delete Osprey, two taps (the Fable read\'s soundness test): deleted, no "row changed" note after it', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.find(csOf(PID.osprey))
    await p.open(PID.osprey)
    await p.press('#accEdDel')
    await p.press('#accEdDel')
    await redraw()
    expect(!!P(PID.osprey).deleted, 'deleted').toBe(true)
    expect(anyRowNote(), 'no note under any name').toBe(0)
  })
})

/* ---- §8 AN EDITOR JUDGES ITSELF ON ITS OWN DRAWS (the brief's item 3 — Astra 2) ----
   His move lands as the date rolls and nothing redraws the page. Typing in the open row redraws the row's editor alone —
   a draw the page does not judge — so the first fix drew the whole editor again for a man by then another squadron's. */
describe('§8 — a redraw of the row\'s own editor judges the row again', () => {
  const rangerLandsUnseen = async (strict = false) => {
    signInAs('saber')
    expect(moveMan(PID.ranger, 'u149'), 'setup: Ranger moves to 149 from tomorrow').toMatchObject({ ok: true })
    const p = panel(strict)
    await p.find(csOf(PID.ranger))
    await p.open(PID.ranger)
    expect(p.$('#accEdName'), 'premise: his whole row is open on 142\'s page').not.toBeNull()
    vi.mocked(HOOKS.toast).mockClear()
    /* the date alone: no focus event and no notify */
    on(16); reload()
    expect(pageUnit('own')).toBe('u142')
    expect(homeOn(PID.ranger, todayIso())).toBe('u149')
    expect(p.$('#accEdName'), 'premise: nothing redrew — the whole row still stands').not.toBeNull()
    return p
  }
  it('typing in the whole row\'s sign-in box after his move landed with no redraw (Astra 2): the whole editor is not drawn again — the row closes, the note once, nothing saved', async () => {
    const was = accountById(ACCT.ranger)!.name
    const p = await rangerLandsUnseen()
    await p.type('#accEdName', 'draft-after-move@mail')
    expect(accountById(ACCT.ranger)!.name).toBe(was)
    expect(WHOLE.filter(id => p.$(id)), 'none of the whole row is drawn for a man by then 149\'s').toEqual([])
    closedWithNote(p, PID.ranger)
    await redraw()
    expect(notesFor(csOf(PID.ranger)), 'still once after a later draw').toBe(1)
  })
  it('the same with every draw run twice (React\'s strict mode, as the app runs): the note is said once', async () => {
    const p = await rangerLandsUnseen(true)
    await p.type('#accEdName', 'draft-after-move@mail')
    closedWithNote(p, PID.ranger)
  })
  it('a squadron line picked in the whole row after his move landed with no redraw: the row closes, the note once', async () => {
    const p = await rangerLandsUnseen()
    await p.pickLine(third.u150, 'none')
    expect(WHOLE.filter(id => p.$(id))).toEqual([])
    closedWithNote(p, PID.ranger)
  })
  it('the short row: Ranger becomes 149\'s own man with no redraw; a line picked in his open short row closes it with the note, and nothing is sent', async () => {
    signInAs('saber')
    expect(moveMan(PID.ranger, 'u149')).toMatchObject({ ok: true })
    signInAs('kestrel')
    const p = panel()
    await p.find(csOf(PID.ranger))
    await p.open(PID.ranger)
    expect(p.$('.acc-edit[data-short="1"]'), 'premise: his short row is open on 149\'s page').not.toBeNull()
    on(16); reload()
    expect(homeOn(PID.ranger, todayIso())).toBe('u149')
    spy.calls.length = 0
    await p.pickLine('u149', 'none')
    expect(spy.calls).toEqual([])
    closedWithNote(p, PID.ranger)
  })
  it('the archived row: typing in its callsign box after his move landed with no redraw closes it with the note', async () => {
    signInAs('saber')
    expect(moveMan(PID.osprey, 'u142')).toMatchObject({ ok: true })
    await pick('u149')
    expect(archivePerson(PID.osprey).bad).toBeNull()
    reload()
    const p = panel()
    await p.openArch(PID.osprey)
    on(16); reload()
    expect(p.$('#accArCs'), 'premise: nothing redrew').not.toBeNull()
    await p.type('#accArCs', 'Zzyx')
    expect(ARCH.filter(id => p.$(id)), 'the archived editor is not drawn again').toEqual([])
    closedWithNote(p, PID.osprey)
  })
})

/* ---- §9 THE OPEN SHORT ROW SHOWS THE LINE HE HOLDS TODAY (the brief's item 4 — the Fable read 4, the Opus read 2) ----
   The short row held his line from the press that opened it. Another admin's change of it, or the signed-in admin's own
   Undo, left the open row showing a line he no longer holds, beside its own second line saying the opposite; and its Save,
   comparing with the old line, sent nothing and said nothing. The row stays open — he is still another squadron's man
   here, on the same page — and is true to today: it holds only what the admin picked. */
describe('§9 — the open short row reads his line on every draw and holds only the admin\'s pick', () => {
  const kestrelOpens = async (pid: string, q: string) => {
    signInAs('kestrel')
    const p = panel()
    await p.find(q)
    await p.open(pid)
    return p
  }
  const stillOpenUnmarked = (p: Panel) => {
    expect(p.$('.acc-edit[data-short="1"]'), 'the row stays open').not.toBeNull()
    expect(p.$('.acc-edit')!.hasAttribute('data-unsaved'), 'nothing is marked as not saved').toBe(false)
    expect(anyRowNote(), 'no note').toBe(0)
  }
  it('Kestrel has Mako\'s short row open, None showing; the master admin gives Mako View of 149; the page redraws (the Fable read 4): the open row shows View', async () => {
    const p = await kestrelOpens(PID.mako, 'Mako')
    expect(p.pressed('u149'), 'premise: None showing').toBe('none')
    expect(asOther('saber', () => saveAccess(ACCT.mako, { grants: { u149: 'view' } })), 'setup: Saber gives Mako View of 149').toBeNull()
    reload()
    await redraw()
    expect(level(ACCT.mako, 'u149'), 'premise: he views 149 now').toBe('view')
    expect(p.sub(PID.mako), 'premise: the row\'s own second line says so').toContain('also views 149')
    expect(p.pressed('u149'), 'the open row shows the line he holds today').toBe('view')
    stillOpenUnmarked(p)
  })
  it('the same, then Save with the row left as it shows (the Fable read 4): what the row showed when Save was pressed is what he holds after it — View; nothing sent', async () => {
    const p = await kestrelOpens(PID.mako, 'Mako')
    expect(asOther('saber', () => saveAccess(ACCT.mako, { grants: { u149: 'view' } }))).toBeNull()
    reload()
    await redraw()
    spy.calls.length = 0
    const shownAtSave = p.$('#accEdSave') ? p.pressed('u149') : null
    if (p.$('#accEdSave')) await p.press('#accEdSave')
    const holds = lineHeld(ACCT.mako, 'u149')
    expect({ shownAtSave, holds }, 'what the row showed as held when Save was pressed is what he holds after it (or the row had closed: null)')
      .toEqual(shownAtSave === null ? { shownAtSave: null, holds } : { shownAtSave: holds, holds })
    expect(shownAtSave, 'the row was open, showing View').toBe('view')
    expect(spy.calls, 'nothing sent — he picked nothing').toEqual([])
    expect(p.noEditor(), 'Save closed the row').toBe(true)
    expect(anyRowNote(), 'no note').toBe(0)
  })
  it('Kestrel takes Ranger\'s View of 149 away, opens his row again (None), presses Undo (the Fable read 4): the View is back, and the open row shows View', async () => {
    const p = await kestrelOpens(PID.ranger, csOf(PID.ranger))
    await p.pickLine('u149', 'none')
    await p.press('#accEdSave')
    expect(level(ACCT.ranger, 'u149'), 'setup: View taken away').toBeNull()
    await p.open(PID.ranger)
    expect(p.pressed('u149'), 'premise: opened again, None showing').toBe('none')
    const u = await act(async () => globalUndo())
    expect(u.ok, 'the Undo went through').toBe(true)
    expect(level(ACCT.ranger, 'u149'), 'premise: his View is back').toBe('view')
    expect(p.pressed('u149'), 'the open row shows the line he holds today').toBe('view')
    stillOpenUnmarked(p)
  })
  /* (the Opus read's proof 2, re-pointed as the brief decides: not "close with the note when the line changed" — the row
     stays, showing today's line, and its Save sends only a pick that differs from it) */
  it('Kestrel\'s short row of Ranger, View showing; Saber ends his View of 149; the page redraws (the Opus read 2, re-pointed): the row shows None, and its Save, nothing picked, sends nothing — never shows View and leaves None', async () => {
    const p = await kestrelOpens(PID.ranger, csOf(PID.ranger))
    expect(p.pressed('u149'), 'premise: the short row, View of 149 pressed').toBe('view')
    expect(asOther('saber', () => saveAccess(ACCT.ranger, { grants: { u149: 'none' } })), 'setup: Saber ends Ranger\'s View of 149').toBeNull()
    reload()
    await redraw()
    const shownAfter = p.pressed('u149')
    expect(shownAfter, 'the open row shows the line as saved now').toBe('none')
    expect(p.sub(PID.ranger), 'and agrees with its own second line').not.toContain('also views')
    stillOpenUnmarked(p)
    spy.calls.length = 0
    await p.press('#accEdSave')
    reload()
    expect({ shownAfter, savedAfter: level(ACCT.ranger, 'u149') }, 'never shows View and leaves None')
      .not.toEqual({ shownAfter: 'view', savedAfter: null })
    expect(spy.calls, 'nothing sent').toEqual([])
    expect(level(ACCT.ranger, 'u149'), 'he holds nothing of 149, as the row showed').toBeNull()
  })
  it('after another admin\'s change the row\'s Save sends the admin\'s own pick, and only that: Saber ends Ranger\'s View; Kestrel picks View again and saves — one call, 149\'s line alone', async () => {
    const p = await kestrelOpens(PID.ranger, csOf(PID.ranger))
    expect(asOther('saber', () => saveAccess(ACCT.ranger, { grants: { u149: 'none' } }))).toBeNull()
    reload()
    await redraw()
    spy.calls.length = 0
    await p.pickLine('u149', 'view')
    expect(p.$('.acc-edit')!.getAttribute('data-unsaved'), 'a pick that differs from the line he holds is marked').toBe('true')
    await p.press('#accEdSave')
    expect(spy.calls, 'one call: grants alone, holding 149').toEqual([[ACCT.ranger, { grants: { u149: 'view' } }]])
    expect(level(ACCT.ranger, 'u149'), 'he views 149 again').toBe('view')
  })
  it('a pick that another admin\'s change has already made true is no longer a change: Kestrel picks None while View stands (marked); Saber ends the View; the mark goes, and Save sends nothing', async () => {
    const p = await kestrelOpens(PID.ranger, csOf(PID.ranger))
    await p.pickLine('u149', 'none')
    expect(p.$('.acc-edit')!.getAttribute('data-unsaved'), 'premise: marked as not saved').toBe('true')
    expect(asOther('saber', () => saveAccess(ACCT.ranger, { grants: { u149: 'none' } }))).toBeNull()
    reload()
    await redraw()
    expect(p.pressed('u149'), 'the row shows his pick, None').toBe('none')
    stillOpenUnmarked(p)
    spy.calls.length = 0
    await p.press('#accEdSave')
    expect(spy.calls, 'nothing sent').toEqual([])
    expect(p.noEditor()).toBe(true)
  })
  it('Save reads the line he holds once more, for a press with no redraw: Kestrel picks View for Mako; Saber gives Mako View with nothing redrawn; Save sends nothing', async () => {
    const p = await kestrelOpens(PID.mako, 'Mako')
    await p.pickLine('u149', 'view')
    expect(p.$('.acc-edit')!.getAttribute('data-unsaved'), 'premise: marked as not saved').toBe('true')
    expect(asOther('saber', () => saveAccess(ACCT.mako, { grants: { u149: 'view' } }))).toBeNull()
    reload()
    expect(level(ACCT.mako, 'u149'), 'premise: he views 149 now').toBe('view')
    expect(p.$('.acc-edit')!.getAttribute('data-unsaved'), 'premise: nothing redrew — the row still shows his pick as a change').toBe('true')
    spy.calls.length = 0
    await p.press('#accEdSave')
    expect(spy.calls, 'he holds View already: nothing sent').toEqual([])
    expect(level(ACCT.mako, 'u149')).toBe('view')
    expect(p.noEditor(), 'the row closed').toBe(true)
    expect(anyRowNote(), 'no note').toBe(0)
  })
})

/* ---- §10 THE NOTE IS OWED WHENEVER HE DID NOT PICK (the brief's item 5 — the Opus read 1, Astra 3, the Fable read 5) ----
   The first fix told his own pick from a change under him by one sign: "is the page's squadron still the one the row
   opened on?". But the page's squadron also changes with no pick of his — his Plan of the squadron picked taken away or
   lowered by a master admin, or his own move landing at midnight — and each closed his open row, dropped what he had
   typed, and said nothing. */
describe('§10 — the page\'s squadron changes under an open row with no pick of his: the note is owed', () => {
  /* Hunter (142's admin, Plan of 149) has picked 149; on 149's page Osprey's whole row is open, a rename typed in it */
  const hunterOn149 = async () => {
    signInAs('hunter')
    await pick('u149')
    expect(pageUnit('own'), 'premise: Hunter\'s page is 149\'s (his Plan)').toBe('u149')
    const p = panel()
    await p.find(csOf(PID.osprey))
    await p.open(PID.osprey)
    expect(p.$('#accEdName'), 'premise: Osprey\'s whole row is open on 149\'s page').not.toBeNull()
    await p.type('#accEdName', 'typed@mail')
    vi.mocked(HOOKS.toast).mockClear()
    return p
  }
  it('a master admin takes Hunter\'s Plan of 149 away (the Fable read 5, the Opus read 1): the app puts him back on 142; his open row closes — with the note, once', async () => {
    const p = await hunterOn149()
    expect(asOther('saber', () => saveAccess(ACCT.hunter, { grants: { u149: 'none' } })), 'setup: Saber takes Hunter\'s Plan of 149 away').toBeNull()
    reload()
    expect(UNIT, 'premise: nobody picked — 149 is still the squadron in view until the app itself notices').toBe('u149')
    expect(p.$('#accEdName'), 'premise: nothing has redrawn yet').not.toBeNull()
    await redraw()
    expect(pageUnit('own'), 'the app put his page back on his own squadron').toBe('u142')
    expect(p.noEditor(), 'his open row closed, what he typed dropped').toBe(true)
    expect(notesFor(csOf(PID.osprey)), 'closed with no pick of his: the note, once').toBe(1)
    await redraw()
    expect(notesFor(csOf(PID.osprey)), 'still once after a later draw').toBe(1)
  })
  it('a master admin lowers Hunter\'s Plan of 149 to View (the Fable read 5): 149 stays in view, his own pages go back to 142; his open row closes — with the note, once', async () => {
    const p = await hunterOn149()
    expect(asOther('saber', () => saveAccess(ACCT.hunter, { grants: { u149: 'view' } })), 'setup: Saber lowers Hunter\'s Plan of 149 to View').toBeNull()
    reload()
    await redraw()
    expect(pageUnit('own'), 'his own pages are 142\'s again (a View holder\'s are his home\'s)').toBe('u142')
    expect(p.noEditor(), 'his open row closed, what he typed dropped').toBe(true)
    expect(notesFor(csOf(PID.osprey)), 'closed with no pick of his: the note, once').toBe(1)
  })
  it('Hunter\'s own move to 150 lands at midnight while Ranger\'s whole row is open on 142\'s page, a rename typed (the Fable read 5): the app takes him to 150; the row closes — with the note, once', async () => {
    signInAs('saber')
    expect(moveMan(PID.hunter, third.u150), 'setup: Hunter moves to 150 from tomorrow').toMatchObject({ ok: true })
    signInAs('hunter')
    expect(pageUnit('own'), 'premise: today his page is 142\'s').toBe('u142')
    const p = panel()
    await p.find(csOf(PID.ranger))
    await p.open(PID.ranger)
    expect(p.$('#accEdName'), 'premise: Ranger\'s whole row is open').not.toBeNull()
    await p.type('#accEdName', 'typed@mail')
    vi.mocked(HOOKS.toast).mockClear()
    /* the app's own midnight wake (leavewar/sync.ts installPostingClock) — no pick, no press */
    await act(async () => { pastMidnight() })
    expect(homeOn(PID.hunter, todayIso()), 'the move day: Hunter is 150\'s').toBe(third.u150)
    expect(pageUnit('own'), 'the app took his page to 150').toBe(third.u150)
    expect(p.noEditor(), 'his open row closed, what he typed dropped').toBe(true)
    expect(notesFor(csOf(PID.ranger)), 'closed with no pick of his: the note, once').toBe(1)
  })
  it('a master admin\'s own move lands at midnight while he has Ranger\'s whole row open, a rename typed (Astra 3): the app follows him to 150; the row closes, nothing saved — with the note, once, and not again at the next draw', async () => {
    /* a second master admin saves Saber's move through the real doors */
    signInAs('saber')
    expect(saveAccess(ACCT.kestrel, { master: true })).toBeNull()
    signInAs('kestrel')
    expect(moveMan(PID.saber, third.u150)).toMatchObject({ ok: true })
    signInAs('saber')
    const was = accountById(ACCT.ranger)!.name
    const p = panel()
    expect(pageUnit('own')).toBe('u142')
    await p.find(csOf(PID.ranger))
    await p.open(PID.ranger)
    await p.type('#accEdName', 'unsaved-before-midnight@mail')
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => { pastMidnight() })
    expect(homeOn(PID.saber, todayIso())).toBe(third.u150)
    expect(pageUnit('own')).toBe(third.u150)
    expect(p.noEditor()).toBe(true)
    expect(accountById(ACCT.ranger)!.name).toBe(was)
    expect(notesFor(csOf(PID.ranger)), 'an automatic change must explain the discarded draft').toBe(1)
    await redraw()
    expect(notesFor(csOf(PID.ranger)), 'another draw must not repeat the notice').toBe(1)
  })
  it('pin: Hunter (View of 150 only) picks 150 with Ranger\'s whole row open on 142\'s page (the Fable read\'s soundness test): his own pages stay 142\'s, so the row stays open, no note', async () => {
    signInAs('hunter')
    const p = panel()
    await p.find(csOf(PID.ranger))
    await p.open(PID.ranger)
    await pick(third.u150)
    expect(pageUnit('own')).toBe('u142')
    expect(p.$('#accEdName'), 'still open').not.toBeNull()
    expect(anyRowNote()).toBe(0)
  })
  /* A ROW THAT SURVIVED A VIEW-ONLY PICK, CLOSED LATER WITH NO PICK. "Did he pick?" is read from the app's own record
     (state/typing-hold.ts enteredByPick) with the squadron in view the row was last judged on. Held from the press alone,
     the pick of 150 he made earlier — which did not close the row — would be taken for the cause when the page later
     becomes 150's by another road, and the row would close without a word (the brief's "one rare case"). The page holds
     the squadron in view again on every draw the row survives, so that earlier pick is not counted twice. */
  it('Hunter\'s row of Ranger survives his View-only pick of 150; then his own move to 150 lands at midnight: the row closes — with the note, once (he did not pick then)', async () => {
    signInAs('saber')
    expect(moveMan(PID.hunter, third.u150), 'setup: Hunter moves to 150 from tomorrow').toMatchObject({ ok: true })
    signInAs('hunter')
    const p = panel()
    await p.find(csOf(PID.ranger))
    await p.open(PID.ranger)
    await pick(third.u150)
    expect(pageUnit('own'), 'premise: a View-only pick — his own pages stay 142\'s').toBe('u142')
    expect(p.$('#accEdName'), 'premise: the row survived the pick').not.toBeNull()
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => { pastMidnight() })
    expect(homeOn(PID.hunter, todayIso()), 'the move day: Hunter is 150\'s').toBe(third.u150)
    expect(pageUnit('own'), 'his page is 150\'s now').toBe(third.u150)
    expect(p.noEditor(), 'the row closed').toBe(true)
    expect(notesFor(csOf(PID.ranger)), 'closed with no pick of his at that moment: the note, once').toBe(1)
  })
  it('Hunter\'s row of Ranger survives his View-only pick of 150; then a master admin gives him Plan of 150: his page becomes 150\'s and the row closes — with the note, once', async () => {
    signInAs('hunter')
    const p = panel()
    await p.find(csOf(PID.ranger))
    await p.open(PID.ranger)
    await pick(third.u150)
    expect(pageUnit('own')).toBe('u142')
    expect(p.$('#accEdName'), 'premise: the row survived the pick').not.toBeNull()
    vi.mocked(HOOKS.toast).mockClear()
    expect(asOther('saber', () => saveAccess(ACCT.hunter, { grants: { [third.u150]: 'plan' } })), 'setup: Saber gives Hunter Plan of 150').toBeNull()
    reload()
    await redraw()
    expect(pageUnit('own'), 'his page is 150\'s now (his Plan of the squadron in view)').toBe(third.u150)
    expect(p.noEditor(), 'the row closed').toBe(true)
    expect(notesFor(csOf(PID.ranger)), 'closed with no pick of his at that moment: the note, once').toBe(1)
  })
})

/* ---- §11 WHAT THE FABLE READ PRESSED ON AND FOUND SOUND, kept so it stays so (its proof 0; the tests of it that the
   step's own tests did not already hold — the rest are the pins of §6, §7 and §10 above) ---- */
describe('§11 — pins: the note once, and nothing of his sign-in readable from a short row', () => {
  it('pin: strict mode (every draw run twice): Osprey\'s whole row open, his move lands and the page redraws — closed, the note once', async () => {
    signInAs('saber')
    expect(moveMan(PID.osprey, 'u142')).toMatchObject({ ok: true })
    signInAs('kestrel')
    const p = panel(true)
    await p.find(csOf(PID.osprey))
    await p.open(PID.osprey)
    on(16); reload()
    await redraw()
    await redraw()
    expect(p.noEditor(), 'closed').toBe(true)
    expect(notesFor(csOf(PID.osprey)), 'once').toBe(1)
  })
  it('pin: the app\'s own midnight wake (no notify by the test): the whole row closes and the note is said once', async () => {
    signInAs('saber')
    expect(moveMan(PID.osprey, 'u142')).toMatchObject({ ok: true })
    signInAs('kestrel')
    const p = panel()
    await p.find(csOf(PID.osprey))
    await p.open(PID.osprey)
    expect(p.$('#accEdName'), 'premise: whole').not.toBeNull()
    await act(async () => { pastMidnight() })
    expect(homeOn(PID.osprey, todayIso())).toBe('u142')
    expect(p.noEditor(), 'closed by the wake\'s own redraw').toBe(true)
    expect(notesFor(csOf(PID.osprey)), 'once').toBe(1)
  })
  it('pin: Kestrel on 149 — Ranger renamed and suspended by 142\'s admin: his row, closed and opened, reads character for character as before, and the page never holds his sign-in name', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.find(csOf(PID.ranger))
    const closedBefore = p.rowOf(PID.ranger)!.outerHTML
    await p.open(PID.ranger)
    const openBefore = p.rowOf(PID.ranger)!.outerHTML
    await p.press('#accEdCancel')
    expect(asOther('hunter', () => updateAccount(ACCT.ranger, { name: 'zebra.quagga@mail' })), 'setup: renamed by 142\'s admin').toBeNull()
    expect(asOther('hunter', () => updateAccount(ACCT.ranger, { on: false })), 'setup: suspended by 142\'s admin').toBeNull()
    reload()
    await redraw()
    expect(p.html().includes('zebra.quagga'), 'his sign-in name nowhere on the page').toBe(false)
    expect(p.rowOf(PID.ranger)!.outerHTML, 'the closed row the same, suspended or not').toBe(closedBefore)
    await p.open(PID.ranger)
    expect(p.rowOf(PID.ranger)!.outerHTML, 'the opened row the same, suspended or not').toBe(openBefore)
    expect(p.html().includes('zebra.quagga')).toBe(false)
  })
  it('pin: Saber on 142 with the Squadron tick 149 (the grouped list): Osprey is a short row, opened to one line — 142\'s; a pick closes it, no note', async () => {
    signInAs('saber')
    const p = panel()
    await p.press('#accFilter')
    await p.press('[data-ftick="sqn:u149"]')
    const row = p.rowOf(PID.osprey)
    expect(row, 'listed under 149\'s heading').not.toBeNull()
    expect(row!.querySelector('.acc-main b'), 'no sign-in name').toBeNull()
    expect(p.$(`[data-testid="dot-signin-${PID.osprey}"]`), 'no dot').toBeNull()
    await p.open(PID.osprey)
    expect(p.$('#accEdName'), 'no sign-in box').toBeNull()
    expect(p.lineUnits(), 'one line, the page\'s').toEqual(['u142'])
    await pick('u149')
    expect(p.noEditor(), 'closed at the pick').toBe(true)
    expect(anyRowNote(), 'no note at his own pick').toBe(0)
  })
})
