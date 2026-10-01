/* walker C — the saved rows before and after ONE hide (L.rows / L.diff): that day's row and nothing else of the schedule.
   Measured three times: the first hide of a week nobody has saved; a flag-again; a hide on a week already saved. */
import * as C from './wh-c-lib.mjs'
const { H } = C, { L, W } = H
const TUE = 1, RE = /Long work day/i
const { browser, p, errors } = await H.world({ who: 'a' })
try {
  await L.go(p, 'editsched')
  const r0 = await L.rows(p)
  const weekRows0 = Object.keys(r0).filter(k => k.startsWith('weeks/'))
  const s0 = await C.see(p, '#eWeek', TUE, RE)
  const w1 = await C.wrote(p, () => H.tapLine(p, '#eWeek', TUE, s0.line.ix))
  const wkNew = !('weeks/13-07-2026' in r0)
  const wkRow = w1.after['weeks/13-07-2026'] || ''
  console.log('BEFORE week rows', JSON.stringify(weekRows0))
  console.log('FIRST HIDE', JSON.stringify(w1.d), 'week row new?', wkNew, 'week row:', wkRow.slice(0, 400))
  const pic1 = await C.picLine(p, '#eWeek', TUE, s0.line.ix, 'rows-1-first-hide')
  H.judge('rows.1', 'a fresh world (no week saved yet); pressed ✕ on Tuesday\'s "Long work day"', [
    ['it wrote Tuesday\'s row', w1.sched.includes('weeks/13-07-2026#1'), w1.sched],
    ['no other DAY row was written', w1.sched.filter(k => /#\d$/.test(k) && k !== 'weeks/13-07-2026#1').length === 0, w1.sched],
    ['the only other schedule row is the week\'s own header, written for the first time (this week had never been saved)', w1.sched.filter(k => k !== 'weeks/13-07-2026#1').every(k => k === 'weeks/13-07-2026') && wkNew, { others: w1.sched.filter(k => k !== 'weeks/13-07-2026#1'), wkNew }],
    ['no request, person, calendar, Leave War or account row', ![...w1.d.put, ...w1.d.del].some(k => /^(inputs|people|plan|leavewar|settings\/account)/.test(k)), w1.d.put],
  ], [pic1])
  /* flag again */
  const w2 = await C.wrote(p, () => H.tapLine(p, '#eWeek', TUE, s0.line.ix))
  console.log('FLAG AGAIN', JSON.stringify(w2.d))
  H.judge('rows.2', 'pressed ↺ on the same line (the week is now saved)', [
    ['it wrote Tuesday\'s row and nothing else of the schedule', w2.sched.length === 1 && w2.sched[0] === 'weeks/13-07-2026#1', w2.sched],
    ['the week\'s header row did not change', w2.after['weeks/13-07-2026'] === wkRow],
    ['the stored Tuesday row no longer carries the hide', !/LONGDAY/.test((w2.after['weeks/13-07-2026#1'] || '').match(/"wo":\[[^\]]*\]/)?.[0] || ''), (w2.after['weeks/13-07-2026#1'] || '').match(/"wo":\[[^\]]*\]/)?.[0] || '(no wo field)'],
  ])
  /* hide once more, on the saved week */
  const w3 = await C.wrote(p, () => H.tapLine(p, '#eWeek', TUE, s0.line.ix))
  console.log('SECOND HIDE', JSON.stringify(w3.d))
  const pic3 = await C.picLine(p, '#eWeek', TUE, s0.line.ix, 'rows-3-second-hide')
  H.judge('rows.3', 'pressed ✕ again (a hide on a week already saved)', [
    ['it wrote Tuesday\'s row and nothing else of the schedule', w3.sched.length === 1 && w3.sched[0] === 'weeks/13-07-2026#1', w3.sched],
    ['one change-log batch, one history line', w3.d.newBatches.length === 1 && w3.d.put.filter(k => /^settings\/elog/.test(k)).length === 1, w3.d],
    ['the stored Tuesday row carries the hide', /LONGDAY/.test((w3.after['weeks/13-07-2026#1'] || '').match(/"wo":\[[^\]]*\]/)?.[0] || ''), (w3.after['weeks/13-07-2026#1'] || '').match(/"wo":\[[^\]]*\]/)?.[0]],
  ], [pic3])
} catch (e) { H.row('rows.X', 'the script', String(e && e.stack || e).slice(0, 600), 'FAIL', [await H.pic(p, 'rows-X-error')]) }
C.done('rows', errors)
await browser.close()
