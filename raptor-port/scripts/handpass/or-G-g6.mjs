// G6 (the changes window on a published day) - Wed 15 Jul published with 'Range brief' (Drifter, Hunter, Ranger) and 'Kit check' (Tally); then an add, a take-out, a move, a cancel
import { open, fileInput, toWeek, toBoard, toView, shot, shotEl, browser, errs, readRows, inputsRead, signAndPublish, counts, sleep, toastMark, toastsSince, dragLocToLoc, rosterPuckOf, weekRow, csId, reload, saveData, mouseDrag, centre } from './or-G-lib.mjs'
const rec = { steps: [] }
const DI = 2
const { ctx, page } = await open()
const H = await csId(page, 'Hex')
const ppl = async () => (await inputsRead(page)).filter(r => ['Range brief', 'Kit check'].includes(r.title)).map(r => r.title + ': ' + r.people.join(','))
const pend = async () => { await toWeek(page); return page.evaluate(di => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; const s = d.querySelector('.dstat'); return s ? s.innerText.replace(/\s+/g, ' ').trim() : 'NO dstat' }, DI) }
rec.f1 = await fileInput(page, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: '2026-07-15', to: '2026-07-15', timed: ['14:00', '15:00'], title: 'Range brief' })
rec.f2 = await fileInput(page, { type: 'Training', person: 'Tally', from: '2026-07-15', to: '2026-07-15', timed: ['16:00', '17:00'], title: 'Kit check', oil: 'no' })
rec.pub = await signAndPublish(page, DI); console.log('pub', JSON.stringify(rec.pub))
rec.start = { ppl: await ppl(), pend: await pend() }; console.log('start', JSON.stringify(rec.start))
const step = async (name, fn) => { const m = await toastMark(page); await fn(); const r = { name, toast: await toastsSince(page, m), ppl: await ppl(), pend: await pend() }; rec.steps.push(r); console.log(JSON.stringify(r)); return r }
/* 1 add Hex to Range brief */
await step('add Hex to Range brief', async () => { await toWeek(page); await dragLocToLoc(page, rosterPuckOf(page, H), weekRow(page, DI, 'Range brief').locator('.addz')) })
/* 2 take Hunter out of Range brief (right-click his puck on the row) */
await step('take Hunter out of Range brief (right-click)', async () => { await toWeek(page); const p = weekRow(page, DI, 'Range brief').locator('.puck', { hasText: 'Hunter' }).first(); await p.scrollIntoViewIfNeeded(); await p.click({ button: 'right' }); await sleep(700) })
/* 3 move Drifter from Range brief to Kit check */
await step('move Drifter Range brief -> Kit check (drag)', async () => { await toWeek(page); await dragLocToLoc(page, weekRow(page, DI, 'Range brief').locator('.puck', { hasText: 'Drifter' }).first(), weekRow(page, DI, 'Kit check').locator('.addz')) })
/* 4 cancel Kit check (WX) on the board */
await step('cancel Kit check (WX) on the board', async () => {
  await toWeek(page)
  const kit = (await inputsRead(page)).find(r => r.title === 'Kit check')
  const ri = await page.evaluate(([di, id]) => (window.DAYS[di].ground || []).findIndex(g => g.src === id), [DI, kit.iid])
  await toBoard(page, DI)
  const cx = page.locator(`#schedBoard [data-grcx="${DI}.${ri}"]:visible`).first()
  await cx.scrollIntoViewIfNeeded(); await cx.click()
  await page.waitForSelector('#cxSave', { timeout: 5000 })
  const q = page.locator('#cxQuick [data-cxq="WX"]').first()
  if (await q.count()) await q.click(); else await page.locator('#cxReason').fill('WX')
  await page.locator('#cxSave').click(); await sleep(600)
  await page.evaluate(() => window.closeScheduler && window.closeScheduler()); await sleep(400)
})
rec.rows = await readRows(page, ['Range brief', 'Kit check']); console.log('rows', JSON.stringify(rec.rows.editWeek))
rec.final = await counts(page, DI, { keepWin: true })
console.log('FINAL', JSON.stringify({ a: rec.final.a.split('  [')[0], c: rec.final.c, d: rec.final.d, e: rec.final.e, lines: rec.final.lines }))
await shot(page, 'G6-to-go-out')
/* the History tab (All changes) */
const allTab = page.locator('.chgwin .win-tab', { hasText: /All changes/ })
rec.allTabLabel = (await allTab.count()) ? (await allTab.first().innerText()).replace(/\s+/g, ' ') : 'NO All changes tab'
if (await allTab.count()) { await allTab.first().click(); await sleep(500) }
rec.history = await page.evaluate(() => [...document.querySelectorAll('.chgwin .pl-item, .chgwin .cw-all .pl-item, .chgwin li')].map(i => i.innerText.replace(/\s+/g, ' ').trim()).slice(0, 40))
console.log('HISTORY', JSON.stringify(rec.history))
await shot(page, 'G6-history')
/* a tap on each To-go-out line */
rec.taps = []
const nLines = rec.final.lines.length
for (let i = 0; i < nLines; i++) {
  await toWeek(page)
  const pb = page.locator('#eWeek .day:not(.peek)').nth(DI).locator('.dstat .dpend').first()
  await pb.scrollIntoViewIfNeeded(); await pb.click(); await sleep(700)
  const tab = page.locator('.chgwin .win-tab', { hasText: /To go out/ }); if (await tab.count()) { await tab.first().click(); await sleep(400) }
  const item = page.locator('.chgwin .cw-out .pl-item').nth(i)
  const label = (await item.innerText()).replace(/\s+/g, ' ')
  await item.click(); await sleep(900)
  const after = await page.evaluate(() => {
    const land = [...document.querySelectorAll('.lift-land')].filter(e => e.getClientRects().length).map(e => ({ cls: e.className.replace(/\s+/g, ' ').slice(0, 50), slot: e.getAttribute('data-slot') || e.getAttribute('data-txt') || '', row: (e.closest('.pl-row,.sb-arow')?.innerText || e.innerText || '').replace(/\s+/g, ' ').slice(0, 80) }))
    return { sbday: window.SBDAY ?? null, chgwinOpen: !!document.querySelector('.chgwin:not([hidden])'), land, toast: document.getElementById('toastEl')?.innerText.replace(/\s+/g, ' ') || '' }
  })
  await shot(page, 'G6-tap-' + (i + 1))
  rec.taps.push({ i, label, after }); console.log('TAP', JSON.stringify({ label, after }))
}
saveData('G6', rec)
console.log('errs', JSON.stringify(errs))
await ctx.close(); await browser.close()
