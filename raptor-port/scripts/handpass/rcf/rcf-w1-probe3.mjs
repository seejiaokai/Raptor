/* rcf-w1 probe 3 — undo/redo buttons on each page, the board's warning list markup (read only except a PH add) */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
const KIND = process.argv[2] || 'desktop'
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w1/probe3-' + KIND)
console.log('rcf-w1-probe3 v1', KIND)
const X = await import('./rcf-w1-lib.mjs')
const { L, W4, sleep } = X
const w = await X.world(KIND)
const { page } = w
const ctl = () => page.evaluate(() => [...document.querySelectorAll('button, [role=button]')].filter(b => b.offsetWidth && /undo|redo|↶|↷/i.test((b.id || '') + (b.title || '') + (b.innerText || '') + (b.getAttribute('data-testid') || '') + (b.getAttribute('aria-label') || ''))).map(b => `${b.tagName}#${b.id}|tid=${b.getAttribute('data-testid')}|t=${b.title}|${b.innerText.trim()}|dis=${b.disabled}`))
console.log('edit week:', await ctl())
await L.board(page, 4)
console.log('board:', await ctl())
console.log('warn markup', await page.evaluate(() => { const s = document.querySelector('#schedBoard #sbWarn') || document.querySelector('#schedBoard #sbSide'); return s ? s.id + ' ' + s.className + ' :: ' + s.innerHTML.slice(0, 1200) : 'none' }))
await L.closeBoard(page)
await W4.lwOpen(page, '2026-07-17')
console.log('war:', await ctl())
await L.go(page, 'viewsched'); await sleep(300)
console.log('view:', await ctl())
await X.pic(page, 'view')
await w.browser.close()
