// The mock-up for his question of 3 Nov 26 (his idea, D1613's thread): the moment before the loading claw shows, and the
// claw, on the Leave War's first open at his iPhone's size — today, A (the claw's background see-through: the page's own
// background, its faint blue wash kept), B (every page's background the claw's plain dark) and C (the wash drawn once at
// the top instead of repeating down an empty page — the stripes — and the claw on that background). Drawn on the built app:
// the Leave War's download held back so the moment stands still; "the moment before" is the page area with the claw
// hidden; the claw is paused with all three claws whole. One picture a variant, the two moments side by side.
//   npm run build && node scripts/handpass/talon-claw-bg-mock.mjs
import { chromium } from '@playwright/test'
import { preview } from 'vite'
import { existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '../..')
const OUT = join(ROOT, 'docs/img/handpass/2026-11-03-talon-pages/bg-mock')
mkdirSync(OUT, { recursive: true })
const PORT = 4299
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const VARIANTS = {
  today: '',
  A: '.pgclaw{background:transparent!important}',
  B: 'body{background:#0B0D10!important}',
  C: 'body{background-repeat:no-repeat!important}.pgclaw{background:transparent!important}',
}
const server = await preview({ root: ROOT, preview: { port: PORT, strictPort: true, open: false }, logLevel: 'silent' })
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
for (const [name, css] of Object.entries(VARIANTS)) {
  const ctx = await browser.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  let release; const held = new Promise(r => { release = r })
  await page.route(u => /LeaveWarPage/.test(u.pathname), async r => { await held; await r.continue() })
  await page.goto(`http://localhost:${PORT}/?fresh=1`)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  if (css) await page.addStyleTag({ content: css })
  await page.click('#burger'); await page.waitForSelector('#drawer.open'); await page.waitForTimeout(400)
  await page.click('#drawerNav a[data-page="leavewar"]')
  await page.waitForSelector('#page-leavewar.on', { state: 'attached' }); await page.waitForSelector('.pgclaw'); await page.waitForTimeout(600)
  // the moment before: the claw not yet drawn — the page area as it stands under it
  await page.evaluate(() => { document.querySelector('.pgclaw').style.visibility = 'hidden' })
  await page.screenshot({ path: join(OUT, `${name}-1-before.png`) })
  await page.evaluate(() => {
    const c = document.querySelector('.pgclaw'); c.style.visibility = ''
    for (const a of c.getAnimations({ subtree: true })) { a.pause(); a.currentTime = 1200 }
  })
  await page.waitForTimeout(80)
  await page.screenshot({ path: join(OUT, `${name}-2-claw.png`) })
  release(); await ctx.close()
  console.log(name, 'drawn')
}
await browser.close(); await new Promise(r => server.httpServer.close(r))
