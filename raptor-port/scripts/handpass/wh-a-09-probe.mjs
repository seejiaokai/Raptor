/* [WARN-HIDE-KEPT] walker A — probe 9 (own world, nothing recorded): what the board's "+ Wave" and "+ Block" menus offer. */
import { world, L, W } from './wh-a-lib.mjs'
const { browser, p } = await world(); p.setDefaultTimeout(5000)
try {
  await L.go(p, 'editsched'); await W.boardOn(p, 1)
  await p.locator('#schedBoard [data-wvadd="1"]').first().click(); await L.sleep(400)
  console.log('+ Wave offers:', await p.evaluate(() => [...document.querySelectorAll('.wavemenu button')].filter(e => e.offsetParent !== null).map(b => b.innerText.replace(/\s+/g, ' ').trim()).join(' | ')))
  await p.keyboard.press('Escape'); await p.mouse.click(400, 880); await L.sleep(300)
  const b = p.locator('#schedBoard [data-dwadd="1"]').first(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200); await b.click(); await L.sleep(400)
  console.log('+ Block offers:', await p.evaluate(() => [...document.querySelectorAll('.wavemenu button')].filter(e => e.offsetParent !== null).map(b => b.innerText.replace(/\s+/g, ' ').trim()).join(' | ')))
} catch (e) { console.log('PROBE ERROR', String(e).split('\n')[0]) }
await browser.close()
