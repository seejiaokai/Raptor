/* probe: what the Tracker's ball press opens (its element), and where Tab / Escape / Enter take focus */
import * as R from './stk2-P-run.mjs'
const { newWorld, closeWorld, nav, sleep, pic } = R
const page = await newWorld({})
await nav(page, 'tracker'); await sleep(1200)
const bb = await page.getByText('ST-01', { exact: true }).first().boundingBox(); await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(900)
const pop = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(e => /Edit details/.test(e.innerText) && e.getBoundingClientRect().width > 0); let n = b; const chain = []; while (n && n !== document.body) { chain.push((n.id ? '#' + n.id : '') + '.' + String(n.className).slice(0, 30) + ':' + n.tagName); n = n.parentElement } return chain.slice(0, 6) })
console.log('popup chain', JSON.stringify(pop))
const f = async () => page.evaluate(() => { const e = document.activeElement; return e ? e.tagName + (e.id ? '#' + e.id : '') + '.' + String(e.className).slice(0, 20) + ' "' + (e.innerText || '').trim().slice(0, 20) + '"' : null })
const seq = []
seq.push('start ' + await f())
for (let i = 0; i < 8; i++) { await page.keyboard.press('Tab'); await sleep(60); seq.push(await f()) }
console.log(JSON.stringify(seq, null, 1))
const open = async () => page.evaluate(() => !![...document.querySelectorAll('button')].find(e => /Edit details/.test(e.innerText) && e.getBoundingClientRect().width > 0))
console.log('popup still open after tabs', await open())
await pic(page, 'probe16-after-tabs')
await page.keyboard.press('Escape'); await sleep(400)
console.log('popup open after Escape', await open())
await closeWorld()
