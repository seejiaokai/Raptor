// S1 issue half: Original (placeholder/Yes) -> AL (named P/No) -> AL (placeholder/Yes); read Leave War credits after each.
import { world, closeAll, toInputs, fileInput, listAll, listSearch, pencil, pic, T, oilAnswer, PE, PSAVE, issue, lwMap, crowdCount } from './aa-A-lib.mjs'
const rows = []
for (const ph of ['allavail', 'all']) {
  const rm = 'walkS1c ' + ph
  const w = await world({ who: 'ad', size: 'd' })
  const { page } = w
  await toInputs(page)
  await fileInput(page, { iso: '2026-07-18', type: 'Duty', person: ph, remarks: rm, start: '09:00', end: '12:00', oil: 'yes' })
  console.log(ph, 'ORIG', JSON.stringify(await issue(page, 5)))
  let m = await lwMap(page); console.log(ph, 'after ORIG: credited', crowdCount(m), 'Ace=', m['Ace'], 'Ranger=', m['Ranger'])
  await pic(page, `s01c-${ph}-1-orig`)
  rows.push({ ph, step: 'orig', n: crowdCount(m), ace: m['Ace'] })
  await toInputs(page); await listAll(page); await listSearch(page, rm)
  await pencil(page, rm); await page.selectOption(PE, 'dj'); await page.locator(PSAVE).click(); await page.waitForTimeout(500)
  await oilAnswer(page, 'no')
  console.log(ph, 'AL1', JSON.stringify(await issue(page, 5)))
  m = await lwMap(page); console.log(ph, 'after AL1 (named Ace / No): credited', crowdCount(m), 'Ace=', m['Ace'], 'Ranger=', m['Ranger'])
  await pic(page, `s01c-${ph}-2-al1-named-no`)
  rows.push({ ph, step: 'al1-named-no', n: crowdCount(m), ace: m['Ace'] })
  await toInputs(page); await listAll(page); await listSearch(page, rm)
  await pencil(page, rm); await page.selectOption(PE, ph); await page.locator(PSAVE).click(); await page.waitForTimeout(500)
  await oilAnswer(page, 'yes')
  console.log(ph, 'AL2', JSON.stringify(await issue(page, 5)))
  m = await lwMap(page); console.log(ph, 'after AL2 (placeholder / Yes): credited', crowdCount(m), 'Ace=', m['Ace'], 'Ranger=', m['Ranger'])
  await pic(page, `s01c-${ph}-3-al2-placeholder-yes`)
  rows.push({ ph, step: 'al2-ph-yes', n: crowdCount(m), ace: m['Ace'] })
  console.log('errs', JSON.stringify(w.errs))
  await w.ctx.close()
}
console.log(JSON.stringify(rows))
await closeAll()
