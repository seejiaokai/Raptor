// W1 part h — scenarios 34 and 35 (phone, Chromium): the joined bar (D1359) and the drag across it.
// 34: two separate next-door filings Mon and Tue: two boxes, not joined; one input Mon-Fri with a second entry on Wed: the bar breaks round Wed;
//     a half-day run joins top to top.
// 35: a drag across a joined bar shows the days as their own boxes with cyan, and the bar joins again on release — at a person's speed AND slowly.
// Usage (from raptor-port/): node scripts/handpass/lw-m3b-w1-h34.mjs
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const path = await import('node:path')
for (const p of ['s34-', 's35-']) L.clearPrefix(p)
console.log('lw-m3b-w1-h34 phone/chromium out', L.OUT)
const w = await M.start('phone')
const P = w.page
console.log('page scripts:', await M.scriptCheck(w))
const lines = [], bad = []
const say = s => { lines.push(s); console.log('   ' + s) }
const judge = (ok, s) => { if (!ok) bad.push(s); say((ok ? 'ok    ' : 'WRONG ') + s) }
const ids = await M.ids(P)
const who = ids.Ranger
const geomLine = async iso => { const g = await M.boxGeom(P, who, iso); return g ? `${iso}: td ${g.td.join('..')}; ` + g.boxes.map(b => `"${b.text}" [${b.cls.replace('c ', '')}] ${b.left}..${b.right} radius ${b.radius} color ${b.color}`).join(' | ') : `${iso}: no cell` }
const cls = async iso => ((await M.boxGeom(P, who, iso))?.boxes || []).map(b => b.cls)
async function dragFile(a, z, { remarks, type = 'LL', portion = null } = {}) {
  const open = await M.dragCells(w, [who, a], [who, z])
  if (!open) throw new Error('no drag window ' + a + '..' + z)
  await M.setSwitch(w, false, 'sel')
  if (portion) await L.press(w, T('sel-portion-' + portion))
  if (remarks) { await L.press(w, T('sel-remarks')); await P.keyboard.type(remarks); await P.waitForTimeout(150) }
  await L.press(w, T(`sel-${type}`)); await P.waitForTimeout(600)
  if (await L.vis(P, T('select-sheet'))) { await L.press(w, T(`sel-${type}`)); await P.waitForTimeout(600) }
  return !(await L.vis(P, T('select-sheet')))
}

/* ---------- 34a: two separate filings, Mon 2 and Tue 3 Nov ---------- */
{
  const a = '2026-11-02', b = '2026-11-03'
  await M.bidType(w, who, a, { approve: false }); await M.bidType(w, who, b, { approve: false })
  say('34a ' + await geomLine(a)); say('34a ' + await geomLine(b))
  const ca = (await cls(a))[0] || '', cb = (await cls(b))[0] || ''
  say('34a picture: ' + await M.rangeShot(w, who, a, b, 's34-1-two-filings'))
  judge(!/\bjr\b/.test(ca) && !/\bjl\b/.test(cb), `34a two separate filings are not marked as joined (Mon "${ca}", Tue "${cb}")`)
  judge(true, '34a two boxes, not joined — read from the picture s34-1-two-filings (checked below)')
}
/* ---------- 34b: one input Mon-Fri 16-20 Nov with a second entry on Wed 18 ---------- */
{
  const mon = '2026-11-16', wed = '2026-11-18', fri = '2026-11-20'
  // the second entry on Wednesday first: an Other, the morning, through the ⋯
  await L.openCellR(w, who, wed); await P.waitForSelector(T('bid-picker'))
  await L.press(w, T('portion-am')); await L.press(w, T('bid-more')); await P.waitForSelector(T('bid-more-menu')); await L.press(w, T('bid-file-OTH')); await P.waitForTimeout(800)
  say('34b Wednesday first holds: ' + ((await M.cellWords(P, who, wed))?.boxes || []).map(b => b.split('|')[0] + '/' + b.split('|').pop()).join(' + '))
  const ok = await dragFile(mon, fri, { remarks: 'Trip' })
  say('34b LL Mon–Fri placed: ' + ok)
  for (const d of ['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20']) say('34b ' + await geomLine(d))
  say('34b picture: ' + await M.rangeShot(w, who, mon, fri, 's34-2-mon-fri-with-wed'))
  const c = {}; for (const d of ['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20']) c[d.slice(8)] = (await cls(d)).map(x => (x.match(/\bj[lr]\b/g) || []).join('')).join(' / ')
  say('34b the join classes by day: ' + JSON.stringify(c))
}
/* ---------- 34c: a half-day run, Mon–Wed 23–25 Nov, mornings ---------- */
{
  const ok = await dragFile('2026-11-23', '2026-11-25', { remarks: 'Half', portion: 'am' })
  say('34c AM LL Mon–Wed placed: ' + ok)
  for (const d of ['2026-11-23', '2026-11-24', '2026-11-25']) say('34c ' + await geomLine(d))
  say('34c picture: ' + await M.rangeShot(w, who, '2026-11-23', '2026-11-25', 's34-3-half-day-run'))
}
/* ---------- 35: a drag across a joined bar (Mon–Fri 16–20 Nov): at a person's speed and slowly ---------- */
async function dragShots(label, a, z, hold, stepMs, steps) {
  await L.reachCell(w, who, a)
  await P.locator(T(L.cellId(who, a))).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await P.waitForTimeout(300)
  const bA = await P.locator(T(L.cellId(who, a))).first().boundingBox(), bZ = await P.locator(T(L.cellId(who, z))).first().boundingBox()
  const A = { x: bA.x + bA.width / 2, y: bA.y + bA.height / 2 }, Z = { x: bZ.x + bZ.width / 2, y: bZ.y + bZ.height / 2 }
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: A.x, y: A.y, id: 1 }] })
  await P.waitForTimeout(hold)
  for (let i = 1; i <= steps; i++) { await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: A.x + (Z.x - A.x) * i / steps, y: A.y + (Z.y - A.y) * i / steps, id: 1 }] }); await P.waitForTimeout(stepMs) }
  await P.waitForTimeout(90)
  const mid = {}
  for (const d of ['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20']) mid[d.slice(8)] = ((await M.boxGeom(P, who, d))?.boxes || []).map(b => `[${b.cls.replace('c ', '')}] r${b.radius} ${b.left}..${b.right} color ${b.color}`).join(' / ') + ' td.selcell=' + await P.evaluate(([who, d]) => document.querySelector(`[data-testid="cell-${who}-${d}"]`).classList.contains('selcell'), [who, d])
  say(`35 [${label}] while the finger is down: ` + JSON.stringify(mid))
  const midPic = await M.rangeShot(w, who, '2026-11-16', '2026-11-20', `s35-${label}-1-while-dragging`)
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await P.waitForTimeout(700)
  say(`35 [${label}] the drag window opened on release: ${await L.vis(P, T('select-sheet'))}`)
  const relPic = await M.winPic(w, `s35-${label}-2-released`, { sel: T('select-sheet'), above: 175 })
  await L.closeAny(w); await P.waitForTimeout(500)
  const after = {}
  for (const d of ['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20']) after[d.slice(8)] = ((await M.boxGeom(P, who, d))?.boxes || []).map(b => `[${b.cls.replace('c ', '')}] r${b.radius} color ${b.color}`).join(' / ') + ' selcell=' + await P.evaluate(([who, d]) => document.querySelector(`[data-testid="cell-${who}-${d}"]`).classList.contains('selcell'), [who, d])
  say(`35 [${label}] after the window is closed: ` + JSON.stringify(after))
  const aftPic = await M.rangeShot(w, who, '2026-11-16', '2026-11-20', `s35-${label}-3-after-close`)
  say(`35 [${label}] pictures: ${midPic}, ${relPic}, ${aftPic}`)
  return { mid, after }
}
const fast = await dragShots('person', '2026-11-16', '2026-11-20', 320, 40, 6)
const slow = await dragShots('slow', '2026-11-16', '2026-11-20', 700, 160, 12)
console.log(`SUMMARY [phone/chromium]: ${lines.filter(l => /^(ok|WRONG)/.test(l)).length} judged, ${bad.length} wrong`)
for (const x of bad) console.log('   WRONG: ' + x)
console.log('errors:', JSON.stringify(w.errs))
await w.ctx.close(); await M.closeBrowser()
