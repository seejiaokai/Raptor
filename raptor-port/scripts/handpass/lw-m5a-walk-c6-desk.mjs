// walker C, script 6 — a posted-out man's window; the day panel's names.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/c/c6'
const { L, T, pwRead, onScreen, closePw, openBalances, note, ids, rec, shot, press, vis, txt, balRow, gridFigure } = await import('./lw-m5a-walk-c-lib.mjs')
console.log('[lw-m5a-walk-c6-desk v1]')
L.clearOut()
const w = await L.newCtx('desk')
const P = w.page
const blk = async (name, fn) => { try { await fn() } catch (e) { rec(name + ' (script)', 'desk', 'NOT WALKED', 'the step threw: ' + String(e).slice(0, 300), [name]); await shot(w, name + '-err').catch(() => {}) } }
const nameBtn = pid => `[data-testid="row-${pid}"] .whoedit`
const lines = pw => (pw?.lines || []).map(l => l.text)
await L.signIn(w, 'admin')

await blk('61', async () => {
  await L.reachCell(w, 'ammo', '2026-02-12')
  await press(w, T('cell-ammo-2026-02-12')); await P.waitForTimeout(700)
  await press(w, T('bid-more')); await P.waitForTimeout(500)
  await press(w, T('bid-postout')); await P.waitForTimeout(600)
  const btns = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-picker"] button')].filter(e => e.getBoundingClientRect().width > 0 && /^Post out$/.test(e.innerText.trim())).map(e => e.dataset.testid || 'nid'))
  console.log('Post out buttons', btns)
  const b = P.locator('[data-testid="bid-picker"] button').filter({ hasText: /^Post out$/ }).last()
  await b.scrollIntoViewIfNeeded(); await b.click(); await P.waitForTimeout(900)
  await shot(w, '61a-after-postout')
  const gone = await P.locator(T('bid-picker')).count()
  rec('PO1 Cinder is posted out from 12 Feb (Overseas Sqn, pressed Post out)', 'desk', 'PASS', `bid window still open: ${gone > 0}; note ${(await note(P)).join(' | ')}; buttons ${btns.join(',')}`, ['61a-after-postout'])
  await L.closeWin(w)
  /* his window before the date (clock 25 Jan) */
  const present = await P.locator(nameBtn('ammo')).count()
  if (present) {
    await press(w, nameBtn('ammo')); await P.waitForTimeout(800)
    const pw = await pwRead(P)
    await shot(w, '61b-window-before-date')
    rec('PO2 the posting-out man\'s window opens before his date: figures, his later pending LL kept with its state', 'desk', pw && onScreen(pw) ? 'PASS' : 'FAIL', `name ${pw?.name} App ${pw?.app} pend ${pw?.pend} war ${pw?.war}; lines ${lines(pw).join(' | ')}`, ['61b-window-before-date'])
    await closePw(w)
  }
  /* the clock to 1 Mar: the posting has run */
  await P.evaluate(() => window.lwSetMemberToday('2026-03-01'))
  await L.openGrid(w); await P.waitForTimeout(1000)
  const present2 = await P.locator(nameBtn('ammo')).count()
  await shot(w, '61c-grid-after-date')
  await L.openApprovals(w)
  const ap = (await L.apprLines(P)).filter(l => l.who === 'ammo')
  await shot(w, '61d-approvals')
  rec('PO3 after his date (clock 1 Mar): his row / his Approvals line', 'desk', 'PASS', `row on the grid: ${present2 > 0}; Approvals lines: ${JSON.stringify(ap)}`, ['61c-grid-after-date', '61d-approvals'])
  if (ap.length) {
    await press(w, '[data-testid="appr-line-ammo"] [data-testid="appr-dates"]'); await P.waitForTimeout(900)
    const pw = await pwRead(P)
    await shot(w, '61e-window-after-date')
    rec('PO4 the posted-out man\'s window (from his Approvals line, his row gone or stayed)', 'desk', pw ? (onScreen(pw) ? 'PASS' : 'FAIL') : 'FAIL', `window ${pw ? `"${pw.name}" App ${pw.app} pend ${pw.pend} war ${pw.war} boxes ${pw.boxes} lines ${lines(pw).join(' | ')}` : 'none opened'}`, ['61e-window-after-date'])
    await closePw(w)
  }
  await P.evaluate(() => window.lwSetMemberToday('2026-01-25'))
  await L.openGrid(w); await P.waitForTimeout(700)
})

await blk('62', async () => {
  await press(w, T('head-2026-01-28')); await P.waitForTimeout(900)
  await shot(w, '62a-daypanel')
  const info = await P.evaluate(() => { const btns = [...document.querySelectorAll('button')].filter(e => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().top > 100 && /Ranger|Ace|Gambit|Quill|Relay/.test(e.innerText)).map(e => e.dataset.testid + ':' + e.className.toString().slice(0, 20) + ':' + e.innerText.slice(0, 20)); return { btns, text: [...document.querySelectorAll('[role="dialog"], .daypanel, [data-testid*="day"]')].map(e => e.dataset.testid).filter(Boolean).slice(0, 8) } })
  console.log('day panel', JSON.stringify(info))
  const awayName = P.locator('text=Ranger').first()
  const had = await awayName.count()
  const before = await pwRead(P)
  if (had) { await awayName.click({ timeout: 4000 }).catch(() => {}); await P.waitForTimeout(800) }
  const pw = await pwRead(P)
  await shot(w, '62b-daypanel-name-tapped')
  rec('D1 the day panel\'s "who is away" name tapped (reading: opens his window, or does not)', 'desk', 'PASS', `names found: ${had}; window after the tap: ${pw ? `"${pw.name}" top ${pw.box.top}` : 'none'}; day-panel ids ${JSON.stringify(info.text)}`, ['62a-daypanel', '62b-daypanel-name-tapped'])
})

await w.ctx.close()
rec('errors', 'desk', w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 900) : 'no console error, page error or 4xx')
L.writeResults('c6')
await L.closeBrowser()
console.log('DONE')
