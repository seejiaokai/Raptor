// @vitest-environment jsdom
/* W2-F2 (the reshape walk of 21 Nov 26, walker W2's W2-01 and W2-06) — LEAVE APPROVED IN 142'S WAR BEFORE A MOVE IS IN 142'S
   WAR ONLY. His D2243 Q6 (the plan §12 Q6): "leave approved before the move kept out of sight in the old war until the
   Transfer batch carries it" — 149's war does not have it; the schedule still shows the leave (the input stands). And the
   plan's A1 (§6.2): each war counts a man only inside his squadron stints. The walk saw Ranger's LL Mon 20 Jul, approved by
   Hunter in 142's war before Move M, drawn on 149's grid, counted out of 149's Available P, listed in 149's person window
   and charged in BOTH wars — and his leave of January (142's days) charged in 149's too ("LVE −6").
   The world: test-support/msq-world.ts. Every write goes through the war's own doors. */
import { describe, expect, it } from 'vitest'
import { getState, setCell, worldUnit, openDates, decideRequests, rawState, figureCtxOf, leaveFiguresOf, dayRecsOf } from './state/store'
import { setHome, unitsLoad } from '../state/units'
import { useMsqWorld, signInAs, on } from '../test-support/msq-world'
import { INPUTS, inpId } from '../engine/inputs'
import { warHolding, drawnFrom } from './engine'
import { syncAbsences } from './sync'
import { recsAt, type RequestRec } from './engine/warrecs'

useMsqWorld()

/* Ranger (or whoever is signed in) bids, the admin signed in approves — the Approvals writer (store.ts decideRequests) */
function approve(pid: string, date: string): void {
  const war = warHolding(rawState().wars, date)!
  const rec = recsAt(war.recs, pid, date).find((r): r is RequestRec => r.kind === 'request')!
  const out = decideRequests([{ personId: pid, parts: [{ date, recId: rec.id, code: rec.code, state: 'pending' }], to: 'approved' }])
  expect(out[0]!.kind, `approve ${pid} ${date}`).toBe('done')
}
const viewOn = (pid: string, date: string) => (warHolding(getState().wars, date) as any)?.views?.[pid]?.[date]
const drawn = (pid: string) => drawnFrom(figureCtxOf().sources, pid, 'annual', figureCtxOf())

/* Saber opens the year; Ranger bids LL on each day; Hunter approves them in 142's war; then Move M (Ranger 142 → 149, from
   Thu 16 Jul) and the clock to Thu 16 */
function approvedThenMoved(days: string[]): void {
  signInAs('saber')
  expect(openDates('2026-01-01', '2026-12-31')).toBe('set')
  signInAs('hunter')
  for (const d of days) { expect(setCell('bane', d, 'LL'), `bid ${d}`).toBe(true); approve('bane', d) }
  signInAs('saber')
  expect(setHome('bane', 'u149').ok).toBe(true)
  on(16); unitsLoad()
}

describe('W2-F2 — leave approved in 142’s war before his move is not in 149’s war', () => {
  it('Mon 20 Jul (a day now 149’s): 149’s war has nothing on it and charges nothing; 142’s keeps it, charged once', () => {
    approvedThenMoved(['2026-07-20'])
    signInAs('hunter')
    expect(worldUnit()).toBe('u142')
    expect(viewOn('bane', '2026-07-20')?.code, '142’s war still holds it (out of sight under the stripe)').toBe('LL')
    expect(drawn('bane'), '142 charges it').toBe(1)
    signInAs('kestrel')
    expect(worldUnit()).toBe('u149')
    expect(viewOn('bane', '2026-07-20'), '149’s war is without it until the Transfer batch').toBeUndefined()
    expect(drawn('bane'), '149 charges nothing for it').toBe(0)
  })
  it('his leave of January (142’s days) is not charged in 149’s war', () => {
    approvedThenMoved(['2026-01-08', '2026-01-09'])
    signInAs('kestrel')
    expect(viewOn('bane', '2026-01-08')).toBeUndefined()
    expect(drawn('bane'), '149 never held his January leave').toBe(0)
    signInAs('hunter')
    expect(drawn('bane'), '142 keeps it').toBe(2)
  })
  it('the figure beside his name, My leave and the person window (one engine): 149’s reads none of 142’s leave', () => {
    approvedThenMoved(['2026-01-08', '2026-01-09', '2026-07-20'])
    on(21); unitsLoad()
    signInAs('kestrel')
    const his = () => [...dayRecsOf('bane').keys()].filter(d => d === '2026-07-20' || d.startsWith('2026-01')).sort()
    const lve149 = leaveFiguresOf('bane').kinds.LVE
    expect(his(), '149’s figures read none of them').toEqual([])
    signInAs('hunter')
    expect(his(), '142’s read all three').toEqual(['2026-01-08', '2026-01-09', '2026-07-20'])
    /* (the same figure of a 149 man who took no leave: nothing of 142's comes off Ranger's in 149's war) */
    signInAs('kestrel')
    expect(JSON.stringify(lve149)).toBe(JSON.stringify(leaveFiguresOf('osp9').kinds.LVE))
  })
  it('149’s Available count on Mon 20 does not lose him to leave 149’s war does not have', () => {
    approvedThenMoved(['2026-07-20'])
    signInAs('kestrel')
    expect(viewOn('bane', '2026-07-20')?.away ?? 0).toBe(0)
  })
  it('the time is still taken: 149’s war refuses a second leave over the one the schedule shows', () => {
    approvedThenMoved(['2026-07-20'])
    signInAs('kestrel')
    expect(setCell('bane', '2026-07-20', 'LL'), 'the input stands on the schedule — no second leave on its time').toBe(false)
    expect(setCell('bane', '2026-07-21', 'LL'), '(control) the day after is free').toBe(true)
  })
  it('(control) leave approved in 149’s war after the move is 149’s: shown and charged there, not in 142’s', () => {
    approvedThenMoved([])
    signInAs('kestrel')
    expect(openDates('2026-01-01', '2026-12-31')).toBe('set')
    expect(setCell('bane', '2026-07-27', 'LL')).toBe(true)
    approve('bane', '2026-07-27')
    expect(viewOn('bane', '2026-07-27')?.code).toBe('LL')
    expect(drawn('bane')).toBe(1)
    signInAs('hunter')
    expect(viewOn('bane', '2026-07-27'), '142’s war never had it').toBeUndefined()
    expect(drawn('bane')).toBe(0)
  })
  it('(control) leave approved next to it in 149’s war stays a record of its own — the two never join', () => {
    approvedThenMoved(['2026-07-20'])
    signInAs('kestrel')
    expect(openDates('2026-01-01', '2026-12-31')).toBe('set')
    expect(setCell('bane', '2026-07-21', 'LL')).toBe(true)
    approve('bane', '2026-07-21')
    expect(viewOn('bane', '2026-07-21')?.code, '149’s own').toBe('LL')
    expect(viewOn('bane', '2026-07-20'), '142’s stays out of 149’s war').toBeUndefined()
    expect(drawn('bane')).toBe(1)
    signInAs('hunter')
    expect(viewOn('bane', '2026-07-20')?.code).toBe('LL')
    expect(viewOn('bane', '2026-07-21')).toBeUndefined()
    expect(drawn('bane')).toBe(1)
  })
  it('an absence filed on the Inputs page (no war approved it) is the war’s whose day it is — each day in one war', () => {
    approvedThenMoved([])
    /* leave 14–17 Jul across the move, as the Inputs page files it — no war's approval on it (a test's own row, re-read) */
    const mc: any = { date: 'Jul 14', endDate: 'Jul 17', yr: 2026, type: 'LL', remarks: '', allday: true, mod: '2026-07-14', people: [{ p: 'bane' }] }
    inpId(mc); INPUTS.push(mc); syncAbsences()
    signInAs('hunter'); syncAbsences()
    expect(viewOn('bane', '2026-07-15')?.code, '142’s day in 142’s war').toBeTruthy()
    expect(viewOn('bane', '2026-07-16'), '149’s day is not in 142’s war').toBeUndefined()
    signInAs('kestrel'); syncAbsences()
    expect(viewOn('bane', '2026-07-15'), '142’s day is not in 149’s war').toBeUndefined()
    expect(viewOn('bane', '2026-07-16')?.code, '149’s day in 149’s war').toBeTruthy()
  })
  it('(control) a man who never moved: his leave reads exactly as before', () => {
    approvedThenMoved([])
    signInAs('hunter')
    expect(setCell('viper', '2026-07-21', 'LL')).toBe(true)
    approve('viper', '2026-07-21')
    expect(viewOn('viper', '2026-07-21')?.code).toBe('LL')
    expect(drawn('viper')).toBe(1)
  })
})
