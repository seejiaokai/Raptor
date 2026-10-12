// RX4-7: the issued order across a week change. Meeting Drifter/Hunter/Ranger Wed 15 Jul published; Drifter off, back on "+ add": nothing pending; step to NEXT week with the week picker and back.
import * as L from './or-RX5-lib.mjs'
const { j } = L
const out = {}
const { ctx, page: p } = await L.open('ad', 'a')
const mt = (await L.fileInput(p, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: L.ISO, to: L.ISO, timed: ['09:00', '10:00'], title: 'Range brief' }))[0]
const iid = mt.iid
console.log('filed', j(mt))
out.pub = await L.signAndPublish(p, L.DI); console.log('PUBLISH', j(out.pub))
out.c0 = await L.counts(p, { noBoard: true }); console.log('COUNTS 0', L.fmt(out.c0))
out.order0 = (await L.inputOf(p, iid)).people
await L.toWeek(p); await L.scrollToSec(p, 'ground'); await L.shot(p, 'rx4-7-1-published-row')
out.takeToast = await L.takeOffRow(p, 'Drifter', iid)
console.log('Drifter off:', out.takeToast)
out.c1 = await L.counts(p, { noBoard: true }); console.log('COUNTS 1 (off)', L.fmt(out.c1))
out.backToast = await L.addOntoRow(p, 'Drifter', iid)
console.log('Drifter back:', out.backToast, '| people:', j((await L.inputOf(p, iid)).people))
out.order1 = (await L.inputOf(p, iid)).people
out.c2 = await L.counts(p, { keepWin: true, noBoard: true }); console.log('COUNTS 2 (back, before week change)', L.fmt(out.c2))
await L.shot(p, 'rx4-7-2-back-window')
// the changes window All changes for Wed: before the week change
await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300)
out.hist0 = await L.openHistoryAllChanges(p, 'Wed'); console.log('ALL CHANGES Wed BEFORE week change', j(out.hist0))
await L.shot(p, 'rx4-7-3-allchanges-before')
await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300)
// the week picker
await L.toWeek(p); await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300)
out.wkButtons = await p.evaluate(() => [...document.querySelectorAll('#weekSegE [data-wk]')].map(b => b.getAttribute('data-wk') + '|' + b.textContent.trim() + (b.classList.contains('on') ? '[on]' : '')))
console.log('week picker buttons', j(out.wkButtons))
await L.shot(p, 'rx4-7-4-week-picker-before')
const on = out.wkButtons.find(x => x.includes('[on]')).split('|')[0]
const next = out.wkButtons[out.wkButtons.findIndex(x => x.includes('[on]')) + 1].split('|')[0]
console.log('current', on, 'next', next)
await p.locator(`#weekSegE [data-wk="${next}"]`).click(); await p.waitForTimeout(1200)
out.nextWeek = await p.evaluate(() => [...document.querySelectorAll('#weekSegE [data-wk].on')].map(b => b.getAttribute('data-wk')))
await L.shot(p, 'rx4-7-5-next-week')
console.log('on next week:', j(out.nextWeek))
await p.locator(`#weekSegE [data-wk="${on}"]`).click(); await p.waitForTimeout(1200)
out.backWeek = await p.evaluate(() => [...document.querySelectorAll('#weekSegE [data-wk].on')].map(b => b.getAttribute('data-wk')))
console.log('back on week:', j(out.backWeek))
await L.shot(p, 'rx4-7-6-back-on-week')
await L.scrollToSec(p, 'ground'); await L.shot(p, 'rx4-7-7-back-row')
out.c3 = await L.counts(p, { keepWin: true, noBoard: true }); console.log('COUNTS 3 (after week change and back)', L.fmt(out.c3))
await L.shot(p, 'rx4-7-8-after-weekchange-togoout')
await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300)
out.hist1 = await L.openHistoryAllChanges(p, 'Wed'); console.log('ALL CHANGES Wed AFTER week change', j(out.hist1))
await L.shot(p, 'rx4-7-9-allchanges-after')
out.orderEnd = (await L.inputOf(p, iid)).people
out.same = j(out.hist0.lines) === j(out.hist1.lines)
console.log('history lines identical before/after:', out.same, '| people order', j(out.order0), j(out.order1), j(out.orderEnd))
console.log('ERRORS', L.errs.join(' | ') || 'none')
L.saveRes('7', out)
await ctx.close(); await L.browser.close()
