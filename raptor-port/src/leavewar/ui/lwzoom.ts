/* THE LEAVE WAR'S ZOOM LIMITS — one place for the grid and the OIL tab (owner D1282–D1285, 23 Oct 26 —
   `[LW-PHONE-PINCH-ZOOM]`).

   In: no further than 1.4 of normal, the old + button's last step (D1284) — the names column grows with the zoom, so
   past it the days left beside the names are too few to be any use on a phone.
   Out: until a whole month fits across a phone HELD UPRIGHT (D1283) — about 0.4 on his iPhone's 402 wide, about 30 days
   and 51 people; the same limit when the phone is turned sideways (then about two and a half months show). The year
   is too wide for the Scheduler Board's and Quals' "until the whole width fits". On a desktop Ctrl+scroll keeps the
   same limits (the reading told to him with D1283), so the width it is worked out for is his iPhone's.

   Worked out from the grid as it is drawn: the names and LVE columns and the average day column, each divided back
   to normal size by the zoom they are drawn at. */

export const LW_ZOOM_MAX = 1.4
/** the floor where nothing can be measured yet (jsdom, a grid not laid out) — about his iPhone's figure */
export const LW_ZOOM_MIN_FALLBACK = 0.4
/** his iPhone's width held upright, for a desktop (no phone to hold) */
const UPRIGHT_PX = 402
/** a month at its longest */
const MONTH_DAYS = 31

const coarse = () => typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches

/** The width a phone held upright gives the grid: the screen's short side, less what the page around the grid takes
 *  (its margins) — measured now, whichever way the phone is held. */
function uprightWidth(wrap: HTMLElement | null): number {
  const gutter = wrap ? Math.max(0, window.innerWidth - wrap.clientWidth) : 0
  const side = coarse() && window.screen ? Math.min(window.screen.width, window.screen.height) : UPRIGHT_PX
  return Math.max(200, side - gutter)
}

/** The smallest zoom: the grid's names, its LVE column and 31 days across a phone held upright. */
export function lwMonthFitZoom(head: HTMLElement | null, wrap: HTMLElement | null, zoom: number): number {
  if (!head || !zoom) return LW_ZOOM_MIN_FALLBACK
  const row = head.querySelector('tr:last-child') ?? head
  const who = row.querySelector('th.who') as HTMLElement | null
  const bal = row.querySelector('th.bal') as HTMLElement | null
  const days = [...row.querySelectorAll<HTMLElement>('th[data-testid^="head-"], th.day')]
  const ws = days.map(d => d.getBoundingClientRect().width).filter(w => w > 0)
  const names = ((who?.getBoundingClientRect().width ?? 0) + (bal?.getBoundingClientRect().width ?? 0)) / zoom
  if (!ws.length || !names) return LW_ZOOM_MIN_FALLBACK
  const day = ws.reduce((a, b) => a + b, 0) / ws.length / zoom
  const z = uprightWidth(wrap) / (names + MONTH_DAYS * day)
  return Math.min(1, Math.max(0.2, z))
}

/** A zoom as it is kept: three places (the grid's measured widths are cached by war and zoom). */
export const roundZoom = (z: number) => Math.round(z * 1000) / 1000
