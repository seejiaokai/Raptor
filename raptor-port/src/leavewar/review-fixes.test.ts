// Pins for the step-4 cross-provider code inspection (Fable + Codex, 20 Sep 26).
// Each test names the finding it closes; each drives the REAL wired stores.
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { stashClear, stashPut } from '../engine/weekstash'
import { initStore as raptorInitStore, writeInputs } from '../state/store'
import { setEffectiveRole, setMe, setSession } from '../state/auth'
import { projectPeople } from './state/raptorRoster'
import {
  advanceStage, changeAbsenceById, decideRequestById, getState, getVersion, initStore as lwInitStore, lwEditLists, lwHistInit,
  moveAbsenceById, rawState, setBidState, setCell, setPeople, setRole,
} from './state/store'
import { memoryBackend } from './state/storage'
import { wireLeaveWarSync } from './sync'
import { dayView, FULL, PM, type Contrib } from './engine/dayview'
import { recContribs } from './engine/warrecs'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'

const ISNAP = JSON.stringify(INPUTS)
const toast = HOOKS.toast
let said: string[] = []

beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  stashClear()
  setSession({ user: 'ad', role: 'admin' })
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  said = []
  HOOKS.toast = (m: any) => { said.push(String(m)) }
})
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); stashClear(); setSession(null); setMe('bane') })

let n = 0
function file(person: string, type: string, date: string, extra: Record<string, any> = {}): boolean {
  const row: any = { iid: `rf${++n}`, person, type, date, yr: 2026, allday: true, remarks: '', mod: '2026-02-01', ...extra }
  if (row.allday === false) delete row.allday
  return writeInputs(() => { INPUTS.unshift(row) })
}
const recsAt = (p: string, d: string) => rawState().wars[0]!.recs[p]?.[d] ?? []
const lwRows = (p: string) => INPUTS.filter((r: any) => r.person === p && r.lw)

describe('Fable #1 / Codex AS4-001 — the war repaints after every absence change', () => {
  it('an Inputs-page filing bumps the war with no manual sync', () => {
    const v = getVersion()
    expect(file('ammo', 'LL', 'Feb 10')).toBe(true)
    expect(getVersion()).toBeGreaterThan(v)
    expect(getState().grid.ammo?.['2026-02-10']).toBe('LL')
  })

  it('deleting approved leave from the tap list bumps the war', () => {
    setRole('admin'); setCell('ammo', '2026-02-10', 'LL'); advanceStage()
    setBidState('ammo', '2026-02-10', 'approved')
    const iid = String(lwRows('ammo')[0].iid)
    const v = getVersion()
    expect(changeAbsenceById('ammo', '2026-02-10', iid, 'removed')).toBeNull()
    expect(getVersion()).toBeGreaterThan(v)
    expect(getState().grid.ammo?.['2026-02-10']).toBeUndefined()
  })
})

describe('Fable #2 — a credit worked in two stretches is ONE credit', () => {
  const credit = { id: 'c1', kind: 'credit' as const, code: 'FO' as const, oil: 'auto' as const, spans: [[480, 630], [840, 960]] as Array<[number, number]> }
  it('earns once, carries no +1, lists once', () => {
    const v = dayView(recContribs([credit]))
    expect(v.earnsOil).toBe(1)
    expect(v.mark).toBe('')
    expect(v.all).toHaveLength(1)
  })
  it('leave in the gap between the stretches is no clash; leave over a stretch is', () => {
    const gap: Contrib = { id: 'l1', kind: 'absence', code: 'LL', win: [631, 839] }
    const over: Contrib = { id: 'l2', kind: 'absence', code: 'LL', win: PM }
    expect(dayView([...recContribs([credit]), gap]).amber).toBe(false)
    expect(dayView([...recContribs([credit]), over]).amber).toBe(true)
  })
})

describe('Fable #3 — a locked week refuses the tap-list change with words, not a crash', () => {
  it('changeAbsenceById on a locked week returns a reason and changes nothing', () => {
    setRole('admin'); setCell('ammo', '2026-02-10', 'LL'); advanceStage()
    setBidState('ammo', '2026-02-10', 'approved')
    const iid = String(lwRows('ammo')[0].iid)
    stashPut('09/02/2026', 'null')          // the week of 9 Feb becomes a locked week
    const before = JSON.stringify(INPUTS)
    const r = changeAbsenceById('ammo', '2026-02-10', iid, 'removed')
    expect(typeof r).toBe('string')
    expect(JSON.stringify(INPUTS)).toBe(before)
  })
})

describe('Fable #4 / Codex AS4-005 — a morning medical over a timed leave across noon keeps its afternoon', () => {
  it('LL 09:00–15:00 + ATT C morning → LL 12:01–15:00', () => {
    expect(file('rocky', 'LL', 'Jul 14', { allday: false, s: 540, e: 900 })).toBe(true)
    expect(file('rocky', 'ATT C', 'Jul 14', { allday: false, half: 'am', s: 0, e: 720 })).toBe(true)
    const ll = INPUTS.filter((r: any) => r.person === 'rocky' && r.type === 'LL')
    expect(ll).toHaveLength(1)
    expect(ll[0].s).toBe(721)
    expect(ll[0].e).toBe(900)
  })
})

describe('Codex AS4-002 — un-approving never overwrites a stored request', () => {
  it('a refused request on that time blocks "back to bid" and "refuse", naming it', () => {
    setRole('admin'); setCell('ammo', '2026-02-10', 'LL'); advanceStage()
    setBidState('ammo', '2026-02-10', 'approved')
    const iid = String(lwRows('ammo')[0].iid)
    lwEditLists([{ personId: 'ammo', date: '2026-02-10', drop: [], add: [{ id: 'old-ref', kind: 'request', code: 'OIL', state: 'refused' } as any] }])
    for (const to of ['pending', 'refused'] as const) {
      const r = changeAbsenceById('ammo', '2026-02-10', iid, to)
      expect(r).toMatch(/OIL request on 2026-02-10/)
      expect(recsAt('ammo', '2026-02-10').find(x => x.id === 'old-ref')).toBeTruthy()
      expect(lwRows('ammo')).toHaveLength(1)
    }
  })
})

describe('Codex AS4-003 / AS4-004 — notices', () => {
  it('two commands in the same millisecond make two groups; OK-seen on one keeps the other', () => {
    setRole('admin'); setCell('ammo', '2026-02-10', 'LL'); setCell('ammo', '2026-02-11', 'LL')
    const now = Date.now
    Date.now = () => 1_790_000_000_000
    try {
      expect(file('ammo', 'ATT C', 'Feb 10')).toBe(true)
      expect(file('ammo', 'ATT C', 'Feb 11')).toBe(true)
    } finally { Date.now = now }
    const a = recsAt('ammo', '2026-02-10').find(r => r.kind === 'notice') as any
    const b = recsAt('ammo', '2026-02-11').find(r => r.kind === 'notice') as any
    expect(a.seq).not.toBe(b.seq)
  })

  it('an admin LOGIN toggled to member and viewing as the person still leaves a notice', () => {
    setRole('admin'); setCell('ammo', '2026-02-10', 'LL')
    setEffectiveRole('main'); setMe('ammo')
    expect(file('ammo', 'ATT C', 'Feb 10')).toBe(true)
    expect(recsAt('ammo', '2026-02-10').find(r => r.kind === 'notice')).toMatchObject({ byWho: 'an admin' })
  })
})

describe('Codex AS4-006 — the tap list moves ONE leave off a busy day', () => {
  it('moves exactly the chosen Input, keeps the other, and marks the move once bidding is closed', () => {
    setRole('admin')
    setCell('ammo', '2026-02-10', '*LL'); setCell('ammo', '2026-02-10', 'OIL*')
    advanceStage()
    // approve each request on its own (the tap list's per-record decision)
    for (const r of recsAt('ammo', '2026-02-10').filter(x => x.kind === 'request')) {
      expect(decideRequestById('ammo', '2026-02-10', r.id, 'approved')).toBe(true)
    }
    const rows = lwRows('ammo')
    expect(rows.length).toBe(2)
    const am = rows.find((r: any) => r.half === 'am')
    expect(moveAbsenceById('ammo', '2026-02-10', String(am.iid), '2026-02-12')).toBeNull()
    const after = lwRows('ammo')
    expect(after.find((r: any) => r.half === 'am')!.date).toBe('Feb 12')
    expect(after.find((r: any) => r.half === 'pm')!.date).toBe('Feb 10')
    expect(getState().views.ammo['2026-02-12']!.main!.movedFrom).toBe('2026-02-10')
  })
})

void FULL
