/* msq-j2-r-p4 v1 — probe: Approvals tab and the sign-in card's access route */
process.env.MSQ_RUN = process.env.MSQ_RUN || 'p4'
const H = await (await import('./msq-j2-r-h.mjs')).mk()
const { X, say, sleep } = H
say('msq-j2-r-p4 v1')
const w = await X.open({ user: 'ad9' })
const p = w.page
await X.L.go(p, 'leavewar'); await sleep(2500)
const el = p.locator('button:visible', { hasText: /Approvals/ })
say('approvals count', await el.count(), await el.first().evaluate(e => e.outerHTML.slice(0, 200)))
await el.first().click({ timeout: 5000 }).catch(e => say('click err', e.message.split('\n').slice(0, 4).join(' | ')))
await sleep(1500); await X.pic(w, 'p01-approvals')
say('words', (await H.U.bodyText(p)).slice(0, 600))
await X.signOut(w)
await p.fill('#luser', 'newperson'); await p.fill('#lpass', 'x'); await p.click('#loginForm button[type=submit]'); await sleep(1500)
await X.pic(w, 'p02-unknown')
say('card', await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 500)))
say('btns', await p.evaluate(() => [...document.querySelectorAll('button,a')].filter(b => b.getBoundingClientRect().width > 2).map(b => b.id + '[' + b.textContent.trim().slice(0, 30) + ']').join(' ')))
await X.fin(w)
