import * as T from './bta-B-lib.mjs'
const { K, B, C, L, W, ID, CSN, TUE, MON, WED, sleep } = T
const { browser, p, errors } = await K.fresh()
try {
  const b1 = await T.blankLine(p, TUE)
  console.log('blank line', JSON.stringify(b1))
  const f = await T.file(p, { type: 'ATT C', di: MON, toDi: WED, allday: true, remarks: 'Flu' })
  console.log('ATT C', JSON.stringify(f), await T.rec(p, f.iid))
  const s = await T.see(p, 'probe-att')
  console.log(T.says(s))
  // Upchit form
  await L.go(p, 'inputs'); await p.waitForSelector('#inRangeBtn')
  await p.selectOption('#inPerson', ID)
  await p.selectOption('#inType', 'Upchit')
  await sleep(400)
  console.log('form html', (await p.evaluate(() => document.querySelector('#inType').closest('form,div,section').parentElement.innerText.replace(/\s+/g, ' ').slice(0, 800))))
  await T.pic(p, 'probe-upchit-form')
} catch (e) { console.log('ERR', e.stack) }
console.log('errors', errors)
await browser.close()
