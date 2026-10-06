import * as C from './rbl-C-lib.mjs'
const { B, L, W, K, ID, MON, TUE } = C
const { browser, p, errors } = await K.fresh()
const dumpModal = async () => p.evaluate(() => { const els = [...document.querySelectorAll('button, input, select, textarea')].filter(e => e.offsetParent !== null && e.closest('[role=dialog], .modal-box, .modal, .wvsheet, .wteditor')); return els.slice(0, 70).map(e => e.tagName + '|' + e.id + '|' + [...e.attributes].filter(a => a.name.startsWith('data-') || a.name === 'placeholder' || a.name === 'aria-label').map(a => a.name + '=' + a.value).join(',') + '|' + (e.value || e.innerText || '').replace(/\s+/g, ' ').slice(0, 40)) })
try {
  await K.boardTo(p, TUE)
  const b = p.locator(`#schedBoard [data-wvadd="${TUE}"]`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await C.sleep(400)
  await p.locator('.wavemenu [data-wvedit]').first().click(); await C.sleep(600)
  await p.locator('button:has-text("+ New wave template")').first().click(); await C.sleep(700)
  await B.pic(p, 'p9-editor')
  console.log((await dumpModal()).join('\n'))
  console.log('ERR', errors.join(' | '))
} catch (e) { console.log('ERR', e.stack) }
await browser.close()
