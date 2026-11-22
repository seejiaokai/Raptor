// w1 exploration (fable-read-faults walk, 22 Nov 26): read the demo Saturday and the board's controls. No pictures kept.
import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const URL_ = 'http://localhost:4311/'
console.log('frf-w1-explore v1')
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctx = await b.newContext({ viewport: { width: 1536, height: 864 } })
const p = await ctx.newPage()
p.on('pageerror', e => console.log('PAGEERROR', e.message))
await p.goto(URL_); await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
await p.waitForSelector('#vWeek .day', { state: 'attached' }); await p.waitForTimeout(600)
const info = await p.evaluate(() => {
  const P = window.PEOPLE, cs = id => (P[id] && P[id].cs) || id
  return {
    days: window.DAYS.map((d, i) => ({ i, date: d.date || d.lbl || d.name, allhands: (d.allhands || []).map(a => `${a.prog}|${a.str}-${a.end}|${Array.isArray(a.who) ? a.who.map(cs).join(',') : cs(a.who)}`) })),
    rocky: P.rocky && { cs: P.rocky.cs, seat: P.rocky.seat, san: P.rocky.san },
    bane: P.bane && { cs: P.bane.cs },
  }
})
console.log(JSON.stringify(info, null, 1))
await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(600)
await p.locator('#eWeek [data-sbday="5"]').first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
await p.waitForSelector('#schedBoard'); await p.waitForTimeout(800)
const board = await p.evaluate(() => {
  const vis = e => e.getBoundingClientRect().width > 0
  const b = document.querySelector('#schedBoard')
  const attrs = new Set()
  for (const e of b.querySelectorAll('*')) if (vis(e)) for (const a of e.attributes) if (a.name.startsWith('data-')) attrs.add(a.name)
  const ph = [...b.querySelectorAll('[data-person]')].filter(vis).map(e => e.dataset.person).filter(x => /all/i.test(x))
  const prog = [...b.querySelectorAll('[data-slot^="a:5"], [data-zone^="a:5"], [data-fill^="a:5"]')].filter(vis).slice(0, 10).map(e => e.outerHTML.slice(0, 200))
  const btns = [...b.querySelectorAll('button')].filter(vis).map(x => (x.innerText || x.title || '').replace(/\s+/g, ' ').trim()).filter(Boolean)
  return { attrs: [...attrs].sort(), ph: [...new Set(ph)], prog, btns: btns.slice(0, 120) }
})
console.log(JSON.stringify(board, null, 1))
await p.screenshot({ path: process.env.TMPDIR_W1 + '/explore-board.png' })
await b.close()
