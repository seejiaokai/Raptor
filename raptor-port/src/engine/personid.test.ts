/* ARCH-STACK step 1C — who → personId. The behaviour increment for the
   stable-id conversion: ground/programme person-references store the stable
   PEOPLE id, rename is a label change that moves nothing, no reused callsign can
   cross two people, the add path refuses an id-colliding callsign, and sim `who`
   is free text (never resolved to a person). Mirrors the rename/reorder/delete/
   copy behaviour-test ask in the architecture plan's sequence re-review. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { slotVal, setSlotVal, fillSlot, rowCrew, renameCallsign } from './slots'
import { PEOPLE, ID_BY_CS, nameToId, whoId } from './people'
import { dayEngaged, personCount } from './avail'
import { SCHED } from './publish'

const SNAP = JSON.stringify(DAYS)
/* PEOPLE / ID_BY_CS are module singletons shared across the run — snapshot the
   callsigns and rebuild the index after each test so a rename or a fake add here
   never leaks into another file. */
const CS0: Record<string, string> = {}
Object.keys(PEOPLE).forEach(id => { CS0[id] = PEOPLE[id].cs })
function restorePeople() {
  for (const id of Object.keys(PEOPLE)) if (!(id in CS0)) delete PEOPLE[id]   // drop fakes
  for (const id of Object.keys(CS0)) if (PEOPLE[id]) PEOPLE[id].cs = CS0[id]
  for (const k of Object.keys(ID_BY_CS)) delete ID_BY_CS[k]
  for (const id of Object.keys(PEOPLE)) { const cs = PEOPLE[id].cs; if (typeof cs === 'string') ID_BY_CS[cs.toLowerCase()] = id }
}
beforeEach(() => {
  DAYS.length = 0; JSON.parse(SNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
})
afterEach(restorePeople)

describe('1C — ground/programme writes store the stable id', () => {
  it('setSlotVal stores the id on a ground row, and slotVal reads it back', () => {
    setSlotVal('g:0.0', 'bane')
    expect(DAYS[0].ground[0].who).toBe('bane')            // the ID, not PEOPLE.bane.cs
    expect(slotVal('g:0.0')).toBe('bane')
    expect(rowCrew('g', ['0', '0'])).toContain('bane')
  })
  it('setSlotVal stores the id in a programme who-array', () => {
    setSlotVal('a:0.0.0', 'bane')
    const r = DAYS[0].allhands[0]
    const arr = Array.isArray(r.who) ? r.who : [r.who]
    expect(arr[0]).toBe('bane')                           // the ID, not the callsign
    expect(slotVal('a:0.0.0')).toBe('bane')
  })
  it('an id that differs from its callsign round-trips (haowen ≠ Talisman)', () => {
    setSlotVal('g:0.0', 'haowen')
    expect(DAYS[0].ground[0].who).toBe('haowen')
    expect(slotVal('g:0.0')).toBe('haowen')
  })
})

describe('1C — rename is label-only and cannot cross two people', () => {
  it('renaming moves nothing: the stored id and every seat are unchanged', () => {
    setSlotVal('g:0.0', 'bane')
    SCHED.pending = {}                                     // isolate the rename's own effect
    expect(renameCallsign('bane', 'Nightjar')).toBe(true)
    expect(PEOPLE.bane.cs).toBe('Nightjar')
    expect(DAYS[0].ground[0].who).toBe('bane')            // NOT rewritten
    expect(slotVal('g:0.0')).toBe('bane')
    expect(Object.keys(SCHED.pending).length).toBe(0)     // the rename is not an amendment
  })
  it('a reused old callsign does NOT capture the row (id-first read)', () => {
    setSlotVal('g:0.0', 'bane')                           // Ranger's row, by id
    expect(renameCallsign('bane', 'Nightjar')).toBe(true) // frees the callsign "Ranger"
    // a DIFFERENT person is now given the freed callsign
    PEOPLE['xnew'] = { cs: 'Ranger', seat: 'FCP', q: 'C' } as any
    ID_BY_CS['ranger'] = 'xnew'
    // the stored id still resolves to the ORIGINAL person, never the newcomer
    expect(whoId('bane')).toBe('bane')
    expect(slotVal('g:0.0')).toBe('bane')
    expect(slotVal('g:0.0')).not.toBe('xnew')
  })
  it('the crossing survives a persisted snapshot (the case the old walk missed)', () => {
    // a snapshot row, written before a rename, keeps the id and still resolves
    const snapRow = { prog: 'X', str: '0900', end: '1000', who: 'bane' }
    expect(renameCallsign('bane', 'Nightjar')).toBe(true)
    PEOPLE['xnew'] = { cs: 'Ranger', seat: 'FCP', q: 'C' } as any
    ID_BY_CS['ranger'] = 'xnew'
    expect(whoId(snapRow.who)).toBe('bane')               // not 'xnew'
  })
})

describe('1C — the add path refuses an id-colliding callsign (PID-01 guard)', () => {
  it('a callsign equal to an existing person id resolves (so addPerson would refuse)', () => {
    // addPerson (QualsPage) guards with `if (nameToId(cs)) refuse`
    expect(nameToId('bane')).toBe('bane')                 // "Bane" collides with the id `bane`
    expect(nameToId('Ranger')).toBe('bane')               // an existing callsign is also refused
    expect(nameToId('EXT SQN')).toBeUndefined()           // genuine free text is free to use
  })
})

describe('1C — sim `who` is free text, never a person', () => {
  const day = () => ({ waves: [], sims: { amt: [], oft: [{ label: 'X', str: '0900', end: '1000', who: 'bane' }] }, dutywaves: [], ground: [], allhands: [] })
  it('dayEngaged does not task a person named in a sim who', () => {
    expect(dayEngaged(day() as any).has('bane')).toBe(false)
  })
  it('personCount does not count a sim who', () => {
    DAYS.length = 0; DAYS.push(day() as any)
    expect(personCount('bane')).toBe(0)
  })
  it('but sim seats (p/w/pax) still count', () => {
    const d: any = { waves: [], sims: { amt: [], oft: [{ label: 'X', str: '0900', end: '1000', p: 'bane' }] }, dutywaves: [], ground: [], allhands: [] }
    expect(dayEngaged(d).has('bane')).toBe(true)
  })
})

describe('1C — whoId resolves id-first', () => {
  it('an id wins, a legacy callsign falls back, free text is undefined', () => {
    expect(whoId('bane')).toBe('bane')                    // id → itself
    expect(whoId('Ranger')).toBe('bane')                  // legacy callsign → id
    expect(whoId('EXT SQN')).toBeUndefined()              // free text → undefined
    expect(whoId('')).toBeUndefined()
  })
  it('fillSlot on an empty programme cell stores the id', () => {
    const ri = DAYS[0].allhands.length
    DAYS[0].allhands.push({ prog: 'NEW', str: '', end: '' } as any)
    fillSlot(`a:0.${ri}.+`, 'bane')
    const r = DAYS[0].allhands[ri]
    const arr = Array.isArray(r.who) ? r.who : [r.who]
    expect(arr[0]).toBe('bane')
  })
})
