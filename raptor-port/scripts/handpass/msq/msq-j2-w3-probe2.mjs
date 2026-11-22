/* msq-j2-w3-probe2 v1 — W3 probe: the List view, + Input, the new-input window as ad9 (phone) */
process.env.MSQ_WHO = 'w3'
process.env.MSQ_RUN = process.env.MSQ_RUN || 'probe2'
const X = await import('./msq-lib.mjs')
const { say, sleep } = X
say('msq-j2-w3-probe2 v1')
const w = await X.open({ phone: true, user: 'ad9' })
const { page } = w
const vis = () => page.evaluate(() => [...document.querySelectorAll('button,a,input,select,textarea,[role=button],[role=tab],[role=listbox],[role=option]')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 2 && r.height > 2 && r.top < 874 && r.bottom > 0 }).map(b => { const r = b.getBoundingClientRect(); return `${b.tagName}#${b.id || ''}.${String(b.className).slice(0, 25)}[${(b.getAttribute('aria-label') || b.textContent || b.placeholder || '').replace(/\s+/g, ' ').trim().slice(0, 30)}]@${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)}x${Math.round(r.height)}` }).join('\n'))
await X.L.go(page, 'inputs'); await sleep(1500)
await page.locator('#inListBtn').tap(); await sleep(1000)
await X.pic(w, 'p2-01-list')
say('LIST buttons:\n' + await vis())
const nb = page.locator('#inNew')
say('new input count', await nb.count())
if (await nb.count()) { await nb.tap(); await sleep(2500); say("dialogs", await page.evaluate(() => [...document.querySelectorAll("[role=dialog],.inwin,.modal,[class*=win]")].map(e=>e.className+":"+Math.round(e.getBoundingClientRect().width)+"x"+Math.round(e.getBoundingClientRect().height)).slice(0,15).join(" | "))); await X.pic(w, 'p2-02-newinput'); say('WIN buttons:\n' + await vis()) }
await X.fin(w)
