/* Walker A2 — a survey of the world before the walk (read only): the Leave War's wars, stage, bidding window, where it
   opens, Ranger's row, and what a tap on a July day opens for the admin and for Ranger. */
import './cr-a2-env.mjs'
const L = await import('./cr-a2-lib.mjs')
const { openA2, lwOpen, tapCell, sheetNow, closeSheets, warPick, stageNow, go, elogTail, signOut, signIn, doorState } = L
const { browser, page, errors } = await openA2('a')
await go(page, 'leavewar')
await page.waitForSelector('[data-testid^="row-"]', { timeout: 15000 }); await page.waitForTimeout(800)
console.log('wars', JSON.stringify(await warPick(page)))
console.log('stage', await stageNow(page))
console.log('window', await page.locator('[data-testid="bid-window"]').first().innerText().catch(() => 'none'))
console.log('ids', JSON.stringify(await page.evaluate(() => { const P = window.PEOPLE; return ['bane', 'freak', 'divot', 'xray', 'shrek', 'mamba', 'casper', 'pump', 'hex'].map(i => i + '=' + (P[i] ? P[i].cs : '?')) })))
console.log('me', await page.evaluate(() => { const P = window.PEOPLE; return Object.keys(P).filter(k => /saber|ranger/i.test(P[k].cs)).map(k => k + '=' + P[k].cs) }))
console.log('lw doors', JSON.stringify(await doorState(page, 'lw')))
for (const iso of ['2026-07-15', '2026-01-07', '2026-10-07']) {
  await lwOpen(page, iso)
  const t = await tapCell(page, 'bane', iso)
  console.log('admin tap bane', iso, t.open, (t.text || '').slice(0, 200), JSON.stringify(t.buttons || []).slice(0, 400))
  await closeSheets(page)
}
console.log('elog', JSON.stringify(await elogTail(page, 3)))
await signOut(page); await signIn(page, 'm')
console.log('member lw doors', JSON.stringify(await (async () => { await go(page, 'leavewar'); await page.waitForTimeout(800); return doorState(page, 'lw') })()))
for (const iso of ['2026-07-15', '2026-01-07']) {
  await lwOpen(page, iso)
  const t = await tapCell(page, 'bane', iso)
  console.log('member tap bane', iso, t.open, (t.text || '').slice(0, 200), JSON.stringify(t.buttons || []).slice(0, 400))
  await closeSheets(page)
}
console.log('errors', errors)
await browser.close()
