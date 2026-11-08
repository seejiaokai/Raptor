import { newWorld, openBoard, oilOn, sleep, close, VERSION } from './oeb-w2-lib.mjs'
import { join } from 'node:path'
import { mkdirSync } from 'node:fs'
console.log(VERSION, 'explore3')
const w = await newWorld('pc', 'sat')
const D = 'C:/Users/User/AppData/Local/Temp/claude/ba46d636af5eaefe/e324d8f6-0c85-4339-be37-1d188075a056/scratchpad/ex'
mkdirSync(D, { recursive: true })
try {
  await openBoard(w)
  await oilOn(w, true)
  await w.page.evaluate(() => { const b = document.querySelector('#sbBoard'); b.scrollTop = 0 })
  await w.page.locator('#sbBoard').screenshot({ path: join(D, 'board.png') })
  const t = await w.page.evaluate(() => {
    const b = document.querySelector('#sbBoard'); const o = []
    for (const e of b.querySelectorAll('*')) { if (e.children.length > 0 && /^(H\d|DIV|SECTION|DETAILS)$/.test(e.tagName) && /(^|\s)(pn|panel|sec|grp|ph|hd|title|sbp)/.test(String(e.className))) o.push(e.className + ' y=' + Math.round(e.getBoundingClientRect().top) + ' | ' + e.textContent.trim().replace(/\s+/g, ' ').slice(0, 50)) }
    return o.slice(0, 80)
  })
  console.log(t.join('\n'))
} finally { await close(w) }
