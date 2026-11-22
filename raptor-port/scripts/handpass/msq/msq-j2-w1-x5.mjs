/* msq-j2-w1-x5 v1 — explore: Delete first press, Archived fold row controls, restore calendar */
process.env.MSQ_WHO = 'w1'
process.env.MSQ_RUN = process.env.MSQ_RUN || 'x5'
const H = await (await import('./msq-j2-w1-h.mjs')).mk()
const { X, U, say, sleep } = H
say('msq-j2-w1-x5 v1')
const w = await X.open({ user: 'ad' })
const p = w.page
const o = await H.openRow(w, 'Raven')
await p.locator('#accEdDel').click(); await sleep(900)
await X.pic(w, 'x5-01-delete-first')
say('after Delete press', (await H.controls(p, o.pid)).map(c => c.id + ':' + c.label).join(' | '))
say('tail', (await U.bodyText(p)).match(/.{0,150}(delete|Delete).{0,200}/g)?.slice(0, 4).join(' ## '))
await p.locator('#accEdCancel').click().catch(() => {}); await sleep(700)
await X.pic(w, 'x5-02-after-cancel')
say('after cancel controls', (await H.controls(p, o.pid)).map(c => c.id + ':' + c.label).join(' | '))
// now Harrier archive then open
const o2 = await H.openRow(w, 'Harrier')
await p.locator('#accEdArchive').click(); await sleep(900)
const fold = p.getByRole('button', { name: /Archived/ }).first()
say('fold count', await fold.count(), await fold.textContent().catch(() => ''))
await X.pic(w, 'x5-03-after-archive')
const tap = p.locator(`.acc-row[data-person="${o2.pid}"] .acc-tap`).first()
say('tap count', await tap.count())
await tap.click().catch(e => say('tapfail', e.message.slice(0, 60))); await sleep(800)
await X.pic(w, 'x5-04-archived-row-open')
say('archived row controls', JSON.stringify(await H.controls(p, o2.pid)))
const body = await p.evaluate(pid => { const r = document.querySelector('.acc-row[data-person="' + pid + '"]'); return r ? (r.parentElement.innerText || '').replace(/\s+/g, ' ').slice(0, 600) : 'no row' }, o2.pid)
say('row text', body)
await X.fin(w)
