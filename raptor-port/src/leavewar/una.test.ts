/* UNA ON THE LEAVE WAR ONLY (his D1338, 24 Oct 26 — "it can be reasons like this person is under investigation for example
   and he’s put out of manning. And for people to see on the leave war so they don’t get confused on the counting. Maybe
   put UNA instead? But nowhere else", then "Yes but members can read its remarks too and its admin input only").

   UNA is the war's OWN record, as a bid or an automatic OIL credit is: an admin places it on any man's row for a whole
   day, the morning or the afternoon, with remarks; it takes him out of the war's manning by 1 or 0.5; it charges no
   balance, is never approved or refused and clashes with nothing; everyone sees its box and reads its remarks; a member
   never places, changes or takes one away. The Inputs side is pinned shut in engine/unagone.test.ts. */
import { act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { displayCell, formatCell, kindOf, parseCell } from './engine/codes'
import { INPUTS } from '../engine/inputs'
import { clearCells, getState, initStore, lwHistInit, placeUna, rawState, removeUna, setCell, setPeople, setRole, setViewer, setUnaRemarks } from './state/store'
import { memoryBackend } from './state/storage'
import { initStore as raptorInitStore } from '../state/store'
import { setMe, setSession } from '../state/auth'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync } from './sync'
import { _resetTimeline } from '../undo/timeline'
import { globalUndo } from '../undo'
import { installGlobalUndo } from '../state/undo-wire'
import { ownershipViolation } from '../state/perms'
import type { CommitEnvelope } from '../command'
import type { MergedWar } from './state/merge'
import { dayView, levelOf, type Contrib } from './engine/dayview'
import { listProblem, readRec, readRecs, recContribs, type WarRec } from './engine/warrecs'

const una = (code: string, extra: Record<string, unknown> = {}): WarRec => ({ id: `u-${code}`, kind: 'una', code, by: 'SABER', ...extra } as WarRec)
const bid = (code: string, state: 'pending' | 'refused' = 'pending'): WarRec => ({ id: `b-${code}`, kind: 'request', code, state })

describe('D1338 — its notation comes in halves, as leave’s does', () => {
  it('UNA, *UNA, UNA* parse; the box reads UNA, <UNA, UNA>', () => {
    expect(parseCell('UNA')).toEqual({ type: 'UNA', portion: 'full' })
    expect(parseCell('*UNA')).toEqual({ type: 'UNA', portion: 'am' })
    expect(parseCell('UNA*')).toEqual({ type: 'UNA', portion: 'pm' })
    expect(formatCell({ type: 'UNA', portion: 'am' })).toBe('*UNA')
    expect(displayCell('*UNA')).toBe('<UNA')
    expect(displayCell('UNA*')).toBe('UNA>')
    expect(kindOf('UNA*')).toBe('una')
  })
  it('a course and an overseas duty still never take a half', () => {
    expect(parseCell('*CSE')).toBeNull()
    expect(parseCell('OD*')).toBeNull()
  })
})

describe('D1338 — the stored record', () => {
  it('reads back whole: its half, its remarks, who placed it', () => {
    expect(readRec({ id: 'u1', kind: 'una', code: '*una', remarks: 'Under investigation', by: 'SABER' }))
      .toEqual({ id: 'u1', kind: 'una', code: '*UNA', remarks: 'Under investigation', by: 'SABER' })
    expect(readRec({ id: 'u2', kind: 'una', code: 'UNA' })).toEqual({ id: 'u2', kind: 'una', code: 'UNA' })
  })
  it('keeps its place at its address across a reload', () => {
    expect(readRec({ id: 'u1', kind: 'una', code: 'UNA', ord: 3 })).toMatchObject({ ord: 3 })
  })
  it('a code that is not UNA is not a UNA record (a broken one is refused, as any malformed record is)', () => {
    expect(readRec({ id: 'u1', kind: 'una', code: 'LL' })).toBeNull()
    expect(readRec({ id: 'u1', kind: 'una', code: '*UNA*' })).toBeNull()
    expect(readRec({ id: 'u1', kind: 'una' })).toBeNull()
  })
  it('over-long words are cut, never refused (a war is never thrown away for its remarks)', () => {
    const r = readRec({ id: 'u1', kind: 'una', code: 'UNA', remarks: 'x'.repeat(500), by: 'y'.repeat(200) }) as any
    expect(r.remarks.length).toBe(200)
    expect(r.by.length).toBe(60)
  })
  it('one UNA a half: a whole day and a morning on one date break the address; a morning and an afternoon do not', () => {
    expect(listProblem([una('UNA'), una('*UNA', { id: 'u2' })])).toMatch(/UNA/)
    expect(listProblem([una('*UNA'), una('UNA*')])).toBeNull()
  })
  it('sits with a bid on the same day (a bid and a UNA are two records, not a clash)', () => {
    expect(listProblem([una('UNA'), bid('LL')])).toBeNull()
    expect(readRecs({ pipper: { '2026-01-14': [una('UNA'), bid('LL')] } })).not.toBeNull()
  })
})

describe('D1338 — on the day: out of the manning by 1 or 0.5, charged nothing, clashing with nothing', () => {
  const view = (...recs: WarRec[]) => dayView(recContribs(recs))
  it('a whole day takes him out of the manning, and charges no balance', () => {
    const v = view(una('UNA', { remarks: 'Investigation' }))
    expect(v.away).toBe(1)
    expect(v.charges).toEqual([])
    expect(v.code).toBe('UNA')
    expect(v.state).toBe('approved')
    expect(v.main).toMatchObject({ kind: 'una', remarks: 'Investigation', by: 'SABER' })
    expect(v.amber).toBe(false)
    expect(v.duty).toBe(false)
    expect(v.earnsOil).toBe(0)
  })
  it('a morning counts half, and the box sits in the morning', () => {
    const v = view(una('*UNA'))
    expect(v.away).toBe(0.5)
    expect(v.code).toBe('*UNA')
  })
  it('an afternoon counts half, in the afternoon', () => {
    expect(view(una('UNA*'))).toMatchObject({ away: 0.5, code: 'UNA*' })
  })
  it('beside a pending leave bid on the same time: no clash, no amber; the bid still charges; he is away the once', () => {
    const v = view(una('UNA'), bid('LL'))
    expect(v.conflicts).toEqual([])
    expect(v.amber).toBe(false)
    expect(v.away).toBe(1)
    expect(v.charges.reduce((n, c) => n + c.amount, 0)).toBe(1)
    expect(v.mark).toBe('+1')
  })
  it('stands under leave and medical on the ladder, over a bid', () => {
    const u: Contrib = recContribs([una('UNA')])[0]!
    expect(levelOf(u)).toBeGreaterThan(levelOf({ id: 'a', kind: 'absence', code: 'LL', win: [0, 1439] }))
    expect(levelOf(u)).toBeLessThan(levelOf({ id: 'b', kind: 'request', code: 'LL', win: [0, 1439], state: 'pending' }))
  })
})

/* ---- the store: an admin's alone (D1338 — "its admin input only") ---------------------------------------------------- */
const ISNAP = JSON.stringify(INPUTS)
const P = 'dusk', D = '2026-02-11'
const recsOn = (d = D, p = P) => (rawState().wars.find(w => w.period.start <= d && d <= w.period.end)!.recs[p]?.[d] ?? []) as any[]
const unasOn = (d = D, p = P) => recsOn(d, p).filter(r => r.kind === 'una')
const viewOn = (d = D, p = P) => (getState().wars as MergedWar[]).find(w => w.period.start <= d && d <= w.period.end)!.views[p]?.[d]

describe('D1338 — the store: an admin places it, a member never', () => {
  beforeEach(() => {
    INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
    setSession({ user: 'ad', role: 'admin' })
    raptorInitStore()
    initStore(memoryBackend()); setRole('admin')
    setPeople(projectPeople())
    wireLeaveWarSync()
    _resetTimeline(); lwHistInit(); installGlobalUndo()
  })
  afterEach(() => { _resetTimeline(); setSession(null); setMe('bane'); INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i)) })

  it('an admin places a whole day with its remarks; it names him; the manning loses the man; nothing reaches the Inputs', () => {
    const before = INPUTS.length
    expect(placeUna([{ personId: P, date: D }], 'full', { remarks: 'Under investigation' })).toEqual({ done: 1, skipped: 0 })
    expect(unasOn()).toHaveLength(1)
    expect(unasOn()[0]).toMatchObject({ kind: 'una', code: 'UNA', remarks: 'Under investigation' })
    expect(typeof unasOn()[0].by).toBe('string')
    expect(viewOn()!.away).toBe(1)
    expect(INPUTS.length, 'never an input (D1338 — nowhere else)').toBe(before)
  })
  it('a morning, then an afternoon: two halves; a whole day over them replaces both', () => {
    placeUna([{ personId: P, date: D }], 'am')
    placeUna([{ personId: P, date: D }], 'pm')
    expect(unasOn().map(r => r.code).sort()).toEqual(['*UNA', 'UNA*'])
    expect(viewOn()!.away).toBe(1)
    placeUna([{ personId: P, date: D }], 'full')
    expect(unasOn().map(r => r.code)).toEqual(['UNA'])
  })
  it('a morning over a whole day replaces it, so the afternoon is back in the manning', () => {
    placeUna([{ personId: P, date: D }], 'full')
    placeUna([{ personId: P, date: D }], 'am')
    expect(unasOn().map(r => r.code)).toEqual(['*UNA'])
    expect(viewOn()!.away).toBe(0.5)
  })
  it('several people and days in one go: one command, one Undo takes them all back', () => {
    const cells = [{ personId: P, date: D }, { personId: P, date: '2026-02-12' }, { personId: 'ramp', date: D }]
    expect(placeUna(cells, 'full').done).toBe(3)
    act(() => { expect(globalUndo().ok).toBe(true) })
    expect(unasOn()).toHaveLength(0)
    expect(unasOn('2026-02-12')).toHaveLength(0)
    expect(unasOn(D, 'ramp')).toHaveLength(0)
  })
  it('a day no leave period holds is skipped and counted', () => {
    expect(placeUna([{ personId: P, date: '2031-06-01' }], 'full')).toEqual({ done: 0, skipped: 1 })
  })
  it('its remarks change, and it is taken away — an admin’s, each one Undo', () => {
    placeUna([{ personId: P, date: D }], 'full', { remarks: 'Investigation' })
    const id = unasOn()[0].id
    expect(setUnaRemarks(P, D, id, 'Board of inquiry')).toBe(true)
    expect(unasOn()[0].remarks).toBe('Board of inquiry')
    expect(removeUna(P, D, id)).toBe(true)
    expect(unasOn()).toHaveLength(0)
    act(() => { expect(globalUndo().ok).toBe(true) })
    expect(unasOn()).toHaveLength(1)
  })
  it('a member places none, changes none, takes none away — his own row included', () => {
    placeUna([{ personId: P, date: D }], 'full', { remarks: 'Investigation' })
    const id = unasOn()[0].id
    setSession({ user: 'dk', role: 'member' }); setMe(P)
    act(() => { setRole('member'); setViewer(P) })
    expect(placeUna([{ personId: P, date: '2026-02-12' }], 'full')).toEqual({ done: 0, skipped: 1 })
    expect(setUnaRemarks(P, D, id, 'mine')).toBe(false)
    expect(removeUna(P, D, id)).toBe(false)
    expect(unasOn()).toHaveLength(1)
    expect(unasOn()[0].remarks).toBe('Investigation')
  })
  it('a member’s own bid beside it, and his Delete of that bid, leave the UNA standing', () => {
    placeUna([{ personId: P, date: D }], 'am')
    setSession({ user: 'dk', role: 'member' }); setMe(P)
    act(() => { setRole('member'); setViewer(P) })
    setCell(P, D, 'LL*')
    expect(recsOn().some(r => r.kind === 'request')).toBe(true)
    setCell(P, D, '')
    expect(recsOn().some(r => r.kind === 'request')).toBe(false)
    expect(unasOn().map(r => r.code)).toEqual(['*UNA'])
  })
  it('an admin’s block Delete takes it with everything else in the block (as it takes an award — D260)', () => {
    placeUna([{ personId: P, date: D }], 'full')
    setCell(P, '2026-02-12', 'LL')
    expect(clearCells([{ personId: P, date: D }, { personId: P, date: '2026-02-12' }]).written).toBe(2)
    expect(unasOn()).toHaveLength(0)
  })
})

describe('D1338 — the commit refuses a member’s command that touches a UNA, whatever it is called', () => {
  const W = 'w', at = `${W}:bane:${D}`
  const u = { id: 'u1', kind: 'una', code: 'UNA', remarks: 'x', by: 'SABER' } as WarRec
  const b: WarRec = { id: 'b1', kind: 'request', code: 'LL', state: 'pending' }
  const env = (before: WarRec[], after: WarRec[], op: 'put' | 'delete' = 'put'): CommitEnvelope => ({
    seq: 0, at: '', type: 'lw.edit', origin: 'user', scope: { module: 'lw', warId: W } as any,
    actor: { id: 'us', role: 'member', personId: 'bane', session: {} } as any,
    changes: [{ op, collection: 'lw.cell', id: at, before, after }],
  })
  it('taking it away, changing its words, or adding one is refused', () => {
    expect(ownershipViolation(env([u], []))).toMatch(/UNA/)
    expect(ownershipViolation(env([u], [], 'delete'))).toMatch(/UNA/)
    expect(ownershipViolation(env([u], [{ ...u, remarks: 'y' } as WarRec]))).toMatch(/UNA/)
    expect(ownershipViolation(env([], [u]))).toMatch(/UNA/)
  })
  it('his bid beside it — the UNA as it was, its place in the list re-minted — passes', () => {
    expect(ownershipViolation(env([{ ...u, ord: 1 } as WarRec], [{ ...u, ord: 2 } as WarRec, b]))).toBeNull()
  })
})

/* ---- saved and read back: a UNA survives a reload, and the war beside it is kept whole ------------------------------- */
describe('D1338 — a UNA is saved with the war and survives a reload', () => {
  afterEach(() => { _resetTimeline(); setSession(null); setMe('bane'); INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i)) })
  it('placed, then the store read again from the same storage: the UNA, its half, its words and its maker are all there, and the bids beside it too', () => {
    INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
    setSession({ user: 'ad', role: 'admin' })
    raptorInitStore()
    const be = memoryBackend()
    initStore(be); setRole('admin'); setPeople(projectPeople()); wireLeaveWarSync(); _resetTimeline(); lwHistInit(); installGlobalUndo()
    const bidsBefore = JSON.stringify(rawState().wars.map(w => Object.values(w.recs).flatMap(row => Object.values(row).flat()).filter((r: any) => r.kind === 'request').length))
    expect(placeUna([{ personId: P, date: D }], 'pm', { remarks: 'Board of inquiry' }).done).toBe(1)
    const placed = unasOn()[0]
    initStore(be); setRole('admin'); setPeople(projectPeople())
    expect(unasOn()).toHaveLength(1)
    expect(unasOn()[0]).toMatchObject({ id: placed.id, code: 'UNA*', remarks: 'Board of inquiry', by: placed.by })
    const bidsAfter = JSON.stringify(rawState().wars.map(w => Object.values(w.recs).flatMap(row => Object.values(row).flat()).filter((r: any) => r.kind === 'request').length))
    expect(bidsAfter, 'the war was read, not thrown away and re-seeded').toBe(bidsBefore)
    expect(viewOn()!.away).toBe(0.5)
  })
})
