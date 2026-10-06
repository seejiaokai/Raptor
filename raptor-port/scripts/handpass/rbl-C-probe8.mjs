import * as C from './rbl-C-lib.mjs'
const { B, L, W, K, ID, MON, TUE } = C
const { browser, p, errors } = await K.fresh()
try {
  await K.boardTo(p, TUE)
  const tb = p.locator('#schedBoard button:has-text("Templates"):visible').first()
  console.log('templates btn', await tb.count(), await tb.evaluate(e => e.id + '|' + e.className + '|' + (e.getAttribute('data-tpl') || '')))
  await tb.click(); await C.sleep(500)
  await B.pic(p, 'p8-templates-menu')
  const menu = await p.evaluate(() => { const els = [...document.querySelectorAll('[data-tplact], [data-dtpl], .tplmenu button, .tplpop button, .menu button')].filter(e => e.offsetParent !== null); return els.map(e => (e.id || '') + '|' + e.className + '|' + [...e.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',') + '|' + e.innerText.replace(/\s+/g, ' ').slice(0, 50)) })
  console.log('MENU', menu.join('\n'))
  await p.keyboard.press('Escape'); await C.sleep(300)
  const b = p.locator(`#schedBoard [data-wvadd="${TUE}"]`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await C.sleep(400)
  await B.pic(p, 'p8-wave-menu')
  const wm = await p.evaluate(() => [...document.querySelectorAll('.wavemenu button')].map(e => [...e.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',') + '|' + e.innerText.replace(/\s+/g, ' ').slice(0, 40)))
  console.log('WAVEMENU', wm.join('\n'))
  await p.locator('.wavemenu [data-wvedit]').first().click(); await C.sleep(600)
  await B.pic(p, 'p8-wave-sheet')
  const sh = await p.evaluate(() => { const els = [...document.querySelectorAll('.modal:not([hidden]) button, .modal:not([hidden]) input, .modal:not([hidden]) select, .wvsheet button, .wvsheet input')].filter(e => e.offsetParent !== null); return els.slice(0, 60).map(e => e.tagName + '|' + e.id + '|' + [...e.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',') + '|' + (e.value || e.innerText || '').replace(/\s+/g, ' ').slice(0, 40)) })
  console.log('SHEET', sh.join('\n'))
  console.log('ERR', errors.join(' | '))
} catch (e) { console.log('ERR', e.stack) }
await browser.close()
