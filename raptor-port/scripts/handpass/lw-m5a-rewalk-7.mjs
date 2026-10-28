// M5a re-walk 7 — the phone (402 x 874, touch, scale 3), admin, Chromium then WebKit: a refusal's words stay on the screen (17.3, an emptied box), the page does not
// scroll as a whole on Balances, a tapped box's pending figure in sight, the person window under the top bar, the tab row at 402 / 390 / 375 (and 320, 720 wide).
// usage: node lw-m5a-rewalk-7.mjs [chromium|webkit]
const ENGINE = process.argv[2] || 'chromium'
process.env.LW_OUT ||= `../../docs/img/handpass/2026-10-28-lw-m5a/rewalk/r7-${ENGINE}`
process.env.LW_TODAY ||= '2026-01-25'
const R = await import('./lw-m5a-rewalk-lib.mjs')
const { L, T, note, press, vis, txt, balRow, pwRead, closePw, tabRow, swipe, box, where, shot } = R
console.log('[lw-m5a-rewalk-7 v1]', ENGINE)
L.clearOut()
const S = '402 ' + ENGINE
const WK = ENGINE === 'webkit'
const w = WK ? await R.newWebkitPhone() : await L.newCtx('phone'); const P = w.page
const ok = c => (c ? 'PASS' : 'FAIL')
const blk = async (name, fn) => { try { await fn() } catch (e) { note(name + ' (script)', S, 'NOT WALKED', 'the step threw: ' + String(e).slice(0, 300)); await shot(w, 'err-' + name).catch(() => {}) } }
const doc = () => P.evaluate(() => ({ sh: document.documentElement.scrollHeight, ih: innerHeight, sy: Math.round(scrollY), pageB: Math.round(document.getElementById('page-leavewar').getBoundingClientRect().bottom), tabTop: Math.round(document.querySelector('.lw-tabs').getBoundingClientRect().top) }))
const errBox = id => P.evaluate(id => {
  const e = document.querySelector(`[data-testid="${id}-err"]`); if (!e) return null
  const r = e.getBoundingClientRect(); const sc = document.querySelector('[data-testid="bal-scroll"]').getBoundingClientRect()
  return { text: e.textContent.trim(), l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), vw: innerWidth, scL: Math.round(sc.left), scR: Math.round(sc.right), cut: e.scrollWidth > e.clientWidth }
}, id)

await blk('signin', async () => { await L.signIn(w, 'admin') })

await blk('tabs', async () => {
  for (const vw of [402, 390, 375]) {
    await P.setViewportSize({ width: vw, height: 874 }); await P.waitForTimeout(600)
    const tr = await tabRow(P)
    const one = tr.tabs.every(t => t.top === tr.tabs[0].top) && tr.gear && tr.tabs.every(t => t.right <= tr.gear.left) && tr.gear.right <= tr.vw && tr.sw <= tr.vw
    await P.screenshot({ path: `${L.OUT}/t1-tabs-${vw}.png`, clip: { x: 0, y: 0, width: vw, height: 110 }, scale: 'css' })
    note(`T${vw} tab row at ${vw}: one line, nothing over anything, page not wider than the screen`, S, ok(one), `icons ${tr.tabs.map(t => t.icon ? 'Y' : 'n').join('')}; tabs ${tr.tabs.map(t => t.label.slice(0, 5) + ' ' + t.left + '-' + t.right).join(', ')}; gear ${tr.gear?.left}-${tr.gear?.right}; scrollWidth ${tr.sw}`, [`t1-tabs-${vw}`])
  }
  await P.setViewportSize({ width: 402, height: 874 }); await P.waitForTimeout(500)
})

await blk('balances-page', async () => {
  const d0 = await doc()
  await R.openBalances(w)
  const d1 = await doc()
  await shot(w, 'p1-balances-rest')
  note('B5a the Balances page fits the screen: the document is no taller than it', S, ok(d1.sh <= d1.ih), `document ${d1.sh} high on a ${d1.ih} screen (Grid tab: ${d0.sh}); page bottom ${d1.pageB}; scrollY ${d1.sy}`, ['p1-balances-rest'])
  // open Balances after scrolling the grid
  await L.openGrid(w); await P.waitForTimeout(400)
  await P.evaluate(() => { window.scrollTo(0, 300); document.scrollingElement.scrollTop = 300; const m = document.querySelector('.mx-outer, .lw-grid, #page-leavewar'); if (m) m.scrollTop = 200 })
  await P.waitForTimeout(300)
  const d4 = await doc()
  await P.evaluate(() => document.querySelector('[data-testid="lw-tab-balances"]').click()); await P.waitForSelector(T('balances-page'), { state: 'visible', timeout: 10000 }); await P.waitForTimeout(600)
  const d5 = await doc(); await shot(w, 'p3-balances-after-grid-scroll')
  note('B5d Balances opened after the grid was scrolled: the document still fits, scrollY 0', S, ok(d5.sh <= d5.ih && d5.sy === 0), `grid scrollY ${d4.sy} → Balances: document ${d5.sh}/${d5.ih}, scrollY ${d5.sy}`, ['p3-balances-after-grid-scroll'])
})

await blk('refusal', async () => {
  await P.evaluate(() => { document.querySelector('[data-testid="bal-scroll"]').scrollTo(0, 0) }); await P.waitForTimeout(300)
  await R.typeInBox(w, T('bal-LVE-bane'), 16)
  await R.typeInBox(w, T('bal-LVE-bane'), '17.3')
  const e = await errBox('bal-LVE-bane'); const b = await balRow(P, 'bane'); await shot(w, 'p4-refused-17.3')
  note('R1 App bal 17.3 + Enter: the words stay on the screen (and inside the sliding area), old figure back', S, ok(e && e.l >= 0 && e.r <= e.vw && e.l >= e.scL - 0.5 && e.r <= e.scR + 0.5 && b.app === '16'), `words "${e?.text}"; x ${e?.l}–${e?.r} of ${e?.vw}; sliding area ${e?.scL}–${e?.scR}; box reads ${b.app}`, ['p4-refused-17.3'])
  await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  // a box far to the right
  await P.evaluate(() => { document.querySelector('[data-testid="bal-scroll"]').scrollTo(0, 0) })
  await R.typeInBox(w, T('bal-CL-bane'), 'abc')
  const e2 = await errBox('bal-CL-bane'); await shot(w, 'p5-refused-CL')
  note('R2 a refusal on CL (the far right box): the words on the screen', S, ok(e2 && e2.l >= 0 && e2.r <= e2.vw), `words "${e2?.text}"; x ${e2?.l}–${e2?.r} of ${e2?.vw}`, ['p5-refused-CL'])
  await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  // an emptied box
  await P.evaluate(() => { document.querySelector('[data-testid="bal-scroll"]').scrollTo({ left: 0, top: 0 }) }); await P.waitForTimeout(300)
  await press(w, T('bal-LVE-bane')); await P.waitForTimeout(w.phone ? 650 : 150)
  await P.keyboard.press('Control+A'); await P.keyboard.press('Backspace'); await P.waitForTimeout(150); await P.keyboard.press('Enter'); await P.waitForTimeout(600)
  const e3 = await errBox('bal-LVE-bane'); const b3 = await balRow(P, 'bane'); await shot(w, 'p6-emptied')
  note('R3 an emptied App bal box + Enter: "Type a figure" on the screen, the old figure kept', S, ok(e3 && /Type a figure/i.test(e3.text) && e3.l >= 0 && e3.r <= e3.vw && b3.app === '16'), `words "${e3?.text}"; x ${e3?.l}–${e3?.r} of ${e3?.vw}; box ${b3.app}`, ['p6-emptied'])
  await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  await P.evaluate(() => { document.activeElement?.blur?.() })
})

await blk('tap-pl', async () => {
  await P.evaluate(() => { document.querySelector('[data-testid="bal-scroll"]').scrollTo({ left: 0, top: 0 }) }); await P.waitForTimeout(300)
  for (const k of ['PL', 'CCL', 'CL']) {
    await P.keyboard.press('Escape'); await P.waitForTimeout(200)
    await P.evaluate(() => { document.querySelector('[data-testid="bal-scroll"]').scrollTo({ left: 0, top: 0 }) }); await P.waitForTimeout(300)
    await press(w, T(`bal-${k}-bane`), `p7-tap-${k}-q`); await P.waitForTimeout(800)
    const g = await P.evaluate(k => {
      const bx = document.querySelector(`[data-testid="bal-${k}-bane"]`).getBoundingClientRect()
      const pd = document.querySelector(`[data-testid="bal-opd-${k}-bane"]`)?.getBoundingClientRect()
      const who = document.querySelector('.bp-row .bp-who')?.getBoundingClientRect()
      return { box: [Math.round(bx.left), Math.round(bx.right)], pend: pd ? [Math.round(pd.left), Math.round(pd.right)] : null, whoR: Math.round(who?.right ?? 0), vw: innerWidth }
    }, k)
    await shot(w, `p7-tap-${k}`)
    note(`B4 a tap on Ranger's ${k} box: the box and its amber pending figure both in sight (clear of the names column, inside the screen)`, S, ok(g.pend && g.box[0] >= g.whoR - 1 && g.pend[1] <= g.vw), `box x ${g.box}; pending x ${g.pend}; names end ${g.whoR}; screen ${g.vw}`, [`p7-tap-${k}-q`, `p7-tap-${k}`])
  }
  await P.keyboard.press('Escape')
})

await blk('window', async () => {
  await P.evaluate(() => { document.activeElement?.blur?.() })
  await L.openGrid(w); await P.waitForTimeout(400)
  await press(w, T('my-leave'), 'p8-myleave-q'); await P.waitForTimeout(900)
  const pw = await pwRead(P); await shot(w, 'p8-window')
  const bar = await P.evaluate(() => { const els = ['#undoBtn', '#notifyBell', '.topbar', '#topbar', 'header'].map(s => document.querySelector(s)).filter(Boolean); return Math.max(...els.map(e => e.getBoundingClientRect().bottom)) })
  note('B7 the phone\'s person window stands under the top bar (the drawing ~70)', S, ok(pw && pw.box.top >= bar - 0.5 && pw.box.top >= 60), `window ${pw?.box.left}–${pw?.box.right} x ${pw?.box.top}–${pw?.box.bottom} of ${pw?.vw}x${pw?.vh}; top bar's lowest edge ${Math.round(bar)}`, ['p8-myleave-q', 'p8-window'])
  await closePw(w)
  await R.openBalances(w)
  await press(w, T('bal-name-bane'), 'p9-name-q'); await P.waitForTimeout(900)
  const pw2 = await pwRead(P); await shot(w, 'p9-window-from-balances')
  note('B7b … and from a name on the Balances page', S, ok(pw2 && pw2.box.top >= bar - 0.5), `window top ${pw2?.box.top}, bottom ${pw2?.box.bottom}; bar ${Math.round(bar)}`, ['p9-window-from-balances'])
  await closePw(w)
})

if (!WK) await blk('swipe', async () => {
  await L.openGrid(w); await R.openBalances(w); await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
  const d1 = await doc()
    await swipe(w, 200, 150, 200, 60, { steps: 6, dwell: 16, rest: 100 }); await P.waitForTimeout(500)
    const d2 = await doc(); await shot(w, 'p2-swipe-from-tab-row')
    note('B5b a swipe up from the tab row / bar area: the page does not scroll, the tab row stays under the top bar', S, ok(d2.sy === 0 && d2.tabTop === d1.tabTop), `scrollY ${d2.sy}; tab row top ${d1.tabTop} → ${d2.tabTop}`, ['p2-swipe-from-tab-row'])
    await swipe(w, 200, 300, 200, 120, { steps: 6, dwell: 16, rest: 100 }); await P.waitForTimeout(500)
    const d3 = await doc()
    note('B5c a swipe up inside the list scrolls the list, not the page', S, ok(d3.sy === 0 && (await where(P)).top > 0), `scrollY ${d3.sy}; list scrollTop ${(await where(P)).top}`, [])
    await P.evaluate(() => { document.querySelector('[data-testid="bal-scroll"]').scrollTo(0, 0) })
})

if (!WK) await blk('tabs-wide', async () => {
  for (const vw of [320, 720]) {
    await P.setViewportSize({ width: vw, height: 874 }); await P.waitForTimeout(700)
    await L.openGrid(w).catch(() => {})
    const tr = await tabRow(P)
    await P.screenshot({ path: `${L.OUT}/t2-tabs-${vw}.png`, clip: { x: 0, y: 0, width: vw, height: 130 }, scale: 'css' })
    const oil = tr.tabs.find(t => t.id === 'oil-tracker')
    const noOverlap = tr.gear && oil && oil.right <= tr.gear.left
    const cnt = await P.evaluate(() => { const n = document.querySelector('.appr-tabn'); const t = n?.closest('[role="tab"]'); if (!n || !t) return null; const a = n.getBoundingClientRect(), b = t.getBoundingClientRect(); return { n: [Math.round(a.left), Math.round(a.right)], tab: [Math.round(b.left), Math.round(b.right)] } })
    note(`T${vw} tab row at ${vw}: one line, ⚙ not over OIL, ⚙ and the page inside the screen, Approvals' count inside its tab`, S, ok(noOverlap && tr.gear.right <= tr.vw && tr.sw <= tr.vw && (!cnt || cnt.n[1] <= cnt.tab[1])), `icons ${tr.tabs.map(t => t.icon ? 'Y' : 'n').join('')}; tabs ${tr.tabs.map(t => t.id.replace('lw-tab-', '') + ' ' + t.left + '-' + t.right).join(', ')}; gear ${tr.gear?.left}-${tr.gear?.right}; scrollWidth ${tr.sw}/${tr.vw}; count ${JSON.stringify(cnt)}`, [`t2-tabs-${vw}`])
    if (vw === 320) {
      await press(w, T('oil-tracker')); await P.waitForTimeout(900)
      const oilOpen = await P.evaluate(() => ({ settings: !!document.querySelector('[data-testid="settings-sheet"]') && document.querySelector('[data-testid="settings-sheet"]').getBoundingClientRect().width > 0, oil: !!document.querySelector('.oil-tracker, [data-testid="oil-page"], [data-testid^="oil-"]:not([data-testid="oil-tracker"])') }))
      await shot(w, 't3-oil-pressed-320')
      note('T320b a press on OIL at 320 opens the OIL tracker, not Settings', S, ok(!oilOpen.settings), `settings window open ${oilOpen.settings}; an OIL element drawn ${oilOpen.oil}`, ['t3-oil-pressed-320'])
      await P.keyboard.press('Escape'); await P.waitForTimeout(400)
    }
  }
  await P.setViewportSize({ width: 402, height: 874 })
})
note('errors (console, page, 4xx)', S, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 800) : 'none')
R.dump('r7-' + ENGINE)
await w.ctx.close(); if (WK) await w.bw.close(); else await L.closeBrowser()
console.log('DONE')
