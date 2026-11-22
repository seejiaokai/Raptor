/* msq-j2-w1-x2 v1 — explore Leave War as ad9: Osprey row, cells, person window */
process.env.MSQ_WHO = 'w1'
process.env.MSQ_RUN = process.env.MSQ_RUN || 'x2'
const Hm = await import('./msq-j2-w1-h2.mjs')
const H = await (await import('./msq-j2-w1-h.mjs')).mk()
const { X, U, say, sleep } = H
say('msq-j2-w1-x2 v1')
const w = await X.open({ user: 'ad9' })
await X.L.go(w.page, 'leavewar'); await sleep(2500)
const pid = await U.pidOf(w.page, 'Osprey')
await Hm.lwScroll(w.page, pid, Hm.T); await sleep(500)
await X.pic(w, 'x2-01-lw')
const days = [-3, -2, -1, 0, 1, 2, 7].map(n => Hm.iso(Hm.T, n))
say('row', JSON.stringify(await Hm.lwRow(w.page, pid, days)))
say('named els', await w.page.evaluate(id => [...document.querySelectorAll('[data-person="' + id + '"]')].map(e => e.tagName + '.' + String(e.className).slice(0, 30) + ':' + e.textContent.slice(0, 30)).join(' | '), pid))
await X.fin(w)
