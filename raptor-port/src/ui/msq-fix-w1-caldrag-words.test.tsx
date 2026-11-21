// @vitest-environment jsdom
/* W1 (3) (the walk of 21 Nov 26, W1-01 "calendar drag"): on the Inputs calendar Hunter drags Ranger's leave. Ranger is
   149's from Thu 16 Jul. A one-day bar on Tue 14 dragged to Thu 16 is refused in the ruled sentence (D2240, D2241 —
   ui/inputedit.tsx whoDoorRefusal); the 14–17 Jul bar, which already runs across his move, dragged a day on snapped back
   with no word at all. Every refusal says something: the same sentence. Through the calendar's own move door
   (ui/caldrag.ts commitChipMove — the one decision both the mouse and the finger end in). */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, acrossMove, signInAs, PID } from '../test-support/msq-world'
import { commitChipMove } from './caldrag'
import { commitInput, NOT_SAVED } from './inputedit'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { setPage, setInpView } from '../state/view'

useMsqWorld()

const R = PID.ranger
const WORDS = "Blocked: Ranger is 149's from Thu 16 Jul. Only Ranger or an admin of both 142 and 149 can change leave that runs across his move."
const said = () => (HOOKS.toast as any).mock.calls.map((c: any[]) => String(c[0]))
/* Saber, a master admin, files Ranger's leave (he may, across the move); then Hunter, 142's admin, is at the calendar */
function filed(start: string, end: string): any {
  acrossMove(R, 'u142', 'u149')
  signInAs('saber')
  expect(commitInput(null, { type: 'LL', start, end, allday: true, remarks: 'w1 drag' }, [R])).toBe(true)
  const rec = INPUTS.find((x: any) => x.remarks === 'w1 drag')
  expect(rec).toBeTruthy()
  signInAs('hunter'); setPage('inputs'); setInpView('cal')
  ;(HOOKS.toast as any).mockClear()
  return rec
}

describe('W1 (3) — a calendar drag of leave across Ranger\'s move is refused in words', () => {
  /* (the walker's "14→16: ruled note" was the bar's STRETCH, another door; a whole move of the one-day bar onto a 149 day
     no longer runs across his move, so it is the who-rule's plain refusal, as the input's own window says it) */
  it('the one-day bar on Tue 14 moved whole to Thu 16, a 149 day: refused in the who-rule\'s plain words', () => {
    const rec = filed('2026-07-14', '2026-07-14')
    expect(commitChipMove({ kind: 'input', iid: rec.iid }, '2026-07-14', '2026-07-16')).toBe(false)
    expect(said()).toEqual([NOT_SAVED])
    expect(INPUTS.find((x: any) => x.iid === rec.iid)?.date).toBe('Jul 14')
  })
  it('the 14–17 Jul bar dragged a day on: the same sentence, never silence', () => {
    const rec = filed('2026-07-14', '2026-07-17')
    expect(commitChipMove({ kind: 'input', iid: rec.iid }, '2026-07-14', '2026-07-15')).toBe(false)
    expect(said()).toEqual([WORDS])
    expect(INPUTS.find((x: any) => x.iid === rec.iid)?.date, 'nothing moved').toBe('Jul 14')
  })
  it('…and dragged back wholly inside his 142 days (11–14 Jul): the same sentence', () => {
    const rec = filed('2026-07-14', '2026-07-17')
    expect(commitChipMove({ kind: 'input', iid: rec.iid }, '2026-07-14', '2026-07-11')).toBe(false)
    expect(said()).toEqual([WORDS])
  })
  it('(control) Hunter moves Saber\'s own one-day leave a day on: it moves, "Moved to …"', () => {
    signInAs('saber')
    expect(commitInput(null, { type: 'LL', start: '2026-07-14', end: '2026-07-14', allday: true, remarks: 'w1 ctl' }, [PID.saber])).toBe(true)
    const rec = INPUTS.find((x: any) => x.remarks === 'w1 ctl')
    signInAs('hunter'); setPage('inputs'); setInpView('cal')
    ;(HOOKS.toast as any).mockClear()
    expect(commitChipMove({ kind: 'input', iid: rec.iid }, '2026-07-14', '2026-07-15')).toBe(true)
    expect(said().some((s: string) => s.startsWith('Moved to '))).toBe(true)
  })
})
