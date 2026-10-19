import { launch, ctxOpen, SIZES, sleep, go, shot } from './lib.mjs'
console.log('explore2 v1')
const b = await launch()
const { ctx, p } = await ctxOpen(b, SIZES.desk, 'x')
await go(p, 'editsched')
const day = '#eWeek .day[data-day="5"]'
const btns = await p.evaluate(sel => [...document.querySelectorAll(sel + ' button, ' + sel + ' [data-act], ' + sel + ' select')].map(e => e.tagName + ':' + (e.innerText || '').trim().slice(0, 30) + '|' + [...e.attributes].filter(a => a.name !== 'class' && a.name !== 'style').map(a => a.name + '=' + a.value).join(',').slice(0, 90)).slice(0, 80), day)
console.log(btns.join('\n'))
await p.locator(day).scrollIntoViewIfNeeded()
await shot(p, 'explore-sat', p.locator(day))
// Monday form markup
const html = await p.evaluate(() => document.querySelector('#eWeek .day[data-day="0"] .go .form').outerHTML.slice(0, 5000))
console.log(html)
await b.close()
