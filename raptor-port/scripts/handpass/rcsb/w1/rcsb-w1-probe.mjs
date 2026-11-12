/* rcsb-w1-probe v1 — W1 finds the selectors of the Leave War's places (testids), nothing asserted. */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4193'
process.env.HP_SHOTS ||= resolve(HERE, '../../../../docs/img/handpass/2026-11-13-rules-check-small-batch/w1/probe')
console.log('rcsb-w1-probe v1', process.env.HP_SHOTS)
const R = await import('../rcsb-lib.mjs')
const { X, L, sleep } = R
const w = await R.world('pc')
const { page } = w
const SAT = 5, ISO = X.ISO[SAT]
const ranger = w.ID('Ranger')
await L.board(page, SAT)
const gF = await X.addWave(w, SAT, '')
await X.typeIn(w, `[data-bfld="ff:5.${gF}.0.to"]`, '10:00'); await X.typeIn(w, `[data-bfld="ff:5.${gF}.0.ld"]`, '10:30')
console.log('seat', await X.seatPhoneAware(w, `[data-slot="5.${gF}.0.0.p"]`, ranger))
const sp = await X.signAndPublish(w, SAT)
console.log('published', JSON.stringify(sp.p), JSON.stringify(sp.h))
await L.closeBoard(page)
await L.go(page, 'editsched'); await sleep(500)
// head dump of the day on the edit week
console.log('head', JSON.stringify(await L.head(page, SAT)))
await X.W4.lwOpen(page, ISO)
console.log('box', JSON.stringify(await X.W4.lwCell(page, ranger, ISO)))
const ids = await page.evaluate(() => [...new Set([...document.querySelectorAll('[data-testid]')].map(e => e.getAttribute('data-testid').replace(/[0-9a-z]{6,}|\d{4}-\d\d-\d\d/g, '#')))].slice(0, 200))
console.log('testids', JSON.stringify(ids))
// tap the box
const tap = await X.W4.lwTap(page, ranger, ISO)
console.log('tap', JSON.stringify(tap))
await page.screenshot({ path: process.env.HP_SHOTS + '/p-tap.png' })
const sheet = await page.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => e.offsetWidth && /win|sheet|daylist|bid/.test(e.getAttribute('data-testid'))).map(e => e.getAttribute('data-testid') + ' :: ' + e.innerText.replace(/\s+/g, ' ').slice(0, 160)))
console.log('sheet', JSON.stringify(sheet))
await X.W4.lwCloseSheet(page)
console.log('bal', JSON.stringify(await X.W4.lwBalCol(page, ranger)))
const tabs = await page.evaluate(() => [...document.querySelectorAll('button,[role=tab]')].filter(e => e.offsetWidth).map(e => (e.getAttribute('data-testid') || '') + '|' + e.innerText.replace(/\s+/g, ' ').slice(0, 25)).filter(t => t.length > 1).slice(0, 80))
console.log('buttons', JSON.stringify(tabs))
R.finish(w, 'probe')
await w.browser.close()
