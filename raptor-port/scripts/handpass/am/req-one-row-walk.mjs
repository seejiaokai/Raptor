/* D174 + D175's FULL check — the WALK (25 Sep 26; evidence sheet docs/handpass/2026-09-25-req-one-row.md).
   Written as assertions of the RIGHT behaviour, so a PASS means correct and re-running it on a fixed build IS the
   re-walk (bug-check order §5). Each world is a fresh demo, made through the app's own controls: the Inputs page's
   form, the sign-off selects, Publish, ✕ on a row, a request's Accept / → Unavail / Undo buttons, the plans menu
   (look at a version, + Alt Plan, switch), the preview bar's Load, the top bar's Undo / Redo, View-only Sched.
     A  D174 — a request filed on a published Monday, then taken off
        A1 filed → 1 pending, the four sign-offs fall     A2 ✕ its row → 0 on every count, the four hold, the request
        dormant, View-only Sched unchanged                A3 Load Original → "already at", still dormant
        A4 Accept again → 1 · ✕ → 0 · Undo → 1 · Redo → 0  A5 an Other request: → Unavail → 1, Undo → 0
     B  D175 — a two-day request: on Monday, both published, ✕ Monday, Accept onto Tuesday, then Monday's Original
        loaded → no confirm, ONE row (Tuesday), the sentence names it, both days' counts unchanged; ✕ Tuesday → none
     C  D175 — the same through a plan switch on the published Monday (+ Alt Plan, ✕, Accept Tuesday, switch back)
   Usage (from raptor-port/, a preview on 4173): node scripts/handpass/am/req-one-row-walk.mjs [desktop|phone]
   HP_REWALK=<folder> sends the pictures to a re-walk folder, so the first walk's stay as evidence. */
const W = process.argv[2] || 'desktop'
process.env.HP_SHOTS = process.env.HP_REWALK
  ? `${process.env.HP_REWALK}/${W}`
  : `C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-25-req-one-row/${W}`
const L = await import('./w2-lib.mjs')
const W1 = await import('./w1-lib.mjs')
const W4 = await import('./w4-lib.mjs')
const { openHi, editWeek, board, closeBoard, openInputs, signDay, publishDay, head, go, check, note, summary, screen, lookAt, pvBar, pvTap, altPlan, switchTo, viewDay } = L
const { toastSpy, toasts, panel, shotUnion, norm } = W1
const PHONE = W === 'phone'
const SIZE = PHONE ? { width: 390, height: 844 } : { width: 1440, height: 900 }
const MON = 0, TUE = 1
const num = s => { const m = /(\d+)/.exec(String(s || '')); return m ? +m[1] : 0 }
const ALL_ERRORS = []

async function world() {
  const w = await openHi({ ...SIZE, dpr: PHONE ? 3 : 1, state: null })
  await toastSpy(w.page)
  w.CS = await w.page.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, p]) => [k, p.cs])))
  return w
}
const rowsOf = (page, id) => page.evaluate(id => window.DAYS.flatMap((d, di) => ((d && d.ground) || []).filter(g => g && g.src === id).map(() => di)), id)
const rowIx = (page, di, id) => page.evaluate(([di, id]) => ((window.DAYS[di] || {}).ground || []).findIndex(g => g && g.src === id), [di, id])
const accOf = (page, id) => page.evaluate(id => { const i = window.INPUTS.find(x => (x.iid || x.id) === id); return i ? (i.acc || 'fresh') : 'GONE' }, id)
async function fileReq(page, { person, type = 'Meeting', from = '2026-07-13', to, remarks }) {
  const f = await W4.fileInput(page, { person, type, from, to: to || from, span: 'all', remarks })
  await toasts(page)
  /* found by its remarks: the Inputs list is kept in date order, so the newest request is not the last one (the D114
     walk's step 9 does the same) */
  const id = await page.evaluate(r => { const x = window.INPUTS.find(y => y.remarks === r); return x ? (x.iid || x.id) : null }, remarks)
  note('filed', `${type} "${remarks}" → ${f.added} added, id ${id}, said "${f.toast}"`)
  return id
}
async function pubOnBoard(page, di) {
  await board(page, di)
  const sg = await signDay(page, di, 0)
  const p = await publishDay(page, di)
  await toasts(page)
  return { sg, p, h: await head(page, di) }
}
async function xRow(page, di, id) {
  await board(page, di)
  const ri = await rowIx(page, di, id)
  const x = page.locator(`#schedBoard [data-grdel="${di}.${ri}"]:visible`).first()
  if (ri < 0 || !(await x.count())) return 'NO ✕'
  await x.evaluate(e => e.scrollIntoView({ block: 'center' })); await x.click(); await page.waitForTimeout(700)
  if ((await rowIx(page, di, id)) >= 0 && await x.count()) { await x.click(); await page.waitForTimeout(700) }   // a two-tap ✕
  return (await toasts(page)).join(' / ')
}
/* a request's own button in the board's Personal Inputs group: 'g' Accept / → Ground, 'u' → Unavail, 'x' Undo */
async function reqButton(page, di, id, dest) {
  await board(page, di); await openInputs(page, di)
  const b = page.locator(`#schedBoard [data-acc="${dest}"][data-acck="${id}"]:visible`).first()
  if (!(await b.count())) return 'NO BUTTON'
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await page.waitForTimeout(700)
  return (await toasts(page)).join(' / ')
}
/* every count a person can read for day di: the week head, the board strip, both ⓘ panels, the Amendments panel,
   the working-copy marker, the sign-off line */
async function counts(page, di) {
  const c = {}
  await editWeek(page)
  const hw = await head(page, di); c.week = norm(hw.pending); c.weekNys = hw.nys
  const iw = await W1.dayInfo(page, di, 'week'); c.infoWeek = iw.pend || '(none)'; await W1.closeDayInfo(page)
  const P = await panel(page)
  const dow = ['Mon', 'Tue'][di]
  c.panel = P.visible ? ((P.days.find(d => (d.text || '').startsWith(dow)) || {}).text || '(not listed)') : '(no panel at this width)'
  await board(page, di)
  const hb = await head(page, di); c.board = norm(hb.pending); c.boardNys = hb.nys; c.signLine = norm(hb.signState)
  const ib = await W1.dayInfo(page, di, 'board'); c.infoBoard = ib.pend || '(none)'; await W1.closeDayInfo(page)
  return c
}
function agree(id, c, want, what) {
  const n = { week: num(c.week), board: num(c.board), infoWeek: num(c.infoWeek), infoBoard: num(c.infoBoard) }
  const pm = /· (\d+) change/.exec(c.panel || ''); if (!/no panel/.test(c.panel)) n.panel = pm ? +pm[1] : 0
  const bad = Object.entries(n).filter(([, v]) => v !== want)
  check(id, !bad.length, `${what}: every count reads ${want}` + (bad.length ? ` — DISAGREE: ${bad.map(([k, v]) => k + '=' + v).join(', ')}` : '') + ` · ${JSON.stringify(c)}`)
}
/* the four sign-off boxes as the board shows them — a signature the day moved out from under shows blank (signShown) */
const signVals = (page, di) => page.evaluate(di => [...document.querySelectorAll(`#schedBoard select[data-signday="${di}"]`)].filter(s => s.offsetWidth || s.offsetHeight).map(s => (s.options[s.selectedIndex] || {}).text || ''), di)

/* =============================== A — D174 =============================== */
async function worldA() {
  const { browser, page, errors, CS } = await world()
  try {
    const pub = await pubOnBoard(page, MON)
    check('A0 publish', pub.p.pressed && /ORIG/.test(pub.h.tag) && !num(pub.h.pending), `Monday published: tag "${pub.h.tag}"`)
    const sg = await signDay(page, MON, 0)                                   // the four signed again, nothing waiting
    const s0 = norm((await head(page, MON)).signState), v0 = await signVals(page, MON)
    note('A0 signed with nothing waiting', `${JSON.stringify(sg)} → boxes ${JSON.stringify(v0)}, sign line "${s0}"`)
    await shotUnion(page, 'A0-signed', ['#sbSignBar'])
    const who = 'bane'
    const id = await fileReq(page, { person: who, remarks: 'D174 WALK' })
    const c1 = await counts(page, MON)
    agree('A1 filed → 1', c1, 1, `${CS[who]}'s Meeting filed on the published Monday (it lands on the working copy)`)
    const v1 = await signVals(page, MON)
    check('A1 the four fall (D103)', v1.every(x => !x || /—|sign/i.test(x)) && /to sign/.test(c1.signLine), `boxes ${JSON.stringify(v1)}, sign line "${c1.signLine}"`)
    note('A1 request', `acc ${await accOf(page, id)}, row on Monday at ${await rowIx(page, MON, id)}`)
    await shotUnion(page, 'A1-filed-board', ['#sbSignBar'])
    const said = await xRow(page, MON, id)
    note('A2 ✕', `said "${said}"; request ${await accOf(page, id)}, row at ${await rowIx(page, MON, id)}`)
    const c2 = await counts(page, MON)
    agree('A2 ✕ → 0 everywhere (D174)', c2, 0, '✕ on its row')
    check('A2 no working-copy marker', !c2.weekNys && !c2.boardNys, `week ${c2.weekNys}, board ${c2.boardNys}`)
    const v2 = await signVals(page, MON)
    check('A2 the four hold (AM11)', v0.length === 4 && JSON.stringify(v2) === JSON.stringify(v0) && c2.signLine === s0, `boxes ${JSON.stringify(v2)} (signed: ${JSON.stringify(v0)}), sign line "${c2.signLine}"`)
    check('A2 the request stays silenced (26 Aug 26)', (await accOf(page, id)) === 'r', await accOf(page, id))
    await shotUnion(page, 'A2-after-x-board', ['#sbSignBar'])
    await openInputs(page, MON)
    const dorm = await page.evaluate(id => { const b = document.querySelector(`#schedBoard [data-acc="g"][data-acck="${id}"]`); const r = b && b.closest('.inp-dorm,.sb-arow,.sbi-row'); return { accept: !!b, dorm: !!(b && b.closest('.inp-dorm')), text: r ? r.innerText.replace(/\s+/g, ' ').slice(0, 80) : '' } }, id)
    check('A2 in Personal Inputs, dormant, with Accept', dorm.accept, JSON.stringify(dorm))
    await screen(page, 'A2-personal-inputs')
    await closeBoard(page)
    await go(page, 'viewsched'); await page.waitForTimeout(600)
    const v = await viewDay(page, MON)
    check('A2 View-only Sched: Monday as published, nothing pending', v && /ORIG/.test(v.tag) && !v.pend && !v.nys, JSON.stringify(v).slice(0, 300))
    await screen(page, 'A2-view-only')
    /* A3 — the load of the current version: nothing to discard, nothing left out → "already at"; the request stays */
    await editWeek(page); await board(page, MON)
    if (await lookAt(page, MON, /ORIG|Original/)) {
      const bar = await pvBar(page, MON)
      check('A3 no confirm', bar && !/Discard/.test(bar.load || ''), JSON.stringify(bar))
      await pvTap(page, MON, 'data-restore')
      const t3 = (await toasts(page)).join(' / ')
      check('A3 the load keeps it taken off', (await accOf(page, id)) === 'r', `said "${t3}", request ${await accOf(page, id)}`)
      if (await pvBar(page, MON)) await pvTap(page, MON, 'data-golive')
    } else check('A3 look at Original', false, 'the plans menu had no Original row')
    /* A4 — Accept again → 1; ✕ → 0; Undo → 1; Redo → 0 */
    await reqButton(page, MON, id, 'g')
    agree('A4 Accept again → 1', await counts(page, MON), 1, 'Accept after ✕')
    await xRow(page, MON, id)
    agree('A4 ✕ again → 0', await counts(page, MON), 0, '✕ again')
    await editWeek(page); await page.locator('#undoBtn').click(); await page.waitForTimeout(800)
    check('A4 Undo → 1', num((await head(page, MON)).pending) === 1, norm((await head(page, MON)).pending))
    await page.locator('#redoBtn').click(); await page.waitForTimeout(800)
    check('A4 Redo → 0', !num((await head(page, MON)).pending), norm((await head(page, MON)).pending))
    /* A5 — an Other request: → Unavail → 1, Undo → 0 */
    /* an Other request lands on the programme by itself (16 Sep 26); "→ Unavail" is offered once it is taken off */
    const id5 = await fileReq(page, { person: 'stiff', type: 'Other', remarks: 'D174 WALK OTHER' })
    note('A5 filed Other', `acc ${await accOf(page, id5)}; head "${norm((await head(page, MON)).pending)}"`)
    await reqButton(page, MON, id5, 'x')
    agree('A5 its Undo → 0 (D174)', await counts(page, MON), 0, 'the Other request taken off')
    const u = await reqButton(page, MON, id5, 'u')
    check('A5 the → Unavail door', (await accOf(page, id5)) === 'u', `said "${u}", request ${await accOf(page, id5)}`)
    const c5a = await counts(page, MON)
    agree('A5 → Unavail → 1', c5a, 1, `filed under Unavailable ("${u}")`)
    await reqButton(page, MON, id5, 'x')
    agree('A5 Undo → 0 (D174)', await counts(page, MON), 0, 'taken back out of Unavailable')
    check('A5 dormant', (await accOf(page, id5)) === 'r', await accOf(page, id5))
    await shotUnion(page, 'A5-after', ['#sbSignBar'])
  } catch (e) { check('A CRASH', false, String(e && e.stack || e)) }
  ALL_ERRORS.push(...errors.map(e => 'A: ' + e))
  await browser.close()
}

/* =============================== B — D175, the load =============================== */
async function twoDaySetup(page, CS, tag) {
  const id = await fileReq(page, { person: 'bane', from: '2026-07-13', to: '2026-07-14', remarks: 'D175 WALK ' + tag })
  check(`${tag}0 lands on Monday`, JSON.stringify(await rowsOf(page, id)) === '[0]', `rows on ${JSON.stringify(await rowsOf(page, id))}, acc ${await accOf(page, id)}`)
  return id
}
async function worldB() {
  const { browser, page, errors, CS } = await world()
  try {
    const id = await twoDaySetup(page, CS, 'B')
    await pubOnBoard(page, MON); await pubOnBoard(page, TUE)
    await xRow(page, MON, id)
    const acc = await reqButton(page, TUE, id, 'g')
    check('B1 accepted onto Tuesday', JSON.stringify(await rowsOf(page, id)) === '[1]', `said "${acc}"; rows on ${JSON.stringify(await rowsOf(page, id))}`)
    const mon0 = await counts(page, MON), tue0 = await counts(page, TUE)
    note('B1 counts before the load', `Mon ${JSON.stringify(mon0)} · Tue ${JSON.stringify(tue0)}`)
    await board(page, MON)
    if (!(await lookAt(page, MON, /ORIG|Original/))) { check('B2 look at Original', false, 'no Original row'); throw new Error('no preview') }
    const bar = await pvBar(page, MON)
    await shotUnion(page, 'B2-preview-bar', ['#schedBoard .dprev-bar'])
    check('B2 nothing to discard: one tap, no confirm', bar && /Load onto working copy/.test(bar.load || '') && !/Discard/.test(bar.load || ''), JSON.stringify(bar))
    await pvTap(page, MON, 'data-restore')
    const said = (await toasts(page)).join(' / ')
    await screen(page, 'B2-after-load')
    const rows = await rowsOf(page, id)
    check('B2 one request, one row — on Tuesday', JSON.stringify(rows) === '[1]', `rows on ${JSON.stringify(rows)}`)
    check('B2 the load says which and where', new RegExp(`${CS.bane} · Meeting left out — it is on Tuesday's programme`).test(said), `said "${said}"`)
    check('B2 still on the programme', (await accOf(page, id)) === 'g', await accOf(page, id))
    const mon1 = await counts(page, MON), tue1 = await counts(page, TUE)
    check('B2 Monday unchanged by the load', num(mon1.week) === num(mon0.week) && num(mon1.board) === num(mon0.board), `before ${mon0.week}, after ${mon1.week}`)
    check('B2 Tuesday untouched (AM1)', num(tue1.week) === num(tue0.week) && num(tue1.board) === num(tue0.board), `before ${tue0.week}, after ${tue1.week}`)
    /* the sentence is in Edit history too */
    await editWeek(page)
    const hb = page.locator('#histBtn:visible').first()
    if (await hb.count()) {
      await hb.click(); await page.waitForTimeout(600)
      const ht = await page.evaluate(() => { const m = document.querySelector('#histModal, .hist-modal, [data-histlist]'); return m ? m.innerText.replace(/\s+/g, ' ') : document.body.innerText.includes('left out — it is on') ? 'BODY HAS IT' : '' })
      check('B2 Edit history carries it', /left out — it is on Tuesday/.test(ht) || ht === 'BODY HAS IT', ht.slice(0, 240))
      await screen(page, 'B2-history')
      await page.locator('#histClose').click(); await page.waitForTimeout(300)
    } else note('B2 Edit history', 'no History button on this width')
    /* ✕ on the one row → none left; each day one change */
    await xRow(page, TUE, id)
    const rows3 = await rowsOf(page, id)
    const m3 = await counts(page, MON), t3 = await counts(page, TUE)
    check('B3 ✕ on Tuesday: no row anywhere', JSON.stringify(rows3) === '[]', JSON.stringify(rows3))
    check('B3 Monday 1, Tuesday 1 — never the orphan\'s 2', num(m3.week) === 1 && num(t3.week) === 1, `Mon "${m3.week}", Tue "${t3.week}"`)
    await editWeek(page)
    await screen(page, 'B3-week-after-x')
    /* Undo / Redo through the top bar (Fable S10): never two rows at any step */
    const seen = []
    for (const k of ['undo', 'undo', 'redo', 'redo']) {
      await editWeek(page); await page.locator(`#${k}Btn`).click(); await page.waitForTimeout(800)
      seen.push(`${k}: rows ${JSON.stringify(await rowsOf(page, id))}`)
    }
    check('B4 Undo / Redo of the ✕ and of the load — never two rows', seen.every(x => !/\[\d,\d/.test(x)), seen.join(' · '))
  } catch (e) { check('B CRASH', false, String(e && e.stack || e)) }
  ALL_ERRORS.push(...errors.map(e => 'B: ' + e))
  await browser.close()
}

/* =============================== C — D175, the plan switch =============================== */
async function worldC() {
  const { browser, page, errors, CS } = await world()
  try {
    const id = await twoDaySetup(page, CS, 'C')
    await pubOnBoard(page, MON); await pubOnBoard(page, TUE)
    await board(page, MON)
    check('C1 + Alt Plan', await altPlan(page, MON), 'the plans menu\'s + Alt Plan')
    await toasts(page)
    const names = await page.evaluate(() => (window.SCHED.drafts[0] || []).map(d => d.name + (window.SCHED.curDraft[0] === d.id ? '*' : '')))
    note('C1 plans', JSON.stringify(names))
    await xRow(page, MON, id)
    await reqButton(page, TUE, id, 'g')
    check('C2 on Tuesday now', JSON.stringify(await rowsOf(page, id)) === '[1]', JSON.stringify(await rowsOf(page, id)))
    const tue0 = await counts(page, TUE)
    await board(page, MON)
    const parked = names.find(n => !n.endsWith('*')) || 'Plan A'
    check('C3 switch to the parked plan', await switchTo(page, MON, new RegExp(parked.replace('*', ''))), parked)
    const said = (await toasts(page)).join(' / ')
    await screen(page, 'C3-after-switch')
    check('C3 one request, one row — on Tuesday', JSON.stringify(await rowsOf(page, id)) === '[1]', JSON.stringify(await rowsOf(page, id)))
    check('C3 the switch says which and where', new RegExp(`${CS.bane} · Meeting left out — it is on Tuesday's programme`).test(said), `said "${said}"`)
    check('C3 and still says what is pending', /difference|matches/.test(said), said)
    const mon = await counts(page, MON), tue = await counts(page, TUE)
    check('C3 Monday reads the removal', num(mon.week) === 1, `Mon "${mon.week}"`)
    check('C3 Tuesday untouched', num(tue.week) === num(tue0.week), `before "${tue0.week}", after "${tue.week}"`)
    await editWeek(page)
    await screen(page, 'C3-week')
  } catch (e) { check('C CRASH', false, String(e && e.stack || e)) }
  ALL_ERRORS.push(...errors.map(e => 'C: ' + e))
  await browser.close()
}

await worldA()
await worldB()
await worldC()
check('errors', !ALL_ERRORS.length, ALL_ERRORS.length ? ALL_ERRORS.slice(0, 6).join(' | ') : 'the browser error list stayed empty in all three worlds')
summary(`req-one-row-${W}`)
