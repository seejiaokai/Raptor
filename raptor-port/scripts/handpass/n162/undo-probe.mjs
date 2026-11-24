// probe: how Hunter's row is drawn on Admin → Users (read only)
import { newPage, signIn, users, closeAll } from './undo-lib.mjs'
const s = await newPage(process.argv[2] || 'd')
await signIn(s, 'ad', 'a'); await users(s)
const r = await s.page.evaluate(() => [...document.querySelectorAll('[data-person="prowler"]')].map(e => { const b = e.getBoundingClientRect(); return { tag: e.tagName, cls: e.className, box: [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)], text: e.innerText.slice(0, 200), html: e.outerHTML.slice(0, 600) } }))
console.log(JSON.stringify(r, null, 1))
await closeAll()
