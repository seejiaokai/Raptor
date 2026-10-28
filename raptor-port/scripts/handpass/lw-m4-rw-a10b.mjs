// Re-walk A10b — lesson 5: the ringed cell after a dates tap on a far month (Wed 4 Feb, Cutter), measured at 1.2 s and 3 s (inside the ring's six seconds), against the frozen parts and the bar.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/a'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, lineLoc, pressLoc } = A
const { T, rec, shot, press, vis } = L
console.log('[lw-m4-rw-a10b v1]')
const w = await L.newCtx('desk'); const P = w.page
const wait = ms => P.waitForTimeout(ms)
const MONS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const reach = async (who, iso) => { if (!(await P.locator(T(L.cellId(who, iso))).count())) { await P.getByRole('button', { name: MONS[Number(iso.slice(5, 7)) - 1], exact: true }).first().click(); await wait(700) } for (let i = 0; i < 16 && !(await P.locator(T(L.cellId(who, iso))).count()); i++) await wait(250) }
const ringReport = () => P.evaluate(() => {
  const td = document.querySelector('td.lw-ring'); if (!td) return { ring: false }
  const r = td.getBoundingClientRect()
  const pts = [[0.5, 0.5], [0.15, 0.15], [0.85, 0.15], [0.15, 0.85], [0.85, 0.85]].map(([fx, fy]) => { const x = r.left + r.width * fx, y = r.top + r.height * fy; const e = document.elementFromPoint(x, y); return { in: !!e && (td === e || td.contains(e)), over: e ? (e.tagName + '.' + String(e.className).slice(0, 24) + (e.dataset && e.dataset.testid ? '#' + e.dataset.testid : '')) : null } })
  const slim = document.querySelector('[data-testid="appr-slim"]'); const sb = slim && slim.getBoundingClientRect()
  const bub = document.querySelector('[data-testid="manning-bubble"]'); const bb = bub && bub.getBoundingClientRect()
  return { ring: true, box: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], allIn: pts.every(p => p.in), over: pts.map(p => p.over), slimTop: sb && Math.round(sb.top), slimL: sb && Math.round(sb.left), slimR: sb && Math.round(sb.right), bubbleTop: bb && Math.round(bb.top), vh: innerHeight }
})
try {
  await L.signIn(w, 'admin')
  await reach('psy', '2026-02-04')
  await P.evaluate(id => document.querySelector(`[data-testid="${id}"]`)?.scrollIntoView({ block: 'center', inline: 'center' }), L.cellId('psy', '2026-02-04')); await wait(350)
  await L.openCell(w, 'psy', '2026-02-04'); await L.approveWhatIEnter(w, false); await L.placeLeave(w, 'LL')
  await P.keyboard.press('Escape'); await P.evaluate(() => window.scrollTo(0, 0)); await wait(400)
  await L.openApprovals(w)
  await pressLoc(w, lineLoc(P, 'Wed 4 Feb').locator('[data-testid="appr-dates"]'))
  await wait(1200); const r1 = await ringReport(); await shot(w, 'a10b-1-ring-1200ms')
  await wait(1800); const r3 = await ringReport(); await shot(w, 'a10b-2-ring-3s')
  console.log('1.2 s:', JSON.stringify(r1)); console.log('3 s:', JSON.stringify(r3))
  const ok = r => r.ring && r.allIn && r.box[3] <= r.slimTop && r.box[0] >= 211 - 2
  rec('A10.3 (lesson 5) a far cell (Wed 4 Feb) is ringed, nothing over it (frozen columns, date row, bar), at its resting place', 'desk', r1.ring && ok(r1) && ok(r3) ? 'PASS' : (r1.ring ? 'FAIL' : 'NOT WALKED'), `1.2 s ${JSON.stringify(r1)}; 3 s ${JSON.stringify(r3)}`, ['a10b-1-ring-1200ms', 'a10b-2-ring-3s'])
  // with the bar up, a bid that raises the bubble is A6; here: is the bubble (if any) clear of the ring? none up.
} catch (e) { rec('ERROR', 'desk', 'FAIL', String(e).slice(0, 400)); await shot(w, 'a10b-error').catch(() => {}) }
if (w.errs.length) rec('console', 'desk', 'FAIL', w.errs.join(' || ').slice(0, 400))
await w.ctx.close(); L.writeResults('a10b'); await L.closeBrowser(); console.log('DONE')
