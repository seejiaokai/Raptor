/* d-13-probe-simchip v1 — probe: an OFT sim row with ALL AVAIL in the front seat; what a press on its count does on the board (desktop). */
const KIND = process.argv[2] || 'pc'
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-13-rules-check-small-batch/d2028/probe-simchip-' + KIND
console.log('d-13 v1', KIND)
const D = await import('./d-lib.mjs')
const { X, L, sleep, j, FRI } = D
const w = await D.world(KIND)
const { page } = w
await L.board(page, FRI)
const n0 = await page.evaluate(i => window.DAYS[i].sims.oft.length, FRI)
await X.press(w, `[data-sradd="${FRI}.oft"]`)
await page.waitForFunction(([i, n]) => window.DAYS[i].sims.oft.length === n + 1, [FRI, n0]); await sleep(300)
await X.typeIn(w, `[data-bfld="sr:${FRI}.oft.${n0}.label"]`, 'OFT Brief')
await X.typeIn(w, `[data-bfld="sr:${FRI}.oft.${n0}.str"]`, '0900')
console.log('drop', await D.drop(w, `s:${FRI}.oft.${n0}.p`, 'allavail'))
await sleep(500)
await page.evaluate(() => { const a = window.ARM; console.log('arm', a && a.key) })
console.log('ARM after drop', await page.evaluate(() => window.ARM && window.ARM.key))
const chip = page.locator('#schedBoard .oilcount:visible').first()
console.log('chip html', await chip.evaluate(e => e.outerHTML + ' || parent: ' + e.parentElement.outerHTML.slice(0, 400)))
const b = await chip.boundingBox()
console.log('chip box', j(b))
await D.shot(page, 'p-0-before-press')
await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(900)
console.log('after press: win up', await page.evaluate(() => !![...document.querySelectorAll('.win-bar')].find(e => e.offsetWidth)), 'ARM', await page.evaluate(() => window.ARM && window.ARM.key))
await D.shot(page, 'p-1-after-press')
await page.keyboard.press('Escape'); await sleep(500)
console.log('ARM after Esc', await page.evaluate(() => window.ARM && window.ARM.key))
// a second press
const b2 = await page.locator('#schedBoard .oilcount:visible').first().boundingBox()
await page.mouse.click(b2.x + b2.width / 2, b2.y + b2.height / 2); await sleep(900)
console.log('after 2nd press: win up', await page.evaluate(() => !![...document.querySelectorAll('.win-bar')].find(e => e.offsetWidth)), 'ARM', await page.evaluate(() => window.ARM && window.ARM.key))
await D.shot(page, 'p-2-after-second-press')
await w.browser.close()
