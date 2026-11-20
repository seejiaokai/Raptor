/* msq-fr17-halves v1 — fix read 17 half-day walk. FR17_VAR = del (default) | ref; FR17_PHONE=1 for the iPhone. */
process.env.FR17_SC = 'halves'
const VAR = process.env.FR17_VAR === 'ref' ? 'ref' : 'del'
process.env.FR17_TAG = VAR
const L = await import('./msq-fr17-lib.mjs')
const { X, say, sleep, row, tapIt, openAt, bell, size } = L
const P = L.phone ? 'phone' : 'desktop'
const pn = (s, what) => `${s}-${P}-${VAR}-${what}`
say('msq-fr17-halves v1', size, VAR)
const w = await openAt('ad')
const p = w.page
const T = id => p.locator(`[data-testid="${id}"]`).first()
const safe = async (l, fn) => { try { return await fn() } catch (e) { say('ERR', l, String(e.message).split('\n')[0]); await X.pic(w, 'err-' + l + '-' + P + '-' + VAR).catch(() => {}); row(l, size, 'script step', 'completes', 'script error ' + String(e.message).split('\n')[0], 'OWED', 'err-' + l + '.png') } }
const goJul = async () => { await X.L.go(p, 'leavewar'); await sleep(2600); await tapIt(T('month-JUL')); await sleep(1200) }
const cell = async iso => { const c = T('cell-bane-' + iso); await c.scrollIntoViewIfNeeded(); await sleep(300); return c }
const open2 = () => p.locator('[data-testid="bid-picker"]:visible').count()
const cellTxt = async iso => (await (await cell(iso)).innerText()).replace(/\s+/g, ' ')
const winTxt = () => p.evaluate(() => (document.querySelector('[data-testid="bid-picker"]')?.innerText || 'NO WINDOW').replace(/\s+/g, ' ').slice(0, 500))
const place = async (iso, words, tag, portion) => {
  await tapIt(await cell(iso)); await sleep(800)
  const tick = await T('bid-approve-tick').getAttribute('aria-checked').catch(() => 'none')
  await tapIt(T('portion-' + portion)); await sleep(400)
  await p.locator('[data-testid="bid-remarks"]').first().fill(words); await sleep(300)
  await X.pic(w, pn(tag, 'window'))
  await tapIt(T('bid-LL')); await sleep(110); await X.pic(w, pn(tag, 'LL-press')); await sleep(700)
  if (await open2()) { await tapIt(T('bid-LL')); await sleep(800) }
  await X.pic(w, pn(tag, 'placed'))
  return { tick, txt: await cellTxt(iso), still: await open2() }
}
await safe('H-1', async () => {
  await goJul()
  await tapIt(T('open-chip')); await p.locator('[data-testid="open-dates"]').waitFor(); await sleep(600)
  await tapIt(T('od-month-2026-07')); await sleep(900)
  await tapIt(T('open-dates-close')); await sleep(900)
  const r = await place('2026-07-27', 'morning words', 'h1', 'am')
  row('H-1', size + ' ' + VAR, 'Saber places approved AM-half LL for Ranger 27 Jul (portion-am, bid-LL), words "morning words"', 'half placed', `switch ${r.tick}; cell "${r.txt}"; window open ${r.still}`, r.tick === 'true' ? 'RECORD' : 'FAIL', pn('h1', 'placed') + '.png')
})
await safe('H-2', async () => {
  await X.signOut(w); await X.login(p, 'ad2'); await goJul()
  const r = await place('2026-07-27', 'afternoon words', 'h2', 'pm')
  await X.pic(w, pn('h2', 'cell'), await cell('2026-07-27'))
  row('H-2', size + ' ' + VAR, 'Hunter places approved PM-half LL for Ranger 27 Jul, words "afternoon words"', 'both halves in the cell', `switch ${r.tick}; cell "${r.txt}"; window open ${r.still}`, 'RECORD', pn('h2', 'cell') + '.png')
})
await safe('H-3', async () => {
  await X.signOut(w); await X.login(p, 'ad'); await goJul()
  const before = await cellTxt('2026-07-27')
  await tapIt(await cell('2026-07-27')); await sleep(900)
  /* the window holds one section per half (AM then PM), each with its own buttons: the PM ones are the second of each */
  const PM = async id => { const l = p.locator(`[data-testid="${id}"]:visible`); return (await l.count()) > 1 ? l.nth(1) : l.first() }
  say('H-3 sections', await p.locator('[data-testid="decide-refuse"]:visible').count())
  const wb = await winTxt()
  const refOffered = await T('decide-refuse').count()
  await X.pic(w, pn('h3', 'before-press'))
  const id = VAR === 'ref' ? 'decide-refuse' : 'bid-clear'
  say('H-3 control', id, 'refuse offered', refOffered)
  await tapIt(await PM(id)); await sleep(110); await X.pic(w, pn('h3', 'press-110ms'))
  const w110 = await winTxt(); await sleep(900)
  let w2 = await winTxt(), confirmed = 'no confirm'
  if (VAR === 'del' && await open2() && /sure/i.test(await (await PM('bid-clear')).innerText().catch(() => ''))) { await tapIt(await PM('bid-clear')); confirmed = 'second tap (Delete - sure?)'; await sleep(110); await X.pic(w, pn('h3', 'confirm-110ms')); await sleep(900); w2 = await winTxt() }
  await X.pic(w, pn('h3', 'settled'))
  const open = await open2()
  const c = await cellTxt('2026-07-27')
  row('H-3', size + ' ' + VAR, `Saber on PM half only: ${id}`, 'PM gone/not approved; AM stands with morning words; window not claiming done', `cell before "${before}"; window before "${wb}"; window@110ms "${w110}"; after "${w2}" (${confirmed}); window open ${open}; cell after "${c}"`, 'RECORD', pn('h3', 'settled') + '.png')
  if (open) { await p.keyboard.press('Escape'); await sleep(500); if (await open2()) await tapIt(T('bid-cancel')); await sleep(500) }
  await X.pic(w, pn('h3', 'grid'), await cell('2026-07-27'))
})
await safe('H-4', async () => {
  await p.reload(); await sleep(2000); await goJul()
  const c = await cellTxt('2026-07-27')
  await tapIt(await cell('2026-07-27')); await sleep(900)
  const wt = await winTxt()
  const words = await p.evaluate(() => [...document.querySelectorAll('[data-testid="bid-remarks"]')].map(e => e.value))
  await X.pic(w, pn('h4', 'reloaded-window'))
  await p.keyboard.press('Escape'); await sleep(500); if (await open2()) await tapIt(T('bid-cancel')); await sleep(500)
  await X.pic(w, pn('h4', 'reloaded'), await cell('2026-07-27'))
  row('H-4', size + ' ' + VAR, 'reload as Saber, Ranger 27 Jul', 'same as H-3 settled', `cell "${c}"; window "${wt}"; remarks ${JSON.stringify(words)}`, 'RECORD', pn('h4', 'reloaded') + '.png')
})
for (const [step, user] of [['H-5a', 'us'], ['H-5b', 'ad2']]) await safe(step, async () => {
  await X.signOut(w); await X.login(p, user)
  const b = await bell(w, pn(step, user + '-bell'))
  const rem = (b.lines || []).filter(l => /remark|word/i.test(l))
  say(step, user, JSON.stringify(b.lines))
  row(step, size + ' ' + VAR, `${user} bell`, 'no "Remark changed" line', `badge ${JSON.stringify(b.badge)}; lines ${JSON.stringify(b.lines)}`, rem.length === 0 ? 'PASS' : 'FAIL', pn(step, user + '-bell') + '.png')
})
say('ERRORS', JSON.stringify(w.errors))
await X.fin(w)
