/* W5's gap, looked into: where the time between the press and the readout's start goes (chat 164). */
import { serve, browserOf, fresh, DESK, signIn, outsideTime, openBy, readout, pageRows, waitRows, sleep } from './timing-walk-lib.mjs'
const srv = await serve(); const cr = await browserOf()
const { ctx, page } = await fresh(cr, DESK, { cpu: 4 })
await page.addInitScript(() => { const w = window; w.__ev = []; for (const t of ['pointerdown', 'mousedown', 'pointerup', 'click']) addEventListener(t, e => w.__ev.push([t, Math.round(e.timeStamp), Math.round(performance.now())]), true) })
await page.goto(srv.base + '/?timing'); await page.waitForSelector('#timingRoot .timingwin', { timeout: 60000 })
await signIn(page); await outsideTime(page, 'viewsched'); await sleep(800)
for (const p of ['leavewar', 'tracker', 'editsched', 'admin', 'leavewar', 'viewsched', 'inputs', 'viewsched']) {
  const n = pageRows(await readout(page)).length
  await page.evaluate(() => { window.__ev = [] })
  await openBy(page, p)
  const out = await outsideTime(page, p)
  const r = await waitRows(page, n)
  const ev = await page.evaluate(() => window.__ev)
  const pd = ev.find(e => e[0] === 'pointerdown'), ck = ev.find(e => e[0] === 'click')
  console.log(p.padEnd(10), 'readout', pageRows(r)[0]?.value, '| outside(from pointerdown handler)', out, '| pointerdown stamp->handler', pd[2] - pd[1], '| pointerdown->click handler', ck[2] - pd[2], '| click stamp->handler', ck[2] - ck[1])
  await sleep(1000)
}
await cr.close(); await srv.close()
