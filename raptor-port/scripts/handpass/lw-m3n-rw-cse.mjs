// THE WALK OF [LW-REJECTED-CSE] — his D1381, D1389, D1390 (the night of 26 Oct 26): a course or an overseas duty a
// scheduler takes out of Unavailable counts him back in on the Leave War. Written as assertions of the RIGHT behaviour
// (walk-scripts §6), the built bundle on 4180, desktop 1536 x 864 then an iPhone's size:
//   N1  a course filed for Comet on Wed 15 Jul: the war counts him out (Available P one lower, a CSE box), the SANS
//       calendar's "still needed" with it
//   N2  Reject pressed on Edit Schedule: Available P back to before, no CSE box, the SANS need back to before
//   N3  → Ground pressed on the rejected course: still counted in
//   N4  → Unavail pressed: counted out again
//   N5  an overseas duty (Pike, Jul 15–17 in the demo): what the schedule offers it — pictured and recorded, judged only
//       if it offers a way out of Unavailable
//   N6  the phone: a fresh course filed and Rejected on Edit Schedule at an iPhone's size; the war's day panel counts him in
// Usage (from raptor-port/, the build served on 4180): node scripts/handpass/lw-m3n-rw-cse.mjs
process.env.LW_PORT ||= '4180'
process.env.LW_OUT ||= '2026-10-26-lw-m3-night/cse'
const fs = await import('node:fs')
const H = await import('./lw-m3b-w2-lib.mjs')
const { L, T, note } = H
fs.mkdirSync(H.OUT, { recursive: true })
H.clearPrefix('n')
console.log('lw-m3n-rw-cse →', H.OUT)
const verdicts = []
const judge = (id, ok, said) => { verdicts.push({ id, ok }); note(id, ok ? 'PASS' : 'FAIL', said) }
const iso = '2026-07-15'

async function pressAcc(w, scope, di, iid, dest) {
  const P = w.page
  const sel = `${scope} [data-acc="${dest}"][data-acck="${iid}"]`
  const vis = async () => { const n = await P.locator(sel).count(); for (let i = 0; i < n; i++) if (await P.locator(sel).nth(i).isVisible()) return i; return -1 }
  let at = await vis()
  if (at < 0) { const t = P.locator(`${scope} [data-pitog="${di}"]`).first(); if (await t.count()) { await t.scrollIntoViewIfNeeded().catch(() => {}); await t.click(); await P.waitForTimeout(500); at = await vis() } }
  if (at < 0) return false
  const b = P.locator(sel).nth(at); await b.scrollIntoViewIfNeeded().catch(() => {})
  await b.click(); await P.waitForTimeout(1000)
  await H.answerAsks(w, 'n-acc-' + dest, { oil: 'no' })
  return true
}
async function sansNeedNow(w) {
  await H.sansOpen(w); await H.sansMonth(w, 2026, 7)
  return H.sansNeed(w.page, iso)
}
async function warNow(w, who, name) {
  await H.warOpen(w, who, iso)
  const a = await H.availP(w.page, iso)
  await H.warStrips(w, name, who, [iso])
  return { cell: await H.cellBoxes(w, who, iso), avail: a }
}
const hasCse = cell => JSON.stringify(cell).includes('CSE')

/* ---------- desktop ---------- */
const w = await H.deskCtx(); const P = w.page
await L.signInPlain(w, 'admin')
note('bundle', 'desk', await H.bundleName(P))
const comet = await H.idOf(P, 'Comet')
const before = await warNow(w, comet, 'n1-0-war-before')
const needBefore = await sansNeedNow(w)

const fc = await H.fileInput(w, { who: 'Comet', type: 'CSE', from: iso, remarks: 'Instructor course', tag: 'n1', oil: 'no' })
const filed = await warNow(w, comet, 'n1-1-war-course-filed')
const needFiled = await sansNeedNow(w)
judge('N1', filed.avail === before.avail - 1 && hasCse(filed.cell) && fc.rec.acc === 'u',
  `Available P ${before.avail} → ${filed.avail}; Comet's cell ${JSON.stringify(filed.cell)}; filed acc ${fc.rec.acc}; SANS still needed ${needBefore} → ${needFiled}`)

await H.goEdit(w)
const scope = '#eWeek section.day[data-day="2"]'
await H.centreOn(P, [`${scope} .sec-unav`])
await H.pic(w, 'n2-1-schedule-before-reject', [`${scope} .sec-unav`], { pad: 6 })
const rejected = await pressAcc(w, scope, 2, fc.rec.iid, 'x')
await H.pic(w, 'n2-2-schedule-after-reject', [`${scope} .sec-unav`, `${scope} .sec-inp`], { pad: 6 })
const accR = (await H.inputById(P, fc.rec.iid))?.acc
const rej = await warNow(w, comet, 'n2-3-war-after-reject')
const needRej = await sansNeedNow(w)
judge('N2', rejected && accR === 'r' && rej.avail === before.avail && !hasCse(rej.cell) && needRej === needBefore,
  `Reject pressed ${rejected}, stored acc ${accR}; Available P ${rej.avail} (before ${before.avail}); Comet's cell ${JSON.stringify(rej.cell)}; SANS still needed ${needRej} (before ${needBefore})`)

await H.goEdit(w)
const grounded = await pressAcc(w, scope, 2, fc.rec.iid, 'g')
await H.centreOn(P, [`${scope} .sec-ground, ${scope} .sec-inp`])
await H.pic(w, 'n3-1-schedule-on-ground', [`${scope} .sec-unav`], { pad: 6 })
const accG = (await H.inputById(P, fc.rec.iid))?.acc
const gr = await warNow(w, comet, 'n3-2-war-on-ground')
judge('N3', grounded && accG === 'g' && gr.avail === before.avail && !hasCse(gr.cell),
  `→ Ground pressed ${grounded}, stored acc ${accG}; Available P ${gr.avail} (before ${before.avail}); Comet's cell ${JSON.stringify(gr.cell)}`)

await H.goEdit(w)
let unav = await pressAcc(w, scope, 2, fc.rec.iid, 'u')
if (!unav) { // a landed row offers Reject first; then → Unavail
  unav = (await pressAcc(w, scope, 2, fc.rec.iid, 'x')) && (await pressAcc(w, scope, 2, fc.rec.iid, 'u'))
}
const accU = (await H.inputById(P, fc.rec.iid))?.acc
const un = await warNow(w, comet, 'n4-1-war-under-unavail-again')
judge('N4', unav && accU === 'u' && un.avail === before.avail - 1 && hasCse(un.cell),
  `→ Unavail pressed ${unav}, stored acc ${accU}; Available P ${un.avail}; Comet's cell ${JSON.stringify(un.cell)}`)

/* ---------- N5 the overseas duty ---------- */
await H.goEdit(w)
const od = await P.evaluate(() => (window.INPUTS || []).find(r => r && r.type === 'OD'))
if (od) {
  const odBtns = await P.evaluate(iid => [...document.querySelectorAll(`[data-acck="${iid}"]`)].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim()), od.iid)
  await H.centreOn(P, [`${scope} .sec-unav`])
  await H.pic(w, 'n5-1-schedule-overseas-duty', [`${scope} .sec-unav`], { pad: 6 })
  note('N5', 'desk', `the overseas duty (${od.person}, ${od.date}–${od.endDate || ''}) — the schedule offers it: ${JSON.stringify(odBtns)}`)
  if (odBtns.some(t => /reject|ground/i.test(t))) {
    const who = od.person
    const odBefore = await warNow(w, who, 'n5-2-war-od-filed')
    await H.goEdit(w)
    const r = await pressAcc(w, scope, 2, od.iid, 'x')
    const odAfter = await warNow(w, who, 'n5-3-war-od-rejected')
    judge('N5', r && odAfter.avail === odBefore.avail + 1, `Reject on the overseas duty pressed ${r}; Available P ${odBefore.avail} → ${odAfter.avail}`)
  }
} else note('N5', 'desk', 'no overseas duty in the demo world')
const state = await w.ctx.storageState()

/* ---------- N6 the phone ---------- */
const m = await H.phoneFrom(state); const Q = m.page
await L.signInPlain(m, 'admin')
const saber = await H.idOf(Q, 'Saber')
const pBefore = await warNow(m, saber, 'n6-0-phone-war-before')
const pc = await H.fileInput(m, { who: 'Saber', type: 'CSE', from: iso, remarks: 'Phone course', tag: 'n6', oil: 'no' })
const pFiled = await warNow(m, saber, 'n6-1-phone-war-filed')
await H.goEdit(m)
const pr = await pressAcc(m, scope, 2, pc.rec.iid, 'x')
await H.pic(m, 'n6-2-phone-schedule-after-reject', [`${scope} .sec-unav`, `${scope} .sec-inp`], { pad: 6 })
const pRej = await warNow(m, saber, 'n6-3-phone-war-after-reject')
judge('N6', pFiled.avail === pBefore.avail - 1 && pr && pRej.avail === pBefore.avail && !hasCse(pRej.cell),
  `Available P ${pBefore.avail} → filed ${pFiled.avail} → rejected ${pRej.avail}; Reject pressed ${pr}; Saber's cell ${JSON.stringify(pRej.cell)}`)

note('errors', 'both', JSON.stringify([...w.errs, ...m.errs].slice(0, 8)))
H.saveLog('n-log.json')
const bad = verdicts.filter(v => !v.ok)
console.log(bad.length ? `FAIL ${bad.map(v => v.id).join(', ')}` : `ALL ${verdicts.length} PASS`)
await H.closeBrowser()
