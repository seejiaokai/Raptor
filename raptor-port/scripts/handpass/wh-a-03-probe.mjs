/* [WARN-HIDE-KEPT] walker A — probe 3: the board's "+ Wave" and "+ Block" menus (what kinds they offer). Its own world. */
import { world, L, W, pic } from './wh-a-lib.mjs'
const { browser, p } = await world()
p.setDefaultTimeout(5000)
const vis = () => p.evaluate(() => [...document.querySelectorAll('.menu, .pop, .popover, .sheet, .dd, .ddmenu, [role=menu], .airpop, .modal, .tplmenu, .wvmenu, .kindmenu')].filter(e => e.getBoundingClientRect().width > 0 && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden').map(e => e.tagName + '#' + e.id + '.' + e.className + ' :: ' + e.innerText.replace(/\n+/g, ' | ').slice(0, 500) + ' :: ' + [...e.querySelectorAll('button, [data-wkind], [data-kind], li, [role=menuitem]')].slice(0, 20).map(b => [...b.attributes].filter(a => a.name.startsWith('data-')).map(a => `[${a.name}=${a.value}]`).join('') + (b.innerText || '').trim().slice(0, 14)).join(' ; ')).join('\n'))
try {
await L.go(p, 'editsched'); await W.boardOn(p, 1)
const before = await p.evaluate(() => document.body.innerHTML.length)
await p.locator('#schedBoard [data-wvadd="1"]').first().click(); await L.sleep(500)
console.log('AFTER + Wave:\n' + await vis())
console.log('waves now', await p.evaluate(() => JSON.stringify(window.DAYS[1].waves.map(w => ({ label: w.label, kind: w.kind, sa: w.sa, n: (w.forms || w.formations || []).length, keys: Object.keys(w) })))))
await pic(p, 'probe-wvadd')
console.log('wave head selects', await p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-go')].map(g => { const s = g.querySelector('select'); return s ? [...s.options].map(o => o.value + '=' + o.text).join(',') + ' sel=' + s.value + ' attrs=' + [...s.attributes].map(a => a.name + '=' + a.value).join(' ') : 'no select' }).join('\n')))
await p.keyboard.press('Escape'); await L.sleep(200)
await p.locator('#schedBoard [data-dwadd="1"]').first().evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200)
await p.locator('#schedBoard [data-dwadd="1"]').first().click(); await L.sleep(500)
console.log('AFTER + Block:\n' + await vis())
console.log('dutywaves now', await p.evaluate(() => JSON.stringify(window.DAYS[1].dutywaves.map(w => ({ keys: Object.keys(w), label: w.label, sa: w.sa, rows: (w.rows || []).map(r => r.role || r.name) })))))
await pic(p, 'probe-dwadd')
console.log('duty block heads', await p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.duty select, #schedBoard .sb-panel.duty [data-dwtpl], #schedBoard .sb-panel.duty input')].slice(0, 12).map(s => s.tagName + [...s.attributes].filter(a => a.name.startsWith('data-')).map(a => `[${a.name}=${a.value}]`).join('') + (s.tagName === 'SELECT' ? ':' + [...s.options].map(o => o.text).join(',') : ':' + s.value)).join('\n')))
} catch (e) { console.log('PROBE ERROR', String(e).split('\n')[0]) }
await browser.close()
