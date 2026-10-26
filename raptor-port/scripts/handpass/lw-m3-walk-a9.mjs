// Walker A, scenario 9: "Date" / "Duration" in both bid windows and the Inputs window; the old words ("How many", "How much", "When", "How much of the day") nowhere.
// usage: node lw-m3-walk-a9.mjs <desktop|phone>
import * as L from './lw-m3-walk-a-lib.mjs'
const size = process.argv[2] || 'desktop'
const tag = `s9-${size === 'phone' ? 'ph' : 'dk'}`
console.log('lw-m3-walk-a9 v1', size, tag)
const w = await L.newCtx(size)
const P = w.page, ID = `9 ${size}/chromium`
const OLD = /how many|how much|\bwhen\b/i
const words = sel => P.evaluate(s => { const e = document.querySelector(s); if (!e) return null; return [...e.querySelectorAll('.lab, label, [class*="lab"], h3, h4, legend')].filter(x => x.getBoundingClientRect().width > 1).map(x => x.innerText.trim()).filter(Boolean).slice(0, 20) }, sel)
const full = sel => P.evaluate(s => { const e = document.querySelector(s); return e ? e.innerText.replace(/\s+/g, ' ') : '' }, sel)
await L.signInPlain(w, 'admin')
// a) one-day window on an empty day
await L.openCellR(w, 'bane', '2026-03-04')
const a = await words('[data-testid="bid-picker"]'), aT = await full('[data-testid="bid-picker"]')
await L.shot(w, tag + '-01-oneday-empty')
L.rec(ID + ' a (one-day window, empty day)', size, /DATE/i.test(aT) && /DURATION/i.test(aT) && !OLD.test(aT) ? 'PASS' : 'FAIL', `labels ${JSON.stringify(a)}; old words present: ${OLD.test(aT)}`, [tag + '-01-oneday-empty'])
// b) the same window on a day holding his bid: place LL, reopen
await L.press(w, L.T('bid-LL')); if (await L.vis(P, L.T('bid-picker'))) await L.press(w, L.T('bid-LL'))
await P.waitForTimeout(500)
await L.openCellR(w, 'bane', '2026-03-04')
const bT = await full('[data-testid="bid-picker"], [data-testid="daylist"], [data-testid="select-sheet"]')
const bId = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-picker"],[data-testid="daylist"],[data-testid="select-sheet"]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.dataset.testid).join(','))
await L.shot(w, tag + '-02-oneday-held')
L.rec(ID + ' b (window on a day holding his leave)', size, /DURATION/i.test(bT) && !OLD.test(bT) ? 'PASS' : 'FAIL', `opened ${bId}; text "${bT.slice(0, 160)}"; old words present: ${OLD.test(bT)}`, [tag + '-02-oneday-held'])
await L.closeAny(w); await L.closeWinIfOpen(w)
// c) the drag-selection window
await L.reachCell(w, 'dice', '2026-03-10')
await P.locator(L.T('cell-snap-2026-03-11')).evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await P.waitForTimeout(300)
const bx = async (p, d) => { const b = await P.locator(L.T(L.cellId(p, d))).first().boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 } }
const s0 = await bx('dice', '2026-03-10'), s1 = await bx('snap', '2026-03-11')
if (w.phone) { const pts = [s0]; for (let i = 1; i <= 6; i++) pts.push({ x: s0.x + (s1.x - s0.x) * i / 6, y: s0.y + (s1.y - s0.y) * i / 6 }); await L.holdDrag(w, pts, 320) }
else { await P.mouse.move(s0.x, s0.y); await P.mouse.down(); await P.mouse.move(s1.x, s1.y, { steps: 8 }); await P.mouse.up() }
await P.waitForTimeout(600)
const cT = await full('[data-testid="select-sheet"]'); const cOpen = await L.vis(P, L.T('select-sheet'))
await L.shot(w, tag + '-03-select')
L.rec(ID + ' c (drag-selection window)', size, cOpen && /DURATION/i.test(cT) && !OLD.test(cT) ? 'PASS' : 'FAIL', `window open ${cOpen}; has "Duration": ${/DURATION/i.test(cT)}; has a "Date" row: ${/\bDATE\b/i.test(cT)} (the spec's wording names Date only for the one-day window); old words present: ${OLD.test(cT)}`, [tag + '-03-select'])
await L.closeAny(w)
// d) the Inputs page's input window
await L.inputsList(w)
await L.press(w, L.T('in-new')); await P.waitForTimeout(800)
await L.shot(w, tag + '-04-inputs-window')
const dTxt = await P.evaluate(() => { const t = document.body.innerText; const i = t.indexOf('New input'); return i < 0 ? '' : t.slice(i).replace(/\s+/g, ' ') })
console.log('inputs window text:', dTxt.slice(0, 500))
const dOld = dTxt.match(/how many|how much of the day|how much|\bwhen\b/i)
L.rec(ID + ' d (the Inputs page input window)', size, /Duration/i.test(dTxt) && !dOld ? 'PASS' : 'FAIL', `has "Duration": ${/Duration/i.test(dTxt)}; old word found: ${dOld ? dOld[0] : 'none'}; window text starts "${dTxt.slice(0, 160)}"`, [tag + '-04-inputs-window'])
// the span picker's group name inside the Inputs window: open its date part if there is a range
console.log('ERRORS', JSON.stringify(w.errs))
await L.closeBrowser()
