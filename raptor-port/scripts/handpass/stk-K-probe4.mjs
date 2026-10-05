import * as K from './stk-K-lib.mjs'
const { L, W, H } = K
const { browser, p, errors } = await H.world({ who: 'a', phone: false })
await L.go(p, 'editsched')
await p.waitForSelector('#eWeek .day[data-day="1"]')
const h = p.locator('#eWeek .day[data-day="1"]').getByText('Personal Inputs', { exact: true }).first()
await h.scrollIntoViewIfNeeded()
console.log('head box', JSON.stringify(await h.boundingBox()), await h.evaluate(e => e.outerHTML.slice(0, 300) + ' || parent: ' + e.parentElement.outerHTML.slice(0, 500)))
await H.pic(p, 'probe-pi-before')
await h.click(); await L.sleep(500)
const info = await p.evaluate(() => {
  const iid = window.INPUTS.find(x => x.person === 'salsa' && x.type === 'Appointment').iid
  return [...document.querySelectorAll('#eWeek *')].filter(e => [...e.attributes].some(a => a.value.includes(iid))).map(e => e.tagName + ' ' + [...e.attributes].filter(a => a.value.includes(iid)).map(a => a.name + '=' + a.value).join(' ') + ' day' + (e.closest('.day') || { dataset: {} }).dataset.day)
})
console.log(info)
await H.pic(p, 'probe-pi-after')
await browser.close()
