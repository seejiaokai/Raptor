/* msq-j2-w3-probe7 v1 — W3 probe: Admin -> Users page and Add a person, as ad9 (phone) */
process.env.MSQ_WHO = 'w3'
process.env.MSQ_RUN = process.env.MSQ_RUN || 'probe7'
const H = await (await import('./msq-j2-w3-h.mjs')).mk()
const { X, say, sleep } = H
say('msq-j2-w3-probe7 v1')
const w = await X.open({ phone: true, user: 'ad9' })
const { page } = w
await X.L.go(page, 'admin'); await sleep(1000)
await page.locator('.adm-cat', { hasText: /^Users/ }).first().tap(); await sleep(1200)
await X.pic(w, 'p7-01-users')
say('USERS:\n' + await H.vis(page, '#page-admin button, #page-admin input, #page-admin select, #page-admin summary, #page-admin [role=button]'))
const add = page.locator('button:visible, summary:visible', { hasText: /Add a person/ }).first()
say('add count', await add.count())
if (await add.count()) { await add.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(400); await add.tap(); await sleep(1000); await X.pic(w, 'p7-02-add'); say('ADD:\n' + await H.vis(page, '#page-admin button, #page-admin input, #page-admin select')) }
await X.fin(w)
