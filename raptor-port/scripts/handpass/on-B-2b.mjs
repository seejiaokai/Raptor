// B2 explore 2: find "+ add" on Fri in the week
import { world, done, log, rec, sleep, FRI, makeHoliday } from './on-B-lib.mjs'
const w = await world('p844')
const { page, tid, press } = w
const iid = await w.fileIt(FRI, { type: 'Training', people: ['bane'], from: '09:00', to: '12:00', title: 'Fri brief' })
await makeHoliday(w); await press(tid('odl-later')); await sleep(400)
await page.evaluate(() => window.go('editsched')); await sleep(800)
const info = await page.evaluate(() => {
  const d = [...document.querySelectorAll('#page-editsched .day:not(.peek)')][4]
  const out = []
  d.querySelectorAll('*').forEach(e => { if (e.children.length === 0 && /add/i.test(e.textContent || '') && (e.textContent || '').length < 20) out.push({ tag: e.tagName, cls: e.className, txt: e.textContent, slot: e.getAttribute('data-slot') || e.closest('[data-slot]')?.getAttribute('data-slot'), p: e.parentElement.className }) })
  return out
})
log('adds', info)
const sec = await page.evaluate(() => { const d = [...document.querySelectorAll('#page-editsched .day:not(.peek)')][4]; return [...d.querySelectorAll('[data-secmove]')].map(s => s.getAttribute('data-secmove')) })
log('sections', sec)
await done(w); process.exit(0)
