// @vitest-environment jsdom
/* [END-TIME-GUARD] step 2 — THE THREE DOORS REFUSE WHILE A TIME IS MISSING (his D2612, D2852, D2854, D2855; the plan
   docs/superpowers/plans/2026-11-27-end-time-guard-plan.md §R3). Driven through the real App: a sign-off picked in Edit
   Schedule's own sign-off box (ui/Shell.tsx's one listener → ui/oilsign.ts signPick), and Publish day / Publish AL
   through the commands every button calls (state/sched-commit.ts — the week's two buttons and the Amendments panel's
   call nothing else). Thursday (day 3) has every time typed in the demo week; each case empties one. The press on the
   greyed buttons themselves (D2855 E1) is the screens' step, not this file's. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { SCHED, signOf, signShown, dayApproved } from '../engine/publish'
import { txtSet } from '../engine/slots'
import { DPREV, VWORK } from '../state/view'
import { HOOKS } from '../engine/hooks'
import { commitSetDayApproved, commitPublishALDay } from '../state/sched-commit'
import { setPublishGate, publishGate } from '../state/inputgate-hook'
import { setTimeRefusedHook, timeRefusalWords } from '../state/timeguard'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const THU = 3
let DSNAP = ''
let host: HTMLDivElement
let root: Root
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const pick = async (sel: HTMLSelectElement, value: string) => {
  await act(async () => { sel.value = value; sel.dispatchEvent(new Event('change', { bubbles: true })) })
}
let said: Array<[string, any]> = []
let refused: Array<[number, string]> = []
const realToast = HOOKS.toast
const signSel = (k: string) => $(`#eWeek .day[data-day="${THU}"] select[data-sign="${k}"]`) as unknown as HTMLSelectElement
const edit = async (path: string, v: string) => { await act(async () => { expect(txtSet(path, v), `typed ${path}`).toBe(true); notify() }) }
/* four names written straight into the record — an older saved week signed before this rule (the command layer is the
   backstop for exactly that) */
const signFour = async (di: number) => { await act(async () => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'; notify() }) }
const NM = () => signSel('cur').options[2]!.value
const blocked = () => said.filter(([, k]) => k === 'blocked').map(([m]) => m)

beforeAll(async () => {
  initStore(); DSNAP = JSON.stringify(DAYS)
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click([...document.querySelectorAll('.nav a[data-page]')].find((a: any) => a.dataset.page === 'editsched')!)
})
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove(); HOOKS.toast = realToast; setTimeRefusedHook(null)
})
beforeEach(async () => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.drafts = {}; SCHED.curDraft = {}
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}; SCHED.signBind = {}; SCHED.correcting = {}
  DPREV.clear(); VWORK.clear()
  said = []; refused = []
  HOOKS.toast = ((m: any, k: any) => { said.push([String(m), k]) }) as any
  setTimeRefusedHook((di, door) => { refused.push([di, door]) })
  await act(async () => { notify() })
})

describe('the words (D2854; Fable\'s three build notes)', () => {
  it('three items, each door; one item, each door; the AL named is the one the press would publish', () => {
    expect(timeRefusalWords(3, 'sign', THU)).toBe('Blocked: 3 items are missing a time, each outlined in red. Type the missing times, then sign.')
    expect(timeRefusalWords(3, 'publish', THU)).toBe('Blocked: 3 items are missing a time, each outlined in red. Thursday was not published.')
    expect(timeRefusalWords(3, 'publishAL', THU)).toBe('Blocked: 3 items are missing a time, each outlined in red. AL1 was not published.')
    expect(timeRefusalWords(1, 'sign', THU)).toBe('Blocked: 1 item is missing a time, outlined in red. Type the missing time, then sign.')
    expect(timeRefusalWords(1, 'publish', THU)).toBe('Blocked: 1 item is missing a time, outlined in red. Thursday was not published.')
    expect(timeRefusalWords(1, 'publishAL', THU)).toBe('Blocked: 1 item is missing a time, outlined in red. AL1 was not published.')
  })
})

describe('a sign-off box pressed while a time is missing (D2612, D2854)', () => {
  it('Thursday as the demo has it is signable — the case below is the gap, not the day', async () => {
    await pick(signSel('cur'), NM())
    expect(signShown(THU).cur).toBe(NM())
    expect(blocked()).toEqual([])
  })

  it('one desk END emptied: CUR CK is refused with the one-item words, nothing written, the box back to "— name —"', async () => {
    await edit('dr:3.0.0.end', '')
    const sel = signSel('cur')
    await pick(sel, NM())
    expect(signOf(THU).cur, 'nothing written').toBeFalsy()
    expect(signSel('cur').value, 'the box reads what is written').toBe('')
    expect(blocked()).toEqual(['Blocked: 1 item is missing a time, outlined in red. Type the missing time, then sign.'])
    expect(refused, 'the screens are told').toEqual([[THU, 'sign']])
  })

  it('each of the four boxes is refused the same way; three items take the plural words', async () => {
    await edit('dr:3.0.0.end', ''); await edit('dr:3.0.1.str', ''); await edit('gr:3.0.end', '')
    for (const k of ['cur', 'sked', 'plan', 'appr']) {
      const sel = signSel(k)
      await pick(sel, sel.options[2]!.value)
      expect((signOf(THU) as any)[k], `${k} not written`).toBeFalsy()
    }
    expect(blocked()).toEqual(Array(4).fill('Blocked: 3 items are missing a time, each outlined in red. Type the missing times, then sign.'))
  })

  it('the missing time typed: the next press signs', async () => {
    await edit('dr:3.0.0.end', '')
    await pick(signSel('cur'), NM())
    expect(signOf(THU).cur).toBeFalsy()
    await edit('dr:3.0.0.end', '13:00')
    await pick(signSel('cur'), NM())
    expect(signShown(THU).cur).toBe(NM())
    expect(blocked()).toHaveLength(1)
  })

  it('taking a name out is never refused', async () => {
    await pick(signSel('cur'), NM())
    await act(async () => { DAYS[THU].dutywaves[0].rows[0].end = ''; signOf(THU).cur = 'ignite'; SCHED.signBind = {}; notify() })
    await pick(signSel('cur'), '')
    expect(signOf(THU).cur).toBe('')
    expect(blocked()).toEqual([])
  })
})

describe('Publish day while a time is missing (D2612, D2855 E1)', () => {
  it('refused before the signature check, with "Thursday was not published." — nothing minted, no publish gate', async () => {
    let gated = 0; const realGate = publishGate(); setPublishGate(() => { gated++ })
    try {
      await signFour(THU)
      await act(async () => { DAYS[THU].dutywaves[0].rows[0].end = ''; notify() })
      await act(async () => { commitSetDayApproved(THU, true); notify() })
      expect(dayApproved(THU), 'not published').toBe(false)
      expect((SCHED.orig || {})[THU], 'no Original minted').toBeFalsy()
      expect(gated, 'the publish gate never ran').toBe(0)
      expect(blocked()).toEqual(['Blocked: 1 item is missing a time, outlined in red. Thursday was not published.'])
      expect(refused).toEqual([[THU, 'publish']])
    } finally { setPublishGate(realGate) }
  })

  it('unsigned with a gap: the time note, not the sign-off note (D2855 E1)', async () => {
    await act(async () => { DAYS[THU].dutywaves[0].rows[0].end = ''; notify() })
    await act(async () => { commitSetDayApproved(THU, true); notify() })
    expect(dayApproved(THU)).toBe(false)
    expect(said.map(([m]) => m)).toEqual(['Blocked: 1 item is missing a time, outlined in red. Thursday was not published.'])
  })

  it('with every time typed it publishes as before', async () => {
    await signFour(THU)
    await act(async () => { commitSetDayApproved(THU, true); notify() })
    expect(dayApproved(THU)).toBe(true)
    expect(blocked()).toEqual([])
  })

  it('a press on a day already published is the engine\'s no-op, never the time note (the fresh Opus red-team read, 2d)', async () => {
    await signFour(THU)
    await act(async () => { commitSetDayApproved(THU, true); notify() })
    said = []
    await act(async () => { DAYS[THU].dutywaves[0].rows[0].end = ''; notify() })
    await act(async () => { commitSetDayApproved(THU, true); notify() })
    expect(blocked()).toEqual([])
    expect(refused).toEqual([])
  })
})

describe('Publish AL while a time is missing (D2612, D2854)', () => {
  const publishThu = async () => { await signFour(THU); await act(async () => { commitSetDayApproved(THU, true); notify() }); expect(dayApproved(THU)).toBe(true) }

  it('refused with "AL1 was not published." — no amendment minted', async () => {
    await publishThu()
    await edit('dr:3.0.0.end', '')
    await signFour(THU)
    said = []
    await act(async () => { commitPublishALDay(THU); notify() })
    expect((SCHED.als || []).length, 'no AL minted').toBe(0)
    expect(blocked()).toEqual(['Blocked: 1 item is missing a time, outlined in red. AL1 was not published.'])
    expect(refused).toEqual([[THU, 'publishAL']])
  })

  it('after AL1 went out, the next refusal names AL2', async () => {
    await publishThu()
    await edit('dr:3.0.0.end', '13:30'); await signFour(THU)
    await act(async () => { commitPublishALDay(THU); notify() })
    expect((SCHED.als || []).length, 'AL1 published').toBe(1)
    await edit('dr:3.0.0.end', ''); await signFour(THU)
    said = []
    await act(async () => { commitPublishALDay(THU); notify() })
    expect((SCHED.als || []).length).toBe(1)
    expect(blocked()).toEqual(['Blocked: 1 item is missing a time, outlined in red. AL2 was not published.'])
  })

  it('on a day still a draft the engine\'s own note answers, never the time note (2d)', async () => {
    await act(async () => { DAYS[THU].dutywaves[0].rows[0].end = ''; notify() })
    await act(async () => { commitPublishALDay(THU); notify() })
    expect(blocked()).toEqual([])
    expect(said.map(([m]) => m).join(' ')).toMatch(/still a draft/)
  })
})
