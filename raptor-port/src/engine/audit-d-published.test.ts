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
import { SCHED, signOf, setDayApproved, publishAL, markEdit, pendCount, moveCount, markStructuralAdd, markDeletion, deletionWasIssued } from './publish'
import { sortDay, sortDutyBlocks, applyMove, moveNote, popReorderedDay } from './reorder'
import { reconcileIssuedMarks } from './drafts'
import { shiftKeys } from './keys'
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
    /* the ridden sim EDIT rode to amt.1 (asserted above); the sort's OWN record
       of the sim move is now an inert mov: tombstone (published-day reorders of
       issued rows, owner 31 Aug 26), NOT a field mark at the new head — so amt.0
       carries nothing, and a sim reorder tombstone is present instead */
    expect(SCHED.pending['sr:0.amt.0.label']).toBeUndefined()
    expect(Object.keys(SCHED.pending).some(k => /^mov:0\.\d+\.sim$/.test(k))).toBe(true)
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
    /* the drag itself now records the move as an inert mov: tombstone rather than
       a field mark at the row's new head (published-day reorder of an issued row,
       owner 31 Aug 26) — so pending is the ridden edit plus one duty reorder */
    expect(SCHED.pending['dr:0.0.0.role']).toBeUndefined()
    expect(Object.keys(SCHED.pending).filter(k => /^mov:0\.\d+\.duty$/.test(k))).toHaveLength(1)
    expect(Object.keys(SCHED.pending)).toHaveLength(2)
  })
})

describe('Sort all on a published day with NO other edits is a sane diff (scenario 2b)', () => {
  it('records one inert reorder per section that moved — never one key per cell — and the AL carries exactly those', () => {
    scramble()
    publishDay0()
    expect(pendCount(), 'publishing cleared the draft marks').toBe(0)
    expect(sortDay(0)).toBe(true)
    const pend = Object.keys(SCHED.pending).sort()
    /* every pending item is an inert mov: reorder tombstone (owner, 31 Aug 26) —
       one RECORD per section that actually moved, never one key per cell and
       never a field mark that a value-coincidence could reconcile away */
    pend.forEach(k => expect(/^mov:0\.\d+\.[a-z]+$/.test(k), `${k} is a reorder tombstone`).toBe(true))
    /* the exact set of KINDS, not a loose ceiling: wave 0's formations moved
       (formation), the wave list itself (wave), the duty-block list (dutyblock),
       the sims, ground and programme — the duty ROWS were built in order, so no
       duty-row reorder */
    const kinds = pend.map(k => k.split('.').pop()).sort()
    expect(kinds).toEqual(['dutyblock', 'formation', 'ground', 'programme', 'sim', 'wave'])
    /* and that is the whole AL — six reorders, nothing else */
    sign(0)
    publishAL(1)
    expect(SCHED.als[0].keys.slice().sort()).toEqual(pend)
    expect(SCHED.als[0].n0).toBe(pend.length)
    expect(moveCount(SCHED.als[0].keys)).toBe(6)
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

describe('a sort that moves an AL-tinted block keeps the tint and records the move apart (owner, 31 Aug 26)', () => {
  it('the block keeps its "changed at AL1" tint at its new position; the reorder is an inert tombstone beside it', () => {
    scramble()
    publishDay0()
    /* AL1 changed the AM desk's label; the sort then moves the AM desk to
       index 0. permuteKeys remaps the changes tag and the AL record 1 → 0. */
    SCHED.changes['dl:0.1'] = 1
    SCHED.als = [{ n: 1, keys: ['dl:0.1'], sign: {} }]
    expect(sortDutyBlocks(0)).toBe(true)
    /* the AL record followed the block (1 → 0) … */
    expect(SCHED.als[0].keys).toEqual(['dl:0.0'])
    /* … and unlike the old field-head proxy — which re-marked dl:0.0 and thereby
       retired the AL1 tint — the reorder is now an inert mov: tombstone, so the
       block KEEPS its "changed at AL1" tint at its new position (a move no longer
       masquerades as a re-edit of the moved cell). The move is recorded alongside
       it, not on the block's own key. */
    expect(SCHED.changes['dl:0.0']).toBe(1)
    expect(SCHED.pending['dl:0.0']).toBeUndefined()
    expect(Object.keys(SCHED.pending).filter(k => /^mov:0\.\d+\.dutyblock$/.test(k))).toHaveLength(1)
  })
})

/* THE BUG THIS TOMBSTONE FIXES (owner, 31 Aug 26). Reordering two rows that read
   the SAME at every head the mover marks — two unnamed waves, two same-role duty
   rows — on a signed-off day used to leave NO record: the mover's field-head mark
   was value-reconciled away, the day read "no changes", and the move reached no
   AL. A structural mov: key can't be value-reconciled, so a move of an issued row
   always counts; a still-draft added row reordered then deleted before its AL is
   still the net no-op it always was. */
describe('a reorder of identical-looking issued rows still records on a published day', () => {
  it('two same-value duty rows swapped mint a durable reorder that reconcile keeps and the AL carries', () => {
    const d = scramble()
    d.dutywaves = [{ label: 'DESK', rows: [
      { role: 'SDO', id: 'a', str: '0700', end: '1300', rmks: 'alpha' },
      { role: 'SDO', id: 'b', str: '0700', end: '1300', rmks: 'bravo' },
    ] }]
    publishDay0()
    expect(pendCount(), 'publishing cleared the draft marks').toBe(0)
    /* both rows read 'SDO' / 0700 / 1300 — the old dr:…role head proxy would be
       reconciled away the instant the values matched the issued day */
    expect(applyMove('mv:d.0.0.1', 'mv:d.0.0.0')).toBe(true)
    expect(d.dutywaves[0].rows.map((r: any) => r.rmks)).toEqual(['bravo', 'alpha'])
    reconcileIssuedMarks()                                     // the funnel's sweep must NOT drop it
    const mov = Object.keys(SCHED.pending).filter(k => /^mov:0\.\d+\.duty$/.test(k))
    expect(mov, 'the move is recorded as a durable reorder tombstone').toHaveLength(1)
    expect(pendCount()).toBe(1)
    sign(0)
    publishAL(1)
    expect(SCHED.als[0].keys).toEqual(mov)
    expect(moveCount(SCHED.als[0].keys)).toBe(1)
  })

  it('a draft-added row reordered then deleted before its AL is still a net no-op — no reorder minted', () => {
    const d = scramble()
    d.notes = ['issued note']                                  // an issued row for the draft to move past
    publishDay0()
    const ni = d.notes.length
    d.notes.push('temp'); markStructuralAdd(`dn:0.${ni}`)
    expect(moveNote(0, ni, 0)).toBe(true)
    /* the moved row is a pending draft ADD (its head sits in SCHED.added), so the
       mover keeps the ordinary field mark and mints NO tombstone — the add/delete
       net-no-op path can still cancel it */
    expect(Object.keys(SCHED.pending).some(k => /^mov:/.test(k))).toBe(false)
    const issued = deletionWasIssued(0, 'note', 0)             // read the row's identity BEFORE the splice
    d.notes.splice(0, 1); shiftKeys('dn:0.', 0, 0)
    markDeletion(0, 'note', issued)
    expect(SCHED.pending).toEqual({})
    expect(SCHED.added).toEqual({})
  })
})
