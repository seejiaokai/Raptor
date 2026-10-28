// Walker B, script 4: the person window on a phone and the new-since-his-last-visit dots (Chromium 402 x 874).
// Ranger opens his window (his visit is written) -> Saber approves one and refuses one -> Ranger opens it: dots, who and when.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/b'
const B = await import('./lw-m5a-walk-b-lib.mjs')
const { L, T, rec, shot, press, openBalances, balRow, pwRead, closePw, vis, reloadAt, box } = B
console.log('[lw-m5a-walk-b4 v1]')
const w = await L.newCtx('phone')
const P = w.page
const S = async (name, fn) => { try { await fn() } catch (e) { rec(name, '402', 'NOT WALKED', 'script stopped: ' + String(e).slice(0, 250), []); await shot(w, 'err-' + name.replace(/\W+/g, '-')).catch(() => {}) } }
const fmt = pw => pw ? `${pw.name}: taken ${pw.taken}; LVE tile "${pw.lve}"; pending ${pw.pend}; war ${pw.war}; cf ${pw.cf}; OIL ${pw.oil}; MED ${pw.med}; others ${JSON.stringify(pw.other)}; boxes ${pw.boxes}; lock "${pw.lock}"; year ${pw.year?.value} [${pw.year?.options.join(' / ')}]; window x ${pw.box.left}-${pw.box.right}, y ${pw.box.top}-${pw.box.bottom} of ${pw.vw}x${pw.vh}` : 'no window'
const lines = pw => pw.lines.map(l => `${l.text}${l.dot ? ' [DOT]' : ''}${l.who ? ' {' + l.who + '}' : ''}`).join(' | ')
const inScreen = pw => pw && pw.box.left >= 0 && pw.box.right <= pw.vw && pw.box.top >= 0 && pw.box.bottom <= pw.vh

await L.signIn(w, 'member')
await S('p-own-first', async () => {
  await L.openGrid(w)
  await press(w, T('my-leave'), 'q1-myleave-q'); await P.waitForTimeout(700)
  await shot(w, 'q1-own-first')
  const pw = await pwRead(P)
  rec('14/24 My leave opens his own window (first visit, member)', '402', pw && /Ranger/.test(pw.name) && inScreen(pw) && pw.boxes > 0 && !pw.lines.some(l => l.dot) ? 'PASS' : 'FAIL', `${fmt(pw)}; lines: ${pw && lines(pw)}`, ['q1-myleave-q', 'q1-own-first'])
  console.log('own window scroll check', JSON.stringify(await P.evaluate(() => { const pw = document.querySelector('[data-testid="person-window"]'); const l = document.querySelector('[data-testid="pw-list"]'); return { pwScroll: pw.scrollHeight + '/' + pw.clientHeight, listScroll: l ? l.scrollHeight + '/' + l.clientHeight : null } })))
  rec('close', '402', 'NOTE', `closed by ${await closePw(w)}`, [])
})
await S('admin-decides', async () => {
  await L.switchTo(w, 'admin')
  await L.openApprovals(w)
  await shot(w, 'q2-approvals')
  const all = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="appr-line-bane"]')].filter(e => e.getBoundingClientRect().height > 0).map((e, i) => ({ i, id: e.dataset.testid, text: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 140) })))
  console.log('Ranger lines on Approvals:', JSON.stringify(all))
  if (all.length < 2) throw new Error('fewer than two lines for Ranger: ' + all.length)
  const sel = i => `[data-testid^="appr-line-bane"]:nth-of-type(${i + 1})`
  /* approve the first line, refuse the second (by each line's own buttons) */
  const ids = all.map(a => a.id)
  const press1 = async (idx, kind) => {
    const c = await P.evaluate(({ idx, kind }) => { const l = [...document.querySelectorAll('[data-testid^="appr-line-bane"]')].filter(e => e.getBoundingClientRect().height > 0)[idx]; const b = l.querySelector(`[data-testid="appr-${kind}"]`); b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } }, { idx, kind })
    await P.waitForTimeout(300)
    const c2 = await P.evaluate(({ idx, kind }) => { const l = [...document.querySelectorAll('[data-testid^="appr-line-bane"]')].filter(e => e.getBoundingClientRect().height > 0)[idx]; const b = l.querySelector(`[data-testid="appr-${kind}"]`); const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } }, { idx, kind })
    await L.finger(w, c2.x, c2.y, `q2-${kind}-q`); await P.waitForTimeout(600)
  }
  const before = await balRow(P, 'bane').catch(() => null)
  await press1(0, 'approve'); await shot(w, 'q2-approved')
  const after = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="appr-line-bane"]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 100) + ' ' + e.className))
  console.log('after approve:', JSON.stringify(after))
  await press1(1, 'refuse'); await shot(w, 'q2-refused')
  rec('50 admin approves line 1 and refuses line 2 of Ranger (phone)', '402', 'NOTE', `lines before: ${all.map(a => a.text).join(' || ')}`, ['q2-approved', 'q2-refused'])
})
await S('member-sees-dots', async () => {
  await L.switchTo(w, 'member')
  await openBalances(w)
  const rb = await balRow(P, 'bane')
  await press(w, T('bal-name-bane'), 'q3-name-q'); await P.waitForTimeout(700)
  await shot(w, 'q3-own-dots')
  const pw = await pwRead(P)
  const dotted = pw ? pw.lines.filter(l => l.dot) : []
  rec('50 his own window after Saber decided two: dots with who and when', '402', pw && inScreen(pw) && dotted.length >= 2 && dotted.every(l => /Saber/.test(l.who)) ? 'PASS' : 'FAIL', `Balances row before: App ${rb.app}, pending ${rb.pend}, war ${rb.war}; ${fmt(pw)}; dotted ${dotted.length}: ${pw && lines(pw)}`, ['q3-name-q', 'q3-own-dots'])
  await P.evaluate(() => { const l = document.querySelector('[data-testid="pw-list"]') || document.querySelector('[data-testid="person-window"]'); l.scrollTop = 0 })
  /* the window's own scroll: scroll the list to see all lines */
  await P.evaluate(() => { const pw = document.querySelector('[data-testid="person-window"]'); const sc = [...pw.querySelectorAll('*')].find(e => e.scrollHeight > e.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(e).overflowY)); if (sc) sc.scrollTop = sc.scrollHeight })
  await P.waitForTimeout(400); await shot(w, 'q3-own-dots-scrolled')
  rec('close', '402', 'NOTE', `closed by ${await closePw(w)}`, [])
  await press(w, T('bal-name-bane')); await P.waitForTimeout(700)
  const pw2 = await pwRead(P); await shot(w, 'q3-own-reopen')
  rec('50 close and reopen: no dots', '402', pw2 && !pw2.lines.some(l => l.dot) ? 'PASS' : 'FAIL', `dots ${pw2?.lines.filter(l => l.dot).length}; ${pw2 && lines(pw2)}`, ['q3-own-reopen'])
  await closePw(w)
  const so = await reloadAt(w, process.env.LW_TODAY)
  if (so) await L.signIn(w, 'member'); else await L.openWar(w, 'member')
  await openBalances(w)
  await press(w, T('bal-name-bane')); await P.waitForTimeout(700)
  const pw3 = await pwRead(P); await shot(w, 'q3-own-after-reload')
  rec('50 reload: still no dots (the moment kept)', '402', pw3 && !pw3.lines.some(l => l.dot) ? 'PASS' : 'FAIL', `signed out by the reload: ${so}; dots ${pw3?.lines.filter(l => l.dot).length}`, ['q3-own-after-reload'])
  await closePw(w)
})
await S('other-mans-window', async () => {
  /* another man's window, read only: Recon (pid prism) */
  await press(w, T('bal-name-prism'), 'q4-other-q'); await P.waitForTimeout(700)
  await shot(w, 'q4-other')
  const pw = await pwRead(P)
  rec('24 another man\'s window (Recon), read only', '402', pw && /Recon/.test(pw.name) && pw.boxes === 0 && !pw.lines.some(l => l.dot) && inScreen(pw) ? 'PASS' : 'FAIL', `${fmt(pw)}; lines ${pw && lines(pw)}`, ['q4-other-q', 'q4-other'])
  /* OIL › opens his OIL tracker */
  const oil = await vis(P, T('pw-oil'))
  if (oil) { await press(w, T('pw-oil'), 'q4-oil-q'); await P.waitForTimeout(800); await shot(w, 'q4-oil-tracker'); rec('24 OIL > in another man\'s window opens his OIL tracker', '402', 'NOTE', `oil tab selected: ${await P.evaluate(() => document.querySelector('[data-testid="oil-tracker"]')?.getAttribute('aria-selected'))}; window still open: ${await vis(P, T('person-window'))}; page text start: ${(await P.evaluate(() => document.body.innerText.slice(0, 0)))}`, ['q4-oil-q', 'q4-oil-tracker']) }
  await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  await closePw(w).catch(() => {})
})
await S('locked-window', async () => {
  await L.openGrid(w); await openBalances(w)
  const lb = await B.lockViaBridge(w, true); await P.waitForTimeout(600)
  await shot(w, 'q5-locked-page')
  await press(w, T('bal-name-bane'), 'q5-locked-q'); await P.waitForTimeout(700)
  await shot(w, 'q5-locked-own-window')
  const pw = await pwRead(P)
  rec('42/24 his own window while locked: read only, "Locked by admin"', '402', lb.ok && pw && pw.boxes === 0 && /Locked by admin/.test(pw.lock || '') ? 'PASS' : 'FAIL', `lock helper ${JSON.stringify(lb)}; ${fmt(pw)}`, ['q5-locked-q', 'q5-locked-own-window'])
  await closePw(w)
  await B.lockViaBridge(w, false); await P.waitForTimeout(500)
})
rec('errors', '402', w.errs.length ? 'FAIL' : 'PASS', B.errsOf(w), [])
L.writeResults('b4')
await w.ctx.close(); await L.closeBrowser()
