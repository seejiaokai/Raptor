// Scenario 14 — a move and ordinary edits keep a title (admin, desktop, a STORED world so the reload counts).
import { launch, open, table, errs, people, shot, sleep, press, allRecs, closeAnyWin, win, norm, toCal, month, tapAt, gotoInputs, recs } from './it-A-lib.mjs'
import { calDoor, boardDoor, closeBoardAny } from './it-A-doors.mjs'

const browser = await launch()
const T = table('s14')
const { ctx, page } = await open(browser, 'desk', 'ad', 'a', { fresh: false })
const say = []; let ok = true; const pics = []
const need = (c, m) => { if (!c) ok = false; say.push((c ? '' : 'MISSED: ') + m) }
const P = await people(page)
const one = async iid => (await allRecs(page)).find(r => r.iid === iid)
try {
  const d = calDoor(); const before = new Set((await allRecs(page)).map(r => r.iid))
  await d.openNew(page, { iso: '2026-07-15', person: P.Ranger, type: 'Event', st: '14:00', en: '15:00' })
  await page.fill('#inpEditTitle', 'Sports day'); await d.submit(page)
  const fx = (await allRecs(page)).find(r => !before.has(r.iid))
  await closeAnyWin(page)
  need(fx && fx.title === 'Sports day' && fx.date === 'Jul 15', `created: "${fx && fx.title}" on ${fx && fx.date}`)
  // drag its month bar from the 15th to the 16th
  await gotoInputs(page); await toCal(page); await month(page, 2026, 7)
  const bar = page.locator(`#inpCal .ib-bar[data-iid="${fx.iid}"]`).first(); await bar.waitFor()
  pics.push(await shot(page, 's14-1-before-drag'))
  const b = await bar.boundingBox(), tgt = await page.locator('#inpCal [data-icday="2026-07-16"]').boundingBox()
  await page.mouse.move(b.x + 20, b.y + b.height / 2); await page.mouse.down()
  const tx = tgt.x + 30, ty = tgt.y + tgt.height / 2
  for (let i = 1; i <= 12; i++) { await page.mouse.move(b.x + 20 + (tx - b.x - 20) * i / 12, b.y + b.height / 2 + (ty - b.y - b.height / 2) * i / 12); await sleep(page, 30) }
  pics.push(await shot(page, 's14-2-mid-drag'))
  await page.mouse.up(); await sleep(page, 600)
  const moved = await one(fx.iid)
  need(moved.date === 'Jul 16' && moved.title === 'Sports day', `after the drag the input is on ${moved.date} and still titled "${moved.title}"`)
  pics.push(await shot(page, 's14-3-after-drag'))
  // edit its hours and remark on the Scheduler Board (Thu 16 Jul = day 3) - the schedule's own in-place controls
  const bd = boardDoor(3); await bd.openBoard(page)
  const tog = page.locator('#schedBoard [data-pitog]'); if (await tog.count() && !(await page.locator(`#schedBoard [data-inprow="${fx.iid}"]`).isVisible().catch(() => false))) { await press(page, tog.first()); await sleep(page, 350) }
  const row = page.locator(`#schedBoard [data-inprow="${fx.iid}"]`); await row.scrollIntoViewIfNeeded()
  const nameBefore = norm(await row.locator('.sbi-ty').innerText())
  const s = row.locator(`[data-ifld="${fx.iid}.str"]`), e = row.locator(`[data-ifld="${fx.iid}.end"]`), r = row.locator(`[data-ifld="${fx.iid}.rmks"]`)
  await s.fill('10:00'); await s.press('Enter'); await sleep(page, 250)
  await e.fill('11:30'); await e.press('Enter'); await sleep(page, 250)
  await r.fill('bring boots'); await r.press('Tab'); await sleep(page, 400)
  const edited = (await recs(page, { iid: fx.iid }))[0]
  say.push(`the Board card named "${nameBefore}" before and "${norm(await page.locator(`#schedBoard [data-inprow="${fx.iid}"] .sbi-ty`).innerText())}" after`)
  need(edited.title === 'Sports day' && edited.st === 600 && edited.en === 690 && edited.remarks === 'bring boots', `after editing the hours and remark on the Board: title "${edited.title}", ${edited.st}-${edited.en} (600-690 wanted), remark "${edited.remarks}"`)
  pics.push(await shot(page, 's14-4-board-edited'))
  await closeBoardAny(page)
  // the Edit Schedule week's own row (Thursday): its name
  await page.evaluate(() => window.go('editsched')); await sleep(page, 500)
  const wk = await page.evaluate(() => { const r = [...document.querySelectorAll('#eWeek .pl-row.gr-frominput')].find(x => /SPORTS DAY/.test(x.textContent)); return r ? { name: (r.querySelector('.nm .ntx') || {}).textContent, kind: (r.querySelector('.nm .nm-kind') || {}).textContent } : null })
  need(!!wk && wk.name === 'SPORTS DAY' && wk.kind === 'Event', `the week's row reads ${JSON.stringify(wk)}`)
  // reopen the input in its window
  await d.openSaved(page, edited)
  need((await page.inputValue('#inpEditTitle')) === 'Sports day', `reopened: Title "${await page.inputValue('#inpEditTitle')}"`)
  pics.push(await shot(page, 's14-5-reopened'))
  await closeAnyWin(page)
  // reload
  await sleep(page, 1200)
  await page.reload(); await page.waitForSelector('#loginForm, #vWeek .day')
  if (await page.locator('#loginForm').count()) { await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day') }
  const rl = (await recs(page, { iid: fx.iid }))[0]
  need(!!rl && rl.title === 'Sports day' && rl.date === 'Jul 16' && rl.st === 600 && rl.remarks === 'bring boots', `after a reload: ${JSON.stringify(rl && { t: rl.title, d: rl.date, s: rl.st, e: rl.en, r: rl.remarks })}`)
  await d.openSaved(page, rl)
  need((await page.inputValue('#inpEditTitle')) === 'Sports day', `reload then reopen: Title "${await page.inputValue('#inpEditTitle')}"`)
  pics.push(await shot(page, 's14-6-after-reload'))
} catch (e) { ok = false; say.push('SCRIPT ERROR ' + String(e.message).split('\n').slice(0, 5).join(' | ')); await shot(page, 's14-err').catch(() => {}) }
T.add({ n: 14, size: page.sizeName, role: 'admin', verdict: ok ? 'PASS' : 'FAIL', say: say.join(' · '), pics })
T.save()
await ctx.close(); await browser.close()
console.log('errors', JSON.stringify([...new Set(errs)].slice(0, 8)))
