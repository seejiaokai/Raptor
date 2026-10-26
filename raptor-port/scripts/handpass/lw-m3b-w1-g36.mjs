// W1 part g3 — scenarios 36, 31 and 39 (desktop 1536x864).
// 36: Ranger's "Wedding" (8 Dec) and "Moving" (9 Dec) and a third with no remark (10 Dec): a drag over the first two -> two grey lines with their
//     dates over an empty Remarks box; the no-remark entry not listed; type "Away" -> Approve -> both carry "Away", still separate; over one
//     entry the box shows its words (D1362).
// 31: a drag over a day holding a whole-day TRG under Unavailable -> LL: the bid is placed beside it, two entries (as a course).
// 39: the Legend: "Under Unavailable on the schedule" with the outlined box after Overseas duty; the Codes list all eight; no UNA anywhere.
// Usage (from raptor-port/): node scripts/handpass/lw-m3b-w1-g36.mjs
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const path = await import('node:path')
for (const p of ['s36-', 's31-', 's39-']) L.clearPrefix(p)
console.log('lw-m3b-w1-g36 desktop 1536x864 out', L.OUT)
const lines = [], bad = []
const say = s => { lines.push(s); console.log('   ' + s) }
const judge = (ok, s) => { if (!ok) bad.push(s); say((ok ? 'ok    ' : 'WRONG ') + s) }
const brief = c => (c?.boxes || []).map(b => b.split('|')[0] + '/' + b.split('|')[2] + '/' + b.split('|').pop()).join(' + ') || '(empty)'
const sc = async (id, fn) => { console.log(`-- ${id}`); try { await fn() } catch (e) { say(`${id} NOT DONE — ${String(e).slice(0, 400)}`) } }

/* ---------------- 36 ---------------- */
await sc('36', async () => {
  const w = await M.start('desk'); const P = w.page
  const who = 'bane'
  const A = '2026-12-08', B = '2026-12-09', C = '2026-12-10', D1 = '2026-12-14', D2 = '2026-12-15'
  for (const [d, words] of [[A, 'Wedding'], [B, 'Moving'], [C, null]]) {
    await L.openCellR(w, who, d); await P.waitForSelector(T('bid-picker')); await M.setSwitch(w, false)
    if (words) { await L.press(w, T('bid-remarks')); await P.keyboard.type(words); await P.waitForTimeout(150) }
    if (!(await L.placeLeave(w, 'LL'))) throw new Error('LL on ' + d + ' not placed')
  }
  // a two-day entry with one remark, by a drag
  if (!(await M.dragCells(w, [who, D1], [who, D2]))) throw new Error('no drag over the two-day entry')
  await M.setSwitch(w, false, 'sel'); await L.press(w, T('sel-remarks')); await P.keyboard.type('Family trip'); await P.waitForTimeout(150)
  await L.press(w, T('sel-LL')); await P.waitForTimeout(600); if (await L.vis(P, T('select-sheet'))) { await L.press(w, T('sel-LL')); await P.waitForTimeout(600) }
  const fx = {}; for (const d of [A, B, C, D1, D2]) fx[d.slice(5)] = await M.stateOf(P, who, d)
  say('36 fixture: ' + JSON.stringify(fx))
  const readList = () => P.evaluate(() => { const l = document.querySelector('[data-testid="sel-remarks-list"]'); const box = document.querySelector('[data-testid="sel-remarks"]'); return { lines: l ? [...l.children].map(e => e.innerText.replace(/\s+/g, ' ').trim()) : null, box: box ? box.value : null, ph: box ? box.placeholder : null, colors: l ? [...l.children].map(e => getComputedStyle(e).color) : null } })
  // a. over the first two
  if (!(await M.dragCells(w, [who, A], [who, B]))) throw new Error('no drag A..B')
  let r = await readList()
  say('36a over Wedding + Moving: list ' + JSON.stringify(r))
  await M.winPic(w, 's36-1-two-entries', { sel: T('select-sheet'), above: 0 })
  judge(!!r.lines && r.lines.length === 2 && /8 Dec/.test(r.lines[0]) && /Wedding/.test(r.lines[0]) && /9 Dec/.test(r.lines[1]) && /Moving/.test(r.lines[1]) && r.box === '', `36a two grey lines with their dates over an empty Remarks box: ${JSON.stringify(r.lines)}, box "${r.box}"`)
  await L.closeAny(w)
  // b. over all three: the no-remark entry is not listed
  if (!(await M.dragCells(w, [who, A], [who, C]))) throw new Error('no drag A..C')
  r = await readList()
  say('36b over Wedding + Moving + (no remark): list ' + JSON.stringify(r))
  await M.winPic(w, 's36-2-three-entries', { sel: T('select-sheet'), above: 0 })
  judge(!!r.lines && r.lines.length === 2 && !r.lines.some(l => /10 Dec/.test(l)) && r.box === '', `36b the entry with no remark is not listed: ${JSON.stringify(r.lines)}`)
  await L.closeAny(w)
  // c. over the first two again: type Away, Approve
  if (!(await M.dragCells(w, [who, A], [who, B]))) throw new Error('no drag A..B (2)')
  await L.press(w, T('sel-remarks')); await P.keyboard.type('Away'); await P.waitForTimeout(150)
  const typed = await readList()
  say('36c typed "Away": ' + JSON.stringify(typed))
  await M.tapQ(w, T('sel-approve'), 's36-3-approve-q', { sel: T('select-sheet'), above: 0 })
  await P.waitForTimeout(800)
  say('36c windows after Approve: ' + JSON.stringify(await M.anyWindowOpen(P)))
  const cells = {}; for (const d of [A, B, C]) cells[d.slice(5)] = brief(await M.cellWords(P, who, d))
  say('36c cells: ' + JSON.stringify(cells))
  const inp = await P.evaluate(() => (window.INPUTS || []).filter(r => (r.people || []).some(x => x.p === 'bane') && /^(LL|OL|Leave|Local)/i.test(String(r.type)) || (r.remarks === 'Away')).map(r => ({ type: r.type, date: r.date, endDate: r.endDate, rmk: r.remarks, lw: r.lw })))
  say('36c the approved leave in the inputs: ' + JSON.stringify(inp.filter(i => i.rmk === 'Away')))
  const away = inp.filter(i => i.rmk === 'Away')
  judge(away.length >= 1 && /8 Dec|Dec 8/.test(JSON.stringify(away)), `36c after Approve both days carry "Away": ${JSON.stringify(away)}`)
  say(`36c RECORD: the two approved days are ${away.length === 2 ? 'TWO separate inputs (still separate)' : away.length === 1 ? 'ONE input ' + JSON.stringify(away[0]) + ' (they became one leave — D1346 says two next-door bids with one remark become one leave when approved)' : away.length + ' inputs'}`)
  await M.rangeShot(w, who, A, C, 's36-4-after-approve', 12)
  await L.closeAny(w)
  // d. over one two-day entry: the box shows its words
  if (!(await M.dragCells(w, [who, D1], [who, D2]))) throw new Error('no drag D1..D2')
  r = await readList()
  say('36d over the one entry (14–15 Dec): list ' + JSON.stringify(r))
  await M.winPic(w, 's36-5-one-entry', { sel: T('select-sheet'), above: 0 })
  judge(r.box === 'Family trip' && (!r.lines || r.lines.length === 0), `36d over one entry the box shows its words ("${r.box}") and no list (${JSON.stringify(r.lines)})`)
  await L.closeAny(w)
  console.log('   errors:', JSON.stringify(w.errs)); await w.ctx.close()
})

/* ---------------- 31 ---------------- */
await sc('31', async () => {
  const w = await M.start('desk'); const P = w.page
  const who = 'bane', A = '2026-07-15', B = '2026-07-16'
  const fx = await M.buildTrgUnavail(w, { iso: A, remarks: 'Sim refresher' })
  say('31 fixture: ' + JSON.stringify(fx))
  await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(1200)
  await L.reachCell(w, who, A)
  say('31 before: ' + A + ' ' + brief(await M.cellWords(P, who, A)) + '; ' + B + ' ' + brief(await M.cellWords(P, who, B)))
  const open = await M.dragCells(w, [who, A], [who, B])
  say('31 the drag over a TRG day and the next opened the drag window: ' + open)
  say('31 the drag window reads: ' + (await L.txt(P, T('select-sheet'))).slice(0, 250))
  await M.setSwitch(w, false, 'sel')
  await M.winPic(w, 's31-1-drag-window', { sel: T('select-sheet'), above: 0 })
  await L.press(w, T('sel-LL')); await P.waitForTimeout(800)
  if (await L.vis(P, T('select-sheet'))) { say('31 the window stayed open after the first LL tap: "' + (await L.txt(P, T('sel-note'))) + '"'); await L.press(w, T('sel-LL')); await P.waitForTimeout(800) }
  say('31 windows after: ' + JSON.stringify(await M.anyWindowOpen(P)) + '; note: ' + (await L.txt(P, T('sel-note'))))
  const ca = await M.cellWords(P, who, A), cb = await M.cellWords(P, who, B)
  say(`31 after: ${A} ${brief(ca)}; ${B} ${brief(cb)}; records ${await M.stateOf(P, who, A)} | ${await M.stateOf(P, who, B)}`)
  await M.rangeShot(w, who, A, B, 's31-2-after', 14)
  const inp = await P.evaluate(() => (window.INPUTS || []).filter(r => r.remarks === 'Sim refresher').map(r => ({ type: r.type, acc: r.acc })))
  say('31 the Training still: ' + JSON.stringify(inp))
  judge((ca?.boxes || []).length === 2 && (ca.boxes.some(b => /^TRG\|/.test(b)) && ca.boxes.some(b => /^LL\|/.test(b))), `31 the bid is placed beside the TRG: two entries on ${A}: ${brief(ca)}`)
  judge(inp.length === 1 && inp[0].acc === 'u', '31 the Training stays under Unavailable')
  console.log('   errors:', JSON.stringify(w.errs)); await w.ctx.close()
})

/* ---------------- 39 ---------------- */
await sc('39', async () => {
  const w = await M.start('desk'); const P = w.page
  await L.press(w, 'button:has-text("Legend")'); await P.waitForTimeout(800)
  const info = await P.evaluate(() => {
    const bar = document.querySelector('.lw-gridbar')
    const el = [...bar.querySelectorAll('*')].filter(e => { const cs = getComputedStyle(e); return (cs.overflowY === 'auto' || cs.overflowY === 'scroll') && e.scrollHeight > e.clientHeight }).sort((a, b) => b.scrollHeight - a.scrollHeight)[0] || [...bar.querySelectorAll('*')].find(e => /WHAT THE GRID IS TELLING YOU/i.test(e.innerText || '') && e.children.length > 3)
    const r = el.getBoundingClientRect()
    el.setAttribute('data-legendbox', '1')
    return { rect: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }, scrollH: el.scrollHeight, clientH: el.clientHeight, text: el.innerText.replace(/\s+/g, ' '), cls: el.className.toString().slice(0, 50) }
  })
  say(`39 the Legend popover: ${info.rect.w}x${info.rect.h} at ${info.rect.x},${info.rect.y}, content ${info.scrollH}px tall in ${info.clientH}px`)
  const t = info.text
  const idx = s => t.indexOf(s)
  const colourPart = t.slice(idx('THE COLOUR'), idx('THE FILL'))
  say('39 the colour part reads: ' + colourPart)
  const iOD = colourPart.indexOf('Overseas duty'), iUnav = colourPart.indexOf('Under Unavailable on the schedule'), iMed = colourPart.indexOf('Medical')
  judge(iUnav > iOD && iUnav < iMed && /Under Unavailable on the schedule/.test(colourPart), `39 "Under Unavailable on the schedule" stands after Overseas duty and before Medical: ${colourPart.slice(iOD, iMed + 8)}`)
  await P.screenshot({ path: path.join(L.OUT, 's39-1-legend-colour.png'), clip: { x: info.rect.x, y: info.rect.y, width: info.rect.w, height: Math.min(info.rect.h, 640) }, scale: 'css' })
  // the box drawn in the Legend after Overseas duty
  const lbox = await P.evaluate(() => { const rows = [...document.querySelectorAll('[data-legendbox="1"] *')].filter(e => /Under Unavailable on the schedule/.test(e.textContent) && e.children.length <= 3 && e.getBoundingClientRect().height > 0 && e.getBoundingClientRect().height < 60).slice(0, 1); const row = rows[0]; if (!row) return null; const c = row.parentElement.querySelector('.c, .leg-box'); const box = row.querySelector('.c') || row.parentElement.querySelector('.c'); const cs = box ? getComputedStyle(box) : null; return box ? { text: box.textContent, cls: box.className.toString(), shadow: cs.boxShadow, bg: cs.backgroundColor } : { none: true, html: row.outerHTML.slice(0, 200) } })
  say('39 the Legend box beside it: ' + JSON.stringify(lbox))
  // scroll to the end for the Codes
  await P.evaluate(() => { const e = document.querySelector('[data-legendbox="1"]'); e.scrollTop = e.scrollHeight }); await P.waitForTimeout(400)
  await P.screenshot({ path: path.join(L.OUT, 's39-2-legend-codes.png'), clip: { x: info.rect.x, y: info.rect.y, width: info.rect.w, height: info.rect.h }, scale: 'css' })
  const codesPart = t.slice(idx('UNDER UNAVAILABLE ON THE SCHEDULE'))
  const need = ['OTH', 'ATCH', 'TRG', 'MTG', 'PERS', 'APPT', 'DTY', 'EVT']
  const missing = need.filter(c => !new RegExp('\\b' + c + '\\b').test(codesPart))
  say('39 the Codes group reads: ' + codesPart)
  judge(missing.length === 0, `39 the Codes list holds all eight (OTH ATCH TRG MTG PERS APPT DTY EVT): missing ${JSON.stringify(missing)}`)
  const una = t.match(/\bUNA\b/g)
  judge(!una, `39 no UNA anywhere in the Legend and Codes: ${una ? una.length + ' found' : 'none'}`)
  // and anywhere on the war page
  const pageUna = await P.evaluate(() => (document.querySelector('#page-leavewar').innerText.match(/\bUNA\b/g) || []).length)
  say('39 "UNA" as a word on the whole Leave War page: ' + pageUna)
  console.log('   errors:', JSON.stringify(w.errs)); await w.ctx.close()
})
console.log(`SUMMARY [desktop]: ${lines.filter(l => /^(ok|WRONG)/.test(l)).length} judged, ${bad.length} wrong`)
for (const x of bad) console.log('   WRONG: ' + x)
await M.closeBrowser()
