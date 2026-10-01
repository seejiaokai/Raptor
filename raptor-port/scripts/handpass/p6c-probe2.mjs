/* phase 6 (c) check — the marks a live filing on a published day leaves, and the Ground Programme as drawn (a read) */
import { world, fileTimed } from './p6-lib.mjs'
const L = await import('./dbrA-lib.mjs'); const W = await import('./dbrA-W1-lib.mjs')
const { browser, p } = await world(L)
const THU = 3
await W.toEdit(L, p); await W.showDay(p, THU); await W.signDay(p, THU); await W.publishDay(p, THU)
await fileTimed(L, p, { person: 'bane', type: 'Meeting', iso: '2026-07-16', from: '14:00', to: '15:00', remarks: 'P6C LIVE' })
console.log(JSON.stringify(await p.evaluate(di => { const S = window.SCHED; const f = o => Object.keys(o || {}).filter(k => k.includes(':' + di + '.') || k.startsWith(di + '.')); return { pending: f(S.pending), added: f(S.added), changes: f(S.changes) } }, THU)))
await W.boardOn(p, THU)
const g = p.locator('#schedBoard .sb-panel.grnd').first()
await g.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(300)
await g.screenshot({ path: process.env.HP_SHOTS + '/probe-grnd-' + (process.env.HP_TAG || 'x') + '.png' })
console.log(await p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.grnd [data-alp], #schedBoard .sb-panel.grnd [data-aln]')].map(e => (e.dataset.txt || e.dataset.k || e.className) + ' alp=' + (e.dataset.alp || '') + ' aln=' + (e.dataset.aln || '')).join('\n')))
await browser.close()
