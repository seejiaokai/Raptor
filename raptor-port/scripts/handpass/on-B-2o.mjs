import { world, done, log, rec, sleep, FRI, makeHoliday, closeCal } from './on-B-lib.mjs'
const w = await world('p844')
const { page, tid, press } = w
const iid = await w.fileIt('2026-07-15', { type: 'Training', people: ['bane', 'harpoon'], from: '09:00', to: '12:00', title: 'Wed brief' })
await page.evaluate(() => window.go('editsched')); await sleep(800)
const isArmed = () => page.evaluate(() => ({ rosArm: !!document.querySelector('.ros-arm'), ros: document.body.classList.contains('ros-open') }))
const row = page.locator('#page-editsched .day:not(.peek)').nth(2).locator('.pl-row').filter({ has: page.locator('.nm .ntx', { hasText: /wed brief/i }) }).first()
await row.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(400)
const ab = await row.locator('.addz').first().boundingBox()
await page.touchscreen.tap(ab.x + ab.width / 2, ab.y + ab.height / 2); await sleep(900)
log('wed brief working day, tap addz', ab, await isArmed())
await w.shot('B2-dbg5-wed')
await done(w); process.exit(0)
