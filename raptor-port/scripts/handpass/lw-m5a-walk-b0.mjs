const B = await import('./lw-m5a-walk-b-lib.mjs')
const { L, T, shot, press, openBalances, balRow } = B
console.log('[lw-m5a-walk-b0 v1 explore]')
const w = await L.newCtx('phone')
await L.signIn(w, 'admin')
await openBalances(w)
await shot(w, 'x-rest')
const info = await w.page.evaluate(() => {
  const s = document.querySelector('[data-testid="bal-scroll"]')
  const bp = document.querySelector('[data-testid="balances-page"]')
  const desc = e => { if (!e) return null; const r = e.getBoundingClientRect(); return `${e.tagName}.${(e.className || '').toString().slice(0, 50)} @${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}` }
  const kids = [...bp.querySelectorAll('*')].filter(e => e.children.length > 0 && e.getBoundingClientRect().width > 0).slice(0, 30).map(desc)
  return { scroll: desc(s), sw: s && s.scrollWidth, cw: s && s.clientWidth, sh: s && s.scrollHeight, ch: s && s.clientHeight, kids, vv: [innerWidth, innerHeight, visualViewport.scale], zoomStyle: s && getComputedStyle(s).zoom, scls: s && s.className }
})
console.log(JSON.stringify(info, null, 1))
console.log(JSON.stringify(await B.tabRow(w.page)))
console.log(JSON.stringify(await balRow(w.page, 'bane')))
console.log(w.errs)
await w.ctx.close(); await L.closeBrowser()
