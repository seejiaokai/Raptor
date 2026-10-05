import * as K from './stk-B-lib.mjs'
const { B, L, W, sleep } = K
const { browser, p, errors } = await K.fresh()
try {
  const DI = 4
  const d = await p.evaluate(i => JSON.stringify({ ground: window.DAYS[i].ground, sims: window.DAYS[i].sims, prog: window.DAYS[i].prog, duty: window.DAYS[i].duty, keys: Object.keys(window.DAYS[i]) }), DI)
  console.log('FRI', d.slice(0, 2500))
  await K.boardTo(p, DI)
  const btns = await p.evaluate(() => [...document.querySelectorAll('#schedBoard button, #schedBoard [data-add], #schedBoard [data-gadd]')].filter(b => b.offsetParent !== null).map(b => Object.entries(b.dataset).map(([k, v]) => k + '=' + v).join(',') + ':' + (b.innerText || '').trim().slice(0, 20)).filter(x => /add|blk|row|item|prog|grd|sim|duty|\+/i.test(x)).slice(0, 80))
  console.log('BTNS', btns.join('\n'))
  const flds = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld]')].filter(e => e.offsetParent !== null).map(e => e.dataset.bfld).filter(x => !/^ff|^fr/.test(x)).slice(0, 80))
  console.log('FLDS', flds.join(' '))
  const slots = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-slot], #schedBoard [data-fill]')].filter(b => b.offsetParent !== null).map(b => b.dataset.slot || b.dataset.fill).filter(x => !/^\d/.test(x)).slice(0, 60))
  console.log('SLOTS', slots.join(' '))
  console.log('errors', errors)
} finally { await browser.close() }
