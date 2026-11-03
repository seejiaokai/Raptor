// His question of 3 Nov 26 (after D1614): does taking the faint wash away change how the pages look once they have loaded?
// Pictures of loaded pages on the built app, each twice: with the old wash put back (before) and as built (after), side by
// side, at his iPhone's size and a desktop's. Only the body's background differs between the two.
//   npm run build && node scripts/handpass/talon-bg-loaded-pages.mjs
import { chromium } from '@playwright/test'
import { preview } from 'vite'
import { existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '../..')
const OUT = join(ROOT, 'docs/img/handpass/2026-11-03-talon-pages/loaded-pages')
mkdirSync(OUT, { recursive: true })
const PORT = 4314
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OLD = 'body{background:radial-gradient(900px 420px at 12% -8%,rgba(59,198,232,.09),transparent 62%),radial-gradient(760px 380px at 98% -6%,rgba(87,201,122,.05),transparent 58%),#0B0D10!important}'
const SIZES = { phone: { viewport: { width: 402, height: 874 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, desktop: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 } }
const PAGES = ['viewsched', 'leavewar', 'inputs', 'admin']
const server = await preview({ root: ROOT, preview: { port: PORT, strictPort: true, open: false }, logLevel: 'silent' })
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const shots = []
for (const [size, opts] of Object.entries(SIZES)) {
  const ctx = await browser.newContext(opts)
  const page = await ctx.newPage()
  await page.goto(`http://localhost:${PORT}/?fresh=1`)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  for (const p of PAGES) {
    await page.evaluate(p => document.querySelector(`#drawerNav a[data-page="${p}"]`).click(), p)
    await page.waitForTimeout(p === 'leavewar' ? 2500 : 900)
    await page.evaluate(() => window.scrollTo(0, 0))
    const after = await page.screenshot()
    const tag = await page.addStyleTag({ content: OLD })
    await page.waitForTimeout(100)
    const before = await page.screenshot()
    await tag.evaluate(t => t.remove())
    shots.push({ size, p, before: before.toString('base64'), after: after.toString('base64') })
  }
  await ctx.close()
}
// one sheet a size: each page, before | after
for (const size of Object.keys(SIZES)) {
  const list = shots.filter(s => s.size === size)
  const w = size === 'phone' ? 260 : 620
  const sheet = await browser.newPage({ viewport: { width: 1400, height: 400 }, deviceScaleFactor: 2 })
  await sheet.setContent(`<body style="margin:0;background:#1a1a1a;color:#ddd;font:13px system-ui;padding:12px">${list.map(s => `<div style="margin-bottom:14px"><div style="margin:0 0 4px">${s.p}</div><div style="display:flex;gap:10px">${['before', 'after'].map(k => `<div><div style="color:${k === 'before' ? '#e5c24a' : '#57c97a'}">${k === 'before' ? 'before (the faint wash)' : 'after (plain dark)'}</div><img src="data:image/png;base64,${s[k]}" style="width:${w}px;display:block;border:1px solid #444"></div>`).join('')}</div></div>`).join('')}</body>`)
  await sheet.waitForTimeout(300)
  await sheet.screenshot({ path: join(OUT, `${size}-before-after.png`), fullPage: true })
  await sheet.close()
}
await browser.close(); await new Promise(r => server.httpServer.close(r))
console.log('pictures in', OUT)
