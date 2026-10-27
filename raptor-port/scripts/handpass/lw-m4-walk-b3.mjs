// Walker B, steps 3 and 4: a quick flick through the list then an Approve tap; Undo with Approvals up (scroll unchanged).
// Fixture: Ranger (member) bids LL on six spaced weekdays so the list is long enough to scroll. Chromium 402x874.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/b'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { L, T, shot, rec } = B
console.log('[lw-m4-walk-b3 v1]')
const w = await B.newPhone(402, 874, 'chromium')
const P = w.page
const sy = () => B.scrollY(P)
/* a person's flick: fast, then the finger rests ~90 ms before lifting (walk-scripts §4), on the page itself */
async function swipe(w, x, y0, y1, steps = 8, rest = 90) {
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] })
  for (let i = 1; i <= steps; i++) { await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 + (y1 - y0) * i / steps }] }); await P.waitForTimeout(8) }
  await P.waitForTimeout(rest)
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}
const lit = async () => (await B.apprLines(P)).filter(l => l.lit).map(l => l.who + ':' + l.lit)
try {
  await B.signIn(w, 'member')
  const days = ['2026-01-12', '2026-01-14', '2026-01-16', '2026-01-20', '2026-01-22', '2026-01-26']
  let placed = 0
  for (const d of days) {
    await L.openCell(w, 'bane', d)
    if (await L.placeLeave(w, 'LL')) placed++
    await B.sleep(w, 200)
  }
  rec('F fixture: Ranger placed six LL bids', 'phone', placed === 6 ? 'PASS' : 'FAIL', `placed ${placed} of 6`, [])
  await B.switchTo(w, 'admin')
  await B.openApprovals(w)
  await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
  const lines0 = await B.apprLines(P)
  console.log('lines', lines0.length, lines0.map(l => l.who).join(','))
  const docH = await P.evaluate(() => ({ sh: document.documentElement.scrollHeight, ih: window.innerHeight }))
  console.log('doc', JSON.stringify(docH))
  rec('F2 the list is long enough to scroll', 'phone', docH.sh > docH.ih + 200 ? 'PASS' : 'NOT WALKED', `${lines0.length} lines; page ${docH.sh} px tall in a ${docH.ih} px screen`, [])
  await shot(w, 's3-top')

  /* STEP 3a: a fast flick (finger moves fast, rests 90 ms), twice */
  const y0 = await sy()
  await swipe(w, 200, 700, 250, 6, 90)
  await B.sleep(w, 900)
  const y1 = await sy()
  await shot(w, 's3-after-flick1')
  await swipe(w, 200, 700, 200, 5, 90)
  await B.sleep(w, 900)
  const y2 = await sy()
  rec('S3a quick flick scrolls the page', 'phone', y1 > y0 && y2 > y1 ? 'PASS' : 'FAIL', `scrollY ${y0} -> ${y1} -> ${y2}`, ['s3-after-flick1.png'])
  await shot(w, 's3-after-flick2')
  /* STEP 3b: a flick with NO rest (a scripted fling), then at once a tap on a line's Approve */
  await swipe(w, 200, 300, 700, 5, 0)
  const yb = await sy()
  /* tap the Approve of a line fully in view, measured by elementFromPoint at its middle */
  const pick = await P.evaluate(() => {
    const lines = [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]')]
    for (const l of lines) {
      const b = l.querySelector('[data-testid="appr-approve"]'); if (!b) continue
      const r = b.getBoundingClientRect()
      if (r.top > 130 && r.bottom < innerHeight - 20) { const x = r.left + r.width / 2, y = r.top + r.height / 2; const h = document.elementFromPoint(x, y); if (b === h || b.contains(h)) return { id: l.dataset.testid, x, y } }
    }
    return null
  })
  console.log('pick', JSON.stringify(pick), 'scrollY now', yb)
  await B.sleep(w, 1200)
  if (!pick) { rec('S3b tap after a flick', 'phone', 'NOT WALKED', 'no line fully in view to tap', []) }
  else {
    const pick2 = await P.evaluate(id => { const b = document.querySelector(`[data-testid="${id}"] [data-testid="appr-approve"]`); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }, pick.id)
    const before = await lit()
    await B.tapAt(w, pick2.x, pick2.y, 's3-tap-q')
    await B.sleep(w, 500); await shot(w, 's3-tap')
    const after = await lit()
    const want = pick.id.replace('appr-line-', '')
    const ok = after.length === 1 && after[0].startsWith(want + ':approved')
    rec('S3b after the flick, tapping a line\'s Approve lights that line only', 'phone', ok ? 'PASS' : 'FAIL', `tapped ${pick.id}; lit before ${JSON.stringify(before)} after ${JSON.stringify(after)}`, ['s3-tap-q.png', 's3-tap.png'])
    await B.press(w, '#undoBtn', null, false); await B.sleep(w, 600)
  }

  /* STEP 4: scroll so a line is low, approve it, Undo -> scroll unchanged, line back to pending in place */
  await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
  const ids = (await B.apprLines(P)).map(l => l.who)
  /* scroll until the page foot, then choose the last line */
  await P.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await B.sleep(w, 500)
  const lastId = await P.evaluate(() => { const ls = [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]')].filter(e => e.getBoundingClientRect().height > 0); return ls.length ? ls[ls.length - 1].dataset.testid : null })
  console.log('last line', lastId)
  /* put it low: scroll back up a little so the last line's Approve sits near the foot of the screen */
  const lowY = await P.evaluate(id => { const b = document.querySelector(`[data-testid="${id}"] [data-testid="appr-approve"]`); const r = b.getBoundingClientRect(); const target = innerHeight - 60; window.scrollBy(0, r.top - target); return Math.round(window.scrollY) }, lastId)
  await B.sleep(w, 400)
  const ymax = await P.evaluate(() => Math.round(document.documentElement.scrollHeight - innerHeight))
  const sBefore = await sy()
  const topBefore = await P.evaluate(id => Math.round(document.querySelector(`[data-testid="${id}"]`).getBoundingClientRect().top), lastId)
  console.log('scrollY before', sBefore, 'of max', ymax, 'line top', topBefore)
  await shot(w, 's4-low-before')
  await B.press(w, `[data-testid="${lastId}"] [data-testid="appr-approve"]`, 's4-approve-q', false); await B.sleep(w, 500); await shot(w, 's4-approved')
  const sAppr = await sy()
  const litNow = await lit()
  /* top bar Undo */
  const undoBox = await P.evaluate(() => { const b = document.querySelector('#undoBtn').getBoundingClientRect(); return { top: Math.round(b.top), vis: b.height > 0 && b.top >= 0 && b.bottom <= innerHeight } })
  console.log('undo box', JSON.stringify(undoBox), 'scrollY after approve', sAppr, 'lit', JSON.stringify(litNow))
  await B.press(w, '#undoBtn', 's4-undo-q', false); await B.sleep(w, 700); await shot(w, 's4-undone')
  const sAfter = await sy()
  const topAfter = await P.evaluate(id => Math.round(document.querySelector(`[data-testid="${id}"]`).getBoundingClientRect().top), lastId)
  const litAfter = await lit()
  rec('S4a approve the low line: it lights', 'phone', litNow.length === 1 && litNow[0].startsWith(lastId.replace('appr-line-', '')) ? 'PASS' : 'FAIL', `lit ${JSON.stringify(litNow)}; scrollY ${sBefore} -> ${sAppr}`, ['s4-low-before.png', 's4-approve-q.png', 's4-approved.png'])
  rec('S4b top-bar Undo: scroll unchanged, line back to pending in place', 'phone', sAfter === sAppr && litAfter.length === 0 && topAfter === topBefore ? 'PASS' : 'FAIL', `scrollY ${sAppr} -> ${sAfter}; line top ${topBefore} -> ${topAfter}; lit after ${JSON.stringify(litAfter)}; undo button on screen: ${undoBox.vis}`, ['s4-undo-q.png', 's4-undone.png'])
  /* and Redo: lights again, scroll unchanged */
  await B.press(w, '#redoBtn', 's4-redo-q', false); await B.sleep(w, 700); await shot(w, 's4-redone')
  const sRedo = await sy(); const litRedo = await lit()
  rec('S4c Redo: the line lit again, scroll unchanged', 'phone', sRedo === sAfter && litRedo.length === 1 ? 'PASS' : 'FAIL', `scrollY ${sAfter} -> ${sRedo}; lit ${JSON.stringify(litRedo)}`, ['s4-redone.png'])
} catch (e) {
  rec('ERROR', 'phone', 'FAIL', String(e).slice(0, 400)); await shot(w, 's3-error').catch(() => {})
}
if (w.errs.length) rec('console', 'phone', 'FAIL', w.errs.join(' || ').slice(0, 600))
await w.ctx.close()
B.writeResults('s3')
await B.closeAll()
console.log('DONE')
