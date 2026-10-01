import * as S from './ins-s-lib2.mjs'
const { B, L, W } = S
const { browser, p, errors } = await B.world()
try {
  await L.go(p, 'leavewar'); await S.sleep(900)
  const ob = p.locator('#page-leavewar button', { hasText: /OIL tracker/i }).first()
  console.log('btn', await ob.count())
  const before = await p.evaluate(() => document.body.innerText.length)
  await ob.click(); await S.sleep(900)
  const info = await p.evaluate(() => { const c = [...document.querySelectorAll('[class*=sheet], [class*=Sheet], [class*=oil], [role=dialog], dialog')].filter(e => e.offsetParent !== null).map(e => e.className.toString().slice(0, 40) + ' :: ' + e.innerText.replace(/\s+/g, ' ').slice(0, 160)); return { len: document.body.innerText.length, c: c.slice(0, 8) } })
  console.log(before, JSON.stringify(info, null, 1))
  await B.pic(p, 'probe10-oil')
} catch (e) { console.log('ERR', e.stack) }
await browser.close()
