// The host's re-walk of the code reads' fixes for M1 (22 Oct 26): R-M1 the first tap after a month drag (desktop mouse,
// phone finger); M2 a member's war-approved half day on an open day offers its free half; L6 the admin's Note; R-H1 a
// member's Inputs-page half day over his own pending bid on a closed day; the fill's skip words; the Undo words.
// Served from dist-m1w on http://localhost:4255/ (lwm1-walk-host). Assertions where a fix sets the answer; RECORD else.
import { chromium } from 'playwright'
import path from 'node:path'
import { newPhone, signIn, finger, tapSel, centre, holdDrag, T, cellId, vis, txt, openWindow, topSheet, states, OUT, launchOptions, rec, results } from './lw-m1-walk-h-lib.mjs'

const BASE = 'http://localhost:4255/'
const pic = (page, name) => page.screenshot({ path: path.join(OUT, name + '.png') })
const errsAll = []
async function newDesk() {
  const b = await chromium.launch(launchOptions)
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const errs = []
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)) })
  page.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 200)))
  return { b, page, errs }
}
async function deskSignIn(page, who, { today } = {}) {
  await page.goto(BASE); await page.waitForSelector('#luser')
  const [u, p] = who === 'admin' ? ['ad', 'a'] : ['us', 'us']
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day')
  if (today !== undefined) await page.evaluate(t => window.lwSetMemberToday(t), today)
  await page.evaluate(() => window.go('leavewar')); await page.waitForSelector(T(`row-${who === 'admin' ? 'stiff' : 'bane'}`))
  await page.waitForTimeout(600)
}
const click = async (page, sel) => { const l = page.locator(sel).first(); await l.evaluate(e => e.scrollIntoView({ block: 'nearest', inline: 'center' })).catch(() => {}); await l.click(); await page.waitForTimeout(300) }
async function deskClose(page) {
  for (const t of ['bid-cancel', 'daylist-close', 'sel-cancel', 'closed-note-close', 'remarks-cancel', 'award-close', 'move-cancel', 'open-dates-close'])
    if (await vis(page, T(t))) await click(page, T(t))
}
const mstate = async (page, key) => page.locator(T(`od-month-${key}`)).getAttribute('data-state')

/* ---------- R-M1, desktop: drag MAY → JUL by mouse released on JUL, then ONE click on OCT ---------- */
{
  const { b, page, errs } = await newDesk()
  await deskSignIn(page, 'admin')
  await click(page, T('open-chip')); await page.waitForSelector(T('open-dates'))
  const box = async k => page.locator(T(`od-month-${k}`)).boundingBox()
  const a = await box('2026-05'), z = await box('2026-07')
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down()
  await page.mouse.move(z.x + z.width / 2, z.y + z.height / 2, { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(400)
  const afterDrag = [await mstate(page, '2026-05'), await mstate(page, '2026-06'), await mstate(page, '2026-07')]
  await page.locator(T('od-month-2026-10')).click(); await page.waitForTimeout(400)
  const oct = await mstate(page, '2026-10')
  await pic(page, 'R1-01-desk-drag-may-jul-then-one-click-oct')
  rec('R-M1 desk', afterDrag.every(s => s === 'open') && oct === 'open' ? 'PASS' : 'FAIL', `after the drag MAY–JUL: ${afterDrag.join(', ')}; one click on OCT → ${oct}`, ['R1-01-desk-drag-may-jul-then-one-click-oct.png'])
  errsAll.push(...errs.map(e => 'R-M1 desk ' + e)); await b.close()
}

/* ---------- R-M1, phone: a held finger MAY → JUL, then ONE tap on OCT ---------- */
{
  const { ctx, page, cdp, errs } = await newPhone()
  await signIn(page, 'admin')
  await openWindow(cdp, page)
  const a = await centre(page, T('od-month-2026-05')), z = await centre(page, T('od-month-2026-07'))
  const pts = [a]; for (let i = 1; i <= 6; i++) pts.push({ x: a.x + (z.x - a.x) * i / 6, y: a.y + (z.y - a.y) * i / 6 })
  await holdDrag(cdp, page, pts, 320)
  const afterDrag = [await mstate(page, '2026-05'), await mstate(page, '2026-06'), await mstate(page, '2026-07')]
  await tapSel(cdp, page, T('od-month-2026-10')); await page.waitForTimeout(400)
  const oct = await mstate(page, '2026-10')
  await pic(page, 'R1-02-phone-hold-drag-may-jul-then-one-tap-oct')
  rec('R-M1 phone', afterDrag.every(s => s === 'open') && oct === 'open' ? 'PASS' : 'FAIL', `after the finger drag MAY–JUL: ${afterDrag.join(', ')}; one tap on OCT → ${oct}`, ['R1-02-phone-hold-drag-may-jul-then-one-tap-oct.png'])
  errsAll.push(...errs.map(e => 'R-M1 phone ' + e)); await ctx.close()
}

/* ---------- the rest, desktop, real storage: admin then member (clock 15 Feb 26) ---------- */
{
  const { b, page, errs } = await newDesk()
  await deskSignIn(page, 'admin')
  await click(page, T('month-FEB'))
  // the admin places a MORNING LL for Ranger on 25 Feb and approves it
  await click(page, T(cellId('bane', '2026-02-25')))
  await click(page, T('portion-am')); await click(page, T('bid-LL')); if (await vis(page, T('bid-LL'))) await click(page, T('bid-LL'))
  await deskClose(page)
  await click(page, T(cellId('bane', '2026-02-25'))); await click(page, T('decide-approve')); await deskClose(page)
  const c25 = await txt(page, T(cellId('bane', '2026-02-25')))

  // M2 — the member's tap on his approved MORNING on an open day: the free afternoon's bid window
  await deskSignIn(page, 'member', { today: '2026-02-15' })
  await click(page, T('month-FEB'))
  await click(page, T(cellId('bane', '2026-02-25')))
  const m2open = await topSheet(page)
  await pic(page, 'R2-01-member-clock-2026-02-15-approved-morning-25-feb-open-day')
  await deskClose(page)
  // his own whole-day pending bid on 20 Feb, for R-H1
  await click(page, T(cellId('bane', '2026-02-20'))); await click(page, T('bid-LL')); if (await vis(page, T('bid-LL'))) await click(page, T('bid-LL'))
  await deskClose(page)
  const c20 = await txt(page, T(cellId('bane', '2026-02-20')))

  // the admin closes FEBRUARY; the Undo label names it
  await deskSignIn(page, 'admin')
  await click(page, T('open-chip')); await page.waitForSelector(T('open-dates'))
  await click(page, T('od-month-2026-02'))
  const feb = await mstate(page, '2026-02')
  await click(page, T('open-dates-close'))
  const undoTitle = await page.locator('#undoBtn').getAttribute('title').catch(() => null)
  const undoAria = await page.locator('#undoBtn').getAttribute('aria-label').catch(() => null)
  // L6 — the admin's tap on the approved morning: the decide window, with Note → its remarks
  await click(page, T('month-FEB'))
  await click(page, T(cellId('bane', '2026-02-25')))
  const hasNote = await vis(page, T('decide-note'))
  await pic(page, 'R3-01-admin-decide-window-approved-morning-25-feb-with-note')
  let notes = false
  if (hasNote) { await click(page, T('decide-note')); notes = await vis(page, T('remarks-sheet')); await pic(page, 'R3-02-admin-note-opens-its-remarks') }
  await deskClose(page)

  // M2 (closed): the member's tap on his approved morning, the day now closed → its remarks
  await deskSignIn(page, 'member', { today: '2026-02-15' })
  await click(page, T('month-FEB'))
  await click(page, T(cellId('bane', '2026-02-25')))
  const m2closed = await topSheet(page)
  await pic(page, 'R2-02-member-approved-morning-25-feb-closed-day')
  await deskClose(page)

  // R-H1 — the member files a MORNING of OL on 20 Feb on the Inputs page, over his own whole-day pending LL, Feb closed
  const toasts = []
  page.on('console', () => {})
  await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(1200)
  for (let i = 0; i < 14 && !/FEB(RUARY)? 2026/i.test(await page.locator('#inpCal .ic-mon').innerText()); i++) { await page.click('#icPrev'); await page.waitForTimeout(150) }
  const dayBox = await page.locator('[data-icday="2026-02-20"]').boundingBox()
  await page.mouse.click(dayBox.x + dayBox.width / 2, dayBox.y + dayBox.height - 12); await page.waitForTimeout(500)
  if (!(await vis(page, '#inpEditPop'))) { if (await vis(page, '#icPopAdd')) await page.click('#icPopAdd') }
  await page.waitForSelector('#inpEditPop'); await page.waitForTimeout(300)
  await page.selectOption('#inpEditType', 'OL'); await page.waitForTimeout(200)
  if (await page.locator('#inpEditPop [data-span="am"]').count()) await page.click('#inpEditPop [data-span="am"]')
  await pic(page, 'R4-01-member-inputs-page-ol-morning-20-feb-over-his-pending-ll')
  await page.click('#inpEditSave'); await page.waitForTimeout(900)
  const toastNow = await page.evaluate(() => [...document.querySelectorAll('.toast, [role="status"], #toast')].map(e => e.innerText).join(' | '))
  const saved = await page.evaluate(() => (window.INPUTS || []).filter(r => JSON.stringify(r).includes('bane') && r.type === 'OL' && /Feb 20|2026-02-20/.test(String(r.date))).length)
  const stillOpen = await vis(page, '#inpEditPop')
  await pic(page, 'R4-02-after-save')
  await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(900)
  await click(page, T('month-FEB'))
  const c20after = await txt(page, T(cellId('bane', '2026-02-20')))
  await pic(page, 'R4-03-leave-war-20-feb-after-the-filing')

  // the fill's skip words — a range from 27 Mar (open) into April (closed)
  await click(page, T('month-MAR'))
  await click(page, T(cellId('bane', '2026-03-27')))
  await click(page, T('span-range'))
  if (await page.locator(T('span-next')).count()) await click(page, T('span-next'))
  await click(page, T('span-day-2026-04-02'))
  await click(page, T('bid-LL'))
  if (/again/.test((await txt(page, T('span-note'))) || '')) await click(page, T('bid-LL'))
  const skip = await txt(page, T('span-note'))
  await pic(page, 'R5-01-member-range-27-mar-2-apr-skip-words')
  await deskClose(page)

  rec('M2 open day', /bid-picker/.test((m2open?.id || '') + ' ' + (m2open?.tids || []).join(' ')) && !/remarks-sheet/.test(m2open?.id || '') ? 'PASS' : 'FAIL', `the admin placed and approved "${c25}" on 25 Feb; the member's tap on the open day opens ${m2open?.id}: "${(m2open?.text || '').slice(0, 140)}"`, ['R2-01-member-clock-2026-02-15-approved-morning-25-feb-open-day.png'])
  rec('M2 closed day', /remarks/.test(m2closed?.id || '') ? 'PASS' : 'RECORD', `after FEB closed, his tap opens ${m2closed?.id}: "${(m2closed?.text || '').slice(0, 140)}"`, ['R2-02-member-approved-morning-25-feb-closed-day.png'])
  rec('L6 the admin\'s Note', hasNote && notes ? 'PASS' : 'FAIL', `decide window has Note: ${hasNote}; it opens the remarks: ${notes}`, ['R3-01-admin-decide-window-approved-morning-25-feb-with-note.png', 'R3-02-admin-note-opens-its-remarks.png'])
  rec('R-H1', saved === 1 && !stillOpen && /LL/.test(c20after || '') ? 'PASS' : 'FAIL', `his pending bid on 20 Feb "${c20}"; FEB ${feb}; the OL morning saved: ${saved} row(s), the window ${stillOpen ? 'STILL OPEN' : 'closed'}; note: "${toastNow.slice(0, 160)}"; the war's 20 Feb now "${c20after}"`, ['R4-01-member-inputs-page-ol-morning-20-feb-over-his-pending-ll.png', 'R4-02-after-save.png', 'R4-03-leave-war-20-feb-after-the-filing.png'])
  rec('skip words', /closed for bidding, before today, or already holding leave or a medical/.test(skip || '') ? 'PASS' : 'FAIL', `"${skip}"`, ['R5-01-member-range-27-mar-2-apr-skip-words.png'])
  rec('Undo words (closing FEB)', 'RECORD', `#undoBtn title "${undoTitle}" / aria "${undoAria}"`, [])
  errsAll.push(...errs.map(e => 'desk ' + e)); await b.close()
}

console.log('ERRORS', JSON.stringify(errsAll))
console.log('SUMMARY', results.map(r => `${r.id}:${r.verdict}`).join(' '))
process.exit(0)
