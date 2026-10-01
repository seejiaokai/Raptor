/* Scenario 5 — switching a saved plan into a published day stays invisible until issued. */
import * as S from './ins-s-lib2.mjs'
const { B, L, W } = S
const { judge, row, pic, savePart, TUE } = B
B.prefix('s5-')
const { browser, p, errors } = await B.world()
async function menu(di = TUE, surf = '#eWeek') {
  await B.toEdit(p); await W.showDay(p, di)
  const m = p.locator(`${surf} [data-planmenu="${di}"]:visible`).first()
  await m.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await m.click(); await S.sleep(450)
  return p.evaluate(() => [...document.querySelectorAll('[data-plansel], [data-plangolive], [data-plandup], [data-planpv]')].filter(e => e.offsetParent !== null).map(e => ({ kind: [...e.attributes].find(a => /^data-plan/.test(a.name)).name, id: e.getAttribute([...e.attributes].find(a => /^data-plan/.test(a.name)).name), text: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 60) })))
}
async function pick(sel) { const b = p.locator(sel).first(); await b.click(); await S.sleep(800) }
const label = async () => p.evaluate(i => { const e = document.querySelector(`#eWeek [data-planmenu="${i}"]`); return e ? e.innerText.replace(/\s+/g, ' ').trim() : '?' }, TUE)
const seat = async () => S.seatHolder(p, '1.1.1.0.p')
const cxed = async () => p.evaluate(() => { const a = window.DAYS[1].waves[0].formations[0].aircraft[1]; return !!(a.cx || window.DAYS[1].waves[0].formations[0].cx) })
try {
  await B.toEdit(p)
  const m0 = await menu(); await p.keyboard.press('Escape'); await S.sleep(200)
  row('5.a', 'Tuesday (draft): the plans selector before anything is saved', JSON.stringify(m0) + ' · label ' + await label(), 'RECORDED', [])

  /* Plan A = what the day is now; "+ Alt Plan" copies it and makes the copy live */
  await menu(); await pick('[data-plandup]')
  const m1 = await menu(); await p.keyboard.press('Escape'); await S.sleep(200)
  const liveLabelB = await label()
  /* make Plan B materially different: Rebel off, a line cancelled, a take-off moved */
  await S.takeOff(p, TUE, '1.1.1.0.p')
  await S.cx(p, TUE, '1.0.0.1', 'plan B walk')
  await S.setTime(p, TUE, 'ff:1.0.1.to', '10:30')
  await B.toEdit(p)
  const bState = { romeo: await seat(), cx: await cxed() }
  row('5.b', `"+ Alt Plan" pressed → a second plan is live (label "${liveLabelB}"); on it: Rebel taken off 2nd wave, a line cancelled (CX), the 2nd formation's take-off 09:40 → 10:30`, `plans listed: ${JSON.stringify(m1)} · Plan B state: seat holder "${bState.romeo}", line cx ${bState.cx}`, 'RECORDED', [await pic(p, 's5-b-plan-b-live')])
  const planRows = m1.filter(x => x.kind === 'data-plansel' || x.kind === 'data-plangolive')
  const aRow = planRows.find(x => !/●/.test(x.text) && x.kind === 'data-plansel')
  if (!aRow) throw new Error('no stowed plan A in the menu: ' + JSON.stringify(m1))
  /* back to Plan A: tap it */
  await menu(); await pick(`[data-plansel="${aRow.id}"]`)
  const aState = { romeo: await seat(), cx: await cxed(), label: await label() }
  row('5.c', `the plans selector → "${aRow.text}" (the first plan) made live again`, `Plan A state: seat holder "${aState.romeo}", line cx ${aState.cx}, selector label "${aState.label}"`, 'RECORDED', [await pic(p, 's5-c-plan-a-live')])

  await S.publish(p, TUE, 'orig')
  const hA = await S.dayState(p, TUE)
  const rA = await S.look(p, 's5-d-plan-a-published', { foot: true })
  row('5.d', 'Plan A signed and published (Original); Insights', `${S.dayLine(hA)} · ${S.brief(rA).slice(0, 260)}`, 'RECORDED', [rA.shot, rA.shot2])

  /* switch the working copy to Plan B */
  const m2 = await menu()
  const bRow = m2.find(x => x.kind === 'data-plansel')
  await pick(`[data-plansel="${bRow.id}"]`)
  const hB = await S.dayState(p, TUE)
  const bNow = { romeo: await seat(), cx: await cxed() }
  const rS = await S.look(p, 's5-e-after-switch', { foot: true })
  judge('5.e', `Plans → "${bRow.text}" (Switch the working copy to Plan B on the published day)`, [
    ['the edit surface now holds Plan B (Rebel off, line cancelled)', bNow.romeo === '' && bNow.cx, JSON.stringify(bNow)],
    ['Tuesday shows pending changes and cleared sign-offs', /pending/.test(hB.pending) && /·\|·\|·\|·/.test(hB.signs), `chip "${hB.pending}" signs ${hB.signs}`],
    ['Insights unchanged on every section (still Plan A)', S.same(rS, rA), S.same(rS, rA) ? '' : S.delta(rA, rS).slice(0, 500)],
  ], [rS.shot, rS.shot2])

  /* and on other pages */
  await L.go(p, 'viewsched')
  const rV = await S.look(p, 's5-f-view-only')
  row('5.f', 'same moment, on View-only Sched', S.same(rV, rA) ? 'Insights identical to Plan A' : 'DIFFERS: ' + S.delta(rA, rV).slice(0, 400), S.same(rV, rA) ? 'PASS' : 'FAIL', [rV.shot])

  await B.toEdit(p)
  await S.publish(p, TUE, 'al')
  const hF = await S.dayState(p, TUE)
  const rF = await S.look(p, 's5-g-after-AL1', { foot: true })
  judge('5.g', 'sign the four and Publish AL1 (Plan B goes out); Insights', [
    ['Tuesday is AL1 and nothing pending', /AL1/.test(hF.tag) && !/pending/.test(hF.pending), `${hF.tag} / ${hF.pending}`],
    ['Aircrew flying 38 → 37', S.tile(rA, 2) === 38 && S.tile(rF, 2) === 37, `${S.tile(rA, 2)} → ${S.tile(rF, 2)}`],
    ['Sorties 32 → 31 (the cancelled line leaves)', S.tile(rA, 0) === 32 && S.tile(rF, 0) === 31, `${S.tile(rA, 0)} → ${S.tile(rF, 0)}`],
    ['By day Tuesday agrees with the tiles (7 sorties)', /7 sorties/.test(S.byDay(rF, 'Tuesday')), S.byDay(rF, 'Tuesday')],
  ], [rF.shot, rF.shot2])
  row('5.h', 'figures that moved at AL1', S.delta(rS, rF).slice(0, 900), 'RECORDED', [])

  /* the same switch from the Scheduler Board's own plans selector (back to Plan A, now a change waiting on AL1) */
  await S.board(p, TUE)
  const bm = p.locator('#schedBoard [data-planmenu]:visible').first()
  await bm.evaluate(e => e.scrollIntoView({ block: 'center' })); await bm.click(); await S.sleep(450)
  const bmRows = await p.evaluate(() => [...document.querySelectorAll('[data-plansel]')].filter(e => e.offsetParent !== null).map(e => ({ id: e.dataset.plansel, text: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 40) })))
  if (bmRows.length) await pick(`[data-plansel="${bmRows[0].id}"]`)
  const onBoard = await p.evaluate(() => { const t = document.querySelector('#schedBoard [data-planmenu]'); return t ? t.innerText.replace(/\s+/g, ' ').trim() : '?' })
  const hBd = await W.head(p, TUE)
  await B.toEdit(p)
  const rBd = await S.look(p, 's5-i-after-board-switch')
  judge('5.i', `Scheduler Board: its plans selector → "${bmRows[0] && bmRows[0].text}" (label now "${onBoard}"), ✓ Done; Insights on Edit Schedule`, [
    ['the board showed the switch as pending', /pending|change/.test(hBd.pending), hBd.pending],
    ['Insights unchanged from AL1 (identical)', S.same(rBd, rF), S.same(rBd, rF) ? '' : S.delta(rF, rBd).slice(0, 400)],
  ], [rBd.shot])
} catch (e) { row('5.X', 'the script stopped', String(e && e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 's5-X-error')]) }
row('5.err', "the browser's error list", errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart('s5', { errors })
await browser.close()
