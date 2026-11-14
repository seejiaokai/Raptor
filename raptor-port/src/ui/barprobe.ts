/* THE TOP BAR'S READINGS ON SCREEN — on only with `?barprobe` in the address, off for everyone else (a trial switch, his
   D2025, 13 Nov 26 — [TOPBAR-LOOSE-APPROVALS-QUALS]).
   Why it exists: in Chrome on his iPhone the "142 TALON" bar comes loose for two or three frames on the Approvals and Quals
   pages when a flick reaches the page's foot and the page springs — about 29 points low, the page showing above it (his
   recordings of 12 Nov 26). No PC browser springs a page or folds a toolbar, so what his phone tells the page in those
   frames can only be read off his own screen. This prints, every frame while anything moves, the numbers that tell the
   candidate causes apart (docs/superpowers/specs/2026-11-15-topbar-chrome-trial.md):
     win    the window's height (innerHeight) — moves when Chrome grows or shrinks its toolbars
     vis    the visible screen's height @ its top inside the window (visualViewport height @ offsetTop): @+N = the visible
            screen starts N below the layout's top
     scroll the page's scroll (scrollY) · page  the page's height · past  how far it is sprung past its top (negative) or
            its foot (positive), 0 between
     bar    the top bar's top edge against the visible top: 0 = in place, +N = drawn N below it (his fault's look, the
            page showing above the bar), −N = drawn N above it (partly hidden). Read in the same measure as the bar's own
            box, through the app's fixed mark at the layout's top (ui/kbscroll.ts screenBox): a phone may give boxes from
            the layout's top or from the visible top (his ?kbdebug recordings, 29 Oct 26), and either way this reads true.
            Beside it the raw numbers: the bar's own top and the mark's.
     row    the pinned row's top against the bar's foot, where the page shows one on screen (Quals' headings, the Leave
            War's dates; 0 = in place)
     WORST  the largest bar gap since this page opened, with that frame's numbers on the line under it, and how many frames
            the bar was out of place ("loose")
     RANGE  the extremes since this page opened: the window's lowest and highest height, the visible screen's lowest
            height and its largest pan (@), the furthest sprung past the top, and the furthest past the foot with that
            frame's scroll, page and window — the readings that tell a toolbar's move and a spring apart even when the
            bar never moved. WORST and RANGE clear when the page changes.
   The panel sits in the bottom right corner, above Approvals' slim bar while that shows, so its Back and Close stay clear.
   Nothing here changes what the app does; it only reads. Without the switch nothing is drawn and nothing listens. The
   same pattern as `?swdebug` (ui/swdebug.ts), `?kbdebug` (ui/kbscroll.ts) and `?savefail` (storage/boot.ts, D1666). */
import { screenBox } from './kbscroll'

export const barProbeOn = (search: string): boolean => /[?&]barprobe(=[^&]*)?(&|$)/.test(search)

type Frame = { t: number, win: number, visH: number, visTop: number, scroll: number, page: number, past: number, foot: number,
  bar: number, barRaw: number, mark: number, row: number | null, where: string }
type Range = { winLo: number, winHi: number, visLo: number, pan: number, top: number, foot: Frame }

const r = (n: number) => Math.round(n)
/* the page on screen: its section, and on the Leave War which of its own pages (grid, Approvals, Balances, OIL) */
function whereNow(): string {
  const sec = document.querySelector('#shell > .page.on, #guestApp .page.on')
  const id = sec?.id ?? '-'
  if (id !== 'page-leavewar') return id
  const tab = document.querySelector('#page-leavewar [aria-selected="true"][data-testid^="lw-tab-"], #page-leavewar [aria-selected="true"][data-testid="oil-tracker"]')
  return id + ':' + (tab?.getAttribute('data-testid')?.replace('lw-tab-', '') ?? '?')
}
/* drawn on screen now: inside the page on screen (or outside every page), laid out, and not hidden */
function onScreen(el: HTMLElement): boolean {
  if (el.closest('.page') && !el.closest('.page.on')) return false
  if (typeof el.checkVisibility === 'function' && !el.checkVisibility({ visibilityProperty: true } as CheckVisibilityOptions)) return false
  return el.getClientRects().length > 0
}
/* the pinned row shown under the bar, if the page has one showing now (the browser shows it by its opacity — D1870) */
function pinnedRow(): HTMLElement | null {
  for (const el of document.querySelectorAll<HTMLElement>('[data-testid="qsticky-head"], [data-testid="sticky-head"]')) {
    if (!onScreen(el)) continue
    const cs = getComputedStyle(el)
    if (cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity || '1') > 0.5) return el
  }
  return null
}
function read(t: number): Frame {
  const vv = window.visualViewport
  const visH = vv ? vv.height : window.innerHeight, visTop = vv ? vv.offsetTop : 0
  const se = document.scrollingElement ?? document.documentElement
  const scroll = window.scrollY, page = se.scrollHeight, win = window.innerHeight
  const foot = scroll - (page - win)
  const past = scroll < 0 ? scroll : foot > 0 ? foot : 0
  /* the visible top in the bar's own measure: the fixed mark's top plus the pan */
  const sb = screenBox({ height: visH, offsetTop: visTop })
  const barEl = document.querySelector<HTMLElement>('#shell > .topbar, #guestApp > .topbar')
  const b = barEl?.getBoundingClientRect()
  const bar = b ? b.top - sb.top : 0
  const rowEl = pinnedRow()
  const row = rowEl && b ? rowEl.getBoundingClientRect().top - b.bottom : null
  return { t, win, visH, visTop, scroll, page, past, foot, bar, barRaw: b ? b.top : 0, mark: sb.layTop, row, where: whereNow() }
}
const nums = (f: Frame) => `win ${r(f.win)} vis ${r(f.visH)}@${r(f.visTop)} scroll ${r(f.scroll)} past ${r(f.past)}` + (f.row === null ? '' : ` row ${r(f.row)}`)
/* the panel's foot: above Approvals' slim bar while it shows (its Back and Close), else the corner */
function footClear(): string {
  const slim = document.querySelector<HTMLElement>('[data-testid="appr-slim"]')
  if (!slim || !onScreen(slim)) return '0px'
  const vv = window.visualViewport
  const sb = screenBox({ height: vv ? vv.height : window.innerHeight, offsetTop: vv ? vv.offsetTop : 0 })
  return Math.max(0, r(sb.layTop + sb.layH - slim.getBoundingClientRect().top + 6)) + 'px'
}

export function installBarProbe(search: string = typeof location !== 'undefined' ? location.search : ''): () => void {
  if (!barProbeOn(search)) return () => {}
  const el = document.createElement('div')
  el.setAttribute('aria-hidden', 'true')
  el.dataset.testid = 'barprobe'
  /* pinned to the screen's bottom right corner, clear of the top bar, taking no presses */
  Object.assign(el.style, { position: 'fixed', right: '0', bottom: '0px', zIndex: '2147483647', pointerEvents: 'none', font: '10px/1.3 monospace', color: '#7CFC7C', background: 'rgba(0,0,0,.8)', padding: '2px 4px', whiteSpace: 'pre', maxWidth: '75vw', overflow: 'hidden' })
  document.body.appendChild(el)

  let where = '', t0 = 0, worst: Frame | null = null, range: Range | null = null, loose = 0, raf = 0, until = 0, text = ''
  const frame = () => {
    raf = 0
    const now = performance.now()
    const f = read(now)
    if (f.where !== where) { where = f.where; t0 = now; worst = null; range = null; loose = 0 }
    if (Math.abs(f.bar) >= 0.5) loose++
    if (!worst || Math.abs(f.bar) > Math.abs(worst.bar)) worst = f
    if (!range) range = { winLo: f.win, winHi: f.win, visLo: f.visH, pan: f.visTop, top: Math.min(0, f.scroll), foot: f }
    else {
      range.winLo = Math.min(range.winLo, f.win); range.winHi = Math.max(range.winHi, f.win)
      range.visLo = Math.min(range.visLo, f.visH)
      if (Math.abs(f.visTop) > Math.abs(range.pan)) range.pan = f.visTop
      range.top = Math.min(range.top, f.scroll)
      if (f.foot > range.foot.foot) range.foot = f
    }
    const g = range.foot
    const next = `${f.where}  ${((now - t0) / 1000).toFixed(1)}s\n` +
      `win ${r(f.win)}  vis ${r(f.visH)} @${r(f.visTop)}\n` +
      `scroll ${r(f.scroll)}  page ${r(f.page)}  past ${r(f.past)}\n` +
      `bar ${r(f.bar)} (top ${r(f.barRaw)} mark ${r(f.mark)})` + (f.row === null ? '' : `  row ${r(f.row)}`) + '\n' +
      `WORST ${r(worst.bar)} at ${((worst.t - t0) / 1000).toFixed(1)}s  loose ${loose}f\n` +
      ` ${nums(worst)}\n` +
      `RANGE win ${r(range.winLo)}-${r(range.winHi)}  vis ${r(range.visLo)}+  @${r(range.pan)}\n` +
      ` top ${r(range.top)}  foot ${r(g.foot)} s${r(g.scroll)} p${r(g.page)} w${r(g.win)}`
    if (next !== text) { text = next; el.textContent = next }
    const bottom = footClear()
    if (el.style.bottom !== bottom) el.style.bottom = bottom
    if (now < until) raf = requestAnimationFrame(frame)
  }
  /* every frame for two seconds after anything moves — long enough for a flick, its spring and the toolbar settling */
  const wake = () => { until = performance.now() + 2000; if (!raf) raf = requestAnimationFrame(frame) }
  const opt: AddEventListenerOptions = { passive: true, capture: true }
  const vv = window.visualViewport
  window.addEventListener('scroll', wake, opt)
  window.addEventListener('resize', wake, opt)
  vv?.addEventListener('resize', wake)
  vv?.addEventListener('scroll', wake)
  /* a press, a touch or a key (a page changed from the keyboard) wakes it too */
  const touch = ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'click', 'keydown'] as const
  for (const ev of touch) document.addEventListener(ev, wake, opt)
  wake()
  return () => {
    window.removeEventListener('scroll', wake, opt)
    window.removeEventListener('resize', wake, opt)
    vv?.removeEventListener('resize', wake)
    vv?.removeEventListener('scroll', wake)
    for (const ev of touch) document.removeEventListener(ev, wake, opt)
    if (raf) cancelAnimationFrame(raf)
    raf = 0
    el.remove()
  }
}
