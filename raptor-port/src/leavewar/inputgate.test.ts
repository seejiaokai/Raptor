// The absence rules at the inputs door ([ARCH-STACK] step 4 — clash check B7,
// H1, H2; design §25, §26; owner answers A–D). Driven through the REAL Raptor
// inputs door (writeInputs) and the real global undo, over both wired stores.
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { initStore as raptorInitStore, writeInputs } from '../state/store'
import { setMe, setSession } from '../state/auth'
import { projectPeople } from './state/raptorRoster'
import {
  ackReplacement, advanceStage, getState, setBidState, initStore as lwInitStore, lwEditLists, lwHistInit, rawState, setCell, setPeople, setRole, setViewer,
} from './state/store'
import { memoryBackend } from './state/storage'
import { wireLeaveWarSync } from './sync'
import { globalRedo, globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'

const ISNAP = JSON.stringify(INPUTS)
const toast = HOOKS.toast
let said: string[] = []

beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  setSession({ user: 'ad', role: 'admin' })
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  said = []
  HOOKS.toast = (m: any) => { said.push(String(m)) }
})
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); setSession(null); setMe('bane') })

let n = 0
/** File through the real inputs door, as the Inputs page does. */
function file(person: string, type: string, date: string, extra: Record<string, any> = {}): boolean {
  const row = { iid: `g${++n}`, person, type, date, yr: 2026, allday: true, remarks: '', mod: '2026-02-01', ...extra }
  if (row.allday === false) delete (row as any).allday
  return writeInputs(() => { INPUTS.unshift(row) })
}
const rowsOf = (person: string, type?: string) => INPUTS.filter((r: any) => r.person === person && (!type || r.type === type))
const codeAt = (p: string, d: string) => getState().grid[p]?.[d]
const recsAt = (p: string, d: string) => rawState().wars[0]!.recs[p]?.[d] ?? []

describe('the invariant — no overlapping leave, no leave over a medical (B7, §25)', () => {
  it('refuses a second leave on the same time and names the first', () => {
    expect(file('ammo', 'LL', 'Feb 10')).toBe(true)
    const before = JSON.stringify(INPUTS)
    expect(file('ammo', 'OL', 'Feb 10')).toBe(false)
    expect(JSON.stringify(INPUTS)).toBe(before)
    expect(said.some(m => m.includes('already has LL on 10 Feb'))).toBe(true)
  })

  it('allows two leaves in one morning at times that do not overlap (owner, 20 Sep 26)', () => {
    expect(file('ammo', 'LL', 'Feb 10', { allday: false, s: 8 * 60, e: 10 * 60 })).toBe(true)
    expect(file('ammo', 'OL', 'Feb 10', { allday: false, s: 10 * 60 + 30, e: 11 * 60 + 30 })).toBe(true)
    expect(rowsOf('ammo').filter((r: any) => r.date === 'Feb 10')).toHaveLength(2)
  })

  it('refuses leave over a medical, whole', () => {
    expect(file('ammo', 'ATT C', 'Feb 11')).toBe(true)
    expect(file('ammo', 'LL', 'Feb 10', { endDate: 'Feb 12' })).toBe(false)
    expect(rowsOf('ammo', 'LL')).toHaveLength(0)
    expect(said.some(m => m.includes("leave can't go over a medical"))).toBe(true)
  })

  it('a course or overseas duty is no bar to leave (owner Q8)', () => {
    expect(file('ammo', 'CSE', 'Feb 10', { endDate: 'Feb 14' })).toBe(true)
    expect(file('ammo', 'LL', 'Feb 12')).toBe(true)
    expect(codeAt('ammo', '2026-02-12')).toBe('LL')
  })
})

describe('leave over recorded work is refused only when the times overlap (§26.3, B4)', () => {
  it('refuses leave on a day credited as worked with no times (whole day, owner Q7)', () => {
    setRole('admin')
    expect(setCell('ammo', '2026-02-14', 'FO')).toBe(true)
    expect(file('ammo', 'LL', 'Feb 14')).toBe(false)
    expect(said.some(m => m.includes('recorded as working on 14 Feb'))).toBe(true)
  })


  it('approving a bid on a day later credited as worked skips that day (owner Q5, §26.3)', () => {
    setRole('admin')
    expect(setCell('ammo', '2026-02-14', 'LL')).toBe(true)
    // the work was credited after the bid (the OIL pass keeps both)
    lwEditLists([{ personId: 'ammo', date: '2026-02-14', drop: [], add: [{ id: 'c-late', kind: 'credit', code: 'FO', oil: 'manual' } as any] }])
    advanceStage()
    setBidState('ammo', '2026-02-14', 'approved')
    expect(rowsOf('ammo', 'LL')).toHaveLength(0)
    expect(recsAt('ammo', '2026-02-14').some(r => r.kind === 'request')).toBe(true)
  })
})

describe('sick cuts leave in half-day steps (H2, §26.1)', () => {
  it('LL 14–18 Jul, medical 16–17 → LL 14–15 + 18; undo → LL 14–18', () => {
    expect(file('rocky', 'LL', 'Jul 14', { endDate: 'Jul 18' })).toBe(true)
    expect(file('rocky', 'ATT C', 'Jul 16', { endDate: 'Jul 17' })).toBe(true)
    const ll = rowsOf('rocky', 'LL').map((r: any) => `${r.date}-${r.endDate ?? r.date}`).sort()
    expect(ll).toEqual(['Jul 14-Jul 15', 'Jul 18-Jul 18'])
    expect(codeAt('rocky', '2026-07-16')).toBe('ATTC')
    expect(codeAt('rocky', '2026-07-18')).toBe('LL')
    expect(said.some(m => m.includes('is cut for the ATT C'))).toBe(true)
    expect(globalUndo().ok).toBe(true)
    expect(rowsOf('rocky', 'LL').map((r: any) => `${r.date}-${r.endDate}`)).toEqual(['Jul 14-Jul 18'])
    expect(rowsOf('rocky', 'ATT C')).toHaveLength(0)
  })

  it('a morning medical turns a full leave day into the afternoon', () => {
    expect(file('rocky', 'LL', 'Jul 14')).toBe(true)
    expect(file('rocky', 'ATT C', 'Jul 14', { allday: false, half: 'am', s: 0, e: 720 })).toBe(true)
    const ll = rowsOf('rocky', 'LL')
    expect(ll).toHaveLength(1)
    expect(ll[0].half).toBe('pm')
    expect(ll[0].allday).toBe(false)
  })

  it('ATT B leaves the leave alone', () => {
    expect(file('rocky', 'LL', 'Jul 14')).toBe(true)
    expect(file('rocky', 'ATT B', 'Jul 14')).toBe(true)
    expect(rowsOf('rocky', 'LL')[0].allday).toBe(true)
  })
})

describe('a clashing input replaces an undecided bid (owner rule, H1, answer B, B6)', () => {
  function bid(p: string, d: string, code = 'LL') {
    setRole('admin')
    expect(setCell(p, d, code)).toBe(true)
  }

  it('an admin filing over a pending bid replaces it and leaves a notice until "OK, seen"', () => {
    bid('ammo', '2026-02-10')
    expect(file('ammo', 'ATT C', 'Feb 10')).toBe(true)
    const list = recsAt('ammo', '2026-02-10')
    expect(list.some(r => r.kind === 'request')).toBe(false)
    const notice = list.find(r => r.kind === 'notice') as any
    expect(notice).toMatchObject({ code: 'LL', was: 'pending', byType: 'ATT C', byWho: 'an admin' })
    expect(getState().wars[0]!.views.ammo['2026-02-10']!.mark).toBe('!')
    expect(said.some(m => m.includes('bid on 10 Feb'))).toBe(true)
    // OK, seen — the person or an admin
    setViewer('ammo')
    expect(ackReplacement('ammo', notice.id)).toBe(1)
    expect(recsAt('ammo', '2026-02-10').some(r => r.kind === 'notice')).toBe(false)
  })

  it('undoing the filing brings the bid back and takes the notice away', () => {
    bid('ammo', '2026-02-10')
    expect(file('ammo', 'LL', 'Feb 10')).toBe(true)
    expect(globalUndo().ok).toBe(true)
    const list = recsAt('ammo', '2026-02-10')
    expect(list.filter(r => r.kind === 'request')).toHaveLength(1)
    expect(list.some(r => r.kind === 'notice')).toBe(false)
  })

  it('the bid\'s own person filing over it gets a message and no notice', () => {
    bid('ammo', '2026-02-10')
    setSession({ user: 'us', role: 'main' }); setMe('ammo')
    expect(file('ammo', 'OL', 'Feb 10')).toBe(true)
    expect(recsAt('ammo', '2026-02-10')).toEqual([])
    expect(said.some(m => m.includes('your LL bid on 10 Feb'))).toBe(true)
  })

  it('a morning filing removes only the morning of a full-day bid; the afternoon keeps its state', () => {
    bid('ammo', '2026-02-10')
    advanceStage()
    const id = (recsAt('ammo', '2026-02-10')[0] as any).id
    expect(file('ammo', 'OL', 'Feb 10', { allday: false, half: 'am', s: 0, e: 720 })).toBe(true)
    const req = recsAt('ammo', '2026-02-10').find(r => r.kind === 'request') as any
    expect(req).toMatchObject({ id, code: 'LL*', state: 'pending' })
  })

  it('a course, overseas duty or ATT B leaves the bid alone', () => {
    bid('ammo', '2026-02-10')
    expect(file('ammo', 'CSE', 'Feb 10')).toBe(true)
    expect(file('ammo', 'ATT B', 'Feb 10')).toBe(true)
    expect(recsAt('ammo', '2026-02-10').filter(r => r.kind === 'request')).toHaveLength(1)
  })

  it('a refused bid is history and is never replaced', () => {
    bid('ammo', '2026-02-10')
    advanceStage()
    expect(file('ammo', 'LL', 'Feb 11')).toBe(true)   // unrelated day first
    setBidState('ammo', '2026-02-10', 'refused')
    expect(file('ammo', 'OL', 'Feb 10')).toBe(true)
    expect(recsAt('ammo', '2026-02-10').filter(r => r.kind === 'request')).toHaveLength(1)
  })
})

describe('undo and redo obey the same rules (B7)', () => {
  it('a redo that would put two leaves on the same time is refused, naming the blocker', () => {
    expect(file('ammo', 'LL', 'Feb 10')).toBe(true)
    expect(globalUndo().ok).toBe(true)
    // the redo tail survives a change on another person's day? No — any new
    // edit drops it, so put the blocker in WITHOUT a timeline entry
    INPUTS.unshift({ iid: 'blocker', person: 'ammo', type: 'OL', date: 'Feb 10', yr: 2026, allday: true, remarks: '', mod: '2026-02-01' })
    const r = globalRedo()
    expect(r.ok).toBe(false)
    expect(said.some(m => m.includes('already has OL on 10 Feb'))).toBe(true)
    expect(rowsOf('ammo', 'LL')).toHaveLength(0)
  })
})
