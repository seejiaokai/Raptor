/* RE-WALK of W2-01 — FINDING AB4, on the REBUILT app (index-KbvILaPW.js), 26 Sep 26. Copied from w2-01-ab4.mjs, whose
   premise the fix consumed: the first walk waited for the gesture to write and then read what it wrote; now the gesture
   puts up the question (ui/MedMoveConfirm.tsx) and nothing lands until it is answered. This copy walks each door with
   the RIGHT premise, and BOTH answers of each question:
     round 1  the gesture → the sheet is up, nothing written, no ghost left, the SAME words as the edit window's sheet
              for the same move → Cancel → nothing written, no "Moved" said
     round 2+ the gesture again → each answer in turn → Save → what it wrote, what it said, the war (MED TOT, the row)
              → ONE Undo puts it all back; the last answer also Redo and a reload
   Register §12 (the contract): "A medical or an upchit MOVED asks what filing it asks. The calendar's drag and the
   schedule's reassign hand the new dates to the same questions as the form — who holds the shared days, and the
   upchit's leftovers — before anything is written." Owner 27 Aug 26 (no default), 28 Aug 26 (the leftover shown).
     A1   calendar: ATT C 18–19 dragged onto 24 (→ 24–25), sharing 24 with HL 20–24 — "ATT C replaces" / "Keep HL…"
     A1f  calendar: ATT C 18 dragged INTO HL 20–24 (→ 22) — forced "replaces"; the leftover HL 23–24 Remove / Keep
     A2   calendar: an UPCHIT 31 dragged into OML 20–24 (→ 22), a later ATT C 28 on file — Keep / Remove
     A3   Edit Schedule: reassign Cinch's ATT C 16–17 to Drifter (HL 17–18) by arm-then-tap — replaces (+ leftover
          HL 18 Remove / Keep) / "Keep HL till Jul 18"
     A3d  the same reassign by DRAGGING Drifter's palette puck onto the row (desktop)
     A3s  the same-type refusal still fires before any sheet (unchanged)
     A0   control: a medical dragged where it meets no other medical still lands at once, no sheet
   Usage (from raptor-port/, the rebuilt app on 4175): node scripts/handpass/ab/rw-w2-01-ab4.mjs [desktop|phone] */
const WD = process.argv[2] || 'desktop'
process.env.AB_WHO = 'rewalk/w2'
const L = await import('./ab-lib.mjs')
const W = await import('./w2-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { shot, toastSpy, toasts, resultBook, ROOT, inputsWindow } = L
const PHONE = WD === 'phone'
const R = resultBook(`RW-W2-01-${WD}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w2-01-${WD}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 3 : 1 })
await toastSpy(page)
const bundle = await page.evaluate(() => [...document.scripts].map(s => s.src).filter(s => /index-/.test(s)).join(','))
R.ck('bundle', /index-KbvILaPW\.js/.test(bundle), 'the rebuilt bundle index-KbvILaPW.js is what the page loaded', bundle)
const P = (n) => `rw-w2-01-${WD}-${n}`
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const ONLY = (process.env.W2_ONLY || '').split(',').filter(Boolean)
async function step(name, fn) { if (ONLY.length && !ONLY.some(o => name.startsWith(o))) return; try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await shot(page, P(`THREW-${name}`)).catch(() => {}) } }
const drag = (iid, a, b) => PHONE ? W.calDragTouch(page, iid, a, b) : W.calDragMouse(page, iid, a, b)
const JUL = d => `2026-07-${String(d).padStart(2, '0')}`
/* the medical/leave rows only (a man's OIL inputs ride along in medRows and never change here) */
const med = async (p) => (await W.medRows(page, p)).filter(r => /^(ATT C|HL|OML|Upchit|LL|ATT B)\b/.test(r))
const rowsOf = async (men) => { const o = {}; for (const m of men) o[m] = await med(m); return o }
const sheetText = (c) => c.medclash || c.upconf || ''

/* ---- the reassign by TAP, without closing the crew drawer: a person answers the sheet first, then closes it */
async function reassignTap(di, iid, pid) {
  const u = await W.unavRow(page, di, iid)
  if (!u.has) return { done: false, why: 'no Unavailable seat drawn for ' + iid }
  await u.seat.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await u.seat.click(); await page.waitForTimeout(400)
  let rp = page.locator(`.rpuck[data-person="${pid}"]:visible`).first()
  if (!(await rp.count())) { const tog = page.locator('.ros-tab:visible').first(); if (await tog.count()) { await tog.click(); await page.waitForTimeout(400) } rp = page.locator(`.rpuck[data-person="${pid}"]:visible`).first() }
  if (!(await rp.count())) return { done: false, why: 'no palette puck for ' + pid }
  await rp.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await rp.click(); await page.waitForTimeout(700)
  return { done: true, drawer: await page.evaluate(() => document.body.classList.contains('ros-open')) }
}
async function closeDrawer() {
  if (await page.evaluate(() => document.body.classList.contains('ros-open'))) {
    const tab = page.locator('.ros-tab:visible').first(); if (await tab.count()) { await tab.click({ timeout: 4000 }).catch(() => {}); await page.waitForTimeout(400) }
  }
}
/* ---- the reassign by DRAG: Drifter's palette puck pressed, carried and released on the Unavailable row's person */
async function reassignDrag(di, iid, pid) {
  const u = await W.unavRow(page, di, iid)
  await u.seat.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300)
  const rp = page.locator(`.rpuck[data-person="${pid}"]:visible`).first()
  if (!(await rp.count())) return { done: false, why: 'no palette puck for ' + pid }
  /* bring the puck to the MIDDLE of the palette: 'nearest' can leave it under the sticky top bar, where a press lands
     on the bar's own buttons (the first re-walk's rounds 2+ — a driver slip, found by rw-w2-00-probe-a3d.mjs) */
  await rp.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250)
  const a = await rp.boundingBox(), b = await u.seat.boundingBox()
  const hit = await page.evaluate(([ax, ay, bx, by]) => { const p = document.elementFromPoint(ax, ay), s = document.elementFromPoint(bx, by)
    return { puck: !!(p && p.closest('.rpuck')), seat: !!(s && s.closest('[data-inpseat]')) } }, [a.x + a.width / 2, a.y + a.height / 2, b.x + b.width / 2, b.y + b.height / 2])
  if (!hit.puck || !hit.seat) return { done: false, why: 'the puck or the seat is covered where the finger would go', hit }
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down()
  await page.mouse.move(a.x + a.width / 2 - 8, a.y + a.height / 2 + 4, { steps: 3 })
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 16 }); await page.waitForTimeout(150)
  await page.mouse.up(); await page.waitForTimeout(800)
  return { done: true }
}

/* ---- one door, walked whole. d = { tag, men, man (the war row), warDays, gesture(), prep(), kind: 'medclash'|'upconf',
   sheetWant(c), saveOffAtFirst, dialogText, said, answers: [{ name, pick(), want(rows), medtot }] } */
async function walkDoor(d) {
  const rows0 = await rowsOf(d.men)
  const war0 = await W.warRead(page, d.man, d.warDays)
  R.note(`${d.tag}-before`, { rows0, war0 })
  /* round 1 — the question is put; Cancel writes nothing */
  await step(`${d.tag}-ask-cancel`, async () => {
    await d.prep(); await toasts(page)
    const g = await d.gesture()
    const c = await W.confirmNow(page)
    const t = await toasts(page)
    const rows = await rowsOf(d.men)
    const gh = await W.ghostLeft(page)
    await shot(page, P(`${d.tag}-1a-sheet-up`))
    R.note(`${d.tag}-gesture`, { g, toasts: t, ghost: gh })
    R.ck(`AB4-${d.tag}-asks`, !!c[d.kind] && d.sheetWant(c), `the gesture puts up the ${d.kind === 'upconf' ? 'upchit summary' : 'clash sheet'} (${d.askWords})`, { sheet: c, toasts: t })
    R.ck(`AB4-${d.tag}-save-state`, c.buttons.some(b => /(medclash|upconf)-save/.test(b) && (/\(off\)/.test(b) === d.saveOffAtFirst)),
      d.saveOffAtFirst ? 'Save is OFF until every question is answered (no default)' : 'Save is ON at once — the only question with a default is the leftover, whose default ("will be removed") is SHOWN', c.buttons)
    if (d.dialogText != null) R.ck(`AB4-${d.tag}-same-as-edit-window`, sheetText(c) === d.dialogText, 'the SAME question, word for word, as the edit window puts for the same move (the doors cannot drift)', { gesture: sheetText(c), window: d.dialogText })
    R.ck(`AB4-${d.tag}-nothing-before-answer`, same(rows, rows0) && !t.some(x => /Moved to|is now unavailable/.test(x)), 'nothing is written, and nothing said, before the question is answered', { before: rows0, after: rows, toasts: t })
    if (!d.reassign) R.ck(`${d.tag}-no-ghost`, gh.ghosts === 0 && !gh.dragging, 'the dragged chip leaves no ghost behind the sheet', gh)
    await W.confirmCancel(page)
    if (d.reassign) await closeDrawer()
    const c2 = await W.confirmNow(page), t2 = await toasts(page), rows2 = await rowsOf(d.men)
    await shot(page, P(`${d.tag}-1b-after-cancel`))
    R.ck(`AB4-${d.tag}-cancel`, !W.anyConfirm(c2) && same(rows2, rows0) && !t2.some(x => /Moved to|is now unavailable/.test(x)), 'Cancel closes the sheet and writes nothing — the chip / the row where it was', { sheet: c2, toasts: t2, rows: rows2 })
  })
  /* each answer — Save, what it wrote, the war, ONE Undo */
  for (const [i, a] of d.answers.entries()) {
    const last = i === d.answers.length - 1 && d.redoReload !== false
    await step(`${d.tag}-${a.name}`, async () => {
      await d.prep(); await toasts(page)
      const g = await d.gesture()
      const c = await W.confirmNow(page)
      /* no sheet → nothing to answer; never press Undo on a step this answer did not make */
      if (!c[d.kind]) { await shot(page, P(`${d.tag}-${i + 2}-NO-SHEET`)); R.ck(`AB4-${d.tag}-${a.name}`, false, `the gesture puts up the sheet to answer "${a.name}"`, { gesture: g, sheet: c, toasts: await toasts(page), rows: await rowsOf(d.men) }); return }
      await a.pick()
      const cp = await W.confirmNow(page)
      await shot(page, P(`${d.tag}-${i + 2}a-${a.name}-chosen`))
      const sv = await W.confirmSave(page)
      const t = await toasts(page)
      if (d.reassign) await closeDrawer()
      const rows = await rowsOf(d.men)
      await shot(page, P(`${d.tag}-${i + 2}b-${a.name}-saved`))
      R.ck(`AB4-${d.tag}-${a.name}`, !!c[d.kind] && sv.pressed && a.want(rows) && t.some(x => x.includes(d.said)),
        `${a.words} — and "${d.said}" is said`, { chosen: sheetText(cp).slice(0, 420), save: sv, toasts: t, rows })
      const war = await W.warRead(page, d.man, d.warDays)
      await L.lwShot(page, P(`${d.tag}-${i + 2}c-${a.name}-war`), d.man, d.warShotDay)
      R.ck(`${d.tag}-${a.name}-war`, war.figs.medtot === String(a.medtot), `the war follows at once: MED TOT ${war0.figs.medtot} → ${a.medtot}`, war)
      const u = await W.hist(page, 'undo')
      const rU = await rowsOf(d.men), wU = await W.warRead(page, d.man, d.warDays)
      R.ck(`${d.tag}-${a.name}-one-undo`, same(rU, rows0) && same(wU.run, war0.run) && wU.figs.medtot === war0.figs.medtot, 'ONE Undo puts every row back as it was, and the war with it', { undo: u, rows: rU, war: wU })
      if (last) {
        const r = await W.hist(page, 'redo')
        const rR = await rowsOf(d.men)
        R.ck(`${d.tag}-${a.name}-redo`, same(rR, rows), 'Redo puts the answered move back exactly', { redo: r, rows: rR })
        await W.reload(page, 'a')
        const rL = await rowsOf(d.men), wL = await W.warRead(page, d.man, d.warDays)
        R.ck(`${d.tag}-${a.name}-reload`, same(rL, rows) && wL.figs.medtot === String(a.medtot), 'a reload keeps it, the war included', { rows: rL, war: wL })
      }
    })
  }
}

/* ======================================================================== A0 — the control: no clash, no question */
await step('A0', async () => {
  const man = 'shrek'                  // Wisp — nothing on file in late July
  const f = await W.fileMed(page, { person: man, type: 'ATT C', from: JUL(27), remarks: 'W2 A0 sick' })
  await W.calTo(page, '2026-07'); await toasts(page)
  const g = await drag(f.iid, JUL(27), JUL(29))
  const c = await W.confirmNow(page), t = await toasts(page)
  await shot(page, P('A0-no-clash-lands-at-once'))
  R.ck('A0-no-clash-lands-at-once', !W.anyConfirm(c) && (await med(man)).some(r => /^ATT C Jul 29\b/.test(r)) && t.some(x => /Moved to 29 Jul/.test(x)),
    'a medical dragged where it meets no other medical lands at once — no sheet, "Moved to 29 Jul"', { g, sheet: c, toasts: t, rows: await med(man) })
})

/* ======================================================================== A1 — onto a different-type medical */
{
  const man = 'dice'                   // Reaper
  let ids = {}, dialogText = null
  await step('A1-setup', async () => {
    const hl = await W.fileMed(page, { person: man, type: 'HL', from: JUL(20), to: JUL(24), remarks: 'W2 A1 hospital' })
    const ac = await W.fileMed(page, { person: man, type: 'ATT C', from: JUL(18), to: JUL(19), remarks: 'W2 A1 sick' })
    ids = { hl: hl.iid, ac: ac.iid }
    R.ck('A1-setup', hl.added === 1 && ac.added === 1, 'Reaper: HL 20–24 Jul, ATT C 18–19 Jul, filed on the Inputs page', await med(man))
    /* the comparison — the same move through the Inputs table's edit window */
    await inputsWindow(page, JUL(18), JUL(25))
    await W.tableEdit(page, ids.ac); await W.tablePickDates(page, JUL(24), JUL(25)); await W.tableSave(page)
    const c = await W.confirmNow(page); dialogText = sheetText(c)
    await shot(page, P('A1-0-edit-window-asks'))
    R.ck('A1-edit-window-asks', !!c.medclash && /Keep HL till Jul 24/.test(c.medclash), 'the edit window still asks (the comparison)', c)
    await W.confirmCancel(page); await W.tableCancel(page)
  })
  await walkDoor({
    tag: 'A1', men: [man], man, warDays: [18, 19, 20, 21, 22, 23, 24, 25].map(JUL), warShotDay: JUL(24),
    prep: () => W.calTo(page, '2026-07'), gesture: () => drag(ids.ac, JUL(18), JUL(24)),
    kind: 'medclash', askWords: '"HL Jul 20 – Jul 24 · both cover Jul 24" — "ATT C replaces" / "Keep HL till Jul 24"',
    sheetWant: c => /HL Jul 20 – Jul 24 · both cover Jul 24/.test(c.medclash) && /ATT C replaces/.test(c.medclash) && /Keep HL till Jul 24/.test(c.medclash),
    saveOffAtFirst: true, get dialogText() { return dialogText }, said: 'Moved to 24 Jul',
    answers: [
      { name: 'replaces', words: '"ATT C replaces": ATT C 24–25, the HL cut back to 20–23 ("till 23 Jul")', medtot: 6,
        pick: () => W.medClashPick(page, 0, 'new'),
        want: r => r[man].some(x => /^ATT C Jul 24–Jul 25\b/.test(x)) && r[man].some(x => /^HL Jul 20–Jul 23 "W2 A1 hospital till 23 Jul"/.test(x)) && r[man].length === 2 },
      { name: 'keep-HL', words: '"Keep HL till Jul 24": the HL whole 20–24, the ATT C filed around it — 25 only', medtot: 6,
        pick: () => W.medClashPick(page, 0, 'old'),
        want: r => r[man].some(x => /^ATT C Jul 25\b/.test(x)) && r[man].some(x => /^HL Jul 20–Jul 24 "W2 A1 hospital"/.test(x)) && r[man].length === 2 },
    ],
  })
}

/* ======================================================================== A1f — inside it: forced, the leftover */
{
  const man = 'prowler'                // Hunter
  let ids = {}, dialogText = null
  await step('A1f-setup', async () => {
    const hl = await W.fileMed(page, { person: man, type: 'HL', from: JUL(20), to: JUL(24), remarks: 'W2 A1f hospital' })
    const ac = await W.fileMed(page, { person: man, type: 'ATT C', from: JUL(18), remarks: 'W2 A1f sick' })
    ids = { hl: hl.iid, ac: ac.iid }
    R.ck('A1f-setup', hl.added === 1 && ac.added === 1, 'Hunter: HL 20–24 Jul, ATT C 18 Jul', await med(man))
    await inputsWindow(page, JUL(18), JUL(25))
    await W.tableEdit(page, ids.ac); await W.tablePickDates(page, JUL(22)); await W.tableSave(page)
    const c = await W.confirmNow(page); dialogText = sheetText(c)
    R.ck('A1f-edit-window-asks', !!c.medclash && /will be removed/.test(c.medclash), 'the edit window shows the forced "ATT C replaces" and the leftover (the comparison)', c)
    await W.confirmCancel(page); await W.tableCancel(page)
  })
  await walkDoor({
    tag: 'A1f', men: [man], man, warDays: [18, 19, 20, 21, 22, 23, 24, 25].map(JUL), warShotDay: JUL(22),
    prep: () => W.calTo(page, '2026-07'), gesture: () => drag(ids.ac, JUL(18), JUL(22)),
    kind: 'medclash', askWords: 'forced "ATT C replaces"; "Left over after it: HL Jul 23 – Jul 24 — will be removed", Remove / Keep',
    sheetWant: c => /ATT C replaces/.test(c.medclash) && !/Keep HL/.test(c.medclash) && /Left over after it: HL Jul 23 – Jul 24 — will be removed/.test(c.medclash),
    saveOffAtFirst: false, get dialogText() { return dialogText }, said: 'Moved to 22 Jul',
    answers: [
      { name: 'remove-leftover', words: 'the default, "Remove those days": ATT C 22, HL 20–21 only', medtot: 3,
        pick: async () => true,
        want: r => r[man].some(x => /^ATT C Jul 22\b/.test(x)) && r[man].some(x => /^HL Jul 20–Jul 21 "W2 A1f hospital till 21 Jul"/.test(x)) && r[man].length === 2 },
      { name: 'keep-leftover', words: '"Keep them": ATT C 22, HL 20–21 and HL 23–24, each "till" its own day', medtot: 5,
        pick: () => W.medClashTail(page, 0, 'keep'),
        want: r => r[man].some(x => /^ATT C Jul 22\b/.test(x)) && r[man].some(x => /^HL Jul 20–Jul 21 "W2 A1f hospital till 21 Jul"/.test(x)) && r[man].some(x => /^HL Jul 23–Jul 24 "W2 A1f hospital till 24 Jul"/.test(x)) && r[man].length === 3 },
    ],
  })
}

/* ======================================================================== A2 — an upchit dragged into a medical */
{
  const man = 'pump'                   // Piston
  let ids = {}, dialogText = null
  await step('A2-setup', async () => {
    const om = await W.fileMed(page, { person: man, type: 'OML', from: JUL(20), to: JUL(24), remarks: 'W2 A2 OML' })
    const fu = await W.fileMed(page, { person: man, type: 'ATT C', from: JUL(28), remarks: 'W2 A2 later ATT C' })
    const up = await W.fileMed(page, { person: man, type: 'Upchit', from: JUL(31), remarks: 'W2 A2 upchit' })
    ids = { om: om.iid, fu: fu.iid, up: up.iid }
    R.ck('A2-setup', om.added === 1 && fu.added === 1 && up.added === 1, 'Piston: OML 20–24, ATT C 28, Upchit 31 Jul', await med(man))
    await inputsWindow(page, JUL(20), JUL(31))
    await W.tableEdit(page, ids.up); await W.tablePickDates(page, JUL(22)); await W.tableSave(page)
    const c = await W.confirmNow(page); dialogText = sheetText(c)
    R.ck('A2-edit-window-asks', !!c.upconf && /now ends Jul 21/.test(c.upconf), 'the edit window shows the upchit summary (the comparison)', c)
    await W.confirmCancel(page); await W.tableCancel(page)
  })
  await walkDoor({
    tag: 'A2', men: [man], man, warDays: [20, 21, 22, 23, 24, 28].map(JUL), warShotDay: JUL(22),
    prep: () => W.calTo(page, '2026-07'), gesture: () => drag(ids.up, JUL(31), JUL(22)),
    kind: 'upconf', askWords: '"OML Jul 20 – Jul 24 → now ends Jul 21"; "Still on file after it": ATT C Jul 28 — Keep / Remove',
    sheetWant: c => /OML Jul 20 – Jul 24 → now ends Jul 21/.test(c.upconf) && /STILL ON FILE AFTER IT/i.test(c.upconf) && /ATT C Jul 28/.test(c.upconf),
    saveOffAtFirst: true, get dialogText() { return dialogText }, said: 'Moved to 22 Jul',
    answers: [
      { name: 'keep-later', words: '"Keep" the later ATT C: OML 20–21, the upchit 22, ATT C 28 stays', medtot: 3,
        pick: () => W.upchitPick(page, 0, 'keep'),
        want: r => r[man].some(x => /^OML Jul 20–Jul 21\b/.test(x)) && r[man].some(x => /^Upchit Jul 22\b/.test(x)) && r[man].some(x => /^ATT C Jul 28\b/.test(x)) && r[man].length === 3 },
      { name: 'remove-later', words: '"Remove" the later ATT C: OML 20–21, the upchit 22, ATT C 28 gone', medtot: 2,
        pick: () => W.upchitPick(page, 0, 'remove'),
        want: r => r[man].some(x => /^OML Jul 20–Jul 21\b/.test(x)) && r[man].some(x => /^Upchit Jul 22\b/.test(x)) && !r[man].some(x => /^ATT C/.test(x)) && r[man].length === 2 },
    ],
  })
}

/* ======================================================================== A3 — the schedule's reassign */
{
  const M3 = 'snap', M4 = 'slipway'    // Cinch, Drifter
  const FRI = 4
  let ids = {}, dialogText = null
  await step('A3-setup', async () => {
    const ac = await W.fileMed(page, { person: M3, type: 'ATT C', from: JUL(16), to: JUL(17), remarks: 'W2 A3 Cinch sick' })
    const hl = await W.fileMed(page, { person: M4, type: 'HL', from: JUL(17), to: JUL(18), remarks: 'W2 A3 Drifter hospital' })
    ids = { ac: ac.iid, hl: hl.iid }
    R.ck('A3-setup', ac.added === 1 && hl.added === 1, 'Cinch ATT C Thu 16–Fri 17; Drifter HL Fri 17–Sat 18', await rowsOf([M3, M4]))
    const u = await W.unavRow(page, FRI, ids.ac)
    await u.edit.evaluate(e => e.scrollIntoView({ block: 'center' })); await u.edit.click(); await page.waitForTimeout(500)
    await page.locator('#inpEditPerson:visible').selectOption(M4)
    await page.locator('#inpEditSave:visible').click(); await page.waitForTimeout(600)
    const c = await W.confirmNow(page); dialogText = sheetText(c)
    R.ck('A3-edit-window-asks', !!c.medclash && /Keep HL till Jul 18/.test(c.medclash), 'the edit window\'s Person change asks (the comparison)', c)
    await W.confirmCancel(page)
    const x = page.locator('#inpEditCancel:visible'); if (await x.count()) { await x.click(); await page.waitForTimeout(300) }
  })
  const answers = [
    { name: 'replaces-remove-leftover', words: '"ATT C replaces" with the leftover HL 18 on its default (Remove): Drifter ATT C 16–17, his HL gone; Cinch nothing', medtot: 2,
      pick: () => W.medClashPick(page, 0, 'new'),
      want: r => r[M3].length === 0 && r[M4].length === 1 && /^ATT C Jul 16–Jul 17\b/.test(r[M4][0]) },
    { name: 'replaces-keep-leftover', words: '"ATT C replaces" + "Keep them": Drifter ATT C 16–17 and HL 18 ("till 18 Jul"); Cinch nothing', medtot: 3,
      pick: async () => { await W.medClashPick(page, 0, 'new'); await W.medClashTail(page, 0, 'keep') },
      want: r => r[M3].length === 0 && r[M4].some(x => /^ATT C Jul 16–Jul 17\b/.test(x)) && r[M4].some(x => /^HL Jul 18 "W2 A3 Drifter hospital till 18 Jul"/.test(x)) && r[M4].length === 2 },
    { name: 'keep-HL', words: '"Keep HL till Jul 18": Drifter HL 17–18 whole, the ATT C filed around it — 16 only; Cinch nothing', medtot: 3,
      pick: () => W.medClashPick(page, 0, 'old'),
      want: r => r[M3].length === 0 && r[M4].some(x => /^ATT C Jul 16\b/.test(x) && !/Jul 16–/.test(x)) && r[M4].some(x => /^HL Jul 17–Jul 18 "W2 A3 Drifter hospital"/.test(x)) && r[M4].length === 2 },
  ]
  const base = {
    men: [M3, M4], man: M4, warDays: [16, 17, 18].map(JUL), warShotDay: JUL(17), reassign: true,
    prep: async () => {}, kind: 'medclash', askWords: '"HL Jul 17 – Jul 18 · both cover Jul 17" — "ATT C replaces" / "Keep HL till Jul 18"',
    sheetWant: c => /HL Jul 17 – Jul 18 · both cover Jul 17/.test(c.medclash) && /Keep HL till Jul 18/.test(c.medclash),
    saveOffAtFirst: true, get dialogText() { return dialogText }, said: 'Drifter is now unavailable instead of Cinch', answers,
  }
  /* the same-type refusal on the reassign door — still before any sheet */
  await step('A3s', async () => {
    const M5 = 'prowler'               // Hunter
    const h = await W.fileMed(page, { person: M5, type: 'ATT C', from: JUL(17), remarks: 'W2 A3s Hunter sick' })
    const before = await rowsOf([M3, M5])
    await toasts(page)
    const g = await reassignTap(FRI, ids.ac, M5)
    const t = await toasts(page), c = await W.confirmNow(page)
    await closeDrawer()
    const after = await rowsOf([M3, M5])
    await shot(page, P('A3s-same-type-reassign-refused'))
    R.ck('A3s-same-type-refused', same(after, before) && !W.anyConfirm(c) && t.some(x => /already filed over these days/.test(x)),
      'reassigning Cinch\'s ATT C to Hunter (ATT C on Fri 17) is refused before any sheet, naming the ATT C in the way; nothing moves', { filed: h.added, gesture: g, toasts: t, sheet: c, before, after })
  })
  /* the tap walk ends in a reload only where it is the last reassign walk (a reload clears Undo, and the drag walk
     needs Cinch's ATT C back where it was) */
  await walkDoor({ ...base, tag: 'A3', redoReload: PHONE, gesture: () => reassignTap(FRI, ids.ac, M4) })
  if (!PHONE) await walkDoor({ ...base, tag: 'A3d', gesture: () => reassignDrag(FRI, ids.ac, M4) })
  else R.note('A3d', 'phone: the arm-then-tap above is the phone\'s reassign door; the palette drag is walked at desktop')
}

R.note('toasts-left', await toasts(page))
R.note('errors', errors.slice(0, 20))
R.ck('console-clean', !errors.length, 'no console errors, page errors or failed requests', errors.slice(0, 10))
R.save()
await browser.close()
