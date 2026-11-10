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
import { _snapView } from '../state/undo-wire'
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
    expect(boardLandKeys(step(MON, before, after), 'redo', MON)[0], 'the head row is another now').toBe(`ap:${MON}.0.prog`)
    /* the LAST row dragged up one: only the last two differ, and the first of those is named */
    const up = copy(DAYS[MON])
    up.allhands = [...up.allhands.slice(0, n - 2), up.allhands[n - 1], up.allhands[n - 2]]
    expect(boardLandKeys(step(MON, before, up), 'undo', MON)[0]).toBe(`ap:${MON}.${n - 2}.prog`)
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
    const desk = (line: Place) => {
      document.body.innerHTML = `<div id="schedBoard"><div class="sb-main"><div class="sb-boardwrap"><div class="sb-board" id="sbBoard"></div></div>`
        + `<div class="sb-side"><div class="sb-warn" id="sbWarn" style="overflow-y:auto"><div class="sbwrap open"><div class="wh" data-sbwtog></div>`
        + `<div class="wln" data-wdi="${MON}" data-wix="0"></div><div class="wln" data-wdi="${MON}" data-wix="1"></div></div></div></div></div></div>`
      const sc = scroller($('#sbWarn'), 1); place($('.wh'), ABOVE); place($('[data-wix="0"]'), line); place($('[data-wix="1"]'), { top: 2000, bottom: 2020 })
      return sc
    }
    for (const dir of ['undo', 'redo'] as const) {
      let sc = desk(SEEN)
      bringBoardChangeOnScreen(boardLandKeys(e, dir, MON), MON)
      expect(moved(sc), `${dir}: its line in view`).toEqual([])
      sc = desk(BELOW)
      bringBoardChangeOnScreen(boardLandKeys(e, dir, MON), MON)
      expect(moved(sc), `${dir}: its line below its list's foot`).toEqual([328])
    }
  })
  it('a step that changed a box of the day AND wiped its sign-offs goes to the box, not the sign-off line', () => {
    const before = copy(DAYS[MON]), after = copy(DAYS[MON])
    after.waves[0].formations[0].aircraft[0].rmks = "signed day"
    const keys = boardLandKeys(step(MON, before, after, book(MON).forward as any[]), 'undo', MON)
    const own = boardLandKeys(step(MON, before, after), 'undo', MON)
    expect(keys.slice(0, own.length)).toEqual(own)
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
