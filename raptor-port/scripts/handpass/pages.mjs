import { open } from './lib.mjs'
const { browser, page } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json' })
console.log(JSON.stringify(await page.evaluate(() => {
  const nav = [...document.querySelectorAll('nav a, nav button, .nav a, .nav button, [data-page], #topnav *')]
    .filter(e => e.offsetParent && (e.innerText || '').trim())
    .map(e => ({ txt: (e.innerText || '').trim().slice(0, 22), page: e.getAttribute('data-page'), id: e.id, cls: (e.className||'').toString().slice(0,24) }))
  return { nav: nav.slice(0, 30), CURPAGE: window.CURPAGE }
}), null, 1))
await browser.close()
