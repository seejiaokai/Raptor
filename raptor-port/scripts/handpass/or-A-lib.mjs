// Walker A (one-rule walk, 12 Oct 26) — my own helpers. Real controls only; window.* is READ only.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const BASE = 'http://localhost:4186/'
export const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-10-12-one-rule/A'
export const PARTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts'
mkdirSync(OUT, { recursive: true })
export const WIN = '[data-testid="win-inputedit"]'
export const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export const SAT = '2026-07-18', SAT_DI = 5
export const errs = []

export const launch = () => chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})

/* a fresh browser context = its own world. clock set three weeks before the week. NOT ?fresh=1 (a reload must keep it). */
export async function openWorld(browser, tag, { who = 'ad', pass = 'a', clock = '2026-06-22T09:00:00' } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  if (clock) await page.clock.setFixedTime(new Date(clock))
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 300)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 300)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await page.addInitScript(() => {
    window.__toasts = []
    const go = () => new MutationObserver(() => { const t = document.getElementById('toastEl'); if (t && t.style.opacity === '1') { const s = (t.textContent || '').trim(); const l = window.__toasts[window.__toasts.length - 1]; if (s && s !== l) window.__toasts.push(s) } }).observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true })
    if (document.documentElement) go(); else document.addEventListener('DOMContentLoaded', go)
  })
  await page.goto(BASE)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await signIn(page, who, pass)
  return { ctx, page }
}
export async function signIn(page, who, pass) {
  await page.waitForSelector('#luser')
  await page.fill('#luser', who); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(500)
}
export async function signOut(page) {
  const b = page.locator('#logout:visible').first()
  if (await b.count()) await b.click(); else await page.evaluate(() => document.getElementById('logout').click())
  await page.waitForSelector('#loginForm', { timeout: 6000 })
}
export async function reload(page, who = 'ad', pass = 'a') {
  await page.reload()
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await page.waitForSelector('#vWeek .day, #loginForm', { state: 'attached' })
  await page.waitForTimeout(400)
  if (await page.locator('#loginForm').isVisible().catch(() => false)) await signIn(page, who, pass)
  await page.waitForTimeout(400)
}
export const shot = async (p, name, clip) => { await p.screenshot({ path: join(OUT, name + '.png'), ...(clip ? { clip } : {}) }); return name + '.png' }
export const toastMark = p => p.evaluate(() => (window.__toasts || []).length)
export const toastsSince = (p, m) => p.evaluate(m => (window.__toasts || []).slice(m).join(' || '), m)
export const toastNow = p => p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? (t.innerText || '').trim() : '' })
export const csId = (p, cs) => p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)

async function pickDate(p, iso) {
  for (let i = 0; i < 36 && !(await p.locator(`#inpEdCal [data-cal="${iso}"]`).count()); i++) {
    const [m, y] = (await p.locator('#inpEdCal .rc-mon').textContent()).split(' ')
    const at = `${y}-${String(MONTHS.findIndex(x => x.startsWith(m.toLowerCase())) + 1).padStart(2, '0')}`
    await p.locator(`#inpEdCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`).click()
  }
  await p.locator(`#inpEdCal [data-cal="${iso}"]`).click()
}
/* file one input through the Inputs page's "+ Input" window. spec: {type, person, people, from, to, title, rmk, timed, oil:'yes'|'no'|'close'} */
export async function fileInput(p, spec) {
  await p.evaluate(() => window.go('inputs'))
  const had = await p.evaluate(() => window.INPUTS.map(r => r.iid))
  if (await p.locator(WIN).count()) { await p.locator('#inpEditCancel').click(); await p.waitForTimeout(150) }
  if (await p.locator('#inListBtn[aria-pressed="false"]').count()) { await p.locator('#inListBtn').click(); await p.waitForTimeout(200) }
  await p.locator('#inNew').click(); await p.locator(WIN).waitFor()
  if (spec.type) await p.selectOption('#inpEditType', spec.type)
  if (spec.person) { const sel = p.locator('#inpEditPerson'); if (await sel.count() && await sel.isEnabled()) await p.selectOption('#inpEditPerson', await csId(p, spec.person)) }
  if (spec.people) {
    await p.locator(`${WIN} [data-testid="pp-several"]`).click()
    const want = []
    for (const cs of spec.people) { const pid = await csId(p, cs); want.push(pid); const b = p.locator(`${WIN} [data-pp="${pid}"]`); if ((await b.getAttribute('aria-pressed')) !== 'true') await b.click() }
    if (spec.ph) await p.locator(`${WIN} [data-ph="${spec.ph}"]`).click()
    const pressed = await p.evaluate(sel => [...document.querySelectorAll(`${sel} [data-pp][aria-pressed="true"]`)].map(b => b.getAttribute('data-pp')), WIN)
    for (const pid of pressed) if (!want.includes(pid)) await p.locator(`${WIN} [data-pp="${pid}"]`).click()
  }
  if (spec.from) await pickDate(p, spec.from)
  if (spec.to) await pickDate(p, spec.to)
  if (spec.timed) {
    if (await p.locator('#inpEditAllday').count() && await p.locator('#inpEditAllday').isChecked()) await p.locator('#inpEditAllday').click()
    await p.fill('#inpEditStart', spec.timed[0]); await p.fill('#inpEditEnd', spec.timed[1])
  }
  if (spec.title != null) await p.fill('#inpEditOwnTitle', spec.title)
  if (spec.rmk != null) await p.fill('#inpEditRmk', spec.rmk)
  if (spec.beforeSave) await spec.beforeSave()
  await p.locator('#inpEditSave').click()
  await p.waitForTimeout(450)
  const out = { sheet: false }
  for (let k = 0; k < 3; k++) {
    const sheet = p.locator('[data-testid="oilconf"]')
    if (await sheet.count()) {
      out.sheet = true
      if (spec.oil === 'close') { out.sheetText = (await sheet.innerText()).replace(/\s+/g, ' ').slice(0, 300); if (spec.beforeClose) await spec.beforeClose(); const cl = p.locator('[data-testid="oilconf"] button.x[aria-label="Close"]').first(); if (await cl.count()) await cl.click(); else await p.keyboard.press('Escape'); out.closed = true }
      else {
        const how = spec.oil || 'no'
        const one = sheet.locator(`[data-testid="oil-${how}"]`), many = sheet.locator(`[data-testid="oil-${how === 'yes' ? 'all' : 'none'}"]`)
        out.sheetText = (await sheet.innerText()).replace(/\s+/g, ' ').slice(0, 300)
        if (spec.beforeAnswer) await spec.beforeAnswer()
        await ((await one.count()) ? one : many).click()
        await sheet.locator('[data-testid="oilconf-save"]').click()
      }
    } else if (await p.locator('[data-testid="docconf"]').count()) await p.locator('[data-testid="docconf-nodoc"]').click()
    else break
    await p.waitForTimeout(300)
  }
  await p.locator(WIN).waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
  await p.waitForTimeout(300)
  out.new = await p.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => ({ iid: r.iid, type: r.type, title: r.title, date: r.date, s: r.s, e: r.e, by: r.by, oil: r.oil, people: (r.people || []).map(e => e.p) })), had)
  return out
}

/* what window.INPUTS says about one input (read only) */
export const inp = (p, iid) => p.evaluate(iid => { const r = window.INPUTS.find(x => x.iid === iid); return r ? JSON.parse(JSON.stringify(r)) : null }, iid)
export const inpBrief = (p, iid) => p.evaluate(iid => {
  const r = window.INPUTS.find(x => x.iid === iid); if (!r) return null
  const cs = id => (window.PEOPLE[id] && window.PEOPLE[id].cs) || id
  const f = m => (m == null ? '' : String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'))
  return { people: (r.people || []).map(e => cs(e.p)), time: f(r.s) + '-' + f(r.e), title: r.title || '', rmk: r.remarks || '', by: r.by, oil: r.oil, cx: r.cx || null, date: r.date, n: window.INPUTS.length }
}, iid)

/* the day's ground row for an input */
export const rowOf = (p, di, iid) => p.evaluate(([di, id]) => { const g = window.DAYS[di].ground || []; const i = g.findIndex(r => r.src === id); const r = g[i]; const cs = x => (window.PEOPLE[x] && window.PEOPLE[x].cs) || x; return { ri: i, who: r && (Array.isArray(r.who) ? r.who.map(cs) : cs(r.who)), more: r && r.more ? JSON.parse(JSON.stringify(r.more)) : null, str: r && r.str, end: r && r.end, prog: r && r.prog, late: r && r.late, rows: g.filter(x => x.src === id).length } }, [di, iid])

/* every surface's draw of the input's row — the people (callsigns) drawn on each */
export const surfaces = (p, title, di) => p.evaluate(([title, di]) => {
  const norm = s => (s || '').trim().toLowerCase()
  const names = r => [...r.querySelectorAll('.puck:not(.rpuck)')].filter(e => e.offsetParent && !e.closest('#eRoster,#sbRoster')).map(n => (n.querySelector('.nm') || n).textContent.trim().replace(/\s+/g, ' '))
  const out = {}
  const week = document.querySelectorAll('#eWeek .day:not(.peek)')[di]
  const pick = (root, sel, nameFn) => root ? [...root.querySelectorAll(sel)].filter(r => norm(nameFn(r)) === norm(title)).map(names) : []
  out.weekGround = pick(week, '.sec-grnd .pl-row', r => r.querySelector('.nm .ntx')?.textContent)
  out.weekInputs = pick(week, '.sec-inp .pl-row', r => r.querySelector('.nm .ntx')?.textContent)
  out.boardGround = [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')].filter(r => r.offsetParent && norm(r.querySelector('textarea.ain, input.ain')?.value) === norm(title)).map(names)
  out.boardInputs = [...document.querySelectorAll('#schedBoard .sb-panel.pinp .sb-arow.inprow')].filter(r => r.offsetParent && norm(r.querySelector('.inpedit')?.textContent) === norm(title)).map(names)
  return out
}, [title, di])

export function save(letter, name, data) { writeFileSync(join(PARTS, `or-${letter}-${name}.tmp.json`), JSON.stringify(data, null, 1)) }
