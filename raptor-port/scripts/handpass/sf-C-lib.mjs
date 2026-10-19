/* Walker C's driver for the [STANDBY-FLIES] FULL check (19 Oct 26). Own copy; nothing borrowed. Served build: 4322 only. */
import { existsSync, mkdirSync, appendFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

export const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, '..', '..')
export const BASE = 'http://localhost:4322'
export const OUT = resolve(ROOT, 'docs/img/handpass/2026-10-19-standby-flies/walk/C')
export const LOG = resolve(HERE, 'sf-C-results.log')
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const LAUNCH = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export async function launch() { return chromium.launch({ headless: true, ...LAUNCH }) }

export const errors = []
export async function ctxOpen(browser, { who = 'a', width = 1440, height = 900, dsf = 1, phone = false, tag = 'C' } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dsf, ...(phone ? { isMobile: true, hasTouch: true } : {}) })
  const p = await ctx.newPage()
  p.on('console', m => { if (m.type() === 'error') errors.push(`${tag}: ${m.text()}`) })
  p.on('pageerror', e => errors.push(`${tag} PAGEERROR ${e.message}`))
  p.on('response', r => { if (r.status() >= 400) errors.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await p.goto(BASE + '/')
  await p.waitForSelector('#luser', { state: 'visible', timeout: 15000 })
  const idx = await p.evaluate(() => [...document.scripts].map(s => s.src).filter(s => /index-/.test(s)).join(','))
  console.log('VERSION bundle:', idx)
  await p.fill('#luser', who === 'a' ? 'ad' : 'us'); await p.fill('#lpass', who === 'a' ? 'a' : 'us')
  await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important} #toastEl{display:none !important}' })
  await sleep(500)
  return { ctx, p }
}

export const rows = []
export function rec(sc, step, expected, seen, verdict, pic = '') {
  const r = { sc, step, expected, seen: typeof seen === 'string' ? seen : JSON.stringify(seen), verdict, pic }
  rows.push(r)
  const line = `[${sc}] ${verdict} | ${step} | exp: ${expected} | seen: ${r.seen} | ${pic}`
  console.log(line)
  appendFileSync(LOG, line + '\n')
  return r
}
export const go = async (p, page) => { await p.evaluate(x => window.go(x), page); await sleep(700) }
export const shot = async (p, name, locator) => {
  const f = `${OUT}/C-${name}.png`
  if (locator) await locator.screenshot({ path: f }); else await p.screenshot({ path: f })
  return `C-${name}.png`
}
export async function openBoard(p, di) {
  if (await p.locator('#sbDone').first().isVisible().catch(() => false)) { await p.locator('#sbDone').first().click().catch(() => {}); await sleep(400) }
  await go(p, 'editsched')
  await p.evaluate(d => window.openScheduler(d), di); await p.waitForSelector('#schedBoard', { timeout: 8000 }); await sleep(900)
}
export async function closeBoard(p) {
  if (await p.locator('#sbDone').first().isVisible().catch(() => false)) { await p.locator('#sbDone').first().click(); await sleep(500) }
}
export const bf = (di, gi, li, f) => `#schedBoard [data-bfld="ff:${di}.${gi}.${li}.${f}"]`
export async function bType(p, sel, value) {
  const el = p.locator(sel + ':visible').first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(120)
  await el.click(); await el.fill(''); if (value !== '') await el.type(String(value), { delay: 8 }); await el.blur(); await sleep(300)
}
/** seat a person on a board seat through the real arm-and-pick route */
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
export const warns = p => p.evaluate(() => { const s = document.querySelector('#sbSide'); return s ? s.innerText.split(/\r?\n/).map(x => x.trim()).filter(Boolean).slice(0, 40) : [] })
export const dump = (name, o) => writeFileSync(`${OUT}/_${name}.json`, JSON.stringify(o, null, 1))

/* ---- readers ---- */
/** the day's badge, pending count and version, read off the week (textContent works while the board covers it) */
export const weekHead = (p, di) => p.evaluate(i => {
  const d = [...document.querySelectorAll('#eWeek .day')][i]; if (!d) return null
  const t = s => { const e = d.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null }
  return { badge: t('.badge'), pend: t('.dpend'), ver: t('.verchip'), signs: [...d.querySelectorAll('[data-signday]')].map(e => e.value).join('|') }
}, di)
/** every MAIN/SPARE badge + Flies chip on the board (visible only) */
export const chips = p => p.evaluate(() => {
  const b = document.querySelector('#schedBoard'); if (!b) return []
  return [...b.querySelectorAll('.sabadges')].filter(e => e.offsetParent).map(e => {
    const r = e.querySelector('[data-sarole]'); const f = e.querySelector('.saflies')
    return { role: r ? r.innerText.trim() : null, rid: r ? r.dataset.sarole : null, chip: f ? f.innerText.trim() : null, on: f ? f.classList.contains('on') : null, btn: f ? f.tagName === 'BUTTON' && !!f.dataset.safly : null, title: f ? (f.title || '') : null }
  })
})
export const chipLine = async p => (await chips(p)).map(c => `${c.rid || '?'}:${c.role}${c.on ? '+ON' : c.chip ? '+off' : ''}${c.btn ? '[btn]' : ''}`).join(' ')
/** OIL Earn mode: open it (once) and read each person's switch */
export async function oilOpen(p) { if (!(await p.locator('#sbOil').count())) return false; if (!(await p.locator('#schedBoard [data-oilitem]').count())) { await p.locator('#sbOil').click(); await sleep(900) } return true }
export async function oilClose(p) { if (await p.locator('#schedBoard [data-oilitem]').count()) { await p.locator('#sbOil').click(); await sleep(700) } }
export const oilRead = p => p.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  const P = window.PEOPLE
  const items = [...b.querySelectorAll('.oilitem')].map(e => ({ item: e.dataset.oilitem, lab: e.innerText.trim(), on: e.classList.contains('on'), title: e.title }))
  const ps = [...b.querySelectorAll('.oilpk')].map(e => ({ who: (P[e.dataset.oilp] || {}).cs || e.dataset.oilp, item: e.dataset.oilitem, on: e.classList.contains('on'), amt: (e.querySelector('.oilamt') || {}).innerText || '', title: e.title }))
  return { items, ps }
})
export const oilLine = async p => { const r = await oilRead(p); return r.items.map(i => `${i.lab}:${i.on ? 'ON' : 'off'}`).join(' ') + ' || ' + r.ps.map(x => `${x.who}:${x.on ? 'ON' : 'off'}${x.amt ? '/' + x.amt : ''}`).join(' ') }
/** the day's changes window text (opened from the week's pending button) */
export async function changesText(p, di) {
  let btn = p.locator(`#schedBoard [data-pendlist="${di}"]:visible`).first()
  if (!(await btn.count())) btn = p.getByRole('button', { name: 'History' }).first()
  await btn.click(); await sleep(800)
  const t = await p.evaluate(() => { const w = [...document.querySelectorAll('.chgwin')].find(x => !x.hidden && (x.offsetWidth || x.offsetHeight)); return w ? w.innerText.replace(/\s+/g, ' ').trim() : 'NO WINDOW' })
  return t
}
export async function changesClose(p) {
  const x = p.locator('.chgwin:visible button').filter({ hasText: /✕|Close|×/ }).first()
  if (await x.count()) { await x.click(); await sleep(400) } else { await p.keyboard.press('Escape'); await sleep(300) }
}
/** Leave War OIL tracker: every credit entry for the date text e.g. '18 Jul' per person */
export async function trackerCredits(p, dateText = '18 Jul', shotName = null) {
  await go(p, 'leavewar'); await sleep(1200)
  if (!(await p.locator('[data-testid="oil-sheet"]:visible').count())) { await p.locator('[data-testid="oil-tracker"]').click(); await sleep(1200) }
  const r = await p.evaluate(dt => {
    const P = window.PEOPLE
    return [...document.querySelectorAll('[data-testid^="oil-entry-"]')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(t => t.includes(dt)).concat([])
  }, dateText)
  const who = await p.evaluate(dt => [...document.querySelectorAll('[data-testid^="oil-entry-"]')].filter(e => e.innerText.includes(dt)).map(e => { const m = e.dataset.testid.match(/^oil-entry-([^-]+)-/); const P = window.PEOPLE; return ((P[m && m[1]] || {}).cs || (m && m[1])) + ' ' + e.innerText.replace(/\s+/g, ' ').trim() }), dateText)
  if (shotName) {
    // scroll the first matching entry into view for the picture
    const first = p.locator(`[data-testid^="oil-entry-"]`).filter({ hasText: dateText }).first()
    if (await first.count()) await first.scrollIntoViewIfNeeded()
    await sleep(300)
    await shot(p, shotName)
  }
  return who
}
export async function trackerClose(p) { const x = p.locator('[data-testid="oil-close"]'); if (await x.count() && await x.isVisible()) { await x.click(); await sleep(500) } }
/** Fill a warning list row text: warnings are #sbSide, strip the junk */
export const warnLines = async p => { const w = await warns(p); const i = w.indexOf('PLACEHOLDERS'); return (i > 0 ? w.slice(0, i) : w).filter(x => x !== '✕') }
/** add a flying wave through the board's own + Wave -> Flying wave */
export async function bAddFlyingWave(p, di) {
  await p.locator(`#schedBoard [data-wvadd="${di}"]:visible`).first().click(); await sleep(400)
  await p.getByRole('button', { name: 'Flying wave' }).first().click(); await sleep(700)
}
export const bflyChip = (di, gi, li, ai) => `#schedBoard [data-safly="${di}.${gi}.${li}.${ai}"]`
export async function undo(p) { await p.locator('#schedBoard').getByRole('button', { name: /Undo/ }).first().click(); await sleep(600) }
export async function redo(p) { await p.locator('#schedBoard').getByRole('button', { name: /Redo/ }).first().click(); await sleep(600) }
export async function reloadTo(p, di) {
  await p.reload(); await sleep(800)
  if (await p.locator('#luser').count() && await p.locator('#luser').isVisible().catch(() => false)) {
    await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  }
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important} #toastEl{display:none !important}' })
  await sleep(600)
  await openBoard(p, di)
}
/** sign-off selects' values on the open board for day di + the publish button's label/disabled */
export const signInfo = (p, di) => p.evaluate(i => {
  const b = document.querySelector('#schedBoard')
  const sels = [...b.querySelectorAll(`[data-signday="${i}"]`)].filter(e => e.offsetParent)
  const beak = b.querySelector(`[data-beak="${i}"], [data-alpub="${i}"]`)
  return { signs: sels.map(s => s.value), publish: beak ? (beak.innerText.trim() + (beak.disabled ? ' [locked]' : ' [open]')) : null, status: [...b.querySelectorAll('.sb-top, .sbhead, #sbSide')].length ? undefined : undefined }
}, di)
export const pendText = p => p.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard .dpend')].find(x => x.offsetParent); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null })
/** seat a person on any board slot by its full key (sim s:..., ground g:..., duty d:...) */
export async function bPutKey(p, key, prefs) {
  const slot = `#schedBoard [data-slot="${key}"]:visible`
  for (let a = 0; a < 3; a++) {
    const el = p.locator(slot).first(); await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(120)
    await el.click(); await sleep(250)
    for (const pid of prefs) {
      const pk = p.locator(`#sbRoster .rpuck[data-person="${pid}"]:visible`).first()
      if (!(await pk.count())) continue
      await pk.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(100)
      try { await pk.click({ timeout: 2500 }) } catch { const b = await pk.boundingBox(); if (b) await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
      await sleep(400)
      const ok = await p.evaluate(([s, pid]) => [...document.querySelectorAll(s)].some(e => e.querySelector(`[data-person="${pid}"]`)), [`#schedBoard [data-slot="${key}"]`, pid])
      if (ok) return pid
    }
    await p.keyboard.press('Escape')
  }
  return 'FAILED'
}
/** the puck of a person in a board slot: class + title */
export const puckAt = (p, key) => p.evaluate(k => { const e = document.querySelector(`#schedBoard [data-slot="${k}"] .puck`); return e ? { cls: e.className, title: e.title } : null }, key)
export const ringed = pk => !!pk && /\b(warn|hard|boxred|soft)\b/.test(pk.cls)
/** seat a person into an add-zone (ground rows, inputs): data-fill="g:4.1.+" */
export async function bPutFill(p, fill, prefs) {
  const z = `#schedBoard [data-fill="${fill}"]:visible`
  for (let a = 0; a < 3; a++) {
    const el = p.locator(z).first(); await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(120)
    await el.click(); await sleep(250)
    for (const pid of prefs) {
      const pk = p.locator(`#sbRoster .rpuck[data-person="${pid}"]:visible`).first()
      if (!(await pk.count())) continue
      await pk.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(100)
      try { await pk.click({ timeout: 2500 }) } catch { const b = await pk.boundingBox(); if (b) await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
      await sleep(400)
      const ok = await p.evaluate(([s, pid]) => [...document.querySelectorAll(s)].some(e => e.querySelector(`[data-person="${pid}"]`)), [`#schedBoard [data-fill="${fill}"]`, pid])
      if (ok) return pid
    }
    await p.keyboard.press('Escape')
  }
  return 'FAILED'
}

/* ---- roles and the Inputs window (as a member files it) ---- */
export async function switchRole(p, who) {
  const lo = p.locator('#logout')
  if (await lo.count() && await lo.isVisible().catch(() => false)) { await lo.click(); await sleep(700) }
  else { await p.locator('#burger').click(); await sleep(400); await p.locator('#drawerLogout').click(); await sleep(700) }
  await p.waitForSelector('#luser', { state: 'visible', timeout: 15000 })
  await p.fill('#luser', who === 'a' ? 'ad' : 'us'); await p.fill('#lpass', who === 'a' ? 'a' : 'us')
  await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important} #toastEl{display:none !important}' })
  await sleep(700)
}
/** file one input through the Inputs page's own "+ Input" window (own days via the window's calendar) */
export async function fileInput(p, { type, iso, remarks = '' }) {
  await go(p, 'inputs')
  if (await p.locator('#inListBtn').count()) { await p.locator('#inListBtn').click().catch(() => {}); await sleep(500) }
  const before = await p.evaluate(() => window.INPUTS.map(x => x.iid))
  await p.locator('#inNew').click(); await sleep(900)
  await p.selectOption('#inpEditType', type); await sleep(300)
  // the window's calendar opens on the boot month (July 2026)
  await p.locator(`[data-testid="inpEdCal-day-${iso}"]`).click(); await sleep(300)
  if (remarks) await p.locator('#inpEditRmk').fill(remarks)
  const ptxt = await p.evaluate(() => document.querySelector('#inpEditPop').innerText.replace(/\s+/g, ' ').slice(0, 300))
  await p.locator('#inpEditSave').click(); await sleep(1000)
  const seen = []
  for (let i = 0; i < 4; i++) {
    const nodoc = p.locator('[data-testid="docconf-nodoc"]:visible')
    if (await nodoc.count()) { seen.push('docconf'); await nodoc.click(); await sleep(600); continue }
    const conf = p.locator('[data-testid="oilconf"]:visible')
    if (await conf.count()) { seen.push('oilconf'); await conf.locator('button').filter({ hasText: /^No/ }).first().click().catch(() => {}); await conf.getByRole('button', { name: 'Save', exact: true }).click().catch(() => {}); await sleep(600); continue }
    break
  }
  const iid = await p.evaluate(b4 => window.INPUTS.filter(x => !b4.includes(x.iid)).map(x => x.iid)[0] || null, before)
  return { iid, popup: ptxt, prompts: seen }
}
export const inputCardText = (p, iid) => p.evaluate(i => { const e = document.querySelector(`[data-iid="${i}"], [data-inp="${i}"], [data-inid="${i}"]`); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 300) : null }, iid)
export const toastNow = p => p.evaluate(() => (document.querySelector('#toastEl') || {}).textContent || '')
