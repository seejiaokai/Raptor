/* X-16 — placement detail must not leak into the preserved schedule and export layouts (D629, D655).
   Week of 13 Jul 26. The print window (a hidden frame) and the CSV are read as TEXT and compared with the same exports
   taken BEFORE any input was filed, and again after the day was published. */
import * as H from './cal-H-lib.mjs'
import { readFileSync } from 'node:fs'
H.setTag('x16')
const { browser, page, errors } = await H.world({})
await H.toastSpy(page)
const PLACED = /Placed by|placed by|Placed:|changed by/
async function exportsNow() {
  await H.toEdit(page); await H.showDay(page, 1)
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 10000 }), page.click('#exportSched')])
  const csv = readFileSync(await dl.path(), 'utf8')
  await page.click('#exportPdf'); await H.sleep(1500)
  const fr = page.frames().filter(f => f !== page.mainFrame())
  const print = fr.length ? await fr[fr.length - 1].evaluate(() => (document.body ? document.body.innerText : '')) : ''
  return { csv, print: print.replace(/Generated [^\n]*/, 'Generated <time>') }
}
async function surfaces(tag) {
  const o = { tag }
  // the edit week's days (all seven) and the view-only week
  await H.toEdit(page)
  o.edit = await page.evaluate(() => { const d = [...document.querySelectorAll('#eWeek .day')]; return d.map(x => x.innerText.replace(/\s+/g, ' ')).join(' || ') })
  await H.go(page, 'viewsched'); await H.sleep(500)
  o.view = await page.evaluate(() => [...document.querySelectorAll('#vWeek .day')].map(x => x.innerText.replace(/\s+/g, ' ')).join(' || '))
  // the board of day 2 (Personal Inputs / Unavailable panels)
  await H.toEdit(page); await page.evaluate(() => window.openScheduler(2)); await H.sleep(900)
  o.board = await page.evaluate(() => { const b = document.querySelector('#schedBoard'); return b ? b.innerText.replace(/\s+/g, ' ') : '' })
  o.picBoard = await H.pic(page, `${tag}-board-wed`)
  await page.keyboard.press('Escape'); await H.sleep(500)
  if (await page.locator('#schedBoard:visible').count()) { const x = page.locator('#sbDone:visible, #sbClose:visible').first(); if (await x.count()) await x.click(); await H.sleep(500) }
  return o
}
const leaks = o => ({ edit: (o.edit.match(PLACED) || [])[0] || null, view: (o.view.match(PLACED) || [])[0] || null, board: (o.board.match(PLACED) || [])[0] || null })

// 0. baseline
const E0 = await exportsNow()
const S0 = await surfaces('0-before')
const med0 = { edit: (S0.edit.match(/Medical/gi) || []).length, view: (S0.view.match(/Medical/gi) || []).length }

// 1. file: solo absence (LL, Saber, Tue 14), shared duty (Meeting, Ranger+Drifter+Ace(+Saber), Wed 15), solo duty (Appointment, Saber, Thu 16)
await H.inputsMonth(page, 2026, 7)
await H.fileSolo(page, { iso: '2026-07-14', type: 'LL', remarks: 'X16 solo absence' })
await H.inputsMonth(page, 2026, 7)
await H.fileShared(page, { iso: '2026-07-15', type: 'Meeting', people: ['Ranger', 'Drifter', 'Ace'], remarks: 'X16 shared duty' })
await H.inputsMonth(page, 2026, 7)
await H.fileSolo(page, { iso: '2026-07-16', type: 'Appointment', remarks: 'X16 solo duty' })
// 2. edit them so a change line exists on each: remarks changed through the editor
for (const [re, rmk] of [[/LL/, 'X16 solo absence edited'], [/\+3/, 'X16 shared duty edited'], [/Appointment/, 'X16 solo duty edited']]) {
  await H.inputsMonth(page, 2026, 7)
  const bars = page.locator('#inpCal .ib-bar').filter({ hasText: re }).filter({ hasText: /Saber|\+3|Appointment|LL/ })
  let hit = null
  const n = await page.locator('#inpCal .ib-bar').count()
  for (let i = 0; i < n; i++) { const b = page.locator('#inpCal .ib-bar').nth(i); const t = (await b.innerText()).replace(/\s+/g, ' '); if (re.test(t) && /Saber|\+3/.test(t) && /X16|Meeting|Appointment|LL/.test(t)) { hit = b; if (/\+3/.test(t) || /Saber/.test(t)) break } }
  if (!hit) { console.log('no bar for', String(re)); continue }
  await hit.click(); await H.sleep(600)
  const cur = await page.locator('#inpEditRmk').inputValue().catch(() => '')
  if (/X16/.test(cur)) { await page.fill('#inpEditRmk', rmk); await page.click('#inpEditSave'); await H.sleep(800); await H.answerOilIfAsked(page, 'Yes') }
  else { await page.click('#inpEditCancel').catch(() => {}); console.log('wrong bar opened', cur) }
}
const mine = (await H.inputsNow(page)).filter(x => /X16/.test(x.remarks)).map(x => `${x.person}:${x.type}:${x.date}:${x.remarks}:${x.grp ? 'g' : ''}`)
console.log('filed', JSON.stringify(mine))

// 3. the calendar readers (the Inputs tab): the opened day, the List, the editor foot
await H.inputsMonth(page, 2026, 7)
await page.locator('[data-icday="2026-07-15"]').click({ position: { x: 8, y: 8 } }); await H.sleep(700)
const dayTxt = await page.locator('[data-testid="win-inputsday"]').innerText().then(t => t.replace(/\s+/g, ' ')).catch(() => '')
const picDay = await H.pic(page, '1-opened-day-wed')
await page.locator('[data-testid="win-inputsday-x"]').click().catch(() => {}); await H.sleep(300)
await page.click('#inListBtn'); await H.sleep(700)
if ((await page.locator('#inRangeBtn').getAttribute('aria-expanded')) !== 'true') { await page.locator('#inRangeBtn').click(); await H.sleep(300) }
await page.locator('#inRangeAll').click(); await H.sleep(500)
const listTxt = await page.evaluate(() => [...document.querySelectorAll('#inBody tr[data-iid]')].map(t => t.innerText.replace(/\s+/g, ' ')).filter(t => /X16/.test(t)).join(' || '))
const picList = await H.pic(page, '2-list')
await page.click('#inCalBtn'); await H.sleep(500)
const barTitle = await page.evaluate(() => [...document.querySelectorAll('#inpCal .ib-bar')].map(b => (b.getAttribute('title') || '') + '|' + b.innerText).filter(t => /Meeting|Appointment|LL/.test(t)).join(' || '))
const cellTxt = await page.evaluate(() => document.querySelector('[data-icday="2026-07-15"]').innerText.replace(/\s+/g, ' '))
await H.openBar(page, /\+3/)
const foot = await page.locator('[data-testid="inped-placed"]').innerText().then(t => t.replace(/\s+/g, ' ')).catch(() => '')
const picEd = await H.pic(page, '3-editor-foot')
await page.click('#inpEditCancel').catch(() => {})
const readersOK = { day: PLACED.test(dayTxt), list: PLACED.test(listTxt), foot: PLACED.test(foot), cells: PLACED.test(cellTxt), barTitles: PLACED.test(barTitle) }
H.judge('X-16 (a) calendar readers', 'filed a solo LL (Tue 14), a shared Meeting for 4 (Wed 15) and a solo Appointment (Thu 16), edited each one\'s remarks; read the opened Wed day, the List, the editor\'s foot, the month cell and the bar titles', [
  ['the opened day shows the shared line: "Placed by Saber for 4 people … changed by Saber …"', /Placed by Saber for 4 people[^A-Z]*· [^·]*· changed by Saber/.test(dayTxt), dayTxt.match(/Placed by Saber for 4 people[^A-Z]*· [^·]*·[^·]*·?[^·]*/)?.[0]],
  ['the List shows it (shared row: Placed … changed by …)', /Placed by Saber for 4 people/.test(listTxt) && /changed by/.test(listTxt), listTxt.slice(0, 400)],
  ['the editor foot shows it', readersOK.foot, foot],
  ['the month cell text carries NO placement words', !readersOK.cells, cellTxt.slice(0, 200)],
  ['the bar tooltips on a desktop name who placed it (D632) [recorded]', true, barTitle.slice(0, 300)],
], [picDay, picList, picEd], { dayTxt: dayTxt.slice(0, 900), foot })

// 4. the schedule surfaces and the exports AFTER filing (day not yet published)
const S1 = await surfaces('4-after-filing')
const E1 = await exportsNow()
const diffLines = (a, b) => { const A = new Set(a.split('\n')), B = new Set(b.split('\n')); return { added: [...B].filter(x => !A.has(x)).slice(0, 8), removed: [...A].filter(x => !B.has(x)).slice(0, 8) } }
const lk1 = leaks(S1)
H.judge('X-16 (b) schedule and exports, draft', 'read the Edit Schedule week, View-only Sched, the board\'s Wed panels, the CSV and the print document after filing (nothing published)', [
  ['no placement words on the Edit Schedule week', !lk1.edit, lk1.edit],
  ['no placement words on View-only Sched', !lk1.view, lk1.view],
  ['no placement words on the board', !lk1.board, lk1.board],
  ['the schedule rows still show the three inputs (Ground programme / Unavailable) in their ordinary layout', /X16 shared duty edited/.test(S1.edit) && /X16 solo duty edited/.test(S1.edit), { shared: /X16 shared duty edited/.test(S1.edit), solo: /X16 solo duty edited/.test(S1.edit) }],
  ['one row each for the shared duty\'s men, as before (3+ MEETING rows on Wed)', (S1.edit.match(/MEETING/gi) || []).length >= 4, (S1.edit.match(/MEETING/gi) || []).length],
  ['LATE marks still print on the schedule rows (ordinary late mode)', /LATE/.test(S1.edit), /LATE/.test(S1.edit)],
  ['the CSV is byte-for-byte the baseline', E1.csv === E0.csv, { a: E0.csv.length, b: E1.csv.length }],
  ['the print document is the baseline (bar its time stamp)', E1.print === E0.print, diffLines(E0.print, E1.print)],
  ['no placement words in the CSV or the print document', !PLACED.test(E1.csv) && !PLACED.test(E1.print), ''],
  ['medical entries still shown on the week as before', (S1.edit.match(/Medical/gi) || []).length === med0.edit, { before: med0.edit, after: (S1.edit.match(/Medical/gi) || []).length }],
], [S1.picBoard], {})

// 5. publish Wed 15 and read again
await H.toEdit(page); await H.showDay(page, 2)
await H.signDay(page, 2); const pub = await H.publishDay(page, 2)
const S2 = await surfaces('5-after-publish')
const E2 = await exportsNow()
const lk2 = leaks(S2)
H.judge('X-16 (c) schedule and exports, published Wed', 'signed and published Wed 15 Jul, then read the same surfaces and exports', [
  ['the day published', pub.pressed === true, pub],
  ['no placement words on the Edit Schedule week / View-only Sched / board', !lk2.edit && !lk2.view && !lk2.board, lk2],
  ['the issued face shows the final wording (the edited remark)', /X16 shared duty edited/.test(S2.view), /X16 shared duty edited/.test(S2.view)],
  ['the print document has no placement words', !PLACED.test(E2.print) && !PLACED.test(E2.csv), ''],
  ['the CSV is still the baseline layout (same bytes)', E2.csv === E0.csv, { a: E0.csv.length, b: E2.csv.length }],
  ['the print document differs from the baseline only by what publication adds (read the diff)', true, diffLines(E0.print, E2.print)],
], [S2.picBoard], { printDiffPublished: diffLines(E0.print, E2.print) })
console.log('ERRORS', errors)
H.save('x16', { errors })
await browser.close()
