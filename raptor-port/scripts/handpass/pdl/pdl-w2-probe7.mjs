/* pdl-w2-probe7 v1 — the Logic page on a phone: edit, done, reset controls */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/w2/probe7')
console.log('pdl-w2-probe7 v1')
const P = await import('./pdl-w2-lib.mjs')
const { X, L, sleep } = P
const w = await X.world('phone')
const { page } = w
await L.go(page, 'logic'); await sleep(700)
await page.screenshot({ path: process.env.HP_SHOTS + '/logic-0.png' })
const btns = () => page.evaluate(() => [...document.querySelectorAll('#pgLogic button, #lgBody button, #lgEdit, .lg-head button, button')].filter(b => b.offsetWidth).map(b => (b.id || '') + '|' + b.innerText.trim().replace(/\s+/g, ' ').slice(0, 30) + '|' + [...b.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(';')).filter((v, i, a) => a.indexOf(v) === i))
console.log('before edit', JSON.stringify(await btns()))
await X.press(w, '#lgEdit', { scope: 'page', after: 'logic-1-tap-edit' })
await sleep(500)
await page.screenshot({ path: process.env.HP_SHOTS + '/logic-1.png' })
console.log('after edit', JSON.stringify(await btns()))
await w.browser.close()
