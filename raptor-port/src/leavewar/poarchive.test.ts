// The post-out auto-archive (owner, 19 Aug 26): when a person's PO date
// ARRIVES, their Raptor body moves into the Quals archive — unless the PO was
// placed with the "Archive on PO date" switch off (the custom case), or the
// posting window never came from the PO sheet at all. Archiving alters
// nothing a scheduler issued: it is a flag, and the schedules' data stays.
//
// Its own file, like viewer.test.ts, because wiring the sync leaves a live
// Raptor subscription behind.

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { PEOPLE } from '../engine/people'
import { DAYS } from '../engine/data'
import { initStore as raptorInitStore, notify as raptorNotify } from '../state/store'
import { addDays } from './engine'
import { getState, initStore as lwInitStore, setPeople, setPostOut, setRole } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { restoreArchivedPerson, runPoArchive, wireLeaveWarSync } from './sync'

/* The pass reads the REAL clock (a PO archives on its live date), so the
   tests speak in days relative to today rather than fixed dates. */
const today = (() => {
  const d = new Date()
  const p2 = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`
})()

const touched: string[] = []
const anAircrewId = () => {
  const id = getState().people.find(p => !p.pers && (PEOPLE as any)[p.id])!.id
  touched.push(id)
  return id
}

beforeEach(() => {
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
  wireLeaveWarSync()
  setRole('admin')
})

afterEach(() => {
  for (const id of touched) delete (PEOPLE as any)[id]?.archived
  touched.length = 0
})

describe('runPoArchive', () => {
  it('archives on the live date itself — a PO dated today fires today, and the schedules are untouched', () => {
    const id = anAircrewId()
    const daysBefore = JSON.stringify(DAYS)
    // setPostOut is a Leave War write, so the wired sync runs the pass at once.
    setPostOut(id, today)
    expect((PEOPLE as any)[id].archived).toBe(true)
    // "their data will still be kept on the previous schedules… nothing will
    // be altered": archiving is a flag on the body, never a schedule write.
    expect(JSON.stringify(DAYS)).toBe(daysBefore)
    // And the person STAYS on the leave war (the keep rule), window intact,
    // so the months before they left still show their history.
    const kept = getState().people.find(p => p.id === id)!
    expect(kept.to).toBe(addDays(today, -1))
  })

  it('a future PO waits for its date', () => {
    const id = anAircrewId()
    setPostOut(id, addDays(today, 7))
    runPoArchive()
    expect((PEOPLE as any)[id].archived).toBeUndefined()
  })

  it('the custom case — archive switch OFF — never archives', () => {
    const id = anAircrewId()
    setPostOut(id, addDays(today, -30), false)
    runPoArchive()
    expect((PEOPLE as any)[id].archived).toBeUndefined()
  })

  it('a posting window that did not come from the PO sheet is left alone', () => {
    // The demo overlay sets from/to directly; consent to archive is only ever
    // the sheet's explicit switch, so an unflagged window must not archive.
    const id = anAircrewId()
    setPeople(getState().people.map(p =>
      p.id === id ? { ...p, to: addDays(today, -10) } : p))
    runPoArchive()
    expect((PEOPLE as any)[id].archived).toBeUndefined()
  })
})

describe('restoreArchivedPerson', () => {
  it('puts the body back on the roster and clears the Leave War posting-out', () => {
    const id = anAircrewId()
    setPostOut(id, addDays(today, -1))
    expect((PEOPLE as any)[id].archived).toBe(true)
    expect(restoreArchivedPerson(id)).toBe(true)
    expect((PEOPLE as any)[id].archived).toBe(false)
    // The PO is gone with it — otherwise the very next pass would re-archive.
    const back = getState().people.find(p => p.id === id)!
    expect(back.to).toBeNull()
    expect(back.poArchive).toBeUndefined()
    // A second pass over the restored world changes nothing.
    runPoArchive()
    raptorNotify()
    expect((PEOPLE as any)[id].archived).toBe(false)
  })

  it('refuses a body that is not archived, and the ALL AVAIL sentinel', () => {
    const id = anAircrewId()
    expect(restoreArchivedPerson(id)).toBe(false)
    expect(restoreArchivedPerson('allavail')).toBe(false)
    expect((PEOPLE as any).allavail.archived).toBe(true)
  })
})
