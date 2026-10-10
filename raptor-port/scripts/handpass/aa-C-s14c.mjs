// S14 control: the same Take off with a NAMED man, and with a placeholder Duty, to see whether the leftover "1 pending" is placeholder-specific
const C = await import('./aa-C-lib.mjs')
const { world, fileInput, shot, sleep, go, pubSat, closeBoard, editWeek, face, fs, signDay, takeOff, lastIid, pidOf, pendListText } = C
const say = (k, v) => console.log(k, '::', typeof v === 'string' ? v : JSON.stringify(v))
const SAT = '2026-07-18'
for (const v of [{ name: 'named Ranger Event', person: 'RANGER', kind: 'Event', oil: 'yes' }, { name: 'named Ranger Duty', person: 'RANGER', kind: 'Duty', oil: 'yes' }, { name: 'ALL AVAIL Duty', person: 'allavail', kind: 'Duty', oil: 'yes' }, { name: 'ALL AVAIL Training (no oil on weekday? Sat asks)', person: 'allavail', kind: 'Training', oil: 'yes' }]) {
  const w = await world(); const { page } = w
  const person = v.person === 'RANGER' ? await pidOf(page, 'Ranger') : v.person
  await go(page, 'editsched'); await pubSat(page, 5); await closeBoard(page)
  await editWeek(page); await signDay(page, 5, 3)
  await fileInput(page, { iso: SAT, kind: v.kind, person, s: '09:00', e: '12:00', rmk: 'S14 ctl', oil: v.oil })
  const iid = await lastIid(page, 'S14 ctl')
  await go(page, 'editsched'); const f1 = fs(await face(page, 5))
  await takeOff(page, 5, iid)
  await go(page, 'editsched'); const f2 = fs(await face(page, 5))
  console.log(v.name, '\n   after filing:', f1, '\n   after take off:', f2)
  await w.browser.close()
}
