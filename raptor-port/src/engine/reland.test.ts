/* relandInputs — the ONE shared "re-derive this week's input landings" pass,
   extracted from store.ts applyWeekModel so a stash restore and (Step 3) an
   undo restore cannot drift ([GLOBAL-UNDO] §11). It reconciles a ground row
   that is already present back to 'g' without a duplicate push, then lands
   every still-unlanded personal input — except one the user deliberately
   un-landed (its id in the `unaccepted` set), which re-parks 'r'. The
   amendment marks are a property of the restored book, not of this derived
   landing, so the pass's own marks are rolled back. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS, isPersonal, inpId } from './inputs'
import { acceptInput, relandInputs, reconcileLandedAcc } from './slots'
import { SCHED } from './publish'
import { validate } from './validate'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)

beforeEach(() => {
  const d = JSON.parse(DSNAP); DAYS.length = 0; d.forEach((x: any) => DAYS.push(x))
  const i = JSON.parse(ISNAP); INPUTS.length = 0; i.forEach((x: any) => INPUTS.push(x))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}; SCHED.al = 0
  validate()
})

const findInp = (t: string) => INPUTS.find((x: any) => x.type === t && x.date === 'Jul 13')

describe('relandInputs', () => {
  it('lands a never-landed personal input as a ground row and marks it g', () => {
    const inp = findInp('Meeting')!
    expect(inp.acc).toBeFalsy()
    expect(DAYS[0].ground.some((g: any) => g.src === inpId(inp))).toBe(false)
    relandInputs()
    expect(inp.acc).toBe('g')
    expect(DAYS[0].ground.filter((g: any) => g.src === inpId(inp)).length).toBe(1)
  })

  /* the restore scenario: the ground row is ALREADY on the day (it came back
     with the restored day record) but the input's derived 'g' acc was stripped.
     relandInputs must re-mark it 'g' via reconcile — never push a second row. */
  it('reconciles an already-present ground row to g without duplicating it', () => {
    const inp = findInp('Meeting')!
    expect(acceptInput(0, inp, 'g')).toBe(true)      // row now on the day
    delete inp.acc                                    // simulate the inverse's 'g' strip
    relandInputs()
    expect(inp.acc).toBe('g')
    expect(DAYS[0].ground.filter((g: any) => g.src === inpId(inp)).length).toBe(1)  // reconciled, not duplicated
  })

  it('re-parks a deliberately un-landed input as r, not on the ground', () => {
    const inp = findInp('Meeting')!
    relandInputs(new Set([inpId(inp)]))
    expect(inp.acc).toBe('r')
    expect(DAYS[0].ground.some((g: any) => g.src === inpId(inp))).toBe(false)  // nothing landed for it
  })

  it('preserves the amendment marks the restored book carried in', () => {
    const inp = findInp('Meeting')!
    /* a book being restored carries its own pending/changes/added; the landing
       pass mutates them as it lands rows, so relandInputs must roll them back. */
    SCHED.pending = { 'pn:2': 1 }; SCHED.changes = { 'sn:1': 1 }; SCHED.added = { 'gr:3.0.prog': 1 }
    relandInputs()
    expect(inp.acc).toBe('g')                          // it still landed
    expect(SCHED.pending).toEqual({ 'pn:2': 1 })
    expect(SCHED.changes).toEqual({ 'sn:1': 1 })
    expect(SCHED.added).toEqual({ 'gr:3.0.prog': 1 })
  })

  it('exports reconcileLandedAcc — a present row with a stripped acc re-reads g', () => {
    const inp = findInp('Meeting')!
    acceptInput(0, inp, 'g')
    delete inp.acc
    reconcileLandedAcc()
    expect(inp.acc).toBe('g')
  })
})
