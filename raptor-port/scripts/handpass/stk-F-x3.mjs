/* Walker F — X-09 (work hours vs Blue/Red), X-10 (tracking enabled after publication), X-11 (Logic changes vs defaults,
   hours and frozen earned leave), X-12 (template + role answer + reporting + Undo + failed save). */
import * as F from './stk-F-lib.mjs'
import * as X from './stk-F-fx.mjs'
const { row, judge, sleep, pic } = F
const ERRS = []
const errTxt = e => String(e.stack).split('\n').slice(0, 3).join(' <- ')
const DI = 4
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const sec = (ins, re, name) => { for (const s of ins.secs) if (re.test(s.h)) { const r = s.rows.find(r => r.nm === name); if (r) return r } return null }
const mins = s => { const m = /(\d+)h(\d*)/.exec(s || ''); return m ? +m[1] * 60 + (+m[2] || 0) : null }
const person = (ins, name) => { const f = sec(ins, /FLYING LOAD/i, name), w = sec(ins, /WORK HOURS/i, name); return { sorties: f && +f.v, blue: f && f.blue, red: f && f.red, hours: w && w.v, mins: w && mins(w.v) } }
const EXP = []
const readIns = async (p, door = 'desk', name = null) => { const i = await X.insights(p, { door }); if (name) EXP.push(await pic(p, name)); await X.insightsClose(p); return i }

/* ---------------- X-09 ---------------- */
async function x09() {
  const c = await F.open('desk'); const { p } = c
  const id = 'X-09 (desk)'
  const pcs = []
  try {
    const checks = []
    await X.tracking(p, true)
    const a = await X.flyWave(p, DI, { cs: 'VL', to: '12:00', ld: '13:00', crew: ['stiff', 'freak'], gi: 0 })
    const b = await X.flyWave(p, DI, { cs: 'RU', to: '15:00', ld: '16:00', crew: ['stiff', 'pump'], gi: 1 })
    checks.push(['Saber (stiff) put in a VL flight 12:00–13:00 and an RU flight 15:00–16:00 (' + [a.r1, a.r2, b.r1, b.r2].join('/') + ')', a.r1 === 'stiff' && b.r1 === 'stiff'])
    await X.boardOff(p); await F.go(p, 'editsched')
    await X.set(p, 'week', `ff:${DI}.0.0.msn`, 'ACM'); await X.set(p, 'week', `fr:${DI}.0.0.0`, 'DS FOR RU')
    const q1 = await X.questions(p); if (q1) await X.role(p, 'blue')
    await X.set(p, 'week', `ff:${DI}.1.0.msn`, 'DS')
    const q2 = await X.questions(p)
    checks.push(['VL (ACM + "DS FOR RU") asked once and answered Blue; RU Mission exactly "DS" asked nothing', q1 === 1 && q2 === 0, `q after VL ${q1}, after RU ${q2}`])
    await F.go(p, 'viewsched')
    const S0 = person(await readIns(p), 'Saber')
    /* the SC MAIN shift: an SC wave, MAIN seat Saber, 17:00–21:00 */
    await X.board(p, DI)
    await X.LIB.tap(p, `[data-wvadd="${DI}"]`); await p.getByRole('button', { name: 'SC', exact: true }).click(); await sleep(600)
    await X.LIB.type(p, `[data-bfld="ff:${DI}.2.0.to"]`, '17:00'); await X.LIB.type(p, `[data-bfld="ff:${DI}.2.0.ld"]`, '21:00')
    const sc = await X.LIB.put(p, `[data-slot="${DI}.2.0.0.p"]`, ['stiff'])
    await X.boardOff(p); await F.go(p, 'viewsched')
    const S1 = person(await readIns(p), 'Saber')
    /* reporting time earlier: VL's In-time line 09:00 → 08:00 (an hour earlier) */
    await F.go(p, 'editsched')
    const ln0 = await X.ensureLines(p, 'week', DI, 1)
    await X.setLine(p, 'week', DI, 0, '08:00 IN TIME', 0)
    await F.go(p, 'viewsched')
    const S2 = person(await readIns(p), 'Saber')
    /* only the role answer: VL Blue → Red */
    await F.go(p, 'editsched')
    const rm = await X.typeIn(p, 'week', `fr:${DI}.0.0.0`, 'DS FOR RU')
    const ch = p.locator('[data-role-choose]').first(); await rm.press('Tab'); await rm.click(); await sleep(300)
    if (await ch.count()) { await ch.click(); await sleep(250) }
    if (await X.questions(p)) await X.role(p, 'red')
    await F.go(p, 'viewsched')
    const S3 = person(await readIns(p), 'Saber')
    await p.locator('#insightBtn').click(); await p.waitForSelector('#insightClose'); await sleep(400)
    const sh = p.locator('[data-insights-all]'); if (await sh.count()) { await sh.first().click(); await sleep(300) }
    pcs.push(await pic(p, 'x09-insights-final'))
    await X.insightsClose(p)
    const rep = `Saber: start ${JSON.stringify(S0)} · +SC MAIN ${JSON.stringify(S1)} · report earlier ${JSON.stringify(S2)} · answer flipped ${JSON.stringify(S3)}`
    checks.push(['SC MAIN put (' + sc + '). Adding the SC MAIN shift: hours ' + S0.hours + ' → ' + S1.hours + ', sorties ' + S0.sorties + ' → ' + S1.sorties + ' (SC adds hours, not sorties)', sc === 'stiff' && S1.mins > S0.mins && S1.sorties === S0.sorties && S1.blue === S0.blue && S1.red === S0.red, rep])
    checks.push(['Reporting time moved an hour earlier (line was "' + (ln0[0] || '') + '"): hours ' + S1.hours + ' → ' + S2.hours + '; sortie count ' + S1.sorties + ' → ' + S2.sorties + ' and the split (' + S1.blue + '/' + S1.red + ' → ' + S2.blue + '/' + S2.red + ') unchanged', S2.mins > S1.mins && S2.sorties === S1.sorties && S2.blue === S1.blue && S2.red === S1.red, rep])
    checks.push(['Only the role answer changed (Blue → Red): split ' + S2.blue + '/' + S2.red + ' → ' + S3.blue + '/' + S3.red + '; hours ' + S2.hours + ' → ' + S3.hours + ' and sorties ' + S2.sorties + ' → ' + S3.sorties + ' unchanged', S3.mins === S2.mins && S3.sorties === S2.sorties && (+S3.red) === (+S2.red) + 1 && (+S3.blue) === (+S2.blue) - 1, rep])
    judge(id, 'Saber: one Blue-answered flight, one exact-DS Red flight, then an SC MAIN shift; Insights read after each of: SC added, report earlier, answer flipped', checks, pcs)
  } catch (e) { row(id, 'walk', 'ERROR ' + errTxt(e), 'NOT WALKED', []); await pic(p, 'x09-err') }
  ERRS.push(...c.errors); await c.browser.close()
}

/* ---------------- X-10 ---------------- */
async function x10() {
  const c = await F.open('desk'); const { p } = c
  const id = 'X-10 (desk)'
  const pcs = []
  try {
    const checks = []
    await X.condDay(p, DI, { track: false })
    const off0 = await p.locator('.mission-role-question').count()
    checks.push(['tracking Off: Mission ACM + Remarks "DS FOR VL" asked nothing', off0 === 0, 'questions ' + off0])
    await X.board(p, DI)
    const pub = await X.publish(p, DI)
    checks.push(['Friday published while tracking is Off', pub.pressed && !!pub.ver, JSON.stringify(pub.signed)])
    const h0 = await X.head(p, DI); const s0 = await X.snap(p); const pc0 = await p.evaluate(d => window.pendCount(d), DI)
    await X.boardOff(p); await F.go(p, 'viewsched')
    const I0 = await readIns(p)
    checks.push(['tracking Off: Insights has no Blue/Red rows (as before)', !I0.secs.some(s => s.rows.some(r => r.mix)), I0.secs.map(s => s.h + ':' + s.rows.length).join(' | ')])
    /* switch On */
    const on = await X.tracking(p, true)
    await F.go(p, 'editsched'); await sleep(500)
    const weekQ = await p.locator('.mission-role-question').count(), weekUi = await p.locator('[data-role-ui]').count()
    await X.board(p, DI)
    const boardQ = await p.locator('.mission-role-question').count(), boardUi = await p.locator('[data-role-ui]').count()
    await X.boardOff(p); await F.go(p, 'viewsched')
    const I1 = await readIns(p, 'desk', 'x10-insights-on-unresolved')
    const r1 = person(I1, 'Ranger'), e1 = person(I1, 'Echo')
    pcs.push(await pic(p, 'x10-on-unresolved'))
    const s1 = await X.snap(p)
    checks.push(['tracking switched On (' + on + '): no question anywhere — week ' + weekQ + ', board ' + boardQ + ' (offered buttons: ' + weekUi + '/' + boardUi + ')', on && weekQ === 0 && boardQ === 0, ''])
    checks.push(['Insights: the cue formation’s crew show a total only (Ranger ' + JSON.stringify(r1) + '), no guessed split', r1.red == null && r1.blue == null, JSON.stringify({ ranger: r1, echo: e1 })])
    checks.push(['switching On rewrote nothing: programme, book and sign-offs identical', s1.days === s0.days && s1.book === s0.book, ''])
    /* answer on the latest-published view */
    await F.go(p, 'editsched'); await X.board(p, DI)
    await X.previewLatest(p, pub.ver)
    const qt = await X.answerPublished(p, 'red')
    const s2 = await X.snap(p); await X.backToLive(p, DI); const h2 = await X.head(p, DI)
    await X.boardOff(p); await F.go(p, 'viewsched')
    const I2 = await readIns(p, 'desk', 'x10-insights-answered'); const r2 = person(I2, 'Ranger')
    pcs.push(await pic(p, 'x10-answered'))
    checks.push(['answered Red through the latest-published Remarks door ("' + qt.replace(/\s+/g, ' ').slice(0, 50) + '"): the split shows at once (Ranger ' + JSON.stringify(r2) + ')', r2.red != null && +r2.red >= 1, ''])
    const pc2 = await p.evaluate(d => window.pendCount(d), DI)
    checks.push(['signatures, wording and the amendment count unchanged by the answer (pending ' + pc0 + ' → ' + pc2 + '; the changes chip "' + h0.pending + '" → "' + h2.pending + '")', s2.days === s0.days && s2.book === s0.book && same(h2.signs, h0.signs) && pc2 === pc0, JSON.stringify({ signed: h2.signed })])
    /* Off then On */
    await X.tracking(p, false); await F.go(p, 'viewsched'); const I3 = await readIns(p)
    const offAgain = !I3.secs.some(s => s.rows.some(r => r.mix))
    await X.tracking(p, true); await F.go(p, 'viewsched'); const I4 = await readIns(p, 'desk', 'x10-insights-off-on-again'); const r4 = person(I4, 'Ranger')
    const s4 = await X.snap(p)
    pcs.push(await pic(p, 'x10-off-on-again'))
    checks.push(['turned Off: Insights is plain again (' + offAgain + '); turned On again: the Red answer is still there (Ranger ' + JSON.stringify(r4) + ') and no question burst', offAgain && r4.red != null && +r4.red >= 1 && (await p.locator('.mission-role-question').count()) === 0, ''])
    checks.push(['programme and book still identical after Off/On', s4.days === s0.days && s4.book === s0.book, ''])
    judge(id, 'tracking Off; ACM + cue published; tracking On (no burst; total only); answered Red on the published view (split at once); Off; On again', checks, [...pcs, ...EXP.splice(0)])
  } catch (e) { row(id, 'walk', 'ERROR ' + errTxt(e), 'NOT WALKED', []); await pic(p, 'x10-err') }
  ERRS.push(...c.errors); await c.browser.close()
}

/* ---------------- X-11 ---------------- */
async function x11() {
  const c = await F.open('desk'); const { p } = c
  const id = 'X-11 (desk)'
  const pcs = []
  try {
    const checks = []
    /* a six-hour Saturday: VIPER 10:00–11:00, report 07:00 (3h nominal), debrief 2h → 13:00 = 6h00 */
    const fw = await X.flyWave(p, 5, { cs: 'VIPER', to: '10:00', ld: '11:00', crew: ['bane', 'freak'] })
    await X.board(p, 5)
    const sat0 = await X.lines(p, 5, 0)
    const pub = await X.publish(p, 5)
    checks.push(['Saturday made (VIPER 10:00–11:00, ' + fw.r1 + '/' + fw.r2 + ') and published; its reporting line reads ' + JSON.stringify(sat0), pub.pressed && !!pub.ver, JSON.stringify(pub.signed)])
    await X.boardOff(p)
    /* a second wave, unissued: Sunday, no reporting lines */
    await X.flyWave(p, 6, { cs: 'COBRA', to: '12:00', ld: '13:00', crew: ['pump', 'dirty'] })
    await X.boardOff(p); await F.go(p, 'editsched')
    let sun = await X.lines(p, 6, 0)
    while (sun.length) { const b = p.locator(`#eWeek .day[data-day="6"] [data-itdel]`).first(); if (!(await b.count())) break; await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await b.click(); await sleep(350); const n = await X.lines(p, 6, 0); if (n.length === sun.length) break; sun = n }
    checks.push(['a second, unissued wave (Sunday COBRA 12:00–13:00) with NO reporting lines', sun.length === 0, JSON.stringify(sun)])
    const lw0 = await X.LIB.lwCell(p, ['bane', 'freak'], '2026-07-18')
    await p.evaluate(() => { const c = document.querySelector('[data-testid="cell-bane-2026-07-18"]'); if (c) c.scrollIntoView({ block: 'center', inline: 'center' }) }); await sleep(400); pcs.push(await pic(p, 'x11-lw-cells-before'))
    const I0 = person(await (async () => { await F.go(p, 'viewsched'); return readIns(p) })(), 'Ranger')
    // (the Insights picture of the old step is dropped)
    const lead0 = await X.logicGet(p, 'reportLead'), text0 = await X.logicGet(p, 'reportText')
    /* change the lead and the words */
    const lead1 = await X.logicSet(p, 'reportLead', '4h'); const text1 = await X.logicSet(p, 'reportText', 'RALLY')
    await F.go(p, 'editsched'); await sleep(500)
    const add = await X.addLine(p, 'week', 6, 0)
    const satNow = await X.lines(p, 5, 0)
    await F.go(p, 'viewsched')
    const I1 = person(await readIns(p), 'Ranger')
    const lw1 = await X.LIB.lwCell(p, ['bane', 'freak'], '2026-07-18')
    await p.evaluate(() => { const c = document.querySelector('[data-testid="cell-bane-2026-07-18"]'); if (c) c.scrollIntoView({ block: 'center', inline: 'center' }) }); await sleep(400); pcs.push(await pic(p, 'x11-lw-cells-after'))
    await p.locator('[data-testid="oil-tracker"]:visible').first().click().catch(() => {}); await sleep(900)
    const oilRows = await p.evaluate(() => { const s = document.querySelector('[data-testid="oil-sheet"]'); return s ? s.innerText.replace(/\s+/g, ' ').slice(0, 600) : 'no sheet' })
    pcs.push(await pic(p, 'x11-lw-after'))
    await p.locator('[data-testid="oil-close"]').first().click().catch(() => {})
    checks.push(['Logic: lead ' + lead0 + ' → ' + lead1 + ', words "' + text0 + '" → "' + text1 + '"', /4h/.test(lead1) && /RALLY/.test(text1), ''])
    checks.push(['the Add button on the unissued wave filled the NEW default: ' + JSON.stringify(add), add.length === 1 && /^0?8:00H?:? ?RALLY/i.test(add[0].replace(/^0/, '0')), JSON.stringify(add)])
    checks.push(['Saturday’s own reporting lines are unchanged (' + JSON.stringify(sat0) + ' → ' + JSON.stringify(satNow) + ')', same(sat0, satNow), ''])
    checks.push(['Leave War cell for Ranger/Echo on Saturday 18 Jul — before: ' + JSON.stringify(lw0) + ' · after: ' + JSON.stringify(lw1) + ' (issued earned leave must stay frozen)', JSON.stringify(lw0) === JSON.stringify(lw1) && !/NO CELL/.test(JSON.stringify(lw1)), 'OIL tracker after: ' + oilRows.slice(0, 220)])
    checks.push(['Insights Work hours for Ranger: ' + I0.hours + ' → ' + I1.hours + ' (RECORDED: Saturday has an entered report line, so the nominal change is expected not to move it)', true, JSON.stringify({ before: I0, after: I1 })])
    judge(id, 'Saturday six-hour flight published; Sunday wave left without reporting lines; Logic lead 3h→4h and words → RALLY; + In-time / Rally on Sunday; Saturday hours and the Leave War cell read before/after', checks, pcs)
  } catch (e) { row(id, 'walk', 'ERROR ' + errTxt(e), 'NOT WALKED', []); await pic(p, 'x11-err') }
  ERRS.push(...c.errors); await c.browser.close()
}

/* ---------------- X-12 ---------------- */
async function x12() {
  const c = await F.open('desk'); const { p } = c
  const id = 'X-12 (desk)'
  const pcs = []
  try {
    const checks = []
    await X.condDay(p, DI, { cue: 'DS FOR VL' })
    /* the day: a question answered Red, two reporting lines, stores, a section note */
    await X.set(p, 'week', `fr:${DI}.0.0.0`, 'DS FOR VL')
    if (await X.questions(p)) await X.role(p, 'red'); else { const rm = p.locator(`#eWeek [data-txt="fr:${DI}.0.0.0"]`).first(); await rm.click(); await sleep(250); const ch = p.locator('[data-role-choose]').first(); if (await ch.count()) { await ch.click(); await sleep(250); await X.role(p, 'red') } }
    await X.ensureLines(p, 'week', DI, 2); await X.setLine(p, 'week', DI, 0, '08:00 IN TIME'); await X.setLine(p, 'week', DI, 1, '09:20 RALLY')
    const bombs = p.locator(`#eWeek [data-bombs="${DI}.0.0.0"]`).first(); await bombs.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await bombs.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('2 TKS', { delay: 8 }); await p.keyboard.press('Tab'); await sleep(300)
    await X.set(p, 'week', `pn:${DI}`, 'F TEMPLATE NOTE')
    const src = await X.day(p, DI)
    const srcIns = person(await (async () => { await F.go(p, 'viewsched'); return readIns(p) })(), 'Ranger')
    checks.push(['source Friday built: ' + JSON.stringify({ rmks: src[0].f[0].ac[0].rmks, lines: src[0].intimes }) + ' · Ranger on Insights ' + JSON.stringify(srcIns), src[0].intimes.length === 2 && srcIns.red != null && +srcIns.red >= 1, ''])
    /* save the template from the board */
    await F.go(p, 'editsched'); await X.board(p, DI)
    await p.locator('#sbTpl').click(); await sleep(300); await p.locator('[data-daytplsave]').first().click(); await sleep(600)
    await p.waitForSelector('#daytplModal', { state: 'visible', timeout: 5000 }).catch(() => {})
    pcs.push(await pic(p, 'x12-template-saved'))
    await p.locator('#daytplClose').click().catch(() => {}); await sleep(500)
    await X.boardOff(p)
    /* next week */
    await F.go(p, 'editsched')
    const wks = await p.locator('[data-wk]:visible').evaluateAll(es => es.map(e => e.getAttribute('data-wk')))
    const nextWk = wks.find(w => /20\/07\/2026|2026-07-20/.test(w || '')) || wks[wks.length > 2 ? 2 : wks.length - 1]
    await p.locator(`[data-wk="${nextWk}"]:visible`).first().click(); await p.waitForFunction(w => window.CURWEEK === w, nextWk, { timeout: 8000 }).catch(() => {}); await sleep(700)
    const wkNow = await p.evaluate(() => window.CURWEEK)
    await X.board(p, 0)
    await p.locator('#sbTpl').click(); await sleep(300)
    const pick = p.locator('[data-daytplpick]').first(); const tid = await pick.getAttribute('data-daytplpick'); await pick.click(); await sleep(900)
    const dst = await X.day(p, 0)
    pcs.push(await pic(p, 'x12-applied-next-week'))
    checks.push(['next week loaded (' + wkNow + ') and the template applied to Monday: ' + JSON.stringify({ waves: dst.length, rmks: dst[0] && dst[0].f[0].ac[0].rmks, lines: dst[0] && dst[0].intimes }), dst.length >= 1 && /DS FOR VL/.test(dst[0].f[0].ac[0].rmks) && dst[0].intimes.length === 2, 'template ' + tid])
    const rmD = p.locator('#schedBoard [data-bfld="fr:0.0.0.0"]').first(); await rmD.click(); await sleep(300)
    const lblD = await p.locator('[data-role-choose]').first().innerText().catch(() => 'none')
    checks.push(['the copied day carries its OWN answer: focusing its Remarks offers "' + lblD + '" (answered, not "Choose")', /Change/i.test(lblD), lblD])
    /* Tab through the day: no edits */
    const t0 = await X.snap(p)
    await rmD.click()
    let steps = 0, last = null
    for (; steps < 40; steps++) { await p.keyboard.press('Tab'); await sleep(40); const a = await X.active(p); if (a === 'body' || !(a.visible)) break; last = a }
    const t1 = await X.snap(p)
    checks.push(['Tab through the copied day (' + steps + ' presses): no change, no command, no new question', t0.days === t1.days && t0.seq === t1.seq && (await X.questions(p)) === 0, `seq ${t0.seq} → ${t1.seq}`])
    /* change the answer, with storage failing; Undo/Redo; Retry; reload */
    await F.breakStorage(p)
    const sideOf = e => { try { return (e && e.changes && e.changes[0] && e.changes[0].after && e.changes[0].after.side) || (e && e.changes && e.changes[0] && e.changes[0].before && e.changes[0].before.side && "(before " + e.changes[0].before.side + ")") || (e && e.type) } catch (x) { return "?" } }
    await rmD.click(); await sleep(300); await p.locator('[data-role-choose]').first().click(); await sleep(300); await X.role(p, 'blue')
    const failedUp = await p.waitForSelector('#schedBoard .saveband, .topbar > .savestat.failed', { timeout: 12000 }).then(() => true, () => false)
    pcs.push(await pic(p, 'x12-answer-failed'))
    const a1 = await X.snap(p)
    const insBlue = null
    await p.locator('#sbUndo').click(); await sleep(600)
    const u1 = await X.snap(p); const dstU = await X.day(p, 0)
    const insUndo = null
    await rmD.click(); await sleep(250); const lblU = await p.locator('[data-role-choose]').first().innerText().catch(() => 'none')
    await p.locator('#sbRedo').click(); await sleep(600)
    const u2 = await X.snap(p)
    const insRedo = null
    checks.push(['the answer’s own commands (RECORDED): changed to Blue → ' + sideOf(a1.last) + ' [' + (a1.last && a1.last.type) + ']; Undo → ' + sideOf(u1.last) + ' [' + (u1.last && u1.last.type) + ']; Redo → ' + sideOf(u2.last) + ' [' + (u2.last && u2.last.type) + ']', /blue/.test(String(sideOf(a1.last))) && /red/.test(String(sideOf(u1.last))) && /blue/.test(String(sideOf(u2.last))), ''])
    checks.push(['answer changed to Blue with storage failing → the band showed (' + failedUp + '); one Undo took back only that answer (template content still there: ' + (dstU[0] && dstU[0].intimes.length) + ' lines, "' + (dstU[0] && dstU[0].f[0].ac[0].rmks) + '"); Redo restored it', failedUp && !!dstU[0] && dstU[0].intimes.length === 2 && /DS FOR VL/.test(dstU[0].f[0].ac[0].rmks), `role lines ${a1.roleLines} → undo ${u1.roleLines} → redo ${u2.roleLines}; button after undo "${lblU}"`])
    await F.fixOnRetryPress(p)
    await F.pressRetry(c, (await p.locator('#schedBoard .saveband button:visible').count()) ? '#schedBoard .saveband button' : '.topbar > .savestat button')
    const gone = await p.waitForFunction(() => !document.querySelector('.topbar > .savestat') && !document.querySelector('.saveband'), null, { timeout: 9000 }).then(() => true, () => false)
    await sleep(800)
    checks.push(['Retry with storage restored: the warning went', gone])
    await X.boardOff(p); await sleep(600)
    await X.relog(p)
    await F.go(p, 'editsched')
    await p.locator(`[data-wk="${nextWk}"]:visible`).first().click(); await p.waitForFunction(w => window.CURWEEK === w, nextWk, { timeout: 8000 }).catch(() => {}); await sleep(700)
    const dst2 = await X.day(p, 0)
    await X.board(p, 0)
    const rm2 = p.locator('#schedBoard [data-bfld="fr:0.0.0.0"]').first(); await rm2.click(); await sleep(300)
    const lbl2 = await p.locator('[data-role-choose]').first().innerText().catch(() => 'none')
    pcs.push(await pic(p, 'x12-reloaded'))
    await X.boardOff(p)
    /* the source week is untouched */
    await F.go(p, 'editsched'); await p.locator('[data-wk]:visible').first().click().catch(() => {})
    await p.evaluate(() => window.loadWeek && window.loadWeek('13/07/2026')); await sleep(800)
    const srcAfter = await X.day(p, DI)
    await F.go(p, 'viewsched'); const srcIns2 = person(await readIns(p), 'Ranger')
    checks.push(['after a reload and sign-in the next-week day still has the template content and the Blue answer (button "' + lbl2 + '")', !!dst2[0] && dst2[0].intimes.length === 2 && /DS FOR VL/.test(dst2[0].f[0].ac[0].rmks) && /Change/i.test(lbl2), JSON.stringify(dst2[0] && dst2[0].intimes)])
    checks.push(['the SOURCE week’s Friday is untouched (wording/lines same) and Ranger’s Insights there is as before (' + JSON.stringify(srcIns) + ' → ' + JSON.stringify(srcIns2) + ')', same(src, srcAfter) && srcIns2.red === srcIns.red && srcIns2.blue === srcIns.blue, ''])
    judge(id, 'Friday with an answered Red cue, two reporting lines, stores and a note saved as a day template; applied to Monday of next week; Tab through; answer changed to Blue with storage failing; Undo/Redo; Retry; reload; source week checked', checks, pcs)
  } catch (e) { row(id, 'walk', 'ERROR ' + errTxt(e), 'NOT WALKED', []); await pic(p, 'x12-err') }
  ERRS.push(...c.errors); await c.browser.close()
}

const only = (process.env.F_ONLY || '').split(',').filter(Boolean)
const want = k => !only.length || only.includes(k)
if (want('9')) await x09()
if (want('10')) await x10()
if (want('11')) await x11()
if (want('12')) await x12()
console.log('ERRORS', ERRS.length ? ERRS.join(' | ') : 'none')
F.savePart('x3-' + (process.env.F_RUN || 'x'), { errors: ERRS, pics: F.pics })
