// W1 part a2 — scenarios 1 and 2, done properly (the decided taps close the window, so the lit state is read on a REOPEN).
// Approve / Refuse rest grey; the decided one is solid green / red with dark words and reads Approved / Refused;
// a second tap on the lit one sends the bid back to waiting; after each tap Undo, Redo, reload — cell and window agree.
// Usage (from raptor-port/): node scripts/handpass/lw-m3b-w1-a2.mjs [chromium|webkit]
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const engine = process.argv[2] || 'chromium'
const tag = engine === 'webkit' ? 'wk' : 'cr'
const size = `phone/${engine}`
for (const pfx of ['s1-' + tag, 's2-' + tag]) L.clearPrefix(pfx)
console.log('lw-m3b-w1-a2', engine, 'out', L.OUT)
const w = await M.start('phone', engine)
const P = w.page
console.log('page scripts:', await M.scriptCheck(w))
const IDS = ['decide-approve', 'decide-refuse', 'bid-LL']
const short = b => b.there ? `${b.id.replace('decide-', '').replace('bid-', '')}[${b.text}] bg ${b.bg} words ${b.color} ring ${b.outline.startsWith('solid') ? b.outline : 'none'} pressed ${b.pressed}` : `${b.id} (not drawn)`
const GREY_A = b => b.pressed === 'false' && b.text === 'Approve' && b.bg === 'rgb(26, 31, 38)' && b.color === 'rgb(143, 224, 168)'
const GREY_R = b => b.pressed === 'false' && b.text === 'Refuse' && b.bg === 'rgb(26, 31, 38)' && b.color === 'rgb(255, 166, 173)'
const LIT_A = b => b.pressed === 'true' && b.text === 'Approved' && b.bg === 'rgb(87, 201, 122)' && b.color === 'rgb(11, 17, 22)'
const LIT_R = b => b.pressed === 'true' && b.text === 'Refused' && b.bg === 'rgb(240, 85, 95)' && b.color === 'rgb(11, 17, 22)'
const WANT = { pending: 's-w', approved: 's-a', refused: 's-r' }
const checks = []
/* read the cell and (if asked) the reopened window; judge both against the wanted state */
async function look(label, who, iso, want, { win = true, pic = null } = {}) {
  const cell = await M.cellWords(P, who, iso)
  const cellOk = !!cell?.boxes?.[0] && cell.boxes[0].includes('|' + WANT[want] + '|')
  let btn = [], winOk = null, picName = null
  if (win) {
    await L.closeAny(w); await L.openCellR(w, who, iso); await P.waitForSelector(T('bid-picker'), { timeout: 5000 }); await P.waitForTimeout(350)
    btn = await M.btnState(P, IDS)
    const [a, r] = btn
    winOk = want === 'approved' ? LIT_A(a) && GREY_R(r) : want === 'refused' ? LIT_R(r) && GREY_A(a) : GREY_A(a) && GREY_R(r)
    if (pic) picName = await M.winPic(w, pic)
  }
  const line = `${label}: cell ${cell?.boxes?.[0]} -> ${cellOk ? 'ok' : 'WRONG'}${win ? `; window: ${btn.map(short).join(' | ')} -> ${winOk ? 'ok' : 'WRONG'}` : ''}`
  console.log('   ' + line)
  checks.push({ label, want, cellOk, winOk, line, pic: picName })
  return cellOk && (winOk !== false)
}
async function ur(who, iso, before, after, base) {
  // Undo, Redo, reload — the screen right after each
  await L.closeAny(w); await L.undo(w)
  await look(`${base} Undo`, who, iso, before, { pic: `${base}-undo` })
  await L.closeAny(w); await L.redo(w)
  await look(`${base} Redo`, who, iso, after, { pic: `${base}-redo` })
  await L.closeAny(w)
  console.log('      ' + await M.reloadApp(w))
  await L.reachCell(w, who, iso)
  await look(`${base} reload`, who, iso, after, { pic: `${base}-reload` })
  await L.closeAny(w)
}
async function scenario(label, iso, which) {
  const wantA = which === 'approve' ? 'approved' : 'refused'
  const f = await M.bidType(w, 'bane', iso, { approve: false })
  console.log(`-- ${label} fixture ${iso}:`, JSON.stringify(f.k), await M.stateOf(P, 'bane', iso))
  await look(`${label} pending`, 'bane', iso, 'pending', { pic: `${label}-${tag}-0-pending` })
  const btnId = which === 'approve' ? 'decide-approve' : 'decide-refuse'
  // first tap
  await L.closeAny(w); await L.openCellR(w, 'bane', iso); await P.waitForSelector(T('bid-picker'))
  const q1 = await M.tapQ(w, T(btnId), `${label}-${tag}-1-tap-q`)
  const open1 = await L.vis(P, T('bid-picker'))
  console.log(`   ${label} first tap: window ${open1 ? 'still open' : 'closed'}; quick picture ${q1}`)
  await L.cellShot(w, 'bane', iso, `${label}-${tag}-1-tap-cell`)
  await look(`${label} after tap 1`, 'bane', iso, wantA, { pic: `${label}-${tag}-1-lit` })
  await ur('bane', iso, 'pending', wantA, `${label}-${tag}-1`)
  // second tap on the lit button
  await L.closeAny(w); await L.openCellR(w, 'bane', iso); await P.waitForSelector(T('bid-picker'))
  const q2 = await M.tapQ(w, T(btnId), `${label}-${tag}-2-tap-q`)
  console.log(`   ${label} second tap: window ${await L.vis(P, T('bid-picker')) ? 'still open' : 'closed'}; quick picture ${q2}`)
  await L.cellShot(w, 'bane', iso, `${label}-${tag}-2-tap-cell`)
  await look(`${label} after tap 2 (back to waiting)`, 'bane', iso, 'pending', { pic: `${label}-${tag}-2-waiting` })
  console.log(`   ${label} record after tap 2: ${await M.stateOf(P, 'bane', iso)}`)
  await ur('bane', iso, wantA, 'pending', `${label}-${tag}-2`)
}
await scenario('s1', '2026-11-10', 'approve')
await scenario('s2', '2026-11-11', 'refuse')
const bad = checks.filter(c => !c.cellOk || c.winOk === false)
console.log(`SUMMARY [${size}]: ${checks.length} readings, ${bad.length} wrong`)
for (const b of bad) console.log('   WRONG: ' + b.line)
console.log('errors:', JSON.stringify(w.errs))
await w.ctx.close(); await M.closeBrowser()
