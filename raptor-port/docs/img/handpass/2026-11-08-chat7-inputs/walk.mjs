// Chat 7 walk (D1787, D1792 b): the Inputs List's + Input at the right, the room for the window, the Calendar's expand arrows.
// Run: node walk.mjs  (server on http://localhost:4378 serving the current build)
import { chromium } from 'playwright'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = dirname(fileURLToPath(import.meta.url))
const BASE = 'http://localhost:4378'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
console.log('walk.mjs v2 - chat7 inputs walk (clock set to 13 Jul 26 the drawings own day, left running)')
mkdirSync(OUT, { recursive: true })
const results = [], errors = []
const rec = (width, step, expected, saw, pass, pic) => { results.push({ width, step, expected, saw, pass, pic }); console.log(`[${width}] ${step} :: ${pass ? 'PASS' : 'FAIL'} :: ${JSON.stringify(saw)} ${pic || ''}`) }
const r1 = o => o && Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Math.round(v * 10) / 10]))

async function login(page) {
  await page.goto(BASE + '/')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(500)
}
async function go(page, to) {
  await page.evaluate(p => window.go(p), to)
  await page.waitForFunction(p => window.CURPAGE === p, to)
  await page.waitForTimeout(400)
}
const colW = p => p.evaluate(() => [...document.querySelectorAll('#intbl thead th')].map(th => Math.round(th.getBoundingClientRect().width)))
const box = async (p, sel) => { const l = p.locator(sel).first(); if (!(await l.count())) return null; return r1(await l.boundingBox()) }
async function press(page, sel, touch) { const l = page.locator(sel).first(); await (touch ? l.tap() : l.click()) }
async function shot(page, name, clip) { const f = join(OUT, name + '.png'); await page.screenshot({ path: f, ...(clip ? { clip } : {}) }); return name + '.png' }
const pad = (b, n = 12) => ({ x: Math.max(0, b.x - n), y: Math.max(0, b.y - n), width: b.width + 2 * n, height: b.height + 2 * n })
async function winOpen(page) { await page.locator('[data-testid="win-inputedit"]').waitFor({ state: 'visible', timeout: 4000 }); await page.waitForTimeout(700) }
async function winGone(page) { await page.locator('[data-testid="win-inputedit"]').waitFor({ state: 'detached', timeout: 4000 }).catch(() => {}); await page.waitForTimeout(500) }
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b)

async function room(page, W, label, closed) {
  const w = await box(page, '[data-testid="win-inputedit"]'), t = await box(page, '#intbl'), cols = await colW(page)
  const wrap = await page.evaluate(() => { const e = document.querySelector('.inwrap'); return e ? { pr: getComputedStyle(e).paddingRight, cls: document.querySelector('.inputs-workspace')?.className } : null })
  const gap = w && t ? Math.round((w.x - (t.x + t.width)) * 10) / 10 : null
  return { winLeft: w && w.x, winTop: w && w.y, winW: w && w.width, listRight: t && Math.round((t.x + t.width) * 10) / 10, gap, cols, wrap }
}

async function listAt(browser, W, H, phone) {
  const ctx = await browser.newContext(phone ? { viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : { viewport: { width: W, height: H }, deviceScaleFactor: 2 })
  await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
  const page = await ctx.newPage()
  page.on('console', m => { if (m.type() === 'error') errors.push(`[${W}] console: ${m.text()}`) })
  page.on('pageerror', e => errors.push(`[${W}] pageerror: ${e.message}`))
  page.on('response', r => { if (r.status() >= 400) errors.push(`[${W}] ${r.status()} ${r.url()}`) })
  await login(page); await go(page, 'inputs')
  await press(page, '#inListBtn', phone)
  await page.locator('#intbl, #inList').first().waitFor({ state: 'attached' })
  await page.waitForTimeout(500)
  return { ctx, page }
}

async function widthWalk(browser, W, H) {
  const { ctx, page } = await listAt(browser, W, H, false)
  const tag = 'w' + W
  // (a) the row
  const row = await box(page, '.inputs-listtools'), btn = await box(page, '#inNew'), dates = await box(page, '#inRangeBtn')
  const closed = await colW(page)
  const pic = await shot(page, `${tag}-a-row`, pad(row, 16))
  await shot(page, `${tag}-a-viewport`)
  const edge = Math.round((row.x + row.width - (btn.x + btn.width)) * 10) / 10
  rec(W, 'a: row of + Input and dates', '+ Input at the row\'s right end (<2px), dates button at the left, 36 tall', { row, btn, dates, rightEdgeGap: edge, closedCols: closed }, edge < 2 && dates.x < btn.x && btn.height >= 35.5, pic)
  const expectClosed = W < 1100 ? [110, 140, 90] : [250, 150, 115]
  rec(W, 'a2: no window columns', `Name/Start/End = ${expectClosed}`, closed, eq(closed.slice(0, 3), expectClosed) && closed[4] >= 50, tag + '-a-viewport.png')
  // (b)
  await press(page, '#inNew'); await winOpen(page)
  const b = await room(page, W, 'b', closed)
  const picB = await shot(page, `${tag}-b-newwindow`)
  let pass, exp
  if (W >= 1340) { exp = 'list stops short of the window (gap>=0); Name/Start/End 110/140/90; Remarks>=145'; pass = b.gap >= 0 && eq(b.cols.slice(0, 3), [110, 140, 90]) && b.cols[4] >= 145 }
  else { exp = 'window covers the list (gap<0), columns same as with no window'; pass = b.gap < 0 && eq(b.cols, closed) }
  rec(W, 'b: press + Input', exp, b, pass, picB)
  // (d) with window open: dates pop-up
  await press(page, '#inRangeBtn'); await page.waitForTimeout(400)
  const popOpen = await page.locator('#inRangePop').isVisible()
  const picD2 = await shot(page, `${tag}-d-dates-withwindow`)
  await press(page, '#inRangeBtn'); await page.waitForTimeout(400)
  const popClosed = !(await page.locator('#inRangePop').isVisible())
  rec(W, 'd: dates pop-up with window open', 'opens then closes', { popOpen, popClosed }, popOpen && popClosed, picD2)
  // Filters with window open (1536 and 1340 only plus all, cheap)
  const hasFiltersBtn = await page.locator('#inFiltersBtn').isVisible()
  if (hasFiltersBtn) { await press(page, '#inFiltersBtn'); await page.waitForTimeout(500)
  const fOpen = await page.locator('#inFilters.open').count()
  const winStill = await page.locator('[data-testid="win-inputedit"]').isVisible()
  const picF = await shot(page, `${tag}-f-filters-withwindow`)
  const bf = await room(page, W, 'f')
  await press(page, '#inFiltersBtn'); await page.waitForTimeout(500)
  const fClosed = (await page.locator('#inFilters.open').count()) === 0
  rec(W, 'f: Filters opened/closed with window open', 'opens, closes, window stays', { fOpen, fClosed, winStill, afterOpen: bf }, fOpen === 1 && fClosed && winStill, picF) } else { await shot(page, `${tag}-f-nofiltersbutton-withwindow`); rec(W, 'f: Filters button', 'n/a on desktop (fields inline)', { filtersBtnVisible: false, fieldsVisible: await page.locator('#inFPerson').isVisible() }, true, `${tag}-f-nofiltersbutton-withwindow.png`) }
  // (c) close by X, Escape, Cancel
  const closes = []
  for (const how of ['x', 'esc', 'cancel']) {
    if (how === 'x') await press(page, '[data-testid="win-inputedit-x"]')
    else if (how === 'esc') await page.keyboard.press('Escape')
    else await press(page, '#inpEditCancel')
    await winGone(page)
    const gone = (await page.locator('[data-testid="win-inputedit"]').count()) === 0
    const c = await colW(page)
    closes.push({ how, gone, cols: c, same: eq(c, closed) })
    if (how === 'x') await shot(page, `${tag}-c-after-x`)
    if (how !== 'cancel') { await press(page, '#inNew'); await winOpen(page) }
  }
  rec(W, 'c: close by X, Escape, Cancel', 'window gone and the list back as before each time', closes, closes.every(c => c.gone && c.same), `${tag}-c-after-x.png`)
  // (d) dates pop-up with window closed
  await press(page, '#inRangeBtn'); await page.waitForTimeout(400)
  const p1 = await page.locator('#inRangePop').isVisible()
  const picD1 = await shot(page, `${tag}-d-dates-nowindow`)
  await press(page, '#inRangeBtn'); await page.waitForTimeout(400)
  const p2 = !(await page.locator('#inRangePop').isVisible())
  rec(W, 'd: dates pop-up, no window', 'opens then closes', { popOpen: p1, popClosed: p2 }, p1 && p2, picD1)
  // (e) click a row
  const nrows = await page.locator('#inBody tr[data-iid]').count()
  if (nrows) {
    await page.locator('#inBody tr[data-iid] .in-open').first().click(); await winOpen(page)
    const e = await room(page, W, 'e')
    const picE = await shot(page, `${tag}-e-rowwindow`)
    rec(W, 'e: click a row', 'same room as (b)', e, W >= 1340 ? (e.gap >= 0 && eq(e.cols.slice(0, 3), [110, 140, 90]) && e.cols[4] >= 145) : (e.gap < 0 && eq(e.cols, closed)), picE)
    await press(page, '[data-testid="win-inputedit-x"]'); await winGone(page)
    rec(W, 'e2: row window closed', 'list as before', await colW(page), eq(await colW(page), closed), '')
  } else rec(W, 'e: click a row', 'rows exist', { nrows }, false, '')
  await ctx.close()
}

async function fileRound(page, W, phone, tag) {
  const touch = phone
  const before = await page.locator('#inBody tr[data-iid], #inList [data-iid]').count()
  await press(page, '#inNew', touch); await winOpen(page)
  const type = await page.locator('#inpEditType').inputValue().catch(() => null)
  const personOpts = await page.locator('#inpEditPerson option').allTextContents()
  // pick the second person
  const val = await page.locator('#inpEditPerson option').nth(1).getAttribute('value')
  await page.locator('#inpEditPerson').selectOption(val)
  // pick a day inside the list window: list "as of today" range -> choose a day a couple of cells after today
  const days = await page.locator('#inpEdCal [data-iso]').evaluateAll(els => els.map(e => ({ iso: e.getAttribute('data-iso'), dis: e.hasAttribute('disabled') || e.getAttribute('aria-disabled') === 'true' })))
  const today = await page.evaluate(() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') })
  const pick = days.filter(d => !d.dis && d.iso > today)[2]
  await shot(page, `${tag}-p1-window`)
  await page.locator(`#inpEdCal [data-iso="${pick.iso}"]`).click()
  await page.locator('#inpEditRmk').fill('walker remark one')
  await shot(page, `${tag}-p2-filled`)
  await press(page, '#inpEditSave', touch)
  const b = page.locator('[data-testid="docconf-nodoc"]'); await b.waitFor({ state: 'visible', timeout: 1500 }).then(() => b.click(), () => {})
  await page.waitForTimeout(900)
  const innew = page.locator('#inBody tr.innew, #inList .icard.innew, #inList [data-fresh]')
  const nNew = await innew.count()
  const after = await page.locator('#inBody tr[data-iid], #inList [data-iid]').count()
  const iid = await page.evaluate(() => { const e = document.querySelector('#inBody tr.innew, #inList .innew, #inList [data-fresh]'); return e && e.getAttribute('data-iid') })
  const winLeft = await page.locator('[data-testid="win-inputedit"]').count()
  await shot(page, `${tag}-p3-added-viewport`)
  if (iid) { const rb = await box(page, `[data-iid="${iid}"]`); if (rb) await shot(page, `${tag}-p3-added-row`, pad(rb, 10)) }
  rec(W, 'plain: file OL via + Input, Add', 'new row appears with the ring', { type, personOpts: personOpts.length, pickedDay: pick.iso, before, after, ringed: nNew, iid, windowStillOpenAfterAdd: winLeft }, after === before + 1 && nNew >= 1 && !!iid, `${tag}-p3-added-viewport.png`)
  if (!iid) return
  // wait the ring out? reopen at once by its row
  await page.waitForTimeout(300)
  const opener = phone ? page.locator(`[data-iid="${iid}"]`).first() : page.locator(`#inBody tr[data-iid="${iid}"] .in-open`).first()
  await (touch ? opener.tap() : opener.click()); await winOpen(page)
  const rmk0 = await page.locator('#inpEditRmk').inputValue()
  await shot(page, `${tag}-p4-reopened`)
  await page.locator('#inpEditRmk').fill('walker remark TWO')
  await press(page, '#inpEditSave', touch)
  await page.waitForTimeout(1000)
  const nb = page.locator('[data-testid="docconf-nodoc"]'); if (await nb.isVisible().catch(() => false)) await nb.click()
  await page.waitForTimeout(500)
  const rowText = await page.locator(`[data-iid="${iid}"]`).first().innerText().catch(() => null)
  const winAfterSave = await page.locator('[data-testid="win-inputedit"]').count()
  await shot(page, `${tag}-p5-saved-viewport`)
  const rb2 = await box(page, `[data-iid="${iid}"]`); if (rb2) await shot(page, `${tag}-p5-saved-row`, pad(rb2, 10))
  rec(W, 'plain: reopen by row, change remark, Save', 'row shows the new remark', { remarkBefore: rmk0, rowText: rowText && rowText.replace(/\s+/g, ' ').slice(0, 200), windowOpenAfterSave: winAfterSave }, !!rowText && /TWO/.test(rowText), `${tag}-p5-saved-viewport.png`)
  // delete from its window
  if (!winAfterSave) { const op = phone ? page.locator(`[data-iid="${iid}"]`).first() : page.locator(`#inBody tr[data-iid="${iid}"] .in-open`).first(); await (touch ? op.tap() : op.click()); await winOpen(page) }
  await shot(page, `${tag}-p6-before-delete`)
  await press(page, '#inpEditDel', touch)
  await page.waitForTimeout(900)
  const sure = page.locator('#inpEditDel, [data-testid*="confirm"]'); // single press deletes at once (D792)
  const gone = (await page.locator(`[data-iid="${iid}"]`).count()) === 0
  const endCount = await page.locator('#inBody tr[data-iid], #inList [data-iid]').count()
  await shot(page, `${tag}-p7-deleted`)
  rec(W, 'plain: delete from its window', 'row gone, nothing left behind', { gone, endCount, before, windowOpen: await page.locator('[data-testid="win-inputedit"]').count() }, gone && endCount === before, `${tag}-p7-deleted.png`)
  if (await page.locator('[data-testid="win-inputedit"]').count()) { await press(page, '[data-testid="win-inputedit-x"]', touch); await winGone(page) }
}

async function calendar(browser, W, H, phone) {
  const ctx = await browser.newContext(phone ? { viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : { viewport: { width: W, height: H }, deviceScaleFactor: 2 })
  await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
  const page = await ctx.newPage()
  page.on('console', m => { if (m.type() === 'error') errors.push(`[cal${W}] console: ${m.text()}`) })
  page.on('pageerror', e => errors.push(`[cal${W}] pageerror: ${e.message}`))
  page.on('response', r => { if (r.status() >= 400) errors.push(`[cal${W}] ${r.status()} ${r.url()}`) })
  await login(page); await go(page, 'inputs')
  await press(page, '#inCalBtn', phone); await page.waitForTimeout(900)
  const tag = (phone ? 'ph' : 'w' + W) + '-cal'
  const state = async () => page.evaluate(() => {
    const b = document.querySelector('[data-testid="ib-expand"]'); if (!b) return null
    const svg = b.querySelector('svg'); const r = b.getBoundingClientRect()
    return { pressed: b.getAttribute('aria-pressed'), label: b.getAttribute('aria-label'), text: b.innerText.trim(), svgPaths: svg ? svg.innerHTML.slice(0, 160) : null, w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y), bg: getComputedStyle(b).backgroundColor, more: [...document.querySelectorAll('#inpCal *')].filter(e => e.children.length === 0 && /^\+\d+ more$/.test(e.textContent.trim())).length, scrollH: document.documentElement.scrollHeight }
  })
  const clip = async name => { const b = await box(page, '[data-testid="ib-expand"]'); await shot(page, name, pad(b, 40)) }
  const s0 = await state(); await clip(`${tag}-1-rest-closeup`); await shot(page, `${tag}-1-rest-month`)
  await press(page, '[data-testid="ib-expand"]', phone); await page.waitForTimeout(900)
  const s1 = await state(); await clip(`${tag}-2-pressed-closeup`); await shot(page, `${tag}-2-pressed-month`)
  await press(page, '[data-testid="ib-expand"]', phone); await page.waitForTimeout(900)
  const s2 = await state(); await clip(`${tag}-3-again-closeup`); await shot(page, `${tag}-3-again-month`)
  rec(phone ? 'phone' : W, 'calendar expand button rest / pressed / pressed again', 'arrows out at rest (aria-pressed false), arrows in when pressed (true) with no "+N more"; back to compact after 2nd press with "+N more"', { rest: s0, pressed: s1, again: s2 }, s0 && s0.pressed === 'false' && s1.pressed === 'true' && s1.more === 0 && s2.pressed === 'false' && s1.svgPaths !== s0.svgPaths && s0.svgPaths === s2.svgPaths, `${tag}-2-pressed-closeup.png`)
  await ctx.close()
}

const browser = await chromium.launch(launchOptions)
try {
  for (const [W, H] of [[1536, 864], [1340, 800], [1280, 800], [1024, 768], [821, 768]]) {
    try { await widthWalk(browser, W, H) } catch (e) { rec(W, 'widthWalk', 'completes', String(e).slice(0, 400), false, '') }
  }
  // phone
  try {
    const { ctx, page } = await listAt(browser, 390, 844, true)
    const row = r1(await page.locator('#inNew').locator('..').boundingBox()), btn = await box(page, '#inNew'), dates = await box(page, '#inRangeBtn')
    await shot(page, 'ph-a-row', pad(row, 16)); await shot(page, 'ph-a-viewport')
    rec('phone', 'a: row', '+ Input first (before dates button)', { row, btn, dates }, btn.x < dates.x, 'ph-a-row.png')
    await press(page, '#inNew', true); await winOpen(page); await shot(page, 'ph-b-newwindow')
    const room0 = await page.locator('.inputs-workspace.in-room').count()
    const w = await box(page, '[data-testid="win-inputedit"]')
    rec('phone', 'b: + Input window', 'no room made (no .in-room); window in the middle', { inRoom: room0, win: w }, room0 === 0, 'ph-b-newwindow.png')
    const under = await page.evaluate(() => { const r = document.querySelector('#inRangeBtn').getBoundingClientRect(); const e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { topIsButton: !!e && !!e.closest('#inRangeBtn'), top: e && (e.id || e.className || e.tagName) } })
    rec('phone', 'd: dates button with window open', 'window covers the whole screen; button not reachable (as D909/D996 built)', under, !under.topIsButton, 'ph-b-newwindow.png')
    const cl = []
    for (const how of ['x', 'esc', 'cancel']) {
      if (how === 'x') await press(page, '[data-testid="win-inputedit-x"]', true); else if (how === 'esc') await page.keyboard.press('Escape'); else await press(page, '#inpEditCancel', true)
      await winGone(page); cl.push({ how, gone: (await page.locator('[data-testid="win-inputedit"]').count()) === 0 })
      if (how !== 'cancel') { await press(page, '#inNew', true); await winOpen(page) }
    }
    rec('phone', 'c: close X/Esc/Cancel', 'gone each time', cl, cl.every(c => c.gone), '')
    await press(page, '#inRangeBtn', true); await page.waitForTimeout(400)
    const po = await page.locator('#inRangePop').isVisible(); await shot(page, 'ph-d-dates-nowindow'); await press(page, '#inRangeBtn', true); await page.waitForTimeout(400)
    rec('phone', 'd: dates pop-up, no window', 'opens/closes', { open: po, closed: !(await page.locator('#inRangePop').isVisible()) }, po && !(await page.locator('#inRangePop').isVisible()), 'ph-d-dates-nowindow.png')
    await press(page, '#inFiltersBtn', true); await page.waitForTimeout(500); await shot(page, 'ph-f-filters'); await press(page, '#inFiltersBtn', true); await page.waitForTimeout(400)
    await fileRound(page, 390, true, 'ph')
    await ctx.close()
  } catch (e) { rec('phone', 'phone walk', 'completes', String(e).slice(0, 500), false, '') }
  // plain-user round at 1536
  try {
    const { ctx, page } = await listAt(browser, 1536, 864, false)
    await fileRound(page, 1536, false, 'w1536')
    await ctx.close()
  } catch (e) { rec(1536, 'plain round', 'completes', String(e).slice(0, 500), false, '') }
  // calendar
  try { await calendar(browser, 1536, 864, false) } catch (e) { rec(1536, 'calendar', 'completes', String(e).slice(0, 500), false, '') }
  try { await calendar(browser, 390, 844, true) } catch (e) { rec('phone', 'calendar', 'completes', String(e).slice(0, 500), false, '') }
} finally {
  await browser.close()
  writeFileSync(join(OUT, 'walk-results.json'), JSON.stringify({ results, errors }, null, 1))
  console.log('ERRORS', JSON.stringify(errors))
}
