import * as B from './cal-B-lib.mjs'
const w = await B.world(process.argv[2] || 'desk')
const p = w.page
const info = await p.evaluate(() => {
  const ids = [...document.querySelectorAll('[data-testid]')].map(e => e.getAttribute('data-testid')).filter(x => !/^(cell|head|count|oil|event|dow)-/.test(x) && !/^(req|avail)-[pw]-2/.test(x))
  return { ids: [...new Set(ids)].slice(0, 200), page: window.CURPAGE, scroll: [scrollX, scrollY] }
})
console.log(JSON.stringify(info))
const dates = await p.evaluate(() => [...document.querySelectorAll('[data-testid^="req-p-"]')].map(e => e.getAttribute('data-testid')).slice(0, 8))
console.log(dates)
await B.pic(p, 'probe-' + w.key)
console.log(w.errors)
await B.close(w)
