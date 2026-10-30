// [WEEK-ARROWS-NO-BLOCK] — his follow-up to the arrows page (30 Oct 26): "what about C when i mouse over it slides to expand
// when im close to it". Option D drawn on the real app beside C: at rest C's slim 14-wide tab on the window's edge; when the
// pointer comes near (inside the full arrow's own footprint, 38 × 70, plus a 24px margin) the tab slides out to today's full
// arrow (38 wide, today's 26px ‹ ›, lit as on hover), and slides back when the pointer leaves. A key that reaches it opens it too.
// The same bounds as week-arrows-draw.mjs: D275 (the day flush left), D1122 (it never moves under repeated presses — the
// pointer stays inside the zone, so it stays open), D487 (a size change, his word). Usage: node … [port]
import { chromium } from 'playwright'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const here = path.dirname(fileURLToPath(import.meta.url))
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = path.resolve(here, '../../docs/img/handpass/2026-10-30-week-arrows')
mkdirSync(OUT, { recursive: true })
const PORT = process.argv[2] || '4173'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctx = await browser.newContext({ viewport: { width: 1536, height: 730 }, deviceScaleFactor: 1.25 })
const page = await ctx.newPage()
const errs = []
page.on('pageerror', e => errs.push(String(e).slice(0, 200)))
await page.goto(`http://localhost:${PORT}/?fresh=1`)
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.addStyleTag({ content: '#toastEl, .toast { visibility: hidden !important; }' })

/* option D: C's tab at rest, today's arrow when near — the spec for a build */
const D_CSS = `
.week-nav{width:14px!important;border-radius:0 8px 8px 0!important;font-size:15px!important;
  transition:width .16s ease-out,font-size .16s ease-out,opacity .15s,border-color .15s,color .15s!important}
.week-nav.prev{left:0!important;border-left:none!important}
.week-nav.next{right:0!important;border-radius:8px 0 0 8px!important;border-right:none!important}
.week-nav.near,.week-nav:focus-visible{width:38px!important;font-size:26px!important;opacity:1!important;border-color:var(--accent)!important;color:var(--accent)!important}
@media (prefers-reduced-motion:reduce){.week-nav{transition:none!important}}`
await page.evaluate(css => {
  const s = document.createElement('style'); s.id = 'wa-d'; s.textContent = css; document.head.appendChild(s)
  /* near = inside the full arrow's footprint (38 × 70 on its edge) plus 24px around it */
  document.addEventListener('pointermove', e => {
    for (const b of document.querySelectorAll('.week-nav')) {
      const r = b.getBoundingClientRect(), left = b.classList.contains('prev')
      const x0 = left ? 0 : innerWidth - 38 - 24, x1 = left ? 38 + 24 : innerWidth
      const near = e.clientX >= x0 && e.clientX <= x1 && e.clientY >= r.top - 24 && e.clientY <= r.bottom + 24
      b.classList.toggle('near', near)
    }
  })
}, D_CSS)

const LEFT = { x: 0, y: 150, width: 460, height: 560 }, RIGHT = { x: 1076, y: 150, width: 460, height: 560 }
const shot = (name, clip) => page.screenshot({ path: path.join(OUT, name + '.png'), clip })
const box = () => page.evaluate(() => [...document.querySelectorAll('.week-nav')].map(b => { const r = b.getBoundingClientRect(); return [b.id, Math.round(r.left), Math.round(r.width), b.classList.contains('near')] }))
const record = []
async function states(tag) {
  await page.mouse.move(700, 120); await page.waitForTimeout(350)
  record.push({ state: tag, rest: await box() })
  await shot(`${tag}-D-rest-left`, LEFT); await shot(`${tag}-D-rest-right`, RIGHT)
  const mid = await page.evaluate(() => { const r = document.getElementById('weekPrev').getBoundingClientRect(); return Math.round(r.top + r.height / 2) })
  await page.mouse.move(48, mid); await page.waitForTimeout(350)          // near, not yet on it
  record.push({ state: tag + ' pointer 48px from the left edge', near: await box() })
  await shot(`${tag}-D-near-left`, LEFT)
  await page.mouse.move(1536 - 48, mid); await page.waitForTimeout(350)
  record.push({ state: tag + ' pointer 48px from the right edge', near: await box() })
  await shot(`${tag}-D-near-right`, RIGHT)
  await page.mouse.move(48, mid - 140); await page.waitForTimeout(350)    // at the edge but well above the tab: stays slim
  record.push({ state: tag + ' pointer at the left edge, 140px above', away: await box() })
}

/* View-only after two › presses, then Edit Schedule after two › presses (the states the first drawing measured) */
await page.evaluate(() => window.go('viewsched')); await page.waitForTimeout(900)
await page.click('#weekNext'); await page.waitForTimeout(700); await page.click('#weekNext'); await page.waitForTimeout(900)
await states('v2')
/* pressed three times with the pointer held where it is: the tab must stay open and in place (D1122) */
const mid = await page.evaluate(() => { const r = document.getElementById('weekNext').getBoundingClientRect(); return Math.round(r.top + r.height / 2) })
await page.mouse.move(1536 - 19, mid); await page.waitForTimeout(300)
const presses = []
for (let i = 0; i < 3; i++) { await page.mouse.down(); await page.mouse.up(); await page.waitForTimeout(600); presses.push(await box()) }
record.push({ state: 'v2 › pressed three times, pointer held', presses })
await shot('v2-D-pressed-right', RIGHT)
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(1200)
await page.click('#weekNext'); await page.waitForTimeout(700); await page.click('#weekNext'); await page.waitForTimeout(900)
await states('e3')
writeFileSync(path.join(OUT, 'measures-d.json'), JSON.stringify({ record, errs }, null, 1))
console.log(JSON.stringify(record)); console.log('errors:', errs.length ? errs : 'none')
await browser.close()
