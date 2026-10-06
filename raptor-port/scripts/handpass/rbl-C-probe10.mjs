import * as C from './rbl-C-lib.mjs'
const { B, L, W, K, ID, MON, TUE } = C
const { browser, p, errors } = await K.fresh()
const vis = async (sel) => p.evaluate(s => [...document.querySelectorAll(s)].filter(e => e.offsetParent !== null).slice(0, 40).map(e => e.tagName + '|' + e.id + '|' + [...e.attributes].filter(a => a.name.startsWith('data-') || a.name === 'placeholder' || a.name === 'aria-label').map(a => a.name + '=' + a.value).join(',') + '|' + (e.value || e.innerText || '').replace(/\s+/g, ' ').slice(0, 50)), sel)
try {
  const { m, t } = await C.baselineB(p)
  await K.boardTo(p, TUE)
  await p.locator('#schedBoard #sbTpl').click(); await C.sleep(400)
  await p.getByText('Save this day as a template').first().click(); await C.sleep(600)
  await B.pic(p, 'p10-save-day-tpl')
  console.log((await vis('button, input, select, textarea')).filter(x => !x.startsWith('BUTTON|undoBtn')).slice(0, 30).join('\n'))
  console.log('ERR', errors.join(' | '))
} catch (e) { console.log('ERR', e.stack) }
await browser.close()
