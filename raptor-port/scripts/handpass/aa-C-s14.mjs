// S14 - taking an input off leaves no false pending difference (desktop, admin) - placeholder Event
const C = await import('./aa-C-lib.mjs')
const { world, fileInput, shot, sleep, go, pubSat, closeBoard, editWeek, face, fs, cr, crS, undoRedo, reload, signDay, moveBar, deleteSaved, takeOff, lastIid, rec } = C
const say = (k, v) => console.log(k, '::', typeof v === 'string' ? v : JSON.stringify(v))
const SAT = '2026-07-18', SUN = '2026-07-19'
const sign = async (page, di) => { await go(page, 'editsched'); await editWeek(page); return await signDay(page, di, 3) }
async function replay(page, tag, di) {
  say(`${tag} undo`, await undoRedo(page, 'undo')); say(`${tag} after undo`, fs(await face(page, di)))
  say(`${tag} redo`, await undoRedo(page, 'redo')); say(`${tag} after redo`, fs(await face(page, di)))
  await reload(page); await go(page, 'editsched'); await sleep(300); say(`${tag} after reload`, fs(await face(page, di)))
}
// ---- part 1: Saturday issued empty; file placeholder Event; take it off
{
  console.log('=== PART 1: filed after issue, then Take off')
  const w = await world(); const { page } = w
  await go(page, 'editsched'); await pubSat(page, 5); await closeBoard(page)
  say('1 issued empty Sat', fs(await face(page, 5)))
  say('1 sign', await sign(page, 5)); say('1 face signed', fs(await face(page, 5)))
  await fileInput(page, { iso: SAT, kind: 'Event', person: 'allavail', s: '09:00', e: '12:00', rmk: 'S14 a', oil: 'yes' })
  const iid = await lastIid(page, 'S14 a')
  await go(page, 'editsched'); say('1 after filing', fs(await face(page, 5)))
  await shot(page, 'S14-01-filed-pending')
  say('1 Take off', await takeOff(page, 5, iid))
  await go(page, 'editsched'); say('1 after take off', fs(await face(page, 5))); await shot(page, 'S14-02-after-take-off')
  await replay(page, '1R', 5)
  await shot(page, 'S14-03-after-replay')
  say('errors 1', w.errors); await w.browser.close()
}
// ---- part 2: Sunday issued after request taken off; then delete / move dormant requests
{
  console.log('=== PART 2: dormant request deleted / moved')
  const w = await world(); const { page } = w
  await fileInput(page, { iso: SUN, kind: 'Event', person: 'allavail', s: '09:00', e: '12:00', rmk: 'S14 b', oil: 'yes' })
  const b = await lastIid(page, 'S14 b')
  await fileInput(page, { iso: SUN, kind: 'Event', person: 'all', s: '13:00', e: '15:00', rmk: 'S14 c', oil: 'yes' })
  const c = await lastIid(page, 'S14 c')
  say('2 ids', { b, c })
  await go(page, 'editsched')
  say('2 take off b', await takeOff(page, 6, b)); say('2 take off c', await takeOff(page, 6, c))
  await go(page, 'editsched'); await pubSat(page, 6); await closeBoard(page)
  say('2 Sunday issued with both taken off', fs(await face(page, 6)))
  say('2 sign', await sign(page, 6)); say('2 face signed', fs(await face(page, 6)))
  await shot(page, 'S14-04-sunday-signed')
  // delete b
  await deleteSaved(page, SUN, 'S14 b')
  await go(page, 'editsched'); say('2 after deleting dormant b', fs(await face(page, 6))); await shot(page, 'S14-05-after-delete')
  await replay(page, '2D', 6)
  // move c off the date (to Friday 17)
  say('2 move c off Sunday to Fri 17', await moveBar(page, c, '2026-07-17'))
  await go(page, 'editsched'); await sleep(300)
  say('2 after moving dormant c', fs(await face(page, 6))); say('2 Friday face', fs(await face(page, 4))); await shot(page, 'S14-06-after-move')
  await replay(page, '2M', 6)
  // control: a request actually present in the issued programme still produces pending when taken off
  say('errors 2', w.errors); await w.browser.close()
}
// ---- part 3: control - request present in the issued programme, taken off afterwards, DOES read pending
{
  console.log('=== PART 3: control')
  const w = await world(); const { page } = w
  await fileInput(page, { iso: SUN, kind: 'Event', person: 'allavail', s: '09:00', e: '12:00', rmk: 'S14 d', oil: 'yes' })
  const d = await lastIid(page, 'S14 d')
  await go(page, 'editsched'); await pubSat(page, 6); await closeBoard(page)
  say('3 issued with the request on the programme', fs(await face(page, 6)))
  say('3 sign', await sign(page, 6))
  say('3 Take off', await takeOff(page, 6, d)); await go(page, 'editsched')
  say('3 after take off (pending expected)', fs(await face(page, 6))); await shot(page, 'S14-07-control')
  say('errors 3', w.errors); await w.browser.close()
}
