import { world, done, log, rec, sleep, FRI, makeHoliday, closeCal } from './on-B-lib.mjs'
const w = await world('p844')
const { page, tid, press } = w
const iid = await w.fileIt(FRI, { type: 'Training', people: ['bane'], from: '09:00', to: '12:00', title: 'Fri brief' })
await makeHoliday(w); await press(tid('odl-later')); await sleep(400); await closeCal(w)
await page.evaluate(() => window.go('editsched')); await sleep(800)
const info = await page.evaluate(() => {
  const d = [...document.querySelectorAll('#page-editsched .day:not(.peek)')][4]
  const row = [...d.querySelectorAll('.pl-row')].find(r => /fri brief/i.test(r.textContent))
  const a = row.querySelector('.addz'); const cs = getComputedStyle(a); const r = a.getBoundingClientRect(); const p = row.querySelector('.ppl').getBoundingClientRect()
  return { disp: cs.display, vis: cs.visibility, op: cs.opacity, pos: cs.position, rect: [r.x, r.y, r.width, r.height], ppl: [p.x, p.y, p.width, p.height] }
})
log('addz', info)
await done(w); process.exit(0)
