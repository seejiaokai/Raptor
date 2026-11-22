/* msq-fr15-w2 v1 — W2: a moved filer is NOT told of a change whose every day is the other squadron's. FR15_PHONE=1 for the iPhone. */
process.env.FR15_SC = 'w2'
const L = await import('./msq-fr15-lib.mjs')
const { X, say, sleep, row, tapIt, openAt, putMoves, pidOf, fileLL, openInputs, openRow, bell, closeBell, notices, inputRows, size } = L
const P = L.phone ? 'phone' : 'desktop'
const pn = (s, what) => `${s}-${P}-${what}`
say('msq-fr15-w2 v1', size)
const w = await openAt('ad2')
const p = w.page
const safe = async (l, fn) => { try { return await fn() } catch (e) { say('ERR', l, String(e.message).split('\n')[0]); await X.pic(w, 'err-' + l).catch(() => {}); row(l, size, 'script step', 'completes', 'script error ' + String(e.message).split('\n')[0], 'OWED', 'err-' + l + '.png') } }
let bane, prowler
await safe('W2-1', async () => {
  await fileLL(w, 'Ranger', 'Thu 23 Jul 2026', 'w2 orig')
  await X.pic(w, pn('s1', 'filed'))
  bane = await pidOf(p, 'Ranger'); prowler = await pidOf(p, 'Hunter')
  const rows = await inputRows(p)
  row('W2-1', size, 'Hunter files Ranger LL 23 Jul', 'on the list', JSON.stringify(rows.filter(r => /Ranger/.test(r))), rows.some(r => /Ranger/.test(r) && /w2 orig/.test(r)) ? 'PASS' : 'FAIL', pn('s1', 'filed') + '.png')
})
await safe('W2-2', async () => {
  await putMoves(w, [{ pid: prowler, old: 'u142', to: 'u149', from: '2026-07-16' }, { pid: bane, old: 'u142', to: 'u149', from: '2026-07-25' }])
  await X.login(p, 'ad')
  await openInputs(w)
  await X.pic(w, pn('s2', 'saber-inputs'))
  const rows = await inputRows(p)
  row('W2-2', size, 'moves stored; Saber (master) opens Inputs', "Ranger's 23 Jul LL on 142's list", JSON.stringify(rows.filter(r => /Ranger/.test(r))), rows.some(r => /Ranger/.test(r) && /w2 orig/.test(r)) ? 'PASS' : 'FAIL', pn('s2', 'saber-inputs') + '.png')
  say('notices before', await notices(p))
})
await safe('W2-3', async () => {
  await openRow(w, ['Ranger', 'w2 orig'])
  await X.pic(w, pn('s3', 'row-open'))
  await p.selectOption('#inpEditPerson', { label: 'Outlaw' }); await sleep(500)
  await L.monthTo(p, /July 2026/)
  await L.pickDay(p, 'Mon 27 Jul 2026')
  await X.pic(w, pn('s3', 'outlaw-27jul'))
  const till = await p.evaluate(() => (document.querySelector('.inped-win')?.innerText || '').replace(/\s+/g, ' ').slice(-200))
  say('window tail', till)
  await tapIt(p.locator('#inpEditSave')); await sleep(110)
  await X.pic(w, pn('s3', 'save-press'))
  await sleep(1400)
  const nd = p.locator('button:visible', { hasText: /^(No document|Later|OK)$/ }).last()
  if (await nd.count()) { await tapIt(nd); await sleep(1200) }
  await X.pic(w, pn('s3', 'saved'))
  const rows = await inputRows(p)
  row('W2-3', size, 'Saber changes the leave to Outlaw (Casper) on Mon 27 Jul and saves', 'the list shows Outlaw on 27 Jul', JSON.stringify(rows.filter(r => /w2 orig|Outlaw|Ranger/.test(r))), rows.some(r => /Outlaw/.test(r) && /w2 orig/.test(r)) ? 'PASS' : 'FAIL', pn('s3', 'saved') + '.png')
  say('notices after', await notices(p))
})
const readBell = async (user, step) => {
  await X.signOut(w); await X.login(p, user)
  const b = await bell(w, pn(step, user + '-bell'))
  say(step, user, 'lines', JSON.stringify(b.lines))
  await closeBell(w)
  return b
}
await safe('W2-4', async () => {
  const b = await readBell('ad2', 's4')
  const bad = (b.lines || []).filter(l => /LL/.test(l) && /remark|changed|taken|added|moved|put/i.test(l) && !/^read/.test(l))
  row('W2-4', size, "Hunter's bell", 'NO line about the change', `badge ${JSON.stringify(b.badge)}; lines ${JSON.stringify(b.lines)}`, (b.lines || []).length === 0 || (b.lines || []).every(l => !/LL/.test(l)) ? 'PASS' : 'FAIL', pn('s4', 'ad2-bell') + '.png')
})
await safe('W2-5', async () => {
  const b = await readBell('outlaw', 's5')
  row('W2-5', size, "Casper's (Outlaw) bell", 'a line that he was put in the leave', `badge ${JSON.stringify(b.badge)}; lines ${JSON.stringify(b.lines)}`, (b.lines || []).some(l => /LL/.test(l) && /added|in it|put/i.test(l)) ? 'PASS' : 'FAIL', pn('s5', 'outlaw-bell') + '.png')
})
await safe('W2-6', async () => {
  const b = await readBell('us', 's6')
  row('W2-6', size, "Ranger's bell", 'a line that he was taken out', `badge ${JSON.stringify(b.badge)}; lines ${JSON.stringify(b.lines)}`, (b.lines || []).some(l => /LL/.test(l) && /removed|taken out|out of/i.test(l)) ? 'PASS' : 'FAIL', pn('s6', 'us-bell') + '.png')
})
await X.pic(w, pn('s9', 'whole-screen'))
await X.fin(w)
