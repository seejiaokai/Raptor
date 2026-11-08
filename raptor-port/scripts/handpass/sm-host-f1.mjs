// The host's reproduction of fault 1 (W1b S30) — chat 13, 8 Nov 26: in the changes window's "To go out" list, a tap on
// an Unavailable input's line ("Bolt · LL") does nothing, while a Ground input's line ("Saint · Meeting") goes to its row.
// Run on any build: SM_DIST=<dist> TAG=<name> node scripts/handpass/sm-host-f1.mjs — prints what each line is and does.
import * as L from './sm-lib.mjs'
const TAG = process.env.TAG || 'job'
console.log('sm-host-f1 v1', TAG, L.DIST)
const OUT = L.outDir('host')
const W = await L.launch('pc', { origin: 'http://localhost:4396' })
await L.signIn(W)
await L.publishDay(W, 2); await L.closeBoard(W)
const a = await L.fileInput(W, { who: 'Bolt', type: 'LL', iso: '2026-07-15' })
const b = await L.fileInput(W, { who: 'Saint', type: 'Meeting', iso: '2026-07-15', remarks: 'Safety brief' })
console.log('filed', JSON.stringify({ a: a && { type: a.type, acc: a.acc }, b: b && { type: b.type, acc: b.acc } }))
await L.goEdit(W); await W.page.evaluate(() => window.scrollTo(0, 0)); await L.sleep(500)
await L.press(W, W.page.locator('#eWeek section.day[data-day="2"] [data-pendlist="2"]')); await L.sleep(900)
const lines = await W.page.evaluate(() => [...document.querySelectorAll('.chgwin .pl-item')].map(e => ({ tag: e.tagName, cls: e.className, plix: e.getAttribute('data-plix'), title: e.title, text: e.textContent.replace(/\s+/g, ' ').trim().slice(0, 70) })))
console.log('lines', JSON.stringify(lines, null, 1))
const foot = await W.page.evaluate(() => (document.querySelector('.chgwin .pl-foot') || {}).textContent)
console.log('foot', JSON.stringify(foot))
for (const pick of [/LL/, /Meeting/]) {
  await W.page.evaluate(() => window.scrollTo(0, 0)); await L.sleep(300)
  const line = W.page.locator('.chgwin .pl-item').filter({ hasText: pick }).first()
  if (!(await line.count())) { console.log('no line', pick); continue }
  await line.click(); await L.sleep(1200)
  const r = await W.page.evaluate(() => ({ y: Math.round(scrollY), flash: [...document.querySelectorAll('.chgflash')].map(e => e.className.slice(0, 40) + '|' + e.textContent.trim().slice(0, 30)), toast: (document.querySelector('#toastEl') || {}).textContent }))
  console.log('tap', String(pick), JSON.stringify(r))
}
await L.pic(W, OUT, `f1-${TAG}`, {})
console.log('errs', JSON.stringify(W.errs))
await L.closeAll(W)
