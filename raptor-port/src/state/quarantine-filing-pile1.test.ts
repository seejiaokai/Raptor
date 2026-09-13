// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { initStore, loadWeek } from './store'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { inpKey, reconcileDayFiling } from '../engine/slots'
import { stashClear, stashPut } from '../engine/weekstash'

const seed = JSON.stringify(INPUTS)
beforeEach(() => { stashClear(); INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed)); initStore(); loadWeek('06/07/2026') })
afterEach(() => stashClear())
const span = (acc?: string) => {
  const row: any = { person: 'dj', type: 'Meeting', date: 'Jul 10', endDate: 'Jul 14', yr: 2026, allday: true, ...(acc ? { acc } : {}) }
  INPUTS.push(row)
  stashPut('13/07/2026', 'null')
  return row
}
describe('Pile 1 protected spanning global filing', () => {
  it.each(['g', undefined])('reconcile preserves global acc=%s despite the normal week landing', acc => {
    const row = span(acc)
    if (!acc) DAYS[4].ground.push({ src: inpKey(row) })
    reconcileDayFiling(4)
    expect(row.acc).toBe(acc)
  })
  it.each(['g', undefined])('navigation preserves global acc=%s to and from a damaged week', acc => {
    const row = span(acc)
    loadWeek('13/07/2026')
    expect(row.acc).toBe(acc)
    loadWeek('06/07/2026')
    expect(row.acc).toBe(acc)
  })
  it('normal filing still clears a lost landing and restores an existing one', () => {
    const row: any = { person: 'dj', type: 'Meeting', date: 'Jul 10', yr: 2026, allday: true, acc: 'g' }
    INPUTS.push(row)
    reconcileDayFiling(4)
    expect(row.acc).toBeUndefined()
    DAYS[4].ground.push({ src: inpKey(row) })
    reconcileDayFiling(4)
    expect(row.acc).toBe('g')
  })
})
