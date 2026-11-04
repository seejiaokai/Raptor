/* [TOPBAR-NAMES-BESIDE-TALON] (D1641) — his question of 4 Nov 26: with the names folded into ☰ on a phone held sideways,
   can the side menu still be scrolled down to its Account part (Switch to the member view, Logout)? The menu opened by a
   real press of ☰, then scrolled by a real wheel turn over the menu (the panel's own scroll, as a finger's would be).
   Run: HP_URL=http://localhost:<port> HP_SHOTS=<folder> node scripts/handpass/topbar-menu-scroll.mjs → <folder>/topbar/ */
import { existsSync, mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, SHOTS, login, go } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = SHOTS + '/topbar'; mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const sleep = ms => new Promise(r => setTimeout(r, ms))
/* his iPhone held sideways, less Safari's own bars: about 874 × 330 of page */
const vp = { width: 874, height: 330 }
const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2 })
const page = await ctx.newPage(); await page.goto(BASE + '/'); await login(page, 'a')
await go(page, 'leavewar'); await sleep(1500)
/* the proposal's fold, as in topbar-names-mock.mjs (forced: his iPhone's letters do not fit) */
await page.addStyleTag({ content: '@media (min-width:821px){.topbar .nav{flex-wrap:nowrap}.topbar.tbm-fold .nav{display:none}.topbar.tbm-fold .burger{display:flex}}' })
await page.evaluate(() => document.querySelector('.topbar').classList.add('tbm-fold'))
await page.click('#burger'); await sleep(500)
const before = await page.evaluate(() => { const p = document.querySelector('.drawer.open .drawer-panel'); return { scrollTop: p.scrollTop, scrollHeight: p.scrollHeight, clientHeight: p.clientHeight, overflowY: getComputedStyle(p).overflowY, touchAction: getComputedStyle(p).touchAction } })
await page.screenshot({ path: `${OUT}/menu-sideways-top.png` })
const box = await page.locator('.drawer.open .drawer-panel').boundingBox()
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 200); await sleep(120) }
await sleep(400)
const after = await page.evaluate(() => { const p = document.querySelector('.drawer.open .drawer-panel'); const lo = document.getElementById('drawerRole'); const r = lo && lo.getBoundingClientRect(); return { scrollTop: Math.round(p.scrollTop), roleBtnInView: !!r && r.top >= 0 && r.bottom <= innerHeight } })
await page.screenshot({ path: `${OUT}/menu-sideways-scrolled.png` })
console.log(JSON.stringify({ before, after }))
await browser.close()
