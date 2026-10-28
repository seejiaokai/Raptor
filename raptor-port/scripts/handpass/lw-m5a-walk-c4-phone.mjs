// walker C, script 4 — the phone's ways in to the person window (402 x 874, touch): his own with dots, another man's read only, locked.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/c/c4'
const { L, T, pwRead, closePw, openBalances, note, topAt, ids, rec, shot, press, step, vis, txt, balRow, gridFigure } = await import('./lw-m5a-walk-c-lib.mjs')
console.log('[lw-m5a-walk-c4-phone v1]')
L.clearOut()
const w = await L.newCtx('phone')
const P = w.page
const SZ = 'phone'
const blk = async (name, fn) => { try { await fn() } catch (e) { rec(name + ' (script)', SZ, 'NOT WALKED', 'the step threw: ' + String(e).slice(0, 300), [name]); await shot(w, name + '-err').catch(() => {}) } }
const lines = pw => (pw?.lines || []).map(l => `${l.text}${l.dot ? ' [DOT]' : ''}${l.who ? ' {' + l.who + '}' : ''}`)
const mid = pw => pw ? `left margin ${pw.box.left}, right margin ${pw.vw - pw.box.right}, top ${pw.box.top}, bottom ${pw.vh - pw.box.bottom} from the foot, height ${pw.box.height} of ${pw.vh}; centre ${Math.round((pw.box.top + pw.box.bottom) / 2)} vs screen centre ${pw.vh / 2}` : 'no window'
async function apprAct(textPart, act) {
  await L.openApprovals(w)
  const line = P.locator('[data-testid="appr-line-bane"]').filter({ hasText: textPart }).first()
  const b = line.locator(`[data-testid="appr-${act}"]`)
  await b.scrollIntoViewIfNeeded()
  const bb = await b.boundingBox()
  await L.finger(w, bb.x + bb.width / 2, bb.y + bb.height / 2)
  await P.waitForTimeout(600)
}
async function closeWindow() { const pw = await pwRead(P); if (pw) { await press(w, T('pw-close')); await P.waitForTimeout(450) } }

await L.signIn(w, 'admin')
/* ---- ways in, admin ---- */
await blk('40', async () => {
  await step(w, '40a-name', '[data-testid="row-bane"] .whoedit')
  const pw = await pwRead(P)
  rec('PH1 a name on the grid opens his window in the middle of the screen', SZ, pw && /Ranger/.test(pw.name) ? 'PASS' : 'FAIL', `${mid(pw)}; App ${pw?.app} pend ${pw?.pend} war ${pw?.war}; lines ${pw?.lines.length}; boxes ${pw?.boxes}`, ['40a-name', '40a-name-q'])
  await P.locator(T('person-window')).screenshot({ path: L.OUT + '/40a-window-crop.png', scale: 'device' }).catch(() => {})
  /* the scrim / the grid behind: a tap outside */
  const outside = await P.evaluate(() => { const pw = document.querySelector('[data-testid="person-window"]').getBoundingClientRect(); return { x: 200, y: Math.round(pw.top / 2) } })
  const sc = await P.evaluate(() => { const r = document.querySelector('[data-testid="person-window"]').getBoundingClientRect(); const h = document.elementFromPoint(200, Math.max(5, r.top / 2)); return h?.className?.toString().slice(0, 40) || h?.tagName })
  await closeWindow()
  rec('PH1b ✕ closes it', SZ, !(await pwRead(P)) ? 'PASS' : 'FAIL', `element above the window (the scrim?): ${sc}`, [])
  await step(w, '40b-lve-figure', T('bal-bane'))
  const pw2 = await pwRead(P)
  rec('PH2 the LVE figure beside a name opens the window', SZ, pw2 && /Ranger/.test(pw2.name) ? 'PASS' : 'FAIL', `${mid(pw2)}; figure "${await gridFigure(P, 'bane')}"`, ['40b-lve-figure', '40b-lve-figure-q'])
  await closeWindow()
  const mlVis = await vis(P, T('my-leave'))
  if (mlVis) {
    await step(w, '40c-myleave', T('my-leave'))
    const pw3 = await pwRead(P)
    rec('PH3 My leave (Saber) opens his own window', SZ, pw3 && /Saber/.test(pw3.name) ? 'PASS' : 'FAIL', `${mid(pw3)}; boxes ${pw3?.boxes}`, ['40c-myleave', '40c-myleave-q'])
    await closeWindow()
  } else rec('PH3 My leave', SZ, 'NOT WALKED', 'My leave not visible', [])
  await openBalances(w)
  await step(w, '40d-balances-name', T('bal-name-bane'))
  const pw4 = await pwRead(P)
  rec('PH4 a name on the Balances page opens his window', SZ, pw4 && /Ranger/.test(pw4.name) ? 'PASS' : 'FAIL', `${mid(pw4)}; the Balances page behind drawn: ${await vis(P, T('balances-page'))}`, ['40d-balances-name', '40d-balances-name-q'])
  await closeWindow()
  await L.openGrid(w)
})
/* a first write, then Ranger's first visit */
await blk('41', async () => {
  await L.reachCell(w, 'shaft', '2026-02-03')
  await press(w, T('cell-shaft-2026-02-03')); await P.waitForTimeout(700)
  await L.placeLeave(w, 'LL'); await L.closeWin(w)
})
await L.switchTo(w, 'member')
await blk('42', async () => {
  await press(w, T('my-leave')); await P.waitForTimeout(800)
  const pw = await pwRead(P)
  await shot(w, '42a-first-visit')
  rec('PH5 Ranger (member) opens his own: first visit, boxes, no dots', SZ, pw && pw.boxes === 7 && !pw.lines.some(l => l.dot) ? 'PASS' : 'FAIL', `${mid(pw)}; boxes ${pw?.boxes}; ${lines(pw).join(' | ')}`, ['42a-first-visit'])
  await closeWindow()
})
await L.switchTo(w, 'admin')
await blk('43', async () => {
  await apprAct('29 Jan', 'approve')
  await apprAct(/12\s*[–-]\s*13 Feb/, 'refuse')
  rec('PH6 Saber approves 29 Jan AM and refuses 12–13 Feb on the phone\'s Approvals', SZ, 'PASS', 'pressed Approve and Refuse on their lines', [])
  await L.openGrid(w)
})
await L.switchTo(w, 'member')
await blk('44', async () => {
  await press(w, T('my-leave')); await P.waitForTimeout(900)
  const pw = await pwRead(P)
  await shot(w, '44a-own-with-dots')
  await P.locator(T('person-window')).screenshot({ path: L.OUT + '/44a-own-crop.png', scale: 'device' }).catch(() => {})
  rec('PH7 his own window on the phone: the two lines Saber decided are dotted with "who, when"', SZ, pw && pw.lines.filter(l => l.dot).length === 2 ? 'PASS' : 'FAIL', `${mid(pw)}; ${lines(pw).join(' | ')}`, ['44a-own-with-dots', '44a-own-crop'])
  await closeWindow()
  /* another man's, read only */
  await press(w, '[data-testid="row-prism"] .whoedit'); await P.waitForTimeout(800)
  const pwo = await pwRead(P)
  await shot(w, '44b-other')
  await P.locator(T('person-window')).screenshot({ path: L.OUT + '/44b-other-crop.png', scale: 'device' }).catch(() => {})
  rec('PH8 Ranger opens Recon\'s window: read only (m5a-p6-phone-other)', SZ, pwo && pwo.boxes === 0 && !pwo.lines.some(l => l.dot) ? 'PASS' : 'FAIL', `${mid(pwo)}; boxes ${pwo?.boxes}; App ${pwo?.app}; lines ${pwo?.lines.length}`, ['44b-other', '44b-other-crop'])
  await closeWindow()
  /* a leave line tapped: the grid goes there, the window? */
  await press(w, T('my-leave')); await P.waitForTimeout(800)
  const g = P.locator('[data-testid="pw-line-2026-03-02"] button.ll-go')
  if (await g.count()) {
    await press(w, '[data-testid="pw-line-2026-03-02"] button.ll-go'); await P.waitForTimeout(1000)
    const pwx = await pwRead(P)
    const cellOK = await P.evaluate(() => { const c = document.querySelector('[data-testid="cell-bane-2026-03-02"]'); if (!c) return 'cell not drawn'; const r = c.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return `cell at ${Math.round(r.left)},${Math.round(r.top)} size ${Math.round(r.width)}x${Math.round(r.height)}; top element ${h === c || c.contains(h) ? 'the cell' : (h?.closest('[data-testid="person-window"]') ? 'the window' : h?.className?.toString().slice(0, 30))}; ringed ${/lw-ring/.test(c.className)}` })
    await shot(w, '44c-line-tapped')
    rec('PH9 a leave line tapped on the phone takes the grid there; the window leaves the day free', SZ, !pwx || (cellOK.includes('the cell')) ? 'PASS' : 'FAIL', `window after: ${pwx ? 'open ' + mid(pwx) : 'closed'}; ${cellOK}`, ['44c-line-tapped'])
    if (pwx) await closeWindow()
  } else rec('PH9 a leave line tapped', SZ, 'NOT WALKED', 'no button.ll-go', [])
})
/* locked: the member's window and the admin's */
await blk('45', async () => {
  const lb = await (await import('./lw-m5a-walk-c-lib.mjs')).L && null
  await L.switchTo(w, 'admin')
  await openBalances(w)
  await step(w, '45a-lock-on', T('bal-lock'))
  await closeWindow()
  await L.openGrid(w)
  await press(w, T('my-leave')); await P.waitForTimeout(800)
  await press(w, T('pw-close')); await P.waitForTimeout(400)
  await press(w, '[data-testid="row-bane"] .whoedit'); await P.waitForTimeout(800)
  const pa = await pwRead(P)
  await shot(w, '45b-admin-locked-window')
  rec('PH10 locked: the admin\'s window of Ranger keeps its boxes, "Locked for members"', SZ, pa && pa.boxes === 7 && /Locked for members/.test(pa.lock || '') ? 'PASS' : 'FAIL', `lock words "${pa?.lock}"; boxes ${pa?.boxes}`, ['45b-admin-locked-window'])
  await closeWindow()
  await L.switchTo(w, 'member')
  await press(w, T('my-leave')); await P.waitForTimeout(800)
  const pm = await pwRead(P)
  await shot(w, '45c-member-locked-window')
  await P.locator(T('person-window')).screenshot({ path: L.OUT + '/45c-member-locked-crop.png', scale: 'device' }).catch(() => {})
  rec('PH11 locked: his own window reads only, "Locked by admin" (m5a-p5-phone-locked)', SZ, pm && pm.boxes === 0 && /Locked by admin/.test(pm.lock || '') ? 'PASS' : 'FAIL', `lock words "${pm?.lock}"; boxes ${pm?.boxes}; App ${pm?.app} cf ${pm?.cf}; read-only spans ${await P.evaluate(() => document.querySelectorAll('[data-testid="person-window"] span.r17-box.ro').length)}`, ['45c-member-locked-window', '45c-member-locked-crop'])
  await closeWindow()
})
await w.ctx.close()
rec('errors', SZ, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 900) : 'no console error, page error or 4xx')
L.writeResults('c4')
await L.closeBrowser()
console.log('DONE')
