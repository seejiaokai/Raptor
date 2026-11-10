/* THE BOARD'S UNDO AND REDO BRING THE CHANGE ON SCREEN WHEN IT IS OUT OF VIEW ([BOARD-UNDO-SAME-DAY] — chat 61's
   reproduction, 10 Nov 26: a remark changed near the board's top, the board scrolled to its foot, Undo pressed — the
   remark went back 1989px above the screen and nothing on screen moved or said so).

   His rule (D672, 8 Oct 26): Undo and Redo, everywhere, leave the screen where it is when what they change is in view,
   and move to the change only when it is out of view. The week does it by day (highlights.ts bringDayIntoView), the
   Inputs list and Quals by row (onscreen.ts); the board only ever changed DAY (state/undo-wire.ts snapView).

   TWO HALVES, because the landing is asked BEFORE the step's writes are put back and the screen is right only after:
     · boardLandKeys — pure: what the step changes on this day of the loaded week, as the addresses the board draws.
       Read from the step's own two images of the day by the one comparison the "To go out" list uses
       (engine/canonical.ts canonicalUnits), so a change is found here exactly where a tap on its line would land. The
       addresses are positions on the day AS IT WILL STAND once the step is applied — the image this direction restores.
     · bringBoardChangeOnScreen — once the board has repainted: the first of those changes the board draws, brought just
       under the board's own bar (or up from under the screen's foot) by the least movement, and not moved at all when
       it is in view. A step that leaves nothing to point at (a row it removes) moves nothing.

   WHAT THE TWO BLIND READS OF 11 NOV 26 ADDED (Astra's; the fresh Opus reader's), each seen failing first:
     · a row RE-ORDERED is a 'move' in the comparison, which names no box: its place is found here (movedRowKeys);
     · a sign-off, a publish mark and a hidden warning are records of the day that are not its content: they land on the
       sign-off line and on the warning's own line or the day's issues bar (`sign:`, `warnline:`);
     · an INPUT is drawn in up to three places — its row on the programme, its line under Personal Inputs or Unavailable,
       its SANS availability card — and a step of it names the input, not a box: the change is in view when ANY of them
       is; and where none is drawn because Personal Inputs is folded, the panel is opened first, by the test a tap on a
       change uses;
     · a box in the page but not laid out is passed over; a change of another week names nothing; and inside the pinched
       desktop layout the list is moved in ITS units, not the screen's. */
import { canonicalUnits } from '../engine/canonical'
import { DAYS } from '../engine/data'
import { onCommon } from '../engine/grouprows'
import { DATES, inpById, inputCoversDate, listedPersonal } from '../engine/inputs'
import { iuParts } from '../engine/keys'
import { groundOrder } from '../engine/order'
import { standsOn } from '../engine/overlay'
import { rowsOf } from '../engine/rowids'
import { CURWEEK } from '../engine/waves'
import type { UndoEntry } from '../undo/types'
import { dayKeyOf } from '../undo/derive'
import { notify } from '../state/store'
import * as view from '../state/view'
import { findHistCell, findInputCell } from './histbubble'
import { scrollToShow } from './onscreen'
import { scaleOf } from './pinchzoom'

/* the two places a step lands on that are not a box of the day: the sign-off line (`sign:<di>`), and a hidden warning's
   own line or the day's issues bar (`warnline:<the warning's hide key>` — the changes window's name for the same line,
   ui/interactions.ts jumpToChange) */
const SIGN = 'sign:', WARNLINE = 'warnline:'
/* what the sign-off line shows of a day's book: published or not, the four sign-offs, the version it stands at. The
   book's other fields (the pending marks, the saved plans) change with every edit of a published day and are no change
   to that line. */
const SIGN_FIELDS = ['ok', 'sg', 'cv']
const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null)

/* THE ROWS A RE-ORDER LEFT WHERE THEY WERE, relative to one another: the longest run of rows still in their old order
   (`old[n]` = the old place of the row now at n, −1 for a row that was not in the list). Every other row is one that
   MOVED. Of two runs equally long the one ending lowest is kept, so of two rows that changed places the upper is the
   one named. */
function keptInOrder(old: number[]): Set<number> {
  const tails: number[] = [], prev: number[] = old.map(() => -1)
  old.forEach((p, n) => {
    if (p < 0) return
    let lo = 0, hi = tails.length
    while (lo < hi) { const mid = (lo + hi) >> 1; if (old[tails[mid]!]! < p) lo = mid + 1; else hi = mid }
    prev[n] = lo > 0 ? tails[lo - 1]! : -1
    tails[lo] = n
  })
  const kept = new Set<number>()
  for (let n = tails.length ? tails[tails.length - 1]! : -1; n >= 0; n = prev[n]!) kept.add(n)
  return kept
}

/* A ROW RE-ORDERED — a drag by its grip, Auto sort, Sort all — changes no box, so the comparison's 'move' names none
   (canonical.ts: `mov:<di>.<kind>`, no jump) and the landing had nowhere to go (Astra 2, the fresh Opus reader F2a). Its
   place, by the comparison's own test of a move: in each list, the rows BOTH images hold, matched by their hidden ids —
   and of those, THE ROWS THAT MOVED, each addressed as it stands on the day this direction restores. Not "the first
   whose place differs" (the first fix round; the narrow read, finding 1): one row dragged down shifts every row above
   its new place, and the landing went to the head while the row that moved went back unseen to the foot. A row only
   added or only taken away re-orders nothing. */
function movedRowKeys(from: any, to: any, di: number): string[] {
  const out: string[] = []
  const ids = (d: any) => new Set<string>(rowsOf(d).map((r: any) => r && r.rid).filter(Boolean))
  const inFrom = ids(from), inTo = ids(to)
  /* `now`: the list as it will stand, each row with the addresses to try for it; `was`: the same list before */
  const moved = (now: Array<[any, string[]]>, was: any[]) => {
    const a = now.filter(([r]) => r && r.rid && inFrom.has(r.rid))
    const b = (was || []).filter((r: any) => r && r.rid && inTo.has(r.rid))
    if (a.length < 2) return
    const placeWas = new Map<string, number>()
    b.forEach((r: any, n: number) => placeWas.set(r.rid, n))
    const old = a.map(([r]) => placeWas.get(r.rid) ?? -1)
    if (old.every((p, n) => p === n)) return
    const kept = keptInOrder(old)
    a.forEach(([, keys], n) => { if (!kept.has(n)) out.push(...keys) })
  }
  const list = (rows: any, key: (i: number) => string[]): Array<[any, string[]]> => ((rows || []) as any[]).map((r, i) => [r, key(i)])
  const byRid = (rows: any) => { const m = new Map<string, any>(); for (const r of (rows || []) as any[]) if (r && r.rid) m.set(r.rid, r); return m }
  /* a wave's or a duty block's own heading first, then its first line — whichever the board draws */
  moved(list(to.waves, gi => [`wl:${di}.${gi}`, `ff:${di}.${gi}.0.cs`, `fr:${di}.${gi}.0.0`]), from.waves)
  moved(list(to.allhands, i => [`ap:${di}.${i}.prog`]), from.allhands)
  moved(list(to.dutywaves, wi => [`dl:${di}.${wi}`, `dr:${di}.${wi}.0.role`]), from.dutywaves)
  /* the Ground Programme as DRAWN: by time unless arranged by hand, an input's row on the Common Programme not in it */
  const ground = (d: any): any[] => groundOrder(d.ground, d.gman).filter((x: any) => !onCommon(x.row))
  moved(ground(to).map((x: any): [any, string[]] => [x.row, [`gr:${di}.${x.ri}.prog`]]), ground(from).map((x: any) => x.row))
  for (const kind of new Set([...Object.keys(to.sims || {}), ...Object.keys(from.sims || {})])) {
    moved(list((to.sims || {})[kind], i => [`sr:${di}.${kind}.${i}.label`]), (from.sims || {})[kind])
  }
  const wavesWas = byRid(from.waves)
  ;((to.waves || []) as any[]).forEach((w, gi) => {
    const ww = w && w.rid && wavesWas.get(w.rid)
    if (!ww) return
    moved(list(w.formations, li => [`ff:${di}.${gi}.${li}.cs`]), ww.formations)
    const formsWas = byRid(ww.formations)
    ;((w.formations || []) as any[]).forEach((f, li) => {
      const wf = f && f.rid && formsWas.get(f.rid)
      if (wf) moved(list(f.aircraft, ai => [`fr:${di}.${gi}.${li}.${ai}`]), wf.aircraft)
    })
  })
  const blocksWas = byRid(from.dutywaves)
  ;((to.dutywaves || []) as any[]).forEach((b, wi) => {
    const wb = b && b.rid && blocksWas.get(b.rid)
    if (wb) moved(list(b.rows, ri => [`dr:${di}.${wi}.${ri}.role`]), wb.rows)
  })
  return out
}

/** what an Undo (or Redo) of `entry` changes on day `di` of the loaded week, in the order to try them — [] when it
 *  changes nothing there */
export function boardLandKeys(entry: UndoEntry, dir: 'undo' | 'redo', di: number): string[] {
  const keys: string[] = [], lines: string[] = []
  /* did the step change what the day HOLDS — its own content, or an input? Then the change is shown by that, and the
     sign-offs such an edit wipes on a signed day are its consequence: following them first would carry the screen off a
     change made in view (D672). They are the FALL-BACK, tried by the landing only when the board draws none of the
     step's own places (the narrow read, finding 4 — an area or the traffic changed on a signed day: the sign-off line is
     then the one thing on the board that changed). Never for a step that only takes something away — a row (it names
     no place), an input (`gone`): that lands nowhere, the known limit. */
  let content = false, gone = false
  for (const ch of entry.forward) {
    if (ch.collection === 'inputs') {
      /* an input's drawings on the day (its programme row, its line, its card) — found by its input, whoever it is addressed by */
      keys.push(`iu:${ch.id}`); content = true
      if ((dir === 'undo' ? ch.before : ch.after) == null) gone = true
      continue
    }
    if (ch.collection !== 'days' && ch.collection !== 'sched.book' && ch.collection !== 'sched.mutes') continue
    /* this day of the LOADED week only: the day number alone let a step of another week put that week's positions onto
       this week's board (the fresh Opus reader, F5) */
    const dk = dayKeyOf(ch.collection, ch.id), h = dk ? dk.lastIndexOf('#') : -1
    if (!dk || h < 0 || dk.slice(0, h) !== String(CURWEEK) || Number(dk.slice(h + 1)) !== di) continue
    /* undo: the record goes from its `after` back to its `before`; redo: the other way */
    const from: any = dir === 'undo' ? ch.after : ch.before, to: any = dir === 'undo' ? ch.before : ch.after
    if (ch.collection === 'days') {
      content = true
      if (!from || !to || typeof from !== 'object' || typeof to !== 'object') continue
      try {
        for (const u of canonicalUnits(from, to, di)) for (const k of u.jump || []) if (k) keys.push(String(k))
        keys.push(...movedRowKeys(from, to, di))
      } catch { /* an image the comparison cannot read: nothing to point at */ }
    } else if (ch.collection === 'sched.book') {
      if (SIGN_FIELDS.some(f => !same(from && from[f], to && to[f]))) lines.push(`${SIGN}${di}`)
    } else if (!same(from, to)) {
      /* the warnings hidden on the day: the ones this step hides or flags again, by their own keys */
      const a: string[] = Array.isArray(from) ? from.map(String) : [], b: string[] = Array.isArray(to) ? to.map(String) : []
      const inA = new Set(a), inB = new Set(b)
      const changed = [...a.filter(k => !inB.has(k)), ...b.filter(k => !inA.has(k))]
      for (const k of changed.length ? changed : ['']) lines.push(`${WARNLINE}${k}`)
    }
  }
  return [...new Set(!content ? lines : keys.length && !gone ? [...keys, ...lines] : keys)]
}
const isLine = (k: string) => k.startsWith(SIGN) || k.startsWith(WARNLINE)

/* what scrolls a box up and down: the first ancestor that does (the board's list on a desktop and an upright phone; the
   whole board on a phone on its side, D1780; the issues list's own column on a desktop) — null when the page itself does */
function scrollerOf(el: HTMLElement): HTMLElement | null {
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    if (p.scrollHeight > p.clientHeight + 1 && /^(auto|scroll|overlay)$/.test(getComputedStyle(p).overflowY)) return p
  }
  return null
}

/* a look at a saved plan or an issued version is a document, not the working day: nothing in it is a landing
   (ui/histbubble.ts LOOK) */
const LOOK = '.preview,.pv-frozen'
const laidOut = (el: Element | null | undefined): el is HTMLElement => !!el && (el as HTMLElement).getBoundingClientRect().height > 0

/* EVERY DRAWING OF WHAT ONE KEY NAMES, the one to go to first. A box of the day is drawn once. An input is not (case S1,
   settled red by the browser on 11 Nov 26: an accepted input's time retyped on its Ground Programme row, in view, and
   the landing scrolled to its line under an open Personal Inputs, the first drawing its finder met): its row on the
   programme, which the day always draws, then its lines under Personal Inputs or Unavailable (one a man there), then its
   SANS availability card — a button that opens the input (`data-inpedit`), which neither finder of a change's box
   looked for (the fresh Opus reader, F2c). */
function drawingsOf(root: Element, key: string, di: number | null): Element[] {
  const board = document.querySelector('#schedBoard') || document
  if (key.startsWith(SIGN)) return [board.querySelector('#sbSignBar') || board.querySelector('#sbSign')].filter(Boolean) as Element[]
  if (key.startsWith(WARNLINE)) {
    /* its own line where the list lays it out (a desktop's column, a phone's opened list); the day's bar ONLY where it
       does not (a phone's folded list). Never both: the bar in view is not the change in view while its line is drawn —
       a warning hidden low in a long list, the list back at its top, went back unseen (the narrow read, finding 2) */
    const k = key.slice(WARNLINE.length)
    let ix = -1
    try { ix = k && di != null ? ((view.displayedByDay(di)?.warns || []) as any[]).findIndex(w => view.warnMuteKey(w) === k) : -1 } catch { /* no warnings to read: the bar */ }
    const line = ix >= 0 ? board.querySelector(`#sbWarn .wln[data-wdi="${di}"][data-wix="${ix}"]`) : null
    if (laidOut(line)) return [line]
    const bar = board.querySelector('#sbWarn .wh')
    return bar ? [bar] : []
  }
  const p = iuParts(key)
  if (!p || !p.iid) { const el = findHistCell(root, key); return el ? [el] : [] }
  const out: Element[] = []
  /* the INPUT, by its id (engine/inputs.ts inpById — the record: where it is drawn is a question about the input, never
     about one man's day; engine/inputs-readers.test.ts lists this file under RECORDS) */
  const inp: any = inpById(p.iid)
  const row = inp && di != null && DAYS[di] ? standsOn(DAYS[di], p.iid, inp) : null
  const ri = row ? ((DAYS[di!] as any).ground || []).indexOf(row) : -1
  if (ri >= 0) out.push(...root.querySelectorAll(`[data-bfld^="gr:${di}.${ri}."]`))
  /* its line: the exact one a key naming one of its people asks for, then whichever of its people's is drawn first */
  for (const el of [findHistCell(root, key), findInputCell(root, key)]) if (el) out.push(el)
  for (const el of root.querySelectorAll('[data-inprow],[data-inpedit]')) {
    const d = (el as HTMLElement).dataset
    const iid = d.inprow != null ? (iuParts(`iu:${d.inprow}`) || { iid: '' }).iid : d.inpedit
    if (iid === p.iid) out.push(el)
  }
  return [...new Set(out)].filter(el => !el.closest(LOOK))
}

/* where a laid-out drawing stands against what is visible of its own list, and how far that list must move (in the
   SCREEN's pixels, down positive) to bring it wholly on screen — 0 when it already is */
function roomOf(el: HTMLElement): { sc: HTMLElement | null; dy: number } {
  const box = el.getBoundingClientRect()
  const sc = scrollerOf(el)
  const seen = sc ? sc.getBoundingClientRect() : null
  /* the board's own bar stays at the top over whatever scrolls under it: the visible list begins at its foot */
  const bar = document.querySelector('#schedBoard .sb-top')?.getBoundingClientRect()
  const top = Math.max(seen ? seen.top : 0, bar && bar.height > 0 && bar.top <= 1 ? bar.bottom : 0)
  const screenFoot = window.innerHeight || document.documentElement.clientHeight
  let bottom = Math.min(seen ? seen.bottom : Infinity, screenFoot)
  /* a window standing on the screen's foot over the box's column hides the list under it: on a phone the changes window
     and the ALL AVAIL window are bottom panels (D997), and a box brought up "clear of the foot" landed under the changes
     window's own foot (chat 63's walk, W9b, 11 Nov 26). There the list's visible foot is the window's top — counted
     only while the room above it still holds the box. "On the foot" allows the panel's own margin (12px measured on a
     phone); a window floating clear of the foot (a desktop's, opened under the bar) is not one. */
  for (const w of document.querySelectorAll('.chgwin, .availwin')) {
    const r = w.getBoundingClientRect()
    if (r.height > 0 && r.bottom >= screenFoot - 40 && r.left < box.right && r.right > box.left && r.top - top > box.height) bottom = Math.min(bottom, r.top)
  }
  return { sc, dy: scrollToShow(box, top, bottom) }
}

/* A CHANGED PERSONAL INPUT UNDER A FOLDED PANEL has no drawn line to land on (Astra 3): open Personal Inputs on the day,
   by the test a tap on a change in the changes window uses (ui/interactions.ts jumpToChange) — an input listed there,
   and for one accepted onto the programme only on a day its programme row does not stand on; never for a leave under
   Unavailable. AND ONLY ON A DAY THE INPUT IS ON (the narrow read, finding 3): a tap already knows that; an Undo or Redo
   can bring the board to a day the input has left (its date moved), and that day's panel opened for nothing. True when
   it opened the panel. */
function unfoldFor(keys: string[], di: number | null): boolean {
  if (di == null || view.PIOPEN.has(di)) return false
  for (const k of keys) {
    const p = iuParts(k)
    if (!p || !p.iid) continue
    const inp: any = inpById(p.iid)
    if (!inp || !inputCoversDate(inp, DATES[di]) || !listedPersonal(inp)) continue
    if (inp.acc !== 'g' || !standsOn(DAYS[di], p.iid, inp)) { view.PIOPEN.add(di); return true }
  }
  return false
}

function land(keys: string[], di: number | null, mayUnfold: boolean): void {
  const root = document.querySelector('.sb-boardwrap')
  if (!root) return
  /* the first change the board draws AND lays out: a box in the page with no size (a folded section's) is passed over
     for the fall-back address the change carries on purpose (the fresh Opus reader, F4) */
  let shown: HTMLElement[] = [], drawn = false
  for (const k of keys) {
    if (isLine(k)) continue
    const all = drawingsOf(root, k, di)
    if (all.length) drawn = true
    shown = all.filter(laidOut)
    if (shown.length) break
  }
  if (!shown.length && mayUnfold && unfoldFor(keys, di)) { notify(); setTimeout(() => land(keys, di, false), 0); return }
  /* the sign-off line and the issues list: the change itself for a step that is only a sign-off, a publish or a hidden
     warning — and the fall-back for one whose own places the board draws NONE of (boardLandKeys); a place that is drawn
     but folded away is still the step's own, and nothing stands in for it */
  if (!shown.length && !drawn) for (const k of keys) { if (isLine(k)) { shown = drawingsOf(root, k, di).filter(laidOut); if (shown.length) break } }
  if (!shown.length) return
  /* in view in ANY of its drawings: the screen stays (D672) */
  const rooms = shown.map(roomOf)
  if (rooms.some(r => !r.dy)) return
  const { sc, dy } = rooms[0]!
  /* inside the board's desktop layout pinched on a phone (D1107 — ui/pinchzoom.ts) a list scrolls in its OWN units while
     every box is measured on the screen: the screen's distance is divided by the list's scale, or the landing falls
     short when pinched small and overshoots when pinched large (Astra 1, the fresh Opus reader F1) */
  const by = sc ? dy / scaleOf(sc) : dy
  const target: any = sc || window
  if (typeof target.scrollBy === 'function') target.scrollBy({ top: by, behavior: 'smooth' })
  else if (sc) sc.scrollTop += by
}

/** bring the first of `keys` the board draws wholly on screen — under the board's bar, above the screen's foot — by the
 *  least movement; nothing moves when it already is, when the board draws none of them, or where nothing is laid out.
 *  `di`: the board's day, for what is found by the day's own data (an input's programme row, a warning's line). */
export function bringBoardChangeOnScreen(keys: string[], di?: number): void {
  if (!keys.length || typeof document === 'undefined') return
  land(keys, di ?? view.SBDAY ?? null, true)
}
