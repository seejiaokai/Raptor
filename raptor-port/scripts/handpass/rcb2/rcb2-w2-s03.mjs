/* rcb2-w2 S03 — amber "Tight turning": Fri 12:00 blank, Sat 04:30-05:30 (Ranger both). usage: [PHONE=1] node rcb2-w2-s03.mjs */
const PHONE = process.env.PHONE === '1'
process.env.RCB2_RUN ||= 's03-' + (PHONE ? 'p' : 'd') + '1'
const X = await import('./rcb2-w2-lib.mjs')
const { L, say, sleep, FRI, SAT } = X
const w = await X.open({ phone: PHONE }); const { page, P } = w
const size = PHONE ? '402' : '1536'
await L.go(page, 'editsched')
await X.board(w, FRI); const wf = await X.flight(w, FRI, '12:00', ''); await X.closeBoard(w)
await X.board(w, SAT); const ws = await X.flight(w, SAT, '04:30', '05:30')
const f = await page.evaluate(([d, g]) => { const x = window.DAYS[d].waves[g].formations[0]; return JSON.stringify(x).slice(0, 160) }, [SAT, ws])
say('Sat formation', f); await X.closeBoard(w)
let r = await X.readPair(w, 's03-a-blank')
say('blank', JSON.stringify(r))
X.judgeAll('S03', 'a-blank (amber)', size, r, /Tight turn.*took off 12:00 with no landing typed.*14:00.*02:00/i, `s03-a-blank-*-${P}.png`, true)
const red = [...r.week, ...r.details, ...r.board].some(l => /Crew rest breach/.test(l) && !/Tight/.test(l))
X.row('S03 a-blank', size, 'it is amber, not a red breach', 'no red breach line', JSON.stringify([...r.week, ...r.board]), red ? 'FAIL' : 'PASS', `s03-a-blank-week-${P}.png`)
await page.evaluate(([d, g]) => { window.DAYS[d].waves[g].formations[0].ld = 'TBD'; window.afterSchedMutate() }, [FRI, wf]); await sleep(500)
r = await X.readPair(w, 's03-b-tbd'); say('tbd', JSON.stringify(r))
X.judgeAll('S03', 'b-tbd planted (typing refuses TBD)', size, r, /Tight turn.*took off 12:00 with no landing typed.*14:00.*02:00/i, `s03-b-tbd-*-${P}.png`, true)
await X.board(w, FRI); await X.typeIn(w, `[data-bfld="ff:${FRI}.${wf}.0.ld"]`, '12:30'); await X.closeBoard(w)
r = await X.readPair(w, 's03-c-1230'); say('1230', JSON.stringify(r))
X.judgeAll('S03', 'c-1230 typed', size, r, /landed 12:30.*14:30.*02:30/, `s03-c-1230-*-${P}.png`)
await X.fin(w)
