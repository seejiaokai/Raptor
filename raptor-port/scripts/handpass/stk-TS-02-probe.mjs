import * as S from './stk-TS-lib.mjs'
const { L, W, world, pic } = S
const { browser, p, errors } = await world()
await L.go(p, 'logic')
await p.locator('#lgEdit').click(); await S.sleep(400)
console.log(await p.evaluate(() => {
  const e = [...document.querySelectorAll('#page-logic .lgrow, #page-logic [class*=lgr]')].filter(x => /nominal report/i.test(x.innerText))
  return e.slice(0, 2).map(x => x.className + ' :: ' + x.innerHTML.slice(0, 1800)).join('\n----\n')
}))
console.log('errors', errors)
await browser.close()
