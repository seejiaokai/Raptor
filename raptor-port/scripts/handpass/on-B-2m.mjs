import { world, done, log, rec, sleep, FRI, makeHoliday, closeCal } from './on-B-lib.mjs'
const w = await world('p844')
const { page, tid, press } = w
const iid = await w.fileIt(FRI, { type: 'Training', people: ['bane', 'harpoon'], from: '09:00', to: '12:00', title: 'Fri brief' })
await makeHoliday(w); await press(tid('odl-later')); await sleep(400); await closeCal(w)
await page.evaluate(() => window.go('editsched')); await sleep(800)
const isArmed = () => page.evaluate(() => ({ rosArm: !!document.querySelector('.ros-arm'), ros: document.body.classList.contains('ros-open') }))
const tryRow = async (label, rx) => {
  const row = page.locator('#page-editsched .day:not(.peek)').nth(4).locator('.pl-row').filter({ has: page.locator('.nm .ntx', { hasText: rx }) }).first()
  await row.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(400)
  const ab = await row.locator('.addz').first().boundingBox()
  await page.touchscreen.tap(ab.x + ab.width / 2, ab.y + ab.height / 2); await sleep(900)
  log(label, 'addz', ab, 'armed?', await isArmed())
  await page.keyboard.press('Escape'); await sleep(300)
}
await tryRow('ground school (plain row, Saber)', /ground school/i)
await tryRow('aircrew admin (empty row)', /aircrew admin/i)
await tryRow('fri brief (input row, 2 men)', /fri brief/i)
await done(w); process.exit(0)
