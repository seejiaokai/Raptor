/* msq-fr15-w1 v1 — W1: a moved filer who is again an admin of the man's squadron is told (D2228). FR15_PHONE=1 for the iPhone. */
process.env.FR15_SC = 'w1'
const L = await import('./msq-fr15-lib.mjs')
const { X, say, sleep, row, tapIt, openAt, putMoves, pidOf, fileLL, openInputs, openRow, saveEdit, bell, closeBell, notices, inputRows, size } = L
const P = L.phone ? 'phone' : 'desktop'
const pn = (s, what) => `${s}-${P}-${what}`
say('msq-fr15-w1 v1', size)
const w = await openAt('ad2')
const p = w.page
const safe = async (l, fn) => { try { return await fn() } catch (e) { say('ERR', l, String(e.message).split('\n')[0]); await X.pic(w, 'err-' + l).catch(() => {}); row(l, size, 'script step', 'completes', 'script error ' + String(e.message).split('\n')[0], 'OWED', 'err-' + l + '.png') } }
let bane, prowler
await safe('W1-1', async () => {
  await fileLL(w, 'Ranger', 'Thu 23 Jul 2026', 'orig words')
  await X.pic(w, pn('s1', 'hunter-filed-ranger-LL'))
  const rows = await inputRows(p)
  const ok = rows.some(r => /Ranger/.test(r) && /23 Jul/.test(r) && /LL/.test(r))
  row('W1-1', size, 'Hunter (142 admin) files an LL for Ranger on Thu 23 Jul, remark "orig words"', 'the leave is on the Inputs list', `rows with Ranger: ${JSON.stringify(rows.filter(r => /Ranger/.test(r)))}`, ok ? 'PASS' : 'FAIL', pn('s1', 'hunter-filed-ranger-LL') + '.png')
  bane = await pidOf(p, 'Ranger'); prowler = await pidOf(p, 'Hunter')
  say('baseline notices (Hunter)', await notices(p))
})
await safe('W1-2', async () => {
  await putMoves(w, [{ pid: prowler, old: 'u142', to: 'u149', from: '2026-07-16' }, { pid: bane, old: 'u142', to: 'u149', from: '2026-07-16' }])
  await X.login(p, 'ad9')
  await openInputs(w)
  await X.pic(w, pn('s2', 'kestrel-inputs-list'))
  const rows = await inputRows(p)
  const has = rows.some(r => /Ranger/.test(r) && /23 Jul/.test(r) && /LL/.test(r))
  row('W1-2', size, 'both moved to 149 from 16 Jul (stored); Kestrel (149 admin) signs in and opens Inputs', "Ranger's 23 Jul LL is on 149's list", `rows with Ranger: ${JSON.stringify(rows.filter(r => /Ranger/.test(r)))}`, has ? 'PASS' : 'FAIL', pn('s2', 'kestrel-inputs-list') + '.png')
})
await safe('W1-3', async () => {
  await openRow(w, ['Ranger', 'LL'])
  await X.pic(w, pn('s3', 'kestrel-row-open'))
  await p.fill('#inpEditRmk', 'new words by Kestrel')
  await X.pic(w, pn('s3', 'kestrel-remark-typed'))
  await tapIt(p.locator('#inpEditSave')); await sleep(110)
  await X.pic(w, pn('s3', 'kestrel-save-press'))
  await sleep(1400)
  const nd = p.locator('button:visible', { hasText: /^(No document|Later|OK)$/ }).last()
  if (await nd.count()) { await tapIt(nd); await sleep(1200) }
  await X.pic(w, pn('s3', 'kestrel-saved'))
  const rows = await inputRows(p)
  const ok = rows.some(r => /Ranger/.test(r) && /new words by Kestrel/.test(r))
  row('W1-3', size, "Kestrel changes the leave's remark to 'new words by Kestrel' and Saves", 'the list shows the new words', `rows with Ranger: ${JSON.stringify(rows.filter(r => /Ranger/.test(r)))}`, ok ? 'PASS' : 'FAIL', pn('s3', 'kestrel-saved') + '.png')
})
const readBell = async (user, step) => {
  await X.signOut(w); await X.login(p, user)
  say(step, user, 'notices', await notices(p))
  const b = await bell(w, pn(step, user + '-bell'))
  say(step, user, 'badge', JSON.stringify(b.badge), 'lines', JSON.stringify(b.lines))
  return b
}
await safe('W1-4', async () => {
  const b = await readBell('ad2', 's4')
  const n = (b.lines || []).filter(l => /^NEW/.test(l) && /LL/.test(l) && /remark changed/i.test(l)).length
  const nAll = (b.lines || []).filter(l => /^NEW/.test(l)).length
  row('W1-4', size, "Hunter (149 admin, filer) signs in and opens the bell", 'exactly one new line, an LL remark change (the line names the leave by its type and day; Ranger is the leave\'s man per the notice record)', `badge ${JSON.stringify(b.badge)}; new lines ${nAll}; remark-change lines ${n}; lines ${JSON.stringify(b.lines)}`, n === 1 && nAll === 1 ? 'PASS' : 'FAIL', pn('s4', 'ad2-bell') + '.png')
  await closeBell(w)
})
await safe('W1-5', async () => {
  const b = await readBell('us', 's5')
  const n = (b.lines || []).filter(l => /^NEW/.test(l) && /LL/.test(l) && /remark/i.test(l)).length
  const nAll = (b.lines || []).filter(l => /^NEW/.test(l)).length
  row('W1-5', size, 'Ranger signs in and opens the bell', 'exactly one new line (his LL, remark changed)', `badge ${JSON.stringify(b.badge)}; new lines ${nAll}; matching ${n}; lines ${JSON.stringify(b.lines)}`, n === 1 && nAll === 1 ? 'PASS' : 'FAIL', pn('s5', 'us-bell') + '.png')
  await closeBell(w)
})
await X.pic(w, pn('s9', 'whole-screen'))
await X.fin(w)
