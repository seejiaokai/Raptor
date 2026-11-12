/* rcsb-w2-probe6 v1 — W2: what does the landing box do with "TBD" typed (board and Edit Schedule's week), and what is stored? */
const C = await import('./rcsb-w2-common.mjs')
C.setShots('probe6')
console.log('rcsb-w2-probe6 v1', process.env.HP_SHOTS)
const Q = await C.load()
const { R, X, L, sleep } = Q
const w = await R.world('pc')
const { page } = w
const MON = 0
await L.board(page, MON)
const gm = await X.addWave(w, MON, '')
await X.typeIn(w, `[data-bfld="ff:${MON}.${gm}.0.to"]`, '12:00')
const box = page.locator(`#schedBoard [data-bfld="ff:${MON}.${gm}.0.ld"]:visible`).first()
const st = () => page.evaluate(([d, g]) => window.DAYS[d].waves[g].formations[0].ld, [MON, gm])
for (const how of ['type+blur', 'type+Enter', 'type+Tab']) {
  await box.scrollIntoViewIfNeeded(); await box.click(); await page.keyboard.press('Control+a'); await page.keyboard.type('TBD', { delay: 40 })
  console.log(how, 'while typing box', C.j(await box.inputValue()))
  await R.shot(page, 'p6-typing-' + how.replace(/\W/g, ''))
  if (how === 'type+blur') await box.blur(); else if (how === 'type+Enter') await page.keyboard.press('Enter'); else await page.keyboard.press('Tab')
  await sleep(600)
  console.log(how, 'after: box', C.j(await box.inputValue()), 'stored', C.j(await st()))
  await R.shot(page, 'p6-after-' + how.replace(/\W/g, ''))
}
// the week's own box
await L.closeBoard(page)
await L.go(page, 'editsched'); await sleep(600)
const wk = page.locator(`#eWeek [data-txt="ff:${MON}.${gm}.0.ld"]:visible`).first()
console.log('week landing box', await wk.count())
if (await wk.count()) {
  await wk.scrollIntoViewIfNeeded(); await wk.click(); await page.keyboard.type('TBD', { delay: 40 }); await page.keyboard.press('Enter'); await sleep(600)
  console.log('week: stored', C.j(await st()), 'text', C.j(await wk.textContent()))
  await R.shot(page, 'p6-week-after-tbd')
}
console.log('errors', C.j(w.errors))
await w.browser.close()
