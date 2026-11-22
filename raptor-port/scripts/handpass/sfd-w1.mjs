// Walker w1 — SANS from its date on every screen (D2313), 22 Nov 26, chat 140. Brief:
// docs/superpowers/briefs/2026-11-22-sans-from-date-walk-brief.md — scenarios S1 + S8 (one context), S3, S4, S7; desktop + phone.
// Run from raptor-port/:  ONLY=s1d,s1p,s3d,s3p,s4d,s4p,s7d,s7p node scripts/handpass/sfd-w1.mjs
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { SIZES, results, log, sleep, J, mk, world, signIn, signOut, go, today, weekOf, B, hideToast, openBoard, closeBoard, boardStep,
  typeBox, readBoard, readWeek, readCrewPanel, crewPanelTo, crewPanelClose, availCount, groundRowWith, lwCell, postOutSans, qualsTick, OUT, URL_ } from './sfd-w1-lib.mjs'

const VERSION = 'sfd-w1 v2'
const ONLY = (process.env.ONLY || 's1d,s1p,s3d,s3p,s4d,s4p,s7d,s7p').split(',')
log(VERSION, URL_, ONLY.join(','))
const HEX = 'rocky'

/* to the demo week (Mon 13 Jul) if another week is loaded: the board's ‹ from next week's Monday */
async function toDemoWeek(p, W) {
  await go(p, 'editsched')
  if ((await weekOf(p)).startsWith('Jul 13')) return 'already'
  await openBoard(p, W, 0); const r = await boardStep(p, W, -1); await closeBoard(p, W)
  return r.week
}
async function toNextWeek(p, W) {
  await go(p, 'editsched')
  if ((await weekOf(p)).startsWith('Jul 20')) return 'already'
  await openBoard(p, W, 6); const r = await boardStep(p, W, 1); await closeBoard(p, W)
  return r.week
}
const sansOf = arr => arr.map(x => x.san)
/* every place D2313's S1 names, for Sat 18 Jul and Mon 20 Jul */
async function readAll(p, W, tag, opts = {}) {
  const R = { tag, today: await today(p) }
  await toDemoWeek(p, W)
  /* Edit Schedule, Saturday: the day card, the crew panel on Saturday, the Available crew count */
  const satCard = p.locator('#eWeek section.day[data-day="5"]').first()
  await satCard.evaluate(e => e.scrollIntoView({ block: 'start', inline: 'center' })); await sleep(400)
  const wk = await readWeek(p, HEX)
  R.weekSat = Object.entries(wk).filter(([k]) => /^Saturday/.test(k)).flatMap(([, v]) => v)
  R.peekMon = Object.entries(wk).filter(([k]) => /^peekMonday|^peek.*Jul 20/.test(k)).flatMap(([, v]) => v)
  R.picWeekSat = await W.pic(p, `${tag}-week-sat`)
  R.panelDaySat = await crewPanelTo(p, W, 'sat')
  R.panelSat = await readCrewPanel(p, HEX)
  R.picPanelSat = await W.pic(p, `${tag}-panel-sat`)
  await crewPanelClose(p, W)
  R.availSat = await availCount(p, W, 5, tag + '-')
  /* the board, Saturday, and its ALL AVAIL window */
  await openBoard(p, W, 5)
  R.boardSat = await readBoard(p, HEX)
  R.picBoardSat = await W.pic(p, `${tag}-board-sat`)
  const chip = p.locator(B('.oilcount[data-oilday="5"]')).first()
  if (await chip.count()) {
    R.chipSat = ((await chip.innerText()) || '').trim()
    await W.press(p, chip, 'count-chip'); await sleep(600)
    R.winSat = await p.evaluate(id => { const w = document.querySelector('.availwin'); if (!w) return 'no window'; const all = [...w.querySelectorAll('.rpuck[data-awp]')]; const me = w.querySelector(`.rpuck[data-awp="${id}"]`); const pk = me && (me.querySelector('.puck') || me); return { n: all.length, has: !!me, san: pk ? pk.classList.contains('san') : null, title: pk ? pk.getAttribute('title') : null, head: ((w.querySelector('.win-ttl, h3, .availwin-h') || {}).innerText || '').replace(/\s+/g, ' ').slice(0, 120), sec: me ? ((me.closest('.rcol') || {}).querySelector ? (me.closest('.rcol').querySelector('.rh') || {}).innerText : 'no col') : null } }, HEX)
    if (await p.locator('.availwin .rpuck[data-awp="' + HEX + '"]').count()) await p.locator('.availwin .rpuck[data-awp="' + HEX + '"]').first().scrollIntoViewIfNeeded().catch(() => {})
    R.picWinSat = await W.pic(p, `${tag}-availwin-sat`)
    await p.keyboard.press('Escape'); await sleep(400)
  } else R.chipSat = 'no chip'
  /* the board, Mon 20 Jul (two steps on) */
  R.stepSun = await boardStep(p, W, 1)
  R.stepMon = await boardStep(p, W, 1)
  R.boardMon = await readBoard(p, HEX)
  R.picBoardMon = await W.pic(p, `${tag}-board-mon20`)
  await closeBoard(p, W)
  /* Edit Schedule, Mon 20 Jul (next week now loaded) */
  R.weekNow = await weekOf(p)
  await p.locator('#eWeek section.day[data-day="0"]').first().evaluate(e => e.scrollIntoView({ block: 'start', inline: 'center' })).catch(() => {}); await sleep(400)
  const wk2 = await readWeek(p, HEX)
  R.weekMon = Object.entries(wk2).filter(([k]) => /^Monday/.test(k)).flatMap(([, v]) => v)
  R.picWeekMon = await W.pic(p, `${tag}-week-mon20`)
  R.panelDayMon = await crewPanelTo(p, W, 'mon')
  R.panelMon = await readCrewPanel(p, HEX)
  R.picPanelMon = await W.pic(p, `${tag}-panel-mon20`)
  await crewPanelClose(p, W)
  R.availMon = await availCount(p, W, 0, tag + '-')
  R.back = await toDemoWeek(p, W)
  return R
}
/* judge one readAll against "Sat a regular, Mon SANS" (or both regular when monSans=false) */
function judge(W, id, R, monSans = true) {
  const crewSat = R.boardSat.pucks.filter(x => x.where !== 'row'), rowSat = R.boardSat.pucks.filter(x => x.where === 'row')
  const crewMon = R.boardMon.pucks.filter(x => x.where !== 'row'), rowMon = R.boardMon.pucks.filter(x => x.where === 'row')
  const satOk = crewSat.length > 0 && crewSat.every(x => /WSO/i.test(x.where) && !x.san) && rowSat.length > 0 && rowSat.every(x => !x.san)
  W.rec(id + '-board-sat', `board Sat 18 Jul (${R.today}): Hex in the WSOs column, no purple line on row or crew list`, satOk, `heads ${J(R.boardSat.heads)} · pucks ${J(R.boardSat.pucks)}`, R.picBoardSat)
  const panelSat = R.panelSat.pucks || []
  W.rec(id + '-week-sat', `Edit Schedule Sat 18 Jul: his puck on the day card and in the crew panel (${R.panelDaySat}) regular`, R.weekSat.length > 0 && R.weekSat.every(x => !x.san) && panelSat.length > 0 && panelSat.every(x => /WSO/i.test(x.where) && !x.san), `card ${J(R.weekSat)} · panel heads ${J(R.panelSat.heads)} pucks ${J(panelSat)}`, R.picWeekSat + ', ' + R.picPanelSat)
  if (R.winSat) W.rec(id + '-win-sat', `ALL AVAIL window on Sat (chip "${R.chipSat}") lists Hex without the purple line`, R.winSat.has === true && R.winSat.san === false, J(R.winSat), R.picWinSat)
  else W.rec(id + '-win-sat', 'ALL AVAIL window on Sat', null, `chip: ${R.chipSat}`)
  W.rec(id + '-avail-sat', 'Available crew count, Sat (record; Hex has no SANS availability filed)', null, R.availSat.line, R.availSat.pic)
  const want = monSans
  const monOk = R.stepMon.week.startsWith('Jul 20') && crewMon.length > 0 && crewMon.every(x => (want ? x.where === 'SANS Avail' : /WSO/i.test(x.where)) && x.san === want) && rowMon.length > 0 && rowMon.every(x => x.san === want)
  W.rec(id + '-board-mon', `board Mon 20 Jul (week ${R.stepMon.week.slice(0, 6)}): Hex ${want ? 'under SANS Avail, purple line on every copy' : 'a regular in WSOs, no purple line'}`, monOk, `heads ${J(R.boardMon.heads)} · pucks ${J(R.boardMon.pucks)}`, R.picBoardMon)
  const panelMon = R.panelMon.pucks || []
  W.rec(id + '-week-mon', `Edit Schedule Mon 20 Jul: card and crew panel (${R.panelDayMon}) ${want ? 'SANS' : 'regular'}`, R.weekMon.length > 0 && R.weekMon.every(x => x.san === want) && panelMon.length > 0 && panelMon.every(x => x.san === want && (want ? x.where === 'SANS Avail' : /WSO/i.test(x.where))), `card ${J(R.weekMon)} · panel heads ${J(R.panelMon.heads)} pucks ${J(panelMon)}`, R.picWeekMon + ', ' + R.picPanelMon)
  W.rec(id + '-avail-mon', 'Available crew count, Mon 20 Jul (record)', null, R.availMon.line, R.availMon.pic)
}

/* View-only Sched as whoever is signed in: Sat 18 and Mon 20 Jul */
async function viewOnly(p, W, tag) {
  const R = {}
  await go(p, 'viewsched')
  await p.locator('#vWeek section.day[data-day="5"]').first().evaluate(e => e.scrollIntoView({ block: 'start', inline: 'center' })).catch(() => {}); await sleep(500)
  R.week1 = await weekOf(p)
  R.sat = Object.entries(await readWeek(p, HEX, '#vWeek')).filter(([k]) => /^Saturday/.test(k)).flatMap(([, v]) => v)
  R.picSat = await W.pic(p, `${tag}-view-sat`)
  /* next week: the desktop's week button; the phone's "Jump to a date" calendar */
  if (!W.isPhone) await W.press(p, '#weekSeg [data-wk="20/07/2026"]:visible', 'wk20')
  else {
    await W.press(p, '.filt-cal:visible', 'jump')
    await W.pic(p, `${tag}-view-jumpcal`)
    const d = p.locator('#weekCal button:visible', { hasText: /^20$/ }).first()
    if (await d.count()) await W.press(p, d, 'day20'); else R.jump = 'no 20 in the calendar'
  }
  await sleep(800)
  R.week2 = await weekOf(p)
  await p.locator('#vWeek section.day[data-day="0"]').first().evaluate(e => e.scrollIntoView({ block: 'start', inline: 'center' })).catch(() => {}); await sleep(500)
  R.mon = Object.entries(await readWeek(p, HEX, '#vWeek')).filter(([k]) => /^Monday/.test(k)).flatMap(([, v]) => v)
  R.picMon = await W.pic(p, `${tag}-view-mon20`)
  /* back to the demo week */
  if (!W.isPhone) await W.press(p, '#weekSeg [data-wk="13/07/2026"]:visible', 'wk13')
  else { await W.press(p, '.filt-cal:visible', 'jump2'); const d = p.locator('#weekCal button:visible', { hasText: /^18$/ }).first(); if (await d.count()) await W.press(p, d, 'day18') }
  await sleep(800)
  R.week3 = await weekOf(p)
  return R
}

/* =================== S1 + S8 =================== */
async function s1(k) {
  const sz = SIZES[k], W = mk('s1', sz)
  const { b, p } = await world(sz, W, '2026-07-22T09:00:00')
  try {
    await signIn(p, 'ad', 'a')
    const man = await p.evaluate(id => { const q = window.PEOPLE[id]; return { cs: q.cs, seat: q.seat, san: !!q.san, sanFrom: q.sanFrom || null } }, HEX)
    W.rec('premise', 'the drawn man', man.cs === 'Hex' && !man.san, `${J(man)} · app today ${await today(p)} · week ${await weekOf(p)}`)
    /* Sat 18 Jul: an ALL AVAIL item 08:00–15:00 on the Common Programme (frf-w1's steps), Hex on a ground row */
    const SAT = 5
    await openBoard(p, W, SAT)
    await W.press(p, B(`[data-padd="${SAT}"]`), 'add-item')
    const ri = await p.evaluate(i => window.DAYS[i].allhands.length - 1, SAT)
    await typeBox(p, W, `[data-bfld="ap:${SAT}.${ri}.prog"]`, 'SQN EVENT')
    await typeBox(p, W, `[data-bfld="ap:${SAT}.${ri}.str"]`, '0800')
    await typeBox(p, W, `[data-bfld="ap:${SAT}.${ri}.end"]`, '1500')
    await W.press(p, B(`[data-fill="a:${SAT}.${ri}.+"]`), 'arm-cmn')
    await W.press(p, `#schedBoard [data-person="allavail"]:visible`, 'allavail'); await sleep(500)
    const row = await p.evaluate(i => { const a = window.DAYS[i].allhands; const r = a[a.length - 1]; return { prog: r.prog, str: r.str, end: r.end, who: r.who } }, SAT)
    W.rec('s1-01', 'Sat: Common Programme SQN EVENT 08:00–15:00 for ALL AVAIL (+ Item, typed, tapped)', /08:?00/.test(row.str) && /15:?00/.test(row.end) && J(row.who).includes('allavail'), J(row), await W.pic(p, '01-cmn-row'))
    const g1 = await groundRowWith(p, W, SAT, HEX)
    W.rec('s1-02', 'Sat: Hex put on a new Ground Programme row (+ Item, tap the row, tap his puck)', g1.row && g1.row.who === HEX, J(g1), await W.pic(p, '02-ground-sat'))
    const st1 = await boardStep(p, W, 1), st2 = await boardStep(p, W, 1)
    W.rec('s1-03a', 'the board\'s › twice from Saturday reaches Mon 20 Jul (next week)', st2.week.startsWith('Jul 20') && st2.sbday === 0, `${J(st1)} → ${J(st2)}`)
    const g2 = await groundRowWith(p, W, 0, HEX)
    W.rec('s1-03', 'Mon 20 Jul: Hex put on a new Ground Programme row', g2.row && g2.row.who === HEX, J(g2), await W.pic(p, '03-ground-mon20'))
    await closeBoard(p, W)
    /* the posting */
    const po = await postOutSans(p, W, HEX, '2026-07-20', '04')
    W.rec('s1-04', 'Hex posted out as SANS from Mon 20 Jul on the Leave War (cell → ⋯ → Post out → SANS → Post out)', po.after.san === true, `line "${po.line}" · ${J(po.after)}`, po.pic)
    W.rec('s1-04b', 'his Leave War row after the posting (record)', null, '', await W.pic(p, '04b-lw-row'))
    /* every screen, Sat and Mon */
    const R = await readAll(p, W, '05')
    judge(W, 's1-05', R)
    /* the peek (next week's preview on Edit Schedule, a desktop surface) */
    W.rec('s1-06', 'Edit Schedule\'s next-week peek on the demo week: his puck on Mon 20 Jul (record)', null, R.peekMon.length ? J(R.peekMon) : 'no puck of his in a peek day (the phone draws no peek)', R.picWeekSat)
    if (!W.isPhone) {
      const pk = p.locator('#eWeek section.day.peek').first()
      if (await pk.count()) { await pk.evaluate(e => e.scrollIntoView({ block: 'start', inline: 'center' })); await sleep(400); W.rec('s1-06b', 'the peek scrolled into view', null, J(R.peekMon), await W.pic(p, '06-peek')) }
    }
    /* as the member Ranger: View-only Sched, both days */
    await signOut(p, W); await signIn(p, 'us', 'us')
    const V = await viewOnly(p, W, '07')
    W.rec('s1-07', 'as Ranger, View-only Sched Sat 18 Jul: Hex\'s puck (record; expected regular)', V.sat.length ? V.sat.every(x => !x.san) : null, `${V.week1.slice(0, 6)} ${J(V.sat)}`, V.picSat)
    W.rec('s1-08', 'as Ranger, View-only Sched Mon 20 Jul: Hex\'s puck (record; expected SANS)', V.mon.length ? V.mon.every(x => x.san) : null, `${V.week2.slice(0, 6)} ${J(V.mon)} ${V.jump || ''}`, V.picMon)
    /* ---- S8 ---- */
    const W8 = mk('s8', sz); W8.errs = W.errs
    await signOut(p, W8)
    await p.reload(); await signIn(p, 'ad', 'a')
    judge(W8, 's8-a', await readAll(p, W8, 'a'))
    await signOut(p, W8); await signIn(p, 'ad', 'a')
    judge(W8, 's8-b', await readAll(p, W8, 'b'))
    const nw = await toNextWeek(p, W8), bw = await toDemoWeek(p, W8)
    W8.rec('s8-c0', 'stepped to next week and back (the board\'s › from Sunday, ‹ from Monday)', null, `${nw} → ${bw}`)
    judge(W8, 's8-c', await readAll(p, W8, 'c'))
    /* (d) Undo post out on his posting's sheet */
    const c = (await lwCell(p, W8, HEX, '2026-07-20')).cell
    await W8.press(p, c, 'cell-20')
    const sheet = await W8.pic(p, 'd1-posting-sheet')
    const undo = p.locator('[data-testid="postout-undo"]:visible').first()
    if (await undo.count()) {
      await W8.press(p, undo, 'postout-undo'); await sleep(900)
      const st = await p.evaluate(id => { const q = window.PEOPLE[id]; return { san: !!q.san, sanFrom: q.sanFrom || null, sanWas: q.sanWas || null, archived: !!q.archived } }, HEX)
      W8.rec('s8-d1', 'Undo post out pressed on his posting\'s sheet', st.san === false, J(st), sheet + ', ' + await W8.pic(p, 'd2-after-undo'))
      await p.keyboard.press('Escape').catch(() => {}); await sleep(300)
      judge(W8, 's8-d', await readAll(p, W8, 'd'), false)
      await go(p, 'quals'); await W8.press(p, '#qViewW', 'qview')
      const cell = p.locator(`td[data-q="${HEX}|san"]`).first()
      await cell.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
      const q = await cell.evaluate(e => ({ text: e.innerText.trim(), cls: e.className, html: e.innerHTML.slice(0, 160) }))
      W8.rec('s8-d3', 'Quals: his SANS tick after Undo post out (expected off)', !/✓|✔/.test(q.text) && !/\bon\b/.test(q.cls), J(q), await W8.pic(p, 'd3-quals'))
    } else W8.rec('s8-d1', 'Undo post out', null, 'NOT WALKED: no "Undo post out" on the sheet his 20 Jul cell opened', sheet)
  } catch (e) {
    W.rec('s1-ERR', 'script stopped', false, String(e && e.message || e).slice(0, 400), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 8).join(' || '))
  await b.close()
}

/* read one man across several days of the loaded week on the board (‹ › between them) */
async function boardDays(p, W, id, dis, tag) {
  const out = {}
  await openBoard(p, W, dis[0])
  for (let i = 0; i < dis.length; i++) {
    if (i) { const want = dis[i]; while ((await p.evaluate(() => window.SBDAY)) < want) await boardStep(p, W, 1) }
    const r = await readBoard(p, id)
    const pic = await W.pic(p, `${tag}-day${dis[i]}`)
    out[dis[i]] = { ...r, pic }
  }
  await closeBoard(p, W)
  return out
}
const DOW = ['Mon 13', 'Tue 14', 'Wed 15', 'Thu 16', 'Fri 17', 'Sat 18', 'Sun 19']
function judgeDay(W, id, r, di, wantSans, seatWord) {
  const crew = r.pucks.filter(x => x.where !== 'row'), row = r.pucks.filter(x => x.where === 'row')
  const ok = crew.length > 0 && crew.every(x => x.san === wantSans && (wantSans ? x.where === 'SANS Avail' : new RegExp(seatWord, 'i').test(x.where))) && row.every(x => x.san === wantSans)
  W.rec(id, `${DOW[di]}: ${wantSans ? 'under SANS Avail, purple line' : 'in his seat\'s column, no purple line'}${row.length ? '' : ' (no row copy)'}`, ok, `heads ${J(r.heads)} · pucks ${J(r.pucks)}`, r.pic)
}

/* =================== S3 =================== */
async function s3(k) {
  const sz = SIZES[k], W = mk('s3', sz)
  const { b, p } = await world(sz, W, '2026-07-15T09:00:00')
  const NICK = 'nick'
  try {
    await signIn(p, 'ad', 'a')
    const man = await p.evaluate(id => { const q = window.PEOPLE[id]; return { cs: q.cs, seat: q.seat, san: !!q.san, sanFrom: q.sanFrom || null } }, NICK)
    W.rec('premise', 'the SANS man', man.san, `${J(man)} · today ${await today(p)}`)
    const seatWord = man.seat === 'FCP' ? 'Pilot' : 'WSO'
    await openBoard(p, W, 0)
    const g1 = await groundRowWith(p, W, 0, NICK)
    W.rec('s3-01', `Mon 13: ${man.cs} on a new ground row (tap row, tap his puck under SANS Avail)`, g1.row && g1.row.who === NICK, J(g1), await W.pic(p, '01-ground-mon'))
    while ((await p.evaluate(() => window.SBDAY)) < 3) await boardStep(p, W, 1)
    const g2 = await groundRowWith(p, W, 3, NICK)
    W.rec('s3-02', `Thu 16: ${man.cs} on a new ground row`, g2.row && g2.row.who === NICK, J(g2), await W.pic(p, '02-ground-thu'))
    await closeBoard(p, W)
    const t = await qualsTick(p, W, NICK, '03')
    W.rec('s3-03', 'Quals ✎ Edit: his SANS unticked', t.st.san === false, J(t.st), t.pic)
    const check = async (tag, sansDays, regDays) => {
      const r = await boardDays(p, W, NICK, [0, 1, 2, 3], tag)
      for (const d of [0, 1, 2, 3]) judgeDay(W, `s3-${tag}-${d}`, r[d], d, sansDays.includes(d), seatWord)
    }
    await check('04', [0, 1], [2, 3])
    await go(p, 'quals'); await W.press(p, '#undoBtn:visible', 'undo'); await sleep(600)
    W.rec('s3-05', 'top bar Undo', null, J(await p.evaluate(id => { const q = window.PEOPLE[id]; return { san: !!q.san, sanFrom: q.sanFrom || null, sanTo: q.sanTo || null } }, NICK)), await W.pic(p, '05-undo'))
    await check('06', [0, 1, 2, 3], [])
    await go(p, 'quals'); await W.press(p, '#redoBtn:visible', 'redo'); await sleep(600)
    W.rec('s3-07', 'top bar Redo', null, J(await p.evaluate(id => { const q = window.PEOPLE[id]; return { san: !!q.san, sanFrom: q.sanFrom || null, sanTo: q.sanTo || null } }, NICK)), await W.pic(p, '07-redo'))
    await check('08', [0, 1], [2, 3])
    await p.reload(); await signIn(p, 'ad', 'a')
    await check('09', [0, 1], [2, 3])
  } catch (e) {
    W.rec('s3-ERR', 'script stopped', false, String(e && e.message || e).slice(0, 400), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 8).join(' || '))
  await b.close()
}

/* =================== S4 =================== */
async function s4(k) {
  const sz = SIZES[k], W = mk('s4', sz)
  let { b, p } = await world(sz, W, '2026-07-15T09:00:00')
  try {
    await signIn(p, 'ad', 'a')
    const po = await postOutSans(p, W, HEX, '2026-07-15', '01')
    W.rec('s4-01', `Hex posted out as SANS from Wed 15 Jul (today ${await today(p)})`, po.after.san === true, `line "${po.line}" · ${J(po.after)}`, po.pic)
    await p.clock.fastForward('24:00:00'); await go(p, 'editsched'); await sleep(500)
    const t1 = await qualsTick(p, W, HEX, '02')
    W.rec('s4-02', `next day (${await today(p)}): his SANS unticked on Quals`, t1.st.san === false, J(t1.st), t1.pic)
    let r = await boardDays(p, W, HEX, [1, 2, 3], '03')
    judgeDay(W, 's4-03-tue', r[1], 1, false, 'WSO'); judgeDay(W, 's4-03-wed', r[2], 2, true, 'WSO'); judgeDay(W, 's4-03-thu', r[3], 3, false, 'WSO')
    await p.clock.fastForward('24:00:00'); await go(p, 'editsched'); await sleep(500)
    const t2 = await qualsTick(p, W, HEX, '04')
    W.rec('s4-04', `day after (${await today(p)}): his SANS ticked again by hand`, t2.st.san === true, J(t2.st), t2.pic)
    r = await boardDays(p, W, HEX, [1, 2, 3, 4], '05')
    judgeDay(W, 's4-05-tue', r[1], 1, false, 'WSO'); judgeDay(W, 's4-05-wed', r[2], 2, true, 'WSO'); judgeDay(W, 's4-05-thu', r[3], 3, true, 'WSO'); judgeDay(W, 's4-05-fri', r[4], 4, true, 'WSO')
  } catch (e) {
    W.rec('s4-ERR', 'script stopped (part 1)', false, String(e && e.message || e).slice(0, 400), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests (part 1)', W.errs.length === 0, W.errs.slice(0, 8).join(' || '))
  await b.close()
  /* part 2: a posting that has not run yet */
  const W2 = mk('s4b', sz);
  ({ b, p } = await world(sz, W2, '2026-07-15T09:00:00'))
  try {
    await signIn(p, 'ad', 'a')
    const po = await postOutSans(p, W2, HEX, '2026-07-16', '01')
    W2.rec('s4b-01', `Hex posted out as SANS from Thu 16 Jul (today ${await today(p)})`, true, `line "${po.line}" · ${J(po.after)}`, po.pic)
    const rowHtml = await p.evaluate(id => { const r = document.querySelector(`[data-testid="row-${id}"]`) || document.querySelector(`[data-testid="name-${id}"]`) || document.querySelector(`[data-testid="person-${id}"]`); return r ? (r.className + ' | ' + r.textContent.replace(/\s+/g, ' ').slice(0, 120)) : 'no row' }, HEX)
    W2.rec('s4b-02', 'his Leave War row today (record)', null, rowHtml, await W2.pic(p, '02-lw-row'))
    let r = await boardDays(p, W2, HEX, [2, 3, 4], '03')
    judgeDay(W2, 's4b-03-wed', r[2], 2, false, 'WSO'); judgeDay(W2, 's4b-03-thu', r[3], 3, false, 'WSO'); judgeDay(W2, 's4b-03-fri', r[4], 4, false, 'WSO')
    await p.clock.fastForward('24:00:00'); await go(p, 'leavewar'); await sleep(500); await go(p, 'editsched')
    W2.rec('s4b-04', `clock on one day: ${await today(p)}`, null, J(await p.evaluate(id => { const q = window.PEOPLE[id]; return { san: !!q.san, sanFrom: q.sanFrom || null } }, HEX)))
    r = await boardDays(p, W2, HEX, [2, 3], '05')
    judgeDay(W2, 's4b-05-wed', r[2], 2, false, 'WSO'); judgeDay(W2, 's4b-05-thu', r[3], 3, true, 'WSO')
  } catch (e) {
    W2.rec('s4b-ERR', 'script stopped (part 2)', false, String(e && e.message || e).slice(0, 400), await W2.pic(p, 'ERR').catch(() => ''))
  }
  W2.rec('errors', 'console / page errors / failed requests (part 2)', W2.errs.length === 0, W2.errs.slice(0, 8).join(' || '))
  await b.close()
}

for (const k of ONLY) {
  if (k === 's1d') await s1('d')
  if (k === 's1p') await s1('p')
  if (k === 's3d') await s3('d')
  if (k === 's3p') await s3('p')
  if (k === 's4d') await s4('d')
  if (k === 's4p') await s4('p')
  if (k === 's7d' || k === 's7p') { const { s7 } = await import('./sfd-w1-s7.mjs'); await s7(k.slice(2)) }
}
writeFileSync(path.join(OUT, `results-${ONLY.join('_')}.json`), JSON.stringify(results, null, 1))
log('done')
