// M5a build spec, Q2 (28 Oct 26): today's drag down the LVE figures beside the names, which raises the
// "N people · +LVE · days · Save" bar. Drawn on today's main (230aa3b) so he sees the control the question is about.
//   cd raptor-port ; npm run build ; npx vite preview --port 4197 --strictPort
//   LWMOCK_OUT=<scratch> node docs/mock/lw-overhaul/full-m5a-q-grant.mjs
import { chromium, newPage, signIn, mark, shot, errs } from './full-lib.mjs'
const browser = await chromium.launch()
const { p } = await newPage(browser, 1536, 864, false)
await signIn(p, 'admin')
const ids = await p.evaluate(() => [...document.querySelectorAll('[data-testid^="bal-"]')]
  .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top > 200 })
  .slice(0, 3).map(e => e.getAttribute('data-testid')))
console.log('cells', JSON.stringify(ids))
const A = await p.locator(`[data-testid="${ids[0]}"]`).boundingBox()
const C = await p.locator(`[data-testid="${ids[2]}"]`).boundingBox()
await p.mouse.move(A.x + A.width / 2, A.y + A.height / 2); await p.mouse.down()
await p.mouse.move(C.x + C.width / 2, C.y + C.height / 2, { steps: 10 }); await p.mouse.up()
await p.waitForTimeout(700)
const bar = await p.locator('[data-testid="balance-bar"]').count()
console.log('bar shown', bar)
await mark(p, '[data-testid="balance-bar"]', 'Q2: this bar — keep it or let it go?')
await mark(p, `[data-testid="${ids[0]}"]`, 'drag down the LVE figures', { right: true })
await shot(p, 'm5a-q2-grant-desk')
console.log('page errors', errs.length)
await browser.close()
