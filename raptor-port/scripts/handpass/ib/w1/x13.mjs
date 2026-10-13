import * as L from './ibl.mjs'
const size = process.argv[2] || 'desktop'
const b = await L.launch()
const s = await L.session(b, size), { page } = s
const r = await L.route(s)
await page.reload()
await page.waitForSelector('#luser', { state: 'visible', timeout: 8000 })
await page.fill('#luser', 'us'); await page.fill('#lpass', 'us')
await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(500)
for (const pg of ['viewsched', 'editsched']) {
  await page.evaluate(p => window.go(p), pg); await page.waitForTimeout(800)
  console.log(pg, 'CURPAGE', await page.evaluate(() => window.CURPAGE), 'sbday count', await page.locator('[data-sbday]').count(), 'visible', await page.locator('[data-sbday]:visible').count())
  console.log('  roots', await page.evaluate(() => ['#vWeek', '#eWeek', '#schedBoard', '#sbBoard'].map(s => s + ':' + (document.querySelector(s) ? 'y' : 'n')).join(' ')))
  const info = await page.evaluate(d => [...document.querySelectorAll(`[data-sbday="${d}"]`)].map(e => e.tagName + '#' + e.id + '.' + e.className + ' in ' + (e.closest('#vWeek,#eWeek') || {}).id), 4)
  console.log('  fri sbday', JSON.stringify(info))
  const h = page.locator(`[data-sbday="4"]`).first()
  if (await h.count()) { await h.evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() }); await page.waitForTimeout(700) }
  console.log('  after click: board', await page.locator('#sbBoard .sb-sec').count(), 'pinp', await page.locator('#schedBoard .pinp').count(), 'text has ACCEPT/UNDO:', await page.evaluate(() => /ACCEPT|UNDO/.test(document.body.innerText)))
  console.log('  pinp text', await page.evaluate(() => { const e = document.querySelector('.pinp'); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 300) : null }))
  console.log(await L.shot(s, `x13-${size}-${pg}`))
}
await b.close()
