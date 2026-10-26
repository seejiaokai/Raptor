// W1 part e3 — scenarios 9, 11 and 12 (phone, Chromium).
// 9: with a day panel resting at the foot, a bid that turns two rows amber/red: the bubble stands just above the panel,
//    both pairs, each its colour, the box the worst colour, nothing of the panel covered.
// 11: a refused bid on a red day sent back to waiting by the second tap on the lit Refuse: does the bubble come as the window closes.
// 12: Undo then Redo of a bid that turned a row red: RECORD whether a bubble comes on Redo.
// Usage (from raptor-port/): node scripts/handpass/lw-m3b-w1-e9.mjs
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const path = await import('node:path')
for (const p of ['s9-', 's11-', 's12-']) L.clearPrefix(p)
console.log('lw-m3b-w1-e9 phone/chromium out', L.OUT)
const w = await M.start('phone')
const P = w.page
console.log('page scripts:', await M.scriptCheck(w))
const lines = [], bad = []
const say = s => { lines.push(s); console.log('   ' + s) }
const judge = (ok, s) => { if (!ok) bad.push(s); say((ok ? 'ok    ' : 'WRONG ') + s) }
const shot = async name => { await P.screenshot({ path: path.join(L.OUT, name + '.png'), scale: 'css' }); return name + '.png' }
async function tapRead(target, name) {
  const c = typeof target === 'string' ? await L.centre(P, target) : target
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 1 }] })
  await P.waitForTimeout(40)
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await P.waitForTimeout(100)
  const b = await M.bub(P)
  if (name) await shot(name)
  await P.waitForTimeout(450)
  return b
}
const ids = await M.ids(P)
const H = await import('./lw-night-w1-lib.mjs')
async function setCounterAmber(ruleId, n) {
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
  if (!(await M.availP(w, '2026-12-15'))) throw new Error('no rows')
  await L.press(w, T(`manning-info-${ruleId}`)); await P.waitForTimeout(400)
  await L.press(w, T('counter-edit-open')); await P.waitForSelector(T('cform-amber'), { timeout: 4000 })
  await P.locator(T('cform-amber')).fill(String(n)); await P.waitForTimeout(200)
  await L.press(w, T('cform-save')); await P.waitForTimeout(500)
  if (await L.vis(P, T('counter-form'))) throw new Error('counter window stayed open')
}
const cnt = (rule, iso) => H.rowCell(P, `count-${rule}-${iso}`)
/* a bid with the below-zero ask answered (the second tap); returns the bubble read right after the placing tap */
async function placeLL(who, iso, name) {
  await L.openCellR(w, who, iso); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
  await M.setSwitch(w, false)
  let q = await tapRead(T('bid-LL'), name + '-first')
  if (await L.vis(P, T('bid-picker'))) q = await tapRead(T('bid-LL'), name)
  else await shot(name)
  if (await L.vis(P, T('bid-picker'))) { await L.closeAny(w); throw new Error('the bid window stayed open') }
  return q
}
const gone = async () => { await P.keyboard.press('Shift'); await P.waitForTimeout(200) }   // a key takes the bubble down
const dismiss = async () => { const b = await M.bub(P); if (b) { await P.keyboard.press('ArrowDown'); await P.waitForTimeout(250) } }

/* ---------------- 9 ---------------- */
{
  const D = '2026-12-17'
  await setCounterAmber('ip', 16)
  const ip0 = await cnt('ip', D)
  const f = await M.f1(w, D)
  say(`9 fixture: IP amber number 16, IP on ${D} reads ${ip0.text} (${H.levelOf(ip0)}); Required P ${f.req}, Available P ${f.cell.text} (${f.level})`)
  await M.foldRows(w)
  // the day panel: a tap on the date's heading
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
  await L.press(w, T('head-' + D)); await P.waitForSelector(T('win-lwday'), { timeout: 5000 }); await P.waitForTimeout(600)
  const pg = await P.evaluate(() => { const r = document.querySelector('[data-testid="win-lwday"]').getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), vh: innerHeight } })
  say(`9 the day panel is up: top ${pg.top}, bottom ${pg.bottom}, height ${pg.h} of ${pg.vh}`)
  await shot('s9-0-panel-up')
  // the bid: open Hunter's cell on D (an IP pilot)
  // the panel covers the people rows from y 285 down: scroll Hunter's row into the band above it, then tap his cell there
  const cellSel = T(L.cellId(ids.Hunter, D))
  await P.evaluate(sel => { const e = document.querySelector(sel); const r = e.getBoundingClientRect(); window.scrollBy(0, r.top - 170) }, cellSel)
  await P.waitForTimeout(500)
  const cc = await P.evaluate(sel => { const e = document.querySelector(sel); const r = e.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2; const hit = document.elementFromPoint(x, y); return { x, y, hitIsCell: !!hit && (e === hit || e.contains(hit)) } }, cellSel)
  say('9 the cell of Hunter for ' + D + ' stands at y ' + Math.round(cc.y) + ' above the panel (top ' + pg.top + '); a tap there reaches the cell: ' + cc.hitIsCell)
  await tapRead(cc, 's9-0b-cell-tapped')
  await P.waitForSelector(T('bid-picker'), { timeout: 5000 }).catch(() => {})
  await P.waitForTimeout(400)
  const open = await M.anyWindowOpen(P)
  say(`9 a tap on Hunter's cell with the panel up opens: ${JSON.stringify(open)}`)
  await M.setSwitch(w, false)
  let q = await tapRead(T('bid-LL'), 's9-1-after-tap-first')
  if (await L.vis(P, T('bid-picker'))) q = await tapRead(T('bid-LL'), 's9-1-after-tap')
  else await shot('s9-1-after-tap')
  const b = await M.bub(P)
  await shot('s9-2-settled')
  const panel = await P.evaluate(() => { const e = document.querySelector('[data-testid="win-lwday"]'); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), vis: r.height > 0 } })
  say('9 right after the tap: ' + M.bubLine(q))
  say('9 settled:            ' + M.bubLine(b))
  say('9 the panel now: ' + JSON.stringify(panel) + '; windows open: ' + JSON.stringify(await M.anyWindowOpen(P)))
  const ipN = await cnt('ip', D), apN = await H.rowCell(P, `avail-p-${D}`)
  say(`9 IP ${ip0.text} -> ${ipN.text} (${H.levelOf(ipN)}); Available P ${f.cell.text} -> ${apN.text} (${H.levelOf(apN)})`)
  if (b && panel && panel.vis) {
    judge(b.rect.b <= panel.top + 1 && panel.top - b.rect.b <= 40, `9 the bubble stands just above the panel's top: bubble bottom ${b.rect.b}, panel top ${panel.top} (gap ${panel.top - b.rect.b}px)`)
    // nothing of the panel covered: the panel's controls answer at their centres
    const cov = await P.evaluate(() => { const out = []; for (const id of ['lwday-prev', 'lwday-next']) { const e = document.querySelector(`[data-testid="${id}"]`); if (!e) { out.push(id + ': not drawn'); continue } const r = e.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); out.push(id + ': ' + (hit && (e === hit || e.contains(hit)) ? 'reachable' : 'COVERED by ' + (hit?.dataset?.testid || hit?.className || hit?.tagName))) } const bubble = document.querySelector('[data-testid="manning-bubble"]').getBoundingClientRect(); const pr = document.querySelector('[data-testid="win-lwday"]').getBoundingClientRect(); out.push('overlap bubble/panel: ' + (bubble.bottom > pr.top + 1 && bubble.top < pr.bottom)); return out })
    say('9 panel controls: ' + cov.join(' | '))
    judge(cov.every(c => !/COVERED/.test(c)) && /overlap bubble\/panel: false/.test(cov[cov.length - 1]), '9 nothing of the panel is covered by the bubble')
  } else judge(false, `9 NOT WALKED? bubble ${b ? 'up' : 'absent'}, panel ${panel ? JSON.stringify(panel) : 'absent'}`)
  judge(!!b && b.pairs.length === 2, `9 both pairs named: ${JSON.stringify(b && b.pairs.map(p => `${p.t} (${p.lv}, ${p.color})`))}`)
  judge(!!b && b.level === 'red' && M.isRed(b), `9 the box is in the worst colour (red): level ${b && b.level}, border ${b && b.border}`)
  judge(!!b && b.pairs.some(p => p.lv === 'amber') && b.pairs.some(p => p.lv === 'red') && new Set(b.pairs.map(p => p.color)).size === 2, `9 each pair in its own colour: ${JSON.stringify(b && b.pairs.map(p => p.lv + ' ' + p.color))}`)
  await dismiss()
  // close the panel for the next scenarios
  await L.press(w, T('win-lwday') + ' .win-x').catch(() => {})
  await P.waitForTimeout(300)
  say('9 after Escape the panel is ' + ((await P.locator(T('win-lwday')).count()) && await L.vis(P, T('win-lwday')) ? 'still up' : 'closed'))
}

/* ---------------- 11 and 12: one red day, its own man ---------------- */
{
  const D = '2026-12-21'
  const f = await M.f1(w, D)
  say(`11 fixture: Required P ${f.req}, Available P ${f.cell.text} (${f.level})`)
  await M.foldRows(w)
  const q1 = await placeLL(ids.Drifter, D, 's11-1-bid')
  say('11 the bid (the red day): ' + M.bubLine(q1))
  await dismiss()
  // refuse it (the one-day window), then the lit Refuse tapped again
  await L.openCellR(w, ids.Drifter, D); await P.waitForSelector(T('bid-picker'))
  const qr = await tapRead(T('decide-refuse'), 's11-2-refuse-q')
  say('11 Refuse tapped: bubble ' + M.bubLine(qr) + `; Available P ${(await H.rowCell(P, `avail-p-${D}`)).text}`)
  await dismiss()
  await L.openCellR(w, ids.Drifter, D); await P.waitForSelector(T('bid-picker'))
  const lit = await M.btnState(P, ['decide-refuse'])
  say(`11 reopened: Refuse reads "${lit[0].text}" pressed ${lit[0].pressed}`)
  const q3 = await tapRead(T('decide-refuse'), 's11-3-backtowaiting-q')
  await shot('s11-4-backtowaiting-settled')
  const b3 = await M.bub(P)
  const apW = await H.rowCell(P, `avail-p-${D}`)
  say(`11 the lit Refuse tapped again (back to waiting): Available P ${apW.text} (${H.levelOf(apW)}); bubble right after: ${M.bubLine(q3)}; settled: ${M.bubLine(b3)}`)
  say('11 the cell: ' + (await M.cellWords(P, ids.Drifter, D)).boxes.join(' ; '))
  judge(H.levelOf(apW) === 'red' && !!q3 && /^This bid: Available P \d+ → \d+$/.test(q3.label || '') && M.isRed(q3), `11 the bubble comes as the window closes (bubble ${q3 ? '"' + q3.label + '", ' + q3.level : 'ABSENT'}; Available P ${apW.text} ${H.levelOf(apW)})`)
  await dismiss()

  // 12: Undo then Redo of a bid that turned a row red (a fresh man, a fresh red day)
  const D2 = '2026-12-22'
  const f2 = await M.f1(w, D2)
  say(`12 fixture: Required P ${f2.req}, Available P ${f2.cell.text} (${f2.level})`)
  await M.foldRows(w)
  const q4 = await placeLL(ids.Drifter, D2, 's12-1-bid')
  say('12 the bid: ' + M.bubLine(q4))
  await dismiss()
  await L.undo(w)
  const bU = await M.bub(P); await shot('s12-2-undo')
  const apU = await H.rowCell(P, `avail-p-${D2}`)
  say(`12 Undo: Available P ${apU.text} (${H.levelOf(apU)}); bubble ${M.bubLine(bU)}`)
  await L.redo(w)
  await P.waitForTimeout(100)
  const bR = await M.bub(P); await shot('s12-3-redo')
  await P.waitForTimeout(500)
  const bR2 = await M.bub(P)
  const apR = await H.rowCell(P, `avail-p-${D2}`)
  say(`12 Redo: Available P ${apR.text} (${H.levelOf(apR)}); bubble right after ${M.bubLine(bR)}; settled ${M.bubLine(bR2)}`)
  say(`12 RECORD: the bubble ${bR || bR2 ? 'COMES' : 'does not come'} on Redo (as built, the agent's reading: none)`)
}
console.log(`SUMMARY [phone/chromium]: ${lines.filter(l => /^(ok|WRONG)/.test(l)).length} judged, ${bad.length} wrong`)
for (const b of bad) console.log('   WRONG: ' + b)
console.log('errors:', JSON.stringify(w.errs))
await w.ctx.close(); await M.closeBrowser()
