// S3 — answer-only change by the filer (member), issued by admin; Changes window, Undo wording, replay check.
import { world, closeAll, toInputs, fileInput, listAll, listSearch, listRow, pic, T, oilAnswer, issue, lwMap, crowdCount, switchUser, undoState, observe, sleep, readInputs } from './aa-A-lib.mjs'
import * as L from './lib.mjs'
const rows = []
for (const ph of ['allavail', 'all']) {
  const rm = 'walkS3 ' + ph
  const w = await world({ who: 'us', size: 'd' })
  const { page } = w
  await toInputs(page)
  const r = await fileInput(page, { iso: '2026-07-18', type: 'Duty', person: ph, remarks: rm, start: '09:00', end: '12:00', oil: 'yes' })
  let rec = (await readInputs(page, rm))[0]
  console.log(ph, 'member filed', JSON.stringify(rec), r)
  await pic(page, `s03-${ph}-1-member-filed`)
  await switchUser(page, 'ad')
  console.log(ph, 'ORIG', JSON.stringify(await issue(page, 5)))
  let m = await lwMap(page); console.log(ph, 'credits after ORIG', crowdCount(m))
  await switchUser(page, 'us')
  await toInputs(page); await listAll(page)
  await page.selectOption('#inFPerson', 'all'); await page.waitForTimeout(300)
  await listSearch(page, rm)
  await pic(page, `s03-${ph}-2-member-list`)
  // the filer changes only the OIL answer to No
  await listRow(page, rm).locator('.roil').click(); await page.waitForTimeout(500)
  await pic(page, `s03-${ph}-3-oil-question`)
  console.log(ph, 'oil q', JSON.stringify((await observe(page)).wins))
  await oilAnswer(page, 'no')
  rec = (await readInputs(page, rm))[0]
  console.log(ph, 'after answer No', JSON.stringify(rec.oil))
  const u = await undoState(page)
  console.log(ph, 'undo description (member):', JSON.stringify(u))
  await pic(page, `s03-${ph}-4-answered-no`)
  // replay check, member side
  await page.locator('#undoBtn').click(); await sleep(700)
  rec = (await readInputs(page, rm))[0]; console.log(ph, 'after Undo oil', JSON.stringify(rec.oil), 'redo title', (await undoState(page)).redoTitle)
  await pic(page, `s03-${ph}-5-undone`)
  await page.locator('#redoBtn').click(); await sleep(700)
  rec = (await readInputs(page, rm))[0]; console.log(ph, 'after Redo oil', JSON.stringify(rec.oil))
  await page.reload(); await sleep(800)
  if (await page.locator('#luser').count()) await (await import('./aa-A-lib.mjs')).signIn(page, 'us')
  rec = (await readInputs(page, rm))[0]; console.log(ph, 'after reload oil', JSON.stringify(rec.oil))
  // admin side: Changes window
  await switchUser(page, 'ad')
  await L.go(page, 'editsched'); await sleep(600)
  const c = page.locator(`#eWeek .day[data-day="5"] .dpend`).first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(300)
  console.log(ph, 'day count says:', (await c.innerText()).replace(/\s+/g, ' '))
  await c.click(); await sleep(700)
  const readWin = () => page.evaluate(() => { const w = document.querySelector('.chgwin:not([hidden])'); if (!w) return null; return { tabs: [...w.querySelectorAll('.win-tab')].map(t => t.innerText.replace(/\s+/g, ' ').trim()), text: w.innerText.replace(/\s+/g, ' ').slice(0, 900) } })
  console.log(ph, 'To go out (default):', JSON.stringify(await readWin()))
  await pic(page, `s03-${ph}-6-changes-default`)
  for (const name of ['All changes', 'To go out']) {
    const t = page.locator('.chgwin:not([hidden]) .win-tab', { hasText: name }).first()
    if (await t.count()) { await t.click(); await sleep(400); console.log(ph, name, JSON.stringify(await readWin())); await pic(page, `s03-${ph}-7-${name.replace(' ', '')}`) }
  }
  // credits stay
  const x = page.locator('.chgwin:not([hidden]) .win-x').first(); if (await x.count()) await x.click().catch(() => {})
  m = await lwMap(page); console.log(ph, 'credits BEFORE AL (should stay):', crowdCount(m))
  console.log(ph, 'AL1', JSON.stringify(await issue(page, 5)))
  m = await lwMap(page); console.log(ph, 'credits AFTER AL (answer No):', crowdCount(m))
  await pic(page, `s03-${ph}-8-after-al`)
  console.log('errs', JSON.stringify(w.errs))
  await w.ctx.close()
}
await closeAll()
