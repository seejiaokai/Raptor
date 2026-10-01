/* walker C — probe 10: the nought-minute line on Monday 20 Jul (take-off = landing, typed in the week's own time box),
   its warning, its red time boxes on the week, and the same line in the next-week preview on the week of 13 Jul. */
import * as C from './wh-c-lib.mjs'
const { H } = C, { L, W } = H
const { browser, p, errors } = await H.world({ who: 'a' })
await L.go(p, 'editsched'); await C.toWeek(p, C.WK2); await W.showDay(p, 0)
const before = (await H.readList(p, '#eWeek', 0))
await H.openList(p, '#eWeek', 0)
const b0 = (await H.readList(p, '#eWeek', 0)).lines.map(l => l.text.slice(0, 60))
await W.weekText(p, 'ff:0.0.1.ld', '0840'); await L.settle(p)
await H.openList(p, '#eWeek', 0)
const l1 = await H.readList(p, '#eWeek', 0)
console.log('BAR', l1.bar, '\nNEW LINES', JSON.stringify(l1.lines.filter(l => !b0.includes(l.text.slice(0, 60))), null, 1))
console.log('WARNS', JSON.stringify((await H.warnsOf(p, 0)).filter(w => /LEN|NO_LEN|FLT/.test(w.code))))
console.log('TIME CELLS', JSON.stringify(await p.evaluate(() => ['ff:0.0.1.to', 'ff:0.0.1.ld', 'ff:0.0.0.to', 'ff:0.0.0.ld'].map(k => { const e = document.querySelector(`#eWeek [data-txt="${k}"]`); if (!e) return k + ': none'; const cs = getComputedStyle(e); const par = e.parentElement; return `${k}: cls="${e.className}" parent="${par.className}" border=${cs.borderTopColor}/${cs.borderTopWidth}/${cs.borderTopStyle} outline=${cs.outlineColor}/${cs.outlineStyle}/${cs.outlineWidth} shadow=${cs.boxShadow.slice(0, 60)} bg=${cs.backgroundColor} txt="${e.innerText}"` })), null, 1))
await p.evaluate(() => { const e = document.querySelector('#eWeek [data-txt="ff:0.0.1.ld"]'); if (e) e.scrollIntoView({ block: 'center', inline: 'center' }) }); await L.sleep(300)
await H.pic(p, 'probe10-monday-nought')
await C.toWeek(p, C.WK1)
await p.evaluate(() => { const pk = [...document.querySelectorAll('#eWeek .day.peek')][0]; if (pk) pk.scrollIntoView({ block: 'start', inline: 'center' }) }); await L.sleep(400)
console.log('PEEK', JSON.stringify(await p.evaluate(() => { const pk = [...document.querySelectorAll('#eWeek .day.peek')][0]; if (!pk) return 'no peek'; const red = [...pk.querySelectorAll('*')].filter(e => /red|nolen|bad|err/i.test(String(e.className))).map(e => e.tagName + '.' + e.className + ':' + e.innerText.trim().slice(0, 20)); const lines = [...pk.querySelectorAll('tr, .fl, .frow, .line')].filter(e => /RU/.test(e.innerText) && /BFM/.test(e.innerText)).slice(0, 2).map(e => e.outerHTML.slice(0, 1200)); return { head: pk.innerText.slice(0, 80), red, lines, cls: pk.className, attrs: [...pk.attributes].map(a => a.name + '=' + a.value).join(' ') } }), null, 1).slice(0, 4500))
await H.pic(p, 'probe10-peek')
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
