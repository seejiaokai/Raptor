// @vitest-environment jsdom
/* A1 AND A7 — EACH WAR COUNTS A MAN ONLY INSIDE HIS SQUADRON STINTS, AND TAKES HIS DAY ONLY WHERE IT IS ITS SQUADRON'S
   (the reshape plan, docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md §6.2; his D2243 — Q3 and Q6 answered: the
   old war's row hatched from the move day, the new war's before it, no "PO", no posting tag; a war's change to a man's
   day not its squadron's only removes, for everyone).

   The two proofs are copied from docs/superpowers/briefs/2026-11-20-multi-sqn-b1-repro/a-a01-move-both-wars.test.ts.txt
   and a-a07-old-war-writes-after-move.test.ts.txt, their harness changed to test-support/msq-world.ts (the `saber`,
   `kestrel` and `on` adapters below do what the proofs' own harness did). One read changes in A1's second proof: "149's
   row starts on his move day" read `row.from`, the posting window's first day — the reshape keeps his squadron stints
   APART from postings (§6.2: a stint is never a posting, never saved, never read by the posting tag), so the row's first
   day in the squadron is read through `firstDayHere` (the stints cut by the window); the assertion is the proof's. */
import { describe, expect, it } from 'vitest'
import { getState, setCell, worldUnit, setPostIn, setShowSans } from './state/store'
import { setHome, homeOn, unitsLoad } from '../state/units'
import { useMsqWorld, signInAs as msqSignIn, on as msqOn, worlds } from '../test-support/msq-world'
import { firstDayHere, inSquadron, awayFromHome, postingSheetFor } from './engine'
import { postingPendingTag, warDayRefusal, warDaySentence, warCellDay } from './sync'
import { rowInWindow } from './ui/rowinwindow'
import { globalUndo } from '../undo/timeline'
import { ownershipViolation } from '../state/perms'
import { PEOPLE } from '../engine/people'
import { notify as raptorNotify } from '../state/store'
import type { Change } from '../command/types'

useMsqWorld()

/* the proofs' own harness calls, over the one world */
const saber = () => { msqSignIn('saber'); expect(worldUnit()).toBe('u142') }
const kestrel = () => { msqSignIn('kestrel'); expect(worldUnit()).toBe('u149') }
const on = (d: number, h = 9, m = 0) => { msqOn(d, h, m); unitsLoad() }
const signInAs = (name: string, pass = 'x') => { msqSignIn(name, pass) }

function moveRanger() {
  saber()
  expect(setCell('bane', '2026-07-08', 'LL')).toBe(true)
  expect(setHome('bane', 'u149').ok).toBe(true)
  on(16)
  expect(homeOn('bane', '2026-07-08')).toBe('u142')
  expect(homeOn('bane', '2026-07-16')).toBe('u149')
}

describe('A1 — a move keeps each squadron’s war true by date', () => {
  it('142’s war still has Ranger’s row for the months he was there (his 8 Jul leave)', () => {
    moveRanger()
    kestrel(); saber()
    expect(getState().people.some(p => p.id === 'bane'), '142 keeps his row up to the move').toBe(true)
  })
  it('149’s war counts Ranger only from his move day, 16 Jul', () => {
    moveRanger()
    kestrel()
    const row = getState().people.find(p => p.id === 'bane')
    expect(row, '149 has his row').toBeTruthy()
    expect(row ? firstDayHere(row) : null, '149’s row starts on his move day, not every month before it').toBe('2026-07-16')
  })
})

describe('A7 — 142’s war takes no leave of Ranger’s after his move to 149', () => {
  it('Saber on 16 Jul: Ranger’s 11 Aug leave on 142’s war is refused', () => {
    saber()
    expect(setHome('bane', 'u149').ok).toBe(true)
    on(16)
    saber()
    expect(worldUnit()).toBe('u142')
    expect(homeOn('bane', '2026-08-11')).toBe('u149')
    expect(setCell('bane', '2026-08-11', 'LL'), '142’s war refuses a day that is 149’s').toBe(false)
  })
  it('Hunter (142’s plain admin, no right in 149) on 16 Jul: the same write is refused', () => {
    saber()
    expect(setHome('bane', 'u149').ok).toBe(true)
    on(16)
    signInAs('ad2', 'a2')
    expect(worldUnit()).toBe('u142')
    expect(setCell('bane', '2026-08-11', 'LL'), '142’s war refuses a day that is 149’s').toBe(false)
  })
  it('(control) before the move, the same write on 142’s war goes through', () => {
    saber()
    expect(setCell('bane', '2026-08-11', 'LL')).toBe(true)
  })
  it("(probe, not a reviewer's claim) Hunter writing Osprey (149 always, never 142's) on 142’s war", () => {
    on(16)
    signInAs('ad2', 'a2')
    expect(setCell('osp9', '2026-08-11', 'LL')).toBe(false)
  })
  it('(probe) Hunter on 15 Jul, the move saved for 16 Jul: Ranger’s 11 Aug leave on 142’s war', () => {
    saber()
    expect(setHome('bane', 'u149').ok).toBe(true)
    signInAs('ad2', 'a2')
    expect(setCell('bane', '2026-08-11', 'LL'), 'a day that will be 149’s').toBe(false)
  })
})

/* ---- the plan's §6.4 cases for A1 and A7 (helper "war", written red-first beside the proofs) ---- */
const row = (pid = 'bane') => getState().people.find(p => p.id === pid)

describe('A1 — his squadron stints are kept apart from postings', () => {
  it('a saved move writes no posting record, in either war, and Admin → Users shows no posting tag', () => {
    saber()
    expect(setHome('bane', 'u149').ok).toBe(true)
    on(16); saber()
    expect(getState().postOuts.bane, '142’s war saves no posting for him').toBeUndefined()
    expect(postingPendingTag('bane'), 'no posting tag on his row (142 loaded)').toBeNull()
    for (const u of ['u142', 'u149']) for (const k of worlds[u]!.keys()) expect(worlds[u]!.read(k) ?? '', `${u}'s stored ${k}`).not.toMatch(/"home"/)
    kestrel()
    expect(getState().postOuts.bane, '149’s war saves no posting for him').toBeUndefined()
    expect(postingPendingTag('bane'), 'no posting tag on his row (149 loaded)').toBeNull()
  })
  it('a war already open when the move is saved: 142’s row counts him to Wed 15 Jul and is away after, no PO', () => {
    saber()
    expect(setHome('bane', 'u149').ok).toBe(true)
    raptorNotify()                                         // the page's next repaint, as any press ends in one
    const r = row()!
    expect(inSquadron(r, '2026-07-15')).toBe(true)
    expect(inSquadron(r, '2026-07-16'), 'away from his move day').toBe(false)
    expect(awayFromHome(r, '2026-07-16')).toBe(true)
    expect(postingSheetFor(r, '2026-07-16'), 'no posting sheet on a day his move took').toBeUndefined()
    expect(r.from, 'his posting window untouched').toBeNull()
    expect(r.to).toBeNull()
  })
  it('149’s row: away before Thu 16 Jul, counted from it; its month filter shows him in July, not June', () => {
    saber()
    expect(setHome('bane', 'u149').ok).toBe(true)
    on(16); kestrel()
    const r = row()!
    expect(inSquadron(r, '2026-07-15')).toBe(false)
    expect(inSquadron(r, '2026-07-16')).toBe(true)
    expect(rowInWindow(r, '2026-07|2026-07')).toBe(true)
    expect(rowInWindow(r, '2026-06|2026-06'), 'a month wholly before his move shows no row of his').toBe(false)
  })
  it('a saved joining window does not outlast his move: 142 stops counting him at the move all the same', () => {
    saber()
    expect(setPostIn('bane', '2026-03-01')).toBe(true)
    expect(setHome('bane', 'u149').ok).toBe(true)
    on(16); saber()
    const r = row()!
    expect(r.from, 'his joining date kept').toBe('2026-03-01')
    expect(inSquadron(r, '2026-08-01'), 'not 142’s after the move, whatever the window says').toBe(false)
    expect(inSquadron(r, '2026-04-01')).toBe(true)
    expect(firstDayHere(r)).toBe('2026-03-01')
  })
  it('moved there and back: one row, away between (two stints)', () => {
    saber()
    expect(setHome('bane', 'u149').ok).toBe(true)
    on(16); saber()
    expect(setHome('bane', 'u142').ok).toBe(true)
    saber()
    const rows = getState().people.filter(p => p.id === 'bane')
    expect(rows.length, 'one row').toBe(1)
    expect(inSquadron(rows[0]!, '2026-07-15')).toBe(true)
    expect(inSquadron(rows[0]!, '2026-07-16'), 'away on his one day in 149').toBe(false)
    expect(inSquadron(rows[0]!, '2026-07-17')).toBe(true)
  })
  it('Undo of the move gives 142’s war his months back in the same session', () => {
    saber()
    expect(setHome('bane', 'u149').ok).toBe(true)
    raptorNotify()
    expect(row()!.home, 'his stints laid').toBeTruthy()
    expect(globalUndo().ok, 'the move undone').toBe(true)
    raptorNotify()
    expect(row()!.home, 'always 142’s again: no stints laid').toBeUndefined()
    expect(inSquadron(row()!, '2026-08-11')).toBe(true)
  })
  it('a SANS man moved: with Show SANS on, his row follows his stints the same way', () => {
    ;(PEOPLE as any).bane.san = true
    saber()
    setShowSans(true)
    expect(setHome('bane', 'u149').ok).toBe(true)
    saber(); setShowSans(true)
    const r = row()
    expect(r, 'his row on 142 while Show SANS is on').toBeTruthy()
    expect(inSquadron(r!, '2026-07-16')).toBe(false)
  })
})

describe('A7 — on a day now another squadron’s, a war only loses entries', () => {
  it('a clear of his leave on a day now 149’s goes through (a removal is never refused)', () => {
    saber()
    expect(setCell('bane', '2026-07-17', 'LL')).toBe(true)
    expect(setHome('bane', 'u149').ok).toBe(true)
    expect(setCell('bane', '2026-07-17', ''), 'his leave taken off 142’s war').toBe(true)
  })
  it('an Undo that takes the leave off (the last entry) is allowed; one that would put it back is refused and leaves nothing', () => {
    saber()
    expect(setCell('bane', '2026-07-17', 'LL')).toBe(true)
    expect(setCell('bane', '2026-07-17', '')).toBe(true)
    expect(setHome('bane', 'u149').ok).toBe(true)
    /* the newest step is the move; undoing it first would make the day 142's again, so the steps run as Ranger's day stands
       now: the clear's Undo (which would put LL back) is reached by Undo of the move… — here judged through its words */
    const id = `${getState().currentId}:bane:2026-07-17`
    const putBack: Change = { op: 'put', collection: 'lw.cell', id, before: null, after: [{ id: 'r1', kind: 'request', code: 'LL', state: 'pending' }] } as any
    const takeOff: Change = { op: 'delete', collection: 'lw.cell', id, before: [{ id: 'r1', kind: 'request', code: 'LL', state: 'pending' }], after: null } as any
    expect(warDayRefusal([takeOff]), 'taking it off: no words').toBeNull()
    expect(warDayRefusal([putBack])).toBe("Ranger is 149's from Thu 16 Jul, so this can't go back into 142's Leave War.")
    expect(ownershipViolation({ seq: 1, at: '', actor: { id: 'acad', role: 'admin', session: null, personId: 'stiff' }, origin: 'undo', scope: { module: 'lw' }, type: 'lw.edit', changes: [putBack], emit: true } as any),
      'the gate refuses it too (7b, the probe installed)').toMatch(/only loses entries/)
    expect(ownershipViolation({ seq: 1, at: '', actor: { id: 'acad', role: 'admin', session: null, personId: 'stiff' }, origin: 'undo', scope: { module: 'lw' }, type: 'lw.edit', changes: [takeOff], emit: true } as any)).toBeNull()
  })
  it('the day before his move is still 142’s: the sentence says nothing there', () => {
    saber()
    expect(setHome('bane', 'u149').ok).toBe(true)
    const id = `${getState().currentId}:bane:2026-07-15`
    expect(warDayRefusal([{ op: 'put', collection: 'lw.cell', id, before: null, after: [{ id: 'r1' }] } as any])).toBeNull()
  })
  it('the words, as approved (D2243, Q6): a day well past the move names the first day of his run in 149', () => {
    saber()
    expect(setHome('bane', 'u149').ok).toBe(true)
    expect(warDaySentence('bane', '2026-08-11', 'u149', 'u142')).toBe("Ranger is 149's from Thu 16 Jul, so this can't go back into 142's Leave War.")
  })
  it('the war’s own probe reads (man, day) off a war cell and nothing else', () => {
    expect(warCellDay({ op: 'put', collection: 'lw.cell', id: 'P:26:bane:2026-07-17', before: null, after: [] } as any)).toEqual({ pid: 'bane', iso: '2026-07-17' })
    expect(warCellDay({ op: 'put', collection: 'lw.ledger', id: 'x', before: null, after: {} } as any)).toBeNull()
  })
})
