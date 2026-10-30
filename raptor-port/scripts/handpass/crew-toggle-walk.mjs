// His find (30 Oct 26, four pictures): on Edit Schedule, hiding the crew panel brought up the browser's own grey sideways
// scroll bar at the foot of the page (View-only has none), and the week's foot bar kept its old width as the panel went and
// came back. The walk of the fix on the BUILT app, with a real mouse on the CREW tab: at his PC's sizes (1600 × 780 and
// 1536 × 730, at 1.25), the panel open → hidden → shown → hidden again, each time: no page wider than the window, the foot bar
// spanning the week, a picture of the foot. Then the open panel still pinned while the page scrolls (the clip must not undo
// its sticky), the panel hidden while scrolled down, and View-only untouched.
// Usage: node scripts/handpass/crew-toggle-walk.mjs [port]   (pictures → docs/img/handpass/2026-10-30-crew-toggle)
import { chromium } from 'playwright'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const here = path.dirname(fileURLToPath(import.meta.url))
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = path.resolve(here, '../../docs/img/handpass/2026-10-30-crew-toggle', process.env.WALK_OUT || '')
mkdirSync(OUT, { recursive: true })
const PORT = process.argv[2] || '4173'
const rows = []
const rec = (name, ok, said, pics = []) => { rows.push({ name, result: ok ? 'PASS' : 'FAIL', said, pics }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  ${said}`) }
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})

for (const [W, H] of [[1600, 780], [1536, 730]]) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1.25 })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(String(e).slice(0, 200)))
  await page.goto(`http://localhost:${PORT}/?fresh=1`)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.addStyleTag({ content: '#toastEl, .toast { visibility: hidden !important; }' })
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(1200)
  const m = () => page.evaluate(() => {
    const d = document.documentElement, w = document.getElementById('eWeek').getBoundingClientRect(), b = document.getElementById('hscroll').getBoundingClientRect()
    return { over: d.scrollWidth - d.clientWidth, weekL: Math.round(w.left), weekW: Math.round(w.width), barL: Math.round(b.left), barW: Math.round(b.width) }
  })
  const foot = name => page.screenshot({ path: path.join(OUT, `${W}-${name}.png`), clip: { x: 0, y: H - 110, width: W, height: 110 } })
  const step = async (label, name) => {
    await page.waitForTimeout(450)
    const r = await m(); await foot(name)
    rec(`${W} — ${label}: page window-wide, foot bar spans the week`, r.over <= 0 && Math.abs(r.barW - r.weekW) <= 2 && Math.abs(r.barL - r.weekL) <= 2,
      `page over by ${r.over}; week ${r.weekL}+${r.weekW}; bar ${r.barL}+${r.barW}`, [`${W}-${name}`])
    return r
  }
  const a = await step('crew panel open', '1-open')
  await page.click('.ros-rail'); const b = await step('hidden', '2-hidden')
  await page.click('.ros-rail'); const c = await step('shown again', '3-shown')
  await page.click('.ros-rail'); await step('hidden again', '4-hidden-again')
  await page.click('.ros-rail'); await page.waitForTimeout(450)
  rec(`${W} — the week takes the panel's room and gives it back`, b.weekW > a.weekW + 100 && Math.abs(c.weekW - a.weekW) <= 2, `${a.weekW} → ${b.weekW} → ${c.weekW}`)

  /* the open panel still pinned while the page scrolls down (overflow-x:clip makes no scroll box, so sticky holds) */
  const top0 = await page.evaluate(() => Math.round(document.getElementById('eRoster').getBoundingClientRect().top))
  await page.mouse.wheel(0, 700); await page.waitForTimeout(600)
  const top1 = await page.evaluate(() => Math.round(document.getElementById('eRoster').getBoundingClientRect().top))
  const sy = await page.evaluate(() => Math.round(scrollY))
  await page.screenshot({ path: path.join(OUT, `${W}-5-scrolled-open.png`) })
  rec(`${W} — scrolled down ${sy}: the open crew panel stays pinned in view`, sy > 200 && top1 >= 0 && top1 < 200, `panel top ${top0} → ${top1}`, [`${W}-5-scrolled-open`])
  await page.click('.ros-rail'); await page.waitForTimeout(450)
  const r = await m()
  await page.screenshot({ path: path.join(OUT, `${W}-6-scrolled-hidden.png`) })
  rec(`${W} — hidden while scrolled down: page window-wide, foot bar spans the week`, r.over <= 0 && Math.abs(r.barW - r.weekW) <= 2, `over ${r.over}; week ${r.weekW}; bar ${r.barW}`, [`${W}-6-scrolled-hidden`])
  await page.click('.ros-rail'); await page.waitForTimeout(300)

  await page.evaluate(() => { scrollTo(0, 0); window.go('viewsched') }); await page.waitForTimeout(900)
  const v = await page.evaluate(() => { const d = document.documentElement, w = document.getElementById('vWeek').getBoundingClientRect(), b = document.getElementById('hscroll').getBoundingClientRect(); return { over: d.scrollWidth - d.clientWidth, w: Math.round(w.width), b: Math.round(b.width) } })
  await page.screenshot({ path: path.join(OUT, `${W}-7-viewonly.png`), clip: { x: 0, y: H - 110, width: W, height: 110 } })
  rec(`${W} — View-only as before: no browser scroll bar, the foot bar spans the week`, v.over <= 0 && Math.abs(v.w - v.b) <= 2, `over ${v.over}; week ${v.w}; bar ${v.b}`, [`${W}-7-viewonly`])
  rec(`${W} — no page errors`, errs.length === 0, errs.join(' | ') || 'none')
  await ctx.close()
}
await browser.close()
writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(rows, null, 1))
console.log(`${rows.filter(r => r.result === 'PASS').length}/${rows.length} pass`)
