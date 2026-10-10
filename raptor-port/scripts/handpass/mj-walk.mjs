/* `main` BROUGHT INTO claude/day-window-compact (10 Oct 26) — THE SHORT WALK OF WHAT ONLY THE TWO TOGETHER DRAW.
   `main` brought [HIST-JUMP-EMPTY-SEAT]: in the changes window a tap on a change whose seat is empty now lands on its
   row. This branch changed how one kind of row is drawn — a row that came from an input with a title of its own
   carries its kind, small, beside its name (D717), on the board inside a wrapper round the name. Each was walked
   alone; nobody had tapped a change of such a row. This does, on the real built app: an Event titled "Sports day" is
   filed through the Inputs calendar's own window, a second man is put on its row and taken off again on the board,
   and the line of that change is pressed AT A POINT on the Scheduler Board, Edit Schedule and View-only Sched — a
   desktop at the owner's 125% and a phone by touch. A PASS is the right behaviour, so running it again is the re-walk.
   (`main`'s own walk, scripts/handpass/hj-walk.mjs, was run again whole on the same build beside this.)

   HP_URL=http://localhost:4190 HP_SHOTS=<folder> node scripts/handpass/mj-walk.mjs */
import { existsSync, mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'
import { BASE, SHOTS, login, go, board, put } from './lib.mjs'
import { openNew, saveWin, closeWins } from './it-B-lib.mjs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
mkdirSync(SHOTS + '/_work', { recursive: true })
const STATE = SHOTS + '/_work/state.json'
const DI = 0, ISO = '2026-07-13', EMPTY = 'That seat is empty now'
const SIZES = {
  desk: { viewport: { width: 1152, height: 720 }, deviceScaleFactor: 1.25 },
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
}
const browser = await chromium.launch({ headless: true, ...launchOptions })
const errors = []
async function world(size, state = null) {
  const ctx = await browser.newContext({ ...SIZES[size], ...(state ? { storageState: state } : {}) })
  const page = await ctx.newPage()
  page.on('console', m => { if (m.type() === 'error') errors.push(`[${size}] ` + m.text()) })
  page.on('pageerror', e => errors.push(`[${size}] PAGEERROR ` + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push(`[${size}] HTTP ${r.status()} ${r.url()}`) })
  await page.goto(BASE + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await login(page, 'a')
  return { ctx, page, size }
}
const rows = []
async function step(id, what, expect, fn) {
  let got = '', ok = false
  try { got = await fn(); ok = true } catch (e) { got = 'FAIL — ' + String(e && e.message || e).split('\n')[0] }
  rows.push({ id, what, expect, got, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${what}\n        ${got}`)
}
const must = (cond, msg) => { if (!cond) throw new Error(msg) }

async function closeWin(page) {
  const x = page.locator('.chgwin:visible button', { hasText: '✕' }).first()
  if (await x.count()) { await x.click(); await page.waitForTimeout(250) }
}
async function doneBoard(page) {
  await closeWin(page)
  if (await page.evaluate(() => window.SBDAY == null)) return
  await page.locator('#schedBoard #sbDone:visible').first().click()
  await page.waitForTimeout(500)
  must(await page.evaluate(() => window.SBDAY == null), 'the board did not close')
}
async function openWin(page, how) {
  if (!(await page.locator('.chgwin:visible').count())) {
    if (how === 'board') await page.locator('#schedBoard #sbHist:visible').first().click()
    else if (how === 'week') await page.locator('#histBtn:visible').first().click()
    else await page.locator(how).first().click()
    await page.waitForSelector('.chgwin:visible')
  }
  const all = page.locator('.chgwin .win-tab:visible', { hasText: 'All changes' })
  if (await all.count()) await all.first().click()
  const mon = page.locator('.chgwin .cw-day:visible', { hasText: /^Mon/ })
  if (await mon.count()) await mon.first().click()
  await page.waitForTimeout(250)
}
const noteShown = page => page.evaluate(() => { const t = document.getElementById('toastEl'); return !!t && +getComputedStyle(t).opacity > 0.05 })
/* press the line of place `pos` at a point (hj-walk.mjs pressLine, the All changes tab only) and read what a person sees */
async function pressLine(page, size, pos, name) {
  const show = page.locator('.cw-show:visible').first()
  if (await show.count()) { const b = await show.boundingBox(); if (SIZES[size].hasTouch) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(350) }
  const idx = await page.evaluate(p => [...document.querySelectorAll('.chgwin .cw-l')].filter(e => e.offsetParent)
    .findIndex(e => e.dataset.cwkey && (e.dataset.cwkey === p || window.posKey(e.dataset.cwkey) === p)), pos)
  must(idx >= 0, `no line for ${pos} in the window`)
  const pt = await page.evaluate(i => {
    const el = [...document.querySelectorAll('.chgwin .cw-l')].filter(e => e.offsetParent)[i]
    let sc = el.parentElement
    while (sc && !(sc.scrollHeight > sc.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(sc).overflowY))) sc = sc.parentElement
    if (sc) { const a = el.getBoundingClientRect(), b = sc.getBoundingClientRect(); if (a.top < b.top || a.bottom > b.bottom) sc.scrollTop += a.top - b.top - (b.height - a.height) / 2 }
    const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2
    const hit = document.elementFromPoint(x, y)
    return { x, y, hit: !!hit && (hit === el || el.contains(hit)), text: (el.textContent || '').replace(/\s+/g, ' ').trim() }
  }, idx)
  must(pt.hit, `the point of the line is covered by something else: "${pt.text}"`)
  for (let i = 0; i < 40; i++) { if (!(await noteShown(page))) break; await page.waitForTimeout(150) }
  if (SIZES[size].hasTouch) await page.touchscreen.tap(pt.x, pt.y); else await page.mouse.click(pt.x, pt.y)
  await page.waitForTimeout(300)
  for (let i = 0, last = ''; i < 8; i++) {
    const at = await page.evaluate(() => { const e = document.querySelector('.chgflash'); if (!e) return 'none'; const r = e.getBoundingClientRect(); return Math.round(r.left) + ',' + Math.round(r.top) })
    if (at === last) break
    last = at; await page.waitForTimeout(110)
  }
  const seen = await page.evaluate(() => {
    const t = document.getElementById('toastEl')
    const said = t && +getComputedStyle(t).opacity > 0.4 ? t.textContent : ''
    const el = document.querySelector('.chgflash')
    if (!el) return { toast: said, lit: null }
    const r = el.getBoundingClientRect(), vw = innerWidth, vh = innerHeight
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2, hit = document.elementFromPoint(cx, cy)
    const win = document.querySelector('.chgwin'), wr = win && win.offsetParent ? win.getBoundingClientRect() : null
    const row = el.closest('.sb-arow,.pl-row,.ah-row,.sb-line,.form')
    /* the small kind beside the row's name — this branch's own drawing (D717): there, with a size, and not covered */
    const kind = row && [...row.querySelectorAll('.nm-kind')].find(e => e.offsetParent)
    const kr = kind && kind.getBoundingClientRect(), kh = kr && document.elementFromPoint(kr.left + kr.width / 2, kr.top + kr.height / 2)
    return {
      toast: said,
      lit: {
        fill: el.dataset.fill || '', cls: el.className, w: Math.round(r.width), h: Math.round(r.height),
        inView: r.top >= 0 && r.left >= 0 && r.bottom <= vh && r.right <= vw,
        onTop: !!hit && (hit === el || el.contains(hit) || hit.contains(el)),
        underWin: !!wr && !(r.right <= wr.left || r.left >= wr.right || r.bottom <= wr.top || r.top >= wr.bottom),
        rowText: row ? (row.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 70) : '',
        kind: kind ? (kind.textContent || '').trim() : '', kindSeen: !!kr && kr.width > 4 && kr.height > 4 && !!kh && (kh === kind || kind.contains(kh)),
      },
    }
  })
  if (name) await page.screenshot({ path: `${SHOTS}/${name}.png` })
  await page.waitForTimeout(1500)
  return { ...seen, text: pt.text }
}
function seenOK(s, fill) {
  must((s.toast || '') === EMPTY, `it said "${s.toast}", expected "${EMPTY}"`)
  must(s.lit, 'nothing on the page was marked')
  if (fill) must(s.lit.fill === fill, `the mark is on ${s.lit.fill || s.lit.cls}, expected the people box ${fill}`)
  must(/SPORTS DAY/i.test(s.lit.rowText), `the marked place is not on the SPORTS DAY row: "${s.lit.rowText}"`)
  must(s.lit.inView, 'the marked place is off the screen')
  must(!s.lit.underWin, 'the marked place is under the changes window')
  must(s.lit.onTop, 'something is drawn over the marked place')
  must(s.lit.w > 8 && s.lit.h > 8, `the marked place has no size (${s.lit.w} × ${s.lit.h})`)
  must(/^event$/i.test(s.lit.kind) && s.lit.kindSeen, `the row's small kind is not in plain sight beside its name: ${JSON.stringify({ kind: s.lit.kind, seen: s.lit.kindSeen })}`)
  return `"${s.text.slice(0, 70)}" → said "${s.toast}"; marked ${s.lit.fill ? 'the people box of' : 'the people of'} "${s.lit.rowText}" (${s.lit.w} × ${s.lit.h}, on screen, clear of the window); the kind "${s.lit.kind}" still in sight beside the name`
}

/* ================= THE FIXTURE — through the app's own controls, on a desktop ================= */
let SEAT = '', FILL = ''
{
  const { ctx, page } = await world('desk')
  await step('F1', 'Inputs calendar, Monday: file an Event titled "Sports day" through the input\'s own window', 'a row SPORTS DAY stands on Monday\'s ground programme, made from the input', async () => {
    /* the input's own window, field by field (it-B-lib's fileInput names the title box as it was before D716's build) */
    const W = { page, mobile: false }
    await openNew(W, ISO)
    await page.selectOption('#inpEditType', 'Event')
    await page.fill('#inpEditOwnTitle', 'Sports day')
    if (await page.isChecked('#inpEditAllday')) await page.uncheck('#inpEditAllday')
    await page.fill('#inpEditStart', '09:00', { timeout: 3000 }); await page.fill('#inpEditEnd', '10:00', { timeout: 3000 })
    await page.screenshot({ path: `${SHOTS}/f1-input-window.png` })
    await saveWin(W, 'no'); await closeWins(page)
    const ri = await page.evaluate(d => window.DAYS[d].ground.findIndex(g => /^sports day$/i.test(String(g.prog || '')) && g.src), DI)
    must(ri >= 0, 'no SPORTS DAY row on Monday\'s ground programme: ' + JSON.stringify(await page.evaluate(d => window.DAYS[d].ground.map(g => g.prog), DI)))
    FILL = `g:${DI}.${ri}.+`
    return `row ${ri} of the ground programme, its people box ${FILL}`
  })
  await step('F2', 'Scheduler Board, Monday: put a second man on the SPORTS DAY row by its "+ add" box', 'he stands on the row', async () => {
    must(FILL, 'no row to add to')
    await board(page, DI)
    const on = await page.evaluate(k => window.slotVal(k), FILL.replace(/\.\+$/, ''))
    const prefs = await page.evaluate(o => Object.keys(window.PEOPLE).filter(id => id !== o), on)
    const who = await put(page, `[data-fill="${FILL}"]`, prefs)
    must(!/^FAILED/.test(who), who)
    SEAT = await page.evaluate(([row, w]) => { const e = [...document.querySelectorAll('#schedBoard [data-slot]')].find(e => e.offsetParent && e.dataset.slot.startsWith(row) && (e.dataset.person === w || e.querySelector(`[data-person="${w}"]`))); return e ? e.dataset.slot : '' }, [FILL.replace(/\+$/, ''), who])
    must(SEAT, 'his seat on the row was not found')
    return `${await page.evaluate(i => window.PEOPLE[i].cs, who)} at ${SEAT}`
  })
  await step('F3', 'Scheduler Board: take him off again (a right-click on his puck)', 'the seat is empty; the row and its first man stand', async () => {
    must(SEAT, 'no seat to empty')
    const el = page.locator(`#schedBoard [data-slot="${SEAT}"]:visible`).first()
    await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await el.click({ button: 'right' }); await page.waitForTimeout(400)
    const now = await page.evaluate(k => window.slotVal(k), SEAT)
    must(!now, 'he is still there: ' + now)
    await page.screenshot({ path: `${SHOTS}/f3-board-seat-emptied.png` })
    return 'the seat is empty'
  })
  /* ---- the desktop, the three pages ---- */
  await step('D1', 'Desktop (125%), Scheduler Board: press the line of the man taken off SPORTS DAY', `lands on the row's people box, says "${EMPTY}", the kind still in sight`, async () => {
    await openWin(page, 'board')
    return seenOK(await pressLine(page, 'desk', SEAT, 'd1-board-sports-day'), FILL)
  })
  await step('D2', 'Desktop, Edit Schedule: the same line', `lands on the row's people box, says "${EMPTY}", the kind still in sight`, async () => {
    await doneBoard(page); await go(page, 'editsched'); await page.waitForTimeout(300)
    await openWin(page, 'week')
    return seenOK(await pressLine(page, 'desk', SEAT, 'd2-week-sports-day'), FILL)
  })
  await step('D3', 'Desktop, View-only Sched: the same line, from Monday\'s own count', `lands on the people of the row (no box to add to there), says "${EMPTY}", the kind still in sight`, async () => {
    await closeWin(page); await go(page, 'viewsched')
    const door = '#vWeek .day[data-day="0"] [data-pendlist]:visible, #vWeek .day[data-day="0"] [data-chgtab]:visible'
    must(await page.locator(door).count(), 'Monday shows no count to open the changes window from on View-only Sched')
    await openWin(page, door)
    return seenOK(await pressLine(page, 'desk', SEAT, 'd3-view-sports-day'), '')
  })
  await closeWin(page)
  await ctx.storageState({ path: STATE })
  await ctx.close()
}
/* ================= THE PHONE — the same world, by touch ================= */
{
  const { ctx, page } = await world('phone', STATE)
  await step('P0', 'Phone: the saved world is the one made on the desktop', 'the SPORTS DAY row and its emptied seat are there', async () => {
    const ok = await page.evaluate(([d, k]) => window.DAYS[d].ground.some(g => /^sports day$/i.test(String(g.prog || ''))) && !window.slotVal(k), [DI, SEAT])
    must(ok, 'the phone opened a different world — the row or the emptied seat is not in it')
    return 'the same world'
  })
  await step('P1', 'Phone, Edit Schedule: a finger on the same line', `lands on the row's people box, says "${EMPTY}", the kind still in sight`, async () => {
    await go(page, 'editsched'); await page.waitForTimeout(400)
    await openWin(page, 'week')
    return seenOK(await pressLine(page, 'phone', SEAT, 'p1-week-sports-day'), FILL)
  })
  await step('P2', 'Phone, Scheduler Board: a finger on the same line', `lands on the row's people box, says "${EMPTY}", the kind still in sight`, async () => {
    await closeWin(page)
    await board(page, DI)
    await openWin(page, 'board')
    return seenOK(await pressLine(page, 'phone', SEAT, 'p2-board-sports-day'), FILL)
  })
  await ctx.close()
}
await browser.close()
const bad = rows.filter(r => !r.ok).length
console.log(`\n${rows.length - bad} of ${rows.length} steps PASS` + (errors.length ? `\nconsole / page / network errors: ${errors.length}\n` + [...new Set(errors)].slice(0, 12).join('\n') : '\nno console, page or network error'))
process.exit(bad ? 1 : 0)
