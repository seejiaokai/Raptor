// Walker B, step 11: a member has no Approvals tab and no way to it by address; Saber on Approvals with the slim bar up switches to the
// member view through the name badge (D292): taken off Approvals, no slim bar. Chromium 402x874.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/b'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { L, T, shot, rec } = B
console.log('[lw-m4-walk-b11 v1]')
const w = await B.newPhone(402, 874, 'chromium')
const P = w.page
try {
  await B.signIn(w, 'member')
  await shot(w, 's11-member-grid')
  const tabs = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="lw-tab-"], [data-testid="oil-tracker"]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.dataset.testid))
  rec('S11a a member has no Approvals tab', 'phone', !tabs.includes('lw-tab-approvals') && (await P.locator(T('approvals-page')).count()) === 0 ? 'PASS' : 'FAIL', `tabs drawn: ${tabs.join(', ')}; approvals page in the page: ${await P.locator(T('approvals-page')).count()}`, ['s11-member-grid.png'])
  /* "typing the page's address": the app has no address for a tab, so try the likely ones */
  const tries = ['#approvals', '#/approvals', '?tab=approvals', '?page=approvals', 'approvals']
  const out = []
  for (const t of tries) {
    const url = t.startsWith('approvals') ? B.PLAIN + t : B.PLAIN + t
    await P.goto(url).catch(e => out.push(t + ':goto-error'))
    await P.waitForTimeout(1200)
    const login = await P.locator('#luser').count()
    let ap = 0
    if (!login) { await P.waitForTimeout(500); ap = await P.locator(T('approvals-page')).count() }
    const vis = ap ? await B.vis(P, T('approvals-page')) : false
    out.push(`${t}: sign-in card ${login > 0}, approvals page present ${ap}, visible ${vis}`)
  }
  console.log(out.join('\n'))
  await shot(w, 's11-after-addresses')
  rec('S11b typing an address cannot reach Approvals as a member', 'phone', out.every(o => /present 0|sign-in card true/.test(o)) ? 'PASS' : 'FAIL', out.join(' | '), ['s11-after-addresses.png'])
  /* a signed-in member whose stored session survived the reload: re-sign in (real storage) */
  if (await P.locator('#luser').count()) await B.signIn(w, 'member')
  /* Saber */
  await B.switchTo(w, 'admin')
  await B.openApprovals(w)
  const first = await P.evaluate(() => { const l = document.querySelector('[data-testid="approvals-page"] [data-testid^="appr-line-"]'); return !!l })
  /* the dates tap on the first line -> slim bar up */
  await B.press(w, `${T('approvals-page')} [data-testid^="appr-line-"] ${T('appr-dates')}`); await B.sleep(w, 1200)
  const slimUp = await B.vis(P, T('appr-slim'))
  await shot(w, 's11-saber-slim-up')
  /* the menu: find the name badge / switch */
  await B.press(w, '#menuBtn, .hamburger, [aria-label="Menu"], #hamb', 's11-menu-q'); await B.sleep(w, 600)
  await shot(w, 's11-menu')
  const menu = await P.evaluate(() => [...document.querySelectorAll('button, a, [role=menuitem], .who, #whoBadge, [id*=badge], [class*=badge]')].filter(e => { const r = e.getBoundingClientRect(); return r.height > 0 && r.top < 700 }).map(e => (e.id || e.dataset.testid || e.className.toString().slice(0, 25)) + '=' + e.innerText.replace(/\s+/g, ' ').trim().slice(0, 30)).slice(0, 40))
  console.log('visible controls after the menu press:', JSON.stringify(menu))
  rec('S11 setup: slim bar up and the menu open', 'phone', slimUp ? 'PASS' : 'FAIL', `slim bar up: ${slimUp}; lines in the list: ${first}`, ['s11-saber-slim-up.png', 's11-menu.png'])
} catch (e) { rec('ERROR', 'phone', 'FAIL', String(e).slice(0, 400)); await shot(w, 's11-error').catch(() => {}) }
if (w.errs.length) rec('console', 'phone', 'FAIL', w.errs.join(' || ').slice(0, 600))
await w.ctx.close()
B.writeResults('s11')
await B.closeAll()
console.log('DONE')
