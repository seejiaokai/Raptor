/* walker C — probe 12: the Leave War page and its OIL tracker — what to read for "the figures are as they were". Reads only. */
import * as C from './wh-c-lib.mjs'
const { H } = C, { L, W } = H
const { browser, p, errors } = await H.world({ who: 'a' })
await L.go(p, 'leavewar'); await L.sleep(2000)
console.log('LW BUTTONS', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#page-leavewar button')].filter(e => e.offsetParent !== null).map(e => (e.id || '') + '|' + e.className.slice(0, 30) + '|' + e.innerText.trim().slice(0, 24)).slice(0, 40))))
console.log('LW TEXT', await p.evaluate(() => document.querySelector('#page-leavewar').innerText.replace(/\s+/g, ' ').slice(0, 600)))
await H.pic(p, 'probe12-leavewar')
const oil = p.locator('#page-leavewar button').filter({ hasText: /OIL/ }).first()
if (await oil.count()) { await oil.click(); await L.sleep(1200) }
console.log('OIL SHEET', JSON.stringify(await p.evaluate(() => { const s = [...document.querySelectorAll('#page-leavewar .sheet, #page-leavewar [role=dialog], .lw-sheet, .oiltracker, [class*=oil i]')].filter(e => e.offsetParent !== null); return s.slice(0, 6).map(e => e.tagName + '.' + String(e.className).slice(0, 50) + ' len ' + e.innerText.length + ' :: ' + e.innerText.replace(/\s+/g, ' ').slice(0, 500)) }), null, 1).slice(0, 4000))
await H.pic(p, 'probe12-oil')
console.log('LW KEYS', JSON.stringify(await p.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); const g = k.replace(/[:/][^:/]*$/, ''); o[g] = (o[g] || 0) + 1 } return o })))
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
