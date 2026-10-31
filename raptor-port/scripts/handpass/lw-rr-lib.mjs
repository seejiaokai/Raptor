// The night of 30–31 Oct 26, job 2 — [SYSTEM-PASS-SAVES-ROSTER] and [LW-DELETED-RESTORE-OVERREFUSE]: the walk's shared helpers.
// Builds on lw-sf-lib.mjs (the 30 Oct 26 small fixes' helpers: presses, the grid, Approvals, Undo / Redo) and adds:
//  - a world SERVED INSIDE THE BROWSER from a built folder (LW_DIST, default `dist`) — no server, so no port to clash with
//    another chat's preview; the before pictures point LW_DIST at a build of origin/main;
//  - a SAVED world (real browser storage in a fresh context, never ?fresh=1, which keeps nothing — walk-scripts §3), so a
//    reload shows what was saved;
//  - the browser's clock installed at a fixed moment (LW_T0) and left running (§1), so a posting dated tomorrow can come
//    due while the page is open;
//  - the doors this walk presses: Admin → Users (delete), the bid window's Post out (Overseas Sqn, Delete), the bid
//    window's Move, the Inputs page's window (lengthen a leave), Quals (Edit, a tick).
// Every script sets LW_OUT to its own folder BEFORE importing this (process.env.LW_OUT ||= …; then await import(…)).
import * as L from './lw-sf-lib.mjs'
import { serveDist } from '../drawcheck/lib.mjs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
export * from './lw-sf-lib.mjs'
const here = path.dirname(fileURLToPath(import.meta.url))
export const DIST = path.resolve(here, '../..', process.env.LW_DIST || 'dist')
/* routed inside the browser (serveDist) — nothing listens on it; the app's localhost bridge answers there */
export const ORIGIN = `http://localhost:${process.env.LW_ORIGIN_PORT || '4377'}`
/* the moment the browser's clock starts at (Singapore time): a Wednesday inside the demo war's period */
export const T0 = process.env.LW_T0 || '2026-11-04T09:00:00+08:00'
console.log(`[lw-rr-lib v1] build ${DIST} served at ${ORIGIN}; clock from ${T0}`)
const pad = n => String(n).padStart(2, '0')
/* the day T0 falls on, in Singapore, and days from it */
const t0 = new Date(T0)
const sg = d => new Date(d.getTime() + 8 * 3600e3)
export const isoOf = d => { const s = sg(d); return `${s.getUTCFullYear()}-${pad(s.getUTCMonth() + 1)}-${pad(s.getUTCDate())}` }
export const TODAY = isoOf(t0)
export const day = n => isoOf(new Date(t0.getTime() + n * 86400e3))
export const at9 = n => new Date(`${day(n)}T09:00:00+08:00`)
export const dm = s => `${+s.slice(8, 10)} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+s.slice(5, 7) - 1]}`
/* the Inputs' own date words ("Oct 26") for a day */
export const inWords = s => dm(s).split(' ').reverse().join(' ')

/* a fresh context (clean storage), the build routed in, the clock installed — the shapes lw-sf-lib's helpers take */
export async function newWorld(size) {
  const w = await L.newCtx(size)
  await w.ctx.clock.install({ time: t0 })
  await serveDist(w.ctx, ORIGIN, DIST)
  w.page.setDefaultTimeout(20000)
  return w
}
/* sign in on the SAVED world: the first load of a fresh context is the demo world, saved from its first write */
export async function signInSaved(w, who) {
  const { page } = w
  const [u, p] = who === 'admin' ? ['ad', 'a'] : ['us', 'us']
  if (!/localhost/.test(page.url())) await page.goto(ORIGIN + '/')
  await page.waitForSelector('#luser')
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  if (!process.env.LW_TOASTS) await page.addStyleTag({ content: '#toastEl, .toast { visibility: hidden !important; }' }).catch(() => {})
  await page.evaluate(() => {
    window.__said = []
    new MutationObserver(() => { for (const e of document.querySelectorAll('#toastEl, .toast')) { const t = (e.textContent || '').trim(); if (t && window.__said[window.__said.length - 1] !== t) window.__said.push(t) } })
      .observe(document.body, { subtree: true, childList: true, characterData: true })
  })
}
/* signing out is not under test: the page's own Logout button, pressed by its handler wherever the shell keeps it */
export async function signOut(w) { await w.page.evaluate(() => document.querySelector('#logout')?.click()); await w.page.waitForSelector('#luser') }
/* a reload of the saved world, then a sign-in — what was saved is what comes back */
export async function reloadAs(w, who) {
  await w.page.goto(ORIGIN + '/'); await w.page.waitForTimeout(400)
  if (await w.page.locator('#luser').count()) await signInSaved(w, who)
  else await w.page.waitForSelector('#vWeek .day', { state: 'attached' })
}
/* the main tabs, pressed as a person does (a phone through its menu) */
export async function goPage(w, pageId, label) {
  const P = w.page
  if (w.phone) {
    await P.tap('#burger'); await P.waitForTimeout(300)
    await P.getByText(label, { exact: true }).locator('visible=true').first().tap()
  } else await P.click(`.nav a[data-page="${pageId}"]`)
  await P.waitForFunction(id => window.CURPAGE === id, pageId); await P.waitForTimeout(500)
}
export const toWar = async w => { await goPage(w, 'leavewar', 'Leave War'); await L.openWar(w).catch(() => {}) }
export const toQuals = async w => { await goPage(w, 'quals', 'Quals'); await w.page.waitForSelector('#qtbl td.qname') }

/* ---- Admin → Users ---- */
export async function adminUsers(w) {
  const P = w.page
  await goPage(w, 'admin', 'Admin')
  const back = P.locator('#page-admin .adm-back')
  if (await back.count() && await back.first().isVisible()) await back.first().click()
  await P.evaluate(() => { const b = [...document.querySelectorAll('#page-admin button')].find(b => b.getBoundingClientRect().width > 0 && /^Users/.test((b.textContent || '').trim())); if (b) b.click() })
  await P.waitForTimeout(400)
}
export async function deleteOnUsers(w, pid) {
  const P = w.page
  await adminUsers(w)
  await P.locator(`#accList [data-person="${pid}"] .acc-main`).scrollIntoViewIfNeeded()
  await L.press(w, `#accList [data-person="${pid}"] .acc-main`); await P.waitForTimeout(300)
  await L.press(w, '#accEdDel'); await P.waitForTimeout(200)
  await L.press(w, '#accEdDel'); await P.waitForTimeout(700)
  return P.evaluate(pid => !!(window.PEOPLE[pid] && window.PEOPLE[pid].deleted), pid)
}
/* his row on Admin → Users: its words as drawn — an archived man stands in the archived fold, opened by its own button
   first — null when he has none */
export async function usersRow(w, pid) {
  const P = w.page
  const inArch = await P.locator(`#page-admin [data-person="${pid}"][data-archived]`).count()
  const t = P.locator('#accArchToggle')
  if (!inArch && await t.count() && (await t.getAttribute('aria-expanded')) !== 'true') { await L.press(w, '#accArchToggle'); await P.waitForTimeout(300) }
  const row = P.locator(`#page-admin [data-person="${pid}"]`).first()
  if (await row.count()) await row.scrollIntoViewIfNeeded().catch(() => {})
  return usersRowWords(w, pid)
}
const usersRowWords = (w, pid) => w.page.evaluate(pid => { const e = document.querySelector(`#page-admin [data-person="${pid}"]`); return e && e.getBoundingClientRect().height > 0 ? e.innerText.replace(/\s+/g, ' ').trim() : (e ? '(in a folded list) ' + e.textContent.replace(/\s+/g, ' ').trim() : null) }, pid)

/* ---- the war ---- */
/* the bid window closed and the page back at its top: on a phone the grid scrolls the tapped day into view (D1290), which
   leaves the tab row above the screen (lw-sf-s1.mjs's settle) */
export async function settle(w) {
  await L.closeWin(w)
  await w.page.evaluate(() => { window.scrollTo(0, 0); for (const e of document.querySelectorAll('#page-leavewar, #page-leavewar *, main, body, html')) if (e.scrollTop > 0) e.scrollTop = 0 })
  await w.page.waitForTimeout(250)
}
/* a pending LL placed by the admin (Auto-approve off) from the bid window */
export async function pendingLL(w, pid, d, type = 'LL') {
  await toWar(w); await L.openGrid(w)
  await L.openCell(w, pid, d)
  await L.autoApprove(w, false)
  const ok = await L.placeLeave(w, type)
  await settle(w)
  return ok
}
const linesOf = async (w, pid) => (await L.apprLines(w.page)).filter(l => l.who === pid)
export const lineIdx = async (w, pid, d) => (await linesOf(w, pid)).findIndex(l => l.text.includes(String(+d.slice(8, 10))))
/* his pending line on d approved on Approvals — returns the line's lit state after */
export async function approveOn(w, pid, d) {
  await toWar(w); await settle(w); await L.openApprovals(w)
  const i = await lineIdx(w, pid, d)
  if (i < 0) return 'no line'
  await L.apprPress(w, pid, 'appr-approve', i)
  const l = (await linesOf(w, pid))[i]
  await L.openGrid(w)
  return l ? l.lit : 'gone'
}
/* the bid window opened on one of his days, its ⋯ → Post out, the outcome chip picked, its button pressed (twice for Delete) */
export async function postOutFrom(w, pid, d, outcome, pic = null) {
  const P = w.page
  await toWar(w); await L.openGrid(w)
  await L.openCell(w, pid, d)
  await L.press(w, L.T('bid-more')); await P.waitForTimeout(250)
  await L.press(w, L.T('bid-postout')); await P.waitForTimeout(400)
  const chip = L.T(`po-${outcome}`)
  if ((await P.locator(chip).getAttribute('aria-pressed')) !== 'true') await L.press(w, chip)
  await P.waitForTimeout(200)
  const date = await P.locator(L.T('po-date')).getAttribute('data-value').catch(() => null)
  const line = await L.txt(P, L.T('po-line'))
  await L.press(w, L.T('po-confirm')); await P.waitForTimeout(300)
  if (pic) await L.shot(w, pic)
  if (outcome === 'delete' && await L.vis(P, L.T('po-confirm'))) { await L.press(w, L.T('po-confirm')); await P.waitForTimeout(700) }
  await settle(w)
  return { date, line }
}
/* his approved leave on `from` picked up by the bid window's Move and laid on `to` (a desktop click lands it; a phone's tap
   stages it, then Confirm) — returns what the banner said, or null when Move was not offered */
export async function moveLeave(w, pid, from, to, pic = null) {
  const P = w.page
  await toWar(w); await L.openGrid(w)
  await L.openCell(w, pid, from)
  if (!(await L.vis(P, L.T('decide-shift')))) { await L.closeWin(w); return null }
  await L.press(w, L.T('decide-shift')); await P.waitForTimeout(450)
  const said0 = await L.txt(P, L.T('move-banner'))
  await L.reachCell(w, pid, to)
  await L.press(w, L.T(L.cellId(pid, to))); await P.waitForTimeout(500)
  if (await L.vis(P, L.T('move-confirm'))) { if (pic) await L.shot(w, pic); await L.press(w, L.T('move-confirm')); await P.waitForTimeout(500) }
  const said1 = await L.txt(P, L.T('move-banner'))
  if (said1) await L.press(w, L.T('move-cancel')).catch(() => {})
  await settle(w)
  return { banner: said0, after: said1 }
}
/* his war-approved leave inputs, with their dates, read through the localhost bridge */
export const warLeave = (w, pid) => w.page.evaluate(pid => (window.INPUTS || []).filter(r => r && r.lw && (Array.isArray(r.people) ? r.people.some(e => e && String(e.p) === pid) : String(r.person) === pid)).map(r => ({ iid: r.iid, type: r.type, date: r.date, end: r.endDate || null })), pid)
export const redoOffered = w => w.page.evaluate(() => { const b = document.querySelector('#redoBtn'); return b ? !b.disabled : null })
export const lastSaid = (w, n = 2) => w.page.evaluate(n => (window.__said || []).slice(-n), n)

/* ---- the Inputs page: a leave's own window, its dates made from..to, Save ---- */
export async function lengthenOnInputs(w, iid, from, to, pic = null) {
  const P = w.page
  await goPage(w, 'inputs', 'Inputs')
  /* the calendar's month, by its own heading, stepped with its arrows until it reads the leave's month (walk-scripts §4) */
  const want = +from.slice(0, 4) * 12 + +from.slice(5, 7) - 1
  const MONS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  for (let i = 0; i < 24; i++) {
    const lab = await P.locator('#inpCal .ic-mon').first().getAttribute('aria-label').catch(() => null)
    const m = lab && lab.match(/^(\w+) (\d{4})$/)
    if (!m) break
    const at = +m[2] * 12 + MONS.indexOf(m[1])
    if (at === want) break
    await L.press(w, at > want ? '#icPrev' : '#icNext'); await P.waitForTimeout(250)
  }
  console.log('   Inputs calendar on:', await P.locator('#inpCal .ic-mon').first().getAttribute('aria-label').catch(() => '?'))
  const bar = P.locator(`.ib-bar[data-iid="${iid}"]`).first()
  if (!(await bar.count())) return 'no bar for ' + iid
  await bar.scrollIntoViewIfNeeded(); await bar.click({ position: { x: 5, y: 5 } }); await P.waitForTimeout(600)
  if (!(await P.locator(L.T(`inpEdCal-day-${from}`)).count())) return 'no window calendar'
  await L.press(w, L.T(`inpEdCal-day-${from}`)); await L.press(w, L.T(`inpEdCal-day-${to}`)); await P.waitForTimeout(200)
  if (pic) await L.shot(w, pic)
  await L.press(w, '#inpEditSave'); await P.waitForTimeout(500)
  if (await L.vis(P, L.T('docconf-nodoc'))) { await L.press(w, L.T('docconf-nodoc')); await P.waitForTimeout(500) }
  return 'saved'
}

/* ---- Quals ---- */
export const qcell = (pid, k) => `#qtbl td[data-q="${pid}|${k}"]`
export const qTicked = (w, pid, k) => w.page.locator(qcell(pid, k)).evaluate(e => !!e.querySelector('.qchk'))
/* a picture with the cell in question outlined ON the element (an outline takes no room), centred in its table */
export async function qShot(w, name, pid, k) {
  const l = w.page.locator(qcell(pid, k)).first()
  await l.evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.style.outline = '2px dashed #ff4fd8'; e.style.outlineOffset = '-3px' })
  await w.page.waitForTimeout(150)
  await L.shot(w, name)
  await l.evaluate(e => { e.style.outline = ''; e.style.outlineOffset = '' })
}
