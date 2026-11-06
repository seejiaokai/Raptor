// debug of S4e: control (month tap long after) vs quick (month tap ~120 ms after the leave is placed)
process.env.LW_OUT ||= process.env.LW_DIST === 'dist-before' ? '2026-11-06-lw-faults/walk-before' : '2026-11-06-lw-faults/walk'
process.env.WNAME = 'w3dbg' + (process.env.LW_DIST === 'dist-before' ? 'b' : '')
const { L, row, T, openNow, fresh, finish } = await import('./lw-f1106-w0.mjs')
console.log('[lw-f1106-w3dbg v1]', L.SIZE, L.DIST)
const SIZE = L.SIZE
const w = await fresh(SIZE); const P = w.page
const id = await L.pidOf(P, 'Drifter')
await L.openCell(w, id, L.day(9)); await L.autoApprove(w, false); await L.closeWin(w); await L.settle(w)
const lit = () => P.evaluate(() => document.querySelector('[data-testid="month-strip"] .mjump.on')?.textContent?.trim())
async function run(name, wait, dayN, month) {
  await L.settle(w)
  await L.openCell(w, id, L.day(dayN))
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(250)
  const ll = await L.centre(P, T('bid-LL'))
  const mbb = await P.locator(T(`month-${month}`)).first().boundingBox()
  const mb = { x: mbb.x + mbb.width / 2, y: mbb.y + mbb.height / 2 }
  const was = await lit()
  await L.finger(w, ll.x, ll.y); const t0 = Date.now()
  await P.waitForTimeout(wait)
  const g = Date.now() - t0
  await L.finger(w, mb.x, mb.y, `s4e-${SIZE}-${name}-q`)
  await P.waitForTimeout(1500)
  const now = await lit()
  await L.shot(w, `s4e-${SIZE}-${name}-settled`)
  row('S4e-' + name, SIZE, `place LL, ~${g} ms later tap ${month}`, `lit before=${was} after=${now}; open=${JSON.stringify(await openNow(P))}`, now === month ? 'PASS' : 'FAIL', [`s4e-${SIZE}-${name}-q`, `s4e-${SIZE}-${name}-settled`])
}
await run('quick120', 100, 32, 'OCT')
await run('slow1000', 1000, 33, 'AUG')
await run('quick120b', 100, 34, 'MAR')
async function run2(name, sel, test, dayN) {
  await L.settle(w)
  await L.openCell(w, id, L.day(dayN))
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(250)
  const ll = await L.centre(P, T('bid-LL'))
  const bb = await P.locator(sel).first().boundingBox()
  const pt = { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 }
  const before = await test()
  await L.finger(w, ll.x, ll.y); const t0 = Date.now()
  await P.waitForTimeout(100)
  const g = Date.now() - t0
  await L.finger(w, pt.x, pt.y, 's4e-' + SIZE + '-' + name + '-q')
  await P.waitForTimeout(1200)
  const after = await test()
  await L.shot(w, 's4e-' + SIZE + '-' + name + '-settled')
  row('S4e-' + name, SIZE, 'place LL, ~' + g + ' ms later press ' + sel, 'before=' + before + ' after=' + after, before !== after ? 'PASS' : 'FAIL', ['s4e-' + SIZE + '-' + name + '-q', 's4e-' + SIZE + '-' + name + '-settled'])
}
await run2('undo', '#undoBtn', () => P.evaluate(() => document.querySelector('#redoBtn')?.disabled), 35)
await run2('approvalstab', T('lw-tab-approvals'), async () => await L.vis(P, T('approvals-page')), 36)
finish('w3dbg-' + SIZE)
await L.closeBrowser()
