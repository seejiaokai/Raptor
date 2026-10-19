/* [STANDBY-WEEK-B] D1085 — the Scheduler Board's standby wave headed START / END: does START fit its heading cell at each
   width, with letters a seventh wider too (his iPhone's own font)? SC, AVALON and BB added to Monday; one line per width.
   Run: HP_URL=http://localhost:4183 node scripts/handpass/standby-board-fit.mjs */
import { existsSync } from 'node:fs'
import { chromium } from '@playwright/test'
const BASE = process.env.HP_URL || 'http://localhost:4183'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
let bad = 0
try {
  for (const width of [320, 360, 390, 402, 820, 1024, 1440]) {
    const p = await (await browser.newContext({ viewport: { width, height: 900 } })).newPage()
    await p.goto(BASE + '/?fresh=1')
    await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
    await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
    await p.evaluate(() => { window.go('editsched'); for (const k of ['sc', 'avalon', 'bb']) window.addWave(0, k); window.openScheduler(0) })
    await p.waitForSelector('#schedBoard'); await p.waitForTimeout(800)
    const r = await p.evaluate(() => {
      const hs = [...document.querySelectorAll('#schedBoard .sb-lcols .sb-htl.sb-se')].filter(e => e.firstElementChild.getClientRects().length)
      const fly = [...document.querySelectorAll('#schedBoard .sb-lcols .sb-htl:not(.sb-se)')].find(e => e.firstElementChild.getClientRects().length)
      if (!hs.length) return null
      const out = hs.map(h => {
        const [st, en] = [...h.children]
        const cs = getComputedStyle(st)
        const probe = document.createElement('span')
        probe.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font:${cs.font};letter-spacing:${cs.letterSpacing};text-transform:${cs.textTransform}`
        probe.textContent = 'START'; document.body.appendChild(probe)
        const w = probe.getBoundingClientRect().width; probe.remove()
        /* the room: the heading's own cell — a block wrapper on a phone, the span's grid track on a desktop */
        const room = getComputedStyle(h).display === 'contents' ? st.getBoundingClientRect().width : h.getBoundingClientRect().width
        return { text: h.innerText.replace(/\s+/g, ' '), room: +room.toFixed(1), start: +w.toFixed(1), wide: +(w * 8 / 7).toFixed(1), font: cs.fontSize }
      })
      return { out, fly: fly ? fly.innerText.replace(/\s+/g, ' ') : null }
    })
    if (!r) { console.log(width, 'no standby heading found'); bad++; await p.context().close(); continue }
    const o = r.out[0], ok = r.out.every(x => x.start <= x.room && x.text === 'START END'), okW = r.out.every(x => x.wide <= x.room)
    if (!ok || !okW) bad++
    console.log(`${width}: ${ok ? 'fits' : 'FAIL'} / wider letters ${okW ? 'fit' : 'FAIL'} — "${o.text}" room ${o.room}, START ${o.start}, a seventh wider ${o.wide} (${o.font}; ${r.out.length} standby headings; a flying wave reads "${r.fly}")`)
    await p.context().close()
  }
} finally { await browser.close() }
console.log(bad ? `${bad} width(s) FAIL` : 'all fit')
process.exit(bad ? 1 : 0)
