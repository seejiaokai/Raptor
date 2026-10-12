// Walker H (one-rule walk, 12 Oct 26) - my own helpers. Real controls only; reads of window.* are reads.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const BASE = 'http://localhost:4186/'
export const OUT = 'docs/img/handpass/2026-10-12-one-rule/H'
export const DATA = 'docs/handpass/parts/or-H.json'
mkdirSync(OUT, { recursive: true })
export const WIN = '[data-testid="win-inputedit"]'
export const errs = []
export const DESK = { width: 1440, height: 900 }
export const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

export const launch = () => chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})

/* record a result into the json (merged by key) */
export function save(key, val) {
  let d = {}
  try { d = JSON.parse(readFileSync(DATA, 'utf8')) } catch {}
  d[key] = val
  writeFileSync(DATA, JSON.stringify(d, null, 1))
}

export async function open(browser, { who = 'ad', pass = 'a', clock = '2026-06-22T09:00:00', fresh = true, viewport = DESK } = {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  if (clock) await page.clock.setFixedTime(new Date(clock))
  const tag = `${who}`
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 300)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 300)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await page.addInitScript(() => {
    window.__toasts = []
    const go = () => new MutationObserver(() => { const t = document.getElementById('toastEl'); if (t && t.style.opacity === '1') { const s = (t.innerText || t.textContent || '').trim(); const l = window.__toasts[window.__toasts.length - 1], now = performance.now(); if (s && (!l || l.text !== s || now - l.at > 700)) window.__toasts.push({ text: s, at: now }) } }).observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['style', 'class'] })
    if (document.documentElement) go(); else document.addEventListener('DOMContentLoaded', go)
  })
  await page.goto(BASE + (fresh ? '?fresh=1' : ''))
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await page.fill('#luser', who); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  await page.waitForTimeout(500)
  return { ctx, page }
}
export const shot = async (p, name, clip) => { await p.screenshot({ path: join(OUT, name + '.png'), ...(clip ? { clip } : {}) }); return name + '.png' }
export const toastMark = p => p.evaluate(() => (window.__toasts || []).length)
export const toastsSince = async (p, m) => (await p.evaluate(m => (window.__toasts || []).slice(m).map(t => t.text), m)).join(' || ')
export const csId = (p, cs) => p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)
export const badge = p => p.evaluate(() => { const b = document.querySelector('#whoBadge, .whobadge, #nameBadge'); return b ? b.textContent.trim() : null })

async function pickDate(p, iso) {
  for (let i = 0; i < 36 && !(await p.locator(`#inpEdCal [data-cal="${iso}"]`).count()); i++) {
    const [m, y] = (await p.locator('#inpEdCal .rc-mon').textContent()).split(' ')
    const at = `${y}-${String(MONTHS.findIndex(x => x.startsWith(m.toLowerCase())) + 1).padStart(2, '0')}`
    await p.locator(`#inpEdCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`).click()
  }
  await p.locator(`#inpEdCal [data-cal="${iso}"]`).click()
}
/* answer the OIL question if it stands: how = 'yes' | 'no' | 'close' */
export async function oilAnswer(p, how) {
  const sheet = p.locator('[data-testid="oilconf"]')
  if (!(await sheet.count())) return false
  if (how === 'close') {
    const c = p.locator('[data-testid="oilconf"] [data-testid="oilconf-close"], [data-testid="oilconf"] [aria-label="Close"], #oilConfirmClose, [data-testid="oil-close"]').first()
    if (await c.count()) { await c.click(); await p.waitForTimeout(300); return 'closed' }
    await p.keyboard.press('Escape'); await p.waitForTimeout(300); return 'esc'
  }
  const one = sheet.locator(`[data-testid="oil-${how}"]`), many = sheet.locator(`[data-testid="oil-${how === 'yes' ? 'all' : 'none'}"]`)
  await ((await one.count()) ? one : many).first().click()
  await sheet.locator('[data-testid="oilconf-save"]').click()
  await p.waitForTimeout(300)
  return how
}
/* file through "+ Input". spec: {type, person, people, from, to, title, rmk, timed, oil} */
export async function fileInput(p, spec) {
  await p.evaluate(() => window.go('inputs'))
  const had = await p.evaluate(() => window.INPUTS.map(r => r.iid))
  if (await p.locator(WIN).count()) { await p.locator('#inpEditCancel').click(); await p.waitForTimeout(150) }
  if (await p.locator('#inListBtn[aria-pressed="false"]').count()) { await p.locator('#inListBtn').click(); await p.waitForTimeout(200) }
  await p.locator('#inNew').click(); await p.locator(WIN).waitFor()
  if (spec.type) await p.selectOption('#inpEditType', spec.type)
  if (spec.person) await p.selectOption('#inpEditPerson', await csId(p, spec.person))
  if (spec.people) {
    await p.locator(`${WIN} [data-testid="pp-several"]`).click()
    const want = []
    for (const cs of spec.people) { const pid = await csId(p, cs); want.push(pid); const b = p.locator(`${WIN} [data-pp="${pid}"]`); if ((await b.getAttribute('aria-pressed')) !== 'true') await b.click() }
    const pressed = await p.evaluate(sel => [...document.querySelectorAll(`${sel} [data-pp][aria-pressed="true"]`)].map(b => b.getAttribute('data-pp')), WIN)
    for (const pid of pressed) if (!want.includes(pid)) await p.locator(`${WIN} [data-pp="${pid}"]`).click()
  }
  if (spec.placeholder) await p.locator(`${WIN} button`, { hasText: new RegExp('^' + spec.placeholder + '$') }).first().click()
  if (spec.from) await pickDate(p, spec.from)
  if (spec.to) await pickDate(p, spec.to)
  if (spec.timed) {
    if (await p.locator('#inpEditAllday').count() && await p.locator('#inpEditAllday').isChecked()) await p.locator('#inpEditAllday').click()
    await p.fill('#inpEditStart', spec.timed[0]); await p.fill('#inpEditEnd', spec.timed[1])
  }
  if (spec.title != null) await p.fill('#inpEditOwnTitle', spec.title)
  if (spec.rmk != null) await p.fill('#inpEditRmk', spec.rmk)
  await p.locator('#inpEditSave').click()
  await p.waitForTimeout(350)
  for (let k = 0; k < 3; k++) {
    if (await p.locator('[data-testid="oilconf"]').count()) await oilAnswer(p, spec.oil || 'no')
    else if (await p.locator('[data-testid="docconf"]').count()) await p.locator('[data-testid="docconf-nodoc"]').click()
    else break
    await p.waitForTimeout(300)
  }
  await p.locator(WIN).waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
  await p.waitForTimeout(300)
  return p.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => ({ iid: r.iid, cs: window.PEOPLE[r.person]?.cs, type: r.type, title: r.title, date: r.date, s: r.s, e: r.e, people: (r.people || []).map(e => e.p), by: r.by, oil: r.oil })), had)
}
export const inputOf = (p, iid) => p.evaluate(iid => { const r = window.INPUTS.find(x => x.iid === iid); return r ? JSON.parse(JSON.stringify(r)) : null }, iid)
/* open an input's window from the Inputs List by its iid (or from the month) */
export async function openFromList(p, iid) {
  await p.evaluate(() => window.go('inputs'))
  if (await p.locator(WIN).count()) { await p.locator('#inpEditCancel').click().catch(() => {}); await p.waitForTimeout(150) }
  if (await p.locator('#inListBtn[aria-pressed="false"]').count()) { await p.locator('#inListBtn').click(); await p.waitForTimeout(250) }
  const el = p.locator(`[data-popiid="${iid}"], [data-iid="${iid}"], [data-listiid="${iid}"]`).first()
  if (!(await el.count())) { await p.locator('#inRangeBtn').click(); await p.waitForTimeout(250); if (await p.locator('#inRangeAll').count()) await p.locator('#inRangeAll').click(); await p.waitForTimeout(350) }
  if (!(await el.count())) { await shot(p, 'dbg-list-missing'); console.log('LIST MISSING ' + iid + ' :: ' + await p.evaluate(() => document.body.innerText.slice(0, 1500).replace(/\s+/g, ' '))); throw new Error('list row missing') }
  await el.scrollIntoViewIfNeeded().catch(() => {})
  await el.click()
  await p.locator(WIN).waitFor()
  await p.waitForTimeout(250)
}
/* describe the window: every field as a box or plain value; buttons; sentences */
export const describeWin = p => p.evaluate(sel => {
  const w = document.querySelector(sel); if (!w) return null
  const vis = e => e.getClientRects().length > 0
  const inCal = e => e.closest('#inpEdCal')
  const fields = [...w.querySelectorAll('input, textarea, select')].filter(e => vis(e) && !inCal(e)).map(e => ({ id: e.id || e.getAttribute('data-testid') || e.name || e.tagName, tag: e.tagName.toLowerCase() + (e.type ? ':' + e.type : ''), value: e.type === 'checkbox' ? e.checked : e.value, disabled: e.disabled || e.readOnly }))
  const buttons = [...w.querySelectorAll('button, [role=button]')].filter(b => vis(b) && !inCal(b) && !b.hasAttribute('data-pp')).map(b => ({ id: b.id || b.getAttribute('data-testid') || '', text: (b.innerText || b.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 60), disabled: b.disabled }))
  const hid = [...w.querySelectorAll('#inpEdCal, [data-pp]')]; const old = hid.map(e => e.style.display); hid.forEach(e => { e.style.display = 'none' })
  const pp = [...w.querySelectorAll('[data-pp]')].filter(e => e.getAttribute('data-pp'))
  const ppInfo = { n: pp.length, pressed: pp.filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.getAttribute('data-pp')) }
  const text = w.innerText.split(/[\r\n]+/).map(x => x.trim()).filter(Boolean).join(' | ').slice(0, 1800)
  hid.forEach((e, i) => { e.style.display = old[i] })
  return { text, fields, buttons, picker: ppInfo }
}, WIN)
export const sleep = (p, ms) => p.waitForTimeout(ms)

/* a real drag with the mouse */
export async function drag(p, fromLoc, to, { steps = 14, wait = 120 } = {}) {
  const fb = await fromLoc.boundingBox(); if (!fb) throw new Error('drag: no source box')
  const fx = fb.x + fb.width / 2, fy = fb.y + fb.height / 2
  const tb = to.x != null ? { x: to.x, y: to.y } : await (async () => { const b = await to.boundingBox(); if (!b) throw new Error('drag: no target box'); return { x: b.x + b.width / 2, y: b.y + b.height / 2 } })()
  await p.mouse.move(fx, fy); await p.mouse.down()
  await p.mouse.move(fx + 6, fy + 6, { steps: 3 })
  await p.mouse.move(tb.x, tb.y, { steps })
  await p.waitForTimeout(wait); await p.mouse.move(tb.x + 1, tb.y + 1); await p.waitForTimeout(wait)
  await p.mouse.up(); await p.waitForTimeout(550)
}

export const ID = { Saber: 'stiff', Ranger: 'bane', Tally: 'nick', Hex: 'rocky' }
export const as = async (p, name) => { await p.evaluate(([id, role]) => { window.raptorMe(id); window.raptorRole(role) }, [ID[name], name === 'Saber' ? 'admin' : 'member']); await p.waitForTimeout(450) }
export const badgeText = p => p.evaluate(() => document.getElementById('roleBadge').textContent)
/* the bell: state, and (open = true) press it and read the list. A tap that goes to an OIL question first is reported. */
export async function bellRead(p, { open = true, close = true } = {}) {
  const sel = (await p.locator('#sbBell').isVisible().catch(() => false)) ? '#sbBell' : '#notifyBell'
  const state = () => p.evaluate(s => { const b = document.querySelector(s); return b ? { lit: b.classList.contains('on'), open: b.getAttribute('aria-expanded') } : null }, sel)
  const st0 = await state()
  if (!open) return { before: st0 }
  await p.locator(sel).click(); await p.waitForTimeout(450)
  const oil = await p.locator('[data-testid="oilconf"]').count()
  const list = await p.evaluate(() => { const l = document.querySelector('.bell-list'); if (!l) return null; return { empty: (l.querySelector('.bl-empty') || {}).textContent || null, lines: [...l.querySelectorAll('.bl-line')].map(e => ({ unread: e.classList.contains('unread'), text: e.innerText.replace(/\s+/g, ' ').trim() })) } })
  const res = { before: st0, oilQuestionOpened: oil, list }
  if (close && list) { await p.locator(sel).click().catch(() => {}); await p.waitForTimeout(200) }
  return res
}

/* Saber declares a day a public holiday through the Inputs gear -> Calendar... -> Holidays -> + Add (the app's own controls) */
export async function declareHoliday(p, iso, name = 'Test holiday') {
  const tid = id => p.locator(`[data-testid="${id}"]`)
  await p.evaluate(() => window.go('inputs')); await p.waitForTimeout(300)
  await p.locator('#inGear').click(); await p.waitForTimeout(300)
  await p.locator('[data-testid="win-inputsset"] button', { hasText: /Calendar/ }).first().click(); await p.waitForTimeout(500)
  await tid('days-tab-holidays').click(); await p.waitForTimeout(250)
  await tid('hol-add').click(); await p.waitForTimeout(250)
  await tid('hol-name').fill(name); await tid('hol-short').fill('TH')
  const want = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1)
  for (let i = 0; i < 24; i++) {
    const [m, y] = (await tid('holcal-month').textContent()).trim().toLowerCase().split(/\s+/)
    const at = +y * 12 + MONTHS.findIndex(x => x.startsWith(m.slice(0, 3)))
    if (at === want) break
    await tid(at < want ? 'holcal-next-month' : 'holcal-prev-month').click()
  }
  await tid(`holcal-day-${iso}`).click(); await tid(`holcal-day-${iso}`).click(); await p.waitForTimeout(200)
  await tid('hol-save').click()
  await p.waitForTimeout(500)
  const left = await p.evaluate(() => [...document.querySelectorAll('[data-testid^=win]')].filter(e => e.getClientRects().length).map(e => e.getAttribute('data-testid')))
  for (const x of ['win-days-x', 'win-inputsset-x']) { if (await tid(x).count()) await tid(x).click().catch(() => {}); await p.waitForTimeout(200) }
  return left
}
