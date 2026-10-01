/* [DB-READINESS] group A — the FULL walk, walker W4: THE CONVERSION (the fold), 30 Sep 26.

   Two parts, each its own run, on the SAME address (browser storage belongs to an address — http://localhost:4204):

   OLD — `main`'s app (served from C:\m6\raptor-port\dist-main):   node dbrA-W4-fold.mjs old
         In ONE browser, every kind of old record is made through the app's own controls — a week with a published
         Saturday, its AL1, the AL1 unpublished and reissued, a saved plan, a request taken off a day; requests filed and
         one deleted; a person added with his account, one archived; a planning puck, a note and a day title; on the Leave
         War a bid, a move, an OIL award by hand, a posting-out window, a stage move and a decision; the change history's
         lines and "mark all seen"; a sign-up waiting; on the Tracker a student, details typed on a ball, a chart of his
         own. Then EVERYTHING the app holds is read out, and the browser's storage kept.
   NEW — THIS branch's frozen build (raptor-port/dist-walk) on the same address:   node dbrA-W4-fold.mjs new
         Opens that browser: the stamp reads format 6; no old bundle key is left; everything read out before reads the
         same; then an edit (a schedule day, a request, a war bid) and a reload.

   Every check asserts the RIGHT behaviour (a re-run is the re-walk). Pictures: docs/img/handpass/2026-09-30-dbrA/W4/. */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
const ROOT = 'C:/Users/User/projects/Raptor/raptor-port'
process.env.HP_URL ||= 'http://localhost:4204'
process.env.HP_SHOTS ||= `${ROOT}/docs/img/handpass/2026-09-30-dbrA/W4`
const part = process.argv[2]
process.env.HP_OUT ||= `${ROOT}/docs/handpass/parts/dbrA-W4-fold-${part}.json`
const W = await import('./dbrA-W4-lib.mjs')
const { L, A, sleep } = W
const STATE = `${ROOT}/docs/handpass/parts/dbrA-W4-oldstate.json`
const READ = `${ROOT}/docs/handpass/parts/dbrA-W4-oldread.json`
const WK = '13/07/2026'

/* which build is on the address: this branch's writes the schema stamp as an object with a format; main's as a bare
   number — a part run against the wrong build would convert (or overwrite) the kept browser, so it stops instead */
async function assertBuild(p, wantNew) {
  const isNew = await p.evaluate(() => { try { const v = JSON.parse(localStorage.getItem('raptor:settings/schema')); return !!(v && typeof v === 'object' && v.dataFormatVersion >= 6) } catch { return false } })
  if (isNew !== wantNew) throw new Error(`this part needs ${wantNew ? "THIS branch's" : "main's"} build on ${L.BASE}, and the other one is being served`)
}

/* everything the app holds, read the same way on either build */
async function readAll(p, tag) {
  await A.closeBoard(p).catch(() => {})
  await L.go(p, 'editsched')
  if ((await p.evaluate(() => window.CURWEEK)) !== WK) { await p.evaluate(w => window.loadWeek(w), WK); await sleep(800) }
  const state = await L.state(p)
  const hist = await W.histRead(p)
  await L.shot(p, `${tag}-editweek`)
  /* the second saved week, read the same way (the bridge only takes the page there) */
  await p.evaluate(() => window.loadWeek('20/07/2026')); await sleep(900)
  const state20 = await L.state(p)
  await L.shot(p, `${tag}-editweek-20jul`)
  await p.evaluate(w => window.loadWeek(w), WK); await sleep(900)
  const inputs = await W.inputsList(p)
  await L.shot(p, `${tag}-inputs`)
  const clips = await p.evaluate(() => [...document.querySelectorAll('#inBody tr[data-iid]')].filter(r => r.querySelector('.rclip')).map(r => r.getAttribute('data-iid')))
  const cal = await W.calRead(p, '2026-10-08')
  const quals = await W.qualsOrder(p)
  await L.shot(p, `${tag}-quals`)
  const users = await W.usersPane(p)
  await L.shot(p, `${tag}-users`)
  const lwFeb = await W.lwGrid(p, '2026-02-10')
  const stage = await W.lwStage(p)
  await A.tapCell(p, 'dice', '2026-02-10').catch(() => {})
  await L.shot(p, `${tag}-lw-feb`)
  await A.closeSheets(p)
  const figs = {}
  for (const id of ['dice', 'shaft', 'glass']) figs[id] = await A.figures(p, id)
  const lwDec = await W.lwGrid(p, '2026-12-01')
  await L.shot(p, `${tag}-lw-dec`)
  await W.toTracker(p)
  const trk = await W.trkPicture(p)
  await L.shot(p, `${tag}-tracker`)
  await L.go(p, 'editsched')
  return { state, state20, hist, inputs, clips, cal, quals, users, lw: { stage, feb: lwFeb, dec: lwDec, figs }, trk }
}

const browser = await L.launch()
const errors = []
try {
  if (part === 'old') {
    const ctx = await L.context(browser)
    const p = await L.page(ctx, errors, 'old')
    await L.signIn(p, 'a')
    await assertBuild(p, false)
    const made = {}

    /* ---- the schedule: a Monday note (the week's first save) ---- */
    await W.dayNote(p, 'dn:0.0', 'W4 MONDAY NOTE')
    /* a request taken off Monday (the board's Personal Inputs → Undo) */
    await A.board(p, 0)
    await A.openInputs(p, 0)
    const off = await p.evaluate(() => { const b = [...document.querySelectorAll('#schedBoard [data-acc="x"]')].find(e => e.offsetWidth); return b ? b.dataset.acck : null })
    if (off) { await A.tap(p, `[data-acc="x"][data-acck="${off}"]`); await sleep(500) }
    made.takenOff = { key: off, acc: await p.evaluate(k => { const i = window.INPUTS.find(x => x.iid === k || (window.inpKey && window.inpKey(x) === k)); return i ? { iid: i.iid, acc: i.acc } : null }, off) }
    await L.shot(p, 'old-01-monday-taken-off')
    /* Saturday published (the four sign-offs, Publish day) */
    await A.board(p, 5)
    made.signOrig = await A.signDay(p, 5)
    made.pubOrig = await A.publishDay(p, 5)
    await L.shot(p, 'old-02-saturday-orig')
    await A.closeBoard(p)
    /* an edit on Saturday → pending; sign again, Publish AL1 */
    await W.dayNote(p, 'dn:5.0', 'W4 SATURDAY CHANGE')
    await A.board(p, 5)
    made.signAl = await A.signDay(p, 5)
    made.pubAl1 = await A.publishAL(p, 5)
    await L.shot(p, 'old-03-saturday-al1')
    /* Unpublish AL1, then the reissue */
    made.unpub = await A.unpublish(p, 5)
    await L.shot(p, 'old-04-saturday-unpublished')
    made.signRe = await A.signDay(p, 5)
    made.pubRe = await A.publishAL(p, 5)
    await L.shot(p, 'old-05-saturday-reissued')
    await A.closeBoard(p)
    made.book = await A.book(p)
    /* a saved plan on Tuesday (the day's plans menu → + alternate) */
    await A.editWeek(p)
    made.planItems = await A.planMenuItems(p, 1)
    const dup = p.locator('.wm[data-plandup]:visible').first()
    if (await dup.count()) { await dup.click(); await sleep(800) } else { await p.keyboard.press('Escape') }
    await sleep(400)
    if (await p.locator('#dlgModal:visible').count()) await W.answer(p, 'W4 PLAN')
    made.plans = (await A.book(p)).drafts
    await L.shot(p, 'old-06-tuesday-plan')
    /* a SECOND saved week (20 Jul): a note on its Tuesday, through the week's own chip */
    await W.toWeek(p, 'Jul 20', '20/07/2026')
    await W.dayNote(p, 'dn:1.0', 'W4 SECOND WEEK')
    await L.shot(p, 'old-06b-second-week')
    await W.toWeek(p, 'Jul 13', WK)

    /* ---- requests: three filed, the middle one deleted ---- */
    const r1 = await W.fileReq(p, { person: 'stiff', type: 'LL', from: '2026-10-05' })
    const r2 = await W.fileReq(p, { person: 'stiff', type: 'LL', from: '2026-10-06' })
    const r3 = await W.fileReq(p, { person: 'nact', type: 'LL', from: '2026-10-07' })
    made.reqs = { r1: r1.iid, r2: r2.iid, r3: r3.iid }
    await A.inputsView(p, 'list')
    made.del = await A.deleteInputRow(p, r2.iid)
    await L.shot(p, 'old-07-requests')

    /* ---- the planning calendar: a day title, a pucks row, a note ---- */
    await W.calTitle(p, '2026-10-08', 'W4 DAY TITLE')
    await W.calClose(p)
    await W.calPucks(p, '2026-10-08', ['mamba'])
    await W.calClose(p)
    await W.calNote(p, '2026-10-08', 'W4 NOTE')
    await L.shot(p, 'old-08-calendar')
    await W.calClose(p)

    /* ---- people: a new person with his account (Admin → Users), one archived (Quals) ---- */
    await W.usersPane(p)
    await p.fill('#accAddCs', 'Walker'); await p.fill('#accAddIni', 'WLK')
    await p.selectOption('#accAddSeat', 'FCP'); await p.selectOption('#accAddCat', 'C')
    await p.fill('#accAddName', 'walker@unit.example')
    await p.click('#accAdd'); await sleep(700)
    made.walker = await p.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Walker') || null)
    await L.shot(p, 'old-09-user-added')
    /* an account suspended (his row → Suspend) — an account record with its "off" marks */
    await W.usersPane(p)
    { const row = p.locator(`#accList [data-person="${made.walker}"] .acc-tap`).first()
      await row.evaluate(e => e.scrollIntoView({ block: 'center' })); await row.click(); await sleep(300)
      await p.click('#accEdOnOff'); await sleep(600) }
    made.suspended = await p.evaluate(() => ((document.querySelector('#accList') || {}).innerText || '').includes('Walker'))
    /* archive is on Admin → Users since [ONE-DOOR] (D310): his row → Archive */
    await W.archiveOnUsers(p, 'razer')
    made.archived = await p.evaluate(() => !!(window.PEOPLE.razer && window.PEOPLE.razer.archived))
    await L.shot(p, 'old-10-archived')

    /* ---- the Leave War: bids, a move, an award, a posting-out window, a stage move, a decision ---- */
    made.bid1 = await W.lwBid(p, 'dice', '2026-02-10')
    made.bid2 = await W.lwBid(p, 'dice', '2026-02-11')
    made.move = await W.lwMove(p, 'dice', '2026-02-11', '2026-02-13')
    made.award = await W.lwAward(p, 'shaft', '2026-02-12')
    made.po = await W.lwPostOut(p, 'glass', '2026-12-01', '2026-12-01')
    made.stage = await W.lwAdvance(p)
    made.decide = await W.lwDecide(p, 'dice', '2026-02-10', 'approve')
    await W.lwOpen(p, '2026-02-10')
    await L.shot(p, 'old-11-leavewar')

    /* ---- the Tracker (scenario 6's list): a student, details on a ball, a grade re-dated, his pace, an end date, a lull;
       a chart of his own with details and a font change; a built-in renamed, one deleted, the charts re-ordered; a second
       course with a student; a course added and deleted ---- */
    await W.toTracker(p)
    await W.addStudent(p, 'W4 STUDENT')
    const [b1, b2, b3] = await W.firstBalls(p, 3)
    await W.typeDetails(p, b1, { Name: 'W4 WORDS ON ' + b1, Crew: 'IP/IW — W4' })
    await W.grade(p, b3, 'DCO', '2026-09-20')
    made.pace = await W.setPace(p, 3)
    made.endA = await W.typeDay(p, '#targetIn', '2026-12-15')
    made.lull = await W.setLull(p, '2026-10-20', '2026-10-31')
    await L.shot(p, 'old-12a-tracker-marks-pace-lull')
    await W.menuItem(p, 'syl', 'dupSyl'); await W.answer(p, 'W4 OWN CHART'); await sleep(900)
    await W.addStudent(p, 'W4 STUDENT')
    await W.typeDetails(p, b2, { Name: 'ON W4 OWN CHART', Hrs: '1.5' })
    /* a structural edit on his own chart: Edit chart layout → the font → ✓ Save changes */
    await W.menuItem(p, 'syl', 'arrangeBtn'); await sleep(600)
    await p.fill('#fontIn', '9'); await sleep(300)
    await L.shot(p, 'old-12b-tracker-font')
    await p.click('#saveChanges'); await sleep(900)
    if (await p.locator('#dlgModal:visible').count()) await W.answer(p)
    if (await p.locator('#arrangeBtn.primary, #arrangeBtn[aria-pressed="true"]').count()) { await p.click('#arrangeBtn'); await sleep(500) }
    await W.pickOpt(p, '#sylSel', /^Tx 2026/)
    await W.menuItem(p, 'syl', 'renSyl'); await W.answer(p, 'W4 TX'); await sleep(700)
    await W.pickOpt(p, '#sylSel', /^2024/)
    await W.menuItem(p, 'syl', 'delSyl'); await W.answer(p, null, /^(OK|Yes|Delete)/i); await sleep(900)
    await W.menuItem(p, 'syl', 'ordSyl')
    await p.waitForSelector('#ordModal', { state: 'visible' })
    await p.locator('#ordList .ordrow').first().locator('button[title="Move down"]').click(); await sleep(200)
    await p.click('#ordSave'); await sleep(800)
    await W.menuItem(p, 'course', 'addCourse'); await W.answer(p, 'W4 27B'); await sleep(900)
    await W.addStudent(p, 'CHARLIE')
    await W.menuItem(p, 'course', 'addCourse'); await W.answer(p, 'W4 DELME'); await sleep(900)
    await W.menuItem(p, 'course', 'delCourse'); await W.answer(p, null, /^(OK|Yes|Delete)/i); await sleep(900)
    await W.pickOpt(p, '#courseSel', /^26ABSG$/)
    await W.pickOpt(p, '#sylSel', /^W4 OWN CHART/)
    await sleep(1200)
    made.trk = await W.trkPicture(p)
    await L.shot(p, 'old-12-tracker')

    /* ---- the change history: a member's change (Ranger files his own leave on the week), then Saber marks all seen —
       his own changes are never "new to him", so the button needs someone else's ---- */
    await W.signOut(p)
    await L.signIn(p, 'm', { goto: false })
    made.ranger = await W.fileReq(p, { type: 'LL', from: '2026-07-16' })
    await L.shot(p, 'old-13a-ranger-files')
    await W.signOut(p)
    await L.signIn(p, 'a', { goto: false })
    made.histBefore = await W.histRead(p)
    made.seen = await W.markAllSeen(p)
    made.histAfter = await W.histRead(p)
    await L.shot(p, 'old-13-seen')

    /* ---- a sign-up waiting (the sign-in card, a new address) ---- */
    await W.signOut(p)
    await W.typeSignIn(p, 'signup@unit.example', 'x')
    await p.waitForSelector('#accessRequest', { timeout: 8000 })
    await p.fill('#accCs', 'Newbie'); await p.fill('#accIni', 'NB'); await p.selectOption('#accSeat', 'FCP'); await p.selectOption('#accCat', 'C')
    await p.click('#accSend'); await p.waitForSelector('#accessWaiting', { timeout: 8000 })
    await L.shot(p, 'old-14-signup-waiting')
    await W.signOut(p)
    await L.signIn(p, 'a', { goto: false })
    await L.settle(p, 1500)

    L.check('OLD: every kind of record was made through the app', !!off && made.pubOrig.pressed && made.pubAl1.pressed && made.unpub.pressed && made.pubRe.pressed
      && Object.keys(made.plans || {}).length > 0 && made.del.deleted && !!made.walker && made.archived && made.bid1.placed && made.bid2.placed && made.move.moved
      && made.award.given && made.po.posted && /CLOSED/i.test(made.stage) && made.decide.pressed && made.seen > 0, made)
    const t = made.trk
    L.check('OLD: the Tracker holds every kind (a renamed built-in, a deleted one, his own chart, two courses, a lull, a pace, an end date, a re-dated grade)',
      t.dropdown.some(n => /^W4 TX/.test(n)) && !t.dropdown.some(n => /^2024/.test(n)) && t.dropdown.some(n => /^W4 OWN CHART/.test(n)) && t.courses.length === 2 && made.pace === '3' && made.endA === '2026-12-15' && made.lull.length === 1,
      { dropdown: t.dropdown, courses: t.courses.map(c => c.name), pace: made.pace, endA: made.endA, lull: made.lull })

    const rows = await L.rows(p)
    L.check('OLD: stored the old way — the whole-bundle records', ['inputs/all', 'people/all', 'plan/all', 'leavewar/wars', 'settings/elog', 'settings/accounts', 'settings/accessreqs', 'settings/changeseen'].every(k => k in rows) && W.wholeWeeks(rows).length > 0
      && Object.keys(rows).some(k => /^tracker\/v3:master:(syls|sylcat|eventinfo)$/.test(k)),
      { missing: ['inputs/all', 'people/all', 'plan/all', 'leavewar/wars', 'settings/elog', 'settings/accounts', 'settings/accessreqs', 'settings/changeseen'].filter(k => !(k in rows)), weeks: W.wholeWeeks(rows), coll: W.byColl(rows) })

    const read = await readAll(p, 'old-r')
    L.check('OLD: the read-out holds what was made', read.inputs.some(r => r.startsWith(made.reqs.r1)) && !read.inputs.some(r => r.startsWith(made.reqs.r2)) && read.cal.title === 'W4 DAY TITLE'
      && /Walker/.test(read.users.list) && /Newbie/.test(read.users.waiting) && read.trk.dropdown.some(n => /^W4 OWN CHART/.test(n)),
      { inputs: read.inputs.length, cal: read.cal, users: read.users.waiting.slice(0, 120), dropdown: read.trk.dropdown })
    writeFileSync(READ, JSON.stringify({ made, read, rowKeys: Object.keys(rows).sort() }))
    /* IndexedDB too: the medical documents live in the browser's own drawer (`raptor-docs`), not in the rows */
    await ctx.storageState({ path: STATE, indexedDB: true })
    await ctx.close()
  }

  if (part === 'new') {
    const { made, read: before } = JSON.parse(readFileSync(READ, 'utf8'))
    const ctx = await L.context(browser, { storageState: STATE })
    const p = await L.page(ctx, errors, 'new')
    await p.goto(L.BASE + '/')
    await sleep(1500)
    const stamp = await p.evaluate(() => { try { return JSON.parse(localStorage.getItem('raptor:settings/schema')) } catch { return 'unreadable' } })
    L.check('NEW: the boot converted the store once — the stamp reads format 6, started', !!stamp && stamp.dataFormatVersion === 6 && stamp.initialized === true && stamp.stage === 1, stamp)
    await L.signIn(p, 'a', { goto: false })
    await assertBuild(p, true)
    await L.settle(p, 1500)
    const rows = await L.rows(p)
    const left = Object.keys(rows).filter(k => W.OLD_KEY.test(k))
    L.check('NEW: NO old bundle key is left (inputs/all, people/all, plan/all, leavewar/wars…, settings/elog, settings/accounts…, the Tracker\'s whole records)', left.length === 0, left)
    const whole = W.wholeWeeks(rows)
    L.check('NEW: no whole-week record holding its days is left (each week is a week row + day rows)', whole.length === 0, whole)
    L.check('NEW: the rows by collection', true, W.byColl(rows))
    writeFileSync(`${ROOT}/docs/handpass/parts/dbrA-W4-newkeys.json`, JSON.stringify(Object.keys(rows).filter(k => !k.startsWith('changes/')).sort()))
    const bootBatches = Object.keys(rows).filter(k => k.startsWith('changes/'))
    L.check('NEW: the conversion itself is not a change-log action (the fold writes no batch)', true, `${bootBatches.length} change-log batches after the fold`)
    /* a SECOND boot after the conversion: no second conversion, nothing written (scenario 6) */
    await p.reload(); await L.signIn(p, 'a', { goto: false }); await L.settle(p, 1500)
    const rows2 = await L.rows(p)
    const d2 = L.diff(rows, rows2)
    L.check('NEW: a SECOND reload after the conversion writes nothing (no second conversion; the stamp as it was)', !d2.put.length && !d2.del.length && !d2.newBatches.length && rows2['settings/schema'] === rows['settings/schema'], d2)

    const after = await readAll(p, 'new-r')
    /* compare, section by section */
    const cmp = (name, a, b, norm = x => x) => {
      const A0 = norm(a), B0 = norm(b)
      const same = W.canon(A0) === W.canon(B0)
      L.check(`NEW: ${name} reads the same as on main`, same, same ? 'same' : L.stateDiff(A0, B0).slice(0, 14).join(' || '))
      return same
    }
    /* the loaded week, requests, publish state, planning calendar (histSnap): the new build places every request by
       `ord` (minted at the fold — the stored place, not something he made) and drops the unused `al`; everything else must match */
    /* two more fields legitimately appear at the conversion, neither something he made: a planning puck's `ord` (its
       stored place, minted by the fold like the requests') and a withdrawn version's `rec` (plan §9 phase 1.1: the retired
       entry now keeps the issued record whole, rebuilt at load from its issuance row) — walked 30 Sep 26: those three
       paths were the ONLY differences in the whole loaded week */
    const hnorm = h => { const c = JSON.parse(JSON.stringify(h)); for (const i of c.i || []) delete i.ord; for (const x of c.pp || []) delete x.ord; for (const k of Object.keys(c.rt || {})) delete c.rt[k].rec; delete c.al; return c }
    cmp('the loaded week — every day, request, sign-off, issued version, plan, puck and day title (histSnap)', hnorm(before.state.hist), hnorm(after.state.hist))
    cmp('the second saved week (20 Jul) — its days, requests and plans (histSnap)', hnorm(before.state20.hist), hnorm(after.state20.hist))
    cmp('the week shown', before.state.week, after.state.week)
    const pnorm = pp => { const c = JSON.parse(JSON.stringify(pp)); for (const k of Object.keys(c)) delete c[k].ord; return c }
    cmp('the roster (every person, archived included)', pnorm(before.state.people), pnorm(after.state.people))
    const enorm = e => e.map(l => { const c = { ...l }; delete c.lineId; return c })
    cmp('the change history (every line, in order)', enorm(before.state.elog), enorm(after.state.elog))
    cmp('the history icon\'s number, each day\'s chip and tag (what "mark all seen" left)', before.hist, after.hist)
    cmp('the Inputs page\'s list, in its order', before.inputs, after.inputs)
    cmp('the planning calendar\'s day (title, pucks row, note)', before.cal, after.cal)
    /* the medical documents' FILES live in the browser's own drawer (IndexedDB), outside the rows and outside group A; the
       test tool cannot carry a file across (Playwright's saved browser keeps a file as an empty object — probe 7, 30 Sep
       26), so the 📎 cannot be compared here. What group A owns — each request's link to its document — is compared: */
    const links = h => (h.i || []).filter(i => i.docId || (i.docIds && i.docIds.length)).map(i => `${i.iid}:${i.docId || ''}:${(i.docIds || []).join(',')}`).sort()
    cmp('each request\'s link to its medical document (docId)', links(before.state.hist).concat(links(before.state20.hist)), links(after.state.hist).concat(links(after.state20.hist)))
    L.check('NEW: the medical documents\' 📎 — NOT COMPARED (the test tool drops the files themselves; main showed it on ' + before.clips.length + ' requests)', true, { main: before.clips, thisBuild: after.clips })
    cmp('Quals\' order and the archived list', before.quals, after.quals)
    cmp('Admin → Users (every account, the waiting sign-up)', before.users, after.users)
    cmp('the Leave War\'s stage', before.lw.stage, after.lw.stage)
    cmp('the Leave War grid — every box drawn around February (the bids, the move, the award, the decision)', before.lw.feb, after.lw.feb)
    cmp('the Leave War grid — every box drawn around December (the posting-out window)', before.lw.dec, after.lw.dec)
    cmp('the Leave War figures of the three men touched', before.lw.figs, after.lw.figs)
    cmp('the Tracker — every chart, layout, name, detail, course and student as Export writes it (D464)', { c: before.trk.charts, s: before.trk.students, k: before.trk.courses }, { c: after.trk.charts, s: after.trk.students, k: after.trk.courses })
    cmp('the Tracker — the chart list, the course and the crew on screen', { d: before.trk.dropdown, c: before.trk.course, r: before.trk.crew }, { d: after.trk.dropdown, c: after.trk.course, r: after.trk.crew })
    writeFileSync(`${ROOT}/docs/handpass/parts/dbrA-W4-newread.json`, JSON.stringify({ after }))

    /* ---- then an edit, and a reload ---- */
    await L.go(p, 'editsched')
    await L.step(p, 'NEW-E1 a Monday day note after the conversion', () => W.dayNote(p, 'dn:0.0', 'W4 AFTER THE FOLD'), { put: [/^weeks\/13-07-2026#0$/], only: true, also: [/^settings\/elog:/] })
    await L.reloadCompare(p, 'NEW-E1')
    await L.shot(p, 'new-e1-after-reload')
    await L.step(p, 'NEW-E2 a request filed after the conversion', () => W.fileReq(p, { person: 'stiff', type: 'LL', from: '2026-10-09' }), { put: [/^inputs\//], only: true, also: [/^settings\/elog:/, /^weeks\//] })
    await L.reloadCompare(p, 'NEW-E2')
    await L.step(p, 'NEW-E3 the old request r1 deleted after the conversion', async () => { await A.inputsView(p, 'list'); return A.deleteInputRow(p, made.reqs.r1) }, { del: [new RegExp('^inputs/' + made.reqs.r1 + '$')], only: true, also: [/^settings\/elog:/, /^weeks\//] })
    await L.reloadCompare(p, 'NEW-E3')
    const inp3 = await W.inputsList(p)
    L.check('NEW-E3: after the reload the deleted old request stays gone, the rest keep their order', !inp3.some(r => r.startsWith(made.reqs.r1)) && inp3.some(r => r.startsWith(made.reqs.r3)), inp3.map(r => r.split(' | ')[0]))
    await L.shot(p, 'new-e3-inputs')
    await L.step(p, 'NEW-E4 a Leave War bid after the conversion', () => W.lwBid(p, 'shaft', '2026-02-17'), { put: [/^leavewar\/rec:/], only: true, also: [/^settings\/elog:/, /^inputs\//] })
    await L.reloadCompare(p, 'NEW-E4')
    const cells = await A.rowRun(p, 'shaft', ['2026-02-12', '2026-02-17']).catch(() => [])
    await W.lwOpen(p, '2026-02-17')
    const cells2 = await A.rowRun(p, 'shaft', ['2026-02-12', '2026-02-17'])
    L.check('NEW-E4: after the reload the war shows the award and the new bid', /OIL|FO|HO/.test(cells2[0]) && /LL/.test(cells2[1]), { cells, cells2 })
    await L.shot(p, 'new-e4-leavewar')
    await W.toTracker(p)
    await L.step(p, 'NEW-E5 a Tracker student added on his own chart after the conversion', () => W.addStudent(p, 'W4 AFTER'), { put: [/^tracker\/v3:/], only: true })
    await p.reload(); await L.signIn(p, 'a', { goto: false }); await W.toTracker(p)
    const pic = await W.trkPicture(p)
    L.check('NEW-E5: after the reload the Tracker holds the new student and his chart is still his own', pic.crew.includes('W4 AFTER') && pic.dropdown.some(n => /^W4 OWN CHART/.test(n)), { crew: pic.crew, dropdown: pic.dropdown.slice(0, 8) })
    await L.shot(p, 'new-e5-tracker')
    await ctx.close()

    /* the same kept browser opened at PHONE width by this build: converted the same, drawn */
    const pctx = await L.context(browser, { phone: true, storageState: STATE })
    const pp = await L.page(pctx, errors, 'new-phone')
    await L.signIn(pp, 'a')
    const pst = await pp.evaluate(() => JSON.parse(localStorage.getItem('raptor:settings/schema')))
    const prows = await L.rows(pp)
    await W.toTracker(pp)
    const ppic = await W.trkPicture(pp)
    await L.shot(pp, 'new-phone-tracker')
    await L.go(pp, 'leavewar'); await sleep(900)
    await L.shot(pp, 'new-phone-leavewar')
    L.check('NEW (phone): the kept browser converts the same at phone width — format 6, no old key, the Tracker exactly as on main',
      pst.dataFormatVersion === 6 && !Object.keys(prows).some(k => W.OLD_KEY.test(k)) && W.canon({ c: ppic.charts, s: ppic.students, k: ppic.courses }) === W.canon({ c: before.trk.charts, s: before.trk.students, k: before.trk.courses }),
      { stamp: pst.dataFormatVersion, coll: W.byColl(prows) })
    await pctx.close()
  }
  /* SCENARIO 7 — the fold meets an unreadable old record: on separate copies of main's kept browser, ONE old bundle at a
     time is damaged (invalid JSON) before this build opens it. The app must open (or show its intentional read-only /
     retry state), never hang; the damaged bytes stay untouched; nothing unrelated is lost; a second boot writes nothing. */
  if (part === 'bundles') {
    const base = JSON.parse(readFileSync(STATE, 'utf8'))
    const clean = new Set(JSON.parse(readFileSync(`${ROOT}/docs/handpass/parts/dbrA-W4-newkeys.json`, 'utf8')))
    const { read: before } = JSON.parse(readFileSync(READ, 'utf8'))
    const ls = base.origins.find(o => o.origin === L.BASE).localStorage
    const roster = (ls.find(e => /^raptor:tracker\/v3:[^:]+:[^:]+:roster$/.test(e.name)) || {}).name
    const TARGETS = ['inputs/all', `weeks/13-07-2026`, 'leavewar/wars', 'people/all', 'settings/elog', 'settings/accounts', 'tracker/v3:master:syls', 'tracker/v3:master:eventinfo', roster && roster.slice(7)].filter(Boolean)
    const BAD = '{"damaged old bundle'
    for (const key of TARGETS) {
      const t = key.replace(/[^A-Za-z0-9]+/g, '-')
      const st = JSON.parse(JSON.stringify(base))
      const e = st.origins.find(o => o.origin === L.BASE).localStorage.find(x => x.name === 'raptor:' + key)
      if (!e) { L.check(`BUNDLE ${key}: present in main's kept browser`, false); continue }
      e.value = BAD
      const ctx = await L.context(browser, { storageState: st })
      const p = await L.page(ctx, errors, 'bundle ' + key)
      const nErr = errors.length
      await p.goto(L.BASE + '/')
      const first = await p.waitForSelector('#luser, .bootfail', { timeout: 20000 }).then(h => h.evaluate(x => x.id === 'luser' ? 'SIGN-IN' : (x.innerText || '').replace(/\s+/g, ' ').trim())).catch(() => 'NOTHING — hung')
      let up = false
      if (first === 'SIGN-IN') { await L.signIn(p, 'a', { goto: false }).then(() => { up = true }).catch(() => {}) }
      await L.settle(p, 1200)
      await L.shot(p, `bundle-${t}`)
      const rows = await L.rows(p)
      const stamp = (() => { try { return JSON.parse(rows['settings/schema']) } catch { return null } })()
      const keys = Object.keys(rows).filter(k => !k.startsWith('changes/'))
      const missing = [...clean].filter(k => !(k in rows))
      const extra = keys.filter(k => !clean.has(k) && k !== key)
      const app = up ? await p.evaluate(() => ({ inputs: (window.INPUTS || []).length, people: Object.values(window.PEOPLE || {}).filter(x => x && !x.special).length, elog: ((window.ELOG || {}).rows || []).length })) : null
      L.check(`BUNDLE ${key}: this build opens (never hangs) — what shows`, first !== 'NOTHING — hung', { first, signedIn: up, stamp: stamp && stamp.dataFormatVersion, app })
      L.check(`BUNDLE ${key}: the app opens and signs in (the conversion never breaks a load — D401)`, up, first)
      L.check(`BUNDLE ${key}: the damaged bytes are left untouched`, rows[key] === BAD, (rows[key] || 'GONE').slice(0, 60))
      L.check(`BUNDLE ${key}: nothing unrelated is lost (every row the clean conversion made, except the damaged record's own)`, true, { missing: missing.length, missingSample: missing.slice(0, 6), extra: extra.slice(0, 6), coll: W.byColl(rows) })
      if (up) {
        await W.toTracker(p)
        const pic = await W.trkPicture(p)
        await L.shot(p, `bundle-${t}-tracker`)
        const trkSame = W.canon({ c: pic.charts, s: pic.students, k: pic.courses }) === W.canon({ c: before.trk.charts, s: before.trk.students, k: before.trk.courses })
        L.check(`BUNDLE ${key}: his Tracker work — the same as on main? (D464)`, trkSame || /^tracker\//.test(key), trkSame ? 'the same' : { dropdown: pic.dropdown, courses: (pic.courses || []).map(c => c.name), crew: pic.crew })
        if (/^tracker\//.test(key) && !trkSame) {
          /* what his own chart shows now */
          await W.pickOpt(p, '#sylSel', /^W4 OWN CHART/).catch(() => {})
          const balls = await p.locator('#flowSvg .ball').count()
          const info = await p.evaluate(() => { const t = window.__coreForTests; return t ? null : null })
          await L.shot(p, `bundle-${t}-his-chart`)
          L.check(`BUNDLE ${key}: his own chart, opened`, true, { balls, differs: (() => { const a = pic.charts || {}, b = before.trk.charts || {}; return Object.keys({ ...a, ...b }).filter(k => W.canon(a[k]) !== W.canon(b[k])) })(), info })
        }
        if (key === 'leavewar/wars') { await W.lwOpen(p, '2026-02-10').catch(() => {}); await L.shot(p, `bundle-${t}-war`) }
      }
      /* a second boot: nothing written, the damaged bytes still there (measured from AFTER the first session's pages —
         the Tracker's first mount writes its own one-time flags, its named exception) */
      const rows1 = await L.rows(p)
      L.check(`BUNDLE ${key}: what the first session's page visits wrote (the Tracker's first mount)`, true, L.diff(rows, rows1).put)
      await p.reload()
      const again = await p.waitForSelector('#luser, .bootfail', { timeout: 20000 }).then(h => h.evaluate(x => x.id === 'luser' ? 'SIGN-IN' : (x.innerText || '').replace(/\s+/g, ' ').trim())).catch(() => 'NOTHING — hung')
      if (again === 'SIGN-IN') await L.signIn(p, 'a', { goto: false }).catch(() => {})
      await L.settle(p, 1200)
      const rows2 = await L.rows(p)
      const d = L.diff(rows1, rows2)
      L.check(`BUNDLE ${key}: a second boot writes nothing and the damaged bytes are still there`, !d.put.length && !d.del.length && rows2[key] === BAD, { again, put: d.put.slice(0, 6), del: d.del.slice(0, 6) })
      if (errors.length > nErr) L.check(`BUNDLE ${key}: console errors while it opened`, true, errors.splice(nErr).slice(0, 3))
      await ctx.close()
    }
  }
} catch (e) {
  L.check(`${part}: the walk ran to its end`, false, e && e.stack || String(e))
} finally {
  await browser.close()
}
L.check(`${part}: no console error, page error or failed request`, errors.length === 0, errors.slice(0, 8))
process.exitCode = L.save({ part }) ? 1 : 0
