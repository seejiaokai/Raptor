/* rcf-w1 S14/S15 step A — exploratory: an SC shift on Saturday START=END=08:00; (c) nothing, (a) R 06:00, (b) B 06:00; reads
   the board's warnings, the pucks' OIL state, the OIL Earn mode. usage: node rcf-w1-s14a.mjs [desktop|phone] */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
const KIND = process.argv[2] || 'desktop'
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w1/s14a-' + KIND)
console.log('rcf-w1-s14a v1', KIND)
const X = await import('./rcf-w1-lib.mjs')
const { L, W4, sleep, norm } = X
const w = await X.world(KIND)
const { page } = w
const SAT = 5
const ranger = w.ID('Ranger'), comet = w.ID('Comet')
await L.board(page, SAT)
const gi = await X.addWave(w, SAT, 'sc')
await X.typeIn(w, `[data-bfld="ff:5.${gi}.0.to"]`, '08:00')
await X.typeIn(w, `[data-bfld="ff:5.${gi}.0.ld"]`, '08:00')
console.log('seat MAIN', await X.seatPhoneAware(w, `[data-slot="5.${gi}.0.0.p"]`, ranger))
console.log('seat SPARE', await X.seatPhoneAware(w, `[data-slot="5.${gi}.0.2.p"]`, comet))
const dump = async tag => {
  const f = await page.evaluate(g => { const x = window.DAYS[5].waves[g].formations[0]; return JSON.stringify({ to: x.to, ld: x.ld, rl: x.rl, br: x.br, ac: x.aircraft.map(a => a.role + ':' + a.p) }) }, gi)
  const bw = await X.boardWarn(page, w)
  console.log(`[${tag}] formation ${f}\n   warn head: ${bw.head}\n   warn items: ${JSON.stringify(bw.items)}`)
  const titles = await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld="ff:5.0.0.to"], #schedBoard [data-bfld="ff:5.0.0.ld"]')].filter(e => e.offsetWidth).map(e => e.className + ' | ' + e.title))
  console.log('   time-box titles:', JSON.stringify(titles))
}
await dump('c: nothing typed')
await X.pic(page, 'c-board')
const oil = async tag => {
  const on = await page.evaluate(() => !!(window.OILDAY != null))
  if (!on) {
    const b = page.locator('#schedBoard #sbOil:visible, #schedBoard [data-oilmode]:visible').first()
    await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
    if (w.phone) await b.tap(); else await b.click()
    await sleep(800)
  }
  const st = await page.evaluate(() => ({
    pucks: [...document.querySelectorAll('#schedBoard [data-person]')].filter(e => e.classList.contains('puck') && !e.closest('#sbRoster')).map(e => (window.PEOPLE[e.dataset.person] || {}).cs + ' | ' + e.className.replace(/\s+/g, ' ') + ' | ' + (e.getAttribute('title') || '')),
    oilEls: [...document.querySelectorAll('#schedBoard [class*="oil"]')].filter(e => e.offsetWidth).slice(0, 25).map(e => e.tagName + '.' + String(e.className).slice(0, 40) + ' :: ' + (e.innerText || '').replace(/\s+/g, ' ').slice(0, 100)),
  }))
  console.log(`[OIL ${tag}]`, JSON.stringify(st, null, 1))
  await X.pic(page, 'oil-' + tag)
}
await oil('c')
await w.browser.close()
