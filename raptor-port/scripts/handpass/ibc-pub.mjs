// The Inputs batch's check (3 Nov 26), roll-call B: a scheduler note's "Make public" is saved with the note and shared
// (D1588), and on a published day waits for the next amendment (D1592). Frozen build as ibc-late.mjs:
//   WALK_DIR=<folder> ISR_OUT=<pictures> LOOK_URL=http://localhost:4394/ node scripts/handpass/ibc-pub.mjs
// Every write through the app's own controls; the probe bridge (DAYS, SCHED) is only READ.
import * as L from './isr-A-lib.mjs'
import { pubDay, face, editWeek, showDay, closeBoard, toGoOut, closeChg } from './isr-A-pub.mjs'
const { check, note, shot } = L
const sleep = ms => new Promise(r => setTimeout(r, ms))
const WORDS = 'All crews brief 0700 in the main room'

const npub = (page, di) => page.evaluate(i => (window.DAYS[i] && window.DAYS[i].npub) || null, di)
const noteOf = (page, di) => page.evaluate(i => window.DAYS[i] && window.DAYS[i].prognotes, di)
async function typeNote(page, di) {
  await editWeek(page); await showDay(page, di)
  const box = page.locator(`#eWeek .blknote.ed[data-txt="pn:${di}"]`).first()
  await box.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await box.click(); await page.keyboard.type(WORDS); await sleep(150)
  await page.locator('#eWeek').evaluate(() => document.activeElement && document.activeElement.blur()); await sleep(500)
}
const head = (page, surf, di) => page.evaluate(([s, i]) => { const d = document.querySelector(`${s} .day[data-day="${i}"]`); if (!d) return null; const b = d.querySelector(`[data-notepub="pn:${i}"]`); const h = b ? b.closest('.blknote-h') : null; return { head: h ? (h.textContent || '').replace(/\s+/g, ' ').trim() : null, btn: b ? (b.textContent || '').trim() : null } }, [surf, di])
const viewShows = async (page, di) => { await closeBoard(page); await L.go(page, 'viewsched'); await showDay(page, di, '#vWeek'); return page.evaluate(([i, w]) => { const d = document.querySelector(`#vWeek .day[data-day="${i}"]`); if (!d) return null; const n = [...d.querySelectorAll('.blknote')].map(e => (e.textContent || '').trim()); return { notesHead: d.querySelectorAll('.blknote-h').length, shows: n.some(t => t.includes(w)) } }, [di, WORDS]) }
const pressPub = async (page, di) => { await editWeek(page); await showDay(page, di); const b = page.locator(`#eWeek [data-notepub="pn:${di}"]`).first(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(600) }
const undoTitle = page => page.evaluate(() => { const u = document.getElementById('undoBtn'), r = document.getElementById('redoBtn'); return { undo: u && u.title, redo: r && r.title, redoOff: r && r.disabled } })
async function signIn(page, user) {
  if (await page.locator('#logout').count()) { await page.locator('#logout').click(); await sleep(700) }
  await page.fill('#luser', user); await page.fill('#lpass', user === 'ad' ? 'a' : user)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(500)
}

/* ---------- B1–B8: a day not published (Wed 15 Jul) ---------- */
{
  const { page } = await L.session('desktop')
  const DI = 2
  await typeNote(page, DI)
  check('B1', 'premise: the Programme note holds the words typed', String(await noteOf(page, DI)).includes(WORDS), await noteOf(page, DI))
  const v0 = await viewShows(page, DI)
  check('B3', 'before Make public, View-only Sched does not show the note', v0 && !v0.shows, v0)
  await pressPub(page, DI)
  note('B1', `note said: ${JSON.stringify(await L.toastText(page))}`)
  check('B1', 'Make public is saved on the day', JSON.stringify(await npub(page, DI)) === '["pn"]', await npub(page, DI))
  const h1 = await head(page, '#eWeek', DI)
  check('B1', 'the week\'s header reads "Public notes" and the button "On view-only ✓"', h1 && /^Public notes/.test(h1.head) && /On view-only/.test(h1.btn), h1)
  await shot(page, 'B1', 'desktop', 'week-public')
  const u = await undoTitle(page)
  check('B7', 'Undo names it', /note public/i.test(String(u.undo)), u)
  const v1 = await viewShows(page, DI)
  check('B3', 'View-only Sched shows the note under "Notes"', v1 && v1.shows, v1)
  await shot(page, 'B3', 'desktop', 'view-shows-note')
  /* the board's own copy of the toggle */
  await L.go(page, 'editsched')
  await page.locator(`#eWeek [data-sbday="${DI}"]:visible`).first().click(); await page.waitForSelector('#schedBoard'); await sleep(700)
  const bh = await page.evaluate(i => { const b = document.querySelector(`#schedBoard [data-notepub="pn:${i}"]`); const h = b && b.closest('.sb-nh'); return { head: h ? (h.textContent || '').replace(/\s+/g, ' ').trim() : null, on: b ? b.classList.contains('on') : null } }, DI)
  check('B2', 'the Scheduler Board reads the same: "Public notes", toggle on', bh.head && /^Public notes/.test(bh.head) && bh.on === true, bh)
  await shot(page, 'B2', 'desktop', 'board-public')
  await closeBoard(page)
  /* undo / redo */
  await editWeek(page)
  await page.locator('#undoBtn').click(); await sleep(600)
  check('B7', 'Undo makes it scheduler-only again (the day\'s npub gone)', (await npub(page, DI)) === null, { npub: await npub(page, DI), notes: await L.notes(page) })
  check('B7', 'the note\'s words stay after the Undo', String(await noteOf(page, DI)).includes(WORDS), await noteOf(page, DI))
  await page.locator('#redoBtn').click(); await sleep(600)
  check('B7', 'Redo makes it public again', JSON.stringify(await npub(page, DI)) === '["pn"]', await npub(page, DI))
  /* reload, week change, the member */
  await page.reload(); await sleep(900)
  if (await page.locator('#luser').isVisible().catch(() => false)) { await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]') }
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(600)
  check('B6', 'after a reload it is still public', JSON.stringify(await npub(page, DI)) === '["pn"]', await npub(page, DI))
  await page.locator('[data-wk="20/07/2026"]:visible').first().click(); await sleep(800)
  await page.locator('[data-wk="13/07/2026"]:visible').first().click(); await sleep(800)
  check('B6', 'after a week change and back it is still public', JSON.stringify(await npub(page, DI)) === '["pn"]', await npub(page, DI))
  await signIn(page, 'us')
  const vm = await viewShows(page, DI)
  check('B6', 'the member sees the note on View-only Sched', vm && vm.shows, vm)
  await shot(page, 'B6', 'desktop', 'member-view')
  check('B6', 'the member has no Make public button anywhere', (await page.locator('[data-notepub]:visible').count()) === 0, await page.locator('[data-notepub]:visible').count())
  /* the change history, as the app keeps it */
  await signIn(page, 'ad')
  const hist = await page.evaluate(() => { const w = window; try { const rows = typeof w.elogRows === 'function' ? w.elogRows() : null; return rows ? rows.slice(-8).map(r => JSON.stringify(r).slice(0, 240)) : 'no elogRows' } catch (e) { return 'err ' + e.message } })
  note('B8', `the change history's last rows: ${JSON.stringify(hist)}`)
  await page.context().close()
}

/* ---------- B4, B5: a published day (Thu 16 Jul) ---------- */
{
  const { page } = await L.session('desktop')
  const DI = 3
  await typeNote(page, DI)
  const p = await pubDay(page, false, DI)
  note('B4', `published Thu 16 Jul with the note scheduler-only: ${JSON.stringify(p)}`)
  const f0 = await face(page, DI)
  check('B4', 'premise: the day is published with nothing pending', f0 && f0.tag === 'ORIG' && !f0.pend.length, f0)
  await pressPub(page, DI)
  const f1 = await face(page, DI)
  check('B5', 'Make public on a published day reads 1 pending and "Not yet signed" (D1592, D103)', f1 && f1.pend.join(' ').includes('1 pending') && /Not yet signed/.test(f1.nys), f1)
  await shot(page, 'B5', 'desktop', 'week-published-pending')
  const tgo = await toGoOut(page, DI, ['B5', 'desktop', 'to-go-out'])
  note('B5', `To go out reads: ${JSON.stringify(tgo.text)}`)
  check('B5', 'To go out shows no raw marker character', !/␟/.test(tgo.text), tgo.text)
  await closeChg(page)
  const v1 = await viewShows(page, DI)
  check('B4', 'View-only Sched shows the day as it went out — no note', v1 && !v1.shows, v1)
  await shot(page, 'B4', 'desktop', 'view-as-issued')
  /* taken back before the amendment: nothing waits */
  await pressPub(page, DI)
  const f2 = await face(page, DI)
  check('B5', 'made scheduler-only again before the amendment: nothing pending', f2 && !f2.pend.length, f2)
  await pressPub(page, DI)
  const p2 = await pubDay(page, false, DI)
  note('B5', `published the amendment: ${JSON.stringify(p2)}`)
  const f3 = await face(page, DI)
  check('B5', 'the amendment carries it: tag AL1, nothing pending', f3 && /AL1/.test(f3.tag) && !f3.pend.length, f3)
  const v3 = await viewShows(page, DI)
  check('B4', 'after the amendment, View-only Sched shows the note', v3 && v3.shows, v3)
  await shot(page, 'B4', 'desktop', 'view-after-amendment')
  await page.context().close()
}

/* ---------- B1 on a phone: the board's toggle by a finger ---------- */
{
  const { page } = await L.session('phone')
  const DI = 4
  await closeBoard(page); await L.go(page, 'editsched')
  await page.locator(`#eWeek [data-sbday="${DI}"]`).first().evaluate(e => e.click())
  await page.waitForSelector('#schedBoard'); await sleep(800)
  const b = page.locator(`#schedBoard [data-notepub="pn:${DI}"]`).first()
  if (await b.count()) {
    await b.scrollIntoViewIfNeeded(); await shot(page, 'B2p', 'phone', 'before')
    await b.tap(); await sleep(80); await shot(page, 'B2p', 'phone', 'right-after-tap'); await sleep(600)
    check('B2p', 'a finger on the board\'s Make public saves it', JSON.stringify(await npub(page, DI)) === '["pn"]', await npub(page, DI))
    await shot(page, 'B2p', 'phone', 'settled')
  } else L.notWalked('B2p', 'no Make public on the phone board')
  await page.context().close()
}
await L.finish('pub')
