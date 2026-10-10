import { world, fileInput, pic, sleep, go, openBoard, oilOn, reanswer } from './aa-B-lib.mjs'
const w = await world('desk'); w.tag = 'p12'
const { page } = w
const f = await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', rmk: 'p12', s: '09:00', e: '12:00', oil: 'no' })
await reanswer(page, f.rec.iid, 'yes')
await openBoard(page, 5); await oilOn(page, true)
await pic(w, 'before')
const info = () => page.evaluate(() => ({ undo: (document.querySelector('#sbUndo') || {}).title, toasts: [...document.querySelectorAll('.toast, #toast, [role=status], [aria-live]')].map(e => e.innerText).filter(Boolean), oil: JSON.stringify(window.INPUTS.find(x => x.remarks === 'p12').oil), mode: document.querySelector('#sbOil').getAttribute('aria-pressed') }))
console.log('before', JSON.stringify(await info()))
await page.locator('#sbUndo').click(); await sleep(250)
console.log('just after press 1', JSON.stringify(await info())); await pic(w, 'after1')
await sleep(900)
console.log('1s after press 1', JSON.stringify(await info()))
await page.locator('#sbUndo').click(); await sleep(250)
console.log('just after press 2', JSON.stringify(await info())); await pic(w, 'after2')
await w.browser.close()
