// @vitest-environment jsdom
/* JOB 2 (19 Nov 26) — a bell line may cross squadrons only as the telling of an input the same command changes, and only
   to someone that change tells: the people named in the input before or after, or its filer (state/notices.ts noticePass).
   The gate (section 7e for an admin, the notices case for a member) let a line ride ANY changed input to ANYONE (Astra 6,
   the security read's SEC-2 second case and SEC-3), and kept crossing any line carrying one holiday part beside others
   (SEC-2 first case). The proofs are the security reader's and Astra's
   (docs/superpowers/briefs/2026-11-19-multi-sqn-b1-job2-{security,astra}.md), set up as units-sqn-fixread2.test.ts. */
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, store } from '../engine/hooks'
import { commitSettingsIntent } from './people-settings-commit'
import { apprSeenAt } from './apprseen'
import { initStore, resetSession, notify, writeInputsBatch } from './store'
import { INPUTS, leadOf } from '../engine/inputs'
import { signIn, sessionFor, accountsLoad } from './accounts'
import { setSession } from './auth'
import { installGlobalUndo } from './undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { setUnitSeeds } from './units'
import { ownershipViolation } from './perms'
import { NOTICES } from './notices'
import { deriveActor } from '../command'

const mem: Record<string, string> = {}
const fake = {
  getItem: (k: string) => (k in mem ? mem[k]! : null),
  setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v },
  keys: () => Object.keys(mem),
}
const signInAs = (name: string, pass: string) => { const r = signIn(name, pass); resetSession(sessionFor(r)); notify(); return r }

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))      // Wed 15 Jul 26
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = fake
  setUnitSeeds(true)
  initStore()
  accountsLoad()
  resetSession(null)
  _resetTimeline()
  installGlobalUndo()
})
afterEach(() => { setSession(null); resetSession(null); _resetTimeline(); vi.useRealTimers() })
afterAll(() => { storeBackend.impl = null })

const env = (changes: any[], type = 'inputs.write'): any => ({ seq: 1, at: '', origin: 'local', scope: { module: 'settings' }, type, actor: deriveActor(), changes })
const put = (collection: string, id: string, after: any, before: any = null) => ({ op: 'put', collection, id, before, after })
const ranger = () => INPUTS.find((x: any) => String(leadOf(x)) === 'bane') as any

describe("SEC-2 — an admin's bell line to another squadron's man", () => {
  const line = (to: string, what: any[], iid = 'i1') => ({ id: 'n1', to, by: 'prowler', at: Date.now(), iid, name: 'Leave', day: '2026-07-17', what })
  it("Hunter's line to 149's Osprey with a holiday part beside a 'leave refused' part is refused", () => {
    signInAs('ad2', 'a2')
    const what = [{ k: 'oilhol', a: '2026-07-17', b: '2026-07-17' }, { k: 'lw', code: 'LL', d: 'refused' }]
    expect(ownershipViolation(env([put('notices', 'n1', line('osp9', what))]))).toMatch(/bell line of another squadron's man/)
  })
  it('…while a line of holiday parts only still crosses (D2184 R32)', () => {
    signInAs('ad2', 'a2')
    /* (as noticeHoliday writes it: no input — since fix read 8's fault H one naming an input goes through the ordinary
       checks) */
    /* (…and only as noticeHoliday itself mints it inside the command — fix read 10, fault B: a line merely put in that shape
       takes the ordinary checks; the real crossing is pinned by leavewar/multi-sqn-fixread9.test.ts's control through
       Outlaw's real command and fix read 10's fault B control) */
    expect(ownershipViolation(env([put('notices', 'n1', line('osp9', [{ k: 'oilhol', a: '2026-07-17', b: '2026-07-17' }], ''))]))).toMatch(/bell line of another squadron's man/)
  })
  it("Hunter's line to Osprey riding a 142 input he changes, Osprey neither in it nor its filer, is refused — put and delete", () => {
    signInAs('ad2', 'a2')
    const mine = ranger()
    const ch = put('inputs', mine.iid, { ...mine, remarks: 'moved' }, mine)
    const n = line('osp9', [{ k: 'rmk' }], mine.iid)
    expect(ownershipViolation(env([ch, put('notices', 'n1', n)]))).toMatch(/bell line of another squadron's man/)
    expect(ownershipViolation(env([ch, { op: 'delete', collection: 'notices', id: 'n1', before: n, after: null }]))).toMatch(/bell line of another squadron's man/)
  })
  it('…while Osprey named in that input after the change is told (a 149 man added to it — judged by 7c, not here)', () => {
    signInAs('ad2', 'a2')
    const mine = ranger()
    const after = { ...mine, people: [...(mine.people ?? [{ p: 'bane' }]), { p: 'osp9' }] }
    const ch = put('inputs', mine.iid, after, mine)
    expect(ownershipViolation(env([ch, put('notices', 'n1', line('osp9', [{ k: 'in' }], mine.iid))])))
      .not.toMatch(/bell line of another squadron's man/)
  })
})

describe('Astra 6 — through the real door: a local change carrying a line to an unrelated 149 man', () => {
  it("Hunter changes Ranger's input and pushes a line to Osprey in the same command: refused, no line reaches 149", () => {
    signInAs('ad2', 'a2')
    const r = ranger()
    const ok = writeInputsBatch(() => {
      r.remarks = 'local change'
      NOTICES.push({ id: 'proof-unrelated-foreign-notice', to: 'osp9', by: 'prowler', at: Date.now(), iid: r.iid, name: 'Training', day: '2026-07-16', what: [{ k: 'rmk' }] } as any)
    })
    expect(ok).toBe(false)
    expect(NOTICES.some(n => n.id === 'proof-unrelated-foreign-notice')).toBe(false)
  })
})

describe("SEC-3 — a member's bell line to another squadron's man", () => {
  it("Ranger (142 member) cannot send 149's Kestrel a line by riding a change of his own input — at the gate", () => {
    signInAs('us', 'us')
    const mine = ranger()
    const ch = put('inputs', mine.iid, { ...mine, remarks: 'x' }, mine)
    const n = { id: 'n9', to: 'kes9', by: 'bane', at: Date.now(), iid: mine.iid, name: '149: all flying cancelled tomorrow', day: '2026-07-16', what: [{ k: 'del' }] }
    expect(ownershipViolation(env([ch, put('notices', 'n9', n)]))).not.toBeNull()
  })
  it('…and through the real input door', () => {
    signInAs('us', 'us')
    const mine = ranger()
    writeInputsBatch(() => {
      mine.remarks = 'x'
      NOTICES.push({ id: 'n9', to: 'kes9', by: 'bane', at: Date.now(), iid: mine.iid, name: '149: all flying cancelled tomorrow', day: '2026-07-16', what: [{ k: 'del' }] } as any)
    })
    expect(NOTICES.some(n => n.id === 'n9' && n.to === 'kes9'), 'no line reached 149').toBe(false)
  })
})

/* SEC-1 (the security read): an admin's Approvals moment and his record of which access requests he has seen are read
   records, judged as `seen:` and `noticeseen:` are (section 7e) */
describe("SEC-1 — another squadron's admin's Approvals moment and access-request seen record", () => {
  it("Hunter (142's plain admin) cannot set Kestrel's (149's admin) Approvals moment", () => {
    signInAs('ad2', 'a2')
    /* (one row per squadron since batch 1's second half, R2 — `u149@apprseen:kes9`, 149's Approvals: state/apprseen.ts) */
    const r = commitSettingsIntent('lw.apprseen', { owner: 'prowler' }, () => { store.set('u149@apprseen:kes9', { at: Date.now() + 365 * 86400000 }) }) as any
    expect(r.ok).toBe(false)
    expect(apprSeenAt('kes9', 'u149')).toBe(0)
  })
  it("…nor Kestrel's record of which access requests he has seen", () => {
    signInAs('ad2', 'a2')
    const r = commitSettingsIntent('access.seen', { owner: 'prowler' }, () => { store.set('reqseen:acad9', { userId: 'acad9', seenRequestIds: ['x'] }) }) as any
    expect(r.ok).toBe(false)
  })
  it('…while his own still goes through', () => {
    signInAs('ad2', 'a2')
    expect((commitSettingsIntent('lw.apprseen', { owner: 'prowler' }, () => { store.set('u142@apprseen:prowler', { at: Date.now() }) }) as any).ok).toBe(true)
  })
})
