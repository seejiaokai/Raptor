// The drawing check's part list for [INP-CARD-COLUMNS] (owner D1305, D1310 — "q5 A", 24 Oct 26): on the Inputs list's
// cards the top line's right end is three columns — LATE (or OIL?), the document, the hours or "till <date>" — each in
// the same place on every card, an empty column keeping its room; no card grows taller.
// Drawn on 24 Oct 26 (claude/lw-m3-placing-leave at 7a661b29c — nothing in src changed; look A's stylesheet laid over
// the real list) by scripts/handpass/inp-card-columns-look.mjs:
//   a        the list on a phone, all dates (his iPhone's 402 × 874, Chromium), look A
//   a-wide   the same with the card's letters 1.14× (the drawing's stand-in for an iPhone's wider letters)
// The drawing's label (the cyan box at the foot) is not compared. The first seven cards are named: Drifter OL (LATE),
// Static ATT C, Static OML, Static UPCHIT (no LATE: an empty column), Gambit LL, Hunter OIL (LATE), Rune CSE (LATE, no
// document mark — a course carries none — and "till 13 Jan"). The demo's ids are minted afresh at every start, so a
// card is named by its place in the list, the same seven in both worlds (the probe, scripts/handpass/inp1106-probe.mjs).
// Record the drawings (from raptor-port/; the drawing script writes its pictures over the approved ones — record with
// a copy of the approved pictures elsewhere, then put the committed ones back with git):
//   DRAWCHECK_SPEC=scripts/drawcheck/specs/inp-card-columns.mjs DRAWCHECK_DIST=<7a661b29c's dist> \
//     DRAWCHECK_ORIGIN=http://localhost:4311 DRAWCHECK_APPROVED=<copy of docs/img/handpass/2026-10-24-inp-card-columns> \
//     DRAWCHECK_DRAWN_ON='claude/lw-m3-placing-leave at 7a661b29c' node --import ./scripts/drawcheck/record.mjs \
//     scripts/handpass/inp-card-columns-look.mjs
// Check a build:  node scripts/drawcheck/check.mjs scripts/drawcheck/specs/inp-card-columns.mjs --dist dist --out <folder>
import { fileURLToPath } from 'node:url'

const QUIET = '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}'
// the drawing's own stand-in for an iPhone's wider letters (inp-card-columns-look.mjs `wide`), laid over the build too
const WIDE = '#inList .icard { font-size: 114% } #inList .icard-hrs, #inList .icard-nodoc, #inList .sd-late, #inList .icard-who, #inList .icard-kind { font-size: 1.14em !important }'

/* the drawing's own way there: a fresh demo world, the admin, the Inputs page's List, all dates */
const reachList = wide => async (page, { origin }) => {
  await page.goto(origin + '/?fresh=1')
  await page.waitForSelector('#luser')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); await page.waitForTimeout(800)
  await page.addStyleTag({ content: QUIET }).catch(() => {})
  await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(700)
  await page.click('#inListBtn'); await page.waitForTimeout(400)
  await page.click('#inRangeBtn'); await page.waitForTimeout(300); await page.click('#inRangeAll'); await page.waitForTimeout(700)
  if (wide) await page.addStyleTag({ content: WIDE })
  await page.waitForTimeout(200)
  if (!(await page.locator('#inList .icard').count())) return 'the List drew no cards'
}

const P = (name, label, draw, build, check, more = {}) => ({ name, label, draw, build, check, ...more })
const C = '#inList .icard'
const nth = (sel, n) => ({ sel, nth: n })
const WHO = ['Drifter OL', 'Static ATT C', 'Static OML', 'Static UPCHIT', 'Gambit LL', 'Hunter OIL', 'Rune CSE']
const LATE = [0, 4, 5, 6]          // the cards that wear LATE, in order
const NODOC = [0, 1, 2, 3, 4, 5]   // the cards that say "No document"
const parts = [
  P('list', 'the list', '#inList', '#inList', ['place']),
  ...WHO.flatMap((w, k) => [
    P(`card-${k}`, `${w}'s card`, nth(C, k), nth(C, k), ['place', 'size'], { rel: 'list' }),
    P(`hrs-${k}`, `${w}: the hours`, nth(`${C} .icard-hrs`, k), nth(`${C} .icard-hrs`, k), ['place', 'words-place', 'text'], { rel: `card-${k}` }),
  ]),
  ...LATE.map((k, i) => P(`late-${k}`, `${WHO[k]}: LATE`, nth(`${C} .sd-late`, i), nth(`${C} .sd-late`, i), ['place', 'size', 'text'], { rel: `card-${k}` })),
  ...NODOC.map((k, i) => P(`nodoc-${k}`, `${WHO[k]}: "No document"`, nth(`${C} .icard-nodoc`, i), nth(`${C} .icard-nodoc`, i), ['place', 'words-place', 'text'], { rel: `card-${k}` })),
]
const DRAW = 'scripts/handpass/inp-card-columns-look.mjs'

export default {
  name: "The Inputs list's cards — three columns at the top line's right end",
  slug: 'inp-card-columns',
  origin: 'http://localhost:4311',
  timezone: 'Asia/Singapore',
  records: fileURLToPath(new URL('../../../docs/mock/2026-10-24-inp-card-columns/drawcheck/', import.meta.url)),
  states: [
    { id: 'a', title: "The Inputs list on a phone, all dates — look A", phone: true, drawing: { script: DRAW, shot: 'a' }, reach: reachList(false), parts },
    { id: 'a-wide', title: "The same with the drawing's wider letters (1.14×)", phone: true, drawing: { script: DRAW, shot: 'a-wide' }, reach: reachList(true), parts },
  ],
  accepted: [],
}
