// @vitest-environment jsdom
/* AN OWN-PAGE STEP'S UNDO WHILE ANOTHER SQUADRON IS PICKED (the reshape plan
   docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md §3.2 A-v "Eligibility": "In view" is the pick on the schedule
   pages, the page's own squadron — perms.ts pageUnit('own') — on the own pages; A-ii names the own pages). A step whose ids
   name a squadron is taken only in view of it. Undo is the top bar's, on every page — so a 142 admin with View of 149 who
   picked 149 and changed his own squadron's Quals columns found his step passed over from any schedule page, though his own
   pages are still 142's. A step whose records of his own page's squadron are all own-page records (Quals' columns, the
   Inputs calendar, the flying plan, the SANS colours, the members' filing switch) is his to take wherever he presses; a
   schedule step of that squadron still waits for its pick. The world: test-support/msq-world.ts. */
import { describe, it, expect, afterEach } from 'vitest'
import { useMsqWorld, signInAs, PID, ACCT } from '../test-support/msq-world'
import { switchUnit } from './store'
import { setGrant } from './units'
import { setPage } from './view'
import { setQualColsOf, qualColsOf, DEFAULT_QUAL_COLS } from '../engine/qualcols'
import { store } from '../engine/hooks'
import { UNIT, BOOT_UNIT } from '../engine/unitview'
import { globalUndo, _timelineEntries } from '../undo/timeline'

useMsqWorld()
afterEach(() => { if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT) })

const renamedNvg = (h: string) => DEFAULT_QUAL_COLS.map(c => (c.k === 'nvg' ? { ...c, h } : c))
const nvgOf = (unit: string) => qualColsOf(unit).find(c => c.k === 'nvg')!.h
const lastEntry = () => { const es = _timelineEntries(); return es[es.length - 1]! }

describe('an own-page step of his own squadron, while another is picked', () => {
  it('a 142 admin with View of 149 picks 149, changes 142’s Quals columns and presses Undo on a schedule page: taken', () => {
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u149', 'view', PID.hunter)).toMatchObject({ ok: true })
    signInAs('hunter')
    switchUnit('u149')
    setPage('editsched')
    expect(setQualColsOf('u142', renamedNvg('NVG 142'))).toBe(true)
    expect(lastEntry().forward.map(c => c.id)).toEqual(['u142@qualcols'])
    expect(nvgOf('u142')).toBe('NVG 142')
    const u = globalUndo()
    expect(u.ok, JSON.stringify(u.reason)).toBe(true)
    expect(nvgOf('u142'), '142’s columns back as they were').toBe('NVG')
  })

  it('(control) a 142 schedule step made before the pick: passed over, as today', () => {
    signInAs('hunter')
    store.set('cxreasons', ['WX', 'U/S jet'])
    expect(lastEntry().forward.map(c => c.id)).toEqual(['u142@cxreasons'])
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u149', 'view', PID.hunter)).toMatchObject({ ok: true })
    signInAs('hunter')
    store.set('cxreasons', ['WX', 'U/S jet', 'ATC'])
    switchUnit('u149')
    setPage('editsched')
    const u = globalUndo()
    expect(u.ok, 'his 142 schedule step waits for 142 to be picked').toBe(false)
    expect(store.get('u142@cxreasons', null)).toEqual(['WX', 'U/S jet', 'ATC'])
  })

  it('(control) a master admin who picked 149 and changed 149’s Quals: taken', () => {
    signInAs('saber')
    switchUnit('u149')
    setPage('editsched')
    expect(setQualColsOf('u149', renamedNvg('NVG 149'))).toBe(true)
    const u = globalUndo()
    expect(u.ok, JSON.stringify(u.reason)).toBe(true)
    expect(nvgOf('u149')).toBe('NVG')
  })
})
