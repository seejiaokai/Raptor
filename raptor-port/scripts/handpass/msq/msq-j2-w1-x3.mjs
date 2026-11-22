/* msq-j2-w1-x3 v1 — explore: hand OIL award on a past day cell, as ad9 */
process.env.MSQ_WHO = 'w1'
process.env.MSQ_RUN = process.env.MSQ_RUN || 'x3'
const Hm = await import('./msq-j2-w1-h2.mjs')
const H = await (await import('./msq-j2-w1-h.mjs')).mk()
const { X, U, say, sleep } = H
say('msq-j2-w1-x3 v1')
const w = await X.open({ user: 'ad9' })
const p = w.page
await X.L.go(p, 'leavewar'); await sleep(2500)
const pid = await U.pidOf(p, 'Harrier')
const d = Hm.iso(Hm.T, -1)
const cell = p.locator(`[data-testid="cell-${pid}-${d}"]`).first()
await cell.scrollIntoViewIfNeeded(); await cell.click(); await sleep(1000)
await X.pic(w, 'x3-01-cell-clicked')
const vis = () => p.evaluate(() => [...document.querySelectorAll('button,input,select,[role=menuitem]')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 2 && r.height > 2 && r.top > 40 }).map(b => (b.getAttribute('aria-label') || b.textContent || b.value || '').replace(/\s+/g, ' ').trim().slice(0, 30)).filter(Boolean).slice(0, 80).join(' | '))
say('buttons after cell', await vis())
const more = p.locator('button:visible', { hasText: '⋯' }).last()
say('more count', await more.count())
if (await more.count()) { await more.click(); await sleep(700); await X.pic(w, 'x3-02-more'); say('after more', await vis()) }
await X.fin(w)
