/* rcsb-w1-probe3 v1 — W1 finds where the sign-offs are drawn on a published day. Nothing asserted. */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4193'
process.env.HP_SHOTS ||= resolve(HERE, '../../../../docs/img/handpass/2026-11-13-rules-check-small-batch/w1/probe')
console.log('rcsb-w1-probe3 v1', process.env.HP_SHOTS)
const R = await import('../rcsb-lib.mjs')
const { X, L, sleep } = R
const w = await R.world('pc')
const { page } = w
const SAT = 5
const ranger = w.ID('Ranger')
const j = o => JSON.stringify(o)
await L.board(page, SAT)
const gF = await X.addWave(w, SAT, '')
await X.typeIn(w, `[data-bfld="ff:5.${gF}.0.to"]`, '10:00'); await X.typeIn(w, `[data-bfld="ff:5.${gF}.0.ld"]`, '10:30')
await X.seatPhoneAware(w, `[data-slot="5.${gF}.0.0.p"]`, ranger)
const sp = await X.signAndPublish(w, SAT)
console.log('signs pressed', j(sp.sg))
const dump = async tag => {
  const r = await page.evaluate(() => {
    const sc = document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth ? document.querySelector('#schedBoard') : document.querySelector('#eWeek .day[data-day="5"]')
    const sels = [...sc.querySelectorAll('select[data-sign]')]
    const par = sels[0] ? sels[0].closest('.signrow, .so, .signoff, div') : null
    const so = sc.querySelector('.so-state')
    return { nsel: sels.length, vis: sels.map(s => !!s.offsetWidth), vals: sels.map(s => s.value + '|' + (s.options[s.selectedIndex] || {}).text), soState: so ? so.innerText : null, parent: par ? par.className + ' :: ' + par.innerText.replace(/\s+/g, ' ').slice(0, 300) : null,
      signedText: [...sc.querySelectorAll('[class*=sign],[class*=so-]')].filter(e => e.offsetWidth).map(e => e.className + ' :: ' + e.innerText.replace(/\s+/g, ' ').slice(0, 120)).slice(0, 12) }
  })
  console.log(tag, j(r))
}
await dump('board after publish')
await L.closeBoard(page)
await L.go(page, 'editsched'); await sleep(600)
await dump('edit week after publish')
await X.pic(page, 'e-head-a', '#eWeek .day[data-day="5"] .day-head')
// the "i" button
const ib = page.locator('#eWeek [data-dayinfo="5"]:visible').first()
await ib.click(); await sleep(600)
await page.screenshot({ path: process.env.HP_SHOTS + '/p-dayinfo-a.png' })
console.log('info', await page.evaluate(() => [...document.querySelectorAll('[role=dialog], .dinfopop, .dinfo, .chgwin')].filter(e => e.offsetWidth).map(e => e.className + ' :: ' + e.innerText.replace(/\s+/g, ' ').slice(0, 700))))
await page.keyboard.press('Escape'); await sleep(300)
await R.setLogic(w, 'oilFullMin', '5h')
await L.go(page, 'editsched'); await sleep(600)
await dump('edit week after logic')
await X.pic(page, 'e-head-b', '#eWeek .day[data-day="5"] .day-head')
await ib.click().catch(() => {}); await sleep(600)
await page.screenshot({ path: process.env.HP_SHOTS + '/p-dayinfo-b.png' })
console.log('info b', await page.evaluate(() => [...document.querySelectorAll('[role=dialog], .dinfopop, .dinfo, .chgwin')].filter(e => e.offsetWidth).map(e => e.className + ' :: ' + e.innerText.replace(/\s+/g, ' ').slice(0, 700))))
await L.board(page, SAT)
await dump('board after logic')
await page.screenshot({ path: process.env.HP_SHOTS + '/p-board-b.png' })
R.finish(w, 'probe3')
await w.browser.close()
