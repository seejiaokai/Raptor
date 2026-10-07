import * as C from './rbl-C-lib.mjs'
const { B, L, W, K, ID, MON, TUE } = C
const { browser, p, errors } = await K.fresh()
try {
  await L.go(p, 'inputs')
  await p.waitForSelector('#inRangeBtn', { timeout: 8000 })
  await p.selectOption('#inPerson', ID)
  await p.selectOption('#inType', 'SANS Availability')
  await C.sleep(400)
  await B.pic(p, 'p3-sans-form')
  const form = await p.evaluate(() => { const f = document.querySelector('#inAdd').closest('div,section,form'); let e = document.querySelector('#inType'); while (e && !e.querySelector('#inAdd')) e = e.parentElement; return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 800) + ' || ids: ' + [...e.querySelectorAll('[id]')].map(x => x.id).join(',') : 'none' })
  console.log(form)
  console.log('ERR', errors.join(' | '))
} catch (e) { console.log('ERR', e.stack) }
await browser.close()
