/* AUDIT A (12 Aug 26) — adversarial pass over the edit log's ENGINE half.

   The load-bearing discovery in this file: shiftKeys()/permuteKeys()
   (engine/keys.ts) rewrite SCHED.pending, SCHED.changes, SCHED.added and
   every issued AL when a delete or reorder renumbers the key space — and
   they never touch ELOG.rows. Every log row keeps the key it was born
   with, so after any renumbering the log's addresses point at the WRONG
   live rows: elogFor(new address) answers null for the row that was
   actually edited, and elogFor(old address) answers with history that now
   belongs to a different row on screen.

   The tests that carry a BUG marker assert the CURRENT (broken) behaviour
   on purpose, so this file runs green while the divergence stands and
   starts failing the moment someone fixes it — at which point the
   assertions should be flipped, not deleted. */
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { SCHED } from './publish'
import { setSlotVal, slotVal } from './slots'
import { shiftKeys } from './keys'
import { moveDutyRow } from './reorder'
import { HOOKS } from './hooks'
import { ELOG, elogClear, elogFor, elogAllFor, elogGroups, elogRows, logEdit, logAction } from './editlog'

let who: any
beforeEach(() => {
  SCHED.pending = {}; SCHED.changes = {}
  elogClear()
  who = HOOKS.whoami
  HOOKS.whoami = () => 'Auditor'
})
afterEach(() => { HOOKS.whoami = who })

describe('renumbering and the log (delete)', () => {
  it('BUG: a delete renumbers SCHED but not the log — history detaches from its row', () => {
    const rows = DAYS[0].dutywaves[0].rows
    const B = rows.length
    /* three fresh rows so nothing demo-seeded is touched; the middle one
       gets the edit, the top one gets deleted */
    rows.push(
      { role: 'AUD-A', id: '', str: '', end: '' },
      { role: 'AUD-B', id: '', str: '', end: '' },
      { role: 'AUD-C', id: '', str: '', end: '' },
    )
    try {
      setSlotVal(`d:0.0.${B + 1}`, 'bane')          // logged: — → Bane at address B+1
      expect(elogFor(`d:0.0.${B + 1}`)!.to).toBe('Bane')

      /* exactly what board.ts's [data-drdel] branch does */
      rows.splice(B, 1)
      ;[`d:0.0.`, `dr:0.0.`].forEach(h => shiftKeys(h, 0, B))

      /* the model and the amendment bookkeeping agree: the edited man now
         sits at B, and pending followed him there */
      expect(rows[B].id).toBe('bane')
      expect(SCHED.pending[`d:0.0.${B}`]).toBe(1)
      expect(SCHED.pending[`d:0.0.${B + 1}`]).toBeUndefined()

      /* BUG — the log did NOT follow. The row that holds the edit has no
         history to its name, and the old address (now the row that was
         BELOW the edit, never touched) still answers with the story. */
      expect(elogFor(`d:0.0.${B}`), 'the edited row should own its history — it does not').toBeNull()
      const stale = elogFor(`d:0.0.${B + 1}`)
      expect(stale, 'the untouched neighbour now wears the history').toBeTruthy()
      expect(stale!.to).toBe('Bane')
      expect(slotVal(`d:0.0.${B + 1}`), 'while the row at that address holds nobody').toBe('')
    } finally {
      rows.splice(B, rows.length - B)               // net zero on the demo data
    }
  })
})

describe('renumbering and the log (reorder)', () => {
  it('BUG: a reorder permutes SCHED but not the log — same divergence, no row lost', () => {
    const rows = DAYS[0].dutywaves[0].rows
    const B = rows.length
    rows.push(
      { role: 'AUD-D', id: '', str: '', end: '' },
      { role: 'AUD-E', id: '', str: '', end: '' },
    )
    try {
      setSlotVal(`d:0.0.${B}`, 'bane')              // logged at address B
      moveDutyRow(0, 0, B, B + 1)                   // the edited row slides down one

      expect(rows[B + 1].id).toBe('bane')
      /* pending moved with him (permuteKeys is a bijection) … */
      expect(SCHED.pending[`d:0.0.${B + 1}`]).toBe(1)
      /* … the log stayed behind (BUG) */
      expect(elogFor(`d:0.0.${B + 1}`), 'his history should have moved with him').toBeNull()
      const stale = elogFor(`d:0.0.${B}`)
      expect(stale).toBeTruthy()
      expect(stale!.to).toBe('Bane')
      expect(slotVal(`d:0.0.${B}`), 'the address the log names now holds nobody').toBe('')
    } finally {
      rows.splice(B, rows.length - B)
    }
  })
})

describe('the ring past its cap', () => {
  it('drops the oldest and keeps every query coherent', () => {
    for (let i = 0; i < 410; i++) logEdit('ff:0.0.0.cs', 'v' + i, 'v' + (i + 1))
    expect(ELOG.rows.length).toBe(400)
    /* the ten oldest fell off the front, in order */
    expect(ELOG.rows[0]!.from).toBe('v10')
    expect(ELOG.rows[399]!.to).toBe('v410')

    /* the three queries agree with each other after the overflow */
    expect(elogRows().length).toBe(400)
    expect(elogRows()[0]!.to, 'newest first').toBe('v410')
    const all = elogAllFor('ff:0.0.0.cs')
    expect(all.length).toBe(400)
    expect(all[0]!.from, 'oldest first').toBe('v10')
    const g = elogGroups()
    expect(g.length).toBe(1)
    expect(g[0]!.rows.length).toBe(400)
    expect(elogFor('ff:0.0.0.cs')!.to).toBe('v410')
  })

  it('a structural row crossing the boundary stays its own group of one', () => {
    logAction(0, 'Line removed')
    logAction(0, 'Line removed')
    for (let i = 0; i < 399; i++) logEdit('ff:0.0.0.cs', 'w' + i, 'w' + (i + 1))
    /* 401 pushes — the FIRST structural row fell off, the second survives */
    expect(ELOG.rows.length).toBe(400)
    const structs = ELOG.rows.filter(r => !r.key)
    expect(structs.length).toBe(1)
    const g = elogGroups(0)
    expect(g.filter(x => !x.key).length, 'still one group, not folded into anything').toBe(1)
  })
})
