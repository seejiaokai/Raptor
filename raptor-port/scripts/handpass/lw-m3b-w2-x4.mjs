// W2 explore 4 — where a Training lands after filing; what the buttons read; the Scheduler Board's buttons.
process.env.HP_URL = 'http://localhost:4180'
import * as H from './lw-m3b-w2-lib.mjs'
const { L, T, note } = H
const w = await H.deskCtx(); const P = w.page
await L.signInPlain(w, 'admin')
const ranger = await H.idOf(P, 'Ranger')
const f = await H.fileInput(w, { who: 'Ranger', type: 'Training', from: '2026-07-15', remarks: 'Weapons trg', tag: 'x4', beforeSave: async () => { note('x4', 'desk', 'allday control: ' + await P.locator('#inpEditAllday').count() + ' labels: ' + await P.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"] .inped-k')].map(e => e.textContent).join(' · '))); if (await P.locator('#inpEditAllday').count() && !(await P.locator('#inpEditAllday').isChecked())) await L.press(w, '#inpEditAllday') } })
note('x4', 'desk', JSON.stringify({ rec: f.rec, asked: f.asked }))
const iid = f.rec.iid
await H.goEdit(w)
const acc = scope => P.evaluate(([scope, iid]) => [...document.querySelectorAll(`${scope} [data-acck="${iid}"]`)].map(b => b.dataset.acc + ':' + b.textContent.trim() + ':' + (b.getBoundingClientRect().width > 0 ? 'vis' : 'hid')).join(' | '), [scope, iid])
note('x4', 'desk', 'Wed buttons: ' + await acc('#eWeek section.day[data-day="2"]'))
for (const s of ['sec-unav', 'sec-grnd', 'sec-prog', 'sec-inp']) note('x4', 'desk', s + ': ' + JSON.stringify((await H.rowsOf(P, 2, s)).rows?.map(r => r.text)))
note('x4', 'desk', 'pitog: ' + await P.locator('#eWeek [data-pitog="2"]').count())
await P.locator('#eWeek [data-pitog="2"]').first().click(); await P.waitForTimeout(500)
note('x4', 'desk', 'after unfold, Wed buttons: ' + await acc('#eWeek section.day[data-day="2"]'))
note('x4', 'desk', 'inp rows: ' + JSON.stringify((await H.rowsOf(P, 2, 'sec-inp')).rows?.map(r => r.text + ' ' + r.btns)))
/* the board */
process.env.HP_SHOTS = H.OUT
const HPL = await import('./lib.mjs')
await HPL.board(P, 2)
note('board', 'desk', 'board open: ' + await P.locator('#schedBoard').count())
note('board', 'desk', 'buttons: ' + await acc('#schedBoard'))
note('board', 'desk', 'rows: ' + await P.evaluate(() => [...document.querySelectorAll('#schedBoard [class*="panel"]')].map(e => e.className.slice(0, 30)).join(' | ')))
const n = await HPL.openInputs(P, 2)
note('board', 'desk', 'inputs rows after unfold: ' + n + ' buttons: ' + await acc('#schedBoard'))
await H.pic(w, 'x4-board', null)
note('errors', 'desk', JSON.stringify(w.errs))
await w.ctx.close(); await H.closeBrowser()
