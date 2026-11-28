// Chat 193, 27 Nov 26 — the roll-call his last question (chat 192) asked for: "some war windows show the leave buttons and
// CSE · OD · Grant OIL · ⋯, some none — are we standardising that?" Every state of the Leave War's window, set up on the
// REAL app (the main folder's build, served on 127.0.0.1:4181), tapped, and its parts read off the screen and pictured.
// Nothing under raptor-port/src changes. States are set up the way the earlier drawings did (lw-held-draw.mjs): entries
// filed on the Inputs page by the test bridge's Inputs writer (`fileInput`), a man posted out by the war's own writer
// (`lwSetPostOut`); bids, approvals and OIL awards by pressing the war window's own buttons.
// Run from raptor-port/ (the main folder's, for playwright), one size a process:
//   node <this file> --size d|p [--url http://127.0.0.1:4181/] [--img <folder>]
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const VERSION = 'rollcall-today v1.1 (27 Nov 26, chat 193)'
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d }
const SIZE = arg('size', 'd'), URL = arg('url', 'http://127.0.0.1:4181/'), PHONE = SIZE === 'p'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const IMG = path.resolve(arg('img', path.join(HERE, 'img')))
const PW = createRequire(arg('pw', process.cwd() + '/package.json'))('playwright')
const sleep = ms => new Promise(r => setTimeout(r, ms))
mkdirSync(IMG, { recursive: true })
console.log(VERSION, '| size', PHONE ? 'phone 402x874 3x' : 'desktop 1536x864 2x')

const CUT = 'psy', RAN = 'bane', GHOST = 'riddler', DASH = 'spaceman', DIESEL = 'fantom'
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const md = iso => `${MON[+iso.slice(5, 7) - 1]} ${+iso.slice(8)}`
const SHEETS = ['bid-picker', 'raptor-sheet', 'daylist-sheet', 'remarks-sheet', 'closed-sheet', 'award-sheet', 'postout-sheet', 'postin-sheet', 'closed-note']

async function press(p, sel) { const l = typeof sel === 'string' ? p.locator(sel).first() : sel; await l.scrollIntoViewIfNeeded().catch(() => {}); if (PHONE) await l.tap(); else await l.click() }
async function signIn(p, u, pw) {
  await p.goto(URL, { timeout: 60000, waitUntil: 'commit' })
  await p.waitForSelector('#luser', { timeout: 60000 })
  await p.fill('#luser', u); await p.fill('#lpass', pw); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { timeout: 60000 }); await sleep(800)
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
}
async function toWar(p) { await p.evaluate(() => window.go('leavewar')); await sleep(2500) }
const cellSel = (who, iso) => `[data-testid="cell-${who}-${iso}"]`
async function reach(p, who, iso) {
  const mon = MON[+iso.slice(5, 7) - 1].toUpperCase()
  for (let i = 0; i < 3 && !(await p.locator(cellSel(who, iso)).count()); i++) {
    await press(p, p.locator('button:visible').filter({ hasText: new RegExp('^' + mon + '$') }).first()); await sleep(1200)
  }
  await p.evaluate(s => document.querySelector(s)?.scrollIntoView({ block: 'center', inline: 'center' }), cellSel(who, iso)); await sleep(400)
}
async function tap(p, who, iso) { await reach(p, who, iso); await press(p, cellSel(who, iso)); await sleep(900) }
async function closeAll(p) {
  for (let i = 0; i < 3; i++) {
    const open = await p.evaluate(ids => ids.some(t => { const e = document.querySelector(`[data-testid="${t}"]`); return e && e.getBoundingClientRect().width > 0 }), SHEETS)
    if (!open) return
    const x = p.locator('[data-testid="bid-cancel"]:visible, .bidsheet .x:visible, [aria-label="Close"]:visible, [aria-label="Cancel"]:visible').first()
    if (await x.count()) await press(p, x); else await p.keyboard.press('Escape')
    await sleep(400)
  }
}
const file = (p, o) => p.evaluate(o => window.fileInput(o), o)
const fileDay = (p, person, iso, type, extra = {}) => file(p, { person, date: md(iso), yr: +iso.slice(0, 4), type, remarks: '', allday: true, ...(type === 'Other' ? { acc: 'u' } : {}), ...extra })

/* the window's parts, read off the screen: which window, its title, then each row in order, its buttons and lines */
async function parts(p) {
  return p.evaluate(ids => {
    const vis = e => e && e.getBoundingClientRect().width > 0
    const id = ids.find(t => vis(document.querySelector(`[data-testid="${t}"]`)))
    if (!id) return { window: 'NONE' }
    const el = document.querySelector(`[data-testid="${id}"]`)
    const clean = s => (s || '').replace(/\s+/g, ' ').trim()
    const rows = [...el.querySelectorAll('.bidsheet-hd, .bidsheet-row, .dl-row, .daylist-row, [data-testid^="dl-"], [data-testid="bid-dayline"], [data-testid="placed-line"]')]
      .filter(vis).filter((r, i, a) => !a.some((o, j) => j !== i && o !== r && o.contains(r)))
    const read = r => ({
      row: r.getAttribute('aria-label') || r.getAttribute('data-testid') || (r.className || '').toString().split(' ').filter(c => /bidsheet|bp-|dl|day/.test(c)).join('.'),
      buttons: [...r.querySelectorAll('button')].filter(vis).map(b => clean(b.textContent) || b.getAttribute('aria-label') || '?'),
      text: clean(r.textContent).slice(0, 200),
    })
    return { window: id, rows: rows.length ? rows.map(read) : [{ row: 'whole', buttons: [...el.querySelectorAll('button')].filter(vis).map(b => clean(b.textContent)), text: clean(el.textContent).slice(0, 300) }] }
  }, SHEETS)
}
async function shot(p, name, who, iso) {
  await sleep(300)
  const box = await p.evaluate(([ids, cs]) => {
    const els = [...ids.map(t => document.querySelector(`[data-testid="${t}"]`)), document.querySelector(cs)].filter(e => e && e.getBoundingClientRect().width > 0)
    const rs = els.map(e => e.getBoundingClientRect())
    if (!rs.length) return null
    const pad = 12, x = Math.max(0, Math.min(...rs.map(r => r.left)) - pad), y = Math.max(0, Math.min(...rs.map(r => r.top)) - pad)
    return { x, y, width: Math.min(innerWidth, Math.max(...rs.map(r => r.right)) + pad) - x, height: Math.min(innerHeight, Math.max(...rs.map(r => r.bottom)) + pad) - y }
  }, [SHEETS, cellSel(who, iso)])
  const f = `${name}-${PHONE ? 'phone' : 'desktop'}.png`
  if (box) await p.screenshot({ path: path.join(IMG, f), clip: box }); else await p.screenshot({ path: path.join(IMG, f) })
  return f
}
const out = []
async function look(p, id, said, who, iso, { keepOpen = false } = {}) {
  try { await tap(p, who, iso) } catch (e) {
    console.log(`\n${id} — TAP FAILED: ${e.message.split('\n')[0]}`); await p.keyboard.press('Escape').catch(() => {})
    out.push({ id, said, who, iso, window: 'TAP FAILED' }); return
  }
  const r = await parts(p)
  r.pic = await shot(p, id, who, iso)
  out.push({ id, said, who, iso, ...r })
  console.log(`\n${id} — ${said}\n  window: ${r.window}`)
  for (const row of r.rows || []) console.log(`  · ${row.row}: [${row.buttons.join(' | ')}]  ${row.buttons.length ? '' : row.text}`)
  if (!keepOpen) await closeAll(p)
  return r
}

/* the dates: a man's days in December 2026, after today (27 Nov) */
const D = { empty: '2026-12-01', pend: '2026-12-02', appr: '2026-12-03', multiA: '2026-12-07', multiB: '2026-12-08', inLL: '2026-12-09', med: '2026-12-10',
  od: '2026-12-11', cse: '2026-12-14', oth: '2026-12-15', half: '2026-12-16', oil: '2026-12-17', two: '2026-12-18', group: '2026-12-21', closed: '2026-11-30', past: '2026-11-20' }

/* the world both scripts draw on (draw-standard.mjs imports it, RC_LIB=1) */
export async function setupWorld(p) {
  await signIn(p, 'ad', 'a'); await toWar(p)
  /* December opened for bidding, so a member's December day takes a bid; 30 Nov stays closed */
  await press(p, '[data-testid="open-chip"]'); await p.waitForSelector('[data-testid="open-dates"]')
  if ((await p.locator('[data-testid="od-month-2026-12"]').getAttribute('aria-pressed')) !== 'true') { await press(p, '[data-testid="od-month-2026-12"]'); await sleep(500) }
  await press(p, '[data-testid="open-dates-close"]'); await sleep(400)
  /* entries filed on the Inputs page */
  for (const who of [CUT, RAN]) await fileDay(p, who, D.inLL, 'LL')
  await fileDay(p, CUT, D.med, 'OML')
  await fileDay(p, CUT, D.od, 'OD')
  await fileDay(p, CUT, D.cse, 'CSE')
  await fileDay(p, CUT, D.oth, 'Other')
  await file(p, { person: CUT, date: md(D.half), yr: 2026, type: 'LL', remarks: '', allday: false, half: 'am', s: 0, e: 720 })
  await file(p, { people: [{ p: CUT }, { p: GHOST }, { p: DASH }], date: md(D.group), yr: 2026, type: 'LL', remarks: 'Family trip', allday: true })
  await p.evaluate(([who, iso]) => window.lwSetPostOut(who, iso), [DIESEL, '2026-12-10'])
  await sleep(1200)
  /* on the war: a pending bid (Auto-approve off), an approved bid (on), a two-day approved leave, an OIL award, two entries */
  const bidOn = async (who, iso, code, approve) => {
    await tap(p, who, iso)
    const sw = p.locator('[data-testid="bid-approve-tick"]').first()
    if (await sw.count()) { const on = (await sw.getAttribute('aria-checked')) === 'true' || (await sw.getAttribute('aria-pressed')) === 'true'; if (on !== approve) { await press(p, sw); await sleep(250) } }
    /* by its own name, never its words: "OL" is inside "Whole day" (v1.0 pressed Whole day) */
    await press(p, `[data-testid="bid-picker"] [data-testid="bid-${code}"]`); await sleep(800); await closeAll(p)
  }
  await bidOn(CUT, D.pend, 'LL', false)
  await bidOn(CUT, D.appr, 'LL', true)
  await bidOn(CUT, D.multiA, 'OL', true); await bidOn(CUT, D.multiB, 'OL', true)
  await tap(p, CUT, D.oil); await press(p, '[data-testid="bid-oil"]'); await sleep(300); await press(p, '[data-testid="oil-pick-fo"]'); await sleep(200)
  if (await p.locator('[data-testid="oil-why"]:visible').count()) await p.fill('[data-testid="oil-why"]', 'Weekend det')
  await press(p, '[data-testid="oil-give"]'); await sleep(600); await closeAll(p)
  await tap(p, CUT, D.two); await press(p, '[data-testid="bid-oil"]'); await sleep(300); await press(p, '[data-testid="oil-pick-fo"]'); await sleep(200)
  if (await p.locator('[data-testid="oil-why"]:visible').count()) await p.fill('[data-testid="oil-why"]', 'Weekend det')
  await press(p, '[data-testid="oil-give"]'); await sleep(600); await closeAll(p)
  await bidOn(CUT, D.two, 'LL', false)
  /* the member's own: a pending bid and an approved leave on Ranger's row, placed by the admin */
  await bidOn(RAN, D.pend, 'LL', false)
  await bidOn(RAN, D.appr, 'LL', true)
}
async function admin(p) {
  await setupWorld(p)
  console.log('\n===== ADMIN (Saber), on Cutter\'s row =====')
  await look(p, 'a01-empty', 'an empty day, open for bidding', CUT, D.empty)
  await look(p, 'a02-empty-closed', 'an empty day not open for bidding (30 Nov)', CUT, D.closed)
  await look(p, 'a03-pending', 'his pending LL bid', CUT, D.pend)
  await look(p, 'a04-approved', 'his LL placed approved on the war', CUT, D.appr)
  await look(p, 'a05-multi', 'his two-day OL, approved (tap on the first day)', CUT, D.multiA)
  await look(p, 'a06-inputs-ll', 'an LL filed on the Inputs page', CUT, D.inLL)
  await look(p, 'a07-medical', 'an OML filed on the Inputs page', CUT, D.med)
  await look(p, 'a08-od', 'an overseas duty filed on the Inputs page', CUT, D.od)
  await look(p, 'a09-course', 'a course filed on the Inputs page', CUT, D.cse)
  await look(p, 'a10-other', 'an Other under Unavailable, whole day', CUT, D.oth)
  await look(p, 'a11-half', 'a morning LL filed on the Inputs page (afternoon free)', CUT, D.half)
  await look(p, 'a12-oil', 'an OIL award (FO) given on the war', CUT, D.oil)
  await look(p, 'a13-two', 'two entries: an OIL award and a pending LL bid', CUT, D.two)
  await look(p, 'a14-group', 'a group LL filed on the Inputs page for Cutter, Ghost and Dash', CUT, D.group)
  await look(p, 'a15-postedout', 'a day after Diesel posts out (10 Dec)', DIESEL, '2026-12-14')
  await look(p, 'a16-past', 'an empty day before today (20 Nov)', CUT, D.past)
}
async function member(p) {
  await signIn(p, 'us', 'us'); await toWar(p)
  console.log('\n===== MEMBER (Ranger), his own row, then another man\'s =====')
  await look(p, 'm01-empty', 'his own empty day, open for bidding', RAN, D.empty)
  await look(p, 'm02-closed', 'his own empty day not open (30 Nov)', RAN, D.closed)
  await look(p, 'm03-past', 'his own empty day before today (20 Nov)', RAN, D.past)
  await look(p, 'm04-pending', 'his own pending LL bid', RAN, D.pend)
  await look(p, 'm05-approved', 'his own LL, approved', RAN, D.appr)
  await look(p, 'm06-inputs-ll', 'his own LL filed on the Inputs page', RAN, D.inLL)
  await look(p, 'm07-other-empty', 'another man\'s empty day (Cutter)', CUT, D.empty)
  await look(p, 'm08-other-leave', 'another man\'s approved LL (Cutter)', CUT, D.appr)
  await look(p, 'm09-other-od', 'another man\'s overseas duty (Cutter)', CUT, D.od)
}

export { PW, PHONE, IMG, sleep, press, signIn, toWar, reach, tap, closeAll, cellSel, D, CUT, RAN, DIESEL }
if (!process.env.RC_LIB) {
const engine = PW.chromium
const browser = await engine.launch()
const ctx = await browser.newContext(PHONE
  ? { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }
  : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 })
const errs = []
const watch = p => { p.setDefaultTimeout(10000); p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text().slice(0, 160)) }) }
try {
  const p1 = await ctx.newPage(); watch(p1)
  /* a clean world in this context's own storage: the demo installs on a first-ever boot */
  await admin(p1); await sleep(1500); await p1.close()
  const p2 = await ctx.newPage(); watch(p2)
  await member(p2)
  console.log('\nDONE', VERSION)
} catch (e) { console.log('FAILED', e.message.split('\n')[0]) }
finally {
  writeFileSync(path.join(IMG, `rollcall-${PHONE ? 'phone' : 'desktop'}.json`), JSON.stringify({ version: VERSION, errs, out }, null, 1))
  console.log('errors:', errs.length, errs.slice(0, 5))
  await browser.close()
}
}
