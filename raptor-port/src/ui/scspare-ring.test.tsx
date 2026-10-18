// @vitest-environment jsdom
/* [SC-SPARE-RING-BORROWS] (Astra's scenario read of D605, F3, 6 Oct 26): one man in an SC line's MAIN and SPARE seats,
   on local leave all day. His MAIN seat is flagged ("On leave but tasked"), rightly; his SPARE puck wore that seat's red
   ring and C too, though local leave may stand a spare — the exempt seat matched any warning anchored anywhere in its
   formation by the key prefix. An absence rings an exempt seat only when it is anchored on the formation (the SPARE's
   own warning) or on that very jet; the currency and two-places matches keep the whole formation. One body for the week
   and the board (html.ts exemptLineOwn, read by dayHTML and board-html.ts sbSlot) — both are drawn here. */
import { describe, it, expect, beforeEach } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { validate } from '../engine/validate'
import { makeStandalone } from '../engine/waves'
import { ensureRowIds } from '../engine/rowids'
import { HOOKS } from '../engine/hooks'
import { dayHTML, exemptLineOwn } from './html'
import { sbSlot } from './board-html'
import { setSession } from '../state/auth'

const DSNAP = JSON.stringify(DAYS), ISNAP = JSON.stringify(INPUTS)
const TUE = 1, X = 'split'
const el = (h: string) => { const d = document.createElement('div'); d.innerHTML = h; return d }
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  setSession({ user: 'a', role: 'admin' } as any)
  HOOKS.editMode = () => true
})
/* an SC wave on the Tuesday, X in its first MAIN seat and its first SPARE seat (aircraft 2), the shift timed or blank */
const both = (type: string, timed: boolean) => {
  const d: any = DAYS[TUE], w: any = makeStandalone('sc'), f = w.formations[0]
  if (!timed) { f.to = ''; f.ld = '' }
  f.aircraft[0].p = X; f.aircraft[2].p = X
  d.waves.push(w)
  INPUTS.push({ person: X, date: d.dt, allday: true, type, remarks: '', mod: '' })
  ensureRowIds(DAYS); validate()
  const gi = d.waves.length - 1
  return { main: `${TUE}.${gi}.0.0.p`, spare: `${TUE}.${gi}.0.2.p` }
}
const weekPuck = (slot: string) => el(dayHTML(TUE, true)).querySelector(`[data-slot="${slot}"] .puck[data-person="${X}"]`) as HTMLElement | null
const boardPuck = (slot: string) => el(sbSlot(TUE, slot, 'p', X)).querySelector(`.puck[data-person="${X}"]`) as HTMLElement | null
const ringed = (p: HTMLElement | null) => !!p && /\bwarn\b/.test(p.className)

describe('an SC SPARE seat wears only its own absence ring', () => {
  it('local leave, the shift blank: the MAIN is flagged, the SPARE stays plain — week and board', () => {
    const { main, spare } = both('LL', false)
    expect(exemptLineOwn(TUE, spare, X), 'the SPARE seat raises nothing for local leave').toBeNull()
    expect(ringed(weekPuck(main)), 'the MAIN seat is flagged on the week').toBe(true)
    expect(ringed(weekPuck(spare)), 'the SPARE puck plain on the week').toBe(false)
    expect(ringed(boardPuck(spare)), 'and plain on the board').toBe(false)
  })
  it('local leave, the shift timed: the pair is one man in two places of one shift — red anyway, as before', () => {
    const { spare } = both('LL', true)
    expect(exemptLineOwn(TUE, spare, X)).toBe('C')
  })
  for (const type of ['OL', 'ATT C']) {
    it(`${type}, the shift blank: an absence that bars a spare still rings the SPARE (the control)`, () => {
      const { spare } = both(type, false)
      expect(exemptLineOwn(TUE, spare, X)).toBe('C')
      expect(ringed(weekPuck(spare)), 'on the week').toBe(true)
      expect(ringed(boardPuck(spare)), 'on the board').toBe(true)
    })
  }
})
