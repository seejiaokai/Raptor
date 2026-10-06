import * as T from './bta-B-lib.mjs'
const { K, B, C, D, L, W, W2, ID, CSN, TUE, sleep } = T
const { browser, p, errors } = await K.fresh()
try {
  const m = await T.file(p, { type: 'ATT C', di: 2, toDi: 3, allday: true, remarks: 'med probe' })
  await W2.inputsList(p)
  await p.locator('#inMedBtn').click(); await sleep(800)
  console.log('MEDHTML', await p.evaluate(() => { const e = [...document.querySelectorAll('*')].find(x => /^Medical$/.test((x.innerText || '').trim()) && x.children.length === 0); const root = e ? e.closest('div[class]') : null; let r = root; for (let i = 0; i < 3 && r && r.parentElement; i++) r = r.parentElement; return r ? r.outerHTML.replace(/\s+/g, ' ').slice(0, 2500) : 'none' }))
} catch (e) { console.log('ERR', e.stack) }
console.log(errors)
await browser.close()
