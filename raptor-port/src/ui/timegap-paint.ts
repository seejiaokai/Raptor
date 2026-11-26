/* [END-TIME-GUARD] — THE OUTLINE ROUND AN EMPTY TIME BOX (his D2853, D2852; the approved try-out
   docs/mock/2026-11-25-endtime-tryout/, `tryout.css` and `board.mjs`'s marks): a thin line drawn inside each empty time
   box the rule names (engine/timegaps.ts) — grey while drafting (`tg-miss`), red once a sign-off box, Publish day or
   Publish AL is pressed and refused (`tg-red`), staying red until the time is typed; the same on a draft and on a
   published day being amended; never on View-only Sched.

   ONE PASS OVER WHAT IS DRAWN, NOT A CLASS IN EACH BUILDER: the week's boxes (ui/html.ts ted()), the board's (board-html.ts
   boxHTML, the two Common Programme inputs and the flying lines' take-off / landing inputs built inline in board.ts — the
   red-team's "never wired" builders) all name a box by the same key, so this pass finds every one by its key, and it runs
   from refreshHighlights, which every surface calls after it draws — the section the caret is in included, whose markup
   the paint holds back (ui/dayswap.ts): attributes only, nothing redrawn.

   ONLY A BOX THAT CAN BE TYPED IN (his D2853: never on View-only Sched; the plan's R5 — a preview cannot be typed in): the
   week's box carries its key only while it can be typed in (ted()'s editable branch); a board box is skipped while
   disabled or read-only, and nothing inside a frozen look (`.pv-frozen`, `.preview`) is marked.

   RED IS KEPT PER BOX (D2853 "staying red until the time is typed"): a refused press marks the boxes missing at that moment,
   for that squadron's date and saved plan (Astra's red-team read, 4: two plans never share a colour); a box leaves the set
   as soon as its time is typed. A box emptied AFTER the refused press is grey until the next refused press — the plan's
   question R3, built on the literal reading until he answers. Held in this browser for the session (ui/pops.ts TIME_RED,
   cleared at sign-out — the plan's R4). */
import { timeGapsOf } from '../engine/timegaps'
import { UNIT } from '../engine/unitview'
import { dayIso } from '../engine/verid'
import { CURWEEK } from '../engine/waves'
import { curDraftId } from '../engine/drafts'
import { setTimeRefusedHook } from '../state/timeguard'
import { TIME_RED } from './pops'

const dayKey = (di: number) => `${UNIT}|${dayIso(String(CURWEEK), di)}|${String(curDraftId(di) ?? '')}`
const TIME_BOX = /^(?:ff|dr|sr|gr|ap):(\d+)\..*\.(?:to|ld|str|end)$/

/** a refused press: the boxes missing on that day now turn red (state/timeguard.ts calls this through its hook) */
export function markRefused(di: number): void {
  const g = timeGapsOf(di)
  if (!g.items) return
  const k = dayKey(di), s = TIME_RED.get(k) || new Set<string>()
  g.boxes.forEach(b => s.add(b))
  TIME_RED.set(k, s)
  paintTimeGaps()
}

const typeable = (el: Element): boolean => {
  if (el.closest('.pv-frozen,.preview')) return false
  if (el.tagName === 'INPUT') return !(el as HTMLInputElement).disabled && !(el as HTMLInputElement).readOnly
  return el.getAttribute('contenteditable') === 'true'
}

export function paintTimeGaps(): void {
  if (typeof document === 'undefined') return
  const memo = new Map<number, { miss: Set<string>; red: Set<string> | undefined }>()
  const day = (di: number) => {
    let x = memo.get(di)
    if (!x) {
      const miss = new Set(timeGapsOf(di).boxes), k = dayKey(di), red = TIME_RED.get(k)
      /* a box whose time is typed leaves red: emptied again later it starts grey */
      if (red) { for (const b of [...red]) if (!miss.has(b)) red.delete(b); if (!red.size) TIME_RED.delete(k) }
      x = { miss, red: TIME_RED.get(k) }
      memo.set(di, x)
    }
    return x
  }
  document.querySelectorAll('#eWeek [data-txt], #schedBoard input[data-bfld]').forEach(el => {
    const key = el.getAttribute('data-txt') || el.getAttribute('data-bfld') || ''
    const m = TIME_BOX.exec(key)
    let miss = false, red = false
    if (m && typeable(el)) { const x = day(+m[1]!); miss = x.miss.has(key); red = miss && !!x.red && x.red.has(key) }
    el.classList.toggle('tg-miss', miss)
    el.classList.toggle('tg-red', red)
  })
}

/** the tests' reset (the session's own is ui/pops.ts POPS_RESET) */
export function resetTimeRed(): void { TIME_RED.clear() }

setTimeRefusedHook((di) => markRefused(di))
