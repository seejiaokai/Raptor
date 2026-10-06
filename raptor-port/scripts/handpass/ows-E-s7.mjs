/* walker E — E15: the phone (390x844, HP_PHONE=1): E01 -> E02 -> E04 again */
import * as E from './ows-E-lib.mjs'
const { world, sleep, A, R, W, L, P, judge, row, say, look, sum, setB, lineOf, scWave, SAT, SATI } = E
if (!E.PHONE) throw new Error('run with HP_PHONE=1')
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)

/* the real control: the day's date ("Jul 18") on the edit week opens the scheduler board */
await W.showDay(p, SAT)
const opener = p.locator('#eWeek .day[data-day="5"] .sb-open').first()
await opener.click(); await sleep(900)
const opened = await p.evaluate(() => !!(document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth) && window.SBDAY)
say('E15 board opened by tapping the date:', opened)
const w = await scWave(p, SAT, 0, 'bane')
const lineA = await lineOf(p, SAT, w.gi, 0)
const bpic = await P(p, 'E15-board-sc')
const bshow = await p.evaluate(([i, g]) => { const el = [...document.querySelectorAll('#schedBoard [data-bfld="ff:' + i + '.' + g + '.0.br"]')].filter(e => e.offsetParent !== null); return { visibleBoxes: el.length, w: el[0] ? Math.round(el[0].getBoundingClientRect().width) : null, vw: innerWidth } }, [SAT, w.gi])
const pub = await A.publishNew(p, SAT); await A.closeBoard(p)
const e1 = await look(p, 'bane', SATI, SAT, 'E15-e01')
say('E15 E01', lineA, JSON.stringify(bshow), sum(e1))
judge('E15.E01', 'PHONE: Saturday SC; Ranger first MAIN AM; B blank; sign + Publish', [
  ['seated', w.took === true, lineA],
  ['ORIG', pub.head && pub.head.tag === 'ORIG', pub.head && pub.head.tag],
  ['HO, worked 07:00–13:00', e1.cell === 'HO' && e1.times.join(',') === '07:00–13:00', { c: e1.cell, t: e1.times }],
], [bpic, ...e1.pics])

const b1 = await setB(p, SAT, w.gi, 0, '06:00')
const e2 = await look(p, 'bane', SATI, SAT, 'E15-e02')
say('E15 E02', JSON.stringify(b1), sum(e2))
judge('E15.E02', 'PHONE: typed 06:00 in the B box (published day)', [
  ['B holds 06:00', b1.stored === '06:00', b1],
  ['HO holds, 07:00–13:00', e2.cell === 'HO' && e2.times.join(',') === '07:00–13:00', { c: e2.cell, t: e2.times }],
  ['pending >= 1, sign-offs empty', +e2.pend >= 1 && e2.signs === 'all four empty', { p: e2.pendTxt, s: e2.signs }],
], e2.pics)
row('E15.E02.list', 'RECORD (phone): To go out words', e2.list, 'RECORDED', e2.pics)

const am = await A.publishAm(p, SAT); await A.closeBoard(p)
const e4 = await look(p, 'bane', SATI, SAT, 'E15-e04')
say('E15 E04', sum(e4))
judge('E15.E04', 'PHONE: sign + Publish AL', [
  ['AL1', am.head && /AL\s*1/.test(am.head.tag), am.head && am.head.tag],
  ['FO, worked 06:00–13:00, nothing pending', e4.cell === 'FO' && e4.times.join(',') === '06:00–13:00' && e4.pend === '0', { c: e4.cell, t: e4.times, p: e4.pendTxt }],
], e4.pics)
row('E15.B-box', 'RECORD: does the phone board show the SC line\'s B box, and how reached', `board opened by tapping the day's date ("Jul 18" on the Edit Schedule day, opened=${opened}) → "+ Wave" → SC; B box visible on the phone board: ${JSON.stringify(bshow)}`, 'RECORDED', [bpic])
const errs = E.cleanErr(errors)
console.log('ERRORS', JSON.stringify(errs))
A.savePart('ows-E-s7', { errors: errs, pics: E.pics.saved })
await browser.close()
