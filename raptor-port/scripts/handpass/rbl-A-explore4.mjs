/* exploratory: the wave menu, an SC wave's boxes, a Ground Programme row's boxes */
import * as K from './rbl-A-lib.mjs'
const { B, W, X, MON, TUE } = K
const { browser, p, errors } = await K.fresh()
await K.boardTo(p, TUE)
const b = p.locator(`#schedBoard [data-wvadd="${TUE}"]`).first()
await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await K.sleep(400)
console.log('MENU', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.wavemenu [data-wmkind], .wavemenu button')].map(e => ({ kind: e.dataset.wmkind, text: e.innerText.trim().slice(0, 40) })))))
await p.keyboard.press('Escape')
await K.sleep(300)
const kinds = await p.evaluate(() => [...document.querySelectorAll('.wavemenu [data-wmkind]')].map(e => e.dataset.wmkind))
console.log('kinds', kinds)
/* try the SC one */
const before = await p.evaluate(i => window.DAYS[i].waves.map(w => w.label), TUE)
await b.click(); await K.sleep(400)
const sc = (await p.evaluate(() => [...document.querySelectorAll('.wavemenu [data-wmkind]')].map(e => ({ k: e.dataset.wmkind, t: e.innerText.trim() })))).find(x => /SC/i.test(x.t) || /sc/i.test(x.k))
console.log('SC item', sc)
if (sc) { await p.locator(`.wavemenu [data-wmkind="${sc.k}"]`).first().click(); await K.sleep(800) }
const after = await p.evaluate(i => window.DAYS[i].waves.map(w => ({ label: w.label, kind: w.kind, sc: !!w.sc, keys: Object.keys(w), f0: w.formations && w.formations[0] ? Object.keys(w.formations[0]) : null })), TUE)
console.log(JSON.stringify(after.slice(-2), null, 1))
const attrs = await p.evaluate(() => {
  const o = {}
  const lastWave = [...document.querySelectorAll('#schedBoard .sb-go')].pop()
  for (const e of lastWave.querySelectorAll('*')) for (const a of e.attributes) if (a.name.startsWith('data-bfld') || a.name.startsWith('data-slot') || a.name.startsWith('data-txt')) { o[a.name + '=' + a.value] = e.tagName }
  return o
})
console.log(JSON.stringify(attrs))
await B.pic(p, 'explore4-sc')
console.log('errors', errors)
await browser.close()
