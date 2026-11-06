/* A REFUSED WAR COMMAND KEEPS THE WAR'S ROLE AND VIEWER ([LW-NIGHT1025-OLDER] (f), the night of 25 Oct 26's last narrow read,
   its reading 1 — `docs/handpass/parts/lw-night/read-fixes-2.md`). The role and the viewer are not records: they are the
   session's, written by `setRole` (sign-in, the admin's member view — D292) and `setViewer` (the "View as" mirror), and neither
   moves the war's saved baseline. A refused command rolls the war back to that baseline, so it put back whatever role and viewer
   the last successful write had seen: an admin who tapped into the member view and then made a change the commit refused saw an
   admin's controls under a member badge. A rollback restores records only; the role and viewer in force stay. Red first. */
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { setMe, setSession } from '../state/auth'
import { initStore as raptorInitStore } from '../state/store'
import { switchRoleInForce } from '../state/perms'
import { projectPeople } from './state/raptorRoster'
import { closeDates, getState, initStore, lwStore, recordsAt, setBidState, setCell, setPeople, setRequestWords, setRole, setViewer } from './state/store'
import { memoryBackend } from './state/storage'
import { wireLeaveWarSync } from './sync'

const ISNAP = JSON.stringify(INPUTS)
const P = 'dusk'
const D1 = '2026-02-10'

beforeEach(() => {
  try { localStorage.clear() } catch { /* none */ }
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  setSession({ user: 'ad', role: 'admin', name: 'ad', acct: 'admin' })   // a real admin account: the member view is his (D292)
  raptorInitStore()
  initStore(memoryBackend())
  setPeople(projectPeople())
  wireLeaveWarSync()
  setRole('admin')
})
afterEach(() => { setSession(null); INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i)) })

describe('a rollback restores the war\'s records, never the role or viewer in force ((f))', () => {
  it('the store\'s restore keeps the role and viewer set since the snapshot was taken', () => {
    expect(setCell(P, D1, 'OL')).toBe(true)   // a write: the saved baseline is the admin's
    const snap = lwStore.capture()
    expect((snap as any).role).toBe('admin')
    setRole('member'); setViewer(P)
    lwStore.restore(snap)
    expect(getState().role).toBe('member')
    expect(getState().viewer).toBe(P)
  })

  it('an admin in the member view whose change is refused stays in the member view', () => {
    /* a refused bid on a day closed for a member: his words on it are refused by the commit (perms.ts — a member's write
       on a closed day), so the whole command rolls back. The writes before are the admin's, so the war's saved baseline
       carries the admin's role */
    expect(setCell(P, D1, 'OL')).toBe(true)
    setBidState(P, D1, 'refused')
    closeDates(D1, D1)
    /* the admin taps into the member view (state/store.ts switchRoleView: the role in force, then the war's role) */
    setMe(P)
    expect(switchRoleInForce('main')).toBe(true)
    setRole('member'); setViewer(P)
    const rec = recordsAt(P, D1).find(r => r.kind === 'request') as any
    expect(setRequestWords(P, D1, rec.id, { remarks: 'Back Monday' }), 'the commit refuses it').toBe(false)
    expect((recordsAt(P, D1).find(r => r.kind === 'request') as any).remarks, 'the bid as it was').toBe(rec.remarks)
    expect(getState().role, 'still the member view').toBe('member')
    expect(getState().viewer).toBe(P)
  })
})
