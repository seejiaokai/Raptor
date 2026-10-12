// E3 (who must NOT be told) + E5 (a member cannot open the list) + E4 (a NEW input on the holiday) + E8 (admin's member view)
// One world. Saber = stiff (admin), Ranger = bane (member), Hex = rocky, Tally = nick, Warden = nact.
import { launch, session, lw, FRI, addRow } from './on-E-lib.mjs'
const stage = process.argv[2] || 'all'
const browser = await launch()
await session(browser, 'E8c', async s => {
  const { page, press, say, shot, tid, measure, bell, openBell, closeBell, inputsOf } = s
  const as = async (pid, role) => { await page.evaluate(([p, r]) => { window.raptorRole(r); window.raptorMe(p) }, [pid, role]); await page.waitForTimeout(500) }
  say('Warden admin', await s.giveWarden())
  const tallyDuty = await s.fileIt(FRI, { type: 'Duty', people: ['nick'], title: 'Tally duty' })
  say('Saber filed (Tally)', tallyDuty)
  await as('bane', 'member')
  const rh = await s.fileIt(FRI, { type: 'Training', people: ['bane', 'rocky'], from: '09:00', to: '11:00', title: 'Ranger-Hex brief' })
  say('Ranger filed Training for himself and Hex', rh)
  say('inputs', await page.evaluate(() => window.INPUTS.filter(r => (r.title || '').match(/Tally duty|Ranger-Hex/)).map(r => ({ iid: r.iid, title: r.title, by: r.by, who: (r.who || []).map(w => w.p + '/' + w.by) }))))
  await as('stiff', 'admin')
  // Saber makes Fri 17 a public holiday on the Leave War's Event row, presses Later
  const war = lw(page); await war.go('JUL')
  await war.openEventSheet(0, FRI)
  await press(tid('event-quick-0')); await press(tid('event-scope-day')); await press(tid('event-apply')); await page.waitForTimeout(900)
  const lc = await tid('win-oilday').count()
  say('list up for Saber', lc)
  if (lc) { say('list', { title: (await tid('win-oilday').locator('.win-ttl').innerText()).replace(/\s+/g, ' '), count: await tid('odl-count').innerText() }); await press(tid('odl-later')); await page.waitForTimeout(300) }
  say('oil after Later', await inputsOf([tallyDuty, rh]))
  say('Saber bell', await bell()); await openBell(); say('Saber bell list', await bell()); await closeBell()

  const tap = async () => {
    await press(page.locator('.bellbtn:visible').first()); await page.waitForTimeout(500)
    if (await tid('oilconf').count()) return { kind: 'question', text: (await tid('oilconf').innerText()).replace(/\s+/g, ' ').slice(0, 220) }
    if (await tid('bell-list').count()) return { kind: 'list', ...(await bell()) }
    return { kind: 'nothing', ...(await bell()) }
  }
  const away = async () => {
    for (let i = 0; i < 3; i++) {
      if (await tid('oilconf').count()) { const c = tid('oilconf-cancel'); if (await c.count()) await press(c); else await page.keyboard.press('Escape'); await page.waitForTimeout(300) }
      else if (await tid('bell-list').count()) await closeBell()
      else break
    }
  }
  /* member view: tap on the line */
  await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(400)
  await press(page.locator('#roleBadge')); await page.waitForTimeout(600)
  say('E8 badge', await page.locator('#roleBadge').innerText())
  await press(page.locator('.bellbtn:visible').first()); await page.waitForTimeout(500)
  const ln = page.locator('[data-testid="bell-list"] .bl-line')
  say('E8 member view lines', await ln.count())
  if (await ln.count()) { await press(ln.first()); await page.waitForTimeout(600) }
  say('E8 after tapping the holiday line in member view', { oilday: await tid('win-oilday').count(), bellList: await tid('bell-list').count(), oilconf: await tid('oilconf').count() })
  await shot('1-line-tapped-in-member-view')
  if (await tid('win-oilday').count()) await press(tid('odl-later'))
  await press(page.locator('#roleBadge')); await page.waitForTimeout(600)
  /* ---- guest ---- */
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  const g = page.locator('#admGuestView'); say('guest switch present', await g.count())
  if (await g.count()) { await g.evaluate(e => { e.scrollIntoView({ block: 'center' }); e.click() }); await page.waitForTimeout(400) }
  say('guest switch on', await g.isChecked().catch(() => null))
  await page.locator('#roleBadge').count()
  await press(page.getByRole('button', { name: 'Logout' })); await page.waitForTimeout(800)
  await page.fill('#luser', 'visitor'); await page.fill('#lpass', 'v')
  await page.click('#loginForm button[type=submit]'); await page.waitForTimeout(800)
  say('after signing in as a stranger: screen', await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 200)))
  if (await page.locator('#accCs').count()) {
    await page.fill('#accCs', 'Visitor'); await page.fill('#accIni', 'VI')
    const opts = async sel => page.evaluate(q => [...document.querySelectorAll(q + ' option')].map(o => o.value).filter(v => v), sel)
    say('seat options', await opts('#accSeat'))
    await page.selectOption('#accSeat', (await opts('#accSeat'))[0]); await page.waitForTimeout(300)
    if (await page.locator('#accCat').count()) { say('cat options', await opts('#accCat')); await page.selectOption('#accCat', (await opts('#accCat'))[0]) }
    await press(page.locator('#accSend')); await page.waitForTimeout(800)
  }
  say('waiting screen', await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 200)))
  if (await page.locator('#accGuest').count()) { await press(page.locator('#accGuest')); await page.waitForTimeout(1000) }
  say('guest: page', await page.evaluate(() => ({ page: window.CURPAGE, role: document.getElementById('roleBadge') && document.getElementById('roleBadge').innerText, bell: document.querySelectorAll('.bellbtn').length, tabs: [...document.querySelectorAll('nav a, .tabs a, .tab')].map(e => e.textContent.trim()).slice(0, 12) })))
  say('guest: bell buttons visible', await page.locator('.bellbtn:visible').count())
  say('guest: oilday list', await tid('win-oilday').count())
  await shot('2-guest')
  say('browser errors', s.errors)
})
await browser.close()
