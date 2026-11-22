/* AN INPUT'S LATE MARK BY ITS OWN SQUADRON'S CUT-OFF (the reshape's phase 3, owed by helper "own pages" of phase 2): each
   squadron keeps its own Logic, its Inputs cut-off among it (D2109, D2122 — storage/keyowner.ts 'rules'); the mark read
   the LOADED squadron's (VCONF) for every input, so a 149 man's input read on a page with 142 loaded was judged by 142's
   cut-off. Now the input's own squadron's — the squadron of its first day (engine/inputs.ts inputUnitOf), its stored
   rules when it is not the one loaded (state/cutoff.ts getCut). */
import { describe, it, expect, afterEach } from 'vitest'
import { useMsqWorld, signInAs, PID, on } from '../test-support/msq-world'
import { isLateInput } from './inputs'
import { VCONF } from './rules'
import { UNIT } from './unitview'
import { saveCut } from '../state/cutoff'

useMsqWorld()

const lead0 = VCONF.inputLead
afterEach(() => { VCONF.inputLead = lead0 })

/* the week of Mon 27 Jul 2026; touched on Thu 23 Jul — four days before its Monday */
const inputOf = (pid: string) => ({ iid: 'ilate1', type: 'Leave', date: 'Jul 27', yr: 2026, people: [{ p: pid }], mod: '2026-07-23' })

describe("an input's late mark reads its own squadron's cut-off", () => {
  it('a 149 man\'s input, 142 loaded: 149 cuts off on the Monday, 142 a week before — on time by 149\'s', () => {
    on(23)
    signInAs('saber')                                                     // a master admin saves 149's own cut-off
    expect(saveCut('inputs', { mode: 0, lead: 0, wd: 0, weeks: 1 }, 'u149').ok, "149's cut-off saved").toBe(true)
    signInAs('hunter')
    expect(UNIT).toBe('u142')
    VCONF.inputLead = 7                                                   // 142, loaded: due Mon 20 Jul; 149: Mon 27 Jul
    expect(isLateInput(inputOf(PID.osprey)), "Osprey (149's) — by 149's cut-off").toBe(false)
    expect(isLateInput(inputOf(PID.ranger)), "(control) Ranger (142's) — by 142's cut-off").toBe(true)
  })
  it('(control) the loaded squadron\'s own input still reads the loaded Logic', () => {
    on(23)
    signInAs('hunter')
    VCONF.inputLead = 0
    expect(isLateInput(inputOf(PID.ranger))).toBe(false)
  })
})
