// @vitest-environment jsdom
/* ADMIN → USERS ACROSS SQUADRONS — STEP U1: ANOTHER SQUADRON'S MAN ON THIS SQUADRON'S PAGE (the plan,
   docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md §19.1 with §21.2's block "Step 0 — this part read against his
   answers" — Q13 above all; the brief docs/superpowers/briefs/2026-11-26-msq-s2-u1-brief.md).
   His D2625, D2652 N3 e, D2655 D5: on a page that is not his own squadron's, a man shows only what identifies him and that
   page's squadron's one access line. THE ROW'S SAVE IS WHAT KEEPS THE REST SAFE, NOT THE HIDING (Astra 2 of the third
   read): it sends that one squadron's line and nothing else, and it judges the row again at Save.
   Written red first on the code as it stood before chat 199's U1, each test seen failing there, except where named "pin:".
   Since then: U1's fix (chat 205) re-pointed two cases of V4b — the row now closes as the change lands, or at the pick,
   never waiting for its Save — and added the no-redraw case beside them (msq-s2-rejudge.test.tsx holds that fix's own
   proofs); the fix's second round made the open row read his line on every draw and hold only the admin's pick
   (msq-s2-rejudge2.test.tsx §9), which V4's "changed and not saved" case still holds as written. Since the core's K4
   (the pick's door) the last V4b case is the plan's V4c, re-pointed by name: a changed short row refuses the pick.
   The world: three squadrons (withThird — his D2630; R9), Wed 15 Jul 26, 09:00. Hunter — 142's admin, Plan of 149, View
   of 150; Saber — master admin, home 142; Ranger — 142's member, View of 149 and of 150; Kestrel — 149's admin; Osprey —
   149's member; Mako — 150's own admin; a 142 man with no sign-in, found on the roster. */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { withThird, third, signInAs, PID, ACCT, moveMan, on } from '../test-support/msq-world'
import { UsersPanel } from './UsersPanel'
import { useVersion } from './useStore'
import { accountById, accountOfPid, accountsLoad, levelIn } from '../state/accounts'
import { unitsLoad, todayIso, homeOn } from '../state/units'
import { pickSquadron } from '../state/pick'
import { PEOPLE } from '../engine/people'
import { rosterOf } from '../engine/roster'
import { HOOKS } from '../engine/hooks'
import { UNIT } from '../engine/unitview'
import { notify } from '../state/store'
import { globalUndo } from '../undo/timeline'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

/* A SPY ON THE ONE DOOR (V4b): every call of state/accounts.ts saveAccess is recorded, and passed to the real door */
const spy = vi.hoisted(() => ({ calls: [] as unknown[][] }))
vi.mock('../state/accounts', async importOriginal => {
  const real = await importOriginal<typeof import('../state/accounts')>()
  return { ...real, saveAccess: (...a: Parameters<typeof real.saveAccess>) => { spy.calls.push(a); return real.saveAccess(...a) } }
})

withThird()
afterEach(() => cleanup())

const reload = () => { unitsLoad(); accountsLoad() }
const level = (acct: string, unit: string) => { reload(); return levelIn(acct, unit, todayIso()) }
const P = (pid: string): any => (PEOPLE as any)[pid]
/* "Pilot · CAT IP" — his seat and CAT as every row's second line starts */
const seatOf = (pid: string): string => {
  const p = P(pid)
  if (p.pers || p.seat === 'GND') return 'Personnel'
  return `${p.seat === 'FCP' ? 'Pilot' : 'WSO'}${p.q ? ` · CAT ${p.q}` : ''}`
}
/* a 142 man on the roster with no sign-in */
const noSignIn142 = (): string => {
  const pid = rosterOf('u142', todayIso()).find(id => { const p = P(id); return p && !p.special && !p.archived && !p.deleted && !accountOfPid(id) })
  if (!pid) throw new Error('the world has no 142 man without a sign-in')
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
  /* the row's second line as read, without the "you" tag */
  const sub = (pid: string) => {
    const s = rowOf(pid)!.querySelector('.acc-main .acc-sub')!.cloneNode(true) as HTMLElement
    s.querySelectorAll('.acc-tag').forEach(t => t.remove())
    return s.textContent
  }
  /* the buttons of the opened row, the line buttons apart */
  const editButtons = () => [...(rowOf(editingPid())?.querySelectorAll<HTMLButtonElement>('.acc-edit > .acc-acts button') ?? [])].map(b => b.textContent)
  const editingPid = () => ($('.acc-edit')?.closest('.acc-row') as HTMLElement | null)?.dataset.person ?? ''
  return { $, $$, rowOf, open, find, lines, pickLine, press, sub, editButtons }
}
const pick = async (u: string) => { await act(async () => { await pickSquadron(u) }) }

/* THE SHORT ROW, CLOSED: callsign, grey number, seat and CAT, the role in words, what he holds here; no dots, no badge, no
   sign-in name */
function expectShortClosed(p: ReturnType<typeof panel>, pid: string, num: string, words: string) {
  const row = p.rowOf(pid)!
  expect(row, `${P(pid).cs}'s row is on the page`).not.toBeNull()
  expect(p.$(`[data-testid="sqn-${pid}"]`)?.textContent, 'his squadron\'s grey number').toBe(num)
  expect(p.$(`[data-testid="dot-signin-${pid}"]`), 'no Sign-in dot').toBeNull()
  expect(p.$(`[data-testid="dot-roster-${pid}"]`), 'no Roster dot').toBeNull()
  expect(row.querySelector('.ub'), 'no role badge').toBeNull()
  /* (the sign-in name is drawn bold on the whole row's second line; the exact words below hold that nothing else is) */
  expect(row.querySelector('.acc-main b'), 'no sign-in name').toBeNull()
  expect(p.sub(pid)).toBe(words)
}
/* THE SHORT ROW, OPENED: the one line, Save and Cancel, and nothing else */
function expectOneLine(p: ReturnType<typeof panel>, unit: string) {
  for (const id of ['#accEdName', '#accGiveName', '#accEdRole', '#accGiveRole', '#accEdOnOff', '#accEdArchive', '#accEdDel', '#accGive'])
    expect(p.$(id), `${id} is not drawn`).toBeNull()
  expect(p.$('[data-testid="acc-roles"]'), 'no roles table').toBeNull()
  expect(p.lines().map(l => l.n), 'one line, the page\'s squadron\'s').toEqual([unit])
  expect(p.editButtons()).toEqual(['Save', 'Cancel'])
}

describe('V1 — Hunter (142\'s admin, Plan of 149) on 149\'s page', () => {
  it('a 142 member with a sign-in, found by search: the short closed row; opened, the one line for 149 with Save and Cancel — Plan greyed, "Plan is for admins only."', async () => {
    signInAs('hunter')
    await pick('u149')
    const p = panel()
    await p.find(String(P(PID.ranger).cs))
    expectShortClosed(p, PID.ranger, '142', `${seatOf(PID.ranger)} · also views 149`)
    await p.open(PID.ranger)
    expectOneLine(p, '149')
    expect(p.lines()).toEqual([{ n: '149', what: 'None View* Plan(off)', note: 'Plan is for admins only.' }])
  })
  it('a 142 man with no sign-in: nothing after seat and CAT; opened, the words and Cancel alone — no sign-in box, no Role, no Give sign-in', async () => {
    signInAs('hunter')
    await pick('u149')
    const p = panel()
    const pid = noSignIn142()
    await p.find(String(P(pid).cs))
    expectShortClosed(p, pid, '142', seatOf(pid))
    await p.open(pid)
    for (const id of ['#accGive', '#accGiveName', '#accGiveRole', '#accEdName', '#accEdRole', '#accEdArchive', '#accEdDel', '#accEdSave'])
      expect(p.$(id), `${id} is not drawn`).toBeNull()
    expect(p.$('[data-testid="acc-sq"]'), 'no access line').toBeNull()
    expect(p.rowOf(pid)!.querySelector('.acc-edit')!.textContent).toContain('No sign-in. Ask 142\'s admin to give him one first.')
    expect(p.editButtons()).toEqual(['Cancel'])
    await p.press('#accEdCancel')
    expect(p.$('.acc-edit'), 'Cancel closes it').toBeNull()
  })
  it('his own row on 149\'s list: short, "· admin · also plans 149", wearing "you", never opened', async () => {
    signInAs('hunter')
    await pick('u149')
    const p = panel()
    expectShortClosed(p, PID.hunter, '142', `${seatOf(PID.hunter)} · admin · also plans 149`)
    expect(p.rowOf(PID.hunter)!.querySelector('.acc-tag.you'), '"you"').not.toBeNull()
    const tap = p.rowOf(PID.hunter)!.querySelector<HTMLButtonElement>('.acc-tap')!
    expect(tap.disabled).toBe(true)
  })
  it('Saber\'s row: "· master admin, full access"; opened, 149 reads "Full access", Save and Cancel', async () => {
    signInAs('hunter')
    await pick('u149')
    const p = panel()
    await p.find(String(P(PID.saber).cs))
    expectShortClosed(p, PID.saber, '142', `${seatOf(PID.saber)} · master admin, full access`)
    await p.open(PID.saber)
    expectOneLine(p, '149')
    expect(p.lines()).toEqual([{ n: '149', what: 'Full access', note: null }])
  })
})

describe('V2 — the same short row and one line for Kestrel, for Saber with 149 picked, and for Mako on 150', () => {
  it('Kestrel (149\'s admin): Ranger found by search, short, one line for 149; Hunter listed as a Plan holder, "· admin · also plans 149", one line', async () => {
    signInAs('kestrel')
    const p = panel()
    expectShortClosed(p, PID.hunter, '142', `${seatOf(PID.hunter)} · admin · also plans 149`)
    await p.open(PID.hunter)
    expectOneLine(p, '149')
    await p.press('#accEdCancel')
    await p.find(String(P(PID.ranger).cs))
    expectShortClosed(p, PID.ranger, '142', `${seatOf(PID.ranger)} · also views 149`)
    await p.open(PID.ranger)
    expectOneLine(p, '149')
    expect(p.lines()).toEqual([{ n: '149', what: 'None View* Plan(off)', note: 'Plan is for admins only.' }])
  })
  it('Saber (master admin) with 149 picked: Ranger short, one line for 149, Plan greyed for a member', async () => {
    signInAs('saber')
    await pick('u149')
    const p = panel()
    await p.find(String(P(PID.ranger).cs))
    expectShortClosed(p, PID.ranger, '142', `${seatOf(PID.ranger)} · also views 149`)
    await p.open(PID.ranger)
    expectOneLine(p, '149')
    expect(p.lines()).toEqual([{ n: '149', what: 'None View* Plan(off)', note: 'Plan is for admins only.' }])
  })
  it('Mako (150\'s admin) on 150\'s page: Ranger short, "· also views 150", one line, for 150', async () => {
    signInAs('mako')
    const p = panel()
    await p.find(String(P(PID.ranger).cs))
    expectShortClosed(p, PID.ranger, '142', `${seatOf(PID.ranger)} · also views 150`)
    await p.open(PID.ranger)
    expectOneLine(p, '150')
    expect(p.lines()).toEqual([{ n: '150', what: 'None View* Plan(off)', note: 'Plan is for admins only.' }])
  })
})

/* V3 (pins) — his whole row on his own squadron's page, for Hunter and for Saber, every button as today: held by U0's
   msq-s2-asis.test.tsx §1, "pin: Hunter (142's admin) on 142's page — …" and "pin: Saber (master admin) on 142's page —
   …"; Kestrel never reaching 142's page: its "pin: Kestrel (149's admin, no right in 142) is not offered 142 at all". */

describe('V4 — the line still saves, and reports its unsaved change', () => {
  /* (a pin: it passed on today's code too — Kestrel's whole row saved the line then; it must go on doing so from the short
     row) */
  it('pin: Kestrel gives Ranger View of 149 from his row on 149\'s page: saved, "Saved", one Undo step', async () => {
    signInAs('kestrel')
    expect(level(ACCT.ranger, 'u149'), 'the world: Ranger views 149').toBe('view')
    const p = panel()
    await p.find(String(P(PID.ranger).cs))
    await p.open(PID.ranger)
    await p.pickLine('u149', 'none')
    await p.press('#accEdSave')
    expect(level(ACCT.ranger, 'u149'), 'View of 149 ended').toBeNull()
    expect(p.$('.acc-edit'), 'the row closed').toBeNull()
    await p.open(PID.ranger)
    await p.pickLine('u149', 'view')
    await p.press('#accEdSave')
    expect(level(ACCT.ranger, 'u149'), 'View of 149 given').toBe('view')
    expect(HOOKS.toast).toHaveBeenLastCalledWith('Saved')
    act(() => { globalUndo() })
    expect(level(ACCT.ranger, 'u149'), 'one Undo takes the give back').toBeNull()
    act(() => { globalUndo() })
    expect(level(ACCT.ranger, 'u149'), 'the next takes the end back').toBe('view')
  })
  it('the row with its line changed and not saved says so; put back, it does not; Cancel and Escape drop the choice', async () => {
    signInAs('kestrel')
    const p = panel()
    await p.find(String(P(PID.ranger).cs))
    await p.open(PID.ranger)
    const edit = () => p.rowOf(PID.ranger)!.querySelector<HTMLElement>('.acc-edit')
    expect(edit()!.dataset.unsaved, 'opened: nothing changed').toBeUndefined()
    await p.pickLine('u149', 'none')
    expect(edit()!.dataset.unsaved, 'changed and not saved').toBe('true')
    await p.pickLine('u149', 'view')
    expect(edit()!.dataset.unsaved, 'put back as it stands').toBeUndefined()
    await p.pickLine('u149', 'none')
    await p.press('#accEdCancel')
    expect(edit(), 'Cancel closed it').toBeNull()
    expect(level(ACCT.ranger, 'u149'), 'nothing saved').toBe('view')
    await p.open(PID.ranger)
    expect(p.lines()[0]!.what, 'it opens on what is saved').toBe('None View* Plan(off)')
    await p.pickLine('u149', 'none')
    await act(async () => { fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' }) })
    expect(edit(), 'Escape closed it').toBeNull()
    expect(level(ACCT.ranger, 'u149'), 'nothing saved').toBe('view')
  })
})

describe('V4b — the save sends the line alone, and judges the row again', () => {
  const renameUndoSave = async (who: 'saber' | 'hunter') => {
    signInAs(who)
    const was = accountById(ACCT.ranger)!.name
    const p = panel()
    /* on 142's page: rename his sign-in from his whole row */
    await p.open(PID.ranger)
    await act(async () => { fireEvent.change(p.$('#accEdName')!, { target: { value: 'renamed@mail' } }) })
    await p.press('#accEdSave')
    expect(accountById(ACCT.ranger)!.name, 'setup: the rename saved').toBe('renamed@mail')
    /* 149 picked, his short row opened there */
    await pick('u149')
    await p.find(String(P(PID.ranger).cs))
    await p.open(PID.ranger)
    expect(p.$('#accEdName'), 'the short row').toBeNull()
    /* Undo, under the open row: the rename taken back */
    const u = await act(async () => globalUndo())
    expect(u.ok, `the Undo went through${u.ok ? '' : ` — ${(u as any).reason}`}`).toBe(true)
    expect(accountById(ACCT.ranger)!.name, 'the rename taken back').toBe(was)
    expect(p.$('.acc-edit'), 'the row still open').not.toBeNull()
    /* his 149 line changed, Save */
    spy.calls.length = 0
    await p.pickLine('u149', 'none')
    await p.press('#accEdSave')
    expect(spy.calls, 'one call of the door: one key, grants, holding one squadron').toEqual([[ACCT.ranger, { grants: { u149: 'none' } }]])
    expect(accountById(ACCT.ranger)!.name, 'his sign-in name the one the Undo left').toBe(was)
    expect(accountById(ACCT.ranger)!.role, 'his role as it was').toBe('main')
    expect(accountById(ACCT.ranger)!.master, 'no master mark').toBeUndefined()
    expect(level(ACCT.ranger, 'u149'), 'his 149 line saved').toBeNull()
    expect(level(ACCT.ranger, third.u150), 'his 150 line as it was').toBe('view')
  }
  it('Saber: rename on 142, pick 149, open his short row, Undo, change his 149 line, Save', async () => { await renameUndoSave('saber') })
  it('Hunter: the same', async () => { await renameUndoSave('hunter') })

  /* (re-pointed by U1's fix, chat 205's brief: the row is judged again on every draw, so it closes as the move lands —
     U1 held it open, short, until its Save) */
  it('his move lands while the row is open: the row closes as the move lands, the note names him, nothing sent', async () => {
    signInAs('saber')
    await pick('u149')
    const p = panel()
    const cs = String(P(PID.ranger).cs)
    await p.find(cs)
    await p.open(PID.ranger)
    await p.pickLine('u149', 'none')
    /* his move to 149, saved now, counting from tomorrow (acrossMove's way); the clock moved to the move day */
    expect(moveMan(PID.ranger, 'u149'), 'setup: Ranger moved to 149').toMatchObject({ ok: true })
    on(16); reload()
    expect(homeOn(PID.ranger, todayIso()), 'the move day: he is 149\'s').toBe('u149')
    spy.calls.length = 0
    await act(async () => { notify() })
    expect(p.$('.acc-edit'), 'the row closed as the move landed').toBeNull()
    expect(p.$('#accEdName'), 'never swapped for the whole row').toBeNull()
    expect(HOOKS.toast).toHaveBeenLastCalledWith(`${cs}’s row changed while it was open, so nothing was saved. Open it again.`, 'warn')
    expect(spy.calls, 'nothing sent').toEqual([])
    /* (149 is his own squadron now — he is its member, so no 149 line is his to read; the spy above holds that nothing
       was sent) */
  })
  /* THE CHECK AT THE SHORT ROW'S SAVE STAYS: his move landing as the date rolls redraws nothing, so the row still stands
     when Save is pressed — the Save judges it again itself */
  it('his move lands with no redraw while the row is open: Save sends nothing, the row closes, the note names him', async () => {
    signInAs('saber')
    await pick('u149')
    const p = panel()
    const cs = String(P(PID.ranger).cs)
    await p.find(cs)
    await p.open(PID.ranger)
    await p.pickLine('u149', 'none')
    expect(moveMan(PID.ranger, 'u149'), 'setup: Ranger moved to 149').toMatchObject({ ok: true })
    on(16); reload()
    expect(homeOn(PID.ranger, todayIso()), 'the move day: he is 149\'s').toBe('u149')
    expect(p.$('#accEdSave'), 'premise: nothing redrew — the short row still stands').not.toBeNull()
    spy.calls.length = 0
    await p.press('#accEdSave')
    expect(spy.calls, 'nothing sent').toEqual([])
    expect(p.$('.acc-edit'), 'the row closed').toBeNull()
    expect(HOOKS.toast).toHaveBeenLastCalledWith(`${cs}’s row changed while it was open, so nothing was saved. Open it again.`, 'warn')
  })
  /* "…or an Undo of one" (the brief's V4b): the app's own Undo cannot bring a man home under an open row — once his move
     has landed its Undo is refused for good ("Something else changed this after your action — it can't be undone now.",
     the reach check of undo/timeline.ts, seen 26 Nov 26 in a probe with no page drawn at all), and before it lands his
     home today does not change. So this holds what an Undo of one can do here: refused, he stays the other squadron's,
     his row stays short, and its Save sends his line alone. */
  it('the Undo of a landed move under the open row is refused; the row stays short and its Save sends the line alone', async () => {
    /* Osprey (149's) moved to 142 from the 16th; on the 16th he is 142's, so on 149's page his row is short */
    signInAs('saber')
    await pick('u149')
    expect(moveMan(PID.osprey, 'u142'), 'setup: Osprey moved to 142').toMatchObject({ ok: true })
    on(16)
    const p = panel()
    await p.find(String(P(PID.osprey).cs))
    expect(p.$(`[data-testid="sqn-${PID.osprey}"]`)?.textContent, 'premise: he shows as 142\'s here').toBe('142')
    await p.open(PID.osprey)
    expect(p.$('#accEdName'), 'the short row').toBeNull()
    await p.pickLine('u149', 'view')
    const u = await act(async () => globalUndo())
    expect(u.ok, 'the Undo of his landed move is refused').toBe(false)
    expect(homeOn(PID.osprey, todayIso()), 'he is still 142\'s').toBe('u142')
    spy.calls.length = 0
    await p.press('#accEdSave')
    expect(spy.calls, 'one key, grants, holding one squadron').toEqual([[accountOfPid(PID.osprey)!.id, { grants: { u149: 'view' } }]])
  })
  /* (re-pointed by U1's fix, chat 205's brief: the row closes at the pick itself, and with no note — the pick was the
     signed-in admin's own act; U1 held it open on 150's page until its Save refused.
     Re-pointed again since the core's K4, by name — was "the page's squadron changes while the row is open (150 picked):
     closed at the pick, no note, nothing sent": this is the plan's V4c — the short row with its line changed and not saved
     refuses the pick (his D2403, D2595, D2627 A6), the grey "Blocked:" note naming the way out. His pick then put back to
     the line he holds, the row holds no change, and the pick goes through as before) */
  it('V4c — 150 picked while the short row holds a changed line: refused, the "Blocked:" note, the row open with his pick, nothing sent; his pick put back, the page\'s squadron changes: closed at the pick, no note, nothing sent', async () => {
    signInAs('saber')
    await pick('u149')
    const p = panel()
    const cs = String(P(PID.ranger).cs)
    await p.find(cs)
    await p.open(PID.ranger)
    await p.pickLine('u149', 'none')
    spy.calls.length = 0
    vi.mocked(HOOKS.toast).mockClear()
    await pick(third.u150)
    /* V4c: refused — 149 stays in view, the row stays open holding his pick, nothing is sent, no "row changed" note */
    expect(UNIT, 'V4c: the pick is refused — 149 stays in view').toBe('u149')
    expect((document.getElementById('toastEl')?.textContent ?? '').trim(), 'V4c: the grey note, his D2627 A6 words')
      .toBe('Blocked: save or cancel the open row, then pick 150.')
    expect(p.rowOf(PID.ranger)!.querySelector('.acc-edit[data-unsaved]'), 'V4c: his row still open, marked not saved').not.toBeNull()
    expect(p.lines(), 'V4c: still the one line, his pick kept').toEqual([{ n: '149', what: 'None* View Plan(off)', note: 'Plan is for admins only.' }])
    expect(vi.mocked(HOOKS.toast).mock.calls.filter(c => String(c[0]).includes('row changed')), 'V4c: no "row changed" note').toEqual([])
    expect(spy.calls, 'V4c: nothing sent').toEqual([])
    expect(level(ACCT.ranger, 'u149'), 'V4c: nothing saved').toBe('view')
    /* his pick put back to the line he holds: the row is open and holds no change */
    await p.pickLine('u149', 'view')
    expect(p.rowOf(PID.ranger)!.querySelector('.acc-edit[data-unsaved]'), 'premise: the row holds no change').toBeNull()
    await pick(third.u150)
    expect(UNIT, 'premise: 150 in view').toBe(third.u150)
    /* (he is still found by the search on 150's page) */
    expect(p.rowOf(PID.ranger), 'premise: he is still on 150\'s page').not.toBeNull()
    expect(p.rowOf(PID.ranger)!.querySelector('.acc-edit'), 'his row closed at the pick').toBeNull()
    expect(vi.mocked(HOOKS.toast).mock.calls.filter(c => c[0] === `${cs}’s row changed while it was open, so nothing was saved. Open it again.`),
      'no note: the pick was his own').toEqual([])
    expect(spy.calls, 'nothing sent').toEqual([])
    expect(level(ACCT.ranger, 'u149'), 'nothing saved').toBe('view')
  })
})
