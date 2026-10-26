/* [UI-CONSISTENCY-LOOK] / [INPUTS-SANS-HEAD-SAME] (D1123, D1124) — round 1's pictures: today's screens with the mismatched
   parts ringed and numbered, and the proposed Inputs / SANS top row DRAWN on the running app (its own nodes moved, the
   SANS month given the Inputs month's style, the row's buttons drawn 36 tall as the tabs). Desktop 1536 × 864 (his PC),
   phone 402 × 874 (touch). Every picture is real except the ones named "proposed".
   Run: HP_URL=http://localhost:<port> HP_SHOTS=<folder> node scripts/handpass/bsw-consistency-look.mjs → <folder>/look1/ */
import { existsSync, mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, SHOTS, login, go } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = SHOTS + '/look1'; mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const PC = { width: 1536, height: 864 }, PHONE = { width: 402, height: 874 }
async function world(vp, touch) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
  const page = await ctx.newPage(); await page.goto(BASE + '/'); await login(page, 'a')
  await page.addStyleTag({ content: '.toast,.snack,[role=status].toast{display:none!important}' })
  return { ctx, page }
}
/* ring each selector's box (amber, numbered) — drawn over the page, not part of it */
async function ring(page, marks) {
  await page.evaluate(marks => {
    document.querySelectorAll('.zz-ring').forEach(e => e.remove())
    for (const [sel, n] of marks) {
      const els = [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0)
      if (!els.length) throw new Error('ring: nothing at ' + sel)
      const rs = els.map(e => e.getBoundingClientRect())
      const l = Math.min(...rs.map(r => r.left)), t = Math.min(...rs.map(r => r.top)), r = Math.max(...rs.map(r => r.right)), b = Math.max(...rs.map(r => r.bottom))
      const d = document.createElement('div'); d.className = 'zz-ring'
      d.style.cssText = `position:fixed;left:${l - 4}px;top:${t - 4}px;width:${r - l + 8}px;height:${b - t + 8}px;border:3px solid #ffb020;border-radius:10px;z-index:99999;pointer-events:none`
      if (n) { const s = document.createElement('span'); s.textContent = n; s.style.cssText = 'position:absolute;left:-3px;top:-24px;background:#ffb020;color:#000;font:800 13px/20px sans-serif;padding:0 7px;border-radius:6px'; d.appendChild(s) }
      document.body.appendChild(d)
    }
  }, marks)
}
const unring = page => page.evaluate(() => document.querySelectorAll('.zz-ring').forEach(e => e.remove()))
async function shot(page, name, y, h, vp) {
  const top = await page.evaluate(() => document.querySelector('.topbar').getBoundingClientRect().bottom)
  await page.screenshot({ path: `${OUT}/${name}.png`, clip: { x: 0, y: Math.max(0, top + y), width: vp.width, height: h } })
}
const press = async (page, sel, touch) => { const l = page.locator(sel).first(); if (touch) await l.tap(); else await l.click(); await sleep(450) }
/* THE PROPOSED ROW, drawn: on Inputs the arrows, month and Today follow the tabs and the Calendar / List switch goes to the
   right end before the filters (as the phone has it, D705) — on the List it stays there (D687); on SANS its month row joins
   the tabs' row, Highlight and the gear at the right end; one month style (the Inputs month's), every button 36 drawn. */
const PROPOSED_CSS = `
  .inputs-top>.inputs-tabs{order:0} .inputs-top>.ic-nav{order:1} .inputs-top>.inputs-spring{order:2}
  .inputs-top>.inputs-views{order:3} .inputs-top>.inputs-filterfields{order:4} .inputs-top>.inputs-gear,.inputs-top>#inGear{order:5}
  @media (min-width:821px){
    .inputs-top .abtn:where(:not(.inrange-pop .abtn)),.inputs-top .inputs-filterfields input,.inputs-top .inputs-filterfields select{min-height:36px!important;height:36px;padding-top:4px;padding-bottom:4px}
  }
  .sanscal .sc-month{font-size:18px!important;font-weight:700!important;letter-spacing:.05em!important}
  @media (max-width:820px){ .sanscal .sc-month{font-size:16px!important;letter-spacing:.03em!important} }
`
async function proposeSans(page) {
  await page.addStyleTag({ content: PROPOSED_CSS })
  await page.evaluate(() => {
    if (innerWidth <= 820) return   // the phone's row stays its own (D705) — only the month's style changes there
    /* the tabs move INTO the SANS month row (its own box keeps every SANS style); the emptied tabs row is hidden */
    const top = document.querySelector('.inputs-top'), head = document.querySelector('.sc-head')
    head.insertBefore(document.querySelector('.inputs-tabs'), head.firstChild); top.style.display = 'none'
    head.style.gap = getComputedStyle(top).columnGap
  })
  await sleep(200)
}
async function proposeInputs(page) { await page.addStyleTag({ content: PROPOSED_CSS }); await sleep(200) }

{ /* ---- the desktop ---- */
  const { ctx, page } = await world(PC, false)
  await go(page, 'inputs'); await sleep(500)
  await ring(page, [['.inputs-top', '1']]); await shot(page, 'r1-inputs-today', -2, 132, PC)
  await press(page, '#inSansMode', false)
  await ring(page, [['.inputs-top', '1'], ['.sc-head', '2']]); await shot(page, 'r1-sans-today', -2, 132, PC); await unring(page)
  /* Edit Schedule's top bar on two lines at his PC's width; Quals' on one */
  await go(page, 'editsched'); await sleep(500)
  await ring(page, [['.topbar', '']]); await page.screenshot({ path: `${OUT}/r2-editsched-today.png`, clip: { x: 0, y: 0, width: PC.width, height: 150 } })
  /* proposed: the laptop rule (02-shell.css, 821–1499px: Undo / Redo as their arrows, the sync pill its dot) reaching up to 1599px, on every page */
  await page.addStyleTag({ content: '.topbar .tb-hist .abtn.hbtn{width:34px;min-width:0;padding:0;justify-content:center} .topbar .tb-hist .bl{display:none} .topbar.has-undo .fastsync .synclbl{display:none} .topbar.has-undo .fastsync .dot{margin:0}' })
  await sleep(200)
  const h = await page.evaluate(() => Math.round(document.querySelector('.topbar').getBoundingClientRect().height))
  console.log('proposed Edit Schedule top bar height at 1536:', h)
  await unring(page); await ring(page, [['#undoBtn,#redoBtn,#fastSync', '']]); await page.screenshot({ path: `${OUT}/r2-editsched-proposed.png`, clip: { x: 0, y: 0, width: PC.width, height: 150 } }); await unring(page)
  await go(page, 'quals'); await sleep(500)
  await ring(page, [['.topbar', '']]); await page.screenshot({ path: `${OUT}/r2-quals-today.png`, clip: { x: 0, y: 0, width: PC.width, height: 150 } }); await unring(page)
  /* the search boxes, each ringed in its place */
  const box = async (name, sel, pad = 60) => {
    const el = page.locator(sel).first(); const b = await el.boundingBox(); if (!b) { console.log('no box', name); return }
    const id = await el.evaluate(e => (e.id = e.id || 'zz' + Math.random().toString(36).slice(2)))
    await ring(page, [['#' + id, '']])
    await page.screenshot({ path: `${OUT}/r3-${name}.png`, clip: { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - 18), width: Math.min(PC.width - Math.max(0, b.x - pad), b.width + pad * 2), height: b.height + 36 } }); await unring(page)
  }
  await box('quals', '#page-quals input[type=search], #page-quals input[placeholder="filter"], input[placeholder="filter"]')
  await go(page, 'logic'); await sleep(400); await box('logic', 'input[placeholder="Search"]')
  await go(page, 'admin'); await sleep(400); await box('admin', 'input[placeholder^="Find a callsign"]')
  await go(page, 'tracker'); await sleep(600); await box('tracker', 'input[placeholder^="Find event"]', 90)
  await go(page, 'inputs'); await sleep(400); await press(page, '#inMemberMode', false); await press(page, '#inListBtn', false); await box('inputs', 'input[placeholder="Search inputs"]')
  await press(page, '#inCalBtn', false)
  await go(page, 'editsched'); await sleep(400); await box('week', '#page-editsched input[placeholder="name / callsign"]:visible, input[placeholder="name / callsign"]:visible')
  await page.locator('#eWeek [data-sbday="0"]:visible').first().click(); await page.waitForSelector('#schedBoard'); await sleep(500)
  await box('board', '#schedBoard input[placeholder="name / callsign"]')
  await page.evaluate(() => document.querySelector('#sbDone')?.click()); await sleep(400)
  /* the edit buttons: Quals and Logic, at rest and while editing */
  await go(page, 'quals'); await sleep(400)
  const pair = async (name, sel) => { const b = await page.locator(sel).first().boundingBox(); await ring(page, [[sel, '']]); await page.screenshot({ path: `${OUT}/r4-${name}.png`, clip: { x: 0, y: Math.max(0, b.y - 30), width: 900, height: b.height + 60 } }); await unring(page) }
  await pair('quals-rest', '#qEdit'); await press(page, '#qEdit', false); await pair('quals-editing', '#qSave'); await press(page, '#qSave', false)
  await go(page, 'logic'); await sleep(400)
  await pair('logic-rest', '#lgEdit'); await press(page, '#lgEdit', false)
  await pair('logic-editing', '#lgDone'); await press(page, '#lgDone', false)
  await ctx.close()
}
{ /* ---- the proposed Inputs / SANS row, desktop ---- */
  const { ctx, page } = await world(PC, false)
  await go(page, 'inputs'); await sleep(500); await proposeInputs(page)
  await ring(page, [['.inputs-top', '1']]); await shot(page, 'r1-inputs-proposed', -2, 132, PC); await unring(page)
  console.log('proposed Inputs x: prev, month, next, today, gear', (await page.evaluate(() => ['#icPrev', '.ic-mon', '#icNext', '#icToday', '#inGear'].map(s => { const r = document.querySelector(s).getBoundingClientRect(); return Math.round(r.left) + '-' + Math.round(r.right) }))).join(' | '))
  const cal = await page.locator('#inCalBtn').boundingBox()
  await press(page, '#inListBtn', false); const lst = await page.locator('#inCalBtn').boundingBox()
  console.log('proposed: the switch on the Calendar', Math.round(cal.x), 'on the List', Math.round(lst.x))
  await ring(page, [['.inputs-views', '']]); await shot(page, 'r1-inputs-list-proposed', -2, 132, PC); await unring(page)
  await press(page, '#inCalBtn', false)
  await press(page, '#inSansMode', false); await proposeSans(page)
  await ring(page, [['.sc-head', '1']]); await shot(page, 'r1-sans-proposed', -2, 132, PC); await unring(page)
  const tops = await page.evaluate(() => ['.inputs-tabs', '.sc-month', '.sc-gear'].map(s => Math.round(document.querySelector(s).getBoundingClientRect().top)))
  console.log('proposed SANS: tabs, month, gear tops', tops.join(' / '))
  const xs = await page.evaluate(() => ['[data-testid=sc-prev]', '.sc-month', '[data-testid=sc-next]', '.sc-today', '.sc-gear'].map(s => { const r = document.querySelector(s).getBoundingClientRect(); return Math.round(r.left) + '-' + Math.round(r.right) }))
  console.log('proposed SANS x: prev, month, next, today, gear', xs.join(' | '))
  await ctx.close()
}
{ /* ---- the phone: the same rows already; only the month's style differs ---- */
  const { ctx, page } = await world(PHONE, true)
  await go(page, 'inputs'); await sleep(500)
  await ring(page, [['.ic-mon', '']]); await shot(page, 'r1-phone-inputs-today', -2, 200, PHONE); await unring(page)
  await press(page, '#inSansMode', true)
  await ring(page, [['.sc-month', '']]); await shot(page, 'r1-phone-sans-today', -2, 200, PHONE); await unring(page)
  await proposeSans(page)
  await ring(page, [['.sc-month', '']]); await shot(page, 'r1-phone-sans-proposed', -2, 200, PHONE); await unring(page)
  await ctx.close()
}
await browser.close()
console.log('done')
