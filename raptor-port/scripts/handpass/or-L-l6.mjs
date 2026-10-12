import { open, fileInput, toWeek, shot, saveRes, errs, browser, toast, inputsOf, become, undoRedo, toMonth, openDay, dayCardText, closeDay, dragOntoRow, openInputWindow } from './or-L-lib.mjs'
const R = {}
const { ctx, page } = await open('ad', 'a')
await become(page, 'Ranger', 'member')
R.filed = await fileInput(page, { type: 'Meeting', people: ['Ranger', 'Hex'], from: '2026-07-15', to: '2026-07-15', timed: ['14:00', '15:00'], title: 'L6 meeting' })
const iid = R.filed[0]?.iid
R.filedBy = R.filed[0]?.by
const card = async tag => { await toMonth(page); await page.selectOption('#inFPerson', { label: 'Everyone' }).catch(() => {}); await page.waitForTimeout(200); await openDay(page, '2026-07-15'); const c = (await dayCardText(page)).filter(x => /L6 meeting|Ranger|Hex/.test(x)); await shot(page, `l6-${tag}-card`); await closeDay(page); return c }
const winText = async tag => { await openInputWindow(page, iid, '2026-07-15'); const t = await page.locator('#inpEditPop').innerText().then(x => x.replace(/\s+/g, ' ').trim()); const btns = await page.evaluate(() => [...document.querySelectorAll('#inpEditPop button')].filter(b => b.offsetParent).map(b => (b.dataset.testid || b.id || '') + ':' + b.textContent.trim().slice(0, 30))); await shot(page, `l6-${tag}-window`); return { t, btns } }
R.cardFiled = await card('1-filed')
R.winFiled = await winText('1-filed')
await page.locator('#inpEditCancel').click().catch(() => {}); await page.waitForTimeout(300)
await become(page, 'Saber', 'admin')
R.addToast = await dragOntoRow(page, 'Hunter', 'L6 MEETING')
R.afterAdd = (await inputsOf(page, 'L6 meeting')).map(r => ({ people: r.people, by: r.by }))
await become(page, 'Ranger', 'member')
R.cardAdded = await card('2-hunter-added')
R.winAdded = await winText('2-hunter-added')
await page.locator('[data-testid="inped-takeout"]').click(); await page.waitForTimeout(300)
await page.locator('[data-testid="inped-takeout-yes"]').click(); await page.waitForTimeout(700)
R.takeOutToast = await toast(page)
R.afterTakeOut = (await inputsOf(page, 'L6 meeting')).map(r => ({ people: r.people, by: r.by }))
R.cardAfterTakeOut = await card('3-took-himself-out')
await become(page, 'Saber', 'admin')
R.cardSaberAfterTakeOut = await card('3b-took-out-as-saber')
await become(page, 'Ranger', 'member')
R.undo = await undoRedo(page, 'undo')
R.afterUndo = (await inputsOf(page, 'L6 meeting')).map(r => ({ people: r.people, by: r.by }))
R.cardAfterUndo = await card('4-after-undo')
R.winAfterUndo = await winText('4-after-undo')
saveRes('L6', R)
console.log(JSON.stringify(R, null, 1))
console.log('ERRS', errs.join('\n'))
await browser.close()
