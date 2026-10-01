/* Scenario 5 — switching a saved plan into a published day stays invisible to Insights until issued. */
import * as A from './ins-a-lib.mjs'
const { L, W, TUE, row, judge, pic } = A
const S = '5'
async function menu(p) {
  await A.toEdit(p); await W.showDay(p, TUE)
  const m = p.locator(`#eWeek [data-planmenu="${TUE}"]:visible`).first()
  await m.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await m.click(); await L.sleep(400)
  return p.evaluate(() => [...document.querySelectorAll('[data-plansel],[data-plangolive],[data-planpv],[data-plandup]')].filter(e => e.offsetParent !== null).map(e => e.innerText.replace(/\s+/g, ' ').trim()))
}
async function planTo(p, re) {
  const items = await menu(p)
  const b = p.locator('[data-plansel]:visible').filter({ hasText: re }).first()
  if (!(await b.count())) { await p.keyboard.press('Escape'); return { err: 'no such plan to switch to', items } }
  const label = (await b.innerText()).replace(/\s+/g, ' ').trim()
  await b.click(); await L.sleep(700)
  return { label, items }
}
const seat = p => p.evaluate(() => window.DAYS[1].waves[1].formations[1].aircraft[0].p)
await A.run(S, async p => {
  /* two materially different Tuesday plans, made while the day is a draft */
  const m0 = await menu(p)
  await p.locator('[data-plandup]:visible').first().click(); await L.sleep(700)
  await W.boardOn(p, TUE)
  const put = await A.seatPut(p, '1.1.1.0.p', 'shaft')
  const cx = await A.cxLine(p, '1.0.0.1')
  await A.boxText(p, 'ff:1.1.0.ld', '17:35')
  await W.boardOff(p)
  const m1 = await menu(p); await p.keyboard.press('Escape'); await L.sleep(200)
  const shot0 = await pic(p, 's5-0-plan-b-built')
  const sw = await planTo(p, /Plan A/)
  const seatA = await seat(p)
  const pub = await A.pubOrig(p, TUE)
  const fA = await A.face(p, TUE)
  const iA = await A.insPic(p, 's5-a-planA-published', 'both')
  judge(`${S}.a`, `Tuesday (draft): plans picker (${m0.join(' / ')}) → "+ Alt Plan"; on the new live plan (Plan B) the board: Anvil on Rebel's seat (${put.took}), CX on Go 1's VL no. 2 (${cx}), Go 2 VL LD 16:05→17:35; picker now (${m1.join(' / ')}); switched to "${sw.label || sw.err}"; signed and ${pub.r.label}`, [
    ['Plan A is live and is what went out (Rebel on the seat)', seatA === 'romeo', seatA],
    ['Tuesday is Original, nothing pending', /ORIG/.test(fA.tag) && !A.isPending(fA), A.faceLine(fA)],
    ['the window shows Plan A: 32 sorties, Tuesday 8, Anvil idle', A.tile(iA, /Sorties/i) === '32' && /8 sorties/.test(A.byDay(iA, 'Tue')) && A.idleHas(iA, 'Anvil'), `${A.tilesLine(iA)} · ${A.byDay(iA, 'Tue')}`],
  ], [shot0, ...iA.shots])

  /* the switch */
  const sb = await planTo(p, /Plan B/)
  const fB = await A.face(p, TUE)
  const seatB = await seat(p)
  const shotB = await A.facePic(p, TUE, 's5-b-planB-switched-day')
  const iB = await A.insPic(p, 's5-b-planB-switched-insights', 'both')
  await A.toPage(p, 'viewsched'); const iBv = await A.insNow(p); const vB = await A.vface(p, TUE)
  await A.toPage(p, 'inputs'); const iBi = await A.insNow(p)
  judge(`${S}.b`, `Tuesday's plans picker → "${sb.label || sb.err}" (the working copy becomes Plan B); Insights on Edit Schedule, View-only Sched and Inputs`, [
    ['the edit surface shows Plan B (Anvil on the seat)', seatB === 'shaft', seatB],
    ['Tuesday is pending, marked "Not yet signed", AL1 offered', A.isPending(fB) && /AL1/.test(fB.alpub) && /Not yet signed/.test(fB.nys), A.faceLine(fB)],
    ['Insights on Edit Schedule is word for word Plan A', A.same(iA, iB), A.diffText(iA, iB)],
    ['…on View-only Sched too', A.same(iA, iBv), A.diffText(iA, iBv)],
    ['…and on Inputs', A.same(iA, iBi), A.diffText(iA, iBi)],
    ['the published face still reads Original', /ORIG/.test(vB.tag), vB],
    ['the window on top at its centre on each', iB.top && iBv.top && iBi.top],
  ], [shotB, ...iB.shots])

  const al = await A.pubAL(p, TUE)
  const fC = await A.face(p, TUE)
  const iC = await A.insPic(p, 's5-c-AL1-planB', 'both')
  judge(`${S}.c`, `Tuesday signed and "${al.r.label || al.r.why}"; Insights`, [
    ['Tuesday reads AL1, nothing pending', /AL1/.test(fC.tag) && !A.isPending(fC), A.faceLine(fC)],
    ['Sorties 32 → 31 and Tuesday 8 → 7 sorties', A.tile(iC, /Sorties/i) === '31' && /7 sorties/.test(A.byDay(iC, 'Tue')), `${A.tilesLine(iC)} · ${A.byDay(iC, 'Tue')}`],
    ['Anvil leaves the idle list, Rebel joins it', !A.idleHas(iC, 'Anvil') && A.idleHas(iC, 'Rebel')],
    ['Work hours moved for the men whose landing moved (Ace)', A.hoursOf(iA, 'Ace') !== A.hoursOf(iC, 'Ace'), `${A.hoursOf(iA, 'Ace')} → ${A.hoursOf(iC, 'Ace')}`],
    ['Hex\'s flying load 3 → 2 (his line was cancelled)', /3$/.test(A.flyLoad(iA, 'Hex')) && /2$/.test(A.flyLoad(iC, 'Hex')), `${A.flyLoad(iA, 'Hex')} → ${A.flyLoad(iC, 'Hex')}`],
  ], iC.shots)
  row(`${S}.c+`, 'everything that moved in the window at AL1', A.diffText(iA, iC), 'RECORDED')
})
