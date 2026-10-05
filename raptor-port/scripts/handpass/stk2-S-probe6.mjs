import * as X from './stk2-Q-fx.mjs'
import * as F from './stk2-Q-flib.mjs'
import * as K from './stk2-S-lib.mjs'
const { sleep } = F
const { browser, p, errors } = await F.open('desk', 'a')
await X.tracking(p, true)
await X.board(p, 4)
await sleep(400)
const b = p.locator('#schedBoard [data-wvadd="4"]').first()
await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(500)
await p.locator('[data-wvedit="1"]').first().click(); await sleep(700)
await p.getByRole('button', { name: '+ New wave template' }).first().click(); await sleep(800)
const dom = await p.evaluate(() => {
  const els = [...document.querySelectorAll('button,input,textarea,select,[contenteditable]')].filter(e => e.getBoundingClientRect().width > 0 && !e.closest('#schedBoard') && !e.closest('.topbar'))
  return els.map(e => e.tagName + '|' + (e.innerText || e.value || '').trim().slice(0, 24) + '|' + [...e.attributes].filter(a => a.name !== 'style' && a.name !== 'class').map(a => a.name + '=' + a.value).join(' ').slice(0, 120))
})
console.log(JSON.stringify(dom, null, 1))
await K.pic(p, 'probe6-editor2')
await browser.close()
