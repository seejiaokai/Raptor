// W1a probe 3: pucks' text in the Several-people picker
import * as L from './sm-lib.mjs'
console.log('sm-w1a-probe3 v1')
const W = await L.launch('pc', { origin: 'http://localhost:4391' })
await L.signIn(W)
await L.openInputsList(W)
await W.page.locator(L.T('in-new')).first().click(); await W.page.waitForSelector(L.T('win-inputedit')); await L.sleep(500)
await W.page.locator('#inpEditType').selectOption('Other'); await L.sleep(300)
await W.page.locator(L.T('pp-several')).click(); await L.sleep(700)
console.log(JSON.stringify(await W.page.evaluate(() => [...document.querySelectorAll('.pp-puck')].slice(0, 40).map(e => JSON.stringify(e.textContent) + '|' + e.className + '|' + e.getBoundingClientRect().width))))
console.log('count', await W.page.locator('.pp-puck').filter({ hasText: /^Bolt\b/ }).count(), await W.page.locator('.pp-puck').filter({ hasText: 'Bolt' }).count())
await L.closeAll(W)
