/* Scenario 5, the Scheduler Board half: the plan switched from the BOARD's own plans picker. The board has no Insights
   door (scenario 1), so the window is read on Edit Schedule after ✓ Done. */
import * as A from './ins-a-lib.mjs'
const { L, W, TUE, row, judge, pic } = A
const S = '5b'
const seat = p => p.evaluate(() => window.DAYS[1].waves[1].formations[1].aircraft[0].p)
async function pick(p, surf, re) {
  const m = p.locator(`${surf} [data-planmenu="${TUE}"]:visible`).first()
  await m.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await m.click(); await L.sleep(400)
  const b = re ? p.locator('[data-plansel]:visible').filter({ hasText: re }).first() : p.locator('[data-plandup]:visible').first()
  if (!(await b.count())) { await p.keyboard.press('Escape'); return 'not offered' }
  const label = (await b.innerText()).replace(/\s+/g, ' ').trim()
  await b.click(); await L.sleep(700)
  return label
}
await A.run(S, async p => {
  await A.toEdit(p); await W.boardOn(p, TUE)
  const mk = await pick(p, '#schedBoard', null)
  const put = await A.seatPut(p, '1.1.1.0.p', 'shaft')
  const cx = await A.cxLine(p, '1.0.0.1')
  const back = await pick(p, '#schedBoard', /Plan A/)
  await W.boardOff(p)
  const pub = await A.pubOrig(p, TUE)
  const iA = await A.insNow(p)
  await W.boardOn(p, TUE)
  const sw = await pick(p, '#schedBoard', /Plan B/)
  const hb = await A.head(p, TUE), sb = await seat(p)
  const shot = await pic(p, 's5b-board-switched-to-plan-b')
  await W.boardOff(p)
  const f = await A.face(p, TUE)
  const iB = await A.insPic(p, 's5b-after-board-switch-insights', 'both')
  judge(`${S}.a`, `on the board (Tuesday, draft): its plans picker → "${mk}"; Anvil on Rebel's seat (${put.took}); CX on Go 1's VL no. 2 (${cx}); picker → "${back}"; ✓ Done; signed and ${pub.r.label}; board again: picker → "${sw}"; ✓ Done; Insights on Edit Schedule`, [
    ['the board showed Plan B, pending', sb === 'shaft' && /pending/.test(hb.pending), `seat ${sb} · chip "${hb.pending}" · ${hb.nys} · ${hb.alpub}`],
    ['Edit Schedule shows Tuesday pending, AL1 offered', A.isPending(f) && /AL1/.test(f.alpub), A.faceLine(f)],
    ['the window is word for word Plan A\'s (the Original)', A.same(iA, iB), A.diffText(iA, iB)],
    ['32 sorties, Tuesday 8, Anvil idle', A.tile(iB, /Sorties/i) === '32' && /^Tuesday 8 sorties/.test(A.byDay(iB, 'Tue')) && A.idleHas(iB, 'Anvil'), `${A.tilesLine(iB)} · ${A.byDay(iB, 'Tue')}`],
  ], [shot, ...iB.shots])
  const al = await A.pubAL(p, TUE)
  const iC = await A.insNow(p)
  judge(`${S}.b`, `Tuesday signed and "${al.r.label || al.r.why}"; Insights`, [
    ['the window is now Plan B: 31 sorties, Tuesday 7, Anvil flying, Rebel idle', A.tile(iC, /Sorties/i) === '31' && /^Tuesday 7 sorties/.test(A.byDay(iC, 'Tue')) && !A.idleHas(iC, 'Anvil') && A.idleHas(iC, 'Rebel'), `${A.tilesLine(iC)} · ${A.byDay(iC, 'Tue')}`],
  ])
})
