import * as C from './rbl-C-lib.mjs'
const { B, L, W, K, ID, MON, TUE } = C
const { browser, p, errors } = await K.fresh()
const vis = async (sel) => p.evaluate(s => [...document.querySelectorAll(s)].filter(e => e.offsetParent !== null).slice(0, 60).map(e => e.tagName + '|' + e.id + '|' + e.className.toString().slice(0, 30) + '|' + [...e.attributes].filter(a => a.name.startsWith('data-') || a.name === 'placeholder' || a.name === 'aria-label').map(a => a.name + '=' + a.value).join(',') + '|' + (e.value || e.innerText || '').replace(/\s+/g, ' ').slice(0, 60)), sel)
try {
  const { m, t } = await C.baselineB(p)
  await K.boardTo(p, TUE)
  await p.locator('#schedBoard #sbTpl').click(); await C.sleep(400)
  await p.getByText('Save this day as a template').first().click(); await C.sleep(600)
  await p.getByRole('button', { name: 'Done' }).last().click().catch(() => {}); await C.sleep(400)
  await W.boardOff(p)
  await K.boardTo(p, 2)
  await p.locator('#schedBoard #sbTpl').click(); await C.sleep(500)
  await B.pic(p, 'p11-wed-templates-menu')
  console.log((await vis('.tplmenu *, .sb-tplpop *, [class*=tpl] button, [data-dtplapply], [data-dtpl]')).join('\n'))
  console.log('ERR', errors.join(' | '))
} catch (e) { console.log('ERR', e.stack) }
await browser.close()
