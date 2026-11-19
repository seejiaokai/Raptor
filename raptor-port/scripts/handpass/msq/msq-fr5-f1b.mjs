/* msq-fr5-f1b v1 — F1 with lines: Kestrel opens then closes December; Osprey taps a line, reopens, marks all read (FR5_PHONE=1 for the iPhone) */
process.env.MSQ_RUN = process.env.MSQ_RUN || 'f1b'
const H = await (await import('./msq-j2-r-h.mjs')).mk()
const { X, say, sleep, row, swap } = H
say('msq-fr5-f1b v1')
const phone = process.env.FR5_PHONE === '1'
const size = phone ? 'iPhone' : 'desktop'
const w = await X.open({ phone, user: 'ad9' })
const p = w.page
const tapIt = async loc => { if (phone) await loc.tap(); else await loc.click() }
const safe = async (l, fn) => { try { return await fn() } catch (e) { say('ERR', l, String(e.message).split('\n')[0]); await X.pic(w, 'err-' + l).catch(() => {}); row(l, size, 'script step', 'completes', 'script error ' + String(e.message).split('\n')[0], 'OWED', 'err-' + l + '.png') } }
const toggleDec = async () => {
  await X.L.go(p, 'leavewar'); await sleep(2400)
  await tapIt(p.locator('[data-testid="open-chip"]').first()); await p.locator('[data-testid="open-dates"]').waitFor(); await sleep(600)
  await tapIt(p.locator('[data-testid="od-month-2026-12"]')); await sleep(900)
  await tapIt(p.locator('[data-testid="open-dates-close"]')); await sleep(900)
}
const bellState = async () => {
  const dot = await p.evaluate(() => { const d = document.querySelector('#notifyBell .belldot'); return d ? getComputedStyle(d).display : 'no dot' })
  const open = await p.locator('[data-testid="bell-list"]:visible').count()
  const lines = open ? await p.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].map(e => (e.classList.contains('unread') ? 'NEW ' : 'read ') + e.innerText.replace(/\s+/g, ' '))) : null
  return { dot, lines }
}
const bellBtn = () => p.locator('#notifyBell:visible').first()
await safe('open-close', async () => { await toggleDec(); await X.pic(w, 'f1b-01-opened'); if (process.env.FR5_CLOSE === '1') { await toggleDec(); await X.pic(w, 'f1b-02-closed') } })
await safe('osprey', async () => {
  await swap(w, 'us9')
  const d0 = await bellState()
  await tapIt(bellBtn()); await sleep(900)
  const s0 = await bellState()
  await X.pic(w, 'f1b-03-osprey-bell')
  row('F1', size, 'Osprey: bell after bidding opened then closed', 'two lines, both new; dot lit', `dot before open "${d0.dot}"; ${JSON.stringify(s0.lines)}`, s0.lines && s0.lines.length === 2 && s0.lines.every(l => /^NEW/.test(l)) ? 'PASS' : 'RECORD', 'f1b-03-osprey-bell.png')
  if (process.env.FR5_MARKALL !== '1') {
  const first = p.locator('[data-testid="bell-list"] .bl-line').first()
  await tapIt(first); await sleep(1500)
  await X.pic(w, 'f1b-04-after-line-tap')
  const page = await p.evaluate(() => window.CURPAGE)
  const head = await H.U.bodyText(p)
  row('F1', size, 'Osprey: tap the first line', 'opens the place it names (RECORD)', `page ${page}; bell still open ${await p.locator('[data-testid="bell-list"]:visible').count()}; words ${head.slice(0, 200)}`, 'RECORD', 'f1b-04-after-line-tap.png')
  if (!(await p.locator('[data-testid="bell-list"]:visible').count())) { await tapIt(bellBtn()); await sleep(900) }
  const s1 = await bellState()
  await X.pic(w, 'f1b-05-reopen')
  row('F1', size, 'Osprey: reopen the bell', 'the tapped line no longer new; one fewer new', `dot ${s1.dot}; ${JSON.stringify(s1.lines)}`, s1.lines && s1.lines.filter(l => /^NEW/.test(l)).length === s0.lines.length - 1 ? 'PASS' : 'FAIL', 'f1b-05-reopen.png')
  } else {
  await tapIt(p.locator('[data-testid="bell-markall"]')); await sleep(900)
  const s2 = await bellState()
  await X.pic(w, 'f1b-06-markall')
  row('F1', size, 'Osprey: Mark all read', 'no line new; dot gone', `dot "${s2.dot}"; ${JSON.stringify(s2.lines)}`, s2.lines && s2.lines.every(l => /^read/.test(l)) && s2.dot === 'none' ? 'PASS' : 'FAIL', 'f1b-06-markall.png')
  }
})
await X.fin(w)
