// E3 (who must NOT be told) + E5 (a member cannot open the list) + E4 (a NEW input on the holiday) + E8 (admin's member view)
// One world. Saber = stiff (admin), Ranger = bane (member), Hex = rocky, Tally = nick, Warden = nact.
import { launch, session, lw, FRI, addRow } from './on-E-lib.mjs'
const stage = process.argv[2] || 'all'
const browser = await launch()
await session(browser, 'E4', async s => {
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
  /* ---- E4 as Ranger: a NEW meeting on Fri 17 ---- */
  await as('bane', 'member'); await page.waitForTimeout(300)
  const nm = await s.fileIt(FRI, { type: 'Meeting', people: ['bane'], from: '15:00', to: '16:00', title: 'Late meeting', shotAsk: '1-ranger-new-meeting-question' })
  say('E4 Ranger filed a new Meeting on Fri 17: question asked at the save?', s.asked())
  say('E4 oil of it', await inputsOf([nm]))
  /* ---- E4 as Saber: "+ Inputs" on the Scheduler Board for Fri 17 ---- */
  await as('stiff', 'admin')
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(500)
  await page.locator('#eWeek [data-sbday="4"]').first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
  await page.waitForSelector('#sbBoard .sb-sec', { state: 'attached' }); await page.waitForTimeout(500)
  const ia = page.locator('#sbBoard [data-inpadd="4.g"]').first()
  say('E4 board "+ Inputs" present', await ia.count())
  await ia.evaluate(e => { e.scrollIntoView({ block: 'center' }); e.click() }); await page.waitForTimeout(600)
  await page.waitForSelector('#inpEditPop #inpEditType')
  await page.selectOption('#inpEditPop #inpEditType', 'Meeting')
  await page.selectOption('#inpEditPop #inpEditPerson', 'rocky').catch(() => {})
  const ad = page.locator('#inpEditPop #inpEditAllday'); if (await ad.count() && await ad.isChecked()) await ad.click()
  await page.locator('#inpEditPop #inpEditStart').fill('10:00'); await page.locator('#inpEditPop #inpEditEnd').fill('11:00')
  const ot = page.locator('#inpEditPop #inpEditOwnTitle'); if (await ot.count()) await ot.fill('Board meeting')
  await press(page.locator('#inpEditSave')); await page.waitForTimeout(600)
  const asked = await tid('oilconf').count() ? (await tid('oilconf').innerText()).replace(/\s+/g, ' ').slice(0, 200) : null
  say('E4 Saber (board + Inputs): question at the save?', asked)
  await shot('5-board-input-question')
  if (asked) { await press(tid('oil-yes')); await press(tid('oilconf-save')); await page.waitForTimeout(600) }
  say('E4 Saber: input made', await page.evaluate(() => window.INPUTS.filter(r => r.title === 'Board meeting').map(r => ({ oil: r.oil }))))
  say('browser errors', s.errors)
})
await browser.close()
