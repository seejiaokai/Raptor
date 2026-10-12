import { world, done, log, rec, sleep, SAT, SAT_DI } from './on-B-lib.mjs'
const w = await world('p844')
const { page, tid, press } = w
const iid = await w.fileIt(SAT, { type: 'OD', people: ['bane'], title: 'Overseas thing' })
await page.evaluate(() => window.go('editsched')); await sleep(900)
const day = page.locator('#page-editsched .day:not(.peek)').nth(SAT_DI)
const row = day.locator('[data-inprow]').first()
await row.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(500)
log('ppl html', await row.evaluate(e => { const p = e.querySelector('.ppl'); const r = p.getBoundingClientRect(); return JSON.stringify({ box: [r.x, r.y, r.width, r.height], html: p.outerHTML.slice(0, 700) }) }))
const isArmed = () => page.evaluate(() => ({ rosArm: !!document.querySelector('.ros-arm'), drawer: [...document.querySelectorAll('#eRoster')].some(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.left < innerWidth - 20 && b.right > 0 }), oktake: document.querySelectorAll('#page-editsched .oktake').length }))
// 1: tap the puck
const pk = await row.locator('.puck').first().boundingBox()
await page.touchscreen.tap(pk.x + pk.width / 2, pk.y + pk.height / 2); await sleep(800)
log('after puck tap', await isArmed())
await w.shot('B6-1-puck-tap')
await page.keyboard.press('Escape'); await sleep(300)
// 2: tap blank part of ppl
const pb = await row.locator('.ppl').first().boundingBox()
await page.touchscreen.tap(pb.x + pb.width - 6, pb.y + pb.height / 2); await sleep(800)
log('after blank tap', await isArmed())
await w.shot('B6-1b-blank-tap')
await done(w); process.exit(0)
