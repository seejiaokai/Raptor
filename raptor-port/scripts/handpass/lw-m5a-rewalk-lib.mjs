// M5a re-walk — helpers copied from the walkers' libs (lw-m5a-walk-a/b/c/d-lib.mjs; not imported: a lib import is fine, but a script import runs it)
// Set LW_OUT and LW_TODAY BEFORE importing this file (each on its own line).
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/rewalk'
process.env.LW_TODAY ||= '2026-01-25'
export const L = await import('./lw-m4-lib.mjs')
export const { T, rec, shot, press, step, vis, txt } = L
import { webkit, devices } from '@playwright/test'
import { writeFileSync } from 'node:fs'
console.log('[lw-m5a-rewalk-lib v1] build ea53c8fcb, served frozen on 4173')

export const shotD = (w, name, opts = {}) => w.page.screenshot({ path: `${L.OUT}/${name}.png`, ...opts })
export const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
export const nameBtn = pid => `[data-testid="row-${pid}"] .whoedit`

export const tabRow = page => page.evaluate(() => {
  const tabs = [...document.querySelectorAll('.lw-tabs [role="tab"]')].filter(e => e.getBoundingClientRect().width > 0)
  const out = tabs.map(t => {
    const lab = t.querySelector('.intab-t'), n = t.querySelector('.appr-tabn'), ic = t.querySelector('svg')
    const labW = lab ? lab.getBoundingClientRect().width : 0
    const r = t.getBoundingClientRect()
    return { id: t.dataset.testid, label: labW > 1 ? lab.textContent.trim() : '(icon only)', icon: !!ic && ic.getBoundingClientRect().width > 0, n: n ? n.textContent.trim() : '', left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), h: Math.round(r.height), sel: t.getAttribute('aria-selected') }
  })
  const g = document.querySelector('[data-testid="settings-open"]')
  const gr = g ? g.getBoundingClientRect() : null
  return { tabs: out, gear: gr && gr.width > 0 ? { left: Math.round(gr.left), right: Math.round(gr.right), top: Math.round(gr.top) } : null, vw: innerWidth, sw: document.documentElement.scrollWidth }
})
export const balRow = (page, pid) => page.evaluate(pid => {
  const row = document.querySelector(`[data-testid="bal-row-${pid}"]`)
  if (!row) return null
  const val = id => { const e = document.querySelector(`[data-testid="${id}"]`); return e ? (e.tagName === 'INPUT' ? e.value : e.textContent.replace(/\s+/g, ' ').trim()) : null }
  const r = { app: val(`bal-LVE-${pid}`), cf: val(`bal-cf-${pid}`), pend: val(`bal-pend-${pid}`), war: val(`bal-war-${pid}`), oil: val(`bal-oil-${pid}`), grade: (row.querySelector(`[data-testid="bal-grade-${pid}"]`) || row.querySelector('.bp-rogd,.bp-gd'))?.textContent.replace(/\s+/g, ' ').trim() ?? null }
  for (const k of ['CCL', 'FCL', 'PL', 'EL', 'CL']) r[k] = val(`bal-${k}-${pid}`) + (val(`bal-opd-${k}-${pid}`) ? ' ' + val(`bal-opd-${k}-${pid}`) : '')
  r.boxes = row.querySelectorAll('input').length
  return r
}, pid)
export const pwRead = page => page.evaluate(() => {
  const pw = document.querySelector('[data-testid="person-window"]')
  if (!pw || !pw.getBoundingClientRect().width) return null
  const q = id => pw.querySelector(`[data-testid="${id}"]`)
  const v = id => { const e = q(id); return e ? (e.tagName === 'INPUT' ? e.value : e.textContent.replace(/\s+/g, ' ').trim()) : null }
  const r = pw.getBoundingClientRect()
  const yr = q('pw-year')
  return {
    name: v('pw-name'), taken: v('pw-taken'), lve: v('pw-tile-LVE'), app: v('pw-LVE'), pend: v('pw-LVE-pend'), war: v('pw-LVE-war'), cf: v('pw-LVE-cf'),
    oil: v('pw-oil'), med: v('pw-med'), lock: v('pw-lock'),
    other: Object.fromEntries(['CCL', 'FCL', 'PL', 'EL', 'CL'].map(k => [k, v(`pw-${k}`) + (q(`pw-${k}-pend`) ? ' pend ' + v(`pw-${k}-pend`) : '')])),
    boxes: pw.querySelectorAll('input').length,
    year: yr ? { value: yr.value, options: [...yr.options].map(o => o.textContent) } : null,
    lines: [...pw.querySelectorAll('[data-testid^="pw-line-"]')].filter(e => !/-(dot|who)$/.test(e.dataset.testid)).map(e => ({ id: e.dataset.testid.replace('pw-line-', ''), text: e.innerText.replace(/\s+/g, ' ').trim(), dot: !!e.querySelector('.m5-dot') || !!pw.querySelector(`[data-testid="${e.dataset.testid}-dot"]`), who: (pw.querySelector(`[data-testid="${e.dataset.testid}-who"]`)?.textContent || '').replace(/\s+/g, ' ').trim(), struck: getComputedStyle(e).textDecorationLine.includes('line-through') || !!e.querySelector('s,del,.struck') || /struck|deleted/.test(e.className) })),
    box: { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), bottom: Math.round(r.bottom), width: Math.round(r.width), height: Math.round(r.height) },
    vw: innerWidth, vh: innerHeight, closeY: Math.round(q('pw-close')?.getBoundingClientRect().top ?? -1),
  }
})
export const whollyOn = b => b && b.top >= 0 && b.left >= 0 && b.bottom <= b.vh && b.right <= b.vw
export async function closePw(w) {
  const pw = await pwRead(w.page)
  if (!pw) return 'none open'
  if (pw.closeY > 0 && pw.closeY < pw.vh) { await press(w, T('pw-close')); await w.page.waitForTimeout(400); return 'close button' }
  await w.page.keyboard.press('Escape'); await w.page.waitForTimeout(400); return 'Escape'
}
export async function openBalances(w) {
  await press(w, T('lw-tab-balances'))
  await w.page.waitForSelector(T('balances-page'), { state: 'visible', timeout: 10000 })
  await w.page.waitForTimeout(500)
}
export async function typeInBox(w, sel, figure, enter = true) {
  await press(w, sel)
  await w.page.waitForTimeout(w.phone ? 650 : 150)
  await w.page.keyboard.press('Control+A')
  await w.page.keyboard.type(String(figure), { delay: 30 })
  if (enter) await w.page.keyboard.press('Enter')
  await w.page.waitForTimeout(500)
}
export const where = page => page.evaluate(() => { const s = document.querySelector('[data-testid="bal-scroll"]'); return { top: s ? Math.round(s.scrollTop) : null, left: s ? Math.round(s.scrollLeft) : null, win: Math.round(window.scrollY) } })
export const focusId = page => page.evaluate(() => document.activeElement?.dataset?.testid || (document.activeElement?.className ? document.activeElement.tagName + '.' + String(document.activeElement.className).slice(0, 30) : document.activeElement?.tagName))
export async function reloadAt(w, iso) {
  await w.page.reload()
  await w.page.waitForSelector('#luser, #vWeek .day', { state: 'attached', timeout: 15000 })
  const signedOut = await w.page.locator('#luser').isVisible().catch(() => false)
  await w.page.evaluate(t => window.lwSetMemberToday(t), iso)
  return signedOut
}
export const setToday = async (w, iso) => { await w.page.evaluate(t => window.lwSetMemberToday(t), iso); await w.page.waitForTimeout(300) }
export const gridFig = (page, pid) => page.evaluate(pid => { const e = document.querySelector(`[data-testid="bal-${pid}"]`); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null }, pid)
export const undoTip = page => page.evaluate(() => document.querySelector('#undoBtn')?.title || document.querySelector('#undoBtn')?.getAttribute('aria-label') || '')

/* ---- phone gestures through CDP touch (Chromium) */
export async function swipe(w, x0, y0, x1, y1, { steps = 8, dwell = 16, rest = 120 } = {}) {
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] })
  for (let i = 1; i <= steps; i++) {
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (x1 - x0) * i / steps, y: y0 + (y1 - y0) * i / steps }] })
    await w.page.waitForTimeout(dwell)
  }
  await w.page.waitForTimeout(rest)
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}
export const box = (page, sel) => page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) } }, sel)

/* ---- a WebKit phone (his iPhone's engine): taps are clicks on a touch context */
export async function newWebkitPhone() {
  const bw = await webkit.launch()
  const ctx = await bw.newContext({ ...devices['iPhone 13'], viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true })
  const page = await ctx.newPage()
  const errs = []
  page.on('console', m => { if (m.type() === 'error') errs.push('webkit console: ' + m.text().slice(0, 200)) })
  page.on('pageerror', e => errs.push('webkit pageerror: ' + String(e).slice(0, 200)))
  page.on('response', r => { if (r.status() >= 400) errs.push(`webkit http ${r.status()}: ` + r.url().slice(0, 100)) })
  return { ctx, page, cdp: null, errs, phone: true, size: 'phone', bw }
}

/* ---- the bid window: ranges, drag, leave buttons */
export async function pickRange(w, pid, from, to, approve) {
  const P = w.page
  await L.openGrid(w)
  await press(w, T('month-' + MON[Number(from.slice(5, 7)) - 1])); await P.waitForTimeout(1200)
  await L.openCell(w, pid, from)
  if (!(await vis(P, T('bid-picker')))) return false
  if (approve !== undefined) await L.approveWhatIEnter(w, approve)
  await press(w, T('span-range')); await P.waitForTimeout(500)
  const goTo = async iso => { for (let i = 0; i < 24 && !(await P.locator(T('span-day-' + iso)).count()); i++) { await press(w, T('span-next')); await P.waitForTimeout(200) } }
  await goTo(from); await press(w, T('span-day-' + from)); await P.waitForTimeout(250)
  await goTo(to); await press(w, T('span-day-' + to)); await P.waitForTimeout(300)
  return true
}
export const place = async (w, type) => { const ok = await L.placeLeave(w, type); if (!ok) await L.closeWin(w); return ok }
export async function leftOf(w, pid, iso, portion = 'full', shotName = null) {
  const P = w.page
  await L.openGrid(w); await press(w, T('month-' + MON[Number(iso.slice(5, 7)) - 1])); await P.waitForTimeout(1000)
  await L.openCell(w, pid, iso)
  if (portion !== 'full') { await press(w, T('portion-' + portion)); await P.waitForTimeout(300) }
  const r = Object.fromEntries(await Promise.all(['LL', 'OL', 'CCL', 'PL'].map(async k => [k, await txt(P, T(`bid-${k}-left`))])))
  r.dayline = await txt(P, T('bid-dayline'))
  if (shotName) await shot(w, shotName)
  await L.closeWin(w)
  return r
}
export const norm = s => String(s ?? '').replace(/[−–]/g, '-').replace(/\s+/g, '')
export const eq = (a, b) => norm(a) === norm(b)

export const R = []
export function note(id, size, verdict, said, pics = []) { R.push({ id, size, verdict, said, pics }); console.log(`${verdict}  ${id} [${size}]  ${said}  [${pics.join(', ')}]`) }
export function dump(name) { writeFileSync(`${L.OUT}/${name}.json`, JSON.stringify(R, null, 1)) }
