import * as S from './ins-s-lib.mjs'
const { B, L, W } = S
const { browser, p, errors } = await B.world()
try {
  await B.toEdit(p)
  await W.boardOn(p, 1)
  const seats = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-slot]')].filter(e => e.offsetParent !== null).slice(0, 60).map(e => ({ slot: e.dataset.slot, who: [...e.querySelectorAll('[data-person]')].map(x => x.dataset.person).join(','), cls: e.className.slice(0, 30) })))
  console.log('SEATS', JSON.stringify(seats))
  const tue = await p.evaluate(() => {
    const d = window.DAYS[1]
    return d.waves.map((w, gi) => ({ gi, lbl: w.label, kind: w.kind, forms: (w.forms || w.lines || []).length, keys: Object.keys(w).join(',') }))
  })
  console.log('TUE', JSON.stringify(tue))
  const sample = await p.evaluate(() => JSON.stringify(window.DAYS[1].waves[0], null, 0).slice(0, 1800))
  console.log('WAVE0', sample)
  const buttons = await p.evaluate(() => [...document.querySelectorAll('#schedBoard button')].filter(e => e.offsetParent !== null).map(e => (e.id || e.className.slice(0, 20)) + '|' + [...e.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',')).slice(0, 60))
  console.log('BUTTONS', JSON.stringify(buttons))
} catch (e) { console.log('ERR', e.stack) }
console.log('errors', errors)
await browser.close()
