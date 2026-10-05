import * as K from './stk-B-lib.mjs'
const { B, L, W, sleep } = K
const { browser, p, errors } = await K.fresh()
try {
  const r = await K.hours(p, ['Cobra'], 'probe8-ins')
  console.log('none?', r.none, JSON.stringify(r.h))
  console.log('after look', await p.evaluate(() => ({ drawer: [...document.querySelectorAll('[class*=drawer], #drawer, #drawerNav')].map(e => e.id + '.' + e.className + ':' + getComputedStyle(e).display + ':' + (e.getBoundingClientRect().width | 0)).slice(0, 6), modal: (document.querySelector('#insightModal') || {}).hidden })))
  await B.pic(p, 'probe8-after')
} finally { await browser.close() }
