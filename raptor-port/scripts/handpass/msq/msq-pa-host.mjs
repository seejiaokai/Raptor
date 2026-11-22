/* msq-pa-host v1 (20 Nov 26, chat 126) — the Plan audit's host route ([MSQ-PLAN-AUDIT], D2242): Hunter (142's admin)
   given Plan of 149 by a stored row (no screen gives Plan yet), signed in, Admin → Users opened by its own tab, Osprey
   (149) and Kestrel (149) found by the search box and their rows opened; what each row offers is recorded. Proves the
   route the walker's scenarios start from. Settings: PA_PHONE=1 for the iPhone; PA_DIST the frozen build. */
process.env.MSQ_DIST = process.env.PA_DIST || 'C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/2edafb56-e544-4e90-a441-340014ce0ec8/scratchpad/dist-a5271a17c'
process.env.MSQ_BUNDLE = 'index-a7kr8dHR.js'
process.env.MSQ_IMGDIR = '2026-11-20-msq-plan-audit'
process.env.MSQ_WHO = 'host'
process.env.MSQ_RUN = process.env.PA_PHONE === '1' ? 'phone' : 'desktop'
const X = await import('./msq-lib.mjs')
const { say, sleep } = X
const phone = process.env.PA_PHONE === '1'
const tap = async loc => { if (phone) await loc.tap(); else await loc.click() }
say('msq-pa-host v2', phone ? 'iPhone' : 'desktop')

const w = await X.open({ phone, user: null })
/* Plan of 149 for Hunter's sign-in (acad2), from 1 Jan — setup only, written before anyone signs in, as the moves are
   written in the earlier walks; then the page reloads and Hunter signs in through the card */
await w.page.evaluate(() => {
  localStorage.setItem('raptor:settings/grant:gpa1', JSON.stringify({ id: 'gpa1', account: 'acad2', unit: 'u149', level: 'admin', from: '2026-01-01' }))
})
await w.page.reload(); await sleep(1500)
await X.login(w.page, 'ad2'); say('signed in as Hunter (ad2)')
say('his level in 149 (read only):', await w.page.evaluate(() => JSON.stringify(Object.keys(localStorage).filter(k => k.includes('grant:')))))
const p = w.page
/* Admin → Users through the app's own nav: the desktop's tab, or the phone's menu */
if (phone) {
  const menu = p.locator('button[aria-label*="enu" i]:visible, .hamb:visible, [data-drawer]:visible').first()
  if (await menu.count()) { await tap(menu); await sleep(600) }
}
const navAdmin = p.locator('button:visible, a:visible', { hasText: /^\s*Admin\s*$/ }).first()
say('Admin nav found', await navAdmin.count())
await tap(navAdmin); await sleep(1200)
const usersCat = p.locator('#page-admin button.adm-cat', { hasText: 'Users' }).first()
if (await usersCat.count() && !(await p.locator('#page-admin button.acc-main').first().isVisible().catch(() => false))) { await tap(usersCat); await sleep(800) }
await X.pic(w, 'h0-users')
const list = await p.evaluate(() => [...document.querySelectorAll('#page-admin button.acc-main')].map(b => b.innerText.replace(/\s+/g, ' ').trim()))
say('the list:', JSON.stringify(list))
for (const cs of ['Osprey', 'Kestrel', 'Saber']) {
  const find = p.locator('#page-admin input[type=search]:visible, #page-admin input[aria-label*="Find" i]:visible').first()
  if (await find.count()) { await find.fill(cs); await sleep(600) }
  const row = p.locator('#page-admin button.acc-main', { hasText: new RegExp('^' + cs) }).first()
  if (!(await row.count())) { say(cs, ': no row'); continue }
  await tap(row); await sleep(900)
  const offered = await p.evaluate(() => { const e = document.querySelector('#page-admin .acc-edit'); return e ? [...e.querySelectorAll('button, select, input')].filter(b => b.getBoundingClientRect().width > 2).map(b => (b.innerText || b.getAttribute('aria-label') || b.value || b.tagName).replace(/\s+/g, ' ').trim()).slice(0, 30) : null })
  const words = await p.evaluate(() => (document.querySelector('#page-admin .acc-edit')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 500))
  say(cs, 'row offers:', JSON.stringify(offered))
  say(cs, 'row reads:', words)
  await X.pic(w, 'h1-row-' + cs)
  await tap(row); await sleep(600)   // close it again by its own header
  if (await find.count()) { await find.fill(''); await sleep(400) }
}
say('errors', JSON.stringify(w.errors.slice(0, 8)))
await w.browser.close()
