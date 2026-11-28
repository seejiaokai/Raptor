// lwdl-drawcheck.mjs — walks the built decide row beside the drawing of record (E3) at the drawing's own sizes. From the lw-decide-look walk of 28 Nov 26 ([LW-DECIDE-LOOK], his D2881); run from raptor-port/.
// The drawing check: the built decide row against the drawing of record (E3, docs/mock/2026-11-27-decide-buttons). The
// drawing's own markup and CSS (draw-decide.mjs, look E3) are laid into the same window on this build, at the drawing's
// own sizes (phone 402x874 at 3x touch; desktop 1536x864 at 2x), and every part measured: each button's box, the mark's
// box, the words' box, colours, the ring. Then the real row is measured in each state. Differences over ~2px listed.
import os from 'node:os'
import { chromium, OUT_DEFAULT } from './lwdl-pw.mjs'
import path from 'node:path'
import { writeFileSync } from 'node:fs'
const PORT = process.env.PORT || 4192, BASE = `http://127.0.0.1:${PORT}/`
const OUT = OUT_DEFAULT + '/drawcheck'
import { mkdirSync } from 'node:fs'; mkdirSync(OUT, { recursive: true })
const TICK = '<svg class="dk-ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const CROSS = '<svg class="dk-ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'
const MOVE = '<button class="dchip move"><span class="mvarr" aria-hidden="true">⇄</span>Move</button>'
const DEL = '<button class="dchip del">Delete</button>'
const E3 = {
  pending: `<button class="dchip dk-b dk-a">${TICK}Approve</button><button class="dchip dk-b dk-r">${CROSS}Refuse</button>` + MOVE + DEL,
  approved: `<button class="dchip dk-b dk-a on dk-ring">${TICK}Approved</button><button class="dchip dk-b dk-r dk-off">${CROSS}Refuse</button>` + MOVE + DEL,
  refused: `<button class="dchip dk-b dk-a dk-off">${TICK}Approve</button><button class="dchip dk-b dk-r on dk-ring">${CROSS}Refused</button>` + MOVE + DEL,
}
const css = c => `
.dk-ic{width:14px;height:14px;flex:none;margin-right:5px}
.dl-acts .dk-a,.dl-acts .dk-r{padding-left:6px !important;padding-right:6px !important;white-space:nowrap}
@media (max-width:600px){.dk-ic{width:12px;height:12px;margin-right:4px} .dl-acts .dk-a,.dl-acts .dk-r{font-size:.9em !important}}
.dk-a{color:${c.ag} !important} .dk-r{color:${c.rg} !important}
.dl-acts .dk-b{display:inline-flex;align-items:center;justify-content:center}
.dl-acts .dk-b.dk-a{border-color:color-mix(in srgb, ${c.ag} 45%, transparent) !important}
.dl-acts .dk-b.dk-r{border-color:color-mix(in srgb, ${c.rg} 45%, transparent) !important}
.dl-acts .dk-b.dk-a.on{background:${c.abg} !important;border-color:${c.abg} !important;color:${c.lw} !important}
.dl-acts .dk-b.dk-r.on{background:${c.rbg} !important;border-color:${c.rbg} !important;color:${c.lw} !important}
.dl-acts .dchip.dk-ring{outline:2px solid ${c.ring} !important;outline-offset:2px}
.dl-acts .dchip.dk-off{color:#7d8794 !important}
.dl-acts .dk-b.dk-off{border-color:${c.edge} !important}
.daylist.dk-list{margin:0;padding:0}`
function lay(f) {
  const sheet = document.querySelector('[data-testid="bid-picker"]')
  sheet.querySelector('.dk-list')?.remove()
  const ul = document.createElement('ul'); ul.className = 'daylist flat dk-list'
  ul.innerHTML = `<li class="dl-line dl-card"><div class="dl-acts bp-acts">${f.acts}</div></li>`
  sheet.querySelector('[data-testid="bid-actions"]').after(ul)
  return 'ok'
}
const measure = (sel) => {
  const row = document.querySelector(sel); const rr = row.getBoundingClientRect()
  return [...row.querySelectorAll('button')].map(b => {
    const r = b.getBoundingClientRect(), cs = getComputedStyle(b), ic = b.querySelector('svg'); const icr = ic?.getBoundingClientRect()
    const tn = [...b.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()); let wr = null
    if (tn.length) { const g = document.createRange(); g.setStart(tn[0], 0); g.setEnd(tn.at(-1), tn.at(-1).textContent.length); wr = g.getBoundingClientRect() }
    const R = n => Math.round(n * 10) / 10
    return { t: b.innerText.replace(/\s+/g, ' ').trim(), x: R(r.left - rr.left), y: R(r.top - rr.top), w: R(r.width), h: R(r.height),
      mark: icr ? { x: R(icr.left - r.left), y: R(icr.top - r.top), w: R(icr.width) } : null, words: wr ? { x: R(wr.left - r.left), w: R(wr.width), y: R(wr.top - r.top) } : null,
      fs: cs.fontSize, fw: cs.fontWeight, col: cs.color, bg: cs.backgroundColor, edge: cs.borderTopColor, ring: cs.outlineStyle === 'none' ? 'none' : `${cs.outlineWidth} ${cs.outlineColor} +${cs.outlineOffset}`, radius: cs.borderTopLeftRadius }
  })
}
const report = []
for (const size of ['phone', 'desktop']) {
  const b = await chromium.launch()
  const ctx = await b.newContext(size === 'phone' ? { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 })
  const p = await ctx.newPage()
  await p.goto(BASE + '?fresh=1'); await p.waitForSelector('#luser')
  await p.evaluate(() => window.lwSetMemberToday('2026-01-02'))
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await p.evaluate(() => window.lwSetMemberToday('2026-01-02'))
  await p.evaluate(() => window.go('leavewar')); await p.waitForSelector('[data-testid="row-slipway"]', { state: 'attached' }); await p.waitForTimeout(900)
  await p.evaluate(() => window.lwSetViewer(null)); await p.evaluate(() => window.lwSetCell('slipway', '2026-02-17', 'LL'))
  const open = async () => {
    await p.locator('[data-testid="month-FEB"]').click(); await p.waitForTimeout(600)
    await p.evaluate(() => document.querySelector('[data-testid="cell-slipway-2026-02-17"]').scrollIntoView({ block: 'center', inline: 'center' })); await p.waitForTimeout(300)
    if (size === 'phone') await p.locator('[data-testid="cell-slipway-2026-02-17"]').tap(); else await p.locator('[data-testid="cell-slipway-2026-02-17"]').click()
    await p.waitForSelector('[data-testid="bid-picker"]'); await p.waitForTimeout(500)
  }
  await open()
  // the app's own colours, read as the drawing read them
  const c = await p.evaluate(() => {
    const host = document.createElement('div'); host.className = 'dl-acts'; host.innerHTML = '<button class="dchip dec approve">a</button><button class="dchip dec refuse">r</button><button class="dchip dec approve lit">a</button><button class="dchip dec refuse lit">r</button>'
    document.querySelector('[data-testid="bid-picker"]').append(host)
    const [a, r, al, rl] = host.querySelectorAll('button'), cs = e => getComputedStyle(e)
    const lv = document.querySelector('.tchip.lv.lit, [data-testid="bid-LL"].lit')
    const o = { ag: '#8FE0A8', rg: '#FFA6AD', abg: cs(al).backgroundColor, rbg: cs(rl).backgroundColor, lw: cs(al).color, edge: getComputedStyle(document.querySelector('[data-testid="decide-shift"]')).borderTopColor, ring: lv ? cs(lv).outlineColor : 'rgb(59, 198, 232)' }
    host.remove(); return o
  })
  await p.addStyleTag({ content: css(c) })
  for (const st of ['pending', 'approved', 'refused']) {
    // the real row in this state
    if (st !== 'pending') { await p.locator(`[data-testid="decide-${st === 'approved' ? 'approve' : 'refuse'}"]`).click(); await p.waitForTimeout(600); if (!(await p.locator('[data-testid="bid-picker"]').count())) await open() }
    const real = await p.evaluate(measure, '[data-testid="bid-actions"]')
    await p.evaluate(lay, { acts: E3[st] })
    const drawn = await p.evaluate(measure, '.dk-list .dl-acts')
    const box = await p.evaluate(() => { const a = document.querySelector('[data-testid="bid-actions"]').getBoundingClientRect(), d = document.querySelector('.dk-list').getBoundingClientRect(); return { x: a.left - 8, y: a.top - 8, width: a.width + 16, height: d.bottom - a.top + 16 } })
    await p.screenshot({ path: path.join(OUT, `dc-${size}-${st}-built-over-drawn.png`), clip: box })
    report.push({ size, st, real, drawn })
    const diffs = []
    real.forEach((r, i) => {
      const d = drawn[i]; if (!d) { diffs.push(`button ${i} missing in the drawing`); return }
      for (const k of ['x', 'y', 'w', 'h']) if (Math.abs(r[k] - d[k]) > 2) diffs.push(`${r.t}: ${k} built ${r[k]} drawn ${d[k]}`)
      if (r.mark && d.mark) for (const k of ['x', 'y', 'w']) if (Math.abs(r.mark[k] - d.mark[k]) > 2) diffs.push(`${r.t} mark ${k}: built ${r.mark[k]} drawn ${d.mark[k]}`)
      if (!!r.mark !== !!d.mark) diffs.push(`${r.t}: mark built ${!!r.mark} drawn ${!!d.mark}`)
      if (r.words && d.words) for (const k of ['x', 'w', 'y']) if (Math.abs(r.words[k] - d.words[k]) > 2) diffs.push(`${r.t} words ${k}: built ${r.words[k]} drawn ${d.words[k]}`)
      for (const k of ['fs', 'fw', 'col', 'bg', 'edge', 'ring', 'radius']) if (r[k] !== d[k]) diffs.push(`${r.t} ${k}: built ${r[k]} drawn ${d[k]}`)
      if (r.t !== d.t) diffs.push(`words: built "${r.t}" drawn "${d.t}"`)
    })
    console.log(`\n${size} ${st}: ${diffs.length ? diffs.length + ' differences' : 'no difference over 2px'}`)
    for (const x of diffs) console.log('   ' + x)
    if (!diffs.length) console.log('   built ' + JSON.stringify(real.map(r => [r.t, r.x, r.w, r.h, r.mark?.w])))
    await p.evaluate(() => document.querySelector('.dk-list')?.remove())
  }
  await b.close()
}
writeFileSync(path.join(process.env.LWDL_LOGDIR || os.tmpdir(), 'lwdl-drawcheck.json'), JSON.stringify(report, null, 1))
