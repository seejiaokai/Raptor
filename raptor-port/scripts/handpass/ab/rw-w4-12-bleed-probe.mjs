/* RE-WALK W4 (26 Sep 26) — a probe of something seen in passing (not a re-walk item): in the member's G1e picture
   (rewalk/w4/w4-touch-G1e-member-two-rows) the "LL" of his 10–11 Mar bids shows ON TOP of the frozen name / balance
   column, where the first walk's picture of the same step shows nothing. Records only. Member (Ranger, bane), 390 px,
   by finger: drag-select 9–11 Mar on his own row, fill LL, open the war at 16 Mar, then ask the page what sits on top
   at the spots in the frozen column where those days' cells lie underneath — and photograph it; then the same after a
   reload, and after a small sideways scroll (does it stay painted over, or is it a moment's leftover?).
   Usage (from raptor-port/): node scripts/handpass/ab/rw-w4-12-bleed-probe.mjs */
process.env.AB_WHO = 'rewalk/w4'
const L = await import('./w4-lib.mjs')
const R = L.resultBook('W4-bleed', `${L.ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w4-bleed-probe.txt`)
const { browser, page, errors } = await L.openW4({ phone: true, who: 'm' })
const cdp = await page.context().newCDPSession(page)
const me = 'bane', D = ['2026-03-09', '2026-03-10', '2026-03-11']
const ctr = s => page.evaluate(q => { const e = document.querySelector(q); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 } }, s)
await L.lwOpen(page, D[0])
await page.locator(`[data-testid="cell-${me}-${D[0]}"]`).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
await page.waitForTimeout(400)
const a = await ctr(`[data-testid="cell-${me}-${D[0]}"]`), b = await ctr(`[data-testid="cell-${me}-${D[2]}"]`)
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: a.x, y: a.y, id: 3 }] })
await page.waitForTimeout(280)
for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: Math.round(a.x + (b.x - a.x) * i / 10), y: a.y, id: 3 }] }); await page.waitForTimeout(30) }
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
await page.waitForTimeout(700)
const s = await L.sheetNow(page)
await L.sheetPress(page, 'sel-LL')
await L.closeSheets(page)
/* what paints at the frozen column over each hidden day, on his row */
const look = tag => page.evaluate(([p, ds]) => {
  const vis = q => [...document.querySelectorAll(q)].map(e => e.getBoundingClientRect()).filter(r => r.width && r.left >= 0 && r.right <= innerWidth + 1)
  const frozenRight = Math.max(0, ...vis(`[data-testid="person-${p}"]`).map(r => r.right), ...vis(`[data-testid="bal-${p}"]`).map(r => r.right))
  return ds.map(d => {
    const c = document.querySelector(`[data-testid="cell-${p}-${d}"]`)
    if (!c) return { d, cell: 'NOT DRAWN' }
    const r = c.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2
    const h = document.elementFromPoint(x, y)
    const onTop = h ? `${h.tagName}.${String(h.className).slice(0, 40)}[${h.getAttribute('data-testid') || ''}]` : 'nothing'
    const cs = getComputedStyle(c), chip = c.querySelector('.c')
    return { d, cellX: Math.round(x), frozenRight: Math.round(frozenRight), underFrozen: x < frozenRight, onTop, cellIsOnTop: !!h && (h === c || c.contains(h)), cellZ: cs.zIndex, cellPos: cs.position, chipText: chip ? chip.innerText.trim() : (c.innerText || '').trim() }
  })
}, [me, D])
await L.lwOpen(page, '2026-03-16')
await page.locator(`[data-testid="cell-${me}-2026-03-16"]`).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
await page.waitForTimeout(600)
const r1 = await look('after-open-16')
await L.shot(page, 'w4-bleed-1-after-fill-open-16mar')
const frozenStyle = await page.evaluate(p => { const b = document.querySelector(`[data-testid="bal-${p}"]`), w = document.querySelector(`[data-testid="person-${p}"]`); const f = e => e ? (({ position, zIndex, backgroundColor }) => ({ position, zIndex, backgroundColor }))(getComputedStyle(e)) : null; return { bal: f(b), balTd: f(b && b.closest('td,th')), who: f(w), whoTd: f(w && w.closest('td,th')), rowCls: (w && w.closest('tr') || {}).className } }, me)
R.note('frozen-style', frozenStyle)
R.ck('bleed-after-fill', r1.filter(x => x.underFrozen).every(x => !x.cellIsOnTop), 'a day cell that has scrolled under the frozen name / balance column is covered by it — nothing of it paints on top', { sheet: s.open, r1 })
/* a small sideways scroll by finger, then look again */
const g = await ctr('.mx-wrap')
const yy = (await ctr(`[data-testid="cell-${me}-2026-03-16"]`)).y + 200
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 330, y: yy, id: 4 }] })
for (let i = 1; i <= 5; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 330 - 6 * i, y: yy, id: 4 }] }); await page.waitForTimeout(16) }
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
await page.waitForTimeout(900)
const r2 = await look('after-scroll')
await L.shot(page, 'w4-bleed-2-after-small-scroll')
R.ck('bleed-after-scroll', r2.filter(x => x.underFrozen).every(x => !x.cellIsOnTop), 'after a small sideways scroll, still nothing paints over the frozen column', { grid: g, r2 })
await page.reload(); await page.waitForTimeout(1500)
if (await page.locator('#luser').count()) await L.login(page, 'm')
await L.lwOpen(page, '2026-03-16')
await page.locator(`[data-testid="cell-${me}-2026-03-16"]`).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
await page.waitForTimeout(600)
const r3 = await look('after-reload')
await L.shot(page, 'w4-bleed-3-after-reload')
R.ck('bleed-after-reload', r3.filter(x => x.underFrozen).every(x => !x.cellIsOnTop), 'after a reload, nothing paints over the frozen column', r3)
/* G1e's own second step, as the touch script does it: a drag from his 16 Mar onto the NEXT man's 17 Mar, LL pressed —
   photographed at once and again 1 s later, reading what is on top where 10–11 Mar lie under the frozen column */
{
  await L.lwOpen(page, '2026-03-16')
  await page.locator(`[data-testid="cell-${me}-2026-03-16"]`).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(350)
  const order = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].map(e => e.getAttribute('data-testid').slice(4)))
  const other = order[order.indexOf(me) + 1]
  const p1 = await ctr(`[data-testid="cell-${me}-2026-03-16"]`), p2 = await ctr(`[data-testid="cell-${other}-2026-03-17"]`)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: p1.x, y: p1.y, id: 5 }] })
  await page.waitForTimeout(260)
  for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: Math.round(p1.x + (p2.x - p1.x) * i / 10), y: Math.round(p1.y + (p2.y - p1.y) * i / 10), id: 5 }] }); await page.waitForTimeout(30) }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForTimeout(700)
  await L.sheetPress(page, 'sel-LL')
  const t0 = await look('two-row-fill-at-once')
  await L.shot(page, 'w4-bleed-4-two-row-fill-at-once')
  await page.waitForTimeout(1000)
  const t1 = await look('two-row-fill-1s')
  await L.shot(page, 'w4-bleed-5-two-row-fill-1s-later')
  await L.closeSheets(page)
  const t2 = await look('two-row-after-close')
  await L.shot(page, 'w4-bleed-6-two-row-after-close')
  R.note('two-row-fill-reads', { other, t0, t1, t2 })
  const bled = r => r.filter(x => x.cellX < 212 && x.cellIsOnTop)
  R.ck('bleed-two-row-fill', !bled(t0).length && !bled(t1).length && !bled(t2).length, 'after the two-row drag and LL, a day under the frozen column never paints on top of it (at once, 1 s later, after closing)', { t0: bled(t0), t1: bled(t1), t2: bled(t2) })
}
R.note('errors', errors.slice(0, 5))
R.save()
await browser.close()
