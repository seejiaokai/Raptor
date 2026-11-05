// The drawing check's part list for the "Not saved" band, look 1 "the strip" (owner D1655, 5 Nov 26): a drawn warning
// sign, "Not saved" in bold amber and "keep this page open" quieter, read from the left; Retry a solid amber button at
// the right; the amber wash across the band; its height, place and amber line as before (D587, D841).
// Drawn on the night of 5 Nov 26 (claude/keyboard-windows-batch-5eff45) on a frozen build whose save-status files are as
// on main at 42df6337b, by scripts/handpass/sb1105-mock.mjs → look1-phone.png (his iPhone's 402 × 874, WebKit) and
// look1-desk.png (his PC's 1536, Chromium), Edit Schedule's top bar with the band made real.
// Record the drawings (from raptor-port/; the drawing script writes its own pictures under docs/mock/…/img — give the
// approved pictures from a copy elsewhere, and remove what it wrote):
//   WALK_DIR=<drawing's dist> MG_OUT=<scratch> DRAWCHECK_SPEC=scripts/drawcheck/specs/save-band.mjs \
//     DRAWCHECK_DIST=<drawing's dist> DRAWCHECK_ORIGIN=http://localhost:4251 DRAWCHECK_APPROVED=<copy of …/img> \
//     DRAWCHECK_DRAWN_ON='main at 42df6337b' node --import ./scripts/drawcheck/record.mjs scripts/handpass/sb1105-mock.mjs
// Check a build:  node scripts/drawcheck/check.mjs scripts/drawcheck/specs/save-band.mjs --dist dist --out <folder>
import { fileURLToPath } from 'node:url'

const QUIET = '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}'
// the browser refusing to save — the same wrapper as the drawing's (aw1105-lib.mjs COUNTER, e2e/save-note.spec.ts): what
// a full disk does
const REFUSER = () => {
  const w = window
  if (w.__lsWrap) return
  w.__lsWrap = true; w.__lsRefuse = false
  const set = Storage.prototype.setItem, rem = Storage.prototype.removeItem
  Storage.prototype.setItem = function (k, v) { if (w.__lsRefuse) throw new DOMException('The quota has been exceeded (walk: forced)', 'QuotaExceededError'); return set.call(this, k, v) }
  Storage.prototype.removeItem = function (k) { if (w.__lsRefuse) throw new DOMException('The quota has been exceeded (walk: forced)', 'QuotaExceededError'); return rem.call(this, k) }
}
// the drawing's own way there (sb1105-mock.mjs): the admin signs in, opens Admin → Users, the browser refuses to save,
// the guest switch is changed, then Edit Schedule is opened with the band up
async function reachBand(page, { origin }) {
  await page.addInitScript(REFUSER)
  await page.goto(origin + '/')
  await page.addStyleTag({ content: QUIET }).catch(() => {})
  await page.waitForSelector('#luser')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]'); await page.waitForTimeout(900)
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  await page.locator('.adm-cat').filter({ hasText: 'Users' }).first().click(); await page.waitForTimeout(400)
  await page.evaluate(() => { window.__lsRefuse = true })
  await page.locator('#admGuestView').click(); await page.waitForTimeout(1500)
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(1200)
  if (!(await page.locator('.topbar > .savestat.failed').isVisible().catch(() => false))) return 'the "Not saved" band did not show in Edit Schedule\'s top bar after a refused save'
}

const P = (name, label, draw, build, check, more = {}) => ({ name, label, draw, build, check, ...more })
const LOOK = ['fill', 'edge', 'corners', 'shadow']
const B = '.topbar > .savestat.failed'
const parts = [
  P('bar', 'the top bar, the band its last line', '.topbar', '.topbar', ['place', 'size', 'edge']),
  P('band', 'the band', B, B, ['place', 'size', ...LOOK], { rel: 'bar' }),
  P('sign', 'its warning sign', `${B} .sv-sign`, `${B} .sv-sign`, ['place', 'size', 'fill'], { rel: 'band' }),
  P('not-saved', '"Not saved"', `${B} .sv-msg b`, `${B} .sv-msg b`, ['place', 'words-place', 'colour', 'letters', 'text'], { rel: 'band' }),
  P('keep-open', '"keep this page open"', `${B} .sv-msg > span:last-child`, `${B} .sv-msg .sv-rest`, ['place', 'words-place', 'colour', 'letters', 'text'], { rel: 'band' }),
  P('retry', 'Retry', `${B} > button`, `${B} > button`, ['place', 'size', ...LOOK, 'colour', 'letters', 'text'], { rel: 'band' }),
]

export default {
  name: 'The "Not saved" band — the strip',
  slug: 'save-band',
  origin: 'http://localhost:4251',
  records: fileURLToPath(new URL('../../../docs/mock/2026-11-05-save-band/drawcheck/', import.meta.url)),
  states: [
    {
      id: 'strip-phone', title: 'The band on Edit Schedule, iPhone (WebKit), admin', phone: true, engine: 'webkit',
      drawing: { script: 'scripts/handpass/sb1105-mock.mjs', shot: 'look1-phone' },
      reach: reachBand, parts,
    },
    {
      id: 'strip-desk', title: 'The band on Edit Schedule, desktop, admin',
      drawing: { script: 'scripts/handpass/sb1105-mock.mjs', shot: 'look1-desk' },
      reach: reachBand, parts,
    },
  ],
  accepted: [],
}
