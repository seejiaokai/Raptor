import { open, go, version, shot } from './kbs-A-lib.mjs'
version('explore2')
const { browser, page } = await open()
await go(page, 'editsched')
const info = await page.evaluate(() => {
  const root = document.querySelector('#vWeek') || document.body
  const ins = [...root.querySelectorAll('input,textarea')].filter(e => e.offsetParent !== null)
  return ins.slice(0, 60).map((e, i) => ({ i, tag: e.tagName, cls: String(e.className).slice(0, 30), ph: e.placeholder, top: Math.round(e.getBoundingClientRect().top), left: Math.round(e.getBoundingClientRect().left), w: Math.round(e.getBoundingClientRect().width) }))
})
console.log(info.map(x => JSON.stringify(x)).join('\n'))
const sc = await page.evaluate(() => { const out=[]; document.querySelectorAll('#vWeek, #vWeek *').forEach(n => { const o = getComputedStyle(n).overflowY; if ((o==='auto'||o==='scroll') && n.scrollHeight>n.clientHeight+1) out.push((n.id||String(n.className).slice(0,30))+' '+n.scrollHeight+'/'+n.clientHeight) }); return [out, document.scrollingElement.scrollHeight] })
console.log(JSON.stringify(sc))
await shot(page, 'explore2-editweek')
await browser.close()
