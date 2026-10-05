/* P2-08 — the "+ In-time / Rally" button (desktop; HP_PHONE=1 phone). RECORDED, not judged. */
import * as S from './stk-TS-lib.mjs'
const { L, W, world, pic, row } = S
const { browser, p, errors } = await world()
await L.go(p, 'editsched')
const clear = async (di, gi) => { for (let i = 0; i < 6; i++) { const n = (await S.weekLines(p, di, gi)).length; if (!n) break; await S.typeLine(p, '#eWeek', `${di}|${gi}|0`, '') } }
await W.showDay(p, 0)
await S.weekBox(p, 'ff:0.0.0.to', '12:00'); await S.weekBox(p, 'ff:0.0.1.to', '13:00')
await clear(0, 0)
const m0 = (await S.readDayModel(p, 0))[0]
console.log('after clear: lines', JSON.stringify(await S.weekLines(p, 0, 0)), 'model intimes', JSON.stringify(m0.intimes), 'to', m0.forms.map(f => f.to + '/' + f.ld))
const lead0 = (await S.logicValText(p)).text
await S.toWeek(p); await W.showDay(p, 0)
async function addWeek() { const b = p.locator('#eWeek .day[data-day="0"] [data-itadd="0|0"]').first(); await b.scrollIntoViewIfNeeded(); await b.click(); await L.sleep(500); const ls = await S.weekLines(p, 0, 0); return ls }
const r1 = await addWeek(); const t1 = r1[r1.length - 1]
console.log('press 1 (week, Logic lead ' + lead0 + '):', JSON.stringify(r1), 'model', JSON.stringify((await S.readDayModel(p, 0))[0].intimes))
await S.picAt(p, '#eWeek [data-itline="0|0|0"]', 'p208-1-first-press-week')
await S.typeLine(p, '#eWeek', t1.at, '08:00H: IN TIME + WX/NOTAMS')
const afterEdit = await S.weekLines(p, 0, 0)
await S.picAt(p, '#eWeek [data-itline="0|0|0"]', 'p208-2-edited-to-0800')
const logicSet = await S.toLogicSet(p, 'reportLead', '2h')
const lead1 = (await S.logicValText(p)).text
await S.picAt(p, '#page-logic [data-lgset="reportLead"]', 'p208-3-logic-lead-2h')
await S.toWeek(p); await W.showDay(p, 0)
const r2 = await addWeek(); const t2 = r2[r2.length - 1]
console.log('press 2 (week, Logic lead ' + lead1 + '):', JSON.stringify(r2))
await S.picAt(p, '#eWeek [data-itline="0|0|0"]', 'p208-4-second-press-week')
// the same press on the Scheduler Board
try { await S.openBoard(p, 0) } catch (e) { console.log('OPEN FAIL', e.message.slice(0,100), JSON.stringify(errors)); await pic(p, 'p208-X-board-fail'); throw e }
console.log('board state', await p.evaluate(() => ({ sbw: document.querySelector('#schedBoard')?.offsetWidth, day: window.SBDAY, page: window.CURPAGE, its: [...document.querySelectorAll('[data-itadd]')].map(e => e.dataset.itadd + (e.closest('#schedBoard') ? 'B' : 'W')).join(',') })))
const bBefore = await S.boardLines(p, 0, 0)
const bb = p.locator('#schedBoard [data-itadd="0|0"]').first(); await bb.scrollIntoViewIfNeeded(); await bb.click(); await L.sleep(600)
const bAfter = await S.boardLines(p, 0, 0); const t3 = bAfter[bAfter.length - 1]
console.log('press 3 (board, lead ' + lead1 + '):', JSON.stringify(bAfter))
await S.picAt(p, '#schedBoard [data-itline="0|0|0"]', 'p208-5-third-press-board')
const asd = await S.waveHead(p, 0, 0)
// a brand-new wave (no lines) on Friday: the very first press there, lead now 2h
await S.addFlyWave(p, 4)
await S.boardBox(p, 'ff:4.0.0.cs', 'ZZ'); await S.boardBox(p, 'ff:4.0.0.to', '14:00')
const fb = p.locator('#schedBoard [data-itadd="4|0"]').first(); await fb.scrollIntoViewIfNeeded(); await fb.click(); await L.sleep(600)
const fLines = await S.boardLines(p, 4, 0)
console.log('press 4 (board, fresh Friday wave, TO 14:00, lead ' + lead1 + '):', JSON.stringify(fLines))
await S.picAt(p, '#schedBoard [data-itline="4|0|0"]', 'p208-6-fresh-wave-board')
row('P2-08', `Monday wave 1, take-offs 12:00 (VL) and 13:00 (RU) typed in the boxes, existing lines cleared; "+ In-time / Rally" pressed on the week (Logic nominal report = ${lead0}), the line retyped 08:00H, Logic's "Nominal report before T/O" changed to 2h (read back ${lead1}), pressed again on the week, then on the Board; then once on a brand-new Friday wave (callsign ZZ, take-off 14:00)`,
  `Press 1 (week, nominal ${lead0}, no lines): "${t1 && t1.text}". After retyping line 1: ${JSON.stringify(afterEdit.map(x => x.text))}. Press 2 (week, nominal ${lead1}, one line 08:00 present): "${t2 && t2.text}" (all lines: ${JSON.stringify(r2.map(x => x.text))}). Press 3 (Board, nominal ${lead1}): "${t3 && t3.text}" (all lines: ${JSON.stringify(bAfter.map(x => x.text))}). Press 4 (Board, fresh Friday wave TO 14:00, nominal ${lead1}): ${JSON.stringify(fLines.map(x => x.text))}`,
  'RECORDED', ['p208-1-first-press-week', 'p208-4-second-press-week', 'p208-5-third-press-board', 'p208-6-fresh-wave-board'])
console.log('errors', errors)
S.savePart('p208', { errors, lead0, lead1, t1, t2, t3, fLines, r2, bAfter, asd })
await browser.close()
