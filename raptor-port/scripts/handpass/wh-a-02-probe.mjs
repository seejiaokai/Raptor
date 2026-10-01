/* [WARN-HIDE-KEPT] walker A — probe 2 (read only): the day's ⓘ popup, a puck tap, the board's add controls. */
import { world, pic, L, W, readList } from './wh-a-lib.mjs'
const { browser, p, errors } = await world()
p.setDefaultTimeout(6000)
try {
await L.go(p, 'editsched')
/* 2. the day's ⓘ */
await W.showDay(p, 1)
await p.locator('#eWeek .day[data-day="1"] [data-dayinfo="1"]').first().click(); await L.sleep(600)
console.log('\nDAYINFO text', await p.evaluate(() => document.querySelector('#dayPop').innerText.replace(/\n+/g, ' | ').slice(0, 1500)))
console.log('DAYINFO html', await p.evaluate(() => document.querySelector('#dayPop').innerHTML.slice(0, 4200)))
await pic(p, 'probe-dayinfo')
await p.mouse.click(700, 880); await L.sleep(400)
console.log('dayPop still up?', await p.evaluate(() => { const d = document.querySelector('#dayPop'); return d ? d.getBoundingClientRect().width + ' ' + getComputedStyle(d).display : 'gone' }))
/* 3. tap Gambit's puck (flagged Mon and Wed) */
await W.showDay(p, 2)
const g = p.locator('#eWeek .day[data-day="2"] .go .puck[data-person="bruise"]').first()
await g.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(200)
await g.click(); await L.sleep(700)
console.log('\nPFOCUS after tap', JSON.stringify(await p.evaluate(() => ({ open: [...document.querySelectorAll('#eWeek [data-dwbox].open')].map(b => b.dataset.dwbox), echo: [...document.querySelectorAll('#eWeek .dwecho')].map(e => e.closest('[data-dwbox]').dataset.dwbox + ': ' + e.innerText), selCls: [...document.querySelectorAll('#eWeek .puck[data-person="bruise"]')].map(e => e.className).slice(0, 4) }))))
console.log('WED list', JSON.stringify((await readList(p, '#eWeek', 2)).lines.map(l => [l.ix, l.text.slice(0, 50), l.btn])))
await pic(p, 'probe-focus-gambit')
await p.keyboard.press('Escape'); await L.sleep(300)
/* 4. the board: its controls */
await W.boardOn(p, 1)
console.log('\nBOARD controls', await p.evaluate(() => [...document.querySelectorAll('#schedBoard button, #schedBoard [data-fill]')].filter(e => e.offsetParent !== null).map(e => (e.id ? '#' + e.id : '') + [...e.attributes].filter(a => a.name.startsWith('data-')).slice(0, 2).map(a => `[${a.name}=${a.value.slice(0, 16)}]`).join('') + ':' + (e.innerText || '').trim().slice(0, 16)).filter((x, i, a) => a.indexOf(x) === i).slice(0, 170).join('  ')))
await pic(p, 'probe-board')
} catch (e) { console.log('PROBE ERROR', String(e).split('\n')[0]) }
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
