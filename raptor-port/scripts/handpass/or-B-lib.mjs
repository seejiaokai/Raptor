// Walker B (one-rule walk, 12 Oct 26): my own helpers. Real controls only; reads of window.* are READ-ONLY.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const BASE = 'http://localhost:4186/'
export const OUT = 'docs/img/handpass/2026-10-12-one-rule/B'
mkdirSync(OUT, { recursive: true })
export const DESK = { width: 1440, height: 900 }
export const WIN = '[data-testid="win-inputedit"]'
export const errs = []
export const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

export async function launch() { return chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) }

/* a signed-in, memory-only world, clock set three weeks before the week. a toast watcher logs every note. */
export async function openWorld(browser, { who = 'ad', pass = 'a', fresh = true, clock = '2026-06-22T09:00:00' } = {}) {
  const ctx = await browser.newContext({ viewport: DESK, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  if (clock) await page.clock.setFixedTime(new Date(clock))
  const tag = `${who}`
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 300)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 300)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await page.addInitScript(() => {
    window.__toasts = []
    const go = () => new MutationObserver(() => { const t = document.getElementById('toastEl'); if (t && t.style.opacity === '1') { const tx = (t.innerText || t.textContent || '').trim(); const l = window.__toasts[window.__toasts.length - 1]; if (!l || l.text !== tx || performance.now() - l.at > 1500) window.__toasts.push({ text: tx, at: performance.now() }) } }).observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['style', 'class'] })
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
export const toastsSince = async (p, m) => (await p.evaluate(m => (window.__toasts || []).slice(m).map(t => t.text), m)).filter((t, i, a) => i === 0 || t !== a[i - 1]).join(' || ')
export const csId = (p, cs) => p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)
export const csOf = (p, id) => p.evaluate(id => (window.PEOPLE[id] || {}).cs || id, id)

async function pickDate(p, iso) {
  for (let i = 0; i < 36 && !(await p.locator(`#inpEdCal [data-cal="${iso}"]`).count()); i++) {
    const [m, y] = (await p.locator('#inpEdCal .rc-mon').textContent()).split(' ')
    const at = `${y}-${String(MONTHS.findIndex(x => x.startsWith(m.toLowerCase())) + 1).padStart(2, '0')}`
    await p.locator(`#inpEdCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`).click()
  }
  await p.locator(`#inpEdCal [data-cal="${iso}"]`).click()
}

/* the OIL question: answer it (how: 'yes'|'no'|'close') */
export async function answerOil(p, how = 'yes') {
  const sheet = p.locator('[data-testid="oilconf"]')
  if (!(await sheet.count())) return false
  if (how === 'close') {
    const c = p.locator('#oilConfirmClose, [data-testid="oil-close"], [data-testid="oilconf-close"], [data-testid="oilconf-cancel"]').first()
    if (await c.count()) { await c.click() } else await p.keyboard.press('Escape')
    await p.waitForTimeout(300); return true
  }
  const one = sheet.locator(`[data-testid="oil-${how}"]`), many = sheet.locator(`[data-testid="oil-${how === 'yes' ? 'all' : 'none'}"]`)
  await ((await one.count()) ? one : many).first().click()
  await sheet.locator('[data-testid="oilconf-save"]').click()
  await p.waitForTimeout(300)
  return true
}

/* file one input through "+ Input". spec: {type, person, people:[cs], from,to, title, rmk, timed:[s,e], oil:'yes'|'no'|'close'} */
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
    if (spec.ph) { await p.locator(`${WIN} [data-ph="${spec.ph}"]`).scrollIntoViewIfNeeded().catch(() => {}); await p.locator(`${WIN} [data-ph="${spec.ph}"]`).click() }
  }
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
    if (await p.locator('[data-testid="oilconf"]').count()) await answerOil(p, spec.oil || 'no')
    else if (await p.locator('[data-testid="docconf"]').count()) await p.locator('[data-testid="docconf-nodoc"]').click()
    else break
    await p.waitForTimeout(300)
  }
  await p.locator(WIN).waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
  await p.waitForTimeout(300)
  return p.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => ({ iid: r.iid, type: r.type, title: r.title, date: r.date, s: r.s, e: r.e, people: (r.people || []).map(e => (window.PEOPLE[e.p] || {}).cs || e.p), person: (window.PEOPLE[r.person] || {}).cs })), had)
}

/* READ-ONLY: what window.INPUTS says of one input */
export const inputOf = (p, iid) => p.evaluate(iid => {
  const r = window.INPUTS.find(x => x.iid === iid); if (!r) return null
  const f = m => (m == null ? '' : String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'))
  return { iid: r.iid, type: r.type, title: r.title || '', date: r.date, t: f(r.s) + '-' + f(r.e), people: (r.people || []).map(e => (window.PEOPLE[e.p] || {}).cs || e.p), person: (window.PEOPLE[r.person] || {}).cs, cx: !!r.cx, cxr: r.cxr || '', oil: r.oil, info: !!r.info, rmk: r.remarks || '' , raw: JSON.stringify({ oil: r.oil, oilA: r.oilAns, keys: Object.keys(r).join(',') }) }
}, iid)

/* the ground row's index on a day for an input (READ) */
export const rowIdx = (p, di, iid) => p.evaluate(([di, id]) => (window.DAYS[di].ground || []).findIndex(g => g.src === id), [di, iid])
export const rowData = (p, di, iid) => p.evaluate(([di, id]) => { const g = (window.DAYS[di].ground || []).find(g => g.src === id); return g ? JSON.parse(JSON.stringify({ who: g.who, more: g.more, str: g.str, end: g.end, cx: g.cx, info: g.info, prog: g.prog })) : null }, [di, iid])

/* what the week draws on one input's row: callsigns A..Z as drawn (visible, on Edit Schedule's week) */
export const weekRow = (p, di, ri) => p.evaluate(([di, ri]) => {
  const rows = [...document.querySelectorAll(`#eWeek [data-slot^="g:${di}.${ri}"]`)].filter(e => e.offsetParent)
  const out = []
  for (const e of rows) { const m = /^g:\d+\.\d+(\.x\d+|\.\+)?$/.exec(e.getAttribute('data-slot')); if (!m) continue; const pp = e.getAttribute('data-person') || (e.querySelector('[data-person]') || { getAttribute: () => '' }).getAttribute('data-person'); out.push(e.getAttribute('data-slot') + '=' + (pp ? ((window.PEOPLE[pp] || {}).cs || pp) : e.textContent.trim().replace(/\s+/g, ' ').slice(0, 14))) }
  return out
}, [di, ri])

export async function readToast(p) { return p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? (t.innerText || t.textContent || '').trim() : '' }) }

export async function undoRedo(p, which) {
  const board = await p.evaluate(() => window.SBDAY != null)
  const ids = board ? [which === 'undo' ? '#sbUndo' : '#sbRedo', which === 'undo' ? '#undoBtn' : '#redoBtn'] : [which === 'undo' ? '#undoBtn' : '#redoBtn']
  for (const id of ids) {
    const b = p.locator(id).first()
    if ((await b.count()) && (await b.isVisible())) {
      if (await b.isDisabled()) return { used: id + ' (disabled)', ok: false }
      await b.click(); await p.waitForTimeout(600)
      return { used: id, ok: true }
    }
  }
  await p.keyboard.press(which === 'undo' ? 'Control+z' : 'Control+y'); await p.waitForTimeout(600)
  return { used: 'keyboard', ok: true }
}

/* a real drag. to: locator or {x,y} */
export async function drag(p, fromLoc, to, { steps = 14, wait = 120 } = {}) {
  await fromLoc.evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {})
  await p.waitForTimeout(200)
  const fb = await fromLoc.boundingBox()
  if (!fb) throw new Error('drag: no box for source')
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

export function saveJson(file, obj) { writeFileSync(file, JSON.stringify(obj, null, 2)) }
export function loadJson(file, dflt = {}) { try { return JSON.parse(readFileSync(file, 'utf8')) } catch { return dflt } }
