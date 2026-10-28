// M5a drawing fixes (D1493) — a probe of the built app before and after: where the person window stands, the leave line's
// look, the Balances name's alignment and a member's locked row's figures. Prints numbers only; no pictures.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/drawing-fixes/probe'
process.env.LW_TODAY ||= '2026-01-25'
process.env.PORT ||= '4181'
const L = await import('./lw-m4-lib.mjs')
const { T, press } = L
const w = await L.newCtx('desk'); const P = w.page
await L.signIn(w, 'admin')
await press(w, '[data-testid="row-bane"] .whoedit'); await P.waitForTimeout(700)
console.log('A desk', JSON.stringify(await P.evaluate(() => {
  const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)] }
  return { win: r('[data-testid="person-window"]'), bar: r('.topbar'), card: r('#page-leavewar .mx-outer')?.slice(0), vh: innerHeight }
})))
console.log('B line', JSON.stringify(await P.evaluate(() => {
  const l = document.querySelector('[data-testid^="pw-line-"]'); const cs = getComputedStyle(l)
  return { cls: l.className, radius: cs.borderTopLeftRadius, bl: cs.borderLeftWidth + ' ' + cs.borderLeftColor, margin: cs.margin, h: l.getBoundingClientRect().height }
})))
await P.keyboard.press('Escape'); await P.waitForTimeout(300)
await press(w, T('lw-tab-balances')); await P.waitForTimeout(600)
console.log('D name', JSON.stringify(await P.evaluate(() => {
  const nm = document.querySelector('[data-testid="bal-name-bane"] .nm'); const pk = nm.closest('.puck')
  const rg = document.createRange(); rg.selectNodeContents(nm); const t = rg.getBoundingClientRect(), p = pk.getBoundingClientRect()
  return { ta: getComputedStyle(nm).textAlign, textLeft: t.left - p.left, textRight: p.right - t.right }
})))
const lock = P.locator(T('bal-lock'))
if ((await lock.getAttribute('aria-checked')) !== 'true') { await lock.click(); await P.waitForTimeout(300) }
const m = w; const Q = P
await Q.setViewportSize({ width: 402, height: 874 })
await L.switchTo(m, 'member')
await press(m, T('lw-tab-balances')); await Q.waitForTimeout(800)
console.log('E row', JSON.stringify(await Q.evaluate(() => {
  const row = document.querySelector('[data-testid="bal-row-bane"]')
  const out = {}
  for (const [k, s] of [['app', '.bp-ro'], ['pend', '[data-testid="bal-pend-bane"]'], ['war', '[data-testid="bal-war-bane"]']]) {
    const e = row.querySelector(s); const rg = document.createRange(); rg.selectNodeContents(e)
    const rects = [...rg.getClientRects()].map(r => [Math.round(r.top * 10) / 10, Math.round(r.bottom * 10) / 10])
    const b = e.getBoundingClientRect(); const cs = getComputedStyle(e)
    out[k] = { text: e.textContent, box: [Math.round(b.top * 10) / 10, Math.round(b.bottom * 10) / 10], rects, lh: cs.lineHeight, font: cs.font, disp: cs.display, va: cs.verticalAlign }
  }
  return out
})))
await L.closeBrowser()
