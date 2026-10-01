/* Scenario 16 — a second week replaces every row and the title; coming back gives the first week exactly. */
import * as A from './ins-a-lib.mjs'
const { L, W, TUE, row, judge, pic } = A
const S = '16'
const wk = p => p.evaluate(() => window.CURWEEK)
const overlap = (a, b) => { const out = []; for (const k of Object.keys(a.secs)) { const kb = Object.keys(b.secs).find(x => x.replace(/\d+/g, '') === k.replace(/\d+/g, '')); if (!kb) continue; const same = a.secs[k].length === b.secs[kb].length && a.secs[k].every((v, i) => v === b.secs[kb][i]); if (same) out.push(k) } return out }
await A.run(S, async p => {
  await A.toEdit(p)
  await A.pubOrig(p, TUE)
  await W.boardOn(p, TUE)
  await A.seatPut(p, '1.1.1.0.p', 'shaft'); await A.cxLine(p, '1.0.0.1')
  await W.boardOff(p)
  const al = await A.pubAL(p, TUE)
  /* and one more waiting change, so week 1 has an issued world that differs from its working copy */
  await W.boardOn(p, TUE); await A.cxLine(p, '1.1.0.0'); await W.boardOff(p)
  const f1 = await A.face(p, TUE)
  const i1 = await A.insPic(p, 's16-a-week1', 'both')
  judge(`${S}.a`, `week of 13 Jul: Tuesday published, changed on the board and "${al.r.label}" issued, then one more CX left waiting; Insights`, [
    ['the title reads Jul 13 – Jul 19', /Jul 13 – Jul 19/.test(i1.title), i1.title],
    ['Tuesday is AL1 with a change waiting', /AL1/.test(f1.tag) && A.isPending(f1), A.faceLine(f1)],
    ['the window counts AL1 (31 sorties, Tuesday 7)', A.tile(i1, /Sorties/i) === '31' && /^Tuesday 7 sorties/.test(A.byDay(i1, 'Tue')), `${A.tilesLine(i1)} · ${A.byDay(i1, 'Tue')}`],
  ], i1.shots)

  /* the week chip in the bar */
  await p.locator('button.wk[data-wk="20/07/2026"]:visible').first().click(); await L.sleep(1000)
  const w2 = await wk(p)
  const days2 = await p.evaluate(() => window.DAYS.map(d => d.dt))
  const f2 = await A.face(p, TUE)
  const i2 = await A.insPic(p, 's16-b-week2-by-chip', 'both')
  const sumS = A.sec(i2, /By day/i).reduce((n, x) => n + +(/(\d+) sorties/.exec(x) || [0, 0])[1], 0)
  judge(`${S}.b`, 'the week bar\'s "Jul 20" chip; Insights reopened', [
    ['the loaded week is 20 Jul', w2 === '20/07/2026', w2],
    ['the title reads Jul 20 – Jul 26', /Jul 20 – Jul 26/.test(i2.title), i2.title],
    ['that week\'s Tuesday is a draft', /DRAFT/.test(f2.tag), A.faceLine(f2)],
    ['seven By-day rows, and the Sorties tile is their sum', A.sec(i2, /By day/i).length === 7 && +A.tile(i2, /Sorties/i) === sumS, `${A.tile(i2, /Sorties/i)} / ${sumS} · ${A.sec(i2, /By day/i).join(' | ')}`],
    ['the tiles differ from week 1', A.tilesLine(i1) !== A.tilesLine(i2), `${A.tilesLine(i1)} → ${A.tilesLine(i2)}`],
    ['no section survives whole from week 1', overlap(i1, i2).length === 0, overlap(i1, i2)],
  ], i2.shots)

  /* back by the chip */
  await p.locator('button.wk[data-wk="13/07/2026"]:visible').first().click(); await L.sleep(1000)
  const i3 = await A.insPic(p, 's16-c-back-week1', 'top')
  judge(`${S}.c`, 'the week bar\'s "Jul 13" chip; Insights reopened', [
    ['the window is word for word what it was (title too)', A.same(i1, i3), A.diffText(i1, i3)],
    ['Tuesday is AL1 with its change still waiting', /AL1/.test((await A.face(p, TUE)).tag) && A.isPending(await A.face(p, TUE))],
  ], i3.shots)

  /* "Pick a date": the calendar button → a day of the next week */
  await p.locator('button.wk-cal:visible').first().click(); await L.sleep(500)
  const shotCal = await pic(p, 's16-d-pick-a-date')
  const cell = p.locator('.weekcal [data-cal="2026-07-22"], .weekcal-box [data-cal="2026-07-22"]').first()
  const hasCell = await cell.count()
  if (hasCell) { await cell.click(); await L.sleep(1000) }
  else { const c2 = p.locator('.weekcal-box button, .weekcal-box td, .weekcal-box [role=gridcell]').filter({ hasText: /^22$/ }).first(); await c2.click(); await L.sleep(1000) }
  const w4 = await wk(p)
  const i4 = await A.insPic(p, 's16-d-week2-by-date-picker', 'foot')
  judge(`${S}.d`, 'the 📅 "Jump to a date" calendar → 22 Jul; Insights reopened', [
    ['the loaded week is 20 Jul', w4 === '20/07/2026', w4],
    ['the window is word for word what the chip gave for that week', A.same(i2, i4), A.diffText(i2, i4)],
  ], [shotCal, ...i4.shots])

  /* the board's own week step: back to week 1 from the board, then forward again */
  await W.boardOn(p, TUE)
  const back = p.locator('#schedBoard [data-sbweek="-1"]:visible').first()
  const hasStep = await back.count()
  if (hasStep) { await back.click(); await L.sleep(1100) }
  const w5 = await wk(p)
  const shotB = await pic(p, 's16-e-board-week-step')
  await W.boardOff(p)
  const i5 = await A.insPic(p, 's16-e-after-board-step-back', 'top')
  judge(`${S}.e`, `on the Scheduler Board (week of 20 Jul): its own ‹ week step (${hasStep ? 'pressed' : 'NOT FOUND'}); ✓ Done; Insights on Edit Schedule`, [
    ['the loaded week is 13 Jul', w5 === '13/07/2026', w5],
    ['the window is word for word week 1\'s — the same as the picker gave', A.same(i1, i5), A.diffText(i1, i5)],
  ], [shotB, ...i5.shots])
  await W.boardOn(p, TUE)
  const fwd = p.locator('#schedBoard [data-sbweek="1"]:visible').first()
  if (await fwd.count()) { await fwd.click(); await L.sleep(1100) }
  const w6 = await wk(p)
  await W.boardOff(p)
  const i6 = await A.insNow(p)
  judge(`${S}.f`, 'on the board: its › week step; ✓ Done; Insights', [
    ['the loaded week is 20 Jul', w6 === '20/07/2026', w6],
    ['the window is word for word week 2\'s', A.same(i2, i6), A.diffText(i2, i6)],
  ])
  row(`${S}.sum`, 'the two weeks', `week 1: "${i1.title}" ${A.tilesLine(i1)} · ${A.sec(i1, /By day/i).join(' | ')} ;; week 2: "${i2.title}" ${A.tilesLine(i2)} · ${A.sec(i2, /By day/i).join(' | ')}`, 'RECORDED')
})
