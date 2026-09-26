/* [CROWD-SWAP-SAYS-BUSY] (found 25 Sep 26 in the amendment batch's re-walk; built 26 Sep 26, the five-flags batch).
   On the board, dragging one man onto another in the SAME Common Programme crowd swapped them — right — and a toast
   then said "<him> — already on FLIGHT SAFETY STAND-DOWN 08:30–09:00", the very row he was moved within.

   THE CAUSE, one line in avail.ts `selfKey`: the busy check excludes "the place he is being planted into" by bringing a
   seat key and an event's key to the same shape, and for a Common Programme row it trimmed the LAST number off both. A
   person seat `a:0.2.1` came out as the row `a:0.2`, but the event's own key is already the row, `a:0.2`, and came out
   as `a:0` — so his own row never matched itself and he was "already on" it. The same trim hid a real clash the other
   way: arming a crowd's "+ add" (`a:0.2.+` → `a:0.2` → `a:0`) excluded EVERY programme row of the day, so a man booked
   on another programme row at the same hour was offered as free while the warning list raises a hard clash the moment
   he is planted (the owner's rule: the picker and the warning list may not drift, 11 Aug 26).

   And the rule the checks above it already keep (5 and 7 Sep 26): a drag's hover describes the week AFTER the move, so
   the seat a man is being dragged FROM is excluded too — he is not "already on" the place he is leaving. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { slotBar } from './avail'
import { setSlotVal } from './slots'
import { validate, WARN } from './validate'
import { SCHED } from './publish'

const DSNAP = JSON.stringify(DAYS), ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  validate()
})
/* Monday's FLIGHT SAFETY STAND-DOWN, 08:30–09:00, Ranger (bane) on it in the seed; Havoc (boosh) and Comet (beams) are
   on nothing on Monday — the three men the re-walk's crowd held */
const FS = 2
const crowd = () => DAYS[0].allhands[FS]
const clashFor = (id: string) => (WARN.all || []).filter((w: any) => w.di === 0 && w.code === 'DOUBLE_BOOK' && (w.who || []).includes(id))

describe('a man moved inside the Common Programme crowd he is on is not "already on" it', () => {
  it('the check AFTER a swap inside one crowd (the toast the re-walk saw): neither man is busy on the row he stays on', () => {
    setSlotVal(`a:0.${FS}.1`, 'boosh'); setSlotVal(`a:0.${FS}.2`, 'beams')
    expect(crowd().who).toEqual(['bane', 'boosh', 'beams'])
    setSlotVal(`a:0.${FS}.0`, 'beams'); setSlotVal(`a:0.${FS}.2`, 'bane')      // the drop's two writes
    validate()
    expect(slotBar('beams', `a:0.${FS}.0`)).toBe('')
    expect(slotBar('bane', `a:0.${FS}.2`)).toBe('')
    expect(clashFor('beams'), 'and the warning list agrees: no clash').toEqual([])
  })
  it('the hover BEFORE that drop, the seat he is dragged from given: clear', () => {
    setSlotVal(`a:0.${FS}.1`, 'boosh'); setSlotVal(`a:0.${FS}.2`, 'beams')
    validate()
    expect(slotBar('beams', `a:0.${FS}.0`, undefined, `a:0.${FS}.2`)).toBe('')
  })
  it('left as it is today: a man already in the crowd is not struck from its "+ add" for being on it', () => {
    setSlotVal(`a:0.${FS}.1`, 'boosh')
    validate()
    expect(slotBar('boosh', `a:0.${FS}.+`)).toBe('')
  })
})

describe('arming a crowd names a man booked on ANOTHER programme row at the same hour — as the warning list does', () => {
  it('MET + NOTAM BRIEF stretched over the stand-down: Nomad (nact), on it, is "already on" it', () => {
    DAYS[0].allhands[1].end = '0845'                                            // 08:15–08:45 now overlaps 08:30–09:00
    validate()
    expect(slotBar('nact', `a:0.${FS}.+`)).toBe('already on MET + NOTAM BRIEF 08:15–08:45')
    expect(slotBar('nact', `a:0.${FS}.0`), 'and at one of its seats').toBe('already on MET + NOTAM BRIEF 08:15–08:45')
    /* the list's side of the same fact, so the picker and the list are seen to agree */
    setSlotVal(`a:0.${FS}.1`, 'nact'); validate()
    expect(clashFor('nact').length, 'planted, the warning list raises the clash the picker named').toBe(1)
  })
  it('rows that do not overlap stay silent (the half-open rule: 08:15–08:30 abuts 08:30)', () => {
    expect(slotBar('nact', `a:0.${FS}.+`)).toBe('')
  })
})

describe('the hover reads the week AFTER the move: the seat a man leaves is not a place he is "already on"', () => {
  it('programme row to programme row in the same hour', () => {
    DAYS[0].allhands[1].end = '0845'
    setSlotVal(`a:0.${FS}.1`, 'boosh'); validate()
    expect(slotBar('boosh', 'a:0.1.1'), 'a plain plant: he IS on the stand-down').toMatch(/^already on FLIGHT SAFETY STAND-DOWN/)
    expect(slotBar('boosh', 'a:0.1.1', undefined, `a:0.${FS}.1`), 'dragged off it: clear').toBe('')
  })
  it('ground row to ground row in the same hour, the primary seat and an extra alike', () => {
    const g = DAYS[0].ground
    g.push({ prog: 'ROW A', str: '1000', end: '1100', who: 'boosh' }, { prog: 'ROW B', str: '1030', end: '1130', who: '' })
    const a = g.length - 2, b = g.length - 1
    validate()
    expect(slotBar('boosh', `g:0.${b}`)).toBe('already on ROW A 10:00–11:00')
    expect(slotBar('boosh', `g:0.${b}`, undefined, `g:0.${a}`)).toBe('')
    g[a].who = ''; g[a].more = ['boosh']; validate()                            // now an extra on ROW A
    expect(slotBar('boosh', `g:0.${b}`)).toBe('already on ROW A 10:00–11:00')
    expect(slotBar('boosh', `g:0.${b}`, undefined, `g:0.${a}.x0`)).toBe('')
  })
  it('the seat he leaves is only the one he leaves: another commitment in the same hour still speaks', () => {
    const g = DAYS[0].ground
    g.push({ prog: 'ROW A', str: '1000', end: '1100', who: 'boosh' }, { prog: 'ROW C', str: '1000', end: '1100', who: 'boosh' },
      { prog: 'ROW B', str: '1030', end: '1130', who: '' })
    const a = g.length - 3, b = g.length - 1
    validate()
    expect(slotBar('boosh', `g:0.${b}`, undefined, `g:0.${a}`)).toBe('already on ROW C 10:00–11:00')
  })
})
