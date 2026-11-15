/* www w1 probe 5: SC duty block on Friday */
const PHONE = process.env.PHONE === '1'
process.env.WWW_WHO = 'w1'
process.env.WWW_RUN ||= 'probe5-' + (PHONE ? 'p' : 'd')
const H = await import('./www-w1-lib3.mjs')
const { X, say, sleep, L, nrm } = H
const w = await X.open({ phone: PHONE })
const { page } = w
await X.board(w, X.FRI)
await X.press(w, `[data-dwadd="4"]`, { scope: 'board' }); await sleep(500)
say(await page.evaluate(() => [...document.querySelectorAll('button')].filter(e => e.getBoundingClientRect().width > 0 && /SC Shift|AVALON|Standard|Empty block/.test(e.innerText || '')).map(e => JSON.stringify(e.dataset) + '|' + (e.innerText || '').replace(/\s+/g, ' ')).join('\n')))
const sel = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(e => e.getBoundingClientRect().width > 0 && /^SC Shift/.test((e.innerText || '').trim())); const k = Object.entries(b.dataset)[0]; return k ? `[data-${k[0].replace(/[A-Z]/g, m => '-' + m.toLowerCase())}="${k[1]}"]` : null })
say('sel', sel)
await X.press(w, sel); await sleep(700)
say('duty after', JSON.stringify(await page.evaluate(() => window.DAYS[4].dutywaves.map(b => ({ label: b.label, sa: b.sa, rows: b.rows.map(r => Object.keys(r).join(',') + ' :: ' + r.role + '|' + r.str + '-' + r.end + '|' + r.id) })))))
say(await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld^="dr:4.1"], #schedBoard [data-bfld^="dl:4.1"]')].map(e => e.dataset.bfld + '|' + (e.value ?? '')).join('\n')))
say(await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-fill^="d:4.1"], #schedBoard [data-drflag], #schedBoard [data-drcx]')].map(e => JSON.stringify(e.dataset)).slice(0, 20).join('\n')))
await X.pic(w, 'scblock')
await X.fin(w)
