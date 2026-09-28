/* [TRK-RETEST-NOTES] C1 + C15 — walker c: the two notes the baseline found ALREADY fixed,
   re-walked on this build (28 Sep 26). Adapted from trk-lo-00-a-arrange-jump.mjs and
   trk-lo-00-j-dupsyl.mjs, now written as assertions of the right behaviour.

   C1 — entering and leaving ✎ Edit chart layout keeps a scrolled chart's ball in place: while
        editing, the chart point that was in the middle of the chart's box stays in the middle
        (the box itself moves down under the tool strip — the baseline's "82px" on a desktop);
        after ✓ Done editing chart the ball is back exactly where it was. At 1440×900 (mouse),
        390×844 upright and 844×390 sideways with the fold (a finger).
   C15 — ⧉ Duplicate syllabus and + Add syllabus ask about an unsaved chart edit first, and each
        answer does what it says.

     HP_URL=http://localhost:4175 HP_SHOTS=<dir> HP_OUT=<dir> node scripts/handpass/trk-lo-2c-rewalk.mjs
*/
import { open, shot, save, log, reveal, DESK } from './trk-lib.mjs'
import { menuItem, dlgText } from './trk-w3-lib.mjs'

const L = log()
const sleep = ms => new Promise(r => setTimeout(r, ms))
const allErrors = []

/* ============ C1 ============ */
const pos = (page, id) => page.evaluate(id => {
  const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id); if (!g) return null
  const c = (g.querySelector(':scope > circle') || g).getBoundingClientRect()
  const b = document.getElementById('board'), br = b.getBoundingClientRect()
  /* the middle of what the chart's box SHOWS (clipped to the screen, as a person sees it) */
  const midY = (br.top + b.clientTop + Math.min(br.top + b.clientTop + b.clientHeight, innerHeight)) / 2
  const midX = br.left + b.clientLeft + b.clientWidth / 2
  const cx = c.left + c.width / 2, cy = c.top + c.height / 2
  return { cx: Math.round(cx), cy: Math.round(cy), fromMid: { dx: Math.round(cx - midX), dy: Math.round(cy - (br.top + b.clientTop + b.clientHeight / 2)) }, boardTop: Math.round(br.top), boardH: Math.round(b.clientHeight), w: Math.round(c.width) }
}, id)
for (const [name, size, touch, ids] of [['1440', DESK, false, ['ACG-04', 'BFM-3']], ['390', { width: 390, height: 844 }, true, ['ACG-04', 'BFM-3']], ['844x390', { width: 844, height: 390 }, true, ['ACG-04', 'BFM-3']]]) {
  const { browser, page, errors } = await open({ size, touch })
  const press = async sel => { const l = page.locator(sel).first(); if (touch) await l.tap(); else await l.click(); await sleep(250) }
  const toggle = async () => { await press('#sylMenuBtn'); await page.waitForSelector('#arrangeBtn', { state: 'visible' }); const lab = (await page.locator('#arrangeBtn').innerText()).trim(); await press('#arrangeBtn'); await sleep(700); return lab }
  for (const id of ids) {
    const ok = await reveal(page, id); await sleep(300)
    const before = await pos(page, id)
    await shot(page, `lo-2c-r-${name}-${id}-1-before`)
    const l1 = await toggle()
    const on = await pos(page, id)
    await shot(page, `lo-2c-r-${name}-${id}-2-editing`)
    const l2 = await toggle()
    const off = await pos(page, id)
    await shot(page, `lo-2c-r-${name}-${id}-3-after-done`)
    L.note(`C1 ${name} ${id}: brought to the middle (${ok}); pressed "${l1}" then "${l2}"`, JSON.stringify({ before, on, off }))
    const keep = before && on && Math.abs(before.fromMid.dx - on.fromMid.dx) <= 3 && Math.abs(before.fromMid.dy - on.fromMid.dy) <= 3
    L.ok(`C1 ${name} ${id}: entering Edit chart layout keeps the ball where it was against the middle of the chart's box`, keep, `from the middle before (${before?.fromMid.dx},${before?.fromMid.dy}) · editing (${on?.fromMid.dx},${on?.fromMid.dy}); box top ${before?.boardTop} → ${on?.boardTop}`)
    L.ok(`C1 ${name} ${id}: after ✓ Done editing chart the ball is back where it was (≤2px)`, before && off && Math.abs(before.cx - off.cx) <= 2 && Math.abs(before.cy - off.cy) <= 2, `(${before?.cx},${before?.cy}) → (${on?.cx},${on?.cy}) → (${off?.cx},${off?.cy})`)
  }
  L.ok(`C1 ${name}: no console or page error`, errors.length === 0, errors.join(' | '))
  allErrors.push(...errors.map(e => 'C1 ' + name + ': ' + e))
  await browser.close()
}

/* ============ C15 ============ */
const syl = page => page.evaluate(() => { const s = document.getElementById('sylSel'); return s.options[s.selectedIndex].textContent })
const hasBall = (page, id) => page.evaluate(id => !!document.querySelector(`#flowSvg .ball[data-id="${id}"]`), id)
const saveShown = async page => (await page.locator('#saveChanges').count()) > 0
const state = async page => ({ syllabus: await syl(page), saveChanges: await saveShown(page), lop: await hasBall(page, 'LO-P'), moved: await page.evaluate(() => { const g = document.querySelector('#flowSvg .ball[data-id="ACG-05"]'); return g ? g.getAttribute('transform') : null }) })
async function unsavedEdit(page, tag) {
  await menuItem(page, 'syl', 'arrangeBtn')
  await reveal(page, 'ACG-05')
  const bb = await page.locator('#flowSvg .ball[data-id="ACG-05"]').first().boundingBox()
  await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.mouse.down()
  for (let i = 1; i <= 8; i++) await page.mouse.move(bb.x + bb.width / 2 + 10 * i, bb.y + bb.height / 2 + 4 * i)
  await page.mouse.up(); await sleep(400)
  await page.locator('#arrTools button', { hasText: '+ Test' }).click(); await sleep(250)
  await page.locator('#dlgInput').click(); await page.keyboard.type('LO-P', { delay: 30 }); await page.click('#dlgOk'); await sleep(400)
  await menuItem(page, 'syl', 'arrangeBtn')
  const st = await state(page)
  L.note(`C15 ${tag}.0 the unsaved edit (ACG-05 dragged, + Test "LO-P", Done editing)`, JSON.stringify(st))
  return st
}
async function backTo(page, src) {
  await page.click('#sylSel'); await sleep(150)
  const v = await page.evaluate(src => [...document.querySelectorAll('#sylSel option')].find(o => o.textContent.replace(' ✎', '') === src).value, src)
  await page.selectOption('#sylSel', v); await sleep(900)
  const q = await dlgText(page)
  if (q != null) { L.note('switching back asked', q); await page.click('#dlgCancel'); await sleep(300) }
}
for (const [tag, answer] of [['dup-copyonly', '#dlgAlt'], ['dup-both', '#dlgOk'], ['dup-cancel', '#dlgCancel']]) {
  const { browser, page, errors } = await open({ size: DESK })
  const src = await syl(page)
  const st0 = await unsavedEdit(page, tag)
  L.ok(`C15 ${tag}.1 the unsaved edit shows: ✓ Save changes, the LO-P ball`, st0.saveChanges && st0.lop, JSON.stringify(st0))
  await menuItem(page, 'syl', 'dupSyl')
  const q1 = await dlgText(page)
  const btns = await page.evaluate(() => [...document.querySelectorAll('#dlgModal button')].filter(b => b.offsetParent).map(b => b.id + '=' + b.textContent.trim()))
  L.ok(`C15 ${tag}.2 ⧉ Duplicate asks about the unsaved edit BEFORE the name`, /unsaved/i.test(q1 || '') && btns.some(b => /dlgAlt=No — only in the copy/.test(b)) && btns.some(b => /dlgOk=Yes — save them on both/.test(b)), JSON.stringify({ q1, btns }))
  await shot(page, `lo-2c-r-c15-${tag}-1-question`)
  await page.click(answer); await sleep(400)
  if (tag === 'dup-cancel') {
    const s = await state(page)
    L.ok(`C15 ${tag}.3 Cancel: no copy made, the chart and its unsaved edit stay`, (await dlgText(page)) == null && s.syllabus.replace(' ✎', '') === src && s.saveChanges && s.lop, JSON.stringify(s))
    await shot(page, `lo-2c-r-c15-${tag}-2-after`)
  } else {
    const q2 = await dlgText(page)
    L.ok(`C15 ${tag}.3 then the name is asked`, /Name for the duplicated syllabus/i.test(q2 || ''), JSON.stringify(q2))
    await page.locator('#dlgInput').click(); await page.keyboard.press('Control+A'); await page.keyboard.type('LO ' + tag.toUpperCase(), { delay: 25 }); await page.click('#dlgOk'); await sleep(1000)
    const s3 = await state(page)
    L.ok(`C15 ${tag}.4 the copy "LO ${tag.toUpperCase()}" is on screen WITH the edit, saved (no ✓ Save changes)`, /^LO /.test(s3.syllabus) && s3.lop && !s3.saveChanges, JSON.stringify(s3))
    await shot(page, `lo-2c-r-c15-${tag}-2-the-copy`)
    await backTo(page, src)
    const s5 = await state(page)
    L.ok(`C15 ${tag}.5 the original "${src}" ${answer === '#dlgOk' ? 'KEEPS the edit (saved, ✎)' : 'is as it was (no LO-P)'} — as the answer said`, answer === '#dlgOk' ? (s5.lop && /✎/.test(s5.syllabus) && !s5.saveChanges) : (!s5.lop && !s5.saveChanges), JSON.stringify(s5))
    await shot(page, `lo-2c-r-c15-${tag}-3-original`)
  }
  L.ok(`C15 ${tag}: no console or page error`, errors.length === 0, errors.join(' | '))
  allErrors.push(...errors.map(e => 'C15 ' + tag + ': ' + e))
  await browser.close()
}
{
  const tag = 'addsyl'
  const { browser, page, errors } = await open({ size: DESK })
  const src = await syl(page)
  await unsavedEdit(page, tag)
  await menuItem(page, 'syl', 'addSyl')
  const q1 = await dlgText(page)
  L.ok(`C15 ${tag}.1 + Add syllabus asks about the unsaved edit BEFORE the name (discard?)`, /unsaved/i.test(q1 || '') && /Discard/i.test(q1 || ''), JSON.stringify(q1))
  await shot(page, `lo-2c-r-c15-${tag}-1-question`)
  await page.click('#dlgCancel'); await sleep(300)
  const sC = await state(page)
  L.ok(`C15 ${tag}.2 Cancel: the chart and the edit stay`, sC.syllabus.replace(' ✎', '') === src && sC.saveChanges && sC.lop, JSON.stringify(sC))
  await menuItem(page, 'syl', 'addSyl')
  await page.click('#dlgOk'); await sleep(300)
  const q2 = await dlgText(page)
  L.ok(`C15 ${tag}.3 OK (discard): the name is asked`, /Name for the new \(empty\) syllabus/i.test(q2 || ''), JSON.stringify(q2))
  await page.locator('#dlgInput').click(); await page.keyboard.press('Control+A'); await page.keyboard.type('LO NEW', { delay: 25 }); await page.click('#dlgOk'); await sleep(1000)
  const s3 = await state(page)
  const nBalls = await page.evaluate(() => document.querySelectorAll('#flowSvg .ball').length)
  L.ok(`C15 ${tag}.4 the new empty syllabus "LO NEW" is on screen, empty, nothing waiting`, /^LO NEW/.test(s3.syllabus) && !s3.lop && !s3.saveChanges && nBalls === 0, JSON.stringify({ ...s3, balls: nBalls }))
  await shot(page, `lo-2c-r-c15-${tag}-2-new-sheet`)
  await backTo(page, src)
  const s5 = await state(page)
  L.ok(`C15 ${tag}.5 back on "${src}": the discarded edit is gone (no LO-P, no ✓ Save changes)`, !s5.lop && !s5.saveChanges && !/✎/.test(s5.syllabus), JSON.stringify(s5))
  await shot(page, `lo-2c-r-c15-${tag}-3-original`)
  L.ok(`C15 ${tag}: no console or page error`, errors.length === 0, errors.join(' | '))
  allErrors.push(...errors.map(e => 'C15 ' + tag + ': ' + e))
  await browser.close()
}

save('lo-2c-rewalk', { rows: L.rows, errors: allErrors })
const fails = L.rows.filter(r => r.pass === false)
console.log(fails.length ? `\n${fails.length} FAIL` : '\nALL PASS')
process.exit(fails.length ? 1 : 0)
