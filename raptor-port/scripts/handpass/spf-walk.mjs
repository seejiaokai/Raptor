/* THE WALK of the scheduling-on-a-phone batch (18 Oct 26, owner D994; the sheet: docs/handpass/2026-10-18-sched-phone.md).
   Written as assertions of the RIGHT behaviour, so a re-run is the re-walk (docs/bug-check-order.md §5). By touch in a
   phone's own browser (isMobile + hasTouch), by mouse on a desktop. Every step prints what it read; every picture is
   opened by the host.
   Run: SPF_URL=http://localhost:4174 SPF_OUT=<folder> node scripts/handpass/spf-walk.mjs */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const BASE = process.env.SPF_URL || 'http://localhost:4174'
const OUT = process.env.SPF_OUT || resolve(here, '../../docs/img/handpass/2026-10-18-sched-phone/walk')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const sleep = ms => new Promise(r => setTimeout(r, ms))
const errs = [], rows = []
let pics = 0
console.log('spf-walk v3 →', OUT)

function check(id, ok, note) { rows.push({ id, ok: !!ok, note }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id} — ${note}`) }
function notWalked(id, why) { rows.push({ id, ok: null, note: why }); console.log(`NOT WALKED ${id} — ${why}`) }

async function open(viewport, who = 'ad', touch = true) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, isMobile: touch, hasTouch: touch })
  const page = await ctx.newPage()
  const tag = `${viewport.width}x${viewport.height} ${who}`
  page.on('pageerror', e => errs.push(`${tag} pageerror ${e}`))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console ${m.text()}`) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await page.goto(BASE + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await page.waitForSelector('#luser')
  await page.fill('#luser', who); await page.fill('#lpass', who === 'ad' ? 'a' : 'us')
  const go = page.locator('#loginForm button[type=submit]')
  touch ? await go.tap() : await go.click()
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await sleep(600)
  return { ctx, page, press: loc => touch ? loc.tap() : loc.click() }
}
const shot = async (page, name) => { await page.screenshot({ path: join(OUT, name + '.png') }); pics++ }
const goPage = async (page, p) => { await page.evaluate(x => window.go(x), p); await page.waitForFunction(x => window.CURPAGE === x, p); await sleep(450) }
const box = (page, sel) => page.evaluate(s => {
  const e = document.querySelector(s); if (!e) return null
  const r = e.getBoundingClientRect(); if (!r.width) return null
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(r.height / 2, 20))
  return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height), sh: e.scrollHeight, st: Math.round(e.scrollTop), hit: !!hit && (hit === e || e.contains(hit)) }
}, sel)
const WIN = '#inpEditPop:not([hidden]) > .airpop-box'
const scrolls = page => page.evaluate(() => {
  const main = document.querySelector('#schedBoard .sb-main')
  return `${Math.round(document.scrollingElement.scrollTop)}:${main && main.getClientRects().length ? Math.round(main.scrollTop) : '-'}`
})
async function swipe(page, x, y, dy) {
  const c = await page.context().newCDPSession(page)
  const pt = (x, y) => [{ x: Math.round(x), y: Math.round(y), id: 1 }]
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(x, y) })
  for (let i = 1; i <= 10; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(x, y + dy * i / 10) }); await sleep(16) }
  await sleep(90)
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await c.detach().catch(() => {})
  await sleep(700)
}
/* the phone's window rule (D706, D537): as tall as what is in it up to the screen less 24, at the foot, 12 from the sides */
function phoneShape(id, w, vw, vh) {
  if (!w) return check(id, false, 'no window drawn')
  const want = Math.min(w.sh + 2, vh - 24)
  check(id, Math.abs(w.h - want) <= 2 && w.b === vh - 12 && w.t >= 12 && w.l === 12 && w.r === vw - 12,
    `box ${w.l},${w.t} → ${w.r},${w.b} (${w.w}×${w.h}); holds ${w.sh}; want height ${want}, foot ${vh - 12}, sides 12/${vw - 12}`)
}
async function openSchedLine(page, press, onBoard, di = 0, sec = '') {
  await goPage(page, 'editsched')
  if (onBoard) {
    await press(page.locator(`#eWeek [data-sbday="${di}"]:visible`))
    await page.locator('#sbBoard .sb-sec').first().waitFor({ state: 'attached' }); await sleep(400)
    if (!sec && !(await page.locator('#schedBoard .pinp [data-inpedit]:visible').count())) { await press(page.locator(`#schedBoard [data-pitog="${di}"]:visible`)); await sleep(400) }
  }
  const scope = onBoard ? `#schedBoard ${sec || '.pinp'}` : `#eWeek .day[data-day="${di}"] ${sec}`
  const door = page.locator(`${scope} [data-inpedit]:visible`).first()
  if (!(await door.count())) return null
  await door.scrollIntoViewIfNeeded(); await sleep(250)
  const before = await scrolls(page)
  const name = (await door.innerText()).replace(/\s+/g, ' ').trim().slice(0, 40)
  await press(door); await sleep(500)
  return { name, before }
}
const closeWin = async (page, press) => { const x = page.locator('#inpEditClose:visible'); if (await x.count()) { await press(x); await sleep(400) } }

/* ===================== P — a phone, 390 × 844, by touch ===================== */
{
  const { ctx, page, press } = await open({ width: 390, height: 844 })
  /* P1 — Edit Schedule's week: a Personal Inputs line */
  let o = await openSchedLine(page, press, false, 0, '.pinp')
  if (!o) o = await openSchedLine(page, press, false, 0, '')
  if (!o) notWalked('P1', 'no Personal Inputs line on Monday')
  else {
    let w = await box(page, WIN); phoneShape('P1 week line: window shape', w, 390, 844)
    await shot(page, 'P1-week-line-window')
    /* make it tall: "Several people" opens the picker of everyone */
    const sev = page.locator('#inpEditPop [data-testid="pp-several"]:visible')
    if (await sev.count()) {
      await press(sev); await sleep(500)
      w = await box(page, WIN); phoneShape('P1b week line, several people (tall): window shape', w, 390, 844)
      check('P1b runs up to the strip', w && w.t === 12 && w.sh > w.h, `top ${w && w.t}, holds ${w && w.sh} in ${w && w.h}`)
      await shot(page, 'P1b-week-line-tall')
      /* a finger on it: the window moves, the page behind does not */
      const s0 = await scrolls(page)
      await swipe(page, 195, 600, -300); const w1 = await box(page, WIN); const s1 = await scrolls(page)
      check('P1c swipe up inside: the window scrolls', w1.st > 50, `window scroll 0 → ${w1.st}`)
      check('P1c … the page behind does not', s1 === s0, `page ${s0} → ${s1}`)
      for (let i = 0; i < 6; i++) await swipe(page, 195, 600, -300)
      check('P1d at its foot, more swipes: the page still does not move', (await scrolls(page)) === s0, `page ${s0} → ${await scrolls(page)}`)
      const save = await box(page, '#inpEditSave')
      check('P1d at its foot, Save is on screen and a finger meets it', save && save.b <= 832 && save.hit, JSON.stringify(save))
      await shot(page, 'P1d-week-line-foot')
      for (let i = 0; i < 8; i++) await swipe(page, 195, 300, 300)
      check('P1e back past its top: the page still does not move', (await scrolls(page)) === s0, `page ${s0} → ${await scrolls(page)}`)
      /* the dimmed edge above the window is no page to scroll either (a press there closes the window) */
      await swipe(page, 195, 6, 0)
    } else notWalked('P1b', 'no "Several people" switch in the schedule’s window — the tall case is walked at S2 (the board’s Unavailable + Add on a short phone)')
    await closeWin(page, press)
    check('P1f ✕ closes it, and the week stands where it stood', !(await page.locator(WIN).count()) && (await scrolls(page)) === o.before, `page ${o.before} → ${await scrolls(page)}`)
  }
  /* P2 — the week's Unavailable row */
  o = await openSchedLine(page, press, false, 0, '.sec-unav')
  if (!o) notWalked('P2', 'no Unavailable row with an edit door on Monday')
  else { phoneShape(`P2 week Unavailable row (${o.name}): window shape`, await box(page, WIN), 390, 844); await shot(page, 'P2-week-unav-window'); await closeWin(page, press) }
  /* P3 — the Scheduler Board: a Personal Inputs line */
  o = await openSchedLine(page, press, true, 0)
  if (!o) notWalked('P3', 'no Personal Inputs line on the board')
  else {
    phoneShape(`P3 board line (${o.name}): window shape`, await box(page, WIN), 390, 844); await shot(page, 'P3-board-line-window')
    const s0 = await scrolls(page); await swipe(page, 195, 700, -250); await swipe(page, 195, 700, 250)
    check('P3b a finger on it: the board behind does not move', (await scrolls(page)) === s0, `board ${s0} → ${await scrolls(page)}`)
    await closeWin(page, press)
  }
  /* P4 — the board's own adds: Ground Programme "+ Inputs", Unavailable "+ Add", SANS "+ Add" */
  for (const [id, kind, name] of [['P4', 'g', 'Ground Programme + Inputs'], ['P5', 'u', 'Unavailable + Add'], ['P6', 's', 'SANS + Add']]) {
    const add = page.locator(`#schedBoard [data-inpadd="0.${kind}"]:visible`).first()
    if (!(await add.count())) { notWalked(id, `${name}: no button on the board`); continue }
    await add.scrollIntoViewIfNeeded(); await press(add); await sleep(500)
    phoneShape(`${id} board ${name}: the new input's window`, await box(page, WIN), 390, 844)
    await shot(page, `${id}-board-add-${kind}`)
    const cancel = page.locator('#inpEditCancel:visible'); if (await cancel.count()) { await press(cancel); await sleep(350) } else await closeWin(page, press)
    check(`${id}b Cancel closes it`, !(await page.locator(WIN).count()), 'window gone')
  }
  await ctx.close()
}

/* ===================== Q — a weekend Duty from the board's "+ Inputs": the OIL question over the window ===================== */
{
  const { ctx, page, press } = await open({ width: 390, height: 844 })
  await goPage(page, 'editsched')
  await press(page.locator('#eWeek [data-sbday="5"]:visible'))
  await page.locator('#sbBoard .sb-sec').first().waitFor({ state: 'attached' }); await sleep(400)
  const add = page.locator('#schedBoard [data-inpadd="5.g"]:visible').first()
  await add.scrollIntoViewIfNeeded(); await press(add); await sleep(500)
  const types = await page.evaluate(() => [...document.querySelectorAll('#inpEditType option')].map(o => o.value))
  const duty = types.find(t => /duty/i.test(t)) || types[0]
  await page.selectOption('#inpEditType', duty); await sleep(300)
  const own = page.locator('#inpEditOwnTitle'); if (await own.count()) await own.fill('Walk duty')
  const save = page.locator('#inpEditSave')
  await save.scrollIntoViewIfNeeded(); await press(save); await sleep(700)
  const sheet = await box(page, '[data-testid="oilconf"] .airpop-box, .oilconf-pop .airpop-box')
  if (!sheet) notWalked('Q1', `no OIL question after Add (type ${duty} on Saturday) — read: ${await page.evaluate(() => document.getElementById('toastEl')?.innerText || '')}`)
  else {
    check('Q1 the OIL question stands over the window, on the screen, a finger meets it', sheet.hit && sheet.t >= 0 && sheet.b <= 844, JSON.stringify(sheet))
    await shot(page, 'Q1-oil-question-over-window')
    const no = page.locator('[data-testid="oilconf"] button:has-text("No OIL"), .oilconf-pop button:has-text("No OIL")').first()
    if (await no.count()) { await press(no); await sleep(300) }
    const addQ = page.locator('[data-testid="oilconf"] .airpop-foot button, .oilconf-pop .airpop-foot button').filter({ hasText: /^Add$/ }).first()
    if (await addQ.count()) { await press(addQ); await sleep(700) }
    check('Q2 answered: the window and the question are gone', !(await page.locator(WIN).count()), `window ${await page.locator(WIN).count()}`)
  }
  await ctx.close()
}

/* ===================== S — a short phone, 390 × 568 ===================== */
{
  const { ctx, page, press } = await open({ width: 390, height: 568 })
  /* the week's line: short enough to stand at the foot */
  let o = await openSchedLine(page, press, false, 0, '.pinp')
  if (!o) o = await openSchedLine(page, press, false, 0, '')
  if (!o) notWalked('S1', 'no Personal Inputs line')
  else { phoneShape('S1 short phone, week line: window shape', await box(page, WIN), 390, 568); await shot(page, 'S1-short-week-line'); await closeWin(page, press) }
  /* the board's Unavailable "+ Add": taller than the screen — it runs up to the strip and scrolls inside */
  await press(page.locator('#eWeek [data-sbday="0"]:visible'))
  await page.locator('#sbBoard .sb-sec').first().waitFor({ state: 'attached' }); await sleep(400)
  const add = page.locator('#schedBoard [data-inpadd="0.u"]:visible').first()
  await add.scrollIntoViewIfNeeded(); await press(add); await sleep(500)
  let w = await box(page, WIN)
  phoneShape('S2 short phone, board Unavailable + Add (taller than the screen): window shape', w, 390, 568)
  check('S2 runs up to the strip at the top and holds more than it shows', w && w.t === 12 && w.sh > w.h + 20, `top ${w && w.t}, holds ${w && w.sh} in ${w && w.h}`)
  await shot(page, 'S2-short-board-add-u')
  const s0 = await scrolls(page)
  await swipe(page, 195, 420, -250); const w1 = await box(page, WIN)
  check('S3 a finger up on it: the window scrolls', w1.st > 50, `window scroll 0 → ${w1.st}`)
  check('S3 … the board behind does not', (await scrolls(page)) === s0, `board ${s0} → ${await scrolls(page)}`)
  for (let i = 0; i < 6; i++) await swipe(page, 195, 420, -250)
  check('S4 at its foot, more swipes: the board behind still does not move', (await scrolls(page)) === s0, `board ${s0} → ${await scrolls(page)}`)
  const save = await box(page, '#inpEditSave')
  check('S4 at its foot, Add is on screen and a finger meets it', save && save.b <= 556 && save.hit, JSON.stringify(save))
  await shot(page, 'S4-short-board-add-u-foot')
  for (let i = 0; i < 8; i++) await swipe(page, 195, 200, 250)
  w = await box(page, WIN)
  check('S5 back past its top: at its top, the board behind still where it was', w.st === 0 && (await scrolls(page)) === s0, `window ${w.st}, board ${s0} → ${await scrolls(page)}`)
  { const cancel = page.locator('#inpEditCancel:visible'); if (await cancel.count()) { await press(cancel); await sleep(350) } }
  await ctx.close()
}

/* ===================== D — the drawer after an Unavailable hand-over, 390 × 844 ===================== */
for (const onBoard of [false, true]) {
  const { ctx, page, press } = await open({ width: 390, height: 844 })
  const tag = onBoard ? 'board' : 'week'
  await goPage(page, 'editsched')
  if (onBoard) { await press(page.locator('#eWeek [data-sbday="0"]:visible')); await page.locator('#sbBoard .sb-sec').first().waitFor({ state: 'attached' }); await sleep(400) }
  const seatSel = onBoard ? '#schedBoard .unav [data-inpseat]' : '#eWeek .day[data-day="0"] [data-inpseat]'
  const seat = page.locator(`${seatSel}:visible`).first()
  if (!(await seat.count())) { notWalked(`D-${tag}`, 'no Unavailable puck to arm'); await ctx.close(); continue }
  const iid = await seat.getAttribute('data-inpseat')
  const was = await page.evaluate(id => (window.INPUTS.find(i => String(i.iid) === id) || {}).person, iid)
  await seat.scrollIntoViewIfNeeded(); await press(seat); await sleep(500)
  const open1 = await page.evaluate(() => document.body.classList.contains('ros-open'))
  check(`D1 ${tag}: arming the Unavailable row opens the crew drawer`, open1, `ros-open ${open1}`)
  await shot(page, `D1-${tag}-armed-drawer`)
  /* a refusal first: ALL AVAIL is not a man for an Unavailable row — the drawer stays */
  const roster = onBoard ? '#sbRoster' : '#eRoster'
  const ph = page.locator(`${roster} .rpuck[data-person]:visible`).filter({ hasText: /ALL AVAIL/ }).first()
  if (await ph.count()) {
    await ph.scrollIntoViewIfNeeded(); await press(ph); await sleep(500)
    const stay = await page.evaluate(() => document.body.classList.contains('ros-open'))
    check(`D2 ${tag}: a refused hand-over (ALL AVAIL) leaves the drawer up`, stay, `ros-open ${stay}; note "${await page.evaluate(() => document.getElementById('toastEl')?.innerText || '')}"`)
    if (!(await page.evaluate(() => !!window.ARM))) {
      const tab = page.locator('.ros-tab:visible').first(); if (await tab.count()) { await press(tab); await sleep(400) }
      await seat.scrollIntoViewIfNeeded(); await press(seat); await sleep(500)
    }
    check(`D2b ${tag}: armed again`, await page.evaluate(() => !!window.ARM), `ARM ${await page.evaluate(() => window.ARM && window.ARM.key)}`)
  } else notWalked(`D2 ${tag}`, 'ALL AVAIL not offered in the drawer')
  const cand = page.locator(`${roster} .rpuck[data-person]:visible`)
  const n = await cand.count()
  let pid = null
  for (let i = 0; i < n; i++) { const p = await cand.nth(i).getAttribute('data-person'); if (p && p !== was && !(await page.evaluate(id => window.PEOPLE[id]?.special, p))) { pid = p; await cand.nth(i).scrollIntoViewIfNeeded(); await press(cand.nth(i)); break } }
  await sleep(700)
  const now = await page.evaluate(id => (window.INPUTS.find(i => String(i.iid) === id) || {}).person, iid)
  const parked = await page.evaluate(() => !document.body.classList.contains('ros-open'))
  check(`D3 ${tag}: the hand-over is made`, now === pid, `${was} → ${now} (tapped ${pid})`)
  check(`D3 ${tag}: and the drawer is put away`, parked, `ros-open ${!parked}`)
  await shot(page, `D3-${tag}-handed-over`)
  /* the board covers the app's top bar with its own, whose Undo is #sbUndo */
  const undo = await box(page, onBoard ? '#sbUndo' : '#undoBtn')
  check(`D4 ${tag}: a finger on the top bar's Undo meets Undo (${onBoard ? 'the board’s own' : 'the page’s'})`, undo && undo.hit, JSON.stringify(undo))
  if (undo) { await page.mouse.click(undo.l + undo.w / 2, undo.t + 10); await sleep(700) }
  const back = await page.evaluate(id => (window.INPUTS.find(i => String(i.iid) === id) || {}).person, iid)
  check(`D5 ${tag}: Undo gives the row back`, back === was, `${now} → ${back}`)
  await ctx.close()
}

/* ===================== M — a member's own input on View-only Sched (a door to the same window?) ===================== */
{
  const { ctx, page, press } = await open({ width: 390, height: 844 }, 'us')
  await goPage(page, 'viewsched')
  const door = page.locator('#vWeek [data-inpedit]:visible').first()
  if (!(await door.count())) notWalked('M1', 'View-only Sched draws no input-window door for a member (the window opens from Edit Schedule, the board and the Inputs page)')
  else { await door.scrollIntoViewIfNeeded(); await press(door); await sleep(500); phoneShape('M1 member, View-only: window shape', await box(page, WIN), 390, 844); await shot(page, 'M1-member-view-window'); await closeWin(page, press) }
  await ctx.close()
}

/* ===================== F — the windows that share the finger guard (the Inputs page), 390 × 600 ===================== */
{
  const { ctx, page, press } = await open({ width: 390, height: 600 })
  await goPage(page, 'inputs')
  if (await page.locator('#inListBtn[aria-pressed="true"]').count()) { await press(page.locator('#inCalBtn')); await sleep(400) }
  const day = page.locator('[data-icday]:visible').nth(10)
  if (await day.count()) {
    await press(day); await sleep(600)
    const win = await box(page, '.floatwin:not([hidden])')
    if (win) {
      const s0 = await scrolls(page)
      await swipe(page, 195, win.t + 80, -250); await swipe(page, 195, win.t + 80, 250)
      check('F1 an Inputs day window: a finger on it never scrolls the page behind', (await scrolls(page)) === s0, `page ${s0} → ${await scrolls(page)}`)
      await shot(page, 'F1-inputs-day-window')
      const x = page.locator('.floatwin .win-x:visible').first(); if (await x.count()) { await press(x); await sleep(400) }
    } else notWalked('F1', 'no day window opened')
  } else notWalked('F1', 'no day cell found')
  if (await page.locator('#inListBtn[aria-pressed="false"]').count()) { await press(page.locator('#inListBtn')); await sleep(400) }
  await press(page.locator('#inNew')); await sleep(600)
  const w = await box(page, '[data-testid="win-inputedit"]')
  const s0 = await scrolls(page)
  await swipe(page, 195, w.t + w.h * 0.6, -260); await swipe(page, 195, w.t + w.h * 0.6, -260)
  const body = await page.evaluate(() => document.querySelector('[data-testid="win-inputedit"] .win-body').scrollTop)
  check('F2 the Inputs page\'s "+ Input" window: the form scrolls, the page behind does not', body > 20 && (await scrolls(page)) === s0, `form ${body}, page ${s0} → ${await scrolls(page)}`)
  await shot(page, 'F2-inputs-new-window')
  await ctx.close()
}

/* ===================== L — a phone on its side, 844 × 390 ===================== */
{
  const { ctx, page, press } = await open({ width: 844, height: 390 })
  await goPage(page, 'inputs')
  if (await page.locator('#inListBtn[aria-pressed="false"]').count()) { await press(page.locator('#inListBtn')); await sleep(400) }
  const wid = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, wrap: document.querySelector('.inwrap').scrollWidth, wrapW: document.querySelector('.inwrap').clientWidth }))
  check('L1 the Inputs list keeps the page 844 wide; the table scrolls in its own box', wid.doc <= 844 && wid.wrap > wid.wrapW, JSON.stringify(wid))
  await shot(page, 'L1-side-inputs-list')
  /* the table moves sideways under a finger */
  const tb = await box(page, '.inwrap')
  const c = await page.context().newCDPSession(page)
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 600, y: tb.t + 60, id: 1 }] })
  for (let i = 1; i <= 10; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 600 - 20 * i, y: tb.t + 60, id: 1 }] }); await sleep(16) }
  await sleep(90); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await c.detach(); await sleep(600)
  const sl = await page.evaluate(() => document.querySelector('.inwrap').scrollLeft)
  check('L2 a finger moves the table sideways to its last column', sl > 20, `scrollLeft ${sl}`)
  await shot(page, 'L2-side-inputs-list-panned')
  await press(page.locator('#inNew')); await sleep(600)
  const w = await box(page, '[data-testid="win-inputedit"]'), sv = await box(page, '#inpEditSave'), cn = await box(page, '#inpEditCancel'), x = await box(page, '[data-testid="win-inputedit-x"]')
  check('L3 "+ Input" opens on the screen; Add, Cancel and ✕ are on it and a finger meets each', w.r <= 844 && sv.r <= 844 && sv.hit && cn.hit && x.hit, `window ${w.l}→${w.r}; Add ${sv.l}→${sv.r} ${sv.hit}; Cancel ${cn.hit}; ✕ ${x.hit}`)
  await shot(page, 'L3-side-plus-input')
  await press(page.locator('#inpEditCancel')); await sleep(400)
  /* Edit Schedule here takes the desktop layout (wider than 620): the schedule's window keeps its centred shape */
  const o = (await openSchedLine(page, press, false, 0, '.pinp')) || (await openSchedLine(page, press, false, 0, ''))
  if (o) {
    const ww = await box(page, WIN)
    check('L4 Edit Schedule at 844 × 390: the input window is the desktop dialog, centred, inside the screen', ww && ww.t >= 0 && ww.b <= 390 && Math.abs((ww.l + ww.r) / 2 - 422) <= 2, JSON.stringify(ww))
    await shot(page, 'L4-side-week-line-window')
    await closeWin(page, press)
  } else notWalked('L4', 'no Personal Inputs line at this size')
  await ctx.close()
}

/* ===================== T — a tablet, 700 × 1000, and K — a desktop, 1440 × 900, by mouse: as they were ===================== */
for (const [id, vp, touch] of [['T', { width: 700, height: 1000 }, true], ['K', { width: 1440, height: 900 }, false]]) {
  const { ctx, page, press } = await open(vp, 'ad', touch)
  const o = (await openSchedLine(page, press, false, 0, '.pinp')) || (await openSchedLine(page, press, false, 0, ''))
  if (o) {
    const w = await box(page, WIN)
    const cap = Math.round(vp.height * 0.8)
    check(`${id}1 ${vp.width}×${vp.height}: the schedule's input window is the centred dialog as before (80% cap ${cap})`, w && Math.abs((w.l + w.r) / 2 - vp.width / 2) <= 2 && Math.abs((w.t + w.b) / 2 - vp.height / 2) <= 2 && w.h <= cap + 1, JSON.stringify(w))
    await shot(page, `${id}1-week-line-window`)
    await closeWin(page, press)
  } else notWalked(`${id}1`, 'no Personal Inputs line')
  await goPage(page, 'inputs')
  if (await page.locator('#inListBtn[aria-pressed="false"]').count()) { await press(page.locator('#inListBtn')); await sleep(400) }
  const wid = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, inner: innerWidth, wrap: document.querySelector('.inwrap').scrollWidth, wrapW: document.querySelector('.inwrap').clientWidth, wrapH: document.querySelector('.inwrap').offsetHeight - document.querySelector('.inwrap').clientHeight }))
  check(`${id}2 the Inputs list: no sideways scroll of the page${id === 'K' ? ', none in the table, and no scroll bar drawn' : ''}`, wid.doc <= vp.width && (id !== 'K' || (wid.wrap <= wid.wrapW && wid.wrapH === 0)), JSON.stringify(wid))
  await shot(page, `${id}2-inputs-list`)
  await ctx.close()
}

writeFileSync(join(OUT, 'results.json'), JSON.stringify({ rows, errs, pics }, null, 1))
const fail = rows.filter(r => r.ok === false).length, nw = rows.filter(r => r.ok === null).length
console.log(`\n${rows.length - fail - nw} PASS · ${fail} FAIL · ${nw} NOT WALKED · ${pics} pictures`)
console.log('errors', JSON.stringify(errs))
await browser.close()
