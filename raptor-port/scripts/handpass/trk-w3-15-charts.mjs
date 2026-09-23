/* w3 item 15 — charts (R72, R73, Fable #27).
   A ✎ Rename syllabus is a label (a mark stays); a taken name refused.
   F delete a CUSTOM chart ("cannot be undone") — is ↶ offered anyway?
   B 🗑 delete a built-in with no edits: the question's words.
   D restore it from ⇅ Reorder: it comes back shipped, with no students.
   C a built-in WITH saved edits: "Delete it" / "Revert edits only" — walk Revert.
   E the last syllabus cannot go. */
import { open, shot, save, log, DESK } from './trk-lib.mjs'
import { sleep, tapBall, menuItem, dlg, dlgText, dlgPress, pickFrom } from './trk-w3-lib.mjs'

const L = log()
const syls = page => page.evaluate(() => [...document.querySelectorAll('#sylSel option')].map(o => o.textContent))
const cur = page => page.locator('#sylSel option:checked').innerText()
const wedges = (page, id) => page.evaluate(id => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id); return g ? [...g.querySelectorAll('path.wedge')].map(p => p.getAttribute('fill')) : null }, id)
const students = page => page.evaluate(() => [...document.querySelectorAll('#activeSel option')].map(o => o.textContent))
const undo = page => page.evaluate(() => { const b = document.getElementById('trUndoBtn'); return { disabled: b.disabled, title: b.title } })
const clean = s => (s || '').replace(/\s+/g, ' ')

const { browser, page, errors } = await open({ size: DESK, who: 'a' })
L.note('start', JSON.stringify(await syls(page)) + ' on ' + await cur(page))

/* A. rename */
await tapBall(page, 'ST-01'); await page.locator('#pop button', { hasText: 'DCO' }).click(); await sleep(400)
const w0 = await wedges(page, 'ST-01')
await menuItem(page, 'syl', 'renSyl')
let q = await dlg(page, { value: '2026 MAIN' }); await sleep(500)
L.ok('A. ✎ Rename syllabus: the label changes, the mark stays', /^2026 MAIN/.test(await cur(page)) && JSON.stringify(await wedges(page, 'ST-01')) === JSON.stringify(w0), `asked "${clean(q.text)}" · now "${await cur(page)}" · ST-01 ${JSON.stringify(await wedges(page, 'ST-01'))}`)
await menuItem(page, 'syl', 'renSyl')
await dlg(page, { value: 'Tx 2026' }); await sleep(400)
let said = await dlgText(page); if (said) { await page.click('#dlgOk'); await sleep(250) }
L.ok('A. renaming to a name already used ("Tx 2026") is refused', !!said && /already exists/.test(said) && /^2026 MAIN/.test(await cur(page)), clean(said) || 'nothing said')
await shot(page, 'w3-15-A-renamed')

/* F. a custom chart: duplicate, then delete */
await menuItem(page, 'syl', 'dupSyl')
q = await dlg(page, { ok: true }); await sleep(900)
const copyName = await cur(page)
L.note('F. ⧉ Duplicate asked', `"${clean(q.text)}" → now on "${copyName}" · students ${JSON.stringify(await students(page))}`)
L.note('F. ↶ before the delete', JSON.stringify(await undo(page)))
await menuItem(page, 'syl', 'delSyl')
said = await dlgText(page)
L.ok('F. deleting a CUSTOM chart says it cannot be undone', /cannot be undone/.test(said || ''), clean(said))
await page.click('#dlgOk'); await sleep(900)
const u = await undo(page)
L.ok('F. …and after it, ↶ does not offer to undo it', u.disabled && !/delet/i.test(u.title), JSON.stringify(u) + ` · now on "${await cur(page)}" · list ${JSON.stringify(await syls(page))}`)
await menuItem(page, 'syl', 'ordSyl'); await page.waitForSelector('#ordModal', { state: 'visible' })
L.note('F. ⇅ Reorder after deleting the custom — deleted list', clean(await page.locator('#ordHiddenWrap').innerText().catch(() => 'none shown')))
await page.click('#ordCancel'); await sleep(250)
await shot(page, 'w3-15-F-custom-deleted')

/* B. a built-in with no edits: 2024 — give it a mark first */
await pickFrom(page, '#sylSel', /^2024/)
L.note('B. 2024 has students', JSON.stringify(await students(page)))
if ((await students(page)).length) { await tapBall(page, 'ST-01'); await page.locator('#pop button', { hasText: 'DCO' }).click(); await sleep(400) }
await menuItem(page, 'syl', 'delSyl')
said = await dlgText(page)
L.ok('B. 🗑 on an unedited built-in asks, naming what goes and how to bring it back', /removes its flow, its layout and every student/.test(said || '') && /bring it back later from ⇅ Reorder/.test(said || ''), clean(said))
await shot(page, 'w3-15-B-delete-builtin-question')
await page.click('#dlgOk'); await sleep(900)
L.ok('B. …OK: 2024 leaves the dropdown', !(await syls(page)).some(s => /^2024/.test(s)), JSON.stringify(await syls(page)) + ' on ' + await cur(page))

/* D. restore from ⇅ Reorder */
await menuItem(page, 'syl', 'ordSyl'); await page.waitForSelector('#ordModal', { state: 'visible' })
const hid = clean(await page.locator('#ordHiddenWrap').innerText().catch(() => ''))
L.ok('D. ⇅ Reorder lists 2024 under "Deleted built-in syllabi"', /2024/.test(hid), hid)
await shot(page, 'w3-15-D-reorder-deleted', { el: '#ordModal' })
await page.locator('#ordHidden .ordrow').filter({ hasText: '2024' }).locator('button', { hasText: 'Restore' }).click(); await sleep(500)
L.note('D. after ↺ Restore, the list reads', clean(await page.locator('#ordList').innerText()))
await page.click('#ordSave'); await sleep(400)
await pickFrom(page, '#sylSel', /^2024/)
const tag = await (async () => { await menuItem(page, 'syl', 'ordSyl'); await page.waitForSelector('#ordModal', { state: 'visible' }); const t = clean(await page.locator('#ordList .ordrow').filter({ hasText: /^☰\s*2024/ }).innerText().catch(() => '')); await page.click('#ordCancel'); await sleep(200); return t })()
L.ok('D. 2024 is back, shipped (tag "built-in", not edited) and with no students', (await syls(page)).some(s => s === '2024') && !(await students(page)).length && /built-in/.test(tag) && !/edited/.test(tag), `dropdown ${JSON.stringify(await syls(page))} · row "${tag}" · students ${JSON.stringify(await students(page))} · card "${clean(await page.locator('#side .c-students').innerText())}"`)
await shot(page, 'w3-15-D-restored')

/* C. a built-in WITH saved edits → Revert edits only */
await pickFrom(page, '#sylSel', /^Tx 2026/)
await menuItem(page, 'syl', 'arrangeBtn')
await page.locator('#arrTools button', { hasText: '+ Test' }).click(); await sleep(250)
await dlg(page, { value: 'TX-EDIT' }); await sleep(300)
await menuItem(page, 'syl', 'arrangeBtn')
await page.click('#saveChanges'); await sleep(500)
L.note('C. Tx 2026 with a saved edit reads', await cur(page))
await menuItem(page, 'syl', 'delSyl')
said = await dlgText(page)
const labels = await page.locator('#dlgModal button:visible').allInnerTexts()
L.ok('C. 🗑 on an EDITED built-in offers "Delete it" or "Revert edits only"', /saved edits/.test(said || '') && labels.some(l => /Delete it/.test(l)) && labels.some(l => /Revert edits only/.test(l)), `${clean(said)} · buttons ${JSON.stringify(labels)}`)
await shot(page, 'w3-15-C-edited-builtin-question')
await dlgPress(page, /Revert edits only/); await sleep(800)
L.ok('C. Revert edits only: Tx 2026 stays, its ✎ mark and the added ball are gone', (await syls(page)).includes('Tx 2026') && !(await page.locator('#flowSvg .ball[data-id="TX-EDIT"]').count()), `now on "${await cur(page)}" · dropdown ${JSON.stringify(await syls(page))} · TX-EDIT ${await page.locator('#flowSvg .ball[data-id="TX-EDIT"]').count()} · status "${await page.locator('#saveStat').innerText()}"`)

/* E. the last syllabus cannot go */
for (let i = 0; i < 6 && (await syls(page)).length > 1; i++) {
  await menuItem(page, 'syl', 'delSyl')
  const t = await dlgText(page)
  if (!t) break
  if (/saved edits/.test(t)) await dlgPress(page, /Delete it/); else await page.click('#dlgOk')
  await sleep(900)
}
L.note('E. left', JSON.stringify(await syls(page)))
await menuItem(page, 'syl', 'delSyl')
said = await dlgText(page)
L.ok('E. the last syllabus cannot go: "Keep at least one syllabus."', /Keep at least one syllabus/.test(said || ''), clean(said))
if (said) await page.click('#dlgOk')
await shot(page, 'w3-15-E-last-syllabus')
L.note('errors', errors.join(' | ') || 'none')
save('w3-15-charts', { rows: L.rows })
await browser.close()
