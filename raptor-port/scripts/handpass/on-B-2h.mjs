import { world, done, log, rec, sleep, FRI, makeHoliday, closeCal } from './on-B-lib.mjs'
const w = await world('p844')
const { page, tid, press } = w
const iid = await w.fileIt(FRI, { type: 'Training', people: ['bane', 'harpoon'], from: '09:00', to: '12:00', title: 'Fri brief' })
await makeHoliday(w); await press(tid('odl-later')); await sleep(400); await closeCal(w)
await page.evaluate(() => window.go('editsched')); await sleep(800)
const row = page.locator('#page-editsched .day:not(.peek)').nth(4).locator('.pl-row').filter({ has: page.locator('.nm .ntx', { hasText: /fri brief/i }) }).first()
await row.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(400)
const arm = () => page.evaluate(() => JSON.stringify(window.ARM || null))
await page.locator('#rosTab').tap(); await sleep(800)
const tally = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Tally'))
const tl = page.locator(`#eRoster .rpuck .puck[data-person="${tally}"]`)
await tl.first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300); await tl.first().tap(); await sleep(600)
log('ARM after tally', await arm())
await page.locator('#rosTab').tap(); await sleep(800)   // close drawer
log('ARM after drawer closed', await arm(), await page.evaluate(() => document.body.className))
await row.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(400)
await w.shot('B2-dbg2-armed-closed')
const info = await page.evaluate(() => {
  const r = [...document.querySelectorAll('#page-editsched .day:not(.peek) .pl-row')].find(x => /fri brief/i.test(x.textContent))
  const a = r.querySelector('.addz'), ar = a.getBoundingClientRect(); const hit = document.elementFromPoint(ar.x + ar.width / 2, ar.y + ar.height / 2)
  return { ar: [ar.x, ar.y, ar.width, ar.height], hit: hit && (hit.tagName + '.' + hit.className), ppl: r.querySelector('.ppl').className, pe: getComputedStyle(a).pointerEvents }
})
log('geom', info)
await done(w); process.exit(0)
