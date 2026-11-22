/* msq-j2-w2-f3 v2 — W2-F's Approvals round-trip, redone with the page scrolled to its top (f-run's step timed out: the bar was off screen). */
process.env.MSQ_WHO = 'w2'
process.env.MSQ_RUN = process.env.MSQ_RUN || 'f3'
const H = await (await import('./msq-j2-w2-h.mjs')).mk()
const { X, U, say, sleep, row } = H
say('msq-j2-w2-f3 v2')
const w = await X.open({ user: 'ad2' })
const p = w.page
for (const user of ['ad2', 'ad9']) {
  if (user === 'ad9') await H.swap(w, 'ad9')
  try {
    await X.L.go(p, 'leavewar'); await sleep(2500)
    await p.evaluate(() => { window.scrollTo(0, 0); for (const e of document.querySelectorAll('*')) if (e.scrollTop > 0) e.scrollTop = 0 }); await sleep(500)
    await X.pic(w, `${user}-a0-leavewar-top`)
    const ap = p.locator('text=/^Approvals/').first()
    say(user, 'approvals buttons', await ap.count())
    await ap.click({ timeout: 8000 }); await sleep(1200)
    await X.pic(w, `${user}-a1-approvals`)
    const t1 = (await U.bodyText(p)).slice(0, 260)
    await p.locator('text=/^Grid$/').first().click({ timeout: 8000 }); await sleep(1200)
    await X.pic(w, `${user}-a2-back-to-grid`)
    const n = await p.locator('[data-testid^="cell-"]').count()
    row('W2-F ' + user, 'desktop', `${user}: Leave War → Approvals → back to Grid`, 'Approvals opens; Grid comes back', `Approvals page words: ${t1} ; grid cells after: ${n}`, n > 0 ? 'PASS' : 'FAIL', `${user}-a1, ${user}-a2`)
  } catch (e) { row('W2-F ' + user, 'desktop', 'Approvals round trip', 'works', 'script error ' + e.message.slice(0, 150), 'OWED', '') }
}
await X.fin(w)
