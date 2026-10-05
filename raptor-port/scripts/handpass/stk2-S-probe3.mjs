import * as K from './stk2-S-lib.mjs'
const { L, W, H } = K
const { browser, p, errors } = await H.world({ who: 'a', phone: false })
await W.boardOn(p, 2)
const info = await p.evaluate(() => {
  const g = document.querySelector('#schedBoard .sb-panel.grnd')
  const rows = [...g.querySelectorAll('.sb-arow')].map(r => ({ k: [...r.querySelectorAll('[data-bfld]')].map(e => e.dataset.bfld + '=' + e.value).join(' '), fill: (r.querySelector('[data-fill]') || {}).dataset && r.querySelector('[data-fill]').dataset.fill }))
  const btns = [...g.querySelectorAll('button')].map(b => b.innerText.trim() + '|' + [...b.attributes].map(a => a.name + '=' + a.value).join(' ')).filter(t => !/CX|^i/.test(t)).slice(0, 12)
  return { head: g.innerText.slice(0, 200), rows, btns }
})
console.log(JSON.stringify(info, null, 1))
await browser.close()
