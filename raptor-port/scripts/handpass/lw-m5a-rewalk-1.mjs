// M5a re-walk 1 — admin, desktop 1536 x 860 (scale 1.25): A-F3 (a box shows its longest figure, no column moves), A-F4 (pinned headings meet),
// A-F2 (OIL right-set under its heading), A-F1 (an emptied box), then walker A's alignment measure once more (every heading over its figures).
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/rewalk/r1'
process.env.LW_TODAY ||= '2026-01-25'
const R = await import('./lw-m5a-rewalk-lib.mjs')
const { L, T, note, press, vis, txt, balRow, typeInBox, shotD } = R
console.log('[lw-m5a-rewalk-1 v1]')
L.clearOut()
const S = 'desk'
const w = await L.newCtx('desk'); const P = w.page
const ok = c => (c ? 'PASS' : 'FAIL')

const geo = () => P.evaluate(() => {
  const heads = [...document.querySelectorAll('.bp-table thead tr:last-child th')].map(h => { const r = h.getBoundingClientRect(); return [Math.round(r.left * 10) / 10, Math.round(r.width * 10) / 10] })
  const row = r => [...document.querySelectorAll(`[data-testid="bal-row-${r}"] > td`)].map(c => { const b = c.getBoundingClientRect(); return [Math.round(b.left * 10) / 10, Math.round(b.width * 10) / 10] })
  return { heads, bane: row('bane'), dice: row('dice') }
})
const fits = id => P.evaluate(id => {
  const e = document.querySelector(`[data-testid="${id}"]`); if (!e) return null
  const cs = getComputedStyle(e)
  const cv = document.createElement('canvas').getContext('2d'); cv.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
  const textW = cv.measureText(e.value).width
  const inner = e.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
  return { value: e.value, scrollW: e.scrollWidth, clientW: e.clientWidth, textW: Math.round(textW * 10) / 10, innerW: Math.round(inner * 10) / 10, boxW: Math.round(e.getBoundingClientRect().width * 10) / 10, cut: e.scrollWidth > e.clientWidth || textW > inner + 0.5 }
}, id)

/* the alignment measure of walker A's script 5 (words box of each heading against the figures under it, per line) */
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
    let n = 0; const info = []
    for (const r of rows) {
      const c = r.children[i]; if (!c) continue
      const f = c.querySelector('input, button') || c.querySelector('.bp-ro, .bp-rogd, .bp-war, .bp-pend, span') || c
      const fb = (f.tagName === 'INPUT') ? f.getBoundingClientRect() : words(f)
      if (!fb || !fb.width) continue
      n++
      gaps.left.push(fb.left - hb.left); gaps.right.push(fb.right - hb.right); gaps.centre.push((fb.left + fb.width / 2) - (hb.left + hb.width / 2))
      info.push({ id: r.dataset.testid.slice(8), txt: (f.value ?? f.textContent ?? '').toString().replace(/\s+/g, ' ').slice(0, 12) })
    }
    if (!n) return
    const med = a => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)]
    const spread = a => Math.max(...a) - Math.min(...a)
    const ta = getComputedStyle(h).textAlign
    const edge = (ta === 'right' || ta === 'end') ? 'right' : (ta === 'center' ? 'centre' : 'left')
    const arr = gaps[edge], m = med(arr)
    let worst = 0, who = ''
    arr.forEach((g, k) => { if (Math.abs(g - m) > Math.abs(worst)) { worst = g - m; who = info[k].id + ' "' + info[k].txt + '"' } })
    out.push({ heading: h.textContent.trim(), align: edge, off: Math.round(m * 10) / 10, spread: Math.round(spread(arr) * 10) / 10, worst: Math.round(worst * 10) / 10, worstRow: who, lines: n })
  })
  return { rows: rows.length, chips, cols: out }
})
const fmt = m => m.err ? m.err : `${m.rows} rows; ` + m.cols.map(c => `${c.heading}: ${c.align}-set, figure edge ${c.off > 0 ? '+' : ''}${c.off}px from it, spread ${c.spread}px${c.spread > 1.5 ? ` worst ${c.worstRow} ${c.worst}px` : ''}`).join(' · ')

try {
  await L.signIn(w, 'admin'); await R.openBalances(w)
  /* ---- A-F3: the longest figures whole, and no column moves */
  const g0 = await geo()
  const b0 = await P.evaluate(() => Object.fromEntries(['bal-LVE-bane', 'bal-cf-bane', 'bal-CCL-bane', 'bal-PL-bane', 'bal-CL-bane'].map(id => { const r = document.querySelector(`[data-testid="${id}"]`).getBoundingClientRect(); return [id, [Math.round(r.left * 10) / 10, Math.round(r.width * 10) / 10]] })))
  await typeInBox(w, T('bal-LVE-dice'), '-998.5')
  await typeInBox(w, T('bal-LVE-shaft'), '-12.5')
  await typeInBox(w, T('bal-PL-snap'), '10.5')
  await typeInBox(w, T('bal-LVE-bane'), '123.5')
  await typeInBox(w, T('bal-cf-bane'), '100')
  await typeInBox(w, T('bal-CCL-bane'), '12.5')
  await typeInBox(w, T('bal-PL-bane'), '10.5')
  const f = {}
  for (const id of ['bal-LVE-dice', 'bal-LVE-shaft', 'bal-PL-snap', 'bal-LVE-bane', 'bal-cf-bane', 'bal-CCL-bane', 'bal-PL-bane', 'bal-cf-dice']) f[id] = await fits(id)
  await P.evaluate(() => { document.querySelector('[data-testid="bal-scroll"]').scrollTop = 0 })
  await shotD(w, '01-longest-figures')
  await P.screenshot({ path: `${L.OUT}/02-longest-crop.png`, clip: { x: 360, y: 150, width: 800, height: 560 } })
  const g1 = await geo()
  const b1 = await P.evaluate(() => Object.fromEntries(['bal-LVE-bane', 'bal-cf-bane', 'bal-CCL-bane', 'bal-PL-bane', 'bal-CL-bane'].map(id => { const r = document.querySelector(`[data-testid="${id}"]`).getBoundingClientRect(); return [id, [Math.round(r.left * 10) / 10, Math.round(r.width * 10) / 10]] })))
  const same = JSON.stringify(g0) === JSON.stringify(g1) && JSON.stringify(b0) === JSON.stringify(b1)
  const cuts = Object.entries(f).filter(([, v]) => v && v.cut).map(([k, v]) => `${k} "${v.value}" ${JSON.stringify(v)}`)
  note('F3 (A-F3) a box shows its longest figure whole: −998.5, −12.5, 10.5, 123.5, 12.5 typed', S, ok(!cuts.length), cuts.length ? 'CUT: ' + cuts.join(' | ') : Object.entries(f).map(([k, v]) => `${k}=${v?.value} (box ${v?.boxW}px, text ${v?.textW}px of ${v?.innerW}px)`).join('; '), ['01-longest-figures', '02-longest-crop'])
  note('F3b no column moves when a long figure is typed (heading and cell lefts/widths of Ranger and Dice, and his 5 boxes, before vs after)', S, ok(same), same ? 'identical to 0.1px' : `before ${JSON.stringify(g0.bane)} ${JSON.stringify(b0)} | after ${JSON.stringify(g1.bane)} ${JSON.stringify(b1)}`, ['01-longest-figures'])

  /* ---- A-F2 / lesson 9: the alignment measure, with the hard cases on the page (No grade rows too) */
  await press(w, T('bal-grades')); await P.waitForTimeout(500)
  await press(w, T('grade-del-opsa')); await P.waitForTimeout(300); await press(w, T('grade-del-sure')); await P.waitForTimeout(500)
  await press(w, T('grades-close')); await P.waitForTimeout(400)
  await P.evaluate(() => { document.querySelector('[data-testid="bal-scroll"]').scrollTop = 0 })
  const m1 = await measure()
  await shotD(w, '10-hard-cases')
  await P.screenshot({ path: `${L.OUT}/11-oil-crop.png`, clip: { x: 600, y: 150, width: 560, height: 520 } })
  const oil = m1.cols.find(c => /^OIL/.test(c.heading))
  note('F2 (A-F2) OIL figures right-set under their heading, 0–1px, steady line to line', S, ok(oil && oil.align === 'right' && Math.abs(oil.off) <= 1 && oil.spread <= 1), oil ? `OIL heading ${oil.align}-set; figure right edge ${oil.off}px from heading's, spread ${oil.spread}px over ${oil.lines} lines` : 'no OIL column found', ['10-hard-cases', '11-oil-crop'])
  note('A50 (lesson 9, again) every heading over its figures on every line, 50 lines incl. −998.5, 123.5, 10.5, No grade rows', S, ok(Math.max(...m1.cols.map(c => c.spread)) <= 1.5), fmt(m1) + `; chips ${JSON.stringify(m1.chips)}`, ['10-hard-cases'])
  await press(w, T('bal-view-taken')); await P.waitForTimeout(500)
  const m2 = await measure(); await shotD(w, '12-taken')
  note('A51 Days taken: every heading over its figures', S, ok(Math.max(...m2.cols.map(c => c.spread)) <= 1.5), fmt(m2), ['12-taken'])
  await press(w, T('bal-view-bal')); await P.waitForTimeout(400)

  /* SANS shown */
  await L.openGrid(w); await press(w, T('settings-open')); await P.waitForTimeout(900)
  await press(w, T('sans-toggle')).catch(() => {}); await P.waitForTimeout(600)
  await press(w, T('settings-close')); await P.waitForTimeout(500)
  await R.openBalances(w)
  const m3 = await measure(); await shotD(w, '13-with-sans')
  note('A52 SANS shown: every heading over its figures, SANS rows included', S, ok(Math.max(...m3.cols.map(c => c.spread)) <= 1.5 && m3.rows > 50), fmt(m3), ['13-with-sans'])

  /* ---- A-F4: the pinned headings, scrolled */
  for (const top of [300, 1150]) {
    await P.evaluate(t => { document.querySelector('[data-testid="bal-scroll"]').scrollTop = t }, top); await P.waitForTimeout(400)
    const h = await P.evaluate(() => {
      const trs = [...document.querySelectorAll('.bp-table thead tr')].map(tr => { const r = tr.getBoundingClientRect(); const c = getComputedStyle(tr.children[0]); return { top: Math.round(r.top * 100) / 100, bottom: Math.round(r.bottom * 100) / 100, pos: c.position, ctop: c.top, bg: c.backgroundColor } })
      const sc = document.querySelector('[data-testid="bal-scroll"]').getBoundingClientRect()
      /* what is drawn at points between the top of the first heading row and the bottom of the last: every one must be a heading cell */
      const y0 = trs[0].top, y1 = trs[trs.length - 1].bottom
      const bad = []
      for (let y = Math.ceil(y0) + 0.5; y < y1; y += 1) for (const x of [60, 200, 420, 700, 1000, 1300]) {
        const e = document.elementFromPoint(x, y)
        if (e && !e.closest('thead')) bad.push(`${x},${y}→${e.tagName}${e.dataset?.testid ? '#' + e.dataset.testid : ''}`)
      }
      return { trs, scTop: Math.round(sc.top), bad: bad.slice(0, 6), nbad: bad.length }
    })
    const gap = h.trs.length > 1 ? Math.round((h.trs[1].top - h.trs[0].bottom) * 100) / 100 : null
    await P.screenshot({ path: `${L.OUT}/20-scrolled-${top}.png`, clip: { x: 0, y: h.scTop - 4, width: 1100, height: 130 } })
    await shotD(w, `21-scrolled-${top}-full`)
    note(`F4 (A-F4) pinned headings meet with no see-through strip, page scrolled ${top}`, S, ok(gap !== null && Math.abs(gap) <= 0.5 && h.nbad === 0), `heading rows ${JSON.stringify(h.trs.map(t => [t.top, t.bottom]))}; gap between rows ${gap}px; points between them not on a heading: ${h.nbad} ${h.bad.join(' ')}`, [`20-scrolled-${top}`, `21-scrolled-${top}-full`])
  }
  await P.evaluate(() => { document.querySelector('[data-testid="bal-scroll"]').scrollTop = 0 })

  /* ---- A-F1: an emptied box says "Type a figure"; Escape puts back silently */
  await L.openGrid(w); await R.openBalances(w)
  const undo0 = await P.evaluate(() => document.querySelector('#undoBtn')?.disabled)
  const before = await balRow(P, 'stiff')
  await press(w, T('bal-LVE-stiff')); await P.waitForTimeout(200)
  await P.keyboard.press('Control+A'); await P.keyboard.press('Backspace'); await P.waitForTimeout(200)
  await P.keyboard.press('Enter'); await P.waitForTimeout(600)
  const v2 = await P.locator(T('bal-LVE-stiff')).inputValue()
  const e2 = await txt(P, T('bal-LVE-stiff-err'))
  await shotD(w, '30-blank-enter')
  await P.screenshot({ path: `${L.OUT}/31-blank-enter-crop.png`, clip: { x: 360, y: 150, width: 800, height: 330 } })
  note('F1 (A-F1) emptied box + Enter: words "Type a figure", old figure kept, no Undo step', S, ok(/Type a figure/i.test(e2 || '') && v2 === before.app), `box now "${v2}" (was ${before.app}); words under it "${e2}"; Undo disabled ${undo0} -> ${await P.evaluate(() => document.querySelector('#undoBtn')?.disabled)}`, ['30-blank-enter', '31-blank-enter-crop'])
  await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  await press(w, T('bal-LVE-stiff')); await P.keyboard.press('Control+A'); await P.keyboard.press('Backspace'); await P.waitForTimeout(150)
  await press(w, T('bal-LVE-bane')); await P.waitForTimeout(600)
  const v4 = await P.locator(T('bal-LVE-stiff')).inputValue(), e4 = await txt(P, T('bal-LVE-stiff-err'))
  await shotD(w, '32-blank-leave')
  note('F1b emptied box, left by pressing another box: words "Type a figure", old figure kept', S, ok(/Type a figure/i.test(e4 || '') && v4 === before.app), `box "${v4}"; words "${e4}"`, ['32-blank-leave'])
  await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  await press(w, T('bal-LVE-stiff')); await P.keyboard.press('Control+A'); await P.keyboard.press('Backspace'); await P.waitForTimeout(150)
  await P.keyboard.press('Escape'); await P.waitForTimeout(400)
  const v5 = await P.locator(T('bal-LVE-stiff')).inputValue(), e5 = await txt(P, T('bal-LVE-stiff-err'))
  note('F1c emptied box + Escape: the old figure back, silently', S, ok(v5 === before.app && !e5), `box "${v5}"; words "${e5}"`, [])
} catch (e) { note('ERROR', S, 'FAIL', String(e).slice(0, 600)); await L.shot(w, 'error').catch(() => {}) }
note('errors (console, page, 4xx)', S, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 800) : 'none')
R.dump('r1')
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
