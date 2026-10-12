// E3 (who must NOT be told) + E5 (a member cannot open the list) + E4 (a NEW input on the holiday) + E8 (admin's member view)
// One world. Saber = stiff (admin), Ranger = bane (member), Hex = rocky, Tally = nick, Warden = nact.
import { launch, session, lw, FRI, addRow } from './on-E-lib.mjs'
const stage = process.argv[2] || 'all'
const browser = await launch()
await session(browser, 'E3', async s => {
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
  /* ---- E3: Ranger ---- */
  await as('bane', 'member')
  await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(500)
  say('Ranger: bell before tap', await bell())
  const t1 = await tap(); say('Ranger: tap on the bell ->', t1)
  await shot('1-ranger-bell-tap')
  say('Ranger: oilday list', await tid('win-oilday').count())
  await away()
  say('Ranger: notices addressed to him', await page.evaluate(() => (window.NOTICES || []).filter(n => n.to === 'bane').map(n => [n.by, (n.what || []).map(p => p.k).join('+')])))
  /* ---- Hex ---- */
  await as('rocky', 'member'); await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(500)
  const t2 = await tap(); say('Hex: tap on the bell ->', t2); await shot('2-hex-bell'); await away()
  /* ---- Tally ---- */
  await as('nick', 'member'); await page.waitForTimeout(300)
  const t3 = await tap(); say('Tally: tap on the bell ->', t3); await away()
  /* ---- Warden (admin control) ---- */
  await as('nact', 'admin'); await page.waitForTimeout(300)
  const t4 = await tap(); say('Warden control: tap on the bell ->', t4); await away()
  say('browser errors so far', s.errors)
  addRow({ id: 'E3-data', tallyDuty, rh })

  /* ---- E5: Ranger — the Inputs calendar and his own input's card ---- */
  await as('bane', 'member')
  await s.toMonth(); await s.openDay(FRI)
  say('E5 Ranger: day window cards', await page.locator('[data-testid="win-inputsday"] .icard').count())
  say('E5 Ranger: any list controls in the day window', await page.locator('[data-testid="win-inputsday"] [data-testid^="odl-"], [data-testid="win-inputsday"] [data-testid="oil-day-list"]').count())
  await shot('4-ranger-day')
  const card = page.locator(`[data-testid="win-inputsday"] .icard[data-popiid="${rh}"]`).first()
  if (await card.count()) { await press(card); await page.waitForTimeout(600) }
  say('E5 Ranger: opened his own input: window', { inputEdit: await page.locator('#inpEditPop:visible').count(), oilconf: await tid('oilconf').count(), oilday: await tid('win-oilday').count(), oilQuestionInWindow: await page.locator('#inpEditPop [data-testid="oil-yes"], #inpEditPop [data-testid^="oilq"]').count() })
  await shot('5-ranger-own-input')
  say('E5 Ranger: window.oilday total', await tid('win-oilday').count())
  const x = page.locator('#inpEditClose:visible, #inpEditCancel:visible').first(); if (await x.count()) await press(x)
  await s.closeDay()
  say('browser errors', s.errors)
})
await browser.close()
