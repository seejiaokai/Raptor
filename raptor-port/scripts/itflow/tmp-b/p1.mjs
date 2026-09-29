import { browser, fresh, go, shot, box, errors } from './lib.mjs'
const page = await fresh()
await go(page, 'editsched')
await shot(page, 'p1-edit-full')
const info = await page.evaluate(() => {
  const vis = e => !!(e.offsetWidth || e.offsetHeight)
  return [...document.querySelectorAll('button, [role=button], .pk, .puck')].filter(vis).slice(0, 150).map(e => {
    const b = e.getBoundingClientRect()
    return `${e.tagName}#${e.id}.${String(e.className).slice(0,40)} [${[...e.attributes].filter(a=>a.name.startsWith('data-')).map(a=>a.name+'='+a.value).join(' ')}] "${(e.innerText||e.title||'').replace(/\s+/g,' ').trim().slice(0,40)}" @${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.width)}x${Math.round(b.height)}`
  })
})
console.log(info.join('\n'))
console.log(errors)
await browser.close()
