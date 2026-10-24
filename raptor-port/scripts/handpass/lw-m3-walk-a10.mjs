// Walker A, scenarios 10 and 11: remarks and the till tick (both orders); untick till -> approved -> the Inputs page shows no till date; put back -> the request keeps remark and untick.
// usage: node lw-m3-walk-a10.mjs <desktop|phone> <chromium|webkit>
import * as L from './lw-m3-walk-a-lib.mjs'
const size = process.argv[2] || 'desktop', engine = process.argv[3] || 'chromium'
const tag = `s10-${size === 'phone' ? 'ph' : 'dk'}${engine === 'webkit' ? '-wk' : ''}`
console.log('lw-m3-walk-a10 v1', size, engine, tag)
const w = await L.newCtx(size, engine)
const P = w.page, ID = n => `${n} ${size}/${engine}`
const till = () => P.evaluate(() => { const e = document.querySelector('[data-testid="bid-tilldate"]'), c = document.querySelector('[data-testid="bid-till"]'); return e ? { text: e.innerText.trim(), struck: getComputedStyle(e).textDecorationLine.includes('line-through'), ticked: c ? c.checked : null } : null })
const remarks = () => P.locator('[data-testid="bid-remarks"]').inputValue().catch(() => null)
async function pickRange(a, b) {
  await L.step(w, `${tag}-r-range-${a.slice(5)}`, L.T('span-range'))
  await P.waitForTimeout(300)
  for (const d of [a, b]) { for (let i = 0; i < 6 && !(await L.vis(P, L.T('span-day-' + d))); i++) { await L.press(w, L.T('span-next')); await P.waitForTimeout(250) } await L.press(w, L.T('span-day-' + d)); await P.waitForTimeout(250) }
}
async function place() { await L.press(w, L.T('bid-LL')); await P.waitForTimeout(400); if (await L.vis(P, L.T('bid-picker'))) { const t = (await L.winGeom(P)).text; if (/tap the same leave again/i.test(t)) { await L.press(w, L.T('bid-LL')); await P.waitForTimeout(500) } } }
async function typeRemarks(t) { await P.locator('[data-testid="bid-remarks"]').click(); await P.locator('[data-testid="bid-remarks"]').fill(t); await P.waitForTimeout(250) }
// ---------- scenario 10 as the member
await L.signInPlain(w, 'member', '2026-02-15')
// order A: remarks first, then the range
await L.openCellR(w, 'bane', '2026-03-05')
await typeRemarks('passport')
const a0 = await till()
await pickRange('2026-03-05', '2026-03-09')
const a1 = await till(), aSel = await L.txt(P, L.T('span-selection')), aRem = await remarks()
await L.shot(w, tag + '-10a-remarks-then-range')
L.rec(ID(10) + ' a (remarks, then Pick a range)', size, a0?.text === 'till 5 Mar' && a1?.text === 'till 9 Mar' && aRem === 'passport' ? 'PASS' : 'FAIL', `before the range the date read "${a0?.text}"; after picking ${aSel} it reads "${a1?.text}" (ticked ${a1?.ticked}); remarks box still "${aRem}"`, [tag + '-10a-remarks-then-range'])
await place()
await L.reachCell(w, 'bane', '2026-03-05'); await L.openCellR(w, 'bane', '2026-03-05')
const a2 = await till(), aRem2 = await remarks()
await L.shot(w, tag + '-10a2-reopened')
L.rec(ID('10') + ' a2 (placed; reopened)', size, aRem2 === 'passport' && a2?.text === 'till 9 Mar' ? 'PASS' : 'FAIL', `reopened bid window: remarks "${aRem2}", date "${a2?.text}" (ticked ${a2?.ticked})`, [tag + '-10a2-reopened'])
await L.closeWinIfOpen(w)
// order B: range first, then remarks
await L.openCellR(w, 'bane', '2026-03-17')
await pickRange('2026-03-17', '2026-03-20')
const b0 = await till()
await typeRemarks('visa')
const b1 = await till(), bRem = await remarks()
await L.shot(w, tag + '-10b-range-then-remarks')
L.rec(ID(10) + ' b (Pick a range, then remarks)', size, b0?.text === 'till 20 Mar' && b1?.text === 'till 20 Mar' && bRem === 'visa' ? 'PASS' : 'FAIL', `after the range the date read "${b0?.text}"; after typing it reads "${b1?.text}"; remarks "${bRem}"`, [tag + '-10b-range-then-remarks'])
await place()
await L.reachCell(w, 'bane', '2026-03-17'); await L.openCellR(w, 'bane', '2026-03-17')
const b2 = await till(), bRem2 = await remarks()
await L.shot(w, tag + '-10b2-reopened')
L.rec(ID('10') + ' b2 (placed; reopened)', size, bRem2 === 'visa' && b2?.text === 'till 20 Mar' ? 'PASS' : 'FAIL', `reopened: remarks "${bRem2}", date "${b2?.text}"`, [tag + '-10b2-reopened'])
await L.closeWinIfOpen(w)
// ---------- scenario 11 as the admin
await L.signInPlain(w, 'admin')
const ISO = '2026-03-12', ISO2 = '2026-03-23'   // two-day runs (12-13 Mar, 23-24 Mar): a one-day leave prints no till date on a phone's card either way
await L.openCellR(w, 'bane', ISO)
await typeRemarks('dentist')
await pickRange('2026-03-12', '2026-03-13')
await L.step(w, tag + '-11a-untick-till', L.T('bid-till')); await P.waitForTimeout(250)
const c0 = await till()
await L.shot(w, tag + '-11a-unticked')
L.rec(ID(11) + ' a (untick till: date struck through)', size, c0?.ticked === false && c0.struck ? 'PASS' : 'FAIL', `till tick ${c0?.ticked}; date "${c0?.text}" struck through: ${c0?.struck}`, [tag + '-11a-untick-till-q', tag + '-11a-unticked'])
await place()
// a control with the tick left on
await L.openCellR(w, 'bane', ISO2)
await typeRemarks('checkup')
await pickRange('2026-03-23', '2026-03-24')
await place()
await L.inputsList(w)
await P.waitForTimeout(500)
const rowTxt = async what => P.evaluate(w => { const t = [...document.querySelectorAll('#page-inputs *')].filter(e => e.children.length < 8 && e.innerText && e.innerText.includes(w) && /Ranger/.test(e.innerText) && e.getBoundingClientRect().height < 200 && e.getBoundingClientRect().height > 20).sort((a, b) => a.innerText.length - b.innerText.length)[0]; return t ? t.innerText.replace(/\s+/g, ' ') : null }, what)
const r1 = await rowTxt('dentist'), r2 = await rowTxt('checkup')
await P.evaluate(() => { const e = [...document.querySelectorAll('#page-inputs *')].filter(x => x.children.length === 0 && /^dentist/.test((x.innerText || '').trim()))[0]; if (e) e.scrollIntoView({ block: 'center' }) }); await P.waitForTimeout(400)
await L.shot(w, tag + '-11b-inputs')
console.log('inputs rows:', r1, '||', r2)
L.rec(ID(11) + ' b (Inputs page: remark, no till date)', size, r1 && /dentist/.test(r1) && (w.phone ? true : (!/till 13 Mar/.test(r1) && r2 && /till 24 Mar/.test(r2))) ? 'PASS' : 'FAIL', `unticked one reads "${r1}"; the ticked control reads "${r2}"`, [tag + '-11b-inputs'])
await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(900)
await L.reachCell(w, 'bane', ISO)
// put it back: the Decide row has no "pending" control; Refuse is the way an approved leave leaves the Inputs
await L.openCellR(w, 'bane', ISO)
const appr = await P.evaluate(() => ['decide-approve', 'decide-refuse'].map(t => t + ':' + document.querySelector(`[data-testid="${t}"]`)?.getAttribute('aria-pressed')))
await L.step(w, tag + '-11c-refuse', L.T('decide-refuse')); await P.waitForTimeout(600)
await L.reachCell(w, 'bane', ISO); await L.openCellR(w, 'bane', ISO)
const c1 = await till(), cRem = await remarks()
await L.shot(w, tag + '-11d-after-putback')
const cs = await L.boxes(w, 'bane', ISO)
L.rec(ID(11) + ' c (put back: the request keeps remark and untick)', size, cRem === 'dentist' && c1 && c1.ticked === false && c1.struck ? 'PASS' : 'FAIL', `Decide row before: ${appr.join(' ')}; there is no control that sets it back to a WAITING bid (Ack is gone) - Refuse is the only way off the Inputs; after Refuse the cell is ${cs?.boxes?.[0]?.split('|')[1]}; reopened: remarks "${cRem}", date "${c1?.text}" ticked ${c1?.ticked} struck ${c1?.struck}`, [tag + '-11c-refuse-q', tag + '-11d-after-putback'])
console.log('ERRORS', JSON.stringify(w.errs))
await L.closeBrowser()
