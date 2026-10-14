/* helper walk: exploration of S11 — what the board shows after a publish, a cancel, a holiday (prints only; pictures to the H folder) */
import { L, J, bstate, publish, file, mark, board, closeBoard, rowBtn, uncx, makeHoliday, closeWindows, sheet, bar, list, noteNow, rec, FRI, FRI_ISO } from './ou-h-0.mjs'
const SIZE = process.argv[2] === 'phone' ? 'phone' : 'desk'
const w = await L.world(SIZE), p = w.page
try {
  const A = await file(w, FRI_ISO, 'bane', 'Range brief')
  console.log('filed', J(A))
  await board(w, FRI)
  console.log('board before publish', J(await bstate(p)))
  const pub = await publish(p, FRI); console.log('pub', J(pub))
  console.log('board after publish', J(await bstate(p)))
  await closeBoard(w)
  await mark(w, FRI, A.id, 'cx')
  await board(w, FRI)
  console.log('board after cancel', J(await bstate(p)))
  const html = await p.evaluate(() => { const b = document.querySelector('#schedBoard'); const h = b.querySelector('.sb-top, .sb-daybar, header') || b; return h.outerHTML.slice(0, 3000) })
  console.log(html)
  await L.pic(w, 'x-explore-' + SIZE)
} finally { await L.close(w) }
