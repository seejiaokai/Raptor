// @vitest-environment jsdom
/* R2 OF THE SECOND HALF (the plan docs/superpowers/plans/2026-11-22-multi-sqn-b1-second-half.md §3 item 7, §15 D14 — never
   built; the final reads, the Opus reader's 2): the Leave War's Approvals "New" mark is one per person PER SQUADRON. The
   moment he opens Approvals was one community row, `apprseen:<pid>`, so opening 142's Approvals took "New" off 149's
   requests too. It is now a row of the war's own squadron — `settings/<unit>@apprseen:<pid>` — written for the war the
   page shows (leavewar/state/store.ts worldUnit), and still his own row alone at the gate (7e reads the name with the
   squadron split off). Red first: one moment served both squadrons. */
import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup, act } from '@testing-library/react'
import { useMsqWorld, signInAs, ACCT, PID } from '../test-support/msq-world'
import { store } from '../engine/hooks'
import { qualify } from '../storage/unitid'
import { ownerOf } from '../storage/keyowner'
import { tableOf } from '../storage/tables'
import { saveAccess } from '../state/accounts'
import { openApprovals, apprSeenAt, APPRSEEN_PFX } from '../state/apprseen'
import { commitSettingsIntent } from '../state/people-settings-commit'
import { enterSquadron, notify } from '../state/store'
import { worldUnit } from './state/store'
import { ApprovalsPage } from './ui/ApprovalsPage'

useMsqWorld()
afterEach(() => cleanup())

describe('Approvals\' "New" is one per person per squadron (R2)', () => {
  it('Saber opens 149\'s Approvals at 1000 and 142\'s at 2000: 149\'s moment stays 1000', () => {
    signInAs('saber')
    expect(openApprovals(PID.saber, 'u149', 1000)).toBe(0)
    expect(openApprovals(PID.saber, 'u142', 2000)).toBe(0)
    expect(apprSeenAt(PID.saber, 'u149')).toBe(1000)
    expect(apprSeenAt(PID.saber, 'u142')).toBe(2000)
    expect(openApprovals(PID.saber, 'u149', 3000), '149\'s visit counts from 149\'s last').toBe(1000)
  })
  it('the row is the squadron\'s: stored under its squadron, owned by the unit, its own table', () => {
    signInAs('saber')
    openApprovals(PID.saber, 'u149', 1000)
    expect(store.get(qualify('u149', APPRSEEN_PFX + PID.saber), null)).toEqual({ at: 1000 })
    expect(store.get(APPRSEEN_PFX + PID.saber, null), 'no community row').toBeNull()
    expect(ownerOf('settings', qualify('u149', APPRSEEN_PFX + PID.saber))).toBe('unit')
    expect(tableOf('settings', qualify('u149', APPRSEEN_PFX + PID.saber))).toBe('LeaveApprovalsSeen')
  })
  it('the page writes the war it shows: Hunter with View of 149 and 149 picked opens HIS war\'s Approvals — 142\'s', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'view' } })).toBeNull()
    signInAs('hunter')
    act(() => { enterSquadron('u149'); notify() })
    expect(worldUnit()).toBe('u142')
    render(<ApprovalsPage shown />)
    expect(apprSeenAt(PID.hunter, 'u142'), '142\'s moment written').toBeGreaterThan(0)
    expect(apprSeenAt(PID.hunter, 'u149'), 'nothing for 149, which he only views').toBe(0)
  })
  it('still his own row alone: Hunter (142\'s admin) cannot set Kestrel\'s (149\'s) moment in 149\'s space', () => {
    signInAs('hunter')
    const r: any = commitSettingsIntent('lw.apprseen', { owner: PID.hunter }, () => {
      store.set(qualify('u149', APPRSEEN_PFX + PID.kestrel), { at: Date.now() + 365 * 86400000 })
    })
    expect(r.ok).toBe(false)
    expect(apprSeenAt(PID.kestrel, 'u149')).toBe(0)
  })
  it('…nor a man of his own squadron\'s in another squadron\'s space he holds no right in', () => {
    signInAs('hunter')
    const r: any = commitSettingsIntent('lw.apprseen', { owner: PID.hunter }, () => {
      store.set(qualify('u142', APPRSEEN_PFX + PID.kestrel), { at: Date.now() })
    })
    expect(r.ok).toBe(false)
  })
})
