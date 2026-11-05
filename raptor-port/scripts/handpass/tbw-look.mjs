// [NOTICE-UNDO-RETRACT] / [PO-SANS-PUCK-EDGE] — the pictures for HIS LOOK and his questions, each cut to what it is about
// (D1222), from the walk's own helpers (a copy of tbw-walk.mjs's, so the two reach the same world the same way).
// Q2 Balances / Approvals before and after his date; Q4 a posting moved after it ran; the built line and purple line.
// Usage (from raptor-port/): WALK_DIR=<frozen dist> [TBW_OUT=<folder>] node scripts/handpass/tbw-look.mjs
import { chromium, webkit } from '@playwright/test'
import { mkdirSync, writeFileSync, readdirSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { serveFrozen } from './isr-serve.mjs'

console.log('[tbw-look v1]')
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.env.TBW_OUT || join(HERE, '../../docs/img/handpass/2026-11-05-taken-back-sans/look')
mkdirSync(OUT, { recursive: true })
for (const f of readdirSync(OUT)) if (/\.(png|json)$/.test(f)) rmSync(join(OUT, f))
const URL = 'http://localhost:4396/'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const ISO = '2026-11-16', EARLY = '2026-11-13'
const BEFORE = new Date('2026-11-05T09:00:00')
const RUN = new Date('2026-11-16T08:00:00')
const later = m => new Date(RUN.getTime() + m * 60_000)
const SIZES = {
  desk: { engine: chromium, opts: { viewport: { width: 1536, height: 864 } }, tap: false },
  phone: { engine: webkit, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true }, tap: true },
}
const STAGES = process.env.STAGES ? new Set(process.env.STAGES.split(',')) : null
const want = s => !STAGES || STAGES.has(s)
const results = [], errs = [], log = []
const say = l => { log.push(l); console.log(l) }
const check = (size, step, ok, what) => { results.push({ size, step, ok: ok === 'NW' ? 'NOT WALKED' : !!ok, what }); say(`${ok === 'NW' ? 'NOT WALKED' : ok ? 'PASS' : 'FAIL'} [${size}] ${step} — ${what}`) }
const record = (size, step, what) => { results.push({ size, step, ok: 'RECORD', what }); say(`RECORD [${size}] ${step} — ${what}`) }

/* ---------- the world ---------- */
const open = async (size, at, state, user = 'ad', pass = 'a', extra = {}) => {
  const s = SIZES[size]
  const b = await s.engine.launch()
  const ctx = await b.newContext({ ...s.opts, ...extra, deviceScaleFactor: 2, ...(state ? { storageState: state } : {}) })
  await serveFrozen(ctx, URL)
  const page = await newPage(ctx, size, at)
  await signIn(page, user, pass)
  return { b, ctx, page, tap: s.tap }
}
async function newPage(ctx, size, at) {
  const page = await ctx.newPage()
  await page.clock.install({ time: at })
  page.on('pageerror', e => errs.push(`[${size}] page error ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${size}] console ${m.text().slice(0, 240)}`) })
  page.on('dialog', d => d.dismiss().catch(() => {}))
  await page.goto(URL)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  return page
}
async function signIn(page, user, pass) {
  await page.waitForSelector('#luser')
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await sleep(1200)
}
const go = async (page, p) => { await page.evaluate(p => window.go(p), p); await page.waitForFunction(p => window.CURPAGE === p, p); await sleep(500) }
async function press(page, tap, sel) {
  const l = page.locator(sel).filter({ visible: true }).last()
  if (!(await l.count())) throw new Error('premise: nothing to press — ' + sel)
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (tap) await l.tap(); else await l.click()
  await sleep(tap ? 650 : 300)
}
const sheet = '.bidsheet[role="dialog"]'
const sheetUp = page => page.locator(sheet).filter({ visible: true }).count()
async function closeSheets(page) {
  for (let i = 0; i < 4; i++) { const x = page.locator(`${sheet} button.x:visible`).last(); if (!(await x.count())) break; await x.click().catch(() => {}); await sleep(350) }
}
async function lwOpen(page) {
  await go(page, 'leavewar')
  await page.waitForSelector('[data-testid="lw-tab-grid"]', { timeout: 20000 }); await sleep(300)
  const grid = page.locator('[data-testid="lw-tab-grid"]').filter({ visible: true })
  if ((await grid.count()) && (await grid.first().getAttribute('aria-selected')) !== 'true') { await grid.first().click(); await sleep(600) }
  await page.waitForSelector('[data-testid^="row-"]', { timeout: 20000 }); await sleep(500)
  const bar = page.locator('[data-testid="figures-toggle"]')
  if ((await bar.count()) && (await bar.getAttribute('aria-expanded')) === 'true') { await bar.click(); await sleep(300) }
  const m = page.locator('[data-testid="month-NOV"]:visible').first()
  if (await m.count()) { await m.click(); await sleep(900) }
}
async function tapCell(page, tap, id, iso = ISO) {
  const c = page.locator(`[data-testid="cell-${id}-${iso}"]`).first()
  if (!(await c.count())) throw new Error(`premise: no box for ${id} on ${iso}`)
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  const at = await c.evaluate(e => { const b = e.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2; const h = document.elementFromPoint(x, y); return { x, y, ok: !!h && (h === e || e.contains(h)) } })
  if (!at.ok) throw new Error(`premise: ${id} ${iso} is covered`)
  if (tap) await page.touchscreen.tap(at.x, at.y); else await page.mouse.click(at.x, at.y)
  await sleep(700)
}
async function postOut(page, tap, id, outcome, iso = ISO) {
  await tapCell(page, tap, id, iso)
  await press(page, tap, `${sheet} [data-testid="bid-more"]`)
  await press(page, tap, '[data-testid="bid-postout"]')
  if (outcome === 'none') await press(page, tap, `${sheet} [data-testid="po-overseas"]`)
  else if (outcome !== 'overseas') await press(page, tap, `${sheet} [data-testid="po-${outcome}"]`)
  await press(page, tap, `${sheet} [data-testid="po-confirm"]`)
  if (outcome === 'delete') await press(page, tap, '[data-testid="po-delete-go"]')
  await sleep(600); await closeSheets(page)
}
/* the posting sheet, the way an admin reaches it: his posting date's box (or, for a man with no row from his date, a day
   of his still here), then — where that day opens the bid sheet — its ⋯ → Post out */
async function postingSheet(page, tap, id, dbg) {
  /* the ways an admin reaches a man's posting sheet: his posting date's box; a day inside his posting (a PO box); a day of
     his still here, then its ⋯ → Post out. Each tried in turn, the way taken logged */
  const undoUp = () => page.locator('[data-testid="postout-undo"]').filter({ visible: true }).count()
  const tries = []
  if (await page.locator(`[data-testid="cell-${id}-${ISO}"]`).count()) tries.push([ISO, false])
  const poDay = await page.evaluate(id => { const c = [...document.querySelectorAll(`[data-testid^="cell-${id}-2026-11-"]`)].reverse().find(c => /^PO/.test(c.textContent.trim())); return c ? c.getAttribute('data-testid').slice(`cell-${id}-`.length) : null }, id)
  if (poDay) tries.push([poDay, false])
  if (await page.locator(`[data-testid="cell-${id}-${ISO}"]`).count()) tries.push([ISO, true])
  tries.push([EARLY, true])
  for (const [iso, more] of tries) {
    await closeSheets(page)
    try {
      await tapCell(page, tap, id, iso)
      if (more && !(await undoUp())) { await press(page, tap, `${sheet} [data-testid="bid-more"]`); await press(page, tap, '[data-testid="bid-postout"]') }
    } catch (e) { say(`[postingSheet] ${id} ${iso}${more ? ' ⋯' : ''}: ${e.message}`); continue }
    if (await undoUp()) { say(`[postingSheet] ${id}: reached by ${iso}${more ? ' then ⋯ → Post out' : ''}`); return 1 }
    if (dbg) await shot(page, dbg.size, `${dbg.name}-${iso}${more ? '-more' : ''}`)
  }
  return 0
}
async function undoPosting(page, tap, id) {
  const door = await postingSheet(page, tap, id, { size: 'dbg', name: 'nodoor-' + id })
  if (!door) return false
  await press(page, tap, '[data-testid="postout-undo"]')
  await sleep(500); await closeSheets(page)
  return true
}
const bellBtn = page => page.locator('.bellbtn').filter({ visible: true }).first()
const bellUp = page => page.locator('[data-testid="bell-list"]').isVisible().catch(() => false)
async function openBell(page, tap) {
  if (await bellUp(page)) return
  if (tap) await bellBtn(page).tap(); else await bellBtn(page).click()
  await page.waitForSelector('[data-testid="bell-list"]'); await sleep(450)
}
async function closeBell(page, tap) { if (await bellUp(page)) { if (tap) await bellBtn(page).tap(); else await bellBtn(page).click(); await sleep(300) } }
async function neutral(page, tap) {
  await page.evaluate(() => { const a = document.activeElement; if (a && a !== document.body) a.blur() })
  if (!tap) await page.mouse.move(2, 400)
  await sleep(150)
}
const shot = (page, size, name) => page.screenshot({ path: join(OUT, `${name}-${size}.png`) })
async function bellShot(page, size, name) {
  const box = await page.locator('[data-testid="bell-list"]').boundingBox()
  const vw = page.viewportSize().width
  if (box) await page.screenshot({ path: join(OUT, `${name}-${size}.png`), clip: { x: Math.max(0, box.x - 12), y: Math.max(0, box.y - 12), width: Math.min(vw - Math.max(0, box.x - 12), box.width + 24), height: box.height + 24 } })
}
/* the bell's lines as drawn: the struck words (and whether the browser draws them struck), the rest, unread */
const lines = page => page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].map(l => {
  const w = l.querySelector('.bl-what'), s = w.querySelector('.bl-struck')
  return { id: l.getAttribute('data-testid').slice('bell-line-'.length), name: l.querySelector('.bl-name').textContent, day: l.querySelector('.bl-day').textContent,
    what: w.textContent, struck: s ? s.textContent : null, through: s ? getComputedStyle(s).textDecorationLine : null,
    unread: l.classList.contains('unread'), whatCut: w.scrollWidth > w.clientWidth + 1, h: Math.round(l.getBoundingClientRect().height) }
}))
const about = (ls, cs) => ls.filter(l => l.name === cs && /Posted out/.test(l.what))
const plainPo = (ls, cs) => about(ls, cs).filter(l => l.struck == null)
const backs = (ls, cs) => about(ls, cs).filter(l => l.struck != null)
async function tapLine(page, size, tap, id, pic) {
  const l = page.locator(`[data-testid="bell-line-${id}"]`)
  await l.scrollIntoViewIfNeeded().catch(() => {})
  const b = await l.boundingBox()
  if (tap) { await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await sleep(90); if (pic) await shot(page, size, pic + '-lift') }
  else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  await sleep(800)
}
/* the ringed row on Admin → Users: in view, under the top bar, uncovered */
const ringState = (page, pid) => page.evaluate(pid => {
  const r = [...document.querySelectorAll(`#page-admin .acc-row[data-person="${pid}"]`)].find(x => x.getBoundingClientRect().height > 0)
  if (!r) return null
  const b = r.getBoundingClientRect(), bar = document.querySelector('.topbar'), barBottom = bar ? bar.getBoundingClientRect().bottom : 0
  const hit = document.elementFromPoint(b.left + 12, b.top + Math.min(8, b.height / 2))
  return { page: window.CURPAGE, ringed: r.classList.contains('acc-ring'), top: Math.round(b.top), bottom: Math.round(b.bottom), vh: innerHeight, barBottom: Math.round(barBottom), uncovered: !!hit && (hit === r || r.contains(hit)) }
}, pid)
const landedOk = r => !!r && r.page === 'admin' && r.ringed && r.uncovered && r.top >= r.barBottom && r.bottom <= r.vh
async function adminUsers(page, tap) {
  await go(page, 'admin')
  const users = page.locator('.adm-cat').filter({ hasText: 'Users' }).first()
  if (await users.count()) { if (tap) await users.tap(); else await users.click(); await sleep(600) }
}
async function makeHexAdmin(page, tap) {
  await adminUsers(page, tap)
  await press(page, tap, '#page-admin .acc-row[data-person="rocky"] .acc-tap')
  await page.selectOption('#accEdRole', 'admin'); await sleep(200)
  await press(page, tap, '#accEdSave')
  return page.evaluate(() => /Admin/.test(document.querySelector('#page-admin .acc-row[data-person="rocky"]')?.textContent || ''))
}
const person = (page, id) => page.evaluate(id => { const p = window.PEOPLE[id]; return p ? { cs: p.cs, san: !!p.san, sanBy: p.sanBy || null, archived: !!p.archived, deleted: !!p.deleted } : null }, id)
/* the grid's own name puck for a man: its class, the SANS line drawn (by its pseudo-element) and whether a "SANS" tag stands */
const pucks = (page, id) => page.evaluate(id => [...document.querySelectorAll(`[data-testid="row-${id}"] .who .puck, tr[data-band-id="${id}"] .who .puck`)]
  .filter(p => p.getBoundingClientRect().width > 0).map(p => {
    const nm = p.querySelector('.nm'), a = getComputedStyle(p, '::after'), b = p.getBoundingClientRect()
    /* the line is the pseudo-element drawn: its content and a width (4px, less where the grid is zoomed out) */
    const onScreen = b.left >= 0 && b.right <= innerWidth && b.top >= 0 && b.bottom <= innerHeight
    return { where: p.closest('tr[data-band-id]') ? 'frozen' : 'row', san: p.classList.contains('san'), line: a.content !== 'none' && parseFloat(a.width) >= 2, lineW: a.width,
      name: nm.textContent, nameWhole: nm.scrollWidth <= nm.clientWidth + 1, x: b.left, y: b.top, w: b.width, h: b.height, onScreen }
  }), id)
const tagCount = page => page.evaluate(() => document.querySelectorAll('.po-sans-tag').length)

/* ---------- pixels (lesson 22) ---------- */
/* the longest run of "ink" along any one pixel row of a box, as a share of its width — a strike line spans the words, a
   letter row never does. And the purple pixels in the right 6px of a puck. Decoded inside the page from a picture of it. */
async function pixelsOf(page, box) {
  const buf = await page.screenshot({ clip: { x: box.x, y: box.y, width: Math.max(1, box.width), height: Math.max(1, box.height) } })
  return page.evaluate(async b64 => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode()
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height
    const g = c.getContext('2d'); g.drawImage(img, 0, 0)
    const d = g.getImageData(0, 0, c.width, c.height).data
    const bg = [d[0], d[1], d[2]]
    let best = 0, purple = 0
    for (let y = 0; y < c.height; y++) {
      let run = 0
      for (let x = 0; x < c.width; x++) {
        const i = (y * c.width + x) * 4, r = d[i], gg = d[i + 1], bb = d[i + 2]
        const ink = Math.abs(r - bg[0]) + Math.abs(gg - bg[1]) + Math.abs(bb - bg[2]) > 120
        run = ink ? run + 1 : 0; if (run > best) best = run
        if (bb > 180 && r > 140 && bb - gg > 60 && r - gg > 30) purple++
      }
    }
    return { runShare: +(best / c.width).toFixed(2), purple, w: c.width, h: c.height }
  }, buf.toString('base64'))
}
const strikePixels = async (page, id) => {
  const s = page.locator(`[data-testid="bell-line-${id}"] .bl-struck`)
  if (!(await s.count())) return null
  return pixelsOf(page, await s.boundingBox())
}
/* the calibration: the same measure on a line's unstruck words */
const plainPixels = async (page, id) => {
  const s = page.locator(`[data-testid="bell-line-${id}"] .bl-name`)
  return pixelsOf(page, await s.boundingBox())
}
async function puckPixels(page, id) {
  const all = await pucks(page, id)
  const pk = all.find(p => p.onScreen && p.where === 'frozen') || all.find(p => p.onScreen)
  if (!pk) return null
  return pixelsOf(page, { x: pk.x + pk.w - 6, y: pk.y, width: 6, height: pk.h })
}

/* ---------- fixtures, each made through the app's own controls ---------- */
async function baseWorld(size) {
  const { b, ctx, page, tap } = await open(size, BEFORE)
  const ok = await makeHexAdmin(page, tap)
  check(size, 'F0', ok, 'Hex made an admin on Admin → Users')
  await lwOpen(page)
  const men = await page.evaluate(() => {
    const onGrid = new Set([...document.querySelectorAll('[data-testid^="row-"]')].map(r => r.getAttribute('data-testid').slice(4)))
    return Object.keys(window.PEOPLE).filter(id => { const p = window.PEOPLE[id]; return onGrid.has(id) && !p.special && !p.archived && !p.san && !p.deleted && !p.pers && !['bane', 'stiff', 'rocky', 'casper'].includes(id) })
  })
  const st = await ctx.storageState(); await b.close()
  return { st, men }
}
async function saberPosts(size, st, posts, at = BEFORE) {
  const { b, ctx, page, tap } = await open(size, at, st)
  await lwOpen(page)
  for (const [id, o] of posts) await postOut(page, tap, id, o)
  const st2 = await ctx.storageState(); await b.close(); return st2
}
async function hexReads(size, st, how, at = RUN) {
  const { b, ctx, page, tap } = await open(size, at, st, 'hex', 'x')
  await openBell(page, tap)
  const ls = await lines(page)
  const rl = about(ls, 'Ranger')[0]
  if (how === 'tap' && rl) await tapLine(page, size, tap, rl.id)
  if (how === 'markall') await press(page, tap, '[data-testid="bell-markall"]')
  const st2 = await ctx.storageState(); await b.close()
  return { st: st2, before: ls }
}


/* a picture cut round an element, with room around it */
async function around(page, sel, name, pad = 40, extraW = 0) {
  const l = page.locator(sel).filter({ visible: true }).first()
  if (!(await l.count())) { say('no ' + sel); return }
  await l.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
  const b = await l.boundingBox(), vp = page.viewportSize()
  const x = Math.max(0, b.x - pad), y = Math.max(0, b.y - pad)
  await page.screenshot({ path: join(OUT, name + '.png'), clip: { x, y, width: Math.min(vp.width - x, b.width + 2 * pad + extraW), height: Math.min(vp.height - y, b.height + 2 * pad) } })
}
for (const size of ['desk', 'phone']) {
  const { st: base } = await baseWorld(size)
  /* Q2: Balances and Approvals, before his date and after it ran */
  const posted = await saberPosts(size, base, [['bane', 'sans']])
  for (const [when, at] of [['before', BEFORE], ['after', later(5)]]) {
    const { b, page, tap } = await open(size, at, posted)
    await lwOpen(page)
    await neutral(page, tap)
    await around(page, `[data-testid="row-bane"] .who`, `q2-grid-${when}-${size}`, 30, size === 'desk' ? 200 : 0)
    for (const [tab, name, sel] of [['lw-tab-balances', 'balances', '[data-testid="bal-name-bane"]'], ['lw-tab-approvals', 'approvals', '[data-testid="appr-line-bane"]']]) {
      const t = page.locator(`[data-testid="${tab}"]`).filter({ visible: true })
      if (!(await t.count())) continue
      if (tap) await t.first().tap(); else await t.first().click(); await sleep(900)
      await neutral(page, tap)
      await around(page, sel, `q2-${name}-${when}-${size}`, 30, size === 'desk' ? 300 : 0)
    }
    await b.close()
  }
  if (size !== 'desk') continue
  /* Q4: a posting that ran, its date moved later: the sheet says what happens now; the bell still says it happened */
  const { st: stR } = await hexReads(size, posted, 'tap')
  const { b, page, tap } = await open(size, later(10), stR)
  await lwOpen(page); await postingSheet(page, tap, 'bane')
  await press(page, tap, '[data-testid="postout-date"]')
  await press(page, tap, '[data-testid="dcal-day-2026-11-18"]')
  await neutral(page, tap)
  await around(page, '[data-testid="postout-sheet"]', 'q4-sheet-after-move-desk', 16)
  await closeSheets(page)
  await openBell(page, tap); await neutral(page, tap)
  say('Q4 bell: ' + JSON.stringify(about(await lines(page), 'Ranger').map(l => [l.what, l.day])))
  await bellShot(page, size, 'q4-bell-after-move')
  await b.close()
}
writeFileSync(join(OUT, 'look-log.json'), JSON.stringify({ log, errs }, null, 2))
say('errors: ' + (errs.length ? errs.join(' | ') : 'none'))
