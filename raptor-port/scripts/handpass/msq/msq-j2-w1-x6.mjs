/* msq-j2-w1-x6 v1 — explore: restore post-in calendar; name box -> button label */
process.env.MSQ_WHO = 'w1'
process.env.MSQ_RUN = process.env.MSQ_RUN || 'x6'
const H = await (await import('./msq-j2-w1-h.mjs')).mk()
const { X, U, say, sleep } = H
say('msq-j2-w1-x6 v1')
const w = await X.open({ user: 'ad' })
const p = w.page
const o2 = await H.openRow(w, 'Harrier')
await p.locator('#accEdArchive').click(); await sleep(900)
await p.locator(`.acc-row[data-person="${o2.pid}"] .acc-tap`).first().click(); await sleep(800)
await p.locator('#accArPostIn').click(); await sleep(800)
await X.pic(w, 'x6-01-calendar')
say('cal buttons', await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 2 && r.height > 2 && /^\d{1,2}$/.test(b.textContent.trim()) }).map(b => b.textContent.trim() + '[' + (b.getAttribute('aria-label') || b.getAttribute('data-d') || b.className) + ']').join(' ')))
const cal = await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => /^21$/.test(b.textContent.trim())); return b ? b.outerHTML.slice(0, 300) : 'none' })
say('btn21', cal)
await X.fin(w)
