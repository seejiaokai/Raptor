// Walker A's shared helpers for the input-card walk (read-only on the app; drives the built bundle through its own controls).
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const OUT = 'docs/img/handpass/2026-10-10-input-card-check/A'
mkdirSync(OUT, { recursive: true })
export const BASE = process.env.LOOK_URL || 'http://localhost:4231/'
export const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export const WIN = '[data-testid="win-inputedit"]'
export const DAYWIN = '[data-testid="win-inputsday"]'
export const errs = []
export const rows = []
export const launch = () => chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})

/* a row of the result table; verdict PASS / FAIL / NOT RUN */
export function judge(id, size, role, verdict, detail, pics = []) {
  rows.push({ id, size, role, verdict, detail, pics })
  console.log(`${verdict}  #${id} [${size}/${role}] ${detail}${pics.length ? '  {' + pics.join(', ') + '}' : ''}`)
}
export function saveRows(tag) {
  writeFileSync(`docs/handpass/parts/icard-A-rows-${tag}.json`, JSON.stringify({ rows, errs }, null, 1))
}

export async function open(browser, viewport, who = 'ad', pass = 'a', touch = false, fresh = true, clockInstall = false) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: touch ? 2 : 1, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  const tag = `${viewport.width}x${viewport.height} ${who}`
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 300)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 300)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await page.goto(BASE + (fresh ? '?fresh=1' : ''))
  await page.fill('#luser', who); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  return { ctx, page }
}
export const shot = (p, name, full = false) => p.screenshot({ path: join(OUT, name + '.png'), fullPage: full }).then(() => name + '.png')
export const press = (touch, loc) => (touch ? loc.tap() : loc.click())
export const csId = (p, cs) => p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)
export const rec = (p, f) => p.evaluate(f => {
  const r = window.INPUTS.find(x => Object.keys(f).every(k => x[k] === f[k]))
  return r ? { iid: r.iid, person: r.person, type: r.type, title: r.title, remarks: r.remarks, date: r.date, endDate: r.endDate, oil: r.oil || null, s: r.s, e: r.e, grp: r.grp || null, half: r.half || null, by: r.by || r.placedBy || null } : null
}, f)
export const recAll = (p, f) => p.evaluate(f => window.INPUTS.filter(x => Object.keys(f).every(k => x[k] === f[k])).map(r => ({ iid: r.iid, person: r.person, type: r.type, title: r.title, remarks: r.remarks, date: r.date, endDate: r.endDate, s: r.s, e: r.e, grp: r.grp || null })), f)
export const recId = (p, iid) => rec(p, { iid })

export async function month(p, y, m, touch) {
  for (let i = 0; i < 60; i++) {
    const [name, year] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) return
    await press(touch, p.locator(d > 0 ? '#icNext' : '#icPrev'))
  }
  throw new Error('the calendar never reached the month asked for')
}
export async function toCal(p, touch, y = 2026, m = 7) {
  await p.evaluate(() => window.go('inputs'))
  if (await p.locator('#inCalBtn[aria-pressed="false"]').count()) await press(touch, p.locator('#inCalBtn'))
  await month(p, y, m, touch)
}
export async function openDay(p, iso, touch) {
  const [y, m] = iso.split('-').map(Number)
  await toCal(p, touch, y, m)
  if (await p.locator(DAYWIN).count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(200) }
  const cell = p.locator(`#inpCal [data-icday="${iso}"]`)
  if (touch) await cell.tap({ position: { x: 8, y: 8 } }); else await cell.click({ position: { x: 8, y: 8 } })
  await p.locator(DAYWIN).waitFor()
}
/* answer the OIL question if it comes up; returns whether asked */
export async function answerOil(p, touch, how) {
  const sheet = p.locator('[data-testid="oilconf"]')
  const one = sheet.locator(`[data-testid="oil-${how}"]`), many = sheet.locator(`[data-testid="oil-${how === 'yes' ? 'all' : 'none'}"]`)
  await press(touch, (await one.count()) ? one : many)
  await press(touch, sheet.locator('[data-testid="oilconf-save"]'))
}
/* a document question (Upload / No document) may come up for a medical kind: choose No document where offered */
export async function noDocument(p, touch) {
  const cands = ['text=No document', '[data-testid*="nodoc"]', 'button:has-text("No document")']
  for (const c of cands) {
    const l = p.locator(c).first()
    if (await l.count() && await l.isVisible().catch(() => false)) { await press(touch, l); return true }
  }
  return false
}
export async function saveWin(p, touch, oil = 'no') {
  await press(touch, p.locator('#inpEditSave'))
  let asked = false
  for (let i = 0; i < 3; i++) {
    const sheet = p.locator('[data-testid="oilconf"]')
    if (await sheet.waitFor({ timeout: i ? 700 : 1200 }).then(() => true, () => false)) { asked = true; await answerOil(p, touch, oil); await p.waitForTimeout(250); continue }
    if (await noDocument(p, touch)) { await p.waitForTimeout(300); continue }
    break
  }
  await p.waitForTimeout(400)
  return asked
}
/* the date calendar of a NEW input window (if any): tap start then end */
export async function pickDates(p, touch, from, to) {
  const c = p.locator(`${WIN} #inpEdCal [data-cal="${from}"]`)
  await c.scrollIntoViewIfNeeded().catch(() => {}); await press(touch, c)
  if (to && to !== from) { const e = p.locator(`${WIN} #inpEdCal [data-cal="${to}"]`); await e.scrollIntoViewIfNeeded().catch(() => {}); await press(touch, e) }
}
/* File an input through the opened day's "+ Input". o: type, who (callsign) | several [callsigns] | allavail, start, end, allday, title, rmk, from, to */
export async function file(p, touch, dayIso, o) {
  if (!(await p.locator(DAYWIN).count())) await openDay(p, dayIso, touch)
  await press(touch, p.locator('#icPopAdd')); await p.locator(WIN).waitFor()
  await p.selectOption('#inpEditType', o.type)
  if (o.several) {
    await press(touch, p.locator(`${WIN} [data-testid="pp-several"]`))
    for (const cs of o.several) { const b = p.locator(`${WIN} [data-pp="${await csId(p, cs)}"]`); await b.scrollIntoViewIfNeeded().catch(() => {}); if ((await b.getAttribute('aria-pressed')) !== 'true') await press(touch, b) }
  } else if (o.who === 'allavail' || o.who === 'all') await p.selectOption('#inpEditPerson', o.who)
  else if (o.who) await p.selectOption('#inpEditPerson', await csId(p, o.who))
  if (o.allday) { const a = p.locator('#inpEditAllday'); if (await a.count() && !(await a.isChecked().catch(() => false))) await a.check().catch(() => press(touch, a)) }
  else { if (o.start) await p.fill('#inpEditStart', o.start).catch(() => {}); if (o.end) await p.fill('#inpEditEnd', o.end).catch(() => {}) }
  if (o.title != null) await p.fill('#inpEditOwnTitle', o.title)
  if (o.rmk != null) await p.fill('#inpEditRmk', o.rmk)
  if (o.from) await pickDates(p, touch, o.from, o.to)
  return saveWin(p, touch, o.oil || 'no')
}
export const cardFacts = (p, root, tid) => p.locator(`${root} [data-testid^="${tid}-row-"]`).evaluateAll((els, tid) => els.map(c => {
  const t = k => { const e = c.querySelector(`[data-testid="${tid}-${k}"]`); return e ? e.textContent : null }
  const b = c.getBoundingClientRect()
  const sq = c.querySelector('.icard-sq, .icard-square, [class*="sq"]')
  return { iid: c.getAttribute('data-popiid') || c.getAttribute('data-iid'), who: t('who'), kind: t('kind'), when: t('when'), title: t('title'), rmk: t('rmk'), by: t('by'), late: !!c.querySelector(`[data-testid="${tid}-late"]`), latenote: t('latenote'),
    h: Math.round(b.height), w: Math.round(b.width), pucks: c.querySelectorAll('.puck').length, tone: / red\b/.test(' ' + c.className) ? 'red' : 'amb', cls: c.className, kindCaps: (c.querySelector('.icard-kind') ? getComputedStyle(c.querySelector('.icard-kind')).textTransform : null),
    kindColor: c.querySelector('.icard-kind') ? getComputedStyle(c.querySelector('.icard-kind')).color : null, sqColor: sq ? getComputedStyle(sq).backgroundColor : null }
}), tid)
export async function toList(p, touch, all = true) {
  await p.evaluate(() => window.go('inputs'))
  if (await p.locator(DAYWIN).count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(200) }
  if (await p.locator('#inListBtn[aria-pressed="false"]').count()) await press(touch, p.locator('#inListBtn'))
  if (all) {
    if (!(await p.locator('#inRangePop').count())) await press(touch, p.locator('#inRangeBtn'))
    await press(touch, p.locator('#inRangeAll')); await p.waitForTimeout(300)
  }
}
export const overflow = p => p.evaluate(() => ({ wide: document.documentElement.scrollWidth > window.innerWidth + 1, sw: document.documentElement.scrollWidth, iw: window.innerWidth }))
export const dayHeads = p => p.evaluate(() => [...document.querySelectorAll('#inList [data-testid="inl-day"]')].map(h => ({ iso: h.getAttribute('data-iso'), t: h.textContent.replace(/\s+/g, ' ').trim() })))
export async function signOut(p, touch) {
  for (let i = 0; i < 3; i++) {
    if (await p.locator('#luser:visible').count()) return
    const lo = p.locator('#logout')
    if (await lo.count() && await lo.first().isVisible()) { await press(touch, lo.first()); await p.waitForTimeout(500); continue }
    const b = p.locator('#burger')
    if (await b.count() && await b.isVisible()) { await press(touch, b); await p.waitForTimeout(300); await press(touch, p.locator('#drawerLogout')); await p.waitForTimeout(500) }
  }
  await p.waitForSelector('#luser', { timeout: 10000 })
}
export async function signIn(p, who, pass) {
  await p.fill('#luser', who); await p.fill('#lpass', pass)
  await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day')
}
/* geometry of a card found by selector: do names/words collide with the hours, LATE, By? are all parts inside the card? */
export const geom2 = (p, sel) => p.locator(sel).first().evaluate(c => {
  const R = b => ({ l: Math.round(b.left), t: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom) })
  const hit = (a, b) => a.l < b.r - 0.5 && b.l < a.r - 0.5 && a.t < b.b - 0.5 && b.t < a.b - 0.5
  const el = k => c.querySelector(`[data-testid$="-${k}"]`)
  const lines = k => { const e = el(k); return e ? [...e.getClientRects()].map(R) : [] }
  const whoL = lines('who'), whenL = lines('when'), lateL = lines('late'), byL = lines('by'), kindL = lines('kind')
  const wordsEl = c.querySelector('.icard-words')
  const wordsL = wordsEl ? [...wordsEl.querySelectorAll('[data-testid$="-title"], [data-testid$="-rmk"]')].flatMap(e => [...e.getClientRects()].map(R)) : []
  const card = R(c.getBoundingClientRect())
  const probs = []
  for (const w of whoL) for (const [nm, o] of [['when', whenL], ['late', lateL], ['kind', kindL]]) for (const x of o) if (hit(w, x)) probs.push('who/' + nm)
  for (const w of wordsL) for (const [nm, o] of [['when', whenL], ['late', lateL], ['by', byL], ['who', whoL], ['kind', kindL]]) for (const x of o) if (hit(w, x)) probs.push('words/' + nm)
  for (const [nm, o] of [['who', whoL], ['kind', kindL], ['when', whenL], ['late', lateL], ['by', byL], ['words', wordsL]]) for (const x of o) if (x.r > card.r + 0.5 || x.l < card.l - 0.5 || x.b > card.b + 0.5 || x.t < card.t - 0.5) probs.push(nm + ' outside card')
  const cut = [...c.querySelectorAll('*')].filter(e => { const s = getComputedStyle(e); return s.textOverflow === 'ellipsis' || ((s.overflow !== 'visible') && (e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1) && e.clientWidth > 0) }).map(e => e.className)
  return { card, probs: [...new Set(probs)], cut, whoLines: whoL.length, whoText: (el('who') || {}).textContent || null, h: card.b - card.t, w: card.r - card.l, scrollOver: c.scrollWidth > c.clientWidth + 1 }
})
