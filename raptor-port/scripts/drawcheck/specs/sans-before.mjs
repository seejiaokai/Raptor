// The drawing check's part list for the SANS calendar's fade of a man's own days before his SANS date (owner D2343, D2346 —
// "A", 23 Nov 26): Hex, posted out as SANS from Fri 17 Jul (saved Wed 15, not yet run), opens Inputs → SANS and his days
// before Fri 17 are faded — the day's colour wash off (the panel's second grey) and its figures dimmed to .38.
// Drawn on 23 Nov 26 (chat 149, claude/allavail-sans-postout-141 at e8ee77d53 — nothing in src changed; ONE class,
// `mk-before`, put on the day cells and a style injected) by docs/mock/2026-11-23-sans-before-shading/draw.mjs:
//   phone-2-proposed-A-faded / desktop-2-proposed-A-faded   look A, the one he chose (D2346)
// The build marks the same days `is-before` (ui/sanscal-model.ts sansBeforeMine); the drawing's class is its own.
// Opacity is not one of the measured looks: the fade of the figures is checked by the whole-picture comparison the
// check writes beside the parts (the build's picture against the drawing's), and by the date's ink staying in place.
// Record the drawing (from raptor-port/; the script writes its pictures beside itself — record from a copy kept under a
// path ending in docs/mock/2026-11-23-sans-before-shading/draw.mjs, its `playwright` import pointed at this checkout):
//   DRAWCHECK_SPEC=scripts/drawcheck/specs/sans-before.mjs DRAWCHECK_DIST=dist DRAWCHECK_ORIGIN=http://localhost:4180 \
//     DRAWCHECK_APPROVED=docs/mock/2026-11-23-sans-before-shading/img DRAWCHECK_DRAWN_ON='claude/allavail-sans-postout-141 at e8ee77d53' \
//     node --import ./scripts/drawcheck/record.mjs <copy>/docs/mock/2026-11-23-sans-before-shading/draw.mjs
// Check a build:  node scripts/drawcheck/check.mjs scripts/drawcheck/specs/sans-before.mjs --dist dist --out <folder>
import { fileURLToPath } from 'node:url'

const SCRIPT = 'docs/mock/2026-11-23-sans-before-shading/draw.mjs'
const HEX = 'rocky', DATE = '2026-07-17', THU = '2026-07-16', MON = '2026-07-13'
const AT = new Date('2026-07-15T09:00:00')
const sleep = ms => new Promise(r => setTimeout(r, ms))

/* the drawing script's own way there (draw.mjs signIn, tap, go, postOutSans, openSans, settle, shot) */
async function signIn(page, origin, user, pass) {
  await page.goto(origin + '/')
  await page.waitForSelector('#luser')
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await sleep(800)
}
async function tap(page, sel, touch) {
  const l = page.locator(sel).first()
  await l.waitFor({ state: 'visible', timeout: 8000 })
  await l.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(200)
  if (touch) await l.tap(); else await l.click()
  await sleep(400)
}
const go = async (page, p) => { await page.evaluate(x => window.go(x), p); await page.waitForFunction(x => window.CURPAGE === x, p); await sleep(500) }
async function reach(page, { origin, phone }) {
  await page.clock.install({ time: AT })
  await signIn(page, origin, 'ad', 'a')
  await go(page, 'leavewar'); await sleep(900)
  if (await page.locator('[data-testid="month-JUL"]:visible').count()) { await tap(page, '[data-testid="month-JUL"]:visible', phone); await sleep(800) }
  await tap(page, `[data-testid="cell-${HEX}-${DATE}"]`, phone)
  await tap(page, '[data-testid="bid-more"]:visible', phone)
  await tap(page, '[data-testid="bid-postout"]:visible', phone)
  await tap(page, '[data-testid="po-sans"]:visible', phone)
  await tap(page, '[data-testid="po-confirm"]:visible', phone); await sleep(900)
  if (await page.evaluate(id => !!window.PEOPLE[id].san, HEX)) return 'the posting ran: it must be a look-ahead'
  /* Hex signs in on the same saved world (the drawing's second context carried the first's storage) */
  await signIn(page, origin, 'hex', 'x')
  await go(page, 'inputs')
  await tap(page, '#inSansMode', phone)
  await page.waitForSelector('[data-testid="sanscal"]'); await sleep(700)
  if (!(await page.locator(`[data-testid="sc-day-${DATE}"]`).count())) return 'July 2026 is not the month shown'
  await page.mouse.move(2, 2); await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur()); await sleep(250)
  const top = await page.locator('[data-testid="sanscal"]').evaluate(e => e.getBoundingClientRect().top + window.scrollY)
  await page.evaluate(y => window.scrollTo(0, Math.max(0, y - 60)), top); await sleep(400)
}
const P = (name, label, draw, build, check, more = {}) => ({ name, label, draw, build, check, ...more })
const day = iso => `[data-testid="sc-day-${iso}"]`
const parts = [
  P('thu', 'Thu 16 Jul, a day before his date (faded)', day(THU), day(THU), ['place', 'size', 'fill', 'edge', 'ring']),
  P('thu-num', 'its date', `${day(THU)} .sc-num`, `${day(THU)} .sc-num`, ['place', 'text', 'words-place', 'colour'], { rel: 'thu' }),
  P('thu-need', 'its still-needed pair', `${day(THU)} .sc-need`, `${day(THU)} .sc-need`, ['place', 'text', 'words-place'], { rel: 'thu' }),
  P('mon', 'Mon 13 Jul (faded)', day(MON), day(MON), ['place', 'fill', 'ring']),
  P('fri', 'Fri 17 Jul, his SANS date (not faded)', day(DATE), day(DATE), ['place', 'size', 'fill', 'edge', 'ring']),
  P('fri-num', 'its date', `${day(DATE)} .sc-num`, `${day(DATE)} .sc-num`, ['place', 'text', 'words-place', 'colour'], { rel: 'fri' }),
]
export default {
  name: "SANS calendar — a man's own days before his SANS date, faded",
  slug: 'sans-before',
  records: fileURLToPath(new URL('../../../docs/mock/2026-11-23-sans-before-shading/drawcheck/', import.meta.url)),
  states: [
    { id: 'a-phone', title: "Hex's SANS calendar, his days before Fri 17 faded — iPhone (WebKit)", phone: true, engine: 'webkit',
      drawing: { script: SCRIPT, shot: 'phone-2-proposed-A-faded' }, reach, parts },
    { id: 'a-desk', title: "Hex's SANS calendar, his days before Fri 17 faded — desktop", drawing: { script: SCRIPT, shot: 'desktop-2-proposed-A-faded' }, reach, parts },
  ],
  accepted: [],
}
