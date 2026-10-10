// S10 - publish before versus after changing the filer's answer (desktop, admin filer)
const C = await import('./aa-C-lib.mjs')
const { world, fileInput, shot, sleep, go, pubSat, closeBoard, editWeek, face, fs, cr, crS, undoRedo, reload, signDay, reanswer, oilOf, pend, pendListText } = C
const say = (k, v) => console.log(k, '::', typeof v === 'string' ? v : JSON.stringify(v))
const RMK = 'S10 duty'
async function signPublished(page) { await editWeek(page); return await signDay(page, 5, 3) }
async function replay(page, tag, label) {
  say(`${tag} undo`, await undoRedo(page, 'undo'))
  say(`${tag} after undo`, fs(await face(page))); say(`${tag}   credits`, crS(await cr(page))); say(`${tag}   oil`, await oilOf(page, RMK))
  say(`${tag} redo`, await undoRedo(page, 'redo'))
  say(`${tag} after redo`, fs(await face(page))); say(`${tag}   credits`, crS(await cr(page))); say(`${tag}   oil`, await oilOf(page, RMK))
  await reload(page); await go(page, 'editsched'); await sleep(300)
  say(`${tag} after reload`, fs(await face(page))); say(`${tag}   credits`, crS(await cr(page))); say(`${tag}   oil`, await oilOf(page, RMK))
}
// ---------- order A: file(Yes) -> issue -> No -> replay -> AL
{
  console.log('=== ORDER A: file Yes, issue, No, replay, AL')
  const w = await world(); const { page } = w
  await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', s: '09:00', e: '12:00', rmk: RMK, oil: 'yes' })
  say('A1 before first publication: credits (expect zero)', crS(await cr(page)))
  await go(page, 'editsched')
  await pubSat(page, 5); await closeBoard(page)
  say('A2 issued face', fs(await face(page))); say('A2 credits', crS(await cr(page)))
  say('A2 sign the published day', await signPublished(page))
  say('A2 face signed', fs(await face(page)))
  await shot(page, 'S10-A1-signed-after-issue')
  await reanswer(page, '2026-07-18', RMK, 'no')
  say('A3 oil', await oilOf(page, RMK))
  say('A3 face after No', fs(await face(page))); say('A3 credits (issued money fixed: HO expected)', crS(await cr(page)))
  say('A3 pending list', await pendListText(page))
  await shot(page, 'S10-A2-after-no')
  await replay(page, 'A4', 'No')
  await go(page, 'editsched'); await shot(page, 'S10-A3-after-replay')
  // after the replay the answer is No again (redo, reload) - issue the AL
  await go(page, 'editsched'); say('A5 AL1', await pubSat(page, 5)); await closeBoard(page)
  say('A5 face', fs(await face(page))); say('A5 credits (zero expected)', crS(await cr(page)))
  await shot(page, 'S10-A4-al1-credits')
  say('errors A', w.errors)
  await w.browser.close()
}
// ---------- order B: file(Yes) -> No -> replay -> issue -> Yes -> replay -> AL
{
  console.log('=== ORDER B: file Yes, No, replay, issue, Yes, replay, AL')
  const w = await world(); const { page } = w
  await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', s: '09:00', e: '12:00', rmk: RMK, oil: 'yes' })
  await reanswer(page, '2026-07-18', RMK, 'no')
  say('B1 oil', await oilOf(page, RMK))
  await replay(page, 'B1', 'No')
  await go(page, 'editsched'); await pubSat(page, 5); await closeBoard(page)
  say('B2 issued face', fs(await face(page))); say('B2 credits (No -> zero expected)', crS(await cr(page)))
  say('B2 sign', await signPublished(page))
  await reanswer(page, '2026-07-18', RMK, 'yes')
  say('B3 oil', await oilOf(page, RMK))
  say('B3 face after Yes', fs(await face(page))); say('B3 credits (issued fixed: zero)', crS(await cr(page)))
  await shot(page, 'S10-B1-after-yes')
  await replay(page, 'B4', 'Yes')
  await go(page, 'editsched'); say('B5 AL1', await pubSat(page, 5)); await closeBoard(page)
  say('B5 face', fs(await face(page))); say('B5 credits (HO expected)', crS(await cr(page)))
  await shot(page, 'S10-B2-al1-credits')
  say('errors B', w.errors)
  await w.browser.close()
}
// ---------- order C: reverse: file No -> issue -> Yes -> AL
{
  console.log('=== ORDER C: file No, issue, Yes, AL')
  const w = await world(); const { page } = w
  await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', s: '09:00', e: '12:00', rmk: RMK, oil: 'no' })
  await go(page, 'editsched'); await pubSat(page, 5); await closeBoard(page)
  say('C1 credits (zero expected)', crS(await cr(page)))
  say('C1 sign', await signPublished(page))
  await reanswer(page, '2026-07-18', RMK, 'yes')
  say('C2 face', fs(await face(page))); say('C2 credits (zero expected)', crS(await cr(page)))
  await go(page, 'editsched'); say('C3 AL1', await pubSat(page, 5)); await closeBoard(page)
  say('C3 face', fs(await face(page))); say('C3 credits (HO expected)', crS(await cr(page)))
  say('errors C', w.errors)
  await w.browser.close()
}
