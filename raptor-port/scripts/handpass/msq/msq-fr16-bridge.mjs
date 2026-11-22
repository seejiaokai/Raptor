/* msq-fr16-bridge v1 — fix read 16 bridge walk: Saber approves Ranger's 27-29 Jul over Hunter's and Ranger's pieces; each bell read. FR16_PHONE=1 for the iPhone. */
process.env.FR16_SC = 'bridge'
const L = await import('./msq-fr16-lib.mjs')
const { X, say, sleep, row, tapIt, openAt, openInputs, inputRows, bell, size } = L
const P = L.phone ? 'phone' : 'desktop'
const pn = (s, what) => `${s}-${P}-${what}`
say('msq-fr16-bridge v1', size)
const w = await openAt('ad')
const p = w.page
const T = id => p.locator(`[data-testid="${id}"]`).first()
const safe = async (l, fn) => { try { return await fn() } catch (e) { say('ERR', l, String(e.message).split('\n')[0]); await X.pic(w, 'err-' + l).catch(() => {}); row(l, size, 'script step', 'completes', 'script error ' + String(e.message).split('\n')[0], 'OWED', 'err-' + l + '.png') } }
const goJul = async () => { await X.L.go(p, 'leavewar'); await sleep(2600); await tapIt(T('month-JUL')); await sleep(1200) }
const cell = async iso => { const c = T('cell-bane-' + iso); await c.scrollIntoViewIfNeeded(); await sleep(300); return c }
const open2 = () => p.locator('[data-testid="bid-picker"]:visible').count()
const place = async (iso, words, tag) => {
  await tapIt(await cell(iso)); await sleep(800)
  const tick = await T('bid-approve-tick').getAttribute('aria-checked').catch(() => 'none')
  if (words) { await p.locator('[data-testid="bid-remarks"]').first().fill(words); await sleep(300) }
  await X.pic(w, pn(tag, 'window'))
  await tapIt(T('bid-LL')); await sleep(110); await X.pic(w, pn(tag, 'LL-press')); await sleep(700)
  if (await open2()) { await tapIt(T('bid-LL')); await sleep(800) }
  await X.pic(w, pn(tag, 'placed'))
  const txt = (await (await cell(iso)).innerText()).replace(/\s+/g, ' ')
  return { tick, txt, still: await open2() }
}
const cells = async () => { const c = []; for (const d of ['27', '28', '29']) c.push(d + ': ' + (await (await cell('2026-07-' + d)).innerText()).replace(/\s+/g, ' ')); return c }
await safe('B-1', async () => {
  await goJul()
  await tapIt(T('open-chip')); await p.locator('[data-testid="open-dates"]').waitFor(); await sleep(600)
  await tapIt(T('od-month-2026-07')); await sleep(900)
  await tapIt(T('open-dates-close')); await sleep(900)
  const r = await place('2026-07-27', '', 'b1')
  row('B-1', size, 'Saber opens July, places an approved LL for Ranger on 27 Jul, words empty', 'placed and approved', `switch ${r.tick}; cell "${r.txt}"; window open ${r.still}`, r.tick === 'true' && !r.still ? 'PASS' : 'FAIL', pn('b1', 'placed') + '.png')
})
await safe('B-2', async () => {
  await X.signOut(w); await X.login(p, 'ad2'); await goJul()
  const r = await place('2026-07-29', 'hunter words', 'b2')
  const c = await cells()
  await X.pic(w, pn('b2', 'grid'))
  row('B-2', size, 'Hunter places an approved LL for Ranger on 29 Jul, words "hunter words"', '27 and 29 approved, 28 empty', `switch ${r.tick}; cells ${JSON.stringify(c)}; window open ${r.still}`, r.tick === 'true' && !r.still ? 'PASS' : 'FAIL', pn('b2', 'grid') + '.png')
})
await safe('B-3', async () => {
  await X.signOut(w); await X.login(p, 'us'); await goJul()
  const r = await place('2026-07-28', '', 'b3')
  row('B-3', size, 'Ranger places his own pending LL bid on 28 Jul', 'bid placed', `cell "${r.txt}"; window open ${r.still}`, !r.still ? 'PASS' : 'FAIL', pn('b3', 'placed') + '.png')
})
await safe('B-4', async () => {
  await X.signOut(w); await X.login(p, 'ad'); await goJul()
  const a = await cell('2026-07-27'), z = await cell('2026-07-29')
  const bA = await a.boundingBox(), bZ = await z.boundingBox()
  const A = { x: bA.x + bA.width / 2, y: bA.y + bA.height / 2 }, Zp = { x: bZ.x + bZ.width / 2, y: bZ.y + bZ.height / 2 }
  await p.mouse.move(A.x, A.y); await p.mouse.down(); await p.mouse.move(Zp.x, Zp.y, { steps: 12 }); await p.mouse.up(); await sleep(800)
  await X.pic(w, pn('b4', 'drag-window'))
  const shown = await p.locator('[data-testid="select-sheet"]:visible').count()
  const sel = await p.evaluate(() => (document.querySelector('[data-testid="select-sheet"]')?.innerText || '').replace(/\s+/g, ' ').slice(0, 200))
  say('select sheet', sel)
  if (!shown) { row('B-4', size, 'Saber drags 27-29', 'drag window opens', 'no drag window', 'BLOCKED', pn('b4', 'drag-window') + '.png'); throw new Error('no drag window') }
  await p.locator('[data-testid="sel-remarks"]').first().fill('joined'); await sleep(300)
  await X.pic(w, pn('b4', 'before-press'))
  await tapIt(T('sel-approve')); await sleep(110); await X.pic(w, pn('b4', 'approve-press')); await sleep(1000)
  if (await p.locator('[data-testid="select-sheet"]:visible').count()) { await X.pic(w, pn('b4', 'sheet-still')); await tapIt(T('sel-approve')); await sleep(1000) }
  await X.pic(w, pn('b4', 'settled'))
  const c = await cells()
  await openInputs(w); await X.pic(w, pn('b4', 'inputs'))
  const rows = (await inputRows(p)).filter(r => /Ranger/.test(r) || /words|joined/.test(r))
  const dump = await p.evaluate(() => { const out = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (!k.startsWith('raptor:inputs/')) continue; try { const v = JSON.parse(localStorage.getItem(k)); if (/bane/.test(JSON.stringify(v)) && /Jul/.test(v.date || '')) out.push({ date: v.date, end: v.endDate, rmk: v.rmk ?? v.remarks }) } catch (e) {} } return out })
  row('B-4', size, "Saber drag-selects Ranger's 27-29 Jul, approves with words 'joined'", 'RECORD whether one leave or several', `sheet "${sel}"; cells ${JSON.stringify(c)}; inputs rows ${JSON.stringify(rows)}; stored ${JSON.stringify(dump)}`, 'RECORD', pn('b4', 'settled') + '.png')
})
const readBell = async (user, step) => {
  await X.signOut(w); await X.login(p, user)
  const b = await bell(w, pn(step, user + '-bell'))
  say(step, user, 'lines', JSON.stringify(b.lines))
  return b
}
await safe('B-5', async () => {
  const b = await readBell('ad2', 'b5')
  const rem = (b.lines || []).filter(l => /word|remark/i.test(l))
  let after = 'n/a'
  if (rem.length) {
    const ln = p.locator('[data-testid="bell-list"] .bl-line').filter({ hasText: /word|remark/i }).first()
    await tapIt(ln); await sleep(1200); await X.pic(w, pn('b5', 'after-tap'))
    after = await p.evaluate(() => (document.querySelector('[data-testid="select-sheet"], [data-testid="bid-picker"], .inped-win, [role="dialog"]')?.innerText || document.body.innerText.slice(0, 200)).replace(/\s+/g, ' ').slice(0, 300))
    const x = p.locator('.inped-win button:visible', { hasText: '✕' }).first()
    if (await x.count()) { await tapIt(x); await sleep(800) } else { await p.keyboard.press('Escape'); await sleep(800) }
    await X.pic(w, pn('b5', 'after-close'))
  }
  row('B-5', size, "Hunter's bell", 'exactly one words-change line; tap opens leave 27-29', `badge ${JSON.stringify(b.badge)}; word lines ${rem.length}; lines ${JSON.stringify(b.lines)}; after tap: ${after}`, rem.length === 1 ? 'PASS' : 'FAIL', pn('b5', 'ad2-bell') + '.png')
})
await safe('B-6', async () => {
  const b = await readBell('us', 'b6')
  const rem = (b.lines || []).filter(l => /word|remark/i.test(l))
  row('B-6', size, "Ranger's bell", 'words change told once', `badge ${JSON.stringify(b.badge)}; word lines ${rem.length}; lines ${JSON.stringify(b.lines)}`, rem.length === 1 ? 'PASS' : 'FAIL', pn('b6', 'us-bell') + '.png')
})
await safe('B-7', async () => {
  const b = await readBell('ad', 'b7')
  const rem = (b.lines || []).filter(l => /word|remark/i.test(l))
  row('B-7', size, "Saber's bell", 'no line about words he typed himself', `badge ${JSON.stringify(b.badge)}; word lines ${rem.length}; lines ${JSON.stringify(b.lines)}`, rem.length === 0 ? 'PASS' : 'FAIL', pn('b7', 'ad-bell') + '.png')
})
await X.pic(w, pn('b9', 'whole-screen'))
await X.fin(w)
