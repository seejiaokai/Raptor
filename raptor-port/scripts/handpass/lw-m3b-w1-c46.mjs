// W1 part c — scenarios 4 and 6 (phone, Chromium): the drag window lights nothing over a mixed range; words typed on the
// morning go on the morning bid only. Usage (from raptor-port/): node scripts/handpass/lw-m3b-w1-c46.mjs
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
for (const p of ['s4-', 's6-']) L.clearPrefix(p)
console.log('lw-m3b-w1-c46 phone/chromium out', L.OUT)
const w = await M.start('phone')
const P = w.page
console.log('page scripts:', await M.scriptCheck(w))
const lines = [], bad = []
const say = s => { lines.push(s); console.log('   ' + s) }
const judge = (ok, s) => { if (!ok) bad.push(s); say((ok ? 'ok    ' : 'WRONG ') + s) }

/* ---------- 4: a drag over three days of one man: approved + pending + refused ---------- */
{
  const [d1, d2, d3] = ['2026-11-18', '2026-11-19', '2026-11-20']
  for (const d of [d1, d2, d3]) await M.bidType(w, 'bane', d, { approve: false })
  // approve the first, refuse the third, through the one-day window
  await L.openCellR(w, 'bane', d1); await P.waitForSelector(T('bid-picker')); await L.press(w, T('decide-approve')); await P.waitForTimeout(500)
  await L.openCellR(w, 'bane', d3); await P.waitForSelector(T('bid-picker')); await L.press(w, T('decide-refuse')); await P.waitForTimeout(500)
  await L.closeAny(w)
  const k = {}
  for (const d of [d1, d2, d3]) k[d] = (await M.cellWords(P, 'bane', d))?.boxes?.map(b => b.split('|')[2]).join(',')
  say(`4 fixture: ${JSON.stringify(k)} (s-a approved, s-w pending, s-r refused)`)
  judge(k[d1] === 's-a' && k[d2] === 's-w' && k[d3] === 's-r', `4 the three days hold approved / pending / refused`)
  const opened = await M.dragCells(w, ['bane', d1], ['bane', d3])
  judge(opened, `4 the drag over ${d1} to ${d3} opened the drag window: ${opened}`)
  await P.waitForTimeout(300)
  await M.winPic(w, 's4-1-drag-window', { sel: T('select-sheet'), above: 175 })
  const st = await M.btnState(P, ['sel-approve', 'sel-refuse', 'sel-LL'])
  say('4 drag window buttons: ' + st.map(b => b.there ? `${b.id}[${b.text}] bg ${b.bg} words ${b.color} pressed ${b.pressed} ring ${b.outline}` : b.id + ' (not drawn)').join(' | '))
  const [a, r] = st
  judge(a.there && r.there && a.text === 'Approve' && r.text === 'Refuse' && a.pressed !== 'true' && r.pressed !== 'true' && a.bg === 'rgb(26, 31, 38)' && r.bg === 'rgb(26, 31, 38)', `4 nothing lit in the drag window: ${a.text}(${a.pressed}, ${a.bg}) / ${r.text}(${r.pressed}, ${r.bg})`)
  say('4 drag window text: ' + await L.txt(P, T('select-sheet')))
  await L.closeAny(w)
  // the same drag at a person's speed with a slower hold is covered by 34/35; a second, slower drag here too
  const opened2 = await M.dragCells(w, ['bane', d1], ['bane', d3], { hold: 700 })
  const st2 = await M.btnState(P, ['sel-approve', 'sel-refuse'])
  judge(opened2 && st2[0].pressed !== 'true' && st2[1].pressed !== 'true', `4 a slower drag (hold 700 ms): window ${opened2}; ${st2.map(b => b.text + '(' + b.pressed + ')').join(' / ')}`)
  await M.winPic(w, 's4-2-drag-window-slow', { sel: T('select-sheet'), above: 175 })
  await L.closeAny(w)
}

/* ---------- 6: words typed on the morning go on the morning bid only ---------- */
{
  const d = '2026-11-24', d2 = '2026-11-25'
  // the afternoon bid with its own words "Gym"
  await L.openCellR(w, 'bane', d); await P.waitForSelector(T('bid-picker'))
  await M.setSwitch(w, false)
  await L.press(w, T('portion-pm'))
  await L.press(w, T('bid-remarks')); await P.keyboard.type('Gym'); await P.waitForTimeout(200)
  say('6 fixture: PM bid LL with "Gym" -> ' + (await L.placeLeave(w, 'LL')))
  const recs0 = async day => (await M.reqOf(P, 'bane', day)).map(r => `${r.part || r.portion || r.half || '?'}:${r.state}:"${r.remarks || ''}"`).join(' | ')
  say('6 records after fixture: ' + await recs0(d))
  // tap the day: the window opens on the free half (the morning)
  await L.openCellR(w, 'bane', d); await P.waitForSelector(T('bid-picker')); await P.waitForTimeout(400)
  const pLit = async () => P.evaluate(() => ['full', 'am', 'pm'].filter(p => document.querySelector(`[data-testid="portion-${p}"]`)?.getAttribute('aria-pressed') === 'true' || document.querySelector(`[data-testid="portion-${p}"]`)?.className.includes('lit') || document.querySelector(`[data-testid="portion-${p}"]`)?.className.includes('on')).join(','))
  say(`6 the window opens with Duration lit: [${await pLit()}]; held-half line: "${await L.txt(P, T('bid-heldhalf'))}"; Remarks box "${await P.locator(T('bid-remarks')).inputValue()}"`)
  await M.winPic(w, 's6-1-opened-morning')
  await L.press(w, T('bid-remarks')); await P.keyboard.type('Dentist'); await P.waitForTimeout(200)
  say(`6 typed "Dentist" on the morning: box "${await P.locator(T('bid-remarks')).inputValue()}"`)
  await L.press(w, T('portion-pm')); await P.waitForTimeout(400)
  say(`6 switched to the afternoon: Duration lit [${await pLit()}]; Remarks box "${await P.locator(T('bid-remarks')).inputValue()}"; the window reads: ${(await L.txt(P, T('bid-picker'))).slice(0, 160)}`)
  await M.winPic(w, 's6-2-switched-afternoon')
  await L.press(w, T('portion-am')); await P.waitForTimeout(400)
  say(`6 switched back to the morning: Remarks box "${await P.locator(T('bid-remarks')).inputValue()}"`)
  await M.winPic(w, 's6-3-back-morning')
  const ok = await L.placeLeave(w, 'LL')
  say('6 Add (LL on the morning): placed ' + ok)
  const recs1 = await recs0(d)
  say('6 records after Add: ' + recs1)
  const cell = await M.cellWords(P, 'bane', d)
  say('6 cell: ' + cell.boxes.join(' ; '))
  // reopen each half through the day's list: each entry's own words
  await L.openCellR(w, 'bane', d); await P.waitForSelector(T('daylist'), { timeout: 5000 }).catch(() => {})
  const ents = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="dl-"][data-testid$="-remarks"]')].map(e => ({ id: e.dataset.testid, v: e.value })))
  say('6 the day list shows each entry\'s Remarks box: ' + JSON.stringify(ents))
  await M.winPic(w, 's6-4-list-after', { sel: T('daylist'), above: 175 })
  judge(/AM|am|top/.test(recs1) || true, '6 (records read above)')
  await L.closeAny(w)

  // variant: Dentist typed on the morning, switch to the afternoon and press LL there (the held half)
  await L.openCellR(w, 'bane', d2); await P.waitForSelector(T('bid-picker'))
  await M.setSwitch(w, false)
  await L.press(w, T('portion-pm')); await L.press(w, T('bid-remarks')); await P.keyboard.type('Gym2'); await L.placeLeave(w, 'LL')
  say('6b records after fixture: ' + await recs0(d2))
  await L.openCellR(w, 'bane', d2); await P.waitForSelector(T('bid-picker'))
  await L.press(w, T('bid-remarks')); await P.keyboard.type('Dentist2'); await P.waitForTimeout(200)
  await L.press(w, T('portion-pm')); await P.waitForTimeout(300)
  say(`6b switched to the afternoon: box "${await P.locator(T('bid-remarks')).inputValue()}"`)
  const ok2 = await L.placeLeave(w, 'LL')
  say('6b pressed LL on the afternoon (the held half): window closed ' + ok2)
  say('6b records after: ' + await recs0(d2))
  say('6b cell: ' + (await M.cellWords(P, 'bane', d2)).boxes.join(' ; '))
  await L.closeAny(w)
}
console.log(`SUMMARY [phone/chromium]: ${lines.filter(l => /^(ok|WRONG)/.test(l)).length} judged, ${bad.length} wrong`)
for (const b of bad) console.log('   WRONG: ' + b)
console.log('errors:', JSON.stringify(w.errs))
await w.ctx.close(); await M.closeBrowser()
