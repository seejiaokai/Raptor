import * as L from './icard-C-lib.mjs'
const { sleep } = L
const w = await L.world('phone', 'ad')
const p = w.page
const oilLine = async () => {
  const a = p.locator('[data-testid="oil-unanswered"]'), b = p.locator('[data-testid="oil-revise"]')
  const un = (await a.count()) ? (await a.innerText()).replace(/\s+/g, ' ') : null
  const rv = (await b.count()) ? (await b.evaluate(e => (e.closest('.inped-oil, .inped-row, div') || e.parentElement).innerText).catch(() => 'Change…')).replace(/\s+/g, ' ') : null
  return { un, rv, answerBtn: await p.locator('[data-testid="oil-answer"]').count(), changeBtn: await b.count() }
}
const parts = []
const pics = []
let verdict = 'PASS'
const fail = (m) => { verdict = 'FAIL'; parts.push('FAIL: ' + m) }
try {
  const ranger = await L.pid(p, 'Ranger')
  await L.fileNew(w, { iso: '2026-07-15', type: 'Duty', person: ranger, s: '09:00', e: '12:00' })
  const rec0 = await L.recBy(p, { type: 'Duty', date: 'Jul 15', person: ranger })
  const err = await L.declareHoliday(w, '2026-07-15', 'Test holiday', 'TH')
  parts.push('filed Ranger Duty 09:00-12:00 on Wed 15 Jul, declared 15 Jul a public holiday through Inputs gear > Calendar > Holidays (err: "' + err + '")')
  pics.push(await L.pic(w, '66-1-holiday-declared'))
  await L.closeWins(p)
  await L.toList(w)
  const card = p.locator(`#inList [data-testid="inl-row-${rec0.iid}"]`)
  await card.scrollIntoViewIfNeeded()
  const chips = await p.locator(`#inList [data-testid="inl-row-${rec0.iid}"] .roil, #inList [data-testid="inl-row-${rec0.iid}"] [data-oilask], #inList [data-testid="inl-row-${rec0.iid}"] [data-oilrev]`).count()
  pics.push(await L.pic(w, '66-2-list-card'))
  await card.tap(); await L.win(p).waitFor(); await sleep(300)
  let o = await oilLine()
  parts.push(`window: heading "OIL" present=${await p.locator(WINSEL('.inped-oil-h, label, h4')).count() >= 0}; unanswered line "${o.un}"; Answer button count ${o.answerBtn}; phone-card OIL chips ${chips}`)
  if (!(o.un && /Not answered yet — 15 Jul/.test(o.un))) fail('line not "Not answered yet — 15 Jul": ' + o.un)
  if (o.answerBtn !== 1) fail('Answer… button not present')
  await p.locator('[data-testid="oil-unanswered"]').scrollIntoViewIfNeeded().catch(() => {})
  pics.push(await L.pic(w, '66-3-window-unanswered'))
  // Answer… then Cancel
  await p.locator('[data-testid="oil-answer"]').scrollIntoViewIfNeeded()
  await p.locator('[data-testid="oil-answer"]').tap(); await sleep(500)
  const q1 = await L.oilText(p)
  pics.push(await L.pic(w, '66-4-question'))
  parts.push('Answer… opened: ' + q1)
  if (!q1) fail('Answer… did not open the OIL question')
  await p.locator('[data-testid="oilconf"] .abtn.ghost').first().tap(); await sleep(500)
  let recC = await L.recId(p, rec0.iid)
  o = await oilLine()
  parts.push(`after Cancel: saved oil ${JSON.stringify(recC.oil)}; line "${o.un}"`)
  if (recC.oil) fail('Cancel left an answer saved: ' + JSON.stringify(recC.oil))
  if (!o.un) fail('after Cancel the window no longer says unanswered')
  pics.push(await L.pic(w, '66-5-after-cancel'))
  // answer yes
  await p.locator('[data-testid="oil-answer"]').scrollIntoViewIfNeeded()
  await p.locator('[data-testid="oil-answer"]').tap(); await sleep(500)
  await L.answerOil(w, 'yes')
  await sleep(500)
  recC = await L.recId(p, rec0.iid)
  const winUp = await L.win(p).count()
  if (!winUp) { await L.toList(w); await card.scrollIntoViewIfNeeded(); await card.tap(); await L.win(p).waitFor(); await sleep(300) }
  o = await oilLine()
  parts.push(`after answering Yes: saved oil ${JSON.stringify(recC.oil)}; window still open ${winUp}; unanswered line ${o.un}; Change… buttons ${o.changeBtn}; text "${o.rv}"`)
  if (!recC.oil || !Object.values(recC.oil).some(v => v > 0)) fail('answer Yes not recorded: ' + JSON.stringify(recC.oil))
  if (o.un) fail('line still says Not answered after answering')
  if (o.changeBtn !== 1) fail('no Change… route after answering')
  pics.push(await L.pic(w, '66-6-answered'))
  // Change… opens the question with Yes preselected
  if (o.changeBtn) {
    await p.locator('[data-testid="oil-revise"]').scrollIntoViewIfNeeded()
    await p.locator('[data-testid="oil-revise"]').tap(); await sleep(500)
    const q2 = await L.oilText(p)
    const yesPressed = await p.locator('[data-testid="oilconf"] [data-testid="oil-yes"]').evaluate(e => e.getAttribute('aria-pressed') || e.className).catch(() => '?')
    parts.push('Change… opened: ' + (q2 || '').slice(0, 160) + ' | yes button state: ' + yesPressed)
    pics.push(await L.pic(w, '66-7-change-question'))
    if (!q2) fail('Change… did not open the question')
    await p.keyboard.press('Escape'); await sleep(400)
  }
  // Undo / Redo
  if (await L.win(p).count()) await p.locator('#inpEditCancel').tap().catch(() => {})
  await sleep(300)
  const u = await L.undo(w)
  recC = await L.recId(p, rec0.iid)
  parts.push(`Undo pressed ${u}: saved oil ${JSON.stringify(recC.oil)}`)
  if (!u || recC.oil) fail('Undo did not remove the answer (' + JSON.stringify(recC.oil) + ')')
  // reopen to see the line
  await L.toList(w); await card.scrollIntoViewIfNeeded(); await card.tap(); await L.win(p).waitFor(); await sleep(300)
  o = await oilLine(); parts.push('after Undo the window says: ' + o.un)
  if (!o.un) fail('after Undo the line is not Not answered yet')
  pics.push(await L.pic(w, '66-8-after-undo'))
  await p.locator('#inpEditCancel').tap(); await sleep(300)
  const r = await L.redo(w)
  recC = await L.recId(p, rec0.iid)
  parts.push(`Redo pressed ${r}: saved oil ${JSON.stringify(recC.oil)}`)
  if (!r || !recC.oil) fail('Redo did not bring the answer back')
  await L.toList(w); await card.scrollIntoViewIfNeeded(); await card.tap(); await L.win(p).waitFor(); await sleep(300)
  o = await oilLine(); parts.push('after Redo the window says: change buttons ' + o.changeBtn + ', unanswered ' + o.un)
  pics.push(await L.pic(w, '66-9-after-redo'))
  if (o.un || o.changeBtn !== 1) fail('after Redo the answered line did not return')
  L.row(66, 'phone 390x844', 'Admin (Saber)', verdict, parts.join(' || '), pics)
} catch (e) {
  console.log('ERR', e)
  pics.push(await L.pic(w, '66-err'))
  L.row(66, 'phone 390x844', 'Admin (Saber)', 'NOT RUN', 'script stopped: ' + String(e).slice(0, 300) + ' || ' + parts.join(' || '), pics)
}
await L.finish(w)
function WINSEL(s) { return '[data-testid="win-inputedit"] ' + s }
