/* Walker A's driver for the rally-box FULL check (19 Oct 26). Own copy; nothing borrowed from older walks. */
import { existsSync, mkdirSync, appendFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

export const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, '..', '..', '..', '..')
export const BASE = process.env.HP_URL || 'http://localhost:4298'
export const OUT = resolve(ROOT, 'docs/img/handpass/2026-10-19-rally-build/A')
export const LOG = resolve(HERE, 'results.log')
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const LAUNCH = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
export const sleep = ms => new Promise(r => setTimeout(r, ms))

export const SIZES = {
  desk: { width: 1440, height: 900, dsf: 2 },
  d821: { width: 821, height: 900, dsf: 2 },
  d820: { width: 820, height: 900, dsf: 2 },
  d768: { width: 768, height: 900, dsf: 2 },
  phone: { width: 402, height: 874, dsf: 3, phone: true },
  short: { width: 1440, height: 700, dsf: 2 },
}

export async function launch(opts = {}) { return chromium.launch({ ...LAUNCH, ...opts }) }

export const errors = []
export async function ctxOpen(browser, size, tag) {
  const ctx = await browser.newContext({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: size.dsf, ...(size.phone ? { isMobile: true, hasTouch: true } : {}) })
  const p = await ctx.newPage()
  p.on('console', m => { if (m.type() === 'error') errors.push(`${tag}: ${m.text()}`) })
  p.on('pageerror', e => errors.push(`${tag} PAGEERROR ${e.message}`))
  p.on('response', r => { if (r.status() >= 400) errors.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await p.goto(BASE + '/')
  await p.waitForSelector('#luser', { state: 'visible', timeout: 15000 })
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await sleep(500)
  return { ctx, p }
}

export const rows = []
export function rec(sc, size, pressed, expected, seen, verdict, pic = '') {
  const r = { sc, size, pressed, expected, seen: typeof seen === 'string' ? seen : JSON.stringify(seen), verdict, pic }
  rows.push(r)
  const line = `[${sc}] ${verdict} | ${pressed} | exp: ${expected} | seen: ${r.seen} | ${pic}`
  console.log(line)
  appendFileSync(LOG, line + '\n')
  return r
}

export const go = async (p, page) => { await p.evaluate(x => window.go(x), page); await sleep(700) }
export const shot = async (p, name, locator) => {
  const f = `${OUT}/${name}.png`
  if (locator) await locator.screenshot({ path: f }); else await p.screenshot({ path: f })
  return `A/${name}.png`
}
export const rl = (di, gi, li) => `[data-txt="ff:${di}.${gi}.${li}.rl"]`
export const field = (di, gi, li, f) => `[data-txt="ff:${di}.${gi}.${li}.${f}"]`

/** center-click (mouse) or tap (touch) a locator after scrolling it to centre */
export async function press(p, loc, phone) {
  await loc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(150)
  const b = await loc.boundingBox()
  if (!b) throw new Error('no box')
  if (phone) await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  await sleep(200)
}
export const model = (p, di, gi, li) => p.evaluate(([d, g, l]) => { const f = window.DAYS[d].waves[g].formations[l]; return f ? { cs: f.cs, to: f.to, ld: f.ld, br: f.br, rl: f.rl } : null }, [di, gi, li])

/* ---- board helpers ---- */
export async function openBoard(p, di) {
  if (await p.locator('#schedBoard').count()) { await p.locator('#schedBoard #sbDone').first().click().catch(() => {}); await sleep(400) }
  await go(p, 'editsched')
  await p.evaluate(d => window.openScheduler(d), di); await p.waitForSelector('#schedBoard', { timeout: 8000 }); await sleep(900)
}
export async function closeBoard(p) {
  if (await p.locator('#schedBoard').count()) { await p.locator('#sbDone').first().click(); await sleep(500) }
}
export const bf = (di, gi, li, f) => `#schedBoard [data-bfld="ff:${di}.${gi}.${li}.${f}"]`
export async function bType(p, sel, value) {
  const el = p.locator(sel + ':visible').first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(120)
  await el.click(); await el.fill(''); await el.type(String(value), { delay: 8 }); await el.blur(); await sleep(250)
}
export async function bAddFlyingWave(p, di) {
  await p.locator(`#schedBoard [data-wvadd="${di}"]:visible`).first().click(); await sleep(400)
  await p.getByRole('button', { name: 'Flying wave' }).first().click(); await sleep(700)
}
export async function bLine(p, di, gi, li, o) {
  if (o.cs != null) await bType(p, bf(di, gi, li, 'cs'), o.cs)
  if (o.to != null) await bType(p, bf(di, gi, li, 'to'), o.to)
  if (o.ld != null) await bType(p, bf(di, gi, li, 'ld'), o.ld)
}
export async function bPut(p, di, gi, li, ai, seat, prefs) {
  const slot = `#schedBoard [data-slot="${di}.${gi}.${li}.${ai}.${seat}"]:visible`
  for (let a = 0; a < 3; a++) {
    const el = p.locator(slot).first(); await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(120)
    await el.click(); await sleep(250)
    for (const pid of prefs) {
      const pk = p.locator(`#sbRoster .rpuck[data-person="${pid}"]:visible`).first()
      if (!(await pk.count())) continue
      await pk.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(100)
      try { await pk.click({ timeout: 2500 }) } catch { const b = await pk.boundingBox(); if (b) await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
      await sleep(400)
      const ok = await p.evaluate(([s, pid]) => [...document.querySelectorAll(s)].some(e => e.querySelector(`[data-person="${pid}"]`)), [`#schedBoard [data-slot="${di}.${gi}.${li}.${ai}.${seat}"]`, pid])
      if (ok) return pid
    }
    await p.keyboard.press('Escape')
  }
  return 'FAILED'
}
export async function bPublish(p, di) {
  const sels = p.locator(`#schedBoard [data-signday="${di}"]:visible`)
  const n = await sels.count()
  for (let i = 0; i < n; i++) {
    const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && !/^—/.test(v)))
    if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
    await sleep(200)
  }
  await sleep(400)
  let beak = p.locator(`#schedBoard [data-beak="${di}"]:visible, #schedBoard [data-alpub="${di}"]:visible`).first()
  const lab0 = (await beak.innerText()).trim()
  if (await beak.isDisabled()) return { published: false, why: lab0, n }
  await beak.click(); await sleep(900)
  const ok = p.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first()
  if (await ok.count() && await ok.isVisible()) { await ok.click(); await sleep(900) }
  return { published: true, label: lab0, chip: await p.evaluate(() => (document.querySelector('#schedBoard .verchip') || {}).innerText || '') }
}
export const warns = p => p.evaluate(() => { const s = document.querySelector('#sbSide'); return s ? s.innerText.split(/\r?\n/).map(x => x.trim()).filter(Boolean).slice(0, 25) : [] })
/** Build a flying Saturday through the board: one wave, one line VL with to/ld and crew. */
export async function buildSat(p, o = {}) {
  await openBoard(p, 5)
  await bAddFlyingWave(p, 5)
  await bLine(p, 5, 0, 0, { cs: 'VL', to: o.to || '12:00', ld: o.ld || '13:00' })
  const a = await bPut(p, 5, 0, 0, 0, 'p', ['stiff', 'bane', 'ace'])
  const b = await bPut(p, 5, 0, 0, 0, 'w', ['freak', 'wolf', 'echo'])
  return { a, b }
}

export const status = p => p.evaluate(() => {
  const b = document.querySelector('#schedBoard'); if (!b) return null
  const head = b.querySelector('.sb-sign')?.parentElement || b
  return {
    chip: (b.querySelector('.verchip') || {}).innerText || '',
    pend: [...b.querySelectorAll('[data-alcount], .alchip, [data-histbtn], [data-dayhist]')].map(e => (e.innerText || '').trim()).filter(Boolean).slice(0, 4),
    signs: [...b.querySelectorAll('[data-signday]')].filter(e => e.offsetParent).map(e => e.value),
    beak: (b.querySelector('[data-beak]') || b.querySelector('[data-alpub]') || {}).innerText || '',
    oil: [...b.querySelectorAll('[data-oilp]')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()),
  }
})
export const oilOn = async p => { if (!(await p.locator('#schedBoard [data-oilitem]').count())) { await p.locator('#sbOil').click(); await sleep(800) } }
export const oilOff = async p => { if (await p.locator('#schedBoard [data-oilitem]').count()) { await p.locator('#sbOil').click(); await sleep(600) } }
export const oilRead = async p => { await oilOn(p); const r = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilp]')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim())); await oilOff(p); return r }
export const boardShot = async (p, name) => { const el = p.locator('#schedBoard .sb-go').first(); return shot(p, name, el) }
export const rlBox = (di, gi, li, f = 'rl') => `#schedBoard [data-bfld="ff:${di}.${gi}.${li}.${f}"]`
export const val = (p, sel) => p.locator(sel + ':visible').first().evaluate(e => ({ v: e.value ?? e.textContent, ph: e.placeholder ?? e.dataset?.ph, sel: String(window.getSelection()), act: document.activeElement === e }))

export async function lwOil(p, ids, iso = '2026-07-18') {
  const back = await p.evaluate(() => window.CURPAGE)
  await go(p, 'leavewar'); await sleep(1200)
  const mon = p.locator('[data-testid="month-JUL"]')
  if (await mon.count()) { await mon.first().click(); await sleep(1200) }
  const r = await p.evaluate(([ids, d]) => { const o = {}; for (const id of ids) { const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`); o[id] = c ? ((c.innerText || '').trim() + ' ' + c.className.slice(0, 60) + ' ' + (c.title || '')) : 'NO CELL' } return o }, [ids, iso])
  await go(p, back || 'editsched')
  return r
}
