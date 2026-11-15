process.env.RCB2_RUN = 'probe4'
const X = await import('./rcb2-w1-lib.mjs')
const { L, say, nrm, sleep } = X
const w = await X.world('desktop', 'a')
const page = w.page
await X.board(w, 4)
const gi = await X.addWave(w, 4, 'sc')
say('sc wave idx', gi, JSON.stringify(await page.evaluate(i => window.DAYS[4].waves[i], gi)).slice(0, 700))
say('sc slots', await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-slot],#schedBoard [data-fill]')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.dataset.slot || e.dataset.fill)).join(' ')))
say('all add-ish buttons', await page.evaluate(() => [...document.querySelectorAll('#schedBoard button')].filter(e => e.getBoundingClientRect().width > 0 && /add|row|item|\+/i.test(e.innerText + ' ' + [...e.attributes].map(a => a.name).join(' '))).map(e => [...e.attributes].filter(a => /^data-/.test(a.name)).map(a => a.name + '=' + a.value).join(' ') + ' | ' + e.innerText.trim().slice(0, 25)).join('\n')))
say('allhands', JSON.stringify(await page.evaluate(() => window.DAYS[4].allhands)))
await X.pic(w, 'probe4-board')
await X.finishWorld(w)
