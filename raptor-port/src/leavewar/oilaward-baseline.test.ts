// THE OIL BALANCES BEFORE THE AWARD MOVED — a LITERAL baseline ([OIL-AWARD-IS-A-GRANT], 29 Sep 26; Astra's plan read
// F12). Every hand-given OIL award moved from the war's own records into the ledger (one kind of award — D147, D400,
// D402), and the demo seed with it (D401). The move must not change what any man is owed, so the numbers below were
// CAPTURED FROM THE SEED AND THE DEMO OIL STORY BEFORE EITHER WAS REWRITTEN — never recomputed from the new seed, which
// would pass whatever the rewrite did. Each line: the OIL balance, and every credit as [date, amount, left] (the FIFO
// allocation — which credit each day taken drew from), sorted, so a change of source name or id cannot hide a change
// of arithmetic.
import { beforeEach, describe, expect, it } from 'vitest'

import { oilLedgerOf } from './engine'
import { DEMO_OIL } from './state/demoworld'
import { figureCtxOf, getState, initStore, installDemoOil } from './state/store'
import { memoryBackend } from './state/storage'
import { fileAbsence } from './testkit'

/* the demo story's OIL days taken (demoworld.ts DEMO_OIL_TAKEN — filed here as the approved Inputs installDemoWorld files) */
const TAKEN: Array<[string, string]> = [
  ['ramp', '2026-05-11'], ['ramp', '2026-05-12'], ['ramp', '2026-06-13'],
  ['tata', '2026-03-02'], ['tata', '2026-03-30'],
  ['asics', '2026-07-15'], ['asics', '2026-07-16'],
  ['miles', '2026-06-01'], ['miles', '2026-06-02'], ['miles', '2026-06-03'],
  ['reset', '2027-02-15'],
  ['slammed', '2026-01-14'],
]

function snapshot(): Record<string, { balance: number; credits: Array<[string, number, number]> }> {
  const ctx = { ...figureCtxOf(), asOf: '2027-12-31' }
  const out: Record<string, { balance: number; credits: Array<[string, number, number]> }> = {}
  for (const p of getState().people) {
    const led = oilLedgerOf(ctx, p.id)
    const credits = led.credits.map(c => [c.date, c.amount, c.left] as [string, number, number])
      .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] - b[1] || a[2] - b[2]))
    if (!credits.length && !led.balance) continue
    out[p.id] = { balance: led.balance, credits }
  }
  return out
}

describe('the OIL balances the award move must keep (captured before it)', () => {
  beforeEach(() => initStore(memoryBackend()))

  it('the pristine seed', () => {
    expect(snapshot()).toEqual(SEED_BASELINE)
  })

  it('the seed with the demo OIL story laid over it', () => {
    installDemoOil(DEMO_OIL)
    for (const [p, d] of TAKEN) fileAbsence(p, 'OIL', d, d, { lw: true })
    expect(snapshot()).toEqual(DEMO_BASELINE)
  })
})

const SEED_BASELINE: ReturnType<typeof snapshot> = {
  ramp: { balance: 3.5, credits: [['', 3, 2.5], ['2026-01-03', 1, 1]] },
  tata: { balance: 2.5, credits: [['', 1.5, 0.5], ['2026-01-01', 1, 1], ['2026-01-04', 1, 1]] },
  splice: { balance: 0.5, credits: [['', 0.5, 0.5]] },
  jaguar: { balance: 4, credits: [['', 2, 2], ['2026-01-19', 2, 2]] },
  asics: { balance: 4.5, credits: [['', 4, 3], ['2026-02-02', 1.5, 1.5]] },
  pipper: { balance: 1, credits: [['', 1, 1]] },
  dusk: { balance: 1.5, credits: [['', 2.5, 1.5]] },
  miles: { balance: 6, credits: [['', 6, 6]] },
  cross: { balance: 1, credits: [['', 1, 1]] },
  decal: { balance: -4.5, credits: [] },
  skin: { balance: 2.5, credits: [['', 2, 2], ['2026-01-03', 0.5, 0.5]] },
  cage: { balance: 1, credits: [['', 1, 1]] },
  reset: { balance: 8, credits: [['', 8, 8]] },
}
const DEMO_BASELINE: ReturnType<typeof snapshot> = {
  ramp: { balance: 4, credits: [['', 3, 0.5], ['2026-01-03', 1, 1], ['2026-03-14', 2, 2], ['2026-04-18', 0.5, 0.5]] },
  tata: { balance: 2.5, credits: [['', 1.5, 0], ['2026-01-01', 1, 0], ['2026-01-04', 1, 0.5], ['2026-02-07', 1, 1], ['2026-03-21', 1, 1]] },
  splice: { balance: 0.5, credits: [['', 0.5, 0.5]] },
  jaguar: { balance: 4, credits: [['', 2, 2], ['2026-01-19', 2, 2]] },
  asics: { balance: 3.5, credits: [['', 4, 1], ['2026-02-02', 1.5, 1.5], ['2026-06-06', 1, 1]] },
  pipper: { balance: 1, credits: [['', 1, 1]] },
  dusk: { balance: 5, credits: [['', 2.5, 1.5], ['2026-07-04', 3, 3], ['2026-08-08', 0.5, 0.5]] },
  miles: { balance: 3, credits: [['', 6, 2], ['2026-05-09', 1, 1]] },
  cross: { balance: 1, credits: [['', 1, 1]] },
  decal: { balance: -4.5, credits: [] },
  skin: { balance: 3.5, credits: [['', 2, 2], ['2026-01-03', 0.5, 0.5], ['2026-08-29', 1, 1]] },
  slammed: { balance: 0, credits: [['2026-01-10', 1, 0]] },
  cage: { balance: 2, credits: [['', 1, 1], ['2026-08-15', 1, 1]] },
  reset: { balance: 9, credits: [['', 8, 7], ['2027-01-09', 2, 2]] },
}
