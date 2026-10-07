import * as K from './stk-B-lib.mjs'
const { B, L, W, sleep } = K
const { browser, p, errors } = await K.fresh()
try {
  const DI = 5
  for (const k of ['sc', 'avalon', 'bb']) { const r = await K.addStandby(p, DI, k); console.log('added', k, JSON.stringify(r)) }
  const d = await p.evaluate(i => JSON.stringify(window.DAYS[i].waves), DI)
  console.log('WAVES', d.slice(0, 3000))
  await K.boardTo(p, DI)
  const f = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld]')].filter(e => e.offsetParent !== null).map(e => e.dataset.bfld + '=' + (e.value ?? e.textContent)).filter(x => /^(ff|sa|st|fr|dl|dr)/.test(x)).slice(0, 80))
  console.log('BFLD', f.join(' | '))
  const d1 = await p.evaluate(() => JSON.stringify({ ground: window.DAYS[1].ground.slice(0, 2), sims: window.DAYS[1].sims, prog: window.DAYS[1].prog }).slice(0, 2500))
  console.log('D1', d1)
  const keys = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld]')].filter(e => e.offsetParent !== null).map(e => e.dataset.bfld).filter(x => /^(gr|sr|ap|dr|dl)/.test(x)).slice(0, 40))
  console.log('keys', keys)
  console.log('errors', errors)
} finally { await browser.close() }
