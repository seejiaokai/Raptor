// Walker B, step 1: the tab row, the page, the filters in his drawing's three rows, armed Approve all. Sizes 402, 390x844, 360x740;
// then WebKit at 402. Run: node scripts/handpass/lw-m4-walk-b1.mjs  (from raptor-port/)
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/b'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { T, shot, rec, press, step } = B
console.log('[lw-m4-walk-b1 v1]')
const runs = [
  ['chromium', 402, 874], ['chromium', 390, 844], ['chromium', 360, 740], ['webkit', 402, 874],
]
for (const [engine, W, H] of runs) {
  const tag = `${engine}-${W}`
  let w
  try {
    w = await B.newPhone(W, H, engine)
  } catch (e) { rec('S1 ' + tag, `${W}`, 'NOT WALKED', `${engine} would not launch: ${String(e).slice(0, 200)}`); continue }
  const P = w.page
  try {
    await B.signIn(w, 'admin')
    const tc = await B.tabCount(P)
    await shot(w, `s1-${tag}-grid-tabrow`)
    rec(`S1a tab row count [${engine}]`, W, tc ? 'PASS' : 'FAIL', `tab count "${tc}"`, [`s1-${tag}-grid-tabrow.png`])
    await B.openApprovals(w, `s1-${tag}-open`)
    await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
    await shot(w, `s1-${tag}-page-top`)
    const g = await B.filterGeometry(P)
    console.log(`geometry ${tag}: vw=${g.vw}`)
    for (const r of g.rows) console.log('  row y~' + r[0].y + ': ' + r.map(c => `${c.id.replace('appr-', '')}[${c.text}] x${c.x}-${c.r} w${c.w} h${c.h} ofl=${c.overflowX} cRight=${c.contentRight} lines=${c.lines}`).join(' | '))
    const nrows = g.rows.length
    const newRow = g.rows.find(r => r.some(c => c.id === 'appr-new'))
    const newOneLine = newRow.find(c => c.id === 'appr-new')
    const allChips = g.rows.flat()
    const spill = allChips.filter(c => c.overflowX || c.contentRight > c.r + 0.5)
    const pick = allChips.find(c => c.id === 'appr-pick'), aa = allChips.find(c => c.id === 'appr-approve-all')
    const lastRow = g.rows[g.rows.length - 1]
    rec(`S1b three rows [${engine}]`, W, nrows === 3 ? 'PASS' : 'FAIL', `${nrows} rows of chips: ` + g.rows.map(r => r.map(c => c.text).join(' · ')).join(' // '), [`s1-${tag}-page-top.png`])
    rec(`S1c New on one line [${engine}]`, W, newOneLine && newOneLine.h <= 46 && (newOneLine.lines === null || newOneLine.lines <= 1.2) ? 'PASS' : 'FAIL', `New: ${JSON.stringify(newOneLine)}`, [`s1-${tag}-page-top.png`])
    rec(`S1d chip words inside edges [${engine}]`, W, spill.length === 0 ? 'PASS' : 'FAIL', spill.length ? 'spill: ' + spill.map(c => c.text).join(', ') : 'none spill', [`s1-${tag}-page-top.png`])
    rec(`S1e Pick dates left / Approve all right on the last row [${engine}]`, W, pick && aa && lastRow.includes(pick) && lastRow.includes(aa) && pick.x < aa.x && aa.r >= g.vw - 40 ? 'PASS' : 'FAIL', `pick x${pick && pick.x}-${pick && pick.r}, all x${aa && aa.x}-${aa && aa.r}, last row has both: ${lastRow.includes(pick) && lastRow.includes(aa)}`, [`s1-${tag}-page-top.png`])
    /* armed */
    const allText0 = aa.text
    await step(w, `s1-${tag}-armed`, T('appr-approve-all'))
    const g2 = await B.filterGeometry(P)
    const aa2 = g2.rows.flat().find(c => c.id === 'appr-approve-all')
    const rowsAfter = g2.rows.length
    rec(`S1f armed words inside button [${engine}]`, W, aa2 && /tap again/i.test(aa2.text) && !aa2.overflowX && aa2.contentRight <= aa2.r + 0.5 && aa2.r <= g2.vw ? 'PASS' : 'FAIL', `before "${allText0}" after ${JSON.stringify(aa2)}; rows ${rowsAfter}`, [`s1-${tag}-armed.png`, `s1-${tag}-armed-q.png`])
    rec(`S1g armed keeps three rows [${engine}]`, W, rowsAfter === 3 ? 'PASS' : 'FAIL', `${rowsAfter} rows`, [`s1-${tag}-armed.png`])
    /* disarm: press New (a safe filter) */
    await press(w, T('appr-all')); await B.sleep(w, 400)
  } catch (e) {
    rec('ERROR ' + tag, `${W}`, 'FAIL', String(e).slice(0, 300))
    await shot(w, `s1-${tag}-error`).catch(() => {})
  }
  if (w.errs.length) rec('console ' + tag, `${W}`, 'FAIL', w.errs.join(' || ').slice(0, 600))
  await w.ctx.close()
}
B.writeResults('s1')
await B.closeAll()
console.log('DONE')
