/* Scenario 4 — looking at Original while AL1 is current must not redirect Insights to the preview. */
import * as S from './ins-s-lib2.mjs'
const { B, L, W } = S
const { judge, row, pic, savePart, TUE } = B
B.prefix('s4-')
const { browser, p, errors } = await B.world()
try {
  await B.toEdit(p)
  await S.publish(p, TUE, 'orig')
  const r0 = await S.look(p, 's4-a-original')
  row('4.a', 'Tuesday published (Original); Insights', `${S.brief(r0).slice(0, 300)}`, 'RECORDED', [r0.shot])

  /* the programme changes: Rebel (the only Tuesday-only pilot of the second wave's second line) taken off on the board → AL1 */
  await S.takeOff(p, TUE, '1.1.1.0.p'); await B.toEdit(p)
  await S.publish(p, TUE, 'al')
  const h1 = await W.head(p, TUE)
  const r1 = await S.look(p, 's4-b-al1')
  judge('4.b', 'Rebel taken off on the board; sign; Publish AL1; Insights', [
    ['Tuesday is AL1', /AL1/.test(h1.tag), h1.tag],
    ['Aircrew flying 38 → 37 (a visible difference between Original and AL1)', S.tile(r0, 2) === 38 && S.tile(r1, 2) === 37, `${S.tile(r0, 2)} → ${S.tile(r1, 2)}`],
  ], [r1.shot])

  /* open Original read-only from the plans selector */
  const v = await B.versions(p, TUE)
  await p.keyboard.press('Escape'); await S.sleep(300)
  const lk = await B.look(p, TUE, /ORIG/i)
  const face = await B.lookFace(p, TUE)
  const pFace = await pic(p, 's4-c-original-preview')
  const rP = await S.look(p, 's4-c-insights-over-original', { foot: true })
  judge('4.c', `the plans selector opened (versions: ${(v.vs || []).map(x => x.label).join(' | ')}); Original opened read-only (${lk.err || lk.label}); then Insights`, [
    ['the day visibly says it is showing Original (preview bar)', !!face && /orig/i.test(face.bar + ' ' + face.sel), JSON.stringify(face).slice(0, 220)],
    ['Insights still counts AL1 (identical to 4.b in every section)', S.same(rP, r1), S.same(rP, r1) ? '' : S.delta(r1, rP).slice(0, 400)],
    ['Aircrew flying still 37', S.tile(rP, 2) === 37, S.tile(rP, 2)],
  ], [pFace, rP.shot, rP.shot2])

  const back = await B.backLive(p, TUE)
  const face2 = await B.lookFace(p, TUE)
  const rB = await S.look(p, 's4-d-back-live')
  judge('4.d', `Back to live copy (${back})`, [
    ['the preview bar is gone', !face2 || !/showing|read-only/i.test(face2.bar), JSON.stringify(face2).slice(0, 200)],
    ['Insights identical to 4.b', S.same(rB, r1), S.same(rB, r1) ? '' : S.delta(r1, rB).slice(0, 300)],
  ], [rB.shot])

  /* the same on View-only Sched: a look at Original there, then Insights */
  await L.go(p, 'viewsched'); await W.showDay(p, TUE, '#vWeek')
  const sel = await p.evaluate(i => { const s = document.querySelector(`#vWeek .day[data-day="${i}"] select.dver`); return s ? [...s.options].map(o => o.value + ':' + o.text) : null }, TUE)
  let vv = 'no version selector on View-only Sched'
  if (sel) {
    const ov = sel.find(x => /orig/i.test(x))
    if (ov) { await p.locator(`#vWeek .day[data-day="${TUE}"] select.dver`).selectOption(ov.split(':')[0]); await S.sleep(600); vv = 'selected ' + ov }
  }
  const rV = await S.look(p, 's4-e-view-only-original')
  judge('4.e', `View-only Sched: Tuesday's own version selector offers [${sel ? sel.join(' | ') : 'none'}] (Original is not on its list — only the current issued version and the working draft); Insights opened beside it`, [
    ['Insights still AL1 (identical to 4.b)', S.same(rV, r1), S.same(rV, r1) ? '' : S.delta(r1, rV).slice(0, 300)],
  ], [rV.shot])
} catch (e) { row('4.X', 'the script stopped', String(e && e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 's4-X-error')]) }
row('4.err', "the browser's error list", errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart('s4', { errors })
await browser.close()
