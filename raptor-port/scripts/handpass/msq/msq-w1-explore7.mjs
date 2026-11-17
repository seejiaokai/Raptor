/* msq-w1-explore7 v1 — W1 opens Holidays + Add as ad9 and reads the form */
process.env.MSQ_WHO = 'w1'
process.env.MSQ_RUN = 'explore7'
const X = await import('./msq-lib.mjs')
const U = await import('./msq-w1-util.mjs')
const { say, sleep } = X
say('msq-w1-explore7 v1')
const w = await X.open({ phone: false, user: 'ad9' })
const { page } = w
const list = async sel => page.evaluate(s => [...document.querySelectorAll(s)].filter(e => e.offsetWidth > 0).map(e => e.tagName + '|' + (e.id || '') + '|' + [...e.attributes].filter(a => /^data-|placeholder|aria-label|type$/.test(a.name)).map(a => a.name + '=' + a.value).join(',') + '|' + (e.value || e.innerText || '').replace(/\s+/g, ' ').slice(0, 30)), sel)
await X.L.go(page, 'leavewar'); await sleep(2500)
await page.locator('[data-testid="settings-open"]').click(); await sleep(700)
await page.locator('[data-testid="settings-days"]').click(); await sleep(1000)
await page.getByRole('button', { name: /\+ Add/ }).first().click(); await sleep(900)
await X.pic(w, 'e7-add-form')
say('FORM', JSON.stringify((await list('button,input,select,textarea')).filter(s => !/month-|person-|data-wk|data-beak|data-air|data-itadd|data-stcfg|data-notepub|data-day|data-plan|days-d-|days-n-|days-nf-|data-inp|data-crew/.test(s)).slice(20, 120)))
say('TEXT', (await U.bodyText(page)).slice(-900))
await X.fin(w)
