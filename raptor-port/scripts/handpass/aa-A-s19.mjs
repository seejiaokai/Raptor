// S19 — the filer leaves, but the placeholder input survives (disposable member accounts made on Admin -> Users; desktop).
// Archive and Delete are walked; the third route (a posting out that has run) is not walked here.
import { closeWins, world, closeAll, toInputs, fileInput, pic, T, oilAnswer, sleep, readInputs, observe, switchUser, setPerson, listAll, listSearch, listRow, issue, lwMap, crowdCount, declareHoliday, signIn } from './aa-A-lib.mjs'
import * as L from './lib.mjs'
async function loginAs(page, name) {
  if (await page.locator('#logout').isVisible().catch(() => false)) { await page.locator('#logout').click(); await sleep(600) }
  await page.waitForSelector('#luser'); await page.fill('#luser', name); await page.fill('#lpass', name === 'ad' ? 'a' : 'x'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(600)
}
for (const [route, ph] of [['archive', 'allavail'], ['delete', 'allavail'], ['archive', 'all']]) {
  const cs = 'Wlk' + route.slice(0, 3) + (ph === 'all' ? 'B' : 'A')
  const login = cs.toLowerCase()
  const rm = `walkS19 ${route} ${ph}`
  const w = await world({ who: 'ad', size: 'd' })
  const page = w.page
  // 1. the disposable member
  await L.go(page, 'admin'); await sleep(700)
  await page.fill('#accAddCs', cs); await page.fill('#accAddIni', 'WK'); await page.selectOption('#accAddSeat', 'FCP').catch(() => {})
  const cats = await page.evaluate(() => [...document.querySelectorAll('#accAddCat option')].map(o => o.value)); if (cats.length > 1) await page.selectOption('#accAddCat', cats[1]).catch(() => {})
  await page.fill('#accAddName', login); await page.fill('#accAddPostIn', '2026-07-01')
  await page.locator('#accAdd').click(); await sleep(900)
  console.log(route, ph, 'added', cs, '| roster has him:', await page.evaluate(c => Object.values(window.PEOPLE).some(p => p.cs === c), cs), '| messages', JSON.stringify((await observe(page)).msgs.slice(0, 2)))
  // 2. he signs in and files a placeholder Duty on a weekday
  await loginAs(page, login)
  console.log(route, ph, 'signed in as:', await page.evaluate(() => document.querySelector('#roleBadge')?.innerText))
  await toInputs(page)
  await fileInput(page, { iso: '2026-07-15', type: 'Duty', person: ph, remarks: rm, start: '09:00', end: '12:00' })
  console.log(route, ph, 'filed:', JSON.stringify((await readInputs(page, rm)).map(r => ({ n: r.name, by: r.by }))))
  // 3. admin declares the date a public holiday: the question is unanswered, the filer's bell is lit
  await loginAs(page, 'ad'); await toInputs(page)
  await declareHoliday(page, '2026-07-15', 'ph', 'Walk PH')
  // 4. the admin removes the filer
  await L.go(page, 'admin'); await sleep(700)
  await page.locator('#accFind').fill(cs); await sleep(400)
  await page.locator('#accList .od-row, #accList [data-pid], #accList > *').filter({ hasText: cs }).first().click(); await sleep(500)
  await pic(page, `s19-${route}-${ph}-1-user-row`)
  if (route === 'archive') { await page.locator('#accEdArchive').click(); await sleep(800) }
  else { await page.locator('#accEdDel').click(); await sleep(500); await pic(page, `s19-${route}-${ph}-2-delete-armed`); await page.locator('#accEdDel').click(); await sleep(900) }
  console.log(route, ph, 'after', route, '| admin messages:', JSON.stringify((await observe(page)).msgs.slice(0, 3)), '| person still on roster:', await page.evaluate(c => Object.values(window.PEOPLE).filter(p => p.cs === c).map(p => ({ archived: !!p.archived, deleted: !!p.deleted })), cs))
  await pic(page, `s19-${route}-${ph}-3-after`)
  // 5. the input
  const rec = (await readInputs(page, rm))[0]
  console.log(route, ph, 'the input still exists:', !!rec, JSON.stringify(rec && { n: rec.name, by: rec.by, oil: rec.oil }))
  await toInputs(page); await listAll(page); await listSearch(page, rm)
  const row = listRow(page, rm)
  console.log(route, ph, 'List row:', (await row.innerText().catch(() => 'NO ROW')).replace(/\s+/g, ' '), '| OIL? button:', await row.locator('.roil').count())
  await pic(page, `s19-${route}-${ph}-4-list-row`)
  // bell of the admin: no task for a filer who cannot act
  console.log(route, ph, 'admin bell lit:', /(^|\s)on(\s|$)/.test(await page.locator('#notifyBell').getAttribute('class') || ''))
  // 6. admin answers Yes and issues
  await row.locator('.roil').first().click().catch(e => console.log('OIL button press failed')); await sleep(500)
  await oilAnswer(page, 'yes')
  console.log(route, ph, 'after admin answered Yes:', JSON.stringify((await readInputs(page, rm))[0]?.oil))
  console.log(route, ph, 'ORIG', JSON.stringify(await issue(page, 2)))
  const m = await lwMap(page, '2026-07-15'); console.log(route, ph, 'credits Wed 15 Jul PH (baseline 16 from flying):', crowdCount(m), '| the removed man:', m[cs])
  console.log(route, ph, 'errs', JSON.stringify(w.errs))
  await w.ctx.close()
}
await closeAll()
