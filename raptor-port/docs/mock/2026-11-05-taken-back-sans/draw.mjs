// [NOTICE-UNDO-RETRACT] step 1 (D1693) and [PO-SANS-PUCK-EDGE] (D1692) — DRAWN on the real frozen build; nothing here is
// built. At his PC's 1536 × 864 (Chromium) and his iPhone's 402 × 874 (WebKit, touch).
//   A. Today (5 Nov 26), as Saber, through the app's own controls: Hex made an admin (so "every admin" is two people);
//      two men posted out from Mon 16 Nov on the Leave War's one-day sheet — one as SANS, one with no chip ("off the
//      manpower").
//   B. The clock moved to Mon 16 Nov 08:00: the postings run by themselves. Hex opens his bell and reads both lines
//      ("Mark all read").
//   C. Saber, the same morning: the SANS man's row on the grid — TODAY the "SANS" tag after his puck; PROPOSED the tag
//      gone and the puck given the schedule's own SANS class (`.puck.san` — its purple line, 04-pucks-sections.css), the
//      one transform. Then "+ SANS" in ⚙: the SANS group's own pucks, as drawn today, for the question of whether they
//      wear the line too. Then, on each man's posting sheet, "Undo post out (PO)" — the real control.
//   D. Hex's bell after the undo: TODAY — the SANS line still says "Posted out · now SANS" (the "off the manpower" line has
//      already gone, worked out from the posting); PROPOSED — each read line replaced by one cloned from the bell's own
//      line, "<man> · Mon 16 Nov / Posting out taken back · Saber", unread. Saber's own bell: his lines simply go.
// Usage (from raptor-port/): WALK_DIR=<frozen dist> node docs/mock/2026-11-05-taken-back-sans/draw.mjs
import { chromium, webkit } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { serveFrozen } from '../../../scripts/handpass/isr-serve.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, 'img'); mkdirSync(OUT, { recursive: true })
const URL = 'http://localhost:4392/'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const ISO = '2026-11-16', DAYWORDS = 'Mon 16 Nov'
const RUN_AT = new Date('2026-11-16T08:00:00')
const SIZES = {
  desk: { engine: chromium, opts: { viewport: { width: 1536, height: 864 } }, tap: false },
  phone: { engine: webkit, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true }, tap: true },
}
const log = [], errs = []
const say = l => { log.push(l); console.log(l) }

const MARK = `.tb-new{outline:3px solid #ff3b6b !important;outline-offset:-3px;position:relative}
.tb-new::before{content:attr(data-tb);position:absolute;right:6px;bottom:4px;z-index:99;background:#ff3b6b;color:#fff;
  font:700 10px/1 system-ui,sans-serif;padding:3px 5px;border-radius:4px;white-space:nowrap;letter-spacing:.02em}
.tb-ring{outline:3px dashed #ff3b6b !important;outline-offset:3px}`

async function open(size, state, user = 'ad', pass = 'a') {
  const s = SIZES[size]
  const b = await s.engine.launch()
  const ctx = await b.newContext({ ...s.opts, deviceScaleFactor: 2, ...(state ? { storageState: state } : {}) })
  await serveFrozen(ctx, URL)
  const page = await ctx.newPage()
  if (state) await page.clock.install({ time: RUN_AT })
  page.on('pageerror', e => { errs.push(`[${size}] page error ${e.message}`); say(`[${size}] PAGE ERROR ${e.message} ${(e.stack || '').split(/\n/).slice(0, 4).join(' | ')}`) })
  page.on('console', m => { if (m.type() === 'error') { errs.push(`[${size}] console ${m.text()}`); say(`[${size}] CONSOLE ${m.text().slice(0, 300)}`) } })
  page.on('dialog', d => d.dismiss().catch(() => {}))
  await page.goto(URL)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}' })
  await page.waitForSelector('#luser')
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await sleep(1200)
  await page.addStyleTag({ content: MARK })
  return { b, ctx, page, tap: s.tap }
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
async function closeSheets(page) {
  for (let i = 0; i < 4; i++) { const x = page.locator(`${sheet} button.x:visible`).last(); if (!(await x.count())) break; await x.click().catch(() => {}); await sleep(350) }
}
async function lwOpen(page) {
  await go(page, 'leavewar')
  await page.waitForSelector('[data-testid^="row-"]', { timeout: 20000 }); await sleep(500)
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
async function postOut(page, tap, id, outcome) {
  await tapCell(page, tap, id)
  await press(page, tap, `${sheet} [data-testid="bid-more"]`)
  await press(page, tap, '[data-testid="bid-postout"]')
  if (outcome === 'none') await press(page, tap, `${sheet} [data-testid="po-overseas"]`)          // the lit default, off
  else if (outcome !== 'overseas') await press(page, tap, `${sheet} [data-testid="po-${outcome}"]`)
  await press(page, tap, `${sheet} [data-testid="po-confirm"]`)
  await sleep(600); await closeSheets(page)
}
async function openBell(page, tap) {
  const b = page.locator('.bellbtn').filter({ visible: true }).first()
  if (tap) await b.tap(); else await b.click()
  await page.waitForSelector('[data-testid="bell-list"]'); await sleep(400)
}
const bellLines = page => page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].map(l => ({
  id: l.getAttribute('data-testid'), unread: l.classList.contains('unread'), text: l.textContent.replace(/\s+/g, ' ').trim() })))
async function neutral(page, tap) {
  await page.evaluate(() => { const a = document.activeElement; if (a && a !== document.body) a.blur() })
  if (!tap) await page.mouse.move(2, 400)
  await sleep(150)
}
const shot = (page, name) => page.screenshot({ path: join(OUT, name + '.png') })
async function bellClose(page, name) {
  const box = await page.locator('[data-testid="bell-list"]').boundingBox()
  if (box) await page.screenshot({ path: join(OUT, name + '.png'), clip: { x: Math.max(0, box.x - 16), y: Math.max(0, box.y - 56), width: Math.min(page.viewportSize().width - Math.max(0, box.x - 16), box.width + 32), height: Math.min(box.height + 72, 560) } })
}
/* the man's row on the grid: the real row (desktop) or the phone's frozen copy of it, and the picture cut round it */
async function rowShot(page, size, id, name) {
  const r = await page.evaluate(id => {
    const vis = e => e && e.getBoundingClientRect().height > 0 && e.getBoundingClientRect().width > 0
    const band = [...document.querySelectorAll(`tr[data-band-id="${id}"] .who`)].find(vis)
    const real = [...document.querySelectorAll(`[data-testid="row-${id}"] .who`)].find(vis)
    const w = band || real
    if (!w) return null
    w.scrollIntoView({ block: 'center' })
    const b = w.getBoundingClientRect()
    return { x: b.left, y: b.top, w: b.width, h: b.height, band: !!band }
  }, id)
  if (!r) throw new Error('premise: his row is not on the grid — ' + id)
  await sleep(300)
  const b2 = await page.evaluate(id => {
    const vis = e => e && e.getBoundingClientRect().height > 0
    const w = [...document.querySelectorAll(`tr[data-band-id="${id}"] .who`)].find(vis) || [...document.querySelectorAll(`[data-testid="row-${id}"] .who`)].find(vis)
    const b = w.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }
  }, id)
  const vw = page.viewportSize().width
  const clip = { x: 0, y: Math.max(0, b2.y - 70), width: Math.min(vw, size === 'desk' ? 640 : vw), height: b2.h + 140 }
  await page.screenshot({ path: join(OUT, name + '.png'), clip })
  return r
}
/* what his name shows: the puck's words, its width, the tag, and whether the purple line is drawn */
const pucks = (page, id) => page.evaluate(id => [...document.querySelectorAll(`[data-testid="row-${id}"] .who .puck, tr[data-band-id="${id}"] .who .puck`)]
  .filter(p => p.getBoundingClientRect().width > 0).map(p => {
    const nm = p.querySelector('.nm'), tag = p.parentElement.querySelector('.po-sans-tag')
    const after = getComputedStyle(p, '::after')
    return { where: p.closest('tr[data-band-id]') ? 'phone frozen copy' : 'row', cls: p.className, name: nm.textContent,
      nameShown: nm.scrollWidth <= nm.clientWidth + 1 ? 'whole' : `cut (${nm.clientWidth}/${nm.scrollWidth}px)`,
      puckW: Math.round(p.getBoundingClientRect().width), tag: !!tag && tag.getBoundingClientRect().width > 0, line: after.content !== 'none' && after.width }
  }), id)

const report = {}
for (const size of (process.env.ONLY ? [process.env.ONLY] : ['desk', 'phone'])) {
  /* ---- A. today: Hex made an admin; two men posted out ---- */
  let { b, ctx, page, tap } = await open(size)
  await go(page, 'admin')
  const users = page.locator('.adm-cat').filter({ hasText: 'Users' }).first()
  if (await users.count()) { if (tap) await users.tap(); else await users.click(); await sleep(600) }
  await press(page, tap, '#page-admin .acc-row[data-person="rocky"] .acc-tap')
  await page.selectOption('#accEdRole', 'admin'); await sleep(200)
  await press(page, tap, '#accEdSave').catch(async () => { await closeSheets(page) })
  await sleep(400)
  const hexAdmin = await page.evaluate(() => /Admin/.test(document.querySelector('#page-admin .acc-row[data-person="rocky"]')?.textContent || ''))
  say(`[${size}] Hex made an admin: ${hexAdmin}`)
  await lwOpen(page)
  const onGrid = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].map(r => r.getAttribute('data-testid').slice(4)))
  const P = await page.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([id, p]) => [id, { cs: p.cs, special: !!p.special, pers: !!p.pers, san: !!p.san, archived: !!p.archived }])))
  const free = onGrid.filter(id => P[id] && !P[id].special && !P[id].pers && !P[id].san && !P[id].archived && !['bane', 'stiff', 'rocky', 'casper'].includes(id))
  /* the SANS man: the longest callsign of the first few, so the squeeze shows as it did on his phone */
  const pool = free.slice(4, 14)
  const sansId = [...pool].sort((a, b) => String(P[b].cs).length - String(P[a].cs).length)[0]
  const noneId = pool.find(id => id !== sansId)
  say(`[${size}] posting out ${P[sansId].cs} (${sansId}) as SANS and ${P[noneId].cs} (${noneId}) with no chip`)
  await postOut(page, tap, sansId, 'sans')
  await postOut(page, tap, noneId, 'none')
  const state1 = await ctx.storageState()
  await b.close()

  /* ---- B. Mon 16 Nov: Hex reads his bell ---- */
  ;({ b, ctx, page, tap } = await open(size, state1, 'hex', 'x'))
  await openBell(page, tap)
  const hexBefore = await bellLines(page)
  say(`[${size}] Hex's bell on the date: ${JSON.stringify(hexBefore)}`)
  await neutral(page, tap)
  await shot(page, `0-hex-bell-ran-${size}`)
  await press(page, tap, '[data-testid="bell-markall"]')
  const hexRead = await bellLines(page)
  say(`[${size}] after Mark all read: ${JSON.stringify(hexRead)}`)
  const state2 = await ctx.storageState()
  await b.close()

  /* ---- C. Saber, the same morning: the SANS man's row, then Undo post out ---- */
  ;({ b, ctx, page, tap } = await open(size, state2))
  await lwOpen(page)
  await page.locator(`[data-testid="cell-${sansId}-${ISO}"]`).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await sleep(500)
  const today = await pucks(page, sansId)
  say(`[${size}] TODAY his name on the grid: ${JSON.stringify(today)}`)
  await page.evaluate(id => { for (const t of document.querySelectorAll(`[data-testid="row-${id}"] .po-sans-tag, tr[data-band-id="${id}"] .po-sans-tag`)) { t.classList.add('tb-ring') } }, sansId)
  await neutral(page, tap)
  await rowShot(page, size, sansId, `1-sans-today-${size}`)
  await page.evaluate(id => { for (const t of document.querySelectorAll('.tb-ring')) t.classList.remove('tb-ring') }, sansId)
  /* PROPOSED — the one transform: the tag removed, the puck given the schedule's own SANS class */
  await page.evaluate(id => {
    for (const t of document.querySelectorAll(`[data-testid="row-${id}"] .po-sans-tag, tr[data-band-id="${id}"] .po-sans-tag`)) t.style.display = "none"   // hidden, never removed: the app owns the node (a removed one crashes its next redraw)
    for (const p of document.querySelectorAll(`[data-testid="row-${id}"] .who .puck, tr[data-band-id="${id}"] .who .puck`)) p.classList.add('san')
  }, sansId)
  const proposed = await pucks(page, sansId)
  say(`[${size}] PROPOSED his name on the grid: ${JSON.stringify(proposed)}`)
  await neutral(page, tap)
  await rowShot(page, size, sansId, `2-sans-proposed-${size}`)

  await lwOpen(page)
  /* Undo post out (PO), on each man's posting sheet — the real control */
  /* (the man off the manpower has no row on the grid once his date has come — the war shows him only while he is here —
     so the drawing undoes the SANS posting alone; his line follows the same rule, D1696) */
  for (const id of [sansId]) {
    /* his posting date's box; a man off the manpower has none from his date, so a day still his (13 Nov) */
    await tapCell(page, tap, id, (await page.locator(`[data-testid="cell-${id}-${ISO}"]`).count()) ? ISO : '2026-11-13')
    /* a day of his still in the squadron opens the bid sheet: the posting sheet is behind its ⋯ → Post out, as when it was set */
    if (!(await page.locator('[data-testid="postout-undo"]:visible').count())) {
      await press(page, tap, `${sheet} [data-testid="bid-more"]`)
      await press(page, tap, '[data-testid="bid-postout"]')
    }
    const why = await page.evaluate(() => !!document.querySelector('[data-testid="postout-undo"]'))
    if (!why) throw new Error('premise: no Undo post out on the sheet for ' + id)
    await press(page, tap, '[data-testid="postout-undo"]')
    await sleep(500); await closeSheets(page)
  }
  const after = await page.evaluate(ids => ids.map(id => ({ id, san: !!window.PEOPLE[id].san })), [sansId, noneId])
  say(`[${size}] after Undo post out: ${JSON.stringify(after)}`)
  await openBell(page, tap)
  const saberToday = await bellLines(page)
  say(`[${size}] Saber's own bell after his undo: ${JSON.stringify(saberToday)}`)
  await neutral(page, tap)
  await page.evaluate(cs => { for (const l of document.querySelectorAll('[data-testid="bell-list"] .bl-line')) if (/now SANS/.test(l.textContent) && l.querySelector('.bl-name').textContent === cs) { l.classList.add('tb-new'); l.dataset.tb = 'TODAY: STAYS · PROPOSED: GOES' } }, P[sansId].cs)
  await bellClose(page, `5-saber-bell-${size}`)
  const state3 = await ctx.storageState()

  /* the SANS group's own pucks today ("+ SANS" in ⚙, after the undo — with SANS on the war a man posted out as SANS moves
     into that group, D283) — do they wear the line? The setting is kept, so the page is opened again to draw it clean */
  await closeSheets(page)
  { const bb = page.locator('.bellbtn').filter({ visible: true }).first(); if (await page.locator('[data-testid="bell-list"]').count()) { if (tap) await bb.tap(); else await bb.click(); await sleep(400) } }   // the bell's list closed first
  await press(page, tap, '[data-testid="settings-open"]')
  await press(page, tap, '[data-testid="gadd-SANS"]')
  await page.reload(); await page.waitForSelector('#luser')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); await sleep(1200)
  await lwOpen(page)
  const group = await page.evaluate(() => {
    const ids = Object.entries(window.PEOPLE).filter(([, p]) => p.san && !p.special && !p.archived).map(([id]) => id)
    const r = ids.map(id => [...document.querySelectorAll(`[data-testid="row-${id}"] .who .puck, tr[data-band-id="${id}"] .who .puck`)].find(p => p.getBoundingClientRect().width > 0)).filter(Boolean)
    return r.map(p => ({ name: p.querySelector('.nm').textContent, line: getComputedStyle(p, '::after').content !== 'none' }))
  })
  say(`[${size}] the SANS group's pucks with "+ SANS" on: ${JSON.stringify(group)}`)
  const firstSan = await page.evaluate(() => Object.entries(window.PEOPLE).find(([id, p]) => p.san && !p.special && !p.archived && document.querySelector(`[data-testid="row-${id}"]`))?.[0])
  if (firstSan) {
    await rowShot(page, size, firstSan, `3-sansgroup-today-${size}`)
    await page.evaluate(() => {
      for (const [id, p] of Object.entries(window.PEOPLE)) if (p.san) for (const k of document.querySelectorAll(`[data-testid="row-${id}"] .who .puck, tr[data-band-id="${id}"] .who .puck`)) k.classList.add('san')
    })
    await rowShot(page, size, firstSan, `4-sansgroup-proposed-${size}`)
  }
  await b.close()

  /* ---- D. Hex's bell after the undo: today, and proposed ---- */
  ;({ b, ctx, page, tap } = await open(size, state3, 'hex', 'x'))
  await openBell(page, tap)
  const hexToday = await bellLines(page)
  say(`[${size}] Hex's bell after the undo, TODAY: ${JSON.stringify(hexToday)}`)
  await neutral(page, tap)
  await page.evaluate(cs => { for (const l of document.querySelectorAll('[data-testid="bell-list"] .bl-line')) if (/now SANS/.test(l.textContent) && l.querySelector('.bl-name').textContent === cs) { l.classList.add('tb-new'); l.dataset.tb = 'TODAY: STILL SAYS POSTED OUT' } }, P[sansId].cs)
  await shot(page, `6-hex-bell-today-${size}`)
  await bellClose(page, `6-hex-bell-today-${size}-close`)
  await page.evaluate(() => { for (const l of document.querySelectorAll('.tb-new')) l.classList.remove('tb-new') })
  /* PROPOSED — each line he had read replaced by its "taken back" line, cloned from the bell's own line, unread */
  const drawn = await page.evaluate(([men, day]) => {
    const list = document.querySelector('[data-testid="bell-list"] .bl-scroll')
    const model = list.querySelector('.bl-line')
    const made = []
    for (const m of men) {
      const old = [...list.querySelectorAll('.bl-line')].find(l => l.querySelector('.bl-name')?.textContent === m.cs && /Posted out/.test(l.textContent))
      if (old) old.remove()
      const n = model.cloneNode(true)
      n.className = 'bl-line unread tb-new'; n.dataset.tb = 'NEW'; n.removeAttribute('data-testid')
      n.querySelector('.bl-name').textContent = m.cs
      n.querySelector('.bl-day').textContent = day
      n.querySelector('.bl-what').textContent = 'Posting out taken back · Saber'
      n.querySelector('.bl-ago').textContent = 'now'
      list.prepend(n); made.push(n.textContent.replace(/\s+/g, ' ').trim())
    }
    const bell = [...document.querySelectorAll('.bellbtn')].find(x => x.offsetParent !== null)
    if (bell) bell.classList.add('on')
    return made
  }, [[{ cs: P[sansId].cs }], DAYWORDS])
  say(`[${size}] PROPOSED Hex's bell: ${JSON.stringify(drawn)}`)
  const fit = await page.evaluate(() => [...document.querySelectorAll('.bl-line.tb-new')].map(n => ({ h: Math.round(n.getBoundingClientRect().height), whatCut: n.querySelector('.bl-what').scrollWidth > n.querySelector('.bl-what').clientWidth + 1 })))
  say(`[${size}] the drawn lines' height and fit: ${JSON.stringify(fit)}`)
  await neutral(page, tap)
  await shot(page, `7-hex-bell-proposed-${size}`)
  await bellClose(page, `7-hex-bell-proposed-${size}-close`)
  /* B — HIS IDEA (5 Nov 26, after seeing picture 7): the posting's own line kept, its words struck through, "taken back ·
     Saber" after them, unread again so the bell lights. Struck the way the app already strikes a cancelled input's title
     (line-through, D767); nothing else about the line changes */
  await page.evaluate(was => {
    for (const n of document.querySelectorAll('.bl-line.tb-new')) {
      const w = n.querySelector('.bl-what')
      w.textContent = ''
      const s = document.createElement('s'); s.textContent = was; s.style.textDecorationThickness = '1.5px'
      w.append(s, document.createTextNode(' · taken back · Saber'))
      n.dataset.tb = 'NEW · B'
    }
  }, 'Posted out · now SANS')
  const fitB = await page.evaluate(() => [...document.querySelectorAll('.bl-line.tb-new')].map(n => ({ h: Math.round(n.getBoundingClientRect().height), whatCut: n.querySelector('.bl-what').scrollWidth > n.querySelector('.bl-what').clientWidth + 1 })))
  say(`[${size}] B (struck through): height and fit ${JSON.stringify(fitB)}`)
  await neutral(page, tap)
  await bellClose(page, `8-hex-bell-struck-${size}-close`)
  report[size] = { sans: P[sansId].cs, none: P[noneId].cs, hexBefore, hexRead, today, proposed, group, saberToday, hexToday, drawn, fit }
  await b.close()
}
writeFileSync(join(HERE, 'draw-log.json'), JSON.stringify({ log, errs, report }, null, 2))
say(`errors: ${errs.length ? errs.join(' | ') : 'none'}`)
