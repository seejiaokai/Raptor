import * as S from './ins-s-lib2.mjs'
const { B, L, W } = S
const { browser, p, errors } = await B.world()
try {
  await B.toEdit(p)
  await L.go(p, 'inputs')
  await p.waitForSelector('#inRangeBtn')
  const types = await p.evaluate(() => [...document.querySelectorAll('#inType option')].map(o => o.value + '|' + o.textContent))
  console.log('TYPES', types.join(' ; '))
  const pers = await p.evaluate(() => [...document.querySelectorAll('#inPerson option')].slice(0, 6).map(o => o.value + '|' + o.textContent))
  console.log('PEOPLE', pers.join(' ; '))
  console.log('INPUTS', await p.evaluate(() => window.INPUTS.length))
  await B.pic(p, 'probe7-inputs')
} catch (e) { console.log('ERR', e.stack) }
await browser.close()
