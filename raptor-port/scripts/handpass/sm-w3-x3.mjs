// W3 explore 3 — the day templates window's eye (row 24): save a template, open Manage. node sm-w3-x3.mjs pc|phone
import * as L from './sm-lib.mjs'
const size = process.argv[2] || 'pc'
console.log('sm-w3-x3 v2', size)
const OUT = L.outDir('w3')
const W = await L.launch(size, { origin: 'http://localhost:4394' })
const P = W.page
await L.signIn(W)
await L.openBoard(W, 3)
const eyes = () => P.evaluate(() => [...document.querySelectorAll('svg')].filter(s => s.getBoundingClientRect().width > 0 && /eye/i.test((s.getAttribute('class') || '') + (s.id || ''))).map(s => { const r = s.getBoundingClientRect(); return { cls: s.getAttribute('class'), w: +r.width.toFixed(1), h: +r.height.toFixed(1), color: getComputedStyle(s).color, text: s.parentElement.textContent.trim().replace(/\s+/g, ' ').slice(0, 60) } }))
const btn = async t => { const b = P.locator('#schedBoard button, .wavemenu button, .win button, button', { hasText: t }).filter({ visible: true }).first(); if (!(await b.count())) return false; await (W.phone ? b.tap() : b.click()); await L.sleep(900); return true }
console.log('Templates', await btn('Templates'))
console.log('save', await btn('Save this day as a template'))
console.log('inputs', JSON.stringify(await P.evaluate(() => [...document.querySelectorAll('input,textarea')].filter(e => e.getBoundingClientRect().width).map(e => e.id + '|' + e.placeholder + '|' + e.value).slice(0, 8))))
await P.screenshot({ path: OUT + `/x3-${size}-save.png` })
console.log('btns', JSON.stringify(await P.evaluate(() => [...document.querySelectorAll('button')].filter(e => e.getBoundingClientRect().width && e.closest('.win, .wavemenu, [role=dialog]')).map(e => e.textContent.trim().slice(0, 30)))))
console.log('eyes', JSON.stringify(await eyes())); await L.sleep(500); console.log('T2', await btn('Templates')); console.log('menu', JSON.stringify(await P.evaluate(() => [...document.querySelectorAll('.wavemenu')].filter(e => e.getBoundingClientRect().width).map(m => m.textContent.replace(/s+/g, ' ').slice(0, 300))))); console.log('eyes2', JSON.stringify(await eyes())); await P.screenshot({ path: OUT + '/x3-' + size + '-menu-after.png' }); console.log('mg', await btn('Manage templates')); console.log('eyes3', JSON.stringify(await eyes())); await P.screenshot({ path: OUT + '/x3-' + size + '-manage-after.png' })
await L.closeAll(W)
