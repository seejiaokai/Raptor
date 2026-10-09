import * as C from './it-C-lib.mjs'
const { row, sleep } = C
const size = 'desk'
const w = await C.world(size, 'ad', { fresh: false })
const p = w.page
const rg = await C.pid(p, 'Ranger')
const pics = [], out = []
await C.switchUser(w, 'us')
const q1 = await C.fileNew(w, { iso: '2026-07-18', type: 'Event', person: 'allavail', title: 'Weekend exercise', s: '08:00', e: '12:00', rmk: 'p60a', oil: 'yes' })
const q2 = await C.fileNew(w, { iso: '2026-07-19', type: 'Event', person: 'all', title: 'Weekend exercise', s: '08:00', e: '12:00', rmk: 'p60b', oil: 'yes' })
console.log('QUESTIONS', JSON.stringify(q1), JSON.stringify(q2))
const A = (await C.recAll(p, { remarks: 'p60a' }))[0], B = (await C.recAll(p, { remarks: 'p60b' }))[0]
console.log('RECS', JSON.stringify([A, B]))
await C.switchUser(w, 'ad')
for (const [di, rec, label, rmk] of [[5, A, 'ALL AVAIL (Sat 18)', 'p60a'], [6, B, 'ALL (Sun 19)', 'p60b']]) {
  const o = { label }
  await C.openBoard(w, di)
  o.pub = await C.publishOpenDay(w, di)
  // the count, plain
  await C.openCount(w, rec.iid)
  o.plain = await C.winState(p); pics.push(await C.pic(w, `s60-${rmk}-count`))
  await C.closeCountWin(w)
  // OIL Earn: switch one man off
  await C.oilMode(p, true)
  await C.openCount(w, rec.iid)
  const s0 = await C.winState(p)
  const target = Object.keys(s0.seats).find(k => s0.seats[k] === 'on')
  const seat = p.locator(`.availwin .seat.oilpk[data-oilp="${target}"]`).first(); await seat.scrollIntoViewIfNeeded(); await C.press(w, seat); await sleep(700)
  o.afterOff = await C.winState(p); o.target = target; pics.push(await C.pic(w, `s60-${rmk}-earn-off`))
  await C.closeCountWin(w); await C.oilMode(p, false); await C.closeBoard(p)
  // retitle the input
  await C.winRetitle(w, di === 5 ? '2026-07-18' : '2026-07-19', rec.iid, { title: 'Weekend exercise two' })
  await C.openBoard(w, di)
  await C.oilMode(p, true)
  await C.openCount(w, rec.iid)
  o.afterRetitle = await C.winState(p); pics.push(await C.pic(w, `s60-${rmk}-after-retitle`))
  await C.closeCountWin(w); await C.oilMode(p, false); await C.closeBoard(p)
  o.rec = await C.recBy(p, { iid: rec.iid })
  out.push(o); console.log(JSON.stringify(o).slice(0, 1500))
}
const same = o => JSON.stringify(o.afterOff.seats) === JSON.stringify(o.afterRetitle.seats)
const heads = out.map(o => o.plain && o.plain.head)
row(60, size, 'member filer (Ranger), then admin', out.every(o => o.plain && /Weekend exercise/.test(o.plain.head + o.plain.text) && o.afterOff.seats[o.target] === 'off' && same(o)) ? 'PASS' : 'CHECK',
  `Ranger filed Sat 18 Event for ALL AVAIL and Sun 19 Event for ALL, both titled "Weekend exercise"; the OIL question each time: ${JSON.stringify([q1.head, q2.head])}. Admin published both days. Count windows on the Board: ${out.map(o => `${o.label}: head "${o.plain && o.plain.head}", ${o.plain && o.plain.on} of ${o.plain && o.plain.total} earning; tabs ${JSON.stringify(o.plain && o.plain.tabs)}; in OIL Earn ${o.target} switched off -> ${o.afterOff.on} on / ${o.afterOff.off} off; after retitling to "Weekend exercise two": ${o.afterRetitle.on} on / ${o.afterRetitle.off} off, ${o.target} ${o.afterRetitle.seats[o.target]}, same switches as before the retitle: ${same(o)}; head now "${o.afterRetitle.head}"`).join(' || ')}`, pics)
await C.finish(w, 's60')
