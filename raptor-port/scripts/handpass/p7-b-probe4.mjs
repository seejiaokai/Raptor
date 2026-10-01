/* [DB-READINESS] phase 7 walk — walker B — probe 4: what a passenger-list sim row draws (Wed EP-4, Mon AMT BOX), and
   the crew list's pucks as drag sources (a throwaway world; nothing here is evidence). */
import { boot } from './p6-lib.mjs'
import { handPut } from './seat-lib.mjs'
import * as B from './p7-b-lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await B.world(L, { dsf: 1 })
const rowHtml = (key) => p.evaluate(k => { const e = document.querySelector(`#schedBoard [data-fill="${k}"]`); return e ? e.outerHTML.replace(/\s+/g, ' ') : null }, key)
await W.boardOn(p, 2)
console.log('WED oft.0', await rowHtml('s:2.oft.0.+'))
console.log('put 4th via fill', JSON.stringify(await handPut(p, 's:2.oft.0.+', 'pike')))
console.log('WED oft.0 after', await rowHtml('s:2.oft.0.+'))
console.log('model', JSON.stringify((await B.simModel(p, 2)).oft[0]))
await p.evaluate(() => { const e = document.querySelector('#schedBoard [data-fill="s:2.oft.0.+"]'); e.scrollIntoView({ block: 'center' }) })
await L.shot(p, 'probe4-wed-sims')
console.log('roster puck', await p.evaluate(() => { const e = document.querySelector('#sbRoster .rpuck[data-person="ignite"]'); return e ? e.outerHTML : null }))
await W.boardOn(p, 0)
console.log('MON amt.1', await rowHtml('s:0.amt.1.+'))
console.log('MON oft.4', await rowHtml('s:0.oft.4.+'))
console.log('stored keys', JSON.stringify(Object.keys(await L.rows(p)).filter(k => k.startsWith('weeks/'))))
console.log('stored wed', (await B.storedDay(p, 2) || '').slice(0, 1500))
console.log('errors', errors)
await browser.close()
