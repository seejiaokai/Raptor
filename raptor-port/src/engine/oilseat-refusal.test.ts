/* [OIL-SEATS-CAN-EARN] STEP 2 — the placeholder is REFUSED on a jet, and the
   refusal is decided BEFORE anything is written.
   Plan: docs/superpowers/specs/2026-09-22-oil-seats-can-earn-plan.md §5 step 2.

   D33: the pucks are refused on FLYING-LINE COCKPIT SEATS ONLY. Everywhere else
   they are ordinary and, from D43, they credit by default — including on an
   accepted request row (D46), so the over-refusal guards below matter as much as
   the refusal itself.

   TWO RULINGS COLLIDE HERE and the newer wins: every other door in this app
   PLANTS FIRST AND WARNS AFTER (owner, 13 Aug 26), and D33 (22 Sep 26) asks for
   a hard refusal. This change carves the first hard refusal out of that rule,
   and it is carved narrowly: placeholder ids on flying keys, nothing else.

   THE REFUSAL CANNOT LIVE INSIDE THE WRITER (Codex OSE-04). A swap is TWO
   independent writes, so a writer that refuses one still runs the other: the
   person is duplicated, the placeholder is lost, and the caller reports success.
   So the callers PREFLIGHT both ends and reject the whole operation, and the
   writer's own guard is the belt behind them. This file pins the engine half —
   the preflight body, the writer's belt, the words, and the money belt. The
   DOORS (drag, armed placement, the palette's row) are ui/oilseat-refusal.test.tsx. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { PEOPLE, SPECIALS } from './people'
import { SCHED } from './publish'
import { ensureRowIds } from './rowids'
import { slotVal, setSlotVal, fillSlot, sentinelSeatOK, SENTINEL_JET_BAR } from './slots'
import { slotBar } from './avail'
import { dayOilWork } from './oil'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
/* the two placeholder pucks are ALL and ALL AVAIL. Every check below walks BOTH,
   because they are two pucks with identical behaviour and wiring one and
   forgetting the other is exactly the shape this build has to avoid. */
const BOTH = SPECIALS

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}
  ensureRowIds(DAYS)
})
afterEach(() => { SCHED.pending = {}; SCHED.changes = {} })

/* the first cockpit seat on the loaded week, found rather than assumed — the
   fixture must be a real flying line, not one built for the test */
function aCockpit(): { key: string; di: number } {
  for (let di = 0; di < DAYS.length; di++) {
    const d: any = DAYS[di]
    const waves = d.waves || []
    for (let gi = 0; gi < waves.length; gi++) {
      const fs = waves[gi].formations || []
      for (let li = 0; li < fs.length; li++) {
        const acs = fs[li].aircraft || []
        for (let ai = 0; ai < acs.length; ai++) return { key: `${di}.${gi}.${li}.${ai}.p`, di }
      }
    }
  }
  throw new Error('no flying line in the seed week')
}

describe('the preflight answers before anything is written (D33, OSE-04)', () => {
  it('a placeholder is refused on a cockpit seat and allowed everywhere else', () => {
    const { key, di } = aCockpit()
    for (const id of BOTH) {
      expect(sentinelSeatOK(key, id), `${PEOPLE[id].cs} refused in a cockpit`).toBe(false)
      expect(sentinelSeatOK(key.replace(/\.p$/, '.w'), id), 'the rear seat too').toBe(false)
      /* every other kind of seat the pucks can land on stays open */
      expect(sentinelSeatOK(`g:${di}.0`, id), 'a ground row').toBe(true)
      expect(sentinelSeatOK(`g:${di}.0.x0`, id), 'a ground row\'s extras').toBe(true)
      expect(sentinelSeatOK(`d:${di}.0.0`, id), 'a duty desk').toBe(true)
      expect(sentinelSeatOK(`d:${di}.0.0.x0`, id), 'a duty desk\'s extras').toBe(true)
      expect(sentinelSeatOK(`s:${di}.amt.0.p`, id), 'a sim seat').toBe(true)
      expect(sentinelSeatOK(`s:${di}.amt.0.pax.0`, id), 'a sim passenger').toBe(true)
      expect(sentinelSeatOK(`a:${di}.0.0`, id), 'the Common Programme').toBe(true)
    }
  })

  it('a REAL PERSON is never refused anywhere — the refusal is about the puck, not the seat', () => {
    const { key } = aCockpit()
    const man = Object.keys(PEOPLE).find(id => !PEOPLE[id].special)!
    expect(sentinelSeatOK(key, man), 'a named man still crews a jet').toBe(true)
  })
})

describe('the writer refuses as its own belt, and writes NOTHING when it does', () => {
  it('setSlotVal leaves the seat, the pending mark and the edit log untouched', () => {
    const { key } = aCockpit()
    const was = slotVal(key)
    for (const id of BOTH) {
      expect(setSlotVal(key, id), 'the write reports the refusal').toBe(false)
      expect(slotVal(key), 'the seat is unchanged').toBe(was)
      expect(Object.keys(SCHED.pending).length, 'and no amendment mark was raised').toBe(0)
    }
  })

  it('a NAMED man still plants in that same seat — the belt is narrow', () => {
    const { key } = aCockpit()
    const man = Object.keys(PEOPLE).find(id => !PEOPLE[id].special && PEOPLE[id].seat === 'FCP')!
    expect(setSlotVal(key, man)).toBe(true)
    expect(slotVal(key)).toBe(man)
  })

  it('fillSlot passes the refusal up rather than swallowing it', () => {
    const { key } = aCockpit()
    for (const id of BOTH) expect(fillSlot(key, id), 'the append door refuses too').toBe(false)
  })

  it('the placeholder still lands on a ground row, a desk and a sim — D43/D46', () => {
    const di = 5
    ;(DAYS[di] as any).ground = [{ prog: 'FAMILY DAY', str: '0900', end: '1700', who: '' }]
    ensureRowIds(DAYS)
    for (const id of BOTH) {
      expect(setSlotVal(`g:${di}.0`, id), 'a ground row takes it').toBe(true)
      expect(slotVal(`g:${di}.0`)).toBe(id)
    }
    /* AN ACCEPTED REQUEST ROW TOO (D46, 22 Sep 26 — the owner took the answer
       with no carve-outs, rejecting the reviewer's recommendation to refuse the
       puck there). Over-refusing here is the specific mistake D46 forbids. */
    ;(DAYS[di] as any).ground = [{ prog: 'TRAINING', str: '0900', end: '1700', who: '', src: 'req1' }]
    ensureRowIds(DAYS)
    for (const id of BOTH) {
      expect(sentinelSeatOK(`g:${di}.0`, id), 'a request row is not a carve-out').toBe(true)
      expect(setSlotVal(`g:${di}.0`, id)).toBe(true)
    }
  })
})

describe('the reason is one string, and it reaches the hover', () => {
  it('slotBar gives the refusal for a cockpit and stays silent elsewhere', () => {
    const { key, di } = aCockpit()
    for (const id of BOTH) {
      expect(slotBar(id, key), 'the cockpit says why').toBe(SENTINEL_JET_BAR)
      expect(slotBar(id, `g:${di}.0`), 'a ground row says nothing, as it always did').toBe('')
    }
  })

  it('the words are held in ONE place, so no surface can spell them differently', () => {
    expect(SENTINEL_JET_BAR.length, 'it is a real sentence').toBeGreaterThan(10)
    expect(SENTINEL_JET_BAR, 'and it says what to do instead').toMatch(/name the people/i)
  })
})

describe('the money belt on the flying branch (Fable M4 step 5)', () => {
  it('the flying branch NEVER hands its window to the expander', () => {
    /* a day template and a parked plan both re-land a captured day without
       passing either door, so the doors alone cannot keep a placeholder out of a
       cockpit. This is the belt behind them, and it is pinned NOW because step 5
       folds expansion into the shared helper — if the flying branch is widened
       with it, this is what goes red.

       It asserts the EXPANDER IS NOT CALLED rather than "nobody earns": real
       crew are flying on the same day and earn properly, so a headcount would
       pass whatever the cockpit did. There is a second reason to pin the call
       itself — D36. The flying branch measures report→debrief, a much wider
       window than availability's step→dekit, and handing it to the expander
       would resolve the crowd against the wrong window and mark men unavailable
       for the very events the squadron builds around them. */
    const { key, di } = aCockpit()
    const [gi, li, ai] = key.split('.').slice(1)
    const seat = key.split('.')[4]
    const ac = (DAYS[di] as any).waves[+gi].formations[+li].aircraft[+ai]
    const item = `r:${(DAYS[di] as any).waves[+gi].formations[+li].rid}`
    for (const id of BOTH) {
      ac[seat] = id                                     // planted the way a COPY does: straight onto the day
      const asked: string[] = []
      dayOilWork(DAYS[di], { expandAll: (_w, it) => { asked.push(it); return ['bane', 'stiff'] } })
      expect(asked, `${PEOPLE[id].cs} in a cockpit asks the expander nothing`).not.toContain(item)
    }
  })

  it('and the puck itself is never credited as a person', () => {
    const { key, di } = aCockpit()
    const [gi, li, ai] = key.split('.').slice(1)
    const seat = key.split('.')[4]
    const ac = (DAYS[di] as any).waves[+gi].formations[+li].aircraft[+ai]
    for (const id of BOTH) {
      ac[seat] = id
      const work = dayOilWork(DAYS[di], { expandAll: () => [] })
      expect(Object.keys(work), 'a placeholder is not a man and earns nothing itself').not.toContain(id)
    }
  })
})
