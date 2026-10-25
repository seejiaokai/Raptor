// W2 part B — scenarios 20, 21, 22 (the Inputs window's "Goes to" row and the people an Other is filed for). Desktop 1536 x 864, admin, one fresh world.
//   20  an Other for ALL AVAIL, one day (Thu 16 Jul): no Goes to row; never under Unavailable; nothing on the war
//   21  an Other for Ranger AND ALL AVAIL (Several people), Goes to Unavailable pressed FIRST, then ALL AVAIL added (Fri 17 Jul)
//   22  an Other for Ranger + Drifter + Hunter, Goes to Unavailable (Mon 13 Jul): three OTH boxes, each man his own row under Unavailable
// Usage (from raptor-port/): node scripts/handpass/lw-m3b-w2-b.mjs
import * as H from './lw-m3b-w2-lib.mjs'
const { L, T, note } = H
H.clearPrefix('b-')
console.log('lw-m3b-w2-b', H.OUT)
const w = await H.deskCtx(); const P = w.page
await L.signInPlain(w, 'admin')
note('bundle', 'desk', await H.bundleName(P))
const ids = { Ranger: await H.idOf(P, 'Ranger'), Drifter: await H.idOf(P, 'Drifter'), Hunter: await H.idOf(P, 'Hunter') }
const num = s => (s == null ? null : Number(String(s).replace(/[^\d.\-]/g, '')))
const D20 = '2026-07-16', D21 = '2026-07-17', D22 = '2026-07-13'
const DI = { '2026-07-13': 0, '2026-07-16': 3, '2026-07-17': 4 }
const SEC = ['sec-unav', 'sec-grnd', 'sec-prog', 'sec-inp']
const sections = async di => {
  await H.goEdit(w)
  const out = {}
  for (const s of SEC) {
    let r = await H.rowsOf(P, di, s)
    if (s === 'sec-inp' && !(r.rows || []).length && await P.locator(`#eWeek [data-pitog="${di}"]`).count()) { await P.locator(`#eWeek [data-pitog="${di}"]`).first().click(); await P.waitForTimeout(500); r = await H.rowsOf(P, di, s) }
    out[s] = r.rows ? r.rows.map(x => x.text) : r
  }
  /* the Common Programme's rows are not .pl-row: its words as a person reads them */
  out['sec-prog'] = [await P.evaluate(di => (document.querySelector(`#eWeek section.day[data-day="${di}"] .sec-prog`)?.innerText || '').replace(/\s+/g, ' ').trim(), di)]
  return out
}
const ohm = iso => P.evaluate(iso => [...document.querySelectorAll(`td[data-testid$="-${iso}"]`)].flatMap(td => [...td.querySelectorAll('.c')].map(c => td.dataset.testid.replace('cell-', '').replace('-' + iso, '') + ':' + c.textContent.trim())).filter(x => /:(OTH|UNA)/.test(x)), iso)
const baseAvail = {}
await H.warOpen(w, ids.Ranger, D22)
for (const d of [D20, D21, D22]) baseAvail[d] = await H.availP(P, d)
note('base', 'desk', 'Available P ' + JSON.stringify(baseAvail) + ' OTH boxes on the days: ' + JSON.stringify(await Promise.all([D20, D21, D22].map(ohm))))

/* ================= 20 — an Other for ALL AVAIL ================= */
{
  const f = await H.fileInput(w, { type: 'Other', allAvail: true, from: D20, times: ['10:00', '11:00'], remarks: 'Night brief all', tag: '20',
    beforeSave: async o => { o.goes = await H.goesRead(P); o.person = await P.locator('#inpEditPerson').inputValue(); o.type = await P.locator('#inpEditType').inputValue(); await H.winTop(P); await H.pic(w, 'b-20-window', [H.WIN], { pad: 6 }) } })
  note('20-filed', 'desk', JSON.stringify({ person: f.recs[0]?.people, acc: f.rec?.acc, type: f.rec?.type, asked: f.asked, goesRow: f.goesRow }))
  const sec = await sections(DI[D20])
  note('20-sections', 'desk', JSON.stringify(sec))
  const inCom = (sec['sec-prog'] || []).filter(x => /ALL AVAIL|Night brief/i.test(x)), inUnav = (sec['sec-unav'] || []).filter(x => /ALL AVAIL|Night brief/i.test(x)), inGrnd = (sec['sec-grnd'] || []).filter(x => /ALL AVAIL|Night brief/i.test(x)), inInp = (sec['sec-inp'] || []).filter(x => /ALL AVAIL|Night brief/i.test(x))
  note('20-where', 'desk', `Common ${JSON.stringify(inCom)} · Unavailable ${JSON.stringify(inUnav)} · Ground ${JSON.stringify(inGrnd)} · Personal Inputs ${JSON.stringify(inInp)}`)
  const where = inCom.length ? 'sec-prog' : inGrnd.length ? 'sec-grnd' : inInp.length ? 'sec-inp' : 'sec-unav'
  await H.centreOn(P, [`#eWeek section.day[data-day="${DI[D20]}"] .${where}`])
  await H.pic(w, 'b-20-edit', [`#eWeek section.day[data-day="${DI[D20]}"] .${where}`], { pad: 6 })
  await H.pic(w, 'b-20-edit-unav', [`#eWeek section.day[data-day="${DI[D20]}"] .sec-unav`], { pad: 6 })
  await H.warOpen(w, ids.Ranger, D20)
  const av = await H.availP(P, D20), oth = await ohm(D20), cell = await H.cellBoxes(w, ids.Ranger, D20)
  note('20-war', 'desk', `Available P ${baseAvail[D20]} → ${av}; OTH/UNA boxes on the day ${JSON.stringify(oth)}; Ranger's cell ${JSON.stringify(cell)}`)
  await H.warStrips(w, 'b-20-war', ids.Ranger, [D20])
  L.rec('20', 'desk', f.goesRow === 0 && f.rec?.acc !== 'u' && !inUnav.length && av === baseAvail[D20] && !oth.length && f.recs[0]?.people?.some(p => (p.p || p) === 'allavail') ? 'PASS?' : 'FAIL?', `Goes to row in the window: ${f.goesRow === 0 ? 'absent' : 'PRESENT'} (person "${f.rec?.people?.map(p => p.p || p)}"); saved acc ${f.rec?.acc}; lands on ${where}; under Unavailable: ${inUnav.length}; war Available P ${baseAvail[D20]} → ${av}; OTH boxes on the day ${oth.length}`, ['b-20-window', 'b-20-edit', 'b-20-edit-unav', 'b-20-war'])
}

/* ================= 21 — Ranger AND ALL AVAIL ================= */
{
  const f = await H.fileInput(w, { who: 'Ranger', type: 'Other', several: ['Ranger'], allAvailToo: true, goes: 'u', goesFirst: true, from: D21, times: ['10:00', '11:00'], remarks: 'Ranger and all', tag: '21',
    beforeSave: async o => { o.goesNow = await H.goesRead(P); await H.winTop(P); await H.pic(w, 'b-21-window', [H.WIN], { pad: 6 }) } })
  note('21-filed', 'desk', JSON.stringify({ goesBeforeAll: f.goesBeforeAll, goesRowAfterAll: f.goesRow, picked: f.picked, people: f.rec?.people, acc: f.rec?.acc, asked: f.asked, readout: f.readout }))
  const winStill = await H.winsOpen(P)
  note('21-window-after-save', 'desk', 'windows still open: ' + winStill.join(','))
  const sec = await sections(DI[D21])
  note('21-sections', 'desk', JSON.stringify(sec))
  const find = s => (sec[s] || []).filter(x => /Ranger and all|ALL AVAIL/i.test(x))
  const where = ['sec-prog', 'sec-grnd', 'sec-inp', 'sec-unav'].find(s => find(s).length) || 'none'
  note('21-where', 'desk', `Common ${JSON.stringify(find('sec-prog'))} · Ground ${JSON.stringify(find('sec-grnd'))} · Unavailable ${JSON.stringify(find('sec-unav'))} · Personal Inputs ${JSON.stringify(find('sec-inp'))}`)
  if (where !== 'none') { await H.centreOn(P, [`#eWeek section.day[data-day="${DI[D21]}"] .${where}`]); await H.pic(w, 'b-21-edit', [`#eWeek section.day[data-day="${DI[D21]}"] .${where}`], { pad: 6 }) }
  await H.pic(w, 'b-21-edit-unav', [`#eWeek section.day[data-day="${DI[D21]}"] .sec-unav`], { pad: 6 })
  await H.warOpen(w, ids.Ranger, D21)
  const av = await H.availP(P, D21), oth = await ohm(D21), cell = await H.cellBoxes(w, ids.Ranger, D21)
  note('21-war', 'desk', `Available P ${baseAvail[D21]} → ${av}; OTH boxes ${JSON.stringify(oth)}; Ranger's cell ${JSON.stringify(cell)}`)
  await H.warStrips(w, 'b-21-war', ids.Ranger, [D21])
  L.rec('21', 'desk', f.rec && f.goesRow === 0 && f.rec.acc !== 'u' && !find('sec-unav').length && av === baseAvail[D21] ? 'PASS?' : 'FAIL?', `Goes to before ALL AVAIL: ${JSON.stringify(f.goesBeforeAll)}; after ALL AVAIL the row is ${f.goesRow === 0 ? 'gone' : 'STILL THERE'}; it ${f.rec ? 'saved' : 'did NOT save'} (people ${JSON.stringify(f.rec?.people?.map(p => p.p || p))}, acc ${f.rec?.acc}); lands on ${where}; under Unavailable ${find('sec-unav').length}; war Available P ${baseAvail[D21]} → ${av}, OTH boxes ${oth.length}`, ['b-21-window', 'b-21-edit', 'b-21-edit-unav', 'b-21-war'])
}

/* ================= 22 — Ranger + Drifter + Hunter, Goes to Unavailable ================= */
{
  const f = await H.fileInput(w, { who: 'Ranger', type: 'Other', several: ['Ranger', 'Drifter', 'Hunter'], goes: 'u', from: D22, remarks: 'Three men away', tag: '22',
    beforeSave: async o => { if (!(await P.locator('#inpEditAllday').isChecked())) { await L.press(w, '#inpEditAllday'); await P.waitForTimeout(250) }; o.goesNow = await H.goesRead(P); await H.winTop(P); await H.pic(w, 'b-22-window', [H.WIN], { pad: 6 }) } })
  note('22-filed', 'desk', JSON.stringify({ people: f.rec?.people?.map(p => p.p), acc: f.rec?.acc, picked: f.picked, asked: f.asked, goes: f.goesNow }))
  const sec = await sections(DI[D22])
  const mine = (sec['sec-unav'] || []).filter(x => /Three men away/.test(x))
  note('22-sections', 'desk', 'Unavailable rows with the remark: ' + JSON.stringify(mine))
  await H.centreOn(P, [`#eWeek section.day[data-day="0"] .sec-unav`])
  await H.pic(w, 'b-22-edit-unav', [`#eWeek section.day[data-day="0"] .sec-unav`], { pad: 6 })
  await H.warOpen(w, ids.Ranger, D22)
  const av = await H.availP(P, D22)
  const cells = {}
  for (const cs of ['Ranger', 'Drifter', 'Hunter']) cells[cs] = await H.cellBoxes(w, ids[cs], D22)
  note('22-war', 'desk', `Available P ${baseAvail[D22]} → ${av}; cells ${JSON.stringify(cells)}`)
  /* one picture per man's row, each beside the Available row and the date */
  for (const cs of ['Ranger', 'Drifter', 'Hunter']) await H.warStrips(w, `b-22-war-${cs.toLowerCase()}`, ids[cs], [D22])
  const ok3 = ['Ranger', 'Drifter', 'Hunter'].every(cs => (cells[cs] || []).some(b => /^OTH\|.*outlined/.test(b)))
  L.rec('22', 'desk', f.rec?.people?.length === 3 && f.rec.acc === 'u' && mine.length === 3 && ok3 && num(av) === num(baseAvail[D22]) - 3 ? 'PASS?' : 'FAIL?', `one input with ${f.rec?.people?.length} people, acc ${f.rec?.acc}; Unavailable rows with its remark: ${mine.length} (${mine.map(x => x.split(' ').slice(0, 3).join(' ')).join(' / ')}); war OTH boxes outlined for all three: ${ok3}; Available P ${baseAvail[D22]} → ${av}`, ['b-22-window', 'b-22-edit-unav', 'b-22-war-ranger', 'b-22-war-drifter', 'b-22-war-hunter'])
}

note('errors', 'desk', JSON.stringify(w.errs))
H.saveLog('b-run.json')
await w.ctx.close()
await H.closeBrowser()
console.log('RESULTS'); for (const r of L.results) console.log(r.verdict, r.id, '|', r.said)
