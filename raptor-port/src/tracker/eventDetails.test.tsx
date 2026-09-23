// @vitest-environment jsdom
/* Event details belong to the chart they were typed on (owner, 23 Sep 26 —
   D126). The pure helpers, and the one-time carry-over of details typed before
   D126: those were his real work (part of the charts he exports on the way to
   the database, D120), so a browser that holds them in the old one-table key
   must read exactly as it did — every chart with the event — never lose them.

   Its own file so the Tracker boots FRESH here, over a store seeded with the
   old key before init (vitest gives every file its own module instance and
   its own jsdom storage). */
import { beforeAll, describe, expect, it } from 'vitest'
import { diffDetails, realFlatEdits, blockFromFlat, mergeBlock, scrubBlock, isDetailsTable } from './app/eventDetails.js'
import { EVENT_INFO } from './data/eventInfo.js'
import * as core from './app/core.js'
import { initStore, resetSession } from '../state/store'

const C: any = core
const EI: any = EVENT_INFO

describe('the helpers', () => {
  it('diffDetails keeps only what differs from the shipped wording, an emptied field included', () => {
    expect(diffDetails({ name: 'A', crew: 'X' }, { name: 'A', crew: 'Y', hrs: '' })).toEqual({ crew: 'Y' })
    expect(diffDetails({ name: 'A' }, { name: '' }), 'an emptied field is kept as empty').toEqual({ name: '' })
    expect(diffDetails({ name: 'A' }, { name: 'A' })).toBeNull()
  })
  it('realFlatEdits drops what equals the base table unless it was typed on purpose (__kept)', () => {
    const id = 'ST-01', base = EI[id]
    expect(base && base.name, 'the premise: ST-01 ships a name').toBeTruthy()
    const out: any = realFlatEdits({ [id]: { name: base.name, crew: 'TYPED', __kept: [] }, 'ACG-01': { name: EI['ACG-01'].name, __kept: ['name'] } }, EI)
    expect(out[id]).toEqual({ crew: 'TYPED' })
    expect(out['ACG-01'], 'a deliberate field equal to the base survives').toEqual({ name: EI['ACG-01'].name })
  })
  it('blockFromFlat lands an edit only on a chart that has the event', () => {
    const b = blockFromFlat({ 'ST-01': { name: 'N1' }, 'ZZ-9': { name: 'N2' } }, ['ST-01', 'ST-02'], () => ({}))
    expect(b).toEqual({ 'ST-01': { name: 'N1' } })
  })
  it('mergeBlock: the incoming edit wins where it speaks; every other typed detail stays (D122)', () => {
    const m = mergeBlock({ 'ST-01': { name: 'MINE', hrs: '2' }, 'ST-02': { crew: 'KEEP' } }, { 'ST-01': { name: 'FILE' } }, () => ({}))
    expect(m).toEqual({ 'ST-01': { name: 'FILE', hrs: '2' }, 'ST-02': { crew: 'KEEP' } })
  })
  it('scrubBlock and isDetailsTable', () => {
    expect(scrubBlock({ 'ST-01': { name: 'S' } }, () => ({ name: 'S' }))).toEqual({})
    expect(isDetailsTable({ sb2026: { 'ST-01': { name: 'x' } } })).toBe(true)
    expect(isDetailsTable({ sb2026: 'oops' })).toBe(false)
    expect(isDetailsTable([])).toBe(false)
  })
})

describe('details typed before D126 are carried over, not dropped', () => {
  beforeAll(async () => {
    /* what a browser that typed details before D126 holds: one table, keyed by
       event code, under the old key */
    localStorage.setItem('ocu:v3:eventinfo', JSON.stringify({ 'BFM-3': { name: 'OLD TYPED NAME' } }))
    initStore()
    resetSession({ user: 'ad', role: 'admin' })
    const board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board)
    await C.init()
  })

  it('every chart that has the event reads it exactly as before, and the old key is left untouched', async () => {
    const charts = C.orderedSylIds()
    let seen = 0
    for (const id of charts) {
      await C.switchSyllabus(id); await C.whenLoaded()
      if (!C.byid['BFM-3']) continue
      expect(C.infoFor('BFM-3').name, 'on ' + C.sylName(id)).toBe('OLD TYPED NAME'); seen++
    }
    expect(seen, 'the premise: more than one chart carries BFM-3').toBeGreaterThan(1)
    expect(JSON.parse(localStorage.getItem('ocu:v3:eventinfo')!), 'the old key is a backup, never rewritten').toEqual({ 'BFM-3': { name: 'OLD TYPED NAME' } })
    const now = JSON.parse(localStorage.getItem('ocu:v3:master:eventinfo')!)
    expect(isDetailsTable(now), 'the new per-chart key holds them').toBe(true)
  })

  it('and from then on an edit on one chart stays on that chart (D126)', async () => {
    const [a, b] = C.orderedSylIds().filter((id: string) => id === C.sylIdOf('2026') || id === C.sylIdOf('Tx 2026'))
    await C.switchSyllabus(a); await C.whenLoaded()
    await C.saveInfoFor('BFM-3', { ...C.infoFor('BFM-3'), name: 'ONLY HERE' })
    await C.switchSyllabus(b); await C.whenLoaded()
    expect(C.infoFor('BFM-3').name).toBe('OLD TYPED NAME')
  })
})
