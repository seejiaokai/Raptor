import { open, go, version, shot } from './kbs-A-lib.mjs'
version('explore1')
const { browser, page, errors } = await open()
await go(page, 'editsched')
await page.evaluate(() => window.openScheduler(0))
await page.waitForSelector('#schedBoard')
await page.waitForTimeout(800)
const info = await page.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  const ins = [...b.querySelectorAll('input,textarea')].filter(e => e.offsetParent !== null)
  return ins.slice(0, 80).map((e, i) => ({ i, tag: e.tagName, cls: String(e.className).slice(0, 40), ph: e.placeholder, val: e.value.slice(0, 20), top: Math.round(e.getBoundingClientRect().top), h: Math.round(e.getBoundingClientRect().height), w: Math.round(e.getBoundingClientRect().width) }))
})
console.log(JSON.stringify(info, null, 0))
const scs = await page.evaluate(() => {
  const out = []
  document.querySelectorAll('#schedBoard *').forEach(n => { const o = getComputedStyle(n).overflowY; if ((o === 'auto' || o === 'scroll') && n.scrollHeight > n.clientHeight + 1) out.push((n.id || String(n.className).slice(0, 40)) + ' ' + n.scrollHeight + '/' + n.clientHeight) })
  return out
})
console.log('scrollers', scs)
await shot(page, 'explore1-board')
console.log('errors', errors)
await browser.close()
