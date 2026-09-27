/* W4 — FINDING W4-1 (26 Sep 26), written as the assertion of the RIGHT behaviour so re-running it is the re-walk:
   on the phone, a finger HELD on one day and lifted must leave the selection sheet open for that day (the desktop's
   one-day mouse drag does). Records, in order: the sheet mounting and unmounting, and every pointer / click event with
   its target — the finger's own trailing tap arrives ~20 ms after the lift, after select.ts's 0 ms click-swallow sweep
   has gone, and closes the sheet it had just opened. The two-day drag (no trailing tap) is the control.
   Usage: node scripts/handpass/ab/w4-08-hold-why.mjs
   RE-WALK COPY (26 Sep 26, re-walker W4): pictures to rewalk2/w4, results to the rewalk-w4-hold-why file. Beyond the
   first walk's two runs, the brief's three halves of W4-1 (register §12): the one-day hold KEEPS the sheet (and the
   sheet works — it fills the day); a PLAIN tap still opens the one-cell sheet; a drag-select still works. Plus the
   member's own row, and a probe of the 400 ms the fix waits (a deliberately fast tap on the sheet after a two-day
   drag — recorded, not judged). */
process.env.AB_WHO = 'rewalk2/w4'
const L = await import('./w4-lib.mjs')
const R = L.resultBook('W4-1', `${L.ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk2-w4-hold-why.txt`)
let { browser, page, errors } = await L.openW4({ phone: true, who: 'a' })
let cdp = await page.context().newCDPSession(page)
const id = 'glass', d = '2026-08-13', e = '2026-08-14', e2 = '2026-08-19', e3 = '2026-08-20', e4 = '2026-08-17'
await L.lwOpen(page, d)
const sel = `[data-testid="cell-${id}-${d}"]`
await page.locator(sel).first().evaluate(x => x.scrollIntoView({ block: 'center', inline: 'center' }))
await page.waitForTimeout(400)
const logInstall = () => page.evaluate(() => {
  window.__log = []; const t0 = performance.now(); window.__t0 = t0
  const lg = s => window.__log.push(`${Math.round(performance.now() - t0)}ms ${s}`)
  if (!window.__wired) {
    window.__wired = true
    for (const t of ['pointerdown', 'pointerup', 'pointercancel', 'click', 'contextmenu']) document.addEventListener(t, ev => window.__lg && window.__lg(`${t}:${ev.pointerType || ''} on ${ev.target.getAttribute && (ev.target.getAttribute('data-testid') || ev.target.className || ev.target.tagName)}${ev.defaultPrevented ? ' (prevented)' : ''}`), true)
    new MutationObserver(() => { const s = document.querySelector('[data-testid="select-sheet"]'); const on = !!s; if (on !== window.__on) { window.__on = on; window.__lg && window.__lg(on ? 'SELECT SHEET MOUNTED' : 'SELECT SHEET GONE') } }).observe(document.body, { childList: true, subtree: true })
  }
  window.__lg = lg
  window.__on = !!document.querySelector('[data-testid="select-sheet"]')
})
const ctr = s => page.evaluate(q => { const b = document.querySelector(q).getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 } }, s)
const cell = (p, iso) => `[data-testid="cell-${p}-${iso}"]`
/** A finger down on `from`, held 300 ms, slid to `to` (the same day = a hold in place) in six moves, lifted. */
const gesture = async (from, to, { settle = 900 } = {}) => {
  await logInstall()
  const c = await ctr(from)
  const t = to ? await ctr(to) : c
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 6 }] })
  await page.waitForTimeout(300)
  for (let i = 1; i <= 6; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: c.x + (t.x - c.x) * i / 6, y: c.y + (t.y - c.y) * i / 6, id: 6 }] }); await page.waitForTimeout(30) }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  if (settle) await page.waitForTimeout(settle)
}
const run = async (label, from, to) => {
  await page.locator(from).first().evaluate(x => x.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(400)
  await gesture(from, to)
  const log = await page.evaluate(() => window.__log)
  const open = await L.sheetNow(page)
  await L.shot(page, `w4-holdwhy-${label}`)
  return { open: open.open, head: (open.text || '').slice(0, 80), buttons: (open.buttons || []).slice(0, 12), log }
}

/* 1 — THE FINDING: a finger held on ONE empty day and lifted keeps the selection sheet, and it is still there 1.5 s on */
const r0 = await L.readAll(page, id, d, { bd: ['lve'] })
await L.lwOpen(page, d)
const one = await run('one-day-hold', sel, null)
await page.waitForTimeout(1500)
const still = await L.sheetNow(page)
await L.shot(page, 'w4-holdwhy-one-day-hold-1500ms-later')
R.ck('W4-1-one-day-hold-keeps-sheet', one.open === 'select-sheet' && still.open === 'select-sheet' && /1 day/.test(one.head) && !one.log.some(l => /SELECT SHEET GONE/.test(l)), 'a finger held on ONE day and lifted leaves the selection sheet open for that day ("… · 1 day"), and it is still open 1.5 s later; the finger\'s own trailing tap is eaten, not delivered to the day', { ...one, stillOpen: still.open })
/* the sheet the hold opened WORKS: its LL fills that one day (by finger) */
const fill = await L.fingerTap(page, '[data-testid="sel-LL"]')
await page.waitForTimeout(400)
const afterFill = await L.sheetNow(page)
await L.closeSheets(page)
const c1 = await L.cellOf(page, id, d)
const r1 = await L.readAll(page, id, d, { bd: ['lve'] })
await L.lwShot(page, 'w4-holdwhy-one-day-filled', id, d)
R.ck('W4-1-one-day-sheet-fills', fill.ok && /LL/.test(c1.box) && L.top(r1.sheet.lve) === L.top(r0.sheet.lve) - 1 && r1.agree, 'the one-day sheet\'s LL (a finger tap) fills that ONE day with an LL bid: LVE −1, every reader agreeing', { fill, afterFill: afterFill.open, cell: c1, lve: [r0.sheet.lve, r1.sheet.lve], disagree: r1.disagree })

/* 2 — CONTROL: a drag over two days still selects both */
await L.lwOpen(page, e2)
const two = await run('two-day-drag', cell(id, e2), cell(id, e3))
R.ck('W4-1-control-two-day-drag', two.open === 'select-sheet' && /2 days/.test(two.head), 'a finger drag over two days still opens the selection sheet for the two', two)
await L.closeSheets(page)

/* 3 — a PLAIN tap (no hold) on an empty day still opens the one-cell bid sheet, not the selection sheet */
await L.lwOpen(page, e4)
await page.locator(cell(id, e4)).first().evaluate(x => x.scrollIntoView({ block: 'center', inline: 'center' }))
await page.waitForTimeout(400)
await logInstall()
const p = await ctr(cell(id, e4))
await page.touchscreen.tap(p.x, p.y)
await page.waitForTimeout(700)
const tap = await L.sheetNow(page)
const tapLog = await page.evaluate(() => window.__log)
await L.shot(page, 'w4-holdwhy-plain-tap')
R.ck('W4-1-plain-tap-opens-one-cell-sheet', tap.open === 'bid-picker' && !tapLog.some(l => /SELECT SHEET/.test(l)), 'a plain finger tap on an empty day opens the one-cell bid sheet (Place a bid) — no selection sheet', { open: tap.open, head: (tap.text || '').slice(0, 80), log: tapLog })
await L.closeSheets(page)

/* 4 — a plain tap on the day the hold just filled opens its own sheet (one bid): the hold left nothing armed behind */
await L.lwOpen(page, d)
const t2 = await L.tapDay(page, true, id, d)
await L.shot(page, 'w4-holdwhy-tap-filled-day')
R.ck('W4-1-tap-after-hold', t2.open === 'bid-picker' && /NOW\s+LL/.test(t2.text || ''), 'a plain tap on the day the hold filled opens that day\'s bid sheet, now showing its LL — nothing left armed by the hold', { open: t2.open, head: (t2.text || '').slice(0, 100) })
await L.closeSheets(page)

/* 5 — PROBE (recorded, not judged): the 400 ms the fix waits for a finger's trailing tap. After a TWO-day drag (which
   leaves no trailing tap) a very fast tap on the sheet's ✕ inside that window — is it eaten? And after it? */
const fast = []
for (const after of [150, 600]) {
  await L.lwOpen(page, e2)
  await page.locator(cell(id, e2)).first().evaluate(x => x.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(400)
  await gesture(cell(id, e2), cell(id, e3), { settle: 0 })
  const tAt = Date.now()
  await page.waitForTimeout(Math.max(0, after - 60))
  const x = await page.evaluate(() => { const b = document.querySelector('[data-testid="select-sheet"] button.x'); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
  if (x) await page.touchscreen.tap(x.x, x.y)
  const firedAt = Date.now() - tAt
  await page.waitForTimeout(600)
  const s = await L.sheetNow(page)
  fast.push({ tapAfterLiftMs: firedAt, xFound: !!x, sheetAfterTap: s.open, eaten: s.open === 'select-sheet', log: await page.evaluate(() => window.__log) })
  await L.shot(page, `w4-holdwhy-fast-close-${after}ms`)
  await L.closeSheets(page)
}
R.note('W4-1-probe-fast-tap-after-drag', fast)
R.note('errors', errors.slice(0, 5))
await browser.close()

/* 6 — the MEMBER's own row (Ranger, bane), inside the bidding window: the one-day hold keeps the sheet for him too */
{
  const o = await L.openW4({ phone: true, who: 'm' })
  page = o.page
  cdp = await page.context().newCDPSession(page)
  const me = 'bane', md = '2026-03-12'
  await L.lwOpen(page, md)
  const m0 = await L.readAll(page, me, md, { bd: ['lve'] })
  await L.lwOpen(page, md)
  const mh = await run('member-one-day-hold', cell(me, md), null)
  const mf = await L.fingerTap(page, '[data-testid="sel-LL"]')
  await page.waitForTimeout(400)
  await L.closeSheets(page)
  const mc = await L.cellOf(page, me, md)
  const m1 = await L.readAll(page, me, md, { bd: ['lve'] })
  await L.lwShot(page, 'w4-holdwhy-member-filled', me, md)
  R.ck('W4-1-member-one-day-hold', mh.open === 'select-sheet' && /1 day/.test(mh.head) && mf.ok && /LL/.test(mc.box) && L.top(m1.sheet.lve) === L.top(m0.sheet.lve) - 1 && m1.agree, 'the member, on his own row: a finger held on one day keeps the selection sheet, and its LL fills that day (LVE −1)', { hold: mh, fill: mf, cell: mc, lve: [m0.sheet.lve, m1.sheet.lve], disagree: m1.disagree })
  R.note('member-errors', o.errors.slice(0, 5))
  await o.browser.close()
}
R.save()
