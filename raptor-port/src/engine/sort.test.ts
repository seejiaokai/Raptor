/* Auto sort — the sorters return the board to its natural order without
   Undo. Each section sorts by its OWN key (flying by take-off, duties by
   role, sims/ground/programme by start time), and every sorter is asserted
   against the same two properties: stable ties, and a no-op — no model
   change, no amendment mark — when the section is already in order.
   Snapshot/restore of DAYS follows reorder.test.ts so mutations cannot leak
   between files. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { SCHED } from './publish'
import { sortWave, sortWaves, sortDutyBlock, sortDutyBlocks, sortSims, sortGround, sortProg, sortDay } from './reorder'

const DSNAP = JSON.stringify(DAYS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
})

describe('sortWave', () => {
  it('puts a later take-off below an earlier one, leaving the jets inside each formation in their original order', () => {
    const w = DAYS[0].waves[0]
    w.formations = [
      { cs: 'LATE', to: '1200', ld: '1300', aircraft: [{ p: 'a1', w: 'a2' }, { p: 'a3', w: 'a4' }] },
      { cs: 'EARLY', to: '0800', ld: '0900', aircraft: [{ p: 'b1', w: 'b2' }] },
    ]
    expect(sortWave(0, 0)).toBe(true)
    expect(w.formations.map((f: any) => f.cs)).toEqual(['EARLY', 'LATE'])
    /* LATE moved from index 0 to index 1 — its two jets must still read a1,a3 */
    expect(w.formations[1].aircraft.map((a: any) => a.p)).toEqual(['a1', 'a3'])
  })
})

/* THE OUTER ORDER (owner, 11 Aug 26) — until then Sort all tidied the lines
   inside each wave and left the waves themselves wherever they were built. */
describe('sortWaves', () => {
  /* the owner's own case: AVALON built first, SC second, SC wanted on top */
  it('puts the 07:00 SC wave above the 19:00 AVALON wave that was built before it', () => {
    DAYS[0].waves = [
      { label: 'AVALON', kind: 'avalon', standalone: true, noconf: true, formations: [{ cs: 'AVALON', msn: 'NIGHT', to: '19:00', ld: '07:00', aircraft: [] }] },
      { label: 'SC', kind: 'sc', standalone: true, formations: [{ cs: 'SC', msn: 'AM', to: '07:00', ld: '13:00', aircraft: [] }, { cs: 'SC', msn: 'PM', to: '13:00', ld: '19:00', aircraft: [] }] },
    ]
    expect(sortWaves(0)).toBe(true)
    expect(DAYS[0].waves.map((w: any) => w.label)).toEqual(['SC', 'AVALON'])
  })

  /* THE SHIFT HOURS ARE DEFAULTS, NOT FACTS (owner, 11 Aug 26 — "these are
     default times, don't hardcode it … apply the same logic based on what u
     see"). SAWAVE stamps 07:00 on a new SC and 19:00 on a new AVALON, and
     the scheduler is free to retype either the moment it exists. So the key
     is read live off `f.to` every time the sorter runs and no wave KIND
     carries an assumed hour anywhere in this file — invert the two defaults
     and the order must invert with them. */
  it('follows the times actually in the cells, not the hours SC and AVALON come up with', () => {
    DAYS[0].waves = [
      { label: 'SC', kind: 'sc', standalone: true, formations: [{ cs: 'SC', msn: 'AM', to: '09:00', ld: '15:00', aircraft: [] }] },
      { label: 'AVALON', kind: 'avalon', standalone: true, noconf: true, formations: [{ cs: 'AVALON', msn: 'NIGHT', to: '05:00', ld: '11:00', aircraft: [] }] },
    ]
    /* a 05:00 AVALON is above a 09:00 SC — the opposite of the default pair,
       and the assertion fails the moment anything reads the kind instead */
    expect(sortWaves(0)).toBe(true)
    expect(DAYS[0].waves.map((w: any) => w.label)).toEqual(['AVALON', 'SC'])
  })

  it('re-reads the times on every run, so retyping one take-off is enough to move its wave', () => {
    DAYS[0].waves = [
      { label: 'EARLY', formations: [{ cs: 'e', to: '0700', aircraft: [] }] },
      { label: 'LATE', formations: [{ cs: 'l', to: '1500', aircraft: [] }] },
    ]
    expect(sortWaves(0)).toBe(false)
    /* the scheduler moves the second wave's take-off to before the first's */
    DAYS[0].waves[1].formations[0].to = '0600'
    expect(sortWaves(0)).toBe(true)
    expect(DAYS[0].waves.map((w: any) => w.label)).toEqual(['LATE', 'EARLY'])
  })

  /* a wave is ranked by its EARLIEST take-off, not its first-typed line —
     which is what makes the inner and outer sorts independent */
  it('ranks a wave by its earliest take-off even when that line is not the first one in it', () => {
    DAYS[0].waves = [
      { label: 'A', formations: [{ cs: 'a1', to: '1000', aircraft: [] }, { cs: 'a2', to: '0800', aircraft: [] }] },
      { label: 'B', formations: [{ cs: 'b1', to: '0900', aircraft: [] }] },
    ]
    expect(sortWaves(0)).toBe(false)
    expect(DAYS[0].waves.map((w: any) => w.label)).toEqual(['A', 'B'])
  })

  /* BB sets its own hours, so a standalone wave can genuinely carry no time
     at all — and a wave whose last line was just deleted carries none either */
  it('sinks a wave with no parseable take-off anywhere in it to the bottom', () => {
    DAYS[0].waves = [
      { label: 'BB', kind: 'bb', standalone: true, formations: [{ cs: 'BB', msn: 'SHIFT', to: '', ld: '', aircraft: [] }] },
      { label: 'EMPTY', formations: [] },
      { label: 'WAVE 1', formations: [{ cs: 'x', to: '0800', aircraft: [] }] },
    ]
    expect(sortWaves(0)).toBe(true)
    /* the two time-less waves keep the order they were built in */
    expect(DAYS[0].waves.map((w: any) => w.label)).toEqual(['WAVE 1', 'BB', 'EMPTY'])
  })

  it('carries a seat, a remark and a wave label key onto the wave\'s new address', () => {
    DAYS[0].waves = [
      { label: 'LATE', formations: [{ cs: 'L', to: '1900', aircraft: [{ p: 'x', w: 'y' }] }] },
      { label: 'EARLY', formations: [{ cs: 'E', to: '0700', aircraft: [{ p: 'a', w: 'b' }] }] },
    ]
    SCHED.changes = { '0.0.0.0.p': 1, 'fr:0.0.0.0': 1, 'wl:0.0': 1, 'it:0.0': 1 }
    SCHED.als = [{ n: 1, keys: ['0.0.0.0.p', 'wl:0.0'], sign: {} }]
    expect(sortWaves(0)).toBe(true)
    /* LATE moved from wave 0 to wave 1 — every key space that carries a wave
       index has to follow it, or an old amendment silently re-labels itself
       as being about whichever wave took its place */
    expect(SCHED.changes['0.1.0.0.p']).toBe(1)
    expect(SCHED.changes['fr:0.1.0.0']).toBe(1)
    expect(SCHED.changes['wl:0.1']).toBe(1)
    expect(SCHED.changes['it:0.1']).toBe(1)
    expect(SCHED.als[0].keys).toEqual(['0.1.0.0.p', 'wl:0.1'])
    /* the wave now sitting on top is what the sort itself marks pending */
    expect(SCHED.pending['wl:0.0']).toBe(1)
  })

  it('is a no-op — returns false and marks nothing — on waves already in take-off order', () => {
    DAYS[0].waves = [
      { label: 'A', formations: [{ cs: 'a', to: '0800', aircraft: [] }] },
      { label: 'B', formations: [{ cs: 'b', to: '1300', aircraft: [] }] },
    ]
    expect(sortWaves(0)).toBe(false)
    expect(SCHED.pending).toEqual({})
  })
})

describe('sortDutyBlocks', () => {
  it('orders the blocks by the earliest start time in each, keeping every label as typed', () => {
    DAYS[0].dutywaves = [
      { label: 'AVALON duties', sa: 'avalon', rows: [{ role: 'SXO', str: '1900' }, { role: 'OPS O', str: '1900' }] },
      { label: '1st wave', rows: [{ role: 'SDO', str: '0700' }, { role: 'SXO', str: '0600' }] },
    ]
    expect(sortDutyBlocks(0)).toBe(true)
    expect(DAYS[0].dutywaves.map((x: any) => x.label)).toEqual(['1st wave', 'AVALON duties'])
    /* the sa marker travels with its block — that is what keeps an AVALON
       desk tied to its wave when either of them moves */
    expect(DAYS[0].dutywaves[1].sa).toBe('avalon')
  })

  /* the duty half of the same rule: an AVALON desk is stamped 19:00 by
     waveDutyBlock and every one of those is an ordinary editable cell
     afterwards, so a desk retyped to an early start sorts to the top */
  it('follows the times actually in the rows, not the hours a wave\'s desk comes up with', () => {
    DAYS[0].dutywaves = [
      { label: '1st wave', rows: [{ role: 'SDO', str: '1400' }, { role: 'SXO', str: '1500' }] },
      { label: 'AVALON duties', sa: 'avalon', rows: [{ role: 'SXO', str: '0500' }] },
    ]
    expect(sortDutyBlocks(0)).toBe(true)
    expect(DAYS[0].dutywaves.map((x: any) => x.label)).toEqual(['AVALON duties', '1st wave'])
  })

  it('carries a name, a role and a block-label key onto the block\'s new address', () => {
    DAYS[0].dutywaves = [
      { label: 'PM', rows: [{ role: 'SDO', id: 'x', str: '1300' }] },
      { label: 'AM', rows: [{ role: 'SDO', id: 'y', str: '0700' }] },
    ]
    SCHED.changes = { 'd:0.0.0': 1, 'dr:0.0.0.role': 1, 'dl:0.0': 1 }
    expect(sortDutyBlocks(0)).toBe(true)
    expect(SCHED.changes['d:0.1.0']).toBe(1)
    expect(SCHED.changes['dr:0.1.0.role']).toBe(1)
    expect(SCHED.changes['dl:0.1']).toBe(1)
    expect(SCHED.pending['dl:0.0']).toBe(1)
  })

  it('sinks a block with no start time anywhere in it to the bottom', () => {
    DAYS[0].dutywaves = [
      { label: 'BB duties', rows: [{ role: 'SXO', str: '' }] },
      { label: 'AM', rows: [{ role: 'SDO', str: '0700' }] },
    ]
    expect(sortDutyBlocks(0)).toBe(true)
    expect(DAYS[0].dutywaves.map((x: any) => x.label)).toEqual(['AM', 'BB duties'])
  })

  it('is a no-op — returns false and marks nothing — on blocks already in start-time order', () => {
    DAYS[0].dutywaves = [
      { label: 'AM', rows: [{ role: 'SDO', str: '0700' }] },
      { label: 'PM', rows: [{ role: 'SDO', str: '1300' }] },
    ]
    expect(sortDutyBlocks(0)).toBe(false)
    expect(SCHED.pending).toEqual({})
  })
})

/* BY START TIME since 10 Aug 26 (owner) — it used to be role rank, which
   shuffled an SC PM desk above an AM one. A duty block is read down the day. */
describe('sortDutyBlock', () => {
  it('orders by start time, whatever the roles are called', () => {
    const dw = DAYS[0].dutywaves[0]
    dw.rows = [
      { role: 'OPS O PM', id: 'x', str: '1300' }, { role: 'SDO', id: 'y', str: '0700' },
      { role: 'SXO PM', id: 'z', str: '1300' }, { role: 'SXO AM', id: 'w', str: '0700' },
    ]
    expect(sortDutyBlock(0, 0)).toBe(true)
    /* the two 0700s keep the order they were typed in — a tie must not
       reshuffle, or a scheduler's own arrangement is lost to a sort */
    expect(dw.rows.map((r: any) => r.role)).toEqual(['SDO', 'SXO AM', 'OPS O PM', 'SXO PM'])
  })

  it('a row with no time yet sinks to the bottom, not to the top', () => {
    const dw = DAYS[0].dutywaves[0]
    dw.rows = [{ role: '', id: '' }, { role: 'SDO', id: 'y', str: '0700' }]
    expect(sortDutyBlock(0, 0)).toBe(true)
    expect(dw.rows.map((r: any) => r.role)).toEqual(['SDO', ''])
  })

  it('role order alone no longer moves anything', () => {
    const dw = DAYS[0].dutywaves[0]
    dw.rows = [{ role: 'OPS-O', str: '0700' }, { role: 'SDO', str: '0700' }]
    expect(sortDutyBlock(0, 0)).toBe(false)
    expect(dw.rows.map((r: any) => r.role)).toEqual(['OPS-O', 'SDO'])
  })
})

describe('sortSims', () => {
  it('sorts AMT without touching OFT', () => {
    DAYS[0].sims = {
      amt: [{ label: 'B', str: '1000' }, { label: 'A', str: '0800' }],
      oft: [{ label: 'Y', str: '1500' }, { label: 'X', str: '0900' }],
    }
    const oftWas = JSON.stringify(DAYS[0].sims.oft)
    expect(sortSims(0, 'amt')).toBe(true)
    expect(DAYS[0].sims.amt.map((r: any) => r.label)).toEqual(['A', 'B'])
    expect(JSON.stringify(DAYS[0].sims.oft)).toBe(oftWas)
  })
})

describe('sortGround', () => {
  it('orders by start time and sets gman to a falsy value, so the day resumes sorting itself', () => {
    DAYS[0].ground = [{ prog: 'B', str: '1000' }, { prog: 'A', str: '0800' }]
    DAYS[0].gman = true
    expect(sortGround(0)).toBe(true)
    expect(DAYS[0].ground.map((r: any) => r.prog)).toEqual(['A', 'B'])
    expect(DAYS[0].gman).toBeFalsy()
  })

  /* the one combination review round 1 found untested: gman was set, but
     the rows it was frozen into already happened to read in time order.
     Nothing about the row array needs to move — yet the day WAS just
     un-frozen, so this must report true, not the silence a pure identity
     check would otherwise report. `.not.toBe` on the reference (not just
     .toEqual on the content) is what actually proves the array was never
     reassigned — matching content alone would pass even if reorder.ts
     rebuilt a new, coincidentally-identical array. */
  it('reports a change and clears gman when the flag was set but the rows already read in time order', () => {
    DAYS[0].ground = [{ prog: 'A', str: '0800' }, { prog: 'B', str: '0900' }]
    DAYS[0].gman = true
    const before = DAYS[0].ground
    expect(sortGround(0)).toBe(true)
    expect(DAYS[0].gman).toBeFalsy()
    expect(DAYS[0].ground).toBe(before)
    expect(DAYS[0].ground.map((r: any) => r.prog)).toEqual(['A', 'B'])
  })
})

describe('sortProg', () => {
  it('orders the Overall programme by start time', () => {
    DAYS[0].allhands = [{ prog: 'B', str: '1000' }, { prog: 'A', str: '0800' }]
    expect(sortProg(0)).toBe(true)
    expect(DAYS[0].allhands.map((x: any) => x.prog)).toEqual(['A', 'B'])
  })
})

describe('the no-op property — an already-sorted section marks nothing', () => {
  it('every sorter returns false and leaves SCHED.pending empty when its section is already in order', () => {
    DAYS[0].waves[0].formations = [{ cs: 'A', to: '0800', ld: '0900', aircraft: [] }, { cs: 'B', to: '0900', ld: '1000', aircraft: [] }]
    DAYS[0].dutywaves[0].rows = [{ role: 'SDO', str: '0700' }, { role: 'SXO', str: '0800' }, { role: 'OPS-O', str: '0900' }]
    DAYS[0].sims = { amt: [{ label: 'A', str: '0800' }], oft: [{ label: 'B', str: '0900' }] }
    DAYS[0].ground = [{ prog: 'A', str: '0800' }]
    DAYS[0].gman = false
    DAYS[0].allhands = [{ prog: 'A', str: '0800' }]
    expect(sortWave(0, 0)).toBe(false)
    expect(sortDutyBlock(0, 0)).toBe(false)
    expect(sortSims(0, 'amt')).toBe(false)
    expect(sortGround(0)).toBe(false)
    expect(sortProg(0)).toBe(false)
    expect(SCHED.pending).toEqual({})
  })
})

describe('a sort carries a pending mark, a changes entry and an issued AL key with its row', () => {
  it('sortGround remaps an existing changes entry and AL key onto the row\'s new address', () => {
    DAYS[0].ground = [{ prog: 'B', str: '1000' }, { prog: 'A', str: '0800' }]
    SCHED.changes = { 'gr:0.0.prog': 1 }
    SCHED.als = [{ n: 1, keys: ['gr:0.0.prog'], sign: {} }]
    expect(sortGround(0)).toBe(true)
    /* B moves from index 0 to index 1, taking its changes/AL key with it */
    expect(SCHED.changes['gr:0.1.prog']).toBe(1)
    expect(SCHED.als[0].keys).toEqual(['gr:0.1.prog'])
    /* the moved-into-place row (A, now at index 0) is what the sort itself marks pending */
    expect(SCHED.pending['gr:0.0.prog']).toBe(1)
  })
})

describe('ties keep model order', () => {
  it('two equal start times keep the order they were typed in, even while the section IS reordered around them', () => {
    DAYS[0].ground = [{ prog: 'Z', str: '1000' }, { prog: 'A', str: '0800' }, { prog: 'B', str: '0800' }]
    expect(sortGround(0)).toBe(true)
    expect(DAYS[0].ground.map((r: any) => r.prog)).toEqual(['A', 'B', 'Z'])
  })
})

describe('sortDay', () => {
  it('sorts every section of the day and leaves notes untouched', () => {
    const di = 0
    DAYS[di].waves[0].formations = [{ cs: 'L', to: '1200', ld: '1300', aircraft: [] }, { cs: 'E', to: '0800', ld: '0900', aircraft: [] }]
    DAYS[di].dutywaves[0].rows = [{ role: 'OPS-O', str: '1300' }, { role: 'SDO', str: '0700' }]
    DAYS[di].sims = { amt: [{ label: 'B', str: '1000' }, { label: 'A', str: '0800' }], oft: [] }
    DAYS[di].ground = [{ prog: 'B', str: '1000' }, { prog: 'A', str: '0800' }]
    DAYS[di].gman = true
    DAYS[di].allhands = [{ prog: 'B', str: '1000' }, { prog: 'A', str: '0800' }]
    DAYS[di].notes = ['second', 'first']
    expect(sortDay(di)).toBe(true)
    expect(DAYS[di].waves[0].formations.map((f: any) => f.cs)).toEqual(['E', 'L'])
    expect(DAYS[di].dutywaves[0].rows.map((r: any) => r.role)).toEqual(['SDO', 'OPS-O'])   // by TIME now, 0700 before 1300
    expect(DAYS[di].sims.amt.map((r: any) => r.label)).toEqual(['A', 'B'])
    expect(DAYS[di].ground.map((r: any) => r.prog)).toEqual(['A', 'B'])
    expect(DAYS[di].gman).toBeFalsy()
    expect(DAYS[di].allhands.map((x: any) => x.prog)).toEqual(['A', 'B'])
    expect(DAYS[di].notes).toEqual(['second', 'first'])
  })

  /* the owner's own worked example, 11 Aug 26: "what if the timing for first
     wave is 0700 0900, then 2nd wave puts 1000 and 0800 … sort within the
     wave, then arrange the waves by the earliest take-off". The answer he
     gave is the assertion — 0700/0900 first, 0800/1000 second — and the trap
     it guards is ranking a wave by its FIRST line, which would read 1000 for
     the second wave and leave the two in the order they were built. */
  it('sorts the lines inside each wave first, then orders the waves by the earliest take-off in each', () => {
    const di = 0
    DAYS[di].waves = [
      { label: 'WAVE 1', formations: [{ cs: 'a', to: '0700', aircraft: [] }, { cs: 'b', to: '0900', aircraft: [] }] },
      { label: 'WAVE 2', formations: [{ cs: 'c', to: '1000', aircraft: [] }, { cs: 'd', to: '0800', aircraft: [] }] },
    ]
    expect(sortDay(di)).toBe(true)
    expect(DAYS[di].waves.map((w: any) => w.label)).toEqual(['WAVE 1', 'WAVE 2'])
    expect(DAYS[di].waves.map((w: any) => w.formations.map((f: any) => f.to))).toEqual([['0700', '0900'], ['0800', '1000']])
  })

  it('moves a whole wave when its earliest take-off says so, jets and all', () => {
    const di = 0
    DAYS[di].waves = [
      { label: 'AVALON', kind: 'avalon', standalone: true, formations: [{ cs: 'AV', to: '1900', aircraft: [{ p: 'nite', w: 'owl' }] }] },
      { label: 'SC', kind: 'sc', standalone: true, formations: [{ cs: 'SC', to: '1300', aircraft: [] }, { cs: 'SC', to: '0700', aircraft: [] }] },
    ]
    expect(sortDay(di)).toBe(true)
    expect(DAYS[di].waves.map((w: any) => w.label)).toEqual(['SC', 'AVALON'])
    expect(DAYS[di].waves[0].formations.map((f: any) => f.to)).toEqual(['0700', '1300'])
    expect(DAYS[di].waves[1].formations[0].aircraft.map((a: any) => a.p)).toEqual(['nite'])
  })

  it('orders duty blocks by start time in the same pass, after sorting the rows inside each', () => {
    const di = 0
    DAYS[di].dutywaves = [
      { label: 'PM', rows: [{ role: 'OPS O', str: '1900' }, { role: 'SDO', str: '1300' }] },
      { label: 'AM', rows: [{ role: 'SDO', str: '0700' }] },
    ]
    expect(sortDay(di)).toBe(true)
    expect(DAYS[di].dutywaves.map((x: any) => x.label)).toEqual(['AM', 'PM'])
    expect(DAYS[di].dutywaves[1].rows.map((r: any) => r.str)).toEqual(['1300', '1900'])
  })

  it('is a no-op — returns false and marks nothing — on a day that is already sorted', () => {
    const di = 0
    DAYS[di].waves.forEach((w: any) => { w.formations = [] })
    DAYS[di].dutywaves = [{ label: 'DUTY', rows: [{ role: 'SDO' }, { role: 'SXO' }] }]
    DAYS[di].sims = { amt: [{ label: 'A', str: '0800' }], oft: [] }
    DAYS[di].ground = [{ prog: 'A', str: '0800' }]
    DAYS[di].gman = false
    DAYS[di].allhands = [{ prog: 'A', str: '0800' }]
    expect(sortDay(di)).toBe(false)
    expect(SCHED.pending).toEqual({})
  })
})
