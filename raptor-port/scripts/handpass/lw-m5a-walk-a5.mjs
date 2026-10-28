// walker A, script 5 — admin, desktop: lesson 9 (every heading measured against its figures on every line, every kind of puck) and
// lesson 11 (wide screens: 2560 and a screen zoomed out to half — EMULATED by a wider viewport, not by Ctrl+scroll).
// node scripts/handpass/lw-m5a-walk-a5.mjs
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/a/a5'
process.env.LW_TODAY ||= '2026-01-25'
const A = await import('./lw-m5a-walk-a-lib.mjs')
const { L, T, rec, press, vis, txt, balRow, typeInBox, shotD } = A
console.log('[lw-m5a-walk-a5 v1]')
L.clearOut()
const S = 'desk'
const ok = c => (c ? 'PASS' : 'FAIL')
const w = await L.newCtx('desk'); const P = w.page

/* every heading (second heading row) against the figure under it, on every line: which edge matches (left / right / centre) and the
   worst deviation from the column's own median on that edge; also the kinds of puck present (the chip letters) */
const measure = () => P.evaluate(() => {
  const words = el => { const rg = document.createRange(); rg.selectNodeContents(el); const b = rg.getBoundingClientRect(); return b.width ? b : null }
  const tbl = document.querySelector('.bp-table'); if (!tbl) return { err: 'no table' }
  const heads = [...tbl.querySelectorAll('thead tr:last-child th')]
  const rows = [...tbl.querySelectorAll('tbody tr')].filter(r => r.dataset.testid?.startsWith('bal-row-'))
  const chips = {}
  for (const r of rows) { const c = r.querySelector('.cs-cat, .chip, [class*="cat"]')?.textContent.trim() || '?'; chips[c] = (chips[c] || 0) + 1 }
  const out = []
  heads.forEach((h, i) => {
    const hb = words(h); if (!hb) return
    const gaps = { left: [], right: [], centre: [] }
    let n = 0
    const rowsInfo = []
    for (const r of rows) {
      const c = r.children[i]; if (!c) continue
      const f = c.querySelector('input, button') || c.querySelector('.bp-ro, .bp-rogd, .bp-war, .bp-pend, span') || c
      const fb = (f.tagName === 'INPUT') ? f.getBoundingClientRect() : words(f)
      if (!fb || !fb.width) continue
      n++
      gaps.left.push(fb.left - hb.left); gaps.right.push(fb.right - hb.right); gaps.centre.push((fb.left + fb.width / 2) - (hb.left + hb.width / 2))
      rowsInfo.push({ id: r.dataset.testid.slice(8), txt: (f.value ?? f.textContent ?? '').toString().replace(/\s+/g, ' ').slice(0, 12) })
    }
    if (!n) return
    const med = a => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)]
    const spread = a => Math.max(...a) - Math.min(...a)
    const ta = getComputedStyle(h).textAlign
    const edge = (ta === 'right' || ta === 'end') ? 'right' : (ta === 'center' ? 'centre' : 'left')
    const arr = gaps[edge], m = med(arr)
    let worst = 0, who = ''
    arr.forEach((g, k) => { if (Math.abs(g - m) > Math.abs(worst)) { worst = g - m; who = rowsInfo[k].id + ' "' + rowsInfo[k].txt + '"' } })
    out.push({ heading: h.textContent.trim(), align: edge, offsetOfFiguresFromHeading: Math.round(m * 10) / 10, all: { left: Math.round(med(gaps.left)), right: Math.round(med(gaps.right)), centre: Math.round(med(gaps.centre)) }, spread: Math.round(spread(arr) * 10) / 10, worstRowDeviation: Math.round(worst * 10) / 10, worstRow: who, lines: n })
  })
  return { rows: rows.length, chips, cols: out }
})
const fmt = m => m.err ? m.err : `${m.rows} rows; ` + m.cols.map(c => `${c.heading}: heading ${c.align}-set: figure's ${c.align} edge ${c.offsetOfFiguresFromHeading > 0 ? '+' : ''}${c.offsetOfFiguresFromHeading}px from it [L ${c.all.left} R ${c.all.right} C ${c.all.centre}], spread ${c.spread}px${c.spread > 1.5 ? ` worst ${c.worstRow} ${c.worstRowDeviation}px` : ''}`).join(' · ')
try {
  await L.signIn(w, 'admin'); await A.openBalances(w)
  /* give the page the hard cases: a three-digit and a negative App bal, a wide carried fwd, a two-digit CCL, and No grade rows */
  await typeInBox(w, T('bal-LVE-dice'), '123.5'); await typeInBox(w, T('bal-cf-dice'), '100')
  await typeInBox(w, T('bal-LVE-shaft'), '-12.5')
  await typeInBox(w, T('bal-CCL-snap'), '12'); await typeInBox(w, T('bal-PL-snap'), '10.5')
  // a grade nobody should lose: delete Ops A (3 people hold it) → "No grade" rows (the Personnel)
  await press(w, T('bal-grades')); await P.waitForTimeout(500)
  await press(w, T('grade-del-opsa')); await P.waitForTimeout(300); await press(w, T('grade-del-sure')); await P.waitForTimeout(500)
  await press(w, T('grades-close')); await P.waitForTimeout(400)
  await P.evaluate(() => { document.querySelector('[data-testid="bal-scroll"]').scrollTop = 0 })
  const m1 = await measure()
  await shotD(w, '50-hard-cases')
  await P.screenshot({ path: `${L.OUT}/50b-oil-crop.png`, clip: { x: 600, y: 150, width: 560, height: 520 } })
  const spreadWorst = Math.max(...m1.cols.map(c => c.spread))
  rec('A50 (lesson 9) Balances: every heading against every figure, 50 lines incl. 123.5, −12.5, a pending figure and "No grade" rows', S, ok(spreadWorst <= 1.5), fmt(m1) + `; puck chips drawn: ${JSON.stringify(m1.chips)}`, ['50-hard-cases'])
  // Days taken
  await press(w, T('bal-view-taken')); await P.waitForTimeout(500)
  const m2 = await measure()
  await shotD(w, '51-taken')
  rec('A51 (lesson 9) Days taken: every heading against every figure', S, ok(Math.max(...m2.cols.map(c => c.spread)) <= 1.5), fmt(m2), ['51-taken'])
  await press(w, T('bal-view-bal')); await P.waitForTimeout(400)

  /* SANS on: Settings "+ SANS" */
  await L.openGrid(w); await press(w, T('settings-open')); await P.waitForTimeout(900)
  const sansBtn = P.locator(T('sans-toggle'))
  const hasSans = await sansBtn.count()
  if (hasSans) {
    const vb = await P.evaluate(() => [...document.querySelectorAll('[data-testid="settings-sheet"] button, [data-testid="settings-sheet"] summary')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.dataset.testid || '') + ':' + e.textContent.trim().slice(0, 18)).join(' | ')); console.log('settings buttons:', vb)
    await sansBtn.click({ timeout: 4000 }).catch(async () => { await P.locator('text=Roster').first().click({ timeout: 2000 }).catch(() => {}); await P.waitForTimeout(300); await sansBtn.click({ timeout: 4000 }).catch(() => console.log('SANS toggle could not be pressed')) }); await P.waitForTimeout(600)
    await shotD(w, '52-settings-sans')
    await press(w, T('settings-close')); await P.waitForTimeout(500)
    await A.openBalances(w)
    const m3 = await measure()
    await shotD(w, '53-with-sans')
    rec('A52 (lesson 9) SANS shown (Settings → Show SANS): headings against figures, SANS rows included', S, ok(Math.max(...m3.cols.map(c => c.spread)) <= 1.5), fmt(m3) + '; rows ' + m3.rows, ['52-settings-sans', '53-with-sans'])
  } else rec('A52 SANS on', S, 'NOT WALKED', 'no Show SANS switch found', [])

  /* lesson 11 — wider screens (emulated by a wider viewport) */
  for (const [lab, vw, vh] of [['2560', 2560, 1440], ['half', 3072, 1720]]) {
    await P.setViewportSize({ width: vw, height: vh }); await P.waitForTimeout(900)
    await L.openGrid(w); await A.openBalances(w); await P.waitForTimeout(500)
    const geo = await P.evaluate(() => {
      const card = document.querySelector('[data-testid="balances-page"]').getBoundingClientRect()
      const tbl = document.querySelector('.bp-table').getBoundingClientRect()
      const r = document.querySelector('[data-testid="bal-row-bane"]')
      const name = r.querySelector('[data-testid="bal-name-bane"]')?.getBoundingClientRect()
      const last = document.querySelector('[data-testid="bal-CL-bane"]').getBoundingClientRect()
      const bar = document.querySelector('[data-testid="bal-lock"]')?.getBoundingClientRect()
      return { vw: innerWidth, card: [Math.round(card.left), Math.round(card.right)], table: [Math.round(tbl.left), Math.round(tbl.right)], nameLeft: Math.round(name?.left ?? -1), lastFigureRight: Math.round(last.right), lockRight: Math.round(bar?.right ?? -1), gapNameToLastFigure: Math.round(last.right - (name?.left ?? 0)) }
    })
    const m = await measure()
    await P.screenshot({ path: `${L.OUT}/54-wide-${lab}.png`, scale: 'css' })
    rec(`A53 (lesson 11) page at ${vw} wide (${lab})`, S, ok(Math.max(...m.cols.map(c => c.spread)) <= 1.5), `${JSON.stringify(geo)}; ${fmt(m)}`, [`54-wide-${lab}`])
    // the person window docked at this width: not mine (walker C)
  }
  await P.setViewportSize({ width: 1536, height: 860 })
} catch (e) {
  rec('ERROR', S, 'FAIL', String(e).slice(0, 600), [])
  await L.shot(w, 'error').catch(() => {})
}
rec('errors', S, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 900) : 'no console error, page error or 4xx')
L.writeResults('a5')
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
