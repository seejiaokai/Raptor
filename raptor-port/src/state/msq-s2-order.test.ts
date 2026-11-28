/* THE ONE ORDER OF SQUADRONS (his D2730 Q1: "home squadron first, then the rest by number, in every list of squadrons —
   one order everywhere"). Section 2's step: the order is written once, in state/units-model.ts, for every list of
   squadrons the app draws to call; no caller is re-pointed here (a later step). The pure cases first, then the real
   three-squadron world, each person's home that day read through the app's own homeOn. */
import { describe, it, expect } from 'vitest'
/* (the world first, as every msq- test file: it loads the app's modules in the order the app does) */
import { withThird, PID, third } from '../test-support/msq-world'
import { units, homeOn, todayIso } from './units'
import { squadronOrder, bySquadronOrder } from './units-model'

withThird()

interface Row { id: string; num: string }
const R = (num: string, id = `u${num}`): Row => ({ id, num })
const rows = (): Row[] => [R('150'), R('142'), R('149')]
const idOf = (r: Row) => r.id
const numOf = (r: Row) => r.num
const nums = (l: Row[]) => l.map(r => r.num)

describe('squadronOrder — home first, then by number (D2730 Q1)', () => {
  it('home 142, the lowest: plain by number, nothing changes', () => {
    expect(nums(squadronOrder(rows(), 'u142', idOf, numOf))).toEqual(['142', '149', '150'])
  })
  it('home 150: 150, then 142, 149', () => {
    expect(nums(squadronOrder(rows(), 'u150', idOf, numOf))).toEqual(['150', '142', '149'])
  })
  it('home 149: 149, then 142, 150', () => {
    expect(nums(squadronOrder(rows(), 'u149', idOf, numOf))).toEqual(['149', '142', '150'])
  })
  it('a home not in the list, or no home at all: plain by number', () => {
    for (const home of ['u999', '', undefined, null]) {
      expect(nums(squadronOrder(rows(), home, idOf, numOf)), String(home)).toEqual(['142', '149', '150'])
    }
  })
  it('compares numbers as numbers, as the sorts it replaces do (9 < 142 < 249 < 1000)', () => {
    const l = [R('1000'), R('249'), R('142'), R('9')]
    expect(nums(squadronOrder(l, null, idOf, numOf))).toEqual(['9', '142', '249', '1000'])
    expect(nums(squadronOrder(l, 'u249', idOf, numOf))).toEqual(['249', '9', '142', '1000'])
  })
  it('never changes the list it is given', () => {
    const l = rows()
    const before = JSON.stringify(l)
    const out = squadronOrder(l, 'u149', idOf, numOf)
    expect(JSON.stringify(l)).toBe(before)
    expect(out).not.toBe(l)
  })
  it('a list of one, and an empty list', () => {
    expect(nums(squadronOrder([R('149')], 'u142', idOf, numOf))).toEqual(['149'])
    expect(squadronOrder([], 'u142', idOf, numOf)).toEqual([])
  })
  it('equal numbers keep the order they came in', () => {
    const l = [R('150', 'ua'), R('142', 'ub'), R('150', 'uc'), R('142', 'ud')]
    expect(squadronOrder(l, null, idOf, numOf).map(idOf)).toEqual(['ub', 'ud', 'ua', 'uc'])
  })
  it('works on bare ids too, with a number read from elsewhere', () => {
    const num: Record<string, string> = { u142: '142', u149: '149', u150: '150' }
    expect(squadronOrder(['u142', 'u149', 'u150'], 'u150', x => x, x => num[x]!)).toEqual(['u150', 'u142', 'u149'])
  })
  it('the comparator gives the same order as the sorter, for a caller that sorts in place', () => {
    const l = rows()
    l.sort(bySquadronOrder('u149', idOf, numOf))
    expect(nums(l)).toEqual(['149', '142', '150'])
  })
})

describe('squadronOrder in the three-squadron world — each person\'s home that day, by homeOn', () => {
  const orderFor = (pid: string): string[] => {
    const home = homeOn(pid, todayIso())
    return squadronOrder(units(), home, u => u.id, u => u.num).map(u => u.num)
  }
  it('the world has the three squadrons', () => {
    expect(third.u150).not.toBe('')
    expect(units().map(u => u.num).sort()).toEqual(['142', '149', '150'])
  })
  it('Mako (home 150): 150, 142, 149', () => {
    expect(homeOn(PID.mako, todayIso())).toBe(third.u150)
    expect(orderFor(PID.mako)).toEqual(['150', '142', '149'])
  })
  it('Hunter and Saber (home 142): 142, 149, 150', () => {
    expect(orderFor(PID.hunter)).toEqual(['142', '149', '150'])
    expect(orderFor(PID.saber)).toEqual(['142', '149', '150'])
  })
  it('Kestrel (home 149): 149, 142, 150', () => {
    expect(orderFor(PID.kestrel)).toEqual(['149', '142', '150'])
  })
})
