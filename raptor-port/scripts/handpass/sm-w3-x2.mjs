// W3 explore 2 — saved plan edit / manage windows and the Templates window's eye. node sm-w3-x2.mjs pc|phone
import * as L from './sm-lib.mjs'
const size = process.argv[2] || 'pc'
console.log('sm-w3-x2 v1', size)
const OUT = L.outDir('w3')
const W = await L.launch(size, { origin: 'http://localhost:4394' })
const P = W.page
await L.signIn(W)
await L.goEdit(W)
const eyes = () => P.evaluate(() => [...document.querySelectorAll('svg.pveye')].filter(s => s.getBoundingClientRect().width > 0).map(s => { const r = s.getBoundingClientRect(); return { w: +r.width.toFixed(1), h: +r.height.toFixed(1), color: getComputedStyle(s).color, host: (s.parentElement.className || s.parentElement.tagName) + '', text: s.parentElement.textContent.trim().replace(/\s+/g, ' ').slice(0, 60), inBoard: !!s.closest('#schedBoard'), inWin: !!s.closest('.win,[data-testid^="win"],.wtwin,dialog') } }))
const D3 = '#eWeek section.day[data-day="3"]'
await L.center(P, D3 + ' [data-planmenu="3"]')
await L.press(W, D3 + ' [data-planmenu="3"]'); await L.sleep(500)
await L.press(W, '.wavemenu [data-plandup]'); await L.sleep(1200)
await L.center(P, D3 + ' [data-planmenu="3"]')
await L.press(W, D3 + ' [data-planmenu="3"]'); await L.sleep(500)
await L.press(W, '.wavemenu [data-planmanage]'); await L.sleep(900)
console.log('manage eyes', JSON.stringify(await eyes()))
await P.screenshot({ path: OUT + `/x2-${size}-manage.png` })
console.log('wins', JSON.stringify(await P.evaluate(() => [...document.querySelectorAll('[class*=win], dialog, [role=dialog]')].filter(e => e.getBoundingClientRect().width > 100).map(e => e.className + '|' + e.textContent.trim().replace(/\s+/g, ' ').slice(0, 80)).slice(0, 8))))
await P.keyboard.press('Escape'); await L.sleep(500)
// Templates window on the board
await L.openBoard(W, 3)
const t = P.locator('#schedBoard button', { hasText: 'Templates' }).filter({ visible: true }).first()
console.log('tpl count', await t.count())
await (W.phone ? t.tap() : t.click()); await L.sleep(900)
console.log('tpl eyes', JSON.stringify(await eyes()))
await P.screenshot({ path: OUT + `/x2-${size}-templates.png` })
await L.closeAll(W)
