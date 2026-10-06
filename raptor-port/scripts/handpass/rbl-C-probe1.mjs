import * as K from './stk-B-lib.mjs'
const { B, L, W } = K
const { browser, p, errors } = await K.fresh()
try {
  const f = await p.evaluate(() => JSON.stringify(window.PEOPLE.waldo))
  console.log('waldo', f)
  const f2 = await p.evaluate(() => JSON.stringify(window.PEOPLE.bane))
  console.log('bane', f2)
  const sans = await p.evaluate(() => Object.entries(window.PEOPLE).filter(([k, v]) => JSON.stringify(v).toLowerCase().includes('sans')).map(([k, v]) => k + ':' + JSON.stringify(v)))
  console.log('SANSppl', sans.join(' | '))
  await L.go(p, 'inputs')
  const types = await p.evaluate(() => [...document.querySelectorAll('#inType option')].map(o => o.value + '=' + o.text))
  console.log('inType', types.join(' | '))
  const people = await p.evaluate(() => [...document.querySelectorAll('#inPerson option')].map(o => o.value + '=' + o.text).slice(0, 10))
  console.log('inPerson', people.join(' | '))
  const dom = await p.evaluate(() => document.querySelector('#inType') ? document.querySelector('#inType').closest('form,div,section').outerHTML.slice(0, 2500) : 'none')
  console.log('FORM', dom)
  console.log('ERR', errors.join(' | '))
} catch (e) { console.log('ERR', e.stack) }
await browser.close()
