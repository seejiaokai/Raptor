/* walker TO — probe (read only): who holds nothing on which day, to choose crews whose Work-hours figure moves only with the walk */
import * as T from './stk-TO-lib.mjs'
const w = await T.world()
const p = w.p
const r = await p.evaluate(() => Object.entries(window.PEOPLE).filter(([id]) => !['all', 'allavail'].includes(id)).map(([id, v]) => { const d = []; for (let i = 0; i < 7; i++) { let n = 0; try { n = (window.dayEvents(i, id) || []).length } catch (e) { n = '?' } d.push(n) } return `${v.cs.padEnd(10)} ${String(v.role || v.type || v.kind || '').padEnd(6)} ${d.join(' ')}  ${JSON.stringify(Object.keys(v)).slice(0, 80)}` }))
console.log(r.join('\n'))
console.log(await p.evaluate(() => JSON.stringify(window.PEOPLE.beams)))
console.log(await p.evaluate(() => JSON.stringify((window.INPUTS || []).filter(i => ['beams', 'split', 'bullet', 'ammo', 'boosh', 'spaceman', 'pike', 'pain', 'dice', 'plasma', 'xray'].includes(i.person)).map(i => ({ p: i.person, t: i.type, d: i.date || i.from, to: i.to, s: i.s, e: i.e, acc: i.acc })))))
await w.browser.close()
