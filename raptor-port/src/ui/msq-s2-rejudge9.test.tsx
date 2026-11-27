// @vitest-environment jsdom
/* ADMIN → USERS ACROSS SQUADRONS — STEP U1'S NINTH ROUND: THE JUDGE'S PRESS PATHS (the brief
   docs/superpowers/briefs/2026-11-27-msq-s2-u1fix9-brief.md; the plan docs/superpowers/plans/2026-11-27-msq-s2-open-work-judge.md;
   the earlier rounds' tests are msq-s2-rejudge.test.tsx to msq-s2-rejudge8.test.tsx).
   The eighth round's blind read found the one judge closing the class, and two press paths left:
   §50 A PRESS THAT FINDS WORK CHANGED SAYS EVERY NOTE OWED AT THAT MOMENT, TOGETHER — the press said its own note straight
       to the passing note, and the draw its close caused then said the other piece of work's note through the batch: the
       passing note is one element, so the second replaced the first and only one sentence was ever on screen (found by
       three readers — Astra 1, the fresh Opus 1's F1, the fresh Opus 2's F1). Now the press closes and names, in one
       batch, every piece of open work no longer as it was started: the pressed one first, the other where it was on his
       screen at the last draw. Each test reads the real note element, never only the calls made to it.
   §51 THE SHORT ROW'S LINE PRESS COMPARES WITH THE LINE HE HOLDS AT THE PRESS (Astra 2): Kestrel opens Ranger's short row
       on 149 (Ranger holds View), picks None; Saber takes Ranger's View away with nothing redrawn; Kestrel presses View —
       it was compared with the line of the last draw, read as a put-back, and his deliberate View was dropped silently.
       Its pin: the fresh line is compared only on the very sign-in the screen showed — a press on an old screen lands on
       neither sign-in where his was swapped for a new one (the sixth read's security pin S1, kept lasting here).
   The readers' proofs (fixread8) are kept here as lasting tests, written before the app changed and each run on the code
   as it stood; a test named "pin:" holds what is built today and must go on holding.
   The world: three squadrons (withThird — his D2630), Wed 15 Jul 26, 09:00. Hunter — 142's admin, Plan of 149, View of
   150; Saber — master admin, home 142; Ranger — 142's member, View of 149 and of 150; Kestrel — 149's admin; Osprey —
   149's member; Mako — 150's own admin. */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { StrictMode, useState } from 'react'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { withThird, third, signInAs, PID, ACCT, SIGN, moveMan, on } from '../test-support/msq-world'
import { UsersPanel } from './UsersPanel'
import { useVersion } from './useStore'
import { changedWhileOpenWords } from './useraccess-model'
import {
  accountById, accountByName, accountOfPid, accountsLoad, addAccount, declineRequest, levelIn, requestAccess, requestByName,
  saveAccess, sessionFor, sessionLapsed, signIn, updateAccount,
} from '../state/accounts'
import { PEOPLE } from '../engine/people'
import { rosterOf } from '../engine/roster'
import { SESSION, ME, setSession, setMe } from '../state/auth'
import { homeOn, todayIso, unitsLoad } from '../state/units'
import { pickSquadron } from '../state/pick'
import { pageUnit } from '../state/perms'
import { HOOKS } from '../engine/hooks'
import { workOn } from './guard'
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

/* the real note display, as main.tsx installs it: the passing note and its batch — the brief's "all read the real note
   element"; put back after the press */
async function withRealNote(run: () => Promise<void>): Promise<string> {
  const realBatch = HOOKS.toastBatch
  vi.mocked(HOOKS.toast).mockImplementation(((m: any, k: any, pt: any) => realToast(m, k, pt)) as any)
  HOOKS.toastBatch = toastBatch as any
  try { await run() } finally { HOOKS.toastBatch = realBatch }
  return String(document.getElementById('toastEl')?.textContent ?? '')
}
const timesIn = (shown: string, words: string) => shown.split(words).length - 1
const reload = () => { unitsLoad(); accountsLoad() }

/* as one admin, the real door, then the signed-in admin's session put back — nothing redrawn (Astra's proof 2) */
function asSaber<T>(write: () => T): T {
  const previousSession = SESSION
  const previousMe = ME
  const session = sessionFor(signIn(SIGN.saber[0], SIGN.saber[1]))
  if (!session) throw new Error('Saber could not sign in')
  setSession(session)
  setMe(session.pid)
  try { return write() } finally { setSession(previousSession); setMe(previousMe) }
}

describe('§50 — a press that finds work changed says every note owed at that moment, together', () => {
  /* Astra's proof 1 (fixread8): Hunter's own move to 149 lands at midnight, which makes him 149's member (K3) — his session
     no longer stands; both pieces of work on his screen, nothing redrawn, a button of one of them pressed */
  describe.each([false, true])('Astra 1 — all notes at a refused press; strict=%s', strict => {
    it.each(['#accEdSave', '#apvGo'])(
      'Hunter loses his standing at midnight, nothing redraws, then %s is pressed: both close, both sentences on screen, once each',
      async pressedButton => {
        signInAs('saber')
        expect(moveMan(PID.hunter, 'u149')).toMatchObject({ ok: true })
        signInAs('newface@mail')
        expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' }, 'u149')).toBeNull()
        signInAs('hunter')
        await act(async () => { await pickSquadron('u149') })
        expect(pageUnit('own')).toBe('u149')
        const page = render(strict ? <StrictMode><Live /></StrictMode> : <Live />)
        const get = (selector: string): HTMLElement => {
          const el = page.container.querySelector<HTMLElement>(selector)
          if (!el) throw new Error(`Missing control: ${selector}`)
          return el
        }
        const click = async (selector: string) => { await act(async () => { fireEvent.click(get(selector)) }) }
        const change = async (selector: string, value: string) => {
          await act(async () => { fireEvent.change(get(selector), { target: { value } }) })
        }
        await click('[data-approve]')
        await change('#apvRole', 'admin')
        await click(`[data-testid="acc-groups"] .acc-row[data-person="${PID.osprey}"] .acc-tap`)
        const originalName = accountById(ACCT.osprey)!.name
        await change('#accEdName', 'typed@mail')
        expect({ row: workOn('userrow'), give: workOn('giveaccess') }).toEqual({ row: true, give: true })
        /* the clock moved and the facts reloaded, deliberately without notify(): the controls are the last draw's */
        on(16); reload()
        expect(homeOn(PID.hunter, todayIso())).toBe('u149')
        expect(sessionLapsed()).toBe(true)
        expect((get('#accEdName') as HTMLInputElement).value).toBe('typed@mail')
        expect((get('#apvRole') as HTMLSelectElement).value).toBe('admin')
        vi.mocked(HOOKS.toast).mockClear()
        const shown = await withRealNote(() => click(pressedButton))
        expect(accountById(ACCT.osprey)!.name).toBe(originalName)
        expect(accountByName('newface@mail')).toBeUndefined()
        expect(requestByName('newface@mail')).toBeDefined()
        expect(page.container.querySelector('#accEdName')).toBeNull()
        expect(page.container.querySelector('[data-approving]')).toBeNull()
        expect({ row: workOn('userrow'), give: workOn('giveaccess') }).toEqual({ row: false, give: false })
        expect({ osprey: timesIn(shown, changedWhileOpenWords('Osprey')), newface: timesIn(shown, changedWhileOpenWords('Newface')) })
          .toEqual({ osprey: 1, newface: 1 })
      },
    )
  })

  /* the fresh Opus 1's proof 1 (fixread8): Hunter (142's admin) has Ranger's row changed and a changed Give access
     (Newface, asking 142) both on his screen; his own move to 150 lands at midnight with nothing redrawn */
  it.each(['#accEdSave', '#apvGo'])('Opus 1 F1 — Hunter presses %s past his own midnight move, nothing redrawn: the note on screen names BOTH Ranger and Newface', async btn => {
    signInAs('saber')
    expect(moveMan(PID.hunter, third.u150), 'setup: Hunter moves to 150 from tomorrow').toMatchObject({ ok: true })
    signInAs('newface@mail')
    expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' }, 'u142'), 'setup: Newface asks to join 142').toBeNull()
    signInAs('hunter')
    const page = render(<Live />)
    const $ = (s: string) => page.container.querySelector(s) as HTMLElement | null
    await act(async () => { fireEvent.click($('[data-approve]')!) })
    await act(async () => { fireEvent.change($('#apvRole')!, { target: { value: 'admin' } }) })
    await act(async () => { fireEvent.click($(`[data-testid="acc-groups"] .acc-row[data-person="${PID.ranger}"] .acc-tap`)!) })
    await act(async () => { fireEvent.change($('#accEdName')!, { target: { value: 'typed@mail' } }) })
    expect({ row: workOn('userrow'), give: workOn('giveaccess') }, 'premise: both counted').toEqual({ row: true, give: true })
    const shown = await withRealNote(async () => {
      on(16); reload()
      expect(pageUnit('own'), 'premise: his own pages are 150\'s now, nothing redrawn').toBe(third.u150)
      await act(async () => { fireEvent.click($(btn)!) })
    })
    expect({ rowOpen: !!$('.acc-edit[data-editing]'), formOpen: !!$('[data-approving]') }, 'both pieces of work are gone').toEqual({ rowOpen: false, formOpen: false })
    expect({ ranger: timesIn(shown, changedWhileOpenWords('Ranger')), newface: timesIn(shown, changedWhileOpenWords('Newface')) })
      .toEqual({ ranger: 1, newface: 1 })
  })

  /* the fresh Opus 2's proof 1 (fixread8): the same moment, read both ways round */
  it('Opus 2 F1 — Hunter\'s move lands at midnight, nothing redrawn; Save on Ranger\'s changed row: BOTH sentences reach the note shown (Ranger\'s and Newface\'s)', async () => {
    signInAs('saber')
    expect(moveMan(PID.hunter, third.u150)).toMatchObject({ ok: true })
    signInAs('newface@mail')
    expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' }, 'u142')).toBeNull()
    signInAs('hunter')
    const page = render(<Live />)
    const $ = (s: string) => page.container.querySelector(s) as HTMLElement | null
    await act(async () => { fireEvent.click($('[data-approve]')!) })
    await act(async () => { fireEvent.change($('#apvRole')!, { target: { value: 'admin' } }) })
    await act(async () => { fireEvent.click($(`[data-testid="acc-groups"] .acc-row[data-person="${PID.ranger}"] .acc-tap`)!) })
    await act(async () => { fireEvent.change(($('#accEdName') ?? $('#accGiveName'))!, { target: { value: 'typed@mail' } }) })
    expect({ row: workOn('userrow'), give: workOn('giveaccess') }, 'premise: both counted').toEqual({ row: true, give: true })
    const shown = await withRealNote(async () => {
      on(16); reload()
      expect(pageUnit('own'), 'premise: his own pages are 150\'s now').toBe(third.u150)
      expect(todayIso()).toBe('2026-07-16')
      await act(async () => { fireEvent.click(($('#accEdSave') ?? $('#accGive'))!) })
    })
    const calls = vi.mocked(HOOKS.toast).mock.calls.map(c => String(c[0]))
    expect(calls.filter(c => c === changedWhileOpenWords('Ranger')).length, 'the press DID say Ranger\'s note').toBe(1)
    expect({ ranger: timesIn(shown, changedWhileOpenWords('Ranger')), newface: timesIn(shown, changedWhileOpenWords('Newface')) })
      .toMatchObject({ ranger: 1, newface: 1 })
  })
  it('Opus 2 F1 — the other way round: Give access pressed (New person) after the same midnight: BOTH sentences reach the note shown', async () => {
    signInAs('saber')
    expect(moveMan(PID.hunter, third.u150)).toMatchObject({ ok: true })
    signInAs('newface@mail')
    expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' }, 'u142')).toBeNull()
    signInAs('hunter')
    const page = render(<Live />)
    const $ = (s: string) => page.container.querySelector(s) as HTMLElement | null
    await act(async () => { fireEvent.click($('[data-approve]')!) })
    await act(async () => { fireEvent.change($('#apvRole')!, { target: { value: 'admin' } }) })
    await act(async () => { fireEvent.click($(`[data-testid="acc-groups"] .acc-row[data-person="${PID.ranger}"] .acc-tap`)!) })
    await act(async () => { fireEvent.change(($('#accEdName') ?? $('#accGiveName'))!, { target: { value: 'typed@mail' } }) })
    const shown = await withRealNote(async () => {
      on(16); reload()
      await act(async () => { fireEvent.click($('#apvGo')!) })
    })
    expect({ ranger: timesIn(shown, changedWhileOpenWords('Ranger')), newface: timesIn(shown, changedWhileOpenWords('Newface')) })
      .toMatchObject({ ranger: 1, newface: 1 })
  })

  /* THE CONTROLS — one note owed at the press: its sentence once, and nothing else on the note */
  it('control: Ranger\'s changed row alone, Hunter\'s move past midnight, nothing redrawn; Save: his one sentence, shown once and alone', async () => {
    signInAs('saber')
    expect(moveMan(PID.hunter, third.u150)).toMatchObject({ ok: true })
    signInAs('hunter')
    const page = render(<Live />)
    const $ = (s: string) => page.container.querySelector(s) as HTMLElement | null
    await act(async () => { fireEvent.click($(`[data-testid="acc-groups"] .acc-row[data-person="${PID.ranger}"] .acc-tap`)!) })
    await act(async () => { fireEvent.change($('#accEdName')!, { target: { value: 'typed@mail' } }) })
    const shown = await withRealNote(async () => {
      on(16); reload()
      await act(async () => { fireEvent.click($('#accEdSave')!) })
    })
    expect(!!$('.acc-edit[data-editing]'), 'the row is gone').toBe(false)
    expect(shown).toBe(changedWhileOpenWords('Ranger'))
  })
  it('control: a changed Give access alone (Newface), the same midnight; Give access pressed: its one sentence, shown once and alone, nothing written', async () => {
    signInAs('saber')
    expect(moveMan(PID.hunter, third.u150)).toMatchObject({ ok: true })
    signInAs('newface@mail')
    expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' }, 'u142')).toBeNull()
    signInAs('hunter')
    const page = render(<Live />)
    const $ = (s: string) => page.container.querySelector(s) as HTMLElement | null
    await act(async () => { fireEvent.click($('[data-approve]')!) })
    await act(async () => { fireEvent.change($('#apvRole')!, { target: { value: 'admin' } }) })
    const shown = await withRealNote(async () => {
      on(16); reload()
      await act(async () => { fireEvent.click($('#apvGo')!) })
    })
    expect(!!$('[data-approving]'), 'the form is gone').toBe(false)
    expect(accountByName('newface@mail'), 'nothing written').toBeUndefined()
    expect(shown).toBe(changedWhileOpenWords('Newface'))
  })
  it('control: an UNCHANGED Give access beside Ranger\'s changed row, the same midnight; Save: the form goes too, without a word — Ranger\'s sentence alone', async () => {
    signInAs('saber')
    expect(moveMan(PID.hunter, third.u150)).toMatchObject({ ok: true })
    signInAs('newface@mail')
    expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' }, 'u142')).toBeNull()
    signInAs('hunter')
    const page = render(<Live />)
    const $ = (s: string) => page.container.querySelector(s) as HTMLElement | null
    await act(async () => { fireEvent.click($('[data-approve]')!) })
    await act(async () => { fireEvent.click($(`[data-testid="acc-groups"] .acc-row[data-person="${PID.ranger}"] .acc-tap`)!) })
    await act(async () => { fireEvent.change($('#accEdName')!, { target: { value: 'typed@mail' } }) })
    expect({ row: workOn('userrow'), give: workOn('giveaccess') }, 'premise: the form holds no change').toEqual({ row: true, give: false })
    const shown = await withRealNote(async () => {
      on(16); reload()
      await act(async () => { fireEvent.click($('#accEdSave')!) })
    })
    expect({ rowOpen: !!$('.acc-edit[data-editing]'), formOpen: !!$('[data-approving]') }).toEqual({ rowOpen: false, formOpen: false })
    expect(shown).toBe(changedWhileOpenWords('Ranger'))
  })
  /* THE OTHER PIECE OF WORK IS JUDGED AS THE NEXT DRAW WILL JUDGE IT (the builder's reading of the brief's "every piece of
     open work no longer ok at that one moment"): a request answered by another admin is the door's to say only when ITS
     form is pressed; beside a press of the row, the form is closed now with its note, so the draw that follows has nothing
     left to say over the row's */
  it('the row pressed while the changed form\'s request was answered by another admin, nothing redrawn: both sentences on screen, once each', async () => {
    signInAs('saber')
    expect(moveMan(PID.hunter, third.u150)).toMatchObject({ ok: true })
    signInAs('newface@mail')
    expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' }, 'u142')).toBeNull()
    const req = requestByName('newface@mail')!
    signInAs('hunter')
    const page = render(<Live />)
    const $ = (s: string) => page.container.querySelector(s) as HTMLElement | null
    await act(async () => { fireEvent.click($('[data-approve]')!) })
    await act(async () => { fireEvent.change($('#apvRole')!, { target: { value: 'admin' } }) })
    await act(async () => { fireEvent.click($(`[data-testid="acc-groups"] .acc-row[data-person="${PID.ranger}"] .acc-tap`)!) })
    await act(async () => { fireEvent.change($('#accEdName')!, { target: { value: 'typed@mail' } }) })
    const shown = await withRealNote(async () => {
      expect(asSaber(() => declineRequest(req.id)), 'premise: Saber refuses the request').toBeNull()
      on(16); reload()
      await act(async () => { fireEvent.click($('#accEdSave')!) })
    })
    expect({ rowOpen: !!$('.acc-edit[data-editing]'), formOpen: !!$('[data-approving]') }).toEqual({ rowOpen: false, formOpen: false })
    expect({ ranger: timesIn(shown, changedWhileOpenWords('Ranger')), newface: timesIn(shown, changedWhileOpenWords('Newface')) })
      .toEqual({ ranger: 1, newface: 1 })
  })
})

describe('§51 — the short row\'s line press compares with the line he holds at the press', () => {
  /* Astra's proof 2 (fixread8) */
  it.each([false, true])('Astra 2 — a View pressed after an unseen removal is kept and saved; strict=%s', async strict => {
    signInAs('kestrel')
    const page = render(strict ? <StrictMode><Live /></StrictMode> : <Live />)
    const get = (selector: string): HTMLElement => {
      const el = page.container.querySelector<HTMLElement>(selector)
      if (!el) throw new Error(`Missing control: ${selector}`)
      return el
    }
    const click = async (selector: string) => { await act(async () => { fireEvent.click(get(selector)) }) }
    await act(async () => { fireEvent.change(get('#accFind'), { target: { value: 'Ranger' } }) })
    await click(`[data-testid="acc-groups"] .acc-row[data-person="${PID.ranger}"] .acc-tap`)
    const editor = '.acc-edit[data-short="1"]'
    const selected = () => get(`${editor} [data-line][aria-pressed="true"]`).getAttribute('data-line')
    expect(levelIn(ACCT.ranger, 'u149', todayIso())).toBe('view')
    expect(selected()).toBe('view')
    await click(`${editor} [data-line="none"]`)
    expect(selected()).toBe('none')
    expect(get(editor).getAttribute('data-unsaved')).toBe('true')
    expect(workOn('userrow')).toBe(true)
    /* the real write door, then Kestrel's session put back — his page neither notified nor redrawn before his next press */
    expect(asSaber(() => saveAccess(ACCT.ranger, { grants: { u149: 'none' } }))).toBeNull()
    reload()
    expect(levelIn(ACCT.ranger, 'u149', todayIso())).toBeNull()
    expect(get(editor).getAttribute('data-unsaved')).toBe('true')
    vi.mocked(HOOKS.toast).mockClear()
    /* View is now a new choice, not a put-back to the line he holds */
    await click(`${editor} [data-line="view"]`)
    const afterPick = { selected: selected(), unsaved: get(editor).getAttribute('data-unsaved') === 'true', counted: workOn('userrow') }
    await click('#accEdSave')
    reload()
    expect({ ...afterPick, saved: levelIn(ACCT.ranger, 'u149', todayIso()) })
      .toEqual({ selected: 'view', unsaved: true, counted: true, saved: 'view' })
  })
  /* the line read afresh is compared only on the very sign-in the screen showed: the pick is never made on one read
     afresh (the sixth read's security pin S1 — the builder's first draft of this round broke it, the pin caught it) */
  it('pin: no pick made; Ranger\'s sign-in put on another man and a new one given him with View of 149, nothing redrawn; None pressed on the old screen, then Save: neither sign-in written, the note', async () => {
    signInAs('kestrel')
    const page = render(<Live />)
    const $ = (s: string) => page.container.querySelector(s) as HTMLElement | null
    await act(async () => { fireEvent.change($('#accFind')!, { target: { value: 'Ranger' } }) })
    await act(async () => { fireEvent.click($(`[data-testid="acc-groups"] .acc-row[data-person="${PID.ranger}"] .acc-tap`)!) })
    const other = rosterOf('u142', todayIso()).find(id => {
      const x = (PEOPLE as any)[id]; return x && !x.special && !x.archived && !x.deleted && !accountOfPid(id)
    })!
    expect(other, 'premise: a 142 man with no sign-in').toBeTruthy()
    expect(asSaber(() => updateAccount(ACCT.ranger, { pid: other }))).toBeNull(); reload()
    expect(asSaber(() => addAccount('ranger.two@mail', PID.ranger, 'main'))).toBeNull(); reload()
    const fresh = accountOfPid(PID.ranger)!
    expect(asSaber(() => saveAccess(fresh.id, { grants: { u149: 'view' } }))).toBeNull(); reload()
    /* (the old sign-in's line as the swap left it, before Kestrel's press) */
    const oldLevel = levelIn(ACCT.ranger, 'u149', todayIso())
    vi.mocked(HOOKS.toast).mockClear()
    const none = $('.acc-edit[data-short="1"] [data-line="none"]')
    expect(none, 'premise: the old line buttons still stand, nothing redrawn').not.toBeNull()
    await act(async () => { fireEvent.click(none!) })
    const save = $('#accEdSave')
    if (save) await act(async () => { fireEvent.click(save) })
    reload()
    expect({
      fresh: levelIn(fresh.id, 'u149', todayIso()),
      old: levelIn(ACCT.ranger, 'u149', todayIso()),
      rowOpen: !!$('.acc-edit[data-short="1"]'),
      note: vi.mocked(HOOKS.toast).mock.calls.filter(c => c[0] === changedWhileOpenWords('Ranger')).length,
    }).toEqual({ fresh: 'view', old: oldLevel, rowOpen: false, note: 1 })
  })
})
