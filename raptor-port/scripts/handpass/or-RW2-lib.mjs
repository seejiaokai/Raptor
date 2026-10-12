// Walker RW2 helpers (copied from or-C-lib) (one-rule walk, 12 Oct 26) - real controls only; the probe bridge is used to READ.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const BASE = 'http://localhost:4186/'
export const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-10-12-one-rule/RW2'
export const PARTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts'
mkdirSync(OUT, { recursive: true }); mkdirSync(PARTS, { recursive: true })
export const WIN = '[data-testid="win-inputedit"]'
export const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export const DESK = { width: 1440, height: 900 }
export const sleep = ms => new Promise(r => setTimeout(r, ms))

export async function openWorld({ who = 'ad', pass = 'a', clock = '2026-06-22T09:00:00', viewport = DESK } = {}) {
  const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  const errs = []
  if (clock) await page.clock.setFixedTime(new Date(clock))
  page.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 300)))
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 300)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`HTTP ${r.status()} ${r.url()}`) })
  await page.addInitScript(() => {
    window.__toasts = []
    const go = () => new MutationObserver(() => { const t = document.getElementById('toastEl'); if (t && t.style.opacity === '1' && t.textContent) { const l = window.__toasts[window.__toasts.length - 1]; if (!l || l.text !== t.textContent) window.__toasts.push({ text: t.textContent }) } }).observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true })
    if (document.documentElement) go(); else document.addEventListener('DOMContentLoaded', go)
  })
  await page.goto(BASE + '?fresh=1')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await page.fill('#luser', who); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  await page.waitForTimeout(500)
  return { browser, ctx, page, errs }
}
export const shot = async (p, name, clip) => { const f = join(OUT, name + '.png'); await p.screenshot({ path: f, ...(clip ? { clip } : {}) }); return name + '.png' }
export const toastMark = p => p.evaluate(() => (window.__toasts || []).length)
export const toastsSince = (p, m) => p.evaluate(m => (window.__toasts || []).slice(m).map(t => t.text).join(' || '), m)
export const toastNow = p => p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? (t.innerText || '').replace(/\s+/g, ' ').trim() : '' })
export const csId = (p, cs) => p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)

async function pick(p, iso) {
  for (let i = 0; i < 36 && !(await p.locator(`#inpEdCal [data-cal="${iso}"]`).count()); i++) {
    const [m, y] = (await p.locator('#inpEdCal .rc-mon').textContent()).split(' ')
    const at = `${y}-${String(MONTHS.findIndex(x => x.startsWith(m.toLowerCase())) + 1).padStart(2, '0')}`
    await p.locator(`#inpEdCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`).click()
  }
  await p.locator(`#inpEdCal [data-cal="${iso}"]`).click()
}
/* file one input through the Inputs page's "+ Input" window.
   spec: {type, person, people:[cs..], ph:'allavail'|'all', from,to (iso), title, rmk, timed:[s,e], oil:'yes'|'no'|'close'} */
export async function fileInput(p, spec) {
  await p.evaluate(() => window.go('inputs'))
  await p.waitForTimeout(300)
  const had = await p.evaluate(() => window.INPUTS.map(r => r.iid))
  if (await p.locator(WIN).count()) { await p.locator('#inpEditCancel').click(); await p.waitForTimeout(150) }
  if (await p.locator('#inListBtn[aria-pressed="false"]').count()) { await p.locator('#inListBtn').click(); await p.waitForTimeout(200) }
  await p.locator('#inNew').click(); await p.locator(WIN).waitFor()
  if (spec.type) await p.selectOption('#inpEditType', spec.type)
  if (spec.person) await p.selectOption('#inpEditPerson', await csId(p, spec.person))
  if (spec.people || spec.ph) {
    await p.locator(`${WIN} [data-testid="pp-several"]`).click()
    const want = []
    for (const cs of (spec.people || [])) { const pid = await csId(p, cs); want.push(pid); const b = p.locator(`${WIN} [data-pp="${pid}"]`); if ((await b.getAttribute('aria-pressed')) !== 'true') await b.click() }
    const pressed = await p.evaluate(sel => [...document.querySelectorAll(`${sel} [data-pp][aria-pressed="true"]`)].map(b => b.getAttribute('data-pp')), WIN)
    for (const pid of pressed) if (!want.includes(pid)) await p.locator(`${WIN} [data-pp="${pid}"]`).click()
    if (spec.ph) { await p.locator(`${WIN} [data-ph="${spec.ph}"]`).scrollIntoViewIfNeeded().catch(() => {}); await p.locator(`${WIN} [data-ph="${spec.ph}"]`).click() }
  }
  if (spec.from) await pick(p, spec.from)
  if (spec.to) await pick(p, spec.to)
  if (spec.timed) {
    if (await p.locator('#inpEditAllday').count() && await p.locator('#inpEditAllday').isChecked()) await p.locator('#inpEditAllday').click()
    await p.fill('#inpEditStart', spec.timed[0]); await p.fill('#inpEditEnd', spec.timed[1])
  }
  if (spec.title != null) await p.fill('#inpEditOwnTitle', spec.title)
  if (spec.rmk != null) await p.fill('#inpEditRmk', spec.rmk)
  await p.locator('#inpEditSave').click()
  await p.waitForTimeout(350)
  for (let k = 0; k < 3; k++) {
    const sheet = p.locator('[data-testid="oilconf"]')
    if (await sheet.count()) {
      const how = spec.oil || 'no'
      if (how === 'close') { const c = sheet.locator('button').filter({ hasText: /close|cancel|later|not now/i }).first(); if (await c.count()) await c.click(); else await p.keyboard.press('Escape'); await p.waitForTimeout(300); continue }
      const one = sheet.locator(`[data-testid="oil-${how}"]`), many = sheet.locator(`[data-testid="oil-${how === 'yes' ? 'all' : 'none'}"]`)
      await ((await one.count()) ? one : many).click()
      await sheet.locator('[data-testid="oilconf-save"]').click()
    } else if (await p.locator('[data-testid="docconf"]').count()) await p.locator('[data-testid="docconf-nodoc"]').click()
    else break
    await p.waitForTimeout(300)
  }
  await p.locator(WIN).waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
  await p.waitForTimeout(300)
  return p.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => ({ iid: r.iid, person: window.PEOPLE[r.person]?.cs, people: (r.people || []).map(e => e.p === 'allavail' || e.p === 'all' ? e.p : window.PEOPLE[e.p]?.cs), type: r.type, title: r.title, date: r.date, s: r.s, e: r.e })), had)
}

/* the input record, readable */
export const rec = (p, iid) => p.evaluate(id => {
  const r = window.INPUTS.find(x => x.iid === id); if (!r) return null
  const cs = x => window.PEOPLE[x]?.cs || x
  return { iid: r.iid, type: r.type, title: r.title || '', date: r.date, to: r.to || null, s: r.s, e: r.e, people: (r.people || []).map(e => cs(e.p)), oil: JSON.stringify((r.people || []).map(e => [cs(e.p), e.oil ?? null])), cx: !!r.cx, cxr: r.cxr || '', info: !!r.info, box: !!r.box, ver: JSON.stringify(Object.keys(r)).slice(0, 200), filedBy: r.by || r.filedBy || null }
}, iid)
export const recRaw = (p, iid) => p.evaluate(id => JSON.stringify(window.INPUTS.find(x => x.iid === id)), iid)

export async function goEdit(p) {
  if (await p.evaluate(() => !!document.querySelector('#schedBoard'))) await closeBoard(p)
  await p.evaluate(() => window.go('editsched'))
  await p.locator('#eWeek .day').first().waitFor()
  await p.waitForTimeout(400)
}
export async function closeBoard(p) {
  const b = p.locator('#sbDone:visible').first()
  if (await b.count()) { await b.click(); await p.waitForTimeout(500) } else { await p.keyboard.press('Escape'); await p.waitForTimeout(400) }
}
export async function openBoard(p, di) {
  const cur = await p.evaluate(() => (document.querySelector('#schedBoard') ? window.SBDAY : null))
  if (cur === di) return
  if (cur != null) await closeBoard(p)
  await goEdit(p)
  const d = p.locator(`#eWeek [data-sbday="${di}"]:visible`).first()
  await d.scrollIntoViewIfNeeded(); await d.click()
  await p.waitForSelector('#schedBoard'); await p.waitForTimeout(500)
}
/* ground row index on a day for an input */
export const rowIdx = (p, di, iid) => p.evaluate(([di, id]) => (window.DAYS[di].ground || []).findIndex(g => g.src === id), [di, iid])
export const rowData = (p, di, iid) => p.evaluate(([di, id]) => { const g = (window.DAYS[di].ground || []).find(x => x.src === id); if (!g) return null; const cs = x => window.PEOPLE[x]?.cs || x; return { prog: g.prog, str: g.str, end: g.end, who: Array.isArray(g.who) ? g.who.map(cs) : cs(g.who), more: (g.more || []).map(m => Array.isArray(m.who) ? m.who.map(cs) : cs(m.who)), cx: !!g.cx, cxr: g.cxr || '', info: !!g.info, box: !!g.box, keys: Object.keys(g).join(',') } }, [di, iid])

/* a real mouse drag. to: locator or {x,y} */
export async function drag(p, fromLoc, to, { steps = 14, wait = 150 } = {}) {
  const fb = await fromLoc.boundingBox(); if (!fb) throw new Error('drag: no box for source')
  const fx = fb.x + fb.width / 2, fy = fb.y + fb.height / 2
  let t
  if (to.x != null) t = { x: to.x, y: to.y }
  else { const tb = await to.boundingBox(); if (!tb) throw new Error('drag: no box for target'); t = { x: tb.x + tb.width / 2, y: tb.y + tb.height / 2 } }
  await p.mouse.move(fx, fy); await p.mouse.down()
  await p.mouse.move(fx + 6, fy + 6, { steps: 3 })
  await p.mouse.move(t.x, t.y, { steps })
  await p.waitForTimeout(wait)
  await p.mouse.move(t.x + 1, t.y + 1)
  await p.waitForTimeout(wait)
  await p.mouse.up()
  await p.waitForTimeout(600)
}
export async function undoRedo(p, which) {
  const board = await p.evaluate(() => !!document.querySelector('#schedBoard'))
  const ids = board ? [which === 'undo' ? '#sbUndo' : '#sbRedo', which === 'undo' ? '#undoBtn' : '#redoBtn'] : [which === 'undo' ? '#undoBtn' : '#redoBtn']
  for (const id of ids) {
    const b = p.locator(id + ':visible').first()
    if (await b.count()) { if (await b.isDisabled()) return { used: id + ' (disabled)', ok: false }; await b.click(); await p.waitForTimeout(600); return { used: id, ok: true } }
  }
  return { used: 'none', ok: false }
}

/* the whole report is built here: R(id, did, saw, inputs, uor, verdict, pics) */
export const TABLE = []
export const R = (id, did, saw, inputs, uor, verdict, pics = []) => { TABLE.push({ id, did, saw, inputs, uor, verdict, pics }); console.log(`${verdict}  ${id}\n   did: ${did}\n   saw: ${saw}\n   inputs: ${inputs}\n   u/r: ${uor}\n   pics: ${pics.join(', ')}`) }
export function savePart(name) { writeFileSync(join(PARTS, `or-RW2-part-${name}.json`), JSON.stringify(TABLE, null, 1)) }

/* ---------- OIL Earn and the ALL AVAIL window ---------- */
export async function oilOn(p, di, on = true) {
  await openBoard(p, di)
  const isOn = (await p.locator('#schedBoard button:visible').filter({ hasText: /OIL done/ }).count()) > 0
  if (isOn !== on) { if (on) await p.locator('#sbOil:visible').first().click(); else { const d = p.locator('#schedBoard button:visible').filter({ hasText: /OIL done/ }).first(); if (await d.count()) await d.click(); else await p.locator('#sbOil:visible').first().click() } await p.waitForTimeout(700) }
}
/* the board's OIL Earn reading of ONE input: its seats [{who, state}] and its crowd chip */
export const oilSeats = (p, iid) => p.evaluate(iid => {
  const P = window.PEOPLE
  const seats = [...document.querySelectorAll(`#schedBoard [data-oilitem="i:${iid}"][data-oilp]`)].filter(e => e.offsetParent)
  const seen = new Set(), out = []
  for (const e of seats) {
    const id = e.getAttribute('data-oilp'); const key = id + (e.closest('.sb-arow')?.className.includes('inprow') ? '@line' : '@row')
    out.push({ who: (P[id] && P[id].cs) || id, on: e.classList.contains('on'), where: e.closest('.sb-arow')?.className.includes('inprow') ? 'line' : 'row', title: (e.getAttribute('title') || '').slice(0, 80) })
  }
  const chip = document.querySelector(`#schedBoard [data-oilsent="i:${iid}"]`)
  return { seats: out, chip: chip ? { text: chip.textContent.trim(), title: (chip.getAttribute('title') || '').slice(0, 120) } : null }
}, iid)
/* the whole day's OIL items, any, with the seats on them (for a desk or any row) */
export const oilAll = p => p.evaluate(() => {
  const P = window.PEOPLE
  return [...document.querySelectorAll('#schedBoard [data-oilp]')].filter(e => e.offsetParent).map(e => `${e.getAttribute('data-oilitem')}:${(P[e.getAttribute('data-oilp')] || {}).cs || e.getAttribute('data-oilp')}:${e.classList.contains('on') ? 'on' : 'off'}`)
})
export async function openCrowd(p, sentKey) {
  const chip = p.locator(`#schedBoard [data-oilsent="${sentKey}"]:visible`).first()
  await chip.scrollIntoViewIfNeeded(); await chip.click(); await p.waitForTimeout(500)
}
export const crowd = p => p.evaluate(() => {
  const w = document.querySelector('.availwin:not([hidden])'); if (!w) return { open: false }
  const P = window.PEOPLE
  const tab = [...w.querySelectorAll('.win-tab')].find(t => t.classList.contains('on'))
  return { open: true, title: (w.querySelector('.win-ttl')?.innerText || '').replace(/\s+/g, ' ').trim(), tabs: [...w.querySelectorAll('.win-tab')].map(t => t.textContent.trim() + (t.classList.contains('on') ? ' [on]' : '')), foot: (w.querySelector('.win-foot')?.textContent || '').trim(),
    rows: [...w.querySelectorAll('[data-awp]')].map(x => ({ id: x.dataset.awp, cs: (P[x.dataset.awp] || {}).cs, cls: x.className.replace(/\s+/g, ' ').trim(), off: /\boff\b/.test(x.className) || !!x.querySelector('.off') })) }
})
export async function crowdTab(p, re) { const t = p.locator('.availwin .win-tab').filter({ hasText: re }).first(); await t.click(); await p.waitForTimeout(300) }
export async function crowdToggle(p, id) { await p.locator(`.availwin [data-awp="${id}"]`).first().scrollIntoViewIfNeeded(); await p.locator(`.availwin [data-awp="${id}"] .puck`).first().click(); await p.waitForTimeout(400) }
export async function crowdClose(p) { const x = p.locator('.availwin .win-x:visible, .availwin [aria-label="Close"]:visible').first(); if (await x.count()) { await x.click(); await p.waitForTimeout(300) } else { await p.keyboard.press('Escape'); await p.waitForTimeout(300) } }

/* open an input's own window from the Inputs List (copied from or-H-lib openFromList) */
export async function openFromList(p, iid) {
  await p.evaluate(() => window.go('inputs'))
  if (await p.locator(WIN).count()) { await p.locator('#inpEditCancel').click().catch(() => {}); await p.waitForTimeout(150) }
  if (await p.locator('#inListBtn[aria-pressed="false"]').count()) { await p.locator('#inListBtn').click(); await p.waitForTimeout(250) }
  const el = p.locator(`[data-popiid="${iid}"], [data-iid="${iid}"], [data-listiid="${iid}"]`).first()
  if (!(await el.count())) { await p.locator('#inRangeBtn').click(); await p.waitForTimeout(250); if (await p.locator('#inRangeAll').count()) await p.locator('#inRangeAll').click(); await p.waitForTimeout(350) }
  if (!(await el.count())) throw new Error('list row missing')
  await el.scrollIntoViewIfNeeded().catch(() => {})
  await el.click()
  await p.locator(WIN).waitFor()
  await p.waitForTimeout(250)
}
