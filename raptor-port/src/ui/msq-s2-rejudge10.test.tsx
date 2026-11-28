// @vitest-environment jsdom
/* ADMIN → USERS ACROSS SQUADRONS — STEP U1'S TENTH ROUND: STILL LISTED, THE MASTER PUT-BACK, RECEIPTS KEPT (the brief
   docs/superpowers/briefs/2026-11-27-msq-s2-u1fix10-brief.md; the plan docs/superpowers/plans/2026-11-27-msq-s2-open-work-judge.md;
   the earlier rounds' tests are msq-s2-rejudge.test.tsx to msq-s2-rejudge9.test.tsx).
   The ninth round's blind read of four found:
   §60 A PRESS STILL WROTE AFTER THE MAN LEFT THE PAGE'S LIST through another admin's change, nothing redrawn (the
       security reader's F1 = Astra 1): the draw closes such a row with the note (useOpenWorkJudged's `left`), but every
       press asked only the one judge, which never asks whether he is still listed. Now every writing press asks it too
       (askAgain's `listed` — the page's own list as he left it: his search, his ticks, his fold), and the short row's line
       press as well.
   §61 A REFUSED PRESS JUDGED THE OTHER PIECE OF WORK WITHOUT THE DRAW'S `left` / `lost` (opus2 F1 = Astra 2): Give access
       refused beside a short row whose man had left the list — the press said the form's note, the draw after said the
       row's in a batch of its own, replacing it. Now the press judges the other entry as the draw would, those checks
       included, and says both notes in one batch, the pressed first.
   §62 ROUND 9'S LINE PRESS READ A MASTER ADMIN'S "NONE" AS A PUT-BACK (opus2 F2): a man made a master admin unseen holds no
       line, yet the store reads 'none' for him, so a press of None was let go silently. A master admin's line is never a
       put-back: the pick is held and the row closes with the note (pickCannotGo).
   §63 A WRITING PRESS'S OWN RECEIPT WAS REPLACED BY THE REDRAW'S NOTE FOR THE OTHER WORK (opus1 F2/F3 = opus2 F3): the
       write said its receipt (or the door's own words) and the redraw then said the other's note in a batch of its own.
       Now the page runs the write and judges the other piece at once in one batch: receipt first, then the note, one line.
   The readers' proofs (fixread9) are kept here as lasting tests, written before the app changed and each run on the code
   as it stood; a test named "control" or "as built" holds what is built today and must go on holding. Each test that
   asks what he SAW reads the real note element.
   The world: three squadrons (withThird — his D2630), Wed 15 Jul 26, 09:00. Hunter — 142's admin, Plan of 149, View of
   150; Saber — master admin, home 142; Ranger — 142's member, View of 149 and of 150; Kestrel — 149's admin; Osprey —
   149's member. */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { StrictMode, useState } from 'react'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { withThird, signInAs, PID, ACCT, SIGN, on, type Who } from '../test-support/msq-world'
import { UsersPanel } from './UsersPanel'
import { useVersion } from './useStore'
import { changedWhileOpenWords } from './useraccess-model'
import {
  accountById, accountByName, accountOfPid, accountsLoad, declineRequest, levelIn, requestAccess, requestByName, saveAccess,
  sessionFor, signIn, updateAccount,
} from '../state/accounts'
import { updatePersonField } from '../state/quals-write'
import { PEOPLE } from '../engine/people'
import { rosterOf } from '../engine/roster'
import { SESSION, ME, setSession, setMe } from '../state/auth'
import { todayIso, unitsLoad } from '../state/units'
import { notify } from '../state/store'
import { pickSquadron } from '../state/pick'
import { pageUnit } from '../state/perms'
import { HOOKS } from '../engine/hooks'
import { workOn } from './guard'
import { usersView, NO_FILTER } from './usersfilter-model'
import { toast as realToast, toastBatch, clearToast } from './toast'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

withThird()

afterEach(() => {
  cleanup()
  clearToast()
  document.getElementById('toastEl')?.remove()
  document.getElementById('srSay')?.remove()
})

function Live() { useVersion(); const [s] = useState(true); return <UsersPanel shown={s} /> }

/* the real note display, as main.tsx installs it: the passing note and its batch; put back after the run */
async function withRealNote(run: () => Promise<void>): Promise<string> {
  const realBatch = HOOKS.toastBatch
  vi.mocked(HOOKS.toast).mockImplementation(((m: any, k: any, pt: any) => realToast(m, k, pt)) as any)
  HOOKS.toastBatch = toastBatch as any
  try { await run() } finally { HOOKS.toastBatch = realBatch }
  return String(document.getElementById('toastEl')?.textContent ?? '')
}
const timesIn = (shown: string, words: string) => shown.split(words).length - 1
const reload = () => { unitsLoad(); accountsLoad() }
/* as another person, through the real door, the signed-in session put back — nothing redrawn */
function as<T>(who: Who, write: () => T): T {
  const ps = SESSION, pm = ME
  const s = sessionFor(signIn(SIGN[who][0], SIGN[who][1]))
  if (!s) throw new Error(`no ${who}`)
  setSession(s); setMe(s.pid)
  try { return write() } finally { setSession(ps); setMe(pm) }
}
const notes = (cs: string) => vi.mocked(HOOKS.toast).mock.calls.filter(c => c[0] === changedWhileOpenWords(cs)).length
const calls = () => vi.mocked(HOOKS.toast).mock.calls.map(c => String(c[0]))
/* a 142 man with no sign-in */
const bareMan = (): string => rosterOf('u142', todayIso()).find(id => {
  const x = (PEOPLE as any)[id]; return x && !x.special && !x.archived && !x.deleted && !accountOfPid(id)
})!

describe('§60 — a press after the man left the page\'s list by another admin\'s change, nothing redrawn, writes nothing', () => {
  /* the security reader's proof 2: Kestrel a second master admin; Saber on 149 opens Hunter's short row (Hunter is on
     149's list only for his Plan of 149) and picks View, to lower the Plan; Kestrel takes Hunter's 149 access away */
  async function saberOnHuntersShortRow() {
    signInAs('saber')
    expect(saveAccess(ACCT.kestrel, { role: 'admin', master: true }), 'setup: Kestrel made a master admin').toBeNull()
    reload()
    await act(async () => { await pickSquadron('u149') })
    expect(pageUnit('own')).toBe('u149')
    const page = render(<Live />)
    const $ = (s: string) => page.container.querySelector(s) as HTMLElement | null
    expect(levelIn(ACCT.hunter, 'u149', todayIso())).toBe('admin')
    await act(async () => { fireEvent.click($(`[data-testid="acc-groups"] .acc-row[data-person="${PID.hunter}"] .acc-tap`)!) })
    expect($('.acc-edit[data-short="1"]'), 'premise: Hunter\'s short row is open').not.toBeNull()
    await act(async () => { fireEvent.click($('.acc-edit[data-short="1"] [data-line="view"]')!) })
    expect($('.acc-edit[data-short="1"]')!.getAttribute('data-unsaved')).toBe('true')
    expect(as('kestrel', () => saveAccess(ACCT.hunter, { grants: { u149: 'none' } })), 'premise: Kestrel takes the Plan').toBeNull()
    reload()
    expect(levelIn(ACCT.hunter, 'u149', todayIso())).toBeNull()
    return { $ }
  }
  it('security proof 2: nothing redrawn, Save pressed on the screen still standing — nothing is written, the note', async () => {
    const { $ } = await saberOnHuntersShortRow()
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => { fireEvent.click($('#accEdSave')!) })
    reload()
    expect({ open: !!$('.acc-edit[data-short="1"]'), saved: levelIn(ACCT.hunter, 'u149', todayIso()), note: notes('Hunter') })
      .toEqual({ open: false, saved: null, note: 1 })
  })
  it('control: a draw comes before the press — the row closes with the note and nothing is written', async () => {
    const { $ } = await saberOnHuntersShortRow()
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => { notify() })
    const save = $('#accEdSave')
    if (save) await act(async () => { fireEvent.click(save) })
    reload()
    expect({ open: !!$('.acc-edit[data-short="1"]'), saved: levelIn(ACCT.hunter, 'u149', todayIso()), note: notes('Hunter') })
      .toEqual({ open: false, saved: null, note: 1 })
  })
  /* (a pin, green before and after: before, the press let the pick go as a put-back and the draw it caused closed the row
     by its `left`; now the press itself asks to be judged again — the same close, the same note) */
  it('pin: a line pressed on the screen still standing writes nothing, the row closes, the note', async () => {
    const { $ } = await saberOnHuntersShortRow()
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => { fireEvent.click($('.acc-edit[data-short="1"] [data-line="none"]')!) })
    const save = $('#accEdSave')
    if (save) await act(async () => { fireEvent.click(save) })
    reload()
    expect({ open: !!$('.acc-edit[data-short="1"]'), saved: levelIn(ACCT.hunter, 'u149', todayIso()), note: notes('Hunter') })
      .toEqual({ open: false, saved: null, note: 1 })
  })
  /* proof 2b (no master needed): Kestrel, Role "Member" ticked, finds Ranger and picks None; Saber makes Ranger an admin
     (the tick no longer keeps him) */
  async function kestrelOnRangerByTick() {
    signInAs('kestrel')
    const page = render(<Live />)
    const $ = (s: string) => page.container.querySelector(s) as HTMLElement | null
    const press = async (s: string) => { await act(async () => { fireEvent.click($(s)!) }) }
    await press('#accFilter'); await press('[data-ftick="role:member"]')
    await act(async () => { fireEvent.change($('#accFind')!, { target: { value: 'Ranger' } }) })
    await press(`[data-testid="acc-groups"] .acc-row[data-person="${PID.ranger}"] .acc-tap`)
    await press('.acc-edit[data-short="1"] [data-line="none"]')
    expect(as('saber', () => saveAccess(ACCT.ranger, { role: 'admin' })), 'premise: Saber makes Ranger an admin').toBeNull()
    reload()
    vi.mocked(HOOKS.toast).mockClear()
    return { $, press }
  }
  it('security proof 2b: Save with nothing redrawn — nothing written, the note', async () => {
    const { $, press } = await kestrelOnRangerByTick()
    await press('#accEdSave')
    reload()
    expect({ open: !!$('.acc-edit[data-short="1"]'), line: levelIn(ACCT.ranger, 'u149', todayIso()), note: notes('Ranger') })
      .toEqual({ open: false, line: 'view', note: 1 })
  })
  it('control 2b: the same, with a draw before the press — the row closes with the note, nothing written', async () => {
    const { $ } = await kestrelOnRangerByTick()
    await act(async () => { notify() })
    const save = $('#accEdSave'); if (save) await act(async () => { fireEvent.click(save) })
    reload()
    expect({ open: !!$('.acc-edit[data-short="1"]'), line: levelIn(ACCT.ranger, 'u149', todayIso()), note: notes('Ranger') })
      .toEqual({ open: false, line: 'view', note: 1 })
  })
  /* proof 2c (the WHOLE row): Kestrel ticks Osprey's CAT, opens his whole row, picks Role Admin; Hunter (149's by his
     Plan) changes Osprey's CAT on Quals — the copy holds no CAT, so the judge alone does not see it */
  async function kestrelOnOspreyByCat() {
    signInAs('kestrel')
    const page = render(<Live />)
    const $ = (s: string) => page.container.querySelector(s) as HTMLElement | null
    const press = async (s: string) => { await act(async () => { fireEvent.click($(s)!) }) }
    const cat0 = String((PEOPLE as any)[PID.osprey].q)
    await press('#accFilter'); await press(`[data-ftick="cat:${cat0}"]`)
    await press(`[data-testid="acc-groups"] .acc-row[data-person="${PID.osprey}"] .acc-tap`)
    expect($('#accEdRole'), 'premise: the whole row').not.toBeNull()
    await act(async () => { fireEvent.change($('#accEdRole')!, { target: { value: 'admin' } }) })
    expect(as('hunter', () => updatePersonField(PID.osprey, { cat: cat0 === 'OCU' ? 'C' : 'OCU' } as any)), 'premise: Hunter changes his CAT').toBeNull()
    reload()
    vi.mocked(HOOKS.toast).mockClear()
    return { $, press }
  }
  it('security proof 2c: Save with nothing redrawn — nothing written, the note', async () => {
    const { $, press } = await kestrelOnOspreyByCat()
    await press('#accEdSave')
    reload()
    expect({ open: !!$('.acc-edit[data-editing]'), role: accountById(ACCT.osprey)!.role, note: notes('Osprey') })
      .toEqual({ open: false, role: 'main', note: 1 })
  })
  it('control 2c: the same with a draw before the press — the row closes with the note, nothing written', async () => {
    const { $ } = await kestrelOnOspreyByCat()
    await act(async () => { notify() })
    const save = $('#accEdSave'); if (save) await act(async () => { fireEvent.click(save) })
    reload()
    expect({ open: !!$('.acc-edit[data-editing]'), role: accountById(ACCT.osprey)!.role, note: notes('Osprey') })
      .toEqual({ open: false, role: 'main', note: 1 })
  })
  it('as built, by the short row\'s design (NOT the list): Saber FINDS Hunter by search, picks View to lower his Plan; Kestrel takes the Plan, nothing redrawn; Save GIVES View to a man holding nothing (filed for the database step)', async () => {
    signInAs('saber')
    expect(saveAccess(ACCT.kestrel, { role: 'admin', master: true })).toBeNull(); reload()
    await act(async () => { await pickSquadron('u149') })
    const page = render(<Live />)
    const $ = (s: string) => page.container.querySelector(s) as HTMLElement | null
    await act(async () => { fireEvent.change($('#accFind')!, { target: { value: 'Hunter' } }) })
    await act(async () => { fireEvent.click($(`[data-testid="acc-groups"] .acc-row[data-person="${PID.hunter}"] .acc-tap`)!) })
    await act(async () => { fireEvent.click($('.acc-edit[data-short="1"] [data-line="view"]')!) })
    expect(as('kestrel', () => saveAccess(ACCT.hunter, { grants: { u149: 'none' } }))).toBeNull(); reload()
    await act(async () => { fireEvent.click($('#accEdSave')!) })
    reload()
    expect(levelIn(ACCT.hunter, 'u149', todayIso())).toBe('view')
  })
  /* Astra's proof 1, in both modes */
  it.each([false, true])('Astra 1: Save after an unseen loss of the Plan that listed Hunter is refused; strict=%s', async strict => {
    signInAs('saber')
    expect(saveAccess(ACCT.kestrel, { master: true })).toBeNull()
    reload()
    await act(async () => { await pickSquadron('u149') })
    const page = render(strict ? <StrictMode><Live /></StrictMode> : <Live />)
    const get = (selector: string): HTMLElement => {
      const el = page.container.querySelector<HTMLElement>(selector)
      if (!el) throw new Error(`Missing control: ${selector}`)
      return el
    }
    const click = async (selector: string) => { await act(async () => { fireEvent.click(get(selector)) }) }
    expect((get('#accFind') as HTMLInputElement).value).toBe('')
    await click(`[data-testid="acc-groups"] .acc-row[data-person="${PID.hunter}"] .acc-tap`)
    const editor = '.acc-edit[data-short="1"]'
    await click(`${editor} [data-line="view"]`)
    expect(as('kestrel', () => saveAccess(ACCT.hunter, { grants: { u149: 'none' } }))).toBeNull()
    reload()
    expect(usersView('u149', todayIso(), '', NO_FILTER, true).groups.some(g => g.rows.includes(PID.hunter))).toBe(false)
    expect(get(editor).getAttribute('data-unsaved')).toBe('true')
    vi.mocked(HOOKS.toast).mockClear()
    await click('#accEdSave')
    reload()
    expect({
      held: levelIn(ACCT.hunter, 'u149', todayIso()),
      changedNotes: calls().filter(n => n === changedWhileOpenWords('Hunter')).length,
      savedNotes: calls().filter(n => n === 'Saved').length,
      editorOpen: !!page.container.querySelector(editor),
    }).toEqual({ held: null, changedNotes: 1, savedNotes: 0, editorOpen: false })
  })
})

describe('§61 — a refused press beside a row that left the list closes both and says both notes once, in one batch', () => {
  /* opus2's proof 1: Kestrel on 149 — a changed Give access (Newface, New person, Role Admin, Post in untouched) and
     Hunter's short row open (no pick); midnight; Saber takes Hunter's Plan of 149; nothing redrawn */
  it('opus2 proof 1: Add person and give access pressed past midnight while Hunter\'s short row lost its Plan unseen: BOTH notes on screen', async () => {
    signInAs('newface@mail')
    expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' }, 'u149')).toBeNull()
    signInAs('kestrel')
    const page = render(<Live />)
    const $ = (s: string) => page.container.querySelector(s) as HTMLElement | null
    await act(async () => { fireEvent.click($('[data-approve]')!) })
    expect($('#apvPostIn'), 'premise: New person mode, the Post in box untouched').not.toBeNull()
    await act(async () => { fireEvent.change($('#apvRole')!, { target: { value: 'admin' } }) })
    await act(async () => { fireEvent.click($(`[data-testid="acc-groups"] .acc-row[data-person="${PID.hunter}"] .acc-tap`)!) })
    expect($('.acc-edit[data-short="1"]'), 'premise: his short row is open').not.toBeNull()
    const shown = await withRealNote(async () => {
      on(16)
      expect(as('saber', () => saveAccess(ACCT.hunter, { grants: { u149: 'none' } }))).toBeNull()
      reload()
      await act(async () => { fireEvent.click($('#apvGo')!) })
    })
    expect(accountByName('newface@mail'), 'nothing written').toBeUndefined()
    expect({ rowOpen: !!$('.acc-edit[data-short="1"]'), formOpen: !!$('[data-approving]') }).toEqual({ rowOpen: false, formOpen: false })
    expect({ newface: timesIn(shown, changedWhileOpenWords('Newface')), hunter: timesIn(shown, changedWhileOpenWords('Hunter')) })
      .toEqual({ newface: 1, hunter: 1 })
  })
  /* Astra's proof 2, in both modes: the same with a picked View on Hunter's row; the pressed form's note first, and a
     later draw changes nothing on screen */
  it.each([false, true])('Astra 2: the refused form and the unseen list departure, pressed first, one batch; strict=%s', async strict => {
    signInAs('saber')
    expect(saveAccess(ACCT.kestrel, { master: true })).toBeNull()
    reload()
    signInAs('newface@mail')
    expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' }, 'u149')).toBeNull()
    signInAs('saber')
    await act(async () => { await pickSquadron('u149') })
    const page = render(strict ? <StrictMode><Live /></StrictMode> : <Live />)
    const get = (selector: string): HTMLElement => {
      const el = page.container.querySelector<HTMLElement>(selector)
      if (!el) throw new Error(`Missing control: ${selector}`)
      return el
    }
    const click = async (selector: string) => { await act(async () => { fireEvent.click(get(selector)) }) }
    await click('[data-approve]')
    await act(async () => { fireEvent.change(get('#apvRole'), { target: { value: 'admin' } }) })
    await click(`[data-testid="acc-groups"] .acc-row[data-person="${PID.hunter}"] .acc-tap`)
    const editor = '.acc-edit[data-short="1"]'
    await click(`${editor} [data-line="view"]`)
    expect({ row: workOn('userrow'), give: workOn('giveaccess') }).toEqual({ row: true, give: true })
    expect(as('kestrel', () => saveAccess(ACCT.hunter, { grants: { u149: 'none' } }))).toBeNull()
    on(16)
    reload()
    expect(todayIso()).toBe('2026-07-16')
    const realBatch = HOOKS.toastBatch
    vi.mocked(HOOKS.toast).mockClear()
    vi.mocked(HOOKS.toast).mockImplementation(((m: any, k: any, pt: any) => realToast(m, k, pt)) as any)
    HOOKS.toastBatch = toastBatch as any
    try {
      await click('#apvGo')
      expect(accountByName('newface@mail')).toBeUndefined()
      expect(requestByName('newface@mail')).toBeDefined()
      expect(levelIn(ACCT.hunter, 'u149', todayIso())).toBeNull()
      expect(page.container.querySelector('[data-approving]')).toBeNull()
      expect(page.container.querySelector(editor)).toBeNull()
      expect({ row: workOn('userrow'), give: workOn('giveaccess') }).toEqual({ row: false, give: false })
      const shown = String(document.getElementById('toastEl')?.textContent ?? '')
      const newface = changedWhileOpenWords('Newface'), hunter = changedWhileOpenWords('Hunter')
      expect({ newface: timesIn(shown, newface), hunter: timesIn(shown, hunter) }).toEqual({ newface: 1, hunter: 1 })
      expect(shown.indexOf(newface)).toBeLessThan(shown.indexOf(hunter))
      await act(async () => { notify() })
      expect(String(document.getElementById('toastEl')?.textContent ?? '')).toBe(shown)
      expect(calls().filter(n => n === newface)).toHaveLength(1)
      expect(calls().filter(n => n === hunter)).toHaveLength(1)
    } finally { HOOKS.toastBatch = realBatch }
  })
})

describe('§62 — a first press on a short row whose man was made a master admin unseen is never dropped without a word', () => {
  /* opus2's proof 2: Kestrel opens Ranger's short row on 149 by search (Ranger holds View), no pick; Saber makes Ranger a
     master admin; nothing redrawn; Kestrel presses a line */
  it.each(['none', 'view'])('opus2 proof 2: Kestrel presses %s — the row closes with the note, nothing written', async line => {
    signInAs('kestrel')
    const page = render(<Live />)
    const $ = (s: string) => page.container.querySelector(s) as HTMLElement | null
    await act(async () => { fireEvent.change($('#accFind')!, { target: { value: 'Ranger' } }) })
    await act(async () => { fireEvent.click($(`[data-testid="acc-groups"] .acc-row[data-person="${PID.ranger}"] .acc-tap`)!) })
    const ed = '.acc-edit[data-short="1"]'
    expect($(`${ed} [data-line][aria-pressed="true"]`)?.getAttribute('data-line'), 'premise: Ranger holds View of 149').toBe('view')
    expect(as('saber', () => saveAccess(ACCT.ranger, { role: 'admin', master: true }))).toBeNull()
    reload()
    expect(accountById(ACCT.ranger)!.master, 'premise: Ranger is a master admin now').toBe(true)
    vi.mocked(HOOKS.toast).mockClear()
    await act(async () => { fireEvent.click($(`${ed} [data-line="${line}"]`)!) })
    expect({ rowOpen: !!$(ed), note: notes('Ranger') }).toEqual({ rowOpen: false, note: 1 })
    expect(levelIn(ACCT.ranger, 'u149', todayIso()) === 'view', 'nothing written').toBe(false)
  })
})

describe('§63 — a writing press keeps its own receipt: the other piece\'s note follows it, one line', () => {
  /* opus2's proof 3 (one person, no clock): Hunter has the whole row of a 142 man with no sign-in open, and gives a waiting
     request access ON THE ROSTER as that very man — his row changed (a sign-in now); the brief's shape: the receipt
     first, then the row's note, on one line (the reader's own "never the note" was left to the brief, which keeps it) */
  it('opus2 proof 3: the success words stay on screen, the row\'s note after them, once', async () => {
    const other = bareMan()
    expect(other, 'premise: a 142 man with no sign-in').toBeTruthy()
    const otherCs = String((PEOPLE as any)[other].cs)
    signInAs('newface@mail')
    expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' }, 'u142')).toBeNull()
    signInAs('hunter')
    const page = render(<Live />)
    const $ = (s: string) => page.container.querySelector(s) as HTMLElement | null
    await act(async () => { fireEvent.click($(`[data-testid="acc-groups"] .acc-row[data-person="${other}"] .acc-tap`)!) })
    expect($('#accGiveName'), 'premise: his whole row, no sign-in').not.toBeNull()
    await act(async () => { fireEvent.click($('[data-approve]')!) })
    if (!$('#apvPid')) await act(async () => { fireEvent.click($('#apvModeRoster')!) })
    await act(async () => { fireEvent.change($('#apvPid')!, { target: { value: other } }) })
    const shown = await withRealNote(async () => { await act(async () => { fireEvent.click($('#apvGo')!) }) })
    expect(accountOfPid(other)?.name, 'premise: the Give access wrote').toBe('newface@mail')
    const receipt = 'newface@mail can sign in now', note = changedWhileOpenWords(otherCs)
    expect({ receipt: timesIn(shown, receipt), note: timesIn(shown, note) }).toEqual({ receipt: 1, note: 1 })
    expect(shown.indexOf(receipt)).toBeLessThan(shown.indexOf(note))
    expect({ rowOpen: !!$('.acc-edit[data-editing]'), formOpen: !!$('[data-approving]') }).toEqual({ rowOpen: false, formOpen: false })
  })
  /* opus1's proof 2: the same with a sign-in typed on the man's row */
  it('opus1 proof 2: a sign-in typed on the bare man\'s row, then Newface given access as him: the receipt and the row\'s note both on screen, receipt first', async () => {
    signInAs('newface@mail')
    expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' }, 'u142')).toBeNull()
    signInAs('hunter')
    const bare = bareMan()
    const bareCs = String((PEOPLE as any)[bare].cs)
    const page = render(<Live />)
    const $ = (s: string) => page.container.querySelector(s) as HTMLElement | null
    await act(async () => { fireEvent.click($(`[data-testid="acc-groups"] .acc-row[data-person="${bare}"] .acc-tap`)!) })
    await act(async () => { fireEvent.change($('#accGiveName')!, { target: { value: 'typed.for.him@mail' } }) })
    await act(async () => { fireEvent.click($('[data-approve]')!) })
    await act(async () => { fireEvent.click($('#apvModeRoster')!) })
    await act(async () => { fireEvent.change($('#apvPid')!, { target: { value: bare } }) })
    const shown = await withRealNote(async () => { await act(async () => { fireEvent.click($('#apvGo')!) }) })
    expect(!!accountOfPid(bare), 'premise: the approval landed').toBe(true)
    expect(shown.includes('can sign in now'), 'the approval\'s receipt is on screen').toBe(true)
    expect(timesIn(shown, changedWhileOpenWords(bareCs)), 'and the row\'s note, once').toBe(1)
    expect(shown.indexOf('can sign in now')).toBeLessThan(shown.indexOf(changedWhileOpenWords(bareCs)))
  })
  /* opus1's proof 3 (two people): Hunter's changed row (Ranger) and a changed Give access (On the roster); Saber renames
     Ranger's sign-in and refuses Newface, nothing redrawn; Give access pressed */
  it('opus1 proof 3: the door\'s own words ("That request is gone") stay on screen, Ranger\'s note after them', async () => {
    signInAs('newface@mail')
    expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' }, 'u142')).toBeNull()
    const req = requestByName('newface@mail')!
    signInAs('hunter')
    const page = render(<Live />)
    const $ = (s: string) => page.container.querySelector(s) as HTMLElement | null
    await act(async () => { fireEvent.click($(`[data-testid="acc-groups"] .acc-row[data-person="${PID.ranger}"] .acc-tap`)!) })
    await act(async () => { fireEvent.change($('#accEdName')!, { target: { value: 'typed@mail' } }) })
    await act(async () => { fireEvent.click($('[data-approve]')!) })
    await act(async () => { fireEvent.click($('#apvModeRoster')!) })
    await act(async () => { fireEvent.change($('#apvRole')!, { target: { value: 'admin' } }) })
    const shown = await withRealNote(async () => {
      expect(as('saber', () => updateAccount(ACCT.ranger, { name: 'ranger.renamed@mail' })), 'premise: Saber renames Ranger').toBeNull()
      expect(as('saber', () => declineRequest(req.id)), 'premise: Saber refuses the request').toBeNull()
      reload()
      await act(async () => { fireEvent.click($('#apvGo')!) })
    })
    expect(shown.includes('That request is gone'), 'the door\'s own words still on screen').toBe(true)
    expect(timesIn(shown, changedWhileOpenWords('Ranger')), 'and Ranger\'s note, once').toBe(1)
    expect(shown.indexOf('That request is gone')).toBeLessThan(shown.indexOf(changedWhileOpenWords('Ranger')))
    expect({ rowOpen: !!$('.acc-edit[data-editing]'), formOpen: !!$('[data-approving]') }).toEqual({ rowOpen: false, formOpen: false })
  })
  /* opus1's proof 4 (one person): Give sign-in under the request's own sign-in name, which answers the request, while
     Newface's Give access holds a change */
  it('opus1 proof 4: Give sign-in "newface@mail" on a bare man\'s row beside a changed Give access: the receipt, then the form\'s note', async () => {
    signInAs('newface@mail')
    expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' }, 'u142')).toBeNull()
    signInAs('hunter')
    const bare = bareMan()
    const page = render(<Live />)
    const $ = (s: string) => page.container.querySelector(s) as HTMLElement | null
    await act(async () => { fireEvent.click($('[data-approve]')!) })
    await act(async () => { fireEvent.change($('#apvRole')!, { target: { value: 'admin' } }) })
    await act(async () => { fireEvent.click($(`[data-testid="acc-groups"] .acc-row[data-person="${bare}"] .acc-tap`)!) })
    await act(async () => { fireEvent.change($('#accGiveName')!, { target: { value: 'newface@mail' } }) })
    const shown = await withRealNote(async () => { await act(async () => { fireEvent.click($('#accGive')!) }) })
    expect(requestByName('newface@mail'), 'premise: the request answered by his own Give sign-in').toBeUndefined()
    expect(shown.includes('can sign in now'), 'his own receipt on screen').toBe(true)
    expect(timesIn(shown, changedWhileOpenWords('Newface')), 'and the form\'s note, once').toBe(1)
    expect(shown.indexOf('can sign in now')).toBeLessThan(shown.indexOf(changedWhileOpenWords('Newface')))
    expect({ rowOpen: !!$('.acc-edit[data-editing]'), formOpen: !!$('[data-approving]') }).toEqual({ rowOpen: false, formOpen: false })
  })
  it('control: a writing press with no other open work shows its receipt alone, once', async () => {
    signInAs('hunter')
    const bare = bareMan()
    const bareCs = String((PEOPLE as any)[bare].cs)
    const page = render(<Live />)
    const $ = (s: string) => page.container.querySelector(s) as HTMLElement | null
    await act(async () => { fireEvent.click($(`[data-testid="acc-groups"] .acc-row[data-person="${bare}"] .acc-tap`)!) })
    await act(async () => { fireEvent.change($('#accGiveName')!, { target: { value: 'bare.man@mail' } }) })
    vi.mocked(HOOKS.toast).mockClear()
    const shown = await withRealNote(async () => { await act(async () => { fireEvent.click($('#accGive')!) }) })
    expect(accountOfPid(bare)?.name).toBe('bare.man@mail')
    expect(shown).toBe(`${bareCs} can sign in now`)
    expect(calls()).toEqual([`${bareCs} can sign in now`])
    expect(!!$('.acc-edit[data-editing]')).toBe(false)
  })
  it('control: a whole row\'s Save with no other open work shows "Saved" alone, once', async () => {
    signInAs('hunter')
    const page = render(<Live />)
    const $ = (s: string) => page.container.querySelector(s) as HTMLElement | null
    await act(async () => { fireEvent.click($(`[data-testid="acc-groups"] .acc-row[data-person="${PID.ranger}"] .acc-tap`)!) })
    await act(async () => { fireEvent.change($('#accEdName')!, { target: { value: 'ranger.new@mail' } }) })
    vi.mocked(HOOKS.toast).mockClear()
    const shown = await withRealNote(async () => { await act(async () => { fireEvent.click($('#accEdSave')!) }) })
    expect(accountById(ACCT.ranger)!.name).toBe('ranger.new@mail')
    expect(shown).toBe('Saved')
    expect(calls()).toEqual(['Saved'])
  })
})
