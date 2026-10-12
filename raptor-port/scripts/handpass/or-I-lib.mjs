// Walker I (one-rule bug check, 12 Oct 26) - my own helpers. Real controls only; window.* only to READ.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const URL = 'http://localhost:4186/'
export const OUT = 'docs/img/handpass/2026-10-12-one-rule/I'
mkdirSync(OUT, { recursive: true })
export const DATA = 'docs/handpass/parts/or-I.json'
export const MON = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export const DAY = '2026-07-15', DI = 2
export const errs = []

export async function start({ who = 'ad', pass = 'a', viewport = { width: 1440, height: 900 }, clock = null } = {}) {
  const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 300)))
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 300)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`HTTP ${r.status()} ${r.url()}`) })
  await page.addInitScript(() => {
    window.__toasts = []
    const go = () => new MutationObserver(() => { const t = document.getElementById('toastEl'); if (t && t.style.opacity === '1') { const x = (t.textContent || '').trim(); const L = window.__toasts; if (x && (!L.length || L[L.length - 1].text !== x)) L.push({ text: x }) } }).observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true })
    if (document.documentElement) go(); else document.addEventListener('DOMContentLoaded', go)
  })
  if (clock) await page.clock.setFixedTime(new Date(clock))
  await page.goto(URL)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  const w = { browser, ctx, page }
  await signIn(page, who, pass)
  return w
}
export async function signIn(page, u, p) {
  await page.waitForSelector('#loginForm', { state: 'visible' })
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  await page.waitForTimeout(500)
}
export async function signOut(page) {
  const b = page.locator('#logout:visible').first()
  if (await b.count()) await b.click(); else await page.evaluate(() => document.getElementById('logout').click())
  await page.waitForSelector('#loginForm', { state: 'visible', timeout: 6000 })
}
export const note = async page => (await page.locator('#toastEl').innerText().catch(() => '')).replace(/\s+/g, ' ').trim()
export const toastMark = p => p.evaluate(() => (window.__toasts || []).length)
export const toastsSince = (p, m) => p.evaluate(m => (window.__toasts || []).slice(m).map(t => t.text).join(' || '), m)
export const csId = (p, cs) => p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)
export const shot = async (p, name, clip) => { await p.screenshot({ path: join(OUT, name + '.png'), ...(clip ? { clip } : {}) }); return name + '.png' }
export const say = (...a) => console.log(...a)

/* ---------- results: appended to the data file as scenarios finish ---------- */
export function record(id, obj) {
  let d = {}
  try { d = JSON.parse(readFileSync(DATA, 'utf8')) } catch {}
  d[id] = { ...(d[id] || {}), ...obj }
  writeFileSync(DATA, JSON.stringify(d, null, 1))
}

/* ---------- the Inputs page ---------- */
export async function toMonth(page) {
  await page.evaluate(() => window.go('inputs'))
  await page.locator('#inpCal').waitFor()
  if ((await page.locator('#inCalBtn').getAttribute('aria-pressed')) !== 'true') await page.locator('#inCalBtn').click()
  const at = async () => { const [m, y] = (await page.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MON.findIndex(x => x.startsWith(m)) }
  let d = 2026 * 12 + 6 - await at()
  for (; d > 0; d--) await page.locator('#icNext').click()
  for (; d < 0; d++) await page.locator('#icPrev').click()
  await page.waitForSelector(`[data-icday="${DAY}"]`)
}
export async function openDay(page, day = DAY) {
  await page.locator(`[data-icday="${day}"]`).focus()
  await page.keyboard.press('Enter')
  await page.waitForSelector('[data-testid="win-inputsday"]')
  await page.waitForTimeout(350)
}
export async function closeDay(page) { const x = page.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) { await x.click(); await page.waitForTimeout(250) } }
/* file through the day's "+ Input" - spec {title, kind, pick:[cs], from, to, rmk, oil:'yes'|'no'|'close', day} */
export async function fileIt(page, spec) {
  const day = spec.day || DAY
  const had = await page.evaluate(() => window.INPUTS.map(r => r.iid))
  await toMonth(page); await openDay(page, day)
  await page.locator('#icPopAdd').click()
  await page.waitForSelector('#inpEditPop')
  if (spec.kind) await page.locator('#inpEditPop #inpEditType').selectOption(spec.kind)
  if (spec.pick.length > 1 || spec.several) {
    await page.locator('#inpEditPop [data-testid="pp-several"]').click()
    const want = []
    for (const cs of spec.pick) { const id = await csId(page, cs); want.push(id); const b = page.locator(`#inpEditPop [data-pp="${id}"]`); if ((await b.getAttribute('aria-pressed')) !== 'true') await b.click() }
    const lit = await page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
    for (const id of lit) if (!want.includes(id)) await page.locator(`#inpEditPop [data-pp="${id}"]`).click()
  } else {
    await page.locator('#inpEditPop #inpEditPerson').selectOption(await csId(page, spec.pick[0]))
  }
  if (spec.title != null) await page.locator('#inpEditPop #inpEditOwnTitle').first().fill(spec.title)
  if (spec.from) await page.locator('#inpEditPop #inpEditStart').fill(spec.from)
  if (spec.to) await page.locator('#inpEditPop #inpEditEnd').fill(spec.to)
  if (spec.rmk != null) await page.locator('#inpEditPop #inpEditRmk').fill(spec.rmk)
  await page.locator('#inpEditSave').click()
  await page.waitForTimeout(500)
  const oil = await answerOil(page, spec.oil || 'close')
  await page.waitForTimeout(400)
  await closeDay(page)
  const now = await page.evaluate(() => window.INPUTS.map(r => r.iid))
  const iid = now.find(i => !had.includes(i))
  return { iid, oil }
}
export async function answerOil(page, how) {
  let did = 'no question'
  for (let k = 0; k < 3; k++) {
    const sheet = page.locator('[data-testid="oilconf"]')
    if (!(await sheet.count())) break
    if (how === 'close') {
      const c = page.locator('[data-testid="oilconf-close"], [data-testid="oil-close"], #oilConfirmClose, [data-testid="oilconf"] [aria-label="Close"], [data-testid="oilconf"] .win-x').first()
      did = 'question closed unanswered'
      if (await c.count()) await c.click(); else await page.keyboard.press('Escape')
    } else {
      const one = sheet.locator(`[data-testid="oil-${how}"]`), many = sheet.locator(`[data-testid="oil-${how === 'yes' ? 'all' : 'none'}"]`)
      await ((await one.count()) ? one : many).click()
      await sheet.locator('[data-testid="oilconf-save"]').click()
      did = 'question answered ' + how
    }
    await page.waitForTimeout(300)
  }
  return did
}
export const rec = (page, iid) => page.evaluate(id => { const x = window.INPUTS.find(i => i.iid === id); if (!x) return null; const f = m => (m == null ? '' : String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')); return { iid: x.iid, title: x.title || '', type: x.type, date: x.date, t: f(x.s) + '-' + f(x.e), people: (x.people || []).map(e => (window.PEOPLE[e.p] ? window.PEOPLE[e.p].cs : e.p)), by: x.by, cx: !!x.cx, cxr: x.cxr || '', rmk: x.remarks || '', oil: x.oil == null ? null : JSON.stringify(x.oil).slice(0, 80), acc: x.acc || null } }, iid)
export const allInputs = page => page.evaluate(() => window.INPUTS.map(x => ({ iid: x.iid, title: x.title || '', type: x.type, date: x.date, people: (x.people || []).map(e => (window.PEOPLE[e.p] ? window.PEOPLE[e.p].cs : e.p)), cx: !!x.cx })))

/* ---------- the schedule ---------- */
export async function toWeek(page) {
  await page.evaluate(() => window.go('editsched'))
  await page.locator('#eWeek .day').first().waitFor()
  await page.waitForTimeout(300)
}
export const rowIdx = (page, iid, di = DI) => page.evaluate(([di, id]) => (window.DAYS[di].ground || []).findIndex(g => g.src === id), [di, iid])
export async function openBoard(page, di = DI) {
  const d = page.locator(`#eWeek [data-sbday="${di}"]:visible`).first()
  await d.scrollIntoViewIfNeeded(); await d.click()
  await page.waitForSelector('#schedBoard', { timeout: 5000 }); await page.waitForTimeout(300)
}
export async function closeBoard(page) { const b = page.locator('#sbDone:visible'); if (await b.count()) { await b.click(); await page.waitForTimeout(400) } }
export async function cxOn(page, iid, why = 'WX', di = DI) {
  await toWeek(page); const ri = await rowIdx(page, iid, di)
  await openBoard(page, di)
  const cx = page.locator(`#schedBoard [data-grcx="${di}.${ri}"]`).first()
  await cx.scrollIntoViewIfNeeded(); await cx.click()
  await page.waitForSelector('#cxSave', { timeout: 4000 })
  if (why) { const q = page.locator(`#cxQuick [data-cxq="${why}"]`).first(); if (await q.count()) await q.click(); else await page.locator('#cxReason').fill(why) }
  await page.locator('#cxSave').click(); await page.waitForTimeout(500)
  await closeBoard(page)
}
export async function cxOff(page, iid, di = DI) {
  await toWeek(page); const ri = await rowIdx(page, iid, di)
  await openBoard(page, di)
  const cx = page.locator(`#schedBoard [data-grcx="${di}.${ri}"]`).first()
  await cx.scrollIntoViewIfNeeded(); await cx.click()
  await page.waitForSelector('#cxUn', { timeout: 4000 })
  await page.locator('#cxUn').click(); await page.waitForTimeout(500)
  await closeBoard(page)
}
/* a real drag with the mouse */
export async function drag(p, fromLoc, to, { steps = 14, wait = 120 } = {}) {
  if (to.x == null) await to.scrollIntoViewIfNeeded().catch(() => {})
  await fromLoc.scrollIntoViewIfNeeded().catch(() => {})
  if (to.x == null) { const tb0 = await to.boundingBox(); if (tb0 && (tb0.y < 70 || tb0.y > 840)) await to.evaluate(e => e.scrollIntoView({ block: 'center' })) }
  const fb = await fromLoc.boundingBox(); if (!fb) throw new Error('drag: no box for source')
  const fx = fb.x + fb.width / 2, fy = fb.y + fb.height / 2
  await p.mouse.move(fx, fy); await p.mouse.down()
  await p.mouse.move(fx + 6, fy + 6, { steps: 3 })
  let t
  if (to.x != null) t = { x: to.x, y: to.y }; else { const tb = await to.boundingBox(); if (!tb) throw new Error('drag: no box for target'); t = { x: tb.x + tb.width / 2, y: tb.y + tb.height / 2 } }
  await p.mouse.move(t.x, t.y, { steps }); await p.waitForTimeout(wait)
  await p.mouse.move(t.x + 1, t.y + 1); await p.waitForTimeout(wait)
  await p.mouse.up(); await p.waitForTimeout(600)
}
export const rowLoc = (page, ri, di = DI) => page.locator(`#eWeek [data-slot^="g:${di}.${ri}"]:visible`)
export const rosterPuck = (page, id) => page.locator(`#eRoster .rpuck[data-person="${id}"]:visible`).first()
export const undo = async page => { const b = page.locator('#undoBtn:visible, #sbUndo:visible').first(); if (await b.isDisabled()) return 'undo disabled'; await b.click(); await page.waitForTimeout(600); return 'undone' }
export const redo = async page => { const b = page.locator('#redoBtn:visible, #sbRedo:visible').first(); if (await b.isDisabled()) return 'redo disabled'; await b.click(); await page.waitForTimeout(600); return 'redone' }

/* ---------- the bell ---------- */
export const bellSel = async page => ((await page.locator('#sbBell').isVisible().catch(() => false)) ? '#sbBell' : '#notifyBell')
export const bell = async page => page.locator(await bellSel(page))
export const bellState = async page => page.evaluate(sel => { const b = document.querySelector(sel); return b ? { id: b.id, lit: b.classList.contains('on'), open: b.getAttribute('aria-expanded') } : null }, await bellSel(page))
export const listFacts = page => page.evaluate(() => {
  const l = document.querySelector('.bell-list'); if (!l) return null
  const r = l.getBoundingClientRect()
  return { box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], empty: (l.querySelector('.bl-empty') || {}).textContent || null, markAll: !!l.querySelector('[data-testid="bell-markall"]'),
    lines: [...l.querySelectorAll('.bl-line')].map(e => ({ unread: e.classList.contains('unread'), text: `${e.querySelector('.bl-name').textContent} ${e.querySelector('.bl-day').textContent} — ${e.querySelector('.bl-what').textContent} · ${e.querySelector('.bl-ago').textContent}` })) }
})
/* open the bell's list (it may go first to an OIL question etc.), return what it showed */
export async function openList(page) {
  if (await page.locator('.bell-list').count()) return listFacts(page)
  await (await bell(page)).click(); await page.waitForTimeout(400)
  return listFacts(page)
}
export async function closeList(page) {
  if (await page.locator('.bell-list').count()) { await (await bell(page)).click(); await page.waitForTimeout(250) }
  if (await page.locator('.bell-list').count()) await page.keyboard.press('Escape')
}
export const lineTexts = f => (f && f.lines ? f.lines.map((l, i) => `${i + 1}. ${l.unread ? '[unread] ' : '[read] '}${l.text}`) : [])
export async function shotList(page, name) {
  const t = await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' })
  const f = await listFacts(page)
  if (f) { const [x, y, w, h] = f.box; const bx = await (await bell(page)).boundingBox(); const cx = Math.max(0, Math.min(x, bx.x) - 10), cy = Math.max(0, bx.y - 10); await page.screenshot({ path: join(OUT, name + '.png'), clip: { x: cx, y: cy, width: Math.min(1440 - cx, Math.max(x + w, bx.x + bx.width) - cx + 10), height: Math.min(900 - cy, y + h - cy + 10) } }) }
  else await page.screenshot({ path: join(OUT, name + '.png') })
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = '' })
  return f
}
