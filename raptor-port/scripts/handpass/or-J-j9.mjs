import { open, fileInput, shot, toWeek, errs, browser, toWeekDay, undoOnce, redoOnce } from './or-J-lib.mjs'
import { writeFileSync } from 'node:fs'
const MODE = process.argv[2] || 'group'
const { ctx, page } = await open({ fresh: true })
const res = { mode: MODE }
const TITLE = 'Late sortie brief'
const nextWeek = async () => { await toWeek(page); await page.locator('button.wk[data-wk="20/07/2026"]:visible').first().click(); await page.waitForTimeout(1200) }
const monWarn = async () => {
  await nextWeek()
  await page.evaluate(() => window.openScheduler(0)); await page.waitForTimeout(1000)
  const w = await page.evaluate(() => { const side = document.querySelector('#sbSide'); if (!side) return 'no #sbSide'; const t = side.innerText; const cut = t.indexOf('PLACEHOLDERS'); return (cut > 0 ? t.slice(0, cut) : t).split(/\r?\n/).map(s => s.trim()).filter(Boolean).slice(0, 40) })
  return w
}
const shotBoard = async n => { await shot(page, n) }
res.base = await monWarn(); console.log('BASE', JSON.stringify(res.base)); await shotBoard(`j9-${MODE}-0-base`)
await page.evaluate(() => window.closeScheduler && window.closeScheduler()); await page.waitForTimeout(300)
if (MODE === 'group') {
  res.filed = await fileInput(page, { type: 'Training', people: ['Ranger', 'Tally'], from: '2026-07-19', to: '2026-07-19', timed: ['22:00', '23:59'], title: TITLE })
} else {
  res.filed = [await fileInput(page, { type: 'Training', person: 'Ranger', from: '2026-07-19', to: '2026-07-19', timed: ['22:00', '23:59'], title: TITLE }), await fileInput(page, { type: 'Training', person: 'Tally', from: '2026-07-19', to: '2026-07-19', timed: ['22:00', '23:59'], title: TITLE })]
}
console.log('filed', JSON.stringify(res.filed))
res.withInput = await monWarn(); console.log('WITH', JSON.stringify(res.withInput)); await shotBoard(`j9-${MODE}-1-with`)
await page.evaluate(() => window.closeScheduler && window.closeScheduler()); await page.waitForTimeout(300)
/* cancel the Sunday input on Sunday's board: CX on its row, reason WX */
await toWeek(page); await page.locator('button.wk[data-wk="13/07/2026"]:visible').first().click(); await page.waitForTimeout(1200)
await page.evaluate(() => window.openScheduler(6)); await page.waitForTimeout(1000)
const cxs = page.locator(`#schedBoard .sb-panel.grnd .sb-arow`).filter({ has: page.locator(`textarea.ain, input.ain`) })
const nrows = await cxs.count()
const rowIdx = await page.evaluate(t => [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')].findIndex(r => (r.querySelector('textarea.ain, input.ain')?.value || '').trim().toLowerCase() === t.toLowerCase()), TITLE)
console.log('sun rows', nrows, 'row index', rowIdx)
res.cxRows = []
for (let ri = 0; ri < nrows; ri++) {
  const nm = await page.evaluate(([i]) => { const r = document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')[i]; return (r.querySelector('textarea.ain, input.ain')?.value || '').trim() }, [ri])
  if (nm.toLowerCase() !== TITLE.toLowerCase()) continue
  const cx = page.locator('#schedBoard [data-grcx]').nth(res.cxRows.length)
  res.cxRows.push(nm)
}
const cxBtn = page.locator('#schedBoard [data-grcx]:visible').first()
console.log('cx buttons', await page.locator('#schedBoard [data-grcx]:visible').count(), await cxBtn.getAttribute('data-grcx'))
await shot(page, `j9-${MODE}-2-sunday-board`)
const cxs2 = page.locator('#schedBoard [data-grcx]:visible')
for (let k = 0; k < await cxs2.count(); k++) {
  await cxs2.nth(k).scrollIntoViewIfNeeded(); await cxs2.nth(k).click()
  await page.waitForSelector('#cxSave', { timeout: 4000 })
  const q = page.locator('#cxQuick [data-cxq="WX"]').first()
  if (await q.count()) await q.click(); else await page.locator('#cxReason').fill('WX')
  await page.locator('#cxSave').click(); await page.waitForTimeout(600)
}
await shot(page, `j9-${MODE}-3-sunday-cancelled`)
res.sunRow = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')].map(r => r.innerText.replace(/\s+/g, ' ').slice(0, 100)))
console.log('SUNDAY ROW after CX', JSON.stringify(res.sunRow))
await page.locator('#sbDone').click().catch(() => {}); await page.waitForTimeout(500)
res.cancelled = await monWarn(); console.log('CANCELLED', JSON.stringify(res.cancelled.filter(x => /rest|Ranger|Tally/.test(x)))); console.log('cancelled count head', res.cancelled.slice(0, 3).join(' '))
await shot(page, `j9-${MODE}-4-after-cancel`)
res.cxState = await page.evaluate(() => window.INPUTS.filter(r => r.title === 'Late sortie brief').map(r => ({ cx: r.cx, cxr: r.cxr })))
res.undo = await undoOnce(page)
res.afterUndo = (await monWarn()).filter(x => /rest/i.test(x)); console.log('UNDO', res.undo, JSON.stringify(res.afterUndo))
res.redo = await redoOnce(page)
res.afterRedo = (await monWarn()).filter(x => /rest/i.test(x)); console.log('REDO', res.redo, JSON.stringify(res.afterRedo))
writeFileSync(`docs/handpass/parts/or-J-j9-${MODE}-raw.json`, JSON.stringify(res, null, 1))
console.log('ERR', errs.join('\n'))
await ctx.close(); await browser.close()
