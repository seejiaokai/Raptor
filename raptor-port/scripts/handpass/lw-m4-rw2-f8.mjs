// Re-walk walker B, B5: the phone slim bar (D1440) beside r22-6-phone, the ringed cell at rest NOT under the bar, Back and X with a finger,
// and with the bar up: a person window above it; a bid that turns a row amber or red (the bubble above the bar). Chromium 402x874.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk2'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { L, T, shot, rec } = B
console.log('[lw-m4-rw2-f8 v1]')
const w = await B.newPhone(402, 874, 'chromium')
const P = w.page
const box = sel => P.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return r.height > 0 ? { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) } : null }, sel)
const inter = (a, b) => a && b && a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b
const atCentre = (sel) => P.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!h && (e === h || e.contains(h)) }, sel)
const ringReport = () => P.evaluate(() => {
  const td = document.querySelector('td.lw-ring')
  if (!td) return { ring: false }
  const r = td.getBoundingClientRect()
  const pts = [[0.5, 0.5], [0.15, 0.15], [0.85, 0.15], [0.15, 0.85], [0.85, 0.85]].map(([fx, fy]) => { const x = r.left + r.width * fx, y = r.top + r.height * fy; const e = document.elementFromPoint(x, y); return { in: !!e && (td === e || td.contains(e)), over: e ? (e.tagName + '.' + String(e.className).slice(0, 30) + (e.dataset && e.dataset.testid ? '#' + e.dataset.testid : '')) : null } })
  const slim = document.querySelector('[data-testid="appr-slim"]'); const sb = slim ? slim.getBoundingClientRect() : null
  return { ring: true, box: { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) }, allIn: pts.every(p => p.in), over: pts.map(p => p.over), slimTop: sb ? Math.round(sb.top) : null, vh: innerHeight }
})
const slimStyle = () => P.evaluate(() => {
  const s = document.querySelector('[data-testid="appr-slim"]')
  const st = e => { const c = getComputedStyle(e); const r = e.getBoundingClientRect(); return { tag: e.tagName.toLowerCase() + (e.dataset.testid ? '#' + e.dataset.testid : '') + '.' + String(e.className).slice(0, 24), txt: e.children.length ? '' : e.textContent.trim().slice(0, 40), box: `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`, bg: c.backgroundColor, bd: `${c.borderTopWidth} ${c.borderTopStyle} ${c.borderTopColor}`, fg: c.color, shadow: c.boxShadow.slice(0, 40), fs: c.fontSize, fw: c.fontWeight } }
  const all = [s, ...s.querySelectorAll('*')]
  return { text: s.innerText.replace(/\s+/g, ' ').trim(), parts: all.map(st) }
})
try {
  await B.signIn(w, 'member')
  await L.openCell(w, 'bane', '2026-01-13'); await L.placeLeave(w, 'LL')
  await B.switchTo(w, 'admin')
  const DAY = '2026-01-15'
  for (const id of ['dice', 'glass', 'freak', 'drill']) { await L.openCell(w, id, DAY); await L.placeLeave(w, 'LL'); await B.sleep(w, 400) }
  { const c0 = await B.centre(P, T('lw-tab-approvals')); console.log('over the Approvals tab centre before opening:', JSON.stringify(await P.evaluate(({ x, y }) => { const h = document.elementFromPoint(x, y); const r = h.getBoundingClientRect(); return { el: h.tagName + '.' + String(h.className).slice(0, 40) + '#' + (h.dataset.testid || ''), txt: h.innerText.slice(0, 60), box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], scrollY: Math.round(scrollY), tabTop: Math.round(document.querySelector('[data-testid=lw-tab-approvals]').getBoundingClientRect().top) } }, c0))); await shot(w, 'f8-before-open-approvals') }
  await B.openApprovals(w)
  await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
  const idx = await P.evaluate(() => { const ls = [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]')]; const i = ls.findIndex(e => /13 Jan/.test(e.innerText)); if (i >= 0) ls[i].setAttribute('data-walk', 'j13'); return i })
  if (idx < 0) throw new Error('no 13 Jan line')
  const headerBefore = await P.evaluate(() => document.querySelector('[data-testid="appr-sub"]').innerText.trim())
  const t0 = Date.now()
  await B.press(w, '[data-walk="j13"] [data-testid="appr-dates"]', 'f8-dates-q')
  for (const ms of [1000]) { const wait = t0 + ms - Date.now(); if (wait > 0) await P.waitForTimeout(wait); await shot(w, `b5-dates-${ms}ms`) }
  const rr = await ringReport()
  const slim = await box(T('appr-slim'))
  const ss = await slimStyle()
  console.log('SLIM TEXT:', JSON.stringify(ss.text)); for (const p of ss.parts) console.log('  ', JSON.stringify(p))
  console.log('RING', JSON.stringify(rr), 'SLIM', JSON.stringify(slim))
  if (slim) await shot(w, 'f8-slim-zoom', { scale: 'device', clip: { x: 0, y: slim.t - 20, width: 402, height: 874 - slim.t + 20 } })
  const bm = await P.evaluate(() => { const s = document.querySelector('[data-testid="appr-slim"]'); const r = s.getBoundingClientRect(); const vv = window.visualViewport; return { left: +r.left.toFixed(1), right: +(innerWidth - r.right).toFixed(1), top: +r.top.toFixed(1), bottomGap: +(innerHeight - r.bottom).toFixed(1), h: +r.height.toFixed(1), w: +r.width.toFixed(1), iw: innerWidth, ih: innerHeight, vvh: vv ? vv.height : null } })
  console.log('SLIM MEASURE', JSON.stringify(bm))
  const okM = Math.abs(bm.left - 8) <= 1.5 && Math.abs(bm.right - 8) <= 1.5 && Math.abs(bm.h - 46) <= 2 && Math.abs(bm.bottomGap - 10) <= 2
  rec('F8 the bar stands 8 in from each side, 46 tall, its foot 10 above the screen foot (M13)', 'phone', okM ? 'PASS' : 'FAIL', 'measured '+JSON.stringify(bm), ['f8-slim-zoom'])
  rec('F8 dates tap: the grid comes up, the slim bar is up, the cell ringed', 'phone', slim && rr.ring ? 'PASS' : 'FAIL', `slim ${JSON.stringify(slim)} ring ${JSON.stringify(rr.box)}`, ['f8-dates-q', 'f8-dates-1000ms'])
  rec('F8 the ringed cell at rest is NOT under the bar (nothing over it)', 'phone', rr.ring && rr.allIn && rr.box.b <= rr.slimTop && rr.box.t >= 0 ? 'PASS' : 'FAIL', `cell ${JSON.stringify(rr.box)} bar top ${rr.slimTop}; five points on the cell all hit it: ${rr.allIn}; over: ${JSON.stringify(rr.over)}`, ['f8-dates-1000ms'])
  rec('F8 the bar reads "N pending" with no "·" before it', 'phone', /^\W*\S*\s*Approvals\s+\d+ pending/.test(ss.text) && !/Approvals\s*·/.test(ss.text) ? 'PASS' : 'FAIL', `bar text "${ss.text}"; page header was "${headerBefore}"`, ['f8-slim-zoom'])
  const parts = ss.parts
  const back = parts.find(p => /Back/.test(p.txt)), x = parts.find(p => /appr-slim-x/.test(p.tag) || p.txt === '✕' || p.txt === '×' || p.txt === '')
  const root = parts[0]
  console.log('root', JSON.stringify(root), 'back', JSON.stringify(back))
  /* Back with a finger */
  const outer = await P.evaluate(() => 0)
  await B.press(w, T('appr-back'), 'f8-back-q'); await B.sleep(w, 500); await shot(w, 'f8-back')
  const onAppr = await B.vis(P, T('approvals-page')), slimGone = !(await B.vis(P, T('appr-slim')))
  rec('F8 Back ▴ (finger) opens Approvals, the bar goes', 'phone', onAppr && slimGone ? 'PASS' : 'FAIL', `approvals page ${onAppr}; bar gone ${slimGone}`, ['f8-back-q', 'f8-back'])
  /* up again, then X with a finger */
  await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 250)
  await B.press(w, '[data-walk="j13"] [data-testid="appr-dates"]', null); await B.sleep(w, 900)
  await B.press(w, T('appr-slim-x'), 'f8-x-q'); await B.sleep(w, 500); await shot(w, 'f8-x')
  const tabLit = await P.evaluate(() => document.querySelector('[data-testid="lw-tab-approvals"]').classList.contains('on'))
  rec('F8 ✕ (finger) closes the bar and leaves Approvals', 'phone', !(await B.vis(P, T('appr-slim'))) && !(await B.vis(P, T('approvals-page'))) && !tabLit ? 'PASS' : 'FAIL', `bar ${await B.vis(P, T('appr-slim'))}; approvals page ${await B.vis(P, T('approvals-page'))}; Approvals tab lit ${tabLit}`, ['f8-x-q', 'f8-x'])
  /* the bar up once more: a person window above it */
  await B.openApprovals(w); await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 250)
  await P.evaluate(() => { const ls = [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]')]; ls.find(e => /13 Jan/.test(e.innerText)).setAttribute('data-walk', 'j13') })
  await B.press(w, '[data-walk="j13"] [data-testid="appr-dates"]', null); await B.sleep(w, 1200)
  const slimUp = await box(T('appr-slim'))
  await B.press(w, T('row-bane') + ' .cs, ' + T('row-bane') + ' td:first-child', 'f8-name-q').catch(async e => { console.log('name press failed', String(e).slice(0, 80)) })
  await B.sleep(w, 700); await shot(w, 'f8-person-window')
  const dlg = await P.evaluate(() => { const c = [...document.querySelectorAll('[role="dialog"], .sheet, .win, [data-testid*="person"]')].filter(e => e.getBoundingClientRect().height > 80); return c.map(e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, Math.min(r.bottom - 4, innerHeight - 2)); return { tag: e.tagName + '.' + String(e.className).slice(0, 30) + (e.dataset.testid ? '#' + e.dataset.testid : ''), l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), z: getComputedStyle(e).zIndex } }) })
  const slimNow = await box(T('appr-slim')); const slimOnTop = slimNow ? await atCentre(T('appr-slim')) : null
  console.log('windows', JSON.stringify(dlg), 'slim', JSON.stringify(slimNow), 'slim on top at its centre', slimOnTop)
  rec('F8 a person window opens with the bar up (look at the picture)', 'phone', dlg.length ? 'PASS' : 'NOT WALKED', `windows ${JSON.stringify(dlg)}; bar ${JSON.stringify(slimNow)} on top at its centre: ${slimOnTop}; before ${JSON.stringify(slimUp)}`, ['f8-name-q', 'f8-person-window'])
  await P.keyboard.press('Escape'); await B.sleep(w, 500)
  if (!(await B.vis(P, T('appr-slim')))) console.log('bar gone after the window closed?')
  await shot(w, 'f8-after-person')
  /* the bid that turns a row amber or red */
  await L.openCell(w, 'nasty', DAY, 'f8-bid-open-q'); await B.sleep(w, 300)
  await shot(w, 'f8-bidwin-with-bar')
  { const wb = await box(T('bid-picker')); const sbb = await box(T('appr-slim'))
    const wOn = await P.evaluate(() => { const b = document.querySelector('[data-testid="bid-picker"]'); if (!b) return null; const r = b.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.bottom - 6); return b.contains(h) })
    console.log('bid window', JSON.stringify(wb), 'bar', JSON.stringify(sbb), 'window foot hit', wOn)
    rec('F8 a window opened with the bar up stands above it (bottom above the bar, gap about 8)', 'phone', wb && sbb && wb.b <= sbb.t + 1 ? 'PASS' : (wb ? 'FAIL' : 'NOT WALKED'), `window ${JSON.stringify(wb)} bar ${JSON.stringify(sbb)}; gap ${wb && sbb ? sbb.t - wb.b : null}; window foot takes the press ${wOn}`, ['f8-bidwin-with-bar']) }
  const placed = await L.placeLeave(w, 'LL'); await B.sleep(w, 700)
  await shot(w, 'f8-bubble')
  const bub = await box(T('manning-bubble')); const sl3 = await box(T('appr-slim')); const bubTxt = await B.txt(P, T('manning-bubble'))
  const bubOn = bub ? await atCentre(T('manning-bubble')) : null, slimOn = sl3 ? await atCentre(T('appr-slim')) : null
  console.log('bubble', JSON.stringify(bub), bubTxt, 'slim', JSON.stringify(sl3), bubOn, slimOn)
  if (bub && sl3) await shot(w, 'f8-bubble-zoom', { scale: 'device', clip: { x: 0, y: Math.max(0, Math.min(bub.t, sl3.t) - 30), width: 402, height: 874 - Math.max(0, Math.min(bub.t, sl3.t) - 30) } })
  rec('F8 the bubble stands ABOVE the slim bar, nothing overlaps (B-F3)', 'phone', placed && bub && sl3 && bub.b <= sl3.t + 1 && !inter(bub, sl3) && bubOn && slimOn ? 'PASS' : (placed && bub ? 'FAIL' : 'NOT WALKED'), `placed ${placed}; bubble ${JSON.stringify(bub)} "${bubTxt}"; bar ${JSON.stringify(sl3)}; each on top at centre ${bubOn}/${slimOn}`, ['f8-bubble', 'f8-bubble-zoom'])
} catch (e) { rec('ERROR', 'phone', 'FAIL', String(e).slice(0, 400)); await shot(w, 'f8-error').catch(() => {}) }
if (w.errs.length) rec('console', 'phone', 'FAIL', w.errs.join(' || ').slice(0, 600))
await w.ctx.close()
B.writeResults('f8')
await B.closeAll()
console.log('DONE')
