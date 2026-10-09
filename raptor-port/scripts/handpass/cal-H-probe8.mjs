import * as H from './cal-H-lib.mjs'
H.setTag('p8')
const { browser, ctx, page, errors } = await H.world({})
await H.toEdit(page); await H.showDay(page, 1)
await page.click('#exportPdf'); await H.sleep(1500)
const fr = page.frames().filter(f => f !== page.mainFrame())
console.log('frames', fr.length)
for (const f of fr) {
  const t = await f.evaluate(() => (document.body ? document.body.innerText : '')).catch(e => 'err ' + e.message)
  console.log('print len', t.length)
  console.log(t.slice(0, 1500).split('\n').join(' | '))
  console.log('Unavailable', /UNAVAILABLE|Unavailable/.test(t), 'MEETING', /MEETING|Meeting/.test(t), 'Placed', /Placed/.test(t), 'Nomad', /Nomad/.test(t))
}
console.log(errors)
await browser.close()
