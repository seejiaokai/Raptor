// RX3-1 and RX3-2: a man taken off and put back on a published day reads nothing pending; the ordinary counts still right.
import * as L from './or-RX3-lib.mjs'
const { j } = L
const out = {}
const { ctx, page: p } = await L.open('ad', 'a')
const mt = (await L.fileInput(p, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: L.ISO, to: L.ISO, timed: ['09:00', '10:00'], title: 'Range brief' }))[0]
const iid = mt.iid
console.log('filed', j(mt))
out.pub = await L.signAndPublish(p, L.DI)
console.log('PUBLISH', j(out.pub))
out.signBefore = await L.boardSignoffs(p, L.DI, 'rx3-1-0-board-after-publish')
console.log('SIGN-OFFS after publish', j(out.signBefore))
out.c0 = await L.counts(p); console.log('COUNTS 0 (published, nothing changed)', L.fmt(out.c0))
await L.toWeek(p); await L.scrollToSec(p, 'ground')
await L.shot(p, 'rx3-1-1-published-row')
// right-click Drifter's puck off
out.takeToast = await L.takeOffRow(p, 'Drifter', iid)
console.log('Drifter off toast:', out.takeToast, '| people:', j((await L.inputOf(p, iid)).people))
out.c1 = await L.counts(p, { keepWin: true }); console.log('COUNTS 1 (Drifter off)', L.fmt(out.c1))
await L.shot(p, 'rx3-1-2-drifter-off-togoout')
await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300)
await L.toWeek(p); await L.scrollToSec(p, 'ground')
await L.shot(p, 'rx3-1-2b-row-drifter-off')
// drag Drifter back onto +add
out.backToast = await L.addOntoRow(p, 'Drifter', iid)
console.log('Drifter back toast:', out.backToast, '| people:', j((await L.inputOf(p, iid)).people))
out.c2 = await L.counts(p, { keepWin: true }); console.log('COUNTS 2 (Drifter back)', L.fmt(out.c2))
await L.shot(p, 'rx3-1-3-drifter-back-window')
await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300)
await L.toWeek(p); await L.scrollToSec(p, 'ground')
await L.shot(p, 'rx3-1-3b-row-drifter-back')
await L.shot(p, 'rx3-1-3c-week-head', { x: 0, y: 0, width: 1440, height: 900 }).catch(() => {})
await L.toWeek(p); await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300)
await L.shot(p, 'rx3-1-3d-week-top')
out.signAfter = await L.boardSignoffs(p, L.DI, 'rx3-1-4-board-sign-offs-after')
console.log('SIGN-OFFS after back', j(out.signAfter))
out.inputsA = await L.inputOf(p, iid); console.log('INPUTS', j(out.inputsA))
// reload
out.signedAgain = await L.reload(p)
console.log('RELOADED, signed in again:', out.signedAgain)
out.inputsReload = await L.inputOf(p, iid)
out.c3 = await L.counts(p, { keepWin: true }); console.log('COUNTS 3 (after reload)', L.fmt(out.c3))
await L.shot(p, 'rx3-1-5-after-reload')
await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300)
await L.toWeek(p); await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300)
await L.shot(p, 'rx3-1-5b-week-after-reload')
out.signReload = await L.boardSignoffs(p, L.DI, 'rx3-1-6-board-sign-offs-after-reload')
console.log('SIGN-OFFS after reload', j(out.signReload))

// ---------- RX3-2 (same day, same world) ----------
await L.toWeek(p)
out.r2 = {}
const rp = async tag => { const pk = await L.rowPucks(p, iid); out.r2[tag + '_pucks'] = pk; console.log('  pucks', tag, j(pk)) }
// add Tally
out.r2.addTally = await L.addOntoRow(p, 'Tally', iid); console.log('RX3-2 Tally added toast:', out.r2.addTally, '| people:', j((await L.inputOf(p, iid)).people))
await rp('tallyIn')
await L.scrollToSec(p, 'ground'); await L.shot(p, 'rx3-2-1-tally-added-row')
out.r2.c1 = await L.counts(p, { keepWin: true }); console.log('COUNTS tally in', L.fmt(out.r2.c1))
await L.shot(p, 'rx3-2-1b-tally-added-window')
await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300)
// take Tally off
out.r2.tallyOff = await L.takeOffRow(p, 'Tally', iid); console.log('Tally off toast:', out.r2.tallyOff, '| people:', j((await L.inputOf(p, iid)).people))
out.r2.c2 = await L.counts(p, { keepWin: true }); console.log('COUNTS tally out', L.fmt(out.r2.c2))
await L.shot(p, 'rx3-2-2-tally-off-window')
await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300)
await L.toWeek(p); await L.scrollToSec(p, 'ground'); await L.shot(p, 'rx3-2-2b-tally-off-row')
// take Hunter (middle) off
out.r2.hunterOff = await L.takeOffRow(p, 'Hunter', iid); console.log('Hunter off toast:', out.r2.hunterOff, '| people:', j((await L.inputOf(p, iid)).people))
out.r2.c3 = await L.counts(p, { keepWin: true }); console.log('COUNTS hunter out', L.fmt(out.r2.c3))
await L.shot(p, 'rx3-2-3-hunter-off-window')
await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300)
await L.toWeek(p); await L.scrollToSec(p, 'ground'); await L.shot(p, 'rx3-2-3b-hunter-off-row')
// put Hunter back
out.r2.hunterBack = await L.addOntoRow(p, 'Hunter', iid); console.log('Hunter back toast:', out.r2.hunterBack, '| people:', j((await L.inputOf(p, iid)).people))
out.r2.c4 = await L.counts(p, { keepWin: true }); console.log('COUNTS hunter back', L.fmt(out.r2.c4))
await L.shot(p, 'rx3-2-4-hunter-back-window')
await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300)
await L.toWeek(p); await L.scrollToSec(p, 'ground'); await L.shot(p, 'rx3-2-4b-hunter-back-row')
out.inputsEnd = await L.inputOf(p, iid)
console.log('INPUTS end', j(out.inputsEnd))
console.log('ERRORS', L.errs.join(' | ') || 'none')
L.saveRes('1', out)
await ctx.close(); await L.browser.close()
