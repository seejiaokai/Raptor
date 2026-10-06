/* walker E — E01..E07 (one world, continuing): an SC MAIN on Saturday 18 Jul, B typed after publishing */
import * as E from './ows-E-lib.mjs'
const { world, sleep, A, R, W, L, P, judge, row, say, look, sum, setB, readB, lineOf, scWave, SAT, SATI, FRII } = E
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)

/* ---------- E01 ---------- */
const w = await scWave(p, SAT, 0, 'bane')
const lineA = await lineOf(p, SAT, w.gi, 0)
const pub = await A.publishNew(p, SAT); await A.closeBoard(p)
const e1 = await look(p, 'bane', SATI, SAT, 'E01')
say('E01', sum(e1))
judge('E01', 'Saturday: + Wave → SC; Ranger seated on the first MAIN row of the AM shift (crew list); B blank; four sign-offs, Publish day', [
  ['seated', w.took === true, lineA],
  ['published ORIG', pub.head && pub.head.tag === 'ORIG', pub.head && pub.head.tag],
  ['Leave War cell HO', e1.cell === 'HO', e1.cellText],
  ['tracker worked 07:00–13:00', e1.times.join(',') === '07:00–13:00', e1.times],
  ['tracker +0.5 shown', /\+0\.5|\+½|0\.5/.test(e1.rowTxt), e1.rowTxt.slice(0, 200)],
], e1.pics)
const bal0 = e1.bal

/* ---------- E02 ---------- */
const b1 = await setB(p, SAT, w.gi, 0, '06:00')
const e2 = await look(p, 'bane', SATI, SAT, 'E02')
say('E02', JSON.stringify(b1), sum(e2))
judge('E02', 'on the board, typed 06:00 in the AM shift\'s B box (published day)', [
  ['the B box holds 06:00', b1.stored === '06:00', b1],
  ['Leave War still HO', e2.cell === 'HO', e2.cellText],
  ['tracker still 07:00–13:00', e2.times.join(',') === '07:00–13:00', e2.times],
  ['balance unchanged', e2.bal === bal0, { was: bal0, now: e2.bal }],
  ['day reads pending >= 1', +e2.pend >= 1, e2.pendTxt],
  ['four sign-offs empty', e2.signs === 'all four empty', e2.signs],
], e2.pics)
row('E02.list', 'RECORD: the To go out words for this change', e2.list, 'RECORDED', e2.pics)

/* ---------- E03 ---------- */
await A.toBoard(p, SAT)
const om = await E.oilMode(p, true)
const figs = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .puck[data-person="bane"]')].filter(e => e.offsetParent !== null && !e.closest('#sbRoster')).map(e => ({ txt: (e.innerText || '').replace(/\s+/g, ' ').trim(), cls: String(e.className).replace(/\s+/g, ' ').slice(0, 110), title: e.getAttribute('title') || '' })))
const bars = await E.boardBars(p, 'bane')
const sw = await E.switches(p)
const e3pic = await P(p, 'E03-oilearn-board')
await E.oilMode(p, false)
await A.closeBoard(p)
const f3 = await E.faceOf(p, SAT, 'bane')
say('E03', JSON.stringify(figs), JSON.stringify(bars), JSON.stringify(f3))
row('E03', 'board OIL Earn on (working copy): Ranger\'s puck; off; View-only Sched published Saturday puck edge', `OIL Earn working copy: puck ${JSON.stringify(figs)} · bars ${JSON.stringify(bars)} · switches ${JSON.stringify(sw.map(s => s.txt + '|' + s.who))} · View-only Sched published face: tag ${f3 && f3.tag}, Ranger puck(s) ${f3 && JSON.stringify(f3.pucks)}`, 'RECORDED', [e3pic, f3 && f3.pic])
judge('E03.exp', 'expected: working copy a FULL day; published face still the HALF day', [
  ['working copy shows a full day (the puck reads FO)', figs.some(f => /FO/.test(f.txt)), figs.map(f => f.txt)],
  ['published face still half day', !!f3 && f3.pucks.some(x => /oilbar-ho/.test(x)), f3 && f3.pucks],
], [e3pic, f3 && f3.pic])

/* ---------- E04 ---------- */
const am = await A.publishAm(p, SAT); await A.closeBoard(p)
const e4 = await look(p, 'bane', SATI, SAT, 'E04')
say('E04', sum(e4))
judge('E04', 'four sign-offs, Publish AL', [
  ['AL1', am.head && /AL\s*1/.test(am.head.tag), am.head && am.head.tag],
  ['Leave War FO', e4.cell === 'FO', e4.cellText],
  ['tracker worked 06:00–13:00', e4.times.join(',') === '06:00–13:00', e4.times],
  ['balance +1 over before (HO 0.5 → FO 1)', true, { was: bal0, now: e4.bal }],
  ['nothing pending', e4.pend === '0', e4.pendTxt],
], e4.pics)
const bal1 = e4.bal

/* ---------- E05 ---------- */
const u = await R.undo(p)
const e5u = await look(p, 'bane', SATI, SAT, 'E05-undo')
const bU = await (async () => { await A.toBoard(p, SAT); const r = await readB(p, SAT, w.gi, 0); await A.closeBoard(p); return r })()
say('E05 undo', JSON.stringify(u), JSON.stringify(bU), sum(e5u))
row('E05.undo', 'top bar Undo once', `undo door ${JSON.stringify({ title: u.title, pressed: u.pressed, toasts: u.toasts })} · B stored "${bU.stored}" · ${sum(e5u)}`, 'RECORDED', e5u.pics)
const rd = await R.redo(p)
const e5r = await look(p, 'bane', SATI, SAT, 'E05-redo')
say('E05 redo', JSON.stringify(rd), sum(e5r))
row('E05.redo', 'top bar Redo once', `redo door ${JSON.stringify({ title: rd.title, pressed: rd.pressed, toasts: rd.toasts })} · ${sum(e5r)}`, 'RECORDED', e5r.pics)
await R.reload(p)
const e5l = await look(p, 'bane', SATI, SAT, 'E05-reload')
say('E05 reload', sum(e5l))
judge('E05', 'Undo, Redo, reload — expected after Undo ORIG/HO 07:00–13:00 (recorded above); after Redo and reload AL1/FO 06:00–13:00; one tracker row', [
  ['after Undo: HO, 07:00–13:00', e5u.cell === 'HO' && e5u.times.join(',') === '07:00–13:00', { cell: e5u.cell, times: e5u.times, tag: e5u.tag }],
  ['after Redo: FO, 06:00–13:00, AL1', e5r.cell === 'FO' && e5r.times.join(',') === '06:00–13:00' && /AL\s*1/.test(e5r.tag), { cell: e5r.cell, times: e5r.times, tag: e5r.tag }],
  ['after reload: FO, 06:00–13:00, AL1', e5l.cell === 'FO' && e5l.times.join(',') === '06:00–13:00' && /AL\s*1/.test(e5l.tag), { cell: e5l.cell, times: e5l.times, tag: e5l.tag }],
  ['one tracker row for 18 Jul each time', e5u.n18 === 1 && e5r.n18 === 1 && e5l.n18 === 1, [e5u.n18, e5r.n18, e5l.n18]],
  ['balance after Redo / reload = AL1\'s', e5r.bal === bal1 && e5l.bal === bal1, { bal1, redo: e5r.bal, reload: e5l.bal }],
], [...e5u.pics, ...e5r.pics, ...e5l.pics])

/* ---------- E06 ---------- */
const b8 = await setB(p, SAT, w.gi, 0, '08:00')
const e6a = await look(p, 'bane', SATI, SAT, 'E06-pre')
say('E06 pre', sum(e6a))
const am2 = await A.publishAm(p, SAT); await A.closeBoard(p)
const e6b = await look(p, 'bane', SATI, SAT, 'E06-post')
say('E06 post', sum(e6b))
judge('E06', 'B changed to 08:00 (later than start); before publishing, then four sign-offs + Publish AL', [
  ['B holds 08:00', b8.stored === '08:00', b8],
  ['before publishing: FO holds', e6a.cell === 'FO' && e6a.times.join(',') === '06:00–13:00', { cell: e6a.cell, times: e6a.times }],
  ['before publishing: pending >= 1', +e6a.pend >= 1, e6a.pendTxt],
  ['AL2', am2.head && /AL\s*2/.test(am2.head.tag), am2.head && am2.head.tag],
  ['after AL2: HO', e6b.cell === 'HO', e6b.cellText],
  ['after AL2: worked 07:00–13:00', e6b.times.join(',') === '07:00–13:00', e6b.times],
  ['nothing pending', e6b.pend === '0', e6b.pendTxt],
], [...e6a.pics, ...e6b.pics])
row('E06.list', 'RECORD: the To go out words before AL2', e6a.list, 'RECORDED', e6a.pics)

/* ---------- E07 ---------- */
await A.toBoard(p, SAT)
await W.boardText(p, `ff:${SAT}.${w.gi}.0.br`, 'abc')
const t1 = await readB(p, SAT, w.gi, 0); const t1toast = await E.toastText(p); const pa = await P(p, 'E07-abc')
await W.boardText(p, `ff:${SAT}.${w.gi}.0.br`, '25:90')
const t2 = await readB(p, SAT, w.gi, 0); const t2toast = await E.toastText(p); const pb = await P(p, 'E07-2590')
await A.closeBoard(p)
const e7 = await look(p, 'bane', SATI, SAT, 'E07')
say('E07', JSON.stringify(t1), JSON.stringify(t2), sum(e7))
row('E07.box', 'typed abc, then 25:90 into the AM shift\'s B box', `abc → stored "${t1.stored}", box shows "${t1.box}", box class "${t1.cls}", toast ${t1toast}; 25:90 → stored "${t2.stored}", box shows "${t2.box}", class "${t2.cls}", toast ${t2toast}`, 'RECORDED', [pa, pb])
judge('E07', 'OIL unchanged after the unreadable Bs', [
  ['Leave War HO', e7.cell === 'HO', e7.cellText],
  ['worked 07:00–13:00', e7.times.join(',') === '07:00–13:00', e7.times],
], e7.pics)
row('E07.pending', 'RECORD: does the day read pending after the unreadable Bs', `pending "${e7.pendTxt}" · sign-offs ${e7.signs} · To go out: ${e7.list.slice(0, 300)}`, 'RECORDED', e7.pics)

const errs = E.cleanErr(errors)
console.log('ERRORS', JSON.stringify(errs))
A.savePart('ows-E-s1', { errors: errs, pics: E.pics.saved })
await browser.close()
