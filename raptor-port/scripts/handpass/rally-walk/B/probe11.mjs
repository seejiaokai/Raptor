console.log('B probe11 v1')
import { launch, open, sleep, shot, tap } from './lib.mjs'
const b = await launch()
const { ctx, p } = await open(b)
await p.evaluate(() => window.go('logic')); await sleep(900)
console.log(await p.evaluate(() => {
  const els = [...document.querySelectorAll('#page-logic *')].filter(e => /Default rally before/.test(e.textContent) && e.children.length < 4)
  const lab = els[els.length - 1]
  const row = lab.closest('tr,.lrow,.row,div')
  return { label: lab.tagName + '.' + lab.className, rowHtml: row.outerHTML.slice(0, 1200) }
}))
console.log(await p.evaluate(() => [...document.querySelectorAll('#page-logic button')].slice(0, 25).map(x => Object.keys(x.dataset).join(',') + '|' + x.textContent.trim().slice(0, 25))))
await b.close()
