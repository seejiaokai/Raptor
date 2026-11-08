// W3 explore 1 — the plans menu on the week and board of a published day. node sm-w3-x1.mjs pc|phone
import * as L from './sm-lib.mjs'
const size = process.argv[2] || 'pc'
console.log('sm-w3-x1 v1', size)
const OUT = L.outDir('w3')
const W = await L.launch(size, { origin: 'http://localhost:4394' })
const P = W.page
await L.signIn(W)
console.log('pub', JSON.stringify(await L.publishDay(W, 2)))
await L.closeBoard(W)
await L.goEdit(W)
const dump = () => P.evaluate(() => ({
  menus: [...document.querySelectorAll('[data-planmenu]')].filter(e => e.getBoundingClientRect().width).map(e => ({ di: e.dataset.planmenu, txt: e.textContent.trim(), inBoard: !!e.closest('#schedBoard'), svg: [...e.querySelectorAll('svg')].map(s => s.getAttribute('class') + ':' + Math.round(s.getBoundingClientRect().width)) })),
}))
console.log(JSON.stringify(await dump()))
await L.center(P, '#eWeek section.day[data-day="2"] [data-planmenu="2"]')
await L.press(W, '#eWeek section.day[data-day="2"] [data-planmenu="2"]'); await L.sleep(600)
console.log('menu', JSON.stringify(await P.evaluate(() => [...document.querySelectorAll('.wavemenu')].filter(e => e.getBoundingClientRect().width).map(m => [...m.querySelectorAll('button')].map(b => (b.dataset.planpv ? 'pv:' : b.dataset.plan ? 'plan:' : '') + b.textContent.trim().replace(/\s+/g, ' ').slice(0, 60) + ' | ' + Object.keys(b.dataset).join(','))))))
await L.pic(W, OUT, `x1-${size}-week-planmenu`, { clip: size === 'pc' ? { x: 0, y: 0, width: 1536, height: 500 } : undefined })
await W.page.screenshot({ path: OUT + `/x1-${size}-full.png` })
await L.closeAll(W)
