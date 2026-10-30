/* THE WALK — [BOARD-ESCAPE-CLOSE] and [TRAFFIC-WIN-COVERS-UNDO] (the night of 30 Oct 26, job 4).
   Drives the real built app in three worlds, each a fresh browser context signed in as the admin through the sign-in
   card: D — his PC (Chromium started at 125%, 1536 × 730 screen = 1229 × 584 page pixels); P — his iPhone (WebKit,
   402 × 874, three times its density, touch), the board's phone layout; PW — the same phone with the board switched to
   its Desktop layout from the ⋯ menu. Every step asserts what the person sees, in screen terms, and leaves a picture of
   it; on the phone a tap also gets a picture within about 100 ms of the lift, the pointer left where it pressed (D1281).
   Run (a preview of the build being walked must be serving, its port in HP_URL):
     HP_URL=http://localhost:4189 node scripts/handpass/bet-walk.mjs            (ONLY=D,P,PW to pick worlds)
   Pictures: docs/img/handpass/2026-10-30-board-escape-traffic/<world>/ (HP_SHOTS for a re-walk's own folder). */
import { mkdirSync, writeFileSync, readdirSync, unlinkSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, webkit } from '@playwright/test'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..', '..')
const BASE = process.env.HP_URL || 'http://localhost:4189'
process.env.HP_SHOTS ||= resolve(ROOT, 'docs/img/handpass/2026-10-30-board-escape-traffic')
const OUT = process.env.HP_SHOTS
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const LAUNCH = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const sleep = ms => new Promise(r => setTimeout(r, ms))
const rows = []
let errors = []

function check(world, id, what, ok, seen) {
  rows.push({ world, id, what, result: ok ? 'PASS' : 'FAIL', seen })
  console.log(`${ok ? 'PASS' : 'FAIL'} ${world} ${id} — ${what} — ${seen}`)
}

async function open(world) {
  let browser, ctx
  if (world === 'D') {
    browser = await chromium.launch({ ...LAUNCH, args: ['--force-device-scale-factor=1.25'] })
    ctx = await browser.newContext({ viewport: { width: 1229, height: 584 }, deviceScaleFactor: 1.25, colorScheme: 'dark' })
  } else {
    browser = await webkit.launch()
    ctx = await browser.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, colorScheme: 'dark' })
  }
  const p = await ctx.newPage()
  p.on('console', m => { if (m.type() === 'error') errors.push(`${world}: ${m.text()}`) })
  p.on('pageerror', e => errors.push(`${world} PAGEERROR ${e.message}`))
  p.on('response', r => { if (r.status() >= 400) errors.push(`${world} HTTP ${r.status()} ${r.url()}`) })
  await p.goto(BASE + '/')
  await p.waitForSelector('#luser', { state: 'visible', timeout: 15000 })
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await sleep(500)
  /* to Edit Schedule by its own tab (the phone's is in the menu: the bridge's page change, as e2e/app.ts go() does) */
  await p.evaluate(() => window.go('editsched')); await p.waitForFunction(() => window.CURPAGE === 'editsched'); await sleep(600)
  return { browser, ctx, p }
}

/* one press as a person makes it: a mouse click on a desktop, a tap on the phone — and on the phone a picture right
   after the lift (the pressed state an iPhone keeps), besides the settled one the step takes */
async function press(p, world, dir, n, sel, name) {
  const el = p.locator(sel).first()
  await el.waitFor({ state: 'visible', timeout: 5000 })
  if (world === 'D') await el.click({ timeout: 4000 })
  else {
    const b = await el.boundingBox()
    await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
    await sleep(60)
    await p.screenshot({ path: resolve(dir, `${String(n).padStart(2, '0')}a-${name}-pressed.png`) })
  }
}
const shot = (p, dir, n, name) => p.screenshot({ path: resolve(dir, `${String(n).padStart(2, '0')}-${name}.png`) })
const boardUp = p => p.evaluate(() => { const b = document.getElementById('schedBoard'); return !!b && !b.hidden && window.SBDAY != null })
const airUp = p => p.evaluate(() => { const a = document.getElementById('airpop'); return !!a && !a.hidden })
const lines = p => p.evaluate(() => [...document.querySelectorAll('#airBody [data-airi]')].map(b => b.value))
/* what a finger meets at a control's middle */
const meets = (p, sel) => p.evaluate(s => {
  const el = [...document.querySelectorAll(s)].find(e => e.offsetWidth)
  if (!el) return { found: false }
  const r = el.getBoundingClientRect(), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  return { found: true, isIt: !!hit && (hit === el || el.contains(hit)), over: hit ? (hit.id || String(hit.className) || hit.tagName) : '' }
}, sel)
const boxVsBar = (p, bar) => p.evaluate(b => {
  const box = document.querySelector('#airpop:not([hidden]) .airpop-box')
  const q = [...document.querySelectorAll(b)].find(e => e.offsetHeight)
  if (!box || !q) return null
  const r = box.getBoundingClientRect(), s = q.getBoundingClientRect()
  return { boxTop: Math.round(r.top), boxFoot: Math.round(r.bottom), barFoot: Math.round(s.bottom), vh: innerHeight }
}, bar)
const focusInfo = p => p.evaluate(() => {
  const a = document.activeElement
  if (!a || a === document.body) return { where: 'nowhere', ring: '' }
  const cs = getComputedStyle(a)
  return { where: a.id || a.getAttribute('aria-label') || a.className || a.tagName, inBoard: !!a.closest('#schedBoard'), ring: cs.outlineStyle !== 'none' ? `${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor}` : (cs.boxShadow !== 'none' ? 'shadow ' + cs.boxShadow : 'none') }
})
/* the phone's week stands on the day the board last closed on (Monday, the first opened): the board is opened from that
   day there, as a person would, never from a day off the screen — the desktop opens it from the day asked */
const openBoard = async (p, world, dir, n, di) => {
  if (world !== 'D') di = 0
  /* the day's date is at the top of the week: back to the page's top first (a person scrolls up to it) */
  await p.evaluate(() => window.scrollTo(0, 0)); await sleep(250)
  await press(p, world, dir, n, `#eWeek .day[data-day="${di}"] .dt.sb-open`, `open-board-day${di}`)
  await p.waitForFunction(() => window.SBDAY != null); await sleep(500)
}

async function walk(world) {
  const dir = resolve(OUT, world)
  mkdirSync(dir, { recursive: true })
  for (const f of readdirSync(dir)) if (f.endsWith('.png')) unlinkSync(resolve(dir, f))
  errors = []
  const { browser, p } = await open(world)
  let n = 0
  const barSel = '.topbar:has(#burger)', sbBar = '#schedBoard .sb-top'
  try {
    /* ---- the Scheduler Board's Escape ---- */
    await openBoard(p, world, dir, ++n, 0)
    if (world === 'PW') {
      await press(p, world, dir, ++n, '#sbMore', 'more-menu')
      await press(p, world, dir, ++n, '#sbMoreWide', 'desktop-layout')
      await sleep(500)
      check(world, 'W0', 'the board in its Desktop layout on the phone', await p.evaluate(() => document.getElementById('schedBoard').classList.contains('sb-wide')), 'sb-wide on the board')
    }
    await shot(p, dir, ++n, 'board-open')
    check(world, 'E1a', 'the board is open, the keyboard nowhere', (await boardUp(p)) && (await focusInfo(p)).where === 'nowhere', JSON.stringify(await focusInfo(p)))
    await p.keyboard.press('Escape')
    await sleep(40); await shot(p, dir, ++n, 'escape-just-after')
    await sleep(400); await shot(p, dir, ++n, 'escape-settled-week')
    check(world, 'E1', 'Escape with the keyboard nowhere closes the board (Edit Schedule\'s week behind it)', !(await boardUp(p)) && (await p.evaluate(() => window.CURPAGE)) === 'editsched', `board up: ${await boardUp(p)}, page ${await p.evaluate(() => window.CURPAGE)}`)

    /* the other order: ✓ Done, reopen, then Escape */
    await openBoard(p, world, dir, ++n, 1)
    await press(p, world, dir, ++n, '#sbDone', 'done')
    await sleep(400); await shot(p, dir, ++n, 'done-settled')
    check(world, 'E2a', '✓ Done closes the board', !(await boardUp(p)), `board up: ${await boardUp(p)}`)
    await openBoard(p, world, dir, ++n, 1)
    await p.keyboard.press('Escape'); await sleep(400)
    await shot(p, dir, ++n, 'reopen-escape-settled')
    check(world, 'E2', 'Done, reopen, then Escape: closed again', !(await boardUp(p)), `board up: ${await boardUp(p)}`)

    /* a take-off box: Escape puts the old time back and leaves the box; the board stays; the next Escape closes it */
    await openBoard(p, world, dir, ++n, 2)
    const to = p.locator('#sbBoard input.tm[data-bfld$=".to"]:visible').first()
    await to.scrollIntoViewIfNeeded()
    const toKey = await to.getAttribute('data-bfld')
    const was = await to.inputValue()
    if (world === 'D') await to.click(); else { const b = await to.boundingBox(); await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2) }
    await sleep(700)
    await p.keyboard.type('2359'); await sleep(200)
    await shot(p, dir, ++n, 'takeoff-typed')
    const typed = await to.inputValue()
    await p.keyboard.press('Escape'); await sleep(400)
    await shot(p, dir, ++n, 'takeoff-escape')
    const after = await p.locator(`#sbBoard input[data-bfld="${toKey}"]:visible`).first().inputValue()
    const fi = await focusInfo(p)
    check(world, 'E3a', 'Escape in a take-off box: the old time back, the box left, the board kept (D1011)', after === was && (await boardUp(p)) && fi.where !== toKey, `typed "${typed}", after Escape "${after}" (was "${was}"), board up ${await boardUp(p)}, keyboard ${fi.where}`)
    await p.keyboard.press('Escape'); await sleep(400)
    await shot(p, dir, ++n, 'takeoff-second-escape')
    check(world, 'E3', 'the second Escape closes the board', !(await boardUp(p)), `board up: ${await boardUp(p)}`)

    /* a window over the board answers first: the Traffic window, the changes window (History), the ⋯ menu (phone) */
    await openBoard(p, world, dir, ++n, 2)
    await p.locator('#sbBoard [data-air]:visible').first().scrollIntoViewIfNeeded()
    await press(p, world, dir, ++n, '#sbBoard [data-air]:visible', 'traffic-on-board')
    await sleep(400)
    await p.keyboard.press('Escape'); await sleep(400)
    await shot(p, dir, ++n, 'traffic-over-board-escape')
    check(world, 'E4a', 'Escape with the Traffic window over the board: both stay', (await boardUp(p)) && (await airUp(p)), `board ${await boardUp(p)}, traffic ${await airUp(p)}`)
    await press(p, world, dir, ++n, '#airDone', 'traffic-done'); await sleep(300)
    await press(p, world, dir, ++n, '#sbHist', 'history-on'); await sleep(500)
    const chg = await p.evaluate(() => !!document.querySelector('.chgwin:not([hidden])'))
    await p.keyboard.press('Escape'); await sleep(400)
    await shot(p, dir, ++n, 'changes-over-board-escape')
    check(world, 'E4b', 'Escape with the changes window over the board: the board stays', chg && (await boardUp(p)), `changes window up ${chg}, board ${await boardUp(p)}`)
    await press(p, world, dir, ++n, '#sbHist', 'history-off'); await sleep(400)
    if (world !== 'D') {
      await press(p, world, dir, ++n, '#sbMore', 'more-open'); await sleep(250)
      const m1 = await p.evaluate(() => !!document.getElementById('sbMoreMenu'))
      await p.keyboard.press('Escape'); await sleep(300)
      await shot(p, dir, ++n, 'more-escape')
      const m2 = await p.evaluate(() => !!document.getElementById('sbMoreMenu'))
      check(world, 'E4c', 'Escape with the ⋯ menu open: the menu closes, the board stays', m1 && !m2 && (await boardUp(p)), `menu before ${m1}, after ${m2}, board ${await boardUp(p)}`)
    }
    await p.keyboard.press('Escape'); await sleep(400)
    await shot(p, dir, ++n, 'windows-gone-escape')
    check(world, 'E4', 'with the windows gone, Escape closes the board', !(await boardUp(p)), `board up: ${await boardUp(p)}`)

    /* the keyboard on a button of the board: its ring shows; Escape closes the board; the keyboard is not left on it */
    if (world === 'D') {
      await openBoard(p, world, dir, ++n, 3)
      let f = null
      for (let i = 0; i < 80; i++) { await p.keyboard.press('Tab'); f = await focusInfo(p); if (f.inBoard) break }
      await sleep(150); await shot(p, dir, ++n, 'tab-onto-board-button')
      check(world, 'E5a', 'Tab reaches a button of the board, its focus ring drawn', !!f && f.inBoard && f.ring !== 'none', JSON.stringify(f))
      await p.keyboard.press('Escape'); await sleep(400)
      await shot(p, dir, ++n, 'escape-from-board-button')
      const g = await focusInfo(p)
      check(world, 'E5', 'Escape from a board button closes the board; the keyboard is off the closed board', !(await boardUp(p)) && !g.inBoard, `board up ${await boardUp(p)}, keyboard ${JSON.stringify(g)}`)
    }

    /* ---- the Traffic window and the bar over it ---- */
    await p.evaluate(() => window.scrollTo(0, 0))
    const weekAir = '#eWeek .day[data-day="0"] [data-air]:visible'
    await p.locator(weekAir).first().scrollIntoViewIfNeeded()
    await press(p, world, dir, ++n, weekAir, 'traffic-on-week'); await sleep(400)
    await shot(p, dir, ++n, 'traffic-open-week')
    let m = await boxVsBar(p, barSel)
    check(world, 'T1a', 'the Traffic window opens below the top bar, the bar not veiled', !!m && m.boxTop >= m.barFoot && m.boxFoot <= m.vh, JSON.stringify(m))
    const before = await lines(p)
    await press(p, world, dir, ++n, '#airAdd', 'add-row'); await sleep(300)
    const added = await lines(p)
    const u = await meets(p, '#undoBtn')
    check(world, 'T1b', 'a press at the top bar\'s Undo meets Undo (not the veil)', u.found && u.isIt, JSON.stringify(u))
    await press(p, world, dir, ++n, '#undoBtn', 'topbar-undo'); await sleep(400)
    await shot(p, dir, ++n, 'topbar-undo-settled')
    const undone = await lines(p)
    check(world, 'T1', 'Undo with the window open: it stays open, the added line gone from it', (await airUp(p)) && added.length === before.length + 1 && JSON.stringify(undone) === JSON.stringify(before), `lines ${before.length} → ${added.length} → ${undone.length}, window up ${await airUp(p)}`)
    await press(p, world, dir, ++n, '#redoBtn', 'topbar-redo'); await sleep(400)
    await shot(p, dir, ++n, 'topbar-redo-settled')
    check(world, 'T2', 'Redo puts it back, read into the window', (await lines(p)).length === before.length + 1 && (await airUp(p)), `${(await lines(p)).length} lines`)
    await press(p, world, dir, ++n, '#undoBtn', 'topbar-undo-again'); await sleep(300)
    /* typing a line, then Undo — the line put back */
    const bx = p.locator('#airBody [data-airi="0"]')
    if (await bx.count()) {
      if (world === 'D') await bx.click(); else { const b = await bx.boundingBox(); await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2) }
      await sleep(600); await p.keyboard.press('End'); await p.keyboard.type(' X9'); await sleep(200)
      await shot(p, dir, ++n, 'line-typed')
      const typedL = (await lines(p))[0]
      /* a person's press at Undo's middle, whatever its state: on a desktop the line is still being typed, its step not
         yet made (it is saved when the box is left), so Undo is greyed and the press does nothing — older behaviour,
         RECORDED; the box left by Tab, the next press takes the line back. On the phone the tap leaves the box itself. */
      const ub = await p.locator('#undoBtn').boundingBox()
      const greyed = await p.locator('#undoBtn').isDisabled()
      if (world === 'D') await p.mouse.click(ub.x + ub.width / 2, ub.y + ub.height / 2)
      else { await p.touchscreen.tap(ub.x + ub.width / 2, ub.y + ub.height / 2); await sleep(60); await shot(p, dir, ++n, 'undo-typed-line-pressed') }
      await sleep(400); await shot(p, dir, ++n, 'undo-typed-line-settled')
      let l0 = (await lines(p))[0]
      rows.push({ world, id: 'T3r', what: 'RECORDED — Undo pressed while a line is still being typed (greyed at the press)', result: 'RECORDED', seen: `Undo greyed at the press: ${greyed}; after it the line reads "${l0}"` })
      console.log(`RECORDED ${world} T3r — Undo greyed ${greyed}, line "${l0}"`)
      if (world === 'D' && l0 !== before[0]) {
        await p.keyboard.press('Tab'); await sleep(300)
        await p.locator('#undoBtn').click({ timeout: 4000 }); await sleep(400)
        await shot(p, dir, ++n, 'undo-after-tab-settled')
        l0 = (await lines(p))[0]
      }
      check(world, 'T3', 'a line typed and left, then the top bar\'s Undo: the typing taken back, the window open', l0 === before[0] && typedL !== before[0] && (await airUp(p)), `typed "${typedL}", after Undo "${l0}" (was "${before[0]}")`)
    }
    /* any other control of the bar closes the window first, and what it opens is on top */
    await press(p, world, dir, ++n, '#notifyBell', 'bell'); await sleep(400)
    await shot(p, dir, ++n, 'bell-settled')
    const bl = await meets(p, '[data-testid="bell-list"]')
    check(world, 'T4', 'the bell with the Traffic window open: the window closes, the bell\'s list is on top', !(await airUp(p)) && bl.found && bl.isIt, `traffic up ${await airUp(p)}, list ${JSON.stringify(bl)}`)
    await p.mouse.click(5, 300); await sleep(300)
    if (await p.evaluate(() => !!document.querySelector('[data-testid="bell-list"]'))) { await p.keyboard.press('Escape'); await sleep(200) }
    /* a press on the veil still closes it */
    await press(p, world, dir, ++n, weekAir, 'traffic-again'); await sleep(400)
    m = await boxVsBar(p, barSel)
    const vx = 6, vy = m ? Math.min(m.vh - 6, m.boxFoot + 10) : 400
    if (world === 'D') await p.mouse.click(vx, vy); else await p.touchscreen.tap(vx, vy)
    await sleep(300); await shot(p, dir, ++n, 'veil-press')
    check(world, 'T5', 'a press on the veil below the bar still closes the window', !(await airUp(p)), `at ${vx},${vy}: traffic up ${await airUp(p)}`)
    /* a long list on this short screen: the box held below the bar, scrolling inside */
    await press(p, world, dir, ++n, weekAir, 'traffic-long'); await sleep(300)
    for (let i = 0; i < 14; i++) { await p.locator('#airAdd').click(); await sleep(60) }
    await sleep(300); await shot(p, dir, ++n, 'traffic-long-list')
    m = await boxVsBar(p, barSel)
    check(world, 'T6', 'with fifteen lines the box stays below the bar and on the screen', !!m && m.boxTop >= m.barFoot && m.boxFoot <= m.vh, JSON.stringify(m))
    for (let i = 0; i < 14; i++) { await p.locator('#undoBtn').click(); await sleep(60) }
    await sleep(300)
    check(world, 'T6b', 'fourteen presses of Undo with the window open take the fourteen lines back', (await lines(p)).length === before.length && (await airUp(p)), `${(await lines(p)).length} lines (was ${before.length})`)
    await press(p, world, dir, ++n, '#airDone', 'traffic-long-done'); await sleep(300)

    /* over the board: its own Undo; then ✓ Done closes the window and the board */
    await openBoard(p, world, dir, ++n, 0)
    await p.locator('#sbBoard [data-air]:visible').first().scrollIntoViewIfNeeded()
    await press(p, world, dir, ++n, '#sbBoard [data-air]:visible', 'traffic-board'); await sleep(400)
    m = await boxVsBar(p, sbBar)
    await shot(p, dir, ++n, 'traffic-over-board')
    check(world, 'T7a', 'over the board the window opens below the board\'s own bar', !!m && m.boxTop >= m.barFoot && m.boxFoot <= m.vh, JSON.stringify(m))
    const bb = await lines(p)
    await press(p, world, dir, ++n, '#airAdd', 'board-add'); await sleep(300)
    const su = await meets(p, '#sbUndo')
    await press(p, world, dir, ++n, '#sbUndo', 'board-undo'); await sleep(400)
    await shot(p, dir, ++n, 'board-undo-settled')
    check(world, 'T7', 'the board\'s Undo, pressed over the window, takes the line back; the window stays', su.isIt && (await airUp(p)) && JSON.stringify(await lines(p)) === JSON.stringify(bb), `meets ${JSON.stringify(su)}, ${bb.length} → ${(await lines(p)).length}`)
    await press(p, world, dir, ++n, '#sbDone', 'board-done-with-traffic'); await sleep(400)
    await shot(p, dir, ++n, 'board-done-with-traffic-settled')
    check(world, 'T8', '✓ Done with the Traffic window open: the window closes, then the board', !(await airUp(p)) && !(await boardUp(p)), `traffic ${await airUp(p)}, board ${await boardUp(p)}`)

    /* a page tab with the window open (desktop: its tab; the window does not follow to the next page) */
    if (world === 'D') {
      await press(p, world, dir, ++n, weekAir, 'traffic-before-tab'); await sleep(300)
      await press(p, world, dir, ++n, '.nav a[data-page="inputs"]', 'inputs-tab'); await sleep(600)
      await shot(p, dir, ++n, 'inputs-tab-settled')
      check(world, 'T9', 'a page tab with the window open: Inputs opens, the window closed', (await p.evaluate(() => window.CURPAGE)) === 'inputs' && !(await airUp(p)), `page ${await p.evaluate(() => window.CURPAGE)}, traffic ${await airUp(p)}`)
      /* the third page the window opens from (lesson 12): View-only Sched — its tab, the window from a wave; the page
         carries no Undo (it changes nothing, D347), so the bar's bell is what a press must meet */
      await press(p, world, dir, ++n, '.nav a[data-page="viewsched"]', 'viewsched-tab'); await sleep(600)
      await p.locator('#vWeek [data-air]:visible').first().scrollIntoViewIfNeeded()
      await press(p, world, dir, ++n, '#vWeek [data-air]:visible', 'traffic-viewsched'); await sleep(400)
      await shot(p, dir, ++n, 'traffic-viewsched')
      m = await boxVsBar(p, barSel)
      const vu = await meets(p, '#notifyBell')
      check(world, 'T10', 'View-only Sched: the window opens below the top bar, a press at the bell meets the bell', (await airUp(p)) && !!m && m.boxTop >= m.barFoot && vu.found && vu.isIt, `${JSON.stringify(m)} undo ${JSON.stringify(vu)}`)
      await press(p, world, dir, ++n, '#airDone', 'viewsched-done'); await sleep(300)
    }
  } catch (e) {
    check(world, 'X', 'the walk ran to its end', false, String(e && e.message || e).slice(0, 300))
    await shot(p, dir, 99, 'stopped')
  } finally {
    check(world, 'ERR', 'no console error, page error or 4xx', errors.length === 0, errors.length ? errors.slice(0, 5).join(' | ') : 'none')
    await browser.close()
  }
}

for (const w of ['D', 'P', 'PW']) if (!ONLY || ONLY.has(w)) await walk(w)
writeFileSync(resolve(OUT, 'results.json'), JSON.stringify(rows, null, 1))
const bad = rows.filter(r => r.result === 'FAIL')
console.log(`\n${rows.length - bad.length} of ${rows.length} PASS` + (bad.length ? ` — FAIL: ${bad.map(b => b.world + ' ' + b.id).join(', ')}` : ''))
