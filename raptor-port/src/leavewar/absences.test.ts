// [ARCH-STACK] step 4 phase 1 — which Inputs show on the war, on which dates,
// over which part of the day.
import { describe, it, expect } from 'vitest'
import { buildAbsenceIndex, contribsOfInput, inputWindow, warVisible, absenceSignature } from './absences'
import { dayView } from './engine/dayview'

const row = (o: any) => ({ iid: 'i' + Math.random().toString(36).slice(2, 7), person: 'bane', date: 'Jul 15', yr: 2026, allday: true, ...o })
const hm = (h: number, m = 0) => h * 60 + m

describe('warVisible — leave, medical, course, overseas duty; nothing else', () => {
  it.each([['LL', true], ['OIL', true], ['ATT C', true], ['ATT B', true], ['HL', true], ['CSE', true], ['OD', true],
    ['Upchit', false], ['SANS Availability', false], ['Meeting', false], ['Duty', false], ['Fly with', false], ['Appointment', false]])('%s → %s', (t, v) => {
    expect(warVisible(t)).toBe(v)
  })
})

describe('the daily window', () => {
  it('all day, morning, afternoon', () => {
    expect(inputWindow(row({ type: 'LL' })).win).toEqual([0, 1439])
    expect(inputWindow(row({ type: 'LL', allday: false, half: 'am' })).win).toEqual([0, 720])
    expect(inputWindow(row({ type: 'LL', allday: false, half: 'pm' })).win).toEqual([721, 1439])
  })
  it('leave keeps its real times (owner, 20 Sep 26)', () => {
    expect(inputWindow(row({ type: 'LL', allday: false, s: hm(8), e: hm(10) })).win).toEqual([hm(8), hm(10)])
  })
  it('medical reads by the six-hour half rule', () => {
    expect(inputWindow(row({ type: 'ATT C', allday: false, s: hm(14), e: hm(16) })).win).toEqual([721, 1439])
    expect(inputWindow(row({ type: 'ATT C', allday: false, s: hm(8), e: hm(17) })).win).toEqual([0, 1439])
  })
  it('an overnight window leaves a tail on the next date', () => {
    expect(inputWindow(row({ type: 'LL', allday: false, s: hm(22), e: hm(2) }))).toEqual({ win: [hm(22), 1439], tail: [0, hm(2)] })
  })
})

describe('contributions per date', () => {
  it('a 3-day leave covers 3 dates, carrying its iid, lw and the moved mark', () => {
    const r = row({ type: 'LL', endDate: 'Jul 17', lw: 'war-2026', lwMoved: { '2026-07-16': '2026-07-10' } })
    const cs = contribsOfInput(r)
    expect(cs.map(([d]) => d)).toEqual(['2026-07-15', '2026-07-16', '2026-07-17'])
    expect(cs.every(([, c]) => c.id === r.iid && c.lw === true)).toBe(true)
    expect(cs.map(([, c]) => !!c.moved)).toEqual([false, true, false])
  })
  it('an overnight leave puts a spill tail on the next date only for clashes', () => {
    const cs = contribsOfInput(row({ type: 'LL', allday: false, s: hm(22), e: hm(2) }))
    expect(cs.map(([d, c]) => [d, !!c.spill])).toEqual([['2026-07-15', false], ['2026-07-16', true]])
  })
  it('ATT C / ATT B map to the war spelling', () => {
    expect(contribsOfInput(row({ type: 'ATT C' }))[0]![1].code).toBe('ATTC')
  })
  it('a row with no iid, no person, or a non-war type gives nothing', () => {
    expect(contribsOfInput({ type: 'LL', person: 'x', date: 'Jul 1' })).toEqual([])
    expect(contribsOfInput(row({ type: 'Meeting' }))).toEqual([])
  })
})

describe('the index feeds the day view', () => {
  it('AM LL + PM ATT C filed separately read as *LL +1', () => {
    const ix = buildAbsenceIndex([row({ type: 'ATT C', allday: false, half: 'pm' }), row({ type: 'LL', allday: false, half: 'am' })])
    const v = dayView(ix.get('bane')!.get('2026-07-15')!)
    expect([v.code, v.mark]).toEqual(['*LL', '+1'])
  })
  it('two people, two dates, no cross-talk', () => {
    const ix = buildAbsenceIndex([row({ type: 'LL' }), row({ type: 'OD', person: 'pike', date: 'Jul 16' })])
    expect([...ix.get('bane')!.keys()]).toEqual(['2026-07-15'])
    expect([...ix.get('pike')!.keys()]).toEqual(['2026-07-16'])
  })
})

describe('the rebuild signature ignores what the war never reads', () => {
  it('a remarks / docs / mod edit keeps it; a date, half, type or lw edit changes it', () => {
    const r = row({ type: 'LL', remarks: 'a', mod: '1' })
    const s = absenceSignature(r)
    expect(absenceSignature({ ...r, remarks: 'b', mod: '2', docIds: ['d'] })).toBe(s)
    for (const ch of [{ date: 'Jul 16' }, { half: 'am', allday: false }, { type: 'OL' }, { lw: 'w' }]) {
      expect(absenceSignature({ ...r, ...ch })).not.toBe(s)
    }
  })
})
