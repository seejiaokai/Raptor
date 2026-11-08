import { newWorld, openBoard, oilOn, sleep, close, shot, VERSION } from './oeb-w2-lib.mjs'
console.log(VERSION, 'explore2')
const w = await newWorld(process.env.SIZE || 'pc', 'sat')
try {
  await openBoard(w)
  await oilOn(w, true)
  const t = await w.page.evaluate(() => {
    const b = document.querySelector('#schedBoard')
    // children structure: ids and classes of descendants with an id or a data-panel
    const out = []
    for (const e of b.querySelectorAll('[id],[data-sbsec],[data-panel],.sbsec,.sb-sec,section,details,summary,h2,h3,h4')) {
      const r = e.getBoundingClientRect()
      out.push((e.tagName + '#' + e.id + '.' + String(e.className).replace(/\s+/g, '.') + ' h=' + Math.round(r.height) + ' y=' + Math.round(r.top) + ' | ' + e.textContent.trim().replace(/\s+/g, ' ').slice(0, 40)))
    }
    return out
  })
  console.log(t.join('\n'))
  console.log(w.errors)
} finally { await close(w) }
