/* CALENDAR STEP TWO — pictures of every date calendar as it is TODAY (old look) and two of the NEW look (step one),
   at phone (390x844) and desktop (1440x900) sizes. Nothing here changes the app.
   Run (the preview served on 4173):
     DL_BASE=http://localhost:4173 DL_SHOTS=docs/mock/2026-10-15-calendar-step-two node scripts/handpass/calstep2-pics.mjs [phone|desk] [only,these,ids]
   Pictures: <nn>-<place>-<phone|desk>.png */
import * as L from './dl-lib.mjs'

const size = process.argv[2] || 'desk'
const only = (process.argv[3] || '').split(',').filter(Boolean)
const K = size
const w = await L.world(size)
const p = w.page
const out = { made: [], skipped: [] }

/** a real tap (phone) or click (desk) at the middle of a box, after checking nothing covers it */
async function hit(sel, { scroll = true } = {}) {
  const loc = p.locator(sel).first()
  await loc.waitFor({ state: 'attached', timeout: 8000 })
  if (scroll) await loc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await L.sleep(250)
  const at = await loc.evaluate(e => { const b = e.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2; const h = document.elementFromPoint(x, y); return { x, y, ok: !!h && (h === e || e.contains(h) || h.contains(e)), over: h ? `${h.tagName}.${String(h.className).slice(0, 30)}[${h.getAttribute('data-testid') || ''}]` : 'nothing' } })
  if (!at.ok) throw new Error(`covered: ${sel} by ${at.over}`)
  if (w.phone) await p.touchscreen.tap(at.x, at.y); else await p.mouse.click(at.x, at.y)
  await L.sleep(450)
}
const exists = async sel => (await p.locator(sel).count()) > 0
const visible = async sel => p.locator(sel).first().isVisible().catch(() => false)

/** the picture: on a phone the whole screen (the sheet sits at the bottom of it); on a desktop a frame round the thing */
async function shot(nn, place, around, pad = 24) {
  const name = `${nn}-${place}-${K}`
  if (w.phone) await L.pic(w, name)
  else await L.pic(w, name, { around, pad })
  out.made.push(name + '.png')
}
async function step(id, label, fn) {
  if (only.length && !only.includes(id)) return
  console.log(`-- ${id} ${label}`)
  try { await fn() } catch (e) { console.log(`   SKIP ${id}: ${String(e.message).split('\n')[0]}`); out.skipped.push(`${id} ${label}: ${String(e.message).split('\n')[0]}`) }
  await reset()
}
/** back to a clean Edit-Schedule screen between places */
async function reset() {
  for (let i = 0; i < 4; i++) {
    const x = p.locator('.bidsheet[role="dialog"] button.x:visible, [data-testid$="-x"]:visible').last()
    if (await x.count()) { await x.click({ force: true }).catch(() => {}); await L.sleep(300) }
    else break
  }
  await p.keyboard.press('Escape').catch(() => {}); await L.sleep(200)
  if (await p.locator('[data-testid="dcal-card"]').count()) { if (w.phone) await p.touchscreen.tap(8, 8); else await p.keyboard.press('Escape'); await L.sleep(400) }
  if (await p.locator('#weekCal:visible').count()) { await p.keyboard.press('Escape'); await L.sleep(300) }
}
const lw = async () => {
  if (await p.locator('#schedBoard:visible').count()) await p.evaluate(() => window.go('viewsched')).catch(() => {})
  await L.go(w, 'leavewar')
  await p.waitForSelector('[data-testid^="row-"]', { timeout: 15000 })
  await L.sleep(700)
  const bar = p.locator('[data-testid="figures-toggle"]')
  if ((await bar.count()) && (await bar.getAttribute('aria-expanded')) === 'true') { await bar.click(); await L.sleep(300) }
}
/** the first person row's name in the war, and a date that is on screen for them */
const firstCell = () => p.evaluate(() => { const c = [...document.querySelectorAll('[data-testid^="cell-"]')].find(e => /^cell-.+-\d{4}-\d\d-\d\d$/.test(e.getAttribute('data-testid'))); return c ? c.getAttribute('data-testid') : null })
const sheetBox = '.bidsheet[role="dialog"] , [data-testid="sheet-scrim"] + *'

try {
  /* 01 — a leave bid's range calendar */
  await step('01', 'bid sheet, Pick a range', async () => {
    await lw()
    const id = await firstCell(); if (!id) throw new Error('no grid cell')
    await hit(`[data-testid="${id}"]`)
    await p.waitForSelector('[data-testid="span-range"]', { timeout: 6000 })
    await hit('[data-testid="span-range"]', { scroll: false })
    await p.waitForSelector('[data-testid^="range"], .rp', { timeout: 4000 }).catch(() => {})
    await L.sleep(300)
    await shot('01', 'leavewar-bid-range', '.bidsheet[role="dialog"]')
  })

  /* 02 — a new leave period's calendar */
  await step('02', 'new leave period', async () => {
    await lw()
    await hit('[data-testid="war-new"]')
    await p.waitForSelector('[data-testid="war-sheet"]', { timeout: 6000 })
    await L.sleep(300)
    await shot('02', 'leavewar-new-period', '[data-testid="war-sheet"]')
  })

  /* 03 — the bidding dates calendar */
  await step('03', 'bidding dates', async () => {
    await lw()
    if (!(await exists('[data-testid="bid-window"]'))) {
      /* the chip is drawn only while a period is open: move the stage on through the war's own button */
      for (let i = 0; i < 3 && !(await exists('[data-testid="bid-window"]')); i++) {
        if (!(await exists('[data-testid="stage-advance"]'))) break
        await hit('[data-testid="stage-advance"]'); await L.sleep(500)
      }
    }
    await hit('[data-testid="bid-window"]')
    await p.waitForSelector('[data-testid="window-sheet"]', { timeout: 6000 })
    await L.sleep(300)
    await shot('03', 'leavewar-bidding-dates', '[data-testid="window-sheet"]')
  })

  /* 04 — an event's dates, A range */
  await step('04', 'event sheet A range', async () => {
    await lw()
    const id = await p.evaluate(() => { const c = [...document.querySelectorAll('[data-testid^="event-0-"]')].find(e => /^event-0-\d{4}-\d\d-\d\d$/.test(e.getAttribute('data-testid')) && !e.classList.contains('tap') && e.getBoundingClientRect().width > 8); return c ? c.getAttribute('data-testid') : null })
    if (!id) throw new Error('no event cell')
    await hit(`[data-testid="${id}"]`)
    await p.waitForSelector('[data-testid="event-sheet"], [data-testid="event-text"]', { timeout: 6000 })
    await hit('[data-testid="event-scope-range"]', { scroll: false })
    await L.sleep(300)
    await shot('04', 'leavewar-event-range', '[data-testid="event-sheet"]')
  })

  /* 05 / 06 — the OIL tracker */
  await step('05', 'OIL tracker report range', async () => {
    await lw()
    await hit('[data-testid="oil-tracker"]')
    await p.waitForSelector('[data-testid="oil-sheet"]', { timeout: 6000 })
    await hit('[data-testid="oil-range-pick"]', { scroll: false })
    await p.waitForSelector('.oil-pickrow', { timeout: 4000 })
    await L.sleep(300)
    await shot('05', 'leavewar-oil-report-range', '[data-testid="oil-sheet"]', 8)
  })
  await step('06', 'OIL credit date chip', async () => {
    await lw()
    await hit('[data-testid="oil-tracker"]')
    await p.waitForSelector('[data-testid="oil-sheet"]', { timeout: 6000 })
    const nm = await p.evaluate(() => { const e = document.querySelector('[data-testid^="oil-name-"]'); return e ? e.getAttribute('data-testid') : null })
    if (!nm) throw new Error('no name row in the tracker')
    await hit(`[data-testid="${nm}"]`)
    await p.waitForSelector('[data-testid="oil-credit-panel"], [data-testid="oil-date"]', { timeout: 5000 })
    await hit('[data-testid="oil-date"]')
    await p.waitForSelector('.oil-pop', { timeout: 4000 })
    await L.sleep(300)
    await shot('06', 'leavewar-oil-credit-date', '[data-testid="oil-sheet"]', 8)
  })

  /* 07 — the Calendar window's holidays list: Add a holiday */
  await step('07', 'Add a holiday', async () => {
    await L.openCalendarWindow(w)
    await hit('[data-testid="days-tab-holidays"]', { scroll: false })
    await p.waitForSelector('[data-testid="hol-add"]', { timeout: 4000 })
    await hit('[data-testid="hol-add"]')
    await p.waitForSelector('[data-testid="win-holiday"]', { timeout: 6000 })
    await L.sleep(400)
    await shot('07', 'calendar-window-add-holiday', '[data-testid="win-holiday"]')
  })

  /* 08 — an input's own window's dates */
  await step('08', "an input's own window", async () => {
    await L.go(w, 'inputs')
    /* the list view */
    if (await visible('#inListBtn')) await hit('#inListBtn')
    await hit('#inRangeBtn'); await hit('#inRangeAll')
    const row = await p.evaluate(() => { const rows = [...document.querySelectorAll('#page-inputs [data-iid]')].filter(e => e.getBoundingClientRect().width > 0 && /\bLL\b|\bOL\b|CSE/.test(e.innerText)); const e = rows[0] || document.querySelector('#page-inputs [data-iid]'); return e ? `#page-inputs [data-iid="${e.getAttribute('data-iid')}"]` : null })
    if (!row) throw new Error('no input row on the list')
    await hit(row)
    await p.waitForSelector('#inpEditPop, [data-testid="win-inputedit"]', { timeout: 6000 })
    await p.waitForSelector('#inpEditPop .rc, #inpEditPop [id^="inpEd"]', { timeout: 4000 }).catch(() => {})
    await L.sleep(400)
    await L.pic(w, `08-input-window-dates-${K}`); out.made.push(`08-input-window-dates-${K}.png`)
  })

  /* 09 — the Inputs list's date filter */
  await step('09', 'Inputs list date filter', async () => {
    await L.go(w, 'inputs')
    if (await visible('#inListBtn')) await hit('#inListBtn')
    await hit('#inRangeBtn')
    await p.waitForSelector('#inRangePop', { timeout: 4000 })
    await L.sleep(300)
    await shot('09', 'inputs-date-filter', '#inRangePop', 40)
  })

  /* 10 — Jump to a date */
  await step('10', 'Jump to a date', async () => {
    await L.go(w, 'editsched')
    await L.sleep(500)
    const sel = w.phone ? 'button.filt-cal:visible' : 'button.wk-cal:visible'
    await hit(sel, { scroll: false })
    await p.waitForSelector('#weekCal[role="dialog"]', { timeout: 4000 })
    await L.sleep(300)
    await shot('10', 'jump-to-a-date', '#weekCal', 24)
  })

  /* 20 — the NEW look: Admin -> Data -> A date range */
  await step('20', 'NEW look Admin range', async () => {
    await L.go(w, 'admin')
    await p.waitForSelector('#page-admin.on')
    const back = p.locator('#page-admin .adm-back')
    if (await back.count() && await back.first().isVisible()) await back.first().click()
    const cat = p.locator('#page-admin button.adm-cat', { hasText: 'Data' }).first()
    await cat.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200)
    await w.press(cat)
    await p.waitForSelector('#admWipeMode', { timeout: 5000 })
    await p.selectOption('#admWipeMode', 'range'); await L.sleep(400)
    await p.waitForSelector('#admWipeRun', { timeout: 4000 })
    await p.locator('#admWipeRun').evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(300)
    await shot('20', 'NEW-admin-date-range', '#admWipeRun', 30)
  })

  /* 21 — the NEW look: one date, Calendar window -> Every <weekday> -> From */
  await step('21', 'NEW look one date', async () => {
    await L.openCalendarWindow(w)
    await hit('[data-testid="days-wd-3"]')
    await p.waitForSelector('[data-testid="win-every"]')
    await L.sleep(300)
    await hit('[data-testid="every-from"]')
    await p.waitForSelector('[data-testid="dcal-card"]')
    await L.sleep(500)
    await shot('21', 'NEW-every-from-date', '[data-testid="dcal-card"]', 60)
  })
} finally {
  console.log('MADE', out.made.join(' '))
  console.log('SKIPPED', JSON.stringify(out.skipped, null, 1))
  await L.close(w)
}
