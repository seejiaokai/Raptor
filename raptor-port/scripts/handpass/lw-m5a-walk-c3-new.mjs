// walker C, script 3 — new since his last visit (★50, 51), another man's window (24), the admin opening Ranger's window (51), reload (the moment kept).
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/c/c3'
const { L, T, pwRead, onScreen, closePw, openBalances, note, topAt, ids, rec, shot, press, vis, txt } = await import('./lw-m5a-walk-c-lib.mjs')
console.log('[lw-m5a-walk-c3-new v1]')
L.clearOut()
const w = await L.newCtx('desk')
const P = w.page
const blk = async (name, fn) => { try { await fn() } catch (e) { rec(name + ' (script)', 'desk', 'NOT WALKED', 'the step threw: ' + String(e).slice(0, 300), [name]); await shot(w, name + '-err').catch(() => {}) } }
const lines = pw => (pw?.lines || []).map(l => `${l.text}${l.dot ? ' [DOT]' : ''}${l.who ? ' {' + l.who + '}' : ''}${l.struck ? ' [STRUCK]' : ''}`)
async function openOwn(w, via = 'my-leave') {
  await L.openGrid(w)
  await press(w, T('my-leave')); await P.waitForTimeout(800)
  return pwRead(P)
}
async function openCellOf(iso, pid = 'bane') {
  await L.reachCell(w, pid, iso)
  await press(w, T(`cell-${pid}-${iso}`)); await P.waitForTimeout(650)
}
async function apprAct(textPart, act) {
  await L.openApprovals(w)
  const line = P.locator('[data-testid="appr-line-bane"]').filter({ hasText: textPart }).first()
  if (!(await line.count())) throw new Error('no Approvals line ' + textPart)
  const b = line.locator(`[data-testid="appr-${act}"]`)
  const bb = await b.boundingBox()
  await L.finger(w, bb.x + bb.width / 2, bb.y + bb.height / 2)
  await P.waitForTimeout(600)
}

await L.signIn(w, 'admin')
/* a first write so the world is a real saved one (the order's §7.7): Anvil gets an approved LL */
await blk('30', async () => {
  await openCellOf('2026-02-03', 'shaft')
  await L.placeLeave(w, 'LL'); await L.closeWin(w)
})
await L.switchTo(w, 'member')

/* ---- Ranger's first visit (writes his last-visit moment), then his own change ---- */
await blk('31', async () => {
  const pw = await openOwn(w)
  await shot(w, '31a-first-visit')
  rec('N0 Ranger opens his own window (My leave): the first visit, no dots', 'desk', pw && pw.lines.length === 8 && !pw.lines.some(l => l.dot) ? 'PASS' : 'FAIL', `window "${pw?.name}" boxes ${pw?.boxes}; lines: ${lines(pw).join(' | ')}`, ['31a-first-visit'])
  await closePw(w)
  /* his own change: a bid of his own on a free open day */
  await openCellOf('2026-02-24')
  const ok = await L.placeLeave(w, 'LL')
  await L.closeWin(w)
  rec('N1 his own change: Ranger places his own LL bid on Tue 24 Feb', 'desk', ok ? 'PASS' : 'NOT WALKED', `placed ${ok}`, [])
})

/* ---- Saber's changes ---- */
await L.switchTo(w, 'admin')
await blk('32', async () => {
  await apprAct('Thu 29 Jan', 'approve'); rec('N2a approve Thu 29 Jan AM', 'desk', 'PASS', 'pressed Approve on its Approvals line', [])
  await apprAct('Thu 12', 'refuse'); rec('N2b refuse Thu 12 – Fri 13 Feb', 'desk', 'PASS', 'pressed Refuse on its Approvals line', [])
  await L.openGrid(w)
  /* put back to a bid: the approved 26–27 Jan leave, second tap on the lit Approve */
  await openCellOf('2026-01-26')
  const lit = await P.locator(T('decide-approve')).evaluate(e => e.className + '|' + e.textContent.trim()).catch(() => null)
  await press(w, T('decide-approve')); await P.waitForTimeout(600)
  const after = await P.locator(T('decide-approve')).evaluate(e => e.className + '|' + e.textContent.trim()).catch(() => null)
  await shot(w, '32c-put-back')
  rec('N2c put back to a bid (26–27 Jan, second tap on the lit Approve)', 'desk', lit !== after ? 'PASS' : 'FAIL', `Approve button before "${lit}", after "${after}"`, ['32c-put-back'])
  await L.closeWin(w)
  /* move: Mon 2 Mar CCL → Wed 4 Mar */
  await openCellOf('2026-03-02')
  await press(w, T('decide-shift')); await P.waitForTimeout(600)
  await L.reachCell(w, 'bane', '2026-03-04')
  await press(w, T('cell-bane-2026-03-04')); await P.waitForTimeout(500)
  if (await vis(P, T('move-confirm'))) { await press(w, T('move-confirm')); await P.waitForTimeout(700) }
  await shot(w, '32d-moved')
  rec('N2d move CCL Mon 2 Mar to Wed 4 Mar', 'desk', 'PASS', `move banner gone: ${!(await vis(P, T('move-banner')))}; note ${(await note(P)).join(' | ')}`, ['32d-moved'])
  /* delete: Tue 17 Mar CL */
  await openCellOf('2026-03-17')
  await press(w, T('bid-clear')); await P.waitForTimeout(500)
  if (await vis(P, T('bid-clear'))) { await press(w, T('bid-clear')); await P.waitForTimeout(600) }
  await L.closeWin(w)
  await shot(w, '32e-deleted')
  rec('N2e delete CL Tue 17 Mar', 'desk', 'PASS', 'pressed Delete (twice if asked)', ['32e-deleted'])
  /* re-type: Mon 16 Mar PL AM → CCL */
  await openCellOf('2026-03-16')
  const moved = await L.placeLeave(w, 'FCL')
  await L.closeWin(w)
  rec('N2f re-type Mon 16 Mar AM from PL to FCL', 'desk', moved ? 'PASS' : 'NOT WALKED', `placed ${moved}`, [])
  /* place one approved by the admin: LL Tue 7 Apr (Auto-approve on) */
  await openCellOf('2026-04-07')
  await L.approveWhatIEnter(w, true)
  const pl = await L.placeLeave(w, 'LL'); await L.closeWin(w)
  rec('N2g admin places LL Tue 7 Apr already approved', 'desk', pl ? 'PASS' : 'NOT WALKED', `placed ${pl}`, [])
  /* the admin opens Ranger's window: must not write Ranger's last visit */
  await L.openGrid(w)
  await press(w, '[data-testid="row-bane"] .whoedit'); await P.waitForTimeout(700)
  const apw = await pwRead(P)
  await shot(w, '32g-admin-opens-ranger')
  rec('N6 (51) the admin opens Ranger\'s window: no dots for him on it', 'desk', apw && !apw.lines.some(l => l.dot) ? 'PASS' : 'FAIL', `lines: ${lines(apw).join(' | ')}`, ['32g-admin-opens-ranger'])
  await closePw(w)
})

/* ---- Ranger opens his window: each change dotted with who, when ---- */
await L.switchTo(w, 'member')
await blk('33', async () => {
  const bell = await (async () => { await L.openBell(w); const b = await L.bellLines(P); await shot(w, '33a-bell'); await L.closeBell(w); return b })()
  const pw = await openOwn(w)
  await shot(w, '33b-ranger-sees-changes')
  await P.locator(T('person-window')).screenshot({ path: L.OUT + '/33b-window-crop.png', scale: 'device' }).catch(() => {})
  const ls = lines(pw)
  await P.evaluate(() => { const pw = document.querySelector('[data-testid="person-window"]'); const sc = [pw, ...pw.querySelectorAll('*')].find(e => e.scrollHeight > e.clientHeight + 2 && /(auto|scroll)/.test(getComputedStyle(e).overflowY)); if (sc) sc.scrollTop = sc.scrollHeight })
  await P.waitForTimeout(400)
  await shot(w, '33b2-scrolled-to-foot')
  const delStyle = await P.evaluate(() => { const l = document.querySelector('[data-testid="pw-line-2026-03-17"]'); if (!l) return null; return [l, ...l.querySelectorAll('*')].map(e => (e.className || '').toString().slice(0, 30) + ':' + getComputedStyle(e).textDecorationLine + ':' + getComputedStyle(e).opacity).join(' | ') })
  console.log('deleted line styles', delStyle)
  rec('N3 Ranger opens his window: the lines Saber changed carry the cyan dot and "who, when"', 'desk', pw && pw.lines.filter(l => l.dot).length >= 5 ? 'PASS' : 'FAIL', `${ls.join(' | ')}`, ['33b-ranger-sees-changes', '33b-window-crop'])
  const own = pw.lines.find(l => /Tue 24 Feb/.test(l.text))
  rec('N4 his own bid (24 Feb) is never dotted', 'desk', own && !own.dot ? 'PASS' : 'FAIL', own ? JSON.stringify(own) : 'line not found', ['33b-ranger-sees-changes'])
  const del = pw.lines.find(l => /17 Mar/.test(l.text))
  rec('N5 the deleted line (17 Mar) stays struck through for that visit', 'desk', del && del.struck ? 'PASS' : (del ? 'FAIL' : 'FAIL'), del ? JSON.stringify(del) : 'no 17 Mar line in the window', ['33b-ranger-sees-changes'])
  rec('N7 bell lines Ranger has after the decisions', 'desk', 'PASS', `bell: ${JSON.stringify(bell.map(b => b.text))}`, ['33a-bell'])
  /* close and reopen: no dots */
  await closePw(w)
  const pw2 = await openOwn(w)
  await shot(w, '33c-reopened')
  rec('N8 close and reopen: no dots, no struck line', 'desk', pw2 && !pw2.lines.some(l => l.dot) && !pw2.lines.some(l => /17 Mar/.test(l.text)) ? 'PASS' : 'FAIL', `${lines(pw2).join(' | ')}`, ['33c-reopened'])
  await closePw(w)
  /* reload: signed out; sign in; his window: still none */
  const out = await L.reloadAtFix?.(w)
  await P.reload()
  await P.waitForSelector('#luser, #vWeek .day', { state: 'attached', timeout: 15000 })
  if (await P.locator('#luser').isVisible().catch(() => false)) await L.signIn(w, 'member'); else await L.openWar(w, 'member')
  const pw3 = await openOwn(w)
  await shot(w, '33d-after-reload')
  rec('N9 reload, sign in, open: still no dots (the visit already written)', 'desk', pw3 && !pw3.lines.some(l => l.dot) ? 'PASS' : 'FAIL', `${lines(pw3).join(' | ')}`, ['33d-after-reload'])
  await closePw(w)
})

/* ---- another man's window, read only (24); OIL › ---- */
await blk('34', async () => {
  await L.openGrid(w)
  await press(w, '[data-testid="row-prism"] .whoedit'); await P.waitForTimeout(800)
  const pw = await pwRead(P)
  await shot(w, '34a-other-readonly')
  await P.locator(T('person-window')).screenshot({ path: L.OUT + '/34a-other-crop.png', scale: 'device' }).catch(() => {})
  rec('O1 Ranger opens Recon\'s window: read only, no boxes, no dots, no "who, when"', 'desk', pw && pw.boxes === 0 && !pw.lines.some(l => l.dot || l.who) ? 'PASS' : 'FAIL', `name ${pw?.name}; boxes ${pw?.boxes}; App ${pw?.app} cf ${pw?.cf} war ${pw?.war}; lines ${lines(pw).join(' | ')}; read-only spans: ${await P.evaluate(() => document.querySelectorAll('[data-testid="person-window"] span.r17-box.ro').length)}`, ['34a-other-readonly', '34a-other-crop'])
  await press(w, T('pw-oil')); await P.waitForTimeout(900)
  const tab = await P.evaluate(() => [...document.querySelectorAll('.lw-tabs [role="tab"]')].filter(e => e.getAttribute('aria-selected') === 'true').map(e => e.dataset.testid).join(','))
  await shot(w, '34b-oil-opened')
  const pwAfter = await pwRead(P)
  rec('O2 OIL "›" in Recon\'s window opens Recon\'s OIL tracker', 'desk', tab === 'oil-tracker' ? 'PASS' : 'FAIL', `tab now "${tab}"; the window afterwards: ${pwAfter ? 'still open "' + pwAfter.name + '"' : 'closed'}; tracker words: ${(await P.evaluate(() => document.querySelector('[data-testid="oil-page"], .oil-tracker, #page-leavewar')?.innerText.replace(/\s+/g, ' ').slice(0, 120)))}`, ['34b-oil-opened'])
})

/* ---- member's own window, boxes and the lock ---- */
await blk('35', async () => {
  await P.keyboard.press('Escape'); await P.waitForTimeout(600)
  await L.openGrid(w)
  const pw = await openOwn(w)
  await shot(w, '35a-own-member')
  rec('O3 a member\'s own window: boxes while unlocked', 'desk', pw && pw.boxes === 7 ? 'PASS' : 'FAIL', `boxes ${pw?.boxes}; lock ${pw?.lock}`, ['35a-own-member'])
  await closePw(w)
})

await w.ctx.close()
rec('errors', 'desk', w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 900) : 'no console error, page error or 4xx')
L.writeResults('c3')
await L.closeBrowser()
console.log('DONE')
