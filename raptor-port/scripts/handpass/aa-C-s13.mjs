// S13 - publication first, then filing, moving and deleting (desktop, admin) - a placeholder Event
const C = await import('./aa-C-lib.mjs')
const { world, fileInput, shot, sleep, go, pubSat, closeBoard, editWeek, face, fs, cr, crS, undoRedo, reload, signDay, moveBar, deleteSaved, answerOil, rec, pend } = C
const say = (k, v) => console.log(k, '::', typeof v === 'string' ? v : JSON.stringify(v))
const RMK = 'S13 event'
const SAT = '2026-07-18', SUN = '2026-07-19'
const recs = page => page.evaluate(r => window.INPUTS.filter(i => i.remarks === r).map(x => ({ iid: x.iid, person: x.person, type: x.type, date: x.date, oil: x.oil })), RMK)
async function both(page, tag) {
  say(`${tag} Sat face`, fs(await face(page, 5))); say(`${tag} Sun face`, fs(await face(page, 6)))
  say(`${tag} credits Sat`, crS(await cr(page, SAT))); say(`${tag} credits Sun`, crS(await cr(page, SUN)))
}
async function replay(page, tag) {
  say(`${tag} undo`, await undoRedo(page, 'undo')); await both(page, `${tag} after undo`); say(`${tag}   rec`, await recs(page))
  say(`${tag} redo`, await undoRedo(page, 'redo')); await both(page, `${tag} after redo`); say(`${tag}   rec`, await recs(page))
  await reload(page); await go(page, 'editsched'); await sleep(300)
  await both(page, `${tag} after reload`); say(`${tag}   rec`, await recs(page))
}
{
  const w = await world(); const { page } = w
  await go(page, 'editsched'); await pubSat(page, 5); await closeBoard(page)
  say('1 empty Saturday issued', fs(await face(page, 5))); say('1 credits', crS(await cr(page, SAT)))
  await go(page, 'editsched'); await editWeek(page); await signDay(page, 5, 3)
  const r = await fileInput(page, { iso: SAT, kind: 'Event', person: 'allavail', s: '09:00', e: '12:00', rmk: RMK, oil: 'yes' })
  say('2 filed Event ALL AVAIL on Saturday; OIL question', r); say('2 rec', await recs(page))
  await go(page, 'editsched'); await sleep(400)
  await both(page, '2')
  await shot(page, 'S13-01-filed-after-issue')
  await replay(page, '3')
  await go(page, 'editsched'); say('4 AL1 Saturday', await pubSat(page, 5)); await closeBoard(page)
  await both(page, '4'); await shot(page, 'S13-02-al1-credits')
  // move to Sunday
  const iid = (await recs(page))[0].iid
  say('5 move to Sunday', await moveBar(page, iid, SUN))
  say('5 rec (before any answer)', await recs(page))
  const q = await answerOil(page, null); say('5 an OIL question is showing after the move?', q)
  await shot(page, 'S13-03a-oil-question-after-move')
  say('5 answer Yes for Sunday', await answerOil(page, 'yes')); await C.closeWins(page)
  say('5 rec (after answer)', await recs(page))
  await go(page, 'editsched'); await sleep(400); await both(page, '5')
  await shot(page, 'S13-03-moved-to-sunday')
  await replay(page, '6')
  // amend Saturday, issue Sunday
  await go(page, 'editsched'); say('7 AL2 Saturday', await pubSat(page, 5)); await closeBoard(page)
  await both(page, '7 after Saturday AL (Sunday not issued: zero expected both)')
  say('7 Sunday publish', await (async () => { await go(page, 'editsched'); const p = await pubSat(page, 6); await closeBoard(page); return p })())
  await both(page, '7 after Sunday issued (Sun HO expected)'); await shot(page, 'S13-04-sunday-issued')
  // delete
  await deleteSaved(page, SUN, RMK)
  say('8 recs after delete', await recs(page))
  await go(page, 'editsched'); await sleep(300); await both(page, '8')
  await replay(page, '9')
  await go(page, 'editsched'); say('10 AL1 Sunday', await pubSat(page, 6)); await closeBoard(page)
  await both(page, '10 (Sun zero expected)'); await shot(page, 'S13-05-final')
  say('errors', w.errors); await w.browser.close()
}
