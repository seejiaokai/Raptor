/* [STANDBY-WEEK-B] (D1083) — does the standby wave's START / END heading fit its column? Measures, on Edit Schedule's
   week with an SC, an AVALON and a BB wave on Monday, the heading's third cell (`.sa-se`) at each width: the room inside
   it, the width START's letters take, and the same with letters a seventh wider (his iPhone draws Apple's own font, which
   runs wider than the test browser's — the mock-up guide's trap). Prints one line per width; FAIL where START does not fit.
   Run: HP_URL=http://localhost:4183 node scripts/handpass/standby-week-b-fit.mjs */
import { existsSync } from 'node:fs'
import { chromium } from '@playwright/test'

const BASE = process.env.HP_URL || 'http://localhost:4183'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
let bad = 0
try {
  for (const width of [320, 360, 375, 390, 402, 440, 820, 1024, 1440]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 2, colorScheme: 'dark' })
    const p = await ctx.newPage()
    await p.goto(BASE + '/?fresh=1')
    await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
    await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
    await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(500)
    await p.evaluate(() => { for (const k of ['sc', 'avalon', 'bb']) window.addWave(0, k) }); await p.waitForTimeout(500)
    const r = await p.evaluate(() => {
      const cells = [...document.querySelectorAll('#page-editsched .go.sa .cols.formcols .sa-se')].filter(e => e.offsetParent)
      const e = cells[0]; if (!e) return null
      const cs = getComputedStyle(e)
      const room = e.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      /* START's own width, measured on a copy in the cell's own letters; then a seventh wider */
      const probe = document.createElement('span')
      probe.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font:${cs.font};letter-spacing:${cs.letterSpacing};text-transform:${cs.textTransform}`
      probe.textContent = 'START'; document.body.appendChild(probe)
      const w = probe.getBoundingClientRect().width; probe.remove()
      return { n: cells.length, room: +room.toFixed(1), start: +w.toFixed(1), wide: +(w * 8 / 7).toFixed(1), font: cs.fontSize, ls: cs.letterSpacing, pad: cs.paddingLeft }
    })
    if (!r) { console.log(width, 'no heading cell found'); bad++; await ctx.close(); continue }
    const ok = r.start <= r.room, okWide = r.wide <= r.room
    if (!ok || !okWide) bad++
    console.log(`${width}: ${ok ? 'fits' : 'FAIL'} / wider letters ${okWide ? 'fit' : 'FAIL'} — room ${r.room}, START ${r.start}, a seventh wider ${r.wide} (font ${r.font}, spacing ${r.ls}, padding ${r.pad}; ${r.n} headings)`)
    await ctx.close()
  }
} finally { await browser.close() }
console.log(bad ? `${bad} width(s) FAIL` : 'all fit')
process.exit(bad ? 1 : 0)
