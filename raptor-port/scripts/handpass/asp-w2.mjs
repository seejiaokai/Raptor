// Walker w2 — ALL AVAIL counts a man posted out as SANS (22 Nov 26, chat 141). Brief:
// docs/superpowers/briefs/2026-11-22-allavail-sans-posted-walk-brief.md. Scenarios S22, S28, S23, S8, S12, S13, S3, each at
// two sizes in a fresh browser context, clock Wed 15 Jul 26 09:00 installed before the app loads and left running.
// Run from raptor-port/:  ONLY=s22d,s22p node scripts/handpass/asp-w2.mjs
import * as L from './asp-w2-lib.mjs'
const { sleep, J, HEX, brief, agree } = L
const VERSION = 'asp-w2 v10'
const ONLY = (process.env.ONLY || 's22d,s22p,s28d,s28p,s23d,s23p,s8d,s8p,s12d,s12p,s13d,s13p,s3d,s3p').split(',')
console.log(VERSION, L.URL_, ONLY.join(','))
const SAT = 5

async function run(name, szKey, fn) {
  const sz = L.SIZES[szKey], W = L.mk(name, sz)
  const { b, p } = await L.world(sz, W)
  try {
    await L.signIn(p, 'ad', 'a')
    W.rec('today', "the app's today", null, await L.today(p))
    await fn(p, W)
  } catch (e) {
    W.rec('ERR', 'script stopped', false, String(e && e.message || e).slice(0, 400), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 8).join(' || '))
  await b.close()
}
const rec3 = (W, id, what, rs, ok, okState = ok) => rs.forEach((r, i) => W.rec(`${id}.${['off', 'on', 'off2'][i]}`, what + ` — "+ SANS" ${['off', 'on', 'off again'][i]}`, okState, brief(r), r.pic))

/* ---------- S22: the briefing inside the event's hours ---------- */
async function s22(p, W) {
  const po = await L.postOut(p, W, HEX, '2026-07-15', 's22-01')
  W.rec('s22-01', 'Hex posted out as SANS from Wed 15 Jul (his cell → ⋯ → Post out → SANS → Post out)', po.after.san === true, `line "${po.line}" · ${J(po.after)}`, po.pic)
  const f = await L.mainFixture(p, W, SAT, HEX, ['11:00', '12:00'])
  W.rec('s22-02', 'Saturday: BRIEF 11:00–12:00 naming Hex, SQN EVENT 10:00–17:00 for ALL AVAIL, made on the board', f.ok, J({ g: f.g.row, a: f.a.row }), await W.pic(p, '02-fixture'))
  await L.closeBoard(p, W)
  const rs = await L.bothWays(p, W, SAT, f.a.row.rid, 's22-03')
  const ok = agree(rs, false)
  rec3(W, 's22-03', "SQN EVENT's ALL AVAIL window: Hex NOT in the crowd (his briefing clashes)", rs, ok)
}

/* ---------- S28: a posting with no chip chosen ---------- */
async function s28(p, W) {
  const po = await L.postOut(p, W, HEX, '2026-07-15', 's28-01', 'none')
  W.rec('s28-01', 'Hex posted out from Wed 15 Jul with NO chip chosen (the chosen Overseas Sqn tapped again)', null, `chips before ${po.chips0} · after ${po.chips1} · line "${po.line}" · ${J(po.after)}`, po.pic)
  const arch = await p.evaluate(id => ({ archived: !!window.PEOPLE[id].archived, san: !!window.PEOPLE[id].san }), HEX)
  W.rec('s28-01b', 'his record after the posting (read only)', null, J(arch))
  const f = await L.mainFixture(p, W, SAT)
  const offered = f.g.row && JSON.stringify(f.g.row.who || '').includes(HEX)
  W.rec('s28-02', 'Saturday: BRIEF 08:00–09:00 naming Hex, SQN EVENT 10:00–17:00 for ALL AVAIL', f.ok ? true : null, J({ g: f.g.row, a: f.a.row, offered }), await W.pic(p, '02-fixture'))
  await L.closeBoard(p, W)
  if (!f.a.row) return
  const rs = await L.bothWays(p, W, SAT, f.a.row.rid, 's28-03')
  rec3(W, 's28-03', "SQN EVENT's ALL AVAIL window: Hex NOT in the crowd (posted out, no SANS)", rs, agree(rs, false))
}

/* ---------- S23: ALL AVAIL on a duty desk and a sim seat ---------- */
async function s23(p, W) {
  const po = await L.postOut(p, W, HEX, '2026-07-15', 's23-01')
  W.rec('s23-01', 'Hex posted out as SANS from Wed 15 Jul', po.after.san === true, `line "${po.line}" · ${J(po.after)}`, po.pic)
  await L.openBoard(p, W, SAT)
  const g = await L.groundRow(p, W, SAT, 'BRIEF', '08:00', '09:00', HEX)
  /* the SDO desk: its hours, then ALL AVAIL on its people line */
  await L.typeBox(p, W, `[data-bfld="dr:${SAT}.0.0.str"]`, '10:00')
  await L.typeBox(p, W, `[data-bfld="dr:${SAT}.0.0.end"]`, '17:00')
  const armD = await L.armAndPick(p, W, `[data-fill="d:${SAT}.0.0.+"]`, 'allavail', 'duty')
  /* a new OFT session 10:00–17:00, ALL AVAIL in its front seat */
  await W.press(p, L.B(`[data-sradd="${SAT}.oft"]`), 'sim-add')
  const si = await p.evaluate(i => window.DAYS[i].sims.oft.length - 1, SAT)
  await L.typeBox(p, W, `[data-bfld="sr:${SAT}.oft.${si}.label"]`, 'EP-9').catch(() => {})
  await L.typeBox(p, W, `[data-bfld="sr:${SAT}.oft.${si}.str"]`, '10:00')
  await L.typeBox(p, W, `[data-bfld="sr:${SAT}.oft.${si}.end"]`, '17:00')
  const armS = await L.armAndPick(p, W, `[data-slot="s:${SAT}.oft.${si}.p"]`, 'allavail', 'sim')
  /* a second OFT session 10:00–17:00, ALL AVAIL in its BACK seat (nothing stands after that seat's chip) */
  await W.press(p, L.B(`[data-sradd="${SAT}.oft"]`), 'sim-add2')
  const sj = await p.evaluate(i => window.DAYS[i].sims.oft.length - 1, SAT)
  await L.typeBox(p, W, `[data-bfld="sr:${SAT}.oft.${sj}.label"]`, 'EP-10').catch(() => {})
  await L.typeBox(p, W, `[data-bfld="sr:${SAT}.oft.${sj}.str"]`, '10:00')
  await L.typeBox(p, W, `[data-bfld="sr:${SAT}.oft.${sj}.end"]`, '17:00')
  const armS2 = await L.armAndPick(p, W, `[data-slot="s:${SAT}.oft.${sj}.w"]`, 'allavail', 'sim2')
  const rows = await p.evaluate(([i, s, t]) => { const d = window.DAYS[i]; const dr = d.dutywaves[0].rows[0]; const sr = d.sims.oft[s], s2 = d.sims.oft[t]; return { duty: { role: dr.role, str: dr.str, end: dr.end, who: dr.who, more: dr.more, rid: dr.rid }, sim: { label: sr.label, str: sr.str, end: sr.end, p: sr.p, rid: sr.rid }, sim2: { label: s2.label, str: s2.str, end: s2.end, w: s2.w, rid: s2.rid } } }, [SAT, si, sj])
  const okD = JSON.stringify(rows.duty).includes('allavail'), okS = JSON.stringify(rows.sim).includes('allavail'), okS2 = JSON.stringify(rows.sim2).includes('allavail')
  W.rec('s23-02', `Saturday: BRIEF 08:00–09:00 naming Hex; ALL AVAIL on the SDO desk 10:00–17:00 (armed ${armD}), on OFT session EP-9's front seat (armed ${armS}) and on OFT session EP-10's back seat (armed ${armS2}), each 10:00–17:00`, okD && okS && okS2 && !!g.row, J({ brief: g.row, ...rows }), await W.pic(p, '02-fixture'))
  await L.closeBoard(p, W)
  /* EP-9 last: a press on its chip arms the empty back seat, and while a seat is armed the board draws no count chips */
  const [rd, rsim2, rsim] = await L.bothWays(p, W, SAT, [rows.duty.rid, rows.sim2.rid, rows.sim.rid], 's23-03')
  rec3(W, 's23-03d', "the SDO desk's count door: its window lists Hex", rd, agree(rd, true))
  rec3(W, 's23-03s', "OFT EP-9 (front seat)'s count door: a press on it opens its window listing Hex", rsim, agree(rsim, true))
  rec3(W, 's23-03t', "OFT EP-10 (back seat)'s count door: its window lists Hex", rsim2, agree(rsim2, true))
}

/* ---------- S8: a posting dated tomorrow, before and after midnight ---------- */
async function s8(p, W) {
  const po = await L.postOut(p, W, HEX, '2026-07-16', 's8-01')
  W.rec('s8-01', 'on Wed 15 Jul: Hex posted out as SANS from Thu 16 Jul', null, `line "${po.line}" · ${J(po.after)}`, po.pic)
  const f = await L.mainFixture(p, W, SAT)
  W.rec('s8-02', 'Saturday: BRIEF 08:00–09:00 naming Hex, SQN EVENT 10:00–17:00 for ALL AVAIL', f.ok, J({ g: f.g.row, a: f.a.row }), await W.pic(p, '02-fixture'))
  await L.closeBoard(p, W)
  const r1 = await L.bothWays(p, W, SAT, f.a.row.rid, 's8-03-before')
  rec3(W, 's8-03', `before midnight (${await L.today(p)}): RECORD who is in`, r1, 'REC')
  const same1 = r1.every(r => r.win && r.win.has === r1[0].win.has && r.win.who === r1[0].win.who)
  W.rec('s8-03x', 'before midnight: the same answer with "+ SANS" off, on and off again', same1, r1.map(r => r.win && r.win.has).join('/'))
  /* the clock moved past midnight with the app left open */
  await L.go(p, 'editsched')
  await p.clock.fastForward('15:30:00'); await sleep(1500)
  const t2 = await L.today(p)
  const st2 = await p.evaluate(id => { const q = window.PEOPLE[id]; return { san: !!q.san, sanFrom: q.sanFrom || null } }, HEX)
  W.rec('s8-04', `the clock moved to ${t2} with the app open (read: Hex's record ${J(st2)})`, null, '', await W.pic(p, '04-after-midnight'))
  const r2 = await L.bothWays(p, W, SAT, f.a.row.rid, 's8-05-open')
  rec3(W, 's8-05', 'after midnight, app left open: Hex IN the crowd', r2, agree(r2, true))
  /* reopened */
  await p.reload(); await sleep(1500)
  if (await p.locator('#luser:visible').count()) await L.signIn(p, 'ad', 'a')
  else await p.waitForSelector('#vWeek .day', { state: 'attached' })
  W.rec('s8-06', `reopened (reload) on ${await L.today(p)}`, null, await L.weekOf(p), await W.pic(p, '06-reopened'))
  const r3 = await L.bothWays(p, W, SAT, f.a.row.rid, 's8-07-reopen')
  rec3(W, 's8-07', 'after midnight, reopened: Hex IN the crowd', r3, agree(r3, true))
  W.rec('s8-07x', 'left open and reopened agree', r2[0].win && r3[0].win && r2[0].win.who === r3[0].win.who, '')
}

/* ---------- S12: S1 published, then "Undo post out" ---------- */
async function s12(p, W) {
  const po = await L.postOut(p, W, HEX, '2026-07-15', 's12-01')
  W.rec('s12-01', 'Hex posted out as SANS from Wed 15 Jul', po.after.san === true, `line "${po.line}" · ${J(po.after)}`, po.pic)
  const f = await L.mainFixture(p, W, SAT)
  const r0 = await L.readCount(p, W, f.a.row.rid)
  W.rec('s12-02', 'Saturday fixture made; the count door before Publish lists Hex', r0.win && r0.win.has === true, `chip "${r0.chip}" ${J(r0.win)}`, await W.pic(p, '02-win-before-publish'))
  await L.closeWin(p, W)
  const lab = await L.publish(p, W, SAT)
  const pe = await L.pendingOf(p, SAT)
  W.rec('s12-03', `four sign-offs and Publish (${lab})`, pe.pend === 0 && !pe.notSigned && /SIGNED/i.test(pe.signed), J(pe), await W.pic(p, '03-published'))
  await L.closeBoard(p, W)
  const lw0 = await L.lwCell(p, W, HEX, '2026-07-18')
  W.rec('s12-04', "Hex's Leave War cell for Sat 18 Jul after Publish", /^FO/.test(lw0.text), `"${lw0.text}"`, await W.pic(p, '04-lw-cell'))
  /* Undo post out: his cell on Wed 15 → ⋯ → Post out → Undo post out */
  const c = (await L.lwCell(p, W, HEX, '2026-07-15')).cell
  await W.press(p, c, 'cell-15')
  const sheetPic = await W.pic(p, '05a-sheet')
  if (await p.locator('[data-testid="bid-more"]:visible').count()) await W.press(p, '[data-testid="bid-more"]:visible', 'more')
  if (await p.locator('[data-testid="bid-postout"]:visible').count()) await W.press(p, '[data-testid="bid-postout"]:visible', 'postout')
  const undoBtn = p.locator('[data-testid="postout-undo"]:visible').first()
  const hasUndo = await undoBtn.count()
  const pic5 = await W.pic(p, '05b-postout-sheet')
  if (!hasUndo) { W.rec('s12-05', '"Undo post out" on the posting sheet', 'NW', 'no Undo post out button found', sheetPic + ', ' + pic5); return }
  await W.press(p, undoBtn, 'undo-postout'); await sleep(900)
  const said = await L.toastSaid(p)
  const st = await p.evaluate(id => { const q = window.PEOPLE[id]; return { san: !!q.san, archived: !!q.archived, seat: q.seat } }, HEX)
  W.rec('s12-05', '"Undo post out" pressed: Hex an ordinary WSO again (read)', st.san === false && !st.archived, `note "${said}" · ${J(st)}`, pic5 + ', ' + await W.pic(p, '05c-after-undo'))
  if (await p.locator('[data-testid="bid-cancel"]:visible, [data-testid="postout-cancel"]:visible').count()) await W.press(p, '[data-testid="bid-cancel"]:visible, [data-testid="postout-cancel"]:visible', 'sheet-x')
  const lw1 = await L.lwCell(p, W, HEX, '2026-07-18')
  W.rec('s12-06', "his Leave War cell for Sat 18 Jul after the undo (RECORD)", 'REC', `"${lw1.text}"`, await W.pic(p, '06-lw-cell'))
  /* the published Saturday on Edit Schedule */
  await L.go(p, 'editsched')
  await p.locator(`#eWeek section.day[data-day="${SAT}"]`).first().evaluate(e => e.scrollIntoView({ block: 'start', inline: 'center' })); await sleep(400)
  const pe2 = await L.pendingOf(p, SAT)
  W.rec('s12-07', 'the published Saturday after the undo: pending and the sign-offs (RECORD)', 'REC', J(pe2), await W.pic(p, '07-editsched-sat'))
  const pl = await L.pendingLines(p, W, SAT)
  W.rec('s12-07b', "the Saturday's pending list, if any (RECORD)", 'REC', pl.open ? pl.lines : 'no "N pending" drawn', pl.open ? await W.pic(p, '07b-pending') : '')
  await p.keyboard.press('Escape'); await sleep(300)
  /* the bell */
  const bell = p.locator('button.bellbtn:visible').first()
  if (await bell.count()) {
    await W.press(p, bell, 'bell'); await sleep(500)
    W.rec('s12-08', 'the bell after the undo (RECORD)', 'REC', await L.txtOf(p, '[data-testid="bell-list"]'), await W.pic(p, '08-bell'))
    await p.keyboard.press('Escape'); await sleep(300)
    if (await p.locator('[data-testid="bell-list"]:visible').count()) { await p.mouse.click(5, 400); await sleep(300) }
  } else W.rec('s12-08', 'the bell', 'NW', 'no bell button drawn')
  /* the changes window (the clock on Edit Schedule) */
  await L.go(p, 'editsched')
  const hb = p.locator('#histBtn:visible').first()
  if (await hb.count()) {
    await W.press(p, hb, 'changes'); await sleep(700)
    const txt = await p.evaluate(() => [...document.querySelectorAll('.floatwin, .chgwin, [class*="chgwin"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ')).sort((a, b) => b.length - a.length)[0] || '')
    W.rec('s12-09', 'the changes window after the undo (RECORD)', 'REC', txt.slice(0, 700), await W.pic(p, '09-changes'))
    await p.keyboard.press('Escape'); await sleep(300)
  } else W.rec('s12-09', 'the changes window', 'NW', 'no clock button drawn on Edit Schedule')
  /* the working crowd, both ways: Hex in, no purple line */
  const rs = await L.bothWays(p, W, SAT, f.a.row.rid, 's12-10')
  rec3(W, 's12-10', 'after the undo: Hex in the crowd, an ordinary WSO (no purple line)', rs, agree(rs, true) && rs.every(r => r.win.san === false))
  W.rec('s12-10x', 'the Saturday pending count across the switch (read from each reading)', rs.every(r => r.pend.pend === rs[0].pend.pend), rs.map(r => r.pend.pend).join('/'))
}

/* ---------- S13: a SANS man archived after a published crowd day ---------- */
async function s13(p, W) {
  const TUE = 1, THU = 3
  const po = await L.postOut(p, W, HEX, '2026-07-13', 's13-01')
  W.rec('s13-01', 'Hex posted out as SANS from Mon 13 Jul (a past date)', po.after.san === true, `line "${po.line}" · ${J(po.after)}`, po.pic)
  const ft = await L.mainFixture(p, W, TUE, HEX, ['11:00', '11:30'], ['12:00', '14:00'])
  const rt0 = await L.readCount(p, W, ft.a.row.rid)
  W.rec('s13-02', 'Tue 14 Jul: BRIEF 11:00–11:30 naming Hex, SQN EVENT 12:00–14:00 for ALL AVAIL (Hex flies VL 08:40–10:05 that day); its window before Publish', ft.ok && rt0.win && rt0.win.has === true, `${J({ g: ft.g.row, a: ft.a.row })} chip "${rt0.chip}" ${J(rt0.win)}`, await W.pic(p, '02-tue-win'))
  await L.closeWin(p, W)
  const lab = await L.publish(p, W, TUE)
  const pe = await L.pendingOf(p, TUE)
  W.rec('s13-03', `Tue 14 Jul signed and published (${lab})`, pe.pend === 0 && !pe.notSigned, J(pe), await W.pic(p, '03-tue-published'))
  await L.closeBoard(p, W)
  const fh = await L.mainFixture(p, W, THU, HEX, ['11:00', '11:30'], ['12:00', '14:00'])
  const rh0 = await L.readCount(p, W, fh.a.row.rid)
  W.rec('s13-04', 'Thu 16 Jul: the same two items, not published (Hex flies RU 16:45 that day); its window before the archive', fh.ok && rh0.win && rh0.win.has === true, `chip "${rh0.chip}" ${J(rh0.win)}`, await W.pic(p, '04-thu-win'))
  await L.closeWin(p, W); await L.closeBoard(p, W)
  const ar = await L.archive(p, W, HEX, 's13-05')
  W.rec('s13-05', 'Hex archived on Admin → Users (his row → Archive)', ar.archived, `note "${ar.said}"`, ar.pic)
  const rt = await L.bothWays(p, W, TUE, ft.a.row.rid, 's13-06-tue')
  rec3(W, 's13-06', "Tue 14 Jul's crowd after the archive: Hex still IN", rt, agree(rt, true))
  const rh = await L.bothWays(p, W, THU, fh.a.row.rid, 's13-07-thu')
  rec3(W, 's13-07', "Thu 16 Jul's crowd after the archive: Hex NOT in", rh, agree(rh, false))
  const pl = await L.pendingLines(p, W, TUE)
  const ptue = await L.pendingOf(p, TUE)
  W.rec('s13-08', "Tue 14 Jul's pending count and lines after the archive (RECORD)", 'REC', `${J(ptue)} · lines: ${pl.open ? pl.lines : 'no "N pending" drawn'}`, pl.open ? await W.pic(p, '08-tue-pending') : await W.pic(p, '08-tue-nopending'))
  const bad = pl.open && /SQN EVENT|ALL AVAIL|OIL/i.test(pl.lines)
  W.rec('s13-08x', "no Tue pending line is about the event's crowd or OIL", !bad, bad ? 'a line names the event / ALL AVAIL / OIL — see the lines above' : '')
  await p.keyboard.press('Escape'); await sleep(300)
}

/* ---------- S3: a new person joining Fri 17 Jul, ticked SANS, named on Thu 16 ---------- */
async function s3(p, W) {
  const THU = 3
  const np = await L.newPerson(p, W, 'Quokka', 'QK', 'RCP', 'C', '2026-07-17', 's3-01')
  W.rec('s3-01', 'Admin → Users: New person Quokka, WSO, post-in Fri 17 Jul, Add person', !!np.id, `id ${np.id} ${J(np.rec)} · post-in box ${np.tagName} value "${np.piVal}" · note "${np.said}"`, np.pic)
  if (!np.id) return
  const q = await L.qualsTick(p, W, np.id, 's3-02')
  W.rec('s3-02', 'Quals: SANS ticked for Quokka by hand', q.st && q.st.san === true, J(q.st), q.pic)
  await L.openBoard(p, W, THU)
  const offered = await p.locator(`#schedBoard .rpuck[data-person="${np.id}"]:visible`).count()
  W.rec('s3-03', `Thu 16 Jul board: Quokka offered in the crew list (${offered} copies)`, null, '', await W.pic(p, '03-crew'))
  let g = null
  if (offered) g = await L.groundRow(p, W, THU, 'BRIEF', '08:00', '09:00', np.id)
  else g = await L.groundRow(p, W, THU, 'BRIEF', '08:00', '09:00', null)
  const a = await L.progRow(p, W, THU, 'SQN EVENT', '10:00', '17:00')
  W.rec('s3-04', 'Thu 16 Jul: BRIEF 08:00–09:00 ' + (offered ? 'naming Quokka' : '(Quokka could not be named: not in the crew list)') + ', SQN EVENT 10:00–17:00 for ALL AVAIL', offered ? JSON.stringify(g.row || '').includes(np.id) : null, J({ g: g.row, a: a.row }), await W.pic(p, '04-fixture'))
  await L.closeBoard(p, W)
  const rs = await L.bothWays(p, W, THU, a.row.rid, 's3-05', np.id)
  rs.forEach((r, i) => W.rec(`s3-05.${['off', 'on', 'off2'][i]}`, `Quokka in the crowd? — "+ SANS" ${['off', 'on', 'off again'][i]} (RECORD)`, 'REC', `chip "${r.chip}", window ${r.win && r.win.n} people, Quokka ${r.win && r.win.has ? 'IN' : 'out'}`, r.pic))
  const same = rs.every(r => r.win && r.win.has === rs[0].win.has && r.win.who === rs[0].win.who)
  W.rec('s3-05x', 'the same answer in both switch positions', same, rs.map(r => r.win && r.win.has).join('/'))
}

const FN = { s22, s28, s23, s8, s12, s13, s3 }
for (const k of ONLY) { const name = k.slice(0, -1), sz = k.slice(-1); if (FN[name]) await run(name, sz, FN[name]) }
L.saveResults(ONLY.join('_'))
console.log('done')
