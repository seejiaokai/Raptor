/* msq-fr15-w5 v1 — plain-user round of the bell for Hunter, Ranger and Saber, on W1's world (Hunter files, both move, Kestrel edits). FR15_PHONE=1 for the iPhone. */
process.env.FR15_SC = 'w5'
const L = await import('./msq-fr15-lib.mjs')
const { X, say, sleep, row, tapIt, openAt, putMoves, pidOf, fileLL, openInputs, openRow, closeBell, size } = L
const P = L.phone ? 'phone' : 'desktop'
const pn = (s, what) => `${s}-${P}-${what}`
say('msq-fr15-w5 v1', size)
const w = await openAt('ad2')
const p = w.page
const safe = async (l, fn) => { try { return await fn() } catch (e) { say('ERR', l, String(e.message).split('\n')[0]); await X.pic(w, 'err-' + l).catch(() => {}); row(l, size, 'script step', 'completes', 'script error ' + String(e.message).split('\n')[0], 'OWED', 'err-' + l + '.png') } }
await safe('W5-0', async () => {
  await fileLL(w, 'Ranger', 'Thu 23 Jul 2026', 'orig words')
  const bane = await pidOf(p, 'Ranger'), prowler = await pidOf(p, 'Hunter')
  await putMoves(w, [{ pid: prowler, old: 'u142', to: 'u149', from: '2026-07-16' }, { pid: bane, old: 'u142', to: 'u149', from: '2026-07-16' }])
  await X.login(p, 'ad9'); await openInputs(w); await openRow(w, ['Ranger', 'LL'])
  await p.fill('#inpEditRmk', 'new words by Kestrel'); await L.saveEdit(w)
})
const dot = () => p.evaluate(() => { const d = document.querySelector('#notifyBell .belldot'); return d ? getComputedStyle(d).display : 'no dot' })
const bellBtn = () => p.locator('#notifyBell:visible').first()
const listVis = () => p.locator('[data-testid="bell-list"]:visible').count()
const round = async (user, step, markFirst = false) => {
  await p.reload(); await sleep(1500)   // a window a line opened may still be up: a reload is the way out, sign-in follows
  await X.login(p, user)
  const d0 = await dot()
  await X.pic(w, pn(step, user + '-badge-before'))
  await tapIt(bellBtn()); await sleep(120); await X.pic(w, pn(step, user + '-open-press')); await sleep(800)
  const open1 = await listVis()
  await X.pic(w, pn(step, user + '-open'))
  const lines = await p.evaluate(() => { const l = document.querySelector('[data-testid="bell-list"]'); return l ? [...l.querySelectorAll('.bl-line')].map(e => (e.classList.contains('unread') ? 'NEW ' : 'read ') + e.innerText.replace(/\s+/g, ' ')) : [] })
  const ctl = await p.evaluate(() => { const l = document.querySelector('[data-testid="bell-list"]'); return l ? [...l.querySelectorAll('button, [role=button]')].filter(e => e.getBoundingClientRect().width > 2).map(e => (e.getAttribute('data-testid') || '') + '|' + (e.getAttribute('aria-label') || '') + '|' + e.innerText.trim().slice(0, 30)) : [] })
  say(step, user, 'dot before', d0, 'lines', JSON.stringify(lines), 'controls', JSON.stringify(ctl))
  const landings = []
  let mcount = 0
  const pressMark = async () => {
    const mark = p.locator('[data-testid="bell-markall"]:visible').first()
    mcount = await mark.count()
    say(step, user, 'mark-all control count', mcount)
    if (mcount) {
      await tapIt(mark); await sleep(110); await X.pic(w, pn(step, user + '-markall-press')); await sleep(900)
      await X.pic(w, pn(step, user + '-markall-settled'))
    }
  }
  if (markFirst) await pressMark()
  for (let i = 0; i < lines.length; i++) {
    if (!(await listVis())) { await tapIt(bellBtn()); await sleep(800) }
    const ln = p.locator('[data-testid="bell-list"] .bl-line').nth(i)
    await tapIt(ln); await sleep(110); await X.pic(w, pn(step, `${user}-line${i}-press`)); await sleep(1100)
    const where = await p.evaluate(() => window.CURPAGE)
    const wins = await p.evaluate(() => [...document.querySelectorAll('.inped-win, [data-testid="select-sheet"], [role=dialog]')].filter(e => e.getBoundingClientRect().width > 2).length)
    await X.pic(w, pn(step, `${user}-line${i}-opened`))
    landings.push(`${i}: page ${where}, windows ${wins}, bell open ${await listVis()}`)
    // close what opened (Escape-free: cancel button if a window)
    const cancel = p.locator('#inpEditCancel:visible, [data-testid="sel-cancel"]:visible, [data-testid="bid-cancel"]:visible').first()
    if (await cancel.count()) { await tapIt(cancel); await sleep(700) }
  }
  row('W5-' + step, size, `${user}: open the bell, read lines, press each line`, 'every line opens its place; nothing breaks', `dot before ${d0}; bell opened ${open1}; lines ${JSON.stringify(lines)}; ${landings.join(' ; ')}`, open1 ? 'PASS' : 'FAIL', pn(step, user + '-open') + '.png')
  if (!(await listVis())) { await tapIt(bellBtn()); await sleep(800) }
  if (!markFirst) await pressMark()
  const after = await p.evaluate(() => { const l = document.querySelector('[data-testid="bell-list"]'); return l ? [...l.querySelectorAll('.bl-line')].map(e => (e.classList.contains('unread') ? 'NEW ' : 'read ') + e.innerText.replace(/\s+/g, ' ')) : null })
  row('W5-' + step + 'm', size, `${user}: Mark all read`, 'all lines read; badge dot gone after closing', `mark-all controls ${mcount}; lines after ${JSON.stringify(after)}`, mcount ? (after && after.every(l => /^read/.test(l)) ? 'PASS' : 'FAIL') : 'BLOCKED', pn(step, user + '-markall-settled') + '.png')
  if (await listVis()) { await tapIt(bellBtn()); await sleep(120); await X.pic(w, pn(step, user + '-close-press')); await sleep(600) }
  const closed = !(await listVis())
  await X.pic(w, pn(step, user + '-badge-after'))
  const d1 = await dot()
  row('W5-' + step + 'c', size, `${user}: close the bell with its button, badge after`, 'bell closed; dot gone if all read', `closed ${closed}; dot before ${d0} after ${d1}`, closed ? 'PASS' : 'FAIL', pn(step, user + '-badge-after') + '.png')
  // reopen and close by a press elsewhere
  await tapIt(bellBtn()); await sleep(800)
  const xs = p.locator('[data-testid="bell-list"] button:visible', { hasText: /^(✕|×|Close)$/ }).first()
  if (await xs.count()) { await tapIt(xs); await sleep(110); await X.pic(w, pn(step, user + '-x-press')); await sleep(600); say(step, user, 'x close: list shown', await listVis()) }
  else {
    if (L.phone) await p.touchscreen.tap(200, 820); else await p.mouse.click(700, 760)
    await sleep(700)
    say(step, user, 'no x control; outside press closed:', !(await listVis()))
  }
  await X.pic(w, pn(step, user + '-after-outside'))
  if (await listVis()) await closeBell(w)
}
await safe('W5-h', async () => { await round('ad2', 's1') })
await safe('W5-r', async () => { await round('us', 's2', true) })
await safe('W5-s', async () => { await round('ad', 's3') })
await X.pic(w, pn('s9', 'whole-screen'))
await X.fin(w)
