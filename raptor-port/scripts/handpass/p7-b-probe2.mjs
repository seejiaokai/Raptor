/* [DB-READINESS] phase 7 walk — walker B — probe 2: what the board draws for a new ground row, a full sim row and the
   ALL AVAIL window (a throwaway world; nothing here is evidence). */
import { boot, world } from './p6-lib.mjs'
import { handPut } from './seat-lib.mjs'
import * as B from './p7-b-lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await world(L)
const DI = 1
await W.boardOn(p, DI)
const ri = await B.addGround(L, W, p, DI, 'OPS BRIEF', '09:45', '09:58')
console.log('ground row', ri, await p.evaluate(([d, r]) => { const e = document.querySelector(`#schedBoard [data-bfld="gr:${d}.${r}.prog"]`); return e ? e.closest('.sb-arow').outerHTML.replace(/\s+/g, ' ') : null }, [DI, ri]))
console.log('put allavail', JSON.stringify(await handPut(p, `g:${DI}.${ri}.+`, 'allavail')))
console.log('ground row after', await p.evaluate(([d, r]) => { const e = document.querySelector(`#schedBoard [data-bfld="gr:${d}.${r}.prog"]`); return e ? e.closest('.sb-arow').outerHTML.replace(/\s+/g, ' ') : null }, [DI, ri]))
console.log('model', JSON.stringify(await p.evaluate(([d, r]) => window.DAYS[d].ground[r], [DI, ri])))
const item = await B.chipItem(p, DI, 'ground', 'OPS BRIEF')
const w = await B.openChip(p, item)
console.log('window', JSON.stringify(w, null, 1).slice(0, 5000))
await L.shot(p, 'probe2-window')
console.log('winhtml', await p.evaluate(() => document.querySelector('.availwin').outerHTML.replace(/\s+/g, ' ').slice(0, 3000)))
await B.closeWin(p)
/* the sim rows: fill the two extras, look at what is offered */
console.log('x0', JSON.stringify(await handPut(p, `s:${DI}.oft.0.x0`, 'pike')))
console.log('x1', JSON.stringify(await handPut(p, `s:${DI}.oft.0.x1`, 'ignite')))
console.log('oft row', await p.evaluate(d => document.querySelector(`#schedBoard [data-fill="s:${d}.oft.0.+"]`).outerHTML.replace(/\s+/g, ' '), DI))
console.log('amt p', JSON.stringify(await handPut(p, `s:${DI}.amt.1.p`, 'razer')))
console.log('amt w', JSON.stringify(await handPut(p, `s:${DI}.amt.1.w`, 'psy')))
console.log('amt row', await p.evaluate(d => document.querySelector(`#schedBoard [data-fill="s:${d}.amt.1.+"]`).outerHTML.replace(/\s+/g, ' '), DI))
console.log('sims model', JSON.stringify(await B.simModel(p, DI)))
console.log('simw', JSON.stringify(await p.evaluate(d => window.SIMW[d], DI)))
console.log('side', JSON.stringify(await B.warnLines(p)))
console.log('sideHtml', await p.evaluate(() => { const s = document.querySelector('#sbSide'); return s ? s.outerHTML.replace(/\s+/g, ' ').slice(0, 2500) : 'NO #sbSide' }))
await L.shot(p, 'probe2-sims', { fullPage: true })
console.log('errors', errors)
await browser.close()
