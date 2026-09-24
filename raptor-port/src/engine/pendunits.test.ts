/* THE COUNTING UNIT OF "N PENDING" (owner, D109, 25 Sep 26 — "A move counts as one"). The stored amendment diff
   is unchanged; what changes is the unit a person COUNTS it in: a man (or a placeholder) taken off one place and put
   on another place of the SAME day is ONE change, a swap is two, times / areas / remarks one per box. Pure over two
   day objects, like canonicalDiff's own tests (daydelta.test.ts). Batch item 14,
   docs/superpowers/plans/2026-09-25-amendment-batch-plan.md §2. */
import { describe, it, expect } from 'vitest'
import { canonicalDiff, canonicalUnits } from './canonical'
import { whoId } from './people'

let n = 0
const rid = () => 'u' + (++n)
const ac = (p: string, w = '', id = rid()) => ({ rid: id, p, w, rmks: '', area: null, atime: null, opts: {} })
const f = (cs: string, acs: any[], id = rid()) => ({ rid: id, cs, msn: '', to: '07:00', ld: '08:00', aircraft: acs })
const wave = (label: string, forms: any[], id = rid()) => ({ rid: id, label, night: false, intimes: [], traffic: [], formations: forms })
const duty = (role: string, id: string, more: string[] = [], rowId = rid()) => ({ rid: rowId, role, str: '08:00', end: '09:00', rmks: '', id, more })
const block = (label: string, rows: any[], id = rid()) => ({ rid: id, label, rows })
const gr = (prog: string, who: string, id = rid()) => ({ rid: id, prog, str: '10:00', end: '11:00', rmks: '', who })
const prog = (p: string, who: string[], id = rid()) => ({ rid: id, prog: p, str: '12:00', end: '13:00', rmks: '', who })
const day = (over: any = {}) => ({ dow: 'Mon', dt: 'Jul 13', notes: [], allhands: [], waves: [], sims: { amt: [], oft: [] }, dutywaves: [], ground: [], simnotes: '', prognotes: '', dutynotes: '', grndnotes: '', ...over })
const clone = (d: any) => JSON.parse(JSON.stringify(d))
const units = (a: any, b: any) => canonicalUnits(a, b, 0)

/* his own case (D109): Monday's MET + NOTAM BRIEF and an empty SODB on one duty block */
function metDay() {
  return day({ dutywaves: [block('DUTIES', [duty('MET + NOTAM BRIEF', 'warden', [], 'MET'), duty('SODB', '', [], 'SODB'), duty('SOF', 'reaper0', [], 'SOF')], 'BLK')] })
}

describe('a move counts as ONE pending change (D109, AM23)', () => {
  it('Warden moved from MET + NOTAM BRIEF to an empty SODB is ONE change — his case, which read "2 pending"', () => {
    const was = metDay(), now = clone(was)
    now.dutywaves[0].rows[0].id = ''; now.dutywaves[0].rows[1].id = 'warden'
    expect(canonicalDiff(was, now, 0).length).toBe(2)          // what goes out is unchanged: two cells differ
    const u = units(was, now)
    expect(u.length).toBe(1)
    expect(u[0].kind).toBe('reseat')
    expect(u[0].token).toBe(whoId('warden') || 'warden')   // the man, by his id (the demo roster's Warden)
  })

  it('…and Reaper then put into the row Warden left reads TWO (D109: "putting Reaper into the row Warden left then reads 2")', () => {
    const was = metDay(), now = clone(was)
    now.dutywaves[0].rows[0].id = 'reaper'; now.dutywaves[0].rows[1].id = 'warden'
    const u = units(was, now)
    expect(u.length).toBe(2)
    expect(u.map(x => x.kind).sort()).toEqual(['people', 'reseat'])
  })

  it('a swap of two men is TWO changes (two moves)', () => {
    const was = day({ waves: [wave('W1', [f('VIPER', [ac('piston', '', 'A1'), ac('outlaw', '', 'A2')], 'F1')], 'W1')] }), now = clone(was)
    now.waves[0].formations[0].aircraft[0].p = 'outlaw'; now.waves[0].formations[0].aircraft[1].p = 'piston'
    const u = units(was, now)
    expect(u.length).toBe(2)
    expect(u.every(x => x.kind === 'reseat')).toBe(true)
  })

  it('a pilot moved from the front seat to the back seat of the same jet is ONE move', () => {
    const was = day({ waves: [wave('W1', [f('VIPER', [ac('piston', '', 'A1')], 'F1')], 'W1')] }), now = clone(was)
    now.waves[0].formations[0].aircraft[0].p = ''; now.waves[0].formations[0].aircraft[0].w = 'piston'
    expect(units(was, now).length).toBe(1)
  })

  it('a man only taken off is ONE; a man only added is ONE', () => {
    const was = metDay()
    const off = clone(was); off.dutywaves[0].rows[0].id = ''
    expect(units(was, off).length).toBe(1)
    const on = clone(was); on.dutywaves[0].rows[1].id = 'blaze'
    expect(units(was, on).length).toBe(1)
  })

  it('a replacement inside one box (A → B, neither moved elsewhere) is ONE — one box, one line (the plan\'s GAP call)', () => {
    const was = metDay(), now = clone(was)
    now.dutywaves[0].rows[2].id = 'blaze'
    expect(units(was, now).length).toBe(1)
  })

  it('a move put back is NOTHING (AM20)', () => {
    const was = metDay(), now = clone(was)
    expect(units(was, now)).toEqual([])
  })

  it('times, areas and remarks still count one per box', () => {
    const was = metDay(), now = clone(was)
    now.dutywaves[0].rows[0].str = '08:30'; now.dutywaves[0].rows[0].rmks = 'moved'; now.dutywaves[0].rows[1].end = '10:00'
    expect(units(was, now).length).toBe(3)
  })

  it('a man moved AND a time changed on the same rows is two', () => {
    const was = metDay(), now = clone(was)
    now.dutywaves[0].rows[0].id = ''; now.dutywaves[0].rows[1].id = 'warden'; now.dutywaves[0].rows[1].str = '08:15'
    expect(units(was, now).length).toBe(2)
  })

  it('an extra taken out of a row whose list closes up is ONE (the list compaction is not a second change)', () => {
    const was = day({ dutywaves: [block('D', [duty('SOF', 'lead', ['a1', 'b2'], 'R1')], 'B1')] }), now = clone(was)
    now.dutywaves[0].rows[0].more = ['b2']
    expect(canonicalDiff(was, now, 0).length).toBe(2)          // x0 a1→b2 and the x1 hole
    expect(units(was, now).length).toBe(1)
  })

  it('the desk holder and an extra of one row trading places is a SWAP — two, never zero (the holder and the extras are two places)', () => {
    const was = day({ dutywaves: [block('D', [duty('SOF', 'lead', ['wing'], 'R1')], 'B1')] }), now = clone(was)
    now.dutywaves[0].rows[0].id = 'wing'; now.dutywaves[0].rows[0].more = ['lead']
    expect(units(was, now).map(x => x.kind)).toEqual(['reseat', 'reseat'])
  })

  it('a man moved from a desk’s holder box to its own extras line is ONE move (Fable S1b — it counted nothing when the two were one place)', () => {
    const was = day({ dutywaves: [block('D', [duty('SODB', 'tally', [], 'R1')], 'B1')] }), now = clone(was)
    now.dutywaves[0].rows[0].id = ''; now.dutywaves[0].rows[0].more = ['tally']
    const u = units(was, now)
    expect(u.length).toBe(1)
    expect(u[0].kind).toBe('reseat')
  })

  it('two men re-ordered inside one row’s crowd is ONE change — the same people, a different order (Fable S1c)', () => {
    const was = day({ allhands: [prog('MET + NOTAM BRIEF', ['warden', 'reaper'], 'P1')] }), now = clone(was)
    now.allhands[0].who = ['reaper', 'warden']
    const u = units(was, now)
    expect(u.length).toBe(1)
    expect(u[0].order).toBe(true)
  })

  it('two men taken off one row’s crowd are TWO — a man only taken off is one (Fable S1d, Astra 5)', () => {
    const was = day({ allhands: [prog('MET + NOTAM BRIEF', ['warden', 'reaper', 'tally'], 'P1')] }), now = clone(was)
    now.allhands[0].who = ['tally']
    expect(units(was, now).length).toBe(2)
  })

  it('a placeholder (ALL AVAIL) moved from a ground row to a programme row is ONE (D109: "or a placeholder")', () => {
    const was = day({ ground: [gr('MASS BRIEF', 'ALL AVAIL', 'G1')], allhands: [prog('OPS BRIEF', [], 'P1')] }), now = clone(was)
    now.ground[0].who = ''; now.allhands[0].who = ['ALL AVAIL']
    const u = units(was, now)
    expect(u.length).toBe(1)
    expect(u[0].kind).toBe('reseat')
  })

  it('a man moved from one programme row\'s crowd to another is one, and the row he left closing up adds nothing', () => {
    const was = day({ allhands: [prog('BRIEF A', ['x1', 'x2', 'x3'], 'P1'), prog('BRIEF B', ['y1'], 'P2')] }), now = clone(was)
    now.allhands[0].who = ['x1', 'x3']; now.allhands[1].who = ['y1', 'x2']
    expect(units(was, now).length).toBe(1)
  })

  it('a man moved into a brand-new row is the row added plus HIS MOVE — two, and the list can say where he went (Fable S2)', () => {
    const was = metDay(), now = clone(was)
    now.dutywaves[0].rows[0].id = ''; now.dutywaves[0].rows.push(duty('NEW DESK', 'warden', [], 'NEW'))
    const u = units(was, now)
    expect(u.map(x => x.kind).sort()).toEqual(['add', 'reseat'])
  })

  it('a man moved OUT of a row that was then removed is the removal plus his move — and "from" names the removed row from the issued day', () => {
    const was = metDay(), now = clone(was)
    now.dutywaves[0].rows.splice(0, 1)                         // MET + NOTAM BRIEF removed
    now.dutywaves[0].rows[0].id = 'warden'                      // Warden now on SODB
    const u = units(was, now)
    expect(u.map(x => x.kind).sort()).toEqual(['delete', 'reseat'])
    const r = u.find(x => x.kind === 'reseat')!
    expect(r.from, 'the row is gone from the live day').toBe('')
    expect(r.fromIssued).toBe('d:0.0.0')
  })

  it('a man only in a removed row and a new row (a row replaced) is the removal and the add — no move on top', () => {
    const was = metDay(), now = clone(was)
    now.dutywaves[0].rows.splice(0, 1); now.dutywaves[0].rows.push(duty('MET 2', 'warden', [], 'NEWMET'))
    expect(units(was, now).map(x => x.kind).sort()).toEqual(['add', 'delete'])
  })

  it('pairs by row identity, not position — a reorder then a move reads as the move', () => {
    const was = metDay(), now = clone(was)
    now.dutywaves[0].rows.reverse()                              // SOF, SODB, MET
    now.dutywaves[0].rows[2].id = ''; now.dutywaves[0].rows[1].id = 'warden'
    const u = units(was, now)
    expect(u.map(x => x.kind).sort()).toEqual(['move', 'reseat'])   // one reorder + one man moved
  })

  it('never zero while the delta is not: every non-empty diff yields at least one unit', () => {
    const was = metDay()
    const cases: Array<(d: any) => void> = [
      d => { d.dutywaves[0].rows[0].id = '' },
      d => { d.dutywaves[0].rows[1].more = ['z'] },
      d => { d.dutywaves[0].rows.reverse() },
      d => { d.dutywaves[0].rows[0].id = 'reaper0'; d.dutywaves[0].rows[2].id = 'warden' },
      d => { d.dutywaves[0].rows.splice(1, 1) },
      d => { d.dutywaves[0].label = 'X' },
    ]
    for (const mut of cases) {
      const now = clone(was); mut(now)
      const dl = canonicalDiff(was, now, 0).length, ul = units(was, now).length
      expect(dl > 0).toBe(true)
      expect(ul).toBeGreaterThan(0)
      expect(ul).toBeLessThanOrEqual(dl)
    }
  })
})
