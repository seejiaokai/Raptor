/* Walker G (the Codex stack check, 5 Oct 26) — shared helpers for L-01 … L-08.
   Everything a step DOES goes through the app's own controls; window.* only to get to a place and to READ.
   Env: HP_URL, HP_SHOTS, HP_OUT, HP_PHONE=1. */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { dirname } from 'node:path'
import * as H from './wh-lib.mjs'
import * as L from './dbrA-lib.mjs'
import * as W from './dbrA-W1-lib.mjs'
import * as AM from './am/w4-lib.mjs'
export { H, L, W, AM }
export const sleep = L.sleep
export const URL_ = process.env.HP_URL
export const SHOTS = process.env.HP_SHOTS
export const OUT = process.env.HP_OUT
mkdirSync(SHOTS, { recursive: true })

/* ---------- results ---------- */
export const R = []   // { id, did, saw, verdict, pics }
let PN = 0
export const PICS = { saved: 0, opened: 0 }
export async function pic(p, name, opts = {}) {
  const f = `${process.env.HP_PHONE ? 'ph' : 'dk'}-${name}.png`.replace(/[^\w.\-]/g, '_')
  await p.screenshot({ path: `${SHOTS}/${f}`, ...opts }).catch(() => {})
  PICS.saved++
  return f
}
export function rec(id, did, saw, verdict, pics = []) {
  R.push({ id, did, saw, verdict, pics })
  console.log(`== ${verdict}  ${id} — ${did}\n     saw: ${typeof saw === 'string' ? saw : JSON.stringify(saw)}`.slice(0, 2500))
}
export function save(part, extra = {}) {
  let all = {}
  if (existsSync(OUT)) { try { all = JSON.parse(readFileSync(OUT, 'utf8')) } catch { all = {} } }
  if (!all.parts) all = { parts: {} }
  all.parts[part] = { at: new Date().toISOString(), base: process.env.HP_URL, rows: R.slice(), ...extra }
  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, JSON.stringify(all, null, 1))
  console.log(`saved ${part} -> ${OUT}`)
}

/* ---------- worlds ---------- */
export async function world(opts = {}) { return H.world(opts) }

/* ---------- the board ---------- */
export const B = sel => sel.split(',').map(s => '#schedBoard ' + s.trim() + ':visible').join(', ')
export async function boardOn(p, di) { return W.boardOn(p, di) }
export async function boardOff(p) { return W.boardOff(p) }

/* a board text input / cell: scroll to centre, click, type, Tab out (commit) */
export async function bType(p, key, value, { commit = 'blur' } = {}) {
  const el = p.locator(`#schedBoard [data-bfld="${key}"]:visible, #schedBoard [data-txt="${key}"]:visible`).first()
  if (!(await el.count())) throw new Error('no board box ' + key)
  await el.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await el.click()
  const tag = await el.evaluate(e => e.tagName)
  if (tag === 'INPUT' || tag === 'TEXTAREA') { await el.fill(''); await p.keyboard.type(String(value), { delay: 6 }) }
  else { await p.keyboard.press('Control+A'); await p.keyboard.type(String(value), { delay: 6 }) }
  if (commit === 'tab') await p.keyboard.press('Tab'); else await el.evaluate(e => e.blur())
  await sleep(350)
}
/* an in-time line on the board / week: the n-th .itline of wave (di|gi) */
export async function itLine(p, scope, di, gi, n, value) {
  const el = p.locator(`${scope} .intimes[data-intimes="${di}|${gi}"] .itline`).nth(n)
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await el.click()
  await p.keyboard.press('Control+A')
  await p.keyboard.type(String(value), { delay: 6 })
  await el.evaluate(e => e.blur())
  await sleep(450)
}
export async function tapSel(p, sel, n = 0) {
  const el = p.locator(sel).nth(n)
  await el.waitFor({ state: 'visible', timeout: 8000 })
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await sleep(120)
  try { await el.click({ timeout: 3000 }) } catch { const b = await el.boundingBox(); if (b) await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
  await sleep(300)
}
/* arm a seat and pick a person from the board's crew list */
export async function seat(p, armSel, pid) {
  const r = await (await import('./seat-lib.mjs')).handPut(p, armSel, pid)
  return r
}
export async function addWave(p, di, label = 'Flying wave') {
  await tapSel(p, `#schedBoard [data-wvadd="${di}"]`)
  await p.getByRole('button', { name: label, exact: true }).click()
  await sleep(600)
}

/* ---------- reading ---------- */
export async function toast(p) { return (await import('./seat-lib.mjs')).toast(p) }
export async function warnLines(p, di) {
  /* the warning list as painted: the board's panel when it is open, else the day's list on the week */
  return p.evaluate(i => {
    const sb = document.querySelector('#schedBoard .sb-warn')
    const t = e => (e.innerText || '').replace(/\s+/g, ' ').trim()
    if (sb && sb.offsetWidth) return { where: 'board', head: t(sb.querySelector('.wh') || sb).slice(0, 120), lines: [...sb.querySelectorAll('.wln[data-wix]')].map(t) }
    const box = document.querySelector(`#eWeek .day[data-day="${i}"] [data-dwbox="${i}"]`)
    if (!box) return { where: 'none', lines: [] }
    return { where: 'week', head: t(box.querySelector('.daywarn') || box).slice(0, 120), lines: [...box.querySelectorAll('.witem[data-wix]')].map(t) }
  }, di)
}
export async function insightsOpen(p, { phone = false } = {}) {
  /* the Scheduler Board's own way into Insights: #sbInsights (desktop) or the ⋯ More menu on a phone */
  if (await p.locator('#sbInsights:visible').count()) await p.locator('#sbInsights:visible').first().click()
  else { await p.locator('#sbMore:visible').first().click(); await sleep(250); await p.locator('#sbMoreInsights:visible').first().click() }
  await p.waitForSelector('#insightBody', { state: 'visible', timeout: 8000 })
  await sleep(500)
}
export async function insightsRead(p) {
  return p.evaluate(() => {
    const b = document.querySelector('#insightBody'); if (!b) return null
    const t = e => (e.innerText || '').replace(/\s+/g, ' ').trim()
    return { text: t(b).slice(0, 2500), rows: [...b.querySelectorAll('.ibar')].map(r => t(r).slice(0, 160)) }
  })
}
export async function insightsClose(p) {
  const c = p.locator('#insightClose:visible').first()
  if (await c.count()) { await c.click(); await sleep(400) } else { await p.keyboard.press('Escape'); await sleep(400) }
}

/* ---------- Logic ---------- */
export async function logicEditOn(p) {
  await L.go(p, 'logic')
  const e = p.locator('#lgEdit')
  if (await e.isVisible()) { await e.click(); await sleep(400) }
}
export async function logicDone(p) {
  const d = p.locator('#lgDone')
  if (await d.isVisible()) { await d.click(); await sleep(400) }
}
/* type into the n-th Logic box for a setting and commit (change event) by Tab */
export async function logicSet(p, key, value, n = 0) {
  const box = p.locator(`#lgBody input[data-lgset="${key}"]`).nth(n)
  await box.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await box.click()
  await box.fill('')
  await box.type(String(value), { delay: 8 })
  await box.press('Tab')
  await sleep(600)
  return p.locator(`#lgBody input[data-lgset="${key}"]`).first().inputValue()
}
export const vconf = (p, k) => p.evaluate(key => window.VCONF ? window.VCONF[key] : null, k)

/* ---------- the Leave War: a man's day cell and the tracker ---------- */
export async function lwRead(p, id, iso = '2026-07-18') {
  await AM.lwOpen(p, iso)
  const c = await AM.lwCell(p, id, iso)
  return c
}
export async function oilTrackerRead(p) {
  await L.go(p, 'leavewar')
  await sleep(600)
  await p.locator('[data-testid="oil-tracker"]').first().click()
  await sleep(900)
  const r = await p.evaluate(() => {
    const s = document.querySelector('[data-testid="oil-sheet"]') || [...document.querySelectorAll('.sheet')].find(e => e.offsetParent)
    if (!s) return { open: false }
    return { open: true, text: (s.innerText || '').replace(/\s+/g, ' ').slice(0, 2500),
      entries: [...s.querySelectorAll('[data-testid^="oil-entry-"]')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 200)) }
  })
  return r
}
export async function oilTrackerClose(p) {
  const x = p.locator('[data-testid="oil-close"]').first()
  if (await x.count() && await x.isVisible()) { await x.click(); await sleep(400) } else { await p.keyboard.press('Escape'); await sleep(400) }
}
export const errs = w => (w.errors || []).filter(e => !/quota|QuotaExceeded/i.test(e))
