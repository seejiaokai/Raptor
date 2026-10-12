// Walker RX1 (OIL ask/notify RE-WALK, 13 Oct 26) - my own helpers. Real controls only; copied from on-A-lib / on-B-lib / oilnotify-look.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, appendFileSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
export const URL = 'http://localhost:4231/'
export const OUT = 'docs/img/handpass/2026-10-13-oil-ask-notify/RX1'
mkdirSync(OUT, { recursive: true })
mkdirSync('docs/handpass/parts', { recursive: true })
export const SIZES = {
  desk: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  p844: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
}
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const MON = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export const SAT = '2026-07-18', SAT_DI = 5, FRI = '2026-07-17', FRI_DI = 4

export const note = (obj) => appendFileSync('docs/handpass/parts/on-RX1.results.jsonl', JSON.stringify(obj) + '\n')

export async function world({ fresh = true, who = 'ad', pass = 'a', size = 'desk', tag = 'w' } = {}) {
  const sz = SIZES[size]
  const touch = !!sz.isMobile
  const ctx = await browser.newContext(sz)
  const page = await ctx.newPage()
  await page.clock.install({ time: new Date('2026-06-22T09:00:00') })
  const errors = []
  page.on('pageerror', e => errors.push('pageerror ' + String(e).slice(0, 250)))
  page.on('console', m => { if (m.type() === 'error') errors.push('console ' + m.text().slice(0, 250)) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`) })
  await page.addInitScript(() => {
    window.__toasts = []
    const go = () => new MutationObserver(() => { const t = document.getElementById('toastEl'); if (t && t.style.opacity === '1') { const x = t.textContent; if (window.__toasts[window.__toasts.length - 1] !== x) window.__toasts.push(x) } }).observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true })
    if (document.documentElement) go(); else document.addEventListener('DOMContentLoaded', go)
  })
  await page.goto(URL + (fresh ? '?fresh=1' : ''))
  await page.waitForSelector('#loginForm, #vWeek .day', { state: 'attached', timeout: 15000 })
  if (await page.locator('#loginForm').count() && await page.locator('#luser').isVisible().catch(() => false)) {
    await page.fill('#luser', who); await page.fill('#lpass', pass)
    await (touch ? page.locator('#loginForm button[type=submit]').tap() : page.click('#loginForm button[type=submit]'))
  }
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  const W = { ctx, page, errors, tag, touch, size, VW: sz.viewport.width, VH: sz.viewport.height }
  W.tid = t => page.locator(`[data-testid="${t}"]`)
  W.press = loc => (touch ? loc.tap() : loc.click())
  W.shot = async (name, clip) => { await page.screenshot({ path: join(OUT, `${name}.png`), ...(clip ? { clip } : {}) }); console.log('PIC ' + name + '.png'); return name + '.png' }
  W.hush = () => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' })
  W.unhush = () => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = '' })
  return W
}

export async function toMonth(W) {
  const { page, press } = W
  await page.evaluate(() => window.go('inputs'))
  await page.locator('#inpCal, #inCalBtn').first().waitFor()
  if (await page.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await press(page.locator('#inCalBtn'))
  await page.locator('#inpCal').waitFor()
  const at = async () => { const [m, y] = (await page.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MON.findIndex(x => x.startsWith(m)) }
  let d = 2026 * 12 + 6 - await at()
  for (; d > 0; d--) await press(page.locator('#icNext'))
  for (; d < 0; d++) await press(page.locator('#icPrev'))
  await page.waitForSelector(`[data-icday="${SAT}"]`)
}
export async function openDay(W, iso) {
  const { page } = W
  if (await page.locator('[data-testid="win-inputsday"]').count()) return
  await page.locator(`[data-icday="${iso}"]`).focus()
  await page.keyboard.press('Enter')
  await page.waitForSelector('[data-testid="win-inputsday"]')
  await page.waitForTimeout(350)
}
export async function closeDay(W) {
  const x = W.page.locator('[data-testid="win-inputsday-x"]')
  if (await x.count()) { await W.press(x); await W.page.waitForTimeout(250) }
}

/* file an input through the Inputs calendar's day window. spec.oil 'yes'|'no'|'skip' (skip: leave the question's save alone - not used). */
export async function fileIt(W, iso, spec) {
  const { page, press } = W
  const had = await page.evaluate(() => window.INPUTS.map(r => r.iid))
  await toMonth(W); await openDay(W, iso)
  await press(page.locator('#icPopAdd'))
  await page.waitForSelector('#inpEditPop #inpEditType')
  await page.selectOption('#inpEditPop #inpEditType', spec.type)
  if (spec.people.length > 1) {
    await press(page.locator('#inpEditPop [data-testid="pp-several"]'))
    for (const p of spec.people) { const b = page.locator(`#inpEditPop [data-pp="${p}"]`); if (await b.getAttribute('aria-pressed') !== 'true') await press(b) }
    const lit = await page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
    for (const id of lit) if (!spec.people.includes(id)) await press(page.locator(`#inpEditPop [data-pp="${id}"]`))
  } else if (await page.locator('#inpEditPop #inpEditPerson').count()) await page.selectOption('#inpEditPop #inpEditPerson', spec.people[0])
  const ad = page.locator('#inpEditPop #inpEditAllday')
  if (spec.from) {
    if (await ad.count() && await ad.isChecked()) await press(ad)
    await page.locator('#inpEditPop #inpEditStart').fill(spec.from)
    await page.locator('#inpEditPop #inpEditEnd').fill(spec.to)
  } else if (await ad.count() && !(await ad.isChecked())) await press(ad)
  if (spec.title) await page.locator('#inpEditPop #inpEditOwnTitle').fill(spec.title)
  await press(page.locator('#inpEditSave'))
  await page.waitForTimeout(450)
  W.lastAsked = 0
  for (let k = 0; k < 4; k++) {
    const sheet = page.locator('[data-testid="oilconf"]')
    if (await sheet.count()) {
      W.lastAsked++
      const pick = (spec.oil === 'no') ? sheet.locator('[data-testid="oil-no"]') : null
      if (pick) await press(pick)
      else {
        const one = sheet.locator('[data-testid="oil-yes"]'), many = sheet.locator('[data-testid="oil-all"]')
        await press((await one.count()) ? one : many)
      }
      await press(sheet.locator('[data-testid="oilconf-save"]'))
    } else if (await page.locator('[data-testid="docconf"]').count()) await press(page.locator('[data-testid="docconf-nodoc"]'))
    else break
    await page.waitForTimeout(350)
  }
  await page.locator('#inpEditPop').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => console.log('STILL OPEN: the input window'))
  await page.waitForTimeout(300)
  const made = await page.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => r.iid), had)
  await closeDay(W)
  return made[0]
}

export const csOf = (page, id) => page.evaluate(id => (window.PEOPLE[id] && window.PEOPLE[id].cs) || id, id)
export const idOf = (page, cs) => page.evaluate(cs => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === cs), cs)
export const groundNow = (page, di = SAT_DI) => page.evaluate(di => (window.DAYS[di].ground || []).map(r => {
  const cs = x => (window.PEOPLE[x] && window.PEOPLE[x].cs) || x || ''
  return `${r.prog || '(blank)'}: ${cs(r.who)}${(r.more || []).map(m => ' + ' + cs(m)).join('')}`
}), di)
export const recOf = (page, iid) => page.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return r ? JSON.stringify({ people: (r.people || []).map(p => (window.PEOPLE[p.p] || {}).cs || p.p), person: window.PEOPLE[r.person] && window.PEOPLE[r.person].cs, oil: r.oil || null }) : 'GONE' }, iid)
export const oilOf = (page, iid) => page.evaluate(i => JSON.stringify((window.INPUTS.find(r => r.iid === i) || {}).oil || null), iid)

export async function goBoard(W, di = SAT_DI) {
  const { page } = W
  await page.evaluate(() => window.go('editsched'))
  await page.waitForTimeout(500)
  await page.locator(`#eWeek [data-sbday="${di}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
  await page.waitForSelector('#sbBoard .sb-sec', { state: 'attached' })
  await page.waitForTimeout(400)
}
export async function typeRow(W, di, idx, prog, str, end) {
  const { page } = W
  await page.locator(`#sbBoard [data-gradd="${di}"]`).evaluate(e => { e.scrollIntoView({ block: 'center' }); e.click() })
  await page.waitForTimeout(300)
  const type = async (fld, v) => { const b = page.locator(`#sbBoard [data-bfld="${fld}"]`); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.fill(v); await b.blur(); await page.waitForTimeout(200) }
  await type(`gr:${di}.${idx}.prog`, prog)
  await type(`gr:${di}.${idx}.str`, str)
  await type(`gr:${di}.${idx}.end`, end)
}
export async function seed(page, di, idx, id) {
  await page.evaluate(([di, idx, id]) => { window.fillSlot(`g:${di}.${idx}.+`, id); window.afterSchedMutate() }, [di, idx, id])
  await page.waitForTimeout(400)
}
export async function closeBoard(W) {
  const b = W.page.locator('#schedBoard').getByRole('button', { name: /Done/ }).first()
  if (await b.count() && await b.isVisible().catch(() => false)) { await b.click(); await W.page.waitForTimeout(600) }
}

/* a real mouse drag */
export async function drag(page, fromLoc, toLoc, { steps = 14, wait = 150, settle = 600 } = {}) {
  const fb = await fromLoc.boundingBox(), tb = await toLoc.boundingBox()
  if (!fb || !tb) throw new Error('drag: no box ' + !!fb + ' ' + !!tb)
  const fx = fb.x + fb.width / 2, fy = fb.y + fb.height / 2, tx = tb.x + tb.width / 2, ty = tb.y + tb.height / 2
  await page.mouse.move(fx, fy); await page.mouse.down()
  await page.mouse.move(fx + 6, fy + 6, { steps: 3 })
  await page.mouse.move(tx, ty, { steps }); await page.waitForTimeout(wait)
  await page.mouse.move(tx + 1, ty + 1); await page.waitForTimeout(wait)
  await page.mouse.up(); await page.waitForTimeout(settle)
}

export const toast = p => p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? (t.innerText || t.textContent || '').trim() : '' })
export const toastsAll = p => p.evaluate(() => window.__toasts || [])
export const undoState = p => p.evaluate(() => { const out = {}; for (const id of ['undoBtn', 'redoBtn', 'sbUndo', 'sbRedo']) { const b = document.getElementById(id); if (b) out[id] = (b.disabled ? 'off' : 'on') + '|' + (b.title || b.getAttribute('aria-label') || ''); } return JSON.stringify(out) })
export const undoPress = async (W, which = 'undo') => {
  const { page } = W
  const ids = [which === 'undo' ? '#sbUndo' : '#sbRedo', which === 'undo' ? '#undoBtn' : '#redoBtn']
  for (const id of ids) {
    const b = page.locator(id).first()
    if ((await b.count()) && (await b.isVisible())) { if (await b.isDisabled()) return id + ' (disabled)'; await b.click(); await page.waitForTimeout(600); return id }
  }
  return 'none'
}
/* measure an element: box inside the screen and the thing under its centre is itself */
export const measure = (page, sel) => page.evaluate(sel => {
  const el = [...document.querySelectorAll(sel)].filter(e => e.getClientRects().length).pop()
  if (!el) return null
  const r = el.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), right: Math.round(r.right), bottom: Math.round(r.bottom), inside: r.left >= 0 && r.top >= 0 && r.right <= innerWidth + .5 && r.bottom <= innerHeight + .5, onTop: hit === el || el.contains(hit), vw: innerWidth, vh: innerHeight }
}, sel)
export const rowSel = i => `#sbBoard [data-move="mv:g.${SAT_DI}.${i}"]`
export const puckSel = i => `#sbBoard [data-slot="g:${SAT_DI}.${i}"] .puck`
export const wkSel = i => `#eWeek .day:not(.peek) [data-slot="g:${SAT_DI}.${i}"] .puck`
export const frameBoard = async (page) => {
  await page.locator(rowSel(0)).evaluate((e, top) => {
    const sec = e.closest('.sb-sec'); sec.scrollIntoView({ block: 'start' })
    let sc = sec.parentElement; while (sc && sc.scrollHeight <= sc.clientHeight + 1) sc = sc.parentElement
    if (sc) sc.scrollTop -= top
  }, 260)
  await page.waitForTimeout(250)
}
export const frameGrnd = (page, di = SAT_DI) => page.locator('#eWeek .day:not(.peek) .sec-grnd').nth(di).evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
export const flashing = (page, sels) => page.evaluate(sels => sels.map(q => { const p = document.querySelector(q); const host = p && (p.closest('.seat') || p); return !!host && host.classList.contains('lift-land') }), sels)

/* THE USUAL SATURDAY: Range brief (Training 09:00-12:00, Ranger, answered Yes) + plain row "Hangar open day" with Tally (SETUP shortcut allowed).
   opts.hangar = [start,end]; opts.who = id on the plain row */
export async function usualSat(W, { goToBoard = true, hangar = ['13:00', '15:00'], who = 'nick' } = {}) {
  const { page } = W
  const iid = await fileIt(W, SAT, { type: 'Training', people: ['bane'], from: '09:00', to: '12:00', title: 'Range brief' })
  await goBoard(W)
  await typeRow(W, SAT_DI, 1, 'Hangar open day', hangar[0], hangar[1])
  await seed(page, SAT_DI, 1, who)
  await page.evaluate(() => document.querySelectorAll('#sbBoard .sb-fresh').forEach(e => e.classList.remove('sb-fresh')))
  if (!goToBoard) { await closeBoard(W); await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(500) }
  return iid
}
/* a PLAIN programme row typed on the board's own boxes; SETUP puck via fillSlot */
export async function plainRow(W, di, idx, prog, str, end, whoIds) {
  const { page } = W
  await goBoard(W, di)
  await typeRow(W, di, idx, prog, str, end)
  for (const w of whoIds) await seed(page, di, idx, w)
  await page.evaluate(() => document.querySelectorAll('#sbBoard .sb-fresh').forEach(e => e.classList.remove('sb-fresh')))
}

/* make a public holiday through Inputs gear -> Calendar -> Holidays -> + Add. */
export async function makeHoliday(W, iso, name, { later = true } = {}) {
  const { page, press, tid } = W
  await page.evaluate(() => window.go('inputs'))
  await page.locator('#inGear').waitFor()
  await press(page.locator('#inGear')); await page.waitForTimeout(400)
  await press(tid('iset-days')); await page.waitForTimeout(600)
  const tab = tid('days-tab-holidays'); if (await tab.count()) { await press(tab); await page.waitForTimeout(300) }
  await press(tid('hol-add')); await page.waitForTimeout(500)
  await press(tid('hol-kind-ph'))
  await tid('hol-name').fill(name)
  for (let i = 0; i < 24 && !(await tid(`holcal-day-${iso}`).count()); i++) await press(tid('holcal-next-month'))
  await press(tid(`holcal-day-${iso}`)); await page.waitForTimeout(200)
  await press(tid('hol-save')); await page.waitForTimeout(800)
  await page.locator('[data-testid="win-inputsset-x"]').evaluate(e => e.click()).catch(() => {}); await page.waitForTimeout(250)
  const opened = (await tid('win-oilday').count()) === 1
  let cards = null
  if (opened) cards = await tid('win-oilday').locator('.icard').count()
  if (opened && later) { await press(tid('odl-later')); await page.waitForTimeout(300) }
  await page.locator('[data-testid="win-days"] .win-x').evaluate(e => e.click()).catch(() => {}); await page.waitForTimeout(200)
  return { opened, cards }
}

/* Warden gets an admin sign-in (Admin -> Users) - at desktop width */
export async function giveWarden(W) {
  const { page } = W
  const vp = page.viewportSize()
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.evaluate(() => window.go('admin'))
  const row = page.locator('.acc-row[data-person="nact"]').first()
  await row.locator('.acc-tap').evaluate(e => { e.scrollIntoView({ block: 'center' }); e.click() })
  await page.locator('#accGiveName').fill('warden')
  await page.selectOption('#accGiveRole', 'admin')
  await page.locator('#accGive').evaluate(e => e.click())
  await page.waitForTimeout(300)
  const ok = await page.locator('.acc-row[data-person="nact"][data-acct]').count() === 1
  await page.setViewportSize(vp)
  return ok
}

/* bell */
export const liveBell = (page) => page.evaluate(() => {
  const bs = [...document.querySelectorAll('.bellbtn')].filter(e => e.getClientRects().length)
  const ok = bs.findIndex(b => { const r = b.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h === b || b.contains(h) })
  return { n: bs.length, ok, id: ok >= 0 ? bs[ok].id : null, on: bs.map(b => b.classList.contains('on')) }
})
export const clickBell = async (W) => {
  const { page, press } = W
  const i = await page.evaluate(() => { const bs = [...document.querySelectorAll('.bellbtn')].filter(e => e.getClientRects().length); return bs.findIndex(b => { const r = b.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h === b || b.contains(h) }) })
  if (i < 0) return false
  await press(page.locator('.bellbtn:visible').nth(i)); await page.waitForTimeout(400); return true
}
export const bellLines = async (W, close = true) => {
  const { page } = W
  if (!(await clickBell(W))) return 'NO BELL REACHABLE'
  const t = await page.evaluate(() => { const l = document.querySelector('[data-testid="bell-list"]'); return l ? [...l.querySelectorAll('.bl-line')].map(x => x.innerText.replace(/\s+/g, ' ').trim()) : null })
  if (close) { await clickBell(W).catch(() => {}); await page.waitForTimeout(250) }
  return t
}

/* touch long-press drag (CDP) */
export async function touchDrag(W, from, to, { hold = 450, steps = 14, settle = 500 } = {}) {
  const c = await W.ctx.newCDPSession(W.page)
  const pt = (x, y) => [{ x: Math.round(x), y: Math.round(y), id: 1 }]
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(from.x, from.y) })
  await sleep(hold)
  await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(from.x + 2, from.y + 2) }); await sleep(60)
  for (let i = 1; i <= steps; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(from.x + (to.x - from.x) * i / steps, from.y + (to.y - from.y) * i / steps) }); await sleep(25) }
  await sleep(250)
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await c.detach().catch(() => {})
  await sleep(settle)
}

/* week helpers (copied in shape from on-A-lib) */
export async function openWeekDay(W, di) {
  const { page } = W
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(500)
  if (await page.locator('#sbBoard').isVisible().catch(() => false)) { await closeBoard(W) }
  await page.locator('#eWeek .day:not(.peek) .sec-grnd').nth(di).evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
}
export async function rosterPuck(page, person) {
  const hit = () => page.evaluate(p => { const e = document.querySelector(`#eRoster .rpuck[data-person="${p}"]`); if (!e) return { none: true }; const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { y: Math.round(r.top), hit: !!h && (h === e || e.contains(h)) } }, person)
  for (let k = 0; k < 14; k++) { const h = await hit(); if (h.hit) break; await page.mouse.move(1290, 400); await page.mouse.wheel(0, k % 2 ? 400 : -400); await page.waitForTimeout(250) }
  return page.locator(`#eRoster .rpuck[data-person="${person}"]`).first()
}
export const rowFill = (page, di, title) => page.evaluate(([di, title]) => { const day = [...document.querySelectorAll('#eWeek .day')].filter(d => !d.classList.contains('peek'))[di]; const r = [...day.querySelectorAll('.sec-grnd .pl-row')].find(r => (r.querySelector('.nm .ntx') || r).textContent.trim().toLowerCase() === title.toLowerCase()); const f = r && r.querySelector('[data-fill]'); return f ? f.getAttribute('data-fill') : null }, [di, title])
export const rowPeople = (page, di, fill) => page.evaluate(([di, f]) => { const day = [...document.querySelectorAll('#eWeek .day')].filter(d => !d.classList.contains('peek'))[di]; const p = day.querySelector(`[data-fill="${f}"]`); return p ? [...p.querySelectorAll('.puck .nm')].map(x => x.textContent.trim()).join(' + ') : 'NO ROW' }, [di, fill])
export const addz = (page, di, fill) => page.locator('#eWeek .day:not(.peek)').nth(di).locator(`[data-fill="${fill}"] .addz`)
