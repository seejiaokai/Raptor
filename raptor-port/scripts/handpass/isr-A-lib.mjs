// Inputs seen-again recheck, walker A (3 Nov 26) — shared setup, copied from inputs-small-fixes-walk.mjs.
// Writes go through the app controls; the probe bridge (window.INPUTS / PEOPLE / DAYS) is only READ.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { serveFrozen } from './isr-serve.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
export const OUT = process.env.ISR_OUT ? join(process.env.ISR_OUT, 'A') : join(HERE, '../../docs/img/handpass/2026-11-03-inputs-seen-recheck/A')
export const URL = process.env.LOOK_URL || 'http://localhost:4241/'
export const clean = () => { rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true }) }
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
export const results = [], errs = []
export const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
export const SIZES = { desktop: [{ viewport: { width: 1440, height: 900 } }, false], phone: [{ viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true }, true] }
export const say = (l) => { results.push(l); console.log(l) }
export const note = (id, what) => say(`NOTE ${id} — ${what}`)
export const check = (id, name, ok, got) => say(`${ok ? 'PASS' : 'FAIL'} ${id} ${name} — saw ${JSON.stringify(got)}`)
export const notWalked = (id, why) => say(`NOT WALKED ${id} — ${why}`)

export async function session(size, user = 'ad', dsf = 2) {
  const [opts] = SIZES[size]
  const ctx = await browser.newContext({ ...opts, deviceScaleFactor: dsf })
  await serveFrozen(ctx, URL)
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(`page error ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errs.push(`console ${m.text()}`) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`HTTP ${r.status()} ${r.url()}`) })
  await page.goto(URL)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}' })
  await page.fill('#luser', user); await page.fill('#lpass', user === 'ad' ? 'a' : user)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(400)
  /* a recorder of every passing note and every just-changed mark, read by the finds that judge a note */
  await page.evaluate(() => { window.__notes = []; new MutationObserver(() => { const t = document.getElementById('toastEl'); const s = t && (t.textContent || '').replace(/\s+/g, ' ').trim(); if (s && window.__notes[window.__notes.length - 1] !== s) window.__notes.push(s) }).observe(document.body, { subtree: true, childList: true, characterData: true }) })
  return { ctx, page, tap: SIZES[size][1], size }
}
export const go = async (page, p) => { await page.evaluate(p => window.go(p), p); await page.waitForFunction(p => window.CURPAGE === p, p); await page.waitForTimeout(350) }
export const tid = (page, t) => page.locator(`[data-testid="${t}"]`)
export const press = async (page, tap, loc) => { const l = (typeof loc === 'string' ? page.locator(loc) : loc).first(); await (tap ? l.tap() : l.click()); await page.waitForTimeout(tap ? 650 : 120) }
export const mark = (page, sel) => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().height > 0); if (e) { e.scrollIntoView({ block: 'center' }); e.style.outline = '3px solid #ff3b6b'; e.style.outlineOffset = '2px' } return !!e }, sel)
export const unmark = (page, sel) => page.evaluate(sel => { for (const e of document.querySelectorAll(sel)) { e.style.removeProperty('outline'); e.style.removeProperty('outline-offset') } }, sel)
export const text = (page, sel) => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().height > 0); return e ? (e.textContent || '').replace(/\s+/g, ' ').trim() : null }, sel)
export const shot = async (page, id, size, what) => { const f = join(OUT, `${id}-${size}-${what}.png`); await page.screenshot({ path: f }); return f }
export const toastText = (page) => page.evaluate(() => { const t = document.getElementById('toastEl'); if (!t) return null; const r = t.getBoundingClientRect(); const cs = getComputedStyle(t); return (r.height > 0 && cs.visibility !== 'hidden' && +cs.opacity > 0.05) ? (t.textContent || '').replace(/\s+/g, ' ').trim() : '' })
export const notes = (page) => page.evaluate(() => (window.__notes || []).slice())
export const undoState = (page) => page.evaluate(() => { const u = document.getElementById('undoBtn'), r = document.getElementById('redoBtn'); return { undo: u && { disabled: u.disabled, title: u.title, aria: u.getAttribute('aria-label') }, redo: r && { disabled: r.disabled, title: r.title } } })
export const rec = (page, iid) => page.evaluate(iid => { const r = window.INPUTS.find(x => String(x.iid) === String(iid)); return r ? { type: r.type, date: r.date, endDate: r.endDate, person: r.person, people: r.people && r.people.map(e => e.p), remarks: r.remarks, title: r.title, mod: r.mod, by: r.by, at: r.at, modBy: r.modBy, modAt: r.modAt } : null }, iid)

export async function incalMonth(page, tap, y, m) {
  for (let i = 0; i < 80; i++) {
    const [name, year] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.indexOf(name.slice(0, 3)))
    if (!d) { await page.waitForTimeout(350); return }
    await press(page, tap, d > 0 ? '#icNext' : '#icPrev'); await page.waitForTimeout(300)
  }
  throw new Error('Inputs calendar never reached the month')
}
export async function winMonth(page, tap, iso) {
  for (let i = 0; i < 40 && !(await page.locator(`#inpEdCal [data-iso="${iso}"]`).count()); i++) {
    const [m, y] = (await page.locator('#inpEdCal .dcal-my').innerText()).trim().split(/\s+/)
    const at = `${y}-${String(MONTHS.indexOf(m.toLowerCase().slice(0, 3)) + 1).padStart(2, '0')}`
    await press(page, tap, `#inpEdCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`)
  }
}
export async function toInputsCal(page, tap) {
  await go(page, 'inputs')
  if (await page.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await press(page, tap, '#inCalBtn')
}
export async function openDay(page, iso) {
  await page.locator(`#inpCal [data-icday="${iso}"]`).focus()
  await page.keyboard.press('Enter')
  await tid(page, 'win-inputsday').waitFor()
  await page.waitForTimeout(300)
}
export const freeMen = (page, k, days = [3, 4, 5]) => page.evaluate(([k, days]) => {
  const P = window.PEOPLE, D = window.DAYS
  return Object.keys(P).filter(id => !P[id].special && !P[id].pers && !P[id].archived && !P[id].san
    && days.every(d => !JSON.stringify(D[d]).includes(`"${id}"`))
    && !window.INPUTS.some(r => JSON.stringify(r).includes(`"${id}"`) && days.some(d => window.inputCoversDate(r, D[d].dt)))).slice(0, k)
}, [k, days])
/* file an input through a day of the Inputs calendar and its "+ Input"; leaves the day window open when keepDay */
export async function fileOn(page, tap, iso, spec, keepDay = false) {
  await toInputsCal(page, tap)
  await incalMonth(page, tap, +iso.slice(0, 4), +iso.slice(5, 7))
  await openDay(page, iso)
  const before = await page.evaluate(() => window.INPUTS.map(r => String(r.iid)))
  await press(page, tap, '#icPopAdd')
  await page.locator('#inpEditPop #inpEditType').waitFor()
  await page.selectOption('#inpEditPop #inpEditType', spec.type)
  if (spec.people.length > 1) {
    await press(page, tap, '#inpEditPop [data-testid="pp-several"]')
    for (const id of spec.people) if ((await page.locator(`#inpEditPop [data-pp="${id}"]`).getAttribute('aria-pressed')) !== 'true') await press(page, tap, `#inpEditPop [data-pp="${id}"]`)
    const lit = await page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
    for (const id of lit) if (!spec.people.includes(id)) await press(page, tap, `#inpEditPop [data-pp="${id}"]`)
  } else await page.selectOption('#inpEditPop #inpEditPerson', spec.people[0])
  if (spec.end) { await winMonth(page, tap, spec.end); await press(page, tap, `#inpEdCal [data-iso="${spec.end}"]`) }
  const ad = page.locator('#inpEditPop #inpEditAllday')
  if (spec.from) { if (await ad.count() && await ad.isChecked()) await ad.click(); await page.fill('#inpEditPop #inpEditStart', spec.from); await page.fill('#inpEditPop #inpEditEnd', spec.to) }
  if (spec.title && await page.locator('#inpEditPop #inpEditOwnTitle').count()) await page.fill('#inpEditPop #inpEditOwnTitle', spec.title)
  if (spec.remarks) await page.fill('#inpEditPop #inpEditRmk', spec.remarks)
  await press(page, tap, '#inpEditSave')
  await page.waitForTimeout(400)
  if (await tid(page, 'oilconf').count()) { await press(page, tap, (await tid(page, 'oil-all').count()) ? '[data-testid="oil-all"]' : '[data-testid="oil-yes"]'); await press(page, tap, '[data-testid="oilconf-save"]'); await page.waitForTimeout(300) }
  if (await tid(page, 'docconf-nodoc').count()) { await press(page, tap, '[data-testid="docconf-nodoc"]'); await page.waitForTimeout(300) }
  if (!keepDay && await tid(page, 'win-inputsday-x').count()) await press(page, tap, '[data-testid="win-inputsday-x"]')
  const made = await page.evaluate(b => window.INPUTS.map(r => String(r.iid)).filter(x => !b.includes(x)), before)
  return made.length === 1 ? made[0] : null
}
export async function finish(name) {
  await browser.close()
  const lines = [...results, ...errs.map(e => 'BROWSER ' + e)]
  writeFileSync(join(OUT, `results-${name}.txt`), lines.join('\n') + '\n')
  console.log(`\n${results.filter(r => r.startsWith('PASS')).length} PASS · ${results.filter(r => r.startsWith('FAIL')).length} FAIL · ${results.filter(r => r.startsWith('NOT WALKED')).length} NOT WALKED · ${errs.length} browser errors`)
}
