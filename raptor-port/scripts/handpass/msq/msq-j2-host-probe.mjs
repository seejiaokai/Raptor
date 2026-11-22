/* msq-j2-host-probe v1 — job 2 of chat 109 (19 Nov 26): the host's own short run of the route the walkers start from,
   on the frozen build of 2b792ebc5: the master opens Admin → Users, finds Osprey (149) and opens his row; then the Leave
   War. Reads only. usage: MSQ_DIST=<frozen> MSQ_BUNDLE=<bundle> MSQ_IMGDIR=2026-11-19-multi-sqn-b1-job2
   node scripts/handpass/msq/msq-j2-host-probe.mjs [phone] */
const phone = process.argv.includes('phone')
process.env.MSQ_WHO = 'host'
process.env.MSQ_RUN = phone ? 'probe-p' : 'probe-d'
const X = await import('./msq-lib.mjs')
const U = await import('./msq-w1-util.mjs')
const { say, sleep } = X
say('msq-j2-host-probe v1', phone ? 'phone' : 'desktop')
const w = await X.open({ phone, user: 'ad' })
const { page } = w
const click = async loc => { if (phone) await loc.tap(); else await loc.click() }
await X.L.go(page, 'admin'); await sleep(900)
const f = page.locator('input[aria-label="Find a callsign or sign-in"]')
if (phone && !(await f.isVisible())) { const t = page.locator('button:visible', { hasText: /^Users/ }).first(); if (await t.count()) { await t.tap(); await sleep(800) } }
await X.pic(w, 'p01-users')
await f.fill('Osprey'); await sleep(600)
const pid = await U.pidOf(page, 'Osprey')
say('Osprey pid', pid)
const tap = page.locator(`.acc-row[data-person="${pid}"] .acc-tap`).first()
say('row found', await tap.count())
if (await tap.count()) { await click(tap); await sleep(800) }
await X.pic(w, 'p02-osprey-open')
const btns = await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 2 && r.height > 2 }).map(b => b.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 80).join(' | '))
say('buttons', btns)
await X.L.go(page, 'leavewar'); await sleep(1500)
await X.pic(w, 'p03-leavewar')
say('lw text', (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 400))
await X.fin(w)
