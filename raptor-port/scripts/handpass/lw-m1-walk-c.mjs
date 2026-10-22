// WALKER C — the Leave War M1 (open dates) walk, share C: the seams and what must not change.
// Desktop 1440 x 900 by mouse, phone 390 x 844 by finger (touch). Served frozen on http://localhost:4254/ (never rebuilt).
//   node scripts/handpass/lw-m1-walk-c.mjs            (all scenarios; empties its picture folder first)
//   SCEN=s6,s28 SIZES=desk node scripts/handpass/lw-m1-walk-c.mjs   (some only; keeps the folder)
// Assertions state the RIGHT behaviour: PASS = correct. RECORD only where the scenario says RECORD.
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const VERSION = 'lw-m1-walk-c v5'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(HERE, '../../docs/img/handpass/2026-10-22-lw-m1-open-dates/' + (process.env.C_OUT || 'c'))
const ONLY = process.env.SCEN ? process.env.SCEN.split(',') : null
const SIZES = process.env.SIZES ? process.env.SIZES.split(',') : ['desk', 'phone']
if (!ONLY) { rmSync(OUT, { recursive: true, force: true }) }
mkdirSync(OUT, { recursive: true })
const URLF = 'http://localhost:4254/?fresh=1'
const URLR = 'http://localhost:4254/'
const OPTS = {
  desk: { viewport: { width: 1440, height: 900 } },
  phone: { ...devices['iPhone 13'], viewport: { width: 390, height: 844 } },
}
console.log(VERSION, 'out:', OUT, 'only:', ONLY || 'all', 'sizes:', SIZES.join(','))

const browser = await chromium.launch(launchOptions)
const rows = []          // the table
const consoleErrs = []   // console / page errors seen, tagged
let TAG = ''
let n = 0
const pics = []

function rec(id, size, verdict, said) {
  const row = { id, size, verdict, said, pics: pics.splice(0) }
  rows.push(row)
  console.log(`[${verdict}] ${id} (${size}): ${said}${row.pics.length ? '  pics: ' + row.pics.join(', ') : ''}`)
}
async function shot(page, name) {
  n++
  const f = `${String(n).padStart(2, '0')}-${TAG}-${name}.png`
  await page.screenshot({ path: resolve(OUT, f) })
  pics.push(f)
  return f
}
async function newCtx(size, url = URLF) {
  const ctx = await browser.newContext(OPTS[size])
  const page = await ctx.newPage(); page.setDefaultTimeout(12000)
  page.on('console', m => { if (m.type() === 'error') consoleErrs.push(`${TAG}: console: ${m.text().slice(0, 200)}`) })
  page.on('pageerror', e => consoleErrs.push(`${TAG}: pageerror: ${e.message.slice(0, 200)}`))
  await page.goto(url)
  return { ctx, page }
}
async function signIn(page, u, p) {
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
}
async function gotoLW(page, me = 'bane') {
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector(`[data-testid="row-${me}"]`)
  await page.waitForTimeout(1200)
}
const isPhone = size => size === 'phone'
/** a mouse press on a desktop, a finger on a phone */
async function press(page, size, loc) {
  const l = typeof loc === 'string' ? page.locator(loc).first() : loc
  if (isPhone(size)) await l.tap(); else await l.click()
  await page.waitForTimeout(250)
}
async function cell(page, p, iso) {
  const c = page.locator(`[data-testid="cell-${p}-${iso}"]`)
  if (!(await c.count())) {
    // a phone draws only the months near its landing: the month strip brings the wanted one in
    const mon = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][Number(iso.slice(5, 7)) - 1]
    await page.locator('[data-testid="month-strip"] button', { hasText: new RegExp('^' + mon + '$') }).first().click()
    await page.waitForTimeout(1200)
  }
  await c.waitFor({ state: 'attached', timeout: 10000 })
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(400)
  return c
}
async function closeSheet(page, size) {
  for (const id of ['bid-cancel', 'closed-note-close', 'daylist-close', 'award-close', 'remarks-cancel', 'open-dates-close']) {
    const b = page.locator(`[data-testid="${id}"]`)
    if (await b.count()) { await press(page, size, b.first()); return id }
  }
  return null
}
/** a bid by the sheet's own controls, answering the "below zero — tap again" confirmation; returns the sheet's words */
async function placeBid(page, size, p, iso, type = 'LL') {
  await press(page, size, await cell(page, p, iso))
  await page.waitForSelector('[data-testid="bid-picker"]')
  await press(page, size, `[data-testid="bid-${type}"]`); await page.waitForTimeout(250)
  const t = await page.locator('[data-testid="bid-picker"]').innerText()
  if (/Tap the same leave again/.test(t)) { await press(page, size, `[data-testid="bid-${type}"]`); await page.waitForTimeout(250) }
  await closeSheet(page, size)
}
async function approve(page, size, p, iso) {
  await press(page, size, await cell(page, p, iso))
  await page.waitForSelector('[data-testid="decide-approve"]')
  await press(page, size, '[data-testid="decide-approve"]'); await page.waitForTimeout(250)
  await closeSheet(page, size)
}
const txt = async (page, sel) => (await page.locator(sel).first().innerText().catch(() => '')).replace(/\s*\n+\s*/g, ' | ')
const cellText = async (page, p, iso) => (await page.locator(`[data-testid="cell-${p}-${iso}"]`).first().innerText().catch(() => '<no cell>')).replace(/\s+/g, ' ').trim()
const cellCls = async (page, p, iso) => (await page.locator(`[data-testid="cell-${p}-${iso}"]`).first().evaluate(e => e.className + ' / ' + [...e.querySelectorAll('*')].map(c => c.className).join(' ')).catch(() => '<no cell>'))
const count = (page, sel) => page.locator(sel).count()
function scen(id) { return !ONLY || ONLY.includes(id) }

// ============================================================================================================
// S6 — an admin's tap on approved leave still gets Back to bid / Refuse / Move / Delete, not only the remarks
// ============================================================================================================
async function s6(size) {
  TAG = `${size}-s6`
  const { ctx, page } = await newCtx(size)
  try {
    await signIn(page, 'ad', 'a'); await gotoLW(page)
    const out = {}
    // one OPEN day (20 Jan 26) and one CLOSED day (20 May 26): an approved leave each
    for (const [k, iso] of [['open', '2026-01-20'], ['closed', '2026-05-20']]) {
      await placeBid(page, size, 'bane', iso); await approve(page, size, 'bane', iso)
      await press(page, size, await cell(page, 'bane', iso))
      await page.waitForSelector('[data-testid="bid-picker"],[data-testid="remarks-sheet"]')
      const has = {
        picker: await count(page, '[data-testid="bid-picker"]'), remarks: await count(page, '[data-testid="remarks-sheet"]'),
        ack: await count(page, '[data-testid="decide-ack"]'), approve: await count(page, '[data-testid="decide-approve"]'),
        refuse: await count(page, '[data-testid="decide-refuse"]'), move: await count(page, '[data-testid="decide-shift"]'),
        del: await count(page, '[data-testid="bid-clear"]'),
      }
      has.approvedPressed = await page.locator('[data-testid="decide-approve"]').first().getAttribute('aria-pressed').catch(() => null)
      out[k] = has
      await shot(page, `${k}-day-approved-leave-sheet`)
      const ok = has.picker && !has.remarks && has.ack && has.approve && has.refuse && has.move && has.del && has.approvedPressed === 'true'
      rec(`S6 admin taps approved leave on an ${k} day (${iso})`, size, ok ? 'PASS' : 'FAIL',
        `bid sheet ${has.picker ? 'opened' : 'NOT opened'}; remarks-only sheet ${has.remarks ? 'opened' : 'not opened'}; Ack/Approve/Refuse ${has.ack}/${has.approve}/${has.refuse}; Move ${has.move}; Delete ${has.del}; Approve pressed=${has.approvedPressed}`)
      // Back to bid (Ack), then Refuse, then Approve again: a decision closes the sheet, so each is read by reopening the day
      const decideThenRead = async which => {
        await press(page, size, `[data-testid="decide-${which}"]`); await page.waitForTimeout(350)
        await closeSheet(page, size)
        await press(page, size, await cell(page, 'bane', iso)); await page.waitForSelector('[data-testid="decide-approve"]')
        return page.locator(`[data-testid="decide-${which}"]`).first().getAttribute('aria-pressed')
      }
      const ack = await decideThenRead('ack')
      const ref = await decideThenRead('refuse')
      await shot(page, `${k}-day-after-ack-then-refuse`)
      const app = await decideThenRead('approve')
      rec(`S6 admin sends it back to a bid, refuses, approves again on the ${k} day`, size, ack === 'true' && ref === 'true' && app === 'true' ? 'PASS' : 'FAIL',
        `Ack pressed=${ack}; then Refuse pressed=${ref}; then Approve pressed=${app} (read by reopening the day each time)`)
      await closeSheet(page, size)
    }
    // Delete at any time (the closed day's approved leave)
    await press(page, size, await cell(page, 'bane', '2026-05-20'))
    await page.waitForSelector('[data-testid="bid-clear"]')
    await press(page, size, '[data-testid="bid-clear"]'); await page.waitForTimeout(400)
    if (await count(page, '[data-testid="bid-clear"]')) { // armed: "Delete — sure?" — a second press
      out.sure = await txt(page, '[data-testid="bid-clear"]')
      await press(page, size, '[data-testid="bid-clear"]'); await page.waitForTimeout(400)
    }
    await closeSheet(page, size)
    const gone = await cellText(page, 'bane', '2026-05-20')
    await shot(page, 'closed-day-after-delete')
    rec('S6 admin deletes the approved leave on a closed day', size, gone === '' ? 'PASS' : 'FAIL', `the 20 May cell reads "${gone}" afterwards${out.sure ? ` (button said "${out.sure}")` : ''}`)

    // the day's list: approved leave beside an OIL award — Back to bid, Refuse, Move, Delete, Note
    await press(page, size, await cell(page, 'bane', '2026-01-20'))
    await page.waitForSelector('[data-testid="bid-oil"]')
    await press(page, size, '[data-testid="bid-oil"]')
    await page.getByRole('button', { name: /Give FO/ }).first().waitFor()
    await press(page, size, page.getByRole('button', { name: /Give FO/ }).first()); await page.waitForTimeout(400)
    await closeSheet(page, size)
    await press(page, size, await cell(page, 'bane', '2026-01-20'))
    await page.waitForSelector('[data-testid="daylist"]')
    const dl = {
      back: await count(page, '[data-testid^="dl-unapprove-"]'), refuse: await count(page, '[data-testid^="dl-refuse-"]'),
      move: await count(page, '[data-testid^="dl-move-"]'), del: await count(page, '[data-testid^="dl-remove-"]'), note: await count(page, '[data-testid^="dl-note-"]'),
    }
    await shot(page, 'days-list-approved-leave-and-award')
    const okdl = dl.back && dl.refuse && dl.move && dl.del && dl.note
    rec('S6 the day\'s list: approved leave beside an OIL award', size, okdl ? 'PASS' : 'FAIL',
      `Back to bid ${dl.back}, Refuse ${dl.refuse}, Move ${dl.move}, Delete ${dl.del}, Note ${dl.note} (counts of such buttons)`)
    // remarks reachable from Note
    await press(page, size, page.locator('[data-testid^="dl-note-"]').first()); await page.waitForTimeout(500)
    const rf = await count(page, '[data-testid="remarks-field"]')
    await shot(page, 'days-list-note-opens-remarks')
    rec('S6 its remarks are reachable from the day\'s list "Note"', size, rf ? 'PASS' : 'FAIL', `remarks field ${rf ? 'shown' : 'NOT shown'}`)
  } finally { await ctx.close() }
}


// ============================================================================================================
// S28 — Inputs-page leave on a closed day (D1166): filed, edited, deleted — never refused or held by the closed dates
// ============================================================================================================
async function inputsToDec(page, size) {
  await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(1200)
  for (let i = 0; i < 4 && !/DEC(EMBER)? 2026/i.test(await page.locator('#inpCal .ic-mon').innerText()); i++) await press(page, size, '#icNext')
  await page.waitForTimeout(400)
}
async function fileLeave(page, size, firstIso, lastIso, person) {
  if (isPhone(size)) {
    await page.locator('[data-icday="' + firstIso + '"]').tap({ position: { x: 8, y: 8 } }); await page.waitForTimeout(500)
    await page.locator('#icPopAdd').tap()
  } else {
    const low = async iso => { const b = await page.locator('[data-icday="' + iso + '"]').boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height - 12 } }
    const a = await low(firstIso), b = await low(lastIso)
    await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move(b.x, b.y, { steps: 6 }); await page.mouse.up()
  }
  await page.waitForSelector('#inpEditPop'); await page.waitForTimeout(400)
  if (person) { await page.selectOption('#inpEditPerson', { label: person }); await page.waitForTimeout(200) }
  await page.selectOption('#inpEditType', 'LL'); await page.waitForTimeout(200)
  const read = (await page.locator('#inpEditPop .rc-read').innerText().catch(() => '')).trim()
  await press(page, size, '#inpEditSave'); await page.waitForTimeout(700)
  return read
}
const days = ['2026-12-07', '2026-12-08', '2026-12-09', '2026-12-10']
const readDays = async page => {
  const o = []
  for (const d of days) { const t = await cellText(page, 'bane', d); const c = await cellCls(page, 'bane', d); o.push(d.slice(8) + ':' + (t || '-') + (/appr/.test(c) ? '(approved)' : t ? '(pending)' : '')) }
  return o.join(' ')
}
async function s28(size) {
  TAG = size + '-s28'
  let { ctx, page } = await newCtx(size)
  try {
    await signIn(page, 'us', 'us')
    await inputsToDec(page, size)
    const lastDay = isPhone(size) ? '2026-12-07' : '2026-12-09'
    const read = await fileLeave(page, size, '2026-12-07', lastDay)
    await shot(page, 'member-filed-on-the-inputs-month')
    const bar = await page.locator('.ib-bar').filter({ hasText: /Ranger/ }).count()
    rec('S28 member files LL on closed days on the Inputs page (Dec 26, nothing open)', size, bar === 1 ? 'PASS' : 'FAIL', 'window read "' + read + '"; saved, bars "Ranger · LL" on the month: ' + bar)
    await gotoLW(page)
    await cell(page, 'bane', '2026-12-07')
    const afterFile = await readDays(page); await shot(page, 'member-war-after-filing')
    const want = isPhone(size) ? /07:LL\(approved\)/ : /07:LL\(approved\) 08:LL\(approved\) 09:LL\(approved\)/
    rec('S28 the war shows it, approved, on the closed days', size, want.test(afterFile) ? 'PASS' : 'FAIL', 'war cells: ' + afterFile + ' · classes of the 7th: ' + (await cellCls(page, 'bane', '2026-12-07')))
    await press(page, size, await cell(page, 'bane', '2026-12-07')); await page.waitForTimeout(500)
    const sheets = { remarks: await count(page, '[data-testid="remarks-sheet"]'), closed: await count(page, '[data-testid="closed-note"]'), bid: await count(page, '[data-testid="bid-picker"]') }
    const sheetText = await txt(page, '[data-testid="remarks-sheet"],[data-testid="closed-note"],[data-testid="bid-picker"]')
    await shot(page, 'member-taps-his-inputs-filed-leave-on-the-war')
    rec('S28 the member taps that leave on the war (build brief: his own approved leave opens its remarks at any time)', size, sheets.remarks && !sheets.closed && !sheets.bid ? 'PASS' : 'FAIL', 'remarks sheet ' + sheets.remarks + ', closed note ' + sheets.closed + ', bid window ' + sheets.bid + '; text: ' + sheetText.slice(0, 160))
    await closeSheet(page, size)
    await inputsToDec(page, size)
    await press(page, size, page.locator('.ib-bar').filter({ hasText: /Ranger/ }).first()); await page.waitForSelector('#inpEditPop'); await page.waitForTimeout(400)
    if (isPhone(size)) { await press(page, size, '[data-testid="inpEdCal-day-2026-12-08"]') }
    else { await press(page, size, '[data-testid="inpEdCal-day-2026-12-08"]'); await press(page, size, '[data-testid="inpEdCal-day-2026-12-10"]') }
    const read2 = (await page.locator('#inpEditPop .rc-read').innerText().catch(() => '')).trim()
    await shot(page, 'member-edits-dates-in-the-window')
    await press(page, size, '#inpEditSave'); await page.waitForTimeout(700)
    await gotoLW(page); await cell(page, 'bane', '2026-12-08')
    const afterEdit = await readDays(page); await shot(page, 'member-war-after-edit')
    const want2 = isPhone(size) ? /07:- 08:LL\(approved\)/ : /07:- 08:LL\(approved\) 09:LL\(approved\) 10:LL\(approved\)/
    rec('S28 the member edits the dates; the war follows, still approved', size, want2.test(afterEdit) ? 'PASS' : 'FAIL', 'window read "' + read2 + '"; war cells: ' + afterEdit)
    await inputsToDec(page, size)
    await press(page, size, page.locator('.ib-bar').filter({ hasText: /Ranger/ }).first()); await page.waitForSelector('#inpEditPop'); await page.waitForTimeout(400)
    await press(page, size, '#inpEditDel'); await page.waitForTimeout(700)
    await gotoLW(page); await cell(page, 'bane', '2026-12-08')
    const afterDel = await readDays(page); await shot(page, 'member-war-after-delete')
    rec('S28 the member deletes it; the war follows', size, /^07:- 08:- 09:- 10:-$/.test(afterDel) ? 'PASS' : 'FAIL', 'war cells: ' + afterDel)
  } finally { await ctx.close() }
  ;({ ctx, page } = await newCtx(size))
  try {
    await signIn(page, 'ad', 'a')
    await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(1200)
    if (isPhone(size)) { await press(page, size, '#inFiltersBtn'); await page.waitForTimeout(400) }
    const opt = await page.locator('#inFPerson option').evaluateAll(o => o.map(x => x.value + '=' + x.textContent))
    const rv = opt.find(x => /=Ranger/.test(x)); if (rv) await page.selectOption('#inFPerson', rv.split('=')[0])
    await inputsToDec(page, size)
    const lastDay = isPhone(size) ? '2026-12-07' : '2026-12-09'
    const read = await fileLeave(page, size, '2026-12-07', lastDay, 'Ranger')
    const who = await page.locator('.ib-bar').first().innerText().catch(() => '')
    await shot(page, 'admin-filed-on-the-inputs-month')
    await gotoLW(page); await cell(page, 'bane', '2026-12-07')
    const af = await readDays(page); await shot(page, 'admin-war-after-filing')
    const want = isPhone(size) ? /07:LL\(approved\)/ : /07:LL\(approved\) 08:LL\(approved\) 09:LL\(approved\)/
    rec('S28 admin files LL for Ranger on the Inputs page (closed days); the war shows it approved', size, /Ranger/.test(who) && want.test(af) ? 'PASS' : (/Ranger/.test(who) ? 'FAIL' : 'NOT WALKED'), 'bar reads "' + who + '"; window read "' + read + '"; war cells: ' + af)
  } finally { await ctx.close() }
}


// ============================================================================================================
// shared by S31 / S32 / UR: open and close April by the window's own buttons
// ============================================================================================================
async function openWindow(page, size) {
  await press(page, size, '[data-testid="open-chip"]')
  await page.waitForSelector('[data-testid="open-dates"]'); await page.waitForTimeout(300)
}
async function tapMonth(page, size, key) {
  await press(page, size, `[data-testid="od-month-${key}"]`); await page.waitForTimeout(350)
}
async function closeWindow(page, size) {
  await press(page, size, '[data-testid="open-dates-close"]'); await page.waitForTimeout(300)
}
const chipText = page => page.locator('[data-testid="open-chip"]').first().innerText().then(t => t.replace(/\s+/g, ' ').trim())
async function logout(page, size) {
  if (isPhone(size)) { await press(page, size, '#burger'); await press(page, size, '#drawerLogout') } else await press(page, size, '#logout')
  await page.waitForSelector('#loginForm'); await page.waitForTimeout(400)
}
async function bellText(page, size) {
  await press(page, size, '#notifyBell'); await page.waitForTimeout(500)
  const t = await txt(page, '[data-testid="bell-list"],[data-testid="bell-empty"]')
  return t
}
async function bellClose(page) { await page.keyboard.press('Escape'); await page.waitForTimeout(250) }
async function changesText(page, size) {
  const b = page.locator('#histBtn')
  if (!(await b.count()) || !(await b.isVisible())) return null
  await press(page, size, b); await page.waitForTimeout(600)
  const t = await txt(page, '.chgwin:not([hidden])')
  return t
}

// ============================================================================================================
// S31 — the bell and the changes window stay silent for opening and closing dates (D1214's line is M4)
// ============================================================================================================
async function s31(size) {
  TAG = size + '-s31'
  const { ctx, page } = await newCtx(size, URLR)   // real storage in a clean context, so the member can sign in after the admin
  try {
    await signIn(page, 'us', 'us')
    const mBefore = await bellText(page, size); await shot(page, 'member-bell-before'); await bellClose(page)
    await logout(page, size)
    await signIn(page, 'ad', 'a')
    const aBell0 = await bellText(page, size); await bellClose(page)
    await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(900)
    const aChg0 = await changesText(page, size); await shot(page, 'admin-changes-window-before')
    await page.evaluate(() => window.go('leavewar')); await page.waitForSelector('[data-testid="row-bane"]'); await page.waitForTimeout(1000)
    const c0 = await chipText(page)
    await openWindow(page, size); await tapMonth(page, size, '2026-04'); const c1 = await chipText(page)
    await tapMonth(page, size, '2026-04'); const c2 = await chipText(page)
    await tapMonth(page, size, '2026-04'); await shot(page, 'admin-window-april-open'); await closeWindow(page, size)
    await press(page, size, '#undoBtn'); await page.waitForTimeout(300); const c3 = await chipText(page)
    await press(page, size, '#redoBtn'); await page.waitForTimeout(300); const c4 = await chipText(page)
    const moved = c0 !== c1 && c1 !== c2 && c3 !== c4
    await shot(page, 'admin-after-open-close-undo-redo')
    const aBell1 = await bellText(page, size); await shot(page, 'admin-bell-after'); await bellClose(page)
    await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(900)
    const aChg1 = await changesText(page, size); await shot(page, 'admin-changes-window-after')
    rec('S31 the admin\'s bell after opening / closing / Undo / Redo of April', size, moved && aBell0 === aBell1 ? 'PASS' : 'FAIL',
      `chip: "${c0}" → "${c1}" → "${c2}" → undo "${c3}" → redo "${c4}" (it moved: ${moved}); bell before "${aBell0}" / after "${aBell1}"`)
    rec('S31 the changes window (Edit Schedule clock) after the same', size, aChg0 === null ? 'NOT WALKED' : (aChg0 === aChg1 ? 'PASS' : 'FAIL'),
      aChg0 === null ? 'the changes clock is not on this screen at this size' : `before "${aChg0.slice(0, 160)}" / after "${aChg1.slice(0, 160)}"`)
    await logout(page, size)
    await signIn(page, 'us', 'us')
    const mAfter = await bellText(page, size); await shot(page, 'member-bell-after'); await bellClose(page)
    rec('S31 the member\'s bell after the admin opened / closed dates', size, mBefore === mAfter ? 'PASS' : 'FAIL', `before "${mBefore}" / after "${mAfter}"`)
  } finally { await ctx.close() }
}

// ============================================================================================================
// S32 — the SANS calendar and the Calendar window read the same before, with April open, and after closing it
// ============================================================================================================
async function s32(size) {
  TAG = size + '-s32'
  const { ctx, page } = await newCtx(size)
  try {
    await signIn(page, 'ad', 'a')
    const snap = async label => {
      await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(900)
      await press(page, size, '#inSansMode'); await page.waitForTimeout(600)
      for (let i = 0; i < 8 && !/APR(IL)? 2026/i.test(await page.locator('[data-testid="sc-month"]').innerText()); i++) await press(page, size, '[data-testid="sc-prev"]')
      const month = (await page.locator('[data-testid="sc-month"]').innerText()).trim()
      const sans = await page.locator('[data-testid="sanscal"]').innerText()
      await shot(page, label + '-sans-april')
      await press(page, size, '[data-testid="sc-gear"]'); await page.waitForTimeout(500)
      await press(page, size, page.getByRole('button', { name: /Calendar/ }).first()); await page.waitForSelector('[data-testid="win-days"]'); await page.waitForTimeout(500)
      for (let i = 0; i < 8 && !/APR(IL)? 2026/i.test(await page.locator('[data-testid="win-days"]').innerText()); i++) {
        await press(page, size, page.locator('[data-testid="win-days"] button', { hasText: '‹' }).first())
      }
      const win = await page.locator('[data-testid="win-days"]').innerText()
      await shot(page, label + '-calendar-window-april')
      await press(page, size, '[data-testid="win-days-x"]').catch(async () => { await page.evaluate(() => document.querySelector('[data-testid="win-days-x"]').click()) })
      await page.evaluate(() => { const x = document.querySelector('[data-testid="win-sansset-x"]'); if (x) x.click() }); await page.waitForTimeout(300)
      return { month, sans, win }
    }
    const before = await snap('before')
    await page.evaluate(() => window.go('leavewar')); await page.waitForSelector('[data-testid="row-bane"]'); await page.waitForTimeout(900)
    await openWindow(page, size); await tapMonth(page, size, '2026-04'); const open = await chipText(page); await closeWindow(page, size)
    const during = await snap('april-open')
    await page.evaluate(() => window.go('leavewar')); await page.waitForSelector('[data-testid="row-bane"]'); await page.waitForTimeout(900)
    await openWindow(page, size); await tapMonth(page, size, '2026-04'); const closed = await chipText(page); await closeWindow(page, size)
    const after = await snap('april-closed')
    const same = (a, b) => a.sans === b.sans && a.win === b.win && a.month === b.month
    rec('S32 SANS calendar (April 26) and Calendar window before / with April open / after closing it', size,
      open !== closed && same(before, during) && same(before, after) ? 'PASS' : 'FAIL',
      `chip with April open "${open}", after closing "${closed}"; SANS text identical before/open/after: ${same(before, during)}/${same(before, after)} (${before.sans.length} chars); Calendar window text identical: ${before.win === during.win}/${before.win === after.win} (${before.win.length} chars)`)
  } finally { await ctx.close() }
}


// ============================================================================================================
// S33 — OIL on a closed day: an award from the day's +OIL, and one from the OIL tracker, both land (D79, D402)
// ============================================================================================================
async function s33(size) {
  TAG = size + '-s33'
  const { ctx, page } = await newCtx(size)
  try {
    await signIn(page, 'ad', 'a'); await gotoLW(page)
    const chip = await chipText(page)
    // (a) the day's +OIL on 5 May 26 (nothing is open then)
    await press(page, size, await cell(page, 'bane', '2026-05-05')); await page.waitForSelector('[data-testid="bid-oil"]')
    await press(page, size, '[data-testid="bid-oil"]')
    const give = page.getByRole('button', { name: /Give FO/ }).first(); await give.waitFor()
    await press(page, size, give); await page.waitForTimeout(500)
    const said = await txt(page, '[data-testid="bid-picker"]')
    await closeSheet(page, size)
    const t = await cellText(page, 'bane', '2026-05-05')
    await shot(page, 'award-from-the-day-on-a-closed-day')
    rec('S33 an OIL award from the day\'s +OIL on a closed day (5 May 26)', size, /FO/.test(t) ? 'PASS' : 'FAIL', `chip "${chip}"; the 5 May cell reads "${t}"; sheet after giving: ${said.slice(0, 120)}`)
    // (b) from the OIL tracker (its date defaults to today, 22 Oct 26 — closed too)
    await page.evaluate(() => window.scrollTo(0, 0))
    await press(page, size, 'button[data-testid="oil-tracker"]'); await page.waitForSelector('[data-testid="oil-name-bane"]'); await page.waitForTimeout(400)
    await press(page, size, '[data-testid="oil-name-bane"]'); await page.waitForSelector('[data-testid="oil-credit-save"]')
    const dateTxt = await txt(page, '[data-testid="oil-date"]')
    await page.fill('[data-testid="oil-reason"]', 'walker C closed-day check')
    await press(page, size, '[data-testid="oil-credit-save"]'); await page.waitForTimeout(700)
    const err = await txt(page, '[data-testid="oil-credit-err"]')
    await shot(page, 'award-from-the-tracker')
    const entries = await page.locator('[data-testid^="oil-entry-"]').count()
    const inRow = await page.locator('[data-testid="oil-row-bane"]').innerText().catch(() => '')
    await press(page, size, '[data-testid="oil-close"]'); await page.waitForTimeout(400)
    await cell(page, 'bane', '2026-10-22')
    const t2 = await cellText(page, 'bane', '2026-10-22')
    await shot(page, 'war-after-tracker-award')
    rec('S33 an OIL award from the OIL tracker on a closed day (' + dateTxt.replace(/[^\w ]/g, '').trim() + ')', size, /FO/.test(t2) && !err ? 'PASS' : 'FAIL', `tracker error "${err}"; Ranger's row after: "${inRow.replace(/\s+/g, ' ').slice(0, 100)}"; the 22 Oct cell reads "${t2}"`)
    // (c) Delete by the admin names the award (D260)
    await press(page, size, await cell(page, 'bane', '2026-05-05')); await page.waitForTimeout(500)
    const open = await txt(page, '[data-testid="daylist"],[data-testid="award-sheet"],[data-testid="bid-picker"],[data-testid="sheet"]')
    await shot(page, 'admin-taps-the-award-on-a-closed-day')
    rec('S33 the admin taps that award on the closed day (RECORD what opens)', size, 'RECORD', open.slice(0, 220))
    // Delete by the admin on the closed day takes the award, and says what it takes (D260)
    await press(page, size, '[data-testid="bid-clear"]'); await page.waitForTimeout(400)
    const first = await txt(page, '[data-testid="bid-clear"],[data-testid="bid-picker"]')
    const armed = /sure/i.test(await txt(page, '[data-testid="bid-clear"]'))
    await shot(page, 'delete-first-press-on-the-award')
    if (armed) { await press(page, size, '[data-testid="bid-clear"]'); await page.waitForTimeout(500) }
    await closeSheet(page, size)
    const after = await cellText(page, 'bane', '2026-05-05')
    rec('S33 Delete by the admin on that closed day takes the award (D260: it names the award first)', size, after === '' ? 'PASS' : 'FAIL', `first press: ${armed ? 'the button turns to "Delete — sure?"' : 'it deletes at once'}; sheet text: ${first.slice(0, 160)}; the 5 May cell afterwards: "${after}"`)
  } finally { await ctx.close() }
}

// ============================================================================================================
// S34(a) — signed in without access; and the viewer-less war (bridge) — RECORD
// ============================================================================================================
async function s34a(size) {
  TAG = size + '-s34a'
  let { ctx, page } = await newCtx(size)
  try {
    await signIn0(page, 'zz', 'zz')
    const body = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ')
    const nav = await page.locator('#topnav a[data-page="leavewar"]').count()
    await shot(page, 'signed-in-without-access')
    rec('S34a someone signed in with no access to the squadron (a name on no list)', size, 'RECORD', `sees: "${body.slice(0, 110)}…"; Leave War tab in the bar: ${nav}. The Leave War cannot be reached by this person at all.`)
  } finally { await ctx.close() }
  ;({ ctx, page } = await newCtx(size))
  try {
    await signIn(page, 'us', 'us')
    await page.evaluate(() => window.lwSetMemberToday('2026-02-15'))
    await page.evaluate(() => window.lwSetViewer(''))   // the bridge's door to a war with nobody viewing (the war's "no row" viewer)
    await gotoLW(page, 'stiff')
    const chip = await chipText(page).catch(() => '<no chip>')
    await shot(page, 'viewer-less-grid-bridge')
    const taps = []
    for (const [who, iso] of [['bane', '2026-02-16'], ['stiff', '2026-02-16'], ['stiff', '2026-04-14']]) {
      await press(page, size, await cell(page, who, iso)); await page.waitForTimeout(450)
      const s = {
        picker: await count(page, '[data-testid="bid-picker"]'), closed: await count(page, '[data-testid="closed-note"]'), remarks: await count(page, '[data-testid="remarks-sheet"]'),
        any: await count(page, '[data-testid="sheet-scrim"]'),
      }
      taps.push(`${who} ${iso}: bid window ${s.picker}, closed note ${s.closed}, remarks ${s.remarks}, any sheet scrim ${s.any}`)
      if (who === 'bane' && iso === '2026-02-16') await shot(page, 'viewer-less-tap-on-an-open-day')
      await closeSheet(page, size); await page.keyboard.press('Escape'); await page.waitForTimeout(200)
    }
    rec('S34a the war with no viewer (a member whose account matches no row — set through the test bridge, clock 15 Feb 26)', size, 'RECORD', `chip "${chip}"; taps: ${taps.join(' | ')}`)
  } finally { await ctx.close() }
}
async function signIn0(page, u, p) {
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]'); await page.waitForTimeout(1200)
}

// ============================================================================================================
// YE — the year end: an approved leave cannot be moved from 30 Dec 26 into 2027 (refused, it stays); a pending bid can
// ============================================================================================================
async function ye(size) {
  TAG = size + '-ye'
  const { ctx, page } = await newCtx(size)
  try {
    await signIn(page, 'ad', 'a'); await gotoLW(page)
    await placeBid(page, size, 'bane', '2026-12-30')                      // Ranger's pending bid
    await placeBid(page, size, 'stiff', '2026-12-30'); await approve(page, size, 'stiff', '2026-12-30')   // Saber's approved leave
    await shot(page, 'both-on-30-dec')
    // (1) can a landing day of 2027 be reached at all from the grid?
    await page.evaluate(() => { const h = document.querySelector('[data-testid="hscroll"]') || document.querySelector('.mx-wrap'); h.scrollLeft = h.scrollWidth }); await page.waitForTimeout(600)
    const lastHead = await page.evaluate(() => { const a = [...document.querySelectorAll('[data-testid^="head-"]')].map(e => e.getAttribute('data-testid')); return a[a.length - 1] })
    const has27 = await count(page, '[data-testid^="head-2027"]')
    await shot(page, 'the-grid-ends-31-dec')
    await press(page, size, await cell(page, 'bane', '2026-12-30')); await page.waitForSelector('[data-testid="decide-shift"]')
    await press(page, size, '[data-testid="decide-shift"]'); await page.waitForTimeout(500)
    const bannerOn = await count(page, '[data-testid="move-banner"]')
    await shot(page, 'move-banner-up')
    await page.locator('[data-testid="war-picker"]').scrollIntoViewIfNeeded().catch(() => {})
    await page.locator('[data-testid="war-picker"]').selectOption('y2027'); await page.waitForTimeout(1200)
    const bannerAfterSwitch = await count(page, '[data-testid="move-banner"]')
    await shot(page, 'after-switching-view-to-2027')
    rec('YE a 2027 day as a landing for a move from 30 Dec 26', size, 'RECORD',
      `the 2026 grid's last date is ${lastHead} (2027 heads: ${has27}); Move banner up: ${bannerOn}; after switching View to JAN – DEC 27 the banner is ${bannerAfterSwitch ? 'still up' : 'gone (the move is cancelled)'} — no control lands a record in 2027 from 30 Dec, so neither the refusal of an approved leave nor a pending bid's crossing can be pressed on screen`)
    await page.locator('[data-testid="war-picker"]').selectOption('y2026'); await page.waitForTimeout(1200)
    // (2) what is reachable: the pending bid and the approved leave each move 30 → 31 Dec (inside the year)
    const moveTo = async (who, from, to) => {
      await press(page, size, await cell(page, who, from)); await page.waitForSelector('[data-testid="decide-shift"]')
      await press(page, size, '[data-testid="decide-shift"]'); await page.waitForTimeout(400)
      await press(page, size, await cell(page, who, to)); await page.waitForTimeout(500)
      if (await count(page, '[data-testid="move-confirm"]')) { await press(page, size, '[data-testid="move-confirm"]'); await page.waitForTimeout(500) }
      return { from: await cellText(page, who, from), to: await cellText(page, who, to), cls: await cellCls(page, who, to) }
    }
    const rb = await moveTo('bane', '2026-12-30', '2026-12-31'); await shot(page, 'pending-bid-moved-30-to-31-dec')
    const rs = await moveTo('stiff', '2026-12-30', '2026-12-31'); await shot(page, 'approved-leave-moved-30-to-31-dec')
    rec('YE inside the year: a pending bid and an approved leave each move 30 → 31 Dec', size, rb.from === '' && /LL/.test(rb.to) && rs.from === '' && /LL/.test(rs.to) ? 'PASS' : 'FAIL',
      `pending: 30 Dec "${rb.from}", 31 Dec "${rb.to}" (${rb.cls.includes('appr') ? 'approved' : 'pending'}); approved leave: 30 Dec "${rs.from}", 31 Dec "${rs.to}" (${rs.cls.includes('appr') ? 'approved' : 'pending'}${/mov/.test(rs.cls) ? ', moved mark' : ''})`)
    // (3) Pick a range from 28 Dec: does the picker offer January 2027?
    await press(page, size, await cell(page, 'bane', '2026-12-28')); await page.waitForSelector('[data-testid="span-range"]')
    await press(page, size, '[data-testid="span-range"]'); await page.waitForTimeout(500)
    await press(page, size, '[data-testid="span-next"]'); await page.waitForTimeout(400)
    const title = await txt(page, '[data-testid="span-title"]')
    const off = await page.evaluate(() => { const a = [...document.querySelectorAll('[data-testid^="span-day-2027"]')]; return a.length + ' days of 2027 drawn, ' + a.filter(e => e.disabled || e.getAttribute('aria-disabled') === 'true').length + ' of them disabled' })
    await shot(page, 'pick-a-range-next-month-is-2027')
    rec('YE "Pick a range" from 28 Dec 26: does it offer 2027 days (RECORD)', size, 'RECORD', `the picker turns to "${title}": ${off}, so a range cannot cross 31 Dec 26 on screen`)
  } finally { await ctx.close() }
}

// ============================================================================================================
// LEG — the Legend's moved line always shows
// ============================================================================================================
async function leg(size) {
  TAG = size + '-leg'
  for (const [role, u, p] of [['admin', 'ad', 'a'], ['member', 'us', 'us']]) {
    const { ctx, page } = await newCtx(size)
    try {
      await signIn(page, u, p); await gotoLW(page, role === 'admin' ? 'stiff' : 'bane')
      await press(page, size, '[data-testid="legend-open"]'); await page.waitForSelector('[data-testid="legend"]'); await page.waitForTimeout(300)
      const t = await txt(page, '[data-testid="legend"]')
      await shot(page, role + '-legend')
      rec(`LEG the Legend as ${role}, no leave moved yet: the moved line and no stage words`, size, /Moved here from another day/.test(t) && !/\bstage\b|\bdraft\b|bidding closed|published stage/i.test(t) ? 'PASS' : 'FAIL', `Legend reads: ${t.slice(0, 300)}`)
    } finally { await ctx.close() }
  }
}

// ============================================================================================================
// UR — Undo / Redo of opening a month while June is on screen: the grid does not jump (D672)
// ============================================================================================================
async function ur(size) {
  TAG = size + '-ur'
  const { ctx, page } = await newCtx(size)
  try {
    await signIn(page, 'ad', 'a'); await gotoLW(page, 'stiff')
    await press(page, size, page.locator('[data-testid="month-strip"] button', { hasText: /^JUN$/ }).first()); await page.waitForTimeout(3000)
    const sl = () => page.evaluate(() => Math.round((document.querySelector('[data-testid="hscroll"]') || document.querySelector('.mx-wrap')).scrollLeft))
    const firstVisible = () => page.evaluate(() => {
      const f = document.querySelector('[data-testid="frozen-cols"]'); const left = f ? f.getBoundingClientRect().right : 0
      const hs = [...document.querySelectorAll('[data-testid^="head-"]')].filter(e => e.getBoundingClientRect().left >= left - 1)
      return hs.length ? hs[0].getAttribute('data-testid').slice(5) : '?'
    })
    const s0 = await sl(), f0 = await firstVisible(); await shot(page, 'june-on-screen')
    await openWindow(page, size); await tapMonth(page, size, '2026-04'); await closeWindow(page, size)
    const c1 = await chipText(page), s1 = await sl(), f1 = await firstVisible(); await shot(page, 'after-opening-april')
    await press(page, size, '#undoBtn'); await page.waitForTimeout(500)
    const c2 = await chipText(page), s2 = await sl(), f2 = await firstVisible(); await shot(page, 'after-undo')
    await press(page, size, '#redoBtn'); await page.waitForTimeout(500)
    const c3 = await chipText(page), s3 = await sl(), f3 = await firstVisible(); await shot(page, 'after-redo')
    const still = [s1, s2, s3].every(x => Math.abs(x - s0) <= 2) && [f1, f2, f3].every(x => x === f0)
    const changed = c1 !== c2 && c2 !== c3
    rec('UR Undo / Redo of opening April while June is on screen (D672: the grid stays)', size, still && changed ? 'PASS' : 'FAIL',
      `first date in view / scroll: before ${f0} / ${s0}; after open ${f1} / ${s1}; after Undo ${f2} / ${s2}; after Redo ${f3} / ${s3}; chip: "${c1}" → "${c2}" → "${c3}"`)
  } finally { await ctx.close() }
}

// ============================================================================================================
const RUN = { s6, s28, s31, s32, s33, s34a, ye, leg, ur }
for (const size of SIZES) {
  for (const [id, fn] of Object.entries(RUN)) {
    if (!scen(id)) continue
    try { await fn(size) } catch (e) {
      console.log(`!! ${id} ${size} threw: ${String(e.message).slice(0, 1200)}`)
      rec(`${id} (script)`, size, 'NOT WALKED', `the script stopped: ${String(e.message).split('\n')[0].slice(0, 200)}`)
    }
  }
}
await browser.close()
console.log('\n==== TABLE ====')
for (const r of rows) console.log(`${r.verdict}\t${r.id}\t${r.size}\t${r.said}\t${r.pics.join(' ')}`)
console.log('\n==== console / page errors ====')
console.log(consoleErrs.length ? consoleErrs.join('\n') : 'none')
console.log('pictures in folder:', readdirSync(OUT).length)
