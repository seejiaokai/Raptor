import { newWorld, openBoard, oilOn, sleep, close, shot, VERSION } from './oeb-w2-lib.mjs'
console.log(VERSION, 'explore7 cx')
const w = await newWorld('pc', 'sat')
try {
  await openBoard(w)
  const b = w.page.locator('[data-grcx="5.0"]').first(); await b.scrollIntoViewIfNeeded(); await b.click(); await sleep(700)
  await shot(w, 'zz-explore-cx')
  console.log(await w.page.evaluate(() => [...document.querySelectorAll('.floatwin, [role=dialog], .qcard, .confirm, .modal')].map(e => e.className + ' | ' + e.innerText.slice(0, 200))))
  console.log(await w.page.evaluate(() => { const e = document.elementFromPoint(window.innerWidth / 2, 70); return e && e.tagName + '.' + e.className }))
} finally { await close(w) }
