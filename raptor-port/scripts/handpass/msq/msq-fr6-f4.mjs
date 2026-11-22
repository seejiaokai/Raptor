/* msq-fr6-f4 v2 — F4: Saber posts Ranger out today (Leave War day window -> ... -> Post out); Hunter's and Ranger's bells in a second tab;
   Saber's top bar Undo; the bells again. FR5_READ=1: Hunter reads the line before the take-back. FR5_PHONE=1 for the iPhone. */
process.env.MSQ_RUN = process.env.MSQ_RUN || 'f4'
const H = await (await import('./msq-j2-r-h.mjs')).mk()
const { X, say, sleep, row } = H
say('msq-fr6-f4 v2')
const phone = process.env.FR5_PHONE === '1'
const readFirst = process.env.FR5_READ === '1'
const size = phone ? 'iPhone' : 'desktop'
const w = await X.open({ phone, user: 'ad' })
const p = w.page
const tapIt = async loc => { if (phone) await loc.tap(); else await loc.click() }
const safe = async (l, fn) => { try { return await fn() } catch (e) { say('ERR', l, String(e.message).split('\n')[0]); await X.pic(w, 'err-' + l).catch(() => {}); row(l, size, 'script step', 'completes', 'script error ' + String(e.message).split('\n')[0], 'OWED', 'err-' + l + '.png') } }
const undoState = () => p.evaluate(() => ['undoBtn', 'redoBtn'].map(i => { const e = document.getElementById(i); return e ? i + ' disabled=' + e.disabled : i + ':none' }).join('; '))
const T = '2026-11-19'
let q = null
let tab2user = null
const tab2 = async (user, name, closeAfter) => {
  if (q) await q.close().catch(() => {})
  q = await w.ctx.newPage()
  await q.goto('http://localhost:4293/'); await sleep(1000)
  if (await q.locator('#luser').count()) await X.login(q, user)
  const b = q.locator('#notifyBell:visible').first()
  const dot = await q.evaluate(() => { const d = document.querySelector('#notifyBell .belldot'); return d ? getComputedStyle(d).display : 'no dot' })
  if (phone) await b.tap(); else await b.click()
  await sleep(900)
  const lines = await q.evaluate(() => { const l = document.querySelector('[data-testid="bell-list"]'); return l ? [...l.querySelectorAll('.bl-line')].map(e => (e.classList.contains('unread') ? 'NEW ' : 'read ') + e.innerText.replace(/\s+/g, ' ')) : null })
  await X.L.shot(q, name)
  if (closeAfter) { await b.click().catch(() => {}); await sleep(400) }
  return { dot, lines }
}
const pidOf = cs => p.evaluate(c => Object.entries(window.PEOPLE).find(([k, v]) => v.cs === c)?.[0] || null, cs)
await safe('F4-post', async () => {
  const rg = await pidOf('Ranger')
  await X.L.go(p, 'leavewar'); await sleep(2600)
  const cell = p.locator(`[data-testid="cell-${rg}-${T}"]`).first()
  await cell.scrollIntoViewIfNeeded().catch(() => {}); await sleep(400)
  await tapIt(cell); await sleep(1000)
  await X.pic(w, 'f4-01-day-window')
  await tapIt(p.locator('button:visible', { hasText: '⋯' }).last()); await sleep(700)
  await X.pic(w, 'f4-02-dots')
  await tapIt(p.locator('button:visible', { hasText: /^Post out/ }).first()); await sleep(900)
  await X.pic(w, 'f4-03-sheet')
  const sheet = await p.evaluate(() => { const e = [...document.querySelectorAll('button')].find(b => /^Post out$/.test(b.textContent.trim()) && b.getBoundingClientRect().width > 2); let box = e; for (let i = 0; i < 8 && box && box.parentElement && !/PO FROM/i.test(box.innerText || ''); i++) box = box.parentElement; return (box?.innerText || '(no sheet)').replace(/\s+/g, ' ') })
  say('sheet', sheet)
  const ch = p.locator('button:visible', { hasText: /^(✓ )?Overseas Sqn/ }).first()
  if (await ch.count()) { await tapIt(ch); await sleep(700) }
  await X.pic(w, 'f4-04-sheet-chip')
  await tapIt(p.locator('button:visible', { hasText: /^Post out$/ }).last()); await sleep(1500)
  await X.pic(w, 'f4-05-after-post')
  const ps = await p.evaluate(rg => { const x = window.PEOPLE[rg]; return JSON.stringify({ cs: x.cs, posted: x.posted || x.postedOut || null, status: x.status || null, keys: Object.keys(x).filter(k => /post|out|arch|unit|sqn/i.test(k)).map(k => k + '=' + JSON.stringify(x[k])) }) }, rg)
  row('F4', size, "Saber: Leave War, Ranger's day window, ⋯, Post out, Overseas Sqn chip, Post out", 'posted out today (sheet closes, a note)', `sheet words: ${sheet.slice(0, 220)}; Ranger now: ${ps}; undo: ${await undoState()}; page words: ${(await H.U.bodyText(p)).slice(0, 160)}`, 'RECORD', 'f4-05-after-post.png')
})
await safe('F4-bells1', async () => {
  const h = await tab2('ad2', 'f4-06-hunter-bell', !readFirst)
  row('F4', size, 'Hunter (tab 2): bell after the posting', 'a posting line', `dot "${h.dot}"; ${JSON.stringify(h.lines)}`, h.lines && h.lines.some(l => /post/i.test(l)) ? 'PASS' : 'RECORD', 'f4-06-hunter-bell.png')
  if (readFirst) {
    const ln = q.locator('[data-testid="bell-list"] .bl-line').first()
    if (await ln.count()) { if (phone) await ln.tap(); else await ln.click(); await sleep(1200) }
    await X.L.shot(q, 'f4-06b-hunter-tapped-line')
    say('Hunter tapped the line; his page now', await q.evaluate(() => window.CURPAGE))
  }
})
await safe('F4-undo', async () => {
  await p.bringToFront()
  say('state before undo', await undoState())
  await X.pic(w, 'f4-07-saber-before-undo')
  // the top bar's Undo is greyed after a posting (D350); the take-back is the posting's own Delete, in its sheet
  const rg0 = await pidOf('Ranger')
  const cell0 = p.locator(`[data-testid="cell-${rg0}-${T}"]`).first()
  await cell0.scrollIntoViewIfNeeded().catch(() => {}); await sleep(400)
  await tapIt(cell0); await sleep(1000)
  await X.pic(w, 'f4-07b-po-cell-window')
  say('buttons in window', await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 2).map(b => b.textContent.replace(/\s+/g, ' ').trim()).filter(t => /Post|Delete|Remove|Undo|Cancel|⋯/.test(t)).join(' | ')))
  const un = p.locator('button:visible', { hasText: /^Undo post out/ }).first()
  say('undo post out count', await un.count())
  await tapIt(un); await sleep(1500)
  await X.pic(w, 'f4-08-saber-after-undo')
  const rg = await pidOf('Ranger')
  const ps = await p.evaluate(rg => { const x = window.PEOPLE[rg]; return JSON.stringify(Object.keys(x).filter(k => /post|out|arch|unit|sqn/i.test(k)).map(k => k + '=' + JSON.stringify(x[k]))) }, rg)
  row('F4', size, 'Saber: top bar Undo', 'the posting is taken back', `Ranger now ${ps}; ${await undoState()}; words ${(await H.U.bodyText(p)).slice(0, 160)}`, 'RECORD', 'f4-08-saber-after-undo.png')
  const h = await tab2('ad2', 'f4-09-hunter-bell-after-undo', true)
  row('F4', size, `Hunter (tab 2, reopened): bell after the take-back (${readFirst ? 'he had read the line first' : 'he had not read it'})`, readFirst ? 'a "taken back" line' : 'the posting line gone', `dot "${h.dot}"; ${JSON.stringify(h.lines)}`, 'RECORD', 'f4-09-hunter-bell-after-undo.png')
  const r = await tab2('us', 'f4-10-ranger-bell-after-undo', true)
  row('F4', size, 'Ranger (tab 2): bell after the take-back', 'RECORD', `dot "${r.dot}"; ${JSON.stringify(r.lines)}`, 'RECORD', 'f4-10-ranger-bell-after-undo.png')
})
await safe('F4-saber-bell', async () => {
  const s = await tab2('ad', 'f4-11-saber-bell-after-undo', true)
  row('F4', size, 'Saber (tab 2, fresh load): his own bell after pressing Undo post out', 'nothing about the posting or its take-back', `dot "${s.dot}"; ${JSON.stringify(s.lines)}`, s.lines && !s.lines.some(l => /post|taken back/i.test(l)) ? 'PASS' : 'FAIL', 'f4-11-saber-bell-after-undo.png')
})
await safe('F5', async () => {
  await p.bringToFront()
  await X.L.go(p, 'leavewar'); await sleep(2600)
  const rg = await pidOf('Ranger')
  const cell = p.locator(`[data-testid="cell-${rg}-${T}"]`).first()
  await cell.scrollIntoViewIfNeeded().catch(() => {}); await sleep(500)
  await X.pic(w, 'f5-01-leavewar-ranger-row')
  const ctext = await cell.innerText().catch(() => '(no cell)')
  row('F5', size, "Leave War list for Nov: Ranger's cell for today after the take-back", 'no posting mark', `cell "${ctext.replace(/\s+/g, ' ')}"`, 'RECORD', 'f5-01-leavewar-ranger-row.png')
  await X.L.go(p, 'admin'); await sleep(900)
  await p.locator('input[aria-label="Find a callsign or sign-in"]').fill('Ranger'); await sleep(700)
  const tap = p.locator(`.acc-row[data-person="${rg}"] .acc-tap`).first()
  if (await tap.count()) { await tapIt(tap); await sleep(900) }
  await X.pic(w, 'f5-02-admin-users-ranger')
  const rowTxt = await p.evaluate(id => (document.querySelector(`.acc-row[data-person="${id}"]`)?.innerText || '(no row)').replace(/\s+/g, ' '), rg)
  row('F5', size, "Admin -> Users: Ranger's row", 'not posted out', `row "${rowTxt.slice(0, 250)}"`, 'RECORD', 'f5-02-admin-users-ranger.png')
  await X.L.go(p, 'leavewar'); await sleep(2400)
  const c2 = p.locator(`[data-testid="cell-${rg}-${T}"]`).first()
  await c2.scrollIntoViewIfNeeded().catch(() => {}); await sleep(400)
  await tapIt(c2); await sleep(1000)
  await tapIt(p.locator('button:visible', { hasText: '⋯' }).last()); await sleep(700)
  const po = p.locator('button:visible', { hasText: /^Post out/ }).first()
  await tapIt(po); await sleep(900)
  await X.pic(w, 'f5-03-posting-sheet-reopened')
  const sheet = await p.evaluate(() => { const e = [...document.querySelectorAll('button')].find(b => /^Post out$/.test(b.textContent.trim()) && b.getBoundingClientRect().width > 2); let box = e; for (let i = 0; i < 8 && box && box.parentElement && !/PO FROM/i.test(box.innerText || ''); i++) box = box.parentElement; return (box?.innerText || '(no sheet)').replace(/\s+/g, ' ') })
  row('F5', size, 'posting sheet reopened for Ranger', 'a fresh sheet, no posting running', `sheet "${sheet.slice(0, 250)}"`, 'RECORD', 'f5-03-posting-sheet-reopened.png')
})
await X.fin(w)
