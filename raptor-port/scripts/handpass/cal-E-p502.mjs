// P5-02 — an untouched field follows a background edit without overwriting it.
// Doors behind the window: (A) a real mouse DRAG of the bar (dates); (B) the List's row editor (hours), the List behind the window.
import { launch, world, toInputs, toMonth, cell, bar, shot, press, saveRows, makeInput, closeDay, mouseDrag, centreOf, dayCentre, recOf } from './cal-E-lib.mjs'
const size = process.argv[2] || 'desk'
const b = await launch()
const w = await world(b, size); const p = w.page
const log = []
const L = (...a) => { log.push(a.join(' ')); console.log(...a) }
const N = n => `p502-${size}-${n}`
await toInputs(p)
const ttl = () => p.locator('[data-testid="win-inputedit"] .win-ttl').innerText().catch(() => 'NO WINDOW')
const fields = () => p.evaluate(() => ({ rmk: document.getElementById('inpEditRmk')?.value, st: document.getElementById('inpEditStart')?.value, en: document.getElementById('inpEditEnd')?.value, type: document.getElementById('inpEditType')?.value }))
const sel = r => r && { date: r.date, endDate: r.endDate, s: r.s, e: r.e, remarks: r.remarks, allday: r.allday }

// --- RUN A: dates changed behind the window by a bar drag
const [iid] = await makeInput(p, size, '2026-10-20', { type: 'Duty', remarks: 'orig remark' })
await closeDay(p)
L('made', iid, JSON.stringify(sel(await recOf(p, iid))))
await press(p, size, bar(p, iid)); await p.waitForSelector('[data-testid="win-inputedit"]'); await p.waitForTimeout(300)
L('editor', await ttl(), JSON.stringify(await fields()))
await p.fill('#inpEditRmk', 'LOCAL remark')
await shot(p, N('a1-local-remark'))
// drag the bar one day later with a real mouse
const from = await centreOf(bar(p, iid)), to = await dayCentre(p, '2026-10-21')
await mouseDrag(p, from, { x: to.x, y: from.y + 2 })
await p.waitForTimeout(500)
L('after drag record', JSON.stringify(sel(await recOf(p, iid))))
L('editor now', await ttl(), JSON.stringify(await fields()))
await shot(p, N('a2-after-drag'))
await press(p, size, p.locator('#inpEditSave')); await p.waitForTimeout(500)
const ra = await recOf(p, iid)
L('after Save record', JSON.stringify(sel(ra)))
await shot(p, N('a3-saved'))
const aPass = ra.date === 'Oct 21' && ra.remarks === 'LOCAL remark'

// --- RUN B: hours changed through the List's row editor, the List behind the window
await closeDay(p)
await press(p, size, bar(p, iid)); await p.waitForSelector('[data-testid="win-inputedit"]'); await p.waitForTimeout(300)
await p.fill('#inpEditRmk', 'LOCAL two')
await press(p, size, p.locator('#inListBtn')); await p.waitForTimeout(400)
L('List is up; editor still open?', await p.locator('[data-testid="win-inputedit"]').count())
await shot(p, N('b1-list-behind'))
// the window sits over the List's action column: a real mouse drag of its bar moves it down and left (D641)
{ const g = await centreOf(p.locator('[data-testid="win-inputedit"] .win-bar')); await mouseDrag(p, { x: g.x - 60, y: g.y }, { x: g.x - 560, y: g.y + 330 }); await p.waitForTimeout(300) }
await shot(p, N('b1b-window-moved'))
const rowSel = `#inBody tr[data-iid="${iid}"]`
await press(p, size, p.locator(`${rowSel} [data-edit]`)); await p.waitForTimeout(300)
const times = p.locator(`${rowSel} input[type="time"]`)
L('row editor time inputs', await times.count())
await shot(p, N('b2-row-editor'))
await times.nth(0).fill('08:30'); await times.nth(1).fill('15:45')
await p.waitForTimeout(150)
await press(p, size, p.locator(`${rowSel} .inact span`).first()).catch(() => {})
L('row buttons', await p.evaluate(sel => [...document.querySelectorAll(sel + ' .inact *')].map(e => e.className + ':' + (e.title || e.textContent)), rowSel))
await p.waitForTimeout(500)
L('after row save record', JSON.stringify(sel(await recOf(p, iid))))
L('editor now', await ttl(), JSON.stringify(await fields()))
await shot(p, N('b3-after-list-edit'))
await press(p, size, p.locator('#inpEditSave')); await p.waitForTimeout(500)
const rb = await recOf(p, iid)
L('after Save record', JSON.stringify(sel(rb)))
await shot(p, N('b4-saved'))
const bPass = rb.remarks === 'LOCAL two' && rb.s === 8 * 60 + 30 && rb.e === 15 * 60 + 45
L('errors', JSON.stringify(w.errors))
saveRows('p502-' + size, [{ log, aPass, bPass, errors: w.errors }])
await b.close()
