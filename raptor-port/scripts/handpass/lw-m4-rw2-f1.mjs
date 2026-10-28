// Re-walk 2 F1 — a day with two halves (M1, M2): Ranger PM approved, AM bid; Approvals approve AM, tap lit (AM back to pending, PM stays), approve, Refuse (AM refused, PM approved); then Ranger's bell.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk2'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, placeBid, lineLoc, approveBtn, refuseBtn, pressLoc, lineInfo, shotLine } = A
const { T, rec, shot, txt, vis, press } = L
console.log('[lw-m4-rw2-f1 v1]')
const w = await L.newCtx('desk'); const P = w.page
const ISO = '2026-01-13', D = 'Tue 13 Jan'
const halves = () => P.evaluate(id => {
  const e = document.querySelector(`[data-testid="${id}"]`); if (!e) return null
  const cs = [...e.querySelectorAll('.c')].map(c => ({ pos: /top/.test(c.className) ? 'AM' : /bot/.test(c.className) ? 'PM' : '?', cls: c.className.replace(/\s+/g, ' '), t: c.innerText }))
  return cs
}, L.cellId('bane', ISO))
const half = (h, pos) => { const c = (h || []).find(x => x.pos === pos); return c ? (c.cls.match(/\bs-(\w+)/)?.[1] || '') + (/ref|rej|x\b/.test(c.cls) ? '(refused-ish)' : '') + '|' + c.cls : 'none' }
const lineTxt = async () => (await L.apprLines(P)).filter(l => l.who === 'bane').map(l => l.text)
const winText = async () => (await txt(P, T('daylist-sheet'))) || (await txt(P, T('bid-picker')))
const closeDL = async () => { for (let i = 0; i < 3 && (await vis(P, T('daylist-sheet')) || await vis(P, T('bid-picker'))); i++) { const x = P.locator(`${T('daylist-sheet')} button:has-text("✕"), ${T('bid-picker')} button:has-text("✕")`).first(); if (await x.count()) await x.click(); else await P.keyboard.press('Escape'); await P.waitForTimeout(400) } }
/* the real route to read the grid + window: dates link -> grid with slim bar; open the cell; read; close; Back */
async function viaGrid(tag) {
  await pressLoc(w, lineLoc(P, D).locator('[data-testid="appr-dates"]')); await P.waitForTimeout(1200)
  const cell = await halves()
  await L.openCell(w, 'bane', ISO); await P.waitForTimeout(500)
  await shot(w, `f1-${tag}-grid-window`)
  const wt = await winText()
  const bar = await txt(P, T('appr-slim'))
  await closeDL()
  await press(w, T('appr-back')); await P.waitForTimeout(800)
  return { cell, wt, bar }
}
try {
  await L.signIn(w, 'admin')
  const ok1 = await placeBid(w, 'bane', ISO, 'LL', 'pm')   // approved (Approve what I enter, default on)
  const ok2 = await placeBid(w, 'bane', ISO, 'LL', 'am', { adminOff: true })  // pending
  rec('F1.0 set-up: PM approved + AM pending on Tue 13 Jan', 'desk', ok1 && ok2 ? 'PASS' : 'NOT WALKED', `pm ${ok1} am ${ok2}`, [])
  await closeDL(); await P.keyboard.press('Escape'); await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(400)
  await L.openApprovals(w)
  console.log('Ranger lines at start:', JSON.stringify(await lineTxt()))
  await shot(w, 'f1-0-approvals-start')
  const i0 = await lineInfo(P, D)
  // approve the morning line
  await pressLoc(w, approveBtn(P, D)); await P.waitForTimeout(600)
  const i1 = await lineInfo(P, D); await shotLine(w, 'f1-1-line-approved', D)
  const g1 = await viaGrid('1approved')
  console.log('STATE approved: line', i1.text, '| ok', i1.ok.p, '| cell', JSON.stringify(g1.cell), '| window:', g1.wt)
  // tap the lit Approved
  await pressLoc(w, approveBtn(P, D)); await P.waitForTimeout(600)
  const i2 = await lineInfo(P, D); await shotLine(w, 'f1-2-line-tapped-lit', D)
  const g2 = await viaGrid('2tapped')
  console.log('STATE tapped lit: line', i2.text, '| ok', i2.ok.p, '| cell', JSON.stringify(g2.cell), '| window:', g2.wt)
  rec('F1.1 approve AM, tap the lit Approved: MORNING back to pending, afternoon stays approved (grid cell + window)', 'desk',
    i1.ok.p === 'true' && i2.ok.p === 'false' && /Morning · pending/.test(g2.wt || '') && /Afternoon · approved/.test(g2.wt || '') && /s-w/.test(half(g2.cell, 'AM')) && /s-a/.test(half(g2.cell, 'PM')) ? 'PASS' : 'FAIL',
    `after tap: line lit=${i2.ok.p}; cell AM ${half(g2.cell, 'AM')} PM ${half(g2.cell, 'PM')}; window "${(g2.wt || '').slice(0, 260)}"`, ['f1-2-line-tapped-lit', 'f1-2tapped-grid-window'])
  // approve again, then ONE tap on Refuse
  await pressLoc(w, approveBtn(P, D)); await P.waitForTimeout(500)
  await pressLoc(w, refuseBtn(P, D)); await P.waitForTimeout(600)
  const i3 = await lineInfo(P, D); await shotLine(w, 'f1-3-line-refused', D)
  const g3 = await viaGrid('3refused')
  console.log('STATE refused: line', i3.text, '| no', i3.no.p, '| cell', JSON.stringify(g3.cell), '| window:', g3.wt)
  rec('F1.2 approve again, ONE tap on Refuse: morning refused, afternoon still approved (grid cell + window)', 'desk',
    i3.no.p === 'true' && /Morning · refused/i.test(g3.wt || '') && /Afternoon · approved/.test(g3.wt || '') ? 'PASS' : 'FAIL',
    `line Refuse lit=${i3.no.p}; cell AM ${half(g3.cell, 'AM')} PM ${half(g3.cell, 'PM')}; window "${(g3.wt || '').slice(0, 260)}"`, ['f1-3-line-refused', 'f1-3refused-grid-window'])
  await shot(w, 'f1-3-page')
  // the member's bell
  await L.switchTo(w, 'member')
  await L.openBell(w)
  await shot(w, 'f1-4-bell')
  const bl = await L.bellLines(P)
  console.log('BELL:', JSON.stringify(bl.map(b => (b.unread ? '*' : '') + b.text)))
  const joined = bl.map(b => b.text).join(' || ')
  rec('F1.3 Ranger\'s bell: lines for the decisions, never "deleted" for an approval', 'desk',
    bl.length && !/delet/i.test(joined) ? 'PASS' : 'FAIL', `${bl.length} lines: ${joined.slice(0, 700)}`, ['f1-4-bell'])
} catch (e) { rec('ERROR', 'desk', 'FAIL', String(e).slice(0, 400)); await shot(w, 'f1-error').catch(() => {}) }
if (w.errs.length) rec('console', 'desk', 'FAIL', w.errs.join(' || ').slice(0, 600))
await w.ctx.close(); L.writeResults('f1'); await L.closeBrowser(); console.log('DONE')
