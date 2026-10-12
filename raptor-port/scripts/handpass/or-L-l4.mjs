import { open, fileInput, toWeek, shot, saveRes, errs, browser, toast, inputsOf, weekRows, undoRedo, become, bellRead, bellPress, bellState, bellList, dragOntoRow } from './or-L-lib.mjs'
const R = {}
async function variant(tag, markFirst) {
  const V = {}
  const { ctx, page } = await open('ad', 'a')
  V.filed = await fileInput(page, { type: 'Training', person: 'Ranger', from: '2026-07-15', to: '2026-07-15', timed: ['10:00', '11:00'], title: 'L4 training' })
  if (markFirst) {
    await become(page, 'Ranger', 'member')
    await bellPress(page); await page.locator('[data-testid="bell-markall"]').click(); await page.waitForTimeout(400); await bellPress(page).catch(() => {})
    V.afterMarkAll = await bellState(page)
    await page.keyboard.press('Escape')
    await become(page, 'Saber', 'admin')
  }
  V.addToast = await dragOntoRow(page, 'Hex', 'L4 TRAINING')
  V.inputs1 = (await inputsOf(page, 'L4 training')).map(r => r.people)
  await become(page, 'Ranger', 'member')
  V.A_beforeTap = await bellRead(page, `l4${tag}-1-list`, { keepOpen: true })
  const first = page.locator('.bell-list .bl-line', { hasText: 'added' }).first()
  await page.locator('.bell-list .bl-line').filter({ hasText: /Hex added/ }).first().click(); await page.waitForTimeout(700)
  V.tapOpenedWindow = { win: await page.locator('#inpEditPop:visible').count(), title: await page.locator('#inpEditPop #inpEditOwnTitle').first().inputValue().catch(() => null), listOpen: await page.locator('.bell-list').count() }
  await shot(page, `l4${tag}-2-window`)
  const x = page.locator('#inpEditClose:visible, #inpEditCancel:visible').first(); if (await x.count()) await x.click()
  await page.waitForTimeout(300)
  V.B_afterRead = await bellRead(page, `l4${tag}-3-after-read`)
  await become(page, 'Saber', 'admin'); await toWeek(page)
  V.undo = await undoRedo(page, 'undo')
  V.peopleAfterUndo = (await inputsOf(page, 'L4 training')).map(r => r.people)
  await become(page, 'Ranger', 'member')
  V.C_afterUndo = await bellRead(page, `l4${tag}-4-after-undo`)
  await become(page, 'Saber', 'admin'); await toWeek(page)
  V.redo = await undoRedo(page, 'redo')
  V.peopleAfterRedo = (await inputsOf(page, 'L4 training')).map(r => r.people)
  await become(page, 'Ranger', 'member')
  V.D_afterRedo = await bellRead(page, `l4${tag}-5-after-redo`)
  await ctx.close()
  return V
}
R.v1_asis = await variant('a', false)
R.v2_markedReadFirst = await variant('b', true)
saveRes('L4', R)
console.log(JSON.stringify(R, null, 1))
console.log('ERRS', errs.join('\n'))
await browser.close()
