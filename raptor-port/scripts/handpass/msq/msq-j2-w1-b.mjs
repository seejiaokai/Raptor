/* msq-j2-w1-b v1 — W1-B and W1-C: master vs 149's admin; Archive, Delete, Restore, rename, history. One world. */
process.env.MSQ_WHO = 'w1'
process.env.MSQ_RUN = process.env.MSQ_RUN || 'b1'
const Hm = await import('./msq-j2-w1-h2.mjs')
const H = await (await import('./msq-j2-w1-h.mjs')).mk()
const G = await import('./msq-j2-w1-h3.mjs')
const { X, U, say, sleep, row } = H
const { iso, T } = Hm
const ONLY = (process.env.ONLY || 'B1,B2,B3,B4,B5,B6,C').split(',')
say('msq-j2-w1-b v1', ONLY.join(','))
const w = await X.open({ user: 'ad9' })
const p = w.page
const step = async (name, fn) => { try { await fn() } catch (e) { say('STEP FAILED', name, e.message.slice(0, 200)); try { await X.pic(w, 'fail-' + name) } catch {} ; row(name, 'desktop', 'script step', 'completes', 'script error: ' + e.message.slice(0, 150), 'OWED', 'fail-' + name + '.png') } }
const pids = {}
for (const n of ['Harrier', 'Heron', 'Raven', 'Shrike', 'Gannet', 'Condor', 'Falcon']) pids[n] = await U.pidOf(p, n)
say('pids', JSON.stringify(pids))
const T1 = iso(T, -1), T7 = iso(T, 7), T2 = iso(T, 2), T3m = iso(T, -3)
const lw = async () => { await X.L.go(p, 'leavewar'); await sleep(2500) }
const oilOf = t => (t.match(/OIL\s+[-\d.]+/) || ['(no OIL figure)'])[0]
const dayDump = async cs => {
  const pid = pids[cs]
  const days = []; for (let n = -4; n <= 9; n++) days.push(iso(T, n))
  return G.sig(await Hm.lwRow(p, pid, days))
}
async function grant(cs, d, why) {
  const pid = pids[cs]
  const cell = p.locator(`[data-testid="cell-${pid}-${d}"]`).first()
  await cell.scrollIntoViewIfNeeded(); await cell.click(); await sleep(900)
  await p.getByRole('button', { name: 'Grant OIL' }).click(); await sleep(700)
  await p.locator('input[placeholder^="why"]').fill(why)
  await p.getByRole('button', { name: /^Give (FO|HO)/ }).click(); await sleep(900)
  await p.keyboard.press('Escape'); await sleep(500)
}
async function admArchive(cs) {
  const o = await H.openRow(w, cs)
  await p.locator('#accEdArchive').click(); await sleep(900)
  return (await U.bodyText(p)).match(/[A-Za-z]+ archived[^.]{0,60}/)?.[0] || '(no archived note)'
}
async function openArchivedRow(cs) {
  await H.usersPage(w)
  await p.locator(H.FIND).fill(cs); await sleep(600)
  const tap = p.locator(`.acc-row[data-person="${pids[cs]}"] .acc-tap`).first()
  if (!(await tap.isVisible().catch(() => false))) {
    const fold = p.getByRole('button', { name: /Archived/ }).first()
    if (await fold.count()) { await fold.click(); await sleep(600) }
  }
  if (!(await p.locator('#accArPostIn, #accArCs').first().isVisible().catch(() => false))) { await tap.click(); await sleep(800) }
}
const undoState = () => p.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? 'disabled=' + b.disabled + ' aria-disabled=' + b.getAttribute('aria-disabled') + ' title="' + (b.title || '') + '" aria-label="' + (b.getAttribute('aria-label') || '') + '" class=' + b.className : '(no #undoBtn)' })
const manOnUsers = (cs) => p.evaluate(([c]) => !![...document.querySelectorAll('.acc-row')].find(r => new RegExp('(^|\\s)' + c + '\\b').test(r.innerText)), [cs])
async function pickDate(d) {
  await p.locator('#accArPostIn').click(); await sleep(600)
  await p.locator(`[data-testid="dcal-day-${d}"]`).click(); await sleep(700)
}
const bodyTail = async re => (await U.bodyText(p)).match(re)?.[0] || '(not on screen)'

if (ONLY.includes('B1')) await step('B1', async () => {
  await lw()
  for (const cs of ['Harrier', 'Heron', 'Raven', 'Shrike']) { await grant(cs, T1, 'j2 walk T-1'); await grant(cs, T7, 'j2 walk T+7') }
  for (const cs of ['Harrier', 'Heron', 'Raven', 'Shrike']) {
    const r = await G.rowClip(w, X, 'b1-' + cs, pids[cs], cs)
    const win = await G.personWin(w, X, 'b1-' + cs, pids[cs])
    await p.keyboard.press('Escape'); await sleep(400)
    row('W1-B1', 'desktop', `ad9 grants ${cs} an OIL award by hand (a day cell → its window → Grant OIL, a reason, Give FO) on T-1 ${T1} and T+7 ${T7}`, 'FO boxes on both days', 'T-1: ' + r[T1] + ' ; T+7: ' + r[T7] + ' ; person window: ' + oilOf(win), /FO/.test(r[T1]) && /FO/.test(r[T7]) ? 'PASS' : 'FAIL', `b1-${cs}-row.png / b1-${cs}-win.png`)
  }
})

const before = {}
if (ONLY.includes('B2')) await step('B2', async () => {
  await H.swap(w, 'ad')
  const a = await admArchive('Harrier'); await X.pic(w, 'b2-01-ad-archived-harrier')
  await H.swap(w, 'ad9')
  const b = await admArchive('Heron'); await X.pic(w, 'b2-02-ad9-archived-heron')
  say('B2 notes', a, '|', b)
  await lw()
  const rh = await G.rowClip(w, X, 'b2-Harrier', pids.Harrier, 'Harrier'); const wh = await G.personWin(w, X, 'b2-Harrier', pids.Harrier); await p.keyboard.press('Escape'); await sleep(300)
  const re = await G.rowClip(w, X, 'b2-Heron', pids.Heron, 'Heron'); const we = await G.personWin(w, X, 'b2-Heron', pids.Heron); await p.keyboard.press('Escape'); await sleep(300)
  before.h = G.sig(rh); before.e = G.sig(re)
  say('B2 Harrier', before.h); say('B2 Heron', before.e)
  row('W1-B2', 'desktop', 'ad archives Harrier; ad9 archives Heron; 149 war rows compared', 'same look; T-1 award kept on both; T+7 award the SAME on both', 'Harrier: ' + before.h + ' ; OIL ' + oilOf(wh) + ' ;; Heron: ' + before.e + ' ; OIL ' + oilOf(we), before.h === before.e ? 'PASS' : 'FAIL', 'b2-Harrier-row.png vs b2-Heron-row.png')
  row('W1-B2', 'desktop', 'what each man\'s T+7 award does', 'the same for both', 'Harrier T+7 ' + rh[T7] + ' ; Heron T+7 ' + re[T7], 'RECORD', 'b2-Harrier-row.png')
})

if (ONLY.includes('B3')) await step('B3', async () => {
  await H.swap(w, 'ad')
  const o = await H.openRow(w, 'Raven')
  await p.locator('#accEdDel').click(); await sleep(800)
  await X.pic(w, 'b3-01-ad-raven-delete-first')
  const w1 = await bodyTail(/Tap again to delete Raven.{0,160}/)
  await p.locator('#accEdCancel').click(); await sleep(700)
  await X.pic(w, 'b3-02-after-cancel')
  await p.locator(`.acc-row[data-person="${pids.Raven}"] .acc-tap`).first().click(); await sleep(800)
  await X.pic(w, 'b3-03-reopened')
  const lab = await p.locator('#accEdDel').textContent()
  row('W1-B3', 'desktop', 'ad: Raven → Delete (first press), Cancel, reopen', 'first press arms ("Tap again to delete Raven"); after Cancel and reopen Delete is not armed', 'first press: ' + w1 + ' ; after reopen the button reads: ' + lab.trim(), /^Delete$/.test(lab.trim()) && /Tap again/.test(w1) ? 'PASS' : 'FAIL', 'b3-01..03')
  await p.locator('#accEdDel').click(); await sleep(700)
  await p.locator('#accEdDel').click(); await sleep(1200)
  await X.pic(w, 'b3-04-ad-raven-deleted')
  const t = await U.bodyText(p)
  say('B3 raven after', /Raven/.test(t.slice(0, 0)) ? '' : '', (t.match(/Raven[^.]{0,80}/) || ['(Raven not on screen)'])[0])
  const us0 = await undoState()
  const un = p.locator('#undoBtn').first()
  const hov = await un.hover({ timeout: 3000 }).then(() => 'hovered').catch(() => 'hover failed')
  await sleep(700); await X.pic(w, 'b3-05-ad-undo-hover')
  const clicked = await un.click({ timeout: 3000 }).then(() => 'clicked').catch(e => 'press refused: ' + e.message.split('\n')[0].slice(0, 60))
  await sleep(1000)
  await X.pic(w, 'b3-05b-ad-after-undo')
  await H.usersPage(w); await p.locator(H.FIND).fill('Raven'); await sleep(700)
  await X.pic(w, 'b3-06-raven-search')
  const back = await manOnUsers('Raven')
  row('W1-B3', 'desktop', 'ad deletes Raven (two presses), then top-bar Undo once', 'Undo does not bring him back (D350)', 'Undo button: ' + us0 + ' ; ' + hov + ' ; ' + clicked + ' ; Raven on Users list: ' + back, !back ? 'PASS' : 'FAIL', 'b3-05, b3-05b, b3-06')
  await H.swap(w, 'ad9')
  await H.openRow(w, 'Shrike')
  await p.locator('#accEdDel').click(); await sleep(700)
  await p.locator('#accEdDel').click(); await sleep(1200)
  await X.pic(w, 'b3-07-ad9-shrike-deleted')
  const us1 = await undoState()
  const clicked2 = await p.locator('#undoBtn').first().click({ timeout: 3000 }).then(() => 'clicked').catch(e => 'press refused: ' + e.message.split('\n')[0].slice(0, 60)); await sleep(900)
  await H.usersPage(w); await p.locator(H.FIND).fill('Shrike'); await sleep(700)
  await X.pic(w, 'b3-08-shrike-search')
  const back2 = await manOnUsers('Shrike')
  row('W1-B3', 'desktop', 'ad9 deletes Shrike (two presses), then Undo once', 'Undo does not bring him back', 'Undo button: ' + us1 + ' ; ' + clicked2 + ' ; Shrike on Users list: ' + back2, !back2 ? 'PASS' : 'FAIL', 'b3-07, b3-08')
  await lw()
  const sr = await G.rowClip(w, X, 'b3-Shrike', pids.Shrike, 'Shrike').catch(e => ({ err: e.message }))
  const rr = await G.rowClip(w, X, 'b3-Raven', pids.Raven, 'Raven').catch(e => ({ err: e.message }))
  const ss = sr.err ? sr.err : G.sig(sr), rs = rr.err ? rr.err : G.sig(rr)
  say('B3 Raven', rs); say('B3 Shrike', ss)
  row('W1-B3', 'desktop', "149's war: Raven's (deleted by ad) and Shrike's (by ad9) rows", 'same for both: months before T kept, T-1 award kept, T+7 award gone', 'Raven: ' + rs + ' ;; Shrike: ' + ss, rs === ss && !/^\S*$/.test(rs) ? 'PASS' : 'FAIL', 'b3-Raven-row.png vs b3-Shrike-row.png')
})

if (ONLY.includes('B4')) await step('B4', async () => {
  await H.swap(w, 'ad')
  await openArchivedRow('Harrier')
  await pickDate(T3m)
  await X.pic(w, 'b4-01-ad-harrier-Tminus3-picked')
  const pi = await p.locator('#accArPostIn').textContent()
  await p.locator('#accArRestore').click(); await sleep(1000)
  await X.pic(w, 'b4-02-ad-harrier-Tminus3-restore-pressed')
  const t = await U.bodyText(p)
  row('W1-B4', 'desktop', `ad: archived Harrier, post-in ${T3m} (before T), Restore`, 'refused, nothing changes', 'date box: ' + pi.trim() + ' ; words: ' + (t.match(/Posted out from.{0,90}/i) || t.match(/.{0,80}(can.t|cannot|before|refus|not allowed|too early).{0,120}/i) || ['(no refusal words seen)'])[0] + ' ; still archived: ' + /Archived\s*·\s*\d/.test(t), 'RECORD', 'b4-01, b4-02')
  await openArchivedRow('Harrier').catch(() => {})
  await pickDate(T2)
  await X.pic(w, 'b4-03-ad-harrier-T2-picked')
  await p.locator('#accArRestore').click(); await sleep(1200)
  await X.pic(w, 'b4-04-ad-harrier-restored')
  say('B4 harrier restored note', await bodyTail(/Harrier (restored|is back)[^.]{0,80}/))
  await H.swap(w, 'ad9')
  await openArchivedRow('Heron')
  await pickDate(T2)
  await X.pic(w, 'b4-05-ad9-heron-T2-picked')
  await p.locator('#accArRestore').click(); await sleep(1200)
  await X.pic(w, 'b4-06-ad9-heron-restored')
  await lw()
  const rh = await G.rowClip(w, X, 'b4-Harrier', pids.Harrier, 'Harrier'); const re = await G.rowClip(w, X, 'b4-Heron', pids.Heron, 'Heron')
  const wh = await G.personWin(w, X, 'b4-Harrier', pids.Harrier); await p.keyboard.press('Escape'); await sleep(300)
  const we = await G.personWin(w, X, 'b4-Heron', pids.Heron); await p.keyboard.press('Escape')
  say('B4 H', G.sig(rh)); say('B4 E', G.sig(re))
  row('W1-B4', 'desktop', 'both restored with post-in T+2; war rows T-4..T+9', 'same for both: away T..T+1, counted again from T+2', 'Harrier: ' + G.sig(rh) + ' ; OIL ' + oilOf(wh) + ' ;; Heron: ' + G.sig(re) + ' ; OIL ' + oilOf(we), G.sig(rh) === G.sig(re) ? 'PASS' : 'FAIL', 'b4-Harrier-row.png vs b4-Heron-row.png')
})

if (ONLY.includes('B5')) await step('B5', async () => {
  await H.swap(w, 'ad')
  await admArchive('Gannet'); await X.pic(w, 'b5-01-gannet-archived')
  await openArchivedRow('Gannet')
  await p.locator('#accArCs').fill('GannetX'); await sleep(500)
  const lab = (await p.locator('#accArRestore').textContent()).trim()
  await X.pic(w, 'b5-02-gannetx-typed')
  await pickDate(T2)
  await X.pic(w, 'b5-03-gannetx-T2')
  await p.locator('#accArRestore').click(); await sleep(1200)
  await X.pic(w, 'b5-04-gannetx-restored')
  await H.swap(w, 'ad9')
  await lw()
  const nm = await U.pidOf(p, 'GannetX'); say('B5 GannetX pid', nm, 'Gannet pid', pids.Gannet)
  const r = await G.rowClip(w, X, 'b5-GannetX', pids.Gannet, 'GannetX')
  await H.usersPage(w); await p.locator(H.FIND).fill('GannetX'); await sleep(700)
  await X.pic(w, 'b5-05-users-gannetx')
  const ut = await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').match(/GannetX[^.]{0,80}/)?.[0] || '(not on Users)')
  row('W1-B5', 'desktop', 'ad archives Gannet, types GannetX in the Archived fold row, button, T+2, Restore as…; ad9 views', 'button "Restore as GannetX"; war row under GannetX counted from T+2; Users shows GannetX active', 'button read: ' + lab + ' ; war row: ' + G.sig(r) + ' ; GannetX pid: ' + nm + ' ; Users: ' + ut, lab === 'Restore as GannetX' && nm ? 'RECORD' : 'FAIL', 'b5-02, b5-GannetX-row.png, b5-05')
})

if (ONLY.includes('B6')) await step('B6', async () => {
  await H.swap(w, 'ad')
  await admArchive('Condor')
  await openArchivedRow('Condor')
  await p.locator('#accArCs').fill('CondorZ'); await sleep(500)
  const labs = (await H.controls(p, pids.Condor)).map(c => c.label).join(' | ')
  await X.pic(w, 'b6-01-condorz-typed')
  const sv = p.getByRole('button', { name: 'Save name' })
  say('B6 save name count', await sv.count(), 'controls', labs)
  await sv.first().click(); await sleep(1200)
  await X.pic(w, 'b6-02-after-save-name')
  await H.usersPage(w); await p.locator(H.FIND).fill('CondorZ'); await sleep(700)
  await X.pic(w, 'b6-03-users')
  const ut = await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').match(/(Archived|Condor)[^]{0,300}/)?.[0].slice(0, 300) || '')
  await H.swap(w, 'ad9')
  await lw()
  const r = await G.rowClip(w, X, 'b6-Condor', pids.Condor, 'CondorZ')
  row('W1-B6', 'desktop', 'ad archives Condor, types CondorZ, presses Save name', 'CondorZ stays in the Archived fold, sign-in dot unchanged, war row still away', 'controls: ' + labs + ' ; Users: ' + ut + ' ; war row: ' + G.sig(r), 'RECORD', 'b6-01, b6-02, b6-03, b6-Condor-row.png')
})
const histWords = async name => {
  await X.L.go(p, 'editsched'); await sleep(2000)
  await p.locator('#histBtn').click(); await sleep(1000)
  let out = ''
  for (const wk of ['Jul 13', 'Jul 06', 'Jul 20', 'Jul 27']) {
    if (wk !== 'Jul 13') { await p.keyboard.press('Escape'); await sleep(300); await p.getByRole('button', { name: wk }).first().click(); await sleep(1200); await p.locator('#histBtn').click(); await sleep(900) }
    await p.locator('.chgwin').getByText('All changes').first().click(); await sleep(900)
    await X.pic(w, name + '-' + wk.replace(' ', ''))
    const t = await p.evaluate(() => (document.querySelector('.chgwin')?.textContent || '').replace(/\s+/g, ' ').trim())
    out += '[' + wk + '] ' + t + ' '
  }
  await p.keyboard.press('Escape'); await sleep(400)
  return out
}
if (ONLY.includes('C')) await step('C', async () => {
  await H.swap(w, 'ad')
  await admArchive('Falcon')
  await openArchivedRow('Falcon')
  await p.locator('#accArCs').fill('FalconQ'); await sleep(400)
  await p.getByRole('button', { name: 'Save name' }).first().click(); await sleep(1200)
  await X.pic(w, 'c-01-ad-falconq-saved')
  const u0 = await undoState()
  const un = await p.locator('#undoBtn').first().click({ timeout: 3000 }).then(() => 'Undo pressed').catch(e => 'Undo refused: ' + e.message.split('\n')[0].slice(0, 60)); await sleep(1000)
  await X.pic(w, 'c-02-ad-after-undo')
  const n1 = (await U.bodyText(p)).match(/(Falcon|Undid|Undo)[^.]{0,60}/g)?.slice(0, 4).join(' | ')
  const re = await p.locator('#redoBtn').first().click({ timeout: 3000 }).then(() => 'Redo pressed').catch(e => 'Redo refused: ' + e.message.split('\n')[0].slice(0, 60)); await sleep(1000)
  await X.pic(w, 'c-03-ad-after-redo')
  const n2 = (await U.bodyText(p)).match(/(Falcon|Redid|Redo)[^.]{0,60}/g)?.slice(0, 4).join(' | ')
  say('C undo/redo', u0, un, n1, re, n2)
  const h142 = await histWords('c-04-ad-142-allchanges')
  row('W1-C', 'desktop', 'ad: archive Falcon, Save name FalconQ, Undo, Redo, then Edit Schedule → clock → All changes', 'no line about Falcon / FalconQ (nor Undo / Redo) in 142 history', 'undo: ' + u0 + ' ; ' + un + ' ; ' + n1 + ' ; ' + re + ' ; ' + n2 + ' ; 142 history window words: ' + h142.slice(0, 1400), /Falcon/i.test(h142) ? 'FAIL' : 'PASS', 'c-04-ad-142-allchanges.png')
  await H.swap(w, 'ad9')
  const h149 = await histWords('c-05-ad9-149-allchanges')
  row('W1-C', 'desktop', 'ad9: Edit Schedule → clock → All changes', 'the rename, its Undo and its Redo lines are there', '149 history window words: ' + h149.slice(0, 1400), /Falcon/i.test(h149) ? 'RECORD' : 'FAIL', 'c-05-ad9-149-allchanges.png')
})
await X.fin(w)
