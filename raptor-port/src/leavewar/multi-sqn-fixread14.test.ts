// @vitest-environment jsdom
/* Fix read 13 (20 Nov 26) — the faults the readers found in fix read 12's code, and his D2228 (the builder's brief:
   docs/superpowers/briefs/2026-11-20-multi-sqn-b1-fixread13-fixes-brief.md). Each describe is one item, red first on the
   code the readers read (3d9743036). Hunter (142's plain admin, `ad2`, person `prowler`); Saber the master (`ad`, person
   `stiff`); Ranger (142, `us`, account `acus`, person `bane`); Kestrel and Osprey are 149's (`ad9`, `us9`). Harness as
   leavewar/multi-sqn-fixread12.test.ts; the readers' set-ups copied, never imported. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, writeInputsBatch } from '../state/store'
import { accountsLoad, signIn, sessionFor, ACCOUNTS_LIST } from '../state/accounts'
import { initStore as lwInitStore, setPeople, getState } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { projectPeople } from '../leavewar/state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor, postOut, runPoOutcomes, undoPostOut } from '../leavewar/sync'
import { unitsLoad, setGrant, setHome, unitRows, homeOn } from '../state/units'
import { HOME_PFX } from '../state/units-model'
import { accountOfPid } from '../state/accounts'
import { commit } from '../command'
import { peopleStore, finishPeopleWrite } from '../state/people-settings-commit'
import { resyncBeforeEnlist } from '../state/sched-commit'
import { deletePerson } from '../state/person-delete'
import { updatePersonField } from '../state/quals-write'
import { placeApproved, inOneWarCommand, setRemarksOn } from '../leavewar/state/store'
import { leaveInputsAt } from '../leavewar/sync'
import { setLeaveRemarks } from '../ui/inputedit'
import { INPUTS } from '../engine/inputs'
import { NOTICES, noticesFor, filerVia } from '../state/notices'
import { onCommit } from '../command'
import { noticeSeenLoad } from '../state/noticeseen'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline, globalUndo } from '../undo/timeline'
import { commitInputsWith } from '../state/sched-commit'
import { Whiteboard } from '../storage/whiteboard'
import { wireRows, writeSeedRows } from '../state/persist'
import { setStoredRowProbe, setStoredRowsWhole, ownershipViolation } from '../state/perms'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
let worlds: Record<string, any> = {}

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))
  PEOPLE0 = JSON.stringify(PEOPLE)
})
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null; setWarWorldDoor(null) })
beforeEach(() => {
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v }, keys: () => Object.keys(mem) } as any
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  for (let i = INPUTS.length - 1; i >= 0; i--) if (String((INPUTS as any)[i].iid || '').startsWith('ipd')) INPUTS.splice(i, 1)
  worlds = { u142: memoryBackend(), u149: memoryBackend() }
  setWarWorldDoor(null)
  lwInitStore(worlds.u142)
  raptorInitStore()
  NOTICES.splice(0)
  accountsLoad()
  noticeSeenLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  setWarWorldDoor((u: string) => ({ backend: worlds[u] ?? (worlds[u] = memoryBackend()) }))
  _resetTimeline(); installGlobalUndo()
  vi.spyOn(HOOKS, 'toast').mockImplementation(() => {})
})

const on = (d: number, h = 9, m = 0) => { vi.setSystemTime(new Date(2026, 6, d, h, m, 0)); unitsLoad() }
const grantsOf = (id: string) => unitRows().grants.filter(g => g.account === id)
const passTypes = () => {
  const seen: string[] = []
  const off = onCommit((e: any) => { seen.push(e.type) })
  try { runPoOutcomes() } finally { off() }
  return seen
}
import { setCell, setBidStates } from '../leavewar/state/store'
import { commitPeopleEdit } from '../state/people-settings-commit'

/* Fix read 14 (20 Nov 26, chat 119) — the readers' claims on fix read 13's fixes, each written as a test before it is
   believed (the readers' brief: docs/superpowers/briefs/2026-11-20-multi-sqn-b1-fixread14-brief.md). Same harness as
   leavewar/multi-sqn-fixread13.test.ts (copied above, never imported). */

const homes = (pid: string, key: string, rows: [string, string][]) => {
  rows.forEach(([unit, from], i) => { mem['sqn142_' + HOME_PFX + key + i] = JSON.stringify({ id: key + i, pid, unit, from }) })
  unitsLoad()
}

/* SEC14-1 (the security reader): an honest edit of his own saved leave whose before-image memory had rewritten — the
   Undo step records memory's image, and Undo saves it */
describe('SEC14-1 — a member never puts a scheduler\'s or the war\'s mark on his own leave through an edit then Undo', () => {
  let WB: Whiteboard
  const stored = (id: string): any => { const v = WB.get('inputs', id); return v ? JSON.parse(v) : null }
  beforeEach(() => { WB = new Whiteboard(); wireRows(WB); writeSeedRows(WB) })
  afterEach(() => { setStoredRowProbe(null); setStoredRowsWhole(false) })
  for (const [field, val] of [['lw', 'y2026'], ['lateOff', true]] as const) {
    it(`${field}: set in memory, an edit of his remark, then Undo — the saved row never carries it`, () => {
      signInAs('us', 'us')
      const IID = 'ipd-sec14-' + field
      expect(writeInputsBatch(() => { INPUTS.push({ person: 'bane', date: 'Jul 27', yr: 2026, allday: true, type: 'LL', remarks: 'mine', by: 'bane', at: Date.now(), iid: IID, ord: 99961 } as any) })).toBe(true)
      expect(stored(IID)?.[field], 'saved without it').toBeUndefined()
      const x: any = INPUTS.find((r: any) => r.iid === IID)
      x[field] = val                                                         // outside every command
      const ok = writeInputsBatch(() => { delete x[field]; x.remarks = 'mine, changed' })
      if (ok) globalUndo()
      expect(stored(IID)?.[field], 'the saved row').toBeUndefined()
    })
  }
})

/* Astra A1: a moved filer told of a change to another squadron's input — the named men and the input's days crossed */
describe("Astra A1 — a moved filer, an admin of 149, is not told of a change whose every entry is 142's (D2223, D2228)", () => {
  const IID = 'ipd-fr14a1'
  it("Hunter files Ranger's LL on 23 Jul; both move to 149 (Ranger from 25 Jul); Saber moves it to Casper on 27 Jul: Hunter not told", () => {
    signInAs('ad2', 'a2')
    expect(writeInputsBatch(() => { INPUTS.push({ person: 'bane', date: 'Jul 23', yr: 2026, allday: true, type: 'LL', remarks: 'for him', by: 'prowler', at: Date.now(), iid: IID, ord: 99981 } as any) })).toBe(true)
    homes('prowler', 'hc', [['u142', '2026-07-15'], ['u149', '2026-07-16']])
    homes('bane', 'hr', [['u142', '2026-07-15'], ['u149', '2026-07-25']])
    on(17)
    expect(homeOn('bane', '2026-07-23')).toBe('u142'); expect(homeOn('bane', '2026-07-27')).toBe('u149'); expect(homeOn('casper', '2026-07-27')).toBe('u142')
    signInAs('ad', 'a')
    expect(writeInputsBatch(() => { const x: any = INPUTS.find((r: any) => r.iid === IID); x.person = 'casper'; x.date = 'Jul 27' })).toBe(true)
    expect(NOTICES.filter(n => n.to === 'prowler' && n.iid === IID).map(n => n.fu), "Ranger on the 23rd and Casper on the 27th are both 142's").toEqual([])
  })
  /* (the fix, item B): each image counts as it would alone — an image naming nobody by its own squadron (inputUnit), no
     longer by the other image's men over its days */
  it("(the fix) an ALL AVAIL meeting Hunter filed on 23 Jul, changed to name Casper (149's from 16 Jul) on 27 Jul: 142 by the meeting, 149 by Casper", () => {
    homes('casper', 'hk', [['u142', '2026-07-15'], ['u149', '2026-07-16']])
    on(17)
    const before = { iid: IID, person: 'allavail', people: [{ p: 'allavail', by: 'prowler', at: Date.now() }], type: 'Meeting', date: 'Jul 23', yr: 2026, by: 'prowler', at: Date.now() }
    const after = { ...before, person: 'casper', people: undefined, date: 'Jul 27' }
    expect(filerUnits([before]), 'the meeting alone').toEqual(['u142'])
    expect(filerUnits([before, after]).sort()).toEqual(['u142', 'u149'])
  })
  it("(the fix) Ranger on 23 Jul before, Casper on 27 Jul after — Ranger 149's from 25 Jul: 142 only; Ranger himself moved to the 27th: 142 and 149", () => {
    homes('bane', 'hr', [['u142', '2026-07-15'], ['u149', '2026-07-25']])
    on(17)
    const before = { iid: IID, person: 'bane', type: 'LL', date: 'Jul 23', yr: 2026, by: 'prowler', at: Date.now() }
    expect(filerUnits([before, { ...before, person: 'casper', date: 'Jul 27' }])).toEqual(['u142'])
    expect(filerUnits([before, { ...before, date: 'Jul 27' }]).sort()).toEqual(['u142', 'u149'])
  })
})
import { filerUnits } from '../state/notices'

/* Astra A2: the drag window's Approve — the words and the decision in one command — leaves the filer of an approved leave
   among the days untold */
describe("Astra A2 — the drag window's Approve with new words tells the filer of a war-approved leave among the days", () => {
  it("Hunter's war-approved LL for Ranger on 27 Jul and Ranger's own bid on 28 Jul; Saber types words over both and presses Approve: Hunter told once", () => {
    signInAs('ad2', 'a2')
    const old = new Set(INPUTS.map((r: any) => r.iid))
    expect(placeApproved([{ personId: 'bane', date: '2026-07-27' }], 'LL', { remarks: 'before' }).approved).toBe(1)
    const row: any = INPUTS.find((r: any) => !old.has(r.iid) && r.lw)
    expect(setCell('bane', '2026-07-28', 'LL'), "a pending bid for Ranger beside it").toBe(true)
    signInAs('ad', 'a')
    const ids = new Set(NOTICES.map(n => n.id))
    const cells = [{ personId: 'bane', date: '2026-07-27' }, { personId: 'bane', date: '2026-07-28' }]
    inOneWarCommand('lw.decide', () => {
      inOneWarCommand('lw.reqmeta', () => {
        setRemarksOn(cells, { remarks: 'changed' })
        for (const r of leaveInputsAt('bane', '2026-07-27')) if ((r as any).lw) setLeaveRemarks(r, 'changed', 'bane')
      })
      setBidStates(cells, 'approved')
    })
    expect(row.remarks).toBe('changed')
    const toHunter = NOTICES.filter(n => !ids.has(n.id) && n.iid === row.iid && n.to === 'prowler')
    expect(toHunter.length, "Hunter, its filer, told of the new words").toBe(1)
  })
})

/* Astra A3: a person command that clears only a deleted man's archive mark — accepted; the Quals page (which hides the
   archived only) lists him again */
describe('Astra A3 — a deleted man never comes back onto Quals through a command that clears his archive mark', () => {
  for (const [who, pw] of [['ad2', 'a2'], ['ad', 'a']] as const) {
    it(`${who === 'ad' ? 'Saber (the master)' : 'Hunter'} deletes Casper, then a people edit clears only 'archived': refused, he stays off Quals`, () => {
      signInAs(who, pw)
      expect(deletePerson('casper')).toBeNull()
      expect({ d: !!(PEOPLE as any).casper.deleted, a: !!(PEOPLE as any).casper.archived }).toEqual({ d: true, a: true })
      let ok = true
      try { ok = !!(commitPeopleEdit(() => { delete (PEOPLE as any).casper.archived; delete (PEOPLE as any).casper.archivedBy }) as any)?.ok } catch { ok = false }
      expect({ ok, archived: !!(PEOPLE as any).casper.archived }, 'a deleted man stays archived, off every list').toEqual({ ok: false, archived: true })
    })
  }
  it('(control) a people edit of a man never deleted still saves', () => {
    signInAs('ad2', 'a2')
    expect(updatePersonField('casper', { flight: 'B' })).toBeNull()
    expect((PEOPLE as any).casper.flight).toBe('B')
  })
})
