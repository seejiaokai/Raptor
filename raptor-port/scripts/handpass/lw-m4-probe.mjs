// M4 host probe — the route every walker's scenario starts from, driven by the host first (walk-scripts §1, §2).
// Run: node scripts/handpass/lw-m4-probe.mjs   (from raptor-port/; the frozen build served on 4173)
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/probe'
const L = await import('./lw-m4-lib.mjs')
const { T, rec, shot, press, step, vis, txt } = L
console.log('[lw-m4-probe v1]')
L.clearOut()
for (const size of ['desk', 'phone']) {
  const w = await L.newCtx(size)
  const P = w.page
  try {
    /* the member bids (his own row, an open day after his today) */
    await L.signIn(w, 'member')
    const D1 = '2026-01-13'
    await L.openCell(w, 'bane', D1)
    rec('P1 bid window opens', size, (await vis(P, T('bid-picker'))) ? 'PASS' : 'FAIL', 'bid window on Tue 13 Jan')
    await shot(w, `${size}-p1-bidwin`)
    const placed = await L.placeLeave(w, 'LL')
    rec('P2 bid placed', size, placed ? 'PASS' : 'FAIL', 'LL placed, window closed')
    /* his window again: the Placed line */
    await L.openCell(w, 'bane', D1)
    const pl = await txt(P, T('bid-placed'))
    rec('P3 Placed line', size, pl && pl.startsWith('Placed Ranger') ? 'PASS' : 'FAIL', `"${pl}"`)
    await shot(w, `${size}-p3-placed`)
    await L.closeWin(w)
    rec('P3b member has no Approvals tab', size, (await P.locator(T('lw-tab-approvals')).count()) === 0 ? 'PASS' : 'FAIL', 'tab count ' + (await P.locator(T('lw-tab-approvals')).count()))
    /* the admin */
    await L.switchTo(w, 'admin')
    const n = await L.tabCount(P)
    rec('P4 tab count', size, n ? 'PASS' : 'FAIL', `count "${n}"`)
    await shot(w, `${size}-p4-tabrow`)
    await L.openApprovals(w)
    const lines = await L.apprLines(P)
    const mine = lines.filter(l => l.who === 'bane')
    rec('P5 the list holds his line', size, mine.length ? 'PASS' : 'FAIL', `${lines.length} lines; his: ${mine.map(l => l.text).join(' / ')}`)
    await shot(w, `${size}-p5-list`)
    /* approve his line */
    const sel = `${T('appr-line-bane')} ${T('appr-approve')}`
    await step(w, `${size}-p6-approved`, sel)
    const after = (await L.apprLines(P)).find(l => l.who === 'bane')
    rec('P6 approve lights it, the line stays', size, after && after.lit === 'approved' ? 'PASS' : 'FAIL', JSON.stringify(after))
    /* the dates -> the grid, ringed, the slim bar */
    await step(w, `${size}-p7-dates`, `${T('appr-line-bane')} ${T('appr-dates')}`)
    rec('P7 slim bar up', size, (await vis(P, T('appr-slim'))) ? 'PASS' : 'FAIL', await txt(P, T('appr-slim')) || '')
    const ring = await P.evaluate(() => !!document.querySelector('td.lw-ring'))
    rec('P7b the cell ringed', size, ring ? 'PASS' : 'FAIL', 'td.lw-ring present: ' + ring)
    await step(w, `${size}-p8-back`, T('appr-back'))
    rec('P8 Back opens the list lit as left', size, ((await L.apprLines(P)).find(l => l.who === 'bane') || {}).lit === 'approved' ? 'PASS' : 'FAIL', '')
    /* the member's bell */
    await L.switchTo(w, 'member')
    await L.openBell(w)
    const bl = await L.bellLines(P)
    rec('P9 his bell line', size, bl.some(b => /Your leave .*LL approved .*Saber/.test(b.text)) ? 'PASS' : 'FAIL', bl.map(b => b.text).join(' | '))
    await shot(w, `${size}-p9-bell`)
  } catch (e) {
    rec('ERROR', size, 'FAIL', String(e).slice(0, 300))
    await shot(w, `${size}-error`).catch(() => {})
  }
  if (w.errs.length) rec('console', size, 'FAIL', w.errs.join(' || ').slice(0, 600))
  await w.ctx.close()
}
L.writeResults('probe')
await L.closeBrowser()
console.log('DONE')
