/* [LW-M1-READ-LEFTOVERS] (1) (M3 §4): "a member's shared input over another man's pending bid" — feared to write a
   notice on the other man's war row inside the member's command, which the commit refuses ("another person's war
   row"). It cannot arise: only a leave or a medical replaces a pending bid (inputgate.ts replaceBids), and a member may
   file only duties and commitments for other people — never leave, never medical (D655). Pinned here, through the real
   stores, the real commit and the real undo: his shared duty over another man's pending bid lands, the bid stays a bid,
   nobody's war row is written, and one Undo takes the filing back. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { initStore as raptorInitStore, writeInputs } from '../state/store'
import { setMe, setSession } from '../state/auth'
import { projectPeople } from './state/raptorRoster'
import { initStore, lwHistInit, recordsAt, setCell, setPeople, setRole, setViewer } from './state/store'
import { memoryBackend } from './state/storage'
import { wireLeaveWarSync } from './sync'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'

const ISNAP = JSON.stringify(INPUTS)
const pid = 'bane'                                         // Ranger, the seeded member account

beforeEach(() => {
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  setSession({ user: 'ad', role: 'admin' })
  raptorInitStore(); initStore(memoryBackend()); setPeople(projectPeople()); wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  setRole('admin')
})
afterEach(() => { _resetTimeline(); setSession(null); setMe('bane') })

describe('a member\u2019s shared duty over another man\u2019s pending bid', () => {
  it('lands; the other man\u2019s bid stays a bid; one Undo takes the filing back', () => {
    expect(setCell('ammo', '2026-02-10', 'LL')).toBe(true)          // the admin places ammo's bid
    setSession({ user: 'us', role: 'main' }); setMe(pid); setRole('member'); setViewer(pid)
    const at = Date.UTC(2026, 1, 1)
    const row = { iid: 'mc1', people: [{ p: pid, by: pid, at }, { p: 'ammo', by: pid, at }], type: 'Meeting', date: 'Feb 10', yr: 2026,
      allday: false, s: 600, e: 660, remarks: '', mod: '2026-02-01', by: pid, at, filedBy: pid }
    expect(writeInputs(() => { INPUTS.push(row) }), 'the filing lands').toBe(true)
    expect(INPUTS.some((r: any) => r.iid === 'mc1')).toBe(true)
    const recs = recordsAt('ammo', '2026-02-10')
    expect(recs.filter(r => r.kind === 'request').map(r => (r as any).state)).toEqual(['pending'])
    expect(recs.some(r => r.kind === 'notice')).toBe(false)
    expect(globalUndo().ok).toBe(true)
    expect(INPUTS.some((r: any) => r.iid === 'mc1')).toBe(false)
  })
})

/* [LW-M1-READ-LEFTOVERS] (2) (M3 §4): "This replaces … on the Leave War" was said inside the filing's command, before
   the commit's checks — so a filing the commit refused still said it. It rides the command now, and a refused command
   says nothing. */
describe('"This replaces …" is said only once the filing lands', () => {
  const said: string[] = []
  let was: any
  beforeEach(async () => { const { HOOKS } = await import('../engine/hooks'); was = HOOKS.toast; said.length = 0; HOOKS.toast = (m: any) => { said.push(String(m)) } })
  afterEach(async () => { const { HOOKS } = await import('../engine/hooks'); HOOKS.toast = was })
  const leaveFor = (iid: string, who: string, by: string) => ({ iid, person: who, type: 'LL', date: 'Feb 10', yr: 2026, allday: true, remarks: '', mod: '2026-02-01', by, at: 1 })
  it('a leave the commit refuses (a member filing it for another man) says nothing of the bid it would have replaced', () => {
    expect(setCell('ammo', '2026-02-10', 'LL')).toBe(true)
    setSession({ user: 'us', role: 'main' }); setMe(pid); setRole('member'); setViewer(pid)
    expect(writeInputs(() => { INPUTS.push(leaveFor('mc2', 'ammo', pid)) })).toBe(false)
    expect(said.join(' ')).not.toContain('This replaces')
    expect(recordsAt('ammo', '2026-02-10').some(r => r.kind === 'request')).toBe(true)
  })
  it('one that lands (the admin filing it) says it, once', () => {
    expect(setCell('ammo', '2026-02-10', 'OL')).toBe(true)
    expect(writeInputs(() => { INPUTS.push(leaveFor('mc3', 'ammo', 'stiff')) })).toBe(true)
    expect(said.filter(m => m.includes('This replaces')).length).toBe(1)
  })
})
