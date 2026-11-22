// @vitest-environment jsdom
/* CORE LINE 4 (helper "corelines", 22 Nov 26). The transfer's rule — his D2160, D2162 (scheduler.md §Not built yet): "on
   the date he joins as a member, his access, admin rights and Scheduler tick in the old squadron end". The tick rides
   the person, so SKED CK, PLANNED BY and APPROVED BY of the squadron he joined still offered a moved-in man carrying it
   (engine/publish.ts signPeople). It is read now as the admin role is (K3, units-model.ts adminRoleHolds): the tick counts
   in the squadron it was given in, until the start of his move day; in the squadron he joins he signs CUR CK as one of
   the day's people (D2243 Q2) and no scheduler's box, until one of its admins gives him the tick there. */
import { useMsqWorld, signInAs, on, moveMan, PID } from '../test-support/msq-world'
import { describe, expect, it } from 'vitest'
import { signPeople } from './publish'
import { PEOPLE } from './people'
import { UNIT } from './unitview'
import { switchUnit } from '../state/store'
import { updatePersonField } from '../state/quals-write'
import '../state/sign-more'   // as ui/html.ts, the boxes' builder, loads it

useMsqWorld()

const H = PID.hunter, K = PID.kestrel
const WED = 2, THU = 3, FRI = 4
const tick = (pid: string, v: boolean) => { (PEOPLE as any)[pid].quals.sched = v }

describe('the Scheduler tick counts in the squadron it was given in (D2160)', () => {
  it('Hunter, carrying the tick, moved to 149 from Thu 16: 149\'s scheduler boxes do not offer him; CUR CK does', () => {
    signInAs('saber')
    tick(H, true)
    expect(moveMan(H, 'u149')).toMatchObject({ ok: true })
    switchUnit('u149')
    expect(UNIT).toBe('u149')
    for (const di of [THU, FRI]) {
      expect(signPeople(true, undefined, di), `149's day ${di}: SKED CK, PLANNED BY, APPROVED BY`).not.toContain(H)
      expect(signPeople(false, undefined, di), `149's day ${di}: CUR CK — one of the day's people`).toContain(H)
    }
  })
  it('control: until his move day his tick holds in 142 — Wed 15 offers him, and 142\'s Thu 16 no longer does', () => {
    signInAs('saber')
    tick(H, true)
    expect(moveMan(H, 'u149')).toMatchObject({ ok: true })
    expect(UNIT).toBe('u142')
    expect(signPeople(true, undefined, WED), "142's Wed 15").toContain(H)
    expect(signPeople(true, undefined, THU), "142's Thu 16").not.toContain(H)
  })
  it('control: a 149 man who never moved, given the tick, is offered in 149\'s scheduler boxes', () => {
    signInAs('saber')
    tick(K, true)
    switchUnit('u149')
    expect(signPeople(true, undefined, FRI)).toContain(K)
  })
  it('a name already signed stays offered (the box never blanks a signature by itself)', () => {
    signInAs('saber')
    tick(H, true)
    expect(moveMan(H, 'u149')).toMatchObject({ ok: true })
    switchUnit('u149')
    expect(signPeople(true, H, FRI)).toContain(H)
  })
  it('given the tick anew by 149\'s admin once he has arrived, he is offered there', () => {
    signInAs('saber')
    tick(H, true)
    expect(moveMan(H, 'u149')).toMatchObject({ ok: true })
    on(16)
    signInAs('kestrel')
    expect(UNIT).toBe('u149')
    expect(signPeople(true, undefined, FRI), 'arrived, not yet given it').not.toContain(H)
    expect(updatePersonField(H, { tick: 'sched' }), 'unticked').toBeNull()
    expect(updatePersonField(H, { tick: 'sched' }), 'ticked anew').toBeNull()
    expect((PEOPLE as any)[H].quals.sched).toBe(true)
    expect(signPeople(true, undefined, FRI), 'given in 149').toContain(H)
    expect(signPeople(true, undefined, THU), 'and on his arrival day').toContain(H)
  })
})
