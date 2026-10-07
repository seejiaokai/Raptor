/* walker TO — P2-10: a suggested brief produces a warning, not a publication block.
   Friday (no flying in the demo): a new wave, VL take-off 12:00, landing 13:00, the B (brief) box left blank — the app
   suggests 09:40 — Vandal / Ryder; Rally 10:00 typed into the wave's reporting line. Then the four sign-offs and
   "Publish day"; then an amendment while the warning still shows. */
import * as T from './stk-TO-lib.mjs'
const { W, L, row, judge, pic } = T
const DI = 4, WHO = ['Vandal', 'Ryder']
await T.run('P2-10', async p => {
  await W.toastSpy(p)
  await T.boardAt(p, DI)
  const gi = await T.addWave(p, DI)
  const a = await T.newForm(p, DI, gi, { cs: 'VL', to: '1200', ld: '1300' }, WHO)
  const sug = await p.evaluate(([d, g]) => { const b = document.querySelector(`#sbBoard [data-bfld="ff:${d}.${g}.0.br"]`); const cell = b ? b.parentElement : null; return { typed: b ? b.value : null, above: cell ? cell.innerText.replace(/\s+/g, ' ').trim() : '' } }, [DI, gi])
  await W.boardOff(p); await W.showDay(p, DI); await T.itShow(p, 'week', DI, gi)
  const add = await T.itAdd(p, 'week', DI, gi)
  const t = await T.itType(p, 'week', DI, gi, 0, '10:00 RALLY')
  await T.itShow(p, 'week', DI, gi); const s1 = await pic(p, 'p210-1-week-rally-1000')
  const wk = await T.itRead(p, 'week', DI, gi)
  const lst = await T.listOf(p, DI); const mine = await T.linesFull(p, DI, /rally 10:00/)
  await T.listShow(p, DI, /rally 10:00/); const s2 = await pic(p, 'p210-2-friday-list')
  await T.boardAt(p, DI); await T.itShow(p, 'board', DI, gi); const bd = await T.itRead(p, 'board', DI, gi); const s3 = await pic(p, 'p210-3-board-rally-1000'); await W.boardOff(p)
  judge('P2-10.1', `Friday, a new wave (VL 12:00–13:00, Vandal / Ryder, B box blank — above it the app prints "${sug.above}"). Week: "+ In-time / Rally" (it filled "${add.added}"), retyped "10:00 RALLY" + Tab. The message under the line, on the board, and Friday's warning list read.`, [
    ['a message shows under the line on the week and on the board', !!wk.fb && wk.fb === bd.fb, `week "${wk.fb}" (painted ${wk.fbColor}) · board "${bd.fb}"`],
    ['EXPECTED: the message says "suggested brief"', /suggested brief/i.test(wk.fb), wk.fb],
    ['it is a RED line in Friday\'s warning list', mine.length === 1 && mine[0].sev === 'hard', `${T.fullStr(mine)} · bar "${lst.bar}"`],
  ], [s1, s2, s3])

  /* publish: the four sign-offs, then "Publish day" */
  await W.toasts(p)
  const pub = await T.pubOrig(p, DI)
  const said1 = await W.toasts(p); const h1 = await T.head(p, DI)
  await W.showDay(p, DI); const s4 = await pic(p, 'p210-4-after-publish-day')
  const published = !!h1 && !/DRAFT/i.test(h1.tag) && h1.beak !== 'on'
  judge('P2-10.2', `Friday: the four sign-offs chosen (${Object.values(pub.s).join(', ')}), then "${pub.r.label || 'Publish day'}" pressed with the Rally warning still showing.`, [
    ['EXPECTED: publication remains available after sign-off — the day is published', published, `the day's tag reads "${h1.tag}", its Publish button is ${h1.beak}; the app said: ${said1.join(' | ') || '(nothing)'}`],
  ], [s4])

  /* for the record: does hiding the warning (its ✕) let the day out? */
  const hid = await T.hide(p, DI, /rally 10:00/)
  await W.toasts(p)
  const pubH = await W.publishDay(p, DI); await L.sleep(400)
  const saidH = await W.toasts(p); const hH = await T.head(p, DI)
  const lstH = await T.listOf(p, DI)
  await T.listShow(p, DI, /rally 10:00/); const s5 = await pic(p, 'p210-5-hidden-then-publish')
  row('P2-10.2h', 'for the record: the warning hidden with its own ✕ (' + hid + '), then "Publish day" pressed again', `bar "${lstH.bar}" · the day's tag "${hH.tag}", Publish button ${hH.beak} · the app said: ${saidH.join(' | ') || '(nothing)'}`, 'INFO', [s5])
  await T.again(p, DI, /rally 10:00/)

  /* the amendment route: correct the timing so the day can go out, publish, bring the Rally back, press Publish AL */
  let route2 = 'not reached'
  const s = []
  if (!published) {
    await T.toEdit(p); await W.showDay(p, DI)
    await T.itType(p, 'week', DI, gi, 0, '09:00 RALLY')
    const fix = await T.itRead(p, 'week', DI, gi)
    await W.toasts(p)
    const pub2 = await T.pubOrig(p, DI); const said2 = await W.toasts(p); const h2 = await T.head(p, DI)
    await W.showDay(p, DI); s.push(await pic(p, 'p210-6-published-after-correcting'))
    const pubOk = !!h2 && !/DRAFT/i.test(h2.tag)
    await T.itType(p, 'week', DI, gi, 0, '10:00 RALLY')
    const again = await T.itRead(p, 'week', DI, gi); const h3 = await T.head(p, DI)
    await W.toasts(p)
    const al = await T.pubAL(p, DI); const said3 = await W.toasts(p); const h4 = await T.head(p, DI)
    await W.showDay(p, DI); await T.itShow(p, 'week', DI, gi); s.push(await pic(p, 'p210-7-publish-al-with-warning'))
    route2 = `Rally retyped 09:00 (under the line: "${fix.fb}") → sign-offs + "Publish day": tag "${h2.tag}", the app said ${said2.join(' | ') || '(nothing)'} [${pubOk ? 'published' : 'NOT published'}]. Rally retyped 10:00 on the published day (under the line: "${again.fb}"; the day's count "${h3.pending}", button "${h3.alpub}") → sign-offs (${Object.values(al.s).join(', ')}) + "${al.r.label || 'Publish AL'}"${al.r.pressed ? '' : ' (' + al.r.why + ')'}: tag "${h4.tag}", count "${h4.pending}", the app said: ${said3.join(' | ') || '(nothing)'}`
    judge('P2-10.3', 'The amendment route (the day could not be published with the warning, so the Rally was first corrected to 09:00 and the day published; then Rally put back to 10:00 on the published day and "Publish AL" pressed after the four sign-offs).', [
      ['EXPECTED: the amendment can be issued while the warning remains', /AL ?1|AL1/i.test(h4.tag) && !/pending|change/i.test(h4.pending || ''), route2],
    ], s)
    row('P2-10.3h', 'the amendment route, every figure', route2, 'INFO')
  } else {
    await T.boardAt(p, DI); await T.box(p, `fr:${DI}.${gi}.0.0`, 'AMENDED REMARK'); await W.boardOff(p)
    const h3 = await T.head(p, DI)
    await W.toasts(p)
    const al = await T.pubAL(p, DI); const said3 = await W.toasts(p); const h4 = await T.head(p, DI)
    await W.showDay(p, DI); s.push(await pic(p, 'p210-6-publish-al-with-warning'))
    const wk2 = await T.itRead(p, 'week', DI, gi)
    judge('P2-10.3', 'The amendment route: the line\'s Remarks changed on the published day ("AMENDED REMARK"), the four sign-offs, "Publish AL" — the Rally warning still showing.', [
      ['EXPECTED: the amendment is issued while the warning remains', /AL ?1|AL1/i.test(h4.tag), `before: count "${h3.pending}", button "${h3.alpub}" → after: tag "${h4.tag}", count "${h4.pending}"; the app said ${said3.join(' | ') || '(nothing)'}; under the line "${wk2.fb}"`],
    ], s)
  }
})
