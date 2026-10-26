/* The windows-and-Escape batch (pull request 570), re-walked after main was merged in (26 Oct 26, his D1402).
   Only the doors the merge could have moved: the board's windows on Escape, a request's window (main changed it
   16 times while the branch waited), the CX dialog's hand-back (board.ts merged), the strip over the crew list
   (palette-html.ts merged), and the Inputs page's request window that must NOT hold the keyboard (D641).
   Written as assertions of the right behaviour: a PASS means correct.
     HP_URL    the preview serving THIS checkout's dist (required)
     HP_SHOTS  where the pictures go */
const VERSION = 'we-merge-rewalk v5'
const { open, login, go, board, tap, shot, SHOTS } = await import('./lib.mjs')
import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'

const results = []
const rec = (id, pass, detail) => { results.push({ id, pass, detail }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${id}  ${detail}`) }
const active = (page) => page.evaluate(() => { const a = document.activeElement; return a ? a.tagName + ' ' + [...a.attributes].filter(x => /^(id|class|data-|aria-label)/.test(x.name)).map(x => x.name + '=' + x.value).join(' ') : null })
const inside = (page, sel) => page.evaluate(s => { const b = document.querySelector(s); return !!b && !b.closest('[hidden]') && b.contains(document.activeElement) }, sel)
const visible = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); return !!e && !e.hidden && !e.closest('[hidden]') && e.getClientRects().length > 0 }, sel)
async function holds(page, sel, n = 25) {
  for (let i = 1; i <= n; i++) { await page.keyboard.press('Tab'); if (!(await inside(page, sel))) return `left at Tab ${i}: ${await active(page)}` }
  for (let i = 1; i <= 5; i++) { await page.keyboard.press('Shift+Tab'); if (!(await inside(page, sel))) return `left at Shift+Tab ${i}: ${await active(page)}` }
  return ''
}
async function run(id, fn, opts = {}) {
  let s
  try {
    s = await open(opts)
    await fn(s.page)
  } catch (e) { rec(id, false, 'threw: ' + String(e.message).split('\n')[0]) }
  if (s) {
    if (s.errors.length) rec(id + '-errors', false, s.errors.slice(0, 3).join(' | '))
    await s.browser.close()
  }
}

console.log(VERSION, process.env.HP_URL)

/* W1 — Duty templates over the board: held, Escape closes only it, the keyboard back on "+ Block" */
await run('W1', async (page) => {
  await board(page, 0)
  const add = page.locator('#schedBoard [data-dwadd="0"]:visible').first()
  await add.focus(); await add.press('Enter'); await page.waitForTimeout(300)
  await page.locator('.wavemenu [data-blkedit]:visible').first().click(); await page.waitForTimeout(500)
  const open1 = await visible(page, '#tplModal .modal-box'), in1 = await inside(page, '#tplModal .modal-box')
  const leak = await holds(page, '#tplModal .modal-box')
  await shot(page, 'W1-1-duty-templates-open')
  await page.keyboard.press('Escape'); await page.waitForTimeout(400)
  const closed = !(await visible(page, '#tplModal .modal-box')), boardOpen = await visible(page, '#schedBoard')
  const back = await active(page)
  await shot(page, 'W1-2-after-escape')
  rec('W1', open1 && in1 && !leak && closed && boardOpen && /data-dwadd=0/.test(back || ''), `open ${open1}, keyboard inside ${in1}, tab ${leak || 'held'}, closed ${closed}, board open ${boardOpen}, keyboard ${back}`)
})

/* W2 — Week insights over the board: Escape closes Insights only */
await run('W2', async (page) => {
  await board(page, 0)
  const b = page.locator('#sbInsights:visible').first()
  await b.focus(); await b.press('Enter'); await page.waitForTimeout(500)
  const in1 = await inside(page, '#insightModal .modal-box'), leak = await holds(page, '#insightModal .modal-box')
  await shot(page, 'W2-1-insights-open')
  await page.keyboard.press('Escape'); await page.waitForTimeout(400)
  const closed = !(await visible(page, '#insightModal .modal-box')), boardOpen = await visible(page, '#schedBoard'), back = await active(page)
  rec('W2', in1 && !leak && closed && boardOpen && /sbInsights/.test(back || ''), `keyboard inside ${in1}, tab ${leak || 'held'}, closed ${closed}, board open ${boardOpen}, keyboard ${back}`)
})

/* W3 — a request's window from the week: held, Escape closes it, the keyboard back on an input's label */
await run('W3', async (page) => {
  await go(page, 'editsched')
  const lbl = page.locator('#eWeek [data-inpedit]:visible').first()
  const n = await page.locator('#eWeek [data-inpedit]:visible').count()
  if (!n) { rec('W3', false, 'no input label on the week'); return }
  await lbl.focus(); await lbl.press('Enter'); await page.waitForTimeout(600)
  const open1 = await visible(page, '#inpEditPop .inpedbox'), in1 = await inside(page, '#inpEditPop .inpedbox')
  const leak = await holds(page, '#inpEditPop .inpedbox')
  await shot(page, 'W3-1-request-window-from-week')
  await page.keyboard.press('Escape'); await page.waitForTimeout(500)
  const closed = !(await visible(page, '#inpEditPop .inpedbox')), back = await active(page)
  await shot(page, 'W3-2-after-escape')
  rec('W3', open1 && in1 && !leak && closed && /data-inpedit/.test(back || ''), `labels ${n}; open ${open1}, keyboard inside ${in1}, tab ${leak || 'held'}, closed ${closed}, keyboard ${back}`)
})

/* W4 — a request's window on the Inputs page must NOT hold the keyboard (D641) */
await run('W4', async (page) => {
  await go(page, 'inputs')
  await page.waitForTimeout(500)
  /* the Inputs page opens on today's month in Calendar view; the demo's inputs are in July, so the List view holds them */
  /* the calendar opens on today's month; step back to the demo's July with the page's own ‹, then a day holding inputs */
  for (let i = 0; i < 3; i++) { await page.locator('#page-inputs button:visible', { hasText: /^\s*‹\s*$/ }).first().click(); await page.waitForTimeout(400) }
  await shot(page, 'W4-0-july')
  const cand = ['#page-inputs [data-popiid]:visible', '#page-inputs [data-iid]:visible', '#page-inputs .icard:visible']
  let used = ''
  for (const c of cand) { if (await page.locator(c).count()) { await page.locator(c).first().click(); used = c; break } }
  await page.waitForTimeout(700)
  const open1 = await visible(page, '#inpEditPop.inped-win')
  if (!open1) { await shot(page, 'W4-0-no-window'); rec('W4', false, `no request window opened (tried ${used || 'nothing found'})`); return }
  const first = page.locator('#inpEditPop.inped-win').locator('input:visible, textarea:visible, select:visible, button:visible').first()
  await first.focus()
  let leftAt = 0
  for (let i = 1; i <= 40; i++) { await page.keyboard.press('Tab'); if (!(await inside(page, '#inpEditPop.inped-win'))) { leftAt = i; break } }
  await shot(page, 'W4-1-inputs-window-tabbed')
  rec('W4', leftAt > 0, `opened by ${used}; the keyboard ${leftAt ? 'left the window into the page at Tab ' + leftAt : 'never left the window in 40 Tabs'} (${await active(page)})`)
})

/* W5 — the board's CX dialog gives the keyboard back to its CX button */
await run('W5', async (page) => {
  await board(page, 0)
  const cx = page.locator('#schedBoard [data-lcx="0.0.0.0"]:visible').first()
  if (!(await cx.count())) { rec('W5', false, 'no CX on the first line'); return }
  await cx.focus(); const before = await active(page)
  await cx.press('Enter'); await page.waitForTimeout(500)
  const dlg = await visible(page, '#cxPop')
  const inDlg = await page.evaluate(() => { const b = document.querySelector('#cxPop'); return !!b && b.contains(document.activeElement) })
  await shot(page, 'W5-1-cx-dialog')
  await page.keyboard.press('Escape'); await page.waitForTimeout(400)
  const after = await active(page)
  rec('W5', dlg && inDlg && /data-lcx=0\.0\.0\.0/.test(after || ''), `dialog ${dlg}, keyboard inside ${inDlg}; before ${before}; after ${after}`)
})

/* W6 — the strip over the crew list follows a callsign typed after the seat was picked (board) */
await run('W6', async (page) => {
  await board(page, 0)
  /* the demo fills every front seat: the SETUP empties Monday's first one through the app's own write (the probe
     bridge's setSlotVal, through the mutation funnel); what is under test — picking it and typing the callsign — is
     done with the real controls below */
  const key = '0.0.0.0.p', csKey = 'ff:0.0.0.cs'
  await page.evaluate(k => window.setSlotVal(k, ''), key); await page.waitForTimeout(600)
  const emptied = await page.evaluate(k => { const e = [...document.querySelectorAll(`#schedBoard [data-slot="${k}"]`)].find(x => x.getClientRects().length); return !!e && e.classList.contains('empty') }, key)
  if (!emptied) { rec('W6', false, 'the setup could not empty the seat'); return }
  await page.locator(`#schedBoard [data-slot="${key}"]:visible`).first().click(); await page.waitForTimeout(400)
  const strip1 = (await page.locator('.ros-arm:visible').first().textContent().catch(() => '')) || ''
  const box = page.locator(`#schedBoard [data-bfld="${csKey}"]:visible`).first()
  await box.fill('ZZTOP'); await box.press('Tab'); await page.waitForTimeout(500)
  const strip2 = (await page.locator('.ros-arm:visible').first().textContent().catch(() => '')) || ''
  await shot(page, 'W6-1-strip-after-callsign')
  rec('W6', /Planning/.test(strip1) && strip2.includes('ZZTOP'), `seat ${key}; strip before "${strip1.trim()}", after "${strip2.trim()}"`)
})

/* P1 — phone: a request's window from the week by a tap opens with no text box focused, ✕ closes it */
{
  const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
  const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
  const ctx = await browser.newContext({ viewport: { width: 402, height: 874 }, hasTouch: true, isMobile: true })
  const page = await ctx.newPage(); const errors = []
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  try {
    await page.goto(process.env.HP_URL); await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
    await login(page, 'a'); await go(page, 'editsched')
    const lbl = page.locator('#eWeek [data-inpedit]:visible').first()
    await lbl.scrollIntoViewIfNeeded(); await page.waitForTimeout(300)
    const y0 = await page.evaluate(() => scrollY)
    const bb = await lbl.boundingBox()
    await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2)
    await shot(page, 'P1-1-tap-phone'); await page.waitForTimeout(700); await shot(page, 'P1-2-phone')
    const open1 = await visible(page, '#inpEditPop .inpedbox'), y1 = await page.evaluate(() => scrollY)
    const typing = await page.evaluate(() => /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName || ''))
    const x = page.locator('#inpEditPop .inpedbox [aria-label="Close"], #inpEditPop .inpedbox .x, #inpEditPop .inpedbox [data-close]').first()
    let closed = false
    if (await x.count()) { const xb = await x.boundingBox(); await page.touchscreen.tap(xb.x + xb.width / 2, xb.y + xb.height / 2); await page.waitForTimeout(500); closed = !(await visible(page, '#inpEditPop .inpedbox')) }
    rec('P1', open1 && !typing && y1 === y0 && closed, `open ${open1}, a text box focused ${typing}, scroll ${y0} -> ${y1}, closed by ✕ ${closed}`)
  } catch (e) { rec('P1', false, 'threw: ' + String(e.message).split('\n')[0]) }
  if (errors.length) rec('P1-errors', false, errors.slice(0, 3).join(' | '))
  await browser.close()
}

const fail = results.filter(r => !r.pass).length
console.log(`${VERSION}: ${results.length - fail} PASS, ${fail} FAIL — pictures ${SHOTS}`)
process.exit(fail ? 1 : 0)
