import * as S from './stk-TS-lib.mjs'
const { L, W, world, pic } = S
const { browser, p, errors } = await world()
await L.go(p, 'logic')
const t = await p.evaluate(() => document.querySelector('#page-logic').innerText)
for (const m of t.split('\n').map((l, i) => [i, l]).filter(([i, l]) => /in-time|rally|words|reportText|report/i.test(l))) console.log(m[0], m[1].slice(0, 300))
console.log('--- attrs', await p.evaluate(() => [...new Set([...document.querySelectorAll('#page-logic [data-lgset]')].map(e => e.dataset.lgset))].join(',')))
console.log('--- switches', await p.evaluate(() => [...document.querySelectorAll('#page-logic [role=switch], #page-logic [id^=lg]')].map(e => e.id + ':' + (e.getAttribute('aria-checked') || '') + ':' + e.innerText.slice(0, 40))))
console.log('errors', errors)
await browser.close()
