/* Walker W4's helpers — [DB-READINESS] group A FULL walk (30 Sep 26): the conversion, damage, the shared store.
   Import AFTER setting HP_URL / HP_SHOTS / HP_OUT (the shared drivers read them at import time).
   Everything that CHANGES the world goes through the app's own controls; reads of window.* and of storage are for the
   evidence only. The read-out (`readAll`) is what the app holds, read the same way on `main`'s build and on this one. */
import * as L from './dbrA-lib.mjs'
import * as A from './ab/ab-lib.mjs'
import { tapBall as w3tap } from './trk-w3-lib.mjs'
export { L, A }
export const sleep = L.sleep

/* ---------------- sign-in ---------------- */
export async function signOut(p) {
  for (const sel of ['#logout', '#accOut', '#guestOut']) {
    const l = p.locator(sel)
    if (await l.count() && await l.first().isVisible()) { await l.first().click(); await sleep(500); break }
  }
  if (!(await p.locator('#luser:visible').count())) {
    const b = p.locator('#burger')
    if (await b.count() && await b.isVisible()) { await b.click(); await sleep(300); await p.click('#drawerLogout'); await sleep(500) }
  }
  await p.waitForSelector('#luser', { state: 'visible', timeout: 10000 })
}
/* type a name and password on the sign-in card (whatever follows: the app, the sign-up card, a refusal) */
export async function typeSignIn(p, name, pass = 'x') {
  await p.waitForSelector('#luser', { state: 'visible', timeout: 10000 })
  await p.fill('#luser', name); await p.fill('#lpass', pass)
  await p.click('#loginForm button[type=submit]')
  await sleep(900)
}

/* ---------------- the schedule ---------------- */
export async function dayNote(p, key, text) {
  await A.editWeek(p)
  await A.editText(p, key, text)
}

/* the edit week's own week chips ("Jul 20") */
export async function toWeek(p, label, wk) {
  await A.editWeek(p)
  const b = p.locator('button:visible', { hasText: new RegExp('^\\s*' + label + '\\s*$') }).first()
  await b.click()
  await p.waitForFunction(w => window.CURWEEK === w, wk, { timeout: 8000 })
  await sleep(700)
}

/* ---------------- the Inputs page ---------------- */
export async function fileReq(p, f) { return A.fileInput(p, f) }
/* the Inputs table's rows in the order the page draws them, over a date window moved through its own 📅 button */
export async function inputsList(p, from = '2026-07-01', to = '2026-10-31') {
  await A.inputsWindow(p, from, to)
  await sleep(300)
  return p.evaluate(() => [...document.querySelectorAll('#inBody tr[data-iid]')].map(r => r.getAttribute('data-iid') + ' | ' + (r.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 90)))
}

/* ---------------- the planning calendar (Inputs → 📅 Calendar view) ---------------- */
const MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export async function calOpenDay(p, iso) {
  await A.inputsView(p, 'cal')
  for (let i = 0; i < 24; i++) {
    const t = ((await p.locator('.ic-mon').first().textContent().catch(() => '')) || '').trim()
    const [m, y] = t.split(/\s+/)
    const at = `${y}-${String(MONS.indexOf((m || '').slice(0, 3)) + 1).padStart(2, '0')}`
    if (at === iso.slice(0, 7)) break
    await p.click(at < iso.slice(0, 7) ? '#icNext' : '#icPrev'); await sleep(250)
  }
  const c = p.locator(`[data-icday="${iso}"]`).first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center' }))
  const bx = await c.boundingBox()
  /* a tap: down and up in place (a hold would add an input) */
  await p.mouse.move(bx.x + bx.width / 2, bx.y + 12); await p.mouse.down(); await sleep(60); await p.mouse.up()
  await p.waitForSelector('.ic-pop', { timeout: 5000 })
  await sleep(300)
}
export async function calClose(p) {
  if (await p.locator('#icPopClose:visible').count()) { await p.click('#icPopClose'); await sleep(300) }
  if (await p.locator('#icClose:visible').count()) { await p.click('#icClose'); await sleep(400) }
}
export async function calTitle(p, iso, text) {
  await calOpenDay(p, iso)
  await p.fill('#icRmkEdit', text)
  await p.press('#icRmkEdit', 'Enter')
  await sleep(500)
}
export async function calPucks(p, iso, pids) {
  await calOpenDay(p, iso)
  await p.click('#icAddPucks'); await sleep(400)
  for (const id of pids) { await p.click(`[data-pickp="${id}"]`); await sleep(120) }
  await p.click('#icPickOk'); await sleep(600)
}
export async function calNote(p, iso, text) {
  await calOpenDay(p, iso)
  await p.click('#icAddPuck'); await sleep(250)
  const inp = p.locator('.ic-poppuck-edit').first()
  await inp.fill(text); await inp.press('Enter'); await sleep(500)
}
/* what the calendar holds for a date: its title, its sections (notes and pucks rows) in order */
export async function calRead(p, iso) {
  await calOpenDay(p, iso)
  const r = await p.evaluate(() => {
    const pop = document.querySelector('.ic-pop')
    return {
      title: (pop.querySelector('#icRmkEdit') || {}).value ?? (pop.querySelector('.ic-title-ro') || {}).textContent ?? '',
      secs: [...pop.querySelectorAll('.ic-sec')].map(s => s.querySelector('.ic-secpucks')
        ? 'pucks:' + [...s.querySelectorAll('.ic-secpk [data-person]')].map(e => e.getAttribute('data-person')).join(',')
        : 'note:' + ((s.querySelector('.ic-poppuck-txt') || {}).textContent || '')),
    }
  })
  await calClose(p)
  return r
}

/* ---------------- Quals, Admin → Users ---------------- */
export async function qualsOrder(p) {
  await L.go(p, 'quals')
  if (await p.locator('#qViewA').count()) { await p.click('#qViewA'); await sleep(300) }
  const rows = await p.evaluate(() => [...document.querySelectorAll('#qtbl tbody tr:not(.grp)')].map(r => (r.querySelector('.qname') || {}).textContent?.trim() + ' ' + ((r.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 70))))
  let arch = ''
  if (await p.locator('#qArchToggle').count()) {
    if (!(await p.locator('[data-testid="qarchlist"]').count())) { await p.click('#qArchToggle'); await sleep(400) }
    arch = ((await p.locator('[data-testid="qarchlist"]').first().innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim()
    await p.click('#qArchToggle').catch(() => {}); await sleep(200)
  }
  return { rows, arch }
}
export async function usersPane(p) {
  await L.go(p, 'admin')
  const t = p.locator('[data-admcat="users"]')
  if (await t.count() && await t.first().isVisible()) { await t.first().click(); await sleep(300) }
  /* on a phone Admin opens on its list of panes: Users is a tap in */
  if (!(await p.locator('#accList').isVisible().catch(() => false))) {
    const c = p.locator('.adm-cat:visible', { hasText: 'Users' }).first()
    if (await c.count()) { await c.click(); await sleep(400) }
  }
  await sleep(300)
  const at = p.locator('#accArchToggle')
  if (await at.count() && (await at.getAttribute('aria-expanded')) !== 'true') { await at.click(); await sleep(300) }
  return p.evaluate(() => ({
    list: ((document.querySelector('#accList') || {}).innerText || '').replace(/\n+/g, ' | ').trim(),
    archived: ((document.querySelector('#accArchived') || {}).innerText || '').replace(/\n+/g, ' | ').trim(),
    waiting: ((document.querySelector('#admWaiting') || {}).innerText || '').replace(/\n+/g, ' | ').trim(),
  }))
}

/* archive a man through his Admin → Users row (one tap — D310, D322, D323) */
export async function archiveOnUsers(p, pid) {
  await usersPane(p)
  const row = p.locator(`#accList [data-person="${pid}"] .acc-tap`).first()
  await row.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await row.click(); await sleep(300)
  await p.click('#accEdArchive'); await sleep(600)
}

/* ---------------- the change history (Edit Schedule's clock) ---------------- */
export async function histRead(p) {
  await A.editWeek(p)
  return p.evaluate(() => ({
    num: ((document.querySelector('#histBtn .chgnum') || {}).textContent || '').trim(),
    chips: [...document.querySelectorAll('#eWeek .day')].map(d => ((d.querySelector('.day-head .dpend') || {}).textContent || '').trim()),
    tags: [...document.querySelectorAll('#eWeek .day')].map(d => ((d.querySelector('.verchip') || {}).textContent || '').trim()),
  }))
}
export async function markAllSeen(p) {
  await A.editWeek(p)
  await p.click('#histBtn'); await sleep(400)
  if (await p.locator('.chgwin.bar').count()) { await p.click('.chgwin.bar .cw-barbtn'); await sleep(300) }
  await p.click('.chgwin .win-tab:has-text("New to you")'); await sleep(200)
  await p.click('.chgwin .cw-day:has-text("Week")'); await sleep(200)
  const b = p.locator('.chgwin .cw-seen').first()
  const had = (await b.count()) && !(await b.isDisabled()) ? 1 : 0
  if (had) { await b.click(); await sleep(500) }
  await p.click('.chgwin .win-x').catch(() => {}); await sleep(300)
  return had
}

/* ---------------- the Leave War ---------------- */
export const lwOpen = (p, iso) => A.lwOpen(p, iso)
/* the war page stays mounted (hidden) once visited, so its boxes are in the page even while another page shows:
   every war gesture first brings the war and the month on screen */
async function onWar(p, iso) { if ((await p.evaluate(() => window.CURPAGE)) !== 'leavewar' || !(await p.locator(`[data-testid="head-${iso}"]`).count())) await A.lwOpen(p, iso) }
export async function lwBid(p, id, iso, code = 'LL') { await onWar(p, iso); return A.bidOn(p, id, iso, code) }
/* ⇄ Move: tap the bid, its sheet's Move picks it up, a click on the day lands it (desktop) */
export async function lwMove(p, id, iso, toIso) {
  await onWar(p, iso)
  const t = await A.tapCell(p, id, iso)
  let r = await A.sheetPress(p, 'decide-shift')
  if (!r.pressed && t.open === 'daylist-sheet') r = await A.sheetPress(p, /Move/)
  if (!r.pressed) { await A.closeSheets(p); return { moved: false, why: r.why, tap: t.open } }
  await sleep(400)
  const c = p.locator(`[data-testid="cell-${id}-${toIso}"]`).first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await sleep(300)
  const bx = await c.boundingBox()
  await p.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2)
  await sleep(700)
  const s = await A.sheetNow(p)
  if (s.open !== 'nothing') { const ok = p.locator('button:visible', { hasText: /^Confirm/ }).first(); if (await ok.count()) { await ok.click(); await sleep(500) } }
  return { moved: true, after: s.open }
}
export async function lwDecide(p, id, iso, how = 'approve') {
  await onWar(p, iso)
  const t = await A.tapCell(p, id, iso)
  const r = await A.sheetPress(p, `decide-${how}`)
  await A.closeSheets(p)
  return { tap: t.open, pressed: r.pressed, why: r.why }
}
export async function lwAward(p, id, iso, days = '1', why = 'W4 award by hand') {
  await onWar(p, iso)
  const t = await A.tapCell(p, id, iso)
  if (t.open !== 'bid-picker') { await A.closeSheets(p); return { given: false, why: 'opened ' + t.open } }
  await p.click('[data-testid="bid-oil"]'); await sleep(250)
  await p.fill('[data-testid="oil-why"]', why)
  await p.fill('[data-testid="oil-days"]', String(days))
  await p.click('[data-testid="oil-give"]'); await sleep(600)
  const still = await p.locator('[data-testid="bid-picker"]').count()
  const err = (await p.locator('[data-testid="oil-err"]').allInnerTexts()).join(' ')
  if (still) await A.closeSheets(p)
  return { given: !still, err }
}
export async function lwPostOut(p, id, iso, fromIso) {
  await onWar(p, iso)
  const t = await A.tapCell(p, id, iso)
  if (t.open !== 'bid-picker') { await A.closeSheets(p); return { posted: false, why: 'opened ' + t.open } }
  await p.click('[data-testid="bid-postout"]'); await sleep(300)
  await p.fill('[data-testid="po-date"]', fromIso); await sleep(200)
  const line = await p.locator('[data-testid="po-line"]').first().innerText().catch(() => '')
  await p.click('[data-testid="po-confirm"]'); await sleep(700)
  const err = (await p.locator('[data-testid="post-err"]').allInnerTexts()).join(' ')
  await A.closeSheets(p)
  return { posted: !err, line, err }
}
export async function lwStage(p) { return ((await p.locator('[data-testid="stage-now"]').first().innerText().catch(() => '')) || '').trim() }
export async function lwAdvance(p) {
  await L.go(p, 'leavewar'); await sleep(500)
  await p.click('[data-testid="stage-advance"]'); await sleep(700)
  return lwStage(p)
}
/* every day box the grid draws for a month (the grid draws a rolling window of months around it) */
export async function lwGrid(p, iso) {
  await A.lwOpen(p, iso)
  return p.evaluate(m => {
    const o = {}
    for (const c of document.querySelectorAll('[data-testid^="cell-"]')) {
      const k = c.getAttribute('data-testid').slice(5)
      if (!k.includes('-' + m)) continue
      const mk = document.querySelector(`[data-testid="mark-${k}"]`), po = document.querySelector(`[data-testid="potag-${k}"]`)
      const t = (c.innerText || '').replace(/\s+/g, ' ').trim() + (mk ? '[' + mk.innerText.trim() + ']' : '') + (po ? '{PO}' : '')
      if (t) o[k] = t + '·' + String((c.querySelector('.c') || c).className).replace(/\s+/g, ' ').trim().slice(0, 60)
    }
    return o
  }, iso.slice(0, 7))
}

/* ---------------- the Tracker ---------------- */
export async function toTracker(p) {
  const tab = p.locator('#topnav a[data-page="tracker"]:visible')
  if (await tab.count()) await tab.click()
  else { await p.click('#burger'); await sleep(250); await p.locator('#drawer a[data-page="tracker"]').first().click() }
  await p.waitForFunction(() => window.CURPAGE === 'tracker')
  await p.waitForSelector('#flowSvg .ball, .trk-nocourse, #trkNoCourse, [data-testid="trk-nocourse"]', { timeout: 20000 }).catch(() => {})
  await sleep(700)
}
export async function answer(p, value = null, press = /^(OK|Yes|Save|Delete|Add|Rename|Remove|Continue|Import|Replace|Done)/i) {
  await p.waitForSelector('#dlgModal', { state: 'visible', timeout: 6000 })
  const text = (await p.locator('#dlgModal').innerText()).trim()
  if (value != null) {
    const own = p.locator('#dlgInput:visible')
    const inp = (await own.count()) ? own.first() : p.locator('#dlgModal input:visible, #dlgModal textarea:visible').first()
    await inp.fill(String(value))
  }
  const btn = p.locator('#dlgModal button:visible').filter({ hasText: press }).first()
  await ((await btn.count()) ? btn : p.locator('#dlgModal button:visible').last()).click()
  await sleep(400)
  return text
}
export async function menuItem(p, menu, itemId) {
  await p.click(`#${menu}MenuBtn`)
  await p.waitForSelector(`#${itemId}`, { state: 'visible', timeout: 4000 })
  await p.click(`#${itemId}`)
  await sleep(300)
}
export async function addStudent(p, name) { await p.click('#addStu'); await answer(p, name); await sleep(500) }
export const firstBalls = (p, n) => p.evaluate(n => [...document.querySelectorAll('#flowSvg .ball')].map(g => g.dataset.id).slice(0, n), n)
export async function typeDetails(p, ballId, vals) {
  await w3tap(p, ballId)
  await p.waitForSelector('#popEditInfo', { state: 'visible', timeout: 5000 })
  await p.click('#popEditInfo')
  await p.waitForSelector('#infoModal', { state: 'visible' })
  for (const [k, v] of Object.entries(vals)) await p.fill('#if' + k, v)
  await p.click('#ifSave'); await sleep(600)
}
/* a grade on a ball for the picked student: tap it, press the grade (DCO…) in its pop-up, re-date "Done on" */
export async function grade(p, ballId, label = 'DCO', doneOn = null) {
  await w3tap(p, ballId)
  await p.waitForSelector('#pop', { state: 'visible', timeout: 5000 })
  await p.locator('#pop button', { hasText: new RegExp('^\\s*' + label + '\\s*$') }).first().click(); await sleep(500)
  if (doneOn) {
    await w3tap(p, ballId)
    await p.waitForSelector('#popDoneDate', { state: 'visible', timeout: 5000 })
    await typeDay(p, '#popDoneDate', doneOn)
  }
  await p.keyboard.press('Escape'); await sleep(300)
}
/* a date box typed the way a person does (day, month, year) */
export async function typeDay(p, sel, iso) {
  const [y, m, d] = iso.split('-')
  const loc = p.locator(sel).first()
  await loc.scrollIntoViewIfNeeded()
  const b = await loc.boundingBox()
  await p.mouse.click(b.x + 10, b.y + b.height / 2); await sleep(80)
  await p.keyboard.type(d + m + y, { delay: 45 })
  await sleep(400)
  return loc.inputValue()
}
export async function setPace(p, v) {
  const box = p.locator('#epwIn'); await box.scrollIntoViewIfNeeded()
  await box.click({ clickCount: 3 }); await sleep(80)
  await p.keyboard.press('Backspace'); await sleep(250)
  await p.keyboard.type(String(v), { delay: 60 }); await sleep(600)
  return box.inputValue()
}
/* + Set lull period, then its first and last day on its own calendar */
export async function setLull(p, from, to) {
  await p.locator('#setLullBtn').scrollIntoViewIfNeeded()
  await p.click('#setLullBtn'); await sleep(350)
  const day = async iso => {
    for (let i = 0; i < 24; i++) {
      const st = await p.evaluate(iso => { const m = document.querySelector('#lullCal .cal .hd b'); const c = document.querySelector(`#lullCal .day[data-iso="${iso}"]`); return { month: m && m.textContent, here: !!c && !c.classList.contains('out') } }, iso)
      if (st.here) break
      const want = new Date(iso + 'T00:00:00'), shown = new Date('1 ' + st.month)
      await p.click(want < shown ? '#lullPrev' : '#lullNext'); await sleep(150)
    }
    await p.locator(`#lullCal .day[data-iso="${iso}"]`).click(); await sleep(300)
  }
  await day(from); await day(to)
  return p.evaluate(() => [...document.querySelectorAll('#lullChips .lullchip')].map(c => c.textContent.replace('×', '').replace(/\s+/g, ' ').trim()))
}
export async function pickOpt(p, sel, labelRe) {
  const v = await p.evaluate(({ sel, src, flags }) => { const re = new RegExp(src, flags); const o = [...document.querySelector(sel).options].find(o => re.test(o.textContent)); return o ? o.value : null }, { sel, src: labelRe.source, flags: labelRe.flags })
  if (v == null) throw new Error('no option ' + labelRe + ' in ' + sel)
  await p.selectOption(sel, v); await sleep(900)
  return v
}
export async function trkPicture(p) {
  return p.evaluate(async () => {
    const t = window.__coreForTests
    if (!t) return { none: 'no __coreForTests' }
    return {
      charts: await t.collectCharts(null, { deleted: true }),
      students: await t.collectStudents(),
      courses: t.coursesNow(),
      dropdown: [...document.querySelectorAll('#sylSel option')].map(o => o.textContent),
      course: (document.getElementById('courseSel') || {}).value ?? null,
      crew: [...document.querySelectorAll('#activeSel option')].map(o => o.textContent),
    }
  })
}

/* ---------------- storage ---------------- */
export const canon = v => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x)) ? Object.fromEntries(Object.keys(x).sort().map(kk => [kk, x[kk]])) : x)
/* the old whole-bundle keys a converted store must no longer hold */
export const OLD_KEY = /^(inputs\/all|people\/all|plan\/all|leavewar\/(wars|openings|ledger|postouts|perslabels|personedits)|settings\/(elog|changeseen|accounts|accessreqs)|tracker\/v3:(courses|delcourses|master:(syls|sylcat|sylorder|sylhidden|syltomb|eventinfo)))$|^tracker\/.*:roster$/
/* a whole-week record: `weeks/<dd-mm-yyyy>` whose value still carries the days (`d`) */
export function wholeWeeks(rows) {
  return Object.keys(rows).filter(k => /^weeks\/\d\d-\d\d-\d{4}$/.test(k)).filter(k => { try { return Array.isArray(JSON.parse(rows[k]).d) } catch { return false } })
}
export const byColl = rows => { const o = {}; for (const k of Object.keys(rows)) { const c = k.split(/[/:]/)[0]; o[c] = (o[c] || 0) + 1 } return o }
