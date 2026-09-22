import { open, go } from './lib.mjs'
const { browser, page } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json' })
await go(page, 'inputs')
console.log(JSON.stringify(await page.evaluate(() => ({
  addControls: [...document.querySelectorAll('button,a')].filter(e => e.offsetParent && /add|new|\+/i.test(e.innerText || ''))
    .map(e => ({ txt: (e.innerText || '').trim().slice(0, 24), id: e.id, attrs: [...e.attributes].map(a => a.name + '=' + a.value).filter(a => /data-/.test(a)).join(' ') })).slice(0, 12),
  heading: (document.querySelector('h1,h2,.pg-h') || {}).innerText?.slice(0, 60),
})), null, 1))
await browser.close()
