// @vitest-environment jsdom
/* THE PROOFS of the sign-in kinds review's findings K1–K5 ([MSQ-FABLE-REVIEW], his D2259), copied word for word from the
   reviewer's red file. Each asserts what the rulings say: all seven were RED on the base (89eecb06a) and are green with
   helper "kinds"'s fixes (K2 by his D2260). The fixes' own further cases: signin-kinds-fixes.test.ts.
   The world: test-support/msq-world.ts (Wed 15 Jul 26; Saber the master admin, Hunter 142's plain admin, Ranger 142's
   member, Kestrel 149's admin, Osprey 149's member). */
import { describe, it, expect, afterEach } from 'vitest'
import { useMsqWorld, signInAs, PID, ACCT, on, moveMan } from '../test-support/msq-world'
import { switchUnit, enterSquadron, switchRoleView } from './store'
import { setGrant, setHome, unitsLoad } from './units'
import { updateAccount, accountsLoad, accountById, levelIn, setMaster } from './accounts'
import { PEOPLE } from '../engine/people'
import { INPUTS } from '../engine/inputs'
import { UNIT, BOOT_UNIT } from '../engine/unitview'
import { roleOf, ownershipViolation, cmdAuthorize, setTrkUnitProbe } from './perms'
import { deriveActor } from '../command/actor'
import { commitInput, draftOf } from '../ui/inputedit'
import * as lw from '../leavewar/state/store'

useMsqWorld()
afterEach(() => { if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT); setTrkUnitProbe(null) })

const duty = (pid: string) => draftOf({ person: pid, type: 'Duty', date: 'Jul 22', yr: 2026, allday: false, s: 540, e: 720, remarks: 'proof' })
const filed = () => INPUTS.filter((r: any) => r.remarks === 'proof').length

describe('K1 — a master admin in the member view is a member of his own squadron (D2253, D292): he changes nothing of another squadron', () => {
  it('(a) Saber, in the member view, files a Duty for Osprey, 149\'s man: refused, as it is for Ranger', () => {
    signInAs('ranger')
    expect(commitInput(null, duty(PID.osprey), [PID.osprey]), 'control: a 142 member').toBe(false)
    signInAs('saber'); switchRoleView()
    expect(roleOf()).toBe('member')
    expect(commitInput(null, duty(PID.osprey), [PID.osprey]), 'the master admin in the member view').toBe(false)
    expect(filed()).toBe(0)
  })
  it('(b) the save check itself: a mark on 149\'s Tracker from the member view is refused, as for a Plan holder in the member view', () => {
    const trk149 = () => {
      const actor = deriveActor()
      if (!cmdAuthorize('trk.marks', actor, null)) return false
      setTrkUnitProbe(() => 'u149')
      try { return ownershipViolation({ seq: -1, at: '', actor, origin: 'user', scope: { module: 'trk' }, type: 'trk.marks', changes: [{ collection: 'trk.marks', id: 'v3:c1:s1:marks', op: 'put', before: null, after: { x: 1 } }], emit: true } as any) == null }
      finally { setTrkUnitProbe(null) }
    }
    signInAs('saber'); expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok).toBe(true)
    signInAs('hunter'); switchRoleView()
    expect(trk149(), 'control: a Plan holder in the member view').toBe(false)
    signInAs('saber'); switchRoleView()
    expect(trk149(), 'the master admin in the member view').toBe(false)
  })
})

describe('K2 — only an admin is a master admin (D1971: three levels; D2250 by its reason, "a member should not hold … admin rights")', () => {
  it('Kestrel, made a master admin, makes Saber a member: Saber is not left a member who still carries the master admin mark', () => {
    signInAs('saber'); expect(setMaster(ACCT.kestrel, true).ok).toBe(true)
    signInAs('kestrel')
    const refusal = updateAccount(ACCT.saber, { role: 'main' })
    const row = accountById(ACCT.saber)!
    expect(refusal !== null || !(row.role === 'main' && row.master === true), `refused: ${JSON.stringify(refusal)}; the row: role ${row.role}, master ${row.master}`).toBe(true)
    /* …and whatever the row says, a member's sign-in reaches no other squadron */
    signInAs('saber')
    if (roleOf() === 'member') expect(commitInput(null, duty(PID.osprey), [PID.osprey]), 'Saber, now a member, files a Duty for 149\'s Osprey').toBe(false)
  })
})

describe('K3 — a man who moves squadron joins as a member; his admin rights end on the date (D2160 T, the scheduler page\'s transfer line; D2192)', () => {
  it('Hunter, 142\'s admin, moved to 149 from Thu 16 Jul: on that day he is 149\'s member, not its admin', () => {
    signInAs('saber'); expect(moveMan(PID.hunter, 'u149').ok).toBe(true)
    on(16); unitsLoad(); accountsLoad()
    expect(levelIn(ACCT.hunter, 'u142', '2026-07-16'), 'nothing in 142 any more').toBeNull()
    expect(levelIn(ACCT.hunter, 'u149', '2026-07-16')).toBe('member')
  })
  it('…so he cannot, the day he arrives, make Osprey an admin of 149 (D2192: an admin of 149 is made by its own admins or a master admin)', () => {
    signInAs('saber'); expect(moveMan(PID.hunter, 'u149').ok).toBe(true)
    on(16); unitsLoad(); accountsLoad()
    signInAs('hunter')
    expect(updateAccount(ACCT.osprey, { role: 'admin' })).not.toBeNull()
    expect(accountById(ACCT.osprey)!.role).toBe('main')
  })
})

describe('K4 — a squadron\'s own admin moves his own man; the squadron he joins is never asked (D2160 T: "the new one never asked")', () => {
  it('Hunter, 142\'s admin, moves Drifter, a 142 man, to 149: saved — or refused in words that say who can', () => {
    signInAs('hunter')
    const r: any = setHome('slipway', 'u149')
    expect(r.ok || !/^This change could not be saved\.?$/.test(String(r.message)), JSON.stringify(r)).toBe(true)
    expect(r.ok, JSON.stringify(r)).toBe(true)
  })
})

describe('K5 — his own leave figures stay in his own squadron (D1695, D2197): a balance is typed only for a man of the war loaded', () => {
  it('Hunter, holding Plan of 149, with 149\'s war loaded, types his own CCL: refused — he is not on 149\'s war', () => {
    signInAs('saber'); expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok).toBe(true)
    signInAs('hunter'); enterSquadron('u149')
    expect(lw.worldUnit()).toBe('u149')
    expect(lw.getState().people.some(p => p.id === PID.hunter), 'he is not on 149\'s war').toBe(false)
    expect(lw.setTypedBalance(PID.hunter, 'CCL' as any, 5)).toBe(false)
  })
})
