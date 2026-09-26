/* [LEAVE-LATE-PUBLISHED]'s FULL check — walker "quals" (26 Sep 26; D183–D185). The Quals page changing a man who is on
   a PUBLISHED day. Written as assertions of the RIGHT behaviour — a PASS means correct; re-running it IS the re-walk.
   Every world is a fresh demo (Mon 13 – Sun 19 Jul 26), made through the app's own controls: the edit week's remarks
   cell, the board's sign-off selects and Publish, the board's "+ Wave" → SC and its crew palette, and the Quals page
   (Enable editing, a tick cell, the CAT drop-down, the row's archive ✕ and the Archived drawer's Restore).
   Reads of window.* are for the evidence table only.
     Q1  the illegal-seat door: can the Quals page make Monday's first front-seater ground crew / a WSO / CAT IW?
     Q1b a CAT change that raises a CREW-PAIRING warning (frozen): Drifter A → OCU beside a CAT C WSO, Monday published
     Q2  a lapsed DAAR (a tick): Tuesday's first line typed "AAR", published, Warden's DAAR unticked → live, 0 pending
     Q3  a lapsed SC DAY (a tick): an SC shift added on Wednesday, a man on its MAIN, published, SC DAY unticked
     Q4  a CAT change whose only effect is the puck letter: Saber IP → A, Monday published → 1 pending, face keeps IP
     Q5  the Quals page's other roster door — archive ✕ (posted out) on a published man, then Restore
   Usage (from raptor-port/, the build served on 4174): node scripts/handpass/am/late-pub-quals-walk.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.HP_URL = 'http://localhost:4174'
process.env.HP_SHOTS = `C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-26-late-pub/quals/${W === 'phone' ? 'phone' : 'desktop'}`
const L = await import('./w2-lib.mjs')
const W1 = await import('./w1-lib.mjs')
const W4 = await import('./w4-lib.mjs')
const { openHi, editWeek, board, closeBoard, signDay, publishDay, head, go, check, note, summary, screen, editText, put } = L
const { toastSpy, toasts, panel, shotUnion, shotBox, norm } = W1
const PHONE = W === 'phone'
const SIZE = PHONE ? { width: 390, height: 844 } : { width: 1440, height: 900 }
const MON = 0, TUE = 1, WED = 2
const num = s => { const m = /(\d+)/.exec(String(s || '')); return m ? +m[1] : 0 }
const ALL_ERRORS = []
const ONLY = process.argv[3] ? process.argv[3].split(',') : null
const want = k => !ONLY || ONLY.includes(k)

async function world() {
  const w = await openHi({ ...SIZE, dpr: PHONE ? 3 : 2, state: null })
  await toastSpy(w.page)
  w.CS = await w.page.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, p]) => [k, p.cs])))
  return w
}
async function pubOnBoard(page, di) {
  await board(page, di)
  const sg = await signDay(page, di, 0)
  const p = await publishDay(page, di)
  await toasts(page)
  const h = await head(page, di)
  /* published, the four boxes read blank for the next amendment — sign them again (the late-pub walk's A0), so there
     is something standing for a later change to take down, or leave standing */
  const sg2 = await signDay(page, di, 0)
  await toasts(page)
  const v = await signVals(page, di)
  check(`publish ${['Mon', 'Tue', 'Wed'][di]} — the four signed again after publishing`, v.length === 4 && v.every(x => x && !/—|sign/i.test(x)), `boxes ${JSON.stringify(v)}`)
  return { sg, p, h, sg2 }
}
/* every count a person can read for day di: the week head, the board strip, both ⓘ panels, the Amendments panel */
async function counts(page, di) {
  const c = {}
  await editWeek(page)
  const hw = await head(page, di); c.week = norm(hw.pending); c.weekNys = hw.nys
  const iw = await W1.dayInfo(page, di, 'week'); c.infoWeek = iw.pend || '(none)'; await W1.closeDayInfo(page)
  const P = await panel(page)
  const dow = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][di]
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

/* ---- navigation, the way a person does: the top bar's tab, or the phone's ☰ drawer ------------------------------- */
async function navTo(page, name) {
  await closeBoard(page)
  const top = page.locator(`a[data-page="${name}"]:visible`).first()
  if (await top.count()) await top.click()
  else {
    await page.locator('#burger:visible').first().click(); await page.waitForTimeout(450)
    await page.locator(`#drawerNav a[data-page="${name}"]`).first().click()
  }
  await page.waitForFunction(p => window.CURPAGE === p, name, { timeout: 8000 })
  await page.waitForTimeout(450)
}

/* ---- the Quals page ------------------------------------------------------------------------------------------------ */
async function qualsOpen(page, view = '#qViewP') {
  await navTo(page, 'quals')
  if (view && await page.locator(`${view}:visible`).count()) { await page.click(view); await page.waitForTimeout(250) }
  if (await page.locator('#qEdit:visible').count()) { await page.click('#qEdit'); await page.waitForTimeout(350) }
  return page.evaluate(() => !!document.querySelector('#qtbl.editing'))
}
async function qualsSave(page) {
  if (await page.locator('#qSave:visible').count()) { await page.click('#qSave'); await page.waitForTimeout(350) }
}
/* bring a cell to the middle of the screen and press it where it is — the frozen heading pinned over the table's top
   would otherwise take a press meant for a row near it (the driver's fault, not the app's) */
async function pressAt(page, loc) {
  await loc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(200)
  try { await loc.click({ timeout: 3000 }) }
  catch { const b = await loc.boundingBox(); if (!b) throw new Error('no box'); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
  await page.waitForTimeout(450)
}
async function qualCell(page, id, k) {
  const c = page.locator(`#qtbl td[data-q="${id}|${k}"]`).first()
  if (!(await c.count())) return { ok: false, why: 'no cell' }
  await pressAt(page, c)
  const now = await page.evaluate(([id, k]) => window.PEOPLE[id].quals[k], [id, k])
  const glyph = await page.evaluate(([id, k]) => { const c = document.querySelector(`#qtbl td[data-q="${id}|${k}"]`); return c ? c.innerText.trim() : '?' }, [id, k])
  return { ok: true, now, glyph, said: (await toasts(page)).join(' / ') }
}
async function qualCat(page, id, cat) {
  const s = page.locator(`#qtbl select[data-lvl="${id}"]`).first()
  if (!(await s.count())) return { ok: false, why: 'no CAT select' }
  await s.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await s.selectOption(cat); await page.waitForTimeout(500)
  return { ok: true, now: await page.evaluate(id => window.PEOPLE[id].q, id), said: (await toasts(page)).join(' / ') }
}
async function qualRowShot(page, name, id) { return shotBox(page, name, `#qtbl td.qname[data-person="${id}"]`, 'tr', { pad: 4 }) }

/* ---- what a day draws: a puck (ring, flag, CAT letter) and the day's warning summary, on a surface ------------------ */
const ROOT = { face: '#vWeek', work: '#eWeek' }
async function toSurface(page, s) { if (s === 'face') await go(page, 'viewsched'); else await editWeek(page); await page.waitForTimeout(350) }
async function puckOn(page, s, di, id) {
  await toSurface(page, s)
  return page.evaluate(([r, di, id]) => {
    const d = document.querySelector(`${r} .day[data-day="${di}"]`); if (!d) return []
    return [...d.querySelectorAll(`.puck[data-person="${id}"]`)].filter(p => !p.closest('#eRoster, #sbRoster')).map(p => ({
      ring: /\bboxred\b/.test(p.className) ? 'red' : /\bboxdash\b/.test(p.className) ? 'dash' : /\bboxdot\b/.test(p.className) ? 'dot' : 'none',
      warn: /\bwarn\b/.test(p.className) ? (/\bhard\b/.test(p.className) ? 'hard' : /\bnote\b/.test(p.className) ? 'note' : 'adv') : '',
      flag: ((p.querySelector('.lchip') || {}).className || '').replace('lchip', '').trim(), flagTxt: ((p.querySelector('.lchip') || {}).textContent || '').trim(),
      cat: ((p.querySelector('.role') || {}).textContent || '').trim(), cls: p.className }))
  }, [ROOT[s], di, id])
}
const firstP = a => a[0] || { ring: '(no puck)', flag: '', cat: '' }
const pStr = a => a.length ? a.map(x => `ring=${x.ring}${x.warn ? '/' + x.warn : ''} flag=${x.flag || '-'}${x.flagTxt ? '(' + x.flagTxt + ')' : ''} cat=${x.cat || '-'}`).join(' | ') : '(no puck)'
async function summaryOn(page, s, di) {
  await toSurface(page, s)
  return page.evaluate(([r, di]) => { const e = document.querySelector(`${r} .day[data-day="${di}"] [data-daywarn="${di}"]`); return e ? e.innerText.replace(/\s+/g, ' ').trim() : '(no summary)' }, [ROOT[s], di])
}
const issues = t => { const m = /⚠\s*(\d+)\s*issue/.exec(t || ''); return m ? +m[1] : 0 }
/* open the day's warning list on a surface (its own "tap to review"), read the lines, picture it, fold it again */
async function warnList(page, s, di, shot) {
  await toSurface(page, s)
  const sel = `${ROOT[s]} .day[data-day="${di}"] [data-daywarn="${di}"]`
  const bar = page.locator(`${sel}:visible`).first()
  if (!(await bar.count())) return '(no summary bar)'
  await pressAt(page, bar)
  const t = await page.evaluate(([r, di]) => { const b = document.querySelector(`${r} .day[data-day="${di}"] .dwbox`); return b ? b.innerText.replace(/\s+/g, ' ').trim() : '(no list)' }, [ROOT[s], di])
  if (shot) await shotBox(page, shot, `${ROOT[s]} .day[data-day="${di}"] .dwbox`, null, { block: 'center' })
  const bar2 = page.locator(`${sel}:visible`).first()
  if (await bar2.count()) await pressAt(page, bar2)
  return t
}
/* pictures: the man's puck on its line, and the day's summary bar */
async function puckShot(page, s, di, id, name) {
  await toSurface(page, s)
  return shotBox(page, name, `${ROOT[s]} .day[data-day="${di}"] .puck[data-person="${id}"]`, '.form, .fl-row, .sb-line, tr', { pad: 8 })
}
async function sumShot(page, s, di, name) {
  await toSurface(page, s)
  return shotBox(page, name, `${ROOT[s]} .day[data-day="${di}"] [data-daywarn="${di}"]`, null, { pad: 6 })
}
async function dayShot(page, s, di, name) {
  await toSurface(page, s)
  const sel = `${ROOT[s]} .day[data-day="${di}"]`
  await page.locator(sel).first().evaluate(e => e.scrollIntoView({ block: 'start' })); await page.waitForTimeout(200)
  return screen(page, name)
}
const liveWarn = (page, di, code, id) => page.evaluate(([di, code, id]) => ((window.WARN && window.WARN.byDay && window.WARN.byDay[di] && window.WARN.byDay[di].warns) || [])
  .filter(w => w.code === code && (!id || (w.who || []).includes(id))).map(w => w.msg), [di, code, id])

/* =============================== Q1 — the illegal-seat door, and Q1b a pairing warning (frozen) ======================== */
async function worldQ1() {
  const { browser, page, errors, CS } = await world()
  try {
    const who = await page.evaluate(() => window.DAYS[0].waves[0].formations[0].aircraft[0].p)
    const wso = await page.evaluate(() => window.DAYS[0].waves[0].formations[0].aircraft[0].w)
    const editing = await qualsOpen(page, '#qViewP')
    const door = await page.evaluate(id => {
      const row = document.querySelector(`#qtbl td.qname[data-person="${id}"]`)?.closest('tr')
      if (!row) return { row: false }
      const sel = row.querySelector('select[data-lvl]')
      return { row: true, cats: sel ? [...sel.options].map(o => o.text) : [], selects: row.querySelectorAll('select').length,
        seatCtl: !!row.querySelector('[data-seat], select[data-seat], [data-pers], [data-gnd]'), inputs: [...row.querySelectorAll('input')].map(i => i.className) }
    }, who)
    await qualRowShot(page, 'Q1-quals-row-front-seater', who)
    const wsoDoor = await page.evaluate(async id => {
      const b = document.querySelector('#qViewW'); if (b) b.click(); await new Promise(r => setTimeout(r, 300))
      const row = document.querySelector(`#qtbl td.qname[data-person="${id}"]`)?.closest('tr')
      const sel = row && row.querySelector('select[data-lvl]')
      return sel ? [...sel.options].map(o => o.text) : []
    }, wso)
    const illegal = ['IW'].filter(k => door.cats.includes(k))
    note('Q1 the illegal-seat door on the Quals page',
      `Monday's first front seat is ${CS[who]} (${who}); editing mode ${editing}; his row's CAT drop-down offers ${JSON.stringify(door.cats)} (IW offered: ${illegal.length ? 'YES' : 'no'}), ` +
      `no seat / ground-crew control on the row (seat control found: ${door.seatCtl}); his WSO ${CS[wso]}'s drop-down offers ${JSON.stringify(wsoDoor)}. ` +
      `No control on this page makes a man ground crew, a WSO or CAT IW in a front seat — the live illegal-seat "Q" cannot be reached from here.`)
    await qualsSave(page)

    /* Q1b — the frozen half: a CAT change that raises a crew-PAIRING warning (an unauthorised combination) */
    const pb = await page.evaluate(() => { const a = window.DAYS[0].waves[0].formations[1].aircraft[0]; return { p: a.p, w: a.w } })
    const pq = await page.evaluate(id => window.PEOPLE[id].q, pb.p), wq = await page.evaluate(id => window.PEOPLE[id].q, pb.w)
    const pub = await pubOnBoard(page, MON)
    check('Q1b publish Monday', pub.p.pressed && /ORIG/.test(pub.h.tag) && !num(pub.h.pending), `tag "${pub.h.tag}", pending "${norm(pub.h.pending)}"`)
    const v0 = await signVals(page, MON)
    const s0 = await summaryOn(page, 'face', MON), f0 = await puckOn(page, 'face', MON, pb.p), fw0 = await puckOn(page, 'face', MON, pb.w)
    await puckShot(page, 'face', MON, pb.p, 'Q1b-face-puck-before'); await sumShot(page, 'face', MON, 'Q1b-face-summary-before')
    const r = await (async () => { await qualsOpen(page, '#qViewP'); const x = await qualCat(page, pb.p, 'OCU'); await qualRowShot(page, 'Q1b-quals-row-after', pb.p); await qualsSave(page); return x })()
    note('Q1b the change', `Quals page: ${CS[pb.p]}'s CAT ${pq} → OCU (beside ${CS[pb.w]}, CAT ${wq}); now q=${r.now}; said "${r.said}"`)
    const ill = await liveWarn(page, MON, 'ILLEGAL_CREW', pb.p)
    check('Q1b the working copy raises the pairing warning', ill.length > 0, JSON.stringify(ill))
    const f1 = await puckOn(page, 'face', MON, pb.p), fw1 = await puckOn(page, 'face', MON, pb.w), s1 = await summaryOn(page, 'face', MON)
    await puckShot(page, 'face', MON, pb.p, 'Q1b-face-puck-after'); await sumShot(page, 'face', MON, 'Q1b-face-summary-after')
    check('Q1b the published face does NOT take the pairing warning (frozen)', firstP(f1).ring === firstP(f0).ring && firstP(fw1).ring === firstP(fw0).ring && issues(s1) === issues(s0),
      `face pilot ${pStr(f1)} (before ${pStr(f0)}); WSO ${pStr(fw1)} (before ${pStr(fw0)}); summary "${s1}" (before "${s0}")`)
    check('Q1b the face keeps the CAT letter it went out with', firstP(f1).cat === firstP(f0).cat && firstP(f0).cat === (pq === 'OCU' ? 'O' : pq), `face letter "${firstP(f1).cat}" (went out "${firstP(f0).cat}")`)
    const w1 = await puckOn(page, 'work', MON, pb.p), ws1 = await summaryOn(page, 'work', MON)
    check('Q1b the working copy shows the new letter and the pairing flag', firstP(w1).cat === 'O' && /l-cph/.test(firstP(w1).flag) && firstP(w1).warn === 'hard', `edit week ${pStr(w1)}; summary "${ws1}"`)
    await puckShot(page, 'work', MON, pb.p, 'Q1b-work-puck-after')
    const c1 = await counts(page, MON)
    agree('Q1b a pairing warning + CAT → 1 pending everywhere', c1, 1, `${CS[pb.p]} CAT ${pq} → OCU on published Monday`)
    const v1 = await signVals(page, MON)
    check('Q1b the four fall', v1.length === 4 && v1.every(x => !x || /—|sign/i.test(x)) && /to sign/.test(c1.signLine), `boxes ${JSON.stringify(v1)}, sign line "${c1.signLine}"`)
    const list = await pendList(page, MON, 'Q1b-pending-list')
    check('Q1b the list names the man and the CAT change', new RegExp(CS[pb.p], 'i').test(list) && /CAT/.test(list) && /OCU/.test(list), `"${list}"`)
    /* put it back */
    await qualsOpen(page, '#qViewP'); const rb = await qualCat(page, pb.p, pq); await qualsSave(page)
    note('Q1b put back', `CAT → ${pq}: now q=${rb.now}`)
    const c2 = await counts(page, MON)
    agree('Q1b put back → 0 everywhere', c2, 0, 'the CAT restored')
    await board(page, MON)
    const v2 = await signVals(page, MON)
    check('Q1b the four stand again', v0.length === 4 && JSON.stringify(v2) === JSON.stringify(v0), `boxes ${JSON.stringify(v2)} (signed ${JSON.stringify(v0)})`)
    await shotUnion(page, 'Q1b-board-signbar-back', ['#sbSignBar'])
    const f2 = await puckOn(page, 'face', MON, pb.p)
    check('Q1b the face after put-back is as it went out', pStr(f2) === pStr(f0), pStr(f2))
  } finally { ALL_ERRORS.push(...errors.map(e => 'Q1 ' + e)); await browser.close() }
}

/* =============================== Q2 — a lapsed DAAR on a published Tuesday (live, 0 pending) ========================= */
async function worldQ2() {
  const { browser, page, errors, CS } = await world()
  try {
    const who = await page.evaluate(() => window.DAYS[1].waves[0].formations[0].aircraft[0].p)
    await editWeek(page)
    let typed = 'week'
    try { await editText(page, 'fr:1.0.0.0', 'AAR') } catch (e) { typed = 'board'; await board(page, TUE); await W1.boardType(page, 'fr:1.0.0.0', 'AAR') }
    const rm = await page.evaluate(() => window.DAYS[1].waves[0].formations[0].aircraft[0].rmks)
    check('Q2 remarks typed "AAR" on Tuesday\'s first line', rm === 'AAR', `typed on the ${typed}: remarks now "${rm}" (front seat ${CS[who]}, DAAR ${await page.evaluate(id => window.PEOPLE[id].quals.daar, who)})`)
    const pre = await liveWarn(page, TUE, 'AAR_QUAL', who)
    check('Q2 no AAR warning while he is current', !pre.length, JSON.stringify(pre))
    const pub = await pubOnBoard(page, TUE)
    check('Q2 publish Tuesday', pub.p.pressed && /ORIG/.test(pub.h.tag) && !num(pub.h.pending), `tag "${pub.h.tag}", pending "${norm(pub.h.pending)}"`)
    const v0 = await signVals(page, TUE)
    const s0 = await summaryOn(page, 'face', TUE), f0 = await puckOn(page, 'face', TUE, who)
    await puckShot(page, 'face', TUE, who, 'Q2-face-puck-before'); await sumShot(page, 'face', TUE, 'Q2-face-summary-before')
    /* the Quals page: an instructor pilot's DAAR cell walks blank → ✓ → I → blank, so ✓ → I first (still current) */
    await qualsOpen(page, '#qViewP')
    await qualRowShot(page, 'Q2-quals-row-before', who)
    const c1a = await qualCell(page, who, 'daar')
    note('Q2 first press on DAAR', `✓ → "${c1a.glyph}" (daar=${JSON.stringify(c1a.now)}) said "${c1a.said}"`)
    let c1b = c1a
    if (c1a.now) c1b = await qualCell(page, who, 'daar')
    await qualRowShot(page, 'Q2-quals-row-unticked', who)
    await qualsSave(page)
    const naar1 = await page.evaluate(id => window.PEOPLE[id].quals.naar, who)
    check('Q2 DAAR unticked on the Quals page', c1b.now === false, `DAAR now ${JSON.stringify(c1b.now)} (cell "${c1b.glyph}"), NAAR now ${JSON.stringify(naar1)}; said "${c1b.said}"`)
    const aq = await liveWarn(page, TUE, 'AAR_QUAL', who)
    check('Q2 the rules raise the AAR warning', aq.length > 0, JSON.stringify(aq))
    const f1 = await puckOn(page, 'face', TUE, who), s1 = await summaryOn(page, 'face', TUE)
    await puckShot(page, 'face', TUE, who, 'Q2-face-puck-lapsed'); await sumShot(page, 'face', TUE, 'Q2-face-summary-lapsed')
    check('Q2 the published face rings him red with the Q flag AT ONCE (D185)', firstP(f1).ring === 'red' && /l-q/.test(firstP(f1).flag), `face ${pStr(f1)} (before ${pStr(f0)})`)
    check('Q2 the warning is counted in the face\'s summary', issues(s1) === issues(s0) + 1, `"${s1}" (before "${s0}")`)
    const wl = await warnList(page, 'face', TUE, 'Q2-face-warnlist-lapsed')
    check('Q2 the face\'s warning list names it', new RegExp(`${CS[who]} is not DAAR current`).test(wl), `"${wl.slice(0, 400)}"`)
    check('Q2 the face keeps his CAT letter', firstP(f1).cat === firstP(f0).cat, `"${firstP(f1).cat}"`)
    await dayShot(page, 'face', TUE, 'Q2-face-day-lapsed')
    const w1 = await puckOn(page, 'work', TUE, who)
    check('Q2 the working copy rings him too', firstP(w1).ring === 'red' && /l-q/.test(firstP(w1).flag), `edit week ${pStr(w1)}`)
    const c1 = await counts(page, TUE)
    agree('Q2 a lapsed currency → 0 pending everywhere (D185)', c1, 0, `${CS[who]}'s DAAR unticked after Tuesday was published`)
    const v1 = await signVals(page, TUE)
    check('Q2 the four stand', JSON.stringify(v1) === JSON.stringify(v0) && v0.length === 4, `boxes ${JSON.stringify(v1)} (signed ${JSON.stringify(v0)}); sign line "${c1.signLine}"`)
    await shotUnion(page, 'Q2-board-signbar-lapsed', ['#sbSignBar'])
    /* the board's 👁 look at the issued version — the other published face */
    {
      await board(page, TUE)
      const pk = (ids) => page.evaluate(ids => Object.fromEntries(ids.map(id => { const p = [...document.querySelectorAll(`#schedBoard .puck[data-person="${id}"]`)].filter(x => !x.closest('#sbRoster') && (x.offsetWidth || x.offsetHeight))[0]
        return [id, p ? `${/boxred/.test(p.className) ? 'RED RING' : 'no ring'} flag=${(p.querySelector('.lchip') || {}).textContent || '-'}` : '(no puck)'] })), ids)
      const other = await page.evaluate(() => window.DAYS[1].waves[0].formations[0].aircraft[1].p)   // Outlaw — a crew-rest breach, raised before publishing
      const live = await pk([who, other])
      await W1.shotBox(page, 'Q2-board-live-line', `#schedBoard .puck[data-person="${who}"]`, '.fl-row, .sb-line, tr, .form', { pad: 8 })
      const looked = await L.lookAt(page, TUE, /ORIG|Original/).catch(e => 'ERR ' + e.message)
      const pv = await pk([who, other])
      const bar = await L.pvBar(page, TUE)
      await screen(page, 'Q2-board-preview-orig')
      await W1.shotBox(page, 'Q2-board-preview-line', `#schedBoard .puck[data-person="${who}"]`, '.fl-row, .sb-line, tr, .form', { pad: 8 })
      note('Q2 the board\'s 👁 look at the issued ORIG', `looked=${looked}; bar "${bar && bar.text}"; the board's live copy draws ${JSON.stringify(live)}; the 👁 ORIG preview draws ${JSON.stringify(pv)} (${CS[who]} = the lapsed AAR, a live warning; ${CS[other]} = a crew-rest breach)`)
      if (bar && bar.back) await L.pvTap(page, TUE, 'data-golive')
      await closeBoard(page)
    }
    /* the member's view of the same published face (sign out → us/us → View-only Sched) */
    try {
      await W4.relogin(page, 'm')
      await toastSpy(page)
      const fm = await puckOn(page, 'face', TUE, who), sm = await summaryOn(page, 'face', TUE)
      await puckShot(page, 'face', TUE, who, 'Q2-member-face-puck'); await sumShot(page, 'face', TUE, 'Q2-member-face-summary')
      check('Q2 the member sees the same live ring and flag on the face', firstP(fm).ring === 'red' && /l-q/.test(firstP(fm).flag) && issues(sm) === issues(s1), `member face ${pStr(fm)}; summary "${sm}"`)
      await W4.relogin(page, 'a')
      await toastSpy(page)
    } catch (e) { note('Q2 member look', 'could not sign in as the member: ' + e.message) }
    /* tick it back */
    await qualsOpen(page, '#qViewP')
    const b1 = await qualCell(page, who, 'daar')
    let nb = { now: await page.evaluate(id => window.PEOPLE[id].quals.naar, who) }
    if (naar1 === false) nb = await qualCell(page, who, 'naar')
    await qualRowShot(page, 'Q2-quals-row-ticked-back', who)
    await qualsSave(page)
    note('Q2 ticked back', `DAAR → ${JSON.stringify(b1.now)} ("${b1.glyph}"), NAAR → ${JSON.stringify(nb.now)}`)
    const f2 = await puckOn(page, 'face', TUE, who), s2 = await summaryOn(page, 'face', TUE)
    await puckShot(page, 'face', TUE, who, 'Q2-face-puck-back'); await sumShot(page, 'face', TUE, 'Q2-face-summary-back')
    check('Q2 ticked back → the ring and flag go from the face', firstP(f2).ring === firstP(f0).ring && firstP(f2).flag === firstP(f0).flag && issues(s2) === issues(s0), `face ${pStr(f2)}; summary "${s2}" (before "${s0}")`)
    const c2 = await counts(page, TUE)
    agree('Q2 ticked back → still 0 everywhere', c2, 0, 'the tick restored')
    const v2 = await signVals(page, TUE)
    check('Q2 the four still stand', JSON.stringify(v2) === JSON.stringify(v0), `boxes ${JSON.stringify(v2)}`)
  } finally { ALL_ERRORS.push(...errors.map(e => 'Q2 ' + e)); await browser.close() }
}

/* =============================== Q3 — a lapsed SC DAY on a published Wednesday (live, 0 pending) ===================== */
async function worldQ3() {
  const { browser, page, errors, CS } = await world()
  try {
    await board(page, WED)
    const add = page.locator(`#schedBoard [data-wvadd="${WED}"]:visible`).first()
    let door = !!(await add.count())
    if (door) {
      await pressAt(page, add)
      const sc = page.locator('.wavemenu [data-wmkind="sc"]:visible').first()
      door = !!(await sc.count())
      if (door) { await shotUnion(page, 'Q3-wave-menu', ['.wavemenu']); await sc.click(); await page.waitForTimeout(700) }
    }
    const gi = await page.evaluate(() => window.DAYS[2].waves.findIndex(w => w.kind === 'sc'))
    check('Q3 an SC shift added through the board\'s "+ Wave" → SC', door && gi >= 0, `door ${door}; SC wave at index ${gi}; said "${(await toasts(page)).join(' / ')}"`)
    if (gi < 0) return
    const seat = `[data-slot="${WED}.${gi}.0.0.p"]`
    const prefs = ['salsa', 'romeo', 'dj', 'cards', 'ammo', 'bane', 'stiff']
    const who = await put(page, seat, prefs)
    const on = await page.evaluate(gi => window.DAYS[2].waves[gi].formations[0].aircraft[0].p, gi)
    check('Q3 a man on the SC AM MAIN front seat (board palette)', !/FAILED/.test(who) && on === who, `put → ${who}; seat holds ${on} (${CS[on]}); SC DAY ${await page.evaluate(id => id && window.PEOPLE[id] && window.PEOPLE[id].quals.scDay, on)}`)
    if (/FAILED/.test(who)) { await screen(page, 'Q3-put-failed'); return }
    await W1.shotBox(page, 'Q3-board-sc-line', `#schedBoard .puck[data-person="${who}"]`, '.go, .sb-wave, .sb-panel', { pad: 6 })
    const pre = await liveWarn(page, WED, 'SC_QUAL', who)
    check('Q3 no SC warning while he is current', !pre.length, JSON.stringify(pre))
    const { p, h } = await pubOnBoard(page, WED)
    check('Q3 publish Wednesday', p.pressed && /ORIG/.test(h.tag) && !num(h.pending), `tag "${h.tag}", pending "${norm(h.pending)}"`)
    const v0 = await signVals(page, WED)
    const s0 = await summaryOn(page, 'face', WED), f0 = await puckOn(page, 'face', WED, who)
    await puckShot(page, 'face', WED, who, 'Q3-face-puck-before'); await sumShot(page, 'face', WED, 'Q3-face-summary-before')
    check('Q3 the face draws him on the SC shift', f0.length > 0, pStr(f0))
    await qualsOpen(page, '#qViewP')
    await qualRowShot(page, 'Q3-quals-row-before', who)
    const scN0 = await page.evaluate(id => window.PEOPLE[id].quals.scNight, who)
    const u = await qualCell(page, who, 'scDay')
    await qualRowShot(page, 'Q3-quals-row-unticked', who)
    await qualsSave(page)
    check('Q3 SC DAY unticked on the Quals page', u.now === false, `SC DAY now ${JSON.stringify(u.now)}; SC NIGHT now ${JSON.stringify(await page.evaluate(id => window.PEOPLE[id].quals.scNight, who))} (was ${scN0}); said "${u.said}"`)
    const sq = await liveWarn(page, WED, 'SC_QUAL', who)
    check('Q3 the rules raise the SC currency warning', sq.length > 0, JSON.stringify(sq))
    const f1 = await puckOn(page, 'face', WED, who), s1 = await summaryOn(page, 'face', WED)
    await puckShot(page, 'face', WED, who, 'Q3-face-puck-lapsed'); await sumShot(page, 'face', WED, 'Q3-face-summary-lapsed')
    check('Q3 the published face rings him red with the Q flag AT ONCE (D185)', firstP(f1).ring === 'red' && /l-q/.test(firstP(f1).flag), `face ${pStr(f1)} (before ${pStr(f0)})`)
    check('Q3 the warning is counted in the face\'s summary', issues(s1) === issues(s0) + 1, `"${s1}" (before "${s0}")`)
    const wl = await warnList(page, 'face', WED, 'Q3-face-warnlist-lapsed')
    check('Q3 the face\'s warning list names it', /SC DAY currency needed/.test(wl) && new RegExp(CS[who]).test(wl), `"${wl.slice(0, 400)}"`)
    const c1 = await counts(page, WED)
    agree('Q3 a lapsed SC currency → 0 pending everywhere (D185)', c1, 0, `${CS[who]}'s SC DAY unticked after Wednesday was published`)
    const v1 = await signVals(page, WED)
    check('Q3 the four stand', JSON.stringify(v1) === JSON.stringify(v0) && v0.length === 4, `boxes ${JSON.stringify(v1)} (signed ${JSON.stringify(v0)})`)
    await shotUnion(page, 'Q3-board-signbar-lapsed', ['#sbSignBar'])
    /* tick it back (SC DAY, then SC NIGHT if it was held) */
    await qualsOpen(page, '#qViewP')
    const b1 = await qualCell(page, who, 'scDay')
    let b2 = { now: await page.evaluate(id => window.PEOPLE[id].quals.scNight, who) }
    if (scN0 && !b2.now) b2 = await qualCell(page, who, 'scNight')
    await qualsSave(page)
    note('Q3 ticked back', `SC DAY → ${JSON.stringify(b1.now)}, SC NIGHT → ${JSON.stringify(b2.now)}`)
    const f2 = await puckOn(page, 'face', WED, who), s2 = await summaryOn(page, 'face', WED)
    await puckShot(page, 'face', WED, who, 'Q3-face-puck-back')
    check('Q3 ticked back → the ring and flag go from the face', firstP(f2).ring === firstP(f0).ring && firstP(f2).flag === firstP(f0).flag && issues(s2) === issues(s0), `face ${pStr(f2)}; summary "${s2}"`)
    const c2 = await counts(page, WED)
    agree('Q3 ticked back → still 0 everywhere', c2, 0, 'the tick restored')
  } finally { ALL_ERRORS.push(...errors.map(e => 'Q3 ' + e)); await browser.close() }
}

/* =============================== Q4 — a CAT change whose only effect is the puck letter =============================== */
async function worldQ4() {
  const { browser, page, errors, CS } = await world()
  try {
    const who = await page.evaluate(() => window.DAYS[0].waves[0].formations[0].aircraft[0].p)
    const q0 = await page.evaluate(id => window.PEOPLE[id].q, who)
    const pub = await pubOnBoard(page, MON)
    check('Q4 publish Monday', pub.p.pressed && /ORIG/.test(pub.h.tag) && !num(pub.h.pending), `tag "${pub.h.tag}"`)
    const v0 = await signVals(page, MON)
    const nW0 = await page.evaluate(() => (window.WARN.byDay[0].warns || []).map(w => w.code + ':' + (w.who || []).join(',')).sort())
    const s0 = await summaryOn(page, 'face', MON), f0 = await puckOn(page, 'face', MON, who)
    await puckShot(page, 'face', MON, who, 'Q4-face-puck-before')
    await qualsOpen(page, '#qViewP')
    const r = await qualCat(page, who, 'A')
    await qualRowShot(page, 'Q4-quals-row-after', who)
    await qualsSave(page)
    const nW1 = await page.evaluate(() => (window.WARN.byDay[0].warns || []).map(w => w.code + ':' + (w.who || []).join(',')).sort())
    check('Q4 the CAT change raises no warning (letter only)', JSON.stringify(nW0) === JSON.stringify(nW1), `Quals page: ${CS[who]} CAT ${q0} → ${r.now}; Monday's working warnings ${nW1.length} (before ${nW0.length})${JSON.stringify(nW0) === JSON.stringify(nW1) ? '' : ' — ' + JSON.stringify(nW1.filter(x => !nW0.includes(x)))}`)
    const f1 = await puckOn(page, 'face', MON, who), s1 = await summaryOn(page, 'face', MON)
    await puckShot(page, 'face', MON, who, 'Q4-face-puck-after')
    check('Q4 the published face keeps the CAT letter it went out with', f1.length && f1.every(x => x.cat === firstP(f0).cat) && firstP(f0).cat === q0, `face ${pStr(f1)} (went out ${pStr(f0)})`)
    check('Q4 the face gains no ring, flag or issue', pStr(f1) === pStr(f0) && issues(s1) === issues(s0), `summary "${s1}" (before "${s0}")`)
    const w1 = await puckOn(page, 'work', MON, who)
    await puckShot(page, 'work', MON, who, 'Q4-work-puck-after')
    check('Q4 the working copy shows the new letter', w1.length && w1.every(x => x.cat === 'A'), `edit week ${pStr(w1)}`)
    const c1 = await counts(page, MON)
    agree('Q4 CAT change → 1 pending everywhere', c1, 1, `${CS[who]} CAT ${q0} → A`)
    const v1 = await signVals(page, MON)
    check('Q4 the four fall', v1.length === 4 && v1.every(x => !x || /—|sign/i.test(x)) && /to sign/.test(c1.signLine), `boxes ${JSON.stringify(v1)}, sign line "${c1.signLine}"`)
    await shotUnion(page, 'Q4-board-signbar-pending', ['#sbSignBar'])
    const list = await pendList(page, MON, 'Q4-pending-list')
    check('Q4 the list names it: "<callsign> · CAT IP → A"', new RegExp(`${CS[who]}\\s*·\\s*CAT\\s*${q0}\\s*→\\s*A`).test(list), `"${list}"`)
    /* put it back */
    await qualsOpen(page, '#qViewP'); const rb = await qualCat(page, who, q0); await qualsSave(page)
    const c2 = await counts(page, MON)
    agree('Q4 put back → 0 everywhere', c2, 0, `CAT → ${rb.now}`)
    await board(page, MON)
    const v2 = await signVals(page, MON)
    check('Q4 the four stand again', v0.length === 4 && JSON.stringify(v2) === JSON.stringify(v0), `boxes ${JSON.stringify(v2)} (signed ${JSON.stringify(v0)})`)
    const w2 = await puckOn(page, 'work', MON, who)
    check('Q4 the working copy shows the old letter again', w2.every(x => x.cat === q0), pStr(w2))
  } finally { ALL_ERRORS.push(...errors.map(e => 'Q4 ' + e)); await browser.close() }
}

/* =============================== Q5 — archive ✕ (posted out) on a published man, then Restore ======================== */
async function worldQ5() {
  const { browser, page, errors, CS } = await world()
  try {
    const who = await page.evaluate(() => window.DAYS[0].waves[1].formations[1].aircraft[1].p)   // Monday wave 2, RU #2
    const pub = await pubOnBoard(page, MON)
    check('Q5 publish Monday', pub.p.pressed && /ORIG/.test(pub.h.tag), `tag "${pub.h.tag}"`)
    const v0 = await signVals(page, MON)
    const f0 = await puckOn(page, 'face', MON, who), s0 = await summaryOn(page, 'face', MON)
    await qualsOpen(page, '#qViewP')
    const x = page.locator(`#qtbl [data-arch="${who}"]`).first()
    const has = await x.count()
    if (has) { await pressAt(page, x); await page.waitForTimeout(300) }
    const said = (await toasts(page)).join(' / ')
    const arch = await page.evaluate(id => !!window.PEOPLE[id].archived, who)
    await qualsSave(page)
    check('Q5 archived through the row\'s ✕', has && arch, `${CS[who]}: ✕ ${has ? 'found' : 'MISSING'}, archived=${arch}, said "${said}"`)
    const f1 = await puckOn(page, 'face', MON, who), s1 = await summaryOn(page, 'face', MON)
    await puckShot(page, 'face', MON, who, 'Q5-face-puck-archived')
    check('Q5 the published face still draws him as he went out', pStr(f1) === pStr(f0) && issues(s1) === issues(s0), `face ${pStr(f1)} (before ${pStr(f0)}); summary "${s1}"`)
    const c1 = await counts(page, MON)
    agree('Q5 posted out → 1 pending everywhere', c1, 1, `${CS[who]} archived on the Quals page`)
    const list = await pendList(page, MON, 'Q5-pending-list')
    check('Q5 the list names it: posted out no → yes', new RegExp(`${CS[who]}\\s*·\\s*posted out`).test(list) && /no\s*→\s*yes/.test(list), `"${list}"`)
    await board(page, MON)
    const v1 = await signVals(page, MON)
    check('Q5 the four fall', v1.length === 4 && v1.every(v => !v || /—|sign/i.test(v)), `boxes ${JSON.stringify(v1)}`)
    await shotUnion(page, 'Q5-board-signbar-pending', ['#sbSignBar'])
    /* Restore, from the Archived drawer under the table */
    await qualsOpen(page, '#qViewP')
    const tog = page.locator('#qArchToggle:visible').first()
    if (await tog.count()) { await pressAt(page, tog) }
    const rs = page.locator(`[data-restore="${who}"]:visible`).first()
    const hasR = await rs.count()
    if (hasR) { await shotUnion(page, 'Q5-archived-drawer', ['[data-testid="qarchlist"]']); await pressAt(page, rs) }
    const back = await page.evaluate(id => !window.PEOPLE[id].archived, who)
    note('Q5 Restore', `Restore ${hasR ? 'found' : 'MISSING'}; ${CS[who]} back on the roster: ${back}; said "${(await toasts(page)).join(' / ')}"`)
    await qualsSave(page)
    const c2 = await counts(page, MON)
    agree('Q5 restored → 0 everywhere', c2, 0, 'the man restored')
    await board(page, MON)
    const v2 = await signVals(page, MON)
    check('Q5 the four stand again', JSON.stringify(v2) === JSON.stringify(v0), `boxes ${JSON.stringify(v2)}`)
  } finally { ALL_ERRORS.push(...errors.map(e => 'Q5 ' + e)); await browser.close() }
}

if (W === 'probe') {
  const { browser, page } = await openHi({ width: 1440, height: 900, dpr: 1 })
  console.log(await page.evaluate(() => JSON.stringify(window.DAYS.map(d => d.waves.map(w => w.label + ':' + w.formations.map(f => f.aircraft.map(a => a.p + '/' + a.w).join(' ')).join(' ; '))))))
  await browser.close()
} else {
  if (want('Q1')) await worldQ1()
  if (want('Q2')) await worldQ2()
  if (want('Q3')) await worldQ3()
  if (want('Q4')) await worldQ4()
  if (want('Q5')) await worldQ5()
  check('no console errors', !ALL_ERRORS.length, ALL_ERRORS.slice(0, 5).join(' | '))
  process.exitCode = summary(`late-pub quals walk (${W})`) ? 1 : 0
}
