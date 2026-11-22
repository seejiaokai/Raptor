/* msq-w2-explore v1 — W2 looks at Logic, the bell and the Tracker as ad9 (desktop). */
process.env.MSQ_WHO = 'w2'
process.env.MSQ_RUN = 'explore-d'
const X = await import('./msq-lib.mjs')
const U = await import('./msq-w1-util.mjs')
const { say, sleep } = X
say('msq-w2-explore v1')
const w = await X.open({ phone: false, user: 'ad9' })
const { page } = w
await X.L.go(page, 'logic'); await sleep(1500)
await X.pic(w, 'x01-logic')
say('LOGIC', (await U.bodyText(page)).slice(0, 1500))
say('INPUTS', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('input,select')].filter(e => e.offsetWidth > 1).slice(0, 40).map(e => [e.tagName, e.type, e.id, e.name, e.value, e.getAttribute('data-k') || '', e.getAttribute('aria-label') || '']))))
say('BUTTONS', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('button')].filter(e => e.offsetWidth > 1).slice(0, 60).map(e => [e.id, e.innerText.trim().slice(0, 20), e.getAttribute('aria-label') || '', e.title]))))
await X.L.go(page, 'editsched'); await sleep(800)
say('BELLS', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('button,[role=button]')].filter(e => /bell|notif/i.test(e.id + e.className + (e.getAttribute('aria-label') || '') + e.title)).map(e => [e.tagName, e.id, e.className, e.getAttribute('aria-label'), e.title]))))
await X.L.go(page, 'tracker'); await sleep(2500)
await X.pic(w, 'x02-tracker')
say('TRACKER', (await U.bodyText(page)).slice(0, 1500))
await X.fin(w)
