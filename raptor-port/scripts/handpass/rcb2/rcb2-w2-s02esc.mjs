/* rcb2-w2 S02 Escape check — does Escape close the ALL AVAIL window? Fresh world; ALL AVAIL input Sat 10:00-11:00; chip opened; Escape pressed
   a) straight after the opening press, b) after a click inside the window's title bar, c) after a click on a man's puck in it. usage: [PHONE=1] node ... */
const PHONE = process.env.PHONE === '1'
process.env.RCB2_RUN ||= 's02esc-' + (PHONE ? 'p' : 'd') + '1'
const X = await import('./rcb2-w2-lib.mjs')
const { L, say, sleep, SAT } = X
const w = await X.open({ phone: PHONE }); const { page, P } = w
const size = PHONE ? '402' : '1536'
const filed = await X.fileDuty(w, '2026-07-18', 'allavail', '10:00', '11:00', 'rcb2 allavail')
say('filed', JSON.stringify(filed))
const aw = () => page.locator('.availwin:not([hidden]):visible').count()
const open = async () => {
  await L.go(page, "editsched"); await sleep(400); say("board open?", await page.locator("#schedBoard").count(), "CURPAGE", await page.evaluate(() => window.CURPAGE)); await X.pic(w, "dbg-editsched-" + P)
  const chip = page.locator(`#eWeek .day[data-day="${SAT}"] [data-oilsent]:visible`).first()
  await chip.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  { const b = await chip.boundingBox(); say("hit at chip centre:", await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + "." + e.className + " " + (e.dataset.oilsent ? "CHIP" : "not the chip") : "none" }, [b.x + b.width / 2, b.y + b.height / 2]), JSON.stringify(b)) }
  { const b = await chip.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(500); say("after mouse click window:", await aw()); await X.pic(w, "dbg-after-chip-" + P) }
  return aw()
}
const act = async () => page.evaluate(() => { const a = document.activeElement; return a ? a.tagName + '.' + (a.className || '') + '#' + (a.id || '') : 'none' })
for (const [tag, pre] of [['a-direct', null], ['b-titlebar', '.availwin .win-ttl'], ['c-puck', '.availwin .rpuck .puck']]) {
  const o = await open()
  if (!o) { X.row('S02esc ' + tag, size, 'open', 'window', 'not open', 'NOT WALKED'); continue }
  if (pre) { const el = page.locator(pre).first(); if (PHONE) await el.tap(); else await el.click(); await sleep(300) }
  const focus = await act()
  await page.keyboard.press('Escape'); await sleep(700)
  const still = await aw()
  await X.pic(w, `s02esc-${tag}-${P}`)
  X.row('S02 Escape ' + tag, size, 'open the ALL AVAIL window' + (pre ? ', click ' + pre : '') + ', press Escape', 'Escape closes the front window (ALL AVAIL contract, D641)', 'focus was ' + focus + '; window ' + (still ? 'STILL OPEN' : 'closed'), still ? 'FAIL' : 'PASS', `s02esc-${tag}-${P}.png`)
  if (await aw()) await X.press(w, '.availwin .win-x')
}
await X.fin(w)
