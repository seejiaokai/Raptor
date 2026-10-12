// I4 / I5 / I6 / I7 : who is told, and who is not. One world; bells read by changing person IN PLACE.
import * as L from './or-I-lib.mjs'
const { page, browser } = await L.start()
const ID = {}
for (const cs of ['Ranger', 'Saber', 'Tally', 'Hex', 'Anvil', 'Hunter', 'Drifter']) ID[cs] = await L.csId(page, cs)
const as = async (cs) => { await page.evaluate(([id, role]) => { window.raptorRole(role); window.raptorMe(id) }, [ID[cs], cs === 'Saber' ? 'admin' : 'member']); await page.waitForTimeout(400) }
const results = {}
let cur = 'Saber'
const switchTo = async cs => { if (cur !== cs) { await as(cs); cur = cs } }
async function read(cs, label) {
  const back = cur
  await switchTo(cs)
  const st = await L.bellState(page)
  const f = await L.openList(page)
  const lines = L.lineTexts(f)
  L.say(`   [${label}] ${cs}'s bell lit=${st.lit}; ${lines.length} line(s)`)
  lines.forEach(l => L.say('      ' + l))
  results[label + ' / ' + cs] = { lit: st.lit, lines }
  await L.closeList(page)
  await switchTo(back)
  return { lit: st.lit, n: lines.length, lines }
}
const readAll = async (label, who = ['Ranger', 'Tally', 'Hex', 'Saber']) => { for (const cs of who) await read(cs, label) }
const edit = async (iid, fld, text) => {
  await L.toWeek(page); const ri = await L.rowIdx(page, iid)
  const el = page.locator(`#eWeek .day:not(.peek) [data-txt="gr:${L.DI}.${ri}.${fld}"]`).first()
  await el.scrollIntoViewIfNeeded(); await el.click(); await page.keyboard.press('Control+a'); await page.keyboard.type(text); await page.keyboard.press('Enter'); await page.waitForTimeout(300)
  await page.mouse.click(5, 450); await page.waitForTimeout(300)
}
const openWin = async (iid, day = L.DAY) => {
  await L.toMonth(page); await L.openDay(page, day)
  await page.locator(`[data-testid="win-inputsday"] .icard[data-popiid="${iid}"]`).first().click()
  await page.waitForSelector('#inpEditPop #inpEditStart'); await page.waitForTimeout(300)
}
const WHICH = process.argv[2] || 'all'

// ================= I4
if (WHICH === 'all' || WHICH.includes('4')) {
  L.say('=== I4: Ranger files for Tally and Hex (not himself); Saber cancels it')
  await switchTo('Ranger')
  const gear = await page.evaluate(() => { const g = document.querySelector('#inpGear, [data-testid="inputs-gear"]'); return g ? g.outerHTML.slice(0, 120) : 'no gear (member)' })
  L.say('   gear as Ranger:', gear)
  const f = await L.fileIt(page, { title: 'Team brief', kind: 'Meeting', pick: ['Tally', 'Hex'], from: '09:00', to: '10:00', oil: 'close' })
  const rec = await L.rec(page, f.iid)
  L.say('   filed by Ranger:', JSON.stringify(rec), f.oil)
  results.I4_filed = rec
  if (!rec) { L.say('   FILING FAILED'); }
  await readAll('I4 after Ranger filed it')
  await switchTo('Saber')
  await L.cxOn(page, f.iid, 'WX')
  L.say('   cancelled:', JSON.stringify(await L.rec(page, f.iid)))
  await readAll('I4 after Saber cancelled it')
  results.I4_after = await L.rec(page, f.iid)
}
// ================= I5
if (WHICH === 'all' || WHICH.includes('5')) {
  L.say('=== I5: Ranger changes HIS OWN input (filed by himself for himself and Tally)')
  await switchTo('Ranger')
  const f = await L.fileIt(page, { title: 'Pair brief', kind: 'Meeting', pick: ['Ranger', 'Tally'], several: true, from: '11:00', to: '12:00', oil: 'close' })
  L.say('   filed by Ranger:', JSON.stringify(await L.rec(page, f.iid)))
  await readAll('I5 before the change', ['Ranger', 'Tally'])
  await openWin(f.iid)
  await page.locator('#inpEditPop #inpEditEnd').fill('13:00')
  await L.shot(page, 'I5-window')
  await page.locator('#inpEditSave').click(); await page.waitForTimeout(600)
  L.say('   note:', await L.note(page), '| window still open?', await page.locator('#inpEditPop:visible').count())
  await L.closeDay(page)
  L.say('   after:', JSON.stringify(await L.rec(page, f.iid)))
  await readAll('I5 after Ranger re-timed his own input', ['Ranger', 'Tally', 'Saber'])
}
// ================= I6
if (WHICH === 'all' || WHICH.includes('6')) {
  L.say('=== I6: an input holding ALL AVAIL is re-timed')
  await switchTo('Saber')
  const f = await L.fileIt(page, { title: 'Crowd duty', kind: 'Duty', pick: ['Ranger', 'Hex'], several: true, from: '16:00', to: '17:00', oil: 'close',
    extra: async () => {} })
  L.say('   filed:', JSON.stringify(await L.rec(page, f.iid)))
  // add ALL AVAIL through the schedule row (drag from the crew list)
  await L.toWeek(page); let ri = await L.rowIdx(page, f.iid)
  const fill = `#eWeek .day:not(.peek) [data-fill="g:${L.DI}.${ri}.+"]`
  await L.drag(page, L.rosterPuck(page, 'allavail'), page.locator(`${fill} .puck`).first())
  L.say('   with ALL AVAIL:', JSON.stringify(await L.rec(page, f.iid)), '| note:', await L.note(page))
  const who = ['Ranger', 'Hex', 'Tally', 'Anvil', 'Hunter', 'Drifter', 'Saber']
  await readAll('I6 before the re-time', who)
  await edit(f.iid, 'end', '18:00')
  L.say('   re-timed:', JSON.stringify(await L.rec(page, f.iid)))
  await readAll('I6 after the re-time', who)
}
// ================= I7
if (WHICH === 'all' || WHICH.includes('7')) {
  L.say('=== I7: an OIL answer changed by Saber')
  await switchTo('Saber')
  const day = '2026-07-18'
  const f = await L.fileIt(page, { title: 'Sat training', kind: 'Training', pick: ['Ranger', 'Tally'], several: true, from: '09:00', to: '12:00', oil: 'yes', day })
  L.say('   filed:', JSON.stringify(await L.rec(page, f.iid)), f.oil)
  await readAll('I7 before the OIL change', ['Ranger', 'Tally', 'Saber'])
  await openWin(f.iid, day)
  const txt = await page.locator('#inpEditPop').innerText()
  L.say('   window text (OIL part):', txt.replace(/\s+/g, ' ').match(/.{0,120}OIL.{0,160}/i)?.[0])
  L.say('   buttons:', await page.evaluate(() => [...document.querySelectorAll('#inpEditPop button')].filter(b => b.offsetParent && /change|oil|yes|no/i.test(b.textContent + b.id + b.getAttribute('data-testid'))).map(b => b.id + ':' + b.getAttribute('data-testid') + ':' + b.textContent.trim().slice(0, 25)).join(' | ')))
  await L.shot(page, 'I7-window')
  await page.locator('[data-testid="oil-revise"]').click(); await page.waitForTimeout(500)
  L.say('   after Change…: sheet?', await page.locator('[data-testid="oilconf"]').count(), '| testids:', await page.evaluate(() => [...document.querySelectorAll('[data-testid^="oil"]')].filter(e => e.offsetParent).map(e => e.getAttribute('data-testid') + ':' + e.textContent.trim().slice(0, 30)).join(' | ')))
  await L.shot(page, 'I7-oil-sheet')
  const sheet = page.locator('[data-testid="oilconf"]')
  if (await sheet.count()) {
    const no = sheet.locator('[data-testid="oil-none"], [data-testid="oil-no"]').first()
    await no.click(); await sheet.locator('[data-testid="oilconf-save"]').click(); await page.waitForTimeout(500)
  }
  L.say('   note after the OIL change:', await L.note(page), '| window open?', await page.locator('#inpEditPop:visible').count())
  if (await page.locator('#inpEditSave:visible').count()) { await page.locator('#inpEditSave').click(); await page.waitForTimeout(500); L.say('   saved window; note:', await L.note(page)) }
  await L.closeDay(page)
  L.say('   INPUTS after:', JSON.stringify(await L.rec(page, f.iid)))
  await readAll('I7 after the OIL answer was changed', ['Ranger', 'Tally', 'Saber'])
}
L.record('I4-I7', results)
console.log(L.errs)
await browser.close()
