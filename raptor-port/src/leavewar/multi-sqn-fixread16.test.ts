// @vitest-environment jsdom
/* Fix read 16 (20 Nov 26, chat 123) — the faults the readers found in fix read 15's fixes (74b452c2b..5f6e3f5df). The harness
   below is fix read 15's, copied whole; its header describes fix read 13's file it came from. */
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
import { changeAbsenceById } from '../leavewar/state/store'
import { foldedInto } from '../state/notices'

/* Fable 1: the two halves of one day, each a war-approved leave of the same man, kind and war, with different words —
   removing or un-approving one half read it as "folded into" the other (foldedInto never asked for the part of the day),
   wrote a words line naming the half that stands and is unchanged, and the gate refused the whole command — while the war
   door had already answered "done". */
describe('Fable 1 — a half-day war leave beside the other half with different words can be removed and un-approved', () => {
  const halves = (am: string, pm: string) => {
    signInAs('ad', 'a')
    const o1 = new Set(INPUTS.map((r: any) => r.iid))
    expect(placeApproved([{ personId: 'bane', date: '2026-07-27' }], '*LL', { remarks: am }).approved).toBe(1)
    const amRow: any = INPUTS.find((r: any) => !o1.has(r.iid) && r.lw)
    signInAs('ad2', 'a2')
    const o2 = new Set(INPUTS.map((r: any) => r.iid))
    expect(placeApproved([{ personId: 'bane', date: '2026-07-27' }], 'LL*', { remarks: pm }).approved).toBe(1)
    const pmRow: any = INPUTS.find((r: any) => !o2.has(r.iid) && r.lw)
    signInAs('ad', 'a')
    return { amRow, pmRow }
  }
  const live = (iid: string) => INPUTS.some((r: any) => r.iid === iid)
  it('foldedInto: the other half of the same day is never folded into a half', () => {
    const { amRow, pmRow } = halves('morning words', 'afternoon words')
    expect(amRow.half, 'am half').not.toBe(pmRow.half)
    /* (even read as if the half that stands had grown over the day: its before-image given as nothing of that day) */
    const grown = { ...amRow, date: 'Jul 26', endDate: 'Jul 26' }
    expect(foldedInto(amRow, [pmRow], grown).length).toBe(0)
    expect(foldedInto(pmRow, [amRow], { ...pmRow, date: 'Jul 26', endDate: 'Jul 26' }).length).toBe(0)
    /* (and an untouched leave folds nothing — the security reader's and the Opus reader's own test) */
    expect(foldedInto(amRow, [{ ...amRow, iid: 'x1' }], amRow).length).toBe(0)
  })
  for (const [which, to] of [['pm', 'removed'], ['am', 'removed'], ['pm', 'pending'], ['pm', 'refused']] as const) {
    it(`Saber ${to === 'removed' ? 'removes' : to === 'refused' ? 'refuses' : 'un-approves'} the ${which} half: it takes, and nobody is told of words`, () => {
      const { amRow, pmRow } = halves('morning words', 'afternoon words')
      const row = which === 'pm' ? pmRow : amRow
      const ids = new Set(NOTICES.map(n => n.id))
      expect(changeAbsenceById('bane', '2026-07-27', row.iid, to)).toBeNull()
      if (to === 'removed') expect(live(row.iid), 'the half is gone').toBe(false)
      else expect(INPUTS.find((r: any) => r.iid === row.iid)?.lw, 'the half is no longer war-approved').toBeFalsy()
      expect(live(which === 'pm' ? amRow.iid : pmRow.iid), 'the other half stands').toBe(true)
      expect(NOTICES.filter(n => !ids.has(n.id) && n.what.some((x: any) => x.k === 'rmk')).length, 'no words line').toBe(0)
    })
  }
  it('(control) the same with both halves reading the same words: removing the pm half takes', () => {
    const { pmRow } = halves('same', 'same')
    expect(changeAbsenceById('bane', '2026-07-27', pmRow.iid, 'removed')).toBeNull()
    expect(live(pmRow.iid)).toBe(false)
  })
})

/* Fable 2 (D2225; fix read 14's item B — each image counted as it would be alone): the folded leave's filer was judged
   over the standing leave's days too, so Hunter, who filed Ranger's 29 Jul when Ranger's 29th was already 149's, was
   told on the 27th's 142 day his leave never had. */
describe("Fable 2 — a folded leave's filer is told only for his own leave's days still his squadron's", () => {
  const bridgeAcross = (move: boolean) => {
    signInAs('ad2', 'a2')
    expect(placeApproved([{ personId: 'bane', date: '2026-07-29' }], 'LL', { remarks: 'right' }).approved).toBe(1)
    signInAs('ad', 'a')
    expect(placeApproved([{ personId: 'bane', date: '2026-07-27' }], 'LL', { remarks: 'left' }).approved).toBe(1)
    expect(setCell('bane', '2026-07-28', 'LL')).toBe(true)
    if (move) { on(27); expect(setHome('bane', 'u149').ok, "Ranger 149's from 28 Jul").toBe(true); expect(homeOn('bane', '2026-07-28')).toBe('u149') }
    const ids = new Set(NOTICES.map(n => n.id))
    const cells = [27, 28, 29].map(d => ({ personId: 'bane', date: `2026-07-${d}` }))
    inOneWarCommand('lw.decide', () => {
      inOneWarCommand('lw.reqmeta', () => {
        setRemarksOn(cells, { remarks: 'joined' })
        for (const d of ['2026-07-27', '2026-07-29']) for (const r of leaveInputsAt('bane', d)) if ((r as any).lw) setLeaveRemarks(r, 'joined', 'bane')
      })
      setBidStates(cells, 'approved')
    })
    const joined = INPUTS.filter((r: any) => r.lw && r.date === 'Jul 27' && r.endDate === 'Jul 29').length
    return { joined, fresh: NOTICES.filter(n => !ids.has(n.id)) }
  }
  /* REWRITTEN TO A RULING'S OUTCOME (the reshape plan §9.3 — helper "war", A7, 21 Nov 26): his D2243 (Q3) — a war's change
     to a man's day not its squadron's only removes, for everyone — so 142's war no longer approves Ranger's 28th and 29th
     (149's days) and the bridge cannot join them: the join this pinned is gone. What the test is for stands: Hunter, who
     never moved, is not told; Ranger is told of each of his two leaves' new remarks, the 27th's and the 29th's (both
     Inputs, outside any war), once each. */
  it("Ranger 149's from 28 Jul; the bridge joins Hunter's 29th (a 149 day) into Saber's 27th: Hunter, who never moved, is not told", () => {
    const { joined, fresh } = bridgeAcross(true)
    expect(joined, "the 28th and 29th are 149's: 142's war joins nothing there (D2243 Q3)").toBe(0)
    expect(fresh.filter(n => n.to === 'prowler' && n.what.some((x: any) => x.k === 'rmk')).length).toBe(0)
    expect(fresh.filter(n => n.to === 'bane' && n.what.some((x: any) => x.k === 'rmk')).length, 'Ranger told once a leave').toBe(2)
  })
  it('(control) the same bridge with no move: Hunter told once, the line with its squadron mark', () => {
    const { joined, fresh } = bridgeAcross(false)
    expect(joined).toBe(1)
    const h = fresh.filter(n => n.to === 'prowler' && n.what.some((x: any) => x.k === 'rmk'))
    expect(h.length).toBe(1)
    expect(h[0]!.fu, 'told through 142').toEqual(['u142'])
  })
})

/* S16-2 (the security reader; older than fix read 15): a member's own put of his refused bid back to pending, its
   decision fields deleted, passed the gate on an open day — the refusal and who made it gone, the bid back in Approvals
   with its first place in the queue (perms.ts stampForged compared the decision fields, never the request's state). */
import { setLwDayOpenProbe, ownershipViolation as ov } from '../state/perms'
describe("S16-2 — a member never undoes an admin's decision on his own bid", () => {
  afterEach(() => { setLwDayOpenProbe(null) })
  const T = Date.now()
  const refused = { id: 'rq1', kind: 'request', code: 'LL', state: 'refused', placedBy: 'bane', placedAt: T - 3600_000, decidedBy: 'prowler', decidedAt: T - 60_000 }
  const env = (before: any[], after: any[]): any => ({
    seq: 0, at: '', type: 'lw.edit', origin: 'user', scope: { module: 'lw', warId: 'y2026' },
    actor: { id: 'acus', role: 'member', personId: 'bane', session: {} },
    changes: [{ op: 'put', collection: 'lw.cell', id: 'y2026:bane:2026-07-28', before, after }],
  })
  it('the refused bid put back to pending, its decision fields deleted: refused', () => {
    setLwDayOpenProbe(() => true)
    const { decidedBy: _b, decidedAt: _a, ...rest } = refused
    expect(ov(env([refused], [{ ...rest, state: 'pending' }]))).toMatch(/decided/)
  })
  it('the refused bid put to approved with the decision fields kept: refused', () => {
    setLwDayOpenProbe(() => true)
    expect(ov(env([refused], [{ ...refused, state: 'approved' }]))).toMatch(/decided/)
  })
  it('a new bid of his written already approved: refused', () => {
    setLwDayOpenProbe(() => true)
    expect(ov(env([], [{ id: 'rq2', kind: 'request', code: 'LL', state: 'approved', placedBy: 'bane', placedAt: Date.now() }]))).toMatch(/decided|placed/)
  })
  it('(control) his own refused bid cleared off the day: allowed', () => {
    setLwDayOpenProbe(() => true)
    expect(ov(env([refused], []))).toBeNull()
  })
  it('(control) a new pending bid of his, placed now: allowed', () => {
    setLwDayOpenProbe(() => true)
    expect(ov(env([], [{ id: 'rq3', kind: 'request', code: 'LL', state: 'pending', placedBy: 'bane', placedAt: Date.now() }]))).toBeNull()
  })
})
