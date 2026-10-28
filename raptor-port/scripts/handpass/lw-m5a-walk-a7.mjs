// walker A, script 7 — admin, desktop: scn 12 (Approve all moves many figures at once; one Undo), scn 49's positive proof that a member's bell
// does list a leave decision (so "no line for a balance change" means something), scn 54 (what the removed drawer and drag bar gave).
// node scripts/handpass/lw-m5a-walk-a7.mjs
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/a/a7'
process.env.LW_TODAY ||= '2026-01-25'
const A = await import('./lw-m5a-walk-a-lib.mjs')
const { L, T, rec, press, vis, txt, balRow, typeInBox, shotD } = A
console.log('[lw-m5a-walk-a7 v1]')
L.clearOut()
const S = 'desk'
const ok = c => (c ? 'PASS' : 'FAIL')
const w = await L.newCtx('desk'); const P = w.page
const num = s => (s == null || s === '–' ? 0 : Number(String(s).replace('−', '-')))
const allRows = () => P.evaluate(() => [...document.querySelectorAll('[data-testid^="bal-row-"]')].map(r => { const id = r.dataset.testid.slice(8); const v = t => { const e = document.querySelector(`[data-testid="${t}-${id}"]`); return e ? (e.tagName === 'INPUT' ? e.value : e.textContent.trim()) : null }; return { id, app: v('bal-LVE'), pend: v('bal-pend'), war: v('bal-war') } }))
const bell = async () => { await L.openBell(w); const l = await L.bellLines(P); await L.closeBell(w); return l.map(x => x.text) }
try {
  await L.signIn(w, 'admin'); await A.openBalances(w)
  const before = await allRows()
  const pendingMen = before.filter(r => r.pend && r.pend !== '–')
  await L.switchTo(w, 'member'); const b0 = await bell()
  await L.switchTo(w, 'admin'); await A.openBalances(w)
  /* Approve all on Approvals */
  await L.openApprovals(w)
  const cnt0 = await L.tabCount(P)
  const btn = P.locator('[data-testid="appr-approve-all"]')
  const hasBtn = await btn.count()
  if (!hasBtn) { rec('A70 (scn 12) Approve all', S, 'NOT WALKED', 'no "Approve all" button on Approvals', []) }
  else {
    await btn.click(); await P.waitForTimeout(500)
    await shotD(w, '70-approve-all-armed')
    const armedTxt = await btn.innerText()
    await btn.click(); await P.waitForTimeout(900)
    await shotD(w, '71-approve-all-done')
    const cnt1 = await L.tabCount(P)
    await A.openBalances(w)
    const after = await allRows()
    let bad = [], moved = 0
    for (const r of before) {
      const a = after.find(x => x.id === r.id); if (!a) continue
      const p = Math.abs(num(r.pend))
      if (p > 0) { moved++; if (!(Math.abs(num(a.app) - (num(r.app) - p)) < 0.01 && (a.pend === '–' || num(a.pend) === 0) && num(a.war) === num(r.war))) bad.push(`${r.id}: App ${r.app}→${a.app}, Pending ${r.pend}→${a.pend}, War ${r.war}→${a.war}`) }
      else if (a.app !== r.app || a.war !== r.war) bad.push(`${r.id} (no pending) changed App ${r.app}→${a.app}`)
    }
    rec('A70 (scn 12) Approve all: each App bal down by his pending days, Pending gone, War bal unchanged', S, ok(moved > 0 && bad.length === 0), `Approvals count ${cnt0} → ${cnt1}; button after the first tap: "${armedTxt.replace(/\s+/g, ' ')}"; ${moved} men with LVE pending moved (${pendingMen.map(r => r.id + ' ' + r.pend).join(', ')}); mismatches: ${bad.join(' | ') || 'none'}`, ['70-approve-all-armed', '71-approve-all-done'])
    await P.evaluate(() => { document.querySelector('[data-testid="bal-scroll"]').scrollTop = 500 }); await P.waitForTimeout(300)
    const sc = await A.where(P)
    await L.undo(w)
    const afterU = await allRows(); const sc2 = await A.where(P)
    const same = before.every(r => { const a = afterU.find(x => x.id === r.id); return a && a.app === r.app && a.pend === r.pend && a.war === r.war })
    await shotD(w, '72-approve-all-undone')
    rec('A71 (scn 12) one Undo puts all of them back; the page stays where it is (D672)', S, ok(same && sc.top === sc2.top), `every row back as before: ${same}; scroll ${JSON.stringify(sc)} → ${JSON.stringify(sc2)}`, ['72-approve-all-undone'])
    await L.redo(w)
    /* the bell: Ranger now has decision lines */
    await L.switchTo(w, 'member'); const b1 = await bell()
    rec('A72 (scn 49) proof the member\'s bell reads: it lists the leave decisions Approve all made', S, ok(b1.length > b0.length), `lines before ${b0.length}, after ${b1.length}: ${JSON.stringify(b1.slice(0, 4))}`, [])
    await L.switchTo(w, 'admin'); await A.openBalances(w)
    await typeInBox(w, T('bal-LVE-bane'), 20)
    await press(w, T('bal-grade-bane')); await P.waitForTimeout(400); await press(w, T('bal-grade-opt-none')); await P.waitForTimeout(500)
    await L.switchTo(w, 'member'); const b2 = await bell()
    rec('A73 (scn 49) then a typed figure and a grade change add no bell line', S, ok(b2.length === b1.length), `lines ${b1.length} → ${b2.length}; new: ${JSON.stringify(b2.filter(x => !b1.includes(x)))}`, [])
    await L.switchTo(w, 'admin')
  }
  /* scn 54 — the grid after the drawer's removal */
  await L.openGrid(w)
  const gridBits = await P.evaluate(() => ({ figuresButton: [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0 && /figures|balances/i.test(b.textContent) && !b.dataset.testid?.startsWith('bal-') && b.dataset.testid !== 'lw-tab-balances').map(b => b.textContent.trim().slice(0, 20)), lveFigure: document.querySelector('[data-testid="bal-bane"]')?.textContent.trim() }))
  await shotD(w, '73-grid-after-drawer-removal')
  await press(w, T('bal-bane')); await P.waitForTimeout(800)
  const what = await P.evaluate(() => ({ personWindow: !!document.querySelector('[data-testid="person-window"]') && document.querySelector('[data-testid="person-window"]').getBoundingClientRect().width > 0, sheets: [...document.querySelectorAll('[data-testid$="-sheet"], .sheet')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid || e.className).slice(0, 5) }))
  await shotD(w, '74-tap-lve-figure')
  rec('A74 (scn 54) a tap on the LVE figure beside a name opens the person window, no breakdown sheet', S, ok(what.personWindow), `grid: buttons naming figures/balances: ${JSON.stringify(gridBits.figuresButton)}; the cell reads "${gridBits.lveFigure}"; after the tap ${JSON.stringify(what)} (the window stands below the screen on a desktop — the host's known fault; Escape closes it)`, ['73-grid-after-drawer-removal', '74-tap-lve-figure'])
  await P.keyboard.press('Escape'); await P.waitForTimeout(500)
  // the drag down the LVE figures: press on one, drag over three others
  const a = await P.locator(T('bal-dice')).boundingBox(), b = await P.locator(T('bal-pump')).boundingBox()
  await P.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await P.mouse.down(); await P.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 }); await P.waitForTimeout(300)
  const mid = await P.evaluate(() => [...document.querySelectorAll('[class*="drag"], [class*="grant"], [data-testid*="grant"], [data-testid*="lve-bar"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.dataset.testid || e.className).toString().slice(0, 40)))
  await shotD(w, '75-drag-down-lve')
  await P.mouse.up(); await P.waitForTimeout(600)
  const bar = await P.evaluate(() => [...document.querySelectorAll('button, [role="dialog"], [data-testid]')].filter(e => e.getBoundingClientRect().width > 0 && /Give|extra LVE|Add days|Grant LVE/i.test(e.textContent || '') && !/^(bid-|bal-|row-)/.test(e.dataset?.testid || '') && e.textContent.length < 80).map(e => e.textContent.trim().slice(0, 40)))
  await shotD(w, '76-after-drag-down-lve')
  rec('A75 (scn 54d) the drag down the LVE figures gives no bar', S, ok(bar.length === 0), `drag-related elements during the drag ${JSON.stringify(mid)}; after the lift, bars/buttons offering extra LVE: ${JSON.stringify(bar)}; a person window may open instead: ${await vis(P, T('person-window'))}`, ['75-drag-down-lve', '76-after-drag-down-lve'])
} catch (e) {
  rec('ERROR', S, 'FAIL', String(e).slice(0, 600), [])
  await L.shot(w, 'error').catch(() => {})
}
rec('errors', S, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 900) : 'no console error, page error or 4xx')
L.writeResults('a7')
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
