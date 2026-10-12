// Walker K helpers (one-rule walk, 12 Oct 26). Real controls only; window.INPUTS / PEOPLE / DAYS are READ only.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const BASE = 'http://localhost:4186/'
export const OUT = 'docs/img/handpass/2026-10-12-one-rule/K'
mkdirSync(OUT, { recursive: true })
mkdirSync('docs/handpass/parts', { recursive: true })
export const WIN = '[data-testid="win-inputedit"]'
export const DESK = { width: 1440, height: 900 }
export const ISO = '2026-07-15', DI = 2
export const TITLE = 'Range brief'
export const errs = []
export const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})

/* a browser context, signed in. fresh: memory-only world. clock: set 3 weeks before the week. */
export async function openWorld({ who = 'ad', pass = 'a', fresh = false, clock = '2026-06-22T09:00:00', viewport = DESK } = {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  await wire(page, `${who}`)
  if (clock) await page.clock.setFixedTime(new Date(clock))
  await page.goto(BASE + (fresh ? '?fresh=1' : ''))
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await page.fill('#luser', who); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(600)
  return { ctx, page }
}
export async function wire(page, tag) {
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 300)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 300)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await page.addInitScript(() => {
    window.__toasts = []
    const go = () => new MutationObserver(ms => { const hit = ms.some(m => { const n = m.target; const el = n.nodeType === 1 ? n : n.parentElement; return (el && (el.id === 'toastEl' || el.closest('#toastEl'))) || [...m.addedNodes].some(x => x.id === 'toastEl') }); if (!hit) return; const t = document.getElementById('toastEl'); if (t && t.style.opacity === '1') window.__toasts.push({ text: t.textContent, at: performance.now() }) }).observe(document.documentElement, { subtree: true, childList: true, characterData: true })
    if (document.documentElement) go(); else document.addEventListener('DOMContentLoaded', go)
  })
}
/* reload; sign in as `who` if the card shows */
export async function reload(page, who = 'ad', pass = 'a') {
  await page.reload()
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await page.waitForSelector('#vWeek .day, #loginForm', { state: 'attached' })
  await page.waitForTimeout(500)
  if (await page.locator('#loginForm').isVisible().catch(() => false)) {
    await page.fill('#luser', who); await page.fill('#lpass', pass)
    await page.click('#loginForm button[type=submit]')
    await page.waitForSelector('#vWeek .day', { state: 'attached' })
    await page.waitForTimeout(600)
  }
}
export const shot = async (p, name, clip) => { await p.screenshot({ path: join(OUT, name + '.png'), ...(clip ? { clip } : {}) }); console.log('saved ' + name); return name + '.png' }
export const shotEl = async (loc, name) => {
  await loc.scrollIntoViewIfNeeded().catch(() => {})
  try { await loc.screenshot({ path: join(OUT, name + '.png'), timeout: 8000 }) }
  catch { const b = await loc.boundingBox(); await loc.page().screenshot({ path: join(OUT, name + '.png'), clip: { x: Math.max(0, b.x), y: Math.max(0, b.y), width: Math.min(b.width, 1440), height: Math.min(b.height, 900 - Math.max(0, b.y)) } }) }
  console.log('saved ' + name); return name + '.png'
}
export const toastMark = p => p.evaluate(() => (window.__toasts || []).length)
export const toastsSince = async (p, m) => (await p.evaluate(m => (window.__toasts || []).slice(m).map(t => t.text), m)).filter((t, i, a) => i === 0 || t !== a[i - 1]).join(' || ')
export const toast = p => p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? (t.innerText || t.textContent || '').replace(/\s+/g, ' ').trim() : '' })
export const press = loc => loc.click()
export const csId = (p, cs) => p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)

/* ---- filing an input through "+ Input" (copied from gi-lib.mjs; ph: ['allavail'] presses the placeholder puck) ---- */
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
async function pick(p, iso) {
  for (let i = 0; i < 36 && !(await p.locator(`#inpEdCal [data-cal="${iso}"]`).count()); i++) {
    const [m, y] = (await p.locator('#inpEdCal .rc-mon').textContent()).split(' ')
    const at = `${y}-${String(MONTHS.findIndex(x => x.startsWith(m.toLowerCase())) + 1).padStart(2, '0')}`
    await p.locator(`#inpEdCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`).click()
  }
  await p.locator(`#inpEdCal [data-cal="${iso}"]`).click()
}
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
    for (const ph of spec.ph || []) await p.locator(`${WIN} [data-ph="${ph}"]`).click()
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
      const one = sheet.locator(`[data-testid="oil-${how}"]`), many = sheet.locator(`[data-testid="oil-${how === 'yes' ? 'all' : 'none'}"]`)
      await ((await one.count()) ? one : many).click()
      await sheet.locator('[data-testid="oilconf-save"]').click()
    } else if (await p.locator('[data-testid="docconf"]').count()) await p.locator('[data-testid="docconf-nodoc"]').click()
    else break
    await p.waitForTimeout(300)
  }
  await p.locator(WIN).waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
  await p.waitForTimeout(300)
  return inputsNow(p, had)
}
export const inputsNow = (p, had = []) => p.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => ({ iid: r.iid, people: (r.people || []).map(e => window.PEOPLE[e.p]?.cs || e.p), ph: r.ph || undefined, type: r.type, title: r.title, date: r.date, s: r.s, e: r.e, cx: r.cx || undefined, cxr: r.cxr || undefined, rmk: r.remarks || r.rmk || undefined })), had)
/* what window.INPUTS says about the inputs with a title (read only) */
export const inputsOf = (p, title = TITLE) => p.evaluate(title => window.INPUTS.filter(r => (r.title || '').toLowerCase() === title.toLowerCase()).map(r => ({ iid: r.iid, date: r.date, s: r.s, e: r.e, people: (r.people || []).map(e => window.PEOPLE[e.p]?.cs || e.p), keys: Object.keys(r).filter(k => /all|ph|cx|rmk|remark|off|prog|red|info/i.test(k)).reduce((o, k) => (o[k] = r[k], o), {}) })), title)

/* ---- navigation ---- */
export async function goWeek(p) {
  if (await p.locator('#schedBoard').count()) { await p.evaluate(() => window.closeScheduler && window.closeScheduler()); await p.waitForTimeout(500) }
  if ((await p.evaluate(() => window.CURPAGE)) !== 'editsched') { await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(700) }
}
export async function goView(p) {
  if (await p.locator('#schedBoard').count()) { await p.evaluate(() => window.closeScheduler && window.closeScheduler()); await p.waitForTimeout(500) }
  await p.evaluate(() => window.go('viewsched')); await p.waitForTimeout(800)
}
export async function goBoard(p, di = DI) {
  const open = await p.evaluate(() => (document.querySelector('#schedBoard') ? window.SBDAY : null))
  if (open === di) return
  await goWeek(p)
  await p.evaluate(d => window.openScheduler(d), di); await p.waitForSelector('#schedBoard'); await p.waitForTimeout(900)
}
export const hideToast = p => p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' })
export const showToast = p => p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = '' })

/* open Personal Inputs on a surface (it folds again after a reload) */
export async function openFold(p, surface, di = DI, root = '#eWeek') {
  const rows = () => p.evaluate(([sf, r]) => document.querySelectorAll(sf === 'board' ? '#schedBoard .pinp .sb-arow' : `${r} .day:not(.peek) .sec-inp .pl-row`).length, [surface, root])
  if (await rows()) return
  const sel = surface === 'board' ? `#schedBoard [data-pitog="${di}"]` : `${root} .day:not(.peek) [data-pitog="${di}"]`
  const f = p.locator(sel).first()
  if (await f.count()) { await f.evaluate(e => e.scrollIntoView({ block: 'center' })); await f.click(); await p.waitForTimeout(450) }
}
/* every surface's draw of a titled input - the people on the Ground row and Personal Inputs line; week | board | vweek */
export const readRows = (p, title = TITLE) => p.evaluate(title => {
  const t = title.toLowerCase()
  const norm = s => (s || '').trim().toLowerCase()
  const names = r => [...r.querySelectorAll('.ppl .puck')].map(n => { const nm = (n.querySelector('.nm')?.textContent || n.textContent).trim(); return nm })
  const pick = (sel, name) => [...document.querySelectorAll(sel)].filter(r => norm(name(r)) === t).map(r => ({ who: names(r), times: [...r.querySelectorAll('.t')].map(e => e.textContent.trim()).filter(Boolean).join(' '), text: r.innerText.replace(/\s+/g, ' ').trim().slice(0, 140) }))
  return {
    weekGround: pick('#eWeek .day:not(.peek) .sec-grnd .pl-row', r => r.querySelector('.nm .ntx')?.textContent),
    weekInputs: pick('#eWeek .day:not(.peek) .sec-inp .pl-row', r => r.querySelector('.nm .ntx')?.textContent),
    boardGround: pick('#schedBoard .sb-panel.grnd .sb-arow', r => r.querySelector('textarea.ain, input.ain')?.value),
    boardInputs: pick('#schedBoard .sb-panel.pinp .sb-arow.inprow', r => r.querySelector('.inpedit')?.textContent),
    viewGround: pick('#vWeek .day:not(.peek) .sec-grnd .pl-row', r => r.querySelector('.nm .ntx')?.textContent),
    viewInputs: pick('#vWeek .day:not(.peek) .sec-inp .pl-row', r => r.querySelector('.nm .ntx')?.textContent),
  }
}, title)

/* a real drag with the mouse */
export async function drag(p, fromLoc, to, { steps = 14, wait = 120 } = {}) {
  await fromLoc.scrollIntoViewIfNeeded().catch(() => {})
  const fb = await fromLoc.boundingBox()
  if (!fb) throw new Error('drag: no box for source')
  const fx = fb.x + fb.width / 2, fy = fb.y + fb.height / 2
  await p.mouse.move(fx, fy); await p.mouse.down()
  await p.mouse.move(fx + 6, fy + 6, { steps: 3 })
  let t
  if (to.x != null) t = { x: to.x, y: to.y }
  else { const tb = await to.boundingBox(); if (!tb) throw new Error('drag: no box for target'); t = { x: tb.x + tb.width / 2, y: tb.y + tb.height / 2 } }
  await p.mouse.move(t.x, t.y, { steps })
  await p.waitForTimeout(wait)
  await p.mouse.move(t.x + 1, t.y + 1)
  await p.waitForTimeout(wait)
  await p.mouse.up()
  await p.waitForTimeout(600)
}
export const rowLoc = async (p, where, title = TITLE) => {
  const SEL = { weekG: '#eWeek .day:not(.peek) .sec-grnd .pl-row', weekI: '#eWeek .day:not(.peek) .sec-inp .pl-row', boardG: '#schedBoard .sb-panel.grnd .sb-arow', boardI: '#schedBoard .sb-panel.pinp .sb-arow.inprow', viewG: '#vWeek .day:not(.peek) .sec-grnd .pl-row', viewI: '#vWeek .day:not(.peek) .sec-inp .pl-row' }[where]
  const idx = await p.evaluate(([sel, where, t]) => [...document.querySelectorAll(sel)].findIndex(r => {
    const nm = /^(weekG|weekI|viewG|viewI)$/.test(where) ? r.querySelector('.nm .ntx')?.textContent : where === 'boardG' ? r.querySelector('textarea.ain, input.ain')?.value : r.querySelector('.inpedit')?.textContent
    return (nm || '').trim().toLowerCase() === t.toLowerCase()
  }), [SEL, where, title])
  return idx < 0 ? null : p.locator(SEL).nth(idx)
}
export const scrollToSec = (p, key, di = DI) => p.evaluate(([di, key]) => {
  const day = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]
  day.scrollIntoView({ inline: 'start', block: 'nearest' })
  const sec = day.querySelector(`[data-secmove="${di}.${key}"]`)
  const y = sec.getBoundingClientRect().top + window.scrollY - 96
  window.scrollTo(0, Math.max(0, y))
}, [di, key])
export const rosterPuck = async (p, cs, board) => p.locator(`${board ? '#sbRoster' : '#eRoster'} .rpuck[data-person="${await csId(p, cs)}"]`).first()

/* undo / redo (top bar; the board has its own pair) */
export async function undoRedo(p, which) {
  const board = await p.evaluate(() => window.SBDAY != null && !!document.querySelector('#schedBoard'))
  const ids = board ? [which === 'undo' ? '#sbUndo' : '#sbRedo', which === 'undo' ? '#undoBtn' : '#redoBtn'] : [which === 'undo' ? '#undoBtn' : '#redoBtn']
  for (const id of ids) {
    const b = p.locator(id).first()
    if ((await b.count()) && (await b.isVisible())) {
      if (await b.isDisabled()) return { used: id + ' (disabled)', ok: false }
      await b.click(); await p.waitForTimeout(600)
      return { used: id, ok: true }
    }
  }
  return { used: 'none', ok: false }
}

/* report data */
export const RESFILE = 'docs/handpass/parts/or-K.json'
export function saveRes(key, obj) {
  const all = existsSync(RESFILE) ? JSON.parse(readFileSync(RESFILE, 'utf8')) : {}
  all[key] = obj
  writeFileSync(RESFILE, JSON.stringify(all, null, 1))
}
export function saveErrs() { saveRes('_errors_' + Date.now(), errs.slice()) }
