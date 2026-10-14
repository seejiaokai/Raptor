import { L, sleep } from './w2lib.mjs'
console.log('explore-quals3 v1')
const w = await L.world('desk')
const p = w.page
try {
  await L.go(w, 'quals')
  await p.click('#qViewA').catch(() => {})
  await p.click('#qEdit'); await sleep(500)
  console.log(await p.evaluate(() => [...document.querySelectorAll('#page-quals th')].slice(4, 8).map(t => t.outerHTML.slice(0, 400)).join('\n')))
  console.log(await p.evaluate(() => [...document.querySelectorAll('#page-quals [data-qdel], #page-quals [data-delq], #page-quals [data-qrm], #page-quals .qdel, #page-quals th button')].map(t => t.outerHTML.slice(0, 200)).slice(0, 6).join('\n')))
} finally { await L.close(w) }
