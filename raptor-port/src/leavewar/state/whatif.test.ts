import { beforeEach, describe, expect, it } from 'vitest'
import { availRules, bidWhatIf, getState, initStore, setCell, setRole } from './store'
import { memoryBackend } from './storage'
import { evaluateDay } from '../engine/evaluate'
import { availHave } from '../engine/availrows'
import { worstWhatIf } from '../engine/whatif'

/* THE BID WINDOWS' DAY LINE (owner D1144, D1213; M3, batch 5): what a bid would do to manning, read before it is
   placed. The property that keeps the line honest: what it says the bid does is what the grid then shows once the bid IS
   placed — the same rules (evaluateDay, availHave) on the war the real write leaves. Through the real store. */

beforeEach(() => { initStore(memoryBackend()); setRole('admin') })

const now = (date: string) => {
  const st = getState()
  return {
    v: evaluateDay(st.people, st.grid, st.states, st.requirements, date, st.views),
    p: availHave(availRules().p, st.people, st.grid, st.states, date, st.views),
    w: availHave(availRules().w, st.people, st.grid, st.states, date, st.views),
  }
}

describe('bidWhatIf', () => {
  it('for a pilot, a WSO and a half day, it says exactly what the grid shows after the real bid', () => {
    const st = getState()
    const pilot = st.people.find(p => p.seat === 'pilot' && !p.san)!
    const wso = st.people.find(p => p.seat === 'wso' && !p.san)!
    const date = '2026-02-11'
    for (const [who, code] of [[pilot, 'LL'], [wso, 'LL'], [pilot, 'LL*']] as const) {
      initStore(memoryBackend()); setRole('admin')
      const before = now(date)
      const [w] = bidWhatIf(who.id, [date], code, () => '')
      expect(w, `${who.id} ${code}: a day the store would write`).toBeTruthy()
      expect(setCell(who.id, date, code)).toBe(true)
      const after = now(date)
      const seat = who.seat === 'pilot' ? 'p' : 'w'
      expect(w!.avail?.seat, `${who.id} ${code}: his own seat's row`).toBe(seat)
      expect(w!.avail?.before).toBe(before[seat])
      expect(w!.avail?.after, `${who.id} ${code}: the Available figure the grid then shows`).toBe(after[seat])
      for (const t of w!.turned) {
        const r = after.v.results.find(x => x.ruleId === t.ruleId)!
        expect(t.after).toBe(r.have)
        expect(t.level).toBe(r.verdict)
      }
      /* and every row the real bid made worse is named */
      const rank = { ok: 0, amber: 1, red: 2 } as const
      const worse = after.v.results.filter(r => r.verdict !== 'ok' && rank[r.verdict] > rank[before.v.results.find(b => b.ruleId === r.ruleId)!.verdict])
      expect(w!.turned.map(t => t.ruleId).sort()).toEqual(worse.map(r => r.ruleId).sort())
    }
  })

  it('a half day lowers the Available figure by a half', () => {
    const pilot = getState().people.find(p => p.seat === 'pilot' && !p.san)!
    const [w] = bidWhatIf(pilot.id, ['2026-02-11'], 'LL*', () => '')
    expect(w!.avail!.before - w!.avail!.after).toBe(0.5)
  })

  it('a SANS man moves no Available row: no Available line', () => {
    const sans = getState().people.find(p => p.san)
    if (!sans) return   // the demo world carries none: nothing to say
    const [w] = bidWhatIf(sans.id, ['2026-02-11'], 'LL', () => '')
    if (w) expect(w.avail).toBeNull()
  })

  it('an Available row the judge puts at amber or red is named with its level (D1213)', () => {
    const pilot = getState().people.find(p => p.seat === 'pilot' && !p.san)!
    const [w] = bidWhatIf(pilot.id, ['2026-02-11'], 'LL', (seat, have) => (seat === 'p' ? (have < 999 ? 'red' : '') : ''))
    expect(w!.avail).toMatchObject({ seat: 'p', level: 'red' })
    const [ok] = bidWhatIf(pilot.id, ['2026-02-11'], 'LL', () => '')
    expect(ok!.avail!.level).toBeNull()
  })

  it('a day the store would not write is left out (as the balance ask leaves it)', () => {
    const pilot = getState().people.find(p => p.seat === 'pilot' && !p.san)!
    expect(bidWhatIf(pilot.id, ['1999-01-01'], 'LL', () => '')).toEqual([])
  })

  it('across a range, the day the bid hurts most — the lowest Available figure after it', () => {
    const a = { date: '2026-02-10', avail: { seat: 'p' as const, label: 'Available P', before: 25, after: 24, level: null }, turned: [] }
    const b = { date: '2026-02-11', avail: { seat: 'p' as const, label: 'Available P', before: 24, after: 23, level: 'red' as const }, turned: [] }
    const c = { date: '2026-02-12', avail: null, turned: [{ ruleId: 'x', label: 'IP', before: 3, after: 2, level: 'amber' as const }] }
    expect(worstWhatIf([a, b, c])!.date).toBe('2026-02-11')
    expect(worstWhatIf([])).toBeNull()
  })
})
