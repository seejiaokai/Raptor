// S50 — a named group Event keeps its member controls; a placeholder Event gives a crowd member none (admin files, member Ranger opens; desktop).
import { closeWins, world, closeAll, toInputs, openNew, openDay, setTimes, pic, T, oilAnswer, sleep, readInputs, observe, switchUser, setPerson } from './aa-A-lib.mjs'
for (const ph of ['allavail', 'all']) {
  const w = await world({ who: 'ad', size: 'd' })
  const page = w.page
  await toInputs(page)
  // named group Event: Ranger (bane), Ace (dj), Anvil (shaft) on Sat 18 Jul, answered Yes
  await openNew(page, '2026-07-18')
  await page.selectOption('#inpEditType', 'Event')
  await page.locator('#inpEditPop ' + T('pp-several')).click(); await sleep(400)
  for (const p of ['bane', 'dj', 'shaft']) { const b = page.locator(`#inpEditPop [data-pp="${p}"]`).first(); await b.scrollIntoViewIfNeeded(); if ((await b.getAttribute('aria-pressed')) !== 'true') await b.click(); await sleep(150) }
  { const a = page.locator('#inpEditAllday'); if (await a.isChecked()) await a.uncheck() }
  await setTimes(page, '09:00', '12:00'); await page.fill('#inpEditRmk', 'walkS50 group')
  await page.locator('#inpEditSave').click(); await sleep(700)
  await oilAnswer(page, 'yes')
  console.log(ph, 'group filed for', JSON.stringify((await readInputs(page, 'walkS50 group')).map(r => r.name)))
  await closeWins(page)
  // placeholder Event, otherwise identical
  await openNew(page, '2026-07-18')
  await page.selectOption('#inpEditType', 'Event'); await page.selectOption('#inpEditPerson', ph)
  { const a = page.locator('#inpEditAllday'); if (await a.isChecked()) await a.uncheck() }
  await setTimes(page, '09:00', '12:00'); await page.fill('#inpEditRmk', 'walkS50 placeholder')
  await page.locator('#inpEditSave').click(); await sleep(700)
  await oilAnswer(page, 'yes')
  await closeWins(page)
  // the member opens both
  await switchUser(page, 'us'); await toInputs(page); await setPerson(page, 'all')
  await openDay(page, '2026-07-18')
  await pic(page, `s50-${ph}-1-member-day`)
  const dayText = (await page.locator('[data-testid="win-inputsday"]').innerText()).replace(/\s+/g, ' ')
  console.log(ph, 'MEMBER day card:', dayText.slice(0, 500))
  const open = async txt => { await page.locator('[data-testid="win-inputsday"] .sd-row').filter({ hasText: txt }).locator('.sd-open').first().click(); await sleep(700) }
  const inspect = async () => page.evaluate(() => { const p = document.querySelector('#inpEditPop'); if (!p) return null; const btn = [...p.querySelectorAll('button')].filter(b => b.offsetParent).map(b => b.innerText.trim()).filter(Boolean); return { buttons: btn, save: !!p.querySelector('#inpEditSave'), del: !!p.querySelector('#inpEditDel'), takeMeOut: !!p.querySelector('[data-testid="inped-takeout-ask"]'), ownAnswer: btn.filter(t => /Change|answer|OIL/i.test(t)), text: p.innerText.replace(/\s+/g, ' ').slice(0, 420) } })
  await open('walkS50 group')
  const g = await inspect(); console.log(ph, 'MEMBER opens the NAMED GROUP Event:', JSON.stringify(g))
  await pic(page, `s50-${ph}-2-member-group-editor`)
  await closeWins(page); await openDay(page, '2026-07-18')
  await open('walkS50 placeholder')
  const p2 = await inspect(); console.log(ph, 'MEMBER opens the PLACEHOLDER Event:', JSON.stringify(p2))
  await pic(page, `s50-${ph}-3-member-placeholder-editor`)
  console.log(ph, 'errs', JSON.stringify(w.errs))
  await w.ctx.close()
}
await closeAll()
