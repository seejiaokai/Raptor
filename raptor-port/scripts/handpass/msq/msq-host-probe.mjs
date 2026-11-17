/* msq host probe v1 (18 Nov 26) — the host proves the route before the walkers: each seeded sign-in's week; the
   Leave War and the Tracker opened; Sign out through the app, then the other squadron signing in on the same tab —
   did the page reload, whose Tracker and Leave War does the second person see.
   usage (from raptor-port/): [PHONE=1] node scripts/handpass/msq/msq-host-probe.mjs */
const PHONE = process.env.PHONE === '1'
process.env.MSQ_WHO = 'host'
process.env.MSQ_RUN ||= 'probe-' + (PHONE ? 'p' : 'd')
const X = await import('./msq-lib.mjs')
const { say, sleep } = X
say('msq-host-probe v1', PHONE ? 'phone' : 'desktop')
const w = await X.open({ phone: PHONE, user: 'ad' })
const { page } = w
const txt = async sel => X.nrm(await page.locator(sel).first().innerText().catch(() => ''))
say('ad week', JSON.stringify(await X.who(w)))
await X.pic(w, 'p01-ad-week')
await X.L.go(page, 'tracker'); await sleep(2500)
say('ad tracker', (await txt('body')).slice(0, 300))
await X.pic(w, 'p02-ad-tracker')
await X.L.go(page, 'leavewar'); await sleep(2500)
say('ad leavewar', (await txt('body')).slice(0, 300))
await X.pic(w, 'p03-ad-leavewar')
const so = await X.signOut(w)
say('signout 1', JSON.stringify(so))
await X.login(page, 'ad9')
say('ad9 week', JSON.stringify(await X.who(w)))
await X.pic(w, 'p04-ad9-week')
await X.L.go(page, 'tracker'); await sleep(2500)
say('ad9 tracker', (await txt('body')).slice(0, 300))
await X.pic(w, 'p05-ad9-tracker')
await X.L.go(page, 'leavewar'); await sleep(2500)
say('ad9 leavewar', (await txt('body')).slice(0, 300))
await X.pic(w, 'p06-ad9-leavewar')
await X.L.go(page, 'inputs'); await sleep(1500)
say('ad9 inputs', (await txt('body')).slice(0, 400))
await X.pic(w, 'p07-ad9-inputs')
const so2 = await X.signOut(w)
say('signout 2', JSON.stringify(so2))
await X.login(page, 'us')
say('us week', JSON.stringify(await X.who(w)))
await X.L.go(page, 'tracker'); await sleep(2500)
say('us tracker', (await txt('body')).slice(0, 300))
await X.pic(w, 'p08-us-tracker')
await X.fin(w)
