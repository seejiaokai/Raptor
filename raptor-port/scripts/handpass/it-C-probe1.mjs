import * as C from './it-C-lib.mjs'
const w = await C.world('desk', 'ad')
const p = w.page
await C.openBoard(w, 4)
const info = await p.evaluate(() => ({
  wv: [...document.querySelectorAll('#schedBoard [data-wvadd]')].map(e => e.dataset.wvadd + ':' + e.innerText),
  slots: [...document.querySelectorAll('#schedBoard [data-slot]')].slice(0, 12).map(e => e.dataset.slot),
  days: window.DAYS.map((d, i) => i + ':' + (d.date || d.label || '') + ' waves=' + ((d.waves || d.flying || []).length)),
  btn: [...document.querySelectorAll('#schedBoard button')].map(b => b.innerText.trim()).filter(Boolean).slice(0, 40),
}))
console.log(JSON.stringify(info, null, 1))
await C.pic(w, 'probe1-board4')
console.log(await p.evaluate(() => Object.keys(window.DAYS[4])))
console.log(await p.evaluate(() => JSON.stringify(window.DAYS[4]).slice(0, 1500)))
await w.browser.close()
