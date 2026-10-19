import { launch, ctxOpen, sleep, go, shot, openBoard, closeBoard, addStandby, seat, wave, bf, bType, errors, rec, waveShot, chips, summ, bPublish, pending, topShot, toTop, pressChip, reload, histTab, leaveBox } from './sf-A-lib.mjs'
console.log('sf-A-s14 v1')
const b = await launch()
const DI = 5
const lit = async (di, gi, li) => (await chips(p, di, gi, li)).map(c => c.chips.length ? (c.chips.some(x => x.on) ? 'L' : 'd') : '-').join('')
let ctx, p
({ ctx, p } = await ctxOpen(b, 's14a'))
const gSC = await addStandby(p, DI, 'sc'), gAV = await addStandby(p, DI, 'avalon')
await seat(p, DI, gSC, [[0, 0], [0, 1], [0, 2], [0, 3]]); await seat(p, DI, gAV, [[0, 0], [0, 1], [0, 2], [0, 3]])
await openBoard(p, DI)
await bType(p, bf(DI, gSC, 0, 'rl'), '0630')
await pressChip(p, `${DI}.${gAV}.0.2`)
console.log('source day: SC AM', await lit(DI, gSC, 0), 'AVALON', await lit(DI, gAV, 0))

/* (a) save the day as a template, apply to Sunday */
await toTop(p)
await p.locator('#sbTpl').click(); await sleep(500)
await p.locator('button', { hasText: /Save this day as a template/ }).first().click(); await sleep(600)
await shot(p, 'x14-save-dialog')
console.log('save dialog', await p.evaluate(() => [...document.querySelectorAll('.airpop, [role=dialog], .modal')].filter(e => e.offsetParent).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 300) + ' || inputs: ' + [...e.querySelectorAll('input')].map(i => i.id + '/' + i.placeholder).join(','))))
await p.locator('button', { hasText: /^Done$/ }).last().click(); await sleep(700)
/* go to Sunday (day 6) and apply */
await p.evaluate(() => window.openScheduler(6)); await sleep(1500)
await toTop(p)
await p.locator('#sbTpl').click(); await sleep(500)
console.log('apply menu', await p.evaluate(() => [...document.querySelectorAll('.airpop, [role=dialog]')].filter(e => e.offsetParent).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 400))))
await p.locator('button', { hasText: /^Template 1/ }).first().click(); await sleep(900)
const conf = await p.evaluate(() => [...document.querySelectorAll('button')].filter(e => e.offsetParent).map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(t => /Apply|Replace|Add|Confirm|Cancel|OK|Yes/i.test(t)))
console.log('after clicking the template, buttons:', JSON.stringify(conf))
await shot(p, 'x14-apply-click')
const D2 = 6
const ks = await p.evaluate(d => window.DAYS[d].waves.map((w, i) => [i, w.kind]), D2)
const g2sc = ks.find(x => x[1] === 'sc')[0], g2av = ks.find(x => x[1] === 'avalon')[0]
const sc2 = await lit(D2, g2sc, 0), av2 = await lit(D2, g2av, 0)
const rl2 = await p.evaluate(([d, g]) => window.DAYS[d].waves[g].formations[0].rl, [D2, g2sc])
const ticks2 = await p.evaluate(([d, g]) => window.DAYS[d].waves[g].formations[0].aircraft.map(a => !!a.fly), [D2, g2av])
const pa = await waveShot(p, D2, g2av, 'A-14a-1-applied-AVALON')
rec('14a', 'save Saturday (SC AM R 06:30 typed, AVALON row 3 ticked by hand) as a day template, apply to Sunday', 'R travels as before; RECORD whether the hand tick travels', `Sunday SC AM lit ${sc2} R="${rl2}"; AVALON lit ${av2}, stored ticks ${JSON.stringify(ticks2)}`, 'RECORD', pa)
/* (c) + Wave -> SC on Monday: no tick, faint dashes */
await p.evaluate(() => window.openScheduler(0)); await sleep(1500)
await toTop(p)
await p.locator('#schedBoard [data-wvadd="0"]:visible').first().click(); await sleep(600)
await p.locator('button[data-wmkind="sc"]:visible').first().click(); await sleep(900)
const g0 = await p.evaluate(() => window.DAYS[0].waves.map((w, i) => [i, w.kind]).filter(x => x[1] === 'sc').pop()[0])
const wc = await p.evaluate(([d, g]) => { const out = []; for (const f of ['rl', 'br']) { const e = document.querySelector(`#schedBoard [data-bfld="ff:${d}.${g}.0.${f}"]`); out.push(e ? e.getAttribute('placeholder') + '/' + e.value : 'none') } return out }, [0, g0])
const pc = await waveShot(p, 0, g0, 'A-14c-new-SC-wave')
rec('14c', '+ Wave → SC on Monday', 'no tick, dashed chips, the faint dash in R and B', `lit ${await lit(0, g0, 0)}; R/B placeholder/value ${JSON.stringify(wc)}`, (await lit(0, g0, 0)) === 'dddd' && wc.every(x => x === '—/') ? 'PASS' : 'FAIL', pc)
/* (e) '+' (add an aircraft row) and '+ Line' on the ticked AVALON / SC rows of Saturday */
await p.evaluate(() => window.openScheduler(5)); await sleep(1500)
const before = await lit(DI, gAV, 0)
await p.locator(`#schedBoard [data-lac="${DI}.${gAV}.0"]:visible`).first().click(); await sleep(700)
const afterPlus = await lit(DI, gAV, 0)
const wAV = await wave(p, DI, gAV)
await p.locator('#schedBoard [data-gline]:visible').first().evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {})
const pe = await waveShot(p, DI, gAV, 'A-14e-plus-row')
rec('14e', 'press the "+" on an AVALON row (add another aircraft row) when row 3 is ticked', 'RECORD whether the ticked row copies: the new row dashed', `lit before ${before}, after ${afterPlus}; rows now ${wAV.f[0].ac.length}`, 'RECORD', pe)
/* (d) leave the week and come back, then reload */
await closeBoard(p); await go(p, 'editsched')
await p.locator('#page-editsched [data-wk]:visible', { hasText: 'Jul 20' }).first().click(); await sleep(1500)
await p.locator('#page-editsched [data-wk]:visible', { hasText: 'Jul 13' }).first().click(); await sleep(1500)
await openBoard(p, DI)
const d1 = { sc: await lit(DI, gSC, 0), av: await lit(DI, gAV, 0) }
await reload(p); await openBoard(p, DI)
const d2 = { sc: await lit(DI, gSC, 0), av: await lit(DI, gAV, 0) }
rec('14d', 'leave the week and come back, then reload', 'every tick and every lit chip survives (SC AM LLLL; AVALON row 3 lit)', `after returning ${JSON.stringify(d1)}; after reload ${JSON.stringify(d2)}`, d1.sc === 'LLLL' && d2.sc === 'LLLL' && d1.av[2] === 'L' && d2.av[2] === 'L' ? 'PASS' : 'FAIL', await waveShot(p, DI, gAV, 'A-14d-after-reload'))
await ctx.close()
console.log('errors', JSON.stringify(errors))
await b.close()
