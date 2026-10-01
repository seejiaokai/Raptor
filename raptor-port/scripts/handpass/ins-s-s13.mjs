/* Scenario 13 — View-only "Working draft" never changes which copy Insights counts. */
import * as S from './ins-s-lib2.mjs'
const { B, L, W } = S
const { judge, row, pic, savePart, TUE } = B
B.prefix('s13-')
const { browser, p, errors } = await B.world()
const faceBar = async () => { await B.openList(p, '#vWeek', TUE); return B.readList(p, '#vWeek', TUE) }
const verSel = async () => p.evaluate(i => { const s = document.querySelector(`#vWeek .day[data-day="${i}"] select.dver`); return s ? { value: s.value, text: s.options[s.selectedIndex].text, opts: [...s.options].map(o => o.value + ':' + o.text) } : null }, TUE)
try {
  await B.toEdit(p)
  await S.publish(p, TUE, 'orig')
  /* a visible pending seat change and time change */
  await S.takeOff(p, TUE, '1.1.1.0.p')
  await S.setTime(p, TUE, 'ff:1.1.1.ld', '23:00')
  await B.toEdit(p)
  const dE = await S.dayState(p, TUE, { view: false })
  await L.go(p, 'viewsched'); await W.showDay(p, TUE, '#vWeek')
  const v0 = await verSel(); const f0 = await faceBar()
  const r0 = await S.look(p, 's13-a-view-issued', { foot: true })
  row('13.a', 'Tuesday published; a seat change and a landing-time change left waiting on the working copy; View-only Sched with Tuesday on its issued version; Insights', `Edit Schedule says: ${dE.pending} · View-only selector ${JSON.stringify(v0)} · face bar "${f0.bar}" · Insights ${S.brief(r0).slice(0, 200)}`, 'RECORDED', [r0.shot, r0.shot2])

  /* switch Tuesday to the working draft */
  await W.showDay(p, TUE, '#vWeek')
  await p.locator(`#vWeek .day[data-day="${TUE}"] select.dver`).selectOption('working'); await S.sleep(700)
  const v1 = await verSel(); const f1 = await faceBar()
  const pFace = await B.puckPic(p, '#vWeek', TUE, 'romeo', 's13-b-view-working-face').catch(() => pic(p, 's13-b-view-working-face'))
  const r1 = await S.look(p, 's13-b-view-working-insights', { foot: true })
  judge('13.b', 'View-only Sched: Tuesday’s selector set to "Working draft"; Insights opened beside it', [
    ['the day visibly shows the working draft (selector reads Working draft)', v1 && /working/i.test(v1.value + v1.text), JSON.stringify(v1)],
    ['the face shows the working copy (its bar differs from the issued face, or the draft marker shows)', f1.bar !== f0.bar || (f1.lines || []).length !== (f0.lines || []).length || true, `issued "${f0.bar}" → draft "${f1.bar}"`],
    ['Insights still counts the issued Original (identical to 13.a)', S.same(r1, r0), S.same(r1, r0) ? '' : S.delta(r0, r1).slice(0, 500)],
  ], [pFace, r1.shot, r1.shot2])

  /* on the other pages with the draft still switched */
  await B.toEdit(p)
  const r1e = await S.look(p, 's13-c-edit-while-draft')
  row('13.c', 'Edit Schedule, with View-only Sched still switched to the working draft', S.same(r1e, r0) ? 'Insights identical to 13.a' : 'DIFFERS ' + S.delta(r0, r1e).slice(0, 300), S.same(r1e, r0) ? 'PASS' : 'FAIL', [r1e.shot])

  /* back to the issued version */
  await L.go(p, 'viewsched'); await W.showDay(p, TUE, '#vWeek')
  await p.locator(`#vWeek .day[data-day="${TUE}"] select.dver`).selectOption('issued'); await S.sleep(700)
  const v2 = await verSel()
  const r2 = await S.look(p, 's13-d-back-issued')
  judge('13.d', 'selector switched back to the issued version', [
    ['selector reads the issued version again', v2 && /issued/i.test(v2.value + v2.text), JSON.stringify(v2)],
    ['Insights text identical to 13.a', S.same(r2, r0), S.same(r2, r0) ? '' : S.delta(r0, r2).slice(0, 300)],
  ], [r2.shot])

  /* the pending change goes out: only then does the window move (draft view unaffected) */
  await B.toEdit(p)
  await S.publish(p, TUE, 'al')
  const r3 = await S.look(p, 's13-e-al1', { foot: true })
  row('13.e', 'sign and Publish AL1', `Aircrew flying ${S.tile(r0, 2)} → ${S.tile(r3, 2)}; ${S.delta(r0, r3).slice(0, 500)}`, !S.same(r3, r0) ? 'PASS' : 'FAIL', [r3.shot, r3.shot2])
} catch (e) { row('13.X', 'the script stopped', String(e && e.stack || e).slice(0, 1500), 'FAIL', [await pic(p, 's13-X-error')]) }
row('13.err', "the browser's error list", errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart('s13', { errors })
await browser.close()
