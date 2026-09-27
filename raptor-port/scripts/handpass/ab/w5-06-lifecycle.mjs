/* W5 — the LIFECYCLE boundaries after the orders (Fable S14; Astra 11, 12, 14). Assertions of the RIGHT behaviour; what
   Undo does across a sign-out is RECORDED only (D148 — undo reverses only your own changes — is decided, not built).
     (a) switch war with a sheet OPEN: no control of the old sheet can write into the new war (the picker is covered, or the
         sheet closes / goes inert) — Matrix.tsx; the switch and back loses nothing;
     (b) undo after switching: a bid placed in JAN–DEC 27, switch back to 26, Undo — it undoes the 27 bid, touching nothing
         in 26 (Astra 11: undo addresses the original war);
     (c) a leave across the two wars (30 Dec 26 – 2 Jan 27): shows in both, charged once per day (absences.ts inputDates);
     (d) change the schedule WEEK with a multi-day leave across the week boundary (Fri 17 – Tue 21 Jul): one record on both
         weeks, nothing lost or doubled by navigating; undo / redo / reload (Astra 12);
     (e) sign out and in as the other person: what Undo offers him (RECORD);
     (f) PHONE ↔ DESKTOP with a sheet or confirm window OPEN (Astra 14): the sheet stays reachable, nothing painted over, the
         figures unchanged.
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w5-06-lifecycle.mjs */
process.env.AB_WHO = 'w5'
const L = await import('./ab-lib.mjs')
const X = await import('./w5-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { relogin } = await import('../am/w4-lib.mjs')
const { lwOpen, tapCell, sheetPress, closeSheets, sheetNow, fileInput, inputsOf, shot, toastSpy, toasts, resultBook, ROOT, lwShot, rowRun, bidOn, go, readUnav } = L
const { undo, redo, reload, snap, changeWeek, weekNow } = X
const R = resultBook('W5-06', `${ROOT}/docs/handpass/parts/2026-09-26-absence-w5-06.txt`)
const { browser, page, errors } = await openHi({ width: 1440, height: 900, who: 'a', dpr: 1 })
await toastSpy(page)
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await shot(page, `w5-06-THREW-${name}`).catch(() => {}) } }
const pic = n => `w5-06-${n}`
const P = 'bane'
const warNow = () => page.evaluate(() => { const s = document.querySelector('[data-testid="war-picker"]'); return s ? s.options[s.selectedIndex].text : '?' })
const warIds = () => page.evaluate(() => { const s = document.querySelector('[data-testid="war-picker"]'); return s ? [...s.options].map(o => ({ v: o.value, t: o.text })) : [] })
async function pickWar(re) {
  const ids = await warIds(); const w = ids.find(o => re.test(o.t))
  if (!w) return { switched: false, why: 'no war ' + re }
  await page.locator('[data-testid="war-picker"]').selectOption(w.v); await page.waitForTimeout(900)
  return { switched: true, to: w.t }
}

/* (a) switch war with the bid sheet open */
await step('a-switch-with-sheet-open', async () => {
  await lwOpen(page, '2026-12-28')
  const t = await tapCell(page, P, '2026-12-28')
  await shot(page, pic('a1-sheet-open-dec26'))
  /* can a person reach the picker while the sheet is open? what sits on the picker's pixels */
  const cover = await page.evaluate(() => { const s = document.querySelector('[data-testid="war-picker"]'); if (!s) return 'no picker'; const b = s.getBoundingClientRect(); const h = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return h === s || s.contains(h) ? 'the picker itself' : `${h ? h.tagName + '.' + String(h.className).slice(0, 30) + '[' + (h.getAttribute('data-testid') || '') + ']' : 'nothing'}` })
  let how = 'mouse on the picker'
  if (cover === 'the picker itself') { const b = await page.locator('[data-testid="war-picker"]').boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(300); await page.keyboard.press('Escape') }
  else how = 'covered by ' + cover
  /* the keyboard: Tab from the sheet toward the picker (a person without a mouse) */
  const sheetAfterTry = await sheetNow(page)
  R.note('a-picker-reachable', { sheet: t.open, cover, how, sheetStill: sheetAfterTry.open })
  /* switch the way the app allows (the select itself), with the sheet still in the page */
  const sw = await pickWar(/27/)
  const s2 = await sheetNow(page)
  await shot(page, pic('a2-after-switch-to-27'))
  let wrote = null
  if (s2.open === 'bid-picker') { const r = await sheetPress(page, 'bid-LL'); wrote = r; R.note('a-stale-sheet-after-press', { text: (r.sheet && r.sheet.text || '').slice(-220) }); await shot(page, pic('a3-stale-sheet-press')); await closeSheets(page) }
  const war27 = await warNow()
  const back = await pickWar(/26/)
  await lwOpen(page, '2026-12-28')
  const r26 = await rowRun(page, P, ['2026-12-28'])
  const ins = (await inputsOf(page, P)).length
  R.ck('a-no-stale-write', cover !== 'the picker itself' || s2.open === 'nothing' || !(wrote && wrote.pressed && wrote.sheet && wrote.sheet.open === 'nothing'),
    'with a sheet open the picker is covered, or the switch closes the sheet, or a stale sheet cannot write', { cover, afterSwitch: s2.open, wrote: wrote && { pressed: wrote.pressed, after: wrote.sheet && wrote.sheet.open }, war27, back, row26: r26, inputs: ins })
})

/* (b) undo after switching wars */
await step('b-undo-after-switch', async () => {
  await pickWar(/27/)
  await lwOpen(page, '2027-01-11')
  const b = await bidOn(page, P, '2027-01-11', 'LL')
  const r27 = await rowRun(page, P, ['2027-01-11'])
  await pickWar(/26/)
  await lwOpen(page, '2026-12-28')
  const r26a = await rowRun(page, P, ['2026-12-28'])
  const u = await undo(page)
  const warAfter = await warNow()
  await shot(page, pic('b1-after-undo-from-26'))
  await pickWar(/27/); await lwOpen(page, '2027-01-11')
  const r27b = await rowRun(page, P, ['2027-01-11'])
  await pickWar(/26/); await lwOpen(page, '2026-12-28')
  const r26b = await rowRun(page, P, ['2026-12-28'])
  R.ck('b-undo-original-war', b.placed && /LL/.test(r27[0]) && u.pressed && /27/.test(warAfter) && !/LL/.test(r27b[0]) && r26a[0] === r26b[0],
    'Undo pressed while looking at 26 takes the war to 27 and takes back the 27 bid there, touching nothing in 26', { bid: b.placed, undo: u, warShownAfterUndo: warAfter, r27: [r27, r27b], r26: [r26a, r26b] })
  const r = await redo(page)
  await lwOpen(page, '2027-01-11')
  R.note('b-redo', { redo: r, r27: await rowRun(page, P, ['2027-01-11']), war: await warNow() })
  await pickWar(/26/)
})

/* (c) a leave across the two wars */
await step('c-leave-across-wars', async () => {
  await lwOpen(page, '2026-12-28')
  const f0 = (await snap(page, P, ['2026-12-30'])).figs
  const f = await fileInput(page, { person: P, type: 'LL', from: '2026-12-30', to: '2027-01-02', remarks: 'W5 across the new year' })
  await lwOpen(page, '2026-12-28')
  const s26 = await snap(page, P, ['2026-12-30', '2026-12-31'])
  await lwShot(page, pic('c1-dec26-side'), P, '2026-12-31')
  await pickWar(/27/); await lwOpen(page, '2027-01-01')
  const s27 = await snap(page, P, ['2027-01-01', '2027-01-02'])
  await lwShot(page, pic('c2-jan27-side'), P, '2027-01-01')
  await pickWar(/26/)
  R.ck('c-both-wars', f.added === 1 && s26.run.every(x => /LL/.test(x)) && s27.run.every(x => /LL/.test(x)), 'the one leave shows on 30–31 Dec in the 26 war and 1–2 Jan in the 27 war', { run26: s26.run, run27: s27.run })
  R.note('c-money', { before: f0 && { lve: f0.lve, lvetot: f0.lvetot }, war26: s26.figs && { lve: s26.figs.lve, lvetot: s26.figs.lvetot }, war27: s27.figs && { lve: s27.figs.lve, lvetot: s27.figs.lvetot }, note: '30 Dec (Wed), 31 Dec (Thu) are weekdays in 26; 1 Jan (Fri), 2 Jan (Sat) in 27' })
})

/* (d) change the schedule week with a multi-day leave across the week boundary */
let dMan
await step('d-week-boundary', async () => {
  dMan = 'bapster'
  const f = await fileInput(page, { person: dMan, type: 'LL', from: '2026-07-17', to: '2026-07-21', remarks: 'W5 across the week' })
  await go(page, 'editsched')
  const w0 = await weekNow(page)
  const read = async () => ({ fri: await readUnav(page, '#eWeek .day[data-day="4"]'), sat: await readUnav(page, '#eWeek .day[data-day="5"]'), sun: await readUnav(page, '#eWeek .day[data-day="6"]'), mon: await readUnav(page, '#eWeek .day[data-day="0"]'), tue: await readUnav(page, '#eWeek .day[data-day="1"]') })
  const has = (u) => Array.isArray(u) && u.some(r => r.endsWith(':' + dMan))
  const r0 = await read()
  const cw = await changeWeek(page, '2026-07-20')
  const w1 = await weekNow(page)
  const r1 = await read()
  await shot(page, pic('d1-next-week'))
  const back = await changeWeek(page, '2026-07-13')
  const w2 = await weekNow(page)
  const r2 = await read()
  const ins = (await inputsOf(page, dMan)).filter(x => /LL/.test(x.type))
  R.ck('d-one-record-both-weeks', f.added === 1 && has(r0.fri) && has(r0.sat) && has(r0.sun) && has(r1.mon) && has(r1.tue) && has(r2.fri) && ins.length === 1,
    'LL Fri 17 – Tue 21 Jul: Unavailable on Fri/Sat/Sun of this week and Mon/Tue of the next; back again, the same; still ONE input', { weeks: [w0, w1, w2], how: [cw, back], thisWeek: r0, nextWeek: { mon: r1.mon, tue: r1.tue }, backAgain: r2.fri, inputs: ins })
  const u = await undo(page)
  const ru = await read()
  const cw2 = await changeWeek(page, '2026-07-20'); const ru2 = await read(); await changeWeek(page, '2026-07-13')
  R.ck('d-undo', u.pressed && !has(ru.fri) && !has(ru2.mon), 'Undo takes the leave off both weeks', { undo: u, fri: ru.fri, nextMon: ru2.mon })
  const r = await redo(page)
  const rr = await read()
  const rl = await reload(page, 'a')
  await go(page, 'editsched')
  const wl = await weekNow(page)
  const rlr = await read()
  R.ck('d-redo-reload', r.pressed && has(rr.fri) && has(rlr.fri), 'Redo puts it back; a reload keeps it', { redo: r, week: wl, fri: rlr.fri, ins: (await inputsOf(page, dMan)).filter(x => /LL/.test(x.type)).length })
})

/* (e) sign out, sign in as the other person: what Undo does */
await step('e-undo-across-sign-out', async () => {
  const f = await fileInput(page, { person: P, type: 'LL', from: '2026-08-24', remarks: 'W5 admin filed, then signed out' })
  await relogin(page, 'm'); await toastSpy(page)
  await lwOpen(page, '2026-08-24')
  const b = await page.locator('[data-testid="lw-undo"]').first()
  const state = { title: await b.getAttribute('title'), disabled: await b.isDisabled() }
  let u = null
  if (!state.disabled) u = await undo(page)
  const ins = (await inputsOf(page, P)).filter(x => /Aug 24/.test(x.date))
  await lwShot(page, pic('e1-member-after-admin-filing'), P, '2026-08-24')
  R.note('e-member-undo-RECORD (D148 not built)', { filedByAdmin: f.added, memberUndoButton: state, pressed: u, adminFilingStillThere: ins.length === 1 })
  await relogin(page, 'a'); await toastSpy(page)
  await lwOpen(page, '2026-08-24')
  const b2 = page.locator('[data-testid="lw-undo"]').first()
  R.note('e-admin-back-undo-RECORD', { title: await b2.getAttribute('title'), disabled: await b2.isDisabled() })
})

/* (f) phone ↔ desktop with a sheet / confirm OPEN */
await step('f-resize-with-sheet-open', async () => {
  const D = '2026-08-03'
  const fa = await fileInput(page, { person: P, type: 'LL', from: D, span: 'am', remarks: 'W5 morning' })
  const fb = await bidOn(page, P, D, 'LL', { portion: 'pm' })
  R.note('f-setup', { filed: fa.added, bid: fb })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(900)
  await lwOpen(page, D)
  const f0 = await snap(page, P, [D])
  const t = await tapCell(page, P, D)
  const box = () => page.evaluate(() => { const s = [...document.querySelectorAll('.bidsheet[role="dialog"]')].filter(e => e.offsetWidth)[0]; if (!s) return null; const b = s.getBoundingClientRect(); const btns = [...s.querySelectorAll('button')].filter(x => x.offsetWidth).map(x => { const r = x.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { t: (x.innerText || x.getAttribute('aria-label') || '').trim().slice(0, 14), inView: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth, onTop: h === x || x.contains(h) } }); return { w: innerWidth, top: Math.round(b.top), bottom: Math.round(b.bottom), left: Math.round(b.left), right: Math.round(b.right), btns } })
  const p1 = await box(); await shot(page, pic('f1-phone-taplist-open'))
  await page.setViewportSize({ width: 1440, height: 900 }); await page.waitForTimeout(900)
  const p2 = await box(); await shot(page, pic('f2-desktop-same-taplist'))
  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(900)
  const p3 = await box(); await shot(page, pic('f3-phone-again'))
  const s3 = await sheetNow(page)
  const ok = b => b && b.btns.length && b.btns.every(x => x.inView && x.onTop)
  R.ck('f-taplist-survives-resize', t.open === 'daylist-sheet' && ok(p1) && ok(p2) && ok(p3) && s3.open === 'daylist-sheet',
    'the tap list stays open and every button stays on screen and on top through 390 → 1440 → 390', { open: t.open, phone: p1, desktop: p2, phoneAgain: p3 })
  await closeSheets(page)
  const f1 = await snap(page, P, [D])
  R.ck('f-figures-unchanged', JSON.stringify(f0.figs) === JSON.stringify(f1.figs) && JSON.stringify(f0.run) === JSON.stringify(f1.run), 'the figures and the box are the same after the resizes', { before: f0, after: f1 })
  /* the medical clash confirm window, open across a resize */
  await fileInput(page, { person: 'sufa', type: 'HL', from: '2026-08-10', to: '2026-08-14', remarks: 'W5 HL' })
  await go(page, 'inputs')
  await page.selectOption('#inPerson', 'sufa'); await page.selectOption('#inType', 'ATT C')
  const MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  for (let i = 0; i < 12 && !(await page.locator('#inCal [data-cal="2026-08-12"]').count()); i++) {
    const [m, y] = (await page.locator('#inCal .rc-mon').first().textContent()).trim().split(/\s+/)
    const at = `${y}-${String(MONS.indexOf(m.slice(0, 3)) + 1).padStart(2, '0')}`
    await page.locator(`#inCal button[aria-label="${at < '2026-08' ? 'Next' : 'Previous'} month"]`).first().click(); await page.waitForTimeout(80)
  }
  await page.locator('#inCal [data-cal="2026-08-12"]').first().click(); await page.waitForTimeout(150)
  await page.locator('#inAdd').click(); await page.waitForTimeout(800)
  if (await page.locator('[data-testid="docconf-nodoc"]').count()) { await page.locator('[data-testid="docconf-nodoc"]').click(); await page.waitForTimeout(600) }
  const mc = page.locator('[data-testid="medclash"]')
  const open1 = await mc.count()
  const mbox = () => page.evaluate(() => { const s = document.querySelector('[data-testid="medclash"] .airpop-box') || document.querySelector('[data-testid="medclash"]'); if (!s) return null; const b = s.getBoundingClientRect(); const save = document.querySelector('[data-testid="medclash-save"]'); const sb = save ? save.getBoundingClientRect() : null; const h = sb ? document.elementFromPoint(sb.left + sb.width / 2, sb.top + sb.height / 2) : null; return { w: innerWidth, top: Math.round(b.top), bottom: Math.round(b.bottom), inView: b.top >= 0 && b.bottom <= innerHeight + 1 && b.left >= 0 && b.right <= innerWidth + 1, saveOnTop: !!(save && (h === save || save.contains(h))), saveInView: !!(sb && sb.top >= 0 && sb.bottom <= innerHeight) } })
  const m1 = await mbox(); await shot(page, pic('f4-phone-medclash-open'))
  await page.setViewportSize({ width: 1440, height: 900 }); await page.waitForTimeout(900)
  const m2 = await mbox(); await shot(page, pic('f5-desktop-medclash-open'))
  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(900)
  const m3 = await mbox(); await shot(page, pic('f6-phone-medclash-again'))
  R.ck('f-medclash-survives-resize', open1 && m1 && m2 && m3 && m1.saveInView && m2.saveInView && m3.saveInView && m1.saveOnTop && m2.saveOnTop && m3.saveOnTop,
    'the medical clash window stays open, on screen, its Save reachable and on top, through 390 → 1440 → 390', { open: open1, phone: m1, desktop: m2, phoneAgain: m3 })
  const x = page.locator('[data-testid="medclash"] button.x').first(); if (await x.count()) { await x.click(); await page.waitForTimeout(500) }
  const hl = (await inputsOf(page, 'sufa')).filter(i => /Aug/.test(i.date))
  R.ck('f-medclash-cancel-writes-nothing', hl.length === 1 && hl[0].type === 'HL' && /Aug 14/.test(hl[0].endDate), 'closing the window writes nothing: HL 10–14 Aug untouched, no ATT C', hl)
  await page.setViewportSize({ width: 1440, height: 900 })
})

R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
