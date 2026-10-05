/* Walker E (Codex stack, D589) — shared helpers. Every gesture is the app's own control; the bridge only reads / gets there. */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { chromium } from '@playwright/test'

export const BASE = process.env.HP_URL || 'http://localhost:4221'
export const SHOTS = process.env.HP_SHOTS || 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-10-05-codex-stack/E'
export const OUT = process.env.HP_OUT || 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/stk-E.json'
mkdirSync(SHOTS, { recursive: true }); mkdirSync(dirname(OUT), { recursive: true })
export const DESK = { width: 1440, height: 900 }, PHONE = { width: 390, height: 844 }
export const sleep = ms => new Promise(r => setTimeout(r, ms))
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}

export async function world({ size = DESK, phone = false, who = 'a', fresh = false, state = null } = {}) {
  const browser = await chromium.launch({ headless: true, ...launchOptions })
  const ctx = await browser.newContext({ viewport: size, ...(phone ? { isMobile: true, hasTouch: true } : {}), ...(state ? { storageState: state } : {}) })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  page.on('dialog', d => { errors.push('NATIVE DIALOG ' + d.message()); d.dismiss().catch(() => {}) })
  await page.goto(BASE + (fresh ? '/?fresh=1' : '/'))
  if (who) await signIn(page, who)
  return { browser, ctx, page, errors }
}
const CRED = { a: ['ad', 'a'], m: ['us', 'us'] }
export async function signIn(page, who = 'a') {
  const onCard = await page.waitForSelector('#luser', { state: 'visible', timeout: 15000 }).then(() => true, () => false)
  if (onCard) {
    const [u, pw] = Array.isArray(who) ? who : CRED[who]
    await page.fill('#luser', u); await page.fill('#lpass', pw)
    await page.click('#loginForm button[type=submit]')
  }
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 30000 })
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await sleep(500)
}
export async function go(page, to) {
  await page.evaluate(x => window.go(x), to)
  await page.waitForFunction(x => window.CURPAGE === x, to, { timeout: 15000 })
  await sleep(500)
}
export async function closeBoard(page) {
  if (await page.locator('#schedBoard:visible').count()) { const x = page.locator('#sbDone:visible').first(); if (await x.count()) await x.click(); else await page.keyboard.press('Escape'); await sleep(500) }
}
/* the way a person reaches a page: the top nav, or on a phone the drawer */
export async function nav(page, to) {
  await closeBoard(page)
  const tab = page.locator(`#topnav [data-page="${to}"]:visible`)
  if (await tab.count()) await tab.first().click()
  else { await page.locator('#burger').click(); await sleep(250); await page.locator(`#drawerNav [data-page="${to}"]`).first().click() }
  await page.waitForFunction(x => window.CURPAGE === x, to, { timeout: 15000 })
  await sleep(600)
  await page.evaluate(() => window.scrollTo(0, 0))
  await sleep(150)
}
/* ---- pictures ---- */
export const PICS = []
export const OPENED = new Set()
let N = 0
export async function pic(page, name, opts = {}) {
  const f = `${String(++N).padStart(3, '0')}-${name}.png`
  await page.screenshot({ path: `${SHOTS}/${f}`, ...opts }).catch(e => console.log('shot failed', name, e.message))
  PICS.push(f)
  return f
}
/* ---- the table ---- */
export const TABLE = []
export function row(id, did, saw, verdict, pics = []) {
  TABLE.push({ id, did, saw: String(saw), verdict, pics })
  console.log(`== ${verdict}  ${id} — ${did}\n     saw: ${String(saw).slice(0, 900)}`)
}
export function judge(id, did, checks, pics = []) {
  const bad = checks.filter(c => !c[1])
  row(id, did, checks.map(c => `${c[1] ? 'OK' : 'XX'} ${c[0]}${c[2] !== undefined ? ' [' + (typeof c[2] === 'string' ? c[2] : JSON.stringify(c[2])).slice(0, 200) + ']' : ''}`).join(' | '), bad.length ? 'FAIL' : 'PASS', pics)
  return !bad.length
}
export function savePart(name, extra = {}) {
  let all = {}
  if (existsSync(OUT)) { try { all = JSON.parse(readFileSync(OUT, 'utf8')) } catch { all = {} } }
  if (!all.parts) all = { parts: {} }
  all.parts[name] = { at: new Date().toISOString(), base: BASE, table: TABLE, pics: PICS, ...extra }
  writeFileSync(OUT, JSON.stringify(all, null, 1))
  console.log(`saved part ${name} -> ${OUT}`)
}
/* what a finger lands on at the centre of an element */
export async function lands(loc) {
  return loc.evaluate(e => { const r = e.getBoundingClientRect(); if (!(r.width > 0 && r.height > 0)) return 'not drawn'; if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return 'off-screen'; const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!h && (h === e || e.contains(h)) ? true : 'covered by ' + (h ? (h.id || h.className || h.tagName) : 'nothing') })
}
export const sideways = page => page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, over: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 }))
