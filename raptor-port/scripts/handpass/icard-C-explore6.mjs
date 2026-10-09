import * as L from './icard-C-lib.mjs'
const { sleep } = L
const w = await L.world('desk', 'us')
const p = w.page
await L.fileNew(w, { iso: '2026-07-20', type: 'Duty', s: '09:00', e: '12:00', oil: 'no' })
const rec = await L.recBy(p, { type: 'Duty', date: 'Jul 20' })
await L.switchUser(w, 'ad')
await L.signAndPublish(w, 'Jul 20', 0)
await L.signDay(p, 0, 1)
const pend = async tag => {
  await L.showDay(p, 0)
  const h = await L.head(p, 0)
  const b = p.locator('#eWeek [data-pendlist="0"]:visible').first()
  let txt = '(no chip)'
  if (await b.count()) { await b.click(); await sleep(500); txt = await p.evaluate(() => { const e = document.querySelector('.chgwin'); return e ? e.innerText.replace(/\s+/g, ' ').trim().slice(0, 500) : '(closed)' }); await L.pic(w, 'x6-' + tag); await p.keyboard.press('Escape'); await sleep(250) }
  console.log(tag, await p.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="0"] .dpend'); return d ? d.outerHTML.slice(0, 300) : null }), await p.evaluate(() => (document.querySelector('#eWeek').parentElement.querySelector('.amendpanel, #amendPanel, .amend-head') || {innerText: ''}).innerText.slice(0, 200)), h.pending, '|', h.signs.join('/'), '|', h.nys, '|', txt)
}
await pend('baseline')
await L.switchUser(w, 'us')
await L.openFromList(w, rec.iid)
await p.locator(`${L.WIN} #inpEdCal [data-cal="2026-07-21"]`).click()
await L.saveWin(w)
await L.closeWins(p)
await L.undo(w)
console.log('rec after undo', (await L.recId(p, rec.iid)).date)
await L.switchUser(w, 'ad')
await L.go(p, 'editsched'); await p.getByRole('button', { name: 'Jul 20', exact: true }).click(); await sleep(800)
await pend('after-move-undo')
await w.browser.close()
