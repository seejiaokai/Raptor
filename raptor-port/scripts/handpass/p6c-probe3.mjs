/* phase 6 (c) check — the marks an edit of an ISSUED request's time leaves on its published day (a read) */
import { world, fileTimed } from './p6-lib.mjs'
const L = await import('./dbrA-lib.mjs'); const W = await import('./dbrA-W1-lib.mjs'); const W2 = await import('./dbrA-W2-lib.mjs')
const { browser, p } = await world(L)
const THU = 3
const iid = await fileTimed(L, p, { person: 'bane', type: 'Meeting', iso: '2026-07-16', from: '10:00', to: '11:00', remarks: 'P6C ISSUED' })
await W.toEdit(L, p); await W.showDay(p, THU); await W.signDay(p, THU); await W.publishDay(p, THU)
if (await W2.openEdit(p, iid)) { await p.locator('#inBody tr.ined [data-ed="stime"]').fill('10:30'); await p.locator('#inBody tr.ined [data-save]').first().click(); await L.sleep(700) }
console.log(JSON.stringify(await p.evaluate(di => { const S = window.SCHED; const f = o => Object.keys(o || {}).filter(k => k.includes(':' + di + '.') || k.startsWith(di + '.')); return { pending: f(S.pending), added: f(S.added), changes: f(S.changes) } }, THU)))
await W.boardOn(p, THU)
const g = p.locator('#schedBoard .sb-panel.grnd').first()
await g.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(300)
await g.screenshot({ path: process.env.HP_SHOTS + '/probe3-grnd-' + (process.env.HP_TAG || 'x') + '.png' })
console.log(JSON.stringify(await W.head(p, THU)))
await browser.close()
