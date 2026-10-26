// THE WALK OF THE CODE READ'S Q6, Q8, Q11 FIXES ON THE LEAVE WAR (the M3 build's FULL check, 25-26 Oct 26), desktop
// 1536 x 864 at 2x, admin, the built bundle on 4180, through the grid's own drag and the drag window's buttons:
//   Q6  over one leave "Wedding" and a free day, the drag window shows "Wedding"; ⋯ → Attach files no "Wedding" on the Attach
//   Q11 over two separate entries both "Wedding", the box shows "Wedding" and no grey line
//   Q8  an Other over three days (⋯ → Other) is one bar wearing D1370's 1.5px .78 edge on every day
// Usage (from raptor-port/): node scripts/handpass/lw-m3b-rw-qwar.mjs
process.env.LW_OUT ||= '2026-10-25-lw-m3-build/rewalk-q'
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const fs = await import('node:fs')
fs.mkdirSync(M.OUT, { recursive: true })
L.clearPrefix('qw-')
console.log('lw-m3b-rw-qwar →', M.OUT)
const w = await M.start('desk', 'chromium', 'admin', undefined, undefined, 2)
const P = w.page
const verdicts = []
const judge = (id, ok, said) => { verdicts.push({ id, ok }); console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${id}  ${said}`) }
const ids = await M.ids(P)
const selWin = '[data-testid="select-sheet"]'
async function dragFile(who, a, z, { remarks, type = 'LL' } = {}) {
  const open = await M.dragCells(w, [who, a], [who, z])
  if (!open) throw new Error('no drag window ' + a + '..' + z)
  await M.setSwitch(w, true, 'sel')
  if (remarks) { await L.press(w, T('sel-remarks')); await P.keyboard.type(remarks); await P.waitForTimeout(150) }
  await L.press(w, T(`sel-${type}`)); await P.waitForTimeout(600)
  if (await L.vis(P, T('select-sheet'))) { await L.press(w, T(`sel-${type}`)); await P.waitForTimeout(600) }
  await M.closeEverything(w)
}
const inputsOf = (who, type) => P.evaluate(([who, type]) => (window.INPUTS || []).filter(r => r.type === type && ((r.people || []).some(x => x.p === who) || r.person === who)).map(r => ({ date: r.date, endDate: r.endDate, remarks: r.remarks, acc: r.acc })), [who, type])

/* ---------- Q6 ---------- */
{
  const who = ids.Ranger
  await dragFile(who, '2026-11-09', '2026-11-10', { remarks: 'Wedding' })
  await M.dragCells(w, [who, '2026-11-09'], [who, '2026-11-11'])
  const box = await P.locator(T('sel-remarks')).inputValue()
  await M.winPic(w, 'qw-q6-1-window-shows-wedding', { sel: selWin })
  await L.press(w, T('sel-more')); await P.waitForTimeout(250)
  await M.winPic(w, 'qw-q6-2-more-menu', { sel: selWin })
  await L.press(w, T('sel-file-ATCH')); await P.waitForTimeout(800)
  await M.closeEverything(w)
  const att = await inputsOf(who, 'Attach')
  await L.cellShot(w, who, '2026-11-10', 'qw-q6-3-grid-after')
  judge('Q6', box === 'Wedding' && att.length > 0 && att.every(r => !/Wedding/.test(r.remarks || '')), `box opened "${box}"; the Attach filed ${JSON.stringify(att)}`)
}
/* ---------- Q11 ---------- */
{
  const who = ids.Hunter
  await dragFile(who, '2026-11-09', '2026-11-10', { remarks: 'Wedding' })
  await dragFile(who, '2026-11-12', '2026-11-13', { remarks: 'Wedding', type: 'OL' })
  await M.dragCells(w, [who, '2026-11-09'], [who, '2026-11-13'])
  const box = await P.locator(T('sel-remarks')).inputValue()
  const lines = await P.locator(T('sel-remark-line')).count()
  await M.winPic(w, 'qw-q11-window-shared-words', { sel: selWin })
  await M.closeEverything(w)
  judge('Q11', box === 'Wedding' && lines === 0, `box "${box}", grey lines ${lines}`)
}
/* ---------- Q8 ---------- */
{
  const who = ids.Saber
  const days = ['2026-11-16', '2026-11-17', '2026-11-18']
  await M.dragCells(w, [who, days[0]], [who, days[2]])
  await L.press(w, T('sel-more')); await P.waitForTimeout(250)
  await L.press(w, T('sel-file-OTH')); await P.waitForTimeout(800)
  await M.closeEverything(w)
  const looks = []
  for (const d of days) looks.push(await P.locator(`${T(`cell-${who}-${d}`)} .c.k-unav`).first().evaluate(e => ({ cls: e.className, sh: getComputedStyle(e).boxShadow })).catch(() => null))
  await L.cellShot(w, who, days[1], 'qw-q8-other-three-days')
  judge('Q8', looks.every(l => l && /\bj[lr]\b/.test(l.cls) && l.sh.includes('1.5px') && l.sh.includes('0.78')), JSON.stringify(looks.map(l => l && { cls: l.cls.replace(/\s+/g, ' '), sh: l.sh.slice(0, 90) })))
}
console.log('errors', JSON.stringify((w.errs || []).slice(0, 6)))
const bad = verdicts.filter(v => !v.ok)
console.log(bad.length ? `FAIL ${bad.map(v => v.id).join(', ')}` : `ALL ${verdicts.length} PASS`)
await M.closeBrowser()
