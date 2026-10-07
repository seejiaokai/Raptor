import * as K from './stk2-S-lib.mjs'
const { L, W, H } = K
const { browser, p, errors } = await H.world({ who: 'a', phone: false })
await W.boardOn(p, 0)
const info = await p.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  const cx = [...b.querySelectorAll('button')].filter(e => /^CX$/.test(e.innerText.trim())).map(e => ({ cls: e.className, attrs: [...e.attributes].map(a => a.name + '=' + a.value).join(' '), vis: e.offsetParent !== null }))
  const sort = document.querySelector('#sbSortAll')
  const cs = [...b.querySelectorAll('[data-txt$=".cs"],[data-bfld$=".cs"]')].slice(0, 6).map(e => ({ t: e.tagName, k: e.dataset.txt || e.dataset.bfld, vis: e.offsetParent !== null, txt: (e.innerText || e.value || '').slice(0, 10) }))
  return { cx, sort: sort && sort.outerHTML.slice(0, 200), cs, tops: [...document.querySelectorAll('#schedBoard .sbtop button, #schedBoard .topbar button')].map(e => e.id + ':' + e.innerText.trim()).slice(0, 20) }
})
console.log(JSON.stringify(info, null, 1))
await K.pic(p, 'probe2')
await browser.close()
