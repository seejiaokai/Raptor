/* SECURITY READ — 7e's audience line (PC1) also opens another squadron's admin's READ RECORDS:
   Kestrel, 149's plain admin, rewrites the bell / history / Approvals / access-request "seen" rows of Hunter, 142's admin,
   once Hunter holds Plan of 149 — rows that cover 142's business, which Kestrel holds no right in. */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, signInAs, PID, ACCT } from '../test-support/msq-world'
import { store } from '../engine/hooks'
import { commitSettingsIntent } from './people-settings-commit'
import { setGrant, unitsLoad } from './units'
import { NOTICES } from './notices'
import { commitNewInput } from '../ui/inputedit'
import { writeInputsBatch } from './store'

useMsqWorld()

const forge = (type: string, key: string, v: unknown): boolean => {
  const r: any = commitSettingsIntent(type, { owner: PID.kestrel }, () => { store.set(key, v) })
  return !!r && r.ok === true && JSON.stringify(store.get(key, null)) === JSON.stringify(v)
}

describe('another squadron\'s admin\'s read records', () => {
  it('control: with no Plan, Kestrel cannot write Hunter\'s read records', () => {
    signInAs('kestrel')
    expect(forge('notices.seen', `noticeseen:${PID.hunter}`, { pid: PID.hunter, ids: ['x'] })).toBe(false)
  })
  it('Hunter holds Plan of 149: Kestrel still must not write Hunter\'s read records', () => {
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter)).toMatchObject({ ok: true })
    unitsLoad()
    signInAs('kestrel')
    const got = {
      bell: forge('notices.seen', `noticeseen:${PID.hunter}`, { pid: PID.hunter, ids: ['x'] }),
      history: forge('changes.seen', `seen:${PID.hunter}`, { pid: PID.hunter, at: 9999999999999 }),
      approvals: forge('lw.apprseen', `apprseen:${PID.hunter}`, { at: 9999999999999 }),
      requests: forge('access.seen', `reqseen:${ACCT.hunter}`, { userId: ACCT.hunter, seenRequestIds: ['r1'] }),
    }
    expect(got).toEqual({ bell: false, history: false, approvals: false, requests: false })
  })
  it('…nor take a line of 142\'s own business off Hunter\'s bell', () => {
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter)).toMatchObject({ ok: true })
    unitsLoad()
    expect(commitNewInput({ person: PID.hunter, type: 'Event', start: '2026-07-21', allday: true, remarks: '142 business' })).toBe(true)
    const line: any = NOTICES.find((n: any) => String(n.to) === PID.hunter)
    expect(line, 'setup: Saber\'s filing told Hunter').toBeTruthy()
    signInAs('kestrel')
    const ok = writeInputsBatch(() => { const i = NOTICES.findIndex((n: any) => n.id === line.id); if (i >= 0) NOTICES.splice(i, 1) })
    expect(ok && !NOTICES.some((n: any) => n.id === line.id), 'a 149 admin deleted a 142 line from a 142 admin\'s bell').toBe(false)
  })
})
