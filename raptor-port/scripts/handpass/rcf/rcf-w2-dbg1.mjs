console.log('rcf-w2-dbg1 v1')
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w2/dbg1')
const W = await import('./rcf-w2-lib.mjs')
const F = await import('./rcf-w2-fx.mjs')
const { L, sleep } = W
const { DI, sortie, ground, readAll } = F
const browser = await W.launch()
const { page } = await W.world(browser)
const bane = await W.pid(page, 'Ranger')
await W.openBoard(page, DI)
const s1 = await sortie(page, { who: bane, to: '1200', ld: '1300' })
const g1 = await ground(page, { prog: 'BRIEFING', str: '1200', end: '1230', who: bane })
const s2 = await sortie(page, { who: bane, to: '1500', ld: '1600' })
const g2 = await ground(page, { prog: 'BRIEFING', str: '1500', end: '1530', who: bane })
console.log(JSON.stringify(await page.evaluate(d => ({ w: window.DAYS[d].waves.map(w => w.formations.map(f => [f.cs, f.msn, f.to, f.ld, f.aircraft.map(a => a.p)])), g: window.DAYS[d].ground.map(x => [x.prog, x.str, x.end, x.who]) }), DI)))
await W.openWarnFold(page)
await readAll(page, bane, 'unhidden: both clashes')
/* the markup of an occupied seat */
console.log(await page.evaluate(d => document.querySelector(`#schedBoard [data-slot="${d}.0.0.0.p"]`).outerHTML.slice(0, 900), DI))
console.log(await page.evaluate(d => document.querySelector(`#schedBoard [data-slot="g:${d}.0"]`).outerHTML.slice(0, 900), DI))
await browser.close()
