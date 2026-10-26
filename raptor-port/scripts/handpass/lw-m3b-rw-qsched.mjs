// THE WALK OF THE CODE READ'S Q3 FIX, AND THE PICTURES FOR Q1 (the M3 build's FULL check, 25-26 Oct 26), desktop 1536 x 864,
// admin, the built bundle on 4180:
//   Q3  the Scheduler Board's Unavailable "+ Add" offers a course, an Attach and an Other (and no Training); an Other opened
//       there has "Goes to" on Unavailable; a course added there stands on the board's Unavailable list
//   Q1  (a question for him, pictured) a course filed on the Inputs page, then Rejected by a scheduler: it leaves the
//       schedule's Unavailable list, yet the Leave War still counts him out (Available P before / filed / rejected)
// Usage (from raptor-port/): node scripts/handpass/lw-m3b-rw-qsched.mjs
process.env.LW_PORT ||= '4180'
process.env.LW_OUT ||= '2026-10-25-lw-m3-build/rewalk-q'
const H = await import('./lw-m3b-w2-lib.mjs')
const lib = await import('./lib.mjs')
const { L, T, note } = H
H.clearPrefix('qs-')
console.log('lw-m3b-rw-qsched →', H.OUT)
const verdicts = []
const judge = (id, ok, said) => { verdicts.push({ id, ok }); note(id, ok ? 'PASS' : 'FAIL', said) }
const w = await H.deskCtx(); const P = w.page
await L.signInPlain(w, 'admin')
note('bundle', 'desk', await H.bundleName(P))
const opts = () => P.evaluate(() => [...document.querySelectorAll('#inpEditType option')].map(o => o.value))

/* ---------- Q3 ---------- */
await lib.board(P, 1); await P.waitForTimeout(700)
const add = P.locator('#schedBoard .unav .sb-addinp:visible').first()
await add.scrollIntoViewIfNeeded(); await add.click(); await P.waitForTimeout(700)
const o = await opts()
await P.locator('#inpEditType').selectOption('Other'); await P.waitForTimeout(400)
const goesU = await P.locator(T('inpEdit-goes-u')).getAttribute('aria-pressed').catch(() => null)
await H.winTop(P); await H.pic(w, 'qs-q3-1-unav-add-other', [H.WIN], { pad: 6 })
await P.locator('#inpEditType').selectOption('CSE'); await P.waitForTimeout(400)
await P.locator('#inpEditRmk').fill('Weapons course')
await H.pic(w, 'qs-q3-2-unav-add-course', [H.WIN], { pad: 6 })
await P.locator('#inpEditSave').click(); await P.waitForTimeout(1000)
await H.answerAsks(w, 'qs-q3', { oil: 'no' })
/* the remark stands in the row's own box — a box's words are its value, not the page's text */
const onUnav = await P.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.unav')].some(s => s.innerText.includes('Weapons course') || [...s.querySelectorAll('input, textarea')].some(i => i.value === 'Weapons course')))
await P.locator('#schedBoard .sb-panel.unav').first().scrollIntoViewIfNeeded().catch(() => {})
await H.pic(w, 'qs-q3-3-board-unav', ['#schedBoard .sb-panel.unav'], { pad: 6 })
judge('Q3', ['CSE', 'Attach', 'Other'].every(t => o.includes(t)) && !o.includes('Training') && goesU === 'true' && onUnav,
  `kinds offered ${JSON.stringify(o)}; an Other's Goes to Unavailable pressed ${goesU}; the course on the board's Unavailable list ${onUnav}`)
await lib.closeBoard(P).catch(() => {})

/* ---------- Q1 (pictures for his question) ---------- */
const comet = await H.idOf(P, 'Comet')
const iso = '2026-07-15'
await H.warOpen(w, comet, iso); const before = await H.availP(P, iso)
async function warNow(name) { await H.warOpen(w, comet, iso); const a = await H.availP(P, iso); await H.warStrips(w, name, comet, [iso]); return { cell: await H.cellBoxes(w, comet, iso), avail: a } }
const fc = await H.fileInput(w, { who: 'Comet', type: 'CSE', from: iso, remarks: 'Instructor course', tag: 'qs-q1', oil: 'no' })
const filed = await warNow('qs-q1-1-war-course-filed')
/* Reject on Edit Schedule (Wednesday, day 2) — the scheduler's own button */
await H.goEdit(w)
const scope = '#eWeek section.day[data-day="2"]'
let rejected = false
for (const sel of [`${scope} [data-acc="x"][data-acck="${fc.rec.iid}"]`]) {
  const n = await P.locator(sel).count()
  for (let i = 0; i < n; i++) { const b = P.locator(sel).nth(i); if (await b.isVisible()) { await b.scrollIntoViewIfNeeded(); await H.pic(w, 'qs-q1-2-schedule-before-reject', [`${scope} .sec-unav`], { pad: 6 }); await b.click(); await P.waitForTimeout(900); rejected = true; break } }
}
await H.pic(w, 'qs-q1-3-schedule-after-reject', [`${scope} .sec-unav`, `${scope} .sec-inp`], { pad: 6 })
const acc = (await H.inputById(P, fc.rec.iid))?.acc
const after = await warNow('qs-q1-4-war-after-reject')
note('Q1', 'desk', `Available P ${before} → filed ${filed.avail} → rejected ${after.avail}; Comet's cell filed ${JSON.stringify(filed.cell)} rejected ${JSON.stringify(after.cell)}; Reject pressed ${rejected}, stored acc ${acc}`)
note('errors', 'desk', JSON.stringify(w.errs.slice(0, 6)))
H.saveLog('qs-log.json')
const bad = verdicts.filter(v => !v.ok)
console.log(bad.length ? `FAIL ${bad.map(v => v.id).join(', ')}` : `ALL ${verdicts.length} PASS`)
await H.closeBrowser()
