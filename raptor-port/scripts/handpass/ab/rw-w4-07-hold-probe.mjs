/* W4 probe (26 Sep 26): can a FINGER select ONE day on the war? A long-press held still and lifted, and holds with a
   2 / 8 / 14 px wobble inside the day — which of them opens the selection sheet? (On a day that already carries a mark a
   tap opens the LIST, which has no "place a bid" door — the drag-select is then the only way to add one.)
   Usage: node scripts/handpass/ab/w4-07-hold-probe.mjs
   RE-WALK COPY (26 Sep 26, re-walker W4): pictures to rewalk/w4; each hold is now a check — the selection sheet must be
   open after the lift (register §12, W4-1), naming the day — written to the rewalk-w4-hold-probe file. */
process.env.AB_WHO = 'rewalk/w4'
const L = await import('./w4-lib.mjs')
const R = L.resultBook('W4-hold-probe', `${L.ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w4-hold-probe.txt`)
const { browser, page, errors } = await L.openW4({ phone: true, who: 'a' })
const cdp = await page.context().newCDPSession(page)
const id = 'glass', d = '2026-08-13'
await L.lwOpen(page, d)
const out = []
for (const [hold, dx] of [[300, 0], [600, 0], [300, 2], [300, 8], [300, 14], [900, 0]]) {
  await L.lwOpen(page, d)
  const sel = `[data-testid="cell-${id}-${d}"]`
  await page.locator(sel).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(400)
  const c = await page.evaluate(s => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, w: b.width } }, sel)
  const ev = await page.evaluate(() => { window.__ev = []; for (const t of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'contextmenu', 'click']) document.addEventListener(t, e => window.__ev.push(t + (e.pointerType ? ':' + e.pointerType : '')), true); return true })
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 4 }] })
  await page.waitForTimeout(hold)
  const mid = await page.evaluate(() => ({ selecting: !!document.querySelector('.mx-wrap[data-selecting]'), lit: document.querySelectorAll('.selcell').length }))
  if (dx) { for (let i = 1; i <= 3; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: c.x + dx * i / 3, y: c.y, id: 4 }] }); await page.waitForTimeout(30) } }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForTimeout(700)
  const s = await L.sheetNow(page)
  const evs = await page.evaluate(() => [...new Set(window.__ev)].join(','))
  out.push({ hold, dx, cellW: Math.round(c.w), armedWhileHeld: mid, opened: s.open, head: (s.text || '').slice(0, 50), events: evs })
  await L.shot(page, `w4-hold-${hold}-${dx}`)
  const r = out[out.length - 1]
  R.ck(`hold-${hold}ms-wobble-${dx}px`, s.open === 'select-sheet' && /Mosquito|Glass|13 Aug|2026-08-13/i.test(s.text || '') , `a finger held ${hold} ms${dx ? ` (wobbling ${dx} px)` : ' still'} on one day and lifted: the selection sheet stays open for that day`, r)
  await L.closeSheets(page)
}
R.note('errors', errors.slice(0, 5))
R.save()
await browser.close()
