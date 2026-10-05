import * as H from './wh-b-lib.mjs'
const { L, W } = H
const { browser, p, errors } = await H.world()
try {
  await H.toEdit(p)
  await W.boardOn(p, 1)
  const b = p.locator('#schedBoard [data-wvadd="1"]').first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await L.sleep(400)
  console.log('MENU', await p.evaluate(() => [...document.querySelectorAll('.wavemenu button')].map(x => x.outerHTML.slice(0, 160))))
  await H.pic(p, 'probe-menu')
  console.log('errors', errors)
} finally { await browser.close() }
