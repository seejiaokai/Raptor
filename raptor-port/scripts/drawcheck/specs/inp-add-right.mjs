// The drawing check's part list for the Inputs page's group of the pictures round (owner D1787 and D1792 (b), 8 Nov 26):
// "+ Input" at the right end of the desktop list's row, the list making room for its window, and the Inputs calendar's
// expand button drawn as arrows out / arrows in. The approved drawings open the REAL app and draw the answer on the live
// page: scripts/handpass/pr-sched.mjs (q4: `-pc-list-A`, `-pc-listopen-A`; q4f: `-1024-A-safe`, `-821-A-safe`) and
// scripts/handpass/pr-marks.mjs (r5b: `q-r5b-pc|ph-compact|every-drawn`), pictures in
// docs/img/handpass/2026-11-07-pictures-round/. Drawn on a build of ead868ee9 (the Inputs code of this branch's base but
// for three small lines), the clock Mon 13 Jul 26 09:00, desktop 1536 × 864, the smaller desktops 1024 × 768 and 821 × 768,
// phone 402 × 874 (touch), at 2.
// THE RING: the drawings ring the part they are about with `.zz-ring` (an outline and `border-radius:7px`), so a ringed
// part's corners and shadow are the drawing's pointer, never compared.
// Record the drawings (from raptor-port/; the drawing's own pictures to a scratch folder, never the approved one):
//   HP_URL=http://localhost:4291 HP_SHOTS=<scratch> PR_ONLY=q4,q4f DRAWCHECK_ORIGIN=http://localhost:4291 \
//     DRAWCHECK_SPEC=scripts/drawcheck/specs/inp-add-right.mjs DRAWCHECK_DIST=<ead868ee9, built> \
//     DRAWCHECK_APPROVED=docs/img/handpass/2026-11-07-pictures-round DRAWCHECK_DRAWN_ON='ead868ee9' \
//     node --import ./scripts/drawcheck/record.mjs scripts/handpass/pr-sched.mjs
//   (the same with PRM_ONLY=r5b and scripts/handpass/pr-marks.mjs)
// Check a build:  node scripts/drawcheck/check.mjs scripts/drawcheck/specs/inp-add-right.mjs --dist dist --out <folder>
import { fileURLToPath } from 'node:url'

const ORIGIN = 'http://localhost:4291'
const sleep = ms => new Promise(r => setTimeout(r, ms))
// the drawings' world (pr-sched.mjs and pr-marks.mjs world()): their clock, signed in as the admin, toasts hidden
async function start(page, origin) {
  await page.clock.install({ time: new Date('2026-07-13T09:00:00+08:00') })
  await page.goto(origin + '/')
  await page.waitForSelector('#luser')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(500)
  await page.addStyleTag({ content: '.toast,.snack{display:none!important} *{scroll-behavior:auto!important}' })
}
const settle = page => page.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur() })
const visible = (page, sel) => page.evaluate(sel => [...document.querySelectorAll(sel)].some(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }), sel)
// pr-sched.mjs openInputsList(): the Inputs page, its List
async function list(page, { origin }) {
  await start(page, origin)
  await page.evaluate(() => window.go('inputs')); await sleep(900)
  if (!(await visible(page, '[data-testid="in-new"]')) && await visible(page, '#inListBtn')) { await page.locator('#inListBtn').first().click(); await sleep(600) }
  if (!(await visible(page, '[data-testid="in-new"]'))) return 'the Inputs List with its "+ Input" is not on screen'
  await settle(page)
}
const reach = {
  list,
  async open(page, o) {
    const no = await list(page, o); if (no) return no
    await page.locator('#inNew').click(); await sleep(900); await settle(page)
    if (!(await visible(page, '[data-testid="win-inputedit"]'))) return "the input's window did not open"
  },
  async compact(page, { origin, phone }) {
    await start(page, origin); await page.evaluate(() => window.go('inputs')); await sleep(900)
    const B = '[data-testid=ib-expand]'
    if (!(await visible(page, B))) return 'no expand button on the Inputs calendar'
    if (await page.locator(B).getAttribute('aria-pressed') === 'true') { const l = page.locator(B); if (phone) await l.tap(); else await l.click(); await sleep(600) }
    await settle(page)
  },
  async every(page, o) {
    const no = await reach.compact(page, o); if (no) return no
    const l = page.locator('[data-testid=ib-expand]'); if (o.phone) await l.tap(); else await l.click(); await sleep(600); await settle(page)
  },
}

// ---------------------------------------------------------------- the parts
const P = (name, label, draw, build, check, more = {}) => ({ name, label, draw, build, check, ...more })
const RINGED = ['place', 'size', 'fill', 'edge', 'colour']
const th = n => `#intbl thead th:nth-child(${n})`
const cols = [P('name', 'the Name column', th(1), th(1), ['width']), P('start', 'the Start column', th(2), th(2), ['width']),
  P('end', 'the End column', th(3), th(3), ['width']), P('type', 'the Type column', th(4), th(4), ['width']),
  P('remarks', 'the Remarks column', th(5), th(5), ['width'])]
const row = (ringed) => [
  P('inNew', '"+ Input"', '#inNew', '#inNew', ringed ? RINGED : ['place', 'size']),
  P('range', 'the dates button', '#inRangeBtn', '#inRangeBtn', ['place', 'size']),
  P('table', 'the list', '#intbl', '#intbl', ['place', 'width']),
]
const mark = (shot, id, title, how, phone) => ({ id, title, ...(phone ? { phone: true } : {}), drawing: { script: 'scripts/handpass/pr-marks.mjs', shot }, reach: how,
  parts: [P('expand', 'the expand button', '[data-testid=ib-expand]', '[data-testid=ib-expand]', RINGED),
    P('expand-mark', 'the expand button: its drawn mark', '[data-testid=ib-expand] svg.zz-ico', '[data-testid=ib-expand] svg.btnglyph', ['place', 'size', 'colour'], { rel: 'expand' })] })
const S = 'scripts/handpass/pr-sched.mjs'

export default {
  name: 'The Inputs page — "+ Input" at the right, the list making room, the calendar\'s drawn expand marks',
  slug: 'inp-add-right',
  origin: ORIGIN,
  timezone: 'Asia/Singapore',
  records: fileURLToPath(new URL('../../../docs/mock/inputs-add-right/drawcheck/', import.meta.url)),
  states: [
    { id: 'list-pc', title: 'The desktop List, "+ Input" at the right (1536)', drawing: { script: S, shot: 'q-addright-pc-list-A' }, reach: reach.list, parts: [...row(true), ...cols] },
    { id: 'listopen-pc', title: 'The desktop List with its window open, the list making room (1536)', drawing: { script: S, shot: 'q-addright-pc-listopen-A' }, reach: reach.open,
      parts: [P('window', "the input's window", '[data-testid="win-inputedit"]', '[data-testid="win-inputedit"]', ['place', 'size']), ...row(false), ...cols] },
    { id: 'safe-1024', title: 'A small laptop, "+ Input" at the right, no room made (1024)', drawing: { script: S, shot: 'q-addright-1024-A-safe' }, reach: reach.list, parts: [...row(true), ...cols] },
    { id: 'safe-821', title: 'The narrowest desktop, "+ Input" at the right, no room made (821)', drawing: { script: S, shot: 'q-addright-821-A-safe' }, reach: reach.list, parts: [...row(true), ...cols] },
    mark('q-r5b-pc-compact-drawn', 'expand-compact-pc', "The Inputs calendar's expand button at rest, arrows out, desktop", reach.compact),
    mark('q-r5b-pc-every-drawn', 'expand-every-pc', "The Inputs calendar's expand button pressed, arrows in, desktop", reach.every),
    mark('q-r5b-ph-compact-drawn', 'expand-compact-ph', "The Inputs calendar's expand button at rest, arrows out, iPhone", reach.compact, true),
    mark('q-r5b-ph-every-drawn', 'expand-every-ph', "The Inputs calendar's expand button pressed, arrows in, iPhone", reach.every, true),
  ],
  // the differences his rulings keep as built — filled after the first run, each with the value the build had
  accepted: [
    { state: 'listopen-pc', part: 'name', check: 'width', build: 110, why: "D1787: while the window is open at 1536 the list narrows Name, Start and End (110 / 140 / 90) — the page's safety for smaller screens, his answer \"All as recommended\"; the drawing kept the full widths" },
    { state: 'listopen-pc', part: 'start', check: 'width', build: 140, why: "D1787: while the window is open at 1536 the list narrows Name, Start and End (110 / 140 / 90) — the page's safety for smaller screens, his answer \"All as recommended\"; the drawing kept the full widths" },
    { state: 'listopen-pc', part: 'end', check: 'width', build: 90, why: "D1787: while the window is open at 1536 the list narrows Name, Start and End (110 / 140 / 90) — the page's safety for smaller screens, his answer \"All as recommended\"; the drawing kept the full widths" },
    { state: 'listopen-pc', part: 'remarks', check: 'width', build: 346, why: "D1787: while the window is open at 1536 the list narrows Name, Start and End (110 / 140 / 90) — the page's safety for smaller screens, his answer \"All as recommended\"; the drawing kept the full widths" },
    { state: 'safe-1024', part: 'name', check: 'width', build: 110, why: "D1787's full row: below about 950 wide the desktop list squeezed Remarks to a letter or two with no window (the older fault, drawn so in the -safe drawings); the same narrowing fixes it, from 821 to 1099 wide" },
    { state: 'safe-1024', part: 'start', check: 'width', build: 140, why: "D1787's full row: below about 950 wide the desktop list squeezed Remarks to a letter or two with no window (the older fault, drawn so in the -safe drawings); the same narrowing fixes it, from 821 to 1099 wide" },
    { state: 'safe-1024', part: 'end', check: 'width', build: 90, why: "D1787's full row: below about 950 wide the desktop list squeezed Remarks to a letter or two with no window (the older fault, drawn so in the -safe drawings); the same narrowing fixes it, from 821 to 1099 wide" },
    { state: 'safe-1024', part: 'type', check: 'width', build: 124, why: "D1840 (8 Nov 26, his \"all as recommended\" to chat 7's look, question 2): from 821 to 1099 wide with no window Type narrows to 124 as well, so Remarks keeps a readable width with every word whole; the drawing kept Type 160" },
    { state: 'safe-1024', part: 'remarks', check: 'width', build: 296, why: "D1840: Type gives up 36 more here. D1787's full row: below about 950 wide the desktop list squeezed Remarks to a letter or two with no window (the older fault, drawn so in the -safe drawings); the same narrowing fixes it, from 821 to 1099 wide" },
    { state: 'safe-821', part: 'table', check: 'width', build: 757, why: "D1787's full row: below about 950 wide the desktop list squeezed Remarks to a letter or two with no window (the older fault, drawn so in the -safe drawings); the same narrowing fixes it, from 821 to 1099 wide; the table is the six fixed columns and Remarks, so it is narrower by the same" },
    { state: 'safe-821', part: 'name', check: 'width', build: 110, why: "D1787's full row: below about 950 wide the desktop list squeezed Remarks to a letter or two with no window (the older fault, drawn so in the -safe drawings); the same narrowing fixes it, from 821 to 1099 wide" },
    { state: 'safe-821', part: 'start', check: 'width', build: 140, why: "D1787's full row: below about 950 wide the desktop list squeezed Remarks to a letter or two with no window (the older fault, drawn so in the -safe drawings); the same narrowing fixes it, from 821 to 1099 wide" },
    { state: 'safe-821', part: 'end', check: 'width', build: 90, why: "D1787's full row: below about 950 wide the desktop list squeezed Remarks to a letter or two with no window (the older fault, drawn so in the -safe drawings); the same narrowing fixes it, from 821 to 1099 wide" },
    { state: 'safe-821', part: 'type', check: 'width', build: 124, why: "D1840 (8 Nov 26, his \"all as recommended\" to chat 7's look, question 2): from 821 to 1099 wide with no window Type narrows to 124 as well, so Remarks keeps a readable width with every word whole; the drawing kept Type 160" },
    { state: 'safe-821', part: 'remarks', check: 'found', why: "D1787's full row: below about 950 wide the desktop list squeezed Remarks to a letter or two with no window (the older fault, drawn so in the -safe drawings); the same narrowing fixes it, from 821 to 1099 wide: the drawing's Remarks had no width at all; built, 57px, then 93px once Type narrowed to 124 on his D1840 (put to him with its picture first)" },
    { state: 'expand-compact-pc', part: 'expand', check: 'edge', why: "not a difference of the build: the drawing (pr-marks.mjs r5b) had just pressed the button and its mouse rested on it, so the drawing shows the hover edge (.abtn:hover, --edge-2); the phone's drawing, with no hover, matches (expand-compact-ph: 0 differ); this change did not touch the button's edge" },
  ],
}
