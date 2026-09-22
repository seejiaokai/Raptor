/* RULES SWEEP — survey. What the everything-Saturday actually holds, so every
   ruling below is walked against real addresses rather than guessed ones. */
import { open, board, shot, oilMode, readDay, warnings, STATE } from './lib.mjs'
import { allChips, allSwitches, allPucks } from './seat-lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)

const d = await readDay(page, di)
console.log('=== DAY', di, '===')
console.log('dow:', await page.evaluate(i => window.DAYS[i].dow + ' ' + (window.DATES ? window.DATES[i] : ''), di))
console.log('WAVES:'); d.waves.forEach((w,i)=>console.log(` [${i}] ${w.label} kind=${w.kind} sa=${JSON.stringify(w.sa)}`, JSON.stringify(w.f)))
console.log('DUTIES:'); d.duties.forEach((b,i)=>console.log(` [${i}] ${b.label} sa=${JSON.stringify(b.sa)}`, JSON.stringify(b.rows)))
console.log('SIMS:', JSON.stringify(d.sims))
console.log('GROUND:', JSON.stringify(d.ground))
console.log('PROG:', JSON.stringify(d.prog))
console.log('VERSION:', d.version, '| PENDING:', d.pending)
console.log('WARN(side):', JSON.stringify(await warnings(page), null, 1))

console.log('\n=== CHIPS, mode OFF ==='); for (const c of await allChips(page)) console.log(' ', JSON.stringify(c))
await shot(page, 'RULE-00-board-mode-off')

console.log('\n=== MODE ON ==='); console.log(JSON.stringify(await oilMode(page, true)))
await shot(page, 'RULE-00-board-mode-on')
console.log('--- SWITCHES ---'); for (const s of await allSwitches(page)) console.log(' ', JSON.stringify(s))
console.log('--- CHIPS, mode ON ---'); for (const c of await allChips(page)) console.log(' ', JSON.stringify(c))
const byItem = {}; for (const p of await allPucks(page)) (byItem[p.item] ||= []).push(`${p.cs}${p.on?'':'(off)'}`)
console.log('--- PUCKS ---'); for (const k of Object.keys(byItem)) console.log(' ', k, '->', byItem[k].join(', '))

console.log('\nerrors:', errors.slice(0,8))
await browser.close()
