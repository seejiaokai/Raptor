// sah-w10-probe — w10 reads the world before writing the walk: Ranger's and Hex's own demo items on the weeks of 13 and
// 20 Jul (the trap of 17 false FAILs), the posting sheet's date move, a run of days filed, Ranger's bell. Desktop only.
import './sah-w10-env.mjs'
const { L, run, save, RANGER, HEX, holds, movePo, file, sansRead, rowsLine, cellLine, bell, bellWords, as, rec, J, inp, gotoWeek } = await import('./sah-w10-lib.mjs')
console.log('sah-w10-probe v1', L.URL_, L.OUT)
await run('probe', 'd', async (p, W) => {
  W.rec('r13', 'Ranger week of 13 Jul (read)', null, await holds(p, RANGER))
  W.rec('h13', 'Hex week of 13 Jul (read)', null, await holds(p, HEX))
  await gotoWeek(p, W, '2026-07-20')
  W.rec('r20', 'Ranger week of 20 Jul (read)', null, await holds(p, RANGER))
  W.rec('h20', 'Hex week of 20 Jul (read)', null, await holds(p, HEX))
  await gotoWeek(p, W, '2026-07-13')
  const po = await L.postOut(p, W, RANGER, '2026-07-17', 'p01')
  W.rec('po', 'Ranger posted out SANS from 17', null, `${po.line} ${J(po.after)}`, po.pic)
  const f = await file(p, W, '2026-07-17', RANGER, ['fly', 'oft', 'amt'], 'all', 'p02', { endIso: '2026-07-21' })
  W.rec('file', 'Saber files Ranger 17→21', null, `read "${f.read}" made ${J(f.made)} refused "${f.refused}"`, f.pic)
  for (const d of ['2026-07-17', '2026-07-20']) { const s = await sansRead(p, W, d, 'p03-' + d); W.rec('day' + d, 'SANS day', null, `${s.month} ${cellLine(s.cell)} · ${rowsLine(s.day)} · add ${s.day && s.day.add}`, s.pic) }
  const m = await movePo(p, W, RANGER, '2026-07-17', '2026-07-20', 'p04')
  W.rec('move', 'posting moved 17→20', null, J({ kind: m.kind, before: m.before, line: m.line, err: m.err, rec: m.rec }), m.pic)
  for (const d of ['2026-07-17', '2026-07-20']) { const s = await sansRead(p, W, d, 'p05-' + d); W.rec('day2' + d, 'SANS day after move', null, `${cellLine(s.cell)} · ${rowsLine(s.day)}`, s.pic) }
  await as(p, W, 'us', 'us')
  const b = await bell(p, W, 'p06-ranger-bell')
  W.rec('bell', 'Ranger bell', null, bellWords(b), b.pic)
})
save('probe')
