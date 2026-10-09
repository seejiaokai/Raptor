// S14: does a taken-off (dormant) weekend request credit OIL once the day is issued / amended?
const C = await import('./aa-C-lib.mjs')
const { world, fileInput, shot, sleep, go, pubSat, closeBoard, editWeek, face, fs, signDay, takeOff, lastIid, pidOf, cr, crS } = C
const say = (k, v) => console.log(k, '::', typeof v === 'string' ? v : JSON.stringify(v))
for (const v of [{ n: 'ALL AVAIL Event', person: 'allavail', kind: 'Event' }, { n: 'named Ranger Duty', person: 'RANGER', kind: 'Duty' }]) {
  console.log('=== ' + v.n)
  // (i) issued empty, request filed afterwards, taken off, AL1
  { const w = await world(); const { page } = w
    const p = v.person === 'RANGER' ? await pidOf(page, 'Ranger') : v.person
    await go(page, 'editsched'); await pubSat(page, 5); await closeBoard(page)
    await fileInput(page, { iso: '2026-07-18', kind: v.kind, person: p, s: '09:00', e: '12:00', rmk: 'S14 e', oil: 'yes' })
    const iid = await lastIid(page, 'S14 e')
    await takeOff(page, 5, iid); await go(page, 'editsched')
    say('i  after take off', fs(await face(page, 5)))
    await go(page, 'editsched'); await pubSat(page, 5); await closeBoard(page)
    say('i  AL1 face', fs(await face(page, 5))); say('i  credits after AL1 (expected zero: dormant)', crS(await cr(page)))
    await shot(page, 'S14e-' + v.n.replace(/\W+/g, '-') + '-al1')
    await w.browser.close() }
  // (ii) taken off BEFORE the first publication, issue Original
  { const w = await world(); const { page } = w
    const p = v.person === 'RANGER' ? await pidOf(page, 'Ranger') : v.person
    await fileInput(page, { iso: '2026-07-18', kind: v.kind, person: p, s: '09:00', e: '12:00', rmk: 'S14 e', oil: 'yes' })
    const iid = await lastIid(page, 'S14 e')
    await takeOff(page, 5, iid); await go(page, 'editsched'); await pubSat(page, 5); await closeBoard(page)
    say('ii Original face', fs(await face(page, 5))); say('ii credits (expected zero)', crS(await cr(page)))
    await w.browser.close() }
}
