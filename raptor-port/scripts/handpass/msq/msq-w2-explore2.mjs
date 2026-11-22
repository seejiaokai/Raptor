/* msq-w2-explore2 v1 — W2 looks at Logic's Edit Settings, the bell and Tracker student window as ad9. */
process.env.MSQ_WHO = 'w2'
process.env.MSQ_RUN = 'explore2-d'
const X = await import('./msq-lib.mjs')
const U = await import('./msq-w1-util.mjs')
const { say, sleep } = X
say('msq-w2-explore2 v1')
const w = await X.open({ phone: false, user: 'ad9' })
const { page } = w
await X.L.go(page, 'logic'); await sleep(1200)
await page.getByRole('button', { name: /^s*S?s*Edits*$/ }).first().click(); await sleep(800)
await X.pic(w, 'y01-logic-edit')
say('INPUTS', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('input,select,textarea')].filter(e => e.offsetWidth > 1).slice(0, 30).map(e => [e.tagName, e.type, e.id, e.value, e.getAttribute('aria-label') || '', e.getAttribute('data-vk') || e.getAttribute('data-k') || '']))))
say('BTN', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('button')].filter(e => e.offsetWidth > 1 && e.getBoundingClientRect().top > 60).slice(0, 30).map(e => [e.id, e.innerText.trim().slice(0, 25), e.getAttribute('aria-label') || '']))))
await page.locator('#notifyBell').click(); await sleep(900)
await X.pic(w, 'y02-bell')
say('BELL', (await U.bodyText(page)).slice(0, 600))
await page.locator('#notifyBell').click(); await sleep(500)
await X.L.go(page, 'tracker'); await sleep(2500)
say('TRK', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#page-tracker button, #page-tracker select')].filter(e => e.offsetWidth > 1).slice(0, 40).map(e => [e.tagName, e.id, e.className.slice(0, 20), (e.innerText || '').trim().slice(0, 20), e.title]))))
say('TRKTEXT', (await page.evaluate(() => document.querySelector('#page-tracker').innerText)).replace(/\s+/g, ' ').slice(0, 700))
await X.fin(w)
