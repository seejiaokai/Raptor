/* [HUMAN-RETEST] the absence record, walked with [S4-HUNT-REST] (26 Sep 26) — shared walk helpers.
   Builds on the amendment walk's drivers (../am/w4-lib.mjs → am-lib.mjs → ../lib.mjs): open / login / go / board /
   the Leave War's cells, taps, bids, awards, the OIL tracker, the Inputs form. Everything here drives the app's OWN
   controls, so a fixture is made the way a person makes it (bug-check order §7.7). Reads of window.* are for the
   evidence table only; nothing here WRITES through window. */
import './ab-env.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'
export * from '../am/w4-lib.mjs'
export { toastSpy, toasts, shotUnion, shotBox, norm, dayInfo, closeDayInfo, panel } from '../am/w1-lib.mjs'
export { ROOT } from './ab-env.mjs'
import { lwOpen as lwOpen0, fileInput as fileInput0, closeBoard } from '../am/w4-lib.mjs'

/** The scheduler board is a full-screen layer over every page: close it through its own ✕ before going to the war,
    or every click on the war lands on the board. */
export async function lwOpen(page, iso) {
  if (await page.locator('#schedBoard:visible').count()) await closeBoard(page)
  return lwOpen0(page, iso)
}

/** File an input through the real Inputs page form (../am/w4-lib.mjs fileInput) — and name the NEW input by the
    difference in ids before and after (the page puts a new row at the TOP of the list, the war at the bottom, so
    "the last one" is not the new one). */
export async function fileInput(page, f) {
  if (await page.locator('#schedBoard:visible').count()) await closeBoard(page)
  const ids = await page.evaluate(() => window.INPUTS.map(x => x.iid))
  const r = await fileInput0(page, f)
  const fresh = await page.evaluate(ids => { const s = new Set(ids); return window.INPUTS.filter(x => !s.has(x.iid)).map(x => x.iid) }, ids)
  return { ...r, iid: fresh.length === 1 ? fresh[0] : (fresh.length ? fresh : null) }
}

/** Every Leave War sheet is a `.bidsheet[role=dialog]` with its own data-testid (bid-picker — place or decide;
    raptor-sheet — leave from Raptor / OIL the app credited; daylist-sheet — a day holding several records;
    postout-sheet / postin-sheet). Read whichever is open: its name, its words, and every button a person could
    press (testid: label, disabled). */
export async function sheetNow(page) {
  return page.evaluate(() => {
    const d = [...document.querySelectorAll('.bidsheet[role="dialog"]')].filter(e => e.offsetWidth || e.offsetHeight)
    if (!d.length) return { open: 'nothing' }
    const s = d[d.length - 1]
    return {
      open: s.getAttribute('data-testid'), label: s.getAttribute('aria-label'),
      text: (s.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 900),
      buttons: [...s.querySelectorAll('button')].filter(b => b.offsetWidth || b.offsetHeight)
        .map(b => `${b.getAttribute('data-testid') || '?'}:${(b.innerText || b.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 30)}${b.disabled ? '(off)' : ''}`),
      lines: [...s.querySelectorAll('[data-testid="daylist"] li')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()),
    }
  })
}

/** Tap a man's day box on the war, the way a person does, and report what opened. */
export async function tapCell(page, id, iso) {
  if (!(await page.locator(`[data-testid="cell-${id}-${iso}"]`).count())) await lwOpen(page, iso)
  const c = page.locator(`[data-testid="cell-${id}-${iso}"]`).first()
  if (!(await c.count())) return { open: 'NO CELL DRAWN' }
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(300)
  /* tap the spot a finger would, after checking the box itself is what sits there (a sticky head, the month strip
     or a sheet can cover it) — Playwright's own actionability wait can hang on a grid that is still settling */
  const at = await c.evaluate(e => { const b = e.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2
    const h = document.elementFromPoint(x, y); return { x, y, ok: !!h && (h === e || e.contains(h)), over: h ? `${h.tagName}.${String(h.className).slice(0, 30)}[${h.getAttribute('data-testid') || ''}]` : 'nothing' } })
  if (!at.ok) return { open: 'COVERED', over: at.over }
  await page.mouse.click(at.x, at.y)
  await page.waitForTimeout(600)
  return sheetNow(page)
}

/** Place a bid through the bid sheet: tap the box, pick the portion, press the leave's chip (a second press is the
    "take the balance below zero" yes). Returns what the sheet said if it stayed open (a refusal says why). */
export async function bidOn(page, id, iso, code = 'LL', { portion = 'full', confirmNegative = true } = {}) {
  const t = await tapCell(page, id, iso)
  if (t.open !== 'bid-picker') { await closeSheets(page); return { placed: false, why: 'opened ' + t.open, tap: t } }
  if (portion !== 'full') await sheetPress(page, `portion-${portion}`)
  const r = await sheetPress(page, `bid-${code}`)
  let s = await sheetNow(page)
  if (s.open === 'bid-picker' && /Tap the same leave again/i.test(s.text) && confirmNegative) { await sheetPress(page, `bid-${code}`); s = await sheetNow(page) }
  const placed = s.open === 'nothing'
  if (!placed) await closeSheets(page)
  return { placed, pressed: r.pressed, why: placed ? '' : (s.text || '').slice(0, 300) }
}

/** Close whatever sheet is open through its own ✕ (then Escape as a fallback). */
export async function closeSheets(page) {
  for (let i = 0; i < 4; i++) {
    const x = page.locator('.bidsheet[role="dialog"] button.x:visible').last()
    if (await x.count()) { await x.click().catch(() => {}); await page.waitForTimeout(350); continue }
    if (await page.locator('[data-testid="sheet-scrim"]').count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(300); continue }
    break
  }
}

/** Press a button inside the open sheet by its testid (or its words), report the sheet after. */
export async function sheetPress(page, which) {
  const s = page.locator('.bidsheet[role="dialog"]:visible').last()
  const b = which instanceof RegExp ? s.locator('button').filter({ hasText: which }).first() : s.locator(`[data-testid="${which}"]`).first()
  if (!(await b.count())) return { pressed: false, why: 'no ' + which, sheet: await sheetNow(page) }
  if (await b.isDisabled()) return { pressed: false, why: 'disabled', sheet: await sheetNow(page) }
  await b.click()
  await page.waitForTimeout(600)
  return { pressed: true, sheet: await sheetNow(page) }
}

/** A man's row across a run of dates on the war: each box's code and its mark ([+n] / [!]). */
export async function rowRun(page, id, isos) {
  return page.evaluate(([p, ds]) => ds.map(d => {
    const c = document.querySelector(`[data-testid="cell-${p}-${d}"]`)
    const m = document.querySelector(`[data-testid="mark-${p}-${d}"]`)
    const po = document.querySelector(`[data-testid="potag-${p}-${d}"]`)
    return c ? `${d.slice(5)}:${(c.innerText || '').replace(/\s+/g, ' ').trim() || '·'}${m ? '[' + m.innerText.trim() + ']' : ''}${po ? '{PO}' : ''}` : `${d.slice(5)}:NO CELL`
  }), [id, isos])
}

/** Every figure on a man's "every figure" sheet (tap the callsign; its ✕ closes it). */
export async function figures(page, id) {
  const who = page.locator(`[data-testid="person-${id}"]:visible`).first()
  if (!(await who.count())) return { err: 'NO PERSON CELL' }
  await who.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await who.click()
  await page.waitForTimeout(500)
  const r = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-testid^="pfig-"]')]
    .filter(e => /^pfig-[a-z0-9]+$/i.test(e.getAttribute('data-testid')) && e.getAttribute('data-testid') !== 'pfig-close')
    .map(e => [e.getAttribute('data-testid').slice(5), ((e.querySelector('.fb') || e).innerText || '').replace(/\s+/g, ' ').trim()])))
  const x = page.locator('[data-testid="pfig-close"]:visible').first()
  if (await x.count()) { await x.click(); await page.waitForTimeout(300) } else await closeSheets(page)
  return r
}

/** The Inputs page: switch the view ('list' | 'cal' | 'med') through its own buttons. */
export async function inputsView(page, view) {
  const { go } = await import('../am/w4-lib.mjs')
  await go(page, 'inputs')
  await page.waitForSelector('#inCalBtn', { timeout: 8000 })
  /* the calendar is FULL-SCREEN over the page's own buttons: leave it through its own "Back to list" ✕ first */
  if (await page.locator('#icClose:visible').count()) { await page.locator('#icClose').click(); await page.waitForTimeout(500) }
  if (view === 'list') {
    if (await page.locator('#inMedBtn.on, #inMedBtn[aria-pressed="true"]').count()) { await page.locator('#inMedBtn').click(); await page.waitForTimeout(500) }
    return 'list'
  }
  await page.locator(view === 'cal' ? '#inCalBtn' : '#inMedBtn').click()
  await page.waitForTimeout(600)
  return view
}

/** The Inputs table shows a DATE WINDOW (by default today + two weeks), so a July input is not in it until the window
    is moved — through the page's own 📅 range button and its calendar (two clicks: start, end). */
export async function inputsWindow(page, fromIso, toIso) {
  await inputsView(page, 'list')
  const btn = page.locator('#inRangeBtn')
  if ((await btn.getAttribute('aria-expanded')) !== 'true') { await btn.click(); await page.waitForTimeout(300) }
  const pop = '#inRangePop'
  const MON3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const walkTo = async (iso) => {
    for (let i = 0; i < 40 && !(await page.locator(`${pop} [data-cal="${iso}"]`).count()); i++) {
      const lbl = (await page.locator(`${pop} [data-cal]`).first().getAttribute('aria-label')) || ''   // "1 Sep 2026"
      const [, m, y] = lbl.split(' ')
      const at = `${y}-${String(MON3.indexOf(m) + 1).padStart(2, '0')}`
      await page.locator(`${pop} button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`).first().click()
      await page.waitForTimeout(80)
    }
    await page.locator(`${pop} [data-cal="${iso}"]`).first().click()
    await page.waitForTimeout(150)
  }
  await walkTo(fromIso); await walkTo(toIso || fromIso)
  /* close it the way a person does: on a phone the popup sits over its own button, so tap OUTSIDE it (the app's
     standing popup rule — a click-open popup closes on a press outside it), in the empty space below it */
  if ((await btn.getAttribute('aria-expanded')) === 'true') {
    const at = await page.evaluate(() => { const p = document.querySelector('#inRangePop').getBoundingClientRect(), bt = document.querySelector('#inRangeBtn'), b = bt.getBoundingClientRect()
      /* the button itself when it is what sits under a finger (desktop); otherwise the empty space outside the popup */
      const bx = b.left + b.width / 2, by = b.top + b.height / 2, h = document.elementFromPoint(bx, by)
      if (h && (h === bt || bt.contains(h))) return { x: bx, y: by }
      const below = p.bottom + 24 < innerHeight - 4
      return { x: Math.min(innerWidth - 8, p.left + p.width / 2), y: below ? p.bottom + 24 : Math.max(4, Math.min(p.top, b.top) - 24) } })
    await page.mouse.click(at.x, at.y); await page.waitForTimeout(300)
  }
  return (await btn.innerText()).trim()
}
/** Delete one input from the Inputs table through its row's ✕ (the window must already show its date). */
export async function deleteInputRow(page, iid) {
  const x = page.locator(`#inBody tr[data-iid="${iid}"] .rmx`).first()
  if (!(await x.count())) return { deleted: false, why: 'row not in the table (window?)' }
  await x.click(); await page.waitForTimeout(600)
  return { deleted: !(await page.locator(`#inBody tr[data-iid="${iid}"]`).count()) }
}

/** The inputs for one person (and optionally one date), as stored — for the evidence table only. */
export async function inputsOf(page, person) {
  return page.evaluate(p => window.INPUTS.filter(x => x.person === p).map(x => ({ iid: x.iid, type: x.type, date: x.date, endDate: x.endDate || '', allday: !!x.allday, s: x.s, e: x.e, remarks: (x.remarks || '').slice(0, 60), lw: x.lw || '' })), person)
}

/** A walker's result book: PASS / FAIL / NOTE lines printed as they happen, and written to a file at the end. */
export function resultBook(tag, file) {
  const rows = []
  const line = (k, id, detail) => { const l = `${k.padEnd(4)}  [${tag}] ${id} — ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`; rows.push(l); console.log(l.slice(0, 1600)) }
  return {
    ck: (id, ok, expected, observed) => { line(ok ? 'PASS' : 'FAIL', id, `expected: ${expected} | observed: ${typeof observed === 'string' ? observed : JSON.stringify(observed)}`); return ok },
    note: (id, detail) => line('NOTE', id, detail),
    save: () => { if (file) { mkdirSync(file.replace(/[\\/][^\\/]+$/, ''), { recursive: true }); writeFileSync(file, rows.join('\n') + '\n') } return rows },
    rows,
  }
}
