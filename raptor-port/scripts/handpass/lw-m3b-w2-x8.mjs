// W2 explore 8 — Edit Schedule's Wednesday right after the day is published (nothing pending).
process.env.HP_URL = 'http://localhost:4180'
import * as H from './lw-m3b-w2-lib.mjs'
const { L, T, note } = H
process.env.HP_SHOTS = H.OUT
const HPL = await import('./lib.mjs')
const w = await H.deskCtx(); const P = w.page
await L.signInPlain(w, 'admin')
const f = await H.fileInput(w, { who: 'Ranger', type: 'Other', from: '2026-07-15', remarks: 'Pub other', goes: 'u', beforeSave: async () => { if (!(await P.locator('#inpEditAllday').isChecked())) await L.press(w, '#inpEditAllday') } })
await HPL.board(P, 2); const pub = await HPL.publish(P, 2); await HPL.closeBoard(P)
note('x8', 'desk', 'publish ' + JSON.stringify(pub))
await H.goEdit(w); await P.waitForTimeout(2500)
note('x8', 'desk', 'page: ' + await P.evaluate(() => window.CURPAGE) + ' week sections: ' + await P.evaluate(() => [...document.querySelectorAll('#eWeek section.day')].map(e => e.dataset.day + ':' + e.className + ':' + e.innerText.length).join(' | ')))
note('x8', 'desk', 'Wed text: ' + await P.evaluate(() => (document.querySelector('#eWeek section.day[data-day="2"]')?.innerText || '').replace(/\s+/g, ' ').slice(0, 400)))
await P.evaluate(() => document.querySelector('#eWeek section.day[data-day="2"]')?.scrollIntoView({ block: 'start', inline: 'start' })); await P.waitForTimeout(600)
await H.pic(w, 'x8-wed', null)
note('x8', 'desk', 'Wed rect: ' + JSON.stringify(await P.evaluate(() => { const r = document.querySelector('#eWeek section.day[data-day="2"]')?.getBoundingClientRect(); return r ? [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] : null })))
note('x8', 'desk', 'Wed unav rows: ' + JSON.stringify((await H.rowsOf(P, 2, 'sec-unav')).rows?.map(r => r.text)))
note('errors', 'desk', JSON.stringify(w.errs))
await w.ctx.close(); await H.closeBrowser()
