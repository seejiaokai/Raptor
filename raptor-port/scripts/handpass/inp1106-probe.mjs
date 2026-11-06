// [INP-CARD-COLUMNS] (his D1305, D1310) — the night of 6 Nov 26, job 2: a measuring probe, not a walk. Serves a built
// folder inside the test browser and prints, for the Inputs list's cards on a phone (all dates), each card's iid, words,
// height and the right edge of each corner mark — so the columns can be seen equal card to card, and the drawing's
// world (its cards, its ids) compared with this branch's. Usage, from raptor-port/:
//   node scripts/handpass/inp1106-probe.mjs <dist> [chromium|webkit] [width] [wide|-] [old]
// `old` lays main's corner back over the build (one flex row, 8px apart) — the cards' heights before the columns.
import { chromium, webkit, LAUNCH, serveDist } from '../drawcheck/lib.mjs'
console.log('[inp1106-probe v3]')
const [dist = 'dist', engine = 'chromium', width = '402', wide = '', old = ''] = process.argv.slice(2)
const ORIGIN = 'http://localhost:4387'
const br = engine === 'webkit' ? await webkit.launch() : await chromium.launch(LAUNCH)
const ctx = await br.newContext({ viewport: { width: +width, height: 874 }, deviceScaleFactor: 3, hasTouch: true, isMobile: engine !== 'webkit' })
await serveDist(ctx, ORIGIN, dist)
const page = await ctx.newPage()
const errs = []; page.on('pageerror', e => errs.push(e.message))
await page.goto(ORIGIN + '/?fresh=1')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); await page.waitForTimeout(800)
await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(700)
await page.click('#inListBtn'); await page.waitForTimeout(400)
await page.click('#inRangeBtn'); await page.waitForTimeout(300); await page.click('#inRangeAll'); await page.waitForTimeout(700)
if (wide && wide !== '-') await page.addStyleTag({ content: '#inList .icard { font-size: 114% } #inList .icard-hrs, #inList .icard-nodoc, #inList .sd-late, #inList .icard-who, #inList .icard-kind { font-size: 1.14em !important }' })
if (process.env.PROBE_CSS) await page.addStyleTag({ content: process.env.PROBE_CSS })   // a trial of other tracks
if (old) await page.addStyleTag({ content: '.icard-corner{display:inline-flex !important;gap:8px}' })
await page.waitForTimeout(200)
const rows = await page.evaluate(() => [...document.querySelectorAll('#inList .icard')].map(c => {
  const r = c.getBoundingClientRect()
  const rt = s => { const e = c.querySelector('.icard-corner ' + s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left - r.left), Math.round(b.right - r.left)] }
  const who = c.querySelector('.icard-who'), corner = c.querySelector('.icard-corner')
  const wb = [...who.getClientRects()].pop(), cb = corner.getBoundingClientRect()
  return { id: c.dataset.testid, h: Math.round(r.height), w: Math.round(r.width), who: who.textContent, kind: c.querySelector('.icard-kind')?.textContent,
    late: rt('.sd-late'), oil: rt('.oiltag'), doc: rt('.icard-nodoc') || rt('.icard-doc'), hrs: rt('.icard-hrs'), hrsText: c.querySelector('.icard-hrs')?.textContent,
    corner: [Math.round(cb.left - r.left), Math.round(cb.width)], namesEnd: Math.round(wb.right - r.left) }
}))
for (const r of rows) console.log(JSON.stringify(r))
console.log('cards', rows.length, 'page errors', errs.length, errs.slice(0, 3).join(' | '))
await br.close()
