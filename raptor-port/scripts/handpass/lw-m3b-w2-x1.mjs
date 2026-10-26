// W2 explore 1 — learn the DOM of the Inputs window, the SANS calendar, Edit Schedule (no assertions, no report).
import * as H from './lw-m3b-w2-lib.mjs'
const { L, T, note } = H
console.log('lw-m3b-w2-x1', H.OUT)
const w = await H.deskCtx(); const P = w.page
await L.signInPlain(w, 'admin')
note('bundle', 'desk', await H.bundleName(P))
const ranger = await H.idOf(P, 'Ranger'); note('ranger', 'desk', ranger)
await H.newWindow(w, 'Ranger', 'Other')
note('win', 'desk', 'labels: ' + await P.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"] .inped-k')].map(e => e.textContent).join(' · ')))
note('win', 'desk', 'type options: ' + await P.evaluate(() => [...document.querySelectorAll('#inpEditType option')].map(o => o.value + '=' + o.textContent).join(', ')))
note('win', 'desk', 'readout: ' + await H.rangeRead(P))
note('win', 'desk', 'ids: ' + await P.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"] [id]')].map(e => e.id).join(', ')))
note('win', 'desk', 'testids: ' + await P.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"] [data-testid]')].map(e => e.dataset.testid).join(', ')))
note('win', 'desk', 'goes: ' + await L.txt(P, T('inpEdit-goes-line')) + ' | g=' + await P.locator(T('inpEdit-goes-g')).getAttribute('aria-pressed') + ' u=' + await P.locator(T('inpEdit-goes-u')).getAttribute('aria-pressed'))
await H.pic(w, 'x1-window', [T('win-inputedit')], { pad: 6 })
const ro = await H.pickDates(w, '2026-07-15'); note('dates', 'desk', 'after one tap pair on 15 Jul: ' + ro)
await H.pic(w, 'x1-window-dated', [T('win-inputedit')], { pad: 6 })
await P.keyboard.press('Escape'); await P.waitForTimeout(400)
note('win-after-escape', 'desk', (await H.winsOpen(P)).join(','))
await L.closeAny(w)
/* the SANS calendar */
await H.sansOpen(w)
note('sans', 'desk', 'month: ' + await P.locator(T('sc-month')).getAttribute('aria-label'))
note('sans', 'desk', 'went to: ' + await H.sansMonth(w, 2026, 7))
note('sans', 'desk', '15 Jul need: ' + await H.sansNeed(P, '2026-07-15') + ' | day words: ' + await H.sansDayWords(P, '2026-07-15'))
await H.pic(w, 'x1-sans-july', [T('sc-day-2026-07-15')], { pad: 30 })
/* the war */
await H.warOpen(w, ranger, '2026-07-15')
note('war', 'desk', 'avail 15 Jul: ' + await H.availP(P, '2026-07-15') + ' req ' + await H.reqP(P, '2026-07-15') + ' cell ' + JSON.stringify(await H.cellBoxes(w, ranger, '2026-07-15')))
/* Edit Schedule */
await H.goEdit(w)
for (const sec of ['sec-unav', 'sec-grnd', 'sec-inp']) note('edit', 'desk', 'Wed ' + sec + ': ' + JSON.stringify(await H.rowsOf(P, 2, sec)))
note('errors', 'desk', JSON.stringify(w.errs))
await w.ctx.close()
await H.closeBrowser()
