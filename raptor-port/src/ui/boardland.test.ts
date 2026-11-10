// @vitest-environment jsdom
/* WHICH BOX AN UNDO OR REDO CHANGES ON THE BOARD'S DAY ([BOARD-UNDO-SAME-DAY]; his D672) — the pure half of
   ui/boardland.ts: read from the step's own two images of the day, as the addresses the board draws. Where the screen
   then goes is a browser's to prove: e2e/board-undo-land.spec.ts. */
/* …AND, SINCE THE TWO BLIND READS OF 11 NOV 26, THE SUMS OF THE SECOND HALF TOO (the "board as told" cases below): jsdom
   lays nothing out, so each box is TOLD where it stands and the scroller's `scrollBy` is watched — which box is chosen,
   how far the list is asked to move, and that a box in view moves nothing. The browser file still proves the screen. */
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { initStore } from '../state/store'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { INPUTS, DATES, inpId } from '../engine/inputs'
import { standsOn } from '../engine/overlay'
import * as view from '../state/view'
import { setSession } from '../state/auth'
import { _snapView, installGlobalUndo } from '../state/undo-wire'
import { commitSetDayApproved, schedWrite, SCHED_TYPES } from '../state/sched-commit'
import { signOf, dayApproved, setSign, signAt, signShown, markEdit } from '../engine/publish'
import { canonicalUnits } from '../engine/canonical'
import { globalUndo } from '../undo'
import { _resetTimeline, _timelineEntries } from '../undo/timeline'
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

  /* finding 8 (the fresh Opus reader, F5): the day NUMBER was checked and the week never — a step of another week would
     have put that week's positions onto the loaded week's board */
  it('a change to the same day number of ANOTHER week names nothing on the loaded week\'s board', () => {
    const before = copy(DAYS[MON]), after = copy(DAYS[MON])
    after.waves[0].formations[0].aircraft[0].rmks = "other week"
    const other = { forward: [{ op: 'put', collection: 'days', id: `01/01/2001#${MON}`, before, after }] } as unknown as UndoEntry
    expect(CURWEEK, 'the loaded week is not the step\'s').not.toBe('01/01/2001')
    expect(boardLandKeys(other, 'undo', MON)).toEqual([])
    expect(boardLandKeys(other, 'redo', MON)).toEqual([])
    /* the same change on the loaded week still names its box */
    expect(boardLandKeys(step(MON, before, after), 'undo', MON).length).toBeGreaterThan(0)
  })
})

/* finding 2 (Astra 2, the fresh Opus reader F2a): a reorder — a drag by the grip, Auto sort, Sort all — is a 'move' in
   the day's comparison, which names no box; the landing had nowhere to go. Its destination: the surviving rows matched
   by their hidden ids, the first whose place differs, as it stands on the day this direction restores. */
describe('the board\'s Undo landing: a row re-ordered and nothing else', () => {
  const swapped = <T,>(a: T[]): T[] => [a[1]!, a[0]!, ...a.slice(2)]
  for (const dir of ['undo', 'redo'] as const) {
    it(`two waves changed places: ${dir} names the first wave whose place differs`, () => {
      const before = copy(DAYS[MON]), after = copy(DAYS[MON])
      expect(before.waves.length).toBeGreaterThan(1)
      after.waves = swapped(after.waves)
      const keys = boardLandKeys(step(MON, before, after), dir, MON)
      expect(keys.length, 'the reorder names a box').toBeGreaterThan(0)
      expect(keys[0]).toBe(`wl:${MON}.0`)
    })
    it(`two Common Programme rows changed places: ${dir} names the first of them`, () => {
      const before = copy(DAYS[MON]), after = copy(DAYS[MON])
      expect(before.allhands.length).toBeGreaterThan(2)
      /* the 2nd and 3rd rows: the first keeps its place, so it is not the one named */
      after.allhands = [after.allhands[0], after.allhands[2], after.allhands[1], ...after.allhands.slice(3)]
      expect(boardLandKeys(step(MON, before, after), dir, MON)[0]).toBe(`ap:${MON}.1.prog`)
    })
    it(`two formations of one wave, two jets of one formation, two desks of one duty block: ${dir} names the first that moved`, () => {
      const d: any = DAYS[MON]
      const gi = d.waves.findIndex((w: any) => (w.formations || []).length > 1)
      expect(gi, 'a wave with two formations').toBeGreaterThanOrEqual(0)
      let before = copy(d), after = copy(d)
      after.waves[gi].formations = swapped(after.waves[gi].formations)
      expect(boardLandKeys(step(MON, before, after), dir, MON)[0]).toBe(`ff:${MON}.${gi}.0.cs`)
      let g2 = -1, l2 = -1
      d.waves.forEach((w: any, g: number) => (w.formations || []).forEach((f: any, l: number) => { if (g2 < 0 && (f.aircraft || []).length > 1) { g2 = g; l2 = l } }))
      expect(g2, 'a formation with two jets').toBeGreaterThanOrEqual(0)
      before = copy(d); after = copy(d)
      after.waves[g2].formations[l2].aircraft = swapped(after.waves[g2].formations[l2].aircraft)
      expect(boardLandKeys(step(MON, before, after), dir, MON)[0]).toBe(`fr:${MON}.${g2}.${l2}.0`)
      const wi = d.dutywaves.findIndex((b: any) => (b.rows || []).length > 1)
      expect(wi, 'a duty block with two desks').toBeGreaterThanOrEqual(0)
      before = copy(d); after = copy(d)
      after.dutywaves[wi].rows = swapped(after.dutywaves[wi].rows)
      expect(boardLandKeys(step(MON, before, after), dir, MON)[0]).toBe(`dr:${MON}.${wi}.0.role`)
    })
  }
  it('a row moved down the list: Undo names where it goes back to, Redo where it went', () => {
    const before = copy(DAYS[MON]), after = copy(DAYS[MON])
    const n = before.allhands.length
    expect(n).toBeGreaterThan(3)
    /* the first row dragged to the foot */
    after.allhands = [...after.allhands.slice(1), after.allhands[0]]
    expect(boardLandKeys(step(MON, before, after), 'undo', MON)[0], 'back at the head').toBe(`ap:${MON}.0.prog`)
    /* CORRECTED 11 Nov 26 (the narrow read, finding 1): this line named the head row ("the head row is another now") —
       the first PLACE that differs, not the row that moved. Redo drags the row to the foot again: the foot is the change. */
    expect(boardLandKeys(step(MON, before, after), 'redo', MON)[0], 'at the foot, where it went').toBe(`ap:${MON}.${n - 1}.prog`)
    /* the LAST row dragged up one: only the last two differ, and the first of those is named */
    const up = copy(DAYS[MON])
    up.allhands = [...up.allhands.slice(0, n - 2), up.allhands[n - 1], up.allhands[n - 2]]
    expect(boardLandKeys(step(MON, before, up), 'undo', MON)[0]).toBe(`ap:${MON}.${n - 2}.prog`)
  })
  /* the narrow read, finding 1 (11 Nov 26): "the first whose place differs" is not the row that moved — one row dragged
     DOWN shifts every row above its new place, and one dragged UP every row below it. The rows that moved are the ones
     outside the longest run of rows still in their old order. */
  it('ONE row dragged: the last to the head, the first to the foot — Undo and Redo each name that row where it ends up', () => {
    const before = copy(DAYS[MON]), n = before.allhands.length
    expect(n).toBeGreaterThan(3)
    const up = copy(DAYS[MON]); up.allhands = [up.allhands[n - 1], ...up.allhands.slice(0, n - 1)]
    expect(boardLandKeys(step(MON, before, up), 'undo', MON)[0], 'last to head, Undo: back at the foot').toBe(`ap:${MON}.${n - 1}.prog`)
    expect(boardLandKeys(step(MON, before, up), 'redo', MON)[0], 'last to head, Redo: at the head').toBe(`ap:${MON}.0.prog`)
    const down = copy(DAYS[MON]); down.allhands = [...down.allhands.slice(1), down.allhands[0]]
    expect(boardLandKeys(step(MON, before, down), 'undo', MON)[0], 'first to foot, Undo: back at the head').toBe(`ap:${MON}.0.prog`)
    expect(boardLandKeys(step(MON, before, down), 'redo', MON)[0], 'first to foot, Redo: at the foot').toBe(`ap:${MON}.${n - 1}.prog`)
    /* a row dragged from the middle to the middle: only it is named, never a row it passed */
    const mid = copy(DAYS[MON]); const [r] = mid.allhands.splice(1, 1); mid.allhands.splice(n - 2, 0, r)
    expect(boardLandKeys(step(MON, before, mid), 'redo', MON), 'second row to last but one').toEqual([`ap:${MON}.${n - 2}.prog`])
    expect(boardLandKeys(step(MON, before, mid), 'undo', MON)).toEqual([`ap:${MON}.1.prog`])
  })
  it('…and the screen follows the row that moved: in view it moves nothing though the head is out of view; out of view it is brought on screen though the head is in view', () => {
    const before = copy(DAYS[MON]), n = before.allhands.length
    const up = copy(DAYS[MON]); up.allhands = [up.allhands[n - 1], ...up.allhands.slice(0, n - 1)]
    const keys = boardLandKeys(step(MON, before, up), 'undo', MON)
    const twoRows = (head: Place, foot: Place) => {
      const sc = board(`<textarea data-bfld="ap:${MON}.0.prog"></textarea><textarea data-bfld="ap:${MON}.${n - 1}.prog"></textarea>`)
      place($(`[data-bfld="ap:${MON}.0.prog"]`), head); place($(`[data-bfld="ap:${MON}.${n - 1}.prog"]`), foot)
      bringBoardChangeOnScreen(keys, MON)
      return moved(sc)
    }
    expect(twoRows(ABOVE, SEEN), 'the row that went back to the foot is in view').toEqual([])
    expect(twoRows(SEEN, BELOW), 'it is below the screen, the head in view').toEqual([328])
    document.body.innerHTML = ''
  })
  /* the narrow read of the second fix round, finding 1 (11 Nov 26): a step that changed SEVERAL places — two rows that
     changed places, Auto sort, Sort all — names them all, and only the FIRST named decided "in view": with that one out
     of view the board scrolled to it, away from rows that changed in view. D672: the screen stays where it is when
     what the step changes is in view — any of it. Only when none of it is in view does the list go to the first. */
  const twoBoxes = (k1: string, k2: string, at1: Place, at2: Place, keys: string[]) => {
    const sc = board(`<textarea data-bfld="${k1}"></textarea><textarea data-bfld="${k2}"></textarea>`)
    place($(`[data-bfld="${k1}"]`), at1); place($(`[data-bfld="${k2}"]`), at2)
    bringBoardChangeOnScreen(keys, MON)
    const by = moved(sc)
    document.body.innerHTML = ''
    return by
  }
  it('two rows that changed places, the head and the foot of a list: the foot in view, the head above the screen — nothing moves', () => {
    const before = copy(DAYS[MON]), n = before.allhands.length
    const swap = copy(DAYS[MON]); swap.allhands[0] = before.allhands[n - 1]; swap.allhands[n - 1] = before.allhands[0]
    const head = `ap:${MON}.0.prog`, foot = `ap:${MON}.${n - 1}.prog`
    for (const dir of ['undo', 'redo'] as const) {
      const keys = boardLandKeys(step(MON, before, swap), dir, MON)
      expect(keys, `${dir}: both rows moved, the upper named first`).toEqual([head, foot])
      expect(twoBoxes(head, foot, ABOVE, SEEN, keys), `${dir}: the foot in view`).toEqual([])
      expect(twoBoxes(head, foot, SEEN, BELOW, keys), `${dir}: the head in view`).toEqual([])
      expect(twoBoxes(head, foot, ABOVE, BELOW, keys), `${dir}: neither in view — the list goes to the first named`).toEqual([-508])
      expect(twoBoxes(head, foot, ABOVE, { top: 0, bottom: 0 }, keys), `${dir}: a row in the page but not laid out is not "in view"`).toEqual([-508])
    }
  })
  it('Sort all — rows re-ordered in two lists by one step: the lower list in view, the upper out of view — nothing moves', () => {
    const d: any = DAYS[MON]
    const wi = d.dutywaves.findIndex((b: any) => (b.rows || []).length > 1)
    expect(wi, 'a duty block with two desks').toBeGreaterThanOrEqual(0)
    const before = copy(d), after = copy(d)
    after.allhands = [after.allhands[0], after.allhands[2], after.allhands[1], ...after.allhands.slice(3)]
    after.dutywaves[wi].rows = swapped(after.dutywaves[wi].rows)
    const upper = `ap:${MON}.1.prog`, lower = `dr:${MON}.${wi}.0.role`
    for (const dir of ['undo', 'redo'] as const) {
      const keys = boardLandKeys(step(MON, before, after), dir, MON)
      expect(keys.indexOf(upper), `${dir}: the Common Programme's row is named`).toBeGreaterThanOrEqual(0)
      expect(keys.indexOf(lower), `${dir}: …and the duty desk, after it`).toBeGreaterThan(keys.indexOf(upper))
      expect(twoBoxes(upper, lower, ABOVE, SEEN, keys), `${dir}: the desks in view`).toEqual([])
      expect(twoBoxes(upper, lower, ABOVE, BELOW, keys), `${dir}: neither list in view — to the first named`).toEqual([-508])
    }
  })
  it('an ordinary step that changed two boxes: one in view, the other out of view — nothing moves', () => {
    const d: any = DAYS[MON]
    const gi = d.waves.findIndex((w: any) => (w.formations || []).length > 1)
    expect(gi, 'a wave with two formations').toBeGreaterThanOrEqual(0)
    const retype = (x: any, li: number, add: string) => { const ac = x.waves[gi].formations[li].aircraft[0]; ac.rmks = (ac.rmks || '') + add }
    const before = copy(d), one = copy(d), two = copy(d), both = copy(d)
    retype(one, 0, ' one'); retype(two, 1, ' two'); retype(both, 0, ' one'); retype(both, 1, ' two')
    const k1 = boardLandKeys(step(MON, before, one), 'undo', MON)[0]!, k2 = boardLandKeys(step(MON, before, two), 'undo', MON)[0]!
    expect(k1).not.toBe(k2)
    const keys = boardLandKeys(step(MON, before, both), 'undo', MON)
    expect(keys, 'the step names both boxes').toEqual(expect.arrayContaining([k1, k2]))
    const [first, other] = keys.indexOf(k1) < keys.indexOf(k2) ? [k1, k2] : [k2, k1]
    expect(twoBoxes(first, other, ABOVE, SEEN, keys), 'the second box in view, the first above the screen').toEqual([])
    expect(twoBoxes(first, other, SEEN, BELOW, keys), 'the first in view').toEqual([])
    expect(twoBoxes(first, other, ABOVE, BELOW, keys), 'neither in view — to the first named').toEqual([-508])
  })
  it('a row only added or only taken away re-orders nothing: no row is named for it', () => {
    const before = copy(DAYS[MON]), after = copy(DAYS[MON])
    after.allhands = after.allhands.slice(1)
    /* undo puts the row back: the day's comparison names it (an add); nothing is named for an order that did not change */
    const keys = boardLandKeys(step(MON, before, after), 'redo', MON)
    expect(keys, 'a step that only REMOVES a row names nothing — the known limit').toEqual([])
  })
})

/* ---- THE BOARD AS TOLD: jsdom lays nothing out, so every box is told where it stands ---- */
type Place = { top: number; bottom: number; left?: number; right?: number }
const place = (el: Element, r: Place) => {
  const left = r.left ?? 0, right = r.right ?? 300
  ;(el as any).getBoundingClientRect = () => ({ top: r.top, bottom: r.bottom, left, right, width: right - left, height: r.bottom - r.top, x: left, y: r.top, toJSON() { return {} } })
}
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
/* a board whose LIST scrolls (a desktop, an upright phone's wide layout): 600 tall on screen, 3000 of list; `scale` =
   how many screen pixels one of the list's own is drawn as (the desktop layout pinched on a phone — ui/pinchzoom.ts) */
function board(inner: string, scale = 1): HTMLElement {
  document.body.innerHTML = `<div id="schedBoard"><div class="sb-main"><div class="sb-boardwrap"><div class="sb-sign" id="sbSign"></div>`
    + `<div class="sb-board" id="sbBoard" style="overflow-y:auto">${inner}</div></div><div class="sb-side"><div class="sb-warn" id="sbWarn"></div></div></div></div>`
  return scroller($('#sbBoard'), scale)
}
/* an upright phone's board: ONE scroller, the sign-off line and the issues list riding at its head (SchedBoard.tsx) */
function phoneBoard(inner = ''): HTMLElement {
  document.body.innerHTML = `<div id="schedBoard"><div class="sb-main" style="overflow-y:auto"><div class="sb-boardwrap"><div class="sb-sign" id="sbSign"><div id="sbSignBar"></div></div>`
    + `<div class="sb-board" id="sbBoard">${inner}</div></div><div class="sb-side"><div class="sb-warn" id="sbWarn"><div class="sbwrap"><div class="wh" data-sbwtog></div></div></div></div></div></div>`
  return scroller($('.sb-main'), 1)
}
function scroller(sc: HTMLElement, scale: number): HTMLElement {
  Object.defineProperty(sc, 'scrollHeight', { value: 3000, configurable: true })
  Object.defineProperty(sc, 'clientHeight', { value: 600, configurable: true })
  Object.defineProperty(sc, 'offsetWidth', { value: 300 / scale, configurable: true })
  place(sc, { top: 0, bottom: 600 })
  ;(sc as any).scrollBy = vi.fn()
  return sc
}
const moved = (sc: HTMLElement) => ((sc as any).scrollBy as ReturnType<typeof vi.fn>).mock.calls.map(c => (c[0] as any).top as number)
const ABOVE: Place = { top: -500, bottom: -480 }, BELOW: Place = { top: 900, bottom: 920 }, SEEN: Place = { top: 100, bottom: 120 }

describe('the board\'s Undo landing: how far the list is asked to move (the board as told)', () => {
  afterEach(() => { document.body.innerHTML = ''; vi.useRealTimers() })

  it('at its ordinary size: a box above comes down to just under the top, one below comes up clear of the foot, one in view moves nothing', () => {
    let sc = board('<input data-bfld="fr:0.0.0.0">'); place($('[data-bfld]'), ABOVE)
    bringBoardChangeOnScreen(['fr:0.0.0.0'])
    expect(moved(sc)).toEqual([-508])
    sc = board('<input data-bfld="fr:0.0.0.0">'); place($('[data-bfld]'), BELOW)
    bringBoardChangeOnScreen(['fr:0.0.0.0'])
    expect(moved(sc)).toEqual([328])
    sc = board('<input data-bfld="fr:0.0.0.0">'); place($('[data-bfld]'), SEEN)
    bringBoardChangeOnScreen(['fr:0.0.0.0'])
    expect(moved(sc)).toEqual([])
  })

  /* finding 1 (Astra 1, the fresh Opus reader F1): inside the pinched desktop layout a list scrolls in its OWN units
     while every box is measured on the screen, so the screen's distance is divided by the list's scale */
  it('the desktop layout pinched to half size on a phone: the list is asked for TWICE the screen\'s distance', () => {
    const sc = board('<input data-bfld="fr:0.0.0.0">', 0.5); place($('[data-bfld]'), ABOVE)
    bringBoardChangeOnScreen(['fr:0.0.0.0'])
    expect(moved(sc)).toEqual([-1016])
    const up = board('<input data-bfld="fr:0.0.0.0">', 0.5); place($('[data-bfld]'), BELOW)
    bringBoardChangeOnScreen(['fr:0.0.0.0'])
    expect(moved(up)).toEqual([656])
  })
  it('the desktop layout pinched to twice its size: the list is asked for HALF the screen\'s distance', () => {
    const sc = board('<input data-bfld="fr:0.0.0.0">', 2); place($('[data-bfld]'), ABOVE)
    bringBoardChangeOnScreen(['fr:0.0.0.0'])
    expect(moved(sc)).toEqual([-254])
    const up = board('<input data-bfld="fr:0.0.0.0">', 2); place($('[data-bfld]'), BELOW)
    bringBoardChangeOnScreen(['fr:0.0.0.0'])
    expect(moved(up)).toEqual([164])
  })
  it('pinched to half or to twice, a box already in view still moves nothing', () => {
    for (const scale of [0.5, 2]) {
      const sc = board('<input data-bfld="fr:0.0.0.0">', scale); place($('[data-bfld]'), SEEN)
      bringBoardChangeOnScreen(['fr:0.0.0.0'])
      expect(moved(sc), `at ${scale}`).toEqual([])
    }
  })

  /* finding 7 (the fresh Opus reader, F4): the first cell FOUND ended the search even when it was not laid out, so the
     fall-back address a change carries on purpose was never tried */
  it('a first box that is in the page but not laid out is passed over for the next one that is', () => {
    const sc = board('<input data-bfld="fr:0.0.0.0"><input data-bfld="fr:0.0.1.0">')
    place($('[data-bfld="fr:0.0.0.0"]'), { top: 0, bottom: 0 }); place($('[data-bfld="fr:0.0.1.0"]'), BELOW)
    bringBoardChangeOnScreen(['fr:0.0.0.0', 'fr:0.0.1.0'])
    expect(moved(sc)).toEqual([328])
  })
  it('…and when that next one is in view, nothing moves', () => {
    const sc = board('<input data-bfld="fr:0.0.0.0"><input data-bfld="fr:0.0.1.0">')
    place($('[data-bfld="fr:0.0.0.0"]'), { top: 0, bottom: 0 }); place($('[data-bfld="fr:0.0.1.0"]'), SEEN)
    bringBoardChangeOnScreen(['fr:0.0.0.0', 'fr:0.0.1.0'])
    expect(moved(sc)).toEqual([])
  })

  /* finding 5 (the fresh Opus reader, F2c): a SANS availability card is drawn as a button that opens its input
     (`data-inpedit`), which neither finder of a change's box looked for */
  it('a SANS availability card changed from the board\'s panel: its card is found and brought on screen', () => {
    const sc = board('<button class="sanscard" data-inpedit="i42"></button>'); place($('.sanscard'), ABOVE)
    bringBoardChangeOnScreen(['iu:i42'], MON)
    expect(moved(sc)).toEqual([-508])
  })
  it('…a card already in view moves nothing, and another input\'s card is not taken for it', () => {
    let sc = board('<button class="sanscard" data-inpedit="i42"></button>'); place($('.sanscard'), SEEN)
    bringBoardChangeOnScreen(['iu:i42'], MON)
    expect(moved(sc)).toEqual([])
    sc = board('<button class="sanscard" data-inpedit="i43"></button>'); place($('.sanscard'), ABOVE)
    bringBoardChangeOnScreen(['iu:i42'], MON)
    expect(moved(sc)).toEqual([])
  })
})

/* finding 4 (the fresh Opus reader, F2b): a sign-off, a publish mark or a hidden warning is a record of the day that
   is not its content (`sched.book`, `sched.mutes`), so the step named no box; on a phone the sign-off line and the
   issues list head the board's one scroller and go back unseen from its foot */
describe('the board\'s Undo landing: a sign-off, a publish mark, a hidden warning', () => {
  afterEach(() => { document.body.innerHTML = '' })
  const book = (di: number, wk = CURWEEK): UndoEntry => ({ forward: [{ op: 'put', collection: 'sched.book', id: `${wk}#${di}`, before: { sg: {} }, after: { sg: { ao: 'bane' } } }] } as unknown as UndoEntry)
  const mutes = (di: number, wk = CURWEEK): UndoEntry => ({ forward: [{ op: 'put', collection: 'sched.mutes', id: `${wk}#${di}`, before: [], after: ['0|x'] }] } as unknown as UndoEntry)

  it('each names a place on its own day and loaded week, and none on another day or week', () => {
    for (const dir of ['undo', 'redo'] as const) {
      expect(boardLandKeys(book(MON), dir, MON).length, 'a sign-off').toBeGreaterThan(0)
      expect(boardLandKeys(mutes(MON), dir, MON).length, 'a hidden warning').toBeGreaterThan(0)
      expect(boardLandKeys(book(1), dir, MON)).toEqual([])
      expect(boardLandKeys(mutes(1), dir, MON)).toEqual([])
      expect(boardLandKeys(book(MON, '01/01/2001'), dir, MON)).toEqual([])
      expect(boardLandKeys(mutes(MON, '01/01/2001'), dir, MON)).toEqual([])
    }
  })
  it('a sign-off undone from the foot of a phone\'s board: the sign-off line comes down into view', () => {
    const sc = phoneBoard(); place($('#sbSign'), ABOVE); place($('#sbSignBar'), ABOVE); place($('.wh'), { top: -470, bottom: -440 })
    bringBoardChangeOnScreen(boardLandKeys(book(MON), 'undo', MON), MON)
    expect(moved(sc)).toEqual([-508])
  })
  it('a hidden warning undone from the foot of a phone\'s board: the day\'s issues bar comes down into view', () => {
    const sc = phoneBoard(); place($('#sbSign'), ABOVE); place($('#sbSignBar'), ABOVE); place($('.wh'), { top: -470, bottom: -440 })
    bringBoardChangeOnScreen(boardLandKeys(mutes(MON), 'redo', MON), MON)
    expect(moved(sc)).toEqual([-478])
  })
  it('the sign-off line or the issues bar already in view: nothing moves', () => {
    const sc = phoneBoard(); place($('#sbSign'), SEEN); place($('#sbSignBar'), SEEN); place($('.wh'), { top: 130, bottom: 160 })
    bringBoardChangeOnScreen(boardLandKeys(book(MON), 'undo', MON), MON)
    bringBoardChangeOnScreen(boardLandKeys(mutes(MON), 'undo', MON), MON)
    expect(moved(sc)).toEqual([])
  })
  /* on a desktop the issues list scrolls ON ITS OWN in the side column, its bar riding at its head: a warning hidden from
     lower down that list changes its own LINE, in view — bringing the bar back would move a list whose change is in
     sight (D672). The line is the change where it is drawn; the bar only where it is not (a phone's folded list). */
  it('a hidden warning whose own line is drawn: in view it moves nothing though the bar is above; out of view, its list comes to the line', () => {
    const w = (view.displayedByDay(MON)?.warns || [])[0]
    expect(w, 'the demo Monday raises a warning').toBeTruthy()
    const e = { forward: [{ op: 'put', collection: 'sched.mutes', id: `${CURWEEK}#${MON}`, before: [], after: [view.warnMuteKey(w)] }] } as unknown as UndoEntry
    const desk = (line: Place, bar: Place = ABOVE) => {
      document.body.innerHTML = `<div id="schedBoard"><div class="sb-main"><div class="sb-boardwrap"><div class="sb-board" id="sbBoard"></div></div>`
        + `<div class="sb-side"><div class="sb-warn" id="sbWarn" style="overflow-y:auto"><div class="sbwrap open"><div class="wh" data-sbwtog></div>`
        + `<div class="wln" data-wdi="${MON}" data-wix="0"></div><div class="wln" data-wdi="${MON}" data-wix="1"></div></div></div></div></div></div>`
      const sc = scroller($('#sbWarn'), 1); place($('.wh'), bar); place($('[data-wix="0"]'), line); place($('[data-wix="1"]'), { top: 2000, bottom: 2020 })
      return sc
    }
    for (const dir of ['undo', 'redo'] as const) {
      let sc = desk(SEEN)
      bringBoardChangeOnScreen(boardLandKeys(e, dir, MON), MON)
      expect(moved(sc), `${dir}: its line in view`).toEqual([])
      sc = desk(BELOW)
      bringBoardChangeOnScreen(boardLandKeys(e, dir, MON), MON)
      expect(moved(sc), `${dir}: its line below its list's foot`).toEqual([328])
      /* the narrow read, finding 2 (11 Nov 26): the bar in view is NOT the change in view while its line is laid out —
         a warning hidden low in a long list, the list back at its top, went back unseen */
      sc = desk(BELOW, SEEN)
      bringBoardChangeOnScreen(boardLandKeys(e, dir, MON), MON)
      expect(moved(sc), `${dir}: its line below its list's foot, the bar in view`).toEqual([328])
      /* …and where the list is folded (a phone), its lines in the page with no size, the bar is the change: in view, nothing moves */
      sc = desk({ top: 0, bottom: 0 }, SEEN)
      bringBoardChangeOnScreen(boardLandKeys(e, dir, MON), MON)
      expect(moved(sc), `${dir}: its line not laid out, the bar in view`).toEqual([])
      sc = desk({ top: 0, bottom: 0 }, ABOVE)
      bringBoardChangeOnScreen(boardLandKeys(e, dir, MON), MON)
      expect(moved(sc), `${dir}: its line not laid out, the bar above`).toEqual([-508])
    }
  })
  it('a step that changed a box of the day AND wiped its sign-offs goes to the box, not the sign-off line', () => {
    const before = copy(DAYS[MON]), after = copy(DAYS[MON])
    after.waves[0].formations[0].aircraft[0].rmks = "signed day"
    const keys = boardLandKeys(step(MON, before, after, book(MON).forward as any[]), 'undo', MON)
    const own = boardLandKeys(step(MON, before, after), 'undo', MON)
    expect(keys.slice(0, own.length)).toEqual(own)
  })

  /* the narrow read, finding 4 (11 Nov 26): on a signed day every change wipes the four sign-offs, and its Undo puts them
     back. Where the change itself is something the board does not draw (the area strip, the traffic window), the
     sign-off line is the one thing on the board that changed — and the first fix round dropped it for any step that
     touched the day's content. It is the fall-back now: only when NONE of the step's own places is drawn on the board. */
  const signedDayStep = () => {
    const before = copy(DAYS[MON]), after = copy(DAYS[MON])
    after.waves[0].formations[0].aircraft[0].rmks = "signed day"
    return { e: step(MON, before, after, book(MON).forward as any[]), box: boardLandKeys(step(MON, before, after), 'undo', MON)[0]! }
  }
  it('a signed day, a step whose own change the board does not draw, its sign-offs wiped or put back: the sign-off line comes into view', () => {
    const { e } = signedDayStep()
    for (const dir of ['undo', 'redo'] as const) {
      const sc = phoneBoard(); place($('#sbSign'), ABOVE); place($('#sbSignBar'), ABOVE)
      bringBoardChangeOnScreen(boardLandKeys(e, dir, MON), MON)
      expect(moved(sc), dir).toEqual([-508])
    }
  })
  it('…its own change drawn on the board: the box is the change — in view nothing moves, out of view the list goes to the box, folded away nothing moves', () => {
    const { e, box } = signedDayStep()
    const both = (boxAt: Place, signAt: Place) => {
      const sc = phoneBoard(`<input data-bfld="${box}">`); place($('#sbSign'), signAt); place($('#sbSignBar'), signAt); place($('[data-bfld]'), boxAt)
      bringBoardChangeOnScreen(boardLandKeys(e, 'undo', MON), MON)
      return moved(sc)
    }
    expect(both(SEEN, ABOVE), 'the box in view, the sign-off line above').toEqual([])
    expect(both(ABOVE, BELOW), 'the box above: the list goes to it, not down to the sign-off line').toEqual([-508])
    expect(both({ top: 0, bottom: 0 }, ABOVE), 'the box in a folded section: drawn, so the sign-off line is not its stand-in').toEqual([])
  })
  it('…a row only REMOVED on a signed day still lands nowhere (the known limit), and so does an input taken away', () => {
    const before = copy(DAYS[MON]), after = copy(DAYS[MON])
    after.allhands = after.allhands.slice(1)
    const rowGone = boardLandKeys(step(MON, before, after, book(MON).forward as any[]), 'redo', MON)
    expect(rowGone).toEqual([])
    const inputGone = { forward: [{ op: 'del', collection: 'inputs', id: 'i-gone', before: { iid: 'i-gone' }, after: null }, ...(book(MON).forward as any[])] } as unknown as UndoEntry
    for (const keys of [rowGone, boardLandKeys(inputGone, 'redo', MON)]) {
      const sc = phoneBoard(); place($('#sbSign'), ABOVE); place($('#sbSignBar'), ABOVE)
      bringBoardChangeOnScreen(keys, MON)
      expect(moved(sc)).toEqual([])
    }
  })
})

/* finding 3 (Astra 3): a changed Personal Input whose panel is folded has no drawn row to land on — the panel is opened
   on that day first, by the same test a tap on a change uses (ui/interactions.ts jumpToChange): an input listed under
   Personal Inputs, and for one accepted onto the programme only on a day its programme row does not stand on */
describe('the board\'s Undo landing: a Personal Input under a folded panel', () => {
  const mine: any[] = []
  const file = (o: any) => { const inp = { person: 'bane', date: DATES[MON], allday: true, remarks: 'landing test', ...o }; INPUTS.push(inp); mine.push(inp); return inpId(inp) }
  afterEach(() => { for (const inp of mine.splice(0)) { const i = INPUTS.indexOf(inp); if (i >= 0) INPUTS.splice(i, 1) } view.PIOPEN.clear(); document.body.innerHTML = '' })

  it('a rejected input whose row is not drawn: Personal Inputs is opened on that day', () => {
    const iid = file({ type: 'Meeting', acc: 'r' })
    board('')
    expect(view.PIOPEN.has(MON)).toBe(false)
    bringBoardChangeOnScreen([`iu:${iid}`], MON)
    expect(view.PIOPEN.has(MON), 'the panel is open on the day').toBe(true)
    expect(view.PIOPEN.size, 'and on no other day').toBe(1)
  })
  it('a leave (listed under Unavailable, never under Personal Inputs) opens nothing', () => {
    const iid = file({ type: 'LL' })
    board('')
    bringBoardChangeOnScreen([`iu:${iid}`], MON)
    expect(view.PIOPEN.size).toBe(0)
  })
  it('an input accepted onto the programme, its row standing on the day, opens nothing', () => {
    const acc = (INPUTS as any[]).find(x => x.acc === 'g' && standsOn(DAYS[MON], inpId(x), x))
    expect(acc, 'the demo Monday has an accepted input on its Ground Programme').toBeTruthy()
    board('')
    bringBoardChangeOnScreen([`iu:${inpId(acc)}`], MON)
    expect(view.PIOPEN.size).toBe(0)
  })
  it('an input whose row IS drawn and in view: the panel is not touched and nothing moves', () => {
    const iid = file({ type: 'Meeting', acc: 'r' })
    const sc = board(`<div data-inprow="${iid}"></div>`); place($('[data-inprow]'), SEEN)
    bringBoardChangeOnScreen([`iu:${iid}`], MON)
    expect(view.PIOPEN.size).toBe(0)
    expect(moved(sc)).toEqual([])
  })
  /* the narrow read, finding 3 (11 Nov 26): the test of a tap on a change is asked about a day the tap already knows the
     input is on; an Undo can bring the board to a day the input has LEFT (its date moved), and Monday's panel opened for
     an input dated Wednesday */
  it('an input that is not on the board\'s day opens nothing there', () => {
    const iid = file({ type: 'Meeting', acc: 'r', date: DATES[2] })
    board('')
    bringBoardChangeOnScreen([`iu:${iid}`], MON)
    expect(view.PIOPEN.size, 'Monday\'s Personal Inputs stays folded for an input dated Wednesday').toBe(0)
    bringBoardChangeOnScreen([`iu:${iid}`], 2)
    expect([...view.PIOPEN], 'and opens on its own day').toEqual([2])
  })
  it('an input the step took away altogether opens nothing', () => {
    board('')
    bringBoardChangeOnScreen(['iu:gone-for-good'], MON)
    expect(view.PIOPEN.size).toBe(0)
  })
})

/* case S1 (the fresh Opus reader; settled by the browser, 11 Nov 26 — it FAILED with Personal Inputs open): an accepted
   input is drawn twice on its day — its row on the Ground Programme and, with Personal Inputs open, its line there. A
   step of the input names the INPUT, not a box, so the landing took the first drawing it found — the line — and
   scrolled to it though the box just retyped on the programme row was in view (2746 → 2832 on a desktop). The change is
   in view when ANY drawing of the input is (D672). */
describe('the board\'s Undo landing: an accepted input, drawn twice on its day', () => {
  afterEach(() => { document.body.innerHTML = ''; view.PIOPEN.clear() })
  const twice = (row: Place, line: Place) => {
    const d: any = DAYS[MON]
    const inp = (INPUTS as any[]).find(x => x.acc === 'g' && standsOn(d, inpId(x), x))
    expect(inp, 'the demo Monday has an accepted input on its Ground Programme').toBeTruthy()
    const iid = inpId(inp), ri = d.ground.indexOf(standsOn(d, iid, inp))
    const sc = board(`<input data-bfld="gr:${MON}.${ri}.prog"><input data-bfld="gr:${MON}.${ri}.end"><div data-inprow="${iid}"></div>`)
    place($('[data-bfld$=".prog"]'), row); place($('[data-bfld$=".end"]'), row); place($('[data-inprow]'), line)
    bringBoardChangeOnScreen([`iu:${iid}`], MON)
    expect(view.PIOPEN.size, 'Personal Inputs is not touched').toBe(0)
    return moved(sc)
  }
  it('its time retyped on its Ground Programme row, in view, its Personal Inputs line open lower down: nothing moves', () => {
    expect(twice(SEEN, BELOW)).toEqual([])
  })
  it('retyped on its Personal Inputs line, in view, its programme row above the screen: nothing moves', () => {
    expect(twice(ABOVE, SEEN)).toEqual([])
  })
  it('neither in view: the list goes to its programme row, the one drawing the day always shows', () => {
    expect(twice(ABOVE, BELOW)).toEqual([-508])
  })
})

/* finding 6 (the fresh Opus reader, F3): the landing was booked before the restore was known to have gone through, so
   a REFUSED Undo or Redo could still scroll the board to a box whose value never changed back */
describe('the board\'s Undo landing: only once the step has actually been applied', () => {
  afterEach(() => { document.body.innerHTML = ''; vi.useRealTimers(); view.setBoardDay(null); view.setPage('viewsched') })
  const remarkStep = (undone: boolean) => {
    const before = copy(DAYS[MON]), after = copy(DAYS[MON])
    after.waves[0].formations[0].aircraft[0].rmks = "refused"
    const e: any = step(MON, before, after)
    e.scope = { module: 'sched' }; e.contexts = []; e.undone = undone
    return e as UndoEntry
  }
  const open = (e: UndoEntry, dir: 'undo' | 'redo') => {
    setSession({ role: 'admin', user: 'ad' } as any)
    view.setPage('editsched'); view.setBoardDay(MON)
    const key = boardLandKeys(e, dir, MON)[0]!
    const sc = board(`<input data-bfld="${key}">`); place($('[data-bfld]'), ABOVE)
    return sc
  }

  it('an Undo that was refused (the step still stands) moves nothing', () => {
    vi.useFakeTimers()
    const e = remarkStep(false), sc = open(e, 'undo')
    _snapView(e, 'undo')
    /* the restore is refused: the step is not marked undone */
    vi.runAllTimers()
    expect(moved(sc)).toEqual([])
  })
  it('a Redo that was refused (the step stays undone) moves nothing', () => {
    vi.useFakeTimers()
    const e = remarkStep(true), sc = open(e, 'redo')
    _snapView(e, 'redo')
    vi.runAllTimers()
    expect(moved(sc)).toEqual([])
  })
  it('an Undo, and a Redo, that went through bring the box on screen as before', () => {
    vi.useFakeTimers()
    let e: any = remarkStep(false), sc = open(e, 'undo')
    _snapView(e, 'undo'); e.undone = true          // timeline.ts globalUndo marks it, in the same turn, once applied
    vi.runAllTimers()
    expect(moved(sc)).toEqual([-508])
    e = remarkStep(true); sc = open(e, 'redo')
    _snapView(e, 'redo'); e.undone = false
    vi.runAllTimers()
    expect(moved(sc)).toEqual([-508])
  })
})

/* the narrow read, finding 5 (11 Nov 26): "a publish undone from the foot lands on the sign-off line" had no test behind
   it — were a publish to write the day's own record too, the landing would be dropped without a sound. A REAL publish
   step here, through the app's own wiring: its records, whatever they are, name the sign-off line and nothing else. */
describe('the board\'s Undo landing: a real publish step', () => {
  afterEach(() => { document.body.innerHTML = '' })
  it('a day published, then Undo or Redo from the foot of a phone\'s board: the sign-off line comes down into view; in view, nothing moves', () => {
    _resetTimeline(); installGlobalUndo()
    setSession({ role: 'admin', user: 'ad' } as any)
    const g = signOf(MON); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    commitSetDayApproved(MON, true)
    try {
      expect(dayApproved(MON), 'the day went out').toBe(true)
      const all = _timelineEntries(), e = all[all.length - 1]!
      expect(e.forward.some(ch => ch.collection === 'sched.book'), 'the newest step is the publish').toBe(true)
      for (const dir of ['undo', 'redo'] as const) {
        const keys = boardLandKeys(e, dir, MON)
        expect(keys, `${dir}: the sign-off line, and no box`).toEqual([`sign:${MON}`])
        let sc = phoneBoard(); place($('#sbSign'), ABOVE); place($('#sbSignBar'), ABOVE)
        bringBoardChangeOnScreen(keys, MON)
        expect(moved(sc), `${dir}: from the foot`).toEqual([-508])
        sc = phoneBoard(); place($('#sbSign'), SEEN); place($('#sbSignBar'), SEEN)
        bringBoardChangeOnScreen(keys, MON)
        expect(moved(sc), `${dir}: in view`).toEqual([])
      }
    } finally { globalUndo(); _resetTimeline() }
    expect(dayApproved(MON), 'the day is a draft again for whatever runs next').toBe(false)
  })
})

/* the narrow read of the second fix round, point 3 (11 Nov 26): "the board draws none of the step's own places" was tested
   with a made-up step only. REAL steps here, each written the way the app writes it, on a day signed through the app's
   one sign-off write (engine/publish.ts setSign, which BINDS each name to the content it signed):
   - the traffic (the Traffic window's write, ui/Modals.tsx airEdit) — the one of the three the board has no box for;
   - an area and its time (ui/textedit.ts) — the board DOES draw these, on the strip under a formation's lines.
   What they pin: the comparison names each by its own key (`tr:` / `ar:` / `at:`), so such a step is never read as
   naming nothing. What they also show, and the made-up step hid: an edit on a signed day does not CLEAR the sign-offs
   in what is saved — the names stay stored and stop being shown while the content differs from what they signed, coming
   back when it is put back. So the step's own records carry no change of the sign-offs, and a real traffic step names
   the traffic alone: the sign-off line is not among its places. The fall-back of finding 4 serves a step whose own
   records DO change the sign-offs (the made-up step's shape, above). */
describe('the board\'s Undo landing: real steps on a signed day — the traffic, an area, an area\'s time', () => {
  const ROLES = [['cur', 'ignite'], ['sked', 'bane'], ['plan', 'stiff'], ['appr', 'pump']] as const
  const signed = () => {
    _resetTimeline(); installGlobalUndo()
    setSession({ role: 'admin', user: 'ad' } as any); view.setPage('editsched')
    schedWrite(SCHED_TYPES.sign, () => { for (const [role, who] of ROLES) setSign(MON, role, who) })
    expect(Object.values(signShown(MON)).filter(Boolean).length, 'all four sign-offs stand').toBe(4)
  }
  const newest = () => { const all = _timelineEntries(); return all[all.length - 1]! }
  const undoAll = () => { for (let i = _timelineEntries().length; i > 0; i--) globalUndo(); _resetTimeline(); view.setPage('viewsched') }
  const dayChange = (e: UndoEntry) => e.forward.find(ch => ch.collection === 'days') as any
  afterEach(() => { document.body.innerHTML = '' })

  it('the traffic changed: the step names the traffic, by the comparison\'s own key; the sign-offs are not in its records', () => {
    signed()
    try {
      const n = _timelineEntries().length
      const g: any = DAYS[MON].waves[0], was = ((g.traffic || []) as string[]).join(' · ')
      /* the Traffic window: "Add row" writes the line in place, then airEdit marks it and runs the epilogue */
      g.traffic = g.traffic || []; g.traffic.push('1 X TRANSPORT / WEST HIGH / FL240 / 1300H - 1715H')
      markEdit(`tr:${MON}.0`, was, g.traffic.join(' · ')); view.afterSchedMutate()
      expect(_timelineEntries().length, 'one step').toBe(n + 1)
      const e = newest(), ch = dayChange(e)
      expect(ch, 'the step holds the day').toBeTruthy()
      expect(canonicalUnits(ch.after, ch.before, MON).flatMap((u: any) => u.jump || []), 'the comparison names the traffic').toContain(`tr:${MON}.0`)
      for (const dir of ['undo', 'redo'] as const) expect(boardLandKeys(e, dir, MON), dir).toContain(`tr:${MON}.0`)
      /* the sign-offs: still stored, no longer shown — and so not a change in the step's own records */
      expect(Object.values(signAt(MON)).filter(Boolean).length, 'the four names are still stored').toBe(4)
      expect(Object.values(signShown(MON)).filter(Boolean).length, 'and none is shown while the day differs from what they signed').toBe(0)
      const book = e.forward.find(c => c.collection === 'sched.book') as any
      if (book) expect(book.after?.sg, 'the saved sign-offs are the same before and after the step').toEqual(book.before?.sg)
      globalUndo()
      expect(Object.values(signShown(MON)).filter(Boolean).length, 'the edit undone: all four show again').toBe(4)
    } finally { undoAll() }
  })

  it('an area, and its time, retyped: each named by its own key, and the board lands on the strip it draws', () => {
    signed()
    try {
      const f: any = DAYS[MON].waves[0].formations[0]
      for (const [pre, fld, attr] of [['ar', 'area', 'data-area'], ['at', 'atime', 'data-atime']] as const) {
        const key = `${pre}:${MON}.0.0`, was = String(f[fld] || ''), now = was + ' X'
        /* ui/textedit.ts: the box's value written in place, then one text command that marks it */
        f[fld] = now; schedWrite(SCHED_TYPES.text, () => markEdit(key, was, now), { key })
        const e = newest(), ch = dayChange(e)
        expect(ch, `${pre}: the step holds the day`).toBeTruthy()
        expect(canonicalUnits(ch.after, ch.before, MON).flatMap((u: any) => u.jump || []), `${pre}: the comparison names it`).toContain(key)
        for (const dir of ['undo', 'redo'] as const) {
          const keys = boardLandKeys(e, dir, MON)
          expect(keys, `${pre} ${dir}`).toContain(key)
          let sc = board(`<span ${attr}="${MON}.0.0"></span>`); place($(`[${attr}]`), ABOVE)
          bringBoardChangeOnScreen(keys, MON)
          expect(moved(sc), `${pre} ${dir}: out of view above`).toEqual([-508])
          sc = board(`<span ${attr}="${MON}.0.0"></span>`); place($(`[${attr}]`), SEEN)
          bringBoardChangeOnScreen(keys, MON)
          expect(moved(sc), `${pre} ${dir}: in view`).toEqual([])
        }
      }
    } finally { undoAll() }
    expect(Object.values(signAt(MON)).filter(Boolean).length, 'the day is unsigned again for whatever runs next').toBe(0)
  })
})
