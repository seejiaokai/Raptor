import { world, fileInput, pic, sleep, tid, go, openBoard, dump, openNew, inputsMonth } from './aa-B-lib.mjs'
const w = await world('desk', 'ad')
const { page } = w
w.tag = 'p6'
const r = await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', rmk: 'p6w', s: '09:00', e: '12:00', oil: 'yes' })
await go(page, 'inputs')
await page.locator('#inListBtn').click(); await sleep(600)
await pic(w, 'list')
console.log(JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('tr')].filter(t => /p6w/.test(t.innerText)).map(t => t.outerHTML.slice(0, 2500)))))
console.log(JSON.stringify(await page.evaluate(() => ({ n: document.querySelectorAll('tr').length, f: document.querySelector('#inFPerson') && document.querySelector('#inFPerson').value, range: (document.querySelector('#inEmpty') || {}).innerText }))))
await w.browser.close()
