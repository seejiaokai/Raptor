/* msq-w1-explore8 v1 — W1 lists the Holidays form's calendar buttons as ad9 */
process.env.MSQ_WHO = 'w1'
process.env.MSQ_RUN = 'explore8'
const X = await import('./msq-lib.mjs')
const U = await import('./msq-w1-util.mjs')
const { say, sleep } = X
const w = await X.open({ phone: false, user: 'ad9' })
const { page } = w
await X.L.go(page, 'leavewar'); await sleep(2500)
await page.locator('[data-testid="settings-open"]').click(); await sleep(700)
await page.locator('[data-testid="settings-days"]').click(); await sleep(1000)
await page.locator('[data-testid="hol-add"]').click(); await sleep(900)
const l = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="holcal"],[data-testid^="hol-"]')].filter(e => e.offsetWidth > 0).map(e => e.tagName + '|' + e.getAttribute('data-testid') + '|' + (e.innerText || '').replace(/\s+/g, ' ').slice(0, 20)))
say('HOL', JSON.stringify(l.slice(0, 80)))
say('TEXT', (await U.bodyText(page)).slice(-700))
await X.fin(w)
