/* D262 — what sits at the top of the screen once the page is scrolled (the fixed bar, the floating date header). */
process.env.HP_SHOTS ||= new URL('../../../docs/img/handpass/2026-09-27-d260-d262/probe', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const L = await import('../ab/ab-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
for (const W of ['desktop', 'phone']) {
  const PHONE = W === 'phone'
  const { browser, page } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: 1 })
  await L.lwOpen(page, '2026-07-20')
  await page.mouse.wheel(0, 600); await page.waitForTimeout(500)
  const r = await page.evaluate(() => {
    const at = (x, y) => { const h = document.elementFromPoint(x, y); if (!h) return 'none'; const chain = []; for (let n = h; n && chain.length < 6; n = n.parentElement) chain.push(`${n.tagName}.${String(n.className).split(' ')[0]}${n.getAttribute('data-testid') ? '[' + n.getAttribute('data-testid') + ']' : ''}${getComputedStyle(n).position === 'fixed' ? '(FIXED)' : ''}`); return chain.join(' < ') }
    const x = Math.round(innerWidth * 0.6)
    const out = {}
    for (const y of [5, 30, 55, 70, 100, 130, 160, innerHeight - 5]) out[y] = at(x, y)
    const o = document.querySelector('.mx-outer').getBoundingClientRect()
    return { out, outerTop: Math.round(o.top), inner: innerHeight }
  })
  console.log(W, JSON.stringify(r, null, 1))
  await browser.close()
}
