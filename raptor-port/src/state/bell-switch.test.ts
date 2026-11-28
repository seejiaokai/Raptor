// @vitest-environment jsdom
/* STEP F, ITEM 3 — THE BELL'S "SHOW 142 149" SWITCH (batch 1's second half, docs/superpowers/plans/2026-11-22-multi-sqn-b1-
   second-half.md §7 item 3, §15 D6, §16 D5′; his D2198, D2202). `bellsqn:<pid>` holds only his own choices; a squadron
   never switched takes the default — his home on, a Plan squadron on, a master admin's other squadrons off. Read in
   notices.ts noticeLive, the one body behind the list, the unread count and "Mark all read"; never of a line about him.
   Written only by him, by `bell.squadrons`, never an Undo step. Red first: with noticeLive's switch line taken out, the
   hiding cases fail (the host's run). The world: test-support/msq-world.ts — Wed 15 Jul 26. */
import { describe, expect, it } from 'vitest'
import { postOut } from '../leavewar/sync'
import { setGrant } from './units'
import { NOTICES, noticesFor } from './notices'
import { unreadFor, markAllNoticesRead } from './noticeseen'
import { bellShows, setBellSquadron, bellChoices } from './bellsqn'
import { ownershipViolation } from './perms'
import { deriveActor } from '../command'
import { commitInput, draftOf } from '../ui/inputedit'
import { globalUndo } from '../undo'
import { useMsqWorld, signInAs, ACCT, PID } from '../test-support/msq-world'

useMsqWorld()

const ospreyPosted = () => {
  signInAs('kestrel')
  expect(postOut(PID.osprey, '2026-07-15', 'overseas')).toBe(true)
}
const shownTo = (pid: string) => noticesFor(pid).filter(n => (n.what || []).some((p: any) => p.k === 'po' && p.who === PID.osprey))
const storedFor = (pid: string) => NOTICES.filter(n => n.to === pid && (n.what || []).some((p: any) => p.k === 'po' && p.who === PID.osprey))

describe('a master admin: his home on, his other squadrons off until he switches them on (D2198)', () => {
  it("149's posting line is stored on Saber's bell but hidden, and lights nothing; switched on it shows unread; off again it hides, still stored", () => {
    ospreyPosted()
    signInAs('saber')
    expect(storedFor(PID.saber).length, 'told (§7 item 2)').toBe(1)
    expect(bellShows(PID.saber, 'u149'), 'off by default').toBe(false)
    expect(shownTo(PID.saber), 'not listed').toEqual([])
    expect(unreadFor(PID.saber), 'lights nothing').toBe(0)
    expect(setBellSquadron('u149', true), 'Saber switches 149 on').toBe(true)
    expect(shownTo(PID.saber).length).toBe(1)
    expect(unreadFor(PID.saber), 'unread').toBe(1)
    expect(setBellSquadron('u149', false)).toBe(true)
    expect(shownTo(PID.saber)).toEqual([])
    expect(storedFor(PID.saber).length, 'kept, not deleted').toBe(1)
    expect(bellChoices(PID.saber), 'only his own choice is saved').toEqual({ u149: false })
  })
})

describe('a Plan holder: his Plan squadron on by default (D2202), his to switch off', () => {
  it("Hunter with Plan of 149 sees 149's line; switched off, Mark all read does not read it; switched on, it is unread", () => {
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok).toBe(true)
    ospreyPosted()
    signInAs('hunter')
    expect(shownTo(PID.hunter).length, 'on by default').toBe(1)
    expect(setBellSquadron('u149', false)).toBe(true)
    expect(shownTo(PID.hunter)).toEqual([])
    markAllNoticesRead()
    expect(setBellSquadron('u149', true)).toBe(true)
    expect(unreadFor(PID.hunter), 'what was off when he marked all read is still unread').toBe(1)
  })
})

describe('never a line about him (§16 D5′)', () => {
  it("Ranger switches his home 142 off: his own input's line stays; the switch itself is his own choice", () => {
    signInAs('hunter')
    expect(commitInput(null, draftOf({ person: PID.ranger, type: 'Training', title: 'Range', date: 'Jul 20', yr: 2026, allday: false, s: 540, e: 720, remarks: '' } as any), [PID.ranger])).toBe(true)
    signInAs('ranger')
    const mine = () => noticesFor(PID.ranger).filter(n => n.name === 'Range')
    expect(mine().length).toBe(1)
    expect(setBellSquadron('u142', false)).toBe(true)
    expect(mine().length, 'a line about him stays').toBe(1)
  })
})

describe('written only by him, by its one command, never an Undo step', () => {
  const env = (changes: any[], type: string): any => ({ seq: 1, at: '', origin: 'local', scope: { module: 'settings' }, type, actor: deriveActor(), changes })
  const put = (id: string, after: any, before: any = null) => ({ op: 'put', collection: 'settings', id, before, after })
  it("Saber (a master admin) cannot set Hunter's switch; nobody writes one under another command", () => {
    signInAs('saber')
    expect(ownershipViolation(env([put(`bellsqn:${PID.hunter}`, { u149: false })], 'bell.squadrons'))).toMatch(/another person's bell switch/)
    expect(ownershipViolation(env([put(`bellsqn:${PID.saber}`, { u149: true })], 'inputs.write'))).toMatch(/another person's bell switch/)
    expect(ownershipViolation(env([put(`bellsqn:${PID.saber}`, { u149: true })], 'bell.squadrons'))).toBeNull()
  })
  it('a member writes his own; a squadron not in the store, a value not on / off, or a removal is refused', () => {
    signInAs('osprey')
    expect(ownershipViolation(env([put(`bellsqn:${PID.osprey}`, { u149: false })], 'bell.squadrons'))).toBeNull()
    expect(ownershipViolation(env([put(`bellsqn:${PID.ranger}`, { u142: false })], 'bell.squadrons'))).toMatch(/another person's bell switch/)
    expect(ownershipViolation(env([put(`bellsqn:${PID.osprey}`, { u999: false })], 'bell.squadrons'))).toMatch(/will not read/)
    expect(ownershipViolation(env([put(`bellsqn:${PID.osprey}`, { u149: 'off' })], 'bell.squadrons'))).toMatch(/will not read/)
    expect(ownershipViolation(env([{ op: 'delete', collection: 'settings', id: `bellsqn:${PID.osprey}`, before: { u149: false }, after: null }], 'bell.squadrons'))).toMatch(/removed/)
  })
  it('the top bar’s Undo never takes a switch back', () => {
    ospreyPosted()
    signInAs('saber')
    expect(setBellSquadron('u149', true)).toBe(true)
    globalUndo()
    expect(bellShows(PID.saber, 'u149'), 'still on').toBe(true)
  })
})
