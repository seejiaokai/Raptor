/* pdl-w1-probe3 v1 — Logic page edit mode buttons; the SIGNED strip's text */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/w1/probe')
console.log('pdl-w1-probe3 v1')
const P = await import('./pdl-w1-lib.mjs')
const { X, L, sleep } = P
const w = await X.world('desktop')
const { page } = w
await L.go(page, 'logic'); await sleep(600)
const btns = () => page.evaluate(() => [...document.querySelectorAll('#page-logic button, #lgBody button, #lgEdit, [id^=lg]')].filter(b => b.offsetWidth).map(b => b.tagName + '#' + b.id + '|' + (b.innerText || '').trim().slice(0, 25)).join(' ; '))
console.log('before edit', await btns())
await page.click('#lgEdit'); await sleep(500)
console.log('in edit', await btns())
await page.screenshot({ path: P.SHOTS + '/logic-edit.png' })
const html = await page.evaluate(() => { const e = document.querySelector('#lgEdit'); return e ? e.outerHTML.slice(0, 300) : 'no #lgEdit' })
console.log(html)
console.log(await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetWidth && /done|reset|edit/i.test(b.innerText + b.id)).map(b => b.id + '|' + b.innerText.trim() + '|' + b.className).join(' ; ')))
await w.browser.close()
