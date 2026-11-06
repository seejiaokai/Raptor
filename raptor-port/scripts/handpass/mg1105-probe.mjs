// The member / guest check — the HOST's mechanical probe (5 Nov 26). Three parts, desktop (his PC's 1536, Chromium):
//   M — a member put on Edit Schedule through the developer bridge (the 1 Oct 26 route), with Publish AL1 made live by an
//       admin's real sign-offs first; then EVERY visible control on the page pressed, every select set, every text box typed
//       in, and the full-screen board opened and pressed the same way. After each: did anything get SAVED (a browser storage
//       write), did the schedule in memory change on the same week, did the change history or Undo move, what did it say.
//   G — a guest: an admin turns the guest view on; a stranger signs in, asks for access, views the schedule, moves weeks,
//       waits, signs out and in again — every storage write counted; then the same with storage made to refuse, to see what
//       the stranger is told when his request cannot be saved.
//   X — routes across a role change: the admin's own step undone in his member view; a failed save carried over a sign-out.
// Usage (from raptor-port/): WALK_DIR=<frozen dist> node scripts/handpass/mg1105-probe.mjs [M|G|X ...]
import * as L from './mg1105-lib.mjs'
const { say, note, check } = L
const PARTS = process.argv.slice(2).length ? process.argv.slice(2) : ['M', 'G', 'X']

async function toUsers(page) {
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  await page.locator('.adm-cat').filter({ hasText: 'Users' }).first().click(); await page.waitForTimeout(400)
}
async function guestViewOn(page) {
  await toUsers(page)
  const gv = page.locator('#admGuestView')
  if (!(await gv.isChecked())) { await gv.click(); await page.waitForTimeout(400) }
  return gv.isChecked()
}

/* press one element; report what moved */
async function pressOne(page, loc, label, how = 'click') {
  const before = await L.state(page), week = await page.evaluate(() => window.CURWEEK)
  let err = null
  try {
    if (how === 'click') await loc.click({ timeout: 1500 })
    else if (how === 'enter') { await loc.focus(); await page.keyboard.press('Enter') }
    else if (how.startsWith('select:')) await loc.selectOption(how.slice(7), { timeout: 1500 })
    else if (how === 'type') { await loc.click({ timeout: 1500 }); await page.keyboard.type('ZZQ'); await page.keyboard.press('Tab') }
  } catch (e) { err = String(e.message || e).split('\n')[0].slice(0, 120) }
  await page.waitForTimeout(350)
  const after = await L.state(page), week2 = await page.evaluate(() => window.CURWEEK)
  const wrote = await L.writesSince(page, before.writes)
  const said = await L.notesSince(page, before.notes)
  const typedLeft = how === 'type' ? await page.evaluate(() => document.body.innerHTML.includes('ZZQ')) : false
  const r = {
    label, how, err, wrote, said, typedLeft,
    modelMoved: before.model !== after.model && week === week2,
    weekMoved: week !== week2,
    elog: before.elog !== after.elog ? `${before.elog}→${after.elog}` : null,
    undo: before.undo !== after.undo ? `${before.undo} → ${after.undo}` : null,
    page: before.page !== after.page ? `${before.page}→${after.page}` : null,
    prints: await page.evaluate(() => window.__prints),
  }
  /* close whatever opened, the way a person does, and put the page back */
  await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(150)
  return r
}
const quiet = (r) => !r.wrote.length && !r.modelMoved && !r.elog && !r.undo && !r.typedLeft

/* every visible control inside `root`, as a list of {sel, n, label} we can find again after a repaint */
const listControls = (page, root, only = null) => page.evaluate(([root, only]) => {
  const R = document.querySelector(root); if (!R) return []
  const seen = new Set(), out = []
  const q = 'button, a[role="button"], [role="button"], select, input, textarea, [contenteditable="true"], summary, [data-planmenu], [data-daytplopen], [data-dver], [data-chg], [data-alpub], [data-person], .puck'
  const all = [...R.querySelectorAll(q)]
  all.forEach((e, i) => {
    const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return
    const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') return
    const tag = e.tagName.toLowerCase()
    const label = (e.getAttribute('aria-label') || e.getAttribute('title') || e.textContent || e.getAttribute('placeholder') || '').replace(/\s+/g, ' ').trim().slice(0, 50)
    const key = tag + '|' + label + '|' + (e.className || '')
    /* one of each kind of puck / crew chip is enough; every other control once */
    const kind = e.matches('.puck, [data-person]') ? 'puck|' + (e.closest('[data-key],[data-slot]') ? 'seat' : 'other') : key
    if (seen.has(kind)) return
    seen.add(kind)
    if (only != null && kind !== only) return
    document.querySelectorAll('[data-mgp]').forEach(x => x.removeAttribute('data-mgp'))
    e.setAttribute('data-mgp', String(i))
    out.push({ kind, i, tag, label, type: e.getAttribute('type') || '', disabled: !!e.disabled, opts: tag === 'select' ? [...e.options].map(o => o.value) : null, edit: tag === 'textarea' || (tag === 'input' && !/checkbox|radio|button|submit/.test(e.getAttribute('type') || '')) || e.isContentEditable })
  })
  return out
}, [root, only])

async function pressAll(page, root, tag) {
  const ctl = await listControls(page, root)
  const startWeek = await page.evaluate(() => window.CURWEEK)
  note(`${tag}-count`, `${ctl.length} distinct controls in ${root}: ${ctl.map(c => c.tag + ':' + c.label).join(' · ')}`)
  let loud = 0
  for (const c of ctl) {
    if (root === '#schedBoard' && !(await page.locator('#schedBoard').isVisible().catch(() => false))) { await page.evaluate(() => window.openScheduler(0)); await page.waitForTimeout(500) }
    const again = await listControls(page, root, c.kind)
    if (!again.length) { note(`${tag}-gone`, c.label); continue }
    c.i = again[0].i
    const loc = page.locator(`${root} [data-mgp="${c.i}"]`)
    if (/^(Logout|Sign out)$/i.test(c.label)) continue
    let rs = []
    if (c.tag === 'select') { for (const v of c.opts.slice(0, 4)) { const ag = await listControls(page, root, c.kind); if (!ag.length) break; rs.push(await pressOne(page, page.locator(`${root} [data-mgp="${ag[0].i}"]`), c.label, 'select:' + v)) } }
    else if (c.edit) rs.push(await pressOne(page, loc, c.label, 'type'))
    else rs.push(await pressOne(page, loc, c.label, 'click'))
    for (const r of rs) {
      if (!quiet(r)) { loud++; say(`LOUD ${tag} [${c.tag}${c.disabled ? ' disabled' : ''}] "${c.label}" ${r.how} — ${JSON.stringify(r)}`) }
      else if (r.said.length) note(`${tag}-said`, `"${c.label}" ${r.how}: ${r.said.join(' / ')}`)
    }
    /* stay on Edit Schedule and on the starting week for the next press */
    if (root === '#schedBoard' && !(await page.locator('#schedBoard').isVisible().catch(() => false))) { await page.evaluate(() => window.openScheduler(0)); await page.waitForTimeout(500) }
    if (await page.evaluate(() => window.CURPAGE) !== 'editsched' && root.includes('editsched')) await page.evaluate(() => window.setPage('editsched'))
    if (await page.evaluate(() => window.CURWEEK) !== startWeek) { await page.evaluate(w => { window.loadWeek(w); window.renderEditWeek() }, startWeek); await page.waitForTimeout(400) }
  }
  return { n: ctl.length, loud }
}

/* ---------------- M: a member on Edit Schedule ---------------- */
if (PARTS.includes('M')) {
  const { page } = await L.open('desktop')
  await L.signIn(page, 'ad', 'a')
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
  /* THE FIXTURE, through the admin's own controls: Monday signed off and published, a word added to its day note (a
     change on a published day), signed off again — so the Amendments panel offers a live "Publish AL1" */
  const target = 0
  const signAll = async () => { for (const sel of await page.locator(`select[data-signday="${target}"]`).all()) { const v = await sel.evaluate(s => [...s.options].map(o => o.value).find(Boolean) || ''); if (v) { await sel.selectOption(v); await page.waitForTimeout(250) } } }
  await signAll()
  await page.locator(`button[data-beak="${target}"]`).click(); await page.waitForTimeout(600)
  const note0 = page.locator(`#eWeek [data-txt="dn:${target}.0"]`).first()
  await note0.click(); await page.keyboard.press('End'); await page.keyboard.type(' MG'); await page.keyboard.press('Enter'); await page.waitForTimeout(500)
  await signAll()
  note('M0-fixture', await page.evaluate(() => ({ pend: (document.querySelector('#alPanel .al-pend') || {}).textContent, rows: [...document.querySelectorAll('#alPanel .al-pubday')].map(x => x.textContent) })))
  const live = await page.evaluate(() => { const b = document.querySelector('#alPanel .al-pubday button'); return b ? { text: b.textContent, disabled: b.disabled } : null })
  check('M0', 'as the admin, the day is signed off and "Publish AL" is live (the fixture, through his own sign-off selects)', live && !live.disabled, live)
  await L.shotEl(page, '#alPanel', 'M0', 'admin-alpanel-live')
  await L.signOut(page); await L.signIn(page, 'us', 'us')
  const s0 = await L.state(page)
  note('M1-member', s0)
  await page.evaluate(() => window.setPage('editsched')); await page.waitForTimeout(700)
  await L.shot(page, 'M1', 'member-on-editsched-desktop')
  await L.shotEl(page, '#alPanel', 'M1', 'member-alpanel')
  const btn = page.locator('#alPanel .al-pubday button').first()
  const look = await page.evaluate(() => { const b = document.querySelector('#alPanel .al-pubday button'); return b ? { text: b.textContent, disabled: b.disabled, cls: b.className, title: b.title } : null })
  note('M2-look', look)
  if (look) {
    const r1 = await pressOne(page, btn, 'Publish AL (mouse)', 'click')
    check('M2a', 'a member pressing "Publish AL" by mouse: nothing saved, the schedule, the change history and Undo unchanged', quiet(r1), r1)
    const r2 = await pressOne(page, page.locator('#alPanel .al-pubday button').first(), 'Publish AL (keyboard)', 'enter')
    check('M2b', 'the same by keyboard (focus + Enter)', quiet(r2), r2)
    await L.shotEl(page, '#alPanel', 'M2', 'member-alpanel-after-press')
    const issued = await page.evaluate(() => (document.querySelector('#alPanel .al-list') || {}).textContent || '')
    check('M2c', 'no amendment issued (the issued list still reads none)', /No amendments published yet/.test(issued), issued.slice(0, 80))
  }
  const a = await pressAll(page, '#page-editsched', 'M3')
  check('M3', `every other control on Edit Schedule as a member (${a.n}) — nothing saved, no change shown on the same week, no history or Undo line`, a.loud === 0, { loud: a.loud })
  await L.shot(page, 'M3', 'member-editsched-after-presses')
  /* the full-screen board, forced open the way the bridge allows (no click path reaches it for a member) */
  const opened = await page.evaluate((d) => { try { window.openScheduler(d); return true } catch (e) { return String(e) } }, target)
  await page.waitForTimeout(700)
  const boardUp = await page.locator('#schedBoard').isVisible().catch(() => false)
  note('M4-board', { opened, boardUp })
  await L.shot(page, 'M4', 'member-board-forced')
  if (boardUp) {
    const b = await pressAll(page, '#schedBoard', 'M4')
    check('M4', `every control on the board forced open for a member (${b.n})`, b.loud === 0, { loud: b.loud })
  }
  const s9 = await L.state(page)
  note('M9-end', { writesTotal: s9.writes - s0.writes, writes: await L.writesSince(page, s0.writes) })
}

/* ---------------- G: a guest ---------------- */
async function guestRound(tag, refuseAtRequest, mode = 'close') {
  const { page } = await L.open('desktop')
  await L.signIn(page, 'ad', 'a')
  check(`${tag}0`, 'the admin turns the guest view on (Admin → Users)', await guestViewOn(page), true)
  await L.signOut(page)
  await L.signIn(page, 'stranger', 'anything')
  const onForm = await page.locator('#accessRequest').isVisible().catch(() => false)
  check(`${tag}1`, 'an unknown sign-in name lands on Request access', onForm, onForm)
  const n0 = (await L.state(page)).writes
  await L.shot(page, tag + '1', 'request-form')
  await page.fill('#accCs', 'Stranger')
  await page.fill('#accIni', 'ST')
  const seat = await page.locator('#accSeat option').evaluateAll(os => os.map(o => o.value).find(Boolean))
  await page.selectOption('#accSeat', seat)
  if (await page.locator('#accCat').count()) { const c = await page.locator('#accCat option').evaluateAll(os => os.map(o => o.value).find(Boolean)); if (c) await page.selectOption('#accCat', c) }
  if (refuseAtRequest) await L.refuse(page, true)
  const nReq = (await L.state(page)).writes
  await page.click('#accSend'); await page.waitForTimeout(900)
  const reqWrites = await L.writesSince(page, nReq)
  const waiting = await page.locator('#accessWaiting').isVisible().catch(() => false)
  const band = await page.evaluate(() => !!document.querySelector('.savestat, .saveband'))
  await L.shot(page, tag + '2', refuseAtRequest ? 'request-sent-storage-refusing' : 'request-sent')
  if (!refuseAtRequest) {
    check(`${tag}2`, 'pressing Request access saves the request (one write through the saver) and shows the waiting screen', waiting && reqWrites.length > 0, { waiting, reqWrites })
  } else {
    note(`${tag}2-refused`, { waiting, band, reqWrites, said: await page.evaluate(() => (document.querySelector('#accessWaiting') || {}).innerText || '') })
    check(`${tag}2`, 'with storage refusing, the person who asked is TOLD his request is not saved (a "Not saved" warning on the access screen)', band, { waiting, band })
  }
  /* into the guest view */
  const nG = (await L.state(page)).writes
  if (await page.locator('#accGuest').isVisible().catch(() => false)) { await page.click('#accGuest'); await page.waitForTimeout(900) }
  const inGuest = await page.locator('#guestApp').isVisible().catch(() => false)
  check(`${tag}3`, 'View the schedule opens the guest view', inGuest, inGuest)
  await L.shot(page, tag + '3', refuseAtRequest ? 'guest-storage-refusing' : 'guest')
  if (refuseAtRequest) {
    const band2 = await page.evaluate(() => !!document.querySelector('.savestat, .saveband'))
    note(`${tag}3-band`, { band: band2, pending: await page.evaluate(() => window.__lsLog.filter(e => !e.ok).length) })
  }
  /* every week chip, the day arrows, a wait past the idle passes */
  for (const wk of await page.locator('#guestApp .guest-wks .wk').all()) { await wk.click(); await page.waitForTimeout(500) }
  for (const sel of ['#guestApp .wnav.next, #guestApp [data-pan="next"], #guestApp .pan-next', '#guestApp .wnav.prev, #guestApp [data-pan="prev"], #guestApp .pan-prev']) {
    const l = page.locator(sel).first(); if (await l.count() && await l.isVisible().catch(() => false)) { await l.click(); await page.waitForTimeout(400) }
  }
  /* every other control the guest page draws — pressed */
  const ctl = await listControls(page, '#guestApp')
  for (const c of ctl) { if (/Sign out/i.test(c.label)) continue; await page.locator(`#guestApp [data-mgp="${c.i}"]`).click({ timeout: 1000 }).catch(() => {}); await page.waitForTimeout(200); await page.keyboard.press('Escape') }
  note(`${tag}4-controls`, ctl.map(c => `${c.tag}:${c.label}`).join(' · '))
  await page.waitForTimeout(6000)
  const gWrites = await L.writesSince(page, nG)
  check(`${tag}4`, 'everything a guest does — weeks, arrows, every control, a 6 s wait — saves nothing', refuseAtRequest ? true : gWrites.length === 0, gWrites)
  if (refuseAtRequest) note(`${tag}4-writes`, gWrites)
  await L.signOut(page)
  const nS = (await L.state(page)).writes
  await L.signIn(page, 'stranger', 'anything')
  const back = { guest: await page.locator('#guestApp').isVisible().catch(() => false), waiting: await page.locator('#accessWaiting').isVisible().catch(() => false), form: await page.locator('#accessRequest').isVisible().catch(() => false) }
  note(`${tag}5-again`, { back, writes: await L.writesSince(page, nS) })
  if (refuseAtRequest) {
    /* the tab left open: storage works again — does the saver's own retry land the request, unasked? (its waits grow 1 s,
       2 s, 4 s … — storage/postman.ts — so wait past the next) */
    if (mode === 'recover') { await L.refuse(page, false); await page.waitForTimeout(35000) }
    note(`${tag}6-${mode === 'recover' ? 'after-storage-works' : 'storage-still-refusing'}`, { writes: (await L.writesSince(page, nReq)).slice(-6), ask: await page.evaluate(() => [...document.querySelectorAll('#accessWaiting, #accessRequest, #guestApp')].map(e => e.id)) })
    /* the tab closed and opened again: is the request there? */
    await page.reload(); await page.waitForTimeout(800)
    note(`${tag}7-leave-asked`, page.__leaveAsked || 0)
    await L.signIn(page, 'stranger', 'anything')
    note(`${tag}7-after-reload`, await page.evaluate(() => [...document.querySelectorAll('#accessWaiting, #accessRequest, #guestApp')].map(e => e.id)))
  } else {
    await L.signOut(page)
    await L.signIn(page, 'ad', 'a'); await toUsers(page)
    const reqs = await page.evaluate(() => (document.body.innerText.match(/Stranger/g) || []).length)
    check(`${tag}5`, 'as the admin, Admin → Users shows the stranger\'s request', reqs > 0, reqs)
    await L.shot(page, tag + '5', 'admin-sees-request')
  }
}
if (PARTS.includes('G')) { await guestRound('G', false); await guestRound('GF', true, 'close'); await guestRound('GR', true, 'recover') }

/* ---------------- X: across a role change ---------------- */
if (PARTS.includes('X')) {
  const { page } = await L.open('desktop')
  await L.signIn(page, 'ad', 'a')
  /* the admin's own step (the guest switch), then his member view, then Undo / Redo */
  await guestViewOn(page)
  const undoAdm = await L.state(page)
  note('X1-admin-step', undoAdm.undo)
  await page.click('#roleBadge'); await page.waitForTimeout(600)
  const asMember = await page.evaluate(() => (document.getElementById('roleBadge') || {}).textContent)
  /* View-only Sched has no Undo pair; Inputs does (Shell.tsx pairOn) */
  await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(500)
  const s1 = await L.state(page)
  await page.click('#undoBtn', { timeout: 3000 }).catch(e => note('X2-undo-click', String(e.message).slice(0, 80))); await page.waitForTimeout(500)
  const sRedo = await L.state(page)
  await page.click('#redoBtn', { timeout: 3000 }).catch(e => note('X2-redo-click', String(e.message).slice(0, 80))); await page.waitForTimeout(500)
  note('X2-redo', { redo: sRedo.redo, said: await L.notesSince(page, sRedo.notes), writes: await L.writesSince(page, sRedo.writes) })
  const s2 = await L.state(page)
  const said = await L.notesSince(page, s1.notes)
  check('X2', 'in his member view the admin\'s own setting step is not undone: nothing saved, the page stays, he is told why', s2.writes === s1.writes && s2.page === s1.page && said.length > 0, { asMember, undo: s1.undo, said, writes: await L.writesSince(page, s1.writes), page: `${s1.page}→${s2.page}` })
  await L.shot(page, 'X2', 'member-view-undo-admin-step')
  await page.click('#roleBadge'); await page.waitForTimeout(500)
  /* a failed save carried across a sign-out */
  await L.refuse(page, true)
  await toUsers(page)
  await page.locator('#admGuestView').click(); await page.waitForTimeout(800)
  const bandAdmin = await page.evaluate(() => !!document.querySelector('.savestat.failed'))
  await L.shot(page, 'X3', 'admin-failed-save-band')
  await L.signOut(page)
  const bandLogin = await page.evaluate(() => !!document.querySelector('.savestat, .saveband'))
  await L.shot(page, 'X3', 'signin-after-failed-save')
  await L.signIn(page, 'stranger3', 'x')
  const bandAccess = await page.evaluate(() => !!document.querySelector('.savestat, .saveband'))
  await L.shot(page, 'X3', 'access-after-failed-save')
  note('X3', { bandAdmin, bandLogin, bandAccess, refusedWrites: await page.evaluate(() => window.__lsLog.filter(e => !e.ok).length) })
  await L.signOut(page)
  await L.refuse(page, false); await page.waitForTimeout(8000)
  await L.signIn(page, 'ad', 'a')
  note('X4-admin-back', await L.state(page))
}
await L.finish(PARTS.join(''))
