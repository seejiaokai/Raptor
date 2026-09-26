/* W4 — FINDING W4-1 (26 Sep 26), written as the assertion of the RIGHT behaviour so re-running it is the re-walk:
   on the phone, a finger HELD on one day and lifted must leave the selection sheet open for that day (the desktop's
   one-day mouse drag does). Records, in order: the sheet mounting and unmounting, and every pointer / click event with
   its target — the finger's own trailing tap arrives ~20 ms after the lift, after select.ts's 0 ms click-swallow sweep
   has gone, and closes the sheet it had just opened. The two-day drag (no trailing tap) is the control.
   Usage: node scripts/handpass/ab/w4-08-hold-why.mjs */
process.env.AB_WHO = 'w4'
const L = await import('./w4-lib.mjs')
const R = L.resultBook('W4-1', `${L.ROOT}/docs/handpass/parts/2026-09-26-absence-w4-hold.txt`)
const { browser, page, errors } = await L.openW4({ phone: true, who: 'a' })
const cdp = await page.context().newCDPSession(page)
const id = 'glass', d = '2026-08-13', e = '2026-08-14'
await L.lwOpen(page, d)
const sel = `[data-testid="cell-${id}-${d}"]`
await page.locator(sel).first().evaluate(x => x.scrollIntoView({ block: 'center', inline: 'center' }))
await page.waitForTimeout(400)
const run = async (label, moveTo) => {
  await page.evaluate(() => {
    window.__log = []; const t0 = performance.now()
    const lg = s => window.__log.push(`${Math.round(performance.now() - t0)}ms ${s}`)
    for (const t of ['pointerdown', 'pointerup', 'pointercancel', 'click', 'contextmenu']) document.addEventListener(t, ev => lg(`${t}:${ev.pointerType || ''} on ${ev.target.getAttribute && (ev.target.getAttribute('data-testid') || ev.target.className || ev.target.tagName)}${ev.defaultPrevented ? ' (prevented)' : ''}`), true)
    new MutationObserver(() => { const s = document.querySelector('[data-testid="select-sheet"]'); const on = !!s; if (on !== window.__on) { window.__on = on; lg(on ? 'SELECT SHEET MOUNTED' : 'SELECT SHEET GONE') } }).observe(document.body, { childList: true, subtree: true })
    window.__on = false
  })
  const c = await page.evaluate(s => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 } }, sel)
  const to = moveTo ? await page.evaluate(s => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 } }, moveTo) : c
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 6 }] })
  await page.waitForTimeout(300)
  for (let i = 1; i <= 6; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: c.x + (to.x - c.x) * i / 6, y: c.y + (to.y - c.y) * i / 6, id: 6 }] }); await page.waitForTimeout(30) }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForTimeout(900)
  const log = await page.evaluate(() => window.__log)
  const open = await L.sheetNow(page)
  await L.shot(page, `w4-holdwhy-${label}`)
  await L.closeSheets(page)
  return { open: open.open, log }
}
const one = await run('one-day-hold', null)
R.ck('W4-1-one-day-hold-keeps-sheet', one.open === 'select-sheet', 'a finger held on ONE day and lifted leaves the selection sheet open for that day', one)
const two = await run('two-day-drag', `[data-testid="cell-${id}-${e}"]`)
R.ck('W4-1-control-two-day-drag', two.open === 'select-sheet', 'control: a finger drag over two days leaves the sheet open', two)
R.note('errors', errors.slice(0, 5))
R.save()
await browser.close()
