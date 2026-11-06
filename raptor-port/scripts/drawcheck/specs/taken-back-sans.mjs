// The drawing check's part list for [PO-SANS-PUCK-EDGE] and [NOTICE-UNDO-RETRACT] step 1 (owner D1697, D1698, D1699):
// a man posted out as SANS, his name on the Leave War grid wearing the SANS purple line in place of the "SANS" tag; and the
// other admin's bell after "Undo post out", the posting's line now "Sidewinder · Mon 16 Nov / ~~Posted out · now SANS~~ ·
// taken back · Saber", unread.
// Drawn on 5 Nov 26 (claude/postout-bell-look at e4779887e — nothing in src changed; the tag hidden and the puck given the
// schedule's own .san class; the bell line CLONED from the bell's own markup, its words struck by an <s>) by
// docs/mock/2026-11-05-taken-back-sans/draw.mjs:
//   2-sans-proposed-desk / -phone          Sidewinder's row (the phone: its frozen copy), his puck with the purple line
//   8-hex-bell-struck-desk-close / -phone  Hex's bell after Saber's "Undo post out" (B, his pick — D1699)
// The drawing's marks (a pink outline and its "NEW · B" label) are not compared.
// Record the drawings (from raptor-port/; the drawing script writes its own pictures under its img/ — give the approved
// pictures from a copy elsewhere, and put back what it wrote):
//   WALK_DIR=<drawing's dist> DRAWCHECK_SPEC=scripts/drawcheck/specs/taken-back-sans.mjs DRAWCHECK_DIST=<drawing's dist> \
//     DRAWCHECK_ORIGIN=http://localhost:4392 DRAWCHECK_APPROVED=<copy of …/img> \
//     DRAWCHECK_DRAWN_ON='claude/postout-bell-look at e4779887e' node --import ./scripts/drawcheck/record.mjs \
//     docs/mock/2026-11-05-taken-back-sans/draw.mjs
// Check a build:  node scripts/drawcheck/check.mjs scripts/drawcheck/specs/taken-back-sans.mjs --dist dist --out <folder>
import { fileURLToPath } from 'node:url'

const QUIET = '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important}'
const ISO = '2026-11-16'
const RUN_AT = new Date('2026-11-16T08:00:00')
const MAN = 'mamba'   // Sidewinder — the man the drawing posted out as SANS (its longest callsign of the pool)
const sleep = ms => new Promise(r => setTimeout(r, ms))
const sheet = '.bidsheet[role="dialog"]'

async function signIn(page, user = 'ad', pass = 'a') {
  await page.waitForSelector('#luser')
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await sleep(1000)
  await page.addStyleTag({ content: QUIET }).catch(() => {})
}
/* the app keeps no sign-in across a reload: a reload is the way to the sign-in card, as the drawing's fresh contexts were */
async function again(page, user, pass) { await page.reload(); await signIn(page, user, pass) }
const go = async (page, p) => { await page.evaluate(p => window.go(p), p); await page.waitForFunction(p => window.CURPAGE === p, p); await sleep(500) }
async function press(page, tap, sel) {
  const l = page.locator(sel).filter({ visible: true }).last()
  if (!(await l.count())) throw new Error('nothing to press — ' + sel)
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (tap) await l.tap(); else await l.click()
  await sleep(tap ? 650 : 300)
}
async function lwOpen(page) {
  await go(page, 'leavewar')
  await page.waitForSelector('[data-testid^="row-"]', { timeout: 20000 }); await sleep(500)
  const m = page.locator('[data-testid="month-NOV"]:visible').first()
  if (await m.count()) { await m.click(); await sleep(900) }
}
async function tapCell(page, tap, id, iso = ISO) {
  const c = page.locator(`[data-testid="cell-${id}-${iso}"]`).first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  const b = await c.boundingBox()
  if (tap) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  await sleep(700)
}
async function closeSheets(page) {
  for (let i = 0; i < 4; i++) { const x = page.locator(`${sheet} button.x:visible`).last(); if (!(await x.count())) break; await x.click().catch(() => {}); await sleep(350) }
}
async function openBell(page, tap) {
  const b = page.locator('.bellbtn').filter({ visible: true }).first()
  if (tap) await b.tap(); else await b.click()
  await page.waitForSelector('[data-testid="bell-list"]'); await sleep(400)
}
/* the drawing's own way there (draw.mjs, A and B): today Hex made an admin on Admin → Users and Sidewinder posted out as
   SANS from Mon 16 Nov on the one-day sheet; then the clock moved to 08:00 that day and the app opened again */
async function reachRun(page, phone, origin) {
  const tap = !!phone
  await page.goto(origin + '/')
  await signIn(page)
  await go(page, 'admin')
  const users = page.locator('.adm-cat').filter({ hasText: 'Users' }).first()
  if (await users.count()) { if (tap) await users.tap(); else await users.click(); await sleep(600) }
  await press(page, tap, '#page-admin .acc-row[data-person="rocky"] .acc-tap')
  await page.selectOption('#accEdRole', 'admin'); await sleep(200)
  await press(page, tap, '#accEdSave').catch(() => closeSheets(page))
  await lwOpen(page)
  await tapCell(page, tap, MAN)
  await press(page, tap, `${sheet} [data-testid="bid-more"]`)
  await press(page, tap, '[data-testid="bid-postout"]')
  await press(page, tap, `${sheet} [data-testid="po-sans"]`)
  await press(page, tap, `${sheet} [data-testid="po-confirm"]`)
  await sleep(600); await closeSheets(page)
  /* …and Warden (nact) posted out with no chip ("off the manpower"), as the drawing did: his line is the bell's second */
  await tapCell(page, tap, 'nact')
  await press(page, tap, `${sheet} [data-testid="bid-more"]`)
  await press(page, tap, '[data-testid="bid-postout"]')
  await press(page, tap, `${sheet} [data-testid="po-overseas"]`)   // the lit default, off
  await press(page, tap, `${sheet} [data-testid="po-confirm"]`)
  await sleep(600); await closeSheets(page)
  await page.clock.install({ time: RUN_AT })
  await again(page)
}
async function reachSans(page, { phone, origin }) {
  await reachRun(page, phone, origin)
  await lwOpen(page)
  await page.locator(`[data-testid="cell-${MAN}-${ISO}"]`).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await sleep(500)
  if (!(await page.locator(`[data-testid="row-${MAN}"] .puck.san`).count())) return 'his puck wears no .san'
}
/* …then Hex reads his bell, Saber presses "Undo post out (PO)" on the posting's sheet, and Hex opens his bell again */
async function reachBell(page, { phone, origin }) {
  const tap = !!phone
  await reachRun(page, phone, origin)
  await again(page, 'hex', 'x')
  await openBell(page, tap)
  await press(page, tap, '[data-testid="bell-markall"]')
  await again(page)
  await lwOpen(page)
  await tapCell(page, tap, MAN)
  if (!(await page.locator('[data-testid="postout-undo"]:visible').count())) {
    await press(page, tap, `${sheet} [data-testid="bid-more"]`)
    await press(page, tap, '[data-testid="bid-postout"]')
  }
  await press(page, tap, '[data-testid="postout-undo"]')
  await sleep(500); await closeSheets(page)
  await again(page, 'hex', 'x')
  await openBell(page, tap)
  if (!(await page.locator('[data-testid="bell-list"] .bl-what s').count())) return 'no struck words in his bell'
}

const P = (name, label, draw, build, check, more = {}) => ({ name, label, draw, build, check, ...more })
const sansParts = sel => [
  P('puck', "Sidewinder's name puck", sel, sel, ['place', 'size', 'corners']),
  P('name', 'his callsign', `${sel} .nm`, `${sel} .nm`, ['place', 'words-x', 'colour', 'letters', 'text'], { rel: 'puck' }),
  P('chip', 'his CAT chip', `${sel} .role`, `${sel} .role`, ['place', 'size', 'fill'], { rel: 'puck' }),
]
const L = '[data-testid="bell-list"]'
const line = n => `${L} .bl-scroll > .bl-line:nth-child(${n})`
const bellParts = [
  P('list', 'the bell list', L, L, ['place', 'size', 'fill', 'corners']),
  P('line-1', 'the taken-back line', line(1), line(1), ['place', 'size'], { rel: 'list' }),
  P('name-1', 'its man, in bold', `${line(1)} .bl-name`, `${line(1)} .bl-name`, ['place', 'words-x', 'colour', 'letters', 'text'], { rel: 'line-1' }),
  P('day-1', 'its date', `${line(1)} .bl-day`, `${line(1)} .bl-day`, ['place', 'colour', 'letters', 'text'], { rel: 'line-1' }),
  P('what-1', 'its words, struck and after', `${line(1)} .bl-what`, `${line(1)} .bl-what`, ['place', 'colour', 'letters', 'text'], { rel: 'line-1' }),
  P('struck-1', 'the struck words', `${line(1)} .bl-what s`, `${line(1)} .bl-what s`, ['place', 'words-x', 'colour', 'text'], { rel: 'line-1' }),
  P('dot-1', 'its unread dot', `${line(1)} .bl-dot`, `${line(1)} .bl-dot`, ['place', 'size', 'fill'], { rel: 'line-1' }),
  P('line-2', "Warden's line (read, not undone)", line(2), line(2), ['place', 'size'], { rel: 'list' }),
]
const DRAW = 'docs/mock/2026-11-05-taken-back-sans/draw.mjs'

export default {
  name: 'The SANS purple line on a posted-out man, and the taken-back bell line',
  slug: 'taken-back-sans',
  origin: 'http://localhost:4392',
  timezone: 'Asia/Singapore',
  records: fileURLToPath(new URL('../../../docs/mock/2026-11-05-taken-back-sans/drawcheck/', import.meta.url)),
  states: [
    { id: 'sans-desk', title: "Sidewinder's name on the grid, posted out as SANS, desktop", drawing: { script: DRAW, shot: '2-sans-proposed-desk' }, reach: reachSans, parts: sansParts(`[data-testid="row-${MAN}"] .who .puck`) },
    { id: 'sans-phone', title: "Sidewinder's name in the phone's frozen column, iPhone (WebKit)", phone: true, engine: 'webkit', drawing: { script: DRAW, shot: '2-sans-proposed-phone' }, reach: reachSans, parts: sansParts(`tr[data-band-id="${MAN}"] .who .puck`) },
    { id: 'bell-desk', title: "Hex's bell after Saber's Undo post out, desktop", drawing: { script: DRAW, shot: '8-hex-bell-struck-desk-close' }, reach: reachBell, parts: bellParts },
    { id: 'bell-phone', title: "Hex's bell after Saber's Undo post out, iPhone (WebKit)", phone: true, engine: 'webkit', drawing: { script: DRAW, shot: '8-hex-bell-struck-phone-close' }, reach: reachBell, parts: bellParts },
  ],
  accepted: [
    { state: 'bell-desk', part: 'list', check: 'height', why: 'the drawing state: its cloned unread line never raised the list’s own "Mark all read" foot, which the built list draws under an unread line (as kept for the posting line, postout-bell.mjs)' },
    { state: 'bell-phone', part: 'list', check: 'height', why: 'the drawing state: its cloned unread line never raised the list’s own "Mark all read" foot, which the built list draws under an unread line (as kept for the posting line, postout-bell.mjs)' },
  ],
}
