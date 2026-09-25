/* [LEAVE-LATE-PUBLISHED]'s FULL check, 26 Sep 26 (morning) — the host's walk of FABLE'S CODE-READ FIXES in the real app,
   through the Inputs page (evidence docs/handpass/2026-09-26-late-pub.md §4b). Written as assertions of the RIGHT
   behaviour; re-running it IS the re-walk. Each world is a fresh demo, made through the app's own controls.
     H1  F2 — a medical takeover in the middle of a downchit: ONE line on the tail's published day, not two
     H2  F1 as the app writes it — an upchit trims a Mon–Fri downchit: Thursday "moved off this day"; Monday reads only
         the words its "till …" note changed (the look card's question), never the dates
     H3  F4 + the LATE badge — an accepted request's times edited on a published day: one line that TAPS to the row;
         the working copy shows LATE, the published face does not; after AL1 the face shows it
     H4  F5 — "Load onto working copy" with a member's late leave: the message says it stays pending
   Usage (from raptor-port/, a preview on 4173): node scripts/handpass/am/late-pub-host-walk.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.HP_SHOTS = `C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-26-late-pub/host/${W}`
const L = await import('./w2-lib.mjs')
const W1 = await import('./w1-lib.mjs')
const W4 = await import('./w4-lib.mjs')
const { openHi, editWeek, board, signDay, publishDay, head, go, check, note, summary, screen, lookAt, pvBar, pvTap } = L
const { toastSpy, toasts, shotUnion, norm } = W1
const PHONE = W === 'phone'
const SIZE = PHONE ? { width: 390, height: 844 } : { width: 1440, height: 900 }
const MON = 0, TUE = 1, WED = 2, THU = 3
const num = s => { const m = /(\d+)/.exec(String(s || '')); return m ? +m[1] : 0 }
const ALL_ERRORS = []

async function world() {
  const w = await openHi({ ...SIZE, dpr: PHONE ? 3 : 1, state: null })
  await toastSpy(w.page)
  w.CS = await w.page.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, p]) => [k, p.cs])))
  /* a man on none of Monday–Friday's content and with no input that week (read only — the evidence table) */
  w.loner = await w.page.evaluate(() => Object.keys(window.PEOPLE).find(id => { const p = window.PEOPLE[id]
    return !p.special && !p.pers && [0, 1, 2, 3, 4].every(d => !JSON.stringify(window.DAYS[d]).includes(`"${id}"`)) && !window.INPUTS.some(r => r.person === id) }))
  return w
}
/* file through the Inputs page; when the form asks who holds days another status covers (the medical takeover) or to
   confirm a trim, answer it the way the case needs — `keep` keeps the old status's leftover days — then Save */
async function fileAsk(page, f) {
  const before = await page.evaluate(() => window.INPUTS.length)
  const r = await W4.fileInput(page, f)
  const said = []
  for (let i = 0; i < 4; i++) {
    const keep = page.getByRole('button', { name: /^Keep them$/ }).first()
    if (f.keep && await keep.count() && await keep.isVisible().catch(() => false)) { await keep.click(); await page.waitForTimeout(250); said.push('Keep them') }
    const save = page.locator('button:visible', { hasText: /^Save( upchit)?$/ }).first()
    if (await save.count() && await save.isVisible().catch(() => false)) { await save.click(); await page.waitForTimeout(600); said.push('Save'); continue }
    const nodoc = page.locator('[data-testid="docconf-nodoc"]')
    if (await nodoc.count()) { await nodoc.click(); await page.waitForTimeout(500); said.push('no certificate'); continue }
    break
  }
  const after = await page.evaluate(() => window.INPUTS.length)
  return { ...r, added: after - before, answered: said }
}
async function pubOnBoard(page, di) {
  await board(page, di); await signDay(page, di, 0); const p = await publishDay(page, di); await toasts(page)
  return { p, h: await head(page, di) }
}
async function pendingOn(page, di) { await editWeek(page); return num((await head(page, di)).pending) }
async function pendList(page, di, shot) {
  await editWeek(page)
  const b = page.locator(`#eWeek .day[data-day="${di}"] [data-pendlist="${di}"]:visible`).first()
  if (!(await b.count())) return { text: '(no pending button)', buttons: 0, still: 0 }
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await page.waitForTimeout(400)
  const r = await page.evaluate(() => { const p = document.querySelector('#pendList'); if (!p) return { text: '(closed)', buttons: 0, still: 0 }
    return { text: p.innerText.replace(/\s+/g, ' ').trim(), buttons: p.querySelectorAll('button.pl-item').length, still: p.querySelectorAll('.pl-item.still').length } })
  if (shot) await shotUnion(page, shot, ['#pendList'])
  return r
}
async function closeList(page) { await page.keyboard.press('Escape'); await page.waitForTimeout(200) }
async function faceText(page, di, shot) {
  await go(page, 'viewsched'); await page.waitForTimeout(400)
  const sel = `#vWeek .day[data-day="${di}"]`
  const t = await page.evaluate(s => { const d = document.querySelector(s); return d ? d.innerText.replace(/\s+/g, ' ') : '(no day)' }, sel)
  if (shot) { await page.locator(sel).first().evaluate(e => e.scrollIntoView({ block: 'start' })); await page.waitForTimeout(200); await screen(page, shot)
    if (await page.locator(`${sel} .sec-unav`).count()) await shotUnion(page, shot + '-unavail', [`${sel} .sec-unav`]) }
  return t
}
/* a close-up of the day's row that carries `words` (the ground programme's .pl-row) */
async function shotRow(page, name, sel, words) {
  const r = page.locator(`${sel} .pl-row`, { hasText: words }).first()
  if (!(await r.count())) return
  await r.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(150)
  await r.screenshot({ path: `${process.env.HP_SHOTS}/${name}.png` }).catch(() => {})
}
/* the LATE badge on the day's ground-programme row that carries `words` (html.ts: a .pl-row, its badge a .latetag) */
const lateOn = (page, sel, words) => page.evaluate(([s, w]) => { const d = document.querySelector(s); if (!d) return null
  const row = [...d.querySelectorAll('.pl-row')].find(r => (r.textContent || '').includes(w))
  return row ? !!row.querySelector('.latetag') : 'no row' }, [sel, words])

/* ===================== H1 — F2, a medical takeover ===================== */
async function worldH1() {
  const { browser, page, errors, CS, loner } = await world()
  try {
    const f0 = await W4.fileInput(page, { person: loner, type: 'ATT C', from: '2026-07-13', to: '2026-07-17', span: 'all', remarks: 'LONG DOWNCHIT' })
    await toasts(page)
    note('H1 fixture', `ATT C Mon–Fri for ${CS[loner]} through the Inputs page: ${f0.added} added, asked ${JSON.stringify(f0.asked)}`)
    const pub = await pubOnBoard(page, WED)
    check('H1 Wednesday published', /ORIG/.test(pub.h.tag) && !num(pub.h.pending), `tag "${pub.h.tag}"`)
    const fBefore = await faceText(page, WED, 'H1-face-before')
    const f1 = await fileAsk(page, { person: loner, type: 'OML', from: '2026-07-14', to: '2026-07-14', span: 'all', remarks: 'MO OML', keep: true })
    await screen(page, 'H1-after-oml')
    const said = (await toasts(page)).join(' / ')
    const recs = await page.evaluate(id => window.INPUTS.filter(r => r.person === id).map(r => [r.type, r.date, r.endDate, r.remarks]), loner)
    note('H1 the MO files OML for Tuesday', `${f1.added} added (answered ${JSON.stringify(f1.answered)}); said "${said}"; ${CS[loner]}'s records now ${JSON.stringify(recs)}`)
    const n = await pendingOn(page, WED)
    check('H1 Wednesday reads ONE change (F2)', n === 1, `Wednesday "${n} pending"`)
    const l = await pendList(page, WED, 'H1-pending-list'); await closeList(page)
    check('H1 one line, one edit — not "moved off" and "filed"', !/moved off|filed/.test(l.text) && /LONG DOWNCHIT/.test(l.text), `"${l.text}"`)
    const fAfter = await faceText(page, WED, 'H1-face-after')
    check('H1 the published face keeps what it went out with', fAfter === fBefore, fAfter === fBefore ? 'byte-for-byte' : 'DIFFERS')
  } finally { ALL_ERRORS.push(...errors.map(e => 'H1 ' + e)); await browser.close() }
}

/* ===================== H2 — F1 as the app writes it: an upchit ===================== */
async function worldH2() {
  const { browser, page, errors, CS, loner } = await world()
  try {
    await W4.fileInput(page, { person: loner, type: 'ATT C', from: '2026-07-13', to: '2026-07-17', span: 'all', remarks: 'WEEK DOWN' })
    await toasts(page)
    const rm0 = await page.evaluate(id => (window.INPUTS.find(r => r.person === id && r.type === 'ATT C') || {}).remarks, loner)
    await pubOnBoard(page, MON); await pubOnBoard(page, THU)
    const f = await fileAsk(page, { person: loner, type: 'Upchit', from: '2026-07-16', to: '2026-07-16', span: 'all', remarks: 'FIT' })
    await screen(page, 'H2-after-upchit')
    await toasts(page)
    const down = await page.evaluate(id => { const r = window.INPUTS.find(x => x.person === id && x.type === 'ATT C'); return r ? [r.date, r.endDate, r.remarks] : null }, loner)
    note('H2 upchit filed Thursday', `${f.added} added (answered ${JSON.stringify(f.answered)}); the downchit was "${rm0}", now ${JSON.stringify(down)}`)
    const nThu = await pendingOn(page, THU)
    const lThu = await pendList(page, THU, 'H2-thu-pending-list'); await closeList(page)
    check('H2 Thursday lost the downchit: one line, "moved off this day"', nThu === 1 && /moved off this day/.test(lThu.text), `${nThu} · "${lThu.text}"`)
    const nMon = await pendingOn(page, MON)
    const lMon = await pendList(page, MON, 'H2-mon-pending-list'); await closeList(page)
    check('H2 Monday: one line naming only the words its note changed (F1), never the dates', nMon === 1 && new RegExp(`“${rm0}” → “${rm0} till 15 Jul”`).test(lMon.text) && !/Jul 13 –/.test(lMon.text), `${nMon} · "${lMon.text}"`)
    const fMon = await faceText(page, MON, 'H2-mon-face')
    check('H2 Monday\'s published face keeps the words it went out with', fMon.includes(rm0 || '(none)'), `face carries "${rm0}"`)
  } finally { ALL_ERRORS.push(...errors.map(e => 'H2 ' + e)); await browser.close() }
}

/* ===================== H3 — F4 and the LATE badge: an accepted request edited ===================== */
async function worldH3() {
  const { browser, page, errors, CS } = await world()
  try {
    /* Yeti's Appointment is an accepted request with a row on Monday's ground programme (the demo seed) */
    const r0 = await page.evaluate(() => { const r = window.INPUTS.find(x => x.person === 'yeti' && x.type === 'Appointment'); return r ? { iid: r.iid, acc: r.acc, s: r.s, e: r.e, remarks: r.remarks, mod: r.mod } : null })
    note('H3 fixture', `Yeti's Appointment: ${JSON.stringify(r0)}`)
    await pubOnBoard(page, MON)
    await editWeek(page)
    const weekSel = `#eWeek .day[data-day="${MON}"]`
    const late0w = await lateOn(page, weekSel, r0.remarks)
    const fSel = `#vWeek .day[data-day="${MON}"]`
    await go(page, 'viewsched'); await page.waitForTimeout(300)
    const late0f = await lateOn(page, fSel, r0.remarks)
    await shotRow(page, 'H3-face-row-before', fSel, r0.remarks)
    /* edit its times on the Inputs page — the row's ✎, the time boxes, ✓ */
    await go(page, 'inputs'); await page.waitForTimeout(400)
    /* the list opens on the coming weeks; the demo week is in the past by today's clock — show every date */
    await page.locator('#inRangeBtn').click(); await page.waitForTimeout(200)
    await page.locator('#inRangeAll').click(); await page.waitForTimeout(300)
    const inx = await page.evaluate(iid => window.INPUTS.findIndex(x => x.iid === iid), r0.iid)
    const ed = page.locator(`[data-edit="${inx}"]:visible`).first()
    let edited = false
    if (await ed.count()) {
      await ed.evaluate(e => e.scrollIntoView({ block: 'center' })); await ed.click(); await page.waitForTimeout(400)
      const st = page.locator('[data-ed="stime"]:visible').first(), et = page.locator('[data-ed="etime"]:visible').first()
      if (await st.count() && await et.count()) {
        await st.fill('15:00'); await et.fill('16:00')
        await page.locator(`[data-save="${inx}"]:visible`).first().click(); await page.waitForTimeout(700); edited = true
      }
      const conf = page.locator('[data-testid="oilconf"]')
      if (await conf.count() && await conf.isVisible()) { await conf.getByRole('button', { name: 'Save', exact: true }).click().catch(() => {}); await page.waitForTimeout(500) }
    }
    const said = (await toasts(page)).join(' / ')
    const r1 = await page.evaluate(iid => { const r = window.INPUTS.find(x => x.iid === iid); return r ? { s: r.s, e: r.e, mod: r.mod } : null }, r0.iid)
    note('H3 edited on the Inputs page', `${edited ? 'saved' : 'NOT SAVED (no ✎ / time boxes)'}: ${JSON.stringify(r1)}; said "${said}"`)
    const n = await pendingOn(page, MON)
    check('H3 one change (the request and its re-landed row)', n === 1, `Monday "${n} pending"`)
    const l = await pendList(page, MON, 'H3-pending-list')
    check('H3 the one line can be tapped (F4)', l.buttons === 1 && l.still === 0, `${l.buttons} button(s), ${l.still} still · "${l.text}"`)
    const hit = page.locator('#pendList button.pl-item').first()
    let flashed = false
    if (await hit.count()) {
      await hit.click()
      flashed = await page.waitForFunction(() => !!document.querySelector('.chgflash'), null, { timeout: 1500 }).then(() => true).catch(() => false)
      await screen(page, 'H3-after-tap')
    }
    check('H3 the tap takes the view to the row and marks it', flashed, flashed ? 'a row flashed (chgflash)' : 'nothing flashed')
    await editWeek(page)
    const late1w = await lateOn(page, weekSel, r0.remarks)
    await go(page, 'viewsched'); await page.waitForTimeout(300)
    const late1f = await lateOn(page, fSel, r0.remarks)
    await shotRow(page, 'H3-face-row-after', fSel, r0.remarks)
    note('H3 LATE badge', `working copy: ${late0w} → ${late1w} (edited today, after its deadline); published face: ${late0f} → ${late1f}`)
    check('H3 the edit made it LATE on the working copy', late1w === true, `working ${late1w}`)
    check('H3 the published face keeps the LATE it went out with', late1f === late0f, `face ${late0f} → ${late1f}`)
    /* AL1 takes it in — and the face shows what the working copy shows */
    await board(page, MON); await signDay(page, MON, 0)
    const al = await L.publishAL(page, MON).catch(() => ({ pressed: false })); await toasts(page)
    await go(page, 'viewsched'); await page.waitForTimeout(300)
    const late2f = await lateOn(page, fSel, r0.remarks)
    check('H3 after AL1 the face matches the working copy\'s LATE', late2f === late1w, `AL ${JSON.stringify(al)}; face LATE ${late2f}, working ${late1w}`)
  } finally { ALL_ERRORS.push(...errors.map(e => 'H3 ' + e)); await browser.close() }
}

/* ===================== H3b — the LATE badge on a request that was on time when the day went out ===================== */
async function worldH3b() {
  const { browser, page, errors, CS } = await world()
  try {
    await pubOnBoard(page, MON)
    const weekSel = `#eWeek .day[data-day="${MON}"]`, fSel = `#vWeek .day[data-day="${MON}"]`
    /* Monday's accepted requests (read only), and which of their rows carry no LATE on the published face */
    const reqs = await page.evaluate(() => window.INPUTS.filter(r => r.acc === 'g' && r.date === 'Jul 13').map(r => ({ iid: r.iid, who: r.person, type: r.type, remarks: r.remarks })))
    await go(page, 'viewsched'); await page.waitForTimeout(300)
    let pick = null
    for (const r of reqs) { if (r.remarks && (await lateOn(page, fSel, r.remarks)) === false) { pick = r; break } }
    note('H3b fixture', `Monday's accepted requests ${JSON.stringify(reqs.map(r => [r.who, r.type, r.remarks]))}; on time when published: ${pick ? pick.who + ' · ' + pick.type : 'NONE'}`)
    if (!pick) { check('H3b a request on time when published exists', false, 'none on the demo Monday'); return }
    await shotRow(page, 'H3b-face-row-before', fSel, pick.remarks)
    await go(page, 'inputs'); await page.waitForTimeout(400)
    await page.locator('#inRangeBtn').click(); await page.waitForTimeout(200)
    await page.locator('#inRangeAll').click(); await page.waitForTimeout(300)
    const inx = await page.evaluate(iid => window.INPUTS.findIndex(x => x.iid === iid), pick.iid)
    await page.locator(`[data-edit="${inx}"]:visible`).first().click(); await page.waitForTimeout(400)
    await page.locator('[data-ed="remarks"]:visible').first().fill(pick.remarks + ' (moved)')
    await page.locator(`[data-save="${inx}"]:visible`).first().click(); await page.waitForTimeout(700)
    const conf = page.locator('[data-testid="oilconf"]')
    if (await conf.count() && await conf.isVisible()) { await conf.getByRole('button', { name: 'Save', exact: true }).click().catch(() => {}); await page.waitForTimeout(500) }
    await toasts(page)
    const words = pick.remarks + ' (moved)'
    await editWeek(page)
    const lw = await lateOn(page, weekSel, words)
    await shotRow(page, 'H3b-week-row-after', weekSel, words)
    await go(page, 'viewsched'); await page.waitForTimeout(300)
    const lf = await lateOn(page, fSel, pick.remarks)
    await shotRow(page, 'H3b-face-row-after', fSel, pick.remarks)
    check('H3b edited today (after its deadline): LATE on the working copy', lw === true, `working ${lw}`)
    check('H3b the published face shows no LATE — it went out on time', lf === false, `face ${lf}`)
    await board(page, MON); await signDay(page, MON, 0)
    const al = await L.publishAL(page, MON).catch(() => ({ pressed: false })); await toasts(page)
    await go(page, 'viewsched'); await page.waitForTimeout(300)
    const lf2 = await lateOn(page, fSel, words)
    await shotRow(page, 'H3b-face-row-after-AL1', fSel, words)
    check('H3b after AL1 the face shows LATE with the new words', lf2 === true, `AL ${JSON.stringify(al)}; face ${lf2}`)
  } finally { ALL_ERRORS.push(...errors.map(e => 'H3b ' + e)); await browser.close() }
}

/* ===================== H5 — the second reads: the roster a published day counts (Astra #3) ===================== */
async function navTo(page, name) {
  const top = page.locator(`a[data-page="${name}"]:visible`).first()
  if (await top.count()) await top.click()
  else { await page.locator('#burger:visible').first().click(); await page.waitForTimeout(450); await page.locator(`#drawerNav a[data-page="${name}"]`).first().click() }
  await page.waitForFunction(p => window.CURPAGE === p, name, { timeout: 8000 }); await page.waitForTimeout(450)
}
async function freeAllOn(page, where, di, shot) {
  if (where === 'face') await go(page, 'viewsched'); else await editWeek(page)
  await page.waitForTimeout(300)
  const r = await W1.dayInfo(page, di)
  const n = await page.evaluate(() => { const p = document.querySelector('#dayPop:not([hidden])'); if (!p) return null
    const row = [...p.querySelectorAll('.dip-r')].find(r => /Free all day/.test(r.textContent || '')); return row ? +((row.querySelector('.v') || {}).textContent || 'NaN') : null })
  if (shot) await screen(page, shot)
  await W1.closeDayInfo(page)
  return { n, err: r.error }
}
async function worldH5() {
  const { browser, page, errors, CS, loner } = await world()
  try {
    await pubOnBoard(page, MON)
    const f0 = await freeAllOn(page, 'face', MON, 'H5-face-info-before'), w0 = await freeAllOn(page, 'week', MON)
    const seat = await page.evaluate(id => window.PEOPLE[id].seat, loner)
    await navTo(page, 'quals')
    const view = seat === 'RCP' ? '#qViewW' : '#qViewP'
    if (await page.locator(`${view}:visible`).count()) { await page.click(view); await page.waitForTimeout(250) }
    if (await page.locator('#qEdit:visible').count()) { await page.click('#qEdit'); await page.waitForTimeout(350) }
    const x = page.locator(`#qtbl [data-arch="${loner}"]`).first()
    if (await x.count()) { await x.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(200); await x.click(); await page.waitForTimeout(400) }
    if (await page.locator('#qSave:visible').count()) { await page.click('#qSave'); await page.waitForTimeout(350) }
    const arch = await page.evaluate(id => !!window.PEOPLE[id].archived, loner)
    await toasts(page)
    note('H5 posted out on the Quals page', `${CS[loner]} (nowhere on Monday): archived=${arch}`)
    const f1 = await freeAllOn(page, 'face', MON, 'H5-face-info-after'), w1 = await freeAllOn(page, 'week', MON)
    check('H5 the published day panel keeps its "free all day" (Astra #3)', arch && f1.n === f0.n && f0.n > 0, `face ${f0.n} -> ${f1.n}`)
    check('H5 the working copy counts today\'s roster', w1.n === w0.n - 1, `working ${w0.n} -> ${w1.n}`)
    const n = await pendingOn(page, MON)
    check('H5 nothing pending — a roster change is no change to the day', n === 0, `${n} pending`)
  } finally { ALL_ERRORS.push(...errors.map(e => 'H5 ' + e)); await browser.close() }
}

/* ===================== H6 — the second reads: a standby line prints no brief (Fable #1) ===================== */
async function worldH6() {
  const { browser, page, errors } = await world()
  try {
    const FRI = 4
    await board(page, FRI)
    const add = page.locator(`#schedBoard [data-wvadd="${FRI}"]:visible`).first()
    let added = false
    if (await add.count()) {
      await add.click(); await page.waitForTimeout(350)
      const sc = page.locator('.wavemenu [data-wmkind="sc"]:visible').first()
      if (await sc.count()) { await sc.click(); await page.waitForTimeout(600); added = true }
    }
    const waves = await page.evaluate(() => (window.DAYS[4].waves || []).map(w => ({ sa: !!w.standalone, blank: (w.formations || []).filter(f => !String(f.br || '').trim()).length })))
    note('H6 Friday (no flying lines) gets an SC wave through "+ Wave"', `added=${added}; waves ${JSON.stringify(waves)}`)
    await toasts(page)
    await signDay(page, FRI, 0); await publishDay(page, FRI); await toasts(page)
    const h0 = await head(page, FRI)
    check('H6 Friday published with its standby line', /ORIG/.test(h0.tag) && waves.some(w => w.sa && w.blank), `tag "${h0.tag}"`)
    await navTo(page, 'logic')
    const ed = page.locator('#lgEdit:visible').first(); if (await ed.count()) { await ed.click(); await page.waitForTimeout(300) }
    const box = page.locator('#lgBody .lgin[data-lgset="briefLead"]:visible').first()
    let changed = false
    if (await box.count()) { await box.evaluate(e => e.scrollIntoView({ block: 'center' })); await box.click(); await box.fill('150'); await box.press('Tab'); await page.waitForTimeout(700); changed = true }
    const lead = await page.evaluate(() => window.VCONF.briefLead)
    note('H6 the Logic page\'s brief lead', `changed=${changed} -> ${lead} min`)
    const n = await pendingOn(page, FRI)
    check('H6 Friday reads nothing — its standby line prints no brief (Fable #1)', lead === 150 && n === 0, `${n} pending`)
    await screen(page, 'H6-fri-after-lead')
  } finally { ALL_ERRORS.push(...errors.map(e => 'H6 ' + e)); await browser.close() }
}

/* ===================== H4 — F5, the load's message ===================== */
async function worldH4() {
  const { browser, page, errors, CS, loner } = await world()
  try {
    await pubOnBoard(page, MON)
    await W4.fileInput(page, { person: loner, type: 'LL', from: '2026-07-13', to: '2026-07-13', span: 'all', remarks: 'KEEP ON LOAD WALK' })
    await toasts(page)
    await editWeek(page)
    const opened = await lookAt(page, MON, /ORIG|Original/)
    const bar0 = await pvBar(page, MON)
    await pvTap(page, MON, 'data-restore')
    const bar1 = await pvBar(page, MON)
    if (bar1 && /confirm/i.test(bar1.load || '')) await pvTap(page, MON, 'data-restore')
    const said = (await toasts(page)).join(' / ')
    note('H4 load', `opened ${opened}; bar "${bar0 && bar0.text}"; said "${said}"`)
    check('H4 the load says the member\'s input stays pending (F5)', /1 member input change stays pending/.test(said), `"${said}"`)
    const n = await pendingOn(page, MON)
    check('H4 and the day still reads it', n === 1, `${n} pending`)
    await screen(page, 'H4-after-load')
  } finally { ALL_ERRORS.push(...errors.map(e => 'H4 ' + e)); await browser.close() }
}

await worldH1()
await worldH2()
await worldH3()
await worldH3b()
if (!PHONE) await worldH4()
await worldH5()
await worldH6()
check('no console errors', !ALL_ERRORS.length, ALL_ERRORS.slice(0, 5).join(' | '))
process.exitCode = summary(`late-pub host walk (${W})`) ? 1 : 0
