// The host's own short walk before the walkers start (docs/walk-scripts.md §1) — SANS from its date (D2313), chat 140, 22 Nov 26.
// Proves the two routes the walkers' brief names: the Quals hand tick (✎ Edit → the man's SANS cell) with the browser's clock
// set to Wed 15 Jul 26 and left running, and the read of the board's crew list on a day before and a day from the tick.
// Run from raptor-port/:  SFD_URL=http://localhost:4320/ node scripts/handpass/sfd-host.mjs
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const VERSION = 'sfd-host v3'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '../..')
const URL_ = process.env.SFD_URL || 'http://localhost:4320/'
const OUT = process.env.SFD_OUT || path.join(ROOT, 'docs/img/handpass/2026-11-22-sans-from-date/host')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const NOW = process.env.SFD_NOW || '2026-07-15T09:00:00'
console.log(VERSION, URL_, 'clock', NOW)
mkdirSync(OUT, { recursive: true })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const MAN = 'rocky'   // Hex, a WSO

const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctx = await b.newContext({ viewport: { width: 1536, height: 864 } })
await ctx.clock.install({ time: new Date(NOW) })
const p = await ctx.newPage()
const errs = []
p.on('pageerror', e => errs.push('PAGEERROR ' + e.message))
p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text().slice(0, 200)) })
await p.goto(URL_)
await p.waitForSelector('#luser'); await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a')
await p.click('#loginForm button[type=submit]')
await p.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(700)
const go = async to => { await p.evaluate(t => window.go(t), to); await p.waitForFunction(t => window.CURPAGE === t, to); await sleep(600) }
const man = await p.evaluate(id => ({ cs: window.PEOPLE[id].cs, seat: window.PEOPLE[id].seat, san: !!window.PEOPLE[id].san, today: new Date().toISOString() }), MAN)
console.log('premise', JSON.stringify(man))

/* the crew list of a day on the board: which heading his puck stands under */
const crewOn = async di => {
  await go('editsched')
  const d = p.locator(`#eWeek [data-sbday="${di}"]`).first()
  await d.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  await d.click(); await p.waitForSelector('#schedBoard'); await sleep(800)
  const r = await p.evaluate(id => {
    const vis = e => e.getBoundingClientRect().width > 0
    const pucks = [...document.querySelectorAll(`#schedBoard [data-person="${id}"]`)].filter(vis)
    const out = pucks.map(e => {
      const sec = e.closest('.rall, .rcol, [class*="rsans"]')
      const h = sec && sec.querySelector('.rh2')
      return { cls: e.className, title: e.getAttribute('title') || '', inSansAvail: !!e.closest('.rsans'), under: h ? h.innerText.replace(/\s+/g, ' ').trim() : '(no heading: ' + (e.parentElement && e.parentElement.className) + ')' }
    })
    const heads = [...document.querySelectorAll('#schedBoard .rh2')].filter(vis).map(h => h.innerText.replace(/\s+/g, ' ').trim())
    return { out, heads }
  }, MAN)
  const pic = path.join(OUT, `host-crew-day${di}.png`); await p.screenshot({ path: pic })
  const done = p.locator('#schedBoard button:visible', { hasText: 'Done' }).first()
  if (await done.count()) await done.click(); else await p.keyboard.press('Escape')
  await sleep(500)
  return r
}
console.log('BEFORE tick, Mon:', JSON.stringify(await crewOn(0)))

/* the Quals hand tick: ✎ Edit, then his SANS cell */
await go('quals')
await p.click('#qViewW'); await sleep(300)     // the page opens on Pilots; Hex is a WSO
await p.click('#qEdit'); await sleep(300)
const cell = p.locator(`td[data-q="${MAN}|san"]`).first()
console.log('SANS cell found:', await cell.count())
await cell.scrollIntoViewIfNeeded(); await cell.click(); await sleep(500)
const after = await p.evaluate(id => { const q = window.PEOPLE[id]; return { san: !!q.san, sanFrom: q.sanFrom || null, sanWas: q.sanWas || null, sanBy: q.sanBy || null } }, MAN)
console.log('AFTER tick:', JSON.stringify(after))
await p.screenshot({ path: path.join(OUT, 'host-quals-ticked.png') })
await p.click('#qSave').catch(() => {}); await sleep(300)

if (process.env.SFD_RETICK) {
  /* THE LOOK AFTER THE READ'S FIX (the blind Opus read #1): ticked Wed 15, unticked Thu 16, ticked again Fri 17 —
     Wednesday stays a SANS day, Thursday a regular's, Friday SANS again. Each day read off the board's crew list. */
  const tickCell = async () => { await go('quals'); await p.click('#qViewW'); await sleep(200); if (await p.locator('#qEdit:visible').count()) await p.click('#qEdit'); await sleep(200); await p.locator(`td[data-q="${MAN}|san"]`).first().click(); await sleep(400) }
  const short = r => r.out.filter(o => /rpuck/.test(o.cls) || /^puck/.test(o.cls)).map(o => `${o.inSansAvail ? 'SANSAVAIL' : 'regular'}:${/\bsan\b/.test(o.cls) ? 'line' : 'noline'}`).join(' ')
  await p.clock.fastForward('24:00:00'); await sleep(500)
  await tickCell()   // off, Thu 16
  console.log('RETICK after untick Thu:', JSON.stringify(await p.evaluate(id => { const q = window.PEOPLE[id]; return { today: new Date().toDateString(), san: !!q.san, sanFrom: q.sanFrom || null, sanWas: q.sanWas || null } }, MAN)))
  await p.clock.fastForward('24:00:00'); await sleep(500)
  await tickCell()   // on, Fri 17
  console.log('RETICK after re-tick Fri:', JSON.stringify(await p.evaluate(id => { const q = window.PEOPLE[id]; return { today: new Date().toDateString(), san: !!q.san, sanFrom: q.sanFrom || null, sanWas: q.sanWas || null } }, MAN)))
  for (const di of [1, 2, 3, 4]) console.log(`RETICK day ${di}:`, short(await crewOn(di)))
  console.log('errors:', JSON.stringify(errs)); await b.close(); process.exit(0)
}
console.log('AFTER tick, Mon 13 Jul:', JSON.stringify(await crewOn(0)))
console.log('AFTER tick, Thu 16 Jul:', JSON.stringify(await crewOn(3)))

/* a reload keeps the date */
await p.reload(); await p.waitForSelector('#luser'); await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a')
await p.click('#loginForm button[type=submit]'); await p.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(700)
console.log('AFTER reload:', JSON.stringify(await p.evaluate(id => { const q = window.PEOPLE[id]; return { san: !!q.san, sanFrom: q.sanFrom || null } }, MAN)))
console.log('errors:', JSON.stringify(errs))
await b.close()
