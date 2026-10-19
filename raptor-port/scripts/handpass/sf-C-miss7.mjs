import * as L from './sf-C-lib.mjs'
const { launch, ctxOpen, openBoard, closeBoard, bPut, bType, bf, sleep, shot, rec, go, errors, chipLine } = L
const S = 'T2'
const b = await launch()
const { p } = await ctxOpen(b, {})
await go(p, 'editsched'); await p.evaluate(() => window.addWave(5, 'avalon')); await sleep(500)
await openBoard(p, 5)
await bPut(p, 5, 0, 0, 2, 'p', ['nact'])
await p.locator('#schedBoard [data-safly="5.0.0.2"]:visible').first().click(); await sleep(600)
const c0 = await chipLine(p)
await closeBoard(p); await go(p, 'editsched')
await p.locator('#eWeek [data-planmenu="5"]:visible').first().click(); await sleep(500)
await p.locator('.wavemenu [data-plandup]:visible').first().click(); await sleep(1200)
const menu = async () => { await p.locator('#eWeek [data-planmenu="5"]:visible').first().click(); await sleep(500); const t = await p.evaluate(() => [...document.querySelectorAll('.wavemenu button')].map(e => e.innerText.replace(/\s+/g, ' ').trim() + JSON.stringify(e.dataset))); return t }
const m1 = await menu()
console.log(m1)
await p.keyboard.press('Escape')
const ticks = () => p.evaluate(() => window.DAYS[5].waves.map(w => w.formations.map(f => f.aircraft.map(a => a.fly ? 1 : 0).join('')).join('/')))
const live1 = await ticks()
rec(S, '+ Alt Plan on a day with a hand-ticked row', 'RECORD: the live copy keeps the tick; what the parked plan holds', { c0, m1, live1 }, 'RECORD')
// switch to the other plan
await p.locator('#eWeek [data-planmenu="5"]:visible').first().click(); await sleep(500)
await p.locator('.wavemenu [data-plansel="dr1"]:visible').first().click(); await sleep(1200)
const live2 = await ticks()
const lbl = await p.evaluate(() => document.querySelectorAll('#eWeek .day')[5].querySelector('.psl').innerText)
rec(S, 'switch to Plan A (the parked copy)', 'RECORD: the tick travels with the plan', { lbl, live2 }, 'RECORD')
rec(S, 'browser error list', 'empty', errors, errors.length ? 'FAIL' : 'PASS')
await b.close()
