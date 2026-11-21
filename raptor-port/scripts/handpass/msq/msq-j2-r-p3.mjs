/* msq-j2-r-p3 v1 — probe: Leave War day window as ad9 on Merlin's Thu 26 Nov */
process.env.MSQ_RUN = process.env.MSQ_RUN || 'p3'
const H = await (await import('./msq-j2-r-h.mjs')).mk()
const { X, say, sleep } = H
say('msq-j2-r-p3 v1')
const w = await X.open({ user: 'ad9' })
const p = w.page
await X.L.go(p, 'leavewar'); await sleep(2500)
await H.lwCell(w, 'mer9', '2026-11-26')
await X.pic(w, 'p01-cell-window')
const dump = () => p.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(b => b.getBoundingClientRect().width > 2 && /bid|auto|code|type|win|oil|grant|more/i.test(b.dataset.testid)).map(b => b.dataset.testid + '[' + (b.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 24) + ']').join(' '))
say('testids', await dump())
say('buttons', await p.evaluate(() => [...document.querySelectorAll('.bidsheet button, .bidsheet label, .bidsheet input, .bidsheet select')].filter(b => b.getBoundingClientRect().width > 2).map(b => b.tagName + ':' + (b.dataset.testid || b.id || '') + '[' + (b.innerText || b.value || b.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 24) + ']').join(' ')))
say('sheet text', await p.evaluate(() => (document.querySelector('.bidsheet')?.innerText || '').replace(/\s+/g, ' ').slice(0, 600)))
await X.fin(w)
