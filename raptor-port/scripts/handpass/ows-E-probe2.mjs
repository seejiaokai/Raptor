/* walker E — probe: the OIL Earn switches on an SC wave with Ranger on the first SPARE row */
import * as E from './ows-E-lib.mjs'
const { world, sleep, A, R, W, L, P, say, scWave, setB, SUN } = E
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)
const w = await scWave(p, SUN, 2, 'bane')
console.log('seat', JSON.stringify(w))
await E.oilMode(p, true)
const all = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilitem], #schedBoard [data-oilp]')].filter(e => e.offsetParent !== null).map(e => ({ tag: e.tagName, item: e.dataset.oilitem || '', who: e.dataset.oilp || '', cls: String(e.className).slice(0, 80), txt: (e.innerText || '').trim().slice(0, 40), title: (e.getAttribute('title') || '').slice(0, 120), parent: (e.parentElement && String(e.parentElement.className).slice(0, 60)) })))
console.log(JSON.stringify(all, null, 1))
await P(p, 'probe-oilearn')
await browser.close()
