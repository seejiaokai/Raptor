/* exploratory: what the armed crew list says about X before placement */
import * as K from './rbl-A-lib.mjs'
const { B, W, X, MON, TUE } = K
const { browser, p, errors } = await K.fresh()
const { t } = await K.baseB(p)
await K.takeOff(p, TUE, `${TUE}.${t.gi}.0.0.w`)
await K.boardTo(p, TUE)
const key = `${TUE}.${t.gi}.0.0.w`
const { tap } = await import('./lib.mjs')
await tap(p, `[data-slot="${key}"], [data-fill="${key}"]`)
await K.sleep(500)
const info = await p.evaluate(who => {
  const r = document.querySelector(`#sbRoster .rpuck[data-person="${who}"]`)
  if (!r) return 'no roster puck'
  const c = getComputedStyle(r)
  return { cls: r.className, html: r.outerHTML.slice(0, 600), title: r.getAttribute('title'), text: r.innerText, deco: c.textDecorationLine, opacity: c.opacity, parentTitle: r.parentElement && r.parentElement.className }
}, X)
console.log(JSON.stringify(info, null, 1))
const bd = await p.evaluate(() => { const h = document.querySelector('#sbRoster'); return h ? h.innerText.slice(0, 400) : 'no roster' })
console.log(bd)
const drop = await p.evaluate(() => ({ arm: window.ARM && window.ARM.key, toast: (document.getElementById('toastEl') || {}).textContent }))
console.log(drop)
await B.pic(p, 'explore2-armed')
await p.evaluate(who => { const r = document.querySelector(`#sbRoster .rpuck[data-person="${who}"]`); if (r) r.scrollIntoView({ block: 'center' }) }, X)
await B.pic(p, 'explore2-armed-x')
console.log('errors', errors)
await browser.close()
