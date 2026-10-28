// Walker B, script 1: the tab row at 402/390/375, the page at rest, slid, pinched (Chromium phone, admin).
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/b'
const B = await import('./lw-m5a-walk-b-lib.mjs')
const { L, T, rec, shot, press, openBalances, balRow, tabRow, where, swipe, pinch, box } = B
console.log('[lw-m5a-walk-b1 v1]')
const w = await L.newCtx('phone')
const P = w.page
const geo = () => P.evaluate(() => {
  const s = document.querySelector('[data-testid="bal-scroll"]')
  const who = document.querySelector('.bp-row .bp-who'), cols = document.querySelector('.bp-cols'), zoom = document.querySelector('.bp-zoom')
  const r = e => { if (!e) return null; const b = e.getBoundingClientRect(); return { l: Math.round(b.left), t: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) } }
  return { scrollLeft: Math.round(s.scrollLeft), scrollTop: Math.round(s.scrollTop), sw: s.scrollWidth, cw: s.clientWidth, who: r(who), cols: r(cols), zoomBox: r(zoom), zoomStyle: zoom && (zoom.style.cssText || '').slice(0, 120), win: Math.round(scrollY), vv: Math.round(visualViewport.scale * 100) / 100, docSW: document.documentElement.scrollWidth }
})
try {
  await L.signIn(w, 'admin')
  /* 1 — the tab row at 402, 390, 375 */
  for (const vw of [402, 390, 375]) {
    await P.setViewportSize({ width: vw, height: 874 }); await P.waitForTimeout(500)
    const tr = await tabRow(P)
    const oneLine = tr.tabs.every(t => t.top === tr.tabs[0].top) && !!tr.gear && tr.tabs.every(t => t.right <= tr.gear.left)
    const icons = tr.tabs.map(t => t.icon)
    const labels = tr.tabs.map(t => t.label + (t.n ? ' ' + t.n : ''))
    const want = vw === 375 ? false : true
    rec(`36 tab row ${vw}`, `${vw}`, oneLine && icons.every(i => i === want) && tr.sw <= tr.vw ? 'PASS' : 'FAIL', `labels ${labels.join(' · ')}; icons ${icons.join(',')} (drawing: ${want ? 'kept' : 'dropped'}); gear at x ${tr.gear?.left}-${tr.gear?.right}; one line ${oneLine}; page width ${tr.sw} vs ${tr.vw}; tabs ${tr.tabs.map(t => `${t.left}-${t.right}`).join(' ')}`, [`t1-tabs-${vw}`])
    await P.screenshot({ path: `${L.OUT}/t1-tabs-${vw}.png`, clip: { x: 0, y: 0, width: vw, height: 110 }, scale: 'css' })
  }
  await P.setViewportSize({ width: 402, height: 874 }); await P.waitForTimeout(500)
  await openBalances(w)
  await shot(w, 't2-rest')
  const g0 = await geo()
  console.log('rest', JSON.stringify(g0))
  /* 3 — a quick flick, a slow drag, a diagonal */
  await swipe(w, 330, 500, 90, 500, { steps: 4, dwell: 8, rest: 0 }); await P.waitForTimeout(900)
  const g1 = await geo(); await shot(w, 't3a-flick-left')
  console.log('after quick flick', JSON.stringify(g1))
  rec('32 quick flick sideways', '402', g1.scrollLeft > g0.scrollLeft && g1.scrollTop === g0.scrollTop && g1.who.l === 0 && g1.cols.t === g0.cols.t ? 'PASS' : 'FAIL', `scrollLeft ${g0.scrollLeft}->${g1.scrollLeft} of max ${g1.sw - g1.cw}; vertical scroll ${g0.scrollTop}->${g1.scrollTop}; names column left ${g1.who?.l} (was ${g0.who?.l}); heading row top ${g1.cols?.t} (was ${g0.cols?.t})`, ['t3a-flick-left'])
  await swipe(w, 90, 500, 330, 500, { steps: 40, dwell: 30, rest: 150 }); await P.waitForTimeout(600)
  const g2 = await geo(); await shot(w, 't3b-slow-back')
  rec('32 slow drag sideways back', '402', g2.scrollLeft < g1.scrollLeft && g2.who.l === 0 ? 'PASS' : 'FAIL', `scrollLeft ${g1.scrollLeft}->${g2.scrollLeft}; names left ${g2.who?.l}`, ['t3b-slow-back'])
  await swipe(w, 330, 600, 120, 420, { steps: 20, dwell: 20, rest: 100 }); await P.waitForTimeout(900)
  const g3 = await geo(); await shot(w, 't3c-diagonal')
  rec('32 diagonal swipe', '402', 'NOTE', `scrollLeft ${g2.scrollLeft}->${g3.scrollLeft}, scrollTop ${g2.scrollTop}->${g3.scrollTop}, window ${g3.win}; names left ${g3.who?.l}, heading top ${g3.cols?.t}`, ['t3c-diagonal'])
  /* vertical scroll: the heading row held at the top */
  await swipe(w, 200, 700, 200, 300, { steps: 12, dwell: 16, rest: 100 }); await P.waitForTimeout(900)
  const g4 = await geo(); await shot(w, 't3d-down')
  rec('32 vertical scroll holds the heading row', '402', g4.scrollTop > g3.scrollTop && g4.cols.t === g3.cols.t ? 'PASS' : 'FAIL', `scrollTop ${g3.scrollTop}->${g4.scrollTop}; heading top ${g3.cols?.t}->${g4.cols?.t}; window scroll ${g4.win}`, ['t3d-down'])
  await P.evaluate(() => { const s = document.querySelector('[data-testid="bal-scroll"]'); s.scrollTo(0, 0) }); await P.waitForTimeout(400)
  /* 4 — pinch: fingers together, then apart */
  const bs = await box(P, T('bal-scroll'))
  await pinch(w, 201, 500, 260, 90); await P.waitForTimeout(900)
  const p1 = await geo(); await shot(w, 't4a-pinch-together')
  console.log('pinch together', JSON.stringify(p1))
  await pinch(w, 201, 500, 90, 300); await P.waitForTimeout(900)
  const p2 = await geo(); await shot(w, 't4b-pinch-apart')
  console.log('pinch apart', JSON.stringify(p2))
  console.log('bs', JSON.stringify(bs))
} catch (e) { console.log('ERROR', e); await shot(w, 'err-b1').catch(() => {}) }
console.log('errors:', B.errsOf(w))
L.writeResults('b1')
await w.ctx.close(); await L.closeBrowser()
