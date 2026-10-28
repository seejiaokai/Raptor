// Re-walk A6 — the desktop slim bar (D1432) and what stands over it (a person window, the manning bubble, another cell, Back, X).
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/a'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, lineLoc, approveBtn, pressLoc, lineInfo } = A
const { T, rec, shot, txt, press, vis } = L
console.log('[lw-m4-rw-a6 v1]')
const w = await L.newCtx('desk')
const P = w.page
const box = sel => P.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return r.height > 0 ? { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) } : null }, sel)
const inter = (a, b) => a && b && a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b
const centreCell = async (who, iso) => { await L.reachCell(w, who, iso); await P.evaluate(id => document.querySelector(`[data-testid="${id}"]`)?.scrollIntoView({ block: 'center', inline: 'center' }), L.cellId(who, iso)); await P.waitForTimeout(400) }
const slimInfo = () => P.evaluate(() => {
  const s = document.querySelector('[data-testid="appr-slim"]'); if (!s) return null
  const c = getComputedStyle(s), r = s.getBoundingClientRect()
  const back = s.querySelector('[data-testid="appr-back"]'), x = s.querySelector('[data-testid="appr-slim-x"]')
  const cs = e => { const k = getComputedStyle(e); return { bg: k.backgroundColor, bd: k.borderTopWidth + ' ' + k.borderTopStyle + ' ' + k.borderTopColor, color: k.color } }
  return { text: s.innerText.replace(/\s+/g, ' ').trim(), l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height), vw: innerWidth, vh: innerHeight, root: { bg: c.backgroundColor, bd: c.borderTopWidth + ' ' + c.borderTopStyle + ' ' + c.borderTopColor, shadow: c.boxShadow.slice(0, 50), z: c.zIndex }, back: back && cs(back), x: x && cs(x), xtext: x && x.innerText }
})
try {
  await L.signIn(w, 'admin')
  // set-up: Ranger's bid; four IW-group bids (approved, Approve what I enter on) on Jan 15 so a fifth turns a row amber/red
  await L.switchTo(w, 'member')
  await centreCell('bane', '2026-01-13'); await L.openCell(w, 'bane', '2026-01-13'); await L.placeLeave(w, 'LL')
  await L.switchTo(w, 'admin')
  for (const id of ['dice', 'glass', 'freak', 'drill']) { await centreCell(id, '2026-01-15'); await L.openCell(w, id, '2026-01-15'); await L.placeLeave(w, 'LL'); await P.waitForTimeout(400) }
  await P.keyboard.press('Escape'); await P.evaluate(() => { window.scrollTo(0, 0); document.querySelectorAll('*').forEach(e => { if (e.scrollTop && e.id !== 'hscroll') e.scrollTop = 0 }) }); await P.waitForTimeout(500)
  await L.openApprovals(w)
  // a lit line to check Back keeps it
  await pressLoc(w, approveBtn(P, 'Thu 8 Jan')); await P.waitForTimeout(500)
  const litBefore = (await lineInfo(P, 'Thu 8 Jan')).cls
  // dates -> grid
  await pressLoc(w, lineLoc(P, 'Tue 13 Jan').locator('[data-testid="appr-dates"]')); await P.waitForTimeout(1200)
  await shot(w, 'a6-1-slim-up')
  const si = await slimInfo(); console.log('SLIM', JSON.stringify(si))
  const ring = await P.evaluate(() => { const td = document.querySelector('td.lw-ring'); if (!td) return null; const r = td.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) } })
  console.log('RING', JSON.stringify(ring))
  rec('A6.1 dates -> the grid, the cell ringed, the slim bar up', 'desk', si && ring ? 'PASS' : 'FAIL', `bar "${si && si.text}" ring ${JSON.stringify(ring)}`, ['a6-1-slim-up'])
  const centred = si && Math.abs((si.l) - (si.vw - si.r)) <= 3
  const plain = si && /^0px/.test(si.root.bd) || (si && !/59, 198, 232/.test(si.root.bd))
  rec('A6.2 the bar is compact, centred, plain (no cyan outline); Back plain cyan words, plain X', 'desk', si && centred && si.w < si.vw * 0.5 && plain && /Back/.test(si.text) ? 'PASS' : 'FAIL', `width ${si && si.w} of ${si && si.vw}; left gap ${si && si.l} right gap ${si && si.vw - si.r}; bar border "${si && si.root.bd}" bg ${si && si.root.bg}; Back ${JSON.stringify(si && si.back)}; X ${JSON.stringify(si && si.x)} "${si && si.xtext}"`, ['a6-1-slim-up'])
  await shot(w, 'a6-1b-slim-zoom', { clip: { x: Math.max(0, si.l - 40), y: si.t - 30, width: si.w + 80, height: si.h + 60 } })
  // a person window with the bar up
  await press(w, `${T('row-bane')} .cs`).catch(async () => { await press(w, T('row-bane')) }); await P.waitForTimeout(700)
  await shot(w, 'a6-2-person-window')
  const dlg = await P.evaluate(() => [...document.querySelectorAll('[role=dialog], .sheet, .lw-sheet, [data-testid*="person"], [data-testid*="sheet"]')].filter(e => e.getBoundingClientRect().height > 0).map(e => ({ id: e.dataset.testid || '', cls: String(e.className).slice(0, 30), z: getComputedStyle(e).zIndex, r: (({ left, top, right, bottom }) => [Math.round(left), Math.round(top), Math.round(right), Math.round(bottom)])(e.getBoundingClientRect()) })))
  console.log('windows after name tap:', JSON.stringify(dlg))
  const sb = await box(T('appr-slim'))
  const winZ = await P.evaluate(() => { const s = document.querySelector('[data-testid="appr-slim"]'); const r = s.getBoundingClientRect(); const pts = [0.1, 0.5, 0.9].map(f => { const e = document.elementFromPoint(r.left + r.width * f, r.top + r.height / 2); return s.contains(e) ? 'bar' : (e ? e.tagName + '.' + String(e.className).slice(0, 24) + (e.dataset.testid ? '#' + e.dataset.testid : '') : null) }); return pts })
  console.log('at the bar\'s left/middle/right with the window up:', JSON.stringify(winZ), 'bar box', JSON.stringify(sb))
  const overlapsAny = dlg.some(d => sb && d.r[0] < sb.r && sb.l < d.r[2] && d.r[1] < sb.b && sb.t < d.r[3])
  const barOnTop = winZ.every(x => x === 'bar')
  rec('A6.3 a person window (tap a name) stands above the bar', 'desk', dlg.length && (!overlapsAny || !barOnTop) ? 'PASS' : (dlg.length ? 'FAIL' : 'NOT WALKED'), `${dlg.length} window box(es); overlaps bar: ${overlapsAny}; bar on top at its three points: ${barOnTop} (${JSON.stringify(winZ)}); windows ${JSON.stringify(dlg)}`, ['a6-2-person-window'])
  await P.keyboard.press('Escape'); await P.waitForTimeout(500)
  if (dlg.length === 0 || await P.locator('[role=dialog]').count()) { await P.keyboard.press('Escape'); await P.waitForTimeout(300) }
  // a bid that turns a row amber/red: the manning bubble above the bar
  await centreCell('nasty', '2026-01-15'); await L.openCell(w, 'nasty', '2026-01-15'); await shot(w, 'a6-3-window-over-bar')
  const wb = await box(T('bid-picker')); const sb2 = await box(T('appr-slim'))
  const winOver = await P.evaluate(() => { const s = document.querySelector('[data-testid="appr-slim"]'); const r = s.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return s.contains(e) ? 'bar' : (e ? e.tagName + '.' + String(e.className).slice(0, 24) : null) })
  console.log('bid window', JSON.stringify(wb), 'bar', JSON.stringify(sb2), 'on top at bar centre:', winOver)
  rec('A6.4 the bid window opened over the bar stands above it (A-F6)', 'desk', wb && sb2 && (!inter(wb, sb2) || winOver !== 'bar') ? 'PASS' : 'FAIL', `window ${JSON.stringify(wb)} bar ${JSON.stringify(sb2)} topmost at the bar's centre: ${winOver}`, ['a6-3-window-over-bar'])
  await L.placeLeave(w, 'LL'); await P.waitForTimeout(800)
  await shot(w, 'a6-4-bubble')
  const bub = await box(T('manning-bubble')); const sb3 = await box(T('appr-slim'))
  const bubTxt = await txt(P, T('manning-bubble'))
  const bubTop = bub ? await P.evaluate(() => { const b = document.querySelector('[data-testid="manning-bubble"]'); const r = b.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return b.contains(e) }) : null
  console.log('bubble', JSON.stringify(bub), '"' + bubTxt + '"', 'bar', JSON.stringify(sb3), 'bubble on top at its centre', bubTop)
  rec('A6.5 the manning bubble stands ABOVE the slim bar (B-F3)', 'desk', bub && sb3 && !inter(bub, sb3) && bub.b <= sb3.t + 1 && bubTop ? 'PASS' : (bub ? 'FAIL' : 'NOT WALKED'), `bubble ${JSON.stringify(bub)} "${bubTxt}"; bar ${JSON.stringify(sb3)}; bubble bottom ${bub && bub.b} vs bar top ${sb3 && sb3.t}`, ['a6-4-bubble'])
  // lesson 4: tap another cell on the grid with the bar up
  const barBefore = !!(await box(T('appr-slim')))
  await centreCell('slash', '2026-01-20'); await L.openCell(w, 'slash', '2026-01-20'); await P.waitForTimeout(500)
  await shot(w, 'a6-5-another-cell')
  const opened = await vis(P, T('bid-picker')); const barStill = !!(await box(T('appr-slim')))
  rec('A6.6 with the bar up, another cell tapped: its window opens, the bar stays', 'desk', opened && barBefore && barStill ? 'PASS' : 'FAIL', `window opened ${opened}; bar before ${barBefore} after ${barStill}`, ['a6-5-another-cell'])
  await L.closeWin(w); await P.waitForTimeout(400)
  // Back keeps the lit lines
  await shot(w, 'a6-6-before-back')
  await press(w, T('appr-back')); await P.waitForTimeout(700)
  const litAfter = (await lineInfo(P, 'Thu 8 Jan')).cls
  await shot(w, 'a6-6-back')
  rec('A6.7 Back opens Approvals as left: the lit line still lit', 'desk', await vis(P, T('approvals-page')) && /lit-approved/.test(litAfter) ? 'PASS' : 'FAIL', `before "${litBefore}" after "${litAfter}"; slim gone ${!(await box(T('appr-slim')))}`, ['a6-6-back'])
  // the X
  await pressLoc(w, lineLoc(P, 'Tue 13 Jan').locator('[data-testid="appr-dates"]')); await P.waitForTimeout(1000)
  await press(w, T('appr-slim-x')); await P.waitForTimeout(700)
  await shot(w, 'a6-7-x')
  const tabLit = await P.evaluate(() => document.querySelector('[data-testid="lw-tab-approvals"]').className + '|' + document.querySelector('[data-testid="lw-tab-approvals"]').getAttribute('aria-selected'))
  rec('A6.8 X closes the bar and leaves Approvals (tab no longer lit)', 'desk', !(await box(T('appr-slim'))) && !(await vis(P, T('approvals-page'))) ? 'PASS' : 'FAIL', `bar gone ${!(await box(T('appr-slim')))}; approvals page visible ${await vis(P, T('approvals-page'))}; tab ${tabLit}`, ['a6-7-x'])
} catch (e) { rec('ERROR', 'desk', 'FAIL', String(e).slice(0, 400)); await shot(w, 'a6-error').catch(() => {}) }
if (w.errs.length) rec('console', 'desk', 'FAIL', w.errs.join(' || ').slice(0, 600))
await w.ctx.close(); L.writeResults('a6'); await L.closeBrowser(); console.log('DONE')
