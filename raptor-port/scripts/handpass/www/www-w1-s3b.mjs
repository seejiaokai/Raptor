/* www W1 scenario 3 — Sunday 23:30 landing blank -> Monday item. usage: [PHONE=1] node scripts/handpass/www/www-w1-s3.mjs */
const PHONE = process.env.PHONE === '1'
process.env.WWW_RUN ||= 's3b-' + (PHONE ? 'p' : 'd')
const H = await import('./www-w1-lib3.mjs')
const { X, say, sleep, L, nrm } = H
const size = PHONE ? '402' : '1536'
const P = PHONE ? 'p' : 'd'
const SUN = X.SUN, MON = X.MON
const w = await X.open({ phone: PHONE })
const { page } = w
const R = (did, exp, saw, v, pic) => X.row('3b Sunday to Monday', size, did, exp, saw, v, pic)
const MONTHS = ['jan']
async function gotoWeek(v, iso) {
  if (await page.evaluate(() => !!document.querySelector('#schedBoard'))) await X.closeBoard(w)
  await L.go(page, 'editsched'); await sleep(300)
  if (!PHONE) await X.press(w, `[data-wk="${v}"]`)
  else { await X.press(w, '.filt-cal'); await page.waitForSelector('#weekCal:not([hidden]) .airpop-box', { timeout: 5000 }); await X.press(w, `#weekCal [data-iso="${iso}"]`) }
  await page.waitForFunction(x => window.CURWEEK === x, v, { timeout: 5000 }); await sleep(500)
}
const CUR = ['13/07/2026', '2026-07-13'], NXT = ['20/07/2026', '2026-07-20']
// pick a pilot with nothing on this week's Sunday nor next week's Monday (read from DAYS)
const sunBusy = await page.evaluate(d => JSON.stringify(window.DAYS[d]), SUN)
await gotoWeek(...NXT)
const monBusy = await page.evaluate(d => JSON.stringify(window.DAYS[d]), MON)
await gotoWeek(...CUR)
let MAN = null, CS = null
for (const c of ['Ace', 'Anvil', 'Blade', 'Cinch', 'Cobra', 'Comet', 'Forge', 'Gambit', 'Havoc', 'Hunter']) {
  const k = await H.pidOf(page, c)
  if (k && !sunBusy.includes(`"${k}"`) && !monBusy.includes(`"${k}"`)) { MAN = k; CS = c; break }
}
say('chosen man', CS, MAN)
if (!MAN) throw new Error('no free pilot found')
// fixture: Sunday flight 23:30 landing blank
await X.board(w, SUN)
const wi = await X.flight(w, SUN, '23:30', '', MAN, { msn: 'LATE FLT' })
await X.closeBoard(w)
// Monday item next week
await gotoWeek(...NXT)
await X.board(w, MON)
const wm = await X.flight(w, MON, '17:00', '18:00', MAN, { msn: 'MON FLT' })
const who = await page.evaluate(([d, g]) => window.PEOPLE[window.DAYS[d].waves[g].formations[0].aircraft[0].p]?.cs, [MON, wm])
const sres = who === CS ? 'ok' : 'FAILED'
await X.closeBoard(w)
R('built: Sunday 19 Jul ' + CS + ' T/O 23:30 landing blank; Monday 20 Jul ' + CS + ' flight T/O 17:00 landing 18:00 (report 14:00; chosen so the blank landing breaks his rest and the typed 23:40 does not; a ground item starts no flying day)', 'both rows made', `Monday front seat: ${who}`, sres === 'ok' ? 'PASS' : 'NOT WALKED', '')
async function readMon(tag) {
  await L.go(page, 'editsched'); await sleep(400)
  const wk = await page.evaluate(() => window.CURWEEK)
  const ww = await X.weekWarn(w, '#eWeek', MON)
  await X.pic(w, `${tag}-monweek-${P}`)
  const dd = await X.dayDetails(w, '#eWeek', MON)
  await X.pic(w, `${tag}-mondetails-${P}`)
  await X.closeDayPop(w, 'done')
  await X.board(w, MON)
  const bw = await X.boardWarn(w)
  await X.pic(w, `${tag}-monboard-${P}`)
  await X.closeBoard(w)
  const f = a => (a || []).filter(l => new RegExp('crew rest|' + CS, 'i').test(l))
  return { wk, week: f(ww.items), details: f(dd.items), board: f(bw) }
}
const re = /Ranger.*crew rest|crew rest/i
// --- cold: reload, then next week first
await page.reload(); await page.waitForSelector('#luser, #vWeek .day', { state: 'attached', timeout: 15000 }); if (await page.locator('#luser:visible').count()) await L.login(page, 'a')
await sleep(600)
await gotoWeek(...NXT)
const c1 = await readMon('3-1cold')
for (const k of ['week', 'details', 'board'])
  R(`next week opened COLD (before Sunday's week); Monday ${k}`, 'a crew-rest line: landing assumed 00:30 (T/O + 1h) … clear 14:30 … needs 12h', JSON.stringify(c1[k]), c1[k].some(l => /landing assumed 00:30 \(T\/O \+ 1h\)/.test(l) && /14:30/.test(l) && /12h/.test(l)) ? 'PASS' : 'FAIL', `3-1cold-mon${k === 'week' ? 'week' : k === 'details' ? 'details' : 'board'}-${P}.png`)
R('Monday crew-rest line, whole (cold)', 'RECORD', JSON.stringify(c1.week), 'RECORDED', `3-1cold-monweek-${P}.png`)
// Sunday's "Breaks Monday" trace
await gotoWeek(...CUR)
let tr = await X.trace(w, '#eWeek', SUN, MAN); if (!tr.items.length) tr = await X.trace(w, '#eWeek', SUN, MAN)
await X.pic(w, `3-2sunday-trace-${P}`)
R('current week: tapped Ranger\'s Sunday puck; the forward "Breaks Monday" rows', 'RECORD: Breaks Monday, landing assumed', JSON.stringify(tr.items), tr.items.length ? 'RECORDED' : 'FAIL', `3-2sunday-trace-${P}.png`)
// --- via Sunday: next week reached from Sunday's week by the next-week control
await gotoWeek(...NXT)
const c2 = await readMon('3-3via')
R('next week reached from Sunday\'s week; Monday week/details/board', 'the same crew-rest line as cold', JSON.stringify(c2), JSON.stringify(c2.week) === JSON.stringify(c1.week) && c2.details.length && c2.board.length ? 'PASS' : 'FAIL', `3-3via-monweek-${P}.png`)
// --- TBD
await gotoWeek(...CUR)
await X.board(w, SUN)
await X.typeIn(w, `[data-bfld="ff:${SUN}.${wi}.0.ld"]`, 'TBD')
await X.closeBoard(w)
await gotoWeek(...NXT)
const c3 = await readMon('3-4tbd')
R('landing TBD: Monday crew-rest (week)', 'same assumed line as blank', JSON.stringify(c3.week), c3.week.some(l => /landing assumed 00:30/.test(l)) ? 'PASS' : 'FAIL', `3-4tbd-monweek-${P}.png`)
// --- typed 23:40 (rest clears at 13:40, before 14:00)
await gotoWeek(...CUR)
await X.board(w, SUN)
await X.typeIn(w, `[data-bfld="ff:${SUN}.${wi}.0.ld"]`, '23:40')
await X.closeBoard(w)
await gotoWeek(...NXT)
const c4 = await readMon('3-5typed')
R('typed landing 23:40: Monday crew-rest lines (week/details/board)', 'the breach is gone (rest clears 13:40 before 14:00); no "assumed" anywhere', JSON.stringify(c4), !c4.week.some(l => /crew rest/i.test(l)) && !c4.details.some(l => /assumed/.test(l)) && !c4.board.some(l => /assumed/.test(l)) ? 'PASS' : 'FAIL', `3-5typed-monweek-${P}.png`)
await gotoWeek(...CUR)
let tr2 = await X.trace(w, '#eWeek', SUN, MAN); if (!tr2.items.length) tr2 = await X.trace(w, '#eWeek', SUN, MAN)
await X.pic(w, `3-6typed-trace-${P}`)
R('typed landing: Sunday forward trace', 'no "assumed" and no Breaks Monday', JSON.stringify(tr2.items), !tr2.items.some(l => /assumed|Breaks/.test(l)) ? 'PASS' : 'FAIL', `3-6typed-trace-${P}.png`)
// Monday OIL part: publish Sunday (typed landing 23:40), read both days' Leave War cells and the tracker
await gotoWeek(...CUR)
await X.board(w, SUN)
const pubS = await H.signAndPublish(w, SUN); await sleep(800)
await X.closeBoard(w)
const rs = await H.lwReadAll(w, MAN, '2026-07-19', '3-7sunoil')
await H.lwOpen(w, '2026-07-20')
const monCell = await H.lwCellRead(w, MAN, '2026-07-20')
await X.pic(w, `3-8monoil-${P}`)
R('published Sunday (typed landing 23:40); Leave War: Sunday cell, tracker; Monday cell', 'RECORD: Sunday earns once; Monday no credit (no duplicate)', `publish ${JSON.stringify(pubS.pressed)}; sunday ${JSON.stringify(rs)}; monday cell ${JSON.stringify(monCell)}`, rs.entries.length <= 1 && !(monCell && /FO|HO/.test(monCell.text)) ? 'RECORDED' : 'FAIL', `3-7sunoil-oiltracker-${P}.png`)
await X.fin(w)
