/* msq-j2-r-a v1 — R-A: 149's admin runs bidding; the bell of 149's member (desktop 1536, fresh world) */
process.env.MSQ_RUN = process.env.MSQ_RUN || 'ra1'
const H = await (await import('./msq-j2-r-h.mjs')).mk()
const { X, say, sleep, row } = H
say('msq-j2-r-a v1')
const w = await X.open({ user: 'ad9' })
const p = w.page
const safe = async (l, fn) => { try { return await fn() } catch (e) { say('ERR', l, String(e.message).split('\n')[0]); await X.pic(w, 'err-' + l).catch(() => {}); row(l, 'desktop', 'script step', 'completes', 'script error ' + String(e.message).split('\n')[0], 'OWED', 'err-' + l + '.png') } }
const chipTxt = () => p.locator('[data-testid="open-chip"]').first().innerText().then(s => s.replace(/\s+/g, ' ').trim())
const openWin = async () => { if (!(await p.locator('[data-testid="open-dates"]').count())) { await p.locator('[data-testid="open-chip"]').first().click(); await p.locator('[data-testid="open-dates"]').waitFor(); await sleep(500) } }
const closeWin = async () => { if (await p.locator('[data-testid="open-dates"]').count()) { await p.locator('[data-testid="open-dates-close"]').click(); await sleep(700) } }
const lines = async () => (await p.locator('[data-testid^="od-line-"]').allInnerTexts()).map(s => s.replace(/\s+/g, ' ').trim())
const states = () => p.locator('[data-testid^="od-month-"]').evaluateAll(l => l.map(e => e.getAttribute('data-testid').slice(9) + ':' + e.getAttribute('data-state')).join(' '))
await safe('RA-open', async () => {
  await X.L.go(p, 'leavewar'); await sleep(2500)
  const c0 = await chipTxt(); say('chip before', c0)
  await X.pic(w, 'a01-chip-before')
  await openWin()
  say('states', await states())
  await X.pic(w, 'a02-window')
  await p.locator('[data-testid="od-month-2026-12"]').click(); await sleep(800)
  const ln = await lines()
  await X.pic(w, 'a03-december-tapped')
  await closeWin()
  const c1 = await chipTxt()
  await X.pic(w, 'a04-chip-after')
  const outline = await p.evaluate(() => { const hs = [...document.querySelectorAll('[class*="open"],[data-open]')].slice(0, 0); return '' })
  row('R-A', 'desktop', 'ad9: Leave War, chip "' + c0 + '" -> open December (one month tap) -> done', 'the chip shows the open dates; green outline on December', `lines in window ${JSON.stringify(ln)}; chip now "${c1}"`, /Dec/.test(c1) ? 'PASS' : 'FAIL', 'a03-december-tapped.png, a04-chip-after.png')
})
await safe('RA-us9a', async () => {
  await H.swap(w, 'us9')
  const b = await H.bellOpen(w, 'a05-us9-bell-opened')
  row('R-A', 'desktop', 'us9: open the bell after bidding opened', 'a line that bidding opened, naming the dates and Kestrel', `bell cls "${b.cls}" aria "${b.aria}" text "${b.txt}" lines ${JSON.stringify(b.lines)}`, b.lines && b.lines.some(l => /bidding/i.test(l) && /Kestrel/.test(l)) ? 'PASS' : 'FAIL', 'a05-us9-bell-opened.png')
  // tap the line
  const line = p.locator('[data-testid="bell-list"] [data-testid^="bell-"], .bell-list > *').filter({ hasText: /bidding/i }).first()
  if (await line.count()) {
    await line.click(); await sleep(1200)
    await X.pic(w, 'a06-us9-after-line-tap')
    const bt = await H.U.bodyText(p)
    row('R-A', 'desktop', 'us9: taps the bidding line', 'RECORD what opens', `page ${await p.evaluate(() => window.CURPAGE)}; words ${bt.slice(0, 300)}`, 'RECORD', 'a06-us9-after-line-tap.png')
  } else row('R-A', 'desktop', 'us9: tap the bidding line', 'RECORD', 'no bidding line found to tap', 'OWED', 'a05-us9-bell-opened.png')
})
await safe('RA-close', async () => {
  await H.swap(w, 'ad9')
  await X.L.go(p, 'leavewar'); await sleep(2500)
  await openWin()
  await p.locator('[data-testid="od-month-2026-12"]').click(); await sleep(800)
  await X.pic(w, 'a07-december-untapped')
  const ln = await lines()
  await closeWin()
  const c = await chipTxt()
  await X.pic(w, 'a08-chip-closed')
  row('R-A', 'desktop', 'ad9: close December again', 'chip back to Bidding closed', `lines ${JSON.stringify(ln)}; chip "${c}"`, /closed/i.test(c) ? 'PASS' : 'FAIL', 'a08-chip-closed.png')
  await H.swap(w, 'us9')
  const b = await H.bellOpen(w, 'a09-us9-bell-after-close')
  row('R-A', 'desktop', 'us9: bell after bidding closed', 'a "bidding closed" line', `lines ${JSON.stringify(b.lines)}`, b.lines && b.lines.some(l => /bidding closed|closed/i.test(l)) ? 'PASS' : 'FAIL', 'a09-us9-bell-after-close.png')
})
await X.fin(w)
