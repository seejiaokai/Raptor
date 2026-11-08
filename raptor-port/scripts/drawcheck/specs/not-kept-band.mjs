// The drawing check's part list for the "Not kept" band (owner D1901, answering D1660, 8 Nov 26): a browser that keeps
// nothing shows a band under the top bar — the drawn warning sign, "Not kept" in bold amber, "this browser loses your
// work on a reload" quieter, and no Retry (nothing failed, so nothing to retry). Option A of chat 20's questions.
// Drawn by chat 20 on the app at fb5d18c21, by scripts/handpass/trk-chat20-questions.mjs: the existing "Not saved" band
// (`.topbar > .savestat.failed`, raised by a refused save) with its words swapped (applyA) and Retry hidden →
// q2-d-es-A.png (his PC's 1536, Chromium, dpr 2) and q2-p-es-A.png (his iPhone's 402 × 874, WebKit, touch, dpr 2),
// Edit Schedule's top with the band. The drawing wears a dashed orange outline mark on the band — an outline only, it
// takes no room and changes no measure.
// Built as its own band, `.topbar > .savestat.nokeep` (ui/SaveStatus.tsx), shown when the browser's storage cannot even
// be read; the build is reached that way — the page's localStorage throws on access, as in a locked-down browser.
// Record the drawings (from a checkout of fb5d18c21, built, so the drawing script's own pictures land there and not in
// this repo; give the approved pictures from a copy elsewhere):
//   WALK_DIR=dist DRAWCHECK_SPEC=<this repo>/raptor-port/scripts/drawcheck/specs/not-kept-band.mjs \
//     DRAWCHECK_APPROVED=<copy of docs/img/handpass/2026-11-08-chat20-tracker/questions> \
//     DRAWCHECK_DRAWN_ON='fb5d18c21 (chat 20)' \
//     node --import <this repo>/raptor-port/scripts/drawcheck/record.mjs scripts/handpass/trk-chat20-questions.mjs
// Check a build:  node scripts/drawcheck/check.mjs scripts/drawcheck/specs/not-kept-band.mjs --dist dist --out <folder>
// No Retry part: the drawing hid it and the build has none — instead the build's way there fails (the check RED, "not
// checked") if any button shows inside the band.
import { fileURLToPath } from 'node:url'

const QUIET = '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}'
// the drawing's clock (trk-chat20-questions.mjs CLOCK), so the same week is open
const CLOCK = '2026-11-08T09:00:00+08:00'
// a browser whose storage cannot even be touched — the drawing script's own LOCK_INIT
const LOCK = () => { Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('denied', 'SecurityError') } }) }
const N = '.topbar > .savestat.nokeep'

async function reachBand(page, { origin }) {
  await page.clock.install({ time: new Date(CLOCK) })
  await page.addInitScript(LOCK)
  await page.goto(origin + '/')
  await page.addStyleTag({ content: QUIET }).catch(() => {})
  const premise = await page.evaluate(() => { try { void window.localStorage; return 'readable' } catch (e) { return 'throws ' + e.name } })
  if (!/throws/.test(premise)) return 'premise: the page could still read its storage'
  await page.waitForSelector('#luser')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }).catch(() => {})
  await page.waitForTimeout(600)
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(1500)
  try { await page.locator(N).first().waitFor({ state: 'visible', timeout: 8000 }) } catch { return 'the "Not kept" band did not show in Edit Schedule\'s top bar with storage locked' }
  // the drawing hid Retry: the build must show no button at all in the band
  const buttons = await page.evaluate(sel => [...document.querySelectorAll(sel + ' button')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0 }).map(b => b.textContent.trim()), N)
  if (buttons.length) return `a button shows in the "Not kept" band (${buttons.join(', ')}); the drawing has none`
}

const P = (name, label, draw, build, check, more = {}) => ({ name, label, draw, build, check, ...more })
const LOOK = ['fill', 'edge', 'corners', 'shadow']
const D = '.topbar > .savestat.failed'
const parts = [
  P('bar', 'the top bar, the band its last line', '.topbar', '.topbar', ['place', 'size', 'edge']),
  P('band', 'the band', D, N, ['place', 'size', ...LOOK], { rel: 'bar' }),
  P('sign', 'its warning sign', `${D} .sv-sign`, `${N} .sv-sign`, ['place', 'size', 'fill'], { rel: 'band' }),
  P('lead', '"Not kept"', `${D} .sv-msg b`, `${N} .sv-msg b`, ['place', 'words-place', 'colour', 'letters', 'text'], { rel: 'band' }),
  P('rest', '"this browser loses your work on a reload"', `${D} .sv-msg .sv-rest`, `${N} .sv-msg .sv-rest`, ['place', 'words-place', 'colour', 'letters', 'text'], { rel: 'band' }),
]

export default {
  name: 'The "Not kept" band',
  slug: 'not-kept-band',
  origin: 'http://localhost:4433',
  records: fileURLToPath(new URL('../../../docs/mock/2026-11-08-not-kept-band/drawcheck/', import.meta.url)),
  states: [
    {
      id: 'nokeep-desk', title: 'The "Not kept" band on Edit Schedule, desktop, admin',
      drawing: { script: 'scripts/handpass/trk-chat20-questions.mjs', shot: 'q2-d-es-A' },
      reach: reachBand, parts,
    },
    {
      id: 'nokeep-phone', title: 'The "Not kept" band on Edit Schedule, iPhone (WebKit), admin', phone: true, engine: 'webkit',
      drawing: { script: 'scripts/handpass/trk-chat20-questions.mjs', shot: 'q2-p-es-A' },
      reach: reachBand, parts,
    },
  ],
  accepted: [],
}
