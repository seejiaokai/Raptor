import { L, T, switchTo, fresh, setDoc, placeLeave, sleep, winText, placeRange, inputsList, listRows } from './lw-m3-walk-b-h.mjs'
const size = process.argv[2] || 'desk'
const w = await fresh(size, 'admin')
await w.page.evaluate(() => window.go('inputs')); await sleep(w, 1000)
const title = () => w.page.evaluate(() => (document.querySelector('#page-inputs .ib-top')?.innerText || '').replace(/\s+/g, ' '))
for (let i = 0; i < 14 && !/JANUARY 2026/i.test(await title()); i++) { await L.press(w, '#icPrev'); await sleep(w, 250) }
console.log(await title())
await L.shot(w, 'explore-cal-jan-' + size)
const bars = () => w.page.evaluate(() => [...document.querySelectorAll('#page-inputs .ib-grid [class*=bar], .ib-grid [class*=chip]')].filter(e => e.getBoundingClientRect().width > 0 && e.innerText.trim() && !e.classList.contains('ib-week') && !e.classList.contains('ib-cells')).map(e => e.className.split(' ').slice(0, 2).join('.') + '|' + e.innerText.replace(/\s+/g, ' ').slice(0, 30)))
console.log((await bars()).slice(0, 40).join('\n'))
await L.closeBrowser()
