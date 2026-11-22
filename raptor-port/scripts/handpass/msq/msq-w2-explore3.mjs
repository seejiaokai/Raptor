/* msq-w2-explore3 v2 — W2: the DOM of a Logic setting box in edit mode, and a tracker ball window, as ad9. */
process.env.MSQ_WHO = 'w2'
process.env.MSQ_RUN = 'explore3b-d'
const X = await import('./msq-lib.mjs')
const U = await import('./msq-w1-util.mjs')
const { say, sleep } = X
say('msq-w2-explore3 v2')
const w = await X.open({ phone: false, user: 'ad9' })
const { page } = w
await X.L.go(page, 'logic'); await sleep(1200)
await page.getByRole('button', { name: /Edit/ }).first().click(); await sleep(700)
say('LOGICDOM', await page.evaluate(() => { const e = document.elementFromPoint(535, 227); return e.tagName + ' ' + e.outerHTML.slice(0, 300) + ' || PARENT ' + e.parentElement.outerHTML.slice(0, 500) }))
await X.L.go(page, 'tracker'); await sleep(2500)
await page.mouse.click(515, 180); await sleep(1300)
await X.pic(w, 'z02-ball-window')
say('WIN', await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetWidth > 1 && b.getBoundingClientRect().top > 60).map(b => (b.id || b.className.slice(0, 15)) + '|' + b.innerText.trim().slice(0, 25)).join(' ; ').slice(0, 2000)))
await X.fin(w)
