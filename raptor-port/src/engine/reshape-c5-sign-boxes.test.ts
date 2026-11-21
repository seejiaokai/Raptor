// @vitest-environment jsdom
/* C5 (Fable F3b, Opus F1 step 5): the sign-off boxes (publish.ts signPeople) offer the squadron's people on TODAY, not on
   the day being signed. The claim's "correct": a man who is 149's on Friday is not offered to sign 142's Friday, and 149's
   Friday offers him. NOTE: no ruling says whether a signer is judged on the day signed or on the day of signing (D2184
   speaks of a detachment's boxes: "anyone of its own squadron").
   — ANSWERED by D2243 (Q2): the day's own people, as the crew list beside them.
   Copied word for word from docs/superpowers/briefs/2026-11-20-multi-sqn-b1-repro/c-c05-sign-boxes-read-today.test.ts.txt
   — only the harness changed (test-support/msq-world.ts; its world boots itself, so `boot()` goes) and the one call the
   reshape renames: `signPeople` takes the day it signs (the reshape plan §12 Q2 — `signPeople(schedOnly, keep, di)`),
   Friday's (di 4).

   R8 (the blind read's Opus F8; D2245, 21 Nov 26): SKED CK, PLANNED BY and APPROVED BY (the boxes needing the Scheduler
   tick) also offer, AFTER that day's own people, an admin holding Plan of the squadron while his Plan holds that day and
   a master admin, each carrying the Scheduler tick; CUR CK stays the day's own people. Written here, red first. */
import { useMsqWorld, at, signInAs, ACCT, PID } from '../test-support/msq-world'
import { describe, expect, it } from 'vitest'
import { signPeople } from '../engine/publish'
import { UNIT } from '../engine/unitview'
import { CURWEEK } from '../engine/waves'
import { dayIso } from '../engine/verid'
import { PEOPLE } from '../engine/people'
import { rosterOf } from '../engine/roster'
import { setHome, setGrant } from '../state/units'
import { levelIn } from '../state/accounts'
import { switchUnit } from '../state/store'
import '../state/sign-more'   // as ui/html.ts, the boxes' builder, loads it

useMsqWorld()

describe('C5 — sign-off boxes across a move', () => {
  it("142's Friday 17 Jul does not offer a man who is 149's from 15 Jul", () => {
    at('2026-07-14')
    signInAs('ad', 'a')
    expect(UNIT).toBe('u142')
    expect(signPeople(false, undefined, 4), 'control: offered before the move').toContain('bane')
    expect(setHome('bane', 'u149').ok).toBe(true)
    /* signPeople takes no day: the boxes of every 142 day this week read this one list */
    expect(signPeople(false, undefined, 4), "Friday's boxes").not.toContain('bane')
  })
  it("…while Tuesday 14 Jul, still his 142 day, offers him, and 149's Friday does", () => {
    at('2026-07-14')
    signInAs('saber')
    expect(setHome('bane', 'u149').ok).toBe(true)            // 149's from 15 Jul
    expect(signPeople(false, undefined, 1), "142's Tuesday").toContain('bane')
    switchUnit('u149')
    expect(signPeople(false, undefined, 4), "149's Friday").toContain('bane')
    expect(signPeople(false, undefined, 1), "149's Tuesday").not.toContain('bane')
  })
})

const week = () => [0, 1, 2, 3, 4, 5, 6].map(di => dayIso(String(CURWEEK), di))
/* the day's own people as the box would list them (no Plan holder, no master admin from elsewhere) */
const own = (unit: string, di: number, sched: boolean) =>
  rosterOf(unit, dayIso(String(CURWEEK), di)).filter(id => {
    const p = (PEOPLE as any)[id]
    return !p.special && !p.archived && (!sched || !!(p.quals && p.quals.sched))
  })

describe('R8 — a Plan holder and a master admin in the scheduler boxes (D2245)', () => {
  it('149\'s SKED CK, PLANNED BY and APPROVED BY offer Hunter (Plan of 149, Scheduler tick) and Saber (master admin), after 149\'s own; CUR CK does not', () => {
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok).toBe(true)
    ;(PEOPLE as any)[PID.hunter].quals.sched = true
    expect((PEOPLE as any)[PID.saber].quals.sched, 'Saber carries the Scheduler tick').toBe(true)
    switchUnit('u149')
    const held = week().map(iso => levelIn(ACCT.hunter, 'u149', iso) === 'admin')
    expect(held.some(Boolean), 'his Plan holds on some day of the week').toBe(true)
    for (let di = 0; di < 7; di++) {
      const list = signPeople(true, undefined, di)
      const mine = own('u149', di, true)
      expect(list.slice(0, mine.length), `day ${di}: 149's own people first`).toEqual([...mine].sort((a, b) => (PEOPLE as any)[a].cs.localeCompare((PEOPLE as any)[b].cs)))
      expect(list.includes(PID.saber), `day ${di}: the master admin`).toBe(true)
      expect(list.includes(PID.hunter), `day ${di}: Hunter, while his Plan holds`).toBe(held[di])
      expect(signPeople(false, undefined, di).some(id => id === PID.saber || id === PID.hunter), `day ${di}: CUR CK stays 149's own`).toBe(false)
    }
  })
  it('without the Scheduler tick a Plan holder is not offered; with no Plan at all, never', () => {
    signInAs('saber')
    ;(PEOPLE as any)[PID.hunter].quals.sched = false
    switchUnit('u149')
    expect(signPeople(true, undefined, 3), 'no Plan').not.toContain(PID.hunter)
    expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok).toBe(true)
    expect(signPeople(true, undefined, 3), 'Plan, but no Scheduler tick').not.toContain(PID.hunter)
  })
  it('a View holder is never offered, ticked or not', () => {
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u149', 'view', PID.hunter).ok).toBe(true)
    ;(PEOPLE as any)[PID.hunter].quals.sched = true
    switchUnit('u149')
    for (let di = 0; di < 7; di++) expect(signPeople(true, undefined, di), `day ${di}`).not.toContain(PID.hunter)
  })
  it('his Plan ended by his own move (D2203): offered on 149\'s days before his move day, his own from it — never twice', () => {
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok).toBe(true)
    ;(PEOPLE as any)[PID.hunter].quals.sched = true
    expect(setHome(PID.hunter, 'u149').ok).toBe(true)        // 149's from Thu 16 Jul
    switchUnit('u149')
    const isos = week()
    for (let di = 0; di < 7; di++) {
      const list = signPeople(true, undefined, di)
      expect(list.filter(id => id === PID.hunter).length, `day ${di}`).toBeLessThanOrEqual(1)
      const ownDay = rosterOf('u149', isos[di]!).includes(PID.hunter)
      const plan = levelIn(ACCT.hunter, 'u149', isos[di]!) === 'admin'
      expect(list.includes(PID.hunter), `day ${di}: offered exactly while his Plan holds or he is 149's own`).toBe(ownDay || plan)
    }
    expect(signPeople(true, undefined, 4), "149's Friday: his own").toContain(PID.hunter)
    expect(signPeople(false, undefined, 4), "149's Friday, CUR CK: his own").toContain(PID.hunter)
  })
})
