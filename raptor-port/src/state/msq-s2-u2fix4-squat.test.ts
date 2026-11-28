// @vitest-environment jsdom
/* U2 FIX ROUND 4, PART 1 — A MOVE'S FIXED ID SQUATTED BY AN ORDINARY LINE (the security reader's proof 1, the Opus
   reader's proof 1 and Fable's proof 2 of round 3's read, every case kept; the host reproduced each on the tip).

   "Told once" (round 3, fix 5 — acctlines.ts moveTold) judged a move told on the bare id of any stored bell line: one
   starting with the squadron line's fixed id less its reader, or equal to the mover's own line's. And the gate never asked
   the id of a line a signed-in person writes. So three roads put an ordinary line under a move's id BEFORE the move, and
   at midnight 149's admins (Kestrel, Saber) were never told "Plan of 149 ended: he moved to 150":
   - A: Ranger (142 member) edits his own leave Saber filed — the line it owes Saber saved under the move's id;
   - B: Mako (150's admin) ends Hunter's View of 150 — the line owed Hunter saved under it;
   - C: Hunter (142 admin, Plan of 149) suspends Ranger by a hand-made command — "Suspended" saved under it.
   The fix, both parts: moveTold counts a stored line only where it IS that move's line, as writeMoveLines writes it; and
   the gate refuses a line a person puts under any id the app gives its own lines (perms.ts reservedLineIdViolation).
   Where a reader's proof asserted the squat was STORED (its premise on the old code), the case now asserts the gate
   refuses it — and still that 149's admins are told. The cases headed "already stored" put the squat straight on the
   bell, as no door can now, to hold part 1 by itself. Written before the fix: the attack cases failed on the tip. */
import { beforeEach, describe, expect, it } from 'vitest'
import { withThird, signInAs, moveMan, pastMidnight, on, PID, ACCT, third } from '../test-support/msq-world'
import { accountById, accountsLoad, saveAccess, signIn, sessionFor, ACCOUNT_PFX } from './accounts'
import { unitsLoad, todayIso } from './units'
import { NOTICES, type Notice } from './notices'
import { writeInputsBatch } from './store'
import { INPUTS } from '../engine/inputs'
import { me } from './perms'
import { setSession, setMe, SESSION } from './auth'
import { commitSettingsIntent } from './people-settings-commit'
import { HOOKS, store } from '../engine/hooks'
import { PEOPLE } from '../engine/people'
import { moveTold, planMovesOwed, planMovedLineId, movedLineId } from './acctlines'

withThird()
beforeEach(() => { NOTICES.length = 0 })
const reload = (): void => { unitsLoad(); accountsLoad() }
const DAY = '2026-07-16'
const isHuntersMove = (n: Notice): boolean => {
  const p: any = n.what?.[0]
  return p?.k === 'sqplan' && p.who === PID.hunter && p.c === 'moved' && n.u === 'u149' && n.day === DAY
}
const audience = (): string[] => NOTICES.filter(isHuntersMove).map(n => String(n.to)).sort()
const READERS = (): string[] => [PID.kestrel, PID.saber].sort()
const SQ_X = (): string => `sqplan:mv:${ACCT.hunter}:${DAY}:u149:x`
const OWN = (): string => `acct:mv:${ACCT.hunter}:${DAY}:planEnd:u149`
const REFUSED = /an id only the app gives its own lines/
/* every family of ids the app gives its own lines (perms.ts APP_LINE_IDS), one example each */
const RESERVED = (): string[] => [SQ_X(), OWN(), 'pofail:hunter@2026-07-16:overseas:kes9', 'lwend:w1:2026-07-01:2026-07-05', `po:${PID.ranger}:2026-07-16`]

/* ---- the security reader's proof 1 (route A) ---- */
function moveHunter(): void {
  const s = SESSION
  setSession(sessionFor(signIn('ad', 'a'))); setMe(PID.saber)
  expect(moveMan(PID.hunter, third.u150), 'setup: Saber moves Hunter (Plan of 149) to 150 from the 16th').toMatchObject({ ok: true })
  setSession(s); reload()
}
/* Saber files a leave for Ranger; Ranger then edits it (Saber is told, as its filer) */
function rangerEditsHisLeave(decoyId: string | null): boolean {
  signInAs('saber')
  const admin = me()!
  const IID = 'sec-u2f3-in-1'
  expect(writeInputsBatch(() => {
    INPUTS.push({ person: PID.ranger, date: 'Jul 25', yr: 2026, allday: true, type: 'LL', remarks: 'x', by: admin, at: Date.now(), iid: IID, ord: 99971 } as any)
  }), 'setup: Saber files a leave for Ranger').toBe(true)
  signInAs('ranger')
  const self = me()!
  expect(writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === IID) as any).remarks = 'y' }), 'setup: Ranger edits his leave').toBe(true)
  const honest: any = NOTICES.find(n => n.to === admin && n.iid === IID && n.by === self)
  expect(honest, 'setup: the honest line Ranger\'s edit writes to Saber').toBeTruthy()
  if (decoyId == null) return true
  return writeInputsBatch(() => {
    (INPUTS.find((x: any) => x.iid === IID) as any).remarks = 'z'
    NOTICES.push({ ...honest, id: decoyId, at: Date.now() } as any)
  })
}

describe('security 1 — a move\'s fixed id squatted by an ordinary line', () => {
  it('control: with no squatter, 149\'s admins are told Hunter\'s Plan of 149 ended by his move', () => {
    rangerEditsHisLeave(null)
    moveHunter()
    pastMidnight()
    expect(audience()).toEqual(READERS())
  })
  it('Ranger\'s ordinary line carrying `sqplan:mv:<Hunter>:<day>:u149:x` — refused, and 149\'s admins are still told', () => {
    const ok = rangerEditsHisLeave(SQ_X())
    const stored = NOTICES.some(n => n.id === SQ_X())
    moveHunter()
    pastMidnight()
    expect({ squatterStored: ok && stored, told: audience() }).toEqual({ squatterStored: false, told: READERS() })
  })
  it('…or the mover\'s own line id `acct:mv:<Hunter>:<day>:planEnd:u149` — refused, and 149\'s admins are still told', () => {
    const ok = rangerEditsHisLeave(OWN())
    const stored = NOTICES.some(n => n.id === OWN())
    moveHunter()
    pastMidnight()
    expect({ squatterStored: ok && stored, told: audience() }).toEqual({ squatterStored: false, told: READERS() })
  })
})

/* ---- the Opus reader's proof 1 (route B) ---- */
function moveHunterElsewhere(back: string): void {
  const s = SESSION
  setSession(sessionFor(signIn('ad', 'a'))); setMe(PID.saber)
  expect(moveMan(PID.hunter, third.u150), 'setup: Saber moves Hunter to 150 from the 16th').toMatchObject({ ok: true })
  setSession(s); setMe(back); reload()
}
function makoEndsHuntersView(forge: boolean): string | null {
  on(15, 9)
  signInAs('mako'); reload()
  const forged = movedLineId(ACCT.hunter, DAY, { k: 'acct', c: 'planEnd', u: 'u149' } as any)
  const push = NOTICES.push
  if (forge) {
    (NOTICES as any).push = function (...items: any[]) {
      for (const n of items) if (n && String(n.to) === PID.hunter && n.what?.[0]?.k === 'acct') n.id = forged
      return push.apply(this, items)
    }
  }
  let r: string | null
  try {
    r = saveAccess(ACCT.hunter, { grants: { [third.u150]: 'none' } })
  } finally { (NOTICES as any).push = push }
  reload()
  if (!forge) expect(r, 'Mako ends Hunter\'s View of 150').toBeNull()
  return r
}

describe('opus proof 1 — a move pre-told by a forged line id', () => {
  it('control: no forgery — 149\'s admins are told of Hunter\'s move at the wake', () => {
    makoEndsHuntersView(false)
    moveHunterElsewhere(PID.mako)
    pastMidnight()
    expect(audience()).toEqual(READERS())
  })
  it('Mako\'s line forged with the move\'s id: refused, and 149\'s admins are still told "Plan of 149 ended: he moved to 150"', () => {
    const r = makoEndsHuntersView(true)
    expect(r, 'the gate refuses the line under the move\'s id').not.toBeNull()
    expect(NOTICES.some(n => n.id === OWN()), 'nothing stored under the forged id').toBe(false)
    moveHunterElsewhere(PID.mako)
    expect(moveTold(ACCT.hunter, DAY, 'u149', NOTICES), 'the move does not read as told before it has happened').toBe(false)
    pastMidnight()
    pastMidnight()
    expect(audience(), 'Kestrel and Saber, 149\'s readers on the 16th').toEqual(READERS())
  })
})

/* ---- Fable's proof 2 (route C) ---- */
/* the move saved by Saber on another device — the signed-in session kept */
function saberMovesHunter(back: string): void {
  const s = SESSION
  setSession(sessionFor(signIn('ad', 'a'))); setMe(PID.saber)
  expect(moveMan(PID.hunter, third.u150), 'setup: Saber moves Hunter (Plan of 149) to 150 from the 16th').toMatchObject({ ok: true })
  setSession(s); setMe(back); reload()
}
/* Hunter suspends Ranger (142's member — his own squadron's man) by a command made by hand: the row the Suspend button
   writes, and the "Suspended · Hunter" line that change owes Ranger — stored under the id handed in */
function hunterSuspendsRangerLineUnder(id: string): any {
  const row: any = store.get(ACCOUNT_PFX + ACCT.ranger, null)
  expect(row, 'setup: Ranger\'s stored account row').toBeTruthy()
  const r: any = commitSettingsIntent('account.update', null, (txn: any) => {
    store.set(ACCOUNT_PFX + ACCT.ranger, { ...row, on: false })
    HOOKS.bellEnlist(txn)
    NOTICES.push({ id, to: PID.ranger, by: PID.hunter, at: Date.now(), iid: '', name: String((PEOPLE as any)[PID.ranger].cs), day: todayIso(), what: [{ k: 'acct', c: 'off' }] } as Notice)
    HOOKS.bellEnd()
  })
  reload()
  return r
}

describe('fable 2 — a move marked "told" before its day by an ordinary account line stored under the move\'s id', () => {
  it('control: untouched, the midnight wake tells 149\'s readers of Hunter\'s move', () => {
    on(15, 10); signInAs('hunter'); reload()
    saberMovesHunter(PID.hunter)
    pastMidnight()
    expect(audience()).toEqual(READERS())
  })
  it('the gate must not pass an account line stored under a move line\'s id', () => {
    on(15, 10); signInAs('hunter'); reload()
    saberMovesHunter(PID.hunter)
    const id = planMovedLineId(ACCT.hunter, DAY, 'u149', 'x')
    const r = hunterSuspendsRangerLineUnder(id)
    expect({ ok: r.ok, stored: NOTICES.some(n => n.id === id), rangerOn: accountById(ACCT.ranger)!.on },
      `the gate answered: ${r.message ?? 'ok'}`).toEqual({ ok: false, stored: false, rangerOn: true })
  })
  it('what it leaves: Hunter\'s move is "told" a day early, and at midnight 149\'s admins are written nothing', () => {
    on(15, 10); signInAs('hunter'); reload()
    saberMovesHunter(PID.hunter)
    const r = hunterSuspendsRangerLineUnder(planMovedLineId(ACCT.hunter, DAY, 'u149', 'x'))
    const toldEarly = moveTold(ACCT.hunter, DAY, 'u149', NOTICES)
    pastMidnight()
    const owedAfter = planMovesOwed().filter(o => o.part.who === PID.hunter).length
    pastMidnight()
    expect({ forgedPassed: r.ok !== false, toldEarly, owedAfter, audience: audience() },
      'Kestrel and Saber read 149\'s admin lines on the 16th and must be told "Plan of 149 ended: he moved to 150"')
      .toEqual({ forgedPassed: false, toldEarly: false, owedAfter: 0, audience: READERS() })
  })
  it('…the same under the mover\'s own line\'s id: neither Hunter nor 149\'s admins are written a line of the move', () => {
    on(15, 10); signInAs('hunter'); reload()
    saberMovesHunter(PID.hunter)
    const own = movedLineId(ACCT.hunter, DAY, { k: 'acct', c: 'planEnd', u: 'u149' })
    const r = hunterSuspendsRangerLineUnder(own)
    pastMidnight()
    const huntersOwn = NOTICES.filter(n => n.id === own && String(n.to) === PID.hunter).length
    expect({ forgedPassed: r.ok !== false, audience: audience(), huntersOwn },
      'the move\'s lines: 149\'s readers theirs, Hunter his own')
      .toEqual({ forgedPassed: false, audience: READERS(), huntersOwn: 1 })
  })
})

/* ---- part 1 alone: the squat already on the bell (as no door can now put it there) ---- */
describe('U2 fix 4, part 1 — moveTold asks what the stored line is, not only its id', () => {
  /* the three readers' ordinary lines, each as its door wrote it, under the move's ids */
  const squats = (): Array<[string, Notice]> => {
    const at = Date.now(), day = todayIso()
    const ranger = String((PEOPLE as any)[PID.ranger].cs), hunter = String((PEOPLE as any)[PID.hunter].cs)
    return [
      ['a member\'s input line to Saber', { id: SQ_X(), to: PID.saber, by: PID.ranger, at, iid: 'sq-in', name: ranger, day, what: [{ k: 'input' } as any] } as Notice],
      ['an admin\'s "View of 150 ended" to Hunter', { id: OWN(), to: PID.hunter, by: PID.mako, at, iid: '', name: hunter, day, what: [{ k: 'acct', c: 'viewEnd', u: third.u150, num: '150' } as any] } as Notice],
      ['an admin\'s "Suspended" to Ranger', { id: SQ_X(), to: PID.ranger, by: PID.hunter, at, iid: '', name: ranger, day, what: [{ k: 'acct', c: 'off' } as any] } as Notice],
      /* (…and a line of the right kind but not the move's: a Plan ENDED by hand, signed, under the squadron id) */
      ['a signed "Plan of 149 ended" under the squadron id', { id: SQ_X(), to: PID.kestrel, by: PID.saber, at, iid: '', name: hunter, day: DAY, what: [{ k: 'sqplan', who: PID.hunter, c: 'ended', num: '149' } as any], u: 'u149' } as Notice],
    ]
  }
  for (let i = 0; i < 4; i++) {
    it(`case ${i + 1}: a squat stored before the move does not mark it told — 149's admins are told`, () => {
      on(15, 10); signInAs('hunter'); reload()
      saberMovesHunter(PID.hunter)
      const [what, n] = squats()[i]!
      NOTICES.push(n)
      expect(moveTold(ACCT.hunter, DAY, 'u149', NOTICES), `${what}: not the move's line`).toBe(false)
      pastMidnight()
      expect(audience(), what).toEqual(READERS())
      expect(moveTold(ACCT.hunter, DAY, 'u149', NOTICES), 'once the app has told it, it is told').toBe(true)
    })
  }
  it('the app\'s own lines still mark the move told: each one alone, and a second wake writes nothing', () => {
    on(15, 10); signInAs('hunter'); reload()
    saberMovesHunter(PID.hunter)
    pastMidnight()
    const sq = NOTICES.filter(isHuntersMove), own = NOTICES.filter(n => n.id === OWN())
    expect({ readers: audience(), own: own.length }, 'the honest telling: both readers, and Hunter\'s own line').toEqual({ readers: READERS(), own: 1 })
    expect(own[0]!.what[0], 'the mover\'s own line as the writer writes it').toMatchObject({ k: 'acct', c: 'planEnd', u: 'u149', why: 'moved' })
    for (const n of sq) expect(n.id, 'each squadron line its fixed id').toBe(planMovedLineId(ACCT.hunter, DAY, 'u149', String(n.to)))
    expect(moveTold(ACCT.hunter, DAY, 'u149', own), 'the mover\'s own line alone').toBe(true)
    expect(moveTold(ACCT.hunter, DAY, 'u149', sq.slice(0, 1)), 'one squadron line alone').toBe(true)
    expect(moveTold(ACCT.hunter, DAY, 'u149', own.map(n => ({ ...n, by: PID.saber }))), 'signed by a person: not the app\'s line').toBe(false)
    expect(moveTold(ACCT.hunter, DAY, 'u149', own.map(n => ({ ...n, to: PID.kestrel }))), 'to another man: not the mover\'s own').toBe(false)
    expect(moveTold(ACCT.hunter, DAY, 'u149', sq.map(n => ({ ...n, what: [{ ...(n.what[0] as any), who: PID.ranger }] }))), 'about another man: not this move').toBe(false)
    const n0 = NOTICES.length
    pastMidnight()
    expect(NOTICES.length, 'the next wake').toBe(n0)
  })
})

/* ---- part 2: the gate refuses a person's line under any id the app gives its own lines ---- */
describe('U2 fix 4, part 2 — a person\'s line under an id only the app gives', () => {
  it('a member (Ranger, his own leave\'s line to its filer copied under a reserved id) — refused for every family', () => {
    rangerEditsHisLeave(null)
    const IID = 'sec-u2f3-in-1'
    const honest: any = NOTICES.find(n => n.to === PID.saber && n.iid === IID && n.by === PID.ranger)
    let k = 0
    const edit = (id: string | null): boolean => writeInputsBatch(() => {
      (INPUTS.find((x: any) => x.iid === IID) as any).remarks = `m${++k}`
      NOTICES.push({ ...honest, id: id ?? `${honest.id}c${k}`, at: Date.now() } as any)
    })
    expect(edit(null), 'control: the copy under a minted id goes through').toBe(true)
    for (const id of RESERVED()) {
      expect({ ok: edit(id), stored: NOTICES.some(n => n.id === id) }, id).toEqual({ ok: false, stored: false })
    }
  })
  it('an admin\'s account line (Hunter suspends Ranger) — refused for every reserved family, by name', () => {
    on(15, 10); signInAs('hunter'); reload()
    for (const id of RESERVED()) {
      const r = hunterSuspendsRangerLineUnder(id)
      expect({ ok: r.ok, why: String(r.message ?? '') }, id).toEqual({ ok: false, why: expect.stringMatching(REFUSED) })
      expect({ stored: NOTICES.some(n => n.id === id), rangerOn: accountById(ACCT.ranger)!.on }, id).toEqual({ stored: false, rangerOn: true })
    }
  })
  it('an admin\'s input line (Saber edits Ranger\'s leave; the line it owes Ranger copied under a reserved id) — refused for every family', () => {
    rangerEditsHisLeave(null)
    signInAs('saber')
    const self = me()!
    const IID = 'sec-u2f3-in-1'
    expect(writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === IID) as any).remarks = 'v' }), 'setup: Saber edits Ranger\'s leave').toBe(true)
    const honest: any = NOTICES.find(n => n.to === PID.ranger && n.iid === IID && n.by === self)
    expect(honest, 'setup: the honest line Saber\'s edit writes to Ranger').toBeTruthy()
    let k = 0
    const edit = (id: string | null): boolean => writeInputsBatch(() => {
      (INPUTS.find((x: any) => x.iid === IID) as any).remarks = `w${++k}`
      NOTICES.push({ ...honest, id: id ?? `${honest.id}c${k}`, at: Date.now() } as any)
    })
    expect(edit(null), 'control: the copy under a minted id goes through').toBe(true)
    for (const id of RESERVED()) {
      expect({ ok: edit(id), stored: NOTICES.some(n => n.id === id) }, id).toEqual({ ok: false, stored: false })
    }
  })
  it('control: the same commands with the ids the app mints go through', () => {
    expect(rangerEditsHisLeave(null)).toBe(true)
    on(15, 10); signInAs('hunter'); reload()
    const r = hunterSuspendsRangerLineUnder('n-honest-suspend-1')
    expect({ ok: r.ok, why: r.message ?? '' }).toEqual({ ok: true, why: '' })
    expect(accountById(ACCT.ranger)!.on, 'Ranger suspended').toBe(false)
  })
})
