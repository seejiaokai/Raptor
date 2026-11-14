/* rcf-w1 shared helpers (12 Nov 26) — world, fixtures through the app's own controls, readers.
   Set HP_URL / HP_SHOTS BEFORE importing this file (the driver reads them once). */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
const L = await import('../am/w2-lib.mjs')
const W4 = await import('../am/w4-lib.mjs')
const W1 = await import('../am/w1-lib.mjs')
export { L, W4, W1 }
export const { check, note, summary, RESULTS } = L
export const norm = s => String(s || '').replace(/[\s ]+/g, ' ').trim()
export const SHOTS = process.env.HP_SHOTS
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const DESK = { width: 1536, height: 864 }
export const PHONE = { width: 402, height: 874 }
export const ISO = ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17', '2026-07-18', '2026-07-19']

export async function world(kind = 'desktop', { who = 'a' } = {}) {
  const phone = kind === 'phone'
  const CH = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
  mkdirSync(SHOTS, { recursive: true })
  const browser = await chromium.launch({ headless: true, ...(existsSync(CH) ? { executablePath: CH } : {}) })
  const ctx = await browser.newContext({ viewport: phone ? PHONE : DESK, deviceScaleFactor: phone ? 3 : 1, ...(phone ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(process.env.HP_URL + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await L.login(page, who)
  await L.installToasts(page)
  const CS = await page.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, p]) => [k, p.cs])))
  const ID = cs => Object.keys(CS).find(k => CS[k] === cs)
  return { browser, ctx, page, errors, CS, ID, phone }
}

/* press: a tap on a touch world, a click otherwise; the control brought to the middle first.
   `after` names a picture taken ~at once after the press (the phone's tap-picture rule, D1281). */
export async function press(w, sel, { nth = 0, after = null, scope = 'board' } = {}) {
  const page = w.page
  const inBoard = scope === 'board' && (await page.locator('#schedBoard:visible').count())
  const q = inBoard ? sel.split(',').map(s => '#schedBoard ' + s.trim() + ':visible').join(', ') : sel.split(',').map(s => s.trim() + ':visible').join(', ')
  const el = page.locator(q).nth(nth)
  await el.waitFor({ state: 'visible', timeout: 8000 })
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await sleep(150)
  const doIt = async () => { if (w.phone) await el.tap({ timeout: 2500 }); else await el.click({ timeout: 2500 }) }
  try { await doIt() } catch {
    const b = await el.boundingBox(); if (!b) throw new Error('no box for ' + sel)
    if (w.phone) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  }
  if (after) { await sleep(60); await page.screenshot({ path: `${SHOTS}/${after}.png` }) }
  await sleep(300)
}

/* type into a board box and commit it (blur) */
export async function typeIn(w, sel, value) {
  const page = w.page
  const inBoard = await page.locator('#schedBoard:visible').count()
  const q = inBoard ? '#schedBoard ' + sel + ':visible' : sel + ':visible'
  const el = page.locator(q).first()
  await el.waitFor({ state: 'visible', timeout: 8000 })
  await el.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await sleep(100)
  if (w.phone) await el.tap(); else await el.click()
  await el.fill('')
  await el.type(String(value), { delay: 8 })
  await el.blur()
  await sleep(300)
}

/* + Wave → kind ('' flying wave, 'avalon', 'bb', 'sc' ... as the menu's data-wmkind), returns the new wave index */
export async function addWave(w, di, kind = '') {
  const page = w.page
  const n0 = await page.evaluate(i => window.DAYS[i].waves.length, di)
  await press(w, `[data-wvadd="${di}"]`)
  await press(w, `.wavemenu [data-wmkind="${kind}"]`, { scope: 'page' })
  await page.waitForFunction(([i, n]) => window.DAYS[i].waves.length === n + 1, [di, n0])
  await sleep(300)
  return n0
}
/* seat a man in a slot by arming it and tapping him in the crew list */
export async function seat(w, slotSel, id) {
  const page = w.page
  for (let t = 0; t < 3; t++) {
    await press(w, slotSel)
    await sleep(200)
    const armed = await page.evaluate(() => window.ARM && window.ARM.key)
    if (!armed) continue
    const p = page.locator(`#sbRoster .rpuck[data-person="${id}"]:visible`).first()
    if (!(await p.count())) { await page.keyboard.press('Escape'); return 'FAILED: ' + id + ' not offered' }
    await p.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(100)
    try { if (w.phone) await p.tap({ timeout: 2500 }); else await p.click({ timeout: 2500 }) } catch { const b = await p.boundingBox(); if (b) { if (w.phone) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2) } }
    await sleep(400)
    return 'ok'
  }
  return 'FAILED: seat not armed ' + slotSel
}
/* the crew list drawer on a phone: open if the roster is not visible */
export async function ensureRoster(w) {
  const page = w.page
  if (!w.phone) return
  if (await page.locator('#sbRoster:visible').count()) return
  const tab = page.locator('#schedBoard .ros-tab:visible').first()
  if (await tab.count()) { await tab.tap(); await sleep(400) }
}
export async function closeRoster(w) {
  const page = w.page
  if (!w.phone) return
  if (await page.evaluate(() => document.body.classList.contains('ros-open'))) { const tab = page.locator('#schedBoard .ros-tab:visible').first(); if (await tab.count()) { await tab.tap(); await sleep(400) } }
}
export async function seatPhoneAware(w, slotSel, id) {
  await ensureRoster(w)
  const r = await seat(w, slotSel, id)
  await w.page.evaluate(() => document.querySelector('#schedBoard [data-disarm]')?.click())
  await closeRoster(w)
  return r
}

/* the day's warning list as the board draws it, and the week's strip */
export async function boardWarn(page, w = null) {
  /* the phone board keeps the day's checks folded behind "▸ N issues": open it through its own toggle (tap) first */
  const tog = page.locator('#schedBoard [data-sbwtog]:visible').first()
  if (await tog.count()) {
    const hasLines = await page.evaluate(() => !!document.querySelector('#schedBoard #sbWarn .wln'))
    if (hasLines && !(await page.locator('#schedBoard #sbWarn .wln:visible').count())) {
      await tog.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
      if (w && w.phone) await tog.tap(); else await tog.click()
      await sleep(400)
    }
  }
  return page.evaluate(() => {
    const side = document.querySelector('#schedBoard #sbWarn') || document.querySelector('#schedBoard #sbSide')
    if (!side) return { head: null, items: [] }
    const items = [...side.querySelectorAll('.wln, .witem')].filter(e => e.offsetWidth).map(e => e.innerText.replace(/[\s ]+/g, ' ').trim()).filter(Boolean)
    return { head: (side.innerText || '').replace(/[\s ]+/g, ' ').trim().slice(0, 200), items }
  })
}
/* open the warning strip of a surface ('#eWeek' | '#vWeek') for day di and read its items */
export async function stripItems(page, root, di) {
  const s = page.locator(`${root} [data-daywarn="${di}"]:visible`).first()
  if (!(await s.count())) return { head: 'NO STRIP', items: [] }
  const head = norm(await s.innerText())
  const open = await page.locator(`${root} [data-dwbox="${di}"].open`).count()
  if (!open) { await s.evaluate(e => e.scrollIntoView({ block: 'center' })); await s.click(); await sleep(400) }
  const items = await page.evaluate(([q, i]) => [...document.querySelectorAll(`${q} [data-dwbox="${i}"] .witem`)].map(e => e.innerText.replace(/[\s ]+/g, ' ').trim()), [root, di])
  return { head, items, wasOpen: !!open }
}
export async function pic(page, name, sel = null, { pad = 8 } = {}) {
  const file = `${SHOTS}/${name}.png`
  if (sel) {
    const el = page.locator(sel).first()
    if (await el.count()) {
      await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(250)
      const b = await el.boundingBox()
      const vp = page.viewportSize()
      if (b) {
        const x = Math.max(0, b.x - pad), y = Math.max(0, b.y - pad)
        await page.screenshot({ path: file, clip: { x, y, width: Math.min(vp.width - x, b.width + pad * 2), height: Math.min(vp.height - y, b.height + pad * 2) } })
        return file
      }
    }
  }
  await page.screenshot({ path: file })
  return file
}
/* the Leave War: PH on the event row of a date (text) or removed (null) */
export async function lwEvent(w, iso, text) {
  const page = w.page
  await W4.lwOpen(page, iso)
  const ev = page.locator(`[data-testid="event-0-${iso}"]`).first()
  if (!(await ev.count())) return { ok: false, why: 'no event cell for ' + iso }
  await ev.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(200)
  if (w.phone) await ev.tap(); else await ev.click()
  await sleep(600)
  /* an existing event opens a small card with an "Edit" button first */
  if (!(await page.locator('[data-testid="event-apply"]:visible').count())) {
    const ed = page.getByRole('button', { name: 'Edit', exact: true }).first()
    if (await ed.count() && await ed.isVisible().catch(() => false)) { await page.screenshot({ path: `${SHOTS}/lwevent-card-${iso}-${w.phone ? 'p' : 'd'}.png` }); if (w.phone) await ed.tap(); else await ed.click(); await sleep(600) }
  }
  if (!(await page.locator('[data-testid="event-apply"]:visible').count())) return { ok: false, why: 'event sheet did not open' }
  const sheetPic = `${SHOTS}/lwevent-sheet-${iso}-${text === null ? 'del' : 'add'}-${w.phone ? 'p' : 'd'}.png`
  if (text === null) {
    await page.screenshot({ path: sheetPic })
    const del = page.locator('[data-testid="event-delete"]:visible').first()
    if (!(await del.count())) { await page.locator('[data-testid="event-cancel"]').first().click(); return { ok: false, why: 'no Delete on the sheet' } }
    if (w.phone) await del.tap(); else await del.click()
  } else {
    await page.locator('[data-testid="event-text"]').first().fill(text); await sleep(200)
    await page.screenshot({ path: sheetPic })
    const ap = page.locator('[data-testid="event-apply"]').first()
    if (w.phone) await ap.tap(); else await ap.click()
  }
  await sleep(900)
  /* the holiday's one OIL list opens by itself (an input of the day needs an answer): picture it, close it by "Later" */
  let oilday = null
  const win = page.locator('[data-testid="win-oilday"]:visible').first()
  if (await win.count()) {
    oilday = norm(await win.innerText())
    await page.screenshot({ path: `${SHOTS}/lwevent-oilday-${iso}-${w.phone ? 'p' : 'd'}.png` })
    const later = page.locator('[data-testid="odl-later"]:visible').first()
    if (await later.count()) { if (w.phone) await later.tap(); else await later.click() } else { await page.locator('[data-testid="win-oilday-x"]:visible').first().click() }
    await sleep(500)
  }
  return { ok: true, oilday }
}
export async function lwHead(page, iso) {
  return page.evaluate(d => { const h = document.querySelector(`[data-testid="head-${d}"]`); const e = document.querySelector(`[data-testid="event-0-${d}"]`)
    return { head: h ? h.className + ' | ' + h.innerText.replace(/\s+/g, ' ') : 'NO HEAD', event: e ? e.innerText.replace(/\s+/g, ' ').trim() : 'NO EVENT CELL' } }, iso)
}
export async function lwBox(w, id, iso) {
  const page = w.page
  if (await page.evaluate(() => window.CURPAGE) !== 'leavewar') await W4.lwOpen(page, iso)
  return W4.lwCell(page, id, iso)
}
/* the OIL figure in the man's person window on the war (tap his callsign; read pw-oil; close by pw-close) */
export async function lwOil(w, id, iso, shotName = null) {
  const page = w.page
  if (await page.evaluate(() => window.CURPAGE) !== 'leavewar') await W4.lwOpen(page, iso)
  await page.evaluate(() => { const c = document.querySelector('[data-testid="pw-close"]'); if (c) c.click() })
  const p = page.locator(`[data-testid="person-${id}"]:visible`).first()
  if (!(await p.count())) return { oil: 'NO PERSON CELL' }
  await p.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(200)
  if (w.phone) await p.tap(); else await p.click()
  await sleep(700)
  const r = await page.evaluate(() => { const f = document.querySelector('[data-testid="pw-oil"]'); return { oil: f ? f.innerText.replace(/[\s ]+/g, ' ').trim() : 'NO OIL FIGURE' } })
  if (shotName) await page.screenshot({ path: `${SHOTS}/${shotName}.png` })
  const x = page.locator('[data-testid="pw-close"]:visible').first()
  if (await x.count()) { if (w.phone) await x.tap(); else await x.click(); await sleep(400) }
  return r
}
/* sign four, publish (first publication) or Publish AL — returns what was pressed */
export async function signAndPublish(w, di) {
  const page = w.page
  await L.board(page, di)
  const sg = await L.signDay(page, di, 0)
  let p = await L.publishDay(page, di)
  if (!p.pressed && /absent/.test(p.why || '')) p = await L.publishAL(page, di)
  await sleep(500)
  // a confirm may follow
  const ok = page.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first()
  if (await ok.count() && await ok.isVisible().catch(() => false)) { await ok.click(); await sleep(700) }
  const h = await L.head(page, di)
  return { sg, p, h }
}
export async function undoBtn(w, which = 'undo') {
  const page = w.page
  const sel = which === 'undo' ? '#sbUndo, #undoBtn' : '#sbRedo, #redoBtn'
  const b = page.locator(sel.split(',').map(s => s.trim() + ':visible').join(', ')).first()
  if (!(await b.count())) return { ok: false, why: 'no ' + which + ' button visible' }
  if (await b.isDisabled()) return { ok: false, why: which + ' disabled: ' + (await b.getAttribute('title')) }
  if (w.phone) await b.tap(); else await b.click()
  await sleep(700)
  return { ok: true }
}
export async function viewFace(page, di) {
  await L.go(page, 'viewsched'); await sleep(400)
}
export async function finish(w, tag) {
  console.log('errors:', w.errors.length, w.errors.slice(0, 5))
  await w.browser.close()
}
