/* WHICH BOX AN UNDO OR REDO CHANGES ON THE BOARD'S DAY ([BOARD-UNDO-SAME-DAY]; his D672) — the pure half of
   ui/boardland.ts: read from the step's own two images of the day, as the addresses the board draws. Where the screen
   then goes is a browser's to prove: e2e/board-undo-land.spec.ts. */
import { beforeAll, describe, expect, it } from 'vitest'
import { initStore } from '../state/store'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { boardLandKeys, bringBoardChangeOnScreen } from './boardland'
import type { UndoEntry } from '../undo/types'

const MON = 0
const copy = <T,>(v: T): T => structuredClone(v)
/* a step that changed one day from `before` to `after` — only the fields the landing reads */
const step = (di: number, before: unknown, after: unknown, more: any[] = []): UndoEntry =>
  ({ forward: [{ op: 'put', collection: 'days', id: `${CURWEEK}#${di}`, before, after }, ...more] } as unknown as UndoEntry)

beforeAll(() => { initStore() })

describe('the board\'s Undo landing: which box the step changes', () => {
  it('a remark retyped: its own box, whichever way the step is taken', () => {
    const before = copy(DAYS[MON]), after = copy(DAYS[MON])
    after.waves[0].formations[0].aircraft[0].rmks = (after.waves[0].formations[0].aircraft[0].rmks || "") + " u1"
    const undo = boardLandKeys(step(MON, before, after), 'undo', MON)
    const redo = boardLandKeys(step(MON, before, after), 'redo', MON)
    expect(undo.length, 'the step names a box').toBeGreaterThan(0)
    expect(undo[0], 'a text box of the first wave\'s first line').toMatch(new RegExp(`^[a-z]+:${MON}\\.0\\.0\\.0`))
    expect(redo, 'the same box on Redo').toEqual(undo)
  })

  it('a seat refilled: that seat', () => {
    const before = copy(DAYS[MON]), after = copy(DAYS[MON])
    const ac = after.waves[0].formations[0].aircraft[0]
    ac.p = ac.p === 'bane' ? 'stiff' : 'bane'
    expect(boardLandKeys(step(MON, before, after), 'undo', MON)).toContain(`${MON}.0.0.0.p`)
  })

  it('another day\'s change names nothing on this day; a step with no day image names nothing', () => {
    const before = copy(DAYS[1]), after = copy(DAYS[1])
    after.waves[0].formations[0].aircraft[0].rmks = "x"
    expect(boardLandKeys(step(1, before, after), 'undo', MON)).toEqual([])
    expect(boardLandKeys(step(MON, undefined, copy(DAYS[MON])), 'undo', MON)).toEqual([])
    expect(boardLandKeys({ forward: [] } as unknown as UndoEntry, 'redo', MON)).toEqual([])
  })

  it('an input\'s change names the input\'s row', () => {
    const e = { forward: [{ op: 'put', collection: 'inputs', id: 'i42', before: null, after: {} }] } as unknown as UndoEntry
    expect(boardLandKeys(e, 'undo', MON)).toEqual(['iu:i42'])
  })

  it('with no board drawn, or nothing to point at, bringing a change on screen does nothing and throws nothing', () => {
    expect(() => bringBoardChangeOnScreen([])).not.toThrow()
    expect(() => bringBoardChangeOnScreen(['0.0.0.0.p'])).not.toThrow()
  })
})
