import { open, go, version } from './kbs-A-lib.mjs'
version('explore3c')
const { browser, page } = await open()
await go(page, 'editsched')
console.log(await page.evaluate(() => { let e = document.elementFromPoint(287, 350); const out = []; for (let i = 0; e && i < 6; i++, e = e.parentElement) out.push(`${e.tagName}.${String(e.className).slice(0,40)}#${e.id} ${JSON.stringify([...e.attributes].filter(a=>a.name.startsWith('data')).map(a=>a.name+'='+a.value).slice(0,4))}`); return out }))
await browser.close()
