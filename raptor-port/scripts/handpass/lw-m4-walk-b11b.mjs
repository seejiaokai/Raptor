// Walker B, step 11 (second part): Saber on Approvals, slim bar up, switches to the member view from the phone's menu (D292).
// Also: Saber on the Approvals page itself (no slim bar) switches. Chromium 402x874.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/b'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { L, T, shot, rec } = B
console.log('[lw-m4-walk-b11b v1]')
const w = await B.newPhone(402, 874, 'chromium')
const P = w.page
const st = () => P.evaluate(() => ({
  approvals: !!document.querySelector('[data-testid="approvals-page"]') && document.querySelector('[data-testid="approvals-page"]').getBoundingClientRect().height > 0,
  slim: !!document.querySelector('[data-testid="appr-slim"]') && document.querySelector('[data-testid="appr-slim"]').getBoundingClientRect().height > 0,
  tabApprovals: !!document.querySelector('[data-testid="lw-tab-approvals"]'),
  grid: !!document.querySelector('[data-testid="row-bane"]') && document.querySelector('[data-testid="row-bane"]').getBoundingClientRect().height > 0,
}))
const menuSwitch = async label => {
  await B.press(w, '#burger', label + '-menu-q'); await B.sleep(w, 600)
  await shot(w, label + '-menu')
  await B.press(w, 'button:has-text("Switch to the member view")', label + '-switch-q'); await B.sleep(w, 900)
  await shot(w, label + '-switched')
}
try {
  /* A: slim bar up */
  await B.signIn(w, 'admin'); await B.openApprovals(w)
  await B.press(w, `${T('approvals-page')} [data-testid^="appr-line-"] ${T('appr-dates')}`); await B.sleep(w, 1200)
  const s0 = await st(); console.log('before', JSON.stringify(s0))
  await shot(w, 's11b-slim-up')
  await menuSwitch('s11b')
  const s1 = await st(); console.log('after', JSON.stringify(s1))
  rec('S11c slim bar up, name badge -> member view: off Approvals, no slim bar, no tab', 'phone', s0.slim && !s1.slim && !s1.approvals && !s1.tabApprovals && s1.grid ? 'PASS' : 'FAIL', `before ${JSON.stringify(s0)}; after ${JSON.stringify(s1)}`, ['s11b-slim-up.png', 's11b-menu.png', 's11b-switch-q.png', 's11b-switched.png'])
  /* the way back: switch to the admin view again; Approvals tab returns, the page not reopened by itself */
  await B.press(w, '#burger'); await B.sleep(w, 600)
  const back = await P.locator('button:has-text("Switch to the admin view"), button:has-text("Switch back"), button:has-text("admin view")').count()
  await shot(w, 's11b-menu-as-member')
  console.log('way back buttons:', back)
  if (back) {
    await B.press(w, 'button:has-text("admin view")'); await B.sleep(w, 900)
    const s2 = await st(); await shot(w, 's11b-back-admin'); console.log('back as admin', JSON.stringify(s2))
    rec('S11d back to the admin view: the tab is back, no slim bar, Approvals not open by itself', 'phone', s2.tabApprovals && !s2.slim && !s2.approvals ? 'PASS' : 'FAIL', JSON.stringify(s2), ['s11b-back-admin.png'])
  } else {
    rec('S11d back to the admin view', 'phone', 'NOT WALKED', 'no admin-view button found in the menu', ['s11b-menu-as-member.png'])
  }
  /* B: on the Approvals page itself (no slim bar) */
  await B.switchTo(w, 'admin'); await B.openApprovals(w)
  const t0 = await st(); console.log('B before', JSON.stringify(t0))
  await menuSwitch('s11c')
  const t1 = await st(); console.log('B after', JSON.stringify(t1))
  rec('S11e on the Approvals page, name badge -> member view: off Approvals', 'phone', t0.approvals && !t1.approvals && !t1.tabApprovals && t1.grid ? 'PASS' : 'FAIL', `before ${JSON.stringify(t0)}; after ${JSON.stringify(t1)}`, ['s11c-menu.png', 's11c-switched.png'])
} catch (e) { rec('ERROR', 'phone', 'FAIL', String(e).slice(0, 400)); await shot(w, 's11b-error').catch(() => {}) }
if (w.errs.length) rec('console', 'phone', 'FAIL', w.errs.join(' || ').slice(0, 600))
await w.ctx.close()
B.writeResults('s11b')
await B.closeAll()
console.log('DONE')
