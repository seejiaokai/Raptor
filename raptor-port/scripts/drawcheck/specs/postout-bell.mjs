// The drawing check's part list for the posting-out bell line ([POSTOUT-RUN-NOTICE] — owner D1547, D1690, D1691): the
// admins' bell list with the four lines "Ranger · Mon 16 Nov / Posted out · archived, account suspended" (then Trident ·
// deleted, Cinch · now SANS, Cobra · off the manpower), and a line's landing on Admin → Users, his row ringed.
// Drawn on 5 Nov 26 (claude/postout-bell-look at 890964ac7 — nothing in src changed; the lines CLONED from the bell's own
// markup) by docs/mock/2026-11-05-postout-bell/draw.mjs:
//   2b-bell-manfirst-desk / -phone   the list, option B (the man first — his pick, D1690)
//   3-land-overseas-desk / -phone    Ranger's row in the opened Archived fold, ringed
//   3-land-sans-desk / -phone        Cinch's row on the roster, ringed
// The drawing's lines wear its "NEW · B" marks (a pink outline and label) and its ages read "2 h": neither is compared.
// Record the drawings (from raptor-port/; the drawing script writes its own pictures under its img/ — give the approved
// pictures from a copy elsewhere, and put back what it wrote):
//   WALK_DIR=<drawing's dist> DRAWCHECK_SPEC=scripts/drawcheck/specs/postout-bell.mjs DRAWCHECK_DIST=<drawing's dist> \
//     DRAWCHECK_ORIGIN=http://localhost:4391 DRAWCHECK_APPROVED=<copy of …/img> \
//     DRAWCHECK_DRAWN_ON='claude/postout-bell-look at 890964ac7' node --import ./scripts/drawcheck/record.mjs \
//     docs/mock/2026-11-05-postout-bell/draw.mjs
// Check a build:  node scripts/drawcheck/check.mjs scripts/drawcheck/specs/postout-bell.mjs --dist dist --out <folder>
import { fileURLToPath } from 'node:url'

/* (transitions held still, never animations: the landing's ring IS an animation held for six seconds — 06-inputs.css inflash —
   and with animations off the build drew no ring at all) */
const QUIET = '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important}'
const ISO = '2026-11-16'
const RUN_AT = new Date('2026-11-16T08:00:00')
const sleep = ms => new Promise(r => setTimeout(r, ms))
const sheet = '.bidsheet[role="dialog"]'

/* the drawing's own way there (draw.mjs, steps 1–2): today, four men posted out from Mon 16 Nov on the Leave War's one-day
   sheet — Ranger to an Overseas Sqn, the next three on the grid with Delete, SANS and no outcome — then the clock moved
   to 08:00 that day and the app opened again; the postings run by themselves */
async function signIn(page) {
  await page.waitForSelector('#luser')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await sleep(800)
}
const go = async (page, p) => { await page.evaluate(p => window.go(p), p); await page.waitForFunction(p => window.CURPAGE === p, p); await sleep(500) }
async function press(page, tap, sel) {
  const l = page.locator(sel).filter({ visible: true }).last()
  if (!(await l.count())) throw new Error('nothing to press — ' + sel)
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (tap) await l.tap(); else await l.click()
  await sleep(tap ? 650 : 300)
}
async function postOut(page, tap, id, outcome) {
  const c = page.locator(`[data-testid="cell-${id}-${ISO}"]`).first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  const b = await c.boundingBox()
  if (tap) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  await sleep(700)
  await press(page, tap, `${sheet} [data-testid="bid-more"]`)
  await press(page, tap, '[data-testid="bid-postout"]')
  if (outcome === 'none') await press(page, tap, `${sheet} [data-testid="po-overseas"]`)
  else if (outcome !== 'overseas') await press(page, tap, `${sheet} [data-testid="po-${outcome}"]`)
  await press(page, tap, `${sheet} [data-testid="po-confirm"]`)
  if (outcome === 'delete') await press(page, tap, '[data-testid="po-delete-go"]')
  await sleep(600)
  for (let i = 0; i < 4; i++) { const x = page.locator(`${sheet} button.x:visible`).last(); if (!(await x.count())) break; await x.click().catch(() => {}); await sleep(350) }
}
async function reachRun(page, phone, origin) {
  const tap = !!phone
  await page.goto(origin + '/')
  await page.addStyleTag({ content: QUIET }).catch(() => {})
  await signIn(page)
  const men = await page.evaluate(() => Object.keys(window.PEOPLE).filter(id => { const p = window.PEOPLE[id]; return !p.special && !p.archived && !p.san && !p.deleted && !p.pers }))
  await go(page, 'leavewar')
  await page.waitForSelector('[data-testid^="row-"]', { timeout: 20000 }); await sleep(500)
  const bar = page.locator('[data-testid="figures-toggle"]')
  if ((await bar.count()) && (await bar.getAttribute('aria-expanded')) === 'true') { await bar.click(); await sleep(300) }
  const m = page.locator('[data-testid="month-NOV"]:visible').first()
  if (await m.count()) { await m.click(); await sleep(900) }
  const onGrid = new Set(await page.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].map(r => r.getAttribute('data-testid').slice(4))))
  const pick = ['bane', ...men.filter(id => id !== 'bane' && id !== 'stiff' && onGrid.has(id)).slice(6, 9)]
  for (const [o, id] of [['overseas', pick[0]], ['delete', pick[1]], ['sans', pick[2]], ['none', pick[3]]]) await postOut(page, tap, id, o)
  await page.clock.install({ time: RUN_AT })
  await page.reload()
  await page.addStyleTag({ content: QUIET }).catch(() => {})
  await signIn(page)
  await sleep(1500)
  await page.addStyleTag({ content: QUIET }).catch(() => {})
  return pick
}
async function openBell(page, phone) {
  const b = page.locator('.bellbtn').filter({ visible: true }).first()
  if (phone) await b.tap(); else await b.click()
  await page.waitForSelector('[data-testid="bell-list"]'); await sleep(400)
}
async function reachList(page, { phone, origin }) {
  await reachRun(page, phone, origin)
  await openBell(page, phone)
}
/* the landing: the build's own way — a tap on his line (the drawing went to Admin → Users by hand, the fold opened and the
   row ringed by its script) */
const reachLanding = who => async (page, { phone, origin }) => {
  const pick = await reachRun(page, phone, origin)
  await openBell(page, phone)
  const id = who === 'overseas' ? pick[0] : pick[2]
  const cs = await page.evaluate(id => window.PEOPLE[id].cs, id)
  const line = page.locator('[data-testid="bell-list"] .bl-line').filter({ has: page.locator('.bl-name', { hasText: new RegExp(`^${cs}$`) }) }).first()
  if (!(await line.count())) return `no bell line for ${cs}`
  const b = await line.boundingBox()
  if (phone) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  await sleep(900)
  if (!(await page.locator(`#page-admin .acc-row.acc-ring[data-person="${id}"]`).count())) return `his row (${cs}) is not ringed after the tap`
}

const P = (name, label, draw, build, check, more = {}) => ({ name, label, draw, build, check, ...more })
const L = '[data-testid="bell-list"]'
const line = n => `${L} .bl-scroll > .bl-line:nth-child(${n})`
const WHO = ['', 'Ranger (archived)', 'Trident (deleted)', 'Cinch (now SANS)', 'Cobra (off the manpower)']
const listParts = [
  P('list', 'the bell list', L, L, ['place', 'size', 'fill', 'corners']),
  ...[1, 2, 3, 4].flatMap(n => [
    P(`line-${n}`, `line ${n} — ${WHO[n]}`, line(n), line(n), ['place', 'size'], { rel: 'list' }),
    P(`name-${n}`, `line ${n}'s man, in bold`, `${line(n)} .bl-name`, `${line(n)} .bl-name`, ['place', 'words-x', 'colour', 'letters', 'text'], { rel: `line-${n}` }),
    P(`day-${n}`, `line ${n}'s date`, `${line(n)} .bl-day`, `${line(n)} .bl-day`, ['place', 'colour', 'letters', 'text'], { rel: `line-${n}` }),
    P(`what-${n}`, `line ${n}'s "Posted out · …"`, `${line(n)} .bl-what`, `${line(n)} .bl-what`, ['place', 'colour', 'letters', 'text'], { rel: `line-${n}` }),
    P(`dot-${n}`, `line ${n}'s unread dot`, `${line(n)} .bl-dot`, `${line(n)} .bl-dot`, ['place', 'size', 'fill'], { rel: `line-${n}` }),
  ]),
]
const landParts = (pid, drawRow, buildRow) => [
  P('row', "his row, ringed", drawRow, buildRow, ['place', 'size', 'shadow']),
  P('name', 'his name', `${drawRow} .acc-name`, `${buildRow} .acc-name`, ['place', 'words-x', 'colour', 'text']),
]

export default {
  name: 'The posting-out bell line and its landing',
  slug: 'postout-bell',
  origin: 'http://localhost:4391',
  timezone: 'Asia/Singapore',
  records: fileURLToPath(new URL('../../../docs/mock/2026-11-05-postout-bell/drawcheck/', import.meta.url)),
  states: [
    { id: 'list-desk', title: "The admin's bell list on Mon 16 Nov, desktop", drawing: { script: 'docs/mock/2026-11-05-postout-bell/draw.mjs', shot: '2b-bell-manfirst-desk' }, reach: reachList, parts: listParts },
    { id: 'list-phone', title: "The admin's bell list on Mon 16 Nov, iPhone (WebKit)", phone: true, engine: 'webkit', drawing: { script: 'docs/mock/2026-11-05-postout-bell/draw.mjs', shot: '2b-bell-manfirst-phone' }, reach: reachList, parts: listParts },
    { id: 'land-overseas-desk', title: "Ranger's line tapped: Admin → Users, his archived row ringed, desktop", drawing: { script: 'docs/mock/2026-11-05-postout-bell/draw.mjs', shot: '3-land-overseas-desk' }, reach: reachLanding('overseas'), parts: landParts('bane', '#page-admin .acc-row.pb-land', '#page-admin .acc-row.acc-ring') },
    { id: 'land-overseas-phone', title: "Ranger's line tapped, iPhone (WebKit)", phone: true, engine: 'webkit', drawing: { script: 'docs/mock/2026-11-05-postout-bell/draw.mjs', shot: '3-land-overseas-phone' }, reach: reachLanding('overseas'), parts: landParts('bane', '#page-admin .acc-row.pb-land', '#page-admin .acc-row.acc-ring') },
    { id: 'land-sans-desk', title: "Cinch's line tapped: his roster row ringed, desktop", drawing: { script: 'docs/mock/2026-11-05-postout-bell/draw.mjs', shot: '3-land-sans-desk' }, reach: reachLanding('sans'), parts: landParts('snap', '#page-admin .acc-row.pb-land', '#page-admin .acc-row.acc-ring') },
    { id: 'land-sans-phone', title: "Cinch's line tapped, iPhone (WebKit)", phone: true, engine: 'webkit', drawing: { script: 'docs/mock/2026-11-05-postout-bell/draw.mjs', shot: '3-land-sans-phone' }, reach: reachLanding('sans'), parts: landParts('snap', '#page-admin .acc-row.pb-land', '#page-admin .acc-row.acc-ring') },
  ],
  accepted: [
    /* the drawing cloned four UNREAD lines into a list that held none, so the list's own foot — "Mark all read", drawn
       whenever a line is unread (ui/topbits.tsx BellList, as built since the one-rule build) — was not drawn under them;
       the build draws it. A state of the drawing, not a difference of design */
    { state: 'list-desk', part: 'list', check: 'height', why: 'the drawing state: its cloned unread lines never raised the list’s own "Mark all read" foot, which the built list draws under unread lines' },
    { state: 'list-phone', part: 'list', check: 'height', why: 'the drawing state: its cloned unread lines never raised the list’s own "Mark all read" foot, which the built list draws under unread lines' },
    /* the phone drawing was taken with the finger's last point resting over the row's name (the drawing's tap on the
       Archived fold or the row): its cyan is the row's hover look, which the build no longer draws on a touch screen
       (15-admin-help.css — the walk's b3 phone picture) */
    { state: 'land-overseas-phone', part: 'name', check: 'colour', why: 'the drawing state: the name under the resting finger (its hover look), which a touch screen no longer shows' },
    { state: 'land-sans-phone', part: 'name', check: 'colour', why: 'the drawing state: the name under the resting finger (its hover look), which a touch screen no longer shows' },
  ],
}
