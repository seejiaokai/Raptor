// W2 part D — scenarios 18, 19, 38 (reload after 18): a course for Ranger over two days and an Attach "145 Sqn" for Hunter, filed on the Inputs
// page; where each lands; the same words on the Unavailable row, the Inputs card, the Inputs calendar's bar and the war's day list; the war's
// ATCH outlined; the press on the Inputs calendar behind the open window (§7.11 lesson 4); then the Attach's Reject, → Ground, → Unavail (19).
// Desktop 1536 x 864, admin, one fresh world.   Usage (from raptor-port/): node scripts/handpass/lw-m3b-w2-d.mjs
import * as H from './lw-m3b-w2-lib.mjs'
const { L, T, note } = H
H.clearPrefix('d-')
console.log('lw-m3b-w2-d', H.OUT)
const num = s => (s == null ? null : Number(String(s).replace(/[^\d.\-]/g, '')))
const hasBox = (cell, re) => (cell || []).some(b => re.test(b))
const w = await H.deskCtx(); const P = w.page
await L.signInPlain(w, 'admin')
note('bundle', 'desk', await H.bundleName(P))
const ranger = await H.idOf(P, 'Ranger'), hunter = await H.idOf(P, 'Hunter')
const EDIT = di => `#eWeek section.day[data-day="${di}"]`
const accList = (scope, iid) => P.evaluate(([scope, iid]) => [...document.querySelectorAll(`${scope} [data-acck="${iid}"]`)].filter(b => b.getBoundingClientRect().width > 0).map(b => b.dataset.acc + ':' + b.textContent.trim()), [scope, iid])
async function pressAcc(scope, iid, dest, di) {
  const sel = `${scope} [data-acc="${dest}"][data-acck="${iid}"]`
  const vis = async () => { const n = await P.locator(sel).count(); for (let i = 0; i < n; i++) if (await P.locator(sel).nth(i).isVisible()) return i; return -1 }
  let at = await vis()
  if (at < 0 && di != null) { const t = P.locator(`${scope} [data-pitog="${di}"]`).first(); if (await t.count()) { await t.scrollIntoViewIfNeeded().catch(() => {}); await t.click(); await P.waitForTimeout(500); at = await vis() } }
  if (at < 0) throw new Error(`no ${dest} button for ${iid}: have ${JSON.stringify(await accList(scope, iid))}`)
  const b = P.locator(sel).nth(at); await b.scrollIntoViewIfNeeded().catch(() => {})
  const label = (await b.innerText()).trim()
  await b.click(); await P.waitForTimeout(1000)
  await H.answerAsks(w, 'acc-' + dest, { oil: 'no' })
  return label
}
const where = async (di, re) => {
  await H.goEdit(w)
  const t = P.locator(`${EDIT(di)} [data-pitog="${di}"]`).first()
  if (await t.count() && !((await H.rowsOf(P, di, 'sec-inp')).rows || []).length) { await t.scrollIntoViewIfNeeded().catch(() => {}); await t.click(); await P.waitForTimeout(500) }
  const out = {}
  for (const s of ['sec-unav', 'sec-grnd', 'sec-inp']) out[s] = ((await H.rowsOf(P, di, s)).rows || []).filter(r => re.test(r.text)).map(r => r.text)
  return { ...out, at: out['sec-unav'].length ? 'Unavailable' : out['sec-grnd'].length ? 'Ground Programme' : out['sec-inp'].length ? 'Personal Inputs only' : 'nowhere' }
}
const war = async (who, iso) => { await H.warOpen(w, who, iso); return { cell: await H.cellBoxes(w, who, iso), avail: await H.availP(P, iso) } }

/* ---------- base ---------- */
const base = {}
for (const d of ['2026-07-14', '2026-07-15', '2026-07-16']) base[d] = (await war(ranger, d)).avail
note('base', 'desk', 'Available P ' + JSON.stringify(base) + ' · Hunter 16 Jul ' + JSON.stringify(await H.cellBoxes(w, hunter, '2026-07-16')) + ' · Ranger 14/15 ' + JSON.stringify([await H.cellBoxes(w, ranger, '2026-07-14'), await H.cellBoxes(w, ranger, '2026-07-15')]))

/* ---------- 18: the filing ---------- */
const fc = await H.fileInput(w, { who: 'Ranger', type: 'CSE', from: '2026-07-14', to: '2026-07-15', remarks: 'Instructor course', tag: '18-cse', oil: 'no', beforeSave: async o => { o.goes = await H.goesRead(P); await H.winTop(P); await H.pic(w, 'd-18-cse-window', [H.WIN], { pad: 6 }) } })
note('18-cse', 'desk', `acc ${fc.rec?.acc} date ${fc.rec?.date}→${fc.rec?.endDate} asked ${JSON.stringify(fc.asked)} readout "${fc.readout}" goes row ${JSON.stringify(fc.goesRow)}`)
const fa = await H.fileInput(w, { who: 'Hunter', type: 'Attach', from: '2026-07-16', toWhere: '145 Sqn', remarks: 'Exercise support', tag: '18-attach', oil: 'no', beforeSave: async o => { if (await P.locator('#inpEditAllday').count() && !(await P.locator('#inpEditAllday').isChecked())) { await L.press(w, '#inpEditAllday'); await P.waitForTimeout(250) } ; o.labels = await P.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"] .inped-k')].map(e => e.textContent).join(' · ')); o.goes = await H.goesRead(P); await H.winTop(P); await H.pic(w, 'd-18-attach-window', [H.WIN], { pad: 6 }) } })
const iidC = fc.rec.iid, iidA = fa.rec.iid
note('18-attach', 'desk', `acc ${fa.rec?.acc} to ${JSON.stringify(fa.rec?.to)} date ${fa.rec?.date} asked ${JSON.stringify(fa.asked)} goes row ${fa.goesRow} labels in window: see picture`)

/* ---------- where each landed, in Edit Schedule ---------- */
const wc14 = await where(1, /Instructor course/), wc15 = await where(2, /Instructor course/), wa16 = await where(3, /Exercise support/)
note('18-where', 'desk', `course Tue14: ${wc14.at} ${JSON.stringify(wc14['sec-unav'])} · Wed15: ${wc15.at} · Attach Thu16: ${wa16.at} ${JSON.stringify(wa16['sec-unav'])}`)
await H.centreOn(P, [EDIT(3) + ' .sec-unav']); await H.pic(w, 'd-18-attach-unav', [EDIT(3) + ' .sec-unav'])
await H.goEdit(w); await H.centreOn(P, [EDIT(1) + ' .sec-unav']); await H.pic(w, 'd-18-course-unav', [EDIT(1) + ' .sec-unav'])
const attachWords = (wa16['sec-unav'][0] || '')
/* ---------- the Inputs list card, the Inputs calendar's bar ---------- */
await H.openInputsList(w)
const sel = `#inBody [data-iid="${iidA}"], #inList [data-iid="${iidA}"]`
if (!(await P.locator(sel).count())) { await L.press(w, '#inRangeBtn'); await P.waitForTimeout(400); if (await L.vis(P, '#inRangeAll')) { await L.press(w, '#inRangeAll'); await P.waitForTimeout(800) } }
const card = await P.locator(sel).first().evaluate(e => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => null)
await P.locator(sel).first().scrollIntoViewIfNeeded().catch(() => {})
await H.pic(w, 'd-18-attach-card', [sel], { pad: 8 })
await H.inCalMonth(w, 2026, 7)
const bar = await P.locator(`#inpCal .ib-bar[data-iid="${iidA}"]`).first().evaluate(e => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => null)
const barC = await P.locator(`#inpCal .ib-bar[data-iid="${iidC}"]`).first().evaluate(e => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => null)
await H.pic(w, 'd-18-attach-bar', [`#inpCal .ib-bar[data-iid="${iidA}"]`, `#inpCal .ib-bar[data-iid="${iidC}"]`], { pad: 40 })
note('18-words', 'desk', `Unavailable row: "${attachWords}" · Inputs card: "${card}" · Inputs calendar bar: "${bar}" (course bar "${barC}")`)
/* ---------- the war ---------- */
const wh = await war(hunter, '2026-07-16')
await H.warStrips(w, 'd-18-war-attach', hunter, ['2026-07-16'])
const wr14 = await war(ranger, '2026-07-14'), wr15 = await war(ranger, '2026-07-15')
await H.warStrips(w, 'd-18-war-course', ranger, ['2026-07-14', '2026-07-15'])
await L.openCellR(w, hunter, '2026-07-16')
const sheet = await L.sheetDump(P)
note('18-daylist', 'desk', 'a tap on the Attach day opens: ' + JSON.stringify(sheet))
await H.pic(w, 'd-18-war-daylist', ['.bidsheet', '[data-testid="daylist"]', '[role="dialog"]'], { pad: 8 })
await L.closeAny(w)
note('18-war', 'desk', `Hunter 16: ${JSON.stringify(wh.cell)} Available P ${base['2026-07-16']} → ${wh.avail} · Ranger 14: ${JSON.stringify(wr14.cell)} ${base['2026-07-14']} → ${wr14.avail} · 15: ${JSON.stringify(wr15.cell)} ${base['2026-07-15']} → ${wr15.avail}`)
{
  const attachOk = fa.rec?.acc === 'u' && fa.rec?.to === '145 Sqn' && wa16.at === 'Unavailable' && /Attach · 145 Sqn/.test(attachWords) && /Attach · 145 Sqn/.test(card || '') && /Attach · 145 Sqn/.test(bar || '') && /Attach · 145 Sqn/.test(sheet?.text || '') && hasBox(wh.cell, /^ATCH\|.*outlined/) && num(wh.avail) === num(base['2026-07-16']) - 1
  const courseOk = fc.rec?.acc === 'u' && wc14.at === 'Unavailable' && wc15.at === 'Unavailable' && hasBox(wr14.cell, /^CSE\|/) && hasBox(wr15.cell, /^CSE\|/) && num(wr14.avail) === num(base['2026-07-14']) - 1 && num(wr15.avail) === num(base['2026-07-15']) - 1
  L.rec('18', 'desk', attachOk && courseOk ? 'PASS?' : 'FAIL?', `course: acc ${fc.rec?.acc}, ${wc14.at}/${wc15.at}, war ${wr14.cell}/${wr15.cell}, Available P ${base['2026-07-14']}→${wr14.avail}, ${base['2026-07-15']}→${wr15.avail}; Attach: acc ${fa.rec?.acc}, to "${fa.rec?.to}", ${wa16.at}; words — row "${attachWords}", card "${card}", bar "${bar}", war's day list "${(sheet?.text || '').slice(0, 160)}"; war ${wh.cell}, Available P ${base['2026-07-16']}→${wh.avail}`, ['d-18-cse-window', 'd-18-attach-window', 'd-18-attach-unav', 'd-18-course-unav', 'd-18-attach-card', 'd-18-attach-bar', 'd-18-war-attach', 'd-18-war-course', 'd-18-war-daylist'])
}

/* ---------- 18: a press on the Inputs calendar behind an open new-input window (§7.11 lesson 4) ---------- */
try {
  await H.inCalMonth(w, 2026, 7)
  const cellSel = iso => `#inpCal [data-icday="${iso}"]`
  const classes = () => P.evaluate(() => Object.fromEntries([...document.querySelectorAll('#inpCal [data-icday]')].map(e => [e.dataset.icday, e.className])))
  await P.locator(cellSel('2026-07-21')).first().click({ position: { x: 8, y: 8 } }); await P.waitForTimeout(700)
  note('18-behind', 'desk', 'day panel after the first press: ' + (await H.winsOpen(P)).join(',') + ' · panels: ' + await P.evaluate(() => [...document.querySelectorAll('[data-testid^="win-"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid).join(',')))
  await L.press(w, '#icPopAdd'); await P.waitForSelector(T('win-inputedit'), { timeout: 5000 }); await P.waitForTimeout(600)
  await P.locator('#inpEditType').selectOption('Attach'); await P.waitForTimeout(300)
  const rd0 = await H.rangeRead(P)
  const c0 = await classes()
  await H.pic(w, 'd-18-behind-0', null)
  await P.locator(cellSel('2026-07-14')).first().click({ position: { x: 8, y: 8 } }); await P.waitForTimeout(800)
  const rd1 = await H.rangeRead(P)
  const c1 = await classes()
  const changed = Object.keys(c1).filter(k => c1[k] !== c0[k]).map(k => `${k}: "${c0[k]}" → "${c1[k]}"`)
  const winTitle = await L.txt(P, `${T('win-inputedit')} .win-title, ${T('win-inputedit')} h2, ${T('win-inputedit')} header`)
  const rects = await P.evaluate(() => { const r = e => { if (!e) return null; const q = e.getBoundingClientRect(); return [Math.round(q.left), Math.round(q.top), Math.round(q.right), Math.round(q.bottom)] }; const dp = document.querySelector('[data-testid="win-inputsday"]'), nw = document.querySelector('[data-testid="win-inputedit"]'); const mid = dp && nw ? document.elementFromPoint((Math.max(dp.getBoundingClientRect().left, nw.getBoundingClientRect().left) + Math.min(dp.getBoundingClientRect().right, nw.getBoundingClientRect().right)) / 2, (dp.getBoundingClientRect().top + dp.getBoundingClientRect().bottom) / 2) : null; return { dayPanel: r(dp), newWindow: r(nw), topAtOverlap: mid ? (mid.closest('[data-testid]')?.dataset.testid || mid.className) : null } })
  note('18-behind-rects', 'desk', JSON.stringify(rects))
  const dayPanel = await P.evaluate(() => { const e = document.querySelector('[data-testid="win-inputsday"]'); return e && e.getBoundingClientRect().width > 0 ? e.innerText.replace(/\s+/g, ' ').slice(0, 120) : 'no day panel' })
  note('18-behind', 'desk', `window's dates before "${rd0}", after a press on Tue 14 Jul behind it "${rd1}"; window title "${winTitle}"; day panel: ${dayPanel}; cells whose look changed: ${JSON.stringify(changed)}; windows open ${(await H.winsOpen(P)).join(',')}`)
  await H.pic(w, 'd-18-behind-1', null)
  /* what lights in words: any cell of the month carrying a picked / selected look */
  const lit = await P.evaluate(() => [...document.querySelectorAll('#inpCal [data-icday]')].filter(e => /pick|sel|on|lit|act|today/.test(e.className.replace(/is-we|ic-day/g, ''))).map(e => e.dataset.icday + ':' + e.className))
  note('18-behind', 'desk', 'cells with a pick/select/lit class: ' + JSON.stringify(lit))
  L.rec('18-behind', 'desk', 'RECORD', `window's date readout "${rd0}" → "${rd1}" after a press on another date behind it; cells whose look changed: ${JSON.stringify(changed)}; lit cells: ${JSON.stringify(lit)}`, ['d-18-behind-0', 'd-18-behind-1'])
  await L.press(w, '#inpEditCancel'); await P.waitForTimeout(500)
  await L.closeAny(w)
} catch (e) { note('18-behind', 'desk', 'NOT DONE — ' + String(e).slice(0, 400)); L.rec('18-behind', 'desk', 'NOT WALKED', String(e).split('\n')[0].slice(0, 300), []) }

/* ================= 19: the Attach's Reject, → Ground, → Unavail ================= */
const D = '2026-07-16', DI = 3
const steps = []
const stepWar = async tag => { const s = await war(hunter, D); await H.warStrips(w, 'd-19-' + tag + '-war', hunter, [D]); const wh = await where(DI, /Exercise support/); steps.push({ tag, cell: s.cell, avail: s.avail, at: wh.at }); note('19-' + tag, 'desk', `row on ${wh.at}; war ${JSON.stringify(s.cell)} Available P ${s.avail}`); return s }
await H.goEdit(w)
const lab1 = await pressAcc(EDIT(DI), iidA, 'x', DI)
await stepWar('reject')
await H.goEdit(w); const btnsR = await accList(EDIT(DI), iidA)
await H.centreOn(P, [EDIT(DI) + ' .sec-inp']); await H.pic(w, 'd-19-reject-inputs', [EDIT(DI) + ' .sec-inp'])
const lab2 = await pressAcc(EDIT(DI), iidA, 'g', DI)
await stepWar('ground')
await H.goEdit(w)
const lab3 = await pressAcc(EDIT(DI), iidA, 'x', DI)
const lab4 = await pressAcc(EDIT(DI), iidA, 'u', DI)
await stepWar('unavail')
await H.goEdit(w); await H.centreOn(P, [EDIT(DI) + ' .sec-unav']); await H.pic(w, 'd-19-unavail-edit', [EDIT(DI) + ' .sec-unav'])
const sRej = steps.find(s => s.tag === 'reject'), sGr = steps.find(s => s.tag === 'ground'), sUn = steps.find(s => s.tag === 'unavail')
L.rec('19', 'desk', !hasBox(sRej.cell, /ATCH/) && num(sRej.avail) === num(base[D]) && !hasBox(sGr.cell, /ATCH/) && num(sGr.avail) === num(base[D]) && sGr.at === 'Ground Programme' && hasBox(sUn.cell, /^ATCH\|.*outlined/) && num(sUn.avail) === num(base[D]) - 1 && sUn.at === 'Unavailable' ? 'PASS?' : 'FAIL?', `"${lab1}" → buttons ${JSON.stringify(btnsR)}: war ${JSON.stringify(sRej.cell)} Available P ${sRej.avail}; "${lab2}" → ${sGr.at}: war ${JSON.stringify(sGr.cell)} Available P ${sGr.avail}; "${lab3}" then "${lab4}" → ${sUn.at}: war ${JSON.stringify(sUn.cell)} Available P ${sUn.avail} (base ${base[D]})`, ['d-19-reject-war', 'd-19-reject-inputs', 'd-19-ground-war', 'd-19-unavail-war', 'd-19-unavail-edit'])

/* ================= 38 (18): reload ================= */
await P.reload(); await P.waitForTimeout(1500)
if (await L.vis(P, '#luser')) { await P.fill('#luser', 'ad'); await P.fill('#lpass', 'a'); await P.click('#loginForm button[type=submit]'); await P.waitForSelector('#vWeek .day', { state: 'attached' }); await P.waitForTimeout(800) }
const rh = await war(hunter, D), rr14 = await war(ranger, '2026-07-14'), rr15 = await war(ranger, '2026-07-15')
await H.warStrips(w, 'd-38-reload-war', hunter, [D])
await H.warStrips(w, 'd-38-reload-war-course', ranger, ['2026-07-14', '2026-07-15'])
await H.openInputBy(w, iidA, 'row')
const toVal = await P.locator('#inpEditTo').inputValue().catch(() => null)
const gread = await H.goesRead(P)
await H.pic(w, 'd-38-reload-window-attach', ['#inpEditPop .airpop-box'], { pad: 6 })
await L.press(w, '#inpEditCancel'); await P.waitForTimeout(400)
const wR = await where(DI, /Exercise support/)
note('38(18)', 'desk', `after reload: Attach war ${JSON.stringify(rh.cell)} Available P ${rh.avail}; course ${JSON.stringify(rr14.cell)} ${rr14.avail} / ${JSON.stringify(rr15.cell)} ${rr15.avail}; window "To" = "${toVal}", goes row ${JSON.stringify(gread)}; Attach row on ${wR.at}: ${JSON.stringify(wR['sec-unav'])}`)
L.rec('38(18)', 'desk', hasBox(rh.cell, /^ATCH\|.*outlined/) && num(rh.avail) === num(base[D]) - 1 && hasBox(rr14.cell, /^CSE\|/) && hasBox(rr15.cell, /^CSE\|/) && toVal === '145 Sqn' && wR.at === 'Unavailable' ? 'PASS?' : 'FAIL?', `war ATCH ${JSON.stringify(rh.cell)} Available P ${rh.avail}; CSE ${rr14.cell}/${rr15.cell}; window To "${toVal}"; row ${wR.at}`, ['d-38-reload-war', 'd-38-reload-war-course', 'd-38-reload-window-attach'])

note('errors', 'desk', JSON.stringify(w.errs))
H.saveLog('d-run.json')
await w.ctx.close()
await H.closeBrowser()
console.log('RESULTS'); for (const r of L.results) console.log(r.verdict, r.id, '|', r.said)
