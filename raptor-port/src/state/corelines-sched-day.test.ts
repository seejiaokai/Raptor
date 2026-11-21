// @vitest-environment jsdom
/* CORE LINE 2 (helper "corelines", 22 Nov 26 — the walk's W4-F2 at the save check). Ranger is 149's from Thu 16 Jul.
   Helper "schedfix" closed the door (ui/drag.ts applyDrop asks engine/roster.ts onRosterOf), but the save check let the
   write through: a schedule day's change that NEWLY names a man who is another squadron's that day (his D2243 Q2 — on a
   day he is not the squadron's he is not offered). Pressed here past the door: the schedule's own command with the day
   changed in place, and a hand-made command against the check itself.
   Controls: a line that named him before stays and may be changed around him (the transfer's "its lines keep him" —
   D2160's row, scheduler.md); he may be re-seated within such a day (no new naming) and taken off it; a man of the
   squadron that day lands; Ranger lands on a day he is still 142's. */
import { describe, it, expect, beforeEach } from 'vitest'
import { useMsqWorld, signInAs, moveMan, PID } from '../test-support/msq-world'
import { DAYS } from '../engine/data'
import { HOOKS } from '../engine/hooks'
import { CURWEEK } from '../engine/waves'
import { inView } from '../engine/unitview'
import { commitSchedVoid, SCHED_TYPES } from './sched-commit'
import { ownershipViolation } from './perms'
import { deriveActor } from '../command/actor'
import { globalUndo } from '../undo/timeline'

const WEEK0 = JSON.stringify(DAYS)
beforeEach(() => { DAYS.splice(0, DAYS.length, ...JSON.parse(WEEK0)) })
useMsqWorld()

const R = PID.ranger
const THU = 3, FRI = 4, TUE = 1
const onDay = (di: number, pid: string) => JSON.stringify(DAYS[di]).includes(`"${pid}"`)
/* every flying seat of a day, as [aircraft, seat] */
function seats(di: number): [any, 'p' | 'w'][] {
  const out: [any, 'p' | 'w'][] = []
  const d: any = DAYS[di]
  for (const w of d.waves || []) for (const f of w.formations || []) for (const a of f.aircraft || []) { out.push([a, 'p']); out.push([a, 'w']) }
  return out
}
const seatOf = (di: number, pid: string) => seats(di).find(([a, s]) => a[s] === pid)
/* a seat of the day holding a man other than `not` (to write over) */
const otherSeat = (di: number, not: string) => seats(di).find(([a, s]) => typeof a[s] === 'string' && a[s] && a[s] !== not)
/* a Common Programme row of the day naming nobody yet — its `who` is where a drop on the row writes its first man */
const freeRow = (di: number): any => (DAYS[di] as any).allhands.find((r: any) => !r.who)
const place = (di: number, pid: string) => { freeRow(di).who = pid }
const write = (fn: () => void) => commitSchedVoid(SCHED_TYPES.slot, fn) as any
const hunterAfterTheMove = () => { signInAs('saber'); expect(moveMan(R, 'u149')).toMatchObject({ ok: true }); signInAs('hunter') }
/* a hand-made command carrying one day's record, judged by the save check */
const forged = (di: number, before: unknown, after: unknown, type = 'sched.slot') =>
  ownershipViolation({ seq: -1, at: '', actor: deriveActor(), origin: 'user', scope: { module: 'sched' }, type, emit: true,
    changes: [{ op: 'put', collection: 'days', id: `${inView(CURWEEK)}#${di}`, before, after }] } as any)

describe('the save check refuses a schedule day that newly names a man who is another squadron\'s that day', () => {
  it('the world: a 142 line on Thu 16 names Ranger, Fri 17 does not, and Fri 17 has a row to write on', () => {
    expect(seatOf(THU, R)).toBeTruthy()
    expect(onDay(FRI, R)).toBe(false)
    expect(freeRow(FRI)).toBeTruthy()
  })
  it('Ranger written onto a row of 142\'s Fri 17 (past the door): refused, the day as it was', () => {
    hunterAfterTheMove()
    const was = JSON.stringify(DAYS[FRI])
    const r = write(() => place(FRI, R))
    expect(r.ok, 'the command').toBe(false)
    expect(JSON.stringify(DAYS[FRI])).toBe(was)
  })
  it('Ranger moved from his Thu 16 seat to a Fri 17 row in one command: refused, he stays on Thu', () => {
    hunterAfterTheMove()
    const r = write(() => { const [ta, ts] = seatOf(THU, R)!; ta[ts] = ''; place(FRI, R) })
    expect(r.ok).toBe(false)
    expect(seatOf(THU, R)).toBeTruthy()
    expect(onDay(FRI, R)).toBe(false)
  })
  it('a hand-made command naming him on Fri 17 is refused — for 142\'s admin and for a master admin alike', () => {
    hunterAfterTheMove()
    const before = JSON.parse(JSON.stringify(DAYS[FRI]))
    const after = JSON.parse(JSON.stringify(before))
    after.allhands.find((r: any) => !r.who).who = R
    expect(forged(FRI, before, after)).toMatch(/another squadron's that day/)
    expect(forged(FRI, null, after), 'a day record written as new').toMatch(/another squadron's that day/)
    signInAs('saber')
    expect(forged(FRI, before, after)).toMatch(/another squadron's that day/)
  })
  it('control: before his move is saved the same write lands', () => {
    signInAs('hunter')
    expect(write(() => place(FRI, R)).ok).toBe(true)
    expect(onDay(FRI, R)).toBe(true)
  })
  it('control: the Thu 16 line that named him before stays, and the day is changed around him', () => {
    hunterAfterTheMove()
    const r = write(() => { const [a, s] = otherSeat(THU, R)!; a[s] = PID.saber })
    expect(r.ok).toBe(true)
    expect(seatOf(THU, R)).toBeTruthy()
  })
  it('control: he is re-seated within Thu 16 (no new naming), and taken off it', () => {
    hunterAfterTheMove()
    expect(write(() => { const [ta, ts] = seatOf(THU, R)!; const [a, s] = otherSeat(THU, R)!; ta[ts] = a[s]; a[s] = R }).ok, 'a swap within the day').toBe(true)
    expect(seatOf(THU, R)).toBeTruthy()
    expect(write(() => { const [ta, ts] = seatOf(THU, R)!; ta[ts] = '' }).ok, 'taken off').toBe(true)
    expect(seatOf(THU, R)).toBeUndefined()
  })
  it('control: Saber, 142\'s all week, lands on Fri 17; Ranger lands on Tue 14, a day he is 142\'s', () => {
    hunterAfterTheMove()
    expect(write(() => place(FRI, PID.saber)).ok).toBe(true)
    expect(freeRow(TUE), 'Tue 14 has a row').toBeTruthy()
    expect(write(() => place(TUE, R)).ok).toBe(true)
    expect(onDay(TUE, R)).toBe(true)
  })
  it('once taken off a line that named him, the Undo that would put him back on a day he is 149\'s is refused as any other change', () => {
    /* (Fri 17, which names him nowhere else: Hunter plans him there while he is still 142's, then moves him himself —
       a squadron's admin moves his own man — and takes him off the row) */
    signInAs('hunter')
    expect(write(() => place(FRI, R)).ok).toBe(true)
    expect(moveMan(R, 'u149')).toMatchObject({ ok: true })
    expect(onDay(FRI, R), 'the row that named him keeps him').toBe(true)
    expect(write(() => { (DAYS[FRI] as any).allhands.find((r: any) => r.who === R).who = '' }).ok).toBe(true)
    expect(onDay(FRI, R)).toBe(false)
    const u = globalUndo()
    expect(onDay(FRI, R), 'not back on the day').toBe(false)
    /* (Undo's own words for a restore the save check refused — nothing new is said for this rule) */
    expect(u.ok).toBe(false)
    expect(u.reason).toBe('That couldn’t be completed just now — something else changed on this week.')
    expect((HOOKS.toast as any).mock.calls).toEqual([])
  })
})
