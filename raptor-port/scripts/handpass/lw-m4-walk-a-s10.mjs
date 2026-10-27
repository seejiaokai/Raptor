// Walker A, route 6: reach an amber / red Manning row through the app's own bid window (admin places pending LL for several SXO men on one day, Approve what I enter OFF), then read Approvals' LOWEST AVAIL. Desktop.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/a/s10'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, placeBid, pressLoc, shotLine } = A
const { T, rec, shot, txt, vis, press } = L
console.log('[lw-m4-walk-a-s10 v1]')
L.clearOut()
const size = 'desk'
const w = await L.newCtx('desk'); const P = w.page
try {
  await L.signIn(w, 'admin')
  const rows = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].slice(0, 14).map(r => r.dataset.testid.slice(4)))
  console.log('first rows', rows.join(' '))
  const day = '2026-02-10'
  /* give the IP and SXO counters an amber and a red point through the counter's own window */
  for (const [id, amber, red] of [['ip', 14, 10], ['sxo', 11, 8]]) {
    await P.locator(`[data-testid="manning-info-${id}"]`).first().click(); await P.waitForTimeout(600)
    await P.fill(T('thresh-amber'), String(amber)); await P.fill(T('thresh-red'), String(red)); await P.waitForTimeout(200)
    await press(w, T('thresh-save')); await P.waitForTimeout(600)
    if (await vis(P, T('manning-sheet'))) { await P.keyboard.press('Escape'); await P.waitForTimeout(400) }
    console.log(`counter ${id}: amber ${amber}, red ${red} saved`)
  }
  let n = 0
  for (const who of rows.slice(0, 10)) {
    await L.openCell(w, who, day)
    if (!(await vis(P, T('bid-picker')))) { console.log('no window for', who); continue }
    if (n === 0) await L.approveWhatIEnter(w, false)
    const dl = await txt(P, T('bid-dayline'))
    console.log(`#${n} ${who}: day line before: ${dl}`)
    const ok = await L.placeLeave(w, 'LL')
    if (!ok) await L.closeWin(w)
    n++
    const bub = await P.evaluate(() => { const b = document.querySelector('[data-testid*="bubble"], [class*="bubble"]'); return b ? b.innerText.replace(/\s+/g, ' ').slice(0, 160) : null })
    if (bub) console.log('   bubble:', bub)
    if (n >= 8 && /amber|red|→/i.test(dl || '') && !/No manning row/.test(dl || '')) break
  }
  await shot(w, 'a-s10-1-grid-after')
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
  await L.openApprovals(w)
  const lines = await L.apprLines(P)
  for (const l of lines.filter(l => /10 Feb/.test(l.text))) console.log('   ', l.text)
  await shot(w, 'a-s10-2-approvals')
  const html = await P.evaluate(() => [...document.querySelectorAll('.appr-line')].filter(e => /10 Feb/.test(e.innerText) && e.querySelectorAll('.appr-av').length > 1).slice(0, 2).map(e => e.querySelector('.appr-avail').outerHTML.replace(/ style="[^"]*"/g, '')))
  console.log('multi-row avail html', JSON.stringify(html))
} catch (e) {
  rec('ERROR', size, 'FAIL', String(e).slice(0, 500))
  await shot(w, 'a-s10-error').catch(() => {})
}
console.log('errs', JSON.stringify(w.errs))
await w.ctx.close(); await L.closeBrowser()
