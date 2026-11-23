/* THE SANS CALENDAR FADES A MAN'S OWN DAYS BEFORE HIS SANS DATE (owner D2343, D2346 — 23 Nov 26: "A").
   D2343: "We can do the extra shading too" — a man posted out as SANS from a date ahead sees his own days before that date
   shaded, so it shows at a glance from when he can commit. D2346: look A, faded — the day's colour wash taken off and its
   figures dimmed, never the posting-out stripes (the drawing: docs/mock/2026-11-23-sans-before-shading/, its STYLE.A).
   The agent's readings shown in the drawing and kept by him: his view only, an admin's unchanged; only while his SANS date
   is ahead, gone from that date; a shaded day still opens, "+ Commitment" greyed for him (D2340).
   The fixture is sans-ahead.test.ts's: the demo week of Mon 13 Jul 26, today Wed 15 Jul; `rocky` is Hex ("hex"); Saber
   the admin ("ad"). Each case failed before the build. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render } from '@testing-library/react'
import { storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { NOTICES } from '../state/notices'
import { setCalMonth } from '../state/view'
import { sansBeforeMine } from '../ui/sanscal-model'
import { maySansAdd } from '../ui/sansadd'
import { SansCal } from '../ui/SansCal'
import { initStore as lwInitStore, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { postOut, runPoOutcomes, undoPostOut, wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = '', DAYS0 = '', INPUTS0 = ''
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const FRI = '2026-07-17', THU = '2026-07-16', MON = '2026-07-13', SAT = '2026-07-18', JUN30 = '2026-06-30'
const at = (y: number, m: number, d: number) => vi.setSystemTime(new Date(y, m - 1, d, 9, 0, 0))
const faded = (iso: string): boolean => !!document.querySelector(`[data-testid="sc-day-${iso}"]`)?.classList.contains('is-before')
const showJuly = () => { setCalMonth({ y: 2026, m: 7 }); render(<SansCal />) }

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  PEOPLE0 = JSON.stringify(PEOPLE); DAYS0 = JSON.stringify(DAYS); INPUTS0 = JSON.stringify(INPUTS)
})
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  at(2026, 7, 15)
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v } }
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  DAYS.length = 0; JSON.parse(DAYS0).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(INPUTS0).forEach((i: any) => INPUTS.push(i))
  NOTICES.length = 0
  lwInitStore(memoryBackend())
  raptorInitStore()
  accountsLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  signInAs('ad', 'a')
})
afterEach(() => { cleanup(); setCalMonth(null); resetSession(null); vi.restoreAllMocks() })

describe('D2346 — look A: his own days before his SANS date, faded', () => {
  it('Hex, posted out as SANS from Fri 17 Jul on Wed 15: his days before Fri fade, Fri on do not', () => {
    expect(postOut('rocky', FRI, 'sans')).toBe(true); raptorNotify()
    signInAs('hex')
    expect(sansBeforeMine(THU, '2026-07-15')).toBe(true)
    expect(sansBeforeMine(FRI, '2026-07-15')).toBe(false)
    showJuly()
    for (const d of ['2026-07-01', MON, THU]) expect(faded(d), d).toBe(true)
    for (const d of [FRI, SAT, '2026-07-31']) expect(faded(d), d).toBe(false)
  })

  it('the fade is exactly the days his own "+ Commitment" is greyed on', () => {
    expect(postOut('rocky', FRI, 'sans')).toBe(true); raptorNotify()
    signInAs('hex')
    for (const d of [JUN30, MON, THU, FRI, SAT]) expect(sansBeforeMine(d, '2026-07-15'), d).toBe(!maySansAdd(d))
  })

  it('an admin\'s view is unchanged — nothing faded, whoever is posted', () => {
    expect(postOut('rocky', FRI, 'sans')).toBe(true); raptorNotify()
    expect(sansBeforeMine(THU, '2026-07-15')).toBe(false)
    showJuly()
    expect(document.querySelectorAll('[data-testid="sanscal"] .sc-day.is-before').length).toBe(0)
  })

  it('a man with no SANS posting ahead sees nothing faded — a SANS man by his tick, or a regular', () => {
    signInAs('hex')   // not posted: a regular
    expect(sansBeforeMine(THU, '2026-07-15')).toBe(false)
    const sans = Object.keys(PEOPLE).find(id => (PEOPLE as any)[id].san && !(PEOPLE as any)[id].archived && !(PEOPLE as any)[id].special)!
    expect(sans).toBeTruthy()
    showJuly()
    expect(document.querySelectorAll('[data-testid="sanscal"] .sc-day.is-before').length).toBe(0)
  })

  it('gone from that date: once his posting has run on Fri 17, nothing fades', () => {
    expect(postOut('rocky', FRI, 'sans')).toBe(true); raptorNotify()
    at(2026, 7, 17); runPoOutcomes(); raptorNotify()
    expect((PEOPLE as any).rocky.san, 'premise: the posting ran').toBe(true)
    signInAs('hex')
    expect(sansBeforeMine(THU, '2026-07-17')).toBe(false)
    showJuly()
    expect(faded(THU)).toBe(false)
  })

  it('the posting taken back: the fade goes with it, at once', () => {
    expect(postOut('rocky', FRI, 'sans')).toBe(true); raptorNotify()
    signInAs('hex')
    showJuly()
    expect(faded(THU)).toBe(true)
    signInAs('ad', 'a')
    act(() => { expect(undoPostOut('rocky')).toBe(true); raptorNotify() })
    signInAs('hex')
    act(() => { raptorNotify() })
    expect(faded(THU)).toBe(false)
  })
})
