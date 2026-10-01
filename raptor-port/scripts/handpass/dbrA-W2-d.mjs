/* [DB-READINESS] group A FULL walk — W2 part D: accounts, sign-ups and the admins' bells (brief §W2 step 8; the
   independent designer's scenario 20). One browser (its storage shared by its tabs): Admin → Users' own rows (Suspend /
   Enable, Give sign-in, Add a person), the sign-in card's "Request access", the bell, Give access (On the roster / New
   person) and Refuse. Two admins = two tabs. After every step the rows it wrote (named by its batch) and a reload.
   Run from raptor-port/scripts/handpass: node dbrA-W2-d.mjs            */
process.env.HP_URL ||= 'http://localhost:4202'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-30-dbrA/W2'
process.env.HP_OUT ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/dbrA-W2-d.json'
const H = await import('./dbrA-W2-lib.mjs')
const { L, W, sleep } = H

const browser = await L.launch()
const ctx = await L.context(browser)
const errors = []
const A = await L.page(ctx, errors, 'A')
await L.signIn(A, 'a'); await L.settle(A)
const B = await L.page(ctx, errors, 'B')
await L.signIn(B, 'a'); await L.settle(B)
await H.toastSpy(A); await H.toastSpy(B)
const ELOG = /^settings\/elog:/
const accs = async pg => H.accountRows(await L.rows(pg))
const acc = async (pg, pred) => (await accs(pg)).find(pred) || null
const bellOn = pg => pg.evaluate(() => !!document.querySelector('#notifyBell.on'))
const reqRows = async pg => Object.keys(await L.rows(pg)).filter(k => k.startsWith('settings/accessreq:'))
const OSPREY = ['osprey@mail', 'x']

/* a two-tab step (as in part B), each tab signed in as its own person */
async function twoTab(id, what, gA, gB, verify, who = { A: 'a', B: 'a' }) {
  const n0 = L.results.length, pics = [], said = []
  const aA = await L.step(A, `${id} tab A: ${gA.name}`, gA.fn, gA.expect)
  if (gA.assert) { const x = gA.assert(aA); L.check(`${id} tab A — ${x.what}`, x.ok, x.detail) }
  pics.push(await H.pic(A, `${id}-a-tabA`))
  const aB = await L.step(B, `${id} tab B (not reloaded since before A's change): ${gB.name}`, gB.fn, gB.expect)
  if (gB.assert) { const x = gB.assert(aB); L.check(`${id} tab B — ${x.what}`, x.ok, x.detail) }
  pics.push(await H.pic(B, `${id}-a-tabB`))
  for (const [pg, tag] of [[A, 'A'], [B, 'B']]) {
    const r1 = await L.rows(pg)
    await pg.reload(); await L.signIn(pg, who[tag], { goto: false }); await L.settle(pg, 700); await H.toastSpy(pg)
    const r2 = await L.rows(pg), rd = L.diff(r1, r2)
    L.check(`${id} — the reload of tab ${tag} wrote nothing`, !rd.put.length && !rd.del.length, rd.put.length || rd.del.length ? { put: rd.put, del: rd.del } : 'no row changed')
    const v = await verify(pg, tag)
    L.check(`${id} — after tab ${tag}'s reload: ${v.what}`, v.ok, v.detail)
    said.push(`tab ${tag}: ${v.said || v.what}`)
    pics.push(await H.pic(pg, `${id}-b-tab${tag}`))
  }
  const rs = L.results.slice(n0)
  const row = { step: id, width: 'desktop', what, afterReload: said.join(' · '), rows: `A: ${H.auditText(aA)} ‖ B: ${H.auditText(aB)}`, pass: rs.every(r => r.ok), fails: rs.filter(r => !r.ok).map(r => `${r.name}: ${r.detail}`.slice(0, 600)), pics }
  H.TABLE.push(row)
  console.log(`== ${row.pass ? 'PASS' : 'FAIL'} ${id} — ${what} :: ${row.rows}`)
}
const rowText = (pg, pid) => pg.evaluate(id => { const r = document.querySelector(`#accList [data-person="${id}"], #accArchList [data-person="${id}"]`); return r ? r.innerText.replace(/\s+/g, ' ').trim() : null }, pid)
const focusRow = async (pg, pid) => { const r = pg.locator(`#accList [data-person="${pid}"]`).first(); if (await r.count()) await r.evaluate(e => e.scrollIntoView({ block: 'center' })) }

/* ====== W2-08a — the FIRST account writes of a fresh demo store, from two tabs (no account row is stored yet: each
   tab holds the seeded list in memory, and its first account write stores every account it holds) ====== */
await twoTab('W2-08a', 'fresh demo store, two tabs: A suspends Hex (Admin → Users → Hex → Suspend); B, not reloaded, adds "Tern" with a sign-in tern@mail',
  { name: 'Hex → Suspend', fn: async () => { await H.usersPane(A); await H.openPersonRow(A, 'rocky'); await A.click('#accEdOnOff'); await sleep(500); await focusRow(A, 'rocky'); return { toasts: await H.toasts(A) } }, expect: { put: [/^settings\/account:achex$/], also: [ELOG, /^settings\/account:/], only: true } },
  { name: 'Add a person: Tern (TRN · Pilot · C), tern@mail', fn: async () => { await H.usersPane(B); await H.addPerson(B, { cs: 'Tern', ini: 'TRN', seat: 'FCP', cat: 'C', signin: 'tern@mail', role: 'main' }); return { toasts: await H.toasts(B) } }, expect: { put: [/^people\//, /^settings\/account:/], also: [ELOG, /^leavewar\/profile:/, /^settings\/account:/], only: true },
    assert: a => ({ what: 'the rows B\'s first account write stored (listed — does it rewrite Hex\'s?)', ok: true, detail: a.put.filter(k => k.startsWith('settings/account:')) }) },
  async (pg) => {
    const hex = await acc(pg, a => a.pid === 'rocky'), tern = await acc(pg, a => a.name === 'tern@mail')
    await H.usersPane(pg); await focusRow(pg, 'rocky')
    return { what: 'BOTH kept: Hex suspended (A) and Tern\'s account (B)', ok: !!hex && hex.on === false && !!tern, detail: { hex: hex && { on: hex.on }, tern: !!tern, hexRow: await rowText(pg, 'rocky') }, said: `Hex sign-in ${hex ? (hex.on ? 'ON — A\'s suspension LOST' : 'suspended') : 'none'}; Tern ${tern ? 'there' : 'MISSING'}` }
  })
/* from here on the accounts are stored as rows */
const hexOn = async () => { const h = await acc(A, a => a.pid === 'rocky'); return h ? h.on : null }
const h0 = await hexOn()
await W(A, {
  id: 'W2-08b', what: `Admin → Users → Hex → ${h0 === false ? 'Enable' : 'Suspend'}`,
  fn: async () => { await H.usersPane(A); await H.openPersonRow(A, 'rocky'); await A.click('#accEdOnOff'); await sleep(500); return { toasts: await H.toasts(A) } },
  expect: { put: [/^settings\/account:achex$/], also: [ELOG], only: true },
  check: async () => { await H.usersPane(A); await focusRow(A, 'rocky'); return { what: 'his sign-in flipped — his account row only', ok: (await hexOn()) === !h0, detail: { was: h0, now: await hexOn(), row: await rowText(A, 'rocky') } } },
  after: async () => { await H.usersPane(A); await focusRow(A, 'rocky'); const on = await hexOn(); return { what: 'kept after the reload', ok: on === !h0, detail: { on, row: await rowText(A, 'rocky') }, said: `Hex: ${await rowText(A, 'rocky')}` } },
})
await W(A, {
  id: 'W2-08c', what: `Admin → Users → Hex → ${h0 === false ? 'Suspend' : 'Enable'} (back)`,
  fn: async () => { await H.usersPane(A); await H.openPersonRow(A, 'rocky'); await A.click('#accEdOnOff'); await sleep(500); return { toasts: await H.toasts(A) } },
  expect: { put: [/^settings\/account:achex$/], also: [ELOG], only: true },
  check: async () => { await H.usersPane(A); await focusRow(A, 'rocky'); return { what: 'back as it was', ok: (await hexOn()) === h0, detail: { now: await hexOn() } } },
  after: async () => { await H.usersPane(A); await focusRow(A, 'rocky'); const on = await hexOn(); return { what: 'kept after the reload', ok: on === h0, detail: { on }, said: `Hex: ${await rowText(A, 'rocky')}` } },
})

/* ====== the second admin, made before anyone asks for access (so making him marks nothing seen) ====== */
let osprey = null
await W(A, {
  id: 'W2-08d', what: 'Admin → Users → Add a person: "Osprey" (OSP · Pilot · C), sign-in osprey@mail, ADMIN',
  fn: async () => { await H.usersPane(A); await H.addPerson(A, { cs: 'Osprey', ini: 'OSP', seat: 'FCP', cat: 'C', signin: 'osprey@mail', role: 'admin' }); osprey = await H.pidOf(A, 'Osprey'); return { osprey, toasts: await H.toasts(A) } },
  expect: { put: [/^people\//, /^settings\/account:/], also: [ELOG, /^leavewar\/profile:/], only: true },
  check: async (a) => { const o = await acc(A, x => x.name === 'osprey@mail'); await H.usersPane(A); await focusRow(A, osprey); return { what: 'his person row and his ONE account row (admin), one batch', ok: a.batches.length === 1 && a.put.filter(k => k.startsWith('settings/account:')).length === 1 && o && o.role === 'admin', detail: { o, put: a.put } } },
  after: async () => { await H.usersPane(A); await focusRow(A, osprey); const t = await rowText(A, osprey); return { what: 'Osprey listed, admin', ok: /osprey@mail/.test(t || '') && /admin/i.test(t || ''), detail: t, said: `"${t}"` } },
})

/* ====== sign-ups on the sign-in card ====== */
async function signUp(pg, name, f) {
  await H.cardSignIn(pg, name)
  await pg.waitForSelector('#accessRequest', { timeout: 8000 })
  await pg.fill('#accCs', f.cs); await pg.fill('#accIni', f.ini)
  await pg.selectOption('#accSeat', f.seat); if (f.seat !== 'GND') await pg.selectOption('#accCat', f.cat)
  await pg.click('#accSend'); await pg.waitForSelector('#accessWaiting', { timeout: 8000 }); await sleep(400)
  return (await pg.locator('#accAsked').innerText().catch(() => '')).trim()
}
{
  const id = 'W2-08e', n0 = L.results.length
  await H.signOut(A)
  let asked = ''
  const a = await L.step(A, `${id} the sign-in card: falcon@mail → Request access (Falcon · FAL · Pilot · CAT C) → Send`, async () => { asked = await signUp(A, 'falcon@mail', { cs: 'Falcon', ini: 'FAL', seat: 'FCP', cat: 'C' }); return asked }, { put: [/^settings\/accessreq:/], only: true })
  L.check(`${id} — exactly ONE request row`, a.put.length === 1 && a.put[0].startsWith('settings/accessreq:') && !a.del.length, a.put)
  const p1 = await H.pic(A, `${id}-a`)
  const r1 = await L.rows(A)
  await A.reload(); await sleep(800)
  if (!(await A.locator('#accessWaiting').count())) await H.cardSignIn(A, 'falcon@mail')
  const r2 = await L.rows(A), rd = L.diff(r1, r2)
  L.check(`${id} — the reload wrote nothing`, !rd.put.length && !rd.del.length, rd)
  const again = (await A.locator('#accAsked').innerText().catch(() => '')).trim()
  L.check(`${id} — after the reload, signing in as falcon@mail shows the waiting screen with what he asked`, !!again && again === asked, { asked, again })
  const p2 = await H.pic(A, `${id}-b`)
  const rs = L.results.slice(n0)
  H.TABLE.push({ step: id, width: 'desktop', what: 'a sign-up: falcon@mail → Request access → Send', afterReload: `waiting screen: "${again}"`, rows: H.auditText(a), pass: rs.every(r => r.ok), fails: rs.filter(r => !r.ok).map(r => `${r.name}: ${r.detail}`), pics: [p1, p2] })
  /* three more, the fixtures for approve / approve-new / refuse (each audited: one request row) */
  for (const [name, f] of [['ace@mail', { cs: 'Ace', ini: 'ACE', seat: 'FCP', cat: 'C' }], ['heron@mail', { cs: 'Heron', ini: 'HER', seat: 'RCP', cat: 'C' }], ['gull@mail', { cs: 'Gull', ini: 'GUL', seat: 'FCP', cat: 'C' }]]) {
    await H.signOut(A)
    const x = await L.step(A, `${id} fixture: ${name} asks for access`, () => signUp(A, name, f), { put: [/^settings\/accessreq:/], only: true })
    L.check(`${id} fixture ${name} — one request row`, x.put.length === 1, x.put)
  }
  await H.signOut(A)
}

/* ====== two admins' bells: A (Saber) looks at the list; B (Osprey)'s bell stays lit ====== */
await L.signIn(A, 'a'); await L.settle(A); await H.toastSpy(A)
await B.reload(); await L.signIn(B, OSPREY, { goto: false }); await L.settle(B); await H.toastSpy(B)
L.check('W2-08f — before: both admins\' bells lit (four waiting)', (await bellOn(A)) && (await bellOn(B)), { A: await bellOn(A), B: await bellOn(B) })
await twoTab('W2-08f', 'two admins: A (Saber) taps his bell (it opens Admin → Users); B (Osprey), not reloaded, does nothing — then both reload',
  { name: 'Saber\'s bell → Admin → Users', fn: async () => { await A.click('#notifyBell'); await sleep(900); return { page: await A.evaluate(() => window.CURPAGE), toasts: await H.toasts(A) } }, expect: { put: [/^settings\/reqseen:acad$/], only: true } },
  { name: '(nothing — a look at Edit Schedule)', fn: async () => { await L.go(B, 'viewsched'); return 'looked' }, expect: { none: true } },
  async (pg, tag) => {
    const on = await bellOn(pg)
    const want = tag === 'A' ? false : true
    return { what: tag === 'A' ? 'Saber\'s bell OUT (he has seen the list)' : 'Osprey\'s bell still LIT (Saber\'s look is not his)', ok: on === want, detail: { on }, said: `bell ${on ? 'lit' : 'out'}` }
  }, { A: 'a', B: OSPREY })
await twoTab('W2-08g', 'two admins: now B (Osprey) taps his bell; A does nothing — both reload',
  { name: '(nothing — Edit Schedule)', fn: async () => { await L.go(A, 'viewsched'); return 'looked' }, expect: { none: true } },
  { name: 'Osprey\'s bell → Admin → Users', fn: async () => { await B.click('#notifyBell'); await sleep(900); return { page: await B.evaluate(() => window.CURPAGE) } }, expect: { put: [/^settings\/reqseen:/], only: true },
    assert: a => ({ what: 'only HIS seen row', ok: a.put.length === 1 && a.put[0] !== 'settings/reqseen:acad', detail: a.put }) },
  async (pg) => { const on = await bellOn(pg); return { what: 'bell out', ok: on === false, detail: { on }, said: `bell ${on ? 'lit' : 'out'}` } },
  { A: 'a', B: OSPREY })

/* ====== two admins each add an account: A gives Cinder a sign-in; B (not reloaded) adds a new person with one ====== */
await L.go(A, 'viewsched'); await L.go(B, 'viewsched')
await twoTab('W2-08h', 'two admins each add an account: A (Saber) → Cinder\'s row → Give sign-in cinder@mail; B (Osprey), not reloaded, → Add a person "Petrel" with petrel@mail',
  { name: 'Cinder → Give sign-in', fn: async () => { await H.usersPane(A); await H.openPersonRow(A, 'ammo'); await A.fill('#accGiveName', 'cinder@mail'); await A.click('#accGive'); await sleep(600); await focusRow(A, 'ammo'); return { toasts: await H.toasts(A) } }, expect: { put: [/^settings\/account:/], also: [ELOG], only: true } },
  { name: 'Add a person: Petrel, petrel@mail', fn: async () => { await H.usersPane(B); await H.addPerson(B, { cs: 'Petrel', ini: 'PET', seat: 'RCP', cat: 'C', signin: 'petrel@mail', role: 'main' }); return { toasts: await H.toasts(B) } }, expect: { put: [/^people\//, /^settings\/account:/], also: [ELOG, /^leavewar\/profile:/], only: true } },
  async (pg) => {
    const c = await acc(pg, a => a.name === 'cinder@mail'), pt = await acc(pg, a => a.name === 'petrel@mail')
    await H.usersPane(pg); await focusRow(pg, 'ammo')
    return { what: 'BOTH accounts kept (cinder@mail and petrel@mail)', ok: !!c && !!pt, detail: { cinder: !!c, petrel: !!pt }, said: `cinder@mail ${c ? 'there' : 'MISSING'}, petrel@mail ${pt ? 'there' : 'MISSING'}` }
  }, { A: 'a', B: OSPREY })

/* ====== Give access (On the roster), Give access (New person), Refuse ====== */
const reqOf = async name => { const r = await L.rows(A); const k = Object.keys(r).find(k => k.startsWith('settings/accessreq:') && JSON.parse(r[k]).name === name); return k ? k.slice('settings/accessreq:'.length) : null }
const waitingText = () => A.evaluate(() => { const w = document.querySelector('#admWaiting'); return w ? w.innerText.replace(/\s+/g, ' ').slice(0, 300) : ((document.querySelector('#admNoWaiting') || {}).textContent || '') })
let rq = null
await W(A, {
  id: 'W2-08i', what: 'Admin → Users → ace@mail (typed "Ace", who is on the roster) → Give access → On the roster → Ace → give access',
  fn: async () => {
    rq = await reqOf('ace@mail'); await H.usersPane(A)
    await A.click(`#admWaiting [data-req="${rq}"] [data-approve]`); await sleep(300)
    if ((await A.getAttribute('#apvModeRoster', 'aria-pressed').catch(() => null)) !== 'true') { await A.click('#apvModeRoster'); await sleep(250) }
    await A.selectOption('#apvPid', 'dj'); await H.pic(A, 'W2-08i-form')
    await A.click('#apvGo'); await sleep(600)
    return { rq, toasts: await H.toasts(A) }
  },
  expect: { put: [/^settings\/account:/], del: [/^settings\/accessreq:/], also: [ELOG, /^settings\/reqseen:/], only: true },
  check: async (a) => { const ace = await acc(A, x => x.name === 'ace@mail'); const left = (await reqRows(A)).includes('settings/accessreq:' + rq); return { what: 'his account (linked to Ace) made and the request removed — in ONE batch', ok: !!ace && ace.pid === 'dj' && !left && a.batches.length === 1, detail: { ace, left, batches: a.batches, put: a.put, del: a.del } } },
  after: async () => { await H.usersPane(A); const w = await waitingText(); await focusRow(A, 'dj'); const t = await rowText(A, 'dj'); return { what: 'Ace\'s row carries ace@mail; the request not back', ok: /ace@mail/.test(t || '') && !/ace@mail/.test(w), detail: { t, w }, said: `Ace: "${t}"; waiting: "${w.slice(0, 80)}"` } },
})
let heron = null
await W(A, {
  id: 'W2-08j', what: 'Admin → Users → heron@mail (typed "Heron", on no roster) → Give access → New person (as he gave) → Add person and give access',
  fn: async () => {
    rq = await reqOf('heron@mail'); await H.usersPane(A)
    await A.click(`#admWaiting [data-req="${rq}"] [data-approve]`); await sleep(300)
    const mode = await A.getAttribute('#apvModeNew', 'aria-pressed').catch(() => null)
    await H.pic(A, 'W2-08j-form')
    await A.click('#apvGo'); await sleep(700)
    heron = await H.pidOf(A, 'Heron')
    return { rq, mode, heron, toasts: await H.toasts(A) }
  },
  expect: { put: [/^people\//, /^settings\/account:/], del: [/^settings\/accessreq:/], also: [ELOG, /^settings\/reqseen:/, /^leavewar\/profile:/], only: true },
  check: async (a) => { const h = await acc(A, x => x.name === 'heron@mail'); const left = (await reqRows(A)).includes('settings/accessreq:' + rq); return { what: 'the person Heron, his account, the request removed — ONE batch', ok: !!heron && !!h && h.pid === heron && !left && a.batches.length === 1, detail: { heron, h, left, batches: a.batches, put: a.put, del: a.del } } },
  after: async () => { await H.usersPane(A); await focusRow(A, heron); const t = await rowText(A, heron); return { what: 'Heron listed with heron@mail', ok: /heron@mail/.test(t || ''), detail: t, said: `"${t}"` } },
})
await W(A, {
  id: 'W2-08k', what: 'Admin → Users → gull@mail → Refuse',
  fn: async () => { rq = await reqOf('gull@mail'); await H.usersPane(A); await A.click(`#admWaiting [data-req="${rq}"] [data-decline]`); await sleep(500); return { rq, toasts: await H.toasts(A) } },
  expect: { del: [/^settings\/accessreq:/], also: [ELOG, /^settings\/reqseen:/], only: true },
  check: async (a) => ({ what: 'his request row removed — nothing else', ok: a.del.length === 1 && a.del[0] === 'settings/accessreq:' + rq && !a.put.filter(k => !/^settings\/(elog|reqseen):/.test(k)).length, detail: { put: a.put, del: a.del } }),
  after: async () => { await H.usersPane(A); const w = await waitingText(); return { what: 'the list no longer holds gull@mail (falcon@mail still waits)', ok: !/gull@mail/.test(w) && /falcon@mail/.test(w), detail: w, said: `waiting: "${w.slice(0, 120)}"` } },
})
/* the people it changed can sign in (or ask again) after a reload */
{
  const n0 = L.results.length
  await H.signOut(A)
  await H.cardSignIn(A, 'heron@mail'); const heronIn = (await A.locator('#roleBadge').innerText().catch(() => '')).trim()
  await H.signOut(A)
  await H.cardSignIn(A, 'ace@mail'); const aceIn = (await A.locator('#roleBadge').innerText().catch(() => '')).trim()
  await H.signOut(A)
  await H.cardSignIn(A, 'gull@mail'); const gullAsk = !!(await A.locator('#accessRequest').count())
  const pic1 = await H.pic(A, 'W2-08l-gull-asks-again')
  L.check('W2-08l — Heron and Ace sign in as themselves; Gull, refused, is offered Request access again', /heron/i.test(heronIn) && /ace/i.test(aceIn) && gullAsk, { heronIn, aceIn, gullAsk })
  const rs = L.results.slice(n0)
  H.TABLE.push({ step: 'W2-08l', width: 'desktop', what: 'the people the approvals and the refusal touched sign in', afterReload: `Heron "${heronIn}", Ace "${aceIn}", Gull ${gullAsk ? 'asked again' : 'NOT asked'}`, rows: '(signing in writes nothing — checked in each step before)', pass: rs.every(r => r.ok), fails: rs.filter(r => !r.ok).map(r => `${r.name}: ${r.detail}`), pics: [pic1] })
}

console.log('\nerrors:', errors.length ? errors : 'none')
H.save({ errors })
await browser.close()
process.exit(0)
