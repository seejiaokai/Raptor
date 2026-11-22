/* msq-w1-explore4 v1 — W1 finds the ground row's people slot */
process.env.MSQ_WHO = 'w1'
process.env.MSQ_RUN = 'explore4'
const X = await import('./msq-lib.mjs')
const { say, sleep } = X
say('msq-w1-explore4 v1')
const w = await X.open({ phone: false, user: 'ad9' })
const { page } = w
await X.W.board(w, 2); await sleep(800)
await X.W.press(w, '[data-gradd="2"]', { scope: 'board' })
await sleep(800)
const slots = await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-slot]')].filter(e => e.offsetWidth > 0 && /^g:/.test(e.dataset.slot)).map(e => e.dataset.slot + '|' + e.className))
say('GSLOTS', JSON.stringify(slots))
say('ROWHTML', await page.evaluate(() => { const e = document.querySelector('#schedBoard [data-grcx="2.0"]'); let r = e; for (let i = 0; i < 3 && r.parentElement; i++) r = r.parentElement; return r.outerHTML.replace(/\s+/g, ' ').slice(0, 2500) }))
const ids = await page.evaluate(() => Object.entries(window.PEOPLE).filter(([k, v]) => /Kestrel|Falcon/.test(v.cs)).map(([k, v]) => k + '=' + v.cs))
say('IDS', JSON.stringify(ids))
await X.fin(w)
