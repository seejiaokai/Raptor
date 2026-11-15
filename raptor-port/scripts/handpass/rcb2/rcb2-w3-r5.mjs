/* rcb2-w3 R5 v1 — Astra's scenario 11: published rules held vs the next amendment (week of 27 Jul, Mon idx 0 / Tue idx 1, Ranger).
   usage: [PHONE=1] node rcb2-w3-r5.mjs */
process.env.RCB2_DIST = 'C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/6e376de7-ce28-4b0e-ad14-7848f71c5f9a/scratchpad/frozen-f01e1e416'
process.env.RCB2_BUNDLE = 'index-DDDelbBP.js'
const PHONE = process.env.PHONE === '1'
process.env.RCB2_RUN ||= 'r5-' + (PHONE ? 'p' : 'd') + (process.env.TAG || '1')
const X = await import('./rcb2-w3-lib.mjs')
const { L, say, sleep } = X
say('rcb2-w3-r5 v1')
const w = await X.open({ phone: PHONE }); const { page, P } = w
const size = PHONE ? '402' : '1536'
const WK = { v: '27/07/2026', iso: '2026-07-27' }
const MON = 0, TUE = 1
const rest = /crew rest|tight turn|Breaks/i
await X.gotoWeek(w, WK.v, WK.iso)
// build Monday 12:00-13:00 and Tuesday 05:30-06:30 (B 03:10), Ranger
await X.board(w, MON); const wm = await X.flight(w, MON, '12:00', '13:00'); say('Mon board warn', JSON.stringify(await X.boardWarn(w)))
const rm = await L.publish(page, MON); say('publish Mon', JSON.stringify(rm)); await X.pic(w, `r5-0-mon-published-${P}`); await X.closeBoard(w)
await X.gotoWeek(w, WK.v, WK.iso)
await X.board(w, TUE); const wt = await X.flight(w, TUE, '05:30', '06:30')
await X.typeIn(w, `[data-bfld="ff:${TUE}.${wt}.0.br"]`, '03:10')
say('Tue formation', await page.evaluate(([d, g]) => JSON.stringify(window.DAYS[d].waves[g].formations[0]).slice(0, 200), [TUE, wt]))
say('Tue board warn', JSON.stringify(await X.boardWarn(w)))
const rt = await L.publish(page, TUE); say('publish Tue', JSON.stringify(rt)); await X.pic(w, `r5-0-tue-published-${P}`)
const signs = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-sign, #schedBoard [data-sign]')].filter(e => e.offsetWidth).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 120)))
await X.closeBoard(w)
X.row('R5 setup', size, 'Mon 12:00-13:00 published; Tue 05:30-06:30 B 03:10 published; Ranger both (rest = 12h10 at 12h)', 'both published', JSON.stringify({ rm, rt, signs }), rm.published && rt.published ? 'PASS' : 'NOT WALKED', `r5-0-tue-published-${P}.png`)

async function goView() {
  await L.go(page, 'viewsched'); await sleep(500)
  if (!PHONE) await page.locator(`[data-wk="${WK.v}"]:visible`).first().click().catch(() => {})
  else { await X.press(w, '.filt-cal'); await page.waitForSelector('#weekCal:not([hidden]) .airpop-box', { timeout: 5000 }); await X.press(w, `#weekCal [data-iso="${WK.iso}"]`) }
  await sleep(600)
}
async function snap(tag) {
  await X.gotoWeek(w, WK.v, WK.iso)
  const pendOf = d => page.evaluate(i => [...document.querySelectorAll(`#eWeek .day[data-day="${i}"] .dpend, #eWeek .day[data-day="${i}"] .dpendbtn`)].filter(e => e.offsetWidth).map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(t => /pending/i.test(t)), d)
  const tueP = await pendOf(TUE), monP = await pendOf(MON)
  const tue = await X.weekWarn(w, '#eWeek', TUE)
  const tr = await X.trace(w, '#eWeek', MON)
  await X.pic(w, `r5-${tag}-edit-${P}`)
  const dd = await X.dayDetails(w, '#eWeek', TUE); await X.pic(w, `r5-${tag}-tue-daydet-${P}`); await X.closeDayPop(w, 'done')
  const monStrip = await X.weekWarn(w, '#eWeek', MON)
  await goView()
  const vt = await X.weekWarn(w, '#vWeek', TUE)
  const vdd = await X.dayDetails(w, '#vWeek', TUE); await X.pic(w, `r5-${tag}-view-tue-daydet-${P}`); await X.closeDayPop(w, 'done')
  await X.pic(w, `r5-${tag}-view-${P}`)
  const o = { tuePend: tueP, monPend: monP, editTueCR: tue.items.filter(l => rest.test(l)), editTueDD: (dd.items || []).filter(l => rest.test(l)), monTrace: tr.items, editMonCR: monStrip.items.filter(l => rest.test(l)), viewTueCR: vt.items.filter(l => rest.test(l)), viewTueDD: (vdd.items || []).filter(l => rest.test(l)), viewHead: vt.head }
  say('SNAP', tag, JSON.stringify(o)); return o
}
async function logicSet(label, val) {
  await L.go(page, 'logic'); await sleep(500)
  if (!(await page.locator('#lgBody input[data-lgset]:visible').count())) { await X.press(w, '#lgEdit'); await sleep(400) }
  const key = label === 'briefLead' ? label : await page.evaluate(l => { for (const i of document.querySelectorAll('#lgBody input[data-lgset]')) { const row = i.closest('.lgset, .lgrow, [data-lgname]') || i.parentElement.parentElement; if (new RegExp(l, 'i').test(row.innerText || '')) return i.dataset.lgset } return null }, label)
  const inp = page.locator(`#lgBody input[data-lgset="${key}"]`).first()
  const before = await inp.inputValue()
  await inp.scrollIntoViewIfNeeded(); await inp.fill(val); await inp.press('Tab'); await sleep(600)
  const strip = await page.evaluate(() => { const e = document.querySelector('#lgOff'); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 90) : null })
  await X.pic(w, `r5-logic-${key}-${val}-${P}`)
  await X.press(w, '#lgDone').catch(() => {})
  return { key, before, val, strip }
}
const s0 = await snap('1-baseline')
X.row('R5 1 baseline', size, 'before any setting change: Tue published, 12h crew rest', 'nothing pending; Tue carries only the amber Tight turning advisory at 12h (the set-up sits close to the threshold); no breach', JSON.stringify(s0), !s0.tuePend.length && s0.editTueCR.length === 1 && /Tight turning/.test(s0.editTueCR[0]) && !s0.monTrace.length ? 'PASS' : 'FAIL', `r5-1-baseline-edit-${P}.png`)
const c = await logicSet('crew rest', '13h'); say('crew 13h', JSON.stringify(c))
const s1 = await snap('2-crew13')
X.row('R5 2 crew rest 13h, nothing pending', size, 'Crew rest 12h -> 13h (' + JSON.stringify(c) + ')', 'published Tue keeps 12h: its warnings unchanged from the baseline in Edit and View-only (the amber at 12h, clear at 03:00, no "<13h"); no pending; Mon forward trace empty', JSON.stringify(s1), JSON.stringify(s1.editTueCR) === JSON.stringify(s0.editTueCR) && JSON.stringify(s1.viewTueCR) === JSON.stringify(s0.viewTueCR) && !s1.tuePend.length && !s1.monTrace.length && !s1.editTueCR.some(l => /<13h|04:00/.test(l)) ? 'PASS' : 'FAIL', `r5-2-crew13-edit-${P}.png`)
// a genuine pending change on Tuesday: its landing 06:30 -> 06:45
await X.gotoWeek(w, WK.v, WK.iso)
await X.board(w, TUE); await X.typeIn(w, `[data-bfld="ff:${TUE}.${wt}.0.ld"]`, '06:45'); await X.pic(w, `r5-3-tue-edited-board-${P}`)
say('Tue board warn after edit', JSON.stringify(await X.boardWarn(w)))
await X.closeBoard(w)
const s2 = await snap('3-pending')
X.row('R5 3 pending change on Tue', size, 'Tue landing 06:30 -> 06:45 with crew rest at 13h', "Tue reads 1 pending; Edit's working copy checks by today's 13h (red <13h breach, clear at 04:00; the issued amber goes away once signed); View-only keeps its issued amber at 12h", JSON.stringify(s2), s2.tuePend.some(t => /1 pending/.test(t)) && s2.editTueCR.some(l => /<13h.*04:00/.test(l)) && s2.editTueCR.some(l => /goes away once signed/.test(l)) && s2.viewTueCR.some(l => /clear at 03:00/.test(l)) && !s2.viewTueCR.some(l => /<13h/.test(l)) ? 'PASS' : 'FAIL', `r5-3-pending-edit-${P}.png`)
X.row('R5 3 Monday neighbour', size, "Monday's forward explanation while Tue has a pending change", 'RECORD (live neighbour info assessed under which rules)', JSON.stringify({ trace: s2.monTrace, monPend: s2.monPend }), 'RECORDED', `r5-3-pending-edit-${P}.png`)
// put the crew rest back, then the default briefing change (D186) on Monday
const c2 = await logicSet('crew rest', '12h'); say('crew back', JSON.stringify(c2))
const s3 = await snap('4-crew12-pend')
X.row('R5 4 crew rest back to 12h', size, 'with the pending change still waiting', "Edit's working copy back to the amber at 12h; pending stays (the landing edit)", JSON.stringify(s3), s3.tuePend.some(t => /pending/.test(t)) && s3.editTueCR.some(l => /Tight turning/.test(l)) && !s3.editTueCR.some(l => /<13h/.test(l)) ? 'PASS' : 'RECORDED', `r5-4-crew12-pend-edit-${P}.png`)
const b = await logicSet('briefLead', '3h20'); say('brief 3h20', JSON.stringify(b))
const s4 = await snap('5-brief')
X.row('R5 5 default briefing change (D186)', size, 'Default briefing 2h20 -> 3h20 (' + JSON.stringify(b) + ')', 'RECORD: Monday (published, brief printed by default lead) reads pending; Tue (typed B) not newly affected', JSON.stringify({ monPend: s4.monPend, tuePend: s4.tuePend, viewHead: s4.viewHead }), b.key ? 'RECORDED' : 'NOT WALKED', `r5-5-brief-edit-${P}.png`)
await logicSet('briefLead', '2h20').catch(() => {})
await X.fin(w)
