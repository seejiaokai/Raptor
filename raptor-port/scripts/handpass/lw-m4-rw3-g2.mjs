// Re-walk 3 G2 — desktop by mouse, "Pick dates…" open: Grid tab, a line's Approve, the top bar's Undo.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk3'
const L = await import('./lw-m4-lib.mjs')
const { T, shot, rec } = L
console.log('[lw-m4-rw3-g2 v1]')
const snapOf = P => P.evaluate(() => ({
  head: document.querySelector('[data-testid="appr-sub"]')?.innerText.replace(/\s+/g, ' ').trim(),
  all: document.querySelector('[data-testid="appr-approve-all"]')?.innerText.replace(/\s+/g, ' ').trim(),
  tab: document.querySelector('[data-testid="lw-approvals-count"]')?.innerText.trim(),
  open: !!document.querySelector('[data-testid="appr-range"]') && document.querySelector('[data-testid="appr-range"]').getBoundingClientRect().height > 0,
  page: !!document.querySelector('[data-testid="approvals-page"]') && document.querySelector('[data-testid="approvals-page"]').getBoundingClientRect().height > 0,
  lines: [...document.querySelectorAll('[data-testid="approvals-page"] .appr-line')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.className.match(/lit-(\w+)/)?.[1] || '-').join(',')
}))
const same = (a, b) => a.head === b.head && a.all === b.all && a.tab === b.tab && a.lines === b.lines
const w = await L.newCtx('desk'); const P = w.page
const openPick = async () => { if (!(await snapOf(P)).open) { await P.evaluate(() => window.scrollTo(0, 0)); await L.press(w, T('appr-pick')); await P.waitForTimeout(700) } }
const firstOk = () => P.evaluate(() => { const l = [...document.querySelectorAll('[data-testid="approvals-page"] .appr-line')].filter(e => e.getBoundingClientRect().height > 0)[0]; const b = l.querySelector('.appr-ok').getBoundingClientRect(); const rg = document.querySelector('[data-testid="appr-range"]'); const r = rg ? rg.getBoundingClientRect() : null; return { x: b.left + b.width / 2, y: b.top + b.height / 2, text: l.innerText.replace(/\s+/g, ' ').trim().slice(0, 40), rg: r ? [r.left, r.top, r.right, r.bottom].map(Math.round) : null } })
try {
  await L.signIn(w, 'admin'); await L.openApprovals(w); await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
  const s0 = await snapOf(P); console.log('start', JSON.stringify(s0)); await shot(w, 'g2-0-start')
  // (d) Grid tab with the calendar open
  await openPick(); await shot(w, 'g2-d-1-open')
  const sd0 = await snapOf(P)
  await L.press(w, T('lw-tab-grid')); await P.waitForTimeout(900); await shot(w, 'g2-d-2-after')
  const sd = await snapOf(P)
  const gridOn = await P.evaluate(() => { const c = document.querySelector('[data-testid^="cell-"]'); return !!c && c.getBoundingClientRect().height > 0 })
  console.log('(d)', JSON.stringify(sd), 'grid', gridOn)
  rec('G2d click on the Grid tab with the calendar open: calendar closes AND Grid opens in that one click', 'desk', sd0.open && !sd.page && gridOn ? 'PASS' : 'FAIL', `before open ${sd0.open}; after approvals page ${sd.page}, calendar ${sd.open}, grid cells visible ${gridOn}`, ['g2-d-1-open', 'g2-d-2-after'])
  // (e) a click on a line's Approve
  await L.openApprovals(w); await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
  const se0 = await snapOf(P)
  await openPick(); await shot(w, 'g2-e-1-open')
  const fe = await firstOk(); console.log('first Approve', JSON.stringify(fe))
  await P.mouse.click(fe.x, fe.y); await P.waitForTimeout(900); await shot(w, 'g2-e-2-after-first-click')
  const se1 = await snapOf(P); console.log('(e) first', JSON.stringify(se1))
  rec('G2e first click on a line\'s Approve with the calendar open: calendar closes, nothing decided', 'desk', same(se0, se1) && !se1.open ? 'PASS' : 'FAIL', `open -> ${se1.open}; before ${JSON.stringify(se0)}; after ${JSON.stringify(se1)}; the point ${Math.round(fe.x)},${Math.round(fe.y)} calendar box ${JSON.stringify(fe.rg)}`, ['g2-e-1-open', 'g2-e-2-after-first-click'])
  const fe2 = await firstOk()
  await P.mouse.click(fe2.x, fe2.y); await P.waitForTimeout(900); await shot(w, 'g2-e-3-after-second-click')
  const se2 = await snapOf(P); console.log('(e) second', JSON.stringify(se2), fe2.text)
  const lit = se2.lines.split(',').map((x, i) => x === 'approved' ? i : -1).filter(i => i >= 0)
  rec('G2e the next click decides that line only', 'desk', lit.length === 1 && lit[0] === 0 && se2.lines.split(',').filter(x => x !== '-').length === 1 ? 'PASS' : 'FAIL', `lines ${se2.lines}; head ${se2.head}; Approve all "${se2.all}"; tab ${se2.tab}`, ['g2-e-3-after-second-click'])
  // Undo with the calendar open: closes it AND undoes, in one click
  await openPick(); await shot(w, 'g2-u-1-open')
  const su0 = await snapOf(P)
  const ud = await P.evaluate(() => ({ dis: document.querySelector('#undoBtn')?.disabled }))
  await P.mouse.click(...(await (async () => { const b = await P.locator('#undoBtn').boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2] })()))
  await P.waitForTimeout(900); await shot(w, 'g2-u-2-after-undo')
  const su = await snapOf(P); console.log('(undo)', JSON.stringify(su0), '->', JSON.stringify(su), JSON.stringify(ud))
  rec('G2 click on the top bar\'s Undo with the calendar open: closes the calendar AND undoes, in one click', 'desk', su0.open && !su.open && su.lines === s0.lines && su.head === s0.head ? 'PASS' : 'FAIL', `Undo enabled ${!ud.dis}; open ${su0.open} -> ${su.open}; lines ${su0.lines} -> ${su.lines}; head ${su0.head} -> ${su.head}`, ['g2-u-1-open', 'g2-u-2-after-undo'])
} catch (e) { rec('ERROR', 'desk', 'FAIL', String(e).slice(0, 400)); await shot(w, 'g2-error').catch(() => {}) }
if (w.errs.length) rec('console', 'desk', 'FAIL', w.errs.join(' || ').slice(0, 400))
await w.ctx.close(); L.writeResults('g2'); await L.closeBrowser(); console.log('DONE')
