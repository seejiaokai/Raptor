// The two things Leave War owns about a person survive a reboot (8 Sep 26
// bug pass): the posting-out window an admin set through setPostOut, and an
// identity override made through setPerson. Both used to live only on
// `state.people`, which is never persisted (it is a projection of Raptor's
// roster), so a PO date vanished on the next reload and the archived body
// came back on the roster. They now ride `postouts` / `personedits`, laid
// back onto the projection by setPeople.
//
// Its own file, like poarchive.test.ts: a stored backend is reused across
// two initStore calls to stand in for a reload.

import { beforeEach, describe, expect, it } from 'vitest'
import { PEOPLE } from '../engine/people'
import { initStore as raptorInitStore } from '../state/store'
import { getState, initStore as lwInitStore, setPeople, setPerson, setPostOut, setRole } from './state/store'
import { memoryBackend, type StorageBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'

/* what main.tsx does on every boot: read the store, install the projection */
function reboot(be: StorageBackend) {
  lwInitStore(be)
  setPeople(projectPeople())
  setRole('admin')
}
const anAircrewId = () => getState().people.find(p => !p.pers && (PEOPLE as any)[p.id])!.id

beforeEach(() => { raptorInitStore() })

describe('setPostOut persists the window', () => {
  it('a PO date is still on the person after a reboot; clearing it clears the record', () => {
    const be = memoryBackend()
    reboot(be)
    const id = anAircrewId()
    expect(setPostOut(id, '2027-03-01', false)).toBe(true)
    expect(JSON.parse(be.read('postouts')!)[id].to).toBe('2027-02-28')

    reboot(be)
    const p = getState().people.find(x => x.id === id)!
    expect(p.to).toBe('2027-02-28')
    expect(p.poArchive).toBe(false)

    setPostOut(id, null)
    expect(be.read('postouts')).toBe('{}')
    reboot(be)
    expect(getState().people.find(x => x.id === id)!.to).toBeNull()
  })

  it('a person the projection no longer has, but who has a window, is kept from the frozen copy — the keep rule survives a reboot', () => {
    const be = memoryBackend()
    reboot(be)
    const id = anAircrewId()
    setPostOut(id, '2027-03-01', false)
    ;(PEOPLE as any)[id].archived = true   // as the auto-archive pass does once the date arrives
    try {
      expect(projectPeople().some(x => x.id === id)).toBe(false)
      reboot(be)
      const kept = getState().people.find(x => x.id === id)
      expect(kept).toBeDefined()
      expect(kept!.to).toBe('2027-02-28')
    } finally {
      delete (PEOPLE as any)[id].archived
    }
  })
})

describe('setPerson persists the override', () => {
  it('an SXO flip made here is still on the person after a reboot', () => {
    const be = memoryBackend()
    reboot(be)
    const id = getState().people.find(p => p.seat === 'pilot' && !p.sxo && (PEOPLE as any)[p.id])!.id
    expect(setPerson(id, { sxo: true })).toBe(true)
    reboot(be)
    expect(getState().people.find(x => x.id === id)!.sxo).toBe(true)
  })
})

describe('untrusted storage', () => {
  it('garbage in either record reads as empty, and a window without its date is dropped', () => {
    const be = memoryBackend()
    be.write('postouts', '[1')
    be.write('personedits', JSON.stringify({ x: { seat: 'bogus', sxo: 'yes' }, y: { band: 'ops' } }))
    reboot(be)
    expect(getState().postOuts).toEqual({})
    expect(getState().personEdits).toEqual({ y: { band: 'ops' } })
    be.write('postouts', JSON.stringify({ a: { id: 'a', callsign: 'A', to: null }, b: { id: 'zz', callsign: 'B', to: '2027-01-01' } }))
    reboot(be)
    expect(getState().postOuts).toEqual({})
  })
})
