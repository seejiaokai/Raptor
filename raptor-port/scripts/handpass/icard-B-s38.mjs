// #38 Move onto a holiday - Saber (admin), desktop 1440x900
import * as L from './icard-B-lib.mjs'
const browser = await L.launch()
const { ctx, page: p } = await L.open(browser, { width: 1440, height: 900 })
await L.watchToasts(p)
const T = false
const sab = await L.csId(p, 'Saber')
const snap = async () => (await L.recs(p, { person: sab })).filter(r => r.type === 'Event').map(r => `${r.type} ${r.date}${r.endDate ? '→' + r.endDate : ''} oil=${JSON.stringify(r.oil)}`).sort().join(' ; ')
const pics = []
await L.scn(38, '1440x900', 'Saber (admin)', async () => {
  const notes = []
  const e1 = await L.declareHoliday(p, T, 'ph', '2026-07-23', 'Test Holiday')
  const e2 = await L.declareHoliday(p, T, 'off', '2026-07-24', 'Test Off Day')
  notes.push(`declared PH 23 Jul (err "${e1}") and Off 24 Jul (err "${e2}")`)
  await L.fileInput(p, T, { iso: '2026-07-21', type: 'Event', who: sab, from: '09:00', to: '12:00', title: 'Move test' })
  const ev = (await L.recs(p, { person: sab })).find(r => r.type === 'Event')
  notes.push('Event filed: ' + await snap())
  // move onto the public holiday
  await L.openFromList(p, T, ev.iid)
  await L.tapDate(p, T, '2026-07-23')
  await p.click('#inpEditSave')
  const sheet = p.locator('[data-testid="oilconf"]')
  const asked = await sheet.waitFor({ timeout: 4000 }).then(() => true, () => false)
  const q = asked ? (await sheet.innerText()).replace(/\s+/g, ' ') : ''
  pics.push(await L.shot(p, 'B38-1-ph-question'))
  const dur = await snap()
  notes.push(`PH move: question asked ${asked}: "${q.slice(0, 300)}"; saved while asked: ${dur}`)
  if (asked) await L.answerOil(p, T, 'yes'); await p.waitForTimeout(500)
  const afterPh = await snap(); notes.push('after answering Yes: ' + afterPh)
  await L.undo(p); const u1 = await snap(); await L.redo(p); const r1 = await snap()
  notes.push(`Undo: ${u1}; Redo: ${r1}`)
  // move onto the Off day
  await L.openFromList(p, T, ev.iid)
  await L.tapDate(p, T, '2026-07-24')
  await p.click('#inpEditSave')
  const asked2 = await sheet.waitFor({ timeout: 2500 }).then(() => true, () => false)
  await p.waitForTimeout(500)
  pics.push(await L.shot(p, 'B38-2-off-day'))
  const afterOff = await snap()
  notes.push(`Off-day move: OIL question asked ${asked2}; saved: ${afterOff}`)
  if (asked2) { notes.push('Off sheet: ' + (await sheet.innerText()).replace(/\s+/g, ' ').slice(0, 300)); await p.keyboard.press('Escape') }
  await L.toList(p, T)
  const chip = await p.locator(`#inBody tr[data-iid="${ev.iid}"] [data-oilrev]`).count()
  const chipTxt = chip ? (await p.locator(`#inBody tr[data-iid="${ev.iid}"] [data-oilrev]`).first().innerText()) : ''
  await p.locator(`#inBody tr[data-iid="${ev.iid}"] [data-testid="in-open"]`).click(); await p.locator(L.WIN).waitFor()
  const oilLine = (await p.locator(`${L.WIN} [data-testid="oil-revise"], ${L.WIN} [data-testid="oil-unanswered"]`).allInnerTexts()).join(' / ')
  const oilArea = (await p.locator(`${L.WIN}`).innerText()).replace(/\s+/g, ' ').match(/OIL[^]{0,200}/)
  pics.push(await L.shot(p, 'B38-3-off-day-window'))
  await p.locator('#inpEditCancel').click(); await p.waitForTimeout(300)
  notes.push(`on the Off day (24 Jul): row OIL chip count ${chip} "${chipTxt}"; window OIL line "${oilLine}"; window text near OIL: ${oilArea ? oilArea[0].slice(0, 160) : 'none'}`)
  await L.undo(p); const u2 = await snap(); await L.redo(p); const r2 = await snap()
  notes.push(`Undo: ${u2}; Redo: ${r2}`)
  // an independent weekday Event straight onto the Off day
  await L.fileInput(p, T, { iso: '2026-07-22', type: 'Event', who: sab, from: '10:00', to: '11:00', title: 'Off test' })
  const ev2 = (await L.recs(p, { person: sab })).find(r => r.type === 'Event' && r.title === 'Off test')
  await L.openFromList(p, T, ev2.iid); await L.tapDate(p, T, '2026-07-24'); await p.click('#inpEditSave')
  const asked3 = await sheet.waitFor({ timeout: 2500 }).then(() => true, () => false)
  await p.waitForTimeout(500)
  const e2now = await L.rec(p, { iid: ev2.iid })
  pics.push(await L.shot(p, 'B38-4-second-event-off-day'))
  notes.push(`a second weekday Event (22 Jul) moved straight onto the Off day 24 Jul: OIL question asked ${asked3}; saved date ${e2now.date}, oil ${JSON.stringify(e2now.oil)}`)
  const stale = /oil=\{"2026-07-23"/.test(afterOff)
  const ok = !e1 && !e2 && asked && /23 Jul|Jul 23|Thu/i.test(q) && dur.includes('Jul 21') && /Jul 23/.test(afterPh) && /"2026-07-23":/.test(afterPh) === true && !asked2 && /Jul 24/.test(afterOff) && !asked3 && !e2now.oil && chip === 0 && !oilLine && /Jul 23/.test(r1)
  notes.push(stale ? "OBSERVATION: the saved record still carries oil={2026-07-23:0.5} (read from window.INPUTS) although it now sits on 24 Jul; no chip and no OIL line is drawn" : "saved oil map cleared"); return { ok, saw: notes.join(" || "), pics }
})
L.save('s38')
console.log(L.errs)
await browser.close()
