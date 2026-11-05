// The night of 6 Nov 26, job 3 (People and Quals) — the host's probes, run on a built folder before and after each fix:
//   finger  — [QUALS-HEAD-FINGER-CAPTURE]: in Edit quals a heading pressed by a FINGER on its words and slid across the
//             row; does its column move? (a finger over CDP — real touch, real pointer events — in Chromium)
//   nosda   — [QUALS-PINCH-NOSDA-HEAD]: does each engine take the scroll-driven path (sdaActive)? And, with the browser's
//             scroll-driven animations reported missing (an init script), mid-pinch in part-way down: the frozen heading
//             row's name heading against the table's left edge
//   sliver  — [QUALS-ZOOM-EDGE-SLIVER]: after a pinch out then in (a fractional zoom), the table scrolled sideways, the
//             pixels just inside the name column's left edge: any of a scrolled cell's letters?
// Usage, from raptor-port/:  node scripts/handpass/pq1106-probe.mjs <dist> <finger|nosda|sliver> [out folder]
import { chromium, webkit, LAUNCH, serveDist } from '../drawcheck/lib.mjs'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
console.log('[pq1106-probe v1]')
const [dist, what, out = 'docs/img/handpass/2026-11-06-people-quals/probe'] = process.argv.slice(2)
mkdirSync(out, { recursive: true })
const ORIGIN = 'http://localhost:4391'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const PHONE = { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }

async function open(engine, opts = {}, init) {
  const br = engine === 'webkit' ? await webkit.launch() : await chromium.launch(LAUNCH)
  const ctx = await br.newContext({ ...PHONE, ...opts })
  await serveDist(ctx, ORIGIN, dist)
  if (init) await ctx.addInitScript(init)
  const p = await ctx.newPage()
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
  await p.goto(ORIGIN + '/?fresh=1')
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); await sleep(500)
  await p.addStyleTag({ content: '#toastEl{visibility:hidden!important}' })
  await p.evaluate(() => window.go('quals')); await sleep(600)
  const cdp = engine === 'chromium' ? await ctx.newCDPSession(p) : null
  return { br, ctx, p, errs, cdp }
}
const touch = (cdp, type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x: Math.round(x), y: Math.round(y), id: i + 1 })) })

if (what === 'finger') {
  const { br, p, errs, cdp } = await open('chromium')
  await p.click('#qEdit'); await sleep(300); await p.click('#qEditQuals'); await sleep(400)
  const cols = () => p.evaluate(() => [...document.querySelectorAll('#qtbl thead th[data-col]')].map(t => t.dataset.col))
  const before = await cols()
  // the press on the 2nd heading's WORDS, the finger slid onto the 3rd heading's middle (clear of the edge scroll) — both in sight
  // the table scrolled sideways so the 2nd to 4th headings stand in sight, past the name column
  await p.evaluate(() => {
    const w = document.querySelector('#page-quals .qwrap'), ths = [...document.querySelectorAll('#qtbl thead th[data-col]')]
    const name = document.querySelector('#qtbl thead th[data-sort="cs"]').getBoundingClientRect()
    w.scrollLeft += ths[1].getBoundingClientRect().left - name.right - 8
  }); await sleep(300)
  const pts = await p.evaluate(() => {
    const ths = [...document.querySelectorAll('#qtbl thead th[data-col]')]
    const lbl = ths[1].querySelector('.qlbl').getBoundingClientRect(), to = ths[2].getBoundingClientRect()
    const hit = document.elementFromPoint(lbl.left + lbl.width / 2, lbl.top + lbl.height / 2)
    return { from: [lbl.left + lbl.width / 2, lbl.top + lbl.height / 2], to: [to.left + to.width / 2, to.top + to.height / 2], hit: hit ? hit.tagName + '.' + hit.className : 'nothing' }
  })
  console.log('press lands on:', pts.hit, 'from', pts.from.map(Math.round), 'to', pts.to.map(Math.round))
  await touch(cdp, 'touchStart', [pts.from]); await sleep(60)
  for (let i = 1; i <= 12; i++) { await touch(cdp, 'touchMove', [[pts.from[0] + (pts.to[0] - pts.from[0]) * i / 12, pts.from[1]]]); await sleep(24) }
  await sleep(90)
  const mid = await p.evaluate(() => [...document.querySelectorAll('#qtbl thead th.qdrop')].map(t => t.dataset.col))
  await p.screenshot({ path: path.join(out, `finger-mid.png`) })
  await touch(cdp, 'touchEnd', []); await sleep(600)
  const after = await cols()
  await p.screenshot({ path: path.join(out, `finger-after.png`) })
  console.log('before:', before.slice(0, 6).join(' '), '\nmid-drag lit as the landing:', JSON.stringify(mid), '\nafter: ', after.slice(0, 6).join(' '))
  console.log(after.join() !== before.join() && after[2] === before[1] ? 'PASS the column moved under the finger' : 'FAIL the column did not move')
  if (errs.length) console.log('page errors:', errs.slice(0, 3))
  await br.close()
}

if (what === 'nosda') {
  for (const engine of ['chromium', 'webkit']) {
    const { br, p } = await open(engine)
    const r = await p.evaluate(() => ({
      sda: CSS.supports('scroll-timeline: --x x') && CSS.supports('timeline-scope: --x'),
      qsda: !!document.querySelector('#page-quals .qwrap.q-sda'), ua: navigator.userAgent.replace(/.*\) /, ''),
    }))
    console.log(engine, JSON.stringify(r))
    await br.close()
  }
  // scroll-driven animations reported missing, as an older Safari would: the Leave War test's way (e2e/leavewar.spec.ts)
  const NOSDA = () => { const real = CSS.supports.bind(CSS); CSS.supports = (...a) => (/scroll-timeline|timeline-scope|animation-timeline/.test(a.join(' ')) ? false : real(...a)) }
  const { br, p, cdp } = await open('chromium', {}, NOSDA)
  console.log('init script took:', await p.evaluate(() => !document.querySelector('#page-quals .qwrap.q-sda')))
  await p.evaluate(() => window.scrollTo(0, 420)); await sleep(500)
  console.log('pinned row up:', await p.locator('[data-testid="qsticky-head"]').count())
  const read = () => p.evaluate(() => {
    const wrapL = document.querySelector('#page-quals .qwrap').getBoundingClientRect().left
    const m = document.querySelector('[data-testid="qsticky-head"]')
    const shown = !!m && getComputedStyle(m).visibility !== 'hidden'
    // the name heading a person SEES in the pinned row: the still copy where there is one, else the scroller's own
    const vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && s.visibility !== 'hidden' }
    const frozen = m?.querySelector('.qfixed-frozen th[data-sort="cs"]'), own = m?.querySelector('.qfixed-scroll th[data-sort="cs"]')
    const box = e => { const r = e.getBoundingClientRect(); return [Math.round(r.left * 10) / 10, Math.round(r.right * 10) / 10] }
    return { wrapL, shown, frozen: frozen && vis(frozen) ? box(frozen) : null, own: own && vis(own) ? box(own) : null, transformed: !!document.getElementById('qtbl').style.transform }
  })
  const at = d => [[200 - d / 2, 450], [200 + d / 2, 450]]
  await touch(cdp, 'touchStart', [at(90)[0]]); await sleep(30)
  await touch(cdp, 'touchStart', at(90)); await sleep(30)
  for (let i = 1; i <= 10; i++) { await touch(cdp, 'touchMove', at(90 + 160 * i / 10)); await sleep(16) }
  await sleep(120)
  const mid = await read()
  await p.screenshot({ path: path.join(out, 'nosda-mid-pinch-in.png') })
  await touch(cdp, 'touchEnd', []); await sleep(600)
  console.log('mid-pinch in, no SDA:', JSON.stringify(mid))
  const seen = [mid.frozen, mid.own].filter(Boolean)
  const bad = seen.filter(b => b[0] < mid.wrapL - 1.5)
  console.log(mid.transformed && seen.length && !bad.length ? 'PASS the pinned name heading stays at the left edge' : `FAIL a pinned name heading carried left of the edge (${mid.wrapL}): ${JSON.stringify(bad)}`)
  await br.close()
}

if (what === 'sliver') {
  // Chrome at 3x, as found: pinch out then in to about 0.978, scroll sideways, read the pixels inside the name column's
  // left edge (the first screen pixel column of it) down the OCU rows
  const { br, p, cdp } = await open('chromium')
  await p.evaluate(() => window.scrollTo(0, 0)); await sleep(300)
  const pinch = async (d0, d1) => {
    const at = d => [[200 - d / 2, 500], [200 + d / 2, 500]]
    await touch(cdp, 'touchStart', [at(d0)[0]]); await sleep(30); await touch(cdp, 'touchStart', at(d0)); await sleep(30)
    for (let i = 1; i <= 10; i++) { await touch(cdp, 'touchMove', at(d0 + (d1 - d0) * i / 10)); await sleep(16) }
    await sleep(90); await touch(cdp, 'touchEnd', []); await sleep(500)
  }
  const target = Number(process.env.SLIVER_Z || 0.978)
  await pinch(200, 100)
  // then in, to the zoom asked: zoomed by the ratio of the fingers' distances
  const z1 = await p.evaluate(() => parseFloat(getComputedStyle(document.getElementById('qtbl')).getPropertyValue('--qz')) || 1)
  await pinch(100, Math.round(100 * target / z1))
  const z = await p.evaluate(() => parseFloat(getComputedStyle(document.getElementById('qtbl')).getPropertyValue('--qz')) || 1)
  await p.evaluate(() => { document.querySelector('#page-quals .qwrap').scrollLeft = 37 }); await sleep(300)
  const geo = await p.evaluate(() => {
    const wrap = document.querySelector('#page-quals .qwrap').getBoundingClientRect()
    const names = [...document.querySelectorAll('#qtbl td.qname')].map(td => td.getBoundingClientRect()).filter(r => r.top > 140 && r.bottom < innerHeight - 10)
    return { wrapL: wrap.left, nameL: names[0]?.left, top: names[0]?.top, bottom: names.at(-1)?.bottom, dpr: devicePixelRatio }
  })
  const f = path.join(out, `sliver-z${z.toFixed(3)}.png`)
  await p.screenshot({ path: f, clip: { x: 0, y: geo.top, width: 60, height: Math.min(400, geo.bottom - geo.top) } })
  // count, in the screen pixels of the name column's first device-pixel column, any pixel brighter than the column's own fill
  const res = await p.evaluate(async ({ src, wrapL, dpr }) => {
    const img = await new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.src = src })
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0)
    const d = g.getImageData(0, 0, c.width, c.height).data
    const cols = [Math.floor(wrapL * dpr), Math.floor(wrapL * dpr) + 1, Math.floor(wrapL * dpr) + 2]
    const out = {}
    for (const x of cols) { let bright = 0, max = 0; for (let y = 0; y < c.height; y++) { const i = (y * c.width + x) * 4; const v = Math.max(d[i], d[i + 1], d[i + 2]); if (v > max) max = v; if (v > 150) bright++ } out[x] = { bright, max } }
    return out
  }, { src: 'data:image/png;base64,' + (await import('node:fs')).readFileSync(f).toString('base64'), wrapL: geo.wrapL, dpr: geo.dpr })
  console.log('zoom', z.toFixed(4), JSON.stringify(geo), '\nfirst device-pixel columns of the name column:', JSON.stringify(res))
  await br.close()
}

if (what === 'scan') {
  // [QUALS-ZOOM-EDGE-SLIVER] swept: the table's zoom set as the pinch leaves it (its --qz), many sideways scrolls; for each,
  // the screen's pixels in a strip 2 CSS px wide from the name column's left edge, counted where brighter than the
  // column's own fill and its row lines (max channel > 100). A count is the sliver.
  const { br, p } = await open(process.env.SCAN_ENGINE || 'chromium')
  await p.evaluate(() => window.scrollTo(0, 0)); await sleep(300)
  if (process.env.SCAN_CSS) await p.addStyleTag({ content: process.env.SCAN_CSS })
  const zooms = (process.env.SCAN_Z || '0.978,0.9,0.85,0.95,0.97,0.99,0.75,0.6').split(',').map(Number)
  let hits = 0, n = 0
  for (const z of zooms) {
    await p.evaluate(z => document.getElementById('qtbl').style.setProperty('--qz', String(z)), z); await sleep(150)
    for (let sl = 1; sl <= 400; sl += 13) {
      const g = await p.evaluate(sl => {
        const w = document.querySelector('#page-quals .qwrap'); w.scrollLeft = sl
        const r = w.getBoundingClientRect(), names = [...document.querySelectorAll('#qtbl td.qname')].map(td => td.getBoundingClientRect()).filter(q => q.top > 140 && q.bottom < innerHeight - 10)
        return { x: r.left, top: names[0].top, h: names.at(-1).bottom - names[0].top, sl: w.scrollLeft }
      }, sl)
      await sleep(30)
      const buf = await p.screenshot({ clip: { x: g.x, y: g.top, width: 2, height: g.h } })
      const c = await p.evaluate(async b64 => {
        const img = await new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.src = 'data:image/png;base64,' + b64 })
        const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height; const ctx = cv.getContext('2d'); ctx.drawImage(img, 0, 0)
        const d = ctx.getImageData(0, 0, cv.width, cv.height).data; let k = 0
        for (let i = 0; i < d.length; i += 4) if (Math.max(d[i], d[i + 1], d[i + 2]) > 100) k++
        return k
      }, buf.toString('base64'))
      n++
      if (c) { hits++; if (hits <= 12) { console.log(`  sliver: zoom ${z} scrollLeft ${g.sl.toFixed(2)} — ${c} bright pixels`); await p.screenshot({ path: path.join(out, `scan-z${z}-sl${Math.round(g.sl)}.png`), clip: { x: Math.max(0, g.x - 10), y: g.top, width: 80, height: Math.min(300, g.h) } }) } }
    }
  }
  console.log(`${hits} of ${n} readings show a sliver`)
  await br.close()
}

if (what === 'why') {
  // one failing reading looked at closely: where the name cell, the wrap and the cells under the edge stand, in CSS px
  const { br, p } = await open('chromium')
  await p.evaluate(() => window.scrollTo(0, 0)); await sleep(300)
  const z = Number(process.env.WHY_Z || 0.978), sl = Number(process.env.WHY_SL || 287)
  await p.evaluate(z => document.getElementById('qtbl').style.setProperty('--qz', String(z)), z); await sleep(200)
  const r = await p.evaluate(sl => {
    const w = document.querySelector('#page-quals .qwrap'); w.scrollLeft = sl
    const wr = w.getBoundingClientRect(), td = document.querySelector('#qtbl tbody td.qname'), tr = td.closest('tr')
    const cells = [...tr.children].map(c => { const q = c.getBoundingClientRect(); return { cls: c.className, l: +q.left.toFixed(3), r: +q.right.toFixed(3) } }).filter(c => c.r > wr.left - 5 && c.l < wr.left + 60)
    const inner = [...tr.querySelectorAll('*')].map(e => { const q = e.getBoundingClientRect(); return { tag: e.tagName + '.' + e.className, l: +q.left.toFixed(3), r: +q.right.toFixed(3) } }).filter(c => c.r > wr.left - 2 && c.l < wr.left + 3 && !c.tag.includes('qname'))
    const tdq = td.getBoundingClientRect(), cs = getComputedStyle(w)
    return { sl: w.scrollLeft, wrap: [wr.left, wr.right], clientLeft: w.clientLeft, border: cs.borderLeftWidth, pad: cs.paddingLeft, name: [tdq.left, tdq.right], nameOff: td.offsetLeft, cells, inner, dpr: devicePixelRatio, zoom: getComputedStyle(document.getElementById('qtbl')).zoom }
  }, sl)
  console.log(JSON.stringify(r, null, 1))
  await br.close()
}

if (what === 'edge') {
  // the name column's left edge pictured as he would see it: unzoomed and at 0.9, unscrolled and scrolled sideways
  for (const engine of ['chromium', 'webkit']) {
    const { br, p } = await open(engine)
    await p.evaluate(() => window.scrollTo(0, 0)); await sleep(300)
    for (const [z, sl] of [[1, 0], [1, 150], [0.9, 0], [0.9, 261]]) {
      await p.evaluate(([z, sl]) => { document.getElementById('qtbl').style.setProperty('--qz', String(z)); document.querySelector('#page-quals .qwrap').scrollLeft = sl }, [z, sl]); await sleep(250)
      const r = await p.evaluate(() => { const n = [...document.querySelectorAll('#qtbl td.qname')].map(td => td.getBoundingClientRect()).filter(q => q.top > 140)[0]; return { y: n.top - 6 } })
      await p.screenshot({ path: path.join(out, `edge-${engine}-z${z}-sl${sl}.png`), clip: { x: 10, y: r.y, width: 40, height: 60 } })
    }
    await br.close()
  }
  console.log('pictured')
}
