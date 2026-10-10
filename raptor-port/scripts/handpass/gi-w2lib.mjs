// [GROUP-INPUT-ONE-ROW] W2 walker helpers: phone 390x844, touch, own browser context (NOT ?fresh=1).
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, appendFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileInput, press, csId } from './gi-lib.mjs'
import { WIN } from './gi-lib.mjs'
export { fileInput, press, csId, WIN }

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const BASE = 'http://localhost:4180/'
export const OUT = 'docs/img/handpass/2026-10-11-group-input-one-row/w2'
mkdirSync(OUT, { recursive: true })
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const errs = []
export const log = (...a) => { const s = a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '); console.log(s); try { appendFileSync('docs/handpass/parts/gi-w2.log', s + '\n') } catch {} }
mkdirSync('docs/handpass/parts', { recursive: true })
export const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})

export async function signIn(page, who, pass) {
  await page.waitForSelector('#loginForm, #vWeek .day', { timeout: 15000 })
  if (await page.locator('#loginForm').count() && await page.locator('#luser').isVisible().catch(() => false)) {
    await page.fill('#luser', who); await page.fill('#lpass', pass)
    await page.locator('#loginForm button[type=submit]').tap()
  }
  await page.waitForSelector('#vWeek .day', { timeout: 15000 })
}
export async function open({ clock, who = 'ad', pass = 'a', ctx: given } = {}) {
  const ctx = given || await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  if (clock) await page.clock.setFixedTime(new Date(clock))
  const tag = 'W2 ' + who
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 240)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 240)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await page.goto(BASE)
  await signIn(page, who, pass)
  return { ctx, page }
}
export const shot = async (p, name) => { await p.screenshot({ path: join(OUT, name + '.png') }); log('saved ' + name); return name + '.png' }

export async function touchDrag(page, from, to, { hold = 450, steps = 12, settle = 350, extra = [] } = {}) {
  const c = await page.context().newCDPSession(page)
  const pt = (x, y) => [{ x: Math.round(x), y: Math.round(y), id: 1 }]
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(from.x, from.y) })
  await sleep(hold)
  // tiny first move
  await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(from.x + 2, from.y + 2) }); await sleep(60)
  for (let i = 1; i <= steps; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(from.x + (to.x - from.x) * i / steps, from.y + (to.y - from.y) * i / steps) }); await sleep(25) }
  await sleep(250)
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await c.detach().catch(() => {})
  await sleep(settle)
}
export const centre = async loc => { const b = await loc.boundingBox(); return b ? { x: b.x + b.width / 2, y: b.y + b.height / 2, b } : null }
export const toast = p => p.evaluate(() => (document.getElementById('toastEl')?.innerText || '').trim())
export const inputsOf = (p, title) => p.evaluate(t => window.INPUTS.filter(r => !t || r.title === t).map(r => ({ iid: r.iid, cs: window.PEOPLE[r.person]?.cs, type: r.type, title: r.title, date: r.date, s: r.s, e: r.e, rmk: r.remarks, grp: r.grp || null, acc: r.acc || null, oil: r.oil ?? null })), title)

export async function fileFixture(page, { s1 = true, g4 = true, sat = false } = {}) {
  const out = {}
  if (s1) out.s1 = await fileInput(page, { type: 'Training', person: 'Anvil', from: '2026-07-15', to: '2026-07-15', timed: ['10:00', '11:00'] }, true)
  if (sat) out.sat = await fileInput(page, { type: 'Duty', people: ['Drifter', 'Ranger'], from: '2026-07-18', to: '2026-07-18', timed: ['09:00', '12:00'], title: 'Range duty', oil: 'yes' }, true)
  if (g4) out.g4 = await fileInput(page, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger', 'Tally'], from: '2026-07-15', to: '2026-07-15', timed: ['14:00', '15:00'], title: 'Range safety brief' }, true)
  return out
}

export const DI = 2
export const TITLE = 'Range safety brief'
export const toWeekSec = (p, key, di = DI) => p.evaluate(([di, key]) => {
  const day = [...document.querySelectorAll('#page-editsched .day:not(.peek)')][di]
  day.scrollIntoView({ inline: 'start', block: 'nearest' })
  const sec = day.querySelector(`[data-secmove="${di}.${key}"]`)
  const y = sec.getBoundingClientRect().top + window.scrollY - 96
  window.scrollTo(0, Math.max(0, y))
}, [di, key])
export const toBoardSec = (p, key, di = DI) => p.evaluate(([di, key]) => {
  const sec = document.querySelector(`#schedBoard [data-secmove="${di}.${key}"]`)
  sec.scrollIntoView({ block: 'start' })
  for (let n = sec.parentElement; n; n = n.parentElement) if (n.scrollHeight > n.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(n).overflowY)) { n.scrollTop -= 10; break }
}, [di, key])
export const readRows = (p, title = TITLE) => p.evaluate(title => {
  const norm = s => (s || '').trim().toLowerCase()
  const names = r => [...r.querySelectorAll('.ppl .puck .nm')].map(n => n.textContent.trim())
  const pick = (sel, name) => [...document.querySelectorAll(sel)].filter(r => norm(name(r)) === title).map(names)
  return {
    weekGround: pick('#page-editsched .day:not(.peek) .sec-grnd .pl-row', r => r.querySelector('.nm .ntx')?.textContent),
    weekInputs: pick('#page-editsched .day:not(.peek) .sec-inp .pl-row', r => r.querySelector('.nm .ntx')?.textContent),
    boardGround: pick('#schedBoard .sb-panel.grnd .sb-arow', r => r.querySelector('textarea.ain, input.ain')?.value),
    boardInputs: pick('#schedBoard .sb-panel.pinp .sb-arow.inprow', r => r.querySelector('.inpedit')?.textContent),
  }
}, title.toLowerCase())
export const hideToast = p => p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.display = 'none' })
export async function goWeek(page) { await page.evaluate(() => window.closeScheduler && window.closeScheduler()); await page.evaluate(() => window.go('editsched')); await sleep(600) }
export async function goBoard(page, di = DI) { if (!(await page.locator('#schedBoard .sb-panel').count())) { await page.evaluate(() => window.go('editsched')); await sleep(700) } await page.evaluate(di => window.openScheduler(di), di); await sleep(900) }

/* the crew drawer: open it (board or week) and return the locator of a visible name */
export async function openDrawer(page, board = true) {
  const tab = page.locator(board ? '.sb-ros .ros-tab' : '#rosTab')
  await tab.tap(); await sleep(700)
}
export async function drawerName(page, cs, board = true) {
  const id = await csId(page, cs)
  const loc = page.locator(`${board ? '#sbRoster' : '#eRoster'} .rpuck .puck[data-person="${id}"]`)
  const n = await loc.count()
  for (let i = 0; i < n; i++) { const b = await loc.nth(i).boundingBox(); if (b && b.x >= 0 && b.x < 390 && b.y >= 120 && b.y < 780 && b.width > 0) return loc.nth(i) }
  if (n) { await loc.first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300); const b = await loc.first().boundingBox(); if (b && b.x >= 0 && b.x < 390 && b.y >= 0 && b.y < 844) return loc.first() }
  return null
}

/* the top bar's own pair: the board has its own (#sbUndo / #sbRedo); the week uses #undoBtn / #redoBtn */
export async function barBtn(page, which) {
  const boardOpen = await page.locator(`#sb${which === 'undo' ? 'Undo' : 'Redo'}`).isVisible().catch(() => false)
  return page.locator(boardOpen ? (which === 'undo' ? '#sbUndo' : '#sbRedo') : (which === 'undo' ? '#undoBtn' : '#redoBtn'))
}
export async function pressBar(page, which) {
  await closeDrawerIfOpen(page)
  const b = await barBtn(page, which)
  const title = await b.getAttribute('title'); const dis = await b.isDisabled()
  if (!dis) { await b.tap(); await sleep(700) }
  return { title, wasDisabled: dis }
}
export async function unfoldBoard(page) {
  const t = page.locator(`#schedBoard [data-pitog="${DI}"]`).first()
  if (await t.count() && /show/.test(await t.innerText())) { await t.tap(); await sleep(400) }
}
export async function unfoldWeek(page, di = DI) {
  const t = page.locator(`#page-editsched .day:not(.peek) [data-pitog="${di}"]`).first()
  if (await t.count() && /show/.test(await t.innerText())) { await t.tap(); await sleep(400) }
}
export async function reloadAndBack(page, who = 'ad', pass = 'a') {
  await page.reload(); await sleep(500)
  await signIn(page, who, pass); await sleep(500)
}
/* what a surface holds for the shared input: the records, and each row's pucks */
export async function stateOf(page, title = TITLE) {
  return { recs: (await inputsOf(page, title)).map(r => `${r.cs}${r.s != null ? ' ' + r.s + '-' + r.e : ''}${r.rmk ? ' [' + r.rmk + ']' : ''}${r.acc ? ' acc=' + r.acc : ' acc=none'}`).sort(), rows: await readRows(page, title) }
}
/* every scenario's end: Undo once, Redo, reload — what came back each time */
export async function ender(page, label, goBack, title = TITLE) {
  const out = {}
  const u = await pressBar(page, 'undo'); out.undo = { btn: u, toast: await toast(page), state: await stateOf(page, title) }
  await shot(page, `${label}-undo`)
  const r = await pressBar(page, 'redo'); out.redo = { btn: r, toast: await toast(page), state: await stateOf(page, title) }
  await shot(page, `${label}-redo`)
  await reloadAndBack(page); await goBack(); out.reload = { state: await stateOf(page, title) }
  await shot(page, `${label}-reload`)
  return out
}
export const result = (n, o) => log('RESULT S' + n + ' ' + JSON.stringify(o))
export async function closeDrawerIfOpen(page) {
  for (const sel of ['.sb-ros .ros-tab', '#rosTab']) {
    const t = page.locator(sel).first()
    if (!(await t.isVisible().catch(() => false))) continue
    const open = await page.evaluate(() => { const b = document.querySelector('#undoBtn, #sbUndo'); return false })
    // a drawer is open when the top bar's Undo is covered by something that is not it
    const covered = await page.evaluate(() => { for (const id of ['sbUndo', 'undoBtn']) { const b = document.getElementById(id); if (!b) continue; const r = b.getBoundingClientRect(); if (!r.width) continue; const e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); if (e && (e === b || b.contains(e))) return false; return true } return false })
    if (covered) { await t.tap(); await sleep(600) }
  }
}

export async function signOut(page) {
  await page.locator('#burger').tap(); await sleep(500)
  await page.locator('#drawerLogout').tap(); await sleep(900)
}
export async function signInAs(page, who, pass) {
  await page.waitForSelector('#loginForm', { timeout: 15000 })
  await page.fill('#luser', who); await page.fill('#lpass', pass)
  await page.locator('#loginForm button[type=submit]').tap()
  await page.waitForSelector('#vWeek .day', { timeout: 15000 }); await sleep(600)
}
