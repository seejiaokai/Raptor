import { world, done, log, rec, sleep, SAT, SAT_DI } from './on-B-lib.mjs'
const w = await world('p844')
const { page, tid, press } = w
const iid = await w.fileIt(SAT, { type: 'OD', people: ['bane'], title: 'Overseas thing' })
log('iid', iid, await page.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return JSON.stringify({ oil: r.oil, type: r.type, date: r.date, to: r.to }) }, iid))
await page.evaluate(() => window.go('editsched')); await sleep(900)
const info = await page.evaluate(di => {
  const d = [...document.querySelectorAll('#page-editsched .day:not(.peek)')][di]
  const u = d.querySelector('[data-secmove$=".unav"]')
  return { hasUnav: !!u, iu: [...d.querySelectorAll('[data-slot^="iu:"], [data-fill^="iu:"]')].map(e => e.getAttribute('data-slot') || e.getAttribute('data-fill')), html: u ? u.innerHTML.slice(0, 900) : '' }
}, SAT_DI)
log('unav', info)
const row = page.locator('#page-editsched .day:not(.peek)').nth(SAT_DI).locator('[data-secmove$=".unav"]')
await row.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(500)
await w.shot('B6-0-unav-week')
await done(w); process.exit(0)
