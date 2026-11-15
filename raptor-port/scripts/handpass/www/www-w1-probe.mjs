/* www w1 probe 4: the flight row's field keys */
const PHONE = process.env.PHONE === '1'
process.env.WWW_WHO = 'w1'
process.env.WWW_RUN ||= 'probe4-' + (PHONE ? 'p' : 'd')
const H = await import('./www-w1-lib3.mjs')
const { X, say, sleep, L, nrm } = H
const w = await X.open({ phone: PHONE })
const { page } = w
await X.board(w, X.FRI)
await X.flight(w, X.FRI, '12:00', '', 'bane', { msn: 'VL BFM' })
say(await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld^="ff:4.0"]')].map(e => e.dataset.bfld + '|' + (e.value ?? '') + '|' + e.getBoundingClientRect().width).join('\n')))
say(await page.evaluate(() => [...document.querySelectorAll('#schedBoard button')].filter(b => b.getBoundingClientRect().width > 0 && /plan|Live|eye|👁|version/i.test(b.id + b.className + b.innerText + JSON.stringify(b.dataset))).map(b => b.id + '|' + b.className + '|' + JSON.stringify(b.dataset) + '|' + b.innerText.trim().slice(0, 40)).join('\n')))
await X.fin(w)
