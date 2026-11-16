/* www W1 scenario 1 — the published OIL Saturday, Ranger, T/O 12:00, no landing. usage: [PHONE=1] node scripts/handpass/www/www-w1-s1.mjs */
const PHONE = process.env.PHONE === '1'
process.env.WWW_RUN ||= 's1-' + (PHONE ? 'p' : 'd')
const H = await import('./www-w1-lib3.mjs')
const { X, say, sleep, L, nrm } = H
const size = PHONE ? '402' : '1536'
const P = PHONE ? 'p' : 'd'
const SAT = X.SAT, ISO = '2026-07-18'
const w = await X.open({ phone: PHONE })
const { page } = w
const R = (did, exp, saw, v, pic) => X.row('1 published OIL Saturday', size, did, exp, saw, v, pic)
const hoursOf = lines => { const i = lines.findIndex(l => /^WORK HOURS/.test(l)); const j = lines.indexOf('Ranger', i); return j > 0 ? lines[j + 1] : 'NOT LISTED' }
async function ins(tag) {
  await L.go(page, 'editsched'); await sleep(400)
  const lines = await H.insights(w, tag)
  let h = hoursOf(lines)
  const hd = lines.find(l => /^Week insights/.test(l))
  // close
  await page.keyboard.press('Escape'); await sleep(500)
  if (await page.locator('text=/^Week insights/').first().isVisible().catch(() => false)) { await page.locator('button:has-text("✕")').first().click().catch(() => {}); await sleep(400) }
  return { h, hd }
}
// --- 1. fixture
await X.board(w, SAT)
await X.flight(w, SAT, '12:00', '', 'bane', { msn: 'OIL FLT' })
let bw = await X.boardWarn(w)
R('built Ranger T/O 12:00, landing blank, on Saturday; read the board warnings', 'no "unusable time / no end time" wording caused by the blank landing', JSON.stringify(bw), bw.some(l => /unusable|no end time|no landing/i.test(l)) ? 'FAIL' : 'PASS', '')
await X.pic(w, `1-1-board-${P}`)
try {
  await X.press(w, '#sbOil', { after: `1-2-oil-after-tap-${P}` }); await sleep(700)
  const oil = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .puck[data-person]')].filter(e => !e.closest('#sbRoster') && e.getBoundingClientRect().width > 0).map(e => ({ cls: (e.className.match(/oilbar-\w+/) || ['none'])[0], txt: e.innerText.replace(/\s+/g, ' ').trim() })))
  await X.pic(w, `1-2-oil-${P}`)
  R('pressed OIL Earn; read the pucks', 'Ranger shown earning HO at 60 min', JSON.stringify(oil), oil.some(o => /Ranger/.test(o.txt) && /HO/.test(o.txt)) ? 'PASS' : 'FAIL', `1-2-oil-${P}.png`)
  await X.press(w, '#sbOil'); await sleep(500)
} catch (e) { R('pressed OIL Earn', 'Ranger HO', 'could not act: ' + e.message.slice(0, 100), 'NOT WALKED', '') }
// --- 2. sign + publish
const hb = await H.head(w, SAT)
const pr = await H.signAndPublish(w, SAT)
await sleep(800)
const ha = await H.head(w, SAT)
await X.pic(w, `1-3-published-${P}`)
R('signed four and published Saturday', 'day reads ORIG, published', `before ${JSON.stringify(hb.tag)}; pressed ${JSON.stringify(pr)}; after ${JSON.stringify(ha)}`, ha && /ORIG/.test(ha.tag) ? 'PASS' : 'FAIL', `1-3-published-${P}.png`)
await X.closeBoard(w)
const h0 = await ins('1-ins0')
R('Insights before the Logic change: Ranger\'s week hours', 'RECORD', JSON.stringify(h0), 'RECORDED', `1-ins0-insights-${P}.png`)
// --- 3. before: LW cell, sheet, tracker
const r1 = await H.lwReadAll(w, 'bane', ISO, '1-4before')
R('Leave War cell, its day sheet and OIL tracker at A flight 60', 'cell HO*; sheet "half a day … worked 09:00–15:00"; tracker one +0.5 entry, balance 0.5', JSON.stringify(r1), r1.cell && /^HO\*/.test(r1.cell.text) && /09:00–15:00/.test(r1.sheet.days) && r1.entries.length === 1 && r1.bal === '0.5' ? 'PASS' : 'FAIL', `1-4before-oiltracker-${P}.png`)
// --- 4. A flight -> 90
await H.logicOpen(w, true)
const v90 = await H.setSetting(w, 'fltLen', '90'); await H.logicDone(w)
await X.pic(w, `1-5-logic90-${P}`)
await X.board(w, SAT)
const h1 = await H.head(w, SAT)
await X.pic(w, `1-6-pending-board-${P}`)
R('A flight set to 90; Saturday\'s head on the board', 'reads "1 pending"; sign-offs down: the amber Not yet signed chip appears (it was absent after the first publish)', `box ${v90}; before-change head ${JSON.stringify(ha)}; after ${JSON.stringify(h1)}`, h1 && /1 pending/.test(h1.pending) && h1.notYet && ha && !ha.notYet ? 'PASS' : 'FAIL', `1-6-pending-board-${P}.png`)
const pl = await H.pendingList(w, SAT, '1-7')
R('opened the pending list', 'RECORD whole: "Logic · A flight with no landing typed" and Ranger\'s line "half day … → full day …"', JSON.stringify(pl), 'RECORDED', `1-7-pendinglist-${P}.png`)
R('pending list: the two named lines', 'contains "Logic · A flight with no landing typed" and a Ranger line saying half day → full day', JSON.stringify(pl.filter(l => /Logic|Ranger|OIL changes/.test(l))), pl.some(l => /Logic · A flight with no landing typed/.test(l)) && pl.some(l => /Ranger.*OIL as published/.test(l)) && pl.some(l => /half day.*→.*full day/.test(l)) ? 'PASS' : 'FAIL', `1-7-pendinglist-${P}.png`)
// close the pending list: Escape
await page.keyboard.press('Escape'); await sleep(500)
const still = await page.evaluate(() => /Waiting to go out as/.test(document.body.innerText) && !![...document.querySelectorAll('*')].find(e => e.children.length === 0 && /Waiting to go out as/.test(e.textContent) && e.getBoundingClientRect().width > 0))
await X.pic(w, `1-8-pending-closed-esc-${P}`)
R('pressed Escape with the pending list open', 'RECORD whether it closes', `list still shown: ${still}`, 'RECORDED', `1-8-pending-closed-esc-${P}.png`)
await X.closeBoard(w)
// --- 5. during pending: credit unchanged everywhere
const r2 = await H.lwReadAll(w, 'bane', ISO, '1-9pending')
R('Leave War cell, day sheet and tracker while pending', 'credit still HO*, worked 09:00–15:00, balance 0.5, one entry (credit stays until the day is published again)', JSON.stringify(r2), r2.cell && /^HO\*/.test(r2.cell.text) && /09:00–15:00/.test(r2.sheet.days) && r2.entries.length === 1 && r2.bal === '0.5' ? 'PASS' : 'FAIL', `1-9pending-oiltracker-${P}.png`)
const h2 = await ins('1-ins1')
R('Insights hours while pending (A flight 90)', 'Ranger\'s hours move by 30 min from the 60 reading', `${JSON.stringify(h0)} -> ${JSON.stringify(h2)}`, h0.h !== h2.h && h2.h !== 'NOT LISTED' ? 'PASS' : 'FAIL', `1-ins1-insights-${P}.png`)
// --- 6. put back
await H.logicOpen(w, true)
const v60 = await H.setSetting(w, 'fltLen', '60'); await H.logicDone(w)
await X.board(w, SAT)
const h3 = await H.head(w, SAT)
await X.pic(w, `1-10-putback-board-${P}`)
R('A flight put back to 60; Saturday\'s head', 'pending clears (no "pending")', `box ${v60}; ${JSON.stringify(h3)}`, h3 && !/pending/.test(h3.pending) ? 'PASS' : 'FAIL', `1-10-putback-board-${P}.png`)
R('after the put-back: sign-off state', 'RECORD', JSON.stringify({ signState: h3 && h3.signState, signs: h3 && h3.signs }), 'RECORDED', `1-10-putback-board-${P}.png`)
await X.closeBoard(w)
const r3 = await H.lwReadAll(w, 'bane', ISO, '1-11putback')
R('Leave War after the put-back', 'HO*, balance 0.5', JSON.stringify(r3), r3.cell && /^HO\*/.test(r3.cell.text) && r3.bal === '0.5' ? 'PASS' : 'FAIL', `1-11putback-oiltracker-${P}.png`)
// --- 7. 90 again and publish the amendment
await H.logicOpen(w, true)
await H.setSetting(w, 'fltLen', '90'); await H.logicDone(w)
await X.board(w, SAT)
const h4 = await H.head(w, SAT)
const pr2 = await H.signAndPublish(w, SAT); await sleep(900)
const h5 = await H.head(w, SAT)
await X.pic(w, `1-12-amendment-${P}`)
R('A flight 90 again; signed four and published the amendment', 'AL1 out', `before ${JSON.stringify(h4)}; ${JSON.stringify(pr2)}; after ${JSON.stringify(h5)}`, pr2.pressed && h5 && /AL1/.test(h5.tag) ? 'PASS' : 'FAIL', `1-12-amendment-${P}.png`)
await X.closeBoard(w)
const r4 = await H.lwReadAll(w, 'bane', ISO, '1-13after')
R('Leave War after the amendment', 'cell FO*, worked 09:00–15:30, ONE entry, balance 1 (no duplicate credit)', JSON.stringify(r4), r4.cell && /^FO\*/.test(r4.cell.text) && /09:00–15:30/.test(r4.sheet.days) && r4.entries.length === 1 && r4.bal === '1' ? 'PASS' : 'FAIL', `1-13after-oiltracker-${P}.png`)
await X.fin(w)
