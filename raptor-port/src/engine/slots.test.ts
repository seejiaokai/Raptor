/* Ported from reference/tfin.js — the mutation-funnel assertions: slot
   round-trips, overflow crew, free-text protection, flyRef safety and the
   no-op edit guard. DOM drag paths are exercised in the reference suite;
   here the same model contracts are driven through the funnel directly. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { slotVal, setSlotVal, fillSlot, flyRef, rowRef, rowCrew, txtRef, txtGet, txtSet, whoSet, armTargetExists, renameCallsign } from './slots'
import { PEOPLE, ID_BY_CS, nameToId } from './people'
import { SCHED } from './publish'

const SNAP = JSON.stringify(DAYS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(SNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
})

describe('the mutation funnel (tfin edit-board group)', () => {
  it('slot round-trip all prefixes', () => {
    let ok = true, seen = 0
    for (const k of ['d:0.0.0', 's:0.oft.0.p', 'g:0.2', 'a:0.1.0']) {
      seen++
      const b = slotVal(k); setSlotVal(k, 'bane'); if (slotVal(k) !== 'bane') ok = false
      setSlotVal(k, b); if (slotVal(k) !== b) ok = false
    }
    expect(ok && seen === 4, 'seen=' + seen).toBe(true)
  })

  it('a no-op assignment is not an edit', () => {
    const k = '0.0.0.0.p'
    const v = slotVal(k)
    expect(v).toBeTruthy()
    setSlotVal(k, v)
    expect(Object.keys(SCHED.pending)).toEqual([])
  })

  it('a real assignment names what changed (noteChange)', () => {
    const k = 'd:0.0.0'
    const b = slotVal(k)
    setSlotVal(k, b === 'bane' ? 'stiff' : 'bane')
    expect(SCHED.pending[k]).toBe(1)
    setSlotVal(k, b)
  })

  it('overflow crew round-trip on every list prefix', () => {
    let ok = true
    for (const [k, base] of [['d', 'd:0.0.0'], ['g', 'g:0.0'], ['s', 's:0.oft.0']] as const) {
      const args = base.slice(base.indexOf(':') + 1).split('.')
      const before = rowCrew(k, args).filter(Boolean).length
      fillSlot(base + '.+', 'bane'); fillSlot(base + '.+', 'wolf')
      const after = rowCrew(k, args).filter(Boolean).length
      if (after !== before + 2) ok = false
      for (let i = 0; i < 8; i++) { const kk = base + '.x' + i; if (slotVal(kk)) setSlotVal(kk, '') }
    }
    expect(ok).toBe(true)
  })

  it('an overflow slot is addressable and empties cleanly', () => {
    const base = 'g:0.0'
    fillSlot(base + '.+', 'bane'); fillSlot(base + '.+', 'wolf'); fillSlot(base + '.+', 'stiff')
    const got = [0, 1, 2].map(i => slotVal(base + '.x' + i)).filter(Boolean)
    ;[0, 1, 2].forEach(i => setSlotVal(base + '.x' + i, ''))
    const left = [0, 1, 2].map(i => slotVal(base + '.x' + i)).filter(Boolean)
    expect(got.length).toBeGreaterThanOrEqual(2)
    expect(left).toEqual([])
  })

  it('free text is never overwritten by a drop', () => {
    const row = rowRef('g', ['0', '0'])
    const keep = row.who
    row.who = 'ALL PILOTS'; row.more = []
    fillSlot('g:0.0.+', 'bane')
    expect(row.who).toBe('ALL PILOTS')
    expect(row.more || []).toContain('bane')
    row.who = keep; row.more = []
  })

  it('whoSet holds blanks, trims only the tail', () => {
    const r: any = {}
    whoSet(r, ['a', '', 'b', '', ''])
    expect(r.who).toEqual(['a', '', 'b'])
    whoSet(r, ['a'])
    expect(r.who).toBe('a')
    whoSet(r, ['', ''])
    expect(r.who).toBe('')
  })

  it('and flyRef returns nothing rather than throwing', () => {
    expect(flyRef('99.99.99.99')).toBeUndefined()
    expect(flyRef('0.99.0.0')).toBeUndefined()
  })

  it('txtRef resolves a remarks field', () => {
    expect(txtRef('fr:0.0.0.0')).toBeTruthy()
  })

  it('txtRef survives a bad path', () => {
    expect(txtRef('fr:99.9.9.9')).toBe(null)
    expect(txtRef('nope')).toBe(null)
  })

  it('txtSet collapses whitespace, clears the placeholder, normalises times', () => {
    expect(txtSet('fr:0.0.0.0', '  spaced   out  ')).toBe(true)
    expect(txtGet('fr:0.0.0.0')).toBe('spaced out')
    expect(txtSet('fr:0.0.0.0', '—')).toBe(true)
    expect(txtGet('fr:0.0.0.0')).toBe('')
    expect(txtSet('ff:0.0.0.to', '0930')).toBe(true)
    expect(txtGet('ff:0.0.0.to')).toBe('09:30')
    /* returns false when the model does not move */
    expect(txtSet('ff:0.0.0.to', '09:30')).toBe(false)
  })

  it('a stale armed slot can be detected (armTargetExists)', () => {
    expect(armTargetExists('0.0.0.0.p')).toBe(true)
    expect(armTargetExists('0.99.0.0.p')).toBe(false)
    expect(armTargetExists('d:0.0.1')).toBe(true)
    expect(armTargetExists('d:0.99.0')).toBe(false)
  })
})

/* Renaming a callsign (owner, Aug 26). The callsign is the identity ground,
   programme and sim rows store as a STRING, so a rename has to rewrite them
   or those rows stop resolving and the puck collapses to plain text. */
describe('renaming a callsign', () => {
  const CS = JSON.stringify(Object.keys(PEOPLE).map(id => [id, PEOPLE[id].cs]))
  beforeEach(() => {
    JSON.parse(CS).forEach(([id, cs]: any) => {
      if (PEOPLE[id].cs !== cs) { delete ID_BY_CS[PEOPLE[id].cs.toLowerCase()]; PEOPLE[id].cs = cs }
      ID_BY_CS[cs.toLowerCase()] = id
    })
  })

  it('carries every stored who-string with it, so the seat still resolves', () => {
    // dj holds ground rows on day 0 (and a programme row on day 2)
    const before = DAYS.flatMap((d: any, di: number) =>
      (d.ground || []).map((r: any, ri: number) => ({ di, ri, id: slotVal(`g:${di}.${ri}`) }))).filter(x => x.id === 'dj')
    expect(before.length, 'the seed plants dj on a ground row').toBeGreaterThan(0)
    expect(renameCallsign('dj', 'Deejay')).toBe(true)
    expect(PEOPLE.dj.cs).toBe('Deejay')
    // the rows still resolve to the same person — that is what keeps the puck
    before.forEach(x => expect(slotVal(`g:${x.di}.${x.ri}`)).toBe('dj'))
    expect(DAYS[0].ground.find((r: any) => r.who === 'Deejay'), 'the stored string was rewritten').toBeTruthy()
    expect(nameToId('Deejay')).toBe('dj')
    expect(nameToId('Ace')).toBeUndefined()     // the old CALLSIGN no longer resolves
    expect(nameToId('dj')).toBe('dj')           // the bare id always does (id-tolerant)
  })

  it('rewrites programme rows, including multi-person who arrays', () => {
    const r = DAYS[0].allhands.find((x: any) => x.who === 'nact')
    expect(r).toBeTruthy()
    r.who = ['nact', 'bane']                     // a row carrying two people
    expect(renameCallsign('nact', 'Nacho')).toBe(true)
    expect(r.who).toEqual(['Nacho', 'bane'])
    expect(slotVal(`a:0.${DAYS[0].allhands.indexOf(r)}.0`)).toBe('nact')
  })

  it('refuses a duplicate, an empty name and a no-op', () => {
    expect(renameCallsign('dj', 'Ranger')).toBe(false)   // already taken
    expect(renameCallsign('dj', 'bane')).toBe(false)     // ...case-insensitively
    expect(PEOPLE.dj.cs).toBe('Ace')
    expect(renameCallsign('dj', '  ')).toBe(false)
    expect(renameCallsign('dj', 'Ace')).toBe(false)
    expect(renameCallsign('nobody', 'X')).toBe(false)
  })

  it('is not a schedule amendment — nothing is marked pending', () => {
    expect(renameCallsign('dj', 'Deejay')).toBe(true)
    expect(Object.keys(SCHED.pending).length).toBe(0)
  })
})
