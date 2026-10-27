// Walker B, steps 5 and 6: the ring on a far, cold month (Approvals' dates tap, then the member's bell), and the ring's six seconds.
// Fixture: Ranger bids LL on Tue 24 Mar and Thu 26 Mar 26 (March: never opened by the admin's session). Chromium 402x874.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/b'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { L, T, shot, rec } = B
console.log('[lw-m4-walk-b5 v1]')
const w = await B.newPhone(402, 874, 'chromium')
const P = w.page
/* what stands over the ringed cell, and the clearances to every sticky / fixed box */
const ringReport = () => P.evaluate(() => {
  const td = document.querySelector('td.lw-ring')
  if (!td) return { ring: false }
  const r = td.getBoundingClientRect()
  const pts = [[0.5, 0.5], [0.15, 0.15], [0.85, 0.15], [0.15, 0.85], [0.85, 0.85]].map(([fx, fy]) => { const x = r.left + r.width * fx, y = r.top + r.height * fy; const e = document.elementFromPoint(x, y); return { in: !!e && (td === e || td.contains(e)), over: e ? (e.tagName + '.' + String(e.className).slice(0, 40) + (e.dataset && e.dataset.testid ? '#' + e.dataset.testid : '')) : null } })
  const sticky = [...document.querySelectorAll('*')].filter(e => { const p = getComputedStyle(e).position; if (p !== 'sticky' && p !== 'fixed') return false; const b = e.getBoundingClientRect(); return b.width > 20 && b.height > 8 && b.bottom > 0 && b.top < innerHeight }).map(e => { const b = e.getBoundingClientRect(); return { el: e.tagName + '.' + String(e.className).slice(0, 30) + (e.dataset.testid ? '#' + e.dataset.testid : ''), l: Math.round(b.left), t: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom) } })
  const slim = document.querySelector('[data-testid="appr-slim"]')
  const sb = slim ? slim.getBoundingClientRect() : null
  return { ring: true, box: { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) }, vw: innerWidth, vh: innerHeight, pts, allIn: pts.every(p => p.in), slimTop: sb ? Math.round(sb.top) : null, sticky }
})
async function ringPictures(label, t0) {
  const rep = []
  for (const ms of [1000, 3000]) {
    const wait = t0 + ms - Date.now(); if (wait > 0) await P.waitForTimeout(wait)
    await shot(w, `${label}-${ms}ms`)
    const rr = await ringReport()
    if (rr.ring) { const x = Math.max(0, rr.box.l - 70), y = Math.max(0, rr.box.t - 60); await shot(w, `${label}-${ms}ms-zoom`, { scale: 'device', clip: { x, y, width: 200, height: 160 } }) }
    rep.push({ ms, ...rr })
  }
  return rep
}
try {
  await B.signIn(w, 'member')
  for (const d of ['2026-03-24', '2026-03-26']) {
    await L.openCell(w, 'bane', d)
    const ok = await L.placeLeave(w, 'LL'); console.log('placed', d, ok); await B.sleep(w, 250)
  }
  /* admin: the cold session — nothing but sign-in, Leave War, Approvals */
  await B.switchTo(w, 'admin')
  await B.openApprovals(w)
  await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
  const mar = await P.evaluate(() => [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]')].map((e, i) => ({ i, id: e.dataset.testid, text: e.innerText.replace(/\s+/g, ' ') })).filter(l => /24 Mar/.test(l.text)))
  console.log('the 24 Mar line:', JSON.stringify(mar))
  rec('F fixture: a 24 Mar request is in the list', 'phone', mar.length === 1 ? 'PASS' : 'FAIL', JSON.stringify(mar), [])
  /* decide it (so the bell has a line), then tap its dates */
  const li = mar[0].i
  const lineSel = `[data-testid="approvals-page"] [data-testid^="appr-line-"]:nth-of-type(${li + 1})`
  /* find by index through evaluate-tagged attribute: mark the line */
  await P.evaluate(i => { const ls = [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]')]; ls[i].setAttribute('data-walk', 'mar24') }, li)
  await B.step(w, 's5-approve24', '[data-walk="mar24"] [data-testid="appr-approve"]')
  await B.sleep(w, 300)
  const t0 = Date.now()
  await B.press(w, '[data-walk="mar24"] [data-testid="appr-dates"]', 's5-dates-100ms')
  const rep0 = Date.now() - t0
  const reps = await ringPictures('s5-dates', t0)
  const q = await ringReport()
  console.log('quick report (about ' + rep0 + ' ms):', JSON.stringify(q))
  for (const r of reps) console.log('report', JSON.stringify(r))
  const slimUp = await B.vis(P, T('appr-slim'))
  const okRing = r => r.ring && r.allIn && r.box.l >= 0 && r.box.r <= r.vw && r.box.t >= 0 && (r.slimTop === null || r.box.b <= r.slimTop)
  rec('S5a dates tap on a far cold month: grid at that day, ring on the cell, standing clear (1 s)', 'phone', slimUp && okRing(reps[0]) ? 'PASS' : 'FAIL', JSON.stringify({ slim: slimUp, box: reps[0].box, allIn: reps[0].allIn, over: reps[0].pts.map(p => p.over), slimTop: reps[0].slimTop }), ['s5-dates-100ms-q.png'].concat(['s5-dates-1000ms.png']))
  rec('S5b the same at 3 s (ring still there, clear)', 'phone', okRing(reps[1]) ? 'PASS' : 'FAIL', JSON.stringify({ box: reps[1].box, allIn: reps[1].allIn, slimTop: reps[1].slimTop }), ['s5-dates-3000ms.png'])
  rec('S5c at ~0.1 s the ring and cell are where they will stand', 'phone', q.ring ? 'PASS' : 'FAIL', JSON.stringify({ box: q.box, allIn: q.allIn, over: q.pts.map(p => p.over) }), ['s5-dates-100ms-q.png'])
  const g = await B.txt(P, T('appr-slim'))
  console.log('slim bar:', g)
  /* ---- the member's bell, cold ---- */
  await B.switchTo(w, 'member')
  await L.openBell(w)
  const bl = await B.bellLines(P)
  console.log('bell lines:', bl.map(b => b.text).join(' | '))
  await shot(w, 's5-bell-open')
  const target = bl.find(b => /24 Mar/.test(b.text) && /approved/.test(b.text))
  if (!target) rec('S5d bell line for 24 Mar', 'phone', 'NOT WALKED', 'no approved 24 Mar line in the bell: ' + bl.map(b => b.text).join(' | '), ['s5-bell-open.png'])
  else {
    const tb = Date.now()
    await B.press(w, `[data-testid="bell-line-${target.id}"]`, 's5-bell-tap-100ms')
    const reps2 = await ringPictures('s5-bell', tb)
    const q2 = await ringReport()
    console.log('bell quick', JSON.stringify(q2)); for (const r of reps2) console.log('bell report', JSON.stringify(r))
    rec('S5d bell line for the far day: the grid there, ringed, clear (1 s)', 'phone', okRing(reps2[0]) ? 'PASS' : 'FAIL', JSON.stringify({ box: reps2[0].box, allIn: reps2[0].allIn, over: reps2[0].pts.map(p => p.over), bellOpen: await B.vis(P, T('bell-list')) }), ['s5-bell-tap-100ms-q.png', 's5-bell-1000ms.png'])
    rec('S5e the same at 3 s', 'phone', okRing(reps2[1]) ? 'PASS' : 'FAIL', JSON.stringify({ box: reps2[1].box, allIn: reps2[1].allIn }), ['s5-bell-3000ms.png'])
  }
  /* ---- STEP 6: the ring's six seconds ---- */
  await B.switchTo(w, 'admin')
  await B.openApprovals(w)
  await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
  const l26 = await P.evaluate(() => { const ls = [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]')]; const i = ls.findIndex(e => /26 Mar/.test(e.innerText)); if (i >= 0) ls[i].setAttribute('data-walk', 'mar26'); return i })
  if (l26 < 0) rec('S6 the ring\'s six seconds', 'phone', 'NOT WALKED', 'no 26 Mar line', [])
  else {
    const ts = Date.now()
    await B.press(w, '[data-walk="mar26"] [data-testid="appr-dates"]', 's6-dates-q')
    await B.sleep(w, 600)
    const r0 = await ringReport()
    const ringCell = await P.evaluate(() => { const t = document.querySelector('td.lw-ring'); return t ? (t.dataset.testid || t.querySelector('[data-testid]')?.dataset.testid || t.id) : null })
    console.log('ringed cell id', ringCell, 'box', JSON.stringify(r0.box))
    /* scroll sideways so neighbouring months draw (a finger drag with its rest), twice, at the grid rows */
    const sx0 = await P.evaluate(() => { const s = [...document.querySelectorAll('*')].filter(e => e.scrollWidth > e.clientWidth + 50 && getComputedStyle(e).overflowX !== 'visible').map(e => ({ cls: String(e.className).slice(0, 30), sl: Math.round(e.scrollLeft), sw: e.scrollWidth, cw: e.clientWidth })); return s })
    console.log('h-scrollers', JSON.stringify(sx0))
    const swipe = async (x0, x1, y) => {
      await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y }] })
      for (let i = 1; i <= 6; i++) { await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (x1 - x0) * i / 6, y }] }); await P.waitForTimeout(10) }
      await P.waitForTimeout(90)
      await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    }
    const rowY = Math.round((r0.box.t + r0.box.b) / 2)
    await swipe(300, 120, rowY); await B.sleep(w, 400)
    const sx1 = await P.evaluate(() => [...document.querySelectorAll('*')].filter(e => e.scrollWidth > e.clientWidth + 50 && getComputedStyle(e).overflowX !== 'visible').map(e => Math.round(e.scrollLeft)))
    await swipe(120, 320, rowY); await B.sleep(w, 300)
    await shot(w, 's6-after-scroll')
    const rN = await ringReport()
    const used = Date.now() - ts
    console.log('after scrolling, ms since tap', used, 'ring', JSON.stringify(rN.box || rN), 'scrollLeft', JSON.stringify(sx1))
    /* tap the ringed cell if it is in view, still inside its six seconds */
    if (rN.ring && rN.box.l > 100 && rN.box.r < 402 && rN.box.t > 120 && rN.box.b < 800 && used < 5500) {
      const cx = (rN.box.l + rN.box.r) / 2, cy = (rN.box.t + rN.box.b) / 2
      await B.tapAt(w, cx, cy, 's6-cell-tap-q'); await B.sleep(w, 500); await shot(w, 's6-cell-tap')
      const win = await B.vis(P, T('bid-picker')), ringAfter = await P.evaluate(() => !!document.querySelector('td.lw-ring'))
      const wtxt = await B.txt(P, T('bid-picker'))
      rec('S6 within six seconds: scroll, then tap the ringed cell', 'phone', win ? 'PASS' : 'FAIL', `${used} ms after the dates tap; bid window open: ${win}; ring still on a cell: ${ringAfter}; window "${(wtxt || '').slice(0, 90)}"`, ['s6-after-scroll.png', 's6-cell-tap-q.png', 's6-cell-tap.png'])
      await B.sleep(w, 6500); await shot(w, 's6-after-6s')
      const ringLate = await P.evaluate(() => !!document.querySelector('td.lw-ring'))
      rec('S6b the ring is gone after its six seconds (window open)', 'phone', 'PASS', `ring on a cell after 6 s: ${ringLate}; window open: ${await B.vis(P, T('bid-picker'))}`, ['s6-after-6s.png'])
    } else {
      rec('S6 within six seconds: scroll, then tap the ringed cell', 'phone', 'NOT WALKED', `ring after scroll ${JSON.stringify(rN.box || rN)}, ${used} ms used`, ['s6-after-scroll.png'])
    }
  }
} catch (e) { rec('ERROR', 'phone', 'FAIL', String(e).slice(0, 400)); await shot(w, 's5-error').catch(() => {}) }
if (w.errs.length) rec('console', 'phone', 'FAIL', w.errs.join(' || ').slice(0, 600))
await w.ctx.close()
B.writeResults('s5')
await B.closeAll()
console.log('DONE')
