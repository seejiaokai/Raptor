/* www W3 — each way to close the day-details window (lesson 19). usage: [PHONE=1] node scripts/handpass/www/www-w3-s9.mjs */
const PHONE = process.env.PHONE === '1'
process.env.WWW_RUN ||= 's9-' + (PHONE ? 'p' : 'd')
const H = await import('./www-w3-lib.mjs')
const { X, say, sleep, L } = H
const size = PHONE ? '402' : '1536'
const P = PHONE ? 'p' : 'd'
const w = await X.open({ phone: PHONE })
const { page } = w
const R = (did, exp, saw, v, pic) => X.row('9 day details closes', size, did, exp, saw, v, pic)
await L.go(page, 'editsched'); await sleep(500)
const res = []
for (const how of ['done', 'x', 'esc', 'outside']) {
  const dd = await X.dayDetails(w, '#eWeek', X.MON)
  await X.pic(w, `9-open-${how}-${P}`)
  if (!dd.ok) { res.push([how, 'NOT OPENED: ' + dd.why]); continue }
  let r
  if (how === 'outside') { await page.mouse.click(PHONE ? 5 : 8, PHONE ? 860 : 500); await sleep(500); r = (await page.locator('#dayPop:not([hidden]) .airpop-box:visible').count()) ? 'STILL OPEN' : 'closed' }
  else r = await X.closeDayPop(w, how)
  await X.pic(w, `9-after-${how}-${P}`)
  res.push([how, r])
  if (r === 'STILL OPEN') await X.closeDayPop(w, 'done')
}
R('opened the day details (Monday) and closed it by Done, ✕, Escape, a tap outside', 'RECORD each', JSON.stringify(res), 'RECORDED', `9-after-done-${P}.png`)
await X.fin(w)
