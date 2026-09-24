/* w4 probe — an "Other" input filed under Unavailable on a published day: what door does the scheduler have to
   take it back OUT of Unavailable (the engine's unacceptInput handles it)? Reads the board's Unavailable row and
   the input's own edit dialog. Usage: node w4-00d-unavail-door.mjs [desktop|phone] */
const w = process.argv[2] || 'desktop'
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w4'
const L = await import('./w4-lib.mjs')
const { open, STATE, PHONE, DESK, board, closeBoard, openInputs, fileInput, shot, toastNow, clearToast, checker, head, editWeek, frame } = L
const { browser, page, errors } = await open({ ...(w === 'phone' ? PHONE : DESK), state: STATE })
const { ck, note, summary } = checker('UNAV-DOOR ' + w)
const REM = 'W4 DOOR ' + w
const f = await fileInput(page, { person: 'rocky', type: 'Other', from: '2026-07-14', start: '10:00', end: '11:00', remarks: REM })
note('filed', f)
await board(page, 1)
await openInputs(page, 1)
const iid = await page.evaluate(r => String((window.INPUTS.find(x => (x.remarks || '') === r) || {}).iid || ''), REM)
await clearToast(page)
await page.locator(`#schedBoard [data-acc="x"][data-acck="${iid}"]:visible`).first().click(); await page.waitForTimeout(600)
await page.locator(`#schedBoard [data-acc="u"][data-acck="${iid}"]:visible`).first().click(); await page.waitForTimeout(600)
note('filed under Unavailable', await toastNow(page))
/* the Unavailable panel's row for it: every control it offers */
const row = await page.evaluate(r => {
  const hits = [...document.querySelectorAll('#schedBoard *')].filter(e => e.children.length === 0 && ((e.value || e.innerText || '') + '').includes(r))
  const rw = hits.map(h => h.closest('.sb-arow, .pl-row, .inprow')).find(Boolean)
  if (!rw) return 'NO ROW'
  rw.scrollIntoView({ block: 'center' })
  const panel = rw.closest('.sb-panel, .sb-sec, section, .sec')
  return { panelHead: panel ? (panel.querySelector('.sb-ph, h3, .sub-h') || {}).innerText?.replace(/\s+/g, ' ').slice(0, 60) : '?',
    controls: [...rw.querySelectorAll('button, [data-acc], [data-inpedit], select')].map(b => (b.innerText || b.title || b.getAttribute('aria-label') || b.tagName).trim().slice(0, 40) + ' [' + Object.keys(b.dataset).join(',') + ']') }
}, REM)
note('the Unavailable row for the filed Other — its controls', row)
await page.waitForTimeout(300)
await shot(page, `unavdoor-${w}-1-unavailable-row`)
ck('a scheduler can take a filed Other back out of Unavailable from its row (an Undo / → Ground control)', Array.isArray(row?.controls) && row.controls.some(c => /undo|ground|accept/i.test(c) || /acc/.test(c)), 'an Undo or → Ground control on the row', row)
/* the input's own edit dialog, opened from its type label */
const ed = page.locator(`#schedBoard [data-inpedit="${iid}"]:visible`).first()
if (await ed.count()) {
  await ed.evaluate(e => e.scrollIntoView({ block: 'center' })); await ed.click(); await page.waitForTimeout(700)
  const dlg = await page.evaluate(() => { const p = document.querySelector('#inpEditPop'); return p ? { buttons: [...p.querySelectorAll('button')].map(b => b.innerText.trim()).filter(Boolean), types: [...(p.querySelectorAll('select')[1] || { options: [] }).options].map(o => o.text).slice(0, 30) } : 'NO DIALOG' })
  note('the input\'s edit dialog', dlg)
  await shot(page, `unavdoor-${w}-2-edit-dialog`)
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)
} else note('edit dialog', 'NO data-inpedit on the row')
await closeBoard(page)
ck('no console errors', errors.length === 0, 'none', errors)
summary()
await browser.close()
