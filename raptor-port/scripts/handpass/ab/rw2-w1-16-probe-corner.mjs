/* RE-WALK W1 probe (26 Sep 26) — new evidence seen while looking at the member's pictures (first walk AND re-walk):
   a green "DRAG #0 · PD · MV · ARM · NAT · CAN · BLUR · PU · EFP · DROP" strip lies across the top of the Inputs
   calendar, over its month title and arrows. It is the drag DIAGNOSTIC readout (src/ui/dragdbg.ts), meant to be
   switched on only by ?dragdbg=1 or by five deliberate taps in the screen's top-left 64 px corner. The calendar's own
   "previous month" arrow sits in that corner: does paging back through the months with it (as a member does to reach
   March from September) switch the readout on? Fresh world each time; the app's own arrow; a person's pace (one press
   every 350 ms), desktop and phone; then: does it go away by itself, and what does it cover?
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/rw-w1-16-probe-corner.mjs */
process.env.AB_WHO = 'rewalk2/w1'
const L = await import('./w1-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
for (const [W, who] of [['desktop', 'a'], ['phone', 'a'], ['desktop', 'm']]) {
  const PH = W === 'phone'
  const { browser, page, errors } = await openHi({ width: PH ? 390 : 1440, height: PH ? 844 : 900, who, dpr: PH ? 3 : 1 })
  const cdp = PH ? await L.touchOn(page) : null
  await L.inputsView(page, 'cal')
  const prev = await page.locator('#icPrev').boundingBox()
  const month0 = await L.calMonth(page)
  const presses = []
  for (let i = 0; i < 6; i++) {
    const x = prev.x + prev.width / 2, y = prev.y + prev.height / 2
    if (PH) {
      /* a finger tap at a person's pace (the shared finger helper waits 700 ms after each lift, too slow for this) */
      const tp = [{ x: Math.round(x), y: Math.round(y), id: 7, radiusX: 4, radiusY: 4, force: 1 }]
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tp }); await page.waitForTimeout(40)
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    } else { await page.mouse.click(x, y) }
    await page.waitForTimeout(350)
    presses.push({ press: i + 1, month: await L.calMonth(page), readout: await page.locator('#dragdbg').count() })
  }
  const box = await page.evaluate(() => { const d = document.getElementById('dragdbg'); if (!d) return null; const b = d.getBoundingClientRect(); return { top: b.top, bottom: b.bottom, left: b.left, right: b.right, text: d.textContent } })
  const title = await page.evaluate(() => { const t = document.querySelector('#inpCal .ic-mon'); if (!t) return null; const b = t.getBoundingClientRect(); const h = document.elementFromPoint(b.left + 4, b.top + b.height / 2); return { top: b.top, bottom: b.bottom, topElementOverTitle: h ? (h.id || h.className) : 'none' } })
  await L.shot(page, `rw-w1-16-corner-${W}-${who}`)
  await page.waitForTimeout(3000)
  const stillAfter3s = await page.locator('#dragdbg').count()
  await L.calClose(page)
  const onListPage = await page.locator('#dragdbg:visible').count()
  await L.shot(page, `rw-w1-16-corner-${W}-${who}-list`)
  console.log(JSON.stringify({ W, who, prev: { x: Math.round(prev.x), y: Math.round(prev.y), w: Math.round(prev.width), h: Math.round(prev.height) }, month0, presses, readoutBox: box, title, stillAfter3s, onListPage, errors }))
  await browser.close()
}
