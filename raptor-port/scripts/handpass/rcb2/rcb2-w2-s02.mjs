/* rcb2-w2 S02 — the ALL / ALL AVAIL window's per-person reason (Ranger: Fri 12:00 blank, Sat 04:00-05:00; ALL AVAIL duty input Sat 10:00-11:00).
   usage: [PHONE=1] node rcb2-w2-s02.mjs */
const PHONE = process.env.PHONE === '1'
process.env.RCB2_RUN ||= 's02-' + (PHONE ? 'p' : 'd') + '1'
const X = await import('./rcb2-w2-lib.mjs')
const { L, say, sleep, FRI, SAT } = X
const w = await X.open({ phone: PHONE }); const { page, P } = w
const size = PHONE ? '402' : '1536'
await X.board(w, FRI); const wf = await X.flight(w, FRI, '12:00', ''); await X.closeBoard(w)
await X.board(w, SAT); await X.flight(w, SAT, '04:00', '05:00'); await X.closeBoard(w)
const filed = await X.fileDuty(w, '2026-07-18', 'allavail', '10:00', '11:00', 'rcb2 allavail')
say('filed', JSON.stringify(filed))
X.row('S02 setup', size, 'ALL AVAIL duty input Sat 10:00-11:00 filed on the Inputs page', 'one input', JSON.stringify(filed), filed.length === 1 ? 'PASS' : 'FAIL', '')
const snap = () => page.evaluate(s => JSON.stringify(window.DAYS[s]), SAT)
const awOpen = () => page.locator('.availwin:not([hidden]):visible').count()
async function reason(tag) {
  return page.evaluate(() => {
    const el = document.querySelector('.availwin [data-awp="bane"]')
    if (!el) return { found: false, names: [...document.querySelectorAll('.availwin [data-awp]')].map(e => e.dataset.awp).slice(0, 30) }
    const why = el.querySelector('.rwhy')
    const vis = e => e && e.offsetWidth > 0
    const pk = el.querySelector('.puck')
    return { found: true, why: why ? why.innerText.replace(/\s+/g, ' ').trim() : null, whyVisible: vis(why), title: pk ? pk.getAttribute('title') : null, cls: el.className }
  })
}
async function openFrom(root, tag) {
  const chip = page.locator(`${root} .day[data-day="${SAT}"] [data-oilsent]:visible`).first()
  const n = await page.locator(`${root} .day[data-day="${SAT}"] [data-oilsent]`).count()
  say('chips on Sat', root, n)
  if (!(await chip.count())) return false
  await chip.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  { const b = await chip.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
  await sleep(600)
  return awOpen()
}
async function round(tag, rootEdit, re) {
  await L.go(page, 'editsched'); await sleep(400)
  const ok = await openFrom('#eWeek', tag)
  if (!ok) { await X.pic(w, `s02-${tag}-chip-tap-no-window-${P}`); const armed = await page.evaluate(() => (window.ARM && window.ARM.key) || null); X.row('S02 ' + tag, size, 'tap the ALL AVAIL count chip on the week/day card', 'window opens', 'no window; ARM key after the tap: ' + JSON.stringify(armed) + ' (the row was armed for planning instead)', 'FAIL?', `s02-${tag}-chip-tap-no-window-${P}.png`); await page.evaluate(() => document.querySelector('[data-disarm]')?.click()); return }
  await X.pic(w, `s02-${tag}-week-window-${P}`)
  const r1 = await reason(tag); say('reason week', tag, JSON.stringify(r1))
  X.row('S02 ' + tag, size, 'week: Ranger row reason', String(re), JSON.stringify(r1), r1.found && r1.why && re.test(r1.why) ? 'PASS' : (r1.found && r1.why ? 'RECORDED' : 'FAIL'), `s02-${tag}-week-window-${P}.png`)
  X.row('S02 ' + tag, size, 'week: Ranger puck title (desktop hover title)', 'RECORD', JSON.stringify(r1.title), 'RECORDED', '')
  // tap his puck with OIL Earn off: highlight, no change in tasking
  const before = await snap()
  const pk = page.locator('.availwin [data-awp="bane"] .puck').first()
  if (await pk.count()) { if (PHONE) await pk.tap(); else await pk.click(); await sleep(150); await page.screenshot({ path: `${X.W.SHOTS}/s02-${tag}-puck-tap-${P}-quick.png` }); await sleep(500) }
  await X.pic(w, `s02-${tag}-puck-tapped-${P}`)
  const after = await snap()
  X.row('S02 ' + tag, size, 'tap his puck in the window (OIL Earn off)', 'highlights him; tasking unchanged', 'tasking same: ' + (before === after) + '; window still open: ' + await awOpen(), before === after && await awOpen() ? 'PASS' : 'FAIL', `s02-${tag}-puck-tapped-${P}.png`)
  // press the page behind the open window (lesson 4): another day's empty area / day header? press a puck of another man in the week
  const lit0 = await page.evaluate(() => document.querySelectorAll('#eWeek .puck.sel, #eWeek .puck.hl, #eWeek .puck.picked, #eWeek .lit').length)
  const other = page.locator('#eWeek .day[data-day="5"] .puck[data-person]:not([data-person="bane"]):not(.allavail):visible').first()
  if (await other.count()) {
    await other.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
    const who = await other.getAttribute('data-person')
    { const bb = await other.boundingBox(); await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2) }
    await sleep(600)
    const lit = await page.evaluate(w0 => [...document.querySelectorAll('#eWeek .puck[data-person="' + w0 + '"]')].filter(e => e.offsetWidth).map(e => e.className).slice(0, 4), who)
    await X.pic(w, `s02-${tag}-page-behind-${P}`)
    X.row('S02 ' + tag, size, 'press the page behind the open window (a puck of ' + who + ' on Sat)', 'page works: his pucks light; window state recorded', 'window open: ' + await awOpen() + '; his puck classes ' + JSON.stringify(lit), lit.some(c => /sel|hl|picked|lit|on/.test(c)) ? 'PASS' : 'RECORDED', `s02-${tag}-page-behind-${P}.png`)
  }
  // close ways
  const ways = {}
  if (await awOpen()) { await X.press(w, '.availwin .win-x'); ways.x = (await awOpen()) ? 'STILL OPEN' : 'closed' }
  await openFrom('#eWeek', tag)
  if (await awOpen()) { await page.keyboard.press('Escape'); await sleep(500); ways.escape = (await awOpen()) ? 'STILL OPEN' : 'closed' }
  await openFrom('#eWeek', tag)
  if (await awOpen()) { const b = await page.locator('.availwin').first().boundingBox(); const vp = page.viewportSize(); const x = b.x > 60 ? 20 : vp.width - 8; const y = vp.height - 8; if (PHONE) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y); await sleep(500); ways.outsideTap = (await awOpen()) ? 'stays open' : 'closed' }
  if (await awOpen()) { await L.go(page, 'viewsched'); await sleep(500); ways.pageChange = (await awOpen()) ? 'STILL OPEN' : 'closed'; await L.go(page, 'editsched'); await sleep(400) }
  X.row('S02 ' + tag, size, 'the window closed each way', 'x/Escape close; outside tap leaves it open; page change dismisses', JSON.stringify(ways), ways.x === 'closed' && ways.escape === 'closed' && ways.outsideTap === 'stays open' && ways.pageChange === 'closed' ? 'PASS' : 'RECORDED', '')
  // from the board
  await X.board(w, SAT)
  const chipB = page.locator('#schedBoard [data-oilsent]:visible').first()
  if (await chipB.count()) {
    await chipB.evaluate(e => e.scrollIntoView({ block: 'center' })); { const b = await chipB.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2) } await sleep(600)
    await X.pic(w, `s02-${tag}-board-window-${P}`)
    const r2 = await reason(tag)
    X.row('S02 ' + tag, size, 'board: Ranger row reason', String(re), JSON.stringify(r2), r2.found && r2.why && re.test(r2.why) ? 'PASS' : (r2.found && r2.why ? 'RECORDED' : 'FAIL'), `s02-${tag}-board-window-${P}.png`)
    if (await awOpen()) await X.press(w, '.availwin .win-x')
  } else X.row('S02 ' + tag, size, 'board: ALL AVAIL chip', 'chip', 'none visible', 'NOT WALKED', '')
  await X.closeBoard(w)
}
const BL = /took off 12:00 with no landing typed.*14:00.*02:00/
await round('a-blank', '#eWeek', BL)
await page.evaluate(([d, g]) => { window.DAYS[d].waves[g].formations[0].ld = 'TBD'; window.afterSchedMutate() }, [FRI, wf]); await sleep(500)
await round('b-tbd', '#eWeek', BL)
// View-only
await L.go(page, 'viewsched'); await sleep(500)
const okv = await openFrom('#vWeek', 'v')
if (okv) {
  await X.pic(w, `s02-c-viewonly-window-${P}`)
  const rv = await reason('v'); say('reason view', JSON.stringify(rv))
  X.row('S02 c-viewonly', size, 'View-only: Ranger row reason', String(BL), JSON.stringify(rv), rv.found && rv.why && BL.test(rv.why) ? 'PASS' : (rv.found && rv.why ? 'RECORDED' : 'FAIL'), `s02-c-viewonly-window-${P}.png`)
  if (await awOpen()) await X.press(w, '.availwin .win-x')
} else X.row('S02 c-viewonly', size, 'open the chip on View-only Sched', 'window', 'none (Sat not published: the chip may not draw)', 'RECORDED', '')
await X.fin(w)
