/* Walker W4's helpers (26 Sep 26) — the PHONE by finger and the MONEY: every figure a person can read about one man,
   read the way a person reads it, so a script can assert that they all say the same thing after every gesture.
   Built on ab-lib.mjs. Nothing here writes through window; reads of window.* are for the evidence table only.

   The five figure readers (Astra R32, plan R34):
     1. the day cell (its code and its grey +n / amber !)            → cellOf
     2. the balance column beside the name (the shown figure, +LVE)   → L.lwBalCol
     3. the man's every-figure sheet (tap the callsign)               → figSheet
     4. the figures drawer (the fold-out beside the names)            → drawerFigs
     5. the breakdown (tap a row of the every-figure sheet)           → breakdown
   plus the manning rows for the date (count-<rule>-<date>)           → manningOn */
process.env.AB_WHO ||= 'w4'
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
export * from './ab-lib.mjs'
import * as L from './ab-lib.mjs'
import { BASE, login } from '../lib.mjs'

/** A fresh demo world. Phone = 390 x 844 with REAL touch (hasTouch + isMobile), so page.touchscreen and CDP touch
    events reach the app as a finger does; desktop = 1440 x 900. */
export async function openW4({ phone = false, who = 'a', state = null, dpr } = {}) {
  const CH = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
  mkdirSync(process.env.HP_SHOTS, { recursive: true })
  const browser = await chromium.launch({ headless: true, ...(existsSync(CH) ? { executablePath: CH } : {}) })
  const ctx = await browser.newContext({
    viewport: phone ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    deviceScaleFactor: dpr ?? (phone ? 2 : 1),
    ...(phone ? { hasTouch: true, isMobile: true } : {}),
    ...(state ? { storageState: state } : {}),
  })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(BASE + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  /* a saved world may come back already signed in — sign in only when the sign-in card is what shows */
  const card = await page.waitForSelector('#luser, #vWeek .day', { timeout: 15000 }).then(e => e.evaluate(x => x.id === 'luser')).catch(() => true)
  if (card) await login(page, who)
  else await page.waitForTimeout(600)
  return { browser, ctx, page, errors, phone }
}

/** Open the war at a date's month — the month strip's own button. The phone's strip button is sometimes reported
    "not stable" to Playwright's mouse click while the grid re-windows (the host's H1 phone run hit the same), so a
    failed click is retried as a FINGER tap on the same button; both are the app's own control. */
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
export async function lwOpen(page, iso) {
  if (await page.locator('#schedBoard:visible').count()) await L.closeBoard(page)
  await L.go(page, 'leavewar')
  await page.waitForSelector('[data-testid^="row-"]', { timeout: 15000 })
  await page.waitForTimeout(500)
  const bar = page.locator('[data-testid="figures-toggle"]:visible').first()
  if ((await bar.count()) && (await bar.getAttribute('aria-expanded')) === 'true') { await bar.click(); await page.waitForTimeout(300) }
  const b = page.locator(`[data-testid="month-${MON[+iso.slice(5, 7) - 1]}"]:visible`).first()
  if (await b.count()) {
    try { await b.click({ timeout: 5000 }) } catch {
      const r = await b.boundingBox()
      const touch = await page.evaluate(() => navigator.maxTouchPoints > 0)
      if (r && touch) await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2)
      else if (r) await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2)
    }
    await page.waitForTimeout(900)
  }
  await page.locator(`[data-testid="head-${iso}"]`).waitFor({ state: 'attached', timeout: 8000 }).catch(() => {})
  await page.waitForTimeout(400)
}

/** A finger tap on an element's centre (after checking the element itself is what sits there). */
export async function fingerTap(page, sel) {
  const el = page.locator(sel).first()
  if (!(await el.count())) return { ok: false, why: 'absent ' + sel }
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(250)
  const at = await el.evaluate(e => { const b = e.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2
    const h = document.elementFromPoint(x, y); return { x, y, ok: !!h && (h === e || e.contains(h)), over: h ? `${h.tagName}.${String(h.className).slice(0, 30)}[${h.getAttribute('data-testid') || ''}]` : 'nothing' } })
  if (!at.ok) return { ok: false, why: 'covered by ' + at.over }
  await page.touchscreen.tap(at.x, at.y)
  await page.waitForTimeout(550)
  return { ok: true }
}

/** Tap a man's day on the war — by finger on a phone, by mouse on a desktop — and report what opened. */
export async function tapDay(page, phone, id, iso) {
  if (!phone) return L.tapCell(page, id, iso)
  if (!(await page.locator(`[data-testid="cell-${id}-${iso}"]`).count())) await lwOpen(page, iso)
  const r = await fingerTap(page, `[data-testid="cell-${id}-${iso}"]`)
  if (!r.ok) return { open: 'COVERED', over: r.why }
  return L.sheetNow(page)
}

/** The day cell as drawn: its code, its corner mark and whether that mark is amber. */
export async function cellOf(page, id, iso) {
  if (!(await page.locator(`[data-testid="cell-${id}-${iso}"]`).count())) await lwOpen(page, iso)
  return page.evaluate(([p, d]) => {
    const c = document.querySelector(`[data-testid="cell-${p}-${d}"]`)
    if (!c) return { box: 'NO CELL' }
    const chip = c.querySelector('.c'), mk = document.querySelector(`[data-testid="mark-${p}-${d}"]`)
    return { box: chip ? chip.innerText.replace(/\s+/g, ' ').trim() : '', mark: mk ? mk.innerText.trim() : '', amber: !!(mk && mk.classList.contains('warn')),
      po: !!document.querySelector(`[data-testid="potag-${p}-${d}"]`), cls: String(c.className).trim(), chipCls: chip ? String(chip.className) : '' }
  }, [id, iso])
}

/** Every figure on the man's every-figure sheet: { lve: '−0.5 0.5', … } (top then the used line, as drawn). */
export async function figSheet(page, id, { keepOpen = false } = {}) {
  const who = page.locator(`[data-testid="person-${id}"]:visible`).first()
  if (!(await who.count())) return { err: 'NO PERSON CELL' }
  await who.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await who.click()
  await page.waitForTimeout(500)
  const r = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-testid^="pfig-"]')]
    .filter(e => /^pfig-[a-z0-9]+$/i.test(e.getAttribute('data-testid')) && e.getAttribute('data-testid') !== 'pfig-close')
    .map(e => { const fb = e.querySelector('.fb'); const u = [...e.querySelectorAll('.fu b')].map(b => b.innerText.trim()); return [e.getAttribute('data-testid').slice(5), (fb ? fb.innerText.trim() : '?') + (u.length ? ' ' + u.join('/') : '')] })))
  if (!keepOpen) { const x = page.locator('[data-testid="pfig-close"]:visible').first(); if (await x.count()) { await x.click(); await page.waitForTimeout(300) } }
  return r
}

/** One figure's breakdown for the man — opened the way a person opens it: the callsign, then that figure's row.
    Returns its parts and total ({ 'LL taken': '-0.5', …, total: '-0.5' }). OIL's row opens the tracker instead. */
export async function breakdown(page, id, fig = 'lve') {
  await figSheet(page, id, { keepOpen: true })
  const row = page.locator(`[data-testid="pfig-${fig}"] button.crow`).first()
  if (!(await row.count())) { await L.closeSheets(page); return { err: 'no row ' + fig } }
  await row.click(); await page.waitForTimeout(500)
  const r = await page.evaluate(() => {
    const s = document.querySelector('[data-testid="figure-breakdown"]')
    if (!s) return { err: 'NO BREAKDOWN' }
    const o = {}
    for (const p of s.querySelectorAll('[data-testid^="part-"]')) o[p.getAttribute('data-testid').slice(5)] = ((p.querySelector('.ct') || p).innerText || '').trim()
    const t = s.querySelector('[data-testid="breakdown-total"] .ct'); o.total = t ? t.innerText.trim() : '?'
    return o
  })
  await L.closeSheets(page)
  return r
}

/** The figures drawer's boxes for the man (opens the drawer through its own toggle, reads, folds it back). */
export async function drawerFigs(page, id, { leaveOpen = false } = {}) {
  const t = page.locator('[data-testid="figures-toggle"]:visible').first()
  if (!(await t.count())) return { err: 'NO TOGGLE' }
  const was = (await t.getAttribute('aria-expanded')) === 'true'
  if (!was) { await t.click(); await page.waitForTimeout(700) }
  const r = await page.evaluate(p => {
    const d = document.querySelector('[data-testid="figdrawer"]')
    if (!d) return { err: 'NO DRAWER' }
    return Object.fromEntries([...d.querySelectorAll(`[data-person="${p}"][data-fig]`)].map(e => { const fb = e.querySelector('.fb'); const u = [...e.querySelectorAll('.fu b')].map(b => b.innerText.trim()); return [e.getAttribute('data-fig'), (fb ? fb.innerText.trim() : '?') + (u.length ? ' ' + u.join('/') : '')] }))
  }, id)
  if (!was && !leaveOpen) { await t.click(); await page.waitForTimeout(400) }
  return r
}

/** Every manning row's figure on one date. */
export async function manningOn(page, iso) {
  if (!(await page.locator(`[data-testid="count-sets-${iso}"]`).count())) await lwOpen(page, iso)
  return page.evaluate(d => Object.fromEntries([...document.querySelectorAll(`[data-testid^="count-"][data-testid$="-${d}"]`)]
    .map(e => [e.getAttribute('data-testid').slice(6, -11), +((e.innerText || '').trim() || 'NaN')])), iso)
}
/** The rows whose figure moved between two manning reads, and by how much. */
export function manningDelta(a, b) {
  const o = {}
  for (const k of Object.keys(b)) { const d = Math.round((b[k] - (a[k] ?? 0)) * 100) / 100; if (d) o[k] = d }
  return o
}

/** The top figure of a box string ("-1.5 1.5" → -1.5; "0" → 0). */
export const top = s => { const m = /^\s*([−-]?\d+(?:\.\d+)?)/.exec(String(s || '').replace('−', '-')); return m ? +m[1] : NaN }

/** The balance column beside the name: the shown figure's name (the column head) and the man's box, top then used. */
export async function balCol(page, id) {
  return page.evaluate(p => {
    const b = document.querySelector(`[data-testid="bal-${p}"]`), cn = document.querySelector('[data-testid="counter-name"]')
    if (!b) return { counter: cn ? cn.innerText.trim() : '?', bal: 'NO BAL CELL' }
    const fb = b.querySelector('.fb'); const u = [...b.querySelectorAll('.fu b')].map(x => x.innerText.trim())
    return { counter: cn ? cn.innerText.trim() : '?', bal: (fb ? fb.innerText.trim() : '?') + (u.length ? ' ' + u.join('/') : '') }
  }, id)
}

/** Read EVERY figure reader for one man at once, and say whether they agree on the figures they share. */
export async function readAll(page, id, iso, { bd = ['lve', 'medtot'], drawer = true } = {}) {
  const cell = iso ? await cellOf(page, id, iso) : null
  const bal = await balCol(page, id)
  const sheet = await figSheet(page, id)
  const draw = drawer ? await drawerFigs(page, id) : null
  const bds = {}
  for (const f of bd) bds[f] = await breakdown(page, id, f)
  const disagree = []
  /* the balance column shows the SHOWN figure (its name in the column head) */
  const shownId = { '+LVE': 'lve', '+OIL': 'oil', '−LVE TOT': 'lvetot', '−MED TOT': 'medtot' }[bal.counter.replace('-', '−')] || null
  if (shownId && sheet[shownId] != null && top(bal.bal) !== top(sheet[shownId])) disagree.push(`balcol ${bal.counter}=${bal.bal} vs sheet ${sheet[shownId]}`)
  if (draw && !draw.err) for (const [k, v] of Object.entries(draw)) if (sheet[k] != null && top(v) !== top(sheet[k])) disagree.push(`drawer ${k}=${v} vs sheet ${sheet[k]}`)
  for (const [k, v] of Object.entries(bds)) if (!v.err && sheet[k] != null && top(v.total) !== top(sheet[k])) disagree.push(`breakdown ${k} total=${v.total} vs sheet ${sheet[k]}`)
  return { cell, bal, sheet, drawer: draw, breakdown: bds, agree: disagree.length === 0, disagree }
}

/** Whether the page scrolls sideways (the phone's no-sideways-scroll check). */
export const sideScroll = page => page.evaluate(() => ({ doc: document.documentElement.scrollWidth, vw: innerWidth, over: document.documentElement.scrollWidth - innerWidth }))
