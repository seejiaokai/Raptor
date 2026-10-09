import * as L from './icard-C-lib.mjs'
const { sleep } = L
const parts = [], pics = []
let verdict = 'PASS'
const fail = m => { verdict = 'FAIL'; parts.push('FAIL: ' + m) }
const hs = h => h ? `tag ${h.tag}; pending "${h.pending}"; working sign-off selects [${h.signs.join('/')}]; issued sign-off line "${h.signed}"; mark "${h.nys}"; publish ${h.beak}/${h.alpub}/${h.unpub}` : 'none'
let w, errs = []
async function setup(label) {
  w = await L.world('desk', 'us')
  const p = w.page
  await L.fileNew(w, { iso: '2026-07-20', type: 'Duty', s: '09:00', e: '12:00', oil: 'no' })
  const rec = await L.recBy(p, { type: 'Duty', date: 'Jul 20' })
  await L.switchUser(w, 'ad')
  const sp = await L.signAndPublish(w, 'Jul 20', 0)
  parts.push(`${label}: Ranger filed Duty 09:00-12:00 on Mon 20 Jul; Saber signed 4 boxes ${JSON.stringify(sp.signs)} and pressed ${JSON.stringify(sp.pub)}; Monday head after publishing: ${hs(sp.head)}`)
  const again = await L.signDay(w.page, 0, 1)
  parts.push(`${label}: after publishing, Saber signed the four working boxes again ${JSON.stringify(again)}`)
  const base = await L.editDay(w, 'Jul 20', 0)
  parts.push(`${label} baseline Mon 20 (Edit Schedule): ${hs(base.head)}; request rows ${JSON.stringify(base.rows)}`)
  pics.push(await L.pic(w, `74-${label}-1-baseline`))
  await L.switchUser(w, 'us')
  return { rec, base }
}
async function move(rec) {
  const p = w.page
  await L.openFromList(w, rec.iid)
  const f = await L.winFacts(p)
  await p.locator(`${L.WIN} #inpEdCal [data-cal="2026-07-21"]`).click()
  const line = await p.locator(`${L.WIN} .rc-read`).innerText()
  const s = await L.saveWin(w)
  const now = await L.recId(p, rec.iid)
  return { cal: f.cal, line, asked: s.asked, now }
}
try {
  // ---- world 1: the moved state
  const { rec, base } = await setup('W1')
  const m = await move(rec)
  parts.push(`W1 Ranger opened it from List (calendar present ${m.cal}), tapped 21 Jul; line "${m.line}"; saved ${m.now.date}${m.now.endDate ? '>' + m.now.endDate : ''}; OIL asked ${m.asked}`)
  if (!m.cal || m.now.date !== 'Jul 21' || m.now.endDate) fail('move not saved as a one-day input on 21 Jul: ' + JSON.stringify(m.now))
  pics.push(await L.pic(w, '74-W1-2-ranger-saved'))
  await L.switchUser(w, 'ad')
  const d0 = await L.editDay(w, 'Jul 20', 0)
  pics.push(await L.pic(w, '74-W1-3-mon20-after-move'))
  const d1 = await L.editDay(w, 'Jul 20', 1)
  pics.push(await L.pic(w, '74-W1-4-tue21-after-move'))
  const is0 = await L.issuedDay(w, 'Jul 20', 0)
  pics.push(await L.pic(w, '74-W1-5-issued-mon20'))
  parts.push(`W1 after the move, Edit Schedule Mon 20: ${hs(d0.head)}; rows ${JSON.stringify(d0.rows)} || Tue 21 rows ${JSON.stringify(d1.rows)} || View-only (issued) Mon 20 rows ${JSON.stringify(is0.rows)} tag ${is0.tag}`)
  if (d0.rows.some(r => /DUTY/i.test(r) && /Ranger/.test(r))) fail('working Monday still carries the duty')
  if (!d1.rows.some(r => /DUTY/i.test(r) && /Ranger/.test(r))) fail('working Tuesday does not carry the duty')
  if (!is0.rows.some(r => /DUTY/i.test(r) && /Ranger/.test(r))) fail('the published face of Mon 20 lost the duty')
  const pendBefore = base.head.pending, pendAfter = d0.head.pending
  parts.push(`pending chip ${JSON.stringify(pendBefore)} -> ${JSON.stringify(pendAfter)}; sign-off line ${JSON.stringify(base.head.signed)} -> ${JSON.stringify(d0.head.signed)}; AL button: ${JSON.stringify(d0.head.alpub)}`)
  if (!/pending/i.test(pendAfter)) fail('Monday shows no pending chip after the move (' + pendAfter + ')')
  if (!d0.head.signs.every(x => /name/i.test(x))) fail('Monday kept its working sign-offs after the move: ' + d0.head.signs.join('/'))
  if (!/Not yet signed/i.test(d0.head.nys)) fail('no Not yet signed mark after the move')
  if (!/Publish AL/i.test(d0.head.alpub)) fail('no Publish AL button after the move')
  await w.browser.close(); errs.push(...w.errors)
  // ---- world 2: Undo / Redo
  const s2 = await setup('W2')
  const m2 = await move(s2.rec)
  const p = w.page
  await L.closeWins(p)
  await L.go(p, 'inputs')
  const u = await L.undo(w)
  const afterU = await L.recId(p, s2.rec.iid)
  const r = await L.redo(w)
  const afterR = await L.recId(p, s2.rec.iid)
  const u2 = await L.undo(w)
  const afterU2 = await L.recId(p, s2.rec.iid)
  parts.push(`W2 Ranger moved to ${m2.now.date}; Undo ${u}: ${afterU.date}; Redo ${r}: ${afterR.date}; Undo again ${u2}: ${afterU2.date}`)
  if (afterU.date !== 'Jul 20' || afterR.date !== 'Jul 21' || afterU2.date !== 'Jul 20') fail('Undo/Redo did not move the input back and forth')
  await L.switchUser(w, 'ad')
  const e0 = await L.editDay(w, 'Jul 20', 0)
  pics.push(await L.pic(w, '74-W2-6-mon20-after-undo'))
  parts.push('(the "N new" chip is the change-history counter of changes new to the viewer, it rose from 1 to 5 across move/undo/redo/undo; the amendment chip is the "N pending" one)')
  parts.push(`W2 after Undo, Mon 20: ${hs(e0.head)} ; rows ${JSON.stringify(e0.rows)} (baseline was: ${hs(s2.base.head)})`)
  if (/pending/i.test(e0.head.pending) || e0.head.alpub || e0.head.signs.join('/') !== s2.base.head.signs.join('/') || e0.head.nys !== s2.base.head.nys) fail('Undo did not restore the pending chip and working sign-offs: ' + hs(e0.head))
  if (!e0.rows.some(x => /DUTY/i.test(x) && /Ranger/.test(x))) fail('after Undo the working Monday lacks the duty')
  errs.push(...w.errors)
  L.row(74, 'desktop 1440x900', 'Member (Ranger) edits; Admin (Saber) publishes/inspects', verdict, parts.join(' || '), pics)
} catch (e) {
  console.log('ERR', e)
  try { pics.push(await L.pic(w, '74-err')) } catch (x) {}
  L.row(74, 'desktop 1440x900', 'Ranger / Saber', 'NOT RUN', 'script stopped: ' + String(e).slice(0, 400) + ' || ' + parts.join(' || '), pics)
}
await L.finish(w, errs)
