/* msq-w2-c v1 — W2: T5 (phone plain-user round as ad9, then us) in one phone world. usage: node scripts/handpass/msq/msq-w2-c.mjs */
process.env.MSQ_WHO = 'w2'
process.env.MSQ_RUN = 'c3-p'
const X = await import('./msq-lib.mjs')
const U = await import('./msq-w1-util.mjs')
const { say, sleep, row } = X
say('msq-w2-c v1 phone')
const w = await X.open({ phone: true, user: 'ad9' })
const { page } = w
const safe = async (label, fn) => { try { return await fn() } catch (e) { say('ERR', label, String(e.message).split('\n')[0]); return null } }
const tap2 = async name => { await sleep(100); await X.pic(w, name + '-tap'); await sleep(900); await X.pic(w, name) }
const N149 = ['Kestrel', 'Falcon', 'Osprey', 'Heron', 'Merlin', 'Raven', 'Harrier', 'Shrike', 'Gannet', 'Condor']
const N142 = ['Saber', 'Ranger', 'Echo', 'Static', 'Prowler']
const names = async () => { const t = await U.bodyText(page); const f = n => new RegExp('\\b' + n + '\\b').test(t); return { has142: N142.filter(f), has149: N149.filter(f) } }
const closeBy = async re => { const c = page.getByRole('button', { name: re }).locator('visible=true').first(); if (await c.count()) { await c.tap(); return true } return false }
const swap = async u => { const r = await X.signOut(w); await X.login(page, u); return r }

// prove sign-out on the phone
await X.pic(w, 't5-01-ad9-signed-in')
await safe('menu', async () => {
  const menu = page.locator('button[aria-label*="enu" i]:visible, .hamb:visible, [data-drawer]:visible').first()
  say('menu button count', await menu.count())
  if (await menu.count()) { await menu.tap(); await sleep(600); await X.pic(w, 't5-02-menu-open'); say('MENU TEXT', (await U.bodyText(page)).slice(0, 300)); await page.keyboard.press('Escape'); await sleep(300) }
})
let so = await safe('signout', () => X.signOut(w))
await X.pic(w, 't5-03-after-signout')
say('SIGNOUT', JSON.stringify(so))
row('T5', 'phone', 'ad9 presses Logout through the phone menu (X.signOut)', 'RECORD {reloaded}', JSON.stringify(so), so ? 'RECORD' : 'BLOCKED', 't5-02-menu-open.png, t5-03-after-signout.png')
if (!so) { await X.fin(w); process.exit(0) }
await X.login(page, 'ad9')
await X.L.go(page, 'editsched'); await sleep(1200)
await X.pic(w, 't5-04-week')
// Edit Schedule -> Wed 15 board -> Done
await safe('board', async () => {
  await X.W.board(w, 2); await tap2('t5-05-board')
  const n = await names()
  row('T5', 'phone', "ad9 opens Wed 15 Jul's board", 'opens over the page, 149 names only', JSON.stringify(n), n.has142.length === 0 ? 'PASS' : 'FAIL', 't5-05-board.png')
  await X.W.closeBoard(w); await sleep(700); await X.pic(w, 't5-06-after-done')
  const days = await page.locator('#vWeek .day').count()
  const board = await page.locator('#schedBoard:visible').count()
  row('T5', 'phone', 'closes the board by its own Done', 'board gone, week as it was', `week days: ${days}; board still visible: ${board}`, days > 0 && board === 0 ? 'PASS' : 'FAIL', 't5-06-after-done.png')
})
// Leave War -> MY LEAVE
await X.L.go(page, 'leavewar'); await sleep(2500)
await X.pic(w, 't5-07-leavewar')
const lw0 = await names()
row('T5', 'phone', 'ad9 opens the Leave War', '149 names only', JSON.stringify(lw0), lw0.has142.length === 0 ? 'PASS' : 'FAIL', 't5-07-leavewar.png')
await safe('myleave', async () => {
  await page.locator('.myleave:visible, [class*=myleave]:visible').first().tap(); await tap2('t5-08-myleave')
  const n = await names()
  row('T5', 'phone', 'ad9 taps MY LEAVE', 'opens over the page, 149 names only', JSON.stringify(n), n.has142.length === 0 ? 'PASS' : 'FAIL', 't5-08-myleave.png')
  say('MYLEAVE TEXT', (await U.bodyText(page)).slice(0, 300))
  const ok = await closeBy(/^\W*(close|done|back)\W*$|✕|×/i)
  await sleep(800); await X.pic(w, 't5-09-after-myleave-close')
  row('T5', 'phone', 'closes MY LEAVE by its own close', 'back on the grid', `pressed a close: ${ok}; grid names: ${JSON.stringify(await names())}`, ok ? 'RECORD' : 'BLOCKED', 't5-09-after-myleave-close.png')
})
await safe('person', async () => {
  const pt = await page.evaluate(() => { const e = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && e.textContent.trim() === 'Kestrel' && e.offsetWidth > 1 && e.getBoundingClientRect().top > 100 && e.getBoundingClientRect().left >= 0 && e.getBoundingClientRect().left < 380 && (() => { const q = e.getBoundingClientRect(); const t = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); return t && (t === e || e.contains(t) || t.contains(e)) && !!e.closest('[class*=lw], #page-leavewar') })()); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2] })
  say('Kestrel point', JSON.stringify(pt))
  if (pt) await page.touchscreen.tap(pt[0], pt[1])
  await tap2('t5-10-person')
  const n = await names()
  row('T5', 'phone', 'ad9 taps a name on the war grid (Kestrel)', 'person window opens, 149 names only', JSON.stringify(n), n.has142.length === 0 && pt ? 'PASS' : pt ? 'FAIL' : 'BLOCKED', 't5-10-person.png')
  const ok = await closeBy(/^\W*(close|done|back)\W*$|✕|×/i)
  await sleep(800); await X.pic(w, 't5-11-after-person-close')
  row('T5', 'phone', 'closes the person window by its own close', 'back on the grid', `pressed a close: ${ok}`, ok ? 'RECORD' : 'BLOCKED', 't5-11-after-person-close.png')
})
// bell
await X.L.go(page, 'editsched'); await sleep(900)
await safe('bell', async () => {
  await page.locator('#notifyBell:visible').first().tap(); await tap2('t5-12-bell')
  say('BELL', (await U.bodyText(page)).slice(0, 200))
  await page.locator('#notifyBell:visible').first().tap(); await sleep(700); await X.pic(w, 't5-13-after-bell-close')
  row('T5', 'phone', 'bell open then close', 'opens and closes', 'see pictures', 'RECORD', 't5-12-bell.png, t5-13-after-bell-close.png')
})
// Tracker
await safe('tracker', async () => { await X.L.go(page, 'tracker'); await sleep(2500); await X.pic(w, 't5-14-tracker'); const n = await page.evaluate(() => document.querySelector('#page-tracker').innerText.replace(/\s+/g, ' ').slice(0, 200)); row('T5', 'phone', 'ad9 opens the Tracker', 'opens', n, 'RECORD', 't5-14-tracker.png') })
// Inputs -> calendar
await safe('inputs', async () => {
  await X.L.go(page, 'inputs'); await sleep(1500); await X.pic(w, 't5-15-inputs')
  const b = page.getByRole('button', { name: /^\W*Calendar/i }).locator('visible=true').first()
  say('calendar button count', await b.count())
  if (await b.count()) { await b.tap(); await tap2('t5-16-inputs-calendar') }
  const n = await names()
  row('T5', 'phone', 'ad9 opens Inputs and its calendar', '149 names only', JSON.stringify(n), n.has142.length === 0 ? 'PASS' : 'FAIL', 't5-16-inputs-calendar.png')
})
// us (Ranger)
const so2 = await swap('us')
say('us signed in; reloaded', JSON.stringify(so2))
await X.L.go(page, 'leavewar'); await sleep(2500)
await X.pic(w, 't5-17-us-leavewar')
await safe('myleave-us', async () => {
  await page.locator('.myleave:visible, [class*=myleave]:visible').first().tap(); await tap2('t5-18-us-myleave')
  const n = await names()
  row('T5', 'phone', 'us (Ranger) opens Leave War -> MY LEAVE', '142 names only', JSON.stringify(n), n.has149.length === 0 ? 'PASS' : 'FAIL', 't5-18-us-myleave.png')
  await closeBy(/^\W*(close|done|back)\W*$|✕|×/i); await sleep(700)
})
const nlw = await names()
row('T5', 'phone', 'us (Ranger) Leave War grid', '142 names only', JSON.stringify(nlw), nlw.has149.length === 0 ? 'PASS' : 'FAIL', 't5-17-us-leavewar.png')
await safe('inputs-us', async () => {
  await X.L.go(page, 'inputs'); await sleep(1500)
  const b = page.getByRole('button', { name: /^\W*Calendar/i }).locator('visible=true').first()
  if (await b.count()) { await b.tap(); await tap2('t5-19-us-inputs-calendar') } else await X.pic(w, 't5-19-us-inputs-calendar')
  const n = await names()
  row('T5', 'phone', 'us (Ranger) Inputs calendar', '142 names only', JSON.stringify(n), n.has149.length === 0 ? 'PASS' : 'FAIL', 't5-19-us-inputs-calendar.png')
})
await X.fin(w)
