// S12 - publish before versus after changing the input's person (desktop, admin)
const C = await import('./aa-C-lib.mjs')
const { world, fileInput, shot, sleep, go, pubSat, closeBoard, editWeek, face, fs, cr, crS, undoRedo, reload, signDay, changePerson, pidOf, rec, oilOf } = C
const say = (k, v) => console.log(k, '::', typeof v === 'string' ? v : JSON.stringify(v))
const RMK = 'S12 duty'
const tail = async (page) => await page.evaluate(r => { const x = window.INPUTS.find(i => i.remarks === r); return x && { person: x.person, oil: x.oil, n: window.INPUTS.filter(i => i.remarks === r).length } }, RMK)
const crowd = page => page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="5"] .oilcount')].map(e => e.innerText.trim()))
const rowWho = page => page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="5"] .pl-row .puck')].map(e => e.innerText.trim()))
async function replay(page, tag) {
  say(`${tag} undo`, await undoRedo(page, 'undo'))
  say(`${tag} after undo`, fs(await face(page))); say(`${tag}   rec`, await tail(page)); say(`${tag}   credits`, crS(await cr(page)))
  say(`${tag} redo`, await undoRedo(page, 'redo'))
  say(`${tag} after redo`, fs(await face(page))); say(`${tag}   rec`, await tail(page)); say(`${tag}   credits`, crS(await cr(page)))
  await reload(page); await go(page, 'editsched'); await sleep(300)
  say(`${tag} after reload`, fs(await face(page))); say(`${tag}   rec`, await tail(page)); say(`${tag}   credits`, crS(await cr(page)))
}
const sat = '2026-07-18'
// ---- A: placeholder/Yes -> issue -> Person = Ranger, No -> replay -> AL
{
  console.log('=== A: placeholder Yes, issue, Person=Ranger answer No, AL')
  const w = await world(); const { page } = w
  const p = await pidOf(page, 'Ranger')
  await fileInput(page, { iso: sat, kind: 'Duty', person: 'allavail', s: '09:00', e: '12:00', rmk: RMK, oil: 'yes' })
  await go(page, 'editsched'); await pubSat(page, 5); await closeBoard(page)
  say('A1 issued', fs(await face(page))); say('A1 credits', crS(await cr(page)))
  await editWeek(page); await signDay(page, 5, 3)
  const r = await changePerson(page, sat, RMK, p, 'no')
  say('A2 editor asked the OIL question again', r)
  say('A2 record', await tail(page))
  await go(page, 'editsched'); await sleep(400)
  say('A2 face', fs(await face(page))); say('A2 week row people', await rowWho(page)); say('A2 credits (issued: all HO)', crS(await cr(page)))
  await shot(page, 'S12-A1-after-person-change')
  await replay(page, 'A3')
  await go(page, 'editsched'); say('A4 AL1', await pubSat(page, 5)); await closeBoard(page)
  say('A4 face', fs(await face(page))); say('A4 credits (named Ranger/No: Ranger 0; other three 0 too - crowd gone)', crS(await cr(page)))
  await shot(page, 'S12-A2-al1')
  say('errors A', w.errors); await w.browser.close()
}
// ---- B: named Ranger/No -> issue -> Person = ALL AVAIL, Yes -> replay -> AL
{
  console.log('=== B: Ranger No, issue, Person=ALL AVAIL answer Yes, AL')
  const w = await world(); const { page } = w
  const p = await pidOf(page, 'Ranger')
  await fileInput(page, { iso: sat, kind: 'Duty', person: p, s: '09:00', e: '12:00', rmk: RMK, oil: 'no' })
  say('B0 record', await tail(page))
  await go(page, 'editsched'); await pubSat(page, 5); await closeBoard(page)
  say('B1 issued', fs(await face(page))); say('B1 credits (zero)', crS(await cr(page)))
  await editWeek(page); await signDay(page, 5, 3)
  const r = await changePerson(page, sat, RMK, 'allavail', 'yes')
  say('B2 editor asked again', r); say('B2 record', await tail(page))
  await go(page, 'editsched'); await sleep(400)
  say('B2 face', fs(await face(page))); say('B2 week row people', await rowWho(page)); say('B2 credits (issued: zero)', crS(await cr(page)))
  await shot(page, 'S12-B1-after-person-change')
  await replay(page, 'B3')
  await go(page, 'editsched'); say('B4 AL1', await pubSat(page, 5)); await closeBoard(page)
  say('B4 face', fs(await face(page))); say('B4 credits (HO each, Ranger too)', crS(await cr(page)))
  await shot(page, 'S12-B2-al1')
  say('errors B', w.errors); await w.browser.close()
}
// ---- C: conversion before Original: placeholder Yes -> Person Ranger No -> issue
{
  console.log('=== C: conversion before Original')
  const w = await world(); const { page } = w
  const p = await pidOf(page, 'Ranger')
  await fileInput(page, { iso: sat, kind: 'Duty', person: 'allavail', s: '09:00', e: '12:00', rmk: RMK, oil: 'yes' })
  const r = await changePerson(page, sat, RMK, p, 'no')
  say('C1 asked again', r); say('C1 record', await tail(page))
  await go(page, 'editsched'); say('C1 week row people', await rowWho(page))
  await pubSat(page, 5); await closeBoard(page)
  say('C2 issued', fs(await face(page))); say('C2 credits (zero)', crS(await cr(page)))
  say('errors C', w.errors); await w.browser.close()
}
