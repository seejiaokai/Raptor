import { L, openBoard, sleep } from './w2lib.mjs'
console.log('explore-fields v1')
const w = await L.world('desk')
const p = w.page
try {
  await openBoard(w, 1)
  console.log(await p.evaluate(() => [...document.querySelectorAll('#schedBoard input, #schedBoard textarea, #schedBoard [data-slot]')].filter(e => e.getBoundingClientRect().width > 0).slice(0, 60).map(e => `${e.tagName}|${[...e.attributes].filter(a => /^data-/.test(a.name)).map(a => a.name + '=' + a.value).join(',')}|${(e.value || e.textContent || '').trim().slice(0, 20)}`).join('\n')))
} finally { await L.close(w) }
