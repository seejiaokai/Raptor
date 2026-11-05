// The night of 5–6 Nov 26, job 1 — a probe of the walker's S7 note: "the drag window's OD, first press left the row empty".
// Drag over three days of one man (no posting), press OD once, read the row; again with a posting set. Run from raptor-port:
//   SIZE=desk|phone  [LW_DIST=dist-before]  node scripts/handpass/lw-f1106-odprobe.mjs
process.env.LW_OUT ||= '2026-11-06-lw-faults/odprobe'
import { mkdirSync } from 'node:fs'
const L = await import('./lw-fx1031-lib.mjs')
mkdirSync(L.OUT, { recursive: true })
console.log('[lw-f1106-odprobe v1]', L.SIZE, L.DIST)
const w = await L.world('admin'); const P = w.page
await L.openGrid(w)
for (const [who, a, z] of [['Vapor', '2026-12-14', '2026-12-16'], ['Nomad', '2026-12-28', '2026-12-30']]) {
  const id = await L.pidOf(P, who)
  await L.reachCell(w, id, a)
  await L.dragCells(w, [id, a], [id, z])
  await P.waitForTimeout(500)
  const sel = P.locator('[data-testid="sel-file-OD"]').first()
  const has = await sel.count() && await sel.isVisible()
  const logs = []
  P.on('console', m => logs.push(m.text().slice(0, 120)))
  if (has) await L.press(w, '[data-testid="sel-file-OD"]', `od-${L.SIZE}-${who}-quick`)
  await P.waitForTimeout(900)
  const cells = []
  for (const d of [a, '2026-12-' + String(+a.slice(8) + 1).padStart(2, '0'), z]) cells.push(await L.cellWords(w, id, d))
  const open = await L.vis(P, '[data-testid="sel-sheet"]')
  const note = await L.txt(P, '[data-testid="sel-sheet"]')
  await L.shot(w, `od-${L.SIZE}-${who}-after-one-press`)
  console.log(JSON.stringify({ who, has, cells, windowOpenAfter: open, note: (note || '').slice(0, 200), said: await L.lastSaid(w), oilAsk: await L.vis(P, '.airpop'), errs: w.errs }))
  await L.closeWin(w); await P.waitForTimeout(400)
}
await L.closeBrowser()
