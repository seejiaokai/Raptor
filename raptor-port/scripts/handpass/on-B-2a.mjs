// B2 explore: Training for Ranger on Fri 17, holiday, Later, then look at the week for "+ add"
import { world, done, log, rec, sleep, FRI, makeHoliday } from './on-B-lib.mjs'
const w = await world('p844')
const { page, tid, press } = w
const iid = await w.fileIt(FRI, { type: 'Training', people: ['bane'], from: '09:00', to: '12:00', title: 'Fri brief' })
log('filed', iid, await page.evaluate(i => window.INPUTS.find(r => r.iid === i).oil || null, iid))
const up = await makeHoliday(w)
log('list up', up)
await w.shot('B2-0-list')
await press(tid('odl-later')); await sleep(400)
log('oil after later', await page.evaluate(i => window.INPUTS.find(r => r.iid === i).oil || null, iid))
await page.evaluate(() => window.go('editsched')); await sleep(800)
const info = await page.evaluate(() => {
  const days = [...document.querySelectorAll('#page-editsched .day:not(.peek)')]
  return days.map((d, i) => ({ i, adds: d.querySelectorAll('[data-slot$=".+"], .addp, [data-add]').length, txt: (d.querySelector('.dh, .day-head')?.innerText || '').slice(0, 30) }))
})
log('days', info)
await done(w); process.exit(0)
