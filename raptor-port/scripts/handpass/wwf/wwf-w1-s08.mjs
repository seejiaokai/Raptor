/* wwf w1 scenario 8 — a fresh Illegal seat warning through every door, hide/show/undo, publish + amendment. usage: [PHONE=1] */
import * as H from './wwf-w1-lib.mjs'
const PHONE = process.env.PHONE === '1'
const RUN = process.env.RUN || (PHONE ? 's08-p' : 's08')
const X = await H.init(RUN, PHONE)
const { say, sleep, row, pic } = X
const w = await X.open({ phone: PHONE })
const { page } = w
const SZ = PHONE ? 'phone' : 'desktop'
const step = async (n, f) => { try { return await f() } catch (e) { say('STEP ERROR', n, String(e.message).split('\n')[0]); return null } }
const D = 1
const ill = ls => ls.filter(l => /seat/i.test(l))
await H.gotoWeek(X, w, H.MONDAY_WK, 'editsched')
await X.board(w, D)
await X.press(w, `[data-wvadd="${D}"]`, { scope: 'board' }); await sleep(300)
await X.press(w, '.wavemenu [data-wmkind="avalon"]'); await sleep(700)
say('seat', await X.seat(w, `[data-slot="${D}.0.0.0.p"]`, 'rocky'))
const bw = await X.boardWarn(w); say('board list', JSON.stringify(bw)); await pic(w, '01-board-list')
row('S8', SZ, 'Board warning list after a WSO (Hex) is put in AVALON MAIN front seat', '"Illegal seat: ..." line', JSON.stringify(ill(bw)), ill(bw).some(l => /Illegal seat/.test(l)) && !ill(bw).some(l => /Wrong seat/.test(l)) ? 'PASS' : 'FAIL', `w1/${RUN}/01-board-list.png`)
// the Q chip / puck note: read the puck title
say('puck titles', await page.evaluate(() => [...document.querySelectorAll('#schedBoard .puck[data-person="rocky"]')].map(e => (e.title || '') + '|' + (e.getAttribute('aria-label') || '')).join(' ;; ')))
// hide the warning with its cross, then show, then undo
await step('hide', async () => {
  const x = page.locator('#schedBoard #sbWarn .wln', { hasText: 'Illegal seat' }).locator('button:visible, [data-whide]:visible, .wx:visible').first()
  say('hide control', await x.count())
  if (await x.count()) {
    await x.click(); await sleep(700); await pic(w, '02-hidden')
    const t = await X.boardWarn(w); say('after hide', JSON.stringify(t))
    const rs = page.locator('#schedBoard #sbWarn .wln', { hasText: 'Illegal seat' }).locator('button:visible, .wx:visible').first()
    if (await rs.count()) { await rs.click(); await sleep(700); await pic(w, '03-shown-again'); say('after show', JSON.stringify(await X.boardWarn(w))) }
    await X.press(w, '#undoBtn'); await sleep(700); say('after undo', JSON.stringify(await X.boardWarn(w))); await pic(w, '04-after-undo')
    await X.press(w, '#redoBtn').catch(() => {}); await sleep(500)
  }
})
await step('insights', async () => {
  await X.press(w, '#insightBtn, #sbInsights'); await sleep(1200); await pic(w, '05-insights')
  say('insights text', (await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '))).match(/.{0,80}(illegal seat|Illegal seat|seat).{0,80}/gi)?.slice(0, 4))
  await page.keyboard.press('Escape'); await sleep(400)
})
await X.closeBoard(w)
const ww = await X.weekWarn(w, '#eWeek', D); say('week strip', ww.head, JSON.stringify(ww.items)); await pic(w, '06-week-strip')
row('S8', SZ, 'week list for Tue 28 Jul', '"Illegal seat: ..." line', JSON.stringify(ill(ww.items)), ill(ww.items).some(l => /Illegal seat/.test(l)) ? 'PASS' : 'FAIL', `w1/${RUN}/06-week-strip.png`)
const dd = await X.dayDetails(w, '#eWeek', D); say('day details', JSON.stringify(dd)); await pic(w, '07-day-details')
row('S8', SZ, 'day details window for Tue 28 Jul', '"Illegal seat: ..." line', JSON.stringify(ill(dd.items || [])), ill(dd.items || []).some(l => /Illegal seat/.test(l)) ? 'PASS' : 'FAIL', `w1/${RUN}/07-day-details.png`)
await X.closeDayPop(w, 'done')
// publish then amendment
await X.board(w, D)
const pub = await X.L.publish(page, D); say('publish', JSON.stringify(pub)); await pic(w, '08-published')
await X.closeBoard(w)
const ww2 = await X.weekWarn(w, '#eWeek', D); say('week strip after publish', ww2.head, JSON.stringify(ww2.items)); await pic(w, '09-week-published')
row('S8', SZ, 'publish Tue 28 Jul with the warning standing', 'the issued face keeps the "Illegal seat:" line', JSON.stringify(ill(ww2.items)), ill(ww2.items).some(l => /Illegal seat/.test(l)) ? 'PASS' : 'FAIL', `w1/${RUN}/09-week-published.png`)
await step('amend', async () => {
  await X.board(w, D)
  say('seat 2', await X.seat(w, `[data-slot="${D}.0.0.2.p"]`, 'spanner'))
  const pub2 = await X.L.publish(page, D); say('publish AL', JSON.stringify(pub2))
  await X.closeBoard(w)
  const ww3 = await X.weekWarn(w, '#eWeek', D); say('week strip after amendment', ww3.head, JSON.stringify(ww3.items)); await pic(w, '10-week-amended')
  row('S8', SZ, 'amendment adds Cotter (ground crew) in AVALON SPARE front seat, published', 'both "Illegal seat:" lines on the issued face', JSON.stringify(ill(ww3.items)), ill(ww3.items).filter(l => /Illegal seat/.test(l)).length >= 2 ? 'PASS' : 'FAIL', `w1/${RUN}/10-week-amended.png`)
  await X.L.go(page, 'viewsched'); await H.gotoWeek(X, w, H.MONDAY_WK, null); await sleep(600)
  const vv = await X.weekWarn(w, '#vWeek', D); say('view-only strip', vv.head, JSON.stringify(vv.items)); await pic(w, '11-viewonly')
  row('S8', SZ, 'View-only Sched, same day', 'Illegal seat lines, no "Wrong seat"', JSON.stringify(ill(vv.items)), ill(vv.items).some(l => /Illegal seat/.test(l)) && !ill(vv.items).some(l => /Wrong seat/.test(l)) ? 'PASS' : 'FAIL', `w1/${RUN}/11-viewonly.png`)
})
await X.fin(w)
