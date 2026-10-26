// W2 explore 5 — a published day: publish through the board, file an Other, read the pending marks, the issued face, the war.
process.env.HP_URL = 'http://localhost:4180'
import * as H from './lw-m3b-w2-lib.mjs'
const { L, T, note } = H
process.env.HP_SHOTS = H.OUT
const HPL = await import('./lib.mjs')
const w = await H.deskCtx(); const P = w.page
await L.signInPlain(w, 'admin')
const ranger = await H.idOf(P, 'Ranger')
const ISO = '2026-07-15', DI = 2
const dayHead = (page, di) => P.evaluate(([page, di]) => { const d = document.querySelector(`${page === 'editsched' ? '#eWeek' : '#vWeek'} section.day[data-day="${di}"]`); if (!d) return 'no day'; const h = d.querySelector('.dayhead, .day-head, header, .dh') || d.firstElementChild; return (h ? h.innerText : d.innerText.slice(0, 200)).replace(/\s+/g, ' ').slice(0, 300) }, [page, di])
await H.goEdit(w)
note('x5', 'desk', 'Wed head before: ' + await dayHead('editsched', DI))
await HPL.board(P, DI)
const pub = await HPL.publish(P, DI)
note('x5', 'desk', 'publish: ' + JSON.stringify(pub))
await HPL.closeBoard(P)
await H.goEdit(w)
note('x5', 'desk', 'Wed head after publish: ' + await dayHead('editsched', DI))
const f = await H.fileInput(w, { who: 'Ranger', type: 'Other', from: ISO, remarks: 'Pub other', goes: 'u', tag: 'x5', beforeSave: async () => { if (!(await P.locator('#inpEditAllday').isChecked())) await L.press(w, '#inpEditAllday') } })
const iid = f.rec.iid
note('x5', 'desk', 'filed acc ' + f.rec.acc + ' asked ' + JSON.stringify(f.asked))
await H.goEdit(w)
note('x5', 'desk', 'Wed head after filing: ' + await dayHead('editsched', DI))
note('x5', 'desk', 'Unavailable: ' + JSON.stringify((await H.rowsOf(P, DI, 'sec-unav')).rows?.map(r => r.text)))
note('x5', 'desk', 'unav row outer html (first 700): ' + await P.evaluate(() => (document.querySelector('#eWeek section.day[data-day="2"] .sec-unav .pl-row')?.outerHTML || '').slice(0, 700)))
await H.pic(w, 'x5-edit', ['#eWeek section.day[data-day="2"]'], { pad: 4 })
await P.evaluate(() => window.go('viewsched')); await P.waitForTimeout(1500)
note('x5', 'desk', 'View-only Wed Unavailable: ' + JSON.stringify((await H.rowsOf(P, DI, 'sec-unav', '#vWeek')).rows?.map(r => r.text)) + ' | head: ' + await dayHead('viewsched', DI))
await H.warOpen(w, ranger, ISO)
note('x5', 'desk', 'war: ' + JSON.stringify(await H.cellBoxes(w, ranger, ISO)) + ' avail ' + await H.availP(P, ISO))
note('errors', 'desk', JSON.stringify(w.errs))
await w.ctx.close(); await H.closeBrowser()
