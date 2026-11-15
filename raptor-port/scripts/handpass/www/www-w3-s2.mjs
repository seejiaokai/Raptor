/* www W3 fix 2 — the day being judged uses its own flight length. usage: [PHONE=1] node scripts/handpass/www/www-w3-s2.mjs */
const PHONE = process.env.PHONE === '1'
process.env.WWW_RUN ||= 's2-' + (PHONE ? 'p' : 'd')
const H = await import('./www-w3-lib.mjs')
const { X, say, sleep, L } = H
const size = PHONE ? '402' : '1536'
const P = PHONE ? 'p' : 'd'
const w = await X.open({ phone: PHONE })
const { page } = w
const R = (did, exp, saw, v, pic) => X.row('2 judged day own flight length', size, did, exp, saw, v, pic)
const MAN = 'bane'
await X.board(w, X.FRI)
const wf = await H.frFlight(w, X.FRI, '12:00', '', MAN, 'FRI FLT')
await X.closeBoard(w)
await X.board(w, X.SAT)
const ws = await H.frFlight(w, X.SAT, '14:00', '15:00', MAN, 'SAT FLT')
await X.closeBoard(w)
const re = /crew rest|tight turning/i
const a = await H.crLines(w, X.SAT, re, '2-a')
R('built Ranger: Friday T/O 12:00 landing blank; Saturday T/O 14:00 landing 15:00; Saturday crew-rest at A flight 60', 'no crew-rest line', JSON.stringify(a), a.week.length + a.details.length + a.board.length === 0 ? 'PASS' : 'FAIL', `2-a-week-${P}.png`)
await X.board(w, X.FRI)
const pr = await H.signAndPublish(w, X.FRI); await sleep(800)
const hp = await H.head(w, X.FRI)
await X.pic(w, `2-b-published-${P}`)
const fb0 = await X.boardWarn(w)
await X.closeBoard(w)
R('signed four and published Friday', 'ORIG', JSON.stringify({ pr: pr.pressed, hp }), hp && /ORIG/.test(hp.tag) ? 'PASS' : 'NOT WALKED', `2-b-published-${P}.png`)
await H.logicOpen(w, true)
const v = await H.setSetting(w, 'fltLen', '120'); await H.logicDone(w)
await X.pic(w, `2-c-logic120-${P}`)
const b = await H.crLines(w, X.SAT, re, '2-c')
const hf = await (async () => { await X.board(w, X.FRI); const h = await H.head(w, X.FRI); const bw = await X.boardWarn(w); await X.pic(w, `2-c-friday-board-${P}`); await X.closeBoard(w); return { h, bw } })()
R('A flight set to 120 (box ' + v + '); Saturday (flight 14:00/15:00, not published) crew-rest line', 'a line with "landing assumed 14:00 (T/O + 2h)" and "→ ended 16:00" (arithmetic note: report 11:00 vs clear 04:00 would not breach)', JSON.stringify(b), b.week.some(l => /landing assumed 14:00 \(T\/O \+ 2h\)/.test(l) && /→ ended 16:00/.test(l)) ? 'PASS' : 'RECORDED', `2-c-week-${P}.png`)
R('Friday published face after the change: head and board lines', 'unchanged (no landing-assumed 14:00 / no pending from this)', JSON.stringify({ hp, after: hf.h, boardBefore: fb0.filter(l => /Ranger/.test(l)), boardAfter: hf.bw.filter(l => /Ranger/.test(l)) }), 'RECORDED', `2-c-friday-board-${P}.png`)
// adapted shape: Saturday flight early enough to be breached only by 120
await X.board(w, X.SAT)
await H.setF(w, `ff:${X.SAT}.${ws}.0.to`, '06:30')
await H.setF(w, `ff:${X.SAT}.${ws}.0.ld`, '07:30')
await X.closeBoard(w)
const c = await H.crLines(w, X.SAT, re, '2-d')
R('(adapted) Saturday flight moved to T/O 06:30 landing 07:30, A flight still 120', 'a line (Tight turning: report 03:30 before clear 04:00) with "landing assumed 14:00 (T/O + 2h)" → "ended 16:00" → "clear 04:00"', JSON.stringify(c), c.week.some(l => /landing assumed 14:00 \(T\/O \+ 2h\)/.test(l) && /ended 16:00/.test(l)) ? 'PASS' : 'FAIL', `2-d-week-${P}.png`)
await H.logicOpen(w, true)
const v2 = await H.setSetting(w, 'fltLen', '60'); await H.logicDone(w)
const d = await H.crLines(w, X.SAT, re, '2-e')
R('A flight put back to 60 (box ' + v2 + '); Saturday crew-rest lines', 'the 120-based line is gone (at 60: ended 15:00, clear 03:00, report 03:30: no breach)', JSON.stringify(d), d.week.every(l => !/T\/O \+ 2h/.test(l)) ? 'PASS' : 'FAIL', `2-e-week-${P}.png`)
await X.fin(w)
