/* msq-j2-w1-x4 v1 — explore: Grant OIL on Harrier T-1, then person window OIL */
process.env.MSQ_WHO = 'w1'
process.env.MSQ_RUN = process.env.MSQ_RUN || 'x4'
const Hm = await import('./msq-j2-w1-h2.mjs')
const G = await import('./msq-j2-w1-h3.mjs')
const H = await (await import('./msq-j2-w1-h.mjs')).mk()
const { X, U, say, sleep } = H
say('msq-j2-w1-x4 v1')
const w = await X.open({ user: 'ad9' })
const p = w.page
await X.L.go(p, 'leavewar'); await sleep(2500)
const pid = await U.pidOf(p, 'Harrier')
const d = Hm.iso(Hm.T, -1)
const cell = p.locator(`[data-testid="cell-${pid}-${d}"]`).first()
await cell.scrollIntoViewIfNeeded(); await cell.click(); await sleep(1000)
await p.getByRole('button', { name: 'Grant OIL' }).click(); await sleep(1000)
await X.pic(w, 'x4-01-after-grant')
const txt = await p.evaluate(() => [...document.querySelectorAll('[role=dialog], .pop, .win, [class*=win]')].filter(e => e.getBoundingClientRect().width > 100).map(e => e.innerText.replace(/\s+/g, ' ')).join(' ## ').slice(0, 800))
say('win', txt)
say('row', JSON.stringify(await Hm.lwRow(p, pid, [d, Hm.T])))
await X.fin(w)
