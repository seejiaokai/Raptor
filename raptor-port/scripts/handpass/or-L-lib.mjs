// Walker L — shared helpers (one-rule walk, 12 Oct 26). Real controls only. Copied in spirit from gi-lib / gi-w1-lib / gi-w3-lib.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const BASE = 'http://localhost:4186/'
export const OUT = 'docs/img/handpass/2026-10-12-one-rule/L'
mkdirSync(OUT, { recursive: true })
export const DESK = { width: 1440, height: 900 }
export const WIN = '[data-testid="win-inputedit"]'
export const ISO = '2026-07-15', DI = 2
export const errs = []
export const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
export const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

/* a world: its own context, signed in; clock set 3 weeks before the week unless clock === null */
export async function open(who = 'ad', pass = 'a', { clock = '2026-06-22T09:00:00', fresh = true, viewport = DESK } = {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  if (clock) await page.clock.setFixedTime(new Date(clock))
  const tag = `${viewport.width}x${viewport.height}`
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 300)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 300)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await page.addInitScript(() => {
    window.__toasts = []
    const go = () => new MutationObserver(ms => { const hit = ms.some(m => { const n = m.target; const el = n.nodeType === 1 ? n : n.parentElement; return (el && (el.id === 'toastEl' || el.closest('#toastEl'))) || [...m.addedNodes].some(x => x.id === 'toastEl') }); if (!hit) return; const t = document.getElementById('toastEl'); if (t && t.style.opacity === '1') window.__toasts.push({ text: t.textContent, at: performance.now() }) }).observe(document.documentElement, { subtree: true, childList: true, characterData: true })
    if (document.documentElement) go(); else document.addEventListener('DOMContentLoaded', go)
  })
  await page.goto(BASE + (fresh ? '?fresh=1' : ''))
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await login(page, who, pass)
  return { ctx, page }
}
export async function login(page, who = 'ad', pass = 'a') {
  await page.waitForSelector('#luser')
  await page.fill('#luser', who); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(500)
}
export async function reload(page, who = 'ad', pass = 'a') {
  await page.reload()
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await page.waitForSelector('#vWeek .day, #loginForm', { state: 'attached' })
  await page.waitForTimeout(500)
  if (await page.locator('#loginForm').isVisible().catch(() => false)) await login(page, who, pass)
}
export const shot = async (p, name, clip) => { await p.screenshot({ path: join(OUT, name + '.png'), ...(clip ? { clip } : {}) }); console.log('saved ' + name); return name + '.png' }
export const press = (touch, loc) => (touch ? loc.tap() : loc.click())
export const csId = (p, cs) => p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)
export const toast = p => p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? (t.innerText || t.textContent || '').replace(/\s+/g, ' ').trim() : '' })
export const toastMark = p => p.evaluate(() => (window.__toasts || []).length)
export const toastsSince = async (p, m) => (await p.evaluate(m => (window.__toasts || []).slice(m).map(t => t.text), m)).filter((t, i, a) => i === 0 || t !== a[i - 1]).join(' || ')

/* results file */
const RES = 'docs/handpass/parts/or-L.json'
export function saveRes(id, obj) {
  let all = {}
  try { all = JSON.parse(readFileSync(RES, 'utf8')) } catch {}
  all[id] = { ...(all[id] || {}), ...obj }
  writeFileSync(RES, JSON.stringify(all, null, 1))
}

/* ---------- the Inputs page ---------- */
async function pick(p, iso, touch) {
  for (let i = 0; i < 36 && !(await p.locator(`#inpEdCal [data-cal="${iso}"]`).count()); i++) {
    const [m, y] = (await p.locator('#inpEdCal .rc-mon').textContent()).split(' ')
    const at = `${y}-${String(MONTHS.findIndex(x => x.startsWith(m.toLowerCase())) + 1).padStart(2, '0')}`
    await press(touch, p.locator(`#inpEdCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`))
  }
  await press(touch, p.locator(`#inpEdCal [data-cal="${iso}"]`))
}
/* spec: {type, person (cs), people:[cs…], from, to (iso), title, rmk, timed:[s,e], oil:'yes'|'no'|'close'} */
export async function fileInput(p, spec, touch = false) {
  await p.evaluate(() => window.go('inputs'))
  const had = await p.evaluate(() => window.INPUTS.map(r => r.iid))
  if (await p.locator(WIN).count()) { await press(touch, p.locator('#inpEditCancel')); await p.waitForTimeout(150) }
  if (await p.locator('#inListBtn[aria-pressed="false"]').count()) { await press(touch, p.locator('#inListBtn')); await p.waitForTimeout(200) }
  await press(touch, p.locator('#inNew')); await p.locator(WIN).waitFor()
  if (spec.type) await p.selectOption('#inpEditType', spec.type)
  if (spec.person) await p.selectOption('#inpEditPerson', await csId(p, spec.person))
  if (spec.people) {
    await press(touch, p.locator(`${WIN} [data-testid="pp-several"]`))
    const want = []
    for (const cs of spec.people) { const pid = await csId(p, cs); want.push(pid); const b = p.locator(`${WIN} [data-pp="${pid}"]`); if ((await b.getAttribute('aria-pressed')) !== 'true') await press(touch, b) }
    const pressed = await p.evaluate(sel => [...document.querySelectorAll(`${sel} [data-pp][aria-pressed="true"]`)].map(b => b.getAttribute('data-pp')), WIN)
    for (const pid of pressed) if (!want.includes(pid)) await press(touch, p.locator(`${WIN} [data-pp="${pid}"]`))
  }
  if (spec.from) await pick(p, spec.from, touch)
  if (spec.to) await pick(p, spec.to, touch)
  if (spec.timed) {
    if (await p.locator('#inpEditAllday').count() && await p.locator('#inpEditAllday').isChecked()) await press(touch, p.locator('#inpEditAllday'))
    await p.fill('#inpEditStart', spec.timed[0]); await p.fill('#inpEditEnd', spec.timed[1])
  }
  if (spec.title != null) await p.fill('#inpEditOwnTitle', spec.title)
  if (spec.rmk != null) await p.fill('#inpEditRmk', spec.rmk)
  await press(touch, p.locator('#inpEditSave'))
  await p.waitForTimeout(350)
  for (let k = 0; k < 3; k++) {
    const sheet = p.locator('[data-testid="oilconf"]')
    if (await sheet.count()) {
      const how = spec.oil || 'no'
      if (how === 'close') {
        const x = p.locator('#oilConfirmClose, [data-testid="oil-close"]').first()
        if (await x.count()) await press(touch, x); else await p.keyboard.press('Escape')
      } else {
        const one = sheet.locator(`[data-testid="oil-${how}"]`), many = sheet.locator(`[data-testid="oil-${how === 'yes' ? 'all' : 'none'}"]`)
        await press(touch, (await one.count()) ? one : many)
        await press(touch, sheet.locator('[data-testid="oilconf-save"]'))
      }
    } else if (await p.locator('[data-testid="docconf"]').count()) await press(touch, p.locator('[data-testid="docconf-nodoc"]'))
    else break
    await p.waitForTimeout(300)
  }
  await p.locator(WIN).waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
  await p.waitForTimeout(300)
  return p.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => ({ iid: r.iid, cs: window.PEOPLE[r.person]?.cs, type: r.type, title: r.title, date: r.date, s: r.s, e: r.e, grp: r.grp || null, people: (r.people || []).map(e => window.PEOPLE[e.p]?.cs || e.p), by: r.by })), had)
}

/* ---------- navigation ---------- */
export async function toWeek(p) {
  await p.evaluate(() => { if (window.closeScheduler && document.querySelector('#schedBoard')) window.closeScheduler() }).catch(() => {})
  await p.waitForTimeout(200)
  await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(600)
}
export async function toBoard(p, di = DI) {
  await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(300)
  await p.evaluate(d => window.openScheduler(d), di); await p.waitForTimeout(900)
}
export async function toView(p) {
  await p.evaluate(() => { if (window.closeScheduler && document.querySelector('#schedBoard')) window.closeScheduler() }).catch(() => {})
  await p.waitForTimeout(200)
  await p.locator('a[data-page="viewsched"]').first().click(); await p.waitForTimeout(800)
}

/* ---------- publish ---------- */
export async function signAndPublish(p, di = DI) {
  await toBoard(p, di)
  const sels = p.locator(`#schedBoard [data-signday="${di}"]`)
  const n = await sels.count()
  for (let i = 0; i < n; i++) {
    const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && v !== '—'))
    if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)])
    await p.waitForTimeout(150)
  }
  await p.waitForTimeout(300)
  let btn = p.locator(`#schedBoard [data-beak="${di}"]`).first()
  if (!(await btn.count())) btn = p.locator(`#schedBoard [data-alpub="${di}"]`).first()
  if (!(await btn.count())) return { ok: false, why: 'no publish button', selects: n }
  const label = (await btn.innerText()).trim()
  if (await btn.isDisabled()) return { ok: false, why: 'disabled: ' + label, selects: n }
  await btn.evaluate(b => b.click()); await p.waitForTimeout(800)
  const ok = p.getByRole('button', { name: /^(Publish|Yes|Confirm|Issue)/ }).first()
  if (await ok.count() && await ok.isVisible()) { await ok.evaluate(b => b.click()); await p.waitForTimeout(900) }
  const ver = await p.evaluate(() => (document.querySelector('#schedBoard .verchip') || {}).innerText || '')
  await p.evaluate(() => window.closeScheduler && window.closeScheduler()); await p.waitForTimeout(400)
  return { ok: true, label, version: ver, selects: n }
}
export async function dayStat(p, di = DI) {
  await toWeek(p)
  return p.evaluate(di => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; const s = d?.querySelector('.dstat'); return s ? s.innerText.replace(/\s+/g, ' ').trim() : 'NO .dstat' }, di)
}
export async function openChanges(p, di = DI) {
  await toWeek(p)
  const bb = p.locator('#eWeek .day:not(.peek)').nth(di).locator('.dstat .dpend').first()
  if (!(await bb.count())) return false
  await bb.scrollIntoViewIfNeeded(); await bb.click(); await p.waitForTimeout(800)
  return !!(await p.locator('.chgwin:not([hidden])').count())
}
export async function changesRead(p) {
  const out = {}
  out.title = await p.evaluate(() => { const w = document.querySelector('.chgwin'); return w ? w.querySelector('.win-ttl')?.innerText.replace(/\s+/g, ' ').trim() : 'NO CHANGES WINDOW' })
  const tab = p.locator('.chgwin .win-tab', { hasText: /To go out/ })
  out.tabLabel = (await tab.count()) ? (await tab.first().innerText()).replace(/\s+/g, ' ') : 'no To-go-out tab'
  if (await tab.count()) { await tab.first().click(); await p.waitForTimeout(450) }
  out.head = await p.evaluate(() => { const h = document.querySelector('.chgwin .cw-out .pl-head'); return h ? h.innerText.replace(/\s+/g, ' ').trim() : 'no head' })
  out.lines = await p.evaluate(() => [...document.querySelectorAll('.chgwin .cw-out .pl-item')].map(i => i.innerText.replace(/\s+/g, ' ').trim()))
  return out
}
export async function closeChanges(p) { await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300) }

/* ---------- undo / redo ---------- */
export async function undoRedo(p, which) {
  const board = await p.evaluate(() => window.SBDAY != null && !!document.querySelector('#schedBoard'))
  const ids = board ? [which === 'undo' ? '#sbUndo' : '#sbRedo', which === 'undo' ? '#undoBtn' : '#redoBtn'] : [which === 'undo' ? '#undoBtn' : '#redoBtn']
  for (const id of ids) {
    const b = p.locator(id + ':visible').first()
    if (await b.count()) {
      if (await b.isDisabled()) return { used: id + ' (disabled)', ok: false }
      await b.click(); await p.waitForTimeout(700)
      return { used: id, ok: true, toast: await toast(p) }
    }
  }
  return { used: 'none visible', ok: false }
}

/* ---------- mouse ---------- */
export async function mouseDrag(p, from, to, steps = 12) {
  await p.mouse.move(from.x, from.y); await p.mouse.down()
  await p.waitForTimeout(120)
  await p.mouse.move((from.x + to.x) / 2, (from.y + to.y) / 2, { steps })
  await p.mouse.move(to.x, to.y, { steps })
  await p.waitForTimeout(250)
  await p.mouse.up(); await p.waitForTimeout(700)
}
export const centre = b => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 })
export async function boxOf(loc) { await loc.scrollIntoViewIfNeeded(); return loc.boundingBox() }
export async function findEmpty(p) {
  return p.evaluate(() => {
    const bad = '.day, #eRoster, .topbar, .chgwin, #schedBoard, button, a, input, select, textarea, [data-fill], [data-slot], .rpuck, .puck, nav, header'
    const W = innerWidth, H = innerHeight
    for (let y = 120; y < H - 60; y += 20) for (let x = 6; x < W - 6; x += 6) {
      const el = document.elementFromPoint(x, y)
      if (el && !el.closest(bad)) return { x, y }
    }
    return null
  })
}
export async function rosterPuck(p, cs, where = 'week') {
  const id = await csId(p, cs)
  return p.locator(`${where === 'board' ? '#sbRoster' : '#eRoster'} .rpuck[data-person="${id}"]:visible`).first()
}

/* ---------- reading ---------- */
export const inputsOf = (p, title) => p.evaluate(title => {
  const f = m => (m == null ? '' : String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'))
  return window.INPUTS.filter(r => !title || (r.title || '').toLowerCase() === title.toLowerCase()).map(r => ({ iid: r.iid, type: r.type, title: r.title || '', date: r.date, to: r.to || null, t: `${f(r.s)}-${f(r.e)}`, person: window.PEOPLE[r.person]?.cs, people: (r.people || []).map(e => (window.PEOPLE[e.p]?.cs || e.p) + (e.oil != null ? `(oil=${e.oil})` : '')), by: r.by, oil: r.oil ?? null, cx: r.cx || null, cxr: r.cxr || null, rmk: r.remarks || r.rmk || '' }))
}, title || '')
/* the Ground Programme row(s) on the week of one day for rows whose name matches */
export const weekRows = (p, di = DI, nameRe = null) => p.evaluate(([di, re]) => {
  const rx = re ? new RegExp(re, 'i') : null
  const day = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]
  if (!day) return 'NO DAY'
  return [...day.querySelectorAll('.sec-grnd .pl-row')].map(r => ({
    name: (r.querySelector('.nm .ntx')?.textContent || '').trim(),
    times: [...r.querySelectorAll('.t')].map(e => e.textContent.trim()).filter(Boolean),
    pucks: [...r.querySelectorAll('.ppl .seat')].map(s => (s.querySelector('.puck .nm')?.textContent || s.textContent || '').trim()),
    cx: /CX/.test(r.className) || !!r.querySelector('.cx'),
  })).filter(x => !rx || rx.test(x.name))
}, [di, nameRe])
export const boardRows = (p, nameRe = null) => p.evaluate(re => {
  const rx = re ? new RegExp(re, 'i') : null
  const b = document.querySelector('#schedBoard'); if (!b) return 'NO BOARD'
  return [...b.querySelectorAll('.sb-panel.grnd .sb-arow')].filter(r => r.offsetParent).map(r => ({
    name: (r.querySelector('textarea.ain, input.ain')?.value || '').trim(),
    pucks: [...r.querySelectorAll('.ppl .seat')].map(s => (s.querySelector('.puck .nm')?.textContent || '').trim()),
  })).filter(x => !rx || rx.test(x.name))
}, nameRe)
/* the Unavailable list on the week: rows of day di */
export const unavailRows = (p, root = '#eWeek', di = DI) => p.evaluate(([root, di]) => {
  const day = [...document.querySelectorAll(`${root} .day:not(.peek)`)][di]; if (!day) return 'NO DAY'
  const sec = day.querySelector('.sec-unav, .sec-inp, .sec-una') || null
  const out = []
  for (const r of day.querySelectorAll('.sec-inp .pl-row, .sec-unav .pl-row, .sec-una .pl-row')) out.push(r.innerText.replace(/\s+/g, ' ').trim())
  return out
}, [root, di])

/* ---------- the Inputs pages: read ---------- */
export async function toMonth(p, iso = ISO) {
  await p.evaluate(() => window.go('inputs'))
  await p.locator('#inpCal, #inCalBtn').first().waitFor()
  if ((await p.locator('#inCalBtn').getAttribute('aria-pressed')) !== 'true') { await p.locator('#inCalBtn').click(); await p.waitForTimeout(300) }
  await p.locator('#inpCal').waitFor()
  const want = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1)
  const at = async () => { const [m, y] = (await p.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MONTHS.findIndex(x => x.startsWith(m)) }
  let d = want - await at()
  for (; d > 0; d--) await p.locator('#icNext').click()
  for (; d < 0; d++) await p.locator('#icPrev').click()
  await p.waitForSelector(`[data-icday="${iso}"]`)
}
export async function barText(p, iso) { return p.evaluate(iso => { const c = document.querySelector(`[data-icday="${iso}"]`); return c ? c.innerText.replace(/\s+/g, ' ').trim() : 'NO CELL' }, iso) }
export async function openDay(p, iso) {
  await p.locator(`[data-icday="${iso}"]`).focus()
  await p.keyboard.press('Enter')
  await p.waitForSelector('[data-testid="win-inputsday"]')
  await p.waitForTimeout(350)
}
export const dayCardText = p => p.evaluate(() => { const w = document.querySelector('[data-testid="win-inputsday"]'); return w ? [...w.querySelectorAll('.icard')].map(c => c.innerText.replace(/\s+/g, ' ').trim()) : 'NO DAY WINDOW' })
export async function closeDay(p) { const x = p.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) { await x.click(); await p.waitForTimeout(250) } }
export async function listText(p) {
  await p.evaluate(() => window.go('inputs'))
  await p.waitForTimeout(300)
  if (await p.locator('#inListBtn[aria-pressed="false"]').count()) { await p.locator('#inListBtn').click(); await p.waitForTimeout(400) }
  return p.evaluate(() => { const w = document.querySelector('.inputs-workspace'); const rows = [...w.querySelectorAll('tr, .ilist-row, .ilrow, .icard')].filter(e => e.offsetParent); return rows.map(r => r.innerText.replace(/\s+/g, ' ').trim()) })
}

export const pickDate = pick
/* open an input's own window from the Inputs calendar day card */
export async function openInputWindow(p, iid, iso) {
  await toMonth(p, iso); await openDay(p, iso)
  await p.locator(`[data-testid="win-inputsday"] .icard[data-popiid="${iid}"]`).first().click()
  await p.waitForSelector('#inpEditPop #inpEditStart, #inpEditPop #inpEditSave', { timeout: 5000 })
  await p.waitForTimeout(300)
}
export async function saveWindow(p) {
  await p.locator('#inpEditSave').click(); await p.waitForTimeout(500)
  for (let k = 0; k < 3; k++) {
    const sheet = p.locator('[data-testid="oilconf"]')
    if (await sheet.count()) { const x = p.locator('#oilConfirmClose, [data-testid="oil-close"]').first(); if (await x.count()) await x.click(); else await p.keyboard.press('Escape'); await p.waitForTimeout(300) } else break
  }
  await p.waitForTimeout(300)
}
/* Admin -> Users: delete a person (two presses on Delete: arm, then do) */
export async function deleteUser(p, cs) {
  const id = await csId(p, cs)
  await p.evaluate(() => window.go('admin')); await p.waitForTimeout(700)
  const tab = p.locator('[data-admtab="users"], button:has-text("Users"), a:has-text("Users")').first()
  if (await tab.count() && await tab.isVisible().catch(() => false)) { await tab.click(); await p.waitForTimeout(500) }
  const row = p.locator(`#accList .acc-row[data-person="${id}"] .acc-main`).first()
  await row.scrollIntoViewIfNeeded(); await row.click(); await p.waitForTimeout(400)
  await p.locator('#accEdDel').click(); await p.waitForTimeout(300)
  const note = await p.locator('#accEdDelNote').innerText().catch(() => '')
  await p.locator('#accEdDel').click(); await p.waitForTimeout(800)
  return { note: note.replace(/\s+/g, ' '), toast: await toast(p) }
}
/* the look at an issued version, then press Load */
export async function lookAt(p, which = 'Original', di = DI) {
  await toWeek(p)
  await p.locator('[data-planmenu="' + di + '"]').first().scrollIntoViewIfNeeded()
  await p.locator('[data-planmenu="' + di + '"]').first().click(); await p.waitForTimeout(500)
  await p.locator('.wavemenu button', { hasText: new RegExp('^' + which) }).first().click(); await p.waitForTimeout(900)
}
export async function pressLoad(p) {
  const b = p.locator('.dprev-restore').first()
  const first = (await b.innerText()).replace(/\s+/g, ' ')
  await b.click(); await p.waitForTimeout(700)
  const after = await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null && /discard|load|already|nothing|keep/i.test(b.textContent)).map(b => b.className + ': ' + b.textContent.trim().slice(0, 80)))
  return { first, after, toast: await toast(p) }
}

/* ---------- OIL Earn on the board ---------- */
export async function oilOn(p, di) {
  if (!(await p.locator('#schedBoard').count())) await toBoard(p, di)
  const isOn = await p.evaluate(() => !!(window.OILDAY != null || document.querySelector('#schedBoard [data-oilitem]')))
  if (!isOn) { await p.locator('#sbOil:visible').first().click(); await p.waitForTimeout(800) }
}
export const oilRead = (p, titleRe = null) => p.evaluate(re => {
  const b = document.querySelector('#schedBoard'); if (!b) return 'NO BOARD'
  const rx = re ? new RegExp(re, 'i') : null
  const bar = (b.querySelector('.sb-daybar, .sb-top')?.innerText || '').replace(/\s+/g, ' ').slice(0, 300)
  const chips = [...b.querySelectorAll('[class*=oil]')].filter(e => e.offsetParent && !e.querySelector('[class*=oil]') && !e.classList.contains('puck') && (e.innerText || '').trim()).map(e => e.className.toString().slice(0, 30) + ': ' + e.innerText.replace(/\s+/g, ' ').trim().slice(0, 140)).slice(0, 25)
  const rows = [...b.querySelectorAll('.sb-panel.grnd .sb-arow')].filter(r => r.offsetParent).map(r => ({
    name: (r.querySelector('textarea.ain, input.ain')?.value || '').trim(),
    text: r.innerText.replace(/\s+/g, ' ').trim().slice(0, 200),
    pucks: [...r.querySelectorAll('.puck')].map(pk => (pk.querySelector('.nm')?.textContent || '').trim() + ' {' + (pk.className.match(/oilbar[-\w]*/g) || []).join(',') + '}' + (pk.dataset.oilp ? ' oilp=' + pk.dataset.oilp : '')),
  })).filter(r => !rx || rx.test(r.name))
  return { bar, rows, chips }
}, titleRe)
export async function closeBoardMode(p) { await p.evaluate(() => window.closeScheduler && window.closeScheduler()).catch(() => {}); await p.waitForTimeout(300) }

/* ---------- the bell ---------- */
export async function bellSel(p) { return (await p.locator('#sbBell').isVisible().catch(() => false)) ? '#sbBell' : '#notifyBell' }
export async function bellState(p) { const sel = await bellSel(p); return p.evaluate(sel => { const b = document.querySelector(sel); return b ? { id: b.id, lit: b.classList.contains('on'), open: b.getAttribute('aria-expanded') } : null }, sel) }
export async function bellPress(p) { await p.locator(await bellSel(p)).click(); await p.waitForTimeout(450) }
export const bellList = p => p.evaluate(() => {
  const l = document.querySelector('.bell-list'); if (!l) return null
  return { empty: (l.querySelector('.bl-empty') || {}).textContent || null, markAll: !!l.querySelector('[data-testid="bell-markall"]'), lines: [...l.querySelectorAll('.bl-line')].map(e => ({ unread: e.classList.contains('unread'), name: e.querySelector('.bl-name')?.textContent, day: e.querySelector('.bl-day')?.textContent, what: e.querySelector('.bl-what')?.textContent, ago: e.querySelector('.bl-ago')?.textContent })) }
})
/* become somebody in place */
export async function become(p, cs, role) {
  const id = await csId(p, cs)
  await p.evaluate(([id, role]) => { window.raptorMe(id); window.raptorRole(role) }, [id, role]); await p.waitForTimeout(500)
}
export async function bellRead(p, tag, { keepOpen = false } = {}) {
  const o = { state: await bellState(p) }
  await bellPress(p)
  o.toastAfterTap = await toast(p)
  o.list = await bellList(p)
  o.stateAfterTap = await bellState(p)
  if (tag) await p.screenshot({ path: `${OUT}/${tag}.png` })
  if (!keepOpen && o.list) await bellPress(p)
  return o
}
/* drag a roster man onto the row's pucks box of an input row on the week (re-measures and checks the puck under the mouse is the man) */
export async function dragOntoRow(p, cs, rowText, di = DI) {
  await toWeek(p)
  const id = await csId(p, cs)
  const row = p.locator('#eWeek .day:not(.peek)').nth(di).locator('.sec-grnd .pl-row', { hasText: rowText })
  const dest = row.locator('.ppl').first()
  await dest.scrollIntoViewIfNeeded()
  const src = await rosterPuck(p, cs, 'week')
  await src.scrollIntoViewIfNeeded().catch(() => {})
  await p.waitForTimeout(250)
  const sb = await src.boundingBox(), db = await dest.boundingBox()
  const under = await p.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('.rpuck')?.getAttribute('data-person'), [sb.x + sb.width / 2, sb.y + sb.height / 2])
  if (under !== id) return 'ABORT: the puck under the mouse is ' + under + ', not ' + id
  const m = await toastMark(p)
  await mouseDrag(p, centre(sb), { x: db.x + db.width - 10, y: db.y + db.height / 2 })
  return toastsSince(p, m)
}

/* sign out / in within one page life */
export async function signOut(p) {
  const b = p.locator('#logout:visible').first()
  if (await b.count()) await b.click(); else await p.evaluate(() => document.getElementById('logout').click())
  await p.waitForSelector('#loginForm', { timeout: 6000 })
}
export async function signIn(p, u, pw) {
  await p.fill('#luser', u); await p.fill('#lpass', pw)
  await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' })
  await p.waitForTimeout(500)
}
/* list the dialogs/sheets standing right now (for exploring) */
export const sheets = p => p.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => e.offsetParent && /conf|sheet|win-|ask|dlg|doc/.test(e.dataset.testid)).map(e => e.dataset.testid))
