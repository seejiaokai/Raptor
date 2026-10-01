/* [WARN-HIDE-KEPT] walker A — probe (read only): how a flagged man's pucks are drawn, on the week, the crew list, the board. */
import { world, pic, L, W } from './wh-lib.mjs'
const { browser, p, errors } = await world()
await L.go(p, 'editsched')
const dump = (scope, ids) => p.evaluate(([s, ids]) => {
  const out = []
  for (const id of ids) for (const e of document.querySelectorAll(`${s} [data-person="${id}"]`)) {
    if (e.offsetParent === null) continue
    const chain = []; let a = e.parentElement
    for (let i = 0; i < 9 && a; i++, a = a.parentElement) chain.push(a.tagName.toLowerCase() + (a.id ? '#' + a.id : '') + (typeof a.className === 'string' && a.className ? '.' + a.className.trim().split(/\s+/).slice(0, 3).join('.') : '') + (a.dataset && a.dataset.day ? `[day=${a.dataset.day}]` : ''))
    const cs = getComputedStyle(e)
    out.push({ id, cls: e.className, html: e.outerHTML.slice(0, 260), chain: chain.join(' < '), shadow: cs.boxShadow.slice(0, 90), outline: cs.outlineStyle + ' ' + cs.outlineColor + ' ' + cs.outlineWidth, border: cs.borderTopStyle + ' ' + cs.borderTopColor + ' ' + cs.borderTopWidth, after: getComputedStyle(e, '::after').content + '|' + getComputedStyle(e, '::after').borderTopStyle + ' ' + getComputedStyle(e, '::after').borderTopColor, before: getComputedStyle(e, '::before').content })
  }
  return out
}, [scope, ids])
await W.showDay(p, 1)
console.log('WEEK+PALETTE (Tue: salsa, casper, wolf)\n', JSON.stringify(await dump('body', ['salsa', 'casper', 'wolf']), null, 1))
await W.showDay(p, 0)
console.log('\nMON casper (dotted)\n', JSON.stringify(await dump('#eWeek .day[data-day="0"]', ['casper']), null, 1))
await pic(p, 'probe-mon')
/* the time cells of a flying line (for the nought-minute red box) */
console.log('\nLINE TIME CELLS (Tue)\n', await p.evaluate(() => { const g = document.querySelector('#eWeek .day[data-day="1"] .go .form'); return g ? g.outerHTML.slice(0, 3500) : 'none' }))
/* the board */
await W.boardOn(p, 1)
console.log('\nBOARD (Tue)\n', JSON.stringify(await dump('#schedBoard', ['salsa', 'casper', 'wolf']), null, 1))
console.log('\nBOARD skeleton\n', await p.evaluate(() => {
  const d = document.querySelector('#schedBoard')
  const walk = (e, depth) => depth > 4 ? '' : [...e.children].slice(0, 14).map(c => '  '.repeat(depth) + c.tagName.toLowerCase() + (c.id ? '#' + c.id : '') + (c.className && typeof c.className === 'string' ? '.' + c.className.split(/\s+/).slice(0, 4).join('.') : '') + [...c.attributes].filter(a => a.name.startsWith('data-')).slice(0, 3).map(a => `[${a.name}=${a.value.slice(0, 20)}]`).join('') + '\n' + walk(c, depth + 1)).join('')
  return walk(d, 0).slice(0, 7000)
}))
await pic(p, 'probe-board-tue')
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
