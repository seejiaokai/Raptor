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
import { sortWave, sortDutyBlock, sortSims, sortGround, sortProg, sortDay } from './reorder'

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
