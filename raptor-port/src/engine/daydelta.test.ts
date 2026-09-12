/* THE CANONICAL DIFF — Phase 2 (the authoritative "what changed vs the prior
   issued version"). Pins the rid-joined value/structure/order axes so a deletion
   before a surviving row is attributed correctly (P2-R2-03), a content-identical
   reorder is seen while a move-and-move-back nets to nothing (P2-R2-01), and an
   edit-plus-move follows the row by rid. Pure over two day objects — no store. */
import { describe, it, expect } from 'vitest'
import { canonicalDiff } from './canonical'

let n = 0
const rid = () => 'r' + (++n)
/* a ground row with a stable rid */
const g = (prog: string, id = rid(), extra: any = {}) => ({ rid: id, prog, str: '', end: '', who: '', ...extra })
/* a one-aircraft formation */
const f = (cs: string, ac: any[], id = rid()) => ({ rid: id, cs, msn: '', to: '', ld: '', aircraft: ac })
const ac = (p: string, id = rid(), extra: any = {}) => ({ rid: id, p, w: '', area: null, atime: null, opts: {}, ...extra })
const wave = (label: string, forms: any[], id = rid()) => ({ rid: id, label, night: false, intimes: [], traffic: [], formations: forms })
const day = (over: any = {}) => ({ dow: 'Mon', dt: 'Jul 13', notes: [], allhands: [], waves: [], sims: { amt: [], oft: [] }, dutywaves: [], ground: [], simnotes: '', prognotes: '', dutynotes: '', grndnotes: '', ...over })
const kinds = (d: any[]) => d.map(e => e.kind).sort()

describe('canonicalDiff — value axis (rid-joined)', () => {
  it('a field edit on a surviving row is one change, attributed to that row', () => {
    const a1 = ac('p1', 'A'); const prev = day({ ground: [g('EVT', 'G1')], waves: [wave('W', [f('VIPER', [a1], 'F1')], 'WV')] })
    const next = JSON.parse(JSON.stringify(prev)); next.waves[0].formations[0].cs = 'HORNET'
    const d = canonicalDiff(prev, next, 0)
    expect(d.length).toBe(1)
    expect(d[0].kind).toBe('change')
    expect(d[0].addr).toContain('ff:0')
  })

  it('identical days ⇒ empty delta', () => {
    const prev = day({ ground: [g('EVT', 'G1')], waves: [wave('W', [f('V', [ac('p', 'A')], 'F')], 'WV')] })
    expect(canonicalDiff(prev, JSON.parse(JSON.stringify(prev)), 0)).toEqual([])
  })

  it('a per-aircraft area edit is NOT faked as a formation change (ar/at decomposed)', () => {
    const prev = day({ waves: [wave('W', [f('V', [ac('p1', 'A', { area: 'N' }), ac('p2', 'B', { area: 'S' })], 'F')], 'WV')] })
    const next = JSON.parse(JSON.stringify(prev)); next.waves[0].formations[0].aircraft[1].area = 'E'
    const d = canonicalDiff(prev, next, 0)
    expect(d.length).toBe(1)
    expect(d[0].addr).toContain('aa:0')
  })
})

describe('canonicalDiff — additions on a SURVIVING row (P2-IMPL-06)', () => {
  it('appending a person to a programme who[] is a change on the surviving row', () => {
    const prev = day({ allhands: [{ rid: 'AH', prog: 'BRIEF', str: '', end: '', rmks: '', who: ['p1'] }] })
    const next = JSON.parse(JSON.stringify(prev)); next.allhands[0].who = ['p1', 'p2']
    const d = canonicalDiff(prev, next, 0)
    expect(kinds(d)).toEqual(['change'])          // NOT empty — the new crew slot must be seen
    expect(d[0].addr).toBe('a:0.0.1')
    expect(d[0].to).toBe('p2')
  })

  it('appending a positional NOTE is exactly one add, not a change+add double-count (P2-REREVIEW-09)', () => {
    const prev = day({ notes: ['first'] })
    const next = day({ notes: ['first', 'second'] })
    const d = canonicalDiff(prev, next, 0)
    expect(kinds(d)).toEqual(['add'])              // the structure/notes axis owns it — the value axis must NOT also fire
    expect(d[0].addr).toBe('dn:0.1')
  })

  it('an overflow sim more[] slot added on a surviving row is a change', () => {
    const prev = day({ sims: { amt: [{ rid: 'S', label: 'AMT', str: '', end: '', rmks: '', p: 'p1', w: 'p2' }], oft: [] } })
    const next = JSON.parse(JSON.stringify(prev)); next.sims.amt[0].more = ['p3']
    const d = canonicalDiff(prev, next, 0)
    expect(d.some(e => e.kind === 'change' && e.addr === 's:0.amt.0.x0' && e.to === 'p3')).toBe(true)
  })

  it('a newly-appearing cancelled-duty reason on a surviving row is captured on the duty-row composite (P2-IMPL-08 — cxr folded into dr:...role, no bxr)', () => {
    const prev = day({ dutywaves: [{ rid: 'B', label: 'D', rows: [{ rid: 'R', role: 'SOF', str: '', end: '', rmks: '' }] }] })
    const next = JSON.parse(JSON.stringify(prev)); next.dutywaves[0].rows[0].cx = true; next.dutywaves[0].rows[0].cxr = 'weather'
    const d = canonicalDiff(prev, next, 0)
    // ONE change on the duty row's role composite (which now carries cx + cxr), no bxr, no double-count
    const chg = d.filter(e => e.kind === 'change')
    expect(chg.length).toBe(1)
    expect(chg[0].addr).toBe('dr:0.0.0.role')
    expect(chg[0].to).toContain('weather')
    expect(d.some(e => String(e.addr).startsWith('bxr:'))).toBe(false)
  })
})

describe('canonical-only fields are attributed to their ROW composite, no synthetic (P2-REREVIEW-10)', () => {
  it('wave standalone, dutyblock sa and ground src each land on the row composite (wl:/dl:/gr:), not wx/bx/gx', () => {
    const prev = day({
      waves: [wave('W', [f('V', [ac('p', 'A')], 'F')], 'WV')],
      dutywaves: [{ rid: 'B', label: 'D', rows: [{ rid: 'R', role: 'SOF', str: '', end: '', rmks: '' }] }],
      ground: [g('E', 'G1')],
    })
    const next = JSON.parse(JSON.stringify(prev))
    next.waves[0].standalone = true
    next.dutywaves[0].sa = 'sc'
    next.ground[0].src = 'inp9'
    const addrs = canonicalDiff(prev, next, 0).filter(e => e.kind === 'change').map(e => e.addr)
    expect(addrs).toContain('wl:0.0')          // wave standalone → the wave header (a dayKeys key the mark system walks)
    expect(addrs).toContain('dl:0.0')          // dutyblock sa → the block header
    expect(addrs).toContain('gr:0.0.prog')     // ground src → the ground row
    expect(addrs.some(a => /^(wx|fx|bx|gx):/.test(String(a))), 'no canonicalContent-only synthetic remains').toBe(false)
  })
})

describe('canonicalDiff — structure axis (P2-R2-03)', () => {
  it('deleting the FIRST of two ground rows is ONE delete, not a chain of changes', () => {
    const prev = day({ ground: [g('A', 'G1'), g('B', 'G2')] })
    const next = day({ ground: [{ ...g('B', 'G2') }] })
    const d = canonicalDiff(prev, next, 0)
    expect(kinds(d)).toEqual(['delete'])          // exactly one delete, no phantom change on the survivor
  })

  it('adding a wave is one add (ancestor-collapsing over its formation/aircraft)', () => {
    const prev = day({ waves: [wave('W1', [f('V', [ac('p', 'A')], 'F1')], 'WV1')] })
    const next = day({ waves: [wave('W1', [f('V', [ac('p', 'A')], 'F1')], 'WV1'), wave('W2', [f('X', [ac('q', 'A2')], 'F2')], 'WV2')] })
    const d = canonicalDiff(prev, next, 0)
    expect(kinds(d)).toEqual(['add'])             // one wave add, not add×(wave+formation+aircraft)
  })
})

describe('canonicalDiff — order axis (P2-R2-01)', () => {
  it('a content-identical reorder of two waves is seen as a move', () => {
    const w1 = wave('SAME', [f('V', [ac('p', 'A')], 'F1')], 'WV1')
    const w2 = wave('SAME', [f('V', [ac('q', 'A2')], 'F2')], 'WV2')
    const prev = day({ waves: [w1, w2] })
    const next = day({ waves: [JSON.parse(JSON.stringify(w2)), JSON.parse(JSON.stringify(w1))] })
    const d = canonicalDiff(prev, next, 0)
    expect(d.some(e => e.kind === 'move')).toBe(true)
  })

  it('move-and-move-back nets to NO change (order from actual state, not marks)', () => {
    const w1 = wave('A', [f('V', [ac('p', 'A')], 'F1')], 'WV1')
    const w2 = wave('B', [f('X', [ac('q', 'A2')], 'F2')], 'WV2')
    const prev = day({ waves: [w1, w2] })
    const next = day({ waves: [JSON.parse(JSON.stringify(w1)), JSON.parse(JSON.stringify(w2))] })   // same order
    expect(canonicalDiff(prev, next, 0)).toEqual([])
  })

  it('edit-plus-move: the value change follows the row by rid, plus one move', () => {
    const w1 = wave('A', [f('VIPER', [ac('p', 'A')], 'F1')], 'WV1')
    const w2 = wave('B', [f('HORNET', [ac('q', 'A2')], 'F2')], 'WV2')
    const prev = day({ waves: [w1, w2] })
    // swap order AND rename the (moved) first wave's formation
    const m2 = JSON.parse(JSON.stringify(w2)), m1 = JSON.parse(JSON.stringify(w1))
    m1.formations[0].cs = 'TOMCAT'
    const next = day({ waves: [m2, m1] })
    const d = canonicalDiff(prev, next, 0)
    const change = d.filter(e => e.kind === 'change')
    expect(change.length).toBe(1)
    expect(change[0].to).toBe('TOMCAT␟0␟␟')        // cs composite (cs␟cx␟shift␟cxr) for the row that moved+changed
    expect(d.some(e => e.kind === 'move')).toBe(true)
  })
})
