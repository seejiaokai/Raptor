// walker A, script 4 — the member (us/us, Ranger) on a desktop: his own row in boxes, others read only; locked; his own write survives a
// reload (scn 45); his Undo/Redo and the lock (scn 46, the lock flipped through the localhost bridge — the STAND-IN for the other person);
// grade words (scn 42); no bell for a balance change (scn 49); the admin's member view with Balances up (scn 36).
// node scripts/handpass/lw-m5a-walk-a4.mjs
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/a/a4'
process.env.LW_TODAY ||= '2026-01-25'
const A = await import('./lw-m5a-walk-a-lib.mjs')
const { L, T, rec, press, vis, txt, balRow, typeInBox, shotD } = A
console.log('[lw-m5a-walk-a4 v1]')
L.clearOut()
const S = 'desk'
const ok = c => (c ? 'PASS' : 'FAIL')
const w = await L.newCtx('desk'); const P = w.page
const undoTip = () => P.evaluate(() => document.querySelector('#undoBtn')?.getAttribute('title') || document.querySelector('#undoBtn')?.getAttribute('aria-label'))
const inputsOnPage = () => P.evaluate(() => [...document.querySelectorAll('[data-testid="balances-page"] input')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid))
const roGrade = pid => P.evaluate(pid => { const r = document.querySelector(`[data-testid="bal-row-${pid}"]`); const e = r?.querySelector('.bp-rogd'); if (!e) return null; const cs = getComputedStyle(e); return { text: e.textContent.replace(/\s+/g, ' ').trim(), color: cs.color, tag: e.tagName, clickable: !!e.closest('button') } }, pid)
const bell = async () => { await L.openBell(w); const l = await L.bellLines(P); const dot = await P.evaluate(() => !!document.querySelector('#notifyBell .dot, #notifyBell [class*="badge"], #notifyBell.has-unread')); await L.closeBell(w); return { lines: l.map(x => x.text), n: l.length, dot } }
try {
  await L.signIn(w, 'member'); await A.openBalances(w)
  const tr = await A.tabRow(P)
  const ins = await inputsOnPage()
  const adminBits = await P.evaluate(() => ({ grades: !!document.querySelector('[data-testid="bal-grades"]'), lock: !!document.querySelector('[data-testid="bal-lock"]'), locked: document.querySelector('[data-testid="bal-locked"]')?.textContent.trim() ?? null, gradeBoxes: document.querySelectorAll('[data-testid^="bal-grade-"]:not([data-testid="bal-grade-list"])').length }))
  const rg = await roGrade('bane'), rg2 = await roGrade('prism')
  const rowOther = await balRow(P, 'stiff')
  await shotD(w, '40-member-open')
  rec('A40 member, unlocked (beside m5c-c2-desk-open-cut)', S, ok(tr.tabs.length === 3 && !tr.gear && ins.length === 7 && ins.every(i => /-bane$/.test(i)) && !adminBits.grades && !adminBits.lock), `tabs ${tr.tabs.map(t => t.label).join(' · ')}, gear ${tr.gear ? 'SHOWN' : 'none'}; inputs on the page ${ins.length}: ${ins.join(',')}; admin bits ${JSON.stringify(adminBits)}; Ranger's grade words ${JSON.stringify(rg)}; Recon's ${JSON.stringify(rg2)}; Saber's row boxes ${rowOther.boxes}, figures ${rowOther.readOnly.join(' ')}`, ['40-member-open'])
  // tapping a grade (words) opens no picker
  await press(w, `[data-testid="bal-row-bane"] .bp-rogd`); await P.waitForTimeout(400)
  rec('A41 (scn 42) a tap on his grade words opens no picker', S, ok(!(await vis(P, T('bal-grade-list')))), `picker visible ${await vis(P, T('bal-grade-list'))}`, [])

  /* scn 45: type his own, reload, read as admin */
  await typeInBox(w, T('bal-LVE-bane'), 21); await typeInBox(w, T('bal-cf-bane'), 3); await typeInBox(w, T('bal-CL-bane'), 2)
  const mine = await balRow(P, 'bane')
  const t45 = await undoTip()
  await shotD(w, '41-member-typed')
  rec('A42 (scn 45) member types LVE 21 incl. 3 and CL 2', S, ok(mine.app === '21' && mine.cf === '3' && /^2/.test(mine.CL)), `his row App ${mine.app} incl. ${mine.cf} Pending ${mine.pend} War ${mine.war} CL "${mine.CL}"; Undo tip "${t45}"`, ['41-member-typed'])
  const so = await A.reloadAt(w, '2026-01-25'); await L.signIn(w, 'admin'); await A.openBalances(w)
  const adm = await balRow(P, 'bane')
  rec('A42b (scn 45) after a reload, Saber reads Ranger 21 incl. 3, CL 2', S, ok(adm.app === '21' && adm.cf === '3' && /^2/.test(adm.CL)), `reload signed out ${so}; Saber sees Ranger App ${adm.app} incl. ${adm.cf} War ${adm.war} CL "${adm.CL}"`, [])

  /* scn 49: baseline bell for Ranger, then admin changes: figure, grade, lock */
  await L.switchTo(w, 'member')
  const b0 = await bell()
  await L.switchTo(w, 'admin'); await A.openBalances(w)
  await typeInBox(w, T('bal-LVE-bane'), 22)
  await press(w, T('bal-grade-bane')); await P.waitForTimeout(400); await press(w, T('bal-grade-opt-sw')); await P.waitForTimeout(500)   // Ranger → Senior WSO (test only)
  await press(w, T('bal-lock')); await P.waitForTimeout(500)
  const adminNow = await balRow(P, 'bane')
  await L.switchTo(w, 'member')
  const b1 = await bell()
  rec('A43 (scn 49) no bell line for a balance change, a grade change or the lock', S, ok(b1.n === b0.n), `Ranger's bell before: ${b0.n} lines; after Saber typed 22, set Senior WSO, locked: ${b1.n} lines; dot before ${b0.dot} after ${b1.dot}; new lines: ${JSON.stringify(b1.lines.filter(l => !b0.lines.includes(l)))}; (admin's row then: App ${adminNow.app}, grade "${adminNow.grade}")`, [])

  /* locked: all read only */
  await A.openBalances(w)
  const lockedIns = await inputsOnPage(); const lockedW = await txt(P, T('bal-locked'))
  const rgL = await roGrade('bane'), rowL = await balRow(P, 'bane')
  await shotD(w, '42-member-locked')
  rec('A44 member, locked (beside m5c-c2-desk-locked-cut): all read only, "Locked by admin"', S, ok(lockedIns.length === 0 && /Locked by admin/.test(lockedW || '')), `inputs ${lockedIns.length}; words "${lockedW}"; his row read-only figures ${rowL.readOnly.join(' ')}; his grade words ${JSON.stringify(rgL)} (the admin set him Senior WSO: words follow the change, scn 42)`, ['42-member-locked'])
  // his Undo while locked (scn 46): nothing of his to undo this session; make one first requires unlocking via bridge
  await A.lockViaBridge(w, false); await P.waitForTimeout(500)
  await typeInBox(w, T('bal-LVE-bane'), 19); await typeInBox(w, T('bal-CL-bane'), 3)
  const m1 = await balRow(P, 'bane')
  await L.undo(w); const m2 = await balRow(P, 'bane')
  await L.undo(w); const m3 = await balRow(P, 'bane')
  await L.redo(w); await L.redo(w); const m4 = await balRow(P, 'bane')
  rec('A45 (scn 46) member: two typings, Undo both, Redo both (unlocked)', S, ok(m1.app === '19' && m2.CL.startsWith('2') && m3.app === '22' && m4.app === '19' && m4.CL.startsWith('3')), `typed ${m1.app}/${m1.CL}; Undo 1 → CL ${m2.CL}; Undo 2 → App ${m3.app}; Redo ×2 → App ${m4.app} CL ${m4.CL}`, [])
  await L.undo(w)   // one undo pending: lock, then he presses Undo again
  const preLock = await balRow(P, 'bane')
  const lb = await A.lockViaBridge(w, true); await P.waitForTimeout(600)
  const bef = await balRow(P, 'bane')
  await L.undo(w)
  const aft = await balRow(P, 'bane'); const nn = await A.notes(P)
  await shotD(w, '43-undo-while-locked')
  rec('A46 (scn 46) lock flipped by the bridge (stand-in for the admin), then his Undo is refused', S, ok(lb.ok && JSON.stringify(bef.readOnly) === JSON.stringify(aft.readOnly) && aft.boxes === 0), `bridge ${JSON.stringify(lb)}; his row before Undo: ${bef.readOnly.join(' ')}; after Undo press: ${aft.readOnly.join(' ')}; notes on screen: ${nn.filter(x => !/^DT|IW$/.test(x)).join(' | ') || 'none'}`, ['43-undo-while-locked'])
  await A.lockViaBridge(w, false); await P.waitForTimeout(500)
  await L.undo(w); const aft2 = await balRow(P, 'bane')
  rec('A46b unlocked again: the same Undo is accepted', S, 'PASS', `READING: his row after Undo, unlocked: App ${aft2.app} CL ${aft2.CL} (before: ${preLock.app} CL ${preLock.CL})`, [])

  /* the lock UI by the admin again off; scn 36 the admin's member view with Balances up */
  await L.switchTo(w, 'admin'); await A.openBalances(w)
  if ((await P.locator(T('bal-lock')).getAttribute('aria-checked')) === 'true') await press(w, T('bal-lock'))
  await P.waitForTimeout(300)
  await press(w, '#roleBadge'); await P.waitForTimeout(900)
  const mv = await P.evaluate(() => ({ page: !!document.querySelector('[data-testid="balances-page"]') && document.querySelector('[data-testid="balances-page"]').getBoundingClientRect().width > 0, badge: document.querySelector('#roleBadge')?.textContent.trim(), grades: !!document.querySelector('[data-testid="bal-grades"]'), lock: !!document.querySelector('[data-testid="bal-lock"]'), inputs: [...document.querySelectorAll('[data-testid="balances-page"] input')].map(e => e.dataset.testid), tabs: [...document.querySelectorAll('.lw-tabs [role="tab"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid) }))
  await shotD(w, '44-admin-member-view')
  rec('A47 (scn 36) the admin switched to the member view with Balances up: stays, a member\'s page', S, ok(mv.page && !mv.grades && !mv.lock && mv.inputs.every(i => /-stiff$/.test(i)) && mv.inputs.length === 7), JSON.stringify(mv), ['44-admin-member-view'])
  await press(w, '#roleBadge'); await P.waitForTimeout(700)
} catch (e) {
  rec('ERROR', S, 'FAIL', String(e).slice(0, 600), [])
  await L.shot(w, 'error').catch(() => {})
}
rec('errors', S, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 900) : 'no console error, page error or 4xx')
L.writeResults('a4')
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
