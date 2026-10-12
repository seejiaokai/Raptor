// B8 follow-up — Tally onto a Personal row's "+ add"; the replace and its undo; where a 3-day input is drawn
import { launch, openWorld, fileInput, shot, rowIdx, inputOf, toastMark, toastsSince, undoRedo, saveJson, loadJson, errs,
  toWeek, openBoard, centre, boardRowEl, boardRowNames, boardLines, weekLines, drag2, rosterPuckOf } from './or-B-lib2.mjs'
const R = {}
const say = (k, v) => { R[k] = v; console.log(k, typeof v === 'string' ? v : JSON.stringify(v)) }
const toastNow = p => p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? t.innerText + ' [op ' + t.style.opacity + ']' : '' })
const waitQuiet = async p => { for (let i = 0; i < 30; i++) { const o = await p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? t.style.opacity : '0' }); if (o !== '1') return; await p.waitForTimeout(400) } }
const browser = await launch()
const { page: p } = await openWorld(browser)
const DI = 3
const pe = (await fileInput(p, { type: 'Personal', person: 'Ranger', from: '2026-07-16', to: '2026-07-16', timed: ['19:00', '20:00'] }))[0].iid
const t3 = (await fileInput(p, { type: 'Training', person: 'Ranger', from: '2026-07-13', to: '2026-07-15', timed: ['17:00', '18:00'] }))[0].iid
say('t3 rows Mon/Tue/Wed', [await rowIdx(p, 0, t3), await rowIdx(p, 1, t3), await rowIdx(p, 2, t3)])
say('t3 accepted?', await p.evaluate(id => { const x = window.INPUTS.find(i => i.iid === id); return JSON.stringify({ acc: x.acc, endDate: x.endDate, date: x.date }) }, t3))
await openBoard(p, 1); say('Tue lines', await boardLines(p, 1)); await p.locator('#schedBoard .pinp').first().evaluate(e => e.scrollIntoView({ block: 'center' })); await shot(p, 's08b-0-tue-lines')
await openBoard(p, 2); say('Wed lines (Training only)', (await boardLines(p, 2)).filter(l => /Training/.test(l)))
await openBoard(p, DI)
const ri = await rowIdx(p, DI, pe)
say('pe row', await boardRowNames(p, DI, ri))
/* i: Tally onto the + add zone of the Personal row */
let row = boardRowEl(p, DI, ri); await centre(row); await p.waitForTimeout(300)
await waitQuiet(p)
let m = await toastMark(p)
const addz = row.locator('.addz').first()
say('addz count', await addz.count())
await drag2(p, await rosterPuckOf(p, '#sbRoster', 'Tally'), addz)
say('i toasts', await toastsSince(p, m)); say('i toast now', await toastNow(p))
say('i input', (await inputOf(p, pe)).people); say('i row', (await boardRowNames(p, DI, ri)).names)
await shot(p, 's08b-1-tally-on-addz')
/* ii: Tally onto the puck (the replace) and its undo / redo */
await waitQuiet(p)
row = boardRowEl(p, DI, ri); await centre(row); await p.waitForTimeout(300)
m = await toastMark(p)
await drag2(p, await rosterPuckOf(p, '#sbRoster', 'Tally'), row.locator('.puck').first())
say('ii toasts', await toastsSince(p, m)); say('ii toast now', await toastNow(p))
say('ii input', (await inputOf(p, pe)).people); say('ii row', (await boardRowNames(p, DI, ri)).names)
await shot(p, 's08b-2-tally-on-puck')
await undoRedo(p, 'undo'); say('ii undo toast', await toastNow(p)); say('ii after undo', (await inputOf(p, pe)).people)
await undoRedo(p, 'redo'); say('ii redo toast', await toastNow(p)); say('ii after redo', (await inputOf(p, pe)).people)
/* iii: and a seat -> the Personal row's puck (swap path) */
say('errs', errs)
const all = loadJson('docs/handpass/parts/or-B.json'); all.B8b = R; saveJson('docs/handpass/parts/or-B.json', all)
await browser.close()
