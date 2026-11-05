// [NOTICE-UNDO-RETRACT] step 1 and [PO-SANS-PUCK-EDGE] — THE WALK (D1693, D1697–D1699), on the frozen build of
// claude/postout-bell-look at 3a181dbd8. The scenarios are the fresh scenario designer's
// (docs/handpass/parts/tb1105/scenarios.md, S1–S21); each step asserts the RIGHT behaviour, so a re-run is the re-walk.
// Built on the posting walks' own controls (pbw-walk.mjs, pbw-walk2.mjs, the drawing's draw.mjs): his PC's 1536 × 864
// (Chromium, a mouse) and his iPhone's 402 × 874 (WebKit, touch — a picture right after each deciding tap, §7.10).
// Saber = ad/a, Hex = hex/x (made an admin on Admin → Users first, so "every admin" is two), Ranger = us/us (bane).
// The struck line is judged by its PIXELS (lesson 22): the longest run of drawn ink along one pixel row of the struck words,
// against the same measure on an unstruck line (the calibration — a stand-in is believed only once calibrated, §7.9).
// Usage (from raptor-port/): WALK_DIR=<frozen dist> [TBW_OUT=<folder>] [ONLY=desk|phone] [STAGES=S1,S2,…] node scripts/handpass/tbw-walk.mjs
import { chromium, webkit } from '@playwright/test'
import { mkdirSync, writeFileSync, readdirSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { serveFrozen } from './isr-serve.mjs'

console.log('[tbw-walk v2 — after the reads fixes and D1709]')
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.env.TBW_OUT || join(HERE, '../../docs/img/handpass/2026-11-05-taken-back-sans')
mkdirSync(OUT, { recursive: true })
if (!process.env.STAGES && !process.env.ONLY) for (const f of readdirSync(OUT)) if (/\.(png|json)$/.test(f)) rmSync(join(OUT, f))
const URL = 'http://localhost:4395/'
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

const report = {}
for (const size of (process.env.ONLY ? [process.env.ONLY] : ['desk', 'phone'])) {
  const desk = size === 'desk'
  const { st: base, men } = await baseWorld(size)
  const X = men[7], Y = men[8]              // two men without a sign-in: off the manpower, deleted
  const csX = await (async () => { const { b, page } = await open(size, BEFORE, base); const c = await person(page, X); await b.close(); return c.cs })()
  say(`[${size}] the men: Ranger (bane), ${csX} (${X}), ${Y}`)

  /* ===== S1 the plain-user round (§7.0a): post out, close the sheet each way, Undo post out before the date ===== */
  if (want('S1')) {
    let { b, ctx, page, tap } = await open(size, BEFORE, base)
    await lwOpen(page)
    await postOut(page, tap, 'bane', 'sans')
    let pk = await pucks(page, 'bane')
    check(size, 'S1a', pk.length && pk.every(p => p.san && p.line) && (await tagCount(page)) === 0, `posted out as SANS from 16 Nov: his name wears the purple line from now, no "SANS" tag (${JSON.stringify(pk.map(p => [p.where, p.san, p.line, p.nameWhole]))})`)
    await neutral(page, tap); await shot(page, size, 's1a-posted-sans-line')
    const ways = desk ? ['x', 'escape', 'outside'] : ['x', 'outside']
    for (const w of ways) {
      await postingSheet(page, tap, 'bane')
      const up = await sheetUp(page)
      if (w === 'x') await press(page, tap, '[data-testid="postout-cancel"]')
      if (w === 'escape') { await page.keyboard.press('Escape'); await sleep(400) }
      if (w === 'outside') { const vp = page.viewportSize(); if (tap) await page.touchscreen.tap(vp.width - 10, 120); else await page.mouse.click(vp.width - 10, 120); await sleep(500) }
      const gone = !(await sheetUp(page)), still = await page.locator('[data-testid="row-bane"]').count()
      check(size, `S1b-${w}`, up && gone && still && (await person(page, 'bane')) && (await pucks(page, 'bane')).every(p => p.san), `the posting sheet closed by ${w}: gone, the grid and his posting as they were`)
    }
    if (!desk) record(size, 'S1b-swipe', 'the phone has no swipe-down to close the posting sheet (a sheet, not a pull-up panel) — nothing to walk')
    await postingSheet(page, tap, 'bane'); await neutral(page, tap); await shot(page, size, 's1c-posting-sheet')
    await press(page, tap, '[data-testid="postout-undo"]'); await sleep(400)
    const sheetAfter = await sheetUp(page)
    await closeSheets(page)
    pk = await pucks(page, 'bane')
    await tapCell(page, tap, 'bane')
    const reopened = await page.locator('[data-testid="postout-undo"]').filter({ visible: true }).count()
    const bidSheet = await page.locator(`${sheet} [data-testid="bid-more"]`).filter({ visible: true }).count()
    await closeSheets(page)
    check(size, 'S1c', pk.length && pk.every(p => !p.san) && (await tagCount(page)) === 0, `Undo post out before the date: his name loses the purple line (sheet left ${sheetAfter ? 'open' : 'closed'}; his day now opens the ${bidSheet ? 'bid sheet' : '?'}${reopened ? ', a posting sheet still?' : ''})`)
    await neutral(page, tap); await shot(page, size, 's1c-after-undo-row')
    await openBell(page, tap)
    const bl = about(await lines(page), 'Ranger')
    check(size, 'S1d', bl.length === 0, `a posting undone before its date told nobody: no line in Saber's bell (${bl.length})`)
    await closeBell(page, tap)
    /* every other place that should show the result (D1557) — and the gap the designer named: Balances, Approvals and the
       day panel draw the schedule's own puck, so the line there only once he IS SANS */
    await postOut(page, tap, 'bane', 'sans')
    for (const [tab, name] of [['lw-tab-balances', 'balances'], ['lw-tab-approvals', 'approvals']]) {
      const t = page.locator(`[data-testid="${tab}"]`).filter({ visible: true })
      if (!(await t.count())) { record(size, `S1e-${name}`, 'tab not shown'); continue }
      if (tap) await t.first().tap(); else await t.first().click(); await sleep(900)
      const sanThere = await page.evaluate(() => [...document.querySelectorAll('#page-leavewar .puck')].filter(p => p.getBoundingClientRect().width > 0 && (p.querySelector('.nm') || p).textContent.trim() === 'Ranger').map(p => ({ san: p.classList.contains('san'), where: (p.closest('[data-testid]') || {}).getAttribute?.('data-testid') })))
      record(size, `S1e-${name}`, `before his date, his puck on ${name}: ${JSON.stringify(sanThere)} (the line only once he IS SANS — the designer's gap, shown to him side by side)`)
      await neutral(page, tap); await shot(page, size, `s1e-${name}-before-date`)
    }
    await lwOpen(page)
    await adminUsers(page, tap)
    const tag = await page.evaluate(() => document.querySelector('[data-testid="po-tag-bane"]')?.textContent || null)
    record(size, 'S1f', `Admin → Users: his row reads "${tag}"`)
    await shot(page, size, 's1f-admin-users')
    for (const p of ['editsched', 'inputs', 'quals']) { await go(page, p); await sleep(400) }
    await lwOpen(page)
    const pkBack = await pucks(page, 'bane')
    check(size, 'S1g', pkBack.length && pkBack.every(p => p.san && p.line), 'back on the Leave War by its tab after four pages: his line drawn at once')
    await neutral(page, tap); await shot(page, size, 's1g-back-on-grid')
    await b.close()
  }

  /* ===== the main chain: posted SANS, Hex taps his line, Saber's Undo post out ===== */
  const posted = await saberPosts(size, base, [['bane', 'sans']])
  let stUndone = null
  if (want('S2') || want('S7') || want('S8') || want('S9') || want('S11') || want('S18')) {
    const { st: stRead, before } = await hexReads(size, posted, 'tap')
    check(size, 'S2a', plainPo(before, 'Ranger').length === 1 && plainPo(before, 'Ranger')[0].unread, `on 16 Nov Hex's bell has Ranger's "Posted out · now SANS", unread (${JSON.stringify(about(before, 'Ranger').map(l => l.what))})`)
    let { b, ctx, page, tap } = await open(size, later(10), stRead)
    await lwOpen(page)
    const pk0 = await pucks(page, 'bane'), px0 = await puckPixels(page, 'bane')
    check(size, 'S2b', pk0.length && pk0.every(p => p.san && p.line) && px0 && px0.purple > 6, `after the run his name on the grid wears the purple line (pixels: ${px0 && px0.purple} purple in its right 6px)`)
    await neutral(page, tap); await shot(page, size, 's2b-ran-line')
    const door = await undoPosting(page, tap, 'bane')
    const p1 = await person(page, 'bane'), pk1 = await pucks(page, 'bane')
    check(size, 'S2c', door && p1 && !p1.san && pk1.every(p => !p.san), `Undo post out on his sheet: his SANS tick gone, no purple line (door ${door ? 'found' : 'MISSING'}; ${JSON.stringify(p1)})`)
    await neutral(page, tap); await shot(page, size, 's2c-after-undo-row')
    await openBell(page, tap)
    const sab = about(await lines(page), 'Ranger')
    check(size, 'S2d', sab.length === 0, `Saber pressed it: his own bell has neither line (${JSON.stringify(sab.map(l => l.what))})`)
    await neutral(page, tap); await bellShot(page, size, 's2d-saber-bell')
    await closeBell(page, tap)
    stUndone = await ctx.storageState()
    /* S9 (desk): the top bar's Undo / Redo right after — a posting is no Undo step (D350) */
    if (desk && want('S9')) {
      for (const k of ['Undo', 'Redo']) {
        const btn = page.locator(`[aria-label="${k}"]`).filter({ visible: true }).first()
        const on = await btn.isEnabled().catch(() => false)
        if (on) { await btn.click(); await sleep(600) }
        record(size, `S9-${k}`, `the top bar's ${k} ${on ? 'pressed' : 'greyed'}: Ranger ${JSON.stringify(await person(page, 'bane'))}`)
      }
      const pb = await person(page, 'bane')
      check(size, 'S9a', pb && !pb.san, 'the top bar\'s Undo / Redo bring no posting back')
      await page.reload(); await signIn(page, 'ad', 'a'); await sleep(800)
      await lwOpen(page)
      const pr = await person(page, 'bane'), pkr = await pucks(page, 'bane')
      check(size, 'S9b', pr && !pr.san && pkr.every(p => !p.san), `a reload changes nothing (${JSON.stringify(pr)})`)
      stUndone = await ctx.storageState()
    }
    /* S18 (desk): the changes window */
    if (desk && want('S18')) {
      await go(page, 'editsched')
      const hb = page.locator('#histBtn').filter({ visible: true })
      if (await hb.count()) {
        await hb.first().click(); await sleep(800)
        const txt = await page.evaluate(() => { const w = document.querySelector('.chgwin:not([hidden])'); return w ? w.innerText.replace(/\s+/g, ' ').slice(0, 900) : null })
        record(size, 'S18', `the changes window after Undo post out: ${txt}`)
        await shot(page, size, 's18-changes-window')
        await hb.first().click(); await sleep(300)
      } else record(size, 'S18', 'no changes clock on Edit Schedule here')
    }
    await b.close()

    /* Hex's bell: one line, struck, unread, wrapping, by the pixels */
    ;({ b, ctx, page, tap } = await open(size, later(20), stUndone, 'hex', 'x'))
    const lit = await bellBtn(page).evaluate(e => e.classList.contains('on'))
    await openBell(page, tap); await neutral(page, tap)
    let ls = await lines(page)
    const bk = backs(ls, 'Ranger'), pl = plainPo(ls, 'Ranger')
    const L = bk[0]
    check(size, 'S2e', lit && bk.length === 1 && pl.length === 0 && L.unread, `Hex's bell lit; one line about Ranger, unread, and no "Posted out" line left (${JSON.stringify(about(ls, 'Ranger').map(l => [l.what, l.unread]))})`)
    check(size, 'S2f', L && L.struck === 'Posted out · now SANS' && L.what === 'Posted out · now SANS · taken back · Saber' && /line-through/.test(L.through || '') && L.day === 'Mon 16 Nov', `its words: "${L && L.what}", struck "${L && L.struck}" (${L && L.through}), ${L && L.day}`)
    const sp = L ? await strikePixels(page, L.id) : null, cal = L ? await plainPixels(page, L.id) : null
    check(size, 'S2g', sp && cal && sp.runShare >= 0.85 && cal.runShare < 0.5, `the strike is DRAWN: the longest ink run across the struck words is ${sp && sp.runShare} of their width; the calibration on unstruck words ${cal && cal.runShare}`)
    check(size, 'S2h', L && !L.whatCut, `"taken back · Saber" never cut: the line wraps (height ${L && L.h}px)`)
    await bellShot(page, size, 's2e-hex-bell-struck')
    await page.locator(`[data-testid="bell-line-${L?.id}"] .bl-struck`).screenshot({ path: join(OUT, `s2g-strike-close-${size}.png`) }).catch(() => {})
    /* S7: the taken-back line tapped from each page lands on his row on Admin → Users, ringed, uncovered */
    const fromPages = desk ? ['leavewar', 'leavewar:balances', 'leavewar:approvals', 'editsched', 'inputs', 'admin'] : ['leavewar', 'inputs']
    for (const from of fromPages) {
      await closeBell(page, tap)
      const [pg, sub] = from.split(':')
      if (pg === 'leavewar') { await lwOpen(page); if (sub) { const t = page.locator(`[data-testid="lw-tab-${sub}"]`).filter({ visible: true }); if (await t.count()) { if (tap) await t.first().tap(); else await t.first().click(); await sleep(700) } } }
      else if (pg === 'admin') await adminUsers(page, tap)
      else await go(page, pg)
      await openBell(page, tap)
      ls = await lines(page)
      const tl = backs(ls, 'Ranger')[0]
      if (!tl) { check(size, `S7-${from}`, false, 'the taken-back line is not in the list'); continue }
      await tapLine(page, size, tap, tl.id, `s7-${from.replace(':', '-')}`)
      await sleep(300)
      const r = await ringState(page, 'bane')
      check(size, `S7-${from}`, landedOk(r), `tapped from ${from}: Admin → Users at Ranger's row, ringed, in view and uncovered (${JSON.stringify(r)})`)
      await neutral(page, tap); await shot(page, size, `s7-landing-from-${from.replace(':', '-')}`)
      await page.clock.runFor(6500); await sleep(300)
    }
    ls = await lines(page).catch(() => [])
    /* back to the Leave War by its tab: drawn at once (lesson 10) */
    await go(page, 'leavewar'); await sleep(200)
    const drawn = await page.evaluate(() => { const c = document.querySelector('[data-testid="cell-bane-2026-11-16"]'); return !!c && c.getBoundingClientRect().width > 0 })
    check(size, 'S7-back', drawn, 'back on the Leave War by its tab: his row drawn at once, without a touch')
    await shot(page, size, 's7-back-on-leavewar')
    /* S8 (desk): the member view hides both posting lines; back, they return as left */
    if (desk && want('S8')) {
      await openBell(page, tap); const before8 = about(await lines(page), 'Ranger'); await closeBell(page, tap)
      await page.locator('#roleBadge').click(); await sleep(600)
      await openBell(page, tap); const m = about(await lines(page), 'Ranger'); await shot(page, size, 's8-member-view'); await closeBell(page, tap)
      await page.locator('#roleBadge').click(); await sleep(600)
      await openBell(page, tap); const a = about(await lines(page), 'Ranger')
      check(size, 'S8', m.length === 0 && a.length === before8.length && a.every((l, i) => l.unread === before8[i].unread), `member view: no posting line (${m.length}); back as admin: ${a.length} as left (${JSON.stringify(a.map(l => [l.struck != null, l.unread]))})`)
      await closeBell(page, tap)
    }
    await b.close()
  }

  /* ===== S3 not read: Hex never opens it ===== */
  if (want('S3') && desk) {
    let { b, ctx, page, tap } = await open(size, RUN, posted)
    await lwOpen(page); const door = await undoPosting(page, tap, 'bane')
    const st = await ctx.storageState(); await b.close()
    ;({ b, ctx, page, tap } = await open(size, later(5), st, 'hex', 'x'))
    await openBell(page, tap); const ls = about(await lines(page), 'Ranger')
    check(size, 'S3', door && ls.length === 0, `never read: after the Undo Hex's bell has neither line (${JSON.stringify(ls.map(l => l.what))})`)
    await neutral(page, tap); await bellShot(page, size, 's3-hex-never-read')
    await b.close()
  }

  /* ===== S4 read by "Mark all read" ===== */
  if (want('S4')) {
    const { st: stM } = await hexReads(size, posted, 'markall')
    let { b, ctx, page, tap } = await open(size, later(10), stM)
    await lwOpen(page); await undoPosting(page, tap, 'bane')
    const st = await ctx.storageState(); await b.close()
    ;({ b, ctx, page, tap } = await open(size, later(20), st, 'hex', 'x'))
    await openBell(page, tap); await neutral(page, tap)
    const ls = await lines(page), bk = backs(ls, 'Ranger')
    check(size, 'S4', bk.length === 1 && bk[0].unread && plainPo(ls, 'Ranger').length === 0, `read by Mark all read: one struck line, unread (${JSON.stringify(about(ls, 'Ranger').map(l => [l.what, l.unread]))})`)
    await bellShot(page, size, 's4-markall-struck')
    await b.close()
  }

  /* ===== S5 roles swapped: Saber read his line, Hex presses Undo ===== */
  if (want('S5') && desk) {
    let { b, ctx, page, tap } = await open(size, RUN, posted)
    await openBell(page, tap); const rl = plainPo(await lines(page), 'Ranger')[0]
    if (rl) await tapLine(page, size, tap, rl.id)
    let st = await ctx.storageState(); await b.close()
    ;({ b, ctx, page, tap } = await open(size, later(10), st, 'hex', 'x'))
    await lwOpen(page); const door = await undoPosting(page, tap, 'bane')
    await openBell(page, tap); const hx = about(await lines(page), 'Ranger')
    st = await ctx.storageState(); await b.close()
    ;({ b, ctx, page, tap } = await open(size, later(20), st))
    await openBell(page, tap); await neutral(page, tap)
    const sb = about(await lines(page), 'Ranger')
    check(size, 'S5', door && hx.length === 0 && sb.length === 1 && sb[0].what === 'Posted out · now SANS · taken back · Hex' && sb[0].unread, `Hex pressed it: Hex's bell nothing (${hx.length}); Saber's "${sb[0] && sb[0].what}"`)
    await bellShot(page, size, 's5-saber-bell-by-hex')
    await b.close()
  }

  /* ===== S6 the other outcomes: Overseas (Ranger), off the manpower (X), Delete (Y) ===== */
  if (want('S6') && desk) {
    const st0 = await saberPosts(size, base, [['bane', 'overseas'], [X, 'none'], [Y, 'delete']])
    const { st: stR } = await hexReads(size, st0, 'markall')
    let { b, ctx, page, tap } = await open(size, later(10), stR)
    await lwOpen(page)
    const d1 = await undoPosting(page, tap, 'bane')
    const d2 = await undoPosting(page, tap, X)
    /* a deleted man keeps his row for his months here (D299, D325) — his posting sheet must offer no Undo (D287: final) */
    const yRow = await page.locator(`[data-testid="row-${Y}"]`).count()
    const yUndo = yRow ? await postingSheet(page, tap, Y) : 0
    await closeSheets(page)
    const pb = await person(page, 'bane'), py = await person(page, Y)
    check(size, 'S6a', d1 && pb && !pb.archived, `Overseas Sqn ran (archived, suspended); its Undo post out found through his day before the date, and he is back (${JSON.stringify(pb)})`)
    check(size, 'S6b', d2, `off the manpower: its Undo post out found (door ${d2 ? 'found' : 'MISSING'})`)
    check(size, 'S6c', py && py.deleted && !yUndo, `Delete ran: ${yRow ? 'his row kept for his months here (D299)' : 'no row'}, and no Undo post out offered by any of its doors (${JSON.stringify(py)})`)
    await shot(page, size, 's6-grid-after-undos')
    const st = await ctx.storageState(); await b.close()
    ;({ b, ctx, page, tap } = await open(size, later(20), st, 'hex', 'x'))
    await openBell(page, tap); await neutral(page, tap)
    const ls = await lines(page)
    const r = backs(ls, 'Ranger')[0], x = backs(ls, csX)[0]
    const yLine = ls.filter(l => /Posted out · deleted/.test(l.what) && l.struck == null)
    check(size, 'S6d', r && r.what === 'Posted out · archived, account suspended · taken back · Saber' && r.unread && plainPo(ls, 'Ranger').length === 0, `Ranger's: "${r && r.what}"`)
    check(size, 'S6e', x && x.what === 'Posted out · off the manpower · taken back · Saber' && x.unread && plainPo(ls, csX).length === 0, `${csX}'s (worked out, not stored): "${x && x.what}"`)
    check(size, 'S6f', yLine.length === 1, `the deleted man's line stays as the record (${yLine.length})`)
    await bellShot(page, size, 's6-hex-bell-outcomes')
    await b.close()
    ;({ b, ctx, page, tap } = await open(size, later(30), st, 'us', 'us').catch(e => ({ b: null, err: e })))
    if (b) { check(size, 'S6g', await page.evaluate(() => !!document.querySelector('#vWeek .day')), 'after the Undo Ranger signs in again as us/us'); await shot(page, size, 's6g-ranger-signed-in'); await b.close() }
    else check(size, 'S6g', false, 'Ranger could not sign in after the Undo')
  }

  /* ===== S10 (phone): Undo pressed twice quickly ===== */
  if (want('S10') && !desk) {
    const { st: stR } = await hexReads(size, posted, 'tap')
    let { b, ctx, page, tap } = await open(size, later(10), stR)
    await lwOpen(page); await postingSheet(page, tap, 'bane')
    const u = page.locator('[data-testid="postout-undo"]').filter({ visible: true }).first()
    const bx = await u.boundingBox()
    await page.touchscreen.tap(bx.x + bx.width / 2, bx.y + bx.height / 2); await sleep(120)
    await page.touchscreen.tap(bx.x + bx.width / 2, bx.y + bx.height / 2); await sleep(90)
    await shot(page, size, 's10-after-double-tap-lift')
    await sleep(700); await closeSheets(page)
    const st = await ctx.storageState(); await b.close()
    ;({ b, ctx, page, tap } = await open(size, later(20), st, 'hex', 'x'))
    await openBell(page, tap); await neutral(page, tap)
    const ls = about(await lines(page), 'Ranger')
    check(size, 'S10', ls.length === 1 && ls[0].struck != null, `Undo tapped twice quickly: one taken-back line (${JSON.stringify(ls.map(l => l.what))})`)
    await bellShot(page, size, 's10-hex-bell')
    await b.close()
  }

  /* ===== S11 (desk): Undo, post again (it runs at once — today is his date), run again, undo again ===== */
  if (want('S11') && desk && stUndone) {
    let { b, ctx, page, tap } = await open(size, later(30), stUndone)
    await lwOpen(page); await postOut(page, tap, 'bane', 'sans')
    let st = await ctx.storageState(); await b.close()
    ;({ b, ctx, page, tap } = await open(size, later(40), st, 'hex', 'x'))
    await openBell(page, tap); let ls = await lines(page)
    const fresh = plainPo(ls, 'Ranger')
    check(size, 'S11a', fresh.length === 1 && fresh[0].unread && backs(ls, 'Ranger').length === 1, `posted again: a new unread "Posted out" line beside the taken-back one (${JSON.stringify(about(ls, 'Ranger').map(l => [l.what, l.unread]))})`)
    if (fresh[0]) await tapLine(page, size, tap, fresh[0].id)
    st = await ctx.storageState(); await b.close()
    ;({ b, ctx, page, tap } = await open(size, later(50), st))
    await lwOpen(page); await undoPosting(page, tap, 'bane')
    st = await ctx.storageState(); await b.close()
    ;({ b, ctx, page, tap } = await open(size, later(60), st, 'hex', 'x'))
    await openBell(page, tap); await neutral(page, tap); ls = await lines(page)
    const bk = backs(ls, 'Ranger')
    check(size, 'S11b', bk.length === 2 && plainPo(ls, 'Ranger').length === 0 && bk.filter(l => l.unread).length >= 1, `undone again: two taken-back lines, the first still there (${JSON.stringify(bk.map(l => [l.what, l.unread]))})`)
    await bellShot(page, size, 's11-two-taken-back')
    await b.close()
  }

  /* ===== S12 (desk): off the manpower undone, then set again for the same date ===== */
  if (want('S12') && desk) {
    const st0 = await saberPosts(size, base, [[X, 'none']])
    const { st: stR } = await hexReads(size, st0, 'markall')
    let { b, ctx, page, tap } = await open(size, later(10), stR)
    await lwOpen(page); await undoPosting(page, tap, X)
    await postOut(page, tap, X, 'none')
    const st = await ctx.storageState(); await b.close()
    ;({ b, ctx, page, tap } = await open(size, later(20), st, 'hex', 'x'))
    await openBell(page, tap); await neutral(page, tap)
    const ls = about(await lines(page), csX)
    const again = ls.filter(l => l.struck == null)
    check(size, 'S12', again.length === 1 && again[0].unread && ls.filter(l => l.struck != null).length === 1, `set again after its taken-back line: the line comes back UNREAD (${JSON.stringify(ls.map(l => [l.what, l.unread]))})`)
    await bellShot(page, size, 's12-set-again')
    await b.close()
  }

  /* ===== S12b (desk): the code read's 2 — Saber read his own off-the-manpower line, pressed Undo; Hex sets it again ===== */
  if (want('S12b') && desk) {
    const st0 = await saberPosts(size, base, [[X, 'none']])
    let { b, ctx, page, tap } = await open(size, RUN, st0)
    await openBell(page, tap); await press(page, tap, '[data-testid="bell-markall"]'); await closeBell(page, tap)
    await lwOpen(page); const door = await undoPosting(page, tap, X)
    let st = await ctx.storageState(); await b.close()
    ;({ b, ctx, page, tap } = await open(size, later(10), st, 'hex', 'x'))
    await lwOpen(page); await postOut(page, tap, X, 'none')
    st = await ctx.storageState(); await b.close()
    ;({ b, ctx, page, tap } = await open(size, later(20), st))
    const lit = await bellBtn(page).evaluate(e => e.classList.contains('on'))
    await openBell(page, tap); await neutral(page, tap)
    const ls = about(await lines(page), csX)
    check(size, 'S12b', door && lit && ls.length === 1 && ls[0].struck == null && ls[0].unread, `Saber pressed Undo on a line he had read; Hex set it again: Saber's bell lit, the line unread (${JSON.stringify(ls.map(l => [l.what, l.unread]))})`)
    await bellShot(page, size, 's12b-presser-sees-it-again')
    await b.close()
  }

  /* ===== S13 (desk): the posting's date moved after it ran, then Undo ===== */
  if (want('S13') && desk) {
    const { st: stR } = await hexReads(size, posted, 'tap')
    let { b, ctx, page, tap } = await open(size, later(10), stR)
    await lwOpen(page); await postingSheet(page, tap, 'bane')
    let moved = false
    try {
      await press(page, tap, '[data-testid="postout-date"]')
      await press(page, tap, '[data-testid="dcal-day-2026-11-18"]')
      moved = true
    } catch (e) { say(`[${size}] S13 could not move the date: ${e.message}`) }
    const after13 = await page.evaluate(() => ({ line: document.querySelector('[data-testid="postout-line"]')?.textContent, err: document.querySelector('[data-testid="postout-err"]')?.textContent, box: document.querySelector('[data-testid="postout-date"]')?.textContent }))
    say(`[${size}] S13 after the move: ${JSON.stringify(after13)}; Ranger ${JSON.stringify(await person(page, 'bane'))}`)
    await neutral(page, tap); await shot(page, size, 's13a-after-move-sheet')
    await closeSheets(page)
    await openBell(page, tap)
    const m13 = await lines(page)
    say(`[${size}] S13 Saber's bell after the move: ${JSON.stringify(about(m13, 'Ranger').map(l => [l.what, l.day]))}`)
    /* his D1710 ([PO-CHANGE-RETRACT]): the move itself takes the line back — Saber, who moved it, keeps none and is told nothing */
    check(size, 'S13m', moved && plainPo(m13, 'Ranger').length === 0 && backs(m13, 'Ranger').length === 0, `date moved after it ran: Saber's own "Posted out" line gone, no "taken back" line for him (${JSON.stringify(about(m13, 'Ranger').map(l => [l.what, l.day]))})`)
    await bellShot(page, size, 's13m-saber-after-move')
    await closeBell(page, tap)
    const door = await undoPosting(page, tap, 'bane')
    const po13 = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="cell-bane-2026-11-"]')].filter(c => /PO/.test(c.textContent)).length)
    say(`[${size}] S13 Undo door ${door ? 'found' : 'MISSING'}; PO boxes left on his row in Nov: ${po13}`)
    await neutral(page, tap); await shot(page, size, 's13b-after-undo')
    const st = await ctx.storageState(); await b.close()
    ;({ b, ctx, page, tap } = await open(size, later(20), st, 'hex', 'x'))
    await openBell(page, tap); await neutral(page, tap)
    const ls = await lines(page)
    check(size, 'S13', moved && door && plainPo(ls, 'Ranger').length === 0 && backs(ls, 'Ranger').length >= 1, `date moved to 18 Nov after it ran, then Undo: no "Posted out" line left standing (${JSON.stringify(about(ls, 'Ranger').map(l => [l.what, l.day, l.unread]))})`)
    await bellShot(page, size, 's13-moved-then-undone')
    await b.close()
  }

  /* ===== S14 (desk): the outcome changed after it ran (SANS → Overseas), then Undo ===== */
  if (want('S14') && desk) {
    const { st: stR } = await hexReads(size, posted, 'tap')
    let { b, ctx, page, tap } = await open(size, later(10), stR)
    await lwOpen(page); await postingSheet(page, tap, 'bane')
    const chip = page.locator('[data-testid="postout-overseas"]').filter({ visible: true })
    const had = await chip.count()
    if (had) { await chip.first().click(); await sleep(500) }
    await closeSheets(page)
    /* his D1710: the outcome changed after it ran takes the "now SANS" line back; the new outcome (due today) runs and tells */
    await openBell(page, tap)
    const m14 = await lines(page)
    say(`[${size}] S14 Saber's bell after the change: ${JSON.stringify(about(m14, 'Ranger').map(l => [l.what, l.day]))}`)
    check(size, 'S14m', had && !about(m14, 'Ranger').some(l => /now SANS/.test(l.what || '') && l.struck == null), `SANS → Overseas after it ran: no "now SANS" line left in Saber's bell (${JSON.stringify(about(m14, 'Ranger').map(l => [l.what, l.day]))})`)
    await bellShot(page, size, 's14m-saber-after-change')
    await closeBell(page, tap)
    await lwOpen(page)
    const door = await undoPosting(page, tap, 'bane')
    const st = await ctx.storageState(); await b.close()
    ;({ b, ctx, page, tap } = await open(size, later(20), st, 'hex', 'x'))
    await openBell(page, tap); await neutral(page, tap)
    const ls = await lines(page)
    check(size, 'S14', had && door && plainPo(ls, 'Ranger').length === 0 && backs(ls, 'Ranger').length >= 1, `SANS → Overseas after the run, then Undo: no "Posted out" line left standing, Hex told it was taken back (${JSON.stringify(about(ls, 'Ranger').map(l => [l.what, l.unread]))})`)
    await bellShot(page, size, 's14-outcome-changed')
    await b.close()
  }

  /* ===== S15 (desk): off the manpower undone more than 14 days after its date ===== */
  if (want('S15') && desk) {
    const st0 = await saberPosts(size, base, [[X, 'none']])
    const { st: stR } = await hexReads(size, st0, 'markall')
    const LATE = new Date('2026-12-02T09:00:00')
    let { b, ctx, page, tap } = await open(size, LATE, stR)
    await lwOpen(page); const door = await undoPosting(page, tap, X)
    const st = await ctx.storageState(); await b.close()
    ;({ b, ctx, page, tap } = await open(size, new Date('2026-12-02T10:00:00'), st, 'hex', 'x'))
    await openBell(page, tap); await neutral(page, tap)
    const ls = about(await lines(page), csX)
    record(size, 'S15', `off the manpower read on 16 Nov, undone 2 Dec (16 days on; door ${door ? 'found' : 'MISSING'}): Hex's lines about ${csX}: ${JSON.stringify(ls.map(l => [l.what, l.unread]))} — the stored outcomes would still get a taken-back line`)
    await bellShot(page, size, 's15-late-undo')
    await b.close()
  }

  /* ===== S16 (desk): Restore on Admin → Users is not an undo ===== */
  if (want('S16') && desk) {
    const st0 = await saberPosts(size, base, [['bane', 'overseas']])
    const { st: stR } = await hexReads(size, st0, 'markall')
    let { b, ctx, page, tap } = await open(size, later(10), stR)
    await adminUsers(page, tap)
    const arch = page.locator('#accArchToggle')
    if ((await arch.count()) && (await arch.getAttribute('aria-expanded')) !== 'true') { await arch.click(); await sleep(400) }
    await press(page, tap, '#page-admin .acc-row[data-person="bane"] .acc-tap')
    const restore = page.locator('[data-restoring] button').filter({ hasText: /^Restore/ })
    const has = await restore.count()
    if (has) { await restore.first().click(); await sleep(800) }
    const pb = await person(page, 'bane')
    await shot(page, size, 's16-restored')
    const st = await ctx.storageState(); await b.close()
    ;({ b, ctx, page, tap } = await open(size, later(20), st, 'hex', 'x'))
    await openBell(page, tap); await neutral(page, tap)
    const ls = about(await lines(page), 'Ranger')
    check(size, 'S16', has && pb && !pb.archived && ls.length === 1 && ls[0].struck == null, `Restored on Admin → Users: Hex's posting line stays as it was, no taken-back line (${JSON.stringify(ls.map(l => [l.what, l.unread]))})`)
    await bellShot(page, size, 's16-hex-after-restore')
    await b.close()
  }

  /* ===== S17 (desk): two tabs — tab B open first; tab A places an approved LL for Ranger (his bell told); tab B's Undo post out ===== */
  if (want('S17') && desk) {
    const { st: stR } = await hexReads(size, posted, 'tap')
    const s = SIZES[size]
    const b = await s.engine.launch()
    const ctx = await b.newContext({ ...s.opts, deviceScaleFactor: 2, storageState: stR })
    await serveFrozen(ctx, URL)
    const tabB = await newPage(ctx, size, later(10)); await signIn(tabB, 'ad', 'a'); await lwOpen(tabB)
    const tabA = await newPage(ctx, size, later(10)); await signIn(tabA, 'ad', 'a'); await lwOpen(tabA)
    let placed = false
    try {
      await tapCell(tabA, false, 'bane', '2026-11-11')
      await press(tabA, false, '[data-testid="bid-LL"]')
      placed = true
    } catch (e) { say(`[${size}] S17 could not place the LL: ${e.message}`) }
    await closeSheets(tabA)
    const door = await undoPosting(tabB, false, 'bane')
    await tabA.reload(); await signIn(tabA, 'ad', 'a'); await lwOpen(tabA)
    const pb = await person(tabA, 'bane')
    const ll = await tabA.evaluate(() => (document.querySelector('[data-testid="cell-bane-2026-11-11"]')?.textContent || '').trim())
    await shot(tabA, size, 's17-tab-a-after-reload')
    const st = await ctx.storageState(); await b.close()
    let w = await open(size, later(20), st, 'hex', 'x')
    await openBell(w.page, false); const hx = about(await lines(w.page), 'Ranger'); await w.b.close()
    w = await open(size, later(20), st, 'us', 'us')
    await openBell(w.page, false); const rg = (await lines(w.page)).filter(l => /LL/.test(l.what)); await bellShot(w.page, size, 's17-ranger-bell'); await w.b.close()
    check(size, 'S17', placed && door && pb && !pb.san && /LL/.test(ll) && hx.length === 1 && hx[0].struck != null && rg.length >= 1, `two tabs: tab A's LL survives (cell "${ll}", Ranger's bell ${rg.length} LL line), tab B's Undo took (${JSON.stringify(pb)}), Hex's taken-back line ${JSON.stringify(hx.map(l => l.what))}`)
  }

  /* ===== S19 the SANS line on each kind of man; S20 the chip under the line (phone) ===== */
  if (want('S19') || want('S20')) {
    let { b, ctx, page, tap } = await open(size, BEFORE, base)
    await lwOpen(page)
    const kinds = await page.evaluate(ids => {
      const vis = e => e && e.getBoundingClientRect().width > 0
      const rowOf = id => document.querySelector(`[data-testid="row-${id}"] .who .puck`)
      const all = ids.filter(id => vis(rowOf(id)))
      const pick = f => all.find(id => f(rowOf(id), window.PEOPLE[id]))
      const long = [...all].sort((a, b) => String(window.PEOPLE[b].cs).length - String(window.PEOPLE[a].cs).length)[0]
      return {
        wso: pick(p => p.classList.contains('r')), ocu: pick(p => p.parentElement.querySelector('.lw-chip')?.textContent === 'O'),
        quals: pick(p => p.parentElement.querySelector('.lw-chip.has-quals')), long,
        gnd: Object.keys(window.PEOPLE).find(id => { const q = window.PEOPLE[id]; return q.pers && !q.archived && !q.deleted && vis(rowOf(id)) }),
      }
    }, men)
    say(`[${size}] S19 kinds: ${JSON.stringify(kinds)}`)
    const sans = [...new Set(['bane', kinds.wso, kinds.ocu, kinds.quals, kinds.long].filter(Boolean))]
    for (const id of sans) await postOut(page, tap, id, 'sans').catch(e => say(`[${size}] S19 post ${id}: ${e.message}`))
    /* D1709 (his "No SANS for ground crew", 5 Nov 26): a ground-crew man's posting offers no SANS chip */
    const gndPosted = false
    if (kinds.gnd) {
      await tapCell(page, tap, kinds.gnd)
      await press(page, tap, `${sheet} [data-testid="bid-more"]`)
      await press(page, tap, '[data-testid="bid-postout"]')
      const sansChip = await page.locator(`${sheet} [data-testid="po-sans"]`).filter({ visible: true }).count()
      const others = await page.locator(`${sheet} [data-testid="po-overseas"], ${sheet} [data-testid="po-delete"]`).filter({ visible: true }).count()
      await neutral(page, tap); await shot(page, size, 's19k-ground-crew-no-sans')
      check(size, 'S19k', !sansChip && others === 2, `D1709: a ground-crew man's Post out offers no SANS (SANS chip ${sansChip ? 'SHOWN' : 'absent'}; Overseas Sqn and Delete ${others === 2 ? 'there' : 'MISSING'})`)
      await closeSheets(page)
      /* …and an aircrew man's sheet still has it (the posting above went through it) */
    }
    const ovs = men[10]
    await postOut(page, tap, ovs, 'overseas')
    check(size, 'S19a', (await tagCount(page)) === 0, 'no "SANS" tag anywhere on the grid')
    for (const id of [...sans, ...(gndPosted ? [kinds.gnd] : [])]) {
      await page.locator(`[data-testid="cell-${id}-${ISO}"]`).first().evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {})
      await sleep(250)
      const pk = await pucks(page, id), px = await puckPixels(page, id)
      const sr = await page.evaluate(id => [...document.querySelectorAll(`[data-testid="row-${id}"] .who .puck .lw-sr, tr[data-band-id="${id}"] .who .puck .lw-sr`)].map(e => ({ t: e.textContent, w: e.getBoundingClientRect().width })), id)
      check(size, `S19b-sr-${id}`, sr.length >= 1 && sr.every(x => x.t === ' SANS' && x.w <= 1), `the word "SANS" for a screen reader, kept off the screen (${JSON.stringify(sr)})`)
      check(size, `S19b-${id}`, pk.length && pk.every(p => p.san && p.line) && px && px.purple > 6, `${pk[0] && pk[0].name}: the purple line on ${pk.map(p => p.where).join(' + ')} (purple pixels ${px && px.purple}; name ${pk.map(p => p.nameWhole ? 'whole' : 'faded').join('/')})`)
    }
    const po = await pucks(page, ovs)
    check(size, 'S19c', po.length && po.every(p => !p.san), `posted out to Overseas Sqn: no line (${JSON.stringify(po.map(p => p.san))})`)
    await page.locator(`[data-testid="cell-bane-${ISO}"]`).first().evaluate(e => e.scrollIntoView({ block: 'center' }))
    await neutral(page, tap); await shot(page, size, 's19a-kinds-before-date')
    if (!desk && kinds.long) {
      await page.locator(`[data-testid="cell-${kinds.long}-${ISO}"]`).first().evaluate(e => e.scrollIntoView({ block: 'center' }))
      await sleep(300)
      const pk = (await pucks(page, kinds.long))[0]
      if (pk) await page.screenshot({ path: join(OUT, `s19d-long-name-close-${size}.png`), clip: { x: Math.max(0, pk.x - 4), y: Math.max(0, pk.y - 6), width: pk.w + 30, height: pk.h + 12 } })
    }
    /* S20 (phone): the chip's right edge, under the line — the quals list opens, not his window */
    if (!desk && want('S20') && kinds.quals) {
      const c = await page.evaluate(id => { const ch = document.querySelector(`tr[data-band-id="${id}"] .lw-chip.has-quals`) || document.querySelector(`[data-testid="row-${id}"] .lw-chip.has-quals`); ch.scrollIntoView({ block: 'center' }); const b = ch.getBoundingClientRect(); return { x: b.right - 2, y: b.top + b.height / 2 } }, kinds.quals)
      await sleep(300)
      await page.touchscreen.tap(c.x, c.y); await sleep(90)
      await shot(page, size, 's20-chip-edge-lift')
      await sleep(400)
      const qp = await page.locator('[data-testid="qualpop"]').isVisible().catch(() => false)
      const pw = await page.locator('[data-testid="person-window"]').isVisible().catch(() => false)
      check(size, 'S20', qp && !pw, `a tap on the chip's last 2px (under the purple line): the quals list ${qp ? 'opens' : 'does NOT open'}, his window ${pw ? 'OPENS' : 'stays shut'}`)
      await shot(page, size, 's20-chip-edge-settled')
      await page.keyboard.press('Escape').catch(() => {})
      if (tap) await page.touchscreen.tap(10, 300); else await page.mouse.click(10, 300)
      await sleep(300)
    }
    /* the signed-in man's own ringed row (Ranger, posted SANS) */
    const st1 = await ctx.storageState(); await b.close()
    ;({ b, ctx, page, tap } = await open(size, BEFORE, st1, 'us', 'us'))
    await lwOpen(page)
    const own = await pucks(page, 'bane')
    check(size, 'S19e', own.length && own.every(p => p.san && p.line), 'Ranger signed in: his own ringed row wears the line too')
    await page.locator(`[data-testid="cell-bane-${ISO}"]`).first().evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {})
    await neutral(page, tap); await shot(page, size, 's19e-own-row')
    await b.close()
    /* after the run, "+ SANS" on: the SANS group's men and the posted men together */
    ;({ b, ctx, page, tap } = await open(size, later(5), st1))
    await lwOpen(page)
    await press(page, tap, '[data-testid="settings-open"]')
    const add = page.locator('[data-testid="gadd-SANS"]').filter({ visible: true })
    const canAdd = await add.count()
    if (canAdd) { if (tap) await add.first().tap(); else await add.first().click(); await sleep(500) }
    await page.keyboard.press('Escape').catch(() => {}); await closeSheets(page)
    await lwOpen(page)
    const grp = await page.evaluate(() => Object.entries(window.PEOPLE).filter(([, p]) => p.san && !p.special && !p.archived && !p.deleted).map(([id]) => {
      const pk = [...document.querySelectorAll(`[data-testid="row-${id}"] .who .puck, tr[data-band-id="${id}"] .who .puck`)].find(p => p.getBoundingClientRect().width > 0)
      return pk ? { id, cs: window.PEOPLE[id].cs, gnd: !!(window.PEOPLE[id].pers || window.PEOPLE[id].seat === 'GND'), san: pk.classList.contains('san') } : null
    }).filter(Boolean))
    const air = grp.filter(g => !g.gnd), gnd = grp.filter(g => g.gnd)
    check(size, 'S19f', canAdd && air.length >= 3 && air.every(g => g.san), `"+ SANS" on, after the run: every SANS aircrew man on the grid wears the line (${air.length}: ${air.filter(g => !g.san).map(g => g.cs).join(', ') || 'none without'})`)
    if (gnd.length) {
      record(size, 'S19f-gnd', `ground crew posted out as SANS, after the run: ${JSON.stringify(gnd.map(g => [g.cs, g.san]))} — the war's copy of a ground-crew man carries no SANS mark (raptorRoster's ground-crew branch), so the line goes at his date; FILED as a question: should Post out offer SANS for ground crew at all?`)
      await page.locator(`[data-testid="row-${gnd[0].id}"] .who .puck`).first().evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {})
      await sleep(300); await neutral(page, tap); await shot(page, size, 's19f-ground-crew-after-run')
    }
    const firstSan = await page.evaluate(() => { const r = [...document.querySelectorAll('.puck.san')].find(p => p.getBoundingClientRect().width > 0); if (r) r.scrollIntoView({ block: 'center' }); return !!r })
    await sleep(300); await neutral(page, tap); await shot(page, size, 's19f-sans-group')
    if (desk) {
      /* zoomed out at his 1536 (Ctrl+scroll over the grid) and at 2560 */
      const g = await page.locator('[data-testid^="row-"]').first().boundingBox()
      await page.mouse.move(g.x + 600, g.y + 20)
      for (let i = 0; i < 8; i++) { await page.keyboard.down('Control'); await page.mouse.wheel(0, 300); await page.keyboard.up('Control'); await sleep(120) }
      await sleep(600)
      const zs = await page.evaluate(() => [...document.querySelectorAll('.puck.san')].filter(p => p.getBoundingClientRect().width > 0).map(p => getComputedStyle(p, '::after').width))
      check(size, 'S19g', zs.length >= 3 && zs.every(w => w === '4px'), `zoomed out at 1536: ${zs.length} SANS names drawn, each with its line`)
      await shot(page, size, 's19g-zoomed-out')
      await page.setViewportSize({ width: 2560, height: 1080 }); await sleep(900)
      const zw = await page.evaluate(() => [...document.querySelectorAll('.puck.san')].filter(p => p.getBoundingClientRect().width > 0).length)
      check(size, 'S19h', zw >= 3, `at 2560 wide: ${zw} SANS names with the line`)
      await shot(page, size, 's19h-2560')
      await page.setViewportSize(SIZES.desk.opts.viewport); await sleep(500)
    }
    /* the designer's gap, after the run: Balances, Approvals and the day panel draw the schedule's puck */
    for (const [tab, name] of [['lw-tab-balances', 'balances'], ['lw-tab-approvals', 'approvals']]) {
      const t = page.locator(`[data-testid="${tab}"]`).filter({ visible: true })
      if (!(await t.count())) continue
      if (tap) await t.first().tap(); else await t.first().click(); await sleep(900)
      const s2 = await page.evaluate(() => [...document.querySelectorAll('#page-leavewar .puck')].filter(p => p.getBoundingClientRect().width > 0 && (p.querySelector('.nm') || p).textContent.trim() === 'Ranger').map(p => ({ san: p.classList.contains('san'), where: (p.closest('[data-testid]') || {}).getAttribute?.('data-testid') })))
      record(size, `S19i-${name}`, `after the run, his puck on ${name}: ${JSON.stringify(s2)}`)
      await neutral(page, tap); await shot(page, size, `s19i-${name}-after-run`)
    }
    /* the OIL tracker's name list keeps its own badge (must not) */
    const oil = page.locator('[data-testid="oil-tracker"]').filter({ visible: true })
    if (await oil.count()) { if (tap) await oil.first().tap(); else await oil.first().click(); await sleep(900); await neutral(page, tap); await shot(page, size, 's19j-oil-tracker'); record(size, 'S19j', 'the OIL tracker\'s name list pictured: its own badge, by D1698\'s scope (the grid)') }
    await b.close()
  }
  report[size] = { X, Y, csX }
}
const fails = results.filter(r => r.ok === false)
writeFileSync(join(OUT, `walk-log${process.env.ONLY ? '-' + process.env.ONLY : ''}${process.env.STAGES ? '-' + process.env.STAGES.replace(/,/g, '') : ''}.json`), JSON.stringify({ results, errs, log, report }, null, 2))
say(`${results.filter(r => r.ok === true).length} passed, ${fails.length} failed, ${results.filter(r => r.ok === 'RECORD').length} recorded, ${results.filter(r => r.ok === 'NOT WALKED').length} not walked; errors: ${errs.length ? errs.join(' | ') : 'none'}`)
process.exit(fails.length ? 1 : 0)
