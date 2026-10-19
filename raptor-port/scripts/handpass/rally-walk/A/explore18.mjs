import { launch, ctxOpen, SIZES, sleep, go, shot } from './lib.mjs'
console.log('explore18 v4')
const b = await launch()
const { ctx, p } = await ctxOpen(b, SIZES.desk, 'x')
await go(p, 'logic')
await p.locator('button:visible:has-text("Edit"):not(:has-text("Schedule"))').first().click(); await sleep(600)
const out = await p.evaluate(() => {
  const e = [...document.querySelectorAll('*')].filter(x => x.children.length === 0 && /Default rally before take-off/.test(x.textContent))
  return e.map(x => x.parentElement.parentElement.outerHTML.slice(0, 1500)).join(' ===== ')
})
console.log(out)
await shot(p, 'explore-logic-edit2')
await b.close()
