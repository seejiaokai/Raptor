// I1 / I2 / I3 : Saber changes an input Ranger is in, one save each; Ranger's bell read after each.
import * as L from './or-I-lib.mjs'
const STEP = process.argv[2] || 'all'
const { page, browser } = await L.start()
const RANGER = await L.csId(page, 'Ranger'), SABER = await L.csId(page, 'Saber'), TALLY = await L.csId(page, 'Tally'), HEX = await L.csId(page, 'Hex')
const asRanger = async () => { await page.evaluate(([r]) => { window.raptorRole('member'); window.raptorMe(r) }, [RANGER]); await page.waitForTimeout(400) }
const asSaber = async () => { await page.evaluate(([s]) => { window.raptorRole('admin'); window.raptorMe(s) }, [SABER]); await page.waitForTimeout(400) }
const log = []
const reads = {}
async function readAsRanger(label) {
  await asRanger()
  const st = await L.bellState(page)
  const f = await L.openList(page)
  const lines = L.lineTexts(f)
  L.say(`--- ${label}: Ranger's bell ${JSON.stringify(st)}; list (${lines.length}):`); lines.forEach(l => L.say('   ' + l)); if (f && f.empty) L.say('   EMPTY: ' + f.empty)
  reads[label] = { bell: st, lines, empty: f && f.empty }
  await L.closeList(page)
  await asSaber()
}
async function act(label, fn, shotName) {
  const m = await L.toastMark(page)
  await fn()
  await page.waitForTimeout(500)
  const toasts = await L.toastsSince(page, m)
  L.say(`ACT ${label}: note(s) = ${toasts}`)
  log.push({ label, toasts })
  await readAsRanger(label)
  return toasts
}
const row = async (iid) => { const ri = await L.rowIdx(page, iid); return { ri, fill: `#eWeek .day:not(.peek) [data-fill="g:${L.DI}.${ri}.+"]` } }
const edit = async (iid, fld, text) => {
  await L.toWeek(page); const { ri } = await row(iid)
  const el = page.locator(`#eWeek .day:not(.peek) [data-txt="gr:${L.DI}.${ri}.${fld}"]`).first()
  await el.scrollIntoViewIfNeeded(); await el.click(); await page.keyboard.press('Control+a'); await page.keyboard.type(text); await page.keyboard.press('Enter'); await page.waitForTimeout(300)
  await page.mouse.click(5, 450); await page.waitForTimeout(300)
}
const addOnRow = async (iid, rosterId) => {
  await L.toWeek(page); const { ri, fill } = await row(iid)
  const target = page.locator(`${fill} .puck`).first()
  await target.scrollIntoViewIfNeeded()
  await L.drag(page, L.rosterPuck(page, rosterId), target)
}
const takeOut = async (iid, personId) => {
  await L.toWeek(page); const { fill } = await row(iid)
  const p = page.locator(`${fill} .puck[data-person="${personId}"]`).first()
  await p.scrollIntoViewIfNeeded(); await p.click({ button: 'right' }); await page.waitForTimeout(500)
}

const first = await L.fileIt(page, { title: 'Kit check', kind: 'Meeting', pick: ['Ranger', 'Hex'], from: '09:00', to: '10:00', oil: 'close' })
const iid = first.iid
L.say('filed', JSON.stringify(await L.rec(page, iid)))
await readAsRanger('0 start (after Saber filed it, Ranger in it)')

await act('I1a Saber adds Tally (drag from crew list onto a puck of the row)', () => addOnRow(iid, TALLY))
L.say(JSON.stringify(await L.rec(page, iid)))
await L.shot(page, 'I1a-week-after-add')
await act('I1b Saber takes Tally out (right-click his puck)', () => takeOut(iid, TALLY))
L.say(JSON.stringify(await L.rec(page, iid)))
await act('I1c Saber adds ALL AVAIL (drag onto a puck)', () => addOnRow(iid, 'allavail'))
L.say(JSON.stringify(await L.rec(page, iid)))
await act('I1d Saber takes ALL AVAIL off (right-click its puck)', () => takeOut(iid, 'allavail'))
L.say(JSON.stringify(await L.rec(page, iid)))
await act('I1e Saber re-times to 09:00-11:00 (types the end on the week row)', () => edit(iid, 'end', '11:00'))
L.say(JSON.stringify(await L.rec(page, iid)))
await act('I1f Saber renames to Range brief (types on the week row)', () => edit(iid, 'prog', 'Range brief'))
L.say(JSON.stringify(await L.rec(page, iid)))
await act('I1g Saber changes the remark to Bring ID (types on the week row)', () => edit(iid, 'rmks', 'Bring ID'))
L.say(JSON.stringify(await L.rec(page, iid)))
await L.shot(page, 'I1g-week')
await act('I1h Saber cancels it, WX (board CX)', () => L.cxOn(page, iid, 'WX'))
L.say(JSON.stringify(await L.rec(page, iid)))
await act('I1i Saber un-cancels it (board CX again)', () => L.cxOff(page, iid))
L.say(JSON.stringify(await L.rec(page, iid)))
// ✕ on the board, Accept on the Personal Inputs line, delete in the window
await act('I1j Saber takes it off the programme (board row ✕)', async () => {
  await L.toWeek(page); const ri = await L.rowIdx(page, iid)
  await L.openBoard(page)
  const x = page.locator(`#schedBoard [data-grdel="${L.DI}.${ri}"]`).first()
  await x.scrollIntoViewIfNeeded(); await x.click(); await page.waitForTimeout(500)
  L.say('   after ✕: confirm shown? ' + await page.locator('[data-testid="confirm"], .confirm, #confirmOk, .win-ok').count())
  await L.closeBoard(page)
})
L.say(JSON.stringify(await L.rec(page, iid)), 'ground rows for it on Wed:', await page.evaluate(id => window.DAYS[2].ground.filter(g => g.src === id).length, iid))
await L.toWeek(page)
{
  const fold = page.locator(`#eWeek .sec-inp .pl-fold[data-pitog="${L.DI}"]`).first()
  if (await fold.count()) { await fold.scrollIntoViewIfNeeded(); await fold.click(); await page.waitForTimeout(300) }
  const line = page.locator('#eWeek .day:not(.peek) .sec-inp .pl-row', { hasText: 'Range brief' }).first()
  L.say('LINE after ✕:', (await line.innerText().catch(() => 'none')).replace(/\s+/g, ' '))
  L.say('LINE html:', (await line.evaluate(e => e.outerHTML).catch(() => 'none')).slice(0, 1500))
  await line.scrollIntoViewIfNeeded(); await L.shot(page, 'I1j-line-after-x')
}
await act('I1k Saber presses Accept on the line (back on the programme)', async () => {
  const b = page.locator('#eWeek .day:not(.peek) .sec-inp .pl-row', { hasText: 'Range brief' }).locator('button.accb', { hasText: /accept/i }).first()
  L.say('   accept button count', await b.count())
  await b.scrollIntoViewIfNeeded(); await b.click(); await page.waitForTimeout(500)
})
L.say(JSON.stringify(await L.rec(page, iid)), 'ground rows for it on Wed:', await page.evaluate(id => window.DAYS[2].ground.filter(g => g.src === id).length, iid))
await act('I1l Saber deletes the input in its window', async () => {
  await L.toMonth(page); await L.openDay(page)
  await page.locator(`[data-testid="win-inputsday"] .icard[data-popiid="${iid}"]`).first().click()
  await page.waitForSelector('#inpEditPop #inpEditStart'); await page.waitForTimeout(300)
  L.say('   window buttons:', await page.evaluate(() => [...document.querySelectorAll('#inpEditPop button')].filter(b => b.offsetParent).map(b => b.id + ':' + b.textContent.trim().slice(0, 20)).join(' | ')))
  const d = page.locator('#inpEditPop').getByRole('button', { name: /delete/i }).first()
  await d.click(); await page.waitForTimeout(500)
  L.say('   after Delete: buttons:', await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent && /delete|confirm|yes|remove/i.test(b.textContent)).map(b => b.id + ':' + b.getAttribute('data-testid') + ':' + b.textContent.trim().slice(0, 20)).join(' | ')))
  const c = page.locator('[data-testid="inped-delall-yes"]').first()
  if (await c.count()) { await c.click(); await page.waitForTimeout(500) }
  await L.closeDay(page)
})
L.say('inputs now:', JSON.stringify(await L.allInputs(page)))
// tap the deleted input's lines
await asRanger()
{
  const f = await L.openList(page)
  const top = page.locator('.bell-list .bl-line').first()
  await top.click(); await page.waitForTimeout(500)
  L.say('TAP on the newest line (Deleted): note =', await L.note(page), '| window open?', await page.locator('#inpEditPop:visible').count(), '| list open?', await page.locator('.bell-list').count())
  await L.shot(page, 'I1m-tap-deleted-line')
  const f2 = await L.openList(page)
  L.say('list after the tap:'); L.lineTexts(f2).forEach(l => L.say('   ' + l))
  reads['I1m after tap on deleted line'] = { lines: L.lineTexts(f2), noteAfterTap: await L.note(page) }
  await L.shotList(page, 'I1m-list-after')
  await L.closeList(page)
}
await asSaber()
L.record('I1', { reads, log })

// ---- I2: Saber adds RANGER to an input, then takes him off
const second = await L.fileIt(page, { title: 'Sim brief', kind: 'Meeting', pick: ['Hex', 'Tally'], from: '13:00', to: '14:00', oil: 'close' })
const iid2 = second.iid
L.say('I2 filed', JSON.stringify(await L.rec(page, iid2)))
const n0 = (await L.openList(await (async () => { await asRanger(); return page })())).lines.length
await L.closeList(page); await asSaber()
L.say('I2 Ranger notices before:', n0)
await act('I2a Saber adds RANGER to Sim brief (drag from crew list)', () => addOnRow(iid2, RANGER))
L.say(JSON.stringify(await L.rec(page, iid2)))
await act('I2b Saber takes RANGER off Sim brief (right-click his puck)', () => takeOut(iid2, RANGER))
L.say(JSON.stringify(await L.rec(page, iid2)))
await asRanger(); { const f = await L.openList(page); await L.shotList(page, 'I2-list'); await L.closeList(page) } await asSaber()

// ---- I3: one save that re-times AND adds Tally (the input's own window)
const third = await L.fileIt(page, { title: 'Gear check', kind: 'Meeting', pick: ['Ranger', 'Hex'], from: '15:00', to: '16:00', oil: 'close' })
const iid3 = third.iid
L.say('I3 filed', JSON.stringify(await L.rec(page, iid3)))
await readAsRanger('I3-0 after Gear check filed')
await act('I3 Saber, ONE save in the window: end 17:00 and Tally added', async () => {
  await L.toMonth(page); await L.openDay(page)
  await page.locator(`[data-testid="win-inputsday"] .icard[data-popiid="${iid3}"]`).first().click()
  await page.waitForSelector('#inpEditPop #inpEditStart'); await page.waitForTimeout(300)
  await page.locator(`#inpEditPop [data-pp="${TALLY}"]`).click()
  await page.locator('#inpEditPop #inpEditEnd').fill('17:00')
  await L.shot(page, 'I3-window-before-save')
  await page.locator('#inpEditSave').click(); await page.waitForTimeout(600)
  await L.closeDay(page)
})
L.say(JSON.stringify(await L.rec(page, iid3)))
await asRanger(); { await L.openList(page); await L.shotList(page, 'I3-list'); await L.closeList(page) } await asSaber()
L.record('I1', { reads, log })
console.log(L.errs)
await browser.close()
