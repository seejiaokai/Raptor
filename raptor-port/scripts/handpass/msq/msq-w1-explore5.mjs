/* msq-w1-explore5 v1 — W1 finds the + Input window (as us9) and the Holidays form (as ad9) */
process.env.MSQ_WHO = 'w1'
process.env.MSQ_RUN = 'explore5'
const X = await import('./msq-lib.mjs')
const U = await import('./msq-w1-util.mjs')
const { say, sleep } = X
say('msq-w1-explore5 v1')
const w = await X.open({ phone: false, user: 'us9' })
const { page } = w
const list = async sel => page.evaluate(s => [...document.querySelectorAll(s)].filter(e => e.offsetWidth > 0).map(e => e.tagName + '|' + (e.id || '') + '|' + [...e.attributes].filter(a => /^data-|placeholder|aria-label|type$/.test(a.name)).map(a => a.name + '=' + a.value).join(',') + '|' + (e.value || e.innerText || '').replace(/\s+/g, ' ').slice(0, 30)), sel)
await X.L.go(page, 'inputs'); await sleep(1200)
await page.getByRole('button', { name: /^\s*List/ }).first().click(); await sleep(900)
await X.pic(w, 'e5-us9-list')
await page.getByRole('button', { name: /\+ Input/ }).first().click(); await sleep(900)
await X.pic(w, 'e5-us9-new-input')
say('WIN', JSON.stringify((await list('button,input,select,textarea')).slice(0, 90)))
say('TEXT', (await U.bodyText(page)).slice(0, 900))
await X.signOut(w)
await X.login(page, 'ad9')
await X.L.go(page, 'leavewar'); await sleep(2500)
await X.pic(w, 'e5-ad9-lw')
say('LWBTNS', JSON.stringify((await list('button')).slice(0, 50)))
await X.fin(w)
