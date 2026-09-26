/* RE-WALK W1 probe (26 Sep 26) — W1-F2's worst case, which the first walk PREDICTED but could not see: a finger tap on
   a chip that lies under one of the edit window's BUTTONS (the window opens on the lift, and the tap's own click then
   lands on what has just appeared — the edit's Delete has no confirm). The fix eats that click. On the 390 x 844 phone
   no demo chip lies under a button, so the survey runs over several phone sizes (the window is centred, the grid
   stretches, so the two move against each other): every July chip is tapped by finger; each tap reports whether the
   chip's centre lay under a button of the window it opened, what the window then showed, and whether any input changed.
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/rw-w1-14-probe-under-button.mjs */
process.env.AB_WHO = 'rewalk/w1'
const L = await import('./w1-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const SIZES = [[390, 844], [375, 667], [360, 740], [414, 896], [390, 700], [412, 915]]
const { browser, page, errors } = await openHi({ width: 390, height: 844, who: 'a', dpr: 2 })
const cdp = await L.touchOn(page)
const snap = () => page.evaluate(() => JSON.stringify(window.INPUTS.map(x => x.iid + x.date + (x.endDate || '') + x.type + x.remarks)))
const summary = []
for (const [w, h] of SIZES) {
  await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(500)
  await L.calOpen(page, '2026-07')
  const chips = await page.evaluate(() => [...document.querySelectorAll('#inpCal .ic-inrow [data-iid]')].map(e => ({ iid: e.getAttribute('data-iid'), day: e.closest('[data-icday]').getAttribute('data-icday') })))
  const seen = new Set(); let under = 0, closed = 0, changed = 0, n = 0
  for (const ch of chips) {
    if (seen.has(ch.iid + ch.day)) continue; seen.add(ch.iid + ch.day)
    if ((await L.calMonth(page)) !== 'July 2026') await L.calOpen(page, '2026-07')
    const c = await L.chipAt(page, ch.iid, ch.day)
    if (!c) continue
    const s0 = await snap()
    await L.finger(page, cdp, c, null, { holdMs: 50 })
    await page.waitForTimeout(250)
    const d = await L.addDialog(page)
    const btn = await page.evaluate(({ x, y }) => [...document.querySelectorAll('#inpEditPop button')].filter(b => b.offsetWidth || b.offsetHeight)
      .map(b => ({ id: b.id || (b.innerText || '').trim(), r: b.getBoundingClientRect() }))
      .filter(o => x >= o.r.left && x <= o.r.right && y >= o.r.top && y <= o.r.bottom).map(o => o.id), c)
    const s1 = await snap()
    n++
    if (btn.length) {
      under++
      console.log(`${w}x${h} ${ch.day} ${ch.iid.slice(-4)} @${Math.round(c.x)},${Math.round(c.y)} UNDER ${btn.join('/')} → window ${d.open ? 'OPEN: ' + d.title : 'CLOSED'} · inputs ${s0 === s1 ? 'unchanged' : 'CHANGED'}`)
      await L.shot(page, `rw-w1-14-under-${btn[0]}-${w}x${h}-${ch.day}`)
    }
    if (!d.open) closed++
    if (s0 !== s1) changed++
    if (d.open) { await page.locator('#inpEditCancel').click().catch(() => {}); await page.waitForTimeout(200) }
    if (await page.locator('#inpCal .ic-pop').count()) { await page.locator('#icPopClose').click().catch(() => {}); await page.waitForTimeout(150) }
  }
  summary.push(`${w}x${h}: ${n} chips tapped · ${under} lay under a button of the window they opened · ${closed} windows closed at once · ${changed} taps changed an input`)
}
console.log(summary.join('\n'))
console.log('errors', JSON.stringify(errors))
await browser.close()
