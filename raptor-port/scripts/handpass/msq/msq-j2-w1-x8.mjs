/* msq-j2-w1-x8 v1 — explore Admin add-person form controls */
process.env.MSQ_WHO = 'w1'
process.env.MSQ_RUN = process.env.MSQ_RUN || 'x8'
const H = await (await import('./msq-j2-w1-h.mjs')).mk()
const { X, U, say, sleep } = H
say('msq-j2-w1-x8 v1')
const w = await X.open({ user: 'ad' })
const p = w.page
await H.usersPage(w)
say('form', await p.evaluate(() => [...document.querySelectorAll('input,select,button')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && r.top > 400 }).map(e => e.tagName + '#' + e.id + '[' + (e.getAttribute('aria-label') || e.placeholder || e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30) + ']').join(' ')))
say('acc ids', await p.evaluate(() => [...document.querySelectorAll('[id^=acc],[id^=add]')].filter(e => e.getBoundingClientRect().width > 2).map(e => e.tagName + '#' + e.id + ':' + (e.textContent || '').slice(0, 20)).join(' | ')))
await p.locator(H.FIND).fill('Ranger'); await sleep(500)
const rg = await U.pidOf(p, 'Ranger')
await p.locator(`.acc-row[data-person="${rg}"] .acc-tap`).first().click(); await sleep(700)
say('ranger controls', JSON.stringify(await H.controls(p, rg)))
await X.fin(w)
