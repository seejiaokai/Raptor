/* W2 N-W / N-D — measure the note over time, on the week itself (no board) and on the board.  node nw-measure.mjs phone|desk */
import { L, toastNow, toastShown, clearToast, openBoard, signDay, pressDay, head, closeBoard, sleep, DAYS } from './w2lib.mjs'
console.log('nw-measure v1')
const size = process.argv[2] || 'phone'
const w = await L.world(size)
const p = w.page
const series = async label => {
  const rows = []
  for (const ms of [0, 150, 300, 600, 1200]) { if (ms) await sleep(ms === 150 ? 150 : ms - [0, 150, 300, 600, 1200][[0, 150, 300, 600, 1200].indexOf(ms) - 1]); const t = await toastNow(p); rows.push(t ? `${ms}ms op ${t.opacity} y ${t.box.y} bottomGap ${t.vh - t.box.bottom} x ${t.box.x} w ${t.box.w} rightGap ${t.vw - t.box.right} "${t.text}"` : `${ms}ms none`) }
  console.log(label + '\n   ' + rows.join('\n   '))
}
try {
  await L.go(w, 'editsched')
  const DI = 2
  // sign on the week itself (no board open)
  console.log('sign', JSON.stringify(await signDay(p, DI)))
  console.log('board open?', await p.locator('#schedBoard:visible').count())
  await clearToast(p)
  const b = p.locator(`#eWeek [data-beak="${DI}"]:visible`).first()
  console.log('week beak count', await b.count())
  await b.evaluate(e => e.scrollIntoView({ block: 'center' }))
  if (w.phone) await b.tap(); else await b.click()
  const t0 = await toastShown(p)
  console.log('first reading', JSON.stringify(t0))
  await series('week, no board')
  await clearToast(p)
  // re-raise with a fresh note on the week: unpublish
  const u = p.locator(`#eWeek [data-unpub="${DI}"]:visible`).first()
  await u.evaluate(e => e.scrollIntoView({ block: 'center' }))
  if (w.phone) await u.tap(); else await u.click()
  await toastShown(p)
  await sleep(700)
  const t = await toastNow(p)
  console.log('settled on week', JSON.stringify(t))
  await L.pic(w, `nw-${size}-week-note`)
  // overflow of long note: wrap check
  console.log('lines', await p.evaluate(() => { const t = document.getElementById('toastEl'); return t.getBoundingClientRect().height + ' / lh ' + getComputedStyle(t).lineHeight + ' padding ' + getComputedStyle(t).padding + ' pos ' + getComputedStyle(t).position + ' bottom ' + getComputedStyle(t).bottom + ' left ' + getComputedStyle(t).left + ' right ' + getComputedStyle(t).right + ' transform ' + getComputedStyle(t).transform }))
} finally {
  await L.close(w)
}
