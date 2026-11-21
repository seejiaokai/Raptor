/* msq-j2-w1-x7 v1 — explore: where a rename shows in the change history */
process.env.MSQ_WHO = 'w1'
process.env.MSQ_RUN = process.env.MSQ_RUN || 'x7'
const H = await (await import('./msq-j2-w1-h.mjs')).mk()
const { X, U, say, sleep } = H
say('msq-j2-w1-x7 v1')
const w = await X.open({ user: 'ad9' })
const p = w.page
const fal = await U.pidOf(p, 'Falcon')
await H.openRow(w, 'Falcon')
await p.locator('#accEdArchive').click(); await sleep(900)
await H.usersPage(w); await p.locator(H.FIND).fill('Falcon'); await sleep(600)
const tp = p.locator(`.acc-row[data-person="${fal}"] .acc-tap`).first()
if (!(await tp.isVisible().catch(() => false))) { await p.getByRole('button', { name: /Archived/ }).first().click(); await sleep(600) }
await tp.click(); await sleep(700)
await p.locator('#accArCs').fill('FalconQ'); await sleep(300)
await p.getByRole('button', { name: 'Save name' }).first().click(); await sleep(1200)
say('undo', await p.evaluate(() => document.querySelector('#undoBtn')?.title))
await X.L.go(p, 'editsched'); await sleep(2000)
await p.locator('#histBtn').click(); await sleep(900)
say('histBtn', await p.evaluate(() => { const b = document.querySelector('#histBtn'); return b.getAttribute('aria-label') + ' | ' + b.textContent.replace(/\s+/g, ' ') }))
const allBtns = await p.evaluate(() => [...document.querySelectorAll('.chgwin *')].filter(e => /All changes/.test(e.textContent) && e.children.length === 0 || /All changes/.test(e.textContent) && e.tagName === 'BUTTON').map(e => e.tagName + '.' + e.className + '#' + e.id + ' role=' + e.getAttribute('role') + ' :' + e.textContent.slice(0, 40)).join(' || '))
say('allBtns', allBtns)
await p.locator('.chgwin').getByText('All changes').first().click(); await sleep(900)
await X.pic(w, 'x7-01-allchanges')
say('win', await p.evaluate(() => document.querySelector('.chgwin')?.textContent.replace(/\s+/g, ' ')))
// try week jumps
const chips = await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 2 && r.top < 100 }).map(b => b.textContent.trim() + '/' + (b.getAttribute('aria-label') || '')).join(' | '))
say('top buttons', chips)
await p.keyboard.press('Escape'); await sleep(300)
await p.getByRole('button', { name: 'Jump to a date' }).click(); await sleep(800)
await X.pic(w, 'x7-02-jump')
say('jump buttons', await p.evaluate(() => [...document.querySelectorAll('[data-testid^="dcal-day"], .dcal-d')].slice(0, 5).map(e => e.getAttribute('data-testid')).join(',')))
say('popup buttons', await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 2 && r.height > 2 && !/^\d+$/.test(b.textContent.trim()) && r.top > 80 && r.top < 500 && r.left < 400 }).map(b => (b.getAttribute('aria-label') || b.textContent).trim().slice(0, 25)).join(' | ')))
for (let i = 0; i < 6; i++) { const nx = p.locator('button[aria-label*="ext month" i], button[aria-label="Next"], button:has-text("›")').first(); if (await nx.count()) { await nx.click().catch(() => {}); await sleep(300) } }
await X.pic(w, 'x7-02b-jump-after-next')
const nov = p.locator('[data-testid="wcal-day-2026-11-19"]')
say('nov cell', await nov.count())
if (await nov.count()) { await nov.click(); await sleep(1500) }
await X.pic(w, 'x7-03-nov-week')
await p.locator('#histBtn').click(); await sleep(900)
await p.locator('.chgwin').getByText('All changes').first().click(); await sleep(900)
await X.pic(w, 'x7-04-nov-hist')
say('win nov', await p.evaluate(() => document.querySelector('.chgwin')?.textContent.replace(/\s+/g, ' ')))
await X.fin(w)
