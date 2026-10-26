// THE WALK OF [LW-LOAD-RELAND-RID] — 26 Oct 26, on claude/lw-load-reland-rid (pull request 573).
// Every step is an assertion of the RIGHT behaviour (a PASS is correct), so a re-run on a fixed build is the re-walk.
//   R1  desk: the seed's three-day overseas duty (Pike, Wed 15 – Fri 17 Jul). Wednesday published, then Reject and → Ground
//       on Edit Schedule's week: its one row carries the request's own name; the day head reads 1 pending; the Scheduler
//       Board's "Load onto working copy" of the Original arms as "Discard 1 edit" (it read "Discard 2 edits"); confirmed,
//       the duty is back under Unavailable, nothing pending, and the note says so
//   R2  phone: a two-day course (Mon 13 – Tue 14 Jul) filed before Monday is published; Reject and → Ground on the phone's
//       Scheduler Board: 1 pending; the load of the Original finds nothing to throw away — the note says Monday is already
//       at the Original and that the input moved onto the programme since publishing stays there, pending (never "filed
//       since publishing"); a picture right after the tap (D1281); its row stays, under its name
// Usage (from raptor-port/, the build served on 4181): node scripts/handpass/lw-reland-walk.mjs
process.env.LW_PORT ||= '4181'
process.env.LW_OUT ||= '2026-10-26-lw-load-reland-rid'
process.env.HP_URL ||= 'http://localhost:4181'
const H = await import('./lw-m3b-w2-lib.mjs')
const { L, note } = H
const CD = await import('./cd-lib.mjs')
const LIB = await import('./lib.mjs')
const fs = await import('node:fs')
fs.mkdirSync(H.OUT, { recursive: true })
H.clearPrefix('r')
console.log('lw-reland-walk →', H.OUT)
const results = []
const rec = (id, size, ok, said) => { results.push({ id, size, verdict: ok ? 'PASS' : 'FAIL', said }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id} [${size}] ${said}`) }

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
const rowsOf = (P, iid) => P.evaluate(iid => (window.DAYS || []).flatMap((d, j) => (d.ground || []).filter(g => g && g.src === iid).map(g => ({ day: j, rid: g.rid, kept: !!g.kept }))), iid)
const pendOf = P => P.evaluate(() => { const c = document.querySelector('#schedBoard .dpend:not(.dnew):not(.dchg)'); return c && c.offsetParent ? (c.innerText || '').replace(/\s+/g, ' ').trim() : '' })
async function previewOriginal(P, di, iso) {
  await P.locator(`[data-planmenu="${di}"]:visible`).first().click(); await P.waitForTimeout(700)
  await P.locator(`[data-planpv^="${iso}#"]:visible`).first().click(); await P.waitForTimeout(1300)
}
/* the board on day `di` through its own day chips (the week on screen may not show that day's own door) */
async function boardOn(P, di) {
  await LIB.board(P, 0)
  if (di === 0) return
  await P.locator(`#sbDays .sbday[data-sbtab="${di}"]:visible`).first().click(); await P.waitForTimeout(900)
}
const loadBtnText = P => P.evaluate(() => [...document.querySelectorAll('#schedBoard [data-restore]')].filter(b => b.offsetParent).map(b => (b.innerText || '').replace(/\s+/g, ' ').trim()).join(' | '))

const w = await H.deskFrom(undefined, 2); const P = w.page
await L.signInPlain(w, 'admin')
note('bundle', 'desk', await H.bundleName(P))

/* ---------- R2's course is filed first, before Monday goes out ---------- */
const who2 = await P.evaluate(() => {
  const busy = new Set((window.INPUTS || []).filter(i => ['Jul 13', 'Jul 14'].includes(i.date) || ['Jul 13', 'Jul 14'].includes(i.endDate)).flatMap(i => [i.person, ...((i.people || []).map(x => x.p))]))
  return Object.entries(window.PEOPLE || {}).find(([id, p]) => !p.special && !p.archived && !p.deleted && !p.pers && !busy.has(id))?.[1]?.cs
})
const o2 = await H.fileInput(w, { who: who2, type: 'CSE', from: '2026-07-13', to: '2026-07-14', remarks: 'Weapons course', tag: 'r2-file', oil: 'no' })
const c2 = await H.inputById(P, o2.rec.iid)
note('r2-filed', 'desk', `${who2}'s course ${JSON.stringify({ date: c2?.date, endDate: c2?.endDate, acc: c2?.acc })}`)
await LIB.board(P, 0)
note('r2-published', 'desk', JSON.stringify(await CD.signAndPublish(P, 0)))
await LIB.closeBoard(P).catch(() => {})

/* ---------- R1 — the seed's three-day overseas duty, desk ---------- */
const odId = await P.evaluate(() => (window.INPUTS || []).find(i => i.type === 'OD' && i.person === 'pike')?.iid)
await boardOn(P, 2)
note('r1-published', 'desk', JSON.stringify(await CD.signAndPublish(P, 2)))
await LIB.closeBoard(P).catch(() => {})
await H.goEdit(w)
const s2 = H.dayScope('editsched', 2)
const moved1 = (await pressAcc(w, s2, 2, odId, 'x')) && (await pressAcc(w, s2, 2, odId, 'g'))
const r1 = await H.inputById(P, odId), rows1 = await rowsOf(P, odId)
await H.centreOn(P, [`${s2} .sec-ground, ${s2} [class*="ground"]`]).catch(() => {})
await P.screenshot({ path: `${H.OUT}/r1-on-the-ground-programme.png` })
rec('R1-moved', 'desk', moved1 && r1?.acc === 'g' && r1?.odGround === true && rows1.length === 1 && rows1[0].rid === 'r' + odId,
  `Reject then → Ground: ${moved1}; stored ${JSON.stringify({ acc: r1?.acc, odGround: r1?.odGround })}; its rows ${JSON.stringify(rows1)}`)
await boardOn(P, 2)
const pend1 = await pendOf(P)
await previewOriginal(P, 2, '2026-07-15')
const before1 = await loadBtnText(P)
await P.locator('#schedBoard [data-restore]:visible').first().click(); await P.waitForTimeout(900)
const armed1 = await loadBtnText(P)
await H.pic(w, 'r1-load-arms-discard-1-edit', ['#schedBoard [data-restore]'], { pad: 40, scale: 'device' }).catch(async () => { await P.screenshot({ path: `${H.OUT}/r1-load-arms-discard-1-edit.png` }) })
rec('R1-count', 'desk', /1 pending/.test(pend1) && /Discard 1 edit\b/.test(armed1),
  `day head "${pend1}"; the button "${before1}", pressed once it reads "${armed1}"`)
await P.locator('#schedBoard [data-restore]:visible').first().click(); await P.waitForTimeout(600)
const note1 = await said(P)
await P.screenshot({ path: `${H.OUT}/r1-after-the-load.png` })
await P.waitForTimeout(1000)
const pend1b = await pendOf(P), r1b = await H.inputById(P, odId), rows1b = await rowsOf(P, odId)
const unav1 = await P.evaluate(() => { const b = document.querySelector('#schedBoard [data-inpadd="2.u"]'); const s = b && b.closest('.sb-sec'); if (s) s.scrollIntoView({ block: 'center' }); return s ? (s.innerText || '').replace(/\s+/g, ' ') : '' })
const odUnav1 = await P.evaluate(id => { const b = document.querySelector('#schedBoard [data-inpadd="2.u"]'); const s = b && b.closest('.sb-sec'); return !!(s && s.querySelector(`[data-acck="${id}"]`)) }, odId)
await P.waitForTimeout(400)
await H.pic(w, 'r1-pike-back-under-unavailable', ['#schedBoard [data-inpadd="2.u"]'], { pad: 220, scale: 'device' }).catch(() => {})
rec('R1-loaded', 'desk', !/pending/.test(pend1b) && !r1b?.acc && !r1b?.odGround && rows1b.length === 0 && odUnav1,
  `after the load: head "${pend1b}"; stored ${JSON.stringify({ acc: r1b?.acc, odGround: r1b?.odGround })}; rows ${JSON.stringify(rows1b)}; his overseas duty listed under Unavailable (its Reject there): ${odUnav1}; the note: "${note1}"`)
await LIB.closeBoard(P).catch(() => {})
note('errors-desk', 'desk', JSON.stringify(w.errs.slice(0, 8)))

/* ---------- R2 — the course, on a phone ---------- */
const st = await w.ctx.storageState()
const m = await H.phoneFrom(st); const Q = m.page
await L.signInPlain(m, 'admin')
await LIB.board(Q, 0)
const moved2 = (await pressAcc(m, '#schedBoard', 0, o2.rec.iid, 'x')) && (await pressAcc(m, '#schedBoard', 0, o2.rec.iid, 'g'))
const r2 = await H.inputById(Q, o2.rec.iid), rows2 = await rowsOf(Q, o2.rec.iid)
await Q.screenshot({ path: `${H.OUT}/r2-phone-on-the-ground-programme.png` })
rec('R2-moved', 'phone', moved2 && r2?.acc === 'g' && rows2.length === 1 && rows2[0].rid === 'r' + o2.rec.iid,
  `Reject then → Ground on the phone's board: ${moved2}; stored acc ${r2?.acc}; its rows ${JSON.stringify(rows2)}`)
const pend2 = await pendOf(Q)
await previewOriginal(Q, 0, '2026-07-13')
const before2 = await loadBtnText(Q)
const btn = Q.locator('#schedBoard [data-restore]:visible').first()
await btn.scrollIntoViewIfNeeded().catch(() => {})
const bb = await btn.boundingBox()
await Q.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2)   // a press at a point, the pointer left there (D1281)
await Q.waitForTimeout(80)
await Q.screenshot({ path: `${H.OUT}/r2-phone-right-after-the-tap.png` })
const note2 = await said(Q)
await Q.waitForTimeout(1200)
await Q.screenshot({ path: `${H.OUT}/r2-phone-settled.png` })
const pend2b = await pendOf(Q), rows2b = await rowsOf(Q, o2.rec.iid)
rec('R2-load', 'phone', /1 pending/.test(pend2) && !/Discard/.test(before2) && /already at the Original/.test(note2)
  && /1 input moved onto the programme since publishing stays there, pending/.test(note2) && !/filed since publishing/.test(note2)
  && /1 pending/.test(pend2b) && rows2b.length === 1 && rows2b[0].rid === rows2[0].rid,
  `day head "${pend2}" → "${pend2b}"; the button "${before2}"; the note "${note2}"; rows after ${JSON.stringify(rows2b)}`)
note('errors-phone', 'phone', JSON.stringify(m.errs.slice(0, 8)))

fs.writeFileSync(`${H.OUT}/walk-results.json`, JSON.stringify({ results, log: H.log }, null, 1))
console.log(`\n${results.filter(r => r.verdict === 'PASS').length} PASS, ${results.filter(r => r.verdict === 'FAIL').length} FAIL`)
await H.closeBrowser()
