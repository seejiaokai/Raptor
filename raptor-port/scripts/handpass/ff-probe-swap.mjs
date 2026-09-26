/* [CROWD-SWAP-SAYS-BUSY] probe (26 Sep 26, the five-flags batch): reproduce the "already on <this row>" toast
   a man gets when he is moved INSIDE the Common Programme crowd he is already on. Drives the production build.
   Usage (from raptor-port/, a preview serving dist/): HP_URL=http://localhost:4176 node scripts/handpass/ff-probe-swap.mjs */
process.env.HP_SHOTS = process.env.HP_SHOTS || 'C:/Users/User/AppData/Local/Temp/ff-probe'
const L = await import('./am/w1-lib.mjs')
const { open, board, toastSpy, toasts } = L

const { browser, page, errors } = await open({ width: 1440, height: 900 })
await toastSpy(page)
const MON = 0
const FREE = await page.evaluate(() => { const j = JSON.stringify(window.DAYS[0]); return Object.keys(window.PEOPLE).filter(k => !j.includes('"' + k + '"') && !/^ALL/i.test(k) && !window.PEOPLE[k].pers) })
await board(page, MON)
async function putAt(fill, pid) {
  const z = page.locator(`#schedBoard [data-fill="${fill}"] .addz:visible`).first()
  await z.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(200)
  const b = await z.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(300)
  const p = page.locator(`#sbRoster .rpuck[data-person="${pid}"]:visible`).first()
  await p.evaluate(e => e.scrollIntoView({ block: 'center' })); await p.click(); await page.waitForTimeout(400)
}
for (const pid of FREE.slice(0, 3)) await putAt(`a:${MON}.2.+`, pid)
console.log('crowd', JSON.stringify(await page.evaluate(() => window.DAYS[0].allhands[2].who)), 'toasts so far', JSON.stringify(await toasts(page)))
async function drag(fromSel, toSel) {
  const src = page.locator(fromSel).first(), dst = page.locator(toSel).first()
  await src.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250)
  const a = await src.boundingBox(), b = await dst.boundingBox()
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down()
  await page.mouse.move(a.x + a.width / 2 + 6, a.y + a.height / 2 + 6, { steps: 3 })
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 })
  const hover = await page.evaluate(() => (document.querySelector('.dragwhy, .hoverwhy, [class*="why"]') || {}).textContent || '')
  await page.waitForTimeout(120); await page.mouse.up(); await page.waitForTimeout(800)
  return hover
}
/* 1: the last man onto the first man's puck (the swap branch) */
const h1 = await drag(`#schedBoard [data-slot="a:${MON}.2.2"] .puck:visible`, `#schedBoard [data-slot="a:${MON}.2.0"]:visible`)
console.log('SWAP  crowd', JSON.stringify(await page.evaluate(() => window.DAYS[0].allhands[2].who)), 'hover', JSON.stringify(h1), 'toasts', JSON.stringify(await toasts(page)))
/* 2: the first man onto the crowd's own "+ add" cell (the move-to-the-end branch) */
const h2 = await drag(`#schedBoard [data-slot="a:${MON}.2.0"] .puck:visible`, `#schedBoard [data-fill="a:${MON}.2.+"] .addz:visible`)
console.log('MOVE  crowd', JSON.stringify(await page.evaluate(() => window.DAYS[0].allhands[2].who)), 'hover', JSON.stringify(h2), 'toasts', JSON.stringify(await toasts(page)))
console.log('errors', JSON.stringify(errors))
await browser.close()
