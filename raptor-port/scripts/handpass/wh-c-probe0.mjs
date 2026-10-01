/* walker C — probe 0: reads only. What Tuesday's list says, the text boxes on Tuesday, the week chips, the top bar. */
import * as H from './wh-lib.mjs'
const { L, W } = H
const { browser, p, errors } = await H.world({ who: 'a' })
await L.go(p, 'editsched')
await H.openList(p, '#eWeek', 1)
console.log('TUE LIST', JSON.stringify(await H.readList(p, '#eWeek', 1), null, 1))
console.log('TUE WARNS', JSON.stringify(await H.warnsOf(p, 1), null, 1))
console.log('HEAD', JSON.stringify(await H.head(p, 1)))
console.log('TXT KEYS', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="1"] [data-txt]')].filter(e => e.offsetParent !== null).map(e => e.dataset.txt + '=' + e.innerText.trim().slice(0, 20)).slice(0, 60))))
console.log('WK CHIPS', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('[data-wk]')].map(e => ({ wk: e.dataset.wk, vis: e.offsetParent !== null, t: e.innerText.trim().slice(0, 30), in: e.closest('[id]') && e.closest('[id]').id })))))
console.log('TOPBAR', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('header button, .topbar button, #topbar button, nav button')].filter(e => e.offsetParent !== null).map(e => (e.id || '') + '|' + e.innerText.trim().slice(0, 20) + '|' + (e.title || '').slice(0, 50)))))
console.log('WEEK ROW BUTTONS', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#page-editsched button, #page-editsched a')].filter(e => e.offsetParent !== null && !e.closest('.day') && !e.closest('#eRoster')).map(e => (e.id || '') + '|' + e.innerText.trim().slice(0, 24) + '|' + (e.title || '').slice(0, 40)).slice(0, 80))))
console.log('PAGES', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('[data-go], [data-page], .tab, nav a')].filter(e => e.offsetParent !== null).map(e => (e.dataset.go || e.dataset.page || '') + '|' + e.innerText.trim().slice(0, 20)).slice(0, 40))))
console.log('WINDOW KEYS', JSON.stringify(await p.evaluate(() => Object.keys(window).filter(k => /^[A-Z]{3,}|^raptor|^go$|^open|^load|^hist/.test(k)).slice(0, 120))))
await H.pic(p, 'probe0-tue')
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
