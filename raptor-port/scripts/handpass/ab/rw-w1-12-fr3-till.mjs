/* RE-WALK W1 — FR3 (26 Sep 26, the final code reads: Astra 3, Fable F1). A leave or a medical DRAGGED on the Inputs
   calendar rewrites its remark's date token — "till <last day>" / "on <day>" (D189's words) — to the NEW dates and
   keeps every other word the typist put round it; a remarks-only edit keeps whatever was typed (register §12, "A cut
   rewrites till … A re-dated input too"). Read where a person reads it: the Inputs page's Remarks column and the
   week's Unavailable row (Edit Schedule's working copy and View-only Sched), before and after the drag, after one Undo
   and one Redo. Written as the RIGHT behaviour (a FAIL is a finding).
   World: a fresh demo; four men with nothing on the demo week (Mon 13 – Sun 19 Jul, nothing published), made through
   the app's own controls only. The Inputs form's date picker writes "till <day>" into the Remarks box as the dates are
   picked; the person then types his own words beside it (the owner's example, 18 Aug 26: "till 13 Jul Bangkok").
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/rw-w1-12-fr3-till.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
const PH = W === 'phone'
process.env.AB_WHO = 'rewalk/w1'
const L = await import('./w1-lib.mjs')
const S = await import('./ab-sched.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { shot, resultBook, ROOT, toastSpy, toasts, calOpen, mouseDragChip, fingerDragChip, touchOn, chipDays, chipAt, addDialog, undoRedo, go, closeBoard } = L
const R = resultBook(`RW-W1-12-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w1-12-fr3-${W}.txt`)
const { browser, page, errors } = await openHi({ width: PH ? 390 : 1440, height: PH ? 844 : 900, who: 'a', dpr: PH ? 3 : 1 })
const cdp = PH ? await touchOn(page) : null
await toastSpy(page)
const cs = await page.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, p]) => [k, p.cs])))
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await shot(page, `rw-w1-12-${W}-THREW-${name}`).catch(() => {}) } }
const MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/* File through the Inputs page's own form: pick the dates on its calendar (the picker writes its "till …" into the
   Remarks box), READ what the box then says, and either type the person's words after it (`add`) or type the whole
   remark over it (`over`). Answers the certificate / OIL questions the way fileInput does. Returns the new input's id
   and what the picker had written. */
async function fileTyped(f) {
  await L.inputsView(page, 'list')
  const ids = await page.evaluate(() => window.INPUTS.map(x => x.iid))
  await page.waitForSelector('#inAdd')
  if (f.person && await page.locator('#inPerson').count()) await page.selectOption('#inPerson', f.person)
  await page.selectOption('#inType', f.type)
  const walkTo = async (iso) => {
    for (let i = 0; i < 36 && !(await page.locator(`#inCal [data-cal="${iso}"]`).count()); i++) {
      const [m, y] = (await page.locator('#inCal .rc-mon').first().textContent()).trim().split(/\s+/)
      const at = `${y}-${String(MONS.indexOf(m.slice(0, 3)) + 1).padStart(2, '0')}`
      await page.locator(`#inCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`).first().click()
      await page.waitForTimeout(80)
    }
    await page.locator(`#inCal [data-cal="${iso}"]`).first().click()
    await page.waitForTimeout(120)
  }
  await walkTo(f.from)
  if ((await page.locator('#inDates').textContent()).includes('→')) await walkTo(f.from)
  if (f.to && f.to !== f.from) await walkTo(f.to)
  if (await page.locator('#inSpan').count()) await page.locator('#inSpan [data-span="all"]').click()
  const picker = await page.locator('#inRemarks').inputValue()
  const box = page.locator('#inRemarks')
  if (f.over != null) await box.fill(f.over)
  else { await box.click(); await box.press('End'); await box.pressSequentially(f.add) }
  const typed = await box.inputValue()
  await page.locator('#inAdd').click()
  await page.waitForTimeout(700)
  const asked = []
  for (let i = 0; i < 3; i++) {
    const nodoc = page.locator('[data-testid="docconf-nodoc"]')
    if (await nodoc.count()) { asked.push('certificate'); await nodoc.click(); await page.waitForTimeout(500); continue }
    const conf = page.locator('[data-testid="oilconf"]')
    if (await conf.count() && await conf.isVisible()) {
      asked.push('oil')
      await conf.locator('button').filter({ hasText: /^No OIL/ }).first().click().catch(() => {})
      await conf.getByRole('button', { name: 'Save', exact: true }).click().catch(() => {})
      await page.waitForTimeout(600); continue
    }
    break
  }
  const fresh = await page.evaluate(ids => { const s = new Set(ids); return window.INPUTS.filter(x => !s.has(x.iid)).map(x => x.iid) }, ids)
  return { iid: fresh.length === 1 ? fresh[0] : null, picker, typed, asked }
}
/* what is stored (for the table only) */
const stored = iid => page.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return r ? { date: r.date, endDate: r.endDate || '', remarks: r.remarks } : null }, iid)
/* the Inputs page's own row for it, the Remarks cell read as the page prints it */
async function inputsRow(iid, from, to) {
  await L.inputsWindow(page, from, to)
  return page.evaluate(i => {
    const tr = [...document.querySelectorAll(`#inBody tr[data-iid="${i}"]`)].find(e => e.offsetWidth || e.offsetHeight)
    if (!tr) return { row: 'NO ROW' }
    tr.scrollIntoView({ block: 'center' })   // so the picture taken next shows the row
    const head = [...(tr.closest('table')?.querySelectorAll('thead th') || [])].map(th => (th.innerText || '').trim())
    const cells = [...tr.cells].map(td => { const inp = td.querySelector('input,textarea'); return ((inp ? inp.value : td.innerText) || '').replace(/\s+/g, ' ').trim() })
    const ri = head.findIndex(h => /remark/i.test(h))
    return { remarks: ri >= 0 ? cells[ri] : '(no Remarks head)', row: cells.join(' | ') }
  }, iid)
}
/* the week's Unavailable block on day di — each VISIBLE row's name column, person and remark, on the working copy
   (Edit Schedule) or View-only Sched */
async function unavRows(where, di) {
  await closeBoard(page)
  await go(page, where === 'face' ? 'viewsched' : 'editsched'); await page.waitForTimeout(400)
  return page.evaluate(([sel, di]) => {
    const days = [...document.querySelectorAll(`${sel} .day[data-day="${di}"]`)].filter(e => e.offsetWidth || e.offsetHeight)
    const d = days[0]
    if (!d) return 'NO DAY'
    const b = d.querySelector('.sec-unav')
    if (!b) return 'NO UNAVAILABLE BLOCK'
    if (b.querySelector('.pl-nil')) return 'Nil'
    return [...b.querySelectorAll('.pl-row')].map(r => {
      const rk = r.querySelector('.rmk'); const inp = rk && rk.querySelector('input,textarea')
      return `${((r.querySelector('.nm') || {}).innerText || '').trim()}:${(r.querySelector('[data-person]') || {}).dataset?.person || '?'}:${((inp ? inp.value : rk && rk.innerText) || '').replace(/\s+/g, ' ').trim()}`
    })
  }, [where === 'face' ? '#vWeek' : '#eWeek', di])
}
async function shotUnav(where, di, name) {
  const sel = `${where === 'face' ? '#vWeek' : '#eWeek'} .day[data-day="${di}"] .sec-unav`
  const at = page.locator(`${sel}:visible`).first()
  if (await at.count()) { await at.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250) }
  return shot(page, name)
}
const mine = (rows, P) => Array.isArray(rows) ? rows.filter(r => r.split(':')[1] === P) : []
async function drag(iid, from, to, mid) {
  await calOpen(page, '2026-07'); await toasts(page)
  const g = PH ? await fingerDragChip(page, cdp, iid, from, to, { mid }) : await mouseDragChip(page, iid, from, to, { mid })
  await page.waitForTimeout(300)
  const pops = await page.evaluate(() => [...document.querySelectorAll('[role="dialog"]')].filter(e => e.offsetWidth || e.offsetHeight).map(e => (e.getAttribute('aria-label') || e.id || '?') + ': ' + (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 160)))
  return { g, t: await toasts(page), days: await chipDays(page, iid), pops }
}

/* four different men, each with nothing on the days his scenario uses (no seat, desk, sim or ground row, no input
   that week) — chosen up front, before anything is filed */
const pick = async (dis, not) => (await S.freeMen(page, dis)).find(k => !not.includes(k))
const A = await pick([0, 1, 2, 3], [])
const B = await pick([2, 4], [A])
const C = await pick([1, 2, 3, 4], [A, B])
const D = await pick([0, 1], [A, B, C])
R.note('cast', { A: cs[A], B: cs[B], C: cs[C], D: cs[D] })
if (!A || !B || !C || !D) { R.ck('cast', false, 'four free men found', { A, B, C, D }); R.save(); await browser.close(); process.exit(0) }

/* ---- (1) a two-day LEAVE, "till" with the man's word AFTER it: Mon 13 – Tue 14 Jul → dragged to Wed 15 – Thu 16 ---- */
let lv
await step('LEAVE-till', async () => {
  lv = await fileTyped({ person: A, type: 'LL', from: '2026-07-13', to: '2026-07-14', add: ' Bali' })
  const s0 = await stored(lv.iid)
  R.ck('LEAVE-filed', !!lv.iid && s0.remarks === 'till 14 Jul Bali', 'the form: the picker writes "till 14 Jul", he adds "Bali" — stored "till 14 Jul Bali"', { lv, s0 })
  const row0 = await inputsRow(lv.iid, '2026-07-13', '2026-07-19')
  const u0 = mine(await unavRows('work', 0), A)
  R.note('LEAVE-before', { inputsRow: row0, unavMon: u0 })
  const d = await drag(lv.iid, '2026-07-13', '2026-07-15', `rw-w1-12-${W}-leave-in-flight`)
  await shot(page, `rw-w1-12-${W}-leave-cal-after`)
  const s1 = await stored(lv.iid)
  R.ck('LEAVE-moved', d.days.join() === '2026-07-15,2026-07-16', 'the leave slides two days: 15–16 Jul', d)
  R.ck('LEAVE-stored', s1.remarks === 'till 16 Jul Bali', 'its remark now reads "till 16 Jul Bali" — the token follows the dates, "Bali" kept', s1)
  const row1 = await inputsRow(lv.iid, '2026-07-13', '2026-07-19')
  await shot(page, `rw-w1-12-${W}-leave-inputs-row`)
  R.ck('LEAVE-inputs-page', /till 16 Jul Bali/.test(row1.remarks) && !/14 Jul/.test(row1.row), 'the Inputs page\'s Remarks column reads "till 16 Jul Bali" (no "14 Jul" anywhere on the row)', row1)
  const uw15 = mine(await unavRows('work', 2), A), uw16 = mine(await unavRows('work', 3), A), uw13 = mine(await unavRows('work', 0), A)
  await shotUnav('work', 2, `rw-w1-12-${W}-leave-unav-work-wed`)
  R.ck('LEAVE-unav-work', uw15.length === 1 && /till 16 Jul Bali/.test(uw15[0]) && uw16.length === 1 && /till 16 Jul Bali/.test(uw16[0]) && !uw13.length, 'Edit Schedule: his Unavailable row on Wed 15 and Thu 16 reads "till 16 Jul Bali"; Mon 13 no longer lists him', { uw13, uw15, uw16 })
  const uf15 = mine(await unavRows('face', 2), A)
  await shotUnav('face', 2, `rw-w1-12-${W}-leave-unav-view-wed`)
  R.ck('LEAVE-unav-view', uf15.length === 1 && /till 16 Jul Bali/.test(uf15[0]), 'View-only Sched (the day is not published): Wed 15 reads "till 16 Jul Bali"', uf15)
})

/* ---- (2) Undo and Redo carry the words with the dates ---- */
await step('LEAVE-undo-redo', async () => {
  const u = await undoRedo(page, 'undo', 'war')
  const su = await stored(lv.iid)
  const uwu = mine(await unavRows('work', 0), A)
  R.ck('LEAVE-undo', u.pressed && su.date === 'Jul 13' && su.remarks === 'till 14 Jul Bali' && uwu.length === 1 && /till 14 Jul Bali/.test(uwu[0]), 'one Undo: back on 13–14 Jul, the remark back to "till 14 Jul Bali" (Mon\'s Unavailable row too)', { u, su, uwu })
  const r = await undoRedo(page, 'redo', 'war')
  const sr = await stored(lv.iid)
  R.ck('LEAVE-redo', r.pressed && sr.date === 'Jul 15' && sr.remarks === 'till 16 Jul Bali', 'Redo: 15–16 Jul and "till 16 Jul Bali" again', { r, sr })
})

/* ---- (3) the control: a REMARKS-ONLY edit keeps whatever was typed, even a date that is not the input's ---- */
await step('LEAVE-remarks-only', async () => {
  await calOpen(page, '2026-07')
  const c = await chipAt(page, lv.iid, '2026-07-15')
  if (PH) await L.finger(page, cdp, c, null, { holdMs: 60 }); else { await page.mouse.click(c.x, c.y); await page.waitForTimeout(600) }
  const dlg = await addDialog(page)
  R.note('LEAVE-remarks-only-dialog', dlg)
  if (!dlg.open) { R.ck('LEAVE-remarks-only', false, 'the chip\'s edit opens', dlg); return }
  await page.locator('#inpEditRmk').fill('till 30 Jul Bali — back early')
  await shot(page, `rw-w1-12-${W}-leave-remarks-only-edit`)
  await page.locator('#inpEditSave').click(); await page.waitForTimeout(700)
  const s = await stored(lv.iid)
  R.ck('LEAVE-remarks-only', s.remarks === 'till 30 Jul Bali — back early' && s.date === 'Jul 15', 'a remarks-only edit keeps exactly what was typed ("till 30 Jul …" is his to write) — the dates did not change', s)
  /* and put it back the way it was, so the Inputs table is not left saying a date he did not mean */
  await undoRedo(page, 'undo', 'war')
  R.note('LEAVE-remarks-only-undone', await stored(lv.iid))
})

/* ---- (4) a one-day LEAVE whose remark carries "on <day>" with the man's word BEFORE it: Wed 15 → Fri 17 ---- */
await step('LEAVE-on', async () => {
  const f = await fileTyped({ person: B, type: 'LL', from: '2026-07-15', over: 'Dentist on 15 Jul' })
  const s0 = await stored(f.iid)
  R.note('ON-filed', { f, s0 })
  const d = await drag(f.iid, '2026-07-15', '2026-07-17', `rw-w1-12-${W}-on-in-flight`)
  const s1 = await stored(f.iid)
  R.ck('ON-moved', d.days.join() === '2026-07-17', 'the one-day leave lands on Fri 17 Jul', d)
  R.ck('ON-stored', s1.remarks === 'Dentist on 17 Jul', 'its remark reads "Dentist on 17 Jul" — the "on" word kept, the day moved, "Dentist" kept', s1)
  const row = await inputsRow(f.iid, '2026-07-13', '2026-07-19')
  await shot(page, `rw-w1-12-${W}-on-inputs-row`)
  R.ck('ON-inputs-page', /Dentist on 17 Jul/.test(row.remarks), 'the Inputs page\'s Remarks column reads "Dentist on 17 Jul"', row)
  const u = mine(await unavRows('work', 4), B)
  await shotUnav('work', 4, `rw-w1-12-${W}-on-unav-work-fri`)
  R.ck('ON-unav', u.length === 1 && /Dentist on 17 Jul/.test(u[0]), 'Edit Schedule: Fri 17\'s Unavailable row reads "Dentist on 17 Jul"', u)
})

/* ---- (5) a MEDICAL (OML), two days, "till" with a word after: Tue 14 – Wed 15 → Thu 16 – Fri 17 ---- */
await step('MED-till', async () => {
  const f = await fileTyped({ person: C, type: 'OML', from: '2026-07-14', to: '2026-07-15', add: ' fever' })
  const s0 = await stored(f.iid)
  R.note('MED-filed', { f, s0 })
  const d = await drag(f.iid, '2026-07-14', '2026-07-16', `rw-w1-12-${W}-med-in-flight`)
  await shot(page, `rw-w1-12-${W}-med-cal-after`)
  const s1 = await stored(f.iid)
  R.ck('MED-moved', d.days.join() === '2026-07-16,2026-07-17' && !d.pops.length, 'the medical slides to 16–17 Jul (no other medical in the way, so nothing to ask)', d)
  R.ck('MED-stored', s1.remarks === 'till 17 Jul fever', 'its remark reads "till 17 Jul fever"', s1)
  const row = await inputsRow(f.iid, '2026-07-13', '2026-07-19')
  await shot(page, `rw-w1-12-${W}-med-inputs-row`)
  R.ck('MED-inputs-page', /till 17 Jul fever/.test(row.remarks) && !/15 Jul/.test(row.row), 'the Inputs page\'s Remarks column reads "till 17 Jul fever"', row)
  const u = mine(await unavRows('work', 3), C), uf = mine(await unavRows('face', 4), C)
  await shotUnav('face', 4, `rw-w1-12-${W}-med-unav-view-fri`)
  R.ck('MED-unav', u.length === 1 && /till 17 Jul fever/.test(u[0]) && uf.length === 1 && /till 17 Jul fever/.test(uf[0]), 'the week\'s Unavailable row (Thu 16, Edit Schedule; Fri 17, View-only Sched) reads "till 17 Jul fever"', { u, uf })
})

/* ---- (6) a leave with NO date token in its remark: the drag adds none (the typist's words only) ---- */
await step('LEAVE-no-token', async () => {
  const f = await fileTyped({ person: D, type: 'LL', from: '2026-07-13', over: 'Wedding' })
  const d = await drag(f.iid, '2026-07-13', '2026-07-14')
  const s1 = await stored(f.iid)
  R.ck('NOTOKEN', d.days.join() === '2026-07-14' && s1.remarks === 'Wedding', 'a remark with no "till / on" stays exactly "Wedding" after the drag', { d: d.days, s1 })
})

R.note('toasts-left', await toasts(page))
R.ck('console-errors', !errors.length, 'no console / page errors / 4xx', errors.slice(0, 20))
R.save()
await browser.close()
