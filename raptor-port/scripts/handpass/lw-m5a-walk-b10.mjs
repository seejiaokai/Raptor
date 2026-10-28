// Walker B, script 10: a SLOW pinch, then a tap on a box at the pinched-out resting place (lesson 2 and 5; font size for his iPhone).
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/b'
const B = await import('./lw-m5a-walk-b-lib.mjs')
const { L, T, rec, shot, press, openBalances, balRow, pinch, typeInBox } = B
console.log('[lw-m5a-walk-b10 v1]')
const w = await L.newCtx('phone'); const P = w.page
const geo = () => P.evaluate(() => { const s = document.querySelector('[data-testid="bal-scroll"]'); const z = document.querySelector('.bp-zoom'); return { sl: Math.round(s.scrollLeft), sw: s.scrollWidth, cw: s.clientWidth, zoom: z?.style.zoom || '1', win: Math.round(scrollY), docVV: Math.round(visualViewport.scale * 100) / 100 } })
await L.signIn(w, 'admin'); await openBalances(w)
await B.pinch(w, 201, 500, 280, 100, { steps: 40, dwell: 30, rest: 150 }); await P.waitForTimeout(900)
const g1 = await geo(); await shot(w, 'v1-slow-pinch-together')
rec('2 a SLOW pinch together (40 steps over 1.2 s)', '402', g1.sw <= g1.cw && g1.win === 0 && g1.docVV === 1 ? 'PASS' : 'FAIL', `zoom ${g1.zoom}; scroll width ${g1.sw} vs ${g1.cw}; window scroll ${g1.win}; page-zoom ${g1.docVV}`, ['v1-slow-pinch-together'])
/* a tap on Ranger's App bal box at the resting place */
const bx = await P.evaluate(() => { const e = document.querySelector('[data-testid="bal-LVE-bane"]'); const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), fs: cs.fontSize, zoomEff: (r.width / e.offsetWidth).toFixed(2) } })
await press(w, T('bal-LVE-bane'), 'v1-tap-pinched-q'); await P.waitForTimeout(800)
const g2 = await geo(); await shot(w, 'v1-tap-pinched')
const foc = await P.evaluate(() => { const e = document.activeElement; const r = e.getBoundingClientRect(); return { id: e.dataset.testid, x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), fs: getComputedStyle(e).fontSize } })
rec('5 a tap on a box at the pinched-out resting place', '402', foc.id === 'bal-LVE-bane' && g2.sw <= g2.cw ? 'PASS' : 'FAIL', `box before ${JSON.stringify(bx)}; focused after ${JSON.stringify(foc)}; zoom ${g2.zoom}; computed font ${foc.fs} drawn ${bx.zoomEff}x — on his iPhone a box whose letters are drawn under 16 px makes Safari zoom the whole page on focus (only his phone shows it)`, ['v1-tap-pinched-q', 'v1-tap-pinched'])
await typeInBox(w, T('bal-LVE-bane'), 16, true)
const r = await balRow(P, 'bane'); await shot(w, 'v1-typed-pinched')
rec('3 typed 16 + Enter at the pinched-out size', '402', r.app === '16' && /13\.5/.test(r.war) ? 'PASS' : 'FAIL', `App bal ${r.app}, War bal ${r.war}; zoom ${(await geo()).zoom}`, ['v1-typed-pinched'])
await L.undo(w)
/* pinch apart slowly, names column and heading held */
await B.pinch(w, 201, 500, 100, 300, { steps: 40, dwell: 30, rest: 150 }); await P.waitForTimeout(900)
const g3 = await geo(); await shot(w, 'v1-slow-pinch-apart')
const hold = await P.evaluate(() => ({ whoL: Math.round(document.querySelector('.bp-row .bp-who').getBoundingClientRect().left), colsT: Math.round(document.querySelector('.bp-cols').getBoundingClientRect().top) }))
rec('2 a SLOW pinch apart; names and heading row held', '402', g3.win === 0 && hold.whoL === 0 && hold.colsT === 193 ? 'PASS' : 'FAIL', `zoom ${g3.zoom}; scroll ${g3.sl}; names left ${hold.whoL}; heading top ${hold.colsT}`, ['v1-slow-pinch-apart'])
rec('errors', '402', w.errs.length ? 'FAIL' : 'PASS', B.errsOf(w), [])
L.writeResults('b10')
await w.ctx.close(); await L.closeBrowser()
