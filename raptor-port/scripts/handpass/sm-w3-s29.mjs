// W3 S29 + the plain-user round — file a leave on a published day, open it from week and board, edit, close every way, Undo, Redo, publish AL. node sm-w3-s29.mjs pc|phone
import * as L from './sm-lib.mjs'
const size = process.argv[2] || 'pc'
console.log('sm-w3-s29 v1', size)
const OUT = L.outDir('w3')
const res = {}
const step = async (k, fn) => { try { res[k] = await fn(); console.log(k, JSON.stringify(res[k])) } catch (e) { res[k] = { err: e.message.split('\n')[0] }; console.log(k, 'ERR', res[k].err) } }
const W = await L.launch(size, { origin: 'http://localhost:4394' })
const P = W.page
await L.signIn(W)
await L.publishDay(W, 2); await L.closeBoard(W)
const writes = () => P.evaluate(() => (window.INPUTS || []).length)
const winState = () => P.evaluate(() => { const sv = document.querySelector('#inpEditSave'); const r = sv && sv.getBoundingClientRect(); let w = sv; for (let i = 0; w && i < 8; i++) { if (/win|modal|dialog/i.test(w.className + ' ' + (w.getAttribute('role') || '') + ' ' + (w.dataset.testid || ''))) break; w = w.parentElement } const btns = w ? [...w.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width).map(b => (b.id || '') + ':' + (b.getAttribute('aria-label') || b.title || b.textContent.trim()).slice(0, 24)) : []; return { open: !!(r && r.width > 0), cls: w && String(w.className).slice(0, 60), btns: btns.slice(0, 14) } })
const marks = async () => ({ wk: await L.weekUnavMark(P, 2, 'Bolt'), pend: await L.dayPending(P, 2) })
const input = await L.fileInput(W, { who: 'Bolt', type: 'LL', iso: '2026-07-15' })
console.log('filed', JSON.stringify(input && { iid: input.iid, type: input.type }))
await L.goEdit(W)
await step('1.week-after-file', marks)
await L.center(P, '#eWeek section.day[data-day="2"] .sec-unav'); await L.sleep(300)
await L.pic(W, OUT, `s29-${size}-1-week-marked`, { sel: '#eWeek section.day[data-day="2"] .sec-unav' })
// bell
await step('1b.bell', async () => { const n = await P.evaluate(() => { const b = document.querySelector('[title="Notifications"]'); const s = b && b.querySelector('.bellcnt, .badge, [class*=count]'); return { badge: s && s.textContent.trim() } }); return n })
// open from the week: tap the name
const rowName = '#eWeek section.day[data-day="2"] .sec-unav .pl-row:has(.ntx) .nm .ntx'
const openFromWeek = async () => { const l = P.locator(`#eWeek section.day[data-day="2"] .sec-unav .pl-row`, { hasText: 'Bolt' }).filter({ visible: true }).first().locator('.nm .ntx'); await L.center(P, '#eWeek section.day[data-day="2"] .sec-unav'); await (W.phone ? l.tap() : l.click()); await L.sleep(900) }
await step('2.open-from-week', async () => { await openFromWeek(); return winState() })
await P.screenshot({ path: OUT + `/s29-${size}-2-window-open.png` })
const closeBy = {
  ' Close button': async () => { const b = P.locator('button', { hasText: /^Cancel$/ }).filter({ visible: true }).first(); if (!(await b.count())) return 'no Close/Cancel button'; await (W.phone ? b.tap() : b.click()) },
  'x': async () => { const b = P.locator('button[aria-label="Close"], button[title="Close"], .win-x, .modal-x, .wclose').filter({ visible: true }).first(); if (!(await b.count())) return 'no x button'; await (W.phone ? b.tap() : b.click()) },
  'Escape': async () => { await P.keyboard.press('Escape') },
  'outside': async () => { await P.mouse.click(8, 400) },
}
for (const [name, fn] of Object.entries(closeBy)) {
  await step(`3.close-by-${name.trim()}`, async () => {
    if (!(await winState()).open) { await openFromWeek() }
    if (!(await winState()).open) return { err: 'window did not open' }
    const before = await winState()
    const note = await fn()
    await L.sleep(800)
    const after = await winState()
    return { before: before.open, note: note || null, after: after.open, inputs: await writes(), pageBehind: await P.evaluate(() => window.CURPAGE) }
  })
  await P.screenshot({ path: OUT + `/s29-${size}-3-after-${name.trim().replace(/\W/g, '')}.png` })
}
// dirty close: open, change remarks, close via Escape
await step('4.dirty-close', async () => {
  if (!(await winState()).open) await openFromWeek()
  await P.locator('#inpEditRmk').fill('Dentist 14:00'); await L.sleep(300)
  await P.keyboard.press('Escape'); await L.sleep(800)
  const s = await winState()
  const q = await P.evaluate(() => [...document.querySelectorAll('button, div')].filter(e => e.getBoundingClientRect().width && /lose them|Close it and lose/i.test(e.textContent) && e.children.length < 4).map(e => e.textContent.trim().slice(0, 80)).slice(0, 3))
  return { open: s.open, question: q }
})
await P.screenshot({ path: OUT + `/s29-${size}-4-dirty-close.png` })
// answer the dirty-close question with "keep editing" if visible, then save
await step('5.edit-save', async () => {
  const keep = P.locator('button', { hasText: /Keep editing|Stay|No/ }).filter({ visible: true }).first()
  if (await keep.count()) { await (W.phone ? keep.tap() : keep.click()); await L.sleep(500) }
  if (!(await winState()).open) { await openFromWeek(); await P.locator('#inpEditRmk').fill('Dentist 14:00'); await L.sleep(300) }
  await P.locator('#inpEditSave').click(); await L.sleep(1200)
  for (let i = 0; i < 3; i++) { const a = P.locator(L.T('docconf-nodoc')).filter({ visible: true }).first(); if (await a.count()) { await a.click(); await L.sleep(600) } }
  return { win: (await winState()).open, remarks: await P.evaluate(() => (window.INPUTS || []).map(r => r.rmk || r.remarks || '').filter(Boolean)), ...(await marks()) }
})
await L.center(P, '#eWeek section.day[data-day="2"] .sec-unav')
await L.pic(W, OUT, `s29-${size}-5-after-edit`, { sel: '#eWeek section.day[data-day="2"] .sec-unav' })
// board: open from board
await L.openBoard(W, 2)
await step('6.board-mark', () => L.boardUnavMark(P, 'Bolt'))
await L.center(P, '#schedBoard .sb-panel.unav')
await L.pic(W, OUT, `s29-${size}-6-board-marked`, { sel: '#schedBoard .sb-panel.unav' })
await step('7.open-from-board', async () => { const l = P.locator('#schedBoard .sb-panel.unav .sb-arow', { hasText: 'Bolt' }).filter({ visible: true }).first().locator('.sbi-ty'); await (W.phone ? l.tap() : l.click()); await L.sleep(900); return winState() })
await P.screenshot({ path: OUT + `/s29-${size}-7-board-window.png` })
await step('7b.escape-on-board', async () => { await P.keyboard.press('Escape'); await L.sleep(700); return { win: (await winState()).open, board: await P.locator('#schedBoard').count() } })
await step('7c.board-still-open', async () => ({ win: (await winState()).open, boardVisible: await P.evaluate(() => { const b = document.getElementById('schedBoard'); return !!(b && b.getBoundingClientRect().width) }) }))
// Undo / Redo (the top bar of the board)
const undoBtn = '#schedBoard [title^="Undo"]', redoBtn = '#schedBoard [title^="Redo"]'
await step('8.undo', async () => { const b = P.locator(undoBtn).filter({ visible: true }).first(); await (W.phone ? b.tap() : b.click()); await L.sleep(900); return { remarks: await P.evaluate(() => (window.INPUTS || []).map(r => r.rmk || r.remarks || '')), mark: await L.boardUnavMark(P, 'Bolt'), toast: await L.toastText(P) } })
await L.pic(W, OUT, `s29-${size}-8-undo`, { sel: '#schedBoard .sb-panel.unav' })
await step('8b.undo-the-filing', async () => { const b = P.locator(undoBtn).filter({ visible: true }).first(); await (W.phone ? b.tap() : b.click()); await L.sleep(900); return { inputs: await writes(), mark: await L.boardUnavMark(P, 'Bolt'), toast: await L.toastText(P) } })
await step('9.redo', async () => { const b = P.locator(redoBtn).filter({ visible: true }).first(); await (W.phone ? b.tap() : b.click()); await L.sleep(900); return { inputs: await writes(), mark: await L.boardUnavMark(P, 'Bolt'), toast: await L.toastText(P) } })
await L.pic(W, OUT, `s29-${size}-9-redo`, { sel: '#schedBoard .sb-panel.unav' })
await L.closeBoard(W); await L.goEdit(W)
await step('10.week-after-redo', marks)
// View-only Sched while pending, and the bell
await step('11.viewonly', async () => { await P.evaluate(() => window.go('viewsched')); await L.sleep(1200); await L.center(P, '#vWeek .day[data-day="2"]'); return P.evaluate(() => { const d = document.querySelector('#vWeek .day[data-day="2"]'); const rows = [...d.querySelectorAll('.pl-row')].filter(r => r.textContent.includes('Bolt') && r.getBoundingClientRect().height); return rows.map(r => { const b = r.querySelector('.nm .ntx'); const cs = b && getComputedStyle(b); return { aln: b && b.dataset.aln, deco: cs && cs.textDecorationLine + ' ' + cs.textDecorationStyle } }) }) })
await L.pic(W, OUT, `s29-${size}-11-viewonly`, { sel: '#vWeek .day[data-day="2"]', pad: 0 })
await L.goEdit(W)
// publish the amendment, then look again
console.log('publishAL', JSON.stringify(await L.publishDay(W, 2))); await L.closeBoard(W); await L.goEdit(W)
await step('12.after-AL1', marks)
await L.center(P, '#eWeek section.day[data-day="2"] .sec-unav')
await L.pic(W, OUT, `s29-${size}-12-after-al1`, { sel: '#eWeek section.day[data-day="2"] .sec-unav' })
await step('13.changes-clock', async () => { const b = P.locator('#eWeek [title*="changes"], [title="Show the changes, and who changed each detail — hover it, or tap it on a phone"]').filter({ visible: true }).first(); return { found: await b.count() } })
console.log('errs', JSON.stringify(W.errs))
L.saveJson(OUT, `s29-${size}-results`, res)
await L.closeAll(W)
