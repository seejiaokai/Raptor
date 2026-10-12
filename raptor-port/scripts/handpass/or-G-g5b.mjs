// G5b - the same world as G5, then taps on Ranger's own input on View-only Sched, with proper pictures
import { open, fileInput, toWeek, toBoard, toView, shot, shotEl, browser, errs, readRows, inputsRead, sleep, csId, reload, saveData } from './or-G-lib.mjs'
const rec = {}
const DI = 3
const { ctx, page } = await open()
rec.f1 = await fileInput(page, { type: 'Meeting', people: ['Ranger', 'Hex', 'Drifter'], placeholder: 'allavail', from: '2026-07-16', to: '2026-07-16', timed: ['10:00', '11:00'], title: 'Range brief' })
rec.f2 = await fileInput(page, { type: 'Training', people: ['Ranger', 'Tally'], from: '2026-07-16', to: '2026-07-16', timed: ['14:00', '15:00'], title: 'Kit check', oil: 'no' })
rec.f3 = await fileInput(page, { type: 'Appointment', person: 'Ranger', from: '2026-07-16', to: '2026-07-16', timed: ['08:00', '09:00'], title: 'Own errand' })
const kit = rec.f2[0]
await toWeek(page)
const ri = await page.evaluate(([di, id]) => (window.DAYS[di].ground || []).findIndex(g => g.src === id), [DI, kit.iid])
await toBoard(page, DI)
const cx = page.locator(`#schedBoard [data-grcx="${DI}.${ri}"]:visible`).first()
await cx.scrollIntoViewIfNeeded(); await cx.click()
await page.waitForSelector('#cxSave', { timeout: 5000 })
const q = page.locator('#cxQuick [data-cxq="WX"]').first()
if (await q.count()) await q.click(); else await page.locator('#cxReason').fill('WX')
await page.locator('#cxSave').click(); await sleep(600)
await page.evaluate(() => window.closeScheduler && window.closeScheduler()); await sleep(400)
await reload(page, 'us', 'us')
await toView(page)
/* a real picture of Thursday: bring the day to the left edge and clip it */
async function dayPic(name) {
  await page.evaluate(di => { const d = [...document.querySelectorAll('#vWeek .day:not(.peek)')][di]; d.scrollIntoView({ block: 'start', inline: 'start' }) }, DI)
  await sleep(400)
  const g = page.locator('#vWeek .day:not(.peek)').nth(DI).locator('.sec-grnd').first()
  await g.scrollIntoViewIfNeeded(); await sleep(300)
  const head = await page.locator('#vWeek .day:not(.peek)').nth(DI).locator('.day-head').first().innerText()
  console.log('picture of day:', head.replace(/\s+/g, ' ').slice(0, 60))
  await shotEl(g, name)
}
await dayPic('G5-ranger-view-thu-ground')
const day = page.locator('#vWeek .day:not(.peek)').nth(DI)
const targets = ['.sec-grnd .pl-row:has-text("RANGE BRIEF") .nm', '.sec-grnd .pl-row:has-text("RANGE BRIEF") .ntx', '.sec-grnd .pl-row:has-text("RANGE BRIEF") .t-s', '.sec-grnd .pl-row:has-text("RANGE BRIEF") .puck:has-text("Ranger")', '.sec-grnd .pl-row:has-text("RANGE BRIEF") .rmk', '.sec-grnd .pl-row:has-text("OWN ERRAND") .nm', '.sec-grnd .pl-row:has-text("OWN ERRAND") .puck', '.sec-grnd .pl-row:has-text("KIT CHECK") .nm', '.sec-grnd .pl-row:has-text("KIT CHECK") .puck:has-text("Ranger")']
rec.taps = []
for (const t of targets) {
  const loc = day.locator(t).first()
  const n = await loc.count()
  let opened = false, text = '', what = ''
  if (n) {
    await loc.scrollIntoViewIfNeeded().catch(() => {})
    const b = await loc.boundingBox()
    await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(700)
    const wins = await page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"], #inpEditPop, .win, [role=dialog], .sheet')].filter(e => e.offsetParent !== null).map(e => (e.getAttribute('data-testid') || e.id || e.className) + ' :: ' + e.innerText.replace(/\s+/g, ' ').slice(0, 420)))
    opened = wins.length > 0; text = wins.join(' || ')
    if (opened) { await shot(page, 'G5b-window-' + (rec.taps.length + 1)); await page.keyboard.press('Escape'); await sleep(300); const c = page.locator('#inpEditCancel'); if (await c.count()) await c.click().catch(() => {}); await sleep(300) }
  }
  rec.taps.push({ t, n, opened, text })
  console.log('tap', t, n, opened, text.slice(0, 300))
}
rec.rows = (await readRows(page, ['Range brief', 'Kit check', 'Own errand'])).viewWeek
console.log('rows', JSON.stringify(rec.rows))
saveData('G5b', rec)
console.log('errs', JSON.stringify(errs))
await ctx.close(); await browser.close()
