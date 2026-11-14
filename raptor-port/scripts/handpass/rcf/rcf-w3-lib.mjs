/* rcf-w3 shared helpers v1 (12 Nov 26) — walker W3 of the rules check's walk. Own world per run (a NEW browser context,
   real storage), desktop or iPhone-size. Nothing here builds or serves anything. */
import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../../..')
process.env.HP_URL ||= 'http://localhost:4291'
export const RUN = process.env.RCF_RUN || 'run'
process.env.HP_SHOTS ||= resolve(ROOT, 'docs/img/handpass/2026-11-12-rules-check-fixes/w3', RUN)
export const L = await import('../lib.mjs')
export const SHOTS = L.SHOTS
const { chromium } = await import('@playwright/test')
mkdirSync(SHOTS, { recursive: true })
export const LOG = resolve(SHOTS, 'log.txt')
export function say(...a) { const s = a.join(' '); console.log(s); try { appendFileSync(LOG, s + '\n') } catch {} }
export const results = []
export function check(id, ok, d = '') { results.push([id, ok === true ? 'PASS' : ok === false ? 'FAIL' : ok]); say(`${ok === true ? 'PASS' : ok === false ? 'FAIL' : ok}  ${id}  ${d}`) }
export const nrm = s => String(s || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim()

export async function openWorld({ phone = false, who = 'a' } = {}) {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
    : { viewport: { width: 1536, height: 864 } })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(L.BASE + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await L.login(page, who)
  return { browser, ctx, page, errors }
}

export const pic = (page, name, loc) => L.shot(page, name, loc)

/** the board's visible warning list as lines */
export async function warnLines(page) {
  return page.evaluate(() => {
    const side = document.querySelector('#sbSide')
    if (!side) return []
    return (side.innerText || '').split(/\r?\n/).map(s => s.replace(/ /g, ' ').trim()).filter(Boolean)
  })
}

/** the warning list's own panel text up to the placeholders */
export async function warnText(page) {
  const l = await warnLines(page)
  const cut = l.indexOf('PLACEHOLDERS')
  return (cut > 0 ? l.slice(0, cut) : l)
}

export async function addWave(page, di, kind = 'Flying wave') {
  const n0 = await page.evaluate(d => window.DAYS[d].waves.length, di)
  await L.tap(page, `[data-wvadd="${di}"]`)
  await page.waitForTimeout(250)
  await page.getByRole('button', { name: kind, exact: true }).first().click()
  await page.waitForTimeout(600)
  const n1 = await page.evaluate(d => window.DAYS[d].waves.length, di)
  if (n1 !== n0 + 1) throw new Error('wave not added ' + n0 + ' -> ' + n1)
  return n1 - 1
}

export async function setF(page, key, value) { return L.type(page, `[data-bfld="${key}"]`, value) }

export async function readF(page, key) {
  return page.evaluate(k => { const e = document.querySelector(`#schedBoard [data-bfld="${k}"]`); return e ? (e.value !== undefined ? e.value : e.textContent) : null }, key)
}

/** seat a man by callsign id (people key) */
export async function seat(page, slotSel, pid) {
  const r = await L.put(page, slotSel, [pid])
  return r
}

export async function closeAll(browser) { try { await browser.close() } catch {} }
export function summary() {
  const p = results.filter(r => r[1] === 'PASS').length, f = results.filter(r => r[1] === 'FAIL').length
  say(`DONE ${p} PASS ${f} FAIL ${results.length - p - f} OTHER of ${results.length}`)
}
