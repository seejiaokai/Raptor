/* S40 — a weekend no Leave War period covers: the schedule's entitlement, the offer, the period made through the app's own offer */
import * as D from './ows-D-lib.mjs'
const { world, sleep, A, R, W, L, P, judge, pend } = D
const { browser, p, errors } = await world()
const log = (...a) => console.log('>>', ...a)
const SAT = 5
/* week controls: the "Jump to a date" calendar, back to December 2025 */
await L.go(p, 'editsched'); await sleep(300)
await p.locator('.wk-cal:visible').first().click(); await sleep(500)
for (let i = 0; i < 7; i++) { await p.locator('#weekCal [aria-label="Previous month"]').click(); await sleep(150) }
const monLbl = await p.locator('#weekCal .rc-mon').innerText()
await p.locator('#weekCal [data-wcal="2025-12-27"]').click(); await sleep(1500)
const where = await p.evaluate(() => ({ week: window.CURWEEK, dates: window.DATES ? window.DATES.slice(0, 7) : null }))
const picNav = await P(p, 'S40-jumped')
log('calendar showed', monLbl, '→', JSON.stringify(where))
const w = await D.flyingWave(p, SAT, { cs: 'VIPER', to: '12:00', ld: '13:00', p1: 'bane' })
await A.closeBoard(p); await A.toWeek(p); await W.showDay(p, SAT)
await A.addItBtn(p, SAT, w.wi); await A.setItLine(p, SAT, w.wi, 0, 'IN TIME 0830')
await A.toBoard(p, SAT); await D.oilMode(p, true)
const figs = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .puck[data-person="bane"]')].filter(e => e.offsetParent !== null && !e.closest('#sbRoster')).map(e => e.innerText.replace(/\s+/g, ' ').trim()))
const picMode = await P(p, 'S40-oilmode')
await D.oilMode(p, false)
const pub = await A.publishNew(p, SAT)
const toast = await D.toast(p)
const picPub = await P(p, 'S40-published-board')
const offerBtn = p.locator('#schedBoard button:visible', { hasText: /Create the 2025 period/ }).first()
const offerText = (await offerBtn.count()) ? (await offerBtn.innerText()).trim() : '(no offer button)'
const boardAdv = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-warn .wln')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean))
log('toast:', toast, '| offer:', offerText, '| lines:', JSON.stringify(boardAdv))
await L.go(p, 'leavewar'); await sleep(1200)
const cell0 = await p.evaluate(() => { const c = document.querySelector('[data-testid="cell-bane-2025-12-27"]'); return c ? (c.innerText || '').trim() : 'NO CELL' })
const picLw0 = await P(p, 'S40-leavewar-before')
judge('S40.1', 'Saturday 27 Dec 2025 (week calendar, 7 months back): Ranger on VIPER 12:00–13:00, IN TIME 0830; four sign-offs; Publish day', [
  ['the week is 22–28 Dec 2025 and its Saturday Dec 27', /Dec 27/.test(String(where.dates && where.dates[5])), where],
  ['OIL Earn on the unpublished day: figure FO (the entitlement 08:30–15:00, 390 min)', /FO/.test(figs.join(' ')), figs],
  ['published ORIG', pub.head && pub.head.tag === 'ORIG', pub.head && pub.head.tag],
  ['the app names the reason: no leave war period for 2025, create the period', /no leave war period/i.test(toast || '') && /create the period/i.test(toast || ''), toast],
  ['and offers a way out ("Create the 2025 period")', /Create the 2025 period/.test(offerText), offerText],
  ['no landed cell, no +1 claimed', cell0 === 'NO CELL', cell0],
], [picNav, picMode, picPub, picLw0])
/* ---- follow the offer from the board ---- */
await A.toBoard(p, SAT)
const offer = p.locator('#schedBoard button:visible', { hasText: /Create the 2025 period/ }).first()
const offerFound = await offer.count()
let created = null, picOffer = null
if (offerFound) {
  await offer.evaluate(e => e.scrollIntoView({ block: 'center' })); await offer.click(); await sleep(1500)
  const where2 = await p.evaluate(() => ({ page: window.CURPAGE, text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 500) }))
  picOffer = await P(p, 'S40-after-offer')
  log('after pressing the offer:', JSON.stringify(where2).slice(0, 700))
  created = where2
}
/* is a period dialog open (Create) or was the war made directly? */
const dlgOpen = await p.evaluate(() => !!document.querySelector('[data-testid="war-new-create"], [data-testid="new-war-create"]') || /NEW LEAVE WAR/i.test(document.body.innerText))
log('new-war dialog open?', dlgOpen)
const labels = await p.evaluate(() => [...document.querySelectorAll('button:not([hidden])')].filter(b => b.offsetParent !== null && /create|save|ok/i.test(b.innerText)).map(b => (b.innerText || '').trim() + '|' + (b.dataset.testid || '')))
log('create-ish buttons:', JSON.stringify(labels))
if (dlgOpen) {
  const createBtn = p.getByRole('button', { name: /^Create$/ }).first()
  if (await createBtn.count()) { await createBtn.click(); await sleep(1500) }
}
const periodAfter = await p.evaluate(() => ({ page: window.CURPAGE, label: (document.querySelector('[data-testid="period-label"]') || {}).innerText, picker: (document.querySelector('[data-testid="war-picker"]') || {}).innerText }))
log('after:', JSON.stringify(periodAfter))
await L.go(p, 'leavewar'); await sleep(1200)
const wp = p.locator('[data-testid="war-picker"]')
const wpTxt = (await wp.count()) ? (await wp.innerText()).replace(/\s+/g, ' ') : ''
log('war picker:', wpTxt)
const picAfter = await P(p, 'S40-leavewar-after-create')
/* open the new 2025 war, its DECEMBER, and read the cell and the tracker row */
const wids = await p.evaluate(() => [...document.querySelectorAll('[data-testid^="war-"]')].map(e => `${e.dataset.testid}|${(e.innerText || '').trim().slice(0, 20)}`))
log('war testids:', JSON.stringify(wids))
const pk = p.locator('[data-testid="war-picker"]').first()
log('picker html', (await pk.evaluate(e => e.outerHTML)).slice(0, 300))
await pk.selectOption('war-2025-01-01-2025-12-31'); await sleep(1500)
const mDec = p.locator('[data-testid="month-DEC"]'); if (await mDec.count()) { await mDec.first().click(); await sleep(1200) }
const cell1 = await A.lwCellOf(p, 'bane', '2025-12-27')
await p.evaluate(([i, d]) => { const c = document.querySelector(`[data-testid="cell-${i}-${d}"]`); if (c) c.scrollIntoView({ block: 'center', inline: 'center' }) }, ['bane', '2025-12-27']); await sleep(300)
const picCell1 = await P(p, 'S40-2025-cell')
const row1 = await A.oilRow(p, 'bane'); const picRow1 = await P(p, 'S40-2025-tracker'); await A.closeOil(p)
log('after creating the 2025 war: cell', JSON.stringify(cell1), '| tracker row', row1.slice(0, 250))
/* a reload: still once */
await A.reloadAs(p, 'a'); await sleep(600)
await L.go(p, 'leavewar'); await sleep(1200)
const pkb = p.locator('[data-testid="war-picker"]').first()
await pkb.selectOption('war-2025-01-01-2025-12-31'); await sleep(1500)
const mDec2 = p.locator('[data-testid="month-DEC"]'); if (await mDec2.count()) { await mDec2.first().click(); await sleep(1200) }
const cell2 = await A.lwCellOf(p, 'bane', '2025-12-27')
const row2 = await A.oilRow(p, 'bane'); const picRow2 = await P(p, 'S40-2025-tracker-reload'); await A.closeOil(p)
const n27 = (row2.match(/27 Dec/g) || []).length
log('after reload: cell', JSON.stringify(cell2), '| row', row2.slice(0, 250), '| 27 Dec entries', n27)
judge('S40.2', 'pressed the offer "Create the 2025 period" (it made the war and took me to the Leave War); opened the 2025 war, DEC; then a reload', [
  ['the offer made a "2025" period appear beside JAN-DEC 26 / 27', /2025/.test(wpTxt), wpTxt],
  ['Leave War cell for Ranger on 27 Dec 2025: FO', /FO/.test((cell1 || {}).text || ''), cell1],
  ['tracker row: worked 08:30–15:00, one credit of +1', /08:30.15:00/.test(row1) && /\+?1\b/.test(row1), row1.slice(0, 200)],
  ['after a reload: still one credit, still FO', /FO/.test((cell2 || {}).text || '') && n27 === 1, { cell: cell2, n27 }],
], [picAfter, picCell1, picRow1, picRow2])
console.log('ERRORS', JSON.stringify(D.cleanErr(errors)))
D.savePart('ows-D-s40', { errors: D.cleanErr(errors), toast, boardAdv, created, wpTxt, pics: D.pics.saved })
await browser.close()
