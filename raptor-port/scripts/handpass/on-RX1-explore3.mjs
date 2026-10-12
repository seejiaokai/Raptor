import * as L from './on-RX1-lib.mjs'
const W = await L.world({ tag: 'x3' })
const { page, tid, shot } = W
const iid = await L.fileIt(W, L.SAT, { type: 'OD', people: ['bane'] })
await L.plainRow(W, L.SAT_DI, 0, 'Hangar open day', '13:00', '15:00', ['rocky'])
await L.closeBoard(W); await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
await L.frameGrnd(page)
const bar = page.locator(`#eWeek [data-daywarn="5"]`)
console.log('bar', await bar.innerText())
await bar.click(); await page.waitForTimeout(500)
console.log('after click', JSON.stringify(await page.evaluate((di) => {
  const root = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]
  const dw = root.querySelector('.daywarn')
  const box = root.querySelector('.dwbox')
  return { dwhtml: dw.outerHTML.slice(0, 400), next: dw.nextElementSibling && dw.nextElementSibling.outerHTML.slice(0, 1500), boxhtml: box && box.outerHTML.slice(0, 1500) }
}, L.SAT_DI)))
await shot('x3-open')
console.log('errors', W.errors)
await W.ctx.close(); process.exit(0)
