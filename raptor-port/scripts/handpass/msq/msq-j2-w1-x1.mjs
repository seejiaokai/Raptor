/* msq-j2-w1-x1 v1 — explore: master opens Osprey's row, lists controls; Archive press words */
process.env.MSQ_WHO = 'w1'
process.env.MSQ_RUN = process.env.MSQ_RUN || 'x1'
const H = await (await import('./msq-j2-w1-h.mjs')).mk()
const { X, U, say, sleep } = H
say('msq-j2-w1-x1 v1')
const w = await X.open({ user: 'ad' })
const o = await H.openRow(w, 'Osprey')
say('opened', o.opened, o.pid)
await X.pic(w, 'x1-01-row')
say('controls', JSON.stringify(await H.controls(w.page, o.pid)))
const arch = w.page.getByRole('button', { name: /^Archive/ }).first()
say('archive count', await arch.count())
await arch.click(); await sleep(900)
await X.pic(w, 'x1-02-after-archive')
say('body tail', (await U.bodyText(w.page)).slice(0, 1800))
say('controls2', JSON.stringify(await H.controls(w.page, o.pid)))
await X.fin(w)
