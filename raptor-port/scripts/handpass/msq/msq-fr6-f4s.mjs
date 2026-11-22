/* msq-fr6-f4s v1 — F4 + F5 in ONE tab (the same-tab rule): sign out / sign in as the next person, never a second tab.
   Saber (ad) posts Ranger out today; Hunter (ad2) looks at his bell (FR5_READ=1: taps the line to read it); Saber presses "Undo post out";
   Saber's own bell; Hunter's bell again; then F5 looks. FR5_PHONE=1 for the iPhone. */
process.env.MSQ_RUN = process.env.MSQ_RUN || 'f4s'
const H = await (await import('./msq-j2-r-h.mjs')).mk()
const { X, say, sleep, row, swap } = H
say('msq-fr6-f4s v1')
const phone = process.env.FR5_PHONE === '1'
const readFirst = process.env.FR5_READ === '1'
const size = phone ? 'iPhone' : 'desktop'
const w = await X.open({ phone, user: 'ad' })
const p = w.page
const tapIt = async loc => { if (phone) await loc.tap(); else await loc.click() }
const safe = async (l, fn) => { try { return await fn() } catch (e) { say('ERR', l, String(e.message).split('\n')[0]); await X.pic(w, 'err-' + l).catch(() => {}); row(l, size, 'script step', 'completes', 'script error ' + String(e.message).split('\n')[0], 'OWED', 'err-' + l + '.png') } }
const T = '2026-11-19'
const pidOf = cs => p.evaluate(c => Object.entries(window.PEOPLE).find(([k, v]) => v.cs === c)?.[0] || null, cs)
const bell = async (name, tapLine) => {
  const b = p.locator('#notifyBell:visible').first()
  const dot = await p.evaluate(() => { const d = document.querySelector('#notifyBell .belldot'); return d ? getComputedStyle(d).display : 'no dot' })
  await tapIt(b); await sleep(900)
  const lines = await p.evaluate(() => { const l = document.querySelector('[data-testid="bell-list"]'); return l ? [...l.querySelectorAll('.bl-line')].map(e => e.className.replace(/bl-line\s*/, '') + ' | ' + e.innerText.replace(/\s+/g, ' ')) : null })
  await X.pic(w, name)
  if (tapLine) {
    const ln = p.locator('[data-testid="bell-list"] .bl-line').first()
    if (await ln.count()) { await tapIt(ln); await sleep(1200) }
    await X.pic(w, name + '-tapped')
    say('tapped the line; page now', await p.evaluate(() => window.CURPAGE))
  } else {
    await tapIt(b); await sleep(500)
  }
  return { dot, lines }
}
const openCellWindow = async rg => {
  await X.L.go(p, 'leavewar'); await sleep(2600)
  const cell = p.locator(`[data-testid="cell-${rg}-${T}"]`).first()
  await cell.scrollIntoViewIfNeeded().catch(() => {}); await sleep(400)
  await tapIt(cell); await sleep(1000)
}
await safe('F4-post', async () => {
  const rg = await pidOf('Ranger')
  await openCellWindow(rg)
  await tapIt(p.locator('button:visible', { hasText: '⋯' }).last()); await sleep(700)
  await tapIt(p.locator('button:visible', { hasText: /^Post out/ }).first()); await sleep(900)
  await X.pic(w, 's-01-sheet')
  const ch = p.locator('button:visible', { hasText: /^(✓ )?Overseas Sqn/ }).first()
  if (await ch.count()) { await tapIt(ch); await sleep(700) }
  await tapIt(p.locator('button:visible', { hasText: /^Post out$/ }).last()); await sleep(1500)
  await X.pic(w, 's-02-after-post')
  row('F4', size, 'Saber (tab 1): Ranger posted out today via the sheet', 'posted out', 'page words: ' + (await H.U.bodyText(p)).slice(0, 120), 'RECORD', 's-02-after-post.png')
})
await safe('F4-hunter1', async () => {
  await swap(w, 'ad2'); say('now Hunter, same tab')
  const h = await bell('s-03-hunter-bell', readFirst)
  row('F4', size, `Hunter (same tab, signed in fresh): bell after the posting${readFirst ? ', line tapped to read it' : ', NOT opened further'}`, 'a posting line, unread', `dot "${h.dot}"; ${JSON.stringify(h.lines)}`, h.lines && h.lines.some(l => /Posted out/i.test(l) && /unread/.test(l)) ? 'PASS' : 'FAIL', 's-03-hunter-bell.png')
})
await safe('F4-undo', async () => {
  await swap(w, 'ad'); say('now Saber, same tab')
  const rg = await pidOf('Ranger')
  await openCellWindow(rg)
  await X.pic(w, 's-04-saber-window')
  const un = p.locator('button:visible', { hasText: /^Undo post out/ }).first()
  say('undo post out count', await un.count())
  await tapIt(un); await sleep(1500)
  await X.pic(w, 's-05-saber-after-undo')
  row('F4', size, 'Saber (same tab): Undo post out on the sheet', 'posting taken back', 'page words: ' + (await H.U.bodyText(p)).slice(0, 120), 'RECORD', 's-05-saber-after-undo.png')
  const s = await bell('s-06-saber-bell', false)
  row('F4', size, "Saber (same tab): his own bell after his Undo", 'nothing about it', `dot "${s.dot}"; ${JSON.stringify(s.lines)}`, s.lines && !s.lines.some(l => /post|taken back/i.test(l)) ? 'PASS' : 'FAIL', 's-06-saber-bell.png')
})
await safe('F4-hunter2', async () => {
  await swap(w, 'ad2'); say('now Hunter, same tab')
  const h = await bell('s-07-hunter-bell-after-undo', false)
  const ok = readFirst ? (h.lines && h.lines.length === 1 && /taken back/i.test(h.lines[0]) && /Saber/.test(h.lines[0]) && /unread/.test(h.lines[0])) : (h.lines && h.lines.length === 0)
  row('F4', size, `Hunter (same tab, fresh): bell after the take-back (${readFirst ? 'he had read the line first' : 'he had not read it'})`, readFirst ? 'one struck line "taken back · Saber", unread, bell lit' : 'the posting line gone', `dot "${h.dot}"; ${JSON.stringify(h.lines)}`, ok ? 'PASS' : 'FAIL', 's-07-hunter-bell-after-undo.png')
})
await safe('F5', async () => {
  await swap(w, 'ad'); say('now Saber, same tab')
  const rg = await pidOf('Ranger')
  await X.L.go(p, 'leavewar'); await sleep(2600)
  const cell = p.locator(`[data-testid="cell-${rg}-${T}"]`).first()
  await cell.scrollIntoViewIfNeeded().catch(() => {}); await sleep(500)
  await X.pic(w, 's-08-leavewar-ranger-row')
  row('F5', size, "Leave War: Ranger's cell for today after the take-back", 'no posting mark', `cell "${((await cell.innerText().catch(() => '(none)')) || '').replace(/\s+/g, ' ')}"`, 'RECORD', 's-08-leavewar-ranger-row.png')
  await X.L.go(p, 'admin'); await sleep(900)
  if (phone) { const uc = p.locator('button:visible, a:visible, div[role=button]:visible', { hasText: /Sign-in and roster/ }).first(); if (await uc.count()) { await tapIt(uc); await sleep(900) } }
  const f = p.locator(H.FIND).first()
  if (await f.isVisible().catch(() => false)) { await f.fill('Ranger'); await sleep(700) }
  const tap = p.locator(`.acc-row[data-person="${rg}"] .acc-tap`).first()
  if (await tap.count()) { await tapIt(tap); await sleep(900) }
  await X.pic(w, 's-09-admin-users-ranger')
  const rowTxt = await p.evaluate(id => (document.querySelector(`.acc-row[data-person="${id}"]`)?.innerText || '(no row)').replace(/\s+/g, ' '), rg)
  row('F5', size, "Admin -> Users: Ranger's row", 'not posted out', `row "${rowTxt.slice(0, 250)}"`, 'RECORD', 's-09-admin-users-ranger.png')
  await openCellWindow(rg)
  await tapIt(p.locator('button:visible', { hasText: '⋯' }).last()); await sleep(700)
  await tapIt(p.locator('button:visible', { hasText: /^Post out/ }).first()); await sleep(900)
  await X.pic(w, 's-10-posting-sheet-reopened')
  const sheet = await p.evaluate(() => { const e = [...document.querySelectorAll('button')].find(b => /^Post out$/.test(b.textContent.trim()) && b.getBoundingClientRect().width > 2); let box = e; for (let i = 0; i < 8 && box && box.parentElement && !/PO FROM/i.test(box.innerText || ''); i++) box = box.parentElement; return (box?.innerText || '(no sheet)').replace(/\s+/g, ' ') })
  row('F5', size, 'posting sheet reopened for Ranger', 'a fresh sheet, nothing running', `sheet "${sheet.slice(0, 250)}"`, 'RECORD', 's-10-posting-sheet-reopened.png')
})
await X.fin(w)
