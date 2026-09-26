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
import { slotBar, rowTwice } from './avail'
import { setSlotVal, fillSlot, lastFilled } from './slots'
import { validate, WARN } from './validate'
import { SCHED } from './publish'
import { makeStandalone } from './waves'

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
})

/* ONE MAN, ONCE PER ROW (W3's walk of this batch, 26 Sep 26 — its F6; REFUSED since the owner's D271, 27 Sep 26 —
   "Q1 refused"). The fix above made a man's own row stop calling him busy, and with it went the ONLY voice on putting
   him on a row he already stands on: Ranger dragged from the crew list onto Reaper's puck in the FLIGHT SAFETY crowd
   Ranger was already in replaced Reaper with a second Ranger, silently. The batch first WARNED ("everything plants,
   warning after", 13 Aug 26); shown the choice, he ruled it REFUSED — so the words end "· not added twice", the doors
   write nothing (ui/rowtwice-refusal.test.tsx walks them), and an append refuses in the writer too. The question: he
   stands on this row at ANOTHER place than the one asked about, and not the place he is being moved from. */
const TWICE = 'already on FLIGHT SAFETY STAND-DOWN 08:30–09:00 · not added twice'
describe('a man put on a row he already stands on is refused, and told why (D271)', () => {
  it("the crowd's '+ add', armed or dropped on, names the row he is already in", () => {
    setSlotVal(`a:0.${FS}.1`, 'boosh'); validate()
    expect(rowTwice('boosh', `a:0.${FS}.+`)).toBe(TWICE)
    expect(slotBar('boosh', `a:0.${FS}.+`), 'the caption and the crew list say it before the drop').toBe(TWICE)
  })
  it("from the crew list onto ANOTHER man's puck in his own crowd (the walk's find): refused before the drop", () => {
    setSlotVal(`a:0.${FS}.1`, 'beams'); validate()                     // Ranger (bane) at 0, Comet (beams) at 1
    expect(rowTwice('bane', `a:0.${FS}.1`), 'no place he is moved from').toBe(TWICE)
    expect(slotBar('bane', `a:0.${FS}.1`), 'the caption before the drop').toBe(TWICE)
  })
  it('a move INSIDE the row, and a swap inside one crowd, stay silent: the place he leaves is his one place there', () => {
    setSlotVal(`a:0.${FS}.1`, 'beams'); validate()
    expect(rowTwice('bane', `a:0.${FS}.1`, `a:0.${FS}.0`)).toBe('')
    expect(rowTwice('beams', `a:0.${FS}.0`, `a:0.${FS}.1`), "the swap's other end").toBe('')
    expect(rowTwice('bane', `a:0.${FS}.+`, `a:0.${FS}.0`), 'to the end of his own crowd').toBe('')
    expect(slotBar('bane', `a:0.${FS}.1`, undefined, `a:0.${FS}.0`)).toBe('')
  })
  it('his own place is not a second one: asked of the place he stands on, nothing', () => {
    expect(rowTwice('bane', `a:0.${FS}.0`)).toBe('')
  })
  it('an append of a man already on the row is refused IN THE WRITER too: nothing written, the row keeps one copy', () => {
    expect(fillSlot(`a:0.${FS}.+`, 'boosh'), 'a plain add').toBe(true)
    expect(lastFilled()).toBe(`a:0.${FS}.1`)
    validate()
    expect(slotBar('boosh', lastFilled()), 'a plain add says nothing').toBe('')
    const before = JSON.stringify(crowd())
    expect(fillSlot(`a:0.${FS}.+`, 'boosh'), 'the same man again').toBe(false)
    expect(JSON.stringify(crowd()), 'nothing written').toBe(before)
    expect(lastFilled(), 'and nothing landed').toBeNull()
  })
  it("the same for a desk's extras, a ground row's extras and a sim's seats", () => {
    const d: any = DAYS[0], g = d.ground
    g.push({ prog: 'ROW A', str: '1000', end: '1100', who: 'boosh' }); const a = g.length - 1
    validate()
    expect(slotBar('boosh', `g:0.${a}.+`)).toBe('already on ROW A 10:00–11:00 · not added twice')
    expect(fillSlot(`g:0.${a}.+`, 'boosh'), 'the writer refuses the ground row too').toBe(false)
    expect(slotBar('beams', `g:0.${a}.+`), 'another man: nothing').toBe('')
    d.dutywaves.push({ label: 'DESK', rows: [{ role: 'SDO', str: '1300', end: '1400', id: 'boosh', more: [] }] }); const w = d.dutywaves.length - 1
    validate()
    expect(slotBar('boosh', `d:0.${w}.0.+`)).toBe('already on SDO duty 13:00–14:00 · not added twice')
    expect(fillSlot(`d:0.${w}.0.+`, 'boosh')).toBe(false)
    d.sims.oft.push({ label: 'X', str: '1500', end: '1600', p: 'boosh', w: '' }); const r = d.sims.oft.length - 1
    validate()
    expect(slotBar('boosh', `s:0.oft.${r}.w`), 'the rear seat of the sim he is in front of').toBe('already on Sim X 15:00–16:00 · not added twice')
    expect(fillSlot(`s:0.oft.${r}.+`, 'boosh')).toBe(false)
  })
  it("the seed's own man, arming his own crowd, is named too", () => {
    expect(slotBar('bane', `a:0.${FS}.+`)).toBe(TWICE)
  })
  it('a man on two DIFFERENT rows is still only warned, as before (his reading (1)): no "not added twice"', () => {
    DAYS[0].allhands[1].end = '0845'; validate()                              // MET + NOTAM now overlaps the stand-down
    expect(rowTwice('nact', `a:0.${FS}.+`)).toBe('')
    expect(slotBar('nact', `a:0.${FS}.+`)).toBe('already on MET + NOTAM BRIEF 08:15–08:45')
  })
  /* Fable's scenario read (27 Sep 26), S-13 / S-15 / S-21: the kinds of row and the orders no test named yet */
  it('an ⓘ info-only row is held too (an FYI row lists anyone, but not the same man twice); another man is silent there', () => {
    DAYS[0].allhands[FS].info = true; validate()
    expect(slotBar('bane', `a:0.${FS}.+`), 'Ranger again on the FYI crowd').toMatch(/· not added twice$/)
    expect(slotBar('boosh', `a:0.${FS}.+`), 'Havoc: an FYI row raises nothing').toBe('')
  })
  it('a row with no times still names the refusal ("already on this row")', () => {
    const g = DAYS[0].ground
    g.push({ prog: 'NO TIMES', str: '', end: '', who: 'boosh' }); const a = g.length - 1
    validate()
    expect(rowTwice('boosh', `g:0.${a}.+`)).toMatch(/^already on (this row|NO TIMES)/)
    expect(rowTwice('boosh', `g:0.${a}.+`)).toMatch(/· not added twice$/)
  })
  it("across days: Monday's man dragged onto Tuesday's crowd he is also on is refused, naming TUESDAY's row", () => {
    const t: any = DAYS[1].allhands
    t.push({ prog: 'TUE CROWD', str: '1000', end: '1100', who: ['bane'] }); const ri = t.length - 1
    validate()
    expect(rowTwice('bane', `a:1.${ri}.+`, `a:0.${FS}.0`)).toBe('already on TUE CROWD 10:00–11:00 · not added twice')
    expect(rowTwice('bane', `a:1.${ri}.+`, `a:1.${ri}.0`), 'his own Tuesday place moved to the end: no').toBe('')
  })
  it('a placeholder is not a man: ALL AVAIL is not held to it', () => {
    setSlotVal(`a:0.${FS}.1`, 'allavail'); validate()
    expect(rowTwice('allavail', `a:0.${FS}.+`)).toBe('')
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

/* W3's walk of this batch (F20, 26 Sep 26), the same family on the SC shift window: dragging a man from one SC AM MAIN
   seat to another (or front seat to rear) captioned "on SC AM 07:00–13:00 — inside this shift" — the shift he was
   LEAVING — while the drop then said nothing. The shift-window scan read only the seat being planted into; it reads
   the seat he is dragged from too now, like the walks above it. */
describe('an SC shift drag reads the week after the move', () => {
  it('MAIN seat to another MAIN seat of the same shift, and front seat to rear: clear; a plain plant still speaks', () => {
    const d: any = DAYS[1]
    const sc = makeStandalone('sc'); d.waves.push(sc); const gi = d.waves.length - 1
    const A = `1.${gi}.0.0.p`, B = `1.${gi}.0.1.p`, C = `1.${gi}.0.0.w`
    setSlotVal(A, 'boosh'); validate()
    /* Havoc has a real SDO desk 05:30–12:00 that Tuesday, which the caption SHOULD still name — the claim is only that
       it never names the SC shift he is leaving */
    expect(slotBar('boosh', B, undefined, A), 'onto the other MAIN seat').not.toMatch(/SC AM/)
    expect(slotBar('boosh', B, undefined, A), '…and names his real desk instead').toMatch(/SDO duty/)
    expect(slotBar('boosh', C, undefined, A), "onto his own jet's rear seat").not.toMatch(/SC AM/)
    expect(slotBar('boosh', B), 'a plain plant: he IS on the shift').toMatch(/SC AM/)
  })
})

/* Astra's read (26 Sep 26, finding 1): the seat he is dragged FROM is excluded because he LEAVES it — but a man who
   stands on that row twice does not leave it when ONE copy moves. The source row is excluded only when he has no other
   place on it. (Since D271, 27 Sep 26, no door puts a second copy on a row — they are refused — so two copies exist only
   in a day written before it or by a direct write, as here; the reading stays right for them.) */
describe('dragging one of two copies off a row: the copy left behind still counts', () => {
  it('the hover still names the row a second copy of him stays on', () => {
    DAYS[0].allhands[1].end = '0845'                                       // MET + NOTAM now overlaps the stand-down
    setSlotVal(`a:0.${FS}.1`, 'boosh'); setSlotVal(`a:0.${FS}.2`, 'boosh')   // Havoc twice on FLIGHT SAFETY
    validate()
    expect(slotBar('boosh', 'a:0.1.+', undefined, `a:0.${FS}.2`)).toBe('already on FLIGHT SAFETY STAND-DOWN 08:30–09:00')
  })
  it('…while the one copy he has, dragged off, is still not a place he is busy', () => {
    DAYS[0].allhands[1].end = '0845'
    setSlotVal(`a:0.${FS}.1`, 'boosh'); validate()
    expect(slotBar('boosh', 'a:0.1.+', undefined, `a:0.${FS}.1`)).toBe('')
  })
})
