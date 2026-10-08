// P5-08 — keyboard use stays on the intended calendar object. Real keyboard with real focus.
import { launch, world, toInputs, toMonth, cell, bar, shot, press, saveRows, seedFile, recOf } from './cal-E-lib.mjs'
const size = 'desk'
const b = await launch()
const log = []
const L = (...a) => { log.push(a.join(' ')); console.log(...a) }
const res = {}
const w = await world(b, size); const p = w.page
const N = n => `p508-${size}-${n}`
await toInputs(p); await toMonth(p, 2026, 12)
const sid = await p.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Saber'))
const [iid] = await seedFile(p, [{ pid: sid, type: 'LL', from: 'Dec 15', remarks: 'kbd target' }, { who: 6, type: 'Meeting', from: 'Dec 15', timed: [600, 660] }])
await p.waitForTimeout(400)
const act = () => p.evaluate(() => { const a = document.activeElement; return a ? { tag: a.tagName, id: a.id, day: a.dataset?.icday || null, tid: a.dataset?.testid || null, inGrid: !!a.closest?.('[data-testid="ib-grid"]') } : null })
const tabIndexes = await p.evaluate(() => [...document.querySelectorAll('[data-testid="ib-grid"] [tabindex]')].filter(e => e.tabIndex >= 0).map(e => e.dataset.icday || e.className))
L('elements in the grid with tabindex >= 0:', JSON.stringify(tabIndexes)); res.tabStops = tabIndexes
// real Tab from the gear into the grid
await p.locator('[data-testid="in-gear"]').focus()
let steps = 0, a
do { await p.keyboard.press('Tab'); a = await act(); steps++ } while (!a.inGrid && steps < 20)
L('Tab from the gear reached the grid after', steps, 'presses:', JSON.stringify(a)); res.reach = a
await shot(p, N('1-focus-in-grid'))
let stops = 1
// Tab again: does it leave the grid in one press?
await p.keyboard.press('Tab'); const after = await act(); L('next Tab goes to:', JSON.stringify(after), 'still in grid?', after.inGrid); res.leaves = !after.inGrid
await p.keyboard.press('Shift+Tab'); L('Shift+Tab back:', JSON.stringify(await act()))
// where is the focus? go to 31 Dec for the edge tests
await p.locator('[data-icday="2026-12-31"]').focus()
L('focused', JSON.stringify(await act()))
await p.keyboard.press('ArrowRight'); await p.waitForTimeout(400)
let st = { mon: await p.locator('#inpCal .ic-mon').innerText(), a: await act() }
L('31 Dec + ArrowRight ->', JSON.stringify(st)); res.yearEdgeRight = st
await shot(p, N('2-year-edge-right'))
await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(400)
st = { mon: await p.locator('#inpCal .ic-mon').innerText(), a: await act() }; L('then ArrowLeft ->', JSON.stringify(st)); res.yearEdgeLeft = st
await p.keyboard.press('ArrowDown'); await p.waitForTimeout(300)
st = { mon: await p.locator('#inpCal .ic-mon').innerText(), a: await act() }; L('31 Dec ArrowDown (next week, next month) ->', JSON.stringify(st)); res.down = st
await p.keyboard.press('ArrowUp'); await p.waitForTimeout(300)
st = { mon: await p.locator('#inpCal .ic-mon').innerText(), a: await act() }; L('ArrowUp ->', JSON.stringify(st)); res.up = st
// month edge: 1 Dec ArrowLeft
await p.locator('[data-icday="2026-12-01"]').focus(); await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(400)
st = { mon: await p.locator('#inpCal .ic-mon').innerText(), a: await act() }; L('1 Dec ArrowLeft ->', JSON.stringify(st)); res.monthEdgeLeft = st
await toMonth(p, 2026, 12)
// Shift+arrows stretch a run
await p.locator('[data-icday="2026-12-15"]').focus()
await p.keyboard.press('Shift+ArrowRight'); await p.keyboard.press('Shift+ArrowRight')
const picked = await p.evaluate(() => [...document.querySelectorAll('.ib-day.is-picked')].map(e => e.dataset.icday))
L('Shift+ArrowRight x2 from 15 Dec: picked', JSON.stringify(picked)); res.shift = picked
await shot(p, N('3-shift-run'))
await p.keyboard.press('Enter'); await p.waitForTimeout(500)
L('Enter on the run: editor windows', await p.locator('[data-testid="win-inputedit"]').count(), '| range text', await p.locator('#inpEditPop .rc-read').innerText().catch(() => 'n/a'), '| active', JSON.stringify(await act()))
await shot(p, N('4-enter-run'))
// typing in the editor's field: Delete, Backspace, arrows do not touch the calendar
await p.fill('#inpEditRmk', 'abc def')
await p.locator('#inpEditRmk').focus()
const monBefore = await p.locator('#inpCal .ic-mon').innerText(), snapBefore = await p.evaluate(() => window.INPUTS.length)
for (const k of ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']) await p.keyboard.press(k)
await p.keyboard.press('Shift+ArrowRight'); await p.keyboard.press('Shift+ArrowLeft')
L('after text-editing keys in Remarks: month', monBefore, '->', await p.locator('#inpCal .ic-mon').innerText(), '| INPUTS count', snapBefore, '->', await p.evaluate(() => window.INPUTS.length), '| field now', JSON.stringify(await p.inputValue('#inpEditRmk')), '| picked days', await p.locator('.ib-day.is-picked').count(), '| editor still open', await p.locator('[data-testid="win-inputedit"]').count())
res.typing = { month: await p.locator('#inpCal .ic-mon').innerText(), count: await p.evaluate(() => window.INPUTS.length), editor: await p.locator('[data-testid="win-inputedit"]').count() }
// the editor's own Escape closes the editor and the page then?
await p.keyboard.press('Escape'); await p.waitForTimeout(300)
L('Escape in the editor: editor windows', await p.locator('[data-testid="win-inputedit"]').count(), '| picked', await p.locator('.ib-day.is-picked').count(), '| active', JSON.stringify(await act()))
// the opened day by Enter on a focused date
await p.locator('[data-icday="2026-12-15"]').focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(500)
L('Enter on a single focused date: day windows', await p.locator('[data-testid="win-inputsday"]').count(), '| active', JSON.stringify(await act()))
await shot(p, N('5-day-by-enter'))
// Tab to a line of the opened day, press Backspace then Delete
let t = 0, aa
do { await p.keyboard.press('Tab'); aa = await act(); t++ } while (!(aa.tid === 'idy-open') && t < 25)
L('Tab reached', JSON.stringify(aa), 'after', t, 'presses')
const before = await p.evaluate(() => window.INPUTS.length)
const rowTid = await p.evaluate(() => document.activeElement.closest('[data-testid^="idy-row-"]')?.dataset.testid)
await p.keyboard.press('Backspace'); await p.waitForTimeout(300)
const askBS = await p.locator('[data-testid="idy-del-yes"]').count()
L('Backspace on the line: asks?', askBS, '| records', before, '->', await p.evaluate(() => window.INPUTS.length), '| row', rowTid)
await shot(p, N('6-backspace-asks'))
res.backspaceAsks = askBS
// answer Keep, then Delete key, asks again; then Delete confirm via Tab/Enter
if (askBS) { await p.locator('[data-testid="idy-del-no"]').click(); await p.waitForTimeout(200) }
await p.locator(`[data-testid="${rowTid}"] [data-testid="idy-open"]`).focus()
await p.keyboard.press('Delete'); await p.waitForTimeout(300)
const askDel = await p.locator('[data-testid="idy-del-yes"]').count()
L('Delete on the line: asks?', askDel, '| records', await p.evaluate(() => window.INPUTS.length))
res.deleteAsks = askDel
// Escape: closes the ask first? then the day
await p.keyboard.press('Escape'); await p.waitForTimeout(300)
L('Escape with the ask up: ask', await p.locator('[data-testid="idy-del-yes"]').count(), '| day windows', await p.locator('[data-testid="win-inputsday"]').count(), '| records', await p.evaluate(() => window.INPUTS.length))
await p.keyboard.press('Escape'); await p.waitForTimeout(300)
L('Escape again: day windows', await p.locator('[data-testid="win-inputsday"]').count(), '| picked', await p.locator('.ib-day.is-picked').count(), '| page', await p.evaluate(() => window.CURPAGE), '| active', JSON.stringify(await act()))
await shot(p, N('7-escapes'))
// text editing in the day's own title box: Delete/Backspace/arrows
await p.locator('[data-icday="2026-12-15"]').focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(400)
const title = p.locator('[data-testid="win-inputsday"] input').first()
await title.focus(); await p.keyboard.type('note x'); const recs = await p.evaluate(() => window.INPUTS.length)
for (const k of ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight']) await p.keyboard.press(k)
L('typing in the day-title box: records', recs, '->', await p.evaluate(() => window.INPUTS.length), '| month', await p.locator('#inpCal .ic-mon').innerText(), '| active', JSON.stringify(await act()))
res.titleTyping = { recs, after: await p.evaluate(() => window.INPUTS.length) }
await shot(p, N('8-title-typing'))
// Escape on a date with a run picked and no day open: the run lets go, the calendar is not left
await p.keyboard.press('Escape'); await p.waitForTimeout(200)
await p.locator('[data-icday="2026-12-22"]').focus(); await p.keyboard.press('Shift+ArrowRight'); await p.keyboard.press('Shift+ArrowRight')
const pk1 = await p.locator('.ib-day.is-picked').count()
await p.keyboard.press('Escape'); await p.waitForTimeout(250)
L('Escape on a date with a 3-day run picked: picked', pk1, '->', await p.locator('.ib-day.is-picked').count(), '| page', await p.evaluate(() => window.CURPAGE), '| active', JSON.stringify(await act()), '| month', await p.locator('#inpCal .ic-mon').innerText())
await shot(p, N('9-escape-run'))
L('errors', JSON.stringify(w.errors))
saveRows('p508-' + size, [{ log, res, errors: w.errors }])
await b.close()
