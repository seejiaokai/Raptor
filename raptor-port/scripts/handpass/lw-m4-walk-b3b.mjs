// Walker B, step 3 re-look: after a flick, tap a line's Approve. A: finger flick with a rest before the lift. B: fling with no rest,
// waited until the page stands still, then tapped (twice if the first lights nothing). Same fixture as b3.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/b'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { L, T, shot, rec } = B
console.log('[lw-m4-walk-b3b v1]')
const w = await B.newPhone(402, 874, 'chromium')
const P = w.page
const sy = () => B.scrollY(P)
async function swipe(x, y0, y1, steps, rest) {
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] })
  for (let i = 1; i <= steps; i++) { await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 + (y1 - y0) * i / steps }] }); await P.waitForTimeout(8) }
  if (rest) await P.waitForTimeout(rest)
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}
const still = async () => { let a = await sy(), n = 0; for (let i = 0; i < 40; i++) { await P.waitForTimeout(150); const b = await sy(); if (b === a) { if (++n >= 3) return b } else n = 0; a = b } return a }
const lit = async () => (await B.apprLines(P)).filter(l => l.lit).map(l => l.who + ':' + l.lit)
const approveCentre = id => P.evaluate(id => { const b = document.querySelector(`[data-testid="${id}"] [data-testid="appr-approve"]`); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, top: r.top, bottom: r.bottom } }, id)
/* the first line wholly in view whose Approve is under the finger's point (elementFromPoint) — by id */
const inView = () => P.evaluate(() => {
  for (const l of document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]')) {
    const b = l.querySelector('[data-testid="appr-approve"]'); if (!b) continue
    const r = b.getBoundingClientRect()
    if (r.top > 130 && r.bottom < innerHeight - 20) { const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); if (b === h || b.contains(h)) return l.dataset.testid }
  } return null })
try {
  await B.signIn(w, 'member')
  for (const d of ['2026-01-12', '2026-01-14', '2026-01-16', '2026-01-20', '2026-01-22', '2026-01-26']) { await L.openCell(w, 'bane', d); await L.placeLeave(w, 'LL'); await B.sleep(w, 200) }
  await B.switchTo(w, 'admin'); await B.openApprovals(w)
  await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
  /* A: a finger flick that rests before lifting */
  await swipe(200, 700, 300, 6, 90)
  const yA = await still(); console.log('A scrollY', yA)
  const idA = await inView()
  const cA = await approveCentre(idA)
  await B.tapAt(w, cA.x, cA.y, 's3b-A-tap-q'); await B.sleep(w, 500); await shot(w, 's3b-A-tap')
  const litA = await lit()
  rec('S3c rested flick, then Approve tap lights that line only', 'phone', litA.length === 1 && litA[0].startsWith(idA.replace('appr-line-', '') + ':approved') ? 'PASS' : 'FAIL', `scrollY ${yA}; tapped ${idA}; lit ${JSON.stringify(litA)}`, ['s3b-A-tap-q.png', 's3b-A-tap.png'])
  await B.press(w, '#undoBtn', null, false); await B.sleep(w, 600)
  /* B: a fling with no rest */
  await swipe(200, 750, 200, 5, 0)
  const yB = await still(); console.log('B scrollY', yB)
  const idB = await inView()
  const cB = await approveCentre(idB)
  await B.tapAt(w, cB.x, cB.y, 's3b-B-tap1-q'); await B.sleep(w, 500); await shot(w, 's3b-B-tap1')
  const litB1 = await lit()
  let litB2 = null
  if (litB1.length === 0) {
    const cB2 = await approveCentre(idB)
    await B.tapAt(w, cB2.x, cB2.y, 's3b-B-tap2-q'); await B.sleep(w, 500); await shot(w, 's3b-B-tap2')
    litB2 = await lit()
  }
  const ok1 = litB1.length === 1 && litB1[0].startsWith(idB.replace('appr-line-', '') + ':approved')
  const ok2 = litB2 && litB2.length === 1 && litB2[0].startsWith(idB.replace('appr-line-', '') + ':approved')
  rec('S3d no-rest fling, page still, Approve tap', 'phone', ok1 ? 'PASS' : (ok2 ? 'NOT WALKED' : 'FAIL'), `scrollY ${yB}; tapped ${idB}; first tap lit ${JSON.stringify(litB1)}${litB2 ? '; second tap lit ' + JSON.stringify(litB2) : ''}${ok2 && !ok1 ? ' (first tap after a no-rest fling swallowed: the test browser trap of walk-scripts s4, not judged)' : ''}`, ['s3b-B-tap1.png', 's3b-B-tap2.png'].filter((_, i) => i === 0 || litB2))
} catch (e) { rec('ERROR', 'phone', 'FAIL', String(e).slice(0, 400)); await shot(w, 's3b-error').catch(() => {}) }
if (w.errs.length) rec('console', 'phone', 'FAIL', w.errs.join(' || ').slice(0, 600))
await w.ctx.close()
B.writeResults('s3b')
await B.closeAll()
console.log('DONE')
