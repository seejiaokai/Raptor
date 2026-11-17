/* msq-w1-s9 v1 — S9 plain-user round as ad9 on the PHONE, plus S1 phone reading. usage: node scripts/handpass/msq/msq-w1-s9.mjs */
process.env.MSQ_WHO = 'w1'
process.env.MSQ_RUN = 's9-p'
const X = await import('./msq-lib.mjs')
const U = await import('./msq-w1-util.mjs')
const { say, sleep, row } = X
say('msq-w1-s9 v1 phone')
const w = await X.open({ phone: true, user: 'ad9' })
const { page } = w
const safe = async (label, fn) => { try { return await fn() } catch (e) { say('ERR', label, String(e.message).split('\n')[0]); return null } }
const tap2 = async (name, sel) => { await sleep(100); await X.pic(w, name + '-tap'); await sleep(900); await X.pic(w, name) }
const names142 = ['Saber', 'Ranger']
const only149 = async () => { const t = await U.bodyText(page); return { has142: names142.filter(n => new RegExp('\\b' + n + '\\b').test(t)), hasKestrel: /Kestrel/.test(t) } }

await X.L.go(page, 'editsched'); await sleep(1200)
await X.pic(w, 's9-01-week')
let o = await only149()
row('S9', 'phone', 'ad9 opens Edit Schedule', 'only 149 names', JSON.stringify(o), o.has142.length === 0 ? 'PASS' : 'FAIL', 's9-01-week.png')
// S1 phone: ground row seen / not seen is judged on desktop; here record the week text
await safe('board', async () => {
  await X.W.board(w, 2); await sleep(500); await X.pic(w, 's9-02-board')
  o = await only149()
  row('S9', 'phone', "ad9 opens Wed 15 Jul's board", 'opens over the page, only 149 names', JSON.stringify(o), o.has142.length === 0 ? 'PASS' : 'FAIL', 's9-02-board.png')
  await X.W.closeBoard(w); await sleep(700); await X.pic(w, 's9-03-after-done')
  const back = await page.locator('#vWeek .day').count()
  row('S9', 'phone', 'ad9 closes the board with its own Done', 'week as it was', `week days visible: ${back}`, back > 0 ? 'PASS' : 'FAIL', 's9-03-after-done.png')
})
// day details / crew list: try the day heading
await safe('details', async () => {
  const head = page.locator('#vWeek .day').nth(2).locator('.dname, .dhead, h3, [data-day]').first()
  await head.click(); await tap2('s9-04-day-details')
  const t = await U.bodyText(page)
  const closeBtn = page.getByRole('button', { name: /close|✕|×/i }).first()
  row('S9', 'phone', 'ad9 taps the Wed 15 Jul day heading', 'RECORD: day details / crew list opens', t.slice(0, 300), 'RECORD', 's9-04-day-details.png')
  if (await closeBtn.count()) { await closeBtn.click(); await sleep(700); await X.pic(w, 's9-05-after-close') ; row('S9', 'phone', 'closes it by its own close', 'page as it was', 'closed via close button', 'RECORD', 's9-05-after-close.png') }
  else { await page.keyboard.press('Escape'); await sleep(500); await X.pic(w, 's9-05-after-escape'); row('S9', 'phone', 'no own close found; pressed Escape', 'RECORD', 'see picture', 'RECORD', 's9-05-after-escape.png') }
})
// Leave War
await X.L.go(page, 'leavewar'); await sleep(2500)
await X.pic(w, 's9-06-leavewar')
o = await only149()
row('S9', 'phone', 'ad9 opens the Leave War', 'only 149 names', JSON.stringify(o), o.has142.length === 0 ? 'PASS' : 'FAIL', 's9-06-leavewar.png')
await safe('myleave', async () => {
  await page.getByRole('button', { name: /MY LEAVE|My leave/i }).first().click(); await tap2('s9-07-myleave')
  o = await only149()
  row('S9', 'phone', 'ad9 taps MY LEAVE', 'opens over the page, only 149 names', JSON.stringify(o), o.has142.length === 0 ? 'PASS' : 'FAIL', 's9-07-myleave.png')
  const c = page.getByRole('button', { name: /close|✕|×|back|done/i }).first()
  if (await c.count()) await c.click(); else await page.keyboard.press('Escape')
  await sleep(700); await X.pic(w, 's9-08-after-myleave-close')
})
await safe('person', async () => {
  await page.getByText('Kestrel', { exact: true }).first().click(); await tap2('s9-09-person')
  o = await only149()
  row('S9', 'phone', 'ad9 taps a name (Kestrel) in the Leave War', 'person window opens, only 149 names', JSON.stringify(o), o.has142.length === 0 ? 'PASS' : 'FAIL', 's9-09-person.png')
  const c = page.getByRole('button', { name: /close|✕|×/i }).first()
  if (await c.count()) await c.click(); else await page.keyboard.press('Escape')
  await sleep(700); await X.pic(w, 's9-10-after-person-close')
})
await safe('bell', async () => {
  const bs = '#bellBtn, [data-testid*="bell" i], button[aria-label*="ell" i], button[aria-label*="otif" i], button[title*="ell" i], button[title*="otif" i]'
  await page.locator(bs).first().click(); await tap2('s9-11-bell')
  const t = await U.bodyText(page)
  row('S9', 'phone', 'ad9 opens the bell', 'RECORD lines; no 142 lines', t.slice(0, 400), 'RECORD', 's9-11-bell.png')
  await page.locator(bs).first().click(); await sleep(600); await X.pic(w, 's9-12-after-bell-close')
})
await X.fin(w)
