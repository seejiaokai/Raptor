// Re-walk 3 G4 — a deleted man (Admin -> Users -> Delete) with a pending bid: Approve refused "Posted out — refuse or delete it"; Refuse works.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk3'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, pressLoc, lineLoc, lineInfo, approveBtn, refuseBtn, shotLine } = A
const { T, rec, shot, txt, vis, press } = L
console.log('[lw-m4-rw3-g4 v1]')
const w = await L.newCtx('desk'); const P = w.page
try {
  await L.signIn(w, 'admin')
  await L.openApprovals(w); await shot(w, 'g4-0-approvals-before')
  const before = (await L.apprLines(P)).map(l => l.text); console.log('before', JSON.stringify(before.map(t => t.slice(0, 50))))
  await P.evaluate(() => window.go('admin')); await P.waitForTimeout(1200)
  await P.locator('#admUsers').getByText('Static', { exact: true }).first().click(); await P.waitForTimeout(800)
  await P.locator('#accEdDel').click(); await P.waitForTimeout(500); await shot(w, 'g4-1-delete-asked')
  await P.locator('#accEdDel').click(); await P.waitForTimeout(1200); await shot(w, 'g4-2-deleted')
  const still = await P.evaluate(() => !![...document.querySelectorAll('#admUsers button')].find(b => b.innerText.startsWith('Static')))
  console.log('Static still in the Users list:', still)
  await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(1200)
  await L.openApprovals(w); await shot(w, 'g4-3-approvals-after')
  const after = (await L.apprLines(P)).map(l => l.text); console.log('after', JSON.stringify(after.map(t => t.slice(0, 80))))
  const sl = after.find(t => /Static|8 Jan/.test(t))
  if (!sl) { rec('G4 a deleted man\'s leftover pending bid', 'desk', 'NOT WALKED', `the delete took his bid with it: no Static line in Approvals after (lines: ${after.length}); Users list still has him: ${still}`, ['g4-2-deleted', 'g4-3-approvals-after']) }
  else {
    const D = 'Thu 8 Jan'
    await pressLoc(w, approveBtn(P, D)); await P.waitForTimeout(700)
    const i = await lineInfo(P, D); await shotLine(w, 'g4-4-approve-pressed', D).catch(() => {})
    console.log('after Approve', JSON.stringify(i))
    rec('G4 deleted man: Approve on his pending bid refused "Posted out — refuse or delete it"', 'desk', /Posted out — refuse or delete it/.test(i.text) && i.ok.p !== 'true' ? 'PASS' : 'FAIL', `line "${i.text}"; Approve lit ${i.ok.p}`, ['g4-4-approve-pressed'])
    await pressLoc(w, refuseBtn(P, D)); await P.waitForTimeout(700)
    const r = await lineInfo(P, D); await shotLine(w, 'g4-5-refuse-pressed', D).catch(() => {})
    rec('G4 deleted man: Refuse works', 'desk', r.no.p === 'true' ? 'PASS' : 'FAIL', `line "${r.text}"; Refuse lit ${r.no.p}`, ['g4-5-refuse-pressed'])
  }
} catch (e) { rec('ERROR', 'desk', 'FAIL', String(e).slice(0, 400)); await shot(w, 'g4-error').catch(() => {}) }
if (w.errs.length) rec('console', 'desk', 'FAIL', w.errs.join(' || ').slice(0, 400))
await w.ctx.close(); L.writeResults('g4'); await L.closeBrowser(); console.log('DONE')
