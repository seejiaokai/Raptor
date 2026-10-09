// P5-03 — a same-field conflict blocks Save until a choice is made. Door behind the window: the List's row editor.
import { launch, world, toInputs, toMonth, cell, bar, shot, press, saveRows, makeInput, closeDay, mouseDrag, centreOf, recOf } from './cal-E-lib.mjs'
const size = process.argv[2] || 'desk'
const b = await launch()
const log = []
const L = (...a) => { log.push(a.join(' ')); console.log(...a) }
const out = {}
for (const choice of ['mine', 'theirs']) {
  const w = await world(b, size); const p = w.page
  const N = n => `p503-${size}-${choice}-${n}`
  await toInputs(p)
  const sel = r => r && { remarks: r.remarks, s: r.s, e: r.e, date: r.date }
  const [iid] = await makeInput(p, size, '2026-10-20', { type: 'Duty', remarks: 'orig remark' })
  await closeDay(p)
  L(`== choice ${choice}: made`, iid, JSON.stringify(sel(await recOf(p, iid))))
  await press(p, size, bar(p, iid)); await p.waitForSelector('[data-testid="win-inputedit"]'); await p.waitForTimeout(300)
  await p.fill('#inpEditRmk', 'MINE remark')
  await p.fill('#inpEditEnd', '16:00')                      // an unrelated change of his own
  await press(p, size, p.locator('#inListBtn')); await p.waitForTimeout(400)
  { const g = await centreOf(p.locator('[data-testid="win-inputedit"] .win-bar')); await mouseDrag(p, { x: g.x - 60, y: g.y }, { x: g.x - 560, y: g.y + 330 }); await p.waitForTimeout(300) }
  const rowSel = `#inBody tr[data-iid="${iid}"]`
  await press(p, size, p.locator(`${rowSel} [data-edit]`)); await p.waitForTimeout(300)
  L('row html', (await p.evaluate(sel => document.querySelector(sel)?.outerHTML.slice(0, 1500), rowSel)))
  await shot(p, N('0-row-editor'))
  const rmk = p.locator(`${rowSel} td[data-fld="Remarks"] input`).first()
  L('row remark input value', await rmk.inputValue())
  await rmk.fill('THEIRS remark')
  await p.evaluate(sel => document.querySelector(sel + ' .inact').innerHTML, rowSel)
  await press(p, size, p.locator(`${rowSel} .inact span`).first()); await p.waitForTimeout(500)
  L('record after the List save', JSON.stringify(sel(await recOf(p, iid))))
  await shot(p, N('1-after-list-save'))
  const panel = await p.locator('[data-testid="inped-clash"]').innerText().catch(() => 'NO PANEL')
  L('conflict panel (before Save pressed):', panel.replace(/\n/g, ' | '))
  await press(p, size, p.locator('#inpEditSave')); await p.waitForTimeout(500)
  const afterSave = await recOf(p, iid)
  L('after pressing Save with conflict open: record', JSON.stringify(sel(afterSave)), '| editor still open', await p.locator('[data-testid="win-inputedit"]').count(), '| toast:', await p.locator('.toast, #toast, [role="status"]').allInnerTexts().then(t => t.join('/')).catch(() => ''))
  const panel2 = await p.locator('[data-testid="inped-clash"]').innerText().catch(() => 'NO PANEL')
  L('conflict panel now:', panel2.replace(/\n/g, ' | '))
  await shot(p, N('2-save-refused'))
  const refused = afterSave.remarks === 'THEIRS remark' && (await p.locator('[data-testid="win-inputedit"]').count()) === 1
  await press(p, size, p.locator(`[data-testid="inped-clash-${choice}-remarks"]`).or(p.locator(`[data-testid^="inped-clash-${choice}-"]`).first())); await p.waitForTimeout(300)
  L('after', choice, ': panel gone?', (await p.locator('[data-testid="inped-clash"]').count()) === 0, '| remarks field now', await p.inputValue('#inpEditRmk'), '| end field', await p.inputValue('#inpEditEnd'))
  await shot(p, N('3-chosen'))
  await press(p, size, p.locator('#inpEditSave')); await p.waitForTimeout(500)
  const fin = await recOf(p, iid)
  L('after Save: record', JSON.stringify(sel(fin)), '| editor open', await p.locator('[data-testid="win-inputedit"]').count())
  await shot(p, N('4-saved'))
  out[choice] = { refused, panel2, fin: sel(fin), errors: w.errors }
  L('errors', JSON.stringify(w.errors))
  await w.ctx.close()
}
saveRows('p503-' + size, [{ log, out }])
await b.close()
