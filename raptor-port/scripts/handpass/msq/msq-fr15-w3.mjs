/* msq-fr15-w3 v1 — W3: words typed in the Leave War's drag window reach the leave's filer. FR15_VAR = a (default, W3) | b (W3b) | c (W3c: words = what the leave reads) | c0 (words box left empty). FR15_PHONE=1 for the iPhone. */
process.env.FR15_SC = 'w3' + (process.env.FR15_VAR || 'a')
const VAR = process.env.FR15_VAR || 'a'
const L = await import('./msq-fr15-lib.mjs')
const { X, say, sleep, row, tapIt, openAt, openInputs, inputRows, bell, closeBell, notices, size } = L
const P = L.phone ? 'phone' : 'desktop'
const pn = (s, what) => `${s}-${P}-${what}`
say('msq-fr15-w3 v1', VAR, size)
const w = await openAt('ad2')
const p = w.page
const T = id => p.locator(`[data-testid="${id}"]`).first()
const safe = async (l, fn) => { try { return await fn() } catch (e) { say('ERR', l, String(e.message).split('\n')[0]); await X.pic(w, 'err-' + l).catch(() => {}); row(l, size, 'script step', 'completes', 'script error ' + String(e.message).split('\n')[0], 'OWED', 'err-' + l + '.png') } }
const goJul = async () => { await X.L.go(p, 'leavewar'); await sleep(2600); await tapIt(T('month-JUL')); await sleep(1200) }
const HW = 'hunter words'
const cell = async iso => { const c = T('cell-bane-' + iso); await c.scrollIntoViewIfNeeded(); await sleep(300); return c }
await safe('W3-1', async () => {
  await goJul()
  await tapIt(T('open-chip')); await p.locator('[data-testid="open-dates"]').waitFor(); await sleep(600)
  await tapIt(T('od-month-2026-07')); await sleep(900)
  await tapIt(T('open-dates-close')); await sleep(900)
  await tapIt(await cell('2026-07-27')); await sleep(800)
  const tick = await T('bid-approve-tick').getAttribute('aria-checked')
  await p.locator('[data-testid="bid-remarks"]').first().fill(HW); await sleep(300)
  await X.pic(w, pn('s1', 'hunter-window'))
  await tapIt(T('bid-LL')); await sleep(110); await X.pic(w, pn('s1', 'hunter-LL-press')); await sleep(700)
  if (await p.locator('[data-testid="bid-picker"]:visible').count()) { await tapIt(T('bid-LL')); await sleep(800) }
  await X.pic(w, pn('s1', 'hunter-placed'))
  const txt = await (await cell('2026-07-27')).innerText()
  row('W3-1', size, 'Hunter opens July for bidding, places an approved LL for Ranger on 27 Jul (switch label on screen: "Auto-approve", on) with words "hunter words"', 'the leave is placed and approved', `switch aria-checked ${tick}; cell text "${txt.replace(/\s+/g, ' ')}"; window still open ${await p.locator('[data-testid="bid-picker"]:visible').count()}`, tick === 'true' && (await p.locator('[data-testid="bid-picker"]:visible').count()) === 0 ? 'PASS' : 'FAIL', pn('s1', 'hunter-placed') + '.png')
})
await safe('W3-2', async () => {
  await X.signOut(w); await X.login(p, 'us'); await goJul()
  await tapIt(await cell('2026-07-28')); await sleep(800)
  await X.pic(w, pn('s2', 'ranger-window'))
  await tapIt(T('bid-LL')); await sleep(110); await X.pic(w, pn('s2', 'ranger-LL-press')); await sleep(700)
  if (await p.locator('[data-testid="bid-picker"]:visible').count()) { await tapIt(T('bid-LL')); await sleep(800) }
  await X.pic(w, pn('s2', 'ranger-placed'))
  const txt = await (await cell('2026-07-28')).innerText()
  row('W3-2', size, 'Ranger signs in, places his own pending LL bid on 28 Jul', 'bid placed (window closes)', `cell text "${txt.replace(/\s+/g, ' ')}"; window open ${await p.locator('[data-testid="bid-picker"]:visible').count()}`, (await p.locator('[data-testid="bid-picker"]:visible').count()) === 0 ? 'PASS' : 'FAIL', pn('s2', 'ranger-placed') + '.png')
})
await safe('W3-3', async () => {
  await X.signOut(w); await X.login(p, 'ad'); await goJul()
  say('notices before saber', await notices(p))
  if (VAR === 'b') {
    await tapIt(await cell('2026-07-27')); await sleep(900)
    await X.pic(w, pn('s3', 'saber-27-window'))
    say('b window', await p.evaluate(() => [...document.querySelectorAll('[data-testid^="bid-"],[data-testid^="sel-"]')].filter(e => e.getBoundingClientRect().width > 1).map(e => e.dataset.testid + ':' + (e.value ?? '')).join(' ')))
    const rm = p.locator('[data-testid="bid-remarks"]:visible, [data-testid="sel-remarks"]:visible').first()
    await rm.fill('saber words b'); await sleep(300)
    await X.pic(w, pn('s3', 'saber-b-typed'))
    const x = p.locator('button:visible', { hasText: '✕' }).first()
    await tapIt(x); await sleep(110); await X.pic(w, pn('s3', 'saber-b-close-press')); await sleep(900)
    await X.pic(w, pn('s3', 'saber-b-closed'))
    return
  }
  const a = await cell('2026-07-27'), z = await cell('2026-07-28')
  const bA = await a.boundingBox(), bZ = await z.boundingBox()
  const A = { x: bA.x + bA.width / 2, y: bA.y + bA.height / 2 }, Zp = { x: bZ.x + bZ.width / 2, y: bZ.y + bZ.height / 2 }
  await p.mouse.move(A.x, A.y); await p.mouse.down(); await p.mouse.move(Zp.x, Zp.y, { steps: 10 }); await p.mouse.up(); await sleep(800)
  await X.pic(w, pn('s3', 'saber-drag-window'))
  const shown = await p.locator('[data-testid="select-sheet"]:visible').count()
  if (!shown) { row('W3-3', size, "Saber drag-selects Ranger's 27 and 28 Jul", 'drag window opens', 'no drag window (mouse drag on this size)', 'BLOCKED', pn('s3', 'saber-drag-window') + '.png'); throw new Error('no drag window') }
  const words = VAR === 'c' ? HW : VAR === 'c0' ? '' : 'saber words a'
  if (words) { await p.locator('[data-testid="sel-remarks"]').first().fill(words); await sleep(300) }
  await X.pic(w, pn('s3', 'saber-typed'))
  await tapIt(T('sel-approve')); await sleep(110); await X.pic(w, pn('s3', 'saber-approve-press')); await sleep(1000)
  if (await p.locator('[data-testid="select-sheet"]:visible').count()) { await X.pic(w, pn('s3', 'saber-sheet-still')); await tapIt(T('sel-approve')); await sleep(1000) }
  await X.pic(w, pn('s3', 'saber-approved'))
})
await safe('W3-4', async () => {
  say('notices after saber', await notices(p))
  await openInputs(w)
  await X.pic(w, pn('s4', 'saber-inputs'))
  const rows = await inputRows(p)
  const mine = rows.filter(r => /Ranger/.test(r) || /words/.test(r))
  const ok = VAR === 'b' ? mine.some(r => /saber words b/.test(r)) : mine.some(r => /27.*28|28 Jul/.test(r)) || mine.length > 0
  row('W3-4', size, 'Saber looks at the Inputs page afterwards', VAR === 'b' ? 'the leave shows the new words' : 'the leave runs 27-28 Jul with the words typed (W3: new words; W3c: unchanged words)', `rows ${JSON.stringify(mine)}`, 'RECORD', pn('s4', 'saber-inputs') + '.png')
  const dump = await p.evaluate(() => { const out = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (!k.startsWith('raptor:inputs/')) continue; try { const v = JSON.parse(localStorage.getItem(k)); if (/bane/.test(JSON.stringify(v)) && /Jul/.test(v.date || '')) out.push({ date: v.date, end: v.endDate, type: v.type, rmk: v.rmk ?? v.remarks, lw: v.lw }) } catch {} } return out })
  say('stored inputs for Ranger in July', JSON.stringify(dump))
  const runsOk = dump.some(d => d.date === 'Jul 27' && (d.end === 'Jul 28' || d.end === '28 Jul'))
  row('W3-4b', size, 'stored leave record', 'one leave running 27-28 Jul', JSON.stringify(dump), runsOk ? 'PASS' : 'RECORD', pn('s4', 'saber-inputs') + '.png')
})
const readBell = async (user, step) => {
  await X.signOut(w); await X.login(p, user)
  const b = await bell(w, pn(step, user + '-bell'))
  say(step, user, 'lines', JSON.stringify(b.lines))
  await closeBell(w)
  return b
}
await safe('W3-5', async () => {
  const b = await readBell('ad2', 's5')
  const rem = (b.lines || []).filter(l => /remark/i.test(l)).length
  const nNew = (b.lines || []).filter(l => /^NEW/.test(l)).length
  const exp = VAR === 'c' || VAR === 'c0' ? 'no remark-change line' : 'exactly one new line, a remark change'
  const pass = VAR === 'c' || VAR === 'c0' ? rem === 0 : (rem === 1 && nNew === 1)
  row('W3-5', size, "Hunter's bell", exp, `badge ${JSON.stringify(b.badge)}; new ${nNew}; remark lines ${rem}; lines ${JSON.stringify(b.lines)}`, pass ? 'PASS' : 'FAIL', pn('s5', 'ad2-bell') + '.png')
})
await safe('W3-6', async () => {
  const b = await readBell('us', 's6')
  const rem = (b.lines || []).filter(l => /remark/i.test(l)).length
  row('W3-6', size, "Ranger's bell (control for W3c: no remark-change line)", VAR === 'c' || VAR === 'c0' ? 'no remark-change line' : 'RECORD', `badge ${JSON.stringify(b.badge)}; remark lines ${rem}; lines ${JSON.stringify(b.lines)}`, VAR === 'c' || VAR === 'c0' ? (rem === 0 ? 'PASS' : 'FAIL') : 'RECORD', pn('s6', 'us-bell') + '.png')
})
await X.pic(w, pn('s9', 'whole-screen'))
await X.fin(w)
