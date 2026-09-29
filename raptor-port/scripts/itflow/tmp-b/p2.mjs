import { browser, fresh, go, shot, box, errors } from './lib.mjs'
const page = await fresh()
await go(page, 'editsched')
console.log(await page.$$eval('#eWeek [data-sbday]', a => a.map(e => { const b = e.getBoundingClientRect(); return `${e.tagName}.${e.className} sbday=${e.dataset.sbday} "${(e.innerText||e.title||'').replace(/\s+/g,' ').slice(0,50)}" title="${e.title}" @${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.width)}x${Math.round(b.height)}` })))
await page.click('#eWeek [data-sbday="0"]:visible')
await page.waitForSelector('#schedBoard'); await page.waitForTimeout(800)
await shot(page, 'p2-board')
const info = await page.evaluate(() => {
  const vis = e => !!(e.offsetWidth || e.offsetHeight)
  return [...document.querySelectorAll('#schedBoard button, #schedBoard select')].filter(vis).map(e => {
    const b = e.getBoundingClientRect()
    return `${e.tagName}#${e.id}.${String(e.className).slice(0,30)} [${[...e.attributes].filter(a=>a.name.startsWith('data-')).map(a=>a.name+'='+a.value).join(' ')}] "${(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,30)}" t="${(e.title||'').slice(0,50)}" @${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.width)}x${Math.round(b.height)}`
  })
})
console.log(info.join('\n'))
console.log(errors)
await browser.close()
