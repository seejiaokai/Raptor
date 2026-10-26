// W2 explore 7 — a Meeting with no OIL answer on a non-working day: first a Saturday (can it be filed unanswered?), then a weekday made a holiday afterwards.
import * as H from './lw-m3b-w2-lib.mjs'
const { L, T, note } = H
const w = await H.deskCtx(); const P = w.page
await L.signInPlain(w, 'admin')
const ranger = await H.idOf(P, 'Ranger')
/* A: Saturday, answer withheld — the question's own buttons */
await H.newWindow(w, 'Ranger', 'Meeting')
await P.locator('#inpEditRmk').fill('Sat meet')
if (await P.locator('#inpEditAllday').count() && !(await P.locator('#inpEditAllday').isChecked())) await L.press(w, '#inpEditAllday')
note('x7', 'desk', 'dates: ' + await H.pickDates(w, '2026-07-18'))
await L.press(w, '#inpEditSave'); await P.waitForTimeout(1200)
note('x7', 'desk', 'after Add on a Saturday: ' + (await H.winsOpen(P)).join(','))
note('x7', 'desk', 'question buttons: ' + await P.evaluate(() => [...document.querySelectorAll('[data-testid="oilconf"] button')].map(b => (b.dataset.testid || '') + '=' + b.textContent.trim()).join(' | ')))
await L.press(w, T('oilconf-cancel')); await P.waitForTimeout(600)
note('x7', 'desk', 'after Back: ' + (await H.winsOpen(P)).join(',') + ' inputs now: ' + await P.evaluate(() => (window.INPUTS || []).filter(r => r.type === 'Meeting').length))
await L.press(w, '#inpEditCancel'); await P.waitForTimeout(600)
note('x7', 'desk', 'after Cancel: ' + (await H.winsOpen(P)).join(',') + ' meetings: ' + await P.evaluate(() => (window.INPUTS || []).filter(r => r.type === 'Meeting').length))
/* B: a Meeting on Wed 15, then the day made a holiday through the war's Event row */
const f = await H.fileInput(w, { who: 'Ranger', type: 'Meeting', from: '2026-07-15', remarks: 'Hol meet', tag: 'x7', beforeSave: async () => { if (await P.locator('#inpEditAllday').count() && !(await P.locator('#inpEditAllday').isChecked())) await L.press(w, '#inpEditAllday') } })
note('x7', 'desk', 'meeting acc ' + f.rec.acc + ' oil ' + JSON.stringify(f.rec.oil) + ' asked ' + JSON.stringify(f.asked))
await H.warOpen(w, ranger, '2026-07-15')
const ev = T('event-1-2026-07-15')
note('x7', 'desk', 'event cell present: ' + await P.locator(ev).count() + ' ; event cells for 15 Jul: ' + await P.evaluate(() => [...document.querySelectorAll('[data-testid^="event-"][data-testid$="2026-07-15"]')].map(e => e.dataset.testid).join(',')))
await P.locator(ev).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await P.waitForTimeout(400)
await L.press(w, ev); await P.waitForTimeout(900)
note('x7', 'desk', 'event sheet testids: ' + await P.evaluate(() => [...document.querySelectorAll('[data-testid^="event-"]')].filter(e => e.getBoundingClientRect().width > 0 && !/^event-(1|2)-/.test(e.dataset.testid)).map(e => e.dataset.testid).join(', ')))
note('x7', 'desk', 'sheet words: ' + await P.evaluate(() => { const s = [...document.querySelectorAll('.bidsheet, .sheet, [role=dialog]')].filter(e => e.getBoundingClientRect().width > 0).pop(); return s ? s.innerText.replace(/\s+/g, ' ').slice(0, 500) : 'none' }))
await H.pic(w, 'x7-event-sheet', null)
note('errors', 'desk', JSON.stringify(w.errs))
await w.ctx.close(); await H.closeBrowser()
