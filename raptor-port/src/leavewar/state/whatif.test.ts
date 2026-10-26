import { beforeEach, describe, expect, it } from 'vitest'
import { availRules, bidWhatIf, getState, initStore, saveManningRule, setCell, setRole } from './store'
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

/* the fresh read's 1: a run's line names the day it hurts most by how bad it is first — never a calm day with the lowest
   figure over a day where a row turns red */
describe('worstWhatIf — how bad first', () => {
  it('a day turning a row red wins over a calm day with a lower Available figure', async () => {
    const { worstWhatIf } = await import('../engine/whatif')
    const calm = { date: '2026-02-10', avail: { seat: 'p' as const, label: 'Available P', before: 20, after: 19, level: null }, turned: [] }
    const red = { date: '2026-02-11', avail: { seat: 'p' as const, label: 'Available P', before: 25, after: 24, level: null }, turned: [{ ruleId: 'ip', label: 'IP', before: 3, after: 2, level: 'red' as const }] }
    expect(worstWhatIf([calm, red])?.date).toBe('2026-02-11')
    expect(worstWhatIf([red, calm])?.date).toBe('2026-02-11')
  })
})

/* HIS D1296 (24 Oct 26, his iPhone, [LW-DAYLINE-PLACED-BID]): the window reopened on a day that already holds the bid read
   "No manning row turns amber or red" while Available P stood red — a second bid on that day changes nothing, so the
   what-if answered "nothing turns". On such a day the line shows the day as it stands, the bid counted. */
describe('a day already holding the bid (D1296)', () => {
  const judgeRedUnder = (req: number) => (seat: 'p' | 'w', have: number) => (seat === 'p' && have < req ? 'red' as const : '' as const)

  it('shows his Available row as it now stands, at its level, the bid counted', () => {
    const pilot = getState().people.find(p => p.seat === 'pilot' && !p.san)!
    const date = '2026-02-11'
    const before = now(date).p
    expect(setCell(pilot.id, date, 'LL')).toBe(true)
    const standing = now(date).p
    expect(standing).toBe(before - 1)
    /* his case: required one above what the war now has — Available P red */
    const [w] = bidWhatIf(pilot.id, [date], 'LL', judgeRedUnder(standing + 1))
    expect(w, 'the reopened window still has a line').toBeTruthy()
    expect(w!.standing).toBe(true)
    expect(w!.avail).toMatchObject({ seat: 'p', before: standing, after: standing, level: 'red' })
  })

  it('names every Manning row now amber or red on that day, and none where all are fine', () => {
    const pilot = getState().people.find(p => p.seat === 'pilot' && !p.san)!
    const date = '2026-02-11'
    /* two Manning rows the day breaks — a pilots row at red and a WSOs row at amber — so the answer has rows to name */
    expect(saveManningRule({ id: 'tp', label: 'Pilots', count: { kind: 'people', filter: { seats: ['pilot'] } }, threshold: { amber: 999, red: 998 } })).toBe(true)
    expect(saveManningRule({ id: 'tw', label: 'WSOs', count: { kind: 'people', filter: { seats: ['wso'] } }, threshold: { amber: 999, red: 0 } })).toBe(true)
    expect(setCell(pilot.id, date, 'LL')).toBe(true)
    const [w] = bidWhatIf(pilot.id, [date], 'LL', () => '')
    const bad = now(date).v.results.filter(r => r.verdict !== 'ok')
    expect(bad.map(r => r.ruleId).sort()).toEqual(['tp', 'tw'])
    expect(w!.turned.map(t => t.ruleId).sort()).toEqual(bad.map(r => r.ruleId).sort())
    for (const t of w!.turned) {
      const r = bad.find(x => x.ruleId === t.ruleId)!
      expect([t.before, t.after, t.level]).toEqual([r.have, r.have, r.verdict])
    }
  })

  it('another kind of leave picked on the held day reads the same — the day as it stands', () => {
    const pilot = getState().people.find(p => p.seat === 'pilot' && !p.san)!
    const date = '2026-02-11'
    expect(setCell(pilot.id, date, 'LL')).toBe(true)
    const [w] = bidWhatIf(pilot.id, [date], 'OL', () => '')
    expect(w!.standing).toBe(true)
    expect(w!.avail!.after).toBe(now(date).p)
  })

  it('a new bid on a free day is still a before → after answer, not a standing one', () => {
    const pilot = getState().people.find(p => p.seat === 'pilot' && !p.san)!
    const [w] = bidWhatIf(pilot.id, ['2026-02-11'], 'LL', () => '')
    expect(w!.standing).toBeFalsy()
    expect(w!.avail!.before - w!.avail!.after).toBe(1)
  })
})
