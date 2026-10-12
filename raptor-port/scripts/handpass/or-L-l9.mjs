import { open, fileInput, toWeek, toBoard, shot, saveRes, errs, browser, toast, inputsOf, undoRedo, weekRows, closeBoardMode } from './or-L-lib.mjs'
const R = {}
const { ctx, page } = await open('ad', 'a')
R.filed = await fileInput(page, { type: 'Meeting', people: ['Drifter', 'Hunter'], from: '2026-07-15', to: '2026-07-15', timed: ['14:00', '15:00'], title: 'L9 meeting' })
const iid = R.filed[0].iid
const st = async () => { const x = await page.evaluate(id => { const r = window.INPUTS.find(i => i.iid === id); return r ? { cx: r.cx || null, cxr: r.cxr || null } : null }, iid); return x }
const rowIdx = () => page.evaluate(id => (window.DAYS[2].ground || []).findIndex(g => g.src === id), iid)
await toBoard(page, 2)
const ri = await rowIdx()
const cxBtn = () => page.locator(`#schedBoard [data-grcx="2.${ri}"]:visible`).first()
await cxBtn().scrollIntoViewIfNeeded(); await cxBtn().click(); await page.waitForSelector('#cxSave')
const q = page.locator('#cxQuick [data-cxq="WX"]').first(); if (await q.count()) await q.click(); else await page.locator('#cxReason').fill('WX')
await page.locator('#cxSave').click(); await page.waitForTimeout(600)
R.afterCancel = await st(); R.toast1 = await toast(page)
await cxBtn().click(); await page.waitForTimeout(700)
R.sheetOnSecondPress = await page.locator('#cxSave').count()
if (R.sheetOnSecondPress) { await shot(page, 'l9-0-second-press-sheet'); await page.locator('#cxUn').click(); await page.waitForTimeout(600) }
R.afterUncancel = await st(); R.toast2 = await toast(page)
await shot(page, 'l9-1-after-uncancel')
R.undo1 = await undoRedo(page, 'undo'); R.afterUndo1 = await st()
await shot(page, 'l9-2-after-undo1')
R.undo2 = await undoRedo(page, 'undo'); R.afterUndo2 = await st()
await shot(page, 'l9-3-after-undo2')
/* cancel once more, open the changes window history */
await cxBtn().click(); await page.waitForSelector('#cxSave')
const q2 = page.locator('#cxQuick [data-cxq="WX"]').first(); if (await q2.count()) await q2.click(); else await page.locator('#cxReason').fill('WX')
await page.locator('#cxSave').click(); await page.waitForTimeout(600)
R.afterCancel2 = await st()
await closeBoardMode(page); await toWeek(page)
await page.locator('#histBtn').click(); await page.waitForTimeout(900)
const tab = page.locator('.chgwin .win-tab', { hasText: /All changes/ }); if (await tab.count()) { await tab.first().click(); await page.waitForTimeout(500) }
R.history = await page.evaluate(() => { const w = document.querySelector('.chgwin'); return w ? w.innerText.replace(/\s+/g, ' ').slice(0, 1200) : null })
await shot(page, 'l9-4-history')
saveRes('L9', R)
console.log(JSON.stringify(R, null, 1))
console.log('ERRS', errs.join('\n'))
await browser.close()
