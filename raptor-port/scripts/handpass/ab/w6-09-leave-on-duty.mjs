/* W6 — R32 as the brief words it: "a leave filed on a weekend day a man is on a named duty". Publish Sunday (its SDO
   desk 08:00–18:00, Warlock/spaceman on it), then file LL on Sunday for that man on the Inputs page. A LEAVE asks no OIL
   question (the OIL question is for a duty-&-commitments input — w6-02's R32); what it must do is take the leave and SAY
   the clash (N4, N16's note, N18: amber, long enough to read). Picture the note. Desktop and phone.
   Usage (from raptor-port/): node scripts/handpass/ab/w6-09-leave-on-duty.mjs */
process.env.AB_WHO = 'rewalk/w6'
const L = await import('./ab-lib.mjs')
const S = await import('./ab-sched.mjs')
const W4 = await import('./w4-lib.mjs')
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-absence-record-d147-af6a50/88ce3848-856b-4e60-84e4-7a09da4979d8/scratchpad/w6'
const R = L.resultBook('W6-leave-on-duty', `${L.ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w6-09-leave-on-duty.txt`)
for (const ph of [false, true]) {
  const tag = ph ? 'phone' : 'desktop'
  const o = await W4.openW4({ phone: ph, who: 'a', state: `${SCR}/world.json` })
  const page = o.page
  const sdo = await page.evaluate(() => window.DAYS[6].dutywaves[0].rows[0].id)
  const cs = await page.evaluate(id => window.PEOPLE[id].cs, sdo)
  const pub = await S.pubOnBoard(page, 6)
  await L.closeBoard(page)
  const f = await L.fileInput(page, { person: sdo, type: 'LL', from: '2026-07-19', span: 'all', remarks: 'W6 leave over Sunday duty' })
  const asked = f.asked
  const t = await page.evaluate(() => { const el = document.getElementById('toastEl'); if (!el) return null; const cs = getComputedStyle(el); return { text: (el.textContent || '').trim(), opacity: cs.opacity, bg: cs.backgroundColor, color: cs.color, cls: el.className } })
  await L.shot(page, `w6-${tag}-admin-R32-03-leave-over-sunday-duty-note`)
  await page.waitForTimeout(2800)
  const t2 = await page.evaluate(() => { const el = document.getElementById('toastEl'); return el ? { text: (el.textContent || '').trim(), opacity: getComputedStyle(el).opacity } : null })
  R.ck(`${tag}-leave-over-duty`, pub.p.pressed && f.added === 1 && !asked.includes('oil') && t && new RegExp(`${cs} is recorded as working 08:00–18:00 on 19 Jul`).test(t.text),
    `Sunday published with ${cs} on its SDO desk; a leave for him on Sunday is filed, asks no OIL question, and SAYS "${cs} is recorded as working 08:00–18:00 on 19 Jul — this LL is filed anyway and flagged…"`, { pub: pub.p, f, t })
  R.ck(`${tag}-note-holds`, t2 && t2.text === t.text && t2.opacity !== '0', 'the note is still up about three seconds later (N18: long enough to read)', t2)
  R.note(`${tag}-errors`, o.errors.slice(0, 5))
  await o.browser.close()
}
R.save()
