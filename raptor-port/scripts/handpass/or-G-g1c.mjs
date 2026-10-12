// G1 stage A: Undo / Redo straight after the first publish of Sat 18 Jul
import { open, fileInput, toWeek, toView, shot, browser, errs, readRows, inputsRead, signAndPublish, counts, sleep, saveData } from './or-G-lib.mjs'
const rec = {}
const { ctx, page } = await open()
await fileInput(page, { type: 'Training', person: 'Ranger', from: '2026-07-18', to: '2026-07-18', timed: ['09:00', '12:00'], title: 'Range brief', oil: 'yes' })
rec.pub = await signAndPublish(page, 5)
const snap = async () => { const c = await counts(page, 5); const rows = await readRows(page, 'Range brief'); await toView(page); const v = (await readRows(page, 'Range brief')).viewWeek; const head = await page.evaluate(() => [...document.querySelectorAll('#vWeek .day:not(.peek)')][5].querySelector('.day-head').innerText.replace(/\s+/g, ' ')); await toWeek(page); return { a: c.a.split('  [')[0], c: c.c, d: c.d, edit: rows.editWeek, view: v, viewHead: head } }
rec.published = await snap(); console.log('published', JSON.stringify(rec.published))
await toWeek(page)
const ub = page.locator('#undoBtn:visible').first()
rec.undoDisabled = await ub.isDisabled()
if (!rec.undoDisabled) { await ub.click(); await sleep(900) }
rec.undoToast = (await page.evaluate(() => document.getElementById('toastEl')?.innerText || '')).replace(/\s+/g, ' ')
rec.undone = await snap(); console.log('undo', rec.undoToast, JSON.stringify(rec.undone))
await shot(page, 'G1-A-after-undo')
await toWeek(page)
const rb = page.locator('#redoBtn:visible').first()
rec.redoDisabled = await rb.isDisabled()
if (!rec.redoDisabled) { await rb.click(); await sleep(900) }
rec.redone = await snap(); console.log('redo', JSON.stringify(rec.redone), rec.redoDisabled)
saveData('G1c_stageA_undo', rec)
console.log('errs', JSON.stringify(errs))
await ctx.close(); await browser.close()
