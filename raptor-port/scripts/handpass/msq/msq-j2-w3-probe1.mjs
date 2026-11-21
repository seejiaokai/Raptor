/* msq-j2-w3-probe1 v1 — W3 probe: the phone's Inputs page and its new-input window as ad9 */
process.env.MSQ_WHO = 'w3'
process.env.MSQ_RUN = process.env.MSQ_RUN || 'probe1'
const X = await import('./msq-lib.mjs')
const U = await import('./msq-w1-util.mjs')
const { say, sleep } = X
say('msq-j2-w3-probe1 v1')
const w = await X.open({ phone: true, user: 'ad9' })
const { page } = w
const vis = () => page.evaluate(() => [...document.querySelectorAll('button,a,input,select,textarea,[role=button],[role=tab]')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 2 && r.height > 2 && r.top < 874 && r.bottom > 0 }).map(b => { const r = b.getBoundingClientRect(); return `${b.tagName}#${b.id || ''}.${String(b.className).slice(0, 25)}[${(b.getAttribute('aria-label') || b.textContent || b.placeholder || '').replace(/\s+/g, ' ').trim().slice(0, 30)}]@${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)}x${Math.round(r.height)}` }).join('\n'))
await X.L.go(page, 'inputs'); await sleep(1500)
await X.pic(w, 'p1-01-inputs')
say('INPUTS buttons:\n' + await vis())
await X.fin(w)
