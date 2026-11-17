/* msq-w1-explore6 v1 — W1 finds the Leave War's Calendar / Holidays form as ad9 */
process.env.MSQ_WHO = 'w1'
process.env.MSQ_RUN = 'explore6'
const X = await import('./msq-lib.mjs')
const U = await import('./msq-w1-util.mjs')
const { say, sleep } = X
say('msq-w1-explore6 v1')
const w = await X.open({ phone: false, user: 'ad9' })
const { page } = w
const list = async sel => page.evaluate(s => [...document.querySelectorAll(s)].filter(e => e.offsetWidth > 0).map(e => e.tagName + '|' + (e.id || '') + '|' + [...e.attributes].filter(a => /^data-|placeholder|aria-label|type$/.test(a.name)).map(a => a.name + '=' + a.value).join(',') + '|' + (e.value || e.innerText || '').replace(/\s+/g, ' ').slice(0, 30)), sel)
await X.L.go(page, 'leavewar'); await sleep(2500)
const g = page.locator('[data-testid*="settings" i], button[aria-label*="ettings" i]').first()
say('GEAR count', await g.count())
await g.click(); await sleep(900)
await X.pic(w, 'e6-settings')
say('SET', JSON.stringify((await list('[role=dialog] button, [data-testid*=settings] button, button')).filter(s => !/month-|person-/.test(s)).slice(40, 130)))
const cal = page.getByRole('button', { name: /Calendar/ }).last()
say('CAL count', await cal.count())
await cal.click(); await sleep(1200)
await X.pic(w, 'e6-calendar')
say('CALTEXT', (await U.bodyText(page)).slice(0, 700))
say('CALBTN', JSON.stringify((await list('button')).filter(s => !/month-|person-|data-wk|data-beak|data-air|data-itadd|data-stcfg|data-notepub|data-day|data-plan/.test(s)).slice(0, 100)))
await X.fin(w)
