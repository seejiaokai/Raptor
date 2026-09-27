// D320 (27 Sep 26, "A") — the Leave War keeps EVERY stint a man has in the squadron, and D323 ("Ok what u
// recommend") — Archive on Admin → Users is "posted out from today", his past kept. The war's STORE half: the posting
// record carries the closed earlier stints (`past`), Restore opens a new stint (`openStint`), Archive closes the
// current one (`closeStintOnArchive`), and nothing ever stores a stint that closes before it opens. [ONE-DOOR] plan §C
// and its round-1 review log (Fable F2, F4, F5 · Astra 1, 3). Its own file, like postout-persist.test.ts: a stored
// backend reused across two initStore calls stands in for a reload.

import { beforeEach, describe, expect, it } from 'vitest'
import { PEOPLE } from '../engine/people'
import { initStore as raptorInitStore } from '../state/store'
import {
  closeStintOnArchive, forgetPersonFrom, getState, initStore as lwInitStore, openStint, postingProblem, setPeople,
  setPostIn, setPostOut, setRole,
} from './state/store'
import { memoryBackend, type StorageBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { inSquadron, postingSheetFor } from './engine/people'

function reboot(be: StorageBackend) {
  lwInitStore(be)
  setPeople(projectPeople())
  setRole('admin')
}
const anAircrewId = () => getState().people.find(p => !p.pers && (PEOPLE as any)[p.id])!.id
const him = (id: string) => getState().people.find(p => p.id === id)!

beforeEach(() => { raptorInitStore() })

describe('D320 — Restore opens a new stint (openStint)', () => {
  it('D320: a closed stint goes to `past`, the new one runs from the post-in date, and both survive a reload', () => {
    const be = memoryBackend(); reboot(be)
    const id = anAircrewId()
    expect(setPostOut(id, '2026-06-15', 'overseas')).toBe(true)      // here until 14 Jun
    expect(openStint(id, '2026-09-01')).toBe(true)
    let p = him(id)
    expect(p.past).toEqual([{ from: null, to: '2026-06-14' }])
    expect(p.from).toBe('2026-09-01')
    expect(p.to).toBeNull()
    expect(p.poOutcome).toBeUndefined()
    expect(p.poDone).toBeUndefined()
    reboot(be)
    p = him(id)
    expect(p.past).toEqual([{ from: null, to: '2026-06-14' }])
    expect(p.from).toBe('2026-09-01')
    expect(inSquadron(p, '2026-04-06')).toBe(true)
    expect(inSquadron(p, '2026-07-01')).toBe(false)
    expect(inSquadron(p, '2026-09-01')).toBe(true)
  })

  it('D320 / Fable F5: a post-in on the day after the stint closed REOPENS it — no boundary, no past stint', () => {
    const be = memoryBackend(); reboot(be)
    const id = anAircrewId()
    setPostOut(id, '2026-06-15', 'overseas')
    expect(openStint(id, '2026-06-15')).toBe(true)
    const p = him(id)
    expect(p.past ?? []).toEqual([])
    expect(p.to).toBeNull()
    expect(p.from).toBeNull()
  })

  it('D320: a post-in on or before the day his stint closed is refused, and says why', () => {
    const be = memoryBackend(); reboot(be)
    const id = anAircrewId()
    setPostOut(id, '2026-06-15', 'overseas')
    expect(openStint(id, '2026-06-14')).toBe(false)
    expect(postingProblem(id, 'restore', '2026-06-14')).toMatch(/posted out from 15 Jun 26/i)
    expect(him(id).to).toBe('2026-06-14')
  })

  it('D320: an open current stint (never posted out) takes the post-in date as its start', () => {
    const be = memoryBackend(); reboot(be)
    const id = anAircrewId()
    expect(openStint(id, '2026-10-01')).toBe(true)
    expect(him(id).from).toBe('2026-10-01')
    expect(him(id).past ?? []).toEqual([])
  })
})

describe('D323 — Archive closes the current stint (closeStintOnArchive)', () => {
  it('D323: an open stint closes the day before today, as a posting that has run (overseas, done)', () => {
    const be = memoryBackend(); reboot(be)
    const id = anAircrewId()
    closeStintOnArchive(id, '2026-09-27')
    const p = him(id)
    expect(p.to).toBe('2026-09-26')
    expect(p.poOutcome).toBe('overseas')
    expect(p.poDone).toBe('2026-09-27')                                  // Fable F9: the stint's own posting date
  })

  it('D323: a stint a posting already closed keeps its date', () => {
    const be = memoryBackend(); reboot(be)
    const id = anAircrewId()
    setPostOut(id, '2026-06-15', 'none')
    closeStintOnArchive(id, '2026-09-27')
    const p = him(id)
    expect(p.to).toBe('2026-06-14')
    expect(p.poDone).toBe('2026-06-15')
  })

  it('D323: a posting still to come is replaced by today\'s', () => {
    const be = memoryBackend(); reboot(be)
    const id = anAircrewId()
    setPostOut(id, '2026-10-14', 'delete')
    closeStintOnArchive(id, '2026-09-27')
    const p = him(id)
    expect(p.to).toBe('2026-09-26')
    expect(p.poOutcome).toBe('overseas')
  })

  it('Fable F4 / Astra 3: a stint not yet begun is DROPPED — the last past stint is current again, nothing backwards stored', () => {
    const be = memoryBackend(); reboot(be)
    const id = anAircrewId()
    setPostOut(id, '2026-06-15', 'overseas')
    openStint(id, '2026-10-01')                                          // back from 1 Oct — still to come
    closeStintOnArchive(id, '2026-09-27')
    let p = him(id)
    expect(p.past ?? []).toEqual([])
    expect(p.from).toBeNull()
    expect(p.to).toBe('2026-06-14')
    reboot(be)
    p = him(id)
    expect(p.to).toBe('2026-06-14')
    for (const s of [...(p.past ?? []), { from: p.from, to: p.to }]) if (s.from && s.to) expect(s.from <= s.to).toBe(true)
  })

  it('Fable F4: Archive → Restore today → Archive again leaves no empty stint', () => {
    const be = memoryBackend(); reboot(be)
    const id = anAircrewId()
    closeStintOnArchive(id, '2026-09-27')
    openStint(id, '2026-09-27')                                          // reopens (F5)
    closeStintOnArchive(id, '2026-09-27')
    const p = him(id)
    expect(p.past ?? []).toEqual([])
    expect(p.to).toBe('2026-09-26')
  })
})

describe('D320 — past stints are read-only on the war (round 1, Fable F2 / Astra 1)', () => {
  const backFromJune = (id: string) => { setPostOut(id, '2026-06-15', 'overseas'); openStint(id, '2026-09-01') }

  it('a post-out aimed before his current post-in (into a past stint) is refused with the reason', () => {
    const be = memoryBackend(); reboot(be)
    const id = anAircrewId()
    backFromJune(id)
    expect(setPostOut(id, '2026-06-12', 'overseas')).toBe(false)
    expect(postingProblem(id, 'out', '2026-06-12')).toMatch(/earlier stint's dates can't be moved here/)
    expect(him(id).past).toEqual([{ from: null, to: '2026-06-14' }])
  })

  it('a post-in on or before his last past stint\'s end is refused; clearing it is refused while he has one', () => {
    const be = memoryBackend(); reboot(be)
    const id = anAircrewId()
    backFromJune(id)
    expect(setPostIn(id, '2026-06-10')).toBe(false)
    expect(postingProblem(id, 'in', '2026-06-10')).toMatch(/came back|posted out/i)
    expect(setPostIn(id, null)).toBe(false)
    expect(setPostIn(id, '2026-08-20')).toBe(true)                      // his current post-in may still move
    expect(him(id).from).toBe('2026-08-20')
  })

  it('pinned unchanged: a man with one stint posts in and out exactly as before', () => {
    const be = memoryBackend(); reboot(be)
    const id = anAircrewId()
    expect(setPostIn(id, '2026-02-01')).toBe(true)
    expect(setPostOut(id, '2026-01-15', 'none')).toBe(false)            // before the post-in, as before
    expect(postingProblem(id, 'out', '2026-01-15')).toMatch(/^Posted in on 1 Feb 26/)
    expect(setPostIn(id, null)).toBe(true)
  })
})

describe('D320 — the stored record: tolerant, never backwards', () => {
  it('a record whose past list is malformed loads with the list dropped (D56 — tolerant)', () => {
    const be = memoryBackend(); reboot(be)
    const id = anAircrewId()
    setPostOut(id, '2026-06-15', 'overseas'); openStint(id, '2026-09-01')
    const raw = JSON.parse(be.read('postouts')!)
    raw[id].past = [{ from: '2026-05-01', to: '2026-04-01' }]           // backwards
    be.write('postouts', JSON.stringify(raw))
    reboot(be)
    expect(him(id).past ?? []).toEqual([])
    expect(him(id).from).toBe('2026-09-01')
  })

  it('a delete trims past stints to the cutoff and never leaves a current stint opening after it', () => {
    const be = memoryBackend(); reboot(be)
    const id = anAircrewId()
    setPostOut(id, '2026-06-15', 'overseas'); openStint(id, '2026-10-01')
    forgetPersonFrom(id, '2026-09-27')
    const p = him(id)
    expect(p.gone).toBe(true)
    expect(p.to).toBe('2026-06-14')
    expect(p.past ?? []).toEqual([])
  })
})

/* THE BREAK TESTS' THREE GAPS (bug-check order §8.4, 27 Sep 26): two wires no test watched — which sheet a gap day opens,
   and the grid's row for a man seen only through an earlier stint. */
describe('D320 — which posting sheet a day opens (postingSheetFor)', () => {
  it('a day in the gap between two stints opens the Post in sheet of the stint he came back for; after the last, Post out', () => {
    reboot(memoryBackend())
    const id = anAircrewId()
    expect(setPostOut(id, '2026-06-15')).toBe(true)                        // his first stint closes 14 Jun
    expect(openStint(id, '2026-09-01')).toBe(true)                          // back from 1 Sep
    const p = him(id)
    expect(postingSheetFor(p, '2026-07-10'), 'a gap day').toBe('pi')
    expect(postingSheetFor(p, '2026-06-10'), 'inside the earlier stint').toBeUndefined()
    expect(postingSheetFor(p, '2026-09-10'), 'inside the current stint').toBeUndefined()
    expect(setPostOut(id, '2026-11-01')).toBe(true)
    expect(postingSheetFor(him(id), '2026-11-10'), 'after the current stint').toBe('po')
  })
})
