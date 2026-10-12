import { world, done, log, rec, sleep, FRI, makeHoliday, closeCal, SAT_DI } from './on-B-lib.mjs'
const w = await world('p844')
const { page, tid, press } = w
const iid = await w.fileIt(FRI, { type: 'Training', people: ['bane', 'harpoon'], from: '09:00', to: '12:00', title: 'Fri brief' })
await makeHoliday(w); await press(tid('odl-later')); await sleep(400); await closeCal(w)
await page.evaluate(() => window.go('editsched')); await sleep(800)
// open the board for Friday
await page.evaluate(() => window.openScheduler(4)); await sleep(900)
const info = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('#schedBoard .sb-arow')].map(r => ({ t: (r.querySelector('textarea.ain, input.ain')?.value || r.innerText.slice(0, 20)), adds: r.querySelectorAll('.addz').length, vis: [...r.querySelectorAll('.addz')].filter(a => { const b = a.getBoundingClientRect(); return b.width > 0 && getComputedStyle(a).visibility !== 'hidden' }).length }))
  return rows.slice(0, 12)
})
log('board rows', info)
await page.locator('#schedBoard .sb-arow').filter({ has: page.locator('textarea.ain, input.ain') }).first().evaluate(e => e.scrollIntoView({ block: 'center' }))
await done(w); process.exit(0)
