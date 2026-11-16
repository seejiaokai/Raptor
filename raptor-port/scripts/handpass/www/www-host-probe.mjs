/* www host probe v1 (16 Nov 26) — the host proves the route before the walkers: a Friday flight with take-off typed
   and no landing, a briefing inside its assumed window, read on the board, the week strip and the day-details window.
   usage (from raptor-port/): [PHONE=1] node scripts/handpass/www/www-host-probe.mjs */
const PHONE = process.env.PHONE === '1'
process.env.WWW_WHO = 'host'
process.env.WWW_RUN ||= 'probe-' + (PHONE ? 'p' : 'd')
const X = await import('./www-lib.mjs')
const { say, sleep, FRI } = X
say('www-host-probe v1')
const w = await X.open({ phone: PHONE })
const { page, P } = w
await X.board(w, FRI)
const wi = await X.flight(w, FRI, '12:00', '', 'bane', { msn: 'VL BFM' })
const g0 = await page.evaluate(d => window.DAYS[d].ground.length, FRI)
await X.press(w, `[data-gradd="${FRI}"]`, { scope: 'board' }); await sleep(400)
await X.typeIn(w, `[data-bfld="gr:${FRI}.${g0}.prog"]`, 'BRIEFING')
await X.typeIn(w, `[data-bfld="gr:${FRI}.${g0}.str"]`, '12:40')
await X.typeIn(w, `[data-bfld="gr:${FRI}.${g0}.end"]`, '13:00')
say('seat ground', await X.seat(w, `[data-fill="g:${FRI}.${g0}.+"]`, 'bane'))
const bw = await X.boardWarn(w)
say('BOARD', JSON.stringify(bw.filter(l => /Ranger|VL BFM|landing/i.test(l))))
await X.pic(w, `probe-board-${P}`)
await X.closeBoard(w)
const ww = await X.weekWarn(w, '#eWeek', FRI)
say('WEEK', ww.head, JSON.stringify(ww.items.filter(l => /Ranger|VL BFM|landing/i.test(l))))
await X.pic(w, `probe-week-${P}`)
const dd = await X.dayDetails(w, '#eWeek', FRI)
say('DAYDET', JSON.stringify((dd.items || []).filter(l => /Ranger|VL BFM|landing/i.test(l))), dd.why || '')
await X.pic(w, `probe-daydet-${P}`)
await X.closeDayPop(w)
say('wave', wi)
await X.fin(w)
