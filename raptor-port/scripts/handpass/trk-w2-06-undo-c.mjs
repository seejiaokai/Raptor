/* [HUMAN-RETEST] Tracker — walker w2, walk 6c: the undo KEYS and the two
   undos not crossing (R109, R112, Fable #28), desktop, admin.

   J. Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z on the chart; NOT inside a text box, a
      number box, the Find box; NOT under a question box; NOT from another tab.
   L. Edit Schedule's own Undo — with a schedule edit of its own to take back —
      never reaches a Tracker mark; the Tracker's ↶ never takes back a
      schedule edit. */
import { open, shot, save, log, toPage, toTracker, DESK } from './trk-lib.mjs'
import { sleep, tapBall, undoState, stackDepth, wedges } from './trk-w2-lib.mjs'

const L = log()
const { browser, page, errors } = await open({ size: DESK, who: 'a' })
const grade = async label => { await page.locator('#pop button', { hasText: new RegExp('^\\s*' + label + '\\s*$') }).first().click(); await sleep(500) }
const emptyChart = async () => {
  const p = await page.evaluate(() => { const b = document.getElementById('board').getBoundingClientRect(); for (let y = b.top + 20; y < b.bottom - 20; y += 23) for (let x = b.left + 15; x < b.right - 15; x += 29) { const e = document.elementFromPoint(x, y); if (e && (e.id === 'flowSvg' || e.id === 'board' || (e.tagName === 'rect' && !e.closest('.ball')))) return { x, y } } return null })
  await page.mouse.click(p.x, p.y); await sleep(200)
}
const st05 = async () => (await wedges(page, 'ST-05'))[0]

/* ---------- J. the keys ---------- */
await tapBall(page, 'ST-05'); await grade('DCO')
await emptyChart()
const seq = []
for (const k of ['Control+z', 'Control+y', 'Control+z', 'Control+Shift+z']) { await page.keyboard.press(k); await sleep(500); seq.push(k + '→' + await st05()) }
L.ok('J.1 on the chart: Ctrl+Z undoes, Ctrl+Y redoes, Ctrl+Shift+Z redoes', seq.join(' ') === 'Control+z→#ffffff Control+y→#000000 Control+z→#ffffff Control+Shift+z→#000000', seq.join(' | '))
/* inside text boxes */
for (const [sel, what, typed] of [['#hSearch', 'the Find box', 'ST'], ['#downDays', 'the Down Days number box', '3'], ['#epwIn', 'the pace box', '']]) {
  const d0 = await stackDepth(page)
  const loc = page.locator(sel); await loc.scrollIntoViewIfNeeded(); await loc.click(); await sleep(150)
  if (typed) { await page.keyboard.type(typed, { delay: 60 }); await sleep(400) }
  const d1 = await stackDepth(page)
  await page.keyboard.press('Control+z'); await sleep(450)
  const d2 = await stackDepth(page)
  L.ok(`J.2 Ctrl+Z inside ${what} does not reach the Tracker's history (ST-05 stays marked)`, (await st05()) === '#000000' && d2.undo === d1.undo, `stack ${d0.undo}→typed ${d1.undo}→Ctrl+Z ${d2.undo}; ST-05 ${await st05()}; box now "${await loc.inputValue()}"`)
  await page.keyboard.press('Escape'); await sleep(200)
}
await emptyChart()
/* under a question box */
await page.locator('.chips .chip', { hasText: 'STUDENT B' }).locator('[data-rm]').scrollIntoViewIfNeeded()
await page.locator('.chips .chip', { hasText: 'STUDENT B' }).locator('[data-rm]').click(); await sleep(350)
const qUp = await page.locator('#dlgModal').isVisible().catch(() => false)
const dq = await stackDepth(page)
await page.keyboard.press('Control+z'); await sleep(450)
const dq2 = await stackDepth(page); const stillQ = await page.locator('#dlgModal').isVisible().catch(() => false)
L.ok('J.3 under a question box (Remove STUDENT B?) Ctrl+Z does nothing to the Tracker', qUp && (await st05()) === '#000000' && dq2.undo === dq.undo, `question up ${qUp}, still up ${stillQ}; stack ${dq.undo}→${dq2.undo}; ST-05 ${await st05()}`)
await shot(page, 'w2-08-ctrlz-under-question')
await page.keyboard.press('Escape'); await sleep(350)
L.ok('J.4 Escape answers the question "no": STUDENT B stays', !(await page.locator('#dlgModal').isVisible().catch(() => false)) && (await page.locator('.chips .chip', { hasText: 'STUDENT B' }).count()) === 1, 'B chips: ' + await page.locator('.chips .chip', { hasText: 'STUDENT B' }).count())
/* from another tab */
const tipBefore = (await undoState(page)).undo.t, depthBefore = await stackDepth(page)
await toPage(page, 'inputs'); await sleep(300)
await page.mouse.click(700, 500); await page.keyboard.press('Control+z'); await sleep(300); await page.keyboard.press('Control+y'); await sleep(300); await page.keyboard.press('Control+z'); await sleep(300)
await toTracker(page)
L.ok('J.5 Ctrl+Z / Ctrl+Y pressed on the Inputs tab never touch the Tracker', (await st05()) === '#000000' && (await undoState(page)).undo.t === tipBefore && JSON.stringify(await stackDepth(page)) === JSON.stringify(depthBefore), `ST-05 ${await st05()}; ↶ before "${tipBefore}" after "${(await undoState(page)).undo.t}"; stack ${JSON.stringify(depthBefore)} → ${JSON.stringify(await stackDepth(page))}`)

/* ---------- L. Edit Schedule's Undo vs the Tracker ---------- */
await tapBall(page, 'ST-06'); await grade('DCO')
const tr0 = (await undoState(page)).undo.t
await toPage(page, 'editsched'); await sleep(700)
const es0 = await page.evaluate(() => { const b = document.getElementById('undoBtn'); return b && { off: b.disabled, t: b.title } })
/* a schedule edit of its own: type into the SODB remarks cell, then press elsewhere */
const cell = await page.evaluate(() => { const s = [...document.querySelectorAll('.txed')].find(e => /ntx/.test(e.className) && !e.textContent.trim() && e.getBoundingClientRect().width > 60 && e.getBoundingClientRect().top > 120); if (!s) return null; const r = s.getBoundingClientRect(); return { x: r.left + 10, y: r.top + r.height / 2 } })
let es1 = null, es2 = null, es3 = null, remark = null
if (cell) {
  await page.mouse.click(cell.x, cell.y); await sleep(250)
  await page.keyboard.type('W2 TEST', { delay: 50 }); await sleep(200)
  await page.mouse.click(700, 110); await sleep(600)
  es1 = await page.evaluate(() => { const b = document.getElementById('undoBtn'); return b && { off: b.disabled, t: b.title } })
  remark = await page.evaluate(() => [...document.querySelectorAll('.txed')].some(e => e.textContent.includes('W2 TEST')))
  await shot(page, 'w2-08-editsched-own-edit')
  await page.click('#undoBtn'); await sleep(600)
  es2 = await page.evaluate(() => { const b = document.getElementById('undoBtn'); return b && { off: b.disabled, t: b.title } })
  const gone = await page.evaluate(() => ![...document.querySelectorAll('.txed')].some(e => e.textContent.includes('W2 TEST')))
  L.ok('L.1 Edit Schedule\'s Undo takes back ITS OWN edit (the remark), and names it', remark && !es1.off && gone, JSON.stringify({ before: es0, afterEdit: es1, remarkShown: remark, removedByUndo: gone }))
  if (es2 && !es2.off) { await page.click('#undoBtn'); await sleep(600) }
  es3 = await page.evaluate(() => { const b = document.getElementById('undoBtn'); return b && { off: b.disabled, t: b.title } })
  await page.keyboard.press('Control+z'); await sleep(400)
}
await toTracker(page)
L.ok('L.2 …pressed until greyed (and Ctrl+Z there too), it never reaches the Tracker mark on ST-06', (await wedges(page, 'ST-06'))[0] === '#000000' && (await undoState(page)).undo.t === tr0, JSON.stringify({ afterFirstUndo: es2, finally: es3, st06: await wedges(page, 'ST-06'), trackerUndo: (await undoState(page)).undo.t }))
/* reverse: a schedule edit, then the Tracker's ↶ */
await toPage(page, 'editsched'); await sleep(600)
if (cell) { await page.mouse.click(cell.x, cell.y); await sleep(250); await page.keyboard.type('W2 KEEP', { delay: 50 }); await page.mouse.click(700, 110); await sleep(600) }
const es4 = await page.evaluate(() => { const b = document.getElementById('undoBtn'); return b && { off: b.disabled, t: b.title } })
await toTracker(page)
await page.click('#trUndoBtn'); await sleep(550)
const st06 = (await wedges(page, 'ST-06'))[0]
await toPage(page, 'editsched'); await sleep(600)
const kept = await page.evaluate(() => [...document.querySelectorAll('.txed')].some(e => e.textContent.includes('W2 KEEP')))
const es5 = await page.evaluate(() => { const b = document.getElementById('undoBtn'); return b && { off: b.disabled, t: b.title } })
L.ok('L.3 the Tracker\'s ↶ takes back its own ST-06 mark and never the schedule\'s remark', st06 === '#ffffff' && kept && JSON.stringify(es5) === JSON.stringify(es4), JSON.stringify({ st06, remarkStillThere: kept, schedUndoBefore: es4, schedUndoAfter: es5 }))
await shot(page, 'w2-08-editsched-after-tracker-undo')
/* tidy: take the remark back with the schedule's own Undo */
if (es5 && !es5.off) { await page.click('#undoBtn'); await sleep(500) }

save('w2-06-undo-c', { rows: L.rows, errors })
console.log(`errors ${errors.length}: ${errors.slice(0, 6).join(' | ')}`)
await browser.close()
