import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w1/probe12')
const X = await import('./rcf-w1-lib.mjs')
const w = await X.world('desktop')
await X.L.board(w.page, 5)
console.log(await w.page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-slot^="d:5"], #schedBoard [data-fill^="d:5"]')].filter(e => e.offsetWidth).map(e => (e.dataset.slot || e.dataset.fill) + ' ' + e.className).join('\n')))
await w.browser.close()
