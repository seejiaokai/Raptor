/* the board's side column — the issues list and the crew list — on a desktop and in the desktop layout on a phone
   (D1111/D1112, 21 Oct 26): widths, the crew list's columns, the sign-off's scroll. HP_URL=… HP_SHOTS=… node … */
import { mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, SHOTS, login, go } = await import('./lib.mjs')
mkdirSync(SHOTS, { recursive: true })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const browser = await chromium.launch({ headless: true })
const M = () => {
  const q = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.width), Math.round(r.height)] }
  const ros = document.querySelector('#schedBoard .sb-roster')
  const cols = ros ? [...ros.querySelectorAll('.ros-col, .rcol, [class*=col]')].slice(0, 4).map(c => `${c.className.slice(0, 20)}:${Math.round(c.getBoundingClientRect().width)}`) : []
  const cs = s => { const e = document.querySelector(s); return e ? (({ width, flexBasis, maxWidth, padding }) => ({ width, flexBasis, maxWidth, padding }))(getComputedStyle(e)) : null }
  return JSON.stringify({ side: q('#schedBoard .sb-side'), warn: q('#schedBoard .sb-warn'), sbwrap: q('#schedBoard .sb-warn .sbwrap'), firstLine: q('#schedBoard .sb-warn .wln'), roster: q('#schedBoard .sb-roster'), cols, sideCss: cs('#schedBoard .sb-side'), warnCss: cs('#schedBoard .sb-warn'), wrapCss: cs('#schedBoard .sb-warn .sbwrap') })
}
for (const [name, vp, wide] of [['desk1440', { width: 1440, height: 900 }, false], ['phone-wide', { width: 402, height: 874 }, true]]) {
  const ctx = await browser.newContext({ viewport: vp, ...(wide ? { hasTouch: true, isMobile: true } : {}) })
  const page = await ctx.newPage()
  await page.goto(BASE + '/'); await login(page, 'a'); await go(page, 'editsched')
  await page.locator('#eWeek [data-sbday="2"]:visible').first().click(); await sleep(600)
  if (wide) { await page.locator('#sbMore').click(); await page.locator('#sbMoreWide').click(); await sleep(500) }
  console.log(name, await page.evaluate(M))
  await page.screenshot({ path: `${SHOTS}/side-${name}.png` })
  await ctx.close()
}
await browser.close()
