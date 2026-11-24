// THE WALK OF ROUND 4 — two marked pictures for his question "how do I get to Weeks ahead" (chat 170): the Inputs page on
// a phone as Saber, the date button ringed; then its window, the pencil ringed. Reads only; nothing is saved.
//   WR4_NEW=D:/rw4/build-new3 node scripts/handpass/wr4-host-lookahead.mjs
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('wr4-host-lookahead v1')
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.WR4_OUT ||= join(HERE, '../../docs/img/handpass/2026-11-24-words-r4-walk/host-lookahead')
const L = await import('./wr4-lib.mjs')
const { newPage, signIn, go, press, sleep, OUT } = L
const w = await newPage('phone'); await signIn(w, 'ad')
await go(w.page, 'inputs')
if (await w.page.locator('#inListBtn').count()) await press(w, '#inListBtn')
const ring = sel => w.page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; e.style.outline = '3px solid #ff3b30'; e.style.outlineOffset = '3px'; const r = e.getBoundingClientRect(); return { text: (e.textContent || e.getAttribute('aria-label') || e.title || '').replace(/\s+/g, ' ').trim(), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } }, sel)
await w.page.evaluate(() => scrollTo(0, 0)); await sleep(300)
console.log('the date button:', JSON.stringify(await ring('#inRangeBtn')))
await w.page.screenshot({ path: join(OUT, '1-inputs-date-button-phone.png'), clip: { x: 0, y: 0, width: 402, height: 420 } })
await w.page.evaluate(() => { document.querySelector('#inRangeBtn').style.outline = '' })
await press(w, '#inRangeBtn'); await w.page.locator('#inRangePop').waitFor(); await sleep(400)
console.log('the pencil:', JSON.stringify(await ring('#inRangeEdit')))
const b = await w.page.locator('#inRangePop').boundingBox()
await w.page.screenshot({ path: join(OUT, '2-window-pencil-phone.png'), clip: { x: 0, y: Math.max(0, b.y + b.height - 330), width: 402, height: Math.min(360, 874 - Math.max(0, b.y + b.height - 330)) } })
await L.finish()
