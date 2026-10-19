console.log('B s11 v1 (the evening before, phone: Saturday wave built through the board)')
import { launch, open, sleep, shot, elShot, tap, tapFixed, rec, bfld, inState, wk, ceState, model, finish } from './lib.mjs'
const b = await launch()
const { ctx, p } = await open(b)
await p.evaluate(() => window.go('editsched')); await sleep(800)
await p.evaluate(() => window.openScheduler(5)); await p.waitForSelector('#schedBoard'); await sleep(900)
const leave = async () => { await tap(p, p.locator('#sbDay'), { block: 'start' }); await sleep(400) }
const typeBoard = async (f, txt) => { const el = bfld(p, f); await tap(p, el); await p.keyboard.press('Control+A'); await p.keyboard.type(txt); await leave() }
await tap(p, p.locator('#sbBoard [data-wvadd]').first(), { block: 'nearest' }); await sleep(400)
{ const t = p.getByText('Flying wave', { exact: true }).first(); const bb = await t.boundingBox(); await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(800) }
await typeBoard('ff:5.0.0.cs', 'VL'); await typeBoard('ff:5.0.0.to', '0130'); await typeBoard('ff:5.0.0.ld', '0300')
const m0 = await model(p, 5, 0, 0)
rec('S11-fix', 'built a Saturday wave through the board (+ Wave, Flying wave), typed VL, TO 01:30, LD 03:00', 'VL / 01:30 / 03:00', m0, m0.cs === 'VL' && m0.to === '01:30' && m0.ld === '03:00' ? 'PASS' : 'FAIL')
/* (a) tap R: placed 22:30 */
const R = bfld(p, 'ff:5.0.0.rl')
await tap(p, R)
const pl = await inState(R)
rec('S11a', 'board: tap R on a Saturday TO 01:30', 'placed 22:30 (the evening before), highlighted', pl, pl.value === '22:30' ? 'PASS' : 'FAIL', await shot(p, 'B11a-placed'))
await leave()
const m1 = await model(p, 5, 0, 0)
const boardNote = await p.evaluate(() => { const els = [...document.querySelectorAll('#sbBoard *')].filter(e => e.children.length === 0 && /prev day/i.test(e.textContent)); return els.map(e => e.className + ': ' + e.textContent.trim().slice(0, 60)) })
rec('S11a2', 'leave the box; the board', 'R saved 22:30; "(prev day)" shown on the board', { rl: m1.rl, prevDayText: boardNote }, m1.rl === '22:30' && boardNote.length ? 'PASS' : 'FAIL', await shot(p, 'B11a2-board-prevday'))
/* week header */
await tap(p, p.locator('#sbDone'), { block: 'nearest' }); await sleep(800)
const hdr = await p.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="5"]'); const els = [...d.querySelectorAll('*')].filter(e => /prev day/i.test(e.textContent) && e.children.length < 3); return els.slice(0, 4).map(e => e.tagName + '.' + e.className + ': ' + e.textContent.replace(/\s+/g, ' ').trim().slice(0, 100)) })
rec('S11a3', 'Edit Schedule week, Saturday wave header', '"In-time / Rally 22:30 (prev day)" or similar', hdr, hdr.length ? 'RECORD' : 'FAIL', await elShot(p, '#eWeek .day[data-day="5"] .go', 'B11a3-week-prevday'))
const satWarn = async () => { const T = '#eWeek .day[data-day="5"]'; for (let i = 0; i < 3; i++) { const t = await p.evaluate(s => document.querySelector(s + ' .dwbox')?.innerText || '', T); if (t.split('\n').length > 3) return t; await tap(p, p.locator(`${T} .daywarn`)); await sleep(300) } return '' }
const w1 = await satWarn()
const fri = await p.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="4"] .dwbox')].map(e => e.innerText))
rec('S11a4', 'warnings of Saturday and Friday after R 22:30 (crewed man, no Friday flying)', 'RECORD: long-day / crew-rest wording with a prior-day report', { sat: w1.split('\n').filter(l => !/^(✕|▲|▼)$/.test(l)), fri }, 'RECORD')
await ctx.close()
/* (b) R 09:00 typed, TO 12:00, then TO changed to 08:30 */
{
  const { ctx: c2, p: q } = await open(b)
  await q.evaluate(() => window.go('editsched')); await sleep(800)
  await q.evaluate(() => window.openScheduler(5)); await q.waitForSelector('#schedBoard'); await sleep(900)
  const lv = async () => { await tap(q, q.locator('#sbDay'), { block: 'start' }); await sleep(400) }
  const tb = async (f, txt) => { const el = bfld(q, f); await tap(q, el); await q.keyboard.press('Control+A'); await q.keyboard.type(txt); await lv() }
  await tap(q, q.locator('#sbBoard [data-wvadd]').first(), { block: 'nearest' }); await sleep(400)
  { const t = q.getByText('Flying wave', { exact: true }).first(); const bb = await t.boundingBox(); await q.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(800) }
  await tb('ff:5.0.0.cs', 'VL'); await tb('ff:5.0.0.to', '1200'); await tb('ff:5.0.0.ld', '1330'); await tb('ff:5.0.0.rl', '0900')
  const before = await model(q, 5, 0, 0)
  await tb('ff:5.0.0.to', '0830')
  const after = await model(q, 5, 0, 0)
  const txt = await q.evaluate(() => [...document.querySelectorAll('#sbBoard *')].filter(e => e.children.length === 0 && /prev day/i.test(e.textContent)).map(e => e.textContent.trim().slice(0, 60)))
  const toast = await q.evaluate(() => [...document.querySelectorAll('.toast,#toast,[class*=toast]')].filter(e => e.offsetParent !== null && e.innerText.trim()).map(e => e.innerText.slice(0, 100)))
  rec('S11b', 'Saturday R 09:00, TO 12:00 then TO changed to 08:30', 'RECORD: R 09:00 now reads the day before; header; toast (brief gets a toast, R gets none)', { before, after, prevDayText: txt, toast }, 'RECORD', await shot(q, 'B11b-to-moved-earlier'))
  await tap(q, q.locator('#sbDone'), { block: 'nearest' }); await sleep(800)
  const hd2 = await q.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="5"]'); return [...d.querySelectorAll('*')].filter(e => /prev day/i.test(e.textContent) && e.children.length < 3).slice(0, 3).map(e => e.textContent.replace(/\s+/g, ' ').trim().slice(0, 100)) })
  rec('S11b2', 'then the week header for the same Saturday wave', 'RECORD', hd2, 'RECORD', await elShot(q, '#eWeek .day[data-day="5"] .go', 'B11b2-week'))
  await c2.close()
}
await b.close()
await finish('s11')
