/* msq-j2-w3-probe5 v1 — W3 probe: the bell and the Tracker as ad9 (phone) */
process.env.MSQ_WHO = 'w3'
process.env.MSQ_RUN = process.env.MSQ_RUN || 'probe5'
const X = await import('./msq-lib.mjs')
const { say, sleep } = X
say('msq-j2-w3-probe5 v1')
const w = await X.open({ phone: true, user: 'ad9' })
const { page } = w
const vis = sel => page.evaluate(sel => [...document.querySelectorAll(sel)].filter(b => { const r = b.getBoundingClientRect(); return r.width > 2 && r.height > 2 && r.top < 874 && r.bottom > 0 }).map(b => { const r = b.getBoundingClientRect(); return `${b.tagName}#${b.id || ''}.${String(b.className).slice(0, 30)}[${(b.getAttribute('aria-label') || b.textContent || b.placeholder || '').replace(/\s+/g, ' ').trim().slice(0, 40)}]@${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)}x${Math.round(r.height)}` }).join('\n'), sel)
await X.L.go(page, 'editsched'); await sleep(1200)
await page.locator('#notifyBell').tap(); await sleep(900)
await X.pic(w, 'p5-01-bell')
say('BELL:\n' + await vis('button,a,[role],li,.notif-line,[class*=notif]'))
await page.locator('#notifyBell').tap(); await sleep(600)
await X.L.go(page, 'tracker'); await sleep(2500)
await X.pic(w, 'p5-02-tracker')
say('TRACKER:\n' + await vis('#page-tracker button,#page-tracker a,#page-tracker [role],#page-tracker select'))
say('TRACKER TEXT: ' + (await page.evaluate(() => document.querySelector('#page-tracker').innerText.replace(/\s+/g, ' ').slice(0, 600))))
await X.fin(w)
