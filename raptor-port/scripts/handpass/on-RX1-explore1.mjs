import * as L from './on-RX1-lib.mjs'
const W = await L.world({ tag: 'x1' })
const { page, tid, shot } = W
const iid = await L.fileIt(W, L.SAT, { type: 'OD', people: ['bane'] })
console.log('OD', await L.recOf(page, iid))
await L.plainRow(W, L.SAT_DI, 0, 'Hangar open day', '13:00', '15:00', ['rocky'])
console.log('ground', await L.groundNow(page))
// board: look for issues
const dump = async (label) => console.log(label, JSON.stringify(await page.evaluate(() => {
  const out = {}
  const sb = document.querySelector('#schedBoard')
  out.boardVisible = !!(sb && sb.getClientRects().length)
  const cand = [...document.querySelectorAll('*')].filter(e => e.getClientRects().length && !e.children.length && /issue|warning|conflict/i.test(e.textContent) && e.textContent.length < 80)
  out.texts = cand.slice(0, 20).map(e => (e.id || '') + '.' + String(e.className).slice(0, 30) + ' :: ' + e.textContent.trim())
  return out
})))
await dump('BOARD')
await L.closeBoard(W)
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
await L.frameGrnd(page)
await dump('WEEK')
const day = await page.evaluate((di) => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; return d.querySelector('.dstat') ? d.querySelector('.dstat').outerHTML.slice(0, 600) : 'nodstat' }, L.SAT_DI)
console.log('dstat', day)
await shot('x1-week')
console.log('errors', W.errors)
await W.ctx.close(); process.exit(0)
