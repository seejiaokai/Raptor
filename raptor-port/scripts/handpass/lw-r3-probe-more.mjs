// Round 3's check (24 Oct 26): why the ⋯ menu's Post out could not be pressed on a desktop (GitHub's run of 569) —
// the window on a June day, the ⋯ opened, each menu item's box against the window's and what a point at its centre meets.
import * as L from './lw-r3-lib.mjs'
for (const size of ['desk', 'phone']) {
  const w = await L.newCtx(size)
  const P = w.page
  await L.signInPlain(w, 'admin')
  await L.openCellR(w, 'slipway', '2026-06-15')
  await L.press(w, L.T('bid-more'))
  await P.waitForTimeout(300)
  const g = await P.evaluate(() => {
    const box = e => { const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), b: Math.round(r.bottom), r: Math.round(r.right) } }
    const sheet = document.querySelector('[data-testid="bid-picker"]')
    const anc = []; for (let e = document.querySelector('[data-testid="bid-more-menu"]'); e && e !== document.body; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.overflow !== 'visible' || cs.overflowY !== 'visible' || cs.zIndex !== 'auto' || cs.position !== 'static' || cs.transform !== 'none') anc.push(`${e.dataset.testid || e.className}: pos ${cs.position} z ${cs.zIndex} ov ${cs.overflow}/${cs.overflowY} tf ${cs.transform.slice(0, 20)}`) }
    const items = [...document.querySelectorAll('[data-testid="bid-more-menu"] [role=menuitem]')].map(e => {
      const b = box(e); const hit = document.elementFromPoint(b.x + b.w / 2, b.y + b.h / 2)
      return { id: e.dataset.testid, box: b, hit: hit ? (hit.dataset.testid || hit.className) : null, hitsSelf: hit === e || e.contains(hit) }
    })
    return { vp: [innerWidth, innerHeight], sheet: sheet && box(sheet), scroller: sheet && [sheet.scrollTop, sheet.scrollHeight, sheet.clientHeight], menu: box(document.querySelector('[data-testid="bid-more-menu"]')), more: box(document.querySelector('[data-testid="bid-more"]')), items, anc }
  })
  console.log(size, JSON.stringify(g, null, 1))
  await L.shot(w, `probe-more-${size}`)
  await w.ctx.close()
}
await L.closeBrowser()
