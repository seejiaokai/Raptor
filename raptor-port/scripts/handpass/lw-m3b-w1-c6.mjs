// W1 part c6 — scenario 6 (phone, Chromium): words typed in the one-day window go on THEIR half's bid only.
// Case A (the fault as met, INC-1): a held MORNING bid "Am"; PM pressed, "Pm" typed, OL placed -> the morning keeps "Am".
// Case B (the designer's mirror): a held AFTERNOON bid "Gym"; AM pressed, "Dentist" typed, LL placed -> the afternoon keeps "Gym".
// Usage (from raptor-port/): node scripts/handpass/lw-m3b-w1-c6.mjs
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
L.clearPrefix('s6-')
console.log('lw-m3b-w1-c6 phone/chromium out', L.OUT)
const w = await M.start('phone')
const P = w.page
console.log('page scripts:', await M.scriptCheck(w))
const lines = [], bad = []
const say = s => { lines.push(s); console.log('   ' + s) }
const judge = (ok, s) => { if (!ok) bad.push(s); say((ok ? 'ok    ' : 'WRONG ') + s) }
const recDump = async d => (await M.reqOf(P, 'bane', d)).map(r => ({ code: r.code, portion: r.code.startsWith('*') ? 'AM' : r.code.endsWith('*') ? 'PM' : 'whole', state: r.state, remarks: r.remarks ?? '' }))
const boxVal = () => P.locator(T('bid-remarks')).inputValue()
const lit = () => P.evaluate(() => ['full', 'am', 'pm'].filter(p => { const e = document.querySelector(`[data-testid="portion-${p}"]`); return e && (e.getAttribute('aria-pressed') === 'true' || /\blit\b|\bon\b|\bsel\b|\bactive\b/.test(e.className)) }).join(','))
const listBoxes = () => P.evaluate(() => [...document.querySelectorAll('[data-testid^="dl-"][data-testid$="-remarks"]')].map(e => { let c = e.parentElement; while (c && !/Morning|Afternoon|Whole day/.test(c.innerText || '')) c = c.parentElement; return ((c?.innerText || '').match(/Morning|Afternoon|Whole day/) || ['?'])[0] + ' = "' + e.value + '"' }))

async function place(d, portion, type, words) {
  await L.openCellR(w, 'bane', d); await P.waitForSelector(T('bid-picker'))
  await M.setSwitch(w, false)
  await L.press(w, T(`portion-${portion}`))
  if (words) { await L.press(w, T('bid-remarks')); await P.keyboard.type(words); await P.waitForTimeout(200) }
  return L.placeLeave(w, type)
}
/* ---- Case A ---- */
{
  const d = '2026-11-24'
  say('A fixture: AM LL "Am" placed ' + await place(d, 'am', 'LL', 'Am'))
  say('A records: ' + JSON.stringify(await recDump(d)))
  await L.openCellR(w, 'bane', d); await P.waitForSelector(T('bid-picker')); await P.waitForTimeout(400)
  say(`A the tap opens the window with Duration lit [${await lit()}], Remarks box "${await boxVal()}"`)
  await M.winPic(w, 's6-1-A-opened')
  await L.press(w, T('portion-pm')); await P.waitForTimeout(400)
  const v = await boxVal()
  say(`A PM pressed: Duration lit [${await lit()}], Remarks box "${v}"`)
  judge(v === '', `A the box does not speak for the held morning bid once PM is pressed (it reads "${v}")`)
  await M.winPic(w, 's6-2-A-pm-pressed')
  await L.press(w, T('bid-remarks')); await P.keyboard.type('Pm'); await P.waitForTimeout(200)
  say(`A typed "Pm": box "${await boxVal()}"`)
  await M.winPic(w, 's6-3-A-typed')
  say('A OL placed on the afternoon: ' + await L.placeLeave(w, 'OL'))
  const rec = await recDump(d)
  say('A records after: ' + JSON.stringify(rec))
  const am = rec.find(r => r.portion === 'AM'), pm = rec.find(r => r.portion === 'PM')
  judge(!!am && !!pm && am.code === '*LL' && pm.code === 'OL*' && am.remarks === 'Am' && pm.remarks === 'Pm', `A the morning bid keeps "${am?.remarks}", the new afternoon bid carries "${pm?.remarks}" (wanted "Am" / "Pm")`)
  say('A cell: ' + (await M.cellWords(P, 'bane', d)).boxes.join(' ; '))
  await L.openCellR(w, 'bane', d); await P.waitForSelector(T('daylist'), { timeout: 5000 }).catch(() => {})
  say('A the day list\'s boxes: ' + JSON.stringify(await listBoxes()))
  await M.winPic(w, 's6-4-A-list', { sel: T('daylist'), above: 175 })
  await L.closeAny(w)
}
/* ---- Case B ---- */
{
  const d = '2026-11-25'
  say('B fixture: PM LL "Gym" placed ' + await place(d, 'pm', 'LL', 'Gym'))
  say('B records: ' + JSON.stringify(await recDump(d)))
  await L.openCellR(w, 'bane', d); await P.waitForSelector(T('bid-picker')); await P.waitForTimeout(400)
  say(`B the tap opens the window with Duration lit [${await lit()}], Remarks box "${await boxVal()}", held-half line "${await L.txt(P, T('bid-heldhalf'))}"  (the designer expected: opens on the morning)`)
  await M.winPic(w, 's6-5-B-opened')
  await L.press(w, T('portion-am')); await P.waitForTimeout(400)
  const v = await boxVal()
  say(`B AM pressed: Duration lit [${await lit()}], Remarks box "${v}"`)
  judge(v === '', `B the box does not speak for the held afternoon bid once AM is pressed (it reads "${v}")`)
  await M.winPic(w, 's6-6-B-am-pressed')
  await L.press(w, T('bid-remarks')); await P.keyboard.type('Dentist'); await P.waitForTimeout(200)
  await M.winPic(w, 's6-7-B-typed')
  say('B LL placed on the morning: ' + await L.placeLeave(w, 'LL'))
  const rec = await recDump(d)
  say('B records after: ' + JSON.stringify(rec))
  const dentist = rec.filter(r => r.remarks === 'Dentist'), gym = rec.filter(r => r.remarks === 'Gym')
  judge(rec.length === 2 && dentist.length === 1 && gym.length === 1 && dentist[0].portion === 'AM' && gym[0].portion === 'PM', `B "Dentist" on the ${dentist[0]?.portion} bid, "Gym" on the ${gym[0]?.portion} bid; ${rec.length} bids (wanted AM / PM)`)
  say('B cell: ' + (await M.cellWords(P, 'bane', d)).boxes.join(' ; '))
  await L.openCellR(w, 'bane', d); await P.waitForSelector(T('daylist'), { timeout: 5000 }).catch(() => {})
  say('B the day list\'s boxes: ' + JSON.stringify(await listBoxes()))
  await M.winPic(w, 's6-8-B-list', { sel: T('daylist'), above: 175 })
  await L.closeAny(w)
}
console.log(`SUMMARY [phone/chromium]: ${lines.filter(l => /^(ok|WRONG)/.test(l)).length} judged, ${bad.length} wrong`)
for (const b of bad) console.log('   WRONG: ' + b)
console.log('errors:', JSON.stringify(w.errs))
await w.ctx.close(); await M.closeBrowser()
