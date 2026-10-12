import * as L from './on-RX1-lib.mjs'
const W = await L.world({ tag: 'x2' })
const { page, tid, shot } = W
const iid = await L.fileIt(W, L.SAT, { type: 'OD', people: ['bane'] })
await L.plainRow(W, L.SAT_DI, 0, 'Hangar open day', '13:00', '15:00', ['rocky'])
const info = async (label) => console.log(label, JSON.stringify(await page.evaluate((di) => {
  const out = {}
  const root = document.querySelector('#sbBoard') && document.querySelector('#sbBoard').getClientRects().length ? document.querySelector('#schedBoard') : [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]
  out.root = root.id || root.className
  const els = [...root.querySelectorAll('*')].filter(e => /issue/i.test(e.textContent) && e.textContent.length < 40 && e.getClientRects().length)
  out.els = els.map(e => e.tagName + '#' + e.id + '.' + String(e.className).slice(0, 40) + ' [' + [...e.attributes].map(a => a.name + '=' + a.value.slice(0, 30)).join(' ') + '] ' + e.textContent.trim())
  return out
}, L.SAT_DI)))
await info('BOARD')
await L.closeBoard(W); await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
await L.frameGrnd(page)
await info('WEEK')
// the day's warning area: find the element in day 5 with warn rows
console.log('rings', JSON.stringify(await page.evaluate((di) => {
  const root = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]
  return [...root.querySelectorAll('.puck')].map(p => p.querySelector('.nm').textContent + ' | ' + p.className + ' | ' + getComputedStyle(p).boxShadow + ' | ' + getComputedStyle(p).outlineColor + ' ' + getComputedStyle(p).outlineStyle)
}, L.SAT_DI)))
console.log('daywarn', JSON.stringify(await page.evaluate((di) => {
  const root = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]
  return [...root.querySelectorAll('[class*=warn],[class*=wrn],[class*=issue],[class*=wl]')].map(e => e.tagName + '.' + String(e.className).slice(0, 40) + ' :: ' + e.textContent.replace(/\s+/g, ' ').slice(0, 100))
}, L.SAT_DI)))
await W.ctx.close(); process.exit(0)
