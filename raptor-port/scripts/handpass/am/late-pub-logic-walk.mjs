/* [LEAVE-LATE-PUBLISHED]'s FULL check — walker "logic" (26 Sep 26): a RULE changed on the Logic page under a PUBLISHED
   day. Written as assertions of the RIGHT behaviour — a PASS means correct, and re-running it IS the re-walk.
   Every world is a fresh browser on the demo week (Mon 13 – Sun 19 Jul 26), made through the app's own controls: the
   board's sign-off selects and Publish, the edit week's B box, the Logic page (reached through the top nav on a desktop,
   the ☰ drawer on a phone) with its "✎ Edit rules" and the row's own edit box. window.* is READ for the evidence only.
     L1  crew rest 12h → 14h under a published Tuesday: new breaches LIVE on the face (ring + R flag, counted in the
         warning bar), 0 pending, the four stand; Monday (a draft) wears the dotted "breaks tomorrow" mark; put back
     L2  "Max days worked in a row" 6 → 1 under a published Tuesday: the 7 flag + ring LIVE on the face, 0 pending,
         the four stand; put back
     L3  long work day 12h → 6h under a published Monday: FROZEN — the face gains no note, the working copy does,
         1 pending naming the new notes, the four fall; put back → 0, the four stand
     L4  the brief lead (a printed rule value) under a published Monday whose first line has a blank B: the face keeps
         the time it printed, the working copy shows the new one, 1 pending ("A blank brief — its suggested lead"); back
   Usage (from raptor-port/, the build served on 4175): node scripts/handpass/am/late-pub-logic-walk.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.HP_URL = process.env.HP_URL || 'http://localhost:4175'
/* HP_REWALK=<folder> sends a re-walk's pictures there, so the first walk's stay as evidence (the order §5) */
process.env.HP_SHOTS = process.env.HP_REWALK ? `${process.env.HP_REWALK}/${W}` : `C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-26-late-pub/logic/${W}`
const L = await import('./w2-lib.mjs')
const W1 = await import('./w1-lib.mjs')
const { openHi, editWeek, board, signDay, publishDay, head, go, check, note, summary, screen, lookAt, pvTap, menuClose } = L
const { toastSpy, toasts, panel, shotUnion, norm } = W1
const PHONE = W === 'phone'
const SIZE = PHONE ? { width: 390, height: 844 } : { width: 1440, height: 900 }
const MON = 0, TUE = 1
const num = s => { const m = /(\d+)/.exec(String(s || '')); return m ? +m[1] : 0 }
const ALL_ERRORS = []
const ONLY = (process.argv[3] || '').split(',').filter(Boolean)
const want = w => !ONLY.length || ONLY.includes(w)

async function world() {
  const w = await openHi({ ...SIZE, dpr: PHONE ? 3 : 2, state: null })
  await toastSpy(w.page)
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
async function fourVals(page, di) { await board(page, di); return signVals(page, di) }
const stand = (v, v0) => v0.length === 4 && v0.every(x => x && !/—|sign/i.test(x)) && JSON.stringify(v) === JSON.stringify(v0)
const fell = (v, c) => v.every(x => !x || /—|sign/i.test(x)) && /to sign/.test(c.signLine || '')
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

/* ---- what a surface draws for one day: every puck's ring and flag, and the warning bar ---------------------------- */
async function pucks(page, sel) {
  return page.evaluate(s => {
    const vis = e => !!(e.offsetWidth || e.offsetHeight)
    const root = document.querySelector(s); if (!root) return null
    const P = window.PEOPLE, cs = id => (P[id] && P[id].cs) || id
    const by = {}
    for (const e of root.querySelectorAll('.puck[data-person]')) {
      if (!vis(e) || e.closest('#sbRoster') || e.closest('#eRoster')) continue
      const n = cs(e.dataset.person), c = ' ' + e.className + ' '
      const r = by[n] || (by[n] = { id: e.dataset.person, red: 0, dash: 0, dot: 0, flags: [] })
      if (c.includes(' boxred ')) r.red++
      if (c.includes(' boxdash ')) r.dash++
      if (c.includes(' boxdot ')) r.dot++
      e.querySelectorAll('.lchip').forEach(ch => { const f = [...ch.classList].find(x => x.startsWith('l-')); if (f && !r.flags.includes(f)) r.flags.push(f) })
    }
    const list = k => Object.keys(by).filter(n => k(by[n])).sort()
    const bar = [...root.querySelectorAll('.daywarn, #sbWarn .wh')].find(vis)
    return { by, all: Object.keys(by).sort(), red: list(r => r.red || r.dash), dot: list(r => r.dot),
      cr: list(r => r.flags.includes('l-cr')), run: list(r => r.flags.includes('l-run')), tt: list(r => r.flags.includes('l-tt')),
      flagged: list(r => r.red || r.dash || r.dot || r.flags.length),
      bar: bar ? bar.innerText.replace(/\s+/g, ' ').trim() : '(no warning bar)' }
  }, sel)
}
const barN = s => { const m = /⚠ (\d+) issues?(?: · (\d+) warnings?)?/.exec(s || ''); return m ? { issues: +m[1], hard: +(m[2] || 0) } : { issues: 0, hard: 0 } }
const barSame = (a, b) => JSON.stringify(barN(a)) === JSON.stringify(barN(b))
const minus = (a, b) => a.filter(x => !b.includes(x))
const faceSel = di => `#vWeek .day[data-day="${di}"]`
const weekSel = di => `#eWeek .day[data-day="${di}"]`
async function onFace(page, di) { await go(page, 'viewsched'); await page.waitForTimeout(300); return pucks(page, faceSel(di)) }
async function onWeek(page, di) { await editWeek(page); await page.waitForTimeout(200); return pucks(page, weekSel(di)) }
async function dayText(page, sel) { return page.evaluate(s => { const d = document.querySelector(s); return d ? d.innerText.replace(/\s+/g, ' ') : '(no day)' }, sel) }
/* open a day's warning list on the current page (its own bar), read it, picture it, close it again */
async function warnList(page, surf, di, shot) {
  const sel = surf === 'face' ? faceSel(di) : weekSel(di)
  const bar = page.locator(`${sel} [data-daywarn="${di}"]:visible`).first()
  if (!(await bar.count())) return '(no warning bar)'
  await bar.evaluate(e => e.scrollIntoView({ block: 'center' })); await bar.click(); await page.waitForTimeout(350)
  const t = await page.evaluate(s => { const b = document.querySelector(s + ' .dwbox'); return b ? b.innerText.replace(/\s+/g, ' ').trim() : '(no list)' }, sel)
  if (shot) await shotUnion(page, shot, [`${sel} .dwbox`])
  const bar2 = page.locator(`${sel} [data-daywarn="${di}"]:visible`).first()
  if (await bar2.count()) { await bar2.click(); await page.waitForTimeout(250) }
  return t
}
/* a close-up of one man's first puck on a surface */
async function puckShot(page, sel, id, shot) { return shotUnion(page, shot, [`${sel} .puck[data-person="${id}"]`], { pad: 10 }) }
/* the day on View-only Sched: a screen picture from its head, and its warning bar close up */
async function faceShots(page, di, shot) {
  await go(page, 'viewsched'); await page.waitForTimeout(300)
  await page.locator(faceSel(di)).first().evaluate(e => e.scrollIntoView({ block: 'start' })); await page.waitForTimeout(200)
  await screen(page, shot)
  await shotUnion(page, shot + '-bar', [`${faceSel(di)} .dwbox`, `${faceSel(di)} [data-daywarn="${di}"]`])
}

/* ---- the Logic page, through the app's own navigation ---------------------------------------------------------- */
async function toLogic(page) {
  await L.closeBoard(page)
  const top = page.locator('#topnav a[data-page="logic"]:visible').first()
  let how
  if (await top.count()) { await top.click(); how = 'top nav "Logic"' }
  else {
    await page.locator('#burger:visible').first().click(); await page.waitForTimeout(400)
    await page.locator('#drawerNav a[data-page="logic"]:visible').first().click(); how = '☰ drawer → "Logic"'
  }
  await page.waitForFunction(() => window.CURPAGE === 'logic'); await page.waitForTimeout(400)
  return how
}
/* change one rule through its row's own edit box: returns what the row and the box said, before and after */
async function setRule(page, key, value, shot) {
  const how = await toLogic(page)
  const ed = page.locator('#lgEdit:visible').first()
  let edited = 'already editing'
  if (await ed.count()) { await ed.click(); await page.waitForTimeout(300); edited = 'pressed "✎ Edit rules"' }
  const box = page.locator(`#lgBody .lgin[data-lgset="${key}"]:visible`).first()
  if (!(await box.count())) return { how, edited, error: 'NO EDIT BOX for ' + key }
  const lgi = await box.getAttribute('data-lgi')
  const row = `#lgBody .lgrule:has(.lgin[data-lgi="${lgi}"])`
  await box.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(200)
  const rowBefore = await page.evaluate(s => (document.querySelector(s) || {}).innerText?.replace(/\s+/g, ' ').trim(), row)
  const was = await box.inputValue()
  if (shot) await shotUnion(page, shot + '-before', [row])
  await toasts(page)
  await box.click(); await box.fill(String(value)); await box.press('Tab'); await page.waitForTimeout(700)
  const said = (await toasts(page)).join(' / ')
  const boxNow = page.locator(`#lgBody .lgin[data-lgi="${lgi}"]:visible`).first()
  const now = (await boxNow.count()) ? await boxNow.inputValue() : '(box gone)'
  const rowAfter = await page.evaluate(s => (document.querySelector(s) || {}).innerText?.replace(/\s+/g, ' ').trim(), row)
  const off = await page.evaluate(() => { const o = document.querySelector('#lgOff'); return o && !o.hidden ? o.innerText.replace(/\s+/g, ' ').trim() : '(no banner)' })
  if (shot) await shotUnion(page, shot + '-after', [row])
  if (shot) await screen(page, shot + '-page')
  const vconf = await page.evaluate(k => window.VCONF ? window.VCONF[k] : '(VCONF not exposed)', key)
  return { how, edited, lgi, was, now, said, rowBefore, rowAfter, off, vconf }
}
/* a reload, the way a person presses refresh (the world has been written to: the publish) — signs in again only if
   the app asks */
async function reload(page) {
  await page.reload(); await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  let how = 'stayed signed in'
  if (await page.locator('#luser').isVisible().catch(() => false)) { await L.login(page, 'a'); how = 'signed in again (the app asked)' }
  else { await page.waitForSelector('#vWeek .day, #eWeek .day', { state: 'attached' }); await page.waitForTimeout(500) }
  await toastSpy(page)
  return how
}
const ruleLine = r => `${r.how}; ${r.edited}; box "${r.was}" → "${r.now}"; said "${r.said}"; engine ${r.vconf}; banner "${r.off}"`

/* =============================== L1 — crew rest under a published Tuesday =============================== */
async function worldL1() {
  const { browser, page, errors } = await world()
  try {
    const pub = await pubOnBoard(page, TUE)
    check('L1.0 publish Tuesday', pub.p.pressed && /ORIG/.test(pub.h.tag) && !num(pub.h.pending), `Tuesday published: tag "${pub.h.tag}", pending "${norm(pub.h.pending)}"`)
    const sg = await signDay(page, TUE, 0); const v0 = await signVals(page, TUE)
    note('L1.0 signed again, nothing waiting', `${JSON.stringify(sg)} → ${JSON.stringify(v0)}`)
    const f0 = await onFace(page, TUE)
    await faceShots(page, TUE, 'L1-0-face-tue-before')
    const fl0 = await warnList(page, 'face', TUE, 'L1-0-face-tue-list-before')
    const e0 = await onWeek(page, TUE)
    const m0w = await onWeek(page, MON)
    const m0f = await onFace(page, MON)
    note('L1.0 Tuesday before', `face: bar "${f0.bar}", red ${JSON.stringify(f0.red)}, R flag ${JSON.stringify(f0.cr)} · working copy: bar "${e0.bar}", R flag ${JSON.stringify(e0.cr)} · Monday dotted (week) ${JSON.stringify(m0w.dot)} (view) ${JSON.stringify(m0f.dot)}`)
    note('L1.0 the face\'s warning list', fl0)
    const w0 = await page.evaluate(() => ((window.WARN.byDay[1] || {}).warns || []).filter(w => w.code === 'CREW_REST' || w.code === 'CREW_TIGHT').map(w => w.code + ' ' + w.msg))
    note('L1.0 engine crew-rest warnings on Tuesday', JSON.stringify(w0))

    const r = await setRule(page, 'crewRest', '14h', 'L1-1-logic-crewrest')
    check('L1.1 the Logic page\'s crew-rest box takes 14h', !r.error && r.vconf === 840, ruleLine(r) + ` · row "${r.rowAfter}"`)
    const w1 = await page.evaluate(() => ((window.WARN.byDay[1] || {}).warns || []).filter(w => w.code === 'CREW_REST' || w.code === 'CREW_TIGHT').map(w => w.code + ' [' + (w.who || []).join(',') + '] ' + w.msg))
    note('L1.1 engine crew-rest warnings on Tuesday now', JSON.stringify(w1))

    const f1 = await onFace(page, TUE)
    await faceShots(page, TUE, 'L1-1-face-tue-after')
    const fl1 = await warnList(page, 'face', TUE, 'L1-1-face-tue-list-after')
    const e1 = await onWeek(page, TUE)
    await shotUnion(page, 'L1-1-week-tue-bar', [`${weekSel(TUE)} [data-daywarn="${TUE}"]`])
    const newWk = minus(e1.cr, e0.cr), newFace = minus(f1.cr, f0.cr)
    note('L1.1 Tuesday after', `face: bar "${f1.bar}", red ${JSON.stringify(f1.red)}, R ${JSON.stringify(f1.cr)} · working copy: bar "${e1.bar}", red ${JSON.stringify(e1.red)}, R ${JSON.stringify(e1.cr)}`)
    check('L1.1 the raise makes NEW crew-rest breaches on the working copy (the fixture)', newWk.length > 0, `new R flags on Edit Schedule Tuesday: ${JSON.stringify(newWk)}`)
    check('L1.1 the published face shows the SAME new breaches at once (D184)', newWk.length > 0 && JSON.stringify(newFace) === JSON.stringify(newWk), `new R flags on View-only Tuesday: ${JSON.stringify(newFace)} (working copy ${JSON.stringify(newWk)})`)
    const ringed = newFace.filter(n => f1.red.includes(n))
    check('L1.1 each new breach wears the red ring on the face', newFace.length > 0 && ringed.length === newFace.length, `ringed ${JSON.stringify(ringed)} of ${JSON.stringify(newFace)}`)
    check('L1.1 the face\'s warning bar counts them (rose, and agrees with the working copy)', barN(f1.bar).issues > barN(f0.bar).issues && barSame(f1.bar, e1.bar), `face "${f1.bar}" (was "${f0.bar}") · working copy "${e1.bar}"`)
    const listHas = newFace.filter(n => new RegExp(n, 'i').test(fl1) && /crew rest/i.test(fl1))
    check('L1.1 the face\'s warning list names each new breach', newFace.length > 0 && listHas.length === newFace.length, `"${fl1.slice(0, 600)}"`)
    await go(page, 'viewsched')
    for (const n of newFace.slice(0, 3)) await puckShot(page, faceSel(TUE), f1.by[n].id, `L1-1-face-tue-puck-${n}`)
    /* Monday, the day before, a draft: the dotted "breaks tomorrow" mark on the men who cause Tuesday's breaches */
    const m1w = await onWeek(page, MON)
    await shotUnion(page, 'L1-1-week-mon', [weekSel(MON)])
    const onMon = f1.cr.filter(n => m1w.all.includes(n))
    const dotW = onMon.filter(n => m1w.dot.includes(n))
    for (const n of onMon.slice(0, 3)) await puckShot(page, weekSel(MON), m1w.by[n].id, `L1-1-week-mon-dot-${n}`)
    const m1f = await onFace(page, MON)
    const dotF = onMon.filter(n => m1f.dot.includes(n))
    for (const n of onMon.slice(0, 3)) if (m1f.by[n]) await puckShot(page, faceSel(MON), m1f.by[n].id, `L1-1-view-mon-dot-${n}`)
    check('L1.1 Monday (Edit Schedule) dots every man who breaks Tuesday and is on Monday', onMon.length > 0 && dotW.length === onMon.length, `on Monday: ${JSON.stringify(onMon)}; dotted: ${JSON.stringify(m1w.dot)} (before ${JSON.stringify(m0w.dot)})`)
    check('L1.1 Monday (View-only Sched) dots them too', onMon.length > 0 && dotF.length === onMon.length, `dotted on View-only Monday: ${JSON.stringify(m1f.dot)} (before ${JSON.stringify(m0f.dot)})`)
    const c1 = await counts(page, TUE)
    agree('L1.1 a live breach makes nothing pending (D184)', c1, 0, 'crew rest raised under a published Tuesday')
    const v1 = await signVals(page, TUE)
    check('L1.1 the four stand', stand(v1, v0), `boxes ${JSON.stringify(v1)} (signed ${JSON.stringify(v0)}), sign line "${c1.signLine}"`)
    await shotUnion(page, 'L1-1-board-signbar', ['#sbSignBar'])
    /* the board's 👁 look at the issued version: the same live breaches */
    const looked = await lookAt(page, TUE, /./)
    if (looked) {
      const pv = await pucks(page, '#schedBoard')
      await screen(page, 'L1-1-board-look-orig')
      /* a version preview "reads and does not check (PV: no flags)" (html.ts — the same on main): it draws no warning
         at all, frozen or live. Recorded as seen, for the host to weigh against D184's "published face". */
      note('L1.1 the board\'s 👁 look at the issued Tuesday', `${pv.all.length} pucks drawn, ${pv.flagged.length} with any ring or flag ${JSON.stringify(pv.flagged)}; R ${JSON.stringify(pv.cr)}; warning bar "${pv.bar}" — the look draws NO warnings: neither the frozen Outlaw breach nor the live new ones`)
      await pvTap(page, TUE, 'data-golive')
    } else { note('L1.1 board look', 'no issued row in the plans menu'); await menuClose(page) }
    /* after a reload: the raised rule persists, the live breaches are drawn again from today, nothing turned pending */
    const rl = await reload(page)
    const f1r = await onFace(page, TUE)
    await faceShots(page, TUE, 'L1-1r-face-tue-after-reload')
    check('L1.1r after a reload the face still shows the live breaches', JSON.stringify(f1r.cr) === JSON.stringify(f1.cr) && barSame(f1r.bar, f1.bar), `${rl}; R ${JSON.stringify(f1r.cr)}, bar "${f1r.bar}"`)
    const c1r = await counts(page, TUE)
    agree('L1.1r still 0 after a reload', c1r, 0, 'crew rest 14h, reloaded')
    const v1r = await signVals(page, TUE)
    check('L1.1r the four still stand after a reload', stand(v1r, v0), `boxes ${JSON.stringify(v1r)}`)

    const r2 = await setRule(page, 'crewRest', '12h', 'L1-2-logic-crewrest-back')
    check('L1.2 crew rest put back to 12h', !r2.error && r2.vconf === 720, ruleLine(r2))
    const f2 = await onFace(page, TUE)
    await faceShots(page, TUE, 'L1-2-face-tue-back')
    check('L1.2 the new breaches are gone from the face', JSON.stringify(f2.cr) === JSON.stringify(f0.cr) && barSame(f2.bar, f0.bar), `R ${JSON.stringify(f2.cr)} (at first ${JSON.stringify(f0.cr)}); bar "${f2.bar}" (at first "${f0.bar}")`)
    const m2w = await onWeek(page, MON)
    check('L1.2 Monday\'s dotted marks are back as they were', JSON.stringify(m2w.dot) === JSON.stringify(m0w.dot), `dotted ${JSON.stringify(m2w.dot)} (at first ${JSON.stringify(m0w.dot)})`)
    const c2 = await counts(page, TUE)
    agree('L1.2 still 0 everywhere', c2, 0, 'crew rest put back')
    const v2 = await signVals(page, TUE)
    check('L1.2 the four still stand', stand(v2, v0), `boxes ${JSON.stringify(v2)}`)
  } finally { ALL_ERRORS.push(...errors.map(e => 'L1 ' + e)); await browser.close() }
}

/* =============================== L2 — the 7-day limit under a published Tuesday =============================== */
async function worldL2() {
  const { browser, page, errors } = await world()
  try {
    const pub = await pubOnBoard(page, TUE)
    check('L2.0 publish Tuesday', pub.p.pressed && /ORIG/.test(pub.h.tag), `tag "${pub.h.tag}"`)
    await signDay(page, TUE, 0); const v0 = await signVals(page, TUE)
    const f0 = await onFace(page, TUE)
    await faceShots(page, TUE, 'L2-0-face-tue-before')
    const e0mon = await onWeek(page, MON), e0 = await onWeek(page, TUE)
    note('L2.0 before', `face: bar "${f0.bar}", 7 flag ${JSON.stringify(f0.run)} · working copy bar "${e0.bar}"`)

    const r = await setRule(page, 'maxRun', '1', 'L2-1-logic-maxrun')
    check('L2.1 the Logic page\'s "Max days worked in a row" box takes 1', !r.error && r.vconf === 1, ruleLine(r) + ` · row "${r.rowAfter}"`)
    const runW = await page.evaluate(() => { const P = window.PEOPLE; return [...new Set(((window.WARN.byDay[1] || {}).warns || []).filter(w => w.code === 'DAYS_RUN').flatMap(w => (w.who || []).map(id => (P[id] || {}).cs || id)))].sort() })
    const wmsg = await page.evaluate(() => ((window.WARN.byDay[1] || {}).warns || []).filter(w => w.code === 'DAYS_RUN').slice(0, 3).map(w => w.msg))
    note('L2.1 engine DAYS_RUN on Tuesday', `${runW.length} men: ${JSON.stringify(runW)} · e.g. ${JSON.stringify(wmsg)}`)
    const e1 = await onWeek(page, TUE)
    /* who is TASKED on each day (a seat, a desk, a sim, a ground row, a programme row) — read off the days for the
       evidence table; the edit week's crew panels (Available crew, SANS, Unavailable) also draw pucks, which are not tasking */
    const tasked = await page.evaluate(() => {
      const P = window.PEOPLE, byCs = {}; Object.keys(P).forEach(k => { byCs[String(P[k].cs).toUpperCase()] = k })
      const id = v => !v ? null : P[v] ? v : byCs[String(v).toUpperCase()] || null
      return [0, 1].map(di => { const d = window.DAYS[di], s = new Set(), add = v => { const i = id(v); if (i) s.add(P[i].cs) }
        d.waves.forEach(w => w.formations.forEach(f => f.aircraft.forEach(a => { add(a.p); add(a.w) })))
        d.dutywaves.forEach(b => b.rows.forEach(r => { add(r.id); (r.more || []).forEach(add) }))
        ;(d.sims.oft || []).forEach(x => { add(x.p); add(x.w); (x.pax || []).forEach(add); (x.more || []).forEach(add) })
        ;(d.sims.amt || []).forEach(x => { add(x.p); add(x.w); (x.pax || []).forEach(add); (x.more || []).forEach(add) })
        ;(d.ground || []).forEach(g => { if (!g.info && !g.cx) { add(g.who); (g.more || []).forEach(add) } })
        ;(d.allhands || []).forEach(a => { (Array.isArray(a.who) ? a.who : [a.who]).forEach(add); (a.more || []).forEach(add) })
        return [...s].sort() })
    })
    const both = tasked[1].filter(n => tasked[0].includes(n))
    note('L2.1 men TASKED on both Monday and Tuesday (read off the days)', `${both.length}: ${JSON.stringify(both)}`)
    const f1 = await onFace(page, TUE)
    await faceShots(page, TUE, 'L2-1-face-tue-after')
    const fl1 = await warnList(page, 'face', TUE, 'L2-1-face-tue-list-after')
    note('L2.1 face after', `bar "${f1.bar}", 7 flag ${JSON.stringify(f1.run)}, ringed ${JSON.stringify(f1.red)} · working copy bar "${e1.bar}", 7 ${JSON.stringify(e1.run)}`)
    check('L2.1 the run warning reaches the men on both days (the fixture)', runW.length > 0 && both.every(n => runW.includes(n)), `run ${runW.length}, on both days ${both.length}, missing ${JSON.stringify(minus(both, runW))}`)
    const faceRinged = runW.filter(n => f1.red.includes(n)), faceFlag = runW.filter(n => f1.run.includes(n))
    const outranked = minus(runW, faceFlag).map(n => `${n}:${(f1.by[n] || { flags: ['NO PUCK'] }).flags.join('+')}`)
    check('L2.1 every man it names wears the red ring on the published face (D184)', runW.length > 0 && faceRinged.length === runW.length, `ringed ${faceRinged.length}/${runW.length}; not ringed ${JSON.stringify(minus(runW, faceRinged))}`)
    check('L2.1 …and the 7 flag, unless a higher flag outranks it', runW.length > 0 && minus(runW, faceFlag).every(n => (f1.by[n] || { flags: [] }).flags.some(f => /l-(q|c|cp)$/.test(f))), `7 on ${faceFlag.length}/${runW.length}; others show ${JSON.stringify(outranked)}`)
    check('L2.1 face and working copy agree on the 7 flags and the bar', JSON.stringify(f1.run) === JSON.stringify(e1.run) && barSame(f1.bar, e1.bar), `face "${f1.bar}" 7 ${f1.run.length} · working copy "${e1.bar}" 7 ${e1.run.length}`)
    check('L2.1 the face\'s list says it', /break day|in a row|days on the programme/i.test(fl1), `"${fl1.slice(0, 400)}"`)
    for (const n of faceFlag.slice(0, 2)) await puckShot(page, faceSel(TUE), f1.by[n].id, `L2-1-face-tue-puck-${n}`)
    const c1 = await counts(page, TUE)
    agree('L2.1 the live run makes nothing pending (D184)', c1, 0, 'max run lowered to 1 under a published Tuesday')
    const v1 = await signVals(page, TUE)
    check('L2.1 the four stand', stand(v1, v0), `boxes ${JSON.stringify(v1)} (signed ${JSON.stringify(v0)})`)
    await shotUnion(page, 'L2-1-board-signbar', ['#sbSignBar'])
    const looked = await lookAt(page, TUE, /./)
    if (looked) {
      const pv = await pucks(page, '#schedBoard')
      await screen(page, 'L2-1-board-look-orig')
      note('L2.1 the board\'s 👁 look at the issued Tuesday', `${pv.all.length} pucks drawn, ${pv.flagged.length} with any ring or flag; 7 flags ${pv.run.length}; warning bar "${pv.bar}"`)
      await pvTap(page, TUE, 'data-golive')
    } else { note('L2.1 board look', 'no issued row'); await menuClose(page) }

    const r2 = await setRule(page, 'maxRun', '6', 'L2-2-logic-maxrun-back')
    check('L2.2 max run put back to 6', !r2.error && r2.vconf === 6, ruleLine(r2))
    const f2 = await onFace(page, TUE)
    await faceShots(page, TUE, 'L2-2-face-tue-back')
    check('L2.2 the 7 flags are gone from the face', JSON.stringify(f2.run) === JSON.stringify(f0.run) && barSame(f2.bar, f0.bar), `7 ${JSON.stringify(f2.run)}; bar "${f2.bar}" (at first "${f0.bar}")`)
    const c2 = await counts(page, TUE)
    agree('L2.2 still 0 everywhere', c2, 0, 'max run put back')
    const v2 = await signVals(page, TUE)
    check('L2.2 the four still stand', stand(v2, v0), `boxes ${JSON.stringify(v2)}`)
  } finally { ALL_ERRORS.push(...errors.map(e => 'L2 ' + e)); await browser.close() }
}

/* =============================== L3 — the long-day note freezes =============================== */
async function worldL3() {
  const { browser, page, errors } = await world()
  try {
    const pub = await pubOnBoard(page, MON)
    check('L3.0 publish Monday', pub.p.pressed && /ORIG/.test(pub.h.tag), `tag "${pub.h.tag}"`)
    await signDay(page, MON, 0); const v0 = await signVals(page, MON)
    const f0 = await onFace(page, MON); const t0 = await dayText(page, faceSel(MON))
    await faceShots(page, MON, 'L3-0-face-mon-before')
    const e0 = await onWeek(page, MON)
    note('L3.0 before', `face bar "${f0.bar}" · working copy bar "${e0.bar}"`)

    const r = await setRule(page, 'longDay', '6h', 'L3-1-logic-longday')
    check('L3.1 the Logic page\'s long-work-day box takes 6h', !r.error && r.vconf === 360, ruleLine(r) + ` · row "${r.rowAfter}"`)
    const ld = await page.evaluate(() => ((window.WARN.byDay[0] || {}).warns || []).filter(w => w.code === 'LONGDAY').map(w => w.msg))
    note('L3.1 engine long-day notes on Monday (working copy)', `${ld.length}: ${JSON.stringify(ld.slice(0, 4))}`)
    const f1 = await onFace(page, MON); const t1 = await dayText(page, faceSel(MON))
    await faceShots(page, MON, 'L3-1-face-mon-after')
    const fl1 = await warnList(page, 'face', MON, 'L3-1-face-mon-list-after')
    check('L3.1 the published face gains NO long-day note (frozen)', barSame(f1.bar, f0.bar) && t1 === t0, `face bar "${f1.bar}" (before "${f0.bar}"); the face's text ${t1 === t0 ? 'byte-for-byte as before' : 'DIFFERS'}`)
    const lcount = s => (String(s).match(/long work day/gi) || []).length
    note('L3.1 the face\'s list', `${lcount(fl1)} long-day line(s)`)
    const e1 = await onWeek(page, MON)
    const wl1 = await warnList(page, 'week', MON, 'L3-1-week-mon-list-after')
    check('L3.1 Edit Schedule shows the new long-day notes', barN(e1.bar).issues > barN(e0.bar).issues && lcount(wl1) > lcount(fl1), `working copy bar "${e1.bar}" (before "${e0.bar}"); ${lcount(wl1)} long-day lines on Edit Schedule vs ${lcount(fl1)} on the face`)
    const c1 = await counts(page, MON)
    agree('L3.1 a frozen warning change is 1 pending', c1, 1, 'long day lowered under a published Monday')
    const list = await pendList(page, MON, 'L3-1-pending-list')
    check('L3.1 the pending list names the new long-day notes', /long work day/i.test(list) && /\bnew\b/i.test(list), `"${list.slice(0, 700)}"`)
    const v1 = await fourVals(page, MON)
    check('L3.1 the four fall', fell(v1, c1), `boxes ${JSON.stringify(v1)}, sign line "${c1.signLine}"`)
    await shotUnion(page, 'L3-1-board-signbar', ['#sbSignBar'])
    const looked = await lookAt(page, MON, /./)
    if (looked) {
      const pv = await pucks(page, '#schedBoard')
      await screen(page, 'L3-1-board-look-orig')
      note('L3.1 the board\'s 👁 look at the issued Monday', `${pv.all.length} pucks drawn, ${pv.flagged.length} with any ring or flag; warning bar "${pv.bar}" (the issued face reads "${f0.bar}")`)
      await pvTap(page, MON, 'data-golive')
    } else { note('L3.1 board look', 'no issued row'); await menuClose(page) }
    /* after a reload: the face is still as issued, and the day still waits */
    const rl = await reload(page)
    const f1r = await onFace(page, MON); const t1r = await dayText(page, faceSel(MON))
    check('L3.1r after a reload the face is still as issued', t1r === t0 && barSame(f1r.bar, f0.bar), `${rl}; bar "${f1r.bar}"; text ${t1r === t0 ? 'byte-for-byte' : 'DIFFERS'}`)
    const c1r = await counts(page, MON)
    agree('L3.1r still 1 after a reload', c1r, 1, 'long day 6h, reloaded')
    const v1r = await signVals(page, MON)
    check('L3.1r the four are still down after a reload', fell(v1r, c1r), `boxes ${JSON.stringify(v1r)}`)

    const r2 = await setRule(page, 'longDay', '12h', 'L3-2-logic-longday-back')
    check('L3.2 long day put back to 12h', !r2.error && r2.vconf === 720, ruleLine(r2))
    const c2 = await counts(page, MON)
    agree('L3.2 put back → 0 everywhere', c2, 0, 'long day put back')
    const v2 = await signVals(page, MON)
    check('L3.2 the four stand again', stand(v2, v0), `boxes ${JSON.stringify(v2)} (signed ${JSON.stringify(v0)})`)
    await shotUnion(page, 'L3-2-board-signbar', ['#sbSignBar'])
    const f2 = await onFace(page, MON); const t2 = await dayText(page, faceSel(MON))
    check('L3.2 the face is as it was issued', t2 === t0, t2 === t0 ? 'byte-for-byte' : 'DIFFERS')
  } finally { ALL_ERRORS.push(...errors.map(e => 'L3 ' + e)); await browser.close() }
}

/* =============================== L4 — the brief lead, a printed rule value =============================== */
async function worldL4() {
  const { browser, page, errors } = await world()
  try {
    await editWeek(page)
    const key = 'ff:0.0.0.br'
    const cell = page.locator(`${weekSel(MON)} [data-txt="${key}"]:visible`).first()
    const has = await cell.count()
    const typed = has ? norm(await cell.innerText()) : '(no B box)'
    if (has && typed) {
      await cell.evaluate(e => e.scrollIntoView({ block: 'center' })); await cell.click()
      await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace'); await cell.evaluate(e => e.blur()); await page.waitForTimeout(600)
    }
    const sug0 = await page.evaluate(k => { const s = [...document.querySelectorAll(`#eWeek [data-bacc="${k}"]`)].find(e => e.offsetWidth || e.offsetHeight); return s ? s.getAttribute('data-bval') : null }, key)
    note('L4.0 Monday\'s first line, B box', `it held "${typed}"${has && typed ? ' — cleared through the box' : ' — already blank in the demo (nothing to clear)'}; the week now suggests ${sug0}`)
    check('L4.0 the first line prints a suggested brief', !!sug0, `suggestion ${sug0}`)
    await shotUnion(page, 'L4-0-week-mon-line1', [`${weekSel(MON)} .fcell.bto`])
    const pub = await pubOnBoard(page, MON)
    check('L4.0 publish Monday', pub.p.pressed && /ORIG/.test(pub.h.tag), `tag "${pub.h.tag}"`)
    await signDay(page, MON, 0); const v0 = await signVals(page, MON)
    const faceB = async () => { await go(page, 'viewsched'); await page.waitForTimeout(300); return page.evaluate(s => { const c = document.querySelector(s + ' .go .form .fcell.bto'); return c ? c.innerText.replace(/\s+/g, ' ').trim() : '(no line)' }, faceSel(MON)) }
    const fb0 = await faceB(); const t0 = await dayText(page, faceSel(MON))
    await shotUnion(page, 'L4-0-face-mon-line1', [`${faceSel(MON)} .go .form .fcell.bto`], { pad: 30 })
    note('L4.0 the published face\'s first line (B TO)', fb0)

    const r = await setRule(page, 'briefLead', '150', 'L4-1-logic-brieflead')
    check('L4.1 the Logic page\'s brief-lead box takes 150 min', !r.error && r.vconf === 150, ruleLine(r) + ` · row "${r.rowAfter}"`)
    const fb1 = await faceB(); const t1 = await dayText(page, faceSel(MON))
    await shotUnion(page, 'L4-1-face-mon-line1', [`${faceSel(MON)} .go .form .fcell.bto`], { pad: 30 })
    await faceShots(page, MON, 'L4-1-face-mon-after')
    check('L4.1 the published face keeps the brief time it printed', fb1 === fb0 && fb0.startsWith(sug0 || '??'), `face "${fb1}" (issued "${fb0}", suggestion at publish ${sug0})`)
    check('L4.1 the published face is otherwise unchanged', t1 === t0, t1 === t0 ? 'byte-for-byte' : 'DIFFERS')
    await editWeek(page)
    const sug1 = await page.evaluate(k => { const s = [...document.querySelectorAll(`#eWeek [data-bacc="${k}"]`)].find(e => e.offsetWidth || e.offsetHeight); return s ? s.getAttribute('data-bval') : null }, key)
    await shotUnion(page, 'L4-1-week-mon-line1', [`${weekSel(MON)} .fcell.bto`], { pad: 30 })
    check('L4.1 the working copy shows the new suggested brief (10 min earlier)', !!sug1 && sug1 !== sug0, `Edit Schedule suggests ${sug1} (was ${sug0})`)
    const c1 = await counts(page, MON)
    agree('L4.1 a printed rule value changed is 1 pending', c1, 1, 'brief lead changed under a published Monday')
    const list = await pendList(page, MON, 'L4-1-pending-list')
    check('L4.1 the pending list names it: "A blank brief — its suggested lead 140 min → 150 min"', /A blank brief — its suggested lead/.test(list) && /140 min/.test(list) && /150 min/.test(list), `"${list.slice(0, 700)}"`)
    /* the missed-brief advisories the new lead re-words read ONE line each, "changed" — never cleared and new (added at
       the host's re-walk, after this walk's own find) */
    check('L4.1 a re-worded warning reads one "changed" line, never cleared + new', !/cleared/.test(list) && /changed/.test(list), `"${list.slice(0, 700)}"`)
    const v1 = await fourVals(page, MON)
    check('L4.1 the four fall', fell(v1, c1), `boxes ${JSON.stringify(v1)}, sign line "${c1.signLine}"`)
    const bsugB = await page.evaluate(k => { const s = [...document.querySelectorAll(`#schedBoard [data-bacc="${k}"]`)].find(e => e.offsetWidth || e.offsetHeight); return s ? s.getAttribute('data-bval') : null }, key)
    await shotUnion(page, 'L4-1-board-mon-line1', [`#schedBoard [data-bfld="${key}"]`], { pad: 40 })
    check('L4.1 the board (working copy) suggests the new brief too', bsugB === sug1, `board suggests ${bsugB} (Edit Schedule ${sug1})`)
    const looked = await lookAt(page, MON, /./)
    if (looked) {
      const pvB = await page.evaluate(k => { const b = [...document.querySelectorAll(`#schedBoard [data-bfld="${k}"]`)].find(e => e.offsetWidth || e.offsetHeight); const g = [...document.querySelectorAll(`#schedBoard [data-bacc="${k}"]`)].find(e => e.offsetWidth || e.offsetHeight); return `B box "${b ? b.value : '(none)'}", suggestion ${g ? g.getAttribute('data-bval') : '(none drawn)'}` }, key)
      await shotUnion(page, 'L4-1-board-look-line1', [`#schedBoard [data-bfld="${key}"]`], { pad: 40 })
      await screen(page, 'L4-1-board-look-orig')
      note('L4.1 the board\'s 👁 look at the issued Monday, first line', pvB)
      await pvTap(page, MON, 'data-golive')
    } else { note('L4.1 board look', 'no issued row'); await menuClose(page) }

    const r2 = await setRule(page, 'briefLead', '2h20', 'L4-2-logic-brieflead-back')
    check('L4.2 brief lead put back to 140', !r2.error && r2.vconf === 140, ruleLine(r2))
    const c2 = await counts(page, MON)
    agree('L4.2 put back → 0 everywhere', c2, 0, 'brief lead put back')
    const v2 = await signVals(page, MON)
    check('L4.2 the four stand again', stand(v2, v0), `boxes ${JSON.stringify(v2)} (signed ${JSON.stringify(v0)})`)
    const fb2 = await faceB()
    await editWeek(page)
    const sug2 = await page.evaluate(k => { const s = [...document.querySelectorAll(`#eWeek [data-bacc="${k}"]`)].find(e => e.offsetWidth || e.offsetHeight); return s ? s.getAttribute('data-bval') : null }, key)
    check('L4.2 face and working copy print the same brief again', fb2 === fb0 && sug2 === sug0, `face "${fb2}", Edit Schedule suggests ${sug2}`)
  } finally { ALL_ERRORS.push(...errors.map(e => 'L4 ' + e)); await browser.close() }
}

if (want('L1')) await worldL1()
if (want('L2')) await worldL2()
if (want('L3')) await worldL3()
if (want('L4')) await worldL4()
check('no console errors', !ALL_ERRORS.length, ALL_ERRORS.slice(0, 5).join(' | '))
process.exitCode = summary(`late-pub logic walk (${W})`) ? 1 : 0
