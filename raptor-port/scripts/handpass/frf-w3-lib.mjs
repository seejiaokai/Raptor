// frf-w3 — walker w3's shared helpers (OIL question at the sign-off, OIL F2). Writes only under its own checkout.
import { chromium, webkit } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const HERE = path.dirname(fileURLToPath(import.meta.url))
export const ROOT = path.resolve(HERE, '../..')
export const URL_ = process.env.TS_URL || 'http://localhost:4313/'
export const SHOTS = process.env.HP_SHOTS || path.join(ROOT, 'docs/img/handpass/2026-11-22-fable-read-faults/w3')
mkdirSync(SHOTS, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOpts = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
export const SIZES = {
  desktop: { name: 'desktop', eng: chromium, opts: { viewport: { width: 1536, height: 864 } }, tap: false },
  phone: { name: 'phone', eng: webkit, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }, tap: true },
}
export const SAT = '2026-07-18', SAT_DI = 5
export const log = (...a) => console.log(...a)
export const errs = []

export async function open(sz) {
  const b = await sz.eng.launch(sz.eng === chromium ? launchOpts : {})
  const ctx = await b.newContext(sz.opts), p = await ctx.newPage()
  p.on('pageerror', e => { errs.push(`[${sz.name}] pageerror ${e.message}`) })
  p.on('console', m => { if (m.type() === 'error') errs.push(`[${sz.name}] console ${m.text()}`) })
  p.on('response', r => { if (r.status() >= 400) errs.push(`[${sz.name}] HTTP ${r.status()} ${r.url()}`) })
  return { b, ctx, p }
}
export async function login(p, who = 'ad') {
  await p.goto(URL_)
  await p.waitForSelector('#luser')
  await p.evaluate(() => { const w = window; if (typeof w.lwSetMemberToday === 'function') w.lwSetMemberToday('2000-01-01') })
  await p.fill('#luser', who); await p.fill('#lpass', who === 'ad' ? 'a' : 'us')
  await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await p.waitForTimeout(500)
}
export async function signout(p) {
  await p.evaluate(() => { const w = window; if (typeof w.logout === 'function') w.logout() })
}
export async function go(p, to) {
  await p.evaluate(t => window.go(t), to); await p.waitForFunction(t => window.CURPAGE === t, to); await p.waitForTimeout(400)
}
export const press = (p, sz, sel) => sz.tap ? p.locator(sel).first().tap() : p.locator(sel).first().click()
export async function shot(p, sz, name) {
  const f = path.join(SHOTS, `${name}-${sz.name}.png`); await p.screenshot({ path: f }); return f
}
/* a picture within ~100ms of a phone tap, then the settled one (§7.10) */
export async function tapShot(p, sz, sel, name) {
  if (sz.tap) { await p.locator(sel).first().tap(); await p.screenshot({ path: path.join(SHOTS, `${name}-tap-${sz.name}.png`) }) }
  else await p.locator(sel).first().click()
  await p.waitForTimeout(350); return shot(p, sz, name)
}
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
/* the Inputs calendar's day window and "+ Input" (the recipe of e2e/oilwait.spec.ts fileIt). answer: 'y' | 'n' | null */
export async function fileInput(p, sz, iso, spec) {
  await go(p, 'inputs')
  if (await p.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await press(p, sz, '#inCalBtn')
  await p.locator('#inpCal').waitFor()
  for (let i = 0; i < 36 && !(await p.locator(`[data-icday="${iso}"]`).count()); i++) {
    const [m, y] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const at = +y * 12 + MONTHS.findIndex(x => x.startsWith(m)), want = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1)
    await press(p, sz, at < want ? '#icNext' : '#icPrev'); await p.waitForTimeout(400)
  }
  await p.locator(`[data-icday="${iso}"]`).focus(); await p.keyboard.press('Enter')
  await p.locator('[data-testid="win-inputsday"]').waitFor()
  await press(p, sz, '#icPopAdd')
  await p.locator('#inpEditPop #inpEditType').waitFor()
  await p.selectOption('#inpEditPop #inpEditType', spec.type)
  if (spec.person && await p.locator('#inpEditPop #inpEditPerson').count()) await p.selectOption('#inpEditPop #inpEditPerson', spec.person)
  const ad = p.locator('#inpEditPop #inpEditAllday')
  if (await ad.count() && await ad.isChecked()) await ad.click()
  await p.fill('#inpEditPop #inpEditStart', spec.from || '08:00'); await p.fill('#inpEditPop #inpEditEnd', spec.to || '17:00')
  if (spec.title && await p.locator('#inpEditPop #inpEditOwnTitle').count()) await p.fill('#inpEditPop #inpEditOwnTitle', spec.title)
  const before = await p.evaluate(() => window.INPUTS.map(r => String(r.iid)))
  await press(p, sz, '#inpEditSave'); await p.waitForTimeout(300)
  const asked = await p.locator('[data-testid="oilconf"]').count() > 0
  if (asked && spec.answer) { await press(p, sz, spec.answer === 'y' ? '[data-testid="oil-yes"]' : '[data-testid="oil-no"]'); await press(p, sz, '[data-testid="oilconf-save"]'); await p.waitForTimeout(300) }
  const iid = await p.evaluate(b => { const n = window.INPUTS.find(r => !b.includes(String(r.iid))); return n ? String(n.iid) : null }, before)
  return { asked, iid }
}
export async function openInpDay(p, sz, iso) {
  await go(p, 'inputs')
  if (await p.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await press(p, sz, '#inCalBtn')
  await p.locator('#inpCal').waitFor()
  for (let i = 0; i < 36 && !(await p.locator(`[data-icday="${iso}"]`).count()); i++) {
    const [m, y] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const at = +y * 12 + MONTHS.findIndex(x => x.startsWith(m)), want = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1)
    await press(p, sz, at < want ? '#icNext' : '#icPrev'); await p.waitForTimeout(400)
  }
  await p.locator(`[data-icday="${iso}"]`).focus(); await p.keyboard.press('Enter')
  await p.locator('[data-testid="win-inputsday"]').waitFor(); await p.waitForTimeout(300)
}
/* does the input's card in the opened day wear the drawn "OIL?" tag? */
export const cardOilTag = (p, iid) => p.evaluate(iid => {
  const c = document.querySelector(`[data-testid="win-inputsday"] [data-testid="idy-row-${iid}"]`); if (!c) return 'no card'
  const t = c.querySelector('.oiltag'); return !!t && t.getBoundingClientRect().width > 0
}, iid)
export async function closeInpDay(p) { const x = p.locator('[data-testid="win-inputsday-x"]'); if (await x.count() && await x.isVisible()) await x.click() }
export async function openBoard(p, di = SAT_DI) {
  await go(p, 'editsched')
  await p.locator(`#eWeek [data-sbday="${di}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
  await p.locator('#schedBoard .sb-sec').first().waitFor({ state: 'attached' }); await p.waitForTimeout(500)
}
/* the visible sign-off <select> of a role, on the board or on the edit week's day */
export const signSel = (where, role, di = SAT_DI) => where === 'board'
  ? `#schedBoard select[data-sign="${role}"][data-signday="${di}"]`
  : `#eWeek select[data-sign="${role}"][data-signday="${di}"]`
export async function pickSign(p, where, role, nth = 0, di = SAT_DI) {
  const sel = p.locator(signSel(where, role, di)).filter({ visible: true }).first()
  if (!(await sel.count())) {
    const any = p.locator(signSel(where, role, di)).first(); await any.scrollIntoViewIfNeeded().catch(() => {})
  }
  const s = p.locator(signSel(where, role, di)).first()
  await s.scrollIntoViewIfNeeded().catch(() => {})
  const v = await s.locator('option').evaluateAll((os, n) => os.map(o => o.value).filter(Boolean)[n], nth)
  await s.selectOption(v); await p.waitForTimeout(350)
  return v
}
export const signs = (p, di = SAT_DI) => p.evaluate(di => JSON.stringify(window.signOf ? window.signOf(di) : null), di)
export const listUp = p => p.evaluate(() => { const w = document.querySelector('[data-testid="win-oilday"]'); return !!w && w.getBoundingClientRect().width > 0 })
/* the held box and its words as PAINTED */
export const heldFacts = p => p.evaluate(() => {
  const w = document.querySelector('[data-testid="win-oilday"]'); if (!w) return null
  const h = w.querySelector('[data-testid="odl-held"]'), sg = h && h.querySelector('.sgn')
  const cs = sg ? getComputedStyle(sg) : null, af = sg ? getComputedStyle(sg, '::after') : null
  return {
    held: !!h, label: sg ? sg.querySelector('.k').textContent : null, name: sg ? sg.querySelector('.v').textContent : null,
    border: cs ? cs.borderTopStyle : null, after: af ? af.content : null, beside: h ? (h.querySelector('.upconf-need') || {}).textContent : null,
    foot: (w.querySelector('[data-testid="odl-left"]') || {}).textContent, count: (w.querySelector('[data-testid="odl-count"]') || {}).textContent,
    sub: (w.querySelector('.win-ttl small') || {}).textContent || '', title: (w.querySelector('.win-ttl') || {}).textContent,
  }
})
/* the box's shown words on the page behind (the .v span of the visible label) */
export const boxShows = (p, where, role, di = SAT_DI) => p.evaluate(sel => {
  const s = [...document.querySelectorAll(sel)].find(x => x.closest('label').getBoundingClientRect().width > 0) || document.querySelector(sel)
  if (!s) return null; const l = s.closest('label'); return { v: l.querySelector('.v').textContent, on: l.classList.contains('on'), color: getComputedStyle(l.querySelector('.v')).color }
}, signSel(where, role, di))
export const toastText = p => p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? { text: t.textContent, cls: t.className, op: getComputedStyle(t).opacity, color: getComputedStyle(t).color } : null })
export async function done(b) { await b.close() }
