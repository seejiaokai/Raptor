// @vitest-environment jsdom
/* ADMIN → USERS ACROSS SQUADRONS — STEP U1'S FIX: AN OPEN ROW IS JUDGED AGAIN ON EVERY DRAW (the brief
   docs/superpowers/briefs/2026-11-26-msq-s2-u1fix-brief.md; the plan §21.2's "Step 0" block, row Q13, and §19.1).
   U1 judged a row once, when it was opened. Two blind readers of U1 (chat 199 — a fresh Opus, F1 and F2; the security
   reader, A1–A7) proved that a row opened WHOLE on the man's own squadron's page stayed the whole editor after the page's
   squadron changed by a pick, or after his move landed with no pick at all; and a SHORT row held across a pick showed the
   old squadron's line under the new page. Their proofs are kept here as lasting tests (§1, §2), each seen failing on U1's
   code first; then the belt at the head of the whole row's every write (§3) and the note's rule (§4), written red first
   too; then two as-built pins of what this fix does not touch (§5).
   THE RULE: the page holds, for every open row, the squadron it opened on and whether it opened whole or short. On every
   draw the open row is judged again; if the judgement differs, the row closes and nothing typed is carried over. Closed by
   the signed-in admin's own pick: no note. Closed by a change under it with no pick (a move landing, an Undo, another's
   change): the passing note "<Callsign>’s row changed while it was open, so nothing was saved. Open it again.", once.
   The world: three squadrons (withThird — his D2630), Wed 15 Jul 26, 09:00. Hunter — 142's admin, Plan of 149, View of
   150; Saber — master admin, home 142; Ranger — 142's member, View of 149 and of 150; Kestrel — 149's admin; Osprey —
   149's member; Mako — 150's own admin. */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { withThird, third, signInAs, PID, ACCT, moveMan, on } from '../test-support/msq-world'
import { UsersPanel } from './UsersPanel'
import { useVersion } from './useStore'
import { accountById, accountOfPid, accountsLoad, updateAccount, saveAccess } from '../state/accounts'
import { unitsLoad, todayIso, homeOn, setUnitSeeds } from '../state/units'
import { pickSquadron } from '../state/pick'
import { pageUnit } from '../state/perms'
import { PEOPLE } from '../engine/people'
import { rosterOf } from '../engine/roster'
import { HOOKS } from '../engine/hooks'
import { notify } from '../state/store'
import { globalUndo } from '../undo/timeline'
import { archivePerson } from '../leavewar/sync'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

/* A SPY ON THE ONE DOOR: every call of state/accounts.ts saveAccess is recorded, and passed to the real door */
const spy = vi.hoisted(() => ({ calls: [] as unknown[][] }))
vi.mock('../state/accounts', async importOriginal => {
  const real = await importOriginal<typeof import('../state/accounts')>()
  return { ...real, saveAccess: (...a: Parameters<typeof real.saveAccess>) => { spy.calls.push(a); return real.saveAccess(...a) } }
})

withThird()
afterEach(() => cleanup())

const reload = () => { unitsLoad(); accountsLoad() }
const P = (pid: string): any => (PEOPLE as any)[pid]
/* the passing note of his D2730 Q13, word for word as U1's short row already raises it */
const noteFor = (cs: string) => `${cs}’s row changed while it was open, so nothing was saved. Open it again.`
const notesFor = (cs: string) => vi.mocked(HOOKS.toast).mock.calls.filter(c => c[0] === noteFor(cs)).length
/* a man on a squadron's roster with no sign-in */
const noSignIn = (unit: string): string => {
  const pid = rosterOf(unit, todayIso()).find(id => { const x = P(id); return x && !x.special && !x.archived && !x.deleted && !accountOfPid(id) })
  if (!pid) throw new Error(`the world has no ${unit} man without a sign-in`)
  return pid
}

/* the page redraws on the store's version, as AdminPage does around it */
function Live() { useVersion(); return <UsersPanel shown /> }
function panel() {
  const page = render(<Live />)
  const $ = (sel: string) => page.container.querySelector(sel) as HTMLElement | null
  const $$ = (sel: string) => [...page.container.querySelectorAll<HTMLElement>(sel)]
  const rowOf = (pid: string) => $(`[data-testid="acc-groups"] .acc-row[data-person="${pid}"]`)
  const open = async (pid: string) => { await act(async () => { fireEvent.click(rowOf(pid)!.querySelector('.acc-tap')!) }) }
  const find = async (q: string) => { await act(async () => { fireEvent.change($('#accFind')!, { target: { value: q } }) }) }
  const lineUnits = () => $$('[data-testid="acc-sq"] .acc-sq-n').map(n => n.dataset.unit)
  const lineNums = () => $$('[data-testid="acc-sq"] .acc-sq-n').map(n => n.textContent)
  const pickLine = async (unit: string, v: string) => {
    const n = $(`[data-testid="acc-sq"] .acc-sq-n[data-unit="${unit}"]`)!
    await act(async () => { fireEvent.click((n.nextElementSibling as HTMLElement).querySelector(`[data-line="${v}"]`)!) })
  }
  const press = async (sel: string) => { await act(async () => { fireEvent.click($(sel)!) }) }
  const type = async (sel: string, v: string) => { await act(async () => { fireEvent.change($(sel)!, { target: { value: v } }) }) }
  return { $, $$, rowOf, open, find, lineUnits, lineNums, pickLine, press, type, html: () => page.container.innerHTML }
}
const pick = async (u: string) => { await act(async () => { await pickSquadron(u) }) }
const WHOLE = ['#accEdName', '#accEdRole', '#accEdOnOff', '#accEdArchive', '#accEdDel']

/* ---- §1 THE OPUS READER'S PROOFS (F1, F2) ---- */
describe('§1 — a row opened on one squadron\'s page is not carried onto another\'s by a pick (the Opus read, F1 and F2)', () => {
  for (const who of ['saber', 'hunter'] as const) {
    it(`${who}: Ranger's whole row opened on 142's page, then 149 picked — on 149's page his row is not the whole editor, and nothing of his sign-in can be sent from there`, async () => {
      signInAs(who)
      const p = panel()
      await p.find(String(P(PID.ranger).cs))
      await p.open(PID.ranger)
      expect(p.$('#accEdName'), 'premise: the whole row on 142').not.toBeNull()
      await pick('u149')
      expect(p.$(`[data-testid="sqn-${PID.ranger}"]`)?.textContent, 'premise: on 149\'s page he is 142\'s').toBe('142')
      if (p.$('#accEdName')) {
        await p.type('#accEdName', 'leak@mail')
        await p.press('#accEdSave')
      }
      expect(p.$('#accEdName'), 'no sign-in box on another squadron\'s page').toBeNull()
      expect(accountById(ACCT.ranger)!.name, 'his sign-in never sent from another squadron\'s page').not.toBe('leak@mail')
    })
  }
  it('Saber opens Ranger\'s short row on 149\'s page, then picks 142 (Ranger\'s own): on 142\'s page his row is the whole row (dots drawn), never 149\'s one line', async () => {
    signInAs('saber')
    await pick('u149')
    const p = panel()
    await p.find(String(P(PID.ranger).cs))
    await p.open(PID.ranger)
    expect(p.lineUnits(), 'premise: one line, 149').toEqual(['u149'])
    await pick('u142')
    expect(p.$(`[data-testid="dot-signin-${PID.ranger}"]`), 'his own squadron\'s page: the whole row, dots drawn').not.toBeNull()
    expect(p.lineUnits(), 'no 149 line left standing on 142\'s page').not.toContain('u149')
  })
  it('Saber opens Ranger\'s short row on 149\'s page, then picks 150: 150\'s page never shows his 149 line', async () => {
    signInAs('saber')
    await pick('u149')
    const p = panel()
    await p.find(String(P(PID.ranger).cs))
    await p.open(PID.ranger)
    await pick(third.u150)
    expect(p.lineUnits(), 'on 150\'s page, no 149 line').not.toContain('u149')
  })
})

/* ---- §2 THE SECURITY READER'S PROOFS (A1–A7) ---- */
describe('§2 — a whole row is never left standing for another squadron\'s man (the security read, A1–A7)', () => {
  it('A1 Saber: Ranger\'s whole row opened on 142\'s page, then 149 picked — on 149\'s page none of the whole row\'s controls, no sign-in name, no Sign-in dot', async () => {
    signInAs('saber')
    const p = panel()
    await p.find(String(P(PID.ranger).cs))
    await p.open(PID.ranger)
    expect(p.$('#accEdName'), 'premise: on 142\'s page his row is whole').not.toBeNull()
    await pick('u149')
    expect(pageUnit('own'), 'premise: the page is 149\'s now').toBe('u149')
    expect(p.rowOf(PID.ranger), 'premise: he is still on the page (the search stays)').not.toBeNull()
    expect(p.$(`[data-testid="sqn-${PID.ranger}"]`)?.textContent, 'premise: he wears 142 — another squadron\'s man here').toBe('142')
    expect(WHOLE.filter(id => p.$(id)), 'none of the whole row\'s controls is drawn on 149\'s page').toEqual([])
    expect(p.rowOf(PID.ranger)!.querySelector('.acc-main b'), 'no sign-in name on 149\'s page').toBeNull()
    expect(p.$(`[data-testid="dot-signin-${PID.ranger}"]`), 'no Sign-in dot on 149\'s page').toBeNull()
  })

  it('A2 Saber, no search at all: Hunter\'s whole row opened on 142\'s page, then 149 picked — listed there as a Plan holder, he is never the whole row', async () => {
    signInAs('saber')
    const p = panel()
    await p.open(PID.hunter)
    expect(p.$('#accEdName'), 'premise: whole on 142\'s page').not.toBeNull()
    await pick('u149')
    expect(p.rowOf(PID.hunter), 'premise: Hunter is listed on 149\'s page (he plans 149)').not.toBeNull()
    expect(WHOLE.filter(id => p.$(id)), 'none of the whole row\'s controls is drawn on 149\'s page').toEqual([])
    expect(p.lineNums(), 'if open at all: one line, 149\'s').toEqual(p.$('.acc-edit') ? ['149'] : [])
  })

  /* (the proof as the reader wrote it held "his row is open on 149's page" as its premise — the fault itself; so the
     lasting test holds the rule instead: the pick closes it, and the row opened again there is the short row, whose Save
     sends 149's line alone after an Undo of the rename. Its first form was seen failing on U1's code, on the Save's call:
     the whole row sent `{ grants, name }`.) */
  it('A3 Saber: the pick closes the row; opened again on 149\'s page it is the short row, and after an Undo of the rename its Save sends 149\'s line alone — never his sign-in name', async () => {
    signInAs('saber')
    const was = accountById(ACCT.ranger)!.name
    const p = panel()
    await p.find(String(P(PID.ranger).cs))
    await p.open(PID.ranger)
    await p.type('#accEdName', 'renamed@mail')
    await p.press('#accEdSave')
    expect(accountById(ACCT.ranger)!.name, 'setup: the rename saved').toBe('renamed@mail')
    await p.open(PID.ranger)
    await pick('u149')
    expect(pageUnit('own')).toBe('u149')
    expect(p.rowOf(PID.ranger)?.querySelector('.acc-edit'), 'the pick closed his row').toBeNull()
    await p.open(PID.ranger)
    expect(p.$('#accEdName'), 'opened again on 149\'s page: the short row').toBeNull()
    const u = await act(async () => globalUndo())
    expect(u.ok, 'the Undo went through').toBe(true)
    expect(accountById(ACCT.ranger)!.name, 'the rename taken back').toBe(was)
    spy.calls.length = 0
    await p.pickLine('u149', 'none')
    await p.press('#accEdSave')
    expect(spy.calls, 'one call: grants alone, holding 149').toEqual([[ACCT.ranger, { grants: { u149: 'none' } }]])
    expect(accountById(ACCT.ranger)!.name, 'his sign-in name the one the Undo left').toBe(was)
  })

  it('A4 Hunter (142\'s admin, Plan of 149): nothing on 149\'s page suspends a 142 man whose row was opened on 142\'s', async () => {
    signInAs('hunter')
    const p = panel()
    await p.find(String(P(PID.ranger).cs))
    await p.open(PID.ranger)
    await pick('u149')
    expect(pageUnit('own')).toBe('u149')
    expect(accountById(ACCT.ranger)!.on, 'premise: he can sign in').toBe(true)
    const onOff = p.$('#accEdOnOff') as HTMLButtonElement | null
    if (onOff && !onOff.disabled) await p.press('#accEdOnOff')
    reload()
    expect(accountById(ACCT.ranger)!.on, 'nothing on 149\'s page suspends a 142 man').toBe(true)
  })

  it('A5 Kestrel (149\'s admin, no right in 142): Osprey\'s whole row is open when his move to 142 lands — the whole row, his sign-in name and his dots do not stay on 149\'s page', async () => {
    signInAs('saber')
    expect(moveMan(PID.osprey, 'u142'), 'setup: Osprey moves to 142 from tomorrow').toMatchObject({ ok: true })
    signInAs('kestrel')
    const p = panel()
    await p.find(String(P(PID.osprey).cs))
    await p.open(PID.osprey)
    expect(p.$('#accEdName'), 'premise: today he is 149\'s, his row whole').not.toBeNull()
    on(16); reload()
    expect(homeOn(PID.osprey, todayIso()), 'the move day: he is 142\'s').toBe('u142')
    await act(async () => { notify() })
    expect(pageUnit('own'), 'premise: Kestrel\'s page is still 149\'s').toBe('u149')
    expect(p.rowOf(PID.osprey), 'premise: he is still found by the search, as another squadron\'s man').not.toBeNull()
    expect(p.$(`[data-testid="sqn-${PID.osprey}"]`)?.textContent, 'premise: he wears 142').toBe('142')
    expect(WHOLE.filter(id => p.$(id)), 'none of the whole row\'s controls is drawn for a 142 man on 149\'s page').toEqual([])
    expect(p.rowOf(PID.osprey)!.querySelector('.acc-main b'), 'no sign-in name').toBeNull()
    expect(p.$(`[data-testid="dot-signin-${PID.osprey}"]`), 'no Sign-in dot (it would go on showing whether he is suspended)').toBeNull()
  })

  it('A6 Kestrel had Osprey\'s whole row open across his move to 142; 142\'s admin then renames his sign-in and suspends him — neither can be read on 149\'s page', async () => {
    signInAs('saber')
    expect(moveMan(PID.osprey, 'u142'), 'setup: Osprey moves to 142 from tomorrow').toMatchObject({ ok: true })
    signInAs('kestrel')
    const p = panel()
    await p.find(String(P(PID.osprey).cs))
    await p.open(PID.osprey)
    on(16); reload()
    expect(homeOn(PID.osprey, todayIso()), 'the move day: he is 142\'s').toBe('u142')
    signInAs('hunter')
    expect(updateAccount(ACCT.osprey, { name: 'zebra.quagga@mail' }), 'setup: Hunter (142\'s admin) renames his sign-in').toBeNull()
    expect(updateAccount(ACCT.osprey, { on: false }), 'setup: Hunter suspends him').toBeNull()
    reload()
    signInAs('kestrel')
    await act(async () => { notify() })
    expect(pageUnit('own'), 'premise: Kestrel\'s page is 149\'s').toBe('u149')
    expect(p.rowOf(PID.osprey), 'premise: his row is still on 149\'s page').not.toBeNull()
    expect({
      newSignInNameReadable: p.html().includes('zebra.quagga@mail'),
      signInDotSays: p.$(`[data-testid="dot-signin-${PID.osprey}"]`)?.getAttribute('title') ?? null,
    }, 'neither his new sign-in name, set by 142\'s admin, nor whether 142 has suspended him is readable on 149\'s page')
      .toEqual({ newSignInNameReadable: false, signInDotSays: null })
  })

  it('A7 Saber: a 142 man with no sign-in, his whole row opened on 142\'s page, then 149 picked — no "Give sign-in" on 149\'s page', async () => {
    signInAs('saber')
    const pid = noSignIn('u142')
    const p = panel()
    await p.find(String(P(pid).cs))
    await p.open(pid)
    expect(p.$('#accGive'), 'premise: on 142\'s page his row offers Give sign-in').not.toBeNull()
    await pick('u149')
    expect(pageUnit('own')).toBe('u149')
    expect(p.rowOf(pid), 'premise: still found on 149\'s page').not.toBeNull()
    expect(['#accGive', '#accGiveName', '#accGiveRole', '#accEdArchive', '#accEdDel'].filter(id => p.$(id)), 'none of it on 149\'s page').toEqual([])
  })
})

/* ---- §3 THE BELT: at the head of every write the whole row makes ----
   His move lands as the date rolls past its day, and nothing redraws the page: the whole row still stands, every
   control live. Saber, a master admin, is the one signed in, so the doors would let every one of these writes through —
   only the row's own judging again stops them. Ranger (142's member) and a 142 man with no sign-in, each moved to 149
   from the 16th; Saber on 142's page; the clock rolled to the 16th with no redraw. */
describe('§3 — the whole row judges itself again at each of its five writes', () => {
  const landUnseen = async (pid: string, prep?: (p: ReturnType<typeof panel>) => Promise<void>) => {
    signInAs('saber')
    expect(moveMan(pid, 'u149'), 'setup: moved to 149 from tomorrow').toMatchObject({ ok: true })
    const p = panel()
    await p.find(String(P(pid).cs))
    await p.open(pid)
    if (prep) await prep(p)
    on(16); reload()
    expect(homeOn(pid, todayIso()), 'the move day: he is 149\'s').toBe('u149')
    expect(pageUnit('own'), 'Saber\'s page is still 142\'s').toBe('u142')
    expect(p.$('#accEdArchive'), 'premise: nothing redrew — the whole row still stands').not.toBeNull()
    spy.calls.length = 0
    return p
  }
  const closedWithNote = (p: ReturnType<typeof panel>, pid: string) => {
    expect(p.rowOf(pid)?.querySelector('.acc-edit') ?? null, 'the row closed').toBeNull()
    expect(notesFor(String(P(pid).cs)), 'the note, once').toBe(1)
    expect(HOOKS.toast).toHaveBeenLastCalledWith(noteFor(String(P(pid).cs)), 'warn')
  }

  it('Save: a rename typed before the move landed is not sent; the note names him; the row closes', async () => {
    const was = accountById(ACCT.ranger)!.name
    const p = await landUnseen(PID.ranger, async q => { await q.type('#accEdName', 'belt@mail') })
    await p.press('#accEdSave')
    expect(spy.calls, 'nothing sent through the one Save').toEqual([])
    reload()
    expect(accountById(ACCT.ranger)!.name, 'his sign-in name unchanged').toBe(was)
    closedWithNote(p, PID.ranger)
  })
  it('Suspend: he is not suspended; the note; the row closes', async () => {
    const p = await landUnseen(PID.ranger)
    await p.press('#accEdOnOff')
    reload()
    expect(accountById(ACCT.ranger)!.on, 'he can still sign in').toBe(true)
    closedWithNote(p, PID.ranger)
  })
  it('Give sign-in: no sign-in is made; the note; the row closes', async () => {
    const pid = noSignIn('u142')
    const p = await landUnseen(pid, async q => { await q.type('#accGiveName', 'given@mail') })
    expect(p.$('#accGive'), 'premise: Give sign-in still drawn').not.toBeNull()
    await p.press('#accGive')
    reload()
    expect(accountOfPid(pid), 'no sign-in made for him').toBeUndefined()
    closedWithNote(p, pid)
  })
  it('Archive: he is not archived; the note; the row closes', async () => {
    const p = await landUnseen(PID.ranger)
    await p.press('#accEdArchive')
    expect(!!P(PID.ranger).archived, 'not archived').toBe(false)
    closedWithNote(p, PID.ranger)
  })
  it('Delete, armed before the move landed: the second tap deletes nothing; the note; the row closes', async () => {
    const p = await landUnseen(PID.ranger, async q => { await q.press('#accEdDel') })
    expect(p.$('#accEdDelNote'), 'premise: Delete armed').not.toBeNull()
    await p.press('#accEdDel')
    expect(!!P(PID.ranger).deleted, 'not deleted').toBe(false)
    expect(accountById(ACCT.ranger), 'his account still there').toBeTruthy()
    closedWithNote(p, PID.ranger)
  })
})

/* ---- §4 THE NOTE: once, and only for a change with no pick ---- */
describe('§4 — the row closes on a change under it; the note only when he did not pick', () => {
  it('Kestrel has Osprey\'s whole row open, a rename typed; his move to 142 lands and the page redraws: the row closes, the note once, nothing sent; later draws say nothing more', async () => {
    signInAs('saber')
    expect(moveMan(PID.osprey, 'u142')).toMatchObject({ ok: true })
    signInAs('kestrel')
    const was = accountById(ACCT.osprey)!.name
    const p = panel()
    await p.find(String(P(PID.osprey).cs))
    await p.open(PID.osprey)
    await p.type('#accEdName', 'typed@mail')
    on(16); reload()
    spy.calls.length = 0
    await act(async () => { notify() })
    const cs = String(P(PID.osprey).cs)
    expect(p.rowOf(PID.osprey)?.querySelector('.acc-edit') ?? null, 'the row closed').toBeNull()
    expect(notesFor(cs), 'the note, once').toBe(1)
    await act(async () => { notify() })
    await act(async () => { notify() })
    expect(notesFor(cs), 'still once after later draws').toBe(1)
    expect(spy.calls, 'nothing sent').toEqual([])
    expect(accountById(ACCT.osprey)!.name, 'nothing typed was saved').toBe(was)
    /* opened again it starts from what is saved — nothing typed carried over — and it is the short row now */
    await p.open(PID.osprey)
    expect(p.$('#accEdName'), 'the short row now').toBeNull()
  })
  it('Saber opens Ranger\'s whole row on 142\'s page and picks 149: the row closes, and no note — the pick was his own', async () => {
    signInAs('saber')
    const p = panel()
    await p.find(String(P(PID.ranger).cs))
    await p.open(PID.ranger)
    await pick('u149')
    expect(p.rowOf(PID.ranger)?.querySelector('.acc-edit') ?? null, 'the row closed').toBeNull()
    expect(notesFor(String(P(PID.ranger).cs)), 'no note at a pick').toBe(0)
  })
  it('a row of the page\'s own man, opened and left alone across later draws, stays open, and no note', async () => {
    signInAs('saber')
    const p = panel()
    await p.find(String(P(PID.ranger).cs))
    await p.open(PID.ranger)
    await act(async () => { notify() })
    await act(async () => { notify() })
    expect(p.$('#accEdName'), 'still the whole row, open').not.toBeNull()
    expect(notesFor(String(P(PID.ranger).cs))).toBe(0)
  })
})

/* ---- §5 AS-BUILT PINS: what this fix does not touch (findings B and C of the security read) ---- */
describe('§5 — as built today, kept so their proofs live in the repo', () => {
  /* finding B: the Archived fold draws another squadron's archived man as the whole archived row */
  const archivedOspreyOn142 = async () => {
    signInAs('saber')
    await pick('u149')
    expect(archivePerson(PID.osprey).bad, 'setup: Osprey archived on 149\'s page, by a master admin').toBeNull()
    unitsLoad(); accountsLoad()
    await pick('u142')
    expect(pageUnit('own'), 'premise: the page is 142\'s').toBe('u142')
    expect(homeOn(PID.osprey, todayIso()), 'premise: he is 149\'s man').toBe('u149')
    const p = panel()
    await p.press('#accFilter')
    await p.press('[data-ftick="sqn:u149"]')
    await p.press('#accArchToggle')
    return p
  }
  it('B1 Saber on 142\'s page, Squadron tick 149: Osprey (149\'s, archived) is drawn with his sign-in name, dots and badge — changes at U3 (the Archived fold is the page\'s own squadron\'s)', async () => {
    const p = await archivedOspreyOn142()
    const row = p.$(`#accArchList .acc-row[data-person="${PID.osprey}"]`)
    expect(row, 'his archived row is on 142\'s page').not.toBeNull()
    expect(row!.querySelector('.acc-main b')?.textContent, 'his sign-in name, as built').toBe(accountById(ACCT.osprey)!.name)
    expect(row!.querySelector('.ub'), 'a role badge, as built').not.toBeNull()
    expect(p.$(`[data-testid="dot-signin-${PID.osprey}"]`), 'a Sign-in dot, as built').not.toBeNull()
  })
  it('B2 the same row, pressed: his callsign box, Restore and Delete — changes at U3 (the Archived fold is the page\'s own squadron\'s)', async () => {
    const p = await archivedOspreyOn142()
    await p.press(`#accArchList .acc-row[data-person="${PID.osprey}"] .acc-tap`)
    expect(['#accArCs', '#accArRestore', '#accArDel'].filter(id => p.$(id)), 'as built').toEqual(['#accArCs', '#accArRestore', '#accArDel'])
  })

  /* finding C: a man whose home the app cannot read is judged the page's own (how a shared store reads: the units' demo
     fallback switched off). Hunter, with no Home row, holds Plan of 150 and is listed on Mako's 150 page. */
  describe('a man with no home the app can read', () => {
    afterEach(() => { setUnitSeeds(true); unitsLoad() })
    const homelessWorld = () => {
      signInAs('saber')
      expect(saveAccess(ACCT.hunter, { grants: { [third.u150]: 'plan' } }), 'setup: Saber gives Hunter Plan of 150').toBeNull()
      setUnitSeeds(false); unitsLoad(); accountsLoad()
      signInAs('mako')
      act(() => { notify() })
      expect(pageUnit('own'), 'premise: Mako\'s page is 150\'s').toBe(third.u150)
      expect(homeOn(PID.hunter, todayIso()), 'premise: the app cannot read Hunter\'s home').toBeNull()
    }
    it('C1 on 150\'s page his row is the whole row — his sign-in name, his dots; pressed, the whole row\'s controls — closes before the database step ([MSQ-S2-NO-HOME-ROW])', async () => {
      homelessWorld()
      const p = panel()
      const row = p.rowOf(PID.hunter)
      expect(row, 'Hunter is on 150\'s page (he plans 150)').not.toBeNull()
      expect(row!.querySelector('.acc-main b')?.textContent, 'his sign-in name, as built').toBe(accountById(ACCT.hunter)!.name)
      expect(p.$(`[data-testid="dot-signin-${PID.hunter}"]`), 'a Sign-in dot, as built').not.toBeNull()
      await p.press(`[data-testid="acc-groups"] .acc-row[data-person="${PID.hunter}"] .acc-tap`)
      expect(WHOLE.filter(id => p.$(id)), 'the whole row\'s controls, as built').toEqual(WHOLE)
    })
    it('C2 Mako (150\'s admin) presses Suspend on that row and Hunter is suspended — closes before the database step ([MSQ-S2-NO-HOME-ROW])', async () => {
      homelessWorld()
      const p = panel()
      await p.press(`[data-testid="acc-groups"] .acc-row[data-person="${PID.hunter}"] .acc-tap`)
      expect(accountById(ACCT.hunter)!.on, 'premise: he can sign in').toBe(true)
      await p.press('#accEdOnOff')
      accountsLoad()
      expect(accountById(ACCT.hunter)!.on, 'suspended from 150\'s page, as built').toBe(false)
    })
  })
})
