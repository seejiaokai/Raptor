/* [ARROWS-STAY-PUT] (D1122) — the week strip above the schedule: the button after the picked week, pressed six times;
   it is STILL when its left edge never changes. Run: HP_URL=http://localhost:<port> node scripts/handpass/bsw-weekstrip.mjs */
import { chromium } from '@playwright/test'
const { BASE, login, go } = await import('./lib.mjs')
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1536, height: 864 } })).newPage()
await p.goto(BASE + '/'); await login(p, 'a'); await go(p, 'editsched'); await p.waitForTimeout(300)
const xs = []
for (let i = 0; i < 6; i++) {
  const r = await p.evaluate(() => { const w = [...document.querySelectorAll('.wk[data-wk]')].filter(e => e.offsetParent), k = w.findIndex(e => e.classList.contains('on')); const n = w[k + 1]; n.setAttribute('data-bswnext', '1'); return { x: +n.getBoundingClientRect().left.toFixed(1), widths: w.map(e => Math.round(e.getBoundingClientRect().width)).join(','), lbl: n.textContent.trim() } })
  xs.push(r); await p.evaluate(() => document.querySelector('[data-bswnext]').click()); await p.waitForTimeout(400)
  await p.evaluate(() => document.querySelectorAll('[data-bswnext]').forEach(e => e.removeAttribute('data-bswnext')))
}
console.log('R ' + xs.map(r => `${r.lbl}@${r.x}[${r.widths}]`).join(' '))
await b.close()
