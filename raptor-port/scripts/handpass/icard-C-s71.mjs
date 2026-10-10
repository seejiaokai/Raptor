import * as L from './icard-C-lib.mjs'
const { sleep } = L
const w = await L.world('phone', 'ad')
const p = w.page
const parts = [], pics = []
let verdict = 'PASS'
const fail = m => { verdict = 'FAIL'; parts.push('FAIL: ' + m) }
const fmt = r => r ? `${r.date} ${r.s}-${r.e} oil ${JSON.stringify(r.oil)}` : 'GONE'
async function run(label, iid, ctlId, answer) {
  await L.openFromList(w, iid)
  const rec0 = await L.recId(p, iid)
  await L.setTimes(p, null, '17:00')
  const draftEnd = await p.locator('#inpEditEnd').inputValue()
  const ctl = p.locator(`[data-testid="${ctlId}"]`)
  await ctl.scrollIntoViewIfNeeded(); await ctl.tap(); await sleep(500)
  const q = (await L.oilText(p)) || ''
  pics.push(await L.pic(w, `71-${label}-1-question`))
  parts.push(`${label}: saved ${fmt(rec0)}; typed End 17:00 (8 h) unsaved; pressed ${ctlId}: question text "${q.slice(0, 260)}"`)
  const hrs = /deserve FO /i.test(q)
  parts.push(`${label}: question prices the proposed 8 hours (says FO - a full day; the saved 3 hours would say HO - half a day): ${hrs}`)
  if (!hrs) fail(label + ': the question text does not show the proposed hours (8 h) — only: ' + q.slice(0, 200))
  // cancel the question
  await p.locator('[data-testid="oilconf"] .abtn.ghost').first().tap(); await sleep(500)
  const rC = await L.recId(p, iid)
  const winOpen = await L.win(p).count()
  const endNow = winOpen ? await p.locator('#inpEditEnd').inputValue() : null
  parts.push(`${label}: after Cancel on the question: saved ${fmt(rC)}; window open ${winOpen}; draft End "${endNow}" (was "${draftEnd}")`)
  if (rC.e !== rec0.e || JSON.stringify(rC.oil) !== JSON.stringify(rec0.oil)) fail(label + ': Cancel changed the saved input: ' + fmt(rC))
  if (!winOpen || endNow !== draftEnd) fail(label + ': Cancel did not keep the draft (window ' + winOpen + ', End ' + endNow + ')')
  pics.push(await L.pic(w, `71-${label}-2-after-cancel`))
  // again, confirm
  if (winOpen) {
    const c2 = p.locator(`[data-testid="${ctlId}"]`)
    await c2.scrollIntoViewIfNeeded(); await c2.tap(); await sleep(500)
    await L.answerOil(w, answer); await sleep(600)
    const rS = await L.recId(p, iid)
    parts.push(`${label}: confirmed ${answer}: saved ${fmt(rS)}; window open after ${await L.win(p).count()}`)
    const hoursSaved = rS.e === 1020
    const oilYes = Object.values(rS.oil || {}).some(v => v > 0)
    if (!hoursSaved) {
      // the answer alone may be saved while the hours still wait in the draft: press Save
      parts.push(`${label}: hours NOT saved by the answer (End still ${rS.e}); the answer saved alone`)
      fail(label + ': confirming the question saved the answer but not the proposed hours: ' + fmt(rS))
    }
    if (oilYes !== (answer === 'yes')) fail(label + ': answer not saved right: ' + fmt(rS))
    await L.closeWins(p)
    const u = await L.undo(w); const rU = await L.recId(p, iid)
    parts.push(`${label}: ONE Undo (${u}): ${fmt(rU)} (before: ${fmt(rec0)})`)
    if (rU.e !== rec0.e || JSON.stringify(rU.oil) !== JSON.stringify(rec0.oil)) fail(label + ': one Undo did not put back both the hours and the answer: ' + fmt(rU))
    const rd = await L.redo(w); parts.push(`${label}: Redo ${rd}: ${fmt(await L.recId(p, iid))}`)
  }
}
try {
  await L.fileNew(w, { iso: '2026-07-18', type: 'Duty', s: '09:00', e: '12:00', oil: 'yes' })
  const ans = await L.recBy(p, { type: 'Duty', date: 'Jul 18' })
  parts.push('answered, 3-hour Duty Sat 18 Jul 09:00-12:00 filed with OIL Yes: ' + fmt(ans))
  await run('ANS', ans.iid, 'oil-revise', 'no')
  // unanswered: weekday duty on a declared holiday
  await L.fileNew(w, { iso: '2026-07-24', type: 'Duty', s: '09:00', e: '12:00' })
  const un = await L.recBy(p, { type: 'Duty', date: 'Jul 24' })
  await L.declareHoliday(w, '2026-07-24', 'Test holiday', 'TH'); await L.closeWins(p)
  parts.push('unanswered: weekday Duty Fri 24 Jul 09:00-12:00 then 24 Jul declared a public holiday: ' + fmt(await L.recId(p, un.iid)))
  await run('UNANS', un.iid, 'oil-answer', 'yes')
  L.row(71, 'phone 390x844', 'Admin (Saber)', verdict, parts.join(' || '), pics)
} catch (e) {
  console.log('ERR', e)
  pics.push(await L.pic(w, '71-err'))
  L.row(71, 'phone 390x844', 'Admin (Saber)', 'NOT RUN', 'script stopped: ' + String(e).slice(0, 400) + ' || ' + parts.join(' || '), pics)
}
await L.finish(w)
