import * as C from './ows-C-lib.mjs'
const { S, L, W, world, pic, sleep } = C
const { browser, p, errors } = await world()
await L.go(p, 'admin'); await sleep(600)
const sw = p.locator('#admGuestView'); if (!(await sw.isChecked())) { await sw.check(); await sleep(400) }
await p.locator('button', { hasText: /^Logout$/ }).first().click(); await sleep(800)
await p.fill('#luser', 'walkerguest'); await p.fill('#lpass', 'x'); await p.click('#loginForm button[type=submit]'); await sleep(1200)
console.log('FORM', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('input,select,button,textarea')].filter(e => e.offsetParent !== null).map(e => e.tagName + '#' + e.id + '[' + (e.name || '') + '|' + (e.placeholder || '') + '|' + (e.innerText || '').slice(0, 30) + ']'))))
await browser.close()
