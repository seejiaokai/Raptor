// Scenario 8, a second look: at 320 wide Edit Schedule's bar has 25px of sideways room. The finger swipe over CDP moved nothing,
// so here the bar's own scroll position is set by script and the buttons' places are read.
import { open, tab } from './topbar1108-lib.mjs'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('[topbar1108-s8b v1]')
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const out = path.join(root, 'docs/img/handpass/2026-11-08-lw-pin-last-frame/walk/topbar/B')
mkdirSync(out, { recursive: true })
const { br, ctx, p } = await open({ dist: process.argv[2] || 'C:/Users/User/AppData/Local/Temp/topbar-dist-after', engine: 'chromium', w: 320, h: 874, dsf: 3, touch: true })
await tab(p, 'editsched'); await p.waitForTimeout(700)
const read = () => p.evaluate(() => {
  const bar = document.querySelector('#shell > .topbar'); const sc = [bar, ...bar.querySelectorAll('*')].find(e => e.scrollWidth > e.clientWidth + 4 && /auto|scroll/.test(getComputedStyle(e).overflowX))
  const L = id => { const e = document.querySelector(id); return e ? +e.getBoundingClientRect().left.toFixed(1) : null }
  return { sc: sc && sc.className.toString().slice(0, 30), sl: sc && sc.scrollLeft, room: sc && sc.scrollWidth - sc.clientWidth, burger: L('#burger'), undo: L('#undoBtn'), bell: L('#notifyBell'), barTop: +bar.getBoundingClientRect().top.toFixed(1) }
})
const a = await read()
await p.screenshot({ path: path.join(out, (process.argv[3] || '') + 's8b-320-0.png'), clip: { x: 0, y: 0, width: 320, height: 130 } })
await p.evaluate(() => { const bar = document.querySelector('#shell > .topbar'); const sc = [bar, ...bar.querySelectorAll('*')].find(e => e.scrollWidth > e.clientWidth + 4 && /auto|scroll/.test(getComputedStyle(e).overflowX)); sc.scrollLeft = 25 })
await p.waitForTimeout(500)
const b = await read()
await p.screenshot({ path: path.join(out, (process.argv[3] || '') + 's8b-320-1-scrolled-by-script.png'), clip: { x: 0, y: 0, width: 320, height: 130 } })
console.log('before', JSON.stringify(a)); console.log('after scrollLeft=25', JSON.stringify(b))
await br.close()
