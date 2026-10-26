// THE WALK OF [LW-OTHER-GOES-TO-LOCK] (his D1388) AND [LW-OD-DISCARD-COUNT] — 26 Oct 26, on claude/lw-other-goes-to-lock.
// Every step is an assertion of the RIGHT behaviour (a PASS is correct), so a re-run on a fixed build is the re-walk.
//   W1  a scheduler moves Ranger's Other (Reject, → Unavail) on Edit Schedule's week — the mark is written
//   W2  Ranger opens it (desktop, then phone with a picture right after the tap): where it stands, both buttons dead,
//       the line says a scheduler moved it; the dead Ground Programme button changes nothing
//   W3  Ranger retypes it to an Attach and saves: it stays under Unavailable (an Attach would land there anyway — and a
//       Meeting must too); then retypes it to a Meeting: still under Unavailable
//   W4  a second Other Ranger himself sent under Unavailable, which a scheduler moves onto the Ground Programme (Reject,
//       → Ground): Ranger's window shows Ground Programme, dead; his retype to a leave (LL) is refused with its reason
//   W1b the same on the Scheduler Board: its Ground Programme row's ✕, then → Unavail — each writes the mark
//   W4b Ranger puts ALL AVAIL into the one held under Unavailable ("Several people") — refused with its reason
//   W5  an Other Ranger files and nobody moves: both buttons live, his pick moves it
//   W6  the scheduler's own window on the held one still moves it (→ Ground Programme), and his own Goes to row is live
//   W7  a one-day overseas duty, published under Unavailable, then Reject and → Ground: the day head reads 1 pending
//       and "Load onto working copy" arms as "Discard 1 edit"; loaded, the day is back with nothing pending
// Usage (from raptor-port/, the build served on 4180): node scripts/handpass/lw-lock-walk.mjs   (ONLY=W1,W2 … to re-run steps)
process.env.LW_PORT ||= '4180'
process.env.LW_OUT ||= '2026-10-26-lw-goes-lock'
process.env.HP_URL ||= 'http://localhost:4180'
const H = await import('./lw-m3b-w2-lib.mjs')
const { L, T, note } = H
const CD = await import('./cd-lib.mjs')
const LIB = await import('./lib.mjs')
const fs = await import('node:fs')
fs.mkdirSync(H.OUT, { recursive: true })
H.clearPrefix('w')
console.log('lw-lock-walk →', H.OUT)
const results = []
const rec = (id, size, ok, said) => { results.push({ id, size, verdict: ok ? 'PASS' : 'FAIL', said }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id} [${size}] ${said}`) }

const w = await H.deskFrom(undefined, 2); const P = w.page
await L.signInPlain(w, 'admin')
note('bundle', 'desk', await H.bundleName(P))

async function pressAcc(w, scope, di, iid, dest) {
  const P = w.page
  const sel = `${scope} [data-acc="${dest}"][data-acck="${iid}"]`
  const vis = async () => { const n = await P.locator(sel).count(); for (let i = 0; i < n; i++) if (await P.locator(sel).nth(i).isVisible()) return i; return -1 }
  let at = await vis()
  if (at < 0) { const t = P.locator(`${scope} [data-pitog="${di}"]`).first(); if (await t.count()) { await t.scrollIntoViewIfNeeded().catch(() => {}); await t.click(); await P.waitForTimeout(500); at = await vis() } }
  if (at < 0) return false
  const b = P.locator(sel).nth(at); await b.scrollIntoViewIfNeeded().catch(() => {})
  await b.click(); await P.waitForTimeout(1000)
  await H.answerAsks(w, 'acc-' + dest, { oil: 'no' })
  return true
}
const said = async P => P.evaluate(() => [...document.querySelectorAll('.toast, #toast, [role="status"], .snack')].map(e => (e.innerText || '').trim()).filter(Boolean).join(' | '))
const memberCtx = async (phone = false) => { const st = await w.ctx.storageState(); const m = phone ? await H.phoneFrom(st) : await H.deskFrom(st, 2); await L.signInPlain(m, 'member'); return m }

/* ---------- W1 ---------- */
const o1 = await H.fileInput(w, { who: 'Ranger', type: 'Other', from: '2026-07-16', remarks: 'Squadron dinner prep', goes: 'g', tag: 'w1-file', oil: 'no' })
await H.goEdit(w)
const s3 = H.dayScope('editsched', 3)
const moved = (await pressAcc(w, s3, 3, o1.rec.iid, 'x')) && (await pressAcc(w, s3, 3, o1.rec.iid, 'u'))
const r1 = await H.inputById(P, o1.rec.iid)
await H.centreOn(P, [`${s3} .sec-unav`])
await H.pic(w, 'w1-scheduler-moved-it-under-unavailable', [`${s3} .sec-unav`], { pad: 4, scale: 'device' })
rec('W1', 'desk', moved && r1?.acc === 'u' && r1?.schedPlaced === true, `Reject then → Unavail pressed: ${moved}; stored acc ${r1?.acc}, moved-by-a-scheduler mark ${r1?.schedPlaced}`)

/* ---------- W1b — the Scheduler Board's own doors: the ✕ that removes a Ground Programme row, then → Unavail ---------- */
const o1b = await H.fileInput(w, { who: 'Ranger', type: 'Other', from: '2026-07-14', remarks: 'Range safety', goes: 'g', tag: 'w1b-file', oil: 'no' })
await LIB.board(P, 1)
const ri = await P.evaluate(iid => (window.DAYS[1].ground || []).findIndex(r => r && r.src === iid), o1b.rec.iid)
const x = P.locator(`#schedBoard [data-grdel="1.${ri}"]:visible`).first()
const hadX = (await x.count()) > 0
if (hadX) { await x.scrollIntoViewIfNeeded().catch(() => {}); await x.click(); await P.waitForTimeout(1000) }
const r1b = await H.inputById(P, o1b.rec.iid)
const toU = await pressAcc(w, '#schedBoard', 1, o1b.rec.iid, 'u')
const r1c = await H.inputById(P, o1b.rec.iid)
await H.pic(w, 'w1b-board-after-the-moves', ['#schedBoard .sb-panel.unav, #schedBoard .sb-panel.pinp'], { pad: 6, scale: 'device' }).catch(async () => { await P.screenshot({ path: `${H.OUT}/w1b-board-after-the-moves.png` }) })
rec('W1b', 'desk', hadX && r1b?.acc === 'r' && r1b?.schedPlaced === true && toU && r1c?.acc === 'u' && r1c?.schedPlaced === true, `its Ground row's ✕ on the board (row ${ri}, found ${hadX}): acc ${r1b?.acc}, mark ${r1b?.schedPlaced}; then the board's → Unavail (${toU}): acc ${r1c?.acc}, mark ${r1c?.schedPlaced}`)
await LIB.closeBoard(P).catch(() => {})

/* ---------- W4's fixture: Ranger's own pick under Unavailable, moved by a scheduler onto the programme ---------- */
const o4 = await H.fileInput(w, { who: 'Ranger', type: 'Other', from: '2026-07-17', remarks: 'Mess committee', goes: 'u', tag: 'w4-file', oil: 'no' })
await H.goEdit(w)
const s4 = H.dayScope('editsched', 4)
const moved4 = (await pressAcc(w, s4, 4, o4.rec.iid, 'x')) && (await pressAcc(w, s4, 4, o4.rec.iid, 'g'))
const r4 = await H.inputById(P, o4.rec.iid)
rec('W4-fixture', 'desk', moved4 && r4?.acc !== 'u' && r4?.acc !== 'r' && r4?.schedPlaced === true, `filed by Ranger's pick under Unavailable, then Reject and → Ground: acc ${r4?.acc}, mark ${r4?.schedPlaced}`)

/* ---------- W2, W3, W4, W5 — Ranger, desktop ---------- */
const m = await memberCtx(false); const M = m.page
await H.openInputBy(m, o1.rec.iid, 'list')
const g2 = await H.goesRead(M)
await H.pic(m, 'w2-ranger-opens-the-moved-one', ['.inped-goes', T('inpEdit-goes-g')], { pad: 30, scale: 'device' })
rec('W2', 'desk', g2.row && g2.u === 'true' && g2.gDisabled && g2.uDisabled && /scheduler moved it here: counted as away on the Leave War/i.test(g2.line), JSON.stringify(g2))
await M.locator(T('inpEdit-goes-g')).click({ force: true }).catch(() => {}); await M.waitForTimeout(300)
const g2b = await H.goesRead(M)
rec('W2-dead-press', 'desk', g2b.u === 'true' && g2b.g !== 'true', `after a press on the dead Ground Programme button: ${JSON.stringify(g2b)}`)
/* W3: retype to an Attach, save */
await M.locator('#inpEditType').selectOption('Attach'); await M.waitForTimeout(400)
await L.press(m, '#inpEditSave'); await M.waitForTimeout(1200); await H.answerAsks(m, 'w3-attach', { oil: 'no' })
const r3 = await H.inputById(M, o1.rec.iid)
rec('W3-attach', 'desk', r3?.type === 'Attach' && r3?.acc === 'u', `retyped to an Attach and saved: type ${r3?.type}, acc ${r3?.acc}; said: ${await said(M)}`)
await H.openInputBy(m, o1.rec.iid, 'list')
await M.locator('#inpEditType').selectOption('Meeting'); await M.waitForTimeout(400)
await L.press(m, '#inpEditSave'); await M.waitForTimeout(1200); await H.answerAsks(m, 'w3-meeting', { oil: 'no' })
const r3b = await H.inputById(M, o1.rec.iid)
rec('W3-meeting', 'desk', r3b?.type === 'Meeting' && r3b?.acc === 'u', `then to a Meeting: type ${r3b?.type}, acc ${r3b?.acc} (a Meeting he files lands on the programme; this one stays where the scheduler put it)`)
/* W4: the one on the programme */
await H.openInputBy(m, o4.rec.iid, 'list')
const g4 = await H.goesRead(M)
await H.pic(m, 'w4-ranger-opens-the-one-moved-onto-the-programme', ['.inped-goes', T('inpEdit-goes-g')], { pad: 30, scale: 'device' })
rec('W4-window', 'desk', g4.row && g4.g === 'true' && g4.gDisabled && g4.uDisabled && /scheduler moved it here: still counted/i.test(g4.line), JSON.stringify(g4))
await M.locator('#inpEditType').selectOption('LL'); await M.waitForTimeout(400)
await L.press(m, '#inpEditSave'); await M.waitForTimeout(1200)
await H.answerAsks(m, 'w4-ll', { oil: 'no' }).catch(e => note('w4-ll', 'desk', 'question: ' + e.message))
const toast4 = await said(M)
await H.pic(m, 'w4-retype-to-a-leave-refused', [T('win-inputedit'), '#inpEditPop'], { pad: 10, scale: 'device' }).catch(() => {})
await M.screenshot({ path: `${H.OUT}/w4-retype-to-a-leave-refused-screen.png` })
const r4b = await H.inputById(M, o4.rec.iid)
rec('W4-refused', 'desk', r4b?.type === 'Other' && /scheduler has moved this input/i.test(toast4), `retype to LL: stored type ${r4b?.type}, acc ${r4b?.acc}; said: ${toast4}`)
await M.keyboard.press('Escape'); await M.waitForTimeout(400)
/* W4b: ALL AVAIL put into the one held under Unavailable (W3's Meeting), through "Several people" — refused */
await H.openInputBy(m, o1.rec.iid, 'list')
await L.press(m, `${T('win-inputedit')} ${T('pp-several')}`); await M.waitForTimeout(400)
const ph4 = M.locator(`${T('win-inputedit')} [data-ph="allavail"]`).first()
const hadAA = (await ph4.count()) > 0
if (hadAA) { await ph4.click(); await M.waitForTimeout(350) }
await L.press(m, '#inpEditSave'); await M.waitForTimeout(1200)
await H.answerAsks(m, 'w4b', { oil: 'no' }).catch(e => note('w4b', 'desk', 'question: ' + e.message))
const toast4b = await said(M)
await M.screenshot({ path: `${H.OUT}/w4b-all-avail-into-the-held-one-refused.png` })
const r4c = await H.inputById(M, o1.rec.iid)
rec('W4b', 'desk', hadAA && r4c?.acc === 'u' && !(r4c?.people || []).some(p => p.p === 'allavail') && /only a scheduler can put ALL AVAIL/i.test(toast4b), `ALL AVAIL chip offered ${hadAA}; stored acc ${r4c?.acc}, people ${JSON.stringify((r4c?.people || []).map(p => p.p))}; said: ${toast4b}`)
await M.keyboard.press('Escape'); await M.waitForTimeout(400)
/* W5: his own, unmoved */
const o5 = await H.fileInput(m, { who: null, type: 'Other', from: '2026-07-15', remarks: 'Dentist', goes: 'g', tag: 'w5-file', oil: 'no' })
await H.openInputBy(m, o5.rec.iid, 'list')
const g5 = await H.goesRead(M)
await L.press(m, T('inpEdit-goes-u')); await M.waitForTimeout(300)
const g5b = await H.goesRead(M)
await H.pic(m, 'w5-his-own-unmoved-other-still-his-to-pick', ['.inped-goes', T('inpEdit-goes-g')], { pad: 30, scale: 'device' })
await L.press(m, '#inpEditSave'); await M.waitForTimeout(1200); await H.answerAsks(m, 'w5-save', { oil: 'no' })
const r5 = await H.inputById(M, o5.rec.iid)
rec('W5', 'desk', !g5.gDisabled && !g5.uDisabled && g5b.u === 'true' && r5?.acc === 'u' && !r5?.schedPlaced, `before ${JSON.stringify(g5)} · after his press ${JSON.stringify(g5b)} · saved acc ${r5?.acc}, mark ${r5?.schedPlaced}`)
note('member-errors', 'desk', JSON.stringify(m.errs.slice(0, 6)))

/* ---------- W2 on a phone: the tap, a picture right after it (D1281), the settled window ---------- */
const ph = await memberCtx(true); const PH = ph.page
await H.openInputsList(ph)
const rowSel = `#inBody [data-iid="${o4.rec.iid}"], #inList [data-iid="${o4.rec.iid}"]`
if (!(await PH.locator(rowSel).count())) { await L.press(ph, '#inRangeBtn'); await PH.waitForTimeout(400); if (await L.vis(PH, '#inRangeAll')) { await L.press(ph, '#inRangeAll'); await PH.waitForTimeout(800) } }
await PH.locator(rowSel).first().scrollIntoViewIfNeeded()
const box = await PH.locator(rowSel).first().boundingBox()
await PH.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
await PH.waitForTimeout(80); await PH.screenshot({ path: `${H.OUT}/w2p-phone-right-after-the-tap.png` })
await PH.waitForSelector('#inpEditPop', { state: 'visible', timeout: 6000 }); await PH.waitForTimeout(600)
await PH.locator(T('inpEdit-goes-g')).scrollIntoViewIfNeeded().catch(() => {})
const gp = await H.goesRead(PH)
await PH.screenshot({ path: `${H.OUT}/w2p-phone-the-window.png` })
const inScreen = await PH.evaluate(sel => { const b = document.querySelector(sel); if (!b) return null; const r = b.getBoundingClientRect(); return r.top >= 0 && r.bottom <= window.innerHeight && r.left >= 0 && r.right <= window.innerWidth }, '[data-testid="inpEdit-goes-line"]')
rec('W2-phone', 'phone', gp.row && gp.g === 'true' && gp.gDisabled && gp.uDisabled && /scheduler moved it here/i.test(gp.line) && inScreen === true, `${JSON.stringify(gp)}; the line inside the screen: ${inScreen}`)
note('phone-errors', 'phone', JSON.stringify(ph.errs.slice(0, 6)))

/* ---------- W6 — the scheduler's own window on the held one ---------- */
/* (the admin's own world: the member's pages above ran in copies of it, so nothing he did reaches here) */
await H.openInputBy(w, o4.rec.iid, 'list')
const g6 = await H.goesRead(P)
await H.pic(w, 'w6-scheduler-window-keeps-both', ['.inped-goes', T('inpEdit-goes-g')], { pad: 30, scale: 'device' })
await L.press(w, T('inpEdit-goes-u')); await P.waitForTimeout(300)
await L.press(w, '#inpEditSave'); await P.waitForTimeout(1200); await H.answerAsks(w, 'w6-save', { oil: 'no' })
const r6 = await H.inputById(P, o4.rec.iid)
rec('W6', 'desk', !g6.gDisabled && !g6.uDisabled && !/scheduler moved/i.test(g6.line) && r6?.acc === 'u', `his window ${JSON.stringify(g6)}; after his Unavailable and Save: acc ${r6?.acc}`)

/* ---------- W7 — the load's count ---------- */
const who7 = await P.evaluate(() => {
  const busy = new Set((window.INPUTS || []).filter(i => i.date === 'Jul 13').flatMap(i => [i.person, ...((i.people || []).map(x => x.p))]))
  return Object.entries(window.PEOPLE || {}).find(([id, p]) => !p.special && !p.archived && !p.deleted && !p.pers && !busy.has(id))?.[1]?.cs
})
const o7 = await H.fileInput(w, { who: who7, type: 'OD', from: '2026-07-13', remarks: 'Exercise planning', tag: 'w7-file', oil: 'no' })
await LIB.board(P, 0)
const pub = await CD.signAndPublish(P, 0)
note('w7-published', 'desk', JSON.stringify(pub))
await LIB.closeBoard(P).catch(() => {})
await H.goEdit(w)
const s0 = H.dayScope('editsched', 0)
const moved7 = (await pressAcc(w, s0, 0, o7.rec.iid, 'x')) && (await pressAcc(w, s0, 0, o7.rec.iid, 'g'))
const r7 = await H.inputById(P, o7.rec.iid)
await LIB.board(P, 0)
const pend = await P.evaluate(() => { const c = document.querySelector('#schedBoard .dpend:not(.dnew):not(.dchg)'); return c ? (c.innerText || '').replace(/\s+/g, ' ').trim() : null })
await P.locator('[data-planmenu="0"]:visible').first().click(); await P.waitForTimeout(700)
const pv = P.locator('[data-planpv^="2026-07-13#"]:visible').first()
await pv.click(); await P.waitForTimeout(1300)
await P.locator('#schedBoard [data-restore]:visible').first().click(); await P.waitForTimeout(900)
const armed = await P.evaluate(() => [...document.querySelectorAll('#schedBoard button')].filter(b => b.offsetParent && /Discard|already at/i.test(b.innerText || '')).map(b => (b.innerText || '').replace(/\s+/g, ' ').trim()).join(' | '))
await H.pic(w, 'w7-load-arms-discard-1-edit', ['#schedBoard [data-restore]'], { pad: 40, scale: 'device' }).catch(async () => { await P.screenshot({ path: `${H.OUT}/w7-load-arms-discard-1-edit.png` }) })
rec('W7', 'desk', moved7 && r7?.odGround === true && /1 pending/.test(pend || '') && /Discard 1 edit\b/.test(armed), `OD moved onto the programme: ${moved7}, stored ${JSON.stringify({ acc: r7?.acc, odGround: r7?.odGround })}; head "${pend}"; the load arms as "${armed}"`)
const conf = P.locator('#schedBoard [data-restore]:visible').first()
if (await conf.count()) { await conf.click(); await P.waitForTimeout(1500) }
const pend2 = await P.evaluate(() => { const c = document.querySelector('#schedBoard .dpend:not(.dnew):not(.dchg)'); return c ? (c.innerText || '').replace(/\s+/g, ' ').trim() : '' })
const r7b = await H.inputById(P, o7.rec.iid)
await P.screenshot({ path: `${H.OUT}/w7-after-the-load.png` })
rec('W7-loaded', 'desk', !/pending/.test(pend2) && !r7b?.odGround && r7b?.acc !== 'g', `after the load: head "${pend2}", stored ${JSON.stringify({ acc: r7b?.acc, odGround: r7b?.odGround })}`)

note('errors', 'desk', JSON.stringify(w.errs.slice(0, 8)))
fs.writeFileSync(`${H.OUT}/walk-results.json`, JSON.stringify({ results, log: H.log }, null, 1))
console.log(`\n${results.filter(r => r.verdict === 'PASS').length} PASS, ${results.filter(r => r.verdict === 'FAIL').length} FAIL`)
await H.closeBrowser()
