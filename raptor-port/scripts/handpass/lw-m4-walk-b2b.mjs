// Walker B, step 2 follow-up: the fast double tap on Approve all with the page's own clock for the gap between the two touches.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/b'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { T, shot, rec } = B
console.log('[lw-m4-walk-b2b v1]')
const w = await B.newPhone(402, 874, 'chromium')
const P = w.page
try {
  await B.signIn(w, 'admin'); await B.openApprovals(w)
  await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
  await P.evaluate(() => { window.__ts = []; for (const t of ['pointerdown', 'pointerup', 'click']) document.addEventListener(t, e => window.__ts.push([t, Math.round(e.timeStamp)]), true) })
  const c = await B.centre(P, T('appr-approve-all'))
  for (let i = 0; i < 2; i++) {
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y }] })
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  }
  await P.waitForTimeout(900)
  const ts = await P.evaluate(() => window.__ts)
  const downs = ts.filter(t => t[0] === 'pointerdown').map(t => t[1])
  const gap = downs.length > 1 ? downs[1] - downs[0] : null
  const lines = await B.apprLines(P)
  const all = await B.txt(P, T('appr-approve-all'))
  console.log('events', JSON.stringify(ts), 'gap', gap, 'lit', lines.filter(l => l.lit).length, 'all', all)
  await shot(w, 's2b-back-to-back')
  rec('S2h two touches back to back (page clock gap)', 'phone', gap !== null && gap < 150 && lines.filter(l => l.lit).length === lines.length ? 'PASS' : (gap !== null && gap >= 150 ? 'NOT WALKED' : 'FAIL'), `pointerdown gap ${gap} ms; lit ${lines.filter(l => l.lit).length} of ${lines.length}; button "${all}"`, ['s2b-back-to-back.png'])
  await B.press(w, '#undoBtn'); await B.sleep(w, 600)
  const l2 = await B.apprLines(P)
  const undoState = await P.evaluate(() => document.querySelector('#undoBtn').disabled)
  rec('S2i one Undo after the back-to-back taps', 'phone', l2.filter(l => l.lit).length === 0 ? 'PASS' : 'FAIL', `lit after one Undo ${l2.filter(l => l.lit).length}; undo disabled ${undoState}`, [])
} catch (e) { rec('ERROR', 'phone', 'FAIL', String(e).slice(0, 300)) }
if (w.errs.length) rec('console', 'phone', 'FAIL', w.errs.join(' || ').slice(0, 600))
await w.ctx.close()
B.writeResults('s2b')
await B.closeAll()
console.log('DONE')
