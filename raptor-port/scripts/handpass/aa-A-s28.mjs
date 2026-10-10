// S28 — "Several people" cannot turn a placeholder into a hidden group (phone 390x844, admin).
import { closeWins, world, closeAll, toInputs, openNew, setTimes, pic, T, oilAnswer, sleep, readInputs, observe, undoState } from './aa-A-lib.mjs'
const why = async page => page.locator(T('pp-why')).first().innerText().then(t => t.replace(/\s+/g, ' ')).catch(() => null)
for (const ph of ['allavail', 'all']) {
  const rm = 'walkS28 ' + ph
  const w = await world({ who: 'ad', size: 'p' })
  const page = w.page
  await toInputs(page)
  await openNew(page, '2026-07-18')
  await page.selectOption('#inpEditType', 'Duty'); await page.selectOption('#inpEditPerson', ph)
  const ad = page.locator('#inpEditAllday'); if (await ad.isChecked()) await ad.uncheck()
  await setTimes(page, '09:00', '12:00'); await page.fill('#inpEditRmk', rm)
  await page.locator('#inpEditPop ' + T('pp-several')).click(); await sleep(500)
  console.log(ph, 'Several on, placeholder picked -> line:', await why(page), '| fix button:', await page.locator(T('pp-fix')).first().innerText().catch(() => null))
  await pic(page, `s28-${ph}-1-several-on`)
  // pick P
  const pbtn = page.locator('#inpEditPop [data-pp="dj"]').first()
  console.log(ph, 'puck for Ace offered:', await pbtn.count())
  if (await pbtn.count()) { await pbtn.scrollIntoViewIfNeeded(); await pbtn.click(); await sleep(400) }
  console.log(ph, 'after picking Ace -> line:', await why(page))
  await pic(page, `s28-${ph}-2-picked-P`)
  const u0 = JSON.stringify(await undoState(page)); const n0 = (await page.evaluate(() => window.INPUTS.length))
  await page.locator('#inpEditSave').click(); await sleep(600)
  const ob = await observe(page)
  const asked = await page.locator(T('oilconf')).isVisible().catch(() => false)
  const n1 = await page.evaluate(() => window.INPUTS.length)
  console.log(ph, 'Save on mixed pick -> OIL question:', asked, '| screen messages:', JSON.stringify(ob.msgs), '| inputs before/after:', n0, n1, '| undo same:', u0 === JSON.stringify(await undoState(page)))
  await pic(page, `s28-${ph}-3-save-refused`)
  // the one correction
  const fix = page.locator(T('pp-fix')).first()
  if (await fix.count()) { console.log(ph, 'pp-fix text:', await fix.innerText()); await fix.click(); await sleep(500) }
  console.log(ph, 'after the fix -> line:', await why(page), '| several switch on?', await page.locator('#inpEditPop ' + T('pp-several')).getAttribute('aria-checked'), '| person box:', await page.evaluate(() => document.querySelector('#inpEditPop #inpEditPerson')?.selectedOptions[0]?.textContent))
  await pic(page, `s28-${ph}-4-after-fix`)
  await page.locator('#inpEditSave').click(); await sleep(600)
  const asked2 = await page.locator(T('oilconf')).isVisible().catch(() => false)
  console.log(ph, 'Save after the fix -> OIL question asked once:', asked2)
  if (asked2) await oilAnswer(page, 'yes')
  const recs = await readInputs(page, rm)
  console.log(ph, 'inputs now carrying the remark:', recs.length, JSON.stringify(recs.map(r => r.name)))
  await pic(page, `s28-${ph}-5-filed`)
  // named group, then replace with a placeholder
  await closeWins(page)
  await openNew(page, '2026-07-16')
  await page.selectOption('#inpEditType', 'Duty')
  await page.locator('#inpEditPop ' + T('pp-several')).click(); await sleep(400)
  for (const p of ['dj', 'shaft']) { const b = page.locator(`#inpEditPop [data-pp="${p}"]`).first(); await b.scrollIntoViewIfNeeded(); await b.click(); await sleep(200) }
  await page.fill('#inpEditRmk', rm + ' group')
  await page.locator('#inpEditSave').click(); await sleep(700)
  console.log(ph, 'named group filed:', JSON.stringify((await readInputs(page, rm + ' group')).map(r => r.name)))
  await closeWins(page)
  // reopen the group: what can be done about a placeholder?
  await openNewCheck(page, rm + ' group', ph)
  console.log(ph, 'errs', JSON.stringify(w.errs))
  await w.ctx.close()
}
async function openNewCheck(page, rm, ph) {
  await page.locator('#inpCal [data-icday="2026-07-16"]').click({ position: { x: 8, y: 8 } }); await sleep(500)
  const bar = page.locator('[data-testid="win-inputsday"] [data-iid]').first()
  await bar.click({ timeout: 4000 }).catch(e => console.log('open group bar failed')); await sleep(700)
  await pic(page, `s28-${ph}-6-group-editor`)
  const info = await page.evaluate(() => { const p = document.querySelector('#inpEditPop'); if (!p) return null; return { text: p.innerText.replace(/\s+/g, ' ').slice(0, 400), phPucks: [...p.querySelectorAll('[data-pp="allavail"],[data-pp="all"]')].length, personSel: !!p.querySelector('#inpEditPerson'), phOptions: [...p.querySelectorAll('option[value=allavail], option[value=all]')].length } })
  console.log(ph, 'group editor offers a placeholder?', JSON.stringify(info))
}
await closeAll()
