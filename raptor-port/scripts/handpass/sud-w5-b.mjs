// sud-w5-b — A16 (deleting an offer brings the day back), A17 (each kind of planned item puts its day in the line; a
// remark does not), A18 (ALL AVAIL keeps its rule), A20 (the right person and date), A24 (the published day), each at
// both sizes in fresh contexts. D2338 walk, 23 Nov 26, chat 147.
// Run from raptor-port/:  RUN=<folder> ONLY=a16d,a16p,a17ad,... node scripts/handpass/sud-w5-b.mjs
import { L, S, run, NOTE17, TODAYW, crewOf, crewLine, firstShown, clip, boardCrew, bell, bellClose, bellLine, as, moveClock, commit, uncommit, closeSansWin, addWave, addSim, disarm } from './sud-w5-lib.mjs'
const { J, HEX, sleep } = L
const VERSION = 'sud-w5-b v1'
const ONLY = (process.env.ONLY || 'a16d,a16p,a17ad,a17ap,a17bd,a17bp,a18d,a18p,a20d,a20p,a24d,a24p').split(',')
console.log(VERSION, L.URL_, L.OUT, ONLY.join(','))
const THU = 3, FRI = 4, SAT = 5, SUN = 6
const OUTLAW = 'casper'
const isNote = (c, words) => { const x = firstShown(c); return !!x && x.title === 'Hex — ' + words && x.why === words }
const noFiled = c => { const x = firstShown(c); return !!x && !/no availability filed/.test(x.title + x.why) }
const sansL = b => b.sans.filter(l => !l.struck)

async function posting(p, W, id, who = HEX, nm = 'Hex') {
  const po = await L.postOut(p, W, who, '2026-07-17', id)
  const ok = /17 Jul: becomes SANS/.test(po.line)
  W.rec(id, `Wed 15: ${nm} posted out as SANS from Fri 17 Jul (Leave War cell → ⋯ → Post out, SANS; read back)`, ok, `line "${po.line}"`, po.pic)
  return ok
}
async function brief(p, W, di, name, from, to, who, id) {
  await L.openBoard(p, W, di)
  const g = await L.groundRow(p, W, di, name, from, to, who)
  const ok = !!(g.row && J(g.row.who || '').includes(who))
  W.rec(id, `board ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][di]}: Ground Programme ${name} ${from}–${to} naming ${who === HEX ? 'Hex' : who} (read back)`, ok, J(g.row), await W.pic(p, id))
  return g
}
async function hexBell(p, W, id, what) {
  const me = await as(p, W, 'hex', 'x')
  const b = await bell(p, W, id)
  await bellClose(p)
  return { me, b, what }
}

/* ---------- A16 ---------- */
async function a16(p, W) {
  if (!(await posting(p, W, 'a16-01'))) return
  const g = await brief(p, W, SAT, 'BRIEF', '08:00', '09:00', HEX, 'a16-02')
  await L.closeBoard(p, W)
  W.rec('a16-03', "clock set to Fri 17 Jul 09:00 (setSystemTime), reloaded, Saber signed in: the app's today", 'REC', await moveClock(p, W, '2026-07-17T09:00:00'))
  let hb = await hexBell(p, W, 'a16-04-bell')
  W.rec('a16-04', `Hex (${hb.me}): his bell names Sat 18 Jul, "Planned, no availability filed"`, sansL(hb.b).length === 1 && sansL(hb.b)[0].day === 'Sat 18 Jul' && sansL(hb.b)[0].what === 'Planned, no availability filed', bellLine(hb.b), hb.b.pic)
  await as(p, W, 'ad', 'a')
  let r = await boardCrew(p, W, SAT, 'a16-05-board')
  W.rec('a16-05', 'Saber, board Sat 18: the usual words', isNote(r.c, TODAYW), crewLine(r.c), r.pic)
  const c1 = await commit(p, W, '2026-07-18', HEX, ['oft'], 'all', 'a16-06')
  W.rec('a16-06', 'Saber files for Hex: Sat 18 Jul, OFT, All day (read back)', !!(c1.rec && c1.rec.person === HEX), J(c1.rec), c1.pic)
  await closeSansWin(p, W)
  r = await boardCrew(p, W, SAT, 'a16-07-board')
  W.rec('a16-07', 'board Sat 18 after the filing: no "nothing filed" words', noFiled(r.c), crewLine(r.c), r.pic)
  await L.closeBoard(p, W)
  const d = c1.iid ? await uncommit(p, W, '2026-07-18', c1.iid, 'a16-08') : { ok: false, why: 'nothing filed' }
  W.rec('a16-08', 'the commitment opened from Sat 18\'s SANS day, Delete (read back: gone)', d.ok, d.why || '', d.pic)
  await closeSansWin(p, W)
  r = await boardCrew(p, W, SAT, 'a16-09-board')
  W.rec('a16-09', 'board Sat 18 after the delete: the usual words are back', isNote(r.c, TODAYW), crewLine(r.c), r.pic)
  await L.closeBoard(p, W)
  const cc = await commit(p, W, '2026-07-18', HEX, ['oft'], 'all', 'a16-10', 'cancel')
  await closeSansWin(p, W)
  r = await boardCrew(p, W, SAT, 'a16-10-board')
  W.rec('a16-10', '+ Commitment for Hex on Sat 18 filled, then Cancel: nothing saved, the words stay', !!(cc.cancelled && cc.added.length === 0 && isNote(r.c, TODAYW)), `added ${J(cc.added)} · ${crewLine(r.c)}`, cc.pic + ', ' + r.pic)
  await L.closeBoard(p, W)
  const c19 = await commit(p, W, '2026-07-19', HEX, ['oft'], 'all', 'a16-11')
  await closeSansWin(p, W)
  r = await boardCrew(p, W, SAT, 'a16-11-board')
  const r19 = await boardCrew(p, W, SUN, 'a16-11b-board')
  W.rec('a16-11', 'Hex filed on Sun 19 (not Sat): Sat 18 keeps the usual words; Sun 19 has none', !!(c19.rec && isNote(r.c, TODAYW) && noFiled(r19.c)), `filed ${J(c19.rec)} · Sat: ${crewLine(r.c)} · Sun: ${crewLine(r19.c)}`, c19.pic + ', ' + r.pic + ', ' + r19.pic)
  await L.closeBoard(p, W)
  hb = await hexBell(p, W, 'a16-12-bell')
  W.rec('a16-12', 'Hex\'s bell after Saber\'s file / delete / cancel / Sun 19: still names Sat 18 Jul only', sansL(hb.b).length === 1 && sansL(hb.b)[0].day === 'Sat 18 Jul', bellLine(hb.b), hb.b.pic)
  /* Hex files Sat 18 himself, then deletes it */
  const c2 = await commit(p, W, '2026-07-18', null, ['oft'], 'all', 'a16-13')
  await closeSansWin(p, W)
  let b = await bell(p, W, 'a16-13-bell'); await bellClose(p)
  W.rec('a16-13', 'Hex files Sat 18 himself (OFT, All day): the SANS line goes from his bell', !!c2.rec && sansL(b).length === 0, `filed ${J(c2.rec)} · ${bellLine(b)}`, c2.pic + ', ' + b.pic)
  const d2 = c2.iid ? await uncommit(p, W, '2026-07-18', c2.iid, 'a16-14') : { ok: false }
  await closeSansWin(p, W)
  b = await bell(p, W, 'a16-14-bell'); await bellClose(p)
  W.rec('a16-14', 'Hex deletes it: Sat 18 comes back into the line', d2.ok && sansL(b).length === 1 && sansL(b)[0].day === 'Sat 18 Jul', bellLine(b), (d2.pic || '') + ', ' + b.pic)
  W.rec('a16-14r', 'the line come back: read or unread (RECORD)', 'REC', sansL(b).map(l => l.unread ? 'unread' : 'read').join(','))
}

/* ---------- A17: each kind of planned item (placed BEFORE the posting, while Hex is an ordinary WSO) ---------- */
async function place(p, W, di, sel, label) {
  await L.openBoard(p, W, di)
  const armed = await L.armAndPick(p, W, sel, HEX, label)
  await disarm(p, W)
  return armed
}
const holds = (p, di) => p.evaluate(([i, id]) => { const d = window.DAYS[i]; return JSON.stringify(d).includes('"' + id + '"') }, [di, HEX])
async function a17a(p, W) {
  /* Fri 17: a flying seat (WSO); Sat 18: an OFT seat; Sun 19: a ground row naming Saber with "Hex" typed in its remark */
  const wv = await addWave(p, W, FRI, 'AA1', '12:00', '13:30')
  const a1 = await place(p, W, FRI, `[data-slot="${FRI}.${wv.wi}.0.0.w"]`, 'fly')
  const of = await addSim(p, W, SAT, 'oft', 'OFTS', '09:00', '10:00')
  const a2 = await place(p, W, SAT, `[data-slot="s:${SAT}.oft.${of.ri}.w"]`, 'oft')
  const g = await brief(p, W, SUN, 'TALK', '10:00', '11:00', 'stiff', 'a17a-03')
  await L.typeBox(p, W, `[data-bfld="gr:${SUN}.${g.ri}.rmks"]`, 'Hex')
  const rm = await p.evaluate(([i, r]) => window.DAYS[i].ground[r].rmks, [SUN, g.ri])
  const h = [await holds(p, FRI), await holds(p, SAT), await holds(p, SUN)]
  W.rec('a17a-04', 'before the posting: Hex in the AA1 WSO seat Fri 17, the OFTS seat Sat 18; Sun 19 TALK names Saber, remark "Hex" (read back)', h[0] && h[1] && !h[2] && rm === 'Hex', `armed ${a1}, ${a2} · named on Fri/Sat/Sun ${h.join('/')} · remark "${rm}"`, await W.pic(p, 'a17a-04'))
  await L.closeBoard(p, W)
  if (!(await posting(p, W, 'a17a-05'))) return
  W.rec('a17a-06', "clock set to Fri 17 Jul 09:00, reloaded", 'REC', await moveClock(p, W, '2026-07-17T09:00:00'))
  const hb = await hexBell(p, W, 'a17a-07-bell')
  const l = sansL(hb.b)
  W.rec('a17a-07', 'Hex\'s bell: one line naming "Fri 17, Sat 18 Jul" (flying, OFT); Sun 19 (a remark only) not named', l.length === 1 && l[0].day === 'Fri 17, Sat 18 Jul', bellLine(hb.b), hb.b.pic)
}
async function a17b(p, W) {
  /* Fri 17: an AMT seat; Sat 18: a duty row AND a ground BRIEF (two items, one day); Sun 19: a ground row naming Saber
     then Hex added as a second person */
  const am = await addSim(p, W, FRI, 'amt', 'AMTF', '11:00', '12:00')
  const a1 = await place(p, W, FRI, `[data-slot="s:${FRI}.amt.${am.ri}.w"]`, 'amt')
  await L.openBoard(p, W, SAT)
  await W.press(p, L.B(`[data-dradd="${SAT}.0"]`), 'dradd'); await sleep(400)
  const dri = await p.evaluate(i => window.DAYS[i].dutywaves[0].rows.length - 1, SAT)
  await L.typeBox(p, W, `[data-bfld="dr:${SAT}.0.${dri}.role"]`, 'SDO2').catch(() => {})
  await L.typeBox(p, W, `[data-bfld="dr:${SAT}.0.${dri}.str"]`, '13:00').catch(() => {})
  await L.typeBox(p, W, `[data-bfld="dr:${SAT}.0.${dri}.end"]`, '15:00').catch(() => {})
  /* an empty duty row may draw its people box as a fill zone rather than a seat: whichever the board drew */
  const dz = (await p.locator(L.B(`[data-slot="d:${SAT}.0.${dri}"]`)).count()) ? `[data-slot="d:${SAT}.0.${dri}"]` : `[data-fill="d:${SAT}.0.${dri}.+"]`
  const a2 = await place(p, W, SAT, dz, 'duty')
  const gs = await brief(p, W, SAT, 'BRIEF', '08:00', '09:00', HEX, 'a17b-02')
  const gu = await brief(p, W, SUN, 'TALK', '10:00', '11:00', 'stiff', 'a17b-03')
  const a3 = await L.armAndPick(p, W, `[data-fill="g:${SUN}.${gu.ri}.+"]`, HEX, 'second'); await disarm(p, W)
  const rows = await p.evaluate(([i, r, s]) => ({ duty: window.DAYS[s].dutywaves[0].rows.at(-1), sun: window.DAYS[i].ground[r] }), [SUN, gu.ri, SAT])
  const h = [await holds(p, FRI), await holds(p, SAT), await holds(p, SUN)]
  W.rec('a17b-04', 'before the posting: Hex in the AMTF seat Fri 17, duty SDO2 + BRIEF Sat 18, second person on TALK Sun 19 (read back)', h.every(Boolean), `armed ${a1}, ${a2}, ${a3} · named on Fri/Sat/Sun ${h.join('/')} · duty ${J(rows.duty)} · Sun ${J(rows.sun)}`, await W.pic(p, 'a17b-04'))
  await L.closeBoard(p, W)
  if (!(await posting(p, W, 'a17b-05'))) return
  W.rec('a17b-06', "clock set to Fri 17 Jul 09:00, reloaded", 'REC', await moveClock(p, W, '2026-07-17T09:00:00'))
  const hb = await hexBell(p, W, 'a17b-07-bell')
  const l = sansL(hb.b)
  W.rec('a17b-07', 'Hex\'s bell: one line naming "Fri 17, Sat 18, Sun 19 Jul" — AMT, duty and brief (Sat once), second person', l.length === 1 && l[0].day === 'Fri 17, Sat 18, Sun 19 Jul', bellLine(hb.b), hb.b.pic)
}

/* ---------- A18: ALL AVAIL keeps its rule ---------- */
async function winRead(p, W, di, rid, id) {
  await L.openBoard(p, W, di)
  const r = await L.readCount(p, W, rid)
  const pic = await W.pic(p, id)
  await L.closeWin(p, W)
  return { r, pic, s: r.win && typeof r.win === 'object' ? `chip "${r.chip}" · ${r.win.n} people · Hex ${r.win.has ? 'IN' : 'out'} · ${r.win.who}` : `chip "${r.chip}" window ${J(r.win)}` }
}
async function a18(p, W) {
  if (!(await posting(p, W, 'a18-01'))) return
  const g = await brief(p, W, SAT, 'BRIEF', '08:00', '09:00', HEX, 'a18-02')
  const ev = await L.progRow(p, W, SAT, 'SQN EVENT', '10:00', '11:00')
  const evT = await (async () => { await L.openBoard(p, W, THU); return L.progRow(p, W, THU, 'SQN EVENT', '10:00', '11:00') })()
  W.rec('a18-03', 'Sat 18 and Thu 16: Common Programme SQN EVENT 10:00–11:00 for ALL AVAIL (read back)', !!(ev.row && evT.row && J(ev.row.who).includes('allavail') && J(evT.row.who).includes('allavail')), `Sat ${J(ev.row)} · Thu ${J(evT.row)}`, await W.pic(p, 'a18-03'))
  const s0 = await winRead(p, W, SAT, ev.row.rid, 'a18-04')
  const t0 = await winRead(p, W, THU, evT.row.rid, 'a18-05')
  W.rec('a18-04', 'Wed 15: Sat 18 window — Hex IN (named on BRIEF 08:00–09:00, clear of 10:00–11:00)', !!(s0.r.win && s0.r.win.has), s0.s, s0.pic)
  W.rec('a18-05', 'Wed 15: Thu 16 control — Hex IN as an ordinary man', !!(t0.r.win && t0.r.win.has), t0.s, t0.pic)
  await L.closeBoard(p, W)
  const same = (a, b) => a.r.chip === b.r.chip && a.r.win && b.r.win && a.r.win.n === b.r.win.n && a.r.win.who === b.r.win.who && a.r.win.has === b.r.win.has
  W.rec('a18-06', 'clock set to Fri 17 Jul 09:00, reloaded', 'REC', await moveClock(p, W, '2026-07-17T09:00:00'))
  const s1 = await winRead(p, W, SAT, ev.row.rid, 'a18-07')
  W.rec('a18-07', 'Fri 17: Sat 18 window — the same people and count as on Wed 15', same(s0, s1), s1.s, s1.pic)
  await L.closeBoard(p, W)
  /* Hex reads his line (a tap on it) */
  const hb = await hexBell(p, W, 'a18-08-bell')
  let tapped = 'no line'
  if (sansL(hb.b).length) {
    const sel = (await p.locator('#notifyBell:visible').count()) ? '#notifyBell:visible' : '#sbBell:visible'
    await W.press(p, sel, 'bell'); await sleep(400)
    await W.press(p, `[data-testid="${sansL(hb.b)[0].id}"]`, 'bell-line'); await sleep(800)
    tapped = `page ${await p.evaluate(() => window.CURPAGE)} · SANS day window ${await p.locator('[data-testid="win-sansday"]:visible').count()}`
  }
  W.rec('a18-08', 'Hex opens his bell and taps the SANS line (it is read)', 'REC', bellLine(hb.b) + ' · tap → ' + tapped, hb.b.pic + ', ' + await W.pic(p, 'a18-08-tapped'))
  await as(p, W, 'ad', 'a')
  const s2 = await winRead(p, W, SAT, ev.row.rid, 'a18-09')
  W.rec('a18-09', 'after Hex read the line: Sat 18 window the same', same(s0, s2), s2.s, s2.pic)
  await L.closeBoard(p, W)
  const c = await commit(p, W, '2026-07-18', HEX, ['oft'], 'all', 'a18-10')
  await closeSansWin(p, W)
  const s3 = await winRead(p, W, SAT, ev.row.rid, 'a18-10w')
  W.rec('a18-10', 'Saber files Hex Sat 18 OFT all day: Sat 18 window the same', !!c.rec && same(s0, s3), `filed ${J(c.rec)} · ${s3.s}`, c.pic + ', ' + s3.pic)
  /* his only named task removed (the row's ✕) */
  await W.press(p, L.B(`[data-grdel="${SAT}.${g.ri}"]`), 'grdel'); await sleep(500)
  const conf = p.getByRole('button', { name: /^(Remove|Delete|Yes)/ })
  if (await conf.count() && await conf.first().isVisible()) { await conf.first().click(); await sleep(400) }
  const gone = !(await p.evaluate(i => JSON.stringify(window.DAYS[i].ground).includes('"rocky"'), SAT))
  const s4 = await winRead(p, W, SAT, ev.row.rid, 'a18-11')
  W.rec('a18-11', 'BRIEF removed (Hex now named on nothing that day), an offer filed: Hex NOT in', gone && !!(s4.r.win && s4.r.win.has === false), `row gone ${gone} · ${s4.s}`, s4.pic)
  await L.closeBoard(p, W)
  const d = await uncommit(p, W, '2026-07-18', c.iid, 'a18-12')
  await closeSansWin(p, W)
  const g2 = await brief(p, W, SAT, 'BRIEF', '08:00', '09:00', HEX, 'a18-12b')
  const s5 = await winRead(p, W, SAT, ev.row.rid, 'a18-12w')
  W.rec('a18-12', 'offer deleted, BRIEF 08:00–09:00 naming Hex made again (outside the event\'s hours), no offer: Hex IN', d.ok && !!(s5.r.win && s5.r.win.has), `offer deleted ${d.ok} · ${s5.s}`, (d.pic || '') + ', ' + s5.pic)
  await L.typeBox(p, W, `[data-bfld="gr:${SAT}.${g2.ri}.str"]`, '10:30')
  await L.typeBox(p, W, `[data-bfld="gr:${SAT}.${g2.ri}.end"]`, '11:30')
  const row = await p.evaluate(([i, r]) => { const x = window.DAYS[i].ground[r]; return x.str + '–' + x.end }, [SAT, g2.ri])
  const s6 = await winRead(p, W, SAT, ev.row.rid, 'a18-13')
  W.rec('a18-13', `BRIEF moved to 10:30–11:30 (read ${row}), inside the event: Hex NOT in`, !!(s6.r.win && s6.r.win.has === false), s6.s, s6.pic)
  const t1 = await winRead(p, W, THU, evT.row.rid, 'a18-14')
  W.rec('a18-14', 'Thu 16 control again: Hex IN', !!(t1.r.win && t1.r.win.has), t1.s, t1.pic)
  await L.closeBoard(p, W)
}

/* ---------- A20: the right person and date ---------- */
async function a20(p, W) {
  if (!(await posting(p, W, 'a20-01'))) return
  if (!(await posting(p, W, 'a20-02', OUTLAW, 'Outlaw'))) return
  await brief(p, W, SAT, 'BRIEF', '08:00', '09:00', HEX, 'a20-03')
  await brief(p, W, SAT, 'BRIEF2', '09:00', '10:00', OUTLAW, 'a20-04')
  await L.closeBoard(p, W)
  /* before the posting's date: nobody may file Hex's SANS availability */
  const e1 = await commit(p, W, '2026-07-18', HEX, ['oft'], 'all', 'a20-05')
  await closeSansWin(p, W)
  W.rec('a20-05', 'Wed 15: Saber, + Commitment on Sat 18 — Hex is not offered in the person list', !!e1.noPerson || !!e1.disabled, e1.noPerson ? `offered: ${e1.opts.join(', ').slice(0, 300)}` : e1.disabled ? `"+ Commitment" off: ${e1.addWhy}` : `FILED ${J(e1.rec)}`, e1.pic)
  const me = await as(p, W, 'hex', 'x')
  const e2 = await commit(p, W, '2026-07-18', null, ['oft'], 'all', 'a20-06')
  await closeSansWin(p, W)
  W.rec('a20-06', `Wed 15: Hex (${me}) on Sat 18's SANS day — "+ Commitment" off, or nothing saved`, !!e2.disabled || !e2.iid, e2.disabled ? `off: "${e2.addWhy}"` : `record ${J(e2.rec)}`, e2.pic)
  await as(p, W, 'ad', 'a')
  W.rec('a20-07', "clock set to Fri 17 Jul 09:00, reloaded", 'REC', await moveClock(p, W, '2026-07-17T09:00:00'))
  const both = async (id) => { const r = await boardCrew(p, W, SAT, id); const o = await crewOf(p, '#schedBoard', OUTLAW); return { h: r.c, o, pic: r.pic } }
  const b0 = await both('a20-08-board')
  W.rec('a20-08', 'Fri 17, board Sat 18: Hex and Outlaw both read the usual words', isNote(b0.h, TODAYW) && firstShown(b0.o) && firstShown(b0.o).why === TODAYW, `Hex ${crewLine(b0.h)} · Outlaw ${crewLine(b0.o).replace(/Hex/g, 'Outlaw')}`, b0.pic)
  await L.closeBoard(p, W)
  const f1 = await commit(p, W, '2026-07-18', OUTLAW, ['fly'], 'all', 'a20-09'); await closeSansWin(p, W)
  const b1 = await both('a20-09-board')
  W.rec('a20-09', 'Outlaw filed for Sat 18: Hex keeps the usual words, Outlaw has none', !!f1.rec && isNote(b1.h, TODAYW) && firstShown(b1.o) && !/no availability/.test(firstShown(b1.o).why), `filed ${J(f1.rec)} · Hex ${crewLine(b1.h)} · Outlaw why "${(firstShown(b1.o) || {}).why}"`, f1.pic + ', ' + b1.pic)
  await L.closeBoard(p, W)
  const f2 = await commit(p, W, '2026-07-19', HEX, ['oft'], 'all', 'a20-10'); await closeSansWin(p, W)
  const b2 = await both('a20-10-board')
  W.rec('a20-10', 'Hex filed for Sun 19: Sat 18 still reads the usual words for Hex', !!f2.rec && isNote(b2.h, TODAYW), `filed ${J(f2.rec)} · ${crewLine(b2.h)}`, f2.pic + ', ' + b2.pic)
  await L.closeBoard(p, W)
  const f3 = await commit(p, W, '2026-07-18', HEX, ['oft'], 'all', 'a20-11'); await closeSansWin(p, W)
  const b3 = await both('a20-11-board')
  W.rec('a20-11', 'Hex filed for Sat 18: only his words go (Outlaw stays filed)', !!f3.rec && noFiled(b3.h) && firstShown(b3.o) && !/no availability/.test(firstShown(b3.o).why), `filed ${J(f3.rec)} · Hex ${crewLine(b3.h)} · Outlaw why "${(firstShown(b3.o) || {}).why}"`, f3.pic + ', ' + b3.pic)
  /* one shared commitment covering both: Fri 17 (both unfiled there) */
  const f0 = await boardCrew(p, W, FRI, 'a20-12-before')
  const fo = await crewOf(p, '#schedBoard', OUTLAW)
  await L.closeBoard(p, W)
  const f4 = await commit(p, W, '2026-07-17', [HEX, OUTLAW], ['oft'], 'all', 'a20-12'); await closeSansWin(p, W)
  const b4 = await boardCrew(p, W, FRI, 'a20-12-board')
  const o4 = await crewOf(p, '#schedBoard', OUTLAW)
  W.rec('a20-12', 'one shared commitment for Hex and Outlaw on Fri 17 (Several people): both lose the "nothing filed" words', f4.noPerson ? 'NW' : (!!f4.rec && noFiled(b4.c) && firstShown(o4) && !/no availability/.test(firstShown(o4).why)), f4.noPerson ? `the picker did not offer both: ${J(f4.opts)}` : `filed ${J(f4.rec)} · before: Hex "${(firstShown(f0.c) || {}).why}", Outlaw "${(firstShown(fo) || {}).why}" · after: Hex ${crewLine(b4.c)} · Outlaw why "${(firstShown(o4) || {}).why}"`, (f4.pic || '') + ', ' + b4.pic)
  await L.closeBoard(p, W)
}

/* ---------- A24: the published Saturday ---------- */
async function a24(p, W) {
  if (!(await posting(p, W, 'a24-01'))) return
  await brief(p, W, SAT, 'BRIEF', '08:00', '09:00', HEX, 'a24-02')
  const ev = await L.progRow(p, W, SAT, 'SQN EVENT', '10:00', '11:00')
  const lab = await L.publish(p, W, SAT)
  const pe0 = await L.pendingOf(p, SAT)
  const w0 = await winRead(p, W, SAT, ev.row.rid, 'a24-03')
  W.rec('a24-03', `Wed 15: Sat 18 (BRIEF Hex 08:00–09:00, SQN EVENT 10:00–11:00 ALL AVAIL) signed and published (${lab})`, pe0.pend === 0 && !pe0.notSigned && !!(w0.r.win && w0.r.win.has), `pending ${pe0.pend} · signed "${pe0.signed}" · ${w0.s}`, w0.pic)
  await L.closeBoard(p, W)
  const same = (pe, w) => pe.pend === 0 && !pe.notSigned && pe.signed === pe0.signed && w.r.chip === w0.r.chip && w.r.win && w.r.win.n === w0.r.win.n && w.r.win.who === w0.r.win.who
  /* the clock crosses into Fri 17 with the page open (setSystemTime), then the same after a reload */
  await p.clock.setSystemTime(new Date('2026-07-17T00:00:05')); await sleep(2500)
  const t1 = await L.today(p)
  const w1 = await winRead(p, W, SAT, ev.row.rid, 'a24-04')
  const pe1 = await L.pendingOf(p, SAT)
  const n1 = await crewOf(p, '#schedBoard')
  W.rec('a24-04', `clock moved past midnight into Fri 17 with the page open (${t1}): Sat 18 not pending, the same four names and crowd; Hex's note (RECORD)`, same(pe1, w1), `pending ${pe1.pend} · signed "${pe1.signed}" · ${w1.s} · note: ${crewLine(n1)}`, w1.pic)
  await L.closeBoard(p, W)
  const tR = await moveClock(p, W, '2026-07-17T09:00:00')
  const w2 = await winRead(p, W, SAT, ev.row.rid, 'a24-05')
  const pe2 = await L.pendingOf(p, SAT)
  const n2 = await crewOf(p, '#schedBoard')
  W.rec('a24-05', `reloaded on Fri 17 (${tR}): Sat 18 not pending, the same names and crowd; Hex's note the usual words`, same(pe2, w2) && isNote(n2, TODAYW), `pending ${pe2.pend} · signed "${pe2.signed}" · ${w2.s} · note: ${crewLine(n2)}`, w2.pic)
  await L.closeBoard(p, W)
  const hb = await hexBell(p, W, 'a24-06-bell')
  let tap = ''
  if (sansL(hb.b).length) {
    const sel = (await p.locator('#notifyBell:visible').count()) ? '#notifyBell:visible' : '#sbBell:visible'
    await W.press(p, sel, 'bell'); await sleep(400)
    await W.press(p, `[data-testid="${sansL(hb.b)[0].id}"]`, 'bell-line'); await sleep(800)
    tap = `page ${await p.evaluate(() => window.CURPAGE)}`
  }
  W.rec('a24-06', 'Hex reads his line (tap): it names Sat 18 Jul', sansL(hb.b).length === 1 && sansL(hb.b)[0].day === 'Sat 18 Jul', bellLine(hb.b) + ' · tap → ' + tap, hb.b.pic + ', ' + await W.pic(p, 'a24-06-tapped'))
  await as(p, W, 'ad', 'a')
  const w3 = await winRead(p, W, SAT, ev.row.rid, 'a24-07')
  const pe3 = await L.pendingOf(p, SAT)
  W.rec('a24-07', 'after Hex read the line: Sat 18 not pending, the same names and crowd', same(pe3, w3), `pending ${pe3.pend} · signed "${pe3.signed}" · ${w3.s}`, w3.pic)
  await L.closeBoard(p, W)
  await p.reload(); await sleep(1500)
  if (await p.locator('#luser:visible').count()) await L.signIn(p, 'ad', 'a')
  const w4 = await winRead(p, W, SAT, ev.row.rid, 'a24-08')
  const pe4 = await L.pendingOf(p, SAT)
  W.rec('a24-08', 'and after another reload: Sat 18 not pending, the same', same(pe4, w4), `pending ${pe4.pend} · signed "${pe4.signed}" · ${w4.s}`, w4.pic)
  /* RECORD which copy drives the line. First a working-copy-only ADDITION: Sun 19 published without Hex, then Hex added
     on a new row (pending) */
  await L.openBoard(p, W, SUN)
  const labS = await L.publish(p, W, SUN)
  const peS = await L.pendingOf(p, SUN)
  await brief(p, W, SUN, 'TALK', '10:00', '11:00', HEX, 'a24-09')
  const peS2 = await L.pendingOf(p, SUN)
  await L.closeBoard(p, W)
  const hb3 = await hexBell(p, W, 'a24-10-bell')
  W.rec('a24-10', `Sun 19 published without Hex (${labS}, pending ${peS.pend}), then Hex named on a new TALK in the working copy only (pending ${peS2.pend}) — does his line name Sun 19? (RECORD)`, 'REC', bellLine(hb3.b), hb3.b.pic)
  await as(p, W, 'ad', 'a')
  /* then a working-copy-only REMOVAL on the published Saturday (last: the Undo list clears at a sign-out, D148) */
  await L.openBoard(p, W, SAT)
  const gri = await p.evaluate(i => window.DAYS[i].ground.findIndex(r => JSON.stringify(r).includes('"rocky"')), SAT)
  await W.press(p, L.B(`[data-grdel="${SAT}.${gri}"]`), 'grdel'); await sleep(500)
  const conf = p.getByRole('button', { name: /^(Remove|Delete|Yes)/ })
  if (await conf.count() && await conf.first().isVisible()) { await conf.first().click(); await sleep(400) }
  const gone = !(await p.evaluate(i => JSON.stringify(window.DAYS[i].ground).includes('"rocky"'), SAT))
  const pe5 = await L.pendingOf(p, SAT)
  await L.closeBoard(p, W)
  const hb2 = await hexBell(p, W, 'a24-11-bell')
  W.rec('a24-11', `working copy only: Hex's BRIEF removed from the published Sat 18 (removed ${gone}, pending ${pe5.pend}) — does his line still name Sat 18? (RECORD which copy drives it)`, 'REC', bellLine(hb2.b), hb2.b.pic)
}

const FN = { a16, a17a, a17b, a18, a20, a24 }
for (const k of ONLY) { const name = k.slice(0, -1), sz = k.slice(-1); if (FN[name]) await run(name, sz, FN[name]) }
L.saveResults('b-' + ONLY.join('_'))
console.log('done')
