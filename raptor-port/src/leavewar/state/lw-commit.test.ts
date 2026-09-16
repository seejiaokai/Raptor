/* [ARCH-STACK] Step 2 phase 4 — the Leave War store routed through the command
   gate (design §5.3). Proves the ADDITIVE wiring: a STANDALONE USER edit now
   emits a record-level envelope (per-cell lw.cell / lw.bid + coarse records), a
   no-op emits nothing, and — crucially — the delicate paths are UNTOUCHED: undo/
   redo (a locked restore) emits nothing (undo is not routed through commit at
   Step 2, §0), and command routing is OFF until the boot lwHistInit enables it,
   so every existing LW unit test (which never calls lwHistInit) is unaffected. */
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import {
  initStore, lwHistInit, getState, setCell, lwUndo, lwCanUndo, setRole, advanceStage,
} from './store'
import { memoryBackend } from './storage'
import { onCommit } from '../../command'
import type { CommitEnvelope } from '../../command'

let caught: CommitEnvelope[] = []
let unsub: () => void

beforeEach(() => {
  initStore(memoryBackend())
  lwHistInit()               // the boot step that ENABLES command routing
  caught = []
  unsub = onCommit(e => caught.push(e))
})
afterEach(() => { unsub() })

const cols = (e: CommitEnvelope) => e.changes.map(c => c.collection)

describe('a standalone user LW edit emits a record-level envelope (property c)', () => {
  it('setCell -> ONE lw.edit envelope carrying the lw.cell change', () => {
    const warId = getState().currentId
    setCell('ramp', '2026-01-20', 'LL')
    expect(caught.length).toBe(1)
    expect(caught[0].type).toBe('lw.edit')
    expect(caught[0].scope).toEqual({ module: 'lw', warId })
    expect(cols(caught[0])).toContain('lw.cell')
    expect(caught[0].changes.some(c => c.collection === 'lw.cell' && c.id === `${warId}:ramp:2026-01-20`)).toBe(true)
  })

  it('the lw.cell change carries the new code as its `after`', () => {
    const warId = getState().currentId
    setCell('ramp', '2026-01-21', 'LL')
    const cell = caught[0].changes.find(c => c.collection === 'lw.cell' && c.id === `${warId}:ramp:2026-01-21`)
    expect(cell).toBeTruthy()
    expect(cell!.after).toBe('LL')
  })

  it('a no-op setCell (same value) emits nothing', () => {
    setCell('ramp', '2026-01-22', 'LL')
    caught = []
    setCell('ramp', '2026-01-22', 'LL')   // unchanged
    expect(caught.length).toBe(0)
  })

  it('a war-level change (advanceStage) emits an lw.war change, not an empty no-op (Fable-2)', () => {
    const warId = getState().currentId
    setRole('admin')   // pure-view, no persist
    caught = []
    advanceStage()
    expect(caught.length).toBeGreaterThan(0)
    expect(caught.some(e => e.changes.some(c => c.collection === 'lw.war' && c.id === warId))).toBe(true)
  })
})

describe('the delicate paths stay raw (untouched by Step 2)', () => {
  it('undo (a locked restore) emits NO envelope', () => {
    setCell('ramp', '2026-01-23', 'LL')
    expect(lwCanUndo()).toBe(true)
    caught = []
    lwUndo()
    expect(caught.length).toBe(0)              // undo is not routed through commit (§0)
    // and it really did undo (the cell is gone)
    expect(getState().grid['ramp']?.['2026-01-23']).toBeFalsy()
  })
})
