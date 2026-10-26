// W1 part f2 — scenarios 29 and A1 (phone, Chromium).
// 29: ⋯ -> Other on a Saturday (and on a public holiday): the OIL question opens once it is filed; answer Yes; nothing doubled.
// A1: admin, a free day of Drifter -> ⋯ (reads Attach, Other, Post out, Post in) -> Duration PM, Remarks "Exercise" -> Attach: the window
//     closes; an afternoon ATCH outlined; Available -0.5; on the Inputs page an Attach under Unavailable, PM, "Exercise", no "To" (D1378, D1380).
// Usage (from raptor-port/): node scripts/handpass/lw-m3b-w1-f29a1.mjs
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const path = await import('node:path')
for (const p of ['s29-', 'a1-']) L.clearPrefix(p)
console.log('lw-m3b-w1-f29a1 phone/chromium out', L.OUT)
const w = await M.start('phone')
const P = w.page
console.log('page scripts:', await M.scriptCheck(w))
const lines = [], bad = []
const say = s => { lines.push(s); console.log('   ' + s) }
const judge = (ok, s) => { if (!ok) bad.push(s); say((ok ? 'ok    ' : 'WRONG ') + s) }
const shot = async name => { await P.screenshot({ path: path.join(L.OUT, name + '.png'), scale: 'css' }); return name + '.png' }
const ids = await M.ids(P)
const brief = c => (c?.boxes || []).map(b => b.split('|')[0] + '/' + b.split('|').pop()).join(' + ') || '(empty)'
const othersOf = (who, date) => P.evaluate(([who, date]) => (window.INPUTS || []).filter(r => r.date === date && (r.people || []).some(x => x.p === who)).map(r => ({ type: r.type, acc: r.acc, rmk: r.remarks, allday: r.allday, half: r.half, to: r.to, oil: r.oil })), [who, date])

/* ---------------- 29: a Saturday, and a public holiday ---------------- */
for (const [label, iso, inputDate] of [['Saturday', '2026-11-14', 'Nov 14'], ['public holiday', '2026-12-25', 'Dec 25']]) {
  const tag = label === 'Saturday' ? 'sat' : 'ph'
  const a0 = await M.availP(w, iso)
  await L.openCellR(w, 'bane', iso); await P.waitForSelector(T('bid-picker'))
  await L.press(w, T('bid-more')); await P.waitForSelector(T('bid-more-menu'))
  await M.tapQ(w, T('bid-file-OTH'), `s29-${tag}-1-other-q`)
  await P.waitForTimeout(900)
  const open1 = await L.vis(P, T('oilconf'))
  const text = open1 ? await L.txt(P, T('oilconf')) : null
  say(`29 ${label} ${iso}: the OIL question is ${open1 ? 'open' : 'NOT open'}: "${text}"`)
  const count = await P.locator(T('oilconf')).count()
  say(`29 ${label}: OIL question windows on the page: ${count}; other windows: ${JSON.stringify(await M.anyWindowOpen(P))}`)
  await shot(`s29-${tag}-2-question`)
  judge(open1 && count === 1 && /FO|OIL/.test(text || ''), `29 ${label}: the OIL question opens once, in one window ("${(text || '').slice(0, 120)}")`)
  if (open1) {
    await M.tapQ(w, T('oil-yes'), `s29-${tag}-3-yes-q`)
    await P.waitForTimeout(300)
    await shot(`s29-${tag}-3b-yes-settled`)
    await L.press(w, T('oilconf-save')); await P.waitForTimeout(1000)
  }
  say(`29 ${label}: after Yes + Save the windows open: ${JSON.stringify(await M.anyWindowOpen(P))}; OIL question ${(await L.vis(P, T('oilconf'))) ? 'STILL OPEN' : 'closed'}; input window ${(await L.vis(P, T('inped-placed'))) ? 'STILL OPEN' : 'closed'}`)
  if (await L.vis(P, T('inped-placed'))) { await P.keyboard.press('Escape'); await P.waitForTimeout(400) }
  await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(800)
  await L.reachCell(w, 'bane', iso)
  const cell = await M.cellWords(P, 'bane', iso)
  const inps = await othersOf('bane', inputDate)
  const a1 = await M.availP(w, iso)
  say(`29 ${label}: cell ${brief(cell)}; inputs of Ranger that day ${JSON.stringify(inps)}; Available P ${a0} -> ${a1}`)
  await L.cellShot(w, 'bane', iso, `s29-${tag}-4-cell`)
  const oths = inps.filter(i => i.type === 'Other')
  judge(oths.length === 1 && oths[0].acc === 'u', `29 ${label}: one Other input, under Unavailable (not doubled): ${JSON.stringify(oths)}`)
  const boxes = (cell?.boxes || [])
  judge(boxes.filter(b => /^OTH\|/.test(b)).length === 1, `29 ${label}: one OTH box on the war: ${brief(cell)}`)
  judge(Number(a0) - Number(a1) === 1, `29 ${label}: Available P ${a0} -> ${a1} (one man out, counted once)`)
  // the OIL credit: where it shows
  const oilBoxes = boxes.filter(b => /^(FO|HO)/.test(b))
  say(`29 ${label}: OIL credit on the war cell: ${oilBoxes.length ? brief({ boxes: oilBoxes }) : 'none drawn (OIL credits for a work day come from the PUBLISHED schedule; an Other filed from the war earns after it is published/acknowledged)'}`)
}

/* ---------------- A1 ---------------- */
{
  const iso = '2026-11-17'
  const who = ids.Drifter
  const a0 = await M.availP(w, iso)
  await L.openCellR(w, who, iso); await P.waitForSelector(T('bid-picker'))
  await L.press(w, T('portion-pm'))
  await L.press(w, T('bid-remarks')); await P.keyboard.type('Exercise'); await P.waitForTimeout(200)
  await L.press(w, T('bid-more')); await P.waitForSelector(T('bid-more-menu'))
  const items = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-more-menu"] [role="menuitem"], [data-testid="bid-more-menu"] button')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.textContent.trim()))
  say('A1 the ⋯ reads: ' + items.join(' · '))
  await M.winPic(w, 'a1-1-more-open')
  judge(items.join('|') === 'Attach|Other|Post out|Post in', `A1 the ⋯ reads Attach, Other, Post out, Post in: ${items.join(', ')}`)
  await M.tapQ(w, T('bid-file-ATCH'), 'a1-2-attach-q')
  await P.waitForTimeout(700)
  const wins = await M.anyWindowOpen(P)
  say('A1 after Attach: windows open ' + JSON.stringify(wins))
  const cell = await M.cellWords(P, who, iso)
  const a1 = await M.availP(w, iso)
  say(`A1 cell ${brief(cell)}; Available P ${a0} -> ${a1}`)
  await L.cellShot(w, who, iso, 'a1-3-cell')
  const ci = await L.cellInfo(P, who, iso); const b0 = ci.boxes[0]
  say('A1 the box drawing (computed): fill ' + b0.bg + '; edge ' + b0.bs + '; words ' + b0.color + ' font ' + b0.fs)
  const inps = await othersOf(who, 'Nov 17')
  say('A1 the input as stored: ' + JSON.stringify(inps))
  judge(wins.length === 0, 'A1 the window closes')
  judge(/^ATCH\|/.test((cell?.boxes || [])[0] || '') && /\|bot$/.test((cell?.boxes || [])[0] || ''), `A1 an afternoon ATCH box in the bottom half: ${brief(cell)}`)
  judge(/inset/.test(b0.bs), `A1 the ATCH box is outlined (an inset edge): ${b0.bs}`)
  judge(Number(a0) - Number(a1) === 0.5, `A1 Available P ${a0} -> ${a1} (−0.5)`)
  judge(inps.length === 1 && inps[0].type === 'Attach' && inps[0].acc === 'u' && inps[0].half === 'pm' && inps[0].rmk === 'Exercise' && !inps[0].to, `A1 one Attach input, under Unavailable, the afternoon, "Exercise", no To: ${JSON.stringify(inps)}`)
  // the Inputs page
  await L.inputsList(w); await P.waitForTimeout(600)
  const row = P.locator('[data-testid^="inl-row-"]').filter({ hasText: /Drifter/ }).filter({ hasText: /Attach/i }).filter({ hasText: /Exercise/ }).first()
  if (await row.count()) {
    await row.scrollIntoViewIfNeeded(); await P.waitForTimeout(300)
    const rt = (await row.innerText()).replace(/\s+/g, ' ')
    const bb = await row.boundingBox()
    await P.screenshot({ path: path.join(L.OUT, 'a1-4-inputs-row.png'), clip: { x: 0, y: Math.max(0, bb.y - 50), width: 402, height: Math.min(874 - Math.max(0, bb.y - 50), bb.height + 80) }, scale: 'css' })
    say('A1 the Inputs row reads: ' + rt)
    judge(/PM/.test(rt) && /Exercise/.test(rt) && !/145|Sqn/.test(rt), `A1 the Inputs page shows an Attach, PM, "Exercise", no "To": ${rt}`)
    await row.click(); await P.waitForSelector(T('win-inputedit'), { timeout: 5000 }).catch(() => {})
    await P.waitForTimeout(700)
    const goes = await M.btnState(P, ['inpEdit-goes-g', 'inpEdit-goes-u'])
    const type = await P.locator('#inpEditType').inputValue().catch(() => null)
    const to = await P.locator('#inpEditTo').inputValue().catch(() => null)
    say(`A1 the input window: Type "${type}", To box ${to === null ? 'not drawn' : '"' + to + '"'}, Goes to ${goes.map(b => b.there ? b.text + ' ' + b.pressed : 'not drawn').join(' | ')}`)
    await shot('a1-5-input-window')
    judge(type === 'Attach' && (to === '' || to === null), `A1 the window reads Attach with an empty To (${to === null ? 'box not drawn' : 'box empty'})`)
    const cancel = P.locator('#inpEditCancel'); if (await cancel.count()) await cancel.click().catch(() => {}); else await P.keyboard.press('Escape')
  } else judge(false, 'A1 the Inputs row for the Attach was not found')
}
console.log(`SUMMARY [phone/chromium]: ${lines.filter(l => /^(ok|WRONG)/.test(l)).length} judged, ${bad.length} wrong`)
for (const x of bad) console.log('   WRONG: ' + x)
console.log('errors:', JSON.stringify(w.errs))
await w.ctx.close(); await M.closeBrowser()
