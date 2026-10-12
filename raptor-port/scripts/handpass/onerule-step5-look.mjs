// THE LOOK OF A CANCELLED INPUT, AS BUILT (the one-rule plan's step 5 — owner D767, D768; 12 Oct 26). NOTHING IS INJECTED:
// the same real presses as the mock-up that was put to him (onerule-mock-cancelled.mjs) — "Range brief" (Training,
// 09:00–10:00, "Bring your kit") filed for Ranger and Hex on Wed 15 Jul 2026 in a fresh demo store, cancelled on the
// Scheduler Board by its row's CX button, reason WX — and then pictures of what the BUILD draws:
//   the month's bar · the opened day's card · the List's row (a table row on a desktop, the card on a phone) ·
//   the schedule's Personal Inputs line on Edit Schedule's week and on the Scheduler Board · its Ground Programme row.
// Then a second input with NO title of its own, cancelled with NO reason (D767 readings 2 and 4), and the first one
// brought back by the same button — its card must read as any card again.
// Phone (iPhone 13) and desktop (1440x900), twice the pixels.
//
//   npm run build && npx vite preview --port 4186 --strictPort
//   node scripts/handpass/onerule-step5-look.mjs [out dir]        (default docs/handpass/2026-10-12-one-rule-step5)
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const OUT = process.argv[2] || 'docs/handpass/2026-10-12-one-rule-step5'
const URL = process.env.LOOK_URL || 'http://localhost:4186/'
mkdirSync(OUT, { recursive: true })
const SIZES = {
  desk: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
  phone: { ...devices['iPhone 13'], deviceScaleFactor: 2 },
}
const DAY = '2026-07-15', DI = 2
const DAY2 = '2026-07-17', DI2 = 4      // a quieter day: where a phone's month has room to show the bar
const IN = { title: 'Range brief', rmk: 'Bring your kit', pick: ['bane', 'rocky'], from: '09:00', to: '10:00', why: 'WX' }
const MON = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

const browser = await chromium.launch(launchOptions)
for (const size of Object.keys(SIZES)) {
  const ctx = await browser.newContext(SIZES[size])
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e)))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`) })
  const press = loc => (size === 'desk' ? loc.click() : loc.tap())
  const VW = SIZES[size].viewport.width, VH = SIZES[size].viewport.height
  const file = name => join(OUT, name)
  const say = (step, what) => console.log(`${size} ${step}: ${what}`)
  const note = async () => (await page.locator('#toastEl').innerText().catch(() => '')).replace(/\s+/g, ' ').trim()
  const quiet = () => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' })   // a passing note is not part of the look
  /* a picture of a box on the page, with a margin of context ([top, right, bottom, left]), never past the screen's edge */
  const clip = async (name, box, pad = [10, 10, 10, 10]) => {
    const x = Math.max(0, box.x - pad[3]), y = Math.max(0, box.y - pad[0])
    const w = Math.min(VW, box.x + box.width + pad[1]) - x, h = Math.min(VH, box.y + box.height + pad[2]) - y
    await page.screenshot({ path: file(name), clip: { x, y, width: w, height: h } })
  }
  const boxOf = sel => page.locator(sel).first().boundingBox()
  const toMonth = async () => {
    await page.evaluate(() => window.go('inputs'))
    await page.locator('#inpCal').waitFor()
    if (await page.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await press(page.locator('#inCalBtn'))
    const at = async () => { const [m, y] = (await page.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MON.findIndex(x => x.startsWith(m)) }
    let d = 2026 * 12 + 6 - await at()
    for (; d > 0; d--) await press(page.locator('#icNext'))
    for (; d < 0; d++) await press(page.locator('#icPrev'))
    await page.waitForSelector(`[data-icday="${DAY}"]`)
  }
  const openDay = async (day = DAY) => {
    await page.locator(`[data-icday="${day}"]`).focus()
    await page.keyboard.press('Enter')
    await page.waitForSelector('[data-testid="win-inputsday"]')
    await page.waitForTimeout(350)
  }
  const closeDay = async () => { const x = page.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) { await press(x); await page.waitForTimeout(250) } }
  const rec = label => page.evaluate(([t, d]) => { const r = window.INPUTS.find(x => x.title === t && x.date === d); return r ? { iid: r.iid, people: (r.people || []).map(e => e.p), cx: !!r.cx, cxr: r.cxr || '' } : null }, [IN.title, label])
  /* FILE IT by real presses — the Inputs calendar's day, "+ Input", "Several people", the title, the hours, the remark */
  const fileIt = async (day, label) => {
    await toMonth(); await openDay(day)
    await press(page.locator('#icPopAdd'))
    await page.waitForSelector('#inpEditPop [data-testid="pp-several"]')
    await press(page.locator('#inpEditPop [data-testid="pp-several"]'))
    for (const p of IN.pick) if (await page.locator(`#inpEditPop [data-pp="${p}"]`).getAttribute('aria-pressed') !== 'true') await press(page.locator(`#inpEditPop [data-pp="${p}"]`))
    const lit = await page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
    for (const id of lit) if (!IN.pick.includes(id)) await press(page.locator(`#inpEditPop [data-pp="${id}"]`))
    await page.locator('#inpEditPop #inpEditOwnTitle').first().fill(IN.title)
    await page.locator('#inpEditPop #inpEditStart').fill(IN.from)
    await page.locator('#inpEditPop #inpEditEnd').fill(IN.to)
    await page.locator('#inpEditPop #inpEditRmk').fill(IN.rmk)
    await press(page.locator('#inpEditSave'))
    await page.waitForTimeout(600)
    const r = await rec(label)
    say('filed ' + label, JSON.stringify(r) + ' — ' + await note())
    await closeDay()
    return r
  }
  /* CANCEL IT: the Scheduler Board's own CX button on its row, the reason picked in the CX window. Where the board cannot
     be driven the two cancel fields are set directly — and what is printed says which way it went. */
  const cancelIt = async (id, di, label) => {
    let how = 'on the Scheduler Board — its row\'s CX button, the reason ' + IN.why + ' picked in the CX window'
    try {
      await page.evaluate(() => window.go('editsched'))
      await page.locator('#eWeek .day').first().waitFor()
      const ri = await page.evaluate(([di, id]) => (window.DAYS[di].ground || []).findIndex(g => g.src === id), [di, id])
      const d = page.locator(`#eWeek [data-sbday="${di}"]:visible`).first()
      await d.scrollIntoViewIfNeeded(); await press(d)
      await page.waitForSelector('#schedBoard', { timeout: 5000 })
      const cx = page.locator(`#schedBoard [data-grcx="${di}.${ri}"]`).first()
      await cx.scrollIntoViewIfNeeded(); await press(cx)
      await page.waitForSelector('#cxSave', { timeout: 4000 })
      const q = page.locator(`#cxQuick [data-cxq="${IN.why}"]`).first()
      if (await q.count()) await press(q); else await page.locator('#cxReason').fill(IN.why)
      await press(page.locator('#cxSave'))
      await page.waitForTimeout(500)
      await press(page.locator('#sbDone'))
      await page.waitForTimeout(500)
    } catch (e) { say('board', 'could not be driven — ' + String(e).split('\n')[0]) }
    let r = await rec(label)
    if (!r.cx) {
      how = 'SET DIRECTLY for the mock (the board could not be driven)'
      await page.evaluate(([id, why]) => { const x = window.INPUTS.find(i => i.iid === id); x.cx = true; x.cxr = why }, [id, IN.why])
      await page.evaluate(() => window.go('viewsched')); await page.waitForTimeout(200)
      r = await rec(label)
    }
    say('cancelled ' + label, JSON.stringify(r) + ' — ' + how)
  }
  /* the month's bar: the whole screen, and the bar's own week */
  const barShots = async (v, ids, day) => {
    await toMonth(); await page.waitForTimeout(300)
    await quiet()
    const sel = ids.map(i => `.ib-bar[data-iid="${i}"]`).join(',')
    say(`${v} bar`, JSON.stringify(await page.evaluate(s => [...document.querySelectorAll(s)].map(e => ({ text: getComputedStyle(e, '::before').content.replace(/^none$|"/g, '') + e.textContent, w: Math.round(e.getBoundingClientRect().width), cut: e.scrollWidth > e.clientWidth })), sel)))
    await page.screenshot({ path: file(`cancelled-${v}-${size}-month-full.png`) })
    /* the bar in its own week — Monday to Sunday, so every bar that runs through the day keeps its name */
    const cell = await boxOf(`[data-icday="${day}"]`)
    const mon = await page.evaluate(() => { const c = document.querySelector('[data-icday="2026-07-13"]').getBoundingClientRect(), s = document.querySelector('[data-icday="2026-07-19"]').getBoundingClientRect(); return { x: c.x, right: s.right } })
    await clip(`cancelled-${v}-${size}-bar.png`, { x: mon.x, y: cell.y, width: mon.right - mon.x, height: cell.height }, [6, 6, 6, 6])
  }

  await page.goto(URL + '?fresh=1')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')

  /* 1, 2 — file it and cancel it, by real presses */
  const r = await fileIt(DAY, 'Jul 15')
  if (!r) { say('STOP', 'the input was not filed'); await ctx.close(); continue }
  const X = r.iid
  await cancelIt(X, DI, 'Jul 15')

  /* 3 — the ONE real picture: its row on Edit Schedule's week, as the schedule already shows a cancelled input */
  await page.evaluate(() => window.go('editsched'))
  await page.locator('#eWeek .day').first().waitFor()
  await page.waitForTimeout(400)
  const rowSel = '#eWeek .pl-row.cx.gr-frominput'
  say('schedule row', JSON.stringify(await page.locator(rowSel).first().innerText().catch(() => '(no cancelled row found on the week)')))
  if (await page.locator(rowSel).count()) {
    await page.locator(rowSel).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
    await page.waitForTimeout(500); await quiet()
    await page.screenshot({ path: file(`built-cx-${size}-schedule-full.png`) })
    const b = await boxOf(rowSel)
    /* the row with the Ground Programme's heading above it and the next rows below */
    await clip(`built-cx-${size}-schedule-row.png`, b, [78, 14, 96, 14])
  }

  /* 4 — what the build draws, on the three Inputs surfaces */
  const facts = (sel) => page.evaluate(s => [...document.querySelectorAll(s)].map(e => {
    const q = c => e.querySelector(c), cs = x => x ? getComputedStyle(x) : null
    const t = q('.icard-title, .intitle'), k = q('.icard-kind, .intag'), w = q('.icx-why'), g = q('.icx')
    return { text: e.innerText.replace(/\s+/g, ' '), tag: g ? g.textContent + ' ' + cs(g).backgroundColor : null,
      titleStrike: t ? cs(t).textDecorationLine : null, kindStrike: k ? cs(k).textDecorationLine : null, why: w ? w.textContent + ' ' + cs(w).color : null,
      h: Math.round(e.getBoundingClientRect().height), over: e.scrollWidth > e.clientWidth }
  }), sel)
  let listAll = false
  const shots = async (X, tag, day = DAY) => {
    await toMonth(); await page.waitForTimeout(300); await quiet()
    const barSel = `.ib-bar[data-iid="${X}"]`
    if (await page.locator(barSel).count()) {
      say(`${tag} bar`, JSON.stringify(await page.evaluate(s => [...document.querySelectorAll(s)].map(e => ({ text: e.textContent, strike: getComputedStyle(e).textDecorationLine, opacity: getComputedStyle(e).opacity, tip: e.getAttribute('title') })), barSel)))
      await page.screenshot({ path: file(`built-${tag}-${size}-month-full.png`) })
      const cell = await boxOf(`[data-icday="${day}"]`)
      const mon = await page.evaluate(() => { const c = document.querySelector('[data-icday="2026-07-13"]').getBoundingClientRect(), s = document.querySelector('[data-icday="2026-07-19"]').getBoundingClientRect(); return { x: c.x, right: s.right } })
      await clip(`built-${tag}-${size}-bar.png`, { x: mon.x, y: cell.y, width: mon.right - mon.x, height: cell.height }, [6, 6, 6, 6])
    } else say(`${tag} bar`, 'behind "+N more" on this size (D768: it keeps its place)')
    await openDay(day); await quiet()
    const cardSel = `[data-testid="win-inputsday"] .icard[data-popiid="${X}"]`
    await page.locator(cardSel).first().scrollIntoViewIfNeeded()
    say(`${tag} card`, JSON.stringify(await facts(cardSel)))
    await page.screenshot({ path: file(`built-${tag}-${size}-day-full.png`) })
    await clip(`built-${tag}-${size}-card.png`, await page.locator(cardSel).first().boundingBox(), [66, 12, 14, 12])
    await closeDay()
    await press(page.locator('#inListBtn')); await page.waitForTimeout(400)
    const rowSel = size === 'desk' ? `tr[data-iid="${X}"]` : `.icard[data-iid="${X}"]`
    if (!listAll || !(await page.locator(rowSel).count())) { if (!(await page.locator('#inRangeAll').count())) await press(page.locator('#inRangeBtn')); await press(page.locator('#inRangeAll')); await page.waitForTimeout(400); listAll = true }
    if (await page.locator(rowSel).count()) {
      await page.locator(rowSel).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300); await quiet()
      say(`${tag} list row`, JSON.stringify(await facts(rowSel)))
      await page.screenshot({ path: file(`built-${tag}-${size}-list-full.png`) })
      await clip(`built-${tag}-${size}-list.png`, await page.locator(rowSel).first().boundingBox(), size === 'desk' ? [62, 0, 62, 0] : [70, 12, 70, 12])
    } else say(`${tag} list row`, 'NOT FOUND on the List')
    await press(page.locator('#inCalBtn')); await page.waitForTimeout(200)
  }
  await shots(X, 'cx')

  /* 4b — its own window says it is cancelled (owner D771, 12 Oct 26): the card pressed, the window's title bar */
  await toMonth(); await openDay(DAY)
  await press(page.locator(`[data-testid="win-inputsday"] .icard[data-popiid="${X}"]`).first())
  await page.waitForSelector('#inpEditPop', { timeout: 5000 }); await page.waitForTimeout(400); await quiet()
  say('cx window', JSON.stringify(await page.evaluate(() => {
    const m = document.querySelector('[data-testid="inped-cx"]'); if (!m) return null
    const bar = m.closest('.win-bar, .airpop-head'), r = m.getBoundingClientRect(), b = bar.getBoundingClientRect()
    const t = bar.querySelector('.win-ttl, #inpEditTitle'), x = bar.querySelector('.win-x, #inpEditClose')
    return { text: m.textContent, tag: getComputedStyle(m.querySelector('.icx')).backgroundColor, why: m.querySelector('.icx-why') ? getComputedStyle(m.querySelector('.icx-why')).color : null,
      title: t.textContent, inBar: r.left >= b.left && r.right <= b.right && r.top >= b.top - 1 && r.bottom <= b.bottom + 1,
      afterTitle: r.left >= t.getBoundingClientRect().left, beforeCross: r.right <= x.getBoundingClientRect().left + 1, barH: Math.round(b.height), controls: m.querySelectorAll('button,input').length }
  })))
  await page.screenshot({ path: file(`built-cx-${size}-window-full.png`) })
  { const bar = await page.locator('[data-testid="inped-cx"]').first().evaluateHandle(e => e.closest('.win-bar, .airpop-head')); const bb = await bar.asElement().boundingBox(); await clip(`built-cx-${size}-window-title.png`, bb, [10, 10, 60, 10]) }
  { const x = page.locator('[data-testid="win-inputedit-x"]:visible, #inpEditClose:visible').first(); if (await x.count()) await press(x); await page.waitForTimeout(300) }
  await closeDay()

  /* 5 — the schedule's own Personal Inputs line: Edit Schedule's week (its fold opened), then the Scheduler Board */
  await page.evaluate(() => window.go('editsched'))
  await page.locator('#eWeek .day').first().waitFor(); await page.waitForTimeout(300)
  const fold = page.locator(`#eWeek .sec-inp .pl-fold[data-pitog="${DI}"]`).first()
  if (await fold.count()) { await fold.scrollIntoViewIfNeeded(); await press(fold); await page.waitForTimeout(300) }
  const wl = page.locator('#eWeek .sec-inp .pl-row', { hasText: IN.title }).first()
  if (await wl.count()) {
    await wl.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(400); await quiet()
    say('week line', JSON.stringify(await wl.evaluate(e => ({ text: e.innerText.replace(/\s+/g, ' '), tag: (e.querySelector('.cxtag') || {}).textContent || null, nameStrike: e.querySelector('.inp-cx') ? getComputedStyle(e.querySelector('.inp-cx')).textDecorationLine : null, pucks: e.querySelectorAll('.puck').length }))))
    await clip(`built-cx-${size}-week-inputs-line.png`, await wl.boundingBox(), [70, 14, 60, 14])
  } else say('week line', 'NOT FOUND under Personal Inputs on the week')
  const d = page.locator(`#eWeek [data-sbday="${DI}"]:visible`).first()
  await d.scrollIntoViewIfNeeded(); await press(d)
  await page.waitForSelector('#schedBoard', { timeout: 5000 }); await page.waitForTimeout(300)
  const bfold = page.locator(`#schedBoard .pinp .pl-fold[data-pitog="${DI}"]`).first()
  if (await bfold.count() && !(await page.locator('#schedBoard .pinp .sb-arow').count())) { await bfold.scrollIntoViewIfNeeded(); await press(bfold); await page.waitForTimeout(300) }
  const bl = page.locator('#schedBoard .pinp .sb-arow.inprow').filter({ has: page.locator('.cxtag') }).first()
  if (await bl.count()) {
    await bl.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(400); await quiet()
    say('board line', JSON.stringify(await bl.evaluate(e => ({ tag: (e.querySelector('.cxtag') || {}).textContent || null, name: (e.querySelector('.inp-cx') || {}).textContent || null, nameStrike: e.querySelector('.inp-cx') ? getComputedStyle(e.querySelector('.inp-cx')).textDecorationLine : null, cols: e.children.length, w: Math.round(e.getBoundingClientRect().width), over: e.scrollWidth > e.clientWidth }))))
    await page.screenshot({ path: file(`built-cx-${size}-board-full.png`) })
    await clip(`built-cx-${size}-board-inputs-line.png`, await bl.boundingBox(), [70, 10, 60, 10])
  } else say('board line', 'NOT FOUND in the board\'s Personal Inputs panel')
  await press(page.locator('#sbDone')); await page.waitForTimeout(400)

  /* 6 — D767 readings 2 and 4: no title of its own, cancelled with no reason */
  const fileBare = async () => {
    await toMonth(); await openDay(DAY2)
    await press(page.locator('#icPopAdd'))
    await page.waitForSelector('#inpEditPop [data-testid="pp-several"]')
    await press(page.locator('#inpEditPop [data-testid="pp-several"]'))
    for (const p of IN.pick) if (await page.locator(`#inpEditPop [data-pp="${p}"]`).getAttribute('aria-pressed') !== 'true') await press(page.locator(`#inpEditPop [data-pp="${p}"]`))
    const lit = await page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
    for (const id of lit) if (!IN.pick.includes(id)) await press(page.locator(`#inpEditPop [data-pp="${id}"]`))
    await page.locator('#inpEditPop #inpEditStart').fill(IN.from)
    await page.locator('#inpEditPop #inpEditEnd').fill(IN.to)
    await press(page.locator('#inpEditSave')); await page.waitForTimeout(600)
    const r = await page.evaluate(() => { const l = window.INPUTS.filter(x => x.date === 'Jul 17' && (x.people || []).length === 2); const r = l[l.length - 1]; return r ? { iid: r.iid, title: r.title || '', type: r.type } : null })
    say('filed bare', JSON.stringify(r) + ' — ' + await note()); await closeDay(); return r
  }
  const cxPress = async (di, id, un) => {
    await page.evaluate(() => window.go('editsched')); await page.locator('#eWeek .day').first().waitFor()
    const ri = await page.evaluate(([di, id]) => (window.DAYS[di].ground || []).findIndex(g => g.src === id), [di, id])
    const dd = page.locator(`#eWeek [data-sbday="${di}"]:visible`).first(); await dd.scrollIntoViewIfNeeded(); await press(dd)
    await page.waitForSelector('#schedBoard', { timeout: 5000 })
    const b = page.locator(`#schedBoard [data-grcx="${di}.${ri}"]`).first(); await b.scrollIntoViewIfNeeded(); await press(b)
    await page.waitForTimeout(500)
    if (await page.locator('#cxSave').count()) { await press(page.locator(un ? '#cxUn' : '#cxSave')); await page.waitForTimeout(500) }
    if (await page.locator('#sbDone').count()) { await press(page.locator('#sbDone')); await page.waitForTimeout(400) }
    return page.evaluate(id => { const x = window.INPUTS.find(i => i.iid === id); return { cx: x.cx, cxr: x.cxr || '' } }, id)
  }
  const bare = await fileBare()
  if (bare) {
    say('bare cancelled', JSON.stringify(await cxPress(DI2, bare.iid)))
    await shots(bare.iid, 'bare', DAY2)
  }

  /* 7 — brought back by the same button: the first input's card reads as any card */
  say('brought back', JSON.stringify(await cxPress(DI, X, true)))
  await shots(X, 'back')

  console.log(size, errors.length ? 'ERRORS ' + errors.join(' | ') : 'no console errors, page errors or failed requests')
  await ctx.close()
}
await browser.close()
