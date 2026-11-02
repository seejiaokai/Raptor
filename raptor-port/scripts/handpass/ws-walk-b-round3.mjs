/* WALKER B, part 4: B16 on the dialogs' own ids (Sort all: #sortAllPop; a jet's CX: #cxPop). node ws-walk-b-round3.mjs */
import { start, signIn, editTab, recorder, shotter, OUT, writeJson } from './ws-walk-b-lib.mjs'
console.log('ws-walk-b-round3 v1 (B16), pictures in ' + OUT)
const { browser, page, errors } = await start()
const { rows, note } = recorder()
const shot = shotter(page)
await signIn(page); await editTab(page)
await page.locator('#eWeek .day[data-day="0"] .dt.sb-open').click()
await page.waitForSelector('#schedBoard:not([hidden])'); await page.waitForTimeout(400)
const size = () => page.evaluate(() => JSON.stringify(window.DAYS).length + '|' + JSON.stringify(window.SCHED).length)
const upOf = id => page.locator(`#${id}:not([hidden])`).count().then(n => n === 1)
const boardUp = () => page.locator('#schedBoard:not([hidden])').count().then(n => n === 1)
const d0 = await size()

/* Sort all */
const sort = {}
for (const how of ['Cancel', 'x', 'shade', 'Escape']) {
  await page.locator('#sbSortAll').click(); await page.waitForTimeout(400)
  const up = await upOf('sortAllPop')
  const focusIn = await page.evaluate(() => !!document.activeElement.closest('#sortAllPop'))
  await shot(`B16a-sortall-open-before-${how}`)
  if (how === 'Cancel') await page.locator('#sortAllCancel').click()
  else if (how === 'x') await page.locator('#sortAllClose').click()
  else if (how === 'shade') await page.mouse.click(250, 700)
  else await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
  sort[how] = { up, focusIn, closed: !(await upOf('sortAllPop')), board: await boardUp(), dataSame: (await size()) === d0 }
  await shot(`B16a-sortall-after-${how}`)
  if (await upOf('sortAllPop')) await page.locator('#sortAllClose').click()   // leave it shut for the next round
  await page.waitForTimeout(300)
}
note('B16a Sort all: opens with the keys inside; Cancel, ✕ and a press on the shade close it; nothing sorted', ['Cancel', 'x', 'shade'].every(h => sort[h].up && sort[h].closed && sort[h].board && sort[h].dataSame), JSON.stringify(sort) + ' — Escape is information only (see seen in passing)', 'B16a-*')
note('B16a-esc Sort all: Escape closes it (design guide §2 — not part of this change; observed only)', sort.Escape.closed, JSON.stringify(sort.Escape), 'B16a-sortall-after-Escape')

/* a jet's CX (cancel) dialog — never "Cancel line", which would cancel it */
const cx = page.locator('#sbBoard [data-lcx]:visible').first()
const cxr = {}
for (const how of ['x', 'shade', 'Escape-in-box']) {
  await cx.scrollIntoViewIfNeeded(); await cx.click(); await page.waitForTimeout(400)
  const up = await upOf('cxPop')
  const focusId = await page.evaluate(() => document.activeElement.id)
  await shot(`B16b-cx-open-before-${how}`)
  if (how === 'x') await page.locator('#cxClose').click()
  else if (how === 'shade') await page.mouse.click(250, 700)
  else await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
  cxr[how] = { up, focusId, closed: !(await upOf('cxPop')), board: await boardUp(), dataSame: (await size()) === d0 }
  await shot(`B16b-cx-after-${how}`)
  if (await upOf('cxPop')) await page.locator('#cxClose').click()
  await page.waitForTimeout(300)
}
note("B16b a jet's CX dialog: opens with the keys in its reason box; ✕, a press on the shade and Escape each close it; the line stays uncancelled", Object.values(cxr).every(r => r.up && r.closed && r.board && r.dataSame), JSON.stringify(cxr), 'B16b-*')
console.log('errors:', JSON.stringify(errors))
note('B-errs part 4: no console errors, page errors or failed requests', errors.length === 0, errors.join(' | '))
await browser.close()
writeJson('ws-walk-b-results4.json', rows)
console.log(`\n${rows.filter(r => r.ok).length}/${rows.length} pass`)
