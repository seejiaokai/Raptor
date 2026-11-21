/* msq host S4/S6/S8 v1 (18 Nov 26) — the host re-runs the three scenarios walker W1 left unproven because its date
   picking went the wrong way (it stepped back from today, never forward to December): an input filed by a 149 member
   seen only in 149; a public holiday saved by a 149 admin at Home base seen in both squadrons' Leave War (D2160 F1);
   an Off day saved by a 142 admin seen in 142 only; both still there after a reload.
   usage (from raptor-port/): node scripts/handpass/msq/msq-host-s46.mjs */
process.env.MSQ_WHO = 'host'
process.env.MSQ_RUN ||= 's46-d'
const X = await import('./msq-lib.mjs')
const U = await import('./msq-w1-util.mjs')
const { say, sleep, row } = X
say('msq-host-s46 v1 desktop')
const w = await X.open({ phone: false, user: 'us9' })
const { page } = w
const swap = async user => { const r = await X.signOut(w); await X.login(page, user); return r }
const safe = async (label, fn) => { try { return await fn() } catch (e) { say('ERR', label, String(e.message).split('\n')[0]); return null } }

/** pick a date on the app's one calendar (the last one on screen), stepping the month the right way */
async function calPick(iso) {
  const cal = page.locator('.dcal:visible').last()
  for (let i = 0; i < 30; i++) {
    if (await cal.locator(`[data-iso="${iso}"]`).count()) break
    const m = await cal.getAttribute('data-month')
    await cal.locator(m < iso.slice(0, 7) ? '[data-testid$="-next"]' : '[data-testid$="-prev"]').first().click()
    await sleep(220)
  }
  await cal.locator(`[data-iso="${iso}"]`).first().click()
  await sleep(400)
}

// ---- S4: Osprey (149 member) files an Other on Thu 10 Dec 2026
await X.L.go(page, 'inputs'); await sleep(1200)
await safe('list', async () => { await page.getByRole('button', { name: /^\s*List/ }).first().click(); await sleep(700) })
await page.getByRole('button', { name: /\+ Input/ }).first().click(); await sleep(900)
await safe('type', async () => { await page.locator('#inpEditType').selectOption({ label: 'Other' }) })
await sleep(400)
await calPick('2026-12-10')
await X.pic(w, 's4-01-us9-filled')
await page.getByRole('button', { name: /^\s*Add\s*$/ }).first().click(); await sleep(1200)
await safe('alldates', async () => { await page.getByRole('button', { name: /→/ }).first().click(); await sleep(500); await page.getByRole('button', { name: /All dates/ }).first().click(); await sleep(700) })
await X.pic(w, 's4-02-us9-list')
const filed = (await U.bodyText(page))
const ok9 = /Osprey/.test(filed) && /10 Dec/.test(filed)
row('S4', 'desktop', 'us9 files Other on Thu 10 Dec 2026, list on All dates', 'his list shows it', `shown: ${ok9}`, ok9 ? 'PASS' : 'FAIL', 's4-02-us9-list.png')
for (const u of ['us', 'ad', 'ad9']) {
  const so = await swap(u)
  await X.L.go(page, 'inputs'); await sleep(1100)
  await safe('list' + u, async () => { await page.getByRole('button', { name: /^\s*List/ }).first().click(); await sleep(600) })
  await safe('all' + u, async () => { await page.getByRole('button', { name: /→/ }).first().click(); await sleep(500); await page.getByRole('button', { name: /All dates/ }).first().click(); await sleep(700) })
  await safe('every' + u, async () => { const s = page.locator('select:visible').first(); const opts = await s.locator('option').allTextContents(); const e = opts.find(o => /Everyone|All people/i.test(o)); if (e) { await s.selectOption({ label: e }); await sleep(600) } })
  await X.pic(w, `s4-03-${u}-list`)
  const t = await U.bodyText(page)
  const sees = /Osprey/.test(t) && /10 Dec/.test(t)
  row('S4', 'desktop', `${u} opens Inputs list, All dates`, u === 'ad9' ? 'sees Osprey 10 Dec' : 'does not see it', `sees: ${sees}; logout reloaded: ${so.reloaded}`, (u === 'ad9') === sees ? 'PASS' : 'FAIL', `s4-03-${u}-list.png`)
}

// ---- S6: ad9 (signed in) saves a public holiday at Home base on Wed 9 Dec 2026
async function openHolForm() {
  await X.L.go(page, 'leavewar'); await sleep(2200)
  await page.locator('[data-testid="settings-open"]').click(); await sleep(600)
  await page.locator('[data-testid="settings-days"]').click(); await sleep(900)
  await page.locator('[data-testid="hol-add"]').click(); await sleep(700)
}
async function holidayList() {
  await X.L.go(page, 'leavewar'); await sleep(2000)
  await page.locator('[data-testid="settings-open"]').click(); await sleep(600)
  await page.locator('[data-testid="settings-days"]').click(); await sleep(900)
}
await openHolForm()
await page.locator('[data-testid="hol-kind-ph"]').click()
await page.locator('[data-testid="hol-name"]').fill('W149 PH'); await page.locator('[data-testid="hol-short"]').fill('WPH')
await calPick('2026-12-09')
await X.pic(w, 's6-01-ad9-form')
await page.locator('[data-testid="hol-save"]').click(); await sleep(1500)
await X.pic(w, 's6-02-ad9-after-save')
row('S6', 'desktop', 'ad9 saves PH W149 PH on Wed 9 Dec 2026', 'RECORD what the app says', (await U.bodyText(page)).slice(0, 400), 'RECORD', 's6-02-ad9-after-save.png')
await page.keyboard.press('Escape'); await sleep(300)
await holidayList()
await X.pic(w, 's6-03-ad9-list')
const l9 = await U.bodyText(page)
row('S6', 'desktop', "ad9's holiday list for 2026", 'lists Wed 9 Dec W149 PH', `W149 PH: ${l9.includes('W149 PH')}`, l9.includes('W149 PH') ? 'PASS' : 'FAIL', 's6-03-ad9-list.png')
await swap('ad')
await holidayList()
await X.pic(w, 's6-04-ad-list')
const l2 = await U.bodyText(page)
row('S6', 'desktop', "ad's holiday list for 2026 (142, Home base)", 'lists W149 PH too (one place, D2160 F1)', `W149 PH: ${l2.includes('W149 PH')}`, l2.includes('W149 PH') ? 'PASS' : 'FAIL', 's6-04-ad-list.png')
// ad adds an Off day on Fri 11 Dec
await page.locator('[data-testid="hol-add"]').click(); await sleep(700)
await page.locator('[data-testid="hol-kind-off"]').click()
await page.locator('[data-testid="hol-name"]').fill('W142 OFF'); await page.locator('[data-testid="hol-short"]').fill('WOF')
await calPick('2026-12-11')
await X.pic(w, 's6-05-ad-off-form')
await page.locator('[data-testid="hol-save"]').click(); await sleep(1500)
await X.pic(w, 's6-06-ad-after-off')
await swap('ad9')
await holidayList()
await X.pic(w, 's6-07-ad9-list-after-off')
const l9b = await U.bodyText(page)
row('S6', 'desktop', "ad9's list after ad's Off day", 'no W142 OFF; W149 PH still there', `W142 OFF: ${l9b.includes('W142 OFF')}; W149 PH: ${l9b.includes('W149 PH')}`, !l9b.includes('W142 OFF') && l9b.includes('W149 PH') ? 'PASS' : 'FAIL', 's6-07-ad9-list-after-off.png')

// ---- S8: reload, then a second tab as ad
await page.reload(); await sleep(2500)
if (await page.locator('#luser').count()) await X.login(page, 'ad9')
await holidayList()
await X.pic(w, 's8-01-ad9-list-after-reload')
const l9c = await U.bodyText(page)
row('S8', 'desktop', 'ad9 reloads; holiday list', 'W149 PH still there, no W142 OFF', `W149 PH: ${l9c.includes('W149 PH')}; W142 OFF: ${l9c.includes('W142 OFF')}`, l9c.includes('W149 PH') && !l9c.includes('W142 OFF') ? 'PASS' : 'FAIL', 's8-01-ad9-list-after-reload.png')
const p2 = await w.ctx.newPage()
await p2.goto(X.BASE + '/'); await sleep(2000)
await X.login(p2, 'ad'); await X.L.go(p2, 'leavewar'); await sleep(2200)
await p2.locator('[data-testid="settings-open"]').click(); await sleep(600)
await p2.locator('[data-testid="settings-days"]').click(); await sleep(900)
const t2 = await U.bodyText(p2)
await p2.screenshot({ path: X.SHOTS + '/s8-02-tab2-ad-list.png' })
row('S8', 'desktop', 'second tab, same storage: ad, holiday list', 'W149 PH and W142 OFF both listed', `W149 PH: ${t2.includes('W149 PH')}; W142 OFF: ${t2.includes('W142 OFF')}`, t2.includes('W149 PH') && t2.includes('W142 OFF') ? 'PASS' : 'FAIL', 's8-02-tab2-ad-list.png')
await p2.close()
await X.fin(w)
