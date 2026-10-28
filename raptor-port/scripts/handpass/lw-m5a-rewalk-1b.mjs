// M5a re-walk 1b — desktop admin: A-F4 measured on the pinned cells themselves (the th boxes, not the rows), A-F1's "left" ways
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/rewalk/r1b'
process.env.LW_TODAY ||= '2026-01-25'
const R = await import('./lw-m5a-rewalk-lib.mjs')
const { L, T, note, press, txt, balRow, shotD } = R
console.log('[lw-m5a-rewalk-1b v1]')
L.clearOut()
const S = 'desk'
const ok = c => (c ? 'PASS' : 'FAIL')
const w = await L.newCtx('desk'); const P = w.page
try {
  await L.signIn(w, 'admin'); await R.openBalances(w)
  for (const top of [0, 300, 1150, 2400]) {
    await P.evaluate(t => { document.querySelector('[data-testid="bal-scroll"]').scrollTop = t }, top); await P.waitForTimeout(500)
    const h = await P.evaluate(() => {
      const rows = [...document.querySelectorAll('.bp-table thead tr')].map(tr => { const th = [...tr.children].filter(c => c.getBoundingClientRect().width > 0); const tops = th.map(c => c.getBoundingClientRect().top), bots = th.map(c => c.getBoundingClientRect().bottom); return { top: Math.min(...tops), bottom: Math.max(...bots), n: th.length } })
      const sc = document.querySelector('[data-testid="bal-scroll"]').getBoundingClientRect()
      const y0 = rows[0].top, y1 = rows[rows.length - 1].bottom
      const bad = []
      for (let y = Math.ceil(y0) + 0.5; y < y1; y += 1) for (let x = 40; x < 1500; x += 40) {
        const e = document.elementFromPoint(x, y)
        if (e && !e.closest('thead')) bad.push(`${x},${y}→${e.tagName}${e.dataset?.testid ? '#' + e.dataset.testid : ''}`)
      }
      /* the first body row's top against the foot of the heading block, and the scroller's top against the heading block's top */
      return { rows, scTop: sc.top, bad: bad.slice(0, 6), nbad: bad.length, block: [Math.round(y0 * 10) / 10, Math.round(y1 * 10) / 10] }
    })
    const gap = Math.round((h.rows[1].top - h.rows[0].bottom) * 100) / 100
    await P.screenshot({ path: `${L.OUT}/40-scrolled-${top}.png`, clip: { x: 0, y: h.scTop - 4, width: 1100, height: 130 } })
    if (top === 1150) await shotD(w, '41-scrolled-1150-full')
    note(`F4 (A-F4) page scrolled ${top}: the two pinned heading rows meet, nothing drawn between or round them`, S, ok(Math.abs(gap) <= 0.5 && h.nbad === 0), `heading cells: row 1 ${h.rows[0].top.toFixed(1)}–${h.rows[0].bottom.toFixed(1)}, row 2 ${h.rows[1].top.toFixed(1)}–${h.rows[1].bottom.toFixed(1)}; gap ${gap}px; scroller top ${h.scTop.toFixed(1)}; sampled points inside the heading block that are not a heading cell: ${h.nbad} ${h.bad.join(' ')}`, [`40-scrolled-${top}`])
  }
  /* ---- the ways of leaving an emptied box */
  await P.evaluate(() => { document.querySelector('[data-testid="bal-scroll"]').scrollTop = 0 }); await P.waitForTimeout(300)
  const before = (await balRow(P, 'stiff')).app
  const empty = async () => { await press(w, T('bal-LVE-stiff')); await P.waitForTimeout(200); await P.keyboard.press('Control+A'); await P.keyboard.press('Backspace'); await P.waitForTimeout(150) }
  const read = async tag => { const v = await P.locator(T('bal-LVE-stiff')).inputValue(); const e = await txt(P, T('bal-LVE-stiff-err')); return { tag, v, e } }
  await empty(); await P.keyboard.press('Tab'); await P.waitForTimeout(250)
  const a = await read('Tab, 250ms'); await shotD(w, '50-blank-tab'); await P.waitForTimeout(900)
  const a2 = await read('Tab, 1150ms')
  note('F1d emptied box left by Tab: "Type a figure", old figure kept', S, ok(/Type a figure/i.test(a.e || '') && a.v === before), `${JSON.stringify(a)} then ${JSON.stringify(a2)}`, ['50-blank-tab'])
  await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  await empty(); await P.mouse.click(1000, 120); await P.waitForTimeout(250)
  const b = await read('click on the page, 250ms'); await shotD(w, '51-blank-click-away')
  note('F1e emptied box left by a click on empty page: "Type a figure", old figure kept', S, ok(/Type a figure/i.test(b.e || '') && b.v === before), JSON.stringify(b), ['51-blank-click-away'])
  await empty(); await press(w, T('bal-LVE-bane')); await P.waitForTimeout(250)
  const c = await read('another box pressed, 250ms'); await shotD(w, '52-blank-other-box')
  note('F1b emptied box left by pressing another box: "Type a figure", old figure kept', S, ok(/Type a figure/i.test(c.e || '') && c.v === before), JSON.stringify(c), ['52-blank-other-box'])
  await empty(); await press(w, T('bal-view-taken')); await P.waitForTimeout(500)
  await press(w, T('bal-view-bal')); await P.waitForTimeout(400)
  const d = await read('view switch pressed then back')
  note('F1f emptied box then the view switch: old figure kept', S, ok(d.v === before), JSON.stringify(d), [])
} catch (e) { note('ERROR', S, 'FAIL', String(e).slice(0, 600)); await L.shot(w, 'error').catch(() => {}) }
note('errors (console, page, 4xx)', S, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 800) : 'none')
R.dump('r1b')
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
