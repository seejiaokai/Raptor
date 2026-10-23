/* A LEAVE REQUEST'S OWN WORDS AND PAPERS (owner D1210, D1226, D1150, D1159; M3 5.9–5.11, 7.2) — through the real
   stores, the real inputs door and the real global undo:
   · a bid written with its remarks, till tick and documents carries them (one command);
   · a re-typed bid keeps them (5.11);
   · `setRequestWords` (`lw.reqmeta`) changes them on every day of the request's run, one Undo;
   · a member changes his own pending request's words on a day closed for him — and nothing else there (perms.ts
     onlyChangesWords); another man's row is refused;
   · approving carries them onto the leave on the Inputs page, and taking the approval back carries them back (7.2). */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS, holds, remarksShown } from '../engine/inputs'
import { initStore as raptorInitStore } from '../state/store'
import { setMe, setSession } from '../state/auth'
import { rowDocIds } from '../state/docs'
import { projectPeople } from './state/raptorRoster'
import {
  closeDates, initStore, isDayOpen, lwHistInit, placeApproved, recordsAt, setBidStates, setCell, setCellRange, setPeople,
  setRequestWords, setRole, setViewer,
} from './state/store'
import type { RequestRec } from './engine/warrecs'
import { memoryBackend } from './state/storage'
import { wireLeaveWarSync } from './sync'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'

const ISNAP = JSON.stringify(INPUTS)
const reqs = (pid: string, date: string) => recordsAt(pid, date).filter((r): r is RequestRec => r.kind === 'request')
const leaveOf = (pid: string, type = 'LL') => INPUTS.filter((r: any) => holds(r, pid) && r.type === type)
const asAdmin = () => { setSession({ user: 'ad', role: 'admin' }); setRole('admin'); setViewer(null) }
const asMember = (pid: string) => { setSession({ user: 'us', role: 'main' }); setMe(pid); setRole('member'); setViewer(pid) }

beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  setSession({ user: 'ad', role: 'admin' })
  raptorInitStore()
  initStore(memoryBackend())
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  setRole('admin')
})
afterEach(() => { _resetTimeline(); setSession(null); setMe('bane') })

describe('a bid written with its words (5.9, 5.10)', () => {
  it('one day: remarks, an unticked till and a document ride on the bid', () => {
    expect(setCell('ammo', '2026-02-18', 'LL', { remarks: 'awaiting the form', till: false, docIds: ['doc-a'] })).toBe(true)
    expect(reqs('ammo', '2026-02-18')[0]).toMatchObject({ code: 'LL', remarks: 'awaiting the form', till: false, docIds: ['doc-a'] })
  })
  it('a range: every day carries the same words, and one Undo takes the whole bid', () => {
    expect(setCellRange('ammo', '2026-02-16', '2026-02-18', 'LL', { remarks: 'Bali' }).written).toBe(3)
    for (const d of ['2026-02-16', '2026-02-17', '2026-02-18']) expect(reqs('ammo', d)[0]?.remarks).toBe('Bali')
    expect(globalUndo().ok).toBe(true)
    expect(reqs('ammo', '2026-02-17')).toHaveLength(0)
  })
})

describe('a re-typed bid keeps its words (5.11)', () => {
  it('LL changed to OL keeps the remark and the document', () => {
    setCell('ammo', '2026-02-18', 'LL', { remarks: 'Tokyo', docIds: ['doc-b'] })
    expect(setCell('ammo', '2026-02-18', 'OL')).toBe(true)
    const r = reqs('ammo', '2026-02-18')
    expect(r).toHaveLength(1)
    expect(r[0]).toMatchObject({ code: 'OL', remarks: 'Tokyo', docIds: ['doc-b'] })
  })
})

describe('setRequestWords — lw.reqmeta', () => {
  it('changes the words on every day of the run, not on a neighbour with other words, in one Undo', () => {
    setCellRange('ammo', '2026-02-16', '2026-02-18', 'LL', { remarks: 'old' })
    setCell('ammo', '2026-02-19', 'LL', { remarks: 'other' })
    const id = reqs('ammo', '2026-02-17')[0]!.id
    expect(setRequestWords('ammo', '2026-02-17', id, { remarks: 'new', docIds: ['doc-c'] })).toBe(true)
    for (const d of ['2026-02-16', '2026-02-17', '2026-02-18']) expect(reqs('ammo', d)[0]).toMatchObject({ remarks: 'new', docIds: ['doc-c'] })
    expect(reqs('ammo', '2026-02-19')[0]?.remarks).toBe('other')
    expect(globalUndo().ok).toBe(true)
    for (const d of ['2026-02-16', '2026-02-17', '2026-02-18']) {
      expect(reqs('ammo', d)[0]?.remarks).toBe('old')
      expect(reqs('ammo', d)[0]?.docIds).toBeUndefined()
    }
  })
  it('nothing changed is nothing written; an empty remark or document list takes them away', () => {
    setCell('ammo', '2026-02-18', 'LL', { remarks: 'x', docIds: ['doc-d'] })
    const id = reqs('ammo', '2026-02-18')[0]!.id
    expect(setRequestWords('ammo', '2026-02-18', id, { remarks: 'x' })).toBe(false)
    expect(setRequestWords('ammo', '2026-02-18', id, { remarks: '', docIds: [] })).toBe(true)
    const r = reqs('ammo', '2026-02-18')[0]!
    expect(r.remarks).toBeUndefined()
    expect(r.docIds).toBeUndefined()
  })
})

describe('a member, on a day closed for him (D1150, D1210)', () => {
  const pid = 'bane'
  it('changes his own pending bid’s words and documents; his Undo of it goes through', () => {
    asMember(pid)
    expect(setCell(pid, '2026-02-10', 'LL')).toBe(true)
    asAdmin()
    expect(closeDates('2026-02-01', '2026-02-28')).toBe('set')
    asMember(pid)
    expect(isDayOpen('2026-02-10')).toBe(false)
    const id = reqs(pid, '2026-02-10')[0]!.id
    expect(setRequestWords(pid, '2026-02-10', id, { remarks: 'form attached', docIds: ['doc-e'] })).toBe(true)
    expect(reqs(pid, '2026-02-10')[0]).toMatchObject({ code: 'LL', state: 'pending', remarks: 'form attached', docIds: ['doc-e'] })
    const u = globalUndo()
    expect(u.ok, JSON.stringify(u)).toBe(true)
    expect(reqs(pid, '2026-02-10')[0]?.remarks).toBeUndefined()
  })
  it('still cannot change its code there, nor touch another man’s bid', () => {
    asMember(pid)
    setCell(pid, '2026-02-10', 'LL')
    asAdmin()
    setCell('ammo', '2026-02-11', 'LL')
    closeDates('2026-02-01', '2026-02-28')
    asMember(pid)
    expect(setCell(pid, '2026-02-10', 'OL')).toBe(false)
    expect(reqs(pid, '2026-02-10')[0]?.code).toBe('LL')
    const other = reqs('ammo', '2026-02-11')[0]!.id
    expect(setRequestWords('ammo', '2026-02-11', other, { remarks: 'not mine' })).toBe(false)
    expect(reqs('ammo', '2026-02-11')[0]?.remarks).toBeUndefined()
  })
})

describe('approval carries them onto the leave, and back (7.2)', () => {
  it('approve: the leave on the Inputs page holds the remark, the unticked till and the documents; take back: the request holds them again', () => {
    const cell = [{ personId: 'ammo', date: '2026-02-18' }]
    setCell('ammo', '2026-02-18', 'LL', { remarks: 'Perth', till: false, docIds: ['doc-f', 'doc-g'] })
    setBidStates(cell, 'approved')
    const leave = leaveOf('ammo')[0] as any
    expect(leave).toBeTruthy()
    expect(leave.remarks).toBe('Perth')
    expect(leave.till).toBe(false)
    expect(rowDocIds(leave)).toEqual(['doc-f', 'doc-g'])
    expect(remarksShown(leave)).toBe('Perth')                 // unticked: no screen prints its date
    setBidStates(cell, 'pending')
    expect(reqs('ammo', '2026-02-18')[0]).toMatchObject({ remarks: 'Perth', till: false, docIds: ['doc-f', 'doc-g'] })
  })
  it('"Approve what I enter": placed and approved with its words in one command', () => {
    const r = placeApproved([{ personId: 'ammo', date: '2026-02-18' }], 'LL', { remarks: 'Seoul', docIds: ['doc-h'] })
    expect(r.approved).toBe(1)
    const leave = leaveOf('ammo')[0] as any
    expect(leave.remarks).toBe('Seoul')
    expect(rowDocIds(leave)).toEqual(['doc-h'])
  })
  it('a request unticked by hand does not join a ticked leave beside it — its choice is kept', () => {
    setCell('ammo', '2026-02-17', 'LL')
    setBidStates([{ personId: 'ammo', date: '2026-02-17' }], 'approved')
    setCell('ammo', '2026-02-18', 'LL', { till: false })
    setBidStates([{ personId: 'ammo', date: '2026-02-18' }], 'approved')
    const rows = leaveOf('ammo') as any[]
    expect(rows).toHaveLength(2)
    expect(rows.map(r => r.till).sort()).toEqual([false, undefined])
  })
  it('a leave approved next to one with other papers joins it and keeps both papers', () => {
    setCell('ammo', '2026-02-17', 'LL', { docIds: ['doc-1'] })
    setBidStates([{ personId: 'ammo', date: '2026-02-17' }], 'approved')
    setCell('ammo', '2026-02-18', 'LL', { docIds: ['doc-2'] })
    setBidStates([{ personId: 'ammo', date: '2026-02-18' }], 'approved')
    const rows = leaveOf('ammo')
    expect(rows).toHaveLength(1)
    expect(rowDocIds(rows[0]).sort()).toEqual(['doc-1', 'doc-2'])
  })
})
