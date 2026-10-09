const C = await import('./aa-C-lib.mjs')
const { world, fileInput, rec, shot, board, signDay, pubSat, sleep, go, L } = C
// baseline: no input, publish Saturday
{
  const w = await world(); const { page } = w
  const p = await pubSat(page, 5)
  console.log('BASE pub', JSON.stringify(p), JSON.stringify(await C.head(page, 5)))
  await w.browser.close()
}
// with an input filed, then publish
{
  const w = await world(); const { page } = w
  await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', s: '09:00', e: '12:00', rmk: 'S4 duty', oil: 'yes' })
  await go(page, 'editsched'); await sleep(400)
  const p = await pubSat(page, 5)
  console.log('WITH pub', JSON.stringify(p), JSON.stringify(await C.head(page, 5)))
  await C.closeBoard(page); await go(page, 'editsched'); await sleep(500)
  console.log('week head', JSON.stringify(await C.head(page, 5)))
  const b = page.locator('#eWeek [data-pendlist="5"]:visible').first()
  if (await b.count()) { await b.click(); await sleep(400); console.log('pendlist', await page.evaluate(() => document.querySelector('#pendList')?.innerText.replace(/\s+/g, ' '))); await shot(page, 'probe2-pendlist') }
  await w.browser.close()
}
