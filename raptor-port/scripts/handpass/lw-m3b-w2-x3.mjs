// W2 explore 3 — the schedule row's tap door.
import * as H from './lw-m3b-w2-lib.mjs'
const { L, T, note } = H
const w = await H.deskCtx(); const P = w.page
await L.signInPlain(w, 'admin')
const f = await H.fileInput(w, { who: 'Ranger', type: 'Other', from: '2026-07-15', remarks: 'Range tasking', goes: 'u', beforeSave: async () => { if (!(await P.locator('#inpEditAllday').isChecked())) await L.press(w, '#inpEditAllday') } })
const iid = f.rec.iid
await H.goEdit(w)
const b = P.locator(`#eWeek [data-inpedit="${iid}"]`).first()
await b.scrollIntoViewIfNeeded()
await b.click(); await P.waitForTimeout(1500)
note('row', 'desk', 'wins after click: ' + (await H.winsOpen(P)).join(','))
note('row', 'desk', 'visible testids: ' + await P.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => e.getBoundingClientRect().width > 200 && e.getBoundingClientRect().height > 200).map(e => e.dataset.testid).join(', ')))
note('row', 'desk', 'dialogs: ' + await P.evaluate(() => [...document.querySelectorAll('[role=dialog], .airpop, .win, [data-testid^="win-"], #inpEditPop')].map(e => e.tagName + '#' + e.id + '.' + String(e.className).slice(0, 40) + '[' + (e.dataset.testid || '') + '] w=' + Math.round(e.getBoundingClientRect().width)).join(' | ')))
note('row', 'desk', 'goes: ' + JSON.stringify(await H.goesRead(P)) + ' save ids: ' + await P.evaluate(() => [...document.querySelectorAll('#inpEditSave, #inpEditCancel')].map(e => e.id + ':' + e.getBoundingClientRect().width).join(',')))
note('errors', 'desk', JSON.stringify(w.errs))
await w.ctx.close(); await H.closeBrowser()
