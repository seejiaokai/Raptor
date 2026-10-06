import * as T from './bta-B-lib.mjs'
const { K, B, C, D, L, W, ID, CSN, TUE, sleep } = T
const keys = (p, di) => p.evaluate(([i, who]) => ((window.WARN.byDay[i] || {}).warns || []).filter(w => (w.who || []).includes(who) && /INPUT|LEAVE|DNIF/.test(w.code)).map(w => `${w.code} key=${w.key} ${String(w.msg).slice(0, 80)}`), [di, ID])
const { browser, p, errors } = await K.fresh()
try {
  await T.file(p, { type: 'Training', di: TUE, allday: false, span: 'custom', from: '00:00', to: '23:59', remarks: 'probe' })
  const d1 = await T.blankRow(p, 'duty', TUE)
  console.log('after desk 1', JSON.stringify(await keys(p, TUE)))
  const d2 = await T.blankRow(p, 'duty', TUE)
  console.log('after desk 2', JSON.stringify(await keys(p, TUE)), JSON.stringify([d1, d2]))
  const s1 = await T.blankRow(p, 'sim', TUE)
  console.log('after sim', JSON.stringify(await keys(p, TUE)))
  await D.setRow(p, 'sim', TUE, s1.ri, 'name', 'SIMX')
  console.log('sim named', JSON.stringify(await keys(p, TUE)))
  await D.setRow(p, 'duty', TUE, d1.ri, 'name', 'DESKX')
  console.log('desk1 named', JSON.stringify(await keys(p, TUE)))
} catch (e) { console.log('ERR', e.stack) }
console.log('errors', errors)
await browser.close()
