// Chat 196, 28 Nov 26 — his D2890: on the Leave War, "+ New period" (an admin's way to create a leave period) stands at
// the TOP of the period list (View), not as its last line. Drawn on the REAL app (the main folder's build on
// 127.0.0.1:4181): the list is today's native choice list, whose open state a browser draws outside the page and no
// picture can catch, so it is drawn opened as a plain list in the app's menu look (the board's: plain rows, 38 tall,
// D1706), hanging from the View box — "+ New period" first, a line under it, then the periods, the one in view ticked.
// D2891 (an admin can delete or archive a period) is NOT drawn: what each does to bids, approved leave and OIL is put
// to him first. Nothing under raptor-port/src changes. Run from raptor-port/ (the main folder's):
//   node <this file> --size d|p [--url http://127.0.0.1:4181/]
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const VERSION = 'draw-periods v1.0 (28 Nov 26, chat 196)'
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d }
const SIZE = arg('size', 'd'), URL = arg('url', 'http://127.0.0.1:4181/'), PHONE = SIZE === 'p'
const HERE = path.dirname(fileURLToPath(import.meta.url)), IMG = path.join(HERE, 'img')
mkdirSync(IMG, { recursive: true })
const PW = createRequire(process.cwd() + '/package.json')('playwright')
const sleep = ms => new Promise(r => setTimeout(r, ms))
const browser = await PW.chromium.launch()
const ctx = await browser.newContext(PHONE ? { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 })
const p = await ctx.newPage(); p.setDefaultTimeout(15000)
const errs = []; p.on('pageerror', e => errs.push(e.message))
try {
  await p.goto(URL); await p.waitForSelector('#luser')
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day'); await sleep(800)
  await p.evaluate(() => window.go('leavewar')); await sleep(3000)
  for (const marked of [true, false]) {
    const box = await p.evaluate(marked => {
      document.getElementById('dkList')?.remove(); document.querySelectorAll('.rd-tag').forEach(t => t.remove())
      const s = document.querySelector('[data-testid="war-picker"]'); const r = s.getBoundingClientRect()
      const opts = [...s.options].map(o => ({ v: o.value, t: o.textContent }))
      const neu = opts.find(o => /New period/.test(o.t)), wars = opts.filter(o => o !== neu)
      const cs = getComputedStyle(s)
      const list = document.createElement('div'); list.id = 'dkList'
      const row = 'display:flex;align-items:center;gap:8px;height:38px;padding:0 14px;white-space:nowrap;font:500 15px/1 ' + cs.fontFamily
      const tick = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      list.innerHTML = `<div class="dk-new-row" style="${row};color:#e8edf3;font-weight:700">${neu.t}</div>`
        + `<div style="height:1px;background:rgba(138,150,163,.35);margin:4px 0"></div>`
        + wars.map(w => `<div style="${row};color:${w.v === s.value ? '#3fd0f0' : '#e8edf3'}"><span style="width:14px;display:inline-flex">${w.v === s.value ? tick : ''}</span>${w.t}</div>`).join('')
      Object.assign(list.style, { position: 'fixed', left: r.left + 'px', top: (r.bottom + 6) + 'px', minWidth: Math.max(r.width, 180) + 'px', background: '#1b2027', border: '1px solid rgba(138,150,163,.45)', borderRadius: '10px', padding: '6px 0', zIndex: 9000, boxShadow: '0 10px 24px rgba(0,0,0,.45)' })
      document.body.appendChild(list)
      if (marked) {
        const n = list.querySelector('.dk-new-row'); n.style.outline = '2px dashed #FFD23F'; n.style.outlineOffset = '-3px'
        const nr = n.getBoundingClientRect(), t = document.createElement('span'); t.className = 'rd-tag'; t.textContent = '1'
        Object.assign(t.style, { position: 'fixed', zIndex: 9001, background: '#FFD23F', color: '#15171c', font: '800 11px/17px system-ui,sans-serif', padding: '0 6px', borderRadius: '9px', left: (nr.right + 6) + 'px', top: (nr.top + nr.height / 2 - 9) + 'px' })
        document.body.appendChild(t)
      }
      const lr = list.getBoundingClientRect(), pad = 14
      const x = Math.max(0, Math.min(r.left, lr.left) - 60), y = Math.max(0, r.top - 70)
      return { x, y, width: Math.min(innerWidth - x, Math.max(lr.right, r.right) + 120 - x), height: lr.bottom + pad - y }
    }, marked)
    const file = `p1-periods${marked ? '' : '-clean'}-${PHONE ? 'phone' : 'desktop'}.png`
    await p.screenshot({ path: path.join(IMG, file), clip: box }); console.log('  picture', file)
  }
  console.log('DONE', VERSION)
} catch (e) { console.log('FAILED', e.message.split('\n')[0]) }
finally { console.log('errors:', errs.length, errs.slice(0, 3)); await browser.close() }
