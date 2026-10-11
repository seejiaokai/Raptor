// A MOCK-UP, NOT A BUILD — how a CANCELLED input could look on the Inputs pages (the one-rule plan's step 5; owner D760:
// "a CX the scheduler puts on a row that came from an input cancels the input itself: the Inputs calendar shows it
// cancelled with its reason"). The cancelling is BUILT (step 4); how the Inputs calendar shows it is not. So this script:
//   1. makes it real, by real presses — files "Range brief" (Training, 09:00–10:00, "Bring your kit") for Ranger and Hex
//      on Wed 15 Jul 2026 in a fresh demo store, then cancels it on the Scheduler Board (its row's CX button, reason WX).
//      If the board cannot be driven it sets the input's two cancel fields directly and SAYS SO in what it prints;
//   2. takes ONE real picture, nothing injected: the cancelled row on Edit Schedule's week — what the schedule already says;
//   3. draws TWO proposed looks on the real Inputs screens — the month's bar, the opened day's card, the List's row — by
//      injecting a stylesheet and a few spans (class "mockx"). Nothing injected is in the app.
//        A  the plan's words: the title struck through, "CANCELLED — WX" in red where the remark begins, the bar struck
//           and faded;
//        B  quieter: nothing struck, a small red CX tag before the title and the reason after it, "CX · " on the bar.
// Phone (iPhone 13) and desktop (1440×900), every picture at twice the pixels so it stays sharp when he zooms.
// A PHONE'S MONTH shows three bars a day and folds the rest behind "+N more", and Wed 15 Jul is a full day in the demo —
// so for the phone's picture of the BAR alone a second, identical input is filed and cancelled the same way on Fri 17 Jul.
//
//   npm run build && npx vite preview --port 4186 --strictPort
//   node scripts/handpass/onerule-mock-cancelled.mjs [out dir]        (default docs/mock/2026-10-12-one-rule)
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const OUT = process.argv[2] || 'docs/mock/2026-10-12-one-rule'
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

/* THE TWO LOOKS. Everything is scoped to the cancelled input's own id, so no other input on the page changes. The red is
   the app's own (--hard), the strike is the schedule's own cancelled strike (12-schedule-editing.css), the label's size
   and spacing are the card's own kind label's (.icard-kind), the pill is the schedule's own CX tag (.cxtag) a size up. */
const css = (v, ids) => ids.map(X => v === 'A' ? `
  .ib-bar[data-iid="${X}"]{text-decoration:line-through;text-decoration-color:rgba(255,255,255,.9);text-decoration-thickness:1px;opacity:.6}
  .icard[data-popiid="${X}"] .icard-title,tr[data-iid="${X}"] .intitle{text-decoration:line-through;text-decoration-color:rgba(240,85,95,.85);
    text-decoration-thickness:1px;text-decoration-skip-ink:none;color:var(--ink-2)}
` : `
  .ib-bar[data-iid="${X}"]{opacity:.7}
  .ib-bar[data-iid="${X}"]::before{content:'CX · ';font-weight:800;color:#FBB4B9}
`).join('') + `
  .mockx.cxl{font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--hard);white-space:nowrap}
  tr .mockx.cxl{margin-right:8px}
  .mockx.cxpill{display:inline-block;vertical-align:1px;font-size:9.5px;font-weight:800;letter-spacing:.06em;line-height:1.5;color:#fff;
    background:var(--hard);border-radius:3px;padding:0 5px;margin-right:6px}
  .mockx.cxwhy{font-size:12px;font-weight:400;color:var(--ink-3);margin-left:6px}
`
/* the stylesheet, and the spans put in again on whatever the page has drawn (a redraw drops them) */
const paint = (page, v, ids, why) => page.evaluate(([v, ids, why, sheet]) => {
  document.querySelectorAll('.mockx').forEach(e => e.remove())
  let st = document.getElementById('mockx-style'); if (!st) { st = document.createElement('style'); st.id = 'mockx-style'; document.head.appendChild(st) }
  st.textContent = sheet
  const mk = (cls, txt) => { const s = document.createElement('span'); s.className = 'mockx ' + cls; s.textContent = txt; return s }
  const sep = () => mk('icard-rmk', ' · ')
  for (const X of ids) {
    document.querySelectorAll(`.icard[data-popiid="${X}"]`).forEach(card => {
      const title = card.querySelector('.icard-title'), rmk = card.querySelector('[data-testid$="-rmk"]'), text = card.querySelector('.icard-text')
      if (v === 'A') {
        /* "CANCELLED — WX" where the remark begins; the remark itself after it, grey as ever */
        if (rmk) rmk.before(mk('cxl', 'Cancelled — ' + why), sep()); else if (text) text.append(sep(), mk('cxl', 'Cancelled — ' + why))
      } else if (title) { title.before(mk('cxpill', 'CX')); title.after(mk('cxwhy', why)) }
    })
    document.querySelectorAll(`tr[data-iid="${X}"]`).forEach(tr => {
      const title = tr.querySelector('.intitle'), cell = tr.querySelector('td[data-label="Remarks"]')
      if (v === 'A') {
        if (!cell) return
        const late = cell.querySelector('.latetag'), lab = mk('cxl', 'Cancelled — ' + why)
        if (late) late.after(lab); else cell.prepend(lab)
      } else if (title) { title.prepend(mk('cxpill', 'CX')); title.append(mk('cxwhy', why)) }
    })
  }
}, [v, ids, why, css(v, ids)])

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
    await paint(page, v, ids, IN.why); await quiet()
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
    await page.screenshot({ path: file(`cancelled-real-${size}-schedule-full.png`) })
    const b = await boxOf(rowSel)
    /* the row with the Ground Programme's heading above it and the next rows below */
    await clip(`cancelled-real-${size}-schedule-row.png`, b, [78, 14, 96, 14])
  }

  /* 4 — the two looks, on the three Inputs surfaces */
  await toMonth()
  const barHere = await page.locator(`.ib-bar[data-iid="${X}"]`).count()
  if (!barHere) say('bar', 'this size folds the day\'s later inputs behind "+N more", so the bar of Wed 15 Jul is not on the month — a second, identical input is filed on Fri 17 Jul for the bar\'s picture, after the card and the List are taken')
  let listAll = false
  for (const v of ['A', 'B']) {
    if (barHere) await barShots(v, [X], DAY)
    /* the opened day's card */
    await toMonth(); await openDay()
    await paint(page, v, [X], IN.why); await quiet()
    const card = page.locator(`[data-testid="win-inputsday"] .icard[data-popiid="${X}"]`).first()
    await card.scrollIntoViewIfNeeded()
    say(`${v} card`, JSON.stringify((await card.innerText()).replace(/\s+/g, ' ')))
    await page.screenshot({ path: file(`cancelled-${v}-${size}-day-full.png`) })
    /* the card with the card above it, for comparison with an input that stands */
    await clip(`cancelled-${v}-${size}-card.png`, await card.boundingBox(), [66, 12, 14, 12])
    await closeDay()
    /* the List's row (a table row on a desktop, the same card on a phone) — the List opens on the next two weeks, so
       its dates are set to "All dates" first */
    await press(page.locator('#inListBtn'))
    await page.waitForTimeout(400)
    if (!listAll) { await press(page.locator('#inRangeBtn')); await press(page.locator('#inRangeAll')); await page.waitForTimeout(400); listAll = true }
    const rowL = page.locator(size === 'desk' ? `tr[data-iid="${X}"]` : `.icard[data-iid="${X}"]`).first()
    if (await rowL.count()) {
      await rowL.evaluate(e => e.scrollIntoView({ block: 'center' }))
      await page.waitForTimeout(300)
      await paint(page, v, [X], IN.why); await quiet()
      say(`${v} list row`, JSON.stringify((await rowL.innerText()).replace(/\s+/g, ' ')))
      await page.screenshot({ path: file(`cancelled-${v}-${size}-list-full.png`) })
      await clip(`cancelled-${v}-${size}-list.png`, await rowL.boundingBox(), size === 'desk' ? [62, 0, 62, 0] : [70, 12, 70, 12])
    } else say(`${v} list row`, 'NOT FOUND on the List')
    await press(page.locator('#inCalBtn'))
    await page.waitForTimeout(200)
  }
  if (!barHere) {
    const r2 = await fileIt(DAY2, 'Jul 17')
    if (r2) {
      await cancelIt(r2.iid, DI2, 'Jul 17')
      for (const v of ['A', 'B']) await barShots(v, [X, r2.iid], DAY2)
    }
  }

  console.log(size, errors.length ? 'ERRORS ' + errors.join(' | ') : 'no console errors, page errors or failed requests')
  await ctx.close()
}
await browser.close()
