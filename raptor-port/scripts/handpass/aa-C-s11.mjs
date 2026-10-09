// S11 - publish before versus after changing availability (desktop, admin)
const C = await import('./aa-C-lib.mjs')
const { world, fileInput, shot, sleep, go, pubSat, closeBoard, editWeek, face, fs, cr, crS, undoRedo, reload, signDay, deleteSaved, pend, pidOf, rec, earnRead } = C
const say = (k, v) => console.log(k, '::', typeof v === 'string' ? v : JSON.stringify(v))
const RMK = 'S11 duty', LV = 'S11 leave'
async function crowd(page) { return await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="5"] .oilcount')].map(e => e.innerText.trim() + ' / ' + e.title)) }
async function replay(page, tag) {
  say(`${tag} undo`, await undoRedo(page, 'undo'))
  say(`${tag} after undo`, fs(await face(page))); say(`${tag}   crowd`, await crowd(page)); say(`${tag}   credits`, crS(await cr(page)))
  say(`${tag} redo`, await undoRedo(page, 'redo'))
  say(`${tag} after redo`, fs(await face(page))); say(`${tag}   crowd`, await crowd(page)); say(`${tag}   credits`, crS(await cr(page)))
  await reload(page); await go(page, 'editsched'); await sleep(300)
  say(`${tag} after reload`, fs(await face(page))); say(`${tag}   crowd`, await crowd(page)); say(`${tag}   credits`, crS(await cr(page)))
}
async function setup(page) {
  const p = await pidOf(page, 'Ranger')
  await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', s: '09:00', e: '12:00', rmk: RMK, oil: 'yes' })
  return p
}
const crowdNames = async (page, p) => (await earnRead(page, [p])) // reads who earns for P
// ---------- order A: issue -> leave -> replay -> AL
{
  console.log('=== A: issue, then P files leave, replay, AL')
  const w = await world(); const { page } = w
  const p = await setup(page)
  await go(page, 'editsched'); say('A1 crowd (working)', await crowd(page))
  await pubSat(page, 5); await closeBoard(page)
  say('A1 issued', fs(await face(page))); say('A1 credits', crS(await cr(page)))
  say('A2 sign', await (async () => { await editWeek(page); return await signDay(page, 5, 3) })())
  await fileInput(page, { iso: '2026-07-18', kind: 'LL', person: p, rmk: LV })
  say('A2 leave record', await rec(page, LV))
  await go(page, 'editsched'); await sleep(400)
  say('A2 face', fs(await face(page))); say('A2 crowd (working: 44 expected)', await crowd(page)); say('A2 credits (issued frozen: Ranger HO)', crS(await cr(page)))
  await shot(page, 'S11-A1-after-leave')
  say('A2 earn state of Ranger', await earnRead(page, [p])); await closeBoard(page)
  await replay(page, 'A3')
  await go(page, 'editsched'); say('A4 AL1', await pubSat(page, 5)); await closeBoard(page)
  say('A4 face', fs(await face(page))); say('A4 credits (Ranger loses HO)', crS(await cr(page)))
  await shot(page, 'S11-A2-al1-credits')
  say('errors A', w.errors)
  await w.browser.close()
}
// ---------- order B: leave -> replay -> issue -> remove leave -> replay -> AL
{
  console.log('=== B: leave first, replay, issue, remove leave, replay, AL')
  const w = await world(); const { page } = w
  const p = await setup(page)
  await fileInput(page, { iso: '2026-07-18', kind: 'LL', person: p, rmk: LV })
  say('B1 leave record', await rec(page, LV))
  await go(page, 'editsched'); await sleep(300)
  say('B1 crowd (44 expected)', await crowd(page))
  await replay(page, 'B1')
  await go(page, 'editsched'); await pubSat(page, 5); await closeBoard(page)
  say('B2 issued', fs(await face(page))); say('B2 credits (Ranger leave, no HO)', crS(await cr(page)))
  say('B2 sign', await (async () => { await editWeek(page); return await signDay(page, 5, 3) })())
  await deleteSaved(page, '2026-07-18', LV)
  say('B3 leave still there?', await rec(page, LV))
  await go(page, 'editsched'); await sleep(400)
  say('B3 face', fs(await face(page))); say('B3 crowd (45)', await crowd(page)); say('B3 credits (still no HO for Ranger)', crS(await cr(page)))
  await shot(page, 'S11-B1-after-remove')
  await replay(page, 'B4')
  await go(page, 'editsched'); say('B5 AL1', await pubSat(page, 5)); await closeBoard(page)
  say('B5 face', fs(await face(page))); say('B5 credits (Ranger HO restored)', crS(await cr(page)))
  await shot(page, 'S11-B2-al1-credits')
  say('errors B', w.errors)
  await w.browser.close()
}
