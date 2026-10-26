import { L, snap } from './h.mjs'
import fs from 'node:fs'
console.log('c4 v1')
const { browser, ctx, page, errors } = await L.open({ width: 1100, height: 900, state: 'C:/Users/User/AppData/Local/Temp/claude/job3/walk/state-pub.json' })
const p2 = await ctx.newPage(); await p2.setViewportSize({ width: 1100, height: 900 })
await p2.setContent(fs.readFileSync('C:/Users/User/AppData/Local/Temp/claude/job3/walk/print.html', 'utf8'))
await p2.emulateMedia({ media: 'print' })
const struct = await p2.evaluate(() => { const t = [...document.querySelectorAll('table')]; return t.map(x => x.className + ' | ' + x.previousElementSibling?.innerText?.slice(0,30) + ' | rows ' + x.querySelectorAll('tbody tr').length) })
console.log(struct.join('\n'))
console.log(await p2.evaluate(() => { const t = [...document.querySelectorAll('table')].pop(); return t.outerHTML.slice(0, 1800) }))
await browser.close()
