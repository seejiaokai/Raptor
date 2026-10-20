// @vitest-environment jsdom
/* [OIL-ASK-HEAD-SEVERAL] — the narrow read of the Inputs batch's fixes, FX-1 (13 Oct 26). Where the OIL question waits
   before a change, its sheet is headed for EVERYONE the one answer is written for — "OIL — Bane +2, Duty" (owner D762) —
   as the row's door, the Inputs list and the put-back already head it. Two older doors headed it with the input's first
   person alone: an input of several DRAGGED on the Inputs calendar onto a weekend, and one man of several REPLACED on an
   Unavailable row. The answer was written for everyone either way; only the heading was short. Both doors go through
   ui/inputedit.tsx oilFirst, which now takes the door's `who`. */
import { beforeAll, beforeEach, afterEach, describe, expect, it } from 'vitest'
import { initStore, setSession, histInit, writeInputsBatch } from '../state/store'
import { setMe } from '../state/auth'
import { INPUTS, idsOf, mintInpIds } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { PEOPLE } from '../engine/people'
import { OILWAIT, setOilWait, setOilBar } from '../state/view'
import { commitInput, draftOf, reassignInput, inputWho } from './inputedit'
import { commitChipMove } from './caldrag'
import { answerOilWait } from './oilwait'

const ISNAP = JSON.stringify(INPUTS)
const cs = (p: string) => PEOPLE[p].cs
/* "first A to Z +n" — ui/inputedit.tsx inputWho's own form, from the callsigns */
const az = (ids: string[]) => `${ids.map(cs).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))[0]} +${ids.length - 1}`
const realToast = HOOKS.toast
beforeAll(() => { initStore() })
beforeEach(() => {
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  mintInpIds()
  setSession({ user: 'a', role: 'admin' } as any)
  setMe('bane')
  HOOKS.toast = (() => {}) as any
  histInit()
})
afterEach(() => { HOOKS.toast = realToast; setOilWait(null); setOilBar(null) })

/* an input of three, filed through the app's own save, on the day given — answered where that day asks */
function three(date: string, oil?: Record<string, number>): any {
  const d = draftOf({ person: 'bane', type: 'OD', date, yr: 2026, allday: true, remarks: '' })
  expect(commitInput(null, d, ['bane', 'pike', 'split'], oil ? { oil } : undefined)).toBe(true)
  return INPUTS.find((i: any) => i.type === 'OD' && i.date === date && idsOf(i).length === 3)!
}

describe('the waiting OIL question is headed for everyone in an input of several', () => {
  it('dragged on the Inputs calendar onto a weekend: "<first A to Z> +2", not its first man alone', () => {
    const r = three('Jul 17')                                  // a Friday: nothing to ask
    expect(commitChipMove({ kind: 'input', iid: r.iid } as any, '2026-07-17', '2026-07-18')).toBe(false)
    expect(OILWAIT && OILWAIT.kind, 'the question waits, nothing moved').toBe('move')
    expect(OILWAIT!.gate.who).toBe(inputWho(r))
    expect(OILWAIT!.gate.who).toBe(az(['bane', 'pike', 'split']))
    expect(answerOilWait({ '2026-07-18': 1 })).toBe(true)
    const now = INPUTS.find((i: any) => i.iid === r.iid)!
    expect(now.date, 'and the answer makes the move').toBe('Jul 18')
  })

  it('one man of several replaced on an Unavailable row: headed for the people it will hold', () => {
    const r = three('Jul 17')
    /* moved to Saturday by the calendar and answered there; then its answer is taken away by the scheduler's own
       "Not earning" — so a hand-over now finds a weekend input nobody has answered (the read's way in (b)) */
    writeInputsBatch(() => { const x = INPUTS.find((i: any) => i.iid === r.iid)!; x.date = 'Jul 18'; delete x.oil })
    /* the newcomer (Blade) sorts before all three, so the heading says whether he was counted in Bane's place */
    expect(az(['slash', 'pike', 'split']), 'the newcomer changes who leads the heading').not.toBe(az(['bane', 'pike', 'split']))
    expect(reassignInput(r.iid, 'slash')).toBe(false)
    expect(OILWAIT && OILWAIT.kind, 'the question waits, nobody handed over').toBe('swap')
    expect(OILWAIT!.gate.who, 'headed for the three it will hold, the newcomer among them').toBe(az(['slash', 'pike', 'split']))
    expect(answerOilWait({ '2026-07-18': 1 })).toBe(true)
    expect(idsOf(INPUTS.find((i: any) => i.iid === r.iid)).map(String).sort()).toEqual(['pike', 'slash', 'split'])
  })

  it('an input of ONE is still headed with its one man — the gate’s own heading, as before', () => {
    const d = draftOf({ person: 'bane', type: 'OD', date: 'Jul 17', yr: 2026, allday: true, remarks: '' })
    expect(commitInput(null, d, ['bane'])).toBe(true)
    const r = INPUTS.find((i: any) => i.type === 'OD' && i.date === 'Jul 17' && idsOf(i).length === 1)!
    expect(commitChipMove({ kind: 'input', iid: r.iid } as any, '2026-07-17', '2026-07-18')).toBe(false)
    expect(OILWAIT!.gate.who).toBe(cs('bane'))
  })
})
