/* GUARD RAILS ON MALFORMED INPUT (owner, 12 Aug 26: "which inputs u can put a
   guard rail to it such that u wont get weird situations... if not reject the
   input").

   The line these all sit on, and the reason none of them is a warning: this
   app's vocabulary is SOFT BARS for anything a scheduler might genuinely MEAN
   — a double-booking, a man planted on leave, a tight turn. A guard rail is
   only correct for MALFORMED data nobody could mean: a value that is not the
   kind of thing the field holds, or is outside the range that kind can take.
   Every refusal below is of the second sort, and each one was reproduced doing
   real damage before it was closed. */
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { validate } from './validate'
import { txtSet, txtGet } from './slots'
import { SCHED } from './publish'
import { HOOKS } from './hooks'
import { hmOK, parseHM, minus } from './time'
import { STORE_CFG, addStore, renameStore, storesReset } from './stores'
import { SHIFT_HARD, rulesReset, rulesLoad } from './rules'
import { store } from './hooks'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
let said: string[] = []
const realToast = HOOKS.toast

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  said = []
  HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
  validate()
})
afterEach(() => { HOOKS.toast = realToast })

describe('hmOK — is this a clock time a human could mean', () => {
  it('takes the ordinary shapes, in every spelling the app allows', () => {
    ;['0900', '09:00', '930', '0000', '2359', '2400', '0900H'].forEach(v =>
      expect(hmOK(v), v).toBe(true))
  })
  it('refuses a minute component of 60 or more — the fat-finger case', () => {
    ;['1290', '0060', '0999', '1160'].forEach(v => expect(hmOK(v), v).toBe(false))
    /* and the reason it matters: parseHM would have ROLLED it silently */
    expect(parseHM('1290')).toBe(13 * 60 + 30)
  })
  it('refuses anything past midnight, and anything not a time at all', () => {
    ;['2500', '9999', '2401', 'morning', '12 40', '-100', '', null, '12:3:4'].forEach(v =>
      expect(hmOK(v as any), String(v)).toBe(false))
  })
  it('leaves parseHM itself loose — it is the shared reader, and stays so', () => {
    expect(parseHM('9999')).toBe(99 * 60 + 99)
    expect(parseHM('2400')).toBe(1440)
  })
})

describe('minus — an unreadable time has no lead to subtract', () => {
  it('returns empty rather than the string NaN:NaN', () => {
    expect(minus('', 140)).toBe('')
    expect(minus('morning', 140)).toBe('')
    expect(minus(undefined, 140)).toBe('')
  })
  it('still subtracts a real one, wrapping past midnight', () => {
    expect(minus('12:40', 140)).toBe('10:20')
    expect(minus('01:00', 140)).toBe('22:40')
  })
})

describe('a schedule time cell takes a time, or nothing', () => {
  const P = 'ff:0.0.0'
  it('refuses an unreadable value instead of silently CLEARING the cell', () => {
    const was = txtGet(`${P}.to`)
    expect(was, 'the seed line has a take-off to lose').toBeTruthy()
    expect(txtSet(`${P}.to`, 'morning')).toBe(false)
    expect(txtGet(`${P}.to`), 'the take-off is still there').toBe(was)
    expect(said.join(' ')).toMatch(/not a time/i)
  })
  it('refuses an out-of-range value instead of storing arithmetic', () => {
    const was = txtGet(`${P}.to`)
    expect(txtSet(`${P}.to`, '9999')).toBe(false)
    expect(txtGet(`${P}.to`)).toBe(was)
    expect(txtSet(`${P}.to`, '1290'), 'a minute overflow is a typo, not a time').toBe(false)
    expect(txtGet(`${P}.to`)).toBe(was)
  })
  it('and that is what keeps the day\'s warnings alive', () => {
    const before = validate().all.length
    txtSet(`${P}.to`, 'morning')
    expect(validate().all.length, 'no warning fell off the day with the take-off').toBe(before)
  })
  it('still lets a scheduler CLEAR a time, and type a real one', () => {
    expect(txtSet(`${P}.to`, '')).toBe(true)
    expect(txtGet(`${P}.to`)).toBe('')
    expect(txtSet(`${P}.to`, '0840')).toBe(true)
    expect(txtGet(`${P}.to`)).toBe('08:40')
    expect(said, 'nothing to complain about').toEqual([])
  })
  it('covers every time key in the grammar, not just the flying line', () => {
    const keys = [`${P}.ld`, `${P}.br`, 'dr:0.0.0.str', 'dr:0.0.0.end', 'gr:0.0.str', 'gr:0.0.end']
    keys.forEach(k => {
      const was = txtGet(k)
      expect(txtSet(k, '9999'), k).toBe(false)
      expect(txtGet(k), k).toBe(was)
    })
  })
  /* the hole the audit found in the 12 Aug brief guard: `9999` was normalised
     to "100:39" BEFORE that guard re-read it, and "100:39" re-parses as null,
     so the guard could not see a number and let it through */
  it('closes the brief guard\'s own back door', () => {
    txtSet(`${P}.to`, '0840')
    expect(txtSet(`${P}.br`, '9999'), 'refused before it can be normalised').toBe(false)
    expect(txtGet(`${P}.br`)).not.toMatch(/100/)
  })
})

describe('two stores cannot wear one name', () => {
  beforeEach(() => { storesReset() })
  afterEach(() => { storesReset() })
  it('renaming onto another store\'s label is refused, as adding one always was', () => {
    const other = STORE_CFG.find(([k]) => k !== STORE_CFG[0][0])!
    const err = renameStore(STORE_CFG[0][0], other[1])
    expect(err, 'refused with a reason').toBeTruthy()
    expect(String(err)).toMatch(/already the name/i)
    expect(STORE_CFG[0][1], 'and the list is untouched').not.toBe(other[1])
  })
  it('renaming to its own label, or to a free one, still works', () => {
    expect(renameStore(STORE_CFG[0][0], STORE_CFG[0][1])).toBe(null)
    expect(renameStore(STORE_CFG[0][0], 'AUDIT POD')).toBe(null)
    expect(STORE_CFG[0][1]).toBe('AUDIT POD')
  })
  it('adding a duplicate was already refused — pinned so the pair stay in step', () => {
    expect(addStore(STORE_CFG[1][1])).toBeTruthy()
  })
})

describe('the rules load path survives a hostile stored blob', () => {
  afterEach(() => { rulesReset() })
  it('a prototype key cannot become a shift kind', () => {
    store.set('rules', { s: { toString: 1, constructor: 1, valueOf: 1 } })
    rulesLoad()
    expect(Object.prototype.hasOwnProperty.call(SHIFT_HARD, 'toString'), 'no prototype key took').toBe(false)
    expect(Object.prototype.hasOwnProperty.call(SHIFT_HARD, 'constructor')).toBe(false)
    expect(() => String(Object.keys(SHIFT_HARD).join(','))).not.toThrow()
  })
})
