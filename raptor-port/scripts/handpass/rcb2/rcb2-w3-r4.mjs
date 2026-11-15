/* rcb2-w3 R4 v1 — C: a neighbour week's published Monday (earning OIL, only its OIL waiting) previews by today's settings.
   usage: STEP=probe|full [PHONE=1] node rcb2-w3-r4.mjs */
process.env.RCB2_DIST = 'C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/6e376de7-ce28-4b0e-ad14-7848f71c5f9a/scratchpad/frozen-f01e1e416'
process.env.RCB2_BUNDLE = 'index-DDDelbBP.js'
const PHONE = process.env.PHONE === '1'
process.env.RCB2_RUN ||= 'r4-' + (PHONE ? 'p' : 'd') + (process.env.TAG || '1')
const X = await import('./rcb2-w3-lib.mjs')
const LW = await import('./rcb2-w3-lw.mjs')
const { L, say, sleep, SUN } = X
const WK = { cur: '20/07/2026', curIso: '2026-07-20', next: '27/07/2026', nextIso: '2026-07-27' }
say('rcb2-w3-r4 v1')
const w = await X.open({ phone: PHONE }); const { page, P } = w
const size = PHONE ? '402' : '1536'
const MON = 0, MONISO = '2026-07-27'
// 1. Monday next week a public holiday through the Leave War's event sheet
const ev = await LW.lwEvent(w, MONISO, 'PH'); say('lwEvent', JSON.stringify(ev))
await X.pic(w, `r4-0-lw-after-ph-${P}`)
X.row('R4 setup PH', size, 'Leave War event sheet: PH on Mon 27 Jul', 'event applied', JSON.stringify(ev), ev.ok ? 'PASS' : 'NOT WALKED', `r4-0-lw-after-ph-${P}.png`)
// 2. Monday flight 12:00-13:00, B 09:40, Ranger
await X.gotoWeek(w, WK.next, WK.nextIso)
await X.board(w, MON)
const wm = await X.flight(w, MON, '12:00', '13:00')
await X.typeIn(w, `[data-bfld="ff:${MON}.${wm}.0.br"]`, '09:40')
say('Mon formation', await page.evaluate(([d, g]) => JSON.stringify({ to: window.DAYS[d].waves[g].formations[0].to, ld: window.DAYS[d].waves[g].formations[0].ld, br: window.DAYS[d].waves[g].formations[0].br, waves: window.DAYS[d].waves.length }), [MON, wm]))
say('Mon warn', JSON.stringify(await X.boardWarn(w)))
await X.pic(w, `r4-1-monday-board-${P}`)
// OIL earns? Is the day a holiday: read the board head
say('Mon head', await page.evaluate(() => (document.querySelector('#schedBoard .sb-head, #schedBoard .dayhead') || {}).innerText))
const pr = await L.publish(page, MON); say('publish', JSON.stringify(pr))
await sleep(600); await X.pic(w, `r4-2-monday-published-${P}`)
X.row('R4 setup publish', size, 'Mon: VL 12:00-13:00, B 09:40, Ranger; four sign-offs, Publish day', 'published', JSON.stringify(pr), pr.published ? 'PASS' : 'NOT WALKED', `r4-2-monday-published-${P}.png`)
await X.closeBoard(w)
if (process.env.STEP === 'probe') { await X.fin(w); process.exit(0) }
// 3. Sunday this week 18:00-19:00, Ranger
await X.gotoWeek(w, WK.cur, WK.curIso)
await X.board(w, SUN)
const ws = await X.flight(w, SUN, '18:00', '19:00')
await X.closeBoard(w)
const rest = /crew rest|tight turn|Breaks/i
async function readSun(tag) {
  await X.gotoWeek(w, WK.cur, WK.curIso)
  let tr = await X.trace(w, '#eWeek', SUN); if (!tr.items.length) tr = await X.trace(w, '#eWeek', SUN)
  const strip = await X.weekWarn(w, '#eWeek', SUN)
  const puck = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="6"] .puck[data-person="bane"]')].filter(e => e.offsetWidth).map(e => ({ cls: e.className, title: e.getAttribute('title') || '' })))
  const marks = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="6"] [class*="brk"], #eWeek .day[data-day="6"] [class*="rest"], #eWeek .day[data-day="6"] .wtr')].filter(e => e.offsetWidth).map(e => e.className + ': ' + e.innerText.replace(/\s+/g, ' ').slice(0, 160)))
  await X.pic(w, `r4-${tag}-sunday-${P}`)
  return { trace: tr.items, strip: strip.items.filter(l => rest.test(l)), puck, marks }
}
async function readMonWorking(tag) {
  await X.gotoWeek(w, WK.next, WK.nextIso)
  const pend = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="0"] *')].filter(e => e.offsetWidth && e.children.length === 0 && /pending/i.test(e.textContent)).map(e => e.className + ': ' + e.textContent.replace(/\s+/g, ' ').trim()))
  const strip = await X.weekWarn(w, '#eWeek', MON)
  await X.pic(w, `r4-${tag}-monday-week-${P}`)
  const dd = await X.dayDetails(w, '#eWeek', MON); await X.pic(w, `r4-${tag}-monday-daydet-${P}`); await X.closeDayPop(w, 'done')
  return { pend, week: strip.items.filter(l => rest.test(l)), dd: (dd.items || []).filter(l => rest.test(l)) }
}
async function readMonView(tag) {
  await L.go(page, 'viewsched'); await sleep(500)
  if (!PHONE) await page.locator('[data-wk="27/07/2026"]:visible').first().click().catch(() => {})
  else { await X.press(w, '.filt-cal'); await page.waitForSelector('#weekCal:not([hidden]) .airpop-box', { timeout: 5000 }); await X.press(w, `#weekCal [data-iso="${WK.nextIso}"]`) }
  await sleep(600)
  say('view CURWEEK', await page.evaluate(() => window.CURWEEK))
  const strip = await X.weekWarn(w, '#vWeek', MON)
  await X.pic(w, `r4-${tag}-monday-viewonly-${P}`)
  return { cur: await page.evaluate(() => window.CURWEEK), items: strip.items.filter(l => rest.test(l)), head: strip.head }
}
const s0 = await readSun('3a-before'); say('SUN before', JSON.stringify(s0))
X.row('R4 3 before', size, 'Sunday 18:00-19:00 Ranger; debrief 2h (standard)', 'NO "Breaks Monday" mark / trace', JSON.stringify(s0), s0.trace.length === 0 && !s0.puck.some(p => /break|dot/i.test(p.cls)) ? 'PASS' : 'FAIL', `r4-3a-before-sunday-${P}.png`)
const m0 = await readMonWorking('3b-before'); say('MON before', JSON.stringify(m0))
X.row('R4 3 before Monday', size, "next week's Monday (week view, Edit Schedule)", 'no pending, no crew rest warning', JSON.stringify(m0), m0.pend.length === 0 && m0.week.length === 0 ? 'PASS' : 'RECORDED', `r4-3b-before-monday-week-${P}.png`)
// 4. debrief 3h
async function setDebrief(val) {
  await L.go(page, 'logic'); await sleep(500)
  if (!(await page.locator('#lgBody input[data-lgset]:visible').count())) { await X.press(w, '#lgEdit'); await sleep(400) }
  const key = await page.evaluate(() => { for (const i of document.querySelectorAll('#lgBody input[data-lgset]')) { const row = i.closest('.lgset, .lgrow, [data-lgname]') || i.parentElement.parentElement; if (/debrief after landing/i.test(row.innerText || '')) return i.dataset.lgset } return null })
  const inp = page.locator(`#lgBody input[data-lgset="${key}"]`).first()
  const before = await inp.inputValue()
  await inp.scrollIntoViewIfNeeded(); await inp.fill(val); await inp.press('Tab'); await sleep(600)
  const st = await page.evaluate(() => { const e = document.querySelector('#lgOff'); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 120) : null })
  await X.pic(w, `r4-logic-debrief-${val}-${P}`)
  await X.press(w, '#lgDone').catch(() => {})
  return { key, before, after: await inp.inputValue().catch(() => '?'), strip: st }
}
const d3 = await setDebrief('3h'); say('debrief 3h', JSON.stringify(d3))
X.row('R4 4 set', size, 'Logic: Debrief after landing 2h -> 3h', '3h set, strip shows', JSON.stringify(d3), d3.key ? 'PASS' : 'NOT WALKED', `r4-logic-debrief-3h-${P}.png`)
const s1 = await readSun('4a-after'); say('SUN after', JSON.stringify(s1))
X.row('R4 4 after Sunday', size, 'Sunday after debrief 3h', '"Breaks Monday" mark / explanation now shows', JSON.stringify(s1), s1.trace.some(l => /Breaks Mon/i.test(l)) || s1.puck.some(p => /break|dot/i.test(p.cls)) || s1.marks.some(m => /Breaks/i.test(m)) ? 'PASS' : 'FAIL', `r4-4a-after-sunday-${P}.png`)
const m1 = await readMonWorking('4b-after'); say('MON after', JSON.stringify(m1))
X.row('R4 4 after Monday pending', size, "next week's Monday reads '1 pending'", '1 pending', JSON.stringify(m1.pend), m1.pend.some(t => /1 pending/i.test(t)) ? 'PASS' : 'FAIL', `r4-4b-after-monday-week-${P}.png`)
X.row('R4 4 after Monday working copy', size, "Monday's working copy carries Ranger's crew-rest breach", 'crew rest line on Monday (week + day details)', JSON.stringify({ week: m1.week, dd: m1.dd }), m1.week.length || m1.dd.length ? 'PASS' : 'FAIL', `r4-4b-after-monday-week-${P}.png`)
const v1 = await readMonView('4c'); say('VIEW after', JSON.stringify(v1))
X.row('R4 4 after View-only Monday', size, "View-only's Monday (published face)", 'no crew rest breach (keeps its published face)', JSON.stringify(v1), v1.cur === WK.next && v1.items.length === 0 ? 'PASS' : (v1.cur !== WK.next ? 'NOT WALKED' : 'FAIL'), `r4-4c-monday-viewonly-${P}.png`)
// 5. back to 2h
const d2 = await setDebrief('2h'); say('debrief 2h', JSON.stringify(d2))
const s2 = await readSun('5a-back'); say('SUN back', JSON.stringify(s2))
X.row('R4 5 back Sunday', size, 'debrief back to 2h', 'the mark and trace go', JSON.stringify(s2), s2.trace.length === 0 && !s2.marks.some(m => /Breaks/i.test(m)) && !s2.puck.some(p => /break|dot/i.test(p.cls)) ? 'PASS' : 'FAIL', `r4-5a-back-sunday-${P}.png`)
const m2 = await readMonWorking('5b-back'); say('MON back', JSON.stringify(m2))
X.row('R4 5 back Monday', size, "Monday after 2h again", 'no pending, no crew rest warning', JSON.stringify(m2), m2.pend.length === 0 && m2.week.length === 0 ? 'PASS' : 'FAIL', `r4-5b-back-monday-week-${P}.png`)
await X.fin(w)
