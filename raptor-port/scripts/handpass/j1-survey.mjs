import { open, board } from './lib.mjs'
const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
const { browser, page, errors } = await open({ state: STATE })
await board(page, 5)
const r = await page.evaluate(() => {
  const btns = [...document.querySelectorAll('#schedBoard [data-inpedit]')].filter(e => e.offsetParent)
  const day = (window.DAYS || [])[window.SBDAY] || {}
  const inps = (window.INPUTS || []).filter(i => window.inputCoversDate && window.inputCoversDate(i, day.date))
  return {
    day: { date: day.date, dow: day.dow, approved: window.dayApproved(window.SBDAY) },
    doors: btns.map(b => ({ iid: b.getAttribute('data-inpedit'), txt: (b.innerText || '').trim(), row: (b.closest('.sb-arow,.sbi-row') || {}).innerText?.replace(/\s+/g, ' ').trim().slice(0, 60) })),
    inputsCoveringDay: inps.map(i => ({ id: i.id, person: i.person, type: i.type, s: i.s, e: i.e, d: i.d, d2: i.d2, acc: i.acc, oil: i.oil })),
  }
})
console.log(JSON.stringify(r, null, 1))
console.log('errors:', errors.slice(0, 4))
await browser.close()
