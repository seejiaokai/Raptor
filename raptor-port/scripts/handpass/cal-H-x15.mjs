/* X-15 — a roster / posting change reaches SANS, personal records and published pending together (D617, D178, D103).
   node cal-H-x15.mjs post | archive | unsans.   Fixture (through the app's own forms): Zenith (a SANS man, vinci) gets a SANS
   commitment 13-15 Oct 26, a one-day Meeting with Ranger on 13 Oct (shared), a solo Appointment 13-14 Oct; Tue 13 Oct 26 is
   published with them on it. The change is then made through its own control and every surface read again. */
import * as H from './cal-H-lib.mjs'
const MODE = process.argv[2] || 'post'
H.setTag('x15' + MODE)
const { browser, page, errors } = await H.world({})
await H.toastSpy(page)
const ZEN = await H.pidOf(page, 'Zenith'), RANGER = await H.pidOf(page, 'Ranger')
const tid = id => page.locator(`[data-testid="${id}"]`)
const WEEK = '05/10/2026', DI = 4   // Fri 9 Oct (today is Thu 8 Oct 26)

/* ---- the fixture ---- */
async function walkCal(cal, iso) {
  const MONS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
  for (let i = 0; i < 20 && !(await page.locator(`${cal} [data-cal="${iso}"]`).count()); i++) {
    const [m, y] = (await page.locator(`${cal} .rc-mon`).first().textContent()).trim().toLowerCase().split(/\s+/)
    const at = `${y}-${String(MONS.indexOf(m.slice(0, 3)) + 1).padStart(2, '0')}`
    await page.locator(`${cal} button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`).first().click(); await H.sleep(100)
  }
  await page.locator(`${cal} [data-cal="${iso}"]`).first().click(); await H.sleep(150)
}
// (a) SANS commitment for Zenith, 13-15 Oct
await H.go(page, 'inputs'); await H.sleep(400)
await page.locator('#inSansMode').click(); await H.sleep(600)
await tid('sc-day-2026-10-06').click({ position: { x: 8, y: 8 } }); await H.sleep(500)
await tid('sd-add').click(); await H.sleep(700)
await page.selectOption('#inpEditPerson', ZEN).catch(() => {})
await page.locator('#inpEdCal [data-cal="2026-10-12"]').click(); await H.sleep(200)
console.log('sans dates read', await page.locator('[data-testid="win-inputedit"] .rc-read').first().innerText().catch(() => '?'))
await H.pic(page, '0a-sans-form')
await page.click('#inpEditSave'); await H.sleep(800); await H.answerOilIfAsked(page, 'Yes')
const dxs = tid('win-sansday-x'); if (await dxs.count()) await dxs.click().catch(() => {})
// (b) Meeting for Zenith + Ranger on 13 Oct
await page.locator('#inMemberMode').click(); await H.sleep(500)
const dx = tid('win-sansday-x'); if (await dx.count()) await dx.click().catch(() => {})
await H.inputsMonth(page, 2026, 10)
await H.pic(page, 'dbg-before-meeting')
console.log('wins', await page.evaluate(() => [...document.querySelectorAll('[data-testid^="win-"]')].map(e => e.getAttribute('data-testid')))); 
await H.fileShared(page, { iso: '2026-10-09', type: 'Meeting', people: ['Zenith', 'Ranger'], exclude: ['Saber'], remarks: 'X15 meeting' })
// (c) solo Appointment for Zenith 13-14 Oct
await H.inputsMonth(page, 2026, 10)
await H.openNewInput(page, '2026-10-07')
await page.selectOption('#inpEditType', 'Appointment')
await page.selectOption('#inpEditPerson', ZEN).catch(() => {})
await page.locator('#inpEdCal [data-cal="2026-10-10"]').click(); await H.sleep(200)
await page.fill('#inpEditRmk', 'X15 solo')
await page.click('#inpEditSave'); await H.sleep(800); await H.answerOilIfAsked(page, 'Yes')
const mine = async () => (await H.inputsNow(page)).filter(x => x.person === ZEN && /X15|SANS/.test(x.remarks + x.type)).map(x => `${x.type} ${x.date}${x.endDate ? '→' + x.endDate : ''} ${x.remarks}`)
const fx = await mine()
console.log('fixture', JSON.stringify(fx))
// publish Tue 13 Oct (the week loaded)
await page.evaluate(w => window.loadWeek(w), WEEK); await H.sleep(800)
await H.toEdit(page); await page.evaluate(w => window.loadWeek(w), WEEK); await H.sleep(900); await H.showDay(page, DI)
await H.signDay(page, DI); const pub = await H.publishDay(page, DI)
console.log('published', JSON.stringify(pub), JSON.stringify(await H.head(page, DI)))

/* ---- the readers ---- */
async function read(tag) {
  const o = { tag }
  // the SANS month
  await H.go(page, 'inputs'); await H.sleep(300)
  await page.locator('#inSansMode').click(); await H.sleep(600)
  o.sans = {}
  for (const d of ['06', '07', '08', '09', '10', '12']) o.sans[d] = await tid('sc-day-2026-10-' + d).innerText().then(t => t.replace(/\s+/g, ' ')).catch(() => '?')
  await tid('sc-day-2026-10-09').click({ position: { x: 8, y: 8 } }); await H.sleep(500)
  o.sansDayList = await tid('sd-list').innerText().then(t => t.replace(/\s+/g, ' ').slice(0, 300)).catch(() => '')
  o.sdSans = await tid('sd-sans-p').innerText().catch(() => '')
  o.picSans = await H.pic(page, `${tag}-sans-9oct`)
  const x = tid('win-sansday-x'); if (await x.count()) await x.click().catch(() => {})
  // the Inputs month (Zenith's bars)
  await page.locator('#inMemberMode').click(); await H.sleep(500)
  await H.inputsMonth(page, 2026, 10)
  o.bars = await page.evaluate(() => [...document.querySelectorAll('#inpCal .ib-bar')].map(b => b.innerText.replace(/\s+/g, ' ')).filter(t => /Zenith|Meeting|Ranger/.test(t)))
  o.inputs = await mine()
  o.meet = (await H.inputsNow(page)).filter(x => /X15 meeting/.test(x.remarks)).map(x => `${x.person}:${x.date}`)
  o.picInputs = await H.pic(page, `${tag}-inputs-month`)
  // the published day
  await H.toEdit(page); await page.evaluate(w => window.loadWeek(w), WEEK); await H.sleep(700); await H.showDay(page, DI)
  o.head = await H.head(page, DI)
  await H.changesWin(page, DI)
  o.chg = await H.changesRead(page)
  o.picChg = await H.pic(page, `${tag}-changes-tue13`)
  await H.changesClose(page)
  // the issued face on View-only Sched
  await H.go(page, 'viewsched'); await page.evaluate(w => window.loadWeek(w), WEEK); await H.sleep(700)
  o.face = await page.evaluate(() => { const d = document.querySelector('#vWeek .day[data-day="4"]'); const t = d ? d.innerText.replace(/\s+/g, ' ') : ''; return { zen: (t.match(/Zenith/g) || []).length, meet: (t.match(/MEETING|Meeting/g) || []).length, appt: (t.match(/APPOINTMENT|Appointment/g) || []).length, tag: (d && (d.querySelector('.verchip') || {}).innerText) || '' } })
  // the Leave War: available P on 13 Oct
  await H.go(page, 'leavewar'); await page.waitForSelector('[data-testid="row-slipway"]'); await H.sleep(600)
  o.lw = await page.evaluate(() => { try { const f = window.lwDayFacts('2026-10-09'); return JSON.stringify(f).slice(0, 200) } catch (e) { return 'n/a' } })
  return o
}
const before = await read('1-before')
console.log('BEFORE', JSON.stringify({ ...before, chg: before.chg && before.chg.tabs }))

/* ---- the change ---- */
if (MODE === 'post') {
  await H.go(page, 'leavewar'); await page.waitForSelector('[data-testid="row-slipway"]'); await H.sleep(600)
  // Show SANS on, so Zenith's row is on the war
  await tid('settings-open').click(); await H.sleep(400)
  const showSans = page.locator('button[title*="SANS aircrew"]').first()
  if (await showSans.count()) { const t = await showSans.getAttribute('title'); if (/Put SANS/.test(t)) await showSans.click(); await H.sleep(500) }
  await tid('settings-close').click().catch(() => {}); await H.sleep(300)
  const cellZ = tid('cell-vinci-2026-10-08')
  await cellZ.scrollIntoViewIfNeeded().catch(() => {}); await cellZ.click().catch(e => console.log('cell click fail')); await H.sleep(700)
  await tid('bid-postout').click().catch(() => console.log('no PO chip')); await H.sleep(500)
  await H.pic(page, '2a-post-sheet')
  await tid('po-date').fill('2026-10-08').catch(() => {}); await H.sleep(200)
  console.log('po line', await tid('po-line').innerText().catch(() => ''))
  await tid('po-confirm').click().catch(() => console.log('no confirm')); await H.sleep(900)
  console.log('post err', await tid('post-err').innerText().catch(() => ''))
  await H.pic(page, '2b-after-post')
} else if (MODE === 'archive') {
  await H.go(page, 'admin'); await H.sleep(500)
  const usersTab = page.locator('[data-admcat="users"]:visible, .adm-cat:has-text("Users"):visible').first(); if (await usersTab.count()) { await usersTab.click(); await H.sleep(400) }
  const row = page.locator(`#accList [data-person="${ZEN}"] .acc-tap`).first(); await row.scrollIntoViewIfNeeded(); await row.click(); await H.sleep(400)
  await page.locator('#accEdArchive').click(); await H.sleep(900)
  await H.pic(page, '2-archived')
} else if (MODE === 'unsans') {
  await H.go(page, 'quals'); await H.sleep(600)
  if (await page.locator('#qViewA').count()) { await page.click('#qViewA'); await H.sleep(300) }
  const rowQ = page.locator(`#qtbl td.qname[data-person="${ZEN}"]`).first()
  console.log('quals row', await rowQ.count())
  const cells = await page.evaluate(id => { const tr = document.querySelector(`#qtbl td.qname[data-person="${id}"]`).closest('tr'); return [...tr.querySelectorAll('td')].map((td, i) => i + ':' + (td.className || '') + ':' + (td.innerText || '').trim().slice(0, 6) + ':' + (td.getAttribute('data-k') || td.getAttribute('data-col') || '')).slice(0, 14) }, ZEN)
  console.log('cells', JSON.stringify(cells))
  const hdr = await page.evaluate(() => [...document.querySelectorAll('#qtbl thead th')].map((th, i) => i + ':' + th.innerText.trim().slice(0, 8)).slice(0, 14))
  console.log('hdr', JSON.stringify(hdr))
  await H.pic(page, '2a-quals-before')
  if (await page.locator('#qEdit:visible').count()) { await page.click('#qEdit'); await H.sleep(500) }
  const sansCell = page.locator(`#qtbl td.qname[data-person="${ZEN}"]`).locator('xpath=../td[5]')
  await sansCell.scrollIntoViewIfNeeded(); await sansCell.click(); await H.sleep(700)
  if (await page.locator('#qSave:visible').count()) { await page.click('#qSave'); await H.sleep(500) }
  console.log('sans cell now', JSON.stringify(await sansCell.innerText()), 'PEOPLE.san', await page.evaluate(id => window.PEOPLE[id].san, ZEN))
  await H.pic(page, '2b-quals-after')
}
const after = await read('3-after-' + MODE)
console.log('AFTER', JSON.stringify({ ...after, chg: after.chg && after.chg.lines }))
H.row(`X-15 ${MODE}`, `Zenith (SANS) had a SANS commitment 6-12 Oct, a shared Meeting with Ranger on 9 Oct and a solo Appointment 7-10 Oct; Fri 9 Oct published; then ${MODE}`, JSON.stringify({ fx, before: { sans: before.sans, inputs: before.inputs, meet: before.meet, head: before.head && before.head.pending, face: before.face, lw: before.lw }, after: { sans: after.sans, inputs: after.inputs, meet: after.meet, head: after.head && after.head.pending, face: after.face, lw: after.lw, chg: after.chg && after.chg.lines.slice(0, 20) } }), 'RECORDED', [before.picSans, before.picInputs, after.picSans, after.picInputs, after.picChg])
console.log('ERRORS', errors)
H.save('x15-' + MODE, { errors })
await browser.close()
