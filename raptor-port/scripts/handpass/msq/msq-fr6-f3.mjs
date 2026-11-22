/* msq-fr6-f3 v1 — F3 with TWO tabs in one world: Kestrel keeps his Undo stack in tab 1 (sign-out clears it), Osprey reads his bell in tab 2 */
process.env.MSQ_RUN = process.env.MSQ_RUN || 'f3b'
const H = await (await import('./msq-j2-r-h.mjs')).mk()
const { X, say, sleep, row } = H
say('msq-fr6-f3 v1')
const phone = process.env.FR5_PHONE === '1'
const readFirst = process.env.FR5_READ === '1'
const size = phone ? 'iPhone' : 'desktop'
const w = await X.open({ phone, user: 'ad9' })
const p = w.page
const tapIt = async (pg, loc) => { if (phone) await loc.tap(); else await loc.click() }
const safe = async (l, fn) => { try { return await fn() } catch (e) { say('ERR', l, String(e.message).split('\n')[0]); await X.pic(w, 'err-' + l).catch(() => {}); row(l, size, 'script step', 'completes', 'script error ' + String(e.message).split('\n')[0], 'OWED', 'err-' + l + '.png') } }
const chipTxt = () => p.locator('[data-testid="open-chip"]').first().innerText().then(s => s.replace(/\s+/g, ' ').trim())
const undoState = async () => p.evaluate(() => ['undoBtn', 'redoBtn'].map(i => { const e = document.getElementById(i); if (!e) return i + ':none'; return i + ' disabled=' + e.disabled }).join('; '))
let q = null
const wq = { get page() { return q }, phone, errors: w.errors, browser: w.browser, ctx: w.ctx, P: w.P, get loads() { return 0 } }
const osprey = async (name, tapLine) => {
  // tab 2: a fresh tab of the same world, signed in as Osprey; read his bell
  if (q) await q.close().catch(() => {})
  q = await w.ctx.newPage()
  await q.goto('http://localhost:4293/')
  await sleep(1000)
  if (await q.locator('#luser').count()) await X.login(q, 'us9')
  else say('tab 2 did not ask to sign in; who:', await q.evaluate(() => document.body.innerText.slice(0, 100)))
  await sleep(800)
  const b = q.locator('#notifyBell:visible').first()
  const dot = await q.evaluate(() => { const d = document.querySelector('#notifyBell .belldot'); return d ? getComputedStyle(d).display : 'no dot' })
  if (phone) await b.tap(); else await b.click()
  await sleep(900)
  const lines = await q.evaluate(() => { const l = document.querySelector('[data-testid="bell-list"]'); return l ? [...l.querySelectorAll('.bl-line')].map(e => e.className + ' | ' + e.innerText.replace(/\s+/g, ' ')) : null })
  await X.L.shot(q, name)
  if (tapLine) {
    const ln = q.locator('[data-testid="bell-list"] .bl-line').first()
    if (await ln.count()) { if (phone) await ln.tap(); else await ln.click(); await sleep(1200) }
    await X.L.shot(q, name + '-tapped')
    say('read the line; page now', await q.evaluate(() => window.CURPAGE))
  }
  return { dot, lines }
}
await safe('F3b-open', async () => {
  await X.L.go(p, 'leavewar'); await sleep(2600)
  await tapIt(p, p.locator('[data-testid="open-chip"]').first()); await p.locator('[data-testid="open-dates"]').waitFor(); await sleep(600)
  await tapIt(p, p.locator('[data-testid="od-month-2026-12"]')); await sleep(900)
  await tapIt(p, p.locator('[data-testid="open-dates-close"]')); await sleep(900)
  const c1 = await chipTxt()
  await X.pic(w, 'f3b-01-kestrel-open')
  row('F3', size, 'Kestrel (tab 1): open December', 'chip shows dates', `chip "${c1}"; ${await undoState()}`, /Dec/.test(c1) ? 'PASS' : 'FAIL', 'f3b-01-kestrel-open.png')
})
await safe('F3b-o1', async () => {
  const b = await osprey('f3b-02-osprey-bell', readFirst)
  row('F3', size, 'Osprey (tab 2): bell after bidding opened', 'a bidding-open line, unread', `dot "${b.dot}"; ${JSON.stringify(b.lines)}`, b.lines && b.lines.some(l => /Bidding open/.test(l)) ? 'PASS' : 'FAIL', 'f3b-02-osprey-bell.png')
})
await safe('F3b-undo', async () => {
  await p.bringToFront()
  say('state before undo', await undoState())
  const und = p.locator('#undoBtn:visible').first()
  await tapIt(p, und); await sleep(1300)
  await X.pic(w, 'f3b-03-kestrel-undo')
  const c = (await p.locator('[data-testid="open-chip"]').count()) ? await chipTxt() : 'no chip on this page'
  row('F3', size, 'Kestrel (tab 1): top bar Undo', 'bidding closed again', `chip "${c}"; ${await undoState()}`, /closed/i.test(c) ? 'PASS' : 'FAIL', 'f3b-03-kestrel-undo.png')
  const b = await osprey('f3b-04-osprey-bell-after-undo')
  row('F3', size, 'Osprey (tab 2, reopened): bell after Undo', readFirst ? 'a struck line, taken back' : 'the bidding-open line gone', `dot "${b.dot}"; ${JSON.stringify(b.lines)}`, (readFirst ? (b.lines && b.lines.some(l => /taken back/i.test(l))) : (b.lines && !b.lines.some(l => /Bidding open/.test(l)))) ? 'PASS' : 'FAIL', 'f3b-04-osprey-bell-after-undo.png')
})
await safe('F3b-redo', async () => {
  await p.bringToFront()
  say('state before redo', await undoState())
  const red = p.locator('#redoBtn:visible').first()
  await tapIt(p, red); await sleep(1300)
  await X.pic(w, 'f3b-05-kestrel-redo')
  const c = (await p.locator('[data-testid="open-chip"]').count()) ? await chipTxt() : 'no chip on this page'
  row('F3', size, 'Kestrel (tab 1): top bar Redo', 'bidding open again', `chip "${c}"; ${await undoState()}`, /Dec/.test(c) ? 'PASS' : 'FAIL', 'f3b-05-kestrel-redo.png')
  const b = await osprey('f3b-06-osprey-bell-after-redo')
  row('F3', size, 'Osprey (tab 2, reopened): bell after Redo', 'the bidding-open line shows again', `dot "${b.dot}"; ${JSON.stringify(b.lines)}`, b.lines && b.lines.some(l => /Bidding open/.test(l)) ? 'PASS' : 'FAIL', 'f3b-06-osprey-bell-after-redo.png')
})
await X.fin(w)
