/* THE TRACKER TIDY (5 Nov 26) — the walker's own driver (Chromium or WebKit, desktop / phone / sideways, failed-save and
   locked-storage fixtures, storage snapshots). Reads the app only to CHECK a screen. Folders come from HP_SHOTS / HP_OUT.
     HP_URL=http://127.0.0.1:4180 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, webkit } from '@playwright/test'

const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, '..', '..')
export const BASE = process.env.HP_URL || 'http://127.0.0.1:4180'
export const SHOTS = process.env.HP_SHOTS || resolve(ROOT, 'docs/img/handpass/2026-11-05-tracker-tidy/walk')
export const OUT = process.env.HP_OUT || resolve(ROOT, 'docs/handpass/parts/trk1105/walk')
export const SCRATCH = resolve(process.env.TEMP || process.env.TMP || '.', 'trk1105-walk')
mkdirSync(SHOTS, { recursive: true }); mkdirSync(OUT, { recursive: true }); mkdirSync(SCRATCH, { recursive: true })

export const D = { width: 1536, height: 864 }
export const P = { width: 402, height: 874 }
export const Lnd = { width: 874, height: 402 }
export const sleep = ms => new Promise(r => setTimeout(r, ms))

const FAIL_INIT = `(() => { const o = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (window.__failSaves === true && String(k).startsWith('raptor:')) throw new DOMException('walk: forced', 'QuotaExceededError'); return o.call(this, k, v) } })()`
const LOCK_INIT = `Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('denied', 'SecurityError') } })`

/** opts: engine 'chromium'|'webkit', size, touch, who 'a'|'u', tracker (open the Tracker), url (path), fail (install the fixture),
    locked, dpr, noLogin, ctx (an existing context to reuse: then no new browser) */
export async function open(opts = {}) {
  const { engine = 'chromium', size = D, touch = false, who = 'a', tracker = true, url = '/', fail = false, locked = false, dpr, noLogin = false, ctx: ctx0 = null, browser: b0 = null } = opts
  let browser = b0, ctx = ctx0
  if (!ctx) {
    browser = await (engine === 'webkit' ? webkit : chromium).launch({ headless: true })
    ctx = await browser.newContext({ viewport: size, acceptDownloads: true, ...(touch ? { hasTouch: true, isMobile: true, deviceScaleFactor: dpr || 3 } : { deviceScaleFactor: dpr || 1 }) })
    await ctx.addInitScript('try { delete window.showSaveFilePicker; delete window.showOpenFilePicker } catch (e) {}')
    if (fail) await ctx.addInitScript(FAIL_INIT)
    if (locked) await ctx.addInitScript(LOCK_INIT)
  }
  const page = await ctx.newPage()
  page.setDefaultTimeout(12000)
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  page.on('dialog', d => { errors.push('NATIVE DIALOG ' + d.type() + ': ' + d.message()); d.dismiss().catch(() => {}) })
  await page.goto(BASE + url)
  if (!noLogin) {
    await login(page, who)
    if (tracker) await toTracker(page, touch)
  }
  return { browser, ctx, page, errors, touch, who }
}

export async function login(page, who = 'a') {
  await page.waitForSelector('#luser', { timeout: 20000 })
  await page.fill('#luser', who === 'a' ? 'ad' : 'us')
  await page.fill('#lpass', who === 'a' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await sleep(500)
}
export async function logout(page, touch) {
  const desk = page.locator('#logoutBtn:visible, .topbar button:has-text("Log out"):visible, .topbar button:has-text("Logout"):visible')
  if (await desk.count()) await desk.first().click()
  else {
    await page.click('#burger'); await sleep(300)
    await page.locator('#drawer').getByText(/Log ?out/i).first().click()
  }
}
export async function navTo(page, id, touch) {
  const tab = page.locator(`#topnav a[data-page="${id}"]:visible`)
  if (await tab.count()) await tab.click()
  else { await page.click('#burger'); await sleep(300); await page.locator(`#drawer a[data-page="${id}"]`).first().click() }
  await page.waitForFunction(p => window.CURPAGE === p, id, { timeout: 20000 })
  await sleep(450)
}
export async function toTracker(page, touch) {
  await navTo(page, 'tracker', touch)
  await page.waitForSelector('#flowSvg .ball', { timeout: 30000 })
  await sleep(450)
}

let shotNo = 0
export async function shot(page, name, o = {}) {
  const f = resolve(SHOTS, `${name}.png`)
  try { if (o.el) await page.locator(o.el).first().screenshot({ path: f }); else await page.screenshot({ path: f }) } catch (e) { return 'ERR ' + e.message }
  shotNo++
  return name + '.png'
}
export async function click(page, sel, touch) { const l = typeof sel === 'string' ? page.locator(sel).first() : sel; if (touch) await l.tap(); else await l.click(); await sleep(250) }

export const keys = page => page.evaluate(() => { const o = {}; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k) } } catch (e) { return { __ERR: String(e) } } return o })
export function diffKeys(a, b) {
  const ch = []
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) if (a[k] !== b[k]) ch.push(k)
  return ch
}
export const isOcu = k => /^ocu:/.test(k)
export const ocuAny = o => Object.keys(o).filter(isOcu)
export function classify(ch) {
  return { tracker: ch.filter(k => k.startsWith('raptor:tracker/')), ocuLocal: ch.filter(k => k.startsWith('ocuLocal:')), appOwn: ch.filter(k => k.startsWith('raptor:') && !k.startsWith('raptor:tracker/')), other: ch.filter(k => !k.startsWith('raptor:') && !k.startsWith('ocuLocal:')), ocu: ch.filter(isOcu) }
}

export const pair = page => page.evaluate(() => ({
  undo: document.querySelectorAll('#trUndoBtn').length, redo: document.querySelectorAll('#trRedoBtn').length,
  inTop: !!document.querySelector('.topbar #trUndoBtn') && !!document.querySelector('.topbar #trRedoBtn'),
  inTracker: !!document.querySelector('#page-tracker #trUndoBtn, #page-tracker #trRedoBtn'),
  undoOff: document.querySelector('#trUndoBtn')?.disabled ?? null, redoOff: document.querySelector('#trRedoBtn')?.disabled ?? null,
  title: document.querySelector('#trUndoBtn')?.title ?? null, rtitle: document.querySelector('#trRedoBtn')?.title ?? null,
  rect: (() => { const r = document.querySelector('#trUndoBtn')?.getBoundingClientRect(); return r ? [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] : null })(),
}))
export const grade = (page, id) => page.evaluate(i => window.__undoForTests().grade(i), id)
export const words = page => page.evaluate(() => {
  const vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 1 && r.height > 1 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05 }
  const s = document.getElementById('saveStat'), b = document.querySelector('.topbar .savestat')
  const bandVis = b && vis(b)
  return { corner: s && vis(s) ? s.textContent.trim() : '', cornerEl: !!s, band: b && bandVis ? b.textContent.replace(/\s+/g, ' ').trim() : '', retry: !!(b && bandVis && [...b.querySelectorAll('button')].length) }
})
export const setFail = (page, v) => page.evaluate(x => { window.__failSaves = x }, v)

export async function revealBall(page, id) {
  await page.evaluate(i => { const bd = document.getElementById('board'), g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === i); const r = g.getBoundingClientRect(), b = bd.getBoundingClientRect(); bd.scrollTop += (r.top + r.height / 2) - (b.top + b.height / 2); bd.scrollLeft += (r.left + r.width / 2) - (b.left + b.width / 2) }, id)
  await sleep(250)
  return page.evaluate(i => { const r = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === i).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }, id)
}
export async function openBall(page, id, touch) {
  const c = await revealBall(page, id)
  if (touch) await page.touchscreen.tap(c.x, c.y); else await page.mouse.click(c.x, c.y)
  await page.waitForSelector('#pop', { timeout: 5000 }); await sleep(300)
}
export async function mark(page, id, g, touch, wait = 900) {
  await openBall(page, id, touch)
  const b = page.locator(`#pop .opts button[data-g="${g}"]`).first()
  if (touch) await b.tap(); else await b.click()
  await sleep(wait)
}
export async function addMember(page, cs, touch) {
  await click(page, '#addStu', touch)
  await page.waitForSelector('#dlgList .dlg-item', { timeout: 5000 })
  const it = page.locator('#dlgList .dlg-item', { hasText: cs }).first()
  if (touch) await it.tap(); else await it.click()
  await sleep(250)
  if (await page.locator('#dlgOk:visible').count()) await click(page, '#dlgOk', touch)
  await sleep(800)
}

/* result log */
export function mk(scn) {
  const rows = []
  return {
    rows,
    ok(step, size, role, cond, said = '', pics = '') {
      const r = { scn, step, size, role, pass: cond === null ? null : !!cond, said: String(said).replace(/\|/g, '/').slice(0, 500), pics }
      rows.push(r); console.log(`${r.pass === null ? ' NOTWALKED' : r.pass ? ' PASS' : ' FAIL'}  ${scn} ${step} [${size}/${role}] — ${r.said.slice(0, 220)}`)
    },
    note(step, said) { rows.push({ scn, step, note: String(said).slice(0, 600) }); console.log(`   ..  ${scn} ${step} — ${String(said).slice(0, 300)}`) },
    save(name) {
      writeFileSync(resolve(OUT, `${name}.json`), JSON.stringify({ rows }, null, 2))
      const f = rows.filter(r => r.pass === false), p = rows.filter(r => r.pass === true)
      console.log(`\n${name}: ${p.length} PASS · ${f.length} FAIL`)
    },
  }
}

/* a phone tap with two pictures: one at once (pointer left where it pressed), one settled (D1281) */
export async function tap2(page, target, name) {
  const l = typeof target === 'string' ? page.locator(target).first() : target
  await l.tap()
  const a = await shot(page, name + '-now')
  await sleep(700)
  const b = await shot(page, name + '-set')
  return a + ',' + b
}
/* pick a day of the open calendar (the app's date box): the n-th day of the shown month that is not greyed */
export async function pickDay(page, n, touch) {
  const d = page.locator('.dcal-d:not(.is-out)').filter({ hasText: new RegExp('^' + n + '$') }).first()
  if (touch) await d.tap(); else await d.click()
  await sleep(500)
}
export async function addFirst(page, touch) {
  await click(page, '#addStu', touch)
  await page.waitForSelector('#dlgList .dlg-item', { timeout: 5000 })
  const t = await page.locator('#dlgList .dlg-item').first().innerText()
  const it = page.locator('#dlgList .dlg-item').first()
  if (touch) await it.tap(); else await it.click()
  await sleep(250)
  if (await page.locator('#dlgOk:visible').count()) await click(page, '#dlgOk', touch)
  await sleep(900)
  return t.trim().slice(0, 30)
}

/* after a reload: sign in again if the card shows, then land on the Tracker */
export async function back(page, who, touch) {
  await sleep(1200)
  if (await page.locator('#luser').count()) await login(page, who)
  const cp = await page.evaluate(() => window.CURPAGE)
  if (cp !== 'tracker') await toTracker(page, touch)
  else await page.waitForSelector('#flowSvg .ball', { timeout: 30000 })
  await sleep(500)
}

/* File ⤓ Export — a whole backup (both boxes ticked), saved under the scratch folder; returns the path */
export async function exportFile(page, name, touch) {
  await click(page, '#fileMenuBtn', touch); await click(page, '#exportBtn', touch)
  await page.waitForSelector('#copyModal', { state: 'visible', timeout: 5000 })
  for (const id of ['#copyCharts', '#copyStudents']) { if (!(await page.locator(id).isChecked())) await page.locator(id).check() }
  await page.locator('#copyTickAll').click(); await sleep(200)
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.locator('#copyOk').click()])
  const f = resolve(SCRATCH, name); await dl.saveAs(f); await sleep(700)
  const alertTxt = await page.locator('#dlgModal:visible').innerText().catch(() => '')
  if (alertTxt) await page.locator('#dlgModal button:visible').first().click()
  await sleep(300)
  exportFile.lastAlert = alertTxt
  return f
}
export async function importFile(page, path, touch) {
  await click(page, '#fileMenuBtn', touch)
  const [fc] = await Promise.all([page.waitForEvent('filechooser', { timeout: 8000 }), page.locator('#importFileBtn').click()])
  await fc.setFiles(path); await sleep(1200)
}

export const showAllSel = touch => touch ? '#page-tracker button:visible:has-text("Show All")' : '#showAllBtn'
export const viewSel = (v, touch) => v === 'all' ? showAllSel(touch) : `#page-tracker button[data-view="${v}"]`

/* how many "saved-green" pixels a clip of the page holds (judged on the pixels, not the element — §7.11 lesson 22) */
export async function greenPixels(page, clip) {
  const buf = await page.screenshot({ clip })
  const b64 = buf.toString('base64')
  return page.evaluate(async b => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b; await img.decode()
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height
    const x = c.getContext('2d'); x.drawImage(img, 0, 0)
    const d = x.getImageData(0, 0, c.width, c.height).data
    let n = 0, bright = 0
    for (let i = 0; i < d.length; i += 4) { if (d[i + 1] > 110 && d[i + 1] > d[i] + 30 && d[i + 1] > d[i + 2] + 15) n++; if (d[i] + d[i + 1] + d[i + 2] > 450) bright++ }
    return { green: n, bright, w: c.width, h: c.height }
  }, b64)
}
export const cornerRect = page => page.evaluate(() => { const s = document.getElementById('saveStat'); if (!s) return null; const r = s.getBoundingClientRect(); return r.width > 1 ? { x: Math.max(0, Math.floor(r.left) - 4), y: Math.max(0, Math.floor(r.top) - 4), width: Math.ceil(r.width) + 8, height: Math.ceil(r.height) + 8 } : null })
export const retryBtn = page => page.locator('.topbar .savestat button').first()

/* answer every app dialog (#dlgModal) that appears, for up to `ms`, pressing the first button that matches `prefer`;
   returns what each said (text and buttons) */
export async function answerDialogs(page, prefer = /^(Replace|Yes|Import|OK|Save|Add|Delete|Continue)/i, ms = 6000, log = []) {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    if (await page.locator('#dlgModal:visible').count()) {
      const text = (await page.locator('#dlgModal').innerText()).trim().replace(/\n+/g, ' / ')
      const btns = page.locator('#dlgModal button:visible')
      const labels = (await btns.allInnerTexts()).map(x => x.trim())
      let pick = null
      for (const re of [].concat(prefer)) { const c = btns.filter({ hasText: re }).first(); if (await c.count()) { pick = c; break } }
      if (!pick) pick = btns.last()
      log.push({ text: text.slice(0, 300), labels, pressed: (await pick.innerText()).trim() })
      await pick.click(); await sleep(500)
      continue
    }
    await sleep(250)
    if (Date.now() - t0 > 2500 && !(await page.locator('#dlgModal:visible').count())) break
  }
  return log
}
export async function dragBall(page, id, dx, dy, steps = 12) {
  const c = await revealBall(page, id)
  await page.mouse.move(c.x, c.y); await page.mouse.down()
  for (let i = 1; i <= steps; i++) { await page.mouse.move(c.x + dx * i / steps, c.y + dy * i / steps); await sleep(25) }
  await page.mouse.up(); await sleep(400)
  return c
}
export const ballPos = (page, id) => page.evaluate(i => { const r = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === i).getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top) } }, id)
