// @vitest-environment jsdom
/* STEP F, ITEMS 1 AND 2 — EVERY BELL LINE CARRIES ITS SQUADRON, AND A SQUADRON'S ADMIN LINES GO TO ONE AUDIENCE (batch 1's
   second half, docs/superpowers/plans/2026-11-22-multi-sqn-b1-second-half.md §7 items 1–2; D2198, D2202, R-O2).
   - the one audience (accounts.ts adminLineAudience): adminsOf, and every master admin who can sign in — Saber, master
     admin at home in 142, is told of 149's posting and 149's holiday (whether he SEES them is his bell's switch, D2198:
     off by default for a squadron not his home — the switch's own tests);
   - the stamp (Notice.u): a posting's line its posting's squadron, a holiday's its holiday's, a war line its war's, an
     input's its input's; the gate refuses a new line whose stamp is not the squadron the command acts in, and a line
     rewritten to another stamp.
   Red first on a379af6f0. The world: test-support/msq-world.ts — Wed 15 Jul 26. */
import { describe, expect, it } from 'vitest'
import { worldUnit, holidayAdd } from './state/store'
import { postOut } from './sync'
import { setGrant } from '../state/units'
import { NOTICES } from '../state/notices'
import { INPUTS } from '../engine/inputs'
import { adminLineAudience } from '../state/accounts'
import { commitInput, draftOf } from '../ui/inputedit'
import { ownershipViolation } from '../state/perms'
import { deriveActor } from '../command'
import { useMsqWorld, signInAs, ACCT, PID } from '../test-support/msq-world'

useMsqWorld()

const planOf149 = () => {
  signInAs('saber')
  expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok, 'Saber gives Hunter Plan of 149').toBe(true)
}
const poLines = (to: string, who: string) => NOTICES.filter(n => n.to === to && (n.what || []).some((p: any) => p.k === 'po' && p.who === who))

describe('the one audience (adminLineAudience)', () => {
  it("149's: Kestrel and Saber (master admin, at home in 142); not Hunter until he holds Plan of 149; never a member", () => {
    expect(adminLineAudience('u149').sort()).toEqual([PID.kestrel, PID.saber].sort())
    planOf149()
    expect(adminLineAudience('u149').sort()).toEqual([PID.hunter, PID.kestrel, PID.saber].sort())
    expect(adminLineAudience('u149')).not.toContain(PID.osprey)
  })
  it("142's: Saber and Hunter; Kestrel never", () => {
    expect(adminLineAudience('u142').sort()).toEqual([PID.hunter, PID.saber].sort())
  })
})

describe('a posting’s line: told to the one audience, stamped with the posting’s squadron', () => {
  it('Osprey posted out today by Kestrel: Kestrel and Saber told, each line stamped 149 (red: Saber was not told)', () => {
    signInAs('kestrel')
    expect(worldUnit()).toBe('u149')
    expect(postOut(PID.osprey, '2026-07-15', 'overseas'), 'posted out from today: it runs at once').toBe(true)
    expect(poLines(PID.kestrel, PID.osprey).map(n => n.u)).toEqual(['u149'])
    expect(poLines(PID.saber, PID.osprey).map(n => n.u), 'the master admin is told (§7 item 2)').toEqual(['u149'])
  })
  it('Ranger posted out by Saber: Saber and Hunter told, stamped 142; Kestrel never', () => {
    signInAs('saber')
    expect(postOut(PID.ranger, '2026-07-15', 'overseas')).toBe(true)
    expect(poLines(PID.hunter, PID.ranger).map(n => n.u)).toEqual(['u142'])
    expect(poLines(PID.kestrel, PID.ranger)).toEqual([])
  })
})

describe('a holiday’s line: told to the one audience, stamped with its squadron', () => {
  it('a 149 holiday with an input to answer: Kestrel and Saber told, each stamped 149 (red: Saber was not told)', () => {
    signInAs('kestrel')
    expect(commitInput(null, draftOf({ person: PID.osprey, type: 'Training', title: 'Range 149', date: 'Jul 17', yr: 2026, allday: false, s: 540, e: 720, remarks: '' } as any), [PID.osprey])).toBe(true)
    expect(holidayAdd({ kind: 'ph', name: 'National Day', from: '2026-07-17', to: '2026-07-17' }).ok).toBe(true)
    const told = NOTICES.filter(n => n.name === 'National Day')
    expect(told.map(n => n.to).sort()).toEqual([PID.kestrel, PID.saber].sort())
    expect(told.every(n => n.u === 'u149')).toBe(true)
  })
})

describe('an input’s line and a war line carry their squadron', () => {
  it("Kestrel files Osprey's input: Osprey's line is stamped 149", () => {
    signInAs('kestrel')
    expect(commitInput(null, draftOf({ person: PID.osprey, type: 'Training', title: 'Sim', date: 'Jul 20', yr: 2026, allday: false, s: 540, e: 720, remarks: '' } as any), [PID.osprey])).toBe(true)
    signInAs('saber')
    const mine = NOTICES.filter(n => n.to === PID.osprey && n.name === 'Sim')
    expect(mine.length).toBe(1)
    expect(mine[0]!.u).toBe('u149')
  })
})

describe('the gate: a new line’s stamp is the squadron the command acts in', () => {
  const env = (changes: any[], type: string): any => ({ seq: 1, at: '', origin: 'local', scope: { module: 'people' }, type, actor: deriveActor(), changes })
  it("a new input line stamped with another squadron than its input's, or with none, is refused; stamped with it, it rides", () => {
    signInAs('kestrel')
    expect(commitInput(null, draftOf({ person: PID.osprey, type: 'Training', title: 'Sim', date: 'Jul 20', yr: 2026, allday: false, s: 540, e: 720, remarks: '' } as any), [PID.osprey])).toBe(true)
    const r: any = INPUTS.find((x: any) => x.title === 'Sim')
    const ch = { op: 'put', collection: 'inputs', id: r.iid, before: { ...r }, after: { ...r, remarks: 'new words' } }
    const ln = (u?: string) => ({ op: 'put', collection: 'notices', id: 'nstamp', before: null, after: { id: 'nstamp', to: PID.osprey, by: PID.kestrel, at: Date.now(), iid: r.iid, name: 'Sim', day: '2026-07-20', what: [{ k: 'rmk' }], ...(u ? { u } : {}) } })
    expect(ownershipViolation(env([ch, ln('u142')], 'inputs.write'))).toMatch(/bell line not as the pass writes it/)
    expect(ownershipViolation(env([ch, ln()], 'inputs.write'))).toMatch(/bell line not as the pass writes it/)
    expect(ownershipViolation(env([ch, ln('u149')], 'inputs.write'))).toBeNull()
  })
  it('a real posting line rewritten to another stamp is refused', () => {
    signInAs('kestrel')
    expect(postOut(PID.osprey, '2026-07-15', 'overseas')).toBe(true)
    const n = poLines(PID.kestrel, PID.osprey)[0]!
    expect(ownershipViolation(env([{ op: 'put', collection: 'notices', id: n.id, before: n, after: { ...n, u: 'u142' } }], 'inputs.write')))
      .toMatch(/bell line not as the pass writes it/)
  })
})
