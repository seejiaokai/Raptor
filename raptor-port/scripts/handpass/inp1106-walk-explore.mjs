console.log('[inp1106-walk-explore v3]')
import { open, sleep } from './inp1106-walk-lib.mjs'
const size = process.argv[2] || 'desk'
const { br, p, shot, press, phone } = await open(size)
await p.click('#inCalBtn'); await sleep(800)
console.log('cal buttons:', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#page-inputs button, #page-inputs [data-testid]')].filter(e => e.offsetWidth && !e.closest('.floatwin')).map(e => (e.id || '') + '|' + (e.dataset.testid || '') + '|' + (e.getAttribute('aria-label') || '') + '|' + e.textContent.trim().slice(0, 14)).slice(0, 60))))
console.log('heading:', await p.evaluate(() => document.querySelector('#page-inputs').innerText.slice(0, 200).replace(/\s+/g, ' ')))
await p.click('#inpCal [data-icday="2026-07-14"]', { position: { x: 10, y: 10 } }).catch(e => console.log('day click fail', e.message.slice(0, 100)))
await sleep(700)
await shot('x-day')
console.log('day win:', JSON.stringify(await p.evaluate(() => { const w = document.querySelector('[data-testid=win-inputsday]'); return [...w.querySelectorAll('*')].filter(e => e.offsetWidth && (e.dataset.iid || /card|icd/.test(e.className + e.dataset.testid))).slice(0, 12).map(e => e.tagName + '.' + e.className + ' ' + JSON.stringify(e.dataset) + ' ' + e.textContent.slice(0, 40)) })))
await br.close()
