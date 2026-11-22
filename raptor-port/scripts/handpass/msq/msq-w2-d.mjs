/* msq-w2-d v1 — W2: T6 (S1 on the phone) in a fresh phone world. usage: node scripts/handpass/msq/msq-w2-d.mjs */
process.env.MSQ_WHO = 'w2'
process.env.MSQ_RUN = 'd-p'
const X = await import('./msq-lib.mjs')
const U = await import('./msq-w1-util.mjs')
const { say, sleep, row } = X
say('msq-w2-d v1 phone')
const w = await X.open({ phone: true, user: 'ad9' })
const { page } = w
const swap = async u => { const r = await X.signOut(w); await X.login(page, u); return r }
const safe = async (label, fn) => { try { return await fn() } catch (e) { say('ERR', label, String(e.message).split('\n')[0]); return null } }
await X.L.go(page, 'editsched'); await sleep(1000)
const before = await U.groundNames(page, 2)
say('149 Wed15 ground before', JSON.stringify(before))
let ok = null
for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
  ok = await safe('add' + attempt, async () => {
    await X.W.board(w, 2); await sleep(600)
    await X.pic(w, `t6-01-board-try${attempt}`)
    await X.W.press(w, '[data-gradd="2"]', { scope: 'board' }); await sleep(700)
    const n = (await U.groundNames(page, 2)).length - 1
    await X.W.typeIn(w, `[data-bfld="gr:2.${n}.prog"]`, 'W2 PHONE')
    const id = await U.pidOf(page, 'Kestrel')
    const r = await X.W.seat(w, `[data-fill="g:2.${n}.+"]`, id)
    say('seat result', r, JSON.stringify(await U.groundFull(page, 2)))
    await X.pic(w, `t6-02-after-add-try${attempt}`)
    const g = await U.groundFull(page, 2)
    return g.some(s => s.startsWith('W2 PHONE')) ? g : null
  })
  if (!ok) { await safe('closeb', () => X.W.closeBoard(w)); await sleep(500) }
}
say('added', JSON.stringify(ok))
if (ok) { await X.W.closeBoard(w); await sleep(800) }
await X.L.go(page, 'editsched'); await sleep(800)
await X.pic(w, 't6-03-ad9-week-after-done')
const wk9 = await U.bodyText(page)
row('T6', 'phone', 'ad9 adds ground row "W2 PHONE" with Kestrel on Wed 15 Jul by taps, Done', 'row on 149 Wed 15', `ground: ${JSON.stringify(ok)}; week text has W2 PHONE: ${wk9.includes('W2 PHONE')}`, ok ? 'PASS' : 'BLOCKED', 't6-02-after-add-try*.png, t6-03-ad9-week-after-done.png')
if (ok) {
  await swap('ad'); await X.L.go(page, 'editsched'); await sleep(1000)
  await X.pic(w, 't6-04-ad-week')
  const wk = await U.bodyText(page)
  await X.W.board(w, 2); await sleep(700)
  await X.pic(w, 't6-05-ad-board-wed15')
  const bd = await U.bodyText(page)
  const gr = await U.groundNames(page, 2)
  await safe('closeb', () => X.W.closeBoard(w)); await sleep(600)
  await X.pic(w, 't6-06-ad-board-closed')
  row('T6', 'phone', 'ad (142) looks at Wed 15 Jul, week and board', 'no "W2 PHONE" on either', `week: ${wk.includes('W2 PHONE')}; board: ${bd.includes('W2 PHONE')}; 142 ground rows: ${JSON.stringify(gr)}`, !wk.includes('W2 PHONE') && !bd.includes('W2 PHONE') ? 'PASS' : 'FAIL', 't6-04-ad-week.png, t6-05-ad-board-wed15.png')
  await swap('ad9'); await X.L.go(page, 'editsched'); await sleep(1000)
  await X.pic(w, 't6-07-ad9-again')
  const g9 = await U.groundNames(page, 2)
  row('T6', 'phone', 'ad9 signs in again', 'W2 PHONE still on Wed 15', `ground: ${JSON.stringify(g9)}`, g9.includes('W2 PHONE') ? 'PASS' : 'FAIL', 't6-07-ad9-again.png')
}
await X.fin(w)
