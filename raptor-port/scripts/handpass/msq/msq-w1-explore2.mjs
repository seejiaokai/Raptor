/* msq-w1-explore2 v1 — W1 finds the board's ground add and publish controls as ad9 */
process.env.MSQ_WHO = 'w1'
process.env.MSQ_RUN = 'explore2'
const X = await import('./msq-lib.mjs')
const { say, sleep } = X
say('msq-w1-explore2 v1')
const w = await X.open({ phone: false, user: 'ad9' })
const { page } = w
await X.W.board(w, 2); await sleep(800)
await X.pic(w, 'e2-board')
const list = async sel => page.evaluate(s => [...document.querySelectorAll(s)].filter(e => e.offsetWidth > 0).map(e => (e.id || '') + '|' + [...e.attributes].filter(a => /^data-/.test(a.name)).map(a => a.name + '=' + a.value).join(',') + '|' + (e.innerText || '').replace(/\s+/g, ' ').slice(0, 30)), sel)
say('BOARD BTNS', JSON.stringify(await list('#schedBoard button, #schedBoard [data-gradd], #schedBoard [data-add]')))
const body = (await page.locator('#schedBoard').innerText()).replace(/\s+/g, ' ')
say('BOARD TEXT', body.slice(0, 1500))
await X.fin(w)
