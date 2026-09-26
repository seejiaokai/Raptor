/* [LEAVE-LATE-PUBLISHED]'s FULL check — the WALK (26 Sep 26, overnight D181; evidence docs/handpass/2026-09-26-late-pub.md).
   D177 / D178 / D179: a published day keeps what it went out with; a member's input change after publishing waits for
   the admin. Written as assertions of the RIGHT behaviour — a PASS means correct, and re-running it IS the re-walk.
   Each world is a fresh demo, made through the app's own controls: the board's sign-off selects and Publish, the Inputs
   page's form and its ✕, the edit week's in-place remarks cell on an Unavailable row, "Publish AL", View-only Sched.
     A  D177 — a leave filed on a published Monday: every count 1, the four fall, the pending list says "filed", the
        published face (View-only Sched) does not show it, the working copy does; deleted again → 0 and the four stand
     B  D178 — an ISSUED leave (Taipan's OL, Wednesday) edited in place after publishing: 1, the list names the change,
        the face keeps the old words; "Publish AL1" takes it in → the face shows the new words, 0 pending
     C  D179 — a downchit filed after publishing for a man flying Monday: the working copy's ring and row, none on the
        published face; 1 pending
   Usage (from raptor-port/, a preview on 4173): node scripts/handpass/am/late-pub-walk.mjs [desktop|phone]
   HP_REWALK=<folder> sends the pictures to a re-walk folder, so the first walk's stay as evidence. */
const W = process.argv[2] || 'desktop'
process.env.HP_SHOTS = process.env.HP_REWALK
  ? `${process.env.HP_REWALK}/${W}`
  : `C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-26-late-pub/${W}`
const L = await import('./w2-lib.mjs')
const W1 = await import('./w1-lib.mjs')
const W4 = await import('./w4-lib.mjs')
const { openHi, editWeek, board, signDay, publishDay, head, go, check, note, summary, screen } = L
const { toastSpy, toasts, panel, shotUnion, norm } = W1
const PHONE = W === 'phone'
const SIZE = PHONE ? { width: 390, height: 844 } : { width: 1440, height: 900 }
const MON = 0, WED = 2
const num = s => { const m = /(\d+)/.exec(String(s || '')); return m ? +m[1] : 0 }
const ALL_ERRORS = []

async function world() {
  const w = await openHi({ ...SIZE, dpr: PHONE ? 3 : 1, state: null })
  await toastSpy(w.page)
  w.CS = await w.page.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, p]) => [k, p.cs])))
  return w
}
async function pubOnBoard(page, di) {
  await board(page, di)
  const sg = await signDay(page, di, 0)
  const p = await publishDay(page, di)
  await toasts(page)
  return { sg, p, h: await head(page, di) }
}
/* every count a person can read for day di: the week head, the board strip, both ⓘ panels, the Amendments panel */
async function counts(page, di) {
  const c = {}
  await editWeek(page)
  const hw = await head(page, di); c.week = norm(hw.pending); c.weekNys = hw.nys
  const iw = await W1.dayInfo(page, di, 'week'); c.infoWeek = iw.pend || '(none)'; await W1.closeDayInfo(page)
  const P = await panel(page)
  const dow = ['Mon', 'Tue', 'Wed'][di]
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
const signVals = (page, di) => page.evaluate(di => [...document.querySelectorAll(`#schedBoard select[data-signday="${di}"]`)].filter(s => s.offsetWidth || s.offsetHeight).map(s => (s.options[s.selectedIndex] || {}).text || ''), di)
/* the pending list, opened from the edit week's day head, read, pictured, closed */
async function pendList(page, di, shot) {
  await editWeek(page)
  const b = page.locator(`#eWeek .day[data-day="${di}"] [data-pendlist="${di}"]:visible`).first()
  if (!(await b.count())) return '(no pending button)'
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await page.waitForTimeout(400)
  const t = await page.evaluate(() => { const p = document.querySelector('#pendList'); return p ? p.innerText.replace(/\s+/g, ' ').trim() : '(closed)' })
  if (shot) await shotUnion(page, shot, ['#pendList'])
  await page.keyboard.press('Escape'); await page.waitForTimeout(200)
  return t
}
/* a day's text as View-only Sched's published face shows it, and its picture */
async function faceText(page, di, shot) {
  await go(page, 'viewsched'); await page.waitForTimeout(400)
  const sel = `#vWeek .day[data-day="${di}"]`
  const t = await page.evaluate(s => { const d = document.querySelector(s); return d ? d.innerText.replace(/\s+/g, ' ') : '(no day)' }, sel)
  if (shot) {
    await page.locator(sel).first().evaluate(e => e.scrollIntoView({ block: 'start' })); await page.waitForTimeout(200); await screen(page, shot)
    /* …and the day's Unavailable list, close up — where a late leave would show */
    if (await page.locator(`${sel} .sec-unav`).count()) await shotUnion(page, shot + '-unavail', [`${sel} .sec-unav`])
  }
  return t
}
async function weekText(page, di) {
  await editWeek(page)
  return page.evaluate(i => { const d = document.querySelector(`#eWeek .day[data-day="${i}"]`); return d ? d.innerText.replace(/\s+/g, ' ') : '(no day)' }, di)
}
/* delete an input on the Inputs page by its remarks (its row's own ✕) */
async function deleteInput(page, remarks) {
  await go(page, 'inputs'); await page.waitForTimeout(300)
  const inx = await page.evaluate(r => window.INPUTS.findIndex(x => x.remarks === r), remarks)
  const x = page.locator(`.rmx[data-inx="${inx}"]:visible`).first()
  if (inx < 0 || !(await x.count())) return 'NO ✕'
  await x.evaluate(e => e.scrollIntoView({ block: 'center' })); await x.click(); await page.waitForTimeout(600)
  const ok = page.getByRole('button', { name: /^(Delete|Yes|OK)/ }).first()
  if (await ok.count() && await ok.isVisible().catch(() => false)) { await ok.click(); await page.waitForTimeout(500) }
  return (await toasts(page)).join(' / ')
}

/* =============================== A — D177, a late leave =============================== */
async function worldA() {
  const { browser, page, errors, CS } = await world()
  try {
    const pub = await pubOnBoard(page, MON)
    check('A0 publish', pub.p.pressed && /ORIG/.test(pub.h.tag) && !num(pub.h.pending), `Monday published: tag "${pub.h.tag}"`)
    const sg = await signDay(page, MON, 0)
    const v0 = await signVals(page, MON)
    note('A0 signed again, nothing waiting', `${JSON.stringify(sg)} → ${JSON.stringify(v0)}`)
    const f0 = await faceText(page, MON, 'A0-face-before')
    const who = 'bane'
    const f = await W4.fileInput(page, { person: who, type: 'LL', from: '2026-07-13', to: '2026-07-13', span: 'all', remarks: 'LATE LEAVE WALK' })
    await toasts(page)
    note('A1 filed', `LL for ${CS[who]} on Monday: ${f.added} added, said "${f.toast}"`)
    const c1 = await counts(page, MON)
    agree('A1 filed → 1 everywhere (D177)', c1, 1, `${CS[who]}'s leave filed after Monday was published`)
    const v1 = await signVals(page, MON)
    check('A1 the four fall (D103)', v1.every(x => !x || /—|sign/i.test(x)) && /to sign/.test(c1.signLine), `boxes ${JSON.stringify(v1)}, sign line "${c1.signLine}"`)
    await shotUnion(page, 'A1-board-signbar', ['#sbSignBar'])
    const list = await pendList(page, MON, 'A1-pending-list')
    check('A1 the list names it: filed', /filed/i.test(list) && new RegExp(CS[who], 'i').test(list), `"${list}"`)
    const wk = await weekText(page, MON)
    check('A1 the working copy shows the leave', /LATE LEAVE WALK/.test(wk), 'edit week Monday carries the row')
    await shotUnion(page, 'A1-week-unavail', [`#eWeek .day[data-day="${MON}"] .sec-unav`])
    const f1 = await faceText(page, MON, 'A1-face-after')
    check('A1 the published face does NOT show it (D177)', !/LATE LEAVE WALK/.test(f1), 'View-only Sched Monday unchanged by the filing')
    check('A1 the published face is the same text as before', f1 === f0, f1 === f0 ? 'byte-for-byte' : 'DIFFERS')
    /* back off through the top bar's Undo — the member's own way back (D148); the Inputs page lists only upcoming
       inputs by default, and the demo week is in the past by today's clock */
    await editWeek(page)
    const u0 = await L.undoLabel(page)
    const ub = page.locator('#undoBtn:visible').first()
    if (await ub.count()) { await ub.click(); await page.waitForTimeout(700) }
    const said = (await toasts(page)).join(' / ')
    const gone = await page.evaluate(() => !window.INPUTS.some(x => x.remarks === 'LATE LEAVE WALK'))
    note('A2 Undo', `the button read "${u0}", said "${said}"; the leave is ${gone ? 'gone' : 'STILL THERE'}`)
    const c2 = await counts(page, MON)
    agree('A2 deleted → 0 everywhere (D98)', c2, 0, 'the leave deleted again')
    await board(page, MON)
    const v2 = await signVals(page, MON)
    check('A2 the four stand again (AM11)', v0.length === 4 && JSON.stringify(v2) === JSON.stringify(v0), `boxes ${JSON.stringify(v2)} (signed: ${JSON.stringify(v0)})`)
    await shotUnion(page, 'A2-board-signbar', ['#sbSignBar'])
  } finally { ALL_ERRORS.push(...errors.map(e => 'A ' + e)); await browser.close() }
}

/* =============================== B — D178, an issued leave edited, then an AL =============================== */
async function worldB() {
  const { browser, page, errors, CS } = await world()
  try {
    const pub = await pubOnBoard(page, WED)
    check('B0 publish Wednesday', pub.p.pressed && /ORIG/.test(pub.h.tag), `tag "${pub.h.tag}"`)
    const iid = await page.evaluate(() => { const x = window.INPUTS.find(r => r.person === 'taipan' && r.type === 'OL'); return x ? x.iid : null })
    const f0 = await faceText(page, WED, 'B0-face-before')
    check('B0 the face shows the issued remark', /off island/i.test(f0), 'Taipan · OL "off island" on the published Wednesday')
    await board(page, WED)
    const cell = page.locator(`#schedBoard [data-ifld="${iid}.rmks"]:visible`).first()
    const has = await cell.count()
    note('B1 the in-place remarks cell', has ? 'found on the board\'s Unavailable row' : 'NOT FOUND')
    if (has) {
      await cell.evaluate(e => e.scrollIntoView({ block: 'center' }))
      await cell.fill('EDITED AFTER PUBLISH WALK'); await cell.press('Tab'); await page.waitForTimeout(600)
      await toasts(page)
    }
    const c1 = await counts(page, WED)
    agree('B1 edited → 1 everywhere (D178)', c1, 1, `${CS.taipan}'s issued OL, remarks edited`)
    const list = await pendList(page, WED, 'B1-pending-list')
    check('B1 the list names what moved', /EDITED AFTER PUBLISH WALK/.test(list), `"${list}"`)
    const f1 = await faceText(page, WED, 'B1-face-after-edit')
    check('B1 the face keeps the issued words', /off island/i.test(f1) && !/EDITED AFTER PUBLISH WALK/.test(f1), 'View-only Sched Wednesday unchanged')
    await board(page, WED)
    await signDay(page, WED, 0)
    const al = await L.publishAL(page, WED).catch(() => ({ pressed: false }))
    await toasts(page)
    const h2 = await head(page, WED)
    note('B2 Publish AL', `${JSON.stringify(al)} → tag "${h2.tag}", pending "${norm(h2.pending)}"`)
    const f2 = await faceText(page, WED, 'B2-face-after-AL')
    check('B2 AL1 takes it in: the face shows the new words', /EDITED AFTER PUBLISH WALK/.test(f2), 'View-only Sched Wednesday after AL1')
    const c2 = await counts(page, WED)
    agree('B2 after AL1 → 0 everywhere', c2, 0, 'the edit went out')
  } finally { ALL_ERRORS.push(...errors.map(e => 'B ' + e)); await browser.close() }
}

/* =============================== C — D179, a downchit after publishing =============================== */
async function worldC() {
  const { browser, page, errors, CS } = await world()
  try {
    const pub = await pubOnBoard(page, MON)
    check('C0 publish Monday', pub.p.pressed, `tag "${pub.h.tag}"`)
    const who = await page.evaluate(() => { const f = ((window.DAYS[0] || {}).waves || [])[0]?.formations?.[0]; return f ? (f.aircraft[0].p || f.aircraft[0].w) : null })
    const ring = (sel) => page.evaluate(([s, id]) => { const p = document.querySelector(`${s} .puck[data-person="${id}"]`); return p ? p.className : '(no puck)' }, [sel, who])
    await go(page, 'viewsched'); await page.waitForTimeout(300)
    const r0 = await ring(`#vWeek .day[data-day="0"]`)
    const f0 = await faceText(page, MON, 'C0-face-before')
    const f = await W4.fileInput(page, { person: who, type: 'ATT C', from: '2026-07-13', to: '2026-07-13', span: 'all', remarks: 'DOWN AFTER PUBLISH WALK' })
    await toasts(page)
    note('C1 downchit filed', `ATT C for ${CS[who]} (flying Monday's first line): ${f.added} added, asked ${JSON.stringify(f.asked)}, said "${f.toast}"`)
    const c1 = await counts(page, MON)
    agree('C1 filed → 1 everywhere (D179)', c1, 1, 'a downchit after publishing')
    await editWeek(page)
    const rw = await ring(`#eWeek .day[data-day="0"]`)
    check('C1 the working copy rings him', /hard|sev|ring|warn/.test(rw), `edit week puck: "${rw}"`)
    await shotUnion(page, 'C1-week-ring', [`#eWeek .day[data-day="0"] .puck[data-person="${who}"]`])
    const f1 = await faceText(page, MON, 'C1-face-after')
    const rv = await ring(`#vWeek .day[data-day="0"]`)
    check('C1 the published face shows no row and no new ring (D179)', !/DOWN AFTER PUBLISH WALK/.test(f1) && rv === r0 && f1 === f0, `face puck "${rv}" (before "${r0}"); the face's text ${f1 === f0 ? 'byte-for-byte as before' : 'DIFFERS'}`)
    const wk = await weekText(page, MON)
    check('C1 the working copy shows the downchit', /DOWN AFTER PUBLISH WALK/.test(wk), 'edit week Monday')
  } finally { ALL_ERRORS.push(...errors.map(e => 'C ' + e)); await browser.close() }
}

await worldA()
if (!PHONE) { await worldB(); await worldC() }
check('no console errors', !ALL_ERRORS.length, ALL_ERRORS.slice(0, 5).join(' | '))
process.exitCode = summary(`late-pub walk (${W})`) ? 1 : 0
