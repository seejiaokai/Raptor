/* msq-j2-w3-probe4 v1 — W3 probe: the person select and the several-people picker, as ad9 and us9 (phone) */
process.env.MSQ_WHO = 'w3'
process.env.MSQ_RUN = process.env.MSQ_RUN || 'probe4'
const X = await import('./msq-lib.mjs')
const { say, sleep } = X
say('msq-j2-w3-probe4 v1')
const w = await X.open({ phone: true, user: 'ad9' })
const { page } = w
const vis = () => page.evaluate(() => [...document.querySelectorAll('.inped-win button,.inped-win input,.inped-win select,.inped-win [role],.inped-win [class*=pp]')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 2 && r.height > 2 }).map(b => { const r = b.getBoundingClientRect(); return `${b.tagName}#${b.id || ''}.${String(b.className).slice(0, 25)}[${(b.getAttribute('aria-label') || b.textContent || b.placeholder || '').replace(/\s+/g, ' ').trim().slice(0, 30)}]@${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)}x${Math.round(r.height)}` }).join('\n'))
await X.L.go(page, 'inputs'); await sleep(1500)
await page.locator('#inListBtn').tap(); await sleep(800)
await page.locator('#inNew').tap(); await sleep(1500)
say('select options: ' + await page.evaluate(() => [...document.querySelectorAll('#inpEditPerson option')].map(o => o.text).join(' | ')))
await page.locator('.pp-sw').tap(); await sleep(1000)
await X.pic(w, 'p4-01-several')
say('SEVERAL:\n' + await vis())
await X.fin(w)
