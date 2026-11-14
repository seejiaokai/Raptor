/* rcb2-w2 S04 — Sunday (this week) 12:00 blank -> Monday (next week) 04:00-05:00, Ranger both. ORDER=A (Monday first) | B (Sunday first)
   usage: ORDER=A [PHONE=1] node rcb2-w2-s04.mjs */
const PHONE = process.env.PHONE === '1', ORDER = process.env.ORDER || 'A'
process.env.RCB2_RUN ||= 's04-' + ORDER + (PHONE ? 'p' : 'd') + '1'
const X = await import('./rcb2-w2-lib.mjs')
const { L, say, sleep, SUN, WK } = X
const w = await X.open({ phone: PHONE }); const { page, P } = w
const size = PHONE ? '402' : '1536'
const MON = 0
async function sunday() {
  await X.gotoWeek(w, WK.cur, WK.curIso)
  await X.board(w, SUN); const wi = await X.flight(w, SUN, '12:00', ''); await X.closeBoard(w); return wi
}
async function monday() {
  await X.gotoWeek(w, WK.next, WK.nextIso)
  await X.board(w, MON); const wi = await X.flight(w, MON, '04:00', '05:00'); await X.closeBoard(w); return wi
}
let wsun, wmon
if (ORDER === 'A') { wmon = await monday(); wsun = await sunday() } else { wsun = await sunday(); wmon = await monday() }
const rest = /crew rest|tight|Breaks/i
async function readSunWeek(tag) {
  await X.gotoWeek(w, WK.cur, WK.curIso)
  let tr = await X.trace(w, '#eWeek', SUN); if (!tr.items.length) tr = await X.trace(w, '#eWeek', SUN)
  const strip = await X.weekWarn(w, '#eWeek', SUN)
  await X.pic(w, `s04-${tag}-sun-week-${P}`)
  const dd = await X.dayDetails(w, '#eWeek', SUN); await X.pic(w, `s04-${tag}-sun-daydet-${P}`); await X.closeDayPop(w, 'x')
  const title = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="6"] .puck[data-person="bane"]')].map(e => e.getAttribute('title') || '').filter(Boolean))
  let peek = 'n/a (phone)'
  if (!PHONE) {
    peek = await page.evaluate(() => { const els = [...document.querySelectorAll('#eWeek [data-peek], #eWeek .peek, #eWeek .day.peek')].filter(e => e.offsetWidth); return els.map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 200)) })
    await X.pic(w, `s04-${tag}-peek-${P}`)
  }
  return { trace: tr.items, strip: strip.items.filter(l => rest.test(l)), dd: dd.items.filter(l => rest.test(l)), title, peek }
}
async function readMon(tag) {
  await X.gotoWeek(w, WK.next, WK.nextIso)
  const st = await X.weekWarn(w, '#eWeek', MON); await X.pic(w, `s04-${tag}-mon-week-${P}`)
  const dd = await X.dayDetails(w, '#eWeek', MON); await X.pic(w, `s04-${tag}-mon-daydet-${P}`); await X.closeDayPop(w, 'done')
  await X.board(w, MON); const bw = await X.boardWarn(w); await X.pic(w, `s04-${tag}-mon-board-${P}`); await X.closeBoard(w)
  return { week: st.items.filter(l => rest.test(l)), dd: dd.items.filter(l => rest.test(l)), board: bw.filter(l => rest.test(l)) }
}
const BL = /took off 12:00 with no landing typed.*14:00.*02:00/
async function judgeBoth(tag, re) {
  const s = await readSunWeek(tag); say('SUN', tag, JSON.stringify(s))
  const m = await readMon(tag); say('MON', tag, JSON.stringify(m))
  const sc = 'S04 ' + tag + ' order ' + ORDER
  X.row(sc, size, "Sunday's forward trace (puck tapped) 'Breaks Monday'", 'sentence with ' + re, JSON.stringify(s.trace), s.trace.some(l => re.test(l)) ? 'PASS' : 'FAIL', `s04-${tag}-sun-week-${P}.png`)
  X.row(sc, size, "Sunday's day details / strip", 'RECORD (no Monday breach lives on Sunday)', JSON.stringify([s.dd, s.strip]), 'RECORDED', `s04-${tag}-sun-daydet-${P}.png`)
  X.row(sc, size, "Sunday's puck short title", 'short leave-by explanation, never "landed" for a borrowed take-off', JSON.stringify(s.title), s.title.some(t => /landed 12:00/.test(t)) ? 'FAIL' : 'RECORDED', `s04-${tag}-sun-week-${P}.png`)
  X.row(sc, size, 'next-week preview (desktop)', 'plain tasking, no full sentence required', JSON.stringify(s.peek), 'RECORDED', `s04-${tag}-peek-${P}.png`)
  for (const k of ['week', 'dd', 'board']) X.row(sc, size, "Monday's own warning: " + k, String(re), JSON.stringify(m[k]), m[k].some(l => re.test(l)) ? 'PASS' : 'FAIL', `s04-${tag}-mon-*-${P}.png`)
}
await judgeBoth('a-blank', BL)
await page.reload(); await sleep(1500); await L.login(page, 'a').catch(() => {})
say('after reload CURWEEK', await page.evaluate(() => window.CURWEEK))
const m2 = await readMon('b-reload'); say('MON after reload', JSON.stringify(m2))
X.row('S04 b-reload order ' + ORDER, size, 'reload, enter through Monday week: warning present', String(BL), JSON.stringify(m2.week), m2.week.some(l => BL.test(l)) ? 'PASS' : 'FAIL', `s04-b-reload-mon-week-${P}.png`)
await X.gotoWeek(w, WK.cur, WK.curIso)
await page.evaluate(([d, g]) => { window.DAYS[d].waves[g].formations[0].ld = 'TBD'; window.afterSchedMutate() }, [SUN, wsun]); await sleep(400)
await judgeBoth('c-tbd', BL)
await X.gotoWeek(w, WK.cur, WK.curIso)
await X.board(w, SUN); await X.typeIn(w, `[data-bfld="ff:${SUN}.${wsun}.0.ld"]`, '12:30'); await X.closeBoard(w)
await judgeBoth('d-1230', /landed 12:30.*14:30.*02:30/)
await X.fin(w)
