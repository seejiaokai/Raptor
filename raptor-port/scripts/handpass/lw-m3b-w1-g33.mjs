// W1 part g2 — scenario 33 and A4's bar, close up (desktop 1536x864 at 3x so the pictures show the box edges).
// 33: Ranger's LL run 29-31 Oct continuing 1-2 Nov, one remark: RECORD whether the bar runs on across the month's edge or ends square at it.
// A4 (close-up): Attach over two days: two ATCH boxes joined as one bar? (the drag window's ⋯ -> Attach).
// Also the plain baseline: a three-day LL bar in the middle of a month (D1359).
// Usage (from raptor-port/): node scripts/handpass/lw-m3b-w1-g33.mjs
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
L.clearPrefix('s33-'); L.clearPrefix('a4b-'); L.clearPrefix('s33base-')
console.log('lw-m3b-w1-g33 desktop 1536x864 @3x out', L.OUT)
const w = await M.start('desk', 'chromium', 'admin', undefined, undefined, 3)
const P = w.page
const lines = [], bad = []
const say = s => { lines.push(s); console.log('   ' + s) }
const judge = (ok, s) => { if (!ok) bad.push(s); say((ok ? 'ok    ' : 'WRONG ') + s) }
const ids = await M.ids(P)
const geom = async (who, iso) => { const g = await M.boxGeom(P, who, iso); return g ? `${iso}: td ${g.td.join('..')}; ` + g.boxes.map(b => `"${b.text}" [${b.cls}] ${b.left}..${b.right} top ${b.top}..${b.bottom} radius ${b.radius} ml ${b.ml} mr ${b.mr} shadow ${b.shadow} ::before ${b.beforeW} ::after ${b.afterW}`).join(' | ') : `${iso}: no cell` }
async function dragFile(who, a, z, { remarks, type = 'LL', approve = false } = {}) {
  const open = await M.dragCells(w, [who, a], [who, z])
  if (!open) throw new Error('no drag window ' + a + '..' + z)
  await M.setSwitch(w, approve, 'sel')
  if (remarks) { await L.press(w, T('sel-remarks')); await P.keyboard.type(remarks); await P.waitForTimeout(150) }
  await L.press(w, T(`sel-${type}`)); await P.waitForTimeout(600)
  if (await L.vis(P, T('select-sheet'))) { await L.press(w, T(`sel-${type}`)); await P.waitForTimeout(600) }   // the below-zero ask
  return !(await L.vis(P, T('select-sheet')))
}
/* ---------- 33 ---------- */
{
  const who = ids.Ranger
  const ok = await dragFile(who, '2026-10-29', '2026-11-02', { remarks: 'Trip' })
  say('33 LL 29 Oct–2 Nov with the remark "Trip": placed ' + ok)
  for (const d of ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02']) say('33 ' + await geom(who, d))
  const k = []
  for (const d of ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02']) k.push(((await M.cellWords(P, who, d))?.boxes || []).map(b => b.split('|')[0]).join(',') || '(empty)')
  say('33 the code each day shows: ' + k.join(' | '))
  const recs = []
  for (const d of ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02']) recs.push(await M.stateOf(P, who, d))
  say('33 the records each day: ' + recs.join(' | '))
  const pic1 = await M.rangeShot(w, who, '2026-10-29', '2026-10-31', 's33-1-october-side')
  const pic2 = await M.rangeShot(w, who, '2026-11-01', '2026-11-02', 's33-2-november-side')
  const pic3 = await M.rangeShot(w, who, '2026-10-30', '2026-11-02', 's33-3-across-the-edge', 10)
  say('33 pictures: ' + [pic1, pic2, pic3].join(', '))
  const g31 = await M.boxGeom(P, who, '2026-10-31'), g01 = await M.boxGeom(P, who, '2026-11-01')
  const cls31 = g31?.boxes[0]?.cls || '', cls01 = g01?.boxes[0]?.cls || ''
  say(`33 RECORD: 31 Oct's box classes "${cls31}", 1 Nov's "${cls01}" — the bar ${/\bjr\b/.test(cls31) && /\bjl\b/.test(cls01) ? 'RUNS ON across the month edge (31 Oct joins right, 1 Nov joins left)' : 'ENDS SQUARE at the edge (31 Oct: ' + (/\bjr\b/.test(cls31) ? 'joins right' : 'no right join') + '; 1 Nov: ' + (/\bjl\b/.test(cls01) ? 'joins left' : 'no left join') + ')'}`)
}
/* ---------- the baseline: a three-day LL in mid-month ---------- */
{
  const who = ids.Ranger
  const ok = await dragFile(who, '2026-12-09', '2026-12-11', { remarks: 'Mid' })
  say('base LL 9–11 Dec placed ' + ok)
  for (const d of ['2026-12-09', '2026-12-10', '2026-12-11']) say('base ' + await geom(who, d))
  say('base picture: ' + await M.rangeShot(w, who, '2026-12-09', '2026-12-11', 's33base-1-three-day-bar'))
}
/* ---------- A4: the Attach bar ---------- */
{
  const who = ids.Drifter, a = '2026-11-26', z = '2026-11-27'
  const open = await M.dragCells(w, [who, a], [who, z])
  await L.press(w, T('sel-more')); await P.waitForSelector(T('sel-more-menu'))
  const att = await L.centre(P, T('sel-file-ATCH')); await P.mouse.click(att.x, att.y); await P.waitForTimeout(1000)
  say('A4 the Attach filed: windows ' + JSON.stringify(await M.anyWindowOpen(P)))
  for (const d of [a, z]) say('A4 ' + await geom(who, d))
  say('A4 picture: ' + await M.rangeShot(w, who, a, z, 'a4b-1-attach-bar'))
  // and an Other over three days, for comparison with the leave bar
  const g1 = await M.boxGeom(P, who, a), g2 = await M.boxGeom(P, who, z)
  say(`A4 the first box ends at ${g1.boxes[0].right}, the second starts at ${g2.boxes[0].left}: gap ${(g2.boxes[0].left - g1.boxes[0].right).toFixed(1)} px; the first day's text "${g1.boxes[0].text}", the second's "${g2.boxes[0].text}"`)
}
console.log('errors:', JSON.stringify(w.errs))
await w.ctx.close(); await M.closeBrowser()
