s = open('a.mjs', newline='').read()
a = s.index("  const lc = await rect(L, '[data-testid=\"hol-list\"]')")
b = s.index("await step('10'")
new = r"""  const lc = await rect(L, '[data-testid="hol-list"]'), wA = await rect(L, '[data-testid="win-days"]'), pr = await rect(L, '[data-testid="days-parts"]')
  const lx = lc.l + lc.w / 2 + 70, ly = lc.t + lc.h / 2
  const roomY = Math.round((lc.b + wA.b) / 2), roomGap = wA.b - lc.b
  console.log('holidays view: window', JSON.stringify(wA), 'list', JSON.stringify(lc), 'parts', JSON.stringify(pr), 'room y', roomY, 'gap', roomGap)
  await swipeFrom(L, lx, ly, -140, 0)
  const a = await read(); const fa = await shot(L, 's09-left-on-list')
  const wB = await rect(L, '[data-testid="win-days"]')
  await swipeFrom(L, lx, wB.t + 150, 140, 0)   // back, inside the window whatever the list holds
  const b = await read(); const fb = await shot(L, 's09-right-on-list')
  /* start a slide ON a holiday's line */
  const line = await page.evaluate(() => { const b = document.querySelector('[data-testid="hol-list"] button'); const r = b.getBoundingClientRect(); return { t: b.innerText.replace(/\s+/g, ' ').slice(0, 30), x: r.left + r.width / 2, y: r.top + r.height / 2 } })
  await swipeFrom(L, line.x, line.y, -140, 0)
  const c = await read(); const fc = await shot(L, 's09-left-on-holiday-line')
  const wC = await rect(L, '[data-testid="win-days"]')
  await swipeOn(L, '[data-testid="hol-add"]', 140, 0, 0.5, 0.5)
  const d = await read(); const fd = await shot(L, 's09-right-on-plus-add')
  const formAfterAdd = await page.evaluate(() => !!document.querySelector('[data-testid="win-holiday"], [data-testid^="win-hol"], .hol-form, [data-testid="hol-form"]'))
  /* the room under the list */
  const wD = await rect(L, '[data-testid="win-days"]'), lD = await rect(L, '[data-testid="hol-list"]')
  const roomY2 = Math.round((lD.b + wD.b) / 2)
  const hitRoom = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.getAttribute('data-testid') || e.className || e.tagName) : null }, [lx, roomY2])
  await swipeFrom(L, lx, roomY2, -140, 0)
  const e = await read(); const fe = await shot(L, 's09-left-in-room-under-list')
  const wE = await rect(L, '[data-testid="win-days"]')
  await swipeFrom(L, lx, wE.t + 150, 140, 0)
  const f2 = await read()
  await press(L, '[data-testid="days-tab-month"]')
  const mB = await month()
  const ok = a.year === String(+y0 + 1) && b.year === y0 && !a.wins.includes('every') && c.year !== b.year && d.year === b.year && e.year !== f2.year && f2.year === d.year && mB === mA
  pass('9', SZ, ok, `year ${y0}; left on the list -> ${a.year}; right -> ${b.year}; left starting on the holiday line "${line.t}" -> ${c.year}; right starting on "+ Add" -> ${d.year}; left in the room under the list (list bottom ${lD.b}, window bottom ${wD.b}, gap ${wD.b - lD.b}px, finger y ${roomY2}, element there ${hitRoom}) -> ${e.year}; right -> ${f2.year}; windows open after each: ${[a, b, c, d, e, f2].map(x => x.wins || 'none').join(' | ')}; Month tab afterwards ${mB} (left on ${mA}); window boxes ${JSON.stringify(wA)} / ${JSON.stringify(wB)} / ${JSON.stringify(wC)} / ${JSON.stringify(wD)} / ${JSON.stringify(wE)}`, fc)
})
"""
s = s[:a] + new + s[b:]
open('a.mjs', 'w', newline='').write(s)
