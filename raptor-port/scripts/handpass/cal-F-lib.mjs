/* WALKER F's shared helpers (the Inputs / SANS calendar check, 8 Oct 26). Read-only on the app. */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, '..', '..')
export const BASE = 'http://localhost:4212'
export const SHOTS = resolve(ROOT, 'docs/img/handpass/2026-10-08-inputs-sans-calendar-check/F')
export const OUT = resolve(ROOT, 'docs/handpass/parts/cal-F.json')
mkdirSync(SHOTS, { recursive: true }); mkdirSync(dirname(OUT), { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const DESK = { width: 1440, height: 900 }, PHONE = { width: 390, height: 844 }

export const errors = []
export async function launch() { return chromium.launch({ headless: true, ...launchOptions }) }
export async function newCtx(browser, { phone = false, size = null, clock = null } = {}) {
  const ctx = await browser.newContext({ viewport: size || (phone ? PHONE : DESK), ...(phone ? { isMobile: true, hasTouch: true } : {}) })
  if (clock) await ctx.clock.install({ time: clock })
  return ctx
}
export async function newPage(ctx, label = 'p') {
  const p = await ctx.newPage()
  p.on('console', m => { if (m.type() === 'error') errors.push(`${label}: ${m.text()}`) })
  p.on('pageerror', e => errors.push(`${label}: PAGEERROR ${e.message}`))
  p.on('response', r => { if (r.status() >= 400) errors.push(`${label}: HTTP ${r.status()} ${r.url()}`) })
  p.on('dialog', d => { errors.push(`${label}: NATIVE DIALOG ${d.message()}`); d.dismiss().catch(() => {}) })
  return p
}
/* sign in (fresh world) : who = 'ad' | 'us' */
export async function signIn(p, who = 'ad', { fresh = true } = {}) {
  await p.goto(BASE + '/' + (fresh ? '?fresh=1' : ''))
  await p.waitForSelector('#luser', { state: 'visible', timeout: 15000 })
  const pw = who === 'ad' ? 'a' : 'us'
  await p.fill('#luser', who); await p.fill('#lpass', pw)
  await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await sleep(500)
}
export async function go(p, to) {
  await p.evaluate(x => window.go(x), to)
  await p.waitForFunction(x => window.CURPAGE === x, to)
  await sleep(450)
}
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export async function month(p, y, m, press) {
  for (let i = 0; i < 240; i++) {
    const [name, year] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) return
    const l = p.locator(d > 0 ? '#icNext' : '#icPrev')
    if (press) await press(l); else await l.click()
    await sleep(120)
  }
  throw new Error('month never reached')
}
export const cell = (p, iso) => p.locator(`#inpCal [data-icday="${iso}"]`)
export const pidOf = (p, cs) => p.evaluate(c => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === c) || null, cs)
export const csOf = (p, id) => p.evaluate(i => (window.PEOPLE[i] || {}).cs || i, id)

/* pictures */
let N = 0
export const picked = []
export async function pic(p, name, opts = {}) {
  const f = `${String(++N).padStart(3, '0')}-${name}.png`
  await p.screenshot({ path: resolve(SHOTS, f), ...opts }).catch(e => console.log('shot failed', e.message))
  picked.push(f)
  console.log('PIC', f)
  return f
}

/* results */
export const TABLE = []
const PART = process.env.PART || 'part'
export function row(id, did, saw, verdict, pics = []) {
  TABLE.push({ id, did, saw, verdict, pics })
  console.log(`== ${verdict}  ${id} — ${did}\n     saw: ${String(saw).slice(0, 900)}`)
}
export function judge(id, did, checks, pics = [], extra = '') {
  const bad = checks.filter(c => !c[1])
  row(id, did, checks.map(c => `${c[1] ? 'OK' : 'NO'} ${c[0]}${c[2] !== undefined ? ' [' + (typeof c[2] === 'string' ? c[2] : JSON.stringify(c[2])).slice(0, 260) + ']' : ''}`).join(' · ') + (extra ? ' | ' + extra : ''), bad.length ? 'FAIL' : 'PASS', pics)
  return !bad.length
}
export function savePart(name) {
  let all = { parts: {} }
  if (existsSync(OUT)) { try { all = JSON.parse(readFileSync(OUT, 'utf8')); if (!all.parts) all = { parts: {} } } catch { all = { parts: {} } } }
  all.parts[name] = { at: new Date().toISOString(), table: TABLE, errors: [...errors], pics: picked }
  writeFileSync(OUT, JSON.stringify(all, null, 1))
  console.log(`saved part ${name} → ${OUT}`)
}
