/* [DB-READINESS] group A — the FULL walk, walker W4: THE SHARED STORE (30 Sep 26), on the build made for it
   (raptor-port/dist-blank — no demo, a first admin boss@unit.example from the build's settings), already served at
   http://localhost:4206. A fresh browser at each width:
     - the demo sign-in ad / a is REFUSED; the first admin signs in (any password);
     - every page opens (Edit Schedule, View-only Sched, Inputs, Quals, Logic, Help, Admin, the Leave War — "No leave period
       yet", its "Create the first period" — and the Tracker — "No course yet", "+ Add a course"); storage then holds only
       the stamp, his person, his account, the change log and the Tracker's own bookkeeping;
     - sign out and in again (nothing written), ad / a again now that the first admin exists (still refused);
     - the first period and the first course through those buttons, a request filed, a person added on Admin → Users;
       a reload — all there, nothing demo.
   node dbrA-W4-shared.mjs desktop | phone */
const ROOT = 'C:/Users/User/projects/Raptor/raptor-port'
const width = process.argv[2] === 'phone' ? 'phone' : 'desktop'
process.env.HP_URL ||= 'http://localhost:4206'
process.env.HP_SHOTS ||= `${ROOT}/docs/img/handpass/2026-09-30-dbrA/W4`
process.env.HP_OUT ||= `${ROOT}/docs/handpass/parts/dbrA-W4-shared-${width}.json`
const W = await import('./dbrA-W4-lib.mjs')
const { L, A, sleep } = W
const PH = width === 'phone'
const BOSS = ['boss@unit.example', 'anything at all']
const tag = PH ? 'shared-ph' : 'shared-dk'
/* the demo: its request ids, its people, its course and students, its war */
/* (the Tracker's `v3:seedstamp` is the stamp of the SHIPPED charts — D62 course content, not demo) */
const DEMO = /^leavewar\/(war:y20|rec:[^:]+:seed)|^inputs\/.*seed|26ABSG|STUDENT [AB]/

const browser = await L.launch()
const errors = []
try {
  const ctx = await L.context(browser, { phone: PH })
  const p = await L.page(ctx, errors, tag)
  await p.goto(L.BASE + '/')
  await p.waitForSelector('#luser', { state: 'visible', timeout: 15000 })
  await L.settle(p, 1200)
  const boot = await L.rows(p)
  const keys0 = Object.keys(boot).sort()
  const batches = keys0.filter(k => k.startsWith('changes/')).map(k => JSON.parse(boot[k]))
  L.check(`${tag} S0: a fresh shared store's first boot stores ONLY the stamp, one person, one account and one change-log batch (boot)`,
    keys0.length === 4 && keys0.includes('settings/schema') && keys0.filter(k => k.startsWith('people/')).length === 1 && keys0.filter(k => k.startsWith('settings/account:')).length === 1 && batches.length === 1 && batches[0].type === 'boot',
    keys0.map(k => k.startsWith('changes/') ? `${k} (${batches[0].type}/${(batches[0].items || []).length})` : k))
  const stamp = JSON.parse(boot['settings/schema'])
  L.check(`${tag} S0: the stamp is format 6, started`, stamp.dataFormatVersion === 6 && stamp.initialized === true, stamp)

  /* the demo admin is refused */
  const r0 = await L.rows(p)
  await W.typeSignIn(p, 'ad', 'a')
  const refused = await p.evaluate(() => ({ shell: !!document.querySelector('#shell'), card: !!document.querySelector('#accessRequest'), text: ((document.querySelector('#accessRequest, .login, #loginForm') || {}).innerText || '').replace(/\s+/g, ' ').slice(0, 160) }))
  await L.shot(p, `${tag}-01-demo-refused`)
  L.check(`${tag} S1: the demo sign-in ad / a is REFUSED (no app; the request-access card)`, !refused.shell, refused)
  L.check(`${tag} S1: …and the refused sign-in wrote nothing`, !L.diff(r0, await L.rows(p)).put.length)
  await W.signOut(p)

  /* the first admin */
  await L.step(p, `${tag} S2 the first admin signs in (any password)`, () => L.signIn(p, BOSS, { goto: false }), { none: true })
  const me = await p.evaluate(() => { const ps = Object.values(window.PEOPLE || {}).filter(x => x && !x.special); return { n: ps.length, cs: ps.map(x => x.cs) } })
  L.check(`${tag} S2: the roster holds him alone`, me.n === 1 && me.cs[0] === 'Boss', me)
  await L.shot(p, `${tag}-02-first-admin-in`)

  /* every page opens; nothing is written (the Tracker's first mount is its own named exception) */
  for (const pg of ['editsched', 'viewsched', 'inputs', 'quals', 'logic', 'help', 'admin', 'leavewar']) {
    await L.step(p, `${tag} S3 ${pg} opens`, async () => { await L.go(p, pg); await sleep(600) }, { none: true })
    const txt = await p.evaluate(x => ((document.querySelector('#page-' + x) || document.body).innerText || '').replace(/\s+/g, ' ').slice(0, 140), pg)
    L.check(`${tag} S3 ${pg}: what it shows`, txt.length > 0, txt)
    if (['editsched', 'inputs', 'admin'].includes(pg)) await L.shot(p, `${tag}-03-${pg}`)
  }
  await p.waitForSelector('#page-leavewar [data-testid="lw-empty"]', { state: 'visible', timeout: 10000 })
  const lwEmpty = (await p.locator('#page-leavewar [data-testid="lw-empty"]').innerText()).replace(/\s+/g, ' ')
  L.check(`${tag} S3: the Leave War says "No leave period yet" and offers "Create the first period"`, /no leave period yet/i.test(lwEmpty) && await p.locator('[data-testid="lw-first-war"]').isVisible(), lwEmpty)
  await L.shot(p, `${tag}-04-leavewar-empty`)
  const before = await L.rows(p)
  await L.go(p, 'tracker')
  await p.waitForSelector('#page-tracker [data-testid="trk-nocourse"]', { state: 'visible', timeout: 20000 })
  await L.settle(p, 1200)
  const trkTxt = (await p.locator('#page-tracker [data-testid="trk-nocourse"]').innerText()).replace(/\s+/g, ' ')
  L.check(`${tag} S3: the Tracker says "No course yet" with "+ Add a course"`, /no course yet/i.test(trkTxt) && await p.locator('[data-testid="trk-first-course"]').isVisible(), trkTxt)
  await L.shot(p, `${tag}-05-tracker-nocourse`)
  const afterPages = await L.rows(p)
  const trkNew = L.diff(before, afterPages)
  L.check(`${tag} S3: the Tracker's first mount wrote only its own bookkeeping — no course, no student, nothing outside the Tracker`,
    trkNew.put.every(k => k.startsWith('tracker/')) && !trkNew.del.length && !trkNew.put.some(k => /:enr:|master:course:/.test(k)) && !Object.entries(afterPages).some(([k, v]) => k.startsWith('tracker/') && /26ABSG|STUDENT/.test(v)),
    { put: trkNew.put, batches: trkNew.newBatches })
  const other = Object.keys(afterPages).filter(k => !k.startsWith('tracker/') && !keys0.includes(k))
  L.check(`${tag} S3: after every page, storage holds only the stamp, his person, his account, the change log and the Tracker's bookkeeping`, other.length === 0, other)

  /* sign out and in; the demo admin again */
  const r1 = await L.rows(p)
  await W.signOut(p)
  await W.typeSignIn(p, 'ad', 'a')
  const refused2 = await p.evaluate(() => !!document.querySelector('#shell'))
  L.check(`${tag} S4: ad / a is still refused now that the first admin exists`, !refused2)
  await L.shot(p, `${tag}-06-demo-refused-again`)
  await W.signOut(p)
  await L.signIn(p, BOSS, { goto: false })
  const d1 = L.diff(r1, await L.rows(p))
  L.check(`${tag} S4: signing out and in again wrote nothing`, !d1.put.length && !d1.del.length && !d1.newBatches.length, d1)

  /* the first period, through "Create the first period" */
  await L.go(p, 'leavewar')
  await L.step(p, `${tag} S5 the first period (Create the first period → the New-war sheet → Create)`, async () => {
    await p.click('[data-testid="lw-first-war"]')
    await p.waitForSelector('[data-testid="war-sheet"]', { state: 'visible' })
    await p.fill('[data-testid="war-name"]', 'W4 FIRST PERIOD')
    for (let i = 0; i < 12 && !(await p.locator('[data-testid="war-day-2026-11-02"]').count()); i++) { await p.click('[data-testid="war-next-month"]'); await sleep(150) }
    await p.click('[data-testid="war-day-2026-11-02"]'); await sleep(150)
    for (let i = 0; i < 12 && !(await p.locator('[data-testid="war-day-2026-12-31"]').count()); i++) { await p.click('[data-testid="war-next-month"]'); await sleep(150) }
    await p.click('[data-testid="war-day-2026-12-31"]'); await sleep(150)
    await L.shot(p, `${tag}-07-new-war-sheet`)
    await p.click('[data-testid="war-create"]'); await sleep(900)
  }, { put: [/^leavewar\/war:/], only: true, also: [/^leavewar\//, /^settings\/elog:/] })
  await sleep(600)
  const picker = await p.evaluate(() => ({ empty: !!document.querySelector('[data-testid="lw-empty"]'), rows: document.querySelectorAll('[data-testid^="row-"]').length, text: ((document.querySelector('#page-leavewar') || {}).innerText || '').replace(/\s+/g, ' ').slice(0, 160) }))
  L.check(`${tag} S5: the war page now draws the period (the empty card gone, his row drawn)`, !picker.empty && picker.rows >= 1, picker)
  await L.shot(p, `${tag}-08-first-period`)
  await L.reloadCompare(p, `${tag} S5`, BOSS, { page: 'leavewar' })

  /* the first course, through "+ Add a course" */
  await L.go(p, 'tracker')
  await p.waitForSelector('#page-tracker [data-testid="trk-first-course"]', { state: 'visible', timeout: 20000 })
  await L.step(p, `${tag} S6 the first course (+ Add a course)`, async () => { await p.click('[data-testid="trk-first-course"]'); await W.answer(p, 'W4 FIRST COURSE'); await sleep(1200) }, { put: [/^tracker\/v3:master:course:/], only: true, also: [/^tracker\//] })
  await p.waitForSelector('#flowSvg .ball', { timeout: 15000 }).catch(() => {})
  const pic = await W.trkPicture(p)
  L.check(`${tag} S6: the course is there, drawn, with no student`, (pic.courses || []).some(c => c.name === 'W4 FIRST COURSE') && (pic.crew || []).filter(Boolean).length === 0, { courses: pic.courses, crew: pic.crew })
  await L.shot(p, `${tag}-09-first-course`)
  await L.reloadCompare(p, `${tag} S6`, BOSS, { page: 'tracker' })

  /* a request filed, a person added */
  await L.step(p, `${tag} S7 a request filed on the Inputs page`, () => W.fileReq(p, { type: 'LL', from: '2026-11-03' }), { put: [/^inputs\//], only: true, also: [/^settings\/elog:/, /^weeks\//, /^leavewar\//] })
  await L.reloadCompare(p, `${tag} S7`, BOSS)
  await L.step(p, `${tag} S8 a person added on Admin → Users (with his sign-in)`, async () => {
    await W.usersPane(p)
    await p.fill('#accAddCs', 'Second'); await p.fill('#accAddIni', 'SEC'); await p.selectOption('#accAddSeat', 'RCP'); await p.selectOption('#accAddCat', 'C')
    await p.fill('#accAddName', 'second@unit.example'); await p.click('#accAdd'); await sleep(800)
  }, { put: [/^people\//, /^settings\/account:/], only: true, also: [/^settings\/elog:/, /^leavewar\//] })
  await L.shot(p, `${tag}-10-person-added`)
  await L.reloadCompare(p, `${tag} S8`, BOSS)

  /* a reload: all there, nothing demo */
  const final = await L.rows(p)
  const demo = Object.entries(final).filter(([k, v]) => DEMO.test(k) || /26ABSG|STUDENT [AB]/.test(v)).map(([k]) => k)
  L.check(`${tag} S9: nothing demo anywhere in storage`, demo.length === 0, demo.slice(0, 8))
  const list = await W.inputsList(p, '2026-10-01', '2026-12-31')
  await L.shot(p, `${tag}-11-inputs-after-reload`)
  const ppl = await p.evaluate(() => Object.values(window.PEOPLE).filter(x => x && !x.special).map(x => x.cs).sort())
  await L.go(p, 'leavewar'); await sleep(700)
  const wars = await p.evaluate(() => [...document.querySelectorAll('select')].flatMap(s => [...s.options].map(o => o.text)).filter(t => /W4 FIRST PERIOD|JAN|DEC/.test(t)))
  await W.toTracker(p)
  const pic2 = await W.trkPicture(p)
  await L.shot(p, `${tag}-12-tracker-after-reload`)
  L.check(`${tag} S9: after a reload — his request, the two people, the one period, the one course; nothing else`,
    list.length === 1 && JSON.stringify(ppl) === JSON.stringify(['Boss', 'Second']) && wars.some(t => /W4 FIRST PERIOD/.test(t)) && (pic2.courses || []).length === 1,
    { requests: list, people: ppl, wars, courses: pic2.courses })
  L.check(`${tag} S9: the rows by collection`, true, W.byColl(final))
  await ctx.close()
} catch (e) {
  L.check(`${tag}: the walk ran to its end`, false, e && e.stack || String(e))
} finally {
  await browser.close()
}
L.check(`${tag}: no console error, page error or failed request`, errors.length === 0, errors.slice(0, 8))
process.exitCode = L.save({ width }) ? 1 : 0
