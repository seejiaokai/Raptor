// @vitest-environment jsdom
/* ADMIN → USERS ACROSS SQUADRONS — STEP U1'S ELEVENTH ROUND: "+ ADD A PERSON" AND REFUSE KEEP THEIR RECEIPT (the brief
   docs/superpowers/briefs/2026-11-27-msq-s2-u1fix11-brief.md; the earlier rounds' tests are msq-s2-rejudge.test.tsx to
   msq-s2-rejudge10.test.tsx).
   The tenth round's blind read found the two writing presses round 10 left out of "a press that writes keeps its own
   receipt" (msq-s2-rejudge10 §63): neither "+ Add a person" nor Refuse on the waiting list is a piece of open work, so
   neither ran its write through the page's afterWrite. The add answered a waiting request (its sign-in the request's
   name) or took an archived man's callsign; Refuse ran past midnight beside a row whose man's move had landed unseen.
   Each said its receipt, then the redraw closed the other work and said its note in a batch of its own — the passing note
   is one element, so the receipt was replaced.
   §64 Now both run their write through the page's addWrite: the write, then BOTH pieces of open work judged at once as
       the next draw would judge them, every one that closes let go, the callsigns owed a note said after the receipt —
       one batch, one line.
   The readers' proofs (fixread10 — opus1 proof 1 and 2, opus2 proof 1 and 2, Astra's proof 1) are kept here as lasting tests, written
   before the app changed and each run on the code as it stood; a test named "control" holds what is built today and must
   go on holding. Each test reads the real note element.
   The world: three squadrons (withThird — his D2630), Wed 15 Jul 26, 09:00. Hunter — 142's admin, Plan of 149, View of
   150; Saber — master admin, home 142; Ranger — 142's member; Kestrel — 149's admin; Osprey — 149's member. */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { StrictMode, useState } from 'react'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { withThird, signInAs, PID, on, moveMan } from '../test-support/msq-world'
import { UsersPanel } from './UsersPanel'
import { useVersion } from './useStore'
import { changedWhileOpenWords } from './useraccess-model'
import { accountByName, accountsLoad, requestAccess, requestByName } from '../state/accounts'
import { homeOn, todayIso, unitsLoad } from '../state/units'
import { PEOPLE, nameToId } from '../engine/people'
import { HOOKS } from '../engine/hooks'
import { notify } from '../state/store'
import { workOn } from './guard'
import { archivePerson } from '../leavewar/sync'
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

async function fillAdd($: (s: string) => HTMLElement | null, cs: string, name: string) {
  await act(async () => { fireEvent.click($('#accAddOpen')!) })
  await act(async () => { fireEvent.change($('#accAddCs')!, { target: { value: cs } }) })
  await act(async () => { fireEvent.change($('#accAddSeat')!, { target: { value: 'FCP' } }) })
  await act(async () => { fireEvent.change($('#accAddCat')!, { target: { value: 'C' } }) })
  if (name) await act(async () => { fireEvent.change($('#accAddName')!, { target: { value: name } }) })
}

describe('§64 — "+ Add a person" keeps its receipt: the other piece\'s note follows it, one line', () => {
  it('opus1 proof 1a: Give access changed on Newface\'s request; the add with sign-in newface@mail answers it — the receipt, then the form\'s note', async () => {
    signInAs('newface@mail')
    expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' }, 'u142')).toBeNull()
    signInAs('hunter')
    const page = render(<Live />)
    const $ = (s: string) => page.container.querySelector(s) as HTMLElement | null
    await act(async () => { fireEvent.click($('[data-approve]')!) })
    await act(async () => { fireEvent.change($('#apvRole')!, { target: { value: 'admin' } }) })
    await fillAdd($, 'Zedd', 'newface@mail')
    const shown = await withRealNote(async () => { await act(async () => { fireEvent.click($('#accAdd')!) }) })
    expect(accountByName('newface@mail'), 'premise: the add wrote his sign-in').toBeDefined()
    expect(requestByName('newface@mail'), 'premise: and answered the request').toBeUndefined()
    const receipt = 'Zedd added — newface@mail can sign in now', note = changedWhileOpenWords('Newface')
    expect({ formOpen: !!$('[data-approving]'), receipt: timesIn(shown, receipt), note: timesIn(shown, note), shown })
      .toEqual({ formOpen: false, receipt: 1, note: 1, shown: `${receipt} · ${note}` })
  })

  it('opus1 proof 1b: an archived man\'s row open; the add under his callsign (free while he is archived) — the receipt and the row\'s note', async () => {
    signInAs('hunter')
    expect(archivePerson(PID.ranger).bad, 'setup: Ranger archived').toBeNull()
    const rcs = String((PEOPLE as any)[PID.ranger].cs)
    const page = render(<Live />)
    const $ = (s: string) => page.container.querySelector(s) as HTMLElement | null
    await act(async () => { fireEvent.click($('#accArchToggle')!) })
    await act(async () => { fireEvent.click($(`.acc-row[data-archived="1"][data-person="${PID.ranger}"] .acc-tap`)!) })
    expect($('#accArCs'), 'premise: his archived row is open').not.toBeNull()
    await fillAdd($, rcs, '')
    const shown = await withRealNote(async () => { await act(async () => { fireEvent.click($('#accAdd')!) }) })
    const receipt = `${rcs} added to the roster — set flight and quals on the Quals page`, note = changedWhileOpenWords(rcs)
    expect({ rowOpen: !!$('#accArCs'), receipt: timesIn(shown, receipt), note: timesIn(shown, note), shown })
      .toEqual({ rowOpen: false, receipt: 1, note: 1, shown: `${receipt} · ${note}` })
  })

  it('opus2 proof 1: Kestrel types on Osprey\'s archived row, then adds a new man under Osprey\'s callsign — the receipt and the row\'s note', async () => {
    signInAs('kestrel')
    const osCs = String((PEOPLE as any)[PID.osprey].cs)
    expect(archivePerson(PID.osprey).bad, 'setup: Kestrel archives Osprey').toBeFalsy()
    reload()
    const page = render(<Live />)
    const $ = (s: string) => page.container.querySelector(s) as HTMLElement | null
    if (!$('#accArchList')) await act(async () => { fireEvent.click($('#accArchToggle')!) })
    await act(async () => { fireEvent.click($(`#accArchList .acc-row[data-person="${PID.osprey}"] .acc-tap`)!) })
    expect($('#accArCs'), 'premise: his archived row is open').not.toBeNull()
    await act(async () => { fireEvent.change($('#accArCs')!, { target: { value: 'Ospreyx' } }) })
    await fillAdd($, osCs, '')
    const shown = await withRealNote(async () => { await act(async () => { fireEvent.click($('#accAdd')!) }) })
    const added = nameToId(osCs)
    expect(added && added !== PID.osprey, 'premise: a new man holds the callsign now').toBe(true)
    expect($('#accArCs'), 'premise: the archived row closed (its copy changed)').toBeNull()
    const receipt = `${osCs} added to the roster — set flight and quals on the Quals page`, note = changedWhileOpenWords(osCs)
    expect({ receipt: timesIn(shown, receipt), note: timesIn(shown, note), shown })
      .toEqual({ receipt: 1, note: 1, shown: `${receipt} · ${note}` })
  })

  it('opus2 proof 2: a changed Give access, then the add with the request\'s sign-in — the receipt and the form\'s note', async () => {
    signInAs('newface@mail')
    expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' }, 'u142')).toBeNull()
    signInAs('hunter')
    const page = render(<Live />)
    const $ = (s: string) => page.container.querySelector(s) as HTMLElement | null
    await act(async () => { fireEvent.click($('[data-approve]')!) })
    await act(async () => { fireEvent.change($('#apvRole')!, { target: { value: 'admin' } }) })
    await fillAdd($, 'Newbie', 'newface@mail')
    const shown = await withRealNote(async () => { await act(async () => { fireEvent.click($('#accAdd')!) }) })
    expect(accountByName('newface@mail'), 'premise: the add wrote the sign-in').toBeDefined()
    expect(requestByName('newface@mail'), 'premise: and so answered the request').toBeUndefined()
    expect($('[data-approving]'), 'premise: the form is gone').toBeNull()
    const receipt = 'Newbie added — newface@mail can sign in now', note = changedWhileOpenWords('Newface')
    expect({ receipt: timesIn(shown, receipt), note: timesIn(shown, note), shown })
      .toEqual({ receipt: 1, note: 1, shown: `${receipt} · ${note}` })
  })

  it('control: the add with no other open work shows its receipt alone, once', async () => {
    signInAs('hunter')
    const page = render(<Live />)
    const $ = (s: string) => page.container.querySelector(s) as HTMLElement | null
    await fillAdd($, 'Zedd', '')
    const shown = await withRealNote(async () => { await act(async () => { fireEvent.click($('#accAdd')!) }) })
    expect(shown).toBe('Zedd added to the roster — set flight and quals on the Quals page')
  })
})

/* Astra's proof 1 (fixread10): the add named Newface with the request's sign-in, beside a Give access form changed or
   not, plain and under StrictMode; a draw after the press says nothing more */
describe.each([false, true])('§64 Astra proof 1 — the add keeps its receipt beside an open Give access form; strict=%s', strict => {
  it.each([false, true])('the receipt, and the closure note only where owed; form changed=%s', async changed => {
    signInAs('newface@mail')
    expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' }, 'u142')).toBeNull()
    signInAs('hunter')
    const page = render(strict ? <StrictMode><Live /></StrictMode> : <Live />)
    const get = (sel: string): HTMLElement => {
      const el = page.container.querySelector<HTMLElement>(sel)
      if (!el) throw new Error(`Missing control: ${sel}`)
      return el
    }
    const click = async (sel: string) => { await act(async () => { fireEvent.click(get(sel)) }) }
    const change = async (sel: string, value: string) => { await act(async () => { fireEvent.change(get(sel), { target: { value } }) }) }
    await click('[data-approve]')
    if (changed) await change('#apvRole', 'admin')
    expect(workOn('giveaccess')).toBe(changed)
    expect(page.container.querySelector('[data-approving]')).not.toBeNull()
    await click('#accAddOpen')
    await change('#accAddCs', 'Newface')
    await change('#accAddIni', 'NF')
    await change('#accAddSeat', 'FCP')
    await change('#accAddCat', 'C')
    await change('#accAddName', 'newface@mail')
    expect(requestByName('newface@mail')).toBeDefined()
    expect(workOn('giveaccess')).toBe(changed)
    const previousBatch = HOOKS.toastBatch
    vi.mocked(HOOKS.toast).mockClear()
    vi.mocked(HOOKS.toast).mockImplementation(((m: any, k: any, pt: any) => realToast(m, k, pt)) as any)
    HOOKS.toastBatch = toastBatch as any
    try {
      await click('#accAdd')
      /* the add succeeded and answered the request */
      expect(accountByName('newface@mail')).toMatchObject({ name: 'newface@mail', role: 'main', on: true })
      expect(requestByName('newface@mail')).toBeUndefined()
      expect(page.container.querySelector('[data-approving]')).toBeNull()
      expect(workOn('giveaccess')).toBe(false)
      const receipts = vi.mocked(HOOKS.toast).mock.calls.map(c => String(c[0])).filter(m => m.includes('newface@mail can sign in now'))
      expect(receipts).toHaveLength(1)
      const receipt = receipts[0]!, note = changedWhileOpenWords('Newface')
      const shown = document.getElementById('toastEl')?.textContent ?? ''
      /* the real note, not merely the calls made to it */
      expect({ receipt: timesIn(shown, receipt), note: timesIn(shown, note) }).toEqual({ receipt: 1, note: changed ? 1 : 0 })
      if (changed) expect(shown.indexOf(receipt)).toBeLessThan(shown.indexOf(note))
      else expect(shown).toBe(receipt)
      await act(async () => { notify() })
      expect(document.getElementById('toastEl')?.textContent ?? '').toBe(shown)
    } finally { HOOKS.toastBatch = previousBatch }
  })
})

describe('§64 — Refuse on the waiting list keeps its receipt: the other piece\'s note follows it, one line', () => {
  it('opus1 proof 2: Refuse past midnight beside Ranger\'s whole row, his move landed unseen — "Refused newface@mail", then Ranger\'s note', async () => {
    signInAs('newface@mail')
    expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' }, 'u142')).toBeNull()
    signInAs('saber')
    expect(moveMan(PID.ranger, 'u149'), 'setup: Ranger\'s move to 149 saved, from tomorrow').toMatchObject({ ok: true })
    signInAs('hunter')
    const page = render(<Live />)
    const $ = (s: string) => page.container.querySelector(s) as HTMLElement | null
    await act(async () => { fireEvent.click($(`[data-testid="acc-groups"] .acc-row[data-person="${PID.ranger}"] .acc-tap`)!) })
    await act(async () => { fireEvent.change($('#accEdName')!, { target: { value: 'typed@mail' } }) })
    const shown = await withRealNote(async () => {
      on(16)
      expect(homeOn(PID.ranger, todayIso()), 'premise: his move has landed').toBe('u149')
      await act(async () => { fireEvent.click($('[data-decline]')!) })
    })
    expect(requestByName('newface@mail'), 'premise: refused').toBeUndefined()
    const receipt = 'Refused newface@mail', note = changedWhileOpenWords('Ranger')
    expect({ rowOpen: !!$('.acc-edit[data-editing]'), receipt: timesIn(shown, receipt), note: timesIn(shown, note), shown })
      .toEqual({ rowOpen: false, receipt: 1, note: 1, shown: `${receipt} · ${note}` })
  })

  it('control: Refuse with no other open work shows "Refused <name>" alone, once', async () => {
    signInAs('newface@mail')
    expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' }, 'u142')).toBeNull()
    signInAs('hunter')
    const page = render(<Live />)
    const $ = (s: string) => page.container.querySelector(s) as HTMLElement | null
    const shown = await withRealNote(async () => { await act(async () => { fireEvent.click($('[data-decline]')!) }) })
    expect(requestByName('newface@mail'), 'premise: refused').toBeUndefined()
    expect(shown).toBe('Refused newface@mail')
  })
})
