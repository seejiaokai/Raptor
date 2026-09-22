import { open, board, type, STATE } from './lib.mjs'
const di = 5
const { browser, page } = await open({ state: STATE })
await board(page, di)
await type(page, `[data-bfld="ff:${di}.0.0.ld"]`, '10:00')
await page.waitForTimeout(800)
const found = await page.evaluate(() => {
  const hits = []
  for (const e of document.querySelectorAll('*')) {
    const t = (e.textContent||'')
    if (!/takes off and lands at the same time/.test(t)) continue
    if (e.children.length > 2) continue
    hits.push({ tag:e.tagName, cls:e.className.slice(0,60), d:JSON.stringify(e.dataset),
      vis:e.offsetParent!==null, parent:e.parentElement?e.parentElement.tagName+'.'+e.parentElement.className.slice(0,40)+' '+JSON.stringify(e.parentElement.dataset):'-',
      gp:e.parentElement&&e.parentElement.parentElement?e.parentElement.parentElement.tagName+'.'+e.parentElement.parentElement.className.slice(0,40)+' '+JSON.stringify(e.parentElement.parentElement.dataset):'-' })
  }
  return hits
})
console.log(JSON.stringify(found, null, 1))
await browser.close()
