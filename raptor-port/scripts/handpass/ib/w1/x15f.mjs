import * as L from './ibl.mjs'
const b = await L.launch()
const s = await L.session(b, 'phone'), { page } = s
const iid = await L.fileIt(s, L.WED, { type: 'Training', people: ['bane'], from: '09:00', to: '12:00', title: 'Range brief' })
await L.openBoard(s, L.WED_DI)
const tab = page.locator('.ros-tab:visible').first(); await tab.tap(); await page.waitForTimeout(700)
const pk = page.locator('#sbRoster .puck[data-person="nick"]').first()
await pk.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(400)
await pk.tap(); await page.waitForTimeout(600)
console.log('state after puck tap', await page.evaluate(() => JSON.stringify({ sel: [...document.querySelectorAll('.sel,.armed,.on')].slice(0, 4).map(e => e.className), drawerOpen: document.querySelector('#sbSide')?.className })))
await tab.tap().catch(() => {}); await page.waitForTimeout(600)
const ppl = page.locator('#sbBoard [data-fill="g:2.2.+"]').first()
await ppl.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300)
const bx = await ppl.boundingBox(); console.log('ppl box', JSON.stringify(bx), await ppl.evaluate(e => e.className))
for (const [label, fn] of [['ppl.tap', () => ppl.tap({ position: { x: bx.width - 20, y: bx.height / 2 } })]]) {
  try { await fn() } catch (e) { console.log(label, 'ERR', e.message.split('\n')[0]) }
  await page.waitForTimeout(600)
  console.log(label, JSON.stringify(await page.evaluate(d => window.DAYS[d].ground[2].who + '+' + (window.DAYS[d].ground[2].more || []).join(','), 2)))
}
console.log(await L.shot(s, 'x15f'))
await b.close()
