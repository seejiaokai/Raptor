// w1 — View-only Sched after a SANS hand tick (S7 follow-up): Hex's pucks per day, with a close-up of Thursday's.
// node scripts/handpass/sfd-w1-view.mjs
import path from 'node:path'
import { SIZES, mk, world, signIn, go, qualsTick, readWeek, sleep, J, log, OUT } from './sfd-w1-lib.mjs'
log('sfd-w1-view v1')
const sz = SIZES.d, W = mk('s7v', sz)
const { b, p } = await world(sz, W, '2026-07-15T09:00:00')
await signIn(p, 'ad', 'a')
log('tick', J((await qualsTick(p, W, 'rocky', '01')).st))
for (const page of ['viewsched', 'editsched']) {
  await go(p, page)
  const root = page === 'viewsched' ? '#vWeek' : '#eWeek'
  const r = await readWeek(p, 'rocky', root)
  log(page, J(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.map(x => x.san)]))))
  const pk = p.locator(`${root} section.day[data-day="3"] .puck[data-person="rocky"]`).first()
  if (await pk.count()) { await pk.scrollIntoViewIfNeeded(); await sleep(300); const bx = await pk.boundingBox(); await p.screenshot({ path: path.join(OUT, `s7v-${page}-thu-hex-closeup-desktop.png`), clip: { x: bx.x - 120, y: bx.y - 20, width: bx.width + 200, height: bx.height + 40 } }) }
}
log('errors', J(W.errs))
await b.close()
