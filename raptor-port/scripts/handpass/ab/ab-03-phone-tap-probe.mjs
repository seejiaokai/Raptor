/* Probe (26 Sep 26): at 390px, what stands on top of a war cell when the walk taps it? (H1's phone war steps timed
   out: "… intercepts pointer events".) Read only. */
process.env.AB_WHO = 'survey'
const L = await import('./ab-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { browser, page } = await openHi({ width: 390, height: 844, who: 'a', dpr: 2 })
await L.lwOpen(page, '2026-07-17')
const id = 'slipway', d = '2026-07-17'
const c = page.locator(`[data-testid="cell-${id}-${d}"]`).first()
await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
await page.waitForTimeout(400)
const r = await page.evaluate(([id, d]) => {
  const el = document.querySelector(`[data-testid="cell-${id}-${d}"]`)
  const b = el.getBoundingClientRect()
  const x = b.left + b.width / 2, y = b.top + b.height / 2
  const hit = document.elementFromPoint(x, y)
  const path = []; for (let e = hit; e && path.length < 6; e = e.parentElement) path.push(`${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}.${String(e.className).slice(0, 40)}[${e.getAttribute('data-testid') || ''}]`)
  return { rect: [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)], vw: innerWidth, vh: innerHeight, hitIsCell: hit === el || el.contains(hit), path }
}, [id, d])
console.log(JSON.stringify(r, null, 1))
await L.shot(page, 'probe-phone-cell')
try { await c.click({ timeout: 4000 }); console.log('click ok', JSON.stringify(await L.sheetNow(page)).slice(0, 300)) } catch (e) { console.log('click failed:', String(e.message).split('\n').slice(0, 12).join(' | ')) }
await browser.close()
