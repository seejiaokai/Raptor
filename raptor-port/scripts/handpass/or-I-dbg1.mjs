import * as L from './or-I-lib.mjs'
const { page, browser } = await L.start()
const f = await L.fileIt(page, { title: 'Crowd duty', kind: 'Duty', pick: ['Ranger', 'Hex'], several: true, from: '16:00', to: '17:00', oil: 'close' })
await L.toWeek(page)
const info = await page.evaluate(id => {
  const d = window.DAYS[2]; const out = {}
  for (const k of Object.keys(d)) if (Array.isArray(d[k])) { const i = d[k].findIndex(g => g && g.src === id); if (i >= 0) out[k] = i }
  return out
}, f.iid)
console.log('where the input lives on Wed:', JSON.stringify(info))
console.log(await page.evaluate(id => [...document.querySelectorAll('#eWeek .day:not(.peek) [data-fill]')].filter(e => /Crowd|CROWD/i.test(e.closest('.pl-row,.sb-arow,tr')?.innerText || '')).map(e => e.getAttribute('data-fill') + ' ' + e.closest('.pl-row,tr')?.className).join(' | '), f.iid))
await page.screenshot({ path: L.OUT + '/dbg1.png' })
console.log(L.errs)
await browser.close()
