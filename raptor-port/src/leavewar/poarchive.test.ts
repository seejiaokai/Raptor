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
import { postOut, restoreArchivedPerson, runPoArchive, undoPostOut, wireLeaveWarSync } from './sync'
/* the posting's own route (Matrix postOutOr) */
const POST = (id: string, from: string, archive?: boolean) => postOut(id, from, archive)
import { Whiteboard } from '../storage/whiteboard'
import { wirePersist } from '../state/persist'
import { weekStashSnap, weekDirty } from '../state/store'

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
  for (const id of touched) { delete (PEOPLE as any)[id]?.archived; delete (PEOPLE as any)[id]?.archivedBy }
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

  it('the archive is filed to the whiteboard at once — it is not a history step (8 Sep 26 bug pass)', () => {
    const wb = new Whiteboard()
    wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
    const id = anAircrewId()
    setPostOut(id, today)
    expect(JSON.parse(wb.get('people', 'all')!)[id].archived).toBe(true)
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

/* THE POSTING SHEET'S "UNDO POST OUT" TAKES THE ARCHIVE BACK TOO (the absence-record re-test, W5-F1, 26 Sep 26 —
   found by the orders walker, reproduced by the host). A Post out with "Archive on PO date" on (the default) archives
   him at once when the date has come; the sheet's Undo cleared the date and LEFT the archive — and an archived man
   with no posting dates is dropped from the war, so his row, bids and leave vanished from every month, a reload
   included. Undo means "as he was before the Post out": the Quals page's Restore already does exactly that. */
describe('undoPostOut — the posting sheet’s Undo', () => {
  it('a Post out that archived him is taken back whole: the date AND the archive — he stays on the war', () => {
    const id = anAircrewId()
    setPostOut(id, today)
    expect((PEOPLE as any)[id].archived).toBe(true)
    expect(undoPostOut(id)).toBe(true)
    expect((PEOPLE as any)[id].archived).toBeFalsy()
    raptorNotify()
    const p = getState().people.find(x => x.id === id)
    expect(p, 'his row is still on the war').toBeTruthy()
    expect(p!.to).toBeNull()
  })
  it('a Post out that archived nobody is taken back as before — the date only', () => {
    const id = anAircrewId()
    setPostOut(id, addDays(today, 30))
    expect((PEOPLE as any)[id].archived).toBeFalsy()
    expect(undoPostOut(id)).toBe(true)
    expect(getState().people.find(x => x.id === id)!.to).toBeNull()
  })
})

/* THE ARCHIVE A POST OUT MADE FOLLOWS THE POSTING (Astra's final code read, findings 2 and 4, 26 Sep 26). A Post out
   whose date has come archives him (the switch on); moving that date into the future, or turning the switch off, left
   him archived — off the Quals roster while the posting sheet said he stays, or before his date. And the sheet's Undo
   (W5-F1's fix) read ANY archive on a man with the switch on as the Post out's own, so a man archived by hand on the
   Quals page came back. The archive now carries who made it (`archivedBy: 'po'`, set only by the Post out's pass). */
describe('the archive a Post out made follows the posting (findings 2 and 4)', () => {
  it('moving a Post out that has archived him to a date still to come puts him back until then', () => {
    const id = anAircrewId()
    setPostOut(id, today)
    expect((PEOPLE as any)[id].archived).toBe(true)
    expect(POST(id, addDays(today, 10))).toBe(true)
    expect((PEOPLE as any)[id].archived).toBeFalsy()
    expect(getState().people.find(p => p.id === id)!.to).toBe(addDays(today, 9))
  })
  it('turning "Archive on PO date" off puts him back on the roster', () => {
    const id = anAircrewId()
    setPostOut(id, today)
    expect((PEOPLE as any)[id].archived).toBe(true)
    expect(POST(id, today, false)).toBe(true)
    expect((PEOPLE as any)[id].archived).toBeFalsy()
  })
  it('moving it to another date that has also come keeps the archive', () => {
    const id = anAircrewId()
    setPostOut(id, addDays(today, -3))
    expect((PEOPLE as any)[id].archived).toBe(true)
    expect(POST(id, addDays(today, -1))).toBe(true)
    expect((PEOPLE as any)[id].archived).toBe(true)
  })
  it('the posting sheet’s Undo keeps an archive made by hand on the Quals page', () => {
    const id = anAircrewId()
    setPostOut(id, addDays(today, 10))
    expect((PEOPLE as any)[id].archived).toBeFalsy()
    ;(PEOPLE as any)[id].archived = true            // the Quals page's ✕ (QualsPage.tsx), by hand
    expect(undoPostOut(id)).toBe(true)
    expect((PEOPLE as any)[id].archived).toBe(true)
    expect(getState().people.find(p => p.id === id)?.to ?? null).toBeNull()
  })
})
