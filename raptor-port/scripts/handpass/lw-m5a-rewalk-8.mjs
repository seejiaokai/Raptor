// M5a re-walk 8 — the four-tab row at 320 and 720 (and 701 / 760 / 820, the band the browser-test fixer changed), in a fresh context with no page scroll:
// one line, OIL pressable (opens the OIL tracker, not Settings), the gear not over it, the count inside its tab, nothing cut at the right.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/rewalk/r8'
process.env.LW_TODAY ||= '2026-01-25'
const R = await import('./lw-m5a-rewalk-lib.mjs')
const { L, T, note, press, tabRow, shot } = R
console.log('[lw-m5a-rewalk-8 v1]')
L.clearOut()
const ok = c => (c ? 'PASS' : 'FAIL')
for (const [kind, who] of [['phone', 'admin'], ['phone', 'member']]) {
  const w = await L.newCtx(kind); const P = w.page
  await L.signIn(w, who)
  for (const vw of (who === 'admin' ? [320, 402, 701, 720, 760, 820] : [320, 375])) {
    await P.setViewportSize({ width: vw, height: 874 }); await P.waitForTimeout(700)
    await P.evaluate(() => window.scrollTo(0, 0))
    const tr = await tabRow(P)
    await P.screenshot({ path: `${L.OUT}/${who}-tabs-${vw}.png`, clip: { x: 0, y: 40, width: vw, height: 100 }, scale: 'css' })
    const cnt = await P.evaluate(() => { const n = document.querySelector('.appr-tabn'); const t = n?.closest('[role="tab"]'); if (!n || !t) return null; const a = n.getBoundingClientRect(), b = t.getBoundingClientRect(); return { n: [Math.round(a.left), Math.round(a.right)], tab: [Math.round(b.left), Math.round(b.right)] } })
    const oil = tr.tabs.find(t => t.id === 'oil-tracker')
    const cover = await P.evaluate(() => { const e = document.querySelector('[data-testid="oil-tracker"]'); const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!h && (e === h || e.contains(h)) })
    const good = tr.tabs.every(t => t.top === tr.tabs[0].top) && (who === 'member' || (tr.gear && oil.right <= tr.gear.left && tr.gear.right <= tr.vw)) && tr.sw <= tr.vw && (!cnt || cnt.n[1] <= cnt.tab[1]) && cover
    note(`T${vw} ${who}: tab row at ${vw}`, `${vw} ${kind}`, ok(good), `icons ${tr.tabs.map(t => t.icon ? 'Y' : 'n').join('')}; tabs ${tr.tabs.map(t => t.id.replace('lw-tab-', '') + ' ' + t.left + '-' + t.right).join(', ')}; gear ${tr.gear ? tr.gear.left + '-' + tr.gear.right : 'none'}; scrollWidth ${tr.sw}/${tr.vw}; count ${JSON.stringify(cnt)}; OIL's centre hits OIL: ${cover}`, [`${who}-tabs-${vw}`])
    if (vw === 320 || vw === 720) {
      await press(w, T('oil-tracker')); await P.waitForTimeout(900)
      const st = await P.evaluate(() => ({ settings: [...document.querySelectorAll('[data-testid="settings-sheet"]')].some(e => e.getBoundingClientRect().width > 0), oilSel: document.querySelector('[data-testid="oil-tracker"]')?.getAttribute('aria-selected'), menu: /MENU/.test(document.body.innerText.slice(0, 400)) }))
      await shot(w, `${who}-oil-pressed-${vw}`)
      note(`T${vw}b ${who}: a press on OIL opens the OIL tracker, not Settings`, `${vw} ${kind}`, ok(!st.settings && st.oilSel === 'true'), JSON.stringify(st), [`${who}-oil-pressed-${vw}`])
      await P.keyboard.press('Escape'); await P.waitForTimeout(300)
      await P.evaluate(() => document.querySelector('[data-testid="lw-tab-grid"]')?.click()); await P.waitForTimeout(500)
    }
  }
  note('errors (console, page, 4xx)', kind + ' ' + who, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 600) : 'none')
  await w.ctx.close()
}
R.dump('r8')
await L.closeBrowser()
console.log('DONE')
