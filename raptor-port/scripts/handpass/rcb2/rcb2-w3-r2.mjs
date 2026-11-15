/* rcb2-w3 R2 v1 — A in the ALL AVAIL window's per-person reason. usage: [PHONE=1] node rcb2-w3-r2.mjs */
process.env.RCB2_DIST = 'C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/6e376de7-ce28-4b0e-ad14-7848f71c5f9a/scratchpad/frozen-f01e1e416'
process.env.RCB2_BUNDLE = 'index-DDDelbBP.js'
const PHONE = process.env.PHONE === '1'
process.env.RCB2_RUN ||= 'r2-' + (PHONE ? 'p' : 'd') + (process.env.TAG || '1')
const X = await import('./rcb2-w3-lib.mjs')
const { L, say, sleep, FRI } = X
say('rcb2-w3-r2 v1')
const w = await X.open({ phone: PHONE }); const { page, P } = w
const size = PHONE ? '402' : '1536'
await X.board(w, FRI)
const wi = await X.flight(w, FRI, '12:00', '')
await X.typeIn(w, `[data-bfld="ff:${FRI}.${wi}.0.msn"]`, 'VL BFM')
const g0 = await page.evaluate(d => window.DAYS[d].ground.length, FRI)
await X.press(w, `[data-gradd="${FRI}"]`, { scope: 'board' }); await sleep(400)
await X.typeIn(w, `[data-bfld="gr:${FRI}.${g0}.prog"]`, 'ALL AVAIL TEST')
await X.typeIn(w, `[data-bfld="gr:${FRI}.${g0}.str"]`, '12:30')
await X.typeIn(w, `[data-bfld="gr:${FRI}.${g0}.end"]`, '13:30')
const sres = await X.seat(w, `[data-fill="g:${FRI}.${g0}.+"]`, 'allavail')
say('seat allavail', sres)
say('ground row', await page.evaluate(([d, g]) => JSON.stringify(window.DAYS[d].ground[g]), [FRI, g0]))
await X.pic(w, `r2-0-board-${P}`)
X.row('R2 setup', size, 'VL 12:00 landing blank (Ranger), ground row 12:30-13:30 with an ALL AVAIL puck', 'both in place', sres + ' ' + await page.evaluate(([d, g]) => JSON.stringify(window.DAYS[d].ground[g].who), [FRI, g0]), sres === 'ok' ? 'PASS' : 'NOT WALKED', `r2-0-board-${P}.png`)

const awOpen = () => page.locator('.availwin:not([hidden]):visible').count()
async function reason() {
  return page.evaluate(() => {
    const el = document.querySelector('.availwin [data-awp="bane"]')
    if (!el) return { found: false, names: [...document.querySelectorAll('.availwin [data-awp]')].map(e => e.dataset.awp).slice(0, 30), text: (document.querySelector('.availwin') || {}).innerText }
    const why = el.querySelector('.rwhy'); const pk = el.querySelector('.puck')
    return { found: true, why: why ? why.innerText.replace(/\s+/g, ' ').trim() : null, whyVisible: !!(why && why.offsetWidth), title: pk ? pk.getAttribute('title') : null, full: el.innerText.replace(/\s+/g, ' ').trim() }
  })
}
async function chipSel(root) {
  const chips = await page.evaluate(r => [...document.querySelectorAll(`${r} [data-oilsent]`)].filter(e => e.offsetWidth).map(e => e.outerHTML.slice(0, 160)), root)
  say('chips', root, JSON.stringify(chips))
  return page.locator(`${root} [data-oilsent]:visible`).first()
}
const BLK = /take-off \+ 2h, no landing typed/
// from the board
let chip = await chipSel('#schedBoard')
if (await chip.count()) {
  await chip.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  { const b = await chip.boundingBox(); if (PHONE) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
  await sleep(150); await page.screenshot({ path: `${X.W.SHOTS}/r2-1-chip-tap-quick-${P}.png` }); await sleep(500)
  say('window open', await awOpen())
  await X.pic(w, `r2-1-board-window-${P}`)
  const r = await reason(); say('REASON board', JSON.stringify(r))
  X.row('R2 board', size, 'open the ALL AVAIL count window from the board; Ranger row reason', 'reason holds "take-off + 2h, no landing typed"', JSON.stringify(r), r.found && r.why && BLK.test(r.why) ? 'PASS' : (r.found ? 'FAIL' : 'NOT WALKED'), `r2-1-board-window-${P}.png`)
  X.row('R2 board title', size, "Ranger's puck title in the window", 'RECORD', JSON.stringify(r.title), 'RECORDED', '')
  if (await awOpen()) await X.press(w, '.availwin .win-x')
} else X.row('R2 board', size, 'ALL AVAIL count chip on the board', 'chip', 'none visible', 'NOT WALKED', `r2-0-board-${P}.png`)
await X.closeBoard(w)

// from the week
await L.go(page, 'editsched'); await sleep(500)
chip = await chipSel(`#eWeek .day[data-day="${FRI}"]`)
if (await chip.count()) {
  await chip.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  { if (PHONE) { await chip.tap({ timeout: 3000 }) } else { const b = await chip.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2) } }
  await sleep(150); await page.screenshot({ path: `${X.W.SHOTS}/r2-2-chip-tap-quick-${P}.png` }); await sleep(500)
  const open = await awOpen()
  await X.pic(w, `r2-2-week-window-${P}`)
  const r = await reason(); say('REASON week', JSON.stringify(r))
  X.row('R2 week', size, 'open the window from the week day card; Ranger row reason', 'reason holds "take-off + 2h, no landing typed"', JSON.stringify(r), open && r.found && r.why && BLK.test(r.why) ? 'PASS' : (r.found ? 'FAIL' : 'NOT WALKED'), `r2-2-week-window-${P}.png`)
  // press the page behind the open window (lesson 4)
  const snap = () => page.evaluate(d => JSON.stringify(window.DAYS[d]), FRI)
  const before = await snap()
  const other = page.locator(`#eWeek .day[data-day="${FRI}"] .puck[data-person]:not(.allavail):visible`).first()
  const lit0 = await page.evaluate(() => [...document.querySelectorAll('#eWeek .puck')].filter(e => /sel|hl|picked|lit/.test(e.className)).length)
  if (await other.count()) {
    const who = await other.getAttribute('data-person')
    await other.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
    { const bb = await other.boundingBox(); if (PHONE) await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); else await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2) }
    await sleep(200); await page.screenshot({ path: `${X.W.SHOTS}/r2-3-page-behind-quick-${P}.png` }); await sleep(500)
    const lit = await page.evaluate(w0 => [...document.querySelectorAll('#eWeek .puck[data-person="' + w0 + '"]')].filter(e => e.offsetWidth).map(e => e.className).slice(0, 5), who)
    const litN = await page.evaluate(() => [...document.querySelectorAll('#eWeek .puck')].filter(e => /sel|hl|picked|lit/.test(e.className)).length)
    await X.pic(w, `r2-3-page-behind-${P}`)
    const after = await snap()
    X.row('R2 lesson 4', size, 'press the page behind the open window (puck of ' + who + ')', 'page works: his pucks light; tasking unchanged; RECORD window state', `window open: ${await awOpen()}; his puck classes ${JSON.stringify(lit)}; lit pucks ${lit0} -> ${litN}; tasking same ${before === after}`, lit.some(c => /sel|hl|picked|lit|on/.test(c)) && before === after ? 'PASS' : 'RECORDED', `r2-3-page-behind-${P}.png`)
  }
  // close ways
  const ways = {}
  if (await awOpen()) { await X.press(w, '.availwin .win-x'); ways.x = (await awOpen()) ? 'STILL OPEN' : 'closed' }
  X.row('R2 close', size, 'window closed by its x', 'closed', JSON.stringify(ways), ways.x === 'closed' ? 'PASS' : 'FAIL', '')
} else X.row('R2 week', size, 'ALL AVAIL chip on the week day card', 'chip', 'none visible', 'NOT WALKED', '')
await X.fin(w)
