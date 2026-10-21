/* [BOARD-SIDE-WIDTH] round 2 (D1115's look) — the two findings drawn on the real app (1536 × 864, 2x), each ONE
   transform on the live page, asserted before its picture:
   · sans-proposed: a duty desk picked; the SANS section's rows re-ordered free first, then crossed out (callsign order
     within each), and its heading given the count the other sections carry ("SANS Avail · 8 free")
   · strip-today / strip-proposed: a blank line's front seat picked; the "Planning FCP ·" strip, and the same with the
     trailing " ·" taken off (the line has no callsign yet)
   Run: HP_URL=http://localhost:<port> HP_SHOTS=<folder> node scripts/handpass/bsw-mock2.mjs */
console.log('bsw-mock2 v1')
import { existsSync, mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, SHOTS, login, go } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = SHOTS + '/look'
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const ctx = await browser.newContext({ viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 })
await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
const page = await ctx.newPage()
await page.goto(BASE + '/')
await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
await login(page, 'a')
const noToasts = () => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' })
await go(page, 'editsched')
await page.click('#eWeek [data-sbday="0"]:visible')
await page.waitForSelector('#schedBoard'); await page.waitForTimeout(700)
const pickKey = async (attr, key) => {
  await page.evaluate(([a, k]) => { const e = [...document.querySelectorAll(`#schedBoard [${a}]`)].find(x => x.getAttribute(a) === k && x.offsetParent); e.scrollIntoView({ block: 'center' }); e.setAttribute('data-bswpick', '1') }, [attr, key])
  await page.locator('#schedBoard [data-bswpick="1"]').first().click(); await page.waitForTimeout(500)
  await page.evaluate(() => document.querySelector('[data-bswpick]')?.removeAttribute('data-bswpick'))
}
const sideClip = () => page.evaluate(() => { const r = document.querySelector('#schedBoard .sb-side').getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: Math.min(r.height, innerHeight - r.top) } })

/* the SANS section, a duty desk picked */
await pickKey('data-fill', 'd:0.0.0.+')
const n = await page.evaluate(() => {
  const sec = document.querySelector('#schedBoard .sb-roster .rsans'), rows = [...sec.querySelectorAll('.rsans-row')]
  const free = rows.filter(r => !r.querySelector('.rpuck.no')), struck = rows.filter(r => r.querySelector('.rpuck.no'))
  for (const r of [...free, ...struck]) sec.appendChild(r)
  sec.querySelector('.rh2').textContent = `SANS Avail · ${free.length} free`
  sec.dataset.bswmock = '1'
  const ros = document.querySelector('#schedBoard .sb-roster'); ros.scrollTop = sec.offsetTop - ros.offsetTop - 60
  return free.length
})
await noToasts()
if (!(await page.locator('#schedBoard .rsans[data-bswmock="1"]').count())) throw new Error('SANS transform lost')
await page.screenshot({ path: `${OUT}/sans-proposed.png`, clip: await sideClip() })
console.log('sans free', n)

/* the strip, a blank line's front seat picked */
await page.evaluate(() => document.querySelector('#schedBoard [data-disarm]')?.click()); await page.waitForTimeout(300)
await page.locator('#schedBoard [data-gline="0.0"]:visible').first().click(); await page.waitForTimeout(600)
await pickKey('data-slot', '0.0.2.0.p')
await page.evaluate(() => { document.querySelector('#schedBoard .sb-roster').scrollTop = 0 })
await noToasts()
const stripClip = await page.evaluate(() => { const r = document.querySelector('#schedBoard .sb-roster .ros-arm').getBoundingClientRect(); return { x: r.left - 10, y: r.top - 8, width: r.width + 20, height: r.height + 16 } })
console.log('strip', await page.evaluate(() => document.querySelector('#schedBoard .ros-arm span').innerHTML))
await page.screenshot({ path: `${OUT}/strip-today.png`, clip: stripClip })
await page.evaluate(() => { const s = document.querySelector('#schedBoard .ros-arm span'); const b = s.querySelector('b'), m = b.querySelector('.mono'); if (m && !m.textContent.trim()) { m.remove(); b.innerHTML = b.innerHTML.replace(/\s*·\s*$/, '') } s.dataset.bswmock = '1' })
if (!(await page.locator('#schedBoard .ros-arm span[data-bswmock="1"]').count())) throw new Error('strip transform lost')
await page.screenshot({ path: `${OUT}/strip-proposed.png`, clip: stripClip })
await browser.close()
