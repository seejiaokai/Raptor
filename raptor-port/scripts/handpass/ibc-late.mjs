// The Inputs batch's check (3 Nov 26), roll-call A: a LATE mark dropped on the Scheduler Board is dropped for everyone
// and kept (D1586). Run on the frozen build: WALK_DIR=<folder> ISR_OUT=<pictures> LOOK_URL=http://localhost:4391/
//   node scripts/handpass/ibc-late.mjs          (desktop and phone; writes results-late.txt)
// Every write through the app's own controls; the probe bridge (INPUTS, SCHED) is only READ.
import * as L from './isr-A-lib.mjs'
import { pubDay, face, editWeek, showDay, closeBoard } from './isr-A-pub.mjs'
const { check, note, shot, say } = L
const sleep = ms => new Promise(r => setTimeout(r, ms))
const DI = 1 // Tue 14 Jul: Salsa's Appointment (Ground Programme), Nasty's LL and Shrek's OIL (Unavailable), all late

async function openBoard(page, di) {
  await closeBoard(page)
  await L.go(page, 'editsched')
  await page.locator(`#eWeek [data-sbday="${di}"]:visible`).first().click()
  await page.waitForSelector('#schedBoard')
  await sleep(700)
}
const chips = page => page.evaluate(() => [...document.querySelectorAll('#schedBoard .latechip')].filter(e => e.getBoundingClientRect().height > 0).map(e => ({ id: e.getAttribute('data-lateoff'), off: e.classList.contains('off'), pressed: e.getAttribute('aria-pressed') })))
const lateOffOf = (page, id) => page.evaluate(id => { const r = window.INPUTS.find(x => String(x.iid) === String(id)); return r ? !!r.lateOff : 'gone' }, id)
const stamp = (page, id) => page.evaluate(id => { const r = window.INPUTS.find(x => String(x.iid) === String(id)); return r ? { mod: r.mod, modBy: r.modBy, modAt: r.modAt, at: r.at } : null }, id)
const tagsOn = async (page, surf, di) => page.evaluate(([s, i]) => { const d = document.querySelector(`${s} .day[data-day="${i}"]`); return d ? [...d.querySelectorAll('.latetag')].filter(e => e.getBoundingClientRect().height > 0).length : null }, [surf, di])
const weekTags = async (page, pg, di) => { await closeBoard(page); await L.go(page, pg); const s = pg === 'editsched' ? '#eWeek' : '#vWeek'; await showDay(page, di, s); return tagsOn(page, s, di) }
const inputsLate = async page => { await L.go(page, 'inputs'); if (await page.locator('#inListBtn').count()) { await page.locator('#inListBtn').click().catch(() => {}); await sleep(400) } return page.evaluate(() => [...document.querySelectorAll('#page-inputs *')].filter(e => e.children.length === 0 && (e.textContent || '').trim() === 'LATE' && e.getBoundingClientRect().height > 0).length) }
/* over the board its own Undo / Redo (sbUndo, sbRedo) stand in for the top bar's (D349) */
const undoTitle = page => page.evaluate(() => { const vis = id => { const e = document.getElementById(id); return e && e.getBoundingClientRect().height > 0 ? e : null }; const u = vis('sbUndo') || document.getElementById('undoBtn'), r = vis('sbRedo') || document.getElementById('redoBtn'); return { undo: u && (u.title || u.getAttribute('aria-label')), undoOff: u && u.disabled, redo: r && (r.title || r.getAttribute('aria-label')) } })
async function signIn(page, user) {
  if (await page.locator('#logout').count()) { await page.locator('#logout').click(); await sleep(700) }
  await page.fill('#luser', user); await page.fill('#lpass', user === 'ad' ? 'a' : user)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(500)
}

/* ---------- desktop, a day not published ---------- */
{
  const { page } = await L.session('desktop')
  const before = { edit: await weekTags(page, 'editsched', DI), view: await weekTags(page, 'viewsched', DI), inputs: await inputsLate(page) }
  note('A0', `LATE badges before any drop: ${JSON.stringify(before)}`)
  await openBoard(page, DI)
  const c0 = await chips(page)
  note('A0', `live LATE chips on the board, Tue 14 Jul: ${JSON.stringify(c0)}`)
  await shot(page, 'A1', 'desktop', 'board-before-drop')
  const id = c0[0] && c0[0].id
  const st0 = await stamp(page, id)
  await page.locator(`#schedBoard .latechip[data-lateoff="${id}"]`).first().click(); await sleep(600)
  const toast = await L.toastText(page)
  const c1 = await chips(page)
  check('A1', 'the tapped chip turns dim (dropped)', !!c1.find(c => c.id === id && c.off), c1.find(c => c.id === id))
  check('A1', 'the drop is saved on the input', (await lateOffOf(page, id)) === true, await lateOffOf(page, id))
  check('A1', 'the drop stamps no change (a mark, not a change of the input)', JSON.stringify(await stamp(page, id)) === JSON.stringify(st0), { before: st0, after: await stamp(page, id) })
  note('A1', `note said: ${JSON.stringify(toast)}`)
  await shot(page, 'A1', 'desktop', 'board-after-drop')
  const u1 = await undoTitle(page)
  check('A9', 'Undo names the drop "a LATE mark"', /LATE mark/.test(String(u1.undo)), u1)
  await page.locator((await page.locator('#sbUndo:visible').count()) ? '#sbUndo' : '#undoBtn').first().click(); await sleep(600)
  check('A9', 'Undo brings the mark back', (await lateOffOf(page, id)) === false && !!(await chips(page)).find(c => c.id === id && !c.off), { lateOff: await lateOffOf(page, id), notes: await L.notes(page) })
  await page.locator((await page.locator('#sbRedo:visible').count()) ? '#sbRedo' : '#redoBtn').first().click(); await sleep(600)
  check('A9', 'Redo drops it again', (await lateOffOf(page, id)) === true, await lateOffOf(page, id))
  const after = { edit: await weekTags(page, 'editsched', DI), view: await weekTags(page, 'viewsched', DI), inputs: await inputsLate(page) }
  check('A3', 'Edit Schedule shows one LATE badge fewer', after.edit === before.edit - 1, { before: before.edit, after: after.edit })
  check('A4', 'View-only Sched shows one LATE badge fewer', after.view === before.view - 1, { before: before.view, after: after.view })
  check('A6', 'the Inputs page keeps every LATE', after.inputs === before.inputs, { before: before.inputs, after: after.inputs })
  await L.go(page, 'viewsched'); await showDay(page, DI, '#vWeek'); await shot(page, 'A4', 'desktop', 'view-after-drop')
  /* reload: the sign-in may be kept or asked again */
  await page.reload(); await sleep(900)
  if (await page.locator('#luser').isVisible().catch(() => false)) { await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]') }
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(600)
  check('A8', 'after a reload the drop is kept', (await lateOffOf(page, id)) === true && (await weekTags(page, 'viewsched', DI)) === after.view, { lateOff: await lateOffOf(page, id), view: await tagsOn(page, '#vWeek', DI) })
  /* a week away and back */
  await page.locator('[data-wk="20/07/2026"]:visible').first().click(); await sleep(800)
  await page.locator('[data-wk="13/07/2026"]:visible').first().click(); await sleep(800)
  check('A8', 'after a week change and back the drop is kept', (await lateOffOf(page, id)) === true && (await weekTags(page, 'viewsched', DI)) === after.view, { lateOff: await lateOffOf(page, id) })
  /* the member */
  await signIn(page, 'us')
  const mv = await weekTags(page, 'viewsched', DI)
  check('A7', 'the member sees the mark dropped on View-only Sched', mv === after.view, { member: mv, admin: after.view })
  await shot(page, 'A7', 'desktop', 'member-view')
  const mInputs = await inputsLate(page)
  note('A7', `the member's Inputs page LATE count: ${mInputs} (admin's ${after.inputs}; a member sees his own inputs and others' as the page allows)`)
  /* back as the admin: the board shows the dim chip, a tap brings it back for everyone */
  await signIn(page, 'ad')
  await openBoard(page, DI)
  const c2 = await chips(page)
  check('A8', 'after a sign-out and in, the board chip is still dim', !!c2.find(c => c.id === id && c.off), c2.find(c => c.id === id))
  await page.locator(`#schedBoard .latechip[data-lateoff="${id}"]`).first().click(); await sleep(600)
  check('A1', 'a tap on the dim chip brings the mark back', (await lateOffOf(page, id)) === false, await lateOffOf(page, id))
  check('A3', 'the week shows the badge again', (await weekTags(page, 'viewsched', DI)) === before.view, await tagsOn(page, '#vWeek', DI))
  /* the change history */
  await editWeek(page)
  const hist = await page.evaluate(() => { const w = window; const log = w.EDITLOG || w.CHGLOG || w.HISTLOG; return Array.isArray(log) ? log.slice(-6).map(e => JSON.stringify(e).slice(0, 200)) : Object.keys(w).filter(k => /LOG|log/.test(k)).slice(0, 20) })
  note('A10', `the change history's last lines (read, not judged here): ${JSON.stringify(hist)}`)
  await page.context().close()
}

/* ---------- desktop, a published day ---------- */
{
  const { page } = await L.session('desktop')
  const p = await pubDay(page, false, DI)
  note('A11', `published Tue 14 Jul: ${JSON.stringify(p)}`)
  const f0 = await face(page, DI)
  const v0 = await weekTags(page, 'viewsched', DI)
  await openBoard(page, DI)
  const c0 = await chips(page)
  const id = c0[0] && c0[0].id
  await page.locator(`#schedBoard .latechip[data-lateoff="${id}"]`).first().click(); await sleep(600)
  await shot(page, 'A11', 'desktop', 'board-published-after-drop')
  const f1 = await face(page, DI)
  check('A11', 'a drop on a published day leaves nothing pending (the builder\'s call — a mark, not a change)', JSON.stringify(f1.pend) === JSON.stringify(f0.pend), { before: f0, after: f1 })
  const v1 = await weekTags(page, 'viewsched', DI)
  check('A4', 'the issued face drops the badge at once', v1 === v0 - 1, { before: v0, after: v1 })
  await showDay(page, DI, '#vWeek'); await shot(page, 'A4', 'desktop', 'issued-face-after-drop')
  await page.context().close()
}

/* ---------- phone: the same tap ---------- */
{
  const { page, tap } = await L.session('phone')
  await closeBoard(page); await L.go(page, 'editsched')
  await page.locator(`#eWeek [data-sbday="${DI}"]`).first().evaluate(e => e.click())
  await page.waitForSelector('#schedBoard'); await sleep(800)
  const c0 = await chips(page)
  note('A1p', `phone board chips: ${JSON.stringify(c0)}`)
  const id = c0[0] && c0[0].id
  if (id) {
    const ch = page.locator(`#schedBoard .latechip[data-lateoff="${id}"]`).first()
    await ch.scrollIntoViewIfNeeded()
    await shot(page, 'A1p', 'phone', 'before-tap')
    await ch.tap(); await sleep(80)
    await shot(page, 'A1p', 'phone', 'right-after-tap')
    await sleep(600)
    check('A1p', 'a finger tap drops it (dim chip, saved)', (await lateOffOf(page, id)) === true && !!(await chips(page)).find(c => c.id === id && c.off), { lateOff: await lateOffOf(page, id) })
    await shot(page, 'A1p', 'phone', 'settled')
  } else L.notWalked('A1p', 'no live LATE chip on the phone board')
  await page.context().close()
}
await L.finish('late')
