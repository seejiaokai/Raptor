/* AUDIT D — key-space integrity of the sort/reorder machinery (PR 155 and the
   applyMove/moveKeys base it stands on). Adversarial composition: a day built
   out of order, rows added, a middle row deleted, rows dragged, then Sort all
   (sortDay) — and after all of it every amendment key must still address the
   value it was attached to, with no orphans and no collided addresses.
   The oracle is dayKeys (engine/restore.ts), the executable documentation of
   the slot-key grammar: seed an issued AL with EVERY key of the day, run the
   composition, and the remapped AL keys read back the SAME values in the SAME
   order (minus only the deleted row's, which shiftKeys must drop).
   Snapshot/restore of DAYS follows sort.test.ts so mutations cannot leak. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { SCHED, markStructuralAdd, structuralAddExists, markDeletion, deletionWasIssued } from './publish'
import { shiftKeys } from './keys'
import { applyMove, sortDay, sortWaves, sortDutyBlocks, sortGround, moveGroundRow, popReorderedDay } from './reorder'
import { dayKeys } from './restore'
import { groundOrder } from './order'
import { makeStandalone, waveDutyBlock, saDutyIx } from './waves'

const DSNAP = JSON.stringify(DAYS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  popReorderedDay()
})

/* a day where nothing is in reading order — inner rows and outer blocks alike,
   with overflow (.xN) values, wave-level intimes/traffic, and per-aircraft
   stores, every identifying field unique so a mis-addressed key cannot read
   back the right value by coincidence. Aircraft areas/atimes stay unset in a
   formation: ar:/at: are ONE JSON key per formation and permuting identical
   nulls is invisible, which keeps those composites order-independent here. */
function scrambleDay0() {
  const d = DAYS[0]
  d.waves = [
    { label: 'W-LATE', night: false, kind: '', intimes: ['1700'], traffic: ['tL'], formations: [
      { cs: 'L1', msn: 'M-L1', to: '1500', ld: '1600', br: '1400', aircraft: [
        { p: 'pl1', w: 'wl1', rmks: 'rl1', opts: { a: 1 } }, { p: 'pl2', w: 'wl2', rmks: 'rl2', opts: { b: 2 } }] },
      { cs: 'L0', msn: 'M-L0', to: '1300', ld: '1400', br: '1200', aircraft: [
        { p: 'pl3', w: 'wl3', rmks: 'rl3', opts: { c: 3 } }] },
    ] },
    { label: 'W-EARLY', night: false, kind: '', intimes: ['1000'], traffic: ['tE'], formations: [
      { cs: 'E0', msn: 'M-E0', to: '0900', ld: '1000', br: '0800', aircraft: [
        { p: 'pe1', w: 'we1', rmks: 're1', opts: { d: 4 } }] },
    ] },
    { label: 'W-MID', night: false, kind: '', intimes: ['1200'], traffic: ['tM'], formations: [
      { cs: 'M0', msn: 'M-M0', to: '1100', ld: '1200', br: '1000', aircraft: [
        { p: 'pm1', w: 'wm1', rmks: 'rm1', opts: { e: 5 } }] },
    ] },
  ]
  d.dutywaves = [
    { label: 'DESK-PM', rows: [
      { role: 'SDO', id: 'da1', str: '1300', end: '1900', rmks: 'dm1', more: ['dx1'] },
      { role: 'FREETEXT DESK', id: 'da2', str: '1500', end: '2100', rmks: 'dm2', more: ['dx2'] },
      { role: 'SXO', id: 'da3', str: '1400', end: '2000', rmks: 'dm3', more: [] },
    ] },
    { label: 'DESK-AM', rows: [
      { role: 'OPS O', id: 'da4', str: '0900', end: '1300', rmks: 'dm4', more: [] },
      { role: 'SDO', id: 'da5', str: '0700', end: '1300', rmks: 'dm5', more: ['dx5'] },
    ] },
  ]
  d.sims = { amt: [
    { label: 'AMT-B', str: '1200', end: '1300', rmks: 'sm1', p: 'sp1', w: 'sw1', more: ['sx1'] },
    { label: 'AMT-A', str: '0800', end: '0900', rmks: 'sm2', p: 'sp2', w: 'sw2', more: [] },
  ], oft: [
    { label: 'OFT-B', str: '1600', end: '1700', rmks: 'sm3', p: 'sp3', w: 'sw3', more: [] },
    { label: 'OFT-A', str: '0700', end: '0800', rmks: 'sm4', p: 'sp4', w: 'sw4', more: [] },
  ] }
  d.ground = [
    { prog: 'G-LATE', str: '1400', end: '1500', rmks: 'gm1', who: 'gw1', more: ['gx1'] },
    { prog: 'G-NONE', str: '', end: '', rmks: 'gm2', who: 'gw2', more: [] },
    { prog: 'G-EARLY', str: '0600', end: '0700', rmks: 'gm3', who: 'gw3', more: [] },
  ]
  d.gman = false
  d.allhands = [
    { prog: 'A-LATE', sub: 'as1', str: '1000', end: '1100', who: ['n1', 'n2'] },
    { prog: 'A-MID', sub: 'as2', str: '0900', end: '0930', who: 'n3' },
    { prog: 'A-EARLY', sub: 'as3', str: '0700', end: '0800', who: [] },
  ]
  d.notes = ['note-a', 'note-b']
  d.simnotes = 'simnote'; d.prognotes = 'prognote'; d.dutynotes = 'dutynote'; d.grndnotes = 'grndnote'
  return d
}

describe('key-space integrity under add + delete + drag + Sort all (scenario 1)', () => {
  it('every issued AL key still reads back the exact value it was attached to, none orphaned, none collided', () => {
    const d = scrambleDay0()

    /* ADD after the day exists: a new formation on the LATE wave (goes to the
       wave's end, blank-but-unique) and a new prog row — both with the same
       structural-add identity the board's + buttons mint */
    d.waves[0].formations.push({ cs: 'ADDED-F', msn: 'M-ADD', to: '1600', ld: '1700', br: '', aircraft: [
      { p: 'padd', w: 'wadd', rmks: 'radd', opts: { z: 9 } }] })
    markStructuralAdd(`ff:0.0.${d.waves[0].formations.length - 1}.cs`)
    d.allhands.push({ prog: 'A-ADDED', sub: 'as4', str: '0630', end: '0700', who: 'n4' })
    markStructuralAdd(`ap:0.${d.allhands.length - 1}.prog`)

    /* the frozen truth: every key of the day and its value, stamped on an
       issued AL in walk order */
    const m0 = dayKeys(d, 0)
    const allKeys = [...m0.keys()]
    const origVals = allKeys.map(k => m0.get(k))
    SCHED.als = [{ n: 1, keys: allKeys.slice(), sign: {} }]
    allKeys.forEach((k, i) => { SCHED.changes[k] = i + 1 })

    /* DELETE a middle duty row (block 0, row 1 — the free-text one, which
       carries an overflow value), through the exact board idiom: splice, then
       shiftKeys on the same heads, then the tombstone */
    const deadKeys = new Set(allKeys.filter(k =>
      k === 'd:0.0.1' || k.startsWith('d:0.0.1.') || k.startsWith('dr:0.0.1.')))
    expect(deadKeys.size, 'sanity: the doomed row carries keys incl. an overflow').toBeGreaterThanOrEqual(6)
    d.dutywaves[0].rows.splice(1, 1)
    ;['d:0.0.', 'dr:0.0.'].forEach(h => shiftKeys(h, 0, 1))
    markDeletion(0, 'duty', true)

    /* DRAG-REORDER through the one entry point the UI calls */
    expect(applyMove('mv:p.0.2', 'mv:p.0.0'), 'prog drag').toBe(true)
    expect(applyMove('mv:d.0.1.1', 'mv:d.0.1.0'), 'duty drag in block 1').toBe(true)
    expect(applyMove('mv:ac.0.0.2.0', 'mv:ac.0.0.0.0'), 'formation carry drag').toBe(true)

    /* SORT ALL */
    expect(sortDay(0)).toBe(true)

    const m1 = dayKeys(DAYS[0], 0)
    const rec = SCHED.als[0]

    /* no address appears twice — a collision would silently merge two
       amendments into one */
    expect(new Set(rec.keys).size).toBe(rec.keys.length)
    /* the marks ON the deleted row are gone, and ONLY those */
    expect(rec.keys.length).toBe(allKeys.length - deadKeys.size)
    /* THE INVARIANT: read every surviving AL key against the live model — each
       must resolve (no orphans) to exactly the value it was issued against, in
       issue order. One mis-permuted head anywhere in sortDay/applyMove/
       shiftKeys shows up here as a value mismatch. */
    const expectVals = allKeys.filter(k => !deadKeys.has(k)).map(k => m0.get(k))
    expect(rec.keys.map((k: any) => m1.get(k))).toEqual(expectVals)

    /* and the whole day, walked fresh, is a value-multiset of the old day
       minus the deleted row — nothing duplicated, nothing lost */
    const sortVals = (m: Map<string, any>) => [...m.values()].sort()
    const survived = [...m0.entries()].filter(([k]) => !deadKeys.has(k)).map(([, v]) => v)
    expect(sortVals(m1)).toEqual(survived.sort())

    /* the structural-add identities followed their rows through everything —
       they still name live structure (the net-no-op delete rule depends on
       exactly this) and still read back the added rows' own values */
    const added = Object.keys(SCHED.added)
    expect(added.length).toBe(2)
    added.forEach(k => expect(structuralAddExists(k), k).toBe(true))
    expect(added.map(k => String(m1.get(k)).split('␟')[0]).sort()).toEqual(['A-ADDED', 'ADDED-F'])
  })
})

describe('sortWaves ordering key — the edges (scenario 3)', () => {
  it('waves tying on their earliest take-off keep the order they were built in (stable), and a tie-only day is a no-op', () => {
    DAYS[0].waves = [
      { label: 'FIRST', formations: [{ cs: 'a', to: '0900', aircraft: [] }] },
      { label: 'SECOND', formations: [{ cs: 'b', to: '0900', aircraft: [] }] },
    ]
    expect(sortWaves(0)).toBe(false)
    expect(SCHED.pending).toEqual({})
    /* the tie holds even when a third, earlier wave forces a real permutation */
    DAYS[0].waves.push({ label: 'DAWN', formations: [{ cs: 'c', to: '0600', aircraft: [] }] })
    expect(sortWaves(0)).toBe(true)
    expect(DAYS[0].waves.map((w: any) => w.label)).toEqual(['DAWN', 'FIRST', 'SECOND'])
  })

  it('SC and AVALON with their hour CELLS cleared sink below a timed wave, in built order — no kind ever supplies a default hour', () => {
    /* the real SAWAVE shapes, then every take-off cell blanked — the 8084132
       pin says the sort reads the cells; an empty cell is an unparseable key
       and the block sinks, it does NOT fall back to the kind's 07:00/19:00 */
    const sc = makeStandalone('sc'), av = makeStandalone('avalon')
    sc.formations.forEach((f: any) => { f.to = '' })
    av.formations.forEach((f: any) => { f.to = '' })
    DAYS[0].waves = [av, sc, { label: 'W1', formations: [{ cs: 'x', to: '1100', aircraft: [] }] }]
    expect(sortWaves(0)).toBe(true)
    expect(DAYS[0].waves.map((w: any) => w.label)).toEqual(['W1', 'AVALON', 'SC'])
  })

  it('the key is the earliest TAKE-OFF — a wave whose only time is a land time sinks like a time-less one', () => {
    DAYS[0].waves = [
      { label: 'LAND-ONLY', formations: [{ cs: 'a', to: '', ld: '0700', aircraft: [] }] },
      { label: 'TIMED', formations: [{ cs: 'b', to: '0800', ld: '', aircraft: [] }] },
    ]
    expect(sortWaves(0)).toBe(true)
    expect(DAYS[0].waves.map((w: any) => w.label)).toEqual(['TIMED', 'LAND-ONLY'])
  })

  it('an unparseable take-off (free text in the cell) is no key at all, not 00:00', () => {
    DAYS[0].waves = [
      { label: 'JUNK', formations: [{ cs: 'a', to: 'TBD', aircraft: [] }] },
      { label: 'TIMED', formations: [{ cs: 'b', to: '2300', aircraft: [] }] },
    ]
    expect(sortWaves(0)).toBe(true)
    expect(DAYS[0].waves.map((w: any) => w.label)).toEqual(['TIMED', 'JUNK'])
  })
})

describe('sortDutyBlocks — free text, no times, and the AVALON-built desk (scenario 4)', () => {
  it('orders by earliest row START only — free-text roles never rank, and an end-time-only block sinks', () => {
    DAYS[0].dutywaves = [
      { label: 'B-NOTIME', rows: [{ role: 'AAA FIRST ALPHABETICALLY', id: '', str: '', end: '' }] },
      { label: 'B-ENDONLY', rows: [{ role: 'ZZZ', id: '', str: '', end: '0800' }] },
      { label: 'B-TIMED', rows: [{ role: 'whatever the scheduler typed', id: '', str: '0900', end: '1500' }] },
    ]
    expect(sortDutyBlocks(0)).toBe(true)
    /* only B-TIMED has a parseable start; the other two sink in model order —
       an end time is not a start time and a role name is not a rank */
    expect(DAYS[0].dutywaves.map((b: any) => b.label)).toEqual(['B-TIMED', 'B-NOTIME', 'B-ENDONLY'])
  })

  it('the AVALON-created desk keeps its sa marker through the sort, so deleting the wave still finds its desk', () => {
    const av = makeStandalone('avalon')
    const desk = waveDutyBlock(av)   // sa:'avalon', rows stamped 1900–0700
    DAYS[0].waves = [av]
    DAYS[0].dutywaves = [
      desk,
      { label: 'PICKER DESK', rows: [{ role: 'SDO', id: '', str: '0700', end: '1900' }] },
    ]
    expect(sortDutyBlocks(0)).toBe(true)
    expect(DAYS[0].dutywaves.map((b: any) => b.label)).toEqual(['PICKER DESK', 'AVALON duties'])
    /* the sa STRING travelled with the block object — saDutyIx still resolves
       the desk at its NEW index, which is what the wave-delete path splices */
    expect(saDutyIx(DAYS[0], av)).toEqual([1])
  })
})

describe('labels are NOT renumbered (scenario 9 — documented-deliberate, HANDOFF §Known issues)', () => {
  it('a day built out of order sorts to read WAVE 2 above WAVE 1 and both labels are untouched', () => {
    DAYS[0].waves = [
      { label: 'WAVE 1', formations: [{ cs: 'a', to: '1500', aircraft: [] }] },
      { label: 'WAVE 2', formations: [{ cs: 'b', to: '0800', aircraft: [] }] },
    ]
    expect(sortWaves(0)).toBe(true)
    /* deliberately NOT renumbered: the label is free text the scheduler may
       have replaced; do not "fix" this without reading the HANDOFF bullet */
    expect(DAYS[0].waves.map((w: any) => w.label)).toEqual(['WAVE 2', 'WAVE 1'])
  })
})

describe('Ground: manual freeze vs Sort all vs a time-less add (scenario 8)', () => {
  it('drag freezes model=render, Sort all unfreezes, and a new time-less row lands last in BOTH model and render', () => {
    const d = scrambleDay0()
    /* drag model row 0 (G-LATE, renders second) onto model row 2 (G-EARLY,
       renders first): the first move freezes the render order (EARLY, LATE,
       NONE) into the model, translates both indices into it, and puts LATE
       where EARLY sat — top of the list */
    expect(moveGroundRow(0, 0, 2)).toBe(true)
    expect(d.gman).toBe(true)
    expect(d.ground.map((r: any) => r.prog)).toEqual(['LATE', 'EARLY', 'NONE'].map(x => 'G-' + x))
    /* frozen: render order IS model order, time sort stood down */
    expect(groundOrder(d.ground, d.gman).map((x: any) => x.row.prog)).toEqual(d.ground.map((r: any) => r.prog))

    /* Sort all — the way back: gman clears and the rows return to time order */
    expect(sortDay(0)).toBe(true)
    expect(d.gman).toBe(false)
    expect(d.ground.map((r: any) => r.prog)).toEqual(['G-EARLY', 'G-LATE', 'G-NONE'])

    /* a fresh + Item row (no time) appends to the model AND renders last, so
       it never jumps away from under the scheduler typing into it */
    d.ground.push({ prog: 'G-NEW', str: '', end: '', rmks: '', who: '', more: [] })
    const render = groundOrder(d.ground, d.gman).map((x: any) => x.row.prog)
    expect(render[render.length - 1]).toBe('G-NEW')
    expect(render).toEqual(['G-EARLY', 'G-LATE', 'G-NONE', 'G-NEW'])
    /* and its address is its model index — the key the funnel will write */
    expect(groundOrder(d.ground, d.gman).find((x: any) => x.row.prog === 'G-NEW')!.ri).toBe(3)
  })

  it('Auto sort on a frozen-but-already-tidy day flips only the flag: rows untouched, still marked as a change, no stale-arm signal', () => {
    const d = scrambleDay0()
    d.ground = [
      { prog: 'G-A', str: '0700', end: '', rmks: '', who: '', more: [] },
      { prog: 'G-B', str: '0900', end: '', rmks: '', who: '', more: [] },
    ]
    d.gman = true
    const rowsRef = d.ground
    popReorderedDay()
    expect(sortGround(0)).toBe(true)          // the flag flipping IS a change
    expect(d.gman).toBe(false)
    expect(d.ground).toBe(rowsRef)             // same array object — no permutation
    expect(SCHED.pending['gr:0.0.prog']).toBe(1)
    /* no permutation happened, so no row changed identity and the armed-slot
       disarm signal must NOT fire for this path */
    expect(popReorderedDay()).toBe(null)
  })
})

describe('deletionWasIssued composes with the sort (the add→reorder→delete rule, scenario 2c)', () => {
  it('a draft wave added after publish, moved by Sort all, then deleted is a net no-op — and the issued wave beside it is not', () => {
    const d = DAYS[0]
    d.waves = [{ label: 'ISSUED', formations: [{ cs: 'a', to: '0900', aircraft: [] }] }]
    /* "published": the day approved with the wave present */
    SCHED.dayOK = { 0: 1 }
    SCHED.orig = { 0: { d: JSON.parse(JSON.stringify(d)), c: {} } }
    /* the draft add, at the end where + Wave puts it, with the board's key */
    d.waves.push({ label: 'DRAFT', formations: [{ cs: 'b', to: '0500', aircraft: [] }] })
    markStructuralAdd('wl:0.1')
    /* Sort all moves the draft wave ABOVE the issued one */
    expect(sortWaves(0)).toBe(true)
    expect(d.waves.map((w: any) => w.label)).toEqual(['DRAFT', 'ISSUED'])
    /* the add identity followed it to index 0 */
    expect(SCHED.added['wl:0.0']).toBe(1)
    /* deleting the DRAFT wave at its new address is a no-op for the AL … */
    expect(deletionWasIssued(0, 'wave', 0)).toBe(false)
    /* … while deleting the ISSUED wave — now at index 1 — should be a real
       removal.
       ██ AUDIT-D FINDING (BUG) — pinning CURRENT behaviour, which is WRONG:
       the snapshot fallback in publish.ts deletionWasIssued() looks the LIVE
       index up in the ISSUED snapshot (`(d.waves||[])[+at[0]]`), and the
       issued day only had one wave, so index 1 misses and the issued wave
       reads as never-issued. Deleting it emits NO del: tombstone and the AL
       never reports the removal of a wave the squadron holds a printed copy
       of. Reachable whenever a draft add + any reorder (drag, nudge, Sort
       all) pushes an issued row past the snapshot's row count. When this is
       fixed, flip this expectation to true and delete this comment. */
    expect(deletionWasIssued(0, 'wave', 1)).toBe(false)
    /* run the delete to the end, board-idiom: splice, shift, tombstone */
    const p0 = Object.keys(SCHED.pending).filter(k => k.startsWith('del:')).length
    const issued = deletionWasIssued(0, 'wave', 0)
    d.waves.splice(0, 1)
    ;['wl:0.', 'ff:0.', 'fr:0.', 'st:0.', 'ar:0.', 'at:0.', 'it:0.', 'tr:0.', '0.'].forEach(h => shiftKeys(h, 0, 0))
    markDeletion(0, 'wave', issued)
    expect(Object.keys(SCHED.pending).filter(k => k.startsWith('del:')).length).toBe(p0)  // no false removal
    /* and the shift dropped the draft identity with its row */
    expect(SCHED.added['wl:0.0']).toBeUndefined()
    expect(Object.keys(SCHED.added)).toEqual([])
  })
})
