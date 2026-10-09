/* Walker A's helpers over the app's own controls (8 Oct 26). */
import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'
export * from './cal-A-lib.mjs'
import { BASE, SIZES, world, tid, sleep } from './cal-A-lib.mjs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
export const M3 = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
export const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const clean = s => String(s ?? '').replace(/\s+/g, ' ').trim()

/* the plain address (storage-backed) — for a scenario about a reload */
export async function worldPlain(size = 'desk', who = 'ad') {
  const browser = await chromium.launch({ headless: true, ...launchOptions })
  const ctx = await browser.newContext(SIZES[size])
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`))
  page.on('response', r => { if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`) })
  await page.goto(BASE)
  await page.fill('#luser', who); await page.fill('#lpass', who === 'ad' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await sleep(400)
  const touch = size !== 'desk' && size !== 'wide'
  return { browser, ctx, page, errors, size, touch, press: loc => (touch ? loc.tap() : loc.click()) }
}

export const closeAll = w => w.browser.close()
/* ---- the Leave War ---- */
export async function warOpen(w) {
  await w.page.evaluate(() => window.go('leavewar'))
  await tid(w.page, 'row-slipway').waitFor({ timeout: 15000 }); await sleep(400)
}
export async function warPeriod(w, id) { // 'y2026' | 'y2027' | ...
  await warOpen(w)
  const cur = await tid(w.page, 'war-picker').inputValue()
  if (cur !== id) { await tid(w.page, 'war-picker').selectOption(id); await sleep(800) }
}
export async function warJump(w, iso) {
  if (!(await w.page.evaluate(() => window.CURPAGE === 'leavewar'))) await warOpen(w)
  const btn = tid(w.page, 'month-' + M3[+iso.slice(5, 7) - 1])
  if (await btn.count()) { await w.press(btn); await sleep(500) }
}
/* bring a cell into the middle of its scrolling box, clear of the frozen columns */
export async function cellIn(w, testid) {
  await w.page.evaluate(t => { const e = document.querySelector(`[data-testid="${t}"]`); if (e) e.scrollIntoView({ block: 'center', inline: 'center' }) }, testid)
  await sleep(250)
  return tid(w.page, testid)
}
export async function warText(w, iso) {
  return w.page.evaluate(iso => {
    const t = id => { const e = document.querySelector(`[data-testid="${id}-${iso}"]`); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null }
    return { reqP: t('req-p'), reqW: t('req-w'), availP: t('avail-p'), availW: t('avail-w') }
  }, iso)
}
/* a Required figure typed into ONE cell — desktop: the box; phone: the app's own pad. run = "From <date> on". '' clears. */
export async function typeReq(w, seat, iso, text, { run = false } = {}) {
  await warJump(w, iso)
  const c = await cellIn(w, `req-${seat}-${iso}`)
  await w.press(c); await sleep(400)
  if (w.touch) {
    for (let i = 0; i < 4; i++) { const b = tid(w.page, 'fly-pad-back'); if (await b.count()) await b.tap().catch(() => {}) }
    for (const ch of String(text)) await tid(w.page, 'fly-pad-' + ch).tap()
    if (run) await tid(w.page, 'fly-edit-run').tap()
    await sleep(150)
    await tid(w.page, 'fly-pad-done').tap()
  } else {
    await w.page.keyboard.press('Control+a')
    if (String(text) === '') await w.page.keyboard.press('Delete'); else await w.page.keyboard.type(String(text))
    if (run) await tid(w.page, 'fly-edit-run').click()
    await w.page.keyboard.press('Enter')
    await sleep(250)
    await w.page.keyboard.press('Escape')
  }
  await sleep(450)
}
export async function warWork(w, seat, iso) {
  const c = await cellIn(w, `avail-${seat}-${iso}`)
  await w.press(c); await sleep(400)
  const box = tid(w.page, 'fly-working')
  return (await box.count()) ? clean(await box.innerText()) : null
}
export async function warWorkClose(w) { await w.page.keyboard.press('Escape'); await sleep(250) }
/* a leave on one person-day through the war's own one-day sheet */
export async function placeLeave(w, personId, iso, type = 'LL', portion = null) {
  await warJump(w, iso)
  const c = await cellIn(w, `cell-${personId}-${iso}`)
  await w.press(c); await sleep(500)
  await tid(w.page, 'bid-picker').waitFor({ timeout: 5000 })
  if (portion) { await w.press(tid(w.page, 'portion-' + portion)); await sleep(200) }
  await w.press(tid(w.page, 'bid-' + type)); await sleep(600)
}
export async function newPeriod(w, name, fromIso, toIso) {
  await w.page.evaluate(() => window.go('leavewar'))
  await tid(w.page, 'war-new').waitFor()
  await w.press(tid(w.page, 'war-new')); await tid(w.page, 'war-sheet').waitFor()
  await tid(w.page, 'war-name').fill(name)
  const at = async () => { const [m, y] = (await tid(w.page, 'war-month').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MONTHS.indexOf(m) }
  const go = async iso => { let d = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1) - await at(); for (; d > 0; d--) await w.press(tid(w.page, 'war-next-month')); for (; d < 0; d++) await w.press(tid(w.page, 'war-prev-month')) }
  await go(fromIso); await w.press(tid(w.page, 'war-day-' + fromIso))
  await go(toIso); await w.press(tid(w.page, 'war-day-' + toIso))
  await sleep(250)
  const sel = clean(await tid(w.page, 'war-selection').innerText())
  await w.press(tid(w.page, 'war-create')); await sleep(1000)
  return sel
}

/* ---- the SANS month and its opened day ---- */
export async function openSans(w) {
  await w.page.evaluate(() => window.go('inputs'))
  await w.page.waitForSelector('#inSansMode', { timeout: 10000 })
  await w.page.click('#inSansMode')
  await tid(w.page, 'sanscal').waitFor(); await sleep(300)
}
export async function sansGoto(w, iso) {
  const at = async () => { const [m, y] = (await tid(w.page, 'sc-month').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MONTHS.findIndex(x => x.startsWith(m)) }
  let d = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1) - await at()
  for (; d > 0; d--) await w.press(tid(w.page, 'sc-next'))
  for (; d < 0; d++) await w.press(tid(w.page, 'sc-prev'))
  await sleep(300)
}
export async function sansCell(w, iso) {
  return w.page.evaluate(iso => {
    const c = document.querySelector(`[data-testid="sc-day-${iso}"]`); if (!c) return null
    const g = id => { const e = document.querySelector(`[data-testid="${id}-${iso}"]`); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null }
    const tag = document.querySelector(`[data-testid="sc-tag-${iso}"]`)
    const ic = c.querySelector('.sc-icon')
    return { label: c.getAttribute('aria-label'), need: g('sc-need'), f: g('sc-f'), o: g('sc-o'), a: g('sc-a'), tag: tag ? tag.innerText.trim() : null, icon: ic ? ic.dataset.icon : null, cls: c.className }
  }, iso)
}
export async function sansOpen(w, iso) {
  if (await tid(w.page, 'win-sansday').count()) {
    const lab = await tid(w.page, 'win-sansday').getAttribute('aria-label')
    const want = await w.page.evaluate(iso => { const d = new Date(iso + 'T00:00:00Z'); return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).replace(',', '') }, iso)
    if (lab && lab.replace(/\s+/g, ' ') === want.replace(/\s+/g, ' ')) return
    await sansClose(w)
  }
  await sansGoto(w, iso)
  const c = tid(w.page, 'sc-day-' + iso)
  await c.scrollIntoViewIfNeeded()
  if (w.touch) await c.tap({ position: { x: 8, y: 8 } }); else await c.click({ position: { x: 8, y: 8 } })
  await tid(w.page, 'win-sansday').waitFor({ timeout: 6000 }); await sleep(500)
}
export async function sansDayRead(w) {
  return w.page.evaluate(() => {
    const t = id => { const e = document.querySelector(`[data-testid="${id}"]`); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null }
    const win = document.querySelector('[data-testid="win-sansday"]')
    return { head: win ? win.innerText.replace(/\s+/g, ' ').trim().slice(0, 40) : null, req: [t('sd-req-p'), t('sd-req-w')], avail: [t('sd-avail-p'), t('sd-avail-w')], sans: [t('sd-sans-p'), t('sd-sans-w')], need: [t('sd-need-p'), t('sd-need-w')],
      nocover: t('sd-nocover'), why: t('sd-why'), list: t('sd-list'), addwhy: t('sd-addwhy') }
  })
}
export async function sansClose(w) {
  const x = tid(w.page, 'win-sansday-x')
  if (await x.count()) { await w.press(x); await sleep(300) }
}
/* file a SANS commitment through the opened day's "+ Commitment" (the window is left on the day) */
export async function sansFile(w, iso, who, flags = { f: true }) {
  await sansOpen(w, iso)
  await w.press(tid(w.page, 'sd-add')); await w.page.waitForSelector('#inpEditPerson', { timeout: 6000 }); await sleep(300)
  await w.page.selectOption('#inpEditPerson', { label: who })
  const set = async (label, on) => {
    const box = w.page.locator('#inpEditSans label', { hasText: label }).locator('input')
    if ((await box.isChecked()) !== on) await box.setChecked(on)
  }
  await set('Fly', !!flags.f); await set('AMT', !!flags.a); await set('OFT', !!flags.o)
  await w.press(w.page.locator('#inpEditSave')); await sleep(900)
  const still = await tid(w.page, 'win-inputedit').isVisible().catch(() => false)
  const err = await w.page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"] [role="alert"], [data-testid="win-inputedit"] .inped-err, [data-testid="win-inputedit"] .inped-bad, [data-testid="win-inputedit"] .inped-warn')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).join(' | '))
  return { stillOpen: !!still, err }
}

/* ---- the Calendar window ---- */
export async function calOpenFromSans(w, iso) {
  await sansOpen(w, iso)
  await w.press(tid(w.page, 'sd-days')); await tid(w.page, 'win-days').waitFor({ timeout: 6000 }); await sleep(600)
}
export async function calOpenFromWar(w) {
  await warOpen(w)
  await w.press(tid(w.page, 'settings-open')); await sleep(300)
  await w.press(tid(w.page, 'settings-days')); await tid(w.page, 'win-days').waitFor({ timeout: 6000 }); await sleep(600)
}
export async function calClose(w) { const x = tid(w.page, 'win-days-x'); if (await x.count()) { await w.press(x); await sleep(300) } }
export async function calGoto(w, iso) {
  const tab = tid(w.page, 'days-tab-month'); if (await tab.count()) { await w.press(tab); await sleep(200) }
  const at = async () => { const [m, y] = (await tid(w.page, 'days-month').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MONTHS.indexOf(m) }
  let d = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1) - await at()
  for (; d > 0; d--) await w.press(tid(w.page, 'days-next'))
  for (; d < 0; d++) await w.press(tid(w.page, 'days-prev'))
  await sleep(300)
}
export async function calRead(w, iso) {
  return w.page.evaluate(iso => {
    const c = document.querySelector(`[data-testid="days-cell-${iso}"]`); if (!c) return null
    const tag = c.querySelector('[data-testid^="days-tag-"]')
    const lit = [...c.querySelectorAll('.days-key.lit')].map(b => b.innerText.trim())
    const step = c.querySelector('.days-step')
    const NAME = { day: 'D', night: 'N', nf: 'NF', none: 'none' }
    return { tag: tag ? tag.innerText.trim() : null, lit: lit.join(',') || (step ? NAME[step.dataset.cls] : 'none'), dot: !!c.querySelector('[data-testid^="days-dot-"]'),
      tagBg: tag ? getComputedStyle(tag).backgroundColor : null }
  }, iso)
}
export async function calSet(w, iso, cls) { // 'day' | 'night' | 'nf'
  await calGoto(w, iso)
  const key = { day: 'd', night: 'n', nf: 'nf' }[cls]
  if (!w.touch || w.size === 'side') { await w.press(tid(w.page, `days-${key}-${iso}`)); await sleep(400); return }
  for (let i = 0; i < 4; i++) {
    const s = tid(w.page, 'days-step-' + iso)
    if ((await s.getAttribute('data-cls')) === cls) break
    await w.press(s); await sleep(350)
  }
}

/* ---- undo / redo in the app's own top bar ---- */
export async function undo(w) { await w.press(w.page.locator('#undoBtn')); await sleep(700) }
export async function redo(w) { await w.press(w.page.locator('#redoBtn')); await sleep(700) }
export const bridge = (w, iso) => w.page.evaluate(iso => ({ f: window.lwDayFacts(iso), a: window.flyAnswer(iso) }), iso)

/* a step that asserts what the screen said: PASS when every check holds; the failed ones are named */
import { row } from './cal-A-lib.mjs'
export function judge(id, did, checks, pics = [], opts = {}) {
  const bad = checks.filter(c => !c[1])
  const saw = checks.map(c => `${c[1] ? 'OK' : 'XX'} ${c[0]}${c[2] !== undefined ? ' [' + (typeof c[2] === 'string' ? c[2] : JSON.stringify(c[2])) + ']' : ''}`).join(' | ')
  row(id, did, saw, opts.partial && bad.length === 0 ? 'PARTIAL' : bad.length ? 'FAIL' : 'PASS', pics)
  return !bad.length
}
export const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b)

/* ---- the Calendar window's Holidays list ---- */
export async function holTab(w) { const t = tid(w.page, 'days-tab-holidays'); if (await t.count()) { await w.press(t); await sleep(300) } }
export async function holAdd(w, { kind = 'ph', name = '', short = '', from, to = null }) {
  await holTab(w)
  await w.press(tid(w.page, 'hol-add')); await tid(w.page, 'hol-name').waitFor(); await sleep(300)
  if (kind !== 'ph') await w.press(tid(w.page, 'hol-kind-' + kind))
  if (name) await tid(w.page, 'hol-name').fill(name)
  if (short) await tid(w.page, 'hol-short').fill(short)
  const at = async () => { const [m, y] = (await tid(w.page, 'holcal-month').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MONTHS.indexOf(m) }
  const go = async iso => { let d = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1) - await at(); for (; d > 0; d--) await w.press(tid(w.page, 'holcal-next-month')); for (; d < 0; d++) await w.press(tid(w.page, 'holcal-prev-month')) }
  await go(from); await w.press(tid(w.page, 'holcal-day-' + from))
  if (to) { await go(to); await w.press(tid(w.page, 'holcal-day-' + to)) }
  await sleep(200)
  const span = (await tid(w.page, 'hol-dates').innerText()).replace(/\s+/g, ' ').trim()
  await w.press(tid(w.page, 'hol-save')); await sleep(900)
  const err = (await tid(w.page, 'hol-err').count()) ? (await tid(w.page, 'hol-err').innerText()).trim() : null
  return { err, formStillOpen: (await tid(w.page, 'hol-name').count()) > 0, span: span.slice(-80) }
}

/* ---- the Inputs month (its own tag for a date) ---- */
export async function inputsOpen(w) {
  await w.page.evaluate(() => window.go('inputs'))
  await w.page.waitForSelector('#inMemberMode', { timeout: 10000 })
  await w.page.click('#inMemberMode'); await w.page.waitForSelector('#inpCal', { timeout: 8000 }); await sleep(300)
}
export async function inputsGoto(w, iso) {
  const at = async () => { const [m, y] = ((await w.page.locator('#inpCal .ic-mon').getAttribute('aria-label')) || '').trim().toLowerCase().split(/\s+/); return +y * 12 + MONTHS.indexOf(m) }
  let d = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1) - await at()
  for (; d > 0; d--) await w.press(w.page.locator('#icNext'))
  for (; d < 0; d++) await w.press(w.page.locator('#icPrev'))
  await sleep(300)
}
export async function inputsTag(w, iso) {
  return w.page.evaluate(iso => { const t = document.querySelector(`[data-testid="ib-tag-${iso}"]`); const c = document.querySelector(`[data-icday="${iso}"]`)
    return { tag: t ? t.innerText.trim() : null, tagBg: t ? getComputedStyle(t).backgroundColor : null, tagFg: t ? getComputedStyle(t).color : null, cellDrawn: !!c } }, iso)
}
