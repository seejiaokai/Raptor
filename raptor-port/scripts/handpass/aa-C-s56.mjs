// S56 - the latest issued AL (or EOD) remains the credit authority (desktop, admin). EOD: see report - no control in this build.
const C = await import('./aa-C-lib.mjs')
const { world, shot, sleep, go, fileInput, pubSat, closeBoard, editWeek, face, fs, cr, crS, undoRedo, reload, signDay, reanswer, changeEnd, oilOf, lookAt, pvBar, pvTap, rec } = C
const say = (k, v) => console.log(k, '::', typeof v === 'string' ? v : JSON.stringify(v))
const SAT = '2026-07-18', RMK = 'S56 duty'
const w = await world(); const { page } = w
const recs = async () => await page.evaluate(r => { const x = window.INPUTS.find(i => i.remarks === r); return x && { s: x.s, e: x.e, oil: x.oil, person: x.person } }, RMK)
await fileInput(page, { iso: SAT, kind: 'Duty', person: 'allavail', s: '09:00', e: '12:00', rmk: RMK, oil: 'yes' })
await go(page, 'editsched'); await pubSat(page, 5); await closeBoard(page)
say('1 Original', fs(await face(page, 5))); say('1 credits (HO)', crS(await cr(page, SAT)))
await reload(page); await go(page, 'editsched'); say('1 reload credits', crS(await cr(page, SAT)))
// -> No, AL1
await go(page, 'editsched'); await editWeek(page); await signDay(page, 5, 3)
await reanswer(page, SAT, RMK, 'no'); say('2 rec', await recs())
say('2 undo', await undoRedo(page, 'undo')); say('2 after undo', fs(await face(page, 5))); say('2 redo', await undoRedo(page, 'redo')); say('2 after redo', fs(await face(page, 5)))
await go(page, 'editsched'); say('2 AL1', await pubSat(page, 5)); await closeBoard(page)
say('2 AL1 face', fs(await face(page, 5))); say('2 credits (0)', crS(await cr(page, SAT)))
await reload(page); await go(page, 'editsched'); say('2 reload credits', crS(await cr(page, SAT)))
// -> Yes, extend to 16:00, AL2 (stands in for the EOD)
await go(page, 'editsched'); await editWeek(page); await signDay(page, 5, 3)
say('3 extend to 16:00 and answer Yes', await changeEnd(page, SAT, RMK, '16:00', 'yes'))
say('3 rec', await recs())
if ((await recs()).oil && (await recs()).oil[SAT] !== 1) { say('3 re-answer Yes', 'oil is ' + JSON.stringify((await recs()).oil)); await reanswer(page, SAT, RMK, 'yes'); say('3 rec', await recs()) }
say('3 undo', await undoRedo(page, 'undo')); say('3 after undo', fs(await face(page, 5)), ); say('3 rec', await recs()); say('3 redo', await undoRedo(page, 'redo')); say('3 after redo', fs(await face(page, 5))); say('3 rec', await recs())
await go(page, 'editsched'); say('3 AL2', await pubSat(page, 5)); await closeBoard(page)
say('3 AL2 face', fs(await face(page, 5))); say('3 credits (FO)', crS(await cr(page, SAT)))
await reload(page); await go(page, 'editsched'); say('3 reload credits', crS(await cr(page, SAT)))
await shot(page, 'S56-01-al2-credits')
// previews of earlier versions
await go(page, 'editsched'); await editWeek(page)
for (const v of [/Original/, /AL1/]) {
  say('4 look ' + v, await lookAt(page, 5, v)); say('4 bar', (await pvBar(page, 5) || {}).text)
  await shot(page, 'S56-preview-' + String(v).replace(/\W/g, ''))
  say('4 credits while previewing', crS(await cr(page, SAT)))
  await go(page, 'editsched'); await editWeek(page)
}
await go(page, 'viewsched'); await sleep(500)
say('4 view-only Sat', await page.evaluate(() => { const d = document.querySelector('#vWeek .day[data-day="5"]'); return { tag: (d.querySelector('.verchip') || {}).innerText, picker: [...d.querySelectorAll('select option')].map(o => (o.selected ? '*' : '') + o.text) } }))
say('4 credits after previews', crS(await cr(page, SAT)))
say('errors', w.errors); await w.browser.close()
