// PICTURES FOR HIS LOOK AT THE M3 BUILD (26 Oct 26) — each cut to what its question is about (D1222), at 2x for his phone:
//   Q1  the Leave War's day panel for Wed 15 Jul: before, with Comet's course filed (Available P one lower, Comet away on
//       CSE), and after a scheduler's Reject (the course gone from the schedule's Unavailable list — the war unchanged)
//   Q4  Ranger's own Other, moved → Unavail by a scheduler, opened by Ranger (a member): its Goes to row, still his to press
// Usage (from raptor-port/, the build served on 4180): node scripts/handpass/lw-m3b-look.mjs
process.env.LW_PORT ||= '4180'
process.env.LW_OUT ||= '2026-10-25-lw-m3-build/look'
const H = await import('./lw-m3b-w2-lib.mjs')
const { L, T, note } = H
const fs = await import('node:fs')
fs.mkdirSync(H.OUT, { recursive: true })
H.clearPrefix('look-')
console.log('lw-m3b-look →', H.OUT)
const w = await H.deskFrom(undefined, 2); const P = w.page
await L.signInPlain(w, 'admin')
const iso = '2026-07-15'
async function dayPanel(name) {
  await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(900)
  await H.warOpen(w, await H.idOf(P, 'Comet'), iso)
  const th = P.locator(`th.day[data-d="${iso}"]`).first()
  await th.scrollIntoViewIfNeeded(); await th.click(); await P.waitForTimeout(700)
  const words = await L.txt(P, T('win-lwday'))
  await H.pic(w, name, [T('win-lwday')], { pad: 4, scale: 'device' })
  await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  return words
}
/* ---------- Q1 ---------- */
note('q1-before', 'desk', await dayPanel('look-q1-1-before'))
const fc = await H.fileInput(w, { who: 'Comet', type: 'CSE', from: iso, remarks: 'Instructor course', tag: 'look-q1', oil: 'no' })
note('q1-filed', 'desk', await dayPanel('look-q1-2-course-filed'))
await H.goEdit(w)
const scope = '#eWeek section.day[data-day="2"]'
await H.centreOn(P, [`${scope} .sec-unav`])
await H.pic(w, 'look-q1-3-schedule-before-reject', [`${scope} .sec-unav`], { pad: 4, scale: 'device' })
const rej = P.locator(`${scope} [data-acc="x"][data-acck="${fc.rec.iid}"]`).first()
await rej.scrollIntoViewIfNeeded(); await rej.click(); await P.waitForTimeout(900)
await H.centreOn(P, [`${scope} .sec-unav`])
await H.pic(w, 'look-q1-4-schedule-after-reject', [`${scope} .sec-unav`], { pad: 4, scale: 'device' })
note('q1-rejected', 'desk', await dayPanel('look-q1-5-war-after-reject'))
/* ---------- Q4 ---------- */
const fo = await H.fileInput(w, { who: 'Ranger', type: 'Other', from: '2026-07-16', remarks: 'Squadron dinner prep', goes: 'g', tag: 'look-q4', oil: 'no' })
await H.goEdit(w)
const s3 = '#eWeek section.day[data-day="3"]'
const toU = P.locator(`${s3} [data-acc="u"][data-acck="${fo.rec.iid}"]`)
let moved = false
for (let i = 0; i < await toU.count(); i++) if (await toU.nth(i).isVisible()) { await toU.nth(i).scrollIntoViewIfNeeded(); await toU.nth(i).click(); await P.waitForTimeout(900); await H.answerAsks(w, 'look-q4-u', { oil: 'no' }); moved = true; break }
if (!moved) { const x = P.locator(`${s3} [data-acc="x"][data-acck="${fo.rec.iid}"]`).first(); if (await x.count()) { await x.click(); await P.waitForTimeout(700) } const tog = P.locator(`${s3} [data-pitog="3"]`).first(); const u2 = P.locator(`${s3} [data-acc="u"][data-acck="${fo.rec.iid}"]`).first(); if (!(await u2.isVisible().catch(() => false)) && await tog.count()) { await tog.scrollIntoViewIfNeeded(); await tog.click(); await P.waitForTimeout(500) } if (await u2.count()) { await u2.scrollIntoViewIfNeeded(); await u2.click(); await P.waitForTimeout(900); await H.answerAsks(w, 'look-q4-u2', { oil: 'no' }); moved = true } }
note('q4-moved', 'desk', `scheduler's → Unavail pressed ${moved}; stored acc ${(await H.inputById(P, fo.rec.iid))?.acc}`)
await H.centreOn(P, [`${s3} .sec-unav`])
await H.pic(w, 'look-q4-1-scheduler-filed-it-under-unavailable', [`${s3} .sec-unav`], { pad: 4, scale: 'device' })
const state = await w.ctx.storageState()
const m = await H.deskFrom(state, 2)
await L.signInPlain(m, 'member')
await H.openInputBy(m, fo.rec.iid, 'list')
const goes = await H.goesRead(m.page)
const live = await m.page.evaluate(() => [...document.querySelectorAll('[data-testid^="inpEdit-goes-"]')].map(b => `${b.textContent.trim()}:${b.disabled ? 'dead' : 'live'}:${b.getAttribute('aria-pressed')}`))
await H.pic(m, 'look-q4-2-ranger-opens-his-other', ['.inped-goes', T('inpEdit-goes-g')], { pad: 30, scale: 'device' })
note('q4-member', 'desk', `Goes to reads ${JSON.stringify(goes)}; buttons ${JSON.stringify(live)}`)
note('errors', 'desk', JSON.stringify([...w.errs, ...m.errs].slice(0, 6)))
H.saveLog('look-log.json')
await H.closeBrowser()
