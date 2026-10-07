import * as T from './bta-B-lib.mjs'
const { K, B, C, D, L, W, W2, ID, CSN, TUE, sleep } = T
const { browser, p, errors } = await K.fresh()
try {
  await L.go(p, 'leavewar'); await sleep(1800)
  const c = p.locator('[data-testid="cell-split-2026-07-14"]'); await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(400); await c.click(); await sleep(900)
  const sheetTxt = () => p.evaluate(() => { const e = [...document.querySelectorAll('[class*=sheet]')].filter(x => x.offsetParent !== null); return e.map(x => `${x.tagName}.${String(x.className).slice(0, 40)}: ${x.innerText.replace(/\s+/g, ' ').slice(0, 200)}`).join(' ### ') })
  console.log('SHEET0', await sheetTxt())
  const btn = p.locator('[class*=sheet] button:visible', { hasText: /^LL$/ }).first()
  console.log('LLbtn count', await btn.count())
  await btn.click(); await sleep(1000)
  await T.pic(p, 'probe-lw-after-LL')
  console.log('SHEET1', await sheetTxt())
  console.log('CELL', await p.evaluate(() => { const e = document.querySelector('[data-testid="cell-split-2026-07-14"]'); return e ? e.outerHTML.slice(0, 300) : 'none' }))
} catch (e) { console.log('ERR', e.stack) }
console.log(errors)
await browser.close()
