/* CALENDAR STEP TWO (owner D901) AND THE FOUR MORE EDGE DRAGS (owner D900), 15 Oct 26 — the walk.
     C — every place that drew one of the three older small calendars, now the app's one date calendar: a date run picked
         by the person's own presses, crossing a month by the calendar's own arrow, and the result SAVED read back off
         the screen (or the app's own record): a leave bid, a new leave period, the bidding dates (and "Clear dates"),
         an event, the OIL tracker's range, an OIL credit's date, a holiday, an input's own dates (a new input; a saved
         one whose first tap starts its dates anew), the Inputs list's window of dates, "Jump to a date" (a date; Today).
     E — the four drags carried to an edge: the SANS calendar's pick held at the month's side (the month turns, the run
         goes on); the Tracker's ▣ Select box carried to the canvas's edge (the canvas pans, the far balls are taken); the
         Tracker's ⇅ Reorder list (desktop: a row carried to the list's foot scrolls it); the people picker's drag across
         faces carried to the foot of the input's window (the window scrolls, the faces passed are picked).
   By REAL input — a mouse on the desktop, a finger on the phone (Playwright's tap; Chromium's own touch events, CDP, for
   drags). Assertions of the RIGHT behaviour, so a re-run is the re-walk.
   usage: DL_BASE=http://localhost:4173 DL_SHOTS=docs/img/handpass/2026-10-15-calendar-step-two node scripts/handpass/cal2-walk.mjs [desk|phone] [only,ids] */
import { mkdirSync } from 'node:fs'
import * as L from './dl-lib.mjs'

mkdirSync(L.SHOTS, { recursive: true })
const results = []
const ok = (size, step, pass, saw) => { results.push({ size, step, pass, saw }); console.log(`${pass ? 'PASS' : 'FAIL'} [${size}] ${step} — ${saw}`) }
const SIZES = process.argv[2] ? [process.argv[2]] : ['desk', 'phone']
const ONLY = (process.argv[3] || '').split(',').filter(Boolean)

/* one pointer, the way a person moves it (the edge-turn walk's own) */
async function hand(w) {
  const p = w.page
  if (!w.phone) {
    let at = { x: 0, y: 0 }
    return {
      down: async (x, y) => { await p.mouse.move(x, y); await p.mouse.down(); at = { x, y }; await L.sleep(80) },
      to: async (x, y, steps = 12) => { for (let i = 1; i <= steps; i++) { await p.mouse.move(at.x + (x - at.x) * i / steps, at.y + (y - at.y) * i / steps); await L.sleep(25) } at = { x, y } },
      up: async () => { await p.mouse.up(); await L.sleep(350) },
    }
  }
  const cdp = await w.ctx.newCDPSession(p)
  let at = { x: 0, y: 0 }
  const t = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] })
  return {
    down: async (x, y) => { await t('touchStart', x, y); at = { x, y }; await L.sleep(80) },
    to: async (x, y, steps = 12) => { for (let i = 1; i <= steps; i++) { await t('touchMove', at.x + (x - at.x) * i / steps, at.y + (y - at.y) * i / steps); await L.sleep(25) } at = { x, y } },
    up: async () => { await t('touchEnd'); await L.sleep(350) },
  }
}

for (const size of SIZES) {
  const w = await L.world(size)
  const p = w.page
  const tid = t => `[data-testid="${t}"]`
  /** a person's press at the middle of a box — a finger's tap on the phone, a click on the desktop — after proving it is
   *  ON THE SCREEN and nothing covers it (walk-scripts.md: never a locator's tap that scrolls its target into view) */
  const press = async (sel, { scroll = true } = {}) => {
    const loc = p.locator(sel).first()
    await loc.waitFor({ state: 'attached', timeout: 8000 })
    if (scroll) await loc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
    await L.sleep(200)
    const at = await loc.evaluate(e => { const b = e.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2; const h = document.elementFromPoint(x, y); return { x, y, on: x >= 0 && y >= 0 && x <= innerWidth && y <= innerHeight, ok: !!h && (h === e || e.contains(h) || h.contains(e)), over: h ? `${h.tagName}.${String(h.className).slice(0, 40)}[${h.getAttribute('data-testid') || ''}]` : 'nothing' } })
    if (!at.on) throw new Error(`off the screen: ${sel}`)
    if (!at.ok) throw new Error(`covered: ${sel} by ${at.over}`)
    if (w.phone) await p.touchscreen.tap(at.x, at.y); else await p.mouse.click(at.x, at.y)
    await L.sleep(350)
  }
  const text = async sel => ((await p.locator(sel).first().textContent().catch(() => '')) || '').replace(/\s+/g, ' ').trim()
  const has = async sel => (await p.locator(sel).count()) > 0
  const step = async (id, label, fn) => {
    if (ONLY.length && !ONLY.includes(id)) return
    console.log(`-- [${size}] ${id} ${label}`)
    try { await fn() } catch (e) { ok(size, `${id}: ${label} — ran to its end`, false, String(e.message || e).replace(/\s+/g, ' ').slice(0, 400)) }
    await reset()
  }
  const reset = async () => {
    for (let i = 0; i < 5; i++) {
      if (await has('[data-testid="dcal-card"]')) { await p.keyboard.press('Escape'); await L.sleep(300); continue }
      const x = p.locator('.bidsheet[role="dialog"] button.x:visible, [data-testid$="-x"]:visible, #weekCal:visible .x').last()
      if (await x.count()) { await x.click({ force: true }).catch(() => {}); await L.sleep(300) } else break
    }
    await p.keyboard.press('Escape').catch(() => {}); await L.sleep(200)
    await p.evaluate(() => window.scrollTo(0, 0)); await L.sleep(100)
  }
  const lw = async () => {
    if (await p.locator('#schedBoard:visible').count()) await p.evaluate(() => window.go('viewsched')).catch(() => {})
    await L.go(w, 'leavewar')
    await p.waitForSelector('[data-testid^="row-"]', { timeout: 15000 })
    await L.sleep(600)
  }
  /** walk a calendar to a month by its own arrows */
  const toMonth = async (T, yyyymm) => {
    for (let i = 0; i < 40; i++) {
      const at = await p.locator(tid(T)).first().getAttribute('data-month')
      if (at === yyyymm) return
      await press(tid(at < yyyymm ? `${T}-next` : `${T}-prev`), { scroll: false })
    }
    throw new Error(`${T} never reached ${yyyymm}`)
  }

  try {
    /* C1 — a leave bid over a run that crosses a month: the cell's own day seeds the run, the calendar's ‹ › cross it */
    await step('C1', 'a leave bid over a run of days crossing a month', async () => {
      await lw()
      const who = await p.evaluate(() => { const c = [...document.querySelectorAll('[data-testid^="cell-"]')].map(e => e.getAttribute('data-testid')).find(t => /^cell-.+-2026-01-26$/.test(t)); return c ? c.slice(5, -11) : null })
      if (!who) throw new Error('no cell on 26 Jan')
      await press(tid(`cell-${who}-2026-01-26`))
      await press(tid('span-range'), { scroll: false })
      ok(size, 'C1: the bid sheet\'s range is the one calendar, on the tapped day\'s month', (await p.locator(tid('span')).getAttribute('data-month')) === '2026-01' && await has('[data-testid="span"].dcal'), await p.locator(tid('span')).getAttribute('data-month'))
      await toMonth('span', '2026-02')
      await press(tid('span-day-2026-02-03'), { scroll: false })
      const said = await text(tid('span-selection'))
      ok(size, 'C1: across the month, the run reads 26 Jan to 3 Feb', said === '26 Jan 26 – 3 Feb 26', said)
      ok(size, 'C1: no Clear under it (D901 (1))', !(await has(tid('span-clear'))), 'none')
      await L.pic(w, `C1-bid-range-${size}`)
      await press(tid('bid-LL'), { scroll: false })
      await L.sleep(500)
      if (/Tap the same leave again/.test(await text('.bidsheet[role="dialog"]'))) { await press(tid('bid-LL'), { scroll: false }); await L.sleep(500) }
      await L.pic(w, `C1-bid-filed-${size}`)
      const cells = await p.evaluate(w0 => ['2026-01-26', '2026-01-30'].map(d => (document.querySelector(`[data-testid="cell-${w0}-${d}"]`)?.textContent || '').trim()), who)
      ok(size, 'C1: filed — the run\'s days on the grid carry the leave', cells.every(c => /LL/.test(c)), cells.join(' / '))
    })

    /* C2 — a new leave period: its run picked on the calendar inside the sheet, created, listed */
    await step('C2', 'a new leave period', async () => {
      await lw()
      await press(tid('war-new'))
      await p.waitForSelector(tid('war-sheet'))
      await p.locator(tid('war-name')).fill('WALK 28')
      await toMonth('war', '2028-01')
      await press(tid('war-day-2028-01-03'), { scroll: false })
      await toMonth('war', '2028-02')
      await press(tid('war-day-2028-02-25'), { scroll: false })
      const said = await text(tid('war-selection'))
      ok(size, 'C2: the run reads 3 Jan to 25 Feb 28', /3 Jan 28.*25 Feb 28/.test(said), said)
      await L.pic(w, `C2-new-period-${size}`)
      await press(tid('war-create'), { scroll: false })
      await L.sleep(600)
      const opts = await p.locator(`${tid('war-picker')} option`).allTextContents()
      ok(size, 'C2: created and listed', opts.some(o => /WALK 28/.test(o)), opts.join(' | ').slice(0, 160))
    })

    /* C3 — the bidding dates: a run, "Open these dates"; then "Clear dates" and "Open the whole year" (D901 (1)) */
    await step('C3', 'the bidding dates, and Clear dates', async () => {
      await lw()
      const cur = p.locator(`${tid('war-picker')}`)
      const jan26 = (await cur.locator('option').allTextContents()).find(o => /JAN - DEC 26/.test(o))
      if (jan26) await cur.selectOption({ label: jan26 })
      await L.sleep(500)
      await press(tid('bid-window'))
      await p.waitForSelector(tid('window-sheet'))
      ok(size, 'C3: the bidding dates keep a "Clear dates" while there are dates', (await text(tid('window-clear'))) === 'Clear dates', await text(tid('window-clear')))
      await toMonth('window', '2026-04')
      await press(tid('window-day-2026-04-06'), { scroll: false })
      await toMonth('window', '2026-05')
      await press(tid('window-day-2026-05-08'), { scroll: false })
      await L.pic(w, `C3-bidding-dates-${size}`)
      await press(tid('window-apply'), { scroll: false })
      await L.sleep(400)
      const chip = await text(tid('bid-window'))
      ok(size, 'C3: opened on 6 Apr to 8 May', /6 Apr.*8 May/.test(chip), chip)
      await press(tid('bid-window'))
      await press(tid('window-clear'), { scroll: false })
      const btn = await text(tid('window-apply'))
      ok(size, 'C3: cleared, the button offers the whole year', btn === 'Open the whole year', btn)
      await press(tid('window-apply'), { scroll: false })
      await L.sleep(400)
      ok(size, 'C3: the whole year opened', !/Apr/.test(await text(tid('bid-window'))), await text(tid('bid-window')))
    })

    /* C4 — an event's dates: A range on the calendar inside the sheet, saved, on the Event row */
    await step('C4', 'an event over a run of days', async () => {
      await lw()
      const id = await p.evaluate(() => { const c = [...document.querySelectorAll('[data-testid^="event-0-2026-"]')].find(e => /^event-0-2026-01-(1[2-9]|2\d)$/.test(e.getAttribute('data-testid')) && e.getBoundingClientRect().width > 8 && /^[+＋]?$/.test((e.textContent || '').trim())); return c ? c.getAttribute('data-testid') : null })
      if (!id) throw new Error('no empty event cell in January: ' + JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('[data-testid^="event-"]')].slice(0, 8).map(e => [e.getAttribute('data-testid'), (e.textContent || '').trim().slice(0, 12), Math.round(e.getBoundingClientRect().width)]))))
      await press(tid(id))
      await p.waitForSelector(tid('event-sheet'))
      await p.locator(tid('event-text')).fill('WALKEV')
      await press(tid('event-scope-range'), { scroll: false })
      const d0 = id.slice(8)
      const d1 = '2026-02-02'
      await toMonth('event', '2026-02')
      await press(tid(`event-day-${d1}`), { scroll: false })
      ok(size, `C4: the run reads from ${d0} to 2 Feb`, /2 Feb 26/.test(await text(tid('event-selection'))), await text(tid('event-selection')))
      await L.pic(w, `C4-event-range-${size}`)
      const save = p.locator(`${tid('event-sheet')} button`, { hasText: /^Save$/ }).first()
      if (w.phone) await save.tap(); else await save.click()
      await L.sleep(500)
      const on = await p.evaluate(d => (document.querySelector(`[data-testid="event-0-${d}"]`)?.textContent || '').trim(), d0)
      await L.pic(w, `C4-event-saved-${size}`)
      const row = await text(tid('event-row-0'))
      ok(size, 'C4: saved — the Event row carries it', /WALKEV/i.test(row) || /WALKEV/i.test(on), row.slice(0, 120) || '(empty)')
    })

    /* C5 — the OIL tracker's report range: a run, Done, the window line follows */
    await step('C5', 'the OIL tracker\'s range', async () => {
      await lw()
      await press(tid('oil-tracker'))
      await p.waitForSelector(tid('oil-sheet'))
      await press(tid('oil-range-pick'), { scroll: false })
      await p.waitForSelector(tid('oilrange'))
      await toMonth('oilrange', '2026-03')
      await press(tid('oilrange-day-2026-03-02'), { scroll: false })
      await press(tid('oilrange-day-2026-03-20'), { scroll: false })
      await L.pic(w, `C5-oil-range-${size}`)
      await press(tid('oilrange-done'), { scroll: false })
      const win = await text(tid('oil-window'))
      ok(size, 'C5: the window line reads the run picked', /2 Mar.*20 Mar/.test(win), win)
    })

    /* C6 — an OIL credit's date: the app's own date box, its calendar over the page; the credit saved on that date */
    await step('C6', 'an OIL credit\'s date', async () => {
      await lw()
      await press(tid('oil-tracker'))
      await p.waitForSelector(tid('oil-sheet'))
      const nm = await p.evaluate(() => document.querySelector('[data-testid^="oil-name-"]')?.getAttribute('data-testid') || null)
      if (!nm) throw new Error('no name in the tracker')
      await press(tid(nm))
      await p.waitForSelector(tid('oil-date'))
      ok(size, 'C6: the date is the app\'s own date box', await p.locator(tid('oil-date')).evaluate(e => e.classList.contains('datebox')), await text(tid('oil-date')))
      await press(tid('oil-date'))
      await p.waitForSelector(tid('dcal-card'))
      const card = await p.locator(tid('dcal-card')).evaluate(e => { const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, h = document.elementFromPoint(x, y); return { on: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth, top: !!h && e.contains(h) } })
      ok(size, 'C6: its calendar is on the screen and on top of the tracker', card.on && card.top, JSON.stringify(card))
      await L.pic(w, `C6-oil-credit-date-${size}`)
      if (process.env.WALK_DEBUG) console.log('   C6 after pic: cards', await p.locator(tid('dcal-card')).count(), 'cals', await p.locator('[data-testid="dcal-card"] .dcal').count())
      const cal = '[data-testid="dcal-card"] .dcal'
      const today = await p.locator(cal).getAttribute('data-today')
      await press('[data-testid="dcal-card"] .dcal-nav[aria-label="Previous month"]', { scroll: false })
      const prevMonth = await p.locator(cal).getAttribute('data-month')
      const pick = `${prevMonth}-10`
      await press(`[data-testid="dcal-card"] [data-iso="${pick}"]`, { scroll: false })
      ok(size, 'C6: a tap on a date picks it and the calendar goes', !(await has(tid('dcal-card'))) && (await p.locator(tid('oil-date')).getAttribute('data-value')) === pick, `${await p.locator(tid('oil-date')).getAttribute('data-value')} (today ${today})`)
      await p.locator(tid('oil-amt')).fill('1')
      await p.locator(tid('oil-reason')).fill('walk')
      await press(tid('oil-credit-save'), { scroll: false })
      await L.sleep(500)
      const d = `${+pick.slice(8, 10)}`
      const row = await text(`[data-testid="oil-row-${nm.slice(9)}"]`)
      ok(size, `C6: the credit is saved on ${pick}`, row.includes('walk') || new RegExp(`\\b${d}\\b`).test(row), row.slice(0, 200))
    })

    /* C7 — a holiday: a run on the calendar in the form, saved, in the list */
    await step('C7', 'a holiday over a run of days', async () => {
      await L.openCalendarWindow(w)
      await press(tid('days-tab-holidays'), { scroll: false })
      await press(tid('hol-add'))
      await p.waitForSelector(tid('win-holiday'))
      await p.locator(tid('hol-name')).fill('Walk day')
      const y = (await p.locator(tid('holcal')).getAttribute('data-month')).slice(0, 4)
      await toMonth('holcal', `${y}-11`)
      await press(tid(`holcal-day-${y}-11-26`), { scroll: false })
      await toMonth('holcal', `${y}-12`)
      await press(tid(`holcal-day-${y}-12-02`), { scroll: false })
      ok(size, 'C7: the run reads 26 Nov to 2 Dec', /26 Nov.*2 Dec/.test(await text(tid('holcal-selection'))), await text(tid('holcal-selection')))
      ok(size, 'C7: no Clear under it (D901 (1))', !(await has(tid('holcal-clear'))), 'none')
      await L.pic(w, `C7-holiday-${size}`)
      await press(tid('hol-save'), { scroll: false })
      await L.sleep(500)
      const list = await text('[data-testid="win-days"]')
      ok(size, 'C7: saved — the list holds it', /Walk day/.test(list) || /taken|period/i.test(await text('[data-testid="win-holiday"]')), list.slice(0, 160))
    })

    /* C8 — an input's own dates: a NEW input over a run crossing a month; then that SAVED input reopened — its first tap
       starts new dates, never stretches the old (D901: kept) */
    await step('C8', 'an input\'s own dates — new, then saved', async () => {
      await L.go(w, 'inputs')
      if (await p.locator('#inListBtn:visible').count()) await press('#inListBtn')
      await w.press('#inNew')
      await p.waitForSelector('#inpEdCal')
      await p.selectOption('#inpEditType', 'Meeting').catch(() => {})
      await toMonth('inpEdCal', '2026-06')
      await press('#inpEdCal [data-iso="2026-06-29"]', { scroll: true })
      await toMonth('inpEdCal', '2026-07')
      await press('#inpEdCal [data-iso="2026-07-02"]')
      const read = await text('#inpEditPop .rc-read')
      ok(size, 'C8: the run reads Jun 29 → Jul 2', read === 'Jun 29 → Jul 2', read)
      await L.pic(w, `C8-input-new-${size}`)
      const ids0 = await p.evaluate(() => window.INPUTS.map(r => String(r.iid)))
      await press('#inpEditSave')
      await L.sleep(700)
      if (await has('[data-testid^="win-oil"]')) { await p.keyboard.press('Escape'); await L.sleep(300) }
      const made = await p.evaluate(ids => { const r = window.INPUTS.find(x => !ids.includes(String(x.iid))); return r ? { date: r.date, end: r.endDate, iid: String(r.iid) } : null }, ids0)
      ok(size, 'C8: saved over 29 Jun – 2 Jul', !!made && made.date === 'Jun 29' && made.end === 'Jul 2', JSON.stringify(made))
      if (!made) return
      /* reopened: the first tap is a new start (the window's dates are a finished run) */
      await press('#inRangeBtn'); await press('#inRangeAll')
      const row = `#page-inputs [data-iid="${made.iid}"]`
      /* the saved input reopened from the list — its own open button on a desktop, its card on a phone (D718) */
      const opener = p.locator(`${row} [data-testid="in-open"]:visible, ${row} [data-testid="inl-open"]:visible`).first()
      if (await opener.count()) await w.press(opener); else await w.press(p.locator(`${row}:visible`).first())
      await p.waitForSelector('#inpEdCal')
      await toMonth('inpEdCal', '2026-07')                 // it opens on its first date's month, June
      await press('#inpEdCal [data-iso="2026-07-01"]')
      const read2 = await text('#inpEditPop .rc-read')
      ok(size, 'C8: reopened, the first tap starts new dates — not stretched', read2 === 'Jul 1', read2)
      await press('#inpEdCal [data-iso="2026-07-03"]')
      await press('#inpEditSave'); await L.sleep(700)
      if (await has('[data-testid^="win-oil"]')) { await p.keyboard.press('Escape'); await L.sleep(300) }
      const r2 = await p.evaluate(i => { const r = window.INPUTS.find(x => String(x.iid) === i); return r ? [r.date, r.endDate] : null }, made.iid)
      ok(size, 'C8: saved again over 1 – 3 Jul', JSON.stringify(r2) === JSON.stringify(['Jul 1', 'Jul 3']), JSON.stringify(r2))
    })

    /* C9 — the Inputs list's window of dates */
    await step('C9', 'the Inputs list\'s window of dates', async () => {
      await L.go(w, 'inputs')
      if (await p.locator('#inListBtn:visible').count()) await press('#inListBtn')
      await press('#inRangeBtn')
      await p.waitForSelector('#inRangePop')
      const box = await p.locator('#inRangePop').evaluate(e => { const r = e.getBoundingClientRect(); return { on: r.top >= 0 && r.bottom <= innerHeight + 1 && r.left >= 0 && r.right <= innerWidth + 1, b: Math.round(r.bottom), vh: innerHeight } })
      ok(size, 'C9: its calendar opens on the screen', box.on, JSON.stringify(box))
      await toMonth('inRangeCal', '2026-07')
      await press('#inRangeCal [data-iso="2026-07-13"]', { scroll: false })
      await press('#inRangeCal [data-iso="2026-07-17"]', { scroll: false })
      await L.pic(w, `C9-list-dates-${size}`)
      const btn = await text('#inRangeBtn')
      ok(size, 'C9: the list\'s window reads 13 → 17 Jul', /13.*17/.test(btn), btn)
      const out = await p.evaluate(() => [...document.querySelectorAll('#page-inputs [data-iid]')].filter(e => e.getBoundingClientRect().height > 0).length)
      ok(size, 'C9: the list shows that window only (some rows, not every row)', out > 0 && out < await p.evaluate(() => window.INPUTS.length), `${out} rows`)
      if (!(await has('#inRangeAll'))) await press('#inRangeBtn')
      await press('#inRangeAll')
    })

    /* C10 — Jump to a date: a date loads its week; the Today icon (the calendar's own) jumps to today at once */
    await step('C10', 'Jump to a date', async () => {
      await L.go(w, 'viewsched')
      await press(w.phone ? 'button.filt-cal:visible' : 'button.wk-cal:visible', { scroll: false })
      await p.waitForSelector('#weekCal [data-testid="wcal"]')
      ok(size, 'C10: ONE Today icon, in the calendar\'s head', (await p.locator('#weekCal .wc-today').count()) === 1, String(await p.locator('#weekCal .wc-today').count()))
      await press(tid('wcal-next'), { scroll: false })
      await press(tid('wcal-day-2026-08-05'), { scroll: false })
      await L.sleep(500)
      ok(size, 'C10: a date tapped loads its week and closes', (await p.evaluate(() => window.CURWEEK)) === '03/08/2026' && !(await p.locator('#weekCal:visible [data-testid="wcal"]').count()), await p.evaluate(() => window.CURWEEK))
      await press(w.phone ? 'button.filt-cal:visible' : 'button.wk-cal:visible', { scroll: false })
      await L.pic(w, `C10-jump-${size}`)
      await press(tid('wcal-today'), { scroll: false })
      await L.sleep(500)
      ok(size, 'C10: Today jumps to the planning day\'s week at once', (await p.evaluate(() => window.CURWEEK)) === '13/07/2026' && !(await p.locator('#weekCal:visible [data-testid="wcal"]').count()), await p.evaluate(() => window.CURWEEK))
    })

    /* E1 — the SANS calendar: a run held at the month's side turns the month and goes on (D900) */
    await step('E1', 'the SANS calendar\'s run held at the side', async () => {
      await L.go(w, 'inputs')
      await press('button.intab:has-text("SANS")', { scroll: false })
      await L.sleep(700)
      const mon = () => p.evaluate(() => document.querySelector('[data-testid="sc-month"]')?.textContent || '')
      const m0 = await mon()
      const s = await p.evaluate(() => {
        const cells = [...document.querySelectorAll('[data-testid^="sc-day-"]')].filter(e => e.offsetParent !== null)
        const c = cells.find(e => /-2[4-8]$/.test(e.getAttribute('data-testid'))) || cells[20]
        let gr = c.parentElement; while (gr && gr.getBoundingClientRect().width < innerWidth * 0.5) gr = gr.parentElement
        const r = c.getBoundingClientRect(), R = (gr || document.body).getBoundingClientRect()
        return { x: r.x + r.width / 2, y: r.bottom - 5, right: Math.min(R.right, innerWidth), iso: c.getAttribute('data-testid').slice(7) }
      })
      const H = await hand(w)
      await H.down(s.x, s.y); await L.sleep(w.phone ? 520 : 0)
      await H.to(s.right - 4, s.y); await L.sleep(1000)
      const m1 = await mon()
      ok(size, 'E1: a run held at the SANS month\'s right side turns to the next month', m1 !== m0 && !!m1, `${m0} → ${m1}`)
      ok(size, 'E1: the run is still being drawn after the turn', await p.evaluate(() => !!document.querySelector('.is-picking, .is-picked')), 'drawn')
      await L.pic(w, `E1-sans-turn-${size}`)
      const t = await p.evaluate(() => { const c = [...document.querySelectorAll('[data-testid^="sc-day-"]')].filter(e => e.offsetParent !== null && /-0[3-6]$/.test(e.getAttribute('data-testid')))[0]; const r = c.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.bottom - 5, iso: c.getAttribute('data-testid').slice(7) } })
      await H.to(t.x, t.y); await L.sleep(300); await H.up(); await L.sleep(700)
      const win = await p.evaluate(() => (window.INPEDIT_FOR_TESTS || null))
      const title = await text('[data-testid="win-inputedit"] .win-ttl')
      ok(size, `E1: let go on ${t.iso}, "+ Commitment" opens for the run across the month`, /→/.test(title) || /→/.test(await text('#inpEditPop .rc-read')), title || JSON.stringify(win))
      await p.keyboard.press('Escape'); await L.sleep(300)
    })

    /* E2 — the Tracker's ▣ Select box carried to the canvas's edge: the canvas pans; let go, the balls taken in */
    await step('E2', 'the Tracker\'s Select box carried to the edge', async () => {
      await L.go(w, 'tracker'); await p.waitForSelector('#flowSvg .ball', { timeout: 30000 }); await L.sleep(800)
      await p.locator('[title^="Edit the syllabus"]').first().click(); await L.sleep(300)
      await w.press('#arrangeBtn'); await p.waitForSelector('#viewport', { timeout: 10000 }); await L.sleep(700)
      if (!w.phone) { await p.locator('button:visible', { hasText: /Fit$/ }).first().click(); await L.sleep(500) }
      await p.locator('button:visible', { hasText: /Select$/ }).first().click(); await L.sleep(400)
      const viewT = () => p.evaluate(() => { const m = (document.getElementById('viewport')?.getAttribute('transform') || '').match(/translate\(([-\d.]+),([-\d.]+)\)/); return m ? { x: +m[1], y: +m[2] } : null })
      const bb = await p.evaluate(() => { const r = document.getElementById('board').getBoundingClientRect(); return { l: r.left, r: Math.min(r.right, innerWidth), t: r.top, b: Math.min(r.bottom, innerHeight) } })
      /* an empty spot on the canvas, left of the middle */
      const at = await p.evaluate(box => {
        for (let dy = 0; dy < 200; dy += 10) for (let dx = 0; dx < 200; dx += 10) {
          const x = box.l + 40 + dx, y = box.t + 40 + dy, e = document.elementFromPoint(x, y)
          if (e && !e.closest('.ball') && !e.closest('.edgehit') && (e.closest('#flowSvg'))) return { x, y }
        }
        return null
      }, bb)
      if (!at) throw new Error('no empty spot on the canvas')
      const v0 = await viewT()
      const H = await hand(w)
      await H.down(at.x, at.y); await H.to(at.x + 20, at.y + 20, 3); await H.to(bb.r - 6, bb.b - 40); await L.sleep(1200)
      const v1 = await viewT()
      ok(size, 'E2: the box held at the canvas\'s edge pans the canvas', !!v0 && !!v1 && (v1.x < v0.x - 60), `${JSON.stringify(v0)} → ${JSON.stringify(v1)}`)
      const band = await p.evaluate(() => { const r = document.querySelector('#bandLayer rect'); if (!r) return null; const b = r.getBoundingClientRect(); return { r: Math.round(b.right), b: Math.round(b.bottom) } })
      ok(size, 'E2: the box\'s far corner stays under the pointer', !!band && Math.abs(band.r - (bb.r - 6)) < 30, JSON.stringify(band))
      await L.pic(w, `E2-select-box-${size}`)
      await H.up(); await L.sleep(600)
      const n = await p.evaluate(() => document.querySelectorAll('#flowSvg .ball.sel, #flowSvg .ball.selected, #flowSvg .ball[data-sel]').length)
      const hint = await p.evaluate(() => [...document.querySelectorAll('*')].map(e => e.childNodes.length === 1 && e.firstChild.nodeType === 3 ? e.textContent : '').find(t => / selected — drag/.test(t)) || '')
      ok(size, 'E2: let go, the balls inside the box are selected', /\d+ selected/.test(hint) || n > 0, hint || `${n} marked`)
      const v2 = await viewT(); await L.sleep(800)
      ok(size, 'E2: let go, the canvas pans no more', JSON.stringify(await viewT()) === JSON.stringify(v2), JSON.stringify(v2))
    })

    /* E3 — the Tracker's ⇅ Reorder list: a row carried to the list's foot scrolls it (desktop — the browser's own drag;
       a phone cannot drag these rows) */
    if (!w.phone) await step('E3', 'the Tracker\'s Reorder list', async () => {
      await L.go(w, 'tracker'); await p.waitForSelector('#flowSvg .ball', { timeout: 30000 }); await L.sleep(500)
      /* the list of the ROSTER (crew order) — the longest; opened by the Students card's ⇅ */
      await p.setViewportSize({ width: 1440, height: 420 }); await L.sleep(400)
      const opened = await p.evaluate(() => { const b = document.getElementById('ordCrew') || document.getElementById('ordCourse'); if (b && !b.disabled) { b.click(); return b.id + ' ' + b.textContent } return null })
      await L.sleep(500)
      if (!opened || !(await has('#ordList'))) throw new Error('no ⇅ Reorder window')
      const lst = await p.evaluate(() => { const l = document.getElementById('ordList'); const r = l.getBoundingClientRect(); return { t: r.top, b: r.bottom, l: r.left, r: r.right, more: l.scrollHeight > l.clientHeight + 1, rows: l.querySelectorAll('.ordrow').length } })
      if (!lst.more) { ok(size, `E3: the Reorder list (${opened.trim()}) is longer than its box — nothing to scroll`, true, `${lst.rows} rows, all shown — the scroll is carried by the break test`); await p.keyboard.press('Escape'); return }
      const first = await p.evaluate(() => { const r = document.querySelector('#ordList .ordrow').getBoundingClientRect(); return { x: r.left + 40, y: r.top + r.height / 2 } })
      await p.mouse.move(first.x, first.y); await p.mouse.down(); await L.sleep(100)
      for (let i = 1; i <= 10; i++) { await p.mouse.move(first.x, first.y + (lst.b - 8 - first.y) * i / 10); await L.sleep(40) }
      for (let i = 0; i < 20; i++) { await p.mouse.move(first.x, lst.b - 8 + (i % 2)); await L.sleep(60) }
      const top = await p.evaluate(() => document.getElementById('ordList').scrollTop)
      ok(size, 'E3: a row held at the list\'s foot scrolls it', top > 20, `scrollTop ${top}`)
      await L.pic(w, `E3-reorder-${size}`)
      await p.mouse.up(); await L.sleep(400)
      await p.locator('#ordCancel').click().catch(() => {})
      await p.setViewportSize({ width: 1440, height: 900 }); await L.sleep(300)
    })

    /* E4 — the people picker: a drag across faces carried to the foot of the input's window scrolls it, picking on */
    await step('E4', 'the people picker\'s drag held at the window\'s foot', async () => {
      /* a desktop 900 tall shows every face at once — nothing to scroll; a short window (a laptop's, 600) makes the faces
         run past the window's foot, as they do on a phone */
      if (!w.phone) { await p.setViewportSize({ width: 1440, height: 600 }); await L.sleep(400) }
      await L.go(w, 'inputs')
      if (await p.locator('#inListBtn:visible').count()) await press('#inListBtn')
      await p.evaluate(() => window.scrollTo(0, 0)); await L.sleep(200)
      await w.press('#inNew')
      await p.waitForSelector('#inpEdCal')
      await p.selectOption('#inpEditType', 'Meeting').catch(() => {})
      await press(tid('pp-several'), { scroll: true })
      await L.sleep(300)
      const geo = await p.evaluate(() => {
        const body = document.querySelector('[data-testid="win-inputedit"] .win-body') || document.querySelector('#inpEditPop')
        let sc = document.querySelector('[data-testid="pp"]'); while (sc && !(sc.scrollHeight > sc.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(sc).overflowY))) sc = sc.parentElement
        const pucks = [...document.querySelectorAll('[data-testid="pp"] [data-pp]')].filter(e => { const r = e.getBoundingClientRect(); return r.height > 0 })
        const R = sc ? sc.getBoundingClientRect() : null
        const vis = R ? pucks.filter(e => { const r = e.getBoundingClientRect(); return r.top >= R.top && r.bottom <= R.bottom }) : []
        const bar = sc ? [...sc.querySelectorAll('*')].filter(k => getComputedStyle(k).position === 'sticky' && !k.closest('[data-testid="pp"]')).map(k => k.getBoundingClientRect()).filter(b => R && b.bottom >= Math.min(R.bottom, innerHeight) - 1).map(b => b.top)[0] : null
        return { scroller: !!sc && sc !== document.scrollingElement, top: sc ? sc.scrollTop : 0, R: R && { t: R.top, b: Math.min(R.bottom, innerHeight, bar ?? 1e9), l: R.left, r: R.right }, first: vis[0] && (() => { const r = vis[0].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })(), n: pucks.length, body: !!body }
      })
      if (!geo.scroller || !geo.first) { ok(size, 'E4: the window\'s faces run past its foot (something to scroll)', false, JSON.stringify(geo)); return }
      /* scroll so a face is near the top, then drag sideways first (a finger's drag starts sideways) and down to the foot */
      const H = await hand(w)
      const picked0 = await p.evaluate(() => document.querySelectorAll('[data-testid="pp"] [data-pp][aria-pressed="true"]').length)
      await H.down(geo.first.x, geo.first.y); await H.to(geo.first.x + 30, geo.first.y + 4, 4)
      await H.to(geo.first.x + 30, geo.R.b - 6); await L.sleep(2500)
      const top1 = await p.evaluate(() => { let sc = document.querySelector('[data-testid="pp"]'); while (sc && !(sc.scrollHeight > sc.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(sc).overflowY))) sc = sc.parentElement; return sc ? sc.scrollTop : -1 })
      ok(size, 'E4: held at the foot of the faces seen (above the window\'s Save bar), the window scrolls', top1 > geo.top + 30, `${geo.top} → ${top1}`)
      const end = await p.evaluate(b => { const r = document.querySelector('[data-testid="pp"] .pp-body').getBoundingClientRect(); return { last: Math.round(r.bottom), seenFoot: Math.round(b) } }, geo.R.b)
      ok(size, 'E4: it stops at the last face — the faces\' end is in sight, not carried away past it', end.last <= end.seenFoot + 2 && end.last >= end.seenFoot - 60, JSON.stringify(end))
      await L.pic(w, `E4-people-drag-${size}`)
      await H.up(); await L.sleep(400)
      const picked1 = await p.evaluate(() => document.querySelectorAll('[data-testid="pp"] [data-pp][aria-pressed="true"]').length)
      ok(size, 'E4: the faces slid under the pointer are picked too', picked1 > picked0 + 2, `${picked0} → ${picked1}`)
      const pageTop = await p.evaluate(() => scrollY)
      ok(size, 'E4: the page behind the window did not scroll (D686)', pageTop === 0, String(pageTop))
      await p.locator('#inpEditCancel').click().catch(() => {})
      if (!w.phone) await p.setViewportSize({ width: 1440, height: 900 })
    })

    /* THE BLIND READ'S ROLL-CALL GAPS (read-opus.md, 15 Oct 26) — walked, not carried:
       G1 an OIL correction's date edited (its own date box, `oil-edit-date`); G2 "Jump to a date" from the Scheduler
       Board (loads the week AND reopens the board on the tapped day; its Today too); G4 the people picker's drag in the
       input DIALOG (opened off the Inputs page — the schedule's Personal Inputs line) and in SANS "+ Commitment". */
    await step('G1', 'an OIL correction\'s date, edited', async () => {
      await lw()
      await press(tid('oil-tracker'))
      await p.waitForSelector(tid('oil-sheet'))
      const nm = await p.evaluate(() => document.querySelector('[data-testid^="oil-name-"]')?.getAttribute('data-testid') || null)
      if (!nm) throw new Error('no name in the tracker')
      await press(tid(nm))
      await p.waitForSelector(tid('oil-sign'))
      await press(tid('oil-sign'), { scroll: false })
      await p.locator(tid('oil-amt')).fill('0.5')
      await p.locator(tid('oil-reason')).fill('walkcorr')
      await press(tid('oil-credit-save'), { scroll: false })
      await L.sleep(500)
      const entry = p.locator('.oil-e.take.corr', { hasText: 'walkcorr' }).first()
      if (!(await entry.count())) {
        /* the person's entries may sit behind his row — open it */
        await press(`[data-testid="oil-row-${nm.slice(9)}"]`).catch(() => {})
      }
      await entry.waitFor({ state: 'attached', timeout: 5000 })
      const eid = await entry.getAttribute('data-testid')
      await press(`[data-testid="${eid}"]`)
      await p.waitForSelector(tid('oil-edit-date'))
      ok(size, 'G1: the correction opens with the app\'s own date box', await p.locator(tid('oil-edit-date')).evaluate(e => e.classList.contains('datebox')), await text(tid('oil-edit-date')))
      const was = await p.locator(tid('oil-edit-date')).getAttribute('data-value')
      await press(tid('oil-edit-date'))
      await p.waitForSelector(tid('dcal-card'))
      const card = await p.locator(tid('dcal-card')).evaluate(e => { const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, h = document.elementFromPoint(x, y); return { on: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth, top: !!h && e.contains(h) } })
      ok(size, 'G1: its calendar is on the screen, on top', card.on && card.top, JSON.stringify(card))
      await press('[data-testid="dcal-card"] .dcal-nav[aria-label="Previous month"]', { scroll: false })
      const pick = `${await p.locator('[data-testid="dcal-card"] .dcal').getAttribute('data-month')}-12`
      await press(`[data-testid="dcal-card"] [data-iso="${pick}"]`, { scroll: false })
      ok(size, 'G1: a tap picks the date, the calendar goes, the editor stays open', !(await has(tid('dcal-card'))) && await has(tid('oil-edit-save')) && (await p.locator(tid('oil-edit-date')).getAttribute('data-value')) === pick, `${was} → ${await p.locator(tid('oil-edit-date')).getAttribute('data-value')}`)
      await L.pic(w, `G1-oil-correction-date-${size}`)
      /* a phone's row of entries may sit part under the pinned names — swiped into view, as a finger does */
      await press(tid('oil-edit-save'))
      await L.sleep(500)
      const saved = await p.evaluate(eid0 => { const e = document.querySelector(`[data-testid="${eid0}"]`) || [...document.querySelectorAll('.oil-e.take.corr')].find(x => /walkcorr/.test(x.textContent || '')); return e ? (e.querySelector('.dt')?.textContent || '').trim() : null }, eid)
      const d = +pick.slice(8, 10)
      ok(size, `G1: saved — the correction now reads the ${d}th`, !!saved && new RegExp(`\\b${d}\\b`).test(saved), String(saved))
    })

    await step('G2', 'Jump to a date from the Scheduler Board', async () => {
      await L.go(w, 'editsched')
      await p.evaluate(() => window.openScheduler(2)); await L.sleep(600)
      await p.waitForSelector('#sbCal')
      if (!(await p.locator('#sbCal').isVisible())) { ok(size, 'G2: the board\'s calendar button (a phone\'s; the desktop jumps from the week)', true, 'not drawn at this size — the week\'s own button is C10'); return }
      await press('#sbCal', { scroll: false })
      await p.waitForSelector('#weekCal [data-testid="wcal"]')
      await press(tid('wcal-next'), { scroll: false })
      await press(tid('wcal-day-2026-08-06'), { scroll: false })
      await L.sleep(700)
      const st = await p.evaluate(() => ({ wk: window.CURWEEK, day: window.SBDAY, board: !!document.querySelector('#schedBoard') && getComputedStyle(document.querySelector('#schedBoard')).display !== 'none', cal: !!document.querySelector('#weekCal:not([hidden]) [data-testid="wcal"]') }))
      ok(size, 'G2: a date tapped loads its week and reopens the board on that day (Thu 6 Aug)', st.wk === '03/08/2026' && st.day === 3 && st.board && !st.cal, JSON.stringify(st))
      await L.pic(w, `G2-board-jump-${size}`)
      await press('#sbCal', { scroll: false })
      await press(tid('wcal-today'), { scroll: false })
      await L.sleep(700)
      const st2 = await p.evaluate(() => ({ wk: window.CURWEEK, board: !!document.querySelector('#schedBoard') && getComputedStyle(document.querySelector('#schedBoard')).display !== 'none' }))
      ok(size, 'G2: Today jumps back to the planning day\'s week, the board still open', st2.wk === '13/07/2026' && st2.board, JSON.stringify(st2))
      await p.evaluate(() => window.go('viewsched')).catch(() => {})
    })

    /** a drag across the picker's faces, carried to the foot of what scrolls them: faces picked, the scroller (never
     *  the page) moves when there is more below */
    const faceDrag = async (id, scope) => {
      const geo = await p.evaluate(sc0 => {
        const pp = document.querySelector(`${sc0} [data-testid="pp"]`)
        let sc = pp; while (sc && !(sc.scrollHeight > sc.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(sc).overflowY))) sc = sc.parentElement
        const pucks = [...document.querySelectorAll(`${sc0} [data-testid="pp"] [data-pp]`)].filter(e => e.getBoundingClientRect().height > 0)
        const R = sc ? sc.getBoundingClientRect() : { top: 0, bottom: innerHeight }
        const vis = pucks.filter(e => { const r = e.getBoundingClientRect(); return r.top >= Math.max(R.top, 0) && r.bottom <= Math.min(R.bottom, innerHeight) })
        const bar = sc ? [...sc.querySelectorAll('*')].filter(k => getComputedStyle(k).position === 'sticky' && !k.closest('[data-testid="pp"]')).map(k => k.getBoundingClientRect()).filter(b => b.bottom >= Math.min(R.bottom, innerHeight) - 1).map(b => b.top)[0] : null
        /* start on a face NOT picked — a drag that starts on a picked face takes faces off (its own rule) */
        const v0 = vis.find(e => e.getAttribute('aria-pressed') !== 'true') || vis[0]
        const r0 = v0 && v0.getBoundingClientRect()
        const last = pucks.length ? Math.max(...pucks.map(e => e.getBoundingClientRect().bottom)) : 0
        return { more: !!sc && sc !== document.scrollingElement && last > Math.min(R.bottom, innerHeight, bar ?? 1e9) + 1, top: sc ? sc.scrollTop : 0, foot: Math.min(R.bottom, innerHeight, bar ?? 1e9), first: r0 && { x: r0.left + r0.width / 2, y: r0.top + r0.height / 2 }, n: pucks.length }
      }, scope)
      if (!geo.first) throw new Error(`no face in sight in ${scope}: ${JSON.stringify(geo)}`)
      const picked = () => p.evaluate(sc0 => document.querySelectorAll(`${sc0} [data-testid="pp"] [data-pp][aria-pressed="true"]`).length, scope)
      const n0 = await picked()
      const H = await hand(w)
      await H.down(geo.first.x, geo.first.y); await H.to(geo.first.x + 30, geo.first.y + 4, 4)
      await H.to(geo.first.x + 30, geo.foot - 6); await L.sleep(geo.more ? 2000 : 400)
      const top1 = await p.evaluate(sc0 => { let sc = document.querySelector(`${sc0} [data-testid="pp"]`); while (sc && !(sc.scrollHeight > sc.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(sc).overflowY))) sc = sc.parentElement; return sc ? sc.scrollTop : -1 }, scope)
      const lastIn = await p.evaluate(([sc0, foot]) => { const b = [...document.querySelectorAll(`${sc0} [data-testid="pp"] [data-pp]`)].map(e => e.getBoundingClientRect().bottom); return Math.max(...b) <= foot + 2 }, [scope, geo.foot])
      if (geo.more) ok(size, `${id}: held at the foot of the faces seen, what holds them scrolls — on to the last face, and no further`, top1 > geo.top && lastIn, `${geo.top} → ${top1}, last face in sight: ${lastIn}`)
      else ok(size, `${id}: every face is in sight here — held at their foot, nothing scrolls`, top1 === geo.top, `${geo.n} faces, ${geo.top} → ${top1}`)
      await L.pic(w, `${id}-people-drag-${size}`)
      await H.up(); await L.sleep(400)
      const n1 = await picked()
      ok(size, `${id}: the faces the drag passed are picked`, n1 > n0 + 1, `${n0} → ${n1}`)
      ok(size, `${id}: the page behind did not scroll (D686)`, (await p.evaluate(() => scrollY)) === 0, String(await p.evaluate(() => scrollY)))
    }

    await step('G4a', 'the people picker in the schedule\'s input dialog', async () => {
      await L.go(w, 'inputs')
      const iid = await p.evaluate(() => { const w0 = window, P = w0.PEOPLE; const crew = Object.keys(P).filter(id => !P[id].san && !P[id].archived && !P[id].deleted && !P[id].special && !P[id].pers); const iid = 'g4a-' + Date.now().toString(36); w0.fileInput({ iid, people: crew.slice(3, 5).map(p => ({ p })), type: 'Meeting', date: 'Jul 15', yr: 2026, allday: false, s: 540, e: 600 }); return iid })
      await L.go(w, 'editsched')
      await p.evaluate(() => window.openScheduler(2)); await L.sleep(600)
      const fold = p.locator('#schedBoard [data-pitog="2"]').first()
      if (await fold.count() && /show/.test(await fold.innerText())) await press('#schedBoard [data-pitog="2"]')
      await press('#schedBoard .sb-panel.pinp .sb-arow.inprow .inpedit')
      await p.waitForSelector('#inpEditPop:not([hidden])')
      ok(size, 'G4a: a shared input opens as the dialog (off the Inputs page), with the people picker (D748)', await has('#inpEditPop [data-testid="pp"]'), iid)
      if (!(await p.locator('#inpEditPop [data-testid="pp-several"][aria-pressed="true"], #inpEditPop [data-testid="pp-several"][aria-checked="true"]').count())) await press('#inpEditPop [data-testid="pp-several"]')
      await L.sleep(300)
      await faceDrag('G4a', '#inpEditPop')
      await press('#inpEditClose', { scroll: false }).catch(() => {})
      if (await has('[data-testid="inped-swap-stay"], [data-testid="inped-discard"]')) await p.keyboard.press('Escape')
      await p.evaluate(() => window.go('viewsched')).catch(() => {})
    })

    await step('G4b', 'the people picker in SANS "+ Commitment", several men', async () => {
      await L.go(w, 'inputs')
      await press('button.intab:has-text("SANS")', { scroll: false })
      await L.sleep(700)
      const day = await p.evaluate(() => { const c = [...document.querySelectorAll('[data-testid^="sc-day-"]')].filter(e => e.offsetParent !== null && /-1[0-9]$/.test(e.getAttribute('data-testid'))); return c[3] ? c[3].getAttribute('data-testid') : null })
      if (!day) throw new Error('no SANS day')
      await press(tid(day))
      await p.waitForSelector(tid('sd-add'))
      await press(tid('sd-add'))
      await p.waitForSelector('[data-testid="win-inputedit"] [data-testid="pp"]')
      if (!(await p.locator('[data-testid="win-inputedit"] [data-testid="pp-several"][aria-pressed="true"], [data-testid="win-inputedit"] [data-testid="pp-several"][aria-checked="true"]').count())) await press('[data-testid="win-inputedit"] [data-testid="pp-several"]')
      await L.sleep(300)
      ok(size, 'G4b: "+ Commitment" offers several men', await has('[data-testid="win-inputedit"] [data-testid="pp"] [data-pp]'), 'faces drawn')
      await faceDrag('G4b', '[data-testid="win-inputedit"]')
      await p.locator('#inpEditCancel').click().catch(() => {})
    })

    ok(size, 'no console or page errors', w.errors.length === 0, w.errors.length ? w.errors.join(' | ').slice(0, 300) : '0')
  } finally { await L.close(w) }
}
const fails = results.filter(r => !r.pass)
console.log(`\n${results.length - fails.length} / ${results.length} PASS`)
process.exit(fails.length ? 1 : 0)
