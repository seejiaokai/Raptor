// W3 S27 — hidden warning across publication, a look, a member. node sm-w3-s27.mjs pc|phone
import * as L from './sm-lib.mjs'
const size = process.argv[2] || 'pc'
console.log('sm-w3-s27 v1', size)
const OUT = L.outDir('w3')
const res = {}
const step = async (k, fn) => { try { res[k] = await fn(); console.log(k, JSON.stringify(res[k])) } catch (e) { res[k] = { err: e.message.split('\n')[0] }; console.log(k, 'ERR', res[k].err) } }
const W = await L.launch(size, { origin: 'http://localhost:4394' })
let P = W.page
await L.signIn(W)
await L.goEdit(W)
const readList = surf => P.evaluate(surf => {
  const box = document.querySelector(`${surf} .day[data-day="1"] [data-dwbox="1"]`); if (!box) return { err: 'no box' }
  const bar = box.querySelector('.daywarn')
  return { open: box.classList.contains('open'), bar: bar.innerText.replace(/\s+/g, ' ').trim(), lines: [...box.querySelectorAll('.witem[data-wix]')].map(e => { const b = e.querySelector('button.witem-mute'); return e.dataset.wix + ':' + (e.classList.contains('hid') ? 'hid' : 'live') + ':' + (b ? (b.querySelector('svg.wmuteico') ? 'reset' : b.textContent.trim()) : 'nobtn') }), pend: (document.querySelector(`${surf} .day[data-day="1"] .dpend`) || {}).textContent }
}, surf)
const openList = async surf => {
  await L.center(P, `${surf} .day[data-day="1"] [data-dwbox="1"]`)
  const o = await P.evaluate(s => document.querySelector(`${s} .day[data-day="1"] [data-dwbox="1"]`).classList.contains('open'), surf)
  if (!o) { await L.press(W, `${surf} .day[data-day="1"] [data-daywarn="1"]`); await L.sleep(500) }
}
const D = '#eWeek .day[data-day="1"]'
await openList('#eWeek')
await L.press(W, `${D} [data-woff="1.3"]`); await L.sleep(500)
await step('1.hidden-working', () => readList('#eWeek'))
console.log('publish', JSON.stringify(await L.publishDay(W, 1))); await L.closeBoard(W)
await L.goEdit(W); await openList('#eWeek')
await step('2.after-ORIG-publish', () => readList('#eWeek'))
await L.pic(W, OUT, `s27-${size}-e-after-orig`, { sel: `${D} [data-dwbox="1"]` })
await L.press(W, `${D} [data-woff="1.2"]`); await L.sleep(600)
await step('3.hide-second-after-publish', () => readList('#eWeek'))
await L.pic(W, OUT, `s27-${size}-e-hide-after-orig`, { sel: `${D} [data-dwbox="1"]`, pad: 40 })
// the changes window: the day's pending chip
await step('3b.chip', async () => { const c = P.locator(`${D} .dpend`).first(); if (!(await c.count())) return { err: 'no chip' }; await c.evaluate(e => e.scrollIntoView({ block: 'center' })); await (W.phone ? c.tap() : c.click()); await L.sleep(900); return P.evaluate(() => ({ win: [...document.querySelectorAll('.chgwin:not([hidden])')].map(w => w.innerText.replace(/\s+/g, ' ').slice(0, 260)) })) })
await L.pic(W, OUT, `s27-${size}-chgwin`)
// look at Original: the list there
await P.keyboard.press('Escape'); await L.sleep(400)
await step('4.look-original', async () => {
  await L.center(P, `${D} [data-planmenu="1"]`)
  await L.press(W, `${D} [data-planmenu="1"]`); await L.sleep(500)
  await L.press(W, P.locator('.wavemenu [data-planpv]').first()); await L.sleep(1000)
  await L.center(P, `${D} .dprev-bar`)
  return P.evaluate(() => ({ muteBtns: [...document.querySelectorAll('#eWeek .day[data-day="1"] button.witem-mute')].filter(b => b.getBoundingClientRect().width).length, resetSvgs: [...document.querySelectorAll('#eWeek .day[data-day="1"] svg.wmuteico')].filter(b => b.getBoundingClientRect().width).length, daywarn: [...document.querySelectorAll('#eWeek .day[data-day="1"] .daywarn')].filter(b => b.getBoundingClientRect().width).map(b => b.innerText.replace(/\s+/g, ' ').trim()) }))
})
await L.pic(W, OUT, `s27-${size}-e-look-orig`, { sel: `${D}`, pad: 0 })
await step('4b.back', async () => { await L.press(W, P.locator(`${D} button`, { hasText: /Back to live/ })); await L.sleep(800); return readList('#eWeek') })
// publish the amendment (hides go out)
console.log('publishAL', JSON.stringify(await L.publishDay(W, 1))); await L.closeBoard(W)
await L.goEdit(W); await openList('#eWeek')
await step('5.after-AL1', () => readList('#eWeek'))
await L.pic(W, OUT, `s27-${size}-e-after-al1`, { sel: `${D} [data-dwbox="1"]` })
// reload (state kept) and revisit
const state = await W.ctx.storageState()
await L.closeAll(W)
const R = await L.launch(size, { origin: 'http://localhost:4394', state })
Object.assign(W, R); P = R.page
await L.signIn(R); await L.goEdit(R); await openList('#eWeek')
await step('6.after-reload', () => readList('#eWeek'))
// member
await P.evaluate(() => window.raptorRole && window.raptorRole('member')).catch(() => {})
await L.closeAll(R)
const M = await L.launch(size, { origin: 'http://localhost:4394', state })
Object.assign(W, M); P = M.page
await L.signIn(M, 'm')
await M.page.evaluate(() => window.go('viewsched')); await L.sleep(1200)
await M.page.waitForSelector('#vWeek .day[data-day="1"]', { state: 'attached' })
await (async () => { await L.center(M.page, '#vWeek .day[data-day="1"] [data-dwbox="1"]'); const o = await M.page.evaluate(() => document.querySelector('#vWeek .day[data-day="1"] [data-dwbox="1"]').classList.contains('open')); if (!o) { await L.press(M, '#vWeek .day[data-day="1"] [data-daywarn="1"]'); await L.sleep(600) } })()
Object.assign(W, M); P = M.page
const mread = await M.page.evaluate(() => { const box = document.querySelector('#vWeek .day[data-day="1"] [data-dwbox="1"]'); return { bar: box.querySelector('.daywarn').innerText.replace(/\s+/g, ' ').trim(), lines: [...box.querySelectorAll('.witem[data-wix]')].map(e => e.dataset.wix + ':' + (e.classList.contains('hid') ? 'hid' : 'live') + ':' + (e.querySelector('button.witem-mute') ? 'BUTTON' : 'nobtn') + ':' + (e.querySelector('svg.wmuteico') ? 'RESET' : '')) } })
console.log('7.member', JSON.stringify(mread)); res['7.member'] = mread
await L.pic(M, OUT, `s27-${size}-member-list`, { sel: '#vWeek .day[data-day="1"] [data-dwbox="1"]' })
console.log('errs', JSON.stringify(M.errs))
L.saveJson(OUT, `s27-${size}-results`, res)
await L.closeAll(M)
