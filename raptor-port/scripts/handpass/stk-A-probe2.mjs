import { world, L, W, pic } from './wh-lib.mjs'
const { browser, p, errors } = await world()
await L.go(p, 'logic')
await p.locator('#lgEdit').click(); await L.sleep(500)
const lg = await p.evaluate(() => ({
  editTxt: (document.querySelector('#lgEdit') || {}).innerText,
  inputs: [...document.querySelectorAll('#page-logic input, #page-logic select, #page-logic textarea')].map(e => `${e.tagName}#${e.id}.${e.className} ${[...e.attributes].map(a => a.name + '=' + a.value).join(' ').slice(0, 120)} v=${e.value}`).filter(s => /report|Lead|Text|mix/i.test(s)).slice(0, 60),
}))
console.log(JSON.stringify(lg, null, 1))
await p.locator('#lgSearch').fill('report'); await L.sleep(500)
await pic(p, 'probe-logic-report')
// Insights on the week
await L.go(p, 'editsched')
console.log(await p.evaluate(() => [...document.querySelectorAll('#page-editsched button, #page-editsched [id]')].filter(e => /insight/i.test(e.id + e.innerText + e.title)).map(e => e.tagName + '#' + e.id + ' ' + e.innerText.slice(0, 30)).join(' | ')))
console.log(errors)
await browser.close()
