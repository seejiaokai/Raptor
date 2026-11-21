// @vitest-environment jsdom
/* W4-F2 (the walk of 21 Nov 26, walker W4's W4-02): on 142's Edit Schedule Hunter drags Ranger's puck (Ranger is 149's
   from Thu 16 Jul) from a Thu 16 line that already named him onto a row of Fri 17's Common Programme: he landed
   on 142's Fri 17 with no word. His D2243 Q2: on a day he is not the squadron's he is not offered — the crew list leaves
   him out — and a drag must not place him either. applyDrop is the one mutation path of mouse and touch drags
   (ui/drag.ts), driven here with the drag in flight and the place dropped on, as ui/drag.test.tsx's B23/B49 do. */
import { describe, it, expect, beforeEach } from 'vitest'
import { useMsqWorld, signInAs, moveMan, PID } from '../test-support/msq-world'
import { DAYS } from '../engine/data'
import { HOOKS } from '../engine/hooks'
import { setPage } from '../state/view'
import { applyDrop, setDrag } from './drag'

/* the built-in week is put back before the world boots each test (a drop that lands changes it in place) */
const WEEK0 = JSON.stringify(DAYS)
beforeEach(() => { DAYS.splice(0, DAYS.length, ...JSON.parse(WEEK0)) })
useMsqWorld()

const R = PID.ranger
const GENERIC = 'This change could not be saved.'
const said = () => (HOOKS.toast as any).mock.calls.map((c: any[]) => String(c[0]))
/* the first flying seat of day `di` naming `pid`, as its slot key (di.wave.formation.aircraft.seat) */
function seatOf(di: number, pid: string): string | null {
  const d: any = DAYS[di]
  for (let w = 0; w < (d.waves || []).length; w++) for (let f = 0; f < d.waves[w].formations.length; f++) {
    const acs = d.waves[w].formations[f].aircraft
    for (let a = 0; a < acs.length; a++) for (const s of ['p', 'w']) if (acs[a][s] === pid) return `${di}.${w}.${f}.${a}.${s}`
  }
  return null
}
/* (the walker's row, "CMD ENGAGEMENT @ CREW ROOM (ALL)", is the demo's Event filed for ALL, which this test world does not
   seed; the drop's day check stands before the plain rows' branch and the input rows' alike — a plain Common Programme
   row of Fri 17 here) */
const fridayRow = (): number => (DAYS[4] as any).allhands.findIndex((r: any) => String(r.prog).includes('SQN PT'))
const onDay = (di: number, pid: string) => JSON.stringify(DAYS[di]).includes(`"${pid}"`)
/* the place dropped on: Fri 17's Common Programme row, its people cell */
function fridayCell(): HTMLElement {
  const cell = document.createElement('div'); cell.dataset.fill = `a:4.${fridayRow()}.+`
  document.body.append(cell)
  return cell
}
const hunterOnEditSchedule = () => { signInAs('saber'); expect(moveMan(R, 'u149')).toMatchObject({ ok: true }); signInAs('hunter'); setPage('editsched') }

describe('W4-F2 — a drag never places a man on a day he is not the squadron\'s', () => {
  it('Ranger dragged from his Thu 16 seat onto Fri 17: refused in words, he stays where he was', () => {
    hunterOnEditSchedule()
    const from = seatOf(3, R)
    expect(from, 'a 142 line on Thu 16 names Ranger').toBeTruthy()
    expect(fridayRow()).toBeGreaterThanOrEqual(0)
    expect(onDay(4, R)).toBe(false)
    setDrag({ kind: 'slot', key: from })
    expect(applyDrop(fridayCell(), 0, 0)).toBe(false)
    expect(onDay(4, R), 'not on 142\'s Fri 17').toBe(false)
    expect(seatOf(3, R), 'still on the Thu line that named him').toBe(from)
    expect(said()).toEqual([GENERIC])
  })
  it('…nor from a puck of the crew list (a drag picked up on a day he was offered)', () => {
    hunterOnEditSchedule()
    setDrag({ kind: 'roster', id: R })
    expect(applyDrop(fridayCell(), 0, 0)).toBe(false)
    expect(onDay(4, R)).toBe(false)
    expect(said()).toEqual([GENERIC])
  })
  it('(control) Saber, 142\'s all week, dragged from the crew list lands on Fri 17', () => {
    hunterOnEditSchedule()
    const row = fridayRow()
    setDrag({ kind: 'roster', id: PID.saber })
    expect(applyDrop(fridayCell(), 0, 0)).toBe(true)
    expect(JSON.stringify((DAYS[4] as any).allhands[row])).toContain(PID.saber)
    expect(said()).not.toContain(GENERIC)
  })
  it('(control) Ranger dragged onto Tue 14, a day he is 142\'s, lands', () => {
    hunterOnEditSchedule()
    const row = (DAYS[1] as any).allhands.length ? 0 : -1
    expect(row).toBe(0)
    const cell = document.createElement('div'); cell.dataset.fill = 'a:1.0.+'; document.body.append(cell)
    setDrag({ kind: 'roster', id: R })
    expect(applyDrop(cell, 0, 0)).toBe(true)
    expect(JSON.stringify((DAYS[1] as any).allhands[0])).toContain(R)
    expect(said()).not.toContain(GENERIC)
  })
})
