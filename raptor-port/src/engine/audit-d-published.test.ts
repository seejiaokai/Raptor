/* AUDIT D — pending marks and the AL on a PUBLISHED day, across Sort all and
   drag (PR 155's sortWaves/sortDutyBlocks plus the standing movers).
   Three questions, each answered against the values in the rows rather than
   the indices, so a mis-permuted head cannot pass by coincidence:
   - do pending marks FOLLOW their rows through a sort / a drag, so the next
     AL amends the right sortie;
   - is Sort all on a published day with NO other edits a sane diff (one head
     mark per section moved, never one per cell);
   - does an AL issued after the sort carry keys that resolve to the rows the
     marks were made on. Harness follows publish.test.ts (sign helper) and
     sort.test.ts (DAYS snapshot). */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { SCHED, signOf, setDayApproved, publishAL, markEdit, pendCount } from './publish'
import { sortDay, sortDutyBlocks, applyMove, popReorderedDay } from './reorder'
import { dayKeys } from './restore'

const DSNAP = JSON.stringify(DAYS)
const sign = (di: number) => {
  const g = signOf(di)
  g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
}
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  popReorderedDay()
})

/* an out-of-order day 0: two waves and two duty blocks built backwards */
function scramble() {
  const d = DAYS[0]
  d.waves = [
    { label: 'W-LATE', formations: [
      { cs: 'LATE-B', msn: 'MB', to: '1500', ld: '1600', aircraft: [{ p: 'x1', w: 'x2', rmks: 'RB', opts: {} }] },
      { cs: 'LATE-A', msn: 'MA', to: '1300', ld: '1400', aircraft: [{ p: 'x3', w: 'x4', rmks: 'RA', opts: {} }] },
    ] },
    { label: 'W-EARLY', formations: [
      { cs: 'EARLY', msn: 'ME', to: '0800', ld: '0900', aircraft: [{ p: 'x5', w: 'x6', rmks: 'RE', opts: {} }] },
    ] },
  ]
  d.dutywaves = [
    { label: 'PM DESK', rows: [
      { role: 'SDO', id: 'd1', str: '1300', end: '1900', rmks: '' },
      { role: 'SXO', id: 'd2', str: '1500', end: '2100', rmks: '' },
    ] },
    { label: 'AM DESK', rows: [
      { role: 'SDO', id: 'd3', str: '0700', end: '1300', rmks: '' },
    ] },
  ]
  d.sims = { amt: [
    { label: 'AMT-PM', str: '1300', end: '1400', rmks: '', p: 's1', w: 's2' },
    { label: 'AMT-AM', str: '0900', end: '1000', rmks: '', p: 's3', w: 's4' },
  ] }
  d.ground = [
    { prog: 'G-PM', str: '1400', end: '1500', rmks: '', who: '' },
    { prog: 'G-AM', str: '0800', end: '0900', rmks: '', who: '' },
  ]
  d.gman = false
  d.allhands = [
    { prog: 'A-PM', sub: '', str: '1500', end: '1600', who: [] },
    { prog: 'A-AM', sub: '', str: '0700', end: '0800', who: [] },
  ]
  d.notes = []
  return d
}
const publishDay0 = () => { sign(0); setDayApproved(0, true); expect(SCHED.dayOK[0]).toBe(1) }

describe('pending marks follow their rows (scenario 2a)', () => {
  it('an edit marked on a row before Sort all still addresses that row after it, and the issued AL agrees', () => {
    const d = scramble()
    publishDay0()
    /* the scheduler edits three cells on the out-of-order day: a seat on the
       LATE-A formation, the PM SXO's remarks, the AMT-PM sim label */
    d.waves[0].formations[1].aircraft[0].p = 'edited-seat'
    markEdit('0.0.1.0.p')
    d.dutywaves[0].rows[1].rmks = 'edited-duty'
    markEdit('dr:0.0.1.rmks')
    d.sims.amt[0].label = 'edited-sim'
    markEdit('sr:0.amt.0.label')
    expect(sortDay(0)).toBe(true)
    /* the rows moved: LATE wave below EARLY, its formations swapped; PM desk
       below AM; AMT-PM below AMT-AM. Chase each mark to its new address and
       read the MODEL there. */
    const m = dayKeys(DAYS[0], 0)
    expect(m.get('0.1.0.0.p'), 'seat mark followed wave→1, formation→0').toBe('edited-seat')
    expect(SCHED.pending['0.1.0.0.p']).toBe(1)
    expect(String(m.get('dr:0.1.1.rmks'))).toBe('edited-duty')
    expect(SCHED.pending['dr:0.1.1.rmks']).toBe(1)
    expect(String(m.get('sr:0.amt.1.label'))).toContain('edited-sim')
    expect(SCHED.pending['sr:0.amt.1.label']).toBe(1)
    /* no mark still sits at the OLD addresses about to be occupied by other
       rows — that would tint someone else's sortie in the next AL */
    expect(SCHED.pending['0.0.1.0.p']).toBeUndefined()
    expect(SCHED.pending['dr:0.0.1.rmks']).toBeUndefined()
    /* sr:0.amt.0.label IS pending — but as sortSims's own head mark on the
       row now at index 0 (AMT-AM), the documented "mark the NEW address"
       idiom, not a stranded copy of the ridden edit mark */
    expect(SCHED.pending['sr:0.amt.0.label']).toBe(1)
    /* and the AL that goes out addresses the edited rows, not the addresses */
    sign(0)
    publishAL(1)
    const rec = SCHED.als[0]
    expect(rec.keys).toContain('0.1.0.0.p')
    expect(rec.keys).toContain('dr:0.1.1.rmks')
    expect(rec.keys).toContain('sr:0.amt.1.label')
  })

  it('a pending mark follows a hand-dragged duty row on a published day', () => {
    scramble()
    publishDay0()
    DAYS[0].dutywaves[0].rows[1].rmks = 'dragged-row'
    markEdit('dr:0.0.1.rmks')
    expect(applyMove('mv:d.0.0.1', 'mv:d.0.0.0')).toBe(true)
    expect(SCHED.pending['dr:0.0.0.rmks'], 'the mark rode the row to index 0').toBe(1)
    expect(DAYS[0].dutywaves[0].rows[0].rmks).toBe('dragged-row')
    /* the drag itself marks the row at its new address — same key here, so
       pending stays a two-key set: the ridden mark + the mover's role mark */
    expect(SCHED.pending['dr:0.0.0.role']).toBe(1)
    expect(Object.keys(SCHED.pending).sort()).toEqual(['dr:0.0.0.rmks', 'dr:0.0.0.role'])
  })
})

describe('Sort all on a published day with NO other edits is a sane diff (scenario 2b)', () => {
  it('pends one head mark per section that moved — never one key per cell — and the AL carries exactly those', () => {
    scramble()
    publishDay0()
    expect(pendCount(), 'publishing cleared the draft marks').toBe(0)
    expect(sortDay(0)).toBe(true)
    const pend = Object.keys(SCHED.pending).sort()
    /* every mark is a section-head mark (index 0 of the list it sorted) —
       the documented "mark the NEW address" idiom, one line per section */
    const headShapes = [
      /^ff:0\.\d+\.0\.cs$/,   // each wave whose formations moved
      /^wl:0\.0$/,            // the wave list itself
      /^dr:0\.\d+\.0\.role$/, // each duty block whose rows moved
      /^dl:0\.0$/,            // the block list itself
      /^sr:0\.amt\.0\.label$/,
      /^gr:0\.0\.prog$/,
      /^ap:0\.0\.prog$/,
    ]
    pend.forEach(k => expect(headShapes.some(rx => rx.test(k)), `${k} is a section-head mark`).toBe(true))
    /* the exact set, not a loose ceiling: wave 0's formations were the only
       out-of-order rows inside a block (ff:, remapped to gi=1 by the outer
       sort), then the two lists themselves (wl:/dl:), the sims, ground and
       programme — the duty ROWS were built in order, so no dr: mark */
    expect(pend).toEqual(['ap:0.0.prog', 'dl:0.0', 'ff:0.1.0.cs',
      'gr:0.0.prog', 'sr:0.amt.0.label', 'wl:0.0'].sort())
    /* and that is the whole AL */
    sign(0)
    publishAL(1)
    expect(SCHED.als[0].keys.slice().sort()).toEqual(pend)
    expect(SCHED.als[0].n0).toBe(pend.length)
  })

  it('a second Sort all right after is a pure no-op: nothing new pends', () => {
    scramble()
    publishDay0()
    sortDay(0)
    const pend = JSON.stringify(SCHED.pending)
    expect(sortDay(0)).toBe(false)
    expect(JSON.stringify(SCHED.pending)).toBe(pend)
  })
})

describe('an issued AL key retired by the sort mark (documented idiom, pinned so nobody trips on it)', () => {
  it('the sort mark at a section head REPLACES an issued AL tag already at that key — pending wins, the AL record keeps the key', () => {
    scramble()
    publishDay0()
    /* AL1 changed the AM desk's label; the sort then moves the AM desk to
       index 0 and marks dl:0.0 — the exact key AL1 holds after the remap */
    SCHED.changes['dl:0.1'] = 1
    SCHED.als = [{ n: 1, keys: ['dl:0.1'], sign: {} }]
    expect(sortDutyBlocks(0)).toBe(true)
    /* the AL record followed the block (1 → 0) … */
    expect(SCHED.als[0].keys).toEqual(['dl:0.0'])
    /* … and the sorter's own mark at the head retired the on-screen AL tint
       for the pending one, the same way any re-edit of an AL'd cell does
       (publish.ts markEdit deletes changes[key]). Deliberate; documented in
       reorder.test.ts's moveAircraft comment. */
    expect(SCHED.changes['dl:0.0']).toBeUndefined()
    expect(SCHED.pending['dl:0.0']).toBe(1)
  })
})
