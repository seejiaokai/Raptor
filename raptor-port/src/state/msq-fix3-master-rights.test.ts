// @vitest-environment jsdom
/* R3 OF THE SECOND HALF'S FINAL READS (docs/superpowers/briefs/2026-11-23-msq-b1-final-read-opus.md finding 3, …-astra.md
   finding 1): made a master admin through the master mark's own command (state/accounts.ts setMaster — no screen calls
   it now; a master admin can send it by hand), a Plan holder kept his Plan rows: hidden behind "Full access", back when
   the mark came off (R-O10). And the gate let it through — "a right left on an account made a master admin" was asked
   only of Admin → Users' one Save (`account.access`). Now:
   - setMaster drops his rights as the one Save does, through the SAME body (plan §4 item 5, §16 D1′a — kept on his
     account with each Plan's moment);
   - the gate refuses a right left on an account made a master admin, whichever command made him one (§15 D14).
   Red first: the Plan stayed, and the forged command was let through. */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, signInAs, ACCT } from '../test-support/msq-world'
import { saveAccess, accountById, setMaster, levelAcct } from './accounts'
import { grantOfOn, todayIso, unitsLoad } from './units'
import { commitSettingsIntent } from './people-settings-commit'
import { store } from '../engine/hooks'
import { globalUndo } from '../undo/timeline'

useMsqWorld()

const level = (acct: string, unit: string) => { unitsLoad(); const a = accountById(acct)!; return grantOfOn(levelAcct(a), unit)?.level ?? 'none' }

describe('made a master admin by the mark\'s own command, he keeps no right (R3)', () => {
  it('Saber gives Hunter Plan of 149, then sets his mark: the Plan goes, kept on his account (§16 D1′a)', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
    expect(setMaster(ACCT.hunter, true)).toEqual({ ok: true })
    expect(level(ACCT.hunter, 'u149')).toBe('none')
    expect(Object.keys(accountById(ACCT.hunter)!.kept ?? {})).toEqual(['u149'])
  })
  it('…and the mark taken off again leaves no Plan behind (Astra\'s 1)', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
    expect(setMaster(ACCT.hunter, true).ok).toBe(true)
    expect(setMaster(ACCT.hunter, false).ok).toBe(true)
    expect(level(ACCT.hunter, 'u149')).toBe('none')
  })
  it('a View of 149 goes too', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'view' } })).toBeNull()
    expect(setMaster(ACCT.hunter, true).ok).toBe(true)
    expect(level(ACCT.hunter, 'u149')).toBe('none')
  })
  it('one Undo puts the mark off and the Plan back', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
    expect(setMaster(ACCT.hunter, true).ok).toBe(true)
    expect(globalUndo().ok).toBe(true)
    expect(accountById(ACCT.hunter)!.master).toBeUndefined()
    expect(level(ACCT.hunter, 'u149')).toBe('admin')
  })
  it('the gate: a forged `account.master` making Hunter a master admin and keeping his Plan of 149 is refused (§15 D14)', () => {
    signInAs('saber')
    /* (the accounts stored first, by the real door — the very first write stores every account, so the forgery below
       writes one row of a stored list, as a hand-made command would) */
    expect(setMaster(ACCT.hunter, true).ok).toBe(true)
    expect(setMaster(ACCT.hunter, false).ok).toBe(true)
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
    const h = accountById(ACCT.hunter)!
    const g = grantOfOn(levelAcct(h), 'u149')!
    /* the row as the mark's own door writes it — dated now, the Plan kept with its moment — only the Plan row left */
    const stored: any = store.get('account:' + h.id, null)
    expect(stored, 'his row is stored').toBeTruthy()
    const row = { ...stored, master: true, masterFrom: todayIso(), masterAt: Date.now(), kept: { u149: g.fromAt ?? 0 } }
    const r = commitSettingsIntent('account.master', null, () => { store.set('account:' + h.id, row) }) as any
    expect(r.ok, String(r.message ?? r.detail ?? JSON.stringify(r))).toBe(false)
    expect(String(r.message ?? r.detail ?? JSON.stringify(r))).toMatch(/a right left on an account made a master admin/)
    expect(accountById(ACCT.hunter)!.master).toBeUndefined()
  })
})
