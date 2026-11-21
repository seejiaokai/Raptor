/* msq-fr5-probe v1 — the bell's structure for one sign-in (host probe) */
process.env.MSQ_RUN = process.env.MSQ_RUN || 'probe'
const H = await (await import('./msq-j2-r-h.mjs')).mk()
const { X, say, sleep } = H
say('msq-fr5-probe v1')
const user = process.env.FR5_USER || 'ad'
const w = await X.open({ phone: process.env.FR5_PHONE === '1', user })
const p = w.page
const b = p.locator('#notifyBell:visible').first()
say('bell html', await b.evaluate(e => e.outerHTML.slice(0, 500)))
await b.click(); await sleep(900)
say('list html', await p.evaluate(() => { const l = document.querySelector('[data-testid="bell-list"]'); return l ? l.outerHTML.slice(0, 2500) : 'none' }))
await X.pic(w, 'probe-' + user)
await X.fin(w)
