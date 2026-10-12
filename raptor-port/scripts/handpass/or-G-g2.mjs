// G2 (the face flags a man of several) - Wed 15 Jul, Training for Ranger, Tally, Hex + ALL AVAIL while Tally sits in a flying seat
import { open, fileInput, toWeek, toBoard, toView, shot, shotEl, browser, errs, readRows, inputsRead, signAndPublish, counts, sleep, toastMark, toastsSince, dragLocToLoc, rosterPuckOf, weekRow, csId, reload, saveData } from './or-G-lib.mjs'
const rec = {}
const DI = 2
const { ctx, page } = await open()
const T = await csId(page, 'Tally')
await toWeek(page)
const seat = page.locator('#eWeek .day:not(.peek)').nth(DI).locator('[data-slot="2.1.0.0.w"]').first()
rec.seatBefore = (await seat.innerText()).replace(/\s+/g, ' ')
let m = await toastMark(page)
await dragLocToLoc(page, rosterPuckOf(page, T), seat)
rec.seatToast = await toastsSince(page, m)
rec.seatAfter = (await seat.innerText()).replace(/\s+/g, ' ')
console.log('seat', rec.seatBefore, '->', rec.seatAfter, rec.seatToast)
rec.wave2 = await page.evaluate(() => { const w = window.DAYS[2].waves[1].formations[0]; return { to: w.to, ld: w.ld } })
const F = await fileInput(page, { type: 'Training', people: ['Ranger', 'Tally', 'Hex'], placeholder: 'allavail', from: '2026-07-15', to: '2026-07-15', timed: ['13:30', '14:30'], title: 'Range brief', oil: 'yes' })
console.log('filed', JSON.stringify(F)); rec.filed = F
await toWeek(page)
rec.edit = await readRows(page, 'Range brief')
async function dayWarn(root, tag) {
  const day = page.locator(`${root} .day:not(.peek)`).nth(DI)
  await day.scrollIntoViewIfNeeded().catch(() => {})
  const chip = day.locator('text=/\\d+ issues?/').first()
  const info = { chip: (await chip.count()) ? (await chip.innerText()).replace(/\s+/g, ' ') : 'NO ISSUE CHIP' }
  if (await chip.count()) { await chip.click().catch(() => {}); await sleep(500) }
  info.list = await day.evaluate(d => { const t = d.innerText.replace(/\s+/g, ' '); const i = t.search(/\d+ issues?/); return i >= 0 ? t.slice(i, i + 700) : t.slice(0, 300) })
  info.pucks = await day.evaluate(d => [...d.querySelectorAll('.puck')].filter(p => /Tally/.test(p.textContent)).map(p => ({ cls: p.className.replace(/\s+/g, ' '), title: p.getAttribute('title') || '', inRow: !!p.closest('.sec-grnd'), ring: getComputedStyle(p).boxShadow.slice(0, 80) + ' | outline ' + getComputedStyle(p).outline.slice(0, 60) })))
  await shot(page, tag)
  return info
}
rec.editWarn = await dayWarn('#eWeek', 'G2-edit-week')
console.log('editWarn', JSON.stringify(rec.editWarn))
await toBoard(page, DI)
rec.boardWarn = await page.evaluate(() => { const s = document.querySelector('#sbSide'); return s ? s.innerText.replace(/\s+/g, ' ').slice(0, 700) : 'NO #sbSide' })
console.log('boardWarn', rec.boardWarn)
await shot(page, 'G2-board')
await page.evaluate(() => window.closeScheduler && window.closeScheduler()); await sleep(300)
rec.pub = await signAndPublish(page, DI); console.log('pub', JSON.stringify(rec.pub))
await toWeek(page)
rec.editWarnAfterPub = await dayWarn('#eWeek', 'G2-edit-week-after-pub')
console.log('editWarnAfterPub', JSON.stringify(rec.editWarnAfterPub))
await toView(page)
rec.viewRows = (await readRows(page, 'Range brief')).viewWeek
rec.viewWarn = await dayWarn('#vWeek', 'G2-view-saber')
console.log('viewRows', JSON.stringify(rec.viewRows)); console.log('viewWarn', JSON.stringify(rec.viewWarn))
await reload(page, 'us', 'us')
await toView(page)
rec.viewRanger = await dayWarn('#vWeek', 'G2-view-ranger')
console.log('viewRanger', JSON.stringify(rec.viewRanger))
saveData('G2', rec)
console.log('errs', JSON.stringify(errs))
await ctx.close(); await browser.close()
