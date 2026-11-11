/* rcf-w3 S23b v1 — can "TBD" be typed into the landing box? board and week */
const W = await import('./rcf-w3-lib.mjs')
const { L, say, check } = W
console.log('rcf-w3-s23b v1', W.SHOTS)
const { browser, page, errors } = await W.openWorld()
await L.board(page, 4)
const wi = await W.addWave(page, 4)
await W.setF(page, `ff:4.${wi}.0.to`, '19:30')
const box = page.locator(`#schedBoard [data-bfld="ff:4.${wi}.0.ld"]:visible`).first()
await box.scrollIntoViewIfNeeded()
await box.click(); await page.keyboard.type('TBD', { delay: 40 })
say('board: while typing, the box reads', JSON.stringify(await box.inputValue()))
await L.shot(page, 'board-typing-tbd')
await page.keyboard.press('Enter'); await page.waitForTimeout(500)
say('board: after Enter, box', JSON.stringify(await box.inputValue()), 'stored', JSON.stringify(await page.evaluate(([d, w]) => window.DAYS[d].waves[w].formations[0].ld, [4, wi])))
const toasts = await page.evaluate(() => [...document.querySelectorAll('[role=status], .toast, #toast, .note, [class*=toast]')].filter(e => e.offsetWidth > 0).map(e => e.innerText.trim()).slice(0, 5))
say('notes on screen:', JSON.stringify(toasts))
await L.shot(page, 'board-after-tbd')
// try other words
for (const w of ['TBC', 'N/A', 'xx', '-']) {
  await box.click(); await page.keyboard.press('Control+a'); await page.keyboard.type(w, { delay: 30 }); await page.keyboard.press('Enter'); await page.waitForTimeout(400)
  say(`typed ${w}: box`, JSON.stringify(await box.inputValue()), 'stored', JSON.stringify(await page.evaluate(([d, w]) => window.DAYS[d].waves[w].formations[0].ld, [4, wi])))
}
// the edit week's own box
await L.closeBoard(page)
await L.go(page, 'editsched')
const wk = page.locator(`#eWeek [data-txt="ff:4.${wi}.0.ld"]:visible`).first()
say('week landing box present:', await wk.count())
if (await wk.count()) {
  await wk.scrollIntoViewIfNeeded(); await wk.click(); await page.keyboard.type('TBD', { delay: 40 }); await page.keyboard.press('Enter'); await page.waitForTimeout(500)
  say('week: stored', JSON.stringify(await page.evaluate(([d, w]) => window.DAYS[d].waves[w].formations[0].ld, [4, wi])), 'text', JSON.stringify(await wk.textContent()))
  await L.shot(page, 'week-after-tbd')
}
say('errors', JSON.stringify(errors))
await browser.close()
