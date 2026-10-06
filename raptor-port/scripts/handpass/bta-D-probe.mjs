import * as D from './bta-D-lib.mjs'
const { B, K, C, W, L, TUE, sleep } = D
const { browser, p, errors } = await K.fresh()
async function dump(tag) {
  const r = await p.evaluate(() => {
    const els = [...document.querySelectorAll('.dtpop, .tplpop, .wavemenu, .modal:not([hidden]), [role=dialog], .win:not([hidden]), .dpop')].filter(e => e.offsetParent !== null)
    return els.map(e => ({ cls: String(e.className).slice(0, 40), text: e.innerText.replace(/\s+/g, ' ').slice(0, 300), inputs: [...e.querySelectorAll('input')].map(i => i.id + '|' + i.placeholder), btns: [...e.querySelectorAll('button')].map(b => Object.keys(b.dataset).join(',') + '|' + b.innerText.trim().slice(0, 30)).slice(0, 20) }))
  })
  console.log(tag, JSON.stringify(r, null, 1))
}
try {
  const s = await D.seatBlank(p)
  await B.toEdit(p); await W.showDay(p, TUE)
  await p.locator(`#eWeek .day[data-day="${TUE}"] button`, { hasText: 'Templates' }).first().click(); await sleep(600)
  await dump('menu')
  await p.locator('button', { hasText: 'Save this day as a template' }).first().click(); await sleep(700)
  await dump('after-save-click')
  await B.pic(p, 'probe-tpl-save')
  console.log('toast', await p.evaluate(() => (document.getElementById('toastEl') || {}).textContent))
} catch (e) { console.log(String(e.stack || e)) }
await browser.close()
