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
import { getState, initStore as lwInitStore, setPeople, setPerson, setPostIn, setPostOut, setRole } from './state/store'
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

/* THE DEMO OVERLAY'S OWN WINDOW — the walk's F1 and F2, 22 Sep 26, which were
   reported as two separate defects and are one.
   `installDemoWorld` puts the demo's posting-out date straight onto the
   projected person and hands the list to `setPeople`. `setPeople` LAID the
   stored record back onto the projection but never TOOK one from it, so the one
   window the app writes at boot was the one window it never saved. On the next
   reload the man was back in the squadron, and everything that asks who is
   available answered differently from the day before — with nobody having
   touched anything.
   On an issued day that is money: the men behind an ALL / ALL AVAIL puck are
   frozen when the day is published, so the live copy gained a man the issued
   copy did not have. The day then read "1 pending" and cleared its four
   signatures for an amendment nobody made (F1), and the count beside the puck
   said one more than the Leave War would ever pay (F2).
   This is why the capture lives in `setPeople` rather than in the demo overlay:
   it is the one body that owns laying the record on, so it is the one body that
   can guarantee a window never exists on a person without a record behind it. */
describe('a posting window that arrives WITH the projection is recorded too', () => {
  it('survives a reboot — the demo overlay is not a special case', () => {
    const be = memoryBackend()
    reboot(be)
    const id = anAircrewId()
    /* exactly what installDemoWorld does: the date onto the person, then install */
    const people = projectPeople().map(p => (p.id === id ? { ...p, to: '2026-01-13' } : p))
    setPeople(people)
    expect(JSON.parse(be.read('postouts')!)[id]?.to, 'the window is written down where it lives').toBe('2026-01-13')
    reboot(be)
    expect(getState().people.find(x => x.id === id)!.to, 'and it is still there next time').toBe('2026-01-13')
  })

  it('a later projection with NO window does not resurrect a cleared one', () => {
    const be = memoryBackend()
    reboot(be)
    const id = anAircrewId()
    setPeople(projectPeople().map(p => (p.id === id ? { ...p, to: '2026-01-13' } : p)))
    setPostOut(id, null)                                   // the admin takes it off
    setPeople(projectPeople())                             // the next re-projection
    expect(be.read('postouts'), 'a cleared window stays cleared').toBe('{}')
    reboot(be)
    expect(getState().people.find(x => x.id === id)!.to).toBeNull()
  })

  it('THE CONTROL: an ordinary projection with no windows writes no record', () => {
    const be = memoryBackend()
    reboot(be)
    const before = be.read('postouts')
    setPeople(projectPeople())
    expect(be.read('postouts'), 'nothing to record, nothing written').toBe(before)
  })

  it('the real boot path keeps the demo man out of the squadron after a reload', async () => {
    const { installDemoWorld } = await import('./state/demoworld')
    const be = memoryBackend()
    lwInitStore(be)
    installDemoWorld(false)
    setRole('admin')
    const gone = getState().people.filter(p => p.to)
    expect(gone.length, 'the demo posts exactly one man out').toBeGreaterThan(0)
    const id = gone[0].id, to = gone[0].to
    reboot(be)
    expect(getState().people.find(x => x.id === id)!.to, 'and he stays posted out').toBe(to)
  })
})

/* AND THE CONSEQUENCE, PINNED WHERE IT BITES. The two walk findings were not
   about a stored field: they were about a puck standing for a different set of
   men today than it stood for yesterday. `availableFor` is the one body that
   answers who is behind an ALL / ALL AVAIL puck, and it is what the frozen
   membership is written from, so this is the assertion that would have gone red
   on the night: the same question, the same answer, across a reload. */
describe('the crowd behind a placeholder does not change across a reload', () => {
  it('a man posted out by the demo is out of it before AND after', async () => {
    const { availableFor } = await import('./sync')
    const { installDemoWorld } = await import('./state/demoworld')
    const be = memoryBackend()
    lwInitStore(be)
    installDemoWorld(false)
    setRole('admin')
    const gone = getState().people.find(p => p.to)!
    const after = (gone.to as string) + ''
    /* a date the man's own window has already closed on */
    const iso = after < '2026-07-19' ? '2026-07-19' : '2099-01-01'
    const before = availableFor(iso, [8 * 60, 15 * 60])
    expect(before, 'he left the squadron before this date').not.toContain(gone.id)
    reboot(be)
    expect(availableFor(iso, [8 * 60, 15 * 60]), 'and a reload does not bring him back')
      .not.toContain(gone.id)
    expect(availableFor(iso, [8 * 60, 15 * 60]).length,
      'the puck stands for exactly the same men it stood for').toBe(before.length)
  })
})

/* AND THE OTHER END OF THE SAME WINDOW — found 22 Sep 26 by re-reading the
   capture above, not by a walk or a review.
   `setPostIn` (owner, 20 Sep 26 — "we need a post in button just like post out.
   Because those dates are official dates") records its window through the same
   `windowRecord` as `setPostOut`, and the write is correct: the record reaches
   storage with `from` set and `to` null. The BOOT READER then threw it away,
   because it insisted `to` be a string — so a man's official joining date was
   lost on every reload, exactly like the posting-out window above, and in the
   same file.
   It is not an OIL defect and it is PRE-EXISTING (the reader predates the
   post-in button and was never widened for it). It is fixed here because it is
   the same record, the same body and the same failure — and because a joining
   date decides who is in the squadron on a date, which reaches the manning
   counts, ALL AVAIL and therefore what a placeholder pays. */
describe('a post-IN date survives a reload too', () => {
  it('the joining date is still on the person after a reboot', () => {
    const be = memoryBackend()
    reboot(be)
    const id = anAircrewId()
    expect(setPostIn(id, '2026-03-01')).toBe(true)
    reboot(be)
    expect(getState().people.find(x => x.id === id)!.from, 'his official joining date').toBe('2026-03-01')
  })

  it('clearing it clears the record, and the person comes back with no window', () => {
    const be = memoryBackend()
    reboot(be)
    const id = anAircrewId()
    setPostIn(id, '2026-03-01')
    setPostIn(id, null)
    expect(be.read('postouts'), 'both ends clear, so no record at all').toBe('{}')
    reboot(be)
    expect(getState().people.find(x => x.id === id)!.from).toBeNull()
  })

  it('THE CONTROL: both ends together still survive, as they always did', () => {
    const be = memoryBackend()
    reboot(be)
    const id = anAircrewId()
    setPostIn(id, '2026-03-01')
    setPostOut(id, '2026-09-01', false)
    reboot(be)
    const p = getState().people.find(x => x.id === id)!
    expect(p.from).toBe('2026-03-01')
    expect(p.to).toBe('2026-08-31')
  })

  it('THE CONTROL: untrusted storage is no looser than before', () => {
    const be = memoryBackend()
    /* neither end a date, a mismatched id, a missing callsign — all still dropped */
    be.write('postouts', JSON.stringify({
      a: { id: 'a', callsign: 'A', from: null, to: null },
      b: { id: 'zz', callsign: 'B', from: '2027-01-01', to: null },
      c: { id: 'c', from: '2027-01-01', to: null },
      d: { id: 'd', callsign: 'D', from: 7, to: null },
    }))
    reboot(be)
    expect(getState().postOuts).toEqual({})
  })
})

/* AND THE KEEP RULE MEANS WHAT ITS OWN COMMENT SAYS. `setPeople` keeps a person
   the projection has LOST if the store holds a window for them, so a posted-out
   man's leave history still shows in the months before he left — and its comment
   is explicit about the other case: "A body archived WITHOUT a posting-out
   window still leaves at once — that ✕ means 'should never have been here'."
   The test was membership of the record, not the presence of a LEAVING date, so
   a man with only a JOINING date who was then archived came back anyway. It
   mattered for a session before (`windowRecord` stores either end); it would
   have mattered for good once the reader above stopped discarding those
   records, which is how it was found. */
describe('the keep rule tests for a LEAVING date, not for any window', () => {
  const archived = (id: string, fn: () => void) => {
    ;(PEOPLE as any)[id].archived = true
    try { fn() } finally { delete (PEOPLE as any)[id].archived }
  }

  it('a man archived with only a JOINING date does not come back', () => {
    const be = memoryBackend()
    reboot(be)
    const id = anAircrewId()
    setPostIn(id, '2026-03-01')
    archived(id, () => {
      expect(projectPeople().some(x => x.id === id), 'the projection has dropped him').toBe(false)
      reboot(be)
      expect(getState().people.find(x => x.id === id),
        'the ✕ means he should never have been here').toBeUndefined()
    })
  })

  it('THE CONTROL: a man archived WITH a leaving date is still kept, as he must be', () => {
    const be = memoryBackend()
    reboot(be)
    const id = anAircrewId()
    setPostOut(id, '2027-03-01', false)
    archived(id, () => {
      reboot(be)
      const kept = getState().people.find(x => x.id === id)
      expect(kept, 'his leave history is what the months before he left still show').toBeDefined()
      expect(kept!.to).toBe('2027-02-28')
    })
  })
})
