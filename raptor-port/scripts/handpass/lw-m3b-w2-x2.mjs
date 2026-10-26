// W2 explore 2 — an Other filed through the window, then the three doors that open it, Undo's words, a reload.
import * as H from './lw-m3b-w2-lib.mjs'
const { L, T, note } = H
console.log('lw-m3b-w2-x2', H.OUT)
const w = await H.deskCtx(); const P = w.page
await L.signInPlain(w, 'admin')
const ranger = await H.idOf(P, 'Ranger')
const f = await H.fileInput(w, { who: 'Ranger', type: 'Other', from: '2026-07-15', remarks: 'Range tasking', goes: 'u', times: null, beforeSave: async o => { if (!(await P.locator('#inpEditAllday').isChecked())) { await L.press(w, '#inpEditAllday'); await P.waitForTimeout(250) } } })
note('filed', 'desk', JSON.stringify({ rec: f.rec, asked: f.asked, readout: f.readout, goesLine: f.goesLine }))
const iid = f.rec.iid
/* list row */
await H.openInputsList(w)
note('list', 'desk', 'row: ' + await P.evaluate(iid => { const e = document.querySelector(`#inBody [data-iid="${iid}"], #inList [data-iid="${iid}"]`); return e ? e.tagName + ' ' + e.innerText.replace(/\s+/g, ' ').slice(0, 160) : null }, iid))
await P.locator(`#inBody [data-iid="${iid}"], #inList [data-iid="${iid}"]`).first().click(); await P.waitForTimeout(700)
note('list-door', 'desk', 'wins: ' + (await H.winsOpen(P)).join(',') + ' goes g=' + await P.locator(T('inpEdit-goes-g')).getAttribute('aria-pressed').catch(() => 'n/a') + ' u=' + await P.locator(T('inpEdit-goes-u')).getAttribute('aria-pressed').catch(() => 'n/a') + ' line=' + await L.txt(P, T('inpEdit-goes-line')))
await H.pic(w, 'x2-list-door', [T('win-inputedit')], { pad: 6 })
await P.keyboard.press('Escape'); await P.waitForTimeout(400)
await L.closeAny(w)
/* calendar bar */
await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(800)
await L.press(w, '#inCalBtn'); await P.waitForTimeout(900)
note('cal', 'desk', 'bars for it: ' + await P.locator(`#inpCal .ib-bar[data-iid="${iid}"]`).count() + ' month title: ' + await L.txt(P, '.in-cal-title, #inpCal .ic-title, [data-testid="ic-month"]'))
const bar = P.locator(`#inpCal .ib-bar[data-iid="${iid}"]`).first()
note('cal', 'desk', 'bar text: ' + (await bar.count() ? (await bar.innerText()) : 'none'))
if (await bar.count()) { await bar.click(); await P.waitForTimeout(700) }
note('cal-door', 'desk', 'wins: ' + (await H.winsOpen(P)).join(',') + ' goes g=' + await P.locator(T('inpEdit-goes-g')).getAttribute('aria-pressed').catch(() => 'n/a') + ' u=' + await P.locator(T('inpEdit-goes-u')).getAttribute('aria-pressed').catch(() => 'n/a'))
await H.pic(w, 'x2-cal', null)
await P.keyboard.press('Escape'); await P.waitForTimeout(400)
await L.closeAny(w)
/* schedule row */
await H.goEdit(w)
note('edit', 'desk', 'Unavailable: ' + JSON.stringify(await H.rowsOf(P, 2, 'sec-unav')))
note('edit', 'desk', 'inpedit buttons in Wed: ' + await P.evaluate(iid => [...document.querySelectorAll(`#eWeek section.day[data-day="2"] [data-inpedit="${iid}"]`)].map(e => e.tagName + '.' + e.className + ':' + e.closest('[class*=sec-]')?.className.split(' ').filter(c => c.startsWith('sec-')).join('+')).join(' | '), iid))
note('undo', 'desk', 'undo button: ' + await P.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? (b.title + ' / ' + b.getAttribute('aria-label') + ' / ' + b.innerText.trim() + ' / disabled=' + b.disabled) : 'none' }))
/* reload */
await P.reload(); await P.waitForTimeout(1500)
note('reload', 'desk', 'login box visible: ' + await L.vis(P, '#luser') + ' page: ' + await P.evaluate(() => window.CURPAGE))
if (await L.vis(P, '#luser')) { await P.fill('#luser', 'ad'); await P.fill('#lpass', 'a'); await P.click('#loginForm button[type=submit]'); await P.waitForSelector('#vWeek .day', { state: 'attached' }); await P.waitForTimeout(800) }
note('reload', 'desk', 'inputs: ' + await P.evaluate(() => (window.INPUTS || []).filter(r => r.type === 'Other').map(r => r.iid + ':' + r.acc + ':' + r.date)))
note('errors', 'desk', JSON.stringify(w.errs))
await w.ctx.close()
await H.closeBrowser()
