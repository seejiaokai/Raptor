// lw-ho-star-look v1 — his question "how does a half day OIL (HO) look with the star the app credited? is there enough
// space?" (24 Oct 26). The app's own box markup (matrix.css .c .top / .whole, k-oil, s-a) written into three real empty
// cells of the phone grid: HO* in the morning half, HO* beside a half-day leave, FO* whole — then measured: does the text
// fit its box? Serve the build on 4301 first.
import * as L from './lw-m3-rewalk-lib.mjs'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
console.log('lw-ho-star-look v1')
const OUT = path.resolve('docs/img/handpass/2026-10-24-lw-colours')
mkdirSync(OUT, { recursive: true })
const w = await L.newCtx('phone'); const P = w.page
await L.signInPlain(w, 'admin')
await L.gotoMonth(w, 'NOV'); await P.waitForTimeout(600)
const res = await P.evaluate(() => {
  const ids = Object.keys(window.PEOPLE).slice(0, 6)
  const day = '2026-11-10'
  const cell = id => document.querySelector(`[data-testid="cell-${id}-${day}"]`)
  const put = (id, html) => { const c = cell(id); if (!c) return null; const td = c.closest('td') || c; td.classList.add('hasc'); td.insertAdjacentHTML('beforeend', html); return td }
  const a = put(ids[0], '<span class="c k-oil s-a top">HO*</span>')
  const b = put(ids[1], '<span class="c k-oil s-a top">HO*</span><span class="c k-ll s-a bot">LL</span>')
  const c = put(ids[2], '<span class="c k-oil s-a whole">FO*</span>')
  const d = put(ids[3], '<span class="c k-oil s-a top">HO</span>')
  const fit = [a, b, c, d].map(td => { const e = td && td.querySelector('.c'); return e ? { text: e.textContent, w: e.clientWidth, sw: e.scrollWidth, h: e.clientHeight, fits: e.scrollWidth <= e.clientWidth } : null })
  const r = a.getBoundingClientRect()
  return { fit, y: Math.max(0, Math.round(r.top) - 70) }
})
console.log(JSON.stringify(res.fit))
await P.screenshot({ path: path.join(OUT, 'ho-star.png'), scale: 'device', clip: { x: 0, y: res.y, width: 402, height: 260 } })
await L.closeBrowser()
