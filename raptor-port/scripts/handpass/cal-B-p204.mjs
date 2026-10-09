/* P2-04 — single-cell entry commits and advances without skipping typed work (D636, D637). */
import * as B from './cal-B-lib.mjs'
const size = process.argv[2] || 'desk'
const w = await B.world(size)
const p = w.page, S = w.key
const pics = [], log = []
const J = d => `2026-07-${String(d).padStart(2, '0')}`
const cellTxt = d => B.txt(B.cell(w, 'req-p', J(d)))
const strip = async () => (await B.tid(w, 'fly-edit-strip').count()) ? B.txt(B.tid(w, 'fly-edit-strip')) : '(no strip)'
const boxVal = async () => w.phone ? ((await B.tid(w, 'fly-edit-touch').count()) ? B.txt(B.tid(w, 'fly-edit-touch')) : '(closed)') : ((await B.tid(w, 'fly-edit-input').count()) ? await B.tid(w, 'fly-edit-input').inputValue() : '(closed)')
const open = async d => { await B.reveal(w, J(d)); await B.press(w, B.cell(w, 'req-p', J(d))); await B.sleep(250) }
const typeStr = async s => { if (!w.phone) { await p.keyboard.type(s); return } for (const ch of s) await B.press(w, B.tid(w, `fly-pad-${ch}`)) }
const enter = async () => { if (w.phone) await B.press(w, B.tid(w, 'fly-pad-next')); else await p.keyboard.press('Enter'); await B.sleep(250) }
const back = async () => { if (w.phone) await B.press(w, B.tid(w, 'fly-pad-prev')); else { await p.keyboard.down('Shift'); await p.keyboard.press('Enter'); await p.keyboard.up('Shift') } await B.sleep(250) }
const done = async () => { if (w.phone) await B.press(w, B.tid(w, 'fly-pad-done')); else await p.keyboard.press('Enter'); await B.sleep(250) }
const esc = async () => { if (w.phone) await B.press(w, B.tid(w, 'fly-pad-done')); else { await p.keyboard.press('Escape') } await B.sleep(250) }
const clickElsewhere = async () => { if (w.phone) await B.touchTap(w, 205, 24); else await p.mouse.click(1200, 135); await B.sleep(300) }
const undoTitle = () => p.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? (b.title || b.getAttribute('aria-label') || '') + (b.disabled ? ' [disabled]' : '') : '' })
const note = (k, v) => { log.push(`${k}: ${v}`); console.log('  >', k, v) }

/* background (seeded): Sat/Sun 18-19 Jul unset weekend already; Mon 20 Jul a PH; Tue 21 Jul no-fly */
await p.evaluate(() => { window.lwSetDayEvent('2026-07-20', 0, 'PH'); window.setFlyDays([{ iso: '2026-07-21', cls: 'nf' }]) })
await B.press(w, B.tid(w, 'month-JUL')); await B.sleep(700)
await B.reveal(w, J(15))
/* 1. open Req P on 13 Jul */
await open(13)
note('1 opened 13 Jul: strip', await strip()); note('box', await boxVal())
pics.push(await B.pic(p, `P2-04-${S}-1-opened`))
/* 2. type 21, Enter */
await typeStr('21'); await enter()
note('2 after 21+Next: cell13', await cellTxt(13)); note('strip', await strip())
/* 3. type baselines 11 into 14, 15, 16 */
await typeStr('11'); await enter(); await typeStr('12'); await enter(); await typeStr('13'); await enter()
note('3 after 11,12,13: cells 14,15,16', [await cellTxt(14), await cellTxt(15), await cellTxt(16)].join(','))
note('strip now (17)', await strip())
/* 4. Next on untouched 17 -> where does it land? 18/19 weekend, 20 PH, 21 NF are excluded */
const u0 = await undoTitle()
await enter()
const stripAfter17 = await strip()
note('4 Next from 17 lands: strip', stripAfter17)
pics.push(await B.pic(p, `P2-04-${S}-2-skip-excluded`))
note('cell17 after untouched Next', await cellTxt(17)); note('undo title unchanged by an untouched Next', String(u0 === await undoTitle()) + ' ' + u0)
/* 5. type 30 on the landing day then click elsewhere -> saved once and closed */
await typeStr('30')
await clickElsewhere()
const landed = /22/.test(stripAfter17)
note('5 click elsewhere: cell22', await cellTxt(22)); note('editor after', await boxVal())
pics.push(await B.pic(p, `P2-04-${S}-3-click-elsewhere`))
/* 6. Escape restores */
await open(14); await typeStr('99'); const boxBefEsc = await boxVal(); await esc()
note('6 Escape/Done after 99: cell14', await cellTxt(14) + ' (box showed ' + boxBefEsc + '; ' + (w.phone ? 'phone: Done saves — Escape has no pad key' : 'Escape') + ')')
/* 7. blank */
await open(15)
if (!w.phone) { await p.keyboard.press('Control+A'); await p.keyboard.press('Backspace') } else { await B.press(w, B.tid(w, 'fly-pad-back')); await B.press(w, B.tid(w, 'fly-pad-back')) }
const blankBox = await boxVal()
await done()
note('7 blank + Enter/Done: cell15 was 12 -> ', await cellTxt(15) + ' (box showed "' + blankBox + '")')
/* 8. negative (desktop typing only) */
let negRes = 'n/a on the phone pad (no minus key)'
if (!w.phone) { await open(16); await p.keyboard.type('-5'); const nb = await boxVal(); await p.keyboard.press('Enter'); negRes = `box "${nb}" -> cell16 (was 13) = ${await cellTxt(16)}; strip ${await strip()}`; await p.keyboard.press('Escape') }
note('8 negative', negRes)
pics.push(await B.pic(p, `P2-04-${S}-4-negative`))
/* 9. fractional */
let fracRes = 'n/a on the phone pad (no point key)'
if (!w.phone) { await open(14); const was = await cellTxt(14); await p.keyboard.type('2.5'); const fb = await boxVal(); await p.keyboard.press('Enter'); fracRes = `cell14 was ${was}; box "${fb}" -> cell14 = ${await cellTxt(14)}; strip ${await strip()}`; await p.keyboard.press('Escape') }
note('9 fractional', fracRes)
/* 10. four digits */
await open(16); const was16 = await cellTxt(16); await typeStr('1234'); const fourBox = await boxVal(); await enter()
note('10 four digits: cell16 was ' + was16, `box "${fourBox}" -> cell16 = ${await cellTxt(16)}`)
pics.push(await B.pic(p, `P2-04-${S}-5-four-digits`))
await done()
/* 11. unchanged Enter writes nothing: a RUN from 22 Jul via typing "From … on", then walk Next over untouched run days, then change the run's figure */
await open(22)
await typeStr('9'); await B.press(w, B.tid(w, 'fly-edit-run')); await done()
const runShown = [await cellTxt(22), await cellTxt(23), await cellTxt(24)].join(',')
note('11a run from 22 Jul typed 9: cells 22,23,24', runShown)
await open(23); await enter(); await enter(); await enter(); await B.sleep(200)
await esc()
await open(22); await typeStr('8'); await B.press(w, B.tid(w, 'fly-edit-run')); await done()
const runAfter = [await cellTxt(22), await cellTxt(23), await cellTxt(24), await cellTxt(27)].join(',')
note('11b walked Next over 23,24,27 untouched then changed run to 8 from 22: cells 22,23,24,27', runAfter)
pics.push(await B.pic(p, `P2-04-${S}-6-run-followed`))
const checks = [
  ['valid edit saved once and advanced (21 on 13, strip on 14 Jul)', true, ''],
]
console.log('\nLOG\n' + log.join('\n'))
B.row('P2-04-raw', S, 'Req P 13 Jul typed/Enter/Next/Tab-equivalents, excluded dates ahead (weekend 18-19, PH 20, NF 21), click elsewhere, Escape, blank, negative, fractional, four-digit, unchanged-Next on a run', log.join(' || '), 'RAW', pics)
B.noteErrors('p204-' + S, w.errors)
await B.close(w)
