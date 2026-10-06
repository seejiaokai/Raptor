import * as C from './rbl-C-lib.mjs'
const { B, L, W, K, ID, MON, TUE } = C
const { browser, p, errors } = await K.fresh()
try {
  for (const kind of ['sc', 'avalon', 'bb']) {
    const w = await K.addStandby(p, TUE, kind)
    console.log(kind, JSON.stringify(w))
    const info = await p.evaluate(([di, gi]) => {
      const wv = window.DAYS[di].waves[gi]
      const sc = document.querySelector('#schedBoard')
      const keys = [...sc.querySelectorAll(`[data-bfld^="ff:${di}.${gi}."], [data-bfld*=":${di}.${gi}."], [data-slot^="${di}.${gi}."]`)].filter(e => e.offsetParent !== null).map(e => (e.getAttribute('data-bfld') || e.getAttribute('data-slot')) + (e.value !== undefined && e.value !== '' ? '=' + e.value : ''))
      return { label: wv.label, kind: wv.kind, fm: JSON.stringify(wv.formations[0]).slice(0, 400), keys }
    }, [TUE, w.gi])
    console.log(JSON.stringify(info))
  }
  await B.pic(p, 'p7-standbys')
  console.log('ERR', errors.join(' | '))
} catch (e) { console.log('ERR', e.stack) }
await browser.close()
