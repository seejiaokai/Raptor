/* d-20-fixwalk v2 — the HOST's walk of the fix the two code reads brought (commit f4d7e8195), on the build made AFTER it.
   usage (from raptor-port/): node scripts/handpass/d2028/d-20-fixwalk.mjs pc|phone his|moved
   his   — the walker's D1 fixture (Saturday: Briefing 09:00 no end + ALL AVAIL; Ranger's Ground row 10:15–10:45;
           published, signed again; Logic "Any other row" 1h → 2h). Then an unrelated remark on the SDO desk:
           the pending list must NAME the man the next amendment moves out from behind the puck. Then a second man
           busy at 09:15 (a real departure beside it), the put-back, and the amendment.
   moved — Ranger's row published at 09:30–09:45 (he is out at publication), Logic 2h, the row moved to 10:15–10:45:
           under 2h he is still out, so the list shows the row's own change and NO line about who the puck stands for. */
const KIND = process.argv[2] || 'pc', MODE = process.argv[3] || 'his'
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-13-rules-check-small-batch/d2028/fix-' + MODE + '-' + KIND
const { mkdirSync } = await import('node:fs'); mkdirSync(process.env.HP_SHOTS, { recursive: true })
console.log('d-20-fixwalk v2', KIND, MODE, process.env.HP_SHOTS)
const D = await import('./d-lib.mjs')
const C = await import('../rcsb/w1/rcsb-w1-common.mjs')
const { X, L, sleep, j, row, SAT } = D
const w = await D.world(KIND)
const { page } = w
console.log('bundle', await D.bundle(page))
const RMK = '[data-bfld="dr:5.0.0.rmks"], [data-bfld="dr:5.0.0.rmk"]'
const ranger = w.ID('Ranger'), piston = w.ID('Piston')

async function state(tag) {
  const face = await D.face(w, tag, SAT)
  const pl = await C.pendingList(w, SAT, tag + '-pendinglist')
  const board = await D.readOne(w, 'board', tag, SAT, /Briefing/)
  await L.closeBoard(page)
  const out = { tag, pending: face.pending, nys: face.nysText, signs: face.signs, alpub: face.alpub, list: pl.text, label: pl.label, win: { title: board.title, chip: board.chip, n: board.count, ranger: board.ranger, piston: (board.people || []).includes('Piston') } }
  console.log('STATE', j(out))
  return out
}

if (MODE === 'his') {
  const a = await D.addCommon(w, SAT, 'Briefing', '09:00')
  await D.drop(w, `a:${SAT}.${a.ri}.+`, 'allavail')
  await D.addGround(w, SAT, 'Ground Programme', '10:15', '10:45', ranger)
  const p = await D.pub(w, SAT); await D.signFour(w, SAT); await L.closeBoard(page)
  console.log('published', j(p.pressed))
  const lg = await D.setLogic(w, 'openEnd', '2h', 'f0-logic-2h')
  const s0 = await state('f0-logic-alone')
  row(`F0-${KIND} the Logic change alone`, /nothing waiting to go out/.test(s0.list) && !s0.nys ? 'OK' : 'CHECK', j({ lg, s0 }))

  await L.board(page, SAT); await X.typeIn(w, RMK, 'F1 remark'); await sleep(700); await L.closeBoard(page)
  const s1 = await state('f1-remark')
  row(`F1-${KIND} an unrelated remark waits`, /who it stands for/.test(s1.list) && /Ranger/.test(s1.list) ? 'OK' : 'CHECK', j(s1), 'f1-remark-pendinglist.png')

  // a real departure beside it: Piston busy 09:15–09:45
  const g2 = await D.addGround(w, SAT, 'Medical', '09:15', '09:45', piston); await L.closeBoard(page)
  const s2 = await state('f2-second-man')
  row(`F2-${KIND} a second man really leaves`, /Ranger/.test(s2.list) && /Piston/.test(s2.list) ? 'OK' : 'CHECK', j({ g2: g2.got, s2 }), 'f2-second-man-pendinglist.png')

  // Undo the second row (one Undo per step it took), then clear the remark: the day must be clean, at its hour
  for (let k = 0; k < 8; k++) {
    const n = await page.evaluate(i => window.DAYS[i].ground.length, SAT)
    if (n <= 1) break
    const u = await X.undoBtn(w, 'undo'); await sleep(400); if (!u.ok) { console.log('undo not pressed', j(u)); break }
  }
  console.log('ground rows after undo', await page.evaluate(i => JSON.stringify(window.DAYS[i].ground.map(a => [a.prog, a.str, a.end, a.who])), SAT))
  await L.board(page, SAT); await X.typeIn(w, RMK, ''); await sleep(700); await L.closeBoard(page)
  const s3 = await state('f3-put-back')
  row(`F3-${KIND} put back`, /nothing waiting to go out/.test(s3.list) && !s3.nys && s3.win.ranger ? 'OK' : 'CHECK', j(s3))

  // the amendment: the remark again, publish AL1
  await L.board(page, SAT); await X.typeIn(w, RMK, 'F1 remark'); await sleep(700)
  const pa = await D.pub(w, SAT)
  const s4 = await state('f4-amended')
  row(`F4-${KIND} AL1 published`, /nothing waiting to go out/.test(s4.list) && !s4.win.ranger ? 'OK' : 'CHECK', j({ pa: pa.pressed, s4 }))
} else {
  const a = await D.addCommon(w, SAT, 'Briefing', '09:00')
  await D.drop(w, `a:${SAT}.${a.ri}.+`, 'allavail')
  const g = await D.addGround(w, SAT, 'Dental', '09:30', '09:45', ranger)
  const p = await D.pub(w, SAT); await D.signFour(w, SAT); await L.closeBoard(page)
  console.log('published', j(p.pressed), j(g.got))
  await D.setLogic(w, 'openEnd', '2h', 'm0-logic-2h')
  const s0 = await state('m0-logic-alone')
  row(`M0-${KIND} the Logic change alone`, /nothing waiting to go out/.test(s0.list) && !s0.nys ? 'OK' : 'CHECK', j(s0))
  await L.board(page, SAT)
  await X.typeIn(w, `[data-bfld="gr:${SAT}.${g.ri}.str"]`, '1015'); await X.typeIn(w, `[data-bfld="gr:${SAT}.${g.ri}.end"]`, '1045'); await sleep(700)
  console.log('ground now', await page.evaluate(i => JSON.stringify(window.DAYS[i].ground.map(a => [a.prog, a.str, a.end, a.who])), SAT))
  await L.closeBoard(page)
  const s1 = await state('m1-row-moved')
  row(`M1-${KIND} the row moved`, /waiting to go out as AL1/.test(s1.list) && !/who it stands for|What this day earns/.test(s1.list) ? 'OK' : 'CHECK', j(s1), 'm1-row-moved-pendinglist.png')
}
D.finish(w, 'fix-' + MODE + '-' + KIND)
await w.browser.close()
