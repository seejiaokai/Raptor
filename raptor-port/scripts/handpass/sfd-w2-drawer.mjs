// Walker w2 — the phone's crew list drawer pictured (sfd-w2.mjs read the drawer's markup with it closed).
// Hex posted out as SANS from Mon 20 Jul (clock Wed 22 Jul), then the board's AIRCREW drawer opened on Mon 13, Sat 18 and Tue 21.
// Run from raptor-port/:  node scripts/handpass/sfd-w2-drawer.mjs
import { webkit } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const VERSION = 'sfd-w2-drawer v1'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(path.resolve(HERE, '../..'), 'docs/img/handpass/2026-11-22-sans-from-date/w2/final')
mkdirSync(path.join(OUT, 'taps'), { recursive: true })
console.log(VERSION)
const sleep = ms => new Promise(r => setTimeout(r, ms))
const MAN = 'rocky'
const b = await webkit.launch()
const ctx = await b.newContext({ viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 })
await ctx.clock.install({ time: new Date('2026-07-22T09:00:00') })
const p = await ctx.newPage()
const errs = []
p.on('pageerror', e => errs.push('PAGEERROR ' + e.message))
p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text().slice(0, 160)) })
let n = 0
const tap = async (sel, label) => { const l = typeof sel === 'string' ? p.locator(sel).first() : sel; await l.waitFor({ state: 'visible', timeout: 8000 }); await l.scrollIntoViewIfNeeded().catch(() => {}); await l.tap(); await p.screenshot({ path: path.join(OUT, 'taps', `drawer-${String(++n).padStart(2, '0')}-${label}-now-phone.png`) }); await sleep(400) }
const go = async t => { await p.evaluate(t => window.go(t), t); await p.waitForFunction(t => window.CURPAGE === t, t); await sleep(600) }
await p.goto('http://localhost:4322/')
await p.waitForSelector('#luser'); await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a')
await p.click('#loginForm button[type=submit]'); await p.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(800)
/* the posting (frf-w1's route) */
await go('leavewar'); await sleep(900)
await tap('[data-testid="month-JUL"]:visible', 'jul'); await sleep(600)
const c = p.locator('[data-testid="cell-rocky-2026-07-20"]').first()
await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
await tap(c, 'cell'); await tap('[data-testid="bid-more"]:visible', 'more'); await tap('[data-testid="bid-postout"]:visible', 'postout')
await tap('[data-testid="po-sans"]:visible', 'sans'); await tap('[data-testid="po-confirm"]:visible', 'confirm'); await sleep(900)
console.log('posting', JSON.stringify(await p.evaluate(() => ({ san: !!window.PEOPLE.rocky.san, from: window.PEOPLE.rocky.sanFrom }))))
const toWeek = async dd => { if ((await p.evaluate(() => window.DAYS[0].dt)) === `Jul ${dd}`) return; await tap('.filt-cal:visible', 'cal'); await tap(`[data-testid="wcal-day-2026-07-${dd}"]:visible`, 'wk' + dd); await sleep(800) }
for (const [wk, di, name] of [['13', 0, 'mon13'], ['13', 5, 'sat18'], ['20', 1, 'tue21']]) {
  await go('editsched'); await toWeek(wk)
  const d = p.locator(`#eWeek [data-sbday="${di}"]`).first(); await d.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
  await tap(d, 'day-' + name); await p.waitForSelector('#schedBoard'); await sleep(800)
  await tap('#schedBoard .ros-tab', 'aircrew-' + name); await sleep(600)
  const pk = p.locator(`#schedBoard .rcol [data-person="${MAN}"], #schedBoard .rsans [data-person="${MAN}"]`).filter({ visible: true }).first()
  if (await pk.count()) { await pk.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(400) }
  const r = await p.evaluate(id => [...document.querySelectorAll(`#schedBoard .rcol [data-person="${id}"], #schedBoard .rsans [data-person="${id}"]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => { const c = e.closest('.rcol,.rsans'); const h = c && c.querySelector('.rh2'); return { under: h ? h.innerText.replace(/\s+/g, ' ').trim() : '?', sans: !!e.closest('.rsans'), san: e.classList.contains('san'), x: Math.round(e.getBoundingClientRect().left) } }), MAN)
  console.log(name, JSON.stringify(r), 'heads', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#schedBoard .rh2')].filter(h => h.getBoundingClientRect().width > 0).map(h => h.innerText.replace(/\s+/g, ' ').trim()))))
  await p.screenshot({ path: path.join(OUT, `drawer-${name}-crew-phone.png`) })
  await p.locator('#schedBoard button:visible', { hasText: 'Done' }).first().tap().catch(async () => { await p.keyboard.press('Escape') }); await sleep(500)
  if (await p.locator('#schedBoard').count()) { const dn = p.locator('#sbDone'); if (await dn.count()) await dn.tap().catch(() => {}); await sleep(400) }
}
console.log('errors', JSON.stringify(errs))
await b.close()
