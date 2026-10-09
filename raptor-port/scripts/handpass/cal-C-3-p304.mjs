// P3-04 — the two holiday doors edit ONE record (desktop 1440, Saber); real mouse
import { world, toLeaveWar, tid, press, pic, sleep, closeAll, judge, rec, recErrors } from './cal-C-lib.mjs'
const SIZE = 'desk'
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const { page, errors } = await world('desk')
const P = n => `${SIZE}-${n}`
async function holTap(iso) {
  const at = async () => { const [m, y] = (await tid(page, 'holcal-month').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MONTHS.indexOf(m) }
  let d = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1) - await at()
  for (; d > 0; d--) await press(SIZE, tid(page, 'holcal-next-month'))
  for (; d < 0; d++) await press(SIZE, tid(page, 'holcal-prev-month'))
  await press(SIZE, tid(page, `holcal-day-${iso}`))
}
const lines = () => page.locator('.hol-line').evaluateAll(els => els.map(e => ({ from: e.getAttribute('data-from'), t: e.textContent.replace(/\s+/g, ' ').trim() })))
const lineOf = async iso => (await lines()).find(l => l.from === iso) || null
const ev = iso => page.evaluate(i => { const e = document.querySelector(`[data-testid="event-0-${i}"]`); const b = document.querySelector(`[data-testid^="event-band-0-"][data-testid$="${i}"]`); return e ? (e.textContent.trim() || '(empty)') : b ? 'BAND ' + b.textContent.trim() : null }, iso)
const showCell = iso => page.evaluate(i => {
  const el = document.querySelector(`[data-testid="event-0-${i}"]`); if (!el) return
  let p = el.parentElement
  while (p && !(p.scrollWidth > p.clientWidth + 5 && /(auto|scroll)/.test(getComputedStyle(p).overflowX))) p = p.parentElement
  if (!p) return
  p.scrollLeft += el.getBoundingClientRect().left - 500
}, iso)
async function lwClick(iso) {   // a real mouse click on the Leave War's Event cell (the Calendar window is parked low)
  await showCell(iso); await sleep(400)
  const b = await tid(page, `event-0-${iso}`).boundingBox()
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(500)
}
async function lwEdit(iso) { await lwClick(iso); if (await tid(page, 'event-peek-edit').count()) { await tid(page, 'event-peek-edit').click(); await sleep(500) } }
async function addInCalendar(name, short, iso, off = false) {
  await press(SIZE, tid(page, 'hol-add')); await sleep(200)
  if (off) await press(SIZE, tid(page, 'hol-kind-off'))
  await tid(page, 'hol-name').fill(name); await tid(page, 'hol-short').fill(short); await holTap(iso)
  await press(SIZE, tid(page, 'hol-save')); await sleep(500)
}
await toLeaveWar(page)
await press(SIZE, tid(page, 'settings-open')); await press(SIZE, tid(page, 'settings-days'))
await tid(page, 'win-days').waitFor()
await press(SIZE, tid(page, 'days-tab-holidays')); await sleep(300)
await pic(page, P('p304-0-window-open'))

/* A: add through Calendar, see it on the Event row; change through the Leave War; read the Calendar's list */
await addInCalendar('Test Fest', 'tf', '2026-09-22')
const a1 = { line: await lineOf('2026-09-22'), cell: await ev('2026-09-22') }
await lwEdit('2026-09-22')
await pic(page, P('p304-1-event-sheet-edit'))
const sheetVals = { name: await tid(page, 'event-text').inputValue().catch(() => null), short: await tid(page, 'event-short').inputValue().catch(() => null) }
await tid(page, 'event-text').fill('Test Fest Two'); await tid(page, 'event-short').fill('t2')
await pic(page, P('p304-2-event-sheet-changed'))
await tid(page, 'event-apply').click(); await sleep(600)
const a2 = { line: await lineOf('2026-09-22'), cell: await ev('2026-09-22') }
await pic(page, P('p304-3-after-lw-change'))
/* remove through Calendar */
await page.locator('.hol-line[data-from="2026-09-22"]').click(); await sleep(300)
const formVals = { name: await tid(page, 'hol-name').inputValue(), short: await tid(page, 'hol-short').inputValue() }
await tid(page, 'hol-delete').click(); await sleep(500)
const a3 = { line: await lineOf('2026-09-22'), cell: await ev('2026-09-22'), tags: await page.evaluate(() => document.querySelectorAll('[data-testid^="event-band-0-2026-09-22"]').length) }
await pic(page, P('p304-4-removed-in-calendar'))
judge('P3-04a', 'Add "Test Fest"/TF on 22 Sep in Calendar -> Holidays; change it on the Leave War Event row (peek -> Edit -> name "Test Fest Two", short T2 -> Apply); read the Calendar list; open it there and press Delete', [
  ['Calendar add shows on Event row as TF', a1.cell === 'TF' && !!a1.line, a1],
  ['Leave War sheet opened on the same record (name/short)', sheetVals.name === 'Test Fest' && /^TF$/i.test(sheetVals.short || ''), sheetVals],
  ['after the Leave War change the Calendar list reads Test Fest Two (one line, no duplicate) and cell T2', a2.line && /Test Fest Two/.test(a2.line.t) && a2.cell === 'T2', a2],
  ['Calendar form opens on the changed record', formVals.name === 'Test Fest Two' && /^T2$/i.test(formVals.short), formVals],
  ['Delete in Calendar clears the Event row (no orphan tag/text)', !a3.line && (/^(＋|\(empty\))$/.test(a3.cell)) , a3],
], [P('p304-1-event-sheet-edit') + '.png', P('p304-3-after-lw-change') + '.png', P('p304-4-removed-in-calendar') + '.png'])

/* B: reverse — add on the Leave War, change and remove in the Calendar */
await lwClick('2026-09-29')
await pic(page, P('p304-5-lw-empty-cell-sheet'))
const quicks = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="event-quick-"]')].map(b => b.textContent.trim()))
await tid(page, 'event-quick-0').click(); await sleep(200)
if (await tid(page, 'event-text').count()) { await tid(page, 'event-text').fill('LW Day') }
if (await tid(page, 'event-short').count()) { await tid(page, 'event-short').fill('lw') }
await pic(page, P('p304-6-lw-sheet-filled'))
await tid(page, 'event-apply').click(); await sleep(600)
const b1 = { line: await lineOf('2026-09-29'), cell: await ev('2026-09-29'), quicks }
await pic(page, P('p304-7-lw-added'))
await page.locator('.hol-line[data-from="2026-09-29"]').click(); await sleep(300)
await tid(page, 'hol-name').fill('LW Day Two'); await tid(page, 'hol-short').fill('l2')
await tid(page, 'hol-save').click(); await sleep(500)
const b2 = { line: await lineOf('2026-09-29'), cell: await ev('2026-09-29'), n: (await lines()).filter(l => /LW Day/.test(l.t)).length }
await lwEdit('2026-09-29'); const lwSees = { name: await tid(page, 'event-text').inputValue().catch(() => null), short: await tid(page, 'event-short').inputValue().catch(() => null) }
await pic(page, P('p304-8-lw-sheet-after-calendar-change'))
if (await tid(page, 'event-delete').count()) { await tid(page, 'event-delete').click(); await sleep(600) }
const b3 = { line: await lineOf('2026-09-29'), cell: await ev('2026-09-29') }
await pic(page, P('p304-9-lw-deleted'))
judge('P3-04b', 'Reverse: add "LW Day" via the Leave War Event sheet on 29 Sep; change it in Calendar -> Holidays (LW Day Two / L2); open it on the Leave War and Delete there', [
  ['the Leave War add shows in the Calendar list as one PH line', b1.line && /LW Day/.test(b1.line.t) && /PH/.test(b1.line.t), b1],
  ['changed in Calendar -> one line only, Event row prints L2', b2.n === 1 && b2.cell === 'L2', b2],
  ['the Leave War sheet then holds the new name/short', lwSees.name === 'LW Day Two', lwSees],
  ['Delete on the Leave War removes it from the Calendar list', !b3.line && /^(＋|\(empty\))$/.test(b3.cell), b3],
], [P('p304-7-lw-added') + '.png', P('p304-8-lw-sheet-after-calendar-change') + '.png', P('p304-9-lw-deleted') + '.png'])

/* C: a form held open while the underlying event changes */
await addInCalendar('Stale Day', 'sd', '2026-10-06')
await page.locator('.hol-line[data-from="2026-10-06"]').click(); await sleep(300)
await pic(page, P('p304-10-form-open-before'))
await lwEdit('2026-10-06')
await tid(page, 'event-text').fill('Newer Name'); await tid(page, 'event-short').fill('nn')
await tid(page, 'event-apply').click(); await sleep(600)
const formAfterLwChange = { name: await tid(page, 'hol-name').inputValue().catch(() => '(form gone)'), short: await tid(page, 'hol-short').inputValue().catch(() => '(form gone)') }
await pic(page, P('p304-11-form-after-lw-rename'))
/* press Save in the stale form, without touching it */
const formStill = await tid(page, 'win-holiday').count()
let staleSave = null
if (formStill) { await tid(page, 'hol-save').click(); await sleep(600); staleSave = { err: (await tid(page, 'hol-err').count()) ? (await tid(page, 'hol-err').textContent()).trim() : null, formOpen: await tid(page, 'win-holiday').count(), line: await lineOf('2026-10-06'), cell: await ev('2026-10-06'), allNamed: (await lines()).filter(l => l.from && l.from.startsWith('2026-10')) } }
await pic(page, P('p304-12-stale-save'))
console.log('FORM', JSON.stringify(formAfterLwChange), 'STALE', JSON.stringify(staleSave))
judge('P3-04c', 'Holiday form left open on "Stale Day"/SD (6 Oct); the same record renamed on the Leave War to "Newer Name"/NN; Save pressed in the old form without touching it', [
  ['the stale Save is refused with a sentence (not silently applied)', !!staleSave && /no longer there|changed/i.test(staleSave.err || ''), staleSave && staleSave.err],
  ['the newer record is kept (Newer Name / NN), no duplicate line', staleSave && staleSave.cell === 'NN' && staleSave.allNamed.length === 1 && /Newer Name/.test(staleSave.allNamed[0].t), staleSave && { cell: staleSave.cell, lines: staleSave.allNamed }],
], [P('p304-11-form-after-lw-rename') + '.png', P('p304-12-stale-save') + '.png'])
/* d: form open, the event deleted on the Leave War meanwhile */
await tid(page, 'hol-cancel').click().catch(() => {}); await sleep(300)
await page.locator('.hol-line[data-from="2026-10-06"]').click(); await sleep(300); await tid(page, 'hol-delete').click(); await sleep(400)
await addInCalendar('Gone Day', 'gd', '2026-10-13')
await page.locator('.hol-line[data-from="2026-10-13"]').click(); await sleep(300)
await lwEdit('2026-10-13')
await tid(page, 'event-delete').click(); await sleep(600)
const formAfterDelete = await tid(page, 'win-holiday').count()
await tid(page, 'hol-save').click(); await sleep(600)
const delSave = { err: (await tid(page, 'hol-err').count()) ? (await tid(page, 'hol-err').textContent()).trim() : null, line: await lineOf('2026-10-13'), cell: await ev('2026-10-13'), formOpen: await tid(page, 'win-holiday').count() }
await pic(page, P('p304-13-save-after-lw-delete'))
judge('P3-04d', 'Holiday form open on "Gone Day" (13 Oct); the event deleted on the Leave War; Save pressed in the form', [
  ['refused with a sentence', /no longer there|taken away|removed|deleted/i.test(delSave.err || ''), delSave.err],
  ['nothing re-created on the Event row or in the list', !delSave.line && /^(＋|\(empty\))$/.test(delSave.cell), delSave],
], [P('p304-13-save-after-lw-delete') + '.png'])
recErrors(P('script3'), errors)
await closeAll()
