// Walker D of the one-rule walk (12 Oct 26): phone 390x844 by touch, build at http://localhost:4186/ . Own files only.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, appendFileSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const BASE = 'http://localhost:4186/'
export const OUT = 'docs/img/handpass/2026-10-12-one-rule/D'
mkdirSync(OUT, { recursive: true })
mkdirSync('docs/handpass/parts', { recursive: true })
export const LOG = 'docs/handpass/parts/or-D.log'
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const errs = []
export const log = (...a) => { const s = a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '); console.log(s); try { appendFileSync(LOG, s + '\n') } catch {} }
export const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
export const WIN = '[data-testid="win-inputedit"]'
export const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export const press = (loc, timeout) => loc.tap(timeout ? { timeout } : undefined)
export const csId = (p, cs) => p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)

export async function signIn(page, who, pass) {
  await page.waitForSelector('#loginForm, #vWeek .day', { timeout: 15000 })
  if (await page.locator('#loginForm').count() && await page.locator('#luser').isVisible().catch(() => false)) {
    await page.fill('#luser', who); await page.fill('#lpass', pass)
    await page.locator('#loginForm button[type=submit]').tap()
  }
  await page.waitForSelector('#vWeek .day', { timeout: 15000 })
}
/* a phone world: own context; the browser clock set three weeks before the week; plain address (NOT ?fresh=1) */
export async function open({ viewport = { width: 390, height: 844 }, who = 'ad', pass = 'a', clock = '2026-06-22T09:00:00', fresh = false } = {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  if (clock) await page.clock.setFixedTime(new Date(clock))
  const tag = `D ${viewport.width}x${viewport.height} ${who}`
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 240)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 240)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await page.goto(BASE + (fresh ? '?fresh=1' : ''))
  await signIn(page, who, pass)
  return { ctx, page }
}
export const shot = async (p, name) => { await p.screenshot({ path: join(OUT, name + '.png') }); log('saved ' + name); return name + '.png' }
export const toast = p => p.evaluate(() => (document.getElementById('toastEl')?.innerText || '').trim())

export async function pick(p, iso) {
  for (let i = 0; i < 36 && !(await p.locator(`#inpEdCal [data-cal="${iso}"]`).count()); i++) {
    const [m, y] = (await p.locator('#inpEdCal .rc-mon').textContent()).split(' ')
    const at = `${y}-${String(MONTHS.findIndex(x => x.startsWith(m.toLowerCase())) + 1).padStart(2, '0')}`
    await press(p.locator(`#inpEdCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`))
  }
  await press(p.locator(`#inpEdCal [data-cal="${iso}"]`))
}
/* file one input through the Inputs page's "+ Input" window, by touch.
   spec: {type, person (cs), people:[cs…] (Several people), ph:'allavail'|'all', from, to (iso), title, rmk, timed:[s,e], oil:'yes'|'no'|'close'} */
export async function fileInput(p, spec) {
  await p.evaluate(() => window.go('inputs'))
  const had = await p.evaluate(() => window.INPUTS.map(r => r.iid))
  if (await p.locator(WIN).count()) { await press(p.locator('#inpEditCancel')); await p.waitForTimeout(150) }
  if (await p.locator('#inListBtn[aria-pressed="false"]').count()) { await press(p.locator('#inListBtn')); await p.waitForTimeout(200) }
  await press(p.locator('#inNew')); await p.locator(WIN).waitFor()
  if (spec.type) await p.selectOption('#inpEditType', spec.type)
  if (spec.person) await p.selectOption('#inpEditPerson', await csId(p, spec.person))
  if (spec.people) {
    await press(p.locator(`${WIN} [data-testid="pp-several"]`))
    const want = []
    for (const cs of spec.people) { const pid = await csId(p, cs); want.push(pid); const b = p.locator(`${WIN} [data-pp="${pid}"]`); if ((await b.getAttribute('aria-pressed')) !== 'true') await press(b) }
    const pressed = await p.evaluate(sel => [...document.querySelectorAll(`${sel} [data-pp][aria-pressed="true"]`)].map(b => b.getAttribute('data-pp')), WIN)
    for (const pid of pressed) if (!want.includes(pid)) await press(p.locator(`${WIN} [data-pp="${pid}"]`))
    if (spec.ph) await press(p.locator(`${WIN} [data-ph="${spec.ph}"]`))
  }
  if (spec.from) await pick(p, spec.from)
  if (spec.to) await pick(p, spec.to)
  if (spec.timed) {
    if (await p.locator('#inpEditAllday').count() && await p.locator('#inpEditAllday').isChecked()) await press(p.locator('#inpEditAllday'))
    await p.fill('#inpEditStart', spec.timed[0]); await p.fill('#inpEditEnd', spec.timed[1])
  }
  if (spec.title != null) await p.fill('#inpEditOwnTitle', spec.title)
  if (spec.rmk != null) await p.fill('#inpEditRmk', spec.rmk)
  await press(p.locator('#inpEditSave'))
  await p.waitForTimeout(350)
  for (let k = 0; k < 3; k++) {
    const sheet = p.locator('[data-testid="oilconf"]')
    if (await sheet.count()) {
      const how = spec.oil || 'no'
      const one = sheet.locator(`[data-testid="oil-${how}"]`), many = sheet.locator(`[data-testid="oil-${how === 'yes' ? 'all' : 'none'}"]`)
      await press((await one.count()) ? one : many)
      await press(sheet.locator('[data-testid="oilconf-save"]'))
    } else if (await p.locator('[data-testid="docconf"]').count()) await press(p.locator('[data-testid="docconf-nodoc"]'))
    else break
    await p.waitForTimeout(300)
  }
  await p.locator(WIN).waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
  await p.waitForTimeout(300)
  return p.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => ({ iid: r.iid, type: r.type, title: r.title, date: r.date, s: r.s, e: r.e, people: (r.people || []).map(e => e.p), person: window.PEOPLE[r.person]?.cs, oil: r.oil ?? null })), had)
}

export async function touchDrag(page, from, to, { hold = 450, steps = 12, settle = 350 } = {}) {
  const c = await page.context().newCDPSession(page)
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
export const centre = async loc => { const b = await loc.boundingBox(); return b ? { x: b.x + b.width / 2, y: b.y + b.height / 2, b } : null }
export const inputsOf = (p, title) => p.evaluate(t => window.INPUTS.filter(r => !t || r.title === t).map(r => ({ iid: r.iid, type: r.type, title: r.title, date: r.date, to: r.to, s: r.s, e: r.e, rmk: r.remarks, who: r.person ? window.PEOPLE[r.person]?.cs : null, people: (r.people || []).map(e => (window.PEOPLE[e.p]?.cs) || e.p), oil: r.oil ?? null, cx: r.cx || null })), title)
export const DI = 2 // Wed 15 Jul
export async function goWeek(page) { await page.evaluate(() => window.closeScheduler && window.closeScheduler()); await page.evaluate(() => window.go('editsched')); await sleep(600) }
export async function goBoard(page, di = DI) { if ((await page.evaluate(() => window.CURPAGE)) !== 'editsched') { await page.evaluate(() => window.go('editsched')); await sleep(700) } await page.evaluate(di => window.openScheduler(di), di); await sleep(900) }
export const readRows = (p, title) => p.evaluate(title => {
  const norm = s => (s || '').trim().toLowerCase()
  const names = r => [...r.querySelectorAll('.ppl .puck .nm, .puck .nm')].map(n => n.textContent.trim())
  const pick = (sel, name) => [...document.querySelectorAll(sel)].filter(r => norm(name(r)) === title).map(r => ({ names: names(r), text: r.innerText.replace(/\s+/g, ' ').trim().slice(0, 140), vals: [...r.querySelectorAll('input,textarea')].map(i => i.value).filter(v => v !== '') }))
  return {
    weekGround: pick('#page-editsched .day:not(.peek) .sec-grnd .pl-row', r => r.querySelector('.nm .ntx')?.textContent),
    weekInputs: pick('#page-editsched .day:not(.peek) .sec-inp .pl-row', r => r.querySelector('.nm .ntx')?.textContent),
    boardGround: pick('#schedBoard .sb-panel.grnd .sb-arow', r => r.querySelector('textarea.ain, input.ain')?.value),
    boardInputs: pick('#schedBoard .sb-panel.pinp .sb-arow.inprow', r => r.querySelector('.inpedit')?.textContent),
  }
}, title.toLowerCase())
export const toWeekSec = (p, key, di = DI) => p.evaluate(([di, key]) => {
  const day = [...document.querySelectorAll('#page-editsched .day:not(.peek)')][di]
  day.scrollIntoView({ inline: 'start', block: 'nearest' })
  const sec = day.querySelector(`[data-secmove="${di}.${key}"]`)
  const y = sec.getBoundingClientRect().top + window.scrollY - 96
  window.scrollTo(0, Math.max(0, y))
}, [di, key])
export async function unfoldWeek(page, di = DI) {
  const t = page.locator(`#page-editsched .day:not(.peek) [data-pitog="${di}"]`).first()
  if (await t.count() && /show/.test(await t.innerText())) { await t.tap(); await sleep(400) }
}
export async function unfoldBoard(page, di = DI) {
  const t = page.locator(`#schedBoard [data-pitog="${di}"]`).first()
  if (await t.count() && /show/.test(await t.innerText())) { await t.tap(); await sleep(400) }
}
export async function openDrawer(page, board = false) {
  const tab = page.locator(board ? '.sb-ros .ros-tab' : '#rosTab')
  await tab.tap(); await sleep(700)
}

/* the Inputs pages' readings of ONE input: the List's card, the month's cell, the opened day's card, the input's own window */
export async function inputsPages(page, iid, opts = {}) {
  const { iso = '2026-07-15', win = true, picDay = null } = opts
  const out = {}
  await page.evaluate(() => window.go('inputs')); await sleep(500)
  if (await page.locator(WIN).count()) { await press(page.locator('#inpEditCancel')); await sleep(200) }
  // List
  if (await page.locator('#inListBtn[aria-pressed="false"]').count()) { await press(page.locator('#inListBtn')); await sleep(300) }
  if (!(await page.locator('#inRangeBtn').innerText()).includes('All')) { await press(page.locator('#inRangeBtn')); await sleep(400); const all = page.locator('button', { hasText: 'All dates' }).first(); if (await all.count()) await all.tap(); await sleep(500); await page.keyboard.press('Escape').catch(() => {}); await sleep(200) }
  out.list = await page.evaluate(iid => { const m = [...document.querySelectorAll('#page-inputs .icard')].find(e => (e.innerHTML || '').includes(iid) || false); return m ? m.innerText.replace(/\s+/g, ' ').trim() : null }, iid)
  if (out.list === null) out.list = await page.evaluate(t => { const m = [...document.querySelectorAll('#page-inputs .icard')].find(e => e.innerText.includes(t)); return m ? m.innerText.replace(/\s+/g, ' ').trim() : null }, opts.title || '')
  if (out.list === null) out.listAll = await page.evaluate(() => [...document.querySelectorAll('#page-inputs .icard')].map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 100)))
  if (picDay) await shot(page, picDay + '-list')
  // Calendar
  await press(page.locator('#inCalBtn')); await page.locator('#inpCal').waitFor(); await sleep(300)
  const at = async () => { const [m, y] = (await page.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MONTHS.findIndex(x => x.startsWith(m)) }
  const want = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1)
  let d = want - await at()
  for (; d > 0; d--) await press(page.locator('#icNext'))
  for (; d < 0; d++) await press(page.locator('#icPrev'))
  await page.waitForSelector(`[data-icday="${iso}"]`)
  out.bars = await page.evaluate(iid => [...document.querySelectorAll(`[data-testid="ib-bar-${iid}"]`)].map(e => ({ t: e.innerText.replace(/\s+/g, ' ').trim(), title: e.getAttribute('title'), cls: e.className, op: getComputedStyle(e).opacity, td: getComputedStyle(e).textDecorationLine })), iid)
  if (picDay) await shot(page, picDay + '-month')
  // opened day
  await page.locator(`[data-icday="${iso}"]`).tap({ position: { x: 8, y: 8 } }); await sleep(500)
  await page.locator('[data-testid="win-inputsday"]').waitFor({ timeout: 4000 }).catch(() => {})
  out.card = await page.evaluate(iid => { const c = document.querySelector(`[data-testid="win-inputsday"] [data-popiid="${iid}"]`); return c ? c.innerText.replace(/\s+/g, ' ').trim() : null }, iid)
  if (picDay) await shot(page, picDay + '-day')
  if (win && out.card !== null) {
    await page.locator(`[data-testid="win-inputsday"] [data-popiid="${iid}"]`).first().tap(); await sleep(600)
    if (await page.locator(WIN).count()) {
      out.window = await page.evaluate(() => {
        const w = document.querySelector('[data-testid="win-inputedit"]')
        return {
          head: (w.querySelector('.modal-h, .mh, h2, h3, header') || w).innerText.replace(/\s+/g, ' ').trim().slice(0, 160),
          pressed: [...w.querySelectorAll('[data-pp][aria-pressed="true"]')].map(b => b.innerText.trim()),
          ph: [...w.querySelectorAll('[data-ph][aria-pressed="true"]')].map(b => b.innerText.trim()),
          start: w.querySelector('#inpEditStart')?.value, end: w.querySelector('#inpEditEnd')?.value,
          h: w.getBoundingClientRect().height, text: w.innerText.replace(/\s+/g, ' ').trim().slice(0, 500),
        }
      })
      if (picDay) await shot(page, picDay + '-win')
      await press(page.locator('#inpEditCancel')); await sleep(300)
    } else out.window = 'no window opened'
  }
  // leave the calendar's pop-up
  await page.keyboard.press('Escape').catch(() => {}); await sleep(200)
  return out
}

export const toastBox = p => p.evaluate(() => {
  const t = document.getElementById('toastEl'); if (!t) return null
  const r = t.getBoundingClientRect(), cs = getComputedStyle(t), W = window.innerWidth, H = window.innerHeight
  const inner = t.firstElementChild || t
  return { text: (t.innerText || '').trim(), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), right: Math.round(r.right), bottom: Math.round(r.bottom), vw: W, vh: H, inside: r.x >= 0 && r.right <= W && r.y >= 0 && r.bottom <= H, shown: cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.1, overflowX: t.scrollWidth > t.clientWidth + 1, overflowY: t.scrollHeight > t.clientHeight + 1 }
})
/* the schedule's surfaces for one input: the week's Ground row and Personal Inputs line, the board's */
export async function schedSurfaces(page, title, di = DI) {
  const out = {}
  await goWeek(page); await unfoldWeek(page, di)
  const w = await readRows(page, title); out.week = { ground: w.weekGround, inputs: w.weekInputs }
  await goBoard(page, di); await unfoldBoard(page, di)
  const b = await readRows(page, title); out.board = { ground: b.boardGround, inputs: b.boardInputs }
  await page.evaluate(() => window.closeScheduler && window.closeScheduler()); await sleep(400)
  return out
}
export const brief = o => JSON.stringify(o)
export async function weekRowToTop(page, title) {
  const row = page.locator('#page-editsched .day:not(.peek) .sec-grnd .pl-row', { hasText: title.toUpperCase() }).first()
  await row.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(400)
  await page.evaluate(t => { const r = [...document.querySelectorAll('#page-editsched .day:not(.peek) .sec-grnd .pl-row')].find(x => x.innerText.toUpperCase().includes(t.toUpperCase())); window.scrollBy(0, r.getBoundingClientRect().top - 130) }, title); await sleep(300)
  return row
}
/* a crew puck in the week's inline Available Crew list, on screen */
export async function inlineCrew(page, cs, di = DI) {
  const id = await csId(page, cs)
  const l = page.locator(`#page-editsched .day:not(.peek) .puck[data-person="${id}"]`).filter({ visible: true })
  const n = await l.count()
  for (let i = 0; i < n; i++) { const b = await l.nth(i).boundingBox(); if (b && b.x >= 0 && b.x + b.width <= 390 && b.y > 120 && b.y < 800) return { loc: l.nth(i), b } }
  return null
}

/* a Ground Programme row on the week found by its (whitespace-folded) text, scrolled to near the top; returns its locator */
export async function rowTopRe(page, src, { top = 130 } = {}) {
  const ok = await page.evaluate(src => {
    const re = new RegExp(src, 'i')
    document.querySelectorAll('[data-ord="1"]').forEach(e => e.removeAttribute('data-ord'))
    const r = [...document.querySelectorAll('#page-editsched .day:not(.peek) .sec-grnd .pl-row')].find(x => re.test(x.innerText.replace(/\s+/g, ' ')))
    if (!r) return false
    r.setAttribute('data-ord', '1'); r.scrollIntoView({ block: 'center', inline: 'nearest' }); return true
  }, src)
  if (!ok) return null
  await sleep(400)
  await page.evaluate(top => { const r = document.querySelector('[data-ord="1"]'); window.scrollBy(0, r.getBoundingClientRect().top - top) }, top); await sleep(300)
  return page.locator('[data-ord="1"]')
}
export const allInputs = p => p.evaluate(() => window.INPUTS.map(r => ({ type: r.type, title: r.title, date: r.date, to: r.to, s: r.s, e: r.e, people: (r.people || []).map(e => (window.PEOPLE[e.p]?.cs) || e.p), cx: r.cx || null })).sort((a, b) => (a.type + a.date + a.title).localeCompare(b.type + b.date + b.title)))
export const weekGroundText = (p, days = [0, 2]) => p.evaluate(days => { const D = [...document.querySelectorAll('#page-editsched .day:not(.peek)')]; return days.map(i => [...D[i].querySelectorAll('.sec-grnd .pl-row')].map(r => r.innerText.replace(/\s+/g, ' ').trim())) }, days)
export async function undoState(p) { return p.evaluate(() => { const b = document.getElementById('undoBtn') || document.getElementById('sbUndo'); return b ? { title: b.getAttribute('title'), disabled: b.disabled } : null }) }
/* drag a placeholder puck (ALL AVAIL / ALL) from the AIRCREW drawer onto a row's name cell */
export async function dragPlaceholder(page, which, row) {
  await openDrawer(page, false); await sleep(500)
  const sel = which === 'allavail' ? '#eRoster .rpuck[data-person="allavail"], #eRoster .puck[data-person="allavail"]' : '#eRoster .rpuck[data-person="all"], #eRoster .puck[data-person="all"]'
  const ph = page.locator(sel).filter({ visible: true }).first()
  const pb = await ph.boundingBox()
  const nb = await row.locator('.nm').first().boundingBox()
  await touchDrag(page, { x: pb.x + Math.min(pb.width / 2, 40), y: pb.y + pb.height / 2 }, { x: nb.x + 30, y: nb.y + 12 }, { settle: 150 })
  return { pb, nb }
}

/* the input's window opened from the schedule (#inpEditPop): its box, people, the footer's buttons */
export const popInfo = p => p.evaluate(() => {
  const pop = document.getElementById('inpEditPop'); const box = pop && pop.querySelector('.airpop-box'); if (!box) return null
  const r = box.getBoundingClientRect(); if (!r.width) return null
  const rc = id => { const e = document.getElementById(id); if (!e) return null; const b = e.getBoundingClientRect(); const mx = b.x + b.width / 2, my = b.y + b.height / 2; const top = document.elementFromPoint(mx, my); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), inView: b.top >= 0 && b.bottom <= window.innerHeight && b.left >= 0 && b.right <= window.innerWidth, landsOn: !!top && (top === e || e.contains(top)) } }
  return {
    box: [r.x, r.y, r.width, r.height].map(Math.round), vw: window.innerWidth, vh: window.innerHeight, gapTop: Math.round(r.top), gapBottom: Math.round(window.innerHeight - r.bottom),
    content: box.scrollHeight, shown: box.clientHeight, scrollTop: Math.round(box.scrollTop), pageY: Math.round(window.scrollY),
    title: (document.getElementById('inpEditTitle') || {}).innerText,
    pressed: [...box.querySelectorAll('[data-pp][aria-pressed="true"]')].map(b => b.innerText.replace(/\s+/g, ' ').trim()),
    ph: [...box.querySelectorAll('[data-ph][aria-pressed="true"]')].map(b => b.innerText.trim()),
    count: (box.querySelector('[data-testid="pp-count"]') || {}).innerText,
    start: (document.getElementById('inpEditStart') || {}).value, end: (document.getElementById('inpEditEnd') || {}).value,
    save: rc('inpEditSave'), del: rc('inpEditDel'), cancel: rc('inpEditCancel'),
  }
})
export async function swipeIn(page, x, y, dy, steps = 10) {
  const c = await page.context().newCDPSession(page)
  const pt = (x, y) => [{ x: Math.round(x), y: Math.round(y), id: 1 }]
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(x, y) })
  for (let i = 1; i <= steps; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(x, y + dy * i / steps) }); await sleep(20) }
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await c.detach().catch(() => {}); await settleScroll(page)
}

/* wait until the window's own scroll and the page's scroll have stood still for 700ms (a fling swallows the next tap) */
export async function settleScroll(page, quiet = 700, max = 8000) {
  let last = null, since = Date.now(), t0 = Date.now()
  while (Date.now() - t0 < max) {
    const v = await page.evaluate(() => { let t = 0; document.querySelectorAll('#inpEditPop *, [data-testid="win-inputedit"], [data-testid="win-inputedit"] *, [data-testid="oilconf"], [data-testid="oilconf"] *').forEach(e => { t += e.scrollTop }); return t + ':' + window.scrollY + ':' + (document.scrollingElement || document.body).scrollTop })
    if (v !== last) { last = v; since = Date.now() } else if (Date.now() - since >= quiet) return
    await sleep(100)
  }
}

/* a finger's tap by raw touch events (the same route the swipes take) */
export async function tapCdp(page, x, y, hold = 70) {
  const c = await page.context().newCDPSession(page)
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: Math.round(x), y: Math.round(y), id: 1 }] }); await sleep(hold)
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await c.detach().catch(() => {}); await sleep(700)
}

/* sign the four roles and publish a day through the board's own controls (a phone: the sign-off boxes are selects, the button is tapped) */
export async function signAndPublish(p, di) {
  await goBoard(p, di)
  const sels = p.locator(`#schedBoard [data-signday="${di}"]`)
  const n = await sels.count()
  for (let i = 0; i < n; i++) {
    if (!(await sels.nth(i).isVisible().catch(() => false))) continue
    const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && v !== '—'))
    if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i % 4, opts.length - 1)])
    await sleep(150)
  }
  await sleep(300)
  let btn = p.locator(`#schedBoard [data-beak="${di}"]:visible, #schedBoard [data-alpub="${di}"]:visible`).first()
  if (!(await btn.count())) return { ok: false, why: 'no publish button', selects: n }
  const label = (await btn.innerText()).trim()
  if (await btn.isDisabled()) return { ok: false, why: 'disabled: ' + label, selects: n }
  await btn.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200); await btn.tap(); await sleep(800)
  const ok = p.getByRole('button', { name: /^(Publish|Yes|Confirm|Issue)/ }).first()
  if (await ok.count() && await ok.isVisible()) { await ok.tap(); await sleep(900) }
  const ver = await p.evaluate(() => (document.querySelector('#schedBoard .verchip') || {}).innerText || '')
  return { ok: true, label, version: ver, selects: n }
}
