// P5-04 — deletion behind an editor cannot resurrect the input.
// Doors behind the window: (A) the opened day's Delete (and its confirm); (B) the top bar's Undo of the creation;
// (C) one member of a shared entry taken out through the opened day's Delete as that man (identity swapped IN PLACE, window kept).
import { launch, world, toInputs, toMonth, cell, bar, shot, press, saveRows, makeInput, closeDay, centreOf, recOf, mouseDrag } from './cal-E-lib.mjs'
const size = process.argv[2] || "desk"; const only = process.argv[3]
const b = await launch()
const log = []
const L = (...a) => { log.push(a.join(' ')); console.log(...a) }
const out = {}
const toastTxt = p => p.evaluate(() => [...document.querySelectorAll('[class*="toast"], #toast')].map(e => e.innerText).filter(Boolean).join(' / '))
const exists = (p, iid) => p.evaluate(iid => !!window.INPUTS.find(x => x.iid === iid), iid)

// ---- A: opened day's Delete
if (!only || only === "A") {
  const w = await world(b, size); const p = w.page; const N = n => `p504-${size}-A-${n}`
  await toInputs(p)
  const [iid] = await makeInput(p, size, '2026-10-20', { type: 'Duty', remarks: 'will be deleted' })
  await closeDay(p)
  await press(p, size, bar(p, iid)); await p.waitForSelector('[data-testid="win-inputedit"]'); await p.waitForTimeout(300)
  await p.fill('#inpEditRmk', 'DRAFT typed in the editor')
  // open the day (its date's corner) while the editor is up
  await press(p, size, cell(p, '2026-10-20'), { position: { x: 8, y: 8 } }); await p.waitForSelector('[data-testid="win-inputsday"]'); await p.waitForTimeout(300)
  const rowHtml = await p.evaluate(iid => document.querySelector(`[data-testid="idy-row-${iid}"]`)?.outerHTML.slice(0, 1200), iid)
  L('day row', rowHtml)
  await shot(p, N('1-both-windows'))
  L('A: day window hidden behind the editor? element at the day window top:', await p.evaluate(() => { const d = document.querySelector('[data-testid="win-inputsday"]').getBoundingClientRect(); const h = document.elementFromPoint(d.left + d.width / 2, d.top + 60); return h && (h.closest('[data-testid]')?.dataset.testid || h.className) }))
  // a real mouse drag of the editor's bar moves it out of the way
  { const g = await centreOf(p.locator('[data-testid="win-inputedit"] .win-bar')); await mouseDrag(p, { x: g.x - 60, y: g.y }, { x: g.x - 560, y: g.y + 330 }); await p.waitForTimeout(300) }
  await shot(p, N('1b-editor-moved'))
  // the opened day's Delete is the KEYBOARD'S: focus the line, press Delete (ui-contracts: "Delete on a line of the opened day asks first")
  await p.locator(`[data-testid="idy-row-${iid}"] [data-testid="idy-open"]`).focus(); await p.keyboard.press('Delete'); await p.waitForTimeout(300)
  await shot(p, N('2-delete-asks'))
  L('ask text', await p.locator('[data-testid="win-inputsday"]').innerText().then(t => t.slice(0, 300).replace(/\n/g, ' | ')))
  out.A_asked = true
  const yes = p.locator('[data-testid="win-inputsday"] button', { hasText: /^delete$|yes|confirm/i }).last()
  L('confirm buttons', await p.locator('[data-testid="win-inputsday"] button').evaluateAll(es => es.map(e => (e.dataset.testid || '') + '|' + e.textContent.trim())))
  await press(p, size, yes); await p.waitForTimeout(600)
  L('record exists after delete?', await exists(p, iid), '| editor windows', await p.locator('[data-testid="win-inputedit"]').count(), '| toast:', await toastTxt(p))
  await shot(p, N('3-after-delete'))
  out.A = { exists: await exists(p, iid), editorOpen: await p.locator('[data-testid="win-inputedit"]').count(), toast: await toastTxt(p) }
  L('A errors', JSON.stringify(w.errors)); out.A_err = w.errors
  await w.ctx.close()
}
// ---- B: Undo of the creation
if (!only || only === "B") {
  const w = await world(b, size); const p = w.page; const N = n => `p504-${size}-B-${n}`
  await toInputs(p)
  const [iid] = await makeInput(p, size, '2026-10-21', { type: 'Duty', remarks: 'undo me' })
  await closeDay(p)
  await press(p, size, bar(p, iid)); await p.waitForSelector('[data-testid="win-inputedit"]'); await p.waitForTimeout(300)
  await p.fill('#inpEditRmk', 'DRAFT typed in the editor')
  await shot(p, N('1-draft'))
  await press(p, size, p.locator('#undoBtn')); await p.waitForTimeout(600)
  L('B: record exists after Undo?', await exists(p, iid), '| editor windows', await p.locator('[data-testid="win-inputedit"]').count(), '| toast:', await toastTxt(p))
  await shot(p, N('2-after-undo'))
  out.B = { exists: await exists(p, iid), editorOpen: await p.locator('[data-testid="win-inputedit"]').count(), toast: await toastTxt(p) }
  // is it still not there after a wait and a redo-free look at the month?
  await p.waitForTimeout(800)
  out.B_later = { exists: await exists(p, iid), editorOpen: await p.locator('[data-testid="win-inputedit"]').count(), bars: await p.locator(`.ib-bar[data-iid="${iid}"]`).count() }
  L('B later', JSON.stringify(out.B_later), 'errors', JSON.stringify(w.errors)); out.B_err = w.errors
  await w.ctx.close()
}
// ---- C: one member of a shared entry removed behind the editor
if (!only || only === "C") {
  const w = await world(b, size); const p = w.page; const N = n => `p504-${size}-C-${n}`
  await toInputs(p); await toMonth(p, 2026, 7)
  const sharedBar = p.locator('.ib-bar', { hasText: '+3' }).first()
  await press(p, size, sharedBar); await p.waitForSelector('[data-testid="win-inputedit"]'); await p.waitForTimeout(300)
  await p.fill('#inpEditRmk', 'Flight safety brief — DRAFT')
  await press(p, size, cell(p, '2026-07-23'), { position: { x: 8, y: 8 } }); await p.waitForSelector('[data-testid="win-inputsday"]'); await p.waitForTimeout(300)
  await shot(p, N('1-both'))
  // swap IN PLACE to Ranger (bane), a member of the entry who did not file it
  { const g = await centreOf(p.locator('[data-testid="win-inputedit"] .win-bar')); await mouseDrag(p, { x: g.x - 60, y: g.y }, { x: g.x - 560, y: g.y + 200 }); await p.waitForTimeout(300) }
  await p.evaluate(() => { window.raptorMe('bane'); window.raptorRole('member') }); await p.waitForTimeout(500)
  L('C: after swap to Ranger — editor windows', await p.locator('[data-testid="win-inputedit"]').count(), '| day windows', await p.locator('[data-testid="win-inputsday"]').count())
  await shot(p, N('2-as-ranger'))
  const lineBtns = await p.locator('[data-testid="win-inputsday"] button').evaluateAll(es => es.map(e => (e.dataset.testid || '') + '|' + e.textContent.trim() + '|' + e.title))
  L('C: day buttons as Ranger', JSON.stringify(lineBtns))
  const sharedIid = await p.evaluate(() => window.INPUTS.find(x => x.grp === 'g-demo-brief')?.iid)
  const line = p.locator('[data-testid="win-inputsday"] [data-testid^="idy-row-"]', { hasText: 'Drifter +3' }).locator('[data-testid="idy-open"]')
  await line.focus(); await p.keyboard.press('Delete'); await p.waitForTimeout(300)
  L('C: ask as Ranger:', await p.locator('[data-testid="win-inputsday"]').innerText().then(t => t.replace(/\n/g, ' | ').slice(-160)))
  await shot(p, N('3-ranger-asked'))
  await p.locator('[data-testid="idy-del-yes"]').click(); await p.waitForTimeout(600)
  L('C: entry people stored now', await p.evaluate(() => window.INPUTS.filter(x => x.grp === 'g-demo-brief').map(x => x.person).join(',')))
  await p.evaluate(() => { window.raptorMe('stiff'); window.raptorRole('admin') }); await p.waitForTimeout(600)
  await shot(p, N('4-back-as-saber'))
  L('C: editor windows', await p.locator('[data-testid="win-inputedit"]').count())
  L('C: editor title', await p.locator('[data-testid="win-inputedit"] .win-ttl').innerText().catch(() => 'NO WINDOW'), '| lit', await p.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp]')].filter(e => e.getAttribute('aria-pressed') === 'true').map(e => e.dataset.pp).join(',')), '| remarks field', await p.inputValue('#inpEditRmk').catch(() => 'n/a'))
  await p.locator('#inpEditSave').click(); await p.waitForTimeout(600)
  L('C: after Save, entry people', await p.evaluate(() => window.INPUTS.filter(x => x.grp === 'g-demo-brief').map(x => x.person + ':' + x.remarks).join(' | ')))
  L('C: any record for Ranger on 23 Jul', await p.evaluate(() => window.INPUTS.filter(x => x.person === 'bane' && x.date === 'Jul 23').length))
  await shot(p, N('5-saved'))
  out.C_btns = lineBtns
  L('C errors', JSON.stringify(w.errors)); out.C_err = w.errors
  await w.ctx.close()
}
saveRows('p504-' + size, [{ log, out }])
await b.close()
