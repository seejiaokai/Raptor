// Walker E helpers (one-rule walk, 12 Oct 26): phone by touch, own contexts, served build http://localhost:4186/ only.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, appendFileSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const URL = 'http://localhost:4186/'
export const OUT = 'docs/img/handpass/2026-10-12-one-rule/E'
export const PARTS = 'docs/handpass/parts'
mkdirSync(OUT, { recursive: true }); mkdirSync(PARTS, { recursive: true })
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
export const MON = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export const PHONE = { width: 390, height: 844 }, DESK = { width: 1440, height: 900 }
export const DAY = '2026-07-15', DI = 2

/* a world = one context + one page; fresh=true opens ?fresh=1 (memory only); clock three weeks before the week */
export async function world({ size = PHONE, touch = true, fresh = false, who = 'ad', pass = 'a', clock = '2026-06-22T09:00:00', tag = 'E' } = {}) {
  const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: 2, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  const errors = []
  if (clock) await page.clock.install({ time: new Date(clock) })
  page.on('pageerror', e => errors.push(`${tag} pageerror: ` + String(e).slice(0, 240)))
  page.on('console', m => { if (m.type() === 'error') errors.push(`${tag} console: ` + m.text().slice(0, 240)) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await page.goto(URL + (fresh ? '?fresh=1' : ''))
  const w = mk(page, ctx, touch, errors, tag)
  if (who) await w.signIn(who, pass)
  return w
}

export function mk(page, ctx, touch, errors, tag) {
  const press = loc => (touch ? loc.tap() : loc.click())
  const w = { page, ctx, errors, press }
  w.say = (...a) => { const s = a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '); console.log(s); try { appendFileSync(`${PARTS}/or-E.log`, s + '\n') } catch {} }
  w.res = (k, v) => { let o = {}; try { o = JSON.parse(readFileSync(`${PARTS}/or-E.json`, 'utf8')) } catch {} o[k] = v; writeFileSync(`${PARTS}/or-E.json`, JSON.stringify(o, null, 1)) }
  w.note = async () => (await page.locator('#toastEl').innerText().catch(() => '')).replace(/\s+/g, ' ').trim()
  w.quiet = () => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' })
  w.loud = () => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = '' })
  w.shot = async (name, opts = {}) => { await page.screenshot({ path: join(OUT, name + '.png'), ...opts }); w.say('saved ' + name); return name + '.png' }
  w.clip = async (name, box, pad = [10, 10, 10, 10]) => {
    const vp = page.viewportSize()
    const x = Math.max(0, box.x - pad[3]), y = Math.max(0, box.y - pad[0])
    const wd = Math.min(vp.width, box.x + box.width + pad[1]) - x, h = Math.min(vp.height, box.y + box.height + pad[2]) - y
    return w.shot(name, { clip: { x, y, width: wd, height: h } })
  }
  w.signIn = async (u, p) => {
    await page.waitForSelector('#loginForm, #vWeek .day', { timeout: 15000 })
    if (await page.locator('#loginForm').count() && await page.locator('#luser').isVisible().catch(() => false)) {
      await page.fill('#luser', u); await page.fill('#lpass', p)
      await press(page.locator('#loginForm button[type=submit]'))
    }
    await page.waitForSelector('#vWeek .day', { timeout: 15000 }); await sleep(500)
  }
  w.signOut = async () => {
    if (touch) { await page.locator('#burger').tap(); await sleep(500); await page.locator('#drawerLogout').tap() }
    else { const b = page.locator('#logout:visible').first(); if (await b.count()) await b.click(); else await page.evaluate(() => document.getElementById('logout').click()) }
    await page.waitForSelector('#loginForm', { timeout: 8000 }); await sleep(400)
  }
  w.csId = cs => page.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)
  w.toMonth = async () => {
    await page.evaluate(() => window.go('inputs'))
    await page.locator('#inpCal').waitFor()
    if (await page.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await press(page.locator('#inCalBtn'))
    const at = async () => { const [m, y] = (await page.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MON.findIndex(x => x.startsWith(m)) }
    let d = 2026 * 12 + 6 - await at()
    for (; d > 0; d--) await press(page.locator('#icNext'))
    for (; d < 0; d++) await press(page.locator('#icPrev'))
    await page.waitForSelector(`[data-icday="${DAY}"]`)
  }
  w.openDay = async (day = DAY) => {
    await page.locator(`[data-icday="${day}"]`).focus()
    await page.keyboard.press('Enter')
    await page.waitForSelector('[data-testid="win-inputsday"]')
    await sleep(350)
  }
  w.closeDay = async () => { const x = page.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) { await press(x); await sleep(250) } }
  /* file through the Inputs calendar's day: "+ Input", "Several people" (or one person), title, hours, remark, kind */
  w.fileIt = async ({ day = DAY, pick, title, from, to, rmk, kind, oil }) => {
    await w.toMonth(); await w.openDay(day)
    await press(page.locator('#icPopAdd'))
    await page.waitForSelector('#inpEditPop [data-testid="pp-several"]')
    if (kind) await page.locator('#inpEditPop #inpEditType').selectOption(kind)
    const ids = []; for (const cs of pick) ids.push(await w.csId(cs))
    if (ids.length > 1 || true) {
      await press(page.locator('#inpEditPop [data-testid="pp-several"]'))
      for (const id of ids) if (await page.locator(`#inpEditPop [data-pp="${id}"]`).getAttribute('aria-pressed') !== 'true') await press(page.locator(`#inpEditPop [data-pp="${id}"]`))
      const lit = await page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
      for (const id of lit) if (!ids.includes(id)) await press(page.locator(`#inpEditPop [data-pp="${id}"]`))
    }
    if (title != null) await page.locator('#inpEditPop #inpEditOwnTitle').first().fill(title)
    if (from) { await page.locator('#inpEditPop #inpEditStart').fill(from); await page.locator('#inpEditPop #inpEditEnd').fill(to) }
    if (rmk != null) await page.locator('#inpEditPop #inpEditRmk').fill(rmk)
    await press(page.locator('#inpEditSave'))
    await sleep(500)
    const seen = []
    for (let k = 0; k < 3; k++) {
      const sheet = page.locator('[data-testid="oilconf"]')
      if (await sheet.count()) {
        seen.push('oil question shown')
        if (oil === 'close') { const c = page.locator('[data-testid="oilconf-close"], [data-testid="oilconf-cancel"], #oilConfirmClose, [data-testid="oil-close"]').first(); if (await c.count()) { await press(c); seen.push('closed') } else seen.push('NO CLOSE CONTROL') ; break }
        const how = oil || 'no'
        const one = sheet.locator(`[data-testid="oil-${how}"]`), many = sheet.locator(`[data-testid="oil-${how === 'yes' ? 'all' : 'none'}"]`)
        await press((await one.count()) ? one : many)
        await press(sheet.locator('[data-testid="oilconf-save"]'))
      } else break
      await sleep(300)
    }
    await sleep(300)
    w.say('filed', title, JSON.stringify(seen), await w.note())
    await w.closeDay().catch(() => {})
    return seen
  }
  w.rec = title => page.evaluate(t => { const r = window.INPUTS.find(x => x.title === t); return r ? { iid: r.iid, date: r.date, s: r.s, e: r.e, type: r.type, people: (r.people || []).map(e => (window.PEOPLE[e.p] || {}).cs || e.p), cx: !!r.cx, cxr: r.cxr || '', by: r.by, ttl: r.title || '', rmk: r.remarks || r.rmk || '', red: r.red, info: r.info, off: r.off } : null }, title)
  w.recById = id => page.evaluate(id => { const r = window.INPUTS.find(x => x.iid === id); return r ? { iid: r.iid, title: r.title, people: (r.people || []).map(e => (window.PEOPLE[e.p] || {}).cs || e.p), cx: !!r.cx, cxr: r.cxr || '', s: r.s, e: r.e } : null }, id)
  w.openBoard = async (di = DI) => {
    if (await page.locator('#schedBoard:visible').count()) return
    await page.evaluate(() => window.go('editsched')); await page.locator('#eWeek .day').first().waitFor(); await sleep(300)
    const d = page.locator(`#eWeek [data-sbday="${di}"]:visible`).first()
    await d.scrollIntoViewIfNeeded(); await press(d)
    await page.waitForSelector('#schedBoard', { timeout: 5000 }); await sleep(300)
  }
  w.closeBoard = async () => { if (await page.locator('#sbDone:visible').count()) { await press(page.locator('#sbDone:visible').first()); await sleep(400) } }
  w.rowIdx = (di, id) => page.evaluate(([di, id]) => (window.DAYS[di].ground || []).findIndex(g => g.src === id), [di, id])
  /* the board's CX button: cancel with a reason, or (un=true) un-cancel; reason '' = none */
  w.boardCx = async (id, di, { un = false, why = 'WX' } = {}) => {
    await w.openBoard(di)
    const ri = await w.rowIdx(di, id)
    const cx = page.locator(`#schedBoard [data-grcx="${di}.${ri}"]:visible`).first()
    await cx.scrollIntoViewIfNeeded(); await press(cx); await sleep(400)
    if (await page.locator('#cxSave').count()) {
      if (un) await press(page.locator('#cxUn'))
      else {
        if (why) { const q = page.locator(`#cxQuick [data-cxq="${why}"]`).first(); if (await q.count()) await press(q); else await page.locator('#cxReason').fill(why) }
        await press(page.locator('#cxSave'))
      }
      await sleep(500)
    }
    return ri
  }
  w.facts = sel => page.evaluate(s => [...document.querySelectorAll(s)].map(e => {
    const q = c => e.querySelector(c), cs = x => x ? getComputedStyle(x) : null
    const t = q('.icard-title, .intitle'), k = q('.icard-kind, .intag'), why = q('.icx-why'), g = q('.icx'), r = q('.icard-rmk, .rmk, .icard-remark')
    return { text: e.innerText.replace(/\s+/g, ' ').trim(), tag: g ? g.textContent.trim() + ' / bg ' + cs(g).backgroundColor : null,
      titleStrike: t ? cs(t).textDecorationLine : null, kindStrike: k ? cs(k).textDecorationLine : null, why: why ? why.textContent.trim() + ' / colour ' + cs(why).color : null,
      rmkColour: r ? cs(r).color : null, h: Math.round(e.getBoundingClientRect().height), w: Math.round(e.getBoundingClientRect().width), over: e.scrollWidth > e.clientWidth }
  }), sel)
  /* bell */
  w.bellSel = async () => ((await page.locator('#sbBell').isVisible().catch(() => false)) ? '#sbBell' : '#notifyBell')
  w.bell = async () => page.locator(await w.bellSel())
  w.bellState = async () => page.evaluate(sel => { const b = document.querySelector(sel); return b ? { id: b.id, lit: b.classList.contains('on'), open: b.getAttribute('aria-expanded') } : null }, await w.bellSel())
  w.listFacts = () => page.evaluate(() => {
    const l = document.querySelector('.bell-list'); if (!l) return null
    const open = document.querySelector('.bellbtn[aria-expanded="true"]') || document.querySelector('.bellbtn')
    const r = l.getBoundingClientRect(), b = open.getBoundingClientRect()
    const cx = r.x + r.width / 2, cy = r.y + Math.min(r.height / 2, innerHeight - r.y - 2)
    const hit = document.elementFromPoint(cx, cy)
    const bar = document.querySelector('#topbar, .topbar, header')
    return { box: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, vw: innerWidth, vh: innerHeight, underBell: Math.round(r.y - b.bottom), bellRect: { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), right: Math.round(b.right) }, rightEdge: Math.round(b.right - r.right),
      inView: r.x >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, wideAsScreen: Math.round(r.width) >= innerWidth - 20, hitIsList: !!hit && (hit === l || l.contains(hit)), hitTag: hit ? (hit.className || hit.tagName) : null,
      scrolls: l.scrollHeight > l.clientHeight + 2, scrollH: l.scrollHeight, clientH: l.clientHeight,
      empty: (l.querySelector('.bl-empty') || {}).textContent || null, markAll: (() => { const m = l.querySelector('[data-testid="bell-markall"]'); if (!m) return null; const mr = m.getBoundingClientRect(); return { x: Math.round(mr.x), y: Math.round(mr.y), bottom: Math.round(mr.bottom), visible: mr.bottom <= innerHeight && mr.top >= r.top - 1 && mr.bottom <= r.bottom + 1 } })(),
      lines: [...l.querySelectorAll('.bl-line')].map(e => { const lr = e.getBoundingClientRect(); const wh = e.querySelector('.bl-what'); return { unread: e.classList.contains('unread'), name: e.querySelector('.bl-name').textContent, bold: getComputedStyle(e.querySelector('.bl-name')).fontWeight, day: e.querySelector('.bl-day').textContent, what: wh.textContent, ago: e.querySelector('.bl-ago').textContent, h: Math.round(lr.height), cut: wh.scrollWidth > wh.clientWidth + 1, lineInside: lr.right <= innerWidth && lr.left >= 0, op: getComputedStyle(e).opacity, col: getComputedStyle(wh).color } }) }
  })
  w.shotList = async (name, pad = [70, 14, 40, 14]) => {
    await w.quiet()
    const f = await w.listFacts()
    await w.shot(name + '-full')
    if (f) await w.clip(name, { x: f.box.x, y: f.box.y, width: f.box.w, height: f.box.h }, pad)
    await w.loud()
    return f
  }
  return w
}

export function summarise(f) {
  if (!f) return null
  return { box: f.box, vw: f.vw, vh: f.vh, underBell: f.underBell, inView: f.inView, wideAsScreen: f.wideAsScreen, hitIsList: f.hitIsList, hitTag: f.hitTag, scrolls: f.scrolls, markAll: f.markAll, empty: f.empty, n: f.lines.length, lines: f.lines.map(l => `${l.unread ? '[unread] ' : '[read] '}${l.name} | ${l.day} | ${l.what} | ${l.ago} | bold ${l.bold} h${l.h}${l.cut ? ' CUT' : ''}${l.lineInside ? '' : ' OUTSIDE'} op ${l.op}`) }
}

/* a finger drag over CDP: touchStart, hold, tiny move, steps, settle, touchEnd (copied from gi-w2lib's touchDrag) */
export async function touchDrag(page, from, to, { hold = 450, steps = 12, settle = 450 } = {}) {
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

/* the board crew drawer, as gi-w2lib does it */
export async function toBoardSec(page, key, di = DI) {
  await page.evaluate(([di, key]) => {
    const sec = document.querySelector(`#schedBoard [data-secmove="${di}.${key}"]`)
    sec.scrollIntoView({ block: 'start' })
    for (let n = sec.parentElement; n; n = n.parentElement) if (n.scrollHeight > n.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(n).overflowY)) { n.scrollTop -= 10; break }
  }, [di, key])
}
export async function openDrawer(page) { await page.locator('.sb-ros .ros-tab').tap(); await sleep(800) }
export async function drawerName(page, cs) {
  const id = await page.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)
  const loc = page.locator(`#sbRoster .rpuck .puck[data-person="${id}"]`)
  const n = await loc.count()
  for (let i = 0; i < n; i++) { const b = await loc.nth(i).boundingBox(); if (b && b.x >= 0 && b.x < 390 && b.y >= 120 && b.y < 780 && b.width > 0) return loc.nth(i) }
  if (n) { await loc.first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300); return loc.first() }
  return null
}
