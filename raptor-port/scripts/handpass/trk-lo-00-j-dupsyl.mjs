/* [TRK-LEFTOVERS] baseline — P (w3 O6): with an UNSAVED chart edit (Edit chart
   layout, move a ball / add a ball, ✓ Done editing chart — ✓ Save changes is
   showing), press ⧉ Duplicate syllabus, and separately + Add syllabus: does it
   ask about the unsaved edit first? Carry on through the name prompt: what
   happens to the unsaved edit? Desktop 1440x900, admin, a fresh browser per
   run. Every answer pressed by the button's own id. */
import { open, shot, save, log, reveal, DESK } from './trk-lib.mjs'
import { sleep, menuItem, dlgText } from './trk-w3-lib.mjs'

const L = log()
const allErrors = []
const syl = page => page.evaluate(() => { const s = document.getElementById('sylSel'); return s.options[s.selectedIndex].textContent })
const hasBall = (page, label) => page.evaluate(label => [...document.querySelectorAll('#flowSvg .ball')].some(g => (g.textContent || '').includes(label)), label)
const saveShown = async page => (await page.locator('#saveChanges').count()) > 0
const buttons = page => page.evaluate(() => [...document.querySelectorAll('#dlgModal button')].filter(b => b.offsetParent).map(b => b.id + '="' + b.textContent.trim() + '"'))
const state = async page => ({ syllabus: await syl(page), saveChanges: await saveShown(page), 'LO-P ball': await hasBall(page, 'LO-P'), status: await page.locator('#saveStat').innerText().catch(() => '') })

async function unsavedEdit(page, tag) {
  await menuItem(page, 'syl', 'arrangeBtn')
  /* move a ball: drag ACG-05 */
  await reveal(page, 'ACG-05')
  const bb = await page.locator('#flowSvg .ball[data-id="ACG-05"]').first().boundingBox()
  await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.mouse.down()
  for (let i = 1; i <= 8; i++) await page.mouse.move(bb.x + bb.width / 2 + 10 * i, bb.y + bb.height / 2 + 4 * i)
  await page.mouse.up(); await sleep(400)
  const afterMove = await saveShown(page)
  /* a structure edit: + Test named LO-P */
  await page.locator('#arrTools button', { hasText: '+ Test' }).click(); await sleep(250)
  await page.fill('#dlgInput', 'LO-P'); await page.click('#dlgOk'); await sleep(400)
  await menuItem(page, 'syl', 'arrangeBtn')                           // ✓ Done editing chart
  const st = await state(page)
  L.note(`P ${tag}.0 the unsaved edit: ACG-05 dragged (✓ Save changes after the drag alone: ${afterMove}), + Test "LO-P", ✓ Done editing chart`, JSON.stringify(st))
  await shot(page, `lo-P-${tag}-0-unsaved-edit`)
  return st
}

/* ---- run 1: ⧉ Duplicate syllabus, answer "only in the copy" ---- */
for (const [tag, answer] of [['dup-copyonly', 'alt'], ['dup-both', 'ok']]) {
  const { browser, page, errors } = await open({ size: DESK, who: 'a' })
  const src = await syl(page)
  await unsavedEdit(page, tag)
  await menuItem(page, 'syl', 'dupSyl')
  const q1 = await dlgText(page), b1 = await buttons(page)
  L.note(`P ${tag}.1 ⧉ Duplicate syllabus pressed: the first question`, JSON.stringify(q1) + ' · buttons ' + b1.join(' '))
  L.ok(`P ${tag}.2 Duplicate asks about the unsaved edit before the name`, /unsaved/i.test(q1 || ''), JSON.stringify(q1))
  await shot(page, `lo-P-${tag}-1-first-question`)
  if (/unsaved/i.test(q1 || '')) { await page.click(answer === 'alt' ? '#dlgAlt' : '#dlgOk'); await sleep(400) }
  const q2 = await dlgText(page)
  L.note(`P ${tag}.3 answered "${answer === 'alt' ? 'No — only in the copy' : 'Yes — save them on both'}": next question`, JSON.stringify(q2))
  if (q2 != null) { await page.fill('#dlgInput', 'LO ' + tag.toUpperCase()); await page.click('#dlgOk'); await sleep(900) }
  const s3 = await state(page)
  L.note(`P ${tag}.4 after the name "LO ${tag.toUpperCase()}" and OK: on screen`, JSON.stringify(s3))
  await shot(page, `lo-P-${tag}-2-the-copy`)
  /* back to the original chart */
  await page.click('#sylSel'); await sleep(150)
  const v = await page.evaluate(src => [...document.querySelectorAll('#sylSel option')].find(o => o.textContent.replace(' ✎', '') === src).value, src)
  await page.selectOption('#sylSel', v); await sleep(800)
  const q4 = await dlgText(page)
  if (q4 != null) { L.note(`P ${tag}.5 switching back asked`, JSON.stringify(q4)); await page.click('#dlgCancel'); await sleep(300) }
  const s5 = await state(page)
  L.note(`P ${tag}.6 back on the original "${src}"`, JSON.stringify(s5))
  L.ok(`P ${tag}.7 the original "${src}" ${answer === 'ok' ? 'KEEPS' : 'does not keep'} the edit, as the answer said`, answer === 'ok' ? s5['LO-P ball'] : !s5['LO-P ball'], JSON.stringify(s5))
  await shot(page, `lo-P-${tag}-3-original-after`)
  allErrors.push(...errors.map(e => tag + ' ' + e))
  await browser.close()
}

/* ---- run 3: + Add syllabus ---- */
{
  const tag = 'addsyl'
  const { browser, page, errors } = await open({ size: DESK, who: 'a' })
  const src = await syl(page)
  await unsavedEdit(page, tag)
  await menuItem(page, 'syl', 'addSyl')
  const q1 = await dlgText(page), b1 = await buttons(page)
  L.note(`P ${tag}.1 + Add syllabus pressed: the first question`, JSON.stringify(q1) + ' · buttons ' + b1.join(' '))
  L.ok(`P ${tag}.2 + Add syllabus asks about the unsaved edit before the name`, /unsaved/i.test(q1 || ''), JSON.stringify(q1))
  await shot(page, `lo-P-${tag}-1-first-question`)
  await page.click('#dlgCancel'); await sleep(300)
  const sC = await state(page)
  L.note(`P ${tag}.3 Cancel: the chart and the edit stay`, JSON.stringify(sC))
  await menuItem(page, 'syl', 'addSyl')
  await page.click('#dlgOk'); await sleep(300)                     // "Discard them and add a new syllabus?" → OK
  const q2 = await dlgText(page)
  L.note(`P ${tag}.4 asked again, OK (discard): next question`, JSON.stringify(q2))
  if (q2 != null) { await page.fill('#dlgInput', 'LO NEW'); await page.click('#dlgOk'); await sleep(900) }
  const s3 = await state(page)
  L.note(`P ${tag}.5 after the name "LO NEW" and OK: on screen`, JSON.stringify(s3))
  await shot(page, `lo-P-${tag}-2-new-sheet`)
  await page.click('#sylSel'); await sleep(150)
  const v = await page.evaluate(src => [...document.querySelectorAll('#sylSel option')].find(o => o.textContent.replace(' ✎', '') === src).value, src)
  await page.selectOption('#sylSel', v); await sleep(800)
  const q4 = await dlgText(page)
  if (q4 != null) { L.note(`P ${tag}.6 switching back asked`, JSON.stringify(q4)); await page.click('#dlgCancel'); await sleep(300) }
  const s5 = await state(page)
  L.note(`P ${tag}.7 back on the original "${src}"`, JSON.stringify(s5))
  await shot(page, `lo-P-${tag}-3-original-after`)
  allErrors.push(...errors.map(e => tag + ' ' + e))
  await browser.close()
}

save('lo-J-dupsyl', { rows: L.rows, errors: allErrors })
console.log('errors', JSON.stringify(allErrors))
