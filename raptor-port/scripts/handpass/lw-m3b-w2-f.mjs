// W2 part F — scenarios 30 (a Saturday Training with OIL "Yes", published, then moved under Unavailable: the war's credit and TRG, the OIL
// tracker unchanged), 41 (the OIL question first when a commitment with no OIL answer is moved under Unavailable; a course filed on a Saturday
// asks it at the save) and 32 (a timed Appointment, Meeting and overnight Duty under Unavailable: the war's Available figure per day — RECORD).
// Desktop 1536 x 864, admin, a fresh world each.   Usage (from raptor-port/): node scripts/handpass/lw-m3b-w2-f.mjs   [SETS=30,41,32]
process.env.HP_URL = 'http://localhost:4180'
import * as H from './lw-m3b-w2-lib.mjs'
const { L, T, note } = H
process.env.HP_SHOTS = H.OUT
const SETS = (process.env.SETS || '30,41,32').split(',')
for (const k of SETS) H.clearPrefix('f-' + k)
console.log('lw-m3b-w2-f', H.OUT, 'sets', SETS.join(','))
const HPL = await import('./lib.mjs')
const num = s => (s == null ? null : Number(String(s).replace(/[^\d.\-]/g, '')))
const hasBox = (cell, re) => (cell || []).some(b => re.test(b))
const sc = async (id, fn) => { console.log('-- ' + id); try { await fn() } catch (e) { note(id, 'desk', 'NOT DONE — ' + String(e).slice(0, 600)); L.rec(id, 'desk', 'NOT WALKED', 'script stopped: ' + String(e).split('\n')[0].slice(0, 300), []) } }
const EDIT = di => `#eWeek section.day[data-day="${di}"]`
const accList = (P, scope, iid) => P.evaluate(([scope, iid]) => [...document.querySelectorAll(`${scope} [data-acck="${iid}"]`)].filter(b => b.getBoundingClientRect().width > 0).map(b => b.dataset.acc + ':' + b.textContent.trim()), [scope, iid])
/* press a schedule button; answers are the caller's: returns the windows that opened */
async function press(w, scope, iid, dest, di) {
  const P = w.page
  const sel = `${scope} [data-acc="${dest}"][data-acck="${iid}"]`
  const vis = async () => { const n = await P.locator(sel).count(); for (let i = 0; i < n; i++) if (await P.locator(sel).nth(i).isVisible()) return i; return -1 }
  let at = await vis()
  if (at < 0 && di != null) { const t = P.locator(`${scope} [data-pitog="${di}"]`).first(); if (await t.count()) { await t.scrollIntoViewIfNeeded().catch(() => {}); await t.click(); await P.waitForTimeout(500); at = await vis() } }
  if (at < 0) throw new Error(`no ${dest} button for ${iid}: have ${JSON.stringify(await accList(P, scope, iid))}`)
  const b = P.locator(sel).nth(at); await b.scrollIntoViewIfNeeded().catch(() => {})
  const label = (await b.innerText()).trim()
  await b.click(); await P.waitForTimeout(1000)
  return { label, wins: (await H.winsOpen(P)).filter(t => t !== 'win-inputedit' && t !== 'inpEditPop') }
}
const warSnap = async (w, who, iso) => { await H.warOpen(w, who, iso); return { cell: await H.cellBoxes(w, who, iso), avail: await H.availP(w.page, iso) } }
const oilRow = async (w, id) => {
  const P = w.page
  await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(900)
  await P.evaluate(() => window.scrollTo(0, 0))
  await L.press(w, T('oil-tracker')); await P.waitForTimeout(1200)
  const t = await L.txt(P, T('oil-row-' + id))
  return t
}
const backToGrid = async w => { if (await L.vis(w.page, T('oil-close'))) await L.press(w, T('oil-close')); else await L.press(w, T('lw-tab-grid')); await w.page.waitForTimeout(900); note('back-to-grid', 'desk', 'OIL tracker still up: ' + await L.vis(w.page, T('oil-close'))) }
const where = async (w, di, re) => {
  const P = w.page
  await H.goEdit(w)
  const t = P.locator(`${EDIT(di)} [data-pitog="${di}"]`).first()
  if (await t.count() && !((await H.rowsOf(P, di, 'sec-inp')).rows || []).length) { await t.scrollIntoViewIfNeeded().catch(() => {}); await t.click(); await P.waitForTimeout(500) }
  const out = {}
  for (const s of ['sec-unav', 'sec-grnd', 'sec-inp']) out[s] = ((await H.rowsOf(P, di, s)).rows || []).filter(r => re.test(r.text)).map(r => r.text)
  return { ...out, at: out['sec-unav'].length ? 'Unavailable' : out['sec-grnd'].length ? 'Ground Programme' : out['sec-inp'].length ? 'Personal Inputs only' : 'nowhere' }
}
const fillAllDay = P => async () => { if (await P.locator('#inpEditAllday').count() && !(await P.locator('#inpEditAllday').isChecked())) await L.press(globalThis.__w, '#inpEditAllday') }

/* =============================== 30 =============================== */
if (SETS.includes('30')) await sc('30', async () => {
  const w = await H.deskCtx(); globalThis.__w = w; const P = w.page
  await L.signInPlain(w, 'admin')
  note('bundle', 'desk', await H.bundleName(P))
  const ranger = await H.idOf(P, 'Ranger')
  const ISO = '2026-07-18', DI = 5
  const base = await warSnap(w, ranger, ISO)
  const f = await H.fileInput(w, { who: 'Ranger', type: 'Training', from: ISO, remarks: 'Sat trg', tag: '30', oil: 'yes', beforeSave: fillAllDay(P), onAsk: async () => { await H.pic(w, 'f-30-oil-question', ['[data-testid="oilconf"]'], { pad: 8 }) } })
  const iid = f.rec.iid
  note('30-filed', 'desk', `acc ${f.rec.acc}; oil ${JSON.stringify(f.rec.oil)}; asked ${JSON.stringify(f.asked)}`)
  await HPL.board(P, DI); const pub = await HPL.publish(P, DI); await HPL.closeBoard(P)
  const w1 = await warSnap(w, ranger, ISO)
  await H.warStrips(w, 'f-30-war-published', ranger, [ISO])
  const oil1 = await oilRow(w, ranger); await H.pic(w, 'f-30-oil-before', [T('oil-row-' + ranger)], { pad: 12 })
  await backToGrid(w)
  note('30-published', 'desk', `publish ${JSON.stringify(pub)}; war ${JSON.stringify(w1.cell)} Available P ${base.avail} → ${w1.avail}; OIL row "${oil1}"`)
  /* Reject, then → Unavail */
  await H.goEdit(w)
  const p1 = await press(w, EDIT(DI), iid, 'x', DI)
  const p2 = await press(w, EDIT(DI), iid, 'u', DI)
  note('30-move', 'desk', `Reject "${p1.label}" (windows ${JSON.stringify(p1.wins)}); "→ Unavail" "${p2.label}" (windows ${JSON.stringify(p2.wins)}); acc now ${(await H.inputById(P, iid))?.acc}`)
  if (p2.wins.length) { await H.pic(w, 'f-30-move-question', null); note('30-move', 'desk', 'a question opened on the move: ' + await P.evaluate(() => [...document.querySelectorAll('[data-testid="oilconf"]')].map(e => e.innerText.replace(/\s+/g, ' ')).join('||'))); await H.answerAsks(w, '30-move', { oil: 'yes' }) }
  const wh = await where(w, DI, /Sat trg/)
  const w2 = await warSnap(w, ranger, ISO)
  await H.warStrips(w, 'f-30-war-moved', ranger, [ISO])
  await H.zoomCells(w, 'f-30-cell-zoom', ranger, ISO, [], { pad: 14 })
  const oil2 = await oilRow(w, ranger); await H.pic(w, 'f-30-oil-after', [T('oil-row-' + ranger)], { pad: 12 })
  await backToGrid(w)
  await H.goEdit(w); await P.evaluate(di => document.querySelector(`#eWeek section.day[data-day="${di}"]`)?.scrollIntoView({ block: 'start' }), DI); await P.waitForTimeout(300)
  await H.pic(w, 'f-30-edit-moved-head', [`${EDIT(DI)} > :first-child`], { pad: 6 })
  await H.centreOn(P, [`${EDIT(DI)} .sec-unav`]); await H.pic(w, 'f-30-edit-moved', [`${EDIT(DI)} .sec-unav`], { pad: 6 })
  note('30-moved', 'desk', `row now on ${wh.at}; war ${JSON.stringify(w2.cell)} Available P ${w2.avail}; OIL row "${oil2}"`)
  L.rec('30', 'desk', hasBox(w1.cell, /^FO\*\|/) && wh.at === 'Unavailable' && hasBox(w2.cell, /^TRG\|.*outlined/) && hasBox(w2.cell, /^FO\*\|/) && oil1 === oil2 ? 'PASS?' : 'FAIL?', `Training on Sat 18 Jul, OIL Yes (asked ${JSON.stringify(f.asked)}), weekend published (${pub.version}): war ${JSON.stringify(w1.cell)}, Available P ${base.avail} → ${w1.avail}, OIL tracker "${oil1}"; after Reject → Unavail (question on the move: ${JSON.stringify(p2.wins)}): row on ${wh.at}, war ${JSON.stringify(w2.cell)}, Available P ${w2.avail}, OIL tracker "${oil2}" (${oil1 === oil2 ? 'unchanged' : 'CHANGED'})`, ['f-30-oil-question', 'f-30-war-published', 'f-30-oil-before', 'f-30-war-moved', 'f-30-oil-after', 'f-30-edit-moved'])
  note('errors-30', 'desk', JSON.stringify(w.errs))
  await w.ctx.close()
})

/* =============================== 41 =============================== */
if (SETS.includes('41')) await sc('41', async () => {
  const w = await H.deskCtx(); globalThis.__w = w; const P = w.page
  await L.signInPlain(w, 'admin')
  const ranger = await H.idOf(P, 'Ranger')
  /* (a) a course filed on a Saturday asks the OIL question at the save */
  let courseAsk = null
  const fc = await H.fileInput(w, { who: 'Ranger', type: 'CSE', from: '2026-07-18', remarks: 'Sat course', tag: '41-cse', oil: 'no', onAsk: async open => { if (open.includes('oilconf')) { courseAsk = await P.evaluate(() => [...document.querySelectorAll('[data-testid="oilconf"]')].map(e => e.innerText.replace(/\s+/g, ' ')).join('||')); await H.pic(w, 'f-41-course-question', ['[data-testid="oilconf"]'], { pad: 8 }) } } })
  note('41-course', 'desk', `a course on Sat 18 Jul: asked ${JSON.stringify(fc.asked)}; question words: ${courseAsk}; acc ${fc.rec?.acc}`)
  L.rec('41-course', 'desk', fc.asked.includes('oilconf') ? 'PASS?' : 'FAIL?', `a course (CSE) for Ranger filed on Saturday 18 Jul from the Inputs window: questions raised at the save ${JSON.stringify(fc.asked)}; words "${courseAsk}"; landed acc ${fc.rec?.acc}`, ['f-41-course-question'])
  /* (b) a Meeting on a day that became a holiday: Wed 15 Jul */
  const ISO = '2026-07-15', DI = 2
  const f = await H.fileInput(w, { who: 'Ranger', type: 'Meeting', from: ISO, remarks: 'Hol meet', tag: '41', beforeSave: fillAllDay(P) })
  const iid = f.rec.iid
  note('41-filed', 'desk', `Meeting on Wed 15: acc ${f.rec.acc}; oil ${JSON.stringify(f.rec.oil)}; asked ${JSON.stringify(f.asked)}`)
  const base = await warSnap(w, ranger, ISO)
  /* the day becomes a public holiday through the war's own Event row (preset PH) */
  await P.locator(T('event-1-' + ISO)).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await P.waitForTimeout(400)
  await L.press(w, T('event-1-' + ISO)); await P.waitForTimeout(900)
  await L.press(w, T('event-quick-0')); await P.waitForTimeout(400)
  note('41-holiday', 'desk', 'event sheet: ' + await P.evaluate(() => { const s = [...document.querySelectorAll('.bidsheet, .sheet, [role=dialog]')].filter(e => e.getBoundingClientRect().width > 0).pop(); return s ? s.innerText.replace(/\s+/g, ' ').slice(0, 300) : 'none' }))
  await L.press(w, T('event-apply')); await P.waitForTimeout(1500)
  const afterHol = await P.evaluate(() => [...document.querySelectorAll('[data-testid="oilconf"], [data-testid="oillist"], [data-testid^="oil-list"], [data-testid^="oilwait"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid + ': ' + e.innerText.replace(/\s+/g, ' ').slice(0, 300)))
  note('41-holiday', 'desk', 'after saving the holiday, OIL windows: ' + JSON.stringify(afterHol) + ' · all windows: ' + (await H.winsOpen(P)).join(',') + ' · visible dialogs: ' + await P.evaluate(() => [...document.querySelectorAll('[role=dialog],.airpop-box,.sheet,.bidsheet')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.dataset.testid || e.className.toString().slice(0, 20)) + ': ' + e.innerText.replace(/\s+/g, ' ').slice(0, 200)).join(' || ')))
  await H.pic(w, 'f-41-after-holiday', null)
  /* leave the question unanswered: close whatever is open by its own cross / Back */
  /* the day's own OIL list opened by itself (win-oilday): closed with its cross, no answer given */
  const dayList = await P.evaluate(() => { const e = document.querySelector('[data-testid="win-oilday"]'); return e && e.getBoundingClientRect().width > 0 ? e.innerText.replace(/\s+/g, ' ').slice(0, 600) : null })
  note('41-holiday', 'desk', 'the day OIL list reads: ' + dayList)
  await H.pic(w, 'f-41-oil-day-list', ['[data-testid="win-oilday"]'], { pad: 8 })
  await P.locator('[data-testid="win-oilday-x"], [data-testid="win-oilday"] .x, [data-testid="win-oilday"] button:has-text("✕")').first().click().catch(() => {}); await P.waitForTimeout(500)
  note('41-holiday', 'desk', 'after its cross, windows open: ' + await P.evaluate(() => [...document.querySelectorAll('[data-testid^="win-"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid).join(',')))
  const inpNow = await H.inputById(P, iid)
  note('41-holiday', 'desk', `Meeting's OIL record after the holiday: ${JSON.stringify(inpNow?.oil)}; acc ${inpNow?.acc}`)
  const w0 = await warSnap(w, ranger, ISO)
  await H.goEdit(w)
  const b0 = await accList(P, EDIT(DI), iid)
  note('41-start', 'desk', `on Wed 15: buttons ${JSON.stringify(b0)}; war ${JSON.stringify(w0.cell)} Available P ${base.avail} → ${w0.avail}`)
  await H.centreOn(P, [EDIT(DI) + ' .sec-grnd']); await H.pic(w, 'f-41-start-ground', [EDIT(DI) + ' .sec-grnd'], { pad: 6 })
  const p1 = await press(w, EDIT(DI), iid, 'x', DI)
  note('41-reject', 'desk', `Reject "${p1.label}": windows ${JSON.stringify(p1.wins)}; buttons now ${JSON.stringify(await accList(P, EDIT(DI), iid))}`)
  if (p1.wins.includes('oilconf')) { await H.pic(w, 'f-41-reject-question', null); await H.answerAsks(w, '41-reject', { oil: 'yes' }) }
  const p2 = await press(w, EDIT(DI), iid, 'u', DI)
  const accDuring = (await H.inputById(P, iid))?.acc
  const qWords = await P.evaluate(() => [...document.querySelectorAll('[data-testid="oilconf"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ')).join('||'))
  /* the war is not read while the question is up: leaving the page would dismiss it; the stored acc is the proof nothing moved */
  const btnsDuring = await accList(P, EDIT(DI), iid)
  const wDuring = { cell: [], avail: null }
  note('41-unavail', 'desk', `"→ Unavail" "${p2.label}": windows ${JSON.stringify(p2.wins)}; question words "${qWords}"; acc while the question is up ${accDuring}; the row's buttons still ${JSON.stringify(btnsDuring)}`)
  if (p2.wins.includes('oilconf')) await H.pic(w, 'f-41-unavail-question', null)
  else await H.pic(w, 'f-41-unavail-noquestion', null)
  let accAfter = null, wAfter = null
  if (p2.wins.includes('oilconf')) {
    /* the question is still up on the Edit Schedule page; answer it */
    await H.answerAsks(w, '41-answer', { oil: 'yes' })
    accAfter = (await H.inputById(P, iid))?.acc
    wAfter = await warSnap(w, ranger, ISO)
    await H.warStrips(w, 'f-41-war-after-answer', ranger, [ISO])
  }
  note('41-answer', 'desk', `after the answer: acc ${accAfter}; war ${JSON.stringify(wAfter?.cell)} Available P ${wAfter?.avail}`)
  L.rec('41', 'desk', p2.wins.includes('oilconf') && accDuring !== 'u' && (wDuring.cell || []).length === 0 && accAfter === 'u' && hasBox(wAfter?.cell, /^MTG\|.*outlined/) ? 'PASS?' : 'FAIL?', `(the Saturday cannot be filed without an answer — the question has only Yes / No OIL / Back — so the day was made a holiday afterwards through the war's Event row, preset PH) Meeting on Wed 15 (oil ${JSON.stringify(inpNow?.oil)}); Reject → windows ${JSON.stringify(p1.wins)}; "→ Unavail" → windows ${JSON.stringify(p2.wins)} ("${qWords.slice(0, 200)}"), acc while open ${accDuring}, row's buttons ${JSON.stringify(btnsDuring)}; after answering Yes: acc ${accAfter}, war ${JSON.stringify(wAfter?.cell)} Available P ${wAfter?.avail}`, ['f-41-after-holiday', 'f-41-start-ground', 'f-41-unavail-question', 'f-41-war-after-answer'])
  note('errors-41', 'desk', JSON.stringify(w.errs))
  await w.ctx.close()
})

/* =============================== 32 =============================== */
if (SETS.includes('32')) await sc('32', async () => {
  const w = await H.deskCtx(); globalThis.__w = w; const P = w.page
  await L.signInPlain(w, 'admin')
  const ids = { Ranger: await H.idOf(P, 'Ranger'), Drifter: await H.idOf(P, 'Drifter'), Hunter: await H.idOf(P, 'Hunter') }
  const MON = '2026-07-13', TUE = '2026-07-14'
  const base = { mon: (await warSnap(w, ids.Ranger, MON)).avail, tue: (await warSnap(w, ids.Ranger, TUE)).avail }
  note('32-base', 'desk', `Available P Mon ${base.mon}, Tue ${base.tue}`)
  const plan = [['Ranger', 'Appointment', ['10:00', '11:00'], 'Appt 1000'], ['Drifter', 'Meeting', ['09:00', '17:00'], 'Meet 0900'], ['Hunter', 'Duty', ['22:00', '02:00'], 'Duty 2200']]
  const seq = []
  for (const [cs, kind, times, mark] of plan) {
    const f = await H.fileInput(w, { who: cs, type: kind, from: MON, remarks: mark, times, tag: '32-' + kind, oil: 'no' })
    const iid = f.rec?.iid
    if (!iid) { seq.push({ cs, kind, error: 'not filed ' + JSON.stringify(f.asked) }); continue }
    await H.goEdit(w)
    const r1 = await press(w, EDIT(0), iid, 'x', 0).catch(e => ({ label: 'none', wins: [], err: String(e).slice(0, 100) }))
    const r2 = await press(w, EDIT(0), iid, 'u', 0)
    if (r2.wins.length) await H.answerAsks(w, '32-' + kind, { oil: 'no' })
    const wm = await warSnap(w, ids[cs], MON), wt = await warSnap(w, ids[cs], TUE)
    const rec = await H.inputById(P, iid)
    seq.push({ cs, kind, times: `${rec?.s}-${rec?.e}`, acc: rec?.acc, monCell: wm.cell, tueCell: wt.cell, monAvail: wm.avail, tueAvail: wt.avail })
    note('32-' + kind, 'desk', JSON.stringify(seq[seq.length - 1]))
  }
  for (const cs of ['Ranger', 'Drifter', 'Hunter']) { await H.warStrips(w, 'f-32-war-' + cs.toLowerCase(), ids[cs], [MON, TUE]); await H.zoomCells(w, 'f-32-zoom-' + cs.toLowerCase() + '-mon', ids[cs], MON, [TUE], { pad: 10 }) }
  await H.goEdit(w); await P.evaluate(() => document.querySelector('#eWeek section.day[data-day="0"]')?.scrollIntoView({ block: 'start' })); await P.waitForTimeout(300)
  await H.centreOn(P, [EDIT(0) + ' .sec-unav']); await H.pic(w, 'f-32-edit-unav', [EDIT(0) + ' .sec-unav'], { pad: 6 })
  const last = seq[seq.length - 1]
  L.rec('32', 'desk', 'RECORD', `Available P Mon ${base.mon} / Tue ${base.tue} at the start. After the Appointment 10:00–11:00 (Ranger): Mon ${seq[0]?.monAvail}, Tue ${seq[0]?.tueAvail}; + the Meeting 09:00–17:00 (Drifter): Mon ${seq[1]?.monAvail}, Tue ${seq[1]?.tueAvail}; + the overnight Duty 22:00–02:00 (Hunter): Mon ${seq[2]?.monAvail}, Tue ${seq[2]?.tueAvail}. Cells — Ranger Mon ${JSON.stringify(seq[0]?.monCell)}; Drifter Mon ${JSON.stringify(seq[1]?.monCell)}; Hunter Mon ${JSON.stringify(seq[2]?.monCell)} Tue ${JSON.stringify(seq[2]?.tueCell)}`, ['f-32-war-ranger', 'f-32-war-drifter', 'f-32-war-hunter', 'f-32-edit-unav'])
  note('errors-32', 'desk', JSON.stringify(w.errs))
  await w.ctx.close()
})

H.saveLog('f-run.json')
await H.closeBrowser()
console.log('RESULTS'); for (const r of L.results) console.log(r.verdict, r.id, '|', r.said)
