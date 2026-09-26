/* D262 — a first look at the Leave War's layout before the Move is built: where the grid box sits, what scrolls it,
   where the month buttons and the move banner are, at desktop and phone width. Usage: node mv-00-layout.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.HP_SHOTS ||= new URL('../../../docs/img/handpass/2026-09-27-d260-d262/probe', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const L = await import('../ab/ab-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const PHONE = W === 'phone'
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: 1 })
await L.lwOpen(page, '2026-07-20')
const m = await page.evaluate(() => {
  const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { l: Math.round(b.left), t: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) } }
  const wrap = document.querySelector('.mx-wrap')
  const cs = e => { const s = getComputedStyle(e); return { ox: s.overflowX, oy: s.overflowY, pos: s.position } }
  const chain = []; for (let n = wrap; n && n !== document.body; n = n.parentElement) { const s = getComputedStyle(n); if (s.overflowY !== 'visible' || s.overflowX !== 'visible') chain.push(`${n.tagName}.${String(n.className).slice(0, 30)} ox=${s.overflowX} oy=${s.overflowY} sh=${n.scrollHeight} ch=${n.clientHeight}`) }
  return { inner: [innerWidth, innerHeight], docScroll: [document.scrollingElement.scrollTop, document.scrollingElement.scrollHeight], wrap: r('.mx-wrap'), wrapStyle: cs(wrap), wrapScroll: [wrap.scrollLeft, wrap.scrollWidth, wrap.clientWidth], outer: r('.mx-outer'), strip: r('[data-testid="month-strip"]'), head: r('.mxhead'), stage: r('[data-testid="stage-now"]'), chain,
    headPos: getComputedStyle(document.querySelector('.mxhead tr td, .mxhead tr th') || document.body).position }
})
console.log(JSON.stringify(m, null, 1))
await page.screenshot({ path: `${process.env.HP_SHOTS}/mv-00-${W}-layout.png` })
await page.mouse.wheel(0, 600); await page.waitForTimeout(500)
const m2 = await page.evaluate(() => ({ docScroll: document.scrollingElement.scrollTop, head: (() => { const b = document.querySelector('.mxhead').getBoundingClientRect(); return [Math.round(b.top), Math.round(b.height)] })(), strip: (() => { const b = document.querySelector('[data-testid="month-strip"]').getBoundingClientRect(); return [Math.round(b.top)] })() }))
console.log('after scroll', JSON.stringify(m2))
await page.screenshot({ path: `${process.env.HP_SHOTS}/mv-00-${W}-scrolled.png` })
console.log('errors', errors)
await browser.close()
