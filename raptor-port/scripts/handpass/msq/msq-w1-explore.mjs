/* msq-w1-explore v1 — W1 looks at what each page says as ad9 and ad (names only) */
process.env.MSQ_WHO = 'w1'
process.env.MSQ_RUN = 'explore'
const X = await import('./msq-lib.mjs')
const { say, sleep } = X
say('msq-w1-explore v1')
const w = await X.open({ phone: false, user: 'ad9' })
const { page } = w
const txt = async sel => X.nrm(await page.locator(sel).first().innerText().catch(() => ''))
for (const p of ['editsched', 'viewsched', 'inputs', 'quals', 'leavewar', 'tracker']) {
  await X.L.go(page, p); await sleep(2000)
  say('PAGE', p, (await txt('body')).slice(0, 900))
  await X.pic(w, 'e-' + p)
}
const btns = await page.evaluate(() => [...document.querySelectorAll('button,a,[role=button]')].filter(e => e.offsetWidth > 0).map(e => (e.id || '') + '|' + (e.getAttribute('aria-label') || '') + '|' + (e.innerText || '').replace(/\s+/g, ' ').slice(0, 25)).slice(0, 80))
say('BTNS', JSON.stringify(btns))
await X.fin(w)
